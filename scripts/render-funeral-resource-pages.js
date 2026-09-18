#!/usr/bin/env node
/**
 * Funeral home + cemetery directory: hub, state, and city URLs (ES + EN).
 * Data: data/funeral-resources.json
 */
const fs = require("fs");
const path = require("path");
const { applyUsLocaleSignals } = require("../lib/us-locale-html");
const { writeFuneralResourceIndex } = require("../lib/funeral-resource-index");
const html = require("../lib/funeral-directory-html");

const ROOT = path.join(__dirname, "..");
const CSS_VER = "20260918-dir8";
const HEADER_ES = path.join(ROOT, "includes/site-header-inner.html");
const HEADER_EN = path.join(ROOT, "includes/en-site-header.html");
const FOOTER_ES = path.join(ROOT, "includes/site-footer-inner.html");
const FOOTER_EN = path.join(ROOT, "includes/en-site-footer.html");

function loadHeader(lang, depth, twinHref) {
  if (lang === "es") {
    const prefix = "../".repeat(depth);
    let header = fs.readFileSync(HEADER_ES, "utf8").replace(/__PREFIX__/g, prefix);
    header = header.replace(
      /(<a href=")\/en\/(" class="mvi-lang-fab)/,
      `$1${twinHref}$2`
    );
    return header;
  }
  let header = fs.readFileSync(HEADER_EN, "utf8");
  if (depth > 0) {
    const upSite = "../".repeat(depth + 1);
    const nest = "../".repeat(depth);
    header = header.replace(/((?:href|src|srcset)=")(\.\.\/)/g, `$1${upSite}`);
    header = header.replace(
      /((?:href|src|srcset)=")(?!https?:|\/|#|\.\.|tel:|mailto:|sms:)([^"]+)/g,
      `$1${nest}$2`
    );
  }
  header = header.replace(/(<a href=")[^"]+(" class="mvi-lang-fab)/, `$1${twinHref}$2`);
  return header;
}

function loadFooter(lang, depth) {
  if (lang === "es") {
    return fs.readFileSync(FOOTER_ES, "utf8").replace(/__PREFIX__/g, "../".repeat(depth));
  }
  const asset = "../".repeat(depth + 1);
  const page = "../".repeat(depth);
  return fs
    .readFileSync(FOOTER_EN, "utf8")
    .replace(/__ASSET__/g, asset)
    .replace(/__PAGE__/g, page);
}

function assetPrefix(lang, depth) {
  if (lang === "es") return "../".repeat(depth);
  return "../".repeat(depth + 1);
}

function quoteHref(lang, depth) {
  return `${"../".repeat(depth)}quote.html`;
}

function scheduleHref(lang, depth) {
  return `${"../".repeat(depth)}schedule-julie.html`;
}

function wrapPage({
  lang,
  depth,
  twinHref,
  canonical,
  alt,
  title,
  desc,
  h1,
  robots,
  jsonLd,
  body,
}) {
  const isEn = lang === "en";
  const asset = assetPrefix(lang, depth);
  const header = loadHeader(lang, depth, twinHref);
  const footer = loadFooter(lang, depth);
  const htmlLang = isEn ? "en-US" : "es-US";
  const htmlClass = isEn ? "lang-en" : "lang-es";
  const hreflang = isEn
    ? `<link href="${alt}" hreflang="es-US" rel="alternate"/>
<link href="${canonical}" hreflang="en-US" rel="alternate"/>`
    : `<link href="${canonical}" hreflang="es-US" rel="alternate"/>
<link href="${alt}" hreflang="en-US" rel="alternate"/>
<link href="${canonical}" hreflang="x-default" rel="alternate"/>`;
  const json = typeof jsonLd === "string" ? jsonLd : JSON.stringify(jsonLd);
  return applyUsLocaleSignals(`<!DOCTYPE html>
<html class="${htmlClass}" lang="${htmlLang}">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<meta name="robots" content="${robots}"/>
<link rel="canonical" href="${canonical}"/>
${hreflang}
<link href="${asset}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${asset}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${asset}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${asset}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${asset}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${asset}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${asset}css/funeral-resources.css?v=${CSS_VER}" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:url" content="${canonical}"/>
<script>(function(){document.documentElement.lang="${htmlLang}";document.documentElement.className="${htmlClass}";})();</script>
<script type="application/ld+json">${json}</script>
</head>
<body class="bg-light" style="font-family:'Inter',system-ui,sans-serif;">
${header}
<main>
${body}
</main>
${footer}
<script>document.getElementById('year') && (document.getElementById('year').textContent=new Date().getFullYear());</script>
<script defer src="${asset}bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="${asset}js/mvi-funnel-track.js?v=20260702e"></script>
<script defer src="${asset}js/mvi-ga4-funnel.js"></script>
<script defer src="${asset}script.js"></script>
<script defer src="${asset}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${asset}js/funeral-resources.js?v=${CSS_VER}"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${asset}js/website-assistant-widget.js"></script>
</body>
</html>`);
}

function writeBoth(relEs, relEn, esHtml, enHtml) {
  const outs = [
    [relEs, esHtml],
    [`sources/${relEs}`, esHtml],
    [relEn, enHtml],
    [`sources/${relEn}`, enHtml],
  ];
  outs.forEach(([rel, contents]) => {
    const abs = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, contents, "utf8");
  });
}

function rmNested(dir) {
  const abs = path.join(ROOT, dir);
  if (fs.existsSync(abs)) fs.rmSync(abs, { recursive: true, force: true });
}

function hubPage(lang, data) {
  const isEn = lang === "en";
  const canonical = isEn
    ? "https://www.mejorvidainsurance.com/en/funeral-homes-cemeteries.html"
    : "https://www.mejorvidainsurance.com/funerarias-cementerios.html";
  const alt = isEn
    ? "https://www.mejorvidainsurance.com/funerarias-cementerios.html"
    : "https://www.mejorvidainsurance.com/en/funeral-homes-cemeteries.html";
  const title = isEn
    ? "Funeral homes and cemeteries | Mejor Vida Insurance"
    : "Funerarias y cementerios | Mejor Vida Seguros";
  const desc = isEn
    ? "Look up funeral homes, cemeteries, and published general price list figures by city. Smaller towns open the nearest resource list."
    : "Busque funerarias, cementerios y listas generales de precios publicadas por ciudad. Los pueblos más pequeños abren la lista de recursos más cercana.";
  const h1 = isEn ? "Funeral homes and cemeteries" : "Funerarias y cementerios";
  const lead = isEn
    ? "This is a contact directory, not a teaching page. Search a city — including smaller towns — to open that city’s resource page with phone numbers, websites, and any general price list we have copied from the funeral home."
    : "Esto es un directorio de contactos, no una página de enseñanza. Busque una ciudad — también un pueblo más pequeño — para abrir su página de recursos con teléfonos, sitios web y la lista general de precios que hayamos copiado de la funeraria.";
  const body = `<section class="mvi-fhdir" data-mvi-fhdir data-lang="${isEn ? "en" : "es"}" data-src="/data/funeral-resources.json">
  <div class="mvi-fhdir__hero">
    <div class="container">
      <h1>${h1}</h1>
      <p>${lead}</p>
    </div>
  </div>
  ${html.searchPanel(isEn, "fhdir-q")}
  <div class="mvi-fhdir__results" data-fhdir-results></div>
  ${html.legalHtml(isEn)}
  ${html.ctaHtml(isEn, quoteHref(lang, 0), scheduleHref(lang, 0))}
</section>`;
  return wrapPage({
    lang,
    depth: 0,
    twinHref: isEn ? "../funerarias-cementerios.html" : "/en/funeral-homes-cemeteries.html",
    canonical,
    alt,
    title,
    desc,
    h1,
    robots: isEn ? "noindex, follow" : "index, follow",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: h1,
      url: canonical,
      inLanguage: isEn ? "en-US" : "es-US",
      description: desc,
    },
    body,
  });
}

function statePage(lang, state, data) {
  const isEn = lang === "en";
  const listings = data.listings.filter((l) => l.stateCode === state.code);
  const canonical = isEn
    ? `https://www.mejorvidainsurance.com/en/funeral-homes-cemeteries/${state.slug}.html`
    : `https://www.mejorvidainsurance.com/funerarias-cementerios/${state.slug}.html`;
  const alt = isEn
    ? `https://www.mejorvidainsurance.com/funerarias-cementerios/${state.slug}.html`
    : `https://www.mejorvidainsurance.com/en/funeral-homes-cemeteries/${state.slug}.html`;
  const name = isEn ? state.nameEn : state.nameEs;
  const title = isEn
    ? `Funeral homes and cemeteries in ${name} | Mejor Vida Insurance`
    : `Funerarias y cementerios en ${name} | Mejor Vida Seguros`;
  const desc = isEn
    ? `City-by-city funeral home and cemetery contacts in ${name}, with published general price list figures where Mejor Vida Insurance has copied them.`
    : `Contactos de funerarias y cementerios ciudad por ciudad en ${name}, con listas generales de precios publicadas donde Mejor Vida Seguros las ha copiado.`;
  const h1 = isEn
    ? `Funeral homes and cemeteries in ${name}`
    : `Funerarias y cementerios en ${name}`;
  const hubHref = isEn ? "../funeral-homes-cemeteries.html" : "../funerarias-cementerios.html";
  const body = `<section class="mvi-fhdir" data-mvi-fhdir data-lang="${isEn ? "en" : "es"}" data-src="/data/funeral-resources.json">
  <div class="mvi-fhdir__hero">
    <div class="container">
      <h1>${h1}</h1>
    </div>
  </div>
  ${html.searchPanel(isEn, `fhdir-q-${state.slug}`)}
  <div class="mvi-fhdir__place">
    ${html.stateBody(state, listings, isEn, hubHref)}
  </div>
  <div class="mvi-fhdir__results" data-fhdir-results></div>
  ${html.legalHtml(isEn)}
  ${html.ctaHtml(isEn, quoteHref(lang, 1), scheduleHref(lang, 1))}
</section>`;
  return wrapPage({
    lang,
    depth: 1,
    twinHref: alt.replace("https://www.mejorvidainsurance.com", ""),
    canonical,
    alt,
    title,
    desc,
    h1,
    robots: isEn ? "noindex, follow" : "index, follow",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: h1,
      url: canonical,
      inLanguage: isEn ? "en-US" : "es-US",
      description: desc,
    },
    body,
  });
}

function cityPage(lang, listing) {
  const isEn = lang === "en";
  const city = isEn ? listing.nameEn : listing.nameEs;
  const state = isEn ? listing.stateNameEn : listing.stateNameEs;
  const near = listing.kind === "town";
  const canonical = isEn
    ? `https://www.mejorvidainsurance.com${listing.pathEn}`
    : `https://www.mejorvidainsurance.com${listing.pathEs}`;
  const alt = isEn
    ? `https://www.mejorvidainsurance.com${listing.pathEs}`
    : `https://www.mejorvidainsurance.com${listing.pathEn}`;
  const h1 = near
    ? isEn
      ? `Funeral homes and cemeteries near ${city}, ${state}`
      : `Funerarias y cementerios cerca de ${city}, ${state}`
    : isEn
      ? `Funeral homes and cemeteries in ${city}, ${state}`
      : `Funerarias y cementerios en ${city}, ${state}`;
  const title = `${h1} | ${isEn ? "Mejor Vida Insurance" : "Mejor Vida Seguros"}`;
  const desc = isEn
    ? `Funeral home phone numbers, websites, and published general price list figures for ${city}, ${state}. Resource list from Mejor Vida Insurance.`
    : `Teléfonos, sitios web y listas generales de precios publicadas de funerarias en ${city}, ${state}. Directorio de Mejor Vida Seguros.`;
  const hubHref = isEn
    ? "../../funeral-homes-cemeteries.html"
    : "../../funerarias-cementerios.html";
  const stateHref = isEn
    ? `../${listing.stateSlug}.html`
    : `../${listing.stateSlug}.html`;
  const body = `<section class="mvi-fhdir" data-mvi-fhdir data-lang="${isEn ? "en" : "es"}" data-src="/data/funeral-resources.json">
  <div class="mvi-fhdir__hero">
    <div class="container">
      <h1>${h1}</h1>
    </div>
  </div>
  ${html.searchPanel(isEn, `fhdir-q-${listing.slug}`)}
  <div class="mvi-fhdir__place">
    ${html.listingBody(listing, isEn, hubHref, stateHref, {
      quoteHref: quoteHref(lang, 2),
      scheduleHref: scheduleHref(lang, 2),
    })}
  </div>
  <div class="mvi-fhdir__results" data-fhdir-results></div>
  ${html.legalHtml(isEn)}
</section>`;
  return wrapPage({
    lang,
    depth: 2,
    twinHref: alt.replace("https://www.mejorvidainsurance.com", ""),
    canonical,
    alt,
    title,
    desc,
    h1,
    robots: isEn ? "noindex, follow" : "index, follow",
    jsonLd: html.listingJsonLd(listing, canonical, isEn),
    body,
  });
}

const written = writeFuneralResourceIndex();
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data/funeral-resources.json"), "utf8"));

rmNested("funerarias-cementerios");
rmNested("en/funeral-homes-cemeteries");
rmNested("sources/funerarias-cementerios");
rmNested("sources/en/funeral-homes-cemeteries");

writeBoth(
  "funerarias-cementerios.html",
  "en/funeral-homes-cemeteries.html",
  hubPage("es", data),
  hubPage("en", data)
);

data.states.forEach((state) => {
  writeBoth(
    `funerarias-cementerios/${state.slug}.html`,
    `en/funeral-homes-cemeteries/${state.slug}.html`,
    statePage("es", state, data),
    statePage("en", state, data)
  );
});

data.listings.forEach((listing) => {
  writeBoth(
    listing.pathEs.replace(/^\//, ""),
    listing.pathEn.replace(/^\//, ""),
    cityPage("es", listing),
    cityPage("en", listing)
  );
});

console.log(
  `wrote funeral directory (${written.places} cities, ${written.listings} listings, ${written.homes} homes)`
);
