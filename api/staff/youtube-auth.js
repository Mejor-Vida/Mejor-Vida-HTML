/**
 * GET /api/staff/youtube-auth — one-time YouTube Data API consent.
 * Reuses the GA4/Gmail OAuth client and the Search Console callback URI
 * (already registered in Google Cloud). Sign in as admin@mejorvidainsurance.com
 * and pick the Mejor Vida Insurance LLC channel.
 */
const { getGa4OAuthClientConfig } = require("../../lib/ga4-oauth-config");
const {
  YOUTUBE_CONNECT_STATE,
  YOUTUBE_SCOPES,
  LOCAL_REDIRECT_URI,
  youtubeOAuthClient,
  youtubeOAuthRedirectUri,
} = require("../../lib/youtube-api");

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

  let redirectUri = youtubeOAuthRedirectUri();
  const host = String(req.headers.host || "");
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    redirectUri = LOCAL_REDIRECT_URI;
  }

  const oauth2Client = youtubeOAuthClient(redirectUri);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account consent",
    include_granted_scopes: false,
    state: YOUTUBE_CONNECT_STATE,
    scope: YOUTUBE_SCOPES,
    login_hint: "admin@mejorvidainsurance.com",
  });
  res.redirect(url);
};
