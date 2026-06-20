/**
 * Outbound SMS via Telnyx.
 *
 * Env: TELNYX_API_KEY
 *      TELNYX_SMS_FROM (+14028441199)
 *      TELNYX_MESSAGING_PROFILE_ID (optional fallback `from` if phone send fails)
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

function normalizeApiKey(raw) {
  let key = String(raw || "").trim();
  key = key.replace(/^Bearer\s+/i, "");
  key = key.replace(/^["']|["']$/g, "");
  return key.trim();
}

function isLikelyPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function smsFromNumber() {
  const raw = (process.env.TELNYX_SMS_FROM || "").trim();
  if (!raw) return "";
  if (isLikelyPhone(raw)) return normalizeE164(raw);
  return raw;
}

function smsMessagingProfileId() {
  return (process.env.TELNYX_MESSAGING_PROFILE_ID || "").trim();
}

function smsFromIdentity() {
  return smsFromNumber() || smsMessagingProfileId();
}

function smsFromCandidates() {
  const out = [];
  const phone = smsFromNumber();
  const profileId = smsMessagingProfileId();
  if (phone) out.push(phone);
  if (profileId && profileId !== phone) out.push(profileId);
  return out;
}

function formatTelnyxError(detail) {
  if (!detail) return "";
  if (Array.isArray(detail)) {
    return detail
      .map((e) => e.detail || e.title || e.code)
      .filter(Boolean)
      .join("; ")
      .slice(0, 300);
  }
  if (typeof detail === "object") {
    return JSON.stringify(detail).slice(0, 300);
  }
  return String(detail).slice(0, 300);
}

async function sendTelnyxSmsOnce({ apiKey, from, toE164, body, mediaUrls }) {
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
    const message = formatTelnyxError(detail);
    return {
      ok: false,
      reason: "telnyx_error",
      status: res.status,
      detail,
      message,
      from,
    };
  }
  return { ok: true, sid: json.data && json.data.id, provider: "telnyx", from };
}

async function sendTelnyxSms({ to, body, mediaUrls }) {
  const apiKey = normalizeApiKey(process.env.TELNYX_API_KEY);
  const toE164 = normalizeE164(to);
  if (!apiKey) return { ok: false, reason: "missing_telnyx_api_key" };
  if (!apiKey.startsWith("KEY")) {
    return { ok: false, reason: "malformed_telnyx_api_key", message: "Key should start with KEY (full Telnyx v2 API key)" };
  }
  if (!toE164) return { ok: false, reason: "invalid_to_phone" };

  const fromList = smsFromCandidates();
  if (!fromList.length) return { ok: false, reason: "missing_telnyx_sms_from" };

  let last = null;
  for (const from of fromList) {
    const result = await sendTelnyxSmsOnce({ apiKey, from, toE164, body, mediaUrls });
    if (result.ok) {
      console.log(`[sms-send] Telnyx sent from ${from} to ${toE164}, id ${result.sid}`);
      return result;
    }
    last = result;
    console.error(
      `[sms-send] Telnyx error from ${from}`,
      result.status,
      result.message || "",
    );
  }
  return last || { ok: false, reason: "telnyx_error" };
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
  smsFromIdentity,
  smsMessagingProfileId,
};
