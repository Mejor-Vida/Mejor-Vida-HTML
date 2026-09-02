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
    return {
      name: row.name,
      code: row.code || licensedCode || "",
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      spend: row.spend != null ? Number(row.spend) || 0 : null,
      licensed: !!licensedCode,
      licensedCode: licensedCode || "",
      isUs: isUnitedStatesName(row),
    };
  });
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
  const locations = annotateLocations(raw.locations, grain);
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
  LICENSED_STATES,
};
