/**
 * GET|POST /api/hubspot-meeting-webhook
 *
 * HubSpot meeting booking — CRM upsert + IC CSV email to admin + Julie.
 *
 * POST — Make.com, HubSpot workflow, or server-to-server:
 *   URL: https://www.mejorvidainsurance.com/api/hubspot-meeting-webhook
 *   Header: X-App-Secret: <MANYCHAT_WEBHOOK_SECRET>
 *
 * GET — HubSpot confirmation redirect (recommended; runs server-side, no browser JS):
 *   https://www.mejorvidainsurance.com/api/hubspot-meeting-webhook?email={{contact.email}}&firstName={{contact.firstname}}&lastName={{contact.lastname}}&phone={{contact.phone}}&startTime={{meeting.start_time}}&meetingTime={{meeting.start_time}}&hubspotContactId={{contact.hs_object_id}}&hubspotMeetingId={{meeting.hs_object_id}}
 *
 * After processing, redirects to /confirmacion.html (display only) unless `redirect=` is set.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET (POST),
 *      GMAIL_*, HUBSPOT_ACCESS_TOKEN (optional enrich)
 */

const {
  normalizeInputRecord,
  processAppointmentWebhook,
} = require("../lib/appointment-webhook-lib");
const { logWebhook } = require("../lib/contacts-db");

const DEFAULT_REDIRECT = "https://www.mejorvidainsurance.com/confirmacion.html";

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

/** After server-side sync, send booker to confirmacion for display (skip duplicate POST). */
function buildConfirmacionRedirect(query, explicitRedirect) {
  if (explicitRedirect) return safeRedirectUrl(explicitRedirect);

  const params = new URLSearchParams();
  const normalized = normalizeInputRecord(query);
  const passthrough = [
    "email",
    "firstName",
    "firstname",
    "first_name",
    "lastName",
    "lastname",
    "last_name",
    "phone",
    "startTime",
    "start_time",
    "meetingTime",
    "meeting_time",
    "meetingTitle",
    "meeting_title",
  ];
  for (const key of passthrough) {
    const val = normalized[key];
    if (val) params.set(key, String(val));
  }
  params.set("processed", "1");
  return `${DEFAULT_REDIRECT}?${params.toString()}`;
}

async function handleBooking(input, { supabaseUrl, supabaseKey, hubspotToken, channel }) {
  const normalizedInput = normalizeInputRecord(input);
  await logWebhook(
    supabaseUrl,
    supabaseKey,
    "appointment",
    "/api/hubspot-meeting-webhook",
    normalizedInput,
    "received"
  );

  const result = await processAppointmentWebhook(normalizedInput, {
    supabaseUrl,
    serviceKey: supabaseKey,
    hubspotToken,
    channel,
  });

  await logWebhook(
    supabaseUrl,
    supabaseKey,
    "appointment",
    "/api/hubspot-meeting-webhook",
    {
      contact_id: result.contactId,
      deduped: result.deduped,
      reason: result.reason,
      notified: result.notifyResult ? result.notifyResult.sent === true : false,
      notify_skipped: result.notifyResult ? result.notifyResult.skipped === true : false,
      notify_reason: result.notifyResult ? result.notifyResult.reason : null,
      error: result.error || null,
    },
    result.ok ? "processed" : "error"
  );

  return result;
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

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { ok: false, error: "Supabase not configured" });
  }

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

    try {
      const result = await handleBooking(body, {
        supabaseUrl,
        supabaseKey,
        hubspotToken,
        channel: "hubspot_meeting_webhook_post",
      });

      if (!result.ok) {
        return json(res, 400, { ok: false, error: result.error, lead: result.lead || null });
      }

      const notifyResult = result.notifyResult || {};
      return json(res, 200, {
        ok: true,
        deduped: result.deduped === true,
        reason: result.reason || null,
        contact_id: result.contactId,
        notified: notifyResult.sent === true,
        notify_skipped: notifyResult.skipped === true,
        notify_reason: notifyResult.reason || null,
        messageId: notifyResult.messageId || null,
        csvFilename: notifyResult.csvFilename || null,
      });
    } catch (e) {
      console.error("[hubspot-meeting-webhook] POST", e.message || e);
      return json(res, 500, { ok: false, error: "processing_failed" });
    }
  }

  /* GET — HubSpot confirmation redirect (server-side; reliable IC + CRM) */
  const query = readQueryInput(req);
  const redirectTarget = buildConfirmacionRedirect(query, query.redirect);

  if (!pickString(query.email, query.phone, query.firstName, query.lastName)) {
    res.status(302).setHeader("Location", redirectTarget);
    return res.end();
  }

  try {
    await handleBooking(query, {
      supabaseUrl,
      supabaseKey,
      hubspotToken,
      channel: "hubspot_meeting_redirect",
    });
  } catch (e) {
    console.error("[hubspot-meeting-webhook] GET process", e.message || e);
  }

  res.status(302).setHeader("Location", redirectTarget);
  return res.end();
};
