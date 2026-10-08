/**
 * Gmail API raw MIME helpers (UTF-8 safe).
 */
const { google } = require("./google-clients");
const { productionGmailRedirectUri } = require("./gmail-oauth-redirect");

function encodeEmailSubject(subject) {
  const s = String(subject || "");
  if (/^[\x00-\x7F]*$/.test(s)) return s;
  return `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}

function mimeBase64Chunked(s) {
  return Buffer.from(String(s || ""), "utf8")
    .toString("base64")
    .replace(/.{1,76}/g, "$&\r\n")
    .trimEnd();
}

function toGmailUrlSafeBase64(rfc822) {
  return Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildMultipartAlternativeRaw({ fromEmail, toEmail, subject, plain, html }) {
  const boundary = `mvi_alt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const nl = "\r\n";
  const lines = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${encodeEmailSubject(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    mimeBase64Chunked(plain),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    mimeBase64Chunked(html),
    "",
    `--${boundary}--`,
    "",
  ];
  return toGmailUrlSafeBase64(lines.join(nl));
}

async function sendGmailMultipart({ toEmail, subject, plain, html, fromName }) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromAddr = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  if (!clientId || !clientSecret || !refreshToken) {
    return { skipped: true, reason: "gmail_not_configured" };
  }
  const fromEmail = fromName ? `${fromName} <${fromAddr}>` : fromAddr;
  const raw = buildMultipartAlternativeRaw({
    fromEmail,
    toEmail,
    subject,
    plain,
    html,
  });
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, productionGmailRedirectUri());
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const sendResp = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  return { sent: true, messageId: sendResp.data && sendResp.data.id };
}

module.exports = {
  encodeEmailSubject,
  mimeBase64Chunked,
  buildMultipartAlternativeRaw,
  sendGmailMultipart,
};
