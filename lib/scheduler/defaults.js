/**
 * Default scheduler configuration (high-end booking product baseline).
 */
const DEFAULT_WORK_HOURS = {
  0: null,
  1: [9, 17],
  2: [9, 17],
  3: [9, 17],
  4: [9, 17],
  5: [9, 17],
  6: [10, 14],
};

function defaultSchedulerConfig() {
  return {
    hostTimezone: String(process.env.SCHEDULER_HOST_TIMEZONE || "America/Chicago").trim(),
    hostName: "Julie Braunsroth",
    hostAgencyEs: "Mejor Vida Seguros",
    hostAgencyEn: "Mejor Vida Insurance",
    calendarId: String(process.env.GOOGLE_CALENDAR_ID || "primary").trim(),
    slotMinutes: 30,
    bufferMinutes: 10,
    minNoticeHours: 3,
    horizonDays: 21,
    maxBookingsPerDay: 8,
    workHours: { ...DEFAULT_WORK_HOURS },
    blockedDates: [],
    requireEmail: true,
    requirePhone: true,
    allowClientReschedule: true,
    showTimezonePicker: true,
    defaultToIpTimezone: true,
    confirmationTitleEs: "Consulta de gastos finales — Mejor Vida Seguros",
    confirmationTitleEn: "Final expense consultation — Mejor Vida Insurance",
    reminderHoursBefore: [24, 2],
    bookingPagePublic: true,
  };
}

const CONFIG_KEYS = [
  "hostTimezone",
  "hostName",
  "hostAgencyEs",
  "hostAgencyEn",
  "calendarId",
  "slotMinutes",
  "bufferMinutes",
  "minNoticeHours",
  "horizonDays",
  "maxBookingsPerDay",
  "workHours",
  "blockedDates",
  "requireEmail",
  "requirePhone",
  "allowClientReschedule",
  "showTimezonePicker",
  "defaultToIpTimezone",
  "confirmationTitleEs",
  "confirmationTitleEn",
  "reminderHoursBefore",
  "bookingPagePublic",
];

function sanitizeConfig(patch, base) {
  const out = { ...base };
  if (!patch || typeof patch !== "object") return out;

  const num = (v, min, max, fallback) => {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  };

  if (patch.hostTimezone) out.hostTimezone = String(patch.hostTimezone).trim().slice(0, 64);
  if (patch.hostName) out.hostName = String(patch.hostName).trim().slice(0, 120);
  if (patch.calendarId) out.calendarId = String(patch.calendarId).trim().slice(0, 200);
  if (patch.slotMinutes != null) out.slotMinutes = num(patch.slotMinutes, 15, 120, out.slotMinutes);
  if (patch.bufferMinutes != null) out.bufferMinutes = num(patch.bufferMinutes, 0, 60, out.bufferMinutes);
  if (patch.minNoticeHours != null) out.minNoticeHours = num(patch.minNoticeHours, 0, 168, out.minNoticeHours);
  if (patch.horizonDays != null) out.horizonDays = num(patch.horizonDays, 1, 90, out.horizonDays);
  if (patch.maxBookingsPerDay != null) {
    out.maxBookingsPerDay = num(patch.maxBookingsPerDay, 1, 30, out.maxBookingsPerDay);
  }
  if (patch.workHours && typeof patch.workHours === "object") {
    const wh = { ...out.workHours };
    for (let d = 0; d <= 6; d++) {
      const row = patch.workHours[d] ?? patch.workHours[String(d)];
      if (row === null || row === false) wh[d] = null;
      else if (Array.isArray(row) && row.length >= 2) {
        wh[d] = [num(row[0], 0, 23, 9), num(row[1], 1, 24, 17)];
      }
    }
    out.workHours = wh;
  }
  if (Array.isArray(patch.blockedDates)) {
    out.blockedDates = patch.blockedDates
      .map((d) => String(d).trim().slice(0, 10))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .slice(0, 120);
  }
  ["requireEmail", "requirePhone", "allowClientReschedule", "showTimezonePicker", "defaultToIpTimezone", "bookingPagePublic"].forEach(
    (k) => {
      if (patch[k] != null) out[k] = !!patch[k];
    }
  );
  if (patch.confirmationTitleEs) out.confirmationTitleEs = String(patch.confirmationTitleEs).trim().slice(0, 200);
  if (patch.confirmationTitleEn) out.confirmationTitleEn = String(patch.confirmationTitleEn).trim().slice(0, 200);
  if (Array.isArray(patch.reminderHoursBefore)) {
    out.reminderHoursBefore = patch.reminderHoursBefore
      .map((h) => num(h, 1, 168, 0))
      .filter((h) => h > 0)
      .slice(0, 5);
  }
  return out;
}

module.exports = { defaultSchedulerConfig, sanitizeConfig, CONFIG_KEYS, DEFAULT_WORK_HOURS };
