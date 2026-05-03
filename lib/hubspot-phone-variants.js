/**
 * Last N digits after stripping non-digits — mirrors PostgreSQL
 * `RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10)` for N=10 (shorter
 * strings return as-is, same as PG RIGHT).
 */
function phoneLast10Digits(input) {
  const digits = String(input || "").trim().replace(/\D/g, "");
  if (!digits) return "";
  return digits.length <= 10 ? digits : digits.slice(-10);
}

/**
 * Values to try when searching HubSpot contacts by phone (EQ is exact).
 * ManyChat often sends 10-digit US; HubSpot may store +1… E.164.
 */
function hubspotPhoneSearchVariants(phone) {
  const raw = String(phone || "").trim();
  if (!raw) return [];
  const digits = raw.replace(/\D/g, "");
  const out = [];
  const push = (v) => {
    if (v && !out.includes(v)) out.push(v);
  };
  push(raw);
  if (digits) {
    push(digits);
    if (digits.length === 10) {
      push(`+1${digits}`);
      push(`1${digits}`);
    }
    if (digits.length === 11 && digits.startsWith("1")) {
      push(`+${digits}`);
      push(digits.slice(1));
    }
  }
  return out;
}

module.exports = { hubspotPhoneSearchVariants, phoneLast10Digits };
