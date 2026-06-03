const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect } = require("./_inbox-lib");
const { canAccessPhi } = require("../../lib/staff-permissions");
const { readPhiByLead, writePhiByLead } = require("../../lib/phi-store");
const { PHI_SOURCE } = require("../../lib/medical-intake-token");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));
}

function emptyIntake() {
  return {
    healthInfo: {
      gender: "",
      birthdate: "",
      heightFt: null,
      heightIn: null,
      weightLbs: null,
      tobaccoUse: false,
    },
    providers: [],
    prescriptions: [],
    pharmacies: [],
    conditions: [],
  };
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

function normalizeIntake(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const hi = p.healthInfo && typeof p.healthInfo === "object" ? p.healthInfo : {};
  return {
    version: p.version || 1,
    submitted_at: p.submitted_at || null,
    updated_at: p.updated_at || null,
    updated_by: p.updated_by || null,
    healthInfo: {
      gender: String(hi.gender || "").trim(),
      birthdate: String(hi.birthdate || "").trim(),
      heightFt: hi.heightFt != null ? hi.heightFt : hi.height_ft != null ? hi.height_ft : null,
      heightIn: hi.heightIn != null ? hi.heightIn : hi.height_in != null ? hi.height_in : null,
      weightLbs: hi.weightLbs != null ? hi.weightLbs : hi.weight_lbs != null ? hi.weight_lbs : null,
      tobaccoUse: !!(hi.tobaccoUse ?? hi.tobacco_use),
    },
    providers: Array.isArray(p.providers) ? p.providers : [],
    prescriptions: Array.isArray(p.prescriptions) ? p.prescriptions : [],
    pharmacies: Array.isArray(p.pharmacies) ? p.pharmacies : [],
    conditions: Array.isArray(p.conditions) ? p.conditions : [],
  };
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { ok: false, error: "server_config" });

  const canPhi = canAccessPhi(auth);

  if (req.method === "GET") {
    const leadId = String((req.query && req.query.lead_id) || "").trim();
    const leadSourceTable = String((req.query && req.query.lead_source_table) || "manychat_leads").trim();
    if (!isUuid(leadId)) return json(res, 400, { ok: false, error: "lead_id required" });

    let submissions = [];
    try {
      submissions = await restSelect(
        cfg,
        "medical_intake_submissions",
        `select=id,status,submitted_at&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}&order=submitted_at.desc&limit=5`
      );
    } catch (_) {
      submissions = [];
    }

    const pendingToken = await fetchPendingQuestionnaireToken(cfg, leadId, leadSourceTable);
    const questionnaire_status = questionnaireStatus(submissions, pendingToken);
    const questionnaire_sent_at =
      pendingToken && pendingToken.created_at ? pendingToken.created_at : null;

    if (!canPhi) {
      return json(res, 200, {
        ok: true,
        can_access_phi: false,
        intake: null,
        questionnaire_status,
        questionnaire_sent_at,
        submissions: submissions.map((s) => ({
          id: s.id,
          status: s.status,
          submitted_at: s.submitted_at,
        })),
      });
    }

    const { payload } = await readPhiByLead(cfg, leadId, PHI_SOURCE);
    const hasData = payload && Object.keys(payload).length > 0;
    return json(res, 200, {
      ok: true,
      can_access_phi: true,
      intake: hasData ? normalizeIntake(payload) : emptyIntake(),
      has_saved_profile: hasData,
      questionnaire_status,
      questionnaire_sent_at,
      submissions,
    });
  }

  if (req.method === "PUT") {
    if (!canPhi) return json(res, 403, { ok: false, error: "not_authorized_phi" });

    let body;
    try {
      body = readJsonBody(req);
    } catch (_) {
      return json(res, 400, { ok: false, error: "invalid_json" });
    }

    const leadId = String((body && body.lead_id) || "").trim();
    const leadSourceTable = String((body && body.lead_source_table) || "manychat_leads").trim();
    if (!isUuid(leadId)) return json(res, 400, { ok: false, error: "lead_id required" });

    const hi = body && body.healthInfo;
    if (!hi || !hi.gender || !hi.birthdate) {
      return json(res, 400, { ok: false, error: "healthInfo gender and birthdate required" });
    }

    const staffEmail = auth.user && auth.user.email ? auth.user.email : "staff";
    const intakePayload = {
      version: 1,
      submitted_at: body.submitted_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: staffEmail,
      lead_source_table: leadSourceTable,
      healthInfo: {
        gender: String(hi.gender || "").trim(),
        birthdate: String(hi.birthdate || "").trim(),
        heightFt: hi.heightFt != null ? Number(hi.heightFt) : null,
        heightIn: hi.heightIn != null ? Number(hi.heightIn) : null,
        weightLbs: hi.weightLbs != null ? Number(hi.weightLbs) : null,
        tobaccoUse: !!hi.tobaccoUse,
      },
      providers: Array.isArray(body.providers) ? body.providers : [],
      prescriptions: Array.isArray(body.prescriptions) ? body.prescriptions : [],
      pharmacies: Array.isArray(body.pharmacies) ? body.pharmacies : [],
      conditions: Array.isArray(body.conditions) ? body.conditions : [],
      staff_edited: true,
    };

    await writePhiByLead(cfg, leadId, PHI_SOURCE, intakePayload, staffEmail);

    return json(res, 200, {
      ok: true,
      intake: normalizeIntake(intakePayload),
    });
  }

  res.setHeader("Allow", "GET, PUT");
  return json(res, 405, { ok: false, error: "method_not_allowed" });
};
