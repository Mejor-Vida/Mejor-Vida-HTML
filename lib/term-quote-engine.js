/**
 * Aggregate term quote low/high from term_carrier_premiums rows.
 */

const { carrierAgeAllowed } = require("./term-issue-ages");
const { mooMaxLowClassFromBuild } = require("./term-build-chart");
const {
  lowClassesForProduct,
  highClassesForProduct,
  classRank,
} = require("./term-health-classes");
const { monthlyFromRateRow, faceInBand, formatDollarAmount } = require("./term-premium-calc");
const { rowMatchesUnderwritingMode, normalizeUnderwritingMode } = require("./term-underwriting-mode");

function productKey(row) {
  return `${row.carrier}:${row.product}`;
}

function cheapestInPool(rows, allowedClasses, faceAmount) {
  let best = null;
  let bestCarrier = null;
  for (const row of rows) {
    if (!allowedClasses.includes(row.health_class)) continue;
    if (!faceInBand(faceAmount, row)) continue;
    const monthly = monthlyFromRateRow(row, faceAmount);
    if (!Number.isFinite(monthly) || monthly <= 0) continue;
    if (best == null || monthly < best) {
      best = monthly;
      bestCarrier = row.carrier;
    }
  }
  return best == null ? null : { monthly: best, carrier: bestCarrier };
}

/**
 * @param {object} params
 * @param {Array<object>} rateRows — from Supabase term_carrier_premiums
 */
function computeTermQuoteRange(params, rateRows) {
  const {
    age,
    sex,
    smoker,
    termYears,
    state,
    coverageAmount,
    heightFt,
    heightIn,
    weightLbs,
    underwritingMode,
  } = params;

  const quoteMode = normalizeUnderwritingMode(underwritingMode);

  const filtered = (rateRows || []).filter((row) => {
    if (!rowMatchesUnderwritingMode(row, quoteMode)) return false;
    if (String(row.state || "NE").toUpperCase() !== String(state || "NE").toUpperCase()) {
      return false;
    }
    if (Number(row.age) !== Number(age)) return false;
    if (String(row.sex) !== String(sex)) return false;
    if (Boolean(row.smoker) !== Boolean(smoker)) return false;
    if (Number(row.term_years) !== Number(termYears)) return false;
    return carrierAgeAllowed(row.carrier, row.product, age, termYears, smoker);
  });

  if (!filtered.length) return { range: null, reason: "no_data" };

  const buildCap =
    quoteMode === "simplified"
      ? null
      : mooMaxLowClassFromBuild(heightFt, heightIn, weightLbs);
  if (buildCap === "decline") {
    return { range: null, reason: "build_decline" };
  }

  const byProduct = new Map();
  for (const row of filtered) {
    const key = productKey(row);
    if (!byProduct.has(key)) byProduct.set(key, []);
    byProduct.get(key).push(row);
  }

  const lowCandidates = [];
  const highCandidates = [];

  for (const [key, rows] of byProduct.entries()) {
    const sample = rows[0];
    const product = sample.product;
    let lowClasses = lowClassesForProduct(product, smoker, buildCap);
    const highClasses = highClassesForProduct(product, smoker);

    if (buildCap && classRank(buildCap) > 3) {
      lowClasses = lowClasses.filter((c) => classRank(c) <= classRank(buildCap));
    }

    const lowHit = cheapestInPool(rows, lowClasses, coverageAmount);
    if (lowHit) lowCandidates.push(lowHit);

    const highHit = cheapestInPool(rows, highClasses, coverageAmount);
    if (highHit) highCandidates.push(highHit);
  }

  if (!lowCandidates.length && !highCandidates.length) {
    return { range: null, reason: "no_data" };
  }

  let low = lowCandidates.length
    ? Math.min(...lowCandidates.map((x) => x.monthly))
    : null;
  let high = highCandidates.length
    ? Math.min(...highCandidates.map((x) => x.monthly))
    : null;

  if (low == null && high != null) low = high;
  if (high == null && low != null) high = low;
  if (low == null || high == null) return { range: null, reason: "no_data" };

  if (high < low) {
    const swap = low;
    low = high;
    high = swap;
  }

  const anchor = Math.round(((low + high) / 2) * 100) / 100;

  return {
    range: {
      low: formatDollarAmount(low),
      high: formatDollarAmount(high),
      anchor: formatDollarAmount(anchor),
      lowNumeric: low,
      highNumeric: high,
      anchorNumeric: anchor,
    },
    reason: "ok",
    buildCap: buildCap || null,
    underwritingMode: quoteMode,
  };
}

module.exports = {
  computeTermQuoteRange,
};
