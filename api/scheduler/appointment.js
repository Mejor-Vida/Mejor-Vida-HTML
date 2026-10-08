/**
 * GET /api/scheduler/appointment?id=&token= — public manage page data (no PII beyond name/time).
 */
const { applyPublicCors, json } = require("./_http");
const { fetchAppointment, tokenMatches } = require("../../lib/scheduler/cancel-appointment");
const { dualAppointmentLabel } = require("../../lib/scheduler/timezone");

module.exports = async function handler(req, res) {
  applyPublicCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json(res, 500, { ok: false, error: "Server not configured" });
  }

  const id = String((req.query && req.query.id) || "").trim();
  const token = String((req.query && req.query.token) || "").trim();
  if (!id || !token) return json(res, 400, { ok: false, error: "id and token required" });

  const row = await fetchAppointment({ supabaseUrl, serviceKey }, id);
  if (!row || !tokenMatches(row, token)) {
    return json(res, 403, { ok: false, error: "invalid_link" });
  }

  return json(res, 200, {
    ok: true,
    appointment: {
      id: row.id,
      status: row.status,
      starts_at: row.starts_at,
      booker_label: dualAppointmentLabel(row.starts_at, row.booker_timezone, row.booker_timezone),
      host_label: dualAppointmentLabel(
        row.starts_at,
        row.booker_timezone,
        row.host_timezone || "America/Chicago"
      ),
      first_name: row.first_name,
    },
  });
};
