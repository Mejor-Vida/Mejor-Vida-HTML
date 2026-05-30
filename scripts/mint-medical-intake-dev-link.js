#!/usr/bin/env node
/**
 * Mint a local medical intake preview link (same token flow as production email).
 *
 *   npm run mint:intake-link
 *   npm run mint:intake-link -- --lead-id=UUID --source-table=contacts
 *
 * Requires: .env.local with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and a token secret.
 * Open the printed URL while `npm run dev:local` is running.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}

function parseArgs(argv) {
  const out = { leadId: "", sourceTable: "contacts", email: "dev-preview@localhost" };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--lead-id=")) out.leadId = arg.slice("--lead-id=".length).trim();
    else if (arg.startsWith("--source-table=")) out.sourceTable = arg.slice("--source-table=".length).trim();
    else if (arg.startsWith("--email=")) out.email = arg.slice("--email=".length).trim();
  }
  return out;
}

async function restSelect(cfg, table, query) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`select ${table} ${r.status}: ${text.slice(0, 240)}`);
  return JSON.parse(text || "[]");
}

async function pickLeadId(cfg) {
  for (const table of ["contacts", "quote_lead_submissions", "manychat_leads"]) {
    try {
      const rows = await restSelect(cfg, table, "select=id&order=updated_at.desc&limit=1");
      if (Array.isArray(rows) && rows[0] && rows[0].id) {
        return { leadId: rows[0].id, sourceTable: table };
      }
    } catch (_) {
      /* table may not exist in this project */
    }
  }
  throw new Error("No lead found — pass --lead-id=UUID --source-table=contacts");
}

async function main() {
  loadEnvLocal();
  const { issueToken } = require("../lib/medical-intake-token");
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  const cfg = { supabaseUrl, serviceKey };

  const args = parseArgs(process.argv);
  let leadId = args.leadId;
  let sourceTable = args.sourceTable;
  if (!leadId) {
    const picked = await pickLeadId(cfg);
    leadId = picked.leadId;
    sourceTable = picked.sourceTable;
    console.log(`Using latest lead: ${leadId} (${sourceTable})`);
  }

  const port = Number(process.env.PORT || 3000);
  const localBase = `http://localhost:${port}`;
  process.env.SITE_BASE_URL = localBase;

  const issued = await issueToken(cfg, {
    leadId,
    leadSourceTable: sourceTable,
    recipientEmail: args.email,
    issuedBy: "dev:mint-medical-intake-dev-link",
  });

  const localUrl = `${localBase}/medical-intake.html?t=${encodeURIComponent(issued.rawToken)}`;

  console.log("");
  console.log("Medical intake preview link (local dev)");
  console.log("────────────────────────────────────────");
  console.log(localUrl);
  console.log("────────────────────────────────────────");
  console.log("Start the server first:  npm run dev:local");
  console.log("Token expires:", issued.expiresAt);
  console.log("");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
