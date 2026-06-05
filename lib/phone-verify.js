/**
 * Phone SMS verification — normalize US numbers, OTP hash, Twilio send, Supabase storage.
 */

const crypto = require("crypto");

const OTP_TTL_MS = 10 * 60 * 1000;
const SEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_15_MIN = 3;
const MAX_VERIFY_ATTEMPTS = 5;

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function normalizeUsPhoneE164(input) {
  const digits = String(input || "").trim().replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function formatUsPhoneDisplay(e164) {
  const digits = String(e164 || "").replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return e164 || "";
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function otpSecret() {
  return (
    process.env.PHONE_VERIFY_OTP_SECRET ||
    process.env.TWILIO_AUTH_TOKEN ||
    ""
  ).trim();
}

function hashOtp(code, phoneE164) {
  const secret = otpSecret();
  if (!secret) throw new Error("missing_otp_secret");
  return crypto.createHmac("sha256", secret).update(`${phoneE164}:${code}`).digest("hex");
}

function sbHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

function sbBase(url) {
  return `${String(url).replace(/\/$/, "")}/rest/v1`;
}

async function sbPost(url, key, table, row) {
  const res = await fetch(`${sbBase(url)}/${table}`, {
    method: "POST",
    headers: sbHeaders(key),
    body: JSON.stringify(row),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase POST ${table}: ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function sbGet(url, key, path) {
  const res = await fetch(`${sbBase(url)}${path}`, { headers: sbHeaders(key) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status} ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

async function sbPatch(url, key, path, data) {
  const res = await fetch(`${sbBase(url)}${path}`, {
    method: "PATCH",
    headers: { ...sbHeaders(key), Prefer: "return=minimal" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase PATCH ${path}: ${res.status} ${t.slice(0, 200)}`);
  }
}

async function countRecentSends(supabaseUrl, key, phoneE164, windowMs) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const rows = await sbGet(
    supabaseUrl,
    key,
    `/phone_verification_codes?phone_e164=eq.${encodeURIComponent(phoneE164)}` +
      `&created_at=gte.${encodeURIComponent(since)}&select=id`
  );
  return Array.isArray(rows) ? rows.length : 0;
}

async function sendTwilioSms(toE164, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = (process.env.TWILIO_MESSAGING_SERVICE_SID || "").trim();
  const fromNumber = (process.env.TWILIO_PHONE_NUMBER || "").trim();
  if (!sid || !token) return { ok: false, reason: "missing_twilio_env" };
  if (!messagingServiceSid && !fromNumber) return { ok: false, reason: "missing_twilio_env" };

  const params = new URLSearchParams({ Body: body, To: toE164 });
  if (messagingServiceSid) params.append("MessagingServiceSid", messagingServiceSid);
  else params.append("From", fromNumber);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const json = await res.json();
  if (json.error_code) return { ok: false, reason: "twilio_error", detail: json.message || json.error_message };
  return { ok: true, sid: json.sid };
}

async function createAndSendOtp(supabaseUrl, key, phoneE164) {
  if (!otpSecret()) return { ok: false, error: "Verification is not configured." };

  const recent = await countRecentSends(supabaseUrl, key, phoneE164, 15 * 60 * 1000);
  if (recent >= MAX_SENDS_PER_15_MIN) {
    return { ok: false, error: "Too many codes sent. Please wait a few minutes and try again." };
  }

  const latest = await sbGet(
    supabaseUrl,
    key,
    `/phone_verification_codes?phone_e164=eq.${encodeURIComponent(phoneE164)}` +
      `&verified_at=is.null&order=created_at.desc&limit=1&select=created_at`
  );
  if (Array.isArray(latest) && latest[0]) {
    const lastMs = new Date(latest[0].created_at).getTime();
    if (Date.now() - lastMs < SEND_COOLDOWN_MS) {
      return { ok: false, error: "Please wait a moment before requesting another code." };
    }
  }

  const code = generateOtpCode();
  const codeHash = hashOtp(code, phoneE164);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await sbPost(supabaseUrl, key, "phone_verification_codes", {
    phone_e164: phoneE164,
    code_hash: codeHash,
    expires_at: expiresAt,
    attempts: 0,
    max_attempts: MAX_VERIFY_ATTEMPTS,
  });

  const smsBody = `Mejor Vida Insurance: Your verification code is ${code}. It expires in 10 minutes. Reply STOP to opt out. Reply HELP for help. Msg & data rates may apply.`;
  const sent = await sendTwilioSms(phoneE164, smsBody);
  if (!sent.ok) {
    return { ok: false, error: "We could not send a text message. Please try again later." };
  }

  return { ok: true, phone: phoneE164, display: formatUsPhoneDisplay(phoneE164) };
}

async function verifyOtp(supabaseUrl, key, phoneE164, code) {
  if (!otpSecret()) return { ok: false, error: "Verification is not configured." };
  const trimmed = String(code || "").trim().replace(/\D/g, "");
  if (trimmed.length !== 6) return { ok: false, error: "Enter the 6-digit code from your text message." };

  const rows = await sbGet(
    supabaseUrl,
    key,
    `/phone_verification_codes?phone_e164=eq.${encodeURIComponent(phoneE164)}` +
      `&verified_at=is.null&order=created_at.desc&limit=1&select=id,code_hash,expires_at,attempts,max_attempts`
  );
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) return { ok: false, error: "No active code found. Request a new verification code." };

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "This code has expired. Request a new verification code." };
  }

  if (row.attempts >= (row.max_attempts || MAX_VERIFY_ATTEMPTS)) {
    return { ok: false, error: "Too many attempts. Request a new verification code." };
  }

  const expected = hashOtp(trimmed, phoneE164);
  let match = false;
  try {
    if (
      expected.length === row.code_hash.length &&
      expected.length === 64
    ) {
      match = crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(row.code_hash, "hex"));
    }
  } catch (e) {
    match = false;
  }

  if (!match) {
    await sbPatch(supabaseUrl, key, `/phone_verification_codes?id=eq.${row.id}`, {
      attempts: row.attempts + 1,
    });
    return { ok: false, error: "That code is incorrect. Please try again." };
  }

  await sbPatch(supabaseUrl, key, `/phone_verification_codes?id=eq.${row.id}`, {
    verified_at: new Date().toISOString(),
  });

  return { ok: true, phone: phoneE164, display: formatUsPhoneDisplay(phoneE164) };
}

module.exports = {
  readJsonBody,
  normalizeUsPhoneE164,
  formatUsPhoneDisplay,
  createAndSendOtp,
  verifyOtp,
  OTP_TTL_MS,
};
