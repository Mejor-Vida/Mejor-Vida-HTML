#!/usr/bin/env node
/**
 * Harvest North Dakota Funeral Directors Association public member list.
 * Name + city only. Skip out-of-state rows and individual people. No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-nd-fda.js
 */
const fs = require("fs");
const path = require("path");
const { plausibleCity } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "north-dakota-funeral-homes.json");
const SRC = "https://www.ndfda.org/about-us/association-members";
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

function looksLikeHome(name) {
  return /\b(funeral|mortuary|chapel|cremation|memorial|service)\b/i.test(name);
}

function splitCities(raw) {
  return decode(raw)
    .split(/\s*(?:,|&| and )\s*/i)
    .map((c) => c.replace(/^the\s+/i, "").trim())
    .filter(Boolean);
}

function parseListings(html) {
  const text = decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
  const homes = [];
  const re =
    /([A-Za-z0-9][^|]{2,90}?)\s*\|\s*([^|]{2,160}?,\s*(?:ND|MT|SD|MN|MB)\b(?:\s*\|[^|]{2,80}?,\s*(?:ND|MT|SD|MN|MB)\b)*)/gi;
  let m;
  while ((m = re.exec(text))) {
    const name = decode(m[1]).replace(/\s*\|$/g, "");
    const loc = decode(m[2]);
    if (!looksLikeHome(name) && !/-/.test(name)) continue;
    const groups = loc.split("|").map((g) => decode(g));
    groups.forEach((g) => {
      const gm = g.match(/^(.*?),\s*(ND|MT|SD|MN|MB)\b/i);
      if (!gm || gm[2].toUpperCase() !== "ND") return;
      splitCities(gm[1]).forEach((city) => {
        const c = city === "Willison" ? "Williston" : city;
        if (!plausibleCity(c)) return;
        if (/^east grand forks$/i.test(c)) return;
        homes.push({
          name,
          street: "",
          city: c,
          region: "ND",
          phone: "",
          website: "",
        });
      });
    });
  }
  const tollefson = text.match(
    /Tollefson Funeral Home\s+([^.]{8,80}?,\s*ND)\b/i
  );
  if (tollefson) {
    const gm = tollefson[1].match(/^(.*?),\s*ND$/i);
    if (gm) {
      splitCities(gm[1]).forEach((city) => {
        if (!plausibleCity(city)) return;
        homes.push({
          name: "Tollefson Funeral Home",
          street: "",
          city,
          region: "ND",
          phone: "",
          website: "",
        });
      });
    }
  }
  const seen = new Set();
  return homes.filter((h) => {
    const k = `${h.name.toLowerCase()}|${h.city.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function main() {
  const res = await fetch(SRC, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`NDFDA ${res.status}`);
  const homes = parseListings(await res.text()).sort(
    (a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)
  );
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: SRC,
        sourceName: "North Dakota Funeral Directors Association member list",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "ND",
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
