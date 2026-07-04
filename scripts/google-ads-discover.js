#!/usr/bin/env node
/**
 * List Google Ads accounts accessible to GOOGLE_ADS_REFRESH_TOKEN.
 *
 * Usage:
 *   node scripts/google-ads-discover.js
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

const { google } = require("googleapis");
const { googleAdsConfig, getOAuthRedirectUri, googleAdsConfigStatus } = require("../lib/google-ads-api");

async function main() {
  const status = googleAdsConfigStatus();
  if (!status.configured) {
    console.log("Google Ads API not configured.");
    console.log("Missing:", (status.missing || []).join(", "));
    process.exit(1);
  }

  const cfg = googleAdsConfig();
  const oauth2Client = new google.auth.OAuth2(cfg.clientId, cfg.clientSecret, getOAuthRedirectUri());
  oauth2Client.setCredentials({ refresh_token: cfg.refreshToken });
  const { token } = await oauth2Client.getAccessToken();
  if (!token) {
    console.error("Could not refresh access token.");
    process.exit(1);
  }

  const res = await fetch("https://googleads.googleapis.com/v24/customers:listAccessibleCustomers", {
    headers: {
      Authorization: "Bearer " + token,
      "developer-token": cfg.developerToken,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("API error:", (body.error && body.error.message) || res.status);
    process.exit(1);
  }

  const names = body.resourceNames || [];
  if (!names.length) {
    console.log("No accessible Google Ads accounts for this OAuth user.");
    process.exit(0);
  }

  console.log("Accessible Google Ads accounts:\n");
  names.forEach((name) => {
    const id = String(name).replace(/^customers\//, "");
    const isManager = id === cfg.loginCustomerId || id === cfg.customerId;
    console.log("  " + id + (isManager ? "  (matches env)" : ""));
  });

  console.log("\nSuggested .env.local:");
  const ids = names.map((n) => String(n).replace(/^customers\//, ""));
  const manager = ids.find((id) => id === "3373755801") || ids.find((id) => id.length === 10);
  const client = ids.find((id) => id !== manager) || ids[0];
  if (manager && client && manager !== client) {
    console.log("GOOGLE_ADS_LOGIN_CUSTOMER_ID=" + manager);
    console.log("GOOGLE_ADS_CUSTOMER_ID=" + client);
  } else {
    console.log("GOOGLE_ADS_CUSTOMER_ID=" + (client || ids[0]));
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
