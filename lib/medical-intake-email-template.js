/**
 * Prefilled Medical Information Request email copy (EN/ES).
 */

const { normalizeFirstName, salutationLine } = require("./medical-intake-lead-greeting");

const MEDICAL_INTAKE_PREVIEW_LINK =
  "https://www.mejorvidainsurance.com/medical-intake.html?t=[secure link created when you send]";

function firstNameFromLead(lead) {
  const fn = normalizeFirstName(lead && lead.first_name);
  if (fn) return fn;
  const dn = String((lead && lead.display_name) || "").trim();
  return normalizeFirstName(dn.split(/\s+/)[0]);
}

function buildMedicalIntakePlainText({ language, firstName, intakeUrl }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const salutation = salutationLine(language, firstName);
  if (useEs) {
    return (
      `${salutation}\n\n` +
      `Gracias por programar tu llamada con Julie en Mejor Vida Insurance.\n\n` +
      `Para ayudarte a encontrar las mejores opciones para tus gastos finales, te compartimos un breve ` +
      `cuestionario médico que puedes completar antes de nuestra llamada.\n\n` +
      `Las preguntas son similares a las que las compañías de seguros utilizan para determinar qué planes ` +
      `podrían estar disponibles para ti. Si lo completas con anticipación, voy a poder revisar tu ` +
      `información antes de la cita y llegar preparada con opciones personalizadas para ti.\n\n` +
      `De esta manera, durante la llamada podremos enfocarnos en responder tus preguntas, explicarte tus ` +
      `opciones y ayudarte a tomar una decisión informada, en lugar de dedicar tiempo a recopilar ` +
      `información médica.\n\n` +
      `La mayoría de las personas lo completan en aproximadamente 10 minutos.\n\n` +
      `Completa tu cuestionario aquí:\n${intakeUrl}\n\n` +
      `Tu información es privada y solo será utilizada para ayudarte a evaluar opciones de cobertura.\n\n` +
      `Completarlo antes de la llamada no es obligatorio, pero nos ayudará a aprovechar mejor el tiempo juntos.\n\n` +
      `Si tienes alguna pregunta antes de la llamada, simplemente responde a este correo.`
    );
  }
  return (
    `${salutation}\n\n` +
    `Thank you for scheduling your call with Julie at Mejor Vida Insurance.\n\n` +
    `To make the most of your appointment, this email includes a personal link to a secure, ` +
    `encrypted medical questionnaire. The questions are the same type final expense carriers use ` +
    `to review eligibility and underwriting approval.\n\n` +
    `When you complete it before your call, Julie can review your medical profile, determine which ` +
    `products you qualify for, and prepare real options for you — so our time together focuses on ` +
    `your important final expense questions, benefits, and next steps, instead of collecting medical ` +
    `history on the phone and waiting for a quote.\n\n` +
    `Most clients finish the form in about 10–15 minutes. The sooner you submit it, the more prepared ` +
    `Julie will be to give you clear answers from the very start of your call.\n\n` +
    `Complete your secure medical questionnaire here:\n${intakeUrl}\n\n` +
    `Your information is transmitted and stored with encryption. It is used only to evaluate final ` +
    `expense options for you and is not shared outside what is needed to prepare your quote.\n\n` +
    `This link is personal, single-use, and expires in 7 days.\n\n` +
    `If you have any questions, reply to this email or call our office.\n\n` +
    `Thank you,\nJulie`
  );
}

function applyMedicalIntakeUrlToDraft(draft, intakeUrl) {
  const url = String(intakeUrl || "").trim();
  if (!url) return String(draft || "");
  let text = String(draft || "");
  if (text.includes(MEDICAL_INTAKE_PREVIEW_LINK)) {
    text = text.split(MEDICAL_INTAKE_PREVIEW_LINK).join(url);
  }
  if (text.includes("[secure link created when you send]")) {
    text = text.split("[secure link created when you send]").join(url);
  }
  return text;
}

function buildMedicalIntakeSubject({ language }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  return useEs
    ? "Acción requerida: completa tu cuestionario médico seguro antes de tu llamada"
    : "Action needed: complete your secure medical questionnaire before your call";
}

function buildMedicalIntakeCtaHtml({ language, intakeUrl }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const label = useEs
    ? "Completar mi cuestionario"
    : "Complete My Secure Medical Questionnaire";
  const safeUrl = String(intakeUrl || "").replace(/"/g, "&quot;");
  return (
    `<p style="margin:24px 0;text-align:center;">` +
    `<a href="${safeUrl}" style="display:inline-block;padding:14px 28px;background:#1a4d8c;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">` +
    `${label}</a></p>`
  );
}

module.exports = {
  MEDICAL_INTAKE_PREVIEW_LINK,
  firstNameFromLead,
  buildMedicalIntakePlainText,
  applyMedicalIntakeUrlToDraft,
  buildMedicalIntakeSubject,
  buildMedicalIntakeCtaHtml,
  normalizeFirstName,
  salutationLine,
};
