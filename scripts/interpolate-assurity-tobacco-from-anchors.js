#!/usr/bin/env node
/**
 * Fill ages 18–44 tobacco premiums by linear interpolation between Agent Center
 * anchor rows (source agent_center*). Male preferred + standard are interpolated
 * directly; female uses interpolated female/male ratio at anchor ages.
 *
 *   node scripts/interpolate-assurity-tobacco-from-anchors.js
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const CSV_PATH = path.join(
  __dirname,
  "../integrations/knowledge/Assurity_Knowledge/assurity_protect_plus_premiums_10k.csv"
);

const ANCHOR_SOURCES = new Set(["agent_center", "agent_center_protect_10pay"]);
const TOBACCO_CLASSES = ["preferred_tobacco", "standard_tobacco"];
const MIN_AGE = 18;
const MAX_AGE = 44;

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

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Piecewise linear interpolate/extrapolate on sorted anchor points. */
function interpolateAge(age, points) {
  const sorted = [...points].sort((a, b) => a.age - b.age);
  if (sorted.length === 1) return sorted[0].value;
  if (age <= sorted[0].age) {
    return lerp(age, sorted[0].age, sorted[0].value, sorted[1].age, sorted[1].value);
  }
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  if (age >= last.age) {
    return lerp(age, prev.age, prev.value, last.age, last.value);
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (age >= a.age && age <= b.age) {
      return lerp(age, a.age, a.value, b.age, b.value);
    }
  }
  return sorted[0].value;
}

function lerp(x, x0, y0, x1, y1) {
  if (x1 === x0) return y0;
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

function collectMaleAnchors(rows, uwClass) {
  return rows
    .filter(
      (r) =>
        r.sex === "male" &&
        r.uw_class === uwClass &&
        ANCHOR_SOURCES.has(r.source) &&
        Number.isFinite(parseInt(r.age, 10))
    )
    .map((r) => ({ age: parseInt(r.age, 10), value: parseFloat(r.monthly) }))
    .filter((p) => Number.isFinite(p.value))
    .sort((a, b) => a.age - b.age);
}

function getRow(rows, age, sex, uwClass) {
  return rows.find(
    (r) =>
      parseInt(r.age, 10) === age && r.sex === sex && r.uw_class === uwClass
  );
}

function upsertRow(rows, header, age, sex, uwClass, monthly, source) {
  const existing = getRow(rows, age, sex, uwClass);
  const payload = {
    age: String(age),
    sex,
    uw_class: uwClass,
    monthly: monthly.toFixed(2),
    source,
  };
  if (existing) {
    Object.assign(existing, payload);
  } else {
    rows.push(payload);
  }
}

function main() {
  const { header, rows } = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));

  const malePrefAnchors = collectMaleAnchors(rows, "preferred_tobacco");
  const maleStdAnchors = collectMaleAnchors(rows, "standard_tobacco");

  if (malePrefAnchors.length < 2) {
    console.error("Need at least 2 male preferred_tobacco Agent Center anchors in CSV.");
    process.exit(1);
  }
  if (maleStdAnchors.length < 2) {
    console.error("Need at least 2 male standard_tobacco Agent Center anchors in CSV.");
    process.exit(1);
  }

  const femaleRatioAnchors = malePrefAnchors.map((anchor) => {
    const femaleRow = getRow(rows, anchor.age, "female", "preferred_tobacco");
    const femaleMonthly = femaleRow ? parseFloat(femaleRow.monthly) : anchor.value;
    return { age: anchor.age, value: femaleMonthly / anchor.value };
  });

  const SOURCE = "agent_center_interpolated";
  let updated = 0;

  for (let age = MIN_AGE; age <= MAX_AGE; age++) {
    const malePref = round2(interpolateAge(age, malePrefAnchors));
    const maleStd = round2(interpolateAge(age, maleStdAnchors));
    const femaleRatio = interpolateAge(age, femaleRatioAnchors);
    const femalePref = round2(malePref * femaleRatio);
    const stdSpread = round2(maleStd - malePref);
    const femaleStd = round2(femalePref + stdSpread);

    for (const [sex, uwClass, monthly] of [
      ["male", "preferred_tobacco", malePref],
      ["male", "standard_tobacco", maleStd],
      ["female", "preferred_tobacco", femalePref],
      ["female", "standard_tobacco", femaleStd],
    ]) {
      const row = getRow(rows, age, sex, uwClass);
      if (row && ANCHOR_SOURCES.has(row.source)) continue;
      upsertRow(rows, header, age, sex, uwClass, monthly, SOURCE);
      updated++;
    }
  }

  rows.sort((a, b) => {
    const ageA = parseInt(a.age, 10);
    const ageB = parseInt(b.age, 10);
    if (ageA !== ageB) return ageA - ageB;
    if (a.sex !== b.sex) return a.sex.localeCompare(b.sex);
    return a.uw_class.localeCompare(b.uw_class);
  });

  fs.writeFileSync(
    CSV_PATH,
    [header.join(","), ...rows.map((r) => header.map((h) => r[h] || "").join(","))].join(
      "\n"
    ) + "\n",
    "utf8"
  );

  console.log("Male preferred anchors:", malePrefAnchors.map((p) => `${p.age}=$${p.value}`).join(", "));
  console.log("Male standard anchors:", maleStdAnchors.map((p) => `${p.age}=$${p.value}`).join(", "));
  console.log(`Updated ${updated} tobacco rows (ages ${MIN_AGE}–${MAX_AGE}, source=${SOURCE})`);

  const build = spawnSync("node", ["scripts/build-assurity-quote-ranges-from-csv.js"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
  });
  if (build.status !== 0) process.exit(build.status || 1);
  console.log("Rebuilt quote_ranges_assurity SQL.");
}

main();
