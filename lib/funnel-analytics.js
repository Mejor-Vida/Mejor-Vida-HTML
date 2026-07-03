/**
 * Product funnel analytics — group sessions, build branches, entry context, node detail.
 */
const {
  getBranchesForView,
  getBranchOrder,
  getFunnelView,
  allFunnelViewIds,
} = require("./funnel-analytics-config");

function parseEventRow(row) {
  return {
    session_id: String(row.session_id || ""),
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    source: String(row.source || "direct"),
    campaign: row.campaign ? String(row.campaign) : "",
    ad_set: row.ad_set ? String(row.ad_set) : "",
    ad_name: row.ad_name ? String(row.ad_name) : "",
    keyword: row.keyword ? String(row.keyword) : "",
    search_term: row.search_term ? String(row.search_term) : "",
    tool: String(row.tool || ""),
    step_name: String(row.step_name || ""),
    event_type: String(row.event_type || ""),
    page_or_step: row.page_or_step ? String(row.page_or_step) : "",
    device: row.device ? String(row.device) : "desktop",
  };
}

function eventMatchesStep(ev, step) {
  const m = step.match || {};
  if (m.event_type && ev.event_type !== m.event_type) return false;
  if (m.step_name && ev.step_name !== m.step_name) return false;
  if (m.tool && ev.tool !== m.tool) return false;
  return true;
}

function healthFromConversion(rate) {
  if (rate == null || Number.isNaN(rate)) return "neutral";
  if (rate >= 70) return "good";
  if (rate >= 40) return "avg";
  return "weak";
}

function pct(n, d) {
  if (!d || d <= 0) return null;
  return Math.round((n / d) * 1000) / 10;
}

function groupSessions(events) {
  const sessions = new Map();
  (events || []).forEach((raw) => {
    const ev = parseEventRow(raw);
    if (!ev.session_id) return;
    if (!sessions.has(ev.session_id)) {
      sessions.set(ev.session_id, {
        session_id: ev.session_id,
        acquisition: {
          source: ev.source,
          campaign: ev.campaign,
          ad_set: ev.ad_set,
          ad_name: ev.ad_name,
          keyword: ev.keyword,
          search_term: ev.search_term,
          device: ev.device,
        },
        events: [],
      });
    }
    const s = sessions.get(ev.session_id);
    s.events.push(ev);
    if (ev.timestamp < (s.firstAt || Infinity)) {
      s.firstAt = ev.timestamp;
      s.acquisition = {
        source: ev.source,
        campaign: ev.campaign,
        ad_set: ev.ad_set,
        ad_name: ev.ad_name,
        keyword: ev.keyword,
        search_term: ev.search_term,
        device: ev.device,
      };
    }
  });
  sessions.forEach((s) => {
    s.events.sort((a, b) => a.timestamp - b.timestamp);
  });
  return sessions;
}

function filterSessions(sessions, filters) {
  const viewId = filters.view || "facebook";
  const view = getFunnelView(viewId);
  const allowedSources = new Set(view.sources);

  const out = [];
  sessions.forEach((s) => {
    const acq = s.acquisition || {};
    if (!allowedSources.has(acq.source)) return;

    if (filters.source && filters.source !== "all") {
      const srcFilter = filters.source === "website" ? ["organic", "direct"] : [filters.source];
      if (!srcFilter.includes(acq.source)) return;
    }
    if (filters.campaign && acq.campaign !== filters.campaign) return;
    if (filters.device && filters.device !== "all" && acq.device !== filters.device) return;

    out.push(s);
  });
  return out;
}

function sessionReachedStep(session, tool, step) {
  return (session.events || []).some(
    (ev) => ev.tool === tool && eventMatchesStep(ev, step)
  );
}

function sessionHasLeadConversion(session) {
  return (session.events || []).some(
    (ev) =>
      ev.event_type === "conversion" &&
      (ev.step_name === "lead_submitted" ||
        ev.step_name === "qualify_lead" ||
        ev.step_name === "booking_confirmed")
  );
}

function sessionHasEntryClick(session, tool) {
  const branches = getBranchesForView("facebook");
  const branch = branches[tool];
  if (!branch || !branch.steps[0]) return false;
  return sessionReachedStep(session, tool, branch.steps[0]);
}

function buildEntryContext(sessions, viewId) {
  const sourceCounts = { facebook: 0, google: 0, organic: 0, direct: 0 };
  const adClicks = new Map();
  const adLeads = new Map();
  const kwClicks = new Map();
  const kwLeads = new Map();

  sessions.forEach((s) => {
    const acq = s.acquisition || {};
    if (sourceCounts[acq.source] != null) sourceCounts[acq.source] += 1;

    const hasClick =
      s.events.some((ev) => ev.event_type === "click") ||
      s.events.some((ev) => ev.event_type === "step_view");
    const hasLead = sessionHasLeadConversion(s);

    if (acq.source === "facebook" && acq.ad_name) {
      const key = acq.ad_name;
      if (hasClick) adClicks.set(key, (adClicks.get(key) || 0) + 1);
      if (hasLead) adLeads.set(key, (adLeads.get(key) || 0) + 1);
    }
    if (acq.source === "google" && acq.keyword) {
      const key = acq.keyword;
      if (hasClick) kwClicks.set(key, (kwClicks.get(key) || 0) + 1);
      if (hasLead) kwLeads.set(key, (kwLeads.get(key) || 0) + 1);
    }
  });

  const total = sessions.length || 1;
  const sourceBreakdown = {
    facebook: pct(sourceCounts.facebook, total),
    google: pct(sourceCounts.google, total),
    organic: pct(sourceCounts.organic, total),
    direct: pct(sourceCounts.direct, total),
  };

  function topList(map, limit) {
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  return {
    totalSessions: sessions.length,
    sourceBreakdown,
    sourceCounts,
    topAdsByClicks: topList(adClicks, 10),
    topAdsByLeads: topList(adLeads, 10),
    topKeywordsByClicks: topList(kwClicks, 10),
    topKeywordsByLeads: topList(kwLeads, 10),
    showFacebook: viewId === "facebook" || viewId === "all",
    showGoogle: viewId === "google" || viewId === "all",
  };
}

function buildBranch(sessionList, tool, branchDef) {
  const steps = branchDef.steps || [];
  const nodes = [];
  let prevCount = sessionList.length;

  steps.forEach((step, index) => {
    const sessionsAtStep = sessionList.filter((s) => sessionReachedStep(s, tool, step));
    const count = sessionsAtStep.length;
    const conversionRate = index === 0 ? 100 : pct(count, prevCount);
    const dropOff = index === 0 ? 0 : Math.max(0, prevCount - count);

    nodes.push({
      id: step.id,
      label: step.label,
      tool,
      count,
      conversionRate,
      dropOff,
      dropOffRate: index === 0 ? null : pct(dropOff, prevCount),
      health: index === 0 ? "neutral" : healthFromConversion(conversionRate),
      terminal: branchDef.terminal && steps.length === 1,
    });

    if (index > 0) prevCount = count;
  });

  return {
    id: tool,
    label: branchDef.label,
    terminal: !!branchDef.terminal,
    nodes,
    entryCount: nodes[0] ? nodes[0].count : 0,
  };
}

function buildFunnelBranches(sessions, viewId) {
  const branches = getBranchesForView(viewId);
  const order = getBranchOrder();
  const out = {};

  order.forEach((toolKey) => {
    const def = branches[toolKey];
    if (!def) return;
    out[toolKey] = buildBranch(sessions, toolKey, def);
  });

  return out;
}

function listCampaigns(events) {
  const set = new Set();
  (events || []).forEach((row) => {
    const c = row.campaign;
    if (c) set.add(String(c));
  });
  return [...set].sort();
}

function buildNodeDetail(sessions, tool, stepId, viewId) {
  const branches = getBranchesForView(viewId);
  const branch = branches[tool];
  if (!branch) return null;
  const step = branch.steps.find((s) => s.id === stepId);
  if (!step) return null;

  const atStep = sessions.filter((s) => sessionReachedStep(s, tool, step));
  const sourceBreakdown = { facebook: 0, google: 0, organic: 0, direct: 0 };
  const deviceBreakdown = { mobile: 0, tablet: 0, desktop: 0 };
  const campaignBreakdown = new Map();
  const durations = [];

  atStep.forEach((s) => {
    const acq = s.acquisition || {};
    if (sourceBreakdown[acq.source] != null) sourceBreakdown[acq.source] += 1;
    const dev = acq.device || "desktop";
    if (deviceBreakdown[dev] != null) deviceBreakdown[dev] += 1;
    if (acq.campaign) {
      campaignBreakdown.set(acq.campaign, (campaignBreakdown.get(acq.campaign) || 0) + 1);
    }

    const stepEvents = s.events.filter((ev) => ev.tool === tool && eventMatchesStep(ev, step));
    if (stepEvents.length) {
      const t0 = stepEvents[0].timestamp;
      const nextEv = s.events.find((ev) => ev.timestamp > t0 && ev.tool === tool);
      if (nextEv) durations.push(nextEv.timestamp - t0);
    }
  });

  const stepIndex = branch.steps.findIndex((s) => s.id === stepId);
  const nextStep = branch.steps[stepIndex + 1];
  let dropOffRate = null;
  if (nextStep) {
    const atNext = sessions.filter((s) => sessionReachedStep(s, tool, nextStep));
    dropOffRate = pct(atStep.length - atNext.length, atStep.length);
  }

  const avgTimeMs =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  return {
    tool,
    stepId,
    label: step.label,
    users: atStep.length,
    sourceBreakdown,
    deviceBreakdown,
    campaignBreakdown: [...campaignBreakdown.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count })),
    avgTimeMs,
    avgTimeSec: avgTimeMs != null ? Math.round(avgTimeMs / 1000) : null,
    dropOffRate,
  };
}

function buildDashboard(events, filters) {
  const viewId = filters.view || "facebook";
  const sessionsMap = groupSessions(events);
  const allSessions = [...sessionsMap.values()];
  const sessions = filterSessions(sessionsMap, filters);

  return {
    view: viewId,
    viewLabel: getFunnelView(viewId).label,
    entryLabel: getFunnelView(viewId).entryLabel,
    dateFrom: filters.dateFrom || null,
    dateTo: filters.dateTo || null,
    totalEvents: (events || []).length,
    totalSessions: sessions.length,
    entryContext: buildEntryContext(sessions, viewId),
    branches: buildFunnelBranches(sessions, viewId),
    campaigns: listCampaigns(events),
    allSessionCount: allSessions.length,
  };
}

module.exports = {
  parseEventRow,
  groupSessions,
  filterSessions,
  buildDashboard,
  buildNodeDetail,
  buildEntryContext,
  buildFunnelBranches,
  listCampaigns,
  allFunnelViewIds,
  getFunnelView,
};
