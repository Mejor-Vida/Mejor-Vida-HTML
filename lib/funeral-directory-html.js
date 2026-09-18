/**
 * HTML fragments for the funeral-home directory (hub, state, city).
 */
const { funeralDirectoryCompareNote } = require("./company-compare-disclaimer");
const GPL_ROWS = require("./funeral-gpl-rows");

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  if (!n) return "—";
  return `$${Number(n).toLocaleString("en-US")}`;
}

function telHref(phone) {
  return `tel:+1${String(phone || "").replace(/\D/g, "")}`;
}

function kindLabel(kind, isEn) {
  const es = {
    gpl: "Lista general de precios",
    fca: "Encuesta FCA",
    compiled: "Lista publicada",
    stateAverage: "Promedio estatal (no es la lista general de precios de esa casa)",
    published: "Lista publicada",
    none: "Pida la lista general de precios",
  };
  const en = {
    gpl: "General price list",
    fca: "FCA survey",
    compiled: "Published list",
    stateAverage: "State average (not that home’s general price list)",
    published: "Published list",
    none: "Ask for the general price list",
  };
  return (isEn ? en : es)[kind] || (isEn ? en.published : es.published);
}

function copy(isEn) {
  if (isEn) {
    return {
      homes: "Funeral homes",
      cemeteries: "Cemeteries",
      other: "Other resources",
      pkg: "Package",
      price: "Published price",
      site: "Website",
      address: "Address",
      phone: "Phone",
      gplSee: "Open the published general price list",
      guide: "Local final expense guide",
      noPhone: "Ask for the phone number on their site or in the local guide.",
      noGpl: "Ask the funeral home for its current general price list. That list is the only official price.",
      gplHead: "Published general price list",
      gplAskHead: "Ask this home for these general price list items",
      askLine: "Ask this home",
      mean: "What this line covers",
      thisHome: "At this home",
      extraPkg: "Other published packages",
      localHomes: (town) => `Funeral homes in ${town}`,
      nearbyHomes: (parent) => `Other funeral homes in the ${parent} area`,
      areaHomes: (parent) => `Funeral homes gathered for the ${parent} area`,
      localCems: (town) => `Cemeteries in ${town}`,
      nearbyCems: (parent) => `Cemeteries in the ${parent} area`,
      areaCems: (parent) => `Cemeteries gathered for the ${parent} area`,
      crumbHub: "Funeral homes and cemeteries",
      find: "Look up",
      placeholder: "City or nearby town",
      ctaTitle: "Need a cash benefit for these bills?",
      ctaBody: "Mejor Vida Insurance compares final expense options. Official quotes are by phone.",
      ctaQuote: "Free quote",
      ctaSchedule: "Schedule a call",
      browse: "States and cities with data now",
      hubs: "City guides",
      extras: "Other cities",
      towns: "Nearby communities",
      moreState: (state) => `All ${state} funeral resources`,
    };
  }
  return {
    homes: "Funerarias",
    cemeteries: "Cementerios",
    other: "Otros recursos",
    pkg: "Paquete",
    price: "Precio publicado",
      site: "Sitio web",
      address: "Dirección",
      phone: "Teléfono",
      gplSee: "Abrir la lista general de precios publicada",
      guide: "Guía local de gastos finales",
      noPhone: "Pida el teléfono en su sitio o en la guía local.",
      noGpl: "Pida la lista general de precios vigente. La funeraria es la única fuente oficial.",
      gplHead: "Lista general de precios publicada",
      gplAskHead: "Pida estos renglones de la lista general de precios",
      askLine: "Pida esta línea",
      mean: "Qué cubre este renglón",
      thisHome: "En esta casa",
      extraPkg: "Otros paquetes publicados",
    localHomes: (town) => `Funerarias en ${town}`,
    nearbyHomes: (parent) => `Otras funerarias del área de ${parent}`,
    areaHomes: (parent) => `Funerarias reunidas para el área de ${parent}`,
    localCems: (town) => `Cementerios en ${town}`,
    nearbyCems: (parent) => `Cementerios del área de ${parent}`,
    areaCems: (parent) => `Cementerios reunidos para el área de ${parent}`,
    crumbHub: "Funerarias y cementerios",
    find: "Buscar",
    placeholder: "Ciudad o pueblo cercano",
      ctaTitle: "¿Necesita un beneficio en efectivo para estas cuentas?",
      ctaBody: "Mejor Vida Seguros compara opciones de gastos finales. Las cotizaciones oficiales son por teléfono.",
      ctaQuote: "Cotización gratuita",
      ctaSchedule: "Agendar una llamada",
    browse: "Estados y ciudades con datos ahora",
    hubs: "Guías de ciudad",
    extras: "Otras ciudades",
    towns: "Comunidades cercanas",
    moreState: (state) => `Todos los recursos funerarios de ${state}`,
  };
}

function listingLead(listing, isEn) {
  const city = isEn ? listing.nameEn : listing.nameEs;
  const state = isEn ? listing.stateNameEn : listing.stateNameEs;
  const parent = isEn ? listing.parentNameEn : listing.parentNameEs;
  if (listing.kind === "town") {
    const local = listing.localHomes.length;
    if (isEn) {
      if (local) {
        return `${city} is in the ${parent} area. Homes with an address in ${city} are listed first. The others are the funeral homes Mejor Vida Insurance gathered for the ${parent} guide.`;
      }
      return `${city} is in the ${parent} area. This list does not yet have a funeral home with a ${city} street address. The homes below are the ones gathered for ${parent}, which includes ${city}.`;
    }
    if (local) {
      return `${city} está en el área de ${parent}. Las casas con dirección en ${city} van primero. Las demás son las funerarias que Mejor Vida Seguros reunió para la guía de ${parent}.`;
    }
    return `${city} está en el área de ${parent}. Esta lista todavía no tiene una funeraria con sede en ${city}. Las casas abajo son las reunidas para ${parent}, que incluye ${city}.`;
  }
  const homes = [...(listing.localHomes || []), ...(listing.nearbyHomes || [])];
  const hasGpl = homes.some((h) => (h.packages || []).some((p) => p.amt));
  if (listing.kind === "extra") {
    if (hasGpl) {
      return isEn
        ? `Contacts and published general price list packages for ${city}, ${state}. A line that says “ask this home” was not on that funeral home’s published list.`
        : `Contactos y paquetes de la lista general de precios publicados para ${city}, ${state}. Si un renglón dice “pida esta línea”, esa casa no lo publicó.`;
    }
    return isEn
      ? `Contacts for ${city}, ${state}, plus the four general price list items to ask each funeral home for. Mejor Vida Insurance copies dollar amounts only from that home’s own published list.`
      : `Contactos de ${city}, ${state}, y los cuatro renglones de la lista general de precios que debe pedir a cada funeraria. Mejor Vida Seguros solo copia cifras de la lista publicada de esa casa.`;
  }
  return isEn
    ? `Funeral homes, cemeteries, and published general price list packages for ${city}, ${state}. Contact the business directly. This is a resource list, not an insurance lesson.`
    : `Funerarias, cementerios y paquetes de la lista general de precios publicados para ${city}, ${state}. Contacte al negocio directamente. Esto es un directorio, no una lección de seguros.`;
}

function contactRow(dt, dd) {
  if (!dd) return "";
  return `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;
}

function gplCell(pkg, row, isEn, t) {
  const note = pkg ? (isEn ? pkg.noteEn : pkg.noteEs) : "";
  const mean = isEn ? row.meanEn : row.meanEs;
  const label = isEn ? row.labelEn : row.labelEs;
  const amt = pkg && pkg.amt ? money(pkg.amt) : "";
  const amtHtml = amt
    ? `<td class="amt">${amt}</td>`
    : `<td class="amt amt--ask">${esc(t.askLine)}</td>`;
  return `<tr>
<td>
<strong>${esc(label)}</strong>
<div class="mvi-fhdir__mean">${esc(mean)}</div>
${note ? `<div class="mvi-fhdir__homenote"><span>${esc(t.thisHome)}:</span> ${esc(note)}</div>` : ""}
</td>
${amtHtml}
</tr>`;
}

function extraPkgRow(pkg, isEn) {
  const label = isEn ? pkg.labelEn : pkg.labelEs;
  const note = isEn ? pkg.noteEn : pkg.noteEs;
  return `<tr>
<td>
<strong>${esc(label)}</strong>
${note ? `<div class="mvi-fhdir__homenote">${esc(note)}</div>` : ""}
</td>
<td class="amt">${money(pkg.amt)}</td>
</tr>`;
}

function renderHome(home, isEn) {
  const t = copy(isEn);
  const source = isEn ? home.sourceEn : home.sourceEs;
  const date = isEn ? home.gplDateEn : home.gplDateEs;
  const kindClass =
    home.gplKind === "stateAverage"
      ? " mvi-fhdir__kind--avg"
      : home.gplKind === "none"
        ? " mvi-fhdir__kind--none"
        : "";
  const phoneHtml = home.phone
    ? `<a href="${telHref(home.phone)}">${esc(home.phone)}</a>`
    : esc(t.noPhone);
  const siteHtml = home.href
    ? `<a href="${esc(home.href)}" rel="noopener" target="_blank">${esc(home.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>`
    : "";
  const gplLink = home.gplHref
    ? `<a href="${esc(home.gplHref)}" rel="noopener" target="_blank">${esc(t.gplSee)}</a>`
    : "";
  const byId = new Map((home.packages || []).map((p) => [p.id, p]));
  const lockedIds = new Set(GPL_ROWS.map((r) => r.id));
  const hasCopied = (home.packages || []).some((p) => p.amt);
  const bodyRows = GPL_ROWS.map((row) => gplCell(byId.get(row.id), row, isEn, t)).join("");
  const extras = (home.packages || []).filter((p) => p.amt && !lockedIds.has(p.id));
  const extraHtml = extras.length
    ? `<p class="mvi-fhdir__extra-label">${esc(t.extraPkg)}</p>
<table class="mvi-fhdir__gpl mvi-fhdir__gpl--extra"><tbody>${extras.map((p) => extraPkgRow(p, isEn)).join("")}</tbody></table>`
    : "";
  const name = home.href
    ? `<a href="${esc(home.href)}" rel="noopener" target="_blank">${esc(home.name)}</a>`
    : esc(home.name);
  return `<article class="mvi-fhdir__card">
<h3>${name} <span class="mvi-fhdir__kind${kindClass}">${esc(kindLabel(home.gplKind, isEn))}${date ? ` · ${esc(date)}` : ""}</span></h3>
<dl class="mvi-fhdir__contact">
${contactRow(t.address, home.address ? esc(home.address) : "")}
${contactRow(t.phone, phoneHtml)}
${contactRow(t.site, siteHtml)}
</dl>
<p class="mvi-fhdir__gpl-kicker">${esc(hasCopied ? t.gplHead : t.gplAskHead)}</p>
<table class="mvi-fhdir__gpl"><thead><tr><th>${esc(t.pkg)}</th><th>${esc(t.price)}</th></tr></thead><tbody>${bodyRows}</tbody></table>
${extraHtml}
<p class="mvi-fhdir__source">${esc(source || t.noGpl)}${gplLink ? ` · ${gplLink}` : ""}</p>
</article>`;
}

function renderCem(c, isEn) {
  const note = isEn ? c.noteEn : c.noteEs;
  const phoneHtml = c.phone ? `<a href="${telHref(c.phone)}">${esc(c.phone)}</a>` : "";
  return `<article class="mvi-fhdir__card">
<h3>${esc(c.name)}</h3>
<p class="mvi-fhdir__meta">${esc(c.address || "")}${c.address && phoneHtml ? " · " : ""}${phoneHtml}</p>
${note ? `<p class="mvi-fhdir__source">${esc(note)}</p>` : ""}
</article>`;
}

function homeSection(title, homes, isEn) {
  if (!homes || !homes.length) return "";
  return `<section class="mvi-fhdir__section"><h2>${esc(title)}</h2>${homes.map((h) => renderHome(h, isEn)).join("")}</section>`;
}

function cemSection(title, cems, isEn) {
  if (!cems || !cems.length) return "";
  return `<section class="mvi-fhdir__section"><h2>${esc(title)}</h2>${cems.map((c) => renderCem(c, isEn)).join("")}</section>`;
}

function listingLinks(listing, isEn) {
  const t = copy(isEn);
  const guide = isEn ? listing.guideEn : listing.guideEs;
  const bits = [];
  if (guide) bits.push(`<a href="${esc(guide)}">${esc(t.guide)}</a>`);
  (listing.other || []).forEach((o) => {
    bits.push(`<a href="${esc(o.href)}" rel="noopener" target="_blank">${esc(isEn ? o.nameEn : o.nameEs)}</a>`);
  });
  if (!bits.length) return "";
  return `<div class="mvi-fhdir__links">${bits.join("")}</div>`;
}

function crumbs(items) {
  return `<nav class="mvi-fhdir__crumb" aria-label="breadcrumb"><ol>${items
    .map((item, i) => {
      const last = i === items.length - 1;
      if (last || !item.href) return `<li aria-current="page">${esc(item.label)}</li>`;
      return `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`;
    })
    .join("")}</ol></nav>`;
}

function listingBody(listing, isEn, hubHref, stateHref, cta) {
  const t = copy(isEn);
  const city = isEn ? listing.nameEn : listing.nameEs;
  const state = isEn ? listing.stateNameEn : listing.stateNameEs;
  const parent = isEn ? listing.parentNameEn : listing.parentNameEs;
  const isTown = listing.kind === "town";
  let homesHtml = "";
  let cemsHtml = "";
  if (isTown) {
    homesHtml =
      homeSection(t.localHomes(city), listing.localHomes, isEn) +
      homeSection(
        listing.localHomes.length ? t.nearbyHomes(parent) : t.areaHomes(parent),
        listing.nearbyHomes,
        isEn
      );
    cemsHtml =
      cemSection(t.localCems(city), listing.localCemeteries, isEn) +
      cemSection(
        listing.localCemeteries.length ? t.nearbyCems(parent) : t.areaCems(parent),
        listing.nearbyCemeteries,
        isEn
      );
  } else {
    homesHtml = homeSection(t.homes, listing.localHomes, isEn);
    cemsHtml = cemSection(t.cemeteries, listing.localCemeteries, isEn);
  }
  const ctaBlock =
    cta && cta.quoteHref
      ? ctaHtml(isEn, cta.quoteHref, cta.scheduleHref)
      : "";
  return `${crumbs([
    { href: hubHref, label: t.crumbHub },
    { href: stateHref, label: state },
    { label: city },
  ])}
<p class="mvi-fhdir__lede">${esc(listingLead(listing, isEn))}</p>
${homesHtml}
${ctaBlock}
${cemsHtml}
${listingLinks(listing, isEn)}`;
}

function groupListings(listings) {
  const hubs = listings.filter((l) => l.kind === "hub");
  const extras = listings.filter((l) => l.kind === "extra");
  const towns = listings.filter((l) => l.kind === "town");
  return { hubs, extras, towns };
}

function listingPills(listings, isEn) {
  return `<ul class="mvi-fhdir__pills">${listings
    .map((l) => {
      const href = isEn ? l.pathEn : l.pathEs;
      const name = isEn ? l.nameEn : l.nameEs;
      return `<li><a href="${esc(href)}">${esc(name)}</a></li>`;
    })
    .join("")}</ul>`;
}

function stateGroupsHtml(listings, isEn) {
  const t = copy(isEn);
  const { hubs, extras, towns } = groupListings(listings);
  let html = "";
  if (hubs.length) html += `<div class="mvi-fhdir__group"><h3>${esc(t.hubs)}</h3>${listingPills(hubs, isEn)}</div>`;
  if (extras.length) html += `<div class="mvi-fhdir__group"><h3>${esc(t.extras)}</h3>${listingPills(extras, isEn)}</div>`;
  if (towns.length) html += `<div class="mvi-fhdir__group"><h3>${esc(t.towns)}</h3>${listingPills(towns, isEn)}</div>`;
  return html;
}

function hubBrowseHtml(data, isEn) {
  const t = copy(isEn);
  return `<div class="mvi-fhdir__browse">
<h2>${esc(t.browse)}</h2>
${data.states
  .map((st) => {
    const href = isEn ? st.pathEn : st.pathEs;
    const name = isEn ? st.nameEn : st.nameEs;
    const inState = data.listings.filter((l) => l.stateCode === st.code);
    return `<div class="mvi-fhdir__state"><h3><a href="${esc(href)}">${esc(name)}</a></h3>${stateGroupsHtml(inState, isEn)}</div>`;
  })
  .join("")}
</div>`;
}

function stateBody(state, listings, isEn, hubHref) {
  const t = copy(isEn);
  const name = isEn ? state.nameEn : state.nameEs;
  const lead = isEn
    ? `Search a city in ${name} for funeral-home contacts and any published general price list.`
    : `Busque una ciudad en ${name} para ver contactos de funerarias y la lista general de precios publicada, si la hay.`;
  return `${crumbs([{ href: hubHref, label: t.crumbHub }, { label: name }])}
<p class="mvi-fhdir__lede">${esc(lead)}</p>`;
}

function searchPanel(isEn, inputId) {
  const t = copy(isEn);
  return `<div class="mvi-fhdir__panel">
<form class="mvi-fhdir__form" data-fhdir-form>
<label class="visually-hidden" for="${inputId}">${esc(t.placeholder)}</label>
<input id="${inputId}" type="search" name="q" autocomplete="off" placeholder="${esc(t.placeholder)}" data-fhdir-input/>
<button type="submit">${esc(t.find)}</button>
</form>
<ul class="mvi-fhdir__suggest" data-fhdir-suggest hidden></ul>
<p class="mvi-fhdir__status" data-fhdir-status role="status"></p>
</div>`;
}

function ctaHtml(isEn, quoteHref, scheduleHref) {
  const t = copy(isEn);
  const schedule = scheduleHref
    ? `<a class="btn btn-outline-light" href="${esc(scheduleHref)}">${esc(t.ctaSchedule)}</a>`
    : "";
  return `<div class="mvi-fhdir__cta">
<h2>${esc(t.ctaTitle)}</h2>
<p>${esc(t.ctaBody)}</p>
<div class="mvi-fhdir__cta-actions">
<a class="btn btn-primary-gold" href="${esc(quoteHref)}">${esc(t.ctaQuote)}</a>
${schedule}
</div>
</div>`;
}

function listingJsonLd(listing, canonical, isEn) {
  const name = isEn ? listing.nameEn : listing.nameEs;
  const state = isEn ? listing.stateNameEn : listing.stateNameEs;
  const homes = [...(listing.localHomes || []), ...(listing.nearbyHomes || [])];
  const seen = new Set();
  const uniqueHomes = homes.filter((h) => {
    const key = h.id || h.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const itemList = uniqueHomes.map((h, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "FuneralHome",
      name: h.name,
      url: h.href || undefined,
      telephone: h.phone || undefined,
      address: h.address
        ? {
            "@type": "PostalAddress",
            streetAddress: h.address,
            addressLocality: name,
            addressRegion: listing.stateCode,
            addressCountry: "US",
          }
        : undefined,
    },
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: isEn
          ? `Funeral homes and cemeteries ${listing.kind === "town" ? "near" : "in"} ${name}, ${state}`
          : `Funerarias y cementerios ${listing.kind === "town" ? "cerca de" : "en"} ${name}, ${state}`,
        url: canonical,
        inLanguage: isEn ? "en-US" : "es-US",
        about: { "@type": "Place", name: `${name}, ${listing.stateCode}` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: isEn ? "Funeral homes and cemeteries" : "Funerarias y cementerios",
            item: isEn
              ? "https://www.mejorvidainsurance.com/en/funeral-homes-cemeteries.html"
              : "https://www.mejorvidainsurance.com/funerarias-cementerios.html",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: state,
            item: isEn
              ? `https://www.mejorvidainsurance.com/en/funeral-homes-cemeteries/${listing.stateSlug}.html`
              : `https://www.mejorvidainsurance.com/funerarias-cementerios/${listing.stateSlug}.html`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name,
            item: canonical,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: isEn
          ? `Funeral homes ${listing.kind === "town" ? "near" : "in"} ${name}`
          : `Funerarias ${listing.kind === "town" ? "cerca de" : "en"} ${name}`,
        numberOfItems: itemList.length,
        itemListElement: itemList,
      },
    ],
  };
}

function legalHtml(isEn) {
  return `<div class="mvi-fhdir__legal">${funeralDirectoryCompareNote(isEn ? "en" : "es")}</div>`;
}

module.exports = {
  esc,
  copy,
  listingLead,
  listingBody,
  hubBrowseHtml,
  stateBody,
  searchPanel,
  ctaHtml,
  listingJsonLd,
  legalHtml,
};
