/**
 * Google Ads API — keyword click reports for CRM funnel dashboard.
 * Uses REST searchStream (keyword_view + metrics.clicks).
 */
const { google } = require("./google-clients");
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
    "Google Ads impressions, clicks, and cost come from the Google Ads API. " +
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

function microsToUsd(micros) {
  const n = Number(micros);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round((n / 1e6) * 100) / 100;
}

function parseAccountMetricsRow(row) {
  const metrics = row.metrics || {};
  const cost = metrics.costMicros != null ? metrics.costMicros : metrics.cost_micros;
  const dateRaw = (row.segments && (row.segments.date || row.segments.Date)) || "";
  return {
    date: String(dateRaw).slice(0, 10),
    impressions: Number(metrics.impressions) || 0,
    clicks: Number(metrics.clicks) || 0,
    spend: microsToUsd(cost),
  };
}

function sumAccountMetricRows(rows) {
  const totals = (rows || []).reduce(
    (acc, row) => {
      const m = parseAccountMetricsRow(row);
      acc.impressions += m.impressions;
      acc.clicks += m.clicks;
      acc.spend += m.spend;
      return acc;
    },
    { impressions: 0, clicks: 0, spend: 0 }
  );
  totals.spend = Math.round(totals.spend * 100) / 100;
  return totals;
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

/**
 * Account-level impressions, clicks, and cost for a date range (matches Ads UI totals).
 */
async function fetchAccountMetrics(dateFrom, dateTo) {
  const status = googleAdsConfigStatus();
  if (!status.configured) {
    return {
      configured: false,
      setupHint: status.reason,
      impressions: null,
      clicks: null,
      spend: null,
    };
  }

  const gaql =
    "SELECT metrics.impressions, metrics.clicks, metrics.cost_micros " +
    "FROM customer " +
    "WHERE segments.date BETWEEN '" +
    dateFrom +
    "' AND '" +
    dateTo +
    "'";

  try {
    const rows = await runGaqlQuery(gaql);
    return {
      configured: true,
      source: "google_ads_api",
      ...sumAccountMetricRows(rows),
    };
  } catch (e) {
    return {
      configured: true,
      source: "google_ads_api",
      impressions: null,
      clicks: null,
      spend: null,
      error: e.message || String(e),
    };
  }
}

/**
 * Daily account-level impressions, clicks, and cost.
 */
async function fetchAccountDaily(dateFrom, dateTo) {
  const status = googleAdsConfigStatus();
  if (!status.configured) {
    return {
      configured: false,
      setupHint: status.reason,
      daily: [],
    };
  }

  const gaql =
    "SELECT segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros " +
    "FROM customer " +
    "WHERE segments.date BETWEEN '" +
    dateFrom +
    "' AND '" +
    dateTo +
    "'";

  try {
    const rows = await runGaqlQuery(gaql);
    const daily = rows
      .map(parseAccountMetricsRow)
      .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date));
    return {
      configured: true,
      source: "google_ads_api",
      daily,
    };
  } catch (e) {
    return {
      configured: true,
      source: "google_ads_api",
      daily: [],
      error: e.message || String(e),
    };
  }
}

function extractGeoTargetId(resource) {
  const s = String(resource || "").trim();
  if (!s) return "";
  const m =
    s.match(/geoTargetConstants\/(\d+)/i) ||
    s.match(/geographicViews\/(\d+)/i) ||
    s.match(/^(\d+)$/);
  return m ? m[1] : "";
}

function metricNumber(row, field) {
  const metrics = row && row.metrics ? row.metrics : {};
  const raw = metrics[field];
  if (raw == null) return 0;
  return Number(raw) || 0;
}

async function resolveGeoTargetNames(ids) {
  const unique = [...new Set((ids || []).map(String).filter(Boolean))];
  const names = {};
  const FALLBACK = {
    2840: "United States",
    21138: "Colorado",
    21149: "Kansas",
    21162: "Nebraska",
    21166: "Nevada",
  };
  unique.forEach((id) => {
    if (FALLBACK[id]) names[id] = FALLBACK[id];
  });
  const missing = unique.filter((id) => !names[id]);
  const batchSize = 40;
  for (let i = 0; i < missing.length; i += batchSize) {
    const batch = missing.slice(i, i + batchSize);
    const gaql =
      "SELECT geo_target_constant.id, geo_target_constant.name, geo_target_constant.canonical_name " +
      "FROM geo_target_constant WHERE geo_target_constant.id IN (" +
      batch.map((id) => "'" + id + "'").join(",") +
      ")";
    try {
      const rows = await runGaqlQuery(gaql);
      rows.forEach((row) => {
        const g = row.geoTargetConstant || row.geo_target_constant || {};
        const id = String(g.id || extractGeoTargetId(g.resourceName || g.resource_name) || "");
        const name = String(g.name || g.canonicalName || g.canonical_name || "").trim();
        if (id && name) names[id] = name;
      });
    } catch (e) {
      /* keep fallback / unresolved ids */
    }
  }
  unique.forEach((id) => {
    if (!names[id]) names[id] = "Location " + id;
  });
  return names;
}

function aggregateGeoRows(rows, idFromRow) {
  const byId = new Map();
  (rows || []).forEach((row) => {
    const id = idFromRow(row);
    if (!id) return;
    if (!byId.has(id)) byId.set(id, { clicks: 0, impressions: 0 });
    const cur = byId.get(id);
    cur.clicks += metricNumber(row, "clicks");
    cur.impressions += metricNumber(row, "impressions");
  });
  return byId;
}

/**
 * Clicks by where the user was (location of presence). Prefers U.S. state; falls back to country.
 */
async function fetchClicksByLocation(dateFrom, dateTo) {
  const status = googleAdsConfigStatus();
  if (!status.configured) {
    return {
      configured: false,
      setupHint: status.reason,
      grain: "state",
      locations: [],
    };
  }

  const dateClause =
    "AND segments.date BETWEEN '" + dateFrom + "' AND '" + dateTo + "'";

  try {
    const stateGaql =
      "SELECT segments.geo_target_state, metrics.clicks, metrics.impressions " +
      "FROM geographic_view " +
      "WHERE geographic_view.location_type = LOCATION_OF_PRESENCE " +
      dateClause;

    const stateRows = await runGaqlQuery(stateGaql);
    const byState = aggregateGeoRows(stateRows, (row) => {
      const seg = row.segments || {};
      return extractGeoTargetId(seg.geoTargetState || seg.geo_target_state);
    });

    if (byState.size) {
      const ids = [...byState.keys()];
      const names = await resolveGeoTargetNames(ids);
      const locations = ids
        .map((id) => {
          const m = byState.get(id);
          return {
            name: names[id] || "Location " + id,
            clicks: m.clicks,
            impressions: m.impressions,
          };
        })
        .sort((a, b) => b.clicks - a.clicks || a.name.localeCompare(b.name));
      return {
        configured: true,
        grain: "state",
        platform: "google",
        locations,
      };
    }
  } catch (e) {
    /* fall through to country */
  }

  try {
    const countryGaql =
      "SELECT geographic_view.country_criterion_id, metrics.clicks, metrics.impressions " +
      "FROM geographic_view " +
      "WHERE geographic_view.location_type = LOCATION_OF_PRESENCE " +
      dateClause;
    const countryRows = await runGaqlQuery(countryGaql);
    const byCountry = aggregateGeoRows(countryRows, (row) => {
      const view = row.geographicView || row.geographic_view || {};
      return extractGeoTargetId(
        view.countryCriterionId ||
          view.country_criterion_id ||
          view.resourceName ||
          view.resource_name ||
          ""
      );
    });
    const ids = [...byCountry.keys()];
    const names = await resolveGeoTargetNames(ids);
    const locations = ids
      .map((id) => {
        const m = byCountry.get(id);
        return {
          name: names[id] || "Location " + id,
          clicks: m.clicks,
          impressions: m.impressions,
        };
      })
      .sort((a, b) => b.clicks - a.clicks || a.name.localeCompare(b.name));
    return {
      configured: true,
      grain: "country",
      platform: "google",
      locations,
    };
  } catch (e) {
    return {
      configured: true,
      grain: "state",
      platform: "google",
      locations: [],
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
  fetchAccountMetrics,
  fetchAccountDaily,
  fetchClicksByLocation,
  runGaqlQuery,
  ADWORDS_SCOPE,
};
