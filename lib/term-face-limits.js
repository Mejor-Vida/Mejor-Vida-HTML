/**
 * Published maximum face amounts for Nebraska term products (quoter UI caps).
 * Sources: MOO product guides, AmAm Products at a Glance (4/2026), MOO TLE guide.
 */

const TERM_PRODUCT_FACE_LIMITS = {
  transamerica_trendsetter_super: {
    label: "Transamerica — Trendsetter Super",
    min: 100000,
    max: 5000000,
    note: "Product guide bands to $10M+ with underwriting; quoter UI cap $5M",
  },
  moo_tla: {
    label: "Mutual of Omaha — Term Life Answers",
    min: 100000,
    max: 5000000,
    note: "Chart bands to $1M+; retention/jumbo to $5M+ with underwriting",
  },
  moo_tle: {
    label: "Mutual of Omaha — Term Life Express",
    min: 25000,
    maxByAge: [
      { maxAge: 50, max: 550000 },
      { maxAge: 60, max: 450000 },
      { maxAge: 75, max: 350000 },
    ],
  },
  amam_easy_term: {
    label: "American Amicable — Easy Term",
    min: 25000,
    maxByAge: [
      { maxAge: 45, max: 500000 },
      { maxAge: 999, max: 300000 },
    ],
  },
  assurity_term: {
    label: "Assurity — Term Life",
    min: 100000,
    max: 1000000,
    note: "Verify current NE max in Agent Center",
  },
};

/** Public quoter ceiling — MOO TLA jumbo band; lower carriers may return no_data above their max. */
const PUBLIC_QUOTER_MAX_FACE = 5000000;
const PUBLIC_QUOTER_MIN_FACE = 100000;

function publicQuoterMaxFace() {
  return PUBLIC_QUOTER_MAX_FACE;
}

module.exports = {
  TERM_PRODUCT_FACE_LIMITS,
  PUBLIC_QUOTER_MAX_FACE,
  PUBLIC_QUOTER_MIN_FACE,
  publicQuoterMaxFace,
};
