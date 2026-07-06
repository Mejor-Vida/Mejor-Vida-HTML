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
const WHATSAPP_URL_ES =
  "https://wa.me/14024405438?text=Hola%2C%20me%20interesa%20obtener%20informaci%C3%B3n%20sobre%20el%20seguro%20de%20gastos%20finales.";
const WHATSAPP_URL_EN =
  "https://wa.me/14024405438?text=Hello%2C%20I%20am%20interested%20in%20learning%20about%20final%20expense%20insurance.";

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
  return lang === "english" ? "there" : "estimado/a";
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

function leadEmailCtaRow(isEn) {
  const quoteBtn = isEn
    ? btn("Get My Free Quote", QUOTE_URL)
    : btn("Obtener cotización gratis", QUOTE_URL);
  const scheduleBtn = isEn
    ? btn("Schedule a Call with Julie", SCHEDULE_URL, "#fec963", "#111")
    : btn("Agendar llamada con Julie", SCHEDULE_URL, "#fec963", "#111");
  const waBtn = isEn
    ? btn("WhatsApp", WHATSAPP_URL_EN, "#25D366", "#fff")
    : btn("WhatsApp", WHATSAPP_URL_ES, "#25D366", "#fff");
  return `<div style="text-align:center;padding:8px 0 24px;">${quoteBtn}${scheduleBtn}${waBtn}</div>`;
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
${leadEmailCtaRow(true)}
<p style="font-size:14px;color:#555;">Save my contact: <a href="${VCF_URL}" style="color:#1a56db;">Julie's contact card</a></p>
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: `Mejor Vida Insurance — bienvenida, ${name}`,
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>Le habla Julie con Mejor Vida Insurance. Gracias por contactarnos acerca de la cobertura para gastos finales.</p>
<p>En los próximos días le daré seguimiento personalmente para responder sus preguntas y ayudarle a encontrar un plan que se ajuste a su presupuesto — sin presión, sin compromiso, solo orientación honesta.</p>
<p>Los planes suelen comenzar desde <strong>$30/mes</strong>, y todo el proceso lo intentamos hacer lo más rápido y conveniente posible.</p>
${leadEmailCtaRow(false)}
<p style="font-size:14px;color:#555;">Guarde mi contacto: <a href="${VCF_URL}" style="color:#1a56db;">Tarjeta de contacto de Julie</a></p>
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
${leadEmailCtaRow(true)}
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: "¿Qué es el seguro de gastos finales?",
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>El seguro de gastos finales está diseñado para ayudar a cubrir los costos del funeral y otros gastos relacionados, para que su familia no tenga que enfrentar una carga económica inesperada.</p>
<p>En muchos casos, es más sencillo que un seguro de vida tradicional: las primas suelen ser fijas, no se requiere un examen médico y la cobertura puede durar toda la vida.</p>
<p>Si tiene alguna pregunta o le gustaría conocer las opciones disponibles para usted, con gusto puedo ayudarle.</p>
${leadEmailCtaRow(false)}
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
${leadEmailCtaRow(true)}
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: "Una nota rápida de Julie — consejos sobre gastos finales",
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>Quería compartir algo que he notado: muchas familias esperan demasiado para explorar la cobertura de gastos finales. Por lo general, mientras antes revise sus opciones, más oportunidades tendrá de encontrar una cobertura que se ajuste a sus necesidades y a su presupuesto.</p>
<p>Estoy aquí cuando usted decida dar el siguiente paso. Solo responda a este mensaje o agende una llamada cuando le sea conveniente.</p>
${leadEmailCtaRow(false)}
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
      : `¡Hola ${name}! Le habla Julie con Mejor Vida Insurance. Gracias por contactarnos acerca de gastos finales. Le llamaré pronto — guarde mi contacto: ${VCF_URL} Responda STOP si ya no desea recibir mensajes.`;
  }
  if (key === "day2_sms") {
    return isEn
      ? `Hi ${name}, Julie from Mejor Vida Insurance. Just checking in — reply CALL to schedule or QUOTE for a free quote link. ${VCF_URL} Reply STOP to unsubscribe.`
      : `Hola ${name}, le habla Julie de Mejor Vida Insurance. Solo le escribo para dar seguimiento a su solicitud de información. Responda LLAMAR si desea agendar una llamada o COTIZAR si prefiere recibir un enlace para obtener una cotización. ${VCF_URL} Responda STOP si ya no desea recibir mensajes.`;
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
  leadEmailCtaRow,
  contactLang,
  contactName,
  resolveNurtureLang,
  sampleSpanishContact,
};
