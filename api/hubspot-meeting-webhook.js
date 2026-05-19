/**
 * POST /api/hubspot-meeting-webhook
 *
 * HubSpot workflow webhook when a meeting is booked (Meetings scheduler).
 * Sends IntegrityCONNECT CSV email to admin + Julie unless the contact already
 * submitted a quote via quote.html or the Facebook landing page.
 *
 * HubSpot workflow → Custom code / Send webhook:
 *   URL: https://www.mejorvidainsurance.com/api/hubspot-meeting-webhook
 *   Method: POST
 *   Header: X-App-Secret: <MANYCHAT_WEBHOOK_SECRET>
 *     (or Authorization: Bearer <MANYCHAT_WEBHOOK_SECRET>)
 *
 * Example JSON body (map HubSpot contact + meeting tokens):
 * {
 *   "email": "{{ contact.email }}",
 *   "firstName": "{{ contact.firstname }}",
 *   "lastName": "{{ contact.lastname }}",
 *   "phone": "{{ contact.phone }}",
 *   "dateOfBirth": "{{ contact.date_of_birth }}",
 *   "state": "{{ contact.state }}",
 *   "city": "{{ contact.city }}",
 *   "zip": "{{ contact.zip }}",
 *   "address": "{{ contact.address }}",
 *   "appointmentStart": "{{ meeting.start_time }}",
 *   "meetingTitle": "{{ meeting.title }}",
 *   "hubspotContactId": "{{ contact.hs_object_id }}",
 *   "hubspotMeetingId": "{{ meeting.hs_object_id }}"
 * }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET,
 *      GMAIL_* (same as quote-lead-sync), HUBSPOT_ACCESS_TOKEN (optional enrich)
 */

const { sendAppointmentLeadNotification } = require("../lib/ic-lead-notify");

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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const auth = verifyWebhookSecret(req);
  if (!auth.ok) {
    return json(res, auth.status, { ok: false, error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  let body;
  try {
    body = readJsonBody(req);
  } catch {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  let lead = parseAppointmentPayload(body);

  if (hubspotToken) {
    try {
      if (lead.hubspotContactId && (!lead.email || !lead.phone)) {
        const cp = await hubspotGetContact(hubspotToken, lead.hubspotContactId);
        if (cp) {
          lead = {
            ...lead,
            firstName: lead.firstName || pickFromProps(cp, ["firstname"]),
            lastName: lead.lastName || pickFromProps(cp, ["lastname"]),
            email: lead.email || pickFromProps(cp, ["email"]).toLowerCase(),
            phone: lead.phone || pickFromProps(cp, ["phone", "mobilephone"]),
            dob: lead.dob || pickFromProps(cp, ["date_of_birth"]),
            state: lead.state || pickFromProps(cp, ["state"]),
            city: lead.city || pickFromProps(cp, ["city"]),
            zip: lead.zip || pickFromProps(cp, ["zip"]),
            address: lead.address || pickFromProps(cp, ["address"]),
          };
        }
      }
      if (lead.hubspotMeetingId && !lead.appointmentAt) {
        const mp = await hubspotGetMeeting(hubspotToken, lead.hubspotMeetingId);
        if (mp) {
          lead = {
            ...lead,
            appointmentAt: lead.appointmentAt || pickFromProps(mp, ["hs_meeting_start_time"]),
            meetingTitle: lead.meetingTitle || pickFromProps(mp, ["hs_meeting_title"]),
          };
        }
      }
    } catch (e) {
      console.error("[hubspot-meeting-webhook] HubSpot enrich", e.message || e);
    }
  }

  const notifyResult = await sendAppointmentLeadNotification(
    {
      ...lead,
      dateOfBirth: lead.dob,
      submittedAt: new Date().toISOString(),
    },
    { supabaseUrl, serviceKey: supabaseKey }
  );

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
};
