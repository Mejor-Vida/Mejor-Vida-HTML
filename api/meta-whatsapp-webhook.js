/**
 * GET|POST /api/meta-whatsapp-webhook
 *
 * Meta WhatsApp Cloud API webhooks for CTWA attribution only.
 * Does not send messages; does not affect ManyChat delivery.
 *
 * Env: META_WHATSAPP_APP_SECRET, META_WHATSAPP_VERIFY_TOKEN, META_WHATSAPP_PHONE_NUMBER_ID,
 *      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const { verifyHubSignature } = require("../lib/meta-leadgen");
const { logWebhook } = require("../lib/contacts-db");
const { extractReferralEvents } = require("../lib/meta-whatsapp-webhook");
const { processCtwaReferral } = require("../lib/meta-whatsapp-attribution");

function verifySubscription(query) {
  const mode = String(query["hub.mode"] || "").trim();
  const token = String(query["hub.verify_token"] || "").trim();
  const challenge = query["hub.challenge"];
  const expected = String(process.env.META_WHATSAPP_VERIFY_TOKEN || "").trim();
  if (mode !== "subscribe") return { ok: false, status: 403, error: "Invalid hub.mode" };
  if (!expected || token !== expected) {
    return { ok: false, status: 403, error: "Verify token mismatch" };
  }
  if (challenge == null || String(challenge) === "") {
    return { ok: false, status: 400, error: "Missing hub.challenge" };
  }
  return { ok: true, status: 200, challenge: String(challenge) };
}

function serviceConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

async function handlePost(rawBuf, signatureHeader) {
  const cfg = serviceConfig();
  if (!cfg) {
    return { status: 500, json: { ok: false, error: "Supabase not configured" } };
  }

  const skipSig = String(process.env.META_WHATSAPP_SKIP_SIGNATURE || "").trim() === "1";
  const appSecret = String(process.env.META_WHATSAPP_APP_SECRET || "").trim();
  if (!skipSig) {
    if (!appSecret) {
      return { status: 500, json: { ok: false, error: "META_WHATSAPP_APP_SECRET not configured" } };
    }
    const sigCheck = verifyHubSignature(rawBuf, signatureHeader, appSecret);
    if (!sigCheck.ok) {
      console.warn("[meta-whatsapp-webhook] signature failed:", sigCheck.reason);
      return { status: 403, json: { ok: false, error: "Invalid signature" } };
    }
  }

  let body;
  try {
    body = JSON.parse(rawBuf.toString("utf8") || "{}");
  } catch {
    return { status: 400, json: { ok: false, error: "Invalid JSON" } };
  }

  await logWebhook(
    cfg.supabaseUrl,
    cfg.serviceKey,
    "meta_whatsapp",
    "/api/meta-whatsapp-webhook",
    { object: body.object, entry_count: (body.entry || []).length },
    "received"
  );

  const phoneNumberId = String(process.env.META_WHATSAPP_PHONE_NUMBER_ID || "").trim();
  if (!phoneNumberId) {
    return { status: 500, json: { ok: false, error: "META_WHATSAPP_PHONE_NUMBER_ID not configured" } };
  }

  const referrals = extractReferralEvents(body, phoneNumberId);
  const results = [];
  for (const ref of referrals) {
    try {
      const result = await processCtwaReferral(cfg, ref);
      results.push({ messageId: ref.messageId, ...result });
    } catch (e) {
      const msg = e.message || String(e);
      console.error("[meta-whatsapp-webhook] process", ref.messageId, msg);
      results.push({ messageId: ref.messageId, ok: false, error: msg });
    }
  }

  return {
    status: 200,
    json: {
      ok: true,
      referrals: referrals.length,
      results,
    },
  };
}

function handleGet(query) {
  const v = verifySubscription(query);
  if (!v.ok) {
    console.warn("[meta-whatsapp-webhook] verify failed:", v.error);
    return { status: v.status, json: { ok: false, error: v.error } };
  }
  console.log("[meta-whatsapp-webhook] Meta subscription verified");
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

function queryFromRequestUrl(url) {
  const q = {};
  new URL(url).searchParams.forEach((value, key) => {
    q[key] = value;
  });
  return q;
}

function jsonNode(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

exports.GET = async function metaWhatsappGet(request) {
  const out = handleGet(queryFromRequestUrl(request.url));
  if (out.text != null) {
    return new Response(out.text, { status: out.status, headers: { "Content-Type": "text/plain" } });
  }
  return Response.json(out.json, { status: out.status });
};

exports.POST = async function metaWhatsappPost(request) {
  const rawBuf = Buffer.from(await request.text(), "utf8");
  const sig = request.headers.get("x-hub-signature-256") || "";
  const out = await handlePost(rawBuf, sig);
  return Response.json(out.json, { status: out.status });
};

const metaWhatsappWebhook = async function metaWhatsappWebhook(req, res) {
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
  } catch {
    return jsonNode(res, 400, { ok: false, error: "Could not read body" });
  }

  const out = await handlePost(rawBuf, getNodeHeader(req, "x-hub-signature-256"));
  return jsonNode(res, out.status, out.json);
};

metaWhatsappWebhook.GET = exports.GET;
metaWhatsappWebhook.POST = exports.POST;
module.exports = metaWhatsappWebhook;
