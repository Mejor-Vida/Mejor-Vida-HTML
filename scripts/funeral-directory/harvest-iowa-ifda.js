#!/usr/bin/env node
/**
 * Harvest Iowa Funeral Directors Association public firm-member logos/links,
 * then fill city/street/phone from each home's own website. No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-iowa-ifda.js
 */
const fs = require("fs");
const path = require("path");
const { napFromSite, mapPool, httpsUrl } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "iowa-funeral-homes.json");
const SRC = "https://iafda.org/members/";
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

function nameFromAlt(alt) {
  return decode(alt)
    .replace(/\s+logo\.?$/i, "")
    .replace(/\s+screenshot.*$/i, "")
    .trim();
}

async function main() {
  const res = await fetch(SRC, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`IFDA ${res.status}`);
  const html = await res.text();
  const seeds = [];
  const re = /<a href="(https?:\/\/[^"]+)"[^>]*>\s*<img[^>]+alt="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = httpsUrl(m[1]);
    const name = nameFromAlt(m[2]);
    if (!href || !name) continue;
    if (/iafda\.org|facebook|instagram|juicebox/i.test(href)) continue;
    if (/iowa funeral directors association/i.test(name)) continue;
    if (/^screenshot/i.test(name) || /\blogo\b/i.test(name)) continue;
    seeds.push({ name, website: href });
  }
  const seenHost = new Set();
  const unique = seeds.filter((s) => {
    let host = "";
    try {
      host = new URL(s.website).hostname.replace(/^www\./, "");
    } catch {
      return false;
    }
    if (seenHost.has(host + s.name.toLowerCase())) return false;
    seenHost.add(host + s.name.toLowerCase());
    return true;
  });
  console.log(`resolving NAP for ${unique.length} IFDA firm sites`);
  const homes = await mapPool(unique, 6, async (s) => {
    const nap = await napFromSite(s.website, "IA");
    if (!nap.city) {
      process.stderr.write(`  skip no city: ${s.name}\n`);
      return null;
    }
    return {
      name: s.name,
      street: nap.street,
      city: nap.city,
      region: "IA",
      phone: nap.phone,
      website: nap.href || s.website,
    };
  });
  const kept = homes.filter(Boolean).sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: SRC,
        sourceName: "Iowa Funeral Directors Association firm members + first-party websites",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "IA",
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
