/**
 * Generate bookable slots in host timezone; subtract Google busy + DB holds.
 */
const { DateTime } = require("luxon");
const { getSchedulerConfig } = require("./config");
const { fetchBusyWindows } = require("./google-calendar");
const { normalizeIana } = require("./timezone");

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function buildHostSlotStarts(hostTz, cfg, now = DateTime.now()) {
  const slots = [];
  const minStart = now.plus({ hours: cfg.minNoticeHours });
  const endDay = now.plus({ days: cfg.horizonDays }).endOf("day");

  const blocked = new Set((cfg.blockedDates || []).map(String));

  for (let d = minStart.startOf("day"); d <= endDay; d = d.plus({ days: 1 })) {
    const local = d.setZone(hostTz);
    const ymd = local.toFormat("yyyy-MM-dd");
    if (blocked.has(ymd)) continue;
    const luxDow = local.weekday === 7 ? 0 : local.weekday;
    const hours = cfg.workHours[luxDow];
    if (!hours) continue;
    const [startH, endH] = hours;
    let cursor = local.set({ hour: startH, minute: 0, second: 0, millisecond: 0 });
    const dayEnd = local.set({ hour: endH, minute: 0, second: 0, millisecond: 0 });
    while (cursor < dayEnd) {
      const slotEnd = cursor.plus({ minutes: cfg.slotMinutes });
      if (slotEnd > dayEnd) break;
      const utc = cursor.toUTC();
      if (utc >= minStart.toUTC()) {
        slots.push({
          startUtc: utc.toISO(),
          endUtc: slotEnd.toUTC().toISO(),
          startHostLocal: cursor.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
          endHostLocal: slotEnd.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
        });
      }
      cursor = slotEnd.plus({ minutes: cfg.bufferMinutes });
    }
  }
  return slots;
}

function filterBusy(slots, busyRanges) {
  if (!busyRanges.length) return slots;
  return slots.filter((slot) => {
    const s = Date.parse(slot.startUtc);
    const e = Date.parse(slot.endUtc);
    for (const b of busyRanges) {
      const bs = Date.parse(b.start);
      const be = Date.parse(b.end);
      if (overlaps(s, e, bs, be)) return false;
    }
    return true;
  });
}

async function listAvailableSlots({ bookerTimezone, fromYmd, toYmd, dbBusyRanges = [], schedConfig }) {
  const cfg = getSchedulerConfig(schedConfig);
  const hostTz = normalizeIana(cfg.hostTimezone);
  const bookerTz = normalizeIana(bookerTimezone, hostTz);

  const now = DateTime.now().setZone(hostTz);
  let rangeStart = fromYmd
    ? DateTime.fromISO(fromYmd, { zone: hostTz }).startOf("day")
    : now.startOf("day");
  let rangeEnd = toYmd
    ? DateTime.fromISO(toYmd, { zone: hostTz }).endOf("day")
    : now.plus({ days: Math.min(7, cfg.horizonDays) }).endOf("day");

  const allSlots = buildHostSlotStarts(hostTz, cfg, now);
  const inRange = allSlots.filter((slot) => {
    const t = DateTime.fromISO(slot.startUtc, { zone: "utc" });
    return t >= rangeStart.toUTC() && t <= rangeEnd.toUTC();
  });

  const timeMin = rangeStart.toUTC().toISO();
  const timeMax = rangeEnd.toUTC().toISO();
  const busyRes = await fetchBusyWindows(timeMin, timeMax);
  const googleBusy = busyRes.ok ? busyRes.busy : [];
  const mergedBusy = [
    ...googleBusy.map((b) => ({ start: b.start, end: b.end })),
    ...dbBusyRanges,
  ];

  const open = filterBusy(inRange, mergedBusy);

  return {
    hostTimezone: hostTz,
    bookerTimezone: bookerTz,
    slotMinutes: cfg.slotMinutes,
    slots: open.map((slot) => {
      const startUtc = slot.startUtc;
      const startBooker = DateTime.fromISO(startUtc, { zone: "utc" }).setZone(bookerTz);
      const startHost = DateTime.fromISO(startUtc, { zone: "utc" }).setZone(hostTz);
      return {
        startUtc,
        endUtc: slot.endUtc,
        labelBooker: startBooker.toFormat("ccc, MMM d · h:mm a"),
        labelHost: startHost.toFormat("ccc, MMM d · h:mm a"),
        ymdBooker: startBooker.toFormat("yyyy-MM-dd"),
      };
    }),
    googleBusyOk: busyRes.ok,
  };
}

module.exports = { listAvailableSlots, buildHostSlotStarts, filterBusy };
