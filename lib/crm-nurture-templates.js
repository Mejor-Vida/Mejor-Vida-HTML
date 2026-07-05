/**
 * Email + SMS copy for CRM nurture engine — lead messages default to Spanish.
 */

const {
  wrapResendEmailHtml,
  signatureBlockEN,
  signatureBlockES,
  LOGO_EN,
  LOGO_ES,
} = require("./resend-email-template");

const VCF_URL = "https://www.mejorvidainsurance.com/julie.vcf";
const QUOTE_URL = "https://www.mejorvidainsurance.com/quote.html";
const SCHEDULE_URL = "https://www.mejorvidainsurance.com/schedule-julie.html";

function contactLang(contact) {
  const lang = String(contact.idioma || contact.language || "").toLowerCase();
  return lang === "english" || lang === "en" ? "english" : "spanish";
}

/** Lead-facing nurture language — settings.content_language overrides contact. */
function resolveNurtureLang(contact, settings, templateKey) {
  if (String(templateKey || "") === "new_lead_notify") return "english";
  const cfg = settings && String(settings.content_language || "").toLowerCase();
  if (cfg === "spanish" || cfg === "english") return cfg;
  return contactLang(contact);
}

function contactName(contact, lang) {
  const name =
    (contact.first_name || (contact.full_name || "").split(" ")[0] || "").trim() || "";
  if (name) return name;
  return lang === "english" ? "there" : "amigo/a";
}

function sampleSpanishContact() {
  return {
    first_name: "María",
    last_name: "García",
    email: "maria@example.com",
    phone: "+14025551234",
    language: "spanish",
    idioma: "spanish",
  };
}

function btn(text, url, bg = "#1a56db", color = "#fff") {
  return `<a href="${url}" style="display:inline-block;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:15px;text-decoration:none;margin:8px 6px;background:${bg};color:${color};">${text}</a>`;
}

function getCrmNurtureEmail(templateKey, contact, settings) {
  contact = contact || sampleSpanishContact();
  settings = settings || { content_language: "spanish" };
  const key = String(templateKey || "").trim();
  const lang = resolveNurtureLang(contact, settings, key);
  const isEn = lang === "english";
  const name = contactName(contact, lang);
  const logoUrl = isEn ? LOGO_EN : LOGO_ES;
  const sig = isEn ? signatureBlockEN() : signatureBlockES();

  const templates = {
    welcome: isEn
      ? {
          subject: `Welcome to Mejor Vida Insurance, ${name}!`,
          html: wrapResendEmailHtml(
            `<p>Hi ${name},</p>
<p>I'm Julie with Mejor Vida Insurance. Thank you for reaching out about final expense coverage.</p>
<p>Over the next few days I'll personally follow up to answer your questions and help you find a plan that fits your budget — no pressure, just honest guidance.</p>
<p>Plans often start under <strong>$30/month</strong>, and the whole process can take just a few minutes.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Get My Free Quote", QUOTE_URL)} ${btn("Schedule a Call", SCHEDULE_URL, "#fff", "#1a56db")}</div>
<p style="font-size:14px;color:#555;">Save my contact: <a href="${VCF_URL}" style="color:#1a56db;">Julie's contact card</a></p>
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: `¡Bienvenido/a a Mejor Vida Insurance, ${name}!`,
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>Soy Julie de Mejor Vida Insurance. Gracias por contactarnos sobre cobertura para gastos finales.</p>
<p>En los próximos días te daré seguimiento personalmente para responder tus preguntas y ayudarte a encontrar un plan que se ajuste a tu presupuesto — sin presión, solo orientación honesta.</p>
<p>Los planes suelen comenzar desde <strong>$30/mes</strong>, y todo el proceso puede tomar solo unos minutos.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Obtener cotización gratis", QUOTE_URL)} ${btn("Agendar llamada", SCHEDULE_URL, "#fff", "#1a56db")}</div>
<p style="font-size:14px;color:#555;">Guarda mi contacto: <a href="${VCF_URL}" style="color:#1a56db;">Tarjeta de contacto de Julie</a></p>
${sig}`,
            logoUrl
          ),
        },
    educational_day2: isEn
      ? {
          subject: "What is final expense insurance? (Plain English)",
          html: wrapResendEmailHtml(
            `<p>Hi ${name},</p>
<p>Final expense insurance is designed to cover funeral costs and related bills so your family isn't left with unexpected expenses.</p>
<p>It's usually simpler than traditional life insurance — fixed premiums, no medical exam for many plans, and coverage that lasts your whole life.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Schedule a Quick Call", SCHEDULE_URL)}</div>
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: "¿Qué es el seguro de gastos finales?",
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>El seguro de gastos finales está diseñado para cubrir costos funerarios y gastos relacionados para que tu familia no quede con deudas inesperadas.</p>
<p>Generalmente es más simple que un seguro de vida tradicional — primas fijas, sin examen médico en muchos planes, y cobertura de por vida.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Agendar una llamada rápida", SCHEDULE_URL)}</div>
${sig}`,
            logoUrl
          ),
        },
    contacted_educational: isEn
      ? {
          subject: "A quick note from Julie — final expense tips",
          html: wrapResendEmailHtml(
            `<p>Hi ${name},</p>
<p>I wanted to share a quick tip: many families wait too long to explore final expense coverage. The earlier you look, the more options you typically have.</p>
<p>I'm here whenever you're ready — just reply or schedule a call.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Schedule a Call", SCHEDULE_URL)}</div>
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: "Una nota rápida de Julie — consejos sobre gastos finales",
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>Quería compartir un consejo: muchas familias esperan demasiado para explorar la cobertura de gastos finales. Mientras antes lo revises, más opciones suele haber.</p>
<p>Estoy aquí cuando estés listo/a — solo responde o agenda una llamada.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Agendar llamada", SCHEDULE_URL)}</div>
${sig}`,
            logoUrl
          ),
        },
    new_lead_notify: {
      subject: `[CRM] New lead: ${name}`,
      html: wrapResendEmailHtml(
        `<p><strong>New lead enrolled in the New sequence.</strong></p>
<p>Name: ${name}<br/>
Phone: ${contact.phone || "—"}<br/>
Email: ${contact.email || "—"}</p>
<p>Call tasks have been scheduled. Open the CRM dashboard for today's list.</p>`,
        LOGO_EN
      ),
    },
  };

  return templates[key] || null;
}

function getCrmNurtureSms(templateKey, contact, settings) {
  contact = contact || sampleSpanishContact();
  settings = settings || { content_language: "spanish" };
  const key = String(templateKey || "").trim();
  const lang = resolveNurtureLang(contact, settings, key);
  const isEn = lang === "english";
  const name = contactName(contact, lang);

  if (key === "welcome_sms") {
    return isEn
      ? `Hi ${name}! Julie from Mejor Vida Insurance here. Thanks for reaching out about final expense coverage. I'll be calling soon — save my contact: ${VCF_URL} Reply STOP to unsubscribe.`
      : `¡Hola ${name}! Soy Julie de Mejor Vida Insurance. Gracias por contactarnos sobre gastos finales. Te llamaré pronto — guarda mi contacto: ${VCF_URL} Responde STOP para cancelar.`;
  }
  if (key === "day2_sms") {
    return isEn
      ? `Hi ${name}, Julie from Mejor Vida Insurance. Just checking in — reply CALL to schedule or QUOTE for a free quote link. ${VCF_URL} Reply STOP to unsubscribe.`
      : `Hola ${name}, Julie de Mejor Vida Insurance. Solo para dar seguimiento — responde LLAMAR para agendar o COTIZAR para el enlace. ${VCF_URL} Responde STOP para cancelar.`;
  }
  return null;
}

function wrapNewsletterHtml(heroHtml, bodyHtml, contact, settings) {
  settings = settings || { content_language: "spanish" };
  const lang = resolveNurtureLang(contact || {}, settings, "newsletter");
  const isEn = lang === "english";
  const logoUrl = isEn ? LOGO_EN : LOGO_ES;
  const sig = isEn ? signatureBlockEN() : signatureBlockES();
  const inner = `${heroHtml || ""}${bodyHtml || ""}${sig}`;
  return wrapResendEmailHtml(inner, logoUrl);
}

module.exports = {
  getCrmNurtureEmail,
  getCrmNurtureSms,
  wrapNewsletterHtml,
  contactLang,
  contactName,
  resolveNurtureLang,
  sampleSpanishContact,
};
