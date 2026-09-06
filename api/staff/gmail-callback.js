const { productionGmailRedirectUri } = require("../../lib/gmail-oauth-redirect");
const { google } = require("../../lib/google-clients");
const { DRIVE_BACKUP_STATE } = require("../../lib/google-drive-backup");
const { sendDriveConnectedResponse, escapeHtml } = require("../../lib/google-drive-oauth-finish");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const code = String((req.query && req.query.code) || "").trim();
  if (!code) {
    return res.status(400).send("Missing OAuth code");
  }

  const state = String((req.query && req.query.state) || "").trim();
  const isDrive = state === DRIVE_BACKUP_STATE;

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing Gmail OAuth configuration");
  }

  try {
    const redirectUri = productionGmailRedirectUri();
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const tokenRes = await oauth2Client.getToken(code);
    const refreshToken =
      tokenRes && tokenRes.tokens && tokenRes.tokens.refresh_token
        ? String(tokenRes.tokens.refresh_token)
        : "";

    if (isDrive) {
      return sendDriveConnectedResponse(req, res, refreshToken);
    }

    const html = refreshToken
      ? `<!doctype html><html><head><meta charset="utf-8"><title>Gmail refresh token</title></head><body style="font-family:system-ui,sans-serif;padding:24px"><h2>Gmail refresh token</h2><p>Copy this value into <code>GMAIL_REFRESH_TOKEN</code> (Vercel / env):</p><pre>${escapeHtml(
          refreshToken
        )}</pre></body></html>`
      : `<!doctype html><html><body style="font-family:system-ui,sans-serif;padding:24px"><h2>No refresh token</h2><p>Google did not return a refresh token. Try again with <code>prompt=consent</code> and revoke prior access if needed.</p></body></html>`;

    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    res.status(500).send("Failed to exchange OAuth code: " + escapeHtml(e.message || "unknown"));
  }
};
