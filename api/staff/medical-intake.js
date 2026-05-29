const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect } = require("./_inbox-lib");
const { canAccessPhi } = require("../../lib/staff-permissions");
const { readPhiByLead } = require("../../lib/phi-store");
const { PHI_SOURCE } = require("../../lib/medical-intake-token");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const leadId = String((req.query && req.query.lead_id) || "").trim();
  const leadSourceTable = String((req.query && req.query.lead_source_table) || "manychat_leads").trim();
  if (!isUuid(leadId)) return json(res, 400, { error: "lead_id required" });

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Missing Supabase config" });

  const canPhi = canAccessPhi(auth);
  let submissions = [];
  try {
    submissions = await restSelect(
      cfg,
      "medical_intake_submissions",
      `select=id,status,submitted_at,phi_source_table&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}&order=submitted_at.desc&limit=5`
    );
  } catch (_) {
    submissions = [];
  }

  if (!canPhi) {
    return json(res, 200, {
      can_access_phi: false,
      submissions: submissions.map((s) => ({
        id: s.id,
        status: s.status,
        submitted_at: s.submitted_at,
      })),
      intake: null,
    });
  }

  const { payload } = await readPhiByLead(cfg, leadId, PHI_SOURCE);
  const hasData = payload && Object.keys(payload).length > 0;
  return json(res, 200, {
    can_access_phi: true,
    submissions,
    intake: hasData ? payload : null,
  });
};
