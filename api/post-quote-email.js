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
 *   call_scheduled   'true' | 'false' — did they book a call?
 *   call_datetime    ISO datetime of scheduled call (optional)
 *
 * Never uses an email address from the webhook body — only contacts.email after DB lookup.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      RESEND_API_KEY, MANYCHAT_WEBHOOK_SECRET
 */

const { verifyManychatSecret } = require('../lib/manychat-auth');
const { hubspotPhoneSearchVariants, phoneLast10Digits } = require('../lib/hubspot-phone-variants');
const path = require('path');
const fs = require('fs');
const { buildEmailEN, buildEmailES } = require('../lib/post-quote-email-html');

/** Base64 vCard — same bytes as project root julie.vcf (for Resend attachment). */
const JULIE_VCF_CONTENT = fs.readFileSync(path.join(__dirname, '..', 'julie.vcf'), 'utf8');
const JULIE_VCF_BASE64 = Buffer.from(JULIE_VCF_CONTENT, 'utf8').toString('base64');

const CONTACT_SELECT =
  'id,email,phone,first_name,last_name,full_name,vcf_sent_at,manychat_subscriber_id,whatsapp_id';

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
  const language = String(body.language || 'spanish').trim().toLowerCase();
  let firstName = String(body.first_name || body.firstName || '').trim();
  const quoteLow = String(body.quote_low || '').trim();
  const quoteHigh = String(body.quote_high || '').trim();
  const callScheduled = body.call_scheduled === 'true' || body.call_scheduled === true;
  const callDatetime = String(body.call_datetime || '').trim() || null;

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

  if (!firstName) {
    firstName =
      String(contactRow.first_name || '').trim()
      || (contactRow.full_name ? String(contactRow.full_name).split(' ')[0] : '')
      || '';
  }
  if (!firstName) firstName = 'there';

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

  const { subject, html } =
    language === 'spanish'
      ? buildEmailES(firstName, quoteLow, quoteHigh, callScheduled, callDatetime)
      : buildEmailEN(firstName, quoteLow, quoteHigh, callScheduled, callDatetime);

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
    console.log(`[post-quote-email] Sent to ${email} (contact ${contactId}), id: ${emailId}`);
    await insertPostQuoteDeliveryLog(base, supabaseKey, contactId, 'sent', {
      provider_id: emailId || null,
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

  return json(res, 200, { ok: true, email_id: emailId, to: email, contact_id: contactId });
};
