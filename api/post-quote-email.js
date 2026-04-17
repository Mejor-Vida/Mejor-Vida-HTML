/**
 * POST /api/post-quote-email
 * Sends the immediate post-quote email right after the MVI Chatflow
 * generates a quote (and optionally schedules a call).
 *
 * Called from ManyChat via External Request action.
 *
 * Body (ManyChat sends):
 *   phone            (required)
 *   language         'english' | 'spanish'
 *   first_name       Contact's first name
 *   quote_low        Lower bound of quote range (e.g. "28")
 *   quote_high       Upper bound of quote range (e.g. "45")
 *   call_scheduled   'true' | 'false' — did they book a call?
 *   call_datetime    ISO datetime of scheduled call (optional)
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      RESEND_API_KEY, MANYCHAT_WEBHOOK_SECRET
 *
 * Local preview (open HTML in browser — same layout as sent email):
 *   node scripts/preview-post-quote-email.js
 *   → email-previews/post-quote-email-en.html and ...-es.html
 *
 * Shared Resend HTML shell (header, footer, Julie signature): lib/resend-email-template.js
 */

const { verifyManychatSecret } = require('../lib/manychat-auth');
const path = require('path');
const fs = require('fs');
const { buildEmailEN, buildEmailES } = require('../lib/post-quote-email-html');

/** Base64 vCard — same bytes as project root julie.vcf (for Resend attachment). */
const JULIE_VCF_CONTENT = fs.readFileSync(path.join(__dirname, '..', 'julie.vcf'), 'utf8');
const JULIE_VCF_BASE64 = Buffer.from(JULIE_VCF_CONTENT, 'utf8').toString('base64');

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
}

function readBody(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body && typeof req.body === 'object' ? req.body : {};
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
  const resendKey   = process.env.RESEND_API_KEY;
  if (!supabaseUrl || !supabaseKey || !resendKey) {
    return json(res, 500, { ok: false, error: 'Missing env vars' });
  }

  let body;
  try { body = readBody(req); } catch { return json(res, 400, { ok: false, error: 'Invalid JSON' }); }

  const phone         = String(body.phone || '').trim();
  const language      = String(body.language || 'spanish').trim().toLowerCase();
  let firstName       = String(body.first_name || body.firstName || '').trim();
  const quoteLow      = String(body.quote_low || '').trim();
  const quoteHigh     = String(body.quote_high || '').trim();
  const callScheduled = body.call_scheduled === 'true' || body.call_scheduled === true;
  const callDatetime  = String(body.call_datetime || '').trim() || null;

  if (!phone) return json(res, 400, { ok: false, error: 'phone is required' });

  // Look up contact email in Supabase
  let email = null;
  try {
    const base = supabaseUrl.replace(/\/$/, '');
    const r = await fetch(`${base}/rest/v1/contacts?phone=eq.${encodeURIComponent(phone)}&select=id,email,first_name,last_name,full_name,vcf_sent_at&limit=1`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const rows = await r.json();
    if (rows?.[0]?.email) email = rows[0].email;
    if (!firstName) {
      firstName = rows?.[0]?.first_name
        || (rows?.[0]?.full_name ? rows[0].full_name.split(' ')[0] : '')
        || '';
    }
  } catch (err) {
    console.error('[post-quote-email] Supabase lookup error:', err.message);
  }

  if (!firstName) firstName = 'there';

  if (!email) {
    return json(res, 200, { ok: false, reason: 'no_email', message: 'No email on file — skipping post-quote email' });
  }

  // Build email
  const { subject, html } = language === 'spanish'
    ? buildEmailES(firstName, quoteLow, quoteHigh, callScheduled, callDatetime)
    : buildEmailEN(firstName, quoteLow, quoteHigh, callScheduled, callDatetime);

  // Send via Resend
  let emailId;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>',
        to:      email,
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
    console.log(`[post-quote-email] Sent to ${email}, id: ${emailId}`);
  } catch (err) {
    console.error('[post-quote-email] Resend error:', err.message);
    return json(res, 500, { ok: false, error: 'Failed to send email', detail: err.message });
  }

  // Mark vcf_sent_at on contact
  try {
    const base = supabaseUrl.replace(/\/$/, '');
    await fetch(`${base}/rest/v1/contacts?phone=eq.${encodeURIComponent(phone)}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json', Prefer: 'return=minimal',
      },
      body: JSON.stringify({ vcf_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    });
  } catch (err) {
    console.error('[post-quote-email] vcf_sent_at update error:', err.message);
  }

  return json(res, 200, { ok: true, email_id: emailId, to: email });
};
