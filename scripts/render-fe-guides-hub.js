#!/usr/bin/env node
/**
 * Render Spanish FE education hub (guias-gastos-finales.html).
 */
const fs = require("fs");
const path = require("path");
const { loadFaqIndex, renderTocChrome, renderHubCategoriesHtml } = require("../lib/fe-guide-catalog");
const { applyUsLocaleSignals } = require("../lib/us-locale-html");
const { waQuoteUrl } = require("../lib/whatsapp-cta");

const ROOT = path.join(__dirname, "..");
const HEADER_SRC = path.join(ROOT, "includes/site-header-inner.html");
const FOOTER_SRC = path.join(ROOT, "includes/site-footer-inner.html");

const header = fs.readFileSync(HEADER_SRC, "utf8").replace(/__PREFIX__/g, "");
const footer = fs.readFileSync(FOOTER_SRC, "utf8").replace(/__PREFIX__/g, "");
const data = loadFaqIndex();
const toc = renderTocChrome({ hubPrefix: "", inBlogDir: false, includePageSections: false, includeHubLink: false, onHubPage: true, showHubBarLink: false });
const categories = renderHubCategoriesHtml({ blogPrefix: "" });

const html = applyUsLocaleSignals(`<!DOCTYPE html>
<html class="lang-es" lang="es-US">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Guías de seguro de gastos finales — Educación sin IA | Mejor Vida Insurance</title>
<meta name="description" content="Todas las guías de Mejor Vida Insurance sobre seguro de gastos finales en español: precios, tipos de planes, Nebraska, cobertura y más. Contenido escrito por una agencia licenciada, sin IA."/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="https://www.mejorvidainsurance.com/guias-gastos-finales.html"/>
<link href="favicon.ico" rel="icon" type="image/x-icon"/>
<link href="bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="css/quote-flow-shared.css" rel="stylesheet"/>
<link href="css/site-footer.css?v=20260721-funeral-mega" rel="stylesheet"/>
<link href="css/mvi-assistant-widget.css" rel="stylesheet"/>
<link href="css/fontawesome-mvi.min.css" rel="stylesheet"/>
<link href="css/fe-guide.css?v=20260903-guide-labels" rel="stylesheet"/>
<script>(function(){document.documentElement.lang='es-US';document.documentElement.className='lang-es';})();</script>
</head>
<body style="font-family:'Inter',system-ui,sans-serif;">
${header}
${toc}
<section class="fe-hub-hero" aria-label="Centro de educación sobre gastos finales">
<div class="container">
<nav aria-label="Breadcrumb" class="fe-guide-breadcrumb">
<a href="index.html">Inicio</a> <span aria-hidden="true">›</span>
<span>Guías de gastos finales</span>
</nav>
<h1>Seguro de gastos finales — guías de Mejor Vida Insurance</h1>
<p class="fe-hub-hero-dek">${data.intro}</p>
<p class="fe-hub-hero-note"><i class="fas fa-user-check" aria-hidden="true"></i> Compromiso de contenido sin IA · <a href="divulgaciones-editoriales.html">Divulgaciones</a></p>
</div>
</section>
<main class="fe-hub-main container">
<p class="fe-hub-intro">Use el <strong>índice de contenidos</strong> arriba para saltar a un tema o abra cualquier guía publicada. Las páginas marcadas como «Próximamente» se publican conforme Mejor Vida las termina.</p>
${categories}
<section class="fe-guide-cta mt-5" aria-label="Siguiente paso">
<h2 class="h5 fw-bold mb-2" style="color:#1a365d;">¿Quiere ver opciones para su situación?</h2>
<p class="mb-3 small text-body-secondary">Mejor Vida Insurance compara compañías de gastos finales para familias en Nebraska. Empiece con una cotización gratuita en línea o escríbanos por WhatsApp.</p>
<a class="btn btn-primary me-2 mb-2" href="/quote.html">Cotización gratuita</a>
<a class="btn fe-guide-btn-whatsapp mb-2" href="${waQuoteUrl("es")}" rel="noopener" target="_blank"><i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp</a>
</section>
</main>
${footer}
<script defer src="bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="js/mvi-funnel-track.js?v=20260702e"></script>
<script defer src="js/mvi-ga4-funnel.js"></script>
<script defer src="js/fe-guide-toc.js"></script>
<script defer src="script.js"></script>
<script defer src="js/mvi-nav-questions.js"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="js/website-assistant-widget.js"></script>
</body>
</html>`);

for (const out of ["guias-gastos-finales.html", "sources/guias-gastos-finales.html"]) {
  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), html, "utf8");
}
console.log("Rendered guias-gastos-finales.html");
