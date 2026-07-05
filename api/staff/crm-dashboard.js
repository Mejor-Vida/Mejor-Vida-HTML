/**
 * GET /api/staff/crm-dashboard — CRM dashboard aggregates + daily nurture summary.
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { buildDailySummaryData } = require("../../lib/crm-nurture-engine");

const IC_STAGES = ["new", "contacted", "engaged", "client", "retained", "loyal", "lost", "enrolled"];

const IN_APPLICATION_STAGES = new Set([
  "application_started",
  "underwriting",
  "approved_pending_payment",
]);

function normalizeIcStage(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s || s === "new_lead" || s === "new_contact") return "new";
  if (IC_STAGES.includes(s)) return s;
  const legacy = {
    attempting_contact: "contacted",
    call_scheduled: "contacted",
    connected: "engaged",
    qualified: "engaged",
    policy_issued: "enrolled",
    closed_won: "enrolled",
    closed_lost: "lost",
  };
  return legacy[s] || "new";
}

function isBlankValue(v) {
  return v == null || v === "" || (Array.isArray(v) && v.length === 0);
}

function mergePreferCanonical(sourceValue, canonicalValue) {
  return isBlankValue(canonicalValue) ? sourceValue : canonicalValue;
}

async function loadStaffProfileMap(cfg) {
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    "select=lead_id,lead_source_table,profile_data&limit=5000"
  );
  const map = new Map();
  (rows || []).forEach((row) => {
    if (!row || !row.lead_id || !row.lead_source_table) return;
    const key = `${row.lead_id}|${row.lead_source_table}`;
    const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
    map.set(key, pd);
  });
  return map;
}

async function loadUnifiedLeads(cfg) {
  try {
    return await restSelect(
      cfg,
      "unified_leads",
      "select=id,source_table,first_name,last_name,display_name,pipeline_stage&limit=5000"
    );
  } catch (e) {
    const msg = String((e && e.message) || e);
    if (/pipeline_stage|42703|column.*does not exist|Could not find/i.test(msg)) {
      return await restSelect(cfg, "unified_leads", "select=id,source_table,first_name,last_name,display_name&limit=5000");
    }
    throw e;
  }
}

function leadDisplayName(r, pd) {
  const dn = String((r && r.display_name) || "").trim();
  if (dn) return dn;
  const fn = String((pd && pd.first_name) || (r && r.first_name) || "").trim();
  const ln = String((pd && pd.last_name) || (r && r.last_name) || "").trim();
  return [fn, ln].filter(Boolean).join(" ").trim() || "Unknown";
}

async function enrichCallTasks(cfg, callTasks, profileMap, leadRows) {
  const leadIndex = new Map();
  (leadRows || []).forEach((r) => {
    if (!r || !r.id) return;
    leadIndex.set(`${r.id}|${r.source_table || "unknown"}`, r);
  });

  return (callTasks || []).map((task) => {
    const key = `${task.lead_id}|${task.lead_source_table}`;
    const pd = profileMap.get(key) || {};
    const row = leadIndex.get(key) || {};
    return Object.assign({}, task, {
      display_name: leadDisplayName(row, pd),
      pipeline_stage: normalizeIcStage(pd.pipeline_stage || row.pipeline_stage),
    });
  });
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Missing Supabase config" });

  try {
    const [rows, profileMap, intakeRows, nurtureSummary] = await Promise.all([
      loadUnifiedLeads(cfg),
      loadStaffProfileMap(cfg),
      restSelect(cfg, "medical_intake_submissions", "select=lead_id,lead_source_table&limit=5000").catch(
        () => []
      ),
      buildDailySummaryData(cfg).catch(() => null),
    ]);

    const intakeKeys = new Set(
      (intakeRows || []).map((r) => `${r.lead_id}|${r.lead_source_table}`).filter(Boolean)
    );

    const stageCounts = {};
    IC_STAGES.forEach((s) => {
      stageCounts[s] = 0;
    });
    let inApplication = 0;
    let medicalPending = 0;

    (rows || []).forEach((r) => {
      if (!r || !r.id) return;
      const key = `${r.id}|${r.source_table || "unknown"}`;
      const canonical = profileMap.get(key);
      const stage = normalizeIcStage(
        (canonical && canonical.pipeline_stage) || r.pipeline_stage
      );
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      if (IN_APPLICATION_STAGES.has(String(r.pipeline_stage || "").toLowerCase())) inApplication++;
      if (!intakeKeys.has(key)) medicalPending++;
    });

    let dailySummary = nurtureSummary;
    if (dailySummary) {
      dailySummary = Object.assign({}, dailySummary, {
        new_call_tasks: await enrichCallTasks(
          cfg,
          dailySummary.new_call_tasks,
          profileMap,
          rows
        ),
        contacted_call_tasks: await enrichCallTasks(
          cfg,
          dailySummary.contacted_call_tasks,
          profileMap,
          rows
        ),
      });
    }

    const activeEnrollments = await restSelect(
      cfg,
      "crm_nurture_enrollments",
      "select=lead_id,lead_source_table,stage,enrolled_at&status=eq.active&limit=500"
    ).catch(() => []);

    const newLeadsInSequence = (activeEnrollments || [])
      .filter((e) => e.stage === "new")
      .map((e) => {
        const key = `${e.lead_id}|${e.lead_source_table}`;
        const pd = profileMap.get(key) || {};
        const row = (rows || []).find((r) => `${r.id}|${r.source_table || "unknown"}` === key) || {};
        const enrolledAt = new Date(e.enrolled_at);
        const daysIn = Math.floor((Date.now() - enrolledAt.getTime()) / 86400000);
        return {
          lead_id: e.lead_id,
          lead_source_table: e.lead_source_table,
          display_name: leadDisplayName(row, pd),
          days_in_sequence: daysIn,
          enrolled_at: e.enrolled_at,
        };
      });

    return json(res, 200, {
      total: (rows || []).length,
      stage_counts: stageCounts,
      medical_pending: medicalPending,
      in_application: inApplication,
      calls_today: dailySummary ? dailySummary.new_call_count + dailySummary.contacted_call_count : null,
      daily_summary: dailySummary,
      new_leads_in_sequence: newLeadsInSequence,
    });
  } catch (e) {
    console.error("staff/crm-dashboard", e);
    return json(res, 500, { error: "Failed to load dashboard" });
  }
};
