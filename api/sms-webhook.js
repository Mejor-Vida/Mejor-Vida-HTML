/**
 * POST /api/sms-webhook
 * Twilio inbound SMS handler — receives replies from leads.
 *
 * Keyword logic:
 *   QUOTE  → send email with quote link (or collect email first)
 *   CALL   → send email with scheduling link (or collect email first)
 *   STOP   → opt-out of SMS, update Supabase
 *   <email address>  → save email, send the pending intent email
 *   anything else    → send a friendly fallback reply
 *
 * Twilio verifies requests via its signature header.
 * We validate using TWILIO_AUTH_TOKEN + the raw request URL.
 *
 * Required env vars:
 *   TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 */

const crypto = require('crypto');

// ─── Twilio signature validation ─────────────────────────────────────────────
function validateTwilioSignature(req) {
  const token     = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers['x-twilio-signature'] || '';
  if (!token || !signature) return false;

  // Build the URL Twilio signed — must match exactly what Twilio POSTed to
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host     = req.headers['x-forwarded-host'] || req.headers.host;
  const url      = `${protocol}://${host}/api/sms-webhook`;

  // Sort POST params and append to URL
  const body   = typeof req.body === 'string' ? Object.fromEntries(new URLSearchParams(req.body)) : (req.body || {});
  const sorted = Object.keys(body).sort().reduce((acc, k) => acc + k + body[k], url);

  const expected = crypto
    .createHmac('sha1', token)
    .update(sorted)
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
function sbHeaders(key) {
  return {
    apikey:         key,
    Authorization:  `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

async function sbGet(supabaseUrl, key, path) {
  const res  = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1${path}`, { headers: sbHeaders(key) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status} ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

async function sbPatch(supabaseUrl, key, path, data) {
  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1${path}`, {
    method:  'PATCH',
    headers: { ...sbHeaders(key), Prefer: 'return=minimal' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase PATCH ${path}: ${res.status} ${t.slice(0, 200)}`);
  }
}

// ─── Twilio TwiML reply ───────────────────────────────────────────────────────
function twiml(message) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
}

function twimlEmpty() {
  return `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
}

// ─── Send email via Resend ────────────────────────────────────────────────────
async function sendNurtureEmail(contact, intent) {
  const quoteUrl    = 'https://www.mejorvidainsurance.com/quote-screen.html';
  const scheduleUrl = 'https://www.mejorvidainsurance.com/quote.html?schedule=1';
  const name =
    (contact.first_name || (contact.full_name || '').split(' ')[0] || 'there').trim() || 'there';

  const btn = (text, url, bg) =>
    `<a href="${url}" style="display:inline-block;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:15px;text-decoration:none;margin:8px 6px;background:${bg};color:#fff;">${text}</a>`;

  const wrap = (body) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;}
.c{max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
.h{background:#0d2b4e;padding:24px 32px;}.ht{color:#fff;font-size:22px;font-weight:bold;margin:0;}
.hs{color:#a8c4e0;font-size:13px;margin:4px 0 0;}.b{padding:32px;color:#333;font-size:16px;line-height:1.7;}
.b p{margin:0 0 16px;}.cta{text-align:center;padding:8px 0 24px;}
.f{background:#f4f6f8;padding:20px 32px;font-size:12px;color:#888;text-align:center;}
</style></head><body><div class="c">
<div class="h"><p class="ht">Mejor Vida Insurance</p><p class="hs">Seguros Para Una Vida Mejor</p></div>
<div class="b">${body}</div>
<div class="f"><p>© Mejor Vida Insurance | <a href="https://www.mejorvidainsurance.com" style="color:#888;">mejorvidainsurance.com</a></p></div>
</div></body></html>`;

  let subject, html;
  if (intent === 'quote') {
    subject = `Here's your free quote link, ${name}!`;
    html    = wrap(`<p>Hi ${name},</p>
<p>Thanks for reaching out! Here's your link to get a free final expense quote — it only takes a few minutes:</p>
<div class="cta">${btn('Get My Free Quote', quoteUrl, '#1a56db')}</div>
<p>If you have any questions, just reply to this email or call me directly.</p>
<p>Warmly,<br><strong>Julie</strong><br>Mejor Vida Insurance</p>`);
  } else {
    subject = `Here's the link to schedule your call, ${name}!`;
    html    = wrap(`<p>Hi ${name},</p>
<p>I'm looking forward to chatting with you! Click below to pick a time that works for you:</p>
<div class="cta">${btn('Schedule My Call with Julie', scheduleUrl, '#1a56db')}</div>
<p>It's just a quick, no-pressure conversation. I'll walk you through your options and answer any questions you have.</p>
<p>See you soon,<br><strong>Julie</strong><br>Mejor Vida Insurance</p>`);
  }

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>',
      to:      contact.email,
      subject,
      html,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Resend: ${JSON.stringify(json)}`);
  return json.id;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');

  if (req.method !== 'POST') {
    return res.status(405).send(twimlEmpty());
  }

  // Validate Twilio signature
  if (!validateTwilioSignature(req)) {
    console.warn('[sms-webhook] Invalid Twilio signature');
    return res.status(403).send(twimlEmpty());
  }

  const body = typeof req.body === 'string'
    ? Object.fromEntries(new URLSearchParams(req.body))
    : (req.body || {});

  const fromPhone = (body.From || '').trim();
  const msgBody   = (body.Body || '').trim();
  const keyword   = msgBody.toUpperCase().split(/\s+/)[0];

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!fromPhone || !supabaseUrl || !supabaseKey) {
    return res.status(200).send(twimlEmpty());
  }

  console.log(`[sms-webhook] From: ${fromPhone}, Body: "${msgBody}"`);

  // ── Look up contact by phone ──────────────────────────────────────────────
  let contacts;
  try {
    contacts = await sbGet(supabaseUrl, supabaseKey,
      `/contacts?phone=eq.${encodeURIComponent(fromPhone)}&select=id,first_name,last_name,full_name,email,phone,pending_sms_intent&limit=1`);
  } catch (err) {
    console.error('[sms-webhook] Contact lookup error:', err.message);
    return res.status(200).send(twiml('Sorry, we had a technical issue. Please try again shortly.'));
  }
  const contact = contacts[0] || null;

  // ── STOP ─────────────────────────────────────────────────────────────────
  if (keyword === 'STOP') {
    if (contact) {
      try {
        await sbPatch(supabaseUrl, supabaseKey,
          `/nurture_sequence?contact_id=eq.${contact.id}`,
          { twilio_opt_out: true, status: 'paused', updated_at: new Date().toISOString() });
      } catch (err) {
        console.error('[sms-webhook] STOP update error:', err.message);
      }
    }
    // Twilio handles STOP natively — return empty response
    return res.status(200).send(twimlEmpty());
  }

  // ── QUOTE or CALL ─────────────────────────────────────────────────────────
  if (keyword === 'QUOTE' || keyword === 'CALL') {
    const intent = keyword.toLowerCase(); // 'quote' or 'call'

    if (!contact) {
      // Unknown number — ask for email to get started
      return res.status(200).send(twiml(
        `Hi! I'm Julie from Mejor Vida Insurance. I'd love to help! What's your email address so I can send you the link?`
      ));
    }

    if (contact.email) {
      // We have their email — send the link right now
      try {
        await sendNurtureEmail(contact, intent);
        const msg = intent === 'quote'
          ? `Great! I just sent your free quote link to ${contact.email}. Let me know if you have any questions!`
          : `Perfect! I just sent your scheduling link to ${contact.email}. Can't wait to chat!`;
        return res.status(200).send(twiml(msg));
      } catch (err) {
        console.error('[sms-webhook] Email send error:', err.message);
        return res.status(200).send(twiml(`I had trouble sending the email. Please call me directly at 402-735-5665 and I'll help you right away!`));
      }
    } else {
      // No email — ask for it and store the pending intent
      try {
        await sbPatch(supabaseUrl, supabaseKey,
          `/contacts?id=eq.${contact.id}`,
          { pending_sms_intent: intent, updated_at: new Date().toISOString() });
      } catch (err) {
        console.error('[sms-webhook] Pending intent save error:', err.message);
      }
      const ask = intent === 'quote'
        ? `Great! What's your email address? I'll send you the free quote link right away.`
        : `Perfect! What's your email address? I'll send you the scheduling link right away.`;
      return res.status(200).send(twiml(ask));
    }
  }

  // ── Email address reply ───────────────────────────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(msgBody)) {
    const email = msgBody.toLowerCase();

    if (!contact) {
      return res.status(200).send(twiml(
        `Thanks! I've saved your email. Reply QUOTE for a free quote link or CALL to schedule a chat with me.`
      ));
    }

    // Save email to contact
    try {
      await sbPatch(supabaseUrl, supabaseKey,
        `/contacts?id=eq.${contact.id}`,
        { email, pending_sms_intent: null, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error('[sms-webhook] Email save error:', err.message);
    }

    const intent = contact.pending_sms_intent || 'quote';
    const updatedContact = { ...contact, email };

    try {
      await sendNurtureEmail(updatedContact, intent);
      const msg = intent === 'quote'
        ? `Got it! I just sent your free quote link to ${email}. Let me know if you have any questions!`
        : `Got it! I just sent your scheduling link to ${email}. Looking forward to chatting!`;
      return res.status(200).send(twiml(msg));
    } catch (err) {
      console.error('[sms-webhook] Email send error:', err.message);
      return res.status(200).send(twiml(`I saved your email but had trouble sending the link. Call me at 402-735-5665 and I'll help you right now!`));
    }
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return res.status(200).send(twiml(
    `Hi! This is Julie from Mejor Vida Insurance. Reply QUOTE for a free quote, CALL to schedule a chat, or STOP to unsubscribe.`
  ));
};
