#!/usr/bin/env node
/** Smoke test term quote engine (uses inline fixture rows — not production data). */
"use strict";

const { computeTermQuoteRange } = require("../lib/term-quote-engine");

const fixtureRows = [
  {
    carrier: "moo",
    product: "term_life_answers",
    state: "NE",
    age: 45,
    sex: "male",
    smoker: false,
    term_years: 20,
    face_band_min: 100000,
    face_band_max: 249999,
    health_class: "preferred_plus_nt",
    rate_per_thousand: 1.5,
    policy_fee_annual: 62.5,
    modal_monthly_factor: 0.086,
  },
  {
    carrier: "moo",
    product: "term_life_answers",
    state: "NE",
    age: 45,
    sex: "male",
    smoker: false,
    term_years: 20,
    face_band_min: 100000,
    face_band_max: 249999,
    health_class: "standard_nt",
    rate_per_thousand: 2.1,
    policy_fee_annual: 62.5,
    modal_monthly_factor: 0.086,
  },
  {
    carrier: "amam",
    product: "easy_term",
    state: "NE",
    age: 45,
    sex: "male",
    smoker: false,
    term_years: 20,
    face_band_min: 100000,
    face_band_max: 999999999,
    health_class: "standard_nt",
    monthly_premium: 42.5,
    face_amount: 250000,
  },
];

const result = computeTermQuoteRange(
  {
    age: 45,
    sex: "male",
    smoker: false,
    termYears: 20,
    state: "NE",
    coverageAmount: 200000,
    heightFt: 5,
    heightIn: 10,
    weightLbs: 180,
  },
  fixtureRows
);

if (!result.range || result.reason !== "ok") {
  console.error("FAIL: expected ok range", result);
  process.exit(1);
}

console.log("OK:", result.range.low, "–", result.range.high, "anchor", result.range.anchor);
