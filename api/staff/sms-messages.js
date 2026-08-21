/**
 * GET /api/staff/sms-messages?phone=+1...
 */
const { json } = require("./_inbox-lib");
const { requireSmsInboxAuth, listMessages } = require("../../lib/staff-sms-inbox");

function queryPhone(req) {
  const q = req.query && req.query.phone;
  if (q != null && String(q).trim()) return String(q).trim();
  try {
    const path = req.url || "";
    const base = path.startsWith("http") ? path : `https://localhost${path.startsWith("/") ? path : `/${path}`}`;
    return new URL(base).searchParams.get("phone") || "";
  } catch (_) {
    return "";
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }
  const auth = await requireSmsInboxAuth(req, res);
  if (!auth.valid) return;
  const phone = queryPhone(req);
  if (!phone) return json(res, 400, { ok: false, error: "Missing phone." });
  try {
    const messages = await listMessages(phone);
    return json(res, 200, { ok: true, messages });
  } catch (err) {
    console.error("[sms-messages]", err && err.message);
    return json(res, 500, { ok: false, error: "Could not load messages." });
  }
};
