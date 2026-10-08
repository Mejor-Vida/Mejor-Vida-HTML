const { getSchedulerConfig } = require("../../lib/scheduler/config");
const { loadSchedulerSettings } = require("../../lib/scheduler/settings-store");
const { US_TIMEZONE_OPTIONS, detectTimezoneFromRequest, normalizeIana } = require("../../lib/scheduler/timezone");
const { applyPublicCors, json } = require("./_http");

module.exports = async function handler(req, res) {
  applyPublicCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let sched = null;
  if (supabaseUrl && serviceKey) {
    try {
      sched = await loadSchedulerSettings(supabaseUrl, serviceKey);
    } catch (e) {
      console.error("[scheduler/config] settings", e.message || e);
    }
  }
  const cfg = getSchedulerConfig(sched);
  if (cfg.bookingPagePublic === false) {
    return json(res, 503, { ok: false, error: "scheduler_paused" });
  }
  const detected = cfg.defaultToIpTimezone ? detectTimezoneFromRequest(req) : null;
  const browserTz = String((req.query && req.query.tz) || "").trim();
  const suggested = normalizeIana(browserTz || detected || "America/Chicago", cfg.hostTimezone);

  return json(res, 200, {
    ok: true,
    hostTimezone: cfg.hostTimezone,
    slotMinutes: cfg.slotMinutes,
    horizonDays: cfg.horizonDays,
    suggestedBookerTimezone: suggested,
    detectedFromIp: detected,
    timezoneOptions: US_TIMEZONE_OPTIONS,
    googleCalendar: cfg.googleConfigured,
  });
};
