/**
 * Route quote lookups:
 *   18–44 Assurity Protect+
 *   45–85 appointed Integrity FE harvest (fallback: quote_ranges $10k scaled)
 *   86–89 Aetna Accendo Preferred / Standard (non-tobacco; max $25,000)
 */

const { fetchQuoteRange, fetchAssurityQuoteRange } = require("./supabase");
const {
  ACCENDO_MIN_AGE,
  ACCENDO_MAX_FACE,
  lookupHarvestRange,
  isAccendoAge,
  capFaceForAge,
} = require("./fe-harvest-quote");

const MIN_QUOTE_AGE = 18;
const MAX_QUOTE_AGE = 89;
const ASSURITY_MAX_AGE = 44;

function isQuoteAgeInRange(age) {
  return Number.isFinite(age) && age >= MIN_QUOTE_AGE && age <= MAX_QUOTE_AGE;
}

function quoteAgeOutOfRangeMessage(age) {
  if (!Number.isFinite(age) || age < MIN_QUOTE_AGE) {
    return "Quotes are available starting at age 18.";
  }
  if (age > MAX_QUOTE_AGE) {
    return "Quotes are available up to age 89.";
  }
  return "";
}

function noQuoteDataMessage(age, smoker, lang) {
  const es = String(lang || "").toLowerCase() !== "en";
  if (isAccendoAge(age) && smoker) {
    return es
      ? "Aún no tenemos tarifas de tabaco en línea para esta edad. Llame al 402-440-5438."
      : "We don’t have tobacco rates online for this age yet. Call 402-440-5438.";
  }
  if (age <= ASSURITY_MAX_AGE && smoker) {
    return es
      ? "Aún no tenemos tarifas de tabaco para Assurity en línea. Llame al 402-440-5438."
      : "We don’t have Assurity tobacco rates online yet. Call 402-440-5438.";
  }
  return es
    ? "Aún no tenemos tarifas para esa combinación."
    : "We don’t have rate data for that combination yet.";
}

/**
 * @returns {Promise<{
 *   range: { low: number, high: number, anchor: number } | null,
 *   carrier: string | null,
 *   exact: boolean,
 *   coverageAmount: number,
 *   reason: string | null
 * }>}
 */
async function fetchQuoteRangeForAge(
  supabaseUrl,
  serviceKey,
  age,
  sex,
  smoker,
  coverageAmount
) {
  const face = capFaceForAge(age, coverageAmount);
  if (!isQuoteAgeInRange(age)) {
    return { range: null, carrier: null, exact: false, coverageAmount: face, reason: "out_of_range" };
  }

  if (isAccendoAge(age)) {
    if (smoker) {
      return {
        range: null,
        carrier: null,
        exact: false,
        coverageAmount: face,
        reason: "tobacco_accendo",
      };
    }
    const harvested = lookupHarvestRange(age, sex, false, face);
    if (harvested) {
      return {
        range: harvested,
        carrier: harvested.carrier || "aetna_accendo",
        exact: true,
        coverageAmount: face,
        reason: null,
      };
    }
  }

  if (age <= ASSURITY_MAX_AGE) {
    const range = await fetchAssurityQuoteRange(
      supabaseUrl,
      serviceKey,
      age,
      sex,
      smoker
    );
    return {
      range,
      carrier: range ? "assurity" : null,
      exact: false,
      coverageAmount: face,
      reason: range ? null : "no_data",
    };
  }

  if (!smoker) {
    const harvested = lookupHarvestRange(age, sex, false, face);
    if (harvested) {
      return {
        range: harvested,
        carrier: harvested.carrier || "appointed",
        exact: true,
        coverageAmount: face,
        reason: null,
      };
    }
  }

  const range = await fetchQuoteRange(supabaseUrl, serviceKey, age, sex, smoker);
  return {
    range,
    carrier: range ? "moo_amam" : null,
    exact: false,
    coverageAmount: face,
    reason: range ? null : "no_data",
  };
}

module.exports = {
  MIN_QUOTE_AGE,
  MAX_QUOTE_AGE,
  ASSURITY_MAX_AGE,
  ACCENDO_MIN_AGE,
  ACCENDO_MAX_FACE,
  isQuoteAgeInRange,
  quoteAgeOutOfRangeMessage,
  noQuoteDataMessage,
  fetchQuoteRangeForAge,
};
