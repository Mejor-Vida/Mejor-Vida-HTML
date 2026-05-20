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
 *   Set each scheduling page “Redirect URL” / confirmation redirect to e.g.:
 *   https://www.mejorvidainsurance.com/api/hubspot-meeting-webhook?email={{contact.email}}&firstName={{contact.firstname}}&lastName={{contact.lastname}}&phone={{contact.phone}}&appointmentStart={{meeting.start_time}}
 *   (Use the personalization tokens HubSpot shows for your account; aliases
 *   firstname/lastname/dateOfBirth/etc. are also accepted.)
 *   After processing, redirects to /thank-you.html?booked=1 (override with
 *   &redirect=https://www.mejorvidainsurance.com/your-page.html).
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET (POST),
 *      GMAIL_*, HUBSPOT_ACCESS_TOKEN (optional enrich)
 */

const { sendAppointmentLeadNotification } = require("../lib/ic-lead-notify");

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

function pickFromProps(props, keys) {
  if (!props || typeof props !== "object") return "";
  for (const k of keys) {
    const v = props[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

function normalizeInputRecord(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      out[k] = v.length ? String(v[0]) : "";
    } else if (typeof v === "object") {
      out[k] = v;
    } else {
      out[k] = String(v);
    }
  }
  return out;
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

async function hubspotGetContact(token, contactId) {
  const props = [
    "email",
    "firstname",
    "lastname",
    "phone",
    "mobilephone",
    "date_of_birth",
    "state",
    "city",
    "zip",
    "address",
  ].join(",");
  const r = await fetch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(contactId)}?properties=${props}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!r.ok) return null;
  const data = await r.json();
  return data && data.properties ? data.properties : null;
}

async function hubspotGetMeeting(token, meetingId) {
  const props = ["hs_meeting_title", "hs_meeting_start_time", "hs_meeting_end_time"].join(",");
  const r = await fetch(
    `https://api.hubapi.com/crm/v3/objects/meetings/${encodeURIComponent(meetingId)}?properties=${props}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!r.ok) return null;
  const data = await r.json();
  return data && data.properties ? data.properties : null;
}

function parseAppointmentPayload(body) {
  const contact = body.contact && typeof body.contact === "object" ? body.contact : {};
  const properties =
    body.properties && typeof body.properties === "object"
      ? body.properties
      : contact.properties && typeof contact.properties === "object"
        ? contact.properties
        : {};
  const meeting = body.meeting && typeof body.meeting === "object" ? body.meeting : {};

  return {
    firstName: pickString(
      body.firstName,
      body.firstname,
      body.first_name,
      contact.firstname,
      contact.firstName,
      properties.firstname
    ),
    lastName: pickString(
      body.lastName,
      body.lastname,
      body.last_name,
      contact.lastname,
      contact.lastName,
      properties.lastname
    ),
    email: pickString(body.email, contact.email, properties.email).toLowerCase(),
    phone: pickString(
      body.phone,
      body.mobilephone,
      body.mobilePhone,
      contact.phone,
      contact.mobilephone,
      properties.phone,
      properties.mobilephone
    ),
    dob: pickString(
      body.dateOfBirth,
      body.date_of_birth,
      body.dob,
      contact.date_of_birth,
      properties.date_of_birth
    ),
    state: pickString(body.state, contact.state, properties.state),
    city: pickString(body.city, contact.city, properties.city),
    zip: pickString(body.zip, contact.zip, properties.zip),
    address: pickString(body.address, contact.address, properties.address),
    appointmentAt: pickString(
      body.appointmentStart,
      body.appointment_start,
      body.scheduled_at,
      body.meeting_start,
      body.start_time,
      body.startTime,
      body.hs_meeting_start_time,
      meeting.hs_meeting_start_time,
      meeting.start_time,
      properties.hs_meeting_start_time
    ),
    meetingTitle: pickString(
      body.meetingTitle,
      body.meeting_title,
      meeting.hs_meeting_title,
      meeting.title,
      properties.hs_meeting_title
    ),
    hubspotContactId: pickString(
      body.hubspotContactId,
      body.hubspot_contact_id,
      body.contactId,
      body.contact_id,
      contact.id,
      contact.hs_object_id,
      properties.hs_object_id
    ),
    hubspotMeetingId: pickString(
      body.hubspotMeetingId,
      body.hubspot_meeting_id,
      body.meetingId,
      body.meeting_id,
      meeting.id,
      meeting.hs_object_id
    ),
  };
}

async function enrichLeadFromHubspot(lead, hubspotToken) {
  if (!hubspotToken) return lead;

  let next = { ...lead };
  try {
    if (next.hubspotContactId && (!next.email || !next.phone)) {
      const cp = await hubspotGetContact(hubspotToken, next.hubspotContactId);
      if (cp) {
        next = {
          ...next,
          firstName: next.firstName || pickFromProps(cp, ["firstname"]),
          lastName: next.lastName || pickFromProps(cp, ["lastname"]),
          email: next.email || pickFromProps(cp, ["email"]).toLowerCase(),
          phone: next.phone || pickFromProps(cp, ["phone", "mobilephone"]),
          dob: next.dob || pickFromProps(cp, ["date_of_birth"]),
          state: next.state || pickFromProps(cp, ["state"]),
          city: next.city || pickFromProps(cp, ["city"]),
          zip: next.zip || pickFromProps(cp, ["zip"]),
          address: next.address || pickFromProps(cp, ["address"]),
        };
      }
    }
    if (next.hubspotMeetingId && !next.appointmentAt) {
      const mp = await hubspotGetMeeting(hubspotToken, next.hubspotMeetingId);
      if (mp) {
        next = {
          ...next,
          appointmentAt: next.appointmentAt || pickFromProps(mp, ["hs_meeting_start_time"]),
          meetingTitle: next.meetingTitle || pickFromProps(mp, ["hs_meeting_title"]),
        };
      }
    }
  } catch (e) {
    console.error("[hubspot-meeting-webhook] HubSpot enrich", e.message || e);
  }
  return next;
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
