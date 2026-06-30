/**
 * OAuth client for GA4 Data API (separate from Gmail when needed).
 * Prefer GA4_OAUTH_CLIENT_ID / GA4_OAUTH_CLIENT_SECRET (e.g. Make Integration web client).
 * Falls back to GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET.
 */

function getGa4OAuthClientConfig() {
  const clientId = String(process.env.GA4_OAUTH_CLIENT_ID || process.env.GMAIL_CLIENT_ID || "").trim();
  const clientSecret = String(
    process.env.GA4_OAUTH_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET || ""
  ).trim();
  return { clientId, clientSecret };
}

function hasGa4OAuthClientConfig() {
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  return !!(clientId && clientSecret);
}

module.exports = {
  getGa4OAuthClientConfig,
  hasGa4OAuthClientConfig,
};
