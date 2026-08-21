/**
 * POST /api/staff/sms-reply
 * Body: { toPhone, body }
 */
const { json, readJsonBody } = require("./_inbox-lib");
const { requireSmsInboxAuth, sendInboxSms } = require("../../lib/staff-sms-inbox");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }
  const auth = await requireSmsInboxAuth(req, res);
  if (!auth.valid) return;
  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }
  const toPhone = body && body.toPhone != null ? String(body.toPhone).trim() : "";
  const text = body && body.body != null ? String(body.body) : "";
  try {
    const result = await sendInboxSms({
      toPhone,
      body: text,
      actorEmail: auth.user.email,
    });
    return json(res, result.ok ? 200 : 200, result);
  } catch (err) {
    console.error("[sms-reply]", err && err.message);
    return json(res, 500, { ok: false, error: "Could not send the text." });
  }
};
