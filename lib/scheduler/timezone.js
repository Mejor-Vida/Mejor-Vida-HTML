/**
 * Scheduler timezone helpers (IANA + IP hint + dual labels).
 */
const { ianaTimezoneForLead } = require("../us-state-timezone");

const US_TIMEZONE_OPTIONS = [
  { id: "America/New_York", label: "Eastern (ET)" },
  { id: "America/Chicago", label: "Central (CT)" },
  { id: "America/Denver", label: "Mountain (MT)" },
  { id: "America/Phoenix", label: "Arizona (no DST)" },
  { id: "America/Los_Angeles", label: "Pacific (PT)" },
  { id: "America/Anchorage", label: "Alaska" },
  { id: "Pacific/Honolulu", label: "Hawaii" },
];

function isValidIana(tz) {
  const s = String(tz || "").trim();
  if (!s || s.length > 64) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: s });
    return true;
  } catch {
    return false;
  }
}

function normalizeIana(tz, fallback = "America/Chicago") {
  const s = String(tz || "").trim();
  if (isValidIana(s)) return s;
  return isValidIana(fallback) ? fallback : "America/Chicago";
}

/** Vercel / Cloudflare geo headers (best-effort). */
function detectTimezoneFromRequest(req) {
  const h = (req && req.headers) || {};
  const vercel = String(h["x-vercel-ip-timezone"] || h["x-vercel-ip-timezone".toLowerCase()] || "").trim();
  if (isValidIana(vercel)) return vercel;
  const cf = String(h["cf-timezone"] || "").trim();
  if (isValidIana(cf)) return cf;
  return null;
}

function formatInZone(iso, timeZone, opts = {}) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(opts.locale || "en-US", {
    timeZone,
    weekday: opts.weekday ? "short" : undefined,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: opts.timeZoneName ? "short" : undefined,
  }).format(d);
}

function dualAppointmentLabel(startIso, bookerTz, hostTz, locale = "en-US") {
  const host = normalizeIana(hostTz, "America/Chicago");
  const booker = normalizeIana(bookerTz, host);
  const hostLine = formatInZone(startIso, host, { locale, timeZoneName: "short" });
  if (booker === host) return hostLine;
  const clientLine = formatInZone(startIso, booker, { locale, timeZoneName: "short" });
  return `${hostLine} (client: ${clientLine})`;
}

function guessTimezoneFromState(usState) {
  const abbr = String(usState || "").trim().toUpperCase();
  if (!abbr) return null;
  const iana = ianaTimezoneForLead(abbr, "");
  return isValidIana(iana) ? iana : null;
}

module.exports = {
  US_TIMEZONE_OPTIONS,
  isValidIana,
  normalizeIana,
  detectTimezoneFromRequest,
  formatInZone,
  dualAppointmentLabel,
  guessTimezoneFromState,
};
