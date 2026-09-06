#!/usr/bin/env node
/**
 * Render FE education hubs: guias-gastos-finales.html and en/final-expense-guides.html.
 */
const fs = require("fs");
const path = require("path");
const { loadFaqIndex, renderTocChrome, renderHubCategoriesHtml } = require("../lib/fe-guide-catalog");
const { applyUsLocaleSignals } = require("../lib/us-locale-html");
const { waQuoteUrl } = require("../lib/whatsapp-cta");

const ROOT = path.join(__dirname, "..");
const data = loadFaqIndex();

function renderHub(lang) {
  const isEn = lang === "en";
  const headerSrc = isEn
    ? path.join(ROOT, "includes/en-site-header.html")
    : path.join(ROOT, "includes/site-header-inner.html");
  const footerSrc = isEn
    ? path.join(ROOT, "includes/en-site-footer.html")
    : path.join(ROOT, "includes/site-footer-inner.html");

  let header = fs.readFileSync(headerSrc, "utf8");
  let footer = fs.readFileSync(footerSrc, "utf8");
  if (isEn) {
    header = header.replace(
      /(<a href=")[^"]+(" class="mvi-lang-fab)/,
      "$1../guias-gastos-finales.html$2"
    );
    footer = footer.replace(/__ASSET__/g, "../").replace(/__PAGE__/g, "");
  } else {
    header = header
      .replace(/__PREFIX__/g, "")
      .replace(/(<a href=")\/en\/(" class="mvi-lang-fab)/, "$1/en/final-expense-guides.html$2");
    footer = footer.replace(/__PREFIX__/g, "");
  }

  const toc = renderTocChrome({
    hubPrefix: "",
    inBlogDir: false,
    includePageSections: false,
    includeHubLink: false,
    onHubPage: true,
    showHubBarLink: false,
    lang,
    blogPrefix: isEn ? "" : "",
    imagePrefix: isEn ? "../img/opt/" : "img/opt/",
  });
  const categories = renderHubCategoriesHtml({
    blogPrefix: isEn ? "" : "",
    lang,
    imagePrefix: isEn ? "../img/opt/" : "img/opt/",
  });

  const cssPrefix = isEn ? "../" : "";
  const jsPrefix = isEn ? "../" : "";
  const canonical = isEn
    ? "https://www.mejorvidainsurance.com/en/final-expense-guides.html"
    : "https://www.mejorvidainsurance.com/guias-gastos-finales.html";
  const alt = isEn
    ? "https://www.mejorvidainsurance.com/guias-gastos-finales.html"
    : "https://www.mejorvidainsurance.com/en/final-expense-guides.html";
  const quoteHref = isEn ? "quote.html" : "/quote.html";
  const scheduleHref = isEn ? "schedule-julie.html" : "/schedule-julie.html";
  const homeHref = isEn ? "index.html" : "index.html";
  const intro = isEn ? data.introEn || data.intro : data.intro;

  const title = isEn
    ? "Final expense insurance guides | Mejor Vida Insurance"
    : "Guías de seguro de gastos finales | Mejor Vida Seguros";
  const desc = isEn
    ? "Mejor Vida Insurance guides on final expense insurance: cost, plan types, coverage, and next steps. Written for families, reviewed by a licensed agency."
    : "Guías de Mejor Vida Seguros sobre seguro de gastos finales: precios, tipos de planes, cobertura y siguientes pasos. Escritas para familias y revisadas por una agencia licenciada.";
  const h1 = isEn
    ? "Final expense insurance — Mejor Vida Insurance guides"
    : "Seguro de gastos finales — guías de Mejor Vida Seguros";
  const crumb = isEn ? "Final expense guides" : "Guías de gastos finales";
  const homeLabel = isEn ? "Home" : "Inicio";
  const note = isEn
    ? `<i class="fas fa-user-check" aria-hidden="true"></i> Reviewed by Mejor Vida Insurance · <a href="../divulgaciones-editoriales.html">Disclosures</a>`
    : `<i class="fas fa-user-check" aria-hidden="true"></i> Revisado por Mejor Vida Seguros · <a href="divulgaciones-editoriales.html">Divulgaciones</a>`;
  const lead = isEn
    ? "Use the <strong>table of contents</strong> above to jump to a topic, or open any published guide."
    : "Use el <strong>índice de contenidos</strong> arriba para saltar a un tema o abra cualquier guía publicada.";
  const ctaTitle = isEn ? "See options for your situation" : "¿Quiere ver opciones para su situación?";
  const ctaBody = isEn
    ? "Mejor Vida Insurance compares final expense companies. Start with a free online quote, schedule a call, or message us on WhatsApp."
    : "Mejor Vida Seguros compara compañías de gastos finales. Empiece con una cotización gratuita en línea, agende una llamada o escríbanos por WhatsApp.";
  const ctaQuote = isEn ? "Get a free quote" : "Cotización gratuita";
  const ctaSchedule = isEn ? "Schedule a call" : "Agendar una llamada";
  const htmlLang = isEn ? "en-US" : "es-US";
  const htmlClass = isEn ? "lang-en" : "lang-es";
  const assetRoot = isEn ? "../" : "";

  return applyUsLocaleSignals(`<!DOCTYPE html>
<html class="${htmlClass}" lang="${htmlLang}">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="${canonical}"/>
<link rel="alternate" hreflang="es" href="${isEn ? alt : canonical}"/>
<link rel="alternate" hreflang="en" href="${isEn ? canonical : alt}"/>
<link rel="alternate" hreflang="x-default" href="${isEn ? alt : canonical}"/>
<link href="${assetRoot}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${cssPrefix}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${cssPrefix}css/quote-flow-shared.css" rel="stylesheet"/>
<link href="${cssPrefix}css/site-footer.css?v=20260721-funeral-mega" rel="stylesheet"/>
<link href="${cssPrefix}css/mvi-assistant-widget.css" rel="stylesheet"/>
<link href="${cssPrefix}css/fontawesome-mvi.min.css" rel="stylesheet"/>
<link href="${cssPrefix}css/fe-guide.css?v=20260906-edit" rel="stylesheet"/>
<script>(function(){document.documentElement.lang='${htmlLang}';document.documentElement.className='${htmlClass}';})();</script>
</head>
<body style="font-family:'Inter',system-ui,sans-serif;">
${header}
${toc}
<section class="fe-hub-hero" aria-label="${isEn ? "Final expense education hub" : "Centro de educación sobre gastos finales"}">
<div class="container">
<nav aria-label="Breadcrumb" class="fe-guide-breadcrumb">
<a href="${homeHref}">${homeLabel}</a> <span aria-hidden="true">›</span>
<span>${crumb}</span>
</nav>
<h1>${h1}</h1>
<p class="fe-hub-hero-dek">${intro}</p>
<p class="fe-hub-hero-note">${note}</p>
</div>
</section>
<main class="fe-hub-main container">
<p class="fe-hub-intro">${lead}</p>
${categories}
<section class="fe-guide-cta mt-5" aria-label="${isEn ? "Next step" : "Siguiente paso"}">
<h2 class="h5 fw-bold mb-2" style="color:#1a365d;">${ctaTitle}</h2>
<p class="mb-3 small text-body-secondary">${ctaBody}</p>
<a class="btn btn-primary me-2 mb-2" href="${quoteHref}">${ctaQuote}</a>
<a class="btn btn-outline-primary me-2 mb-2" href="${scheduleHref}">${ctaSchedule}</a>
<a class="btn fe-guide-btn-whatsapp mb-2" href="${waQuoteUrl(isEn ? "en" : "es")}" rel="noopener" target="_blank"><i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp</a>
</section>
</main>
${footer}
<script defer src="${jsPrefix}bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="${jsPrefix}js/mvi-funnel-track.js?v=20260702e"></script>
<script defer src="${jsPrefix}js/mvi-ga4-funnel.js"></script>
<script defer src="${jsPrefix}js/fe-guide-toc.js?v=20260906-hero"></script>
<script defer src="${jsPrefix}script.js"></script>
<script defer src="${jsPrefix}js/mvi-nav-questions.js"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${jsPrefix}js/website-assistant-widget.js"></script>
</body>
</html>`);
}

const esHtml = renderHub("es");
const enHtml = renderHub("en");

for (const out of ["guias-gastos-finales.html", "sources/guias-gastos-finales.html"]) {
  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), esHtml, "utf8");
}
for (const out of ["en/final-expense-guides.html", "sources/en/final-expense-guides.html"]) {
  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), enHtml, "utf8");
}
console.log("Rendered guias-gastos-finales.html and en/final-expense-guides.html");
