/**
 * Distributed fixed-window rate limiting for Vercel serverless routes.
 * Backed by Supabase RPC `consume_rate_limit` (see migrations/086_api_rate_limits.sql).
 *
 * Usage:
 *   const decision = await checkRateLimit(req, { bucket: "website_chat", identity: sessionId });
 *   if (!decision.allowed) return rateLimitedResponse(...);
 */

const crypto = require("crypto");

const DEFAULTS = {
  enabled: true,
  websiteChatMax: 25,
  websiteChatWindowSec: 900,
  manychatChatMax: 40,
  manychatChatWindowSec: 900,
  /** When Supabase/RPC is unavailable: allow the request (fail-open) so chat stays up. */
  failOpen: true,
};

function envFlag(name, fallback) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === "") return fallback;
  const v = String(raw).trim().toLowerCase();
  if (["0", "false", "off", "no"].includes(v)) return false;
  if (["1", "true", "on", "yes"].includes(v)) return true;
  return fallback;
}

function envInt(name, fallback) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === "") return fallback;
  const n = parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function getRateLimitConfig() {
  return {
    enabled: envFlag("RATE_LIMIT_ENABLED", DEFAULTS.enabled),
    websiteChatMax: envInt("RATE_LIMIT_WEBSITE_CHAT_MAX", DEFAULTS.websiteChatMax),
    websiteChatWindowSec: envInt(
      "RATE_LIMIT_WEBSITE_CHAT_WINDOW_SEC",
      DEFAULTS.websiteChatWindowSec
    ),
    manychatChatMax: envInt("RATE_LIMIT_MANYCHAT_CHAT_MAX", DEFAULTS.manychatChatMax),
    manychatChatWindowSec: envInt(
      "RATE_LIMIT_MANYCHAT_CHAT_WINDOW_SEC",
      DEFAULTS.manychatChatWindowSec
    ),
    failOpen: envFlag("RATE_LIMIT_FAIL_OPEN", DEFAULTS.failOpen),
  };
}

function getHeader(req, name) {
  const h = req && req.headers ? req.headers : {};
  const key = Object.keys(h).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? h[key] : undefined;
}

/**
 * Client IP as seen by Vercel (first X-Forwarded-For hop).
 */
function getClientIp(req) {
  const xff = getHeader(req, "x-forwarded-for");
  if (xff) {
    const first = String(xff).split(",")[0].trim();
    if (first) return first;
  }
  const realIp = getHeader(req, "x-real-ip");
  if (realIp) return String(realIp).trim();
  if (req && req.socket && req.socket.remoteAddress) {
    return String(req.socket.remoteAddress).trim();
  }
  return "";
}

/**
 * Hash identity for storage (avoid storing raw IPs / phones in cleartext).
 */
function hashClientKey(parts) {
  const material = parts
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .join("|");
  if (!material) return "anonymous";
  return crypto.createHash("sha256").update(material).digest("hex").slice(0, 48);
}

function serviceConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url: String(url).replace(/\/$/, ""), key } : null;
}

async function callConsumeRateLimit(supabaseUrl, serviceKey, bucket, clientKey, max, windowSec) {
  const url = `${supabaseUrl}/rest/v1/rpc/consume_rate_limit`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_bucket: bucket,
      p_client_key: clientKey,
      p_max: max,
      p_window_seconds: windowSec,
    }),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`consume_rate_limit ${r.status}: ${text.slice(0, 300)}`);
  }
  const data = text ? JSON.parse(text) : null;
  if (!data || typeof data !== "object") {
    throw new Error("consume_rate_limit: empty response");
  }
  return data;
}

/**
 * @param {object} req - Incoming HTTP request
 * @param {object} opts
 * @param {string} opts.bucket - Logical bucket name (e.g. website_chat)
 * @param {number} opts.max
 * @param {number} opts.windowSec
 * @param {string} [opts.identity] - Extra identity (session_id, phone, subscriber_id)
 * @param {boolean} [opts.failOpen]
 * @returns {Promise<{allowed:boolean, remaining:number, retryAfterSeconds:number, currentCount:number, skipped?:boolean, reason?:string}>}
 */
async function checkRateLimit(req, opts) {
  const cfg = getRateLimitConfig();
  const enabled = opts.enabled != null ? opts.enabled : cfg.enabled;
  if (!enabled) {
    return {
      allowed: true,
      remaining: -1,
      retryAfterSeconds: 0,
      currentCount: 0,
      skipped: true,
      reason: "disabled",
    };
  }

  const bucket = String(opts.bucket || "").trim();
  const max = Math.max(1, parseInt(opts.max, 10) || 1);
  const windowSec = Math.max(1, parseInt(opts.windowSec, 10) || 60);
  const failOpen = opts.failOpen != null ? opts.failOpen : cfg.failOpen;

  const ip = getClientIp(req);
  const identity = opts.identity != null ? String(opts.identity).trim() : "";
  // Website: prefer IP (session_id is easy to rotate). ManyChat: prefer phone/subscriber
  // (requests often share ManyChat egress IPs).
  const primary =
    opts.preferIdentity && identity ? identity : ip || identity || "anonymous";
  const clientKey = hashClientKey([primary, bucket]);

  const svc = serviceConfig();
  if (!svc) {
    console.warn("rate_limit_skip", { bucket, reason: "missing_supabase_env" });
    if (failOpen) {
      return {
        allowed: true,
        remaining: -1,
        retryAfterSeconds: 0,
        currentCount: 0,
        skipped: true,
        reason: "missing_supabase_env",
      };
    }
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: windowSec,
      currentCount: 0,
      reason: "missing_supabase_env",
    };
  }

  try {
    const result = await callConsumeRateLimit(
      svc.url,
      svc.key,
      bucket,
      clientKey,
      max,
      windowSec
    );
    const allowed = result.allowed === true;
    const remaining = Number.isFinite(result.remaining) ? result.remaining : 0;
    const retryAfterSeconds = Number.isFinite(result.retry_after_seconds)
      ? result.retry_after_seconds
      : windowSec;
    const currentCount = Number.isFinite(result.current_count) ? result.current_count : 0;

    if (!allowed) {
      console.warn("rate_limit_blocked", {
        bucket,
        currentCount,
        max,
        windowSec,
        retryAfterSeconds,
      });
    }

    // Rare opportunistic cleanup (~1% of checks)
    if (Math.random() < 0.01) {
      fetch(`${svc.url}/rest/v1/rpc/cleanup_api_rate_limits`, {
        method: "POST",
        headers: {
          apikey: svc.key,
          Authorization: `Bearer ${svc.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_older_than_seconds: 86400 }),
      }).catch(() => {});
    }

    return {
      allowed,
      remaining,
      retryAfterSeconds,
      currentCount,
    };
  } catch (e) {
    console.error("rate_limit_error", e && e.message ? e.message : e);
    if (failOpen) {
      return {
        allowed: true,
        remaining: -1,
        retryAfterSeconds: 0,
        currentCount: 0,
        skipped: true,
        reason: "rpc_error",
      };
    }
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: windowSec,
      currentCount: 0,
      reason: "rpc_error",
    };
  }
}

function rateLimitMessage(language, retryAfterSeconds) {
  const l = String(language || "").toLowerCase();
  const mins = Math.max(1, Math.ceil((retryAfterSeconds || 60) / 60));
  if (l.startsWith("spanish") || l.startsWith("es")) {
    return (
      "Has enviado muchas preguntas en poco tiempo. " +
      `Espera unos ${mins} minuto${mins === 1 ? "" : "s"} e intenta de nuevo. ` +
      "Si necesitas ayuda ahora, escríbele a Julie@mejorvidainsurance.com."
    );
  }
  return (
    "You've sent quite a few messages in a short time. " +
    `Please wait about ${mins} minute${mins === 1 ? "" : "s"} and try again. ` +
    "If you need help right away, email Julie@mejorvidainsurance.com."
  );
}

/**
 * Convenience check for the public website assistant (/api/rag-site).
 */
async function checkWebsiteChatRateLimit(req, sessionId) {
  const cfg = getRateLimitConfig();
  return checkRateLimit(req, {
    bucket: "website_chat",
    max: cfg.websiteChatMax,
    windowSec: cfg.websiteChatWindowSec,
    identity: sessionId || "",
  });
}

/**
 * Convenience check for ManyChat / WhatsApp RAG (/api/rag-answer).
 */
async function checkManychatChatRateLimit(req, phoneOrSubscriber) {
  const cfg = getRateLimitConfig();
  return checkRateLimit(req, {
    bucket: "manychat_chat",
    max: cfg.manychatChatMax,
    windowSec: cfg.manychatChatWindowSec,
    identity: phoneOrSubscriber || "",
    preferIdentity: true,
  });
}

module.exports = {
  checkRateLimit,
  checkWebsiteChatRateLimit,
  checkManychatChatRateLimit,
  getRateLimitConfig,
  getClientIp,
  rateLimitMessage,
  hashClientKey,
};
