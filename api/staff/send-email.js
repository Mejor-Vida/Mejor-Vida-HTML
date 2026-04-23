const { google } = require("googleapis");
const { requireStaffAuth, json, readJsonBody, serviceConfig, restPatch, restInsert } = require("./_inbox-lib");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function buildRawEmail(fromEmail, toEmail, subject, bodyText) {
  const lines = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    bodyText,
  ];
  return Buffer.from(lines.join("\r\n"), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function isLikelyEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
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
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = buildRawEmail(
      fromEmail,
      toEmail,
      "Re: Your Insurance Question — Mejor Vida Insurance",
      replyDraft
    );

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
      { questionId, toEmail, fromEmail, messageId, result: "gmail_accept" },
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
