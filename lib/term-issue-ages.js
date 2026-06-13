/**
 * Issue-age limits from carrier product guides (Nebraska).
 * Union used for wizard validation; per-carrier checks at quote time.
 */

const TRANSAMERICA_TRENDSETTER_SUPER = {
  10: { ntMax: 80, tMax: 80 },
  15: { ntMax: 78, tMax: 73 },
  20: { ntMax: 70, tMax: 65 },
  25: { ntMax: 65, tMax: 60 },
  30: { ntMax: 58, tMax: 53 },
};

const MOO_TLA = {
  10: { ntMax: 80, tMax: 75 },
  15: { ntMax: 74, tMax: 70 },
  20: { ntMax: 68, tMax: 65 },
  25: { ntMax: 68, tMax: 65 },
  30: { ntMax: 55, tMax: 50 },
};

const MOO_TLE = {
  10: { ntMax: 75, tMax: 75 },
  15: { ntMax: 70, tMax: 70 },
  20: { ntMax: 60, tMax: 60 },
  30: { ntMax: 50, tMax: 50 },
};

const AMAM_EASY_TERM = {
  10: { ntMax: 75, tMax: 75 },
  20: { ntMax: 65, tMax: 65 },
  30: { ntMax: 55, tMax: 55 },
};

const ASSURITY_TERM = {
  10: { ntMax: 80, tMax: 75 },
  15: { ntMax: 75, tMax: 70 },
  20: { ntMax: 70, tMax: 65 },
  25: { ntMax: 65, tMax: 60 },
  30: { ntMax: 60, tMax: 55 },
};

const MIN_QUOTE_AGE = 18;

function maxAgeForTerm(termYears, smoker) {
  const t = parseInt(termYears, 10);
  const limits = [TRANSAMERICA_TRENDSETTER_SUPER, MOO_TLA, MOO_TLE, AMAM_EASY_TERM, ASSURITY_TERM];
  let max = 0;
  for (const table of limits) {
    const row = table[t];
    if (!row) continue;
    const cap = smoker ? row.tMax : row.ntMax;
    if (cap > max) max = cap;
  }
  return max || null;
}

function isTermAgeInRange(age, termYears, smoker) {
  if (!Number.isFinite(age) || age < MIN_QUOTE_AGE) return false;
  const max = maxAgeForTerm(termYears, smoker);
  if (!max) return false;
  return age <= max;
}

function termAgeOutOfRangeMessage(age, termYears, smoker) {
  if (!Number.isFinite(age) || age < MIN_QUOTE_AGE) {
    return "Quotes are available starting at age 18.";
  }
  const max = maxAgeForTerm(termYears, smoker);
  if (!max) {
    return "That term length is not available.";
  }
  if (age > max) {
    return `For a ${termYears}-year term, quotes are available up to age ${max}.`;
  }
  return "";
}

function carrierAgeAllowed(carrier, product, age, termYears, smoker) {
  const tables = {
    transamerica_trendsetter_super: TRANSAMERICA_TRENDSETTER_SUPER,
    moo_tla: MOO_TLA,
    moo_tle: MOO_TLE,
    amam_easy_term: AMAM_EASY_TERM,
    assurity_term: ASSURITY_TERM,
  };
  const key = `${carrier}_${product}`.replace(/term_life_answers/, "tla").replace(/term_life_express/, "tle").replace(/easy_term/, "easy_term").replace(/trendsetter_super/, "trendsetter_super").replace(/term_life/, "term");
  let table;
  if (carrier === "transamerica" && product === "trendsetter_super") table = TRANSAMERICA_TRENDSETTER_SUPER;
  else if (carrier === "moo" && product === "term_life_answers") table = MOO_TLA;
  else if (carrier === "moo" && product === "term_life_express") table = MOO_TLE;
  else if (carrier === "amam" && product === "easy_term") table = AMAM_EASY_TERM;
  else if (carrier === "assurity" && product === "term_life") table = ASSURITY_TERM;
  else table = tables[key];
  if (!table) return true;
  const row = table[parseInt(termYears, 10)];
  if (!row) return false;
  const cap = smoker ? row.tMax : row.ntMax;
  return age >= MIN_QUOTE_AGE && age <= cap;
}

module.exports = {
  MIN_QUOTE_AGE,
  TRANSAMERICA_TRENDSETTER_SUPER,
  MOO_TLA,
  MOO_TLE,
  AMAM_EASY_TERM,
  ASSURITY_TERM,
  maxAgeForTerm,
  isTermAgeInRange,
  termAgeOutOfRangeMessage,
  carrierAgeAllowed,
};
