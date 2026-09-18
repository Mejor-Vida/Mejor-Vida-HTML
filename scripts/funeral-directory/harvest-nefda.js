#!/usr/bin/env node
/**
 * Harvest Nebraska Funeral Directors Association member directory
 * (published name, street, city, phone, website). No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-nefda.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "nefda-funeral-homes.json");
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").concat(["%23%21"]);

function strip(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function attr(block, name) {
  const re = new RegExp(`itemprop="${name}"[^>]*>([^<]*)`, "i");
  const m = block.match(re);
  return m ? strip(m[1]) : "";
}

function href(block, cls) {
  const re = new RegExp(`class="[^"]*${cls}[^"]*"[\\s\\S]{0,400}?<a[^>]+href="([^"]+)"`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function parseCards(html) {
  const cards = html.split('class="card gz-directory-card');
  const out = [];
  cards.slice(1).forEach((raw) => {
    const block = 'class="card gz-directory-card' + raw.slice(0, 4000);
    const name = attr(block, "name") || strip((block.match(/gz-card-title[\s\S]{0,400}?<a[^>]*>([^<]+)/i) || [])[1]);
    if (!name) return;
    const street = attr(block, "streetAddress");
    const city = attr(block, "addressLocality");
    const region = attr(block, "addressRegion").replace(/\s+/g, " ").trim();
    const zip = attr(block, "postalCode");
    const phone = attr(block, "telephone");
    let website = "";
    const web = block.match(/gz-card-website[\s\S]{0,500}?<a[^>]+href="([^"]+)"/i);
    if (web && !/members\.nefda\.org/i.test(web[1])) website = web[1];
    const details = (block.match(/funeralhomes\/Details\/([^"'\s]+)/i) || [])[1] || "";
    out.push({
      name,
      street,
      city,
      region: region || "NE",
      zip,
      phone,
      website,
      detailsId: details,
    });
  });
  return out;
}

async function fetchLetter(term) {
  const url = `https://members.nefda.org/funeralhomes/FindStartsWith?term=${term}`;
  const res = await fetch(url, {
    headers: { "user-agent": "MejorVidaInsuranceDirectory/1.0 (+https://www.mejorvidainsurance.com)" },
  });
  if (!res.ok) throw new Error(`${term} ${res.status}`);
  return parseCards(await res.text());
}

function key(h) {
  return `${h.name}|${h.city}|${h.street}`.toLowerCase();
}

async function main() {
  const seen = new Set();
  const homes = [];
  for (const letter of LETTERS) {
    const batch = await fetchLetter(letter);
    batch.forEach((h) => {
      const k = key(h);
      if (seen.has(k)) return;
      seen.add(k);
      homes.push(h);
    });
    process.stderr.write(`${decodeURIComponent(letter)}: ${batch.length} (total ${homes.length})\n`);
  }
  homes.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: "https://members.nefda.org/funeralhomes/",
        sourceName: "Nebraska Funeral Directors Association member directory",
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
