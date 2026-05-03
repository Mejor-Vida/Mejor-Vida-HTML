/**
 * ManyChat REST API: subscriber/getInfo pull.
 *
 * Reads the subscriber profile + custom_fields for a single subscriber id,
 * collapses ManyChat field aliases (idioma/edad/sexo/tabaco/quoteLow/...)
 * into canonical keys our API code already uses.
 *
 * Env: MANYCHAT_API_KEY (Bearer)
 *
 * Used by: api/lead-intake.js (push body still wins on conflicts).
 */

const UNRESOLVED_TEMPLATE = /^\{\{[\s\S]*\}\}$/;

/** Treat empty / null / unresolved {{...}} templates as missing. */
function asValue(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || UNRESOLVED_TEMPLATE.test(s)) return null;
  return s;
}

/**
 * Map of ManyChat field/custom_field names → canonical key the rest of the
 * codebase uses. Lookup is case-insensitive and ignores whitespace/underscores.
 *
 * Update this map (one place) when ManyChat field names change.
 */
const FIELD_ALIASES = {
  // language
  idioma: "language",
  language: "language",
  // us_state
  estado: "us_state",
  state: "us_state",
  us_state: "us_state",
  usstate: "us_state",
  // age
  edad: "age",
  age: "age",
  // gender / sex
  sexo: "gender",
  gender: "gender",
  sex: "gender",
  // smoker
  tabaco: "is_smoker",
  tobacco: "is_smoker",
  smoker: "is_smoker",
  is_smoker: "is_smoker",
  issmoker: "is_smoker",
  // quotes
  quote_low: "quote_low",
  quotelow: "quote_low",
  quote_high: "quote_high",
  quotehigh: "quote_high",
  // names
  first_name: "first_name",
  firstname: "first_name",
  last_name: "last_name",
  lastname: "last_name",
  // identity
  email: "email",
  phone: "phone",
  whatsapp_id: "whatsapp_id",
  whatsappid: "whatsapp_id",
};

function aliasKey(rawName) {
  const k = String(rawName || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "_");
  return FIELD_ALIASES[k] || FIELD_ALIASES[k.replace(/_/g, "")] || null;
}

function parseLanguage(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith("en")) return "english";
  if (s.startsWith("es") || s === "español" || s === "espanol") return "spanish";
  if (s === "english") return "english";
  if (s === "spanish") return "spanish";
  return null;
}

function parseAge(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 && n < 130 ? n : null;
}

function parseGender(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return null;
  if (["hombre", "m", "male", "masculino", "masculine"].includes(s)) return "male";
  if (["mujer", "f", "female", "femenino", "feminine"].includes(s)) return "female";
  return null;
}

function parseBool(v) {
  if (v === true || v === false) return v;
  const s = String(v || "").trim().toLowerCase();
  if (["true", "yes", "sí", "si", "1", "y", "smoker", "fumador"].includes(s)) return true;
  if (["false", "no", "0", "n", "non-smoker", "no_fumador"].includes(s)) return false;
  return null;
}

function parseEmail(v) {
  const s = asValue(v);
  if (!s) return null;
  const lower = s.toLowerCase().slice(0, 500);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower) ? lower : null;
}

function parseUsState(v) {
  const s = asValue(v);
  if (!s) return null;
  return s.toUpperCase().slice(0, 5);
}

/** Index a `{name, value}` array (ManyChat custom_fields) by alias. */
function flattenCustomFields(arr) {
  const out = {};
  if (!Array.isArray(arr)) return out;
  for (const f of arr) {
    if (!f || typeof f !== "object") continue;
    const name = f.name != null ? f.name : f.field_name;
    const canon = aliasKey(name);
    if (!canon) continue;
    const val = asValue(f.value);
    if (val === null) continue;
    if (out[canon] === undefined) out[canon] = val;
  }
  return out;
}

/**
 * Coerce raw alias → canonical-typed values our writers expect.
 * Inputs are strings; outputs are typed (number / boolean / lowercase).
 */
function coerceNormalized(rawByAlias) {
  const out = {};
  const lang = parseLanguage(rawByAlias.language);
  if (lang) out.language = lang;
  const us = parseUsState(rawByAlias.us_state);
  if (us) out.us_state = us;
  const age = parseAge(rawByAlias.age);
  if (age != null) out.age = age;
  const g = parseGender(rawByAlias.gender);
  if (g) out.gender = g;
  if (rawByAlias.is_smoker !== undefined) {
    const b = parseBool(rawByAlias.is_smoker);
    if (b !== null) out.is_smoker = b;
  }
  const ql = asValue(rawByAlias.quote_low);
  if (ql) out.quote_low = ql.slice(0, 200);
  const qh = asValue(rawByAlias.quote_high);
  if (qh) out.quote_high = qh.slice(0, 200);
  const fn = asValue(rawByAlias.first_name);
  if (fn) out.first_name = fn.slice(0, 200);
  const ln = asValue(rawByAlias.last_name);
  if (ln) out.last_name = ln.slice(0, 200);
  const em = parseEmail(rawByAlias.email);
  if (em) out.email = em;
  const ph = asValue(rawByAlias.phone);
  if (ph) out.phone = ph.slice(0, 40);
  const wid = asValue(rawByAlias.whatsapp_id);
  if (wid) out.whatsapp_id = wid.slice(0, 80);
  return out;
}

/**
 * Build canonical normalized fields from a ManyChat /fb/subscriber/getInfo
 * payload (`profile` block + `custom_fields` array).
 *
 * @param {object} apiPayload `data` field from getInfo response
 * @returns {{ normalized: object, manychat_subscriber_id: string|null }}
 */
function normalizeManychatPayload(apiPayload) {
  if (!apiPayload || typeof apiPayload !== "object") {
    return { normalized: {}, manychat_subscriber_id: null };
  }
  // ManyChat `getInfo` returns a flat object — older docs show `profile` nested.
  // Treat both.
  const profile = apiPayload.profile && typeof apiPayload.profile === "object" ? apiPayload.profile : apiPayload;
  const customFields = apiPayload.custom_fields || apiPayload.customFields || [];
  const fromCustom = flattenCustomFields(customFields);
  const fromProfile = {
    first_name: profile.first_name || profile.firstName,
    last_name: profile.last_name || profile.lastName,
    email: profile.email,
    phone: profile.phone || profile.whatsapp_phone,
    whatsapp_id: profile.whatsapp_id || profile.whatsapp_phone,
    language: profile.language || profile.locale,
  };
  // Custom fields override profile (custom is what the user explicitly stores).
  const merged = { ...fromProfile, ...fromCustom };
  const normalized = coerceNormalized(merged);
  if (!normalized.whatsapp_id && normalized.phone) normalized.whatsapp_id = normalized.phone;
  const sid = asValue(profile.id) || asValue(profile.user_refs && profile.user_refs[0] && profile.user_refs[0].subscriber_id);
  return { normalized, manychat_subscriber_id: sid };
}

/**
 * Fetch a ManyChat subscriber by id and return canonical normalized fields.
 *
 * Never throws — returns `{ ok: false, ... }` on transport / 4xx / 5xx /
 * malformed payload so callers can fall back to push-body data.
 *
 * @param {string} subscriberId ManyChat subscriber id (numeric string)
 * @param {{ apiKey: string, timeoutMs?: number }} opts
 */
async function fetchManychatSubscriber(subscriberId, { apiKey, timeoutMs = 6000 } = {}) {
  const id = asValue(subscriberId);
  if (!id) return { ok: false, error: "missing subscriber_id" };
  if (!apiKey) return { ok: false, error: "MANYCHAT_API_KEY missing" };
  const url = `https://api.manychat.com/fb/subscriber/getInfo?subscriber_id=${encodeURIComponent(id)}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  let r;
  try {
    r = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: ctrl.signal,
    });
  } catch (e) {
    clearTimeout(t);
    return { ok: false, error: (e && e.message) || "fetch failed" };
  }
  clearTimeout(t);
  const text = await r.text();
  if (!r.ok) {
    return { ok: false, status: r.status, error: text.slice(0, 400) };
  }
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (e) {
    return { ok: false, status: r.status, error: "non-JSON response" };
  }
  if (!payload || payload.status !== "success" || !payload.data) {
    return { ok: false, status: r.status, error: (payload && payload.message) || "manychat returned non-success" };
  }
  const { normalized, manychat_subscriber_id } = normalizeManychatPayload(payload.data);
  return { ok: true, raw: payload.data, normalized, manychat_subscriber_id: manychat_subscriber_id || id };
}

module.exports = {
  fetchManychatSubscriber,
  normalizeManychatPayload,
  // Exported for unit tests.
  _internal: { aliasKey, coerceNormalized, parseLanguage, parseAge, parseGender, parseBool, parseEmail, parseUsState, flattenCustomFields, FIELD_ALIASES },
};
