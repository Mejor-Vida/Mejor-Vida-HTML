/**
 * Meta app OAuth config for staff system-user token setup.
 * Env: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET (MejorVidaAutomation).
 */

const DEFAULT_APP_ID = "1319755636638842";
const DEFAULT_SYSTEM_USER_ID = "61589754071076";
const META_OAUTH_SCOPES = ["business_management", "ads_read", "read_insights"].join(",");

function getMetaAppConfig() {
  const appId = String(process.env.FACEBOOK_APP_ID || DEFAULT_APP_ID).trim();
  const appSecret = String(process.env.FACEBOOK_APP_SECRET || "").trim();
  const systemUserId = String(process.env.META_SYSTEM_USER_ID || DEFAULT_SYSTEM_USER_ID).trim();
  return { appId, appSecret, systemUserId };
}

function getMetaOAuthRedirectUri() {
  const fromEnv = String(process.env.META_OAUTH_REDIRECT_URI || "").trim();
  if (fromEnv) return fromEnv;
  const site = String(process.env.SITE_URL || "https://www.mejorvidainsurance.com").replace(/\/$/, "");
  return `${site}/api/staff/meta-ads-callback`;
}

function resolveMetaOAuthRedirectUri(req) {
  const host = String((req && req.headers && req.headers.host) || "").trim();
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return `http://${host}/api/staff/meta-ads-callback`;
  }
  return getMetaOAuthRedirectUri();
}

function buildMetaOAuthUrl(redirectUri) {
  const { appId } = getMetaAppConfig();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: META_OAUTH_SCOPES,
    response_type: "code",
  });
  const version = String(process.env.META_GRAPH_API_VERSION || "v19.0").trim();
  return `https://www.facebook.com/${version}/dialog/oauth?${params.toString()}`;
}

module.exports = {
  DEFAULT_APP_ID,
  DEFAULT_SYSTEM_USER_ID,
  META_OAUTH_SCOPES,
  getMetaAppConfig,
  getMetaOAuthRedirectUri,
  resolveMetaOAuthRedirectUri,
  buildMetaOAuthUrl,
};
