#!/usr/bin/env node
/**
 * Harvest Kansas Board of Mortuary Arts funeral establishments
 * (name, street, city, county, phone, website). No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-ksbma.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "ksbma-funeral-homes.json");
const PAGES = [
  "https://www.ksbma.ks.gov/resources/license-and-other-listings/establishments-by-city-a-d",
  "https://www.ksbma.ks.gov/resources/license-and-other-listings/establishments-by-city-e-j",
  "https://www.ksbma.ks.gov/resources/license-and-other-listings/establishments-by-city-k-o",
  "https://www.ksbma.ks.gov/resources/license-and-other-listings/establishments-by-city-p-t",
  "https://www.ksbma.ks.gov/resources/license-and-other-listings/establishments-by-city-u-z",
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function strip(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, String.fromCharCode(34))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeSplash(href) {
  const m = String(href || "").match(/[?&]splash=([^&]+)/i);
  if (!m) return "";
  let url = decodeURIComponent(m[1]).trim();
  if (!url || /^javascript:/i.test(url)) return "";
  if (url.startsWith("//")) url = `https:${url}`;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url.replace(/^http:\/\//i, "https://");
}

function formatPhone(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    return `${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return "";
}

function skipHome(name, license, status) {
  if (!/active/i.test(status)) return true;
  if (/^CR2/i.test(license)) return true;
  const n = String(name || "").toLowerCase();
  if (/\bembalming\b/.test(n)) return true;
  if (/\bcrematory\b/.test(n) && !/\bfuneral|\bmortuary|\bchapel|\bmortician/.test(n)) return true;
  return false;
}

function parseBlocks(html) {
  const chunks = html.split(/<h2[^>]*>/i);
  const out = [];
  chunks.slice(1).forEach((raw) => {
    const close = raw.indexOf("</h2>");
    if (close < 0) return;
    const heading = strip(raw.slice(0, close));
    const body = raw.slice(close + 5).split(/<h2[^>]*>/i)[0];
    const hm = heading.match(/^(.+?)\s*[–—-]\s*(.+?)\s*\(([^,()]+),\s*([^)]+)\)\s*$/);
    if (!hm) return;
    const city = hm[1].replace(/\s+/g, " ").trim();
    const name = hm[2].replace(/\s+/g, " ").trim();
    const license = hm[3].replace(/\s+/g, "").trim();
    const status = hm[4].trim();
    if (skipHome(name, license, status)) return;

    const splash = body.match(/href="([^"]+splash=[^"]+)"/i);
    const website = splash ? decodeSplash(splash[1]) : "";
    const phone = formatPhone((body.match(/Phone:<\/strong>\s*([^<]+)/i) || [])[1]);
    const county = strip((body.match(/\(([^)]+County)\)/i) || [])[1]).replace(/\s+County$/i, " County");

    let street = "";
    const afterName = body.match(/<\/a><\/strong>\s*<br\s*\/?>\s*([^<]+)/i);
    if (afterName) {
      street = strip(afterName[1]).replace(/^Address:\s*/i, "");
    } else {
      const addr = body.match(/Address:<\/strong>\s*([^<]+)/i) || body.match(/<br\s*\/?>\s*(\d[^<]+)/i);
      if (addr) street = strip(addr[1]);
    }
    street = street
      .replace(/\bPO Box\b[\s\S]*$/i, "")
      .replace(/,\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();

    out.push({
      name,
      street,
      city,
      region: "KS",
      county,
      phone,
      website,
      license,
      status: "Active",
    });
  });
  return out;
}

function key(h) {
  return `${h.name}|${h.city}|${h.street}`.toLowerCase();
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

async function main() {
  const seen = new Set();
  const homes = [];
  for (const url of PAGES) {
    const html = await fetchPage(url);
    const batch = parseBlocks(html);
    batch.forEach((h) => {
      const k = key(h);
      if (seen.has(k)) return;
      seen.add(k);
      homes.push(h);
    });
    process.stderr.write(`${url.split("/").pop()}: ${batch.length} (total ${homes.length})\n`);
  }
  homes.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: "https://www.ksbma.ks.gov/resources/license-and-other-listings",
        sourceName: "Kansas Board of Mortuary Arts funeral establishments by city",
        harvested: new Date().toISOString().slice(0, 10),
        homes,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`wrote ${OUT} (${homes.length} homes, ${new Set(homes.map((h) => h.city)).size} cities)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
