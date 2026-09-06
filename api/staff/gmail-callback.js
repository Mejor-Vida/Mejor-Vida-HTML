const { productionGmailRedirectUri } = require("../../lib/gmail-oauth-redirect");
const { google } = require("../../lib/google-clients");
const { DRIVE_BACKUP_STATE } = require("../../lib/google-drive-backup");
const { upsertEnvLocal } = require("../../lib/env-local-upsert");

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isLocalHost(req) {
  const host = String((req && req.headers && req.headers.host) || "");
  return host.includes("localhost") || host.includes("127.0.0.1");
}

function driveConnectedHtml(statusMessage) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Google Drive backup</title></head><body style="font-family:system-ui,sans-serif;padding:24px;max-width:640px"><h2>Google Drive backup</h2><p>${escapeHtml(
    statusMessage
  )}</p></body></html>`;
}

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
      if (!refreshToken) {
        res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(
          driveConnectedHtml("Google did not return a refresh token. Open /api/staff/drive-auth again.")
        );
      }
      if (isLocalHost(req)) {
        upsertEnvLocal("GOOGLE_DRIVE_REFRESH_TOKEN", refreshToken);
        res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(
          driveConnectedHtml("Saved GOOGLE_DRIVE_REFRESH_TOKEN to .env.local. You can close this tab.")
        );
      }

      const ingestSecret = String(process.env.CRON_SECRET || "").trim();
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Google Drive backup</title></head><body style="font-family:system-ui,sans-serif;padding:24px;max-width:640px"><h2>Google Drive backup</h2><p id="status">Saving access on this Mac…</p><script>
(function () {
  var payload = ${JSON.stringify({ token: refreshToken, secret: ingestSecret })};
  fetch("http://127.0.0.1:3000/api/staff/drive-token-ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(function (r) {
    document.getElementById("status").textContent = r.ok
      ? "Drive backup is connected. You can close this tab."
      : "Could not save on this Mac. Leave this tab open.";
  }).catch(function () {
    document.getElementById("status").textContent = "Could not reach the local server. Leave this tab open.";
  });
})();
</script></body></html>`;
      res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
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
