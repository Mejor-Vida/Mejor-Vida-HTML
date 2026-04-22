const { google } = require("googleapis");
const { requireStaffAuth } = require("./_inbox-lib");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const code = String((req.query && req.query.code) || "").trim();
  if (!code) {
    return res.status(400).send("Missing OAuth code");
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing Gmail OAuth configuration");
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
    const tokenRes = await oauth2Client.getToken(code);
    const refreshToken =
      tokenRes && tokenRes.tokens && tokenRes.tokens.refresh_token
        ? String(tokenRes.tokens.refresh_token)
        : "";

    const html = refreshToken
      ? `<!doctype html><html><head><meta charset="utf-8"><title>Gmail refresh token</title></head><body style="font-family:system-ui,sans-serif;padding:24px"><h2>Gmail refresh token</h2><p>Copy this value into <code>GMAIL_REFRESH_TOKEN</code> (Vercel / env):</p><pre>${escapeHtml(
          refreshToken
        )}</pre></body></html>`
      : `<!doctype html><html><body style="font-family:system-ui,sans-serif;padding:24px"><h2>No refresh token</h2><p>Google did not return a refresh token. Try again with <code>prompt=consent</code> and revoke prior access if needed.</p></body></html>`;

    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    res.status(500).send("Failed to exchange OAuth code");
  }
};
