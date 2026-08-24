/**
 * Subscribe the Facebook Page webhook to `feed` (comments) without dropping `leadgen`.
 * Usage: node scripts/subscribe-facebook-feed-webhook.js
 * Never prints secrets.
 */
const fs = require("fs");
const path = require("path");

function loadEnvFile(p) {
  if (!p || !fs.existsSync(p)) return;
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
loadEnvFile(path.join(__dirname, "..", "facebook-posting", ".env"));

const GRAPH = "https://graph.facebook.com/v21.0";
const CALLBACK = "https://www.mejorvidainsurance.com/api/meta-leadgen-webhook";

async function graph(method, url, body) {
  const r = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/x-www-form-urlencoded" } : undefined,
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const text = await r.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (_) {
    json = { raw: text.slice(0, 300) };
  }
  return { ok: r.ok, status: r.status, json };
}

async function main() {
  const pageId = String(process.env.FACEBOOK_PAGE_ID || "").trim();
  const pageToken = String(
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.META_LEADGEN_PAGE_ACCESS_TOKEN || ""
  ).trim();
  const appId = String(process.env.FACEBOOK_APP_ID || "").trim();
  const appSecret = String(process.env.FACEBOOK_APP_SECRET || "").trim();
  const verify = String(process.env.META_LEADGEN_VERIFY_TOKEN || "").trim();
  if (!pageId || !pageToken) throw new Error("Missing FACEBOOK_PAGE_ID or page token");
  if (!appId || !appSecret) throw new Error("Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET");
  if (!verify) throw new Error("Missing META_LEADGEN_VERIFY_TOKEN");

  const appToken = `${appId}|${appSecret}`;
  const appSub = await graph("POST", `${GRAPH}/${appId}/subscriptions`, {
    object: "page",
    callback_url: CALLBACK,
    fields: "leadgen,feed",
    verify_token: verify,
    access_token: appToken,
  });
  console.log("app_subscriptions", appSub.status, appSub.ok ? "ok" : (appSub.json.error && appSub.json.error.message) || "error");

  const pageSub = await graph("POST", `${GRAPH}/${pageId}/subscribed_apps`, {
    subscribed_fields: "leadgen,feed",
    access_token: pageToken,
  });
  console.log(
    "page_subscribed_apps",
    pageSub.status,
    pageSub.ok ? "ok" : (pageSub.json.error && pageSub.json.error.message) || "error"
  );
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
