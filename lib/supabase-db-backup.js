/**
 * Logical dump of Supabase public tables via PostgREST (service role).
 * Used on Vercel where Python/psycopg is not available. Local CLI prefers
 * scripts/dump-supabase-backup.py (Postgres COPY, includes auth + storage files).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { spawnSync } = require("child_process");

const SKIP_VIEWS = new Set([
  "unified_leads",
  "quote_lead_funnel",
  "fe_integrity_appointed_best_premiums",
  "term_integrity_best_premiums",
  "term_integrity_appointed_best_premiums",
]);

const LARGE_REBUILDABLE_TABLES = new Set(["term_integrity_premiums"]);

function serviceConfig() {
  const supabaseUrl = String(process.env.SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const serviceKey = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ""
  ).trim();
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

function restHeaders(serviceKey, extra) {
  return Object.assign(
    {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    extra || {}
  );
}

async function listPublicTables(cfg) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/`, {
    headers: restHeaders(cfg.serviceKey, { Accept: "application/openapi+json" }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`PostgREST OpenAPI ${r.status}: ${text.slice(0, 300)}`);
  const spec = JSON.parse(text || "{}");
  const paths = spec.paths || {};
  const names = Object.keys(paths)
    .map((p) => p.replace(/^\//, ""))
    .filter((name) => name && !name.includes("{") && !name.includes("/"))
    .filter((name) => !SKIP_VIEWS.has(name))
    .sort();
  return names;
}

async function dumpTablePages(cfg, table, onRows) {
  const pageSize = Number(process.env.BACKUP_REST_PAGE_SIZE || 500) || 500;
  let offset = 0;
  let total = 0;
  for (;;) {
    const url = `${cfg.supabaseUrl}/rest/v1/${encodeURIComponent(table)}?select=*&limit=${pageSize}&offset=${offset}`;
    const r = await fetch(url, {
      headers: restHeaders(cfg.serviceKey, {
        Prefer: "count=exact",
      }),
    });
    const text = await r.text();
    if (!r.ok) throw new Error(`select ${table} ${r.status}: ${text.slice(0, 300)}`);
    const rows = text ? JSON.parse(text) : [];
    if (!rows.length) break;
    onRows(rows);
    total += rows.length;
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return total;
}

function skipLargeOnVercel(table) {
  if (!process.env.VERCEL) return false;
  if (String(process.env.BACKUP_INCLUDE_LARGE_TABLES || "").trim() === "1") return false;
  return LARGE_REBUILDABLE_TABLES.has(table);
}

async function dumpPublicTablesRest(outFile) {
  const cfg = serviceConfig();
  if (!cfg) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  const tables = await listPublicTables(cfg);
  const gzip = zlib.createGzip({ level: 9 });
  const out = fs.createWriteStream(outFile);
  const done = new Promise((resolve, reject) => {
    out.on("finish", resolve);
    out.on("error", reject);
    gzip.on("error", reject);
  });
  gzip.pipe(out);

  const manifest = {
    format: "jsonl-gzip",
    createdAt: new Date().toISOString(),
    source: "postgrest",
    tables: {},
    skipped: [],
  };
  gzip.write(JSON.stringify({ _manifestPending: true }) + "\n");

  for (const table of tables) {
    if (skipLargeOnVercel(table)) {
      manifest.skipped.push({ table, reason: "large-rebuildable-on-vercel" });
      continue;
    }
    let count = 0;
    try {
      gzip.write(JSON.stringify({ _table: table }) + "\n");
      count = await dumpTablePages(cfg, table, (rows) => {
        for (const row of rows) gzip.write(JSON.stringify(row) + "\n");
      });
      manifest.tables[table] = { rows: count };
    } catch (e) {
      manifest.skipped.push({ table, reason: e.message || String(e) });
    }
  }

  gzip.write(JSON.stringify({ _manifest: manifest }) + "\n");
  gzip.end();
  await done;
  return manifest;
}

function pythonDumpScriptPath() {
  return path.join(__dirname, "..", "scripts", "dump-supabase-backup.py");
}

function dumpViaPythonCopy(outFile) {
  const script = pythonDumpScriptPath();
  const py = spawnSync("python3", [script, "--out", outFile], {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
    env: process.env,
  });
  if (py.status !== 0 || !fs.existsSync(outFile)) {
    const err = (py.stderr || py.stdout || "python dump failed").trim();
    throw new Error(err.slice(0, 800));
  }
  let manifest = { format: "csv-copy-zip", outFile };
  try {
    manifest = Object.assign(manifest, JSON.parse(String(py.stdout || "").trim()));
  } catch (e) {
    /* stderr has progress; zip is enough */
  }
  return manifest;
}

function timestampStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "Z");
}

async function createBackupArchive(workDir) {
  fs.mkdirSync(workDir, { recursive: true });
  const stamp = timestampStamp();
  const pythonOut = path.join(workDir, `mvi-supabase-${stamp}.zip`);
  const restOut = path.join(workDir, `mvi-supabase-${stamp}.jsonl.gz`);
  const hasDbPassword = !!String(process.env.SUPABASE_DB_PASSWORD || process.env.DATABASE_URL || "").trim();
  if (hasDbPassword && !process.env.VERCEL) {
    const manifest = dumpViaPythonCopy(pythonOut);
    return {
      filePath: pythonOut,
      fileName: path.basename(pythonOut),
      method: "postgres-copy",
      manifest,
    };
  }
  const manifest = await dumpPublicTablesRest(restOut);
  return {
    filePath: restOut,
    fileName: path.basename(restOut),
    method: "postgrest-jsonl",
    manifest,
  };
}

module.exports = {
  SKIP_VIEWS,
  LARGE_REBUILDABLE_TABLES,
  serviceConfig,
  listPublicTables,
  dumpPublicTablesRest,
  dumpViaPythonCopy,
  createBackupArchive,
};
