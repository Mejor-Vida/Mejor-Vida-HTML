/**
 * Multi-state telemarketing compliance for automated SMS (Telnyx).
 * States: NE, KS, CO, NV — timezone from phone area code when split.
 *
 * Curfews (local):
 *   All states: no automated marketing SMS on Sundays (queue to Monday 9 AM local).
 *   NE: 8:00–20:00; NE state/federal holidays for automated: 13:00–20:00
 *   KS/CO/NV: 8:00–21:00 (Sat + weekdays within curfew; holidays per blanket toggle)
 *
 * Env / settings:
 *   block_federal_holidays — pause all automated SMS on FEDERAL_HOLIDAYS
 */

const LICENSED_STATES = new Set(["NE", "KS", "CO", "NV"]);

/** Preferred resume hour after overnight / holiday block (local). */
const PREFERRED_RESUME_HOUR = 9;

/**
 * NPA → IANA timezone for split states.
 * Ambiguous western NPAs prefer Mountain (stricter morning gate).
 */
const AREA_CODE_TIMEZONES = {
  // Nebraska
  402: "America/Chicago",
  531: "America/Chicago",
  308: "America/Denver",
  // Kansas (western 785 treated as Mountain for compliance safety)
  913: "America/Chicago",
  316: "America/Chicago",
  620: "America/Chicago",
  785: "America/Denver",
};

const STATE_DEFAULT_TZ = {
  NE: "America/Chicago",
  KS: "America/Chicago",
  CO: "America/Denver",
  NV: "America/Los_Angeles",
};

/** Weekday curfew [startHourInclusive, endHourExclusive) in local time. */
const STATE_CURFEWS = {
  NE: { startHour: 8, endHour: 20 },
  KS: { startHour: 8, endHour: 21 },
  CO: { startHour: 8, endHour: 21 },
  NV: { startHour: 8, endHour: 21 },
};

/** NE automated-only compressed window on NE holidays (Sundays are fully blocked). */
const NE_AUTOMATED_RESTRICTED = { startHour: 13, endHour: 20 };

/**
 * Fixed-date federal holidays (month 1-12, day). Observed dates for weekends
 * should be expanded yearly — see expandFederalHolidaysForYear.
 */
const FEDERAL_HOLIDAY_RULES = [
  { id: "new_years", name: "New Year's Day", month: 1, day: 1 },
  { id: "juneteenth", name: "Juneteenth", month: 6, day: 19 },
  { id: "independence", name: "Independence Day", month: 7, day: 4 },
  { id: "christmas", name: "Christmas Day", month: 12, day: 25 },
  { id: "veterans", name: "Veterans Day", month: 11, day: 11 },
];

/** Floating federal holidays computed per year. */
function nthWeekdayOfMonth(year, month, weekday, n) {
  // month 1-12, weekday 0=Sun..6=Sat, n=1..5 (5 = last)
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstWd = first.getUTCDay();
  let day = 1 + ((weekday - firstWd + 7) % 7);
  if (n === 5) {
    while (day + 7 <= daysInMonth(year, month)) day += 7;
  } else {
    day += (n - 1) * 7;
  }
  return { month, day };
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function lastWeekdayOfMonth(year, month, weekday) {
  return nthWeekdayOfMonth(year, month, weekday, 5);
}

function observedFixedHoliday(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  const wd = d.getUTCDay();
  if (wd === 0) return { month, day: day + 1 }; // Sunday → Monday
  if (wd === 6) {
    // Saturday → Friday
    if (day === 1) {
      return { month: month === 1 ? 12 : month - 1, day: month === 1 ? 31 : daysInMonth(year, month - 1) };
    }
    return { month, day: day - 1 };
  }
  return { month, day };
}

function expandFederalHolidaysForYear(year) {
  const out = [];
  FEDERAL_HOLIDAY_RULES.forEach((rule) => {
    const obs = observedFixedHoliday(year, rule.month, rule.day);
    out.push({
      id: rule.id,
      name: rule.name,
      year,
      month: obs.month,
      day: obs.day,
      ymd: `${year}-${pad2(obs.month)}-${pad2(obs.day)}`,
    });
  });
  // MLK — 3rd Monday January
  const mlk = nthWeekdayOfMonth(year, 1, 1, 3);
  out.push({ id: "mlk", name: "Martin Luther King Jr. Day", year, ...mlk, ymd: ymdKey(year, mlk.month, mlk.day) });
  // Presidents — 3rd Monday February
  const presidents = nthWeekdayOfMonth(year, 2, 1, 3);
  out.push({
    id: "presidents",
    name: "Presidents' Day",
    year,
    ...presidents,
    ymd: ymdKey(year, presidents.month, presidents.day),
  });
  // Memorial — last Monday May
  const memorial = lastWeekdayOfMonth(year, 5, 1);
  out.push({
    id: "memorial",
    name: "Memorial Day",
    year,
    ...memorial,
    ymd: ymdKey(year, memorial.month, memorial.day),
  });
  // Labor — 1st Monday September
  const labor = nthWeekdayOfMonth(year, 9, 1, 1);
  out.push({ id: "labor", name: "Labor Day", year, ...labor, ymd: ymdKey(year, labor.month, labor.day) });
  // Columbus / Indigenous — 2nd Monday October
  const columbus = nthWeekdayOfMonth(year, 10, 1, 2);
  out.push({
    id: "columbus",
    name: "Columbus Day",
    year,
    ...columbus,
    ymd: ymdKey(year, columbus.month, columbus.day),
  });
  // Thanksgiving — 4th Thursday November
  const thanks = nthWeekdayOfMonth(year, 11, 4, 4);
  out.push({
    id: "thanksgiving",
    name: "Thanksgiving Day",
    year,
    ...thanks,
    ymd: ymdKey(year, thanks.month, thanks.day),
  });
  return out;
}

/** Nebraska Arbor Day — last Friday in April (state holiday). */
function nebraskaArborDay(year) {
  const d = lastWeekdayOfMonth(year, 4, 5);
  return { id: "ne_arbor_day", name: "Nebraska Arbor Day", year, ...d, ymd: ymdKey(year, d.month, d.day) };
}

function pad2(n) {
  return n < 10 ? `0${n}` : String(n);
}

function ymdKey(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function normalizeStateCode(raw) {
  const s = String(raw || "")
    .trim()
    .toUpperCase();
  if (LICENSED_STATES.has(s)) return s;
  const map = {
    NEBRASKA: "NE",
    KANSAS: "KS",
    COLORADO: "CO",
    NEVADA: "NV",
  };
  return map[s] || "";
}

function extractAreaCode(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1, 4);
  if (digits.length === 10) return digits.slice(0, 3);
  if (digits.length > 10) return digits.slice(-10, -7);
  return "";
}

function resolveLeadTimezone(stateCode, phone) {
  const state = normalizeStateCode(stateCode) || "NE";
  const npa = extractAreaCode(phone);
  if ((state === "NE" || state === "KS") && npa && AREA_CODE_TIMEZONES[npa]) {
    return AREA_CODE_TIMEZONES[npa];
  }
  return STATE_DEFAULT_TZ[state] || "America/Chicago";
}

function localPartsInTz(date, timeZone) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0;
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour,
    minute: Number(get("minute")),
    weekday: weekdayMap[get("weekday")] ?? 0,
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function federalHolidaySetForYears(years) {
  const set = new Set();
  years.forEach((y) => {
    expandFederalHolidaysForYear(y).forEach((h) => set.add(h.ymd));
  });
  return set;
}

function isFederalHolidayYmd(ymd) {
  const year = Number(String(ymd || "").slice(0, 4));
  if (!Number.isFinite(year)) return false;
  return federalHolidaySetForYears([year - 1, year, year + 1]).has(ymd);
}

function isNebraskaHolidayYmd(ymd) {
  if (isFederalHolidayYmd(ymd)) return true;
  const year = Number(String(ymd || "").slice(0, 4));
  if (!Number.isFinite(year)) return false;
  const arbor = nebraskaArborDay(year);
  return arbor.ymd === ymd;
}

function getAutomatedWindow(stateCode, local) {
  const state = normalizeStateCode(stateCode) || "NE";
  const base = STATE_CURFEWS[state] || STATE_CURFEWS.NE;
  // Sundays are fully blocked elsewhere — no send window.
  if (local.weekday === 0) {
    return { startHour: 0, endHour: 0, restrictedDay: true, sundayBlock: true };
  }
  if (state === "NE" && isNebraskaHolidayYmd(local.ymd)) {
    return { ...NE_AUTOMATED_RESTRICTED, restrictedDay: true };
  }
  return { ...base, restrictedDay: false };
}

/**
 * Convert local wall time on ymd in timeZone to UTC ISO.
 */
function localWallTimeToUtcIso(ymd, hour, minute, timeZone) {
  const [y, m, d] = String(ymd).split("-").map(Number);
  const hh = Number(hour) || 0;
  const mm = Number(minute) || 0;
  const start = Date.UTC(y, m - 1, d - 1, 0, 0, 0);
  const end = Date.UTC(y, m - 1, d + 2, 0, 0, 0);
  for (let t = start; t <= end; t += 60 * 1000) {
    const cand = new Date(t);
    const parts = localPartsInTz(cand, timeZone);
    if (parts.ymd === ymd && parts.hour === hh && parts.minute === mm) {
      return cand.toISOString();
    }
  }
  // Fallback approximate (CST offset)
  return new Date(Date.UTC(y, m - 1, d, hh + 6, mm, 0)).toISOString();
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

function weekdayForYmd(ymd, timeZone) {
  return localPartsInTz(new Date(localWallTimeToUtcIso(ymd, 12, 0, timeZone)), timeZone).weekday;
}

function complianceSettings(settings) {
  const s = settings && typeof settings === "object" ? settings : {};
  const compliance = s.compliance && typeof s.compliance === "object" ? s.compliance : {};
  return {
    block_federal_holidays:
      compliance.block_federal_holidays === true ||
      process.env.SMS_BLOCK_FEDERAL_HOLIDAYS === "true",
    preferred_resume_hour:
      Number(compliance.preferred_resume_hour) > 0
        ? Number(compliance.preferred_resume_hour)
        : PREFERRED_RESUME_HOUR,
  };
}

/**
 * @returns {{
 *   allowed: boolean,
 *   reason: string|null,
 *   sendAfter: string|null,
 *   timezone: string,
 *   state: string,
 *   local: object,
 *   window: { startHour: number, endHour: number, restrictedDay: boolean }
 * }}
 */
function evaluateAutomatedSmsCompliance({
  stateCode,
  phone,
  now = new Date(),
  settings = {},
}) {
  const state = normalizeStateCode(stateCode) || "NE";
  const timezone = resolveLeadTimezone(state, phone);
  const local = localPartsInTz(now, timezone);
  const cfg = complianceSettings(settings);
  const window = getAutomatedWindow(state, local);

  // Company policy: no automated marketing SMS on Sundays (all states).
  if (local.weekday === 0) {
    return {
      allowed: false,
      reason: "sunday_block",
      sendAfter: nextAllowedSendAt({ stateCode: state, phone, from: now, settings }),
      timezone,
      state,
      local,
      window,
    };
  }

  if (cfg.block_federal_holidays && isFederalHolidayYmd(local.ymd)) {
    return {
      allowed: false,
      reason: "federal_holiday_block",
      sendAfter: nextAllowedSendAt({ stateCode: state, phone, from: now, settings }),
      timezone,
      state,
      local,
      window,
    };
  }

  const minutes = local.hour * 60 + local.minute;
  const startM = window.startHour * 60;
  const endM = window.endHour * 60;
  if (minutes >= startM && minutes < endM) {
    return {
      allowed: true,
      reason: null,
      sendAfter: null,
      timezone,
      state,
      local,
      window,
    };
  }

  return {
    allowed: false,
    reason: minutes < startM ? "before_curfew" : "after_curfew",
    sendAfter: nextAllowedSendAt({ stateCode: state, phone, from: now, settings }),
    timezone,
    state,
    local,
    window,
  };
}

/**
 * Next legal automated SMS instant (UTC ISO). Prefer 9:00 AM local when
 * the day's window allows it; skips Sundays and (when enabled) federal holidays.
 * NE holiday days use 1:00 PM start.
 */
function nextAllowedSendAt({ stateCode, phone, from = new Date(), settings = {} }) {
  const state = normalizeStateCode(stateCode) || "NE";
  const timezone = resolveLeadTimezone(state, phone);
  const cfg = complianceSettings(settings);
  const fromLocal = localPartsInTz(from, timezone);

  for (let dayOffset = 0; dayOffset < 21; dayOffset++) {
    const ymd = addDaysYmd(fromLocal.ymd, dayOffset);
    const weekday = weekdayForYmd(ymd, timezone);
    if (weekday === 0) continue; // no automated marketing SMS on Sundays
    if (cfg.block_federal_holidays && isFederalHolidayYmd(ymd)) continue;

    const window = getAutomatedWindow(state, { ymd, weekday });
    if (window.sundayBlock || window.endHour <= window.startHour) continue;

    const sendHour = window.restrictedDay
      ? window.startHour
      : Math.max(window.startHour, cfg.preferred_resume_hour);

    if (dayOffset === 0) {
      const nowM = fromLocal.hour * 60 + fromLocal.minute;
      const startM = window.startHour * 60;
      const endM = window.endHour * 60;
      if (nowM >= endM) continue;
      if (nowM < startM) {
        const candidate = new Date(localWallTimeToUtcIso(ymd, sendHour, 0, timezone));
        if (candidate > from) return candidate.toISOString();
      }
      // Inside window — caller should send now; tiny delay for queue processors
      return new Date(from.getTime() + 60 * 1000).toISOString();
    }

    const candidate = new Date(localWallTimeToUtcIso(ymd, sendHour, 0, timezone));
    if (candidate > from) return candidate.toISOString();
  }

  return new Date(from.getTime() + 12 * 3600000).toISOString();
}

module.exports = {
  LICENSED_STATES,
  AREA_CODE_TIMEZONES,
  STATE_DEFAULT_TZ,
  STATE_CURFEWS,
  NE_AUTOMATED_RESTRICTED,
  PREFERRED_RESUME_HOUR,
  normalizeStateCode,
  extractAreaCode,
  resolveLeadTimezone,
  localPartsInTz,
  expandFederalHolidaysForYear,
  nebraskaArborDay,
  isFederalHolidayYmd,
  isNebraskaHolidayYmd,
  getAutomatedWindow,
  localWallTimeToUtcIso,
  complianceSettings,
  evaluateAutomatedSmsCompliance,
  nextAllowedSendAt,
  FEDERAL_HOLIDAY_RULES,
};
