/**
 * GET|POST /api/hubspot-meeting-webhook
 *
 * Sends IntegrityCONNECT CSV email to admin + Julie when a HubSpot meeting is
 * booked, unless the contact already submitted a quote (dedup by email/phone).
 *
 * POST — Make.com, HubSpot workflow, or server-to-server:
 *   URL: https://www.mejorvidainsurance.com/api/hubspot-meeting-webhook
 *   Header: X-App-Secret: <MANYCHAT_WEBHOOK_SECRET>
 *     (or Authorization: Bearer <MANYCHAT_WEBHOOK_SECRET>)
 *
 * GET — HubSpot meeting confirmation redirect (free plan; no native webhook):
 *   Prefer /confirmacion.html for CRM sync + user-facing confirmation, or this route for IC email only:
 *   https://www.mejorvidainsurance.com/confirmacion.html?email={{contact.email}}&firstName={{contact.firstname}}&lastName={{contact.lastname}}&phone={{contact.phone}}&startTime={{meeting.start_time}}&meetingTime={{meeting.start_time}}
 *   Legacy IC-only redirect:
 *   https://www.mejorvidainsurance.com/api/hubspot-meeting-webhook?email=...&appointmentStart={{meeting.start_time}}
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET (POST),
 *      GMAIL_*, HUBSPOT_ACCESS_TOKEN (optional enrich)
 */

const { sendAppointmentLeadNotification } = require("../lib/ic-lead-notify");
const {
  parseAppointmentPayload,
  normalizeInputRecord,
  enrichLeadFromHubspot,
} = require("../lib/appointment-webhook-lib");

const DEFAULT_REDIRECT = "https://www.mejorvidainsurance.com/thank-you.html?booked=1";

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function getHeader(req, name) {
  const h = req.headers || {};
  const lower = name.toLowerCase();
  if (h[lower] !== undefined) return String(h[lower]);
  const keys = Object.keys(h);
  const found = keys.find((k) => k.toLowerCase() === lower);
  return found ? String(h[found]) : "";
}

function verifyWebhookSecret(req) {
  const secret = process.env.MANYCHAT_WEBHOOK_SECRET;
  if (!secret) {
    return { ok: false, status: 500, error: "MANYCHAT_WEBHOOK_SECRET not configured" };
  }
  const appSecret = getHeader(req, "x-app-secret");
  const auth = getHeader(req, "authorization");
  const bearer = auth.match(/^Bearer\s+(.+)$/i) ? auth.replace(/^Bearer\s+/i, "").trim() : "";
  if (appSecret === secret || bearer === secret) return { ok: true };
  return { ok: false, status: 401, error: "Unauthorized" };
}

function pickString(...values) {
  for (const v of values) {
    const s = v == null ? "" : String(v).trim();
    if (s && !/^\{\{.*\}\}$/.test(s)) return s;
  }
  return "";
}

function readQueryInput(req) {
  const q = normalizeInputRecord(req.query);
  if (Object.keys(q).length > 0) return q;

  try {
    const host = getHeader(req, "host") || "www.mejorvidainsurance.com";
    const proto = getHeader(req, "x-forwarded-proto") || "https";
    const path = req.url || "";
    const url = new URL(path.startsWith("http") ? path : `${proto}://${host}${path}`);
    return normalizeInputRecord(Object.fromEntries(url.searchParams.entries()));
  } catch {
    return {};
  }
}

function safeRedirectUrl(candidate) {
  const s = String(candidate || "").trim();
  if (!s) return DEFAULT_REDIRECT;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return DEFAULT_REDIRECT;
    const host = u.hostname.toLowerCase();
    if (host === "mejorvidainsurance.com" || host === "www.mejorvidainsurance.com") {
      return u.toString();
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_REDIRECT;
}

async function processAppointmentBooking(input, { supabaseUrl, supabaseKey, hubspotToken }) {
  let lead = parseAppointmentPayload(input);
  lead = await enrichLeadFromHubspot(lead, hubspotToken);

  const notifyResult = await sendAppointmentLeadNotification(
    {
      ...lead,
      dateOfBirth: lead.dob,
      submittedAt: new Date().toISOString(),
    },
    { supabaseUrl, serviceKey: supabaseKey }
  );

  return { lead, notifyResult };
}

function redirectHtml(targetUrl, title, message) {
  const safeUrl = targetUrl.replace(/"/g, "&quot;");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${safeUrl}"><title>${title}</title></head><body><p>${message}</p><p><a href="${safeUrl}">Continue</a></p></body></html>`;
}

module.exports = async function handler(req, res) {
  const method = (req.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(204).end();
  }

  if (method !== "GET" && method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (method === "POST") {
    const auth = verifyWebhookSecret(req);
    if (!auth.ok) {
      return json(res, auth.status, { ok: false, error: auth.error });
    }

    let body;
    try {
      body = readJsonBody(req);
    } catch {
      return json(res, 400, { ok: false, error: "Invalid JSON" });
    }

    const { notifyResult } = await processAppointmentBooking(body, {
      supabaseUrl,
      supabaseKey,
      hubspotToken,
    });

    if (notifyResult && notifyResult.skipped) {
      return json(res, 200, {
        ok: true,
        notified: false,
        reason: notifyResult.reason,
      });
    }

    if (notifyResult && notifyResult.sent) {
      return json(res, 200, {
        ok: true,
        notified: true,
        messageId: notifyResult.messageId,
        csvFilename: notifyResult.csvFilename,
      });
    }

    return json(res, 200, {
      ok: true,
      notified: false,
      reason: (notifyResult && notifyResult.reason) || "not_sent",
    });
  }

  /* GET — HubSpot confirmation redirect */
  const query = readQueryInput(req);
  const redirectTarget = safeRedirectUrl(query.redirect);

  if (!pickString(query.email, query.phone, query.firstName, query.lastName)) {
    res.status(302).setHeader("Location", redirectTarget);
    return res.end();
  }

  try {
    await processAppointmentBooking(query, {
      supabaseUrl,
      supabaseKey,
      hubspotToken,
    });
  } catch (e) {
    console.error("[hubspot-meeting-webhook] GET process", e.message || e);
  }

  res.status(302).setHeader("Location", redirectTarget);
  return res.end();
};
