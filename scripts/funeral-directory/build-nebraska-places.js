#!/usr/bin/env node
/**
 * Turn data/nefda-funeral-homes.json into scripts/funeral-directory/nebraska-places.js
 * Contact listings only. Do not invent GPL dollars.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const SRC = path.join(ROOT, "data", "nefda-funeral-homes.json");
const OUT = path.join(__dirname, "nebraska-places.js");

function fold(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(name) {
  return fold(name).replace(/\s+/g, "-");
}

function httpsUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (raw.startsWith("//")) return `https:${raw}`;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/^http:\/\//i, "https://");
  return `https://${raw}`;
}

function titleCity(city) {
  const key = fold(city);
  const fixes = {
    "so sioux city": "South Sioux City",
    "so sioux city ne": "South Sioux City",
    "o neill": "O'Neill",
    "mc cook": "McCook",
  };
  if (fixes[key]) return fixes[key];
  return String(city || "")
    .replace(/\s+/g, " ")
    .trim();
}

function suffixCity(name, known) {
  const m = String(name || "").match(/\s[-–]\s*([A-Z][A-Za-z .']+?)\s*$/);
  if (!m) return "";
  const named = m[1].trim().replace(/\.$/, "");
  if (/^(inc|llc|ltd|services|chapel|crematory)$/i.test(named)) return "";
  if (known.has(fold(named))) return named;
  return "";
}

const SUPPLEMENTS = [
  {
    name: "Livingston Butler Volland",
    street: "1225 N Elm Ave",
    city: "Hastings",
    phone: "402-462-2147",
    website: "https://www.livingstonbutlervolland.com/",
  },
  {
    name: "Marshall Funeral Chapel",
    street: "1109 1st Corso",
    city: "Nebraska City",
    phone: "402-873-5331",
    website: "https://www.marshallfuneral.com/",
  },
];

const PHONE_OVERRIDE = {
  "ludvigsen mortuary|fremont": "402-721-4440",
};

function homeId(name, city) {
  const id = slugify(`${name}-${city}`).slice(0, 48);
  return id || "home";
}

function toHome(h, city) {
  const phone =
    PHONE_OVERRIDE[`${fold(h.name)}|${fold(city)}`] || h.phone || "";
  return {
    id: homeId(h.name, city),
    name: h.name,
    href: httpsUrl(h.website),
    address: h.street || "",
    phone,
  };
}

function sameHome(a, b) {
  const fa = fold(a);
  const fb = fold(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  return fa.includes(fb) || fb.includes(fa);
}

const data = JSON.parse(fs.readFileSync(SRC, "utf8"));
const known = new Set(data.homes.map((h) => fold(titleCity(h.city))));
SUPPLEMENTS.forEach((h) => known.add(fold(h.city)));
["elgin", "wakefield", "south sioux city", "nebraska city", "o neill"].forEach((c) =>
  known.add(c)
);

const grouped = new Map();
function addHome(cityName, homeRec) {
  const city = titleCity(cityName);
  if (!city) return;
  const slug = slugify(city);
  if (!grouped.has(slug)) {
    grouped.set(slug, {
      slug,
      nameEs: city,
      nameEn: city,
      stateCode: "NE",
      stateSlug: "nebraska",
      stateNameEs: "Nebraska",
      stateNameEn: "Nebraska",
      countyEs: "",
      countyEn: "",
      metroEs: [city],
      metroEn: [city],
      homes: [],
      cemeteries: [],
    });
  }
  const place = grouped.get(slug);
  if (place.homes.some((h) => sameHome(h.name, homeRec.name))) return;
  place.homes.push(homeRec);
}

data.homes.forEach((h) => {
  const city = suffixCity(h.name, known) || titleCity(h.city);
  addHome(city, toHome(h, city));
});
SUPPLEMENTS.forEach((h) => addHome(h.city, toHome(h, h.city)));

const places = [...grouped.values()]
  .filter((p) => p.homes.length)
  .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

fs.writeFileSync(
  OUT,
  `/**
 * Generated from data/nefda-funeral-homes.json (Nebraska Funeral Directors Association).
 * Do not hand-edit. Re-run: node scripts/funeral-directory/harvest-nefda.js
 * then node scripts/funeral-directory/build-nebraska-places.js
 * Contact listings only — no invented GPL dollars.
 */
module.exports = ${JSON.stringify(places, null, 2)};
`
);
console.log(`wrote ${OUT} (${places.length} cities, ${places.reduce((n, p) => n + p.homes.length, 0)} homes)`);
