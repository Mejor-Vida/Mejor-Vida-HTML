/**
 * Shared HTML for post-quote emails (api/post-quote-email.js).
 * Kept in one place so local previews match production.
 */

const QUOTE_URL = "https://www.mejorvidainsurance.com/quote-screen.html";
const SCHEDULE_URL = "https://www.mejorvidainsurance.com/quote.html?schedule=1";
const VCF_URL = "https://www.mejorvidainsurance.com/julie.vcf";

/** Tight-cropped logos (no large white canvas) so the blue header sits flush under the artwork in email clients. */
const LOGO_EN = "https://www.mejorvidainsurance.com/img/logo-english2-email.png";
const LOGO_ES = "https://www.mejorvidainsurance.com/img/logo-spanish2-email.png";

/** Logo in top strip (left). Explicit width helps email clients render the image. */
const LOGO_MAX_WIDTH_PX = 440;

/** ManyChat may send "$28" or "28" — strip leading $ so we show a single $. */
function sanitizeMoneyField(v) {
  return String(v ?? "")
    .replace(/^\$+/, "")
    .trim();
}

function btn(text, url, bg = "#3b82f6", color = "#fff") {
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
<style>body{margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;text-align:left !important;}
.c{max-width:600px;margin:8px auto 32px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);text-align:left !important;}
.hdr-logo-cell{text-align:left !important;}
.hdr-logo-cell img{display:block !important;margin:0 !important;margin-left:0 !important;margin-right:auto !important;border:0 !important;}
.b{padding:44px 32px 32px;color:#333;font-size:16px;line-height:1.7;}
.b p{margin:0 0 16px;}.cta{text-align:center;padding:8px 0 24px;}
.quote-box{background:#e8f5e9;border:2px solid #43a047;border-radius:10px;padding:20px;text-align:center;margin:20px 0;}
.quote-box .range{font-size:32px;font-weight:bold;color:#2e7d32;}
.quote-box .label{font-size:13px;color:#666;margin-top:4px;}
.appt-box{background:#e3f2fd;border:2px solid #1565c0;border-radius:10px;padding:16px 20px;margin:20px 0;}
.appt-box h3{color:#1565c0;font-size:15px;margin:0 0 6px;}
.check{color:#43a047;margin-right:6px;}
.f{background:#f4f6f8;padding:20px 32px;font-size:12px;color:#888;text-align:center;border-top:1px solid #e0e0e0;}
</style></head><body><div class="c" style="text-align:left !important;">
<!-- One table: logo row + blue row (no gap between separate tables). Logo forced left with .hdr-logo -->
<table role="presentation" align="left" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;text-align:left !important;">
<tr>
<td class="hdr-logo-cell" bgcolor="#ffffff" align="left" valign="top" style="padding:0 16px 0 16px;text-align:left !important;vertical-align:top;line-height:0;font-size:0;mso-line-height-rule:exactly;">
<a href="https://www.mejorvidainsurance.com" style="text-align:left !important;text-decoration:none;display:block;">
<img src="${logoUrl}" alt="Mejor Vida Insurance" align="left" width="${LOGO_MAX_WIDTH_PX}" border="0" style="width:${LOGO_MAX_WIDTH_PX}px;max-width:${LOGO_MAX_WIDTH_PX}px;height:auto;display:block;border:0;outline:none;margin-top:0;margin-bottom:0;margin-left:0;margin-right:auto;" />
</a>
</td>
</tr>
<tr>
<td bgcolor="#1e3a8a" style="padding:0;line-height:0;font-size:0;mso-line-height-rule:exactly;border-top:0;">
<div style="height:6px;line-height:6px;font-size:1px;">&nbsp;</div>
</td>
</tr>
</table>
<div class="b">${body}</div>
<div class="f"><p>&copy; Mejor Vida Insurance | <a href="https://www.mejorvidainsurance.com" style="color:#888;">mejorvidainsurance.com</a></p>
<p><a href="https://www.mejorvidainsurance.com/unsubscribe" style="color:#888;">Unsubscribe</a></p></div>
</div></body></html>`;
}

function buildEmailEN(name, quoteLow, quoteHigh, callScheduled, callDatetime) {
  const low = sanitizeMoneyField(quoteLow);
  const high = sanitizeMoneyField(quoteHigh);
  const quoteBlock =
    low && high
      ? `<div class="quote-box">
        <div class="range">$${low} – $${high}/mo</div>
        <div class="label">Your estimated monthly rate for final expense coverage</div>
       </div>`
      : "";

  const apptBlock = callScheduled
    ? `<div class="appt-box">
        <h3>📅 Your Appointment with Julie</h3>
        <p style="margin:0;font-size:14px;color:#333;">${callDatetime ? `You're confirmed for <strong>${callDatetime}</strong>.` : "You're all set! Julie is looking forward to speaking with you."} She'll walk you through your options and answer any questions.</p>
       </div>`
    : `<p>When you're ready to take the next step, schedule a quick call — no pressure, just a friendly conversation.</p>
       <div class="cta">${btn("Schedule a Call with Julie", SCHEDULE_URL)}</div>`;

  return {
    subject: `Your quote is ready, ${name}! 📋`,
    html: wrap(
      `
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
<div class="cta">${btn("Save Julie's Contact Card", VCF_URL, "#43a047")}</div>
${signatureBlockEN()}`,
      LOGO_EN,
    ),
  };
}

function buildEmailES(name, quoteLow, quoteHigh, callScheduled, callDatetime) {
  const low = sanitizeMoneyField(quoteLow);
  const high = sanitizeMoneyField(quoteHigh);
  const quoteBlock =
    low && high
      ? `<div class="quote-box">
        <div class="range">$${low} – $${high}/mes</div>
        <div class="label">Tu tarifa mensual estimada para cobertura de gastos finales</div>
       </div>`
      : "";

  const apptBlock = callScheduled
    ? `<div class="appt-box">
        <h3>📅 Tu Cita con Julie</h3>
        <p style="margin:0;font-size:14px;color:#333;">${callDatetime ? `¡Estás confirmado/a para el <strong>${callDatetime}</strong>!` : "¡Todo listo!"} Julie está emocionada de hablar contigo. Te explicará tus opciones y responderá cualquier pregunta.</p>
       </div>`
    : `<p>Cuando estés lista para el siguiente paso, agenda una llamada rápida — sin presión.</p>
       <div class="cta">${btn("Agenda una Llamada con Julie", SCHEDULE_URL)}</div>`;

  return {
    subject: `¡Tu cotización está lista, ${name}! 📋`,
    html: wrap(
      `
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
<div class="cta">${btn("Guardar Contacto de Julie", VCF_URL, "#43a047")}</div>
${signatureBlockES()}`,
      LOGO_ES,
    ),
  };
}

module.exports = {
  buildEmailEN,
  buildEmailES,
  LOGO_EN,
  LOGO_ES,
  QUOTE_URL,
  SCHEDULE_URL,
  VCF_URL,
};
