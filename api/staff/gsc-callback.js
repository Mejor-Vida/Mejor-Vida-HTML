const { google } = require("../../lib/google-clients");
const { getGa4OAuthClientConfig } = require("../../lib/ga4-oauth-config");
const { getOAuthRedirectUri } = require("../../lib/gsc-data-api");

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

  const code = String((req.query && req.query.code) || "").trim();
  if (!code) {
    return res.status(400).send("Missing OAuth code");
  }

  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing OAuth client configuration");
  }

  let redirectUri = getOAuthRedirectUri();
  const host = String(req.headers.host || "");
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    redirectUri = `http://${host}/api/staff/gsc-callback`;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const tokenRes = await oauth2Client.getToken(code);
    const refreshToken =
      tokenRes && tokenRes.tokens && tokenRes.tokens.refresh_token
        ? String(tokenRes.tokens.refresh_token)
        : "";

    const html = refreshToken
      ? `<!doctype html><html><head><meta charset="utf-8"><title>Search Console refresh token</title></head><body style="font-family:system-ui,sans-serif;padding:24px;max-width:720px"><h2>Search Console refresh token</h2><p>Copy into <code>GSC_REFRESH_TOKEN</code> in <code>.env.local</code> and Vercel.</p><p>Set <code>GSC_SITE_URL</code> to your Search Console property (e.g. <code>sc-domain:mejorvidainsurance.com</code> or <code>https://www.example.com/</code>).</p><pre style="white-space:pre-wrap;word-break:break-all;background:#f1f5f9;padding:12px;border-radius:8px">${escapeHtml(
          refreshToken
        )}</pre></body></html>`
      : `<!doctype html><html><body style="font-family:system-ui,sans-serif;padding:24px"><h2>No refresh token</h2><p>Google did not return a refresh token. Open <a href="/api/staff/gsc-auth">/api/staff/gsc-auth</a> again (uses prompt=consent).</p></body></html>`;

    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    res.status(500).send("Failed to exchange OAuth code: " + escapeHtml(e.message || "unknown"));
  }
};
