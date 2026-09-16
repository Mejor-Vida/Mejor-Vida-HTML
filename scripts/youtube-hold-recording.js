#!/usr/bin/env node
/**
 * Put a compressed holding take into the CRM YouTube tab.
 * youtube-recordings is temporary until the lesson is on YouTube.
 *
 *   node scripts/youtube-hold-recording.js --file holding.mp4 --slug cuanto-cuesta-un-funeral
 *   node scripts/youtube-hold-recording.js --file holding.mp4 --audio analysis.wav --slug cuanto-cuesta-un-funeral
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

const { findYoutubeScriptPage } = require("../lib/youtube-script-pages");
const { siblingAudioPath } = require("../lib/youtube-recording-storage");
const { seedFromFiles } = require("../lib/youtube-scripts");

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

async function signObjectUpload(cfg, objectPath) {
  const r = await fetch(
    `${cfg.supabaseUrl}/storage/v1/object/upload/sign/youtube-recordings/${objectPath}`,
    {
      method: "POST",
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    }
  );
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(String((data && (data.message || data.error)) || "Upload URL failed").slice(0, 200));
  }
  const token = data.token || "";
  if (!token) throw new Error("Upload URL failed");
  const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  const raw = String(data.url || data.signedUrl || "");
  let signedUrl;
  if (/^https?:\/\//i.test(raw)) signedUrl = raw;
  else if (raw.indexOf("/storage/v1/") === 0) signedUrl = base + raw;
  else if (raw.indexOf("/object/") === 0) signedUrl = base + "/storage/v1" + raw;
  else {
    signedUrl = `${base}/storage/v1/object/upload/sign/youtube-recordings/${objectPath}?token=${encodeURIComponent(token)}`;
  }
  if (signedUrl.indexOf("token=") === -1) {
    signedUrl += (signedUrl.indexOf("?") === -1 ? "?" : "&") + "token=" + encodeURIComponent(token);
  }
  return { path: objectPath, token, signedUrl, bucket: "youtube-recordings" };
}

async function uploadObject(cfg, objectPath, filePath, mime) {
  const signed = await signObjectUpload(cfg, objectPath);
  const buf = fs.readFileSync(filePath);
  const r = await fetch(signed.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": mime },
    body: buf,
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error("Storage upload " + r.status + ": " + text.slice(0, 300));
  }
}

async function loadRow(cfg, slug) {
  const r = await fetch(
    `${cfg.supabaseUrl}/rest/v1/youtube_page_scripts?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
    {
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
      },
    }
  );
  const text = await r.text();
  if (!r.ok) throw new Error("select " + r.status + ": " + text.slice(0, 200));
  const rows = text ? JSON.parse(text) : [];
  return rows[0] || null;
}

async function upsertRow(cfg, payload) {
  const existing = await loadRow(cfg, payload.slug);
  const method = existing ? "PATCH" : "POST";
  const url = existing
    ? `${cfg.supabaseUrl}/rest/v1/youtube_page_scripts?slug=eq.${encodeURIComponent(payload.slug)}`
    : `${cfg.supabaseUrl}/rest/v1/youtube_page_scripts`;
  const r = await fetch(url, {
    method,
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(existing ? payload : [payload]),
  });
  const text = await r.text();
  if (!r.ok) throw new Error("upsert " + r.status + ": " + text.slice(0, 300));
  const rows = text ? JSON.parse(text) : [];
  return Array.isArray(rows) ? rows[0] : rows;
}

async function main() {
  const filePath = path.resolve(arg("file"));
  const audioPath = arg("audio") ? path.resolve(arg("audio")) : "";
  const slug = arg("slug");
  if (!filePath || !slug) {
    throw new Error("Usage: node scripts/youtube-hold-recording.js --file <mp4> --slug <page-slug> [--audio analysis.wav]");
  }
  if (!fs.existsSync(filePath)) throw new Error("File not found");
  const page = findYoutubeScriptPage(slug);
  if (!page) throw new Error("Unknown page slug: " + slug);
  const cfg = cfgFromEnv();
  const ext = (path.extname(filePath).replace(".", "") || "mp4").toLowerCase();
  const objectPath = slug + "/" + Date.now() + "." + ext;
  const mime = ext === "mov" ? "video/quicktime" : "video/mp4";
  const mb = Math.round(fs.statSync(filePath).size / (1024 * 1024));
  console.log("Uploading holding file (" + mb + " MB)…");
  await uploadObject(cfg, objectPath, filePath, mime);
  if (audioPath) {
    if (!fs.existsSync(audioPath)) throw new Error("Audio file not found");
    console.log("Uploading comparison audio…");
    await uploadObject(cfg, siblingAudioPath(objectPath), audioPath, "audio/wav");
  }
  const existing = await loadRow(cfg, slug);
  const seed = seedFromFiles(slug);
  await upsertRow(cfg, {
    slug,
    title: page.title,
    group_id: page.group,
    url_es: page.urlEs,
    url_en: page.urlEn || "",
    breakdown: (existing && existing.breakdown) || seed.breakdown || "",
    script_en: (existing && existing.script_en) || seed.script_en || "",
    script_es: (existing && existing.script_es) || seed.script_es || "",
    status: "recorded",
    recording_path: objectPath,
    recording_mime: mime,
    updated_at: new Date().toISOString(),
  });
  console.log("Holding file is on the CRM Upload tab for", slug);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
