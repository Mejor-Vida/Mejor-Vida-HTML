/**
 * ManyChat External Request: shared secret in X-App-Secret header.
 */

function getHeader(req, name) {
  const h = req.headers || {};
  const lower = name.toLowerCase();
  if (h[lower] !== undefined) return String(h[lower]);
  const keys = Object.keys(h);
  const found = keys.find((k) => k.toLowerCase() === lower);
  return found ? String(h[found]) : "";
}

function verifyManychatSecret(req) {
  const secret = process.env.MANYCHAT_WEBHOOK_SECRET;
  if (!secret || typeof secret !== "string") {
    return { ok: false, status: 500, error: "MANYCHAT_WEBHOOK_SECRET not configured" };
  }
  const sent = getHeader(req, "x-app-secret");
  if (sent !== secret) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

function logRequest(route) {
  console.log(
    JSON.stringify({
      t: new Date().toISOString(),
      route,
      method: "POST",
    }),
  );
}

module.exports = { verifyManychatSecret, logRequest };
