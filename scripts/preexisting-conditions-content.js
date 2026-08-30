"use strict";

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
<p class="lic-rate-note" data-lic-note></p>
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
      take1: "Un diagnóstico no lo encierra, por sí solo, en aceptación garantizada. Muchas personas contestan un cuestionario corto y, si esas respuestas caben, reciben un plan que puede pagar el monto completo desde el primer pago cubierto.",
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
    take1: "A diagnosis does not, by itself, lock you into guaranteed acceptance. Many people still complete a short health questionnaire and, if those answers fit, receive a plan that can pay the full amount from the first covered payment.",
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
      lead: "El CDC sitúa las enfermedades del corazón entre las causas más frecuentes de muerte en Estados Unidos. Para gastos finales, “corazón” no es una sola casilla. Un infarto de hace diez años, con pastillas y sin internaciones nuevas, a menudo <strong>sigue en un plan nivelado</strong>. Un evento en los últimos dos años, o insuficiencia cardíaca, se mira con más cuidado.",
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
    lead: "The CDC lists heart disease among the most common causes of death in the United States. For final expense, “heart” is not one checkbox. A heart attack ten years ago, with pills and no new hospital stays, often <strong>still fits a level plan</strong>. An event in the last two years, or heart failure, is reviewed more carefully.",
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
    toc: isEs
      ? [["#what", "Qué es"], ["#uw", "Suscripción"], ["#changes", "Qué cambia"], ["#cost", "Costo"], ["#companies", "Compañías"], ["#faq", "Preguntas"]]
      : [["#what", "What it is"], ["#uw", "Underwriting"], ["#changes", "What changes"], ["#cost", "Cost"], ["#companies", "Companies"], ["#faq", "Questions"]],
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
      ? '<a href="https://www.cdc.gov/high-blood-pressure/about/index.html" rel="noopener" target="_blank">CDC: presión arterial alta</a> — es frecuente; muchas personas la controlan con medicamentos.'
      : '<a href="https://www.cdc.gov/high-blood-pressure/about/index.html" rel="noopener" target="_blank">CDC: high blood pressure</a> — it is common; many people control it with medication.',
    src3: isEs
      ? '<a href="https://www.nhlbi.nih.gov/health/high-blood-pressure" rel="noopener" target="_blank">NHLBI: presión alta</a> — qué es y por qué se trata; no es una regla de seguros.'
      : '<a href="https://www.nhlbi.nih.gov/health/high-blood-pressure" rel="noopener" target="_blank">NHLBI: high blood pressure</a> — what it is and why it is treated; not an insurance rule.',
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de gastos finales con presión arterial alta (2026) | Mejor Vida Seguros",
      desc: "La presión alta, sola, casi nunca empuja a aceptación garantizada. Cómo la miran las compañías designadas y cuándo otras condiciones cambian el plan.",
      h1: "Seguro de gastos finales si tiene presión arterial alta",
      lead: "La presión arterial alta es una de las condiciones más comunes en adultos mayores. El CDC explica que a menudo no da síntomas y se controla con medicamentos. En gastos finales, <strong>un “sí” a presión alta casi nunca es el final del camino nivelado</strong>. Lo que sí cambia el producto es un derrame, un infarto reciente, enfermedad renal avanzada u oxígeno.",
      crumbEnd: "Presión alta",
      take1: "Tener una receta de lisinopril u otro antihipertensivo es cotidiano en estas solicitudes. No es, por sí solo, un descalificador en Living Promise, Accendo o Transamerica Immediate Solution.",
      take2: "El precio de un plan nivelado sigue a edad, sexo y tabaco. No publicamos un recargo separado llamado “presión alta.”",
      take3: "Si la presión alta viene con derrame, insuficiencia cardíaca o riñón en diálisis, ya no es “solo presión.” Use esas guías.",
      callout: "No elija GIWL solo porque toma una pastilla para la presión. Cotice primero el simplificado.",
      whatH: "Qué es la presión alta",
      whatP1: "El CDC y el NHLBI describen la hipertensión como una fuerza demasiado alta de la sangre contra las arterias. Durante años puede no notarse. El tratamiento suele ser dieta, movimiento y medicamentos.",
      whatP2: "El seguro de gastos finales no le pide que “esté curado.” Pregunta si hay otros daños: corazón, cerebro, riñón, internaciones.",
      uwH: "Cómo lo miran las compañías designadas",
      uwP: "En emisión simplificada, la presión alta controlada suele pasar el cuestionario si el resto de las respuestas son “no” a los descalificadores. Transamerica trata varios trastornos circulatorios como Preferred cuando no hay complicaciones. La presión no aparece en nuestra lista de situaciones donde el simplificado suele no emitir (esa lista incluye VIH, demencia, oxígeno por pulmón, diálisis, cáncer activo).",
      uwNote: "Si solo tiene presión alta y colesterol, el primer producto a cotizar es nivelado, no GIWL.",
      chH: "Qué suele cambiar la respuesta",
      chP: "La pastilla no. Estos sí.",
      ch1: "Derrame o AIT, sobre todo en los últimos dos años. Vea la guía de derrame.",
      ch2: "Enfermedad del corazón con internación reciente o insuficiencia cardíaca. Vea corazón.",
      ch3: "Daño renal con diálisis o trasplante. Vea riñón.",
      ch4: "Tabaco: no declina por sí solo en estos productos; sí sube la tarifa de tabaco si hubo nicotina en 12 meses (regla de Transamerica en ese gráfico).",
      costH: "Cuánto cuesta un plan nivelado",
      costP: "Primas ilustrativas, no fumador, gastos finales nivelados. Si califica, estas filas son el punto de partida. GIWL no debería ser el primer cuadro que mire por presión alta sola.",
      coH: "Compañías designadas (planes nivelados)",
      coP: "Las mismas fichas de gastos finales que cotizamos para otras condiciones comunes. La presión alta rara vez es la razón de elegir GIWL.",
      faq1q: "Tomo tres pastillas para la presión. ¿Me van a rechazar?",
      faq1a: "El número de pastillas no es, por sí solo, un “no.” Lo que importa es para qué son y si hay internaciones o daño de órgano. Liste los nombres.",
      faq2q: "¿Debo dejar el medicamento antes de solicitar?",
      faq2a: "No. Dejar un antihipertensivo para “verse más sano” es peligroso y las recetas ya están en las bases. Siga el tratamiento de su médico.",
      faq3q: "¿La presión alta cuenta como preexistente?",
      faq3a: "Sí, es una condición previa. En gastos finales eso no significa espera automática. Muchos planes nivelados la aceptan.",
      faq4q: "¿Hay examen de presión en la casa?",
      faq4a: "En estos productos simplificados, no hay enfermera en el hogar para tomar la presión. Hay preguntas y bases de datos.",
      faq5q: "¿Puedo comprar si también fumo?",
      faq5a: "Suele haber tarifa de tabaco, no un cierre automático, si el resto del cuestionario pasa.",
      faq6q: "¿GIWL es más barato a mi edad?",
      faq6a: "Casi nunca, a la misma edad y monto, porque la compañía no selecciona por salud. Cotice nivelado primero.",
      nextLead: "Cotice un plan nivelado con su edad y tabaco. Mencione la presión y los demás diagnósticos.",
      nextMore: `Si también hay corazón o derrame, use esas guías. Índice: <a href="${L.hub}">condiciones preexistentes</a>.`,
    };
  }
  return {
    ...b,
    ...src,
    title: "Final expense insurance with high blood pressure (2026) | Mejor Vida Insurance",
    desc: "High blood pressure by itself almost never pushes you to guaranteed acceptance. How appointed companies treat it, and when other conditions change the plan.",
    h1: "Final expense insurance if you have high blood pressure",
    lead: "High blood pressure is one of the most common conditions in older adults. The CDC explains that it often has no symptoms and is managed with medication. On final expense, <strong>a “yes” to high blood pressure is almost never the end of the level path</strong>. What does change the product is a stroke, a recent heart attack, advanced kidney disease, or oxygen.",
    crumbEnd: "High blood pressure",
    take1: "A lisinopril (or similar) prescription is ordinary on these applications. By itself it is not a knockout on Living Promise, Accendo, or Transamerica Immediate Solution.",
    take2: "A level plan’s price follows age, sex, and tobacco. We do not publish a separate surcharge labeled “high blood pressure.”",
    take3: "If high blood pressure comes with a stroke, heart failure, or kidney disease on dialysis, it is no longer “blood pressure only.” Use those guides.",
    callout: "Do not choose GIWL just because you take a blood-pressure pill. Quote simplified issue first.",
    whatH: "What high blood pressure is",
    whatP1: "The CDC and NHLBI describe hypertension as blood pushing too hard against the arteries. For years it may not be felt. Treatment is usually diet, movement, and medication.",
    whatP2: "Final expense insurance does not ask you to be “cured.” It asks whether there is other damage: heart, brain, kidney, hospital stays.",
    uwH: "How appointed companies look at it",
    uwP: "On simplified issue, controlled high blood pressure usually clears the questionnaire if the rest of the answers are “no” to the knockouts. Transamerica treats several circulatory disorders as Preferred when there are no complications. High blood pressure is not on our list of situations where simplified issue often cannot issue (that list includes HIV, dementia, oxygen for the lungs, dialysis, active cancer).",
    uwNote: "If you only have high blood pressure and cholesterol, the first product to quote is level, not GIWL.",
    chH: "What usually changes the answer",
    chP: "The pill does not. These do.",
    ch1: "Stroke or TIA, especially in the last two years. See the stroke guide.",
    ch2: "Heart disease with a recent hospital stay or heart failure. See heart disease.",
    ch3: "Kidney damage with dialysis or a transplant. See kidney disease.",
    ch4: "Tobacco: it does not decline by itself on these products; it does raise the tobacco rate if there was nicotine in 12 months (Transamerica’s rule on that chart).",
    costH: "What a level plan costs",
    costP: "Illustrative non-tobacco premiums for level final expense. If you qualify, these rows are the starting point. GIWL should not be the first chart you look at for high blood pressure alone.",
    coH: "Appointed companies (level plans)",
    coP: "The same final expense cards we quote for other common conditions. High blood pressure is rarely the reason to choose GIWL.",
    faq1q: "I take three blood-pressure pills. Will they decline me?",
    faq1a: "The number of pills is not, by itself, a “no.” What matters is what they are for and whether there are hospital stays or organ damage. List the names.",
    faq2q: "Should I stop the medication before I apply?",
    faq2a: "No. Stopping a blood-pressure drug to “look healthier” is dangerous, and the prescriptions are already in the databases. Keep your doctor’s treatment.",
    faq3q: "Does high blood pressure count as pre-existing?",
    faq3a: "Yes, it is a prior condition. On final expense that does not mean an automatic wait. Many level plans accept it.",
    faq4q: "Is there a home blood-pressure exam?",
    faq4a: "On these simplified products there is no nurse in the home to take your pressure. There are questions and databases.",
    faq5q: "Can I buy if I also smoke?",
    faq5a: "There is usually a tobacco rate, not an automatic close, if the rest of the questionnaire passes.",
    faq6q: "Is GIWL cheaper at my age?",
    faq6a: "Almost never, at the same age and amount, because the company cannot select by health. Quote level first.",
    nextLead: "Quote a level plan with your age and tobacco. Mention blood pressure and any other diagnoses.",
    nextMore: `If there is also heart disease or a stroke, use those guides. Index: <a href="${L.hub}">pre-existing conditions</a>.`,
  };
}

function hbpMain(lang, page, c) {
  const isEs = lang === "es";
  return condShell(lang, page, c, {
    toc: isEs
      ? [["#what", "Qué es"], ["#uw", "Suscripción"], ["#changes", "Qué cambia"], ["#cost", "Costo"], ["#companies", "Compañías"], ["#faq", "Preguntas"]]
      : [["#what", "What it is"], ["#uw", "Underwriting"], ["#changes", "What changes"], ["#cost", "Cost"], ["#companies", "Companies"], ["#faq", "Questions"]],
    inner: conditionInner(lang, c, {}),
  });
}

function tocPair(isEs) {
  return isEs
    ? [["#what", "Qué es"], ["#uw", "Suscripción"], ["#changes", "Qué cambia"], ["#cost", "Costo"], ["#companies", "Compañías"], ["#faq", "Preguntas"]]
    : [["#what", "What it is"], ["#uw", "Underwriting"], ["#changes", "What changes"], ["#cost", "Cost"], ["#companies", "Companies"], ["#faq", "Questions"]];
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
      ? '<a href="https://www.cdc.gov/copd/index.html" rel="noopener" target="_blank">CDC: EPOC</a> — incluye enfisema y bronquitis crónica; el tabaco es el factor más frecuente.'
      : '<a href="https://www.cdc.gov/copd/index.html" rel="noopener" target="_blank">CDC: COPD</a> — includes emphysema and chronic bronchitis; tobacco is the most common factor.',
    src3: isEs
      ? '<a href="https://www.nhlbi.nih.gov/health/copd" rel="noopener" target="_blank">NHLBI: EPOC</a> — qué es, síntomas y tratamientos (inhaladores, oxígeno); no es una regla de seguros.'
      : '<a href="https://www.nhlbi.nih.gov/health/copd" rel="noopener" target="_blank">NHLBI: COPD</a> — what it is, symptoms, and treatments (inhalers, oxygen); not an insurance rule.',
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de gastos finales con EPOC o enfisema (2026) | Mejor Vida Seguros",
      desc: "EPOC, enfisema o bronquitis crónica: cuándo un plan nivelado sigue abierto, cuándo el tabaco o el oxígeno cambian el producto, y primas de compañías designadas.",
      h1: "Seguro de gastos finales si tiene EPOC o enfisema",
      lead: "EPOC es el nombre corto de una enfermedad pulmonar que dificulta sacar el aire. El CDC y el NHLBI agrupan ahí el enfisema y la bronquitis crónica. Para gastos finales, esas tres etiquetas se tratan de forma parecida. <strong>No es un cierre automático</strong>: muchas solicitudes todavía cotizan. El tabaco y el oxígeno recetado por el pulmón son los detalles que más estrechan las opciones.",
      crumbEnd: "EPOC",
      take1: "En el gráfico de un solo padecimiento de Transamerica, EPOC, enfisema y bronquitis crónica quedan en clase <strong>Standard</strong>. Un crédito de actividad (caminar o trabajo físico varios días a la semana) puede subir a Preferred en ese mismo gráfico.",
      take2: "En las compañías designadas, <strong>EPOC con tabaco</strong> suele hacer que el simplificado no emita. Entonces se mira Corebridge GIWL (edades 50–80, espera de dos años por muerte natural).",
      take3: "Oxígeno recetado por una condición pulmonar — no CPAP solo para apnea del sueño — está en nuestra lista de situaciones donde el simplificado a menudo no emite. Transamerica trata la enfermedad respiratoria crónica como Standard y el CPAP con oxígeno extra como Standard; el CPAP sin oxígeno extra puede ser Preferred.",
      callout: "Diga si fuma o usó nicotina en 12 meses, si le recetaron tanque u oxígeno concentrador, y los inhaladores. Eso decide nivelado, Standard o GIWL — no el anuncio de “sin examen.”",
      whatH: "Qué es la EPOC, en una frase",
      whatP1: "El NHLBI explica que la EPOC daña las vías y los alvéolos, y el aire se queda atrapado. La persona se cansa al caminar, tose o usa inhaladores a diario. El enfisema y la bronquitis crónica son formas de la misma familia.",
      whatP2: "El seguro no le pide una espirometría en el consultorio de la agencia. Pregunta el diagnóstico, el oxígeno, las internaciones y el tabaco. Las recetas de Spiriva, Trelegy u otros inhaladores de EPOC aparecen en las bases de Accendo y de otras compañías.",
      uwH: "Cómo lo miran las compañías que cotizamos",
      uwP: "Living Promise, Accendo y Americo preguntan por pulmón, oxígeno y hospital. Cada formulario es distinto: un “sí” a EPOC puede dejar un plan inmediato en una y no en otra. Transamerica publica el gráfico: EPOC Standard; con crédito de actividad, Preferred, si es el único factor. Las reglas generales de ese documento declinan si hay un factor Decline, o cuatro o más condiciones Standard/Graded juntas.",
      uwNote: "No afirmamos que “el oxígeno siempre tiene espera en todas las compañías de EE. UU.” Lo que sí tenemos: en nuestra lista de descalificadores simplificados, oxígeno por pulmón (no apnea) suele impedir el plan nivelado. En Transamerica, el gráfico todavía puede considerar enfermedad respiratoria crónica.",
      chH: "Qué suele cambiar la respuesta",
      chP: "El diagnóstico solo no cierra. Estos detalles sí.",
      ch1: "Tabaco o nicotina en 12 meses: tarifa de tabaco en Transamerica; en otros simplificados designados, EPOC más tabaco suele ser declinación y se mira GIWL.",
      ch2: "Oxígeno recetado por pulmón (tanque o concentrador), lo use o no todos los días: a menudo GIWL en Living Promise y Accendo. No es lo mismo que CPAP solo para apnea.",
      ch3: "Fibrosis pulmonar: declinación en el gráfico de Transamerica. Hospicio, hospital ahora o cirugía pendiente con anestesia general: también Decline.",
      ch4: "Asma leve sin esteroides diarios ni urgencias en 5 años puede ser Preferred en ese gráfico. No mezcle asma leve con EPOC avanzado al describirse.",
      costH: "Cuánto cuesta un plan nivelado (si califica)",
      costP: "Primas ilustrativas de gastos finales nivelados, no fumador. Si califica a nivelado, el precio sigue a edad, sexo y tabaco. Quien fuma paga tarifa de tabaco. GIWL, si es el único camino, cuesta más a la misma edad y monto y espera dos años por muerte natural.",
      coH: "Compañías designadas (planes nivelados)",
      coP: "Estas fichas son el camino inmediato si el cuestionario emite. No publicamos compañías con las que no trabajamos. Si el simplificado no pasa, el producto designado de aceptación garantizada es Corebridge GIWL.",
      faq1q: "¿Puedo tener beneficio desde el día uno con EPOC?",
      faq1a: "A veces sí, si el cuestionario de esa compañía lo permite — por ejemplo Transamerica en clase Standard cuando la EPOC es el único factor listado. No es una promesa: peso, tabaco, oxígeno y otros diagnósticos entran en la misma solicitud.",
      faq2q: "Uso oxígeno por la noche. ¿Es lo mismo que CPAP?",
      faq2a: "No. Oxígeno por una condición pulmonar está en nuestra lista de descalificadores simplificados. CPAP para apnea, sin oxígeno extra, a menudo se trata mejor (Preferred en Transamerica). Diga cuál aparato le recetaron.",
      faq3q: "Fumo y tengo EPOC. ¿Solo me queda GIWL?",
      faq3a: "En varios simplificados designados, esa combinación suele no emitir. GIWL (50–80, $5,000–$25,000, espera de dos años) puede seguir abierto. Cotice; no asuma el anuncio de televisión.",
      faq4q: "¿Los inhaladores me declinan?",
      faq4a: "Un inhalador de EPOC señala el diagnóstico. No es, por sí solo, el mismo problema que el oxígeno o una internación reciente. Liste los nombres.",
      faq5q: "¿Hay examen de pulmón?",
      faq5a: "En estos gastos finales simplificados, no hay espirometría en el consultorio de la agencia. Hay preguntas y bases de recetas.",
      faq6q: "¿Enfisema se cotiza distinto que EPOC?",
      faq6a: "En Transamerica, enfisema y EPOC siguen la misma fila Standard. Trate las tres etiquetas como la misma conversación, y precise el oxígeno y el tabaco.",
      nextLead: "Diga tabaco, oxígeno e inhaladores. Cotizamos el producto que todavía puede emitir.",
      nextMore: `Si el pulmón no pasa el cuestionario, vea <a href="${L.gi}">aceptación garantizada</a>.`,
    };
  }
  return {
    ...b,
    ...src,
    title: "Final expense insurance with COPD or emphysema (2026) | Mejor Vida Insurance",
    desc: "COPD, emphysema, or chronic bronchitis: when a level plan is still open, when tobacco or oxygen changes the product, and appointed-company premiums.",
    h1: "Final expense insurance if you have COPD or emphysema",
    lead: "COPD is the short name for a lung disease that makes it hard to get air out. The CDC and NHLBI group emphysema and chronic bronchitis there. For final expense, those three labels are treated in a similar way. <strong>It is not an automatic close</strong>: many applications still quote. Tobacco and oxygen prescribed for the lungs are the details that most often narrow the options.",
    crumbEnd: "COPD",
    take1: "On Transamerica’s single-condition chart, COPD, emphysema, and chronic bronchitis are a <strong>Standard</strong> class. An activity credit (walking or physical work several days a week) can move that to Preferred on the same chart.",
    take2: "At appointed companies, <strong>COPD with tobacco</strong> often means simplified issue cannot issue. Then we look at Corebridge GIWL (ages 50–80, two-year wait for natural death).",
    take3: "Oxygen prescribed for a lung condition — not CPAP alone for sleep apnea — is on our list of situations where simplified issue often cannot issue. Transamerica treats chronic respiratory disease as Standard and CPAP with extra oxygen as Standard; CPAP without extra oxygen can be Preferred.",
    callout: "Say whether you smoke or used nicotine in 12 months, whether a tank or concentrator was prescribed, and the inhalers. That decides level, Standard, or GIWL — not the “no exam” ad.",
    whatH: "What COPD is, in one sentence",
    whatP1: "The NHLBI explains that COPD damages the airways and air sacs, and air gets trapped. The person tires when walking, coughs, or uses daily inhalers. Emphysema and chronic bronchitis are forms of the same family.",
    whatP2: "Insurance does not ask for a spirometry test at the agency office. It asks about the diagnosis, oxygen, hospital stays, and tobacco. Prescriptions such as Spiriva, Trelegy, or other COPD inhalers show up in Accendo’s and other companies’ databases.",
    uwH: "How the companies we quote look at it",
    uwP: "Living Promise, Accendo, and Americo ask about lungs, oxygen, and hospital. Each form is different: a “yes” to COPD can leave an immediate plan at one company and not at another. Transamerica publishes the chart: COPD Standard; with an activity credit, Preferred, if it is the only factor. The general rules in that document decline if there is one Decline factor, or four or more Standard/Graded conditions together.",
    uwNote: "We do not claim that “oxygen always has a wait at every U.S. company.” What we do have: on our simplified knockout list, oxygen for the lungs (not apnea) often blocks a level plan. On Transamerica, the chart can still consider chronic respiratory disease.",
    chH: "What usually changes the answer",
    chP: "The diagnosis alone does not close. These details do.",
    ch1: "Tobacco or nicotine in 12 months: tobacco rate at Transamerica; at other appointed simplified plans, COPD plus tobacco often declines and we look at GIWL.",
    ch2: "Oxygen prescribed for the lungs (tank or concentrator), whether you use it every day or not: often GIWL at Living Promise and Accendo. That is not the same as CPAP only for apnea.",
    ch3: "Pulmonary fibrosis: a decline on Transamerica’s chart. Hospice, being in a hospital now, or pending surgery with general anesthesia: also Decline.",
    ch4: "Mild asthma with no daily steroids and no ER visits in 5 years can be Preferred on that chart. Do not mix mild asthma with advanced COPD when you describe yourself.",
    costH: "What a level plan costs (if you qualify)",
    costP: "Illustrative premiums for level final expense, non-tobacco. If you qualify for level, price follows age, sex, and tobacco. Someone who smokes pays a tobacco rate. GIWL, if it is the only path, costs more at the same age and amount and waits two years for natural death.",
    coH: "Appointed companies (level plans)",
    coP: "These cards are the day-one path if the questionnaire issues. We do not publish companies we do not work with. If simplified issue does not pass, the appointed guaranteed-acceptance product is Corebridge GIWL.",
    faq1q: "Can I get a day-one benefit with COPD?",
    faq1a: "Sometimes, if that company’s questionnaire allows it — for example Transamerica at Standard when COPD is the only listed factor. It is not a promise: build, tobacco, oxygen, and other diagnoses go on the same application.",
    faq2q: "I use oxygen at night. Is that the same as CPAP?",
    faq2a: "No. Oxygen for a lung condition is on our simplified knockout list. CPAP for apnea, with no extra oxygen, is often treated better (Preferred at Transamerica). Say which device was prescribed.",
    faq3q: "I smoke and have COPD. Is GIWL my only option?",
    faq3a: "At several appointed simplified plans, that combination often cannot issue. GIWL (ages 50–80, $5,000–$25,000, two-year wait) may still be open. Quote; do not assume the TV ad.",
    faq4q: "Do inhalers decline me?",
    faq4a: "A COPD inhaler flags the diagnosis. By itself it is not the same problem as oxygen or a recent hospital stay. List the names.",
    faq5q: "Is there a lung exam?",
    faq5a: "On these simplified final expense plans, there is no spirometry at the agency office. There are questions and prescription databases.",
    faq6q: "Is emphysema quoted differently from COPD?",
    faq6a: "At Transamerica, emphysema and COPD follow the same Standard row. Treat the three labels as the same conversation, and be precise about oxygen and tobacco.",
    nextLead: "Tell us tobacco, oxygen, and inhalers. We quote the product that can still issue.",
    nextMore: `If the lungs do not pass the questionnaire, see <a href="${L.gi}">guaranteed acceptance</a>.`,
  };
}

function copdMain(lang, page, c) {
  return condPageMain(lang, page, c, {});
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
      ? '<a href="https://www.cancer.gov/about-cancer/understanding/what-is-cancer" rel="noopener" target="_blank">Instituto Nacional del Cáncer: qué es el cáncer</a> — cómo se describe el tratamiento y la remisión; no es una regla de una aseguradora.'
      : '<a href="https://www.cancer.gov/about-cancer/understanding/what-is-cancer" rel="noopener" target="_blank">National Cancer Institute: what cancer is</a> — how treatment and remission are described; not an insurer’s rule.',
    src3: isEs
      ? '<a href="https://www.cdc.gov/cancer/index.html" rel="noopener" target="_blank">CDC: cáncer</a> — tipos frecuentes y por qué el seguimiento importa para la salud.'
      : '<a href="https://www.cdc.gov/cancer/index.html" rel="noopener" target="_blank">CDC: cancer</a> — common types and why follow-up matters for health.',
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de gastos finales con cáncer: cuándo hay espera (2026) | Mejor Vida Seguros",
      desc: "Cáncer en tratamiento activo suele ir a aceptación garantizada. Libre de cáncer y de tratamiento por un tiempo puede volver a gastos finales simplificados. Cómo lo miran las compañías designadas.",
      h1: "Seguro de gastos finales si tiene o tuvo cáncer",
      lead: "El NCI explica que el cáncer es un grupo de enfermedades en las que las células crecen sin control. Para gastos finales, la pregunta útil no es “¿tuvo cáncer alguna vez?” sino <strong>si hay tratamiento ahora, cuándo terminó, y de qué tipo</strong>. Un cáncer de piel basal a menudo sigue en simplificado. Un tratamiento activo de mama, pulmón o colon suele impedir el plan nivelado.",
      crumbEnd: "Cáncer",
      take1: "En las compañías designadas, <strong>cáncer en tratamiento activo</strong> está en la lista de situaciones donde el simplificado suele no emitir. Entonces se mira GIWL (50–80, espera de dos años por muerte natural).",
      take2: "En el gráfico de Transamerica: inicio en los últimos 2 años, metastásico, recurrente, varios cánceres o ganglios: <strong>declinación</strong>. Libre de cáncer y sin tratamiento en los últimos 2 años: <strong>Standard</strong>. El basal cell no entra en esa fila de “otro que basal.”",
      take3: "Algunos cánceres de piel o etapas muy tempranas todavía pueden ir por simplificado. Eso se confirma con el tipo y las recetas, no con un titular de internet.",
      callout: "Diga el tipo, si está en quimio, radiación o pastillas, y la fecha del último tratamiento. Un “no” cuando las recetas de oncológicos dicen “sí” anula el reclamo.",
      whatH: "Qué necesita saber la aseguradora",
      whatP1: "El NCI separa el tumor local, el que se extendió y el que volvió. Usted no tiene que traducir estadio a jerga de seguros. Diga el nombre que usó el oncólogo, si hay metástasis, y si el tratamiento sigue.",
      whatP2: "Las bases de recetas marcan metotrexato, quimioterapia oral u otros oncológicos. Accendo y otras compañías las revisan junto con las preguntas. No omita un medicamento “porque es de la piel.”",
      uwH: "Cómo lo miran las compañías designadas",
      uwP: "Living Promise, Accendo y Americo preguntan por cáncer y tratamiento reciente; un “sí” a tratamiento activo suele sacar el caso del nivelado. Transamerica publica plazos: dos años desde el inicio o el tratamiento. Metastásico, recurrente o varios cánceres: Decline en ese gráfico. Libre de cáncer y de tratamiento 2 años: Standard, si es el único factor. Hodgkin y linfoma se leen como cáncer.",
      uwNote: "GIWL no pregunta el tipo de cáncer. A cambio siempre hay espera de dos años por muerte no accidental. Si ya está libre de tratamiento el tiempo que pide el simplificado, cotice primero el plan inmediato: suele ser más barato.",
      chH: "Qué suele cambiar la respuesta",
      chP: "El año y el tipo pesan más que la palabra “cáncer.”",
      ch1: "Tratamiento en curso (quimio, radiación, inmunoterapia, hormonoterapia activa según el formulario): simplificado a menudo no emite; GIWL si hay edad 50–80.",
      ch2: "Último tratamiento hace más de dos años, sin recurrencia: Transamerica puede quedar Standard. Otras compañías tienen sus propias ventanas; las confirmamos en la solicitud.",
      ch3: "Cáncer de piel no melanoma (basal): a menudo sigue en simplificado. Melanoma se mira como los demás cánceres, no como “solo piel.”",
      ch4: "Varios cánceres distintos, o cáncer infantil en un menor: el gráfico de Transamerica declina. Un adulto con un solo cáncer antiguo no es ese caso.",
      costH: "Cuánto cuesta si califica a nivelado — o GIWL si no",
      costP: "El cuadro de abajo es gastos finales nivelados, no fumador, si el cuestionario emite. Si el cáncer activo manda a GIWL, esas primas no aplican: vea la guía de aceptación garantizada y el cuadro de Corebridge en la página de VIH / GIWL. No mezcle los dos precios.",
      coH: "Compañías designadas (planes nivelados)",
      coP: "Úselas cuando ya no hay tratamiento activo y el plazo del producto se cumple. Si el tratamiento sigue, no fuerce estas fichas: el producto honesto es GIWL.",
      faq1q: "Estoy en quimioterapia. ¿Puedo comprar gastos finales?",
      faq1a: "Sí, en las compañías que cotizamos, el camino habitual es aceptación garantizada (Corebridge GIWL, 50–80), no un plan nivelado. Hay espera de dos años por muerte natural. Un accidente cubierto puede pagar antes, según el contrato.",
      faq2q: "Terminé el tratamiento hace tres años. ¿Hay espera?",
      faq2a: "En Transamerica, libre de cáncer y de tratamiento 2 años puede ser Standard (beneficio inmediato si emiten). Otras compañías tienen sus propias ventanas. Cotice con la fecha real.",
      faq3q: "¿Un cáncer de piel me manda a GIWL?",
      faq3a: "Muchos basales no. El melanoma y cualquier cáncer que haya llegado a ganglios se miran con las reglas de cáncer, no como un lunar simple.",
      faq4q: "¿Debo esperar a la remisión para solicitar?",
      faq4a: "Si quiere nivelado, a veces sí hay que esperar la ventana del producto. Si necesita algo ahora, GIWL puede emitir dentro de 50–80 sin esas preguntas. Esperar también sube la edad y la prima.",
      faq5q: "¿El seguro paga el tratamiento del cáncer?",
      faq5a: "No. Esto es vida: un cheque a los beneficiarios cuando usted fallece. No es un plan de salud ni un “cáncer plus” de suplementos. Accendo Level puede incluir un beneficio acelerado por enfermedad terminal en el plan nivelado, con reglas y tope; no sustituye el tratamiento.",
      faq6q: "Tuve dos cánceres distintos. ¿Qué pasa?",
      faq6a: "En Transamerica, varios cánceres son declinación en ese gráfico. Entonces se mira GIWL si califica por edad. No envíe el simplificado a ciegas.",
      nextLead: "Diga el tipo, la fecha del último tratamiento y si sigue alguna pastilla oncológica.",
      nextMore: `Tratamiento activo: <a href="${L.gi}">aceptación garantizada</a>. Índice: <a href="${L.hub}">condiciones preexistentes</a>.`,
    };
  }
  return {
    ...b,
    ...src,
    title: "Final expense insurance with cancer: when there is a wait (2026) | Mejor Vida Insurance",
    desc: "Cancer in active treatment often goes to guaranteed acceptance. Cancer-free and off treatment for a time can return to simplified final expense. How appointed companies look at it.",
    h1: "Final expense insurance if you have or had cancer",
    lead: "The NCI explains that cancer is a group of diseases where cells grow out of control. For final expense, the useful question is not “did you ever have cancer?” but <strong>whether treatment is happening now, when it ended, and what kind</strong>. Basal skin cancer often stays on simplified issue. Active treatment for breast, lung, or colon cancer usually blocks a level plan.",
    crumbEnd: "Cancer",
    take1: "At appointed companies, <strong>cancer in active treatment</strong> is on the list of situations where simplified issue often cannot issue. Then we look at GIWL (ages 50–80, two-year wait for natural death).",
    take2: "On Transamerica’s chart: onset within 2 years, metastatic, recurrent, multiple cancers, or lymph nodes: <strong>decline</strong>. Cancer-free and no treatment in the last 2 years: <strong>Standard</strong>. Basal cell is not in that “other than basal” row.",
    take3: "Some skin cancers or very early stages may still go simplified. That is confirmed with the type and the prescriptions, not with an internet headline.",
    callout: "Give the type, whether you are on chemo, radiation, or pills, and the date of the last treatment. A “no” when oncology prescriptions say “yes” voids the claim.",
    whatH: "What the insurer needs to know",
    whatP1: "The NCI separates a local tumor, one that has spread, and one that has come back. You do not have to translate stage into insurance jargon. Say the name the oncologist used, whether there is metastasis, and whether treatment is still going.",
    whatP2: "Prescription databases flag methotrexate, oral chemotherapy, and other oncology drugs. Accendo and other companies review them with the questions. Do not skip a medication “because it is for the skin.”",
    uwH: "How appointed companies look at it",
    uwP: "Living Promise, Accendo, and Americo ask about cancer and recent treatment; a “yes” to active treatment usually takes the case off level. Transamerica publishes time windows: two years from onset or treatment. Metastatic, recurrent, or multiple cancers: Decline on that chart. Cancer-free and off treatment 2 years: Standard, if it is the only factor. Hodgkin and lymphoma are read as cancer.",
    uwNote: "GIWL does not ask the cancer type. In return there is always a two-year wait for non-accidental death. If you are already off treatment for the time the simplified product asks, quote the immediate plan first: it is usually cheaper.",
    chH: "What usually changes the answer",
    chP: "The year and the type weigh more than the word “cancer.”",
    ch1: "Treatment in progress (chemo, radiation, immunotherapy, or active hormone therapy depending on the form): simplified issue often cannot issue; GIWL if you are ages 50–80.",
    ch2: "Last treatment more than two years ago, no recurrence: Transamerica can be Standard. Other companies have their own windows; we confirm them on the application.",
    ch3: "Non-melanoma skin cancer (basal): often stays simplified. Melanoma is reviewed with the other cancers, not as “just skin.”",
    ch4: "Several different cancers, or childhood cancer on a minor: Transamerica’s chart declines. An adult with one old cancer is not that case.",
    costH: "What it costs if you qualify for level — or GIWL if not",
    costP: "The table below is level final expense, non-tobacco, if the questionnaire issues. If active cancer sends you to GIWL, those premiums do not apply: see the guaranteed-acceptance guide. Do not mix the two prices.",
    coH: "Appointed companies (level plans)",
    coP: "Use these when treatment is no longer active and the product’s time window is met. If treatment is still going, do not force these cards: the honest product is GIWL.",
    faq1q: "I am on chemotherapy. Can I buy final expense?",
    faq1a: "Yes. At the companies we quote, the usual path is guaranteed acceptance (Corebridge GIWL, ages 50–80), not a level plan. There is a two-year wait for natural death. A covered accident can pay sooner, according to the contract.",
    faq2q: "I finished treatment three years ago. Is there a wait?",
    faq2a: "At Transamerica, cancer-free and off treatment 2 years can be Standard (immediate benefit if they issue). Other companies have their own windows. Quote with the real date.",
    faq3q: "Does skin cancer send me to GIWL?",
    faq3a: "Many basals do not. Melanoma and any cancer that reached lymph nodes are reviewed under cancer rules, not as a simple mole.",
    faq4q: "Should I wait for remission to apply?",
    faq4a: "If you want level, you sometimes have to wait out the product’s window. If you need something now, GIWL can issue within ages 50–80 without those questions. Waiting also raises age and premium.",
    faq5q: "Does this insurance pay for cancer treatment?",
    faq5a: "No. This is life insurance: a check to the beneficiaries when you die. It is not a health plan or a “cancer plus” supplement. Accendo Level can include an accelerated benefit for terminal illness on the level plan, with rules and a cap; it does not replace treatment.",
    faq6q: "I had two different cancers. What happens?",
    faq6a: "At Transamerica, multiple cancers are a decline on that chart. Then we look at GIWL if you qualify by age. Do not send simplified issue blindly.",
    nextLead: "Give the type, the date of last treatment, and whether any oncology pill is still in use.",
    nextMore: `Active treatment: <a href="${L.gi}">guaranteed acceptance</a>. Index: <a href="${L.hub}">pre-existing conditions</a>.`,
  };
}

function cancerMain(lang, page, c) {
  return condPageMain(lang, page, c, {});
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
      ? '<a href="https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd" rel="noopener" target="_blank">NIDDK: enfermedad renal crónica</a> — etapas, diálisis y trasplante; contexto de salud, no una tarifa de seguros.'
      : '<a href="https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd" rel="noopener" target="_blank">NIDDK: chronic kidney disease</a> — stages, dialysis, and transplant; health context, not an insurance rate.',
    src3: isEs
      ? '<a href="https://www.cdc.gov/kidney-disease/index.html" rel="noopener" target="_blank">CDC: enfermedad renal</a> — vínculo frecuente con diabetes y presión alta.'
      : '<a href="https://www.cdc.gov/kidney-disease/index.html" rel="noopener" target="_blank">CDC: kidney disease</a> — a frequent link with diabetes and high blood pressure.',
  });
  if (isEs) {
    return {
      ...b,
      ...src,
      title: "Seguro de gastos finales con enfermedad renal o diálisis (2026) | Mejor Vida Seguros",
      desc: "La etapa de la enfermedad renal y si hay diálisis o trasplante importan más que la palabra “riñón.” Cómo lo miran Living Promise, Accendo, Transamerica y GIWL.",
      h1: "Seguro de gastos finales si tiene enfermedad renal",
      lead: "El NIDDK describe la enfermedad renal crónica como daño que se acumula con los años. A menudo viene con diabetes o presión alta. Para gastos finales, <strong>no es una sola casilla</strong>. Una etapa temprana sin diálisis puede seguir en simplificado. Diálisis, enfermedad avanzada o un trasplante de órgano están en nuestra lista de situaciones donde el simplificado a menudo no emite.",
      crumbEnd: "Riñón",
      take1: "Living Promise, Accendo y Americo suelen no emitir un plan nivelado si hay <strong>diálisis, riñón terminal o trasplante</strong>. Entonces se mira Corebridge GIWL.",
      take2: "El gráfico de un solo padecimiento de Transamerica lista enfermedad renal crónica, fallo renal y diálisis como <strong>Standard</strong> cuando es el único factor. Un <strong>trasplante de órgano es Decline</strong> en ese mismo gráfico. El perfil completo (diabetes, peso, recetas) todavía decide.",
      take3: "No afirmamos que “solo dos compañías en el país cubren diálisis sin espera.” Cotizamos lo que tenemos designado, con las reglas de cada producto.",
      callout: "Diga la etapa si la conoce, si va a diálisis, si está en lista de trasplante y si la causa es diabetes. Un archivo “solo creatinina alta” no es el mismo que tres sesiones de diálisis por semana.",
      whatH: "Qué es la enfermedad renal, en una frase",
      whatP1: "El NIDDK explica que los riñones filtran la sangre. Cuando el filtrado baja con el tiempo, se habla de enfermedad crónica por etapas. La etapa 5 suele necesitar diálisis o un trasplante.",
      whatP2: "El CDC recuerda que diabetes y presión alta son causas frecuentes. Si tiene las tres, el cuestionario ya no es “solo riñón.” Vea también diabetes y presión alta.",
      uwH: "Cómo lo miran las compañías designadas",
      uwP: "Nuestra lista de descalificadores simplificados incluye diálisis, enfermedad renal avanzada y trasplante. Eso cubre la práctica habitual en Living Promise y Accendo. Transamerica publica un gráfico distinto: diálisis y ERC pueden quedar Standard si no hay otro Decline. Trasplante: Decline. No mezcle esas dos frases en una sola promesa al cliente.",
      uwNote: "Si está en diálisis, cotice GIWL y, si la edad y el resto del perfil encajan, pregunte también por Transamerica. No envíe Living Promise a ciegas.",
      chH: "Qué suele cambiar la respuesta",
      chP: "La palabra “riñón” no basta. Estos detalles sí.",
      ch1: "Diálisis actual: en varios simplificados designados, GIWL. En Transamerica, Standard en el gráfico de un solo factor — la solicitud completa puede ser otra historia.",
      ch2: "Trasplante de órgano (o estar en lista, según el formulario): Decline en Transamerica; en nuestra lista simplificada, el trasplante impide el nivelado.",
      ch3: "ERC por diabetes, con insulina, internaciones o amputación: ya no es un solo padecimiento. Vea diabetes.",
      ch4: "Medicamentos como furosemida (Lasix) aparecen en listas de Accendo ligadas a hígado o riñón. Liste el nombre; no lo esconda.",
      costH: "Cuánto cuesta un plan nivelado (si califica)",
      costP: "El cuadro es gastos finales nivelados, no fumador, si el cuestionario emite. En diálisis, no asuma estas filas: muchas veces el precio que aplica es el de GIWL (salud no cambia esa prima; edad y monto sí).",
      coH: "Compañías designadas (planes nivelados)",
      coP: "Úselas cuando no hay diálisis ni trasplante y el resto del cuestionario está limpio. Si hay diálisis, el producto honesto suele ser GIWL, con Transamerica como posible excepción según el gráfico y el perfil.",
      faq1q: "Estoy en diálisis. ¿Puedo tener beneficio desde el día uno?",
      faq1a: "En Living Promise y Accendo, el simplificado suele no emitir. GIWL tiene espera de dos años por muerte natural. Transamerica puede considerar diálisis como Standard en su gráfico de un solo padecimiento; eso no es una emisión automática. Cotice los dos caminos con los hechos reales.",
      faq2q: "Tengo etapa 3, sin diálisis. ¿Hay espera?",
      faq2a: "A menudo no, si el resto del cuestionario pasa. La etapa y las recetas importan. No invente una etapa más baja.",
      faq3q: "Me recomendaron trasplante. ¿Qué producto?",
      faq3a: "Trasplante de órgano es Decline en Transamerica y está en nuestra lista simplificada de “no emite.” GIWL (50–80) es el camino habitual.",
      faq4q: "La causa es diabetes. ¿Se cotiza peor?",
      faq4a: "El archivo deja de ser un solo factor. Diabetes más riñón más internaciones puede bajar la clase o impedir el simplificado. Diga ambas.",
      faq5q: "¿El seguro paga la diálisis?",
      faq5a: "No. Es vida: un cheque a los beneficiarios. Medicare y el plan de salud cubren el tratamiento, no esta póliza.",
      faq6q: "¿Hasta qué edad GIWL si estoy en diálisis?",
      faq6a: "Corebridge GIWL emite de 50 a 80, $5,000–$25,000. Después de 80 no hay “sí automático” sin cuestionario en lo que cotizamos.",
      nextLead: "Diga etapa, diálisis, trasplante y si hay diabetes.",
      nextMore: `Diálisis o trasplante: <a href="${L.gi}">aceptación garantizada</a>. Índice: <a href="${L.hub}">condiciones preexistentes</a>.`,
    };
  }
  return {
    ...b,
    ...src,
    title: "Final expense insurance with kidney disease or dialysis (2026) | Mejor Vida Insurance",
    desc: "Kidney-disease stage and whether dialysis or a transplant is in play matter more than the word “kidney.” How Living Promise, Accendo, Transamerica, and GIWL treat it.",
    h1: "Final expense insurance if you have kidney disease",
    lead: "The NIDDK describes chronic kidney disease as damage that builds over years. It often comes with diabetes or high blood pressure. For final expense, <strong>it is not one checkbox</strong>. An early stage without dialysis can still fit simplified issue. Dialysis, end-stage kidney disease, or an organ transplant are on our list of situations where simplified issue often cannot issue.",
    crumbEnd: "Kidney disease",
    take1: "Living Promise, Accendo, and Americo often cannot issue a level plan if there is <strong>dialysis, end-stage kidney disease, or a transplant</strong>. Then we look at Corebridge GIWL.",
    take2: "Transamerica’s single-condition chart lists chronic kidney disease, kidney failure, and dialysis as <strong>Standard</strong> when that is the only factor. An <strong>organ transplant is Decline</strong> on the same chart. The full profile (diabetes, build, prescriptions) still decides.",
    take3: "We do not claim that “only two companies in the country cover dialysis with no wait.” We quote what we have appointed, with each product’s rules.",
    callout: "Give the stage if you know it, whether you go to dialysis, whether you are on a transplant list, and whether diabetes is the cause. A file that is “only a high creatinine” is not the same as three dialysis sessions a week.",
    whatH: "What kidney disease is, in one sentence",
    whatP1: "The NIDDK explains that the kidneys filter blood. When that filter declines over time, it is called chronic disease by stages. Stage 5 often needs dialysis or a transplant.",
    whatP2: "The CDC notes that diabetes and high blood pressure are common causes. If you have all three, the questionnaire is no longer “kidney only.” See diabetes and high blood pressure too.",
    uwH: "How appointed companies look at it",
    uwP: "Our simplified knockout list includes dialysis, advanced kidney disease, and transplant. That covers the usual practice on Living Promise and Accendo. Transamerica publishes a different chart: dialysis and CKD can be Standard if there is no other Decline. Transplant: Decline. Do not blend those two sentences into one promise to the client.",
    uwNote: "If you are on dialysis, quote GIWL and, if age and the rest of the profile fit, also ask about Transamerica. Do not send Living Promise blindly.",
    chH: "What usually changes the answer",
    chP: "The word “kidney” is not enough. These details are.",
    ch1: "Current dialysis: at several appointed simplified plans, GIWL. At Transamerica, Standard on the single-factor chart — the full application can still be another story.",
    ch2: "Organ transplant (or being on the list, depending on the form): Decline at Transamerica; on our simplified list, a transplant blocks level.",
    ch3: "CKD from diabetes, with insulin, hospital stays, or amputation: it is no longer a single impairment. See diabetes.",
    ch4: "Medications such as furosemide (Lasix) appear on Accendo lists tied to liver or kidney. List the name; do not hide it.",
    costH: "What a level plan costs (if you qualify)",
    costP: "The table is level final expense, non-tobacco, if the questionnaire issues. On dialysis, do not assume these rows: often the price that applies is GIWL (health does not change that premium; age and amount do).",
    coH: "Appointed companies (level plans)",
    coP: "Use these when there is no dialysis or transplant and the rest of the questionnaire is clean. If dialysis is in play, the honest product is usually GIWL, with Transamerica as a possible exception based on the chart and the profile.",
    faq1q: "I am on dialysis. Can I get a day-one benefit?",
    faq1a: "At Living Promise and Accendo, simplified issue usually cannot issue. GIWL has a two-year wait for natural death. Transamerica can consider dialysis as Standard on its single-condition chart; that is not automatic issue. Quote both paths with the real facts.",
    faq2q: "I have stage 3, no dialysis. Is there a wait?",
    faq2a: "Often not, if the rest of the questionnaire passes. Stage and prescriptions matter. Do not invent a lower stage.",
    faq3q: "They recommended a transplant. Which product?",
    faq3a: "An organ transplant is Decline at Transamerica and is on our simplified “cannot issue” list. GIWL (ages 50–80) is the usual path.",
    faq4q: "The cause is diabetes. Is it quoted worse?",
    faq4a: "The file is no longer a single factor. Diabetes plus kidney plus hospital stays can drop the class or block simplified issue. Say both.",
    faq5q: "Does this insurance pay for dialysis?",
    faq5a: "No. It is life insurance: a check to the beneficiaries. Medicare and the health plan cover treatment, not this policy.",
    faq6q: "Until what age is GIWL if I am on dialysis?",
    faq6a: "Corebridge GIWL issues ages 50–80, $5,000–$25,000. After 80 there is no “automatic yes” without a questionnaire on what we quote.",
    nextLead: "Give stage, dialysis, transplant, and whether diabetes is involved.",
    nextMore: `Dialysis or transplant: <a href="${L.gi}">guaranteed acceptance</a>. Index: <a href="${L.hub}">pre-existing conditions</a>.`,
  };
}

function kidneyMain(lang, page, c) {
  return condPageMain(lang, page, c, {});
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
      take2: "En nuestra lista simplificada, silla de ruedas, scooter o cama <strong>por una enfermedad</strong> (no una lesión breve) suele impedir el plan nivelado. Un hospital, residencia, hospicio o home health también.",
      take3: "En Transamerica, silla o scooter eléctrico puede ser <strong>Preferred</strong> si no necesita asistencia; si hay ayuda de otra persona, se lee como “assisted living” y la internación actual es Decline. Esas dos reglas no son iguales: por eso cotizamos el producto, no un rumor.",
      callout: "Diga por qué usa la silla (artritis, EPOC, un accidente de hace un mes), si alguien le ayuda a bañarse, y dónde vive. Eso decide nivelado o GIWL.",
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
    take2: "On our simplified list, a wheelchair, scooter, or being bedridden <strong>from illness</strong> (not a short injury) often blocks a level plan. A hospital, nursing home, hospice, or home health does too.",
    take3: "At Transamerica, a wheelchair or electric scooter can be <strong>Preferred</strong> if you do not need assistance; if someone helps you, it is read as assisted living, and current confinement is Decline. Those two rules are not the same: that is why we quote the product, not a rumor.",
    callout: "Say why you use the chair (arthritis, COPD, a crash a month ago), whether anyone helps you bathe, and where you live. That decides level or GIWL.",
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
      lead: "El CDC explica que el VIH es un virus que ataca el sistema inmune; con tratamiento muchas personas viven una vida larga. En los productos de gastos finales que cotizamos, esa mejora médica <strong>no abre el cuestionario simplificado</strong>. Un diagnóstico de VIH o SIDA suele ser declinación en Living Promise, Accendo, Americo y en el gráfico de Transamerica. El camino que sí cotizamos es aceptación garantizada.",
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
    lead: "The CDC explains that HIV is a virus that attacks the immune system; with treatment many people live a long life. On the final expense products we quote, that medical progress <strong>does not open the simplified questionnaire</strong>. An HIV or AIDS diagnosis is usually a decline at Living Promise, Accendo, Americo, and on Transamerica’s chart. The path we do quote is guaranteed acceptance.",
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
      lead: "El CDC explica que un derrame ocurre cuando se corta el riego al cerebro; un AIT es un episodio breve con síntomas parecidos que se resuelven. Para gastos finales, <strong>el año del evento importa más que la etiqueta</strong>. Un derrame de 2015, con recuperación y sin silla por enfermedad, a menudo sigue en simplificado. Un evento en los últimos dos años se pregunta aparte.",
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
    lead: "The CDC explains that a stroke happens when blood flow to the brain is cut off; a TIA is a short episode with similar symptoms that resolve. For final expense, <strong>the year of the event matters more than the label</strong>. A 2015 stroke, with recovery and no wheelchair from illness, often stays on simplified issue. An event in the last two years is asked separately.",
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
