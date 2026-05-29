const { json, requireValidIntakeToken } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }
  try {
    const gate = await requireValidIntakeToken(req);
    if (!gate.ok) return json(res, gate.status, { ok: false, error: gate.error });
    return json(res, 200, {
      ok: true,
      lead_id: gate.tokenRow.lead_id,
      expires_at: gate.tokenRow.expires_at,
    });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message || "validate_failed") });
  }
};
