/**
 * POST /api/staff/sms-push-subscribe
 * Body: { subscription }
 */
const { json, readJsonBody } = require("./_inbox-lib");
const { requireSmsInboxAuth, savePushSubscription } = require("../../lib/staff-sms-inbox");

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
  const subscription = body && body.subscription;
  const ua = String((req.headers && (req.headers["user-agent"] || req.headers["User-Agent"])) || "");
  try {
    const result = await savePushSubscription(auth.user.email, subscription, ua);
    return json(res, 200, result);
  } catch (err) {
    console.error("[sms-push-subscribe]", err && err.message);
    return json(res, 400, { ok: false, error: "Could not save notifications." });
  }
};
