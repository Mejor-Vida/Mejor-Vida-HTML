#!/usr/bin/env node
/**
 * Build js/children-life-cost-rates.json from appointed carrier tables.
 *
 * Prefer Integrity Connect harvest (appointed only) when present:
 *   integrations/knowledge/Term_Life_Knowledge/integrity-children-harvest.json
 * Fallback: Transamerica Immediate Preferred Juvenile FE Portfolio CSV
 *           + Assurity Protect+ age-5 Preferred Plus NT.
 *
 *   node scripts/build-children-life-cost-rates.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INTEGRITY_HARVEST = path.join(
  ROOT,
  "integrations/knowledge/Term_Life_Knowledge/integrity-children-harvest.json"
);
const TA_CSV = path.join(
  ROOT,
  "integrations/knowledge/Transamerica_Knowledge/fe_portfolio_rates.csv"
);
const ASSURITY_CSV = path.join(
  ROOT,
  "integrations/knowledge/Assurity_Knowledge/assurity_protect_plus_premiums_10k.csv"
);
const OUT = path.join(ROOT, "js/children-life-cost-rates.json");

const FACES = [10000, 25000, 40000, 50000];
const BANDS = [
  { label: "0–4", ages: [0, 1, 2, 3, 4] },
  { label: "5–9", ages: [5, 6, 7, 8, 9] },
  { label: "10–14", ages: [10, 11, 12, 13, 14] },
  { label: "15–17", ages: [15, 16, 17] },
];

const APPOINTED = new Set([
  "transamerica",
  "corebridge",
  "moo",
  "amam",
  "assurity",
  "aetna",
  "americo",
]);

const TA_FEE_ANNUAL = 42;
const TA_MODAL_MONTHLY = 0.086;
const ASSURITY_FEE_ANNUAL = 65;
const ASSURITY_FEE_MONTHLY = ASSURITY_FEE_ANNUAL / 12;

function parseCsvLine(line) {
  return line.split(",").map((c) => c.trim());
}

function carrierSlug(name) {
  const c = String(name || "").toLowerCase();
  if (c.includes("transamerica")) return "transamerica";
  if (c.includes("omaha") || c.includes("mutual")) return "moo";
  if (c.includes("assurity")) return "assurity";
  if (c.includes("amicable")) return "amam";
  if (c.includes("aetna") || c.includes("accendo")) return "aetna";
  if (c.includes("corebridge") || c.includes("american general")) return "corebridge";
  if (c.includes("americo")) return "americo";
  return "unknown";
}

function loadIntegrityAppointedBest() {
  const map = new Map();
  if (!fs.existsSync(INTEGRITY_HARVEST)) return map;
  const data = JSON.parse(fs.readFileSync(INTEGRITY_HARVEST, "utf8"));
  for (const rec of data.records || []) {
    const cards = [
      ...(rec.all || []),
      ...(rec.appointed || []),
      ...(rec.best ? [rec.best] : []),
    ];
    for (const card of cards) {
      if (card == null || card.monthly == null) continue;
      const slug = carrierSlug(card.carrier);
      if (!APPOINTED.has(slug)) continue;
      const sex = rec.sex;
      const age = Number(rec.age);
      const face = Number(rec.face);
      if (!sex || !Number.isFinite(age) || !Number.isFinite(face)) continue;
      const key = `${sex}:${age}:${face}`;
      const monthly = Number(card.monthly);
      const preferPreferred = /preferred/i.test(card.product || "");
      const prev = map.get(key);
      if (
        !prev ||
        monthly < prev.monthly ||
        (monthly === prev.monthly && preferPreferred && !prev.preferred)
      ) {
        map.set(key, {
          monthly,
          product: card.product || "",
          carrier: card.carrier || slug,
          preferred: preferPreferred,
        });
      }
    }
  }
  return map;
}

function loadTaImmediatePreferredJuvenile() {
  const text = fs.readFileSync(TA_CSV, "utf8");
  const rows = text.trim().split(/\r?\n/).slice(1);
  const map = new Map();
  for (const line of rows) {
    const [product, uwClass, age, sex, riskClass, rate] = parseCsvLine(line);
    if (product !== "Immediate") continue;
    if (uwClass !== "Preferred") continue;
    if (riskClass !== "Juvenile") continue;
    const key = `${sex}:${Number(age)}`;
    const n = Number(rate);
    if (!Number.isFinite(n)) continue;
    const prev = map.get(key);
    if (prev == null || n < prev) map.set(key, n);
  }
  return map;
}

function taMonthly(ratePer1000, face) {
  const annual = ratePer1000 * (face / 1000) + TA_FEE_ANNUAL;
  return Math.round(annual * TA_MODAL_MONTHLY);
}

function loadAssurityAge5() {
  if (!fs.existsSync(ASSURITY_CSV)) return null;
  const text = fs.readFileSync(ASSURITY_CSV, "utf8");
  const rows = text.trim().split(/\r?\n/).slice(1);
  const out = { female: null, male: null };
  for (const line of rows) {
    const [age, sex, uw, monthly] = parseCsvLine(line);
    if (Number(age) !== 5) continue;
    if (uw !== "preferred_plus_nt") continue;
    const m = Number(monthly);
    if (!Number.isFinite(m)) continue;
    if (sex === "female") out.female = m;
    if (sex === "male") out.male = m;
  }
  if (out.female == null && out.male == null) return null;
  return out;
}

function scaleAssurityMonthly(monthly10k, face) {
  if (monthly10k == null || !Number.isFinite(monthly10k)) return null;
  const ratePortion = monthly10k - ASSURITY_FEE_MONTHLY;
  if (ratePortion < 0) return null;
  return Math.round(ratePortion * (face / 10000) + ASSURITY_FEE_MONTHLY);
}

function bestIntegrityInBand(intMap, sex, ages, face) {
  let best = null;
  for (const age of ages) {
    const hit = intMap.get(`${sex}:${age}:${face}`);
    if (!hit) continue;
    if (!best || hit.monthly < best.monthly) best = { ...hit, age };
  }
  return best;
}

function bestInBand(taMap, sex, ages) {
  let bestAge = ages[0];
  let bestRate = Infinity;
  for (const age of ages) {
    const r = taMap.get(`${sex === "female" ? "Female" : "Male"}:${age}`);
    if (r != null && r < bestRate) {
      bestRate = r;
      bestAge = age;
    }
  }
  if (!Number.isFinite(bestRate)) return null;
  return { age: bestAge, ratePer1000: bestRate };
}

function main() {
  const intMap = loadIntegrityAppointedBest();
  const taMap = loadTaImmediatePreferredJuvenile();
  const assurity5 = loadAssurityAge5();
  const tables = {};

  for (const face of FACES) {
    tables[String(face)] = [];
    for (const band of BANDS) {
      let female = null;
      let male = null;

      const iF = bestIntegrityInBand(intMap, "female", band.ages, face);
      const iM = bestIntegrityInBand(intMap, "male", band.ages, face);
      if (iF) female = Math.round(iF.monthly);
      if (iM) male = Math.round(iM.monthly);

      const fBest = bestInBand(taMap, "female", band.ages);
      const mBest = bestInBand(taMap, "male", band.ages);
      if (female == null && fBest) female = taMonthly(fBest.ratePer1000, face);
      if (male == null && mBest) male = taMonthly(mBest.ratePer1000, face);

      if (assurity5 && band.ages.includes(5)) {
        const aF = scaleAssurityMonthly(assurity5.female, face);
        const aM = scaleAssurityMonthly(assurity5.male, face);
        if (aF != null && (female == null || aF < female)) female = aF;
        if (aM != null && (male == null || aM < male)) male = aM;
      }

      tables[String(face)].push({ age: band.label, female, male });
    }
  }

  const asOf = new Date().toISOString().slice(0, 10);
  // Public-facing strings only — no harvest / Bridge / fee / CSV / rating-class jargon.
  const rating = "Illustrative sample (appointed carriers)";
  const source = "Mejor Vida appointed-carrier rate samples";
  const noteEn =
    "Illustrative monthly premiums, rounded. Educational only — not a binding quote. Actual cost depends on age, health, amount, product, and state.";
  const noteEs =
    "Primas mensuales ilustrativas, redondeadas. Solo con fines educativos — no es una cotización vinculante. El costo real depende de la edad, la salud, el monto, el producto y el estado.";

  const forPage = {
    source,
    rating,
    as_of: asOf,
    note: noteEn,
    faces: FACES,
    children_si_wl: {
      rating,
      source,
      as_of: asOf,
      tables,
    },
  };

  fs.writeFileSync(OUT, JSON.stringify(forPage, null, 2) + "\n");

  const pages = [
    {
      path: path.join(ROOT, "en/children-life-insurance-cost.html"),
      note: noteEn,
    },
    {
      path: path.join(ROOT, "costo-seguro-vida-infantil.html"),
      note: noteEs,
    },
  ];
  const ratesRe = /window\.MVI_LIC_RATES = \{[\s\S]*?\};<\/script>/;
  for (const page of pages) {
    if (!fs.existsSync(page.path)) continue;
    const html = fs.readFileSync(page.path, "utf8");
    if (!ratesRe.test(html)) {
      console.warn("No MVI_LIC_RATES block found in", path.relative(ROOT, page.path));
      continue;
    }
    const payload = { ...forPage, note: page.note };
    const inline = `window.MVI_LIC_RATES = ${JSON.stringify(payload)};`;
    fs.writeFileSync(page.path, html.replace(ratesRe, `${inline}</script>`));
    console.log("Inlined rates into", path.relative(ROOT, page.path));
  }

  console.log("Wrote", path.relative(ROOT, OUT), "integrity_cells=", intMap.size);
  console.log("Sample $10k:", tables["10000"]);
  console.log("Sample $50k:", tables["50000"]);
}

main();
