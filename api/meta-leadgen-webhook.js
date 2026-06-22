/**
 * GET|POST /api/meta-leadgen-webhook
 *
 * Meta Lead Ads (Instant Forms) webhook — no Make.com.
 * GET: hub.verify_token challenge (Meta app subscription setup)
 * POST: leadgen notification → fetch lead via Graph API → Supabase + IC CSV email + HubSpot
 *
 * Vercel: exports GET/POST use request.text() for raw-body HMAC (bodyParser config is ignored
 * on non-Next serverless). Local dev uses module.exports + req.rawBody from local-api-dev.cjs.
 */

const { logWebhook } = require("../lib/contacts-db");
const {
  verifyHubSignature,
  parseWebhookEntries,
  processLeadgenEvent,
} = require("../lib/meta-leadgen");

function parseJsonBody(rawBuf) {
  const text = rawBuf.toString("utf8");
  if (!text.trim()) return {};
  return JSON.parse(text);
}

function verifySubscription(query) {
  const mode = String(query["hub.mode"] || "").trim();
  const token = String(query["hub.verify_token"] || "").trim();
  const challenge = query["hub.challenge"];
  const expected = String(process.env.META_LEADGEN_VERIFY_TOKEN || "").trim();
  if (mode !== "subscribe") return { ok: false, status: 403, error: "Invalid hub.mode" };
  if (!expected || token !== expected) {
    return { ok: false, status: 403, error: "Verify token mismatch" };
  }
  if (challenge == null || String(challenge) === "") {
    return { ok: false, status: 400, error: "Missing hub.challenge" };
  }
  return { ok: true, status: 200, challenge: String(challenge) };
}

function queryFromRequestUrl(url) {
  const q = {};
  new URL(url).searchParams.forEach((value, key) => {
    q[key] = value;
  });
  return q;
}

async function handlePost(rawBuf, signatureHeader) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return { status: 500, json: { ok: false, error: "Supabase not configured" } };
  }

  const skipSig = String(process.env.META_LEADGEN_SKIP_SIGNATURE || "").trim() === "1";
  const appSecret = String(process.env.FACEBOOK_APP_SECRET || "").trim();
  if (!skipSig) {
    if (!appSecret) {
      return { status: 500, json: { ok: false, error: "FACEBOOK_APP_SECRET not configured" } };
    }
    const sigCheck = verifyHubSignature(rawBuf, signatureHeader, appSecret);
    if (!sigCheck.ok) {
      console.warn("[meta-leadgen-webhook] signature failed:", sigCheck.reason);
      await logWebhook(
        supabaseUrl,
        serviceKey,
        "meta_leadgen",
        "/api/meta-leadgen-webhook",
        { error: sigCheck.reason },
        "error"
      );
      return { status: 403, json: { ok: false, error: "Invalid signature" } };
    }
  }

  let body;
  try {
    body = parseJsonBody(rawBuf);
  } catch {
    return { status: 400, json: { ok: false, error: "Invalid JSON" } };
  }

  await logWebhook(supabaseUrl, serviceKey, "meta_leadgen", "/api/meta-leadgen-webhook", body, "received");

  const entries = parseWebhookEntries(body);
  if (!entries.length) {
    return { status: 200, json: { ok: true, processed: 0, message: "No leadgen changes" } };
  }

  const results = [];
  for (const meta of entries) {
    try {
      const result = await processLeadgenEvent(meta);
      results.push(result);
      await logWebhook(
        supabaseUrl,
        serviceKey,
        "meta_leadgen",
        "/api/meta-leadgen-webhook",
        { meta, result },
        "processed"
      );
    } catch (e) {
      const msg = e.message || String(e);
      console.error("[meta-leadgen-webhook] process error", meta.leadgenId, msg);
      results.push({ ok: false, leadgenId: meta.leadgenId, error: msg });
      await logWebhook(
        supabaseUrl,
        serviceKey,
        "meta_leadgen",
        "/api/meta-leadgen-webhook",
        { meta, error: msg },
        "error"
      );
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  return { status: 200, json: { ok: true, processed: okCount, results } };
}

function handleGet(query) {
  const v = verifySubscription(query);
  if (!v.ok) {
    console.warn("[meta-leadgen-webhook] verify failed:", v.error);
    return { status: v.status, json: { ok: false, error: v.error } };
  }
  console.log("[meta-leadgen-webhook] Meta subscription verified");
  return { status: 200, text: v.challenge };
}

async function readRawBodyFromNodeReq(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (typeof req.rawBody === "string") return Buffer.from(req.rawBody, "utf8");
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function getNodeHeader(req, name) {
  const h = req.headers || {};
  const lower = name.toLowerCase();
  if (h[lower] !== undefined) return String(h[lower]);
  const found = Object.keys(h).find((k) => k.toLowerCase() === lower);
  return found ? String(h[found]) : "";
}

function jsonNode(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

/** Vercel Web Handler — raw POST body for Meta HMAC */
exports.GET = async function metaLeadgenGet(request) {
  const out = handleGet(queryFromRequestUrl(request.url));
  if (out.text != null) {
    return new Response(out.text, { status: out.status, headers: { "Content-Type": "text/plain" } });
  }
  return Response.json(out.json, { status: out.status });
};

exports.POST = async function metaLeadgenPost(request) {
  const rawBuf = Buffer.from(await request.text(), "utf8");
  const sig = request.headers.get("x-hub-signature-256") || "";
  const out = await handlePost(rawBuf, sig);
  return Response.json(out.json, { status: out.status });
};

/** Local dev + legacy Node (req, res) handler */
module.exports = async function metaLeadgenWebhook(req, res) {
  const method = (req.method || "GET").toUpperCase();

  if (method === "GET") {
    const out = handleGet(req.query || {});
    if (out.text != null) {
      res.status(out.status).setHeader("Content-Type", "text/plain");
      return res.send(out.text);
    }
    return jsonNode(res, out.status, out.json);
  }

  if (method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return jsonNode(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  let rawBuf;
  try {
    rawBuf = await readRawBodyFromNodeReq(req);
  } catch (e) {
    return jsonNode(res, 400, { ok: false, error: "Could not read body" });
  }

  const out = await handlePost(rawBuf, getNodeHeader(req, "x-hub-signature-256"));
  return jsonNode(res, out.status, out.json);
};
