#!/usr/bin/env node
/**
 * Discover Meta ad account IDs for CRM funnel impressions.
 *
 * Usage (token never printed):
 *   1. Add a line to .env.local: META_AD_ACCESS_TOKEN=your_token_here
 *   2. node scripts/meta-ads-discover.js
 *
 * Token needs ads_read (Graph API Explorer → permissions → ads_read, read_insights).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");
const VERSION = String(process.env.META_GRAPH_API_VERSION || "v19.0").trim();

function loadEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
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
    out[m[1]] = val;
  }
  return out;
}

function getToken() {
  const fromEnv = String(process.env.META_AD_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || "").trim();
  if (fromEnv) return fromEnv;
  const fileEnv = loadEnvFile(ENV_PATH);
  return String(fileEnv.META_AD_ACCESS_TOKEN || fileEnv.META_ACCESS_TOKEN || "").trim();
}

async function main() {
  const token = getToken();
  if (!token) {
    console.error("No token found.");
    console.error("");
    console.error("1. Open https://developers.facebook.com/tools/explorer/");
    console.error("2. Select your Meta app → Add permissions: ads_read, read_insights");
    console.error("3. Generate User Access Token → copy it");
    console.error("4. Add to .env.local: META_AD_ACCESS_TOKEN=<paste token>");
    console.error("5. Re-run: node scripts/meta-ads-discover.js");
    process.exit(1);
  }

  const debugRes = await fetch(
    `https://graph.facebook.com/${VERSION}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`
  );
  const debug = await debugRes.json().catch(() => ({}));
  if (debug.error) {
    console.error("Token invalid:", debug.error.message);
    process.exit(1);
  }

  const scopes = (debug.data && debug.data.scopes) || [];
  const hasAds = scopes.includes("ads_read") || scopes.includes("ads_management");
  console.log("Token OK. Expires:", debug.data && debug.data.expires_at ? new Date(debug.data.expires_at * 1000).toISOString() : "unknown");
  console.log("Ads scope:", hasAds ? "yes" : "NO — add ads_read in Graph API Explorer and generate a new token");
  if (!hasAds) process.exit(2);

  const acctRes = await fetch(
    `https://graph.facebook.com/${VERSION}/me/adaccounts?fields=id,name,account_id,account_status,currency&access_token=${encodeURIComponent(token)}`
  );
  const accts = await acctRes.json().catch(() => ({}));
  if (accts.error) {
    console.error("Could not list ad accounts:", accts.error.message);
    process.exit(1);
  }

  const rows = accts.data || [];
  if (!rows.length) {
    console.error("No ad accounts returned for this token.");
    process.exit(1);
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const timeRange = JSON.stringify({
    since: since.toISOString().slice(0, 10),
    until: new Date().toISOString().slice(0, 10),
  });

  console.log("");
  console.log("Ad accounts (last 7 days impressions):");
  const ranked = [];
  for (const a of rows) {
    let impressions = 0;
    let topCampaign = "";
    try {
      const insUrl =
        `https://graph.facebook.com/${VERSION}/${a.id}/insights?fields=impressions,campaign_name&level=campaign&time_range=${encodeURIComponent(timeRange)}&access_token=${encodeURIComponent(token)}`;
      const ins = await (await fetch(insUrl)).json();
      if (ins.data && ins.data.length) {
        ins.data.forEach((row) => {
          const imp = Number(row.impressions) || 0;
          impressions += imp;
          if (imp > 0 && !topCampaign) topCampaign = row.campaign_name || "";
        });
        if (!topCampaign && ins.data[0]) topCampaign = ins.data[0].campaign_name || "";
      }
    } catch (e) {}
    ranked.push({ ...a, impressions, topCampaign });
    console.log(
      `  ${a.id}  ${a.name || ""}  imp(7d)=${impressions}` +
        (topCampaign ? `  campaign: ${topCampaign}` : "")
    );
  }

  ranked.sort((x, y) => y.impressions - x.impressions);
  const primary = ranked[0].impressions > 0 ? ranked[0].id : rows[0].id;
  const pick = ranked.find((r) => r.impressions > 0) || ranked[0];

  console.log("");
  console.log("Recommended (most impressions in last 7 days):");
  console.log(`  ${pick.id}  ${pick.name}  (${pick.impressions} impressions)`);
  console.log("");
  console.log("Add to .env.local (and Vercel):");
  console.log(`META_AD_ACCOUNT_ID=${primary}`);
  console.log("");
  console.log("META_AD_ACCESS_TOKEN should already be set if this script ran successfully.");
  console.log("Restart dev server, then reload CRM → Funnel Analytics → LP Facebook.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
