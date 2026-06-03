/**
 * Prefilled Medical Information Request email copy (EN/ES).
 */

function firstNameFromLead(lead) {
  const fn = String((lead && lead.first_name) || "").trim();
  if (fn) return fn;
  const dn = String((lead && lead.display_name) || "").trim();
  return dn.split(/\s+/)[0] || "there";
}

function buildMedicalIntakePlainText({ language, firstName, intakeUrl }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  if (useEs) {
    return (
      `Hola ${firstName},\n\n` +
      `Gracias por programar su llamada con Julie en Mejor Vida Insurance.\n\n` +
      `Para ayudarle a encontrar las mejores opciones para sus gastos finales, le compartimos un breve ` +
      `cuestionario médico que puede completar antes de nuestra llamada.\n\n` +
      `Las preguntas son similares a las que las compañías de seguros utilizan para determinar qué planes ` +
      `podrían estar disponibles para usted. Si lo completa con anticipación, voy a poder revisar su ` +
      `información antes de la cita y llegar preparada con opciones personalizadas para usted.\n\n` +
      `De esta manera, durante la llamada podremos enfocarnos en responder sus preguntas, explicarle sus ` +
      `opciones y ayudarle a tomar una decisión informada, en lugar de dedicar tiempo a recopilar ` +
      `información médica.\n\n` +
      `La mayoría de las personas lo completan en aproximadamente 10 minutos.\n\n` +
      `Complete su cuestionario aquí:\n${intakeUrl}\n\n` +
      `Su información es privada y solo será utilizada para ayudarle a evaluar opciones de cobertura.\n\n` +
      `Completarlo antes de la llamada no es obligatorio, pero nos ayudará a aprovechar mejor el tiempo juntos.\n\n` +
      `Si tiene alguna pregunta antes de la llamada, simplemente responda a este correo.`
    );
  }
  return (
    `Hi ${firstName},\n\n` +
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

function buildMedicalIntakeSubject({ language }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  return useEs
    ? "Acción requerida: complete su cuestionario médico seguro antes de su llamada"
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
  firstNameFromLead,
  buildMedicalIntakePlainText,
  buildMedicalIntakeSubject,
  buildMedicalIntakeCtaHtml,
};
