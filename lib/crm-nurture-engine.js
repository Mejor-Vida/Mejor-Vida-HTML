/**
 * CRM Lead Nurture Engine — enrollment, task materialization, execution.
 */

const {
  DEFAULT_CRM_NURTURE_SETTINGS,
  STAGES_WITH_AUTO_NURTURE,
  resolveDailySummaryRecipients,
  resolveManualEnrollStage,
  canManualEnroll,
  contactedEmailTemplateForAttempt,
  mergeCrmNurtureSettings,
} = require("./crm-nurture-defaults");
const { getCrmNurtureEmail, getCrmNurtureSms } = require("./crm-nurture-templates");
const { logContactCommunication, htmlToPlain } = require("./contact-communications");
const { sendSms } = require("./sms-send");
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

async function cancelActiveEnrollment(supabaseUrl, serviceKey, leadId, leadSourceTable, reason) {
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_nurture_enrollments?lead_id=eq.${leadId}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&status=eq.active&select=id`
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

async function fetchLeadContact(supabaseUrl, serviceKey, leadId, leadSourceTable, contactId) {
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
  return null;
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
  if (pd && pd.sms_opt_in === true) return true;
  if (pd && pd.sms_opt_in === false) return false;
  return false;
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

  if (STAGES_WITH_AUTO_NURTURE.has(ns)) {
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
      result.ok = false;
      result.reason = "no_email";
      return result;
    }
    let templateKey = payload.template;
    if (payload.recurring && String(enrollment.stage || "").toLowerCase() === "contacted") {
      templateKey = contactedEmailTemplateForAttempt(settings, payload.attempt || 1);
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

async function processDueTasks(opts = {}) {
  const supabaseUrl = (opts.cfg && opts.cfg.supabaseUrl) || process.env.SUPABASE_URL;
  const serviceKey = (opts.cfg && opts.cfg.serviceKey) || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const now = opts.now || new Date();
  const dryRun = !!opts.dryRun || process.env.CRM_NURTURE_DRY_RUN === "true";
  const settings = await loadSettings(supabaseUrl, serviceKey);

  if (!engineEnabled(settings, process.env)) {
    return { ok: true, processed: 0, reason: "disabled" };
  }

  const dueTasks = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_nurture_tasks?status=eq.pending&due_at=lte.${encodeURIComponent(
      now.toISOString()
    )}&select=id,enrollment_id,task_type,due_at,payload&order=due_at.asc&limit=100`
  );

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

  return { ok: true, processed: results.length, results, dry_run: dryRun };
}

async function maybeEnrollCrmLead(cfg, opts) {
  if (process.env.CRM_NURTURE_ENGINE_ENABLED === "false") return { ok: false, reason: "disabled" };
  const stage = String(opts.stage || "new").trim().toLowerCase();
  if (stage !== "new" && stage !== "contacted") return { ok: false, reason: "skip_stage" };
  return enrollLead(cfg, opts);
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

async function buildDailySummaryData(cfg) {
  const supabaseUrl = cfg.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = cfg.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const settings = await loadSettings(supabaseUrl, serviceKey);
  const tz = settings.timezone || "America/Chicago";
  const todayYmd = ymdChicago(new Date(), tz);

  const [scheduledCalls, pendingComms] = await Promise.all([
    fetchScheduledCallTasksForToday(supabaseUrl, serviceKey, settings),
    fetchPendingCommsForToday(supabaseUrl, serviceKey, settings),
  ]);
  const enrichedCalls = await enrichScheduledCalls(supabaseUrl, serviceKey, scheduledCalls);

  return {
    date: todayYmd,
    timezone: tz,
    new_call_tasks: enrichedCalls,
    contacted_call_tasks: [],
    pending_emails_sms: pendingComms,
    new_call_count: enrichedCalls.length,
    contacted_call_count: 0,
  };
}

async function sendDailySummaryEmail(cfg) {
  const settings = await loadSettings(cfg.supabaseUrl, cfg.serviceKey);
  const data = await buildDailySummaryData(cfg);
  const recipients = resolveDailySummaryRecipients(settings);

  const lines = [
    `<h2>Daily Summary — ${data.date}</h2>`,
    `<p>Who to call today and which nurture messages are queued.</p>`,
    `<h3>Calls scheduled today (${data.new_call_count})</h3>`,
    "<ul>",
  ];
  (data.new_call_tasks || []).forEach((c) => {
    const when = new Date(c.due_at).toLocaleString("en-US", {
      timeZone: data.timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const name = escapeEmailHtml(c.display_name || "Unknown lead");
    const phone = c.phone
      ? ` · <a href="tel:${escapeEmailHtml(String(c.phone).replace(/[^\d+]/g, ""))}">${escapeEmailHtml(c.phone)}</a>`
      : " · phone missing";
    const attempt = c.attempt_number != null ? `Attempt #${escapeEmailHtml(c.attempt_number)}` : "Call";
    const day =
      c.day_number != null ? ` · Day ${escapeEmailHtml(c.day_number)}` : "";
    lines.push(
      `<li><strong>${name}</strong>${phone}<br>${attempt}${day} · due ${escapeEmailHtml(when)}</li>`
    );
  });
  if (!data.new_call_count) lines.push("<li>None scheduled</li>");
  lines.push("</ul>");

  const pending = data.pending_emails_sms || [];
  lines.push(`<h3>Emails / SMS queued today (${pending.length})</h3>`);
  lines.push("<ul>");
  pending.forEach((item) => {
    const when = new Date(item.due_at).toLocaleString("en-US", {
      timeZone: data.timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const name = escapeEmailHtml(item.display_name || "Unknown lead");
    const channel = escapeEmailHtml(item.channel || "Message");
    const stage = escapeEmailHtml(item.stage_label || formatStageLabel(item.stage));
    const template = escapeEmailHtml(item.template_label || "message");
    const day =
      item.day_number != null ? ` · Day ${escapeEmailHtml(item.day_number)}` : "";
    const attempt =
      item.attempt_number != null ? ` · Attempt #${escapeEmailHtml(item.attempt_number)}` : "";
    const recipient = item.recipient
      ? escapeEmailHtml(item.recipient)
      : channel === "SMS"
        ? "phone missing"
        : "email missing";
    lines.push(
      `<li><strong>${channel}</strong> to <strong>${name}</strong> (${recipient})<br>${template} · ${stage}${day}${attempt} · due ${escapeEmailHtml(when)}</li>`
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
  onStageChange,
  processDueTasks,
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
  resolveCrmEntryDate,
  resolveManualEnrollStage,
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
