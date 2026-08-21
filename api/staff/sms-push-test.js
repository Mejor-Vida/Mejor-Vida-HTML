/**
 * POST /api/staff/sms-push-test
 * Sends a test Web Push to the signed-in user's devices.
 */
const { json } = require("./_inbox-lib");
const { requireSmsInboxAuth, notifyInboxPush } = require("../../lib/staff-sms-inbox");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }
  const auth = await requireSmsInboxAuth(req, res);
  if (!auth.valid) return;
  try {
    const result = await notifyInboxPush({
      title: "Mejor Vida SMS",
      body: "Text alerts are on. You will get a notification when someone texts 402-844-1199.",
      email: auth.user.email,
    });
    return json(res, 200, { ok: true, sent: result.sent || 0, skipped: result.skipped || null });
  } catch (err) {
    console.error("[sms-push-test]", err && err.message);
    return json(res, 500, { ok: false, error: "Could not send a test alert." });
  }
};
