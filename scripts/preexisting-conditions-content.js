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
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
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
<p class="lic-rate-note"${c.hideJsRateNote ? " hidden" : ""} data-lic-note></p>
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
<p class="lic-rate-note"${c.hideJsRateNote ? " hidden" : ""} data-lic-note></p>
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

function pickSrc(extra, key, fallback) {
  if (extra && Object.prototype.hasOwnProperty.call(extra, key)) return extra[key];
  return fallback;
}

function sharedSources(isEs, extra) {
  const L = LINKS[isEs ? "es" : "en"];
  if (isEs) {
    return {
      srcTitle: "Fuentes",
      src1: pickSrc(
        extra,
        "src1",
        '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: seguro de vida para el consumidor</a> — cómo se compra una póliza, qué es el interés asegurable y por qué las respuestas de salud importan en un reclamo.'
      ),
      src2: pickSrc(
        extra,
        "src2",
        '<a href="https://www.cdc.gov/" rel="noopener" target="_blank">CDC</a> — información de salud pública sobre condiciones crónicas; no sustituye las reglas de una aseguradora.'
      ),
      src3: pickSrc(
        extra,
        "src3",
        '<a href="https://www.cancer.gov/about-cancer/understanding" rel="noopener" target="_blank">Instituto Nacional del Cáncer</a> — qué es el cáncer y cómo se describe el tratamiento.'
      ),
      src4: pickSrc(
        extra,
        "src4",
        '<a href="https://www.niddk.nih.gov/health-information" rel="noopener" target="_blank">NIDDK (NIH)</a> — enfermedad renal, diabetes y factores relacionados.'
      ),
      src5: pickSrc(
        extra,
        "src5",
        `Material de compañías designadas: Mutual of Omaha Living Promise; Accendo Final Expense (Accendo Insurance Company); Transamerica Immediate Solution / gráficos de suscripción de gastos finales; Corebridge GIWL; Americo Eagle Select. Primas de muestra: js/final-expense-cost-rates.json y Corebridge GIWL, agosto 2026.`
      ),
      src6: pickSrc(
        extra,
        "src6",
        `Guías de Mejor Vida Seguros: <a href="${L.noWait}">sin período de espera</a> y <a href="${L.gi}">aceptación garantizada</a>.`
      ),
    };
  }
  return {
    srcTitle: "Sources",
    src1: pickSrc(
      extra,
      "src1",
      '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: consumer life insurance</a> — how a policy is bought, what insurable interest means, and why health answers matter at claim time.'
    ),
    src2: pickSrc(
      extra,
      "src2",
      '<a href="https://www.cdc.gov/" rel="noopener" target="_blank">CDC</a> — public-health information on chronic conditions; it does not replace an insurer’s rules.'
    ),
    src3: pickSrc(
      extra,
      "src3",
      '<a href="https://www.cancer.gov/about-cancer/understanding" rel="noopener" target="_blank">National Cancer Institute</a> — what cancer is and how treatment is described.'
    ),
    src4: pickSrc(
      extra,
      "src4",
      '<a href="https://www.niddk.nih.gov/health-information" rel="noopener" target="_blank">NIDDK (NIH)</a> — kidney disease, diabetes, and related factors.'
    ),
    src5: pickSrc(
      extra,
      "src5",
      `Appointed-company materials: Mutual of Omaha Living Promise; Accendo Final Expense (Accendo Insurance Company); Transamerica Immediate Solution / final-expense underwriting charts; Corebridge GIWL; Americo Eagle Select. Sample premiums: js/final-expense-cost-rates.json and Corebridge GIWL, August 2026.`
    ),
    src6: pickSrc(
      extra,
      "src6",
      `Mejor Vida Insurance guides: <a href="${L.noWait}">no waiting period</a> and <a href="${L.gi}">guaranteed acceptance</a>.`
    ),
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
  const src = sharedSources(isEs, {
    src1: isEs
      ? '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: seguro de vida para el consumidor</a> — cómo se compra una póliza y por qué las respuestas de salud importan en un reclamo.'
      : '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: consumer life insurance</a> — how a policy is bought and why health answers matter at claim time.',
    src2: isEs
      ? '<a href="https://www.cdc.gov/chronic-disease/about/index.html" rel="noopener" target="_blank">CDC: enfermedades crónicas</a> — muchas personas viven con un diagnóstico de larga data; eso es salud pública, no la regla de una aseguradora.'
      : '<a href="https://www.cdc.gov/chronic-disease/about/index.html" rel="noopener" target="_blank">CDC: chronic diseases</a> — many people live with a long-term diagnosis; that is public health, not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">SSA: pago único por fallecimiento</a> — un pago de $255, si aplica; no cubre un funeral.'
      : '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">SSA: lump-sum death payment</a> — a $255 payment, if it applies; it does not cover a funeral.',
    src4: isEs
      ? '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — derechos al contratar un funeral; el seguro de vida no es un contrato funerario prepago.'
      : '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — rights when buying funeral goods and services; life insurance is not a prepaid funeral contract.',
    src5: "",
    src6: "",
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      hideJsRateNote: true,
      coAges: "Edades",
      coWait: "Espera de 2 años",
      coAetnaProduct: "Accendo Nivelado",
      coTaProduct: "Immediate Solution",
      coTaAmt: "Desde $1,000; tope según edad (hasta $50,000)",
      coAmericoAmt: "$5,000–$50,000; tope $40,000 a los 76–85",
      coGiProduct: "Aceptación garantizada (GIWL)",
      coGiFoot: "Una póliza de aceptación garantizada por asegurado cada 12 meses; el total de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      title: "Gastos finales con una condición de salud (2026) | Mejor Vida Seguros",
      desc: "Una condición previa no cierra el seguro de gastos finales. Qué es, cómo se revisa la salud, cuándo un plan puede pagar desde el primer pago y qué hacer si no puede.",
      h1: "¿Puede comprar seguro de gastos finales si ya tiene una condición de salud?",
      lead: "A menudo sí. El <strong>seguro de gastos finales</strong> es una póliza pequeña para funeral, cremación y deudas cortas. Una condición que ya existía al solicitar <strong>no es un “no” automático</strong>. Tampoco hay un plan sin preguntas de salud que pague el monto completo por muerte natural desde el día uno.",
      crumbEnd: "Condiciones preexistentes",
      take1: "Hay tres caminos. Un <strong>plan nivelado</strong> (lo definimos abajo) puede pagar el monto completo desde el primer pago cubierto, con preguntas de salud. Un plan gradual o modificado limita ese pago al inicio. La aceptación garantizada no hace preguntas y espera unos dos años por muerte natural.",
      take2: "Ninguna compañía que cotizamos ofrece <strong>cero preguntas y el monto completo por muerte natural desde el día uno</strong>. “Sin examen” no es lo mismo que “sin preguntas.”",
      take3:
        "Empiece por el cuestionario. La <a href=\"" +
        L.gi +
        "\">aceptación garantizada</a> es el plan B cuando ese cuestionario no puede emitir — no el primer intento para diabetes o presión alta.",
      callout: "Diga el diagnóstico, el año, los medicamentos y si usa tabaco. Eso decide el producto y el precio — no el anuncio de “sin examen y sin espera.”",
      needH: "La pregunta que la gente trae",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. El Seguro Social puede pagar un único monto de $255 si se cumplen sus reglas; eso no cubre un sepelio. El dinero de una póliza de vida va en efectivo a la persona que usted nombró. No es un contrato con una funeraria.",
      needP2: "El miedo con un diagnóstico suele ser concreto: “¿Todavía puedo dejar algo para esa factura, o solo me van a vender un plan que espera dos años?” El resto de la página enseña cómo funciona el producto. Los nombres de compañías vienen después.",
      whatH: "Qué es gastos finales, y qué cuenta como condición previa",
      whatP1: "Usted paga una <strong>prima</strong> — la cuota regular. Si fallece y el contrato está al día, el <strong>beneficiario</strong> (la persona que nombró) recibe el <strong>beneficio de muerte</strong>: el monto del contrato, en efectivo. La <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC</a> describe así el seguro de vida: no es una cuenta de ahorro del gobierno, y las respuestas de salud importan cuando llega el reclamo.",
      whatP2: "Gastos finales, entierro y funeral, en la práctica, apuntan a lo mismo: una vida entera de monto pequeño. <strong>Vida entera</strong> significa que la cobertura no vence a los 10 o 20 años mientras se pague a tiempo. El monto en las compañías que cotizamos suele ir de unos miles hasta unos $50,000, según edad y producto. No sustituye un temporal grande para hipoteca o años de sueldo.",
      whatP3: "Una condición preexistente es un diagnóstico, un tratamiento o síntomas que ya existían cuando usted solicita. El CDC recuerda que muchas personas viven años con una enfermedad crónica. Eso es salud. Una aseguradora no trata la enfermedad: decide si ese historial, como queda escrito y como aparece en recetas, cabe en un producto que está dispuesta a emitir.",
      howH: "Cómo una aseguradora revisa la salud en gastos finales",
      howP1: "En estos planes pequeños casi nunca hay una cita de laboratorio en el consultorio. Sí hay preguntas, y la compañía suele revisar recetas que usted ya surtió. Un “no” que debió ser “sí” puede retrasar o afectar un reclamo. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega el reclamo.",
      howP2: "Un anuncio de “sin examen” no significa “sin historial.” Si la compañía no pregunta nada, no puede pagar $10,000 o $25,000 después de haber cobrado unas pocas cuotas. Por eso el camino al monto completo desde el primer pago es un plan con preguntas que su archivo puede contestar.",
      howP3: "La misma palabra — diabetes, corazón, presión alta — no decide sola. Importan la fecha, el tratamiento, el tabaco, el peso y si hay un segundo problema. Un evento antiguo y estable no se lee igual que uno reciente o con complicaciones. Si el cuestionario no puede emitir, el siguiente producto no es “el mismo plan sin preguntas.” Es otro contrato, más pequeño, con espera.",
      pathsH: "Tres caminos, en lenguaje sencillo",
      path1T: "Plan nivelado (a veces lo llaman inmediato)",
      path1: "Hay preguntas. Si la compañía emite, el monto completo puede aplicar por muerte natural cubierta desde el primer pago. Suele ser el precio más bajo por dólar de estos tres. Ejemplos designados: Mutual of Omaha Living Promise Nivelado, edades 45–85, unos $2,000–$50,000; Accendo Nivelado, edades 40–89, con un tope de $25,000 a los 76–89; Transamerica Immediate Solution, hasta 85, desde $1,000 y con un tope que baja con la edad; Americo Eagle Select Nivelado, edades 40–85, $5,000–$50,000 (tope $40,000 a los 76–85). No publicamos una emisión nueva de gastos finales a los 90.",
      path2T: "Plan gradual o modificado",
      path2: "Sigue habiendo preguntas. En los primeros años, una muerte no accidental puede pagar solo una parte del monto o devolver primas según el contrato. En Accendo Modificado, los años 1–2 suelen devolver el 110% de las primas ganadas por muerte no accidental; el monto completo aplica desde el año 3; un accidente cubierto puede pagar entero desde el inicio. Ese diseño emite de 40 a 75, hasta $25,000. Living Promise también tiene un plan gradual (edades 45–80, hasta unos $20,000) que limita el beneficio por muerte natural en los dos primeros años; no mezclamos esa fórmula con la de Accendo.",
      path3T: "Aceptación garantizada",
      path3:
        "No hay preguntas de salud. Dentro de la edad y el monto, el historial médico no cierra la solicitud. Siempre hay espera de unos dos años por muerte no accidental. Ese producto se llama GIWL: vida entera de aceptación garantizada. El que cotizamos es Corebridge, edades 50–80, $5,000–$25,000; en la espera, 110% de las primas pagadas. Vea <a href=\"" +
        L.gi +
        "\">aceptación garantizada</a>.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Si un anuncio mezcla las dos cosas, no es un producto que cotizamos.",
      vsH: "Qué cambia entre esos caminos",
      vsCol1: "Nivelado",
      vsCol1Sub: "Preguntas; monto completo si emite",
      vsCol2: "Gradual o modificado",
      vsCol2Sub: "Preguntas; pago limitado al inicio",
      vsCol3: "Aceptación garantizada",
      vsCol3Sub: "Sin preguntas; espera por muerte natural",
      vsR1H: "Preguntas de salud",
      vsR1A: "Sí",
      vsR1B: "Sí",
      vsR1C: "No",
      vsR2H: "Cuándo paga el monto completo (muerte natural)",
      vsR2A: "Desde el primer pago cubierto, si emite",
      vsR2B: "Después de los primeros años del contrato",
      vsR2C: "Después de unos dos años",
      vsR3H: "Montos habituales",
      vsR3A: "Miles hasta unos $50,000, según edad",
      vsR3B: "Suele ser más bajo que el nivelado",
      vsR3C: "$5,000–$25,000 en lo que cotizamos",
      vsR4H: "Precio, en general",
      vsR4A: "El más bajo por dólar de estos tres",
      vsR4B: "En el medio, si ese producto existe para su archivo",
      vsR4C: "Suele ser el más alto: la salud no cambia esa prima",
      vsLearn: "Lea la tabla como un mapa, no como una cotización. El archivo real — fechas, recetas, tabaco — sigue decidiendo.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja: puede abrir más monto, un precio más bajo y sin espera de dos años. El límite es el mismo cuestionario: un evento reciente, tratamiento activo, varias condiciones juntas o tabaco combinado con un problema de pulmón puede cerrar el plan inmediato. Esperar “hasta estar más sano” solo sube la edad si el diagnóstico ya está estable. Esperar sí puede importar si acaba de haber un infarto, un derrame o un cáncer en tratamiento: algunas preguntas miran ventanas de tiempo.",
      considerP2: "Un contrato funerario prepago es un acuerdo con una funeraria. La <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule de la FTC</a> trata de cómo se compran bienes y servicios funerarios. El seguro de gastos finales es otra cosa: efectivo para quien usted nombró. No es lo mismo que “ya está pagado el funeral.”",
      dirH: "Guías por condición",
      dirP: "Estas páginas cubren las situaciones que más vemos en gastos finales y de las que tenemos datos verificables. No es un directorio de decenas de enfermedades. Cada guía empieza por la idea de salud y luego lista solo lo que podemos verificar.",
      d1H: "Diabetes",
      d1: "Tipo 1 o 2, con o sin insulina, a menudo sigue en un plan con preguntas si no hay complicaciones graves. No es, por sí sola, una espera de dos años.",
      d2H: "Enfermedad del corazón",
      d2: "Un infarto antiguo no es lo mismo que insuficiencia cardíaca o un evento de este año. La fecha y lo que quedó importan más que la palabra “corazón.”",
      d3H: "Presión alta",
      d3: "Es de las condiciones más comunes. Sola, casi nunca empuja a aceptación garantizada.",
      d4H: "EPOC",
      d4: "Muchos cuestionarios todavía cotizan. Tabaco y oxígeno recetado por pulmón suelen estrechar las opciones más que la palabra “EPOC” sola.",
      d5H: "Cáncer",
      d5: "Tratamiento activo suele cerrar el plan con preguntas. Libre de cáncer y de tratamiento por un tiempo puede volver a cotizar. El tipo y la fecha importan.",
      d6H: "Riñón",
      d6: "La etapa y si hay diálisis importan más que la palabra “riñón.”",
      d7H: "Discapacidad",
      d7: "Un cheque del Seguro Social no es lo mismo que un “no” en el cuestionario. Silla de ruedas y ayuda para bañarse se miran aparte.",
      d8H: "VIH",
      d8: "En las compañías con preguntas que cotizamos, este diagnóstico suele no emitir. El camino habitual es aceptación garantizada.",
      d9H: "Derrame o AIT",
      d9: "Un evento de hace años no es lo mismo que uno en los últimos dos años. Diga el año y si quedó una limitación.",
      limitsH: "Cuándo un plan con preguntas a menudo no puede emitir",
      limitsP: "En las compañías que cotizamos, un plan con cuestionario a menudo no se puede emitir si aplica alguna de estas situaciones. Entonces sí se mira aceptación garantizada. No es un diagnóstico ni una lista legal: una cotización confirma el producto.",
      k1: "VIH o SIDA",
      k2: "Alzheimer o demencia",
      k3: "Hospital, residencia, hospicio, enfermería especializada o cuidado de salud en el hogar en este momento",
      k4: "Oxígeno por una condición pulmonar (no apnea del sueño)",
      k5: "Silla de ruedas, scooter o cama por una enfermedad (no una lesión breve)",
      k6: "Cáncer en tratamiento activo",
      k7: "Abuso de alcohol o drogas, o tratamiento, en los últimos 24 meses",
      k8: "Incapacidad mental o enfermedad terminal",
      k9: "Diálisis, enfermedad renal avanzada o trasplante de órgano",
      limitsNote: "Algunos cánceres de piel o etapas muy tempranas todavía pueden cotizar un plan con preguntas. No hay una sola regla pública que cubra todos los tipos y todas las compañías.",
      limitsGap: "EPOC con tabaco: en varias compañías designadas el cuestionario a menudo no emite. En el gráfico de un solo padecimiento de Transamerica, EPOC, diabetes o enfermedad renal todavía pueden considerarse cuando ese es el único factor listado. El perfil completo — peso, recetas, otros diagnósticos — decide. No elegimos un “sí” ni un “no” universal.",
      costH: "Qué cuesta un plan nivelado si el cuestionario puede emitir",
      costP: "Estas primas mensuales son ilustrativas de gastos finales nivelados, no fumador, compañías designadas. Léalas como el tamaño del producto si el cuestionario emite un plan inmediato — no como “el precio de tener una condición.” Una condición previa puede impedir esa fila: el precio real puede ser más alto, o el producto no emite. La aceptación garantizada, a la misma edad y monto, suele costar más y espera unos dos años por muerte natural. No es una oferta.",
      coH: "Compañías designadas (gastos finales)",
      coP: "Fichas educativas. El estado, el tabaco y el historial cambian la oferta. Las licencias actuales están en la página de licencias.",
      applyH: "Cómo solicitar sin atascar un reclamo futuro",
      applyP: "La compañía revisa lo que usted dice y lo que ya está en bases de recetas. Diga la verdad aunque tema un “sí.” Un “no” incorrecto es peor que un plan con espera. Mejor Vida Seguros compara más de un cuestionario; no enviamos una sola solicitud a ciegas.",
      faq1q: "¿Tener una condición preexistente me impide comprar gastos finales?",
      faq1a: "No por sí sola. Estos planes existen, en gran parte, para adultos con historial médico. Lo que cambia es si el monto puede pagar desde el primer pago, si hay un período limitado al inicio, o si hay espera de unos dos años.",
      faq2q: "¿Puedo comprar por internet un plan “sin examen y sin espera”?",
      faq2a: "En las compañías que cotizamos, “sin examen” sigue teniendo preguntas. La aceptación garantizada no tiene preguntas y siempre tiene espera por muerte natural. No cotizamos un producto que combine las dos cosas.",
      faq3q: "¿La diabetes o la presión alta me mandan a aceptación garantizada?",
      faq3a: "Casi nunca, si esa es la única condición y no hay complicaciones graves. Cotice primero un plan con preguntas.",
      faq4q: "¿El precio sube porque tengo una condición?",
      faq4a: "En un plan nivelado, el precio sigue sobre todo a edad, sexo y tabaco. Algunos productos tienen más de un precio si el mismo cuestionario todavía emite. En aceptación garantizada la salud no cambia la prima: por eso suele costar más.",
      faq5q: "¿Debo mencionar todos los medicamentos?",
      faq5a: "Sí. Las compañías revisan historial de recetas. Un medicamento que no coincida con sus respuestas puede frenar o anular el contrato.",
      faq6q: "¿Hasta qué edad puedo comprar?",
      faq6a: "Depende del producto. Living Promise Nivelado emite de 45 a 85. Accendo Nivelado puede emitir hasta 89 (tope $25,000 a los 76–89). Immediate Solution llega a 85. Eagle Select Nivelado llega a 85; algunos diseños con tabaco o con beneficio limitado cortan antes, a menudo a los 75. La aceptación garantizada que cotizamos suele cortar a los 80. No publicamos una emisión nueva a los 90.",
      faq7q: "¿Esto es lo mismo que un funeral prepago?",
      faq7a: "No. El prepago es un contrato con una funeraria. Gastos finales es seguro de vida: efectivo para el beneficiario. La Funeral Rule de la FTC trata de cómo se compran servicios funerarios; no convierte una póliza en un funeral ya pagado.",
      faq8q: "¿El Seguro Social o Medicare pagan el funeral?",
      faq8a: "El Seguro Social puede pagar $255 una sola vez, si se cumplen sus reglas. Eso no cubre un sepelio. Medicare es seguro médico; no lo tratamos aquí como un plan funerario. El efectivo de una póliza de vida es otra cosa.",
      nextLead: "Pida una cotización con su edad, tabaco y medicamentos, o llame a Mejor Vida Seguros.",
      nextMore: "Si ya sabe que el cuestionario no va a pasar, vaya directo a <a href=\"" + L.gi + "\">aceptación garantizada</a>. Si la necesidad es hipoteca o años de ingreso, vea <a href=\"" + L.termCond + "\">temporal con una condición de salud</a>.",
      quote2: "Según su salud y edad",
    };
  }
  return {
    ...b,
    ...src,
    hideJsRateNote: true,
    coAges: "Ages",
    coWait: "2-year wait",
    coAetnaProduct: "Accendo Level",
    coTaProduct: "Immediate Solution",
    coTaAmt: "From $1,000; cap by age (up to $50,000)",
    coAmericoAmt: "$5,000–$50,000; $40,000 cap at ages 76–85",
    coGiProduct: "Guaranteed acceptance (GIWL)",
    coGiFoot: "One guaranteed-acceptance policy per insured every 12 months; that company’s total does not exceed $25,000. Educational — not a binding quote.",
    title: "Final expense insurance with a health condition (2026) | Mejor Vida Insurance",
    desc: "A pre-existing condition does not automatically close final expense insurance. What it is, how health is reviewed, when a plan can pay from the first payment, and what to do if it cannot.",
    h1: "Can you buy final expense insurance if you already have a health condition?",
    lead: "Often yes. <strong>Final expense insurance</strong> is a small policy for a funeral, cremation, and short debts. A condition that already existed when you apply is <strong>not an automatic no</strong>. There is also no no-questions plan that pays the full amount for natural death from day one.",
    crumbEnd: "Pre-existing conditions",
    take1: "There are three paths. A <strong>level plan</strong> (defined below) can pay the full amount from the first covered payment, with health questions. A graded or modified plan limits that payment at first. Guaranteed acceptance asks no questions and waits about two years for natural death.",
    take2: "No company we quote offers <strong>zero questions and a full natural-death benefit from day one</strong>. “No exam” is not the same as “no questions.”",
    take3:
      "Start with the questionnaire. <a href=\"" +
      L.gi +
      "\">Guaranteed acceptance</a> is plan B when that questionnaire cannot issue — not the first try for diabetes or high blood pressure.",
    callout: "Give the diagnosis, the year, the medications, and whether you use tobacco. That decides the product and the price — not the “no exam and no waiting period” headline.",
    needH: "The question people actually bring",
    needP1: "Families shop this coverage because a funeral, the cemetery, and small debts can fall on relatives. Social Security may pay a one-time $255 amount if its rules are met; that does not cover a funeral. Life-insurance money is cash to the person you named. It is not a contract with a funeral home.",
    needP2: "The fear with a diagnosis is usually concrete: “Can I still leave something for that bill, or will I only be sold a plan that waits two years?” The rest of this page teaches how the product works. Company names come later.",
    whatH: "What final expense is, and what counts as a pre-existing condition",
    whatP1: "You pay a <strong>premium</strong> — the regular bill. If you die and the contract is current, the <strong>beneficiary</strong> (the person you named) receives the <strong>death benefit</strong>: the contract amount, in cash. The <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC</a> describes life insurance this way: it is not a government savings account, and health answers matter at claim time.",
    whatP2: "Final expense, burial, and funeral insurance, in practice, point to the same idea: small whole life. <strong>Whole life</strong> means the coverage does not end after 10 or 20 years while you pay on time. Amounts at the companies we quote usually run from a few thousand dollars up to about $50,000, depending on age and product. It does not replace large term coverage for a mortgage or years of income.",
    whatP3: "A pre-existing condition is a diagnosis, treatment, or symptoms that already existed when you apply. The CDC notes that many people live for years with a chronic disease. That is health. An insurer does not treat the disease. It decides whether that history, as written and as it appears in prescriptions, fits a product it is willing to issue.",
    howH: "How an insurer reviews health on final expense",
    howP1: "On these small plans there is almost never an in-office lab visit. There are questions, and the company usually reviews prescriptions you already filled. A “no” that should have been “yes” can stall or affect a claim. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "A “no exam” headline does not mean “no history.” If the company asks nothing, it cannot pay $10,000 or $25,000 after collecting a few premiums. That is why the path to a full amount from the first payment is a plan with questions your file can answer.",
    howP3: "The diagnosis word — diabetes, heart, high blood pressure — does not decide alone. The date, the treatment, tobacco, weight, and a second problem matter. An old, stable event is not read the same as a recent one or one with complications. If the questionnaire cannot issue, the next product is not “the same plan with no questions.” It is a different, smaller contract with a wait.",
    pathsH: "Three paths, in plain language",
    path1T: "A level plan (sometimes called immediate)",
    path1: "There are questions. If the company issues, the full amount can apply for covered natural death from the first payment. It is usually the lowest price per dollar of these three. Appointed examples: Mutual of Omaha Living Promise Level, ages 45–85, about $2,000–$50,000; Accendo Level, ages 40–89, with a $25,000 cap at ages 76–89; Transamerica Immediate Solution, through 85, from $1,000, with a cap that falls with age; Americo Eagle Select Level, ages 40–85, $5,000–$50,000 ($40,000 cap at ages 76–85). We do not publish a new final-expense issue at age 90.",
    path2T: "A graded or modified plan",
    path2: "There are still questions. In the first years, a non-accidental death may pay only part of the amount or return premiums as the contract writes it. On Accendo Modified, years 1–2 typically return 110% of earned premiums for non-accidental death; the full amount applies from year 3; a covered accident can pay in full from the start. That design issues ages 40–75, up to $25,000. Living Promise also has a graded plan (ages 45–80, up to about $20,000) that limits the natural-death benefit in the first two years; we do not mix that formula with Accendo’s.",
    path3T: "Guaranteed acceptance",
    path3:
      "There are no health questions. Within the age and amount, medical history does not close the application. There is always about a two-year wait for non-accidental death. That product is called GIWL: guaranteed-acceptance whole life. The one we quote is Corebridge, ages 50–80, $5,000–$25,000; during the wait, 110% of premiums paid. See <a href=\"" +
      L.gi +
      "\">guaranteed acceptance</a>.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. If an ad combines both, it is not a product we quote.",
    vsH: "What changes across those paths",
    vsCol1: "Level",
    vsCol1Sub: "Questions; full amount if it issues",
    vsCol2: "Graded or modified",
    vsCol2Sub: "Questions; limited pay at first",
    vsCol3: "Guaranteed acceptance",
    vsCol3Sub: "No questions; wait for natural death",
    vsR1H: "Health questions",
    vsR1A: "Yes",
    vsR1B: "Yes",
    vsR1C: "No",
    vsR2H: "When the full amount pays (natural death)",
    vsR2A: "From the first covered payment, if it issues",
    vsR2B: "After the early contract years",
    vsR2C: "After about two years",
    vsR3H: "Typical amounts",
    vsR3A: "Thousands up to about $50,000, by age",
    vsR3B: "Usually lower than the level plan",
    vsR3C: "$5,000–$25,000 on what we quote",
    vsR4H: "Price, in general",
    vsR4A: "Lowest per dollar of these three",
    vsR4B: "In the middle, if that product exists for your file",
    vsR4C: "Usually the highest: health does not change that premium",
    vsLearn: "Read the chart as a map, not a quote. The live file — dates, prescriptions, tobacco — still decides.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage: you may open a larger amount, a lower price, and no two-year wait. The limitation is the same questionnaire: a recent event, active treatment, several conditions together, or tobacco combined with a lung problem can close the immediate plan. Waiting “until I am healthier” only raises the age if the diagnosis is already stable. Waiting can matter if there has just been a heart attack, a stroke, or cancer in treatment: some questions look at time windows.",
    considerP2: "A prepaid funeral is a contract with a funeral home. The <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC Funeral Rule</a> is about how funeral goods and services are sold. Final expense insurance is different: cash for the person you named. It is not the same as “the funeral is already paid.”",
    dirH: "Guides by condition",
    dirP: "These pages cover the situations we see most on final expense and that we can verify. This is not a directory of dozens of diseases. Each guide starts with the health idea, then lists only what we can verify.",
    d1H: "Diabetes",
    d1: "Type 1 or 2, with or without insulin, often still fits a plan with questions if there are no severe complications. By itself it is not a two-year wait.",
    d2H: "Heart disease",
    d2: "An old heart attack is not the same as heart failure or an event this year. The date and what remained matter more than the word “heart.”",
    d3H: "High blood pressure",
    d3: "It is one of the most common conditions. By itself it almost never pushes you to guaranteed acceptance.",
    d4H: "COPD",
    d4: "Many questionnaires still quote. Tobacco and oxygen prescribed for the lungs usually narrow the options more than the word “COPD” alone.",
    d5H: "Cancer",
    d5: "Active treatment often closes a plan with questions. Cancer-free and off treatment for a time can quote again. The type and the date matter.",
    d6H: "Kidney",
    d6: "Stage and whether dialysis is in use matter more than the word “kidney.”",
    d7H: "Disability",
    d7: "A Social Security check is not the same as a “no” on the questionnaire. A wheelchair and help with bathing are reviewed separately.",
    d8H: "HIV",
    d8: "On the questionnaire companies we quote, this diagnosis typically will not issue. The usual path is guaranteed acceptance.",
    d9H: "Stroke or TIA",
    d9: "An event years ago is not the same as one in the last two years. Give the year and whether a limitation remained.",
    limitsH: "When a plan with questions often cannot issue",
    limitsP: "At the companies we quote, a questionnaire plan often cannot issue if one of these situations applies. That is when we look at guaranteed acceptance. This is not a diagnosis and not a legal list — a quote confirms the product.",
    k1: "HIV or AIDS",
    k2: "Alzheimer’s or dementia",
    k3: "Hospital, nursing home, hospice, skilled nursing, or home health care right now",
    k4: "Oxygen for a lung condition (not sleep apnea)",
    k5: "Wheelchair, scooter, or bedridden from illness (not a short-term injury)",
    k6: "Cancer in active treatment",
    k7: "Alcohol or drug abuse, or treatment for it, in the last 24 months",
    k8: "Mental incapacity or terminal illness",
    k9: "Dialysis, end-stage kidney disease, or an organ transplant",
    limitsNote: "Some skin cancers or very early stages can still quote a plan with questions. There is no single public rule that covers every type at every company.",
    limitsGap: "COPD with tobacco: at several appointed companies the questionnaire often cannot issue. On Transamerica’s single-condition chart, COPD, diabetes, or kidney disease can still be considered when that is the only listed factor. The full profile — weight, prescriptions, other diagnoses — decides. We will not pick a universal yes or no.",
    costH: "What a level plan costs if the questionnaire can issue",
    costP: "These monthly premiums are illustrative level final expense, non-tobacco, appointed companies. Read them as the size of the product if the questionnaire issues an immediate plan — not as “the price of having a condition.” A pre-existing condition can block that row: the real price may be higher, or the product does not issue. Guaranteed acceptance, at the same age and amount, usually costs more and waits about two years for natural death. Not an offer.",
    coH: "Appointed companies (final expense)",
    coP: "Educational cards. State, tobacco, and history change the offer. Current licenses are on the licenses page.",
    applyH: "How to apply without wrecking a future claim",
    applyP: "The company reviews what you say and what is already in prescription databases. Tell the truth even if you fear a “yes.” A wrong “no” is worse than a plan with a wait. Mejor Vida Insurance compares more than one questionnaire; we do not send a single blind application.",
    faq1q: "Does a pre-existing condition stop me from buying final expense?",
    faq1a: "Not by itself. These plans exist, in large part, for adults with a medical history. What changes is whether the amount can pay from the first payment, whether the early years are limited, or whether there is about a two-year wait.",
    faq2q: "Can I buy an online plan with “no exam and no waiting period”?",
    faq2a: "At the companies we quote, “no exam” still has questions. Guaranteed acceptance has no questions and always has a wait for natural death. We do not quote a product that combines both.",
    faq3q: "Do diabetes or high blood pressure send me to guaranteed acceptance?",
    faq3a: "Almost never, if that is the only condition and there are no severe complications. Quote a plan with questions first.",
    faq4q: "Does the price go up because I have a condition?",
    faq4a: "On a level plan, price mainly follows age, sex, and tobacco. Some products have more than one price if the same questionnaire still issues. On guaranteed acceptance, health does not change the premium — that is why it usually costs more.",
    faq5q: "Do I have to list every medication?",
    faq5a: "Yes. Companies review prescription history. A medication that does not match your answers can stall or void the contract.",
    faq6q: "Until what age can I buy?",
    faq6a: "It depends on the product. Living Promise Level issues ages 45–85. Accendo Level can issue through 89 ($25,000 cap at ages 76–89). Immediate Solution goes through 85. Eagle Select Level goes through 85; some tobacco or limited-benefit designs stop earlier, often at 75. The guaranteed acceptance we quote usually stops at 80. We do not publish a new issue at 90.",
    faq7q: "Is this the same as a prepaid funeral?",
    faq7a: "No. A prepaid funeral is a contract with a funeral home. Final expense is life insurance: cash for the beneficiary. The FTC Funeral Rule is about how funeral services are sold; it does not turn a policy into a funeral that is already paid.",
    faq8q: "Do Social Security or Medicare pay for the funeral?",
    faq8a: "Social Security may pay $255 one time, if its rules are met. That does not cover a funeral. Medicare is medical insurance; we do not treat it here as a funeral plan. Cash from a life policy is a different thing.",
    nextLead: "Ask for a quote with your age, tobacco, and medications, or call Mejor Vida Insurance.",
    nextMore: "If you already know the questionnaire will not pass, go straight to <a href=\"" + L.gi + "\">guaranteed acceptance</a>. If the need is a mortgage or years of income, see <a href=\"" + L.termCond + "\">term with a health condition</a>.",
    quote2: "For your health and age",
  };
}

function condHubMain(lang, page, c) {
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
${planCompareHtml(c)}
</section>
<section class="lic-section" id="consider">
<h2>${c.considerH}</h2>
<p>${c.considerP}</p>
<p>${c.considerP2}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
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
<section class="lic-section" id="limits">
<h2>${c.limitsH}</h2>
<p>${c.limitsP}</p>
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
<p class="lic-rate-note">${c.limitsNote}</p>
<p class="lic-factor__gap">${c.limitsGap}</p>
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
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyP}</p>
</section>`;
  return condShell(lang, page, c, {
    isHub: true,
    omitFaq: true,
    toc: isEs
      ? [
          ["#need", "La pregunta"],
          ["#how", "Cómo funciona"],
          ["#paths", "Caminos"],
          ["#faq", "Preguntas"],
          ["#directory", "Por condición"],
          ["#cost", "Costo"],
        ]
      : [
          ["#need", "The question"],
          ["#how", "How it works"],
          ["#paths", "Paths"],
          ["#faq", "Questions"],
          ["#directory", "By condition"],
          ["#cost", "Cost"],
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
      ? '<a href="https://www.cdc.gov/chronic-disease/about/index.html" rel="noopener" target="_blank">CDC: enfermedades crónicas</a> — muchas personas viven con un diagnóstico de larga data; eso es salud pública, no la regla de una aseguradora.'
      : '<a href="https://www.cdc.gov/chronic-disease/about/index.html" rel="noopener" target="_blank">CDC: chronic diseases</a> — many people live with a long-term diagnosis; that is public health, not an insurer’s rule.',
    src3: "",
    src4: "",
    src5: "",
    src6: "",
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de vida temporal con una condición de salud (2026) | Mejor Vida Seguros",
      desc: "Una condición previa no cierra el temporal de forma automática. Qué es el temporal, cómo revisa la salud una aseguradora, cuándo suele emitir y qué hacer si no puede.",
      h1: "¿Puede comprar seguro de vida temporal si ya tiene una condición de salud?",
      lead: "A menudo sí, a otro precio o a un monto distinto. El <strong>seguro de vida temporal</strong> cubre un número fijo de años: si fallece dentro de ese plazo y las primas están al día, la persona que nombró recibe el monto. Una condición que ya existía al solicitar <strong>no es un “no” automático</strong>. Tampoco hay un temporal sin preguntas de salud.",
      crumbEnd: "Temporal",
      take1: "El temporal cubre una necesidad con fecha — hipoteca, años de ingreso, deudas — no un funeral para siempre. El precio bajo por dólar es la razón por la que las compañías preguntan más que en un plan pequeño de entierro.",
      take2: "La palabra del diagnóstico no decide sola. Importan la fecha, el tratamiento, el tabaco, el peso y si hay un segundo problema. Un evento antiguo y estable no se lee igual que uno reciente o con complicaciones.",
      take3:
        "Si el temporal no puede emitir, el siguiente producto no es “el mismo temporal sin preguntas.” Es un plan permanente más pequeño: <a href=\"" +
        L.hub +
        "\">gastos finales</a> o, si ese cuestionario tampoco emite, <a href=\"" +
        L.gi +
        "\">aceptación garantizada</a> (sin preguntas de salud y con espera de unos dos años por muerte natural).",
      callout: "Diga el diagnóstico, el año, los medicamentos y si usa tabaco. Eso decide el producto y el precio — no el anuncio de “sin examen.”",
      needH: "La pregunta que la gente trae",
      needP1: "Las familias buscan temporal cuando hay un ingreso o una deuda que todavía tiene fecha: años de hipoteca, años hasta que los hijos dejen de depender de ese sueldo. El monto suele ser mucho más alto que un plan de entierro. Por eso el miedo con un diagnóstico es concreto: “¿Todavía puedo proteger esos años, o solo me van a vender un plan pequeño?”",
      needP2: "El resto de la página explica qué es el temporal y cómo una compañía revisa la salud. Los nombres de compañías vienen después.",
      whatH: "Qué es el temporal, y qué cuenta como condición previa",
      whatP1: "Usted paga una <strong>prima</strong> — la cuota regular. Si fallece mientras el contrato está al día y dentro del plazo, el <strong>beneficiario</strong> (la persona que nombró) recibe el <strong>beneficio de muerte</strong>: el monto del contrato. Cuando el plazo termina, esa cobertura termina. No es una cuenta de ahorro. La <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC</a> describe el temporal así: cubre uno o más años y, en general, no acumula valor en efectivo.",
      whatP2: "En el temporal habitual de estas compañías, la prima es <strong>nivelada</strong>: no sube solo porque cumpla años durante el plazo original, si paga a tiempo. Los plazos típicos son 10, 15, 20, 25 o 30 años. El monto en una cotización completa suele empezar en $100,000.",
      whatP3: "Una condición preexistente es un diagnóstico, un tratamiento o síntomas que ya existían cuando usted solicita. El CDC recuerda que muchas personas viven años con una enfermedad crónica. Eso es salud. Una aseguradora no trata la enfermedad: decide si ese historial, como queda escrito y como aparece en recetas, cabe en un producto que está dispuesta a emitir.",
      howH: "Cómo una aseguradora revisa la salud en el temporal",
      howP1: "No hay temporal de “sí automático.” Siempre hay preguntas. En montos grandes, la compañía a menudo pide más detalle — recetas ya surtidas, estatura y peso, tabaco, y a veces laboratorios o una visita de enfermería. Un “no” que debió ser “sí” puede retrasar o afectar un reclamo. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega el reclamo.",
      howP2: "El temporal vende mucho beneficio por una cuota relativamente baja. Por eso las compañías suelen ser más estrictas que en un gasto final de $10,000 o $15,000. Un diagnóstico controlado todavía puede emitir. Un evento reciente, varias condiciones juntas o un tratamiento activo pueden subir el precio, bajar el monto o cerrar este producto.",
      howP3: "Hay dos caminos reales, y ninguno es “sin historial.” Uno pide más detalle y a veces labs; suele abrir el mejor precio por dólar. El otro usa un cuestionario más corto, sin examen en el consultorio; suele costar más por dólar y cubre montos más bajos. Si ninguno puede emitir, se mira un producto permanente distinto — no se inventa un temporal sin preguntas.",
      pathsH: "Tres caminos, en lenguaje sencillo",
      path1T: "Revisión más completa",
      path1: "Más preguntas; según edad y monto, laboratorios o una visita fuera del consultorio del médico. Suele ser el mejor precio por dólar y montos de $100,000 en adelante, a veces hasta varios millones en una cotización típica. En una compañía designada, el precio más bajo que se anuncia pide, entre otras cosas, sin enfermedad de las arterias del corazón, sin diabetes y sin cáncer (salvo algunos cánceres de piel). Eso no es una promesa de que todo el mundo pague esa fila.",
      path2T: "Cuestionario más corto, sin examen en el consultorio",
      path2: "Sigue habiendo preguntas y revisión de recetas. Es más rápido. American Amicable Easy Term: plazos 10, 20 y 30 años; mínimo $25,000; tope $500,000 hasta los 45 y $300,000 desde los 46; edades 18–70 en 10 años y 18–55 en 30 años. Mutual of Omaha Term Life Express: desde $25,000; tope $550,000 a los 18–50, $450,000 a los 51–60 y $350,000 a los 61–75. Esos productos no ofrecen la fila de precio más baja de los anuncios; suelen tener solo clases de precio habituales (con o sin tabaco).",
      path3T: "Cuando el temporal no puede emitir",
      path3:
        "No hay un temporal de aceptación garantizada. La <strong>aceptación garantizada</strong> es otro producto: vida entera de emisión garantizada (GIWL). No hace preguntas de salud. El que cotizamos cubre $5,000–$25,000 a edades 50–80 y espera unos dos años por muerte natural. Si la necesidad es un funeral, no años de ingreso, empiece por <a href=\"" +
        L.hub +
        "\">gastos finales</a>.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio grande de temporal desde el día uno. Si un anuncio mezcla las dos cosas, no es un producto que cotizamos.",
      vsH: "Qué cambia entre esos caminos",
      vsCol1: "Revisión más completa",
      vsCol1Sub: "Más detalle, mejor precio por dólar",
      vsCol2: "Cuestionario corto",
      vsCol2Sub: "Sin examen en el consultorio",
      vsCol3: "Otro producto",
      vsCol3Sub: "Si el temporal no emite",
      vsR1H: "Preguntas de salud",
      vsR1A: "Sí, con más detalle",
      vsR1B: "Sí, más cortas",
      vsR1C: "Gastos finales: sí. Aceptación garantizada: no",
      vsR2H: "Examen o laboratorios",
      vsR2A: "A veces, según edad y monto",
      vsR2B: "No hay cita en el consultorio",
      vsR2C: "No en estos planes pequeños",
      vsR3H: "Montos habituales",
      vsR3A: "Desde $100,000 en cotizaciones típicas",
      vsR3B: "Desde $25,000; el tope baja con la edad",
      vsR3C: "Miles, no cientos de miles",
      vsR4H: "Si no puede emitir",
      vsR4A: "Se intenta el cuestionario corto u otro producto",
      vsR4B: "Se mira gastos finales o aceptación garantizada",
      vsR4C: "Es el plan B, no el primer intento para un historial estable",
      vsLearn: "Lea la tabla como un mapa, no como una cotización. El archivo real — fechas, recetas, tabaco — sigue decidiendo.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar con hechos suele ser la ventaja: puede abrir más monto y un precio más bajo por dólar que un plan de entierro. El límite es el mismo cuestionario: un evento reciente, tratamiento activo, varias condiciones juntas o tabaco combinado con diabetes puede cerrar el temporal. Esperar “hasta estar más sano” solo sube la edad si el diagnóstico ya está estable. Esperar sí puede importar si acaba de haber un infarto, un derrame o un cáncer en tratamiento: algunas preguntas miran ventanas de tiempo.",
      convH: "¿Se puede pasar después a una póliza que no venza?",
      convP1: "Algunos contratos temporales permiten <strong>convertir</strong>: pasar de ese temporal a una póliza permanente de la misma compañía, usando las respuestas de salud que ya dio, si lo hace dentro de la ventana del contrato. Paga el precio permanente a la edad en que convierte, no el precio viejo del temporal.",
      convP2: "Eso no sustituye pedir temporal hoy con un historial real. La ventana, los productos destino y los topes están en esa póliza. Ejemplos designados: Trendsetter Super de Transamerica y Select-a-Term de Corebridge. No todos los contratos convierten igual.",
      factorsH: "Qué puede cambiar una solicitud de temporal",
      factorsP: "Cada tarjeta empieza con la idea de salud en lenguaje sencillo y luego lista solo lo que podemos verificar en compañías designadas. Esas notas suponen que esa condición es el único factor. El peso, el tabaco, un segundo diagnóstico o varias condiciones juntas todavía pueden cambiar el precio o impedir emitir.",
      factorsNote: "Estas notas no son una cotización. La solicitud en vivo sigue decidiendo. No reimprimimos etiquetas internas de clase de precio: no ayudan al lector y cambian de compañía a compañía.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Qué podemos verificar",
      f1c: "Presión arterial alta",
      f1w: "La presión alta es frecuente. Controlada con pastillas, mucha gente sigue trabajando y viviendo años con ella.",
      f1items: [
        "Sola, el temporal a menudo sigue abierto en una revisión más completa.",
        "El precio más bajo que se anuncia en una compañía designada pide, entre otras cosas, un control estricto y sin enfermedad coronaria, diabetes ni cáncer.",
        "Diga si está controlada y con qué medicamentos.",
      ],
      f2c: "Diabetes",
      f2w: "El cuerpo no usa bien el azúcar en la sangre. El tipo 1 y el tipo 2 son enfermedades distintas; ambos pueden tratarse con comida, pastillas o insulina.",
      f2items: [
        "Casi nunca paga la fila más barata de internet: esa fila, en una compañía designada, pide entre otras cosas sin diabetes.",
        "En el temporal de cuestionario corto de Mutual of Omaha, diabetes después de los 45 junto con tabaco, un rango de peso más alto o complicaciones de circulación suele no emitir.",
        "Un plan de entierro con preguntas sigue siendo otro producto; vea la guía de <a href=\"" + L.diabetes + "\">diabetes</a> si la necesidad es funeral, no ingreso.",
      ],
      f2gap: "No publicamos una sola etiqueta de precio de Transamerica para “diabetes sola”: el gráfico interno es para agentes y la oferta real depende de fecha, control y el resto del archivo.",
      f3c: "Infarto o enfermedad del corazón",
      f3w: "Un infarto es daño al músculo del corazón por falta de sangre. Un evento de hace diez años no es lo mismo que uno de este año.",
      f3items: [
        "Un infarto antiguo, sin insuficiencia cardíaca, a menudo sigue en temporal en el mejor caso de Transamerica — suele no ser el precio más bajo de los anuncios.",
        "La insuficiencia cardíaca (el corazón no bombea bien) en ese mismo gráfico suele impedir emitir ese producto.",
        "Un stent o un bypass reciente cambian el archivo. Dígalo con el año.",
      ],
      f4c: "EPOC o enfisema",
      f4w: "La EPOC es una enfermedad pulmonar de larga duración. El enfisema es un tipo frecuente. El oxígeno en casa no es lo mismo que un inhalador.",
      f4items: [
        "En el mejor caso de Transamerica, EPOC o enfisema todavía pueden quedar en temporal, no en la fila más barata.",
        "Oxígeno por pulmón estrecha o cierra otros productos; dígalo.",
        "Tabaco junto con EPOC puede cambiar el producto más que la palabra “EPOC” sola.",
      ],
      f5c: "Cáncer",
      f5w: "Cáncer en tratamiento activo no es lo mismo que un cáncer ya tratado hace años. Algunos cánceres de piel se leen distinto a un cáncer de órgano interno.",
      f5items: [
        "Cáncer en tratamiento activo: ese temporal de Transamerica suele no emitir.",
        "Un historial ya tratado puede cotizar; el tipo y la fecha importan.",
        "El precio más bajo anunciado en Term Life Answers pide, entre otras cosas, sin cáncer salvo algunos de piel.",
      ],
      f6c: "Derrame o AIT",
      f6w: "Un derrame interrumpe la sangre al cerebro. Un AIT es un aviso breve. Lo que quedó — habla, marcha, memoria — importa tanto como la fecha.",
      f6items: [
        "Un evento antiguo no es lo mismo que uno reciente.",
        "En Transamerica, un derrame como único factor todavía puede cotizar temporal en el mejor caso, no a la tarifa más baja de internet.",
        "Diga el año y si quedó una limitación.",
      ],
      f7c: "Diálisis o fallo renal",
      f7w: "La diálisis sustituye el trabajo de los riñones cuando ya no filtran bien. No es lo mismo que un cálculo o un riñón menos.",
      f7items: [
        "En Transamerica, fallo renal o diálisis suele impedir emitir ese temporal.",
        "Entonces se mira gastos finales o aceptación garantizada, no un temporal grande.",
        "Vea también la guía de <a href=\"" + L.kidney + "\">enfermedad renal</a> si la necesidad es entierro.",
      ],
      f8c: "VIH o SIDA",
      f8w: "El VIH es el virus. El SIDA es la etapa avanzada. Los medicamentos antivirales aparecen en las recetas que las compañías ya pueden ver.",
      f8items: [
        "No cotizamos un temporal de plazo fijo designado para un diagnóstico de SIDA.",
        "En Term Life Express, ciertos antivirales de esa línea están en la lista que impide emitir.",
        "El camino habitual que cotizamos es aceptación garantizada, si hay edad y monto. Vea la guía de <a href=\"" + L.hiv + "\">VIH</a>.",
      ],
      f8gap: "No tenemos un gráfico público de otra compañía designada que emita temporal de plazo fijo para SIDA. No inventamos un “sí” para un archivo de VIH bien controlado en un producto que no cotizamos.",
      faq1q: "¿Puedo comprar temporal si ya tengo un diagnóstico?",
      faq1a: "A menudo sí, a otro precio o a un monto menor. No hay temporal sin preguntas. Cotice con la fecha, los medicamentos y el tabaco reales.",
      faq2q: "¿Hay temporal de aceptación garantizada?",
      faq2a: "No en las compañías que cotizamos. La aceptación garantizada es un producto permanente pequeño, con espera por muerte natural. Vea la guía de aceptación garantizada.",
      faq3q: "¿La diabetes me deja en el precio más bajo de internet?",
      faq3a: "Casi nunca. En una compañía designada, esa fila pide entre otras cosas sin diabetes. En el temporal de cuestionario corto de Mutual of Omaha, diabetes después de los 45 con tabaco o con complicaciones suele no emitir.",
      faq4q: "Tuve un infarto hace años. ¿Sigue el temporal?",
      faq4a: "Puede, si es antiguo y no hay insuficiencia cardíaca. Un evento reciente o un stent reciente cambian el archivo. Vea también la guía de corazón si la necesidad es entierro, no ingreso.",
      faq5q: "¿Tengo que hacer examen de sangre?",
      faq5a: "En Easy Term y Term Life Express no hay cita de laboratorio en el consultorio. En una revisión más completa, según edad y monto, sí puede haber labs. En Select-a-Term de Corebridge, si lo que ya tiene en vigor en esa compañía más lo que pide supera $1,000,000, suele pedir examen.",
      faq6q: "El temporal no pudo emitir. ¿Se acabó el seguro?",
      faq6a: "No. El siguiente paso es gastos finales con preguntas, o aceptación garantizada si esas tampoco emiten. Son productos distintos, no “el mismo temporal más barato.”",
      faq7q: "¿El VIH abre un temporal de plazo fijo?",
      faq7a: "No en lo que cotizamos para SIDA. Term Life Express excluye medicamentos de esa línea. El camino habitual es aceptación garantizada. Vea la página de VIH.",
      faq8q: "¿El tabaco solo sube el precio o también cierra el producto?",
      faq8a: "El tabaco suele ser una clase más cara, no un cierre por sí solo. Combinado — diabetes después de 45 y nicotina en Term Life Express, o EPOC y tabaco — sí puede impedir emitir. Diga nicotina de los últimos 12 meses.",
      costH: "Qué cuestan las tablas de mejor precio anunciado (no el precio de un diagnóstico)",
      costP: "Estas primas mensuales son ilustrativas de temporal con revisión más completa, no fumador, al precio más bajo que esas compañías designadas anuncian para un historial limpio. Cada celda es la más baja entre las que devolvieron cifra. Una condición previa suele impedir esa fila: el precio real suele ser más alto, o el producto no emite. Easy Term y Term Life Express se cotizan aparte y suelen costar más por dólar. No es una oferta.",
      termShow: "Muestre un plazo:",
      termFaceLabel: "Montos de temporal",
      coH: "Compañías designadas (temporal)",
      coP: "Fichas educativas. El estado, el tabaco y el historial cambian la oferta. Las licencias actuales están en la página de licencias.",
      coTaTermProduct: "Trendsetter Super",
      coTaTermAges: "18 hasta el tope del plazo (10 años: 80 no fumador)",
      coTaTermAmt: "$100,000–$5,000,000 en cotizaciones típicas",
      coTaTermExam: "Preguntas; labs posibles",
      coMooTermProduct: "Term Life Answers",
      coMooTermAges: "18 hasta el tope del plazo (10 años: 80 no fumador)",
      coMooTermAmt: "$100,000–$5,000,000 en cotizaciones típicas",
      coMooTermExam: "Preguntas; labs posibles",
      coAsTermProduct: "Term Life",
      coAsTermAges: "18 hasta el tope (10 años: 80 no fumador)",
      coAsTermAmt: "$100,000–$1,000,000",
      coAsTermExam: "Preguntas; labs posibles",
      coAmTermProduct: "Easy Term",
      coAmTermAges: "18–70 (10 años); 18–55 (30 años)",
      coAmTermAmt: "$25,000–$500,000 (tope $300,000 desde los 46)",
      coAmTermExam: "Preguntas; sin examen en consultorio",
      coTermFoot: "También hay Mutual of Omaha Term Life Express (desde $25,000; tope según edad) y Corebridge Select-a-Term (mínimo $100,000; a edades 20–59 puede omitir el examen en consultorio hasta $1,000,000). Educativo — no es cotización vinculante. No publicamos un gráfico de padecimientos de Assurity: no está en un documento público que podamos citar.",
      nextLead: "Pida una cotización de temporal con su edad, tabaco, plazo y medicamentos, o llame a Mejor Vida Seguros.",
      nextMore: "Si el monto que necesita es de entierro, no de ingreso, empiece por <a href=\"" + L.hub + "\">gastos finales con una condición de salud</a>.",
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
    title: "Term life insurance with a health condition (2026) | Mejor Vida Insurance",
    desc: "A pre-existing condition is not an automatic no on term life. What term is, how an insurer reviews health, when it often still issues, and what to do if it cannot.",
    h1: "Can you buy term life insurance if you already have a health condition?",
    lead: "Often yes, at another price or a different amount. <strong>Term life insurance</strong> covers a set number of years: if you die during that period and premiums are current, the person you named receives the amount. A condition that already existed when you apply is <strong>not an automatic no</strong>. There is also no term policy with no health questions.",
    crumbEnd: "Term",
    take1: "Term covers a need with a date — a mortgage, years of income, debts — not a funeral forever. The low price per dollar is why companies ask more than they do on a small burial plan.",
    take2: "The diagnosis word does not decide alone. The date, the treatment, tobacco, weight, and a second problem matter. An old, stable event is not read the same as a recent one or one with complications.",
    take3:
      "If term cannot issue, the next product is not “the same term with no questions.” It is a smaller permanent plan: <a href=\"" +
      L.hub +
      "\">final expense</a> or, if that questionnaire also cannot issue, <a href=\"" +
      L.gi +
      "\">guaranteed acceptance</a> (no health questions and about a two-year wait for natural death).",
    callout: "Give the diagnosis, the year, the medications, and whether you use tobacco. That decides the product and the price — not the “no exam” headline.",
    needH: "The question people actually bring",
    needP1: "Families shop term when income or a debt still has a date: years left on a mortgage, years until children no longer depend on that paycheck. The amount is usually much larger than a burial plan. So the fear with a diagnosis is concrete: “Can I still protect those years, or will I only be sold a small plan?”",
    needP2: "The rest of this page explains what term is and how a company reviews health. Company names come later.",
    whatH: "What term is, and what counts as a pre-existing condition",
    whatP1: "You pay a <strong>premium</strong> — the regular bill. If you die while the contract is current and inside the term, the <strong>beneficiary</strong> (the person you named) receives the <strong>death benefit</strong>: the contract amount. When the term ends, that coverage ends. It is not a savings account. The <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC</a> describes term this way: it covers one or more years and generally does not build cash value.",
    whatP2: "On the usual term at these companies, the premium is <strong>level</strong>: it does not rise just because you have a birthday during the original term, if you pay on time. Typical lengths are 10, 15, 20, 25, or 30 years. Amounts on a full quote often start at $100,000.",
    whatP3: "A pre-existing condition is a diagnosis, treatment, or symptoms that already existed when you apply. The CDC notes that many people live for years with a chronic disease. That is health. An insurer does not treat the disease. It decides whether that history, as written and as it appears in prescriptions, fits a product it is willing to issue.",
    howH: "How an insurer reviews health on term life",
    howP1: "There is no “automatic yes” term. There are always questions. On larger amounts, the company often wants more detail — prescriptions already filled, height and weight, tobacco, and sometimes labs or a nurse visit. A “no” that should have been “yes” can stall or affect a claim. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "Term sells a large benefit for a relatively small bill. That is why companies are usually stricter than they are on a $10,000 or $15,000 burial plan. A controlled diagnosis can still issue. A recent event, several conditions together, or active treatment can raise the price, lower the amount, or close this product.",
    howP3: "There are two real paths, and neither is “no history.” One asks for more detail and sometimes labs; it usually opens the better price per dollar. The other uses a shorter questionnaire and no in-office exam; it usually costs more per dollar and covers lower amounts. If neither can issue, we look at a different permanent product — we do not invent a no-questions term.",
    pathsH: "Three paths, in plain language",
    path1T: "A fuller health review",
    path1: "More questions; depending on age and amount, labs or a visit outside your doctor’s office. Usually the better price per dollar and amounts from $100,000 up, sometimes into the millions on a typical quote. At one appointed company, the lowest advertised price asks, among other things, for no coronary artery disease, no diabetes, and no cancer (except some skin cancers). That is not a promise everyone pays that row.",
    path2T: "A shorter questionnaire, no in-office exam",
    path2: "There are still questions and a prescription check. It is faster. American Amicable Easy Term: 10-, 20-, and 30-year terms; $25,000 minimum; $500,000 cap through age 45 and $300,000 from age 46; issue ages 18–70 on 10-year and 18–55 on 30-year. Mutual of Omaha Term Life Express: from $25,000; caps $550,000 at ages 18–50, $450,000 at 51–60, and $350,000 at 61–75. Those products do not offer the lowest advertised price row; they usually have only typical price classes (tobacco or non-tobacco).",
    path3T: "When term cannot issue",
    path3:
      "There is no guaranteed-acceptance term. <strong>Guaranteed acceptance</strong> is a different product: guaranteed-issue whole life (GIWL). It asks no health questions. The one we quote covers $5,000–$25,000 at ages 50–80 and waits about two years for natural death. If the need is a funeral, not years of income, start with <a href=\"" +
      L.hub +
      "\">final expense</a>.",
    pathsNote: "No appointed company we quote offers zero questions and a large term benefit from day one. If an ad combines both, it is not a product we quote.",
    vsH: "What changes across those paths",
    vsCol1: "Fuller review",
    vsCol1Sub: "More detail, better price per dollar",
    vsCol2: "Shorter questionnaire",
    vsCol2Sub: "No in-office exam",
    vsCol3: "A different product",
    vsCol3Sub: "If term will not issue",
    vsR1H: "Health questions",
    vsR1A: "Yes, with more detail",
    vsR1B: "Yes, shorter",
    vsR1C: "Final expense: yes. Guaranteed acceptance: no",
    vsR2H: "Exam or labs",
    vsR2A: "Sometimes, by age and amount",
    vsR2B: "No in-office lab visit",
    vsR2C: "Not on these small plans",
    vsR3H: "Typical amounts",
    vsR3A: "From $100,000 on typical quotes",
    vsR3B: "From $25,000; the cap falls with age",
    vsR3C: "Thousands, not hundreds of thousands",
    vsR4H: "If it cannot issue",
    vsR4A: "Try the shorter questionnaire or another product",
    vsR4B: "Look at final expense or guaranteed acceptance",
    vsR4C: "This is plan B, not the first try for a stable history",
    vsLearn: "Read the chart as a map, not a quote. The live file — dates, prescriptions, tobacco — still decides.",
    considerH: "What helps, and what does not",
    considerP: "Answering with facts is usually the advantage: you may open a larger amount and a lower price per dollar than a burial plan. The limitation is the same questionnaire: a recent event, active treatment, several conditions together, or tobacco combined with diabetes can close term. Waiting “until I am healthier” only raises the age if the diagnosis is already stable. Waiting can matter if there has just been a heart attack, a stroke, or cancer in treatment: some questions look at time windows.",
    convH: "Can you later switch to a policy that does not expire?",
    convP1: "Some term contracts allow <strong>conversion</strong>: moving from that term policy to a permanent policy at the same company, using the health answers you already gave, if you do it inside the contract window. You pay the permanent price at the age you convert, not the old term price.",
    convP2: "That does not replace applying for term today with a real history. The window, the destination products, and the caps are in that policy. Appointed examples: Transamerica Trendsetter Super and Corebridge Select-a-Term. Not every contract converts the same way.",
    factorsH: "What can change a term application",
    factorsP: "Each card starts with the health idea in plain language, then lists only what we can verify at appointed companies. Those notes assume that condition is the only factor. Weight, tobacco, a second diagnosis, or several conditions together can still change the price or stop issue.",
    factorsNote: "These notes are not a quote. A live application still decides. We do not reprint internal price-class labels: they do not help the reader and they change from company to company.",
    fMeaning: "In plain language",
    fVerify: "What we can verify",
    f1c: "High blood pressure",
    f1w: "High blood pressure is common. Controlled with pills, many people work and live with it for years.",
    f1items: [
      "Alone, term often stays open on a fuller review.",
      "The lowest advertised price at one appointed company asks, among other things, for tight control and no coronary disease, diabetes, or cancer.",
      "Say whether it is controlled and which medications you take.",
    ],
    f2c: "Diabetes",
    f2w: "The body does not use blood sugar well. Type 1 and type 2 are different diseases; both may be treated with food, pills, or insulin.",
    f2items: [
      "It almost never pays the cheapest internet row: that row, at one appointed company, asks among other things for no diabetes.",
      "On Mutual of Omaha’s shorter-questionnaire term, diabetes after age 45 plus tobacco, a higher weight range, or circulation complications typically will not issue.",
      "A burial plan with questions is a different product; see the <a href=\"" + L.diabetes + "\">diabetes</a> guide if the need is a funeral, not income.",
    ],
    f2gap: "We do not publish one Transamerica price label for “diabetes alone”: that chart is for agents, and the live offer still depends on date, control, and the rest of the file.",
    f3c: "Heart attack or heart disease",
    f3w: "A heart attack is damage to the heart muscle from a lack of blood. An event ten years ago is not the same as one this year.",
    f3items: [
      "An old heart attack, without heart failure, can still be term in Transamerica’s best case — usually not the lowest advertised price.",
      "Heart failure (the heart does not pump well) on that same chart typically stops that product from issuing.",
      "A recent stent or bypass changes the file. Give the year.",
    ],
    f4c: "COPD or emphysema",
    f4w: "COPD is a long-term lung disease. Emphysema is a common type. Oxygen at home is not the same as an inhaler.",
    f4items: [
      "In Transamerica’s best case, COPD or emphysema can still be term, not the cheapest row.",
      "Oxygen for a lung condition narrows or closes other products; say so.",
      "Tobacco together with COPD can change the product more than the word “COPD” alone.",
    ],
    f5c: "Cancer",
    f5w: "Cancer in active treatment is not the same as cancer treated years ago. Some skin cancers are read differently from an internal-organ cancer.",
    f5items: [
      "Cancer in active treatment: that Transamerica term product typically will not issue.",
      "A treated history can still quote; the type and the date matter.",
      "The lowest advertised price on Term Life Answers asks, among other things, for no cancer except some skin cancers.",
    ],
    f6c: "Stroke or TIA",
    f6w: "A stroke interrupts blood to the brain. A TIA is a brief warning. What remained — speech, walking, memory — matters as much as the date.",
    f6items: [
      "An old event is not the same as a recent one.",
      "On Transamerica, a stroke as the only factor can still quote term in the best case, not at the lowest internet rate.",
      "Give the year and whether a limitation remained.",
    ],
    f7c: "Dialysis or kidney failure",
    f7w: "Dialysis replaces the work of the kidneys when they no longer filter well. It is not the same as a stone or one kidney.",
    f7items: [
      "On Transamerica, kidney failure or dialysis typically stops that term product from issuing.",
      "Then look at final expense or guaranteed acceptance, not large term.",
      "See also the <a href=\"" + L.kidney + "\">kidney disease</a> guide if the need is burial.",
    ],
    f8c: "HIV or AIDS",
    f8w: "HIV is the virus. AIDS is the later stage. Antiviral medications show up in the prescriptions companies can already see.",
    f8items: [
      "We do not quote an appointed fixed-term plan for an AIDS diagnosis.",
      "On Term Life Express, certain antivirals in that line are on the list that stops issue.",
      "The usual path we quote is guaranteed acceptance, if age and amount fit. See the <a href=\"" + L.hiv + "\">HIV</a> guide.",
    ],
    f8gap: "We do not have a public chart from another appointed company that issues fixed-term coverage for AIDS. We will not invent a “yes” for a well-controlled HIV file on a product we do not quote.",
    faq1q: "Can I buy term if I already have a diagnosis?",
    faq1a: "Often yes, at another price or a smaller amount. There is no no-questions term. Quote with the real date, medications, and tobacco.",
    faq2q: "Is there guaranteed-acceptance term?",
    faq2a: "Not at the companies we quote. Guaranteed acceptance is a small permanent product with a wait for natural death. See the guaranteed-acceptance guide.",
    faq3q: "Does diabetes get me the lowest internet rate?",
    faq3a: "Almost never. At one appointed company, that row asks among other things for no diabetes. On Mutual of Omaha’s shorter-questionnaire term, diabetes after age 45 with tobacco or with complications typically will not issue.",
    faq4q: "I had a heart attack years ago. Is term still open?",
    faq4a: "It can be, if it is old and there is no heart failure. A recent event or a recent stent changes the file. See also the heart guide if the need is burial, not income.",
    faq5q: "Do I have to do a blood test?",
    faq5a: "On Easy Term and Term Life Express there is no in-office lab visit. On a fuller review, depending on age and amount, there may be labs. On Corebridge Select-a-Term, if what you already have in force at that company plus what you apply for exceeds $1,000,000, an exam is usually required.",
    faq6q: "Term could not issue. Is insurance over?",
    faq6a: "No. The next step is final expense with questions, or guaranteed acceptance if those cannot issue either. Those are different products, not “the same term cheaper.”",
    faq7q: "Does HIV open a fixed-term plan?",
    faq7a: "Not on what we quote for AIDS. Term Life Express excludes medications in that line. The usual path is guaranteed acceptance. See the HIV page.",
    faq8q: "Does tobacco only raise the price, or can it close the product?",
    faq8a: "Tobacco is usually a higher price class, not a close by itself. Combined — diabetes after 45 and nicotine on Term Life Express, or COPD and tobacco — it can stop issue. Say nicotine in the last 12 months.",
    costH: "What the lowest advertised tables cost (not the price of a diagnosis)",
    costP: "These monthly premiums are illustrative of term with a fuller review, non-tobacco, at the lowest price those appointed companies advertise for a clean history. Each cell is the lowest among companies that returned a figure. A pre-existing condition usually blocks that row: the real price is often higher, or the product does not issue. Easy Term and Term Life Express are quoted separately and usually cost more per dollar. Not an offer.",
    termShow: "Show a term:",
    termFaceLabel: "Term amounts",
    coH: "Appointed companies (term)",
    coP: "Educational cards. State, tobacco, and history change the offer. Current licenses are on the licenses page.",
    coTaTermProduct: "Trendsetter Super",
    coTaTermAges: "18 through the term maximum (10-year: 80 non-tobacco)",
    coTaTermAmt: "$100,000–$5,000,000 on typical quotes",
    coTaTermExam: "Questions; labs possible",
    coMooTermProduct: "Term Life Answers",
    coMooTermAges: "18 through the term maximum (10-year: 80 non-tobacco)",
    coMooTermAmt: "$100,000–$5,000,000 on typical quotes",
    coMooTermExam: "Questions; labs possible",
    coAsTermProduct: "Term Life",
    coAsTermAges: "18 through the maximum (10-year: 80 non-tobacco)",
    coAsTermAmt: "$100,000–$1,000,000",
    coAsTermExam: "Questions; labs possible",
    coAmTermProduct: "Easy Term",
    coAmTermAges: "18–70 (10-year); 18–55 (30-year)",
    coAmTermAmt: "$25,000–$500,000 ($300,000 cap from age 46)",
    coAmTermExam: "Questions; no in-office exam",
    coTermFoot: "Also Mutual of Omaha Term Life Express (from $25,000; cap by age) and Corebridge Select-a-Term ($100,000 minimum; at ages 20–59 it may skip an in-office exam up to $1,000,000). Educational — not a binding quote. We do not publish an Assurity condition chart: it is not in a public document we can cite.",
    nextLead: "Ask for a term quote with your age, tobacco, term length, and medications, or call Mejor Vida Insurance.",
    nextMore: "If the amount you need is burial, not income, start with <a href=\"" + L.hub + "\">final expense with a health condition</a>.",
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
${planCompareHtml(c)}
</section>
<section class="lic-section" id="consider">
<h2>${c.considerH}</h2>
<p>${c.considerP}</p>
</section>
<section class="lic-section" id="convert">
<h2>${c.convH}</h2>
<p>${c.convP1}</p>
<p>${c.convP2}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
<section class="lic-section" id="factors">
<h2>${c.factorsH}</h2>
<p>${c.factorsP}</p>
${factorCardsHtml(c)}
<p class="lic-rate-note">${c.factorsNote}</p>
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
    omitFaq: true,
    quoteHref: L.termQuote,
    toc: isEs
      ? [
          ["#need", "La pregunta"],
          ["#how", "Cómo funciona"],
          ["#paths", "Caminos"],
          ["#faq", "Preguntas"],
          ["#factors", "Qué importa"],
          ["#cost", "Costo"],
        ]
      : [
          ["#need", "The question"],
          ["#how", "How it works"],
          ["#paths", "Paths"],
          ["#faq", "Questions"],
          ["#factors", "What matters"],
          ["#cost", "Cost"],
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

function teachConditionMain(lang, page, c, opts) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const showSi = !(opts && opts.showSi === false);
  const useGiRates = !!(opts && opts.useGiRates);
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
${showSi ? appointedCardsHtml(lang, c) : ""}
${giCardHtml(lang, c)}
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<p class="lic-cost-lesson">${c.costLearn}</p>
${useGiRates ? giRateBlock(c, L.quote) : feRateBlock(c, L.quote)}
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
      ? '<a href="https://www.ssa.gov/disability/" rel="noopener" target="_blank">Seguro Social: discapacidad (SSDI)</a> — un ingreso mensual si una discapacidad limita el trabajo; no es una regla de una aseguradora.'
      : '<a href="https://www.ssa.gov/disability/" rel="noopener" target="_blank">Social Security: Disability (SSDI)</a> — a monthly payment if a disability limits work; not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.cdc.gov/disability-and-health/about/index.html" rel="noopener" target="_blank">CDC: qué es una discapacidad</a> — movilidad, visión, audición, memoria y más; dos personas con la misma etiqueta no son el mismo archivo.'
      : '<a href="https://www.cdc.gov/disability-and-health/about/index.html" rel="noopener" target="_blank">CDC: what disability is</a> — movement, vision, hearing, memory, and more; two people with the same label are not the same file.',
    src4: "",
    src5: "",
    src6: "",
  });
  src.src4 = "";
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
      title: "Seguro de gastos finales si tiene una discapacidad (2026) | Mejor Vida Seguros",
      desc: "Una discapacidad no es una sola casilla de seguro. Cómo funciona gastos finales, qué cambian la silla, la ayuda diaria y dónde vive, y cuándo hay que decir que no lo sabemos.",
      h1: "¿Puede comprar gastos finales si tiene una discapacidad?",
      lead: "A menudo sí hay un producto, pero no siempre el mismo. El CDC describe una <strong>discapacidad</strong> como una condición del cuerpo o de la mente que dificulta ciertas actividades o la vida diaria. El Seguro Social paga un ingreso mensual — <strong>SSDI</strong> — si esa condición limita el trabajo. En un seguro de entierro de monto pequeño, la pregunta útil no es “¿está discapacitado?” sino <strong>cómo se mueve, quién le ayuda y dónde vive</strong>.",
      crumbEnd: "Discapacidad",
      take1: "El plan que muchas familias quieren primero es un <strong>plan nivelado</strong>: una póliza con un cuestionario corto de salud que puede pagar el monto completo desde el primer pago cubierto, casi siempre sin espera de dos años.",
      take2: "El cheque de SSDI no es un “no” en ese cuestionario. El seguro pregunta hechos: silla de ruedas, ayuda para bañarse o vestirse, residencia, y si puede firmar.",
      take3: "Las compañías que cotizamos no tratan igual una silla de ruedas. No inventamos un “sí” nacional. Cuéntenos por qué la usa y si alguien le ayuda.",
      callout: "No compre un plan de <strong>aceptación garantizada</strong> — sin preguntas de salud y con unos dos años de espera por muerte natural — solo porque oyó “discapacidad.” Si vive en casa sin ayuda médica diaria, cotice primero el plan con preguntas.",
      needH: "La preocupación real",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. Gastos finales es vida permanente de monto pequeño, pensada para esa factura — no paga un cheque mensual de discapacidad ni sustituye el SSDI.",
      needP2: "Un diagnóstico o una limitación que usted ya tiene se llama a menudo <strong>condición preexistente</strong>. Esa etiqueta no significa, por sí sola, una espera de dos años. El miedo suele ser: “Con una discapacidad, ¿solo me venden un plan que espera?” El resto de la página explica esa diferencia <strong>antes</strong> de nombrar compañías.",
      whatH: "Qué significa “discapacidad” para su salud — y para el Seguro Social",
      whatP1: "El CDC explica que la discapacidad puede afectar la visión, el movimiento, la memoria, el oído, el aprendizaje o la salud mental. Dos personas con la misma palabra en un formulario pueden vivir de formas muy distintas. Una persona sorda que vive sola no es el mismo archivo que alguien en hospicio.",
      whatP2: "El Seguro Social usa otra pregunta: si la condición limita el trabajo lo bastante para un ingreso mensual. Ese programa se llama SSDI. Un “sí” de esa agencia no es una respuesta de seguro de vida. El SSA no decide si una póliza de entierro emite.",
      whatP3: "Una aseguradora no trata la discapacidad. Decide si el historial, como queda escrito y como aparece en las recetas ya surtidas, cabe en un producto que está dispuesta a emitir. No le pide la carta de aprobación del SSA en el consultorio de la agencia.",
      howH: "Cómo mira el seguro de vida un historial de salud",
      howP1: "En gastos finales el camino habitual no es un examen en el consultorio. Hay un cuestionario corto y, en la mayoría de los productos que cotizamos, una revisión de recetas. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega un reclamo.",
      howP2: "Si esas preguntas se pueden contestar sin chocar con lo que ese producto no puede emitir, el plan suele ser el nivelado: el monto completo puede aplicar a una muerte natural cubierta desde el primer pago. Si no puede emitir así, algunos productos pagan menos o devuelven primas en los primeros años. Si tampoco puede emitir, un plan de aceptación garantizada no hace preguntas de salud y espera unos dos años por muerte natural.",
      howP3: "El seguro temporal con montos más altos es otro producto: a veces hay laboratorios. Una discapacidad grave, o no poder firmar, suele estrechar ese camino. Si la necesidad es ingreso o hipoteca, no entierro, vea <a href=\"" + L.termCond + "\">temporal con condiciones previas</a>.",
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
      vsR3H: "Si vive en casa sin ayuda médica diaria",
      vsR3A: "A menudo el primer intento, si el resto del historial cabe.",
      vsR3B: "Algunos productos usan este camino cuando el historial es más pesado.",
      vsR3C: "Reserva para cuando el cuestionario no puede emitir — incluso con silla, residencia o si no puede firmar.",
      vsR4H: "Precio, en términos generales",
      vsR4A: "Suele ser el más bajo por dólar de estos tres, si califica.",
      vsR4B: "Varía. No inventamos una prima de muestra aquí.",
      vsR4C: "Suele costar más por dólar, a la misma edad y monto.",
      vsLearn: "Esta tabla enseña la diferencia entre los tres caminos. No es una cotización. Cómo se mueve, quién le ayuda y dónde vive todavía pueden cambiar la columna.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Los anuncios que mezclan las dos cosas casi siempre siguen teniendo cuestionario.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja cuando vive en casa, puede firmar y no hay ayuda médica diaria: puede abrir más monto, un precio más bajo y el beneficio completo desde el primer pago cubierto. El límite es que el mismo cuestionario puede mandarlo a una espera o a aceptación garantizada si hay silla por una enfermedad larga, ayuda para bañarse, una residencia ahora, o si la memoria impide firmar. Esperar a “verse más independiente” sube la edad. Omitir la silla no borra las recetas ni las bases que la compañía ya puede ver.",
      split1H: "Suele seguir siendo un plan con preguntas",
      split1a: "Una discapacidad de oído o de visión, viviendo en casa sin cuidado médico diario.",
      split1b: "SSDI por un problema de espalda o de trabajo, si camina sin silla y nadie le ayuda a bañarse.",
      split1c: "Una prótesis o una amputación por un accidente antiguo — descríbala como accidente, no como una enfermedad, si ese es el hecho.",
      split2H: "Suele cambiar la conversación",
      split2a: "Silla de ruedas, scooter o cama por una enfermedad larga — no por una lesión de unas semanas.",
      split2b: "Otra persona le ayuda a bañarse, vestirse, tomar pastillas o alimentarse, o hay enfermería en el hogar ahora.",
      split2c: "Hospital, residencia con cuidado, hospicio, o no poder firmar por la memoria.",
      factorsH: "Qué puede cambiar una solicitud si hay una discapacidad",
      factorsP: "Cada tarjeta empieza con la idea de salud. A la derecha va solo lo que podemos afirmar para los productos de entierro que cotizamos. Si las compañías no coinciden, lo decimos.",
      factorsNote: "Estas notas no son una cotización. Edad, peso y un segundo diagnóstico todavía pueden cambiar el resultado.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Lo que podemos afirmar",
      f1c: "El cheque del Seguro Social",
      f1w: "El SSA describe el SSDI como un pago mensual si una discapacidad limita el trabajo. Eso es un programa de ingresos, no una póliza de vida.",
      f1items: [
        "Ningún producto que cotizamos pregunta “¿cobra SSDI?” como si eso, solo, cerrara el plan.",
        "Lo que sí pregunta es cómo se mueve, quién le ayuda, dónde vive y las recetas. Diga el cheque y esos hechos. No son lo mismo.",
      ],
      f2c: "Silla de ruedas o scooter",
      f2w: "El CDC nombra el movimiento como una forma de discapacidad. Una silla por artritis no es el mismo archivo que una silla por un accidente de hace un mes.",
      f2items: [
        "En Transamerica Immediate Solution, una silla o un scooter eléctrico todavía puede dejar un plan con preguntas que paga completo si no necesita ayuda de otra persona. Si hay ayuda, ese producto lo mira como cuidado en casa o en residencia: ahora, no puede emitir.",
        "En Americo Eagle Select, depender de una silla o de un aparato motorizado en los últimos 12 meses está entre las situaciones que impiden emitir ese producto.",
      ],
      f2gap: "No vamos a afirmar un sí o un no de Accendo o de Living Promise por la silla sola. Cotice con el motivo real — enfermedad larga o lesión breve.",
      f3c: "Ayuda para bañarse, vestirse o las pastillas",
      f3w: "El CDC habla de limitaciones para el cuidado personal. El seguro pregunta si otra persona — profesional, familiar o amigo — le ayuda con esas tareas o con medicinas y heridas.",
      f3items: [
        "En Transamerica Immediate Solution, el cuidado médico en casa ahora — incluyendo ordenar pastillas, tomar la presión o el azúcar, dar medicamentos, cuidar heridas o una sonda de alimentación — no puede emitir ese producto.",
        "En Americo Eagle Select, ayuda para bañarse, ir al baño o vestirse por una enfermedad debilitante, o estar en cama, en los últimos 12 meses, impide emitir ese producto.",
      ],
      f4c: "Dónde vive ahora",
      f4w: "Un apartamento propio no es el mismo hecho que un hospital, un hospicio o una residencia con cuidado médico.",
      f4items: [
        "En Transamerica Immediate Solution, estar ahora en una residencia de cuidado, un centro de larga estancia o con ese tipo de cuidado en casa no puede emitir.",
        "Estar internado ahora también cierra el plan con preguntas en Transamerica Immediate Solution y, en los últimos 12 meses, en Americo Eagle Select.",
      ],
      f5c: "Memoria y quién firma",
      f5w: "El CDC incluye pensar y recordar entre las formas de discapacidad. El seguro pregunta si la persona asegurada puede entender y firmar la solicitud.",
      f5items: [
        "En Transamerica Immediate Solution, Alzheimer, demencia, pérdida de memoria, un trastorno cognitivo o no poder decidir por sí mismo no pueden emitir ese producto.",
        "En Americo Eagle Select, Alzheimer o demencia están entre las situaciones que impiden emitir.",
        "En Accendo, varios medicamentos usados para Alzheimer o demencia impiden completar esa solicitud. Un poder notarial no sustituye la firma de la persona asegurada en esa solicitud.",
      ],
      f5gap: "No vamos a afirmar que un hijo puede “firmar por papá” en todas las compañías. Si no puede firmar, el camino habitual que cotizamos es aceptación garantizada entre los 50 y los 80 años — y esa persona todavía tiene que poder completar lo que esa solicitud pide.",
      f6c: "Amputación o prótesis",
      f6w: "El CDC nombra la pérdida de un miembro como un tipo de discapacidad. El motivo importa: un accidente no es lo mismo que una enfermedad.",
      f6items: [
        "En Transamerica Immediate Solution, una amputación que no es por accidente o trauma no puede emitir.",
        "En Americo Eagle Select, una amputación por enfermedad está entre las situaciones que impiden emitir.",
      ],
      f6gap: "Una prótesis por un choque antiguo se describe como accidente. Una amputación por diabetes se describe como enfermedad. No mezcle las dos frases.",
      f7c: "Parkinson, esclerosis múltiple o ALS",
      f7w: "El CDC agrupa condiciones que pueden ser progresivas. El seguro no usa una sola casilla de “neurológico.”",
      f7items: [
        "En Americo Eagle Select, Parkinson, esclerosis múltiple y ALS están entre las situaciones que impiden emitir ese producto.",
        "En Transamerica Immediate Solution, ALS no puede emitir. Down syndrome tampoco.",
        "Living Promise lista Parkinson, esclerosis múltiple, distrofia muscular y parálisis entre los padecimientos que pueden ajustar o no emitir. No afirmamos que Living Promise siempre deje el plan que paga completo.",
      ],
      f7gap: "No vamos a inventar cómo Transamerica Immediate Solution trata Parkinson o esclerosis múltiple cuando no hay una fila pública con ese nombre. Cotice el diagnóstico exacto.",
      f8c: "Cómo se paga la prima",
      f8w: "Algunas personas reciben el SSDI en una tarjeta del Tesoro. Eso es un método de pago, no un diagnóstico.",
      f8items: [
        "Accendo no acepta tarjetas de crédito o débito para esa prima, incluida la tarjeta Direct Express del Seguro Social.",
        "Transamerica Immediate Solution sí permite pagar con Direct Express, además de cuenta bancaria.",
      ],
      f8gap: "No vamos a decir que “casi ninguna compañía” acepta esa tarjeta. Pregunte en la cotización qué método queda abierto en el producto que califica.",
      costH: "Precios mensuales de muestra si emite un plan con preguntas",
      costP: "Estas cifras son primas mensuales ilustrativas, no fumador, para un plan de gastos finales que puede pagar completo si el cuestionario emite. Léalas como el tamaño del producto por edad y sexo — no como el “precio de tener una discapacidad.” Si hay silla por enfermedad, ayuda diaria o una residencia ahora, no asuma estas filas.",
      costLearn: "Qué debe aprender de esta tabla: a la misma cobertura, el mes sube con la edad, y los hombres suelen pagar más que las mujeres. El tabaco (no mostrado aquí) sube otra vez. Algunos montos se calculan a partir de una banda publicada. No es una oferta.",
      costFoot: "Un plan de aceptación garantizada, a la misma edad y monto, suele costar más y espera unos dos años por muerte natural. Use esa tabla si el cuestionario no puede emitir.",
      coH: "Compañías que podemos cotizar",
      coP: "Después de entender los tres caminos, estas son compañías designadas que Mejor Vida Seguros puede cotizar. Con una discapacidad, no todas emiten el mismo tipo de plan. Edades y montos cambian. La aprobación no está garantizada.",
      faq1q: "Cobro SSDI. ¿Me van a rechazar?",
      faq1a: "No por el cheque. Rechazan — o mandan a un plan sin preguntas — por lo que el cuestionario y las recetas muestran: silla por enfermedad, ayuda para bañarse, una residencia, demencia, oxígeno o un cáncer activo. Diga ambos hechos.",
      faq2q: "Uso silla de ruedas por artritis. ¿Hay espera?",
      faq2a: "En un producto que cotizamos, la silla todavía puede dejar un plan con preguntas que paga completo si nadie le ayuda. En otro, depender de una silla en los últimos 12 meses cierra ese producto. No afirmamos un “sí” nacional. Cotice con el motivo y si hay ayuda.",
      faq3q: "¿Puede un hijo ser dueño si yo no puedo firmar?",
      faq3a: "Si la memoria o la capacidad de decidir impiden firmar, el plan con preguntas suele no emitir. En Accendo, un poder notarial no sustituye esa firma. El camino habitual que cotizamos es aceptación garantizada entre los 50 y los 80, si esa solicitud todavía se puede completar.",
      faq4q: "Tengo una prótesis por un accidente de tráfico. ¿Es lo mismo que una silla por diabetes?",
      faq4a: "No. Una amputación por accidente no es el mismo archivo que una amputación por enfermedad. En dos productos que cotizamos, la amputación por enfermedad no puede emitir. Sea preciso.",
      faq5q: "¿Este seguro paga la discapacidad mes a mes?",
      faq5a: "No. Eso sería un seguro de discapacidad, otro producto. Gastos finales paga un monto a los beneficiarios cuando usted fallece. Tampoco sustituye el SSDI.",
      faq6q: "Vivo en una residencia con cuidado. ¿Qué producto?",
      faq6a: "En Transamerica Immediate Solution, ese cuidado ahora no puede emitir. En otros productos con preguntas, una residencia o enfermería en el hogar también suele cerrar el camino. La aceptación garantizada puede seguir abierta entre los 50 y los 80.",
      faq7q: "¿Puedo pagar con la tarjeta Direct Express?",
      faq7a: "Depende del producto. Transamerica Immediate Solution puede aceptarla. Accendo no acepta esa tarjeta ni otras de débito o crédito para esa prima. Pregunte en la cotización. No afirmamos que “casi nadie” la acepte.",
      faq8q: "Tengo Parkinson. ¿Hay un plan con preguntas?",
      faq8a: "En Americo Eagle Select, Parkinson impide emitir. En Living Promise está entre los padecimientos que pueden ajustar o no emitir. No inventamos cómo Transamerica Immediate Solution trata Parkinson si no hay una fila pública con ese nombre. Cotice el diagnóstico exacto y si hay silla o ayuda diaria.",
      nextLead: "Vea precios, o programe una llamada con Mejor Vida Seguros. Mencione cómo se mueve, quién le ayuda, dónde vive y si puede firmar.",
      nextMore: `Si hay silla por enfermedad, residencia o no puede firmar, el plan de aceptación garantizada puede seguir abierto entre los 50 y los 80 años. Índice: <a href="${L.hub}">condiciones preexistentes</a>. También <a href="${L.stroke}">derrame</a> y <a href="${L.copd}">EPOC</a> si aplican.`,
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
    title: "Final expense insurance if you have a disability (2026) | Mejor Vida Insurance",
    desc: "A disability is not one insurance checkbox. How final expense works, what a wheelchair, daily help, and where you live change, and when we will say we do not know.",
    h1: "Can you buy final expense insurance if you have a disability?",
    lead: "Often there is a product, but not always the same one. The CDC describes a <strong>disability</strong> as a condition of the body or mind that makes certain activities or daily life harder. Social Security pays a monthly income — <strong>SSDI</strong> — if that condition limits work. On a small burial-size life policy, the useful question is not “are you disabled?” It is <strong>how you move, who helps you, and where you live</strong>.",
    crumbEnd: "Disability",
    take1: "The plan many families want first is a <strong>level plan</strong>: a policy with a short health questionnaire that can pay the full amount from the first covered payment, usually with no two-year wait.",
    take2: "An SSDI check is not a “no” on that questionnaire. Insurance asks for facts: a wheelchair, help bathing or dressing, a care facility, and whether you can sign.",
    take3: "The companies we quote do not all treat a wheelchair the same way. We will not invent a national yes. Tell us why you use it and whether anyone helps you.",
    callout: "Do not buy a <strong>guaranteed-acceptance</strong> plan — no health questions, and about a two-year wait for natural death — just because you heard “disability.” If you live at home without daily medical help, quote a plan with health questions first.",
    needH: "The worry people actually have",
    needP1: "Families look for this coverage because a funeral, the cemetery, and small debts can fall on relatives. Final expense is permanent life insurance in a small amount, meant for that bill — it does not pay a monthly disability check and it does not replace SSDI.",
    needP2: "A diagnosis or limitation you already have is often called a <strong>pre-existing condition</strong>. That label does not, by itself, mean a two-year wait. The fear is usually: “With a disability, will they only sell me a plan that waits?” The rest of this page explains that difference <strong>before</strong> naming companies.",
    whatH: "What “disability” means for your health — and for Social Security",
    whatP1: "The CDC explains that disability can affect vision, movement, memory, hearing, learning, or mental health. Two people with the same word on a form can live in very different ways. A deaf person who lives alone is not the same file as someone in hospice.",
    whatP2: "Social Security asks a different question: whether the condition limits work enough for a monthly income. That program is called SSDI. A “yes” from that agency is not a life-insurance answer. SSA does not decide whether a burial policy issues.",
    whatP3: "An insurer does not treat the disability. It decides whether the history, as it is written and as it appears in prescriptions already filled, fits a product it is willing to issue. It does not ask for the SSA award letter at the agency office.",
    howH: "How life insurance reviews a health history",
    howP1: "On final expense the usual path is not an office exam. There is a short questionnaire and, on most products we quote, a review of prescriptions. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "If those questions can be answered without hitting what that product cannot issue, the plan is usually level: the full amount can apply to a covered natural death from the first payment. If it cannot issue that way, some products pay less or return premiums in the first years. If even that cannot issue, a guaranteed-acceptance plan asks no health questions and waits about two years for natural death.",
    howP3: "Term life at larger amounts is a different product: sometimes there are labs. A serious disability, or being unable to sign, often narrows that path. If the need is income or a mortgage, not burial, see <a href=\"" + L.termCond + "\">term life with pre-existing conditions</a>.",
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
    vsR3H: "If you live at home without daily medical help",
    vsR3A: "Often the first try, if the rest of the history fits.",
    vsR3B: "Some products use this path when the history is heavier.",
    vsR3C: "Held for when the questionnaire cannot issue — including with a wheelchair, a facility, or if you cannot sign.",
    vsR4H: "Price, in plain terms",
    vsR4A: "Usually the lowest per dollar of these three, if you qualify.",
    vsR4B: "It varies. We will not invent a sample premium here.",
    vsR4C: "Usually costs more per dollar, at the same age and amount.",
    vsLearn: "This chart teaches the difference among the three paths. It is not a quote. How you move, who helps you, and where you live can still change the column.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. Ads that combine both almost always still have a questionnaire.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage when you live at home, can sign, and do not have daily medical help: it can open more coverage, a lower price, and a full benefit from the first covered payment. The limitation is that the same questionnaire can send you to a wait or to guaranteed acceptance if there is a wheelchair from a long-term illness, help bathing, a facility now, or memory that keeps you from signing. Waiting to “look more independent” raises the age. Skipping the wheelchair on the form does not erase prescriptions or records a company can already see.",
    split1H: "Usually still a plan with questions",
    split1a: "A hearing or vision disability, living at home without daily medical care.",
    split1b: "SSDI for a back or work problem, if you walk without a chair and no one helps you bathe.",
    split1c: "A prosthesis or an amputation from an old accident — describe it as an accident, not as a disease, if that is the fact.",
    split2H: "Usually changes the conversation",
    split2a: "A wheelchair, scooter, or bed from a long-term illness — not from a weeks-long injury.",
    split2b: "Someone else helps you bathe, dress, take pills, or eat, or there is medical care in the home now.",
    split2c: "A hospital, a care facility, hospice, or being unable to sign because of memory.",
    factorsH: "What can change an application if there is a disability",
    factorsP: "Each card starts with the health idea. The right side lists only what we can state for the burial products we quote. If companies do not agree, we say so.",
    factorsNote: "These notes are not a quote. Age, height and weight, and a second diagnosis can still change the result.",
    fMeaning: "In plain language",
    fVerify: "What we can state",
    f1c: "The Social Security check",
    f1w: "SSA describes SSDI as a monthly payment if a disability limits work. That is an income program, not a life policy.",
    f1items: [
      "None of the products we quote treat “Do you collect SSDI?” as a standalone close.",
      "What they do ask is how you move, who helps, where you live, and the prescriptions. Say the check and those facts. They are not the same.",
    ],
    f2c: "A wheelchair or scooter",
    f2w: "The CDC names movement as one form of disability. A chair from arthritis is not the same file as a chair from a crash a month ago.",
    f2items: [
      "On Transamerica Immediate Solution, a wheelchair or electric scooter can still leave a health-question plan that pays in full if you do not need help from another person. If there is help, that product reads it as care at home or in a facility: current, it cannot issue.",
      "On Americo Eagle Select, depending on a wheelchair or a motorized mobility device in the last 12 months is among the situations that stop that product from issuing.",
    ],
    f2gap: "We will not state a yes or no for Accendo or Living Promise on the chair alone. Quote with the real reason — long-term illness or a short injury.",
    f3c: "Help bathing, dressing, or with pills",
    f3w: "The CDC talks about limits on self-care. Insurance asks whether another person — a professional, a relative, or a friend — helps with those tasks or with medicines and wounds.",
    f3items: [
      "On Transamerica Immediate Solution, medical care in the home now — including arranging pills, taking blood pressure or sugar, giving medicines, wound care, or a feeding tube — cannot issue that product.",
      "On Americo Eagle Select, help bathing, toileting, or dressing because of a debilitating disease, or being bed-bound, in the last 12 months, stops that product from issuing.",
    ],
    f4c: "Where you live now",
    f4w: "Your own apartment is not the same fact as a hospital, hospice, or a facility with medical care.",
    f4items: [
      "On Transamerica Immediate Solution, being in a care facility, a long-term care setting, or that kind of care at home now cannot issue.",
      "Being in the hospital now also closes the health-question plan on Transamerica Immediate Solution and, in the last 12 months, on Americo Eagle Select.",
    ],
    f5c: "Memory and who signs",
    f5w: "The CDC includes thinking and remembering among forms of disability. Insurance asks whether the insured person can understand and sign the application.",
    f5items: [
      "On Transamerica Immediate Solution, Alzheimer’s, dementia, memory loss, a cognitive disorder, or being unable to decide for yourself cannot issue that product.",
      "On Americo Eagle Select, Alzheimer’s or dementia is among the situations that stop that product from issuing.",
      "On Accendo, several medicines used for Alzheimer’s or dementia stop that application from being completed. A power of attorney does not replace the insured person’s signature on that application.",
    ],
    f5gap: "We will not claim a child can “sign for Dad” at every company. If you cannot sign, the usual path we quote is guaranteed acceptance from ages 50 to 80 — and that person still has to complete what that application asks.",
    f6c: "Amputation or a prosthesis",
    f6w: "The CDC names loss of a limb as a type of disability. The reason matters: an accident is not the same as a disease.",
    f6items: [
      "On Transamerica Immediate Solution, an amputation that is not from accident or trauma cannot issue.",
      "On Americo Eagle Select, an amputation from disease is among the situations that stop that product from issuing.",
    ],
    f6gap: "A prosthesis from an old crash is described as an accident. An amputation from diabetes is described as disease. Do not mix the two sentences.",
    f7c: "Parkinson’s, multiple sclerosis, or ALS",
    f7w: "The CDC groups conditions that can be progressive. Insurance does not use one “neurologic” checkbox.",
    f7items: [
      "On Americo Eagle Select, Parkinson’s, multiple sclerosis, and ALS are among the situations that stop that product from issuing.",
      "On Transamerica Immediate Solution, ALS cannot issue. Down syndrome cannot issue either.",
      "Living Promise lists Parkinson’s, multiple sclerosis, muscular dystrophy, and paralysis among impairments that may adjust or not issue. We will not claim Living Promise always leaves the plan that pays in full.",
    ],
    f7gap: "We will not invent how Transamerica Immediate Solution treats Parkinson’s or multiple sclerosis when there is no public row with that name. Quote the exact diagnosis.",
    f8c: "How the premium is paid",
    f8w: "Some people receive SSDI on a Treasury debit card. That is a payment method, not a diagnosis.",
    f8items: [
      "Accendo does not accept credit or debit cards for that premium, including the Social Security Direct Express card.",
      "Transamerica Immediate Solution does allow payment with Direct Express, along with a bank account.",
    ],
    f8gap: "We will not say “almost no company” accepts that card. Ask at the quote which method stays open on the product that qualifies.",
    costH: "Sample monthly prices if a health-question plan issues",
    costP: "These figures are illustrative monthly premiums, non-tobacco, for a final expense plan that can pay in full if the questionnaire issues. Read them as the size of the product by age and sex — not as the “price of having a disability.” If there is a wheelchair from illness, daily help, or a facility now, do not assume these rows.",
    costLearn: "What you should learn from this table: at the same coverage amount, the monthly price rises with age, and men usually pay more than women. Tobacco (not shown here) raises it again. Some amounts are scaled from a published band. This is not an offer.",
    costFoot: "A guaranteed-acceptance plan, at the same age and amount, usually costs more and waits about two years for natural death. Use that table if the questionnaire cannot issue.",
    coH: "Companies we can quote",
    coP: "After you understand the three paths, these are appointed companies Mejor Vida Insurance can quote. With a disability, they do not all issue the same kind of plan. Ages and amounts vary. Approval is not guaranteed.",
    faq1q: "I collect SSDI. Will they turn me down?",
    faq1a: "Not for the check. They close a health-question plan — or send you to a plan with no questions — for what the questionnaire and prescriptions show: a wheelchair from illness, help bathing, a facility, dementia, oxygen, or active cancer. Say both facts.",
    faq2q: "I use a wheelchair for arthritis. Is there a wait?",
    faq2a: "On one product we quote, the chair can still leave a health-question plan that pays in full if no one helps you. On another, depending on a chair in the last 12 months closes that product. We will not claim a national yes. Quote with the reason and whether there is help.",
    faq3q: "Can a child own the policy if I cannot sign?",
    faq3a: "If memory or the ability to decide keeps you from signing, the health-question plan usually cannot issue. On Accendo, a power of attorney does not replace that signature. The usual path we quote is guaranteed acceptance from ages 50 to 80, if that application can still be completed.",
    faq4q: "I have a prosthesis from a car accident. Is that the same as a chair from diabetes?",
    faq4a: "No. An amputation from an accident is not the same file as an amputation from disease. On two products we quote, an amputation from disease cannot issue. Be precise.",
    faq5q: "Does this insurance pay a monthly disability benefit?",
    faq5a: "No. That would be disability insurance, a different product. Final expense pays a lump sum to the beneficiaries when you die. It also does not replace SSDI.",
    faq6q: "I live in a care facility. Which product?",
    faq6a: "On Transamerica Immediate Solution, that care now cannot issue. On other health-question products, a facility or medical care in the home usually closes that path too. Guaranteed acceptance may still be open from ages 50 to 80.",
    faq7q: "Can I pay with a Direct Express card?",
    faq7a: "It depends on the product. Transamerica Immediate Solution can accept it. Accendo does not accept that card or other debit or credit cards for that premium. Ask at the quote. We will not claim that “almost no one” accepts it.",
    faq8q: "I have Parkinson’s. Is there a plan with questions?",
    faq8a: "On Americo Eagle Select, Parkinson’s stops that product from issuing. On Living Promise it is among impairments that may adjust or not issue. We will not invent how Transamerica Immediate Solution treats Parkinson’s if there is no public row with that name. Quote the exact diagnosis and whether there is a chair or daily help.",
    nextLead: "See prices, or schedule a call with Mejor Vida Insurance. Mention how you move, who helps you, where you live, and whether you can sign.",
    nextMore: `If there is a wheelchair from illness, a facility, or you cannot sign, a guaranteed-acceptance plan may still be open from ages 50 to 80. Index: <a href="${L.hub}">pre-existing conditions</a>. Also <a href="${L.stroke}">stroke</a> and <a href="${L.copd}">COPD</a> if they apply.`,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    coFoot: "Educational cards for appointed companies. A plan that pays less or returns premiums in the first years, or a guaranteed-acceptance plan, may add a wait. Not a binding quote.",
  };
}

function disabilityMain(lang, page, c) {
  return teachConditionMain(lang, page, c);
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
      ? '<a href="https://www.cdc.gov/hiv/about/index.html" rel="noopener" target="_blank">CDC: VIH</a> — qué es el virus, el tratamiento y la carga indetectable; no es una regla de una aseguradora.'
      : '<a href="https://www.cdc.gov/hiv/about/index.html" rel="noopener" target="_blank">CDC: HIV</a> — what the virus is, treatment, and an undetectable viral load; not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.hiv.gov/hiv-basics/overview/about-hiv-and-aids/what-are-hiv-and-aids" rel="noopener" target="_blank">HIV.gov: VIH y SIDA</a> — el SIDA es una etapa tardía; el tratamiento puede impedir que se llegue ahí.'
      : '<a href="https://www.hiv.gov/hiv-basics/overview/about-hiv-and-aids/what-are-hiv-and-aids" rel="noopener" target="_blank">HIV.gov: HIV and AIDS</a> — AIDS is a late stage; treatment can keep the infection from reaching that stage.',
    src4: "",
    src5: "",
    src6: "",
  });
  src.src4 = "";
  src.src5 = "";
  src.src6 = "";
  if (isEs) {
    return {
      ...b,
      ...src,
      hideJsRateNote: true,
      coWait: "¿Espera de 2 años?",
      coGiProduct: "Vida entera de aceptación garantizada",
      coGiFoot: "Una póliza de aceptación garantizada por asegurado cada 12 meses; el total de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      title: "Seguro de gastos finales si vive con VIH (2026) | Mejor Vida Seguros",
      desc: "El VIH no abre el plan con preguntas en los productos que cotizamos. Cómo funciona gastos finales, qué es la aceptación garantizada, y cuándo hay que decir que no lo sabemos.",
      h1: "¿Puede comprar gastos finales si vive con VIH?",
      lead: "A menudo sí hay un producto, pero no el que muchas familias buscan primero. El CDC describe el <strong>VIH</strong> como un virus que ataca el sistema de defensas. Con tratamiento, muchas personas viven años. HIV.gov llama <strong>SIDA</strong> a una etapa tardía, cuando esas defensas ya están muy dañadas. En un seguro de entierro de monto pequeño, esa mejora médica <strong>no abre el cuestionario de salud</strong> en los productos que cotizamos.",
      crumbEnd: "VIH",
      take1: "El plan que muchas familias quieren primero es un <strong>plan nivelado</strong>: una póliza con un cuestionario corto de salud que puede pagar el monto completo desde el primer pago cubierto, casi siempre sin espera de dos años.",
      take2: "Con un diagnóstico de VIH o SIDA, ese plan con preguntas suele no poder emitir en las compañías de entierro que cotizamos. Entonces se mira un plan sin preguntas de salud, si la edad y el monto caben.",
      take3: "No cotizamos un “plan especial para VIH” de compañías con las que no trabajamos. Tampoco afirmamos que “ninguna compañía del país” emita un plan que paga completo. Cotizamos lo que tenemos designado.",
      callout: "El camino que sí cotizamos es un plan de <strong>aceptación garantizada</strong> — sin preguntas de salud y con unos dos años de espera por muerte natural — entre los 50 y los 80 años, de $5,000 a $25,000. Fuera de esa edad no hay un “sí automático” sin cuestionario en lo que ofrecemos.",
      needH: "La preocupación real",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. Gastos finales es vida permanente de monto pequeño, pensada para esa factura — no paga el tratamiento del VIH ni sustituye una póliza grande de ingresos.",
      needP2: "Un diagnóstico que usted ya tiene se llama a menudo <strong>condición preexistente</strong>. Esa etiqueta no significa, por sí sola, que no exista ningún seguro. El miedo suele ser: “Con VIH, ¿solo me venden un plan que espera — o nada?” El resto de la página explica esa diferencia <strong>antes</strong> de nombrar compañías.",
      whatH: "Qué significan el VIH y el SIDA para su salud",
      whatP1: "El CDC explica que el VIH ataca las células que ayudan a combatir infecciones. No hay una cura. El tratamiento — pastillas que el médico receta — puede bajar tanto el virus en la sangre que un análisis no lo detecta. Eso se llama carga viral <strong>indetectable</strong>. Eso importa para su salud y para no transmitir el virus por sexo. No es la misma pregunta que hace un seguro de entierro.",
      whatP2: "HIV.gov describe el SIDA como la etapa tardía, cuando el sistema de defensas está muy dañado o aparecen ciertas infecciones. Con tratamiento, en Estados Unidos la mayoría de las personas con VIH no llegan a esa etapa. El seguro de los productos que cotizamos no ofrece una casilla de “indetectable = plan que paga completo.”",
      whatP3: "Una aseguradora no trata el VIH. Decide si el historial, como queda escrito y como aparece en las recetas ya surtidas, cabe en un producto que está dispuesta a emitir. No le pide un recuento de células en el consultorio de la agencia.",
      howH: "Cómo mira el seguro de vida un historial de salud",
      howP1: "En gastos finales el camino habitual no es un examen en el consultorio. Hay un cuestionario corto y, en la mayoría de los productos que cotizamos, una revisión de recetas. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega un reclamo.",
      howP2: "Si esas preguntas se pueden contestar sin chocar con lo que ese producto no puede emitir, el plan suele ser el nivelado. Si no puede emitir así, algunos productos pagan menos o devuelven primas en los primeros años. Si tampoco puede emitir, un plan de aceptación garantizada no hace preguntas de salud y espera unos dos años por muerte natural.",
      howP3: "El seguro temporal con montos más altos es otro producto: a veces hay laboratorios. Un diagnóstico de VIH suele cerrar ese camino en lo que cotizamos. Si la necesidad es ingreso o hipoteca, no entierro, vea <a href=\"" + L.termCond + "\">temporal con condiciones previas</a> — y no espere un sí automático ahí tampoco.",
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
      vsR3H: "Si hay un diagnóstico de VIH o SIDA",
      vsR3A: "En los productos con preguntas que cotizamos, suele no poder emitir.",
      vsR3B: "No cotizamos un plan designado de pago parcial hecho para este diagnóstico.",
      vsR3C: "El camino habitual, entre los 50 y los 80 años.",
      vsR4H: "Precio, en términos generales",
      vsR4A: "Suele ser el más bajo por dólar de estos tres, si califica — aquí suele no aplicar.",
      vsR4B: "Varía. No inventamos una prima de muestra aquí.",
      vsR4C: "Suele costar más por dólar. La salud no cambia esta prima.",
      vsLearn: "Esta tabla enseña por qué el plan sin preguntas es el que cotizamos para este diagnóstico. No es una cotización. Edad y monto todavía tienen que caber.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Los anuncios que mezclan las dos cosas casi siempre siguen teniendo cuestionario.",
      considerH: "Qué ayuda, y qué no",
      considerP: "La ventaja del plan sin preguntas es que el diagnóstico no cierra la solicitud: no hay cuestionario de salud. El límite es la espera de unos dos años por muerte natural, un monto más bajo y un precio más alto por dólar. Sentirse bien, una carga indetectable o muchos años de tratamiento no abren el plan que paga completo en los productos que cotizamos. Omitir las pastillas en un cuestionario que sí las pregunta no borra las recetas ya surtidas.",
      split1H: "No cambia el resultado del plan con preguntas",
      split1a: "Carga viral indetectable.",
      split1b: "Años de tratamiento sin hospitalizaciones.",
      split1c: "Sentirse bien hoy. El seguro de estos productos pregunta el diagnóstico, no cómo se siente.",
      split2H: "Sigue importando en el plan sin preguntas",
      split2a: "Edad 50 a 80. Fuera de ese rango no hay un sí automático sin cuestionario en lo que cotizamos.",
      split2b: "Monto de $5,000 a $25,000. Una póliza de este tipo por asegurado cada 12 meses en esa compañía.",
      split2c: "Identidad, pago y dónde está archivado el producto. El diagnóstico no sustituye esos requisitos.",
      factorsH: "Qué podemos afirmar — y qué no",
      factorsP: "Cada tarjeta empieza con la idea de salud. A la derecha va solo lo que podemos afirmar para los productos de entierro que cotizamos. Si falta una pregunta o las compañías no coinciden, lo decimos.",
      factorsNote: "Estas notas no son una cotización. El plan sin preguntas todavía tiene reglas de edad, monto y estado.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Lo que podemos afirmar",
      f1c: "VIH o SIDA",
      f1w: "El CDC y HIV.gov describen el VIH como el virus y el SIDA como una etapa tardía. El tratamiento puede impedir que se llegue ahí.",
      f1items: [
        "En Transamerica Immediate Solution, VIH o SIDA no puede emitir ese producto.",
        "En el producto de Corebridge con preguntas de salud, VIH o SIDA tampoco puede emitir. El producto sin preguntas de esa compañía es el que cotizamos.",
      ],
      f1gap: "No vamos a afirmar un sí o un no de Living Promise o de Americo Eagle Select por el diagnóstico solo. No enviamos un cuestionario “a ver qué pasa” cuando Transamerica ya no puede emitir.",
      f2c: "Carga indetectable",
      f2w: "El CDC explica que el tratamiento puede bajar el virus hasta que un análisis no lo detecta. Eso protege la salud y puede impedir la transmisión por sexo.",
      f2items: [
        "Eso no abre Transamerica Immediate Solution. Ese producto no tiene una excepción de “indetectable.”",
        "El plan de aceptación garantizada no pregunta la carga viral. Por eso puede emitir entre los 50 y los 80.",
      ],
      f3c: "Pastillas para el VIH",
      f3w: "HIV.gov llama tratamiento a las medicinas que bajan el virus. La aseguradora las ve en las recetas ya surtidas si el producto revisa recetas.",
      f3items: [
        "En Accendo, varios medicamentos usados para el VIH impiden completar esa solicitud.",
        "En el plan de aceptación garantizada no hay cuestionario de salud. Siga las instrucciones de identidad y pago. No mienta en ningún formulario que sí pregunte medicamentos.",
      ],
      f3gap: "No publicamos una lista pública de cada pastilla. Liste los nombres en la cotización.",
      f4c: "Edad 50 a 80",
      f4w: "El plan sin preguntas que cotizamos no selecciona por salud. Sí selecciona por edad.",
      f4items: [
        "Emite de 50 a 80 años, de $5,000 a $25,000.",
        "Antes de 50 o después de 80 no hay un sí automático sin cuestionario para este diagnóstico en lo que cotizamos. No inventamos un producto.",
      ],
      f5c: "La espera de dos años",
      f5w: "Si la compañía no pregunta salud, no puede pagar el monto completo por una muerte natural después de pocas primas.",
      f5items: [
        "En los primeros dos años, una muerte natural cubierta devuelve las primas pagadas más el interés del contrato — 110% de las primas, en el producto que cotizamos. No paga los $10,000 o $25,000.",
        "Un accidente cubierto puede pagar el monto completo desde el inicio. El suicidio tiene su propio plazo en el contrato.",
      ],
      f6c: "Otras compañías o un “plan gradual para VIH”",
      f6w: "Algunos anuncios prometen un plan con preguntas y un pago parcial para este diagnóstico.",
      f6items: [
        "No cotizamos un plan de pago parcial designado hecho para VIH.",
        "No nombramos compañías con las que no estamos designados.",
      ],
      f6gap: "No vamos a decir que se pueden apilar varias pólizas sin preguntas hasta un monto alto. En la compañía que cotizamos, una póliza de este tipo por asegurado cada 12 meses y un total de $25,000.",
      f7c: "Tabaco y otros diagnósticos",
      f7w: "El plan sin preguntas no ajusta el precio por salud. Otras reglas de edad y monto siguen.",
      f7items: [
        "El tabaco no cambia la prima de ese producto. Edad, sexo y monto sí.",
        "Demencia, hospicio o una enfermedad terminal no cambian las preguntas — no las hay. Siguen la edad, el monto y dónde está archivado el producto.",
      ],
      costH: "Precios mensuales de muestra del plan sin preguntas",
      costP: "Estas cifras son primas mensuales ilustrativas del plan de aceptación garantizada que Mejor Vida Seguros cotiza. Incluyen la cuota de la póliza. La salud no cambia esta prima. Hay espera de unos dos años por muerte natural. Léalas como el tamaño del producto por edad y sexo — no como el “precio del VIH.”",
      costLearn: "Qué debe aprender de esta tabla: a la misma cobertura, el mes sube con la edad, y los hombres suelen pagar más que las mujeres. El tabaco no aparece porque no cambia esta prima. No es una oferta.",
      costFoot: "Un plan con preguntas, si pudiera emitir, suele costar menos por dólar. Para este diagnóstico, en lo que cotizamos, ese camino suele estar cerrado.",
      coH: "El producto que podemos cotizar",
      coP: "Después de entender los tres caminos, no publicamos fichas de Living Promise, Accendo, Immediate Solution o Eagle Select para este diagnóstico: esos planes con preguntas no son el camino que cotizamos aquí. La ficha de abajo es Corebridge, el plan sin preguntas.",
      faq1q: "¿Me pueden negar el plan sin preguntas por VIH?",
      faq1a: "No por el historial médico, si está en la edad y el monto del producto. Todavía hay que cumplir identidad, pago y dónde está archivado el producto.",
      faq2q: "¿Hay espera?",
      faq2a: "Sí. Unos dos años por muerte natural. En esa espera la familia recibe el 110% de las primas pagadas, no el monto de la póliza. Un accidente cubierto puede pagar el monto desde el inicio.",
      faq3q: "Mi carga es indetectable. ¿Eso abre un plan con preguntas?",
      faq3a: "No en Transamerica Immediate Solution, ni en el producto de Corebridge que sí hace preguntas. El plan de aceptación garantizada sigue siendo el camino entre los 50 y los 80.",
      faq4q: "¿Existe aceptación garantizada sin espera?",
      faq4a: "No en las compañías que cotizamos. Cero preguntas y beneficio completo por muerte natural desde el día uno no es un producto que ofrezcamos.",
      faq5q: "Tengo 45 años. ¿Qué hay?",
      faq5a: "El plan sin preguntas empieza a los 50. Antes de eso no cotizamos un sí automático sin cuestionario para este diagnóstico. Hable con Mejor Vida Seguros; no inventamos un producto.",
      faq6q: "¿Debo listar las pastillas en el plan sin preguntas?",
      faq6a: "Ese producto no tiene cuestionario de salud. Siga las instrucciones de identidad y pago. No mienta en ningún formulario que sí pregunte medicamentos.",
      faq7q: "¿La póliza paga si la causa es el VIH o el SIDA?",
      faq7a: "Después de la espera, es un seguro de vida: un cheque por una muerte cubierta. En los primeros dos años, una muerte natural cubierta devuelve primas con el interés del contrato, no el monto completo.",
      faq8q: "Tomo pastillas para no contagiarme, y no tengo VIH. ¿Es esta página?",
      faq8a: "No. La prevención cuando no hay diagnóstico es otra conversación. Esta página es para quien ya vive con VIH o SIDA. No inventamos cómo un producto de entierro trata esa prevención.",
      nextLead: "Si tiene 50 a 80 años, vea precios del plan sin preguntas, o programe una llamada con Mejor Vida Seguros. Si no, llame para ver qué queda abierto — no prometemos un producto que no cotizamos.",
      nextMore: `Cómo funciona la espera: <a href="${L.gi}">aceptación garantizada</a>. Índice: <a href="${L.hub}">condiciones preexistentes</a>.`,
      nextSecondary: "Programar una llamada",
      nextSecondaryHref: L.schedule,
      coFoot: "Ficha educativa. Un plan de aceptación garantizada añade una espera por muerte natural. No es cotización vinculante.",
    };
  }
  return {
    ...b,
    ...src,
    hideJsRateNote: true,
    coWait: "2-year wait?",
    coGiProduct: "Guaranteed-acceptance whole life",
    coGiFoot: "One guaranteed-acceptance policy per insured every 12 months; that company’s total does not exceed $25,000. Educational — not a binding quote.",
    title: "Final expense insurance if you live with HIV (2026) | Mejor Vida Insurance",
    desc: "HIV does not open a health-question plan on the products we quote. How final expense works, what guaranteed acceptance is, and when we will say we do not know.",
    h1: "Can you buy final expense insurance if you live with HIV?",
    lead: "Often there is a product, but not the one many families want first. The CDC describes <strong>HIV</strong> as a virus that attacks the immune system. With treatment, many people live for years. HIV.gov calls <strong>AIDS</strong> a late stage, when those defenses are badly damaged. On a small burial-size life policy, that medical progress <strong>does not open the health questionnaire</strong> on the products we quote.",
    crumbEnd: "HIV",
    take1: "The plan many families want first is a <strong>level plan</strong>: a policy with a short health questionnaire that can pay the full amount from the first covered payment, usually with no two-year wait.",
    take2: "With an HIV or AIDS diagnosis, that health-question plan usually cannot issue at the burial companies we quote. Then we look at a plan with no health questions, if age and amount fit.",
    take3: "We do not quote a “special HIV plan” from companies we do not appoint. We also will not claim that “no company in the country” issues a plan that pays in full. We quote what we have appointed.",
    callout: "The path we do quote is a <strong>guaranteed-acceptance</strong> plan — no health questions, and about a two-year wait for natural death — from ages 50 to 80, $5,000 to $25,000. Outside that age there is no automatic yes without a questionnaire on what we offer.",
    needH: "The worry people actually have",
    needP1: "Families look for this coverage because a funeral, the cemetery, and small debts can fall on relatives. Final expense is permanent life insurance in a small amount, meant for that bill — it does not pay for HIV treatment and it does not replace a large income policy.",
    needP2: "A diagnosis you already have is often called a <strong>pre-existing condition</strong>. That label does not, by itself, mean there is no insurance at all. The fear is usually: “With HIV, will they only sell me a plan that waits — or nothing?” The rest of this page explains that difference <strong>before</strong> naming companies.",
    whatH: "What HIV and AIDS mean for your health",
    whatP1: "The CDC explains that HIV attacks the cells that help fight infection. There is no cure. Treatment — medicine a doctor prescribes — can lower the virus in the blood until a lab cannot detect it. That is called an <strong>undetectable</strong> viral load. That matters for your health and for not transmitting HIV through sex. It is not the same question a burial policy asks.",
    whatP2: "HIV.gov describes AIDS as the late stage, when the immune system is badly damaged or certain infections appear. With treatment, most people living with HIV in the United States do not reach that stage. Insurance on the products we quote does not offer a checkbox for “undetectable = the plan that pays in full.”",
    whatP3: "An insurer does not treat HIV. It decides whether the history, as it is written and as it appears in prescriptions already filled, fits a product it is willing to issue. It does not ask for a cell-count test at the agency office.",
    howH: "How life insurance reviews a health history",
    howP1: "On final expense the usual path is not an office exam. There is a short questionnaire and, on most products we quote, a review of prescriptions. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "If those questions can be answered without hitting what that product cannot issue, the plan is usually level. If it cannot issue that way, some products pay less or return premiums in the first years. If even that cannot issue, a guaranteed-acceptance plan asks no health questions and waits about two years for natural death.",
    howP3: "Term life at larger amounts is a different product: sometimes there are labs. An HIV diagnosis usually closes that path on what we quote. If the need is income or a mortgage, not burial, see <a href=\"" + L.termCond + "\">term life with pre-existing conditions</a> — and do not expect an automatic yes there either.",
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
    vsR3H: "If there is an HIV or AIDS diagnosis",
    vsR3A: "On the health-question products we quote, it usually cannot issue.",
    vsR3B: "We do not quote an appointed partial-pay plan built for this diagnosis.",
    vsR3C: "The usual path, from ages 50 to 80.",
    vsR4H: "Price, in plain terms",
    vsR4A: "Usually the lowest per dollar of these three, if you qualify — here it usually does not apply.",
    vsR4B: "It varies. We will not invent a sample premium here.",
    vsR4C: "Usually costs more per dollar. Health does not change this premium.",
    vsLearn: "This chart teaches why the no-questions plan is what we quote for this diagnosis. It is not a quote. Age and amount still have to fit.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. Ads that combine both almost always still have a questionnaire.",
    considerH: "What helps, and what does not",
    considerP: "The advantage of the no-questions plan is that the diagnosis does not close the application: there is no health questionnaire. The limitation is about a two-year wait for natural death, a smaller amount, and a higher price per dollar. Feeling well, an undetectable viral load, or many years of treatment do not open the plan that pays in full on the products we quote. Skipping the pills on a questionnaire that does ask for them does not erase prescriptions already filled.",
    split1H: "Does not change the health-question outcome",
    split1a: "An undetectable viral load.",
    split1b: "Years of treatment without hospital stays.",
    split1c: "Feeling well today. Insurance on these products asks the diagnosis, not how you feel.",
    split2H: "Still matters on the no-questions plan",
    split2a: "Ages 50 to 80. Outside that range there is no automatic yes without a questionnaire on what we quote.",
    split2b: "An amount from $5,000 to $25,000. One policy of this kind per insured every 12 months at that company.",
    split2c: "Identity, payment, and where the product is filed. The diagnosis does not replace those requirements.",
    factorsH: "What we can state — and what we cannot",
    factorsP: "Each card starts with the health idea. The right side lists only what we can state for the burial products we quote. If a question is missing or companies do not agree, we say so.",
    factorsNote: "These notes are not a quote. The no-questions plan still has age, amount, and state rules.",
    fMeaning: "In plain language",
    fVerify: "What we can state",
    f1c: "HIV or AIDS",
    f1w: "The CDC and HIV.gov describe HIV as the virus and AIDS as a late stage. Treatment can keep the infection from reaching that stage.",
    f1items: [
      "On Transamerica Immediate Solution, HIV or AIDS cannot issue that product.",
      "On Corebridge’s product that does ask health questions, HIV or AIDS cannot issue either. The no-questions product from that company is the one we quote.",
    ],
    f1gap: "We will not state a yes or no for Living Promise or Americo Eagle Select on the diagnosis alone. We do not send a questionnaire “to see what happens” when Transamerica already cannot issue.",
    f2c: "An undetectable viral load",
    f2w: "The CDC explains that treatment can lower the virus until a lab cannot detect it. That protects health and can prevent transmission through sex.",
    f2items: [
      "That does not open Transamerica Immediate Solution. That product has no “undetectable” exception.",
      "The guaranteed-acceptance plan does not ask viral load. That is why it can issue from ages 50 to 80.",
    ],
    f3c: "HIV medicines",
    f3w: "HIV.gov describes treatment as the medicines that lower the virus. The insurer sees them in prescriptions already filled if the product reviews prescriptions.",
    f3items: [
      "On Accendo, several medicines used for HIV stop that application from being completed.",
      "On the guaranteed-acceptance plan there is no health questionnaire. Follow the identity and payment instructions. Do not lie on any form that does ask for medications.",
    ],
    f3gap: "We do not publish a public pill-by-pill list. List the names at the quote.",
    f4c: "Ages 50 to 80",
    f4w: "The no-questions plan we quote does not select by health. It does select by age.",
    f4items: [
      "It issues from ages 50 to 80, $5,000 to $25,000.",
      "Before 50 or after 80 there is no automatic yes without a questionnaire for this diagnosis on what we quote. We do not invent a product.",
    ],
    f5c: "The two-year wait",
    f5w: "If the company asks nothing about health, it cannot pay the full amount for a natural death after only a few premiums.",
    f5items: [
      "In the first two years, a covered natural death returns premiums paid plus contract interest — 110% of premiums, on the product we quote. It does not pay the $10,000 or $25,000.",
      "A covered accident can pay the full amount from the start. Suicide has its own contract period.",
    ],
    f6c: "Other companies or a “graded HIV plan”",
    f6w: "Some ads promise a health-question plan with a partial payout for this diagnosis.",
    f6items: [
      "We do not quote an appointed partial-pay plan built for HIV.",
      "We do not name companies we are not appointed with.",
    ],
    f6gap: "We will not say you can stack several no-questions policies up to a large amount. At the company we quote, one policy of this kind per insured every 12 months and a $25,000 total.",
    f7c: "Tobacco and other diagnoses",
    f7w: "The no-questions plan does not adjust the price for health. Age and amount rules still apply.",
    f7items: [
      "Tobacco does not change that product’s premium. Age, sex, and amount do.",
      "Dementia, hospice, or a terminal illness do not change the questions — there are none. Age, amount, and where the product is filed still apply.",
    ],
    costH: "Sample monthly prices for the no-questions plan",
    costP: "These figures are illustrative monthly premiums for the guaranteed-acceptance plan Mejor Vida Insurance quotes. They include the policy fee. Health does not change this premium. There is about a two-year wait for natural death. Read them as the size of the product by age and sex — not as the “price of HIV.”",
    costLearn: "What you should learn from this table: at the same coverage amount, the monthly price rises with age, and men usually pay more than women. Tobacco does not appear because it does not change this premium. This is not an offer.",
    costFoot: "A health-question plan, if it could issue, usually costs less per dollar. For this diagnosis, on what we quote, that path is usually closed.",
    coH: "The product we can quote",
    coP: "After you understand the three paths, we do not publish Living Promise, Accendo, Immediate Solution, or Eagle Select cards for this diagnosis: those health-question plans are not the path we quote here. The card below is Corebridge, the no-questions plan.",
    faq1q: "Can they turn me down on the no-questions plan because of HIV?",
    faq1a: "Not for medical history, if you are in the product’s age and amount. You still have to meet identity, payment, and where the product is filed.",
    faq2q: "Is there a waiting period?",
    faq2a: "Yes. About two years for natural death. During that wait the family receives 110% of premiums paid, not the policy amount. A covered accident can pay the full amount from the start.",
    faq3q: "My viral load is undetectable. Does that open a health-question plan?",
    faq3a: "Not on Transamerica Immediate Solution, and not on Corebridge’s product that does ask health questions. Guaranteed acceptance remains the path from ages 50 to 80.",
    faq4q: "Is there guaranteed acceptance with no wait?",
    faq4a: "Not at the companies we quote. Zero questions and a full natural-death benefit from day one is not a product we offer.",
    faq5q: "I am 45. What is available?",
    faq5a: "The no-questions plan starts at 50. Before that we do not quote an automatic yes without a questionnaire for this diagnosis. Talk with Mejor Vida Insurance; we do not invent a product.",
    faq6q: "Do I list the pills on the no-questions plan?",
    faq6a: "That product has no health questionnaire. Follow the identity and payment instructions. Do not lie on any form that does ask for medications.",
    faq7q: "Does the policy pay if the cause is HIV or AIDS?",
    faq7a: "After the wait, this is life insurance: a check for a covered death. In the first two years, a covered natural death returns premiums plus contract interest, not the full amount.",
    faq8q: "I take pills so I do not get HIV, and I do not have HIV. Is this page for me?",
    faq8a: "No. Prevention when there is no diagnosis is a different conversation. This page is for someone who already lives with HIV or AIDS. We will not invent how a burial product treats that prevention.",
    nextLead: "If you are 50 to 80, see prices on the no-questions plan, or schedule a call with Mejor Vida Insurance. If not, call to see what is still open — we will not promise a product we do not quote.",
    nextMore: `How the wait works: <a href="${L.gi}">guaranteed acceptance</a>. Index: <a href="${L.hub}">pre-existing conditions</a>.`,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    coFoot: "Educational card. A guaranteed-acceptance plan adds a wait for natural death. Not a binding quote.",
  };
}

function hivMain(lang, page, c) {
  return teachConditionMain(lang, page, c, { showSi: false, useGiRates: true });
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
      ? '<a href="https://www.cdc.gov/stroke/about/index.html" rel="noopener" target="_blank">CDC: derrame cerebral</a> — qué es un derrame, los tipos y el AIT; no es una regla de una aseguradora.'
      : '<a href="https://www.cdc.gov/stroke/about/index.html" rel="noopener" target="_blank">CDC: stroke</a> — what a stroke is, the types, and a TIA; not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.nhlbi.nih.gov/health/stroke" rel="noopener" target="_blank">NHLBI: derrame</a> — síntomas, presión alta y tabaco; contexto de salud, no una tarifa.'
      : '<a href="https://www.nhlbi.nih.gov/health/stroke" rel="noopener" target="_blank">NHLBI: stroke</a> — symptoms, high blood pressure, and tobacco; health context, not a rate.',
    src4: "",
    src5: "",
    src6: "",
  });
  src.src4 = "";
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
      title: "Seguro de gastos finales si tuvo un derrame o un AIT (2026) | Mejor Vida Seguros",
      desc: "Un derrame o un AIT no es un “no” automático. Cómo funciona gastos finales, por qué importa la fecha, y cuándo hay que decir que no lo sabemos.",
      h1: "¿Puede comprar gastos finales si tuvo un derrame o un AIT?",
      lead: "A menudo sí. El CDC explica que un <strong>derrame cerebral</strong> ocurre cuando se corta el riego de sangre al cerebro y una parte del cerebro se daña. Un <strong>AIT</strong> — ataque isquémico transitorio, a veces llamado mini-derrame — es un bloqueo breve; los síntomas se parecen y luego se resuelven. En un seguro de entierro de monto pequeño, la etiqueta <strong>por sí sola</strong> no es un “no” automático ni una espera automática de dos años. Lo que más cambia el producto es <strong>cuándo ocurrió</strong> y si quedó silla, ayuda diaria o problemas de memoria.",
      crumbEnd: "Derrame",
      take1: "El primer producto a cotizar suele ser un <strong>plan nivelado</strong>: una póliza con un cuestionario corto de salud que puede pagar el monto completo desde el primer pago cubierto, casi siempre sin espera de dos años.",
      take2: "La fecha del evento suele cambiar más el producto que la palabra “derrame” o “AIT.” Un episodio de hace años, con recuperación, a menudo sigue en un plan con preguntas. Uno reciente se mira distinto — y no todas las compañías usan el mismo recuento de meses.",
      take3: "Si el evento dejó silla de ruedas por enfermedad, cuidado en residencia o pérdida de memoria, el archivo ya no es “solo un derrame.” Vea también <a href=\"" + L.disability + "\">discapacidad</a>.",
      callout: "No compre un plan de <strong>aceptación garantizada</strong> — sin preguntas de salud y con unos dos años de espera por muerte natural — solo porque hubo un derrame hace años. Cotice primero un plan con preguntas. Diga el año, si fue derrame o AIT, y cómo se mueve hoy.",
      needH: "La preocupación real",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. Gastos finales es vida permanente de monto pequeño, pensada para esa factura — no paga la rehabilitación ni sustituye una póliza grande de ingresos.",
      needP2: "Un diagnóstico que usted ya tiene se llama a menudo <strong>condición preexistente</strong>. Esa etiqueta no significa, por sí sola, una espera de dos años. El miedo suele ser: “Después del derrame, ¿solo me venden un plan que espera?” El resto de la página explica esa diferencia <strong>antes</strong> de nombrar compañías.",
      whatH: "Qué significan un derrame y un AIT para su salud",
      whatP1: "El CDC describe dos tipos principales de derrame: uno por un coágulo que tapa una arteria, y otro por una hemorragia. En ambos, el cerebro no recibe el oxígeno que necesita. El tratamiento rápido importa para la salud. El seguro de entierro no es el tratamiento; pregunta el historial como queda escrito.",
      whatP2: "El CDC llama al AIT un aviso. El bloqueo dura poco — a menudo minutos — y no deja el mismo daño. Sigue siendo una emergencia médica. El NHLBI destaca la presión alta y el tabaco como factores. Si también tiene presión o corazón, dígalo: el cuestionario deja de ser un solo padecimiento.",
      whatP3: "Una aseguradora no trata el cerebro. Decide si el historial, como queda escrito y como aparece en las recetas ya surtidas, cabe en un producto que está dispuesta a emitir. No le pide una resonancia en el consultorio de la agencia.",
      howH: "Cómo mira el seguro de vida un historial de salud",
      howP1: "En gastos finales el camino habitual no es un examen en el consultorio. Hay un cuestionario corto y, en la mayoría de los productos que cotizamos, una revisión de recetas. La NAIC recuerda al consumidor que las respuestas honestas importan cuando llega un reclamo.",
      howP2: "Si esas preguntas se pueden contestar sin chocar con lo que ese producto no puede emitir, el plan suele ser el nivelado: el monto completo puede aplicar a una muerte natural cubierta desde el primer pago. Si no puede emitir así, algunos productos pagan menos o devuelven primas en los primeros años. Si tampoco puede emitir, un plan de aceptación garantizada no hace preguntas de salud y espera unos dos años por muerte natural.",
      howP3: "El seguro temporal con montos más altos es otro producto: a veces hay laboratorios. Un derrame reciente suele estrechar ese camino. Si la necesidad es ingreso o hipoteca, no entierro, vea <a href=\"" + L.termCond + "\">temporal con condiciones previas</a>.",
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
      vsR3H: "Si hubo un derrame o un AIT",
      vsR3A: "A menudo sigue siendo el primer intento si la fecha es antigua y no hay silla por enfermedad.",
      vsR3B: "Algunos productos usan este camino cuando el evento es más reciente.",
      vsR3C: "Reserva para cuando el cuestionario no puede emitir, o si hay residencia, silla por enfermedad o pérdida de memoria.",
      vsR4H: "Precio, en términos generales",
      vsR4A: "Suele ser el más bajo por dólar de estos tres, si califica.",
      vsR4B: "Varía. No inventamos una prima de muestra aquí.",
      vsR4C: "Suele costar más por dólar, a la misma edad y monto.",
      vsLearn: "Esta tabla enseña por qué cotizamos primero el plan con preguntas. No es una cotización. La fecha, las secuelas y un segundo diagnóstico todavía pueden cambiar la columna.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Los anuncios que mezclan las dos cosas casi siempre siguen teniendo cuestionario.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja: puede abrir más monto, un precio más bajo y el beneficio completo desde el primer pago cubierto. El límite es que el mismo cuestionario puede mandarlo a un plan que paga menos, o a aceptación garantizada, si el evento es reciente o si quedó silla, residencia o pérdida de memoria. Sentirse bien hoy no borra la fecha. Omitir el año no borra las recetas ni las internaciones.",
      split1H: "Suele seguir siendo un plan con preguntas",
      split1a: "Un derrame o AIT de hace años, con recuperación, sin silla por enfermedad.",
      split1b: "Caminar o trabajo físico varios días a la semana — en un producto que cotizamos, eso puede mejorar el precio si el derrame o el AIT es el único historial listado.",
      split1c: "Presión alta controlada, sin un evento nuevo. Eso es otra conversación; no sustituye la fecha del derrame.",
      split2H: "Suele cambiar la conversación",
      split2a: "Un evento en el último año, o en los últimos dos, según la compañía. No hay un solo recuento nacional.",
      split2b: "Silla o scooter por enfermedad, ayuda para bañarse o vestirse, residencia, o pérdida de memoria después del evento.",
      split2c: "Estar internado ahora, hospicio, o una cirugía pendiente con anestesia general.",
      factorsH: "Qué podemos afirmar — y qué no",
      factorsP: "Cada tarjeta empieza con la idea de salud. A la derecha va solo lo que podemos afirmar para los productos de entierro que cotizamos. Si las compañías no coinciden, lo decimos.",
      factorsNote: "Estas notas no son una cotización. Edad, peso y un segundo diagnóstico todavía pueden cambiar el resultado.",
      fMeaning: "En lenguaje sencillo",
      fVerify: "Lo que podemos afirmar",
      f1c: "Derrame o AIT",
      f1w: "El CDC trata el derrame y el AIT como eventos distintos para la salud. El AIT es un aviso breve; el derrame deja daño. Para el seguro de entierro, no todas las compañías los tratan igual.",
      f1items: [
        "En Transamerica Immediate Solution, derrame y AIT todavía pueden dejar un plan con preguntas que paga completo si ese es el único historial listado.",
        "En Accendo, derrame y AIT usan las mismas ventanas de fecha: no hay una excepción publicada de “el AIT siempre paga desde el día uno.”",
      ],
      f1gap: "No vamos a decir que “el AIT siempre abre el plan que paga completo en todas las compañías.” Las compañías no coinciden.",
      f2c: "Cuánto tiempo ha pasado",
      f2w: "El CDC señala que el riesgo de otro evento es más alto poco después. El seguro pregunta el año. No es la misma pregunta que “¿se siente bien ahora?”",
      f2items: [
        "En Accendo, un derrame o AIT en el último año suele ir a un plan que paga menos al inicio. Entre uno y dos años suele quedar un plan con preguntas que paga completo. Más de dos años todavía puede quedar el plan con preguntas que paga completo.",
        "En el producto de Corebridge que sí hace preguntas, un derrame en los últimos 12 meses no puede emitir ese producto. En los últimos 24 meses puede ir a un plan que paga menos al inicio. Un AIT en los últimos seis meses no puede emitir; más de un AIT, nunca, en ese producto.",
      ],
      f2gap: "Transamerica Immediate Solution no publica un recorte de “hace X meses” para derrame o AIT. No vamos a inventarle el mismo recorte de Accendo.",
      f3c: "Living Promise y un recorte de años",
      f3w: "Living Promise usa un cuestionario de sí o no. No publica el mismo gráfico de “hace un año / hace dos” que Accendo.",
      f3items: [
        "Living Promise lista derrame y AIT entre los padecimientos que pueden ajustar el beneficio o no emitir. Eso no es un “no” automático publicado.",
      ],
      f3gap: "No vamos a afirmar un recorte de meses de Living Promise para este diagnóstico. Diga la fecha real al cotizar. No redondee “hace un par de años” si fue hace once meses.",
      f4c: "Tabaco después del evento",
      f4w: "El NHLBI señala el tabaco como factor de derrame. Para el seguro, tabaco suele significar nicotina reciente — cigarrillos, vapeo, parche o cigarro.",
      f4items: [
        "En Transamerica Immediate Solution, nicotina en los últimos 12 meses aplica precio de tabaco. No es, por sí sola, un cierre automático si el resto pasa.",
        "En Americo Eagle Select, derrame o AIT más nicotina suele ser otra oferta de ese producto, no un cierre automático por el diagnóstico solo.",
      ],
      f4gap: "No vamos a decir que “tabaco después de un derrame siempre cierra todas las compañías.” Diga si fuma, vapea, usa parche o cigarro.",
      f5c: "Silla, residencia o memoria",
      f5w: "Un derrame puede dejar debilidad, silla o problemas de memoria. Eso ya no es “solo el evento.” Vea <a href=\"" + L.disability + "\">discapacidad</a> si aplica.",
      f5items: [
        "En Transamerica Immediate Solution, silla o scooter todavía puede dejar un plan con preguntas que paga completo si no necesita ayuda para las tareas diarias. Si hay ayuda, se mira como cuidado asistido: estar ahí ahora no puede emitir ese producto.",
        "En Americo Eagle Select, depender de silla o aparato motorizado, o ayuda para bañarse o vestirse, en los últimos 12 meses impide emitir ese producto.",
      ],
      f5gap: "Un lado débil con el que todavía camina no es lo mismo que silla por enfermedad. Descríbalo con precisión. No lo redondee.",
      f6c: "Anticoagulantes y otras pastillas",
      f6w: "Después de un derrame o un AIT, el médico a menudo receta pastillas para la sangre o para la presión. El seguro las ve en las recetas ya surtidas si el producto las revisa.",
      f6items: [
        "Liste los nombres al cotizar. No omita una pastilla en un formulario que sí pregunta medicamentos.",
      ],
      f6gap: "No vamos a afirmar que “todo anticoagulante cierra el plan con preguntas.” Tampoco publicamos una lista pública de cada pastilla. Traiga los nombres.",
      f7c: "Caminar o trabajo físico",
      f7w: "Moverse con regularidad no “borra” el derrame. En un producto que cotizamos, caminar o trabajo físico varios días a la semana puede mejorar el precio mensual cuando el derrame o el AIT es el único historial listado.",
      f7items: [
        "Eso no es una promesa de aprobación. Peso, tabaco y otros diagnósticos entran en la misma solicitud.",
      ],
      f8c: "Presión alta o corazón junto con el evento",
      f8w: "El NHLBI señala la presión alta como un factor habitual. Un infarto o una cirugía de corazón es otro historial, no el mismo archivo.",
      f8items: [
        "En Americo Eagle Select, dos de estos — corazón, diabetes, derrame o AIT — suelen ser otra oferta de ese producto, no el mismo que un solo factor.",
        "Un infarto o un derrame se cotizan con sus propias fechas. No los mezcle en una sola frase.",
      ],
      f8gap: "Si también hay corazón o presión, use esas páginas. No prometemos un cargo extra con el nombre “derrame más presión.”",
      costH: "Precios mensuales de muestra si emite un plan con preguntas",
      costP: "Estas cifras son primas mensuales ilustrativas, no fumador, para un plan de gastos finales que puede pagar completo si el cuestionario emite. Léalas como el tamaño del producto por edad y sexo — no como el “precio de haber tenido un derrame.” Quien usa tabaco paga más; a veces el tabaco cambia el producto.",
      costLearn: "Qué debe aprender de esta tabla: a la misma cobertura, el mes sube con la edad, y los hombres suelen pagar más que las mujeres. El tabaco (no mostrado aquí) sube otra vez. Algunos montos se calculan a partir de una banda publicada. No es una oferta.",
      costFoot: "Un plan de aceptación garantizada, a la misma edad y monto, suele costar más y espera unos dos años por muerte natural. Use esa tabla solo si el cuestionario no puede emitir.",
      coH: "Compañías que podemos cotizar",
      coP: "Después de entender los tres caminos, estas son compañías designadas que Mejor Vida Seguros puede cotizar. Con un derrame o un AIT, no todas emiten el mismo tipo de plan. Edades y montos cambian. La aprobación no está garantizada.",
      faq1q: "Tuve un AIT hace cinco años. ¿Hay espera?",
      faq1a: "A menudo no, si el resto del cuestionario está limpio. En un producto que cotizamos, el AIT todavía puede dejar un plan que paga completo. En otro, el AIT usa las mismas ventanas de fecha que el derrame. Cotice con el año real. No vamos a decir que el AIT siempre paga desde el día uno en todas las compañías.",
      faq2q: "El derrame fue hace 14 meses. ¿Qué producto?",
      faq2a: "Eso es reciente para algunas compañías y no para otras. En Accendo, entre uno y dos años suele quedar un plan con preguntas que paga completo. En el producto de Corebridge con preguntas, un derrame en los últimos 24 meses puede ir a un plan que paga menos. No vamos a afirmar un recorte de meses de Transamerica para este diagnóstico. Diga la fecha; no conteste “no” si fue hace catorce meses.",
      faq3q: "Quedé con un lado débil pero camino. ¿Cuenta como silla?",
      faq3a: "Si no usa silla ni scooter por enfermedad, descríbalo así. Si sí usa silla, el archivo cambia: en un producto que cotizamos, silla más ayuda para las tareas diarias no puede emitir; en otro, silla sin esa ayuda todavía puede dejar un plan que paga completo.",
      faq4q: "¿El tabaco después de un derrame me cierra el plan?",
      faq4a: "Suele ser precio de tabaco, no un cierre automático, si el resto pasa. En un producto, nicotina en 12 meses aplica tarifa de tabaco. En otro, derrame más nicotina es otra oferta, no un “no” por el diagnóstico solo.",
      faq5q: "¿El plan sin preguntas es automático después de un derrame?",
      faq5a: "No. Un evento antiguo sin secuelas graves a menudo sigue en un plan con preguntas. El plan sin preguntas es para cuando el cuestionario no puede emitir, o si hay residencia, silla por enfermedad o pérdida de memoria — y solo entre los 50 y los 80 años en lo que cotizamos.",
      faq6q: "¿Puedo comprar para un padre que tuvo un derrame?",
      faq6a: "Sí, si hay interés asegurable — un motivo legítimo de que usted se vería afectado si esa persona fallece — y el padre puede firmar y responder. Un poder notarial no sustituye esa firma. Vea las guías de familia.",
      faq7q: "Tomo un anticoagulante. ¿Eso cierra el plan con preguntas?",
      faq7a: "No vamos a afirmar un sí o un no por el nombre de la pastilla. Liste los nombres. No inventamos una regla nacional de anticoagulantes para este diagnóstico.",
      faq8q: "¿La póliza paga si la causa es otro derrame?",
      faq8a: "Después de emitir, es un seguro de vida: un cheque por una muerte cubierta. Si el plan tiene espera, en esa espera una muerte natural cubierta suele devolver primas, no el monto completo. Un accidente cubierto puede pagar el monto desde el inicio, según el contrato.",
      nextLead: "Vea precios, o programe una llamada con Mejor Vida Seguros. Mencione el año del evento, si fue derrame o AIT, y si quedaron silla, residencia o problemas de memoria.",
      nextMore: `Si el cuestionario no puede emitir, el plan de aceptación garantizada puede seguir abierto entre los 50 y los 80 años. Índice: <a href="${L.hub}">condiciones preexistentes</a>. También <a href="${L.heart}">corazón</a> y <a href="${L.hbp}">presión alta</a> si aplican.`,
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
    title: "Final expense insurance if you had a stroke or TIA (2026) | Mejor Vida Insurance",
    desc: "A stroke or TIA is not an automatic no. How final expense works, why the date matters, and when we will say we do not know.",
    h1: "Can you buy final expense insurance if you had a stroke or TIA?",
    lead: "Often yes. The CDC explains that a <strong>stroke</strong> happens when blood flow to the brain is cut off and part of the brain is damaged. A <strong>TIA</strong> — transient ischemic attack, sometimes called a mini-stroke — is a short blockage; the symptoms look similar and then resolve. On a small burial-size life policy, that label <strong>by itself</strong> is not an automatic no and not an automatic two-year wait. What most often changes the product is <strong>when it happened</strong>, and whether a wheelchair, daily help, or memory problems remained.",
    crumbEnd: "Stroke",
    take1: "The first product to quote is usually a <strong>level plan</strong>: a policy with a short health questionnaire that can pay the full amount from the first covered payment, usually with no two-year wait.",
    take2: "The date of the event usually changes the product more than the word “stroke” or “TIA.” An episode from years ago, with recovery, often still fits a health-question plan. A recent one is reviewed differently — and companies do not all use the same month count.",
    take3: "If the event left a wheelchair from illness, facility care, or memory loss, the file is no longer “stroke only.” See also <a href=\"" + L.disability + "\">disability</a>.",
    callout: "Do not buy a <strong>guaranteed-acceptance</strong> plan — no health questions, and about a two-year wait for natural death — only because there was a stroke years ago. Quote a health-question plan first. Give the year, whether it was a stroke or a TIA, and how you move today.",
    needH: "The worry people actually have",
    needP1: "Families look for this coverage because a funeral, the cemetery, and small debts can fall on relatives. Final expense is permanent life insurance in a small amount, meant for that bill — it does not pay for rehab and it does not replace a large income policy.",
    needP2: "A diagnosis you already have is often called a <strong>pre-existing condition</strong>. That label does not, by itself, mean a two-year wait. The fear is usually: “After the stroke, will they only sell me a plan that waits?” The rest of this page explains that difference <strong>before</strong> naming companies.",
    whatH: "What a stroke and a TIA mean for your health",
    whatP1: "The CDC describes two main kinds of stroke: one from a clot that blocks an artery, and one from a bleed. In both, the brain does not get the oxygen it needs. Fast treatment matters for health. Burial insurance is not the treatment; it asks the history as it is written.",
    whatP2: "The CDC calls a TIA a warning. The blockage lasts a short time — often minutes — and does not leave the same damage. It is still a medical emergency. The NHLBI highlights high blood pressure and tobacco as factors. If you also have blood pressure or heart disease, say so: the questionnaire is no longer a single impairment.",
    whatP3: "An insurer does not treat the brain. It decides whether the history, as it is written and as it appears in prescriptions already filled, fits a product it is willing to issue. It does not order a brain scan at the agency office.",
    howH: "How life insurance reviews a health history",
    howP1: "On final expense the usual path is not an office exam. There is a short questionnaire and, on most products we quote, a review of prescriptions. The NAIC reminds consumers that honest answers matter at claim time.",
    howP2: "If those questions can be answered without hitting what that product cannot issue, the plan is usually level: the full amount can apply to a covered natural death from the first payment. If it cannot issue that way, some products pay less or return premiums in the first years. If even that cannot issue, a guaranteed-acceptance plan asks no health questions and waits about two years for natural death.",
    howP3: "Term life at larger amounts is a different product: sometimes there are labs. A recent stroke usually narrows that path. If the need is income or a mortgage, not burial, see <a href=\"" + L.termCond + "\">term life with pre-existing conditions</a>.",
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
    vsR3H: "If there was a stroke or a TIA",
    vsR3A: "Often still the first try if the date is old and there is no wheelchair from illness.",
    vsR3B: "Some products use this path when the event is more recent.",
    vsR3C: "Reserve for when the questionnaire cannot issue, or if there is facility care, a wheelchair from illness, or memory loss.",
    vsR4H: "Price, in plain terms",
    vsR4A: "Usually the lowest per dollar of these three, if you qualify.",
    vsR4B: "It varies. We will not invent a sample premium here.",
    vsR4C: "Usually costs more per dollar, at the same age and amount.",
    vsLearn: "This chart teaches why we quote the health-question plan first. It is not a quote. The date, the aftermath, and a second diagnosis can still change the column.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. Ads that combine both almost always still have a questionnaire.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage: it can open more coverage, a lower price, and the full benefit from the first covered payment. The limitation is that the same questionnaire can send you to a plan that pays less, or to guaranteed acceptance, if the event is recent or if a wheelchair, a facility, or memory loss remained. Feeling well today does not erase the date. Skipping the year does not erase prescriptions or hospital stays.",
    split1H: "Usually still a health-question plan",
    split1a: "A stroke or TIA from years ago, with recovery, and no wheelchair from illness.",
    split1b: "Walking or physical work several days a week — on one product we quote, that can improve the price if the stroke or TIA is the only listed history.",
    split1c: "High blood pressure that is controlled, with no new event. That is a different conversation; it does not replace the date of the stroke.",
    split2H: "Usually changes the conversation",
    split2a: "An event in the last year, or in the last two, depending on the company. There is no single national month count.",
    split2b: "A wheelchair or scooter from illness, help bathing or dressing, facility care, or memory loss after the event.",
    split2c: "Being in the hospital now, hospice, or pending surgery with general anesthesia.",
    factorsH: "What we can state — and what we cannot",
    factorsP: "Each card starts with the health idea. The right side lists only what we can state for the burial products we quote. If companies do not agree, we say so.",
    factorsNote: "These notes are not a quote. Age, weight, and a second diagnosis can still change the outcome.",
    fMeaning: "In plain language",
    fVerify: "What we can state",
    f1c: "Stroke or TIA",
    f1w: "The CDC treats a stroke and a TIA as different events for health. A TIA is a brief warning; a stroke leaves damage. For burial insurance, companies do not all treat them the same.",
    f1items: [
      "On Transamerica Immediate Solution, stroke and TIA can still leave a health-question plan that pays in full if that is the only listed history.",
      "On Accendo, stroke and TIA use the same date windows: there is no published exception that “a TIA always pays from day one.”",
    ],
    f1gap: "We will not say “a TIA always opens the plan that pays in full at every company.” The companies do not agree.",
    f2c: "How long ago it was",
    f2w: "The CDC notes that the risk of another event is higher soon after. Insurance asks the year. That is not the same question as “do you feel well now?”",
    f2items: [
      "On Accendo, a stroke or TIA in the last year usually goes to a plan that pays less at first. Between one and two years it usually still leaves a health-question plan that pays in full. More than two years can still leave that plan.",
      "On Corebridge’s product that does ask health questions, a stroke in the last 12 months cannot issue that product. In the last 24 months it can go to a plan that pays less at first. A TIA in the last six months cannot issue; more than one TIA, ever, cannot issue on that product.",
    ],
    f2gap: "Transamerica Immediate Solution does not publish an “X months ago” cutoff for stroke or TIA. We will not copy Accendo’s cutoff onto that product.",
    f3c: "Living Promise and a year cutoff",
    f3w: "Living Promise uses a yes-or-no questionnaire. It does not publish the same “one year / two years” chart Accendo uses.",
    f3items: [
      "Living Promise lists stroke and TIA among impairments that may adjust the benefit or not issue. That is not a published automatic no.",
    ],
    f3gap: "We will not state a Living Promise month cutoff for this diagnosis. Give the real date when you quote. Do not round “a couple of years ago” if it was eleven months ago.",
    f4c: "Tobacco after the event",
    f4w: "The NHLBI lists tobacco as a stroke factor. For insurance, tobacco usually means recent nicotine — cigarettes, vaping, a patch, or a cigar.",
    f4items: [
      "On Transamerica Immediate Solution, nicotine in the last 12 months applies a tobacco price. That is not, by itself, an automatic close if the rest passes.",
      "On Americo Eagle Select, stroke or TIA plus nicotine is usually a different offer of that product, not an automatic close on the diagnosis alone.",
    ],
    f4gap: "We will not say “tobacco after a stroke always closes every company.” Say whether you smoke, vape, use a patch, or a cigar.",
    f5c: "Wheelchair, facility, or memory",
    f5w: "A stroke can leave weakness, a chair, or memory problems. That is no longer “the event only.” See <a href=\"" + L.disability + "\">disability</a> if that applies.",
    f5items: [
      "On Transamerica Immediate Solution, a wheelchair or scooter can still leave a health-question plan that pays in full if you do not need help with daily tasks. If there is help, it is reviewed as assisted care: being there now cannot issue that product.",
      "On Americo Eagle Select, depending on a wheelchair or motorized device, or help bathing or dressing, in the last 12 months stops that product from issuing.",
    ],
    f5gap: "A weak side you still walk with is not the same as a wheelchair from illness. Describe it precisely. Do not round it.",
    f6c: "Blood thinners and other pills",
    f6w: "After a stroke or a TIA, a doctor often prescribes blood-thinner or blood-pressure pills. The insurer sees them in prescriptions already filled if the product reviews prescriptions.",
    f6items: [
      "List the names when you quote. Do not skip a pill on a form that does ask for medications.",
    ],
    f6gap: "We will not state that “every blood thinner closes the health-question plan.” We also do not publish a public pill-by-pill list. Bring the names.",
    f7c: "Walking or physical work",
    f7w: "Moving regularly does not “erase” the stroke. On one product we quote, walking or physical work several days a week can improve the monthly price when the stroke or TIA is the only listed history.",
    f7items: [
      "That is not a promise of approval. Weight, tobacco, and other diagnoses go on the same application.",
    ],
    f8c: "High blood pressure or heart disease with the event",
    f8w: "The NHLBI lists high blood pressure as a common factor. A heart attack or heart surgery is a different history, not the same file.",
    f8items: [
      "On Americo Eagle Select, any two of heart disease, diabetes, and stroke or TIA is usually a different offer of that product, not the same as a single factor.",
      "A heart attack and a stroke are quoted with their own dates. Do not blend them into one sentence.",
    ],
    f8gap: "If there is also heart disease or high blood pressure, use those pages. We will not promise an extra charge labeled “stroke plus blood pressure.”",
    costH: "Sample monthly prices if a health-question plan issues",
    costP: "These figures are illustrative monthly premiums, non-tobacco, for a final expense plan that can pay in full if the questionnaire issues. Read them as the size of the product by age and sex — not as the “price of having had a stroke.” Tobacco users pay more; sometimes tobacco also changes the product.",
    costLearn: "What you should learn from this table: at the same coverage amount, the monthly price rises with age, and men usually pay more than women. Tobacco (not shown here) raises it again. Some amounts are scaled from a published band. This is not an offer.",
    costFoot: "A guaranteed-acceptance plan, at the same age and amount, usually costs more and waits about two years for natural death. Use that table only if the questionnaire cannot issue.",
    coH: "Companies we can quote",
    coP: "After you understand the three paths, these are appointed companies Mejor Vida Insurance can quote. With a stroke or a TIA, they do not all issue the same kind of plan. Ages and amounts vary. Approval is not guaranteed.",
    faq1q: "I had a TIA five years ago. Is there a wait?",
    faq1a: "Often not, if the rest of the questionnaire is clean. On one product we quote, a TIA can still leave a plan that pays in full. On another, a TIA uses the same date windows as a stroke. Quote with the real year. We will not say a TIA always pays from day one at every company.",
    faq2q: "The stroke was 14 months ago. Which product?",
    faq2a: "That is recent for some companies and not for others. On Accendo, between one and two years it usually still leaves a health-question plan that pays in full. On Corebridge’s health-question product, a stroke in the last 24 months can go to a plan that pays less. We will not state a Transamerica month cutoff for this diagnosis. Give the date; do not answer “no” if it was fourteen months ago.",
    faq3q: "I have a weak side but I walk. Does that count as a wheelchair?",
    faq3a: "If you do not use a chair or scooter from illness, describe it that way. If you do use a chair, the file changes: on one product we quote, a chair plus help with daily tasks cannot issue; on another, a chair without that help can still leave a plan that pays in full.",
    faq4q: "Does tobacco after a stroke close the plan?",
    faq4a: "It is usually a tobacco price, not an automatic close, if the rest passes. On one product, nicotine in 12 months applies a tobacco rate. On another, stroke plus nicotine is a different offer, not a no on the diagnosis alone.",
    faq5q: "Is the no-questions plan automatic after a stroke?",
    faq5a: "No. An old event without serious aftermath often still fits a health-question plan. The no-questions plan is for when the questionnaire cannot issue, or if there is facility care, a wheelchair from illness, or memory loss — and only from ages 50 to 80 on what we quote.",
    faq6q: "Can I buy for a parent who had a stroke?",
    faq6a: "Yes, if there is insurable interest — a legitimate reason you would be affected if that person died — and the parent can sign and answer. A power of attorney does not replace that signature. See the family guides.",
    faq7q: "I take a blood thinner. Does that close the health-question plan?",
    faq7a: "We will not state a yes or a no from the pill name. List the names. We will not invent a national blood-thinner rule for this diagnosis.",
    faq8q: "Does the policy pay if the cause is another stroke?",
    faq8a: "Once it is issued, this is life insurance: a check for a covered death. If the plan has a wait, during that wait a covered natural death usually returns premiums, not the full amount. A covered accident can pay the full amount from the start, per the contract.",
    nextLead: "See prices, or schedule a call with Mejor Vida Insurance. Mention the year of the event, whether it was a stroke or a TIA, and whether a chair, a facility, or memory problems remained.",
    nextMore: `If the questionnaire cannot issue, a guaranteed-acceptance plan may still be open from ages 50 to 80. Index: <a href="${L.hub}">pre-existing conditions</a>. Also <a href="${L.heart}">heart disease</a> and <a href="${L.hbp}">high blood pressure</a> if they apply.`,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    coFoot: "Educational cards for appointed companies. A plan that pays less or returns premiums in the first years, or a guaranteed-acceptance plan, may add a wait. Not a binding quote.",
  };
}

function strokeMain(lang, page, c) {
  return teachConditionMain(lang, page, c);
}

module.exports = {
  LINKS,
  appointedCardsHtml,
  giCardHtml,
  planCompareHtml,
  faqsHtml,
  nextStepBandHtml,
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
