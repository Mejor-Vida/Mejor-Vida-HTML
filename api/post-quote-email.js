/**
 * POST /api/post-quote-email
 * Sends the immediate post-quote email right after the MVI Chatflow
 * generates a quote (and optionally schedules a call).
 *
 * Called from ManyChat via External Request action.
 *
 * Body (ManyChat sends):
 *   phone            (recommended; used if contact_id / subscriber not supplied)
 *   contact_id       (optional) Supabase contacts.id — preferred when ManyChat can pass it
 *   manychat_subscriber_id / subscriber_id (optional) — matches contacts row
 *   language         'english' | 'spanish'
 *   first_name       Display only — recipient email always comes from Supabase contacts.email
 *   quote_low        Lower bound of quote range (e.g. "28")
 *   quote_high       Upper bound of quote range (e.g. "45")
 *   quote_status     'ok' | 'out_of_range' (optional; from ManyChat after /api/quote)
 *   quote_error      Error text from /api/quote when out_of_range (optional)
 *   age | edad       Lead age (optional; falls back to lead_state.age, then ManyChat pull)
 *   call_scheduled   'true' | 'false' — did they book a call?
 *                      When true, send is skipped (HubSpot admin@ sends confirmation).
 *   call_datetime    ISO datetime of scheduled call (optional)
 *
 * Never uses an email address from the webhook body — only contacts.email after DB lookup.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      RESEND_API_KEY, MANYCHAT_WEBHOOK_SECRET, MANYCHAT_API_KEY (optional pull fallback)
 */

const { verifyManychatSecret } = require('../lib/manychat-auth');
const { hubspotPhoneSearchVariants, phoneLast10Digits } = require('../lib/hubspot-phone-variants');
const path = require('path');
const fs = require('fs');
const {
  buildEmailEN,
  buildEmailES,
  buildOverAgeEmailEN,
  buildOverAgeEmailES,
} = require('../lib/post-quote-email-html');
const { MIN_QUOTE_AGE, MAX_QUOTE_AGE } = require('../lib/quote-range-router');
const { logContactCommunication, htmlToPlain } = require('../lib/contact-communications');
const { fetchManychatSubscriber, _internal: manychatInternal } = require('../lib/manychat-pull');

const { parseLanguage } = manychatInternal;

/** ManyChat sends "{{field}}" or "${{cuf_…}}" literally when mapping is wrong. */
function cleanWebhookField(val) {
  const t = String(val ?? '').trim();
  if (!t) return '';
  if (/^\{\{[\s\S]*\}\}$/.test(t)) return '';
  if (/^\$\{\{[\s\S]*\}\}$/.test(t)) return '';
  return t;
}

function parseAge(val) {
  if (val == null || val === '') return null;
  const n = parseInt(String(val).replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) && n > 0 && n < 130 ? n : null;
}

function isOverMaxQuoteAge(age) {
  return age != null && age > MAX_QUOTE_AGE;
}

function quoteErrorIndicatesOverMaxAge(quoteError) {
  const err = cleanWebhookField(quoteError).toLowerCase();
  if (!err) return false;
  return /up to age 85|through age 85|available up to age 85|hasta los 85|hasta la edad de 85|m[aá]ximo.*85/.test(err);
}

function quoteErrorIndicatesUnderMinAge(quoteError) {
  const err = cleanWebhookField(quoteError).toLowerCase();
  if (!err) return false;
  return /starting at age 18|from age 18|desde los 18|m[ií]nimo.*18/.test(err);
}

/** True when the lead is over our automated quote max (85) — not merely missing quote fields. */
function shouldUseOverAgeEmail({ age, quoteStatus, quoteError, quoteLow, quoteHigh }) {
  if (isOverMaxQuoteAge(age)) return true;

  if (age != null && age < MIN_QUOTE_AGE) return false;
  if (quoteErrorIndicatesUnderMinAge(quoteError)) return false;

  const status = cleanWebhookField(quoteStatus).toLowerCase();
  if (status === 'out_of_range') {
    if (isOverMaxQuoteAge(age)) return true;
    if (quoteErrorIndicatesOverMaxAge(quoteError)) return true;
    // Quote API returned out_of_range with empty dollars — typical for age 86+ in WhatsApp flow.
    if (!quoteLow && !quoteHigh && !quoteErrorIndicatesUnderMinAge(quoteError)) return true;
  }

  return false;
}

function resolveEmailLanguage(body, contactRow) {
  const fromContact = parseLanguage(
    (contactRow && (contactRow.idioma || contactRow.language)) || '',
  );
  if (fromContact) return fromContact;
  return parseLanguage(body.language) || 'spanish';
}

/** Base64 vCard — same bytes as project root julie.vcf (for Resend attachment). */
const JULIE_VCF_CONTENT = fs.readFileSync(path.join(__dirname, '..', 'julie.vcf'), 'utf8');
const JULIE_VCF_BASE64 = Buffer.from(JULIE_VCF_CONTENT, 'utf8').toString('base64');

const CONTACT_SELECT =
  'id,email,phone,first_name,last_name,full_name,language,idioma,vcf_sent_at,manychat_subscriber_id,whatsapp_id';

const POST_QUOTE_PHASE = 0;
const POST_QUOTE_STEP = 1;

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
}

function readBody(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body && typeof req.body === 'object' ? req.body : {};
}

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ''));
}

/** Non-empty trimmed email from contacts row only. */
function emailFromContactRow(row) {
  const em = String((row && row.email) || '').trim();
  if (!em || !em.includes('@')) return null;
  return em;
}

async function restContacts(base, key, query) {
  const r = await fetch(`${base}/rest/v1/contacts?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await r.text();
  let rows;
  try {
    rows = JSON.parse(text);
  } catch {
    rows = [];
  }
  if (!r.ok) {
    console.error('[post-quote-email] Supabase contacts error:', r.status, text.slice(0, 400));
    throw new Error(`Supabase contacts ${r.status}`);
  }
  return Array.isArray(rows) ? rows : [];
}

/**
 * Resolve canonical contacts row. Never uses body.email.
 * Order: contact_id → subscriber id → phone string variants (unique by id) → phone_last_10 (exactly one row).
 */
async function resolveContact(base, key, body, phone) {
  const byId = new Map();

  const pushRows = (rows) => {
    for (const row of rows) {
      if (row && row.id) byId.set(String(row.id), row);
    }
  };

  const cid = String(body.contact_id || body.contactId || '').trim();
  if (isUuid(cid)) {
    const rows = await restContacts(
      base,
      key,
      `id=eq.${encodeURIComponent(cid)}&select=${CONTACT_SELECT}&limit=1`,
    );
    if (rows[0]) return { contact: rows[0], reason: null };
  }

  const sub = String(
    body.manychat_subscriber_id || body.subscriber_id || body.subscriberId || '',
  ).trim();
  if (sub) {
    const enc = encodeURIComponent(sub);
    const rows = await restContacts(
      base,
      key,
      `or=(manychat_subscriber_id.eq.${enc},whatsapp_id.eq.${enc})&select=${CONTACT_SELECT}&limit=10`,
    );
    if (rows.length > 1) return { contact: null, reason: 'ambiguous_subscriber' };
    if (rows.length === 1) return { contact: rows[0], reason: null };
  }

  if (phone) {
    const variants = hubspotPhoneSearchVariants(phone);
    for (const v of variants) {
      const rows = await restContacts(
        base,
        key,
        `phone=eq.${encodeURIComponent(v)}&select=${CONTACT_SELECT}&limit=1`,
      );
      pushRows(rows);
    }
    if (byId.size > 1) return { contact: null, reason: 'ambiguous_phone_variants' };
    if (byId.size === 1) return { contact: [...byId.values()][0], reason: null };

    const last10 = phoneLast10Digits(phone);
    if (last10 && last10.length === 10) {
      const rows = await restContacts(
        base,
        key,
        `phone_last_10=eq.${encodeURIComponent(last10)}&select=${CONTACT_SELECT}&limit=10`,
      );
      if (rows.length > 1) return { contact: null, reason: 'ambiguous_phone_last_10' };
      if (rows.length === 1) return { contact: rows[0], reason: null };
    }
  }

  return { contact: null, reason: 'contact_not_found' };
}

async function leadStateHasScheduledCall(base, key, contactId) {
  if (!contactId) return false;
  try {
    const r = await fetch(
      `${base}/rest/v1/lead_state?contact_id=eq.${encodeURIComponent(contactId)}&select=call_scheduled_at&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!r.ok) return false;
    const rows = await r.json();
    const at = rows && rows[0] && rows[0].call_scheduled_at;
    return Boolean(at && String(at).trim());
  } catch {
    return false;
  }
}

async function fetchLeadStateFields(base, key, contactId) {
  if (!contactId) return { quoteLow: '', quoteHigh: '', age: null };
  try {
    const r = await fetch(
      `${base}/rest/v1/lead_state?contact_id=eq.${encodeURIComponent(contactId)}&select=quote_low,quote_high,age&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!r.ok) return { quoteLow: '', quoteHigh: '', age: null };
    const rows = await r.json();
    const row = rows && rows[0];
    return {
      quoteLow: cleanWebhookField(row && row.quote_low),
      quoteHigh: cleanWebhookField(row && row.quote_high),
      age: parseAge(row && row.age),
    };
  } catch {
    return { quoteLow: '', quoteHigh: '', age: null };
  }
}

async function pullManychatQuoteSignals(body, contactRow) {
  const apiKey = process.env.MANYCHAT_API_KEY;
  if (!apiKey) return null;

  const subId = String(
    body.manychat_subscriber_id
      || body.subscriber_id
      || body.subscriberId
      || (contactRow && contactRow.manychat_subscriber_id)
      || (contactRow && contactRow.whatsapp_id)
      || '',
  ).trim();
  if (!subId) return null;

  try {
    const pulled = await fetchManychatSubscriber(subId, { apiKey });
    if (!pulled.ok || !pulled.normalized) {
      console.warn('[post-quote-email] ManyChat pull skipped:', pulled.error || 'no data');
      return null;
    }
    return pulled.normalized;
  } catch (err) {
    console.warn('[post-quote-email] ManyChat pull failed:', (err && err.message) || err);
    return null;
  }
}

async function resolveQuoteSignals(body, contactRow, leadStateFields) {
  let age = parseAge(body.age || body.edad);
  let quoteStatus = cleanWebhookField(body.quote_status || body.quoteStatus);
  let quoteError = cleanWebhookField(body.quote_error || body.quoteError);
  let quoteLow = cleanWebhookField(body.quote_low || body.quoteLow);
  let quoteHigh = cleanWebhookField(body.quote_high || body.quoteHigh);

  if (age == null) age = leadStateFields.age;
  if (!quoteLow) quoteLow = leadStateFields.quoteLow;
  if (!quoteHigh) quoteHigh = leadStateFields.quoteHigh;

  const needsPull =
    age == null
    || !quoteStatus
    || (!quoteLow && !quoteHigh && !quoteError);

  if (needsPull) {
    const pulled = await pullManychatQuoteSignals(body, contactRow);
    if (pulled) {
      if (age == null && pulled.age != null) age = pulled.age;
      if (!quoteStatus && pulled.quote_status) quoteStatus = cleanWebhookField(pulled.quote_status);
      if (!quoteError && pulled.quote_error) quoteError = cleanWebhookField(pulled.quote_error);
      if (!quoteLow && pulled.quote_low) quoteLow = cleanWebhookField(pulled.quote_low);
      if (!quoteHigh && pulled.quote_high) quoteHigh = cleanWebhookField(pulled.quote_high);
    }
  }

  return { age, quoteStatus, quoteError, quoteLow, quoteHigh };
}

async function insertPostQuoteDeliveryLog(base, key, contactId, status, opts = {}) {
  const payload = {
    contact_id: contactId,
    channel: 'email',
    phase: POST_QUOTE_PHASE,
    step: POST_QUOTE_STEP,
    provider_id: opts.provider_id || null,
    status,
    error: opts.error ? String(opts.error).slice(0, 2000) : null,
    sent_at: opts.sent_at || new Date().toISOString(),
    reason: opts.reason ? String(opts.reason).slice(0, 500) : null,
  };
  try {
    const ins = await fetch(`${base}/rest/v1/nurture_delivery_log`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
    if (!ins.ok) {
      const t = await ins.text();
      console.warn('[post-quote-email] nurture_delivery_log rejected:', ins.status, t.slice(0, 300));
    }
  } catch (e) {
    console.warn('[post-quote-email] nurture_delivery_log insert failed:', (e && e.message) || e);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) return json(res, auth.status, { ok: false, error: auth.error });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!supabaseUrl || !supabaseKey || !resendKey) {
    return json(res, 500, { ok: false, error: 'Missing env vars' });
  }

  let body;
  try {
    body = readBody(req);
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid JSON' });
  }

  const phone = String(body.phone || '').trim();
  let firstName = String(body.first_name || body.firstName || '').trim();
  let quoteLow = cleanWebhookField(body.quote_low || body.quoteLow);
  let quoteHigh = cleanWebhookField(body.quote_high || body.quoteHigh);
  const callScheduled = body.call_scheduled === 'true' || body.call_scheduled === true;
  const callDatetime = String(body.call_datetime || '').trim() || null;
  if (callScheduled) {
    console.log('[post-quote-email] skipped — call scheduled; HubSpot sends client confirmation');
    return json(res, 200, {
      ok: true,
      skipped: true,
      reason: 'call_scheduled_hubspot_confirmation',
    });
  }

  const hasContactKey =
    isUuid(String(body.contact_id || body.contactId || '').trim())
    || String(
      body.manychat_subscriber_id || body.subscriber_id || body.subscriberId || '',
    ).trim();

  if (!phone && !hasContactKey) {
    return json(res, 400, { ok: false, error: 'phone, contact_id, or subscriber id is required' });
  }

  const base = supabaseUrl.replace(/\/$/, '');

  let resolved;
  try {
    resolved = await resolveContact(base, supabaseKey, body, phone);
  } catch (err) {
    console.error('[post-quote-email] Supabase lookup error:', err.message);
    return json(res, 500, { ok: false, error: 'Database error', detail: err.message });
  }

  const { contact: contactRow, reason: resolveReason } = resolved;

  if (!contactRow) {
    console.warn(
      `[post-quote-email] No contact resolved (${resolveReason || 'unknown'}), phone=${phone ? `${phone.slice(0, 8)}…` : '(none)'}`,
    );
    return json(res, 200, {
      ok: false,
      reason: resolveReason || 'contact_not_found',
      message: 'Could not match Supabase contact — not sending',
    });
  }

  const contactId = contactRow.id;
  const email = emailFromContactRow(contactRow);

  // HubSpot admin@ sends client confirmation after booking. Never duplicate with julie@ Resend.
  if (await leadStateHasScheduledCall(base, supabaseKey, contactId)) {
    console.log(
      `[post-quote-email] skipped — contact ${contactId} already has call_scheduled_at`,
    );
    return json(res, 200, {
      ok: true,
      skipped: true,
      reason: 'call_already_scheduled_hubspot_confirmation',
      contact_id: contactId,
    });
  }

  if (!firstName) {
    firstName =
      String(contactRow.first_name || '').trim()
      || (contactRow.full_name ? String(contactRow.full_name).split(' ')[0] : '')
      || '';
  }
  if (!firstName) firstName = 'there';

  const language = resolveEmailLanguage(body, contactRow);

  const leadStateFields = await fetchLeadStateFields(base, supabaseKey, contactId);
  const quoteSignals = await resolveQuoteSignals(body, contactRow, leadStateFields);
  quoteLow = quoteSignals.quoteLow;
  quoteHigh = quoteSignals.quoteHigh;

  const useOverAgeEmail = shouldUseOverAgeEmail(quoteSignals);
  const emailVariant = useOverAgeEmail ? 'over_age' : 'post_quote';

  console.log(
    `[post-quote-email] quote signals contact=${contactId} age=${quoteSignals.age ?? 'null'} status=${quoteSignals.quoteStatus || '(none)'} variant=${emailVariant}`,
  );

  if (!email) {
    console.warn(`[post-quote-email] contacts.email missing for contact ${contactId} — not sending`);
    await insertPostQuoteDeliveryLog(base, supabaseKey, contactId, 'failed', {
      error: 'contacts.email missing or invalid',
      reason: 'no_email',
    });
    return json(res, 200, {
      ok: false,
      reason: 'no_email',
      message: 'No email on file — skipping post-quote email',
      contact_id: contactId,
    });
  }

  let subject;
  let html;
  if (useOverAgeEmail) {
    const built =
      language === 'spanish'
        ? buildOverAgeEmailES(firstName, callScheduled, callDatetime)
        : buildOverAgeEmailEN(firstName, callScheduled, callDatetime);
    subject = built.subject;
    html = built.html;
  } else {
    const built =
      language === 'spanish'
        ? buildEmailES(firstName, quoteLow, quoteHigh, callScheduled, callDatetime)
        : buildEmailEN(firstName, quoteLow, quoteHigh, callScheduled, callDatetime);
    subject = built.subject;
    html = built.html;
  }

  let emailId;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>',
        to: email,
        subject,
        html,
        attachments: [
          {
            filename: 'Julie-Mejor-Vida-Insurance.vcf',
            content: JULIE_VCF_BASE64,
            content_type: 'text/vcard',
          },
        ],
      }),
    });
    const result = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(result));
    emailId = result.id;
    console.log(
      `[post-quote-email] Sent to ${email} (contact ${contactId}, lang=${language}, variant=${emailVariant}), id: ${emailId}`,
    );
    await insertPostQuoteDeliveryLog(base, supabaseKey, contactId, 'sent', {
      provider_id: emailId || null,
    });
    await logContactCommunication(supabaseUrl, supabaseKey, {
      contactId,
      direction: 'outbound',
      channel: 'email',
      subject,
      summary: subject,
      body: htmlToPlain(html),
      meta: {
        source: 'post_quote_email',
        email_variant: emailVariant,
        provider_id: emailId || null,
      },
    });
  } catch (err) {
    const detail = err.message || String(err);
    console.error('[post-quote-email] Resend error:', detail);
    await insertPostQuoteDeliveryLog(base, supabaseKey, contactId, 'failed', {
      error: detail,
      reason: 'resend_error',
    });
    return json(res, 500, { ok: false, error: 'Failed to send email', detail });
  }

  try {
    await fetch(`${base}/rest/v1/contacts?id=eq.${encodeURIComponent(contactId)}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ vcf_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    });
  } catch (err) {
    console.error('[post-quote-email] vcf_sent_at update error:', err.message);
  }

  return json(res, 200, {
    ok: true,
    email_id: emailId,
    to: email,
    contact_id: contactId,
    email_variant: emailVariant,
  });
};
