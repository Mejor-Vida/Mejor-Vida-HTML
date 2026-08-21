/**
 * Licensed-agent credentials email for staff Connect tab (during scheduled calls).
 * vCard link + public licenses page + Julie headshot.
 */

const {
  wrapResendEmailHtml,
  signatureBlockEN,
  signatureBlockES,
  LOGO_EN,
  LOGO_ES,
} = require("./resend-email-template");
const { plainTextToBodyHtml, isSpanishLanguage } = require("./staff-reply-email-body");
const { salutationLine, normalizeFirstName } = require("./medical-intake-lead-greeting");

const SITE = String(process.env.SITE_URL || "https://www.mejorvidainsurance.com").replace(/\/$/, "");
const VCF_URL = `${SITE}/julie.vcf`;
const JULIE_HEADSHOT_URL = `${SITE}/img/opt/julie-headshot.png`;
const ABOUT_JULIE_URL = `${SITE}/about-julie.html`;
const LICENSE_NUMBER = "21695431";
const LICENSE_LOOKUP_URL_EN = String(
  process.env.NEBRASKA_LICENSE_VERIFY_URL || `${SITE}/en/licenses.html`
).trim();
const LICENSE_LOOKUP_URL_ES = String(
  process.env.LICENSE_VERIFY_URL_ES || `${SITE}/licencias.html`
).trim();
/** @deprecated Prefer language-aware lookupUrl(); kept for callers that import the constant. */
const LICENSE_LOOKUP_URL = LICENSE_LOOKUP_URL_EN;

function lookupUrl(language) {
  return isSpanishLanguage(language) ? LICENSE_LOOKUP_URL_ES : LICENSE_LOOKUP_URL_EN;
}

function licenseImageUrl() {
  const fromEnv = String(process.env.AGENT_LICENSE_IMAGE_URL || "").trim();
  return fromEnv || "";
}

function buildAgentCredentialsSubject({ language, firstName }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const n = normalizeFirstName(firstName);
  if (useEs) {
    return n
      ? `${n}, contacto y credenciales de Julie — agente licenciada`
      : "Contacto y credenciales de Julie — agente licenciada";
  }
  return n
    ? `${n}, Julie's contact & license info`
    : "Julie's contact & license info — NPN #21695431";
}

/** Opening greeting + thank-you only (shown above the card in HTML). */
function buildAgentCredentialsIntroPlainText({ language, firstName }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const salutation = salutationLine(language, firstName);

  if (useEs) {
    return (
      `${salutation}\n\n` +
      `Gracias por tomarte el tiempo en nuestra llamada. Como acordamos, aquí tienes mi información ` +
      `oficial de contacto y licencia como agente licenciada en seguros de vida y salud.`
    );
  }

  return (
    `${salutation}\n\n` +
    `Thank you for your time on our call today. As discussed, here is my official contact and ` +
    `licensing information. I am a licensed life and health insurance agent.`
  );
}

/** Compact contact details for plain-text clients (after the intro). */
function buildAgentCredentialsPlainDetails({ language }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const licenseUrl = lookupUrl(language);

  if (useEs) {
    return (
      `Julie Braunsroth · Mejor Vida Insurance LLC\n` +
      `Licencia de productor #${LICENSE_NUMBER} (NE, KS, CO, NV)\n\n` +
      `Tarjeta de contacto (adjunta): ${VCF_URL}\n` +
      `Ver licencias: ${licenseUrl}\n` +
      `Teléfono: 402-440-5438 · WhatsApp: 402-440-5438\n` +
      `${SITE}\n\n` +
      `Julie Braunsroth\nMejor Vida Insurance`
    );
  }

  return (
    `Julie Braunsroth · Mejor Vida Insurance LLC\n` +
    `Producer License #${LICENSE_NUMBER} (NE, KS, CO, NV)\n\n` +
    `Contact card (attached): ${VCF_URL}\n` +
    `View licenses: ${licenseUrl}\n` +
    `Phone: 402-440-5438 · WhatsApp: 402-440-5438\n` +
    `${SITE}\n\n` +
    `Julie Braunsroth\nMejor Vida Insurance`
  );
}

/** Full plain-text body (for text/plain part of sent email). */
function buildAgentCredentialsPlainText({ language, firstName }) {
  const intro = buildAgentCredentialsIntroPlainText({ language, firstName });
  return `${intro}\n\n${buildAgentCredentialsPlainDetails({ language })}`;
}

/** Visual contact card — photo, license info, and action buttons only. */
function buildAgentCredentialsHtmlBlock({ language }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const licenseImg = licenseImageUrl();
  const licenseUrl = lookupUrl(language);
  const vcardLabel = useEs ? "Guardar contacto de Julie" : "Save Julie's contact card";
  const verifyLabel = useEs ? "Ver licencias estatales" : "View state licenses";
  const licenseLine = useEs
    ? `Licencia de productor #${LICENSE_NUMBER} · NE, KS, CO, NV`
    : `Producer License #${LICENSE_NUMBER} · NE, KS, CO, NV`;
  const titleLine = useEs
    ? "Agente licenciada — Seguros de vida y salud"
    : "Licensed Life &amp; Health Insurance Agent";

  let licensePhotoHtml = "";
  if (licenseImg) {
    licensePhotoHtml =
      `<p style="margin:16px 0 0;text-align:center;">` +
      `<img src="${licenseImg.replace(/"/g, "&quot;")}" alt="${useEs ? "Licencia de agente" : "Agent license"}" ` +
      `width="280" style="max-width:100%;height:auto;border-radius:8px;border:1px solid #e0e0e0;" />` +
      `</p>`;
  }

  return (
    `<div style="margin:8px 0 28px;padding:0;">` +
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;` +
    `box-shadow:0 4px 14px rgba(15,23,42,0.10);overflow:hidden;">` +
    `<div style="height:5px;background:linear-gradient(90deg,#1e3a8a 0%,#2563eb 100%);"></div>` +
    `<div style="padding:22px 20px 20px;">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">` +
    `<tr>` +
    `<td valign="top" width="124" style="padding-right:16px;">` +
    `<img src="${JULIE_HEADSHOT_URL}" alt="Julie Braunsroth" width="120" height="126" ` +
    `style="display:block;width:120px;height:auto;border-radius:10px;border:2px solid #1e3a8a;" />` +
    `</td>` +
    `<td valign="top" style="font-size:15px;color:#1e293b;line-height:1.55;">` +
    `<strong style="font-size:18px;color:#1e3a8a;">Julie Braunsroth</strong><br/>` +
    `<span style="color:#475569;">Mejor Vida Insurance LLC</span><br/>` +
    `${titleLine}<br/>` +
    `<strong style="color:#0f766e;font-size:15px;">${licenseLine}</strong><br/>` +
    `<span style="font-size:13px;color:#64748b;">English · Español · NE · KS · CO · NV</span>` +
    `</td></tr></table>` +
    licensePhotoHtml +
    `<p style="margin:22px 0 14px;text-align:center;">` +
    `<a href="${VCF_URL.replace(/"/g, "&quot;")}" style="display:inline-block;padding:14px 22px;background:#43a047;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;margin:6px 4px;">${vcardLabel}</a>` +
    `<a href="${licenseUrl.replace(/"/g, "&quot;")}" style="display:inline-block;padding:14px 22px;background:#1a4d8c;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;margin:6px 4px;">${verifyLabel}</a>` +
    `</p>` +
    `<p style="margin:0;font-size:13px;color:#64748b;text-align:center;line-height:1.5;">` +
    (useEs
      ? `📞 <a href="tel:+14024405438" style="color:#3b82f6;">402-440-5438</a> · ` +
        `💬 <a href="https://wa.me/14024405438" style="color:#3b82f6;">WhatsApp</a> · ` +
        `<a href="${ABOUT_JULIE_URL}" style="color:#3b82f6;">Conozca a la fundadora</a>`
      : `📞 <a href="tel:+14024405438" style="color:#3b82f6;">402-440-5438</a> · ` +
        `💬 <a href="https://wa.me/14024405438" style="color:#3b82f6;">WhatsApp</a> · ` +
        `<a href="${ABOUT_JULIE_URL}" style="color:#3b82f6;">Meet the founder</a>`) +
    `</p></div></div></div>`
  );
}

function buildAgentCredentialsAttachmentNoteHtml({ language }) {
  const useEs = isSpanishLanguage(language);
  const text = useEs
    ? "La tarjeta de contacto de Julie (<strong>julie.vcf</strong>) también está adjunta a este correo — ábrela para guardarla en tus contactos."
    : "Julie's contact card (<strong>julie.vcf</strong>) is also attached to this email — open it to save her to your contacts.";
  return `<p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.55;">${text}</p>`;
}

function normalizeIntroOverride(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .trim();
}

/**
 * Full HTML email: intro → card → attachment note → Julie signature → footer shell.
 */
function buildAgentCredentialsEmailHtml({ language, firstName, introOverride }) {
  const useEs = isSpanishLanguage(language);
  const fn = normalizeFirstName(firstName);
  const introText = introOverride
    ? normalizeIntroOverride(introOverride)
    : buildAgentCredentialsIntroPlainText({ language, firstName: fn });
  const plainBody = `${introText}\n\n${buildAgentCredentialsPlainDetails({ language })}`;
  const introHtml = `<div style="margin:0 0 28px;">${plainTextToBodyHtml(introText)}</div>`;
  const inner =
    introHtml +
    buildAgentCredentialsHtmlBlock({ language }) +
    buildAgentCredentialsAttachmentNoteHtml({ language }) +
    (useEs ? signatureBlockES() : signatureBlockEN());

  return {
    html: wrapResendEmailHtml(inner, useEs ? LOGO_ES : LOGO_EN),
    plainBody,
  };
}

module.exports = {
  SITE,
  VCF_URL,
  JULIE_HEADSHOT_URL,
  LICENSE_NUMBER,
  LICENSE_LOOKUP_URL,
  licenseImageUrl,
  buildAgentCredentialsSubject,
  buildAgentCredentialsIntroPlainText,
  buildAgentCredentialsPlainText,
  buildAgentCredentialsHtmlBlock,
  buildAgentCredentialsEmailHtml,
};
