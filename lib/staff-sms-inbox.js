/**
 * Staff SMS inbox (Telnyx +14028441199): logging, email OTP, threads, Web Push, alerts.
 */

const crypto = require("crypto");
const { sendSms, normalizeE164, smsFromNumber } = require("./sms-send");
const { requireStaffAuth } = require("../api/auth-check");
const { wrapResendEmailHtml, LOGO_EN } = require("./resend-email-template");

const SMS_INBOX_EMAILS = ["julie@mejorvidainsurance.com", "admin@mejorvidainsurance.com"];
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const INBOX_URL = "https://www.mejorvidainsurance.com/staff/sms-inbox.html";
const OPEN_INBOX_URL = "https://www.mejorvidainsurance.com/staff/open-sms-inbox.html";

function isSmsInboxEmail(email) {
  return SMS_INBOX_EMAILS.includes(String(email || "").trim().toLowerCase());
}

function ourNumber() {
  return smsFromNumber() || "+14028441199";
}

function threadPhoneFor(direction, fromE164, toE164) {
  const ours = normalizeE164(ourNumber());
  const from = normalizeE164(fromE164);
  const to = normalizeE164(toE164);
  if (direction === "inbound") return from || fromE164;
  if (to && to !== ours) return to;
  if (from && from !== ours) return from;
  return to || from || "";
}

function otpSecret() {
  return (
    process.env.PHONE_VERIFY_OTP_SECRET ||
    process.env.CRON_SECRET ||
    process.env.TELNYX_WEBHOOK_SECRET ||
    ""
  ).trim();
}

function hashOtp(code, email) {
  const secret = otpSecret();
  if (!secret) throw new Error("missing_otp_secret");
  return crypto.createHmac("sha256", secret).update(`${email}:${code}`).digest("hex");
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function sbHeaders(key, prefer) {
  const h = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

function sbBase(url) {
  return `${String(url).replace(/\/$/, "")}/rest/v1`;
}

function servicePair() {
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
  if (!supabaseUrl || !supabaseKey) return null;
  return { supabaseUrl, supabaseKey };
}

async function sbGet(url, key, path) {
  const res = await fetch(`${sbBase(url)}${path}`, { headers: sbHeaders(key) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status} ${text.slice(0, 200)}`);
  return JSON.parse(text || "[]");
}

async function sbPost(url, key, table, row, prefer) {
  const res = await fetch(`${sbBase(url)}/${table}`, {
    method: "POST",
    headers: sbHeaders(key, prefer || "return=representation"),
    body: JSON.stringify(row),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase POST ${table}: ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function sbPatch(url, key, path, data) {
  const res = await fetch(`${sbBase(url)}${path}`, {
    method: "PATCH",
    headers: sbHeaders(key, "return=minimal"),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase PATCH ${path}: ${res.status} ${t.slice(0, 200)}`);
  }
}

async function requireSmsInboxAuth(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return auth;
  if (!isSmsInboxEmail(auth.user.email)) {
    res.status(403).json({ ok: false, error: "Not authorized for SMS inbox." });
    return { valid: false };
  }
  return auth;
}

async function logStaffSmsMessage({
  direction,
  fromE164,
  toE164,
  body,
  telnyxId,
  actorEmail,
  meta,
}) {
  const svc = servicePair();
  if (!svc) return null;
  const from = normalizeE164(fromE164) || String(fromE164 || "").trim();
  const to = normalizeE164(toE164) || String(toE164 || "").trim() || ourNumber();
  const threadPhone = threadPhoneFor(direction, from, to);
  if (!from || !threadPhone) return null;
  try {
    const rows = await sbPost(
      svc.supabaseUrl,
      svc.supabaseKey,
      "staff_sms_messages",
      {
        direction,
        from_e164: from,
        to_e164: to,
        thread_phone: threadPhone,
        body: String(body || ""),
        telnyx_id: telnyxId ? String(telnyxId) : null,
        actor_email: actorEmail || null,
        meta: meta || {},
      },
      "return=representation,resolution=ignore-duplicates"
    );
    return Array.isArray(rows) ? rows[0] : rows;
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    if (/duplicate|23505/i.test(msg)) return null;
    console.error("[staff-sms-inbox] log error:", msg);
    return null;
  }
}

function formatPhoneDisplay(e164) {
  const digits = String(e164 || "").replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return e164 || "";
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

function previewText(body, max) {
  const t = String(body || "").replace(/\s+/g, " ").trim();
  if (t.length <= (max || 80)) return t;
  return `${t.slice(0, max || 80)}…`;
}

async function sendResend({ to, subject, html }) {
  const key = (process.env.RESEND_API_KEY || "").trim();
  if (!key) throw new Error("missing_resend_api_key");
  const recipients = Array.isArray(to) ? to : [to];
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Mejor Vida SMS <julie@mejorvidainsurance.com>",
      to: recipients,
      subject,
      html,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend: ${JSON.stringify(json).slice(0, 300)}`);
  return json;
}

async function sendOtpEmail(email, code) {
  const html = wrapResendEmailHtml(
    `<p>Your Mejor Vida SMS inbox sign-in code is:</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1e3a8a;margin:16px 0;">${code}</p>
<p>This code expires in 10 minutes. If you did not request it, ignore this email.</p>
<p><a href="${OPEN_INBOX_URL}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#1e3a8a;color:#fff;font-weight:bold;text-decoration:none;">Open in Safari</a></p>
<p style="font-size:13px;color:#666;">On iPhone this must open in Safari (compass icon), not Chrome or Gmail. If Chrome opens, tap Open in Safari on the next page.</p>`,
    LOGO_EN
  );
  await sendResend({
    to: email,
    subject: `${code} is your Mejor Vida SMS sign-in code`,
    html,
  });
}

async function requestInboxOtp(emailRaw) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!isSmsInboxEmail(email)) {
    return { ok: true };
  }
  const svc = servicePair();
  if (!svc) return { ok: false, error: "Inbox is not configured." };
  if (!otpSecret()) return { ok: false, error: "Inbox login is not configured." };

  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const recent = await sbGet(
    svc.supabaseUrl,
    svc.supabaseKey,
    `/staff_sms_otp_codes?email=eq.${encodeURIComponent(email)}&created_at=gte.${encodeURIComponent(
      since
    )}&select=id`
  );
  if (Array.isArray(recent) && recent.length >= 5) {
    return { ok: false, error: "Too many codes sent. Wait a few minutes and try again." };
  }

  const latest = await sbGet(
    svc.supabaseUrl,
    svc.supabaseKey,
    `/staff_sms_otp_codes?email=eq.${encodeURIComponent(
      email
    )}&verified_at=is.null&order=created_at.desc&limit=1&select=created_at`
  );
  if (Array.isArray(latest) && latest[0]) {
    const lastMs = new Date(latest[0].created_at).getTime();
    if (Date.now() - lastMs < 60 * 1000) {
      return { ok: false, error: "Please wait a moment before requesting another code." };
    }
  }

  const code = generateOtpCode();
  await sbPost(svc.supabaseUrl, svc.supabaseKey, "staff_sms_otp_codes", {
    email,
    code_hash: hashOtp(code, email),
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    attempts: 0,
    max_attempts: MAX_VERIFY_ATTEMPTS,
  });
  await sendOtpEmail(email, code);
  return { ok: true };
}

async function generateMagicLink(supabaseUrl, serviceKey, email) {
  const linkRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "magiclink", email }),
  });
  const linkJson = await linkRes.json().catch(() => ({}));
  return { ok: linkRes.ok, status: linkRes.status, json: linkJson };
}

async function createAuthUser(supabaseUrl, serviceKey, email) {
  const created = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      email_confirm: true,
      user_metadata: { sms_inbox: true },
    }),
  });
  const createdJson = await created.json().catch(() => ({}));
  if (!created.ok && created.status !== 422) {
    throw new Error(`create user: ${created.status} ${JSON.stringify(createdJson).slice(0, 200)}`);
  }
}

async function createSessionForEmail(email) {
  const svc = servicePair();
  if (!svc) throw new Error("missing_supabase");

  let link = await generateMagicLink(svc.supabaseUrl, svc.supabaseKey, email);
  if (!link.ok) {
    await createAuthUser(svc.supabaseUrl, svc.supabaseKey, email);
    link = await generateMagicLink(svc.supabaseUrl, svc.supabaseKey, email);
  }
  if (!link.ok) {
    throw new Error(`generate_link: ${link.status} ${JSON.stringify(link.json).slice(0, 200)}`);
  }
  const hashed =
    link.json.hashed_token ||
    (link.json.properties && link.json.properties.hashed_token) ||
    "";
  if (!hashed) throw new Error("generate_link missing hashed_token");

  const verifyRes = await fetch(`${svc.supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: {
      apikey: svc.supabaseKey,
      Authorization: `Bearer ${svc.supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "magiclink", token_hash: hashed }),
  });
  const verifyJson = await verifyRes.json().catch(() => ({}));
  if (!verifyRes.ok) {
    throw new Error(`verify: ${verifyRes.status} ${JSON.stringify(verifyJson).slice(0, 200)}`);
  }
  const access =
    verifyJson.access_token ||
    (verifyJson.session && verifyJson.session.access_token) ||
    (verifyJson.data && verifyJson.data.access_token) ||
    (verifyJson.data && verifyJson.data.session && verifyJson.data.session.access_token);
  const refresh =
    verifyJson.refresh_token ||
    (verifyJson.session && verifyJson.session.refresh_token) ||
    (verifyJson.data && verifyJson.data.refresh_token) ||
    (verifyJson.data && verifyJson.data.session && verifyJson.data.session.refresh_token);
  if (!access || !refresh) throw new Error("verify missing session tokens");
  return {
    access_token: access,
    refresh_token: refresh,
    expires_in: verifyJson.expires_in || 3600,
    token_type: "bearer",
    user: {
      email,
      id: (verifyJson.user && verifyJson.user.id) || "",
    },
  };
}

async function verifyInboxOtp(emailRaw, codeRaw) {
  const email = String(emailRaw || "").trim().toLowerCase();
  const code = String(codeRaw || "").trim().replace(/\D/g, "");
  if (!isSmsInboxEmail(email)) {
    return { ok: false, error: "That email is not authorized." };
  }
  if (code.length !== 6) return { ok: false, error: "Enter the 6-digit code from your email." };
  const svc = servicePair();
  if (!svc) return { ok: false, error: "Inbox is not configured." };
  if (!otpSecret()) return { ok: false, error: "Inbox login is not configured." };

  const rows = await sbGet(
    svc.supabaseUrl,
    svc.supabaseKey,
    `/staff_sms_otp_codes?email=eq.${encodeURIComponent(
      email
    )}&verified_at=is.null&order=created_at.desc&limit=1&select=id,code_hash,expires_at,attempts,max_attempts`
  );
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) return { ok: false, error: "No active code found. Request a new code." };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "This code has expired. Request a new code." };
  }
  if (row.attempts >= (row.max_attempts || MAX_VERIFY_ATTEMPTS)) {
    return { ok: false, error: "Too many attempts. Request a new code." };
  }

  const expected = hashOtp(code, email);
  let match = false;
  try {
    if (expected.length === row.code_hash.length && expected.length === 64) {
      match = crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(row.code_hash, "hex"));
    }
  } catch (_) {
    match = false;
  }
  if (!match) {
    await sbPatch(svc.supabaseUrl, svc.supabaseKey, `/staff_sms_otp_codes?id=eq.${row.id}`, {
      attempts: row.attempts + 1,
    });
    return { ok: false, error: "That code is incorrect. Please try again." };
  }

  const session = await createSessionForEmail(email);
  await sbPatch(svc.supabaseUrl, svc.supabaseKey, `/staff_sms_otp_codes?id=eq.${row.id}`, {
    verified_at: new Date().toISOString(),
  });
  return { ok: true, session };
}

async function listThreads() {
  const svc = servicePair();
  if (!svc) throw new Error("missing_supabase");
  const rows = await sbGet(
    svc.supabaseUrl,
    svc.supabaseKey,
    `/staff_sms_messages?select=id,direction,from_e164,to_e164,thread_phone,body,created_at&order=created_at.desc&limit=400`
  );
  const map = new Map();
  (rows || []).forEach((row) => {
    const phone = row.thread_phone;
    if (!phone || map.has(phone)) return;
    map.set(phone, {
      phone,
      display: formatPhoneDisplay(phone),
      lastBody: row.body,
      lastDirection: row.direction,
      lastAt: row.created_at,
    });
  });
  return Array.from(map.values());
}

async function listMessages(phoneRaw) {
  const phone = normalizeE164(phoneRaw);
  if (!phone) return [];
  const svc = servicePair();
  if (!svc) throw new Error("missing_supabase");
  return sbGet(
    svc.supabaseUrl,
    svc.supabaseKey,
    `/staff_sms_messages?thread_phone=eq.${encodeURIComponent(
      phone
    )}&select=id,direction,from_e164,to_e164,thread_phone,body,created_at,actor_email&order=created_at.asc&limit=200`
  );
}

async function sendInboxSms({ toPhone, body, actorEmail }) {
  const to = normalizeE164(toPhone);
  const text = String(body || "").trim();
  if (!to) return { ok: false, error: "Enter a valid mobile number." };
  if (!text) return { ok: false, error: "Enter a message." };
  if (text.length > 1600) return { ok: false, error: "Message is too long (max 1600 characters)." };
  const sent = await sendSms({ to, body: text });
  if (!sent.ok) {
    return {
      ok: false,
      error: sent.message || sent.reason || "Could not send the text.",
    };
  }
  await logStaffSmsMessage({
    direction: "outbound",
    fromE164: sent.from || ourNumber(),
    toE164: to,
    body: text,
    telnyxId: sent.sid || null,
    actorEmail: actorEmail || null,
    meta: { source: "staff_sms_inbox" },
  });
  return { ok: true, sid: sent.sid || null, to };
}

function vapidConfig() {
  const publicKey = (process.env.VAPID_PUBLIC_KEY || "").trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();
  const subject = (process.env.VAPID_SUBJECT || "mailto:admin@mejorvidainsurance.com").trim();
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

async function savePushSubscription(email, subscription, userAgent) {
  const svc = servicePair();
  if (!svc) throw new Error("missing_supabase");
  const keys = (subscription && subscription.keys) || {};
  const endpoint = String((subscription && subscription.endpoint) || "").trim();
  const p256dh = String(keys.p256dh || "").trim();
  const auth = String(keys.auth || "").trim();
  if (!endpoint || !p256dh || !auth) throw new Error("invalid_subscription");
  const existing = await sbGet(
    svc.supabaseUrl,
    svc.supabaseKey,
    `/staff_sms_push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}&select=id&limit=1`
  );
  if (Array.isArray(existing) && existing[0]) {
    await sbPatch(
      svc.supabaseUrl,
      svc.supabaseKey,
      `/staff_sms_push_subscriptions?id=eq.${existing[0].id}`,
      {
        email,
        p256dh,
        auth,
        user_agent: userAgent || null,
        updated_at: new Date().toISOString(),
      }
    );
    return { ok: true, updated: true };
  }
  await sbPost(svc.supabaseUrl, svc.supabaseKey, "staff_sms_push_subscriptions", {
    email,
    endpoint,
    p256dh,
    auth,
    user_agent: userAgent || null,
  });
  return { ok: true };
}

async function notifyInboxPush({ title, body, phone, email }) {
  const vapid = vapidConfig();
  if (!vapid) return { sent: 0, skipped: "missing_vapid" };
  let webpush;
  try {
    webpush = require("web-push");
  } catch (e) {
    console.warn("[staff-sms-inbox] web-push not installed");
    return { sent: 0, skipped: "missing_module" };
  }
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  const svc = servicePair();
  if (!svc) return { sent: 0, skipped: "missing_supabase" };
  let query = `/staff_sms_push_subscriptions?select=id,endpoint,p256dh,auth`;
  if (email) query += `&email=eq.${encodeURIComponent(email)}`;
  const rows = await sbGet(svc.supabaseUrl, svc.supabaseKey, query);
  const payload = JSON.stringify({
    title: title || "New text message",
    body: body || "",
    phone: phone || "",
    url: phone ? `${INBOX_URL}?phone=${encodeURIComponent(phone)}` : INBOX_URL,
  });
  let sent = 0;
  for (const row of rows || []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        payload,
        { TTL: 86400, urgency: "high" }
      );
      sent += 1;
    } catch (err) {
      const status = err && (err.statusCode || err.status);
      console.warn("[staff-sms-inbox] push failed", status || (err && err.message));
      if (status === 404 || status === 410) {
        try {
          await fetch(
            `${sbBase(svc.supabaseUrl)}/staff_sms_push_subscriptions?id=eq.${encodeURIComponent(row.id)}`,
            {
              method: "DELETE",
              headers: sbHeaders(svc.supabaseKey),
            }
          );
        } catch (_) {
          /* ignore */
        }
      }
    }
  }
  return { sent };
}

async function sendInstallEmail() {
  const html = wrapResendEmailHtml(
    `<p>Your Mejor Vida SMS inbox is ready. On iPhone this must open in <strong>Safari</strong> (the compass icon), not Chrome or Gmail.</p>
<p style="text-align:center;padding:8px 0 20px;"><a href="${OPEN_INBOX_URL}" style="display:inline-block;padding:14px 28px;border-radius:8px;background:#1e3a8a;color:#fff;font-weight:bold;text-decoration:none;">Open in Safari</a></p>
<ol>
<li>Tap the button. If Chrome or Gmail opens, tap <strong>Open in Safari</strong> on the next screen.</li>
<li>Sign in with julie@ or admin@. We email a 6-digit code.</li>
<li>In Safari, tap Share → <strong>Add to Home Screen</strong>.</li>
<li>Open the new icon and allow notifications.</li>
</ol>
<p>You stay signed in until you tap Log out. Keep Face ID / a passcode on the phone.</p>
<p>Do not search the App Store for this — it only lives at mejorvidainsurance.com.</p>`,
    LOGO_EN
  );
  await sendResend({
    to: SMS_INBOX_EMAILS,
    subject: "Add the Mejor Vida SMS app to your iPhone",
    html,
  });
  return { ok: true, to: SMS_INBOX_EMAILS, url: OPEN_INBOX_URL };
}

module.exports = {
  SMS_INBOX_EMAILS,
  INBOX_URL,
  OPEN_INBOX_URL,
  isSmsInboxEmail,
  ourNumber,
  formatPhoneDisplay,
  previewText,
  requireSmsInboxAuth,
  logStaffSmsMessage,
  requestInboxOtp,
  verifyInboxOtp,
  listThreads,
  listMessages,
  sendInboxSms,
  vapidConfig,
  savePushSubscription,
  notifyInboxPush,
  sendInstallEmail,
};
