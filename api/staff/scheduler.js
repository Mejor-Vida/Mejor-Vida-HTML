/**
 * GET/PATCH /api/staff/scheduler — CRM Scheduler tab (settings + appointments).
 * GET ?view=appointments&from=&to=
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { defaultSchedulerConfig } = require("../../lib/scheduler/defaults");
const { loadSchedulerSettings, saveSchedulerSettings } = require("../../lib/scheduler/settings-store");
const { getSchedulerConfig } = require("../../lib/scheduler/config");
const { dualAppointmentLabel } = require("../../lib/scheduler/timezone");

async function listAppointments(cfg, query) {
  const from = String(query.from || "").trim();
  const to = String(query.to || "").trim();
  const status = String(query.status || "scheduled").trim();
  let q =
    `select=id,contact_id,starts_at,ends_at,booker_timezone,host_timezone,status,first_name,last_name,phone,email,language,google_event_id,created_at` +
    `&order=starts_at.desc&limit=200`;
  if (status && status !== "all") q += `&status=eq.${encodeURIComponent(status)}`;
  if (from) q += `&starts_at=gte.${encodeURIComponent(from)}`;
  if (to) q += `&starts_at=lte.${encodeURIComponent(to)}`;
  const rows = await restSelect(cfg, "scheduler_appointments", q);
  const hostTz = String(process.env.SCHEDULER_HOST_TIMEZONE || "America/Chicago").trim();
  return (rows || []).map((row) => {
    const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
    return {
      id: row.id,
      contact_id: row.contact_id,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      status: row.status,
      name: name || "Client",
      phone: row.phone,
      email: row.email,
      booker_timezone: row.booker_timezone,
      host_label: dualAppointmentLabel(row.starts_at, row.booker_timezone, row.host_timezone || hostTz),
      client_label: dualAppointmentLabel(row.starts_at, row.booker_timezone, row.booker_timezone),
      google_event_id: row.google_event_id,
      created_at: row.created_at,
    };
  });
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Missing Supabase config" });

  const view = String((req.query && req.query.view) || "").trim();

  if (req.method === "GET" && view === "appointments") {
    try {
      const appointments = await listAppointments(cfg, req.query || {});
      return json(res, 200, { appointments });
    } catch (e) {
      console.error("staff/scheduler appointments", e);
      return json(res, 500, { error: "Failed to load appointments" });
    }
  }

  if (req.method === "GET") {
    try {
      const config = await loadSchedulerSettings(cfg.supabaseUrl, cfg.serviceKey, { noCache: true });
      const integration = getSchedulerConfig(config);
      const appointments = await listAppointments(cfg, {
        status: "scheduled",
        from: new Date(Date.now() - 86400000).toISOString(),
      });
      return json(res, 200, {
        config,
        defaults: defaultSchedulerConfig(),
        integration: {
          googleCalendar: integration.googleConfigured,
          calendarAuthUrl: "/api/staff/calendar-auth",
          publicScheduleUrl: "/schedule-julie.html",
        },
        appointments,
      });
    } catch (e) {
      console.error("staff/scheduler GET", e);
      return json(res, 500, { error: "Failed to load scheduler" });
    }
  }

  if (req.method === "PATCH") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const patch = body.config && typeof body.config === "object" ? body.config : body;
    try {
      const saved = await saveSchedulerSettings(
        cfg.supabaseUrl,
        cfg.serviceKey,
        patch,
        auth.user && auth.user.email ? auth.user.email : null
      );
      return json(res, 200, { config: saved });
    } catch (e) {
      console.error("staff/scheduler PATCH", e);
      return json(res, 500, { error: "Failed to save settings" });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return json(res, 405, { error: "Method Not Allowed" });
};
