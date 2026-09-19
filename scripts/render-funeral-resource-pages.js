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
const CSS_VER = "20260919-dir17";
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

function contactCtx(lang, depth) {
  const p = "../".repeat(depth);
  const isEn = lang === "en";
  return {
    quoteHref: `${p}quote.html`,
    scheduleHref: `${p}schedule-julie.html`,
    estimatorHref: `${p}final-expense-estimator.html`,
    contactHref: `${p}contact.html`,
    whatsappHref: isEn
      ? "https://wa.me/14024405438?text=Hi%2C%20I%20want%20a%20free%20final%20expense%20insurance%20quote."
      : "https://wa.me/14024405438?text=Hola%2C%20quiero%20una%20cotizaci%C3%B3n%20gratis%20de%20seguro%20de%20gastos%20finales.",
    smsHref: isEn
      ? "sms:+14028441199?body=Hi%20Julie%2C%20I%20have%20questions%20about%20my%20quote."
      : "sms:+14028441199?body=Hola%20Julie%2C%20tengo%20preguntas%20sobre%20mi%20cotizaci%C3%B3n.",
    phoneHref: "tel:+14024405438",
    asset: assetPrefix(lang, depth),
  };
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
  const h1 = isEn
    ? "Find funeral homes and prices near you"
    : "Encuentre funerarias y precios cerca de usted";
  const ctx = contactCtx(lang, 0);
  const body = `<section class="mvi-fhdir" data-mvi-fhdir data-fhdir-lang="${isEn ? "en" : "es"}" data-src="/data/funeral-resources.json">
  ${html.funeralSearchHero(isEn, { inputId: "fhdir-q", headingLevel: 1 })}
  <div class="mvi-fhdir__results" data-fhdir-results></div>
  ${html.funeralInsuranceCTA(isEn, ctx)}
  ${html.legalHtml(isEn)}
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
  const h1 = isEn ? `Funeral homes in ${name}` : `Funerarias en ${name}`;
  const hubHref = isEn ? "../funeral-homes-cemeteries.html" : "../funerarias-cementerios.html";
  const ctx = { ...contactCtx(lang, 1), updated: data.updated };
  const body = `<section class="mvi-fhdir" data-mvi-fhdir data-fhdir-lang="${isEn ? "en" : "es"}" data-src="/data/funeral-resources.json" data-state="${state.code}" data-state-name="${name}">
  ${html.funeralSearchHero(isEn, { inputId: `fhdir-q-${state.slug}`, headingLevel: 0, stateCode: state.code })}
  <div class="mvi-fhdir__place">
    ${html.stateBody(state, listings, isEn, hubHref, ctx)}
  </div>
  <div class="mvi-fhdir__results" data-fhdir-results></div>
  ${html.funeralInsuranceCTA(isEn, ctx)}
  ${html.legalHtml(isEn)}
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

function cityPage(lang, listing, data) {
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
      ? `Funeral homes near ${city}, ${state}`
      : `Funerarias cerca de ${city}, ${state}`
    : isEn
      ? `Funeral homes in ${city}, ${state}`
      : `Funerarias en ${city}, ${state}`;
  const title = `${h1} | ${isEn ? "Mejor Vida Insurance" : "Mejor Vida Seguros"}`;
  const desc = isEn
    ? `Funeral home phone numbers, websites, and published general price list figures for ${city}, ${state}. Resource list from Mejor Vida Insurance.`
    : `Teléfonos, sitios web y listas generales de precios publicadas de funerarias en ${city}, ${state}. Directorio de Mejor Vida Seguros.`;
  const hubHref = isEn
    ? "../../funeral-homes-cemeteries.html"
    : "../../funerarias-cementerios.html";
  const stateHref = `../${listing.stateSlug}.html`;
  const ctx = { ...contactCtx(lang, 2), updated: data.updated };
  const body = `<section class="mvi-fhdir" data-mvi-fhdir data-fhdir-lang="${isEn ? "en" : "es"}" data-src="/data/funeral-resources.json" data-state="${html.esc(listing.stateCode)}" data-state-name="${html.esc(state)}" data-city="${html.esc(city)}">
  ${html.funeralSearchHero(isEn, {
    inputId: `fhdir-q-${listing.slug}`,
    headingLevel: 0,
    stateCode: listing.stateCode,
    cityName: city,
  })}
  <div class="mvi-fhdir__place">
    ${html.listingBody(listing, isEn, hubHref, stateHref, ctx)}
  </div>
  <div class="mvi-fhdir__results" data-fhdir-results></div>
  ${html.funeralInsuranceCTA(isEn, ctx)}
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
    cityPage("es", listing, data),
    cityPage("en", listing, data)
  );
});

console.log(
  `wrote funeral directory (${written.places} cities, ${written.listings} listings, ${written.homes} homes)`
);
