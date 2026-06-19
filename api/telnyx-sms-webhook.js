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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!validateTelnyxWebhookSecret(req)) {
    console.warn("[telnyx-sms-webhook] Invalid webhook secret");
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  const inbound = parseTelnyxInbound(body);
  if (!inbound) {
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
    console.error("[telnyx-sms-webhook] Outbound reply failed:", sent.reason, sent.detail || "");
    return res.status(200).json({ ok: true, reply_failed: true });
  }

  return res.status(200).json({ ok: true, message_id: sent.sid });
};
