/**
 * Create Google Calendar event for an existing scheduler_appointments row.
 */
const { DateTime } = require("luxon");
const { createCalendarEvent } = require("./google-calendar");
const { loadSchedulerSettings } = require("./settings-store");
const { getSchedulerConfig } = require("./config");
const { dualAppointmentLabel } = require("./timezone");

function supabaseBase(url) {
  return String(url || "").replace(/\/$/, "") + "/rest/v1";
}

function headers(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function syncAppointmentToCalendar(cfg, appointmentId) {
  const r = await fetch(
    `${supabaseBase(cfg.supabaseUrl)}/scheduler_appointments?id=eq.${encodeURIComponent(appointmentId)}&limit=1`,
    { headers: headers(cfg.serviceKey) }
  );
  const rows = await r.json().catch(() => []);
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row) return { ok: false, status: 404, error: "not_found" };
  if (row.status !== "scheduled") return { ok: false, status: 400, error: "not_scheduled" };
  if (row.google_event_id) {
    return { ok: true, status: 200, already: true, google_event_id: row.google_event_id };
  }

  const schedRaw = await loadSchedulerSettings(cfg.supabaseUrl, cfg.serviceKey);
  const schedCfg = getSchedulerConfig(schedRaw);
  const hostTz = row.host_timezone || schedCfg.hostTimezone;
  const bookerTz = row.booker_timezone || hostTz;
  const startUtc = row.starts_at;
  const endUtc = row.ends_at;
  const startHost = DateTime.fromISO(startUtc, { zone: "utc" }).setZone(hostTz);
  const endHost = DateTime.fromISO(endUtc, { zone: "utc" }).setZone(hostTz);
  const lang = String(row.language || "spanish").toLowerCase();
  const summary = lang.startsWith("en")
    ? schedCfg.confirmationTitleEn
    : schedCfg.confirmationTitleEs;
  const dual = dualAppointmentLabel(startUtc, bookerTz, hostTz);

  const cal = await createCalendarEvent({
    startIso: startHost.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
    endIso: endHost.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
    bookerTimezone: bookerTz,
    hostTimezone: hostTz,
    summary,
    description: dual,
    attendeeEmail: row.email || undefined,
    attendeePhone: row.phone,
    attendeeName: [row.first_name, row.last_name].filter(Boolean).join(" "),
  });

  if (!cal.ok) {
    const detailMsg =
      cal.detail && cal.detail.message ? String(cal.detail.message).slice(0, 300) : cal.reason;
    return { ok: false, status: 502, error: "calendar_sync_failed", detail: detailMsg };
  }

  const meta = { ...(row.meta && typeof row.meta === "object" ? row.meta : {}) };
  meta.calendar_ok = true;
  meta.calendar_synced_at = new Date().toISOString();

  await fetch(`${supabaseBase(cfg.supabaseUrl)}/scheduler_appointments?id=eq.${encodeURIComponent(row.id)}`, {
    method: "PATCH",
    headers: headers(cfg.serviceKey),
    body: JSON.stringify({
      google_event_id: cal.eventId,
      meta: { ...meta, calendar_reason: null },
    }),
  });

  return { ok: true, status: 200, google_event_id: cal.eventId, htmlLink: cal.htmlLink };
}

module.exports = { syncAppointmentToCalendar };
