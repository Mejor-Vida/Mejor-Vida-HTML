#!/usr/bin/env node
/**
 * Import one Assurity Protect+ $10K monthly premium from Agent Center Quick Quote.
 *
 *   node scripts/assurity-fe-spot-import.js --age 40 --sex male --monthly 19.33 --class preferred_tobacco
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const CSV_PATH = path.join(
  __dirname,
  "../integrations/knowledge/Assurity_Knowledge/assurity_protect_plus_premiums_10k.csv"
);

function parseArgs(argv) {
  const out = { uw_class: "preferred_tobacco", source: "agent_center" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--age") out.age = parseInt(argv[++i], 10);
    else if (a === "--sex") out.sex = String(argv[++i]).toLowerCase();
    else if (a === "--monthly") out.monthly = Number(String(argv[++i]).replace(/[$,]/g, ""));
    else if (a === "--class") out.uw_class = String(argv[++i]).trim();
    else if (a === "--source") out.source = String(argv[++i]).trim();
  }
  return out;
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
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

function main() {
  const args = parseArgs(process.argv);
  if (!Number.isFinite(args.age) || args.age < 18 || args.age > 44) {
    console.error("age required (18–44)");
    process.exit(1);
  }
  if (args.sex !== "male" && args.sex !== "female") {
    console.error("sex must be male or female");
    process.exit(1);
  }
  if (!Number.isFinite(args.monthly) || args.monthly <= 0) {
    console.error("monthly premium required");
    process.exit(1);
  }

  const monthly = Math.round(args.monthly * 100) / 100;
  const { header, rows } = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const key = `${args.age}:${args.sex}:${args.uw_class}`;
  let replaced = false;
  const next = rows.filter((r) => {
    const k = `${r.age}:${r.sex}:${r.uw_class}`;
    if (k === key) {
      replaced = true;
      return false;
    }
    return true;
  });
  next.push({
    age: String(args.age),
    sex: args.sex,
    uw_class: args.uw_class,
    monthly: monthly.toFixed(2),
    source: args.source,
  });
  next.sort((a, b) => {
    const ageA = parseInt(a.age, 10);
    const ageB = parseInt(b.age, 10);
    if (ageA !== ageB) return ageA - ageB;
    if (a.sex !== b.sex) return a.sex.localeCompare(b.sex);
    return a.uw_class.localeCompare(b.uw_class);
  });

  fs.writeFileSync(
    CSV_PATH,
    [header.join(","), ...next.map((r) => header.map((h) => r[h] || "").join(","))].join("\n") +
      "\n",
    "utf8"
  );
  console.log(
    replaced ? "Updated" : "Added",
    `age ${args.age} ${args.sex} ${args.uw_class} → $${monthly.toFixed(2)}/mo (${args.source})`
  );

  const build = spawnSync("node", ["scripts/build-assurity-quote-ranges-from-csv.js"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
  });
  if (build.status !== 0) process.exit(build.status || 1);
  console.log("Rebuilt quote_ranges_assurity SQL — apply with: python3 integrations/supabase/apply_migrations.py");
}

main();
