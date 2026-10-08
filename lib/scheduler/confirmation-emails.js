/**
 * Client + staff emails for MVI scheduler (Gmail API, branded shell).
 * Clients get one simple MVI email only — no Google Calendar invite (no Yes/No/Maybe).
 */
const { sendGmailMultipart } = require("../gmail-raw-multipart");
const { buildStaffClientReplyHtml } = require("../staff-reply-email-body");
const {
  wrapResendEmailHtml,
  signatureBlockEN,
  signatureBlockES,
  LOGO_EN,
  LOGO_ES,
} = require("../resend-email-template");
const { buildManageUrls } = require("./manage-links");

const STAFF_TO = "julie@mejorvidainsurance.com, admin@mejorvidainsurance.com";

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSimpleClientEmail({ isEn, firstName, when, manageUrl, kind }) {
  const name = firstName || (isEn ? "there" : "");
  const whenSafe = escapeHtml(when);
  const manage = manageUrl ? escapeHtml(manageUrl) : "";

  if (kind === "cancel") {
    if (isEn) {
      const plain = [
        `Hi ${name},`,
        "",
        `Your phone consultation scheduled for:`,
        when,
        "",
        "has been cancelled.",
        "",
        manageUrl ? `Book a new time: ${manageUrl}` : "",
        "",
        "Questions? Call 402-440-5438.",
      ]
        .filter(Boolean)
        .join("\n");
      const inner =
        `<p style="margin:0 0 16px;font-size:16px;color:#1f2937;">Hi ${escapeHtml(name)},</p>` +
        `<p style="margin:0 0 12px;color:#334155;">Your phone consultation scheduled for:</p>` +
        `<p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0d47a1;">${whenSafe}</p>` +
        `<p style="margin:0 0 20px;color:#334155;">has been cancelled.</p>` +
        (manage
          ? `<p style="margin:0 0 24px;"><a href="${manage}" style="display:inline-block;background:#0d47a1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Book a new time</a></p>`
          : "") +
        signatureBlockEN();
      return {
        subject: "Your call with Mejor Vida Insurance was cancelled",
        plain,
        html: wrapResendEmailHtml(inner, LOGO_EN),
      };
    }
    const plain = [
      `Hola ${name},`,
      "",
      `Su consulta telefónica programada para:`,
      when,
      "",
      "fue cancelada.",
      "",
      manageUrl ? `Agendar otra hora: ${manageUrl}` : "",
      "",
      "Preguntas: 402-440-5438.",
    ]
      .filter(Boolean)
      .join("\n");
    const inner =
      `<p style="margin:0 0 16px;font-size:16px;color:#1f2937;">Hola ${escapeHtml(name)},</p>` +
      `<p style="margin:0 0 12px;color:#334155;">Su consulta telefónica programada para:</p>` +
      `<p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0d47a1;">${whenSafe}</p>` +
      `<p style="margin:0 0 20px;color:#334155;">fue cancelada.</p>` +
      (manage
        ? `<p style="margin:0 0 24px;"><a href="${manage}" style="display:inline-block;background:#0d47a1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Agendar otra hora</a></p>`
        : "") +
      signatureBlockES();
    return {
      subject: "Su cita con Mejor Vida Seguros fue cancelada",
      plain,
      html: wrapResendEmailHtml(inner, LOGO_ES),
    };
  }

  if (isEn) {
    const plain = [
      `Hi ${name},`,
      "",
      `Your call with Mejor Vida Insurance is confirmed for:`,
      when,
      "",
      "We will call the phone number you provided at that time.",
      "",
      manageUrl ? `Change or cancel: ${manageUrl}` : "",
      "",
      "Questions? Call 402-440-5438.",
    ]
      .filter(Boolean)
      .join("\n");
    const inner =
      `<p style="margin:0 0 16px;font-size:16px;color:#1f2937;">Hi ${escapeHtml(name)},</p>` +
      `<p style="margin:0 0 12px;color:#334155;">Your call with <strong>Mejor Vida Insurance</strong> is confirmed for:</p>` +
      `<p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0d47a1;">${whenSafe}</p>` +
      `<p style="margin:0 0 20px;color:#334155;">We will call the phone number you provided at that time.</p>` +
      (manage
        ? `<p style="margin:0 0 24px;"><a href="${manage}" style="display:inline-block;background:#0d47a1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Change or cancel appointment</a></p>`
        : "") +
      signatureBlockEN();
    return {
      subject: "Your call is confirmed — Mejor Vida Insurance",
      plain,
      html: wrapResendEmailHtml(inner, LOGO_EN),
    };
  }

  const plain = [
    `Hola ${name},`,
    "",
    `Su llamada con Mejor Vida Seguros quedó confirmada para:`,
    when,
    "",
    "Le llamaremos al número que proporcionó a esa hora.",
    "",
    manageUrl ? `Cancelar o cambiar: ${manageUrl}` : "",
    "",
    "Preguntas: 402-440-5438.",
  ]
    .filter(Boolean)
    .join("\n");
  const inner =
    `<p style="margin:0 0 16px;font-size:16px;color:#1f2937;">Hola ${escapeHtml(name)},</p>` +
    `<p style="margin:0 0 12px;color:#334155;">Su llamada con <strong>Mejor Vida Seguros</strong> quedó confirmada para:</p>` +
    `<p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0d47a1;">${whenSafe}</p>` +
    `<p style="margin:0 0 20px;color:#334155;">Le llamaremos al número que proporcionó a esa hora.</p>` +
    (manage
      ? `<p style="margin:0 0 24px;"><a href="${manage}" style="display:inline-block;background:#0d47a1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Cancelar o cambiar la cita</a></p>`
      : "") +
    signatureBlockES();
  return {
    subject: "Su cita está confirmada — Mejor Vida Seguros",
    plain,
    html: wrapResendEmailHtml(inner, LOGO_ES),
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
  const isEn = lang.startsWith("en") || lang === "english";
  const links = buildManageUrls({ appointmentId, cancelToken, language: lang });
  const when = (labels && labels.booker) || (labels && labels.host) || "";
  const pack = buildSimpleClientEmail({
    isEn,
    firstName,
    when,
    manageUrl: links.manageUrl,
    kind: "confirm",
  });

  const fromName = isEn ? "Mejor Vida Insurance" : "Mejor Vida Seguros";
  const clientResult = await sendGmailMultipart({
    toEmail: clientEmail,
    subject: pack.subject,
    plain: pack.plain,
    html: pack.html,
    fromName,
  });

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Client";
  const staffPlain = [
    "New scheduled call (MVI scheduler):",
    "",
    `Name: ${fullName}`,
    `Phone: ${phone || "-"}`,
    `Email: ${clientEmail}`,
    `When (Julie / client): ${(labels && labels.host) || when}`,
    `Marketing opt-in: ${marketingOptIn ? "Yes" : "No"}`,
    `Google Calendar event: ${calendarLinked ? "created (Julie only — client not invited)" : "NOT created"}`,
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
  const isEn = lang.startsWith("en") || lang === "english";
  const when = (labels && labels.booker) || (labels && labels.host) || "";
  const results = { client: { skipped: true }, staff: { skipped: true } };

  if (clientEmail) {
    const pack = buildSimpleClientEmail({
      isEn,
      firstName,
      when,
      manageUrl: rescheduleUrl,
      kind: "cancel",
    });
    const fromName = isEn ? "Mejor Vida Insurance" : "Mejor Vida Seguros";
    results.client = await sendGmailMultipart({
      toEmail: clientEmail,
      subject: pack.subject,
      plain: pack.plain,
      html: pack.html,
      fromName,
    });
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Client";
  const staffPlain = [
    "Scheduled call cancelled (MVI scheduler):",
    cancelledBy === "staff" ? "Cancelled from Staff CRM." : "Cancelled by client.",
    "",
    `Name: ${fullName}`,
    `Phone: ${phone || "-"}`,
    `Email: ${clientEmail || "-"}`,
    `When was: ${when}`,
  ].join("\n");
  const staffHtmlPack = buildStaffClientReplyHtml(staffPlain, "en");
  results.staff = await sendGmailMultipart({
    toEmail: STAFF_TO,
    subject: isEn ? `Cancelled call: ${fullName}` : `Cita cancelada: ${fullName}`,
    plain: staffHtmlPack.plainBody,
    html: staffHtmlPack.html,
    fromName: "Mejor Vida Insurance",
  });

  return results;
}

module.exports = { sendSchedulerConfirmationEmails, sendSchedulerCancellationEmails };
