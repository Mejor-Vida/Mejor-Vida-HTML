const { google } = require("googleapis");
const { requireStaffAuth, json, readJsonBody, serviceConfig, restPatch, restInsert } = require("./_inbox-lib");
const { buildStaffClientReplyHtml } = require("../../lib/staff-reply-email-body");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function isLikelyEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function encodeSubject(subject) {
  const s = String(subject || "");
  if (/^[\x00-\x7F]*$/.test(s)) return s;
  return `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}

function mimeBase64Body(s) {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/.{1,76}/g, "$&\r\n")
    .trimEnd();
}

/**
 * multipart/alternative: plain + HTML (UTF-8), for Gmail users.messages.send raw.
 */
function buildMultipartRaw({ fromEmail, toEmail, subject, textBody, htmlBody }) {
  const boundary = `mvi_alt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const nl = "\r\n";
  const subj = encodeSubject(subject);
  const plainB64 = mimeBase64Body(textBody);
  const htmlB64 = mimeBase64Body(htmlBody);
  return [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${subj}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    plainB64,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    htmlB64,
    "",
    `--${boundary}--`,
    "",
  ].join(nl);
}

function toGmailRaw(rfc822) {
  return Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function logSendAttempt(cfg, payload, status) {
  try {
    await restInsert(cfg, "webhook_logs", {
      source: "staff_portal",
      endpoint: "/api/staff/send-email",
      payload,
      status: status || "received",
    });
  } catch (_) {
    // Logging should never break the endpoint.
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const questionId = String((body && body.questionId) || "").trim();
  const toEmail = body && body.toEmail != null ? String(body.toEmail).trim() : "";
  const replyDraft = String((body && body.replyDraft) || "").trim();
  const language = body && body.language != null ? String(body.language).trim() : "";

  if (!questionId || !replyDraft) {
    return json(res, 400, { success: false, error: "questionId and replyDraft required" });
  }
  if (!toEmail) {
    return json(res, 200, { success: false, error: "No email address on file for this lead" });
  }
  if (!isLikelyEmail(toEmail)) {
    return json(res, 200, { success: false, error: `Invalid recipient email: ${toEmail}` });
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  const cfg = serviceConfig();

  if (!clientId || !clientSecret || !refreshToken || !fromEmail || !cfg) {
    return json(res, 200, { success: false, error: "Gmail is not configured on the server" });
  }

  try {
    const { html, plainBody } = buildStaffClientReplyHtml(replyDraft, language);
    const rfc822 = buildMultipartRaw({
      fromEmail,
      toEmail,
      subject: "Re: Your Insurance Question — Mejor Vida Insurance",
      textBody: plainBody,
      htmlBody: html,
    });
    const raw = toGmailRaw(rfc822);

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const sendResp = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    const messageId = sendResp && sendResp.data && sendResp.data.id ? String(sendResp.data.id) : null;

    await restPatch(
      cfg,
      "unanswered_questions",
      `id=eq.${encodeURIComponent(questionId)}&select=id`,
      { email_sent: true }
    );

    await logSendAttempt(
      cfg,
      { questionId, toEmail, fromEmail, messageId, result: "gmail_accept", htmlTemplate: "resend_shell" },
      "sent"
    );

    return json(res, 200, { success: true, toEmail, messageId });
  } catch (e) {
    const err = String(e && e.message ? e.message : "Failed to send email");
    await logSendAttempt(cfg, { questionId, toEmail, fromEmail, error: err }, "error");
    return json(res, 200, {
      success: false,
      error: err,
    });
  }
};
