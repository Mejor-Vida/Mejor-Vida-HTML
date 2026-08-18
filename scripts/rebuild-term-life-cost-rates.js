#!/usr/bin/env node
/**
 * Rebuild illustrative term cost charts from Mejor Vida carrier rate CSVs.
 *
 * Sources (merged, cheapest Preferred / low-class wins):
 *   integrations/knowledge/Term_Life_Knowledge/integrity-fu-term-premiums.csv
 *     — Integrity Connect Fully Underwritten Term Preferred Best NT samples
 *   integrations/knowledge/Term_Life_Knowledge/term_carrier_premiums.csv
 *     — AmAm Easy Term Form 3350 (SI) fallback where FU samples are missing
 *
 *   node scripts/rebuild-term-life-cost-rates.js
 *
 * Output: js/term-life-cost-rates.json
 * Only emits term lengths and face amounts present in the CSVs — never invents rates.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { monthlyFromRateRow, faceInBand } = require("../lib/term-premium-calc");
const { lowClassesForProduct } = require("../lib/term-health-classes");

const ROOT = path.join(__dirname, "..");
const CSV_PATHS = [
  path.join(
    ROOT,
    "integrations/knowledge/Term_Life_Knowledge/integrity-fu-term-premiums.csv"
  ),
  path.join(
    ROOT,
    "integrations/knowledge/Term_Life_Knowledge/term_carrier_premiums.csv"
  ),
];
const OUT_PATH = path.join(ROOT, "js/term-life-cost-rates.json");

/** Preferred display faces (lower then higher band). Only kept if CSV can price them. */
const PREFERRED_FACES_LOW = [50000, 100000, 150000, 250000, 500000];
const PREFERRED_FACES_HIGH = [750000, 1000000, 1500000, 2000000, 3000000];
const PREFERRED_TERMS = [10, 15, 20, 25, 30];
const AGE_STEP = 5;
const AGE_START = 20;

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (!lines.length) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",");
      const row = {};
      header.forEach((h, i) => {
        row[h] = (parts[i] || "").trim();
      });
      return row;
    })
    .filter((r) => r.carrier && r.age);
}

function loadRows() {
  const rows = [];
  for (const p of CSV_PATHS) {
    if (!fs.existsSync(p)) continue;
    const parsed = parseCsv(fs.readFileSync(p, "utf8"));
    rows.push(...parsed);
    console.log(`  loaded ${parsed.length} rows from ${path.basename(p)}`);
  }
  return rows;
}

function isNonTobacco(row) {
  return !(row.smoker === "1" || row.smoker === "true" || row.smoker === true);
}

function isFuPreferred(row) {
  return (
    row.health_class === "preferred_plus_nt" ||
    row.health_class === "preferred_nt" ||
    row.source_file === "integrity-connect-quick-quote" ||
    row.source_file === "integrity-term-harvest.json" ||
    row.underwriting_mode === "fully_underwritten" ||
    row.product_type === "fully_underwritten_term"
  );
}

function cheapestMonthly(rows, age, sex, term, face, { fuOnly = false, appointedOnly = false } = {}) {
  let best = null;
  for (const r of rows) {
    if (Number(r.age) !== Number(age)) continue;
    if (String(r.sex) !== String(sex)) continue;
    if (Number(r.term_years) !== Number(term)) continue;
    if (!isNonTobacco(r)) continue;
    if (appointedOnly) {
      const appointed =
        r.is_mvi_appointed === "1" ||
        r.is_mvi_appointed === "true" ||
        r.is_mvi_appointed === true;
      if (!appointed) continue;
    } else if (
      Object.prototype.hasOwnProperty.call(r, "is_best") &&
      r.is_best !== "" &&
      !(r.is_best === "1" || r.is_best === "true" || r.is_best === true)
    ) {
      // Expanded Integrity CSV includes competitor cards; prefer marketplace best
      // when not filtering appointed-only.
      continue;
    }
    if (fuOnly && !isFuPreferred(r)) continue;
    const lows = lowClassesForProduct(r.product, false, null);
    // Integrity harvest products are not in the simplified list — allow preferred_plus
    const allowed =
      lows.includes(r.health_class) ||
      (isFuPreferred(r) &&
        ["preferred_plus_nt", "preferred_nt", "standard_plus_nt"].includes(
          r.health_class
        ));
    if (!allowed) continue;
    if (!faceInBand(face, r)) continue;
    const m = monthlyFromRateRow(r, face);
    if (!Number.isFinite(m) || m <= 0) continue;
    if (best == null || m < best) best = m;
  }
  return best;
}

function roundPremium(n) {
  return Math.round(n);
}

function discoverTerms(rows) {
  const set = new Set();
  for (const r of rows) {
    const t = Number(r.term_years);
    if (Number.isFinite(t) && t > 0) set.add(t);
  }
  return PREFERRED_TERMS.filter((t) => set.has(t));
}

function facePricable(rows, term, face, opts) {
  for (const r of rows) {
    if (Number(r.term_years) !== Number(term)) continue;
    if (!isNonTobacco(r)) continue;
    if (opts && opts.fuOnly && !isFuPreferred(r)) continue;
    const m = cheapestMonthly(rows, Number(r.age), r.sex, term, face, opts);
    if (Number.isFinite(m) && m > 0) return true;
  }
  // brute ages
  for (let a = AGE_START; a <= 70; a += AGE_STEP) {
    for (const sex of ["male", "female"]) {
      const m = cheapestMonthly(rows, a, sex, term, face, opts);
      if (Number.isFinite(m) && m > 0) return true;
    }
  }
  return false;
}

function ageMaxForTerm(rows, term, opts) {
  let max = 0;
  for (const r of rows) {
    if (Number(r.term_years) !== Number(term)) continue;
    if (opts && opts.fuOnly && !isFuPreferred(r)) continue;
    max = Math.max(max, Number(r.age) || 0);
  }
  return max;
}

function hasFuRows(rows) {
  return rows.some(isFuPreferred);
}

function carriersLabel(rows, { appointedOnly = false } = {}) {
  const map = {
    amam: "American Amicable Easy Term",
    moo: "Mutual of Omaha",
    assurity: "Assurity",
    transamerica: "Transamerica",
    corebridge: "Corebridge",
    aetna: "Aetna",
    americo: "Americo",
    banner: "Banner",
    protective: "Protective",
    symetra: "Symetra",
    pacific_life: "Pacific Life",
    principal: "Principal",
  };
  const fu = rows.some(isFuPreferred);
  if (fu && appointedOnly) {
    return "Integrity Connect FU Preferred Best NT (lowest among MVI-appointed carriers)";
  }
  if (fu) {
    return "Integrity Connect marketplace FU Preferred Best NT (lowest listed sample; not appointed-only)";
  }
  const seen = [];
  const keys = new Set();
  for (const r of rows) {
    const k = `${r.carrier}:${r.product}`;
    if (keys.has(k)) continue;
    keys.add(k);
    const label =
      r.carrier === "amam" && r.product === "easy_term"
        ? map.amam
        : map[r.carrier] || r.carrier;
    seen.push(label);
  }
  return seen.join(", ");
}

function buildTables(rows, terms, faces, opts) {
  const tables = {};
  for (const term of terms) {
    const ageMax = ageMaxForTerm(rows, term, opts);
    const ages = [];
    for (let a = AGE_START; a <= ageMax; a += AGE_STEP) ages.push(a);
    tables[String(term)] = {};
    for (const face of faces) {
      if (!facePricable(rows, term, face, opts)) continue;
      const faceRows = [];
      for (const age of ages) {
        const female = cheapestMonthly(rows, age, "female", term, face, opts);
        const male = cheapestMonthly(rows, age, "male", term, face, opts);
        if (female == null && male == null) {
          continue;
        } else {
          const row = { age };
          if (female != null) row.female = roundPremium(female);
          if (male != null) row.male = roundPremium(male);
          faceRows.push(row);
        }
      }
      tables[String(term)][String(face)] = faceRows.filter(
        (r) => r.female != null || r.male != null
      );
    }
  }
  return tables;
}

function main() {
  console.log("Loading term premium CSVs…");
  const rows = loadRows();
  if (!rows.length) {
    console.error("No rows in term premium CSVs");
    process.exit(1);
  }

  const preferFu = hasFuRows(rows);
  const hasAppointedFu = rows.some(
    (r) =>
      isFuPreferred(r) &&
      (r.is_mvi_appointed === "1" ||
        r.is_mvi_appointed === "true" ||
        r.is_mvi_appointed === true)
  );
  // Prefer appointed-carrier lowest when Integrity harvest flags are present
  const opts = preferFu
    ? { fuOnly: true, appointedOnly: hasAppointedFu }
    : {};

  // Prefer FU faces/terms when available; otherwise use full merge
  const sourceRows = preferFu
    ? rows.filter((r) => {
        if (!isFuPreferred(r)) return false;
        if (!hasAppointedFu) return true;
        return (
          r.is_mvi_appointed === "1" ||
          r.is_mvi_appointed === "true" ||
          r.is_mvi_appointed === true
        );
      })
    : rows;
  const terms = discoverTerms(sourceRows);
  const lowFaces = PREFERRED_FACES_LOW.filter((f) =>
    terms.some((t) => facePricable(sourceRows, t, f, opts))
  );
  const highFaces = PREFERRED_FACES_HIGH.filter((f) =>
    terms.some((t) => facePricable(sourceRows, t, f, opts))
  );
  const faces = [...lowFaces, ...highFaces];

  const tables = buildTables(sourceRows, terms, faces, opts);
  const asOf = new Date().toISOString().slice(0, 10);
  const sourceCarriers = carriersLabel(sourceRows, {
    appointedOnly: hasAppointedFu,
  });

  const out = {
    source: `Mejor Vida appointed-carrier rate samples (${sourceCarriers}; Nebraska)`,
    rating: preferFu
      ? "Non-tobacco, fully underwritten Preferred Best / preferred class (illustrative)"
      : "Non-tobacco, simplified-issue / standard class (illustrative)",
    as_of: asOf,
    note: preferFu
      ? hasAppointedFu
        ? "Illustrative monthly premiums from Integrity Connect Fully Underwritten Term quick quotes (Preferred Best non-tobacco, Nebraska). Each cell is the lowest premium among MVI-appointed carriers captured for that age/sex/term/face. Rounded to the nearest dollar. Educational samples only — not a binding quote. Carriers use age-nearest underwriting; actual offers vary by carrier, health, tobacco, state, face amount, and underwriting. Simplified-issue products (e.g. American Amicable Easy Term) are typically higher and remain available via the term quoter."
        : "Illustrative monthly premiums from Integrity Connect Fully Underwritten Term quick quotes (Preferred Best non-tobacco, Nebraska). Each cell is the lowest listed premium among returned carriers for that age/sex/term/face. Rounded to the nearest dollar. Educational samples only — not a binding quote. Carriers use age-nearest underwriting; actual offers vary by carrier, health, tobacco, state, face amount, and underwriting. Simplified-issue products (e.g. American Amicable Easy Term) are typically higher and remain available via the term quoter."
      : "Illustrative monthly premiums from Mejor Vida’s verified carrier rate tables (American Amicable Easy Term Form 3350 / term_carrier_premiums). Rounded to the nearest dollar. Educational samples only — not a binding quote. Actual offers vary by carrier, health, tobacco, state, face amount, and underwriting.",
    faces,
    faces_low: lowFaces,
    faces_high: highFaces,
    terms,
    tables,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `Wrote ${OUT_PATH} — terms [${terms.join(",")}], faces [${faces.join(",")}], mode=${preferFu ? "FU Preferred Best" : "SI fallback"}`
  );
}

main();
