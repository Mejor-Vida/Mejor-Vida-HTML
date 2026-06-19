/**
 * POST /api/call-scheduled-webhook
 * Called when a lead schedules a call (from HubSpot, Calendly, or ManyChat).
 * Sends a VCF reminder SMS if the lead hasn't already received it.
 *
 * Expected body:
 *   phone        (required) Lead's phone number
 *   contact_id   (optional) Supabase contact UUID
 *   scheduled_at (optional) ISO datetime of scheduled call
 *   source       (optional) 'hubspot' | 'calendly' | 'manychat'
 *
 * Auth: Bearer MANYCHAT_WEBHOOK_SECRET (same secret used for ManyChat webhooks)
 *
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   TELNYX_API_KEY, TELNYX_SMS_FROM
 *   MANYCHAT_WEBHOOK_SECRET
 */

const VCF_URL = 'https://www.mejorvidainsurance.com/julie.vcf';
const { sendSms } = require('../lib/sms-send');

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
}

function readBody(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body && typeof req.body === 'object' ? req.body : {};
}

function bearer(req) {
  const h = req.headers?.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : '';
}

async function sbGet(url, key, path) {
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status}`);
  return JSON.parse(text);
}

async function sbPatch(url, key, path, data) {
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1${path}`, {
    method: 'PATCH',
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Supabase PATCH ${path}: ${res.status} ${t}`); }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  const secret = process.env.MANYCHAT_WEBHOOK_SECRET;
  if (!secret || bearer(req) !== secret) {
    return json(res, 401, { ok: false, error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { ok: false, error: 'Missing Supabase env vars' });
  }

  let body;
  try { body = readBody(req); } catch { return json(res, 400, { ok: false, error: 'Invalid JSON' }); }

  const phone = String(body.phone || '').trim();
  if (!phone) return json(res, 400, { ok: false, error: 'phone is required' });

  // Look up contact
  let contacts;
  try {
    contacts = await sbGet(supabaseUrl, supabaseKey,
      `/contacts?phone=eq.${encodeURIComponent(phone)}&select=id,first_name,last_name,full_name,vcf_sent_at&limit=1`);
  } catch (err) {
    console.error('[call-scheduled] contact lookup:', err.message);
    return json(res, 500, { ok: false, error: 'Database error' });
  }

  const contact = contacts[0] || null;
  const name =
    (contact?.first_name || (contact?.full_name || '').split(' ')[0] || 'there').trim() || 'there';

  // Check if VCF already sent
  if (contact?.vcf_sent_at) {
    console.log(`[call-scheduled] VCF already sent to ${phone} at ${contact.vcf_sent_at} — skipping reminder`);
    return json(res, 200, { ok: true, vcf_reminder_sent: false, reason: 'already_sent' });
  }

  // Send VCF reminder SMS
  const message = `Hi ${name}! Your call with Julie is confirmed 🎉 One quick thing — save her contact so you can always reach her directly: ${VCF_URL} See you soon!`;

  let smsSid;
  try {
    const sent = await sendSms({ to: phone, body: message, mediaUrls: [VCF_URL] });
    if (!sent.ok) {
      throw new Error(`${sent.provider || 'sms'}: ${sent.reason} ${JSON.stringify(sent.detail || '')}`);
    }
    smsSid = sent.sid;
    console.log(`[call-scheduled] VCF reminder SMS sent to ${phone}, ${sent.provider} ${smsSid}`);
  } catch (err) {
    console.error('[call-scheduled] SMS send error:', err.message);
    return json(res, 500, { ok: false, error: 'Failed to send SMS', detail: err.message });
  }

  // Mark vcf_sent_at on contact
  if (contact?.id) {
    try {
      await sbPatch(supabaseUrl, supabaseKey,
        `/contacts?id=eq.${contact.id}`,
        { vcf_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    } catch (err) {
      console.error('[call-scheduled] vcf_sent_at update error:', err.message);
    }
  }

  return json(res, 200, { ok: true, vcf_reminder_sent: true, sms_sid: smsSid });
};
