/**
 * Shared HubSpot / Make.com appointment booking normalization + Supabase upsert.
 */

const crypto = require("crypto");
const {
  upsertContact,
  updateContact,
  insertContact,
  getLeadState,
  upsertLeadState,
  insertEvent,
} = require("./contacts-db");
const { sendAppointmentLeadNotification } = require("./ic-lead-notify");

const CONTACT_SOURCE = "hubspot_scheduler";
const STAGE_ORDER = [
  "new_contact",
  "engaged",
  "partially_qualified",
  "quoted",
  "call_scheduled",
  "call_completed",
  "policy_issued",
  "closed_lost",
];

function base(supabaseUrl) {
  return supabaseUrl.replace(/\/$/, "") + "/rest/v1";
}

function restHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
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

function parseAppointmentPayload(body) {
  const contact = body.contact && typeof body.contact === "object" ? body.contact : {};
  const properties =
    body.properties && typeof body.properties === "object"
      ? body.properties
      : contact.properties && typeof contact.properties === "object"
        ? contact.properties
        : {};
  const meeting = body.meeting && typeof body.meeting === "object" ? body.meeting : {};

  const startTime = pickString(
    body.startTime,
    body.start_time,
    body.appointmentStart,
    body.appointment_start,
    body.scheduled_at,
    body.meeting_start,
    body.hs_meeting_start_time,
    meeting.hs_meeting_start_time,
    meeting.start_time,
    properties.hs_meeting_start_time
  );

  const meetingTime = pickString(
    body.meetingTime,
    body.meeting_time,
    body.appointmentTime,
    body.appointment_time,
    startTime
  );

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
    startTime,
    meetingTime,
    appointmentAt: startTime,
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
    language: pickString(body.language, body.idioma, body.lang),
    source: pickString(body.source) || CONTACT_SOURCE,
  };
}

function parseAppointmentIso(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const ms = Date.parse(s);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

function normalizePhoneE164(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length === 10) return `+1${digits}`;
  const trimmed = String(raw || "").trim();
  if (trimmed.startsWith("+") && digits.length >= 10) return trimmed;
  return "";
}

function phonePlaceholderFromEmail(email) {
  const h = crypto.createHash("sha256").update(String(email || "").toLowerCase()).digest("hex");
  const suffix = String(parseInt(h.slice(0, 8), 16) % 10000000).padStart(7, "0");
  return `+1999${suffix}`;
}

function mapLanguage(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "spanish";
  if (["en", "english", "ingles", "inglés"].includes(s)) return "english";
  if (["es", "spanish", "espanol", "español"].includes(s)) return "spanish";
  return "spanish";
}

function computeStage(current, updates) {
  const merged = { ...current, ...updates };
  if (updates.pipeline_stage) {
    const currentIdx = STAGE_ORDER.indexOf(current.pipeline_stage || "new_contact");
    const newIdx = STAGE_ORDER.indexOf(updates.pipeline_stage);
    return newIdx >= currentIdx ? updates.pipeline_stage : current.pipeline_stage;
  }
  if (merged.policy_issued_at) return "policy_issued";
  if (merged.call_completed_at) return "call_completed";
  if (merged.call_scheduled_at) return "call_scheduled";
  if (merged.monthly_premium != null) return "quoted";
  if (merged.quote_low && merged.quote_high) return "quoted";
  if (merged.age != null && merged.gender && merged.is_smoker != null) return "partially_qualified";
  return current.pipeline_stage || "engaged";
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
        const start = pickFromProps(mp, ["hs_meeting_start_time"]);
        next = {
          ...next,
          startTime: next.startTime || start,
          meetingTime: next.meetingTime || start,
          appointmentAt: next.appointmentAt || start,
          meetingTitle: next.meetingTitle || pickFromProps(mp, ["hs_meeting_title"]),
        };
      }
    }
  } catch (e) {
    console.error("[appointment-webhook] HubSpot enrich", e.message || e);
  }
  return next;
}

async function getContactByEmail(supabaseUrl, serviceKey, email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  const url = `${base(supabaseUrl)}/contacts?email=ilike.${encodeURIComponent(normalized)}&limit=1&order=updated_at.desc`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) throw new Error(`contacts select by email ${r.status}: ${text.slice(0, 300)}`);
  const rows = JSON.parse(text);
  return rows.length > 0 ? rows[0] : null;
}

async function hasRecentDuplicateEvent(supabaseUrl, serviceKey, contactId, appointmentIso) {
  if (!contactId || !appointmentIso) return false;
  const url =
    `${base(supabaseUrl)}/events?contact_id=eq.${encodeURIComponent(contactId)}` +
    `&event_type=eq.call_scheduled&order=created_at.desc&limit=10`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) return false;
  const rows = JSON.parse(text);
  if (!Array.isArray(rows)) return false;
  const targetMs = Date.parse(appointmentIso);
  if (Number.isNaN(targetMs)) return false;
  for (const row of rows) {
    const data = row.event_data && typeof row.event_data === "object" ? row.event_data : {};
    const prior = parseAppointmentIso(data.call_scheduled_at || data.appointmentAt || data.startTime);
    if (!prior) continue;
    if (Math.abs(Date.parse(prior) - targetMs) <= 60_000) return true;
  }
  return false;
}

async function resolveContactId(supabaseUrl, serviceKey, lead) {
  const phone = normalizePhoneE164(lead.phone);
  if (phone) {
    const { contactId, created } = await upsertContact(supabaseUrl, serviceKey, phone, {
      first_name: lead.firstName || undefined,
      last_name: lead.lastName || undefined,
      email: lead.email || undefined,
      us_state: lead.state || undefined,
      language: mapLanguage(lead.language),
      source: CONTACT_SOURCE,
    });
    return { contactId, created, phone };
  }

  if (lead.email) {
    const existing = await getContactByEmail(supabaseUrl, serviceKey, lead.email);
    if (existing) {
      await updateContact(supabaseUrl, serviceKey, existing.id, {
        first_name: lead.firstName || undefined,
        last_name: lead.lastName || undefined,
        email: lead.email,
        us_state: lead.state || undefined,
        language: mapLanguage(lead.language),
        source: CONTACT_SOURCE,
      });
      return { contactId: existing.id, created: false, phone: existing.phone };
    }
    const placeholderPhone = phonePlaceholderFromEmail(lead.email);
    const row = await insertContact(supabaseUrl, serviceKey, {
      phone: placeholderPhone,
      first_name: lead.firstName || null,
      last_name: lead.lastName || null,
      email: lead.email,
      us_state: lead.state || "NE",
      language: mapLanguage(lead.language),
      source: CONTACT_SOURCE,
    });
    return { contactId: row.id, created: true, phone: placeholderPhone };
  }

  return null;
}

/**
 * Process appointment booking: dedup, upsert contacts + lead_state, event, optional IC notify.
 */
async function processAppointmentWebhook(input, options = {}) {
  const supabaseUrl = options.supabaseUrl;
  const serviceKey = options.serviceKey || options.supabaseKey;
  const hubspotToken = options.hubspotToken;
  const skipIcNotify = options.skipIcNotify === true;
  const channel = options.channel || "hubspot_scheduler";

  let lead = parseAppointmentPayload(normalizeInputRecord(input));
  lead = await enrichLeadFromHubspot(lead, hubspotToken);

  if (!lead.email && !lead.phone) {
    return {
      ok: false,
      error: "email_or_phone_required",
      lead,
    };
  }

  const callScheduledAt = parseAppointmentIso(lead.appointmentAt);
  const contactResult = await resolveContactId(supabaseUrl, serviceKey, lead);
  if (!contactResult) {
    return { ok: false, error: "contact_resolution_failed", lead };
  }

  const { contactId, created, phone } = contactResult;
  const existingState = (await getLeadState(supabaseUrl, serviceKey, contactId)) || {};

  if (callScheduledAt) {
    const existingAt = existingState.call_scheduled_at
      ? parseAppointmentIso(existingState.call_scheduled_at)
      : null;
    if (existingAt && Math.abs(Date.parse(existingAt) - Date.parse(callScheduledAt)) <= 60_000) {
      return {
        ok: true,
        deduped: true,
        reason: "call_already_scheduled",
        contactId,
        phone,
        created,
        lead,
        pipeline_stage: existingState.pipeline_stage || "call_scheduled",
      };
    }

    const duplicateEvent = await hasRecentDuplicateEvent(
      supabaseUrl,
      serviceKey,
      contactId,
      callScheduledAt
    );
    if (duplicateEvent) {
      return {
        ok: true,
        deduped: true,
        reason: "duplicate_event",
        contactId,
        phone,
        created,
        lead,
        pipeline_stage: existingState.pipeline_stage || "call_scheduled",
      };
    }
  }

  const leadUpdates = {};
  if (callScheduledAt) leadUpdates.call_scheduled_at = callScheduledAt;
  if (lead.state) leadUpdates.us_state = lead.state;
  leadUpdates.pipeline_stage = computeStage(existingState, {
    ...leadUpdates,
    pipeline_stage: "call_scheduled",
  });

  await upsertLeadState(supabaseUrl, serviceKey, contactId, leadUpdates);

  if (callScheduledAt) {
    await insertEvent(
      supabaseUrl,
      serviceKey,
      contactId,
      "call_scheduled",
      {
        call_scheduled_at: callScheduledAt,
        startTime: lead.startTime,
        meetingTime: lead.meetingTime,
        appointmentAt: callScheduledAt,
        meetingTitle: lead.meetingTitle,
        hubspotContactId: lead.hubspotContactId,
        hubspotMeetingId: lead.hubspotMeetingId,
        source: CONTACT_SOURCE,
      },
      channel
    );
  }

  let notifyResult = null;
  if (!skipIcNotify) {
    notifyResult = await sendAppointmentLeadNotification(
      {
        ...lead,
        phone: lead.phone || phone,
        dateOfBirth: lead.dob,
        submittedAt: new Date().toISOString(),
      },
      { supabaseUrl, serviceKey }
    );
  }

  return {
    ok: true,
    deduped: false,
    contactId,
    phone,
    created,
    call_scheduled_at: callScheduledAt,
    pipeline_stage: leadUpdates.pipeline_stage,
    lead,
    notifyResult,
  };
}

function buildMakeWebhookPayload(lead) {
  return {
    firstName: lead.firstName || "",
    lastName: lead.lastName || "",
    email: lead.email || "",
    phone: lead.phone || "",
    startTime: lead.startTime || lead.appointmentAt || "",
    meetingTime: lead.meetingTime || lead.startTime || lead.appointmentAt || "",
    appointmentStart: lead.startTime || lead.appointmentAt || "",
    meetingTitle: lead.meetingTitle || "",
    hubspotContactId: lead.hubspotContactId || "",
    hubspotMeetingId: lead.hubspotMeetingId || "",
    source: CONTACT_SOURCE,
  };
}

module.exports = {
  CONTACT_SOURCE,
  parseAppointmentPayload,
  parseAppointmentIso,
  normalizeInputRecord,
  normalizePhoneE164,
  enrichLeadFromHubspot,
  processAppointmentWebhook,
  buildMakeWebhookPayload,
};
