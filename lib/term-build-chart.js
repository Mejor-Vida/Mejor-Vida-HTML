/**
 * MOO Term Life Answers build chart (full underwriting).
 * Source: MOO Life Insurance Underwriting Guide, Nebraska — page 6–7.
 * Caps the best health class usable for the LOW bound; does not invent premiums.
 */

const MOO_TLA_BUILD = [
  { heightIn: 56, preferredPlus: 125, preferred: 144, standardPlus: 153, standard: 158, table1: 170, table2: 184 },
  { heightIn: 57, preferredPlus: 131, preferred: 150, standardPlus: 160, standard: 165, table1: 176, table2: 189 },
  { heightIn: 58, preferredPlus: 135, preferred: 155, standardPlus: 165, standard: 170, table1: 182, table2: 194 },
  { heightIn: 59, preferredPlus: 141, preferred: 160, standardPlus: 170, standard: 176, table1: 187, table2: 199 },
  { heightIn: 60, preferredPlus: 146, preferred: 166, standardPlus: 177, standard: 184, table1: 193, table2: 205 },
  { heightIn: 61, preferredPlus: 152, preferred: 173, standardPlus: 185, standard: 191, table1: 199, table2: 211 },
  { heightIn: 62, preferredPlus: 158, preferred: 179, standardPlus: 190, standard: 197, table1: 205, table2: 215 },
  { heightIn: 63, preferredPlus: 164, preferred: 184, standardPlus: 195, standard: 203, table1: 213, table2: 220 },
  { heightIn: 64, preferredPlus: 169, preferred: 189, standardPlus: 200, standard: 209, table1: 221, table2: 225 },
  { heightIn: 65, preferredPlus: 174, preferred: 194, standardPlus: 205, standard: 215, table1: 226, table2: 231 },
  { heightIn: 66, preferredPlus: 180, preferred: 200, standardPlus: 210, standard: 222, table1: 232, table2: 239 },
  { heightIn: 67, preferredPlus: 185, preferred: 205, standardPlus: 215, standard: 228, table1: 239, table2: 245 },
  { heightIn: 68, preferredPlus: 189, preferred: 209, standardPlus: 220, standard: 235, table1: 246, table2: 251 },
  { heightIn: 69, preferredPlus: 195, preferred: 215, standardPlus: 225, standard: 242, table1: 254, table2: 258 },
  { heightIn: 70, preferredPlus: 200, preferred: 221, standardPlus: 232, standard: 250, table1: 262, table2: 266 },
  { heightIn: 71, preferredPlus: 206, preferred: 227, standardPlus: 237, standard: 258, table1: 269, table2: 274 },
  { heightIn: 72, preferredPlus: 211, preferred: 232, standardPlus: 244, standard: 265, table1: 275, table2: 281 },
  { heightIn: 73, preferredPlus: 217, preferred: 239, standardPlus: 252, standard: 271, table1: 282, table2: 289 },
  { heightIn: 74, preferredPlus: 222, preferred: 244, standardPlus: 257, standard: 279, table1: 289, table2: 296 },
  { heightIn: 75, preferredPlus: 228, preferred: 250, standardPlus: 262, standard: 285, table1: 296, table2: 303 },
  { heightIn: 76, preferredPlus: 233, preferred: 255, standardPlus: 268, standard: 292, table1: 301, table2: 311 },
  { heightIn: 77, preferredPlus: 239, preferred: 261, standardPlus: 274, standard: 298, table1: 307, table2: 319 },
  { heightIn: 78, preferredPlus: 246, preferred: 268, standardPlus: 280, standard: 307, table1: 313, table2: 328 },
  { heightIn: 79, preferredPlus: 252, preferred: 274, standardPlus: 286, standard: 313, table1: 320, table2: 336 },
  { heightIn: 80, preferredPlus: 258, preferred: 280, standardPlus: 294, standard: 320, table1: 327, table2: 345 },
  { heightIn: 81, preferredPlus: 264, preferred: 287, standardPlus: 302, standard: 326, table1: 335, table2: 352 },
  { heightIn: 82, preferredPlus: 270, preferred: 294, standardPlus: 310, standard: 334, table1: 343, table2: 359 },
];

function parseHeightToInches(heightFt, heightIn) {
  const ft = parseInt(heightFt, 10);
  const inch = parseInt(heightIn, 10);
  if (!Number.isFinite(ft) || !Number.isFinite(inch) || ft < 4 || ft > 7) return null;
  if (inch < 0 || inch > 11) return null;
  return ft * 12 + inch;
}

function lookupBuildRow(heightInches) {
  if (!Number.isFinite(heightInches)) return null;
  let best = null;
  let bestDiff = Infinity;
  for (const row of MOO_TLA_BUILD) {
    const diff = Math.abs(row.heightIn - heightInches);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = row;
    }
  }
  return bestDiff <= 1 ? best : null;
}

/**
 * @returns {'preferred_plus_nt'|'preferred_nt'|'standard_plus_nt'|'standard_nt'|'table_2'|'decline'|null}
 */
function mooMaxLowClassFromBuild(heightFt, heightIn, weightLbs) {
  const heightInches = parseHeightToInches(heightFt, heightIn);
  const weight = parseInt(weightLbs, 10);
  if (heightInches == null || !Number.isFinite(weight) || weight < 80 || weight > 500) {
    return null;
  }
  const row = lookupBuildRow(heightInches);
  if (!row) return null;
  if (weight <= row.preferredPlus) return "preferred_plus_nt";
  if (weight <= row.preferred) return "preferred_nt";
  if (weight <= row.standardPlus) return "standard_plus_nt";
  if (weight <= row.standard) return "standard_nt";
  if (weight <= row.table2) return "table_2";
  return "decline";
}

module.exports = {
  MOO_TLA_BUILD,
  parseHeightToInches,
  mooMaxLowClassFromBuild,
};
