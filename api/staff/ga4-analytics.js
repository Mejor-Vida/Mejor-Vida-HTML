/**
 * GET /api/staff/ga4-analytics — GA4 data for staff CRM.
 *
 * Overview: ?period=30&refresh=1
 * Stage detail (website events): ?action=stage&tab=website&stage=qualify_lead&period=30
 * Path stage detail: ?action=stage&tab=landing_ga4&path=quote&stage=state&period=30
 */

const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const {
  syncAllFunnels,
  syncFunnelToSupabase,
  dateRangeForDays,
} = require("../../lib/ga4-supabase-sync");
const {
  isConfigured,
  credentialsStatus,
  fetchEventDailyTrend,
  fetchTopPagesForEvent,
} = require("../../lib/ga4-data-api");
const {
  FUNNEL_KEYS,
  getWebsiteEventCatalog,
  getLandingPathConfig,
  getAllLandingPathKeys,
} = require("../../lib/ga4-funnel-config");

const TAB_KEYS = {
  website: FUNNEL_KEYS.WEBSITE_EVENTS,
  landing_ga4: FUNNEL_KEYS.LANDING_GA4,
  landing_facebook: FUNNEL_KEYS.LANDING_FACEBOOK,
};

function normalizeTab(tab) {
  if (tab === "landing") return "landing_ga4";
  if (TAB_KEYS[tab]) return tab;
  return "website";
}

function cacheKeyForTab(tab) {
  return TAB_KEYS[normalizeTab(tab)] || FUNNEL_KEYS.WEBSITE_EVENTS;
}

async function loadCache(cfg, funnelKey, periodDays) {
  const rows = await restSelect(
    cfg,
    "ga4_funnel_cache",
    `select=funnel_key,period_days,stages,detail,synced_at&funnel_key=eq.${encodeURIComponent(funnelKey)}&period_days=eq.${periodDays}&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
}

async function loadAllCaches(cfg, periodDays) {
  const rows = await restSelect(
    cfg,
    "ga4_funnel_cache",
    `select=funnel_key,period_days,stages,detail,synced_at&period_days=eq.${periodDays}&order=funnel_key.asc`
  );
  const out = {
    website: null,
    landing_ga4: null,
    landing_facebook: null,
  };
  (rows || []).forEach((row) => {
    if (row.funnel_key === FUNNEL_KEYS.WEBSITE_EVENTS || row.funnel_key === "website") {
      out.website = row;
    }
    if (row.funnel_key === FUNNEL_KEYS.LANDING_GA4 || row.funnel_key === "landing") {
      out.landing_ga4 = row;
    }
    if (row.funnel_key === FUNNEL_KEYS.LANDING_FACEBOOK) {
      out.landing_facebook = row;
    }
  });
  return out;
}

function packCacheRow(row) {
  if (!row) return { stages: [], detail: {}, synced_at: null };
  return {
    stages: row.stages || [],
    detail: row.detail || {},
    synced_at: row.synced_at || null,
  };
}

function stageFromWebsiteCache(cache, stageId) {
  if (!cache || !Array.isArray(cache.stages)) return null;
  return cache.stages.find((s) => s.id === stageId) || null;
}

function stageFromPathCache(cache, pathKey, stageId) {
  const paths = (cache && cache.detail && cache.detail.paths) || {};
  const pathData = paths[pathKey];
  if (!pathData || !Array.isArray(pathData.stages)) return null;
  return pathData.stages.find((s) => s.id === stageId) || null;
}

function stageDetailFromCache(cache, tab, pathKey, stageId) {
  const detail = (cache && cache.detail) || {};
  if (normalizeTab(tab) === "website") {
    return detail[stageId] || {};
  }
  const stageDetails = detail.stageDetails || {};
  const pathDetails = stageDetails[pathKey] || {};
  return pathDetails[stageId] || {};
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  const url = new URL(req.url, "http://localhost");
  const action = url.searchParams.get("action") || "overview";
  const tab = normalizeTab(url.searchParams.get("tab") || url.searchParams.get("funnel") || "website");
  const pathKey = String(url.searchParams.get("path") || "quote").trim();
  const periodDays = Math.max(7, Math.min(Number(url.searchParams.get("period")) || 30, 90));
  const forceRefresh = url.searchParams.get("refresh") === "1";
  const funnelKey = cacheKeyForTab(tab);

  const ga4Ready = isConfigured();
  const credStatus = credentialsStatus();

  if (action === "stage") {
    const stageId = String(url.searchParams.get("stage") || "").trim();
    if (!stageId) return json(res, 400, { error: "Missing stage parameter" });

    let cache = await loadCache(cfg, funnelKey, periodDays);

    if (forceRefresh && ga4Ready) {
      try {
        await syncFunnelToSupabase(cfg, funnelKey, periodDays);
        cache = await loadCache(cfg, funnelKey, periodDays);
      } catch (e) {
        return json(res, 502, { error: "GA4 refresh failed", detail: e.message });
      }
    }

    let stage = null;
    let stageDef = null;

    if (tab === "website") {
      stage = stageFromWebsiteCache(cache, stageId);
      stageDef = getWebsiteEventCatalog().find((s) => s.id === stageId);
    } else {
      if (!getAllLandingPathKeys().includes(pathKey)) {
        return json(res, 400, { error: "Invalid path parameter" });
      }
      stage = stageFromPathCache(cache, pathKey, stageId);
      stageDef = getLandingPathConfig(pathKey).find((s) => s.id === stageId);
    }

    const detail = stageDetailFromCache(cache, tab, pathKey, stageId);

    if (ga4Ready && stageDef && (!detail.daily || !detail.daily.length)) {
      try {
        const { startDate, endDate } = dateRangeForDays(periodDays);
        const options = {
          paramFilter: (stageDef && stageDef.paramFilter) || (stage && stage.paramFilter) || null,
          stepName: (stageDef && stageDef.stepName) || (stage && stage.stepName) || null,
        };
        const [daily, topPages] = await Promise.all([
          fetchEventDailyTrend(funnelKey, stageDef.eventName, startDate, endDate, options),
          fetchTopPagesForEvent(funnelKey, stageDef.eventName, startDate, endDate, 10, options),
        ]);
        detail.daily = daily;
        detail.topPages = topPages;
      } catch (e) {
        detail.fetchError = e.message;
      }
    }

    return json(res, 200, {
      tab,
      path: pathKey,
      periodDays,
      stage: stage || {
        id: stageId,
        label: stageId,
        count: 0,
        users: 0,
        eventName: stageDef ? stageDef.eventName : stageId,
      },
      detail,
      syncedAt: cache ? cache.synced_at : null,
      ga4Configured: ga4Ready,
    });
  }

  let caches = await loadAllCaches(cfg, periodDays);

  if (forceRefresh && ga4Ready) {
    try {
      await syncAllFunnels(cfg, periodDays);
      caches = await loadAllCaches(cfg, periodDays);
    } catch (e) {
      return json(res, 502, { error: "GA4 refresh failed", detail: e.message });
    }
  }

  return json(res, 200, {
    periodDays,
    ga4Configured: ga4Ready,
    credentials: credStatus,
    website: packCacheRow(caches.website),
    landing_ga4: packCacheRow(caches.landing_ga4),
    landing_facebook: packCacheRow(caches.landing_facebook),
    setupHint: ga4Ready
      ? null
      : credStatus.reason ||
        "Connect GA4: open /api/staff/ga4-auth (OAuth) or add GA4_SERVICE_ACCOUNT_JSON.",
    oauthAuthUrl: ga4Ready ? null : "/api/staff/ga4-auth",
  });
};
