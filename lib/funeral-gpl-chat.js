/**
 * Public chatbot answers from harvested funeral-home GPL data.
 * Quote only packages with a published dollar amount. Contact-only homes
 * get a phone number and the city page — never an invented memorial price.
 */

const SITE = "https://www.mejorvidainsurance.com";
const DATA = require("../data/funeral-resources.json");

const GENERIC_HOME_TOKENS = new Set([
  "funeral",
  "funerals",
  "home",
  "homes",
  "chapel",
  "chapels",
  "mortuary",
  "memorial",
  "crematory",
  "cremation",
  "family",
  "county",
  "the",
  "and",
  "of",
  "llc",
  "inc",
  "co",
  "company",
  "services",
  "service",
  "cemetery",
  "gardens",
]);

const QUESTION_STOP = new Set([
  "how",
  "much",
  "does",
  "a",
  "an",
  "the",
  "in",
  "for",
  "cost",
  "costs",
  "price",
  "prices",
  "what",
  "cuanto",
  "cuesta",
  "cuestan",
  "precio",
  "precios",
  "un",
  "una",
  "el",
  "la",
  "los",
  "las",
  "de",
  "en",
  "funeral",
  "funeraria",
  "funerarias",
  "entierro",
  "burial",
  "cremacion",
  "cremation",
  "seguro",
  "insurance",
  "please",
  "por",
  "favor",
  "me",
  "my",
  "mi",
]);

const SHORT_PLACE = new Set(["kck"]);

const PKG_ORDER = ["directCremation", "immediateBurial", "memorialCremation", "traditional"];

let indexCache = null;

function fold(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasPhrase(hay, needle) {
  const n = fold(needle);
  if (!n) return false;
  return ` ${fold(hay)} `.includes(` ${n} `);
}

function money(n) {
  return `$${Number(n).toLocaleString("en-US")}`;
}

function absUrl(path, isSpanish) {
  const p = String(path || "").trim();
  if (!p) {
    return isSpanish
      ? `${SITE}/funerarias-cementerios.html`
      : `${SITE}/en/funeral-homes-cemeteries.html`;
  }
  return p.startsWith("http") ? p : `${SITE}${p.startsWith("/") ? p : `/${p}`}`;
}

function placeUrl(listing, isSpanish) {
  if (isSpanish) return absUrl(listing.guideEs || listing.pathEs, true);
  return absUrl(listing.guideEn || listing.pathEn, false);
}

function listings() {
  return DATA.listings || [];
}

function hubPlaces() {
  return DATA.places || [];
}

function listingForPlace(place) {
  return (
    listings().find((l) => l.slug === place.slug && (l.kind === "hub" || l.kind === "extra")) ||
    listings().find((l) => l.slug === place.slug) ||
    null
  );
}

function homesOf(listing) {
  const local = listing.localHomes || listing.homes || [];
  const nearby = listing.nearbyHomes || [];
  const seen = new Set();
  const out = [];
  for (const h of local.concat(nearby)) {
    if (!h || !h.name) continue;
    const key = fold(h.name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  return out;
}

function publishedPackages(home) {
  if (!home || home.gplKind === "stateAverage" || home.gplKind === "none") return [];
  return (home.packages || []).filter((p) => Number(p.amt) > 0);
}

function isQuotable(home) {
  return publishedPackages(home).length > 0;
}

function homeTokens(name) {
  return fold(name)
    .split(" ")
    .filter((t) => t.length >= 4 && !GENERIC_HOME_TOKENS.has(t));
}

function buildIndex() {
  if (indexCache) return indexCache;
  const placeNeedles = [];
  const homeNeedles = [];
  const tokenCounts = new Map();

  for (const listing of listings()) {
    const names = new Set(
      [listing.nameEn, listing.nameEs, listing.slug && String(listing.slug).replace(/-/g, " ")]
        .concat(listing.aliases || [])
        .filter(Boolean)
        .map(fold)
        .filter(Boolean)
    );
    for (const n of names) {
      if (n.length < 4 && !SHORT_PLACE.has(n)) continue;
      if (n === "nebraska" || n === "kansas" || n === "colorado") continue;
      placeNeedles.push({ needle: n, listing });
    }
  }

  for (const place of hubPlaces()) {
    const listing = listingForPlace(place);
    if (!listing) continue;
    for (const home of place.homes || []) {
      for (const tok of homeTokens(home.name)) {
        tokenCounts.set(tok, (tokenCounts.get(tok) || 0) + 1);
      }
    }
  }

  for (const place of hubPlaces()) {
    const listing = listingForPlace(place);
    if (!listing) continue;
    for (const home of place.homes || []) {
      const full = fold(home.name);
      if (full.length >= 6) {
        homeNeedles.push({ needle: full, home, listing, weight: 3 });
      }
      for (const tok of homeTokens(home.name)) {
        if (tok.length >= 6 && tokenCounts.get(tok) <= 3) {
          homeNeedles.push({ needle: tok, home, listing, weight: 2 });
        }
      }
    }
  }

  placeNeedles.sort((a, b) => b.needle.length - a.needle.length);
  homeNeedles.sort((a, b) => b.needle.length - a.needle.length || b.weight - a.weight);
  indexCache = { placeNeedles, homeNeedles };
  return indexCache;
}

function isInsuranceCostQuestion(question) {
  const t = fold(question);
  if (
    /\b(funeraria|funeral home|funeral homes|lista general|general price list|\bgpl\b|cementerio|cemetery|ataud|casket)\b/.test(
      t
    )
  ) {
    return false;
  }
  return (
    /\bseguro de (gastos finales|entierro|funeral|vida|cremacion)\b/.test(t) ||
    /\b(funeral|burial|final expense) insurance\b/.test(t) ||
    /\b(life insurance|seguro de vida|poliza|prima mensual|monthly premium)\b/.test(t)
  );
}

function hasCostWords(question) {
  return /\b(cost|costs|price|prices|precio|precios|cuanto|cuesta|cuestan|how much|sale|salen|cobra|cobran|package|packages|paquete|paquetes|gpl|lista|list|memorial)\b/.test(
    fold(question)
  );
}

function mentionsKnownHome(question) {
  const { homeNeedles } = buildIndex();
  return homeNeedles.some((row) => hasPhrase(question, row.needle));
}

function isFuneralCostQuestion(question) {
  const t = fold(question);
  if (!t || isInsuranceCostQuestion(question)) return false;
  if (!hasCostWords(question)) return false;
  const domain =
    /\b(funeraria|funerarias|funeral home|funeral homes|cementerio|cemetery|lista general|general price list|\bgpl\b|crematori|ataud|casket|urna|\burn\b|sepelio)\b/.test(
      t
    ) || /\b(funeral|funerals|entierro|cremacion|cremation|burial)\b/.test(t);
  return domain || mentionsKnownHome(question);
}

function wantedPackage(question) {
  const t = fold(question);
  if (/\b(direct cremation|cremacion directa|cremar directo|directa)\b/.test(t) && !/\bmemorial\b/.test(t)) {
    return "directCremation";
  }
  if (/\b(immediate burial|entierro inmediato)\b/.test(t)) return "immediateBurial";
  if (/\b(memorial|cremacion con memorial|cremation with memorial)\b/.test(t)) return "memorialCremation";
  if (/\b(traditional|tradicional|velatorio|visitation|con visita)\b/.test(t)) return "traditional";
  return null;
}

function searchHay(question, conversationContext) {
  const ctx = String(conversationContext || "")
    .split("\n")
    .filter((line) => /^(user|you):/i.test(line.trim()))
    .map((line) => line.replace(/^(user|you):\s*/i, ""))
    .join(" ");
  return `${question} ${ctx}`;
}

function matchPlaces(hay) {
  const { placeNeedles } = buildIndex();
  const hits = [];
  const seen = new Set();
  for (const row of placeNeedles) {
    if (!hasPhrase(hay, row.needle)) continue;
    const key = `${row.listing.stateSlug}:${row.listing.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push(row.listing);
    if (hits.length >= 6) break;
  }
  hits.sort((a, b) => {
    const aHub = a.kind === "hub" ? 0 : 1;
    const bHub = b.kind === "hub" ? 0 : 1;
    if (aHub !== bHub) return aHub - bHub;
    return fold(a.nameEn).length - fold(b.nameEn).length;
  });
  const tokens = fold(hay)
    .split(" ")
    .filter((w) => w && !QUESTION_STOP.has(w));
  if (hits.length > 1 && tokens.length) {
    const tighter = hits.filter((listing) =>
      tokens.some(
        (tok) =>
          tok.length >= 4 &&
          (hasPhrase(listing.nameEn, tok) ||
            hasPhrase(listing.nameEs, tok) ||
            (listing.aliases || []).some((a) => hasPhrase(a, tok)))
      )
    );
    if (tighter.length) return tighter;
  }
  return hits;
}

function matchHomes(hay, listing) {
  const { homeNeedles } = buildIndex();
  const hits = [];
  const seen = new Set();
  for (const row of homeNeedles) {
    if (listing && row.listing.slug !== listing.slug && row.listing.parentSlug !== listing.slug) {
      const sameGuide =
        (listing.guideEs && row.listing.guideEs === listing.guideEs) ||
        (listing.parentSlug && row.listing.slug === listing.parentSlug);
      if (!sameGuide && row.listing.slug !== listing.parentSlug) continue;
    }
    if (!hasPhrase(hay, row.needle)) continue;
    const key = `${row.listing.slug}:${fold(row.home.name)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push({ home: row.home, listing: row.listing });
  }
  return hits;
}

function homeMatchIsJustCity(hay, home, listing) {
  if (!home || !listing) return false;
  if (hasPhrase(hay, home.name)) return false;
  const city = fold(listing.nameEn || listing.nameEs);
  const cityEs = fold(listing.nameEs || listing.nameEn);
  if (!hasPhrase(hay, city) && !hasPhrase(hay, cityEs)) return false;
  const homeFold = fold(home.name);
  const cityToks = city.split(" ").filter((t) => t.length >= 4);
  if (city && city.length >= 4 && homeFold.includes(city)) {
    const rest = homeFold
      .replace(city, " ")
      .split(" ")
      .filter((t) => t.length >= 4 && !GENERIC_HOME_TOKENS.has(t));
    if (!rest.some((tok) => hasPhrase(hay, tok))) return true;
  }
  const distinctive = homeTokens(home.name).filter((tok) => !cityToks.includes(tok));
  if (distinctive.some((tok) => hasPhrase(hay, tok))) return false;
  const cityOverlap = homeTokens(home.name).filter((tok) => cityToks.includes(tok));
  return cityOverlap.length > 0;
}

function specificHomes(hay, rows, listing) {
  return (rows || []).filter((row) => !homeMatchIsJustCity(hay, row.home, listing || row.listing));
}

function pickListing(hay) {
  const places = matchPlaces(hay);
  const homes = specificHomes(hay, matchHomes(hay, places[0] || null), places[0] || null);
  if (homes.length === 1 && !places.length) return { listing: homes[0].listing, home: homes[0].home, ambiguous: false };
  if (homes.length === 1 && places.length) {
    const homeListing = homes[0].listing;
    const place = places.find(
      (p) =>
        p.slug === homeListing.slug ||
        p.slug === homeListing.parentSlug ||
        p.parentSlug === homeListing.slug ||
        (p.guideEs && p.guideEs === homeListing.guideEs)
    );
    return { listing: place || homeListing, home: homes[0].home, ambiguous: false };
  }
  if (homes.length > 1 && !places.length) {
    const guides = new Set(homes.map((h) => h.listing.guideEs || h.listing.slug));
    if (guides.size === 1) {
      const hub = homes.find((h) => h.listing.kind === "hub") || homes[0];
      return { listing: hub.listing, home: null, ambiguous: false };
    }
    return { listing: null, home: null, ambiguous: homes };
  }
  if (places.length === 1) {
    const inPlace = specificHomes(hay, matchHomes(hay, places[0]), places[0]);
    return { listing: places[0], home: inPlace.length === 1 ? inPlace[0].home : null, ambiguous: false };
  }
  if (places.length > 1) {
    const hub = places.find((p) => p.kind === "hub");
    const townsShareGuide = places.every((p) => p.guideEs && p.guideEs === places[0].guideEs);
    if (townsShareGuide) return { listing: hub || places[0], home: null, ambiguous: false };
    return { listing: null, home: null, ambiguous: places };
  }
  return { listing: null, home: null, ambiguous: false };
}

function formatHomePackages(home, isSpanish, pkgId) {
  const pkgs = publishedPackages(home);
  const rows = pkgId ? pkgs.filter((p) => p.id === pkgId) : pkgs.slice().sort((a, b) => PKG_ORDER.indexOf(a.id) - PKG_ORDER.indexOf(b.id));
  if (!rows.length) return "";
  return rows
    .map((p) => {
      const label = isSpanish ? p.labelEs : p.labelEn;
      return `• ${label}: ${money(p.amt)}`;
    })
    .join("\n");
}

function contactLine(home, isSpanish) {
  const phone = home.phone ? ` ${home.phone}` : "";
  const addr = home.address ? ` — ${home.address}` : "";
  return isSpanish
    ? `• ${home.name}${addr}.${phone ? ` Teléfono${phone}.` : ""}`
    : `• ${home.name}${addr}.${phone ? ` Phone${phone}.` : ""}`;
}

function disclaimer(isSpanish) {
  return isSpanish
    ? "No son precios de Mejor Vida Seguros. Pida la lista general de precios vigente en la funeraria; esa hoja es el único precio oficial. El lote del cementerio va aparte."
    : "These are not Mejor Vida Insurance prices. Ask the funeral home for its current general price list; that sheet is the only official price. The burial plot is a separate cemetery bill.";
}

function insuranceClose(isSpanish) {
  return isSpanish
    ? "Si quiere dejar efectivo para esos gastos, Mejor Vida Seguros cotiza por teléfono: 402-440-5438."
    : "If you want to leave cash for those bills, Mejor Vida Insurance quotes by phone: 402-440-5438.";
}

function askCity(isSpanish) {
  const dir = isSpanish
    ? `${SITE}/funerarias-cementerios.html`
    : `${SITE}/en/funeral-homes-cemeteries.html`;
  return isSpanish
    ? `Puedo leer las listas generales de precios que ya reunimos para funerarias de Nebraska, Kansas y Colorado. ¿En qué ciudad está? Por ejemplo Lincoln, Omaha, Olathe o Denver.\n\nTambién puede abrir el directorio: ${dir}`
    : `I can read the general price lists we have already gathered for funeral homes in Nebraska, Kansas, and Colorado. Which city are you in? For example Lincoln, Omaha, Olathe, or Denver.\n\nYou can also open the directory: ${dir}`;
}

function ambiguousAnswer(items, isSpanish) {
  const names = items
    .slice(0, 6)
    .map((item) => {
      if (item.nameEn || item.nameEs) {
        const city = isSpanish ? item.nameEs : item.nameEn;
        const st = isSpanish ? item.stateNameEs : item.stateNameEn;
        return `• ${city}, ${st}`;
      }
      const listing = item.listing || item;
      const home = item.home;
      if (home) {
        const city = isSpanish ? listing.nameEs : listing.nameEn;
        return `• ${home.name} (${city})`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
  return isSpanish
    ? `Hay más de una coincidencia. ¿Cuál es?\n${names}`
    : `There is more than one match. Which one did you mean?\n${names}`;
}

function answerForListing(listing, home, question, isSpanish) {
  const url = placeUrl(listing, isSpanish);
  const city = isSpanish ? listing.nameEs : listing.nameEn;
  const pkgId = wantedPackage(question);
  const all = homesOf(listing);
  const focus = home ? [home] : all;
  const quotable = focus
    .filter(isQuotable)
    .sort((a, b) => {
      const key = pkgId || "directCremation";
      const av = Number((publishedPackages(a).find((p) => p.id === key) || {}).amt) || 9e9;
      const bv = Number((publishedPackages(b).find((p) => p.id === key) || {}).amt) || 9e9;
      return av - bv;
    });
  const contacts = focus.filter((h) => !isQuotable(h));

  let extraQuotable = [];
  if (!home && !quotable.length) {
    extraQuotable = (listing.nearbyHomes || []).filter(isQuotable);
  }

  const lines = [];
  if (quotable.length) {
    const show = quotable.slice(0, 3);
    if (isSpanish) {
      lines.push(
        `Estas cifras son de listas generales de precios publicadas para ${city}. Cada paquete incluye cosas distintas; el ataúd y el lote solo van si esa lista lo dice.`
      );
    } else {
      lines.push(
        `These figures are from published general price lists for ${city}. Package names do not include the same items; a casket and the plot are included only if that list says so.`
      );
    }
    for (const h of show) {
      const dated = isSpanish
        ? h.gplDateEs
          ? ` (${h.gplDateEs})`
          : ""
        : h.gplDateEn
          ? ` (${h.gplDateEn})`
          : "";
      lines.push(`\n**${h.name}**${dated}`);
      const pkgs = formatHomePackages(h, isSpanish, pkgId);
      if (pkgs) lines.push(pkgs);
      else if (pkgId) {
        lines.push(
          isSpanish
            ? "Esa casa no tiene publicado ese paquete en nuestros datos. Pida esa línea en la lista vigente."
            : "That home does not have that package in our published data. Ask for that line on the current list."
        );
      }
    }
    if (quotable.length > 3) {
      lines.push(
        isSpanish
          ? `Hay más casas con lista publicada en la guía: ${url}`
          : `More homes with a published list are on the guide: ${url}`
      );
    }
  } else if (extraQuotable.length) {
    const h = extraQuotable[0];
    const parent = isSpanish ? listing.parentNameEs || listing.nameEs : listing.parentNameEn || listing.nameEn;
    if (isSpanish) {
      lines.push(
        `En ${city} no tenemos una lista completa de cuatro paquetes. Cerca, en ${parent}, sí hay cifras publicadas:`
      );
    } else {
      lines.push(
        `${city} does not have a complete four-package list in our files. Nearby in ${parent}, there are published figures:`
      );
    }
    const dated = isSpanish ? (h.gplDateEs ? ` (${h.gplDateEs})` : "") : h.gplDateEn ? ` (${h.gplDateEn})` : "";
    lines.push(`\n**${h.name}**${dated}`);
    lines.push(formatHomePackages(h, isSpanish, pkgId));
  } else {
    if (isSpanish) {
      lines.push(
        `En ${city} no ponemos precios con nombre de funeraria en la tabla: no hay una lista general de precios completa de cuatro paquetes (incluye un memorial después de cremación).`
      );
    } else {
      lines.push(
        `For ${city} we do not put named funeral-home prices on the chart: there is no complete four-package general price list (including a memorial after cremation).`
      );
    }
  }

  const uniqueContacts = [];
  const seenC = new Set();
  for (const h of home ? (isQuotable(home) ? [] : [home]) : contacts) {
    const k = fold(h.name);
    if (seenC.has(k)) continue;
    seenC.add(k);
    uniqueContacts.push(h);
  }
  if (uniqueContacts.length) {
    lines.push(
      isSpanish
        ? "\nFunerarias para pedir la lista vigente:"
        : "\nFuneral homes to call for the current list:"
    );
    uniqueContacts.slice(0, 6).forEach((h) => lines.push(contactLine(h, isSpanish)));
  }

  lines.push(`\n${isSpanish ? "Guía local" : "Local guide"}: ${url}`);
  lines.push(disclaimer(isSpanish));
  lines.push(insuranceClose(isSpanish));
  return lines.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
}

function answerFuneralCostQuestion(question, opts) {
  const isSpanish = Boolean(opts && opts.isSpanish);
  if (!isFuneralCostQuestion(question)) return null;
  const hay = searchHay(question, opts && opts.conversationContext);
  const picked = pickListing(hay);
  if (picked.ambiguous && Array.isArray(picked.ambiguous)) {
    return ambiguousAnswer(picked.ambiguous, isSpanish);
  }
  if (!picked.listing) return askCity(isSpanish);
  return answerForListing(picked.listing, picked.home, question, isSpanish);
}

module.exports = {
  isFuneralCostQuestion,
  isInsuranceCostQuestion,
  answerFuneralCostQuestion,
};
