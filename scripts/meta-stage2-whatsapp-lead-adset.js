#!/usr/bin/env node
/**
 * Stage 2: inspect / plan / create a WhatsApp ad set optimized for Lead (CAPI Intent Lead).
 * Stage 1 stays on "conversations" — use a NEW ad set. See integrations/META_STAGE2_LEAD_OPTIMIZATION.md
 *
 *   node scripts/meta-stage2-whatsapp-lead-adset.js inspect --adset-name "Stage 1 visuals"
 *   node scripts/meta-stage2-whatsapp-lead-adset.js plan --source-adset-id 123456789
 *   node scripts/meta-stage2-whatsapp-lead-adset.js create --source-adset-id 123 --campaign-id 456 --name "Stage 2 hooks – Leads"
 */
const fs = require("fs");
const path = require("path");
const { metaAdConfig, metaConfigStatus } = require("../lib/ad-platform-insights");

const ROOT = path.join(__dirname, "..");
const VERSION = String(process.env.META_GRAPH_API_VERSION || "v19.0").trim();

const ADSET_FIELDS = [
  "id",
  "name",
  "campaign_id",
  "effective_status",
  "optimization_goal",
  "billing_event",
  "bid_strategy",
  "daily_budget",
  "lifetime_budget",
  "destination_type",
  "promoted_object",
  "targeting",
  "status",
].join(",");

function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) process.env[key] = val;
  }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) return "";
  return String(process.argv[i + 1]).trim();
}

async function graphGet(pathSeg, params = {}) {
  const { token } = metaAdConfig();
  const q = new URLSearchParams(params);
  q.set("access_token", token);
  const url = `https://graph.facebook.com/${VERSION}/${pathSeg}?${q.toString()}`;
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
  return j;
}

async function graphPost(pathSeg, body) {
  const { token } = metaAdConfig();
  const form = new URLSearchParams();
  form.set("access_token", token);
  for (const [k, v] of Object.entries(body)) {
    if (v === undefined || v === null) continue;
    form.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  const url = `https://graph.facebook.com/${VERSION}/${pathSeg}`;
  const r = await fetch(url, { method: "POST", body: form });
  const j = await r.json().catch(() => ({}));
  if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
  return j;
}

async function listAdsetsInAccount() {
  const { accountId } = metaAdConfig();
  const j = await graphGet(`${accountId}/adsets`, {
    fields: ADSET_FIELDS,
    limit: "200",
  });
  return j.data || [];
}

async function findAdset({ id, nameSub }) {
  if (id && /^\d+$/.test(id)) {
    return graphGet(id, { fields: ADSET_FIELDS });
  }
  const needle = String(nameSub || "").toLowerCase();
  if (!needle) throw new Error("Pass --adset-id or --adset-name / --source-adset-name");
  const rows = await listAdsetsInAccount();
  const hit = rows.find((r) => String(r.name || "").toLowerCase().includes(needle));
  if (!hit) throw new Error(`No ad set name containing "${nameSub}"`);
  return graphGet(hit.id, { fields: ADSET_FIELDS });
}

function leadAdsetPayloadFromSource(source, { campaignId, name }) {
  const promoted = source.promoted_object ? { ...source.promoted_object } : {};
  const targeting = source.targeting ? { ...source.targeting } : undefined;
  const daily = source.daily_budget ? String(source.daily_budget) : undefined;
  const lifetime = source.lifetime_budget ? String(source.lifetime_budget) : undefined;

  const body = {
    name: name || `${source.name || "WhatsApp"} – Leads`,
    campaign_id: campaignId || source.campaign_id,
    status: "PAUSED",
    billing_event: source.billing_event || "IMPRESSIONS",
    bid_strategy: source.bid_strategy || "LOWEST_COST_WITHOUT_CAP",
    destination_type: source.destination_type || "WHATSAPP",
    promoted_object: promoted,
    optimization_goal: "LEAD_GENERATION",
  };
  if (targeting) body.targeting = targeting;
  if (daily) body.daily_budget = daily;
  else if (lifetime) body.lifetime_budget = lifetime;

  return body;
}

async function cmdInspect() {
  const row = await findAdset({
    id: arg("adset-id") || arg("source-adset-id"),
    nameSub: arg("adset-name") || arg("source-adset-name"),
  });
  console.log(JSON.stringify(row, null, 2));
}

async function cmdPlan() {
  const source = await findAdset({
    id: arg("source-adset-id"),
    nameSub: arg("source-adset-name"),
  });
  const campaignId = arg("campaign-id") || source.campaign_id;
  const name = arg("new-name") || arg("name") || `Stage 2 hooks – WhatsApp – Leads`;
  const plan = leadAdsetPayloadFromSource(source, { campaignId, name });
  console.log("# Dry-run only — review before create\n");
  console.log(JSON.stringify({ source_adset_id: source.id, create: plan }, null, 2));
  console.log(
    "\nIf optimization_goal LEAD_GENERATION fails, inspect source optimization_goal and Events Manager Lead mapping; adjust create payload per Graph error."
  );
}

async function cmdCreate() {
  const sourceId = arg("source-adset-id");
  if (!sourceId) throw new Error("--source-adset-id required for create");
  const campaignId = arg("campaign-id");
  if (!campaignId) throw new Error("--campaign-id required for create (Stage 2 campaign)");
  const source = await graphGet(sourceId, { fields: ADSET_FIELDS });
  const name = arg("name") || arg("new-name") || `Stage 2 hooks – WhatsApp – Leads`;
  const body = leadAdsetPayloadFromSource(source, { campaignId, name });
  const out = await graphPost(`${metaAdConfig().accountId}/adsets`, body);
  console.log(JSON.stringify({ created_adset_id: out.id, status: "PAUSED" }, null, 2));
  console.log("Add ads via Ad Builder / Ads Manager; wire ManyChat CTWA per new ad id.");
}

async function main() {
  loadEnvLocal();
  const status = metaConfigStatus();
  if (!status.configured) {
    console.error(status.reason);
    process.exit(1);
  }
  const cmd = process.argv[2];
  if (cmd === "inspect") await cmdInspect();
  else if (cmd === "plan") await cmdPlan();
  else if (cmd === "create") await cmdCreate();
  else {
    console.error("Usage: inspect | plan | create (see integrations/META_STAGE2_LEAD_OPTIMIZATION.md)");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
