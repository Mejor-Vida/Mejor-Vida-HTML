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
 *   Phase 2 — SMS/Twilio (3 messages, days 3/5/7 — 48h / 96h / 144h from enroll)
 *     Step 1: Day 3  — QUOTE/CALL keywords (avoids same-day overlap with WhatsApp step 2 ~21h)
 *     Step 2: Day 5  — value + VCF (if not sent)
 *     Step 3: Day 7  — last SMS
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
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
 *   TWILIO_MESSAGING_SERVICE_SID (A2P Messaging Service MG…; preferred for Phase 2 SMS),
 *   TWILIO_PHONE_NUMBER (E.164 fallback if Messaging Service SID not set),
 *   MANYCHAT_API_KEY (Bearer for sendFlow), MANYCHAT_FLOW_PHASE1_STEP1/STEP2,
 *   RESEND_API_KEY, CRON_SECRET
 */

const { wrapResendEmailHtml, LOGO_EN, LOGO_ES } = require('../lib/resend-email-template');
const { computeNextSend } = require('../lib/nurture-schedule');
const { VCF_URL, getSmsMessage, getEmailContent } = require('../lib/nurture-templates');
const { logContactCommunication, htmlToPlain } = require('../lib/contact-communications');

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

async function insertDeliveryLog(contactId, channel, phase, step, status, opts = {}) {
  const payload = {
    contact_id: contactId,
    channel,
    phase,
    step,
    provider_id: opts.provider_id || null,
    status,
    error: opts.error ? String(opts.error).slice(0, 2000) : null,
    sent_at: opts.sent_at || new Date().toISOString(),
    reason: opts.reason ? String(opts.reason).slice(0, 500) : null,
  };
  try {
    await sbFetch('/nurture_delivery_log', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn('[nurture] nurture_delivery_log insert failed:', (e && e.message) || e);
  }
}

function channelForPhase(phase) {
  if (phase === 1) return 'whatsapp';
  if (phase === 2) return 'sms';
  return 'email';
}

async function fetchEmailOverride(contactId, phase, step) {
  try {
    const rows = await sbFetch(
      `/nurture_message_overrides?contact_id=eq.${contactId}&phase=eq.${phase}&step=eq.${step}&limit=1`
    );
    return rows && rows[0] ? rows[0] : null;
  } catch (e) {
    return null;
  }
}

// ─── Phase 1: WhatsApp via ManyChat ──────────────────────────────────────────

async function sendWhatsApp(contact, nurtureRow, step) {
  const flowNs = process.env[`MANYCHAT_FLOW_PHASE1_STEP${step}`];
  if (!flowNs) return { ok: false, reason: `missing_MANYCHAT_FLOW_PHASE1_STEP${step}` };

  const manychatApiKey = process.env.MANYCHAT_API_KEY;
  if (!manychatApiKey) return { ok: false, reason: 'missing_MANYCHAT_API_KEY' };

  // Use the real ManyChat subscriber ID stored at capture time (contacts.manychat_subscriber_id).
  // nurture_sequence.manychat_subscriber_id is populated from that field at enrollment.
  // Falls back to contact field in case enrollment predated this fix.
  const subscriberId = nurtureRow.manychat_subscriber_id || contact.manychat_subscriber_id || null;
  if (!subscriberId) {
    console.warn(`[nurture] No ManyChat subscriber ID for contact ${contact.id} — WhatsApp send skipped. ` +
      `Ensure ManyChat flow sends {{id}} in the External Request body.`);
    return { ok: false, reason: 'no_manychat_subscriber_id' };
  }

  const res = await fetch('https://api.manychat.com/fb/sending/sendFlow', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${manychatApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscriber_id: subscriberId, flow_ns: flowNs }),
  });
  const json = await res.json();
  if (json.status !== 'success') throw new Error(`ManyChat: ${JSON.stringify(json)}`);
  console.log(`[nurture] WhatsApp step ${step} sent to subscriber ${subscriberId}`);
  return { ok: true, providerId: flowNs };
}

// ─── Phase 2: SMS via Twilio ──────────────────────────────────────────────────
async function sendSms(contact, nurtureRow, step) {
  if (nurtureRow.twilio_opt_out) return { ok: false, reason: 'opted_out' };
  const phone = contact.phone;
  if (!phone) return { ok: false, reason: 'no_phone' };

  const sid                 = process.env.TWILIO_ACCOUNT_SID;
  const token               = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = (process.env.TWILIO_MESSAGING_SERVICE_SID || '').trim();
  const fromNumber          = (process.env.TWILIO_PHONE_NUMBER || '').trim();

  if (!sid || !token) return { ok: false, reason: 'missing_twilio_env' };
  if (!messagingServiceSid && !fromNumber) return { ok: false, reason: 'missing_twilio_env' };

  const msgBody = getSmsMessage(step, contact);
  if (!msgBody) return { ok: false, reason: 'no_message' };

  const includeVcf = step === 2 && !contact.vcf_sent_at;

  // Ensure E.164 format (Twilio requires leading +)
  const toPhone = phone.startsWith('+') ? phone : `+${phone}`;
  const params = new URLSearchParams({ Body: msgBody, To: toPhone });
  if (messagingServiceSid) {
    params.append('MessagingServiceSid', messagingServiceSid);
  } else {
    params.append('From', fromNumber);
  }
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
  console.log(
    `[nurture] SMS sent to ${phone}, twilio ${json.sid}${includeVcf ? ' (VCF)' : ''} via ${messagingServiceSid ? 'MessagingServiceSid' : 'From'}`,
  );
  return { ok: true, sid: json.sid, vcfSent: includeVcf };
}

// ─── Phase 3: Email via Resend ────────────────────────────────────────────────
async function sendEmail(contact, nurtureRow, step, overrideRow) {
  if (nurtureRow.email_opt_out) return { ok: false, reason: 'opted_out' };
  const email = contact.email;
  if (!email) return { ok: false, reason: 'no_email' };
  if (!process.env.RESEND_API_KEY) return { ok: false, reason: 'missing_RESEND_API_KEY' };

  let subject;
  let html;
  if (overrideRow && overrideRow.subject && overrideRow.body) {
    subject = String(overrideRow.subject);
    const rawBody = String(overrideRow.body);
    const lang = String(contact.idioma || contact.language || '').toLowerCase();
    const logoUrl = lang === 'english' ? LOGO_EN : LOGO_ES;
    html = rawBody.includes('<!DOCTYPE') || rawBody.includes('<html')
      ? rawBody
      : wrapResendEmailHtml(rawBody, logoUrl);
  } else {
    const c = getEmailContent(step, contact);
    subject = c.subject;
    html = c.html;
  }

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
      `/nurture_sequence?select=*,contacts(id,first_name,last_name,full_name,email,phone,whatsapp_id,manychat_subscriber_id,vcf_sent_at,language,idioma)` +
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
    let overrideRow = null;

    try {
      if (phase === 3) {
        overrideRow = await fetchEmailOverride(contact.id, phase, step);
      }
      if (phase === 1) sendResult = await sendWhatsApp(contact, row, step);
      else if (phase === 2) sendResult = await sendSms(contact, row, step);
      else if (phase === 3) sendResult = await sendEmail(contact, row, step, overrideRow);
    } catch (err) {
      console.error(`[nurture] Row ${row.id} send error:`, err.message);
      sendResult = { ok: false, reason: err.message };
    }

    // Email phase but no address on file — advance so the row does not stick forever
    if (!sendResult.ok && sendResult.reason === 'no_email' && phase === 3) {
      console.warn(`[nurture] Skipping email step ${step} for contact ${contact.id} — no email on file`);
      await insertDeliveryLog(contact.id, 'email', phase, step, 'skipped', { reason: 'no_email' });
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

    const ch = channelForPhase(phase);
    if (sendResult.ok) {
      const pid = sendResult.providerId || sendResult.sid || sendResult.emailId || null;
      const sentAt = new Date().toISOString();
      await insertDeliveryLog(contact.id, ch, phase, step, 'sent', { provider_id: pid, sent_at: sentAt });

      let logSubject = null;
      let logBody = null;
      let logSummary = null;
      if (phase === 2) {
        logBody = getSmsMessage(step, contact);
        logSummary = logBody;
      } else if (phase === 3) {
        if (overrideRow && overrideRow.subject && overrideRow.body) {
          logSubject = String(overrideRow.subject);
          const rawBody = String(overrideRow.body);
          logBody = rawBody.includes('<') ? htmlToPlain(rawBody) : rawBody;
        } else {
          const c = getEmailContent(step, contact);
          logSubject = c.subject;
          logBody = htmlToPlain(c.html);
        }
        logSummary = logSubject;
      } else if (phase === 1) {
        logSummary = `WhatsApp nurture — step ${step}`;
        logBody =
          `Automated WhatsApp message sent via ManyChat (nurture step ${step}). ` +
          'Full message content is managed in the ManyChat flow.';
      }
      await logContactCommunication(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        contactId: contact.id,
        direction: 'outbound',
        channel: ch,
        subject: logSubject,
        summary: logSummary,
        body: logBody,
        meta: {
          source: 'nurture',
          phase,
          step,
          provider_id: pid,
          sent_at: sentAt,
        },
      });
    } else if (
      sendResult.reason === 'no_manychat_subscriber_id' ||
      sendResult.reason === 'opted_out' ||
      sendResult.reason === 'no_phone'
    ) {
      await insertDeliveryLog(contact.id, ch, phase, step, 'skipped', { reason: sendResult.reason });
    } else {
      await insertDeliveryLog(contact.id, ch, phase, step, 'failed', {
        error: sendResult.reason || 'unknown',
      });
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
