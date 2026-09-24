/**
 * GET /api/staff/creative-testing?action=campaigns
 * GET /api/staff/creative-testing?action=adsets&campaign_id=
 * GET /api/staff/creative-testing?action=ads&adset_id=&date_from=&date_to=
 * POST { adId, decision: "keep" | "remove" | "" }
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, readJsonBody } = require("./_inbox-lib");
const { listCampaigns, listAdSets, listAds } = require("../../lib/creative-testing");

const CHICAGO_TZ = "America/Chicago";

function parseYmd(value) {
  const s = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
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
    if (cYmd === ymd && Number(get("hour")) === 0) return candidate.toISOString();
  }
  throw new Error("Could not resolve Chicago midnight for " + ymd);
}

function resolveRange(query) {
  const dateTo = parseYmd(query.date_to || query.dateTo) || ymdChicago();
  const dateFrom = parseYmd(query.date_from || query.dateFrom) || dateTo;
  const start = dateFrom <= dateTo ? dateFrom : dateTo;
  const end = dateFrom <= dateTo ? dateTo : dateFrom;
  return {
    dateFrom: start,
    dateTo: end,
    startIso: chicagoMidnightUtcIso(start),
    endExclusiveIso: chicagoMidnightUtcIso(addDaysYmd(end, 1)),
  };
}

async function saveDecision(cfg, adId, decision) {
  const url = `${cfg.supabaseUrl}/rest/v1/staff_creative_ad_decisions?on_conflict=ad_id`;
  if (!decision) {
    const r = await fetch(
      `${cfg.supabaseUrl}/rest/v1/staff_creative_ad_decisions?ad_id=eq.${encodeURIComponent(adId)}`,
      {
        method: "DELETE",
        headers: {
          apikey: cfg.serviceKey,
          Authorization: `Bearer ${cfg.serviceKey}`,
        },
      }
    );
    if (!r.ok) {
      const text = await r.text();
      throw new Error(text.slice(0, 200));
    }
    return { adId, decision: null };
  }
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ ad_id: adId, decision, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text.slice(0, 200));
  }
  return { adId, decision };
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth) return;
  const cfg = serviceConfig();

  if (req.method === "POST") {
    if (!cfg) return json(res, 500, { error: "Supabase is not configured" });
    const body = readJsonBody(req);
    const adId = String(body.adId || body.ad_id || "").trim();
    const decision = String(body.decision || "").trim().toLowerCase();
    if (!/^\d+$/.test(adId)) return json(res, 400, { error: "adId required" });
    if (decision && decision !== "keep" && decision !== "remove") {
      return json(res, 400, { error: "decision must be keep, remove, or blank" });
    }
    try {
      const saved = await saveDecision(cfg, adId, decision);
      return json(res, 200, saved);
    } catch (e) {
      return json(res, 500, { error: e.message || "Could not save the decision" });
    }
  }

  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const action = String((req.query && req.query.action) || "campaigns");
  try {
    if (action === "campaigns") return json(res, 200, await listCampaigns());
    if (action === "adsets") return json(res, 200, await listAdSets(req.query.campaign_id));
    if (action === "ads") {
      const range = resolveRange(req.query || {});
      const data = await listAds(cfg, req.query.adset_id, range.dateFrom, range.dateTo, range.startIso, range.endExclusiveIso);
      return json(res, 200, data);
    }
    return json(res, 400, { error: "Unknown action" });
  } catch (e) {
    return json(res, 500, { error: e.message || "Creative testing request failed" });
  }
};
