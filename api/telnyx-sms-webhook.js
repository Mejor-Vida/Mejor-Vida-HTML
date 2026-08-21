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

const { sendSms, smsFromNumber } = require("../lib/sms-send");
const {
  handleInboundSms,
  parseTelnyxInbound,
  validateTelnyxWebhookSecret,
} = require("../lib/sms-inbound-handler");
const {
  logStaffSmsMessage,
  notifyInboxPush,
  formatPhoneDisplay,
  previewText,
} = require("../lib/staff-sms-inbox");

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

async function fanoutInbox(fromPhone, msgBody) {
  const title = `SMS ${formatPhoneDisplay(fromPhone)}`;
  const preview = previewText(msgBody, 80) || "New text message";
  try {
    await notifyInboxPush({ title, body: preview, phone: fromPhone });
  } catch (err) {
    console.error("[telnyx-sms-webhook] push failed:", err && err.message);
  }
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

  const { fromPhone, toPhone, msgBody, telnyxId } = inbound;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ ok: false, error: "Missing Supabase env" });
  }

  console.log(`[telnyx-sms-webhook] From: ${fromPhone}, Body: "${msgBody}"`);

  await logStaffSmsMessage({
    direction: "inbound",
    fromE164: fromPhone,
    toE164: toPhone || smsFromNumber() || "+14028441199",
    body: msgBody,
    telnyxId: telnyxId || null,
    meta: { source: "telnyx_inbound" },
  });

  const result = await handleInboundSms({
    fromPhone,
    msgBody,
    supabaseUrl,
    supabaseKey,
    inboundSource: "telnyx_inbound",
  });

  await fanoutInbox(fromPhone, msgBody);

  if (result.silent || !result.reply) {
    return res.status(200).json({ ok: true, inbox: true });
  }

  const sent = await sendSms({ to: fromPhone, body: result.reply });
  if (!sent.ok) {
    console.error(
      "[telnyx-sms-webhook] Outbound reply failed:",
      sent.reason,
      sent.message || JSON.stringify(sent.detail || "").slice(0, 400),
    );
    return res.status(200).json({
      ok: true,
      reply_failed: true,
      reason: sent.reason,
      telnyx_status: sent.status || null,
      telnyx_error: sent.message || null,
    });
  }

  await logStaffSmsMessage({
    direction: "outbound",
    fromE164: sent.from || smsFromNumber() || "+14028441199",
    toE164: fromPhone,
    body: result.reply,
    telnyxId: sent.sid || null,
    meta: { source: "keyword_auto_reply" },
  });

  return res.status(200).json({ ok: true, message_id: sent.sid, inbox: true });
};
