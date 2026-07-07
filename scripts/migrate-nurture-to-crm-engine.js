#!/usr/bin/env node
/**
 * Migrate active nurture_sequence rows to CRM nurture engine enrollments.
 *
 * Usage: node scripts/migrate-nurture-to-crm-engine.js [--dry-run]
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local (loaded via dotenv if present)
 */

const path = require("path");
const fs = require("fs");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  lines.forEach((line) => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m || process.env[m[1]]) return;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  });
}

loadEnvLocal();

const { enrollLead, cancelActiveEnrollment } = require("../lib/crm-nurture-engine");

function sbHeaders(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function sbFetch(base, key, pathSuffix, options = {}) {
  const r = await fetch(`${base}/rest/v1${pathSuffix}`, {
    ...options,
    headers: { ...sbHeaders(key), ...(options.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : [];
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const cfg = { supabaseUrl, serviceKey };
  const active = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/nurture_sequence?status=eq.active&select=contact_id,phase,step,enrolled_at&limit=500"
  );

  console.log(`Found ${(active || []).length} active legacy nurture_sequence rows`);
  let migrated = 0;

  for (const row of active || []) {
    const contactId = row.contact_id;
    if (!contactId) continue;

    const profiles = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/staff_lead_profiles?select=lead_id,lead_source_table,profile_data&profile_data->>contacts_contact_id=eq.${contactId}&limit=5`
    );

    let leadId = contactId;
    let leadSourceTable = "contacts";
    let stage = "new";

    if (profiles && profiles[0]) {
      leadId = profiles[0].lead_id;
      leadSourceTable = profiles[0].lead_source_table;
      const ps = String((profiles[0].profile_data && profiles[0].profile_data.pipeline_stage) || "").toLowerCase();
      if (ps === "contacted" || ps === "engaged") stage = ps === "engaged" ? "contacted" : "contacted";
      else if (ps === "new") stage = "new";
      else stage = "contacted";
    } else {
      const ls = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/lead_state?contact_id=eq.${contactId}&select=pipeline_stage&limit=1`
      );
      const lps = ls && ls[0] ? String(ls[0].pipeline_stage || "").toLowerCase() : "";
      if (["call_scheduled", "call_completed", "quoted", "engaged"].includes(lps)) stage = "contacted";
    }

    console.log(`${dryRun ? "[dry-run] " : ""}Migrate contact ${contactId} → ${leadSourceTable}/${leadId} stage=${stage}`);

    if (!dryRun) {
      await enrollLead(cfg, { leadId, leadSourceTable, stage, contactId, backdateToCrmEntry: true });
      await sbFetch(supabaseUrl, serviceKey, `/nurture_sequence?contact_id=eq.${contactId}&status=eq.active`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "cancelled", stopped_reason: "migrated_to_crm_engine" }),
      });
    }
    migrated++;
  }

  console.log(`Done. Migrated ${migrated} rows${dryRun ? " (dry-run)" : ""}.`);
  console.log("Old crons nurture-cron / nurture-enroll-cron removed from vercel.json.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
