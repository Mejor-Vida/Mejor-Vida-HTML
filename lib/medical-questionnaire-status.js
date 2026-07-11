/**
 * Medical questionnaire sent vs completed — shared by CRM dashboard and medical profile API.
 */
const { restSelect } = require("../api/staff/_inbox-lib");

const MEDICAL_PENDING_STAGES = new Set(["new", "contacted", "engaged"]);

function normalizeIcStage(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s || s === "new_lead" || s === "new_contact") return "new";
  const icStages = ["new", "contacted", "engaged", "client", "retained", "loyal", "lost", "enrolled"];
  if (icStages.includes(s)) return s;
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

async function loadLeadStageMap(cfg) {
  let rows = [];
  try {
    rows = await restSelect(
      cfg,
      "unified_leads",
      "select=id,source_table,pipeline_stage&limit=5000"
    );
  } catch (e) {
    const msg = String((e && e.message) || e);
    if (/pipeline_stage|42703|column.*does not exist|Could not find/i.test(msg)) {
      rows = await restSelect(cfg, "unified_leads", "select=id,source_table&limit=5000");
    } else {
      throw e;
    }
  }

  const profiles = await restSelect(
    cfg,
    "staff_lead_profiles",
    "select=lead_id,lead_source_table,profile_data&limit=5000"
  ).catch(() => []);

  const profileMap = new Map();
  (profiles || []).forEach((row) => {
    if (!row || !row.lead_id || !row.lead_source_table) return;
    const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
    profileMap.set(`${row.lead_id}|${row.lead_source_table}`, pd);
  });

  const stageMap = new Map();
  (rows || []).forEach((row) => {
    if (!row || !row.id) return;
    const key = `${row.id}|${row.source_table || "unknown"}`;
    const pd = profileMap.get(key) || {};
    stageMap.set(key, normalizeIcStage(pd.pipeline_stage || row.pipeline_stage));
  });
  return stageMap;
}

function questionnaireStatus(submissions, pendingToken) {
  const latestSub = Array.isArray(submissions) && submissions[0] ? submissions[0] : null;
  if (pendingToken) {
    if (!latestSub || !latestSub.submitted_at) return "awaiting";
    const sentAt = new Date(pendingToken.created_at).getTime();
    const subAt = new Date(latestSub.submitted_at).getTime();
    if (Number.isFinite(sentAt) && Number.isFinite(subAt) && sentAt > subAt) return "awaiting";
  }
  if (latestSub) return "submitted";
  return "not_sent";
}

function isAwaitingFromUnusedToken(latestSub, token) {
  if (!token || token.used_at) return false;
  if (token.status === "revoked") return false;
  if (!latestSub || !latestSub.submitted_at) return true;
  const sentAt = new Date(token.created_at).getTime();
  const subAt = new Date(latestSub.submitted_at).getTime();
  return Number.isFinite(sentAt) && Number.isFinite(subAt) && sentAt > subAt;
}

/**
 * Count leads where a medical questionnaire was sent but not completed (blank / awaiting).
 * Only includes clients in New, Contacted, or Engaged — not Client, Enrolled, etc.
 */
async function countMedicalPendingLeads(cfg) {
  const now = new Date().toISOString();

  const [tokens, submissions, stageMap] = await Promise.all([
    restSelect(
      cfg,
      "medical_intake_access_tokens",
      "select=lead_id,lead_source_table,created_at,used_at,status,expires_at&used_at=is.null&order=created_at.desc&limit=5000"
    ).catch(() => []),
    restSelect(
      cfg,
      "medical_intake_submissions",
      "select=lead_id,lead_source_table,submitted_at&order=submitted_at.desc&limit=5000"
    ).catch(() => []),
    loadLeadStageMap(cfg).catch(() => new Map()),
  ]);

  const latestSubByKey = new Map();
  (submissions || []).forEach((row) => {
    if (!row || !row.lead_id || !row.lead_source_table) return;
    const key = `${row.lead_id}|${row.lead_source_table}`;
    if (!latestSubByKey.has(key)) latestSubByKey.set(key, row);
  });

  const activeTokenByKey = new Map();
  const latestUnusedTokenByKey = new Map();
  (tokens || []).forEach((row) => {
    if (!row || !row.lead_id || !row.lead_source_table) return;
    const key = `${row.lead_id}|${row.lead_source_table}`;
    if (!latestUnusedTokenByKey.has(key)) latestUnusedTokenByKey.set(key, row);
    if (
      row.status === "active" &&
      row.expires_at &&
      String(row.expires_at) > now &&
      !activeTokenByKey.has(key)
    ) {
      activeTokenByKey.set(key, row);
    }
  });

  let count = 0;
  latestUnusedTokenByKey.forEach((unusedToken, key) => {
    const stage = stageMap.get(key);
    if (!stage || !MEDICAL_PENDING_STAGES.has(stage)) return;

    const latestSub = latestSubByKey.get(key) || null;
    const subs = latestSub ? [latestSub] : [];
    const activeToken = activeTokenByKey.get(key) || null;
    const status = questionnaireStatus(subs, activeToken);
    if (status === "awaiting") {
      count += 1;
      return;
    }
    if (!activeToken && isAwaitingFromUnusedToken(latestSub, unusedToken)) {
      count += 1;
    }
  });

  return count;
}

async function fetchPendingQuestionnaireToken(cfg, leadId, leadSourceTable) {
  const now = new Date().toISOString();
  try {
    const rows = await restSelect(
      cfg,
      "medical_intake_access_tokens",
      `select=id,created_at,expires_at,recipient_email,status&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}&status=eq.active&expires_at=gt.${encodeURIComponent(now)}&order=created_at.desc&limit=1`
    );
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch (_) {
    return null;
  }
}

module.exports = {
  questionnaireStatus,
  countMedicalPendingLeads,
  fetchPendingQuestionnaireToken,
};
