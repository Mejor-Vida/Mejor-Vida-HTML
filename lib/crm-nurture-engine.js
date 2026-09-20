/**
 * CRM Lead Nurture Engine — enrollment, task materialization, execution.
 */

const {
  DEFAULT_CRM_NURTURE_SETTINGS,
  STAGES_WITH_AUTO_NURTURE,
  resolveDailySummaryRecipients,
  resolveManualEnrollStage,
  resolveAutoEnrollStage,
  canManualEnroll,
  contactedEmailTemplateForAttempt,
  mergeCrmNurtureSettings,
} = require("./crm-nurture-defaults");
const { getCrmNurtureEmail, getCrmNurtureSms, contactHasQuoteRate } = require("./crm-nurture-templates");
const { logContactCommunication, htmlToPlain } = require("./contact-communications");
const { sendSms } = require("./sms-send");
const { normalizeStateCode } = require("./telemarketing-compliance");
const { gateAutomatedSms, processSmsComplianceQueue } = require("./sms-compliance-queue");
const { wrapResendEmailHtml, LOGO_EN } = require("./resend-email-template");
const { saveCanonicalLeadProfile } = require("../api/staff/_lead-profile");
const { canAutomateLead, rolloutSummary, isTestingRollout } = require("./crm-nurture-rollout");

const SETTINGS_CACHE_MS = 60000;
let settingsCache = { at: 0, config: null };

function sbHeaders(serviceKey, prefer) {
  const h = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

async function sbFetch(supabaseUrl, serviceKey, path, options = {}) {
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const r = await fetch(`${base}/rest/v1${path}`, {
    ...options,
    headers: { ...sbHeaders(serviceKey, options.prefer), ...(options.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : [];
}

function engineEnabled(settings, env) {
  if (env && env.CRM_NURTURE_ENGINE_ENABLED === "false") return false;
  if (settings && settings.feature_enabled === false) return false;
  return true;
}

async function loadSettings(supabaseUrl, serviceKey) {
  const now = Date.now();
  if (settingsCache.config && now - settingsCache.at < SETTINGS_CACHE_MS) {
    return settingsCache.config;
  }
  try {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      "/crm_nurture_settings?settings_key=eq.default&select=config&limit=1"
    );
    const cfg = mergeCrmNurtureSettings(
      rows && rows[0] && rows[0].config && typeof rows[0].config === "object" ? rows[0].config : null
    );
    if (cfg.new_sequence && cfg.new_sequence.day0) {
      delete cfg.new_sequence.day0.julie_notification;
    }
    settingsCache = { at: now, config: cfg };
    return cfg;
  } catch (e) {
    console.warn("[crm-nurture] loadSettings fallback:", (e && e.message) || e);
    return mergeCrmNurtureSettings(null);
  }
}

async function saveSettings(supabaseUrl, serviceKey, config, updatedBy) {
  const now = new Date().toISOString();
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/crm_nurture_settings?settings_key=eq.default&select=id&limit=1"
  );
  if (rows && rows[0] && rows[0].id) {
    await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_settings?id=eq.${rows[0].id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ config, updated_at: now, updated_by: updatedBy || null }),
    });
  } else {
    await sbFetch(supabaseUrl, serviceKey, "/crm_nurture_settings", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({ settings_key: "default", config, updated_by: updatedBy || null }),
    });
  }
  settingsCache = { at: 0, config: null };
  return config;
}

function ymdChicago(date, tz) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date || new Date());
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return t.toISOString().slice(0, 10);
}

/** Resolve local HH:MM on ymd in timezone to UTC ISO. */
function localTimeUtcIso(ymd, timeStr, tz) {
  const [hh, mm] = String(timeStr || "09:00").split(":").map((x) => parseInt(x, 10) || 0);
  const [y, mo, d] = ymd.split("-").map(Number);
  for (let utcHour = 0; utcHour < 24; utcHour++) {
    for (const utcMin of [0, 30]) {
      const candidate = new Date(Date.UTC(y, mo - 1, d, utcHour, utcMin, 0, 0));
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }).formatToParts(candidate);
      const get = (type) => parts.find((p) => p.type === type)?.value;
      const cYmd = `${get("year")}-${get("month")}-${get("day")}`;
      const cH = Number(get("hour"));
      const cM = Number(get("minute"));
      if (cYmd === ymd && cH === hh && cM === mm) return candidate.toISOString();
    }
  }
  return new Date(Date.UTC(y, mo - 1, d, hh + 6, mm, 0)).toISOString();
}

function dueFromEnrolled(enrolledAt, dayOffset, spec, tz) {
  const base = new Date(enrolledAt);
  const dayYmd = addDaysYmd(ymdChicago(base, tz), dayOffset);
  if (spec.offset_minutes != null) {
    return new Date(base.getTime() + Number(spec.offset_minutes) * 60000).toISOString();
  }
  if (spec.time) return localTimeUtcIso(dayYmd, spec.time, tz);
  return base.toISOString();
}

function buildNewTasks(enrollment, settings) {
  const tz = settings.timezone || "America/Chicago";
  const enrolledAt = enrollment.enrolled_at;
  const seq = settings.new_sequence || {};
  const tasks = [];

  function push(type, dayOffset, spec, extra) {
    if (!spec) return;
    tasks.push({
      task_type: type,
      due_at: dueFromEnrolled(enrolledAt, dayOffset, spec, tz),
      payload: Object.assign({}, extra || {}, {
        template: spec.template,
        attempt: spec.attempt,
        to_stage: spec.to,
        day: dayOffset,
      }),
    });
  }

  function pushCalls(dayOffset, calls) {
    (calls || []).forEach((c) => push("call", dayOffset, c, { attempt: c.attempt }));
  }

  const d0 = seq.day0 || {};
  push("email", 0, d0.welcome_email, { template: d0.welcome_email?.template });
  push("sms", 0, d0.welcome_sms, { template: d0.welcome_sms?.template });
  pushCalls(0, d0.calls);

  const d1 = seq.day1 || {};
  pushCalls(1, d1.calls);

  const d2 = seq.day2 || {};
  pushCalls(2, d2.calls);
  push("email", 2, d2.email, { template: d2.email?.template });
  pushCalls(2, d2.calls_pm);
  push("sms", 2, d2.sms, { template: d2.sms?.template });

  const d3 = seq.day3 || {};
  pushCalls(3, d3.calls);
  if (d3.stage_transition) {
    push("stage_transition", 3, d3.stage_transition, { to_stage: d3.stage_transition.to });
  }

  return tasks;
}

function buildContactedTasks(enrollment, settings) {
  const tz = settings.timezone || "America/Chicago";
  const cs = settings.contacted_sequence || {};
  const enrolledAt = enrollment.enrolled_at;
  const emailDays = Number(cs.email_interval_days) || 30;
  const baseYmd = ymdChicago(new Date(enrolledAt), tz);
  const emailDue = localTimeUtcIso(addDaysYmd(baseYmd, emailDays), cs.email_time || "10:00", tz);
  return [
    {
      task_type: "email",
      due_at: emailDue,
      payload: {
        template: contactedEmailTemplateForAttempt(settings, 1),
        recurring: true,
        interval_days: emailDays,
        attempt: 1,
      },
    },
  ];
}

/** Resolve when the lead first entered the CRM (for backdated manual enroll). */
async function resolveCrmEntryDate(supabaseUrl, serviceKey, leadId, leadSourceTable) {
  try {
    const ul = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/unified_leads?id=eq.${encodeURIComponent(leadId)}&source_table=eq.${encodeURIComponent(
        leadSourceTable
      )}&select=created_at&limit=1`
    );
    if (ul && ul[0] && ul[0].created_at) return ul[0].created_at;
  } catch (e) {
    /* unified_leads may not include every row */
  }

  try {
    const prof = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/staff_lead_profiles?lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
        leadSourceTable
      )}&select=created_at,profile_data&limit=1`
    );
    if (prof && prof[0]) {
      const pd = prof[0].profile_data || {};
      if (pd.crm_entry_at) return pd.crm_entry_at;
      if (pd.intake_at) return pd.intake_at;
      if (prof[0].created_at) return prof[0].created_at;
    }
  } catch (e) {
    /* ignore */
  }

  const sourceTable = leadSourceTable === "contacts" ? "contacts" : leadSourceTable;
  try {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/${sourceTable}?id=eq.${encodeURIComponent(leadId)}&select=created_at&limit=1`
    );
    if (rows && rows[0] && rows[0].created_at) return rows[0].created_at;
  } catch (e) {
    /* ignore */
  }

  return new Date().toISOString();
}

function markBackdatedTasks(tasks, asOf) {
  const now = asOf instanceof Date ? asOf : new Date(asOf || Date.now());
  return (tasks || []).map((t) => {
    const due = new Date(t.due_at);
    if (due <= now) {
      return Object.assign({}, t, {
        status: "skipped",
        cancelled_reason: "backdated_past_due",
        completed_at: t.due_at,
      });
    }
    return Object.assign({}, t, { status: t.status || "pending" });
  });
}

/** Contacted recurring email tasks from phase start through now, plus next future email. */
function buildBackdatedContactedTasks(enrollment, settings, asOf) {
  const tz = settings.timezone || "America/Chicago";
  const cs = settings.contacted_sequence || {};
  const emailInterval = Number(cs.email_interval_days) || 30;
  const anchorIso = enrollment.contacted_phase_start || enrollment.enrolled_at;
  const enrolledAt = new Date(anchorIso);
  const now = asOf instanceof Date ? asOf : new Date(asOf || Date.now());
  const baseYmd = ymdChicago(enrolledAt, tz);
  const tasks = [];

  let emailAttempt = 1;
  let emailYmd = addDaysYmd(baseYmd, emailInterval);
  let emailDueMs = new Date(localTimeUtcIso(emailYmd, cs.email_time || "10:00", tz)).getTime();
  while (emailDueMs <= now.getTime()) {
    tasks.push({
      task_type: "email",
      due_at: new Date(emailDueMs).toISOString(),
      payload: {
        template: contactedEmailTemplateForAttempt(settings, emailAttempt),
        recurring: true,
        interval_days: emailInterval,
        attempt: emailAttempt,
      },
      status: "skipped",
      cancelled_reason: "backdated_past_due",
      completed_at: new Date(emailDueMs).toISOString(),
    });
    emailAttempt += 1;
    emailYmd = addDaysYmd(emailYmd, emailInterval);
    emailDueMs = new Date(localTimeUtcIso(emailYmd, cs.email_time || "10:00", tz)).getTime();
  }
  tasks.push({
    task_type: "email",
    due_at: new Date(emailDueMs).toISOString(),
    payload: {
      template: contactedEmailTemplateForAttempt(settings, emailAttempt),
      recurring: true,
      interval_days: emailInterval,
      attempt: emailAttempt,
    },
    status: "pending",
  });

  return tasks.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
}

/** Day-3 end (start of Contacted cadence) from CRM entry. */
function getContactedPhaseStartIso(enrolledAt, settings) {
  const tz = settings.timezone || "America/Chicago";
  const seq = settings.new_sequence || {};
  const d3 = seq.day3 || {};
  if (d3.stage_transition && d3.stage_transition.time) {
    const dayYmd = addDaysYmd(ymdChicago(new Date(enrolledAt), tz), 3);
    return localTimeUtcIso(dayYmd, d3.stage_transition.time, tz);
  }
  return new Date(new Date(enrolledAt).getTime() + 4 * 86400000).toISOString();
}

/** New sequence (missed) + Contacted recurring for backdated manual enroll. */
function buildFullBackdatedEnrollmentTasks(enrollment, settings, stage, asOf) {
  const now = asOf instanceof Date ? asOf : new Date(asOf || Date.now());
  let tasks = markBackdatedTasks(buildNewTasks(enrollment, settings), now);
  if (stage === "contacted") {
    const contactedStart = getContactedPhaseStartIso(enrollment.enrolled_at, settings);
    const contactedEnrollment = Object.assign({}, enrollment, {
      enrolled_at: contactedStart,
      contacted_phase_start: contactedStart,
    });
    tasks = tasks.concat(buildBackdatedContactedTasks(contactedEnrollment, settings, now));
  }
  return tasks.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
}

function taskTimelineKey(t) {
  return `${t.task_type}|${t.due_at}`;
}

function isContactedRecurringTask(t) {
  return !!(t && t.payload && t.payload.recurring);
}

function isNewPhaseTask(t) {
  if (!t) return false;
  if (t.task_type === "stage_transition") return true;
  if (isContactedRecurringTask(t)) return false;
  const day = t.payload && t.payload.day;
  if (day != null && Number(day) <= 3) return true;
  return !isContactedRecurringTask(t);
}

function overlayDbTask(synthetic, dbTasks) {
  const p = synthetic.payload || {};
  let db = dbTasks.find((d) => taskTimelineKey(d) === taskTimelineKey(synthetic));
  if (!db && isContactedRecurringTask(synthetic)) {
    db = dbTasks.find(
      (d) =>
        d.task_type === synthetic.task_type &&
        isContactedRecurringTask(d) &&
        Number((d.payload && d.payload.attempt) || 0) === Number(p.attempt || 0)
    );
  }
  if (!db && isNewPhaseTask(synthetic)) {
    db = dbTasks.find(
      (d) =>
        d.task_type === synthetic.task_type &&
        isNewPhaseTask(d) &&
        ((d.payload && d.payload.template) || null) === ((p.template || null)) &&
        ((d.payload && d.payload.attempt) || null) === ((p.attempt || null))
    );
  }
  if (!db) return synthetic;
  return Object.assign({}, synthetic, {
    id: db.id,
    status: db.status,
    completed_at: db.completed_at,
    cancelled_reason: db.cancelled_reason,
    error: db.error,
  });
}

/** Merge DB tasks with full backdated timeline (fills missing New-phase SMS/email/calls). */
function mergeEnrollmentTimeline(enrollment, dbTasks, settings, asOf) {
  if (!enrollment || !enrollment.enrolled_at) return dbTasks || [];
  const stage = String(enrollment.stage || "new").toLowerCase();
  const fakeEnroll = { enrolled_at: enrollment.enrolled_at };
  const now = asOf instanceof Date ? asOf : new Date(asOf || Date.now());

  let full;
  if (stage === "contacted") {
    full = buildFullBackdatedEnrollmentTasks(fakeEnroll, settings, "contacted", now);
  } else if (stage === "new") {
    full = markBackdatedTasks(buildNewTasks(fakeEnroll, settings), now);
  } else {
    return dbTasks || [];
  }

  return full.map((t) => overlayDbTask(t, dbTasks || []));
}

/**
 * Insert New-phase (and missing Contacted) tasks that were never stored — e.g. contacted-stage
 * enrollments before buildFullBackdatedEnrollmentTasks shipped. Uses enrollment.created_at as the
 * backdate cutoff so steps still due after enroll stay pending for the cron.
 */
async function materializeMissingEnrollmentTasks(supabaseUrl, serviceKey, enrollment, dbTasks, settings) {
  if (!enrollment || !enrollment.id || !enrollment.enrolled_at) {
    return { inserted: 0, reason: "no_enrollment" };
  }
  const stage = String(enrollment.stage || "new").toLowerCase();
  if (stage !== "new" && stage !== "contacted") {
    return { inserted: 0, reason: "skip_stage" };
  }

  const enrollClickedAt = new Date(enrollment.created_at || enrollment.enrolled_at);
  const fakeEnroll = { enrolled_at: enrollment.enrolled_at };
  let expected;
  if (stage === "contacted") {
    expected = buildFullBackdatedEnrollmentTasks(fakeEnroll, settings, "contacted", enrollClickedAt);
  } else {
    expected = markBackdatedTasks(buildNewTasks(fakeEnroll, settings), enrollClickedAt);
  }

  const missing = [];
  for (const synth of expected || []) {
    if (synth.payload && synth.payload.projected) continue;
    const overlaid = overlayDbTask(synth, dbTasks || []);
    if (overlaid.id) continue;
    if (isContactedRecurringTask(synth) && synth.task_type === "email") {
      const hasContactedEmail = (dbTasks || []).some(
        (d) => d.task_type === "email" && isContactedRecurringTask(d)
      );
      if (hasContactedEmail) continue;
    }
    missing.push(synth);
  }

  if (!missing.length) return { inserted: 0 };

  await insertTasks(supabaseUrl, serviceKey, enrollment.id, missing);
  return { inserted: missing.length, task_types: missing.map((t) => t.task_type) };
}

function countNewPhaseTasks(tasks) {
  return (tasks || []).filter(
    (t) => !isContactedRecurringTask(t) && t.task_type !== "stage_transition"
  ).length;
}

function nextPendingTask(tasks) {
  return (tasks || [])
    .filter((t) => String(t.status || "").toLowerCase() === "pending")
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))[0];
}

function sameDueAt(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return new Date(a).getTime() === new Date(b).getTime();
}

function expectedStoredTasks(enrollment, settings, crmEntry, asOf) {
  const stage = String(enrollment.stage || "new").toLowerCase();
  const fakeEnroll = { enrolled_at: crmEntry };
  const now = asOf instanceof Date ? asOf : new Date(asOf || Date.now());
  let tasks;
  if (stage === "contacted") {
    tasks = buildFullBackdatedEnrollmentTasks(fakeEnroll, settings, "contacted", now);
  } else if (stage === "new") {
    tasks = markBackdatedTasks(buildNewTasks(fakeEnroll, settings), now);
  } else {
    tasks = [];
  }
  return (tasks || []).filter((t) => !(t.payload && t.payload.projected));
}

async function syncProfileCrmEntryAt(supabaseUrl, serviceKey, leadId, leadSourceTable, crmEntry) {
  try {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/staff_lead_profiles?lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
        leadSourceTable
      )}&select=id,profile_data&limit=1`
    );
    if (!rows || !rows[0] || !rows[0].id) return;
    const pd = rows[0].profile_data && typeof rows[0].profile_data === "object" ? rows[0].profile_data : {};
    if (pd.crm_entry_at === crmEntry) return;
    await sbFetch(supabaseUrl, serviceKey, `/staff_lead_profiles?id=eq.${rows[0].id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        profile_data: Object.assign({}, pd, { crm_entry_at: crmEntry }),
        updated_at: new Date().toISOString(),
        updated_by: "crm_nurture_engine",
      }),
    });
  } catch (e) {
    console.warn("[crm-nurture] syncProfileCrmEntryAt:", (e && e.message) || e);
  }
}

/** True when enrolled_at or stored tasks don't match CRM-entry-based schedule. */
async function enrollmentPipelineNeedsRebuild(
  supabaseUrl,
  serviceKey,
  enrollment,
  dbTasks,
  settings,
  asOf
) {
  if (!enrollment || !enrollment.id) return { needs: false, reason: "no_enrollment" };
  const crmEntry = await resolveCrmEntryDate(
    supabaseUrl,
    serviceKey,
    enrollment.lead_id,
    enrollment.lead_source_table
  );
  if (enrollment.enrolled_at && enrollment.enrolled_at.slice(0, 10) !== crmEntry.slice(0, 10)) {
    return { needs: true, reason: "enrolled_at_mismatch", crm_entry: crmEntry };
  }

  const expected = expectedStoredTasks(enrollment, settings, crmEntry, asOf);
  if (String(enrollment.stage || "").toLowerCase() === "contacted") {
    if (countNewPhaseTasks(dbTasks) === 0 && countNewPhaseTasks(expected) > 0) {
      return { needs: true, reason: "missing_new_phase", crm_entry: crmEntry };
    }
  }

  const expNext = nextPendingTask(expected);
  const dbNext = nextPendingTask(dbTasks);
  if (!sameDueAt(expNext && expNext.due_at, dbNext && dbNext.due_at)) {
    return { needs: true, reason: "next_send_mismatch", crm_entry: crmEntry };
  }
  if (expected.length !== (dbTasks || []).length) {
    return { needs: true, reason: "task_count_mismatch", crm_entry: crmEntry };
  }
  return { needs: false, crm_entry: crmEntry };
}

/**
 * Re-anchor enrollment to CRM entry date and rebuild stored tasks.
 * Past New-phase steps are marked missed; next Contacted email is scheduled forward.
 * Does not execute/send — cron picks up only future-due pending tasks.
 */
async function rebuildEnrollmentPipelineFromCrmEntry(
  supabaseUrl,
  serviceKey,
  enrollment,
  settings,
  opts = {}
) {
  if (!enrollment || !enrollment.id) return { ok: false, reason: "no_enrollment" };
  const now = opts.now instanceof Date ? opts.now : new Date(opts.now || Date.now());
  const crmEntry =
    opts.crmEntry ||
    (await resolveCrmEntryDate(
      supabaseUrl,
      serviceKey,
      enrollment.lead_id,
      enrollment.lead_source_table
    ));
  const stage = String(enrollment.stage || "new").toLowerCase();
  if (stage !== "new" && stage !== "contacted") {
    return { ok: false, reason: "skip_stage", stage };
  }

  await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_enrollments?id=eq.${enrollment.id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ enrolled_at: crmEntry, updated_at: now.toISOString() }),
  });

  await syncProfileCrmEntryAt(
    supabaseUrl,
    serviceKey,
    enrollment.lead_id,
    enrollment.lead_source_table,
    crmEntry
  );

  await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_call_tasks?enrollment_id=eq.${enrollment.id}&status=eq.pending`,
    {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ status: "cancelled" }),
    }
  );

  await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_tasks?enrollment_id=eq.${enrollment.id}`, {
    method: "DELETE",
    prefer: "return=minimal",
  });

  const tasks = expectedStoredTasks(
    Object.assign({}, enrollment, { enrolled_at: crmEntry }),
    settings,
    crmEntry,
    now
  );
  await insertTasks(supabaseUrl, serviceKey, enrollment.id, tasks);

  const next = nextPendingTask(tasks);
  return {
    ok: true,
    crm_entry: crmEntry,
    task_count: tasks.length,
    next_send_at: next && next.due_at ? next.due_at : null,
    next_task_type: next && next.task_type ? next.task_type : null,
  };
}

/** Display-only upcoming Contacted cycles (not stored / not sent by cron). */
function projectFutureContactedTasks(tasks, settings, asOf, extraCycles) {
  const cycles = extraCycles == null ? 3 : Number(extraCycles) || 0;
  if (cycles <= 0) return [];

  const tz = settings.timezone || "America/Chicago";
  const cs = settings.contacted_sequence || {};
  const emailInterval = Number(cs.email_interval_days) || 30;
  const projected = [];

  function lastRecurring(type) {
    const rows = (tasks || [])
      .filter((t) => t.task_type === type && t.payload && t.payload.recurring)
      .sort((a, b) => new Date(b.due_at) - new Date(a.due_at));
    return rows[0] || null;
  }

  const lastEmail = lastRecurring("email");
  if (lastEmail) {
    let attempt = (Number(lastEmail.payload.attempt) || 1) + 1;
    let ymd = addDaysYmd(ymdChicago(new Date(lastEmail.due_at), tz), emailInterval);
    for (let i = 0; i < cycles; i++) {
      projected.push({
        task_type: "email",
        due_at: localTimeUtcIso(ymd, cs.email_time || "10:00", tz),
        status: "upcoming",
        payload: {
          template: contactedEmailTemplateForAttempt(settings, attempt),
          recurring: true,
          interval_days: emailInterval,
          attempt,
          projected: true,
        },
      });
      attempt += 1;
      ymd = addDaysYmd(ymd, emailInterval);
    }
  }

  return projected.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
}

const AUTO_ENROLL_BACKDATE_AFTER_MS = 30 * 60 * 1000;

function isArchivedProfileData(pd) {
  if (!pd || typeof pd !== "object") return false;
  return !!(
    pd.archived_at ||
    String(pd.status || "").toLowerCase() === "archived" ||
    String(pd.outreach_blocked_reason || "").toLowerCase() === "archived"
  );
}

async function loadProfileData(supabaseUrl, serviceKey, leadId, leadSourceTable) {
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/staff_lead_profiles?lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&select=profile_data&limit=1`
  );
  const pd = rows && rows[0] ? rows[0].profile_data : {};
  return pd && typeof pd === "object" ? pd : {};
}

async function leadIsArchived(supabaseUrl, serviceKey, leadId, leadSourceTable) {
  const pd = await loadProfileData(supabaseUrl, serviceKey, leadId, leadSourceTable);
  if (isArchivedProfileData(pd)) return true;
  try {
    const arch = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/crm_lead_archives?lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
        leadSourceTable
      )}&select=status&order=archived_at.desc&limit=1`
    );
    const status = arch && arch[0] ? String(arch[0].status || "archived").toLowerCase() : "";
    if (status && status !== "restored") return true;
  } catch (e) {
    /* archives table may be missing in older envs */
  }
  return false;
}

async function findActiveEnrollmentForLead(supabaseUrl, serviceKey, leadId, leadSourceTable) {
  if (!leadId || !leadSourceTable) return null;
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_nurture_enrollments?lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&status=in.(active,paused)&select=id,lead_id,lead_source_table,contact_id,stage,status&order=created_at.desc&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
}

async function findActiveEnrollmentsForContact(supabaseUrl, serviceKey, contactId) {
  if (!contactId) return [];
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_nurture_enrollments?contact_id=eq.${encodeURIComponent(
      contactId
    )}&status=in.(active,paused)&select=id,lead_id,lead_source_table,contact_id,stage,status,created_at&order=created_at.desc&limit=20`
  );
  return Array.isArray(rows) ? rows : [];
}

function shouldBackdateToCrmEntry(crmEntryIso, asOf) {
  if (!crmEntryIso) return false;
  const now = asOf instanceof Date ? asOf : new Date(asOf || Date.now());
  const entry = new Date(crmEntryIso);
  if (Number.isNaN(entry.getTime())) return false;
  return now.getTime() - entry.getTime() > AUTO_ENROLL_BACKDATE_AFTER_MS;
}

async function cancelActiveEnrollment(supabaseUrl, serviceKey, leadId, leadSourceTable, reason) {
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_nurture_enrollments?lead_id=eq.${leadId}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&status=in.(active,paused)&select=id`
  );
  const now = new Date().toISOString();
  for (const row of rows || []) {
    await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_enrollments?id=eq.${row.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        status: "cancelled",
        cancelled_reason: reason || "replaced",
        updated_at: now,
      }),
    });
    await sbFetch(
      supabaseUrl,
      serviceKey,
      `/crm_nurture_tasks?enrollment_id=eq.${row.id}&status=eq.pending`,
      {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ status: "cancelled", cancelled_reason: reason || "replaced" }),
      }
    );
    await sbFetch(
      supabaseUrl,
      serviceKey,
      `/crm_call_tasks?enrollment_id=eq.${row.id}&status=eq.pending`,
      {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ status: "cancelled" }),
      }
    );
  }
}

async function insertTasks(supabaseUrl, serviceKey, enrollmentId, tasks) {
  if (!tasks.length) return;
  const payload = tasks.map((t) => ({
    enrollment_id: enrollmentId,
    task_type: t.task_type,
    due_at: t.due_at,
    payload: t.payload || {},
    status: t.status || "pending",
    completed_at: t.completed_at || null,
    cancelled_reason: t.cancelled_reason || null,
  }));
  await sbFetch(supabaseUrl, serviceKey, "/crm_nurture_tasks", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify(payload),
  });
}

const WELCOME_CAPTURE_WAIT_MS = 2 * 60 * 60 * 1000;
const WELCOME_RETRY_MS = 5 * 60 * 1000;

function applyQuoteToContact(contact, row) {
  if (!contact || !row) return contact;
  const p = row.payload && typeof row.payload === "object" ? row.payload : {};
  contact.payload = Object.assign({}, p, contact.payload || {});
  const merged = contact.payload;
  if (!contact.quote_low) {
    contact.quote_low = merged.quoteLow || merged.quote_low || row.quote_low || "";
  }
  if (!contact.quote_high) {
    contact.quote_high = merged.quoteHigh || merged.quote_high || row.quote_high || "";
  }
  if (!contact.quote_anchor) {
    contact.quote_anchor = merged.quoteAnchor || merged.quote_anchor || "";
  }
  if (!contact.coverage) {
    contact.coverage = merged.coverageAmount || row.coverage || null;
  }
  return contact;
}

async function attachQuoteFields(supabaseUrl, serviceKey, contact, leadId, leadSourceTable) {
  if (!contact) return contact;
  if (leadSourceTable === "quote_lead_submissions" && leadId) {
    try {
      const rows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/quote_lead_submissions?id=eq.${encodeURIComponent(
          leadId
        )}&select=payload,coverage,quote_summary&limit=1`
      );
      if (rows && rows[0]) applyQuoteToContact(contact, rows[0]);
    } catch (e) {
      console.warn("[crm-nurture] attach quote fields", e && e.message ? e.message : e);
    }
  }
  if ((!contact.quote_low || !contact.quote_high) && contact.id) {
    try {
      const ls = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/lead_state?contact_id=eq.${encodeURIComponent(
          contact.id
        )}&select=quote_low,quote_high&limit=1`
      );
      if (ls && ls[0]) {
        if (!contact.quote_low && ls[0].quote_low) contact.quote_low = ls[0].quote_low;
        if (!contact.quote_high && ls[0].quote_high) contact.quote_high = ls[0].quote_high;
      }
    } catch (_) {
      /* lead_state is optional */
    }
  }
  return contact;
}

function stillInWelcomeCaptureWindow(enrollment) {
  const enrolledMs = new Date(
    (enrollment && (enrollment.enrolled_at || enrollment.created_at)) || 0
  ).getTime();
  if (!Number.isFinite(enrolledMs) || enrolledMs <= 0) return false;
  return Date.now() - enrolledMs < WELCOME_CAPTURE_WAIT_MS;
}

function deferWelcomeEmail(reason) {
  return {
    ok: true,
    deferred: true,
    reason,
    send_after: new Date(Date.now() + WELCOME_RETRY_MS).toISOString(),
    action: "email_deferred",
  };
}

async function fetchLeadContactRaw(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId) {
  if (contactId) {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/contacts?id=eq.${contactId}&select=id,first_name,last_name,phone,email,language,idioma,vcf_sent_at&limit=1`
    );
    if (rows && rows[0]) return rows[0];
  }
  const profiles = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/staff_lead_profiles?lead_id=eq.${leadId}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&select=profile_data&limit=1`
  );
  const pd = profiles && profiles[0] ? profiles[0].profile_data : {};
  const cid = pd && (pd.contacts_contact_id || pd.contact_id);
  if (cid) {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/contacts?id=eq.${cid}&select=id,first_name,last_name,phone,email,language,idioma,vcf_sent_at&limit=1`
    );
    if (rows && rows[0]) return rows[0];
  }
  if (leadSourceTable === "contacts") {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/contacts?id=eq.${leadId}&select=id,first_name,last_name,phone,email,language,idioma,vcf_sent_at&limit=1`
    );
    if (rows && rows[0]) return rows[0];
  }
  if (leadSourceTable === "manychat_leads") {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/manychat_leads?id=eq.${leadId}&select=id,first_name,last_name,phone,email,language&limit=1`
    );
    if (rows && rows[0]) {
      return {
        id: contactId || null,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        phone: rows[0].phone,
        email: rows[0].email,
        language: rows[0].language,
      };
    }
  }
  if (leadSourceTable === "quote_lead_submissions") {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/quote_lead_submissions?id=eq.${leadId}&select=id,first_name,last_name,phone,email,lang&limit=1`
    );
    if (rows && rows[0]) {
      return {
        id: contactId || null,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        phone: rows[0].phone,
        email: rows[0].email,
        language: rows[0].lang,
      };
    }
  }
  if (leadSourceTable === "whatsapp_leads") {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/whatsapp_leads?id=eq.${leadId}&select=id,first_name,last_name,phone,email,language&limit=1`
    );
    if (rows && rows[0]) {
      return {
        id: contactId || null,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        phone: rows[0].phone,
        email: rows[0].email,
        language: rows[0].language,
      };
    }
  }
  return null;
}

async function fetchLeadContact(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId) {
  const contact = await fetchLeadContactRaw(
    supabaseUrl,
    serviceKey,
    leadId,
    leadSourceTable,
    contactId
  );
  return attachQuoteFields(supabaseUrl, serviceKey, contact, leadId, leadSourceTable);
}

async function resolveLeadHints(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId) {
  const contact = await fetchLeadContact(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId);
  const profiles = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/staff_lead_profiles?lead_id=eq.${leadId}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&select=profile_data&limit=1`
  );
  const pd = profiles && profiles[0] ? profiles[0].profile_data : {};
  const profile = pd && typeof pd === "object" ? pd : {};
  return {
    email: (contact && contact.email) || profile.email || "",
    first_name: (contact && contact.first_name) || profile.first_name || "",
    last_name: (contact && contact.last_name) || profile.last_name || "",
    display_name: profile.display_name || "",
    phone: (contact && contact.phone) || profile.phone || "",
  };
}

async function canAutomateLeadById(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId, settings) {
  const hints = await resolveLeadHints(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId);
  return canAutomateLead(hints, settings, process.env);
}

async function fetchSmsOptIn(supabaseUrl, serviceKey, leadId, leadSourceTable) {
  const profiles = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/staff_lead_profiles?lead_id=eq.${leadId}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&select=profile_data&limit=1`
  );
  const pd = profiles && profiles[0] ? profiles[0].profile_data : {};
  if (pd && (pd.archived_at || pd.status === "archived" || pd.outreach_blocked_reason === "archived")) {
    return false;
  }
  if (pd && pd.sms_opt_in === false) return false;

  const { isConsentExpired } = require("./crm-compliance");
  if (pd && pd.consent_expires_at && isConsentExpired(pd.consent_expires_at)) return false;

  if (pd && pd.sms_opt_in === true) return true;

  // Fall back to landing-page consent proof on quote_lead_submissions.
  if (leadSourceTable === "quote_lead_submissions") {
    try {
      const rows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/quote_lead_submissions?id=eq.${leadId}&select=consent_summary,consent_expires_at,payload&limit=1`
      );
      const row = rows && rows[0];
      if (!row) return false;
      if (row.consent_expires_at && isConsentExpired(row.consent_expires_at)) return false;
      const cs = row.consent_summary && typeof row.consent_summary === "object" ? row.consent_summary : {};
      if (cs.expiresAt && isConsentExpired(cs.expiresAt)) return false;
      if (cs.smsOptIn === true) return true;
      const mo = cs.marketingOptIn || (row.payload && row.payload.marketingOptIn);
      if (mo && mo.sms === true) return true;
    } catch (_) {
      return false;
    }
  }

  return false;
}

/** Resolve lead state for SMS curfew (profile → quote → default NE). */
async function resolveLeadStateCode(supabaseUrl, serviceKey, leadId, leadSourceTable) {
  const profiles = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/staff_lead_profiles?lead_id=eq.${leadId}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&select=profile_data&limit=1`
  );
  const pd = profiles && profiles[0] ? profiles[0].profile_data : {};
  const fromProfile = normalizeStateCode(
    (pd && (pd.state_code || pd.state || pd.quote_state)) || ""
  );
  if (fromProfile) return fromProfile;

  if (leadSourceTable === "quote_lead_submissions") {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/quote_lead_submissions?id=eq.${leadId}&select=state_code,payload&limit=1`
    );
    if (rows && rows[0]) {
      const p = rows[0].payload && typeof rows[0].payload === "object" ? rows[0].payload : {};
      const st = normalizeStateCode(rows[0].state_code || p.state || p.state_code || "");
      if (st) return st;
    }
  }

  if (leadSourceTable === "fex_email_quotes") {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/fex_email_quotes?id=eq.${leadId}&select=state_code&limit=1`
    );
    const st = normalizeStateCode(rows && rows[0] && rows[0].state_code);
    if (st) return st;
  }

  return "NE";
}

async function enrollLead(cfg, opts) {
  const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const leadId = opts.leadId;
  const leadSourceTable = opts.leadSourceTable;
  const manualEnroll = !!opts.manualEnroll;
  let stage = String(opts.stage || "new").trim().toLowerCase();
  const contactId = opts.contactId || null;

  if (!leadId || !leadSourceTable) return { ok: false, reason: "missing_lead" };

  const settings = await loadSettings(supabaseUrl, serviceKey);
  if (!engineEnabled(settings, process.env)) return { ok: false, reason: "disabled" };

  if (manualEnroll) {
    const resolved = resolveManualEnrollStage(stage);
    if (!resolved) return { ok: false, reason: "stage_no_manual_enroll", stage };
    stage = resolved;
  } else if (!STAGES_WITH_AUTO_NURTURE.has(stage)) {
    return { ok: false, reason: "stage_no_auto_nurture", stage };
  }

  // Testing rollout only blocks cron/auto enroll and sends. Staff Enroll on the
  // Clients list is an explicit action and must persist for every client.
  if (!manualEnroll) {
    const allowed = await canAutomateLeadById(
      supabaseUrl,
      serviceKey,
      leadId,
      leadSourceTable,
      contactId,
      settings
    );
    if (!allowed) {
      return {
        ok: false,
        reason: "rollout_testing_blocked",
        rollout: rolloutSummary(settings, process.env),
      };
    }
  }

  if (opts.skipIfAlreadyEnrolled) {
    const existingLead = await findActiveEnrollmentForLead(
      supabaseUrl,
      serviceKey,
      leadId,
      leadSourceTable
    );
    if (existingLead) {
      return {
        ok: true,
        skipped: true,
        reason: "already_enrolled",
        enrollment_id: existingLead.id,
      };
    }
  }

  if (opts.skipIfContactEnrolled && contactId) {
    const others = (await findActiveEnrollmentsForContact(supabaseUrl, serviceKey, contactId)).filter(
      (row) => String(row.lead_id) !== String(leadId)
    );
    const canonical = String(leadId) === String(contactId);
    for (const other of others) {
      const otherArchived = await leadIsArchived(
        supabaseUrl,
        serviceKey,
        other.lead_id,
        other.lead_source_table
      );
      const otherCanonical = String(other.lead_id) === String(contactId);
      if (otherArchived || (canonical && !otherCanonical)) {
        await cancelActiveEnrollment(
          supabaseUrl,
          serviceKey,
          other.lead_id,
          other.lead_source_table,
          "duplicate_contact_enrollment"
        );
        continue;
      }
      return {
        ok: true,
        skipped: true,
        reason: "contact_already_enrolled",
        enrollment_id: other.id,
      };
    }
  }

  await cancelActiveEnrollment(supabaseUrl, serviceKey, leadId, leadSourceTable, "re_enroll");

  const manualBackdate = !!opts.backdateToCrmEntry;
  let enrolledAt = opts.enrolledAt || null;
  if (manualBackdate && !enrolledAt) {
    enrolledAt = await resolveCrmEntryDate(supabaseUrl, serviceKey, leadId, leadSourceTable);
  }
  if (!enrolledAt) enrolledAt = new Date().toISOString();

  const inserted = await sbFetch(supabaseUrl, serviceKey, "/crm_nurture_enrollments", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify([
      {
        lead_id: leadId,
        lead_source_table: leadSourceTable,
        contact_id: contactId,
        stage,
        enrolled_at: enrolledAt,
        status: "active",
        sequence_version: "v1",
      },
    ]),
  });
  const enrollment = Array.isArray(inserted) ? inserted[0] : inserted;
  if (!enrollment || !enrollment.id) return { ok: false, reason: "insert_failed" };

  const enrollmentForTasks = Object.assign({}, enrollment, { enrolled_at: enrolledAt });
  const asOf = new Date();
  let tasks;
  if (stage === "new") {
    tasks = buildNewTasks(enrollmentForTasks, settings);
    if (manualBackdate) tasks = markBackdatedTasks(tasks, asOf);
  } else if (manualBackdate) {
    tasks = buildFullBackdatedEnrollmentTasks(enrollmentForTasks, settings, stage, asOf);
  } else {
    tasks = buildContactedTasks(enrollmentForTasks, settings);
  }
  const tasksToInsert = tasks.filter((t) => !(t.payload && t.payload.projected));
  await insertTasks(supabaseUrl, serviceKey, enrollment.id, tasksToInsert);

  return {
    ok: true,
    enrollment_id: enrollment.id,
    tasks: tasksToInsert.length,
    enrolled_at: enrolledAt,
    backdated: manualBackdate,
  };
}

async function onStageChange(cfg, opts) {
  const { leadId, leadSourceTable, oldStage, newStage, contactId, actor } = opts;
  const ns = String(newStage || "").trim().toLowerCase();
  const os = String(oldStage || "").trim().toLowerCase();
  if (ns === os) return { ok: true, skipped: true };

  const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  await cancelActiveEnrollment(
    supabaseUrl,
    serviceKey,
    leadId,
    leadSourceTable,
    `stage_change:${os}->${ns}`
  );

  if (STAGES_WITH_AUTO_NURTURE.has(ns) && isAutoEnrollEnabled(process.env)) {
    return enrollLead(cfg, { leadId, leadSourceTable, stage: ns, contactId, actor });
  }
  return { ok: true, cancelled: true, newStage: ns };
}

async function sendResendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("missing RESEND_API_KEY");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>",
      to,
      subject,
      html,
    }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(`Resend: ${JSON.stringify(json)}`);
  return json;
}

async function executeTask(supabaseUrl, serviceKey, task, enrollment, settings, dryRun) {
  const contact = await fetchLeadContact(
    supabaseUrl,
    serviceKey,
    enrollment.lead_id,
    enrollment.lead_source_table,
    enrollment.contact_id
  );
  const payload = task.payload || {};
  const result = { task_id: task.id, type: task.task_type, ok: true };

  if (task.task_type === "call") {
    if (!dryRun) {
      const callRow = {
        lead_id: enrollment.lead_id,
        lead_source_table: enrollment.lead_source_table,
        contact_id: enrollment.contact_id || (contact && contact.id) || null,
        enrollment_id: enrollment.id,
        nurture_task_id: task.id,
        stage: enrollment.stage,
        attempt_number: Number(payload.attempt) || 1,
        due_at: task.due_at,
        status: "pending",
      };
      await sbFetch(supabaseUrl, serviceKey, "/crm_call_tasks", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify(callRow),
      });
    }
    result.action = "call_task_created";
    return result;
  }

  if (task.task_type === "email") {
    if (!contact || !contact.email) {
      if (stillInWelcomeCaptureWindow(enrollment)) {
        return deferWelcomeEmail("no_email");
      }
      result.ok = false;
      result.reason = "no_email";
      return result;
    }
    let templateKey = payload.template;
    if (payload.recurring && String(enrollment.stage || "").toLowerCase() === "contacted") {
      templateKey = contactedEmailTemplateForAttempt(settings, payload.attempt || 1);
    }
    if (
      String(templateKey || "") === "welcome" &&
      String(enrollment.lead_source_table || "") === "quote_lead_submissions" &&
      !contactHasQuoteRate(contact) &&
      stillInWelcomeCaptureWindow(enrollment)
    ) {
      return deferWelcomeEmail("waiting_for_quote");
    }
    const tpl = getCrmNurtureEmail(templateKey, contact, settings);
    if (!tpl) {
      result.ok = false;
      result.reason = "missing_template";
      return result;
    }
    if (!dryRun) {
      const sent = await sendResendEmail({ to: contact.email, subject: tpl.subject, html: tpl.html });
      result.provider_id = sent && sent.id;
      if (contact.id) {
        await logContactCommunication(supabaseUrl, serviceKey, {
          contactId: contact.id,
          direction: "outbound",
          channel: "email",
          subject: tpl.subject,
          body: htmlToPlain(tpl.html),
          meta: { nurture: true, template: templateKey },
        });
      }
    }
    result.action = "email_sent";
    return result;
  }

  if (task.task_type === "sms") {
    const optIn = await fetchSmsOptIn(supabaseUrl, serviceKey, enrollment.lead_id, enrollment.lead_source_table);
    if (!optIn) {
      result.ok = true;
      result.skipped = true;
      result.reason = "sms_not_opted_in";
      return result;
    }
    if (!contact || !contact.phone) {
      result.ok = false;
      result.reason = "no_phone";
      return result;
    }
    const body = getCrmNurtureSms(payload.template, contact, settings);
    if (!body) {
      result.ok = false;
      result.reason = "missing_template";
      return result;
    }

    const stateCode = await resolveLeadStateCode(
      supabaseUrl,
      serviceKey,
      enrollment.lead_id,
      enrollment.lead_source_table
    );
    const gate = await gateAutomatedSms({
      supabaseUrl,
      serviceKey,
      phone: contact.phone,
      body,
      stateCode,
      settings,
      leadId: enrollment.lead_id,
      leadSourceTable: enrollment.lead_source_table,
      contactId: contact.id || enrollment.contact_id || null,
      enrollmentId: enrollment.id,
      nurtureTaskId: task.id,
      source: "crm_nurture",
      meta: { template: payload.template },
      dryRun,
      // Reschedule nurture due_at only — avoid double-send with queue flush.
      skipQueue: true,
    });
    if (gate.deferred) {
      result.ok = true;
      result.deferred = true;
      result.reason = gate.reason || "compliance_curfew";
      result.send_after = gate.sendAfter;
      result.action = "sms_deferred_compliance";
      result.queue_id = gate.queueId || null;
      return result;
    }

    if (!dryRun) {
      const sms = await sendSms({ to: contact.phone, body });
      result.provider_id = sms && sms.id;
      if (contact.id) {
        await logContactCommunication(supabaseUrl, serviceKey, {
          contactId: contact.id,
          direction: "outbound",
          channel: "sms",
          body,
          meta: { nurture: true, template: payload.template },
        });
      }
    }
    result.action = "sms_sent";
    return result;
  }

  if (task.task_type === "notification") {
    const tpl = getCrmNurtureEmail(payload.template || "new_lead_notify", contact || {});
    const recipient = (settings.daily_summary && settings.daily_summary.recipient) || "julie@mejorvidainsurance.com";
    if (!dryRun && tpl) {
      await sendResendEmail({ to: recipient, subject: tpl.subject, html: tpl.html });
    }
    result.action = "notification_sent";
    return result;
  }

  if (task.task_type === "stage_transition") {
    const toStage = payload.to_stage || "contacted";
    if (!dryRun) {
      const cfg = { supabaseUrl, serviceKey };
      await saveCanonicalLeadProfile(cfg, enrollment.lead_id, enrollment.lead_source_table, {
        pipeline_stage: toStage,
      }, "crm_nurture_engine");
      await onStageChange(cfg, {
        leadId: enrollment.lead_id,
        leadSourceTable: enrollment.lead_source_table,
        oldStage: enrollment.stage,
        newStage: toStage,
        contactId: enrollment.contact_id,
      });
      await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_enrollments?id=eq.${enrollment.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ status: "completed", completed_at: new Date().toISOString() }),
      });
    }
    result.action = "stage_transition";
    return result;
  }

  result.ok = false;
  result.reason = "unknown_task_type";
  return result;
}

async function scheduleNextContactedTask(supabaseUrl, serviceKey, task, enrollment, settings) {
  const payload = task.payload || {};
  if (!payload.recurring) return;
  if (task.task_type === "call") return;
  const intervalDays = Number(payload.interval_days) || 14;
  const tz = settings.timezone || "America/Chicago";
  const nextDue = new Date(new Date(task.due_at).getTime() + intervalDays * 86400000).toISOString();
  const nextAttempt = (Number(payload.attempt) || 1) + 1;
  const nextPayload = Object.assign({}, payload, {
    attempt: nextAttempt,
    template: contactedEmailTemplateForAttempt(settings, nextAttempt),
  });
  await sbFetch(supabaseUrl, serviceKey, "/crm_nurture_tasks", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      enrollment_id: enrollment.id,
      task_type: task.task_type,
      due_at: nextDue,
      payload: nextPayload,
      status: "pending",
    }),
  });
}

async function flushWelcomeAfterQuote(cfg, leadId, leadSourceTable) {
  const supabaseUrl = (cfg && cfg.supabaseUrl) || process.env.SUPABASE_URL;
  const serviceKey = (cfg && cfg.serviceKey) || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!leadId || !leadSourceTable) return { ok: false, reason: "missing_lead" };
  const enrollments = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_nurture_enrollments?lead_id=eq.${encodeURIComponent(
      leadId
    )}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&status=eq.active&select=id&limit=5`
  );
  if (!enrollments || !enrollments[0]) return { ok: true, processed: 0, reason: "no_enrollment" };
  const nowIso = new Date().toISOString();
  const results = [];
  for (const enr of enrollments) {
    try {
      await sbFetch(
        supabaseUrl,
        serviceKey,
        `/crm_nurture_tasks?enrollment_id=eq.${enr.id}&status=eq.pending&task_type=eq.email&payload->>template=eq.welcome`,
        {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ due_at: nowIso }),
        }
      );
    } catch (e) {
      console.warn("[crm-nurture] bump welcome due_at", e && e.message ? e.message : e);
    }
    results.push(
      await processDueTasks({
        cfg: { supabaseUrl, serviceKey },
        enrollmentId: enr.id,
        now: new Date(nowIso),
      })
    );
  }
  return { ok: true, results };
}

async function processDueTasks(opts = {}) {
  const supabaseUrl = (opts.cfg && opts.cfg.supabaseUrl) || process.env.SUPABASE_URL;
  const serviceKey = (opts.cfg && opts.cfg.serviceKey) || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const now = opts.now || new Date();
  const dryRun = !!opts.dryRun || process.env.CRM_NURTURE_DRY_RUN === "true";
  const settings = await loadSettings(supabaseUrl, serviceKey);

  if (!engineEnabled(settings, process.env)) {
    return { ok: true, processed: 0, reason: "disabled" };
  }

  let taskQuery = `/crm_nurture_tasks?status=eq.pending&due_at=lte.${encodeURIComponent(
    now.toISOString()
  )}&select=id,enrollment_id,task_type,due_at,payload&order=due_at.asc&limit=100`;
  if (opts.enrollmentId) {
    taskQuery = `/crm_nurture_tasks?status=eq.pending&enrollment_id=eq.${encodeURIComponent(
      opts.enrollmentId
    )}&due_at=lte.${encodeURIComponent(
      now.toISOString()
    )}&select=id,enrollment_id,task_type,due_at,payload&order=due_at.asc&limit=20`;
  }

  const dueTasks = await sbFetch(supabaseUrl, serviceKey, taskQuery);

  const enrollmentIds = [...new Set((dueTasks || []).map((t) => t.enrollment_id))];
  const enrollments = {};
  for (const eid of enrollmentIds) {
    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/crm_nurture_enrollments?id=eq.${eid}&status=eq.active&select=*&limit=1`
    );
    if (rows && rows[0]) enrollments[eid] = rows[0];
  }

  const results = [];
  for (const task of dueTasks || []) {
    const enrollment = enrollments[task.enrollment_id];
    if (!enrollment) {
      await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_tasks?id=eq.${task.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ status: "cancelled", cancelled_reason: "no_active_enrollment" }),
      });
      continue;
    }

    const allowed = await canAutomateLeadById(
      supabaseUrl,
      serviceKey,
      enrollment.lead_id,
      enrollment.lead_source_table,
      enrollment.contact_id,
      settings
    );
    if (!allowed) {
      if (!dryRun) {
        await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_tasks?id=eq.${task.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({
            status: "skipped",
            cancelled_reason: "rollout_testing",
            completed_at: new Date().toISOString(),
          }),
        });
      }
      results.push({ task_id: task.id, skipped: true, reason: "rollout_testing" });
      continue;
    }

    if (!dryRun) {
      await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_tasks?id=eq.${task.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ status: "processing" }),
      });
    }

    let execResult;
    try {
      execResult = await executeTask(supabaseUrl, serviceKey, task, enrollment, settings, dryRun);
    } catch (e) {
      execResult = { ok: false, error: (e && e.message) || String(e) };
    }

    if (execResult.deferred && execResult.send_after) {
      if (!dryRun) {
        await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_tasks?id=eq.${task.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({
            status: "pending",
            due_at: execResult.send_after,
            error: execResult.reason || "compliance_deferred",
          }),
        });
      }
      results.push(execResult);
      continue;
    }

    const finalStatus = execResult.skipped
      ? "skipped"
      : execResult.ok
        ? "completed"
        : "failed";

    if (!dryRun) {
      await sbFetch(supabaseUrl, serviceKey, `/crm_nurture_tasks?id=eq.${task.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({
          status: finalStatus,
          completed_at: new Date().toISOString(),
          error: execResult.error || execResult.reason || null,
        }),
      });
      if (execResult.ok && enrollment.stage === "contacted" && (task.payload || {}).recurring) {
        await scheduleNextContactedTask(supabaseUrl, serviceKey, task, enrollment, settings);
      }
    }
    results.push(execResult);
  }

  let complianceQueue = { processed: 0 };
  try {
    complianceQueue = await processSmsComplianceQueue({
      cfg: { supabaseUrl, serviceKey },
      now,
      dryRun,
      settings,
    });
  } catch (e) {
    complianceQueue = { ok: false, error: (e && e.message) || String(e) };
  }

  return {
    ok: true,
    processed: results.length,
    results,
    dry_run: dryRun,
    compliance_queue: complianceQueue,
  };
}

function isAutoEnrollEnabled(env) {
  const raw = String((env || process.env).CRM_NURTURE_AUTO_ENROLL || "")
    .trim()
    .toLowerCase();
  return raw === "true" || raw === "1";
}

async function maybeEnrollCrmLead(cfg, opts) {
  return autoEnrollCrmLead(cfg, opts);
}

/**
 * Enroll a New/Contacted CRM lead without a staff click.
 * Paused unless CRM_NURTURE_AUTO_ENROLL=true. Use the Active Feed Enroll button
 * or Pipeline “Start nurture sequence” instead.
 */
async function autoEnrollCrmLead(cfg, opts) {
  opts = opts || {};
  const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const leadId = opts.leadId;
  const leadSourceTable = opts.leadSourceTable;
  if (!leadId || !leadSourceTable) return { ok: false, reason: "missing_lead" };
  if (!isAutoEnrollEnabled(process.env)) return { ok: false, reason: "manual_only" };
  if (process.env.CRM_NURTURE_ENGINE_ENABLED === "false") return { ok: false, reason: "disabled" };

  if (await leadIsArchived(supabaseUrl, serviceKey, leadId, leadSourceTable)) {
    return { ok: false, reason: "archived" };
  }

  const pd = await loadProfileData(supabaseUrl, serviceKey, leadId, leadSourceTable);
  if (pd.email_opt_out === true) return { ok: false, reason: "opted_out" };

  const profileStage = String((pd && pd.pipeline_stage) || opts.stage || "new")
    .trim()
    .toLowerCase();
  let enrollStage = resolveAutoEnrollStage(profileStage) || resolveAutoEnrollStage(opts.stage);
  if (!enrollStage) return { ok: false, reason: "skip_stage", stage: profileStage };

  const contactId = opts.contactId || pd.contacts_contact_id || pd.contact_id || null;
  const crmEntry =
    opts.enrolledAt ||
    (await resolveCrmEntryDate(supabaseUrl, serviceKey, leadId, leadSourceTable));
  const backdate = shouldBackdateToCrmEntry(crmEntry, opts.now);
  const nowMs = (opts.now instanceof Date ? opts.now : new Date(opts.now || Date.now())).getTime();
  const entryMs = crmEntry ? new Date(crmEntry).getTime() : NaN;
  // New sequence is days 0–3. Older New cards skip chase calls and join Contacted.
  if (enrollStage === "new" && Number.isFinite(entryMs) && nowMs - entryMs > 4 * 24 * 60 * 60 * 1000) {
    enrollStage = "contacted";
  }

  return enrollLead(cfg, {
    leadId,
    leadSourceTable,
    stage: enrollStage,
    contactId,
    enrolledAt: backdate ? crmEntry : undefined,
    backdateToCrmEntry: backdate,
    skipIfAlreadyEnrolled: true,
    skipIfContactEnrolled: true,
    actor: opts.actor || "auto_enroll",
  });
}

/** Save a New-stage staff profile, then enroll. Used at WhatsApp/website capture. */
async function autoEnrollCaptureLead(cfg, opts) {
  opts = opts || {};
  try {
    if (!opts.leadId || !opts.leadSourceTable) return { ok: false, reason: "missing_lead" };
    const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
    const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const pd = await loadProfileData(supabaseUrl, serviceKey, opts.leadId, opts.leadSourceTable);
    const existingStage = String((pd && pd.pipeline_stage) || "").trim().toLowerCase();
    if (existingStage && !resolveAutoEnrollStage(existingStage)) {
      return { ok: false, reason: "skip_stage", stage: existingStage };
    }
    const stage = existingStage || opts.stage || "new";
    const patch = { pipeline_stage: stage };
    if (opts.contactId) {
      patch.contacts_contact_id = String(opts.contactId);
      patch.contact_id = String(opts.contactId);
    }
    await saveCanonicalLeadProfile(
      cfg,
      opts.leadId,
      opts.leadSourceTable,
      patch,
      opts.actor || "auto_enroll"
    );
    return await autoEnrollCrmLead(cfg, Object.assign({}, opts, { stage }));
  } catch (e) {
    console.error("[crm-nurture] capture auto-enroll", e && e.message ? e.message : e);
    return { ok: false, reason: "exception", error: (e && e.message) || String(e) };
  }
}

function pickCanonicalEnrollment(rows, contactId) {
  const list = Array.isArray(rows) ? rows : [];
  const cid = String(contactId || "");
  return (
    list.find((r) => String(r.lead_id) === cid && r.lead_source_table === "contacts") ||
    list.find((r) => String(r.lead_id) === cid) ||
    list[0] ||
    null
  );
}

/** Keep one active sequence per contacts id; prefer the canonical contacts row. */
async function collapseDuplicateContactEnrollments(cfg) {
  const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/crm_nurture_enrollments?status=in.(active,paused)&select=id,lead_id,lead_source_table,contact_id,created_at&order=created_at.asc&limit=5000"
  );
  const byContact = new Map();
  for (const row of rows || []) {
    const cid = row.contact_id || (row.lead_source_table === "contacts" ? row.lead_id : null);
    if (!cid) continue;
    if (!byContact.has(cid)) byContact.set(cid, []);
    byContact.get(cid).push(row);
  }

  const cancelled = [];
  for (const [cid, list] of byContact.entries()) {
    if (list.length < 2) continue;
    const keep = pickCanonicalEnrollment(list, cid);
    if (!keep) continue;
    for (const other of list) {
      if (other.id === keep.id) continue;
      await cancelActiveEnrollment(
        supabaseUrl,
        serviceKey,
        other.lead_id,
        other.lead_source_table,
        "duplicate_contact_enrollment"
      );
      cancelled.push({
        lead_id: other.lead_id,
        lead_source_table: other.lead_source_table,
        kept_lead_id: keep.lead_id,
      });
    }
  }
  return { ok: true, cancelled: cancelled.length, results: cancelled };
}

/** WhatsApp / website leads that never got a staff_lead_profile (no CRM open yet). */
async function collectUnprofiledAutoEnrollCandidates(supabaseUrl, serviceKey, enrolledLeads, profiledKeys) {
  const since = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
  const extra = [];
  const scans = [
    { table: "manychat_leads", select: "id,pipeline_stage,created_at" },
    { table: "quote_lead_submissions", select: "id,created_at" },
  ];
  for (const spec of scans) {
    try {
      const rows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/${spec.table}?select=${spec.select}&created_at=gte.${encodeURIComponent(
          since
        )}&order=created_at.desc&limit=800`
      );
      for (const row of rows || []) {
        const key = `${row.id}|${spec.table}`;
        if (profiledKeys.has(key) || enrolledLeads.has(key)) continue;
        const stage = spec.table === "manychat_leads" ? row.pipeline_stage || "new" : "new";
        if (!resolveAutoEnrollStage(stage)) continue;
        extra.push({
          lead_id: row.id,
          lead_source_table: spec.table,
          profile_data: { pipeline_stage: stage },
        });
      }
    } catch (e) {
      console.warn("[crm-nurture] catch-up scan", spec.table, e && e.message ? e.message : e);
    }
  }
  return extra;
}

function autoEnrollSortKey(row) {
  const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
  const cid = String(pd.contacts_contact_id || pd.contact_id || "");
  const canonical = String(row.lead_id) === cid && row.lead_source_table === "contacts";
  const contactsTable = row.lead_source_table === "contacts";
  return (canonical ? 0 : 1) * 10 + (contactsTable ? 0 : 1);
}

/** Catch-up: enroll New/Contacted CRM profiles that have no active nurture row. */
async function enrollEligibleUnenrolledLeads(cfg, opts) {
  opts = opts || {};
  if (!isAutoEnrollEnabled(process.env)) {
    return { ok: true, enrolled: 0, skipped: 0, reason: "manual_only" };
  }
  const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const limit = Math.min(Number(opts.limit) || 100, 300);
  const collapsed = await collapseDuplicateContactEnrollments(cfg);
  const activeRows = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/crm_nurture_enrollments?status=in.(active,paused)&select=lead_id,lead_source_table,contact_id&limit=5000"
  );
  const enrolledLeads = new Set(
    (activeRows || []).map((r) => `${r.lead_id}|${r.lead_source_table}`)
  );
  const enrolledContacts = new Set((activeRows || []).map((r) => r.contact_id).filter(Boolean));

  const profiles = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/staff_lead_profiles?select=lead_id,lead_source_table,profile_data&order=updated_at.desc&limit=2000"
  );

  const profiledKeys = new Set(
    (profiles || []).map((row) => `${row.lead_id}|${row.lead_source_table}`)
  );
  const unprofiled = await collectUnprofiledAutoEnrollCandidates(
    supabaseUrl,
    serviceKey,
    enrolledLeads,
    profiledKeys
  );

  const candidates = (profiles || [])
    .filter((row) => {
      if (opts.leadId && String(row.lead_id) !== String(opts.leadId)) return false;
      const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
      if (isArchivedProfileData(pd)) return false;
      if (pd.email_opt_out === true) return false;
      return !!resolveAutoEnrollStage(pd.pipeline_stage || "new");
    })
    .concat(
      unprofiled.filter((row) => !opts.leadId || String(row.lead_id) === String(opts.leadId))
    )
    .sort((a, b) => autoEnrollSortKey(a) - autoEnrollSortKey(b));

  const results = [];
  let skipped = 0;
  for (const row of candidates) {
    if (results.length >= limit) break;
    if (enrolledLeads.has(`${row.lead_id}|${row.lead_source_table}`)) {
      skipped += 1;
      continue;
    }
    const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
    const cid = pd.contacts_contact_id || pd.contact_id || null;
    if (cid && enrolledContacts.has(cid) && String(row.lead_id) !== String(cid)) {
      skipped += 1;
      continue;
    }
    const out = await autoEnrollCrmLead(cfg, {
      leadId: row.lead_id,
      leadSourceTable: row.lead_source_table,
      stage: pd.pipeline_stage,
      contactId: cid,
      actor: opts.actor || "auto_enroll_cron",
    });
    if (out && out.ok && !out.skipped) {
      enrolledLeads.add(`${row.lead_id}|${row.lead_source_table}`);
      if (cid) enrolledContacts.add(cid);
      results.push({
        lead_id: row.lead_id,
        lead_source_table: row.lead_source_table,
        enrollment_id: out.enrollment_id,
        backdated: !!out.backdated,
      });
    } else {
      skipped += 1;
    }
  }
  return {
    ok: true,
    enrolled: results.length,
    skipped,
    duplicates_cancelled: collapsed.cancelled,
    results,
  };
}

async function processRetainedLoyalPromotions(cfg) {
  const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const settings = await loadSettings(supabaseUrl, serviceKey);
  const retainedDays = Number(settings.retained_days) || 365;
  const loyalDays = Number(settings.loyal_days) || 730;
  const now = Date.now();
  let promoted = 0;

  const profiles = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/staff_lead_profiles?select=lead_id,lead_source_table,profile_data&limit=5000"
  );

  for (const row of profiles || []) {
    const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
    const stage = String(pd.pipeline_stage || "").trim().toLowerCase();
    const policyDate = pd.policy_effective_date || pd.policy_issued_date || pd.client_since;
    if (!policyDate) continue;
    const days = Math.floor((now - new Date(policyDate).getTime()) / 86400000);

    let newStage = null;
    if (stage === "client" && days >= retainedDays) newStage = "retained";
    if (stage === "retained" && days >= loyalDays) newStage = "loyal";
    if (!newStage) continue;

    const hints = {
      email: pd.email || "",
      first_name: pd.first_name || "",
      last_name: pd.last_name || "",
      display_name: pd.display_name || "",
    };
    if (!canAutomateLead(hints, settings, process.env)) continue;

    await saveCanonicalLeadProfile(cfg, row.lead_id, row.lead_source_table, { pipeline_stage: newStage }, "crm_nurture_cron");
    await onStageChange(cfg, {
      leadId: row.lead_id,
      leadSourceTable: row.lead_source_table,
      oldStage: stage,
      newStage,
      contactId: pd.contacts_contact_id || pd.contact_id,
    });
    promoted++;
  }
  return { promoted };
}

function escapeEmailHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTemplateLabel(templateKey) {
  const key = String(templateKey || "").trim();
  if (!key) return "message";
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatStageLabel(stage) {
  const s = String(stage || "").trim().toLowerCase();
  if (!s) return "Unknown";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function resolveLeadIdentity(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId) {
  const hints = await resolveLeadHints(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId);
  let displayName = String(hints.display_name || "").trim();
  if (!displayName) {
    displayName = [hints.first_name, hints.last_name].filter(Boolean).join(" ").trim();
  }
  if (!displayName) {
    try {
      const rows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/unified_leads?id=eq.${encodeURIComponent(leadId)}&source_table=eq.${encodeURIComponent(
          leadSourceTable
        )}&select=display_name,first_name,last_name,phone,email&limit=1`
      );
      const row = rows && rows[0] ? rows[0] : null;
      if (row) {
        displayName =
          String(row.display_name || "").trim() ||
          [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
        if (!hints.phone && row.phone) hints.phone = String(row.phone).trim();
        if (!hints.email && row.email) hints.email = String(row.email).trim();
      }
    } catch (_) {}
  }
  if (!displayName && leadSourceTable === "quote_lead_submissions") {
    try {
      const rows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/quote_lead_submissions?id=eq.${encodeURIComponent(
          leadId
        )}&select=first_name,last_name,phone,email&limit=1`
      );
      const row = rows && rows[0] ? rows[0] : null;
      if (row) {
        displayName = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
        if (!hints.phone && row.phone) hints.phone = String(row.phone).trim();
        if (!hints.email && row.email) hints.email = String(row.email).trim();
      }
    } catch (_) {}
  }
  return {
    display_name: displayName || "Unknown lead",
    phone: String(hints.phone || "").trim(),
    email: String(hints.email || "").trim(),
    first_name: String(hints.first_name || "").trim(),
    last_name: String(hints.last_name || "").trim(),
  };
}

async function enrichScheduledCalls(supabaseUrl, serviceKey, calls) {
  return Promise.all(
    (calls || []).map(async (task) => {
      const identity = await resolveLeadIdentity(
        supabaseUrl,
        serviceKey,
        task.lead_id,
        task.lead_source_table,
        task.contact_id || null
      );
      return Object.assign({}, task, {
        display_name: identity.display_name,
        phone: identity.phone,
        email: identity.email,
      });
    })
  );
}

async function fetchActiveEnrollmentsById(supabaseUrl, serviceKey) {
  const enrollments = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_nurture_enrollments?status=eq.active&select=id,lead_id,lead_source_table,contact_id,stage&limit=1000`
  );
  return new Map((enrollments || []).map((row) => [row.id, row]));
}

async function fetchScheduledCallTasksForToday(supabaseUrl, serviceKey, settings) {
  const tz = settings.timezone || "America/Chicago";
  const todayYmd = ymdChicago(new Date(), tz);
  const dayStart = localTimeUtcIso(todayYmd, "00:00", tz);
  const dayEnd = localTimeUtcIso(todayYmd, "23:59", tz);

  const [nurtureTasks, enrollmentById] = await Promise.all([
    sbFetch(
      supabaseUrl,
      serviceKey,
      `/crm_nurture_tasks?task_type=eq.call&status=eq.pending&due_at=gte.${encodeURIComponent(
        dayStart
      )}&due_at=lte.${encodeURIComponent(dayEnd)}&select=id,enrollment_id,due_at,payload&order=due_at.asc&limit=200`
    ),
    fetchActiveEnrollmentsById(supabaseUrl, serviceKey),
  ]);

  const calls = [];
  (nurtureTasks || []).forEach((task) => {
    const enrollment = enrollmentById.get(task.enrollment_id);
    if (!enrollment) return;
    if (String(enrollment.stage || "").toLowerCase() !== "new") return;
    calls.push({
      lead_id: enrollment.lead_id,
      lead_source_table: enrollment.lead_source_table,
      contact_id: enrollment.contact_id || null,
      enrollment_id: enrollment.id,
      nurture_task_id: task.id,
      stage: enrollment.stage,
      attempt_number: Number((task.payload && task.payload.attempt) || 1),
      day_number:
        task.payload && task.payload.day != null ? Number(task.payload.day) : null,
      due_at: task.due_at,
      status: "pending",
    });
  });
  return calls;
}

async function fetchPendingCommsForToday(supabaseUrl, serviceKey, settings) {
  const tz = settings.timezone || "America/Chicago";
  const todayYmd = ymdChicago(new Date(), tz);
  const dayStart = localTimeUtcIso(todayYmd, "00:00", tz);
  const dayEnd = localTimeUtcIso(todayYmd, "23:59", tz);

  const [tasks, enrollmentById] = await Promise.all([
    sbFetch(
      supabaseUrl,
      serviceKey,
      `/crm_nurture_tasks?status=eq.pending&due_at=gte.${encodeURIComponent(
        dayStart
      )}&due_at=lte.${encodeURIComponent(dayEnd)}&task_type=in.(email,sms)&select=id,task_type,due_at,enrollment_id,payload&order=due_at.asc&limit=200`
    ),
    fetchActiveEnrollmentsById(supabaseUrl, serviceKey),
  ]);

  const pending = [];
  for (const task of tasks || []) {
    const enrollment = enrollmentById.get(task.enrollment_id);
    if (!enrollment) continue;
    const identity = await resolveLeadIdentity(
      supabaseUrl,
      serviceKey,
      enrollment.lead_id,
      enrollment.lead_source_table,
      enrollment.contact_id || null
    );
    const payload = task.payload || {};
    const channel = String(task.task_type || "").toLowerCase() === "sms" ? "SMS" : "Email";
    pending.push({
      id: task.id,
      task_type: task.task_type,
      channel,
      due_at: task.due_at,
      enrollment_id: enrollment.id,
      lead_id: enrollment.lead_id,
      lead_source_table: enrollment.lead_source_table,
      stage: enrollment.stage,
      stage_label: formatStageLabel(enrollment.stage),
      day_number: payload.day != null ? Number(payload.day) : null,
      attempt_number: payload.attempt != null ? Number(payload.attempt) : null,
      template: payload.template || null,
      template_label: formatTemplateLabel(payload.template),
      display_name: identity.display_name,
      phone: identity.phone,
      email: identity.email,
      recipient: channel === "SMS" ? identity.phone : identity.email,
    });
  }
  return pending;
}

const MANUAL_MORNING_LIST_STAGES = new Set([
  "new",
  "new_lead",
  "new_contact",
  "initiated",
  "contacted",
  "attempting_contact",
  "call_scheduled",
]);

function isManualMorningListStage(stage) {
  return MANUAL_MORNING_LIST_STAGES.has(String(stage || "new").trim().toLowerCase());
}

function hasUsableEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function needsJuliePersonalContact(email, smsOptIn) {
  return !hasUsableEmail(email) || smsOptIn !== true;
}

function morningListPersonKey(row) {
  const cid = String((row && row.contact_id) || "").trim();
  if (cid) return `contact:${cid}`;
  return `${row.lead_id}|${row.lead_source_table}`;
}

function formatChicagoWhen(iso, tz) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: tz || "America/Chicago",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (e) {
    return String(iso || "");
  }
}

function missingChannelLabels(email, smsOptIn) {
  const bits = [];
  if (!hasUsableEmail(email)) bits.push("no email");
  if (smsOptIn !== true) bits.push("no SMS opt-in");
  return bits.join(" · ");
}

async function fetchManualMorningContactList(supabaseUrl, serviceKey) {
  const profiles = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/staff_lead_profiles?select=lead_id,lead_source_table,profile_data&order=updated_at.desc&limit=2000"
  );
  const enrollments = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/crm_nurture_enrollments?status=eq.active&select=lead_id,lead_source_table,contact_id,stage&limit=2000"
  );

  const byKey = new Map();
  function upsertCandidate(row) {
    if (!row || !row.lead_id || !row.lead_source_table) return;
    const key = `${row.lead_id}|${row.lead_source_table}`;
    const prev = byKey.get(key) || {
      lead_id: row.lead_id,
      lead_source_table: row.lead_source_table,
      contact_id: null,
      pipeline_stage: "new",
      profile_data: {},
    };
    if (row.contact_id) prev.contact_id = row.contact_id;
    if (row.pipeline_stage) prev.pipeline_stage = row.pipeline_stage;
    if (row.profile_data && typeof row.profile_data === "object") {
      prev.profile_data = Object.assign({}, prev.profile_data, row.profile_data);
      if (row.profile_data.contacts_contact_id || row.profile_data.contact_id) {
        prev.contact_id =
          prev.contact_id || row.profile_data.contacts_contact_id || row.profile_data.contact_id;
      }
    }
    byKey.set(key, prev);
  }

  (profiles || []).forEach((row) => {
    const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
    upsertCandidate({
      lead_id: row.lead_id,
      lead_source_table: row.lead_source_table,
      pipeline_stage: pd.pipeline_stage || "new",
      contact_id: pd.contacts_contact_id || pd.contact_id || null,
      profile_data: pd,
    });
  });
  (enrollments || []).forEach((row) => {
    upsertCandidate({
      lead_id: row.lead_id,
      lead_source_table: row.lead_source_table,
      pipeline_stage: row.stage || "new",
      contact_id: row.contact_id || null,
      profile_data: {},
    });
  });

  const quoteIds = [];
  const manychatIds = [];
  const contactIds = [];
  const candidates = [];
  for (const row of byKey.values()) {
    const pd = row.profile_data || {};
    if (isArchivedProfileData(pd)) continue;
    if (!isManualMorningListStage(row.pipeline_stage || pd.pipeline_stage)) continue;
    candidates.push(row);
    if (row.lead_source_table === "quote_lead_submissions") quoteIds.push(row.lead_id);
    if (row.lead_source_table === "manychat_leads") manychatIds.push(row.lead_id);
    if (row.lead_source_table === "contacts") contactIds.push(row.lead_id);
    if (row.contact_id) contactIds.push(row.contact_id);
  }

  const quoteById = new Map();
  const manychatById = new Map();
  const contactById = new Map();
  async function loadByIds(table, ids, select, map) {
    const unique = Array.from(new Set((ids || []).filter(Boolean).map(String)));
    if (!unique.length) return;
    try {
      const idList = unique.map((id) => encodeURIComponent(id)).join(",");
      const rows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/${table}?id=in.(${idList})&select=${select}&limit=800`
      );
      (rows || []).forEach((item) => map.set(String(item.id), item));
    } catch (e) {
      console.warn("[crm-nurture] morning list lookup", table, e && e.message ? e.message : e);
    }
  }
  await Promise.all([
    loadByIds(
      "quote_lead_submissions",
      quoteIds,
      "id,email,phone,first_name,last_name,consent_summary,consent_expires_at,payload",
      quoteById
    ),
    loadByIds("manychat_leads", manychatIds, "id,email,phone,first_name,last_name", manychatById),
    loadByIds("contacts", contactIds, "id,email,phone,first_name,last_name", contactById),
  ]);

  const people = [];
  const seen = new Set();
  for (const row of candidates) {
    const pd = row.profile_data || {};
    const quote = quoteById.get(String(row.lead_id)) || null;
    const mc = manychatById.get(String(row.lead_id)) || null;
    const contact =
      contactById.get(String(row.contact_id || "")) ||
      (row.lead_source_table === "contacts" ? contactById.get(String(row.lead_id)) : null);
    let email = pd.email || (quote && quote.email) || (mc && mc.email) || (contact && contact.email) || "";
    let phone = pd.phone || (quote && quote.phone) || (mc && mc.phone) || (contact && contact.phone) || "";
    let displayName =
      String(pd.display_name || "").trim() ||
      [pd.first_name, pd.last_name].filter(Boolean).join(" ").trim();
    if (!displayName && quote) {
      displayName = [quote.first_name, quote.last_name].filter(Boolean).join(" ").trim();
    }
    if (!displayName && mc) {
      displayName = [mc.first_name, mc.last_name].filter(Boolean).join(" ").trim();
    }
    if (!displayName && contact) {
      displayName = [contact.first_name, contact.last_name].filter(Boolean).join(" ").trim();
    }

    let smsOptIn = pd.sms_opt_in === true;
    if (!smsOptIn && quote) {
      const { isConsentExpired } = require("./crm-compliance");
      if (!(quote.consent_expires_at && isConsentExpired(quote.consent_expires_at))) {
        const cs = quote.consent_summary && typeof quote.consent_summary === "object" ? quote.consent_summary : {};
        if (!(cs.expiresAt && isConsentExpired(cs.expiresAt))) {
          if (cs.smsOptIn === true) smsOptIn = true;
          const mo = cs.marketingOptIn || (quote.payload && quote.payload.marketingOptIn);
          if (mo && mo.sms === true) smsOptIn = true;
        }
      }
    }

    if (!needsJuliePersonalContact(email, smsOptIn)) continue;

    const person = {
      lead_id: row.lead_id,
      lead_source_table: row.lead_source_table,
      contact_id: row.contact_id || null,
      display_name: displayName || "Unknown lead",
      phone: String(phone || "").trim(),
      email: String(email || "").trim(),
      pipeline_stage: String(row.pipeline_stage || "new").toLowerCase(),
      stage_label: formatStageLabel(row.pipeline_stage || "new"),
      has_email: hasUsableEmail(email),
      sms_opt_in: smsOptIn === true,
      missing_channels: missingChannelLabels(email, smsOptIn),
    };
    const dedupe = morningListPersonKey(person);
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    people.push(person);
  }

  people.sort((a, b) => {
    const stageRank = (s) => (String(s).startsWith("new") || s === "initiated" ? 0 : 1);
    const d = stageRank(a.pipeline_stage) - stageRank(b.pipeline_stage);
    if (d) return d;
    return String(a.display_name || "").localeCompare(String(b.display_name || ""), "en", {
      sensitivity: "base",
    });
  });
  return people;
}

async function fetchStaffRemindersDueToday(supabaseUrl, serviceKey, settings) {
  const tz = settings.timezone || "America/Chicago";
  const todayYmd = ymdChicago(new Date(), tz);
  const dayEnd = localTimeUtcIso(todayYmd, "23:59", tz);
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/staff_reminders?status=eq.pending&scheduled_at=lte.${encodeURIComponent(
      dayEnd
    )}&select=id,lead_id,lead_source_table,contact_id,message,scheduled_at,notify_email&order=scheduled_at.asc&limit=200`
  );

  const items = [];
  for (const row of rows || []) {
    const identity = await resolveLeadIdentity(
      supabaseUrl,
      serviceKey,
      row.lead_id,
      row.lead_source_table,
      row.contact_id || null
    );
    items.push({
      id: row.id,
      lead_id: row.lead_id,
      lead_source_table: row.lead_source_table,
      contact_id: row.contact_id || null,
      message: String(row.message || "").trim(),
      scheduled_at: row.scheduled_at,
      due_at: row.scheduled_at,
      display_name: identity.display_name,
      phone: identity.phone,
      email: identity.email,
    });
  }
  return items;
}

async function buildDailySummaryData(cfg) {
  const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const settings = await loadSettings(supabaseUrl, serviceKey);
  const tz = settings.timezone || "America/Chicago";
  const todayYmd = ymdChicago(new Date(), tz);

  const [scheduledCalls, pendingComms, manualContacts, scheduledNotes] = await Promise.all([
    fetchScheduledCallTasksForToday(supabaseUrl, serviceKey, settings),
    fetchPendingCommsForToday(supabaseUrl, serviceKey, settings),
    fetchManualMorningContactList(supabaseUrl, serviceKey),
    fetchStaffRemindersDueToday(supabaseUrl, serviceKey, settings),
  ]);
  const enrichedCalls = await enrichScheduledCalls(supabaseUrl, serviceKey, scheduledCalls);

  const peopleKeys = new Set(manualContacts.map(morningListPersonKey));
  (scheduledNotes || []).forEach((row) => peopleKeys.add(morningListPersonKey(row)));
  (enrichedCalls || []).forEach((row) => peopleKeys.add(morningListPersonKey(row)));

  return {
    date: todayYmd,
    timezone: tz,
    manual_contact_list: manualContacts,
    scheduled_notes: scheduledNotes,
    new_call_tasks: enrichedCalls,
    contacted_call_tasks: [],
    pending_emails_sms: pendingComms,
    manual_contact_count: manualContacts.length,
    scheduled_notes_count: (scheduledNotes || []).length,
    new_call_count: enrichedCalls.length,
    contacted_call_count: 0,
    people_to_contact_count: peopleKeys.size,
  };
}

async function sendDailySummaryEmail(cfg) {
  const settings = await loadSettings(cfg.supabaseUrl, cfg.serviceKey);
  const data = await buildDailySummaryData(cfg);
  const recipients = resolveDailySummaryRecipients(settings);
  const tz = data.timezone || "America/Chicago";

  const lines = [
    `<h2>Daily Summary — ${escapeEmailHtml(data.date)}</h2>`,
    "<p>Call or text these people yourself when we cannot email or send automatic texts. After a lead is <strong>Engaged</strong>, use the CRM scheduler — those notes appear below on the date you picked.</p>",
    `<h3>Call or text yourself (${data.manual_contact_count})</h3>`,
    "<p>New and Contacted leads with no email and/or no SMS opt-in. They stay on this list until you move them to Engaged.</p>",
    "<ul>",
  ];
  (data.manual_contact_list || []).forEach((c) => {
    const name = escapeEmailHtml(c.display_name || "Unknown lead");
    const phone = c.phone
      ? ` · <a href="tel:${escapeEmailHtml(String(c.phone).replace(/[^\d+]/g, ""))}">${escapeEmailHtml(c.phone)}</a>`
      : " · phone missing";
    const stage = escapeEmailHtml(c.stage_label || formatStageLabel(c.pipeline_stage));
    const missing = escapeEmailHtml(c.missing_channels || missingChannelLabels(c.email, c.sms_opt_in));
    lines.push(`<li><strong>${name}</strong>${phone}<br>${stage} · ${missing}</li>`);
  });
  if (!data.manual_contact_count) lines.push("<li>None today</li>");
  lines.push("</ul>");

  const notes = data.scheduled_notes || [];
  lines.push(`<h3>CRM scheduler notes due today (${notes.length})</h3>`);
  lines.push("<p>Next steps you saved on the client. Typical after Engaged.</p>");
  lines.push("<ul>");
  notes.forEach((item) => {
    const name = escapeEmailHtml(item.display_name || "Unknown lead");
    const when = escapeEmailHtml(formatChicagoWhen(item.scheduled_at, tz));
    const phone = item.phone
      ? ` · <a href="tel:${escapeEmailHtml(String(item.phone).replace(/[^\d+]/g, ""))}">${escapeEmailHtml(item.phone)}</a>`
      : "";
    const note = escapeEmailHtml(item.message || "").replace(/\n/g, "<br>");
    lines.push(`<li><strong>${name}</strong>${phone} · ${when}<br>${note || "(no note)"}</li>`);
  });
  if (!notes.length) lines.push("<li>None due today</li>");
  lines.push("</ul>");

  lines.push(`<h3>Timed nurture calls (${data.new_call_count})</h3>`);
  lines.push("<ul>");
  (data.new_call_tasks || []).forEach((c) => {
    const when = escapeEmailHtml(formatChicagoWhen(c.due_at, tz));
    const name = escapeEmailHtml(c.display_name || "Unknown lead");
    const phone = c.phone
      ? ` · <a href="tel:${escapeEmailHtml(String(c.phone).replace(/[^\d+]/g, ""))}">${escapeEmailHtml(c.phone)}</a>`
      : " · phone missing";
    const attempt = c.attempt_number != null ? `Attempt #${escapeEmailHtml(c.attempt_number)}` : "Call";
    const day = c.day_number != null ? ` · Day ${escapeEmailHtml(c.day_number)}` : "";
    lines.push(
      `<li><strong>${name}</strong>${phone}<br>${attempt}${day} · due ${when}</li>`
    );
  });
  if (!data.new_call_count) lines.push("<li>None scheduled</li>");
  lines.push("</ul>");

  const pending = data.pending_emails_sms || [];
  lines.push(`<h3>Emails / SMS queued today (${pending.length})</h3>`);
  lines.push("<ul>");
  pending.forEach((item) => {
    const when = escapeEmailHtml(formatChicagoWhen(item.due_at, tz));
    const name = escapeEmailHtml(item.display_name || "Unknown lead");
    const channel = escapeEmailHtml(item.channel || "Message");
    const stage = escapeEmailHtml(item.stage_label || formatStageLabel(item.stage));
    const template = escapeEmailHtml(item.template_label || "message");
    const day = item.day_number != null ? ` · Day ${escapeEmailHtml(item.day_number)}` : "";
    const attempt =
      item.attempt_number != null ? ` · Attempt #${escapeEmailHtml(item.attempt_number)}` : "";
    const recipient = item.recipient
      ? escapeEmailHtml(item.recipient)
      : channel === "SMS"
        ? "phone missing"
        : "email missing";
    lines.push(
      `<li><strong>${channel}</strong> to <strong>${name}</strong> (${recipient})<br>${template} · ${stage}${day}${attempt} · due ${when}</li>`
    );
  });
  if (!pending.length) lines.push("<li>None queued</li>");
  lines.push("</ul>");

  const html = wrapResendEmailHtml(lines.join("\n"), LOGO_EN);
  await sendResendEmail({
    to: recipients,
    subject: `[CRM] Daily Summary — ${data.date}`,
    html,
  });
  return { ok: true, recipients, ...data };
}

module.exports = {
  loadSettings,
  saveSettings,
  enrollLead,
  maybeEnrollCrmLead,
  autoEnrollCrmLead,
  autoEnrollCaptureLead,
  enrollEligibleUnenrolledLeads,
  collapseDuplicateContactEnrollments,
  onStageChange,
  processDueTasks,
  flushWelcomeAfterQuote,
  processRetainedLoyalPromotions,
  buildDailySummaryData,
  sendDailySummaryEmail,
  cancelActiveEnrollment,
  engineEnabled,
  rolloutSummary,
  resolveLeadHints,
  canAutomateLeadById,
  isTestingRollout,
  fetchLeadContact,
  resolveLeadStateCode,
  resolveCrmEntryDate,
  resolveManualEnrollStage,
  resolveAutoEnrollStage,
  canManualEnroll,
  buildNewTasks,
  markBackdatedTasks,
  buildBackdatedContactedTasks,
  buildFullBackdatedEnrollmentTasks,
  mergeEnrollmentTimeline,
  materializeMissingEnrollmentTasks,
  enrollmentPipelineNeedsRebuild,
  rebuildEnrollmentPipelineFromCrmEntry,
  expectedStoredTasks,
  projectFutureContactedTasks,
  getContactedPhaseStartIso,
};
