#!/usr/bin/env node
/**
 * Harvest Arizona ADHS licensed FS Facility rows (name, street, city).
 * Official licensing lookup. No invented GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-azdhs.js
 */
const fs = require("fs");
const path = require("path");
const { plausibleCity } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "arizona-funeral-homes.json");
const BASE = "https://hsapps.azdhs.gov/ls/sod/Provider.aspx";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hidden(html, id) {
  const re = new RegExp(`(?:id|name)="${id}"[^>]*value="([^"]*)"`, "i");
  const re2 = new RegExp(`value="([^"]*)"[^>]*(?:id|name)="${id}"`, "i");
  const m = html.match(re) || html.match(re2);
  return m ? m[1] : "";
}

function pageCount(html) {
  const sel = html.match(/name="ctl00\$ContentPlaceHolder1\$ddPage"[\s\S]*?<\/select>/i);
  const opts = [...String(sel ? sel[0] : "").matchAll(/<option value="(\d+)"/gi)].map((m) => Number(m[1]));
  return opts.length ? Math.max(...opts) : 1;
}

function cookieHeader(res, prev) {
  const jar = new Map();
  String(prev || "")
    .split(/;\s*/)
    .filter(Boolean)
    .forEach((p) => {
      const [k, v] = p.split("=");
      if (k && v) jar.set(k, v);
    });
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  raw.concat(res.headers.get("set-cookie") ? [res.headers.get("set-cookie")] : []).forEach((c) => {
    const part = String(c || "").split(";")[0];
    const eq = part.indexOf("=");
    if (eq > 0) jar.set(part.slice(0, eq), part.slice(eq + 1));
  });
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function parseRows(html) {
  const homes = [];
  const re =
    /<td align="left">([^<]+)<\/td><td align="left">([^<]+)<\/td><td align="left"[^>]*>([^<]+)<\/td><td align="left">FS Facility<\/td>/gi;
  let m;
  while ((m = re.exec(html))) {
    const name = decode(m[1]);
    const street = decode(m[2]);
    const loc = decode(m[3]);
    const cityM = loc.match(/^(.+?)\s+AZ\s+\d{5}$/i);
    const city = cityM ? cityM[1].trim() : "";
    if (!name || !plausibleCity(city)) continue;
    if (/crematory only|^cremation societ/i.test(name) && !/funeral|mortuary|chapel/i.test(name)) {
      /* keep FS Facility cremation providers that ADHS lists as funeral service facilities */
    }
    homes.push({
      name,
      street,
      city,
      region: "AZ",
      phone: "",
      website: "",
    });
  }
  return homes;
}

async function postPage(url, html, cookie, page) {
  const body = new URLSearchParams({
    __EVENTTARGET: "ctl00$ContentPlaceHolder1$ddPage",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: hidden(html, "__VIEWSTATE"),
    __VIEWSTATEGENERATOR: hidden(html, "__VIEWSTATEGENERATOR"),
    __VIEWSTATEENCRYPTED: hidden(html, "__VIEWSTATEENCRYPTED"),
    __EVENTVALIDATION: hidden(html, "__EVENTVALIDATION"),
    "ctl00$ContentPlaceHolder1$ddPage": String(page),
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "user-agent": UA,
      cookie,
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://hsapps.azdhs.gov",
      referer: url,
    },
    body,
  });
  return { html: await res.text(), cookie: cookieHeader(res, cookie) };
}

async function harvestQuery(query) {
  const url = `${BASE}?ProviderName=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`ADHS ${query} ${res.status}`);
  let cookie = cookieHeader(res, "");
  let html = await res.text();
  const homes = parseRows(html);
  const last = pageCount(html);
  for (let p = 2; p <= last; p++) {
    const next = await postPage(url, html, cookie, p);
    html = next.html;
    cookie = next.cookie;
    homes.push(...parseRows(html));
  }
  return homes;
}

async function main() {
  const queries = ["funeral", "mortuary", "chapel", "cremation", "memorial"];
  const homes = [];
  for (const q of queries) {
    const rows = await harvestQuery(q);
    console.log(`  ${q}: ${rows.length} FS Facility rows`);
    homes.push(...rows);
  }
  const seen = new Set();
  const unique = homes.filter((h) => {
    const k = `${h.name.toLowerCase()}|${h.street.toLowerCase()}|${h.city.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  unique.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: BASE,
        sourceName: "Arizona Department of Health Services licensed FS Facility lookup",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "AZ",
        homes: unique,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`wrote ${OUT} (${unique.length} homes, ${new Set(unique.map((h) => h.city)).size} cities)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
