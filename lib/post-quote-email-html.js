/**
 * Post-quote email content (api/post-quote-email.js).
 * Shell + signatures: lib/resend-email-template.js
 */

const {
  wrapResendEmailHtml,
  signatureBlockEN,
  signatureBlockES,
  LOGO_EN,
  LOGO_ES,
} = require("./resend-email-template");

const QUOTE_URL = "https://www.mejorvidainsurance.com/quote.html";
const SCHEDULE_URL = "https://www.mejorvidainsurance.com/schedule-julie.html";
const VCF_URL = "https://www.mejorvidainsurance.com/julie.vcf";

/** ManyChat may send "$28" or "28" — strip leading $ so we show a single $. */
function sanitizeMoneyField(v) {
  return String(v ?? "")
    .replace(/^\$+/, "")
    .trim();
}

function btn(text, url, bg = "#3b82f6", color = "#fff") {
  return `<a href="${url}" style="display:inline-block;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:15px;text-decoration:none;margin:8px 6px;background:${bg};color:${color};">${text}</a>`;
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
    html: wrapResendEmailHtml(
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

function buildOverAgeEmailEN(name, callScheduled, callDatetime) {
  const apptBlock = callScheduled
    ? `<div class="appt-box">
        <h3>📅 Your Appointment with Julie</h3>
        <p style="margin:0;font-size:14px;color:#333;">${callDatetime ? `You're confirmed for <strong>${callDatetime}</strong>.` : "You're all set! Julie is looking forward to speaking with you."} She'll walk through what options may still fit your situation.</p>
       </div>`
    : `<p>If you'd like to talk, schedule a brief call at a time that works for you — I'm happy to help in English or Spanish.</p>
       <div class="cta">${btn("Schedule a Call with Julie", SCHEDULE_URL)}</div>`;

  return {
    subject: `Thank you, ${name} — Julie will follow up personally`,
    html: wrapResendEmailHtml(
      `
<p>Hi ${name},</p>
<p>Thank you for sharing your information with me.</p>
<p>Based on your age, I wasn't able to generate an automated quote through our standard final expense carriers — the products I work with most commonly issue new coverage through age 85.</p>
<p>That doesn't mean you're out of options. I'd like to speak with you personally to understand your situation and walk through what may still be available — whether that's exploring other paths to help with funeral costs or simply answering your questions with no pressure.</p>
${apptBlock}
<p>And save my contact so I'm always just one tap away:</p>
<div class="cta">${btn("Save Julie's Contact Card", VCF_URL, "#43a047")}</div>
${signatureBlockEN()}`,
      LOGO_EN,
    ),
  };
}

function buildOverAgeEmailES(name, callScheduled, callDatetime) {
  const apptBlock = callScheduled
    ? `<div class="appt-box">
        <h3>📅 Tu Cita con Julie</h3>
        <p style="margin:0;font-size:14px;color:#333;">${callDatetime ? `¡Estás confirmado/a para el <strong>${callDatetime}</strong>!` : "¡Todo listo!"} Julie está emocionada de hablar contigo y revisar qué opciones pueden encajar con tu situación.</p>
       </div>`
    : `<p>Si te gustaría platicar, agenda una llamada breve cuando te convenga — con gusto te atiendo en español o inglés.</p>
       <div class="cta">${btn("Agenda una Llamada con Julie", SCHEDULE_URL)}</div>`;

  return {
    subject: `Gracias, ${name} — Julie te contactará personalmente`,
    html: wrapResendEmailHtml(
      `
<p>Hola ${name},</p>
<p>Gracias por compartir tu información conmigo.</p>
<p>Según tu edad, no pude generar una cotización automática con nuestras compañías habituales de gastos finales — los productos con los que trabajo normalmente emiten cobertura nueva hasta los 85 años.</p>
<p>Eso no significa que no haya alternativas. Me gustaría hablar contigo personalmente para entender tu situación y revisar qué opciones pueden existir — ya sea explorar otras formas de ayudar con los gastos funerarios o simplemente responder tus preguntas, sin presión.</p>
${apptBlock}
<p>Y guarda mi contacto para tenerme siempre a un toque:</p>
<div class="cta">${btn("Guardar Contacto de Julie", VCF_URL, "#43a047")}</div>
${signatureBlockES()}`,
      LOGO_ES,
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
    html: wrapResendEmailHtml(
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
  buildOverAgeEmailEN,
  buildOverAgeEmailES,
  LOGO_EN,
  LOGO_ES,
  QUOTE_URL,
  SCHEDULE_URL,
  VCF_URL,
};
