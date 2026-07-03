/**
 * GET /api/staff/funnel-analytics
 *
 * Overview: ?view=facebook|google|lp_direct|website&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
 * Node detail: ?action=node&view=facebook&tool=quote&step=state&date_from=...&date_to=...
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { buildDashboard, buildNodeDetail, groupSessions, filterSessions } = require("../../lib/funnel-analytics");

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
    "select=session_id,created_at,source,campaign,ad_set,ad_name,keyword,search_term,tool,step_name,event_type,page_or_step,device" +
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

  const view = String(req.query.view || "facebook").trim();
  const action = String(req.query.action || "").trim();
  const range = resolveDateRange(req.query);

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

  const dashboard = buildDashboard(events, filters);
  return json(res, 200, {
    ok: true,
    ...dashboard,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
    hasData: events.length > 0,
  });
};
