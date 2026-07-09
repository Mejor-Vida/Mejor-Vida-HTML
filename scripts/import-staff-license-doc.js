#!/usr/bin/env node
/**
 * Upsert a state license row and upload a document to staff licensing storage.
 *
 * Usage:
 *   node scripts/import-staff-license-doc.js --state KS --file "/path/to/license.pdf"
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

const BUCKET = "staff-licensing-docs";

function sbHeaders(key, extra) {
  return Object.assign(
    { apikey: key, Authorization: `Bearer ${key}` },
    extra || {}
  );
}

async function sbFetch(base, key, suffix, options = {}) {
  const r = await fetch(`${base}/rest/v1${suffix}`, {
    ...options,
    headers: { ...sbHeaders(key, { "Content-Type": "application/json" }), ...(options.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : [];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { file: "", state: "", license: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file") out.file = args[++i] || "";
    else if (args[i] === "--state") out.state = (args[++i] || "").toUpperCase();
    else if (args[i] === "--json") out.license = JSON.parse(args[++i] || "{}");
  }
  return out;
}

async function main() {
  const { file, state, license } = parseArgs();
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
  if (!state || state.length !== 2) {
    console.error("Missing --state (2-letter code)");
    process.exit(1);
  }
  if (!license || !license.license_type) {
    console.error("Missing --json license payload");
    process.exit(1);
  }

  const existing = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/staff_state_licenses?state_code=eq.${encodeURIComponent(state)}&license_type=eq.${encodeURIComponent(license.license_type)}&select=id&limit=1`
  );

  let row;
  const now = new Date().toISOString();
  if (existing && existing[0]) {
    const id = existing[0].id;
    const patched = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/staff_state_licenses?id=eq.${id}`,
      { method: "PATCH", body: JSON.stringify({ ...license, updated_at: now }) }
    );
    row = Array.isArray(patched) && patched[0] ? patched[0] : { id, ...license };
    console.log(`Updated ${state} ${license.license_type} license (${id})`);
  } else {
    const inserted = await sbFetch(supabaseUrl, serviceKey, "/staff_state_licenses", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...license, state_code: state, updated_at: now }),
    });
    row = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
    console.log(`Created ${state} ${license.license_type} license (${row.id})`);
  }

  const buf = fs.readFileSync(file);
  const filename = path.basename(file);
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  const storagePath = `state/${row.id}/${Date.now()}_${safeName}`;
  const contentType = filename.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream";

  const up = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "POST",
    headers: sbHeaders(serviceKey, { "Content-Type": contentType, "x-upsert": "true" }),
    body: buf,
  });
  if (!up.ok) {
    const text = await up.text();
    throw new Error(`Storage upload ${up.status}: ${text.slice(0, 400)}`);
  }

  const doc = await sbFetch(supabaseUrl, serviceKey, "/staff_license_documents", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      parent_type: "state",
      parent_id: row.id,
      filename,
      content_type: contentType,
      storage_path: storagePath,
      file_size_bytes: buf.length,
      notes: `Imported ${new Date().toISOString().slice(0, 10)}`,
      uploaded_by: "import-script",
    }),
  });
  const docRow = Array.isArray(doc) && doc[0] ? doc[0] : doc;
  console.log(`Uploaded document: ${docRow.id} (${buf.length} bytes)`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
