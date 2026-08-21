/**
 * GET /api/staff/sms-vapid
 * Public VAPID key for Web Push (auth required).
 */
const { json } = require("./_inbox-lib");
const { requireSmsInboxAuth, vapidConfig } = require("../../lib/staff-sms-inbox");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }
  const auth = await requireSmsInboxAuth(req, res);
  if (!auth.valid) return;
  const vapid = vapidConfig();
  if (!vapid) return json(res, 200, { ok: true, publicKey: "" });
  return json(res, 200, { ok: true, publicKey: vapid.publicKey });
};
