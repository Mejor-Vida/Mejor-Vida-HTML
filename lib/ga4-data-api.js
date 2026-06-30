/**
 * Google Analytics 4 Data API client.
 * Requires service account with Analytics Viewer on the GA4 property.
 *
 * Env:
 *   GA4_PROPERTY_ID — numeric property ID (not G- measurement ID)
 *   GA4_SERVICE_ACCOUNT_JSON — inline JSON credentials, OR
 *   GOOGLE_APPLICATION_CREDENTIALS — path to service account JSON file
 *   GOOGLE_SHEETS_CREDENTIALS — path or inline JSON (reuses existing Sheets key)
 *   GA4_REFRESH_TOKEN — OAuth refresh token (use when service account keys are blocked)
 *   GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET — OAuth client for GA4_REFRESH_TOKEN flow
 */

const { google } = require("googleapis");
const fs = require("fs");
const { allEventNames, LANDING_PATH_PATTERNS } = require("./ga4-funnel-config");
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

function landingPathFilter() {
  return {
    orGroup: {
      expressions: LANDING_PATH_PATTERNS.map((pat) => ({
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "CONTAINS", value: pat },
        },
      })),
    },
  };
}

function websitePathFilter() {
  return {
    notExpression: landingPathFilter(),
  };
}

function pathFilterForFunnel(funnelKey) {
  return funnelKey === "landing" ? landingPathFilter() : websitePathFilter();
}

function eventNameFilter(eventNames) {
  return {
    filter: {
      fieldName: "eventName",
      inListFilter: { values: eventNames },
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

/**
 * Fetch event counts for a funnel (filtered by page path group).
 */
async function fetchFunnelEventCounts(funnelKey, startDate, endDate) {
  const { analyticsData, propertyId } = await getAnalyticsClient();
  const eventNames = allEventNames();

  const data = await runReport(analyticsData, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: combineFilters([eventNameFilter(eventNames), pathFilterForFunnel(funnelKey)]),
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
 * Daily trend for a single event in a funnel.
 */
async function fetchEventDailyTrend(funnelKey, eventName, startDate, endDate) {
  const { analyticsData, propertyId } = await getAnalyticsClient();

  const data = await runReport(analyticsData, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: combineFilters([
      { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: eventName } } },
      pathFilterForFunnel(funnelKey),
    ]),
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

/**
 * Landing step breakdown via customEvent:step_name on step_viewed events.
 */
async function fetchLandingStepBreakdown(startDate, endDate) {
  const { analyticsData, propertyId } = await getAnalyticsClient();

  try {
    const data = await runReport(analyticsData, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "customEvent:step_name" }],
      metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
      dimensionFilter: combineFilters([
        { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "step_viewed" } } },
        landingPathFilter(),
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

/**
 * Top page paths for an event within a funnel.
 */
async function fetchTopPagesForEvent(funnelKey, eventName, startDate, endDate, limit) {
  const { analyticsData, propertyId } = await getAnalyticsClient();

  const data = await runReport(analyticsData, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: combineFilters([
      { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: eventName } } },
      pathFilterForFunnel(funnelKey),
    ]),
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: limit || 10,
  });

  return (data.rows || []).map((row) => {
    const dims = parseDimensionRow(row, data.dimensionHeaders);
    const metrics = parseMetricRow(row, data.metricHeaders);
    return { pagePath: dims.pagePath, count: metrics.eventCount || 0 };
  });
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
  fetchFunnelEventCounts,
  fetchEventDailyTrend,
  fetchLandingStepBreakdown,
  fetchTopPagesForEvent,
  isConfigured,
  credentialsStatus,
  getPropertyId,
  getOAuthRedirectUri,
  hasOAuthCredentials,
};
