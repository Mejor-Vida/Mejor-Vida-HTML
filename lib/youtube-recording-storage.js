/**
 * Temporary holding for Julie's camera takes.
 * Files live in the youtube-recordings bucket only until the lesson is
 * edited and on the agency YouTube channel — then they are deleted.
 */
"use strict";

function siblingAudioPath(videoPath) {
  return String(videoPath || "").replace(/\.[^.]+$/, "") + ".audio.wav";
}

function recordingPathForSlug(slug, path) {
  const p = String(path || "")
    .trim()
    .replace(/^\/+/, "");
  if (!p || p.includes("..") || p.includes("\\") || p.length > 240) return "";
  if (p.indexOf(String(slug) + "/") !== 0) return "";
  return p;
}

function cfgFromEnv() {
  const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

async function removeRecordingObject(cfg, path) {
  const safe = String(path || "").replace(/^\/+/, "");
  if (!safe) return;
  const r = await fetch(`${cfg.supabaseUrl}/storage/v1/object/youtube-recordings`, {
    method: "DELETE",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [safe] }),
  });
  if (!r.ok && r.status !== 404) {
    const text = await r.text().catch(() => "");
    throw new Error(String(text || "Could not delete recording").slice(0, 200));
  }
}

async function purgeRecordingFiles(cfg, recordingPath, slug) {
  const objectPath = slug ? recordingPathForSlug(slug, recordingPath) : String(recordingPath || "").replace(/^\/+/, "");
  if (!objectPath) return;
  try {
    await removeRecordingObject(cfg, objectPath);
    await removeRecordingObject(cfg, siblingAudioPath(objectPath));
  } catch (_) {
    /* still clear the CRM row so a new take can be uploaded */
  }
}

async function loadScriptRow(cfg, slug) {
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
  if (!r.ok) throw new Error(`youtube_page_scripts ${r.status}: ${text.slice(0, 200)}`);
  const rows = text ? JSON.parse(text) : [];
  return rows && rows[0] ? rows[0] : null;
}

async function patchScriptRow(cfg, slug, payload) {
  const r = await fetch(
    `${cfg.supabaseUrl}/rest/v1/youtube_page_scripts?slug=eq.${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    }
  );
  const text = await r.text();
  if (!r.ok) throw new Error(`youtube_page_scripts patch ${r.status}: ${text.slice(0, 200)}`);
  const rows = text ? JSON.parse(text) : [];
  return Array.isArray(rows) ? rows[0] : rows;
}

/**
 * After the cut is on YouTube, drop the holding files. Script/transcript stay.
 */
async function purgeCrmRecordingAfterYoutube(slug, youtubeId) {
  const cfg = cfgFromEnv();
  if (!cfg) {
    console.log("CRM holding file left in place (no Supabase env).");
    return { ok: false, skipped: true };
  }
  const row = await loadScriptRow(cfg, slug);
  if (!row) {
    console.log("No CRM holding row for", slug);
    return { ok: true, skipped: true };
  }
  await purgeRecordingFiles(cfg, row.recording_path, slug);
  const saved = await patchScriptRow(cfg, slug, {
    status: "published",
    youtube_id: String(youtubeId || row.youtube_id || ""),
    recording_path: "",
    recording_mime: "",
    updated_at: new Date().toISOString(),
  });
  console.log("Removed CRM holding file for", slug);
  return { ok: true, item: saved };
}

module.exports = {
  siblingAudioPath,
  recordingPathForSlug,
  removeRecordingObject,
  purgeRecordingFiles,
  purgeCrmRecordingAfterYoutube,
};
