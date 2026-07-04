/**
 * Meta system user access tokens for Marketing API (CRM ad impressions).
 * Bypasses broken Business Manager "Generate token" UI.
 */
const crypto = require("crypto");
const { getMetaAppConfig } = require("./meta-oauth-config");

const META_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v19.0").trim();
const AD_SCOPES = "ads_read,read_insights";

function appSecretProof(accessToken, appSecret) {
  return crypto.createHmac("sha256", appSecret).update(accessToken).digest("hex");
}

async function graphPost(url, form) {
  const body = new URLSearchParams(form);
  const res = await fetch(url, { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (json.error) {
    const err = new Error(json.error.message || "Graph API error");
    err.code = json.error.code;
    err.subcode = json.error.error_subcode;
    err.raw = json.error;
    throw err;
  }
  return json;
}

async function exchangeOAuthCode(code, redirectUri) {
  const { appId, appSecret } = getMetaAppConfig();
  if (!appId || !appSecret) {
    throw new Error("Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET");
  }
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code: String(code || "").trim(),
  });
  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token?${params.toString()}`
  );
  const json = await res.json().catch(() => ({}));
  if (json.error) {
    throw new Error(json.error.message || "OAuth code exchange failed");
  }
  const accessToken = String(json.access_token || "").trim();
  if (!accessToken) throw new Error("OAuth exchange returned no access_token");
  return accessToken;
}

async function installAppForSystemUser(systemUserId, appId, actorToken) {
  try {
    await graphPost(`https://graph.facebook.com/${META_API_VERSION}/${systemUserId}/applications`, {
      business_app: appId,
      access_token: actorToken,
    });
    return { installed: true };
  } catch (err) {
    if (err.code === 100 || /already/i.test(String(err.message))) {
      return { installed: false, skipped: true, message: err.message };
    }
    throw err;
  }
}

async function generateSystemUserToken(options) {
  const {
    actorToken,
    expiring = false,
    systemUserId = getMetaAppConfig().systemUserId,
    appId = getMetaAppConfig().appId,
    appSecret = getMetaAppConfig().appSecret,
    scopes = AD_SCOPES,
  } = options || {};

  if (!actorToken) throw new Error("Missing actor access token");
  if (!appSecret) throw new Error("Missing FACEBOOK_APP_SECRET");
  if (!systemUserId) throw new Error("Missing META_SYSTEM_USER_ID");
  if (!appId) throw new Error("Missing FACEBOOK_APP_ID");

  const form = {
    business_app: appId,
    scope: scopes,
    appsecret_proof: appSecretProof(actorToken, appSecret),
    access_token: actorToken,
  };
  if (expiring) form.set_token_expires_in_60_days = "true";

  return graphPost(
    `https://graph.facebook.com/${META_API_VERSION}/${systemUserId}/access_tokens`,
    form
  );
}

async function createPermanentMetaAdToken(adminUserToken) {
  const cfg = getMetaAppConfig();
  await installAppForSystemUser(cfg.systemUserId, cfg.appId, adminUserToken);

  try {
    const result = await generateSystemUserToken({
      actorToken: adminUserToken,
      expiring: false,
    });
    return { ...result, expiring: false };
  } catch (err) {
    if (!/expir/i.test(String(err.message))) throw err;
    const result = await generateSystemUserToken({
      actorToken: adminUserToken,
      expiring: true,
    });
    return { ...result, expiring: true, fallbackReason: err.message };
  }
}

async function refreshSystemUserToken(currentSystemUserToken) {
  const cfg = getMetaAppConfig();
  return generateSystemUserToken({
    actorToken: currentSystemUserToken,
    expiring: true,
  });
}

async function debugMetaToken(token) {
  const accessToken = String(token || "").trim();
  if (!accessToken) return { valid: false, error: "empty token" };

  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(accessToken)}`
  );
  const json = await res.json().catch(() => ({}));
  if (json.error) {
    return { valid: false, error: json.error.message || "debug_token failed" };
  }

  const data = json.data || {};
  const scopes = data.scopes || [];
  const expiresAt = Number(data.expires_at) || 0;
  const isNeverExpiring = expiresAt === 0;
  const expiresIso = isNeverExpiring ? null : new Date(expiresAt * 1000).toISOString();
  const hasAds = scopes.includes("ads_read") || scopes.includes("ads_management");

  return {
    valid: data.is_valid !== false,
    scopes,
    hasAds,
    expiresAt,
    expiresIso,
    isNeverExpiring,
    type: data.type || null,
  };
}

async function getMetaAdTokenHealth(token) {
  const debug = await debugMetaToken(token);
  if (!debug.valid) {
    return {
      ok: false,
      status: "invalid",
      ...debug,
      hint: "Re-run /api/staff/meta-ads-auth to generate a new system user token.",
    };
  }
  if (!debug.hasAds) {
    return {
      ok: false,
      status: "missing_ads_scope",
      ...debug,
      hint: "Token lacks ads_read. Re-run /api/staff/meta-ads-auth.",
    };
  }

  const warnDays = Number(process.env.META_AD_TOKEN_WARN_DAYS) || 14;
  if (!debug.isNeverExpiring && debug.expiresAt) {
    const daysLeft = (debug.expiresAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft <= 0) {
      return {
        ok: false,
        status: "expired",
        daysLeft: 0,
        ...debug,
        hint: "Token expired. Re-run /api/staff/meta-ads-auth.",
      };
    }
    if (daysLeft <= warnDays) {
      return {
        ok: true,
        status: "expiring_soon",
        daysLeft: Math.round(daysLeft),
        ...debug,
        hint: `Token expires in ~${Math.round(daysLeft)} days. Re-run /api/staff/meta-ads-auth to renew.`,
      };
    }
  }

  return {
    ok: true,
    status: debug.isNeverExpiring ? "never_expiring" : "valid",
    ...debug,
  };
}

module.exports = {
  AD_SCOPES,
  appSecretProof,
  exchangeOAuthCode,
  installAppForSystemUser,
  generateSystemUserToken,
  createPermanentMetaAdToken,
  refreshSystemUserToken,
  debugMetaToken,
  getMetaAdTokenHealth,
};
