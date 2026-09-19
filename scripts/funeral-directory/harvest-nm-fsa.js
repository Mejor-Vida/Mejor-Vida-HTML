#!/usr/bin/env node
/**
 * Harvest New Mexico Funeral Service Association public firm logos/links,
 * then fill city/street/phone from each home's own website. No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-nm-fsa.js
 */
const fs = require("fs");
const path = require("path");
const { napFromSite, mapPool, httpsUrl } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "new-mexico-funeral-homes.json");
const SRC = "https://www.nmfuneralserviceassociation.com/firms-and-individuals";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function nameFromHost(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").replace(/\.(com|org|net|us)$/i, "");
    return host
      .split(/[.-]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

async function main() {
  const res = await fetch(SRC, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`NMFSA ${res.status}`);
  const html = await res.text();
  const seeds = [];
  const re = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>[\s\S]{0,500}?<img\b/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = httpsUrl(m[1]);
    if (!href) continue;
    if (/nmfuneralserviceassociation|facebook|instagram|duda|nfda\.org|cdn-website|google/i.test(href)) continue;
    seeds.push({ website: href, name: nameFromHost(href) });
  }
  const seenHost = new Set();
  const unique = seeds.filter((s) => {
    let host = "";
    try {
      host = new URL(s.website).hostname.replace(/^www\./, "");
    } catch {
      return false;
    }
    if (seenHost.has(host)) return false;
    seenHost.add(host);
    return true;
  });
  console.log(`resolving NAP for ${unique.length} NMFSA firm sites`);
  const homes = await mapPool(unique, 6, async (s) => {
    const nap = await napFromSite(s.website, "NM");
    if (!nap.city) {
      process.stderr.write(`  skip no city: ${s.name}\n`);
      return null;
    }
    const name = decode(nap.name || s.name)
      .replace(/\s*[|\-–—].*$/, "")
      .trim();
    return {
      name: name || s.name,
      street: nap.street,
      city: nap.city,
      region: "NM",
      phone: nap.phone,
      website: nap.href || s.website,
    };
  });
  const kept = homes
    .filter(Boolean)
    .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: SRC,
        sourceName: "New Mexico Funeral Service Association firm members + first-party websites",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "NM",
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
