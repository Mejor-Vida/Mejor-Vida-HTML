/**
 * GET /api/staff/crm-dashboard — CRM dashboard aggregates (pipeline buckets, medical pending).
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");

const ENROLLED_STAGES = new Set([
  "application_started",
  "underwriting",
  "approved_pending_payment",
  "policy_issued",
  "closed_won",
]);

const CONTACTED_STAGES = new Set([
  "attempting_contact",
  "connected",
  "qualified",
  "needs_analysis_complete",
  "quote_preparing",
  "quote_presented",
  "objection_handling",
  "closed_lost",
]);

const IN_APPLICATION_STAGES = new Set([
  "application_started",
  "underwriting",
  "approved_pending_payment",
]);

function pipelineBucket(stage) {
  const s = String(stage || "")
    .trim()
    .toLowerCase();
  if (!s || s === "new_lead") return "new";
  if (ENROLLED_STAGES.has(s)) return "enrolled";
  if (CONTACTED_STAGES.has(s)) return "contacted";
  return "new";
}

function isBlankValue(v) {
  return v == null || v === "" || (Array.isArray(v) && v.length === 0);
}

function mergePreferCanonical(sourceValue, canonicalValue) {
  return isBlankValue(canonicalValue) ? sourceValue : canonicalValue;
}

function displayName(row) {
  const dn = String((row && row.display_name) || "").trim();
  if (dn) return dn;
  const parts = [row && row.first_name, row && row.last_name].filter(Boolean);
  return parts.join(" ").trim() || "Unknown";
}

function buildListItemFromRow(r, canonical) {
  const item = {
    id: r.id,
    source_table: r.source_table || "unknown",
    pipeline_stage: String(r.pipeline_stage || "").trim(),
  };
  if (canonical && typeof canonical === "object") {
    item.pipeline_stage = mergePreferCanonical(item.pipeline_stage, canonical.pipeline_stage);
  }
  return item;
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
      "select=id,source_table,pipeline_stage&limit=5000"
    );
  } catch (e) {
    const msg = String((e && e.message) || e);
    if (/pipeline_stage|42703|column.*does not exist|Could not find/i.test(msg)) {
      return await restSelect(cfg, "unified_leads", "select=id,source_table&limit=5000");
    }
    throw e;
  }
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
    const [rows, profileMap, intakeRows] = await Promise.all([
      loadUnifiedLeads(cfg),
      loadStaffProfileMap(cfg),
      restSelect(cfg, "medical_intake_submissions", "select=lead_id,lead_source_table&limit=5000").catch(
        () => []
      ),
    ]);

    const intakeKeys = new Set(
      (intakeRows || []).map((r) => `${r.lead_id}|${r.lead_source_table}`).filter(Boolean)
    );

    const stageCounts = { new: 0, contacted: 0, enrolled: 0 };
    let inApplication = 0;
    let medicalPending = 0;

    (rows || []).forEach((r) => {
      if (!r || !r.id) return;
      const key = `${r.id}|${r.source_table || "unknown"}`;
      const canonical = profileMap.get(key);
      const item = buildListItemFromRow(r, canonical);
      const bucket = pipelineBucket(item.pipeline_stage);
      stageCounts[bucket]++;
      const stage = String(item.pipeline_stage || "").toLowerCase();
      if (IN_APPLICATION_STAGES.has(stage)) inApplication++;
      if (!intakeKeys.has(key)) medicalPending++;
    });

    return json(res, 200, {
      total: (rows || []).length,
      stage_counts: stageCounts,
      medical_pending: medicalPending,
      in_application: inApplication,
      calls_today: null,
    });
  } catch (e) {
    console.error("staff/crm-dashboard", e);
    return json(res, 500, { error: "Failed to load dashboard" });
  }
};
