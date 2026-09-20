/**
 * Google Search Console Search Analytics API (organic search performance).
 * OAuth: GSC_REFRESH_TOKEN + same client as GA4 (GA4_OAUTH_CLIENT_ID/SECRET or GMAIL_*).
 */
const { google } = require("./google-clients");
const { getGa4OAuthClientConfig } = require("./ga4-oauth-config");

const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_SITE_URL = "sc-domain:mejorvidainsurance.com";

function getSiteUrl() {
  const raw = String(process.env.GSC_SITE_URL || DEFAULT_SITE_URL).trim();
  if (!raw) return DEFAULT_SITE_URL;
  if (raw.startsWith("sc-domain:")) return raw;
  return raw.endsWith("/") ? raw : raw + "/";
}

function getOAuthRedirectUri() {
  const fromEnv = String(process.env.GSC_OAUTH_REDIRECT_URI || "").trim();
  if (fromEnv) return fromEnv;
  return "https://www.mejorvidainsurance.com/api/staff/gsc-callback";
}

function hasGscOAuthCredentials() {
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  return !!(
    String(process.env.GSC_REFRESH_TOKEN || "").trim() &&
    clientId &&
    clientSecret
  );
}

function gscSetupHint() {
  return (
    "Connect Google Search Console: enable Search Console API in Google Cloud, " +
    "open /api/staff/gsc-auth once, set GSC_REFRESH_TOKEN and GSC_SITE_URL in Vercel."
  );
}

async function getGscAuthClient() {
  if (!hasGscOAuthCredentials()) return null;
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, getOAuthRedirectUri());
  oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });
  return oauth2Client;
}

async function querySearchAnalytics(startDate, endDate, requestBody) {
  const auth = await getGscAuthClient();
  if (!auth) {
    const err = new Error("GSC not configured");
    err.code = "GSC_NOT_CONFIGURED";
    throw err;
  }
  const searchconsole = google.searchconsole({ version: "v1", auth });
  const res = await searchconsole.searchanalytics.query({
    siteUrl: getSiteUrl(),
    requestBody: {
      startDate,
      endDate,
      searchType: "web",
      // Include fresh/partial data for recent dates (GSC UI "last 24h" uses this; default API is final-only).
      dataState: "all",
      ...requestBody,
    },
  });
  return res.data || {};
}

function aggregateRows(rows) {
  let clicks = 0;
  let impressions = 0;
  let positionWeighted = 0;
  (rows || []).forEach((row) => {
    const c = Number(row.clicks) || 0;
    const i = Number(row.impressions) || 0;
    clicks += c;
    impressions += i;
    positionWeighted += (Number(row.position) || 0) * i;
  });
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const position = impressions > 0 ? positionWeighted / impressions : null;
  return { clicks, impressions, ctr, position };
}

function mapQueryRows(rows, limit) {
  return (rows || [])
    .slice(0, limit)
    .map((row) => ({
      query: (row.keys && row.keys[0]) || "",
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      ctr: Number(row.ctr) || 0,
      position: Number(row.position) || 0,
    }))
    .filter((r) => r.query);
}

function mapPageRows(rows, limit) {
  return (rows || [])
    .slice(0, limit)
    .map((row) => {
      const page = (row.keys && row.keys[0]) || "";
      let path = page;
      try {
        const u = new URL(page);
        path = u.pathname || page;
      } catch (e) {
        /* keep raw */
      }
      return {
        page,
        path,
        clicks: Number(row.clicks) || 0,
        impressions: Number(row.impressions) || 0,
        ctr: Number(row.ctr) || 0,
        position: Number(row.position) || 0,
      };
    })
    .filter((r) => r.page);
}

function mapDailyRows(rows, dateFrom, dateTo) {
  const map = new Map();
  (rows || []).forEach((row) => {
    const raw = (row.keys && row.keys[0]) || "";
    const date =
      raw.length === 8 && /^\d{8}$/.test(raw)
        ? raw.slice(0, 4) + "-" + raw.slice(4, 6) + "-" + raw.slice(6, 8)
        : raw.slice(0, 10);
    if (!date) return;
    const clicks = Number(row.clicks) || 0;
    const impressions = Number(row.impressions) || 0;
    const ctr = impressions > 0 ? clicks / impressions : Number(row.ctr) || 0;
    const position = Number(row.position) || 0;
    map.set(date, { date, clicks, impressions, ctr, position });
  });

  const out = [];
  let cur = dateFrom;
  while (cur <= dateTo) {
    const row = map.get(cur) || { date: cur, clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const clicks = Number(row.clicks) || 0;
    const impressions = Number(row.impressions) || 0;
    out.push({
      date: cur,
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : Number(row.ctr) || 0,
      position: Number(row.position) || 0,
    });
    cur = addDaysYmd(cur, 1);
  }
  return out;
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return t.toISOString().slice(0, 10);
}

/** Spanish homepage only — not /en/. */
const HOME_PAGE_REGEX = "^https://(www\\.)?mejorvidainsurance\\.com/?(index\\.html)?$";
/** City teaching pages under /estados/{state}/{city}.html — not state hubs. */
const CITY_PAGE_REGEX = "^https://(www\\.)?mejorvidainsurance\\.com/estados/[^/]+/[^/?#]+\\.html$";

function pageFilterBody(kind) {
  const expression = kind === "city" ? CITY_PAGE_REGEX : HOME_PAGE_REGEX;
  return {
    dimensionFilterGroups: [
      {
        filters: [
          {
            dimension: "page",
            operator: "includingRegex",
            expression,
          },
        ],
      },
    ],
  };
}

function homePageFilterBody() {
  return pageFilterBody("home");
}

function cityPageFilterBody() {
  return pageFilterBody("city");
}

async function fetchGscOrganicSearch(dateFrom, dateTo) {
  if (!hasGscOAuthCredentials()) {
    return {
      show: true,
      source: "gsc",
      configured: false,
      setupHint: gscSetupHint(),
      oauthAuthUrl: "/api/staff/gsc-auth",
    };
  }

  try {
    const homeFilter = homePageFilterBody();
    const cityFilter = cityPageFilterBody();
    const [
      totalsData,
      queryData,
      pageData,
      dailyMetaData,
      homeTotalsData,
      homeQueryData,
      cityTotalsData,
    ] = await Promise.all([
        querySearchAnalytics(dateFrom, dateTo, { rowLimit: 1 }),
        querySearchAnalytics(dateFrom, dateTo, {
          dimensions: ["query"],
          rowLimit: 15,
        }),
        querySearchAnalytics(dateFrom, dateTo, {
          dimensions: ["page"],
          rowLimit: 10,
        }),
        querySearchAnalytics(dateFrom, dateTo, {
          dimensions: ["date"],
          rowLimit: 1,
        }),
        querySearchAnalytics(dateFrom, dateTo, { rowLimit: 1, ...homeFilter }),
        querySearchAnalytics(dateFrom, dateTo, {
          dimensions: ["query"],
          rowLimit: 10,
          ...homeFilter,
        }),
        querySearchAnalytics(dateFrom, dateTo, { rowLimit: 1, ...cityFilter }),
      ]);

    const totals = aggregateRows(totalsData.rows);
    const home = aggregateRows(homeTotalsData.rows);
    const cities = aggregateRows(cityTotalsData.rows);
    return {
      show: true,
      source: "gsc",
      configured: true,
      dateFrom,
      dateTo,
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: totals.ctr,
      position: totals.position,
      firstIncompleteDate:
        (dailyMetaData.metadata && dailyMetaData.metadata.first_incomplete_date) || null,
      topQueries: mapQueryRows(queryData.rows, 10),
      topPages: mapPageRows(pageData.rows, 10),
      home: {
        path: "/",
        clicks: home.clicks,
        impressions: home.impressions,
        ctr: home.ctr,
        position: home.position,
        topQueries: mapQueryRows(homeQueryData.rows, 8),
      },
      cities: {
        clicks: cities.clicks,
        impressions: cities.impressions,
        ctr: cities.ctr,
        position: cities.position,
      },
    };
  } catch (e) {
    return {
      show: true,
      source: "gsc",
      configured: true,
      clicks: null,
      impressions: null,
      ctr: null,
      position: null,
      home: null,
      cities: null,
      error: e.message || String(e),
      setupHint: /403|403|permission|forbidden/i.test(String(e.message))
        ? "Confirm GSC_SITE_URL matches your Search Console property and the OAuth user has access."
        : undefined,
    };
  }
}

// Search Console returns ISO 3166-1 alpha-3. Intl.DisplayNames needs alpha-2.
const ISO3_TO_ISO2 = {
  abw: "AW", afg: "AF", ago: "AO", aia: "AI", ala: "AX", alb: "AL", and: "AD",
  are: "AE", arg: "AR", arm: "AM", asm: "AS", ata: "AQ", atf: "TF", atg: "AG",
  aus: "AU", aut: "AT", aze: "AZ", bdi: "BI", bel: "BE", ben: "BJ", bes: "BQ",
  bfa: "BF", bgd: "BD", bgr: "BG", bhr: "BH", bhs: "BS", bih: "BA", blm: "BL",
  blr: "BY", blz: "BZ", bmu: "BM", bol: "BO", bra: "BR", brb: "BB", brn: "BN",
  btn: "BT", bvt: "BV", bwa: "BW", caf: "CF", can: "CA", cck: "CC", che: "CH",
  chl: "CL", chn: "CN", civ: "CI", cmr: "CM", cod: "CD", cog: "CG", cok: "CK",
  col: "CO", com: "KM", cpv: "CV", cri: "CR", cub: "CU", cuw: "CW", cxr: "CX",
  cym: "KY", cyp: "CY", cze: "CZ", deu: "DE", dji: "DJ", dma: "DM", dnk: "DK",
  dom: "DO", dza: "DZ", ecu: "EC", egy: "EG", eri: "ER", esh: "EH", esp: "ES",
  est: "EE", eth: "ET", fin: "FI", fji: "FJ", flk: "FK", fra: "FR", fro: "FO",
  fsm: "FM", gab: "GA", gbr: "GB", geo: "GE", ggy: "GG", gha: "GH", gib: "GI",
  gin: "GN", glp: "GP", gmb: "GM", gnb: "GW", gnq: "GQ", grc: "GR", grd: "GD",
  grl: "GL", gtm: "GT", guf: "GF", gum: "GU", guy: "GY", hkg: "HK", hmd: "HM",
  hnd: "HN", hrv: "HR", hti: "HT", hun: "HU", idn: "ID", imn: "IM", ind: "IN",
  iot: "IO", irl: "IE", irn: "IR", irq: "IQ", isl: "IS", isr: "IL", ita: "IT",
  jam: "JM", jey: "JE", jor: "JO", jpn: "JP", kaz: "KZ", ken: "KE", kgz: "KG",
  khm: "KH", kir: "KI", kna: "KN", kor: "KR", kwt: "KW", lao: "LA", lbn: "LB",
  lbr: "LR", lby: "LY", lca: "LC", lie: "LI", lka: "LK", lso: "LS", ltu: "LT",
  lux: "LU", lva: "LV", mac: "MO", maf: "MF", mar: "MA", mco: "MC", mda: "MD",
  mdg: "MG", mdv: "MV", mex: "MX", mhl: "MH", mkd: "MK", mli: "ML", mlt: "MT",
  mmr: "MM", mne: "ME", mng: "MN", mnp: "MP", moz: "MZ", mrt: "MR", msr: "MS",
  mtq: "MQ", mus: "MU", mwi: "MW", mys: "MY", myt: "YT", nam: "NA", ncl: "NC",
  ner: "NE", nfk: "NF", nga: "NG", nic: "NI", niu: "NU", nld: "NL", nor: "NO",
  npl: "NP", nru: "NR", nzl: "NZ", omn: "OM", pak: "PK", pan: "PA", pcn: "PN",
  per: "PE", phl: "PH", plw: "PW", png: "PG", pol: "PL", pri: "PR", prk: "KP",
  prt: "PT", pry: "PY", pse: "PS", pyf: "PF", qat: "QA", reu: "RE", rou: "RO",
  rus: "RU", rwa: "RW", sau: "SA", sdn: "SD", sen: "SN", sgp: "SG", sgs: "GS",
  shn: "SH", slb: "SB", sle: "SL", slv: "SV", smr: "SM", som: "SO", spm: "PM",
  srb: "RS", ssd: "SS", stp: "ST", sur: "SR", svk: "SK", svn: "SI", swe: "SE",
  swz: "SZ", sxm: "SX", syc: "SC", syr: "SY", tca: "TC", tcd: "TD", tgo: "TG",
  tha: "TH", tjk: "TJ", tkl: "TK", tkm: "TM", tls: "TL", ton: "TO", tto: "TT",
  tun: "TN", tur: "TR", tuv: "TV", twn: "TW", tza: "TZ", uga: "UG", ukr: "UA",
  umi: "UM", ury: "UY", usa: "US", uzb: "UZ", vat: "VA", vct: "VC", ven: "VE",
  vgb: "VG", vir: "VI", vnm: "VN", vut: "VU", wlf: "WF", wsm: "WS", yem: "YE",
  zaf: "ZA", zmb: "ZM", zwe: "ZW",
};

let countryDisplayNames = null;
try {
  countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
} catch (e) {
  countryDisplayNames = null;
}

function iso2FromIso3(code) {
  return ISO3_TO_ISO2[String(code || "").trim().toLowerCase()] || "";
}

function countryNameFromIso3(code) {
  const key = String(code || "").trim().toLowerCase();
  if (!key) return "Unknown";
  const iso2 = iso2FromIso3(key);
  if (iso2 && countryDisplayNames) {
    try {
      const name = countryDisplayNames.of(iso2);
      if (name && name !== iso2) return name;
    } catch (e) {
      /* fall through to the raw code */
    }
  }
  return key.toUpperCase();
}

/**
 * Organic clicks by country. Search Console has no U.S. state dimension.
 */
async function fetchGscClicksByCountry(dateFrom, dateTo) {
  if (!hasGscOAuthCredentials()) {
    return {
      configured: false,
      setupHint: gscSetupHint(),
      oauthAuthUrl: "/api/staff/gsc-auth",
      grain: "country",
      locations: [],
    };
  }

  try {
    const data = await querySearchAnalytics(dateFrom, dateTo, {
      dimensions: ["country"],
      rowLimit: 250,
    });
    const locations = (data.rows || [])
      .map((row) => {
        const code = String((row.keys && row.keys[0]) || "").trim();
        return {
          name: countryNameFromIso3(code),
          code: code.toLowerCase(),
          codeAlpha2: iso2FromIso3(code),
          clicks: Number(row.clicks) || 0,
          impressions: Number(row.impressions) || 0,
        };
      })
      .filter((row) => row.clicks > 0 || row.impressions > 0)
      .sort((a, b) => b.clicks - a.clicks || a.name.localeCompare(b.name));

    return {
      configured: true,
      grain: "country",
      platform: "gsc",
      locations,
      firstIncompleteDate:
        (data.metadata && data.metadata.first_incomplete_date) || null,
    };
  } catch (e) {
    return {
      configured: true,
      grain: "country",
      platform: "gsc",
      locations: [],
      error: e.message || String(e),
    };
  }
}

async function fetchGscDaily(dateFrom, dateTo, opts) {
  const raw = opts && opts.page;
  const page = raw === "home" || raw === "city" ? raw : "site";
  if (!hasGscOAuthCredentials()) {
    return {
      configured: false,
      setupHint: gscSetupHint(),
      oauthAuthUrl: "/api/staff/gsc-auth",
      page,
      daily: [],
    };
  }

  try {
    const extra =
      page === "home" ? homePageFilterBody() : page === "city" ? cityPageFilterBody() : {};
    const data = await querySearchAnalytics(dateFrom, dateTo, {
      dimensions: ["date"],
      rowLimit: 25000,
      ...extra,
    });
    return {
      configured: true,
      page,
      firstIncompleteDate: (data.metadata && data.metadata.first_incomplete_date) || null,
      daily: mapDailyRows(data.rows, dateFrom, dateTo),
    };
  } catch (e) {
    return {
      configured: true,
      page,
      error: e.message || String(e),
      daily: [],
    };
  }
}

module.exports = {
  GSC_SCOPE,
  getSiteUrl,
  getOAuthRedirectUri,
  hasGscOAuthCredentials,
  gscSetupHint,
  fetchGscOrganicSearch,
  fetchGscClicksByCountry,
  fetchGscDaily,
};
