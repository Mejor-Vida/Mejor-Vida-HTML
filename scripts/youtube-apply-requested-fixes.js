#!/usr/bin/env node
/**
 * Cut requested off-script ranges out of the CRM holding take (ffmpeg).
 *
 *   node scripts/youtube-apply-requested-fixes.js --slug cuanto-cuesta-un-funeral
 *   node scripts/youtube-apply-requested-fixes.js --slug cuanto-cuesta-un-funeral --start 0 --end 3.8
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

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

loadEnvFile(path.join(ROOT, ".env.local"));

const { applyRequestedFixes, shiftPlanTimes } = require("../lib/youtube-apply-requested-fixes");
const { loadScriptRow, patchScriptRow } = require("../lib/youtube-recording-storage");

function arg(name) {
  const i = process.argv.indexOf("--" + name);
  if (i < 0) return "";
  return String(process.argv[i + 1] || "").trim();
}

function cfgFromEnv() {
  const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Missing SUPABASE_URL or service role key");
  return { supabaseUrl, serviceKey };
}

async function main() {
  const slug = arg("slug");
  if (!slug) {
    throw new Error("Usage: node scripts/youtube-apply-requested-fixes.js --slug <page-slug> [--start 0 --end 3.8]");
  }
  const cfg = cfgFromEnv();
  const row = await loadScriptRow(cfg, slug);
  if (!row || !row.recording_path) throw new Error("No recording on file for " + slug);
  const restore = Number(arg("restore-offset"));
  if (Number.isFinite(restore) && restore) {
    row.cut_plan = shiftPlanTimes(row.cut_plan, restore);
  }
  const extraCut =
    arg("start") !== "" && arg("end") !== ""
      ? { start: Number(arg("start")), end: Number(arg("end")), kind: arg("kind") || "off_script" }
      : null;
  const result = await applyRequestedFixes(cfg, {
    slug,
    row,
    extraCut,
    skipRemap: process.argv.indexOf("--no-remap") >= 0,
    localInput: arg("file") || "",
  });
  await patchScriptRow(cfg, slug, {
    recording_path: result.recording_path,
    cut_plan: result.cut_plan,
    updated_at: new Date().toISOString(),
  });
  const remaining = Array.isArray(result.cut_plan && result.cut_plan.issues) ? result.cut_plan.issues.length : 0;
  console.log("Cut applied for", slug);
  console.log("New file:", result.recording_path);
  console.log("Remaining off-script flags:", remaining);
  if (result.reviewed_trims) console.log("Re-reviewed extra trims:", result.reviewed_trims);
  if (result.overcut) console.log("Opening no longer matches the first script line; stopped further start cuts.");
}

main().catch((err) => {
  console.error(String((err && err.message) || err));
  process.exit(1);
});
