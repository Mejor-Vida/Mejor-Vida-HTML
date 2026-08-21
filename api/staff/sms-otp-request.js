/**
 * POST /api/staff/sms-otp-request
 * Body: { email }
 * Always returns a generic success for unauthorized emails (do not confirm membership).
 */
const { json, readJsonBody } = require("./_inbox-lib");
const { checkRateLimit } = require("../../lib/rate-limit");
const { requestInboxOtp } = require("../../lib/staff-sms-inbox");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const limit = await checkRateLimit(req, {
    bucket: "sms_inbox_otp",
    max: 8,
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
  if (!email) return json(res, 400, { ok: false, error: "Enter your email." });

  try {
    const result = await requestInboxOtp(email);
    if (!result.ok) return json(res, 200, result);
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error("[sms-otp-request]", err && err.message);
    return json(res, 500, { ok: false, error: "Could not send a code. Please try again." });
  }
};
