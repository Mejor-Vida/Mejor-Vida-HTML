#!/usr/bin/env node
/**
 * Import a scanned virtual-mailbox PDF into staff_mailbox_items.
 *
 * Usage:
 *   node scripts/import-staff-mailbox.js \
 *     --file "/path/to/mail-….pdf" \
 *     --from "Mutual of Omaha" \
 *     --date 2026-07-28
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */
const fs = require("fs");
const path = require("path");

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

const BUCKET = "staff-mailbox";

function sbHeaders(key, extra) {
  return Object.assign(
    { apikey: key, Authorization: `Bearer ${key}` },
    extra || {}
  );
}

async function sbFetch(base, key, suffix, options = {}) {
  const r = await fetch(`${base}/rest/v1${suffix}`, {
    ...options,
    headers: {
      ...sbHeaders(key, { "Content-Type": "application/json" }),
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : [];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { file: "", from: "", date: "", notes: "", sourceId: "" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file") out.file = args[++i] || "";
    else if (args[i] === "--from") out.from = args[++i] || "";
    else if (args[i] === "--date") out.date = args[++i] || "";
    else if (args[i] === "--notes") out.notes = args[++i] || "";
    else if (args[i] === "--source-id") out.sourceId = args[++i] || "";
  }
  return out;
}

function parseSourceIdFromFilename(filename) {
  const m = String(filename || "").match(/^mail-\d+-\d+-(\d+)-\d+-c\d+/i);
  return m ? m[1] : null;
}

function fileMtimeDate(filePath) {
  try {
    const st = fs.statSync(filePath);
    return st.mtime.toISOString().slice(0, 10);
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

async function main() {
  const { file, from, date, notes, sourceId: sourceIdArg } = parseArgs();
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  if (!file || !fs.existsSync(file)) {
    console.error("Missing or invalid --file path");
    process.exit(1);
  }
  const title = String(from || "").trim();
  if (!title) {
    console.error('Missing --from "Sender Name"');
    process.exit(1);
  }
  const receivedOn =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fileMtimeDate(file);

  const filename = path.basename(file);
  const sourceId = (sourceIdArg || parseSourceIdFromFilename(filename) || "").trim() || null;

  if (sourceId) {
    const existing = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/staff_mailbox_items?source_id=eq.${encodeURIComponent(sourceId)}&select=id,title&limit=1`
    );
    if (existing && existing[0]) {
      console.log(`Skip (already imported): ${sourceId} → ${existing[0].id} (${existing[0].title})`);
      return;
    }
  }

  const buf = fs.readFileSync(file);
  const contentType = filename.toLowerCase().endsWith(".pdf")
    ? "application/pdf"
    : "application/octet-stream";
  const year = receivedOn.slice(0, 4);
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  const storagePath = `${year}/${sourceId || Date.now()}_${safeName}`;

  const up = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "POST",
    headers: sbHeaders(serviceKey, { "Content-Type": contentType, "x-upsert": "true" }),
    body: buf,
  });
  if (!up.ok) {
    const text = await up.text();
    throw new Error(`Storage upload ${up.status}: ${text.slice(0, 400)}`);
  }

  const inserted = await sbFetch(supabaseUrl, serviceKey, "/staff_mailbox_items", {
    method: "POST",
    body: JSON.stringify({
      title,
      from_name: title,
      received_on: receivedOn,
      filename,
      content_type: contentType,
      storage_path: storagePath,
      file_size_bytes: buf.length,
      source_id: sourceId,
      notes: notes ? String(notes).slice(0, 8000) : null,
      uploaded_by: "import-script",
      updated_at: new Date().toISOString(),
    }),
  });
  const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
  console.log(
    `Imported: ${row.id} | ${title} | ${receivedOn} | ${buf.length} bytes | ${storagePath}`
  );
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
