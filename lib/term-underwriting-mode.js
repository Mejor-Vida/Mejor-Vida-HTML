/**
 * Term quoter: fully underwritten vs simplified issue (AmAm Easy Term).
 */

const MODE_FULL = "full";
const MODE_SIMPLIFIED = "simplified";

function normalizeUnderwritingMode(mode) {
  const m = String(mode || MODE_FULL)
    .toLowerCase()
    .trim()
    .replace(/-/g, "_");
  if (
    m === "simplified" ||
    m === "simplified_issue" ||
    m === "si" ||
    m === "easy_term"
  ) {
    return MODE_SIMPLIFIED;
  }
  return MODE_FULL;
}

function rowMatchesUnderwritingMode(row, mode) {
  const m = normalizeUnderwritingMode(mode);
  const isEasyTerm = row.carrier === "amam" && row.product === "easy_term";
  if (m === MODE_SIMPLIFIED) return isEasyTerm;
  return !isEasyTerm;
}

/** AmAm Easy Term max face — Products at a Glance (age nearest on chart). */
function simplifiedIssueMaxFace(age) {
  const a = parseInt(age, 10);
  if (!Number.isFinite(a)) return 300000;
  return a <= 45 ? 500000 : 300000;
}

function maxFaceForUnderwritingMode(mode, age) {
  if (normalizeUnderwritingMode(mode) === MODE_SIMPLIFIED) {
    return simplifiedIssueMaxFace(age);
  }
  const { PUBLIC_QUOTER_MAX_FACE } = require("./term-face-limits");
  return PUBLIC_QUOTER_MAX_FACE;
}

function coverageAmountsForMode(mode, age) {
  const max = maxFaceForUnderwritingMode(mode, age);
  const base = [
    100000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000,
    2000000, 3000000, 4000000, 5000000,
  ];
  return base.filter((amount) => amount <= max);
}

function snapCoverageForMode(amount, mode, age) {
  const amounts = coverageAmountsForMode(mode, age);
  if (!amounts.length) return 100000;
  const v = parseInt(String(amount), 10);
  if (!Number.isFinite(v)) return amounts[0];
  if (v <= amounts[0]) return amounts[0];
  const top = amounts[amounts.length - 1];
  if (v >= top) return top;
  let best = amounts[0];
  let bestDiff = Infinity;
  for (const a of amounts) {
    const diff = Math.abs(a - v);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = a;
    }
  }
  return best;
}

module.exports = {
  MODE_FULL,
  MODE_SIMPLIFIED,
  normalizeUnderwritingMode,
  rowMatchesUnderwritingMode,
  simplifiedIssueMaxFace,
  maxFaceForUnderwritingMode,
  coverageAmountsForMode,
  snapCoverageForMode,
};
