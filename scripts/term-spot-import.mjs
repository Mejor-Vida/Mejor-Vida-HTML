#!/usr/bin/env node
/**
 * Fast path: import spot premiums from WinFlex (no Playwright).
 *
 *   npm run term:import-spots
 *   node scripts/term-spot-import.mjs --age 45 --sex male --term 20 --face 250000 --health preferred_plus_nt --monthly 87.42
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPOT_CSV = path.join(
  ROOT,
  "integrations/knowledge/Term_Life_Knowledge/winflex-spot-template.csv"
);
const OUT_CSV = path.join(
  ROOT,
  "integrations/knowledge/Term_Life_Knowledge/term_carrier_premiums.csv"
);
const CAPTURES = path.join(
  ROOT,
  "integrations/knowledge/Term_Life_Knowledge/winflex-captures.jsonl"
);

const POLICY_FEE = 30;
const MODAL = 0.085;

function parseArgs(argv) {
  const out = {
    carrier: "transamerica",
    product: "trendsetter_super",
    state: "NE",
    smoker: 0,
    source_file: "WinFlex_manual",
    source_date: new Date().toISOString().slice(0, 10),
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--age") out.age = parseInt(argv[++i], 10);
    else if (a === "--sex") out.sex = String(argv[++i]).toLowerCase();
    else if (a === "--term") out.term_years = parseInt(argv[++i], 10);
    else if (a === "--face") out.face = parseInt(String(argv[++i]).replace(/[$,]/g, ""), 10);
    else if (a === "--health") out.health_class = String(argv[++i]).trim();
    else if (a === "--monthly") out.monthly = Number(String(argv[++i]).replace(/[$,]/g, ""));
    else if (a === "--smoker") out.smoker = /^1|y|t/i.test(argv[++i]) ? 1 : 0;
    else if (a === "--merge-only") out.mergeOnly = true;
  }
  return out;
}

function faceBand(face) {
  if (face <= 249999) return { min: 100000, max: 249999 };
  if (face <= 499999) return { min: 250000, max: 499999 };
  if (face <= 999999) return { min: 500000, max: 999999 };
  return { min: 1000000, max: 5000000 };
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (!lines.length) return { header: [], rows: [] };
  const header = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const parts = line.split(",");
    const row = {};
    header.forEach((h, i) => {
      row[h] = (parts[i] || "").trim();
    });
    return row;
  });
  return { header, rows };
}

function rowKey(r) {
  return [
    r.carrier,
    r.product,
    r.state,
    r.age,
    r.sex,
    r.smoker,
    r.term_years,
    r.face_band_min,
    r.face_band_max,
    r.health_class,
  ].join("|");
}

function toMainRow(spec) {
  const band = faceBand(spec.face_amount || spec.face);
  return {
    carrier: spec.carrier || "transamerica",
    product: spec.product || "trendsetter_super",
    state: spec.state || "NE",
    age: String(spec.age),
    sex: spec.sex,
    smoker: String(spec.smoker ? 1 : 0),
    term_years: String(spec.term_years),
    face_band_min: String(band.min),
    face_band_max: String(band.max),
    health_class: spec.health_class,
    rate_per_thousand: "",
    policy_fee_annual: String(POLICY_FEE),
    modal_monthly_factor: String(MODAL),
    monthly_premium: String(spec.monthly_premium),
    face_amount: String(spec.face_amount || spec.face),
    source_file: spec.source_file || "WinFlex_manual",
    source_date: spec.source_date || new Date().toISOString().slice(0, 10),
  };
}

function appendCapture(row) {
  const spec = {
    carrier: row.carrier,
    product: row.product,
    term_years: parseInt(row.term_years, 10),
    age: parseInt(row.age, 10),
    sex: row.sex,
    smoker: row.smoker === "1" ? 1 : 0,
    face: parseInt(row.face_amount, 10),
    health_class: row.health_class,
    face_band_min: parseInt(row.face_band_min, 10),
    face_band_max: parseInt(row.face_band_max, 10),
  };
  fs.mkdirSync(path.dirname(CAPTURES), { recursive: true });
  fs.appendFileSync(
    CAPTURES,
    JSON.stringify({
      spec,
      monthly_premium: Number(row.monthly_premium),
      captured_at: new Date().toISOString(),
      source: "spot-import",
    }) + "\n",
    "utf8"
  );
}

function mergeIntoMainCsv(incomingRows) {
  const valid = incomingRows.filter(
    (r) => r.monthly_premium && Number(r.monthly_premium) > 0
  );
  if (!valid.length) {
    console.log("No rows with monthly_premium to import.");
    return 0;
  }

  let header;
  let existing = [];
  if (fs.existsSync(OUT_CSV)) {
    const parsed = parseCsv(fs.readFileSync(OUT_CSV, "utf8"));
    header = parsed.header;
    const incomingCarriers = new Set(valid.map((r) => r.carrier));
    existing = parsed.rows.filter((r) => !incomingCarriers.has(r.carrier));
  } else {
    header = [
      "carrier",
      "product",
      "state",
      "age",
      "sex",
      "smoker",
      "term_years",
      "face_band_min",
      "face_band_max",
      "health_class",
      "rate_per_thousand",
      "policy_fee_annual",
      "modal_monthly_factor",
      "monthly_premium",
      "face_amount",
      "source_file",
      "source_date",
    ];
  }

  const map = new Map();
  for (const r of existing) map.set(rowKey(r), r);
  for (const r of valid) {
    const main = toMainRow(r);
    map.set(rowKey(main), main);
    appendCapture(main);
  }

  const outRows = Array.from(map.values());
  const body = outRows.map((r) => header.map((h) => r[h] ?? "").join(",")).join("\n");
  const comments = [
    "# carrier,product,state,age,sex,smoker,term_years,face_band_min,face_band_max,health_class,rate_per_thousand,policy_fee_annual,modal_monthly_factor,monthly_premium,face_amount,source_file,source_date",
    `# spot import ${new Date().toISOString().slice(0, 10)}`,
  ];
  fs.writeFileSync(
    OUT_CSV,
    comments.join("\n") + "\n" + header.join(",") + "\n" + body + "\n",
    "utf8"
  );
  return valid.length;
}

function importFromSpotTemplate() {
  if (!fs.existsSync(SPOT_CSV)) {
    console.error("Missing:", SPOT_CSV);
    process.exit(1);
  }
  const { rows } = parseCsv(fs.readFileSync(SPOT_CSV, "utf8"));
  const n = mergeIntoMainCsv(rows);
  console.log("Imported", n, "Transamerica spot row(s) →", OUT_CSV);
  if (n) {
    console.log("Next: node scripts/build-term-premiums-migration.js");
    console.log("      python3 integrations/supabase/apply_migrations.py");
  }
  const pending = rows.filter((r) => !r.monthly_premium || Number(r.monthly_premium) <= 0);
  if (pending.length) {
    console.log("\nStill need monthly_premium for", pending.length, "row(s) in winflex-spot-template.csv");
  }
}

function importOneCli(args) {
  if (!args.age || !args.sex || !args.term_years || !args.face || !args.health_class || !args.monthly) {
    console.error(
      "Usage: node scripts/term-spot-import.mjs --age 45 --sex male --term 20 --face 250000 --health preferred_plus_nt --monthly 87.42"
    );
    process.exit(1);
  }
  if (!Number.isFinite(args.monthly) || args.monthly <= 0) {
    console.error("Invalid --monthly");
    process.exit(1);
  }
  const row = toMainRow({
    carrier: args.carrier,
    product: args.product,
    state: args.state,
    age: args.age,
    sex: args.sex,
    smoker: args.smoker,
    term_years: args.term_years,
    face: args.face,
    health_class: args.health_class,
    monthly_premium: args.monthly,
    source_file: args.source_file,
    source_date: args.source_date,
  });
  mergeIntoMainCsv([row]);
  console.log("Added:", row.sex, "age", row.age, row.health_class, "$" + row.monthly_premium + "/mo");
}

function main() {
  const args = parseArgs(process.argv);
  if (args.mergeOnly || process.argv.length <= 2) {
    importFromSpotTemplate();
    return;
  }
  if (args.monthly != null) {
    importOneCli(args);
    return;
  }
  importFromSpotTemplate();
}

main();
