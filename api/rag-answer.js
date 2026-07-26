/**
 * POST /api/rag-answer
 * ManyChat — off-script questions via knowledge_chunks RAG.
 * Env: SUPABASE_*, MANYCHAT_WEBHOOK_SECRET, OPENAI_API_KEY, HUBSPOT_ACCESS_TOKEN (optional note)
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { runRagPipeline } = require("../lib/rag-pipeline");
const {
  checkManychatChatRateLimit,
  rateLimitMessage,
} = require("../lib/rate-limit");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  logRequest("rag-answer");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { status: "error", error: "Method Not Allowed" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    return json(res, auth.status, { status: "error", error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, {
      status: "error",
      error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }
  if (!process.env.OPENAI_API_KEY) {
    return json(res, 500, { status: "error", error: "Server missing OPENAI_API_KEY" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { status: "error", error: "Invalid JSON" });
  }

  const identity =
    String(body.phone || "").trim() ||
    String(body.subscriber_id || body.manychat_subscriber_id || "").trim();
  const language = body.language ? String(body.language).trim() : "English";
  const limit = await checkManychatChatRateLimit(req, identity);
  if (!limit.allowed) {
    const retry = limit.retryAfterSeconds || 60;
    res.setHeader("Retry-After", String(retry));
    return json(res, 429, {
      status: "rate_limited",
      answer: rateLimitMessage(language, retry),
      error: "rate_limited",
      retry_after_seconds: retry,
    });
  }

  try {
    const out = await runRagPipeline(body, { hubspotNotePrefix: "WhatsApp RAG" });
    if (out.error) {
      return json(res, out.statusCode || 500, { status: "error", error: out.error });
    }
    if (out.status === "no_answer" || out.answer == null) {
      return json(res, 200, { answer: null, status: "no_answer" });
    }
    return json(res, 200, { answer: out.answer, status: "answered" });
  } catch (e) {
    console.error("rag-answer", e);
    return json(res, 500, { status: "error", error: "Server error" });
  }
};
