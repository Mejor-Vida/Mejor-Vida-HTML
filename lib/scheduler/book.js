/**
 * Book appointment: Google event + scheduler_appointments + CRM pipeline.
 */
const crypto = require("crypto");
const { DateTime } = require("luxon");
const { getSchedulerConfig } = require("./config");
const { loadSchedulerSettings } = require("./settings-store");
const { createCalendarEvent } = require("./google-calendar");
const { listAvailableSlots } = require("./slots");
const { normalizeIana, dualAppointmentLabel } = require("./timezone");
const { processAppointmentWebhook, normalizePhoneE164 } = require("../appointment-webhook-lib");
const { sendSchedulerConfirmationEmails } = require("./confirmation-emails");

function supabaseBase(url) {
  return String(url || "").replace(/\/$/, "") + "/rest/v1";
}

function restHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function fetchDbBusy(supabaseUrl, serviceKey, timeMin, timeMax) {
  const q =
    `scheduler_appointments?select=starts_at,ends_at` +
    `&status=eq.scheduled` +
    `&starts_at=lt.${encodeURIComponent(timeMax)}` +
    `&ends_at=gt.${encodeURIComponent(timeMin)}`;
  const r = await fetch(`${supabaseBase(supabaseUrl)}/${q}`, {
    headers: restHeaders(serviceKey),
  });
  const rows = await r.json().catch(() => []);
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    start: row.starts_at,
    end: row.ends_at,
  }));
}

async function insertAppointmentRow(supabaseUrl, serviceKey, row) {
  const r = await fetch(`${supabaseBase(supabaseUrl)}/scheduler_appointments`, {
    method: "POST",
    headers: restHeaders(serviceKey),
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`scheduler_appointments insert ${r.status}: ${text.slice(0, 300)}`);
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

async function patchLeadStateTimezone(supabaseUrl, serviceKey, contactId, bookerTz) {
  const r = await fetch(
    `${supabaseBase(supabaseUrl)}/lead_state?contact_id=eq.${encodeURIComponent(contactId)}`,
    {
      method: "PATCH",
      headers: restHeaders(serviceKey),
      body: JSON.stringify({ appointment_booker_timezone: bookerTz }),
    }
  );
  if (!r.ok) {
    const t = await r.text();
    console.error("[scheduler] lead_state tz patch", r.status, t.slice(0, 200));
  }
}

/**
 * @param {object} input
 * @param {object} cfg { supabaseUrl, serviceKey }
 */
async function bookAppointment(input, cfg) {
  const supabaseUrl = cfg.supabaseUrl;
  const serviceKey = cfg.serviceKey;
  const schedRaw = await loadSchedulerSettings(supabaseUrl, serviceKey);
  const schedCfg = getSchedulerConfig(schedRaw);
  if (schedCfg.bookingPagePublic === false) {
    return { ok: false, status: 503, error: "scheduler_paused" };
  }
  const hostTz = normalizeIana(schedCfg.hostTimezone);
  const bookerTz = normalizeIana(input.bookerTimezone, hostTz);

  const startUtc = String(input.startUtc || "").trim();
  const endUtc = String(input.endUtc || "").trim();
  if (!startUtc || !endUtc) return { ok: false, status: 400, error: "startUtc required" };

  const phone = normalizePhoneE164(input.phone);
  if (!phone) return { ok: false, status: 400, error: "phone required" };

  const firstName = String(input.firstName || input.first_name || "").trim().slice(0, 120);
  const lastName = String(input.lastName || input.last_name || "").trim().slice(0, 120);
  const email = String(input.email || "").trim().toLowerCase().slice(0, 200);
  if (!firstName) return { ok: false, status: 400, error: "firstName required" };
  if (schedCfg.requireEmail && !email) {
    return { ok: false, status: 400, error: "email required" };
  }
  const marketingOptIn = input.marketingOptIn === true || input.marketing_opt_in === true;
  const language = String(input.language || "spanish").trim().toLowerCase();
  const usState = String(input.usState || input.us_state || "").trim().toUpperCase().slice(0, 2);

  const startMs = Date.parse(startUtc);
  const endMs = Date.parse(endUtc);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return { ok: false, status: 400, error: "invalid slot" };
  }

  const startHost = DateTime.fromISO(startUtc, { zone: "utc" }).setZone(hostTz);
  const endHost = DateTime.fromISO(endUtc, { zone: "utc" }).setZone(hostTz);
  const fromYmd = startHost.toFormat("yyyy-MM-dd");
  const toYmd = startHost.toFormat("yyyy-MM-dd");

  const dbBusy = await fetchDbBusy(supabaseUrl, serviceKey, startUtc, endUtc);
  const avail = await listAvailableSlots({
    bookerTimezone: bookerTz,
    fromYmd,
    toYmd,
    dbBusyRanges: dbBusy,
    schedConfig: schedRaw,
  });
  const targetIso = new Date(startMs).toISOString();
  const allowed = avail.slots.some((s) => Math.abs(Date.parse(s.startUtc) - startMs) < 1000);
  if (!allowed) {
    return { ok: false, status: 409, error: "slot_unavailable" };
  }

  const dual = dualAppointmentLabel(startUtc, bookerTz, hostTz);
  const summary = language.startsWith("en")
    ? schedCfg.confirmationTitleEn || "Final expense consultation — Mejor Vida Insurance"
    : schedCfg.confirmationTitleEs || "Consulta de gastos finales — Mejor Vida Seguros";

  const cal = await createCalendarEvent({
    startIso: startHost.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
    endIso: endHost.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
    bookerTimezone: bookerTz,
    hostTimezone: hostTz,
    summary,
    description: dual,
    attendeeEmail: email || undefined,
    attendeePhone: phone,
    attendeeName: [firstName, lastName].filter(Boolean).join(" "),
  });

  const cancelToken = crypto.randomBytes(24).toString("hex");
  const cancelHash = crypto.createHash("sha256").update(cancelToken).digest("hex");

  const apptRow = await insertAppointmentRow(supabaseUrl, serviceKey, {
    starts_at: new Date(startMs).toISOString(),
    ends_at: new Date(endMs).toISOString(),
    booker_timezone: bookerTz,
    host_timezone: hostTz,
    status: "scheduled",
    google_event_id: cal.ok ? cal.eventId : null,
    first_name: firstName,
    last_name: lastName || null,
    phone,
    email: email || null,
    language,
    us_state: usState || null,
    cancel_token_hash: cancelHash,
    source: "mvi_scheduler",
    marketing_opt_in: marketingOptIn,
    meta: {
      calendar_ok: cal.ok,
      calendar_reason: cal.reason || null,
      calendar_error:
        cal.detail && cal.detail.message ? String(cal.detail.message).slice(0, 500) : null,
      marketing_opt_in: marketingOptIn,
      consent_text: input.consentText ? String(input.consentText).slice(0, 4000) : null,
      consent_url: input.consentUrl ? String(input.consentUrl).slice(0, 2000) : null,
    },
  });

  const webhook = await processAppointmentWebhook(
    {
      firstName,
      lastName,
      email,
      phone,
      state: usState,
      startTime: new Date(startMs).toISOString(),
      meetingTime: new Date(startMs).toISOString(),
      appointmentStart: new Date(startMs).toISOString(),
      source: "mvi_scheduler",
      language,
      bookerTimezone: bookerTz,
      hostTimezone: hostTz,
      appointmentLabelHost: dualAppointmentLabel(startUtc, bookerTz, hostTz, "en-US"),
      appointmentLabelBooker: dualAppointmentLabel(startUtc, bookerTz, bookerTz, "en-US"),
      schedulerAppointmentId: apptRow.id,
      marketingOptIn,
      consentText: input.consentText,
      consentUrl: input.consentUrl,
    },
    {
      supabaseUrl,
      serviceKey,
      channel: "mvi_scheduler",
      skipIcNotify: true,
    }
  );

  let emailResult = null;
  try {
    emailResult = await sendSchedulerConfirmationEmails({
      email,
      firstName,
      lastName,
      phone,
      language,
      labels: {
        host: dualAppointmentLabel(startUtc, bookerTz, hostTz, "en-US"),
        booker: dualAppointmentLabel(startUtc, bookerTz, bookerTz, "en-US"),
      },
      marketingOptIn,
      appointmentId: apptRow.id,
      cancelToken,
      calendarLinked: !!(cal.ok && cal.eventId),
    });
  } catch (e) {
    console.error("[scheduler] confirmation email", e.message || e);
  }

  if (webhook.contactId) {
    await patchLeadStateTimezone(supabaseUrl, serviceKey, webhook.contactId, bookerTz);
    if (apptRow.id) {
      await fetch(`${supabaseBase(supabaseUrl)}/scheduler_appointments?id=eq.${apptRow.id}`, {
        method: "PATCH",
        headers: restHeaders(serviceKey),
        body: JSON.stringify({ contact_id: webhook.contactId }),
      });
    }
  }

  return {
    ok: true,
    status: 200,
    contact_id: webhook.contactId,
    call_scheduled_at: webhook.call_scheduled_at,
    appointment_id: apptRow.id,
    google_event: cal.ok ? { id: cal.eventId, link: cal.htmlLink } : { skipped: true, reason: cal.reason },
    labels: {
      host: dualAppointmentLabel(startUtc, bookerTz, hostTz, "en-US"),
      booker: dualAppointmentLabel(startUtc, bookerTz, bookerTz, "en-US"),
    },
    cancel_token: cancelToken,
    email: emailResult,
  };
}

module.exports = { bookAppointment };
