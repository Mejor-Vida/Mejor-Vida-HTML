/**
 * Ad platform impression totals for CRM funnel dashboard (LP Facebook / LP Google tabs).
 * - Facebook: Meta Marketing API (ad account insights)
 * - Google: GA4 advertiserAdImpressions (linked Google Ads account)
 */
const { isConfigured, fetchLinkedGoogleAdsTotals } = require("./ga4-data-api");

const META_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v19.0").trim();

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
    "Facebook ad impressions need a Marketing API token (not the Page token). " +
    "Generate one in Graph API Explorer with ads_read, add META_AD_ACCESS_TOKEN to .env.local, " +
    "then run: node scripts/meta-ads-discover.js"
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

async function fetchMetaAdImpressions(dateFrom, dateTo) {
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
    return {
      source: "meta",
      configured: true,
      impressions: null,
      clicks: null,
      spend: null,
      error: msg,
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
}

async function fetchGoogleAdsImpressions(dateFrom, dateTo) {
  if (!isConfigured()) {
    return {
      source: "google_ads",
      configured: false,
      impressions: null,
      clicks: null,
      spend: null,
      setupHint: "Connect GA4 (GA4_PROPERTY_ID + credentials) to pull linked Google Ads impressions.",
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

async function fetchAdPlatformMetrics(view, dateFrom, dateTo) {
  if (view === "facebook") {
    const data = await fetchMetaAdImpressions(dateFrom, dateTo);
    return { show: true, platform: "facebook", dateFrom, dateTo, ...data };
  }
  if (view === "google") {
    const data = await fetchGoogleAdsImpressions(dateFrom, dateTo);
    return { show: true, platform: "google", dateFrom, dateTo, ...data };
  }
  return { show: false };
}

module.exports = {
  metaAdConfig,
  metaConfigStatus,
  fetchMetaAdImpressions,
  fetchGoogleAdsImpressions,
  fetchAdPlatformMetrics,
};
