/**
 * POST /api/out-of-state-referral
 * Receives out-of-state referral form submissions from quote-out-of-state.html.
 * Inserts into out_of_state_referrals (Supabase).
 * Sends email notification to referrals@mejorvidainsurance.com via Gmail API.
 * Does NOT sync to HubSpot CRM.
 *
 * Vercel env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *             GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN,
 *             GMAIL_FROM_EMAIL (optional; default julie@mejorvidainsurance.com)
 */

const { google } = require("googleapis");
const { verifySiteOrigin } = require("../lib/site-origin");
const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function applyCors(req, res) {
  const gate = verifySiteOrigin(req);
  const origin = String(req.headers.origin || "").trim();
  if (gate.ok && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.mejorvidainsurance.com");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, payload, req) {
  applyCors(req, res);
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

/* -- Supabase insert -- */

async function supabaseInsert(supabaseUrl, serviceKey, table, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase insert ${r.status}: ${text.slice(0, 500)}`);
  }
  const data = JSON.parse(text);
  const first = Array.isArray(data) ? data[0] : data;
  return first && first.id ? String(first.id) : null;
}

/* -- Email notification via Gmail API -- */

function chicagoTimestamp() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "long",
  }).format(new Date());
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

async function sendEmailNotification(leadData) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  if (!clientId || !clientSecret || !refreshToken || !fromEmail) {
    return { skipped: true, reason: "Gmail not configured" };
  }

  const fullName = `${leadData.firstName || ""} ${leadData.lastName || ""}`.trim() || "Unknown";
  const subject = `New Out-of-State Referral: ${fullName} (${leadData.stateCode || "N/A"})`;
  const sentAt = chicagoTimestamp();
  const bodyText = [
    "New out-of-state referral received:",
    "",
    `First name: ${leadData.firstName || ""}`,
    `Last name: ${leadData.lastName || ""}`,
    `Email: ${leadData.email || ""}`,
    `Phone: ${leadData.phone || ""}`,
    `State: ${leadData.stateCode || ""}`,
    `Message: ${leadData.message || ""}`,
    `Consent: ${leadData.consent ? "Yes" : "No"}`,
    `Record ID: ${leadData.recordId || ""}`,
    `Timestamp (America/Chicago): ${sentAt}`,
  ].join("\n");

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = buildRawEmail(fromEmail, "referrals@mejorvidainsurance.com", subject, bodyText);
    const sendResp = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    const messageId = sendResp && sendResp.data && sendResp.data.id ? String(sendResp.data.id) : null;
    return { sent: true, messageId };
  } catch (e) {
    return { sent: false, error: e.message };
  }
}

/* -- Main handler -- */

module.exports = async function handler(req, res) {
  /* CORS preflight */
  if (req.method === "OPTIONS") {
    applyCors(req, res);
    return res.status(204).end();
  }

  /* Method check */
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" }, req);
  }

  /* Env vars */
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, {
      ok: false,
      error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    }, req);
  }

  /* Parse body */
  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" }, req);
  }

  /* Honeypot check */
  if (body.website) {
    // Bot submission - silently accept but don't store
    return json(res, 200, { ok: true, id: null }, req);
  }

  /* Extract & sanitize fields */
  const firstName = String(body.firstName || "").trim().slice(0, 200);
  const lastName = String(body.lastName || "").trim().slice(0, 200);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 500);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const stateCode = String(body.state || "").trim().slice(0, 2).toUpperCase();
  const message = String(body.quoteSummary || "").trim().slice(0, 5000);
  const consent = Boolean(body.consentLicensedAgentInState);

  if (!email) {
    return json(res, 400, { ok: false, error: "Email is required" }, req);
  }
  if (!firstName) {
    return json(res, 400, { ok: false, error: "First name is required" }, req);
  }

  /* Supabase insert */
  const nowIso = new Date().toISOString();
  const insertRow = {
    first_name: firstName,
    last_name: lastName || null,
    email: email,
    phone: phone || null,
    state_code: stateCode || null,
    message: message || null,
    consent_licensed_agent: consent,
    source: "website_out_of_state_form",
    status: "new",
    created_at: nowIso,
  };

  let recordId;
  try {
    recordId = await supabaseInsert(
      supabaseUrl,
      supabaseKey,
      "out_of_state_referrals",
      insertRow
    );
  } catch (e) {
    console.error("out-of-state-referral supabase insert", e);
    return json(res, 500, { ok: false, error: "Could not save referral" }, req);
  }

  /* Email notification (best-effort, don't fail the request) */
  const emailResult = await sendEmailNotification({
    firstName,
    lastName,
    email,
    phone,
    stateCode,
    message,
    consent,
    recordId,
    submittedAt: nowIso,
  });

  return json(res, 200, {
    ok: true,
    id: recordId,
    email: emailResult,
  }, req);
};
