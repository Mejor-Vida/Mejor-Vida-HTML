/**
 * GET /api/staff/meta-ads-auth — one-time OAuth to create a permanent Meta system user token.
 *
 * Add Valid OAuth Redirect URIs in Meta app → Facebook Login → Settings:
 *   https://www.mejorvidainsurance.com/api/staff/meta-ads-callback
 *   http://localhost:3000/api/staff/meta-ads-callback
 *
 * Env: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, META_SYSTEM_USER_ID (optional)
 */
const { getMetaAppConfig, resolveMetaOAuthRedirectUri, buildMetaOAuthUrl } = require("../../lib/meta-oauth-config");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const { appId, appSecret } = getMetaAppConfig();
  if (!appId || !appSecret) {
    return res
      .status(500)
      .send("Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET in environment.");
  }

  const redirectUri = resolveMetaOAuthRedirectUri(req);
  res.redirect(buildMetaOAuthUrl(redirectUri));
};
