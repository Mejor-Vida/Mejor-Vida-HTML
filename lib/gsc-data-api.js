/**
 * Google Search Console Search Analytics API (organic search performance).
 * OAuth: GSC_REFRESH_TOKEN + same client as GA4 (GA4_OAUTH_CLIENT_ID/SECRET or GMAIL_*).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
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
/** State hubs under /estados/{state}.html — not city guides, not /en/states/. */
const STATE_PAGE_REGEX = "^https://(www\\.)?mejorvidainsurance\\.com/estados/[^/?#]+\\.html$";
/** City teaching pages under /estados/{state}/{city}.html — not state hubs. */
const CITY_PAGE_REGEX = "^https://(www\\.)?mejorvidainsurance\\.com/estados/[^/]+/[^/?#]+\\.html$";
/** Spanish blog hub + articles under /blog — not /en/blog/. */
const BLOG_PAGE_REGEX =
  "^https://(www\\.)?mejorvidainsurance\\.com/blog(\\.html|/[^/?#]+\\.html)$";
/** The four Spanish teaching pages that embed a YouTube lesson. English copies are separate. */
const VIDEO_PAGE_REGEX =
  "^https://(www\\.)?mejorvidainsurance\\.com/(cuanto-cuesta-un-funeral|funerales-prepagados|como-pagar-un-funeral|seguro-vida-familiares)\\.html$";

/**
 * Named page groups for Funnel Analytics dropdowns.
 * Add a group here, then add i18n keys funnel_gsc_group_{id} / _hint / _goal / _track_note.
 */
const GSC_PAGE_GROUPS = {
  home: { regex: HOME_PAGE_REGEX },
  state: { regex: STATE_PAGE_REGEX },
  city: { regex: CITY_PAGE_REGEX },
  blogs: { regex: BLOG_PAGE_REGEX },
  video: { regex: VIDEO_PAGE_REGEX },
};

function isGscPageGroup(id) {
  return Object.prototype.hasOwnProperty.call(GSC_PAGE_GROUPS, String(id || ""));
}

function pageFilterBody(kind) {
  const group = GSC_PAGE_GROUPS[kind] || GSC_PAGE_GROUPS.home;
  return {
    dimensionFilterGroups: [
      {
        filters: [
          {
            dimension: "page",
            operator: "includingRegex",
            expression: group.regex,
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
    const groupIds = Object.keys(GSC_PAGE_GROUPS);
    const groupQueries = groupIds.map((id) =>
      querySearchAnalytics(dateFrom, dateTo, { rowLimit: 1, ...pageFilterBody(id) })
    );
    const [
      totalsData,
      queryData,
      pageData,
      dailyMetaData,
      homeQueryData,
      ...groupTotalsList
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
        querySearchAnalytics(dateFrom, dateTo, {
          dimensions: ["query"],
          rowLimit: 10,
          ...homeFilter,
        }),
        ...groupQueries,
      ]);

    const totals = aggregateRows(totalsData.rows);
    const groups = {};
    groupIds.forEach((id, i) => {
      groups[id] = aggregateRows((groupTotalsList[i] && groupTotalsList[i].rows) || []);
    });
    const home = groups.home || { clicks: 0, impressions: 0, ctr: 0, position: null };
    const cities = groups.city || { clicks: 0, impressions: 0, ctr: 0, position: null };
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
      groups,
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
      groups: null,
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

function isEnglishPath(pathName) {
  const p = String(pathName || "");
  return p === "/en" || p === "/en/" || p.indexOf("/en/") === 0;
}

function normalizePagePath(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";
  try {
    if (/^https?:\/\//i.test(s)) s = new URL(s).pathname || "/";
  } catch (e) {
    /* keep raw */
  }
  if (s.charAt(0) !== "/") s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s || "/";
}

function pathDepth(pathName) {
  return String(pathName || "")
    .split("/")
    .filter(Boolean).length;
}

function isThinLocalPath(pathName) {
  const p = String(pathName || "");
  return p.indexOf("/funerarias-cementerios/") === 0;
}

function isCityGuidePath(pathName) {
  return /^\/estados\/[^/]+\/[^/]+/.test(String(pathName || ""));
}

function isWeeklyUpdatePath(pathName) {
  return /\/blog\/weekly-insurance-update-/.test(String(pathName || ""));
}

function unseenKindRank(pathName) {
  if (isCityGuidePath(pathName)) return 2;
  if (isWeeklyUpdatePath(pathName)) return 1;
  return 0;
}

const PAGE_CLASS_MIN_AGE = {
  weekly: null,
  service: 75,
  teaching: 52,
  other: 30,
};

function classifyPagePath(pathName) {
  const p = String(pathName || "");
  if (isWeeklyUpdatePath(p)) return "weekly";
  if (/^\/estados\//.test(p) || /^\/en\/states\//.test(p) || p === "/licencias.html" || p === "/en/licenses.html") {
    return "service";
  }
  if (p === "/blog.html" || /^\/blog\//.test(p) || /^\/carriers\//.test(p) || p === "/aseguradoras.html") {
    return "teaching";
  }
  if (
    /^\/(guia-|seguro-|costo-|cuanto-|como-|aceptacion|funerales|planificacion|limite-|buscar-poliza|tipos-|funerarias)/.test(p)
  ) {
    return "teaching";
  }
  return "other";
}

function dateFromPath(pathName) {
  const m = String(pathName || "").match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

function repoRelFromPath(pathName) {
  const p = String(pathName || "");
  if (p === "/" || p === "/index.html") return "index.html";
  return p.replace(/^\//, "");
}

let gitAddedDates = null;
function loadGitAddedDates() {
  if (gitAddedDates) return gitAddedDates;
  gitAddedDates = Object.create(null);
  const root = path.join(__dirname, "..");
  try {
    const out = execFileSync(
      "git",
      ["log", "--diff-filter=A", "--pretty=format:%cs", "--name-only", "--", "estados", "blog", "carriers", "*.html"],
      { cwd: root, encoding: "utf8", maxBuffer: 12 * 1024 * 1024, timeout: 20000 }
    );
    let current = "";
    String(out || "")
      .split("\n")
      .forEach(function (line) {
        const s = line.trim().replace(/\\/g, "/");
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          current = s;
          return;
        }
        if (!s || !current || !s.endsWith(".html")) return;
        const key = s.charAt(0) === "/" ? s : "/" + s;
        if (!gitAddedDates[key] || current < gitAddedDates[key]) gitAddedDates[key] = current;
      });
  } catch (e) {
    /* Vercel and other hosts often have no .git */
  }
  return gitAddedDates;
}

function publishedTimeFromHtml(pathName) {
  const rel = repoRelFromPath(pathName);
  const abs = path.join(__dirname, "..", rel);
  try {
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return "";
    const head = fs.readFileSync(abs, "utf8").slice(0, 12000);
    const m =
      head.match(/property=["']article:published_time["']\s+content=["']([^"']+)/i) ||
      head.match(/content=["']([^"']+)["']\s+property=["']article:published_time["']/i);
    if (!m) return "";
    const day = String(m[1]).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "";
  } catch (e) {
    return "";
  }
}

function publishedDateFor(pathName, gitDates) {
  const fromName = dateFromPath(pathName);
  if (fromName) return fromName;
  const fromMeta = publishedTimeFromHtml(pathName);
  if (fromMeta) return fromMeta;
  const key = normalizePagePath(pathName);
  return (gitDates && (gitDates[key] || gitDates[key.replace(/^\//, "")])) || "";
}

function ageDaysOn(published, asOf) {
  const a = Date.parse(String(published || "") + "T12:00:00Z");
  const b = Date.parse(String(asOf || "") + "T12:00:00Z");
  if (!isFinite(a) || !isFinite(b)) return null;
  return Math.max(0, Math.round((b - a) / 86400000));
}

function annotatePageRow(row, asOf, gitDates) {
  const pageClass = classifyPagePath(row.path);
  const published = publishedDateFor(row.path, gitDates) || null;
  const age = published ? ageDaysOn(published, asOf) : null;
  const minAgeDays = PAGE_CLASS_MIN_AGE[pageClass];
  const excluded = pageClass === "weekly";
  const tooNew = !excluded && age != null && minAgeDays != null && age < minAgeDays;
  return Object.assign({}, row, {
    pageClass,
    published,
    ageDays: age,
    minAgeDays: excluded ? null : minAgeDays,
    tooNew,
    excluded,
  });
}

function countDaysInclusive(dateFrom, dateTo) {
  const a = Date.parse(String(dateFrom || "") + "T12:00:00Z");
  const b = Date.parse(String(dateTo || "") + "T12:00:00Z");
  if (!isFinite(a) || !isFinite(b)) return 1;
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

function parseSitemapXml(xml) {
  const entries = [];
  const blocks = String(xml || "").split(/<\/url>/i);
  for (let i = 0; i < blocks.length; i++) {
    const locMatch = blocks[i].match(/<loc>\s*([^<]+)\s*<\/loc>/i);
    if (!locMatch) continue;
    const page = locMatch[1].trim();
    const pathName = normalizePagePath(page);
    if (!pathName || isEnglishPath(pathName)) continue;
    const priMatch = blocks[i].match(/<priority>\s*([0-9.]+)\s*<\/priority>/i);
    entries.push({
      page: page.replace(/&amp;/g, "&"),
      path: pathName,
      priority: priMatch ? Number(priMatch[1]) || 0 : 0,
    });
  }
  return entries;
}

function loadSitemapEntries() {
  const abs = path.join(__dirname, "..", "sitemap.xml");
  try {
    if (fs.existsSync(abs)) return parseSitemapXml(fs.readFileSync(abs, "utf8"));
  } catch (e) {
    /* fall through */
  }
  return [];
}

async function loadSitemapEntriesAsync() {
  const local = loadSitemapEntries();
  if (local.length) return local;
  try {
    const r = await fetch("https://www.mejorvidainsurance.com/sitemap.xml");
    if (r.ok) return parseSitemapXml(await r.text());
  } catch (e) {
    /* ignore */
  }
  return [];
}

function pageFilterEquals(pageUrl) {
  return {
    dimensionFilterGroups: [
      {
        filters: [
          {
            dimension: "page",
            operator: "equals",
            expression: pageUrl,
          },
        ],
      },
    ],
  };
}

function isSitePageUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    return host === "mejorvidainsurance.com";
  } catch (e) {
    return false;
  }
}

/**
 * Live page lists for Funnel Analytics: strongest pages already under position 20,
 * and the weakest pages (no/low impressions, or ranked at 40+).
 */
async function fetchGscPageLists(dateFrom, dateTo) {
  if (!hasGscOAuthCredentials()) {
    return {
      configured: false,
      setupHint: gscSetupHint(),
      oauthAuthUrl: "/api/staff/gsc-auth",
      topRated: [],
      worst: [],
      tooNew: [],
    };
  }

  try {
    const data = await querySearchAnalytics(dateFrom, dateTo, {
      dimensions: ["page"],
      rowLimit: 5000,
    });
    const pages = mapPageRows(data.rows, 5000)
      .map(function (row) {
        return Object.assign({}, row, { path: normalizePagePath(row.path || row.page) });
      })
      .filter(function (row) {
        return row.impressions > 0 && !isEnglishPath(row.path);
      });

    const topRated = pages
      .filter(function (row) {
        return row.position > 0 && row.position < 20;
      })
      .sort(function (a, b) {
        return b.impressions - a.impressions || a.position - b.position;
      })
      .slice(0, 20);

    const byPath = new Map();
    pages.forEach(function (row) {
      byPath.set(row.path, row);
    });

    const days = countDaysInclusive(dateFrom, dateTo);
    const lowImpressionsMax = Math.max(5, Math.min(15, Math.ceil(days / 2)));
    const sitemap = await loadSitemapEntriesAsync();
    const unseen = [];
    const seenPaths = new Set();
    sitemap.forEach(function (entry) {
      if (seenPaths.has(entry.path)) return;
      seenPaths.add(entry.path);
      if (isThinLocalPath(entry.path)) return;
      if (byPath.has(entry.path)) return;
      unseen.push({
        page: entry.page,
        path: entry.path,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: null,
        unseen: true,
        priority: entry.priority,
      });
    });
    unseen.sort(function (a, b) {
      const kind = unseenKindRank(a.path) - unseenKindRank(b.path);
      if (kind) return kind;
      const pri = (b.priority || 0) - (a.priority || 0);
      if (pri) return pri;
      const depth = pathDepth(a.path) - pathDepth(b.path);
      if (depth) return depth;
      return String(a.path).localeCompare(String(b.path));
    });

    const buried = pages
      .filter(function (row) {
        if (isThinLocalPath(row.path)) return false;
        return row.position >= 40 && row.impressions <= lowImpressionsMax;
      })
      .sort(function (a, b) {
        if (a.impressions !== b.impressions) return a.impressions - b.impressions;
        return b.position - a.position;
      });

    const gitDates = loadGitAddedDates();
    const asOf = dateTo;
    const unseenAnn = unseen.map(function (row) {
      return annotatePageRow(row, asOf, gitDates);
    });
    const buriedAnn = buried.map(function (row) {
      return annotatePageRow(row, asOf, gitDates);
    });
    const unseenReady = unseenAnn.filter(function (row) {
      return !row.excluded && !row.tooNew;
    });
    const buriedReady = buriedAnn.filter(function (row) {
      return !row.excluded && !row.tooNew;
    });
    const tooNewSeen = new Set();
    const tooNew = unseenAnn
      .concat(buriedAnn)
      .filter(function (row) {
        if (!row.tooNew || tooNewSeen.has(row.path)) return false;
        tooNewSeen.add(row.path);
        return true;
      })
      .sort(function (a, b) {
        return (a.ageDays || 0) - (b.ageDays || 0) || String(a.path).localeCompare(String(b.path));
      })
      .slice(0, 15);

    const worst = [];
    const used = new Set();
    function take(list, limit) {
      for (let i = 0; i < list.length && worst.length < 20; i++) {
        const row = list[i];
        if (used.has(row.path)) continue;
        if (isCityGuidePath(row.path)) {
          const cityCount = worst.filter(function (item) {
            return isCityGuidePath(item.path);
          }).length;
          if (cityCount >= 5) continue;
        }
        if (limit != null && worst.filter(function (item) {
          return item.unseen === row.unseen;
        }).length >= limit) continue;
        used.add(row.path);
        worst.push(row);
      }
    }
    take(unseenReady, 10);
    take(buriedReady, 10);
    take(unseenReady, null);
    take(buriedReady, null);

    return {
      configured: true,
      dateFrom,
      dateTo,
      topRated,
      worst,
      tooNew,
      firstIncompleteDate:
        (data.metadata && data.metadata.first_incomplete_date) || null,
    };
  } catch (e) {
    return {
      configured: true,
      topRated: [],
      worst: [],
      tooNew: [],
      error: e.message || String(e),
    };
  }
}

async function fetchGscPageDetail(dateFrom, dateTo, pageUrl) {
  if (!isSitePageUrl(pageUrl)) {
    return { error: "Invalid page URL" };
  }
  if (!hasGscOAuthCredentials()) {
    return {
      configured: false,
      setupHint: gscSetupHint(),
      oauthAuthUrl: "/api/staff/gsc-auth",
      queries: [],
      daily: [],
    };
  }

  try {
    const filter = pageFilterEquals(pageUrl);
    const [queryData, dailyData] = await Promise.all([
      querySearchAnalytics(dateFrom, dateTo, {
        dimensions: ["query"],
        rowLimit: 15,
        ...filter,
      }),
      querySearchAnalytics(dateFrom, dateTo, {
        dimensions: ["date"],
        rowLimit: 25000,
        ...filter,
      }),
    ]);
    return {
      configured: true,
      page: pageUrl,
      queries: mapQueryRows(queryData.rows, 15),
      daily: mapDailyRows(dailyData.rows, dateFrom, dateTo),
    };
  } catch (e) {
    return {
      configured: true,
      page: pageUrl,
      queries: [],
      daily: [],
      error: e.message || String(e),
    };
  }
}

async function fetchGscDaily(dateFrom, dateTo, opts) {
  const raw = opts && opts.page;
  const page = isGscPageGroup(raw) ? raw : "site";
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
    const extra = isGscPageGroup(page) ? pageFilterBody(page) : {};
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
  GSC_PAGE_GROUPS,
  isGscPageGroup,
  fetchGscOrganicSearch,
  fetchGscClicksByCountry,
  fetchGscDaily,
  fetchGscPageLists,
  fetchGscPageDetail,
};
