/**
 * Inspect every Spanish sitemap URL in Search Console.
 * Loads .env.local; never prints tokens.
 * Usage: node scripts/gsc-inspect-spanish-pages.js
 */
const fs = require("fs");
const path = require("path");
const { google } = require("../lib/google-clients");
const { getGa4OAuthClientConfig } = require("../lib/ga4-oauth-config");
const { getSiteUrl, getOAuthRedirectUri, hasGscOAuthCredentials } = require("../lib/gsc-data-api");

function loadEnvFile(p) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile(path.join(__dirname, "..", ".env.local"));

const OUT = path.join(__dirname, "..", "data", "gsc-spanish-index-audit.json");
const SITEMAP = path.join(__dirname, "..", "sitemap.xml");
const CONCURRENCY = 4;

function sitemapUrls() {
  const xml = fs.readFileSync(SITEMAP, "utf8");
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
  return [...new Set(locs)];
}

function pathOf(url) {
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch (e) {
    return url;
  }
}

function classify(inspection) {
  const idx = (inspection && inspection.indexStatusResult) || {};
  const coverage = String(idx.coverageState || "");
  const verdict = String((inspection && inspection.verdict) || idx.verdict || "");
  const indexingState = String(idx.indexingState || "");
  const pageFetch = String(idx.pageFetchState || "");
  const canonicalUser = idx.userCanonical || null;
  const canonicalGoogle = idx.googleCanonical || null;
  const indexed =
    /indexed/i.test(coverage) &&
    !/not indexed|currently not indexed|excluded|unknown/i.test(coverage);
  return {
    indexed: !!indexed,
    coverageState: coverage || null,
    verdict: verdict || null,
    indexingState: indexingState || null,
    pageFetchState: pageFetch || null,
    robotsTxtState: idx.robotsTxtState || null,
    lastCrawlTime: idx.lastCrawlTime || null,
    userCanonical: canonicalUser,
    googleCanonical: canonicalGoogle,
  };
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function main() {
  if (!hasGscOAuthCredentials()) {
    throw new Error("Search Console is not connected (GSC_REFRESH_TOKEN missing).");
  }
  const urls = sitemapUrls();
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  const auth = new google.auth.OAuth2(clientId, clientSecret, getOAuthRedirectUri());
  auth.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });
  const sc = google.searchconsole({ version: "v1", auth });
  const siteUrl = getSiteUrl();

  let sitemapMeta = null;
  try {
    const sm = await sc.sitemaps.list({ siteUrl });
    sitemapMeta = sm.data.sitemap || [];
  } catch (e) {
    sitemapMeta = { error: e.message };
  }

  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 112);
  const dateFrom = start.toISOString().slice(0, 10);
  const dateTo = end.toISOString().slice(0, 10);
  let analyticsPages = [];
  try {
    const analytics = await sc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: dateFrom,
        endDate: dateTo,
        dimensions: ["page"],
        searchType: "web",
        dataState: "all",
        rowLimit: 25000,
      },
    });
    analyticsPages = (analytics.data.rows || []).map((row) => ({
      page: (row.keys && row.keys[0]) || "",
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
    }));
  } catch (e) {
    analyticsPages = [];
  }

  const impressionByPath = new Map();
  for (const row of analyticsPages) {
    const p = pathOf(row.page);
    if (p.startsWith("/en/") || p === "/en" || p === "/en/") continue;
    const prev = impressionByPath.get(p) || { clicks: 0, impressions: 0 };
    prev.clicks += row.clicks;
    prev.impressions += row.impressions;
    impressionByPath.set(p, prev);
  }

  const rows = await mapPool(urls, CONCURRENCY, async (url) => {
    try {
      const res = await sc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl },
      });
      const classified = classify(res.data.inspectionResult);
      const p = pathOf(url);
      const perf = impressionByPath.get(p) || { clicks: 0, impressions: 0 };
      return { url, path: p, ok: true, ...classified, ...perf };
    } catch (e) {
      return {
        url,
        path: pathOf(url),
        ok: false,
        indexed: false,
        error: e.message || String(e),
        coverageState: null,
        clicks: 0,
        impressions: 0,
      };
    }
  });

  const indexed = rows.filter((r) => r.indexed);
  const missing = rows.filter((r) => r.ok && !r.indexed);
  const errors = rows.filter((r) => !r.ok);
  const byCoverage = {};
  for (const r of rows) {
    const key = r.coverageState || (r.error ? "inspect_error" : "unknown");
    byCoverage[key] = (byCoverage[key] || 0) + 1;
  }

  const report = {
    generated_at: new Date().toISOString(),
    property: siteUrl,
    analytics_window: { dateFrom, dateTo },
    sitemap_unique_urls: urls.length,
    inspect_ok: rows.filter((r) => r.ok).length,
    indexed_count: indexed.length,
    not_indexed_count: missing.length,
    inspect_error_count: errors.length,
    by_coverage: byCoverage,
    sitemaps: sitemapMeta,
    missing,
    errors,
    indexed_sample: indexed.slice(0, 20).map((r) => r.path),
    rows,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(
    JSON.stringify(
      {
        sitemap_unique_urls: report.sitemap_unique_urls,
        indexed_count: report.indexed_count,
        not_indexed_count: report.not_indexed_count,
        inspect_error_count: report.inspect_error_count,
        by_coverage: report.by_coverage,
        missing_paths: missing.map((r) => ({ path: r.path, coverage: r.coverageState })),
        out: "data/gsc-spanish-index-audit.json",
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
