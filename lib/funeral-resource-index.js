/**
 * Harvest funeral homes, cemeteries, and GPL figures from city-guide data
 * plus directory-only extra cities. Rebuild whenever a city page is added.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "data", "funeral-resources.json");
const STATE_META = require("../scripts/funeral-directory/state-meta");

function officialStateName(code, fallback) {
  const m = STATE_META[String(code || "").toUpperCase()];
  return (m && m.nameEn) || fallback || "";
}

function loadGuideCities() {
  const lincoln = require("../scripts/city-guides/lincoln");
  const omaha = require("../scripts/city-guides/omaha");
  const grandIsland = require("../scripts/city-guides/grand-island");
  const kansasCities = require("../scripts/city-guides/ks-cities");
  const coloradoCities = require("../scripts/city-guides/co-cities");
  const nevadaCities = require("../scripts/city-guides/nv-cities");
  return [omaha, lincoln, grandIsland, ...kansasCities, ...coloradoCities, ...nevadaCities];
}

function loadExtraPlaces() {
  return require("../scripts/funeral-directory/extra-places");
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

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

function sameHomeName(a, b) {
  const fa = fold(a);
  const fb = fold(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  return fa.includes(fb) || fb.includes(fa);
}

function loadGplOverlays() {
  const dir = path.join(ROOT, "scripts", "funeral-directory");
  const files = fs.readdirSync(dir).filter((f) => /-gpls\.js$/.test(f) && !f.startsWith("probe-"));
  const out = [];
  for (const file of files) {
    try {
      const rows = require(path.join(dir, file));
      if (Array.isArray(rows)) out.push(...rows);
    } catch {
      /* overlay file not present yet */
    }
  }
  return out;
}

function applyGplOverlay(home, cityName) {
  const overlays = loadGplOverlays();
  const hit = overlays.find((o) => {
    if (!sameHomeName(o.name, home.name)) return false;
    if (o.city && fold(o.city) !== fold(cityName)) return false;
    return true;
  });
  if (!hit) return home;
  return {
    ...home,
    gplKind: hit.gplKind || "gpl",
    gplHref: hit.gplHref || home.href || "",
    gplDateEs: hit.gplDateEs || "",
    gplDateEn: hit.gplDateEn || "",
    sourceEs: hit.sourceEs || home.sourceEs,
    sourceEn: hit.sourceEn || home.sourceEn,
    packages: Array.isArray(hit.packages) ? hit.packages : home.packages,
  };
}

function phoneFrom(text) {
  const m = String(text || "").match(/\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/);
  return m ? m[1].replace(/\./g, "-") : "";
}

function splitAddr(addr) {
  const raw = String(addr || "").trim();
  if (!raw) return { address: "", phone: "" };
  const phone = phoneFrom(raw);
  let address = raw;
  if (phone) {
    address = raw
      .replace(phone, "")
      .replace(/\s*[·•|]\s*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .replace(/[·•]\s*$/, "")
      .trim();
  }
  const parts = address.split(/\s*[·•]\s*/);
  if (parts.length > 1 && phoneFrom(parts[parts.length - 1])) {
    parts.pop();
    address = parts.join(" · ").trim();
  }
  return { address, phone };
}

function packageId(labelEn) {
  const s = String(labelEn || "").toLowerCase();
  if (s.includes("direct cremation")) return "directCremation";
  if (s.includes("immediate burial")) return "immediateBurial";
  if (s.includes("memorial")) return "memorialCremation";
  if (s.includes("traditional")) return "traditional";
  return fold(labelEn).replace(/\s+/g, "_") || "package";
}

function sourceSlice(foot, home, homes) {
  const text = String(foot || "");
  if (!text) return "";
  const hay = text.toLowerCase();
  const name = String(home.name || "");
  let idx = hay.indexOf(name.toLowerCase());
  if (idx < 0) {
    const first = name.split(/[\s(&]/)[0];
    if (first && first.length > 3) idx = hay.indexOf(first.toLowerCase());
  }
  if (idx < 0) return "";
  let end = text.length;
  homes.forEach((other) => {
    if (!other.name || other.id === home.id) return;
    const i = hay.indexOf(other.name.toLowerCase(), idx + 2);
    if (i > idx && i < end) end = i;
  });
  const est = hay.search(/estimador:|estimator:/);
  if (est > idx && est < end) end = est;
  return text.slice(idx, end).replace(/\s+/g, " ").trim().replace(/[.;]\s*$/, "");
}

function gplKind(source, notes) {
  const t = `${source} ${notes}`.toLowerCase();
  if (
    /no publican gpl|do not post a gpl|promedio de kansas|kansas average, not|promedio de colorado|colorado average, not|promedio de nevada|nevada average, not/.test(
      t
    )
  )
    return "stateAverage";
  if (/\bfca\b/.test(t)) return "fca";
  if (/\bgpl\b/.test(t)) return "gpl";
  if (/p[aá]gina de servicios|services page|lista de servicios|compiled/.test(t)) return "compiled";
  return "published";
}

function expandGplAcronym(text, isEn) {
  return String(text || "").replace(
    /\bGPL\b/g,
    isEn ? "general price list" : "lista general de precios"
  );
}

function dateFrom(source) {
  const m = String(source || "").match(
    /\d{1,2}\s+(?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4}/i
  );
  return m ? m[0] : "";
}

function parseOffice(html) {
  const name = ((html.match(/<strong>([^<]+)<\/strong>/i) || [])[1] || "").trim();
  const plain = stripHtml(html);
  const phone = phoneFrom(plain);
  let note = plain;
  if (name) note = note.replace(name, "");
  note = note.replace(/^[—–\-\s]+/, "");
  if (phone) note = note.replace(phone, "");
  note = note
    .replace(/\b(Tel[eé]fono|Phone)\b:?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[.,;:\s]+|[.,;:\s]+$/g, "")
    .trim();
  const street =
    (
      plain.match(
        /\d{1,5}\s+[NSEW]\.?\s+\d+\w*\s+(?:St|Ave|Rd|Dr|Blvd|Ln|Ct|Pkwy)\.?(?:\s+[NSEW]\b)?/i
      ) ||
      plain.match(
        /\d{1,5}\s+[\w.'-]+(?:\s+[\w.'-]+){0,3}\s+(?:St|Ave|Rd|Dr|Blvd|Ln|Ct|Pkwy|Hill)\.?(?:\s+[NSEW]\b)?/i
      ) ||
      [""]
    )[0];
  if (street && note.toLowerCase().startsWith(street.toLowerCase())) {
    note = note.slice(street.length).replace(/^[.,;:\s]+/, "");
  }
  return {
    name: name || plain.slice(0, 80),
    address: street,
    phone,
    note,
  };
}

function uniqueAliases(city) {
  const seen = new Set();
  const out = [];
  function add(raw) {
    const name = String(raw || "").trim();
    if (!name) return;
    const key = fold(name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(name);
  }
  add(city.nameEs);
  add(city.nameEn);
  (city.metroEs || []).forEach(add);
  (city.metroEn || []).forEach(add);
  add(city.countyEs);
  add(city.countyEn);
  if (city.countyEn && /county/i.test(city.countyEn)) add(city.countyEn.replace(/\s+County$/i, ""));
  if (city.slug === "kansas-city") {
    add("Kansas City, Kansas");
    add("KCK");
    add("Wyandotte");
  }
  return out;
}

function harvestCity(city) {
  const guide = city.guide || {};
  const homesIn = (guide.homes || []).filter((h) => h && !h.estimator && h.id !== "us");
  const packages = guide.packages || [];
  const homes = homesIn.map((home) => {
    const { address, phone } = splitAddr(home.addr);
    const sourceEs = sourceSlice(guide.tableFootEs, home, homesIn);
    const sourceEn = sourceSlice(guide.tableFootEn, home, homesIn);
    const pkgs = packages.map((row) => {
      const cell = (row.cells && row.cells[home.id]) || {};
      return {
        id: packageId(row.labelEn),
        labelEs: row.labelEs,
        labelEn: row.labelEn,
        amt: Number(cell.amt) || 0,
        noteEs: stripHtml(cell.es),
        noteEn: stripHtml(cell.en),
      };
    });
    const notes = pkgs.map((p) => `${p.noteEs} ${p.noteEn}`).join(" ");
    return {
      id: home.id,
      name: home.name,
      href: home.href || "",
      address,
      phone,
      sourceEs: expandGplAcronym(sourceEs, false),
      sourceEn: expandGplAcronym(sourceEn, true),
      gplDateEs: dateFrom(sourceEs),
      gplDateEn: dateFrom(sourceEn),
      gplKind: gplKind(`${sourceEs} ${sourceEn}`, notes),
      packages: pkgs,
    };
  });
  for (const h of guide.unpublishedHomes || []) {
    if (homes.some((x) => sameHomeName(x.name, h.name))) continue;
    homes.push({
      id: slugify(h.name),
      name: h.name,
      href: h.href || "",
      address: h.addr || "",
      phone: h.phone || "",
      sourceEs: "",
      sourceEn: "",
      gplDateEs: "",
      gplDateEn: "",
      gplKind: "none",
      packages: [],
    });
  }

  const officesEs = guide.officesEs || [];
  const officesEn = guide.officesEn || [];
  const cemeteries = officesEs.map((html, i) => {
    const es = parseOffice(html);
    const en = parseOffice(officesEn[i] || html);
    return {
      name: en.name || es.name,
      address: es.address || en.address,
      phone: es.phone || en.phone,
      noteEs: es.note,
      noteEn: en.note,
    };
  });

  const other = [];
  if (guide.resaleNoscriptHref) {
    other.push({
      type: "plotResale",
      nameEs: "Anuncios de reventa de lotes",
      nameEn: "Private plot resale ads",
      href: guide.resaleNoscriptHref,
    });
  }

  return {
    slug: city.slug,
    kind: "hub",
    stateCode: city.stateCode,
    stateSlug: city.stateSlug,
    stateNameEs: officialStateName(city.stateCode, city.stateNameEn),
    stateNameEn: officialStateName(city.stateCode, city.stateNameEn),
    nameEs: city.nameEs,
    nameEn: city.nameEn,
    aliases: uniqueAliases(city),
    countyEs: city.countyEs || "",
    countyEn: city.countyEn || "",
    metroEs: city.metroEs || [],
    metroEn: city.metroEn || [],
    guideEs: `/estados/${city.stateSlug}/${city.slug}.html`,
    guideEn: `/en/states/${city.stateSlug}/${city.slug}.html`,
    sourceLineEs: stripHtml(guide.tableFootEs),
    sourceLineEn: stripHtml(guide.tableFootEn),
    officesNoteEs: stripHtml(guide.officesNoteEs),
    officesNoteEn: stripHtml(guide.officesNoteEn),
    homes,
    cemeteries,
    other,
  };
}

function harvestExtra(place) {
  const homes = (place.homes || []).map((home) =>
    applyGplOverlay(
      {
        id: home.id,
        name: home.name,
        href: home.href || "",
        address: home.address || "",
        phone: home.phone || "",
        sourceEs: "Pida la lista general de precios vigente. La funeraria es la única fuente oficial.",
        sourceEn: "Ask the funeral home for its current general price list. That list is the only official price.",
        gplDateEs: "",
        gplDateEn: "",
        gplKind: "none",
        packages: [],
      },
      place.nameEn || place.nameEs
    )
  );
  return {
    slug: place.slug,
    kind: "extra",
    stateCode: place.stateCode,
    stateSlug: place.stateSlug,
    stateNameEs: officialStateName(place.stateCode, place.stateNameEn),
    stateNameEn: officialStateName(place.stateCode, place.stateNameEn),
    nameEs: place.nameEs,
    nameEn: place.nameEn,
    aliases: uniqueAliases(place),
    countyEs: place.countyEs || "",
    countyEn: place.countyEn || "",
    metroEs: place.metroEs || [],
    metroEn: place.metroEn || [],
    guideEs: "",
    guideEn: "",
    sourceLineEs: "",
    sourceLineEn: "",
    officesNoteEs: "",
    officesNoteEn: "",
    homes,
    cemeteries: place.cemeteries || [],
    other: [],
  };
}

function skipTownName(name, reservedSlugs) {
  const f = fold(name);
  if (!f || f.length < 3) return true;
  if (/\b(condado|county)\b/.test(f)) return true;
  if (/\bmetro\b/.test(f)) return true;
  if (f === "kck" || f === "wyandotte" || f === "kansas city kansas") return true;
  return reservedSlugs.has(slugify(name));
}

function mentionsTown(text, townName) {
  const hay = ` ${fold(text)} `;
  const needle = fold(townName);
  if (!needle) return false;
  return hay.includes(` ${needle} `);
}

function localOf(items, townName) {
  return (items || []).filter((item) =>
    mentionsTown(`${item.name || ""} ${item.address || ""}`, townName)
  );
}

function listingPaths(stateSlug, slug) {
  const q = `estado=${encodeURIComponent(stateSlug)}&ciudad=${encodeURIComponent(slug)}`;
  return {
    pathEs: `/funerarias-cementerios.html?${q}`,
    pathEn: `/en/funeral-homes-cemeteries.html?${q}`,
  };
}

function cloneList(items) {
  return JSON.parse(JSON.stringify(items || []));
}

function placeListing(place) {
  const paths = listingPaths(place.stateSlug, place.slug);
  return {
    slug: place.slug,
    kind: place.kind,
    parentSlug: null,
    parentNameEs: "",
    parentNameEn: "",
    stateCode: place.stateCode,
    stateSlug: place.stateSlug,
    stateNameEs: place.stateNameEs,
    stateNameEn: place.stateNameEn,
    nameEs: place.nameEs,
    nameEn: place.nameEn,
    aliases: [place.nameEs, place.nameEn].filter(Boolean),
    pathEs: paths.pathEs,
    pathEn: paths.pathEn,
    guideEs: place.guideEs || "",
    guideEn: place.guideEn || "",
    sourceLineEs: place.sourceLineEs || "",
    sourceLineEn: place.sourceLineEn || "",
    localHomes: cloneList(place.homes),
    nearbyHomes: [],
    localCemeteries: cloneList(place.cemeteries),
    nearbyCemeteries: [],
    other: cloneList(place.other),
  };
}

function townListing(place, townEs, townEn) {
  const nameEs = townEs || townEn;
  const nameEn = townEn || townEs;
  const slug = slugify(nameEn || nameEs);
  const paths = listingPaths(place.stateSlug, slug);
  const localHomes = localOf(place.homes, nameEn);
  const nearbyHomes = (place.homes || []).filter((h) => !localHomes.includes(h));
  const localCemeteries = localOf(place.cemeteries, nameEn);
  const nearbyCemeteries = (place.cemeteries || []).filter((c) => !localCemeteries.includes(c));
  return {
    slug,
    kind: "town",
    parentSlug: place.slug,
    parentNameEs: place.nameEs,
    parentNameEn: place.nameEn,
    stateCode: place.stateCode,
    stateSlug: place.stateSlug,
    stateNameEs: place.stateNameEs,
    stateNameEn: place.stateNameEn,
    nameEs,
    nameEn,
    aliases: [nameEs, nameEn].filter(Boolean),
    pathEs: paths.pathEs,
    pathEn: paths.pathEn,
    guideEs: place.guideEs || "",
    guideEn: place.guideEn || "",
    sourceLineEs: place.sourceLineEs || "",
    sourceLineEn: place.sourceLineEn || "",
    localHomes: cloneList(localHomes),
    nearbyHomes: cloneList(nearbyHomes),
    localCemeteries: cloneList(localCemeteries),
    nearbyCemeteries: cloneList(nearbyCemeteries),
    other: cloneList(place.other),
  };
}

function collectStates(places) {
  const states = [];
  const seen = new Set();
  places.forEach((p) => {
    if (seen.has(p.stateCode)) return;
    seen.add(p.stateCode);
    states.push({
      code: p.stateCode,
      slug: p.stateSlug,
      nameEs: p.stateNameEs,
      nameEn: p.stateNameEn,
      pathEs: `/funerarias-cementerios.html?estado=${encodeURIComponent(p.stateSlug)}`,
      pathEn: `/en/funeral-homes-cemeteries.html?estado=${encodeURIComponent(p.stateSlug)}`,
    });
  });
  return states;
}

function buildListings(places) {
  const reserved = new Set(places.map((p) => p.slug));
  const listings = [];
  const used = new Set();

  places.forEach((place) => {
    if (used.has(`${place.stateSlug}:${place.slug}`)) return;
    used.add(`${place.stateSlug}:${place.slug}`);
    listings.push(placeListing(place));
  });

  places.forEach((place) => {
    const metro = [];
    const seenTown = new Set();
    function addTown(raw) {
      const name = String(raw || "").trim();
      if (!name) return;
      const key = fold(name);
      if (!key || seenTown.has(key)) return;
      seenTown.add(key);
      metro.push(name);
    }
    (place.metroEs || []).forEach(addTown);
    (place.metroEn || []).forEach(addTown);

    metro.forEach((town) => {
      if (skipTownName(town, reserved)) return;
      if (fold(town) === fold(place.nameEn) || fold(town) === fold(place.nameEs)) return;
      const slug = slugify(town);
      const key = `${place.stateSlug}:${slug}`;
      if (used.has(key)) return;
      used.add(key);
      const enName =
        (place.metroEn || []).find((n) => fold(n) === fold(town)) || town;
      const esName =
        (place.metroEs || []).find((n) => fold(n) === fold(town)) || town;
      listings.push(townListing(place, esName, enName));
    });
  });

  listings.sort((a, b) => {
    const st = a.stateNameEn.localeCompare(b.stateNameEn);
    if (st) return st;
    if (a.kind !== b.kind) {
      const order = { hub: 0, extra: 1, town: 2 };
      return (order[a.kind] || 9) - (order[b.kind] || 9);
    }
    return a.nameEn.localeCompare(b.nameEn);
  });
  return listings;
}

function mergeExtraIntoGuides(guidePlaces, extraPlaces) {
  const bySlug = new Map(guidePlaces.map((p) => [p.slug, p]));
  const leftover = [];
  extraPlaces.forEach((extra) => {
    const existing = bySlug.get(extra.slug);
    if (!existing) {
      leftover.push(extra);
      return;
    }
    extra.homes.forEach((home) => {
      if (existing.homes.some((h) => sameHomeName(h.name, home.name))) return;
      existing.homes.push(home);
    });
    extra.cemeteries.forEach((cem) => {
      if (existing.cemeteries.some((c) => sameHomeName(c.name, cem.name))) return;
      existing.cemeteries.push(cem);
    });
  });
  return [...guidePlaces, ...leftover];
}

function buildFuneralResourceIndex() {
  const places = mergeExtraIntoGuides(
    loadGuideCities().map(harvestCity),
    loadExtraPlaces().map(harvestExtra)
  );
  const states = collectStates(places);
  const listings = buildListings(places);
  return {
    updated: new Date().toISOString().slice(0, 10),
    states,
    places,
    listings,
  };
}

function writeFuneralResourceIndex() {
  const data = buildFuneralResourceIndex();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");
  return {
    out: OUT,
    places: data.places.length,
    listings: data.listings.length,
    homes: data.places.reduce((n, p) => n + p.homes.length, 0),
  };
}

module.exports = {
  OUT,
  loadCities: loadGuideCities,
  buildFuneralResourceIndex,
  writeFuneralResourceIndex,
  fold,
  slugify,
};
