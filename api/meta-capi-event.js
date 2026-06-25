/**
 * POST /api/meta-capi-event
 * Server-side Meta CAPI for Spanish FE landing PageView / ViewContent.
 *
 * Body: { eventName, eventId, originDetail, sessionClientId, metaFbp, metaFbc, clientUserAgent }
 * Env: META_CAPI_ACCESS_TOKEN, optional META_CAPI_TEST_EVENT_CODE
 */
const {
  LANDING_EVENT_NAMES,
  sendMetaCapiWebsiteEvent,
} = require("../lib/meta-capi");

function applyCors(req, res) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function buildOriginDetail(body) {
  if (body.originDetail && typeof body.originDetail === "object" && !Array.isArray(body.originDetail)) {
    return body.originDetail;
  }
  const o = {};
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
  ];
  for (const k of keys) {
    const v = body[k];
    if (v != null && String(v).trim()) o[k] = String(v).trim().slice(0, 500);
  }
  if (body.page_path != null && String(body.page_path).trim()) {
    o.page_path = String(body.page_path).trim().slice(0, 2000);
  }
  return o;
}

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  const eventName = String(body.eventName || "").trim();
  if (!LANDING_EVENT_NAMES.has(eventName)) {
    return json(res, 400, {
      ok: false,
      error: "eventName must be PageView or ViewContent",
    });
  }

  const eventId = String(body.eventId || "").trim().slice(0, 128);
  if (!eventId) {
    return json(res, 400, { ok: false, error: "eventId required for deduplication" });
  }

  const originDetail = buildOriginDetail(body);
  const customData =
    eventName === "ViewContent"
      ? {
          content_type: "product",
          content_name: String(body.contentName || "final_expense_quote").slice(0, 200),
          content_category: "insurance",
        }
      : undefined;

  const result = await sendMetaCapiWebsiteEvent({
    eventName,
    eventId,
    originDetail,
    req,
    body,
    customData,
  });

  if (result.skipped) {
    return json(res, 200, { ok: true, skipped: true, reason: result.reason });
  }
  if (!result.ok) {
    return json(res, 502, { ok: false, error: "Meta CAPI request failed" });
  }

  return json(res, 200, { ok: true, eventName, eventId });
};
