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
 */

const { verifyManychatSecret } = require('../lib/manychat-auth');
const path = require('path');
const fs = require('fs');

const QUOTE_URL    = 'https://www.mejorvidainsurance.com/quote-screen.html';
const SCHEDULE_URL = 'https://www.mejorvidainsurance.com/quote.html?schedule=1';
const VCF_URL      = 'https://www.mejorvidainsurance.com/julie.vcf';

const LOGO_EN = 'https://www.mejorvidainsurance.com/img/logo-english2.png';
const LOGO_ES = 'https://www.mejorvidainsurance.com/img/logo-spanish2.png';

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

// ─── HTML helpers ─────────────────────────────────────────────────────────────
function btn(text, url, bg = '#3b82f6', color = '#fff') {
  return `<a href="${url}" style="display:inline-block;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:15px;text-decoration:none;margin:8px 6px;background:${bg};color:${color};">${text}</a>`;
}

function signatureBlockEN() {
  return `<div style="border-top:1px solid #e0e0e0;margin-top:28px;padding-top:20px;font-size:14px;color:#555;line-height:1.6;">
  <strong style="font-size:15px;color:#1e3a8a;">Julie Braunsroth</strong><br>
  Licensed Life &amp; Health Insurance Agent | Nebraska<br>
  <strong>Mejor Vida Insurance LLC</strong><br>
  Life Insurance | Final Expense | Family Protection<br>
  📞 <a href="tel:+14025881125" style="color:#3b82f6;text-decoration:none;">Call Julie: 402-588-1125</a> | 💬 <a href="https://wa.me/14024405438" style="color:#3b82f6;text-decoration:none;">WhatsApp: 402-440-5438</a><br>
  🌐 <a href="https://www.mejorvidainsurance.com" style="color:#3b82f6;text-decoration:none;">mejorvidainsurance.com</a><br>
  ✉️ <a href="mailto:julie@mejorvidainsurance.com" style="color:#3b82f6;text-decoration:none;">julie@mejorvidainsurance.com</a><br>
  <span style="font-size:12px;color:#888;">Se habla español | We speak English</span>
</div>`;
}

function signatureBlockES() {
  return `<div style="border-top:1px solid #e0e0e0;margin-top:28px;padding-top:20px;font-size:14px;color:#555;line-height:1.6;">
  <strong style="font-size:15px;color:#1e3a8a;">Julie Braunsroth</strong><br>
  Agente Licenciada en Seguros de Vida y Salud | Nebraska<br>
  <strong>Mejor Vida Insurance LLC</strong><br>
  Seguros de Vida | Gastos Finales | Protección Familiar<br>
  📞 <a href="tel:+14025881125" style="color:#3b82f6;text-decoration:none;">Llama a Julie: 402-588-1125</a> | 💬 <a href="https://wa.me/14024405438" style="color:#3b82f6;text-decoration:none;">WhatsApp: 402-440-5438</a><br>
  🌐 <a href="https://www.mejorvidainsurance.com" style="color:#3b82f6;text-decoration:none;">mejorvidainsurance.com</a><br>
  ✉️ <a href="mailto:julie@mejorvidainsurance.com" style="color:#3b82f6;text-decoration:none;">julie@mejorvidainsurance.com</a><br>
  <span style="font-size:12px;color:#888;">Se habla español | We speak English</span>
</div>`;
}

function wrap(body, logoUrl) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;}
.c{max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
.h{background:#1e3a8a;padding:24px 32px;}.ht{color:#fff;font-size:22px;font-weight:bold;margin:0;}
.hs{color:#a8c4e0;font-size:13px;margin:4px 0 0;}.b{padding:32px;color:#333;font-size:16px;line-height:1.7;}
.b p{margin:0 0 16px;}.cta{text-align:center;padding:8px 0 24px;}
.quote-box{background:#e8f5e9;border:2px solid #43a047;border-radius:10px;padding:20px;text-align:center;margin:20px 0;}
.quote-box .range{font-size:32px;font-weight:bold;color:#2e7d32;}
.quote-box .label{font-size:13px;color:#666;margin-top:4px;}
.appt-box{background:#e3f2fd;border:2px solid #1565c0;border-radius:10px;padding:16px 20px;margin:20px 0;}
.appt-box h3{color:#1565c0;font-size:15px;margin:0 0 6px;}
.check{color:#43a047;margin-right:6px;}
.f{background:#f4f6f8;padding:20px 32px;font-size:12px;color:#888;text-align:center;border-top:1px solid #e0e0e0;}
</style></head><body><div class="c">
<div class="h"><img src="${logoUrl}" alt="Mejor Vida Insurance" style="max-width:180px;height:auto;margin-bottom:12px;display:block;" /><p class="ht">Mejor Vida Insurance</p><p class="hs">Seguros Para Una Vida Mejor</p></div>
<div class="b">${body}</div>
<div class="f"><p>&copy; Mejor Vida Insurance | <a href="https://www.mejorvidainsurance.com" style="color:#888;">mejorvidainsurance.com</a></p>
<p><a href="https://www.mejorvidainsurance.com/unsubscribe" style="color:#888;">Unsubscribe</a></p></div>
</div></body></html>`;
}

function buildEmailEN(name, quoteLow, quoteHigh, callScheduled, callDatetime) {
  const quoteBlock = (quoteLow && quoteHigh)
    ? `<div class="quote-box">
        <div class="range">$${quoteLow} – $${quoteHigh}/mo</div>
        <div class="label">Your estimated monthly rate for final expense coverage</div>
       </div>`
    : '';

  const apptBlock = callScheduled
    ? `<div class="appt-box">
        <h3>📅 Your Appointment with Julie</h3>
        <p style="margin:0;font-size:14px;color:#333;">${callDatetime ? `You're confirmed for <strong>${callDatetime}</strong>.` : 'You\'re all set! Julie is looking forward to speaking with you.'} She'll walk you through your options and answer any questions.</p>
       </div>`
    : `<p>When you're ready to take the next step, schedule a quick call — no pressure, just a friendly conversation.</p>
       <div class="cta">${btn('Schedule a Call with Julie', SCHEDULE_URL)}</div>`;

  return {
    subject: `Your quote is ready, ${name}! 📋`,
    html: wrap(`
<p>Hi ${name},</p>
<p>Great news — here's your estimated quote range for final expense coverage:</p>
${quoteBlock}
<p><strong>Here's how easy the process is:</strong></p>
<p><span class="check">✅</span> No medical exam — just a few health questions<br>
<span class="check">✅</span> Coverage starts immediately once approved<br>
<span class="check">✅</span> Your rate is locked in and never goes up<br>
<span class="check">✅</span> Takes less than 10 minutes to complete</p>
${apptBlock}
<p>And save my contact so I'm always just one tap away:</p>
<div class="cta">${btn('Save Julie\'s Contact Card', VCF_URL, '#43a047')}</div>
${signatureBlockEN()}`, LOGO_EN),
  };
}

function buildEmailES(name, quoteLow, quoteHigh, callScheduled, callDatetime) {
  const quoteBlock = (quoteLow && quoteHigh)
    ? `<div class="quote-box">
        <div class="range">$${quoteLow} – $${quoteHigh}/mes</div>
        <div class="label">Tu tarifa mensual estimada para cobertura de gastos finales</div>
       </div>`
    : '';

  const apptBlock = callScheduled
    ? `<div class="appt-box">
        <h3>📅 Tu Cita con Julie</h3>
        <p style="margin:0;font-size:14px;color:#333;">${callDatetime ? `¡Estás confirmado/a para el <strong>${callDatetime}</strong>!` : '¡Todo listo!'} Julie está emocionada de hablar contigo. Te explicará tus opciones y responderá cualquier pregunta.</p>
       </div>`
    : `<p>Cuando estés lista para el siguiente paso, agenda una llamada rápida — sin presión.</p>
       <div class="cta">${btn('Agenda una Llamada con Julie', SCHEDULE_URL)}</div>`;

  return {
    subject: `¡Tu cotización está lista, ${name}! 📋`,
    html: wrap(`
<p>Hola ${name},</p>
<p>¡Buenas noticias! Aquí está tu rango de cotización estimado para cobertura de gastos finales:</p>
${quoteBlock}
<p><strong>Así de fácil es el proceso:</strong></p>
<p><span class="check">✅</span> Sin examen médico — solo unas preguntas de salud<br>
<span class="check">✅</span> La cobertura comienza inmediatamente una vez aprobada<br>
<span class="check">✅</span> Tu tarifa queda fija y nunca sube<br>
<span class="check">✅</span> Toma menos de 10 minutos completarlo</p>
${apptBlock}
<p>Y guarda mi contacto para tenerme siempre a un toque:</p>
<div class="cta">${btn('Guardar Contacto de Julie', VCF_URL, '#43a047')}</div>
${signatureBlockES()}`, LOGO_ES),
  };
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
