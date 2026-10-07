#!/usr/bin/env node
/**
 * Backfill contacts.meta_ad_id from ManyChat custom field meta_ad_id.
 * Use after CTWA + Set Custom Field is live; does not fix missing ManyChat data.
 *
 *   node scripts/sync-manychat-meta-ad-ids.js --dry-run
 *   node scripts/sync-manychat-meta-ad-ids.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

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

async function rest(base, key, method, pathAndQuery, body) {
  const url = `${base.replace(/\/$/, "")}/rest/v1${pathAndQuery}`;
  const r = await fetch(url, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: method === "PATCH" ? "return=minimal" : "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${pathAndQuery}: ${r.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  loadEnvLocal();
  const dry = process.argv.includes("--dry-run");
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.MANYCHAT_API_KEY;
  if (!base || !key) {
    console.error("Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  if (!apiKey) {
    console.error("Need MANYCHAT_API_KEY in .env.local");
    process.exit(1);
  }

  const { fetchManychatSubscriber } = require("../lib/manychat-pull");
  const rows = await rest(
    base,
    key,
    "GET",
    "/contacts?select=id,manychat_subscriber_id,meta_ad_id&manychat_subscriber_id=not.is.null&meta_ad_id=is.null&order=created_at.desc&limit=500"
  );
  const list = Array.isArray(rows) ? rows : [];
  console.log(`Candidates (subscriber id, no meta_ad_id): ${list.length}${dry ? " [dry-run]" : ""}`);

  let updated = 0;
  let found = 0;
  let skipped = 0;

  for (const row of list) {
    const sub = String(row.manychat_subscriber_id || "").trim();
    if (!sub) {
      skipped++;
      continue;
    }
    const pulled = await fetchManychatSubscriber(sub, { apiKey });
    if (!pulled.ok) {
      skipped++;
      continue;
    }
    const ad = pulled.normalized && pulled.normalized.meta_ad_id;
    if (!ad) {
      skipped++;
      continue;
    }
    found++;
    if (dry) {
      console.log(`would set contact ${row.id} meta_ad_id=${ad}`);
      updated++;
      continue;
    }
    await rest(base, key, "PATCH", `/contacts?id=eq.${encodeURIComponent(row.id)}`, {
      meta_ad_id: String(ad),
      updated_at: new Date().toISOString(),
    });
    updated++;
  }

  console.log(`Done. manychat had ad id: ${found}, patched: ${updated}, skipped: ${skipped}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
