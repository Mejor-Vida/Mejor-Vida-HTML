/**
 * Term life quote API helpers — issue ages + Supabase fetch.
 */

const {
  fetchTermCarrierPremiums,
  fetchTermIntegrityPremiums,
} = require("./supabase");
const { isTermAgeInRange, termAgeOutOfRangeMessage } = require("./term-issue-ages");
const { computeTermQuoteRange } = require("./term-quote-engine");
const { buildIntegrityRateRows } = require("./term-integrity-rates");
const { normalizeUnderwritingMode } = require("./term-underwriting-mode");

/**
 * Fully underwritten pricing comes from the harvested Integrity grid; the
 * simplified chart in term_carrier_premiums covers the no-exam path.
 */
async function fetchTermQuoteRange(supabaseUrl, serviceKey, params) {
  if (normalizeUnderwritingMode(params.underwritingMode) === "simplified") {
    const rows = await fetchTermCarrierPremiums(
      supabaseUrl,
      serviceKey,
      params.age,
      params.sex,
      params.smoker,
      params.termYears,
      params.state || "NE"
    );
    return computeTermQuoteRange(params, rows);
  }

  const gridRows = await fetchTermIntegrityPremiums(
    supabaseUrl,
    serviceKey,
    params.sex,
    params.smoker,
    params.state || "NE"
  );
  const rateRows = buildIntegrityRateRows(gridRows, params);
  return computeTermQuoteRange(params, rateRows);
}

module.exports = {
  isTermAgeInRange,
  termAgeOutOfRangeMessage,
  fetchTermQuoteRange,
  computeTermQuoteRange,
};
