/**
 * Chicago calendar helpers for the Sunday weekly newsletter.
 */

const TZ = "America/Chicago";

function chicagoDateISO(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date || new Date());
}

function chicagoParts(date) {
  const d = date || new Date();
  const parts = {};
  for (const p of new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).formatToParts(d)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }
  const hour = Number(parts.hour === "24" ? 0 : parts.hour);
  return {
    weekday: parts.weekday,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    iso: chicagoDateISO(d),
  };
}

function addDaysISO(iso, days) {
  const [y, m, d] = String(iso)
    .split("-")
    .map((n) => Number(n));
  const utc = Date.UTC(y, m - 1, d);
  const next = new Date(utc + days * 86400000);
  const yy = next.getUTCFullYear();
  const mm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(next.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Sunday send covers news from the previous 7 days, excluding today.
 */
function newsletterWindow(date) {
  const today = chicagoDateISO(date);
  return {
    timezone: TZ,
    today,
    startDate: addDaysISO(today, -7),
    endDate: addDaysISO(today, -1),
    weekKey: today,
  };
}

function isoDateFromPubDate(pubDate) {
  const t = Date.parse(String(pubDate || ""));
  if (!Number.isFinite(t)) return null;
  return chicagoDateISO(new Date(t));
}

function inNewsWindow(iso, window) {
  if (!iso) return false;
  return iso >= window.startDate && iso <= window.endDate;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Instant when America/Chicago shows `isoDate` at `hour`:`minute`.
 * Tries CST then CDT so the mapping stays correct year-round.
 */
function chicagoWallTimeUtc(isoDate, hour, minute) {
  const hh = pad2(hour);
  const mm = pad2(minute || 0);
  for (const off of ["-06:00", "-05:00"]) {
    const d = new Date(`${isoDate}T${hh}:${mm}:00${off}`);
    if (Number.isNaN(d.getTime())) continue;
    const p = chicagoParts(d);
    if (p.iso === isoDate && p.hour === Number(hour) && p.minute === Number(minute || 0)) {
      return d;
    }
  }
  throw new Error(`Could not map ${isoDate} ${hh}:${mm} America/Chicago to UTC`);
}

/** Sunday 6:00 a.m. Chicago only (cron fires 11:00 UTC in CDT and 12:00 UTC in CST). */
function isSundayMorningSendWindow(date) {
  const p = chicagoParts(date);
  return p.weekday === "Sun" && p.hour === 6;
}

/**
 * Weekly Facebook schedule for a digest dated `weekKey` (Sunday).
 * Story 1: as soon as the live blog exists on/after that Sunday.
 * Story 2: Tuesday 10:00 a.m. Chicago. Story 3: Thursday 10:00 a.m. Chicago.
 * If the target already passed, publish immediately.
 */
function weeklyFacebookSlotTimes(weekKey, now) {
  const at = now || new Date();
  const sundayStart = chicagoWallTimeUtc(weekKey, 0, 1);
  const tue = chicagoWallTimeUtc(addDaysISO(weekKey, 2), 10, 0);
  const thu = chicagoWallTimeUtc(addDaysISO(weekKey, 4), 10, 0);
  const slot1 = at < sundayStart ? sundayStart : at;
  return {
    1: slot1,
    2: at > tue ? at : tue,
    3: at > thu ? at : thu,
  };
}

module.exports = {
  TZ,
  chicagoDateISO,
  chicagoParts,
  addDaysISO,
  newsletterWindow,
  isoDateFromPubDate,
  inNewsWindow,
  chicagoWallTimeUtc,
  isSundayMorningSendWindow,
  weeklyFacebookSlotTimes,
};
