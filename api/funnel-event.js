/**
 * POST /api/funnel-event
 * First-party funnel diagnostics (session steps + acquisition context).
 *
 * Body: { session_id, source, campaign, ad_set, ad_name, keyword, search_term,
 *         tool, step_name, event_type, page_or_step, device, event_data }
 */
const { verifySiteOrigin } = require("../lib/site-origin");

const VALID_SOURCES = new Set(["facebook", "google", "organic", "direct"]);
const VALID_TOOLS = new Set(["quote", "calculator", "schedule", "bio", "whatsapp"]);
const VALID_EVENT_TYPES = new Set(["click", "step_view", "step_complete", "conversion"]);
const VALID_DEVICES = new Set(["mobile", "tablet", "desktop"]);

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

async function supabaseInsert(supabaseUrl, serviceKey, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/funnel_events`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`funnel_events insert ${r.status}: ${t.slice(0, 400)}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const gate = verifySiteOrigin(req);
  if (!gate.ok) {
    return json(res, gate.status || 403, { ok: false, error: gate.error || "Forbidden" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, {
      ok: false,
      error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  if (body.website || body.company_website) {
    return json(res, 200, { ok: true });
  }

  const sessionId = String(body.session_id || body.sessionId || "").trim().slice(0, 128);
  const source = String(body.source || "").trim().toLowerCase();
  const tool = String(body.tool || "").trim().toLowerCase();
  const stepName = String(body.step_name || body.stepName || "").trim().slice(0, 120);
  const eventType = String(body.event_type || body.eventType || "").trim().toLowerCase();

  if (!sessionId) return json(res, 400, { ok: false, error: "session_id required" });
  if (!VALID_SOURCES.has(source)) return json(res, 400, { ok: false, error: "Invalid source" });
  if (!VALID_TOOLS.has(tool)) return json(res, 400, { ok: false, error: "Invalid tool" });
  if (!stepName) return json(res, 400, { ok: false, error: "step_name required" });
  if (!VALID_EVENT_TYPES.has(eventType)) {
    return json(res, 400, { ok: false, error: "Invalid event_type" });
  }

  const deviceRaw = String(body.device || "").trim().toLowerCase();
  const device = VALID_DEVICES.has(deviceRaw) ? deviceRaw : null;

  const row = {
    session_id: sessionId,
    source,
    campaign: body.campaign ? String(body.campaign).slice(0, 500) : null,
    ad_set: body.ad_set || body.adSet ? String(body.ad_set || body.adSet).slice(0, 500) : null,
    ad_name: body.ad_name || body.adName ? String(body.ad_name || body.adName).slice(0, 500) : null,
    keyword: body.keyword ? String(body.keyword).slice(0, 500) : null,
    search_term: body.search_term || body.searchTerm ? String(body.search_term || body.searchTerm).slice(0, 500) : null,
    tool,
    step_name: stepName,
    event_type: eventType,
    page_or_step: body.page_or_step || body.pageOrStep ? String(body.page_or_step || body.pageOrStep).slice(0, 500) : null,
    device,
    event_data:
      body.event_data && typeof body.event_data === "object" && !Array.isArray(body.event_data)
        ? body.event_data
        : {},
  };

  try {
    await supabaseInsert(supabaseUrl, supabaseKey, row);
  } catch (e) {
    console.error("[funnel-event]", e.message || e);
    return json(res, 500, { ok: false, error: "Could not log funnel event" });
  }

  return json(res, 200, { ok: true });
};
