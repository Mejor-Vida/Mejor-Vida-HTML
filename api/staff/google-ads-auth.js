/**
 * GET /api/staff/google-ads-auth — one-time OAuth for Google Ads API (adwords scope).
 * Add redirect URI in Google Cloud OAuth client:
 *   https://www.mejorvidainsurance.com/api/staff/google-ads-callback
 *   http://localhost:3000/api/staff/google-ads-callback
 */
const { google } = require("googleapis");
const { getGa4OAuthClientConfig } = require("../../lib/ga4-oauth-config");
const { ADWORDS_SCOPE, getOAuthRedirectUri } = require("../../lib/google-ads-api");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  if (!clientId || !clientSecret) {
    return res
      .status(500)
      .send("Missing OAuth client — set GA4_OAUTH_CLIENT_ID/SECRET or GMAIL_CLIENT_ID/SECRET");
  }

  let redirectUri = getOAuthRedirectUri();
  const host = String(req.headers.host || "");
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    redirectUri = `http://${host}/api/staff/google-ads-callback`;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [ADWORDS_SCOPE],
  });
  res.redirect(url);
};
