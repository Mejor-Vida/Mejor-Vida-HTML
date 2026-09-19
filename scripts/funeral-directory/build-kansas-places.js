#!/usr/bin/env node
/**
 * Turn data/ksbma-funeral-homes.json into scripts/funeral-directory/kansas-places.js
 * Contact listings only. Do not invent GPL dollars.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const SRC = path.join(ROOT, "data", "ksbma-funeral-homes.json");
const OUT = path.join(__dirname, "kansas-places.js");

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
    "el dorado": "El Dorado",
    "mcpherson": "McPherson",
    "mc louth": "McLouth",
    "mclouth": "McLouth",
    "wakeeney": "WaKeeney",
    "wa keeney": "WaKeeney",
    "ft scott": "Fort Scott",
    "fort scott": "Fort Scott",
    "kansas city": "Kansas City",
  };
  if (fixes[key]) return fixes[key];
  return String(city || "")
    .replace(/\s+/g, " ")
    .trim();
}

function countyLabel(county) {
  const raw = String(county || "").replace(/\s+County$/i, "").trim();
  if (!raw) return { es: "", en: "" };
  return { es: `condado ${raw}`, en: `${raw} County` };
}

function homeId(name, city) {
  const id = slugify(`${name}-${city}`).slice(0, 48);
  return id || "home";
}

function toHome(h, city) {
  return {
    id: homeId(h.name, city),
    name: h.name,
    href: httpsUrl(h.website),
    address: h.street || "",
    phone: h.phone || "",
  };
}

function sameHome(a, b) {
  const fa = fold(a);
  const fb = fold(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  return fa.includes(fb) || fb.includes(fa);
}

const WEBSITE_OVERLAY = [
  { name: "Ryan Mortuary", city: "Salina", href: "https://www.ryanmortuary.com/" },
  { name: "Carlson-Geisendorf", city: "Salina", href: "https://www.carlsonfh.net/" },
  { name: "Elliott Mortuary", city: "Hutchinson", href: "https://www.elliottmortuary.com/" },
  { name: "Penwell-Gabel Hutchinson", city: "Hutchinson", href: "http://www.penwellgabelhutchinson.com/" },
  { name: "Davis Funeral Chapel", city: "Leavenworth", href: "https://www.davisfuneralchapelinc.com/" },
  { name: "R. L. Leintz Funeral Home", city: "Leavenworth", href: "https://www.leintzfh.com/" },
  { name: "Charter Funerals Leavenworth", city: "Leavenworth", href: "https://www.charterfunerals.com/" },
  { name: "Garnand Funeral Home", city: "Garden City", href: "https://www.garnandfuneralhomes.com/" },
  { name: "Robson Funeral Home", city: "Garden City", href: "https://www.robsonfuneralhome.com/" },
  { name: "Swaim Funeral Chapel", city: "Dodge City", href: "https://www.swaimfuneralhome.com/" },
  { name: "Ziegler Funeral Chapel", city: "Dodge City", href: "https://www.zieglerfuneralchapel.com/" },
  { name: "Roberts-Blue-Barnett", city: "Emporia", href: "https://www.robertsblue.com/" },
  { name: "Charter Funerals Emporia", city: "Emporia", href: "https://www.charterfunerals.com/charter-funerals-emporia" },
  { name: "Hays Memorial Chapel", city: "Hays", href: "https://www.haysmemorial.com/" },
  { name: "Yorgensen-Meloan-Londeen", city: "Manhattan", href: "https://www.ymlfuneralhome.com/" },
  { name: "Irvin-Parkview", city: "Manhattan", href: "https://www.irvinparkview.com/" },
];

const CEMETERY_OVERLAY = {
  salina: [
    {
      name: "Norview Gardens",
      address: "",
      phone: "785-823-3456",
      noteEs: "Cementerio de Carlson-Geisendorf. Pida la lista en la funeraria.",
      noteEn: "Carlson-Geisendorf cemetery. Ask the funeral home for the list.",
    },
  ],
  leavenworth: [
    {
      name: "Sunset Memory Gardens",
      address: "16731 Springdale Rd",
      phone: "913-682-3501",
      noteEs: "Misma propiedad que Charter Leavenworth.",
      noteEn: "Same grounds as Charter Leavenworth.",
    },
  ],
  emporia: [
    {
      name: "Maplewood Memorial Lawn",
      address: "2000 Prairie St",
      phone: "620-342-8317",
      noteEs: "Cementerio de Charter en Emporia.",
      noteEn: "Charter cemetery in Emporia.",
    },
  ],
};

function applyWebsite(home, city) {
  if (home.href) return home;
  const hit = WEBSITE_OVERLAY.find(
    (o) => sameHome(o.name, home.name) && fold(o.city) === fold(city)
  );
  if (!hit) return home;
  return { ...home, href: httpsUrl(hit.href) };
}

const data = JSON.parse(fs.readFileSync(SRC, "utf8"));
const grouped = new Map();

function addHome(cityName, county, homeRec) {
  const city = titleCity(cityName);
  if (!city) return;
  const slug = slugify(city);
  if (!grouped.has(slug)) {
    const c = countyLabel(county);
    grouped.set(slug, {
      slug,
      nameEs: city,
      nameEn: city,
      stateCode: "KS",
      stateSlug: "kansas",
      stateNameEs: "Kansas",
      stateNameEn: "Kansas",
      countyEs: c.es,
      countyEn: c.en,
      metroEs: [city],
      metroEn: [city],
      homes: [],
      cemeteries: CEMETERY_OVERLAY[slug] ? CEMETERY_OVERLAY[slug] : [],
    });
  }
  const place = grouped.get(slug);
  if (place.homes.some((h) => sameHome(h.name, homeRec.name) && fold(h.address) === fold(homeRec.address))) {
    return;
  }
  place.homes.push(applyWebsite(homeRec, city));
}

data.homes.forEach((h) => {
  const city = titleCity(h.city);
  addHome(city, h.county, toHome(h, city));
});

const places = [...grouped.values()]
  .filter((p) => p.homes.length)
  .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

fs.writeFileSync(
  OUT,
  `/**
 * Generated from data/ksbma-funeral-homes.json (Kansas Board of Mortuary Arts).
 * Do not hand-edit. Re-run: node scripts/funeral-directory/harvest-ksbma.js
 * then node scripts/funeral-directory/build-kansas-places.js
 * Contact listings only — no invented GPL dollars.
 */
module.exports = ${JSON.stringify(places, null, 2)};
`
);
console.log(
  `wrote ${OUT} (${places.length} cities, ${places.reduce((n, p) => n + p.homes.length, 0)} homes)`
);
