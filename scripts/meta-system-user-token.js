#!/usr/bin/env node
/**
 * Generate a permanent Meta system user token via Graph API (bypasses broken BM UI).
 *
 * Preferred: open /api/staff/meta-ads-auth in the browser (one-time OAuth).
 *
 * CLI fallback:
 *   FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, META_ADMIN_ACCESS_TOKEN in .env.local
 *   npm run meta:system-user-token
 */
const fs = require("fs");
const path = require("path");
const {
  createPermanentMetaAdToken,
  debugMetaToken,
} = require("../lib/meta-system-user-token");
const { getMetaAppConfig } = require("../lib/meta-oauth-config");

const ENV_PATH = path.join(__dirname, "..", ".env.local");

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

async function main() {
  const fileEnv = loadEnvFile(ENV_PATH);
  for (const key of [
    "FACEBOOK_APP_ID",
    "FACEBOOK_APP_SECRET",
    "META_ADMIN_ACCESS_TOKEN",
    "META_SYSTEM_USER_ID",
  ]) {
    if (!process.env[key] && fileEnv[key]) process.env[key] = fileEnv[key];
  }

  const adminToken = String(process.env.META_ADMIN_ACCESS_TOKEN || "").trim();
  const { appId, appSecret, systemUserId } = getMetaAppConfig();

  if (!appSecret) {
    console.error("Missing FACEBOOK_APP_SECRET in .env.local");
    process.exit(1);
  }
  if (!adminToken) {
    console.error("Missing META_ADMIN_ACCESS_TOKEN.");
    console.error("");
    console.error("Easier: open http://localhost:3000/api/staff/meta-ads-auth (or production URL)");
    console.error("");
    console.error("CLI fallback — Graph API Explorer → MejorVidaAutomation →");
    console.error("business_management, ads_read, read_insights → Generate User Access Token");
    console.error("Add META_ADMIN_ACCESS_TOKEN to .env.local, then re-run.");
    process.exit(1);
  }

  console.log("System user:", systemUserId);
  console.log("App:", appId);

  const result = await createPermanentMetaAdToken(adminToken);
  const token = String(result.access_token || "").trim();
  if (!token) {
    console.error("No access_token in response:", JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const debug = await debugMetaToken(token);
  console.log("");
  console.log("Token generated successfully.");
  console.log(
    "Expires:",
    debug.isNeverExpiring ? "never (permanent system user token)" : debug.expiresIso
  );
  console.log("Scopes:", (debug.scopes || []).join(", ") || "(unknown)");
  if (result.fallbackReason) console.log("Note:", result.fallbackReason);
  console.log("");
  console.log("Add to .env.local and Vercel:");
  console.log("META_AD_ACCESS_TOKEN=" + token);
  console.log("META_AD_ACCOUNT_ID=act_845948004443182");
  console.log("");
  console.log("Verify: npm run meta:ads-discover");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  if (err.raw) console.error(JSON.stringify(err.raw, null, 2));
  process.exit(1);
});
