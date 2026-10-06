#!/usr/bin/env node
/**
 * Harvest Arkansas Funeral Directors Association 2026 firm-member names.
 * Keep a city only when the association printed it on the member line.
 * No invented websites or GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-arkansas-afda.js
 */
const fs = require("fs");
const path = require("path");
const { plausibleCity } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "arkansas-funeral-homes.json");
const SRC = "https://www.arfda.com/about/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function decode(s) {
  return String(s || "")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function splitNameCity(raw) {
  const name = decode(raw).replace(/\s+$/g, "");
  const dash = name.match(/^(.*?)\s[-–—]\s*(Arkansas|[A-Z][A-Za-z .']+)$/);
  if (dash) {
    const city = dash[2].replace(/^Arkansas$/i, "Texarkana").trim();
    if (plausibleCity(city) && !/^arkansas$/i.test(city)) {
      return { name: dash[1].trim(), city };
    }
  }
  const ofCity = name.match(/\bof\s+([A-Z][A-Za-z .']+)$/);
  if (ofCity && plausibleCity(ofCity[1])) return { name, city: ofCity[1].trim() };
  const whiteHall = name.match(/\bWhite Hall\b/i);
  if (whiteHall) return { name, city: "White Hall" };
  const mountainHome = name.match(/\bMountain Home\b/i);
  if (mountainHome) return { name, city: "Mountain Home" };
  const nlr = name.match(/\bNorth Little Rock\b/i);
  if (nlr) return { name, city: "North Little Rock" };
  const lr = name.match(/\bLittle Rock\b/i);
  if (lr) return { name, city: "Little Rock" };
  const hs = name.match(/\bHot Springs\b/i);
  if (hs) return { name, city: "Hot Springs" };
  return { name, city: "" };
}

async function main() {
  const res = await fetch(SRC, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`AFDA ${res.status}`);
  const html = await res.text();
  const start = html.search(/Funeral Home 2026 Members/i);
  const end = html.indexOf("AFDA", start + 1);
  const chunk = html.slice(start > 0 ? start : 0, end > start ? end : html.length);
  const text = decode(chunk.replace(/<[^>]+>/g, "\n")).replace(/\n+/g, "\n");
  const homes = [];
  text.split("\n").forEach((line) => {
    if (!/\b(funeral|mortuary|chapel|cremation|memorial)\b/i.test(line)) return;
    if (/members|association|purpose|board/i.test(line) && line.length < 40) return;
    const { name, city: rawCity } = splitNameCity(line);
    const city = String(rawCity || "")
      .replace(/\s+Chapel$/i, "")
      .replace(/\s+Inc\.?$/i, "")
      .trim();
    if (!name || !city || !plausibleCity(city)) return;
    if (/ruggles|wilcox/i.test(city)) return;
    homes.push({
      name,
      street: "",
      city,
      region: "AR",
      phone: "",
      website: "",
    });
  });
  const seen = new Set();
  const unique = homes.filter((h) => {
    const k = `${h.name.toLowerCase()}|${h.city.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  unique.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: SRC,
        sourceName: "Arkansas Funeral Directors Association 2026 funeral home members",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "AR",
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
