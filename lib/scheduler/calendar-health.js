/**
 * Verify Google Calendar API + token (for CRM diagnostics).
 */
const { getAccessToken } = require("./google-calendar");

function parseEnableUrl(apiError) {
  const msg = String((apiError && apiError.message) || "");
  const m = msg.match(/project\s+(\d+)/i);
  if (m) {
    return `https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=${m[1]}`;
  }
  return "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com";
}

async function checkGoogleCalendarHealth() {
  const hasToken = !!String(process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || "").trim();
  if (!hasToken) {
    return {
      ok: false,
      reason: "missing_calendar_refresh_token",
      message: "Set GOOGLE_CALENDAR_REFRESH_TOKEN (Connect Google Calendar in CRM).",
    };
  }

  const tok = await getAccessToken();
  if (!tok.ok) {
    return {
      ok: false,
      reason: tok.reason || "token_failed",
      message: "Could not refresh Google access token. Re-connect Calendar OAuth.",
    };
  }

  const r = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1", {
    headers: { Authorization: `Bearer ${tok.token}` },
  });
  const j = await r.json().catch(() => ({}));
  if (r.ok) {
    const primary = (j.items || []).find((c) => c.primary) || (j.items || [])[0];
    return {
      ok: true,
      calendarId: primary ? primary.id : "primary",
      calendarSummary: primary ? primary.summary : null,
    };
  }

  const err = j.error || j;
  const disabled =
    r.status === 403 &&
    /has not been used|is disabled|accessNotConfigured/i.test(String(err.message || ""));
  if (disabled) {
    return {
      ok: false,
      reason: "calendar_api_disabled",
      message:
        "Google Calendar API is OFF for this Cloud project. Enable it (link below), wait 2–5 minutes, then book again.",
      enableUrl: parseEnableUrl(err),
    };
  }

  return {
    ok: false,
    reason: "calendar_api_error",
    message: String(err.message || "Calendar API error").slice(0, 280),
    enableUrl: parseEnableUrl(err),
  };
}

module.exports = { checkGoogleCalendarHealth, parseEnableUrl };
