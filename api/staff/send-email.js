const { google } = require("googleapis");
const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restPatch } = require("./_inbox-lib");

function buildRawEmail(fromEmail, toEmail, toName, subject, bodyText) {
  const toHeader = toName ? `${toName} <${toEmail}>` : toEmail;
  const lines = [
    `From: Mejor Vida Insurance <${fromEmail}>`,
    `To: ${toHeader}`,
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
    return json(res, 400, { error: "Invalid JSON" });
  }

  const questionId = String((body && (body.questionId || body.id)) || "").trim();
  const replyDraft = String((body && (body.replyDraft || body.reply_draft)) || "").trim();
  const toEmail = String((body && body.toEmail) || "").trim();
  const toName = String((body && body.toName) || "").trim();

  if (!questionId || !replyDraft) {
    return json(res, 400, { success: false, error: "questionId and replyDraft required" });
  }
  if (!toEmail) {
    return json(res, 200, { success: false, error: "No email address on file for this lead" });
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "admin@mejorvidainsurance.com";
  const cfg = serviceConfig();
  if (!clientId || !clientSecret || !refreshToken || !fromEmail || !cfg) {
    return json(res, 200, { success: false, error: "Gmail is not configured on the server" });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = buildRawEmail(
      fromEmail,
      toEmail,
      toName,
      "Re: Your Insurance Question — Mejor Vida Insurance",
      replyDraft
    );

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    await restPatch(
      cfg,
      "unanswered_questions",
      `id=eq.${encodeURIComponent(questionId)}&select=id`,
      { email_sent: true }
    );

    return json(res, 200, { success: true });
  } catch (e) {
    return json(res, 200, { success: false, error: String(e && e.message ? e.message : "Failed to send email") });
  }
};
