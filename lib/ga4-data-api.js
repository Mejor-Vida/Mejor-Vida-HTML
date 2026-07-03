/**
 * Google Analytics 4 Data API client.
 */

const { google } = require("googleapis");
const fs = require("fs");
const {
  LANDING_PATH_PATTERNS,
  FACEBOOK_LANDING_PATH_PATTERNS,
  FUNNEL_KEYS,
} = require("./ga4-funnel-config");
const { getGa4OAuthClientConfig, hasGa4OAuthClientConfig } = require("./ga4-oauth-config");

const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function loadCredentials() {
  const inline = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (inline && inline.trim()) {
    try {
      return JSON.parse(inline);
    } catch (e) {
      throw new Error("GA4_SERVICE_ACCOUNT_JSON is not valid JSON");
    }
  }

  const pathCandidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    process.env.GOOGLE_SHEETS_CREDENTIALS,
  ].filter(Boolean);
  for (const raw of pathCandidates) {
    const trimmed = String(raw).trim();
    if (!trimmed) continue;
    if (trimmed.charAt(0) === "{") {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        throw new Error("Inline Google credentials env is not valid JSON");
      }
    }
    if (!fs.existsSync(trimmed)) {
      continue;
    }
    return trimmed;
  }
  return null;
}

function hasOAuthCredentials() {
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  return !!(
    String(process.env.GA4_REFRESH_TOKEN || "").trim() &&
    clientId &&
    clientSecret
  );
}

function getOAuthRedirectUri() {
  const fromEnv = String(process.env.GA4_OAUTH_REDIRECT_URI || "").trim();
  if (fromEnv) return fromEnv;
  return "https://www.mejorvidainsurance.com/api/staff/ga4-callback";
}

async function getOAuthAuthClient() {
  if (!hasOAuthCredentials()) return null;
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getOAuthRedirectUri()
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GA4_REFRESH_TOKEN });
  return oauth2Client;
}

function getPropertyId() {
  const raw = String(process.env.GA4_PROPERTY_ID || "").trim();
  if (!raw) return null;
  return raw.replace(/^properties\//, "");
}

async function getAnalyticsClient() {
  const propertyId = getPropertyId();
  if (!propertyId) throw new Error("Missing GA4_PROPERTY_ID");

  const oauthClient = await getOAuthAuthClient();
  if (oauthClient) {
    const analyticsData = google.analyticsdata({ version: "v1beta", auth: oauthClient });
    return { analyticsData, propertyId };
  }

  const creds = loadCredentials();
  if (!creds) {
    throw new Error(
      "Missing GA4 credentials — add GA4_REFRESH_TOKEN (OAuth) or a service account JSON file"
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: typeof creds === "string" ? undefined : creds,
    keyFile: typeof creds === "string" ? creds : undefined,
    scopes: [ANALYTICS_SCOPE],
  });
  const authClient = await auth.getClient();
  const analyticsData = google.analyticsdata({ version: "v1beta", auth: authClient });
  return { analyticsData, propertyId };
}

function pathPatternsFilter(patterns) {
  return {
    orGroup: {
      expressions: patterns.map((pat) => ({
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "CONTAINS", value: pat },
        },
      })),
    },
  };
}

function landingPathFilter() {
  return pathPatternsFilter(LANDING_PATH_PATTERNS);
}

function facebookLandingPathFilter() {
  return pathPatternsFilter(FACEBOOK_LANDING_PATH_PATTERNS);
}

function websitePathFilter() {
  return {
    notExpression: landingPathFilter(),
  };
}

function facebookSourceFilter() {
  const sources = ["facebook", "fb", "instagram", "meta"];
  return {
    orGroup: {
      expressions: sources.map((src) => ({
        filter: {
          fieldName: "sessionSource",
          stringFilter: { matchType: "CONTAINS", value: src, caseSensitive: false },
        },
      })),
    },
  };
}

function pathFilterForFunnelKey(funnelKey) {
  if (funnelKey === FUNNEL_KEYS.LANDING_FACEBOOK || funnelKey === "landing_facebook") {
    return facebookLandingPathFilter();
  }
  if (
    funnelKey === FUNNEL_KEYS.LANDING_GA4 ||
    funnelKey === "landing" ||
    funnelKey === "landing_ga4"
  ) {
    return landingPathFilter();
  }
  return websitePathFilter();
}

/** @deprecated */
function pathFilterForFunnel(funnelKey) {
  return pathFilterForFunnelKey(funnelKey === "landing" ? FUNNEL_KEYS.LANDING_GA4 : funnelKey);
}

function sourceFilterForFunnelKey(funnelKey) {
  if (funnelKey === FUNNEL_KEYS.LANDING_FACEBOOK || funnelKey === "landing_facebook") {
    return facebookSourceFilter();
  }
  return null;
}

function eventNameFilter(eventNames) {
  return {
    filter: {
      fieldName: "eventName",
      inListFilter: { values: eventNames },
    },
  };
}

function exactEventFilter(eventName) {
  return {
    filter: {
      fieldName: "eventName",
      stringFilter: { matchType: "EXACT", value: eventName },
    },
  };
}

function paramFilterExpression(paramFilter) {
  if (!paramFilter || typeof paramFilter !== "object") return null;
  const entries = Object.entries(paramFilter).filter(([, v]) => v != null && String(v).length);
  if (!entries.length) return null;
  const expressions = entries.map(([key, value]) => ({
    filter: {
      fieldName: `customEvent:${key}`,
      stringFilter: { matchType: "EXACT", value: String(value) },
    },
  }));
  if (expressions.length === 1) return expressions[0];
  return { andGroup: { expressions } };
}

function stepNameFilter(stepName) {
  if (!stepName) return null;
  return {
    filter: {
      fieldName: "customEvent:step_name",
      stringFilter: { matchType: "EXACT", value: String(stepName) },
    },
  };
}

function combineFilters(expressions) {
  const valid = expressions.filter(Boolean);
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0];
  return { andGroup: { expressions: valid } };
}

async function runReport(analyticsData, propertyId, body) {
  const res = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: body,
  });
  return res.data || {};
}

function parseMetricRow(row, metricHeaders) {
  const out = {};
  (metricHeaders || []).forEach((h, i) => {
    const val = row.metricValues && row.metricValues[i] ? row.metricValues[i].value : "0";
    out[h.name] = Number(val) || 0;
  });
  return out;
}

function parseDimensionRow(row, dimensionHeaders) {
  const out = {};
  (dimensionHeaders || []).forEach((h, i) => {
    out[h.name] = row.dimensionValues && row.dimensionValues[i] ? row.dimensionValues[i].value : "";
  });
  return out;
}

function buildReportFilters(funnelKey, eventName, options) {
  options = options || {};
  return combineFilters([
    exactEventFilter(eventName),
    pathFilterForFunnelKey(funnelKey),
    sourceFilterForFunnelKey(funnelKey),
    stepNameFilter(options.stepName),
    paramFilterExpression(options.paramFilter),
  ]);
}

/**
 * Fetch all event counts for website paths (individual events, not funnel).
 */
async function fetchWebsiteEventCounts(startDate, endDate) {
  const { analyticsData, propertyId } = await getAnalyticsClient();

  const data = await runReport(analyticsData, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: websitePathFilter(),
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 100,
  });

  const counts = {};
  (data.rows || []).forEach((row) => {
    const dims = parseDimensionRow(row, data.dimensionHeaders);
    const metrics = parseMetricRow(row, data.metricHeaders);
    counts[dims.eventName] = {
      eventCount: metrics.eventCount || 0,
      totalUsers: metrics.totalUsers || 0,
    };
  });
  return counts;
}

/**
 * Fetch counts for a single event (+ optional step_name / custom params).
 */
async function fetchSingleEventStats(funnelKey, eventName, startDate, endDate, options) {
  options = options || {};
  const { analyticsData, propertyId } = await getAnalyticsClient();

  const data = await runReport(analyticsData, propertyId, {
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: buildReportFilters(funnelKey, eventName, options),
  });

  if (!data.rows || !data.rows.length) {
    return { eventCount: 0, totalUsers: 0 };
  }
  const metrics = parseMetricRow(data.rows[0], data.metricHeaders);
  return {
    eventCount: metrics.eventCount || 0,
    totalUsers: metrics.totalUsers || 0,
  };
}

/**
 * step_viewed breakdown by customEvent:step_name on landing paths.
 */
async function fetchLandingStepBreakdown(funnelKey, startDate, endDate) {
  const { analyticsData, propertyId } = await getAnalyticsClient();
  const key = funnelKey || FUNNEL_KEYS.LANDING_GA4;

  try {
    const data = await runReport(analyticsData, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "customEvent:step_name" }],
      metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
      dimensionFilter: combineFilters([
        exactEventFilter("step_viewed"),
        pathFilterForFunnelKey(key),
        sourceFilterForFunnelKey(key),
      ]),
    });

    const breakdown = {};
    (data.rows || []).forEach((row) => {
      const dims = parseDimensionRow(row, data.dimensionHeaders);
      const metrics = parseMetricRow(row, data.metricHeaders);
      const stepName = dims["customEvent:step_name"] || "(not set)";
      breakdown[stepName] = {
        count: metrics.eventCount || 0,
        users: metrics.totalUsers || 0,
      };
    });
    return breakdown;
  } catch (e) {
    console.warn("[ga4-data-api] step_name breakdown unavailable:", e.message);
    return {};
  }
}

/** @deprecated */
async function fetchFunnelEventCounts(funnelKey, startDate, endDate) {
  if (funnelKey === "website" || funnelKey === FUNNEL_KEYS.WEBSITE_EVENTS) {
    return fetchWebsiteEventCounts(startDate, endDate);
  }
  const stepBreakdown = await fetchLandingStepBreakdown(funnelKey, startDate, endDate);
  const counts = {};
  Object.keys(stepBreakdown).forEach((stepName) => {
    counts[`step_viewed:${stepName}`] = {
      eventCount: stepBreakdown[stepName].count,
      totalUsers: stepBreakdown[stepName].users,
    };
  });
  return counts;
}

async function fetchEventDailyTrend(funnelKey, eventName, startDate, endDate, options) {
  options = options || {};
  const { analyticsData, propertyId } = await getAnalyticsClient();

  const data = await runReport(analyticsData, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: buildReportFilters(funnelKey, eventName, options),
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  return (data.rows || []).map((row) => {
    const dims = parseDimensionRow(row, data.dimensionHeaders);
    const metrics = parseMetricRow(row, data.metricHeaders);
    return {
      date: dims.date,
      count: metrics.eventCount || 0,
      users: metrics.totalUsers || 0,
    };
  });
}

async function fetchTopPagesForEvent(funnelKey, eventName, startDate, endDate, limit, options) {
  options = options || {};
  const { analyticsData, propertyId } = await getAnalyticsClient();

  const data = await runReport(analyticsData, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: buildReportFilters(funnelKey, eventName, options),
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: limit || 10,
  });

  return (data.rows || []).map((row) => {
    const dims = parseDimensionRow(row, data.dimensionHeaders);
    const metrics = parseMetricRow(row, data.metricHeaders);
    return { pagePath: dims.pagePath, count: metrics.eventCount || 0 };
  });
}

/**
 * Totals from GA4 linked Google Ads (advertiserAd* metrics).
 * GA4 requires an ad-compatible dimension (e.g. sessionCampaignName) with these metrics.
 */
async function fetchLinkedGoogleAdsTotals(startDate, endDate) {
  const { analyticsData, propertyId } = await getAnalyticsClient();

  const metricDefs = [
    { name: "advertiserAdImpressions" },
    { name: "advertiserAdClicks" },
    { name: "advertiserAdCost" },
  ];

  const dimensionAttempts = [
    [{ name: "sessionCampaignName" }],
    [{ name: "googleAdsAccountName" }],
    [{ name: "sessionCampaignName" }, { name: "date" }],
  ];

  let lastError = null;
  for (const dimensions of dimensionAttempts) {
    try {
      const data = await runReport(analyticsData, propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions,
        metrics: metricDefs,
        limit: 10000,
      });

      let impressions = 0;
      let clicks = 0;
      let spend = 0;
      (data.rows || []).forEach((row) => {
        const metrics = parseMetricRow(row, data.metricHeaders);
        impressions += metrics.advertiserAdImpressions || 0;
        clicks += metrics.advertiserAdClicks || 0;
        spend += metrics.advertiserAdCost || 0;
      });
      return { impressions, clicks, spend };
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("Could not fetch Google Ads metrics from GA4");
}

function isConfigured() {
  if (!getPropertyId()) return false;
  if (hasOAuthCredentials()) return true;
  try {
    return !!loadCredentials();
  } catch (e) {
    return false;
  }
}

function credentialsStatus() {
  if (!getPropertyId()) return { ok: false, reason: "Missing GA4_PROPERTY_ID" };
  if (hasOAuthCredentials()) return { ok: true, mode: "oauth" };
  try {
    const creds = loadCredentials();
    if (creds) return { ok: true, mode: "service_account" };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
  if (hasGa4OAuthClientConfig()) {
    return {
      ok: false,
      reason: "Click Connect with Google (OAuth) below to authorize GA4 access.",
    };
  }
  return {
    ok: false,
    reason: "No GA4 credentials — use OAuth at /api/staff/ga4-auth or add a service account JSON",
  };
}

module.exports = {
  getAnalyticsClient,
  fetchWebsiteEventCounts,
  fetchSingleEventStats,
  fetchLandingStepBreakdown,
  fetchFunnelEventCounts,
  fetchEventDailyTrend,
  fetchTopPagesForEvent,
  fetchLinkedGoogleAdsTotals,
  pathFilterForFunnelKey,
  pathFilterForFunnel,
  sourceFilterForFunnelKey,
  isConfigured,
  credentialsStatus,
  getPropertyId,
  getOAuthRedirectUri,
  hasOAuthCredentials,
};
