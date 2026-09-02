/**
 * Google Search Console Search Analytics API (organic search performance).
 * OAuth: GSC_REFRESH_TOKEN + same client as GA4 (GA4_OAUTH_CLIENT_ID/SECRET or GMAIL_*).
 */
const { google } = require("./google-clients");
const { getGa4OAuthClientConfig } = require("./ga4-oauth-config");

const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_SITE_URL = "sc-domain:mejorvidainsurance.com";

function getSiteUrl() {
  const raw = String(process.env.GSC_SITE_URL || DEFAULT_SITE_URL).trim();
  if (!raw) return DEFAULT_SITE_URL;
  if (raw.startsWith("sc-domain:")) return raw;
  return raw.endsWith("/") ? raw : raw + "/";
}

function getOAuthRedirectUri() {
  const fromEnv = String(process.env.GSC_OAUTH_REDIRECT_URI || "").trim();
  if (fromEnv) return fromEnv;
  return "https://www.mejorvidainsurance.com/api/staff/gsc-callback";
}

function hasGscOAuthCredentials() {
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  return !!(
    String(process.env.GSC_REFRESH_TOKEN || "").trim() &&
    clientId &&
    clientSecret
  );
}

function gscSetupHint() {
  return (
    "Connect Google Search Console: enable Search Console API in Google Cloud, " +
    "open /api/staff/gsc-auth once, set GSC_REFRESH_TOKEN and GSC_SITE_URL in Vercel."
  );
}

async function getGscAuthClient() {
  if (!hasGscOAuthCredentials()) return null;
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, getOAuthRedirectUri());
  oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });
  return oauth2Client;
}

async function querySearchAnalytics(startDate, endDate, requestBody) {
  const auth = await getGscAuthClient();
  if (!auth) {
    const err = new Error("GSC not configured");
    err.code = "GSC_NOT_CONFIGURED";
    throw err;
  }
  const searchconsole = google.searchconsole({ version: "v1", auth });
  const res = await searchconsole.searchanalytics.query({
    siteUrl: getSiteUrl(),
    requestBody: {
      startDate,
      endDate,
      searchType: "web",
      // Include fresh/partial data for recent dates (GSC UI "last 24h" uses this; default API is final-only).
      dataState: "all",
      ...requestBody,
    },
  });
  return res.data || {};
}

function aggregateRows(rows) {
  let clicks = 0;
  let impressions = 0;
  let positionWeighted = 0;
  (rows || []).forEach((row) => {
    const c = Number(row.clicks) || 0;
    const i = Number(row.impressions) || 0;
    clicks += c;
    impressions += i;
    positionWeighted += (Number(row.position) || 0) * i;
  });
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const position = impressions > 0 ? positionWeighted / impressions : null;
  return { clicks, impressions, ctr, position };
}

function mapQueryRows(rows, limit) {
  return (rows || [])
    .slice(0, limit)
    .map((row) => ({
      query: (row.keys && row.keys[0]) || "",
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      ctr: Number(row.ctr) || 0,
      position: Number(row.position) || 0,
    }))
    .filter((r) => r.query);
}

function mapPageRows(rows, limit) {
  return (rows || [])
    .slice(0, limit)
    .map((row) => {
      const page = (row.keys && row.keys[0]) || "";
      let path = page;
      try {
        const u = new URL(page);
        path = u.pathname || page;
      } catch (e) {
        /* keep raw */
      }
      return {
        page,
        path,
        clicks: Number(row.clicks) || 0,
        impressions: Number(row.impressions) || 0,
        ctr: Number(row.ctr) || 0,
        position: Number(row.position) || 0,
      };
    })
    .filter((r) => r.page);
}

function mapDailyRows(rows, dateFrom, dateTo) {
  const map = new Map();
  (rows || []).forEach((row) => {
    const raw = (row.keys && row.keys[0]) || "";
    const date =
      raw.length === 8 && /^\d{8}$/.test(raw)
        ? raw.slice(0, 4) + "-" + raw.slice(4, 6) + "-" + raw.slice(6, 8)
        : raw.slice(0, 10);
    if (!date) return;
    map.set(date, {
      date,
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
    });
  });

  const out = [];
  let cur = dateFrom;
  while (cur <= dateTo) {
    const row = map.get(cur) || { date: cur, clicks: 0, impressions: 0 };
    out.push({
      date: cur,
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
    });
    cur = addDaysYmd(cur, 1);
  }
  return out;
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return t.toISOString().slice(0, 10);
}

async function fetchGscOrganicSearch(dateFrom, dateTo) {
  if (!hasGscOAuthCredentials()) {
    return {
      show: true,
      source: "gsc",
      configured: false,
      setupHint: gscSetupHint(),
      oauthAuthUrl: "/api/staff/gsc-auth",
    };
  }

  try {
    const [totalsData, queryData, pageData, dailyMetaData] = await Promise.all([
      querySearchAnalytics(dateFrom, dateTo, { rowLimit: 1 }),
      querySearchAnalytics(dateFrom, dateTo, {
        dimensions: ["query"],
        rowLimit: 15,
      }),
      querySearchAnalytics(dateFrom, dateTo, {
        dimensions: ["page"],
        rowLimit: 10,
      }),
      querySearchAnalytics(dateFrom, dateTo, {
        dimensions: ["date"],
        rowLimit: 1,
      }),
    ]);

    const totals = aggregateRows(totalsData.rows);
    return {
      show: true,
      source: "gsc",
      configured: true,
      dateFrom,
      dateTo,
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: totals.ctr,
      position: totals.position,
      firstIncompleteDate:
        (dailyMetaData.metadata && dailyMetaData.metadata.first_incomplete_date) || null,
      topQueries: mapQueryRows(queryData.rows, 10),
      topPages: mapPageRows(pageData.rows, 10),
    };
  } catch (e) {
    return {
      show: true,
      source: "gsc",
      configured: true,
      clicks: null,
      impressions: null,
      ctr: null,
      position: null,
      error: e.message || String(e),
      setupHint: /403|403|permission|forbidden/i.test(String(e.message))
        ? "Confirm GSC_SITE_URL matches your Search Console property and the OAuth user has access."
        : undefined,
    };
  }
}

const ISO3_COUNTRY_NAMES = {
  irn: "Iran",
  usa: "United States",
  mex: "Mexico",
  can: "Canada",
  col: "Colombia",
  ven: "Venezuela",
  per: "Peru",
  ecu: "Ecuador",
  gtm: "Guatemala",
  hnd: "Honduras",
  slv: "El Salvador",
  nic: "Nicaragua",
  cri: "Costa Rica",
  pan: "Panama",
  cub: "Cuba",
  dom: "Dominican Republic",
  pri: "Puerto Rico",
  esp: "Spain",
  arg: "Argentina",
  chl: "Chile",
  bol: "Bolivia",
  pry: "Paraguay",
  ury: "Uruguay",
  bra: "Brazil",
  gbr: "United Kingdom",
  deu: "Germany",
  ind: "India",
  phl: "Philippines",
  aus: "Australia",
  fra: "France",
  ita: "Italy",
  chn: "China",
  jpn: "Japan",
  kor: "South Korea",
  nga: "Nigeria",
  zaf: "South Africa",
};

function countryNameFromIso3(code) {
  const key = String(code || "").trim().toLowerCase();
  if (!key) return "Unknown";
  if (ISO3_COUNTRY_NAMES[key]) return ISO3_COUNTRY_NAMES[key];
  return key.toUpperCase();
}

/**
 * Organic clicks by country. Search Console has no U.S. state dimension.
 */
async function fetchGscClicksByCountry(dateFrom, dateTo) {
  if (!hasGscOAuthCredentials()) {
    return {
      configured: false,
      setupHint: gscSetupHint(),
      oauthAuthUrl: "/api/staff/gsc-auth",
      grain: "country",
      locations: [],
    };
  }

  try {
    const data = await querySearchAnalytics(dateFrom, dateTo, {
      dimensions: ["country"],
      rowLimit: 250,
    });
    const locations = (data.rows || [])
      .map((row) => {
        const code = String((row.keys && row.keys[0]) || "").trim();
        return {
          name: countryNameFromIso3(code),
          code: code.toLowerCase(),
          clicks: Number(row.clicks) || 0,
          impressions: Number(row.impressions) || 0,
        };
      })
      .filter((row) => row.clicks > 0 || row.impressions > 0)
      .sort((a, b) => b.clicks - a.clicks || a.name.localeCompare(b.name));

    return {
      configured: true,
      grain: "country",
      platform: "gsc",
      locations,
      firstIncompleteDate:
        (data.metadata && data.metadata.first_incomplete_date) || null,
    };
  } catch (e) {
    return {
      configured: true,
      grain: "country",
      platform: "gsc",
      locations: [],
      error: e.message || String(e),
    };
  }
}

async function fetchGscDaily(dateFrom, dateTo) {
  if (!hasGscOAuthCredentials()) {
    return {
      configured: false,
      setupHint: gscSetupHint(),
      oauthAuthUrl: "/api/staff/gsc-auth",
      daily: [],
    };
  }

  try {
    const data = await querySearchAnalytics(dateFrom, dateTo, {
      dimensions: ["date"],
      rowLimit: 25000,
    });
    return {
      configured: true,
      firstIncompleteDate: (data.metadata && data.metadata.first_incomplete_date) || null,
      daily: mapDailyRows(data.rows, dateFrom, dateTo),
    };
  } catch (e) {
    return {
      configured: true,
      error: e.message || String(e),
      daily: [],
    };
  }
}

module.exports = {
  GSC_SCOPE,
  getSiteUrl,
  getOAuthRedirectUri,
  hasGscOAuthCredentials,
  gscSetupHint,
  fetchGscOrganicSearch,
  fetchGscClicksByCountry,
  fetchGscDaily,
};
