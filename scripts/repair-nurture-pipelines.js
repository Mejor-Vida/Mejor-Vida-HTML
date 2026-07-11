#!/usr/bin/env node
/**
 * Re-anchor all active CRM nurture enrollments to true CRM entry dates
 * and rebuild stored pipeline tasks (no sends / no catch-up cron).
 *
 * Usage: node scripts/repair-nurture-pipelines.js [--dry-run]
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
  loadSettings,
  enrollmentPipelineNeedsRebuild,
  rebuildEnrollmentPipelineFromCrmEntry,
  resolveCrmEntryDate,
} = require("../lib/crm-nurture-engine");

function sbHeaders(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function sbFetch(base, key, pathSuffix, options = {}) {
  const r = await fetch(`${base}/rest/v1${pathSuffix}`, {
    ...options,
    headers: { ...sbHeaders(key), ...(options.headers || {}), Prefer: options.prefer || "return=representation" },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : [];
}

async function leadDisplayName(base, key, leadId, leadSourceTable) {
  try {
    const ul = await sbFetch(
      base,
      key,
      `/unified_leads?id=eq.${encodeURIComponent(leadId)}&source_table=eq.${encodeURIComponent(
        leadSourceTable
      )}&select=display_name&limit=1`
    );
    if (ul && ul[0] && ul[0].display_name) return ul[0].display_name;
  } catch (e) {
    /* ignore */
  }
  return `${leadId.slice(0, 8)}…`;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const settings = await loadSettings(supabaseUrl, serviceKey);
  const now = new Date();
  const enrollments = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/crm_nurture_enrollments?status=eq.active&select=*&order=created_at.asc"
  );

  console.log(`Checking ${(enrollments || []).length} active enrollments…\n`);

  let rebuilt = 0;
  let ok = 0;

  for (const enrollment of enrollments || []) {
    const name = await leadDisplayName(
      supabaseUrl,
      serviceKey,
      enrollment.lead_id,
      enrollment.lead_source_table
    );
    const crmEntry = await resolveCrmEntryDate(
      supabaseUrl,
      serviceKey,
      enrollment.lead_id,
      enrollment.lead_source_table
    );
    const dbTasks = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/crm_nurture_tasks?enrollment_id=eq.${enrollment.id}&select=*&order=due_at.asc`
    );
    const audit = await enrollmentPipelineNeedsRebuild(
      supabaseUrl,
      serviceKey,
      enrollment,
      dbTasks,
      settings,
      now
    );

    if (!audit.needs) {
      console.log(`✓ ${name} — OK (CRM entry ${crmEntry.slice(0, 10)}, ${dbTasks.length} tasks)`);
      ok += 1;
      continue;
    }

    console.log(`→ ${name} — rebuild (${audit.reason})`);
    console.log(`   enrolled_at ${(enrollment.enrolled_at || "").slice(0, 10)} → CRM ${crmEntry.slice(0, 10)}`);

    if (dryRun) {
      rebuilt += 1;
      continue;
    }

    const result = await rebuildEnrollmentPipelineFromCrmEntry(
      supabaseUrl,
      serviceKey,
      enrollment,
      settings,
      { crmEntry, now }
    );
    if (!result.ok) {
      console.error(`   FAILED: ${result.reason || "unknown"}`);
      continue;
    }
    console.log(
      `   rebuilt ${result.task_count} tasks; next send ${(result.next_send_at || "").slice(0, 10)} (${result.next_task_type || "—"})`
    );
    rebuilt += 1;
  }

  console.log(`\nDone. ${ok} already correct, ${rebuilt} ${dryRun ? "would rebuild" : "rebuilt"}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
