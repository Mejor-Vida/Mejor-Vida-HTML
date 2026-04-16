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
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 *   MANYCHAT_WEBHOOK_SECRET
 */

const VCF_URL = 'https://www.mejorvidainsurance.com/julie.vcf';

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

async function sendTwilioSms(sid, token, from, to, body, mediaUrl) {
  const params = new URLSearchParams({ Body: body, From: from, To: to });
  if (mediaUrl) params.append('MediaUrl', mediaUrl);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const result = await res.json();
  if (result.error_code) throw new Error(`Twilio error ${result.error_code}: ${result.message}`);
  return result.sid;
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
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    return json(res, 500, { ok: false, error: 'Missing Twilio env vars' });
  }

  const message = `Hi ${name}! Your call with Julie is confirmed 🎉 One quick thing — save her contact so you can always reach her directly: ${VCF_URL} See you soon!`;

  let smsSid;
  try {
    smsSid = await sendTwilioSms(sid, token, from, phone, message, VCF_URL);
    console.log(`[call-scheduled] VCF reminder SMS sent to ${phone}, SID: ${smsSid}`);
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
