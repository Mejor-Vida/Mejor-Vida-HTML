#!/usr/bin/env node
/**
 * Test Google Ads keyword click report (keyword_view).
 *
 * Usage:
 *   1. Set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_REFRESH_TOKEN in .env.local
 *   2. node scripts/google-ads-keywords-test.js
 *   3. Optional: node scripts/google-ads-keywords-test.js 2026-06-27 2026-07-03
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnvFile(ENV_PATH);

const { googleAdsConfigStatus, fetchTopKeywordsByClicks } = require("../lib/google-ads-api");

function defaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

async function main() {
  const status = googleAdsConfigStatus();
  if (!status.configured) {
    console.log("Google Ads API not configured.");
    console.log("Missing:", (status.missing || []).join(", ") || "unknown");
    console.log(status.reason || "");
    process.exit(1);
  }

  const defaults = defaultRange();
  const dateFrom = process.argv[2] || defaults.from;
  const dateTo = process.argv[3] || defaults.to;

  console.log("Fetching keyword clicks for", dateFrom, "to", dateTo, "…");
  const result = await fetchTopKeywordsByClicks(dateFrom, dateTo, 15);

  if (result.error) {
    console.error("Error:", result.error);
    process.exit(1);
  }

  if (!result.keywords.length) {
    console.log("No keyword clicks in this range (Search campaigns only).");
    process.exit(0);
  }

  console.log("\nTop keywords by ad clicks:\n");
  result.keywords.forEach((row, i) => {
    console.log(String(i + 1).padStart(2) + ".", row.name, "—", row.count, "clicks");
  });
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
