/**
 * Register Meta app webhook for WhatsApp Business (CTWA attribution).
 * Optionally subscribe MejorVidaAutomation to the WABA after callback verify.
 *
 * Usage:
 *   node scripts/setup-meta-whatsapp-webhook.js           # app subscription only (triggers GET verify)
 *   node scripts/setup-meta-whatsapp-webhook.js --subscribe-waba
 *
 * Env (.env.local): FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, META_WHATSAPP_VERIFY_TOKEN,
 *   META_WHATSAPP_BUSINESS_ACCOUNT_ID, META_WHATSAPP_ACCESS_TOKEN (short-lived OK for setup)
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

const GRAPH = "https://graph.facebook.com/v21.0";
const CALLBACK = "https://www.mejorvidainsurance.com/api/meta-whatsapp-webhook";

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
  const subscribeWaba = process.argv.includes("--subscribe-waba");
  const appId = String(process.env.FACEBOOK_APP_ID || "").trim();
  const appSecret = String(process.env.FACEBOOK_APP_SECRET || "").trim();
  const verify = String(process.env.META_WHATSAPP_VERIFY_TOKEN || "").trim();
  const wabaId = String(process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || "").trim();
  const userToken = String(process.env.META_WHATSAPP_ACCESS_TOKEN || "").trim();

  if (!appId || !appSecret) throw new Error("Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET");
  if (!verify) throw new Error("Missing META_WHATSAPP_VERIFY_TOKEN");

  const appToken = `${appId}|${appSecret}`;
  const appSub = await graph("POST", `${GRAPH}/${appId}/subscriptions`, {
    object: "whatsapp_business_account",
    callback_url: CALLBACK,
    fields: "messages",
    verify_token: verify,
    access_token: appToken,
  });
  const appMsg =
    appSub.ok ? "ok" : (appSub.json.error && appSub.json.error.message) || JSON.stringify(appSub.json).slice(0, 200);
  console.log("app_subscriptions_whatsapp", appSub.status, appMsg);

  if (!subscribeWaba) {
    console.log("WABA subscribe skipped (pass --subscribe-waba after production GET verify succeeds).");
    return;
  }
  if (!wabaId || !userToken) {
    throw new Error("Missing META_WHATSAPP_BUSINESS_ACCOUNT_ID or META_WHATSAPP_ACCESS_TOKEN for WABA subscribe");
  }

  const wabaSub = await graph("POST", `${GRAPH}/${wabaId}/subscribed_apps`, {
    access_token: userToken,
  });
  const wabaMsg =
    wabaSub.ok ? "ok" : (wabaSub.json.error && wabaSub.json.error.message) || JSON.stringify(wabaSub.json).slice(0, 200);
  console.log("waba_subscribed_apps", wabaSub.status, wabaMsg);

  const list = await graph("GET", `${GRAPH}/${wabaId}/subscribed_apps?access_token=${encodeURIComponent(userToken)}`);
  const apps = (list.json && list.json.data) || [];
  console.log(
    "waba_subscribed_apps_list",
    list.status,
    apps.map((a) => a.whatsapp_business_api_data && a.whatsapp_business_api_data.id).filter(Boolean).join(",") || "none"
  );
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
