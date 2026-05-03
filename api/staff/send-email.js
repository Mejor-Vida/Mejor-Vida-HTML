const { google } = require("googleapis");
const { requireStaffAuth, json, readJsonBody, serviceConfig, restPatch, restInsert } = require("./_inbox-lib");
const { buildStaffClientReplyHtml } = require("../../lib/staff-reply-email-body");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function isLikelyEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

/** First sentence or up to ~60 chars for compose-mode subject line. */
function subjectFromCustomerIssue(issue) {
  const t = String(issue || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return "Message from Mejor Vida Insurance";
  const cut = t.slice(0, 400);
  const m = cut.match(/^[\s\S]{1,200}?[.!?](?=\s|$)/);
  let s = m && m[0] ? m[0].trim() : cut;
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > 60) s = s.slice(0, 57).trim() + "…";
  if (s.length > 120) s = s.slice(0, 117).trim() + "…";
  return s || "Message from Mejor Vida Insurance";
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
function buildMultipartRaw({ fromEmail, toEmail, ccEmail, subject, textBody, htmlBody }) {
  const boundary = `mvi_alt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const nl = "\r\n";
  const subj = encodeSubject(subject);
  const plainB64 = mimeBase64Body(textBody);
  const htmlB64 = mimeBase64Body(htmlBody);
  const cc = ccEmail && String(ccEmail).trim() ? String(ccEmail).trim() : "";
  const lines = [`From: ${fromEmail}`, `To: ${toEmail}`];
  if (cc) lines.push(`Cc: ${cc}`);
  lines.push(
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
  );
  return lines.join(nl);
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

  const compose = !!(body && body.compose);
  const questionId = String((body && body.questionId) || "").trim();
  const toEmail = body && body.toEmail != null ? String(body.toEmail).trim() : "";
  const replyDraft = String((body && body.replyDraft) || "").trim();
  const language = body && body.language != null ? String(body.language).trim() : "";
  const customerIssue = body && body.customerIssue != null ? String(body.customerIssue).trim() : "";
  const subjectOverride = body && body.subject != null ? String(body.subject).trim() : "";
  const ccEmail = body && body.ccEmail != null ? String(body.ccEmail).trim() : "";

  if (!replyDraft) {
    return json(res, 400, { success: false, error: "replyDraft required" });
  }
  if (!compose && !questionId) {
    return json(res, 400, { success: false, error: "questionId required unless compose is true" });
  }
  if (!toEmail) {
    return json(res, 200, { success: false, error: "No email address on file for this lead" });
  }
  if (!isLikelyEmail(toEmail)) {
    return json(res, 200, { success: false, error: `Invalid recipient email: ${toEmail}` });
  }
  if (ccEmail && !isLikelyEmail(ccEmail)) {
    return json(res, 200, { success: false, error: `Invalid Cc email: ${ccEmail}` });
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  const cfg = serviceConfig();

  if (!clientId || !clientSecret || !refreshToken || !fromEmail || !cfg) {
    return json(res, 200, { success: false, error: "Gmail is not configured on the server" });
  }

  const subjectLine = compose
    ? subjectOverride
      ? subjectOverride.slice(0, 200)
      : subjectFromCustomerIssue(customerIssue)
    : "Re: Your Insurance Question — Mejor Vida Insurance";

  try {
    const { html, plainBody } = buildStaffClientReplyHtml(replyDraft, language);
    const rfc822 = buildMultipartRaw({
      fromEmail,
      toEmail,
      ccEmail: ccEmail || undefined,
      subject: subjectLine,
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

    if (!compose && questionId) {
      await restPatch(
        cfg,
        "unanswered_questions",
        `id=eq.${encodeURIComponent(questionId)}&select=id`,
        { email_sent: true }
      );
    }

    await logSendAttempt(
      cfg,
      {
        questionId: questionId || null,
        compose,
        toEmail,
        ccEmail: ccEmail || null,
        fromEmail,
        messageId,
        result: "gmail_accept",
        htmlTemplate: "resend_shell",
        subject: subjectLine,
      },
      "sent"
    );

    return json(res, 200, { success: true, toEmail, messageId, subject: subjectLine });
  } catch (e) {
    const err = String(e && e.message ? e.message : "Failed to send email");
    await logSendAttempt(
      cfg,
      { questionId: questionId || null, compose, toEmail, ccEmail: ccEmail || null, fromEmail, error: err },
      "error"
    );
    return json(res, 200, {
      success: false,
      error: err,
    });
  }
};
