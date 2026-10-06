#!/usr/bin/env node
/**
 * Re-stamp Review sentence times from the current holding take.
 *
 *   node scripts/youtube-realign-timestamps.js --slug cuanto-cuesta-un-funeral
 *   node scripts/youtube-realign-timestamps.js --slug cuanto-cuesta-un-funeral --file /tmp/take.mp4
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

const { loadScriptRow, patchScriptRow } = require("../lib/youtube-recording-storage");
const { transcribeRecording, realignPlanFromTranscript } = require("../lib/youtube-scripts");

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

async function downloadObject(cfg, objectPath, dest) {
  const r = await fetch(`${cfg.supabaseUrl}/storage/v1/object/youtube-recordings/${objectPath}`, {
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
    },
  });
  if (!r.ok) throw new Error("Could not download the take (" + r.status + ")");
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

async function main() {
  const slug = arg("slug");
  if (!slug) throw new Error("Usage: node scripts/youtube-realign-timestamps.js --slug <page-slug> [--file take.mp4]");
  const cfg = cfgFromEnv();
  const row = await loadScriptRow(cfg, slug);
  if (!row) throw new Error("No script row for " + slug);
  const local = arg("file");
  let buf;
  let mime = row.recording_mime || "video/mp4";
  let name = "take.mp4";
  if (local) {
    if (!fs.existsSync(local)) throw new Error("File not found");
    buf = fs.readFileSync(local);
    if (/\.wav$/i.test(local)) {
      mime = "audio/wav";
      name = "take.wav";
    }
  } else {
    const objectPath = String(row.recording_path || "").replace(/^\/+/, "");
    if (!objectPath) throw new Error("No recording on file");
    const dest = path.join("/tmp", slug + "-realign.mp4");
    await downloadObject(cfg, objectPath, dest);
    buf = fs.readFileSync(dest);
  }
  const transcript = await transcribeRecording(buf, name, mime);
  const plan = await realignPlanFromTranscript(row.script_es || "", transcript, row.cut_plan || {});
  await patchScriptRow(cfg, slug, { cut_plan: plan, transcript: transcript.text || row.transcript, updated_at: new Date().toISOString() });
  const rows = (plan.rows || []).filter((r) => String((r && r.script) || "").trim());
  const nine = rows[8];
  console.log("Realigned", rows.length, "script rows");
  if (nine) {
    console.log("Row 9", nine.start, "–", nine.end, String(nine.script || "").slice(0, 48));
  }
}

main().catch((err) => {
  console.error(String((err && err.message) || err));
  process.exit(1);
});
