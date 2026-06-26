/**
 * Meta CAPI — normalize + SHA-256 hash (trim, lowercase text fields before hash).
 */
const crypto = require("crypto");

function capiSha256Hex(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function hashMetaText(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return capiSha256Hex(normalized);
}

function normalizePhoneDigits(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = "1" + digits;
  return digits || null;
}

function hashMetaPhone(phone) {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return null;
  return capiSha256Hex(digits);
}

function normalizeZip(zip) {
  const digits = String(zip || "").replace(/\D/g, "").slice(0, 5);
  return digits.length >= 5 ? digits : null;
}

function hashMetaZip(zip) {
  const normalized = normalizeZip(zip);
  if (!normalized) return null;
  return capiSha256Hex(normalized);
}

function normalizeState(state) {
  const code = String(state || "")
    .trim()
    .toLowerCase();
  return code.length === 2 ? code : null;
}

function hashMetaState(state) {
  const normalized = normalizeState(state);
  if (!normalized) return null;
  return capiSha256Hex(normalized);
}

function normalizeCountry(country) {
  const code = String(country || "")
    .trim()
    .toLowerCase();
  if (!code) return null;
  return code.length === 2 ? code : "us";
}

function hashMetaCountry(country) {
  const normalized = normalizeCountry(country);
  if (!normalized) return null;
  return capiSha256Hex(normalized);
}

function normalizeGender(sex) {
  const s = String(sex || "").trim().toLowerCase();
  if (s === "male" || s === "m") return "m";
  if (s === "female" || s === "f") return "f";
  return null;
}

function hashMetaGender(sex) {
  const g = normalizeGender(sex);
  if (!g) return null;
  return capiSha256Hex(g);
}

function normalizeDob(dob) {
  const s = String(dob || "").trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`;
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const mm = slash[1].padStart(2, "0");
    const dd = slash[2].padStart(2, "0");
    return `${slash[3]}${mm}${dd}`;
  }
  const compact = s.replace(/\D/g, "");
  if (compact.length === 8) return compact;
  return null;
}

function hashMetaDob(dob) {
  const normalized = normalizeDob(dob);
  if (!normalized) return null;
  return capiSha256Hex(normalized);
}

function hashMetaExternalId(externalId) {
  const id = String(externalId || "").trim();
  if (!id) return null;
  return capiSha256Hex(id.toLowerCase());
}

module.exports = {
  capiSha256Hex,
  normalizeText,
  hashMetaText,
  normalizePhoneDigits,
  hashMetaPhone,
  normalizeZip,
  hashMetaZip,
  normalizeState,
  hashMetaState,
  normalizeCountry,
  hashMetaCountry,
  normalizeGender,
  hashMetaGender,
  normalizeDob,
  hashMetaDob,
  hashMetaExternalId,
};
