#!/usr/bin/env node
/**
 * Turn data/nv-funeral-homes.json into scripts/funeral-directory/nevada-places.js
 * Contact listings only. Do not invent GPL dollars.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const SRC = path.join(ROOT, "data", "nv-funeral-homes.json");
const OUT = path.join(__dirname, "nevada-places.js");

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
    "las vegas": "Las Vegas",
    "north las vegas": "North Las Vegas",
    "carson city": "Carson City",
    "boulder city": "Boulder City",
  };
  if (fixes[key]) return fixes[key];
  return String(city || "")
    .replace(/\s+/g, " ")
    .trim();
}

function homeId(name, city) {
  const id = slugify(`${name}-${city}`).slice(0, 48);
  return id || "home";
}

function sameHome(a, b) {
  const fa = fold(a);
  const fb = fold(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  return fa.includes(fb) || fb.includes(fa);
}

function phoneFromAddr(addr) {
  const m = String(addr || "").match(/(\d{3})[-.](\d{3})[-.](\d{4})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
}

function collectGuideContacts() {
  let cities = [];
  try {
    cities = require("../city-guides/nv-cities");
  } catch {
    return [];
  }
  const out = [];
  (Array.isArray(cities) ? cities : [cities]).forEach((city) => {
    const cityName = city.nameEn || city.name || "";
    const guide = city.guide || city;
    (guide.homes || []).forEach((h) => {
      if (!h || h.estimator || !h.name) return;
      out.push({
        name: h.name,
        city: cityName,
        href: httpsUrl(h.href),
        phone: phoneFromAddr(h.addr || h.address || h.phone),
      });
    });
    (guide.unpublishedHomes || city.unpublishedHomes || []).forEach((h) => {
      if (!h || !h.name) return;
      out.push({
        name: h.name,
        city: cityName,
        href: httpsUrl(h.href),
        phone: h.phone || phoneFromAddr(h.addr || ""),
      });
    });
  });
  return out;
}

function applyOverlay(home, city, overlays) {
  const cityHit = overlays.find((o) => sameHome(o.name, home.name) && fold(o.city) === fold(city));
  if (cityHit) {
    return {
      ...home,
      href: home.href || httpsUrl(cityHit.href),
      phone: home.phone || cityHit.phone || "",
    };
  }
  const nameHits = overlays.filter((o) => sameHome(o.name, home.name));
  if (nameHits.length === 1) {
    return {
      ...home,
      href: home.href || httpsUrl(nameHits[0].href),
      phone: home.phone || nameHits[0].phone || "",
    };
  }
  return home;
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

const data = JSON.parse(fs.readFileSync(SRC, "utf8"));
const overlays = collectGuideContacts();
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
      stateCode: "NV",
      stateSlug: "nevada",
      stateNameEs: "Nevada",
      stateNameEn: "Nevada",
      countyEs: "",
      countyEn: "",
      metroEs: [city],
      metroEn: [city],
      homes: [],
      cemeteries: [],
    });
  }
  const place = grouped.get(slug);
  if (place.homes.some((h) => sameHome(h.name, homeRec.name) && fold(h.address) === fold(homeRec.address))) {
    return;
  }
  place.homes.push(applyOverlay(homeRec, city, overlays));
}

data.homes.forEach((h) => {
  addHome(h.city, toHome(h, titleCity(h.city)));
});

const places = [...grouped.values()]
  .filter((p) => p.homes.length)
  .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

fs.writeFileSync(
  OUT,
  `/**
 * Generated from data/nv-funeral-homes.json (Nevada Funeral Board EST/DC lists).
 * Do not hand-edit. Re-run: node scripts/funeral-directory/harvest-nv-est.js
 * then node scripts/funeral-directory/build-nevada-places.js
 * Contact listings only — no invented GPL dollars.
 */
module.exports = ${JSON.stringify(places, null, 2)};
`
);
console.log(
  `wrote ${OUT} (${places.length} cities, ${places.reduce((n, p) => n + p.homes.length, 0)} homes)`
);
