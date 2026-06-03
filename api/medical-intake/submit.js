const { json, readJsonBody, requireValidIntakeToken } = require("./_lib");
const { consumeToken, PHI_SOURCE } = require("../../lib/medical-intake-token");
const { writePhiByLead } = require("../../lib/phi-store");
const { sendMedicalIntakeSubmittedNotification } = require("../../lib/ic-lead-notify");
const { normalizeFirstName } = require("../../lib/medical-intake-lead-greeting");

async function restInsert(cfg, table, row) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`insert ${table} ${r.status}: ${text.slice(0, 240)}`);
  const rows = JSON.parse(text || "[]");
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

function validatePayload(body) {
  const hi = body && body.healthInfo;
  if (!hi || typeof hi !== "object") return "healthInfo required";
  if (!hi.gender) return "gender required";
  if (!hi.birthdate) return "birthdate required";
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }
  let body;
  try {
    body = readJsonBody(req);
  } catch (_) {
    return json(res, 400, { ok: false, error: "invalid_json" });
  }
  const payloadErr = validatePayload(body);
  if (payloadErr) return json(res, 400, { ok: false, error: payloadErr });

  try {
    const gate = await requireValidIntakeToken(req);
    if (!gate.ok) return json(res, gate.status, { ok: false, error: gate.error });
    if (gate.devPreview) {
      return json(res, 403, { ok: false, error: "dev_preview_submit_disabled" });
    }

    const { cfg, tokenRow } = gate;
    const intakePayload = {
      version: 1,
      submitted_at: new Date().toISOString(),
      healthInfo: body.healthInfo || {},
      providers: Array.isArray(body.providers) ? body.providers : [],
      prescriptions: Array.isArray(body.prescriptions) ? body.prescriptions : [],
      pharmacies: Array.isArray(body.pharmacies) ? body.pharmacies : [],
      conditions: Array.isArray(body.conditions) ? body.conditions : [],
      consent: body.consent === true,
    };

    await writePhiByLead(cfg, tokenRow.lead_id, PHI_SOURCE, intakePayload, "medical_intake_client");
    await restInsert(cfg, "medical_intake_submissions", {
      token_id: tokenRow.id,
      lead_id: tokenRow.lead_id,
      lead_source_table: tokenRow.lead_source_table,
      status: "submitted",
      phi_source_table: PHI_SOURCE,
    });
    await consumeToken(cfg, tokenRow);

    void sendMedicalIntakeSubmittedNotification({
      leadId: tokenRow.lead_id,
      leadSourceTable: tokenRow.lead_source_table,
      recipientEmail: tokenRow.recipient_email,
      recipientFirstName: normalizeFirstName(tokenRow.recipient_first_name),
      intakeBody: body,
    });

    return json(res, 200, { ok: true, message: "submitted" });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message || "submit_failed") });
  }
};
