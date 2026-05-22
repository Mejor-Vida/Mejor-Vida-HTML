/**
 * SMS + email copy for nurture — shared by nurture-cron and staff pipeline preview.
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

/** Uses contact.idioma if set; otherwise contacts.language ('english' | 'spanish'). */
function getSmsMessage(step, contact) {
  const name =
    (contact.first_name || (contact.full_name || "").split(" ")[0] || "").trim() || null;
  const lang = String(contact.idioma || contact.language || "").toLowerCase();
  const isEnglish = lang === "english";

  if (isEnglish) {
    const nameEn = name || "there";
    if (step === 1)
      return `Hi ${nameEn}! This is Julie from Mejor Vida Insurance. You recently asked about final expense coverage — reply QUOTE and I'll send you a free quote link, or reply CALL to schedule a quick chat with me. Reply STOP to unsubscribe.`;
    if (step === 2)
      return `Hey ${nameEn}, Julie here from Mejor Vida Insurance! Final expense plans start under $30/month — could be a perfect fit. Save my contact so I'm just a tap away 👉 ${VCF_URL} — then reply QUOTE or CALL. Reply STOP to unsubscribe.`;
    if (step === 3)
      return `Hi ${nameEn}, Julie from Mejor Vida Insurance checking in one last time. I'd love to help you get covered — just reply QUOTE or CALL and I'll take care of the rest. Reply STOP to unsubscribe.`;
  } else {
    const nameEs = name || "amigo/a";
    if (step === 1)
      return `¡Hola ${nameEs}! Soy Julie de Mejor Vida Insurance. Hace poco preguntaste sobre cobertura para gastos finales — responde COTIZAR y te envío el enlace, o responde LLAMAR para agendar una llamada rápida conmigo. Responde STOP para cancelar.`;
    if (step === 2)
      return `¡Hola ${nameEs}! Julie de Mejor Vida Insurance. Los planes de gastos finales comienzan desde $30/mes — puede ser justo lo que necesitas. Guarda mi contacto para tenerme a la mano 👉 ${VCF_URL} — luego responde COTIZAR o LLAMAR. Responde STOP para cancelar.`;
    if (step === 3)
      return `Hola ${nameEs}, soy Julie de Mejor Vida Insurance. Te escribo por última vez — me encantaría ayudarte a obtener cobertura. Solo responde COTIZAR o LLAMAR y yo me encargo del resto. Responde STOP para cancelar.`;
  }
  return null;
}

function getEmailContent(step, contact) {
  const name =
    (contact.first_name || (contact.full_name || "").split(" ")[0] || "there").trim() || "there";
  const lang = String(contact.idioma || contact.language || "").toLowerCase();
  const isEnglish = lang === "english";
  const logoUrl = isEnglish ? LOGO_EN : LOGO_ES;
  const sig = isEnglish ? signatureBlockEN() : signatureBlockES();
  const quoteUrl = QUOTE_URL;
  const scheduleUrl = SCHEDULE_URL;

  const btn = (text, url, bg = "#1a56db", color = "#fff") =>
    `<a href="${url}" style="display:inline-block;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:15px;text-decoration:none;margin:8px 6px;background:${bg};color:${color};">${text}</a>`;

  const vcfPs = !contact.vcf_sent_at
    ? `<p style="font-size:14px;color:#555;border-top:1px solid #e0e0e0;padding-top:12px;margin-top:8px;">📱 <strong>P.S.</strong> — Save my contact so I'm always one tap away: <a href="${VCF_URL}" style="color:#1a56db;">Save Julie's Contact Card</a></p>`
    : "";

  const nameEs = name === "there" ? "amigo/a" : name;

  const tEN = {
    1: {
      subject: `I wanted to reach out personally, ${name}…`,
      html: wrapResendEmailHtml(
        `<p>Hi ${name},</p>
<p>I'm Julie, and I work with Mejor Vida Insurance helping families get the final expense coverage they need — without the confusion or the hard sell.</p>
<p>You reached out a little while ago, and I just wanted to check in personally. Life gets busy, I get it. But I didn't want you to fall through the cracks.</p>
<p>Final expense insurance is one of those things that's easy to put off — until it's too late. And once you have it, you never have to think about it again. Plans start under <strong>$30/month</strong>, and the whole process takes just a few minutes.</p>
<p>Whenever you're ready, I'm here. No pressure, no rush.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Get My Free Quote", quoteUrl)} ${btn("Schedule a Call with Julie", scheduleUrl, "#fff", "#1a56db")}</div>
${vcfPs}
${sig}`,
        logoUrl
      ),
    },
    2: {
      subject: `What exactly IS final expense insurance? (plain English)`,
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
<div style="text-align:center;padding:8px 0 24px;">${btn("See My Options", quoteUrl)} ${btn("Talk to Julie", scheduleUrl, "#fff", "#1a56db")}</div>
${sig}`,
        logoUrl
      ),
    },
    3: {
      subject: `Why I started doing this work…`,
      html: wrapResendEmailHtml(
        `<p>Hi ${name},</p>
<p>I wanted to share something personal with you. When my dad passed away, we didn't have a final expense plan… and what should have been a time for family turned into stress trying to figure out how to pay for everything.</p>
<p>That's why I care so much about helping families plan ahead. It's not just about money — it's about protecting the people you love during one of the hardest moments of their lives.</p>
<p>If you've been thinking about it, I'd love to walk you through your options.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Schedule a Free Call with Julie", scheduleUrl)} ${btn("Get a Free Quote", quoteUrl, "#fff", "#1a56db")}</div>
${sig}`,
        logoUrl
      ),
    },
    4: {
      subject: `I don't want to keep bothering you…`,
      html: wrapResendEmailHtml(
        `<p>Hi ${name},</p>
<p>I've reached out a few times now, and I completely understand if the timing hasn't been right.</p>
<p>I'm not going to keep filling your inbox — I promise this is my last email for a while. But I did want to say one more thing before I give you some space:</p>
<p>The people who need this coverage the most are often the ones who wait the longest. And I've seen firsthand what happens when a family isn't protected. It's heartbreaking — and it's preventable.</p>
<p>If there's any part of you that knows you should have this taken care of, please don't wait for the "right time." It takes less than 10 minutes. Plans start under $30/month.</p>
<p>I'll be here whenever you're ready. Just reply to this email, click below, or give me a call anytime.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Get My Free Quote — 5 Minutes", quoteUrl)} ${btn("Schedule a Call with Julie", scheduleUrl, "#fff", "#1a56db")}</div>
${sig}`,
        logoUrl
      ),
    },
  };

  const tES = {
    1: {
      subject: `Quería escribirte personalmente, ${nameEs}…`,
      html: wrapResendEmailHtml(
        `<p>Hola ${nameEs},</p>
<p>Soy Julie, de Mejor Vida Insurance. Ayudo a familias a obtener la cobertura de gastos finales que necesitan — sin complicaciones ni presiones.</p>
<p>Hace un tiempo te pusiste en contacto conmigo, y quería escribirte personalmente. La vida es ocupada, lo entiendo. Pero no quería que se te pasara por alto.</p>
<p>El seguro de gastos finales es algo fácil de posponer — hasta que ya es demasiado tarde. Y una vez que lo tienes, ya no tienes que preocuparte más. Los planes comienzan desde <strong>$30/mes</strong>, y el proceso toma solo unos minutos.</p>
<p>Cuando estés listo/a, aquí estaré. Sin presión, sin prisa.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Obtener Mi Cotización Gratis", quoteUrl)} ${btn("Agendar una Llamada con Julie", scheduleUrl, "#fff", "#1a56db")}</div>
${vcfPs}
${sig}`,
        logoUrl
      ),
    },
    2: {
      subject: `¿Qué es exactamente el seguro de gastos finales?`,
      html: wrapResendEmailHtml(
        `<p>Hola ${nameEs},</p>
<p>Me hacen esta pregunta con frecuencia, así que quería explicarlo de manera sencilla.</p>
<p><strong>El seguro de gastos finales</strong> es una póliza de vida entera pequeña — generalmente entre $5,000 y $25,000 — diseñada para cubrir costos al final de la vida, como gastos funerarios, entierro y facturas médicas pendientes.</p>
<p>✅ Sin examen médico — solo algunas preguntas de salud<br>
✅ Prima mensual fija — nunca sube<br>
✅ La cobertura nunca vence — mientras pagues, estás protegido/a<br>
✅ El pago es rápido — generalmente en días, directamente a tu familia</p>
<p>El funeral promedio hoy cuesta entre <strong>$8,000 y $12,000</strong>. Sin cobertura, esa carga recae completamente sobre las personas que más quieres — en el momento más difícil de sus vidas.</p>
<p>¿La buena noticia? Puedes quedar cubierto/a hoy por menos de un dólar al día.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Ver Mis Opciones", quoteUrl)} ${btn("Hablar con Julie", scheduleUrl, "#fff", "#1a56db")}</div>
${sig}`,
        logoUrl
      ),
    },
    3: {
      subject: `Por qué empecé a hacer este trabajo…`,
      html: wrapResendEmailHtml(
        `<p>Hola ${nameEs},</p>
<p>Quería compartir algo personal contigo. Cuando mi papá falleció, no teníamos un plan de gastos finales… y lo que debería haber sido un tiempo de familia se convirtió en estrés tratando de pagar todo.</p>
<p>Por eso me importa tanto ayudar a las familias a planificar con anticipación. No se trata solo del dinero — se trata de proteger a las personas que amas en uno de los momentos más difíciles de sus vidas.</p>
<p>Si lo has estado pensando, me encantaría ayudarte a revisar tus opciones.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Agendar una Llamada Gratis con Julie", scheduleUrl)} ${btn("Obtener una Cotización Gratis", quoteUrl, "#fff", "#1a56db")}</div>
${sig}`,
        logoUrl
      ),
    },
    4: {
      subject: `No quiero seguir molestándote…`,
      html: wrapResendEmailHtml(
        `<p>Hola ${nameEs},</p>
<p>Te he escrito varias veces y entiendo perfectamente si el momento no ha sido el adecuado.</p>
<p>No voy a seguir llenando tu bandeja de entrada — te prometo que este es mi último correo por un tiempo. Pero quería decirte una cosa más antes de darte espacio:</p>
<p>Las personas que más necesitan esta cobertura son a menudo las que más esperan. Y he visto de cerca lo que pasa cuando una familia no está protegida. Es desgarrador — y se puede prevenir.</p>
<p>Si hay alguna parte de ti que sabe que deberías tener esto arreglado, por favor no esperes el "momento perfecto." Toma menos de 10 minutos. Los planes comienzan desde $30/mes.</p>
<p>Aquí estaré cuando estés listo/a. Solo responde a este correo, haz clic abajo, o llámame cuando quieras.</p>
<div style="text-align:center;padding:8px 0 24px;">${btn("Obtener Mi Cotización — 5 Minutos", quoteUrl)} ${btn("Agendar una Llamada con Julie", scheduleUrl, "#fff", "#1a56db")}</div>
${sig}`,
        logoUrl
      ),
    },
  };

  const t = isEnglish ? tEN : tES;
  return t[step] || t[1];
}

module.exports = {
  VCF_URL,
  QUOTE_URL,
  SCHEDULE_URL,
  getSmsMessage,
  getEmailContent,
};
