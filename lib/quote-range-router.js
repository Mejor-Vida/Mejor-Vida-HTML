/**
 * Route quote lookups: Assurity Protect+ (ages 18–44) vs MOO + AmAm (45–85).
 */

const { fetchQuoteRange, fetchAssurityQuoteRange } = require("./supabase");

const MIN_QUOTE_AGE = 18;
const MAX_QUOTE_AGE = 85;
const ASSURITY_MAX_AGE = 44;

function isQuoteAgeInRange(age) {
  return Number.isFinite(age) && age >= MIN_QUOTE_AGE && age <= MAX_QUOTE_AGE;
}

function quoteAgeOutOfRangeMessage(age) {
  if (!Number.isFinite(age) || age < MIN_QUOTE_AGE) {
    return "Quotes are available starting at age 18.";
  }
  if (age > MAX_QUOTE_AGE) {
    return "Quotes are available up to age 85.";
  }
  return "";
}

/**
 * @returns {Promise<{ range: { low: number, high: number, anchor: number } | null, carrier: 'assurity' | 'moo_amam' | null }>}
 */
async function fetchQuoteRangeForAge(supabaseUrl, serviceKey, age, sex, smoker) {
  if (!isQuoteAgeInRange(age)) {
    return { range: null, carrier: null };
  }
  if (age <= ASSURITY_MAX_AGE) {
    const range = await fetchAssurityQuoteRange(
      supabaseUrl,
      serviceKey,
      age,
      sex,
      smoker
    );
    return { range, carrier: range ? "assurity" : null };
  }
  const range = await fetchQuoteRange(supabaseUrl, serviceKey, age, sex, smoker);
  return { range, carrier: range ? "moo_amam" : null };
}

module.exports = {
  MIN_QUOTE_AGE,
  MAX_QUOTE_AGE,
  ASSURITY_MAX_AGE,
  isQuoteAgeInRange,
  quoteAgeOutOfRangeMessage,
  fetchQuoteRangeForAge,
};
