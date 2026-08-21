/**
 * POST /api/staff/sms-otp-verify
 * Body: { email, code }
 */
const { json, readJsonBody } = require("./_inbox-lib");
const { checkRateLimit } = require("../../lib/rate-limit");
const { verifyInboxOtp } = require("../../lib/staff-sms-inbox");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const limit = await checkRateLimit(req, {
    bucket: "sms_inbox_otp_verify",
    max: 20,
    windowSec: 900,
    failOpen: false,
  });
  if (!limit.allowed) {
    return json(res, 429, { ok: false, error: "Too many attempts. Please wait and try again." });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }
  const email = body && body.email != null ? String(body.email).trim() : "";
  const code = body && body.code != null ? String(body.code).trim() : "";
  if (!email || !code) {
    return json(res, 400, { ok: false, error: "Enter your email and the 6-digit code." });
  }

  try {
    const result = await verifyInboxOtp(email, code);
    if (!result.ok) return json(res, 200, result);
    return json(res, 200, { ok: true, session: result.session });
  } catch (err) {
    console.error("[sms-otp-verify]", err && err.message);
    return json(res, 500, { ok: false, error: "Could not verify the code. Please try again." });
  }
};
