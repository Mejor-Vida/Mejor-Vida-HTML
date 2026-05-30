#!/usr/bin/env node
/**
 * Condition search tests — words-first with semantic fallback.
 * Run: node scripts/test-condition-search-parity.js
 */
const { searchConditions } = require("../lib/medical-lookup-sync");

/** Literal word matches should dominate top results */
const WORD_FIRST_CASES = [
  {
    query: "diabetes",
    countMin: 10,
    mustIncludeTop5: ["diabetes"],
    mustExcludeTop5: ["bedridden"],
  },
  {
    query: "copd",
    countMin: 5,
    mustIncludeTop5: ["copd", "chronic obstructive pulmonary"],
  },
  {
    query: "asthma",
    countMin: 5,
    mustIncludeTop5: ["asthma"],
  },
  {
    query: "hypertension",
    countMin: 5,
    mustIncludeTop5: ["hypertension", "blood pressure"],
  },
  {
    query: "alzheimer",
    countMin: 3,
    mustIncludeTop5: ["alzheimer"],
  },
  {
    query: "broken bone",
    countMin: 3,
    mustIncludeTop5: ["bone", "fracture"],
    mustExcludeTop5: ["bedridden"],
  },
  {
    query: "high",
    countMin: 3,
    mustIncludeTop5: ["high"],
  },
];

/** Semantic catalog kicks in when word tier is sparse (<5 hits) */
const SEMANTIC_FALLBACK_CASES = [
  {
    query: "cpap",
    countMin: 5,
    mustIncludeTop5: ["sleep apnea", "apnea"],
  },
  {
    query: "ckd",
    countMin: 5,
    mustIncludeTop5: ["kidney", "nephropathy", "proteinuria", "albuminuria"],
  },
  {
    query: "hospice",
    countMin: 5,
    mustIncludeTop5: ["nursing home", "assisted living", "skilled nursing"],
  },
  {
    query: "memory loss",
    countMin: 5,
    mustIncludeTop5: ["memory", "amnesia", "alzheimer"],
  },
  {
    query: "blood thinner",
    countMin: 5,
    mustIncludeTop5: ["blood thinner", "anticoagul", "warfarin"],
  },
  {
    query: "low testosterone",
    countMin: 5,
    mustIncludeTop5: ["hypogonadism", "testicular", "oligospermia"],
  },
  {
    query: "broken",
    countMin: 5,
    mustIncludeTop5: ["broken"],
  },
  {
    query: "dia",
    countMin: 5,
    mustIncludeTop5: ["diaper", "diabetic"],
  },
  {
    query: "hip replacement",
    countMin: 5,
    mustIncludeTop5: ["replacement", "surgery", "complication", "procedure"],
  },
];

/** Spanish queries resolve to English search terms */
const SPANISH_CASES = [
  {
    query: "hueso",
    countMin: 2,
    mustIncludeTop5: ["bone", "fracture"],
  },
  {
    query: "diabetes",
    countMin: 5,
    mustIncludeTop5: ["diabetes"],
  },
  {
    query: "presión alta",
    countMin: 3,
    mustIncludeTop5: ["blood pressure", "hypertension"],
  },
  {
    query: "corazón",
    countMin: 3,
    mustIncludeTop5: ["heart"],
  },
  {
    query: "asma",
    countMin: 3,
    mustIncludeTop5: ["asthma"],
  },
  {
    query: "hueso roto",
    countMin: 2,
    mustIncludeTop5: ["bone", "fracture"],
  },
];

/** Common underwriting terms — quality heuristics */
const QUALITY_CASES = [
  { query: "afib", countMin: 5, mustIncludeTop5: ["atrial fibrillation", "afib"], mustExcludeTop5: ["afibrinogenemia"] },
  { query: "chf", countMin: 5, mustIncludeTop5: ["congestive heart failure", "heart failure", "chf"] },
  { query: "heart", countMin: 5, mustIncludeTop5: ["heart"], mustExcludeTop5: ["heartburn"] },
  { query: "stroke", countMin: 3, mustIncludeTop5: ["stroke"] },
  { query: "depression", countMin: 3, mustIncludeTop5: ["depression"] },
  { query: "anxiety", countMin: 5, mustIncludeTop5: ["anxiety"] },
  { query: "ms", countMin: 5, mustIncludeTop5: ["multiple sclerosis"], mustExcludeTop5: ["maple syrup", "medullary sponge"] },
  { query: "adhd", countMin: 5, mustIncludeTop5: ["adhd", "attention deficit"] },
  { query: "autism", countMin: 5, mustIncludeTop5: ["autism"] },
  { query: "ptsd", countMin: 3, mustIncludeTop5: ["post-traumatic", "ptsd"] },
  { query: "cholesterol", countMin: 5, mustIncludeTop5: ["cholesterol"] },
  { query: "pacemaker", countMin: 3, mustIncludeTop5: ["pacemaker"], mustExcludeTop5: ["encounter for adjustment"] },
  { query: "oxygen", countMin: 3, mustIncludeTop5: ["oxygen"] },
  { query: "dialysis", countMin: 10, mustIncludeTop5: ["dialysis"] },
  { query: "fibromyalgia", countMin: 3, mustIncludeTop5: ["fibromyalgia"] },
  { query: "parkinson", countMin: 3, mustIncludeTop5: ["parkinson"] },
  { query: "epilepsy", countMin: 5, mustIncludeTop5: ["epilepsy"] },
  { query: "bipolar", countMin: 5, mustIncludeTop5: ["bipolar"] },
  { query: "hiv", countMin: 5, mustIncludeTop5: ["hiv"] },
  { query: "cancer", countMin: 5, mustIncludeTop5: ["cancer"] },
  { query: "arthritis", countMin: 10, mustIncludeTop5: ["arthritis"] },
  { query: "back pain", countMin: 3, mustIncludeTop5: ["back pain", "pain"] },
];

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function topNames(items, n) {
  return items.slice(0, n).map((x) => x.name);
}

function includesAny(nameList, needles) {
  return needles.some(function (needle) {
    const n = norm(needle);
    return nameList.some(function (name) {
      return name.includes(n);
    });
  });
}

async function runCase(c) {
  const { items, result_count } = await searchConditions(c.query);
  const top5Lower = topNames(items, 5).map(norm);
  const failures = [];

  if (c.countMin != null && result_count < c.countMin) {
    failures.push(`count ${result_count} < min ${c.countMin}`);
  }
  if (c.countMax != null && result_count > c.countMax) {
    failures.push(`count ${result_count} > max ${c.countMax}`);
  }
  if (c.mustIncludeTop5 && c.mustIncludeTop5.length) {
    if (!includesAny(top5Lower, c.mustIncludeTop5)) {
      failures.push(`top5 missing one of: ${c.mustIncludeTop5.join(", ")}`);
    }
  }
  for (const bad of c.mustExcludeTop5 || []) {
    const b = norm(bad);
    const hit = top5Lower.find(function (name) {
      return name.includes(b);
    });
    if (hit) failures.push(`top5 mustExclude "${bad}" in "${hit}"`);
  }

  return {
    query: c.query,
    ok: !failures.length,
    failures,
    result_count,
    top: topNames(items, 5),
  };
}

async function main() {
  console.log("Condition search tests (words-first)\n");

  let passed = 0;
  let failed = 0;

  console.log("=== Word-first cases ===\n");
  for (const c of WORD_FIRST_CASES) {
    const r = await runCase(c);
    const status = r.ok ? "PASS" : "FAIL";
    if (r.ok) passed++;
    else failed++;
    console.log(`[${status}] "${r.query}" count=${r.result_count}`);
    console.log(`  top5: ${r.top.join(" | ")}`);
    r.failures.forEach(function (f) {
      console.log(`  ✗ ${f}`);
    });
    console.log("");
  }

  console.log("=== Semantic fallback cases ===\n");
  for (const c of SEMANTIC_FALLBACK_CASES) {
    const r = await runCase(c);
    const status = r.ok ? "PASS" : "FAIL";
    if (r.ok) passed++;
    else failed++;
    console.log(`[${status}] "${r.query}" count=${r.result_count}`);
    console.log(`  top5: ${r.top.join(" | ")}`);
    r.failures.forEach(function (f) {
      console.log(`  ✗ ${f}`);
    });
    console.log("");
  }

  console.log("=== Quality heuristics ===\n");
  for (const c of QUALITY_CASES) {
    const r = await runCase(c);
    const status = r.ok ? "PASS" : "FAIL";
    if (r.ok) passed++;
    else failed++;
    console.log(`[${status}] "${r.query}" count=${r.result_count}`);
    console.log(`  top5: ${r.top.join(" | ")}`);
    r.failures.forEach(function (f) {
      console.log(`  ✗ ${f}`);
    });
    console.log("");
  }

  console.log("=== Spanish query cases ===\n");
  for (const c of SPANISH_CASES) {
    const r = await runCase(c);
    const status = r.ok ? "PASS" : "FAIL";
    if (r.ok) passed++;
    else failed++;
    console.log(`[${status}] "${r.query}" count=${r.result_count}`);
    console.log(`  top5: ${r.top.join(" | ")}`);
    r.failures.forEach(function (f) {
      console.log(`  ✗ ${f}`);
    });
    console.log("");
  }

  console.log(`Summary: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
