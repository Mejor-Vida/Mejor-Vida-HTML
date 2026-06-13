/**
 * Underwriting class tiers for term quote low/high aggregation.
 * Low pool = best-health classes; high pool = worst realistic classes.
 */

const LOW_CLASSES = [
  "preferred_plus_nt",
  "preferred_nt",
  "standard_plus_nt",
];

const HIGH_CLASSES_NT = ["standard_nt", "substandard_nt", "table_2", "table_4"];
const HIGH_CLASSES_TOBACCO = ["standard_t", "substandard_t", "table_2", "table_4"];

/** Simplified-issue products (TLE, Easy Term) often only publish standard classes. */
const SIMPLIFIED_LOW_NT = ["standard_nt"];
const SIMPLIFIED_HIGH_NT = ["standard_nt"];
const SIMPLIFIED_LOW_TOBACCO = ["standard_t"];
const SIMPLIFIED_HIGH_TOBACCO = ["standard_t"];

const CLASS_RANK = {
  preferred_plus_nt: 1,
  preferred_nt: 2,
  standard_plus_nt: 3,
  standard_nt: 4,
  preferred_t: 4,
  substandard_nt: 5,
  standard_t: 5,
  substandard_t: 6,
  table_2: 7,
  table_4: 8,
};

function isLowClass(uwClass) {
  return LOW_CLASSES.includes(uwClass) || SIMPLIFIED_LOW_NT.includes(uwClass);
}

function isHighClass(uwClass, smoker) {
  const pool = smoker ? HIGH_CLASSES_TOBACCO : HIGH_CLASSES_NT;
  return pool.includes(uwClass);
}

function classRank(uwClass) {
  return CLASS_RANK[uwClass] ?? 99;
}

/** Best class allowed at or below build cap (lower rank = better). */
function filterClassesByBuildCap(classes, maxAllowedClass) {
  const capRank = classRank(maxAllowedClass);
  return classes.filter((c) => classRank(c) <= capRank);
}

function lowClassesForProduct(product, smoker, maxBuildClass) {
  if (smoker) return [];
  const base =
    product === "term_life_express" || product === "easy_term"
      ? SIMPLIFIED_LOW_NT
      : LOW_CLASSES;
  if (!maxBuildClass) return base;
  return filterClassesByBuildCap(base, maxBuildClass);
}

function highClassesForProduct(product, smoker) {
  if (smoker) {
    return product === "term_life_express" || product === "easy_term"
      ? SIMPLIFIED_HIGH_TOBACCO
      : HIGH_CLASSES_TOBACCO;
  }
  return product === "term_life_express" || product === "easy_term"
    ? SIMPLIFIED_HIGH_NT
    : HIGH_CLASSES_NT;
}

module.exports = {
  LOW_CLASSES,
  HIGH_CLASSES_NT,
  HIGH_CLASSES_TOBACCO,
  CLASS_RANK,
  isLowClass,
  isHighClass,
  classRank,
  filterClassesByBuildCap,
  lowClassesForProduct,
  highClassesForProduct,
};
