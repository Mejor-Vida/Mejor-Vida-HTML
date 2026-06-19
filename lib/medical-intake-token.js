/**
 * One-time medical intake access tokens (7-day TTL, hashed at rest).
 */

const crypto = require("crypto");

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PHI_SOURCE = "medical_intake";

function tokenSecret() {
  return (
    process.env.MEDICAL_INTAKE_TOKEN_SECRET ||
    process.env.PHONE_VERIFY_OTP_SECRET ||
    process.env.CRON_SECRET ||
    ""
  ).trim();
}

function hashToken(rawToken) {
  const secret = tokenSecret();
  if (!secret) throw new Error("missing_medical_intake_token_secret");
  return crypto.createHmac("sha256", secret).update(String(rawToken)).digest("hex");
}

function generateRawToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function timingSafeEqualHex(a, b) {
  try {
    const ba = Buffer.from(String(a), "hex");
    const bb = Buffer.from(String(b), "hex");
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch (_) {
    return false;
  }
}

function buildIntakeUrl(rawToken) {
  const base = String(process.env.SITE_BASE_URL || "https://www.mejorvidainsurance.com").replace(/\/$/, "");
  return `${base}/medical-intake.html?t=${encodeURIComponent(rawToken)}`;
}

async function restInsert(cfg, table, row) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`insert ${table} ${r.status}: ${text.slice(0, 240)}`);
  const rows = JSON.parse(text || "[]");
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function restSelect(cfg, table, query) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`select ${table} ${r.status}: ${text.slice(0, 240)}`);
  return JSON.parse(text || "[]");
}

async function restPatch(cfg, table, query, payload) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`patch ${table} ${r.status}: ${text.slice(0, 240)}`);
  const rows = JSON.parse(text || "[]");
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function issueToken(cfg, { leadId, leadSourceTable, recipientEmail, issuedBy, recipientFirstName }) {
  const raw = generateRawToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  const payload = {
    token_hash: tokenHash,
    lead_id: leadId,
    lead_source_table: leadSourceTable,
    recipient_email: recipientEmail || null,
    issued_by: issuedBy || null,
    expires_at: expiresAt,
    status: "active",
  };
  const fn = String(recipientFirstName || "").trim();
  if (fn && !/^there$/i.test(fn)) payload.recipient_first_name = fn.slice(0, 80);
  const row = await restInsert(cfg, "medical_intake_access_tokens", payload);
  return {
    rawToken: raw,
    url: buildIntakeUrl(raw),
    tokenRow: row,
    expiresAt,
  };
}

async function validateToken(cfg, rawToken) {
  const t = String(rawToken || "").trim();
  if (!t || t.length < 20) return { ok: false, error: "invalid_token" };
  const tokenHash = hashToken(t);
  const rows = await restSelect(
    cfg,
    "medical_intake_access_tokens",
    `select=id,lead_id,lead_source_table,expires_at,used_at,status,recipient_first_name&token_hash=eq.${encodeURIComponent(tokenHash)}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row) return { ok: false, error: "invalid_token" };
  if (row.status === "used" || row.used_at) return { ok: false, error: "token_used" };
  if (row.status === "revoked") return { ok: false, error: "token_revoked" };
  const exp = new Date(row.expires_at).getTime();
  if (!Number.isFinite(exp) || exp < Date.now()) {
    await restPatch(cfg, "medical_intake_access_tokens", `id=eq.${encodeURIComponent(row.id)}`, {
      status: "expired",
    });
    return { ok: false, error: "token_expired" };
  }
  return { ok: true, tokenRow: row, tokenHash };
}

async function consumeToken(cfg, tokenRow) {
  if (!tokenRow || !tokenRow.id) throw new Error("missing_token_row");
  return restPatch(cfg, "medical_intake_access_tokens", `id=eq.${encodeURIComponent(tokenRow.id)}`, {
    used_at: new Date().toISOString(),
    status: "used",
  });
}

module.exports = {
  PHI_SOURCE,
  TOKEN_TTL_MS,
  hashToken,
  generateRawToken,
  buildIntakeUrl,
  issueToken,
  validateToken,
  consumeToken,
  timingSafeEqualHex,
};
