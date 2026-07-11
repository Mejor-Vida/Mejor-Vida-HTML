/**
 * GET/POST/PATCH /api/staff/nurture-pipeline — per-lead CRM nurture timeline (new engine).
 *
 * GET    ?leadId=&leadSourceTable=&includeStopped=1
 * POST   enroll (same query params)
 * PATCH  ?leadId=&leadSourceTable=&action=pause|resume|sold|opt_out
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const {
  loadSettings,
  enrollLead,
  cancelActiveEnrollment,
  fetchLeadContact,
  canManualEnroll,
  resolveManualEnrollStage,
  enrollmentPipelineNeedsRebuild,
  rebuildEnrollmentPipelineFromCrmEntry,
} = require("../../lib/crm-nurture-engine");
const { buildClientPipelineView } = require("../../lib/crm-nurture-pipeline-view");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

async function sbFetch(cfg, path, options = {}) {
  const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  const headers = {
    apikey: cfg.serviceKey,
    Authorization: `Bearer ${cfg.serviceKey}`,
    "Content-Type": "application/json",
  };
  if (options.prefer) headers.Prefer = options.prefer;
  const r = await fetch(`${base}/rest/v1${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : [];
}

async function loadLeadProfile(cfg, leadId, leadSourceTable) {
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=profile_data&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&limit=1`
  );
  const pd = rows && rows[0] && rows[0].profile_data;
  return pd && typeof pd === "object" ? pd : {};
}

async function loadEnrollment(cfg, leadId, leadSourceTable, includeStopped) {
  let filter = `lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
    leadSourceTable
  )}`;
  if (!includeStopped) {
    filter += "&status=in.(active,paused)";
  }
  const rows = await sbFetch(
    cfg,
    `/crm_nurture_enrollments?${filter}&select=*&order=created_at.desc&limit=5`
  );
  if (!rows || !rows.length) return null;
  if (includeStopped) return rows[0];
  const active = rows.find((r) => r.status === "active" || r.status === "paused");
  return active || rows[0];
}

async function loadEnrollmentTasks(cfg, enrollmentId) {
  if (!enrollmentId) return [];
  return sbFetch(
    cfg,
    `/crm_nurture_tasks?enrollment_id=eq.${encodeURIComponent(
      enrollmentId
    )}&select=*&order=due_at.asc&limit=500`
  );
}

async function loadCallTasks(cfg, enrollmentId) {
  if (!enrollmentId) return [];
  return sbFetch(
    cfg,
    `/crm_call_tasks?enrollment_id=eq.${encodeURIComponent(
      enrollmentId
    )}&select=*&order=due_at.asc&limit=500`
  );
}

async function pauseEnrollment(cfg, leadId, leadSourceTable) {
  const rows = await sbFetch(
    cfg,
    `/crm_nurture_enrollments?lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&status=eq.active&select=id&limit=1`
  );
  const row = rows && rows[0];
  if (!row) return { ok: false, error: "no_active_enrollment" };
  const now = new Date().toISOString();
  await sbFetch(cfg, `/crm_nurture_enrollments?id=eq.${row.id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ status: "paused", updated_at: now }),
  });
  await sbFetch(cfg, `/crm_nurture_tasks?enrollment_id=eq.${row.id}&status=eq.pending`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ status: "cancelled", cancelled_reason: "paused" }),
  });
  await sbFetch(cfg, `/crm_call_tasks?enrollment_id=eq.${row.id}&status=eq.pending`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ status: "cancelled" }),
  });
  return { ok: true };
}

async function buildPipelinePayload(cfg, leadId, leadSourceTable, includeStopped) {
  const profile = await loadLeadProfile(cfg, leadId, leadSourceTable);
  const contactId = profile.contacts_contact_id || profile.contact_id || null;
  const pipelineStage = String(profile.pipeline_stage || "new").trim().toLowerCase();
  const settings = await loadSettings(cfg.supabaseUrl, cfg.serviceKey);
  const contact = await fetchLeadContact(
    cfg.supabaseUrl,
    cfg.serviceKey,
    leadId,
    leadSourceTable,
    contactId
  );

  const enrollment = await loadEnrollment(cfg, leadId, leadSourceTable, includeStopped);
  let tasks = enrollment ? await loadEnrollmentTasks(cfg, enrollment.id) : [];
  if (enrollment && enrollment.status === "active") {
    const audit = await enrollmentPipelineNeedsRebuild(
      cfg.supabaseUrl,
      cfg.serviceKey,
      enrollment,
      tasks,
      settings,
      new Date()
    );
    if (audit.needs) {
      await rebuildEnrollmentPipelineFromCrmEntry(
        cfg.supabaseUrl,
        cfg.serviceKey,
        enrollment,
        settings,
        { crmEntry: audit.crm_entry }
      );
      enrollment = await loadEnrollment(cfg, leadId, leadSourceTable, includeStopped);
      tasks = enrollment ? await loadEnrollmentTasks(cfg, enrollment.id) : [];
    }
  }
  const callTasks = enrollment ? await loadCallTasks(cfg, enrollment.id) : [];

  const view = buildClientPipelineView({
    enrollment,
    tasks,
    callTasks,
    settings,
    contact,
    pipelineStage,
    includeStopped,
  });

  const canEnroll = canManualEnroll(pipelineStage) && !view.enrolled;

  return {
    lead_id: leadId,
    lead_source_table: leadSourceTable,
    contact_id: contactId,
    contact_found: !!(contact && (contact.id || contact.email || contact.phone)),
    enrolled: view.enrolled,
    can_enroll: canEnroll,
    enroll_stage: canEnroll ? resolveManualEnrollStage(pipelineStage) : null,
    pipeline_stage: view.pipeline_stage,
    sequence_label: view.sequence_label,
    nurture_enrollment: view.nurture_enrollment,
    crm_entry_at: enrollment && enrollment.enrolled_at ? enrollment.enrolled_at : null,
    steps: view.steps,
  };
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server misconfigured" });

  const leadId = req.query.leadId || (req.body && req.body.leadId);
  const leadSourceTable = req.query.leadSourceTable || (req.body && req.body.leadSourceTable);
  const includeStopped = req.query.includeStopped === "1" || req.query.includeStopped === "true";

  if (!isUuid(leadId)) {
    return json(res, 400, { error: "leadId query parameter required" });
  }
  if (!leadSourceTable) {
    return json(res, 400, { error: "leadSourceTable query parameter required" });
  }

  try {
    if (req.method === "GET") {
      const payload = await buildPipelinePayload(cfg, leadId, leadSourceTable, includeStopped);
      return json(res, 200, payload);
    }

    if (req.method === "POST") {
      const profile = await loadLeadProfile(cfg, leadId, leadSourceTable);
      const pipelineStage = String(profile.pipeline_stage || "new").trim().toLowerCase();
      const enrollStage = resolveManualEnrollStage(
        req.query.stage || (req.body && req.body.stage) || pipelineStage
      );
      if (!enrollStage) {
        return json(res, 400, { error: "stage_no_manual_enroll", stage: pipelineStage });
      }
      const contactId = profile.contacts_contact_id || profile.contact_id || null;
      const result = await enrollLead(cfg, {
        leadId,
        leadSourceTable,
        stage: enrollStage,
        contactId,
        actor: auth.email || "staff",
        backdateToCrmEntry: true,
        manualEnroll: true,
      });
      if (!result.ok) {
        return json(res, 400, { error: result.reason || "enroll_failed", detail: result });
      }
      const payload = await buildPipelinePayload(cfg, leadId, leadSourceTable, includeStopped);
      return json(res, 200, { ok: true, ...payload });
    }

    if (req.method === "PATCH") {
      const action = String(req.query.action || (req.body && req.body.action) || "").toLowerCase();
      if (action === "pause") {
        const out = await pauseEnrollment(cfg, leadId, leadSourceTable);
        if (!out.ok) return json(res, 400, out);
      } else if (action === "resume") {
        const profile = await loadLeadProfile(cfg, leadId, leadSourceTable);
        const paused = await sbFetch(
          cfg,
          `/crm_nurture_enrollments?lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
            leadSourceTable
          )}&status=eq.paused&select=id,stage,contact_id&limit=1`
        );
        const row = paused && paused[0];
        if (!row) return json(res, 400, { error: "no_paused_enrollment" });
        const result = await enrollLead(cfg, {
          leadId,
          leadSourceTable,
          stage: row.stage || profile.pipeline_stage || "new",
          contactId: row.contact_id || profile.contacts_contact_id || profile.contact_id || null,
          actor: auth.email || "staff",
          backdateToCrmEntry: true,
          manualEnroll: true,
        });
        if (!result.ok) return json(res, 400, { error: result.reason || "resume_failed", detail: result });
      } else if (action === "sold" || action === "opt_out") {
        await cancelActiveEnrollment(
          cfg.supabaseUrl,
          cfg.serviceKey,
          leadId,
          leadSourceTable,
          action === "sold" ? "sold" : "opt_out"
        );
      } else {
        return json(res, 400, { error: "action required: pause, resume, sold, or opt_out" });
      }
      const payload = await buildPipelinePayload(cfg, leadId, leadSourceTable, includeStopped);
      return json(res, 200, { ok: true, ...payload });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (e) {
    console.error("[staff/nurture-pipeline]", e);
    return json(res, 500, { error: String((e && e.message) || e) });
  }
};
