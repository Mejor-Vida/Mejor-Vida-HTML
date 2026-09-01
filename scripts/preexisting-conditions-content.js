"use strict";

// First-use jargon: the first time a page uses an insurance term (level plan,
// waiting period, guaranteed acceptance), define it in plain language. Later
// mentions on the same page do not repeat the definition. Do not use
// carrier-specific labels (Preferred, Standard, knockout, Part One, Section A)
// on public pages. Flag gaps instead of guessing.

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

const LINKS = {
  es: {
    hub: "seguro-gastos-finales-condiciones-preexistentes.html",
    termCond: "seguro-vida-temporal-condiciones-preexistentes.html",
    term: "seguro-vida-temporal.html",
    termQuote: "term-quote.html",
    assurity: "carriers/assurity.html",
    amam: "carriers/american-amicable.html",
    diabetes: "seguro-vida-diabetes.html",
    heart: "seguro-vida-corazon.html",
    hbp: "seguro-vida-presion-alta.html",
    copd: "seguro-vida-epoc.html",
    cancer: "seguro-vida-cancer.html",
    kidney: "seguro-vida-enfermedad-renal.html",
    disability: "seguro-vida-discapacidad.html",
    hiv: "seguro-vida-vih.html",
    stroke: "seguro-vida-derrame-cerebral.html",
    gi: "aceptacion-garantizada.html",
    noWait: "seguro-vida-entierro-sin-espera.html",
    fe: "seguro-gastos-finales.html",
    exam: "seguro-vida-mayores-sin-examen.html",
    licenses: "licencias.html",
    quote: "quote.html",
    schedule: "schedule-julie.html",
    moo: "carriers/mutual-of-omaha.html",
    aetna: "carriers/aetna.html",
    ta: "carriers/transamerica.html",
    americo: "carriers/americo.html",
    core: "carriers/corebridge.html",
  },
  en: {
    hub: "final-expense-pre-existing-conditions.html",
    termCond: "term-life-pre-existing-conditions.html",
    term: "term-life-insurance.html",
    termQuote: "term-quote.html",
    assurity: "carriers/assurity.html",
    amam: "carriers/american-amicable.html",
    diabetes: "life-insurance-diabetes.html",
    heart: "life-insurance-heart-disease.html",
    hbp: "life-insurance-high-blood-pressure.html",
    copd: "life-insurance-copd.html",
    cancer: "life-insurance-cancer.html",
    kidney: "life-insurance-kidney-disease.html",
    disability: "life-insurance-disability.html",
    hiv: "life-insurance-hiv.html",
    stroke: "life-insurance-stroke.html",
    gi: "guaranteed-acceptance.html",
    noWait: "no-waiting-period-life-burial.html",
    fe: "final-expense-insurance.html",
    exam: "life-insurance-seniors-no-medical-exam.html",
    licenses: "licenses.html",
    quote: "quote.html",
    schedule: "schedule-julie.html",
    moo: "carriers/mutual-of-omaha.html",
    aetna: "carriers/aetna.html",
    ta: "carriers/transamerica.html",
    americo: "carriers/americo.html",
    core: "carriers/corebridge.html",
  },
};

function pair(isEs, es, en) {
  return isEs ? es : en;
}

function faqsHtml(c) {
  return [1, 2, 3, 4, 5, 6, 7, 8]
    .filter((n) => c["faq" + n + "q"])
    .map(
      (n, i) =>
        `<details${i === 0 ? " open" : ""}><summary>${c["faq" + n + "q"]}</summary><p>${c["faq" + n + "a"]}</p></details>`
    )
    .join("\n");
}

function feRateBlock(c, quoteHref) {
  return `<div class="lic-product-tabs" data-lic-product="fe" data-lic-quote-href="${quoteHref}">
<div class="lic-face-tabs" role="tablist" aria-label="${c.faceLabel}">
<button type="button" class="lic-face-tab is-active" data-lic-face="10000" role="tab" aria-selected="true">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="15000" role="tab" aria-selected="false">$15,000</button>
<button type="button" class="lic-face-tab" data-lic-face="25000" role="tab" aria-selected="false">$25,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${c.ageCol}</th><th scope="col">${c.female}</th><th scope="col">${c.male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note"${c.hideJsRateNote ? " hidden" : ""} data-lic-note></p>
</div>`;
}

function giRateBlock(c, quoteHref) {
  return `<div class="lic-product-tabs" data-lic-product="gi" data-lic-quote-href="${quoteHref}">
<div class="lic-face-tabs" role="tablist" aria-label="${c.faceLabel}">
<button type="button" class="lic-face-tab is-active" data-lic-face="10000" role="tab" aria-selected="true">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="20000" role="tab" aria-selected="false">$20,000</button>
<button type="button" class="lic-face-tab" data-lic-face="25000" role="tab" aria-selected="false">$25,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${c.ageCol}</th><th scope="col">${c.female}</th><th scope="col">${c.male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</div>`;
}

function termRateBlock(c, quoteHref) {
  return `<div class="lic-product-tabs" data-lic-product="term" data-lic-term="10" data-lic-quote-href="${quoteHref}">
<p class="lic-rate-note">${c.termShow}
<button type="button" class="lic-face-tab is-active" data-lic-set-term="10" aria-pressed="true">10</button>
<button type="button" class="lic-face-tab" data-lic-set-term="20" aria-pressed="false">20</button>
<button type="button" class="lic-face-tab" data-lic-set-term="30" aria-pressed="false">30</button>
</p>
<div class="lic-face-tabs" role="tablist" aria-label="${c.termFaceLabel}">
<button type="button" class="lic-face-tab is-active" data-lic-face="100000" role="tab" aria-selected="true">$100,000</button>
<button type="button" class="lic-face-tab" data-lic-face="250000" role="tab" aria-selected="false">$250,000</button>
<button type="button" class="lic-face-tab" data-lic-face="500000" role="tab" aria-selected="false">$500,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${c.ageCol}</th><th scope="col">${c.female}</th><th scope="col">${c.male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</div>`;
}

function relatedNav(lang) {
  const L = LINKS[lang];
  const isEs = lang === "es";
  return `<p class="lic-rate-note">${isEs ? "Más en esta sección" : "More in this section"}:
<a href="${L.hub}">${isEs ? "Gastos finales" : "Final expense"}</a> ·
<a href="${L.termCond}">${isEs ? "Temporal" : "Term"}</a> ·
<a href="${L.diabetes}">${isEs ? "Diabetes" : "Diabetes"}</a> ·
<a href="${L.heart}">${isEs ? "Corazón" : "Heart disease"}</a> ·
<a href="${L.hbp}">${isEs ? "Presión alta" : "High blood pressure"}</a> ·
<a href="${L.copd}">${isEs ? "EPOC" : "COPD"}</a> ·
<a href="${L.cancer}">${isEs ? "Cáncer" : "Cancer"}</a> ·
<a href="${L.kidney}">${isEs ? "Riñón" : "Kidney"}</a> ·
<a href="${L.disability}">${isEs ? "Discapacidad" : "Disability"}</a> ·
<a href="${L.hiv}">${isEs ? "VIH" : "HIV"}</a> ·
<a href="${L.stroke}">${isEs ? "Derrame" : "Stroke"}</a></p>`;
}

function nextStepBandHtml(lang, c, opts) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const primaryHref = c.nextPrimaryHref || opts.quoteHref || L.quote;
  const primaryLabel = c.nextPrimary || c.quoteCta;
  const secondaryHref = c.nextSecondaryHref || `tel:${TEL}`;
  const secondaryLabel = c.nextSecondary || `${isEs ? "Llamar" : "Call"} ${PHONE}`;
  const more = c.nextMore ? `<p class="lic-next-band__more">${c.nextMore}</p>` : "";
  return `<section class="lic-section lic-next-band" id="next">
<div class="lic-next-band__inner">
<div class="lic-next-band__copy">
<h2>${c.nextH}</h2>
<p>${c.nextLead}</p>
${more}
</div>
<div class="lic-next-band__actions">
<a class="lic-next-band__btn lic-next-band__btn--gold" href="${primaryHref}">${primaryLabel}</a>
<a class="lic-next-band__btn lic-next-band__btn--ghost" href="${secondaryHref}">${secondaryLabel}</a>
</div>
</div>
</section>`;
}

function appointedCardsHtml(lang, c) {
  const L = LINKS[lang];
  const assets = lang === "es" ? "" : "../";
  return `<div class="lic-co-grid lic-co-grid--compare lic-co-grid--click">
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.moo}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/mutual-of-omaha-logo.webp"/>
<img src="${assets}img/opt/mutual-of-omaha-logo.png" alt="" width="400" height="94" loading="lazy" decoding="async"/>
</picture></div>
<h3>Mutual of Omaha</h3>
<p class="lic-co-product">${c.coMooProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coMooAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coMooAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.aetna}">
<div class="lic-co-logo"><img src="${assets}img/carriers/aetna-logo.svg" alt="" width="512" height="98" loading="lazy" decoding="async"/></div>
<h3>Aetna</h3>
<p class="lic-co-product">${c.coAetnaProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAetnaAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAetnaAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.ta}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/transamerica-logo.webp"/>
<img src="${assets}img/opt/transamerica-logo.png" alt="" width="362" height="69" loading="lazy" decoding="async"/>
</picture></div>
<h3>Transamerica</h3>
<p class="lic-co-product">${c.coTaProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coTaAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coTaAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.americo}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/americo-logo.webp"/>
<img src="${assets}img/opt/americo-logo.png" alt="" width="398" height="128" loading="lazy" decoding="async"/>
</picture></div>
<h3>Americo</h3>
<p class="lic-co-product">${c.coAmericoProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAmericoAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAmericoAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
</div>
<p class="lic-co-footnote">${c.coFoot}</p>`;
}

function giCardHtml(lang, c) {
  const L = LINKS[lang];
  const assets = lang === "es" ? "" : "../";
  return `<div class="lic-co-grid lic-co-grid--compare lic-co-grid--click">
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.core}">
<div class="lic-co-logo lic-co-logo--wide"><img src="${assets}img/carriers/corebridge-logo.svg" alt="" width="576" height="188" loading="lazy" decoding="async"/></div>
<h3>Corebridge</h3>
<p class="lic-co-product">${c.coGiProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coGiAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coGiAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coGiWait}</dd></div>
</dl>
</a>
</div>
<p class="lic-co-footnote">${c.coGiFoot}</p>`;
}

function termAppointedCardsHtml(lang, c) {
  const L = LINKS[lang];
  const assets = lang === "es" ? "" : "../";
  return `<div class="lic-co-grid lic-co-grid--compare lic-co-grid--click">
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.ta}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/transamerica-logo.webp"/>
<img src="${assets}img/opt/transamerica-logo.png" alt="" width="362" height="69" loading="lazy" decoding="async"/>
</picture></div>
<h3>Transamerica</h3>
<p class="lic-co-product">${c.coTaTermProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coTaTermAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coTaTermAmt}</dd></div>
<div><dt>${c.coExam}</dt><dd>${c.coTaTermExam}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.moo}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/mutual-of-omaha-logo.webp"/>
<img src="${assets}img/opt/mutual-of-omaha-logo.png" alt="" width="400" height="94" loading="lazy" decoding="async"/>
</picture></div>
<h3>Mutual of Omaha</h3>
<p class="lic-co-product">${c.coMooTermProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coMooTermAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coMooTermAmt}</dd></div>
<div><dt>${c.coExam}</dt><dd>${c.coMooTermExam}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.assurity}">
<div class="lic-co-logo"><img src="${assets}img/carriers/assurity-logo.svg" alt="" width="200" height="48" loading="lazy" decoding="async"/></div>
<h3>Assurity</h3>
<p class="lic-co-product">${c.coAsTermProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAsTermAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAsTermAmt}</dd></div>
<div><dt>${c.coExam}</dt><dd>${c.coAsTermExam}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${L.amam}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/american-amicable-logo.webp"/>
<img src="${assets}img/opt/american-amicable-logo.png" alt="" width="400" height="80" loading="lazy" decoding="async"/>
</picture></div>
<h3>American Amicable</h3>
<p class="lic-co-product">${c.coAmTermProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAmTermAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAmTermAmt}</dd></div>
<div><dt>${c.coExam}</dt><dd>${c.coAmTermExam}</dd></div>
</dl>
</a>
</div>
<p class="lic-co-footnote">${c.coTermFoot}</p>`;
}

function condShell(lang, page, c, opts) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const L = LINKS[lang];
  const quoteHref = opts.quoteHref || L.quote;
  const toc = (opts.toc || []).map(([href, label]) => `<a href="${href}">${label}</a>`).join("\n");
  return `<main>
<section class="lic-hero">
<div class="lic-hero-media lic-hero-media--${page.hero.modifier}" aria-hidden="true">
<picture>
<source srcset="${assets}img/opt/${page.hero.base}.webp?v=${page.hero.cache}" type="image/webp"/>
<img src="${assets}img/opt/${page.hero.base}.jpg?v=${page.hero.cache}" alt="" width="${page.hero.width}" height="${page.hero.height}" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb"><a href="index.html">${isEs ? "Inicio" : "Home"}</a> › ${
    opts.isHub
      ? `<a href="${L.fe}">${isEs ? "Gastos finales" : "Final expense"}</a>`
      : `<a href="${L.hub}">${isEs ? "Condiciones preexistentes" : "Pre-existing conditions"}</a>`
  } › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
${toc}
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Tres hechos para empezar" : "Three facts to start with"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<div class="lic-helpful"><p>${c.callout}</p></div>
${opts.inner}
${
    opts.omitFaq
      ? ""
      : `<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
`
  }
${nextStepBandHtml(lang, c, opts)}
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<section class="lic-section" id="sources">
<h2>${c.srcTitle}</h2>
<ul>
${[c.src1, c.src2, c.src3, c.src4, c.src5, c.src6].filter(Boolean).map((s) => `<li>${s}</li>`).join("\n")}
</ul>
</section>
${relatedNav(lang)}
</div>
${quoteRailHtml({
    lang,
    title: c.quoteTitle,
    line1: c.quote1,
    line2: c.quote2,
    quoteHref,
    cta: c.quoteCta,
  })}
</div>
</main>`;
}

function sharedLabels(isEs) {
  return {
    female: pair(isEs, "Mujer", "Female"),
    male: pair(isEs, "Hombre", "Male"),
    ageCol: pair(isEs, "Edad", "Age"),
    faceLabel: pair(isEs, "Montos de gastos finales", "Final expense amounts"),
    coAges: pair(isEs, "Edades de emisión", "Issue ages"),
    coAmt: pair(isEs, "Monto", "Coverage amount"),
    coWait: pair(isEs, "Espera de 2 años (plan nivelado)", "2-year wait (level plan)"),
    coWaitNo: pair(isEs, "No, si califica", "No, if you qualify"),
    coExam: pair(isEs, "Examen", "Exam"),
    coMooProduct: pair(isEs, "Living Promise Nivelado", "Living Promise Level"),
    coMooAges: "45–85",
    coMooAmt: pair(isEs, "$2,000–$50,000", "$2,000–$50,000"),
    coAetnaProduct: pair(isEs, "Accendo Preferred (Nivelado)", "Accendo Preferred (Level)"),
    coAetnaAges: "40–89",
    coAetnaAmt: pair(isEs, "$2,000–$50,000; tope $25,000 a los 76–89", "$2,000–$50,000; $25,000 cap at ages 76–89"),
    coTaProduct: pair(isEs, "Immediate Solution Preferred", "Immediate Solution Preferred"),
    coTaAges: pair(isEs, "Hasta 85", "Through 85"),
    coTaAmt: pair(isEs, "Desde $1,000; hasta $50,000+", "From $1,000; up to $50,000+"),
    coAmericoProduct: pair(isEs, "Eagle Select Nivelado", "Eagle Select Level"),
    coAmericoAges: "40–85",
    coAmericoAmt: "$5,000–$50,000",
    coGiProduct: pair(isEs, "GIWL (emisión garantizada)", "GIWL (guaranteed-issue whole life)"),
    coGiAges: "50–80",
    coGiAmt: "$5,000–$25,000",
    coGiWait: pair(isEs, "Sí (muerte natural)", "Yes (natural death)"),
    coFoot: pair(
      isEs,
      "Fichas educativas de compañías designadas. Un plan gradual, modificado o de aceptación garantizada puede añadir una espera. No es cotización vinculante.",
      "Educational cards for appointed companies. A graded, modified, or guaranteed-acceptance plan may add a wait. Not a binding quote."
    ),
    coGiFoot: pair(
      isEs,
      "Una póliza GIWL por asegurado cada 12 meses; el total GIWL de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      "One GIWL policy per insured every 12 months; that company’s GIWL total does not exceed $25,000. Educational — not a binding quote."
    ),
    discTitle: pair(isEs, "Divulgación", "Disclosure"),
    quoteTitle: pair(isEs, "Ver precios", "See prices"),
    quote1: pair(isEs, "Compañías designadas", "Appointed companies"),
    quote2: pair(isEs, "Según su salud y edad", "For your health and age"),
    quoteCta: pair(isEs, "Ver precios", "See prices"),
    faqTitle: pair(isEs, "Preguntas frecuentes", "Frequently asked questions"),
    nextH: pair(isEs, "Siguiente paso", "Next step"),
  };
}

function sharedDisc(isEs) {
  const L = LINKS[isEs ? "es" : "en"];
  if (isEs) {
    return `Esta página es educativa, no una oferta. Edades, montos y primas cambian por compañía, producto, tabaco y estado. Mejor Vida Seguros LLC es una agencia independiente (NPN 21695431). Los estados con licencia actual están en <a href="${L.licenses}">licencias</a>.`;
  }
  return `This page is educational, not an offer. Ages, amounts, and premiums change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href="${L.licenses}">licenses</a> page.`;
}

function sharedSources(isEs, extra) {
  const L = LINKS[isEs ? "es" : "en"];
  if (isEs) {
    return {
      srcTitle: "Fuentes",
      src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: seguro de vida para el consumidor</a> — cómo se compra una póliza, qué es el interés asegurable y por qué las respuestas de salud importan en un reclamo.',
      src2: extra && extra.src2 ? extra.src2 : '<a href="https://www.cdc.gov/" rel="noopener" target="_blank">CDC</a> — información de salud pública sobre condiciones crónicas; no sustituye las reglas de una aseguradora.',
      src3: extra && extra.src3 ? extra.src3 : '<a href="https://www.cancer.gov/about-cancer/understanding" rel="noopener" target="_blank">Instituto Nacional del Cáncer</a> — qué es el cáncer y cómo se describe el tratamiento.',
      src4: extra && extra.src4 ? extra.src4 : '<a href="https://www.niddk.nih.gov/health-information" rel="noopener" target="_blank">NIDDK (NIH)</a> — enfermedad renal, diabetes y factores relacionados.',
      src5: extra && extra.src5 ? extra.src5 : `Material de compañías designadas: Mutual of Omaha Living Promise; Accendo Final Expense (Accendo Insurance Company); Transamerica Immediate Solution / gráficos de suscripción de gastos finales; Corebridge GIWL; Americo Eagle Select. Primas de muestra: js/final-expense-cost-rates.json y Corebridge GIWL, agosto 2026.`,
      src6: extra && extra.src6 ? extra.src6 : `Guías de Mejor Vida Seguros: <a href="${L.noWait}">sin período de espera</a> y <a href="${L.gi}">aceptación garantizada</a>.`,
    };
  }
  return {
    srcTitle: "Sources",
    src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: consumer life insurance</a> — how a policy is bought, what insurable interest means, and why health answers matter at claim time.',
    src2: extra && extra.src2 ? extra.src2 : '<a href="https://www.cdc.gov/" rel="noopener" target="_blank">CDC</a> — public-health information on chronic conditions; it does not replace an insurer’s rules.',
    src3: extra && extra.src3 ? extra.src3 : '<a href="https://www.cancer.gov/about-cancer/understanding" rel="noopener" target="_blank">National Cancer Institute</a> — what cancer is and how treatment is described.',
    src4: extra && extra.src4 ? extra.src4 : '<a href="https://www.niddk.nih.gov/health-information" rel="noopener" target="_blank">NIDDK (NIH)</a> — kidney disease, diabetes, and related factors.',
    src5: extra && extra.src5 ? extra.src5 : `Appointed-company materials: Mutual of Omaha Living Promise; Accendo Final Expense (Accendo Insurance Company); Transamerica Immediate Solution / final-expense underwriting charts; Corebridge GIWL; Americo Eagle Select. Sample premiums: js/final-expense-cost-rates.json and Corebridge GIWL, August 2026.`,
    src6: extra && extra.src6 ? extra.src6 : `Mejor Vida Insurance guides: <a href="${L.noWait}">no waiting period</a> and <a href="${L.gi}">guaranteed acceptance</a>.`,
  };
}

function baseCopy(lang) {
  const isEs = lang === "es";
  return {
    ...sharedLabels(isEs),
    discBody: sharedDisc(isEs),
    ...sharedSources(isEs),
  };
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                         */
/* -------------------------------------------------------------------------- */

function copyCondHub(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  if (isEs) {
    return {
      ...b,
      title: "Gastos finales con condiciones preexistentes: cómo calificar (2026) | Mejor Vida Seguros",
      desc: "Una condición previa no cierra automáticamente el seguro de gastos finales. Cómo se comparan planes nivelados, graduales y de aceptación garantizada con compañías designadas.",
      h1: "Cómo obtener seguro de gastos finales si ya tiene una condición de salud",
      lead: "Una condición preexistente es un diagnóstico o tratamiento que ya existía cuando usted solicita. En gastos finales eso <strong>no significa un rechazo automático</strong>. Muchas personas con diabetes, presión alta o un infarto antiguo todavía califican a un plan nivelado: hay preguntas de salud, no un examen en el consultorio, y el beneficio completo puede aplicar desde el primer pago cubierto.",
      crumbEnd: "Condiciones preexistentes",
      take1: "Hay tres caminos: un <strong>plan nivelado o inmediato</strong> (preguntas, a menudo sin espera de dos años), un plan <strong>gradual o modificado</strong> (beneficio limitado al inicio) y la <strong>aceptación garantizada</strong> (sin preguntas, siempre con espera por muerte natural).",
      take2: "Ninguna compañía que cotizamos ofrece <strong>cero preguntas y beneficio completo por muerte natural desde el día uno</strong>. Si un anuncio dice “sin examen y sin espera”, casi siempre hay cuestionario.",
      take3: "Mejor Vida Seguros compara compañías designadas — Mutual of Omaha Living Promise, Accendo, Transamerica Immediate Solution, Americo y, cuando hace falta, Corebridge GIWL — con su edad, tabaco y respuestas reales, no con una lista genérica de internet.",
      callout: "Empiece por el cuestionario. La aceptación garantizada es el plan B cuando ese cuestionario no puede emitir un beneficio inmediato. No es el primer intento para diabetes o presión alta.",
      pathsH: "Tres tipos de póliza, en lenguaje sencillo",
      pathsP: "El nombre comercial cambia. Lo que importa es cuándo paga la compañía y qué tiene que responder usted.",
      p1T: "Nivelado o inmediato",
      p1: "Hay preguntas y revisión de recetas y bases de datos. Si califica, el monto completo puede aplicar por muerte natural cubierta desde el primer pago. Suele ser el precio más bajo por dólar. Living Promise Nivelado emite de 45 a 85, hasta unos $50,000. Accendo Level puede emitir hasta 89 (tope $25,000 a los 76–89). Transamerica Immediate Solution llega a 85.",
      p2T: "Gradual o modificado",
      p2: "Todavía hay preguntas. En los primeros años, una muerte no accidental puede pagar solo una parte del monto o devolver primas más un interés del contrato. Accendo Modificado, por ejemplo, suele devolver el 110% de primas ganadas en los años 1–2 por muerte no accidental y el monto completo desde el año 3. Accidental cubierto puede pagar entero desde el inicio.",
      p3T: "Aceptación garantizada",
      p3: `No hay preguntas de salud. Dentro de la edad y el monto, no se niega por historial médico. Siempre hay espera de unos dos años por muerte no accidental. Corebridge GIWL: edades 50–80, $5,000–$25,000; en la espera, 110% de las primas pagadas. Vea <a href="${L.gi}">aceptación garantizada</a>.`,
      mythH: "No existe “aprobación garantizada sin espera”",
      mythP: "Si la compañía no sabe nada de su salud, no puede pagar $10,000 o $25,000 después de haber cobrado unas pocas cuotas. Por eso la aceptación garantizada lleva espera. El camino al beneficio desde el día uno es un plan con preguntas que usted puede responder con “no” a los descalificadores de ese producto — o, en algunos productos, un “sí” que todavía deja un plan inmediato a otra clase de tarifa.",
      howH: "Cómo encontramos el producto que encaja",
      howP: "No hay una “mejor compañía para todo el mundo.” Hay una compañía cuyo cuestionario encaja con su historial. Un mismo diagnóstico puede ser nivelado en una y solo GIWL en otra.",
      how1T: "Hechos, no rumores",
      how1: "Edad, estatura, peso, tabaco, medicamentos, hospitalizaciones y oxígeno si lo recetaron. Una respuesta “no” que debía ser “sí” puede anular un reclamo.",
      how2T: "Varias compañías designadas",
      how2: "El cuestionario de Living Promise no es el de Accendo ni el de Transamerica. Por eso comparamos, en lugar de enviar una sola solicitud a ciegas.",
      how3T: "Luego el precio",
      how3: "El precio sigue a edad, sexo, tabaco y clase (Preferred, Standard, tabaco). La salud decide la clase y si hay espera; no inventamos un descuento aparte.",
      dirH: "Cobertura por condición",
      dirP: "Estas guías usan las reglas de las compañías que cotizamos. No es un directorio de 60 enfermedades: son las situaciones que más aparecen en gastos finales y de las que tenemos datos de suscripción.",
      d1H: "Diabetes",
      d1: "Tipo 1 o 2, con o sin insulina, suele seguir en simplificado si no hay complicaciones graves.",
      d2H: "Enfermedad del corazón",
      d2: "Un infarto antiguo a menudo sigue en simplificado. Insuficiencia cardíaca o un evento reciente cambian el camino.",
      d3H: "Presión alta",
      d3: "Es de las condiciones más comunes. Sola, casi nunca empuja a aceptación garantizada.",
      d4H: "EPOC",
      d4: "Muchos planes todavía cotizan. Tabaco y oxígeno recetado por pulmón suelen estrechar las opciones.",
      d5H: "Cáncer",
      d5: "Tratamiento activo suele ir a GIWL. Libre de cáncer y de tratamiento por un tiempo puede volver a simplificado.",
      d6H: "Riñón",
      d6: "La etapa y si hay diálisis importan más que la palabra “riñón.”",
      d7H: "Discapacidad",
      d7: "Un cheque del Seguro Social no es lo mismo que un “no” en el cuestionario. Silla de ruedas y ayuda para bañarse se miran aparte.",
      d8H: "VIH",
      d8: "En las compañías designadas de emisión simplificada suele ser declinación. El camino habitual es GIWL.",
      d9H: "Derrame o AIT",
      d9: "Un evento hace años no es lo mismo que uno en los últimos dos años.",
      knockH: "Cuándo el simplificado suele no emitir",
      knockP: "En las compañías designadas, un plan con preguntas a menudo no se puede emitir si aplica alguna de estas situaciones. Entonces sí se mira GIWL. No es un diagnóstico ni una lista legal: una cotización confirma el producto.",
      k1: "VIH o SIDA",
      k2: "Alzheimer o demencia",
      k3: "Hospital, residencia, hospicio, enfermería especializada o cuidado de salud en el hogar",
      k4: "Oxígeno por una condición pulmonar (no apnea del sueño)",
      k5: "Silla de ruedas, scooter o cama por una enfermedad (no una lesión breve)",
      k6: "Cáncer en tratamiento activo (algunos cánceres de piel o etapas muy tempranas todavía pueden ir por simplificado)",
      k7: "Abuso de alcohol o drogas, o tratamiento, en los últimos 24 meses",
      k8: "Incapacidad mental o enfermedad terminal",
      k9: "Diálisis, enfermedad renal avanzada o trasplante de órgano",
      knockNote: "EPOC con tabaco es otro ejemplo frecuente: el simplificado designado suele declinar y GIWL puede seguir siendo una vía. Transamerica, en su gráfico de un solo padecimiento, todavía puede considerar EPOC, diabetes o enfermedad renal en clase Standard cuando es el único factor listado. El perfil completo — peso, recetas, otros diagnósticos — decide.",
      costH: "Cuánto cuesta si califica a un plan nivelado",
      costP: "Estas primas son ilustrativas de gastos finales nivelados, no fumador, compañías designadas. Aplican si el cuestionario da un plan inmediato. GIWL sale más caro a la misma edad y monto, y lleva espera. No es una oferta.",
      applyH: "Cómo solicitar sin atascar el reclamo futuro",
      applyP: "La compañía revisa lo que usted dice y lo que ya está en bases de recetas y de reclamaciones. Diga la verdad aunque tema un “sí.” Un “no” incorrecto es peor que un plan con espera.",
      faq1q: "¿Tener una condición preexistente me impide comprar gastos finales?",
      faq1a: "No por sí sola. La mayoría de los planes de gastos finales existen precisamente para personas mayores con historial médico. Lo que cambia es si el beneficio es inmediato, gradual o con espera de dos años.",
      faq2q: "¿Puedo comprar por internet un plan “sin examen y sin espera”?",
      faq2a: "En las compañías que cotizamos, “sin examen” sigue teniendo preguntas. La aceptación garantizada no tiene preguntas y siempre tiene espera por muerte natural. No cotizamos un producto que combine las dos cosas.",
      faq3q: "¿La diabetes o la presión alta me mandan a aceptación garantizada?",
      faq3a: "Casi nunca, si esa es la única condición y no hay complicaciones graves. Cotice primero un plan nivelado.",
      faq4q: "¿El precio sube porque tengo una condición?",
      faq4a: "En un plan nivelado, el precio sigue sobre todo a edad, sexo y tabaco, y a la clase (Preferred o Standard). En GIWL la salud no cambia la prima: por eso suele costar más.",
      faq5q: "¿Debo mencionar todos los medicamentos?",
      faq5a: "Sí. Las compañías revisan historial de recetas. Un medicamento de cáncer, de oxígeno o de diálisis que no coincida con sus respuestas frena o anula el contrato.",
      faq6q: "¿Hasta qué edad puedo comprar?",
      faq6a: "Depende del producto. Muchos gastos finales llegan a 85. Accendo Level puede emitir hasta 89. GIWL designada suele cortar a los 80.",
      nextLead: "Pida una cotización con su edad, tabaco y medicamentos, o llame a Mejor Vida Seguros.",
      nextMore: `Si ya sabe que el cuestionario no va a pasar, vaya directo a <a href="${L.gi}">aceptación garantizada</a>.`,
      quote2: "Nivelado o con espera",
    };
  }
  return {
    ...b,
    title: "Final expense with pre-existing conditions: how to qualify (2026) | Mejor Vida Insurance",
    desc: "A pre-existing condition does not automatically close final expense insurance. How level, graded, and guaranteed-acceptance plans compare at appointed companies.",
    h1: "How to get final expense insurance when you already have a health condition",
    lead: "A pre-existing condition is a diagnosis or treatment that was already there when you apply. On final expense that <strong>does not mean an automatic decline</strong>. Many people with diabetes, high blood pressure, or an old heart attack still qualify for a level plan: there are health questions, not an in-office exam, and the full benefit can apply from the first covered payment.",
    crumbEnd: "Pre-existing conditions",
    take1: "There are three paths: a <strong>level or immediate plan</strong> (questions, often no two-year wait), a <strong>graded or modified</strong> plan (limited benefit at first), and <strong>guaranteed acceptance</strong> (no questions, always a wait for natural death).",
    take2: "No company we quote offers <strong>zero questions and a full natural-death benefit from day one</strong>. Ads that say “no exam and no waiting period” almost always still have a questionnaire.",
    take3: "Mejor Vida Insurance compares appointed companies — Mutual of Omaha Living Promise, Accendo, Transamerica Immediate Solution, Americo, and, when needed, Corebridge GIWL — using your age, tobacco, and real answers, not a generic internet list.",
    callout: "Start with the questionnaire. Guaranteed acceptance is plan B when that questionnaire cannot issue a day-one benefit. It is not the first try for diabetes or high blood pressure.",
    pathsH: "Three policy types, in plain language",
    pathsP: "The brand name changes. What matters is when the company pays and what you have to answer.",
    p1T: "Level or immediate",
    p1: "There are questions and a review of prescriptions and databases. If you qualify, the full amount can apply for covered natural death from the first payment. It is usually the lowest price per dollar. Living Promise Level issues ages 45–85, up to about $50,000. Accendo Level can issue through 89 ($25,000 cap at 76–89). Transamerica Immediate Solution goes through 85.",
    p2T: "Graded or modified",
    p2: "There are still questions. In the first years, a non-accidental death may pay only part of the face amount or return premiums plus contract interest. Accendo Modified, for example, typically returns 110% of earned premiums in years 1–2 for non-accidental death and the full amount from year 3. A covered accident can pay in full from the start.",
    p3T: "Guaranteed acceptance",
    p3: `There are no health questions. Within the age and amount, you are not declined for medical history. There is always about a two-year wait for non-accidental death. Corebridge GIWL: ages 50–80, $5,000–$25,000; during the wait, 110% of premiums paid. See <a href="${L.gi}">guaranteed acceptance</a>.`,
    mythH: "There is no “guaranteed approval with no waiting period”",
    mythP: "If the company knows nothing about your health, it cannot pay $10,000 or $25,000 after collecting a few premiums. That is why guaranteed acceptance carries a wait. The path to a day-one benefit is a plan with questions you can answer without hitting that product’s knockouts — or, on some products, a “yes” that still leaves an immediate plan at another rate class.",
    howH: "How we find the product that fits",
    howP: "There is no “best company for everyone.” There is a company whose questionnaire matches your history. The same diagnosis can be level at one company and GIWL-only at another.",
    how1T: "Facts, not guesses",
    how1: "Age, height, weight, tobacco, medications, hospital stays, and oxygen if it was prescribed. A “no” that should have been “yes” can void a claim.",
    how2T: "Several appointed companies",
    how2: "The Living Promise questions are not Accendo’s and not Transamerica’s. That is why we compare, instead of sending one blind application.",
    how3T: "Then the price",
    how3: "Price follows age, sex, tobacco, and class (Preferred, Standard, tobacco). Health decides the class and whether there is a wait; we do not invent a separate discount.",
    dirH: "Coverage by condition",
    dirP: "These guides use the rules of the companies we quote. This is not a 60-disease directory: these are the situations that show up most on final expense and that we have underwriting data for.",
    d1H: "Diabetes",
    d1: "Type 1 or 2, with or without insulin, often stays on simplified issue if there are no severe complications.",
    d2H: "Heart disease",
    d2: "An old heart attack often stays simplified. Heart failure or a recent event changes the path.",
    d3H: "High blood pressure",
    d3: "It is one of the most common conditions. By itself it almost never pushes you to guaranteed acceptance.",
    d4H: "COPD",
    d4: "Many plans still quote. Tobacco and oxygen prescribed for the lungs usually narrow the options.",
    d5H: "Cancer",
    d5: "Active treatment often goes to GIWL. Cancer-free and off treatment for a time can return to simplified issue.",
    d6H: "Kidney",
    d6: "Stage and whether dialysis is in use matter more than the word “kidney.”",
    d7H: "Disability",
    d7: "A Social Security check is not the same as a “no” on the questionnaire. A wheelchair and help with bathing are reviewed separately.",
    d8H: "HIV",
    d8: "On appointed simplified-issue companies this is usually a decline. The usual path is GIWL.",
    d9H: "Stroke or TIA",
    d9: "An event years ago is not the same as one in the last two years.",
    knockH: "When simplified issue often cannot issue",
    knockP: "At appointed companies, a plan with questions often cannot issue if one of these situations applies. That is when we look at GIWL. This is not a diagnosis and not a legal list — a quote confirms the product.",
    k1: "HIV or AIDS",
    k2: "Alzheimer’s or dementia",
    k3: "Hospital, nursing home, hospice, skilled nursing, or home health care",
    k4: "Oxygen for a lung condition (not sleep apnea)",
    k5: "Wheelchair, scooter, or bedridden from illness (not a short-term injury)",
    k6: "Cancer in active treatment (some skin cancers or very early stages may still go simplified)",
    k7: "Alcohol or drug abuse, or treatment for it, in the last 24 months",
    k8: "Mental incapacity or terminal illness",
    k9: "Dialysis, end-stage kidney disease, or an organ transplant",
    knockNote: "COPD with tobacco is another common example: appointed simplified issue often declines, and GIWL may still be a path. Transamerica’s single-condition chart can still consider COPD, diabetes, or kidney disease at Standard when it is the only listed factor. The full profile — build, prescriptions, other diagnoses — decides.",
    costH: "What it costs if you qualify for a level plan",
    costP: "These premiums are illustrative level final expense, non-tobacco, appointed companies. They apply if the questionnaire issues an immediate plan. GIWL costs more at the same age and amount, and it carries a wait. Not an offer.",
    applyH: "How to apply without wrecking a future claim",
    applyP: "The company reviews what you say and what is already in prescription and claims databases. Tell the truth even if you fear a “yes.” A wrong “no” is worse than a plan with a wait.",
    faq1q: "Does a pre-existing condition stop me from buying final expense?",
    faq1a: "Not by itself. Most final expense plans exist for older adults with a medical history. What changes is whether the benefit is immediate, graded, or has a two-year wait.",
    faq2q: "Can I buy an online plan with “no exam and no waiting period”?",
    faq2a: "At the companies we quote, “no exam” still has questions. Guaranteed acceptance has no questions and always has a wait for natural death. We do not quote a product that combines both.",
    faq3q: "Do diabetes or high blood pressure send me to guaranteed acceptance?",
    faq3a: "Almost never, if that is the only condition and there are no severe complications. Quote a level plan first.",
    faq4q: "Does the price go up because I have a condition?",
    faq4a: "On a level plan, price mainly follows age, sex, and tobacco, plus class (Preferred or Standard). On GIWL, health does not change the premium — that is why it usually costs more.",
    faq5q: "Do I have to list every medication?",
    faq5a: "Yes. Companies review prescription history. A cancer, oxygen, or dialysis drug that does not match your answers can stall or void the contract.",
    faq6q: "Until what age can I buy?",
    faq6a: "It depends on the product. Many final expense plans go through 85. Accendo Level can issue through 89. Appointed GIWL usually stops at 80.",
    nextLead: "Ask for a quote with your age, tobacco, and medications, or call Mejor Vida Insurance.",
    nextMore: `If you already know the questionnaire will not pass, go straight to <a href="${L.gi}">guaranteed acceptance</a>.`,
    quote2: "Level or with a wait",
  };
}

function condHubMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const inner = `<section class="lic-section" id="paths">
<h2>${c.pathsH}</h2>
<p>${c.pathsP}</p>
<div class="lic-type-block"><h3>${c.p1T}</h3><p>${c.p1}</p></div>
<div class="lic-type-block"><h3>${c.p2T}</h3><p>${c.p2}</p></div>
<div class="lic-type-block"><h3>${c.p3T}</h3><p>${c.p3}</p></div>
</section>
<section class="lic-section" id="myth">
<h2>${c.mythH}</h2>
<p>${c.mythP}</p>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<p>${c.howP}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.how1T}.</strong> ${c.how1}</li>
<li><strong>${c.how2T}.</strong> ${c.how2}</li>
<li><strong>${c.how3T}.</strong> ${c.how3}</li>
</ol>
</section>
<section class="lic-section" id="directory">
<h2>${c.dirH}</h2>
<p>${c.dirP}</p>
<div class="lic-fact-trio lic-fact-trio--color">
<div><h3><a href="${L.diabetes}">${c.d1H}</a></h3><p>${c.d1}</p></div>
<div><h3><a href="${L.heart}">${c.d2H}</a></h3><p>${c.d2}</p></div>
<div><h3><a href="${L.hbp}">${c.d3H}</a></h3><p>${c.d3}</p></div>
</div>
<div class="lic-fact-trio">
<div><h3><a href="${L.copd}">${c.d4H}</a></h3><p>${c.d4}</p></div>
<div><h3><a href="${L.cancer}">${c.d5H}</a></h3><p>${c.d5}</p></div>
<div><h3><a href="${L.kidney}">${c.d6H}</a></h3><p>${c.d6}</p></div>
</div>
<div class="lic-fact-trio lic-fact-trio--color">
<div><h3><a href="${L.disability}">${c.d7H}</a></h3><p>${c.d7}</p></div>
<div><h3><a href="${L.hiv}">${c.d8H}</a></h3><p>${c.d8}</p></div>
<div><h3><a href="${L.stroke}">${c.d9H}</a></h3><p>${c.d9}</p></div>
</div>
</section>
<section class="lic-section" id="knockouts">
<h2>${c.knockH}</h2>
<p>${c.knockP}</p>
<ul>
<li>${c.k1}</li>
<li>${c.k2}</li>
<li>${c.k3}</li>
<li>${c.k4}</li>
<li>${c.k5}</li>
<li>${c.k6}</li>
<li>${c.k7}</li>
<li>${c.k8}</li>
<li>${c.k9}</li>
</ul>
<p class="lic-rate-note">${c.knockNote}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${feRateBlock(c, L.quote)}
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyP}</p>
</section>`;
  return condShell(lang, page, c, {
    isHub: true,
    toc: isEs
      ? [
          ["#paths", "Tipos"],
          ["#directory", "Por condición"],
          ["#knockouts", "Cuándo no"],
          ["#cost", "Costo"],
          ["#apply", "Cómo"],
          ["#faq", "Preguntas"],
        ]
      : [
          ["#paths", "Types"],
          ["#directory", "By condition"],
          ["#knockouts", "When not"],
          ["#cost", "Cost"],
          ["#apply", "How"],
          ["#faq", "Questions"],
        ],
    inner,
  });
}

/* -------------------------------------------------------------------------- */
/* Term + pre-existing conditions                                              */
/* -------------------------------------------------------------------------- */

function copyCondTerm(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? `<a href="${L.term}">Guía de seguro de vida temporal</a> — plazos, conversión y cómo se pide una cotización en Mejor Vida Seguros.`
      : `<a href="${L.term}">Term life insurance guide</a> — term lengths, conversion, and how to ask Mejor Vida Insurance for a quote.`,
    src3: isEs
      ? "Material de compañías designadas: Transamerica Trendsetter Super (gráfico de padecimientos: clase más favorable, no una oferta); Mutual of Omaha Term Life Answers (criterio Preferred Plus: sin CAD, diabetes ni cáncer, salvo piel basal/escamoso superficial) y Term Life Express (emisión simplificada, abril 2026); Corebridge Select-a-Term (mínimo $100,000; Agile Underwriting+ a edades 20–59); American Amicable Easy Term (cuestionario, sin examen en consultorio)."
      : "Appointed-company materials: Transamerica Trendsetter Super (impairment chart: best possible class, not an offer); Mutual of Omaha Term Life Answers (Preferred Plus: no CAD, diabetes, or cancer except basal/superficial squamous skin) and Term Life Express (simplified issue, April 2026); Corebridge Select-a-Term (minimum $100,000; Agile Underwriting+ ages 20–59); American Amicable Easy Term (questionnaire, no in-office exam).",
    src4: isEs
      ? "Primas ilustrativas: muestras de compañías designadas, suscripción completa Preferred Best no fumador (Integrity Connect). Cada celda es la más baja entre las que devolvieron cifra. Una condición previa suele impedir esa clase."
      : "Illustrative premiums: appointed-company samples, fully underwritten Preferred Best non-tobacco (Integrity Connect). Each cell is the lowest among appointed carriers that returned a rate. A pre-existing condition usually blocks that class.",
    src5: isEs
      ? "Term Life Express: guía de emisión simplificada (abril 2026) — condiciones múltiples por encima de tabla 4 declinan; lista de medicamentos que impiden emitir (incluye antivirales de VIH)."
      : "Term Life Express simplified-issue guide (April 2026) — multiple impairments above Table 4 decline; medication list that can stop issue (includes HIV antivirals).",
    src6: isEs
      ? `Guías de Mejor Vida Seguros: <a href="${L.hub}">gastos finales con condiciones preexistentes</a>, <a href="${L.term}">temporal</a> y <a href="${L.gi}">aceptación garantizada</a>.`
      : `Mejor Vida Insurance guides: <a href="${L.hub}">final expense with pre-existing conditions</a>, <a href="${L.term}">term life</a>, and <a href="${L.gi}">guaranteed acceptance</a>.`,
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de vida temporal con condiciones preexistentes (2026) | Mejor Vida Seguros",
      desc: "No hay temporal sin preguntas. Cómo se cotiza un plazo si ya hay un diagnóstico, clases de Trendsetter y Term Life Express, y qué hacer si el temporal no emite.",
      h1: "Seguro de vida temporal si ya tiene una condición de salud",
      lead: "El temporal cubre un número de años: hipoteca, ingreso, deudas con fecha. Una condición preexistente <strong>no es un “no” automático</strong> a ese producto. Tampoco hay un temporal de aceptación garantizada. Hay preguntas, a menudo recetas y, en montos altos, laboratorios. El precio de las tablas de internet suele ser Preferred Best: esa clase exige un historial limpio.",
      crumbEnd: "Temporal",
      take1: "Hay <strong>dos caminos de temporal</strong> en las compañías que cotizamos: suscripción completa (mejor precio por dólar, más preguntas) y emisión simplificada (Easy Term o Term Life Express: cuestionario, sin examen en el consultorio, suele costar más por dólar).",
      take2: "En Trendsetter Super, presión alta puede llegar a <strong>Preferred</strong> como mejor caso. Diabetes, infarto, EPOC o un derrame suelen quedar en <strong>Standard</strong>, no en Preferred Plus. SIDA, cáncer en tratamiento, diálisis e insuficiencia cardíaca figuran como <strong>declinación</strong> en ese gráfico.",
      take3: "Si el temporal no emite, el otro producto no es “el mismo temporal sin preguntas.” Es <a href=\"" + L.hub + "\">gastos finales</a> o, si el simplificado de entierro tampoco pasa, <a href=\"" + L.gi + "\">aceptación garantizada</a> — montos más bajos y, en GIWL, espera de dos años por muerte natural.",
      callout: "Diga el diagnóstico, la fecha, los medicamentos y si usa tabaco. Eso decide clase, monto y si el producto sigue siendo temporal — no el anuncio de “sin examen.”",
      pathsH: "Tres caminos, no un solo anuncio",
      pathsP: "El nombre comercial cambia. Lo que importa es cuántas preguntas hay y qué clase de precio puede abrir.",
      p1T: "Suscripción completa",
      p1: "Trendsetter Super, Term Life Answers, Select-a-Term y Assurity Term Life. Más detalle; a veces labs o visita paramédica. Suele abrir el mejor precio por dólar y montos de $100,000 en adelante. Preferred Plus en Mutual of Omaha pide, entre otras cosas, sin enfermedad coronaria, sin diabetes y sin cáncer (salvo piel basal o escamoso superficial).",
      p2T: "Emisión simplificada",
      p2: "Easy Term (American Amicable): plazos 10, 20 y 30; mínimo $25,000; tope $300,000 después de 45. Term Life Express: desde $25,000; tope $550,000 a los 18–50, $450,000 a los 51–60, $350,000 a los 61–75; clases Standard no fumador o fumador, sin Preferred. Sigue habiendo preguntas. No es aceptación garantizada.",
      p3T: "Cuando el temporal no emite",
      p3: `No inventamos un temporal “sin historial.” El siguiente producto es permanente de monto menor: un plan de <a href="${L.hub}">gastos finales</a> con preguntas, o GIWL si esas preguntas tampoco pueden emitir.`,
      mythH: "No existe temporal de aceptación garantizada",
      mythP: "GIWL de Corebridge no pregunta salud y cubre $5,000–$25,000 a edades 50–80, con espera de dos años por muerte natural. Eso no es un temporal de $250,000. Si un anuncio promete “sin preguntas y beneficio grande desde el día uno,” no es un producto que cotizamos.",
      chartH: "Cómo trata Trendsetter Super (mejor caso) las condiciones de esta sección",
      chartP: "El gráfico de Transamerica muestra la <strong>clase más favorable posible</strong> si ese padecimiento es el factor. Edad, fecha, gravedad, peso, tabaco y un segundo diagnóstico pueden empeorar la oferta o declinar. No es una cotización.",
      chartCol1: "Condición",
      chartCol2: "Mejor clase (Trendsetter)",
      chartCol3: "Qué suele significar",
      r1c: "Presión arterial alta",
      r1k: "Preferred",
      r1n: "Sola, a menudo sigue en temporal. Preferred Plus en Term Life Answers pide control (menos de 140/85 en ese criterio) y sin CAD, diabetes ni cáncer.",
      r2c: "Diabetes",
      r2k: "Standard",
      r2n: "No es Preferred Plus. En Term Life Express, diabetes después de los 45 con tabaco, con peso de tabla 2 o más, o con complicaciones, es declinación en esa guía.",
      r3c: "Infarto o enfermedad coronaria",
      r3k: "Standard",
      r3n: "Un infarto antiguo puede seguir en temporal a Standard. Insuficiencia cardíaca (CHF) es declinación en el mismo gráfico.",
      r4c: "EPOC o enfisema",
      r4k: "Standard",
      r4n: "Sigue en temporal en el mejor caso. Oxígeno por pulmón estrecha o cierra otros productos; dígalo.",
      r5c: "Cáncer (órgano interno, historial)",
      r5k: "Standard",
      r5n: "Cáncer en tratamiento activo: declinación. Un historial ya tratado puede cotizar; la fecha y el tipo importan.",
      r6c: "Derrame o AIT",
      r6k: "Standard",
      r6n: "Un evento antiguo no es lo mismo que uno reciente. La fecha y lo que quedó (silla, memoria) cambian el archivo.",
      r7c: "Diálisis o fallo renal",
      r7k: "Declinación",
      r7n: "En Trendsetter, fallo renal / diálisis es Decline. Entonces se mira gastos finales o GIWL, no un temporal grande.",
      r8c: "SIDA",
      r8k: "Declinación",
      r8n: "AIDS figura como Decline. No cotizamos un temporal nivelado designado para ese diagnóstico. Vea la guía de <a href=\"" + L.hiv + "\">VIH</a>.",
      chartNote: "Assurity Term Life es suscripción completa; no publicamos un gráfico público de padecimientos para ese producto. Easy Term y Term Life Express tienen sus propios cuestionarios y, en Express, una lista de medicamentos que impiden emitir.",
      howH: "Cómo cotizamos el temporal con un historial",
      howP: "No hay una “compañía de temporal para diabéticos” que gane siempre. Hay un cuestionario que encaja o no.",
      how1T: "Hechos de salud y de dinero",
      how1: "Edad, tabaco, estatura, peso, medicamentos, fechas de diagnóstico, y el plazo y el monto que la familia aún necesita. Un $10,000 de entierro no responde la misma pregunta que un $250,000 a 20 años.",
      how2T: "Completa primero si el archivo puede abrirla",
      how2: "Si el historial es presión alta controlada o un evento antiguo sin complicaciones, la suscripción completa suele ser el primer intento: mejor precio por dólar. Corebridge puede usar Agile Underwriting+ (edades 20–59, hasta $1,000,000) y pedir labs si el total en vigor más lo solicitado supera $1,000,000.",
      how3T: "Simplificada si no quiere labs o el archivo es más apretado",
      how3: "Easy Term o Term Life Express. Más rápido. En Express, varias condiciones juntas por encima de tabla 4 declinan. Una receta de la lista de exclusión (por ejemplo antivirales de VIH o ciertos fármacos de cáncer o demencia) impide Express.",
      knockH: "Cuándo el temporal designado suele no ser el producto",
      knockP: "Estas situaciones, en el material que usamos, suelen sacar el archivo del temporal grande. Entonces se mira gastos finales o GIWL. No es una lista legal completa.",
      k1: "SIDA (Decline en Trendsetter); antivirales de VIH en la lista de exclusión de Term Life Express",
      k2: "Cáncer en tratamiento activo",
      k3: "Diálisis o fallo renal",
      k4: "Insuficiencia cardíaca",
      k5: "Enfermedad terminal",
      k6: "Diabetes con complicaciones, o diabetes después de 45 con tabaco o peso de tabla 2, en Term Life Express",
      k7: "Varias condiciones que, juntas, superarían tabla 4 en Express",
      knockNote: "Una declinación de temporal no “borra” gastos finales. Son contratos distintos, con montos y preguntas distintas.",
      costH: "Qué cuestan las tablas de mejor clase (no el precio de un diagnóstico)",
      costP: "Estas primas son temporal de suscripción completa, <strong>Preferred Best no fumador</strong>, compañías designadas. Sirven para ver el tamaño del producto si el archivo abre esa clase. Diabetes, un infarto o EPOC casi nunca pagan esta fila: pagan Standard, un extra de tabla, o no emiten. Easy Term y Term Life Express se cotizan aparte y suelen costar más por dólar.",
      termShow: "Muestre un plazo:",
      termFaceLabel: "Montos de temporal",
      coH: "Compañías designadas (temporal)",
      coP: "Fichas educativas. El estado, el tabaco y el historial cambian la oferta. Licencias actuales: página de licencias.",
      coTaTermProduct: "Trendsetter Super",
      coTaTermAges: "18 hasta el tope del plazo (10 años: 80 no fumador)",
      coTaTermAmt: "$100,000–$5,000,000 en cotizaciones típicas",
      coTaTermExam: "Completa (puede incluir labs)",
      coMooTermProduct: "Term Life Answers",
      coMooTermAges: "18 hasta el tope del plazo (10 años: 80 no fumador)",
      coMooTermAmt: "$100,000–$5,000,000 en cotizaciones típicas",
      coMooTermExam: "Completa",
      coAsTermProduct: "Term Life",
      coAsTermAges: "18 hasta el tope (10 años: 80 no fumador)",
      coAsTermAmt: "$100,000–$1,000,000",
      coAsTermExam: "Completa",
      coAmTermProduct: "Easy Term",
      coAmTermAges: "18–75 (10 años); 18–55 (30 años)",
      coAmTermAmt: "$25,000–$500,000 (tope $300,000 después de 45)",
      coAmTermExam: "Simplificada (sin examen en consultorio)",
      coTermFoot: "También hay Mutual of Omaha Term Life Express (desde $25,000; tope según edad) y Corebridge Select-a-Term (mínimo $100,000). Educativo — no es cotización vinculante.",
      faq1q: "¿Puedo comprar temporal si ya tengo un diagnóstico?",
      faq1a: "A menudo sí, a otra clase de precio o a un monto menor. No hay temporal sin preguntas. Cotice con la fecha, los medicamentos y el tabaco reales.",
      faq2q: "¿Hay temporal de aceptación garantizada?",
      faq2a: "No en las compañías que cotizamos. La aceptación garantizada es un producto permanente pequeño, con espera por muerte natural. Vea la guía de aceptación garantizada.",
      faq3q: "¿La diabetes me deja en la tarifa más baja de internet?",
      faq3a: "Casi nunca. Preferred Plus en Term Life Answers pide, entre otras cosas, sin diabetes. En Trendsetter, diabetes como único factor suele ser Standard como mejor caso. En Term Life Express, diabetes con tabaco o con complicaciones suele declinar.",
      faq4q: "Tuve un infarto hace años. ¿Sigue el temporal?",
      faq4a: "Puede, a Standard en el gráfico de Trendsetter si es el único factor. CHF es Decline. Un evento reciente, un stent reciente o insuficiencia cambian el archivo. Vea también la guía de corazón (gastos finales).",
      faq5q: "¿Tengo que hacer examen de sangre?",
      faq5a: "En Easy Term y Term Life Express, no hay cita de laboratorio en el consultorio. En suscripción completa, según edad y monto, sí puede haber labs. Select-a-Term pide examen si el total en Corebridge más lo solicitado supera $1,000,000.",
      faq6q: "El temporal me rechazó. ¿Se acabó el seguro?",
      faq6a: "No. El siguiente paso es gastos finales con preguntas, o GIWL si esas tampoco emiten. Son productos distintos, no “el mismo temporal más barato.”",
      faq7q: "¿El VIH abre un temporal nivelado?",
      faq7a: "No en lo que cotizamos. Trendsetter lista AIDS como Decline. Term Life Express excluye medicamentos de esa línea. El camino habitual es GIWL. Vea la página de VIH.",
      faq8q: "¿El tabaco solo sube el precio o también cierra el producto?",
      faq8a: "El tabaco suele ser una clase más cara, no un cierre por sí solo. Combinado — diabetes después de 45 y nicotina en Express, o EPOC y tabaco — sí puede declinar. Diga nicotina de 12 meses.",
      nextLead: "Pida una cotización de temporal con su edad, tabaco, plazo y medicamentos, o llame a Mejor Vida Seguros.",
      nextMore: `Si el monto que necesita es de entierro, no de ingreso, empiece por <a href="${L.hub}">gastos finales con condiciones preexistentes</a>.`,
      nextPrimary: "Ver precios de temporal",
      nextPrimaryHref: L.termQuote,
      quoteTitle: "Cotizar temporal",
      quote1: "Compañías designadas",
      quote2: "Según su salud y plazo",
      quoteCta: "Ver precios",
    };
  }
  return {
    ...b,
    ...src,
    title: "Term life insurance with pre-existing conditions (2026) | Mejor Vida Insurance",
    desc: "There is no no-questions term. How a term quote works if you already have a diagnosis, Trendsetter and Term Life Express classes, and what to do if term will not issue.",
    h1: "Term life insurance if you already have a health condition",
    lead: "Term covers a set number of years: a mortgage, income, debts with a date. A pre-existing condition is <strong>not an automatic no</strong> on that product. There is also no guaranteed-acceptance term. There are questions, often prescriptions, and on larger amounts, labs. The tables you see online are usually Preferred Best: that class needs a clean history.",
    crumbEnd: "Term",
    take1: "There are <strong>two term paths</strong> at the companies we quote: fully underwritten (better price per dollar, more questions) and simplified issue (Easy Term or Term Life Express: a questionnaire, no in-office exam, usually more per dollar).",
    take2: "On Trendsetter Super, high blood pressure can reach <strong>Preferred</strong> as a best case. Diabetes, a heart attack, COPD, or a stroke usually land at <strong>Standard</strong>, not Preferred Plus. AIDS, cancer in treatment, dialysis, and congestive heart failure are <strong>Decline</strong> on that chart.",
    take3: "If term will not issue, the other product is not “the same term with no questions.” It is <a href=\"" + L.hub + "\">final expense</a> or, if that questionnaire also fails, <a href=\"" + L.gi + "\">guaranteed acceptance</a> — smaller amounts and, on GIWL, a two-year wait for natural death.",
    callout: "Give the diagnosis, the date, the medications, and whether you use tobacco. That decides class, amount, and whether the product is still term — not the “no exam” headline.",
    pathsH: "Three paths, not one ad",
    pathsP: "The brand name changes. What matters is how many questions there are and which price class can open.",
    p1T: "Fully underwritten",
    p1: "Trendsetter Super, Term Life Answers, Select-a-Term, and Assurity Term Life. More detail; sometimes labs or a paramedical visit. Usually the best price per dollar and amounts from $100,000 up. Preferred Plus at Mutual of Omaha asks, among other things, for no coronary disease, no diabetes, and no cancer (except basal or superficial squamous skin).",
    p2T: "Simplified issue",
    p2: "Easy Term (American Amicable): 10-, 20-, and 30-year terms; $25,000 minimum; $300,000 cap after age 45. Term Life Express: from $25,000; caps $550,000 at 18–50, $450,000 at 51–60, $350,000 at 61–75; Standard non-tobacco or tobacco only — no Preferred. There are still questions. It is not guaranteed acceptance.",
    p3T: "When term will not issue",
    p3: `We do not invent a “no-history term.” The next product is a smaller permanent plan: <a href="${L.hub}">final expense</a> with questions, or GIWL if those questions cannot issue either.`,
    mythH: "There is no guaranteed-acceptance term",
    mythP: "Corebridge GIWL asks no health questions and covers $5,000–$25,000 at ages 50–80, with a two-year wait for natural death. That is not $250,000 of term. If an ad promises “no questions and a large benefit from day one,” it is not a product we quote.",
    chartH: "How Trendsetter Super (best case) treats the conditions in this section",
    chartP: "Transamerica’s chart shows the <strong>best possible class</strong> if that impairment is the factor. Age, date, severity, build, tobacco, and a second diagnosis can worsen the offer or decline it. Not a quote.",
    chartCol1: "Condition",
    chartCol2: "Best class (Trendsetter)",
    chartCol3: "What that usually means",
    r1c: "High blood pressure",
    r1k: "Preferred",
    r1n: "Alone, term often stays open. Preferred Plus on Term Life Answers wants control (under 140/85 in that criterion) and no CAD, diabetes, or cancer.",
    r2c: "Diabetes",
    r2k: "Standard",
    r2n: "Not Preferred Plus. On Term Life Express, diabetes after age 45 with tobacco, with Table 2 or higher build, or with complications, is a decline in that guide.",
    r3c: "Heart attack or coronary disease",
    r3k: "Standard",
    r3n: "An old heart attack can still be term at Standard. Congestive heart failure is Decline on the same chart.",
    r4c: "COPD or emphysema",
    r4k: "Standard",
    r4n: "Still term in the best case. Oxygen for a lung condition narrows or closes other products; say so.",
    r5c: "Cancer (internal organ, history)",
    r5k: "Standard",
    r5n: "Cancer in active treatment: Decline. A treated history can still quote; the date and type matter.",
    r6c: "Stroke or TIA",
    r6k: "Standard",
    r6n: "An old event is not the same as a recent one. The date and what remained (a chair, memory) change the file.",
    r7c: "Dialysis or kidney failure",
    r7k: "Decline",
    r7n: "On Trendsetter, kidney failure / dialysis is Decline. Then look at final expense or GIWL, not large term.",
    r8c: "AIDS",
    r8k: "Decline",
    r8n: "AIDS is listed as Decline. We do not quote an appointed level term for that diagnosis. See the <a href=\"" + L.hiv + "\">HIV</a> guide.",
    chartNote: "Assurity Term Life is fully underwritten; we do not publish a public impairment chart for that product. Easy Term and Term Life Express have their own questionnaires and, on Express, a medication list that can stop issue.",
    howH: "How we quote term with a history",
    howP: "There is no “term company for people with diabetes” that always wins. There is a questionnaire that fits or does not.",
    how1T: "Health facts and money facts",
    how1: "Age, tobacco, height, weight, medications, diagnosis dates, and the term and amount the family still needs. A $10,000 burial plan does not answer the same question as $250,000 for 20 years.",
    how2T: "Fully underwritten first if the file can open it",
    how2: "If the history is controlled high blood pressure or an old event without complications, fully underwritten is usually the first try: better price per dollar. Corebridge can use Agile Underwriting+ (ages 20–59, up to $1,000,000) and require labs if in-force plus applied-for exceeds $1,000,000.",
    how3T: "Simplified if you do not want labs or the file is tighter",
    how3: "Easy Term or Term Life Express. Faster. On Express, several conditions together above Table 4 decline. A drug on the exclusion list (for example HIV antivirals or certain cancer or dementia drugs) stops Express.",
    knockH: "When appointed term is usually not the product",
    knockP: "These situations, in the material we use, usually move the file off large term. Then we look at final expense or GIWL. Not a complete legal list.",
    k1: "AIDS (Decline on Trendsetter); HIV antivirals on the Term Life Express exclusion list",
    k2: "Cancer in active treatment",
    k3: "Dialysis or kidney failure",
    k4: "Congestive heart failure",
    k5: "Terminal illness",
    k6: "Diabetes with complications, or diabetes after 45 with tobacco or Table 2 build, on Term Life Express",
    k7: "Several conditions that together would exceed Table 4 on Express",
    knockNote: "A term decline does not erase final expense. Those are different contracts, with different amounts and questions.",
    costH: "What the best-class tables cost (not the price of a diagnosis)",
    costP: "These premiums are fully underwritten term, <strong>Preferred Best non-tobacco</strong>, appointed companies. They show the size of the product if the file opens that class. Diabetes, a heart attack, or COPD almost never pay this row: they pay Standard, a table extra, or they do not issue. Easy Term and Term Life Express are quoted separately and usually cost more per dollar.",
    termShow: "Show a term:",
    termFaceLabel: "Term amounts",
    coH: "Appointed companies (term)",
    coP: "Educational cards. State, tobacco, and history change the offer. Current licenses: licenses page.",
    coTaTermProduct: "Trendsetter Super",
    coTaTermAges: "18 through the term maximum (10-year: 80 non-tobacco)",
    coTaTermAmt: "$100,000–$5,000,000 on typical quotes",
    coTaTermExam: "Full (may include labs)",
    coMooTermProduct: "Term Life Answers",
    coMooTermAges: "18 through the term maximum (10-year: 80 non-tobacco)",
    coMooTermAmt: "$100,000–$5,000,000 on typical quotes",
    coMooTermExam: "Full",
    coAsTermProduct: "Term Life",
    coAsTermAges: "18 through the maximum (10-year: 80 non-tobacco)",
    coAsTermAmt: "$100,000–$1,000,000",
    coAsTermExam: "Full",
    coAmTermProduct: "Easy Term",
    coAmTermAges: "18–75 (10-year); 18–55 (30-year)",
    coAmTermAmt: "$25,000–$500,000 ($300,000 cap after 45)",
    coAmTermExam: "Simplified (no in-office exam)",
    coTermFoot: "Also Mutual of Omaha Term Life Express (from $25,000; cap by age) and Corebridge Select-a-Term ($100,000 minimum). Educational — not a binding quote.",
    faq1q: "Can I buy term if I already have a diagnosis?",
    faq1a: "Often yes, at another price class or a smaller amount. There is no no-questions term. Quote with the real date, medications, and tobacco.",
    faq2q: "Is there guaranteed-acceptance term?",
    faq2a: "Not at the companies we quote. Guaranteed acceptance is a small permanent product with a wait for natural death. See the guaranteed-acceptance guide.",
    faq3q: "Does diabetes get me the lowest internet rate?",
    faq3a: "Almost never. Preferred Plus on Term Life Answers asks, among other things, for no diabetes. On Trendsetter, diabetes as the only factor is usually Standard as a best case. On Term Life Express, diabetes with tobacco or with complications usually declines.",
    faq4q: "I had a heart attack years ago. Is term still open?",
    faq4a: "It can be, at Standard on the Trendsetter chart if that is the only factor. CHF is Decline. A recent event, a recent stent, or heart failure change the file. See also the heart (final expense) guide.",
    faq5q: "Do I have to do a blood test?",
    faq5a: "On Easy Term and Term Life Express, there is no in-office lab visit. On fully underwritten, depending on age and amount, there may be labs. Select-a-Term requires an exam if Corebridge in-force plus applied-for exceeds $1,000,000.",
    faq6q: "Term declined me. Is insurance over?",
    faq6a: "No. The next step is final expense with questions, or GIWL if those cannot issue either. Those are different products, not “the same term cheaper.”",
    faq7q: "Does HIV open a level term plan?",
    faq7a: "Not on what we quote. Trendsetter lists AIDS as Decline. Term Life Express excludes medications in that line. The usual path is GIWL. See the HIV page.",
    faq8q: "Does tobacco only raise the price, or can it close the product?",
    faq8a: "Tobacco is usually a higher class, not a close by itself. Combined — diabetes after 45 and nicotine on Express, or COPD and tobacco — it can decline. Say nicotine in the last 12 months.",
    nextLead: "Ask for a term quote with your age, tobacco, term length, and medications, or call Mejor Vida Insurance.",
    nextMore: `If the amount you need is burial, not income, start with <a href="${L.hub}">final expense with pre-existing conditions</a>.`,
    nextPrimary: "See term prices",
    nextPrimaryHref: L.termQuote,
    quoteTitle: "Quote term",
    quote1: "Appointed companies",
    quote2: "For your health and term",
    quoteCta: "See prices",
  };
}

function condTermMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const inner = `<section class="lic-section" id="paths">
<h2>${c.pathsH}</h2>
<p>${c.pathsP}</p>
<div class="lic-type-block"><h3>${c.p1T}</h3><p>${c.p1}</p></div>
<div class="lic-type-block"><h3>${c.p2T}</h3><p>${c.p2}</p></div>
<div class="lic-type-block"><h3>${c.p3T}</h3><p>${c.p3}</p></div>
</section>
<section class="lic-section" id="myth">
<h2>${c.mythH}</h2>
<p>${c.mythP}</p>
</section>
<section class="lic-section" id="chart">
<h2>${c.chartH}</h2>
<p>${c.chartP}</p>
<div class="lic-rate-wrap">
<table class="lic-rate-table lic-rate-table--lesson">
<thead><tr><th scope="col">${c.chartCol1}</th><th scope="col">${c.chartCol2}</th><th scope="col">${c.chartCol3}</th></tr></thead>
<tbody>
<tr><td>${c.r1c}</td><td>${c.r1k}</td><td>${c.r1n}</td></tr>
<tr><td>${c.r2c}</td><td>${c.r2k}</td><td>${c.r2n}</td></tr>
<tr><td>${c.r3c}</td><td>${c.r3k}</td><td>${c.r3n}</td></tr>
<tr><td>${c.r4c}</td><td>${c.r4k}</td><td>${c.r4n}</td></tr>
<tr><td>${c.r5c}</td><td>${c.r5k}</td><td>${c.r5n}</td></tr>
<tr><td>${c.r6c}</td><td>${c.r6k}</td><td>${c.r6n}</td></tr>
<tr><td>${c.r7c}</td><td>${c.r7k}</td><td>${c.r7n}</td></tr>
<tr><td>${c.r8c}</td><td>${c.r8k}</td><td>${c.r8n}</td></tr>
</tbody>
</table>
</div>
<p class="lic-rate-note">${c.chartNote}</p>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<p>${c.howP}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.how1T}.</strong> ${c.how1}</li>
<li><strong>${c.how2T}.</strong> ${c.how2}</li>
<li><strong>${c.how3T}.</strong> ${c.how3}</li>
</ol>
</section>
<section class="lic-section" id="knockouts">
<h2>${c.knockH}</h2>
<p>${c.knockP}</p>
<ul>
<li>${c.k1}</li>
<li>${c.k2}</li>
<li>${c.k3}</li>
<li>${c.k4}</li>
<li>${c.k5}</li>
<li>${c.k6}</li>
<li>${c.k7}</li>
</ul>
<p class="lic-rate-note">${c.knockNote}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${termRateBlock(c, L.termQuote)}
</section>
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<p>${c.coP}</p>
${termAppointedCardsHtml(lang, c)}
</section>`;
  return condShell(lang, page, c, {
    quoteHref: L.termQuote,
    toc: isEs
      ? [
          ["#paths", "Tipos"],
          ["#chart", "Por condición"],
          ["#knockouts", "Cuándo no"],
          ["#cost", "Costo"],
          ["#companies", "Compañías"],
          ["#faq", "Preguntas"],
        ]
      : [
          ["#paths", "Types"],
          ["#chart", "By condition"],
          ["#knockouts", "When not"],
          ["#cost", "Cost"],
          ["#companies", "Companies"],
          ["#faq", "Questions"],
        ],
    inner,
  });
}

function conditionInner(lang, c, opts) {
  const L = LINKS[lang];
  const showGi = opts.showGi;
  const showSi = opts.showSi !== false;
  return `<section class="lic-section" id="what">
<h2>${c.whatH}</h2>
<p>${c.whatP1}</p>
<p>${c.whatP2}</p>
</section>
<section class="lic-section" id="uw">
<h2>${c.uwH}</h2>
<p>${c.uwP}</p>
${c.uwNote ? `<div class="lic-helpful"><p>${c.uwNote}</p></div>` : ""}
</section>
<section class="lic-section" id="changes">
<h2>${c.chH}</h2>
<p>${c.chP}</p>
<ul>
<li>${c.ch1}</li>
<li>${c.ch2}</li>
<li>${c.ch3}</li>
${c.ch4 ? `<li>${c.ch4}</li>` : ""}
</ul>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${showGi ? giRateBlock(c, L.quote) : feRateBlock(c, L.quote)}
</section>
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<p>${c.coP}</p>
${showSi ? appointedCardsHtml(lang, c) : ""}
${showGi ? giCardHtml(lang, c) : ""}
</section>`;
}

/* -------------------------------------------------------------------------- */
/* Diabetes                                                                    */
/* -------------------------------------------------------------------------- */

function copyDiabetes(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.cdc.gov/diabetes/about/index.html" rel="noopener" target="_blank">CDC: diabetes</a> — qué es, tipos y por qué el control importa para la salud, no como regla de una aseguradora.'
      : '<a href="https://www.cdc.gov/diabetes/about/index.html" rel="noopener" target="_blank">CDC: diabetes</a> — what it is, types, and why control matters for health — not as an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.niddk.nih.gov/health-information/diabetes" rel="noopener" target="_blank">NIDDK: diabetes</a> — insulina, tipo 1 y 2, hipoglucemia grave y complicaciones (riñón, nervios). <a href="https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/diabetic-retinopathy" rel="noopener" target="_blank">NEI: retinopatía diabética</a> — daño en los ojos.'
      : '<a href="https://www.niddk.nih.gov/health-information/diabetes" rel="noopener" target="_blank">NIDDK: diabetes</a> — insulin, type 1 and 2, severe hypoglycemia, and complications (kidney, nerves). <a href="https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/diabetic-retinopathy" rel="noopener" target="_blank">NEI: diabetic retinopathy</a> — eye damage.',
    src6: isEs
      ? `Guías de Mejor Vida Seguros: <a href="${L.hub}">condiciones preexistentes</a>, <a href="${L.termCond}">temporal con condiciones previas</a>, <a href="${L.noWait}">sin período de espera</a> y <a href="${L.gi}">aceptación garantizada</a>.`
      : `Mejor Vida Insurance guides: <a href="${L.hub}">pre-existing conditions</a>, <a href="${L.termCond}">term with pre-existing conditions</a>, <a href="${L.noWait}">no waiting period</a>, and <a href="${L.gi}">guaranteed acceptance</a>.`,
  });
  src.src5 = "";
  if (isEs) {
    return {
      ...b,
      ...src,
      coGiProduct: "GIWL (vida entera de emisión garantizada)",
      coGiFoot: "Una póliza GIWL (vida entera de emisión garantizada) por asegurado cada 12 meses; el total de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      title: "Seguro de gastos finales con diabetes: cómo se revisa (2026) | Mejor Vida Seguros",
      desc: "Cómo funciona el seguro de gastos finales si tiene diabetes tipo 1 o 2. Qué mira una aseguradora, qué podemos verificar en compañías designadas y cuándo hay que decir que no lo sabemos.",
      h1: "¿Puede comprar gastos finales si tiene diabetes?",
      lead: "A menudo sí. La diabetes es uno de los historiales más comunes en pólizas pequeñas de entierro. La palabra “diabetes” <strong>no es un rechazo automático</strong> y <strong>no es una espera automática de dos años</strong>. Lo que la compañía revisa es el resto del archivo: el tratamiento, las complicaciones, otros diagnósticos y el tabaco.",
      crumbEnd: "Diabetes",
      take1: "Un diagnóstico no lo encierra, por sí solo, en aceptación garantizada. Muchas personas contestan un cuestionario corto y, si esas respuestas caben, reciben un <strong>plan nivelado</strong>: el monto completo puede pagar desde el primer pago cubierto.",
      take2: "La compañía mira el cuadro completo — tipo, insulina o pastillas, complicaciones, recetas ya surtidas y otras condiciones — no solo la palabra “diabetes.”",
      take3: "Una póliza sin preguntas de salud espera unos dos años por muerte natural y suele cubrir menos. Ese producto se llama GIWL: vida entera de emisión garantizada. Existe. No es el primer intento para una diabetes típica y controlada.",
      callout: "Las primas de muestra más abajo son de un plan nivelado si el cuestionario emite. No hay una “tarifa diabetes” aparte: el precio sigue a edad, sexo y tabaco. No es una oferta.",
      needH: "La pregunta que la gente trae",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. Medicare no paga esa cuenta. Gastos finales es un seguro de vida permanente, de monto pequeño, pensado para esa factura — no sustituye una póliza grande de ingresos.",
      needP2: "Si tiene tipo 1 o tipo 2, o usa insulina, el miedo suele ser el mismo: “¿Me van a vender algo, o solo un plan que espera dos años?” El resto de la página explica cómo se toma esa decisión <strong>antes</strong> de nombrar compañías.",
      whatH: "Qué es la diabetes (la idea médica, no la solicitud)",
      whatP1: "El CDC describe la diabetes como una enfermedad en la que el azúcar en la sangre queda demasiado alta porque el cuerpo no produce suficiente insulina o no la usa bien. El tipo 1 suele necesitar insulina desde el inicio. El tipo 2 es más frecuente en adultos y puede tratarse con comida, pastillas, insulina o una mezcla.",
      whatP2: "El NIDDK describe complicaciones que pueden seguir a años de glucosa alta: enfermedad renal, daño en los nervios (neuropatía) y daño en los ojos (retinopatía). Eso es salud. No es, por sí solo, el sí o el no de una aseguradora.",
      whatP3: "Una aseguradora no trata la diabetes. Decide si el historial, como queda escrito y como aparece en bases de recetas, cabe en un producto que está dispuesta a emitir.",
      howH: "Cómo el seguro de vida revisa un historial de salud",
      howP1: "En gastos finales el camino habitual es emisión simplificada: no hay examen en el consultorio, pero sí hay preguntas de salud. La compañía también mira recetas que usted ya surtió. Un “no” que debió ser “sí” puede frenar o anular un reclamo. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega el reclamo.",
      howP2: "Si esas preguntas se pueden contestar sin chocar con la lista de declinación de ese producto, el plan suele ser nivelado o inmediato: el monto completo puede aplicar a una muerte natural cubierta desde el primer pago. Si no puede emitir así, algunos productos ofrecen un beneficio gradual o modificado (pago limitado o devolución de primas al inicio). Si tampoco puede emitir, la vida entera de emisión garantizada (GIWL) no hace preguntas de salud y espera unos dos años por muerte natural.",
      howP3: "El seguro temporal con suscripción completa es otro producto: montos más altos, más detalle, a veces laboratorios, y suele costar menos por dólar si el archivo lo abre. La diabetes casi nunca deja la clase más barata de internet. Si la necesidad es ingreso o hipoteca, no entierro, vea la guía de <a href=\"" + L.termCond + "\">temporal con condiciones previas</a>.",
      pathsH: "Tres tipos de plan, en lenguaje sencillo",
      path1T: "Nivelado o inmediato",
      path1: "Hay preguntas. Si la compañía emite, el monto completo puede aplicar desde el primer pago cubierto. Suele ser el precio más bajo por dólar de estos tres.",
      path2T: "Gradual o modificado",
      path2: "Sigue habiendo preguntas. En los primeros años, una muerte no accidental puede pagar solo una parte del monto o devolver primas más el interés del contrato. En Accendo Modified, los años uno y dos suelen devolver el 110% de las primas pagadas; el monto completo aplica después. Otras compañías escriben ese período de otra forma.",
      path3T: "Aceptación garantizada",
      path3: "No hay preguntas de salud. Dentro de la edad y el monto, el historial médico no lo declina. Siempre hay unos dos años de espera por muerte no accidental. Ese producto se llama GIWL: vida entera de emisión garantizada. El que cotizamos es edades 50–80 y $5,000–$25,000.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Los anuncios que mezclan las dos cosas casi siempre siguen teniendo cuestionario.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja: puede abrir más monto, un precio más bajo y sin espera de dos años. El límite es que el mismo cuestionario puede mandarlo a una espera, a una clase más cara o a emisión garantizada si se acumulan complicaciones, otros diagnósticos, tabaco o peso. Esperar a solicitar “cuando esté más sano” solo sube la edad si la diabetes ya está estable.",
      factorsH: "Qué puede cambiar una solicitud con diabetes",
      factorsP: "Cada tarjeta empieza con la idea de salud en lenguaje sencillo y luego lista solo lo que podemos verificar en compañías designadas. Esas notas suponen que la diabetes es el único factor. El peso, el tabaco, un segundo diagnóstico o varias condiciones listadas juntas todavía pueden cambiar la clase o declinar.",
      factorsNote: "Estas notas no son una cotización. La solicitud en vivo sigue decidiendo.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Qué podemos verificar",
      f1c: "Insulina",
      f1w: "La insulina es un tratamiento, no un diagnóstico por sí sola. El tipo 1 casi siempre la usa; algunas personas con tipo 2 también.",
      f1items: [
        "La insulina y las pastillas habituales de diabetes no están en la lista publicada de medicamentos no elegibles de Living Promise.",
        "El gráfico de Transamerica Immediate Solution sigue dejando tipo 1 y 2 en Standard cuando la diabetes es el único factor listado.",
        "Eso no es una promesa de que todo cuestionario emita.",
      ],
      f2c: "Tipo 1 o tipo 2",
      f2w: "Son enfermedades distintas. El tipo 1 suele empezar más joven y usa insulina de por vida.",
      f2items: [
        "En Transamerica Immediate Solution ambos quedan Standard si es el único factor.",
        "Solo durante el embarazo puede ir a Preferred en ese mismo gráfico.",
        "No tenemos un gráfico público de Accendo que trate el tipo 1 como declinación automática.",
      ],
      f3c: "Edad al diagnóstico",
      f3w: "Algunas solicitudes preguntan cuándo empezó la diabetes.",
      f3items: [
        "La guía de emisión simplificada de Mutual of Omaha lista “diabetes (antes de una edad especificada)” entre padecimientos que pueden ajustar o declinar.",
        "No publica un solo corte público de Living Promise en esa lista.",
        "Otro producto — Term Life Express — sí publica declinaciones para ciertas combinaciones de diabetes después de los 45 (50 en California y las Islas Vírgenes). No usamos esa cifra de Express como si fuera Living Promise.",
      ],
      f4c: "Coma diabético",
      f4w: "Un coma por azúcar muy alta o muy baja es un evento grave. El NIDDK describe la hipoglucemia severa como urgencia médica.",
      f4items: [
        "Transamerica Immediate Solution lista el coma diabético como declinación en el gráfico de un solo padecimiento.",
        "Entonces se mira GIWL (vida entera de emisión garantizada) si hay edad y monto.",
        "No publicamos una regla de “después de dos años queda Preferred”: no está en ese gráfico.",
      ],
      f5c: "Shock por insulina",
      f5w: "Una baja grave de azúcar puede aparecer en formularios viejos como “insulin shock.” Otras compañías dicen hipoglucemia que requirió tratamiento.",
      f5items: [
        "El cuestionario largo de diabetes de Americo (usado en algunos productos, no como lista pública de descalificadores de Eagle Select) pregunta por shock de insulina.",
        "No tenemos una línea publicada de Living Promise o Accendo que diga que todo antecedente de shock declina, ni que siempre aplique una espera de dos años.",
        "Diga si ocurrió y cuándo.",
      ],
      f6c: "Amputación",
      f6w: "Una amputación por mala circulación o infección no es lo mismo que perder un miembro en un accidente.",
      f6items: [
        "Transamerica Immediate Solution: amputación que no sea por accidente o trauma es declinación.",
        "Americo Eagle Select: amputación por enfermedad está en la lista de declinación.",
        "GIWL (vida entera de emisión garantizada) puede seguir abierto.",
      ],
      f7c: "Riñón, nervios, ojos",
      f7w: "El NIDDK y el Instituto Nacional del Ojo describen nefropatía, neuropatía y retinopatía como complicaciones frecuentes.",
      f7items: [
        "La guía simplificada de Mutual of Omaha lista diabetes con retinopatía, nefropatía o neuropatía entre padecimientos que pueden ajustar o declinar.",
        "En Eagle Select, una complicación de diabetes suele no quedarse en la clase más alta; el e-app aún puede ofrecer una clase más baja si no hay un descalificador.",
      ],
      f8c: "Estatura y peso",
      f8w: "La mayoría de los productos simplificados piden estatura y peso.",
      f8items: [
        "Americo Eagle Select publica un rango de contextura.",
        "Otras compañías designadas también lo revisan; no republicamos cada tabla aquí.",
        "Un peso muy alto o muy bajo puede cambiar la clase o impedir el simplificado aunque la diabetes esté estable.",
      ],
      costH: "Cuánto cuesta un plan nivelado (si califica)",
      costP: "Estas cifras son primas mensuales ilustrativas de gastos finales nivelados, no fumador, compañías designadas. Léalas como el tamaño del producto si el cuestionario emite un plan inmediato — no como el precio de “tener diabetes.” Un plan GIWL (vida entera de emisión garantizada) a la misma edad cuesta más y espera dos años por muerte natural.",
      coH: "Compañías designadas",
      coP: "Compare estas fichas y luego cotice. Un “Standard” en un gráfico de un solo padecimiento no sustituye la solicitud completa. “Sin espera de 2 años” aplica al plan nivelado o inmediato, no a GIWL (vida entera de emisión garantizada).",
      faq1q: "¿Puedo tener gastos finales si uso insulina?",
      faq1a: "A menudo sí, en emisión simplificada. La insulina no es, por sí sola, el mismo problema que un coma, una amputación o la diálisis. Cotice con el tipo y los medicamentos reales.",
      faq2q: "¿El tipo 1 es peor que el tipo 2 para el seguro?",
      faq2a: "En el gráfico de Transamerica Immediate Solution ambos quedan Standard si es el único factor. El tipo 1 a veces viene con más años de enfermedad y más complicaciones; esas complicaciones son las que cambian el producto, no el número “1” o “2” por sí solo.",
      faq3q: "¿Hay que hacer examen de sangre?",
      faq3a: "En estos gastos finales simplificados no hay cita de laboratorio. Sí hay preguntas y revisión de recetas. Vea <a href=\"" + L.exam + "\">sin examen médico</a>.",
      faq4q: "¿La diabetes me obliga a aceptación garantizada?",
      faq4a: "No como primer paso. GIWL (vida entera de emisión garantizada) entra cuando el simplificado no puede emitir — por ejemplo coma diabético, amputación no traumática, o diálisis y cáncer activo al mismo tiempo. No es el primer intento para una diabetes controlada sin esas señales.",
      faq5q: "¿Debo decir la fecha de diagnóstico?",
      faq5a: "Sí, si la pregunta existe. Las compañías cruzan recetas. Una fecha inventada no ayuda.",
      faq6q: "¿El A1C aparece en la solicitud?",
      faq6a: "Algunos cuestionarios más largos de Americo (otros productos, no una grilla pública de Eagle Select) piden A1C. En gastos finales simplificado el detalle varía. Tenga el número a mano; no lo redondee hacia “mejor.” No publicamos un corte de A1C de Accendo porque no está en nuestro extracto.",
      faq7q: "¿La neuropatía o la retinopatía cierran el plan inmediato?",
      faq7a: "No lo afirmamos para todas las compañías. Mutual of Omaha lista esas complicaciones entre padecimientos que pueden ajustar o declinar. Eagle Select suele bajar de la clase más alta. Transamerica Immediate Solution no publica una fila aparte para nervios u ojos. Diga lo que el médico escribió; no adivinamos un “sí” universal.",
      faq8q: "¿Debo esperar a estar “más sano” para solicitar?",
      faq8a: "Si acaba de haber un coma, una amputación o un infarto, a veces sí conviene dejar pasar la ventana que pregunta la compañía. Si la diabetes lleva años estable, esperar solo encarece la edad. Cotice ahora con hechos reales.",
      nextLead: "Vea precios, o agende una llamada con Mejor Vida Seguros.",
      nextMore: "",
      nextSecondary: "Agendar una llamada",
      nextSecondaryHref: L.schedule,
    };
  }
  return {
    ...b,
    ...src,
    coGiProduct: "GIWL (guaranteed-issue whole life — no health questions)",
    coGiFoot: "One GIWL (guaranteed-issue whole life) policy per insured every 12 months; that company’s GIWL total does not exceed $25,000. Educational — not a binding quote.",
    title: "Final expense insurance with diabetes: how it is reviewed (2026) | Mejor Vida Insurance",
    desc: "How final expense insurance works if you have type 1 or type 2 diabetes. What an insurer reviews, what we can verify at appointed companies, and where we say we do not know.",
    h1: "Can you buy final expense insurance if you have diabetes?",
    lead: "Often yes. Diabetes is one of the most common histories we see on burial-size whole life. The word “diabetes” is <strong>not an automatic decline</strong> and it is <strong>not an automatic two-year wait</strong>. What the company reviews is the rest of the file: treatment, complications, other diagnoses, and tobacco.",
    crumbEnd: "Diabetes",
    take1: "A diagnosis does not, by itself, lock you into guaranteed acceptance. Many people still complete a short health questionnaire and, if those answers fit, receive a <strong>level plan</strong>: the full amount can pay from the first covered payment.",
    take2: "The company looks at the whole picture — type, insulin or pills, complications, prescriptions already on file, and other conditions — not the word “diabetes” alone.",
    take3: "A policy with no health questions waits about two years for natural death and usually covers less. That product is called GIWL: guaranteed-issue whole life. It exists. It is not the first try for typical, controlled diabetes.",
    callout: "Sample premiums later on this page are for a level plan if the questionnaire issues. There is no separate “diabetes rate”: price still follows age, sex, and tobacco. Not an offer.",
    needH: "The question people actually bring",
    needP1: "Families shop this coverage because a funeral, cemetery plot, and leftover bills can land on relatives. Medicare does not pay that bill. Final expense is a small permanent life policy meant for that invoice — not a substitute for a large income policy.",
    needP2: "If you have type 1 or type 2, or you use insulin, the fear is usually the same: “Will they sell me anything, or only a plan that waits two years?” The rest of this page explains how that decision is made <strong>before</strong> we name companies.",
    whatH: "What diabetes is (the medical idea, not the application)",
    whatP1: "The CDC describes diabetes as a disease where blood sugar stays too high because the body does not make enough insulin or does not use insulin well. Type 1 usually needs insulin from the start. Type 2 is more common in adults and may be treated with food, pills, insulin, or a mix.",
    whatP2: "NIDDK describes complications that can follow years of high blood sugar: kidney disease, nerve damage (neuropathy), and eye damage (retinopathy). Those are health facts. They are not, by themselves, a company’s yes or no.",
    whatP3: "An insurer does not treat diabetes. It decides whether the history, as written on an application and as it appears in prescription databases, fits a product it is willing to issue.",
    howH: "How life insurance reviews a health history",
    howP1: "For burial-size whole life, the usual path is simplified issue: there is no in-office exam, but there are health questions. The company also looks at prescriptions you have already filled. A “no” that should have been “yes” can stall or void a claim later. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "If those questions can be answered without hitting that product’s decline list, the plan is often level or immediate: the full face amount can apply to a covered natural death from the first payment. If the questions cannot issue that way, some products offer a graded or modified benefit (a limited payout or a return of premium in the first years). If even that cannot issue, guaranteed-issue whole life (GIWL) asks no health questions and waits about two years for natural death.",
    howP3: "Fully underwritten term is a different product: larger amounts, more detail, sometimes labs, and usually a better price per dollar if the file can open it. Diabetes almost never gets the cheapest internet class. If the need is income or a mortgage, not burial, see <a href=\"" + L.termCond + "\">term life with pre-existing conditions</a>.",
    pathsH: "Three kinds of plans, in plain language",
    path1T: "Level or immediate",
    path1: "There are questions. If the company issues, the full amount can apply from the first covered payment. This is usually the lowest price per dollar among these three.",
    path2T: "Graded or modified",
    path2: "There are still questions. In the first years, a non-accidental death may pay only part of the face amount or return premiums plus contract interest. On Accendo Modified, years one and two typically return 110% of the premiums paid; the full face applies later. Other companies write this period differently.",
    path3T: "Guaranteed acceptance",
    path3: "There are no health questions. Within the age and amount, medical history does not decline you. There is always about a two-year wait for non-accidental death. That product is called GIWL: guaranteed-issue whole life. The one we quote is ages 50–80 and $5,000–$25,000.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. Ads that combine both almost always still have a questionnaire.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage: you may get a larger amount, a lower price, and no two-year wait. The limitation is that the same questionnaire can send you to a wait, a higher class, or guaranteed issue if complications, other diagnoses, tobacco, or build stack up. Waiting to apply “until I am healthier” only raises the age if the diabetes is already stable.",
    factorsH: "What can change a diabetes application",
    factorsP: "Each card starts with the health idea in plain language, then lists only what we can verify at appointed companies. Those notes assume diabetes is the only factor. Build, tobacco, a second diagnosis, or several listed conditions together can still change the class or decline.",
    factorsNote: "These notes are not a quote. A live application still decides.",
    fMeaning: "In plain language",
    fVerify: "What we can verify",
    f1c: "Insulin",
    f1w: "Insulin is a treatment, not a diagnosis by itself. Type 1 almost always uses it; some people with type 2 do too.",
    f1items: [
      "Insulin and common diabetes pills are not on Mutual of Omaha’s published Living Promise ineligible-medication list.",
      "Transamerica’s Immediate Solution chart still rates type 1 and type 2 as Standard when diabetes is the only listed factor.",
      "That is not a promise every questionnaire will issue.",
    ],
    f2c: "Type 1 or type 2",
    f2w: "They are different diseases. Type 1 often starts younger and uses insulin for life.",
    f2items: [
      "On Transamerica Immediate Solution both are Standard if that is the only factor.",
      "Diabetes only during pregnancy can be Preferred on that same chart.",
      "We do not have a public Accendo chart that treats type 1 as an automatic decline.",
    ],
    f3c: "Age at diagnosis",
    f3w: "Some applications ask when diabetes started.",
    f3items: [
      "Mutual of Omaha’s simplified-issue guide lists “diabetes (prior to a specified age)” among impairments that may adjust or decline coverage.",
      "It does not publish one public Living Promise cutoff in that list.",
      "A different product — Term Life Express — does publish declines for certain diabetes combinations after age 45 (age 50 in California and the Virgin Islands). We will not treat that Express number as a Living Promise rule.",
    ],
    f4c: "Diabetic coma",
    f4w: "A coma from very high or very low blood sugar is a severe event. NIDDK describes severe hypoglycemia as a medical emergency.",
    f4items: [
      "Transamerica Immediate Solution lists diabetic coma as Decline on the single-condition chart.",
      "Then we look at GIWL (guaranteed-issue whole life) if age and amount fit.",
      "We do not publish a “after two years you are automatically Preferred” rule — that is not on that chart.",
    ],
    f5c: "Insulin shock",
    f5w: "Severe low blood sugar can appear on older forms as “insulin shock.” Other companies say hypoglycemia that required treatment.",
    f5items: [
      "Americo’s longer diabetes questionnaire (used on some products, not as a public Eagle Select knockout list) asks about insulin shock.",
      "We do not have a published Living Promise or Accendo line that says every insulin-shock history is a decline, or that a two-year wait always applies.",
      "Tell us if it happened and when.",
    ],
    f6c: "Amputation",
    f6w: "An amputation from poor circulation or infection is not the same as losing a limb in an accident.",
    f6items: [
      "Transamerica Immediate Solution: amputation other than from accident or trauma is Decline.",
      "Americo Eagle Select: amputation due to disease is on the decline list.",
      "GIWL (guaranteed-issue whole life) may still be open.",
    ],
    f7c: "Kidney, nerves, and eyes",
    f7w: "NIDDK and the National Eye Institute describe nephropathy, neuropathy, and retinopathy as common diabetes complications.",
    f7items: [
      "Mutual of Omaha’s simplified-issue guide lists diabetes with retinopathy, nephropathy, or neuropathy among impairments that may adjust or decline.",
      "On Eagle Select, a diabetes complication typically will not stay in the top class; the e-app may still offer a lower class if nothing on the decline list applies.",
    ],
    f8c: "Height and weight",
    f8w: "Most simplified products ask height and weight.",
    f8items: [
      "Americo Eagle Select publishes a build range.",
      "Other appointed companies also review build; we do not republish every chart here.",
      "Very high or low weight can change the class or stop simplified issue even if the diabetes is stable.",
    ],
    costH: "What a level plan costs (if you qualify)",
    costP: "These figures are illustrative monthly premiums for level final expense, non-tobacco, appointed companies. Read them as the size of the product if the questionnaire issues an immediate plan — not as the price of “having diabetes.” A GIWL plan (guaranteed-issue whole life) at the same age costs more and waits two years for natural death.",
    coH: "Appointed companies",
    coP: "Compare these cards and then quote. A “Standard” on a single-condition chart does not replace the full application. “No 2-year wait” applies to the level or immediate plan, not GIWL (guaranteed-issue whole life).",
    faq1q: "Can I get final expense if I use insulin?",
    faq1a: "Often yes, on simplified issue. Insulin by itself is not the same problem as a coma, an amputation, or dialysis. Quote with the real type and medications.",
    faq2q: "Is type 1 worse than type 2 for insurance?",
    faq2a: "On Transamerica Immediate Solution both are Standard if that is the only factor. Type 1 sometimes comes with more years of disease and more complications; those complications change the product, not the number “1” or “2” by itself.",
    faq3q: "Is there a blood test?",
    faq3a: "On these simplified final expense plans there is no lab appointment. There are questions and a prescription review. See <a href=\"" + L.exam + "\">no medical exam</a>.",
    faq4q: "Does diabetes force me into guaranteed acceptance?",
    faq4a: "Not as a first step. GIWL (guaranteed-issue whole life) comes in when simplified issue cannot issue — for example a diabetic coma, a non-trauma amputation, or dialysis and active cancer at the same time. It is not the first try for controlled diabetes without those signals.",
    faq5q: "Do I have to give the diagnosis date?",
    faq5a: "Yes, if the question exists. Companies cross-check prescriptions. An invented date does not help.",
    faq6q: "Does A1C appear on the application?",
    faq6a: "Some longer Americo questionnaires (other products, not a public Eagle Select grid) ask for A1C. On simplified final expense the detail varies. Have the number ready; do not round it toward “better.” We do not publish an Accendo A1C cutoff because it is not in our extract.",
    faq7q: "Does neuropathy or retinopathy close an immediate plan?",
    faq7a: "We do not claim that for every company. Mutual of Omaha lists those complications among impairments that may adjust or decline. Eagle Select typically leaves the top class. Transamerica Immediate Solution does not publish a separate row for nerves or eyes. Say what the doctor wrote; we will not invent a universal “yes.”",
    faq8q: "Should I wait until I am “healthier” to apply?",
    faq8a: "If there has just been a coma, an amputation, or a heart attack, it can be worth waiting out the window the company asks about. If the diabetes has been stable for years, waiting only raises the age. Quote now with real facts.",
    nextLead: "See prices, or schedule a call with Mejor Vida Insurance.",
    nextMore: "",
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
  };
}

function factorCardsHtml(c) {
  const cards = [];
  for (let n = 1; n <= 8; n += 1) {
    if (!c["f" + n + "c"]) continue;
    const items = c["f" + n + "items"] || [];
    const gap = c["f" + n + "gap"];
    cards.push(`<article class="lic-factor">
<h3>${c["f" + n + "c"]}</h3>
<div class="lic-factor__body">
<div class="lic-factor__meaning">
<p class="lic-factor__kicker">${c.fMeaning}</p>
<p>${c["f" + n + "w"]}</p>
</div>
<div class="lic-factor__verify">
<p class="lic-factor__kicker">${c.fVerify}</p>
<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
${gap ? `<p class="lic-factor__gap">${gap}</p>` : ""}
</div>
</div>
</article>`);
  }
  return `<div class="lic-factor-list">${cards.join("\n")}</div>`;
}

function planCompareHtml(c) {
  const rows = [
    ["vsR1H", "vsR1A", "vsR1B", "vsR1C"],
    ["vsR2H", "vsR2A", "vsR2B", "vsR2C"],
    ["vsR3H", "vsR3A", "vsR3B", "vsR3C"],
    ["vsR4H", "vsR4A", "vsR4B", "vsR4C"],
  ];
  return `<div class="lic-vs-chart lic-vs-chart--three" role="table" aria-label="${c.vsH}">
<div class="lic-vs-chart__row lic-vs-chart__head" role="row">
<div class="lic-vs-chart__q lic-vs-chart__q--blank" role="columnheader"></div>
<div class="lic-vs-chart__ins" role="columnheader"><strong>${c.vsCol1}</strong><span>${c.vsCol1Sub}</span></div>
<div class="lic-vs-chart__mid" role="columnheader"><strong>${c.vsCol2}</strong><span>${c.vsCol2Sub}</span></div>
<div class="lic-vs-chart__pre" role="columnheader"><strong>${c.vsCol3}</strong><span>${c.vsCol3Sub}</span></div>
</div>
${rows
  .map(
    ([h, a, b, d]) => `<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c[h]}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.vsCol1}">${c[a]}</div>
<div class="lic-vs-chart__mid" role="cell" data-label="${c.vsCol2}">${c[b]}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.vsCol3}">${c[d]}</div>
</div>`
  )
  .join("\n")}
</div>
<p class="lic-rate-note">${c.vsLearn}</p>`;
}

function diabetesMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const inner = `<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<p>${c.needP1}</p>
<p>${c.needP2}</p>
</section>
<section class="lic-section" id="what">
<h2>${c.whatH}</h2>
<p>${c.whatP1}</p>
<p>${c.whatP2}</p>
<p>${c.whatP3}</p>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<p>${c.howP1}</p>
<p>${c.howP2}</p>
<p>${c.howP3}</p>
</section>
<section class="lic-section" id="paths">
<h2>${c.pathsH}</h2>
<div class="lic-type-block"><h3>${c.path1T}</h3><p>${c.path1}</p></div>
<div class="lic-type-block"><h3>${c.path2T}</h3><p>${c.path2}</p></div>
<div class="lic-type-block"><h3>${c.path3T}</h3><p>${c.path3}</p></div>
<p class="lic-rate-note">${c.pathsNote}</p>
</section>
<section class="lic-section" id="consider">
<h2>${c.considerH}</h2>
<p>${c.considerP}</p>
</section>
<section class="lic-section" id="factors">
<h2>${c.factorsH}</h2>
<p>${c.factorsP}</p>
${factorCardsHtml(c)}
<p class="lic-rate-note">${c.factorsNote}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${feRateBlock(c, L.quote)}
</section>
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<p>${c.coP}</p>
${appointedCardsHtml(lang, c)}
${giCardHtml(lang, c)}
</section>`;
  return condShell(lang, page, c, {
    omitFaq: true,
    toc: isEs
      ? [
          ["#need", "La pregunta"],
          ["#how", "Cómo funciona"],
          ["#factors", "Qué importa"],
          ["#faq", "Preguntas"],
          ["#companies", "Compañías"],
          ["#cost", "Costo"],
        ]
      : [
          ["#need", "The question"],
          ["#how", "How it works"],
          ["#factors", "What matters"],
          ["#faq", "Questions"],
          ["#companies", "Companies"],
          ["#cost", "Cost"],
        ],
    inner,
  });
}

/* -------------------------------------------------------------------------- */
/* Heart                                                                       */
/* -------------------------------------------------------------------------- */

function copyHeart(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.cdc.gov/heart-disease/about/index.html" rel="noopener" target="_blank">CDC: enfermedad del corazón</a> — causa frecuente de muerte en EE. UU.; incluye enfermedad de las arterias coronarias e infarto.'
      : '<a href="https://www.cdc.gov/heart-disease/about/index.html" rel="noopener" target="_blank">CDC: heart disease</a> — a common cause of death in the U.S.; includes coronary artery disease and heart attack.',
    src3: isEs
      ? '<a href="https://www.nhlbi.nih.gov/health/heart-attack" rel="noopener" target="_blank">NHLBI: infarto</a> — qué es un infarto y cómo se trata; no es una regla de suscripción.'
      : '<a href="https://www.nhlbi.nih.gov/health/heart-attack" rel="noopener" target="_blank">NHLBI: heart attack</a> — what a heart attack is and how it is treated; not an underwriting rule.',
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de gastos finales con enfermedad del corazón (2026) | Mejor Vida Seguros",
      desc: "Un infarto antiguo o enfermedad coronaria a menudo sigue en gastos finales simplificados. Insuficiencia cardíaca, un evento reciente o un desfibrilador cambian el camino.",
      h1: "Seguro de gastos finales si tiene enfermedad del corazón",
      lead: "El CDC sitúa las enfermedades del corazón entre las causas más frecuentes de muerte en Estados Unidos. Para gastos finales, “corazón” no es una sola casilla. Un infarto de hace diez años, con pastillas y sin internaciones nuevas, a menudo <strong>sigue en un plan nivelado</strong> (cuestionario de salud; el monto completo puede pagar desde el primer pago cubierto). Un evento en los últimos dos años, o insuficiencia cardíaca, se mira con más cuidado.",
      crumbEnd: "Corazón",
      take1: "En el gráfico de un solo padecimiento de Transamerica, “enfermedad del corazón” puede quedar <strong>Preferred</strong>. La insuficiencia cardíaca (congestiva, diastólica) queda <strong>Standard</strong>. Un infarto se lee en esa misma familia de reglas, no como un “no” automático.",
      take2: "En el flujo interno de Mejor Vida Seguros preguntamos si hubo infarto, derrame o AIT en los <strong>últimos dos años</strong>. Ese recorte de tiempo cambia más el producto que un episodio antiguo.",
      take3: "Marcapasos o stent no cierran automáticamente el simplificado en ese gráfico. Un desfibrilador implantado se lee con enfermedad del corazón. Hospicio o cirugía pendiente con anestesia general sí suelen ser declinación.",
      callout: "No compre el primer anuncio de “sin examen.” Diga el año del evento, si hubo bypass o stent, y los medicamentos (incluidos anticoagulantes). Eso decide nivelado, Standard o GIWL.",
      whatH: "Qué entra en “enfermedad del corazón”",
      whatP1: "El CDC habla de enfermedad de las arterias coronarias, infarto, insuficiencia cardíaca y otros problemas del músculo o las válvulas. En una solicitud de gastos finales esas palabras se mezclan: angina, angioplastia, arritmia, fibrilación auricular, bypass, stent, marcapasos.",
      whatP2: "Usted no tiene que adivinar el código. Diga lo que el médico escribió y el año. La compañía cruza recetas (por ejemplo un anticoagulante) con sus respuestas.",
      uwH: "Cómo lo miran las compañías designadas",
      uwP: "Living Promise, Accendo y Americo preguntan por internaciones, oxígeno y eventos recientes; cada formulario es distinto. Transamerica publica un gráfico: enfermedad del corazón, Preferred, si es el único factor; insuficiencia cardíaca, Standard. Eso no es una promesa de emisión: peso, tabaco, otro diagnóstico o cuatro condiciones Standard/Graded juntas pueden declinar en las reglas generales de ese mismo documento.",
      uwNote: "Un plan nivelado, si califica, puede pagar el monto completo desde el día uno. Eso es lo que la mayoría busca después de un infarto antiguo. GIWL entra cuando el simplificado no puede emitir.",
      chH: "Qué suele cambiar la respuesta",
      chP: "Estos detalles separan un “sí, nivelado” de un “solo GIWL.”",
      ch1: "Infarto, derrame o AIT en los últimos dos años: hay que datarlo. Un evento fresco estrecha Living Promise, Accendo y otros simplificados.",
      ch2: "Insuficiencia cardíaca: Standard en Transamerica, no un cierre automático en ese gráfico. Otras compañías pueden ser más estrictas.",
      ch3: "Cirugía pendiente con anestesia general, hospicio, o estar en un hospital ahora: declinación en ese gráfico y en nuestra lista de descalificadores simplificados.",
      ch4: "Oxígeno por pulmón, diálisis o demencia al mismo tiempo: el archivo deja de ser “solo corazón.”",
      costH: "Cuánto cuesta un plan nivelado (si califica)",
      costP: "Primas ilustrativas de gastos finales nivelados, no fumador. Si califica a nivelado después de un infarto antiguo, el precio sigue a edad, sexo y tabaco, no a un recargo secreto por “corazón.” GIWL, si es el único camino, cuesta más y espera dos años por muerte natural.",
      coH: "Compañías designadas (planes nivelados)",
      coP: "Compare estas fichas y luego cotice. Un “Preferred” en un gráfico de un solo padecimiento no sustituye la solicitud completa.",
      faq1q: "Tuve un infarto hace ocho años. ¿Hay espera de dos años?",
      faq1a: "No necesariamente. Muchos planes simplificados todavía emiten nivelado si el resto del cuestionario está limpio. El recorte de “últimos dos años” es el que más cambia la respuesta.",
      faq2q: "¿Un stent o un bypass me impiden el plan inmediato?",
      faq2a: "En Transamerica esos procedimientos se leen con enfermedad del corazón, no como una declinación automática en ese gráfico. Otras compañías preguntan el año. Diga la fecha.",
      faq3q: "¿La insuficiencia cardíaca es lo mismo que un infarto?",
      faq3a: "No. El CDC y los médicos las separan. En Transamerica la insuficiencia queda Standard; “enfermedad del corazón” puede ser Preferred. Siga usando las palabras de su cardiólogo.",
      faq4q: "¿Puedo ser dueño de la póliza de un padre con problemas del corazón?",
      faq4a: "Sí, si hay interés asegurable y el padre firma. Usted no responde su historial por él. Vea las guías de familia.",
      faq5q: "¿El tabaco después de un infarto importa?",
      faq5a: "Sí. Tabaco en los últimos 12 meses suele ser tarifa de tabaco. No es lo mismo que una declinación, pero sube la cuota.",
      faq6q: "¿Debo esperar a estar “más sano” para solicitar?",
      faq6a: "Si el evento fue reciente, a veces sí conviene esperar a que pase la ventana que pregunta la compañía. Si fue hace años y está estable, esperar solo encarece la edad. Cotice ahora; no retrase por un rumor.",
      nextLead: "Diga el año del evento, los procedimientos y los medicamentos.",
      nextMore: `Vea también <a href="${L.stroke}">derrame</a> y <a href="${L.hbp}">presión alta</a>.`,
    };
  }
  return {
    ...b,
    ...src,
    title: "Final expense insurance with heart disease (2026) | Mejor Vida Insurance",
    desc: "An old heart attack or coronary disease often still qualifies for simplified final expense. Heart failure, a recent event, or a defibrillator can change the path.",
    h1: "Final expense insurance if you have heart disease",
    lead: "The CDC lists heart disease among the most common causes of death in the United States. For final expense, “heart” is not one checkbox. A heart attack ten years ago, with pills and no new hospital stays, often <strong>still fits a level plan</strong> (a health questionnaire; the full amount can pay from the first covered payment). An event in the last two years, or heart failure, is reviewed more carefully.",
    crumbEnd: "Heart disease",
    take1: "On Transamerica’s single-condition chart, “heart disease” can be <strong>Preferred</strong>. Congestive or diastolic heart failure is <strong>Standard</strong>. A heart attack is read in that same family of rules, not as an automatic “no.”",
    take2: "In Mejor Vida Insurance’s internal flow we ask whether there was a heart attack, stroke, or TIA in the <strong>last two years</strong>. That time window changes the product more than an old episode.",
    take3: "A pacemaker or stent does not automatically close simplified issue on that chart. An implanted defibrillator is read with heart disease. Hospice or pending surgery with general anesthesia usually is a decline.",
    callout: "Do not buy the first “no exam” ad. Give the year of the event, whether there was bypass or a stent, and the medications (including blood thinners). That decides level, Standard, or GIWL.",
    whatH: "What counts as “heart disease”",
    whatP1: "The CDC talks about coronary artery disease, heart attack, heart failure, and other muscle or valve problems. On a final expense application those words blend: angina, angioplasty, arrhythmia, atrial fibrillation, bypass, stent, pacemaker.",
    whatP2: "You do not have to guess the code. Say what the doctor wrote and the year. The company matches prescriptions (for example a blood thinner) with your answers.",
    uwH: "How appointed companies look at it",
    uwP: "Living Promise, Accendo, and Americo ask about hospital stays, oxygen, and recent events; each form is different. Transamerica publishes a chart: heart disease, Preferred, if it is the only factor; heart failure, Standard. That is not a promise to issue: build, tobacco, another diagnosis, or four Standard/Graded conditions together can decline under the general rules in that same document.",
    uwNote: "A level plan, if you qualify, can pay the full amount from day one. That is what most people want after an old heart attack. GIWL comes in when simplified issue cannot issue.",
    chH: "What usually changes the answer",
    chP: "These details separate a “yes, level” from “GIWL only.”",
    ch1: "Heart attack, stroke, or TIA in the last two years: it has to be dated. A fresh event narrows Living Promise, Accendo, and other simplified plans.",
    ch2: "Heart failure: Standard on Transamerica, not an automatic close on that chart. Other companies can be stricter.",
    ch3: "Pending surgery with general anesthesia, hospice, or being in a hospital now: a decline on that chart and on our simplified knockout list.",
    ch4: "Oxygen for the lungs, dialysis, or dementia at the same time: the file is no longer “heart only.”",
    costH: "What a level plan costs (if you qualify)",
    costP: "Illustrative monthly premiums for level final expense, non-tobacco. If you qualify for level after an old heart attack, price follows age, sex, and tobacco — not a secret “heart surcharge.” GIWL, if it is the only path, costs more and waits two years for natural death.",
    coH: "Appointed companies (level plans)",
    coP: "Compare these cards and then quote. A “Preferred” on a single-condition chart does not replace the full application.",
    faq1q: "I had a heart attack eight years ago. Is there a two-year wait?",
    faq1a: "Not necessarily. Many simplified plans still issue level if the rest of the questionnaire is clean. The “last two years” window is what most often changes the answer.",
    faq2q: "Does a stent or bypass block an immediate plan?",
    faq2a: "On Transamerica those procedures are read with heart disease, not as an automatic decline on that chart. Other companies ask for the year. Give the date.",
    faq3q: "Is heart failure the same as a heart attack?",
    faq3a: "No. The CDC and physicians separate them. On Transamerica, heart failure is Standard; “heart disease” can be Preferred. Keep using your cardiologist’s words.",
    faq4q: "Can I own a parent’s policy if they have heart problems?",
    faq4a: "Yes, if there is insurable interest and the parent signs. You do not answer their history for them. See the family guides.",
    faq5q: "Does tobacco after a heart attack matter?",
    faq5a: "Yes. Tobacco in the last 12 months is usually a tobacco rate. That is not the same as a decline, but it raises the premium.",
    faq6q: "Should I wait until I am “healthier” to apply?",
    faq6a: "If the event was recent, it can be worth waiting out the window the company asks about. If it was years ago and you are stable, waiting only raises the age. Quote now; do not delay on a rumor.",
    nextLead: "Give the year of the event, the procedures, and the medications.",
    nextMore: `See also <a href="${L.stroke}">stroke</a> and <a href="${L.hbp}">high blood pressure</a>.`,
  };
}

function heartMain(lang, page, c) {
  const isEs = lang === "es";
  return condShell(lang, page, c, {
    toc: tocPair(isEs),
    inner: conditionInner(lang, c, {}),
  });
}

/* -------------------------------------------------------------------------- */
/* High blood pressure                                                          */
/* -------------------------------------------------------------------------- */

function copyHbp(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.cdc.gov/high-blood-pressure/about/index.html" rel="noopener" target="_blank">CDC: presión arterial alta</a> — qué es, que a menudo no da síntomas y cómo se trata; no es una regla de una aseguradora.'
      : '<a href="https://www.cdc.gov/high-blood-pressure/about/index.html" rel="noopener" target="_blank">CDC: high blood pressure</a> — what it is, that it often has no symptoms, and how it is treated; not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.nhlbi.nih.gov/health/high-blood-pressure" rel="noopener" target="_blank">NHLBI: presión arterial alta</a> — números, categorías y por qué se trata. <a href="https://www.nhlbi.nih.gov/health/pulmonary-hypertension" rel="noopener" target="_blank">NHLBI: hipertensión pulmonar</a> — una enfermedad distinta en las arterias de los pulmones.'
      : '<a href="https://www.nhlbi.nih.gov/health/high-blood-pressure" rel="noopener" target="_blank">NHLBI: high blood pressure</a> — numbers, categories, and why it is treated. <a href="https://www.nhlbi.nih.gov/health/pulmonary-hypertension" rel="noopener" target="_blank">NHLBI: pulmonary hypertension</a> — a different disease in the lung arteries.',
    src4: isEs
      ? '<a href="https://www.heart.org/en/health-topics/high-blood-pressure" rel="noopener" target="_blank">American Heart Association: high blood pressure</a> — material público para el consumidor sobre presión alta y el corazón.'
      : '<a href="https://www.heart.org/en/health-topics/high-blood-pressure" rel="noopener" target="_blank">American Heart Association: high blood pressure</a> — public consumer material on blood pressure and the heart.',
    src5: isEs
      ? '<a href="https://www.niddk.nih.gov/health-information/kidney-disease/high-blood-pressure" rel="noopener" target="_blank">NIDDK: presión alta y riñón</a> — cómo la presión alta se relaciona con la enfermedad renal; no sustituye el cuestionario de una póliza.'
      : '<a href="https://www.niddk.nih.gov/health-information/kidney-disease/high-blood-pressure" rel="noopener" target="_blank">NIDDK: high blood pressure and the kidneys</a> — how high blood pressure relates to kidney disease; it does not replace a policy questionnaire.',
    src6: "",
  });
  src.src6 = "";
  if (isEs) {
    return {
      ...b,
      ...src,
      hideJsRateNote: true,
      coWait: "¿Espera de 2 años?",
      coWaitNo: "No, si las preguntas de salud califican",
      coMooProduct: "Living Promise",
      coAetnaProduct: "Accendo Final Expense",
      coTaProduct: "Immediate Solution",
      coAmericoProduct: "Eagle Select",
      coGiProduct: "Vida entera de aceptación garantizada",
      coGiFoot: "Una póliza de aceptación garantizada por asegurado cada 12 meses; el total de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      title: "Seguro de gastos finales con presión arterial alta (2026) | Mejor Vida Seguros",
      desc: "La presión alta, sola, casi nunca obliga a un plan sin preguntas de salud. Cómo funciona el seguro de gastos finales, qué cambia el producto y cuándo hay que decir que no lo sabemos.",
      h1: "¿Puede comprar gastos finales si tiene presión arterial alta?",
      lead: "A menudo sí. La presión arterial alta es una de las condiciones más comunes en adultos mayores. El CDC explica que con frecuencia no da síntomas y se trata con cambios de hábitos y medicamentos. En un seguro de entierro de monto pequeño, ese diagnóstico <strong>por sí solo</strong> casi nunca es motivo para saltarse las preguntas de salud y comprar un plan que espera dos años. Lo que sí cambia el producto es cuando la presión ya se acompañó de un derrame, un infarto reciente, insuficiencia cardíaca, diálisis u oxígeno.",
      crumbEnd: "Presión alta",
      take1: "El primer producto a cotizar suele ser un <strong>plan nivelado</strong>: una póliza con un cuestionario corto de salud que puede pagar el monto completo desde el primer pago cubierto, casi siempre sin espera de dos años.",
      take2: "El precio de ese plan sigue a la edad, el sexo y el tabaco. No hay un cargo extra con el nombre “presión alta.”",
      take3: "Si también hay derrame, insuficiencia cardíaca o riñón en diálisis, ya no es “solo presión.” Use esas guías antes de asumir que el mismo plan aplica.",
      callout: "No compre un plan de <strong>aceptación garantizada</strong> — sin preguntas de salud y con unos dos años de espera por muerte natural — solo porque toma una pastilla para la presión. Cotice primero un plan con preguntas de salud. No hay examen en el consultorio; sí hay que responder con honestidad.",
      needH: "La preocupación real",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. Un seguro de gastos finales es vida permanente de monto pequeño, pensado para esa factura — no sustituye una póliza grande de ingresos.",
      needP2: "Un diagnóstico que usted ya tiene se llama a menudo <strong>condición preexistente</strong>. Esa etiqueta no significa, por sí sola, una espera de dos años. El miedo suele ser: “¿Me van a vender solo un plan que espera, o hay un camino que paga completo desde el inicio?” El resto de la página explica esa diferencia <strong>antes</strong> de nombrar compañías.",
      whatH: "Qué significa la presión alta para su salud",
      whatP1: "El CDC y el NHLBI describen la presión arterial como la fuerza de la sangre contra las arterias. Se escribe con dos números, por ejemplo 120/80. El primero es cuando el corazón empuja; el segundo, entre latidos. La presión alta — también llamada hipertensión — es cuando esas lecturas se mantienen en 130/80 o más.",
      whatP2: "A menudo no se siente. Por eso tantas personas se enteran en un control de rutina. El tratamiento suele ser menos sal, más movimiento, no fumar y, cuando el médico lo indica, medicamentos. Sin tratamiento, la presión alta puede dañar el corazón, el cerebro, los riñones y los ojos.",
      whatP3: "Una aseguradora no trata la presión alta. Decide si el historial, como queda escrito y como aparece en las recetas ya surtidas, cabe en un producto que está dispuesta a emitir. No le pide que “esté curado.”",
      howH: "Cómo mira el seguro de vida un historial de salud",
      howP1: "En gastos finales el camino habitual no es un examen en el consultorio. Hay un cuestionario corto y, en la mayoría de los productos que cotizamos, una revisión de recetas. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega un reclamo: un “no” que debió ser “sí” puede frenar o anular el pago.",
      howP2: "Si esas preguntas se pueden contestar sin chocar con lo que ese producto no puede emitir, el plan suele ser el nivelado: el monto completo puede aplicar a una muerte natural cubierta desde el primer pago. Si no puede emitir así, algunos productos pagan menos o devuelven primas en los primeros años. Si tampoco puede emitir, un plan de aceptación garantizada no hace preguntas de salud y espera unos dos años por muerte natural.",
      howP3: "El seguro temporal con montos más altos es otro producto: a veces hay laboratorios o una visita para tomar signos vitales, incluida la presión. Esa es una conversación distinta. Si la necesidad es ingreso o hipoteca, no entierro, vea <a href=\"" + L.termCond + "\">temporal con condiciones previas</a>.",
      pathsH: "Tres tipos de plan, comparados",
      vsH: "Cómo se comparan los tres tipos de plan",
      vsCol1: "Paga completo",
      vsCol1Sub: "Plan nivelado, con preguntas",
      vsCol2: "Paga menos al inicio",
      vsCol2Sub: "Todavía hay preguntas",
      vsCol3: "Sin preguntas",
      vsCol3Sub: "Aceptación garantizada",
      vsR1H: "¿Hay preguntas de salud?",
      vsR1A: "Sí. Hay que calificar.",
      vsR1B: "Sí. Las respuestas no califican al plan que paga completo.",
      vsR1C: "No.",
      vsR2H: "Muerte natural en el primer año",
      vsR2A: "Puede pagar el monto completo.",
      vsR2B: "Paga una parte o devuelve primas, según el contrato.",
      vsR2C: "Devuelve primas con el interés del contrato. No paga el monto completo.",
      vsR3H: "Si la presión alta es lo principal",
      vsR3A: "Suele ser el primer intento.",
      vsR3B: "No es el punto de partida por una pastilla para la presión.",
      vsR3C: "Reserva para cuando el cuestionario no puede emitir.",
      vsR4H: "Precio, en términos generales",
      vsR4A: "Suele ser el más bajo por dólar de estos tres.",
      vsR4B: "Varía. No inventamos una prima de muestra aquí.",
      vsR4C: "Suele costar más por dólar, a la misma edad y monto.",
      vsLearn: "Esta tabla enseña la diferencia entre los tres caminos. No es una cotización. La solicitud en vivo sigue decidiendo en qué columna cae usted.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Los anuncios que mezclan las dos cosas casi siempre siguen teniendo cuestionario.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja: puede abrir más monto, un precio más bajo y el beneficio completo desde el primer pago cubierto. El límite es que el mismo cuestionario puede mandarlo a una espera o a aceptación garantizada si hay daño de órgano, internaciones recientes u otros diagnósticos. Esperar a solicitar “cuando la presión baje” solo sube la edad si el tratamiento ya es estable.",
      split1H: "Suele seguir siendo un plan con preguntas",
      split1a: "Presión alta tratada con medicamentos, sin internación reciente por esa causa.",
      split1b: "Colesterol alto junto con la presión, si no hay otro daño listado.",
      split1c: "Varias pastillas para la presión, si son para la presión y no para insuficiencia cardíaca.",
      split2H: "Suele cambiar la conversación",
      split2a: "Derrame o un episodio breve parecido a un derrame (AIT).",
      split2b: "Infarto reciente, insuficiencia cardíaca o procedimiento del corazón.",
      split2c: "Diálisis, oxígeno, o un diagnóstico de hipertensión pulmonar — no es la misma enfermedad que la presión en el brazo.",
      factorsH: "Qué puede cambiar una solicitud con presión alta",
      factorsP: "Cada tarjeta empieza con la idea de salud. A la derecha va solo lo que podemos afirmar para los productos de entierro que cotizamos. Si no podemos verificarlo, lo decimos.",
      factorsNote: "Estas notas no son una cotización. Edad, tabaco, peso y un segundo diagnóstico todavía pueden cambiar el resultado.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Lo que podemos afirmar",
      f1c: "Los medicamentos para la presión",
      f1w: "Una pastilla para bajar la presión es un tratamiento, no un rechazo por sí sola. El CDC y el NHLBI describen el medicamento como parte habitual del control.",
      f1items: [
        "En los productos de entierro que cotizamos, el tratamiento habitual de la presión no es, por sí solo, motivo para saltar a un plan sin preguntas.",
        "La misma pastilla a veces se receta también por insuficiencia cardíaca. Eso ya no es “solo presión.” Vea la guía de corazón.",
        "No deje un medicamento recetado para “verse más sano” en la solicitud. Las recetas ya surtidas suelen aparecer en la revisión.",
      ],
      f1gap: "No publicamos una lista pública de cada pastilla. Traiga los nombres al cotizar. No adivinamos para qué se las recetaron.",
      f2c: "Otras condiciones",
      f2w: "La presión alta puede existir sola. También puede acompañar daño en el corazón, el cerebro o el riñón.",
      f2items: [
        "Un derrame o AIT no se cotiza como “solo presión.” Vea <a href=\"" + L.stroke + "\">derrame cerebral</a>.",
        "Un infarto reciente o insuficiencia cardíaca cambia el producto. Vea <a href=\"" + L.heart + "\">enfermedad del corazón</a>.",
        "Diálisis o trasplante es un archivo de riñón, no de presión. Vea <a href=\"" + L.kidney + "\">enfermedad renal</a>.",
      ],
      f3c: "Tabaco",
      f3w: "Fumar o usar nicotina suele cambiar el precio. No es lo mismo que un “no” automático.",
      f3items: [
        "En estos productos de entierro, el tabaco suele significar una tarifa de tabaco si el resto de las respuestas todavía califica.",
        "Una ventana habitual es nicotina en el último año para esa tarifa más alta. No publicamos aquí una ventana distinta por cada compañía.",
      ],
      f4c: "Presión alta y colesterol juntos",
      f4w: "Es una combinación muy frecuente. El colesterol alto tampoco suele sentirse.",
      f4items: [
        "En los productos de entierro que cotizamos, presión alta más colesterol, sin otro daño listado, suele seguir siendo un plan con preguntas — no el primer motivo para aceptación garantizada.",
      ],
      f5c: "Las lecturas en el consultorio",
      f5w: "El CDC usa 130/80 como el umbral médico. El NHLBI describe etapas y una crisis cuando los números llegan a 180/120 o más.",
      f5items: [
        "En los planes de entierro que cotizamos no suele ir una enfermera a casa a tomarle la presión.",
        "Hay preguntas y revisión de recetas. Una póliza temporal más grande a veces sí mide la presión; eso es otro producto.",
      ],
      f5gap: "No tenemos una tabla pública de entierro que suba la prima solo porque la última lectura en el consultorio fue alta. No vamos a inventar esa tabla.",
      f6c: "Hipertensión pulmonar",
      f6w: "El NHLBI describe la hipertensión pulmonar como presión demasiado alta en las arterias de los pulmones. No es la misma enfermedad que la presión que le toman en el brazo.",
      f6items: [
        "Diga las palabras exactas del diagnóstico. No la trataremos como presión alta ordinaria.",
      ],
      f6gap: "Las compañías no la tratan todas igual. No vamos a afirmar un “sí” o un “no” universal.",
      f7c: "Una internación por presión muy alta",
      f7w: "Una crisis hipertensiva es una emergencia médica. El NHLBI indica buscar atención de inmediato con lecturas de ese nivel.",
      f7items: [
        "Cuéntenos si lo internaron y cuándo. Eso puede cambiar qué producto cabe.",
      ],
      f7gap: "Un producto distinto de Mutual of Omaha (no el de entierro Living Promise que cotizamos aquí) pregunta por internación por presión alta en cinco años. No vamos a aplicar esa pregunta de cinco años a todas las compañías.",
      costH: "Precios mensuales de muestra si emite un plan con preguntas",
      costP: "Estas cifras son primas mensuales ilustrativas, no fumador, para un plan de gastos finales que puede pagar completo si el cuestionario emite. Léalas como el tamaño del producto por edad y sexo — no como el “precio de tener presión alta.”",
      costLearn: "Qué debe aprender de esta tabla: a la misma cobertura, el mes sube con la edad, y los hombres suelen pagar más que las mujeres. El tabaco (no mostrado aquí) sube otra vez. Algunos montos se calculan a partir de una banda publicada. No es una oferta.",
      costFoot: "Un plan de aceptación garantizada, a la misma edad y monto, suele costar más y espera unos dos años por muerte natural. No debería ser el primer cuadro que mire por presión alta sola.",
      coH: "Compañías que podemos cotizar",
      coP: "Después de entender los tres caminos, estas son compañías designadas que Mejor Vida Seguros puede cotizar cuando un plan con preguntas de salud sigue abierto. Edades y montos cambian. La aprobación no está garantizada.",
      faq1q: "Tomo tres pastillas para la presión. ¿Me van a rechazar?",
      faq1a: "El número de pastillas no es, por sí solo, un “no.” Lo que importa es para qué son y si hay internaciones o daño de órgano. Liste los nombres. No adivinamos el motivo de cada receta.",
      faq2q: "¿Debo dejar el medicamento antes de solicitar?",
      faq2a: "No. Dejar un medicamento para la presión para “verse más sano” es peligroso, y las recetas ya surtidas suelen aparecer en la revisión. Siga el tratamiento de su médico.",
      faq3q: "¿La presión alta cuenta como preexistente?",
      faq3a: "Sí: es un diagnóstico o tratamiento que ya existía al solicitar. En gastos finales esa etiqueta no significa espera automática. Muchos planes con preguntas de salud la aceptan cuando no hay otro daño listado.",
      faq4q: "¿Hay examen de presión en la casa?",
      faq4a: "En estos productos de entierro, no. Hay preguntas y revisión de recetas. Una póliza temporal más grande a veces sí toma signos vitales; no mezclamos esas reglas aquí.",
      faq5q: "¿Puedo comprar si también fumo?",
      faq5a: "Suele haber un precio de tabaco, no un cierre automático, si el resto del cuestionario califica. Mencione cigarrillos, vapeo, parche o cigarro.",
      faq6q: "¿El plan sin preguntas es más barato a mi edad?",
      faq6a: "Casi nunca, a la misma edad y monto, porque la compañía no selecciona por salud. Cotice primero el plan con preguntas.",
      faq7q: "Tengo presión alta y colesterol. ¿Eso me manda al plan que espera dos años?",
      faq7a: "Por lo general, no, si esos son los únicos historiales. Sigue siendo un plan con preguntas. Un derrame, un infarto reciente o diálisis sí cambian esa respuesta.",
      faq8q: "Mi médico dice que la presión “no está controlada.” ¿Eso cierra el plan que paga completo?",
      faq8a: "En los productos de entierro que cotizamos no tenemos una tabla pública que convierta su última lectura en un “sí” o un “no.” No vamos a inventar ese corte. Cuéntenos las lecturas y los demás diagnósticos; no prometemos un resultado.",
      nextLead: "Vea precios, o programe una llamada con Mejor Vida Seguros. Mencione la presión y cualquier otro diagnóstico.",
      nextMore: `Si también hay corazón o derrame, use esas páginas. Índice: <a href="${L.hub}">condiciones preexistentes</a>.`,
      nextSecondary: "Programar una llamada",
      nextSecondaryHref: L.schedule,
      coFoot: "Fichas educativas de compañías designadas. Un plan que paga menos o devuelve primas en los primeros años, o un plan de aceptación garantizada, puede añadir una espera. No es cotización vinculante.",
    };
  }
  return {
    ...b,
    ...src,
    hideJsRateNote: true,
    coWait: "2-year wait?",
    coWaitNo: "No, if the health questions qualify",
    coMooProduct: "Living Promise",
    coAetnaProduct: "Accendo Final Expense",
    coTaProduct: "Immediate Solution",
    coAmericoProduct: "Eagle Select",
    coGiProduct: "Guaranteed-acceptance whole life",
    coGiFoot: "One guaranteed-acceptance policy per insured every 12 months; that company’s total does not exceed $25,000. Educational — not a binding quote.",
    title: "Final expense insurance with high blood pressure (2026) | Mejor Vida Insurance",
    desc: "High blood pressure by itself almost never forces a no-questions plan. How final expense works, what changes the product, and when we will say we do not know.",
    h1: "Can you buy final expense insurance if you have high blood pressure?",
    lead: "Often yes. High blood pressure is one of the most common conditions in older adults. The CDC explains that it often has no symptoms and is treated with lifestyle changes and medicine. On a small burial-size life policy, that diagnosis <strong>by itself</strong> is almost never a reason to skip the health questions and buy a plan that waits two years. What does change the product is when high blood pressure already came with a stroke, a recent heart attack, heart failure, dialysis, or oxygen.",
    crumbEnd: "High blood pressure",
    take1: "The first product to quote is usually a <strong>level plan</strong>: a policy with a short health questionnaire that can pay the full amount from the first covered payment, usually with no two-year wait.",
    take2: "The price of that plan follows age, sex, and tobacco. There is no extra charge labeled “high blood pressure.”",
    take3: "If there is also a stroke, heart failure, or kidney disease on dialysis, it is no longer “blood pressure only.” Use those guides before assuming the same plan applies.",
    callout: "Do not buy a <strong>guaranteed-acceptance</strong> plan — no health questions, and about a two-year wait for natural death — just because you take a blood-pressure pill. Quote a plan with health questions first. There is no office exam; there is an honest questionnaire.",
    needH: "The worry people actually have",
    needP1: "Families look for this coverage because a funeral, the cemetery, and small debts can fall on relatives. Final expense is permanent life insurance in a small amount, meant for that bill — it does not replace a large income policy.",
    needP2: "A diagnosis you already have is often called a <strong>pre-existing condition</strong>. That label does not, by itself, mean a two-year wait. The fear is usually: “Will they only sell me a plan that waits, or is there a path that can pay in full from the start?” The rest of this page explains that difference <strong>before</strong> naming companies.",
    whatH: "What high blood pressure means for your health",
    whatP1: "The CDC and NHLBI describe blood pressure as the force of blood against the arteries. It is written as two numbers, such as 120/80. The first is when the heart pushes; the second is between beats. High blood pressure — also called hypertension — is when those readings stay at 130/80 or higher.",
    whatP2: "It often is not felt. That is why so many people learn about it at a routine checkup. Treatment is usually less salt, more movement, not smoking, and, when a doctor recommends it, medication. Left untreated, high blood pressure can damage the heart, brain, kidneys, and eyes.",
    whatP3: "An insurer does not treat high blood pressure. It decides whether the history, as it is written and as it appears in prescriptions already filled, fits a product it is willing to issue. It does not ask you to be “cured.”",
    howH: "How life insurance reviews a health history",
    howP1: "On final expense the usual path is not an office exam. There is a short questionnaire and, on most products we quote, a review of prescriptions. The NAIC reminds consumers that honest answers matter at claim time: a “no” that should have been “yes” can stall or void a payment.",
    howP2: "If those questions can be answered without hitting what that product cannot issue, the plan is usually level: the full amount can apply to a covered natural death from the first payment. If it cannot issue that way, some products pay less or return premiums in the first years. If even that cannot issue, a guaranteed-acceptance plan asks no health questions and waits about two years for natural death.",
    howP3: "Term life at larger amounts is a different product: sometimes there are labs or a visit to take vitals, including blood pressure. That is a separate conversation. If the need is income or a mortgage, not burial, see <a href=\"" + L.termCond + "\">term life with pre-existing conditions</a>.",
    pathsH: "Three kinds of plans, compared",
    vsH: "How the three kinds of plans compare",
    vsCol1: "Pays in full",
    vsCol1Sub: "Level plan, with questions",
    vsCol2: "Pays less at first",
    vsCol2Sub: "Still has questions",
    vsCol3: "No questions",
    vsCol3Sub: "Guaranteed acceptance",
    vsR1H: "Health questions?",
    vsR1A: "Yes. You have to qualify.",
    vsR1B: "Yes. The answers do not qualify for the plan that pays in full.",
    vsR1C: "None.",
    vsR2H: "Natural death in year one",
    vsR2A: "Can pay the full amount.",
    vsR2B: "Pays a portion or returns premiums, per the contract.",
    vsR2C: "Returns premiums plus contract interest. Does not pay the full amount.",
    vsR3H: "If high blood pressure is the main history",
    vsR3A: "Usually the first try.",
    vsR3B: "Not the starting point because of a blood-pressure pill.",
    vsR3C: "Held for when the questionnaire cannot issue.",
    vsR4H: "Price, in plain terms",
    vsR4A: "Usually the lowest per dollar of these three.",
    vsR4B: "It varies. We will not invent a sample premium here.",
    vsR4C: "Usually costs more per dollar, at the same age and amount.",
    vsLearn: "This chart teaches the difference among the three paths. It is not a quote. The live application still decides which column you land in.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. Ads that combine both almost always still have a questionnaire.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage: it can open more coverage, a lower price, and a full benefit from the first covered payment. The limitation is that the same questionnaire can send you to a wait or to guaranteed acceptance if there is organ damage, a recent hospital stay, or other diagnoses. Waiting to apply “until the pressure is lower” only raises the age if treatment is already stable.",
    split1H: "Usually still a plan with questions",
    split1a: "High blood pressure treated with medication, with no recent hospital stay for that reason.",
    split1b: "High cholesterol together with high blood pressure, if no other listed damage.",
    split1c: "Several blood-pressure pills, if they are for blood pressure and not for heart failure.",
    split2H: "Usually changes the conversation",
    split2a: "A stroke, or a short stroke-like episode (TIA).",
    split2b: "A recent heart attack, heart failure, or a heart procedure.",
    split2c: "Dialysis, oxygen, or a diagnosis of pulmonary hypertension — not the same disease as the reading on your arm.",
    factorsH: "What can change a high-blood-pressure application",
    factorsP: "Each card starts with the health idea. The right side lists only what we can state for the burial products we quote. If we cannot verify it, we say so.",
    factorsNote: "These notes are not a quote. Age, tobacco, build, and a second diagnosis can still change the result.",
    fMeaning: "In plain language",
    fVerify: "What we can state",
    f1c: "Blood-pressure medicine",
    f1w: "A pill to lower blood pressure is a treatment, not a “no” by itself. The CDC and NHLBI describe medication as a usual part of control.",
    f1items: [
      "On the burial products we quote, ordinary blood-pressure treatment is not, by itself, a reason to jump to a no-questions plan.",
      "The same pill is sometimes also prescribed for heart failure. That is no longer “blood pressure only.” See the heart-disease guide.",
      "Do not stop a prescribed medicine to “look healthier” on the application. Filled prescriptions usually show up in the review.",
    ],
    f1gap: "We do not publish a public pill-by-pill list. Bring the names when you quote. We will not guess what each prescription is for.",
    f2c: "Other conditions",
    f2w: "High blood pressure can stand alone. It can also come with damage to the heart, brain, or kidneys.",
    f2items: [
      "A stroke or TIA is not quoted as “blood pressure only.” See <a href=\"" + L.stroke + "\">stroke</a>.",
      "A recent heart attack or heart failure changes the product. See <a href=\"" + L.heart + "\">heart disease</a>.",
      "Dialysis or a transplant is a kidney file, not a blood-pressure file. See <a href=\"" + L.kidney + "\">kidney disease</a>.",
    ],
    f3c: "Tobacco",
    f3w: "Smoking or other nicotine usually changes the price. That is not the same as an automatic “no.”",
    f3items: [
      "On these burial products, tobacco usually means a tobacco price if the rest of the answers still qualify.",
      "A common window is nicotine in the last year for that higher price. We will not publish a different window for every company here.",
    ],
    f4c: "High blood pressure and cholesterol together",
    f4w: "This combination is very common. High cholesterol often has no symptoms either.",
    f4items: [
      "On the burial products we quote, high blood pressure plus cholesterol, with no other listed damage, is typically still a health-question plan — not the first reason for guaranteed acceptance.",
    ],
    f5c: "Office readings",
    f5w: "The CDC uses 130/80 as the medical threshold. The NHLBI describes stages and a crisis when numbers reach 180/120 or higher.",
    f5items: [
      "On the burial plans we quote, a nurse usually does not come to the home to take your pressure.",
      "There are questions and a prescription review. A larger term policy sometimes does measure blood pressure; that is a different product.",
    ],
    f5gap: "We do not have a published burial table that raises the premium solely because your last office reading was high. We will not invent that table.",
    f6c: "Pulmonary hypertension",
    f6w: "The NHLBI describes pulmonary hypertension as pressure that is too high in the lung arteries. It is not the same disease as the reading taken on your arm.",
    f6items: [
      "Tell us the exact words on the diagnosis. We will not treat it as ordinary high blood pressure.",
    ],
    f6gap: "Companies do not all treat it the same way. We will not claim a universal yes or no.",
    f7c: "A hospital stay for very high blood pressure",
    f7w: "A hypertensive crisis is a medical emergency. The NHLBI says to get care right away at readings in that range.",
    f7items: [
      "Tell us if you were admitted and when. That can change which product fits.",
    ],
    f7gap: "A different Mutual of Omaha product (not the Living Promise burial plan we quote here) asks about hospitalization for high blood pressure in five years. We will not apply that five-year question to every company.",
    costH: "Sample monthly prices if a health-question plan issues",
    costP: "These figures are illustrative monthly premiums, non-tobacco, for a final expense plan that can pay in full if the questionnaire issues. Read them as the size of the product by age and sex — not as the “price of having high blood pressure.”",
    costLearn: "What you should learn from this table: at the same coverage amount, the monthly price rises with age, and men usually pay more than women. Tobacco (not shown here) raises it again. Some amounts are scaled from a published band. This is not an offer.",
    costFoot: "A guaranteed-acceptance plan, at the same age and amount, usually costs more and waits about two years for natural death. It should not be the first chart you look at for high blood pressure alone.",
    coH: "Companies we can quote",
    coP: "After you understand the three paths, these are appointed companies Mejor Vida Insurance can quote when a health-question plan is still open. Ages and amounts vary. Approval is not guaranteed.",
    faq1q: "I take three blood-pressure pills. Will they say no?",
    faq1a: "The number of pills is not, by itself, a “no.” What matters is what they are for and whether there are hospital stays or organ damage. List the names. We will not guess the reason for each prescription.",
    faq2q: "Should I stop the medication before I apply?",
    faq2a: "No. Stopping a blood-pressure drug to “look healthier” is dangerous, and filled prescriptions usually show up in the review. Keep your doctor’s treatment.",
    faq3q: "Does high blood pressure count as pre-existing?",
    faq3a: "Yes: it is a diagnosis or treatment that already existed when you apply. On final expense that label does not mean an automatic wait. Many health-question plans accept it when there is no other listed damage.",
    faq4q: "Is there a home blood-pressure exam?",
    faq4a: "On these burial products, no. There are questions and a prescription review. A larger term policy sometimes does take vitals; we will not mix those rules here.",
    faq5q: "Can I buy if I also smoke?",
    faq5a: "There is usually a tobacco price, not an automatic close, if the rest of the questionnaire qualifies. Mention cigarettes, vaping, a patch, or cigars.",
    faq6q: "Is the no-questions plan cheaper at my age?",
    faq6a: "Almost never, at the same age and amount, because the company cannot select by health. Quote the health-question plan first.",
    faq7q: "I have high blood pressure and high cholesterol. Does that send me to the two-year wait?",
    faq7a: "Usually no, if those are the only histories. It is still a health-question plan. A stroke, a recent heart attack, or dialysis does change that answer.",
    faq8q: "My doctor says the pressure is “not controlled.” Does that close the plan that pays in full?",
    faq8a: "On the burial products we quote, we do not have a public table that turns your last reading into a yes or a no. We will not invent that cutoff. Tell us the readings and the other diagnoses; we will not promise an outcome.",
    nextLead: "See prices, or schedule a call with Mejor Vida Insurance. Mention blood pressure and any other diagnoses.",
    nextMore: `If there is also heart disease or a stroke, use those pages. Index: <a href="${L.hub}">pre-existing conditions</a>.`,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    coFoot: "Educational cards for appointed companies. A plan that pays less or returns premiums in the first years, or a guaranteed-acceptance plan, may add a wait. Not a binding quote.",
  };
}

function teachConditionMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const inner = `<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<p>${c.needP1}</p>
<p>${c.needP2}</p>
</section>
<section class="lic-section" id="what">
<h2>${c.whatH}</h2>
<p>${c.whatP1}</p>
<p>${c.whatP2}</p>
<p>${c.whatP3}</p>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<p>${c.howP1}</p>
<p>${c.howP2}</p>
<p>${c.howP3}</p>
</section>
<section class="lic-section" id="paths">
<h2>${c.pathsH}</h2>
${planCompareHtml(c)}
<p class="lic-rate-note">${c.pathsNote}</p>
</section>
<section class="lic-section" id="consider">
<h2>${c.considerH}</h2>
<p>${c.considerP}</p>
<div class="lic-split-lists lic-split-lists--cards">
<div>
<h3>${c.split1H}</h3>
<ul>
<li>${c.split1a}</li>
<li>${c.split1b}</li>
<li>${c.split1c}</li>
</ul>
</div>
<div>
<h3>${c.split2H}</h3>
<ul>
<li>${c.split2a}</li>
<li>${c.split2b}</li>
<li>${c.split2c}</li>
</ul>
</div>
</div>
</section>
<section class="lic-section" id="factors">
<h2>${c.factorsH}</h2>
<p>${c.factorsP}</p>
${factorCardsHtml(c)}
<p class="lic-rate-note">${c.factorsNote}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<p>${c.coP}</p>
${appointedCardsHtml(lang, c)}
${giCardHtml(lang, c)}
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<p class="lic-cost-lesson">${c.costLearn}</p>
${feRateBlock(c, L.quote)}
<p class="lic-rate-note">${c.costFoot}</p>
</section>`;
  return condShell(lang, page, c, {
    omitFaq: true,
    toc: isEs
      ? [
          ["#need", "La preocupación"],
          ["#how", "Cómo funciona"],
          ["#factors", "Qué importa"],
          ["#faq", "Preguntas"],
          ["#companies", "Compañías"],
          ["#cost", "Costo"],
        ]
      : [
          ["#need", "The question"],
          ["#how", "How it works"],
          ["#factors", "What matters"],
          ["#faq", "Questions"],
          ["#companies", "Companies"],
          ["#cost", "Cost"],
        ],
    inner,
  });
}

function hbpMain(lang, page, c) {
  return teachConditionMain(lang, page, c);
}

function tocPair(isEs) {
  return isEs
    ? [["#what", "Qué es"], ["#uw", "Cómo lo miran"], ["#changes", "Qué cambia"], ["#cost", "Costo"], ["#companies", "Compañías"], ["#faq", "Preguntas"]]
    : [["#what", "What it is"], ["#uw", "How they review it"], ["#changes", "What changes"], ["#cost", "Cost"], ["#companies", "Companies"], ["#faq", "Questions"]];
}

function condPageMain(lang, page, c, opts) {
  return condShell(lang, page, c, {
    toc: tocPair(lang === "es"),
    inner: conditionInner(lang, c, opts || {}),
  });
}

/* -------------------------------------------------------------------------- */
/* COPD                                                                        */
/* -------------------------------------------------------------------------- */

function copyCopd(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.cdc.gov/copd/about/index.html" rel="noopener" target="_blank">CDC: EPOC</a> — qué es, síntomas, tabaco y oxígeno; no es una regla de una aseguradora.'
      : '<a href="https://www.cdc.gov/copd/about/index.html" rel="noopener" target="_blank">CDC: COPD</a> — what it is, symptoms, tobacco, and oxygen; not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.nhlbi.nih.gov/health/copd" rel="noopener" target="_blank">NHLBI: EPOC</a> — enfisema y bronquitis crónica; por qué se trata; no hay cura, pero hay tratamiento.'
      : '<a href="https://www.nhlbi.nih.gov/health/copd" rel="noopener" target="_blank">NHLBI: COPD</a> — emphysema and chronic bronchitis; why it is treated; there is no cure, but there is treatment.',
    src4: isEs
      ? '<a href="https://www.lung.org/lung-health-diseases/lung-disease-lookup/copd" rel="noopener" target="_blank">American Lung Association: COPD</a> — material público para el consumidor sobre EPOC y cómo se vive con ella.'
      : '<a href="https://www.lung.org/lung-health-diseases/lung-disease-lookup/copd" rel="noopener" target="_blank">American Lung Association: COPD</a> — public consumer material on COPD and living with it.',
    src5: "",
    src6: "",
  });
  src.src5 = "";
  src.src6 = "";
  if (isEs) {
    return {
      ...b,
      ...src,
      hideJsRateNote: true,
      coWait: "¿Espera de 2 años?",
      coWaitNo: "No, si las preguntas de salud califican",
      coMooProduct: "Living Promise",
      coAetnaProduct: "Accendo Final Expense",
      coTaProduct: "Immediate Solution",
      coAmericoProduct: "Eagle Select",
      coGiProduct: "Vida entera de aceptación garantizada",
      coGiFoot: "Una póliza de aceptación garantizada por asegurado cada 12 meses; el total de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      title: "Seguro de gastos finales con EPOC o enfisema (2026) | Mejor Vida Seguros",
      desc: "La EPOC, sola, no obliga a un plan sin preguntas. Cómo funciona el seguro de gastos finales, qué cambian el tabaco y el oxígeno, y cuándo hay que decir que no lo sabemos.",
      h1: "¿Puede comprar gastos finales si tiene EPOC o enfisema?",
      lead: "A menudo sí. EPOC es el nombre corto de una enfermedad pulmonar que dificulta sacar el aire. El CDC y el NHLBI agrupan ahí el enfisema y la bronquitis crónica. En un seguro de entierro de monto pequeño, esa etiqueta <strong>por sí sola</strong> no es un “no” automático ni una espera automática de dos años. Lo que más cambia el producto es si todavía usa tabaco y si le recetaron oxígeno para el pulmón.",
      crumbEnd: "EPOC",
      take1: "El primer producto a cotizar suele ser un <strong>plan nivelado</strong>: una póliza con un cuestionario corto de salud que puede pagar el monto completo desde el primer pago cubierto, casi siempre sin espera de dos años.",
      take2: "El precio de ese plan, si emite, sigue a la edad, el sexo y el tabaco. No publicamos un cargo extra con el nombre “EPOC.” El tabaco a veces cambia el producto, no solo el mes.",
      take3: "Oxígeno para el pulmón y EPOC más tabaco no son la misma regla en todas las compañías. Cuéntenos ambos hechos. No inventamos un “sí” universal.",
      callout: "No compre un plan de <strong>aceptación garantizada</strong> — sin preguntas de salud y con unos dos años de espera por muerte natural — solo porque le dijeron EPOC. Cotice primero un plan con preguntas. Diga tabaco, oxígeno e inhaladores.",
      needH: "La preocupación real",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. Gastos finales es vida permanente de monto pequeño, pensada para esa factura — no sustituye una póliza grande de ingresos.",
      needP2: "Un diagnóstico que usted ya tiene se llama a menudo <strong>condición preexistente</strong>. Esa etiqueta no significa, por sí sola, una espera de dos años. El miedo suele ser: “Con el pulmón, ¿solo me venden un plan que espera?” El resto de la página explica esa diferencia <strong>antes</strong> de nombrar compañías.",
      whatH: "Qué significa la EPOC para su salud",
      whatP1: "El CDC describe la EPOC como un grupo de enfermedades pulmonares que empeoran con el tiempo y bloquean el flujo de aire. Los tipos más frecuentes son el enfisema y la bronquitis crónica. El NHLBI explica que el enfisema daña los sacos de aire; la bronquitis crónica irrita las vías y produce mucho moco. Muchas personas tienen una mezcla de ambos.",
      whatP2: "A menudo se cansa al caminar, tose o usa inhaladores a diario. No hay cura. El tratamiento puede incluir dejar de fumar, inhaladores, rehabilitación pulmonar y, si el oxígeno en sangre está bajo, oxígeno. El CDC señala el tabaco como la causa principal en Estados Unidos; también pueden enfermar quienes no fuman.",
      whatP3: "Una aseguradora no trata la EPOC. Decide si el historial, como queda escrito y como aparece en las recetas ya surtidas, cabe en un producto que está dispuesta a emitir. No le pide una espirometría — la prueba médica de cuánto aire puede soplar — en el consultorio de la agencia.",
      howH: "Cómo mira el seguro de vida un historial de salud",
      howP1: "En gastos finales el camino habitual no es un examen en el consultorio. Hay un cuestionario corto y, en la mayoría de los productos que cotizamos, una revisión de recetas. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega un reclamo.",
      howP2: "Si esas preguntas se pueden contestar sin chocar con lo que ese producto no puede emitir, el plan suele ser el nivelado: el monto completo puede aplicar a una muerte natural cubierta desde el primer pago. Si no puede emitir así, algunos productos pagan menos o devuelven primas en los primeros años. Si tampoco puede emitir, un plan de aceptación garantizada no hace preguntas de salud y espera unos dos años por muerte natural.",
      howP3: "El seguro temporal con montos más altos es otro producto: a veces hay laboratorios o una visita para tomar signos vitales. Si la necesidad es ingreso o hipoteca, no entierro, vea <a href=\"" + L.termCond + "\">temporal con condiciones previas</a>.",
      pathsH: "Tres tipos de plan, comparados",
      vsH: "Cómo se comparan los tres tipos de plan",
      vsCol1: "Paga completo",
      vsCol1Sub: "Plan nivelado, con preguntas",
      vsCol2: "Paga menos al inicio",
      vsCol2Sub: "Todavía hay preguntas",
      vsCol3: "Sin preguntas",
      vsCol3Sub: "Aceptación garantizada",
      vsR1H: "¿Hay preguntas de salud?",
      vsR1A: "Sí. Hay que calificar.",
      vsR1B: "Sí. Las respuestas no califican al plan que paga completo.",
      vsR1C: "No.",
      vsR2H: "Muerte natural en el primer año",
      vsR2A: "Puede pagar el monto completo.",
      vsR2B: "Paga una parte o devuelve primas, según el contrato.",
      vsR2C: "Devuelve primas con el interés del contrato. No paga el monto completo.",
      vsR3H: "Si la EPOC es lo principal, sin oxígeno",
      vsR3A: "A menudo sigue siendo el primer intento.",
      vsR3B: "Algunos productos usan este camino cuando el historial es más pesado.",
      vsR3C: "Reserva para cuando el cuestionario no puede emitir.",
      vsR4H: "Precio, en términos generales",
      vsR4A: "Suele ser el más bajo por dólar de estos tres, si califica.",
      vsR4B: "Varía. No inventamos una prima de muestra aquí.",
      vsR4C: "Suele costar más por dólar, a la misma edad y monto.",
      vsLearn: "Esta tabla enseña la diferencia entre los tres caminos. No es una cotización. Tabaco, oxígeno e internaciones todavía pueden cambiar la columna.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Los anuncios que mezclan las dos cosas casi siempre siguen teniendo cuestionario.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja: puede abrir más monto, un precio más bajo y el beneficio completo desde el primer pago cubierto. El límite es que el mismo cuestionario puede mandarlo a una espera o a aceptación garantizada si hay oxígeno para el pulmón, tabaco, internación reciente u otro diagnóstico. Dejar de fumar ayuda a su salud; no borra el historial que la compañía ya puede ver en las recetas.",
      split1H: "Suele seguir siendo un plan con preguntas",
      split1a: "EPOC, enfisema o bronquitis crónica con inhaladores, sin oxígeno recetado para el pulmón.",
      split1b: "CPAP solo para apnea del sueño, sin oxígeno extra.",
      split1c: "Caminar o trabajo físico varios días a la semana — en un producto que cotizamos, eso puede mejorar el precio si la EPOC es el único historial listado.",
      split2H: "Suele cambiar la conversación",
      split2a: "Oxígeno en tanque o concentrador recetado por el pulmón, lo use todos los días o no.",
      split2b: "EPOC y tabaco juntos: en algunos productos no emite el plan con preguntas; en otros sí, a precio de tabaco.",
      split2c: "Fibrosis pulmonar, hospicio, o estar internado ahora. Eso no es “EPOC típica.”",
      factorsH: "Qué puede cambiar una solicitud con EPOC",
      factorsP: "Cada tarjeta empieza con la idea de salud. A la derecha va solo lo que podemos afirmar para los productos de entierro que cotizamos. Si las compañías no coinciden, lo decimos.",
      factorsNote: "Estas notas no son una cotización. Edad, peso y un segundo diagnóstico todavía pueden cambiar el resultado.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Lo que podemos afirmar",
      f1c: "EPOC, enfisema o bronquitis crónica",
      f1w: "El CDC y el NHLBI tratan esas etiquetas como la misma familia de enfermedad pulmonar. Para el seguro de entierro, suele ser la misma conversación.",
      f1items: [
        "En los productos de entierro que cotizamos, el diagnóstico solo no es un “cierre automático.”",
        "En Transamerica Immediate Solution, EPOC, enfisema y bronquitis crónica se tratan de forma parecida: todavía puede emitir un plan con preguntas que paga completo si es el único historial listado.",
        "Living Promise lista EPOC entre los padecimientos que pueden ajustar o no emitir. No afirmamos que Living Promise siempre deje el plan que paga completo.",
      ],
      f2c: "Tabaco",
      f2w: "El CDC señala el cigarrillo como la causa principal de EPOC en Estados Unidos. Para el seguro, tabaco suele significar nicotina reciente — cigarrillos, vapeo, parche o cigarro.",
      f2items: [
        "No es una sola regla. En algunos productos que cotizamos, EPOC más tabaco no puede emitir el plan con preguntas. Entonces se mira aceptación garantizada si la edad y el monto caben.",
        "En otros, esa combinación todavía puede emitir a un precio de tabaco, no un “no” automático.",
      ],
      f2gap: "No vamos a decir que “EPOC más tabaco siempre cierra todas las compañías.” Las compañías tampoco usan el mismo recuento de meses sin nicotina. No vamos a elegir un solo recuento para todos los productos. Diga si fuma, vapea, usa parche o cigarro.",
      f3c: "Oxígeno y CPAP",
      f3w: "El CDC describe el oxígeno portátil como un tratamiento si el oxígeno en sangre está bajo. El CPAP es un aparato distinto, pensado sobre todo para la apnea del sueño.",
      f3items: [
        "En Americo Eagle Select, oxígeno suplementario para respirar en los últimos 12 meses impide emitir ese producto.",
        "En Transamerica Immediate Solution, el oxígeno se mira como enfermedad respiratoria crónica: todavía puede quedar un plan con preguntas que paga completo.",
        "CPAP sin oxígeno extra se trata, en ese mismo producto, mejor que CPAP con oxígeno extra.",
      ],
      f3gap: "No afirmamos que el oxígeno siempre lleve espera de dos años en todas las compañías de EE. UU. Tampoco inventamos cuántas compañías del país todavía emiten con tanque. En Accendo, no tenemos una pregunta de oxígeno publicada para repetir aquí; no vamos a adivinarla. Traiga el nombre del aparato.",
      f4c: "Inhaladores",
      f4w: "Un inhalador diario es tratamiento, no un rechazo por sí solo. El NHLBI describe medicamentos como parte habitual del control.",
      f4items: [
        "Liste los nombres. Las recetas ya surtidas suelen aparecer en la revisión.",
        "Un inhalador señala el diagnóstico. No es, por sí solo, el mismo problema que el oxígeno o una internación reciente.",
      ],
      f4gap: "No publicamos una lista pública de cada inhalador. No adivinamos para qué se lo recetaron.",
      f5c: "Internaciones y cómo se mueve",
      f5w: "El NHLBI señala que la EPOC grave puede limitar caminar, cocinar o cuidarse. El seguro pregunta internaciones y, a veces, si necesita ayuda para bañarse o vestirse.",
      f5items: [
        "Estar internado ahora, hospicio, o una cirugía pendiente con anestesia general suele cerrar el plan con preguntas en los productos que cotizamos.",
        "Una internación reciente puede cambiar el producto aunque el diagnóstico sea el mismo.",
      ],
      f6c: "Fibrosis pulmonar",
      f6w: "La fibrosis pulmonar es una cicatriz del pulmón. No es lo mismo que la EPOC típica.",
      f6items: [
        "En Transamerica Immediate Solution esa etiqueta no puede emitir ese producto.",
        "En Accendo, la fibrosis pulmonar está entre las situaciones que impiden completar esa solicitud.",
      ],
      f6gap: "Diga las palabras exactas del diagnóstico. No la trataremos como EPOC ordinaria.",
      f7c: "Caminar o trabajo físico",
      f7w: "Moverse con regularidad no “cura” la EPOC. En un producto que cotizamos, caminar o trabajo físico varios días a la semana puede mejorar el precio mensual cuando la EPOC es el único historial listado.",
      f7items: [
        "Eso no es una promesa de aprobación. Peso, tabaco y otros diagnósticos entran en la misma solicitud.",
      ],
      costH: "Precios mensuales de muestra si emite un plan con preguntas",
      costP: "Estas cifras son primas mensuales ilustrativas, no fumador, para un plan de gastos finales que puede pagar completo si el cuestionario emite. Léalas como el tamaño del producto por edad y sexo — no como el “precio de tener EPOC.” Quien usa tabaco paga más; a veces el tabaco cambia el producto.",
      costLearn: "Qué debe aprender de esta tabla: a la misma cobertura, el mes sube con la edad, y los hombres suelen pagar más que las mujeres. El tabaco (no mostrado aquí) sube otra vez. Algunos montos se calculan a partir de una banda publicada. No es una oferta.",
      costFoot: "Un plan de aceptación garantizada, a la misma edad y monto, suele costar más y espera unos dos años por muerte natural. Use esa tabla solo si el cuestionario no puede emitir.",
      coH: "Compañías que podemos cotizar",
      coP: "Después de entender los tres caminos, estas son compañías designadas que Mejor Vida Seguros puede cotizar. Con EPOC, no todas emiten el mismo tipo de plan. Edades y montos cambian. La aprobación no está garantizada.",
      faq1q: "¿Puedo tener el monto completo desde el primer pago si tengo EPOC?",
      faq1a: "A veces sí, si el cuestionario de esa compañía lo permite y no hay oxígeno, tabaco u otros historiales que lo cambien. No es una promesa. Cotice con los hechos reales.",
      faq2q: "Uso oxígeno por la noche. ¿Es lo mismo que CPAP?",
      faq2a: "No. El oxígeno para el pulmón y el CPAP para la apnea son aparatos distintos. En un producto que cotizamos, el oxígeno de los últimos 12 meses impide emitir. En otro, la enfermedad respiratoria crónica todavía puede dejar un plan que paga completo. Diga cuál aparato le recetaron.",
      faq3q: "Fumo y tengo EPOC. ¿Solo me queda el plan sin preguntas?",
      faq3a: "No en todas las compañías. En algunas esa combinación no emite el plan con preguntas. En otras puede emitir a precio de tabaco. No asuma el anuncio de televisión.",
      faq4q: "¿Los inhaladores me cierran el plan?",
      faq4a: "Un inhalador de EPOC señala el diagnóstico. No es, por sí solo, el mismo problema que el oxígeno o una internación reciente. Liste los nombres.",
      faq5q: "¿Hay una prueba de pulmón en la agencia?",
      faq5a: "En estos productos de entierro, no. El médico puede hacer espirometría. Nosotros hacemos preguntas y revisión de recetas.",
      faq6q: "¿El enfisema se cotiza distinto que la EPOC?",
      faq6a: "En el producto Transamerica que cotizamos para entierro, enfisema y EPOC siguen la misma conversación. Precise el oxígeno y el tabaco.",
      faq7q: "Tengo asma, no EPOC. ¿Es lo mismo?",
      faq7a: "No. El asma es otra enfermedad. En un producto que cotizamos, el asma leve sin esteroides diarios ni urgencias en cinco años puede cotizarse mejor que la EPOC. No mezcle las dos al describirse.",
      faq8q: "¿El oxígeno siempre significa dos años de espera?",
      faq8a: "No. Las compañías no coinciden. No vamos a inventar un “siempre” nacional. Cuéntenos el aparato y si todavía usa tabaco.",
      nextLead: "Vea precios, o programe una llamada con Mejor Vida Seguros. Mencione EPOC, tabaco, oxígeno e inhaladores.",
      nextMore: `Si el cuestionario no puede emitir, el plan de aceptación garantizada puede seguir abierto entre los 50 y los 80 años. Índice: <a href="${L.hub}">condiciones preexistentes</a>.`,
      nextSecondary: "Programar una llamada",
      nextSecondaryHref: L.schedule,
      coFoot: "Fichas educativas de compañías designadas. Un plan que paga menos o devuelve primas en los primeros años, o un plan de aceptación garantizada, puede añadir una espera. No es cotización vinculante.",
    };
  }
  return {
    ...b,
    ...src,
    hideJsRateNote: true,
    coWait: "2-year wait?",
    coWaitNo: "No, if the health questions qualify",
    coMooProduct: "Living Promise",
    coAetnaProduct: "Accendo Final Expense",
    coTaProduct: "Immediate Solution",
    coAmericoProduct: "Eagle Select",
    coGiProduct: "Guaranteed-acceptance whole life",
    coGiFoot: "One guaranteed-acceptance policy per insured every 12 months; that company’s total does not exceed $25,000. Educational — not a binding quote.",
    title: "Final expense insurance with COPD or emphysema (2026) | Mejor Vida Insurance",
    desc: "COPD by itself does not force a no-questions plan. How final expense works, what tobacco and oxygen change, and when we will say we do not know.",
    h1: "Can you buy final expense insurance if you have COPD or emphysema?",
    lead: "Often yes. COPD is the short name for a lung disease that makes it hard to get air out. The CDC and NHLBI group emphysema and chronic bronchitis there. On a small burial-size life policy, that label <strong>by itself</strong> is not an automatic “no” and not an automatic two-year wait. What most often changes the product is whether you still use tobacco and whether oxygen was prescribed for the lungs.",
    crumbEnd: "COPD",
    take1: "The first product to quote is usually a <strong>level plan</strong>: a policy with a short health questionnaire that can pay the full amount from the first covered payment, usually with no two-year wait.",
    take2: "The price of that plan, if it issues, follows age, sex, and tobacco. We do not publish an extra charge labeled “COPD.” Tobacco can change the product, not only the monthly price.",
    take3: "Oxygen for the lungs and COPD plus tobacco are not one rule at every company. Tell us both facts. We will not invent a universal yes.",
    callout: "Do not buy a <strong>guaranteed-acceptance</strong> plan — no health questions, and about a two-year wait for natural death — just because you were told you have COPD. Quote a plan with health questions first. Mention tobacco, oxygen, and inhalers.",
    needH: "The worry people actually have",
    needP1: "Families look for this coverage because a funeral, the cemetery, and small debts can fall on relatives. Final expense is permanent life insurance in a small amount, meant for that bill — it does not replace a large income policy.",
    needP2: "A diagnosis you already have is often called a <strong>pre-existing condition</strong>. That label does not, by itself, mean a two-year wait. The fear is usually: “With the lungs, will they only sell me a plan that waits?” The rest of this page explains that difference <strong>before</strong> naming companies.",
    whatH: "What COPD means for your health",
    whatP1: "The CDC describes COPD as a group of lung diseases that get worse over time and block airflow. The most common types are emphysema and chronic bronchitis. The NHLBI explains that emphysema damages the air sacs; chronic bronchitis irritates the airways and makes a lot of mucus. Many people have a mix of both.",
    whatP2: "People often tire when walking, cough, or use daily inhalers. There is no cure. Treatment can include quitting smoking, inhalers, pulmonary rehabilitation, and, if blood oxygen is low, oxygen. The CDC names tobacco as the main cause in the United States; people who never smoked can still get COPD.",
    whatP3: "An insurer does not treat COPD. It decides whether the history, as it is written and as it appears in prescriptions already filled, fits a product it is willing to issue. It does not ask for spirometry — the medical test of how much air you can blow out — at the agency office.",
    howH: "How life insurance reviews a health history",
    howP1: "On final expense the usual path is not an office exam. There is a short questionnaire and, on most products we quote, a review of prescriptions. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "If those questions can be answered without hitting what that product cannot issue, the plan is usually level: the full amount can apply to a covered natural death from the first payment. If it cannot issue that way, some products pay less or return premiums in the first years. If even that cannot issue, a guaranteed-acceptance plan asks no health questions and waits about two years for natural death.",
    howP3: "Term life at larger amounts is a different product: sometimes there are labs or a visit to take vitals. If the need is income or a mortgage, not burial, see <a href=\"" + L.termCond + "\">term life with pre-existing conditions</a>.",
    pathsH: "Three kinds of plans, compared",
    vsH: "How the three kinds of plans compare",
    vsCol1: "Pays in full",
    vsCol1Sub: "Level plan, with questions",
    vsCol2: "Pays less at first",
    vsCol2Sub: "Still has questions",
    vsCol3: "No questions",
    vsCol3Sub: "Guaranteed acceptance",
    vsR1H: "Health questions?",
    vsR1A: "Yes. You have to qualify.",
    vsR1B: "Yes. The answers do not qualify for the plan that pays in full.",
    vsR1C: "None.",
    vsR2H: "Natural death in year one",
    vsR2A: "Can pay the full amount.",
    vsR2B: "Pays a portion or returns premiums, per the contract.",
    vsR2C: "Returns premiums plus contract interest. Does not pay the full amount.",
    vsR3H: "If COPD is the main history, without oxygen",
    vsR3A: "Often still the first try.",
    vsR3B: "Some products use this path when the history is heavier.",
    vsR3C: "Held for when the questionnaire cannot issue.",
    vsR4H: "Price, in plain terms",
    vsR4A: "Usually the lowest per dollar of these three, if you qualify.",
    vsR4B: "It varies. We will not invent a sample premium here.",
    vsR4C: "Usually costs more per dollar, at the same age and amount.",
    vsLearn: "This chart teaches the difference among the three paths. It is not a quote. Tobacco, oxygen, and hospital stays can still change the column.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. Ads that combine both almost always still have a questionnaire.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage: it can open more coverage, a lower price, and a full benefit from the first covered payment. The limitation is that the same questionnaire can send you to a wait or to guaranteed acceptance if there is oxygen for the lungs, tobacco, a recent hospital stay, or another diagnosis. Quitting smoking helps your health; it does not erase the history a company can already see in prescriptions.",
    split1H: "Usually still a plan with questions",
    split1a: "COPD, emphysema, or chronic bronchitis with inhalers, and no oxygen prescribed for the lungs.",
    split1b: "CPAP only for sleep apnea, with no extra oxygen.",
    split1c: "Walking or physical work several days a week — on one product we quote, that can improve the price if COPD is the only listed history.",
    split2H: "Usually changes the conversation",
    split2a: "A tank or concentrator prescribed for the lungs, whether you use it every day or not.",
    split2b: "COPD and tobacco together: on some products the health-question plan cannot issue; on others it can, at a tobacco price.",
    split2c: "Pulmonary fibrosis, hospice, or being in the hospital now. That is not “typical COPD.”",
    factorsH: "What can change a COPD application",
    factorsP: "Each card starts with the health idea. The right side lists only what we can state for the burial products we quote. If companies do not agree, we say so.",
    factorsNote: "These notes are not a quote. Age, height and weight, and a second diagnosis can still change the result.",
    fMeaning: "In plain language",
    fVerify: "What we can state",
    f1c: "COPD, emphysema, or chronic bronchitis",
    f1w: "The CDC and NHLBI treat those labels as the same family of lung disease. For burial insurance, it is usually the same conversation.",
    f1items: [
      "On the burial products we quote, the diagnosis alone is not an automatic close.",
      "On Transamerica Immediate Solution, COPD, emphysema, and chronic bronchitis are treated in a similar way: a health-question plan that pays in full can still issue if that is the only listed history.",
      "Living Promise lists COPD among impairments that may adjust or not issue. We will not claim Living Promise always leaves the plan that pays in full.",
    ],
    f2c: "Tobacco",
    f2w: "The CDC names cigarettes as the main cause of COPD in the United States. For insurance, tobacco usually means recent nicotine — cigarettes, vaping, a patch, or cigars.",
    f2items: [
      "It is not one rule. On some products we quote, COPD plus tobacco cannot issue the health-question plan. Then we look at guaranteed acceptance if age and amount fit.",
      "On others, that combination can still issue at a tobacco price, not an automatic “no.”",
    ],
    f2gap: "We will not say “COPD plus tobacco always closes every company.” Companies also do not use the same nicotine-free month count. We will not pick one count for every product. Say whether you smoke, vape, use a patch, or cigars.",
    f3c: "Oxygen and CPAP",
    f3w: "The CDC describes portable oxygen as a treatment if blood oxygen is low. CPAP is a different machine, used mainly for sleep apnea.",
    f3items: [
      "On Americo Eagle Select, supplemental oxygen for breathing in the last 12 months stops that product from issuing.",
      "On Transamerica Immediate Solution, oxygen is reviewed as chronic respiratory disease: a health-question plan that pays in full can still be open.",
      "CPAP with no extra oxygen is treated, on that same product, more favorably than CPAP with extra oxygen.",
    ],
    f3gap: "We will not claim oxygen always means a two-year wait at every U.S. company. We will not invent how many companies in the country still issue with a tank. On Accendo, we do not have a published oxygen question to repeat here; we will not guess it. Bring the name of the machine.",
    f4c: "Inhalers",
    f4w: "A daily inhaler is a treatment, not a “no” by itself. The NHLBI describes medicine as a usual part of control.",
    f4items: [
      "List the names. Filled prescriptions usually show up in the review.",
      "An inhaler flags the diagnosis. By itself it is not the same problem as oxygen or a recent hospital stay.",
    ],
    f4gap: "We do not publish a public inhaler-by-inhaler list. We will not guess what each prescription is for.",
    f5c: "Hospital stays and how you get around",
    f5w: "The NHLBI notes that serious COPD can limit walking, cooking, or taking care of yourself. Insurance asks about hospital stays and, sometimes, whether you need help bathing or dressing.",
    f5items: [
      "Being in the hospital now, hospice, or pending surgery with general anesthesia usually closes the health-question plan on the products we quote.",
      "A recent hospital stay can change the product even when the diagnosis is the same.",
    ],
    f6c: "Pulmonary fibrosis",
    f6w: "Pulmonary fibrosis is scarring of the lung. It is not the same as typical COPD.",
    f6items: [
      "On Transamerica Immediate Solution that label cannot issue that product.",
      "On Accendo, pulmonary fibrosis is among the situations that stop that application from being completed.",
    ],
    f6gap: "Tell us the exact words on the diagnosis. We will not treat it as ordinary COPD.",
    f7c: "Walking or physical work",
    f7w: "Moving regularly does not “cure” COPD. On one product we quote, walking or physical work several days a week can improve the monthly price when COPD is the only listed history.",
    f7items: [
      "That is not a promise of approval. Height, weight, tobacco, and other diagnoses go on the same application.",
    ],
    costH: "Sample monthly prices if a health-question plan issues",
    costP: "These figures are illustrative monthly premiums, non-tobacco, for a final expense plan that can pay in full if the questionnaire issues. Read them as the size of the product by age and sex — not as the “price of having COPD.” Someone who uses tobacco pays more; sometimes tobacco changes the product.",
    costLearn: "What you should learn from this table: at the same coverage amount, the monthly price rises with age, and men usually pay more than women. Tobacco (not shown here) raises it again. Some amounts are scaled from a published band. This is not an offer.",
    costFoot: "A guaranteed-acceptance plan, at the same age and amount, usually costs more and waits about two years for natural death. Use that table only if the questionnaire cannot issue.",
    coH: "Companies we can quote",
    coP: "After you understand the three paths, these are appointed companies Mejor Vida Insurance can quote. With COPD, they do not all issue the same kind of plan. Ages and amounts vary. Approval is not guaranteed.",
    faq1q: "Can I get the full amount from the first payment if I have COPD?",
    faq1a: "Sometimes yes, if that company’s questionnaire allows it and oxygen, tobacco, or other history does not change the product. It is not a promise. Quote with real facts.",
    faq2q: "I use oxygen at night. Is that the same as CPAP?",
    faq2a: "No. Oxygen for the lungs and CPAP for apnea are different machines. On one product we quote, oxygen in the last 12 months stops that product from issuing. On another, chronic respiratory disease can still leave a plan that pays in full. Say which device was prescribed.",
    faq3q: "I smoke and have COPD. Is the no-questions plan my only option?",
    faq3a: "Not at every company. On some, that combination cannot issue the health-question plan. On others it can issue at a tobacco price. Do not assume the television ad.",
    faq4q: "Do inhalers close the plan?",
    faq4a: "A COPD inhaler flags the diagnosis. By itself it is not the same problem as oxygen or a recent hospital stay. List the names.",
    faq5q: "Is there a lung test at the agency?",
    faq5a: "On these burial products, no. A doctor may do spirometry. We use questions and a prescription review.",
    faq6q: "Is emphysema quoted differently from COPD?",
    faq6a: "On the Transamerica burial product we quote, emphysema and COPD are the same conversation. Be precise about oxygen and tobacco.",
    faq7q: "I have asthma, not COPD. Is that the same?",
    faq7a: "No. Asthma is a different disease. On one product we quote, mild asthma with no daily steroids and no emergency-room visits in five years can price better than COPD. Do not mix the two when you describe yourself.",
    faq8q: "Does oxygen always mean a two-year wait?",
    faq8a: "No. Companies do not agree. We will not invent a national “always.” Tell us the machine and whether you still use tobacco.",
    nextLead: "See prices, or schedule a call with Mejor Vida Insurance. Mention COPD, tobacco, oxygen, and inhalers.",
    nextMore: `If the questionnaire cannot issue, a guaranteed-acceptance plan may still be open from ages 50 to 80. Index: <a href="${L.hub}">pre-existing conditions</a>.`,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    coFoot: "Educational cards for appointed companies. A plan that pays less or returns premiums in the first years, or a guaranteed-acceptance plan, may add a wait. Not a binding quote.",
  };
}

function copdMain(lang, page, c) {
  return teachConditionMain(lang, page, c);
}

/* -------------------------------------------------------------------------- */
/* Cancer                                                                      */
/* -------------------------------------------------------------------------- */

function copyCancer(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.cancer.gov/about-cancer/understanding/what-is-cancer" rel="noopener" target="_blank">Instituto Nacional del Cáncer: qué es el cáncer</a> — células que crecen sin control, tumores y metástasis; no es una regla de una aseguradora.'
      : '<a href="https://www.cancer.gov/about-cancer/understanding/what-is-cancer" rel="noopener" target="_blank">National Cancer Institute: what cancer is</a> — cells that grow out of control, tumors, and metastasis; not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.cdc.gov/cancer/index.html" rel="noopener" target="_blank">CDC: cáncer</a> — tipos frecuentes y por qué el seguimiento importa para la salud, no para una cotización.'
      : '<a href="https://www.cdc.gov/cancer/index.html" rel="noopener" target="_blank">CDC: cancer</a> — common types and why follow-up matters for health, not for a quote.',
    src4: isEs
      ? '<a href="https://www.cancer.gov/types/metastatic-cancer" rel="noopener" target="_blank">NCI: cáncer metastásico</a> — cuando el cáncer se desplaza a otra parte del cuerpo; no sustituye el cuestionario de una póliza.'
      : '<a href="https://www.cancer.gov/types/metastatic-cancer" rel="noopener" target="_blank">NCI: metastatic cancer</a> — when cancer moves to another part of the body; it does not replace a policy questionnaire.',
    src5: isEs
      ? '<a href="https://www.cdc.gov/skin-cancer/about/index.html" rel="noopener" target="_blank">CDC: cáncer de piel</a> — carcinoma basocelular, células escamosas y melanoma son conversaciones médicas distintas.'
      : '<a href="https://www.cdc.gov/skin-cancer/about/index.html" rel="noopener" target="_blank">CDC: skin cancer</a> — basal cell carcinoma, squamous cell, and melanoma are different medical conversations.',
    src6: "",
  });
  src.src6 = "";
  if (isEs) {
    return {
      ...b,
      ...src,
      hideJsRateNote: true,
      coWait: "¿Espera de 2 años?",
      coWaitNo: "No, si las preguntas de salud califican",
      coMooProduct: "Living Promise",
      coAetnaProduct: "Accendo Final Expense",
      coTaProduct: "Immediate Solution",
      coAmericoProduct: "Eagle Select",
      coGiProduct: "Vida entera de aceptación garantizada",
      coGiFoot: "Una póliza de aceptación garantizada por asegurado cada 12 meses; el total de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      title: "Seguro de gastos finales con cáncer (2026) | Mejor Vida Seguros",
      desc: "El cáncer no es una sola respuesta de seguro. Cómo funciona gastos finales, qué cambian el tipo y la fecha del tratamiento, y cuándo hay que decir que no lo sabemos.",
      h1: "¿Puede comprar gastos finales si tiene o tuvo cáncer?",
      lead: "A menudo sí hay un producto, pero no siempre el mismo. El NCI describe el cáncer como un grupo de enfermedades en las que las células crecen sin control. En un seguro de entierro de monto pequeño, la pregunta útil no es “¿tuvo cáncer alguna vez?” sino <strong>si el tratamiento sigue, cuándo terminó y de qué tipo</strong>. Eso decide si cabe un plan con preguntas o un plan sin preguntas y con espera.",
      crumbEnd: "Cáncer",
      take1: "El plan que muchas familias quieren primero es un <strong>plan nivelado</strong>: una póliza con un cuestionario corto de salud que puede pagar el monto completo desde el primer pago cubierto, casi siempre sin espera de dos años.",
      take2: "Si hay quimioterapia, radiación u otro tratamiento activo ahora, ese plan con preguntas a menudo no puede emitir en las compañías que cotizamos. Entonces se mira un plan sin preguntas de salud, si la edad y el monto caben.",
      take3: "Libre de tratamiento durante un tiempo no es una sola fecha en todas las compañías. No inventamos un “sí” para cáncer en curso en etapa temprana. Cuéntenos el tipo y las fechas.",
      callout: "No compre un plan de <strong>aceptación garantizada</strong> — sin preguntas de salud y con unos dos años de espera por muerte natural — solo porque oyó la palabra cáncer. Si el tratamiento ya terminó, cotice primero el plan con preguntas. Diga el tipo, las fechas y las pastillas.",
      needH: "La preocupación real",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. Gastos finales es vida permanente de monto pequeño, pensada para esa factura — no paga la quimioterapia ni sustituye una póliza grande de ingresos.",
      needP2: "Un diagnóstico que usted ya tiene se llama a menudo <strong>condición preexistente</strong>. Esa etiqueta no significa, por sí sola, una espera de dos años. El miedo suele ser: “Con cáncer, ¿solo me venden un plan que espera?” El resto de la página explica esa diferencia <strong>antes</strong> de nombrar compañías.",
      whatH: "Qué significa el cáncer para su salud",
      whatP1: "El NCI explica que el cáncer aparece cuando células dañadas se multiplican cuando no deberían. Pueden formar un tumor — un bulto de tejido — o, en las leucemias, acumularse en la sangre sin un bulto sólido. Un tumor benigno no invade como el cáncer; uno maligno sí puede crecer hacia tejidos cercanos.",
      whatP2: "Cuando las células cancerosas se desprenden y forman tumores en otra parte del cuerpo, el NCI lo llama <strong>metástasis</strong>. Ese hecho importa para el médico y, más adelante en esta página, para qué producto de seguro todavía puede emitir. El CDC agrupa muchos tipos de cáncer; el de piel basocelular, el de células escamosas y el melanoma no son la misma conversación médica.",
      whatP3: "Una aseguradora no trata el cáncer. Decide si el historial, como queda escrito y como aparece en las recetas ya surtidas, cabe en un producto que está dispuesta a emitir. No le pide una biopsia en el consultorio de la agencia.",
      howH: "Cómo mira el seguro de vida un historial de salud",
      howP1: "En gastos finales el camino habitual no es un examen en el consultorio. Hay un cuestionario corto y, en la mayoría de los productos que cotizamos, una revisión de recetas. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega un reclamo.",
      howP2: "Si esas preguntas se pueden contestar sin chocar con lo que ese producto no puede emitir, el plan suele ser el nivelado: el monto completo puede aplicar a una muerte natural cubierta desde el primer pago. Si no puede emitir así, algunos productos pagan menos o devuelven primas en los primeros años. Si tampoco puede emitir, un plan de aceptación garantizada no hace preguntas de salud y espera unos dos años por muerte natural.",
      howP3: "El seguro temporal con montos más altos es otro producto: a veces hay laboratorios o una visita para tomar signos vitales. Un historial de cáncer suele estrechar ese camino. Si la necesidad es ingreso o hipoteca, no entierro, vea <a href=\"" + L.termCond + "\">temporal con condiciones previas</a>.",
      pathsH: "Tres tipos de plan, comparados",
      vsH: "Cómo se comparan los tres tipos de plan",
      vsCol1: "Paga completo",
      vsCol1Sub: "Plan nivelado, con preguntas",
      vsCol2: "Paga menos al inicio",
      vsCol2Sub: "Todavía hay preguntas",
      vsCol3: "Sin preguntas",
      vsCol3Sub: "Aceptación garantizada",
      vsR1H: "¿Hay preguntas de salud?",
      vsR1A: "Sí. Hay que calificar.",
      vsR1B: "Sí. Las respuestas no califican al plan que paga completo.",
      vsR1C: "No.",
      vsR2H: "Muerte natural en el primer año",
      vsR2A: "Puede pagar el monto completo.",
      vsR2B: "Paga una parte o devuelve primas, según el contrato.",
      vsR2C: "Devuelve primas con el interés del contrato. No paga el monto completo.",
      vsR3H: "Si el tratamiento ya terminó hace tiempo",
      vsR3A: "A menudo el primer intento, si el tipo y las fechas caben.",
      vsR3B: "Algunos productos usan este camino cuando el historial es más reciente.",
      vsR3C: "Reserva para cuando el cuestionario no puede emitir — incluso con tratamiento ahora.",
      vsR4H: "Precio, en términos generales",
      vsR4A: "Suele ser el más bajo por dólar de estos tres, si califica.",
      vsR4B: "Varía. No inventamos una prima de muestra aquí.",
      vsR4C: "Suele costar más por dólar, a la misma edad y monto.",
      vsLearn: "Esta tabla enseña la diferencia entre los tres caminos. No es una cotización. El tipo de cáncer, las fechas y las recetas todavía pueden cambiar la columna.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Los anuncios que mezclan las dos cosas casi siempre siguen teniendo cuestionario.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja cuando ya no hay tratamiento activo: puede abrir más monto, un precio más bajo y el beneficio completo desde el primer pago cubierto. El límite es que el mismo cuestionario puede mandarlo a una espera o a aceptación garantizada si el tratamiento sigue, si el cáncer volvió, si se extendió, o si hay más de un cáncer. Esperar a “verse más sano” sube la edad. Omitir una pastilla oncológica no borra las recetas ya surtidas.",
      split1H: "Suele seguir siendo un plan con preguntas",
      split1a: "Cáncer de piel basocelular, sin otro cáncer interno.",
      split1b: "Un solo cáncer, sin extensión a otra parte del cuerpo, y sin tratamiento durante el tiempo que pide ese producto.",
      split1c: "Tratamiento solo con cirugía hace años, sin recetas oncológicas actuales — se confirma con las fechas, no con un titular.",
      split2H: "Suele cambiar la conversación",
      split2a: "Quimioterapia, radiación, inmunoterapia u otro tratamiento activo ahora.",
      split2b: "Cáncer que se extendió, que volvió, o más de un cáncer distinto.",
      split2c: "Leucemia, linfoma o un cáncer infantil en un menor. Eso no es “un lunar antiguo.”",
      factorsH: "Qué puede cambiar una solicitud con cáncer",
      factorsP: "Cada tarjeta empieza con la idea de salud. A la derecha va solo lo que podemos afirmar para los productos de entierro que cotizamos. Si las compañías no coinciden, lo decimos.",
      factorsNote: "Estas notas no son una cotización. Edad, peso y un segundo diagnóstico todavía pueden cambiar el resultado.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Lo que podemos afirmar",
      f1c: "El tipo de cáncer",
      f1w: "El CDC separa el cáncer de piel basocelular, el de células escamosas y el melanoma. El NCI trata el melanoma como un cáncer que empieza en las células del pigmento, no como un lunar simple.",
      f1items: [
        "En Transamerica Immediate Solution, el carcinoma basocelular no entra en la misma fila que los demás cánceres.",
        "El melanoma y los cánceres internos se miran con las reglas de cáncer, no como “solo piel.”",
      ],
      f1gap: "No vamos a decir que “todas las solicitudes de entierro ignoran el basal y el escamoso.” En el producto Transamerica que cotizamos, la excepción publicada es el basal, no una lista nacional de piel.",
      f2c: "Tratamiento ahora",
      f2w: "El NCI describe cirugía, medicamentos, radiación y otros tratamientos. Para el seguro, “ahora” suele significar que todavía hay recetas o citas de tratamiento.",
      f2items: [
        "En las compañías de entierro que cotizamos, un tratamiento activo suele impedir el plan con preguntas que paga completo.",
        "Si la edad está entre 50 y 80, el plan de aceptación garantizada que cotizamos puede seguir abierto. No pregunta el tipo de cáncer. A cambio espera unos dos años por muerte natural.",
      ],
      f2gap: "No vamos a afirmar que un cáncer en curso en etapa muy temprana todavía abre, en nuestras compañías designadas, el beneficio completo desde el primer pago. No tenemos esa tabla verificada para los productos que cotizamos.",
      f3c: "Cuánto tiempo desde el último tratamiento",
      f3w: "El médico habla de remisión cuando ya no hay signos de enfermedad. El seguro pregunta fechas: diagnóstico, último tratamiento, y si volvió.",
      f3items: [
        "En Transamerica Immediate Solution, un cáncer que no es basal: inicio en los últimos dos años no puede emitir ese producto. Libre de cáncer y sin tratamiento en los últimos dos años todavía puede quedar un plan con preguntas que paga completo, si es el único historial listado.",
        "Living Promise lista el cáncer entre los padecimientos que pueden ajustar o no emitir. No afirmamos que Living Promise use la misma ventana de dos años.",
      ],
      f3gap: "Las compañías no comparten un solo recuento de meses. No vamos a elegir un número para todos los productos. Tampoco aplicamos a Living Promise o Accendo un gráfico de plazos de otro producto Transamerica.",
      f4c: "Si se extendió o volvió",
      f4w: "El NCI llama metástasis al cáncer que viaja a otra parte del cuerpo. Recurrencia es cuando vuelve después de un tiempo sin enfermedad.",
      f4items: [
        "En Transamerica Immediate Solution, metastásico, recurrente, varios cánceres, o extensión a ganglios no puede emitir ese producto.",
        "Living Promise lista cáncer metastásico o recurrente entre los padecimientos que pueden ajustar o no emitir.",
      ],
      f4gap: "No vamos a decir que “algunas compañías de EE. UU. todavía pagan completo después de metástasis si pasaron 24 meses.” Eso no está verificado en los productos que cotizamos.",
      f5c: "Pastillas después del cáncer",
      f5w: "Algunas pastillas se usan para bajar el riesgo de que el cáncer vuelva. El médico las llama tratamiento o prevención. La aseguradora las ve en las recetas ya surtidas.",
      f5items: [
        "Liste los nombres. No omita una pastilla “porque ya no tengo cáncer.”",
        "En Accendo, varios medicamentos usados para cáncer impiden completar esa solicitud. En Living Promise, algunos también impiden emitir; otros piden el motivo en la solicitud.",
      ],
      f5gap: "No publicamos una lista pública de cada pastilla. No adivinamos para qué se la recetaron. Si no está en lo que hemos verificado, lo diremos en la cotización en lugar de inventar un sí.",
      f6c: "Leucemia, linfoma y cáncer en un menor",
      f6w: "El NCI describe la leucemia como cáncer de la sangre y el linfoma como cáncer de células inmunes. No son un lunar.",
      f6items: [
        "En Transamerica Immediate Solution, Hodgkin y linfoma se miran como cáncer. Un cáncer en un menor no puede emitir ese producto de entierro para juveniles.",
        "En Americo Eagle Select, la leucemia está entre las situaciones que impiden emitir ese producto.",
      ],
      f7c: "Un segundo diagnóstico",
      f7w: "El cáncer puede ir solo. También puede ir con internación, hospicio o otro órgano dañado.",
      f7items: [
        "Estar internado ahora, hospicio, o una cirugía pendiente con anestesia general suele cerrar el plan con preguntas en los productos que cotizamos.",
        "Un trasplante de médula ósea no puede emitir en Transamerica Immediate Solution.",
      ],
      costH: "Precios mensuales de muestra si emite un plan con preguntas",
      costP: "Estas cifras son primas mensuales ilustrativas, no fumador, para un plan de gastos finales que puede pagar completo si el cuestionario emite. Léalas como el tamaño del producto por edad y sexo — no como el “precio de tener cáncer.” Si el tratamiento activo manda a aceptación garantizada, este cuadro no aplica.",
      costLearn: "Qué debe aprender de esta tabla: a la misma cobertura, el mes sube con la edad, y los hombres suelen pagar más que las mujeres. El tabaco (no mostrado aquí) sube otra vez. Algunos montos se calculan a partir de una banda publicada. No es una oferta.",
      costFoot: "Un plan de aceptación garantizada, a la misma edad y monto, suele costar más y espera unos dos años por muerte natural. Use esa tabla si el cuestionario no puede emitir.",
      coH: "Compañías que podemos cotizar",
      coP: "Después de entender los tres caminos, estas son compañías designadas que Mejor Vida Seguros puede cotizar. Con cáncer, no todas emiten el mismo tipo de plan. Edades y montos cambian. La aprobación no está garantizada.",
      faq1q: "Estoy en quimioterapia. ¿Puedo comprar gastos finales?",
      faq1a: "Sí puede haber un producto. En las compañías que cotizamos, el camino habitual con tratamiento activo es aceptación garantizada entre los 50 y los 80 años, no el plan que paga completo desde el primer pago. Hay espera de unos dos años por muerte natural. Un accidente cubierto puede pagar antes, según el contrato.",
      faq2q: "Terminé el tratamiento hace tres años. ¿Hay espera?",
      faq2a: "En un producto que cotizamos, libre de cáncer y sin tratamiento dos años todavía puede quedar un plan que paga completo si el resto del cuestionario califica. Otras compañías tienen sus propias ventanas. Cotice con la fecha real. No es una promesa.",
      faq3q: "¿Un cáncer de piel me manda al plan sin preguntas?",
      faq3a: "Muchos basales no. El melanoma se mira con las reglas de cáncer, no como un lunar simple. El de células escamosas no es la misma excepción en todos los productos que cotizamos. Diga las palabras exactas del diagnóstico.",
      faq4q: "¿Debo esperar a la remisión para solicitar?",
      faq4a: "Si quiere el plan que paga completo, a veces hay que esperar la ventana de ese producto. Si necesita algo ahora, la aceptación garantizada puede emitir dentro de 50–80 sin esas preguntas. Esperar también sube la edad y la prima.",
      faq5q: "¿Este seguro paga el tratamiento del cáncer?",
      faq5a: "No. Es vida: un cheque a los beneficiarios cuando usted fallece. No es un plan de salud. Algunos productos designados pueden adelantar una parte si un médico certifica una enfermedad terminal, con reglas y tope; no sustituye el tratamiento.",
      faq6q: "Tuve dos cánceres distintos. ¿Qué pasa?",
      faq6a: "En Transamerica Immediate Solution, varios cánceres no pueden emitir ese producto. Entonces se mira aceptación garantizada si califica por edad. No envíe el plan con preguntas a ciegas.",
      faq7q: "Sigo una pastilla “solo de prevención.” ¿Eso cierra el plan?",
      faq7a: "Depende de la pastilla y de la compañía. En algunas, ciertos medicamentos de cáncer impiden completar la solicitud. En otras piden el motivo. Liste el nombre. No vamos a adivinarlo desde un titular.",
      faq8q: "¿El plan sin preguntas es más barato a mi edad?",
      faq8a: "Casi nunca, a la misma edad y monto, porque la compañía no selecciona por salud. Cotice primero el plan con preguntas si las fechas lo permiten.",
      nextLead: "Vea precios, o programe una llamada con Mejor Vida Seguros. Mencione el tipo de cáncer, las fechas de tratamiento y las pastillas.",
      nextMore: `Si el tratamiento sigue, el plan de aceptación garantizada puede seguir abierto entre los 50 y los 80 años. Índice: <a href="${L.hub}">condiciones preexistentes</a>.`,
      nextSecondary: "Programar una llamada",
      nextSecondaryHref: L.schedule,
      coFoot: "Fichas educativas de compañías designadas. Un plan que paga menos o devuelve primas en los primeros años, o un plan de aceptación garantizada, puede añadir una espera. No es cotización vinculante.",
    };
  }
  return {
    ...b,
    ...src,
    hideJsRateNote: true,
    coWait: "2-year wait?",
    coWaitNo: "No, if the health questions qualify",
    coMooProduct: "Living Promise",
    coAetnaProduct: "Accendo Final Expense",
    coTaProduct: "Immediate Solution",
    coAmericoProduct: "Eagle Select",
    coGiProduct: "Guaranteed-acceptance whole life",
    coGiFoot: "One guaranteed-acceptance policy per insured every 12 months; that company’s total does not exceed $25,000. Educational — not a binding quote.",
    title: "Final expense insurance with cancer (2026) | Mejor Vida Insurance",
    desc: "Cancer is not one insurance answer. How final expense works, what type and treatment dates change, and when we will say we do not know.",
    h1: "Can you buy final expense insurance if you have or had cancer?",
    lead: "Often there is a product, but not always the same one. The NCI describes cancer as a group of diseases in which cells grow out of control. On a small burial-size life policy, the useful question is not “did you ever have cancer?” but <strong>whether treatment is still going, when it ended, and what kind</strong>. That decides whether a plan with health questions can issue, or a no-questions plan with a wait.",
    crumbEnd: "Cancer",
    take1: "The plan many families want first is a <strong>level plan</strong>: a policy with a short health questionnaire that can pay the full amount from the first covered payment, usually with no two-year wait.",
    take2: "If chemotherapy, radiation, or other active treatment is happening now, that health-question plan often cannot issue at the companies we quote. Then we look at a plan with no health questions, if age and amount fit.",
    take3: "Being off treatment for a while is not one date at every company. We will not invent a yes for current early-stage cancer. Tell us the type and the dates.",
    callout: "Do not buy a <strong>guaranteed-acceptance</strong> plan — no health questions, and about a two-year wait for natural death — just because you heard the word cancer. If treatment already ended, quote a plan with health questions first. Mention the type, the dates, and the pills.",
    needH: "The worry people actually have",
    needP1: "Families look for this coverage because a funeral, the cemetery, and small debts can fall on relatives. Final expense is permanent life insurance in a small amount, meant for that bill — it does not pay for chemotherapy and it does not replace a large income policy.",
    needP2: "A diagnosis you already have is often called a <strong>pre-existing condition</strong>. That label does not, by itself, mean a two-year wait. The fear is usually: “With cancer, will they only sell me a plan that waits?” The rest of this page explains that difference <strong>before</strong> naming companies.",
    whatH: "What cancer means for your health",
    whatP1: "The NCI explains that cancer starts when damaged cells multiply when they should not. They may form a tumor — a lump of tissue — or, in leukemias, build up in the blood without a solid lump. A benign tumor does not invade the way cancer does; a malignant one can grow into nearby tissue.",
    whatP2: "When cancer cells break away and form tumors in another part of the body, the NCI calls that <strong>metastasis</strong>. That fact matters to a doctor and, later on this page, to which insurance product can still issue. The CDC groups many cancer types; basal cell skin cancer, squamous cell, and melanoma are not the same medical conversation.",
    whatP3: "An insurer does not treat cancer. It decides whether the history, as it is written and as it appears in prescriptions already filled, fits a product it is willing to issue. It does not ask for a biopsy at the agency office.",
    howH: "How life insurance reviews a health history",
    howP1: "On final expense the usual path is not an office exam. There is a short questionnaire and, on most products we quote, a review of prescriptions. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "If those questions can be answered without hitting what that product cannot issue, the plan is usually level: the full amount can apply to a covered natural death from the first payment. If it cannot issue that way, some products pay less or return premiums in the first years. If even that cannot issue, a guaranteed-acceptance plan asks no health questions and waits about two years for natural death.",
    howP3: "Term life at larger amounts is a different product: sometimes there are labs or a visit to take vitals. A cancer history often narrows that path. If the need is income or a mortgage, not burial, see <a href=\"" + L.termCond + "\">term life with pre-existing conditions</a>.",
    pathsH: "Three kinds of plans, compared",
    vsH: "How the three kinds of plans compare",
    vsCol1: "Pays in full",
    vsCol1Sub: "Level plan, with questions",
    vsCol2: "Pays less at first",
    vsCol2Sub: "Still has questions",
    vsCol3: "No questions",
    vsCol3Sub: "Guaranteed acceptance",
    vsR1H: "Health questions?",
    vsR1A: "Yes. You have to qualify.",
    vsR1B: "Yes. The answers do not qualify for the plan that pays in full.",
    vsR1C: "None.",
    vsR2H: "Natural death in year one",
    vsR2A: "Can pay the full amount.",
    vsR2B: "Pays a portion or returns premiums, per the contract.",
    vsR2C: "Returns premiums plus contract interest. Does not pay the full amount.",
    vsR3H: "If treatment finished some time ago",
    vsR3A: "Often the first try, if the type and dates fit.",
    vsR3B: "Some products use this path when the history is more recent.",
    vsR3C: "Held for when the questionnaire cannot issue — including during treatment now.",
    vsR4H: "Price, in plain terms",
    vsR4A: "Usually the lowest per dollar of these three, if you qualify.",
    vsR4B: "It varies. We will not invent a sample premium here.",
    vsR4C: "Usually costs more per dollar, at the same age and amount.",
    vsLearn: "This chart teaches the difference among the three paths. It is not a quote. Cancer type, dates, and prescriptions can still change the column.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. Ads that combine both almost always still have a questionnaire.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage when treatment is no longer active: it can open more coverage, a lower price, and a full benefit from the first covered payment. The limitation is that the same questionnaire can send you to a wait or to guaranteed acceptance if treatment is still going, if the cancer came back, if it spread, or if there is more than one cancer. Waiting to “look healthier” raises the age. Skipping an oncology pill does not erase prescriptions already filled.",
    split1H: "Usually still a plan with questions",
    split1a: "Basal cell skin cancer, with no other internal cancer.",
    split1b: "One cancer, no spread to another part of the body, and no treatment for the time that product asks.",
    split1c: "Surgery-only treatment years ago, with no current oncology prescriptions — confirmed with dates, not a headline.",
    split2H: "Usually changes the conversation",
    split2a: "Chemotherapy, radiation, immunotherapy, or other active treatment now.",
    split2b: "Cancer that spread, that came back, or more than one different cancer.",
    split2c: "Leukemia, lymphoma, or childhood cancer on a minor. That is not “an old mole.”",
    factorsH: "What can change a cancer application",
    factorsP: "Each card starts with the health idea. The right side lists only what we can state for the burial products we quote. If companies do not agree, we say so.",
    factorsNote: "These notes are not a quote. Age, height and weight, and a second diagnosis can still change the result.",
    fMeaning: "In plain language",
    fVerify: "What we can state",
    f1c: "The type of cancer",
    f1w: "The CDC separates basal cell skin cancer, squamous cell, and melanoma. The NCI treats melanoma as a cancer that starts in pigment cells, not as a simple mole.",
    f1items: [
      "On Transamerica Immediate Solution, basal cell carcinoma is not in the same row as the other cancers.",
      "Melanoma and internal cancers are reviewed under cancer rules, not as “just skin.”",
    ],
    f1gap: "We will not say “every burial application ignores basal and squamous.” On the Transamerica product we quote, the published exception is basal cell, not a national skin-cancer list.",
    f2c: "Treatment now",
    f2w: "The NCI describes surgery, medicines, radiation, and other treatments. For insurance, “now” usually means there are still prescriptions or treatment visits.",
    f2items: [
      "On the burial companies we quote, active treatment usually stops the health-question plan that pays in full.",
      "If age is 50 to 80, the guaranteed-acceptance plan we quote may still be open. It does not ask the cancer type. In return it waits about two years for natural death.",
    ],
    f2gap: "We will not claim that current early-stage cancer still opens, at our appointed companies, a full benefit from the first payment. We do not have that table verified for the products we quote.",
    f3c: "How long since the last treatment",
    f3w: "A doctor talks about remission when there are no signs of disease. Insurance asks for dates: diagnosis, last treatment, and whether it came back.",
    f3items: [
      "On Transamerica Immediate Solution, a cancer that is not basal: onset in the last two years cannot issue that product. Cancer-free and no treatment in the last two years can still leave a health-question plan that pays in full, if that is the only listed history.",
      "Living Promise lists cancer among impairments that may adjust or not issue. We will not claim Living Promise uses the same two-year window.",
    ],
    f3gap: "Companies do not share one month count. We will not pick one number for every product. We also will not apply a different Transamerica product’s timeline chart to Living Promise or Accendo.",
    f4c: "If it spread or came back",
    f4w: "The NCI calls metastasis cancer that travels to another part of the body. Recurrence is when it returns after a time without disease.",
    f4items: [
      "On Transamerica Immediate Solution, metastatic, recurrent, multiple cancers, or spread to lymph nodes cannot issue that product.",
      "Living Promise lists metastatic or recurrent cancer among impairments that may adjust or not issue.",
    ],
    f4gap: "We will not say “some U.S. companies still pay in full after metastasis if 24 months have passed.” That is not verified on the products we quote.",
    f5c: "Pills after cancer",
    f5w: "Some pills are used to lower the chance the cancer will return. A doctor may call them treatment or prevention. The insurer sees them in prescriptions already filled.",
    f5items: [
      "List the names. Do not skip a pill “because I no longer have cancer.”",
      "On Accendo, several medicines used for cancer stop that application from being completed. On Living Promise, some also stop issue; others ask for the reason on the application.",
    ],
    f5gap: "We do not publish a public pill-by-pill list. We will not guess what each prescription is for. If it is not in what we have verified, we will say so at quote time instead of inventing a yes.",
    f6c: "Leukemia, lymphoma, and cancer in a minor",
    f6w: "The NCI describes leukemia as a blood cancer and lymphoma as a cancer of immune cells. They are not a mole.",
    f6items: [
      "On Transamerica Immediate Solution, Hodgkin and lymphoma are reviewed as cancer. Cancer in a minor cannot issue that burial product for juveniles.",
      "On Americo Eagle Select, leukemia is among the situations that stop that product from issuing.",
    ],
    f7c: "A second diagnosis",
    f7w: "Cancer can stand alone. It can also come with a hospital stay, hospice, or another damaged organ.",
    f7items: [
      "Being in the hospital now, hospice, or pending surgery with general anesthesia usually closes the health-question plan on the products we quote.",
      "A bone-marrow transplant cannot issue on Transamerica Immediate Solution.",
    ],
    costH: "Sample monthly prices if a health-question plan issues",
    costP: "These figures are illustrative monthly premiums, non-tobacco, for a final expense plan that can pay in full if the questionnaire issues. Read them as the size of the product by age and sex — not as the “price of having cancer.” If active treatment sends you to guaranteed acceptance, this table does not apply.",
    costLearn: "What you should learn from this table: at the same coverage amount, the monthly price rises with age, and men usually pay more than women. Tobacco (not shown here) raises it again. Some amounts are scaled from a published band. This is not an offer.",
    costFoot: "A guaranteed-acceptance plan, at the same age and amount, usually costs more and waits about two years for natural death. Use that table if the questionnaire cannot issue.",
    coH: "Companies we can quote",
    coP: "After you understand the three paths, these are appointed companies Mejor Vida Insurance can quote. With cancer, they do not all issue the same kind of plan. Ages and amounts vary. Approval is not guaranteed.",
    faq1q: "I am on chemotherapy. Can I buy final expense?",
    faq1a: "There can still be a product. At the companies we quote, the usual path with active treatment is guaranteed acceptance from ages 50 to 80, not the plan that pays in full from the first payment. There is about a two-year wait for natural death. A covered accident can pay sooner, according to the contract.",
    faq2q: "I finished treatment three years ago. Is there a wait?",
    faq2a: "On one product we quote, cancer-free and off treatment for two years can still leave a plan that pays in full if the rest of the questionnaire qualifies. Other companies have their own windows. Quote with the real date. It is not a promise.",
    faq3q: "Does skin cancer send me to the no-questions plan?",
    faq3a: "Many basals do not. Melanoma is reviewed under cancer rules, not as a simple mole. Squamous cell is not the same exception on every product we quote. Say the exact words on the diagnosis.",
    faq4q: "Should I wait for remission to apply?",
    faq4a: "If you want the plan that pays in full, you sometimes have to wait out that product’s window. If you need something now, guaranteed acceptance can issue within ages 50–80 without those questions. Waiting also raises age and premium.",
    faq5q: "Does this insurance pay for cancer treatment?",
    faq5a: "No. This is life insurance: a check to the beneficiaries when you die. It is not a health plan. Some appointed products can pay a portion early if a doctor certifies a terminal illness, with rules and a cap; that does not replace treatment.",
    faq6q: "I had two different cancers. What happens?",
    faq6a: "On Transamerica Immediate Solution, multiple cancers cannot issue that product. Then we look at guaranteed acceptance if you qualify by age. Do not send the health-question plan blindly.",
    faq7q: "I still take a “prevention only” pill. Does that close the plan?",
    faq7a: "It depends on the pill and the company. At some, certain cancer medicines stop the application from being completed. At others they ask for the reason. List the name. We will not guess it from a headline.",
    faq8q: "Is the no-questions plan cheaper at my age?",
    faq8a: "Almost never, at the same age and amount, because the company cannot select by health. Quote the health-question plan first if the dates allow it.",
    nextLead: "See prices, or schedule a call with Mejor Vida Insurance. Mention the cancer type, treatment dates, and pills.",
    nextMore: `If treatment is still going, a guaranteed-acceptance plan may still be open from ages 50 to 80. Index: <a href="${L.hub}">pre-existing conditions</a>.`,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    coFoot: "Educational cards for appointed companies. A plan that pays less or returns premiums in the first years, or a guaranteed-acceptance plan, may add a wait. Not a binding quote.",
  };
}

function cancerMain(lang, page, c) {
  return teachConditionMain(lang, page, c);
}

/* -------------------------------------------------------------------------- */
/* Kidney                                                                      */
/* -------------------------------------------------------------------------- */

function copyKidney(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd" rel="noopener" target="_blank">NIDDK: enfermedad renal crónica</a> — qué es, causas frecuentes y por qué se trata; no es una regla de una aseguradora.'
      : '<a href="https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd" rel="noopener" target="_blank">NIDDK: chronic kidney disease</a> — what it is, common causes, and why it is treated; not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.cdc.gov/kidney-disease/index.html" rel="noopener" target="_blank">CDC: enfermedad renal crónica</a> — diabetes, presión alta y seguimiento; no sustituye el cuestionario de una póliza.'
      : '<a href="https://www.cdc.gov/kidney-disease/index.html" rel="noopener" target="_blank">CDC: chronic kidney disease</a> — diabetes, high blood pressure, and follow-up; it does not replace a policy questionnaire.',
    src4: isEs
      ? '<a href="https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/what-is-kidney-failure" rel="noopener" target="_blank">NIDDK: fallo renal</a> — cuándo la función es muy baja y qué son la diálisis y el trasplante.'
      : '<a href="https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/what-is-kidney-failure" rel="noopener" target="_blank">NIDDK: kidney failure</a> — when function is very low, and what dialysis and transplant are.',
    src5: "",
    src6: "",
  });
  src.src5 = "";
  src.src6 = "";
  if (isEs) {
    return {
      ...b,
      ...src,
      hideJsRateNote: true,
      coWait: "¿Espera de 2 años?",
      coWaitNo: "No, si las preguntas de salud califican",
      coMooProduct: "Living Promise",
      coAetnaProduct: "Accendo Final Expense",
      coTaProduct: "Immediate Solution",
      coAmericoProduct: "Eagle Select",
      coGiProduct: "Vida entera de aceptación garantizada",
      coGiFoot: "Una póliza de aceptación garantizada por asegurado cada 12 meses; el total de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      title: "Seguro de gastos finales con enfermedad renal (2026) | Mejor Vida Seguros",
      desc: "La enfermedad renal no es una sola casilla de seguro. Cómo funciona gastos finales, qué cambian la diálisis y el trasplante, y cuándo hay que decir que no lo sabemos.",
      h1: "¿Puede comprar gastos finales si tiene enfermedad renal?",
      lead: "A menudo sí hay un producto, pero no siempre el mismo. El NIDDK describe la <strong>enfermedad renal crónica</strong> como daño en los riñones que se acumula con los años y dificulta filtrar la sangre. El CDC señala la diabetes y la presión alta como causas frecuentes. En un seguro de entierro de monto pequeño, lo que más cambia el camino es si hay <strong>diálisis</strong> — una máquina o un líquido que hace el trabajo de los riñones — o un <strong>trasplante</strong>.",
      crumbEnd: "Riñón",
      take1: "El plan que muchas familias quieren primero es un <strong>plan nivelado</strong>: una póliza con un cuestionario corto de salud que puede pagar el monto completo desde el primer pago cubierto, casi siempre sin espera de dos años.",
      take2: "Sin diálisis ni trasplante, ese plan con preguntas a menudo sigue siendo el primer intento. Con diálisis o un trasplante, las compañías que cotizamos no coinciden. No inventamos un “sí” nacional.",
      take3: "La etapa que le dijo el médico importa para su salud. El seguro pregunta hechos: diálisis, lista de trasplante, diabetes y recetas. No adivinamos la etapa.",
      callout: "No compre un plan de <strong>aceptación garantizada</strong> — sin preguntas de salud y con unos dos años de espera por muerte natural — solo porque oyó “riñón.” Si no hay diálisis, cotice primero el plan con preguntas. Diga etapa, diálisis, trasplante y diabetes.",
      needH: "La preocupación real",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. Gastos finales es vida permanente de monto pequeño, pensada para esa factura — no paga las sesiones de diálisis ni sustituye una póliza grande de ingresos.",
      needP2: "Un diagnóstico que usted ya tiene se llama a menudo <strong>condición preexistente</strong>. Esa etiqueta no significa, por sí sola, una espera de dos años. El miedo suele ser: “Con el riñón, ¿solo me venden un plan que espera?” El resto de la página explica esa diferencia <strong>antes</strong> de nombrar compañías.",
      whatH: "Qué significa la enfermedad renal para su salud",
      whatP1: "El NIDDK explica que los riñones filtran desechos y líquido extra de la sangre. Cuando están dañados y no filtran como deberían, se llama enfermedad renal crónica. A menudo no se siente al inicio. Por eso el médico usa análisis de sangre y orina.",
      whatP2: "El NIDDK llama fallo renal cuando la función baja mucho — por debajo de un 15 por ciento de lo normal, en su material público. Entonces el tratamiento puede ser diálisis, un riñón de donante, o cuidado sin esas dos opciones. La diálisis no “cura” el riñón; reemplaza parte de su trabajo.",
      whatP3: "Una aseguradora no trata el riñón. Decide si el historial, como queda escrito y como aparece en las recetas ya surtidas, cabe en un producto que está dispuesta a emitir. No le pide un análisis de laboratorio en el consultorio de la agencia.",
      howH: "Cómo mira el seguro de vida un historial de salud",
      howP1: "En gastos finales el camino habitual no es un examen en el consultorio. Hay un cuestionario corto y, en la mayoría de los productos que cotizamos, una revisión de recetas. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega un reclamo.",
      howP2: "Si esas preguntas se pueden contestar sin chocar con lo que ese producto no puede emitir, el plan suele ser el nivelado: el monto completo puede aplicar a una muerte natural cubierta desde el primer pago. Si no puede emitir así, algunos productos pagan menos o devuelven primas en los primeros años. Si tampoco puede emitir, un plan de aceptación garantizada no hace preguntas de salud y espera unos dos años por muerte natural.",
      howP3: "El seguro temporal con montos más altos es otro producto: a veces hay laboratorios. Un riñón avanzado suele estrechar ese camino. Si la necesidad es ingreso o hipoteca, no entierro, vea <a href=\"" + L.termCond + "\">temporal con condiciones previas</a>.",
      pathsH: "Tres tipos de plan, comparados",
      vsH: "Cómo se comparan los tres tipos de plan",
      vsCol1: "Paga completo",
      vsCol1Sub: "Plan nivelado, con preguntas",
      vsCol2: "Paga menos al inicio",
      vsCol2Sub: "Todavía hay preguntas",
      vsCol3: "Sin preguntas",
      vsCol3Sub: "Aceptación garantizada",
      vsR1H: "¿Hay preguntas de salud?",
      vsR1A: "Sí. Hay que calificar.",
      vsR1B: "Sí. Las respuestas no califican al plan que paga completo.",
      vsR1C: "No.",
      vsR2H: "Muerte natural en el primer año",
      vsR2A: "Puede pagar el monto completo.",
      vsR2B: "Paga una parte o devuelve primas, según el contrato.",
      vsR2C: "Devuelve primas con el interés del contrato. No paga el monto completo.",
      vsR3H: "Si hay enfermedad renal sin diálisis",
      vsR3A: "A menudo el primer intento, si el resto del historial cabe.",
      vsR3B: "Algunos productos usan este camino cuando el historial es más pesado.",
      vsR3C: "Reserva para cuando el cuestionario no puede emitir — incluso con diálisis o trasplante.",
      vsR4H: "Precio, en términos generales",
      vsR4A: "Suele ser el más bajo por dólar de estos tres, si califica.",
      vsR4B: "Varía. No inventamos una prima de muestra aquí.",
      vsR4C: "Suele costar más por dólar, a la misma edad y monto.",
      vsLearn: "Esta tabla enseña la diferencia entre los tres caminos. No es una cotización. Diálisis, trasplante y diabetes todavía pueden cambiar la columna.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Los anuncios que mezclan las dos cosas casi siempre siguen teniendo cuestionario.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja cuando no hay diálisis ni trasplante: puede abrir más monto, un precio más bajo y el beneficio completo desde el primer pago cubierto. El límite es que el mismo cuestionario puede mandarlo a una espera o a aceptación garantizada si hay diálisis, un órgano de donante, o diabetes con daño listado. Esperar a “verse más sano” sube la edad. Omitir la diálisis no borra las recetas ni las bases que la compañía ya puede ver.",
      split1H: "Suele seguir siendo un plan con preguntas",
      split1a: "Enfermedad renal crónica sin diálisis y sin trasplante, si el resto del cuestionario califica.",
      split1b: "Presión alta o diabetes junto con el riñón, si no hay diálisis, internación reciente ni otro daño listado. Vea también <a href=\"" + L.hbp + "\">presión alta</a> y <a href=\"" + L.diabetes + "\">diabetes</a>.",
      split1c: "Una creatinina alta, sola, no es el mismo archivo que tres sesiones de diálisis por semana. Precise ambos hechos.",
      split2H: "Suele cambiar la conversación",
      split2a: "Diálisis ahora — en centro o en casa.",
      split2b: "Un riñón o médula de donante, o estar a la espera de esa cirugía.",
      split2c: "Diabetes con daño de riñón más internaciones o amputación. Ya no es “solo riñón.”",
      factorsH: "Qué puede cambiar una solicitud con enfermedad renal",
      factorsP: "Cada tarjeta empieza con la idea de salud. A la derecha va solo lo que podemos afirmar para los productos de entierro que cotizamos. Si las compañías no coinciden, lo decimos.",
      factorsNote: "Estas notas no son una cotización. Edad, peso y un segundo diagnóstico todavía pueden cambiar el resultado.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Lo que podemos afirmar",
      f1c: "Enfermedad renal crónica sin diálisis",
      f1w: "El NIDDK describe etapas. Una etapa temprana a menudo se trata con presión, azúcar, dieta y pastillas — no con una máquina.",
      f1items: [
        "En Transamerica Immediate Solution, la enfermedad renal crónica todavía puede dejar un plan con preguntas que paga completo si es el único historial listado.",
        "Living Promise lista la enfermedad renal crónica y la insuficiencia renal entre los padecimientos que pueden ajustar o no emitir. No afirmamos que Living Promise siempre deje el plan que paga completo.",
      ],
      f1gap: "No tenemos una tabla pública de entierro que convierta “etapa 2” o “etapa 3” en un sí o un no para todas las compañías. No vamos a inventar ese corte. Diga la etapa si la conoce, y las recetas.",
      f2c: "Diálisis",
      f2w: "El NIDDK describe la diálisis como un tratamiento cuando los riñones ya no pueden hacer su trabajo. Puede ser en un centro o en casa.",
      f2items: [
        "En Transamerica Immediate Solution, la diálisis se mira de forma parecida a la enfermedad renal crónica: todavía puede quedar un plan con preguntas que paga completo si es el único historial listado. Eso no es una emisión automática. El resto de la solicitud sigue contando.",
        "En el producto de aceptación garantizada que cotizamos, no hay preguntas de riñón. A cambio espera unos dos años por muerte natural, entre los 50 y los 80 años.",
      ],
      f2gap: "No vamos a decir que “solo dos compañías en el país cubren diálisis sin espera.” Tampoco agrupamos a Americo con las demás: su lista publicada de situaciones que impiden emitir Eagle Select nombra el trasplante, no la diálisis. Combinaciones todavía pueden cerrar ese producto. Tampoco afirmamos un sí o un no de Accendo por diálisis sola. Cotice con los hechos reales.",
      f3c: "Trasplante",
      f3w: "El NIDDK describe el trasplante como una forma de reemplazar la función renal. Puede ser un riñón de donante. La médula ósea es otro tipo de trasplante.",
      f3items: [
        "En Transamerica Immediate Solution, un trasplante de órgano o de células madre no puede emitir ese producto. Lo mismo aplica a un trasplante de médula.",
        "En Americo Eagle Select, un trasplante de órgano o tejido está entre las situaciones que impiden emitir ese producto.",
        "En Accendo, varios medicamentos usados después de un trasplante impiden completar esa solicitud.",
      ],
      f3gap: "No vamos a inventar una ventana de “cinco años después del trasplante.” Estar en lista no es lo mismo que ya tener el órgano; cuéntenos ambos. Una cirugía pendiente con anestesia general suele cerrar el plan con preguntas en los productos que cotizamos.",
      f4c: "Diabetes o presión alta juntas",
      f4w: "El CDC nombra la diabetes y la presión alta como causas frecuentes de enfermedad renal. El NIDDK también.",
      f4items: [
        "Si hay las tres, el archivo ya no es “solo riñón.” Use también las guías de <a href=\"" + L.diabetes + "\">diabetes</a> y <a href=\"" + L.hbp + "\">presión alta</a>.",
        "Living Promise lista la diabetes con daño de riñón entre los padecimientos que pueden ajustar o no emitir.",
      ],
      f5c: "Pastillas para el líquido o el riñón",
      f5w: "Algunas pastillas sacan líquido extra. El médico las receta por el corazón, el hígado o el riñón. La aseguradora las ve en las recetas ya surtidas.",
      f5items: [
        "Liste los nombres. No las omita “porque son para los pies hinchados.”",
        "En Accendo, algunos de esos medicamentos, cuando el motivo listado es hígado o riñón, cambian qué plan de esa solicitud sigue abierto.",
      ],
      f5gap: "No publicamos una lista pública de cada pastilla. No adivinamos para qué se la recetaron.",
      f6c: "Enfermedad terminal o internación",
      f6w: "El NIDDK habla de fallo renal como una etapa grave. El seguro pregunta hospicio, internación ahora y, a veces, si un médico espera un desenlace cercano.",
      f6items: [
        "Estar internado ahora, hospicio, o una cirugía pendiente con anestesia general suele cerrar el plan con preguntas en los productos que cotizamos.",
        "En Accendo, una enfermedad terminal o de etapa final está entre las situaciones que impiden completar esa solicitud.",
      ],
      costH: "Precios mensuales de muestra si emite un plan con preguntas",
      costP: "Estas cifras son primas mensuales ilustrativas, no fumador, para un plan de gastos finales que puede pagar completo si el cuestionario emite. Léalas como el tamaño del producto por edad y sexo — no como el “precio de tener riñón.” Si hay diálisis o trasplante, no asuma estas filas.",
      costLearn: "Qué debe aprender de esta tabla: a la misma cobertura, el mes sube con la edad, y los hombres suelen pagar más que las mujeres. El tabaco (no mostrado aquí) sube otra vez. Algunos montos se calculan a partir de una banda publicada. No es una oferta.",
      costFoot: "Un plan de aceptación garantizada, a la misma edad y monto, suele costar más y espera unos dos años por muerte natural. Use esa tabla si el cuestionario no puede emitir.",
      coH: "Compañías que podemos cotizar",
      coP: "Después de entender los tres caminos, estas son compañías designadas que Mejor Vida Seguros puede cotizar. Con enfermedad renal, no todas emiten el mismo tipo de plan. Edades y montos cambian. La aprobación no está garantizada.",
      faq1q: "Estoy en diálisis. ¿Puedo tener el monto completo desde el primer pago?",
      faq1a: "En un producto que cotizamos, la diálisis todavía puede dejar un plan con preguntas que paga completo si es el único historial listado — no es automático. En otros, el camino habitual es aceptación garantizada entre los 50 y los 80 años, con espera de unos dos años por muerte natural. Cotice los dos caminos. No afirmamos un “sí” nacional.",
      faq2q: "Tengo etapa 3, sin diálisis. ¿Hay espera?",
      faq2a: "A menudo el primer intento sigue siendo el plan con preguntas, si el resto del cuestionario califica. No tenemos un corte público de “etapa 3” para todas las compañías. No invente una etapa más baja. Diga la etapa y las recetas.",
      faq3q: "Me recomendaron un trasplante. ¿Qué producto?",
      faq3a: "Un trasplante de órgano no puede emitir en algunos productos que cotizamos. Estar en lista y ya tener el órgano no son el mismo hecho. Cuéntenos ambos. Si el cuestionario no puede emitir, la aceptación garantizada puede seguir abierta entre los 50 y los 80.",
      faq4q: "La causa es diabetes. ¿Se cotiza peor?",
      faq4a: "El archivo deja de ser un solo factor. Diga ambas. No prometemos un precio extra con el nombre “riñón más diabetes.”",
      faq5q: "¿Este seguro paga la diálisis?",
      faq5a: "No. Es vida: un cheque a los beneficiarios cuando usted fallece. El tratamiento lo cubren Medicare y el plan de salud, no esta póliza.",
      faq6q: "Tengo más de 80 años y estoy en diálisis. ¿Hay un plan sin preguntas?",
      faq6a: "El plan de aceptación garantizada que cotizamos emite de 50 a 80, de $5,000 a $25,000. Después de 80 no hay un “sí automático” sin cuestionario en lo que cotizamos.",
      faq7q: "Solo me subió la creatinina. ¿Es lo mismo que diálisis?",
      faq7a: "No. Un número en el laboratorio no es el mismo archivo que una máquina tres veces por semana. Precise ambos.",
      faq8q: "¿El plan sin preguntas es más barato a mi edad?",
      faq8a: "Casi nunca, a la misma edad y monto, porque la compañía no selecciona por salud. Cotice primero el plan con preguntas si las fechas y el tratamiento lo permiten.",
      nextLead: "Vea precios, o programe una llamada con Mejor Vida Seguros. Mencione etapa, diálisis, trasplante y si hay diabetes.",
      nextMore: `Si hay diálisis o trasplante, el plan de aceptación garantizada puede seguir abierto entre los 50 y los 80 años. Índice: <a href="${L.hub}">condiciones preexistentes</a>.`,
      nextSecondary: "Programar una llamada",
      nextSecondaryHref: L.schedule,
      coFoot: "Fichas educativas de compañías designadas. Un plan que paga menos o devuelve primas en los primeros años, o un plan de aceptación garantizada, puede añadir una espera. No es cotización vinculante.",
    };
  }
  return {
    ...b,
    ...src,
    hideJsRateNote: true,
    coWait: "2-year wait?",
    coWaitNo: "No, if the health questions qualify",
    coMooProduct: "Living Promise",
    coAetnaProduct: "Accendo Final Expense",
    coTaProduct: "Immediate Solution",
    coAmericoProduct: "Eagle Select",
    coGiProduct: "Guaranteed-acceptance whole life",
    coGiFoot: "One guaranteed-acceptance policy per insured every 12 months; that company’s total does not exceed $25,000. Educational — not a binding quote.",
    title: "Final expense insurance with kidney disease (2026) | Mejor Vida Insurance",
    desc: "Kidney disease is not one insurance checkbox. How final expense works, what dialysis and transplant change, and when we will say we do not know.",
    h1: "Can you buy final expense insurance if you have kidney disease?",
    lead: "Often there is a product, but not always the same one. The NIDDK describes <strong>chronic kidney disease</strong> as kidney damage that builds over years and makes it harder to filter blood. The CDC names diabetes and high blood pressure as common causes. On a small burial-size life policy, what most often changes the path is whether there is <strong>dialysis</strong> — a machine or fluid that does the kidneys’ job — or a <strong>transplant</strong>.",
    crumbEnd: "Kidney disease",
    take1: "The plan many families want first is a <strong>level plan</strong>: a policy with a short health questionnaire that can pay the full amount from the first covered payment, usually with no two-year wait.",
    take2: "Without dialysis or a transplant, that health-question plan is often still the first try. With dialysis or a transplant, the companies we quote do not all agree. We will not invent a national yes.",
    take3: "The stage your doctor named matters for your health. Insurance asks for facts: dialysis, a transplant list, diabetes, and prescriptions. We will not guess the stage.",
    callout: "Do not buy a <strong>guaranteed-acceptance</strong> plan — no health questions, and about a two-year wait for natural death — just because you heard “kidney.” If there is no dialysis, quote a plan with health questions first. Mention stage, dialysis, transplant, and diabetes.",
    needH: "The worry people actually have",
    needP1: "Families look for this coverage because a funeral, the cemetery, and small debts can fall on relatives. Final expense is permanent life insurance in a small amount, meant for that bill — it does not pay for dialysis sessions and it does not replace a large income policy.",
    needP2: "A diagnosis you already have is often called a <strong>pre-existing condition</strong>. That label does not, by itself, mean a two-year wait. The fear is usually: “With the kidneys, will they only sell me a plan that waits?” The rest of this page explains that difference <strong>before</strong> naming companies.",
    whatH: "What kidney disease means for your health",
    whatP1: "The NIDDK explains that the kidneys filter waste and extra fluid from the blood. When they are damaged and cannot filter as they should, it is called chronic kidney disease. It often is not felt at first. That is why a doctor uses blood and urine tests.",
    whatP2: "The NIDDK calls it kidney failure when function drops very low — below 15 percent of normal, in their public material. Treatment may then be dialysis, a donor kidney, or care without those two options. Dialysis does not “cure” the kidney; it replaces part of its work.",
    whatP3: "An insurer does not treat the kidney. It decides whether the history, as it is written and as it appears in prescriptions already filled, fits a product it is willing to issue. It does not ask for a lab panel at the agency office.",
    howH: "How life insurance reviews a health history",
    howP1: "On final expense the usual path is not an office exam. There is a short questionnaire and, on most products we quote, a review of prescriptions. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "If those questions can be answered without hitting what that product cannot issue, the plan is usually level: the full amount can apply to a covered natural death from the first payment. If it cannot issue that way, some products pay less or return premiums in the first years. If even that cannot issue, a guaranteed-acceptance plan asks no health questions and waits about two years for natural death.",
    howP3: "Term life at larger amounts is a different product: sometimes there are labs. Advanced kidney disease often narrows that path. If the need is income or a mortgage, not burial, see <a href=\"" + L.termCond + "\">term life with pre-existing conditions</a>.",
    pathsH: "Three kinds of plans, compared",
    vsH: "How the three kinds of plans compare",
    vsCol1: "Pays in full",
    vsCol1Sub: "Level plan, with questions",
    vsCol2: "Pays less at first",
    vsCol2Sub: "Still has questions",
    vsCol3: "No questions",
    vsCol3Sub: "Guaranteed acceptance",
    vsR1H: "Health questions?",
    vsR1A: "Yes. You have to qualify.",
    vsR1B: "Yes. The answers do not qualify for the plan that pays in full.",
    vsR1C: "None.",
    vsR2H: "Natural death in year one",
    vsR2A: "Can pay the full amount.",
    vsR2B: "Pays a portion or returns premiums, per the contract.",
    vsR2C: "Returns premiums plus contract interest. Does not pay the full amount.",
    vsR3H: "If there is kidney disease without dialysis",
    vsR3A: "Often the first try, if the rest of the history fits.",
    vsR3B: "Some products use this path when the history is heavier.",
    vsR3C: "Held for when the questionnaire cannot issue — including with dialysis or a transplant.",
    vsR4H: "Price, in plain terms",
    vsR4A: "Usually the lowest per dollar of these three, if you qualify.",
    vsR4B: "It varies. We will not invent a sample premium here.",
    vsR4C: "Usually costs more per dollar, at the same age and amount.",
    vsLearn: "This chart teaches the difference among the three paths. It is not a quote. Dialysis, transplant, and diabetes can still change the column.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. Ads that combine both almost always still have a questionnaire.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage when there is no dialysis and no transplant: it can open more coverage, a lower price, and a full benefit from the first covered payment. The limitation is that the same questionnaire can send you to a wait or to guaranteed acceptance if there is dialysis, a donor organ, or diabetes with listed damage. Waiting to “look healthier” raises the age. Skipping dialysis on the form does not erase prescriptions or records a company can already see.",
    split1H: "Usually still a plan with questions",
    split1a: "Chronic kidney disease with no dialysis and no transplant, if the rest of the questionnaire qualifies.",
    split1b: "High blood pressure or diabetes together with the kidney, if there is no dialysis, no recent hospital stay, and no other listed damage. See also <a href=\"" + L.hbp + "\">high blood pressure</a> and <a href=\"" + L.diabetes + "\">diabetes</a>.",
    split1c: "A high creatinine number, by itself, is not the same file as three dialysis sessions a week. Be precise about both facts.",
    split2H: "Usually changes the conversation",
    split2a: "Dialysis now — in a center or at home.",
    split2b: "A donor kidney or bone marrow, or waiting for that surgery.",
    split2c: "Diabetes with kidney damage plus hospital stays or amputation. That is no longer “kidney only.”",
    factorsH: "What can change a kidney-disease application",
    factorsP: "Each card starts with the health idea. The right side lists only what we can state for the burial products we quote. If companies do not agree, we say so.",
    factorsNote: "These notes are not a quote. Age, height and weight, and a second diagnosis can still change the result.",
    fMeaning: "In plain language",
    fVerify: "What we can state",
    f1c: "Chronic kidney disease without dialysis",
    f1w: "The NIDDK describes stages. An earlier stage is often treated with blood pressure, blood sugar, diet, and pills — not with a machine.",
    f1items: [
      "On Transamerica Immediate Solution, chronic kidney disease can still leave a health-question plan that pays in full if it is the only listed history.",
      "Living Promise lists chronic kidney disease and renal insufficiency or failure among impairments that may adjust or not issue. We will not claim Living Promise always leaves the plan that pays in full.",
    ],
    f1gap: "We do not have a public burial table that turns “stage 2” or “stage 3” into a yes or a no for every company. We will not invent that cutoff. Give the stage if you know it, and the prescriptions.",
    f2c: "Dialysis",
    f2w: "The NIDDK describes dialysis as a treatment when the kidneys can no longer do their job. It can be in a center or at home.",
    f2items: [
      "On Transamerica Immediate Solution, dialysis is reviewed in a similar way to chronic kidney disease: a health-question plan that pays in full can still be open if that is the only listed history. That is not automatic issue. The rest of the application still counts.",
      "On the guaranteed-acceptance plan we quote, there are no kidney questions. In return it waits about two years for natural death, from ages 50 to 80.",
    ],
    f2gap: "We will not say “only two companies in the country cover dialysis with no wait.” We also will not lump Americo with the others: its published list of situations that stop Eagle Select from issuing names a transplant, not dialysis. Combinations can still close that product. We will not state a yes or no for Accendo on dialysis alone. Quote with real facts.",
    f3c: "Transplant",
    f3w: "The NIDDK describes a transplant as one way to replace kidney function. It can be a donor kidney. Bone marrow is a different kind of transplant.",
    f3items: [
      "On Transamerica Immediate Solution, an organ or stem-cell transplant cannot issue that product. The same is true of a bone-marrow transplant.",
      "On Americo Eagle Select, an organ or tissue transplant is among the situations that stop that product from issuing.",
      "On Accendo, several medicines used after a transplant stop that application from being completed.",
    ],
    f3gap: "We will not invent a “five years after transplant” window. Being on a list is not the same as already having the organ; tell us both. Pending surgery with general anesthesia usually closes the health-question plan on the products we quote.",
    f4c: "Diabetes or high blood pressure together",
    f4w: "The CDC names diabetes and high blood pressure as common causes of kidney disease. The NIDDK does too.",
    f4items: [
      "If all three are present, the file is no longer “kidney only.” Use the <a href=\"" + L.diabetes + "\">diabetes</a> and <a href=\"" + L.hbp + "\">high blood pressure</a> guides too.",
      "Living Promise lists diabetes with kidney damage among impairments that may adjust or not issue.",
    ],
    f5c: "Pills for fluid or the kidney",
    f5w: "Some pills pull extra fluid out. A doctor may prescribe them for the heart, the liver, or the kidney. The insurer sees them in prescriptions already filled.",
    f5items: [
      "List the names. Do not skip them “because they are for swollen feet.”",
      "On Accendo, some of those medicines, when the listed reason is liver or kidney, change which plan on that application stays open.",
    ],
    f5gap: "We do not publish a public pill-by-pill list. We will not guess what each prescription is for.",
    f6c: "End-stage disease or a hospital stay",
    f6w: "The NIDDK describes kidney failure as a serious stage. Insurance asks about hospice, being in the hospital now, and, sometimes, whether a doctor expects a near-term outcome.",
    f6items: [
      "Being in the hospital now, hospice, or pending surgery with general anesthesia usually closes the health-question plan on the products we quote.",
      "On Accendo, a terminal or end-stage disease is among the situations that stop that application from being completed.",
    ],
    costH: "Sample monthly prices if a health-question plan issues",
    costP: "These figures are illustrative monthly premiums, non-tobacco, for a final expense plan that can pay in full if the questionnaire issues. Read them as the size of the product by age and sex — not as the “price of having kidney disease.” If there is dialysis or a transplant, do not assume these rows.",
    costLearn: "What you should learn from this table: at the same coverage amount, the monthly price rises with age, and men usually pay more than women. Tobacco (not shown here) raises it again. Some amounts are scaled from a published band. This is not an offer.",
    costFoot: "A guaranteed-acceptance plan, at the same age and amount, usually costs more and waits about two years for natural death. Use that table if the questionnaire cannot issue.",
    coH: "Companies we can quote",
    coP: "After you understand the three paths, these are appointed companies Mejor Vida Insurance can quote. With kidney disease, they do not all issue the same kind of plan. Ages and amounts vary. Approval is not guaranteed.",
    faq1q: "I am on dialysis. Can I get the full amount from the first payment?",
    faq1a: "On one product we quote, dialysis can still leave a health-question plan that pays in full if it is the only listed history — that is not automatic. On others, the usual path is guaranteed acceptance from ages 50 to 80, with about a two-year wait for natural death. Quote both paths. We will not claim a national yes.",
    faq2q: "I have stage 3, no dialysis. Is there a wait?",
    faq2a: "Often the first try is still the health-question plan, if the rest of the questionnaire qualifies. We do not have a public “stage 3” cutoff for every company. Do not invent a lower stage. Give the stage and the prescriptions.",
    faq3q: "They recommended a transplant. Which product?",
    faq3a: "An organ transplant cannot issue on some products we quote. Being on a list and already having the organ are not the same fact. Tell us both. If the questionnaire cannot issue, guaranteed acceptance may still be open from ages 50 to 80.",
    faq4q: "The cause is diabetes. Is it quoted worse?",
    faq4a: "The file is no longer a single factor. Say both. We will not promise an extra charge labeled “kidney plus diabetes.”",
    faq5q: "Does this insurance pay for dialysis?",
    faq5a: "No. This is life insurance: a check to the beneficiaries when you die. Treatment is covered by Medicare and the health plan, not this policy.",
    faq6q: "I am over 80 and on dialysis. Is there a no-questions plan?",
    faq6a: "The guaranteed-acceptance plan we quote issues from ages 50 to 80, $5,000 to $25,000. After 80 there is no automatic yes without a questionnaire on what we quote.",
    faq7q: "My creatinine is just high. Is that the same as dialysis?",
    faq7a: "No. A lab number is not the same file as a machine three times a week. Be precise about both.",
    faq8q: "Is the no-questions plan cheaper at my age?",
    faq8a: "Almost never, at the same age and amount, because the company cannot select by health. Quote the health-question plan first if treatment and dates allow it.",
    nextLead: "See prices, or schedule a call with Mejor Vida Insurance. Mention stage, dialysis, transplant, and whether diabetes is involved.",
    nextMore: `If there is dialysis or a transplant, a guaranteed-acceptance plan may still be open from ages 50 to 80. Index: <a href="${L.hub}">pre-existing conditions</a>.`,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    coFoot: "Educational cards for appointed companies. A plan that pays less or returns premiums in the first years, or a guaranteed-acceptance plan, may add a wait. Not a binding quote.",
  };
}

function kidneyMain(lang, page, c) {
  return teachConditionMain(lang, page, c);
}

/* -------------------------------------------------------------------------- */
/* Disability                                                                  */
/* -------------------------------------------------------------------------- */

function copyDisability(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.ssa.gov/disability/" rel="noopener" target="_blank">Seguro Social: discapacidad</a> — el SSDI/SSI es un programa de ingresos; no es la misma pregunta que un cuestionario de vida.'
      : '<a href="https://www.ssa.gov/disability/" rel="noopener" target="_blank">Social Security: disability</a> — SSDI/SSI is an income program; it is not the same question as a life-insurance questionnaire.',
    src3: isEs
      ? '<a href="https://www.cdc.gov/disability-and-health/index.html" rel="noopener" target="_blank">CDC: discapacidad y salud</a> — la discapacidad es amplia (movilidad, sentido, cognición); el seguro mira hechos concretos, no el cheque.'
      : '<a href="https://www.cdc.gov/disability-and-health/index.html" rel="noopener" target="_blank">CDC: disability and health</a> — disability is broad (mobility, sensory, cognition); insurance looks at concrete facts, not the check.',
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de gastos finales si tiene una discapacidad (2026) | Mejor Vida Seguros",
      desc: "Un cheque del Seguro Social no es un “no” automático. Silla de ruedas, ayuda para bañarse y dónde vive sí cambian el producto en las compañías designadas.",
      h1: "Seguro de gastos finales si tiene una discapacidad",
      lead: "“Discapacidad” en el Seguro Social significa que no puede trabajar por una condición grave y duradera. En gastos finales, esa palabra <strong>no es una casilla de rechazo</strong>. Lo que sí miran las compañías es si usa silla de ruedas por una enfermedad, si necesita ayuda para bañarse o vestirse, o si vive en una residencia o con enfermería en el hogar.",
      crumbEnd: "Discapacidad",
      take1: "Cobrar SSDI o SSI <strong>no equivale</strong> a un “no” en Living Promise o Accendo. El cuestionario pregunta hechos de salud y de cuidado, no si el gobierno le paga un beneficio.",
      take2: "En nuestra lista simplificada, silla de ruedas, scooter o cama <strong>por una enfermedad</strong> (no una lesión breve) suele impedir un plan nivelado: el cuestionario de salud que puede pagar el monto completo desde el primer pago. Un hospital, residencia, hospicio o home health también.",
      take3: "En Transamerica, silla o scooter eléctrico puede ser <strong>Preferred</strong> (su clase de tarifa más favorable) si no necesita asistencia; si hay ayuda de otra persona, se lee como “assisted living” y la internación actual es Decline. Esas dos reglas no son iguales: por eso cotizamos el producto, no un rumor.",
      callout: "Diga por qué usa la silla (artritis, EPOC, un accidente de hace un mes), si alguien le ayuda a bañarse, y dónde vive. Eso decide un plan nivelado o GIWL (sin preguntas de salud, unos dos años de espera por muerte natural).",
      whatH: "Por qué el Seguro Social y el seguro no hablan el mismo idioma",
      whatP1: "La SSA paga un ingreso si cumple sus reglas de trabajo y de gravedad. Una aseguradora de vida pregunta si puede firmar, si hay demencia, si hay oxígeno, si está en cama por enfermedad. Puede cobrar SSDI y aún así calificar a un plan nivelado — o no, si además hay un descalificador.",
      whatP2: "El CDC habla de discapacidad de muchas formas: movilidad, visión, audición, cognición. Una persona sorda o con una pierna protésica por un accidente antiguo no es el mismo archivo que alguien en hospicio.",
      uwH: "Cómo lo miran las compañías designadas",
      uwP: "Living Promise y Accendo tratan la silla por enfermedad y el cuidado en el hogar como problemas graves para el nivelado. Transamerica separa: movilidad con silla puede ser Preferred; cuidado (medicinas, heridas, alimentación) se lee como assisted living — actual, Decline. Parkinson, esclerosis múltiple u otras condiciones neurológicas dependen del producto y de si hay incapacidad mental o cama.",
      uwNote: "Incapacidad mental y Alzheimer están en nuestra lista de “simplificado no emite.” Una discapacidad física con la mente clara es otra conversación.",
      chH: "Qué suele cambiar la respuesta",
      chP: "El cheque del gobierno no. Estos sí.",
      ch1: "Silla, scooter o cama por enfermedad crónica: a menudo GIWL en los simplificados designados. Por una lesión de semanas, dígala; no es el mismo “sí.”",
      ch2: "Ayuda de otra persona para bañarse, vestirse, comer o caminar: se acerca a home health / assisted living. Actual, Decline en Transamerica.",
      ch3: "Residencia de ancianos, hospicio o hospital ahora: descalificador simplificado y Decline en ese gráfico.",
      ch4: "ALS u otra enfermedad de motoneurona: Decline en Transamerica. Parálisis y distrofia muscular en menores también están en las exclusiones juveniles de ese documento; un adulto se cotiza aparte.",
      costH: "Cuánto cuesta un plan nivelado (si califica)",
      costP: "Si puede firmar y el cuestionario de movilidad/cuidado pasa, estas primas niveladas aplican. Si la silla es por enfermedad y el simplificado no emite, el cuadro que importa es GIWL, no este.",
      coH: "Compañías designadas (planes nivelados)",
      coP: "Estas fichas son para quien todavía califica al cuestionario. No fuerce un nivelado si vive en una residencia o necesita cuidado diario; el producto honesto es GIWL (50–80).",
      faq1q: "Cobro SSDI. ¿Me van a rechazar?",
      faq1a: "No por el cheque. Rechazan (o mandan a GIWL) por lo que el cuestionario y las bases encuentran: oxígeno, demencia, residencias, silla por enfermedad, cáncer activo.",
      faq2q: "Uso silla de ruedas por artritis. ¿Hay espera?",
      faq2a: "En Living Promise y Accendo, silla por enfermedad suele impedir el nivelado. En Transamerica, silla sin asistencia puede ser Preferred. Cotice los dos caminos; no asuma el titular de internet.",
      faq3q: "¿Puede un hijo ser dueño si yo no puedo firmar?",
      faq3a: "Si hay incapacidad mental, el simplificado suele no emitir y un poder notarial no sustituye la firma en las compañías que cotizamos. Vea las guías de familia y GIWL.",
      faq4q: "Tengo una prótesis por un accidente de tráfico. ¿Es lo mismo?",
      faq4a: "Transamerica declina amputación que no es por accidente/trauma. Una amputación traumática antigua se describe como accidente, no como diabetes. Sea preciso.",
      faq5q: "¿El seguro de vida paga la discapacidad mes a mes?",
      faq5a: "No. Eso sería un seguro de discapacidad (otro producto). El gastos finales paga un monto a los beneficiarios cuando usted fallece.",
      faq6q: "Vivo en assisted living. ¿Qué producto?",
      faq6a: "En Transamerica, cuidado actual en ese entorno es Decline. En nuestra lista simplificada, residencia y home health también. GIWL (50–80) es el camino habitual.",
      nextLead: "Diga movilidad, quién le ayuda en casa y dónde vive.",
      nextMore: `Cuidado diario o residencia: <a href="${L.gi}">aceptación garantizada</a>.`,
    };
  }
  return {
    ...b,
    ...src,
    title: "Final expense insurance if you have a disability (2026) | Mejor Vida Insurance",
    desc: "A Social Security check is not an automatic “no.” A wheelchair, help with bathing, and where you live do change the product at appointed companies.",
    h1: "Final expense insurance if you have a disability",
    lead: "“Disability” at Social Security means you cannot work because of a serious, lasting condition. On final expense, that word <strong>is not a decline checkbox</strong>. What companies do look at is whether you use a wheelchair from illness, whether you need help bathing or dressing, or whether you live in a facility or have home nursing.",
    crumbEnd: "Disability",
    take1: "Collecting SSDI or SSI <strong>does not equal</strong> a “no” on Living Promise or Accendo. The questionnaire asks health and care facts, not whether the government pays you a benefit.",
    take2: "On our simplified list, a wheelchair, scooter, or being bedridden <strong>from illness</strong> (not a short injury) often blocks a level plan: the health-question plan that can pay the full amount from the first payment. A hospital, nursing home, hospice, or home health does too.",
    take3: "At Transamerica, a wheelchair or electric scooter can be <strong>Preferred</strong> (their better, usually lower, rate class) if you do not need assistance; if someone helps you, it is read as assisted living, and current confinement is Decline. Those two rules are not the same: that is why we quote the product, not a rumor.",
    callout: "Say why you use the chair (arthritis, COPD, a crash a month ago), whether anyone helps you bathe, and where you live. That decides a level plan or GIWL (no health questions, about a two-year wait for natural death).",
    whatH: "Why Social Security and life insurance are not the same conversation",
    whatP1: "SSA pays income if you meet its work and severity rules. A life insurer asks whether you can sign, whether there is dementia, oxygen, or whether you are bedridden from illness. You can collect SSDI and still qualify for a level plan — or not, if a knockout is also present.",
    whatP2: "The CDC talks about disability in many forms: mobility, vision, hearing, cognition. A deaf person or someone with a prosthetic leg from an old accident is not the same file as someone in hospice.",
    uwH: "How appointed companies look at it",
    uwP: "Living Promise and Accendo treat a wheelchair from illness and home health as serious problems for level. Transamerica separates: mobility with a chair can be Preferred; care (medications, wounds, feeding) is read as assisted living — current, Decline. Parkinson’s, MS, or other neurologic conditions depend on the product and on whether there is mental incapacity or being bedridden.",
    uwNote: "Mental incapacity and Alzheimer’s are on our “simplified cannot issue” list. A physical disability with a clear mind is a different conversation.",
    chH: "What usually changes the answer",
    chP: "The government check does not. These do.",
    ch1: "Chair, scooter, or bedridden from chronic illness: often GIWL at appointed simplified plans. From a weeks-long injury, say so; it is not the same “yes.”",
    ch2: "Help from another person to bathe, dress, eat, or walk: that is close to home health / assisted living. Current, Decline at Transamerica.",
    ch3: "Nursing home, hospice, or hospital now: a simplified knockout and Decline on that chart.",
    ch4: "ALS or other motor-neuron disease: Decline at Transamerica. Paralysis and muscular dystrophy on juveniles are also in that document’s juvenile exclusions; an adult is quoted separately.",
    costH: "What a level plan costs (if you qualify)",
    costP: "If you can sign and the mobility/care questions pass, these level premiums apply. If the chair is from illness and simplified issue cannot issue, the chart that matters is GIWL, not this one.",
    coH: "Appointed companies (level plans)",
    coP: "These cards are for someone who still clears the questionnaire. Do not force a level plan if you live in a facility or need daily care; the honest product is GIWL (ages 50–80).",
    faq1q: "I collect SSDI. Will they decline me?",
    faq1a: "Not for the check. They decline (or send you to GIWL) for what the questionnaire and databases find: oxygen, dementia, a facility, a wheelchair from illness, active cancer.",
    faq2q: "I use a wheelchair for arthritis. Is there a wait?",
    faq2a: "At Living Promise and Accendo, a chair from illness often blocks level. At Transamerica, a chair without assistance can be Preferred. Quote both paths; do not assume the internet headline.",
    faq3q: "Can a child own the policy if I cannot sign?",
    faq3a: "If there is mental incapacity, simplified issue usually cannot issue, and a power of attorney does not replace the signature at the companies we quote. See the family guides and GIWL.",
    faq4q: "I have a prosthesis from a car accident. Is that the same?",
    faq4a: "Transamerica declines amputation that is not from accident/trauma. An old traumatic amputation is described as an accident, not as diabetes. Be precise.",
    faq5q: "Does life insurance pay a monthly disability benefit?",
    faq5a: "No. That would be disability insurance (a different product). Final expense pays a lump sum to the beneficiaries when you die.",
    faq6q: "I live in assisted living. Which product?",
    faq6a: "At Transamerica, current care in that setting is Decline. On our simplified list, a facility and home health are too. GIWL (ages 50–80) is the usual path.",
    nextLead: "Tell us about mobility, who helps at home, and where you live.",
    nextMore: `Daily care or a facility: <a href="${L.gi}">guaranteed acceptance</a>.`,
  };
}

function disabilityMain(lang, page, c) {
  return condPageMain(lang, page, c, {});
}

/* -------------------------------------------------------------------------- */
/* HIV                                                                         */
/* -------------------------------------------------------------------------- */

function copyHiv(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.cdc.gov/hiv/about/index.html" rel="noopener" target="_blank">CDC: VIH</a> — el VIH es un virus; con tratamiento muchas personas viven años. Eso no cambia las preguntas de un producto de gastos finales.'
      : '<a href="https://www.cdc.gov/hiv/about/index.html" rel="noopener" target="_blank">CDC: HIV</a> — HIV is a virus; with treatment many people live for years. That does not change the questions on a final-expense product.',
    src3: isEs
      ? '<a href="https://www.hiv.gov/hiv-basics" rel="noopener" target="_blank">HIV.gov</a> — conceptos básicos de VIH y SIDA; no sustituye las reglas de una aseguradora designada.'
      : '<a href="https://www.hiv.gov/hiv-basics" rel="noopener" target="_blank">HIV.gov</a> — HIV and AIDS basics; it does not replace an appointed insurer’s rules.',
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de gastos finales con VIH: aceptación garantizada (2026) | Mejor Vida Seguros",
      desc: "En las compañías designadas de emisión simplificada, VIH o SIDA suele ser declinación. El camino habitual es Corebridge GIWL: edades 50–80, $5,000–$25,000, espera de dos años.",
      h1: "Seguro de gastos finales si vive con VIH",
      lead: "El CDC explica que el VIH es un virus que ataca el sistema inmune; con tratamiento muchas personas viven una vida larga. En los productos de gastos finales que cotizamos, esa mejora médica <strong>no abre el cuestionario simplificado</strong> (preguntas de salud, no examen en el consultorio). Un diagnóstico de VIH o SIDA suele ser declinación en Living Promise, Accendo, Americo y en el gráfico de Transamerica. El camino que sí cotizamos es <strong>aceptación garantizada</strong>: sin preguntas de salud, con unos dos años de espera por muerte natural.",
      crumbEnd: "VIH",
      take1: "Transamerica lista SIDA/VIH/ARC como <strong>Decline</strong> en el gráfico de un solo padecimiento. Nuestra lista de descalificadores simplificados incluye VIH o SIDA.",
      take2: "Corebridge GIWL no hace preguntas de salud. Edades <strong>50–80</strong>, montos <strong>$5,000–$25,000</strong>. Siempre hay espera de dos años por muerte natural: 110% de las primas pagadas. Un accidente cubierto puede pagar el monto desde el inicio.",
      take3: "No cotizamos un “plan gradual especial para VIH” de compañías con las que no trabajamos. No afirmamos que exista un nivelado designado para este diagnóstico.",
      callout: "Si tiene 50 a 80 años, GIWL es el producto a cotizar. Si tiene menos de 50 o más de 80, dígannoslo: no hay un “sí automático” de GIWL fuera de esa edad en lo que ofrecemos.",
      whatH: "Qué pregunta el seguro — y qué no",
      whatP1: "HIV.gov y el CDC describen el VIH y el SIDA como etapas de la misma infección. El tratamiento (antivirales) puede bajar la carga viral. El cuestionario simplificado de las compañías designadas no ofrece una casilla de “carga indetectable = nivelado.” Pregunta si hay diagnóstico. Un “sí” suele cerrar ese producto.",
      whatP2: "GIWL no pregunta el diagnóstico. Por eso puede emitir. A cambio no selecciona por salud y cobra más por dólar, con espera por muerte no accidental.",
      uwH: "Por qué el simplificado no es el primer producto",
      uwP: "Living Promise, Accendo Level y Americo Eagle Select usan preguntas y bases de recetas. Los antivirales de VIH aparecen. Transamerica escribe Decline para AIDS/HIV/ARC. No enviamos esas solicitudes para “ver qué pasa” cuando el gráfico ya dice que no.",
      uwNote: "Cualquier anuncio de “sin examen y beneficio inmediato” con VIH casi siempre o bien tiene preguntas que usted no puede pasar, o bien no es un producto que cotizamos.",
      chH: "Qué más hay que saber",
      chP: "El VIH no es el único factor si hay otras condiciones de la lista de GIWL.",
      ch1: "Edad: GIWL designada es 50–80. Fuera de ese rango no hay emisión GIWL en lo que cotizamos.",
      ch2: "Monto: tope $25,000; una póliza GIWL por asegurado cada 12 meses en esa compañía.",
      ch3: "Otras condiciones (demencia, hospicio, enfermedad terminal) no cambian GIWL: no hay preguntas. Siguen las reglas de edad, monto y estado del producto.",
      ch4: "El tabaco no cambia la prima de GIWL. Edad, sexo y monto sí.",
      costH: "Cuánto cuesta GIWL (la salud no cambia esta prima)",
      costP: "Estas primas mensuales ilustrativas son Corebridge GIWL, el producto de aceptación garantizada que Mejor Vida Seguros cotiza. Incluyen la cuota de la póliza. Hay espera de dos años por muerte natural. No es una oferta.",
      coH: "Producto designado para este diagnóstico",
      coP: "No publicamos un plan nivelado designado para VIH. La ficha de abajo es GIWL. Las fichas de Living Promise o Accendo de otras páginas de esta sección no aplican a este diagnóstico.",
      faq1q: "¿Me pueden negar GIWL por VIH?",
      faq1a: "No por el historial médico, si está en la edad y el monto del producto. Todavía hay que cumplir identidad, pago y dónde está archivado el producto.",
      faq2q: "¿Hay espera?",
      faq2a: "Sí. Dos años por muerte no accidental. En GIWL, en esa espera la familia recibe el 110% de las primas pagadas, no los $10,000 o $25,000. Un accidente cubierto puede pagar el monto.",
      faq3q: "Mi carga viral es indetectable. ¿Eso abre Living Promise?",
      faq3a: "No en las reglas que cotizamos. El gráfico de Transamerica no tiene una excepción de “indetectable.” GIWL sigue siendo el camino.",
      faq4q: "¿Existe aceptación garantizada sin espera?",
      faq4a: "No en las compañías que cotizamos. Vea la guía de aceptación garantizada.",
      faq5q: "Tengo 45 años. ¿Qué hay?",
      faq5a: "GIWL empieza a los 50. Antes de eso no cotizamos un “sí automático” sin cuestionario para este diagnóstico. Hable con Mejor Vida Seguros; no inventamos un producto.",
      faq6q: "¿Debo listar los antivirales en GIWL?",
      faq6a: "GIWL no tiene cuestionario de salud. Siga las instrucciones de la solicitud (identidad y pago). No mienta en ningún formulario que sí pregunte medicamentos.",
      nextLead: "Si tiene 50 a 80 años, cotice GIWL. Si no, llame para ver qué queda abierto.",
      nextMore: `Cómo funciona la espera: <a href="${L.gi}">aceptación garantizada</a>.`,
    };
  }
  return {
    ...b,
    ...src,
    title: "Final expense insurance with HIV: guaranteed acceptance (2026) | Mejor Vida Insurance",
    desc: "At appointed simplified-issue companies, HIV or AIDS is usually a decline. The usual path is Corebridge GIWL: ages 50–80, $5,000–$25,000, two-year wait.",
    h1: "Final expense insurance if you live with HIV",
    lead: "The CDC explains that HIV is a virus that attacks the immune system; with treatment many people live a long life. On the final expense products we quote, that medical progress <strong>does not open the simplified questionnaire</strong> (health questions, no office exam). An HIV or AIDS diagnosis is usually a decline at Living Promise, Accendo, Americo, and on Transamerica’s chart. The path we do quote is <strong>guaranteed acceptance</strong>: no health questions, and about a two-year wait for natural death.",
    crumbEnd: "HIV",
    take1: "Transamerica lists AIDS/HIV/ARC as <strong>Decline</strong> on the single-condition chart. Our simplified knockout list includes HIV or AIDS.",
    take2: "Corebridge GIWL has no health questions. Ages <strong>50–80</strong>, amounts <strong>$5,000–$25,000</strong>. There is always a two-year wait for natural death: 110% of premiums paid. A covered accident can pay the face amount from the start.",
    take3: "We do not quote a “special graded HIV plan” from companies we do not appoint. We do not claim an appointed level plan for this diagnosis.",
    callout: "If you are 50 to 80, GIWL is the product to quote. If you are under 50 or over 80, tell us: there is no automatic GIWL yes outside that age on what we offer.",
    whatH: "What insurance asks — and what it does not",
    whatP1: "HIV.gov and the CDC describe HIV and AIDS as stages of the same infection. Treatment (antivirals) can lower viral load. The simplified questionnaire at appointed companies does not offer a checkbox for “undetectable = level.” It asks whether there is a diagnosis. A “yes” usually closes that product.",
    whatP2: "GIWL does not ask the diagnosis. That is why it can issue. In return it does not select by health, costs more per dollar, and waits for non-accidental death.",
    uwH: "Why simplified issue is not the first product",
    uwP: "Living Promise, Accendo Level, and Americo Eagle Select use questions and prescription databases. HIV antivirals show up. Transamerica writes Decline for AIDS/HIV/ARC. We do not send those applications “to see what happens” when the chart already says no.",
    uwNote: "Any ad for “no exam and immediate benefit” with HIV is almost always either a questionnaire you cannot pass, or a product we do not quote.",
    chH: "What else you need to know",
    chP: "HIV is not the only factor if other GIWL rules also apply.",
    ch1: "Age: appointed GIWL is 50–80. Outside that range there is no GIWL issue on what we quote.",
    ch2: "Amount: $25,000 cap; one GIWL policy per insured every 12 months at that company.",
    ch3: "Other conditions (dementia, hospice, terminal illness) do not change GIWL: there are no questions. Age, amount, and product-state rules still apply.",
    ch4: "Tobacco does not change the GIWL premium. Age, sex, and amount do.",
    costH: "What GIWL costs (health does not change this premium)",
    costP: "These illustrative monthly premiums are Corebridge GIWL, the guaranteed-acceptance product Mejor Vida Insurance quotes. They include the policy fee. There is a two-year wait for natural death. Not an offer.",
    coH: "Appointed product for this diagnosis",
    coP: "We do not publish an appointed level plan for HIV. The card below is GIWL. The Living Promise or Accendo cards on other pages in this section do not apply to this diagnosis.",
    faq1q: "Can I be denied GIWL because of HIV?",
    faq1a: "Not for medical history, if you are in the product’s age and amount. You still have to meet identity, payment, and where the product is filed.",
    faq2q: "Is there a waiting period?",
    faq2a: "Yes. Two years for non-accidental death. On GIWL, during that wait the family receives 110% of premiums paid, not the $10,000 or $25,000. A covered accident can pay the face amount.",
    faq3q: "My viral load is undetectable. Does that open Living Promise?",
    faq3a: "Not under the rules we quote. Transamerica’s chart does not have an “undetectable” exception. GIWL remains the path.",
    faq4q: "Is there guaranteed acceptance with no wait?",
    faq4a: "Not at the companies we quote. See the guaranteed-acceptance guide.",
    faq5q: "I am 45. What is available?",
    faq5a: "GIWL starts at 50. Before that we do not quote an automatic yes without a questionnaire for this diagnosis. Talk with Mejor Vida Insurance; we do not invent a product.",
    faq6q: "Do I list antivirals on GIWL?",
    faq6a: "GIWL has no health questionnaire. Follow the application’s identity and payment instructions. Do not lie on any form that does ask for medications.",
    nextLead: "If you are 50 to 80, quote GIWL. If not, call to see what is still open.",
    nextMore: `How the wait works: <a href="${L.gi}">guaranteed acceptance</a>.`,
  };
}

function hivMain(lang, page, c) {
  return condPageMain(lang, page, c, { showGi: true, showSi: false });
}

/* -------------------------------------------------------------------------- */
/* Stroke                                                                      */
/* -------------------------------------------------------------------------- */

function copyStroke(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const b = baseCopy(lang);
  const src = sharedSources(isEs, {
    src2: isEs
      ? '<a href="https://www.cdc.gov/stroke/about/index.html" rel="noopener" target="_blank">CDC: derrame cerebral</a> — el derrame y el AIT (ataque isquémico transitorio) no son lo mismo; ambos importan en una solicitud.'
      : '<a href="https://www.cdc.gov/stroke/about/index.html" rel="noopener" target="_blank">CDC: stroke</a> — a stroke and a TIA (transient ischemic attack) are not the same; both matter on an application.',
    src3: isEs
      ? '<a href="https://www.nhlbi.nih.gov/health/stroke" rel="noopener" target="_blank">NHLBI: derrame</a> — síntomas y factores (presión alta, tabaco); contexto de salud, no una tarifa.'
      : '<a href="https://www.nhlbi.nih.gov/health/stroke" rel="noopener" target="_blank">NHLBI: stroke</a> — symptoms and factors (high blood pressure, tobacco); health context, not a rate.',
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de gastos finales después de un derrame o AIT (2026) | Mejor Vida Seguros",
      desc: "Un derrame o AIT de hace años a menudo sigue en gastos finales simplificados. Un evento en los últimos dos años cambia el producto. Cómo lo miran las compañías designadas.",
      h1: "Seguro de gastos finales si tuvo un derrame o un AIT",
      lead: "El CDC explica que un derrame ocurre cuando se corta el riego al cerebro; un AIT es un episodio breve con síntomas parecidos que se resuelven. Para gastos finales, <strong>el año del evento importa más que la etiqueta</strong>. Un derrame de 2015, con recuperación y sin silla por enfermedad, a menudo sigue en emisión simplificada: hay preguntas de salud, no un examen en el consultorio. Un evento en los últimos dos años se pregunta aparte.",
      crumbEnd: "Derrame",
      take1: "En el gráfico de Transamerica, derrame y AIT quedan <strong>Standard</strong>; con crédito de actividad pueden subir a <strong>Preferred</strong> si es el único factor.",
      take2: "En el flujo de Mejor Vida Seguros preguntamos infarto, derrame o AIT en los <strong>últimos dos años</strong>. Esa ventana estrecha Living Promise, Accendo y otros simplificados más que un episodio antiguo.",
      take3: "Si el derrame dejó silla de ruedas por enfermedad, demencia, o cuidado en residencia, el archivo ya no es “solo derrame.” Vea discapacidad y la lista de descalificadores del hub.",
      callout: "Diga la fecha, si fue derrame o AIT, y si quedó con ayuda para caminar o con problemas de memoria. No redondee “hace un par de años” si fue hace once meses.",
      whatH: "Derrame y AIT, en una frase cada uno",
      whatP1: "El CDC: un derrame daña el cerebro por un coágulo o una hemorragia. Un AIT es un aviso breve. Ambos se tratan como eventos neurológicos en una solicitud, no como “mareo.”",
      whatP2: "La presión alta y el tabaco son factores que el NHLBI destaca. Si también tiene presión o corazón, dígalo: el cuestionario deja de ser un solo padecimiento.",
      uwH: "Cómo lo miran las compañías designadas",
      uwP: "Living Promise y Accendo preguntan internaciones y eventos recientes; cada formulario usa su propio plazo. Transamerica publica Standard para derrame y AIT, con posible Preferred si hay crédito de actividad. Hospitalización en 12 meses es Standard; actual, Decline. Eso se suma al derrame, no lo sustituye.",
      uwNote: "Un plan nivelado, si califica, puede pagar desde el día uno. GIWL entra cuando el simplificado no puede emitir — por ejemplo un evento muy reciente más silla por enfermedad o demencia.",
      chH: "Qué suele cambiar la respuesta",
      chP: "La fecha y las secuelas pesan más que la palabra “derrame.”",
      ch1: "Evento en los últimos dos años: hay que datarlo. Muchos simplificados se estrechan.",
      ch2: "Silla, residencia o pérdida de memoria después del evento: vea discapacidad y la lista de GIWL (demencia, residencia, silla por enfermedad).",
      ch3: "Cirugía pendiente, hospital ahora o hospicio: Decline en Transamerica y en nuestra lista simplificada.",
      ch4: "Solo presión alta, sin derrame: esa es otra página. No mezcle un AIT con “me subió la presión un día.”",
      costH: "Cuánto cuesta un plan nivelado (si califica)",
      costP: "Primas ilustrativas, no fumador, gastos finales nivelados. Si el evento es antiguo y el cuestionario emite, el precio sigue a edad, sexo y tabaco. GIWL, si es el único camino, cuesta más y espera dos años.",
      coH: "Compañías designadas (planes nivelados)",
      coP: "Compare estas fichas cuando el derrame o AIT ya no está en la ventana reciente y no hay descalificadores de cuidado o memoria.",
      faq1q: "Tuve un AIT hace cinco años. ¿Hay espera?",
      faq1a: "A menudo no, si el resto del cuestionario está limpio. En Transamerica el AIT es Standard (Preferred con crédito de actividad). Cotice con el año real.",
      faq2q: "El derrame fue hace 14 meses. ¿Qué producto?",
      faq2a: "Está dentro de la ventana de dos años que usamos. El simplificado puede estrecharse. Prepare fechas y pregunte; no envíe un “no” a “¿últimos dos años?”",
      faq3q: "Quedé con un lado débil pero camino. ¿Silla?",
      faq3a: "Si no usa silla ni scooter por enfermedad, descríbalo así. Si sí usa silla, vea la guía de discapacidad: Living Promise y Accendo suelen tratarlo distinto que Transamerica.",
      faq4q: "¿El tabaco después de un derrame me declina?",
      faq4a: "Suele ser tarifa de tabaco, no un cierre automático, si el resto pasa. En 12 meses de nicotina, Transamerica aplica tarifa de tabaco.",
      faq5q: "¿GIWL es automático después de un derrame?",
      faq5a: "No. Un derrame antiguo sin secuelas graves a menudo sigue en simplificado. GIWL es para cuando el cuestionario no puede emitir.",
      faq6q: "¿Puedo comprar para un padre que tuvo un derrame?",
      faq6a: "Sí, si hay interés asegurable y el padre puede firmar y responder. Un poder notarial no sustituye esa firma. Vea las guías de familia.",
      nextLead: "Diga la fecha del evento y si quedaron silla, residencia o problemas de memoria.",
      nextMore: `Vea también <a href="${L.heart}">corazón</a> y <a href="${L.hbp}">presión alta</a>.`,
    };
  }
  return {
    ...b,
    ...src,
    title: "Final expense insurance after a stroke or TIA (2026) | Mejor Vida Insurance",
    desc: "A stroke or TIA from years ago often still fits simplified final expense. An event in the last two years changes the product. How appointed companies look at it.",
    h1: "Final expense insurance if you had a stroke or TIA",
    lead: "The CDC explains that a stroke happens when blood flow to the brain is cut off; a TIA is a short episode with similar symptoms that resolve. For final expense, <strong>the year of the event matters more than the label</strong>. A 2015 stroke, with recovery and no wheelchair from illness, often stays on simplified issue: health questions, no office exam. An event in the last two years is asked separately.",
    crumbEnd: "Stroke",
    take1: "On Transamerica’s chart, stroke and TIA are <strong>Standard</strong>; with an activity credit they can move to <strong>Preferred</strong> if that is the only factor.",
    take2: "In Mejor Vida Insurance’s flow we ask about heart attack, stroke, or TIA in the <strong>last two years</strong>. That window narrows Living Promise, Accendo, and other simplified plans more than an old episode.",
    take3: "If the stroke left a wheelchair from illness, dementia, or facility care, the file is no longer “stroke only.” See disability and the hub knockout list.",
    callout: "Give the date, whether it was a stroke or a TIA, and whether you were left needing help to walk or with memory problems. Do not round “a couple of years ago” if it was eleven months ago.",
    whatH: "Stroke and TIA, in one sentence each",
    whatP1: "The CDC: a stroke damages the brain from a clot or a bleed. A TIA is a brief warning. Both are treated as neurologic events on an application, not as “dizziness.”",
    whatP2: "High blood pressure and tobacco are factors the NHLBI highlights. If you also have blood pressure or heart disease, say so: the questionnaire is no longer a single impairment.",
    uwH: "How appointed companies look at it",
    uwP: "Living Promise and Accendo ask about hospital stays and recent events; each form uses its own time window. Transamerica publishes Standard for stroke and TIA, with possible Preferred if there is an activity credit. Hospitalization in 12 months is Standard; current, Decline. That stacks with the stroke; it does not replace it.",
    uwNote: "A level plan, if you qualify, can pay from day one. GIWL comes in when simplified issue cannot issue — for example a very recent event plus a wheelchair from illness or dementia.",
    chH: "What usually changes the answer",
    chP: "The date and the aftermath weigh more than the word “stroke.”",
    ch1: "Event in the last two years: it has to be dated. Many simplified plans narrow.",
    ch2: "Chair, facility, or memory loss after the event: see disability and the GIWL list (dementia, facility, wheelchair from illness).",
    ch3: "Pending surgery, hospital now, or hospice: Decline at Transamerica and on our simplified list.",
    ch4: "High blood pressure only, no stroke: that is a different page. Do not mix a TIA with “my pressure spiked one day.”",
    costH: "What a level plan costs (if you qualify)",
    costP: "Illustrative non-tobacco premiums for level final expense. If the event is old and the questionnaire issues, price follows age, sex, and tobacco. GIWL, if it is the only path, costs more and waits two years.",
    coH: "Appointed companies (level plans)",
    coP: "Compare these cards when the stroke or TIA is no longer in the recent window and there are no care or memory knockouts.",
    faq1q: "I had a TIA five years ago. Is there a wait?",
    faq1a: "Often not, if the rest of the questionnaire is clean. At Transamerica a TIA is Standard (Preferred with an activity credit). Quote with the real year.",
    faq2q: "The stroke was 14 months ago. Which product?",
    faq2a: "That is inside the two-year window we use. Simplified issue may narrow. Have dates ready and ask; do not answer “no” to “in the last two years?”",
    faq3q: "I have a weak side but I walk. Does that count as a wheelchair?",
    faq3a: "If you do not use a chair or scooter from illness, describe it that way. If you do use a chair, see the disability guide: Living Promise and Accendo often treat it differently from Transamerica.",
    faq4q: "Does tobacco after a stroke decline me?",
    faq4a: "It is usually a tobacco rate, not an automatic close, if the rest passes. Within 12 months of nicotine, Transamerica applies a tobacco rate.",
    faq5q: "Is GIWL automatic after a stroke?",
    faq5a: "No. An old stroke without serious aftermath often stays on simplified issue. GIWL is for when the questionnaire cannot issue.",
    faq6q: "Can I buy for a parent who had a stroke?",
    faq6a: "Yes, if there is insurable interest and the parent can sign and answer. A power of attorney does not replace that signature. See the family guides.",
    nextLead: "Give the date of the event and whether a chair, a facility, or memory problems remained.",
    nextMore: `See also <a href="${L.heart}">heart disease</a> and <a href="${L.hbp}">high blood pressure</a>.`,
  };
}

function strokeMain(lang, page, c) {
  return condPageMain(lang, page, c, {});
}

module.exports = {
  LINKS,
  copyCondHub,
  condHubMain,
  copyCondTerm,
  condTermMain,
  copyDiabetes,
  diabetesMain,
  copyHeart,
  heartMain,
  copyHbp,
  hbpMain,
  copyCopd,
  copdMain,
  copyCancer,
  cancerMain,
  copyKidney,
  kidneyMain,
  copyDisability,
  disabilityMain,
  copyHiv,
  hivMain,
  copyStroke,
  strokeMain,
};
