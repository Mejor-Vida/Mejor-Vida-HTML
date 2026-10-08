/**
 * Client + staff confirmation emails for MVI scheduler bookings (Gmail API).
 */
const { sendGmailMultipart } = require("../gmail-raw-multipart");
const { buildStaffClientReplyHtml } = require("../staff-reply-email-body");
const { buildManageUrls } = require("./manage-links");

const STAFF_TO = "julie@mejorvidainsurance.com, admin@mejorvidainsurance.com";

function clientCopy(lang, labels, firstName, links) {
  const isEn = lang === "english" || lang === "en" || String(lang || "").startsWith("en");
  const when = labels.booker || labels.host || "";
  const name = firstName || (isEn ? "there" : "");
  const manage = links.manageUrl || "";
  const reschedule = links.rescheduleUrl || "";
  if (isEn) {
    return {
      subject: "Your call with Mejor Vida Insurance is confirmed",
      plain:
        `Hi ${name},\n\nYour phone consultation is confirmed for:\n${when}\n\n` +
        `Mejor Vida Insurance will call the number you provided at that time.\n\n` +
        (manage ? `Change or cancel this appointment:\n${manage}\n\n` : "") +
        (reschedule ? `Pick a new time:\n${reschedule}\n\n` : "") +
        `Questions? Call 402-440-5438 or reply to this email.\n`,
    };
  }
  return {
    subject: "Su cita con Mejor Vida Seguros está confirmada",
    plain:
      `Hola ${name},\n\nSu consulta telefónica quedó confirmada para:\n${when}\n\n` +
      `Mejor Vida Seguros le llamará al número que proporcionó a esa hora.\n\n` +
      (manage ? `Cancelar o cambiar esta cita:\n${manage}\n\n` : "") +
      (reschedule ? `Elegir otra hora:\n${reschedule}\n\n` : "") +
      `Preguntas? Llame al 402-440-5438 o responda a este correo.\n`,
  };
}

async function sendSchedulerConfirmationEmails(payload) {
  const {
    email,
    firstName,
    lastName,
    phone,
    language,
    labels,
    marketingOptIn,
    appointmentId,
    cancelToken,
    calendarLinked,
  } = payload;
  const clientEmail = String(email || "").trim().toLowerCase();
  if (!clientEmail) return { client: { skipped: true, reason: "no_email" } };

  const lang = String(language || "spanish").toLowerCase();
  const links = buildManageUrls({
    appointmentId,
    cancelToken,
    language: lang,
  });
  const copy = clientCopy(lang, labels || {}, firstName, links);
  const { html, plainBody } = buildStaffClientReplyHtml(copy.plain, lang.startsWith("en") ? "en" : "es");

  const fromName = lang.startsWith("en") ? "Mejor Vida Insurance" : "Mejor Vida Seguros";
  const clientResult = await sendGmailMultipart({
    toEmail: clientEmail,
    subject: copy.subject,
    plain: plainBody,
    html,
    fromName,
  });

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Client";
  const when = (labels && labels.host) || "";
  const staffPlain = [
    "New scheduled call (MVI scheduler):",
    "",
    `Name: ${fullName}`,
    `Phone: ${phone || "-"}`,
    `Email: ${clientEmail}`,
    `When (Julie / client): ${when}`,
    `Marketing opt-in: ${marketingOptIn ? "Yes" : "No"}`,
    `Google Calendar event: ${calendarLinked ? "created" : "NOT created - connect Calendar in CRM Scheduler"}`,
    "",
    "CRM: Staff -> Scheduler -> Scheduled calls",
  ].join("\n");
  const staffHtmlPack = buildStaffClientReplyHtml(staffPlain, "en");
  const staffResult = await sendGmailMultipart({
    toEmail: STAFF_TO,
    subject: `Scheduled call: ${fullName}`,
    plain: staffHtmlPack.plainBody,
    html: staffHtmlPack.html,
    fromName: "Mejor Vida Insurance",
  });

  return { client: clientResult, staff: staffResult };
}

function cancelCopy(lang, labels, firstName, rescheduleUrl, cancelledBy) {
  const isEn = lang === "english" || lang === "en" || String(lang || "").startsWith("en");
  const when = labels.booker || labels.host || "";
  const name = firstName || (isEn ? "there" : "");
  const byStaff = cancelledBy === "staff";
  if (isEn) {
    return {
      subject: "Your Mejor Vida Insurance call was cancelled",
      plain:
        `Hi ${name},\n\nYour phone consultation scheduled for:\n${when}\n\nhas been cancelled.\n\n` +
        (rescheduleUrl ? `To pick a new time:\n${rescheduleUrl}\n\n` : "") +
        `Questions? Call 402-440-5438 or reply to this email.\n`,
      staffSubject: `Cancelled call: ${name}`,
      staffIntro: byStaff ? "Cancelled from Staff CRM." : "Cancelled by client (manage link).",
    };
  }
  return {
    subject: "Su cita con Mejor Vida Seguros fue cancelada",
    plain:
      `Hola ${name},\n\nSu consulta telefónica programada para:\n${when}\n\nfue cancelada.\n\n` +
      (rescheduleUrl ? `Para elegir otra hora:\n${rescheduleUrl}\n\n` : "") +
      `Preguntas? Llame al 402-440-5438 o responda a este correo.\n`,
    staffSubject: `Cita cancelada: ${name}`,
    staffIntro: byStaff ? "Cancelada desde el CRM." : "Cancelada por el cliente (enlace de gestión).",
  };
}

async function sendSchedulerCancellationEmails(payload) {
  const {
    email,
    firstName,
    lastName,
    phone,
    language,
    labels,
    cancelledBy,
    rescheduleUrl,
  } = payload;
  const clientEmail = String(email || "").trim().toLowerCase();
  const lang = String(language || "spanish").toLowerCase();
  const copy = cancelCopy(lang, labels || {}, firstName, rescheduleUrl, cancelledBy);
  const results = { client: { skipped: true }, staff: { skipped: true } };

  if (clientEmail) {
    const { html, plainBody } = buildStaffClientReplyHtml(copy.plain, lang.startsWith("en") ? "en" : "es");
    const fromName = lang.startsWith("en") ? "Mejor Vida Insurance" : "Mejor Vida Seguros";
    results.client = await sendGmailMultipart({
      toEmail: clientEmail,
      subject: copy.subject,
      plain: plainBody,
      html,
      fromName,
    });
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Client";
  const when = (labels && labels.host) || "";
  const staffPlain = [
    "Scheduled call cancelled (MVI scheduler):",
    copy.staffIntro,
    "",
    `Name: ${fullName}`,
    `Phone: ${phone || "-"}`,
    `Email: ${clientEmail || "-"}`,
    `When was: ${when}`,
    "",
    "CRM: Staff -> Scheduler -> Scheduled calls",
  ].join("\n");
  const staffHtmlPack = buildStaffClientReplyHtml(staffPlain, "en");
  results.staff = await sendGmailMultipart({
    toEmail: STAFF_TO,
    subject: copy.staffSubject || `Cancelled call: ${fullName}`,
    plain: staffHtmlPack.plainBody,
    html: staffHtmlPack.html,
    fromName: "Mejor Vida Insurance",
  });

  return results;
}

module.exports = { sendSchedulerConfirmationEmails, sendSchedulerCancellationEmails };
