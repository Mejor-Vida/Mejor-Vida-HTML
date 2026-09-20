/**
 * HTML fragments for the funeral-home directory (hub, state, city).
 */
const GPL_ROWS = require("./funeral-gpl-rows");

const US_STATES = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
  ["DC", "District of Columbia"],
];

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  if (!n) return "";
  return `$${Number(n).toLocaleString("en-US")}`;
}

function phoneTel(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `tel:+1${digits}` : "";
}

function hasCopiedPrices(home) {
  return (home.packages || []).some((p) => p.amt);
}

function sortHomes(homes) {
  return [...(homes || [])].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "en", { sensitivity: "base" })
  );
}

function kindLabel(kind, isEn) {
  const es = {
    gpl: "Precios publicados",
    fca: "Encuesta FCA",
    compiled: "Lista publicada",
    stateAverage: "Promedio estatal (no es la lista general de precios de esa casa)",
    published: "Lista publicada",
    none: "Lista no publicada en línea",
  };
  const en = {
    gpl: "Published prices",
    fca: "FCA survey",
    compiled: "Published list",
    stateAverage: "State average (not that home’s general price list)",
    published: "Published list",
    none: "General price list not posted online",
  };
  return (isEn ? en : es)[kind] || (isEn ? en.published : es.published);
}

function copy(isEn) {
  if (isEn) {
    return {
      eyebrow: "Funeral resource directory",
      h1: "Find funeral homes and prices near you",
      heroLead:
        "Search funeral homes, contact information, and published general price lists. This is one lookup page, not a separate URL for every city.",
      stateLabel: "Select your state",
      statePlaceholder: "Select your state",
      cityLabel: "City or town",
      cityPlaceholder: "City or town",
      find: "Search funeral homes",
      helper: "Select a state. If you do not know the city, search with the state only, then click a city.",
      crumbHub: "Funeral resources",
      crumbHubLong: "Funeral homes and cemeteries",
      cityH2: (city, state) => `Funeral homes in ${city}, ${state}`,
      stateH1: (name) => `Funeral homes in ${name}`,
      cityLead: "See contact information, websites, and published prices when they are available.",
      updated: (d) => `Last updated: ${d}`,
      found: (n, city, state) =>
        `${n} funeral home${n === 1 ? "" : "s"} found in ${city}, ${state}`,
      filterGpl: "Price list available",
      sortLabel: "Sort",
      sortAz: "Alphabetical A–Z",
      visit: "Visit website",
      call: "Call",
      seeGpl: "View general price list",
      address: "Address",
      phone: "Phone",
      site: "Official website",
      publishedHead: "Published prices",
      details: "See details",
      noGpl: "General price list not available online.",
      noGplAsk:
        "Contact the funeral home directly to request current pricing and service information.",
      thisHome: "At this home",
      extraPkg: "Other published packages",
      pkgNote:
        "Packages with the same name at different funeral homes do not include the same items.",
      empty:
        "We did not find funeral homes currently registered for this city.",
      emptyHint: "Search another nearby city or return to the state list.",
      emptyState: (name) => `We do not yet have funeral homes registered for ${name}.`,
      homes: "Funeral homes",
      cemeteries: "Cemeteries",
      other: "Other resources",
      guide: "Local final expense guide",
      localHomes: (town) => `Funeral homes in ${town}`,
      nearbyHomes: (parent) => `Other funeral homes in the ${parent} area`,
      areaHomes: (parent) => `Funeral homes gathered for the ${parent} area`,
      localCems: (town) => `Cemeteries in ${town}`,
      nearbyCems: (parent) => `Cemeteries in the ${parent} area`,
      areaCems: (parent) => `Cemeteries gathered for the ${parent} area`,
      browse: "States with directory data now",
      hubs: "City guides",
      extras: "Other cities",
      towns: "Nearby communities",
      moreState: (state) => `All ${state} funeral resources`,
      stateLead: (name) =>
        `Choose a city in ${name} to see funeral-home contacts and any published general price list.`,
      railTitle: "How would you pay for these expenses?",
      railBody:
        "Funeral costs can be a heavy burden for a family. Final expense insurance can help leave funds available for these and other expenses.",
      railCta: "See coverage options",
      railCalc: "Estimate final expenses",
      railTalk: "Talk with an agent",
      railTrust: "No-obligation guidance from a licensed insurance agent.",
      calcTitle: "How much might your family need?",
      calcBody:
        "Use our free calculator to estimate funeral costs and other obligations your family could face.",
      calcCta: "Calculate my final expenses",
      bandTitle: "Plan how to cover these expenses",
      bandBody:
        "Knowing the costs is the first step. Final expense insurance can provide funds your beneficiaries may use for funeral expenses and other needs, according to the policy terms.",
      bandQuote: "Get a free quote",
      bandCalc: "Use the calculator",
      bandSchedule: "Schedule a call",
      bandWhatsapp: "WhatsApp",
      bandSms: "Send a text",
      bandCall: "Call",
      julieAlt: "Licensed insurance agent for Mejor Vida Insurance",
      legalTitle: "NOTICE ABOUT FUNERAL INFORMATION AND PRICES",
    };
  }
  return {
    eyebrow: "Directorio de recursos funerarios",
    h1: "Encuentre funerarias y precios cerca de usted",
    heroLead:
      "Busque funerarias, contactos y listas generales de precios publicadas. Es una sola página de búsqueda, no una URL por ciudad.",
    stateLabel: "Seleccione su estado",
    statePlaceholder: "Seleccione su estado",
    cityLabel: "Ciudad o pueblo",
    cityPlaceholder: "Ciudad o pueblo",
    find: "Buscar funerarias",
    helper: "Seleccione un estado. Si no sabe la ciudad, busque solo con el estado y pulse una ciudad.",
    crumbHub: "Recursos funerarios",
    crumbHubLong: "Funerarias y cementerios",
    cityH2: (city, state) => `Funerarias en ${city}, ${state}`,
    stateH1: (name) => `Funerarias en ${name}`,
    cityLead: "Consulte información de contacto, sitios web y precios publicados disponibles.",
    updated: (d) => `Última actualización: ${d}`,
    found: (n, city, state) =>
      `${n} ${n === 1 ? "funeraria encontrada" : "funerarias encontradas"} en ${city}, ${state}`,
    filterGpl: "Lista de precios disponible",
    sortLabel: "Orden",
    sortAz: "Alfabético A–Z",
    visit: "Visitar sitio web",
    call: "Llamar",
    seeGpl: "Ver lista general de precios",
    address: "Dirección",
    phone: "Teléfono",
    site: "Sitio web oficial",
    publishedHead: "Precios publicados",
    details: "Ver detalles",
    noGpl: "Lista general de precios no disponible en línea.",
    noGplAsk:
      "Comuníquese directamente con la funeraria para solicitar información actualizada sobre precios y servicios.",
    thisHome: "En esta casa",
    extraPkg: "Otros paquetes publicados",
    pkgNote:
      "Un mismo nombre de paquete no incluye lo mismo de una funeraria a otra.",
    empty: "No encontramos funerarias registradas actualmente para esta ciudad.",
    emptyHint: "Busque otra ciudad cercana o vuelva a los resultados del estado.",
    emptyState: (name) => `Todavía no hay funerarias registradas para ${name}.`,
    homes: "Funerarias",
    cemeteries: "Cementerios",
    other: "Otros recursos",
    guide: "Guía local de gastos finales",
    localHomes: (town) => `Funerarias en ${town}`,
    nearbyHomes: (parent) => `Otras funerarias del área de ${parent}`,
    areaHomes: (parent) => `Funerarias reunidas para el área de ${parent}`,
    localCems: (town) => `Cementerios en ${town}`,
    nearbyCems: (parent) => `Cementerios del área de ${parent}`,
    areaCems: (parent) => `Cementerios reunidos para el área de ${parent}`,
    browse: "Estados con datos ahora",
    hubs: "Guías de ciudad",
    extras: "Otras ciudades",
    towns: "Comunidades cercanas",
    moreState: (state) => `Todos los recursos funerarios de ${state}`,
    stateLead: (name) =>
      `Elija una ciudad en ${name} para ver contactos de funerarias y la lista general de precios publicada, si la hay.`,
    railTitle: "¿Cómo pagaría estos gastos?",
    railBody:
      "Los gastos funerarios pueden representar una carga importante para una familia. El seguro de gastos finales puede ayudar a dejar fondos disponibles para estos y otros gastos.",
    railCta: "Ver opciones de cobertura",
    railCalc: "Calcular gastos finales",
    railTalk: "Hablar con una agente",
    railTrust: "Orientación sin compromiso con una agente de seguros con licencia.",
    calcTitle: "¿Cuánto podría necesitar su familia?",
    calcBody:
      "Use nuestra calculadora gratuita para estimar gastos funerarios y otras obligaciones que su familia podría enfrentar.",
    calcCta: "Calcular mis gastos finales",
    bandTitle: "Planifique cómo cubrir estos gastos",
    bandBody:
      "Conocer los costos es el primer paso. El seguro de gastos finales puede proporcionar fondos que sus beneficiarios pueden utilizar para gastos funerarios y otras necesidades, según los términos de la póliza.",
    bandQuote: "Obtener una cotización gratis",
    bandCalc: "Usar la calculadora",
    bandSchedule: "Programar una llamada",
    bandWhatsapp: "WhatsApp",
    bandSms: "Enviar mensaje de texto",
    bandCall: "Llamar",
    julieAlt: "Agente de seguros con licencia de Mejor Vida Seguros",
    legalTitle: "AVISO SOBRE INFORMACIÓN Y PRECIOS FUNERARIOS",
  };
}

function listingLead(listing, isEn) {
  const city = isEn ? listing.nameEn : listing.nameEs;
  const state = listing.stateNameEn || listing.stateNameEs;
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
      ? `Contacts for ${city}, ${state}, plus published prices when the funeral home posts a general price list. Mejor Vida Insurance copies dollar amounts only from that home’s own published list.`
      : `Contactos de ${city}, ${state}, y precios publicados cuando la funeraria muestra una lista general de precios. Mejor Vida Seguros solo copia cifras de la lista publicada de esa casa.`;
  }
  return isEn
    ? `Funeral homes, cemeteries, and published general price list packages for ${city}, ${state}. Contact the business directly. This is a resource list, not an insurance lesson.`
    : `Funerarias, cementerios y paquetes de la lista general de precios publicados para ${city}, ${state}. Contacte al negocio directamente. Esto es un directorio, no una lección de seguros.`;
}

function displayHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return String(url || "")
      .replace(/^https?:\/\/(www\.)?/, "")
      .replace(/\/$/, "");
  }
}

function gplUrl(home) {
  return home.gplHref || "";
}

function siteUrl(home) {
  if (!home.href) return "";
  if (home.gplHref && home.href === home.gplHref) return home.href;
  return home.href;
}

function pkgDetails(pkg, row, isEn, t) {
  const mean = isEn ? row.meanEn : row.meanEs;
  const note = pkg ? (isEn ? pkg.noteEn : pkg.noteEs) : "";
  return `<div class="mvi-fhdir__pkg-body">
<p>${esc(mean)}</p>
${note ? `<p class="mvi-fhdir__homenote"><span>${esc(t.thisHome)}:</span> ${esc(note)}</p>` : ""}
</div>`;
}

function publishedPriceList(home, isEn) {
  const t = copy(isEn);
  const byId = new Map((home.packages || []).map((p) => [p.id, p]));
  const lockedIds = new Set(GPL_ROWS.map((r) => r.id));
  const rows = GPL_ROWS.map((row) => {
    const pkg = byId.get(row.id);
    const amt = pkg && pkg.amt ? money(pkg.amt) : "";
    const label = isEn ? row.labelEn : row.labelEs;
    if (!amt) {
      return `<details class="mvi-fhdir__pkg mvi-fhdir__pkg--na">
<summary><span>${esc(label)}</span><span class="mvi-fhdir__pkg-amt mvi-fhdir__pkg-amt--na">${esc(isEn ? "Not on this published list" : "No figura en esta lista")}</span></summary>
${pkgDetails(pkg, row, isEn, t)}
</details>`;
    }
    return `<details class="mvi-fhdir__pkg">
<summary><span>${esc(label)}</span><span class="mvi-fhdir__pkg-amt">${amt}</span></summary>
${pkgDetails(pkg, row, isEn, t)}
</details>`;
  }).join("");
  const extras = (home.packages || []).filter((p) => p.amt && !lockedIds.has(p.id));
  const extraHtml = extras.length
    ? `<p class="mvi-fhdir__extra-label">${esc(t.extraPkg)}</p>${extras
        .map((p) => {
          const label = isEn ? p.labelEn : p.labelEs;
          const note = isEn ? p.noteEn : p.noteEs;
          return `<details class="mvi-fhdir__pkg">
<summary><span>${esc(label)}</span><span class="mvi-fhdir__pkg-amt">${money(p.amt)}</span></summary>
${note ? `<div class="mvi-fhdir__pkg-body"><p class="mvi-fhdir__homenote">${esc(note)}</p></div>` : ""}
</details>`;
        })
        .join("")}`
    : "";
  const kind = kindLabel(home.gplKind, isEn);
  const date = isEn ? home.gplDateEn : home.gplDateEs;
  const source = isEn ? home.sourceEn : home.sourceEs;
  return `<div class="mvi-fhdir__prices">
<p class="mvi-fhdir__gpl-kicker">${esc(t.publishedHead)}${date ? ` · ${esc(date)}` : ""}</p>
<p class="mvi-fhdir__kind-line">${esc(kind)}</p>
${rows}
${extraHtml}
<p class="mvi-fhdir__pkg-note">${esc(t.pkgNote)}</p>
${source ? `<p class="mvi-fhdir__source">${esc(source)}</p>` : ""}
</div>`;
}

function funeralHomeCard(home, isEn) {
  const t = copy(isEn);
  const copied = hasCopiedPrices(home);
  const site = siteUrl(home);
  const gpl = gplUrl(home) || (copied ? home.href : "");
  const tel = phoneTel(home.phone);
  const actions = [];
  if (site) {
    actions.push(
      `<a class="mvi-fhdir__btn mvi-fhdir__btn--ghost" href="${esc(site)}" rel="noopener" target="_blank">${esc(t.visit)}</a>`
    );
  }
  if (tel) {
    actions.push(`<a class="mvi-fhdir__btn mvi-fhdir__btn--ghost" href="${esc(tel)}">${esc(t.call)}</a>`);
  }
  if (gpl) {
    actions.push(
      `<a class="mvi-fhdir__btn mvi-fhdir__btn--outline" href="${esc(gpl)}" rel="noopener" target="_blank">${esc(t.seeGpl)}</a>`
    );
  }
  const addr = home.address
    ? `<div><dt>${esc(t.address)}</dt><dd><address>${esc(home.address)}</address></dd></div>`
    : "";
  const phone = home.phone
    ? `<div><dt>${esc(t.phone)}</dt><dd><a href="${esc(tel)}">${esc(home.phone)}</a></dd></div>`
    : "";
  const web = site
    ? `<div><dt>${esc(t.site)}</dt><dd><a href="${esc(site)}" rel="noopener" target="_blank">${esc(displayHost(site))}</a></dd></div>`
    : "";
  const prices = copied
    ? publishedPriceList(home, isEn)
    : `<div class="mvi-fhdir__nogpl">
<p><strong>${esc(t.noGpl)}</strong></p>
<p>${esc(t.noGplAsk)}</p>
</div>`;
  return `<article class="mvi-fhdir__card" data-fhdir-home data-has-gpl="${copied ? "1" : "0"}">
<h3>${esc(home.name)}</h3>
<dl class="mvi-fhdir__contact">
${addr}${phone}${web}
</dl>
${actions.length ? `<div class="mvi-fhdir__actions">${actions.join("")}</div>` : ""}
${prices}
</article>`;
}

function renderCem(c, isEn) {
  const note = isEn ? c.noteEn : c.noteEs;
  const tel = phoneTel(c.phone);
  const phoneHtml = c.phone && tel ? `<a href="${esc(tel)}">${esc(c.phone)}</a>` : "";
  return `<article class="mvi-fhdir__card mvi-fhdir__card--cem">
<h3>${esc(c.name)}</h3>
${c.address ? `<address class="mvi-fhdir__meta">${esc(c.address)}</address>` : ""}
${phoneHtml ? `<p class="mvi-fhdir__meta">${phoneHtml}</p>` : ""}
${note ? `<p class="mvi-fhdir__source">${esc(note)}</p>` : ""}
</article>`;
}

function homeSection(title, homes, isEn) {
  const list = sortHomes(homes);
  if (!list.length) return "";
  return `<section class="mvi-fhdir__section"><h2>${esc(title)}</h2>${list.map((h) => funeralHomeCard(h, isEn)).join("")}</section>`;
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
    bits.push(
      `<a href="${esc(o.href)}" rel="noopener" target="_blank">${esc(isEn ? o.nameEn : o.nameEs)}</a>`
    );
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

function locationBreadcrumbs(listing, isEn, hubHref, stateHref) {
  const t = copy(isEn);
  const city = isEn ? listing.nameEn : listing.nameEs;
  const state = listing.stateNameEn || listing.stateNameEs;
  return crumbs([
    { href: hubHref, label: t.crumbHub },
    { href: stateHref, label: state },
    { label: city },
  ]);
}

function uniqueHomes(listing) {
  const homes = [...(listing.localHomes || []), ...(listing.nearbyHomes || [])];
  const seen = new Set();
  return homes.filter((h) => {
    const key = h.id || h.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function emptyState(isEn, stateHref, stateName) {
  const t = copy(isEn);
  return `<div class="mvi-fhdir__empty" data-fhdir-empty>
<p><strong>${esc(t.empty)}</strong></p>
<p>${esc(t.emptyHint)}</p>
${stateHref ? `<p><a href="${esc(stateHref)}">${esc(t.moreState(stateName))}</a></p>` : ""}
</div>`;
}

function funeralInsuranceSidebar(isEn, ctx) {
  const t = copy(isEn);
  const img = ctx.asset
    ? `<div class="mvi-fhdir__rail-photo">
<picture>
<source type="image/webp" srcset="${esc(ctx.asset)}img/opt/julie-headshot.webp"/>
<img src="${esc(ctx.asset)}img/opt/julie-headshot.png" width="80" height="80" alt="${esc(t.julieAlt)}" loading="lazy" decoding="async"/>
</picture>
</div>`
    : "";
  return `<aside class="mvi-fhdir__rail" aria-label="${esc(t.railTitle)}">
<div class="mvi-fhdir__rail-card">
${img}
<h2>${esc(t.railTitle)}</h2>
<p>${esc(t.railBody)}</p>
<a class="mvi-fhdir__btn mvi-fhdir__btn--gold" href="${esc(ctx.quoteHref)}">${esc(t.railCta)}</a>
<div class="mvi-fhdir__rail-links">
<a href="${esc(ctx.estimatorHref)}">${esc(t.railCalc)}</a>
<a href="${esc(ctx.scheduleHref)}">${esc(t.railTalk)}</a>
</div>
<p class="mvi-fhdir__rail-trust">${esc(t.railTrust)}</p>
</div>
<div class="mvi-fhdir__rail-card mvi-fhdir__rail-card--calc">
<h2>${esc(t.calcTitle)}</h2>
<p>${esc(t.calcBody)}</p>
<a class="mvi-fhdir__btn mvi-fhdir__btn--outline" href="${esc(ctx.estimatorHref)}">${esc(t.calcCta)}</a>
</div>
</aside>`;
}

function funeralInsuranceCTA(isEn, ctx) {
  const t = copy(isEn);
  return `<section class="mvi-fhdir__band" aria-labelledby="fhdir-band-title">
<div class="mvi-fhdir__band-inner">
<h2 id="fhdir-band-title">${esc(t.bandTitle)}</h2>
<p>${esc(t.bandBody)}</p>
<div class="mvi-fhdir__band-actions">
<a class="mvi-fhdir__btn mvi-fhdir__btn--gold" href="${esc(ctx.quoteHref)}">${esc(t.bandQuote)}</a>
<a class="mvi-fhdir__btn mvi-fhdir__btn--ghost-light" href="${esc(ctx.estimatorHref)}">${esc(t.bandCalc)}</a>
<a class="mvi-fhdir__btn mvi-fhdir__btn--ghost-light" href="${esc(ctx.scheduleHref)}">${esc(t.bandSchedule)}</a>
<a class="mvi-fhdir__btn mvi-fhdir__btn--ghost-light" href="${esc(ctx.whatsappHref)}" rel="noopener" target="_blank">${esc(t.bandWhatsapp)}</a>
<a class="mvi-fhdir__btn mvi-fhdir__btn--ghost-light" href="${esc(ctx.smsHref)}">${esc(t.bandSms)}</a>
<a class="mvi-fhdir__btn mvi-fhdir__btn--ghost-light" href="${esc(ctx.phoneHref)}">${esc(t.bandCall)}</a>
</div>
</div>
</section>`;
}

function funeralDirectoryDisclaimer(isEn) {
  const t = copy(isEn);
  if (isEn) {
    return `<aside class="mvi-fhdir__legal" role="note">
<h2>${esc(t.legalTitle)}</h2>
<p>Mejor Vida Insurance provides this directory for informational purposes only. Funeral home, service, and price information is gathered from general price lists (GPLs), websites, and other public sources when they are available. Prices, services, and terms may change without notice, and the information shown may not represent the total cost of funeral arrangements.</p>
<p>Cemeteries, burial plots, opening and closing, death certificates, flowers, obituaries, clergy, transportation, merchandise, and other third-party services or charges may add extra cost.</p>
<p>Always confirm prices, services, and terms directly with the funeral home before making a decision.</p>
<p>Inclusion of a funeral home in this directory is not a recommendation, ranking, or endorsement by Mejor Vida Insurance. Mejor Vida Insurance is not affiliated with the listed funeral homes unless expressly stated otherwise.</p>
<p>Insurance information is provided separately. Availability, eligibility, benefits, costs, and terms of a policy depend on the insurance company, the product, the state, and individual circumstances.</p>
</aside>`;
  }
  return `<aside class="mvi-fhdir__legal" role="note">
<h2>${esc(t.legalTitle)}</h2>
<p>Mejor Vida Insurance proporciona este directorio únicamente con fines informativos. La información de funerarias, servicios y precios se obtiene de listas generales de precios (GPL), sitios web y otras fuentes públicas cuando están disponibles. Los precios, servicios y condiciones pueden cambiar sin previo aviso y la información mostrada puede no representar el costo total de los arreglos funerarios.</p>
<p>Cementerios, parcelas, apertura y cierre de sepultura, certificados de defunción, flores, obituarios, clero, transporte, productos y otros servicios o cargos de terceros pueden tener costos adicionales.</p>
<p>Confirme siempre los precios, servicios y condiciones directamente con la funeraria antes de tomar una decisión.</p>
<p>La inclusión de una funeraria en este directorio no constituye una recomendación, clasificación ni respaldo por parte de Mejor Vida Insurance. Mejor Vida Insurance no está afiliada con las funerarias listadas, salvo que se indique expresamente lo contrario.</p>
<p>La información sobre seguros se proporciona por separado. La disponibilidad, elegibilidad, beneficios, costos y condiciones de una póliza dependen de la compañía aseguradora, el producto, el estado y las circunstancias individuales.</p>
</aside>`;
}

function resultsToolbar(isEn, count, city, state) {
  const t = copy(isEn);
  return `<div class="mvi-fhdir__toolbar">
<p class="mvi-fhdir__count" data-fhdir-count>${esc(t.found(count, city, state))}</p>
<div class="mvi-fhdir__filters">
<label class="mvi-fhdir__filter">
<input type="checkbox" data-fhdir-gpl-filter/>
<span>${esc(t.filterGpl)}</span>
</label>
<p class="mvi-fhdir__sort">${esc(t.sortAz)}</p>
</div>
</div>`;
}

function listingBody(listing, isEn, hubHref, stateHref, ctx) {
  const t = copy(isEn);
  const city = isEn ? listing.nameEn : listing.nameEs;
  const state = listing.stateNameEn || listing.stateNameEs;
  const parent = isEn ? listing.parentNameEn : listing.parentNameEs;
  const isTown = listing.kind === "town";
  const homes = uniqueHomes(listing);
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
  if (!homes.length) {
    homesHtml = emptyState(isEn, stateHref, state);
  }
  const heading =
    listing.kind === "town"
      ? isEn
        ? `Funeral homes near ${city}, ${state}`
        : `Funerarias cerca de ${city}, ${state}`
      : t.cityH2(city, state);
  return `<div class="mvi-fhdir__layout">
<div class="mvi-fhdir__main">
${locationBreadcrumbs(listing, isEn, hubHref, stateHref)}
<header class="mvi-fhdir__placehead">
<h1>${esc(heading)}</h1>
<p class="mvi-fhdir__lede">${esc(t.cityLead)}</p>
<p class="mvi-fhdir__lede mvi-fhdir__lede--seo">${esc(listingLead(listing, isEn))}</p>
${ctx && ctx.updated ? `<p class="mvi-fhdir__updated">${esc(t.updated(ctx.updated))}</p>` : ""}
</header>
${homes.length ? resultsToolbar(isEn, homes.length, city, state) : ""}
<div data-fhdir-home-list>
${homesHtml}
</div>
${cemsHtml}
${listingLinks(listing, isEn)}
</div>
${ctx ? funeralInsuranceSidebar(isEn, ctx) : ""}
</div>`;
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
  if (extras.length)
    html += `<div class="mvi-fhdir__group"><h3>${esc(t.extras)}</h3>${listingPills(extras, isEn)}</div>`;
  if (towns.length)
    html += `<div class="mvi-fhdir__group"><h3>${esc(t.towns)}</h3>${listingPills(towns, isEn)}</div>`;
  return html;
}

function hubBrowseHtml(data, isEn) {
  const t = copy(isEn);
  return `<div class="mvi-fhdir__browse">
<h2>${esc(t.browse)}</h2>
${data.states
  .map((st) => {
    const href = isEn ? st.pathEn : st.pathEs;
    const name = st.nameEn || st.nameEs;
    const inState = data.listings.filter((l) => l.stateCode === st.code);
    return `<div class="mvi-fhdir__state" data-fhdir-browse-state="${esc(st.code)}"><h3><a href="${esc(href)}">${esc(name)}</a></h3>${stateGroupsHtml(inState, isEn)}</div>`;
  })
  .join("")}
</div>`;
}

function stateBody(state, listings, isEn, hubHref, ctx) {
  const t = copy(isEn);
  const name = state.nameEn || state.nameEs;
  return `${crumbs([{ href: hubHref, label: t.crumbHub }, { label: name }])}
<header class="mvi-fhdir__placehead">
<h1>${esc(t.stateH1(name))}</h1>
</header>
<p class="mvi-fhdir__lede">${esc(t.stateLead(name))}</p>
${ctx && ctx.updated ? `<p class="mvi-fhdir__updated">${esc(t.updated(ctx.updated))}</p>` : ""}
<div class="mvi-fhdir__state-cities">
${stateGroupsHtml(listings, isEn)}
</div>`;
}

function stateSelectHtml(isEn, selectedCode, selectId) {
  const t = copy(isEn);
  const opts = US_STATES.map(([code, name]) => {
    const label = name;
    const sel = code === selectedCode ? " selected" : "";
    return `<option value="${esc(code)}"${sel}>${esc(label)}</option>`;
  }).join("");
  return `<label class="mvi-fhdir__field">
<span class="visually-hidden">${esc(t.stateLabel)}</span>
<select id="${esc(selectId)}" name="state" data-fhdir-state>
<option value="">${esc(t.statePlaceholder)}</option>
${opts}
</select>
</label>`;
}

function funeralSearchHero(isEn, opts) {
  const t = copy(isEn);
  const inputId = opts.inputId;
  const selected = opts.stateCode || "";
  const cityVal = opts.cityName || "";
  const showH1 = opts.headingLevel === 1;
  const titleTag = showH1 ? "h1" : "p";
  const titleClass = showH1 ? "" : ' class="mvi-fhdir__hero-title"';
  return `<div class="mvi-fhdir__hero">
<div class="container">
<p class="mvi-fhdir__eyebrow">${esc(t.eyebrow)}</p>
<${titleTag}${titleClass}>${esc(t.h1)}</${titleTag}>
<p class="mvi-fhdir__hero-lead">${esc(t.heroLead)}</p>
<div class="mvi-fhdir__panel">
<form class="mvi-fhdir__form" data-fhdir-form role="search">
${stateSelectHtml(isEn, selected, `${inputId}-state`)}
<label class="mvi-fhdir__field mvi-fhdir__field--grow">
<span class="visually-hidden">${esc(t.cityLabel)}</span>
<input id="${esc(inputId)}" type="search" name="q" autocomplete="off" placeholder="${esc(t.cityPlaceholder)}" value="${esc(cityVal)}" data-fhdir-input/>
</label>
<button type="submit">${esc(t.find)}</button>
</form>
<ul class="mvi-fhdir__suggest" data-fhdir-suggest hidden></ul>
<p class="mvi-fhdir__helper">${esc(t.helper)}</p>
<p class="mvi-fhdir__status" data-fhdir-status role="status"></p>
</div>
</div>
</div>`;
}

function searchPanel(isEn, inputId) {
  return funeralSearchHero(isEn, { inputId, headingLevel: 1 });
}

function ctaHtml(isEn, quoteHref, scheduleHref) {
  return funeralInsuranceCTA(isEn, {
    quoteHref,
    scheduleHref,
    estimatorHref: quoteHref.replace(/quote\.html$/, "final-expense-estimator.html"),
    whatsappHref: isEn
      ? "https://wa.me/14024405438?text=Hi%2C%20I%20want%20a%20free%20final%20expense%20insurance%20quote."
      : "https://wa.me/14024405438?text=Hola%2C%20quiero%20una%20cotizaci%C3%B3n%20gratis%20de%20seguro%20de%20gastos%20finales.",
    smsHref: isEn
      ? "sms:+14028441199?body=Hi%20Julie%2C%20I%20have%20questions%20about%20my%20quote."
      : "sms:+14028441199?body=Hola%20Julie%2C%20tengo%20preguntas%20sobre%20mi%20cotizaci%C3%B3n.",
    phoneHref: "tel:+14024405438",
  });
}

function legalHtml(isEn) {
  return funeralDirectoryDisclaimer(isEn);
}

function listingJsonLd(listing, canonical, isEn) {
  const name = isEn ? listing.nameEn : listing.nameEs;
  const state = listing.stateNameEn || listing.stateNameEs;
  const homes = uniqueHomes(listing);
  const itemList = homes.map((h, i) => ({
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

module.exports = {
  US_STATES,
  esc,
  copy,
  listingLead,
  listingBody,
  hubBrowseHtml,
  stateBody,
  searchPanel,
  funeralSearchHero,
  ctaHtml,
  listingJsonLd,
  legalHtml,
  funeralInsuranceCTA,
  funeralDirectoryDisclaimer,
};
