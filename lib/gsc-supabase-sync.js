/**
 * Sync Google Search Console organic search into Supabase gsc_search_cache.
 * SEO agents read this table instead of needing a GSC MCP connector.
 */

const {
  hasGscOAuthCredentials,
  gscSetupHint,
  fetchGscSearchSnapshot,
} = require("./gsc-data-api");

const CHICAGO_TZ = "America/Chicago";

function ymdChicago(date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CHICAGO_TZ }).format(date || new Date());
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return t.toISOString().slice(0, 10);
}

/**
 * GSC often lags 1–3 days. End on yesterday (Chicago) so partial today does not skew.
 */
function resolveSyncPeriods(periodDays) {
  const days = Math.max(7, Math.min(Number(periodDays) || 28, 90));
  const endCurrent = addDaysYmd(ymdChicago(), -1);
  const startCurrent = addDaysYmd(endCurrent, -(days - 1));
  const endPrevious = addDaysYmd(startCurrent, -1);
  const startPrevious = addDaysYmd(endPrevious, -(days - 1));
  return {
    periodDays: days,
    current: { dateFrom: startCurrent, dateTo: endCurrent },
    previous: { dateFrom: startPrevious, dateTo: endPrevious },
  };
}

function buildQueryDeltas(currentQueries, previousQueries) {
  const prevMap = new Map();
  (previousQueries || []).forEach((row) => {
    if (row && row.query) prevMap.set(row.query, row);
  });

  const deltas = [];
  (currentQueries || []).forEach((row) => {
    if (!row || !row.query) return;
    const prev = prevMap.get(row.query);
    const clicksDelta = prev ? row.clicks - prev.clicks : null;
    const impressionsDelta = prev ? row.impressions - prev.impressions : null;
    const positionDelta = prev ? row.position - prev.position : null;
    deltas.push({
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      previousClicks: prev ? prev.clicks : null,
      previousImpressions: prev ? prev.impressions : null,
      previousPosition: prev ? prev.position : null,
      clicksDelta,
      impressionsDelta,
      // Negative position delta = improved rank (lower is better in GSC).
      positionDelta,
      isNew: !prev,
    });
  });

  deltas.sort((a, b) => {
    const aGain = a.clicksDelta == null ? a.clicks : a.clicksDelta;
    const bGain = b.clicksDelta == null ? b.clicks : b.clicksDelta;
    return bGain - aGain || a.position - b.position;
  });
  return deltas;
}

async function upsertCache(cfg, payload) {
  const base = `${cfg.supabaseUrl}/rest/v1/gsc_search_cache`;
  const headers = {
    apikey: cfg.serviceKey,
    Authorization: `Bearer ${cfg.serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  };

  const r = await fetch(`${base}?on_conflict=period_key`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase upsert gsc_search_cache ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text || "[]")[0] || payload;
}

function snapshotToRow(periodKey, periodDays, snap, queryDeltas) {
  const syncedAt = new Date().toISOString();
  return {
    period_key: periodKey,
    period_days: periodDays,
    date_from: snap.dateFrom,
    date_to: snap.dateTo,
    totals: snap.totals || {},
    top_queries: snap.topQueries || [],
    top_pages: snap.topPages || [],
    groups: snap.groups || {},
    home: snap.home || {},
    daily: snap.daily || [],
    countries: snap.countries || [],
    query_deltas: queryDeltas || [],
    detail: {
      siteUrl: snap.siteUrl || null,
      firstIncompleteDate: snap.firstIncompleteDate || null,
      source: "gsc",
    },
    synced_at: syncedAt,
  };
}

async function syncGscSearchCache(cfg, periodDays) {
  if (!hasGscOAuthCredentials()) {
    const err = new Error(gscSetupHint());
    err.code = "GSC_NOT_CONFIGURED";
    throw err;
  }

  const periods = resolveSyncPeriods(periodDays);
  const [currentSnap, previousSnap] = await Promise.all([
    fetchGscSearchSnapshot(periods.current.dateFrom, periods.current.dateTo, {
      queryLimit: 50,
      pageLimit: 50,
    }),
    fetchGscSearchSnapshot(periods.previous.dateFrom, periods.previous.dateTo, {
      queryLimit: 50,
      pageLimit: 50,
    }),
  ]);

  if (!currentSnap.configured) {
    const err = new Error(currentSnap.setupHint || gscSetupHint());
    err.code = "GSC_NOT_CONFIGURED";
    throw err;
  }
  if (!previousSnap.configured) {
    const err = new Error(previousSnap.setupHint || gscSetupHint());
    err.code = "GSC_NOT_CONFIGURED";
    throw err;
  }

  const queryDeltas = buildQueryDeltas(currentSnap.topQueries, previousSnap.topQueries);

  const currentRow = await upsertCache(
    cfg,
    snapshotToRow("current_28d", periods.periodDays, currentSnap, queryDeltas)
  );
  const previousRow = await upsertCache(
    cfg,
    snapshotToRow("previous_28d", periods.periodDays, previousSnap, [])
  );

  return {
    periodDays: periods.periodDays,
    current: {
      dateFrom: currentSnap.dateFrom,
      dateTo: currentSnap.dateTo,
      totals: currentSnap.totals,
      queryCount: (currentSnap.topQueries || []).length,
      pageCount: (currentSnap.topPages || []).length,
      deltaCount: queryDeltas.length,
    },
    previous: {
      dateFrom: previousSnap.dateFrom,
      dateTo: previousSnap.dateTo,
      totals: previousSnap.totals,
      queryCount: (previousSnap.topQueries || []).length,
      pageCount: (previousSnap.topPages || []).length,
    },
    syncedAt: currentRow.synced_at || new Date().toISOString(),
    rows: { current: currentRow, previous: previousRow },
  };
}

module.exports = {
  resolveSyncPeriods,
  buildQueryDeltas,
  syncGscSearchCache,
};
