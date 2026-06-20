/**
 * POST /api/telnyx-outbound-test?to=+1XXXXXXXXXX
 * Auth: Bearer CRON_SECRET
 *
 * Sends a one-line test SMS via Telnyx to verify outbound (API key, from number, 10DLC).
 * Does not use the inbound webhook.
 */

const { sendSms, smsFromNumber, smsFromIdentity } = require("../lib/sms-send");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function bearer(req) {
  const h = req.headers?.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const secret = process.env.CRON_SECRET;
  if (!secret || bearer(req) !== secret) {
    return json(res, 401, { ok: false, error: "Unauthorized" });
  }

  const to =
    (req.query && req.query.to && String(req.query.to).trim()) ||
    (req.body && typeof req.body === "object" && req.body.to && String(req.body.to).trim()) ||
    "";

  if (!to) {
    return json(res, 400, {
      ok: false,
      error: "Missing to — use ?to=+14023146495 (your phone, E.164)",
    });
  }

  if (!(process.env.TELNYX_API_KEY || "").trim()) {
    return json(res, 500, { ok: false, error: "TELNYX_API_KEY not set on Vercel" });
  }

  const sent = await sendSms({
    to,
    body: "Mejor Vida Telnyx outbound test — reply STOP to opt out.",
  });

  return json(res, sent.ok ? 200 : 502, {
    ok: sent.ok,
    to,
    from_identity: smsFromIdentity(),
    from_number: smsFromNumber(),
    message_id: sent.sid || null,
    reason: sent.reason || null,
    telnyx_status: sent.status || null,
    telnyx_error: sent.message || null,
  });
};
