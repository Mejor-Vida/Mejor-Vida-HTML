/**
 * Term life quote API helpers — issue ages + Supabase fetch.
 */

const { fetchTermCarrierPremiums } = require("./supabase");
const { isTermAgeInRange, termAgeOutOfRangeMessage } = require("./term-issue-ages");
const { computeTermQuoteRange } = require("./term-quote-engine");

async function fetchTermQuoteRange(supabaseUrl, serviceKey, params) {
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

module.exports = {
  isTermAgeInRange,
  termAgeOutOfRangeMessage,
  fetchTermQuoteRange,
  computeTermQuoteRange,
};
