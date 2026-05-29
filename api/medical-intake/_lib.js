const { serviceConfig } = require("../staff/_inbox-lib");
const { validateToken } = require("../../lib/medical-intake-token");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
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
  const cfg = serviceConfig();
  if (!cfg) return { ok: false, status: 500, error: "server_config" };
  const raw = getTokenFromReq(req);
  const v = await validateToken(cfg, raw);
  if (!v.ok) {
    const status = v.error === "invalid_token" ? 404 : 403;
    return { ok: false, status, error: v.error, cfg };
  }
  return { ok: true, cfg, tokenRow: v.tokenRow, rawToken: raw };
}

module.exports = { json, readJsonBody, getTokenFromReq, requireValidIntakeToken, serviceConfig };
