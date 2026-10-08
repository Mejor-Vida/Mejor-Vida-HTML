/**
 * Google Calendar free/busy + event create (Calendar API v3 via fetch).
 */
const { productionGmailRedirectUri } = require("../gmail-oauth-redirect");
const { google } = require("../google-clients");
const { getSchedulerConfig } = require("./config");
const { dualAppointmentLabel } = require("./timezone");

let cachedAccessToken = null;
let cachedExpiresAt = 0;

async function getOAuthClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refresh =
    String(process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || "").trim() ||
    String(process.env.GMAIL_REFRESH_TOKEN || "").trim();
  if (!clientId || !clientSecret || !refresh) {
    return { ok: false, reason: "google_oauth_not_configured" };
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, productionGmailRedirectUri());
  oauth2Client.setCredentials({ refresh_token: refresh });
  return { ok: true, client: oauth2Client };
}

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < cachedExpiresAt - 60_000) {
    return { ok: true, token: cachedAccessToken };
  }
  const auth = await getOAuthClient();
  if (!auth.ok) return auth;
  const { token } = await auth.client.getAccessToken();
  const access = token && String(token);
  if (!access) return { ok: false, reason: "no_access_token" };
  cachedAccessToken = access;
  cachedExpiresAt = Date.now() + 50 * 60 * 1000;
  return { ok: true, token: access };
}

async function fetchBusyWindows(timeMinIso, timeMaxIso) {
  const tok = await getAccessToken();
  if (!tok.ok) return { ok: false, busy: [], reason: tok.reason };

  const { calendarId } = getSchedulerConfig();
  const r = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tok.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMinIso,
      timeMax: timeMaxIso,
      items: [{ id: calendarId }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("[scheduler] freeBusy", r.status, JSON.stringify(j).slice(0, 300));
    return { ok: false, busy: [], reason: "freebusy_failed" };
  }
  const cal = j.calendars && j.calendars[calendarId];
  const busy = (cal && cal.busy) || [];
  return { ok: true, busy };
}

async function createCalendarEvent({
  startIso,
  endIso,
  bookerTimezone,
  hostTimezone,
  summary,
  description,
  attendeeEmail,
  attendeePhone,
  attendeeName,
}) {
  const tok = await getAccessToken();
  if (!tok.ok) return { ok: false, reason: tok.reason };

  const { calendarId } = getSchedulerConfig();
  const dual = dualAppointmentLabel(startIso, bookerTimezone, hostTimezone);
  const body = {
    summary: summary || "Final expense consultation — Mejor Vida",
    description:
      (description || "") +
      `\n\n—\nYour time: ${dual}\nPhone: ${attendeePhone || "—"}\n`,
    start: { dateTime: startIso, timeZone: hostTimezone },
    end: { dateTime: endIso, timeZone: hostTimezone },
    reminders: { useDefault: true },
  };
  if (attendeeEmail) {
    body.attendees = [{ email: attendeeEmail, displayName: attendeeName || undefined }];
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tok.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("[scheduler] create event", r.status, JSON.stringify(j).slice(0, 400));
    return { ok: false, reason: "create_event_failed", detail: j.error || j };
  }
  return { ok: true, eventId: j.id, htmlLink: j.htmlLink };
}

module.exports = { fetchBusyWindows, createCalendarEvent, getAccessToken };
