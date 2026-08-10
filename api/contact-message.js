/**
 * POST /api/contact-message
 * Sticky "Leave a Message" widget submissions from the public site.
 * Inserts quote_lead_submissions (source: website_contact_form), syncs HubSpot,
 * emails staff, and records optional SMS opt-in from the form checkbox.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HUBSPOT_ACCESS_TOKEN (optional),
 *      GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_FROM_EMAIL
 */

const { google } = require("googleapis");
const { verifySiteOrigin } = require("../lib/site-origin");
const { hubspotAddNote } = require("../lib/hubspot");
const {
  CONSENT_CONTACT_DAYS,
  consentExpiresAt,
  logComplianceEvent,
  clearActiveFeedPartitionHides,
} = require("../lib/crm-compliance");
const { capiClientIp, capiClientUserAgent } = require("../lib/meta-capi");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";
const NOTIFY_TO = "julie@mejorvidainsurance.com, admin@mejorvidainsurance.com";

function applyCors(req, res) {
  const gate = verifySiteOrigin(req);
  const origin = String(req.headers.origin || "").trim();
  if (gate.ok && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.mejorvidainsurance.com");
  }
  res.setHeader("Vary", "Origin");
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

function splitName(full, firstName, lastName) {
  let first = String(firstName || "").trim().slice(0, 200);
  let last = String(lastName || "").trim().slice(0, 200);
  if (first && last) return { firstName: first, lastName: last };
  const parts = String(full || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!first && parts.length) {
    first = parts[0].slice(0, 200);
    if (!last) last = parts.slice(1).join(" ").slice(0, 200);
  }
  if (first && !last) last = "-";
  return { firstName: first, lastName: last };
}

async function supabaseInsert(supabaseUrl, serviceKey, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_lead_submissions`;
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

async function supabasePatch(supabaseUrl, serviceKey, id, fields) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_lead_submissions?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(fields),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase patch ${r.status}: ${t.slice(0, 300)}`);
  }
}

async function hubspotFindContactByEmail(token, email) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
      limit: 1,
      properties: ["email", "firstname", "lastname", "phone"],
    }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  const row = data.results && data.results[0];
  return row ? String(row.id) : null;
}

async function hubspotCreateContact(token, properties) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`HubSpot create ${r.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  return data.id ? String(data.id) : null;
}

async function hubspotUpdateContact(token, id, properties) {
  const r = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HubSpot patch ${r.status}: ${t.slice(0, 400)}`);
  }
}

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

async function sendStaffEmail(lead) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  if (!clientId || !clientSecret || !refreshToken || !fromEmail) {
    return { skipped: true, reason: "Gmail not configured" };
  }

  const fullName = `${lead.firstName || ""} ${lead.lastName && lead.lastName !== "-" ? lead.lastName : ""}`.trim() || "Unknown";
  const subject = `Leave a Message — ${fullName}`;
  const bodyText = [
    "New website leave-a-message submission:",
    "",
    `Name: ${fullName}`,
    `Email: ${lead.email || ""}`,
    `Phone: ${lead.phone || ""}`,
    `Language: ${lead.lang || ""}`,
    `SMS opt-in: ${lead.smsConsent ? "Yes" : "No"}`,
    `Page: ${lead.pagePath || ""}`,
    `Record ID: ${lead.recordId || ""}`,
    `Timestamp (America/Chicago): ${chicagoTimestamp()}`,
    "",
    "Message:",
    lead.message || "(empty)",
  ].join("\n");

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = buildRawEmail(fromEmail, NOTIFY_TO, subject, bodyText);
    const sendResp = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    const messageId = sendResp && sendResp.data && sendResp.data.id ? String(sendResp.data.id) : null;
    return { sent: true, messageId };
  } catch (e) {
    return { sent: false, error: e.message };
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    applyCors(req, res);
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" }, req);
  }

  const originGate = verifySiteOrigin(req);
  if (!originGate.ok) {
    return json(res, originGate.status || 403, { ok: false, error: originGate.error || "Forbidden" }, req);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { ok: false, error: "Server missing Supabase env" }, req);
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" }, req);
  }

  if (body.website || body.company_website) {
    return json(res, 200, { ok: true, id: null }, req);
  }

  const { firstName, lastName } = splitName(body.name, body.firstName, body.lastName);
  const email = String(body.email || "")
    .trim()
    .toLowerCase()
    .slice(0, 500);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const message = String(body.message || body.quoteSummary || "").trim().slice(0, 5000);
  const lang = body.lang === "en" ? "en" : "es";
  const smsConsent = body.consent === true || body.consent === "true";
  const consentTextRaw = String(body.consentText || body.consent_text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
  const consentUrl = String(body.consentUrl || body.consent_url || "")
    .trim()
    .slice(0, 2000);
  const pagePath = String(body.pagePath || body.landingPath || "").trim().slice(0, 2000);
  const clientIp = capiClientIp(req);
  const consentUa = capiClientUserAgent(req, body);

  if (!firstName) {
    return json(res, 400, { ok: false, error: "Name is required" }, req);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, error: "Valid email required" }, req);
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return json(res, 400, { ok: false, error: "Valid phone number required" }, req);
  }
  if (!message) {
    return json(res, 400, { ok: false, error: "Message is required" }, req);
  }

  const nowIso = new Date().toISOString();
  const consentExpires = consentExpiresAt(nowIso, CONSENT_CONTACT_DAYS);
  const leadSource = "website_contact_form";
  const summaryForDb =
    (lang === "es" ? "[Mensaje del sitio web]\n" : "[Website leave a message]\n") + message;

  const payload = {
    firstName,
    lastName: lastName || "-",
    email,
    phone,
    lang,
    source: leadSource,
    marketingOptIn: {
      sms: smsConsent,
      email: true,
      phoneCalls: smsConsent,
    },
  };

  const consentSummary = {
    followUp: true,
    smsOptIn: smsConsent,
    voiceOptIn: smsConsent,
    marketingOptIn: {
      sms: smsConsent,
      email: true,
      phoneCalls: smsConsent,
      label: consentTextRaw
        ? consentTextRaw.slice(0, 500)
        : smsConsent
          ? "User opted in to SMS via optional checkbox on leave-a-message widget."
          : "User submitted leave-a-message without SMS opt-in (optional checkbox unchecked).",
    },
    consentText: consentTextRaw || null,
    ip: clientIp || null,
    url: consentUrl || null,
    userAgent: consentUa || null,
    at: nowIso,
    expiresAt: consentExpires,
    consentWindowDays: CONSENT_CONTACT_DAYS,
    lang,
  };

  const insertRow = {
    source: leadSource,
    first_name: firstName,
    last_name: lastName || "-",
    email,
    phone: phone || null,
    state_code: null,
    lang,
    quote_summary: summaryForDb,
    consent_summary: consentSummary,
    payload,
    request_raw: {
      ...payload,
      message,
      pagePath: pagePath || undefined,
      submittedAt: nowIso,
    },
    quote_status: "quote_requested",
    quote_generated_at: null,
    crm_sync_needed: true,
    origin_detail: pagePath ? { landing_path: pagePath } : {},
    session_client_id: null,
    consent_ip: clientIp || null,
    consent_text: consentTextRaw || null,
    consent_url: consentUrl || null,
    consent_user_agent: consentUa || null,
    consent_captured_at: nowIso,
    consent_expires_at: consentExpires,
  };

  let leadId;
  try {
    leadId = await supabaseInsert(supabaseUrl, supabaseKey, insertRow);
  } catch (e) {
    console.error("contact-message supabase", e);
    return json(res, 500, { ok: false, error: "Could not save message" }, req);
  }

  try {
    await clearActiveFeedPartitionHides(supabaseUrl, supabaseKey, { email, phone });
  } catch (e) {
    console.warn("contact-message clear partition hides", e && e.message);
  }

  try {
    await logComplianceEvent(supabaseUrl, supabaseKey, {
      leadId,
      leadSourceTable: "quote_lead_submissions",
      eventType: smsConsent ? "consent_captured" : "form_submitted_no_sms_opt_in",
      title: smsConsent
        ? "Leave-a-message consent captured (SMS + voice window)"
        : "Leave-a-message submitted without SMS opt-in",
      actor: "system:contact-message",
      detail: {
        ip: clientIp,
        consent_text: consentTextRaw || null,
        consent_url: consentUrl || null,
        user_agent: consentUa || null,
        sms_opt_in: smsConsent,
        source: leadSource,
        email,
        phone,
      },
    });
  } catch (e) {
    console.warn("contact-message compliance event", e && e.message);
  }

  let hubspotContactId = null;
  let hubspotErr = null;
  if (hubspotToken) {
    const hsProps = {
      email,
      firstname: firstName,
      lastname: lastName && lastName !== "-" ? lastName : "",
      phone,
    };
    try {
      const existingId = await hubspotFindContactByEmail(hubspotToken, email);
      if (existingId) {
        // Do not overwrite lifecycle on existing CRM contacts (may already be customers).
        await hubspotUpdateContact(hubspotToken, existingId, hsProps);
        hubspotContactId = existingId;
      } else {
        hubspotContactId = await hubspotCreateContact(hubspotToken, {
          ...hsProps,
          lifecyclestage: "lead",
          hs_lead_status: "OPEN",
        });
      }
      if (hubspotContactId) {
        const note =
          `Leave a Message (${lang.toUpperCase()}) on ${nowIso}\n` +
          `SMS opt-in: ${smsConsent ? "Yes" : "No"}\n` +
          `Page: ${pagePath || "(unknown)"}\n\n` +
          message;
        try {
          await hubspotAddNote(hubspotToken, hubspotContactId, note);
        } catch (noteErr) {
          console.warn("contact-message hubspot note", noteErr && noteErr.message);
        }
      }
    } catch (e) {
      hubspotErr = e.message || String(e);
      console.error("contact-message hubspot", e);
    }

    try {
      await supabasePatch(supabaseUrl, supabaseKey, leadId, {
        hubspot_contact_id: hubspotContactId,
        hubspot_sync_status: hubspotContactId ? "synced" : "failed",
        hubspot_sync_error: hubspotErr,
        crm_sync_needed: !hubspotContactId,
        hubspot_last_sync_at: hubspotContactId ? nowIso : null,
      });
    } catch (e) {
      console.error("contact-message supabase patch", e);
    }
  }

  const emailResult = await sendStaffEmail({
    firstName,
    lastName,
    email,
    phone,
    lang,
    message,
    smsConsent,
    pagePath,
    recordId: leadId,
  });

  return json(
    res,
    200,
    {
      ok: true,
      id: leadId,
      hubspot: {
        contactId: hubspotContactId,
        error: hubspotErr || null,
        skipped: !hubspotToken,
      },
      email: emailResult,
    },
    req
  );
};
