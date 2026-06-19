/**
 * Outbound SMS via Telnyx.
 *
 * Env: TELNYX_API_KEY, TELNYX_SMS_FROM (+14028441199)
 */

function normalizeE164(phone) {
  const raw = String(phone || "").trim();
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

function smsFromNumber() {
  return (process.env.TELNYX_SMS_FROM || "").trim();
}

async function sendTelnyxSms({ to, body, mediaUrls }) {
  const apiKey = (process.env.TELNYX_API_KEY || "").trim();
  const from = smsFromNumber();
  const toE164 = normalizeE164(to);
  if (!apiKey) return { ok: false, reason: "missing_telnyx_api_key" };
  if (!from) return { ok: false, reason: "missing_telnyx_sms_from" };
  if (!toE164) return { ok: false, reason: "invalid_to_phone" };

  const payload = { from, to: toE164, text: String(body || "") };
  const media = Array.isArray(mediaUrls) ? mediaUrls.filter(Boolean) : [];
  if (media.length) payload.media_urls = media;

  const res = await fetch("https://api.telnyx.com/v2/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = json.errors || json.error || json;
    console.error("[sms-send] Telnyx error", res.status, JSON.stringify(detail).slice(0, 400));
    return { ok: false, reason: "telnyx_error", detail };
  }
  return { ok: true, sid: json.data && json.data.id, provider: "telnyx" };
}

/**
 * @param {{ to: string, body: string, mediaUrls?: string[] }} opts
 */
async function sendSms(opts) {
  return sendTelnyxSms(opts);
}

module.exports = {
  sendSms,
  sendTelnyxSms,
  normalizeE164,
  smsFromNumber,
};
