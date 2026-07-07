/**
 * Google Ads API — keyword click reports for CRM funnel dashboard.
 * Uses REST searchStream (keyword_view + metrics.clicks).
 */
const { google } = require("googleapis");
const { getGa4OAuthClientConfig } = require("./ga4-oauth-config");

const ADWORDS_SCOPE = "https://www.googleapis.com/auth/adwords";
const API_VERSION = String(process.env.GOOGLE_ADS_API_VERSION || "v24").trim();

function normalizeCustomerId(raw) {
  return String(raw || "")
    .trim()
    .replace(/-/g, "");
}

function googleAdsConfig() {
  const developerToken = String(process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "").trim();
  const customerId = normalizeCustomerId(process.env.GOOGLE_ADS_CUSTOMER_ID);
  const loginCustomerId = normalizeCustomerId(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID);
  const refreshToken = String(
    process.env.GOOGLE_ADS_REFRESH_TOKEN || process.env.GA4_REFRESH_TOKEN || ""
  ).trim();
  const { clientId, clientSecret } = getGa4OAuthClientConfig();

  return {
    developerToken,
    customerId,
    loginCustomerId,
    refreshToken,
    clientId,
    clientSecret,
    configured: !!(developerToken && customerId && refreshToken && clientId && clientSecret),
  };
}

function googleAdsSetupHint() {
  return (
    "Keyword clicks come from the Google Ads API (not GA4 impressions). " +
    "Set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, and GOOGLE_ADS_REFRESH_TOKEN " +
    "(open /api/staff/google-ads-auth once while signed in to Google Ads)."
  );
}

function googleAdsConfigStatus() {
  const cfg = googleAdsConfig();
  if (cfg.configured) return { configured: true };
  const missing = [];
  if (!cfg.developerToken) missing.push("GOOGLE_ADS_DEVELOPER_TOKEN");
  if (!cfg.customerId) missing.push("GOOGLE_ADS_CUSTOMER_ID");
  if (!cfg.refreshToken) missing.push("GOOGLE_ADS_REFRESH_TOKEN");
  if (!cfg.clientId) missing.push("GA4_OAUTH_CLIENT_ID or GMAIL_CLIENT_ID");
  if (!cfg.clientSecret) missing.push("GA4_OAUTH_CLIENT_SECRET or GMAIL_CLIENT_SECRET");
  return {
    configured: false,
    reason: googleAdsSetupHint(),
    missing,
  };
}

function getOAuthRedirectUri() {
  const fromEnv = String(process.env.GOOGLE_ADS_OAUTH_REDIRECT_URI || "").trim();
  if (fromEnv) return fromEnv;
  return "https://www.mejorvidainsurance.com/api/staff/google-ads-callback";
}

async function getAccessToken() {
  const cfg = googleAdsConfig();
  if (!cfg.configured) {
    throw new Error("Google Ads API is not configured");
  }

  const oauth2Client = new google.auth.OAuth2(cfg.clientId, cfg.clientSecret, getOAuthRedirectUri());
  oauth2Client.setCredentials({ refresh_token: cfg.refreshToken });
  const tokenRes = await oauth2Client.getAccessToken();
  const token = typeof tokenRes === "string" ? tokenRes : tokenRes && tokenRes.token;
  if (!token) throw new Error("Could not refresh Google Ads access token");
  return token;
}

function parseGoogleAdsError(bodyText, body) {
  const tryExtract = (obj) => {
    const err = obj && obj.error;
    const gaErr =
      err &&
      err.details &&
      err.details[0] &&
      err.details[0].errors &&
      err.details[0].errors[0];
    if (!gaErr) return null;
    const code =
      gaErr.errorCode &&
      (gaErr.errorCode.authorizationError ||
        gaErr.errorCode.authenticationError ||
        gaErr.errorCode.requestError);
    if (code === "DEVELOPER_TOKEN_NOT_APPROVED") {
      return (
        "Google Ads developer token is not approved for production yet (Test Account Access only). " +
        "Apply for Basic Access in Google Ads → Admin → API center, then retry in a few days."
      );
    }
    if (code === "CUSTOMER_NOT_FOUND") {
      return (
        "Google Ads customer ID not found for this OAuth user. " +
        "Set GOOGLE_ADS_CUSTOMER_ID to your linked ad account (not the manager ID). " +
        "Run: node scripts/google-ads-discover.js"
      );
    }
    if (code === "USER_PERMISSION_DENIED") {
      return (
        "OAuth user cannot access this ad account. " +
        "Set GOOGLE_ADS_LOGIN_CUSTOMER_ID to your manager account ID when querying a sub-account."
      );
    }
    return gaErr.message || null;
  };

  if (Array.isArray(body)) {
    for (const chunk of body) {
      const msg = tryExtract(chunk);
      if (msg) return msg;
    }
  }
  const msg = tryExtract(body);
  if (msg) return msg;
  if (body && body.error && body.error.message) return body.error.message;
  return (bodyText || "").slice(0, 300) || "Google Ads API request failed";
}

function parseKeywordFromRow(row) {
  const criterion = row.adGroupCriterion || row.ad_group_criterion || {};
  const keyword = criterion.keyword || {};
  return String(keyword.text || "").trim();
}

function parseClicksFromRow(row) {
  const metrics = row.metrics || {};
  return Number(metrics.clicks) || 0;
}

function aggregateKeywordClicks(rows) {
  const byKeyword = new Map();
  (rows || []).forEach((row) => {
    const text = parseKeywordFromRow(row);
    if (!text) return;
    const clicks = parseClicksFromRow(row);
    if (clicks <= 0) return;
    byKeyword.set(text, (byKeyword.get(text) || 0) + clicks);
  });

  return [...byKeyword.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));
}

async function runGaqlQuery(gaql) {
  const cfg = googleAdsConfig();
  const accessToken = await getAccessToken();
  const url = `https://googleads.googleapis.com/${API_VERSION}/customers/${cfg.customerId}/googleAds:searchStream`;

  async function attempt(includeLoginCustomerId) {
    const headers = {
      Authorization: "Bearer " + accessToken,
      "developer-token": cfg.developerToken,
      "Content-Type": "application/json",
    };
    if (includeLoginCustomerId && cfg.loginCustomerId && cfg.loginCustomerId !== cfg.customerId) {
      headers["login-customer-id"] = cfg.loginCustomerId;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: gaql }),
    });

    const bodyText = await res.text();
    let body;
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch (e) {
      body = { raw: bodyText };
    }

    return { res, body, bodyText };
  }

  let { res, body, bodyText } = await attempt(true);
  if (!res.ok) {
    const errMsg = parseGoogleAdsError(bodyText, body) || "";
    const permissionDenied =
      res.status === 403 ||
      /permission|USER_PERMISSION_DENIED|PERMISSION_DENIED/i.test(errMsg);
    if (permissionDenied && cfg.loginCustomerId) {
      ({ res, body, bodyText } = await attempt(false));
    }
  }

  if (!res.ok) {
    throw new Error(parseGoogleAdsError(bodyText, body) || `Google Ads API ${res.status}`);
  }

  const rows = [];
  const chunks = Array.isArray(body) ? body : [body];
  chunks.forEach((chunk) => {
    (chunk.results || []).forEach((row) => rows.push(row));
  });
  return rows;
}

/**
 * Top keywords ranked by Google Ads clicks (keyword_view) for a date range.
 */
async function fetchTopKeywordsByClicks(dateFrom, dateTo, limit) {
  const status = googleAdsConfigStatus();
  if (!status.configured) {
    return {
      configured: false,
      setupHint: status.reason,
      keywords: [],
    };
  }

  const gaql =
    "SELECT ad_group_criterion.keyword.text, metrics.clicks " +
    "FROM keyword_view " +
    "WHERE segments.date BETWEEN '" +
    dateFrom +
    "' AND '" +
    dateTo +
    "' " +
    "AND metrics.clicks > 0";

  try {
    const rows = await runGaqlQuery(gaql);
    const keywords = aggregateKeywordClicks(rows).slice(0, limit || 10);
    return {
      configured: true,
      source: "google_ads_api",
      keywords,
    };
  } catch (e) {
    return {
      configured: true,
      source: "google_ads_api",
      keywords: [],
      error: e.message || String(e),
    };
  }
}

module.exports = {
  googleAdsConfig,
  googleAdsConfigStatus,
  googleAdsSetupHint,
  getOAuthRedirectUri,
  fetchTopKeywordsByClicks,
  ADWORDS_SCOPE,
};
