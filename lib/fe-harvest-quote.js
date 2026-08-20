/**
 * Lookup Integrity FE harvest cells used by the live final-expense quoter.
 * Ages 45–85: cheapest appointed Level / Graded at harvested faces.
 * Ages 86–89: Aetna Accendo Preferred (low) / Standard (high), max $25,000.
 */

const ENGINE = require("../js/quote-engine-fe-harvest.json");

const ACCENDO_MIN_AGE = Number(ENGINE.accendo_min_age) || 86;
const ACCENDO_MAX_AGE = Number(ENGINE.accendo_max_age) || 89;
const ACCENDO_MAX_FACE = Number(ENGINE.accendo_max_face) || 25000;

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

function scaleRange(cell, factor) {
  return {
    low: roundMoney(cell.low * factor),
    high: roundMoney(cell.high * factor),
    anchor: roundMoney(cell.anchor * factor),
    carrier: cell.carrier || null,
  };
}

function lerpRange(a, b, t) {
  return {
    low: roundMoney(a.low + (b.low - a.low) * t),
    high: roundMoney(a.high + (b.high - a.high) * t),
    anchor: roundMoney(a.anchor + (b.anchor - a.anchor) * t),
    carrier: a.carrier || b.carrier || null,
  };
}

function capFaceForAge(age, coverageAmount) {
  let face = parseInt(String(coverageAmount || 10000), 10);
  if (!Number.isFinite(face) || face <= 0) face = 10000;
  if (age >= ACCENDO_MIN_AGE && face > ACCENDO_MAX_FACE) {
    return ACCENDO_MAX_FACE;
  }
  return face;
}

function interpolateFaceMap(faceMap, face) {
  if (!faceMap) return null;
  const exact = faceMap[String(face)];
  if (exact) {
    return {
      low: Number(exact.low),
      high: Number(exact.high),
      anchor: Number(exact.anchor),
      carrier: exact.carrier || null,
    };
  }
  const faces = Object.keys(faceMap)
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (!faces.length) return null;
  if (face <= faces[0]) {
    return scaleRange(faceMap[String(faces[0])], face / faces[0]);
  }
  if (face > faces[faces.length - 1]) {
    // Do not invent a larger band (e.g. $5k harvest scaled to $10k).
    return null;
  }
  let lo = faces[0];
  let hi = faces[faces.length - 1];
  for (let i = 0; i < faces.length - 1; i += 1) {
    if (face >= faces[i] && face <= faces[i + 1]) {
      lo = faces[i];
      hi = faces[i + 1];
      break;
    }
  }
  const t = (face - lo) / (hi - lo);
  return lerpRange(faceMap[String(lo)], faceMap[String(hi)], t);
}

/**
 * @returns {{ low: number, high: number, anchor: number, carrier: string|null } | null}
 */
function lookupHarvestRange(age, sex, smoker, coverageAmount) {
  if (smoker) return null;
  const sexKey = String(sex || "").toLowerCase();
  const faceMap =
    ENGINE.cells &&
    ENGINE.cells[sexKey] &&
    ENGINE.cells[sexKey][String(age)] &&
    ENGINE.cells[sexKey][String(age)].nt;
  if (!faceMap) return null;
  const face = capFaceForAge(age, coverageAmount);
  return interpolateFaceMap(faceMap, face);
}

function isAccendoAge(age) {
  return Number.isFinite(age) && age >= ACCENDO_MIN_AGE && age <= ACCENDO_MAX_AGE;
}

module.exports = {
  ACCENDO_MIN_AGE,
  ACCENDO_MAX_AGE,
  ACCENDO_MAX_FACE,
  capFaceForAge,
  lookupHarvestRange,
  isAccendoAge,
};
