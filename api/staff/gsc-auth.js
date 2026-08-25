/**
 * GET /api/staff/gsc-auth — one-time OAuth for Search Console (webmasters.readonly).
 * Enable Search Console API in Google Cloud. Reuses GA4/Gmail OAuth client.
 * Redirect URIs:
 *   https://www.mejorvidainsurance.com/api/staff/gsc-callback
 */
const { google } = require("../../lib/google-clients");
const { getGa4OAuthClientConfig } = require("../../lib/ga4-oauth-config");
const { GSC_SCOPE, getOAuthRedirectUri } = require("../../lib/gsc-data-api");

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
    redirectUri = `http://${host}/api/staff/gsc-callback`;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GSC_SCOPE],
  });
  res.redirect(url);
};
