/**
 * Client + staff confirmation emails for MVI scheduler bookings (Gmail API).
 */
const { google } = require("../google-clients");
const { buildStaffClientReplyHtml } = require("../staff-reply-email-body");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";
const STAFF_TO = "julie@mejorvidainsurance.com, admin@mejorvidainsurance.com";

function buildGmailRaw({ fromEmail, toEmail, subject, html, plain }) {
  const boundary = `mvi_${Date.now()}`;
  const lines = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    plain,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
    "",
    `--${boundary}--`,
  ];
  return Buffer.from(lines.join("\r\n"), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sendGmailRaw(raw) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  if (!clientId || !clientSecret || !refreshToken) {
    return { skipped: true, reason: "gmail_not_configured" };
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const sendResp = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  return { sent: true, messageId: sendResp.data && sendResp.data.id };
}

function clientCopy(lang, labels, firstName) {
  const isEn = lang === "english" || lang === "en" || String(lang || "").startsWith("en");
  const when = labels.booker || labels.host || "";
  const name = firstName || (isEn ? "there" : "");
  if (isEn) {
    return {
      subject: "Your call with Mejor Vida Insurance is confirmed",
      plain:
        `Hi ${name},\n\nYour phone consultation is confirmed for:\n${when}\n\n` +
        `Julie will call the number you provided at that time. ` +
        `If you need to reschedule, reply to this email or call 402-440-5438.\n`,
    };
  }
  return {
    subject: "Su cita con Mejor Vida Seguros está confirmada",
    plain:
      `Hola ${name},\n\nSu consulta telefónica quedó confirmada para:\n${when}\n\n` +
      `Julie le llamará al número que proporcionó a esa hora. ` +
      `Si necesita reprogramar, responda a este correo o llame al 402-440-5438.\n`,
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
  } = payload;
  const clientEmail = String(email || "").trim().toLowerCase();
  if (!clientEmail) return { client: { skipped: true, reason: "no_email" } };

  const lang = String(language || "spanish").toLowerCase();
  const copy = clientCopy(lang, labels || {}, firstName);
  const { html, plainBody } = buildStaffClientReplyHtml(copy.plain, lang.startsWith("en") ? "en" : "es");

  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  const clientRaw = buildGmailRaw({
    fromEmail: `Mejor Vida Insurance <${fromEmail}>`,
    toEmail: clientEmail,
    subject: copy.subject,
    html,
    plain: plainBody,
  });
  const clientResult = await sendGmailRaw(clientRaw);

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Client";
  const when = (labels && labels.host) || "";
  const staffPlain = [
    "New scheduled call (MVI scheduler):",
    "",
    `Name: ${fullName}`,
    `Phone: ${phone || "—"}`,
    `Email: ${clientEmail}`,
    `When (Julie / client): ${when}`,
    `Marketing opt-in: ${marketingOptIn ? "Yes" : "No"}`,
    "",
    "CRM: Staff → Scheduler → Scheduled calls",
  ].join("\n");
  const staffRaw = buildGmailRaw({
    fromEmail: `Mejor Vida Insurance <${fromEmail}>`,
    toEmail: STAFF_TO,
    subject: `📅 Scheduled call: ${fullName}`,
    html: `<pre style="font-family:system-ui,sans-serif">${staffPlain.replace(/</g, "&lt;")}</pre>`,
    plain: staffPlain,
  });
  const staffResult = await sendGmailRaw(staffRaw);

  return { client: clientResult, staff: staffResult };
}

module.exports = { sendSchedulerConfirmationEmails };
