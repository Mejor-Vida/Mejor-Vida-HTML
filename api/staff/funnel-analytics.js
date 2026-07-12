/**
 * GET /api/staff/funnel-analytics
 *
 * Overview: ?view=facebook_v2|facebook_v3|google|lp_direct|website&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
 * Node detail: ?action=node&view=facebook&tool=quote&step=state&date_from=...&date_to=...
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { buildDashboard, buildNodeDetail, groupSessions, filterSessions } = require("../../lib/funnel-analytics");
const {
  resolveAdPlatformView,
  normalizeViewId,
  viewShowsAdMetrics,
  viewShowsGsc,
  viewShowsGoogleAdsKeywords,
} = require("../../lib/funnel-analytics-config");
const { fetchAdPlatformMetrics, fetchAdDailySeries } = require("../../lib/ad-platform-insights");
const { fetchTopKeywordsByClicks } = require("../../lib/google-ads-api");
const { fetchGscOrganicSearch, fetchGscDaily } = require("../../lib/gsc-data-api");
const { fetchPoliciesSoldMetrics } = require("../../lib/crm-stage-transitions");

const CHICAGO_TZ = "America/Chicago";

function parseYmd(value) {
  const s = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T12:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return s;
}

function ymdChicago(date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CHICAGO_TZ }).format(date || new Date());
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return t.toISOString().slice(0, 10);
}

/** Midnight on `ymd` in America/Chicago, as UTC ISO (for Supabase created_at filters). */
function chicagoMidnightUtcIso(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  for (let utcHour = 4; utcHour <= 7; utcHour++) {
    const candidate = new Date(Date.UTC(y, m - 1, d, utcHour, 0, 0, 0));
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: CHICAGO_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      hour12: false,
    }).formatToParts(candidate);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    const cYmd = `${get("year")}-${get("month")}-${get("day")}`;
    if (cYmd === ymd && Number(get("hour")) === 0) {
      return candidate.toISOString();
    }
  }
  throw new Error("Could not resolve Chicago midnight for " + ymd);
}

function resolveDateRange(query) {
  const defaultTo = ymdChicago();
  const defaultFrom = addDaysYmd(defaultTo, -29);

  let dateFrom = parseYmd(query.date_from || query.dateFrom) || defaultFrom;
  let dateTo = parseYmd(query.date_to || query.dateTo) || defaultTo;

  if (dateFrom > dateTo) {
    const swap = dateFrom;
    dateFrom = dateTo;
    dateTo = swap;
  }

  return {
    dateFrom,
    dateTo,
    startIso: chicagoMidnightUtcIso(dateFrom),
    endExclusiveIso: chicagoMidnightUtcIso(addDaysYmd(dateTo, 1)),
  };
}

async function loadFunnelEvents(cfg, startIso, endExclusiveIso) {
  const q =
    "select=session_id,visitor_id,visitor_type,created_at,source,campaign,ad_set,ad_name,keyword,search_term,tool,step_name,event_type,page_or_step,device,event_data" +
    "&created_at=gte." +
    encodeURIComponent(startIso) +
    "&created_at=lt." +
    encodeURIComponent(endExclusiveIso) +
    "&order=created_at.asc&limit=50000";
  const rows = await restSelect(cfg, "funnel_events", q);
  return rows || [];
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

  const view = normalizeViewId(String(req.query.view || "facebook_v2").trim());
  const adPlatformView = resolveAdPlatformView(view);
  const action = String(req.query.action || "").trim();
  const range = resolveDateRange(req.query);
  const stateFilterRaw = String(req.query.state || req.query.state_code || "ALL")
    .trim()
    .toUpperCase();
  const stateFilter =
    stateFilterRaw === "ALL" || !stateFilterRaw
      ? "ALL"
      : ["NE", "KS", "CO", "NV"].includes(stateFilterRaw)
        ? stateFilterRaw
        : "ALL";

  let events;
  try {
    events = await loadFunnelEvents(cfg, range.startIso, range.endExclusiveIso);
  } catch (e) {
    console.error("[funnel-analytics] load", e.message || e);
    return json(res, 500, { error: "Could not load funnel events" });
  }

  const filters = {
    view,
    source: "all",
    campaign: "",
    device: "all",
    state: stateFilter,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
  };

  if (action === "node") {
    const tool = String(req.query.tool || "").trim();
    const step = String(req.query.step || "").trim();
    if (!tool || !step) {
      return json(res, 400, { error: "tool and step required for node detail" });
    }
    const sessionsMap = groupSessions(events);
    const sessions = filterSessions(sessionsMap, filters);
    const detail = buildNodeDetail(sessions, tool, step, view);
    if (!detail) return json(res, 404, { error: "Step not found" });
    return json(res, 200, { ok: true, detail, dateFrom: range.dateFrom, dateTo: range.dateTo });
  }

  if (action === "ad_daily") {
    if (!viewShowsAdMetrics(view)) {
      return json(res, 400, { error: "ad_daily requires facebook or google view" });
    }
    try {
      const series = await fetchAdDailySeries(adPlatformView, range.dateFrom, range.dateTo);
      return json(res, 200, {
        ok: true,
        dateFrom: range.dateFrom,
        dateTo: range.dateTo,
        ...series,
      });
    } catch (e) {
      console.error("[funnel-analytics] ad_daily", e.message || e);
      return json(res, 502, { error: e.message || "Could not load ad daily series" });
    }
  }

  if (action === "gsc_daily") {
    if (!viewShowsGsc(view)) {
      return json(res, 400, { error: "gsc_daily requires organic website view" });
    }
    try {
      const series = await fetchGscDaily(range.dateFrom, range.dateTo);
      return json(res, 200, {
        ok: true,
        dateFrom: range.dateFrom,
        dateTo: range.dateTo,
        platform: "gsc",
        ...series,
      });
    } catch (e) {
      console.error("[funnel-analytics] gsc_daily", e.message || e);
      return json(res, 502, { error: e.message || "Could not load Search Console daily series" });
    }
  }

  if (action === "policies_daily") {
    try {
      const metrics = await fetchPoliciesSoldMetrics(
        cfg,
        range.startIso,
        range.endExclusiveIso,
        range.dateFrom,
        range.dateTo
      );
      return json(res, 200, {
        ok: true,
        dateFrom: range.dateFrom,
        dateTo: range.dateTo,
        platform: "policies",
        configured: metrics.configured,
        daily: metrics.daily || [],
        error: metrics.error || null,
      });
    } catch (e) {
      console.error("[funnel-analytics] policies_daily", e.message || e);
      return json(res, 502, { error: e.message || "Could not load policies sold daily series" });
    }
  }

  const dashboard = buildDashboard(events, filters);

  let googleAdsKeywords = null;
  if (viewShowsGoogleAdsKeywords(view)) {
    try {
      googleAdsKeywords = await fetchTopKeywordsByClicks(range.dateFrom, range.dateTo, 10);
      if (
        googleAdsKeywords &&
        googleAdsKeywords.configured &&
        googleAdsKeywords.keywords &&
        googleAdsKeywords.keywords.length
      ) {
        dashboard.entryContext.topKeywordsByClicks = googleAdsKeywords.keywords;
        dashboard.entryContext.keywordClicksSource = "google_ads_api";
      }
    } catch (e) {
      console.error("[funnel-analytics] google ads keywords", e.message || e);
      googleAdsKeywords = {
        configured: false,
        keywords: [],
        error: e.message || "Could not load Google Ads keywords",
      };
    }
  }

  let adMetrics = { show: false };
  if (viewShowsAdMetrics(view)) {
    try {
      adMetrics = await fetchAdPlatformMetrics(adPlatformView, range.dateFrom, range.dateTo);
    } catch (e) {
      console.error("[funnel-analytics] ad metrics", e.message || e);
      adMetrics = {
        show: true,
        platform: adPlatformView,
        configured: false,
        impressions: null,
        clicks: null,
        error: e.message || "Could not load ad impressions",
      };
    }
  }

  let organicSearch = { show: false };
  if (viewShowsGsc(view)) {
    try {
      organicSearch = await fetchGscOrganicSearch(range.dateFrom, range.dateTo);
    } catch (e) {
      console.error("[funnel-analytics] gsc", e.message || e);
      organicSearch = {
        show: true,
        source: "gsc",
        configured: false,
        error: e.message || "Could not load Search Console data",
      };
    }
  }

  let policiesSold = { show: true };
  try {
    policiesSold = await fetchPoliciesSoldMetrics(
      cfg,
      range.startIso,
      range.endExclusiveIso,
      range.dateFrom,
      range.dateTo
    );
  } catch (e) {
    console.error("[funnel-analytics] policies sold", e.message || e);
    policiesSold = {
      show: true,
      configured: false,
      count: null,
      sales: [],
      error: e.message || "Could not load policies sold",
    };
  }

  return json(res, 200, {
    ok: true,
    ...dashboard,
    adMetrics,
    organicSearch,
    policiesSold,
    googleAdsKeywords,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
    hasData: events.length > 0,
  });
};
