/**
 * Click geography for CRM Funnel Analytics.
 * Facebook/Google Ads: U.S. state (or country fallback). Organic: country only (GSC has no state).
 */
const { parseViewId } = require("./funnel-analytics-config");
const {
  parseFacebookViewVariant,
  fetchMetaClicksByRegion,
} = require("./ad-platform-insights");
const { fetchClicksByLocation } = require("./google-ads-api");
const { fetchGscClicksByCountry } = require("./gsc-data-api");

const LICENSED_STATES = [
  { code: "NE", name: "Nebraska" },
  { code: "KS", name: "Kansas" },
  { code: "CO", name: "Colorado" },
  { code: "NV", name: "Nevada" },
];

const NAME_TO_CODE = {
  nebraska: "NE",
  kansas: "KS",
  colorado: "CO",
  nevada: "NV",
  ne: "NE",
  ks: "KS",
  co: "CO",
  nv: "NV",
};

const US_STATE_NAMES = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
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
  "district of columbia": "DC",
  "washington, dc": "DC",
  "washington dc": "DC",
  "puerto rico": "PR",
};

function locationHeadName(name) {
  return String(name || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
}

function isUsPlaceName(name) {
  const head = locationHeadName(name);
  return !!(US_STATE_NAMES[head] || NAME_TO_CODE[head]);
}

function licensedCodeFromName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const first = raw.split(",")[0].trim().toLowerCase();
  if (NAME_TO_CODE[first]) return NAME_TO_CODE[first];
  const upper = raw.toUpperCase();
  if (upper === "NE" || upper === "KS" || upper === "CO" || upper === "NV") return upper;
  return "";
}

function isUnitedStatesName(loc) {
  const code = String((loc && loc.code) || "").toLowerCase();
  if (code === "usa" || code === "us") return true;
  const name = String((loc && loc.name) || "")
    .trim()
    .toLowerCase();
  return (
    name === "united states" ||
    name === "usa" ||
    name === "us" ||
    name === "united states of america"
  );
}

function annotateLocations(locations, grain) {
  return (locations || []).map((row) => {
    const licensedCode = grain === "state" ? licensedCodeFromName(row.name) : "";
    const isUs =
      isUnitedStatesName(row) || (grain === "state" && isUsPlaceName(row.name));
    return {
      name: row.name,
      code: row.code || licensedCode || "",
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      spend: row.spend != null ? Number(row.spend) || 0 : null,
      licensed: !!licensedCode,
      licensedCode: licensedCode || "",
      isUs,
      isOutsideUs: !isUs,
      nameKey: isUnitedStatesName(row) ? "funnel_geo_usa" : "",
    };
  });
}

function emptyOutsideRow() {
  return {
    name: "Outside of the USA",
    nameKey: "funnel_geo_outside_usa",
    code: "intl",
    clicks: 0,
    impressions: 0,
    spend: null,
    licensed: false,
    licensedCode: "",
    isUs: false,
    isOutsideUs: true,
  };
}

function emptyUsCountryRow() {
  return {
    name: "United States",
    nameKey: "funnel_geo_usa",
    code: "usa",
    clicks: 0,
    impressions: 0,
    spend: null,
    licensed: false,
    licensedCode: "",
    isUs: true,
    isOutsideUs: false,
  };
}

function collapseNonUsLocations(locations, grain) {
  const rows = locations || [];
  if (!rows.length) return [];

  const usRows = [];
  const outside = emptyOutsideRow();
  let outsideSpend = 0;
  let hasOutsideSpend = false;

  rows.forEach((row) => {
    if (row.isUs) {
      usRows.push(row);
      return;
    }
    outside.clicks += Number(row.clicks) || 0;
    outside.impressions += Number(row.impressions) || 0;
    if (row.spend != null) {
      hasOutsideSpend = true;
      outsideSpend += Number(row.spend) || 0;
    }
  });
  if (hasOutsideSpend) outside.spend = outsideSpend;

  const out = [];
  if (grain === "country") {
    const us = usRows.reduce((acc, row) => {
      if (!acc) {
        return {
          ...row,
          name: "United States",
          nameKey: "funnel_geo_usa",
          code: row.code || "usa",
          isUs: true,
          isOutsideUs: false,
        };
      }
      acc.clicks += Number(row.clicks) || 0;
      acc.impressions += Number(row.impressions) || 0;
      if (row.spend != null) acc.spend = (Number(acc.spend) || 0) + (Number(row.spend) || 0);
      return acc;
    }, null);
    if (us) out.push(us);
    else if (outside.clicks || outside.impressions) out.push(emptyUsCountryRow());
  } else {
    usRows.sort(
      (a, b) =>
        Number(b.licensed) - Number(a.licensed) ||
        b.clicks - a.clicks ||
        String(a.name).localeCompare(String(b.name))
    );
    out.push(...usRows);
  }

  if (outside.clicks || outside.impressions) out.push(outside);
  return out;
}

function summarize(locations, grain) {
  let totalClicks = 0;
  let licensedClicks = 0;
  let otherClicks = 0;
  let usClicks = 0;
  let internationalClicks = 0;
  (locations || []).forEach((row) => {
    const clicks = Number(row.clicks) || 0;
    totalClicks += clicks;
    if (grain === "state") {
      if (row.licensed) licensedClicks += clicks;
      else otherClicks += clicks;
    } else if (grain === "country") {
      if (row.isUs) usClicks += clicks;
      else internationalClicks += clicks;
    }
  });
  return {
    totalClicks,
    licensedClicks,
    otherClicks,
    usClicks,
    internationalClicks,
  };
}

async function fetchGeoClicks(view, dateFrom, dateTo) {
  const { source } = parseViewId(view);

  if (source === "direct") {
    return {
      configured: true,
      grain: "none",
      platform: "direct",
      noteKey: "funnel_geo_note_direct",
      locations: [],
      summary: summarize([], "none"),
    };
  }

  let raw;
  if (source === "facebook") {
    raw = await fetchMetaClicksByRegion(dateFrom, dateTo, {
      adSetVariant: parseFacebookViewVariant(view),
    });
  } else if (source === "google") {
    raw = await fetchClicksByLocation(dateFrom, dateTo);
  } else if (source === "organic") {
    raw = await fetchGscClicksByCountry(dateFrom, dateTo);
  } else {
    return {
      configured: true,
      grain: "none",
      platform: source || "unknown",
      noteKey: "funnel_geo_note_direct",
      locations: [],
      summary: summarize([], "none"),
    };
  }

  const grain = raw.grain || (source === "organic" ? "country" : "state");
  const locations = collapseNonUsLocations(annotateLocations(raw.locations, grain), grain);
  const noteKey =
    grain === "none"
      ? "funnel_geo_note_direct"
      : grain === "country"
        ? source === "organic"
          ? "funnel_geo_note_organic"
          : "funnel_geo_note_google_country"
        : source === "facebook"
          ? "funnel_geo_note_facebook"
          : "funnel_geo_note_google";

  return {
    configured: raw.configured !== false,
    grain,
    platform: raw.platform || source,
    noteKey,
    setupHint: raw.setupHint || null,
    oauthAuthUrl: raw.oauthAuthUrl || null,
    error: raw.error || null,
    firstIncompleteDate: raw.firstIncompleteDate || null,
    locations,
    summary: summarize(locations, grain),
  };
}

module.exports = {
  fetchGeoClicks,
  licensedCodeFromName,
  collapseNonUsLocations,
  LICENSED_STATES,
};
