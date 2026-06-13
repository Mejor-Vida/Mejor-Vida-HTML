/**
 * Monthly premium from carrier rate sheet fields — no invented multipliers.
 */

function monthlyFromRateRow(row, faceAmount) {
  const face = parseInt(String(faceAmount), 10);
  if (!Number.isFinite(face) || face <= 0) return null;

  if (row.monthly_premium != null && row.monthly_premium !== "") {
    const fixed = Number(row.monthly_premium);
    if (Number.isFinite(fixed) && fixed > 0) {
      if (row.face_amount && Number(row.face_amount) === face) return fixed;
      if (!row.rate_per_thousand) return fixed;
    }
  }

  const ratePerThousand = Number(row.rate_per_thousand);
  if (!Number.isFinite(ratePerThousand) || ratePerThousand <= 0) return null;

  const policyFee = Number(row.policy_fee_annual || 0);
  const modalFactor = Number(row.modal_monthly_factor || 0.086);
  const annual = (ratePerThousand * face) / 1000 + policyFee;
  return Math.round(annual * modalFactor * 100) / 100;
}

function faceInBand(faceAmount, row) {
  const face = parseInt(String(faceAmount), 10);
  const min = parseInt(String(row.face_band_min || 0), 10);
  const max = parseInt(String(row.face_band_max || 999999999), 10);
  return face >= min && face <= max;
}

function formatDollarAmount(num) {
  return "$" + Number(num).toFixed(2);
}

module.exports = {
  monthlyFromRateRow,
  faceInBand,
  formatDollarAmount,
};
