#!/usr/bin/env node
/**
 * Compare drug search results against IC-style expectations.
 * Run: node scripts/test-drug-search-parity.js
 */
const { searchDrugs } = require("../lib/medical-lookup-sync");

const CASES = [
  {
    query: "met",
    countMin: 50,
    countMax: 65,
    mustInclude: ["metformin", "metaxalone", "methadone", "metoprolol"],
    mustExclude: ["tablet for", "cartridge", "powder for", "injectable solution"],
    noTopical: true,
  },
  {
    query: "metformin",
    countMin: 10,
    countMax: 25,
    mustInclude: ["metformin"],
    mustExclude: ["tablet for", "metformin hydrochloride"],
  },
  {
    query: "hydrocodone",
    countMin: 18,
    countMax: 28,
    mustInclude: [
      "hydrocodone bitartrate",
      "acetaminophen/hydrocodone",
      "hydrocodone polistirex",
    ],
    mustExclude: ["tablet for", "cartridge"],
  },
  {
    query: "methadone",
    countMin: 2,
    countMax: 6,
    mustInclude: ["methadone"],
    mustExclude: ["tablet for", "injectable solution"],
  },
  {
    query: "metoprolol",
    countMin: 4,
    countMax: 20,
    mustInclude: ["metoprolol"],
    mustExclude: ["cartridge"],
  },
  {
    query: "lisinopril",
    countMin: 2,
    countMax: 15,
    mustInclude: ["lisinopril"],
    mustExclude: ["tablet for"],
  },
  {
    query: "amlodipine",
    countMin: 3,
    countMax: 15,
    mustInclude: ["amlodipine"],
    mustExclude: ["powder for"],
  },
  {
    query: "atorvastatin",
    countMin: 2,
    countMax: 10,
    mustInclude: ["atorvastatin"],
  },
  {
    query: "gabapentin",
    countMin: 2,
    countMax: 12,
    mustInclude: ["gabapentin"],
  },
  {
    query: "omeprazole",
    countMin: 2,
    countMax: 15,
    mustInclude: ["omeprazole"],
  },
];

function normalize(s) {
  return String(s || "").toLowerCase();
}

async function runCase(c) {
  const { items, result_count } = await searchDrugs(c.query);
  const names = items.map((x) => x.name);
  const namesLower = names.map(normalize);
  const failures = [];

  if (result_count < c.countMin || result_count > c.countMax) {
    failures.push(`count ${result_count} outside [${c.countMin}, ${c.countMax}]`);
  }
  if (items.length > 60) {
    failures.push(`items length ${items.length} > 60`);
  }

  for (const needle of c.mustInclude || []) {
    const n = normalize(needle);
    if (!namesLower.some((name) => name.includes(n))) {
      failures.push(`missing mustInclude: ${needle}`);
    }
  }

  for (const bad of c.mustExclude || []) {
    const b = normalize(bad);
    const hit = namesLower.find((name) => name.includes(b));
    if (hit) failures.push(`mustExclude hit "${bad}" in "${hit}"`);
  }

  if (c.noTopical) {
    const topical = names.find((n) => /\(topical\)/i.test(n));
    if (topical) failures.push(`topical entry: ${topical}`);
  }

  return {
    query: c.query,
    result_count,
    shown: items.length,
    top5: names.slice(0, 5),
    ok: failures.length === 0,
    failures,
  };
}

async function main() {
  console.log("Drug search IC parity tests\n");
  let passed = 0;
  let failed = 0;

  for (const c of CASES) {
    const r = await runCase(c);
    const status = r.ok ? "PASS" : "FAIL";
    if (r.ok) passed++;
    else failed++;

    console.log(`[${status}] "${r.query}" — count=${r.result_count}, shown=${r.shown}`);
    console.log(`  top: ${r.top5.join(" | ")}`);
    if (r.failures.length) {
      r.failures.forEach((f) => console.log(`  ✗ ${f}`));
    }
    console.log("");
  }

  console.log(`Summary: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
