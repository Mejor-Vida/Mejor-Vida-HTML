/* U.S. states + DC (full list for staff CRM / lookups). */
window.MVS_US_STATES = [
  { c: 'AL', n: 'Alabama' },
  { c: 'AK', n: 'Alaska' },
  { c: 'AZ', n: 'Arizona' },
  { c: 'AR', n: 'Arkansas' },
  { c: 'CA', n: 'California' },
  { c: 'CO', n: 'Colorado' },
  { c: 'CT', n: 'Connecticut' },
  { c: 'DE', n: 'Delaware' },
  { c: 'DC', n: 'District of Columbia' },
  { c: 'FL', n: 'Florida' },
  { c: 'GA', n: 'Georgia' },
  { c: 'HI', n: 'Hawaii' },
  { c: 'ID', n: 'Idaho' },
  { c: 'IL', n: 'Illinois' },
  { c: 'IN', n: 'Indiana' },
  { c: 'IA', n: 'Iowa' },
  { c: 'KS', n: 'Kansas' },
  { c: 'KY', n: 'Kentucky' },
  { c: 'LA', n: 'Louisiana' },
  { c: 'ME', n: 'Maine' },
  { c: 'MD', n: 'Maryland' },
  { c: 'MA', n: 'Massachusetts' },
  { c: 'MI', n: 'Michigan' },
  { c: 'MN', n: 'Minnesota' },
  { c: 'MS', n: 'Mississippi' },
  { c: 'MO', n: 'Missouri' },
  { c: 'MT', n: 'Montana' },
  { c: 'NE', n: 'Nebraska' },
  { c: 'NV', n: 'Nevada' },
  { c: 'NH', n: 'New Hampshire' },
  { c: 'NJ', n: 'New Jersey' },
  { c: 'NM', n: 'New Mexico' },
  { c: 'NY', n: 'New York' },
  { c: 'NC', n: 'North Carolina' },
  { c: 'ND', n: 'North Dakota' },
  { c: 'OH', n: 'Ohio' },
  { c: 'OK', n: 'Oklahoma' },
  { c: 'OR', n: 'Oregon' },
  { c: 'PA', n: 'Pennsylvania' },
  { c: 'RI', n: 'Rhode Island' },
  { c: 'SC', n: 'South Carolina' },
  { c: 'SD', n: 'South Dakota' },
  { c: 'TN', n: 'Tennessee' },
  { c: 'TX', n: 'Texas' },
  { c: 'UT', n: 'Utah' },
  { c: 'VT', n: 'Vermont' },
  { c: 'VA', n: 'Virginia' },
  { c: 'WA', n: 'Washington' },
  { c: 'WV', n: 'West Virginia' },
  { c: 'WI', n: 'Wisconsin' },
  { c: 'WY', n: 'Wyoming' },
];

/** States where Julie can quote online (producer licenses). */
window.MVS_LICENSED_STATE_CODES = ['NE', 'KS', 'CO', 'NV'];

/**
 * Quote / landing residence picker: licensed states + Other.
 * Prefer this over MVS_US_STATES for public quote flows.
 */
window.MVS_QUOTE_STATES = [
  { c: 'NE', n: 'Nebraska' },
  { c: 'KS', n: 'Kansas' },
  { c: 'CO', n: 'Colorado' },
  { c: 'NV', n: 'Nevada' },
  { c: 'OTHER', n: 'Other state', nEs: 'Otro estado' },
];

window.MVS_isLicensedQuoteState = function (code) {
  var c = String(code || '').trim().toUpperCase();
  return window.MVS_LICENSED_STATE_CODES.indexOf(c) !== -1;
};

window.MVS_isOutOfStateQuoteSelection = function (code) {
  var c = String(code || '').trim().toUpperCase();
  if (!c) return false;
  return !window.MVS_isLicensedQuoteState(c);
};

window.MVS_quoteStateLabel = function (row, lang) {
  if (!row) return '';
  if (row.c === 'OTHER' && lang === 'es' && row.nEs) return row.nEs;
  return row.n || row.c || '';
};
