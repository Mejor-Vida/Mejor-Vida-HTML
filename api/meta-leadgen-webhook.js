/**
 * GET|POST /api/meta-leadgen-webhook
 *
 * Meta Lead Ads (Instant Forms) webhook — no Make.com.
 * GET: hub.verify_token challenge (Meta app subscription setup)
 * POST: leadgen notification → fetch lead via Graph API → Supabase + IC CSV email + HubSpot
 *
 * Env:
 *   META_LEADGEN_VERIFY_TOKEN — must match Meta App → Webhooks → Verify Token
 *   FACEBOOK_APP_SECRET — validates X-Hub-Signature-256 on POST
 *   FACEBOOK_PAGE_ACCESS_TOKEN or META_LEADGEN_PAGE_ACCESS_TOKEN — needs leads_retrieval
 *   FACEBOOK_PAGE_ID — optional; reject webhooks for other pages
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   GMAIL_* — IC CSV to admin@ + julie@
 *   HUBSPOT_ACCESS_TOKEN — optional
 *   META_LEADGEN_SKIP_SIGNATURE=1 — local testing only (never in production)
 */

const { logWebhook } = require("../lib/contacts-db");
const {
  verifyHubSignature,
  parseWebhookEntries,
  processLeadgenEvent,
} = require("../lib/meta-leadgen");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function getHeader(req, name) {
  const h = req.headers || {};
  const lower = name.toLowerCase();
  if (h[lower] !== undefined) return String(h[lower]);
  const found = Object.keys(h).find((k) => k.toLowerCase() === lower);
  return found ? String(h[found]) : "";
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (typeof req.rawBody === "string") return Buffer.from(req.rawBody, "utf8");
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
  if (req.body && typeof req.body === "object") {
    return Buffer.from(JSON.stringify(req.body), "utf8");
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function parseJsonBody(rawBuf) {
  const text = rawBuf.toString("utf8");
  if (!text.trim()) return {};
  return JSON.parse(text);
}

function verifySubscription(req) {
  const mode = String(req.query["hub.mode"] || "").trim();
  const token = String(req.query["hub.verify_token"] || "").trim();
  const challenge = req.query["hub.challenge"];
  const expected = String(process.env.META_LEADGEN_VERIFY_TOKEN || "").trim();
  if (mode !== "subscribe") return { ok: false, status: 403, error: "Invalid hub.mode" };
  if (!expected || token !== expected) {
    return { ok: false, status: 403, error: "Verify token mismatch" };
  }
  if (challenge == null || String(challenge) === "") {
    return { ok: false, status: 400, error: "Missing hub.challenge" };
  }
  return { ok: true, challenge: String(challenge) };
}

module.exports = async function handler(req, res) {
  const method = (req.method || "GET").toUpperCase();

  if (method === "GET") {
    const v = verifySubscription(req);
    if (!v.ok) {
      console.warn("[meta-leadgen-webhook] verify failed:", v.error);
      return json(res, v.status, { ok: false, error: v.error });
    }
    console.log("[meta-leadgen-webhook] Meta subscription verified");
    res.status(200).setHeader("Content-Type", "text/plain");
    return res.send(v.challenge);
  }

  if (method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json(res, 500, { ok: false, error: "Supabase not configured" });
  }

  let rawBuf;
  try {
    rawBuf = await readRawBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Could not read body" });
  }

  const skipSig = String(process.env.META_LEADGEN_SKIP_SIGNATURE || "").trim() === "1";
  const appSecret = String(process.env.FACEBOOK_APP_SECRET || "").trim();
  if (!skipSig) {
    if (!appSecret) {
      return json(res, 500, { ok: false, error: "FACEBOOK_APP_SECRET not configured" });
    }
    const sigCheck = verifyHubSignature(rawBuf, getHeader(req, "x-hub-signature-256"), appSecret);
    if (!sigCheck.ok) {
      console.warn("[meta-leadgen-webhook] signature failed:", sigCheck.reason);
      await logWebhook(supabaseUrl, serviceKey, "meta_leadgen", "/api/meta-leadgen-webhook", {
        error: sigCheck.reason,
      }, "error");
      return json(res, 403, { ok: false, error: "Invalid signature" });
    }
  }

  let body;
  try {
    body = parseJsonBody(rawBuf);
  } catch {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  await logWebhook(supabaseUrl, serviceKey, "meta_leadgen", "/api/meta-leadgen-webhook", body, "received");

  const entries = parseWebhookEntries(body);
  if (!entries.length) {
    return json(res, 200, { ok: true, processed: 0, message: "No leadgen changes" });
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
  return json(res, 200, { ok: true, processed: okCount, results });
};

// Meta signs the raw POST bytes — Vercel must not JSON-parse before verify.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
