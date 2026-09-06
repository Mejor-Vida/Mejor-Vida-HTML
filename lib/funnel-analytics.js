/**
 * Product funnel analytics — group sessions, build branches, entry context, node detail.
 */
const {
  getBranchesForView,
  getBranchOrder,
  getFunnelView,
  allFunnelViewIds,
  normalizeViewId,
} = require("./funnel-analytics-config");

const LP_PATH_RE = /gastos-finales-ads|landing-gastos-finales|landing-final-expense/i;
const LP_VARIANT_PATHS = {
  v2: /gastos-finales-ads-v2/i,
  v3: /gastos-finales-ads-v3/i,
};
const SOURCE_KEYS = ["facebook", "google", "organic", "direct"];

function emptySourceVisitorMap() {
  const map = {};
  SOURCE_KEYS.forEach((source) => {
    map[source] = { total: 0, new: 0, returning: 0, unknown: 0 };
  });
  return map;
}

function sessionVisitorType(session) {
  const type = String(session.visitor_type || "").toLowerCase();
  if (type === "new" || type === "returning") return type;
  return "unknown";
}

function bumpSourceVisitor(map, source, visitorType) {
  const row = map[source];
  if (!row) return;
  row.total += 1;
  if (visitorType === "new") row.new += 1;
  else if (visitorType === "returning") row.returning += 1;
  else row.unknown += 1;
}

function sumVisitorTotals(sourceMap) {
  const totals = { total: 0, new: 0, returning: 0, unknown: 0 };
  SOURCE_KEYS.forEach((source) => {
    const row = sourceMap[source] || {};
    totals.total += row.total || 0;
    totals.new += row.new || 0;
    totals.returning += row.returning || 0;
    totals.unknown += row.unknown || 0;
  });
  return totals;
}

function isLandingPageSession(session) {
  return (session.events || []).some((ev) => LP_PATH_RE.test(ev.page_or_step || ""));
}

function sessionLandingVariant(session) {
  for (const ev of session.events || []) {
    const p = ev.page_or_step || "";
    if (!LP_PATH_RE.test(p)) continue;
    if (LP_VARIANT_PATHS.v3.test(p)) return "v3";
    if (LP_VARIANT_PATHS.v2.test(p)) return "v2";
    return "v1";
  }
  return null;
}

const RETARGETING_AD_RE = /retargeting/i;
const V3_AD_RE = /(?:^|[\s\-])v3(?:\b|$)/i;

function normalizeAcqText(value) {
  if (!value) return "";
  try {
    return decodeURIComponent(String(value).replace(/\+/g, " "));
  } catch {
    return String(value).replace(/\+/g, " ");
  }
}

function acquisitionHaystack(acq) {
  return [acq.campaign, acq.ad_set, acq.ad_name].map(normalizeAcqText).join(" ");
}

function hasMeaningfulAdAttribution(acq) {
  return !!(
    String(acq.campaign || "").trim() ||
    String(acq.ad_set || "").trim() ||
    String(acq.ad_name || "").trim()
  );
}

function isRetargetingAdSession(acq) {
  return RETARGETING_AD_RE.test(acquisitionHaystack(acq));
}

/** LP Facebook A/B tabs: match ad-set/ad/campaign naming, not URL crawlers alone. */
function adAttributionMatchesLandingVariant(acq, variant) {
  const hay = acquisitionHaystack(acq).toLowerCase();
  const hasV3 = V3_AD_RE.test(hay);
  if (variant === "v3") return hasV3;
  if (variant === "v2") return !hasV3;
  return true;
}

function matchesFacebookAbTestSession(session, variant) {
  const acq = session.acquisition || {};
  if (!hasMeaningfulAdAttribution(acq)) return false;
  if (isRetargetingAdSession(acq)) return false;
  return adAttributionMatchesLandingVariant(acq, variant);
}

function parseEventRow(row) {
  const eventData =
    row.event_data && typeof row.event_data === "object" && !Array.isArray(row.event_data)
      ? row.event_data
      : {};
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
    visitor_id: row.visitor_id ? String(row.visitor_id) : "",
    visitor_type: row.visitor_type ? String(row.visitor_type) : "",
    event_data: eventData,
    state: normalizeSessionState(eventData.state || eventData.answer || ""),
  };
}

function normalizeSessionState(raw) {
  const code = String(raw || "")
    .trim()
    .toUpperCase();
  if (code === "NE" || code === "KS" || code === "CO" || code === "NV") return code;
  return "";
}

function sessionSelectedState(session) {
  if (session && session.state) return session.state;
  let found = "";
  for (const ev of (session && session.events) || []) {
    const fromEvent = normalizeSessionState(
      (ev.event_data && (ev.event_data.state || ev.event_data.answer)) || ev.state || ""
    );
    if (fromEvent) found = fromEvent;
  }
  return found;
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
        visitor_id: ev.visitor_id || "",
        visitor_type: ev.visitor_type || "",
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
    if (ev.state) s.state = ev.state;
    if (ev.timestamp < (s.firstAt || Infinity)) {
      s.firstAt = ev.timestamp;
      s.visitor_id = ev.visitor_id || s.visitor_id || "";
      s.visitor_type = ev.visitor_type || s.visitor_type || "";
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
  const viewId = normalizeViewId(filters.view || "facebook_landing");
  const view = getFunnelView(viewId);
  const allowedSources = new Set(view.sources || []);

  const out = [];
  sessions.forEach((s) => {
    const acq = s.acquisition || {};
    if (!allowedSources.has(acq.source)) return;

    const onLanding = isLandingPageSession(s);
    const variant = sessionLandingVariant(s);
    const landingPage = view.landingPage || "website";

    if (landingPage === "website") {
      if (onLanding) return;
    } else if (landingPage === "v2") {
      if (!onLanding || variant !== "v2") return;
    } else if (landingPage === "v3") {
      if (!onLanding || variant !== "v3") return;
    } else if (landingPage === "landing") {
      if (!onLanding) return;
    } else if (landingPage === "whatsapp") {
      return;
    }

    if (filters.source && filters.source !== "all") {
      const srcFilter = filters.source === "website" ? ["organic", "direct"] : [filters.source];
      if (!srcFilter.includes(acq.source)) return;
    }
    if (filters.campaign && acq.campaign !== filters.campaign) return;
    if (filters.device && filters.device !== "all" && acq.device !== filters.device) return;

    const stateFilter = normalizeSessionState(filters.state || filters.stateCode || "ALL") || "ALL";
    if (stateFilter !== "ALL") {
      const sessionState = sessionSelectedState(s);
      if (sessionState !== stateFilter) return;
    }

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

function buildEntryContext(sessions) {
  const sourceCounts = { facebook: 0, google: 0, organic: 0, direct: 0 };
  const sourceVisitorBreakdown = emptySourceVisitorMap();
  const adClicks = new Map();
  const adLeads = new Map();
  const kwClicks = new Map();
  const kwLeads = new Map();

  sessions.forEach((s) => {
    const acq = s.acquisition || {};
    const visitorType = sessionVisitorType(s);
    if (sourceCounts[acq.source] != null) sourceCounts[acq.source] += 1;
    bumpSourceVisitor(sourceVisitorBreakdown, acq.source, visitorType);

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
    sourceVisitorBreakdown,
    visitorTotals: sumVisitorTotals(sourceVisitorBreakdown),
    topAdsByClicks: topList(adClicks, 10),
    topAdsByLeads: topList(adLeads, 10),
    topKeywordsByClicks: topList(kwClicks, 10),
    topKeywordsByLeads: topList(kwLeads, 10),
  };
}

function buildBranch(sessionList, tool, branchDef) {
  const steps = branchDef.steps || [];
  const nodes = [];
  let prevCount = null;

  steps.forEach((step, index) => {
    const sessionsAtStep = sessionList.filter((s) => sessionReachedStep(s, tool, step));
    const count = sessionsAtStep.length;
    const conversionRate =
      index === 0 ? (count > 0 ? 100 : null) : pct(count, prevCount);
    const dropOff =
      index === 0 || prevCount == null || prevCount <= 0
        ? 0
        : Math.max(0, prevCount - count);

    nodes.push({
      id: step.id,
      label: step.label,
      tool,
      count,
      conversionRate,
      dropOff,
      dropOffRate: index === 0 || prevCount == null || prevCount <= 0 ? null : pct(dropOff, prevCount),
      health: index === 0 ? "neutral" : healthFromConversion(conversionRate),
      terminal: branchDef.terminal && steps.length === 1,
    });

    prevCount = count;
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
  const sourceBreakdown = emptySourceVisitorMap();
  const deviceBreakdown = { mobile: 0, tablet: 0, desktop: 0 };
  const campaignBreakdown = new Map();
  const visitorBreakdown = { new: 0, returning: 0, unknown: 0 };
  const durations = [];

  atStep.forEach((s) => {
    const acq = s.acquisition || {};
    const visitorType = sessionVisitorType(s);
    bumpSourceVisitor(sourceBreakdown, acq.source, visitorType);
    if (visitorType === "new") visitorBreakdown.new += 1;
    else if (visitorType === "returning") visitorBreakdown.returning += 1;
    else visitorBreakdown.unknown += 1;
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
    visitorBreakdown,
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

function listCampaignsFromSessions(sessions) {
  const set = new Set();
  (sessions || []).forEach((s) => {
    const c = s.acquisition && s.acquisition.campaign;
    if (c) set.add(String(c));
  });
  return [...set].sort();
}

function applyWhatsappAdFunnel(dashboard, stats) {
  const clicks = Number(stats && stats.clicks) || 0;
  const conversations = Number(stats && stats.conversations) || 0;
  const leads = Number(stats && stats.leads) || 0;
  const quoted = Number(stats && stats.quoted) || 0;
  const counts = [clicks, conversations, leads, quoted];
  const labels = ["Ad clicks", "Conversations started", "ManyChat leads", "Quote in chat"];
  const ids = ["ad_clicks", "conversations", "bot_leads", "quoted"];
  const nodes = ids.map((id, index) => {
    const count = counts[index];
    const prev = index === 0 ? null : counts[index - 1];
    const conversionRate = index === 0 ? (count > 0 ? 100 : null) : pct(count, prev);
    const dropOff = index === 0 || prev == null ? 0 : Math.max(0, prev - count);
    return {
      id,
      label: labels[index],
      tool: "whatsapp",
      count,
      conversionRate,
      dropOff,
      dropOffRate: index === 0 || !prev ? null : pct(dropOff, prev),
      health: index === 0 ? "neutral" : healthFromConversion(conversionRate),
      terminal: index === ids.length - 1,
    };
  });
  if (!dashboard) return dashboard;
  dashboard.branches = {
    whatsapp: {
      id: "whatsapp",
      label: "WhatsApp ads",
      terminal: false,
      nodes,
      entryCount: clicks,
    },
  };
  return dashboard;
}

function buildDashboard(events, filters) {
  const viewId = normalizeViewId(filters.view || "facebook_landing");
  const sessionsMap = groupSessions(events);
  const allSessions = [...sessionsMap.values()];
  const sessions = filterSessions(sessionsMap, filters);

  return {
    view: viewId,
    viewLabel: getFunnelView(viewId).label,
    entryLabel: getFunnelView(viewId).entryLabel,
    stateFilter: normalizeSessionState(filters.state || "ALL") || "ALL",
    dateFrom: filters.dateFrom || null,
    dateTo: filters.dateTo || null,
    totalEvents: (events || []).length,
    totalSessions: sessions.length,
    entryContext: buildEntryContext(sessions),
    branches: buildFunnelBranches(sessions, viewId),
    campaigns: listCampaignsFromSessions(sessions),
    allSessionCount: allSessions.length,
  };
}

module.exports = {
  parseEventRow,
  groupSessions,
  filterSessions,
  buildDashboard,
  applyWhatsappAdFunnel,
  buildNodeDetail,
  buildEntryContext,
  buildFunnelBranches,
  listCampaigns,
  allFunnelViewIds,
  getFunnelView,
};
