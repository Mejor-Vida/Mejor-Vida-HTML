#!/usr/bin/env node
/** Smoke test Integrity grid interpolation (inline fixture rows — not production data). */
"use strict";

const { buildIntegrityRateRows } = require("../lib/term-integrity-rates");

/** Two ages, two terms, two faces for one carrier/product/class. */
function cell(age, term, face, monthly) {
  return {
    carrier_slug: "transamerica",
    product_slug: "trendsetter_super",
    state: "NE",
    sex: "male",
    smoker: false,
    health_class: "preferred_plus_nt",
    age,
    term_years: term,
    face_amount: face,
    monthly_premium: monthly,
  };
}

const grid = [
  cell(40, 10, 100000, 10),
  cell(40, 10, 200000, 18),
  cell(40, 20, 100000, 14),
  cell(40, 20, 200000, 26),
  cell(45, 10, 100000, 14),
  cell(45, 10, 200000, 26),
  cell(45, 20, 100000, 20),
  cell(45, 20, 200000, 38),
];

const base = { sex: "male", smoker: false, state: "NE" };
let failures = 0;

function check(label, params, expected) {
  const rows = buildIntegrityRateRows(grid, { ...base, ...params });
  const got = rows.length ? rows[0].monthly_premium : null;
  const ok =
    expected === null ? got === null : got !== null && Math.abs(got - expected) < 0.01;
  if (!ok) {
    console.error(`FAIL ${label}: expected ${expected}, got ${got}`);
    failures++;
  } else {
    console.log(`ok   ${label}: ${got}`);
  }
}

// Exact grid point must return the harvested premium untouched.
check("exact grid point", { age: 40, termYears: 20, coverageAmount: 100000 }, 14);

// Halfway between two ages, two faces, and two terms.
check("age midpoint", { age: 42.5, termYears: 20, coverageAmount: 100000 }, 17);
check("face midpoint", { age: 40, termYears: 20, coverageAmount: 150000 }, 20);
check("term midpoint", { age: 40, termYears: 15, coverageAmount: 100000 }, 12);

// Face may run a short way past the top harvested face.
check("face extrapolated", { age: 40, termYears: 20, coverageAmount: 300000 }, 38);

// Outside the harvested age, term, or face range there is no honest answer.
check("age above grid", { age: 60, termYears: 20, coverageAmount: 100000 }, null);
check("age below grid", { age: 30, termYears: 20, coverageAmount: 100000 }, null);
check("term above grid", { age: 40, termYears: 30, coverageAmount: 100000 }, null);
check("face far above grid", { age: 40, termYears: 20, coverageAmount: 900000 }, null);

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nAll interpolation checks passed.");
