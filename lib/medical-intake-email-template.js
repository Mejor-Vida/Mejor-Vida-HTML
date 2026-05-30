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
      `Para aprovechar al máximo su cita, incluimos en este correo un enlace personal a un ` +
      `cuestionario médico seguro y cifrado. Las preguntas son las mismas que los carriers ` +
      `de gastos finales utilizan para evaluar elegibilidad y aprobación de cobertura.\n\n` +
      `Si lo completa antes de su llamada, Julie podrá revisar su perfil médico, identificar ` +
      `qué productos califican y preparar opciones reales para usted — para que cuando hablemos, ` +
      `el tiempo se dedique a sus preguntas importantes sobre gastos finales, beneficios y ` +
      `próximos pasos, en lugar de recopilar historial médico en vivo y esperar una cotización.\n\n` +
      `La mayoría de clientes completan el formulario en unos 10–15 minutos. Cuanto antes lo envíe, ` +
      `más preparada estará Julie para darle respuestas claras desde el inicio de la llamada.\n\n` +
      `Complete su cuestionario médico seguro aquí:\n${intakeUrl}\n\n` +
      `Su información se transmite y almacena con cifrado. Solo se usa para evaluar opciones de ` +
      `gastos finales para usted y no se comparte fuera de lo necesario para preparar su cotización.\n\n` +
      `Este enlace es personal, de un solo uso y vence en 7 días.\n\n` +
      `Si tiene alguna pregunta, responda a este correo o llame a nuestra oficina.\n\n` +
      `Gracias,\nJulie`
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
    ? "Completar mi cuestionario médico seguro"
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
