/**
 * Sync GA4 funnel data into Supabase ga4_funnel_cache.
 */

const {
  fetchFunnelEventCounts,
  fetchEventDailyTrend,
  fetchLandingStepBreakdown,
  fetchTopPagesForEvent,
  isConfigured,
} = require("./ga4-data-api");
const {
  getFunnelConfig,
  LANDING_STEP_STAGES,
} = require("./ga4-funnel-config");

function dateRangeForDays(days) {
  const d = Math.max(1, Math.min(Number(days) || 30, 90));
  return { startDate: `${d}daysAgo`, endDate: "today", periodDays: d };
}

function buildStages(funnelKey, eventCounts) {
  const config = getFunnelConfig(funnelKey);
  const stages = config.map((def) => {
    const stats = eventCounts[def.eventName] || { eventCount: 0, totalUsers: 0 };
    return {
      id: def.id,
      label: def.label,
      eventName: def.eventName,
      description: def.description,
      count: stats.eventCount,
      users: stats.totalUsers,
    };
  });

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

async function buildStageDetails(funnelKey, stages, startDate, endDate) {
  const detail = {};
  const topEvents = stages.slice(0, 6);

  for (const stage of topEvents) {
    try {
      const [daily, topPages] = await Promise.all([
        fetchEventDailyTrend(funnelKey, stage.eventName, startDate, endDate),
        fetchTopPagesForEvent(funnelKey, stage.eventName, startDate, endDate, 8),
      ]);
      detail[stage.id] = { daily, topPages };
    } catch (e) {
      detail[stage.id] = { daily: [], topPages: [], error: e.message };
    }
  }

  if (funnelKey === "landing") {
    try {
      const stepBreakdown = await fetchLandingStepBreakdown(startDate, endDate);
      const stepFunnel = LANDING_STEP_STAGES.map((step) => {
        const stats = stepBreakdown[step.stepName] || { count: 0, users: 0 };
        return {
          id: step.id,
          label: step.label,
          stepName: step.stepName,
          count: stats.count,
          users: stats.users,
        };
      });
      const topStep = stepFunnel[0] ? stepFunnel[0].count : 0;
      stepFunnel.forEach((s, i) => {
        s.conversionFromTop = topStep > 0 ? Math.round((s.count / topStep) * 1000) / 10 : 0;
        if (i > 0) {
          const prev = stepFunnel[i - 1].count;
          s.stepConversion = prev > 0 ? Math.round((s.count / prev) * 1000) / 10 : 0;
          s.dropOff = prev > 0 ? Math.round(((prev - s.count) / prev) * 1000) / 10 : 0;
        }
      });
      detail.landing_steps = { steps: stepFunnel, raw: stepBreakdown };
    } catch (e) {
      detail.landing_steps = { steps: [], error: e.message };
    }
  }

  return detail;
}

async function syncFunnelToSupabase(cfg, funnelKey, periodDays) {
  const { startDate, endDate } = dateRangeForDays(periodDays);
  const eventCounts = await fetchFunnelEventCounts(funnelKey, startDate, endDate);
  const stages = buildStages(funnelKey, eventCounts);
  const detail = await buildStageDetails(funnelKey, stages, startDate, endDate);

  const payload = {
    funnel_key: funnelKey,
    period_days: periodDays,
    stages,
    detail,
    synced_at: new Date().toISOString(),
  };

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

async function syncAllFunnels(cfg, periodDays) {
  if (!isConfigured()) {
    throw new Error("GA4 not configured — set GA4_PROPERTY_ID and service account credentials");
  }
  const website = await syncFunnelToSupabase(cfg, "website", periodDays);
  const landing = await syncFunnelToSupabase(cfg, "landing", periodDays);
  return { website, landing, syncedAt: new Date().toISOString() };
}

module.exports = {
  buildStages,
  syncFunnelToSupabase,
  syncAllFunnels,
  dateRangeForDays,
};
