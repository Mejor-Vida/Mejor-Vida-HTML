/**
 * POST /api/feedback
 * ManyChat External Request: send WhatsApp feedback emails via Gmail (replaces Apps Script).
 *
 * Body fields:
 *  - firstName
 *  - feedback
 *  - language
 *  - subscriber_id
 *  - phone (optional)
 *
 * Env:
 *  - MANYCHAT_WEBHOOK_SECRET
 *  - GMAIL_CLIENT_ID
 *  - GMAIL_CLIENT_SECRET
 *  - GMAIL_REFRESH_TOKEN
 *  - GMAIL_FROM_EMAIL (optional, default julie@mejorvidainsurance.com)
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY
 */

const { google } = require("googleapis");
const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { sanitizeManychatTemplateField } = require("../lib/rag-pipeline");
const { findManychatLeadBySubscriberId } = require("../lib/supabase");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

async function logWebhook(supabaseUrl, supabaseKey, payload, status) {
  if (!supabaseUrl || !supabaseKey) return;
  try {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/webhook_logs`;
    await fetch(url, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        source: "manychat",
        endpoint: "/api/feedback",
        payload,
        status: status || "received",
      }),
    });
  } catch (_) {
    // Never fail request on logging.
  }
}

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

function chicagoTimestamp() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "long",
  }).format(new Date());
}

module.exports = async function handler(req, res) {
  logRequest("feedback");
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    await logWebhook(supabaseUrl, supabaseKey, { reason: auth.error }, "auth_failed");
    return json(res, auth.status, { ok: false, error: auth.error });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    await logWebhook(supabaseUrl, supabaseKey, { parseError: true }, "invalid_json");
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  const firstName = sanitizeManychatTemplateField(body.firstName || body.first_name) || "Unknown";
  const feedback = sanitizeManychatTemplateField(body.feedback) || "";
  const language = sanitizeManychatTemplateField(body.language) || "Unknown";
  const subscriberId =
    sanitizeManychatTemplateField(body.subscriber_id || body.subscriberId || body.user_id || body.userId) || null;
  let phone = sanitizeManychatTemplateField(body.phone) || null;

  if (!phone && subscriberId && supabaseUrl && supabaseKey) {
    try {
      const lead = await findManychatLeadBySubscriberId(supabaseUrl, supabaseKey, subscriberId);
      phone = sanitizeManychatTemplateField(lead && lead.phone);
    } catch (e) {
      console.error("feedback phone lookup error", e.message);
    }
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  const toEmail = "whatsapp@mejorvidainsurance.com";
  if (!clientId || !clientSecret || !refreshToken || !fromEmail) {
    await logWebhook(
      supabaseUrl,
      supabaseKey,
      { firstName, subscriberId, phone, hasGmailEnv: false },
      "gmail_not_configured",
    );
    return json(res, 500, { ok: false, error: "Gmail is not configured on the server" });
  }

  const ts = chicagoTimestamp();
  const subject = `WhatsApp Feedback from ${firstName}`;
  const bodyText = [
    "New feedback from WhatsApp chatbot:",
    "",
    `Name: ${firstName}`,
    `Phone: ${phone || "(missing)"}`,
    `Language: ${language}`,
    subscriberId ? `Subscriber ID: ${subscriberId}` : "Subscriber ID: (missing)",
    "",
    "Feedback:",
    feedback || "(empty)",
    "",
    `Sent: ${ts}`,
  ].join("\n");

  console.log(
    JSON.stringify({
      event: "feedback_email_attempt",
      firstName,
      phone: phone || null,
      language,
      subscriberId,
      feedback_len: feedback.length,
      sent_at_chicago: ts,
    }),
  );

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = buildRawEmail(fromEmail, toEmail, subject, bodyText);
    const sendResp = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    const messageId = sendResp && sendResp.data && sendResp.data.id ? String(sendResp.data.id) : null;
    await logWebhook(
      supabaseUrl,
      supabaseKey,
      { firstName, subscriberId, phone: phone || null, language, feedback_len: feedback.length, toEmail, messageId },
      "sent",
    );
    return json(res, 200, { ok: true, messageId });
  } catch (e) {
    console.error("feedback gmail send error", e);
    await logWebhook(
      supabaseUrl,
      supabaseKey,
      {
        firstName,
        subscriberId,
        phone: phone || null,
        language,
        feedback_len: feedback.length,
        toEmail,
        error: String(e && e.message ? e.message : "Failed to send feedback email"),
      },
      "error",
    );
    return json(res, 200, {
      ok: false,
      error: String(e && e.message ? e.message : "Failed to send feedback email"),
    });
  }
};
