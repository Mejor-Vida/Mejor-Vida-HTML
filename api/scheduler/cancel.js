const { cancelAppointment } = require("../../lib/scheduler/cancel-appointment");
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

  const appointmentId = body.appointmentId || body.appointment_id || body.id;
  const cancelToken = body.token || body.cancelToken || body.cancel_token;
  if (!appointmentId || !cancelToken) {
    return json(res, 400, { ok: false, error: "appointmentId and token required" });
  }

  try {
    const result = await cancelAppointment(
      { supabaseUrl, serviceKey },
      { appointmentId, cancelToken, actor: "client" }
    );
    if (!result.ok) return json(res, result.status || 400, { ok: false, error: result.error });
    return json(res, 200, { ok: true, cancelled: true });
  } catch (e) {
    console.error("[scheduler/cancel]", e.message || e);
    return json(res, 500, { ok: false, error: "cancel_failed" });
  }
};
