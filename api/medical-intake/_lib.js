const { serviceConfig } = require("../staff/_inbox-lib");
const { validateToken } = require("../../lib/medical-intake-token");

const DEV_PREVIEW_TOKEN = "dev-preview-local";

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function isLocalDevRequest(req) {
  const host = String((req.headers && req.headers.host) || "").toLowerCase();
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

function isDevPreviewToken(raw) {
  return String(raw || "") === DEV_PREVIEW_TOKEN;
}

function getTokenFromReq(req) {
  const q = req.query && req.query.t ? String(req.query.t) : "";
  if (q) return q;
  try {
    const body = readJsonBody(req);
    return body && body.token ? String(body.token) : "";
  } catch (_) {
    return "";
  }
}

async function requireValidIntakeToken(req) {
  const raw = getTokenFromReq(req);
  if (isLocalDevRequest(req) && isDevPreviewToken(raw)) {
    return {
      ok: true,
      cfg: serviceConfig(),
      tokenRow: {
        id: null,
        lead_id: null,
        lead_source_table: "dev_preview",
        expires_at: null,
      },
      rawToken: raw,
      devPreview: true,
    };
  }
  const cfg = serviceConfig();
  if (!cfg) return { ok: false, status: 500, error: "server_config" };
  const v = await validateToken(cfg, raw);
  if (!v.ok) {
    const status = v.error === "invalid_token" ? 404 : 403;
    return { ok: false, status, error: v.error, cfg };
  }
  return { ok: true, cfg, tokenRow: v.tokenRow, rawToken: raw };
}

module.exports = {
  json,
  readJsonBody,
  getTokenFromReq,
  requireValidIntakeToken,
  serviceConfig,
  DEV_PREVIEW_TOKEN,
  isLocalDevRequest,
  isDevPreviewToken,
};
