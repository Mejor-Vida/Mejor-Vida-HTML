/**
 * POST /api/telnyx-sms-webhook
 * Telnyx inbound SMS (message.received).
 *
 * Configure in Telnyx Mission Control:
 *   Messaging → your number +14028441199 → Webhook URL:
 *   https://www.mejorvidainsurance.com/api/telnyx-sms-webhook?secret=YOUR_TELNYX_WEBHOOK_SECRET
 *
 * Env: TELNYX_API_KEY, TELNYX_SMS_FROM, TELNYX_WEBHOOK_SECRET (recommended),
 *      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
 */

const { sendSms } = require("../lib/sms-send");
const {
  handleInboundSms,
  parseTelnyxInbound,
  validateTelnyxWebhookSecret,
} = require("../lib/sms-inbound-handler");

function readJsonBody(req) {
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString("utf8") || "{}");
    } catch (e) {
      return null;
    }
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch (e) {
      return null;
    }
  }
  return req.body && typeof req.body === "object" ? req.body : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  let body = readJsonBody(req);
  if (!body) {
    console.warn("[telnyx-sms-webhook] Invalid JSON body");
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  if (!validateTelnyxWebhookSecret(req, body)) {
    console.warn("[telnyx-sms-webhook] Invalid webhook secret");
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  const inbound = parseTelnyxInbound(body);
  if (!inbound) {
    const eventType = body.data && body.data.event_type;
    console.log(`[telnyx-sms-webhook] Ignored event: ${eventType || "unknown"}`);
    return res.status(200).json({ ok: true, ignored: true });
  }

  const { fromPhone, msgBody } = inbound;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ ok: false, error: "Missing Supabase env" });
  }

  console.log(`[telnyx-sms-webhook] From: ${fromPhone}, Body: "${msgBody}"`);

  const result = await handleInboundSms({
    fromPhone,
    msgBody,
    supabaseUrl,
    supabaseKey,
    inboundSource: "telnyx_inbound",
  });

  if (result.silent || !result.reply) {
    return res.status(200).json({ ok: true });
  }

  const sent = await sendSms({ to: fromPhone, body: result.reply });
  if (!sent.ok) {
    console.error(
      "[telnyx-sms-webhook] Outbound reply failed:",
      sent.reason,
      JSON.stringify(sent.detail || "").slice(0, 400),
    );
    return res.status(200).json({ ok: true, reply_failed: true, reason: sent.reason });
  }

  return res.status(200).json({ ok: true, message_id: sent.sid });
};
