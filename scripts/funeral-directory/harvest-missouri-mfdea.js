#!/usr/bin/env node
/**
 * Harvest Missouri Funeral Directors and Embalmers Association public directory
 * (name, phone, website), then fill city/street from each home's own website.
 * No GPL dollars. Resumes from data/.mfdea-directory-pages.json after 429s.
 *
 * Usage: node scripts/funeral-directory/harvest-missouri-mfdea.js
 */
const fs = require("fs");
const path = require("path");
const { napFromSite, mapPool, httpsUrl, formatPhone, fold, plausibleCity } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "missouri-funeral-homes.json");
const CHECKPOINT = path.join(ROOT, "data", ".mfdea-directory-pages.json");
const BASE = "https://mofuneral.org/directory.php";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function looksLikeHome(name) {
  return /\b(funeral|mortuary|chapel|cremation|crematory|memorial)\b/i.test(name);
}

function looksLikePerson(name) {
  const t = String(name || "").trim();
  if (looksLikeHome(t)) return false;
  const parts = t.split(/\s+/);
  return parts.length >= 2 && parts.length <= 4 && !/\b(llc|inc|co|ltd|home|services|group)\b/i.test(t);
}

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(s) {
  return decode(String(s || "").replace(/<[^>]+>/g, " "));
}

function cityFromName(name) {
  const m = String(name || "").match(/\s[-–—]\s*([A-Z][A-Za-z .']+)$/);
  if (!m) return "";
  const city = m[1].replace(/\s+(LLC|Inc\.?|Co\.?)$/i, "").trim();
  return salvageCity(city);
}

function salvageCity(raw) {
  let c = String(raw || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!c) return "";
  const aliases = [
    [/kansas city$/i, "Kansas City"],
    [/jefferson city$/i, "Jefferson City"],
    [/west plains$/i, "West Plains"],
    [/st\.?\s*louis$/i, "St. Louis"],
    [/saint louis$/i, "St. Louis"],
    [/st\.?\s*peters$/i, "Saint Peters"],
    [/saint charles$/i, "Saint Charles"],
    [/st\.?\s*charles$/i, "Saint Charles"],
    [/ballwin$/i, "Ballwin"],
    [/fenton$/i, "Fenton"],
    [/ozark$/i, "Ozark"],
    [/cole camp$/i, "Cole Camp"],
    [/rock port$/i, "Rock Port"],
    [/gower$/i, "Gower"],
    [/platte city$/i, "Platte City"],
    [/lee'?s?\s*summit$/i, "Lee's Summit"],
  ];
  for (const [re, city] of aliases) {
    if (re.test(c)) return city;
  }
  if (/^summit$/i.test(c)) return "Lee's Summit";
  if (/^moline$/i.test(c)) return "";
  if (/\bfuneral\b/i.test(c) && !/^(garden city|scott city)$/i.test(c)) return "";
  if (/\b(rd\.?|dr\.?|blvd|ave\.?)\b/i.test(c)) return "";
  if (c === c.toUpperCase() && c.length > 2) {
    c = c.toLowerCase().replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
  }
  return plausibleCity(c) ? c : "";
}

function looksLikeStaff(name) {
  return /\bfuneral director\b|\bembalmer\b|\bin charge\b/i.test(name);
}

function parsePage(html) {
  const rows = [];
  const blocks = html.split(/<tr\b/i).slice(1);
  blocks.forEach((block) => {
    if (/group-desc/i.test(block)) return;
    if (/<th\b/i.test(block)) return;
    const cells = [...block.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1]);
    if (cells.length < 3) return;
    const member = stripTags(cells[0]);
    const company = stripTags(cells[1]);
    const href = httpsUrl((cells[1].match(/href="(https?:\/\/[^"]+)"/i) || [])[1] || "");
    const phone = formatPhone(stripTags(cells[2]));
    const name = looksLikeHome(member) ? member : looksLikeHome(company) ? company : "";
    if (!name) return;
    if (looksLikeStaff(name) || looksLikeStaff(member)) return;
    if (looksLikePerson(member) && !looksLikeHome(company) && !looksLikeHome(member)) return;
    rows.push({
      name,
      website: href,
      phone,
      company,
      cityHint: cityFromName(member) || cityFromName(company) || cityFromName(name),
    });
  });
  return rows;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT)) return { lastPage: 0, lastKnown: 97, rows: [] };
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT, "utf8"));
  } catch {
    return { lastPage: 0, lastKnown: 97, rows: [] };
  }
}

function saveCheckpoint(cp) {
  fs.writeFileSync(CHECKPOINT, JSON.stringify(cp, null, 2) + "\n");
}

function cookieHeader(res, prev) {
  const jar = new Map();
  String(prev || "")
    .split(/;\s*/)
    .filter(Boolean)
    .forEach((p) => {
      const eq = p.indexOf("=");
      if (eq > 0) jar.set(p.slice(0, eq), p.slice(eq + 1));
    });
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  raw.concat(res.headers.get("set-cookie") ? [res.headers.get("set-cookie")] : []).forEach((c) => {
    const part = String(c || "").split(";")[0];
    const eq = part.indexOf("=");
    if (eq > 0) jar.set(part.slice(0, eq), part.slice(eq + 1));
  });
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function fetchPage(p, cookie) {
  const url = p <= 1 ? BASE : `${BASE}?p=${p}`;
  let jar = cookie || "";
  for (let attempt = 0; attempt < 8; attempt++) {
    const res = await fetch(url, {
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml",
        referer: BASE,
        ...(jar ? { cookie: jar } : {}),
      },
    });
    jar = cookieHeader(res, jar);
    if (res.status === 429) {
      const wait = 8000 * (attempt + 1);
      process.stderr.write(`  429 on page ${p}, wait ${wait}ms\n`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    const html = await res.text();
    const allPs = [...html.matchAll(/directory\.php\?p=(\d+)/g)].map((m) => Number(m[1]));
    const lastNamed = Number(
      (html.match(/directory\.php\?p=(\d+)'>Last/) || html.match(/p=(\d+)'>Last/) || [])[1] || 0
    );
    const maxP = allPs.length ? Math.max(...allPs) : 1;
    return { rows: parsePage(html), last: lastNamed || maxP || 1, cookie: jar };
  }
  throw new Error(`${url} 429 after retries`);
}

function uniqueHomes(all) {
  const seen = new Set();
  const unique = [];
  all.forEach((h) => {
    const k = `${fold(h.name)}|${h.phone}|${h.website}`;
    if (seen.has(k)) return;
    seen.add(k);
    unique.push(h);
  });
  return unique;
}

async function main() {
  const cp = loadCheckpoint();
  let cookie = "";
  let last = cp.lastKnown || 97;
  const all = [...(cp.rows || [])];
  const start = (cp.lastPage || 0) + 1;
  if (start > 1) console.log(`resuming MFDEA at page ${start} (${all.length} rows so far)`);
  for (let p = start; p <= last; p++) {
    const page = await fetchPage(p, cookie);
    cookie = page.cookie;
    last = Math.min(page.last || last, 120);
    all.push(...page.rows);
    saveCheckpoint({ lastPage: p, lastKnown: last, rows: all });
    if (p === 1 || p % 5 === 0 || p === last) {
      process.stderr.write(`  page ${p}/${last} total ${all.length}\n`);
    }
    await sleep(p === 1 ? 1500 : 4500);
  }

  const unique = uniqueHomes(all);
  const withWeb = unique.filter((h) => h.website);
  const noWeb = unique.filter((h) => !h.website);
  console.log(`resolving NAP for ${withWeb.length} sites (${noWeb.length} have no website)`);
  const resolved = await mapPool(withWeb, 3, async (h) => {
    const nap = await napFromSite(h.website, "MO");
    const city = salvageCity(nap.city || h.cityHint || "");
    if (!city || !plausibleCity(city)) return null;
    return {
      name: h.name,
      street: nap.street || "",
      city,
      region: "MO",
      phone: h.phone || nap.phone,
      website: nap.href || h.website,
    };
  });
  const fromHint = noWeb
    .filter((h) => salvageCity(h.cityHint) && !looksLikeStaff(h.name))
    .map((h) => ({
      name: h.name,
      street: "",
      city: salvageCity(h.cityHint),
      region: "MO",
      phone: h.phone || "",
      website: "",
    }));
  const kept = [...resolved.filter(Boolean), ...fromHint]
    .filter((h, i, arr) => {
      const k = `${fold(h.name)}|${fold(h.city)}|${h.phone}`;
      return arr.findIndex((x) => `${fold(x.name)}|${fold(x.city)}|${x.phone}` === k) === i;
    })
    .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: BASE,
        sourceName: "Missouri Funeral Directors and Embalmers Association directory + first-party websites",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "MO",
        homes: kept,
      },
      null,
      2
    ) + "\n"
  );
  if (fs.existsSync(CHECKPOINT)) fs.unlinkSync(CHECKPOINT);
  console.log(`wrote ${OUT} (${kept.length} homes, ${new Set(kept.map((h) => h.city)).size} cities)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
