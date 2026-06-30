/**
 * GET /api/staff/ga4-analytics — GA4 funnel data for staff CRM.
 * Query: ?funnel=website|landing&period=30&refresh=1 (optional force sync)
 * GET /api/staff/ga4-analytics?action=stage&funnel=website&stage=quote_submitted&period=30
 */

const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { syncAllFunnels, syncFunnelToSupabase } = require("../../lib/ga4-supabase-sync");
const { isConfigured, credentialsStatus } = require("../../lib/ga4-data-api");
const {
  fetchEventDailyTrend,
  fetchTopPagesForEvent,
} = require("../../lib/ga4-data-api");
const { getFunnelConfig } = require("../../lib/ga4-funnel-config");

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
  const out = { website: null, landing: null };
  (rows || []).forEach((row) => {
    if (row.funnel_key === "website") out.website = row;
    if (row.funnel_key === "landing") out.landing = row;
  });
  return out;
}

function stageFromCache(cache, stageId) {
  if (!cache || !Array.isArray(cache.stages)) return null;
  return cache.stages.find((s) => s.id === stageId) || null;
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
  const funnelKey = url.searchParams.get("funnel") === "landing" ? "landing" : "website";
  const periodDays = Math.max(7, Math.min(Number(url.searchParams.get("period")) || 30, 90));
  const forceRefresh = url.searchParams.get("refresh") === "1";

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

    const stage = stageFromCache(cache, stageId);
    const stageDef = getFunnelConfig(funnelKey).find((s) => s.id === stageId);
    const detail = (cache && cache.detail && cache.detail[stageId]) || {};

    if (ga4Ready && (!detail.daily || !detail.daily.length) && stageDef) {
      try {
        const startDate = `${periodDays}daysAgo`;
        const endDate = "today";
        const [daily, topPages] = await Promise.all([
          fetchEventDailyTrend(funnelKey, stageDef.eventName, startDate, endDate),
          fetchTopPagesForEvent(funnelKey, stageDef.eventName, startDate, endDate, 10),
        ]);
        detail.daily = daily;
        detail.topPages = topPages;
      } catch (e) {
        detail.fetchError = e.message;
      }
    }

    const landingSteps =
      funnelKey === "landing" && cache && cache.detail && cache.detail.landing_steps
        ? cache.detail.landing_steps
        : null;

    return json(res, 200, {
      funnel: funnelKey,
      periodDays,
      stage: stage || { id: stageId, label: stageId, count: 0, users: 0 },
      detail,
      landingSteps: stageId === "form_steps_completed" ? landingSteps : null,
      syncedAt: cache ? cache.synced_at : null,
      ga4Configured: ga4Ready,
    });
  }

  // overview — both funnels
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
    website: caches.website || { stages: [], detail: {}, synced_at: null },
    landing: caches.landing || { stages: [], detail: {}, synced_at: null },
    setupHint: ga4Ready
      ? null
      : credStatus.reason ||
        "Connect GA4: open /api/staff/ga4-auth (OAuth) or add GA4_SERVICE_ACCOUNT_JSON.",
    oauthAuthUrl: ga4Ready ? null : "/api/staff/ga4-auth",
  });
};
