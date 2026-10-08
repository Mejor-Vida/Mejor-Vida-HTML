const { listAvailableSlots } = require("../../lib/scheduler/slots");
const { normalizeIana } = require("../../lib/scheduler/timezone");
const { getSchedulerConfig } = require("../../lib/scheduler/config");
const { loadSchedulerSettings } = require("../../lib/scheduler/settings-store");
const { applyPublicCors, json } = require("./_http");

module.exports = async function handler(req, res) {
  applyPublicCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const q = req.query || {};
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let sched = null;
  if (supabaseUrl && serviceKey) {
    try {
      sched = await loadSchedulerSettings(supabaseUrl, serviceKey);
    } catch (e) {
      console.error("[scheduler/slots] settings", e.message || e);
    }
  }
  const cfg = getSchedulerConfig(sched);
  if (cfg.bookingPagePublic === false) {
    return json(res, 503, { ok: false, error: "scheduler_paused" });
  }
  const bookerTz = normalizeIana(q.timezone || q.tz, cfg.hostTimezone);
  const fromYmd = String(q.from || "").trim().slice(0, 10);
  const toYmd = String(q.to || "").trim().slice(0, 10);

  let dbBusyRanges = [];
  if (supabaseUrl && serviceKey) {
    try {
      const base = supabaseUrl.replace(/\/$/, "") + "/rest/v1";
      const now = new Date();
      const max = new Date(now.getTime() + cfg.horizonDays * 86400000).toISOString();
      const q =
        `scheduler_appointments?select=starts_at,ends_at&status=eq.scheduled` +
        `&starts_at=gte.${encodeURIComponent(now.toISOString())}` +
        `&starts_at=lte.${encodeURIComponent(max)}`;
      const r = await fetch(`${base}/${q}`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      });
      const rows = await r.json();
      if (Array.isArray(rows)) {
        dbBusyRanges = rows.map((row) => ({ start: row.starts_at, end: row.ends_at }));
      }
    } catch (e) {
      console.error("[scheduler/slots] db busy", e.message || e);
    }
  }

  try {
    const result = await listAvailableSlots({
      bookerTimezone: bookerTz,
      fromYmd: fromYmd || undefined,
      toYmd: toYmd || undefined,
      dbBusyRanges,
      schedConfig: sched,
    });
    return json(res, 200, { ok: true, ...result });
  } catch (e) {
    console.error("[scheduler/slots]", e.message || e);
    return json(res, 500, { ok: false, error: "slots_failed" });
  }
};
