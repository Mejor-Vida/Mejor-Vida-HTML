/**
 * GET /api/staff/ga4-auth — one-time OAuth for GA4 Data API (analytics.readonly).
 * Uses GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET. Add redirect URI in Google Cloud OAuth client:
 *   https://www.mejorvidainsurance.com/api/staff/ga4-callback
 *   http://localhost:3000/api/staff/ga4-callback
 */
const { google } = require("../../lib/google-clients");
const { getOAuthRedirectUri } = require("../../lib/ga4-data-api");
const { getGa4OAuthClientConfig } = require("../../lib/ga4-oauth-config");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing GA4 OAuth client — set GA4_OAUTH_CLIENT_ID/SECRET or GMAIL_CLIENT_ID/SECRET");
  }

  let redirectUri = getOAuthRedirectUri();
  const host = String(req.headers.host || "");
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    redirectUri = `http://${host}/api/staff/ga4-callback`;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  res.redirect(url);
};
