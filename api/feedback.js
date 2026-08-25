/**
 * POST /api/feedback
 * ManyChat External Request: send WhatsApp feedback emails via Gmail (replaces Apps Script).
 * Recipients: To julie@ + whatsapp@ (so Julie sees Inbox copies); Cc admin@ for audit.
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

const { google } = require("../lib/google-clients");
const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { sanitizeManychatTemplateField } = require("../lib/rag-pipeline");
const { findManychatLeadBySubscriberId, findManychatLeadsByPhone } = require("../lib/supabase");
const { getContactByManychatSubscriberId, getContactByPhone } = require("../lib/contacts-db");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

const UNRESOLVED_TEMPLATE = /^\{\{[\s\S]*\}\}$/;
function isTemplateString(v) {
  return UNRESOLVED_TEMPLATE.test(String(v == null ? "" : v).trim());
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

function buildRawEmail(fromEmail, toLine, ccLine, subject, bodyText) {
  const lines = [
    `From: ${fromEmail}`,
    `To: ${toLine}`,
    ...(ccLine ? [`Cc: ${ccLine}`] : []),
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

  /** ManyChat often sends whatsapp_id / phone-like values in subscriber_id — match v2 contacts + leads. */
  async function resolvePhoneFromSubscriber() {
    if (phone || !subscriberId || !supabaseUrl || !supabaseKey) return;
    const sid = String(subscriberId).trim();
    const digits = sid.replace(/\D/g, "");
    try {
      const lead = await findManychatLeadBySubscriberId(supabaseUrl, supabaseKey, sid);
      const fromLead = sanitizeManychatTemplateField(lead && lead.phone);
      if (fromLead) {
        phone = fromLead.slice(0, 40);
        return;
      }
    } catch (e) {
      console.error("feedback manychat_leads lookup", e.message);
    }
    try {
      const contact = await getContactByManychatSubscriberId(supabaseUrl, supabaseKey, sid);
      if (contact) {
        const fromPhone = sanitizeManychatTemplateField(contact.phone);
        if (fromPhone) {
          phone = fromPhone.slice(0, 40);
          return;
        }
        const fromWa = sanitizeManychatTemplateField(contact.whatsapp_id);
        if (fromWa && /^\d/.test(fromWa)) {
          phone = fromWa.slice(0, 40);
          return;
        }
      }
    } catch (e) {
      console.error("feedback contacts subscriber lookup", e.message);
    }
    if (digits.length >= 10 && digits.length <= 15) {
      const phoneTries = [sid, digits];
      if (digits.length === 10) phoneTries.push(`+1${digits}`, `1${digits}`);
      if (digits.length === 11 && digits.startsWith("1")) phoneTries.push(`+${digits}`);
      for (const pTry of phoneTries) {
        try {
          const c = await getContactByPhone(supabaseUrl, supabaseKey, pTry);
          if (c) {
            const fp = sanitizeManychatTemplateField(c.phone);
            if (fp) {
              phone = fp.slice(0, 40);
              return;
            }
            const fw = sanitizeManychatTemplateField(c.whatsapp_id);
            if (fw && /^\d/.test(fw)) {
              phone = fw.slice(0, 40);
              return;
            }
          }
        } catch (e) {
          console.error("feedback contacts phone lookup", e.message);
        }
      }
      for (const pTry of [...new Set([sid, digits, digits.length === 10 ? `+1${digits}` : null].filter(Boolean))]) {
        try {
          const rows = await findManychatLeadsByPhone(supabaseUrl, supabaseKey, pTry);
          if (rows && rows[0]) {
            const lp = sanitizeManychatTemplateField(rows[0].phone);
            if (lp) {
              phone = lp.slice(0, 40);
              return;
            }
          }
        } catch (e) {
          console.error("feedback manychat_leads phone lookup", e.message);
        }
      }
    }
  }

  await resolvePhoneFromSubscriber();

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  // Julie must appear as an explicit recipient: when she is only "From", Gmail shows the message in Sent, not Inbox.
  const julieInbox = "julie@mejorvidainsurance.com";
  const whatsappInbox = "whatsapp@mejorvidainsurance.com";
  const adminCc = "admin@mejorvidainsurance.com";
  const toLine = `${julieInbox}, ${whatsappInbox}`;
  const ccLine = adminCc;
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
  const unresolvedFields = [];
  if (isTemplateString(body.firstName || body.first_name)) unresolvedFields.push("firstName");
  if (isTemplateString(body.phone)) unresolvedFields.push("phone");
  if (isTemplateString(body.feedback)) unresolvedFields.push("feedback");
  if (isTemplateString(body.language)) unresolvedFields.push("language");
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
    unresolvedFields.length
      ? `Unresolved template fields from ManyChat: ${unresolvedFields.join(", ")}`
      : "Unresolved template fields from ManyChat: none",
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
    const raw = buildRawEmail(fromEmail, toLine, ccLine, subject, bodyText);
    const sendResp = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    const messageId = sendResp && sendResp.data && sendResp.data.id ? String(sendResp.data.id) : null;
    await logWebhook(
      supabaseUrl,
      supabaseKey,
      {
        firstName,
        subscriberId,
        phone: phone || null,
        language,
        feedback_len: feedback.length,
        unresolved_fields: unresolvedFields,
        to: toLine,
        cc: ccLine,
        messageId,
      },
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
        unresolved_fields: unresolvedFields,
        to: toLine,
        cc: ccLine,
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
