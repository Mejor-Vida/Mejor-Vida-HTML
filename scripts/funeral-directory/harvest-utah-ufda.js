#!/usr/bin/env node
/**
 * Harvest Utah Funeral Directors Association public funeral-home member pages.
 * Name, street, city, phone, website as published. No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-utah-ufda.js
 */
const fs = require("fs");
const path = require("path");
const { formatPhone, httpsUrl, plausibleCity } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "utah-funeral-homes.json");
const SRC = "https://www.ufda.org/ufda-funeral-homes";
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

function titleName(name) {
  return decode(name)
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*$/, "")
    .trim();
}

function decodeLines(s) {
  return String(s || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function parseHomes(html) {
  const homes = [];
  const parts = html.split(/<h3\b/i).slice(1);
  parts.forEach((block) => {
    const nameM = block.match(/^[^>]*>([\s\S]*?)<\/h3>/i);
    if (!nameM) return;
    const name = titleName(nameM[1].replace(/<[^>]+>/g, " "));
    if (!name || /^menu$/i.test(name)) return;
    if (/community college|body donor|utah funeral directors association/i.test(name)) return;
    if (!/\b(funeral|mortuary|chapel|cremation|memorial|park)\b/i.test(name)) return;
    const chunk = block.slice(0, 2800);
    const body = decodeLines(
      chunk
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
    );
    const loc = body.match(/(?:^|\n)\s*([A-Z][A-Za-z .'-]{1,40}),\s*(UT|ID|WY)\s+(\d{5})\b/m);
    if (!loc || loc[2].toUpperCase() !== "UT") return;
    const city = loc[1].trim().replace(/\.$/, "");
    if (!plausibleCity(city)) return;
    if (/\b(st|dr|blvd|ave|rd|ln|ste)\b/i.test(city) && !/^st\.?\s/i.test(city)) return;
    const streetLine = body
      .split(/\n/)
      .map((l) => decode(l))
      .find((l) => /\d/.test(l) && !/\(Ph\)|Email:|Fax\)/i.test(l) && !/,\s*UT\s+\d{5}/i.test(l));
    const phone = formatPhone((body.match(/\(Ph\)\s*([0-9)(.\s-]{10,22})/i) || [])[1] || body);
    const hrefM = block.match(/href="(https?:\/\/(?!www\.ufda\.org)[^"]+)"/i);
    homes.push({
      name,
      street: streetLine || "",
      city,
      region: "UT",
      phone,
      website: httpsUrl(hrefM ? hrefM[1] : ""),
    });
  });
  const seen = new Set();
  return homes.filter((h) => {
    const k = `${h.name.toLowerCase()}|${h.city.toLowerCase()}|${h.street.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function main() {
  const res = await fetch(SRC, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`UFDA ${res.status}`);
  const homes = parseHomes(await res.text()).sort(
    (a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)
  );
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: SRC,
        sourceName: "Utah Funeral Directors Association funeral home members",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "UT",
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
