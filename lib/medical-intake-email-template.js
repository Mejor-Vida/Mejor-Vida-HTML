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
      `Para que Julie pueda investigar las mejores opciones de cobertura antes de su llamada, ` +
      `le pedimos completar su perfil médico en línea. Esto nos permite usar más tiempo en sus ` +
      `preguntas importantes y menos tiempo haciendo preguntas médicas durante la llamada.\n\n` +
      `Complete su información médica de forma segura aquí:\n${intakeUrl}\n\n` +
      `Su información se recopila de forma segura, se cifra y no se comparte con terceros ` +
      `fuera de lo necesario para preparar su cotización.\n\n` +
      `Este enlace es personal, de un solo uso y vence en 7 días.\n\n` +
      `Si tiene preguntas, responda a este correo o llame a nuestra oficina.\n\n` +
      `Gracias,\nJulie`
    );
  }
  return (
    `Hi ${firstName},\n\n` +
    `Thank you for scheduling your call with Julie at Mejor Vida Insurance.\n\n` +
    `To help Julie research the best coverage options before your call, please complete your ` +
    `medical profile online. This lets us spend more of your call time on your important ` +
    `questions and less time asking medical history questions.\n\n` +
    `Complete your secure medical information here:\n${intakeUrl}\n\n` +
    `Your information is collected securely, encrypted, and is not shared outside what is ` +
    `needed to prepare your quote.\n\n` +
    `This link is personal, single-use, and expires in 7 days.\n\n` +
    `If you have questions, reply to this email or call our office.\n\n` +
    `Thank you,\nJulie`
  );
}

function buildMedicalIntakeSubject({ language }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  return useEs
    ? "Complete su información médica antes de su llamada con Julie"
    : "Complete your medical information before your call with Julie";
}

function buildMedicalIntakeCtaHtml({ language, intakeUrl }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const label = useEs ? "Completar información médica" : "Complete Medical Information";
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
