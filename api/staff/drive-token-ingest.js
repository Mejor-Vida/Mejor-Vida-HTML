/**
 * POST /api/staff/drive-token-ingest
 * Local-only: the production Drive OAuth callback posts the refresh token here
 * so it can be saved to .env.local without displaying it.
 */
const { upsertEnvLocal } = require("../../lib/env-local-upsert");

function isLocalHost(req) {
  const host = String((req && req.headers && req.headers.host) || "");
  return host.includes("localhost") || host.includes("127.0.0.1");
}

function cors(req, res) {
  const origin = String((req.headers && req.headers.origin) || "");
  if (
    origin === "https://www.mejorvidainsurance.com" ||
    origin === "https://mejorvidainsurance.com"
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  if (!isLocalHost(req)) {
    return res.status(403).json({ error: "Local only" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const secret = String(body.secret || "").trim();
  const expected = String(process.env.CRON_SECRET || "").trim();
  if (!expected || secret !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = String(body.token || "").trim();
  if (!token) return res.status(400).json({ error: "Missing token" });

  upsertEnvLocal("GOOGLE_DRIVE_REFRESH_TOKEN", token);
  return res.status(200).json({ ok: true });
};
