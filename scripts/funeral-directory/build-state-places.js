#!/usr/bin/env node
/**
 * Turn data/{state}-funeral-homes.json into scripts/funeral-directory/{state}-places.js
 * Contact listings only. Do not invent GPL dollars.
 *
 * Usage: node scripts/funeral-directory/build-state-places.js iowa
 */
const fs = require("fs");
const path = require("path");
const META = require("./state-meta");
const { fold, httpsUrl, plausibleCity } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const ARG = String(process.argv[2] || "").toLowerCase();

function slugify(name) {
  return fold(name).replace(/\s+/g, "-");
}

function titleCity(city) {
  return String(city || "")
    .replace(/\s+/g, " ")
    .trim();
}

function homeId(name, city) {
  return slugify(`${name}-${city}`).slice(0, 48) || "home";
}

function sameHome(a, b) {
  const fa = fold(a);
  const fb = fold(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  return fa.includes(fb) || fb.includes(fa);
}

function metaFor(data) {
  const code = String(data.stateCode || "").toUpperCase();
  const m = META[code];
  if (!m) throw new Error(`Unknown stateCode ${code}`);
  return { code, ...m };
}

function main() {
  if (!ARG) {
    console.error("Usage: node scripts/funeral-directory/build-state-places.js <state-slug>");
    process.exit(1);
  }
  const src = path.join(ROOT, "data", `${ARG}-funeral-homes.json`);
  if (!fs.existsSync(src)) {
    console.error(`Missing ${src}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(src, "utf8"));
  const meta = metaFor(data);
  const grouped = new Map();

  (data.homes || []).forEach((h) => {
    const city = titleCity(h.city);
    if (!city || !h.name || !plausibleCity(city)) return;
    const slug = slugify(city);
    if (!slug) return;
    if (!grouped.has(slug)) {
      grouped.set(slug, {
        slug,
        nameEs: city,
        nameEn: city,
        stateCode: meta.code,
        stateSlug: meta.slug,
        stateNameEs: meta.nameEs,
        stateNameEn: meta.nameEn,
        countyEs: "",
        countyEn: "",
        metroEs: [city],
        metroEn: [city],
        homes: [],
        cemeteries: [],
      });
    }
    const place = grouped.get(slug);
    const home = {
      id: homeId(h.name, city),
      name: h.name,
      href: httpsUrl(h.website || h.href),
      address: h.street || h.address || "",
      phone: h.phone || "",
    };
    if (place.homes.some((x) => sameHome(x.name, home.name) && fold(x.address) === fold(home.address))) {
      return;
    }
    place.homes.push(home);
  });

  const places = [...grouped.values()]
    .filter((p) => p.homes.length)
    .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

  const out = path.join(__dirname, `${meta.slug}-places.js`);
  const srcNote = data.sourceName || data.source || src;
  fs.writeFileSync(
    out,
    `/**
 * Generated from data/${ARG}-funeral-homes.json (${srcNote}).
 * Do not hand-edit. Re-run the harvest, then:
 * node scripts/funeral-directory/build-state-places.js ${ARG}
 * Contact listings only — no invented GPL dollars.
 */
module.exports = ${JSON.stringify(places, null, 2)};
`
  );
  console.log(
    `wrote ${out} (${places.length} cities, ${places.reduce((n, p) => n + p.homes.length, 0)} homes)`
  );
}

main();
