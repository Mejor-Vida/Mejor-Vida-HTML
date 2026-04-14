/**
 * /api/nurture-cron.js
 * Vercel Cron Job — runs every 30 minutes
 * Orchestrates the 3-phase lead nurturing sequence:
 *   Phase 1 (WhatsApp via ManyChat): days 1, 3, 5 after enrollment
 *   Phase 2 (SMS via Twilio):        days 7, 10, 14
 *   Phase 3 (Email via Resend):      days 21, 30, 45
 *
 * Add to vercel.json:
 *   "crons": [{ "path": "/api/nurture-cron", "schedule": "0,30 * * * *" }]
 *
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 *   RESEND_API_KEY
 *   MANYCHAT_WEBHOOK_SECRET  (used as ManyChat API token)
 *   MANYCHAT_FLOW_PHASE1_STEP1/2/3  (ManyChat flow namespace per step)
 *   CRON_SECRET  (Bearer token Vercel sends in Authorization header)
 */

// ─── Schedule config ─────────────────────────────────────────────────────────
// days after enrollment when each message fires
const SCHEDULE = {
  1: { 1: 1,  2: 3,  3: 5  }, // Phase 1: WhatsApp
  2: { 1: 7,  2: 10, 3: 14 }, // Phase 2: SMS
  3: { 1: 21, 2: 30, 3: 45 }, // Phase 3: Email
};

// ─── Supabase helpers ─────────────────────────────────────────────────────────
function sbHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function sbFetch(path, options = {}) {
  const base = process.env.SUPABASE_URL.replace(/\/$/, '');
  const res = await fetch(`${base}/rest/v1${path}`, {
    ...options,
    headers: { ...sbHeaders(), ...(options.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${options.method || 'GET'} ${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

// ─── Message templates ───────────────────────────────────────────────────────
function getSmsMessage(step, contact) {
  const name = contact.first_name || 'there';
  const msgs = [
    `Hi ${name}! This is Julie from Mejor Vida Insurance. You asked about final expense coverage — I'd love to help protect your family. Call us at 402-735-5665 or reply here. Reply STOP to opt out.`,
    `Hi ${name}, Julie again from Mejor Vida Insurance. We have affordable plans starting under $30/month. Want a free quote? Call 402-735-5665. Reply STOP to unsubscribe.`,
    `Hi ${name}, last follow-up from Mejor Vida! Our final expense plans give families peace of mind. Call 402-735-5665 whenever you're ready. Reply STOP to opt out.`,
  ];
  return msgs[step - 1] || msgs[0];
}

function getEmailContent(step, contact) {
  const name = contact.first_name || 'there';
  const items = [
    {
      subject: `Still thinking about final expense coverage, ${name}?`,
      html: `<p>Hi ${name},</p>
<p>I wanted to follow up on your interest in final expense life insurance. At Mejor Vida Insurance, we help families secure affordable coverage — often for less than $1 a day.</p>
<p>No medical exam required. Coverage starts immediately. Plans from top-rated carriers.</p>
<p><strong>Ready for a free quote?</strong> Reply to this email or call <a href="tel:4027355665">402-735-5665</a>.</p>
<p>Warm regards,<br>Julie<br>Mejor Vida Insurance</p>
<p style="font-size:12px;color:#888;">To unsubscribe, <a href="https://mejorvidainsurance.com/unsubscribe">click here</a>.</p>`,
    },
    {
      subject: `A quick note from Mejor Vida Insurance`,
      html: `<p>Hi ${name},</p>
<p>Final expense plans cover funeral costs and medical bills so your loved ones aren't left with the burden. Rates are locked in at your age today — the sooner you enroll, the lower your rate.</p>
<p><a href="tel:4027355665" style="background:#1a56db;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block">Call 402-735-5665 for a Free Quote</a></p>
<p>Warm regards,<br>Julie<br>Mejor Vida Insurance</p>
<p style="font-size:12px;color:#888;">To unsubscribe, <a href="https://mejorvidainsurance.com/unsubscribe">click here</a>.</p>`,
    },
    {
      subject: `Your family deserves peace of mind — Mejor Vida Insurance`,
      html: `<p>Hi ${name},</p>
<p>This is my last email — I don't want to crowd your inbox. But if you're ever ready to protect your family with final expense coverage, we're here whenever you need us.</p>
<p>Call anytime: <a href="tel:4027355665">402-735-5665</a> | <a href="https://mejorvidainsurance.com">mejorvidainsurance.com</a></p>
<p>Wishing you and your family all the best,<br>Julie<br>Mejor Vida Insurance</p>
<p style="font-size:12px;color:#888;">To unsubscribe, <a href="https://mejorvidainsurance.com/unsubscribe">click here</a>.</p>`,
    },
  ];
  return items[step - 1] || items[0];
}

// ─── Phase 1: WhatsApp via ManyChat ──────────────────────────────────────────
async function sendWhatsApp(contact, nurtureRow, step) {
  const subscriberId = nurtureRow.manychat_subscriber_id;
  if (!subscriberId) {
    return { ok: false, reason: 'no_subscriber_id' };
  }

  const flowNs = process.env[`MANYCHAT_FLOW_PHASE1_STEP${step}`];
  if (!flowNs) {
    return { ok: false, reason: `no_flow_ns_for_step_${step}` };
  }

  const res = await fetch('https://api.manychat.com/fb/sending/sendFlow', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MANYCHAT_WEBHOOK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscriber_id: subscriberId, flow_ns: flowNs }),
  });

  const json = await res.json();
  if (json.status !== 'success') throw new Error(`ManyChat error: ${JSON.stringify(json)}`);
  return { ok: true };
}

// ─── Phase 2: SMS via Twilio ──────────────────────────────────────────────────
async function sendSms(contact, nurtureRow, step) {
  if (nurtureRow.twilio_opt_out) return { ok: false, reason: 'opted_out' };

  const phone = contact.phone;
  if (!phone) return { ok: false, reason: 'no_phone' };

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const body  = getSmsMessage(step, contact);

  const params = new URLSearchParams({
    Body: body,
    From: process.env.TWILIO_PHONE_NUMBER,
    To:   phone,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  );

  const json = await res.json();
  if (json.status >= 400 || json.error_code) {
    throw new Error(`Twilio error: ${JSON.stringify(json)}`);
  }
  console.log(`[nurture] SMS sent to ${phone}, SID: ${json.sid}`);
  return { ok: true, sid: json.sid };
}

// ─── Phase 3: Email via Resend ────────────────────────────────────────────────
async function sendEmail(contact, nurtureRow, step) {
  if (nurtureRow.email_opt_out) return { ok: false, reason: 'opted_out' };

  const email = contact.email;
  if (!email) return { ok: false, reason: 'no_email' };

  const { subject, html } = getEmailContent(step, contact);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Julie <julie@mejorvidainsurance.com>',
      to: email,
      subject,
      html,
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(json)}`);
  console.log(`[nurture] Email sent to ${email}, id: ${json.id}`);
  return { ok: true, emailId: json.id };
}

// ─── State machine ────────────────────────────────────────────────────────────
function computeNextSend(currentPhase, currentStep, enrolledAt) {
  const enrolled = new Date(enrolledAt);
  let nextPhase = currentPhase;
  let nextStep  = currentStep + 1;

  if (nextStep > 3) {
    nextPhase = currentPhase + 1;
    nextStep  = 1;
  }

  if (nextPhase > 3) {
    return { nextPhase: null, nextStep: null, nextSendAt: null };
  }

  const daysOffset = SCHEDULE[nextPhase][nextStep];
  const nextSendAt = new Date(enrolled.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  return { nextPhase, nextStep, nextSendAt };
}

// ─── Main handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Verify Vercel cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  console.log(`[nurture-cron] Running at ${now.toISOString()}`);

  // Fetch all active nurture rows that are due, joined with contact data
  let dueRows;
  try {
    dueRows = await sbFetch(
      `/nurture_sequence?select=*,contacts(id,first_name,last_name,email,phone)` +
      `&status=eq.active&next_send_at=lte.${encodeURIComponent(now.toISOString())}&limit=100`
    );
  } catch (err) {
    console.error('[nurture-cron] Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }

  console.log(`[nurture-cron] Found ${dueRows.length} due rows`);
  const results = [];

  for (const row of dueRows) {
    const contact = row.contacts;
    if (!contact) {
      console.warn(`[nurture] No contact for nurture row ${row.id}`);
      continue;
    }

    const { phase, step } = row;
    let sendResult = { ok: false, reason: 'unknown_phase' };

    try {
      if (phase === 1)      sendResult = await sendWhatsApp(contact, row, step);
      else if (phase === 2) sendResult = await sendSms(contact, row, step);
      else if (phase === 3) sendResult = await sendEmail(contact, row, step);
    } catch (err) {
      console.error(`[nurture] Send failed for row ${row.id}:`, err.message);
      sendResult = { ok: false, reason: err.message };
    }

    // Compute next scheduled send
    const { nextPhase, nextStep, nextSendAt } = computeNextSend(phase, step, row.enrolled_at);

    const update = {
      last_sent_at: now.toISOString(),
      phase:        nextPhase ?? phase,
      step:         nextStep  ?? step,
      next_send_at: nextSendAt?.toISOString() ?? null,
      status:       nextPhase === null ? 'completed' : 'active',
    };

    if (sendResult?.reason === 'opted_out') update.status = 'paused';

    try {
      await sbFetch(`/nurture_sequence?id=eq.${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
      });
    } catch (err) {
      console.error(`[nurture] Update failed for row ${row.id}:`, err.message);
    }

    results.push({
      nurtureId:  row.id,
      contactId:  contact.id,
      phase,
      step,
      sent:       sendResult?.ok,
      reason:     sendResult?.reason,
      nextSendAt: nextSendAt?.toISOString() ?? null,
      nextStatus: update.status,
    });
  }

  return res.status(200).json({
    ran_at:    now.toISOString(),
    processed: results.length,
    results,
  });
};
