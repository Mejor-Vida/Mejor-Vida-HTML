/**
 * POST /api/phone-verify
 * Site phone SMS verification (Telnyx + Supabase OTP store).
 *
 * Body: { "action": "send" | "check", "phone": "...", "code": "123456" }
 * Origin-guarded — see lib/site-origin.js
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      TELNYX_API_KEY, TELNYX_SMS_FROM,
 *      PHONE_VERIFY_OTP_SECRET (recommended; falls back to CRON_SECRET)
 */

const { verifySiteOrigin } = require("../lib/site-origin");
const { logRequest } = require("../lib/manychat-auth");
const {
  readJsonBody,
  normalizeUsPhoneE164,
  createAndSendOtp,
  verifyOtp,
} = require("../lib/phone-verify");

function applyCors(req, res) {
  const gate = verifySiteOrigin(req);
  const origin = String(req.headers.origin || "").trim();
  if (gate.ok && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.mejorvidainsurance.com");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, payload, req) {
  applyCors(req, res);
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  logRequest("phone-verify");
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" }, req);
  }

  const origin = verifySiteOrigin(req);
  if (!origin.ok) {
    return json(res, origin.status, { ok: false, error: origin.error }, req);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { ok: false, error: "Missing Supabase config" }, req);
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" }, req);
  }

  const action = String(body.action || "").toLowerCase().trim();
  const phoneE164 = normalizeUsPhoneE164(body.phone);
  if (!phoneE164) {
    return json(res, 400, { ok: false, error: "Enter a valid 10-digit U.S. phone number." }, req);
  }

  try {
    if (action === "send") {
      const out = await createAndSendOtp(supabaseUrl, supabaseKey, phoneE164);
      if (!out.ok) return json(res, 400, { ok: false, error: out.error }, req);
      return json(res, 200, { ok: true, phone: out.phone, display: out.display }, req);
    }

    if (action === "check") {
      const out = await verifyOtp(supabaseUrl, supabaseKey, phoneE164, body.code);
      if (!out.ok) return json(res, 400, { ok: false, error: out.error }, req);
      return json(res, 200, { ok: true, phone: out.phone, display: out.display, verified: true }, req);
    }

    return json(res, 400, { ok: false, error: "Invalid action" }, req);
  } catch (err) {
    console.error("[phone-verify]", err.message || err);
    return json(res, 500, { ok: false, error: "Verification failed. Please try again." }, req);
  }
};
