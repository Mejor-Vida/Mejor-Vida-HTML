/**
 * Ad platform impression totals for CRM funnel dashboard (LP Facebook / Google Ads tabs).
 * - Facebook: Meta Marketing API (ad account insights)
 * - Google: Google Ads API (account impressions / clicks / cost); GA4 linked Ads as fallback
 */
const {
  isConfigured,
  fetchLinkedGoogleAdsTotals,
  fetchLinkedGoogleAdsDaily,
} = require("./ga4-data-api");
const {
  googleAdsConfigStatus,
  googleAdsSetupHint,
  fetchAccountMetrics,
  fetchAccountDaily,
} = require("./google-ads-api");

const META_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v19.0").trim();
const RETARGETING_AD_RE = /retargeting/i;
const V3_AD_RE = /(?:^|[\s\-])v3(?:\b|$)/i;

function parseFacebookViewVariant(view) {
  if (view === "facebook_v2") return "v2";
  if (view === "facebook_v3") return "v3";
  return null;
}

/** Match Meta ad set names to LP Facebook V2/V3 A/B tabs (same rules as funnel sessions). */
function metaAdSetMatchesVariant(adSetName, variant) {
  const name = String(adSetName || "");
  if (RETARGETING_AD_RE.test(name)) return false;
  if (!variant) return true;
  const hasV3 = V3_AD_RE.test(name);
  if (variant === "v3") return hasV3;
  if (variant === "v2") return !hasV3;
  return true;
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return t.toISOString().slice(0, 10);
}

function fillDailySeries(dateFrom, dateTo, rows) {
  const map = new Map();
  (rows || []).forEach((row) => {
    if (row && row.date) map.set(row.date, row);
  });
  const out = [];
  let cur = dateFrom;
  while (cur <= dateTo) {
    const row = map.get(cur) || { date: cur, impressions: 0, clicks: 0, spend: 0 };
    out.push({
      date: cur,
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.clicks) || 0,
      spend: row.spend != null ? Number(row.spend) || 0 : 0,
    });
    cur = addDaysYmd(cur, 1);
  }
  return out;
}

function metaAdConfig() {
  const token = [
    process.env.META_AD_ACCESS_TOKEN,
    process.env.META_ACCESS_TOKEN,
  ]
    .map((v) => String(v || "").trim())
    .find(Boolean);

  let accountId = String(process.env.META_AD_ACCOUNT_ID || "").trim();
  if (accountId && !accountId.startsWith("act_")) {
    accountId = "act_" + accountId.replace(/^act_/, "");
  }

  return {
    token: token || "",
    accountId: accountId || "",
    configured: !!(token && accountId),
  };
}

function metaSetupHint() {
  return (
    "Facebook ad impressions need a permanent Marketing API system user token. " +
    "One-time setup: open /api/staff/meta-ads-auth, sign in as business admin, copy META_AD_ACCESS_TOKEN to Vercel, then run npm run meta:ads-discover"
  );
}

function metaConfigStatus() {
  const cfg = metaAdConfig();
  if (cfg.configured) return { configured: true };
  const missing = [];
  if (!cfg.token) missing.push("META_AD_ACCESS_TOKEN");
  if (!cfg.accountId) missing.push("META_AD_ACCOUNT_ID");
  return {
    configured: false,
    reason: metaSetupHint(),
    missing,
  };
}

async function fetchMetaInsightsPages(url) {
  const all = [];
  let nextUrl = url;
  while (nextUrl) {
    const res = await fetch(nextUrl);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) {
      const msg = (body.error && body.error.message) || `Meta API ${res.status}`;
      throw new Error(msg);
    }
    all.push(...(body.data || []));
    nextUrl = body.paging && body.paging.next ? body.paging.next : null;
  }
  return all;
}

function sumMetaInsightRows(rows) {
  return (rows || []).reduce(
    (acc, row) => {
      acc.impressions += Number(row.impressions) || 0;
      acc.clicks += Number(row.clicks) || 0;
      acc.spend += row.spend != null ? Number(row.spend) || 0 : 0;
      return acc;
    },
    { impressions: 0, clicks: 0, spend: 0 }
  );
}

async function fetchMetaAdImpressions(dateFrom, dateTo, opts = {}) {
  const status = metaConfigStatus();
  if (!status.configured) {
    return {
      source: "meta",
      configured: false,
      impressions: null,
      clicks: null,
      spend: null,
      setupHint: status.reason,
    };
  }

  const { token, accountId } = metaAdConfig();
  const timeRange = JSON.stringify({ since: dateFrom, until: dateTo });
  const adSetVariant = opts.adSetVariant || null;

  try {
    if (adSetVariant) {
      const params = new URLSearchParams({
        fields: "adset_name,impressions,clicks,spend",
        level: "adset",
        time_range: timeRange,
        access_token: token,
        limit: "500",
      });
      const url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/insights?${params.toString()}`;
      const rows = await fetchMetaInsightsPages(url);
      const matched = rows.filter((row) => metaAdSetMatchesVariant(row.adset_name, adSetVariant));
      const totals = sumMetaInsightRows(matched);
      return {
        source: "meta",
        configured: true,
        impressions: totals.impressions,
        clicks: totals.clicks,
        spend: totals.spend,
        adSetVariant,
      };
    }

    const params = new URLSearchParams({
      fields: "impressions,clicks,spend",
      time_range: timeRange,
      access_token: token,
    });
    const url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/insights?${params.toString()}`;

    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));

    if (!res.ok || body.error) {
      const msg = (body.error && body.error.message) || `Meta API ${res.status}`;
      const expired = /expired|session has/i.test(msg);
      return {
        source: "meta",
        configured: true,
        impressions: null,
        clicks: null,
        spend: null,
        error: msg,
        setupHint: expired ? metaSetupHint() : undefined,
      };
    }

    const row = (body.data && body.data[0]) || {};
    return {
      source: "meta",
      configured: true,
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.clicks) || 0,
      spend: row.spend != null ? Number(row.spend) : null,
    };
  } catch (e) {
    const msg = e.message || String(e);
    const expired = /expired|session has/i.test(msg);
    return {
      source: "meta",
      configured: true,
      impressions: null,
      clicks: null,
      spend: null,
      error: msg,
      setupHint: expired ? metaSetupHint() : undefined,
    };
  }
}

async function fetchMetaAdDaily(dateFrom, dateTo, opts = {}) {
  const status = metaConfigStatus();
  if (!status.configured) {
    return { configured: false, setupHint: status.reason, daily: [] };
  }

  const { token, accountId } = metaAdConfig();
  const timeRange = JSON.stringify({ since: dateFrom, until: dateTo });
  const adSetVariant = opts.adSetVariant || null;

  try {
    if (adSetVariant) {
      const params = new URLSearchParams({
        fields: "adset_name,impressions,clicks,spend,date_start",
        level: "adset",
        time_range: timeRange,
        time_increment: "1",
        access_token: token,
        limit: "500",
      });
      const url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/insights?${params.toString()}`;
      const rows = await fetchMetaInsightsPages(url);
      const matched = rows.filter((row) => metaAdSetMatchesVariant(row.adset_name, adSetVariant));
      const byDate = new Map();
      matched.forEach((row) => {
        const date = String(row.date_start || "").slice(0, 10);
        if (!date) return;
        if (!byDate.has(date)) byDate.set(date, { impressions: 0, clicks: 0, spend: 0 });
        const cur = byDate.get(date);
        cur.impressions += Number(row.impressions) || 0;
        cur.clicks += Number(row.clicks) || 0;
        cur.spend += row.spend != null ? Number(row.spend) || 0 : 0;
      });
      const dailyRows = [...byDate.entries()].map(([date, metrics]) => ({ date, ...metrics }));
      return {
        configured: true,
        adSetVariant,
        daily: fillDailySeries(dateFrom, dateTo, dailyRows),
      };
    }

    const params = new URLSearchParams({
      fields: "impressions,clicks,spend,date_start",
      time_range: timeRange,
      time_increment: "1",
      access_token: token,
    });
    const url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/insights?${params.toString()}`;

    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));

    if (!res.ok || body.error) {
      const msg = (body.error && body.error.message) || `Meta API ${res.status}`;
      return { configured: true, error: msg, daily: [] };
    }

    const rows = (body.data || []).map((row) => ({
      date: String(row.date_start || "").slice(0, 10),
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.clicks) || 0,
      spend: row.spend != null ? Number(row.spend) : 0,
    }));

    return {
      configured: true,
      daily: fillDailySeries(dateFrom, dateTo, rows),
    };
  } catch (e) {
    return {
      configured: true,
      error: e.message || String(e),
      daily: [],
    };
  }
}

async function fetchGoogleAdsImpressions(dateFrom, dateTo) {
  const adsStatus = googleAdsConfigStatus();
  if (adsStatus.configured) {
    const ads = await fetchAccountMetrics(dateFrom, dateTo);
    if (ads.error) {
      return {
        source: "google_ads_api",
        configured: true,
        impressions: null,
        clicks: null,
        spend: null,
        error: ads.error,
      };
    }
    return {
      source: "google_ads_api",
      configured: true,
      impressions: ads.impressions,
      clicks: ads.clicks,
      spend: ads.spend,
    };
  }

  if (!isConfigured()) {
    return {
      source: "google_ads",
      configured: false,
      impressions: null,
      clicks: null,
      spend: null,
      setupHint: googleAdsSetupHint(),
    };
  }

  try {
    const totals = await fetchLinkedGoogleAdsTotals(dateFrom, dateTo);
    return {
      source: "google_ads",
      configured: true,
      impressions: totals.impressions,
      clicks: totals.clicks,
      spend: totals.spend,
    };
  } catch (e) {
    return {
      source: "google_ads",
      configured: true,
      impressions: null,
      clicks: null,
      spend: null,
      error: e.message || String(e),
    };
  }
}

async function fetchGoogleAdsDaily(dateFrom, dateTo) {
  const adsStatus = googleAdsConfigStatus();
  if (adsStatus.configured) {
    const ads = await fetchAccountDaily(dateFrom, dateTo);
    if (ads.error) {
      return {
        configured: true,
        error: ads.error,
        daily: [],
      };
    }
    return {
      configured: true,
      daily: fillDailySeries(dateFrom, dateTo, ads.daily),
    };
  }

  if (!isConfigured()) {
    return {
      configured: false,
      setupHint: googleAdsSetupHint(),
      daily: [],
    };
  }

  try {
    const rows = await fetchLinkedGoogleAdsDaily(dateFrom, dateTo);
    return {
      configured: true,
      daily: fillDailySeries(dateFrom, dateTo, rows),
    };
  } catch (e) {
    return {
      configured: true,
      error: e.message || String(e),
      daily: [],
    };
  }
}

async function fetchAdPlatformMetrics(view, dateFrom, dateTo) {
  const fbVariant = parseFacebookViewVariant(view);
  if (view === "facebook" || fbVariant) {
    const data = await fetchMetaAdImpressions(dateFrom, dateTo, {
      adSetVariant: fbVariant,
    });
    return { show: true, platform: "facebook", dateFrom, dateTo, ...data };
  }
  if (view === "google") {
    const data = await fetchGoogleAdsImpressions(dateFrom, dateTo);
    return { show: true, platform: "google", dateFrom, dateTo, ...data };
  }
  return { show: false };
}

async function fetchAdDailySeries(view, dateFrom, dateTo) {
  const fbVariant = parseFacebookViewVariant(view);
  if (view === "facebook" || fbVariant) {
    const data = await fetchMetaAdDaily(dateFrom, dateTo, { adSetVariant: fbVariant });
    return { platform: "facebook", dateFrom, dateTo, ...data };
  }
  if (view === "google") {
    const data = await fetchGoogleAdsDaily(dateFrom, dateTo);
    return { platform: "google", dateFrom, dateTo, ...data };
  }
  return { daily: [] };
}

module.exports = {
  metaAdConfig,
  metaConfigStatus,
  fetchMetaAdImpressions,
  fetchGoogleAdsImpressions,
  fetchAdPlatformMetrics,
  fetchAdDailySeries,
  fillDailySeries,
};
