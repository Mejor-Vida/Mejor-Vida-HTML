#!/usr/bin/env node
/**
 * Harvest Montana Funeral Directors Association public firm-member list.
 * Name, city, website. Phone/street from the home's own site when published.
 * No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-montana-fda.js
 */
const fs = require("fs");
const path = require("path");
const { napFromSite, mapPool, httpsUrl, plausibleCity } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "montana-funeral-homes.json");
const SRC = "https://montanafda.org/members";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function decode(s) {
  return String(s || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function splitCities(raw) {
  return decode(raw)
    .split(/\s*,\s*/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function parseFirms(html) {
  const start = html.search(/FIRMS<\/strong>/i);
  const end = html.search(/NON-FIRM MEMBERS/i);
  const cut = html.slice(start >= 0 ? start : 0, end > start ? end : html.length);
  const firms = [];
  const re = /<a href="([^"]+)"[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?<\/a>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(cut))) {
    const hrefRaw = decode(m[1]);
    const name = decode(m[2].replace(/<[^>]+>/g, " "));
    const cities = splitCities(decode(m[3].replace(/<[^>]+>/g, " ")).replace(/^\|/, ""));
    if (!name || !cities.length) continue;
    const website = /^mailto:/i.test(hrefRaw) || /@/.test(hrefRaw) ? "" : httpsUrl(hrefRaw.replace(/\s+/g, ""));
    cities.forEach((city) => {
      if (!plausibleCity(city)) return;
      firms.push({ name, city, website });
    });
  }
  return firms;
}

async function main() {
  const res = await fetch(SRC, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`MFDA ${res.status}`);
  const seeds = parseFirms(await res.text());
  console.log(`resolving NAP for ${seeds.length} Montana firm listings`);
  const homes = await mapPool(seeds, 6, async (s) => {
    const nap = s.website ? await napFromSite(s.website, "MT") : { street: "", phone: "", href: "" };
    return {
      name: s.name,
      street: nap.street || "",
      city: s.city,
      region: "MT",
      phone: nap.phone || "",
      website: nap.href || s.website || "",
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
        sourceName: "Montana Funeral Directors Association firm members + first-party websites",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "MT",
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
