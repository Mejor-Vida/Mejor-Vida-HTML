#!/usr/bin/env node
/**
 * Catch-up: collapse duplicate contact enrollments, then auto-enroll
 * New/Contacted CRM profiles that have no active nurture row.
 *
 * Usage: node scripts/auto-enroll-crm-nurture.js [--dry-run]
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Does not print emails, phones, or other PII.
 */

const path = require("path");
const fs = require("fs");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m || process.env[m[1]]) return;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    });
}

loadEnvLocal();

const {
  collapseDuplicateContactEnrollments,
  enrollEligibleUnenrolledLeads,
} = require("../lib/crm-nurture-engine");

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const supabaseUrl = process.env.SUPABASE_URL && process.env.SUPABASE_URL.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const cfg = { supabaseUrl, serviceKey };
  console.log(dryRun ? "Dry run: collapse only, no new enrollments.\n" : "Auto-enrolling eligible CRM leads…\n");

  const collapsed = await collapseDuplicateContactEnrollments(cfg);
  console.log(`Duplicate sequences cancelled: ${collapsed.cancelled}`);
  (collapsed.results || []).forEach((row) => {
    console.log(
      `  cancelled ${String(row.lead_source_table)} ${String(row.lead_id).slice(0, 8)}… kept ${String(
        row.kept_lead_id
      ).slice(0, 8)}…`
    );
  });

  if (dryRun) {
    process.exit(0);
    return;
  }

  const enrolled = await enrollEligibleUnenrolledLeads(cfg, {
    limit: 300,
    actor: "auto_enroll_catchup",
  });
  console.log(
    `Newly enrolled: ${enrolled.enrolled}  skipped: ${enrolled.skipped}  extra duplicates cancelled: ${enrolled.duplicates_cancelled}`
  );
  (enrolled.results || []).forEach((row) => {
    console.log(
      `  enrolled ${String(row.lead_source_table)} ${String(row.lead_id).slice(0, 8)}… backdated=${!!row.backdated}`
    );
  });
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
