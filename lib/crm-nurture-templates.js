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

function buildContactedEducationalEmail(weekNum, ctx) {
  const { isEn, name, logoUrl, sig } = ctx;
  const w = Math.max(1, Math.min(4, Number(weekNum) || 1));
  const vcfPs = isEn
    ? `<p style="font-size:14px;color:#555;">P.S. — Save my contact so I'm always just one tap away: <a href="${VCF_URL}" style="color:#1a56db;">Julie's contact card</a></p>`
    : `<p style="font-size:14px;color:#555;">P.D. — Guarde mi contacto para tenerme siempre a la mano: <a href="${VCF_URL}" style="color:#1a56db;">Tarjeta de contacto de Julie</a></p>`;

  const weeks = {
    1: isEn
      ? {
          subject: `I wanted to reach out personally, ${name}…`,
          html: wrapResendEmailHtml(
            `<p>Hi ${name},</p>
<p>I'm Julie, and I work with Mejor Vida Insurance helping families get the final expense coverage they need — without the confusion or the hard sell.</p>
<p>You reached out a little while ago, and I just wanted to check in personally. Life gets busy, I get it. But I didn't want you to fall through the cracks.</p>
<p>Final expense insurance is one of those things that's easy to put off — until it's too late. And once you have it, you never have to think about it again. Plans start under <strong>$30/month</strong>, and the whole process takes just a few minutes.</p>
<p>Whenever you're ready, I'm here. No pressure, no rush.</p>
${leadEmailCtaRow(true)}
${vcfPs}
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: `Quería escribirle personalmente, ${name}…`,
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>Le habla Julie con Mejor Vida Insurance. Hace un tiempo se puso en contacto conmigo y quería escribirle personalmente. La vida es ocupada, lo entiendo perfectamente, pero no quería que este tema tan importante se le pasara por alto.</p>
<p>El seguro de gastos finales es fácil de posponer… hasta que ya es demasiado tarde. Contamos con planes muy accesibles que podrían estar desde $30 al mes.</p>
<p>Para mí lo más importante es protegerle bien. Por eso, cuando usted decida dar el paso, nos tomaremos el tiempo necesario en una llamada para resolver sus dudas y dejar su cobertura lista y aprobada, sin prisas ni presiones.</p>
<p>¿Qué día de esta semana tiene un espacio libre para que conversemos con calma?</p>
${sig}`,
            logoUrl
          ),
        },
    2: isEn
      ? {
          subject: "What exactly IS final expense insurance? (plain English)",
          html: wrapResendEmailHtml(
            `<p>Hi ${name},</p>
<p>I get this question a lot, so I wanted to break it down simply.</p>
<p><strong>Final expense insurance</strong> is a small whole life policy — usually between $5,000 and $25,000 — designed to cover end-of-life costs like funeral expenses, burial, and outstanding medical bills.</p>
<p>✅ No medical exam — just a few health questions<br>
✅ Fixed monthly premium — it never goes up<br>
✅ Coverage never expires — as long as you pay, you're covered<br>
✅ Pays out fast — usually within days, directly to your family</p>
<p>The average funeral today costs between <strong>$8,000 and $12,000</strong>. Without coverage, that burden falls entirely on the people you love most — at the hardest moment of their lives.</p>
<p>The good news? You can get covered today for less than a dollar a day.</p>
${leadEmailCtaRow(true)}
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: "¿Qué es exactamente el seguro de gastos finales?",
          html: wrapResendEmailHtml(
            `<p>Recibo esta pregunta con frecuencia, así que quería explicárselo de manera sencilla. El seguro de gastos finales es una póliza de vida entera diseñada para cubrir costos como gastos funerarios, entierro y otros gastos como facturas médicas pendientes.</p>
<p>Lo mejor de este plan es:<br>
✅ Sin examen médico: Solo algunas preguntas de salud por teléfono.<br>
✅ Precio fijo: Su pago mensual nunca sube.<br>
✅ Protección de por vida: La cobertura nunca vence.<br>
✅ Pago rápido: El dinero llega directamente a su familia en días.</p>
<p>Un funeral promedio hoy cuesta entre $8,000 y $12,000. Sin cobertura, esa carga recae completamente sobre sus seres queridos en el momento más difícil de sus vidas.</p>
<p>¿La buena noticia? Existen opciones muy accesibles y diseñadas para adaptarse a su presupuesto. Estoy aquí para ayudarle a resolver sus dudas. Por favor déjeme saber cómo le puedo colaborar.</p>
${sig}`,
            logoUrl
          ),
        },
    3: isEn
      ? {
          subject: "Why I started doing this work…",
          html: wrapResendEmailHtml(
            `<p>Hi ${name},</p>
<p>I wanted to share something personal with you. When my dad passed away, we didn't have a final expense plan… and what should have been a time for family turned into stress trying to figure out how to pay for everything.</p>
<p>That's why I care so much about helping families plan ahead. It's not just about money — it's about protecting the people you love during one of the hardest moments of their lives.</p>
<p>If you've been thinking about it, I'd love to walk you through your options.</p>
${leadEmailCtaRow(true)}
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: "Por qué hago este trabajo…",
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>Quería compartirle algo personal. Cuando mi papá falleció, no teníamos un plan de gastos finales… y lo que debía ser un momento para estar en familia se convirtió en estrés tratando de ver cómo pagar todo.</p>
<p>Por eso me importa tanto ayudar a las familias a planear con tiempo. No se trata solo del dinero — se trata de proteger a las personas que usted ama en uno de los momentos más difíciles de sus vidas.</p>
<p>Si lo ha estado pensando, con gusto le explico sus opciones.</p>
${leadEmailCtaRow(false)}
${sig}`,
            logoUrl
          ),
        },
    4: isEn
      ? {
          subject: "I don't want to keep bothering you…",
          html: wrapResendEmailHtml(
            `<p>Hi ${name},</p>
<p>I've reached out a few times now, and I completely understand if the timing hasn't been right.</p>
<p>I'm not going to keep filling your inbox — I promise this is my last email for a while. But I did want to say one more thing before I give you some space:</p>
<p>The people who need this coverage the most are often the ones who wait the longest. And I've seen firsthand what happens when a family isn't protected. It's heartbreaking — and it's preventable.</p>
<p>If there's any part of you that knows you should have this taken care of, please don't wait for the "right time." It takes less than 10 minutes. Plans start under $30/month.</p>
<p>I'll be here whenever you're ready. Just reply to this email, click below, or give me a call anytime.</p>
${leadEmailCtaRow(true)}
${sig}`,
            logoUrl
          ),
        }
      : {
          subject: "No quiero seguir molestando…",
          html: wrapResendEmailHtml(
            `<p>Hola ${name},</p>
<p>Le he escrito varias veces y entiendo perfectamente si el momento no ha sido el adecuado.</p>
<p>No voy a seguir llenando su bandeja de entrada — le prometo que este es mi último correo por un tiempo. Pero quería decirle una cosa más antes de darle espacio:</p>
<p>Las personas que más necesitan esta cobertura son a menudo las que más esperan. Y he visto de cerca lo que pasa cuando una familia no está protegida. Es desgarrador — y se puede prevenir.</p>
<p>Si hay alguna parte de usted que sabe que debería tener esto resuelto, por favor no espere el "momento perfecto." Los planes pueden comenzar desde $30/mes.</p>
<p>Aquí estaré cuando usted esté listo/a. Solo responda a este mensaje, haga clic abajo, o llámeme cuando le sea conveniente.</p>
${sig}`,
            logoUrl
          ),
        },
  };

  return weeks[w] || weeks[1];
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
  const emailCtx = { isEn, name, logoUrl, sig };

  if (key === "contacted_educational" || /^contacted_educational_\d+$/.test(key)) {
    const weekNum =
      key === "contacted_educational" ? 1 : parseInt(key.replace("contacted_educational_", ""), 10) || 1;
    return buildContactedEducationalEmail(weekNum, emailCtx);
  }

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
<p>Gracias por su interés.</p>
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
      : `¡Hola ${name}! Le habla Julie con Mejor Vida Insurance. Gracias por contactarnos acerca de gastos finales. Le llamaré pronto — Por favor guarde mi contacto: ${VCF_URL} Responda STOP si ya no desea recibir mensajes.`;
  }
  if (key === "day2_sms") {
    return isEn
      ? `Hi ${name}, Julie from Mejor Vida Insurance. Just checking in — reply CALL to schedule or QUOTE for a free quote link. ${VCF_URL} Reply STOP to unsubscribe.`
      : `Hola ${name}, le habla Julie de Mejor Vida Insurance. Solo le escribo para dar seguimiento a su solicitud de información acerca de seguro de vida de gastos finales. Responda LLAMAR si desea agendar una llamada o COTIZAR si prefiere recibir un enlace para obtener una cotización. ${VCF_URL} Responda STOP si ya no desea recibir mensajes.`;
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
