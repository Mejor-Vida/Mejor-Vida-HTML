/**
 * quote_ranges in Supabase are stored for $10,000 face amount.
 * Scale dollar strings for other coverage amounts.
 */

function parseDollarAmount(str) {
  if (str == null || str === "") return 0;
  const n = parseFloat(String(str).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatDollarAmount(num) {
  return "$" + Number(num).toFixed(2);
}

/** @param {{ low: number, high: number, anchor: number }} range */
function scaleNumericRange(range, coverageAmount) {
  const face = parseInt(String(coverageAmount || 10000), 10);
  const factor = Number.isFinite(face) && face > 0 ? face / 10000 : 1;
  if (!range || factor === 1) {
    return {
      low: Number(range.low),
      high: Number(range.high),
      anchor: Number(range.anchor),
    };
  }
  return {
    low: Number(range.low) * factor,
    high: Number(range.high) * factor,
    anchor: Number(range.anchor) * factor,
  };
}

function scaledRangeResponse(range, coverageAmount) {
  const scaled = scaleNumericRange(range, coverageAmount);
  return formatRangeResponse(scaled);
}

function formatRangeResponse(range) {
  return {
    low: formatDollarAmount(range.low),
    high: formatDollarAmount(range.high),
    anchor: formatDollarAmount(range.anchor),
  };
}

module.exports = {
  parseDollarAmount,
  formatDollarAmount,
  scaleNumericRange,
  scaledRangeResponse,
  formatRangeResponse,
};
