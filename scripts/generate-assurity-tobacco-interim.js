#!/usr/bin/env node
/**
 * Add interim Assurity tobacco rows to assurity_protect_plus_premiums_10k.csv
 * using per-age smoker/NT ratios from migration 050 applied to current 051 NT anchors.
 *
 * Replace with agent_center rows when Agent Center illustrations are exported.
 */
const fs = require("fs");
const path = require("path");

const CSV_PATH = path.join(
  __dirname,
  "../integrations/knowledge/Assurity_Knowledge/assurity_protect_plus_premiums_10k.csv"
);
const MIGRATION_050 = path.join(
  __dirname,
  "../integrations/supabase/migrations/050_quote_ranges_assurity.sql"
);
const MIGRATION_051 = path.join(
  __dirname,
  "../integrations/supabase/migrations/051_quote_ranges_assurity_assurity_only.sql"
);

function parseQuoteRows(sql) {
  const map = new Map();
  const re =
    /\(\s*(\d+)\s*,\s*'(male|female)'\s*,\s*(true|false)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/g;
  let m;
  while ((m = re.exec(sql))) {
    map.set(`${m[1]}:${m[2]}:${m[3]}`, {
      age: parseInt(m[1], 10),
      sex: m[2],
      smoker: m[3] === "true",
      low: parseFloat(m[4]),
    });
  }
  return map;
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const header = lines[0].split(",").map((h) => h.trim());
  return {
    header,
    rows: lines.slice(1).map((line) => {
      const parts = line.split(",");
      const row = {};
      header.forEach((h, i) => {
        row[h] = parts[i] ? parts[i].trim() : "";
      });
      return row;
    }),
  };
}

function main() {
  const old = parseQuoteRows(fs.readFileSync(MIGRATION_050, "utf8"));
  const cur = parseQuoteRows(fs.readFileSync(MIGRATION_051, "utf8"));
  const { header, rows } = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));

  const withoutTobacco = rows.filter(
    (r) => r.uw_class !== "preferred_tobacco" && r.uw_class !== "standard_tobacco"
  );

  const added = [];
  for (let age = 18; age <= 44; age++) {
    for (const sex of ["male", "female"]) {
      const ntOld = old.get(`${age}:${sex}:false`);
      const smokerOld = old.get(`${age}:${sex}:true`);
      const ntCur = cur.get(`${age}:${sex}:false`);
      if (!ntOld || !smokerOld || !ntCur) continue;
      const ratio = smokerOld.low / ntOld.low;
      const monthly = Math.round(ntCur.low * ratio * 100) / 100;
      withoutTobacco.push({
        age: String(age),
        sex,
        uw_class: "preferred_tobacco",
        monthly: monthly.toFixed(2),
        source: "moo_ratio_calibrated_v050",
      });
      added.push({ age, sex, monthly });
    }
  }

  const out = [
    header.join(","),
    ...withoutTobacco.map((r) =>
      header.map((h) => r[h] ?? "").join(",")
    ),
  ].join("\n") + "\n";

  fs.writeFileSync(CSV_PATH, out);
  console.log("Added preferred_tobacco rows:", added.length);
  console.log("Sample age 30 male:", added.find((r) => r.age === 30 && r.sex === "male"));
}

main();
