/**
 * Integrity marketplace quotes are harvested on a grid of ages, faces, and
 * terms. The wizard accepts any age, any coverage amount, and term lengths the
 * grid does not carry, so these helpers price a request from the surrounding
 * grid points and hand the engine rows in the same shape as a carrier chart.
 *
 * Interpolation only ever runs between two real quoted points. A request that
 * falls outside a product's harvested range returns nothing for that product
 * rather than an extrapolated guess.
 */

/** Premium may be extrapolated to this multiple of the largest harvested face. */
const FACE_EXTRAPOLATION_LIMIT = 2;

function groupKey(row) {
  return `${row.carrier_slug}|${row.product_slug}|${row.health_class}`;
}

/**
 * Straight-line read between the two points bracketing x.
 * Returns null when x sits outside the supplied range.
 */
function interpolate(points, x) {
  if (!points.length) return null;
  const sorted = points
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && p.y > 0)
    .sort((a, b) => a.x - b.x);
  if (!sorted.length) return null;

  const exact = sorted.find((p) => p.x === x);
  if (exact) return exact.y;

  if (x < sorted[0].x || x > sorted[sorted.length - 1].x) return null;

  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i];
    const hi = sorted[i + 1];
    if (x >= lo.x && x <= hi.x) {
      const span = hi.x - lo.x;
      if (span === 0) return lo.y;
      return lo.y + ((x - lo.x) * (hi.y - lo.y)) / span;
    }
  }
  return null;
}

/**
 * Premium at a coverage amount. Term premium is close to linear in face — a
 * per-thousand charge plus a flat policy fee — so the line through the two
 * nearest quoted faces also carries a short distance above the top face.
 */
function priceAtFace(points, face) {
  if (!points.length) return null;
  const within = interpolate(points, face);
  if (within != null) return within;

  const sorted = points.slice().sort((a, b) => a.x - b.x);
  const top = sorted[sorted.length - 1];
  if (face <= top.x) return null;
  if (face > top.x * FACE_EXTRAPOLATION_LIMIT) return null;
  if (sorted.length < 2) return null;

  const prev = sorted[sorted.length - 2];
  const slope = (top.y - prev.y) / (top.x - prev.x);
  if (!Number.isFinite(slope) || slope <= 0) return null;
  const projected = top.y + slope * (face - top.x);
  return projected > 0 ? projected : null;
}

function priceAtAge(rowsByAge, age, face) {
  const points = [];
  for (const [gridAge, faceRows] of rowsByAge.entries()) {
    const monthly = priceAtFace(
      faceRows.map((r) => ({ x: Number(r.face_amount), y: Number(r.monthly_premium) })),
      face
    );
    if (monthly != null) points.push({ x: gridAge, y: monthly });
  }
  return interpolate(points, age);
}

function priceForGroup(rowsByTerm, age, termYears, face) {
  const points = [];
  for (const [gridTerm, rowsByAge] of rowsByTerm.entries()) {
    const monthly = priceAtAge(rowsByAge, age, face);
    if (monthly != null) points.push({ x: gridTerm, y: monthly });
  }
  return interpolate(points, termYears);
}

function indexRows(rows) {
  const groups = new Map();
  for (const row of rows || []) {
    const monthly = Number(row.monthly_premium);
    if (!Number.isFinite(monthly) || monthly <= 0) continue;
    const key = groupKey(row);
    if (!groups.has(key)) {
      groups.set(key, {
        carrier: row.carrier_slug,
        product: row.product_slug,
        health_class: row.health_class,
        state: row.state,
        sex: row.sex,
        smoker: row.smoker,
        byTerm: new Map(),
      });
    }
    const group = groups.get(key);
    const term = Number(row.term_years);
    if (!group.byTerm.has(term)) group.byTerm.set(term, new Map());
    const byAge = group.byTerm.get(term);
    const age = Number(row.age);
    if (!byAge.has(age)) byAge.set(age, []);
    byAge.get(age).push(row);
  }
  return groups;
}

/**
 * Turn harvested grid rows into engine-shaped rate rows priced at the exact
 * age, term, and coverage amount the visitor asked for.
 */
function buildIntegrityRateRows(rows, params) {
  const { age, termYears, coverageAmount, sex, smoker, state } = params;
  const out = [];
  for (const group of indexRows(rows).values()) {
    const monthly = priceForGroup(
      group.byTerm,
      Number(age),
      Number(termYears),
      Number(coverageAmount)
    );
    if (monthly == null || !(monthly > 0)) continue;
    out.push({
      carrier: group.carrier,
      product: group.product,
      state: group.state || state || "NE",
      age: Number(age),
      sex: sex,
      smoker: Boolean(smoker),
      term_years: Number(termYears),
      face_amount: Number(coverageAmount),
      face_band_min: Number(coverageAmount),
      face_band_max: Number(coverageAmount),
      health_class: group.health_class,
      rate_per_thousand: "",
      policy_fee_annual: "",
      modal_monthly_factor: "",
      monthly_premium: Math.round(monthly * 100) / 100,
      source_file: "integrity-connect-quick-quote",
    });
  }
  return out;
}

module.exports = {
  buildIntegrityRateRows,
  interpolate,
  priceAtFace,
};
