/**
 * GET /api/staff/sms-threads
 */
const { json } = require("./_inbox-lib");
const { requireSmsInboxAuth, listThreads } = require("../../lib/staff-sms-inbox");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }
  const auth = await requireSmsInboxAuth(req, res);
  if (!auth.valid) return;
  try {
    const threads = await listThreads();
    return json(res, 200, { ok: true, threads });
  } catch (err) {
    console.error("[sms-threads]", err && err.message);
    return json(res, 500, { ok: false, error: "Could not load conversations." });
  }
};
