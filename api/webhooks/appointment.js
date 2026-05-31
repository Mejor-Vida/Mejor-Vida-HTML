/**
 * POST /api/webhooks/appointment
 *
 * HubSpot scheduler / Make.com appointment booking webhook.
 * Normalizes payload, dedups, upserts contacts + lead_state, logs webhook.
 *
 * Auth:
 *   - Server (Make.com): X-App-Secret or Authorization: Bearer <MANYCHAT_WEBHOOK_SECRET>
 *   - Browser (confirmacion.html): same-origin Origin/Referer on mejorvidainsurance.com
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET,
 *      HUBSPOT_ACCESS_TOKEN (optional enrich), MAKE_APPOINTMENT_WEBHOOK_URL (optional forward)
 */

const {
  normalizeInputRecord,
  processAppointmentWebhook,
} = require("../../lib/appointment-webhook-lib");
const { logWebhook } = require("../../lib/contacts-db");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function getHeader(req, name) {
  const h = req.headers || {};
  const lower = name.toLowerCase();
  if (h[lower] !== undefined) return String(h[lower]);
  const keys = Object.keys(h);
  const found = keys.find((k) => k.toLowerCase() === lower);
  return found ? String(h[found]) : "";
}

function isSameOriginBrowserRequest(req) {
  const origin = getHeader(req, "origin") || getHeader(req, "referer");
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "mejorvidainsurance.com" || host === "www.mejorvidainsurance.com";
  } catch {
    return /mejorvidainsurance\.com/i.test(origin);
  }
}

function verifyAppointmentAuth(req) {
  const secret = process.env.MANYCHAT_WEBHOOK_SECRET;
  const appSecret = getHeader(req, "x-app-secret");
  const auth = getHeader(req, "authorization");
  const bearer = auth.match(/^Bearer\s+(.+)$/i) ? auth.replace(/^Bearer\s+/i, "").trim() : "";
  if (secret && (appSecret === secret || bearer === secret)) {
    return { ok: true, authType: "secret" };
  }
  if (isSameOriginBrowserRequest(req)) {
    return { ok: true, authType: "browser" };
  }
  if (!secret) {
    return { ok: true, authType: "open" };
  }
  return { ok: false, status: 401, error: "Unauthorized" };
}

function applyCors(req, res) {
  const origin = getHeader(req, "origin").trim();
  if (!origin) return;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (host === "mejorvidainsurance.com" || host === "www.mejorvidainsurance.com") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-App-Secret, Authorization");
    }
  } catch {
    /* ignore */
  }
}

async function forwardToMake(payload) {
  const url = String(process.env.MAKE_APPOINTMENT_WEBHOOK_URL || "").trim();
  if (!url) return null;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    console.error("[webhooks/appointment] Make forward", e.message || e);
    return { ok: false, error: e.message || "forward_failed" };
  }
}

module.exports = async function handler(req, res) {
  applyCors(req, res);

  const method = (req.method || "GET").toUpperCase();
  if (method === "OPTIONS") {
    return res.status(204).end();
  }
  if (method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const auth = verifyAppointmentAuth(req);
  if (!auth.ok) {
    return json(res, auth.status, { ok: false, error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json(res, 500, { ok: false, error: "Supabase not configured" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  const normalizedInput = normalizeInputRecord(body);
  await logWebhook(supabaseUrl, serviceKey, "appointment", "/api/webhooks/appointment", normalizedInput, "received");

  try {
    const result = await processAppointmentWebhook(normalizedInput, {
      supabaseUrl,
      serviceKey,
      hubspotToken: process.env.HUBSPOT_ACCESS_TOKEN,
      channel: auth.authType === "browser" ? "confirmacion_page" : "hubspot_scheduler",
    });

    if (!result.ok) {
      await logWebhook(supabaseUrl, serviceKey, "appointment", "/api/webhooks/appointment", {
        input: normalizedInput,
        error: result.error,
      }, "error");
      return json(res, 400, { ok: false, error: result.error, lead: result.lead || null });
    }

    const makeForward =
      auth.authType === "secret" ? null : await forwardToMake(normalizedInput);

    await logWebhook(supabaseUrl, serviceKey, "appointment", "/api/webhooks/appointment", {
      contact_id: result.contactId,
      deduped: result.deduped,
      reason: result.reason || null,
      call_scheduled_at: result.call_scheduled_at,
      pipeline_stage: result.pipeline_stage,
      notified: result.notifyResult ? result.notifyResult.sent === true : false,
      notify_skipped: result.notifyResult ? result.notifyResult.skipped === true : false,
      notify_reason: result.notifyResult ? result.notifyResult.reason || null : null,
    }, "processed");

    return json(res, 200, {
      ok: true,
      deduped: result.deduped === true,
      reason: result.reason || null,
      contact_id: result.contactId,
      created: result.created === true,
      call_scheduled_at: result.call_scheduled_at || null,
      pipeline_stage: result.pipeline_stage || null,
      notified: result.notifyResult ? result.notifyResult.sent === true : false,
      notify_skipped: result.notifyResult ? result.notifyResult.skipped === true : false,
      make_forward: makeForward,
    });
  } catch (e) {
    console.error("[webhooks/appointment]", e.message || e);
    await logWebhook(supabaseUrl, serviceKey, "appointment", "/api/webhooks/appointment", {
      input: normalizedInput,
      error: e.message || String(e),
    }, "error");
    return json(res, 500, { ok: false, error: "processing_failed" });
  }
};
