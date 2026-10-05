/**
 * Active producer licenses for internal funnel reporting.
 * Florida is on file as pending and is not included.
 * The public site and ad targeting keep their own shorter lists.
 */
const LICENSED_STATES = [
  { code: "AZ", name: "Arizona" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "KS", name: "Kansas" },
  { code: "MI", name: "Michigan" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NM", name: "New Mexico" },
  { code: "OH", name: "Ohio" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TX", name: "Texas" },
  { code: "VA", name: "Virginia" },
];

const LICENSED_STATE_CODES = LICENSED_STATES.map((row) => row.code);

const REGION_TO_CODE = {};
LICENSED_STATES.forEach((row) => {
  REGION_TO_CODE[row.name.toLowerCase()] = row.code;
  REGION_TO_CODE[row.code.toLowerCase()] = row.code;
});

function isLicensedState(code) {
  return LICENSED_STATE_CODES.includes(String(code || "").trim().toUpperCase());
}

function licensedStateFromName(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  const first = text.split(",")[0].trim().toLowerCase();
  if (REGION_TO_CODE[first]) return REGION_TO_CODE[first];
  const upper = text.toUpperCase();
  return isLicensedState(upper) ? upper : "";
}

module.exports = {
  LICENSED_STATES,
  LICENSED_STATE_CODES,
  REGION_TO_CODE,
  isLicensedState,
  licensedStateFromName,
};
