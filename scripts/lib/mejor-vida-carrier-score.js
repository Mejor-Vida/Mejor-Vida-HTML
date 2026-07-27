/**
 * Mejor Vida proprietary carrier score (/5).
 *
 * 1) AM Best FSR → % (A++=100 … A-=85 …)
 * 2) Comdex → % (already 1–100; omitted from average when unpublished)
 * 3) NAIC CIS complaint index → % (lower is better; 0→100, 1.00→50, ≥2→0)
 * 4) Average available %s → score/5 = avgPct / 100 * 5
 */
"use strict";

const AM_BEST_PCT = {
  "A++": 100,
  "A+": 95,
  A: 90,
  "A-": 85,
  "B++": 80,
  "B+": 75,
  B: 70,
  "B-": 65,
  "C++": 60,
  "C+": 55,
  C: 50,
  "C-": 45,
  D: 30,
  E: 20,
  F: 10,
};

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function amBestPercent(fsr) {
  if (!fsr) return null;
  const key = String(fsr).trim();
  return Object.prototype.hasOwnProperty.call(AM_BEST_PCT, key) ? AM_BEST_PCT[key] : null;
}

function comdexPercent(score) {
  if (score == null || score === "") return null;
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, n));
}

/** NAIC CIS index → %; national expected 1.00 ≈ 50%. Lower index → higher %. */
function naicPercent(complaintIndex) {
  if (complaintIndex == null || complaintIndex === "") return null;
  const idx = Number(complaintIndex);
  if (!Number.isFinite(idx)) return null;
  return round1(Math.max(0, Math.min(100, (100 * (2 - idx)) / 2)));
}

function computeMejorVidaScore(carrier) {
  const amBestPct = amBestPercent(carrier.amBest && carrier.amBest.fsr);
  const comdexPct = comdexPercent(carrier.comdex && carrier.comdex.score);
  const naicPct = naicPercent(carrier.naic && carrier.naic.complaintIndex);

  const parts = [];
  if (amBestPct != null) parts.push(amBestPct);
  if (comdexPct != null) parts.push(comdexPct);
  if (naicPct != null) parts.push(naicPct);

  if (!parts.length) {
    return {
      amBestPct: null,
      comdexPct: null,
      naicPct: null,
      avgPct: null,
      score: null,
      componentsUsed: 0,
    };
  }

  const avgPct = round1(parts.reduce((a, b) => a + b, 0) / parts.length);
  const score = round2((avgPct / 100) * 5);

  return {
    amBestPct,
    comdexPct,
    naicPct,
    avgPct,
    score,
    componentsUsed: parts.length,
  };
}

function applyScoresToCarriers(carriers) {
  const withScores = carriers.map((c) => {
    const breakdown = computeMejorVidaScore(c);
    return {
      ...c,
      score: breakdown.score,
      scoreBreakdown: breakdown,
    };
  });

  withScores.sort((a, b) => {
    const ds = (b.score || 0) - (a.score || 0);
    if (ds !== 0) return ds;
    return String(a.name).localeCompare(String(b.name));
  });

  return withScores.map((c, i) => ({ ...c, rank: i + 1 }));
}

module.exports = {
  AM_BEST_PCT,
  amBestPercent,
  comdexPercent,
  naicPercent,
  computeMejorVidaScore,
  applyScoresToCarriers,
};
