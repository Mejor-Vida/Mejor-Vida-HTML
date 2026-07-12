/**
 * Append-only CRM compliance events + consent window helpers.
 */

const CONSENT_CONTACT_DAYS = 30;

function sbHeaders(serviceKey, prefer) {
  const h = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

async function sbFetch(supabaseUrl, serviceKey, path, opts = {}) {
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const res = await fetch(`${base}/rest/v1${path}`, {
    method: opts.method || "GET",
    headers: sbHeaders(serviceKey, opts.prefer),
    body: opts.body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase ${opts.method || "GET"} ${path}: ${res.status} ${text.slice(0, 300)}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function consentExpiresAt(fromIso, days = CONSENT_CONTACT_DAYS) {
  const base = fromIso ? new Date(fromIso) : new Date();
  if (Number.isNaN(base.getTime())) return new Date(Date.now() + days * 86400000).toISOString();
  return new Date(base.getTime() + days * 86400000).toISOString();
}

function isConsentExpired(expiresAt, now = new Date()) {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  if (!Number.isFinite(t)) return false;
  return now.getTime() > t;
}

async function logComplianceEvent(supabaseUrl, serviceKey, opts) {
  const leadId = opts.leadId || opts.lead_id;
  const leadSourceTable = opts.leadSourceTable || opts.lead_source_table;
  if (!leadId || !leadSourceTable) return null;
  const row = {
    lead_id: leadId,
    lead_source_table: leadSourceTable,
    event_type: String(opts.eventType || opts.event_type || "note").slice(0, 80),
    title: opts.title ? String(opts.title).slice(0, 300) : null,
    detail: opts.detail && typeof opts.detail === "object" ? opts.detail : {},
    actor: opts.actor ? String(opts.actor).slice(0, 200) : null,
  };
  try {
    const rows = await sbFetch(supabaseUrl, serviceKey, "/crm_compliance_events", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify(row),
    });
    return Array.isArray(rows) ? rows[0] : rows;
  } catch (e) {
    console.warn("[crm-compliance] log event failed:", e && e.message);
    return null;
  }
}

async function listComplianceEvents(supabaseUrl, serviceKey, leadId, leadSourceTable, limit = 100) {
  const q =
    `/crm_compliance_events?lead_id=eq.${encodeURIComponent(leadId)}` +
    `&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}` +
    `&select=*&order=created_at.desc&limit=${Math.min(Number(limit) || 100, 500)}`;
  return (await sbFetch(supabaseUrl, serviceKey, q)) || [];
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/**
 * Remove partition-level Active Feed suppressions (null source_table/source_id)
 * for an email/phone so a fresh quote/landing submission can resurface.
 * Row-level hides for previously archived source IDs are left intact.
 */
async function clearActiveFeedPartitionHides(supabaseUrl, serviceKey, { email, phone } = {}) {
  const emailKey = String(email || "").trim().toLowerCase();
  const phoneDigits = digitsOnly(phone);
  const phoneLast10 = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;
  const keys = new Set();
  if (emailKey) keys.add(emailKey);
  if (phoneDigits) keys.add(phoneDigits);
  if (phoneLast10) keys.add(phoneLast10);
  if (phoneDigits.length === 11 && phoneDigits.startsWith("1")) keys.add(phoneDigits.slice(1));
  if (phoneLast10.length === 10) keys.add(`1${phoneLast10}`);
  if (!keys.size) return { cleared: 0 };

  let cleared = 0;
  for (const key of keys) {
    const path =
      `/staff_hidden_leads?dedupe_key=eq.${encodeURIComponent(key)}` +
      `&source_table=is.null&source_id=is.null`;
    try {
      await sbFetch(supabaseUrl, serviceKey, path, { method: "DELETE", prefer: "return=minimal" });
      cleared += 1;
    } catch (e) {
      console.warn("[crm-compliance] clear partition hide failed:", key, e && e.message);
    }
  }
  return { cleared, keys: [...keys] };
}

const CONSENT_SCREENSHOT_BUCKET = "consent-proofs";
const MAX_CONSENT_SCREENSHOT_BYTES = 900000;

function parseDataUrlImage(dataUrl) {
  const m = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i.exec(String(dataUrl || ""));
  if (!m) return null;
  const kind = m[1].toLowerCase() === "jpg" ? "jpeg" : m[1].toLowerCase();
  const b64 = m[2].replace(/\s+/g, "");
  let buf;
  try {
    buf = Buffer.from(b64, "base64");
  } catch {
    return null;
  }
  if (!buf || !buf.length || buf.length > MAX_CONSENT_SCREENSHOT_BYTES) return null;
  const ext = kind === "png" ? "png" : kind === "webp" ? "webp" : "jpg";
  const contentType = kind === "png" ? "image/png" : kind === "webp" ? "image/webp" : "image/jpeg";
  return { buf, ext, contentType };
}

async function ensureConsentScreenshotBucket(supabaseUrl, serviceKey) {
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const res = await fetch(`${base}/storage/v1/bucket`, {
    method: "POST",
    headers: sbHeaders(serviceKey),
    body: JSON.stringify({
      id: CONSENT_SCREENSHOT_BUCKET,
      name: CONSENT_SCREENSHOT_BUCKET,
      public: false,
      file_size_limit: MAX_CONSENT_SCREENSHOT_BYTES,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
    }),
  });
  if (res.ok || res.status === 409) return true;
  const text = await res.text();
  // Bucket may already exist under a different conflict shape.
  if (/already exists|duplicate|409/i.test(text)) return true;
  console.warn("[crm-compliance] ensure bucket:", res.status, text.slice(0, 200));
  return false;
}

/**
 * Upload a consent form screenshot (data URL) to private Storage.
 * Returns storage object path (bucket-relative) or null.
 */
async function uploadConsentScreenshot(supabaseUrl, serviceKey, leadId, dataUrl) {
  const parsed = parseDataUrlImage(dataUrl);
  if (!parsed || !leadId) return null;
  await ensureConsentScreenshotBucket(supabaseUrl, serviceKey);
  const safeId = String(leadId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "lead";
  const objectPath = `${safeId}/${Date.now()}.${parsed.ext}`;
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const res = await fetch(
    `${base}/storage/v1/object/${CONSENT_SCREENSHOT_BUCKET}/${objectPath}`,
    {
      method: "POST",
      headers: {
        ...sbHeaders(serviceKey),
        "Content-Type": parsed.contentType,
        "x-upsert": "true",
      },
      body: parsed.buf,
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`consent screenshot upload ${res.status}: ${text.slice(0, 240)}`);
  }
  return objectPath;
}

async function signConsentScreenshotUrl(supabaseUrl, serviceKey, objectPath, expiresSec = 3600) {
  const path = String(objectPath || "").replace(/^\/+/, "");
  if (!path) return null;
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const res = await fetch(
    `${base}/storage/v1/object/sign/${CONSENT_SCREENSHOT_BUCKET}/${path}`,
    {
      method: "POST",
      headers: sbHeaders(serviceKey),
      body: JSON.stringify({ expiresIn: Math.min(Math.max(Number(expiresSec) || 3600, 60), 86400) }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    console.warn("[crm-compliance] sign screenshot:", res.status, text.slice(0, 200));
    return null;
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const signed = data && (data.signedURL || data.signedUrl || data.url);
  if (!signed) return null;
  if (/^https?:\/\//i.test(signed)) return signed;
  return `${base}/storage/v1${signed.startsWith("/") ? "" : "/"}${signed}`;
}

module.exports = {
  CONSENT_CONTACT_DAYS,
  CONSENT_SCREENSHOT_BUCKET,
  consentExpiresAt,
  isConsentExpired,
  logComplianceEvent,
  listComplianceEvents,
  clearActiveFeedPartitionHides,
  uploadConsentScreenshot,
  signConsentScreenshotUrl,
};
