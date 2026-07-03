/**
 * Sync GA4 analytics into Supabase ga4_funnel_cache.
 */

const {
  fetchWebsiteEventCounts,
  fetchSingleEventStats,
  fetchLandingStepBreakdown,
  fetchEventDailyTrend,
  fetchTopPagesForEvent,
  isConfigured,
} = require("./ga4-data-api");
const {
  FUNNEL_KEYS,
  getWebsiteEventCatalog,
  getLandingPathConfig,
  getAllLandingPathKeys,
  FACEBOOK_META_QUOTE_NOTE,
} = require("./ga4-funnel-config");

function dateRangeForDays(days) {
  const d = Math.max(1, Math.min(Number(days) || 30, 90));
  return { startDate: `${d}daysAgo`, endDate: "today", periodDays: d };
}

function applyFunnelMath(stages) {
  const topCount = stages[0] ? stages[0].count : 0;
  stages.forEach((stage, i) => {
    stage.conversionFromTop = topCount > 0 ? Math.round((stage.count / topCount) * 1000) / 10 : 0;
    if (i > 0) {
      const prev = stages[i - 1].count;
      stage.stepConversion = prev > 0 ? Math.round((stage.count / prev) * 1000) / 10 : 0;
      stage.dropOff = prev > 0 ? Math.round(((prev - stage.count) / prev) * 1000) / 10 : 0;
    } else {
      stage.stepConversion = 100;
      stage.dropOff = 0;
    }
  });
  return stages;
}

function buildWebsiteEventStages(eventCounts) {
  const catalog = getWebsiteEventCatalog();
  const catalogByEvent = {};
  catalog.forEach((def) => {
    catalogByEvent[def.eventName] = def;
  });

  const seen = new Set();
  const stages = [];

  catalog.forEach((def) => {
    const stats = eventCounts[def.eventName] || { eventCount: 0, totalUsers: 0 };
    stages.push({
      id: def.id,
      label: def.label,
      eventName: def.eventName,
      description: def.description || "",
      count: stats.eventCount,
      users: stats.totalUsers,
    });
    seen.add(def.eventName);
  });

  Object.keys(eventCounts)
    .filter((name) => !seen.has(name))
    .sort((a, b) => (eventCounts[b].eventCount || 0) - (eventCounts[a].eventCount || 0))
    .forEach((eventName) => {
      const stats = eventCounts[eventName];
      stages.push({
        id: eventName,
        label: eventName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        eventName,
        description: "Other GA4 event on main website paths",
        count: stats.eventCount,
        users: stats.totalUsers,
      });
    });

  return stages;
}

async function buildLandingPathStages(funnelKey, pathKey, startDate, endDate, stepBreakdown) {
  const pathDef = getLandingPathConfig(pathKey);
  if (!stepBreakdown) {
    stepBreakdown = await fetchLandingStepBreakdown(funnelKey, startDate, endDate);
  }

  const stages = [];
  for (const def of pathDef) {
    let stats = { eventCount: 0, totalUsers: 0 };
    if (def.eventName === "step_viewed" && def.stepName) {
      const stepStats = stepBreakdown[def.stepName] || { count: 0, users: 0 };
      stats = { eventCount: stepStats.count, totalUsers: stepStats.users };
    } else {
      stats = await fetchSingleEventStats(funnelKey, def.eventName, startDate, endDate, {
        paramFilter: def.paramFilter,
        stepName: def.stepName,
      });
    }
    stages.push({
      id: def.id,
      label: def.label,
      eventName: def.eventName,
      stepName: def.stepName || null,
      paramFilter: def.paramFilter || null,
      description: def.description || "",
      count: stats.eventCount,
      users: stats.totalUsers,
    });
  }

  return applyFunnelMath(stages);
}

async function buildLandingPathsDetail(funnelKey, startDate, endDate) {
  const stepBreakdown = await fetchLandingStepBreakdown(funnelKey, startDate, endDate);
  const paths = {};
  for (const pathKey of getAllLandingPathKeys()) {
    paths[pathKey] = {
      stages: await buildLandingPathStages(funnelKey, pathKey, startDate, endDate, stepBreakdown),
    };
  }
  if (funnelKey === FUNNEL_KEYS.LANDING_FACEBOOK) {
    paths.quote.metaNote = FACEBOOK_META_QUOTE_NOTE;
  }
  return { paths };
}

async function buildWebsiteStageDetails(stages, startDate, endDate) {
  const detail = {};
  const topStages = stages.slice(0, 8);
  for (const stage of topStages) {
    try {
      const [daily, topPages] = await Promise.all([
        fetchEventDailyTrend(FUNNEL_KEYS.WEBSITE_EVENTS, stage.eventName, startDate, endDate),
        fetchTopPagesForEvent(FUNNEL_KEYS.WEBSITE_EVENTS, stage.eventName, startDate, endDate, 8),
      ]);
      detail[stage.id] = { daily, topPages };
    } catch (e) {
      detail[stage.id] = { daily: [], topPages: [], error: e.message };
    }
  }
  return detail;
}

async function buildPathStageDetail(funnelKey, pathKey, stage, startDate, endDate) {
  const options = {
    paramFilter: stage.paramFilter || null,
    stepName: stage.stepName || null,
  };
  try {
    const [daily, topPages] = await Promise.all([
      fetchEventDailyTrend(funnelKey, stage.eventName, startDate, endDate, options),
      fetchTopPagesForEvent(funnelKey, stage.eventName, startDate, endDate, 8, options),
    ]);
    return { daily, topPages };
  } catch (e) {
    return { daily: [], topPages: [], error: e.message };
  }
}

async function buildLandingPathStageDetails(funnelKey, pathsDetail, startDate, endDate) {
  const detail = { paths: {} };
  for (const pathKey of getAllLandingPathKeys()) {
    const pathData = pathsDetail.paths[pathKey] || { stages: [] };
    detail.paths[pathKey] = {};
    for (const stage of (pathData.stages || []).slice(0, 6)) {
      detail.paths[pathKey][stage.id] = await buildPathStageDetail(
        funnelKey,
        pathKey,
        stage,
        startDate,
        endDate
      );
    }
  }
  return detail;
}

async function upsertCache(cfg, payload) {
  const base = `${cfg.supabaseUrl}/rest/v1/ga4_funnel_cache`;
  const headers = {
    apikey: cfg.serviceKey,
    Authorization: `Bearer ${cfg.serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  };

  const r = await fetch(`${base}?on_conflict=funnel_key,period_days`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase upsert ga4_funnel_cache ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text || "[]")[0] || payload;
}

async function syncWebsiteEvents(cfg, periodDays) {
  const { startDate, endDate } = dateRangeForDays(periodDays);
  const eventCounts = await fetchWebsiteEventCounts(startDate, endDate);
  const stages = buildWebsiteEventStages(eventCounts);
  const detail = await buildWebsiteStageDetails(stages, startDate, endDate);

  return upsertCache(cfg, {
    funnel_key: FUNNEL_KEYS.WEBSITE_EVENTS,
    period_days: periodDays,
    stages,
    detail,
    synced_at: new Date().toISOString(),
  });
}

async function syncLandingFunnel(cfg, funnelKey, periodDays) {
  const { startDate, endDate } = dateRangeForDays(periodDays);
  const pathsDetail = await buildLandingPathsDetail(funnelKey, startDate, endDate);
  const stageDetail = await buildLandingPathStageDetails(funnelKey, pathsDetail, startDate, endDate);

  const allStages = [];
  getAllLandingPathKeys().forEach((pathKey) => {
    (pathsDetail.paths[pathKey].stages || []).forEach((s) => allStages.push(s));
  });

  return upsertCache(cfg, {
    funnel_key: funnelKey,
    period_days: periodDays,
    stages: allStages,
    detail: { ...pathsDetail, stageDetails: stageDetail.paths },
    synced_at: new Date().toISOString(),
  });
}

/** @deprecated */
async function syncFunnelToSupabase(cfg, funnelKey, periodDays) {
  if (funnelKey === "website") return syncWebsiteEvents(cfg, periodDays);
  if (funnelKey === "landing") return syncLandingFunnel(cfg, FUNNEL_KEYS.LANDING_GA4, periodDays);
  if (funnelKey === FUNNEL_KEYS.WEBSITE_EVENTS) return syncWebsiteEvents(cfg, periodDays);
  if (funnelKey === FUNNEL_KEYS.LANDING_GA4 || funnelKey === FUNNEL_KEYS.LANDING_FACEBOOK) {
    return syncLandingFunnel(cfg, funnelKey, periodDays);
  }
  throw new Error(`Unknown funnel key: ${funnelKey}`);
}

async function syncAllFunnels(cfg, periodDays) {
  if (!isConfigured()) {
    throw new Error("GA4 not configured — set GA4_PROPERTY_ID and service account credentials");
  }
  const websiteEvents = await syncWebsiteEvents(cfg, periodDays);
  const landingGa4 = await syncLandingFunnel(cfg, FUNNEL_KEYS.LANDING_GA4, periodDays);
  const landingFacebook = await syncLandingFunnel(cfg, FUNNEL_KEYS.LANDING_FACEBOOK, periodDays);
  return {
    websiteEvents,
    landingGa4,
    landingFacebook,
    syncedAt: new Date().toISOString(),
  };
}

module.exports = {
  applyFunnelMath,
  buildWebsiteEventStages,
  buildLandingPathStages,
  syncWebsiteEvents,
  syncLandingFunnel,
  syncFunnelToSupabase,
  syncAllFunnels,
  dateRangeForDays,
};
