#!/usr/bin/env node
/**
 * Harvest Missouri Funeral Directors and Embalmers Association public directory
 * (name, phone, website), then fill city/street from each home's own website.
 * No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-missouri-mfdea.js
 */
const fs = require("fs");
const path = require("path");
const { napFromSite, mapPool, httpsUrl, formatPhone, fold } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "missouri-funeral-homes.json");
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
  return parts.length >= 2 && parts.length <= 4 && !/\b(llc|inc|co|ltd|home|services)\b/i.test(t);
}

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePage(html) {
  const rows = [];
  const re =
    /<tr>\s*<td[^>]*>[\s\S]*?>([^<]+)<\/a>[\s\S]*?<\/td>\s*<td[^>]*>\s*(?:<p>)?(?:<a href="([^"]+)"[^>]*>)?\s*([^<]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    const member = decode(m[1]);
    const href = httpsUrl(m[2] || "");
    const company = decode(m[3]);
    const rest = html.slice(m.index, m.index + 800);
    const phone = formatPhone((rest.match(/\(?\d{3}\)?\s*\d{3}-\d{4}/) || [])[0]);
    const name = looksLikeHome(member) ? member : looksLikeHome(company) ? company : "";
    if (!name) continue;
    if (looksLikePerson(member) && !looksLikeHome(company) && !looksLikeHome(member)) continue;
    rows.push({ name, website: href, phone, company });
  }
  return rows;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(p) {
  const url = p <= 1 ? BASE : `${BASE}?p=${p}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (res.status === 429) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    const html = await res.text();
    const last = Number((html.match(/directory\.php\?p=(\d+)'>Last/) || html.match(/p=(\d+)'>Last/) || [])[1] || 1);
    return { rows: parsePage(html), last: last || 1 };
  }
  throw new Error(`${url} 429 after retries`);
}

async function main() {
  const first = await fetchPage(1);
  const last = Math.min(first.last || 1, 120);
  console.log(`MFDEA directory pages 1–${last}`);
  const all = [...first.rows];
  for (let p = 2; p <= last; p++) {
    const page = await fetchPage(p);
    all.push(...page.rows);
    if (p % 10 === 0) process.stderr.write(`  page ${p} total ${all.length}\n`);
    await sleep(1200);
  }
  const seen = new Set();
  const unique = [];
  all.forEach((h) => {
    const k = `${fold(h.name)}|${h.phone}|${h.website}`;
    if (seen.has(k)) return;
    seen.add(k);
    unique.push(h);
  });
  const withWeb = unique.filter((h) => h.website);
  const noWeb = unique.filter((h) => !h.website);
  console.log(`resolving NAP for ${withWeb.length} sites (${noWeb.length} have no website)`);
  const resolved = await mapPool(withWeb, 6, async (h) => {
    const nap = await napFromSite(h.website, "MO");
    if (!nap.city) return null;
    return {
      name: h.name,
      street: nap.street,
      city: nap.city,
      region: "MO",
      phone: h.phone || nap.phone,
      website: nap.href || h.website,
    };
  });
  const kept = resolved.filter(Boolean).sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
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
  console.log(`wrote ${OUT} (${kept.length} homes, ${new Set(kept.map((h) => h.city)).size} cities)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
