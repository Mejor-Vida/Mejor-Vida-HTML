/**
 * /api/nurture-cron.js  (v2)
 * Vercel Cron Job — runs every 30 minutes.
 *
 * SMART nurture with conditional logic based on lead state:
 *   - has_quote (lead_state.quote_generated_at)
 *   - has_scheduled_call (lead_state.call_scheduled_at)
 *   - vcf_sent_at (contacts.vcf_sent_at)
 *
 * Schedule:
 *   Phase 1 — WhatsApp (2 messages, first 24 hours)
 *     Step 1: 5 hours   — value + book call
 *     Step 2: 21 hours  — soft check-in
 *
 *   Phase 2 — SMS/Twilio (3 messages, days 1/3/5)
 *     Step 1: Day 1  — QUOTE/CALL keywords
 *     Step 2: Day 3  — value + VCF (if not sent)
 *     Step 3: Day 5  — last SMS
 *
 *   Phase 3 — Email/Resend (4 weekly emails)
 *     Step 1: Week 1  — personal note + VCF
 *     Step 2: Week 2  — education
 *     Step 3: Week 3  — Julie's story
 *     Step 4: Week 4  — last call
 *
 * vercel.json: { "path": "/api/nurture-cron", "schedule": "0,30 * * * *" }
 *
 * Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER,
 *   RESEND_API_KEY, MANYCHAT_FLOW_PHASE1_STEP1/STEP2, CRON_SECRET
 */

const SCHEDULE_HOURS = {
  1: { 1: 5,   2: 21  },                   // WA: 5hr, 21hr
  2: { 1: 24,  2: 72,  3: 120 },           // SMS: day 1, 3, 5
  3: { 1: 168, 2: 336, 3: 504, 4: 672 },   // Email: weeks 1-4
};
const MAX_STEPS = { 1: 2, 2: 3, 3: 4 };
const VCF_URL = 'https://www.mejorvidainsurance.com/julie.vcf';
const QUOTE_URL = 'https://www.mejorvidainsurance.com/quote-screen.html';
const SCHEDULE_URL = 'https://www.mejorvidainsurance.com/quote.html?schedule=1';

// ─── Supabase helpers ─────────────────────────────────────────────────────────
function sbHeaders() {
  return {
    apikey:         process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer:         'return=representation',
  };
}

async function sbFetch(path, options = {}) {
  const base = process.env.SUPABASE_URL.replace(/\/$/, '');
  const res  = await fetch(`${base}/rest/v1${path}`, {
    ...options,
    headers: { ...sbHeaders(), ...(options.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${options.method || 'GET'} ${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

// ─── SMS messages (generic) ──────────────────────────────────────────────────
function getSmsMessage(step, contact) {
  const name = (contact.first_name || (contact.full_name || '').split(' ')[0] || 'there').trim() || 'there';

  if (step === 1) return `Hi ${name}! This is Julie from Mejor Vida Insurance. You recently asked about final expense coverage — reply QUOTE and I'll send you a free quote link, or reply CALL to schedule a quick chat with me. Reply STOP to unsubscribe.`;
  if (step === 2) return `Hey ${name}, Julie here from Mejor Vida Insurance! Final expense plans start under $30/month — could be a perfect fit. Save my contact so I'm just a tap away 👉 ${VCF_URL} — then reply QUOTE or CALL. Reply STOP to unsubscribe.`;
  if (step === 3) return `Hi ${name}, Julie from Mejor Vida Insurance checking in one last time. I'd love to help you get covered — just reply QUOTE or CALL and I'll take care of the rest. Reply STOP to unsubscribe.`;
  return null;
}

// ─── Email HTML templates (smart) ─────────────────────────────────────────────
function getEmailContent(step, contact) {
  const name        = (contact.first_name || (contact.full_name || '').split(' ')[0] || 'there').trim() || 'there';
  const quoteUrl    = QUOTE_URL;
  const scheduleUrl = SCHEDULE_URL;

  const btn  = (text, url, bg, color) =>
    `<a href="${url}" style="display:inline-block;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:15px;text-decoration:none;margin:8px 6px;background:${bg};color:${color};">${text}</a>`;

  const wrap = (body) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;}
.c{max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
.h{background:#0d2b4e;padding:24px 32px;}.ht{color:#fff;font-size:22px;font-weight:bold;margin:0;}
.hs{color:#a8c4e0;font-size:13px;margin:4px 0 0;}.b{padding:32px;color:#333;font-size:16px;line-height:1.7;}
.b p{margin:0 0 16px;}.cta{text-align:center;padding:8px 0 24px;}
.f{background:#f4f6f8;padding:20px 32px;font-size:12px;color:#888;text-align:center;border-top:1px solid #e0e0e0;}
</style></head><body><div class="c">
<div class="h"><p class="ht">Mejor Vida Insurance</p><p class="hs">Seguros Para Una Vida Mejor</p></div>
<div class="b">${body}</div>
<div class="f"><p>&copy; Mejor Vida Insurance | <a href="https://www.mejorvidainsurance.com" style="color:#888;">mejorvidainsurance.com</a></p>
<p><a href="https://www.mejorvidainsurance.com/unsubscribe" style="color:#888;">Unsubscribe</a></p></div>
</div></body></html>`;

  const vcfPs = !contact.vcf_sent_at
    ? `<p style="font-size:14px;color:#555;border-top:1px solid #e0e0e0;padding-top:12px;margin-top:8px;">📱 <strong>P.S.</strong> — Save my contact so I'm always one tap away: <a href="${VCF_URL}" style="color:#1a56db;">Save Julie's Contact Card</a></p>`
    : '';

  const t = {
    1: {
      subject: `I wanted to reach out personally, ${name}…`,
      html: wrap(`<p>Hi ${name},</p>
<p>I'm Julie, and I work with Mejor Vida Insurance helping families get the final expense coverage they need — without the confusion or the hard sell.</p>
<p>You reached out a little while ago, and I just wanted to check in personally. Life gets busy, I get it. But I didn't want you to fall through the cracks.</p>
<p>Final expense insurance is one of those things that's easy to put off — until it's too late. And once you have it, you never have to think about it again. Plans start under <strong>$30/month</strong>, and the whole process takes just a few minutes.</p>
<p>Whenever you're ready, I'm here. No pressure, no rush.</p>
<div class="cta">${btn('Get My Free Quote', quoteUrl, '#1a56db', '#fff')} ${btn('Schedule a Call with Julie', scheduleUrl, '#fff', '#1a56db')}</div>
<p>Warmly,<br><strong>Julie</strong><br>Mejor Vida Insurance</p>
${vcfPs}`),
    },
    2: {
      subject: `What exactly IS final expense insurance? (plain English)`,
      html: wrap(`<p>Hi ${name},</p>
<p>I get this question a lot, so I wanted to break it down simply.</p>
<p><strong>Final expense insurance</strong> is a small whole life policy — usually between $5,000 and $25,000 — designed to cover end-of-life costs like funeral expenses, burial, and outstanding medical bills.</p>
<p>✅ No medical exam — just a few health questions<br>
✅ Fixed monthly premium — it never goes up<br>
✅ Coverage never expires — as long as you pay, you're covered<br>
✅ Pays out fast — usually within days, directly to your family</p>
<p>The average funeral today costs between <strong>$8,000 and $12,000</strong>. Without coverage, that burden falls entirely on the people you love most — at the hardest moment of their lives.</p>
<p>The good news? You can get covered today for less than a dollar a day.</p>
<div class="cta">${btn('See My Options', quoteUrl, '#1a56db', '#fff')} ${btn('Talk to Julie', scheduleUrl, '#fff', '#1a56db')}</div>
<p>Warmly,<br><strong>Julie</strong><br>Mejor Vida Insurance</p>`),
    },
    3: {
      subject: `Why I started doing this work…`,
      html: wrap(`<p>Hi ${name},</p>
<p>I wanted to share something personal with you. When my dad passed away, we didn't have a final expense plan… and what should have been a time for family turned into stress trying to figure out how to pay for everything.</p>
<p>That's why I care so much about helping families plan ahead. It's not just about money — it's about protecting the people you love during one of the hardest moments of their lives.</p>
<p>If you've been thinking about it, I'd love to walk you through your options.</p>
<div class="cta">${btn('Schedule a Free Call with Julie', scheduleUrl, '#1a56db', '#fff')} ${btn('Get a Free Quote', quoteUrl, '#fff', '#1a56db')}</div>
<p>With care,<br><strong>Julie</strong><br>Mejor Vida Insurance</p>`),
    },
    4: {
      subject: `I don't want to keep bothering you…`,
      html: wrap(`<p>Hi ${name},</p>
<p>I've reached out a few times now, and I completely understand if the timing hasn't been right.</p>
<p>I'm not going to keep filling your inbox — I promise this is my last email for a while. But I did want to say one more thing before I give you some space:</p>
<p>The people who need this coverage the most are often the ones who wait the longest. And I've seen firsthand what happens when a family isn't protected. It's heartbreaking — and it's preventable.</p>
<p>If there's any part of you that knows you should have this taken care of, please don't wait for the "right time." It takes less than 10 minutes. Plans start under $30/month.</p>
<p>I'll be here whenever you're ready. Just reply to this email, click below, or give me a call anytime.</p>
<div class="cta">${btn('Get My Free Quote — 5 Minutes', quoteUrl, '#1a56db', '#fff')} ${btn('Schedule a Call with Julie', scheduleUrl, '#fff', '#1a56db')}</div>
<p>Take care of yourself,<br><strong>Julie</strong><br>Mejor Vida Insurance</p>`),
    },
  };
  return t[step] || t[1];
}

// ─── Phase 1: WhatsApp via ManyChat ──────────────────────────────────────────
async function sendWhatsApp(contact, nurtureRow, step) {

  const subscriberId = nurtureRow.manychat_subscriber_id || contact.whatsapp_id;
  if (!subscriberId) return { ok: false, reason: 'no_subscriber_id' };

  const flowNs = process.env[`MANYCHAT_FLOW_PHASE1_STEP${step}`];
  if (!flowNs) return { ok: false, reason: `missing_MANYCHAT_FLOW_PHASE1_STEP${step}` };

  const res = await fetch('https://api.manychat.com/fb/sending/sendFlow', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${process.env.MANYCHAT_WEBHOOK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscriber_id: subscriberId, flow_ns: flowNs }),
  });
  const json = await res.json();
  if (json.status !== 'success') throw new Error(`ManyChat: ${JSON.stringify(json)}`);
  return { ok: true };
}

// ─── Phase 2: SMS via Twilio ──────────────────────────────────────────────────
async function sendSms(contact, nurtureRow, step) {
  if (nurtureRow.twilio_opt_out) return { ok: false, reason: 'opted_out' };
  const phone = contact.phone;
  if (!phone) return { ok: false, reason: 'no_phone' };

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return { ok: false, reason: 'missing_twilio_env' };

  const msgBody = getSmsMessage(step, contact);
  if (!msgBody) return { ok: false, reason: 'no_message' };

  const includeVcf = step === 2 && !contact.vcf_sent_at;

  const params = new URLSearchParams({ Body: msgBody, From: from, To: phone });
  if (includeVcf) params.append('MediaUrl', VCF_URL);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method:  'POST',
    headers: {
      Authorization:  'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const json = await res.json();
  if (json.error_code) throw new Error(`Twilio: ${JSON.stringify(json)}`);
  console.log(`[nurture] SMS sent to ${phone}, SID: ${json.sid}${includeVcf ? ' (VCF)' : ''}`);
  return { ok: true, sid: json.sid, vcfSent: includeVcf };
}

// ─── Phase 3: Email via Resend ────────────────────────────────────────────────
async function sendEmail(contact, nurtureRow, step) {
  if (nurtureRow.email_opt_out) return { ok: false, reason: 'opted_out' };
  const email = contact.email;
  if (!email) return { ok: false, reason: 'no_email' };
  if (!process.env.RESEND_API_KEY) return { ok: false, reason: 'missing_RESEND_API_KEY' };

  const { subject, html } = getEmailContent(step, contact);
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>',
      to:      email,
      subject,
      html,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Resend: ${JSON.stringify(json)}`);
  const vcfSent = step === 1 && !contact.vcf_sent_at;
  console.log(`[nurture] Email ${step} sent to ${email}, id: ${json.id}`);
  return { ok: true, emailId: json.id, vcfSent };
}

// ─── State machine ────────────────────────────────────────────────────────────
function computeNextSend(currentPhase, currentStep, enrolledAt) {
  let nextPhase = currentPhase;
  let nextStep  = currentStep + 1;

  if (nextStep > MAX_STEPS[nextPhase]) {
    nextPhase += 1;
    nextStep   = 1;
  }
  if (nextPhase > 3) return { nextPhase: null, nextStep: null, nextSendAt: null };

  const hoursOffset = SCHEDULE_HOURS[nextPhase][nextStep];
  const nextSendAt  = new Date(new Date(enrolledAt).getTime() + hoursOffset * 3600000);
  return { nextPhase, nextStep, nextSendAt };
}

// ─── Main handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  console.log(`[nurture-cron] Running at ${now.toISOString()}`);

  let dueRows;
  try {
    dueRows = await sbFetch(
      `/nurture_sequence?select=*,contacts(id,first_name,last_name,full_name,email,phone,whatsapp_id,vcf_sent_at)` +
      `&status=eq.active&next_send_at=lte.${encodeURIComponent(now.toISOString())}&limit=100`
    );
  } catch (err) {
    console.error('[nurture-cron] Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }

  console.log(`[nurture-cron] ${dueRows.length} rows due`);
  const results = [];

  for (const row of dueRows) {
    const contact = row.contacts;
    if (!contact) { console.warn(`[nurture] No contact for row ${row.id}`); continue; }

    const { phase, step } = row;
    let sendResult = { ok: false, reason: 'unknown_phase' };

    try {
      if (phase === 1)      sendResult = await sendWhatsApp(contact, row, step);
      else if (phase === 2) sendResult = await sendSms(contact, row, step);
      else if (phase === 3) sendResult = await sendEmail(contact, row, step);
    } catch (err) {
      console.error(`[nurture] Row ${row.id} send error:`, err.message);
      sendResult = { ok: false, reason: err.message };
    }

    // Email phase but no address on file — advance so the row does not stick forever
    if (!sendResult.ok && sendResult.reason === 'no_email' && phase === 3) {
      console.warn(`[nurture] Skipping email step ${step} for contact ${contact.id} — no email on file`);
      const { nextPhase, nextStep, nextSendAt } = computeNextSend(phase, step, row.enrolled_at);
      const skipUpdate = {
        phase:        nextPhase ?? phase,
        step:         nextStep ?? step,
        next_send_at: nextSendAt?.toISOString() ?? null,
        status:       nextPhase === null ? 'completed' : 'active',
        updated_at:   now.toISOString(),
      };
      try {
        await sbFetch(`/nurture_sequence?id=eq.${row.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(skipUpdate),
        });
      } catch (err) {
        console.error(`[nurture] Row ${row.id} skip update error:`, err.message);
      }
      results.push({ nurtureId: row.id, contactId: contact.id, phase, step, sent: false, reason: 'no_email_skipped', nextSendAt: nextSendAt?.toISOString() ?? null });
      continue;
    }

    // Mark vcf_sent_at on contact if VCF was delivered
    if (sendResult?.ok && sendResult?.vcfSent && contact.id) {
      try {
        await sbFetch(`/contacts?id=eq.${contact.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ vcf_sent_at: now.toISOString(), updated_at: now.toISOString() }),
        });
      } catch (err) {
        console.error(`[nurture] vcf_sent_at update failed:`, err.message);
      }
    }

    const { nextPhase, nextStep, nextSendAt } = computeNextSend(phase, step, row.enrolled_at);
    const update = {
      last_sent_at: now.toISOString(),
      phase:        nextPhase ?? phase,
      step:         nextStep  ?? step,
      next_send_at: nextSendAt?.toISOString() ?? null,
      status:       nextPhase === null ? 'completed' : (sendResult?.reason === 'opted_out' ? 'paused' : 'active'),
      updated_at:   now.toISOString(),
    };

    try {
      await sbFetch(`/nurture_sequence?id=eq.${row.id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(update),
      });
    } catch (err) {
      console.error(`[nurture] Row ${row.id} update error:`, err.message);
    }

    results.push({ nurtureId: row.id, contactId: contact.id, phase, step, sent: sendResult?.ok, reason: sendResult?.reason, nextSendAt: nextSendAt?.toISOString() ?? null });
  }

  return res.status(200).json({ ran_at: now.toISOString(), processed: results.length, results });
};
