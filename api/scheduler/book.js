const { bookAppointment } = require("../../lib/scheduler/book");
const { normalizeIana } = require("../../lib/scheduler/timezone");
const { getSchedulerConfig } = require("../../lib/scheduler/config");
const { applyPublicCors, json, readJson } = require("./_http");

module.exports = async function handler(req, res) {
  applyPublicCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json(res, 500, { ok: false, error: "Server not configured" });
  }

  let body;
  try {
    body = readJson(req);
  } catch {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  if (body.website || body.url) {
    return json(res, 400, { ok: false, error: "invalid" });
  }

  const cfg = getSchedulerConfig();
  try {
    const result = await bookAppointment(
      {
        startUtc: body.startUtc,
        endUtc: body.endUtc,
        bookerTimezone: normalizeIana(body.bookerTimezone || body.timezone, cfg.hostTimezone),
        firstName: body.firstName || body.first_name,
        lastName: body.lastName || body.last_name,
        phone: body.phone,
        email: body.email,
        language: body.language || body.lang,
        usState: body.usState || body.us_state || body.state,
      },
      { supabaseUrl, serviceKey }
    );
    if (!result.ok) return json(res, result.status || 400, { ok: false, error: result.error });
    return json(res, 200, {
      ok: true,
      contact_id: result.contact_id,
      call_scheduled_at: result.call_scheduled_at,
      labels: result.labels,
      appointment_id: result.appointment_id,
    });
  } catch (e) {
    console.error("[scheduler/book]", e.message || e);
    return json(res, 500, { ok: false, error: "book_failed" });
  }
};
