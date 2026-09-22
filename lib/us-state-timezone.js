/**
 * US state abbreviations + IANA timezone for CRM list and daily call email.
 */
const { extractAreaCode, AREA_CODE_TIMEZONES } = require("./telemarketing-compliance");

const STATE_NAME_TO_ABBR = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  "district of columbia": "DC",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

const STATE_ABBRS = new Set(Object.values(STATE_NAME_TO_ABBR));

const STATE_DEFAULT_IANA = {
  AL: "America/Chicago",
  AK: "America/Anchorage",
  AZ: "America/Phoenix",
  AR: "America/Chicago",
  CA: "America/Los_Angeles",
  CO: "America/Denver",
  CT: "America/New_York",
  DC: "America/New_York",
  DE: "America/New_York",
  FL: "America/New_York",
  GA: "America/New_York",
  HI: "Pacific/Honolulu",
  IA: "America/Chicago",
  ID: "America/Boise",
  IL: "America/Chicago",
  IN: "America/Indiana/Indianapolis",
  KS: "America/Chicago",
  KY: "America/New_York",
  LA: "America/Chicago",
  MA: "America/New_York",
  MD: "America/New_York",
  ME: "America/New_York",
  MI: "America/Detroit",
  MN: "America/Chicago",
  MO: "America/Chicago",
  MS: "America/Chicago",
  MT: "America/Denver",
  NC: "America/New_York",
  ND: "America/Chicago",
  NE: "America/Chicago",
  NH: "America/New_York",
  NJ: "America/New_York",
  NM: "America/Denver",
  NV: "America/Los_Angeles",
  NY: "America/New_York",
  OH: "America/New_York",
  OK: "America/Chicago",
  OR: "America/Los_Angeles",
  PA: "America/New_York",
  RI: "America/New_York",
  SC: "America/New_York",
  SD: "America/Chicago",
  TN: "America/Chicago",
  TX: "America/Chicago",
  UT: "America/Denver",
  VA: "America/New_York",
  VT: "America/New_York",
  WA: "America/Los_Angeles",
  WI: "America/Chicago",
  WV: "America/New_York",
  WY: "America/Denver",
};

const IANA_ZONE_NAME = {
  "America/New_York": "Eastern",
  "America/Detroit": "Eastern",
  "America/Indiana/Indianapolis": "Eastern",
  "America/Chicago": "Central",
  "America/Denver": "Mountain",
  "America/Boise": "Mountain",
  "America/Phoenix": "Mountain",
  "America/Los_Angeles": "Pacific",
  "America/Anchorage": "Alaska",
  "Pacific/Honolulu": "Hawaii",
};

function normalizeUsStateAbbr(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const upper = s.toUpperCase();
  if (upper.length === 2 && STATE_ABBRS.has(upper)) return upper;
  return STATE_NAME_TO_ABBR[s.toLowerCase()] || "";
}

function stateFromRecord(obj) {
  if (!obj || typeof obj !== "object") return "";
  return normalizeUsStateAbbr(
    obj.us_state || obj.state_code || obj.state || obj.quote_state || obj.estado
  );
}

function ianaTimezoneForLead(stateAbbr, phone) {
  const st = normalizeUsStateAbbr(stateAbbr);
  if ((st === "NE" || st === "KS") && phone) {
    const npa = extractAreaCode(phone);
    if (npa && AREA_CODE_TIMEZONES[npa]) return AREA_CODE_TIMEZONES[npa];
  }
  if (st && STATE_DEFAULT_IANA[st]) return STATE_DEFAULT_IANA[st];
  return "";
}

function timezoneShortName(iana) {
  if (!iana) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const raw = (parts.find((p) => p.type === "timeZoneName") || {}).value || "";
    return String(raw).replace(/^GMT.*$/i, "") || "";
  } catch (_) {
    return "";
  }
}

function formatLeadLocation(stateAbbr, phone) {
  const state = normalizeUsStateAbbr(stateAbbr);
  const iana = ianaTimezoneForLead(state, phone);
  const zoneName = IANA_ZONE_NAME[iana] || "";
  const tzShort = timezoneShortName(iana);
  let timezoneLabel = "";
  if (zoneName && tzShort) timezoneLabel = `${zoneName} (${tzShort})`;
  else if (zoneName) timezoneLabel = zoneName;
  else if (tzShort) timezoneLabel = tzShort;
  let fullLabel = "";
  if (state && timezoneLabel) fullLabel = `${state} · ${timezoneLabel}`;
  else if (state) fullLabel = state;
  else if (timezoneLabel) fullLabel = timezoneLabel;
  return { state, iana, timezoneLabel, fullLabel };
}

function applyLocationFields(target, stateAbbr, phone) {
  if (!target || typeof target !== "object") return target;
  const loc = formatLeadLocation(stateAbbr, phone);
  target.us_state = loc.state || "";
  target.timezone = loc.iana || "";
  target.timezone_label = loc.timezoneLabel || "";
  target.location_label = loc.fullLabel || "";
  return target;
}

module.exports = {
  normalizeUsStateAbbr,
  stateFromRecord,
  ianaTimezoneForLead,
  formatLeadLocation,
  applyLocationFields,
};
