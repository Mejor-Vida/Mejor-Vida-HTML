function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

function readJson(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function applyPublicCors(req, res) {
  const origin = String((req.headers && req.headers.origin) || "").trim();
  if (!origin) return;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (host === "mejorvidainsurance.com" || host === "www.mejorvidainsurance.com" || host === "localhost" || host === "127.0.0.1") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
  } catch {
    /* ignore */
  }
}

module.exports = { json, readJson, applyPublicCors };
