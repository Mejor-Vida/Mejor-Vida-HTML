#!/usr/bin/env node
/**
 * Bilingual city final-expense pages.
 * Lincoln layout is canonical (scripts/city-guides/{slug}.js + city-guide-html.js).
 * Omaha stays layout: "classic" until it is rebuilt to the same format.
 * Usage: node scripts/render-city-coverage-pages.js
 */
const fs = require("fs");
const path = require("path");
const { guideMain } = require("./city-guide-html");
const lincolnCity = require("./city-guides/lincoln");

const ROOT = path.join(__dirname, "..");
const HEADER_ES = path.join(ROOT, "includes/site-header-inner.html");
const HEADER_EN = path.join(ROOT, "includes/en-site-header.html");
const FOOTER_ES = path.join(ROOT, "includes/site-footer-inner.html");
const FOOTER_EN = path.join(ROOT, "includes/en-site-footer.html");

const NPN = "21695431";
const CSS_VER = "20260917-city-guide1";

const LICENSE = {
  NE: {
    typeEs: "Productora residente",
    typeEn: "Resident producer",
    number: "21695431",
    code: "NE",
  },
};

const CITIES = [
  {
    slug: "omaha",
    layout: "classic",
    nameEs: "Omaha",
    nameEn: "Omaha",
    stateSlug: "nebraska",
    stateNameEs: "Nebraska",
    stateNameEn: "Nebraska",
    stateCode: "NE",
    heroFile: "omaha-bob-kerrey-bridge",
    heroCaptionEs: "Puente peatonal Bob Kerrey, Omaha",
    heroCaptionEn: "Bob Kerrey Pedestrian Bridge, Omaha",
    heroClass: "",
    heroW: 1024,
    heroH: 591,
    heroVer: "bridge-v1",
    titleEs: "Seguro de gastos finales en Omaha | Mejor Vida Seguros",
    titleEn: "Final Expense Insurance in Omaha | Mejor Vida Insurance",
    descEs:
      "Mejor Vida Seguros compara seguro de gastos finales en Omaha. Precios de funerarias locales, primas ilustrativas y licencia de Nebraska (NPN #21695431).",
    descEn:
      "Mejor Vida Insurance compares final expense coverage in Omaha. Local funeral-home prices, illustrative premiums, and Nebraska licensing (NPN #21695431).",
    bulletsEs: [
      `Cremación directa publicada en Omaha desde <strong>$995</strong> (Chapel of Memories). Un entierro con velatorio en la región ronda <strong>$8,755</strong> (NFDA 2023).`,
      `Mejor Vida Seguros compara compañías designadas según su edad, salud y presupuesto.`,
      `Licenciados para vender seguro de vida en Nebraska. NPN #${NPN}.`,
    ],
    bulletsEn: [
      `Direct cremation in Omaha is published from <strong>$995</strong> (Chapel of Memories). A funeral with viewing in the region is about <strong>$8,755</strong> (NFDA 2023).`,
      `Mejor Vida Insurance compares appointed companies based on your age, health, and budget.`,
      `Licensed to sell life insurance in Nebraska. NPN #${NPN}.`,
    ],
    funeralIntroEs:
      "No publicamos un “promedio de Omaha” inventado. Estas cifras salen de funerarias que publican su lista o de tableros que citan esas listas. Pida siempre la <strong>lista general de precios (GPL)</strong> a la funeraria. El lote, la bóveda y la lápida casi nunca van incluidos.",
    funeralIntroEn:
      "We do not invent an “average funeral in Omaha.” These figures come from funeral homes that publish a list, or from boards that cite those lists. Always ask the home for its <strong>General Price List (GPL)</strong>. The cemetery plot, vault, and marker are almost never included.",
    funeralRowsEs: [
      {
        source:
          '<a href="https://chapelofmemories.com/" rel="noopener" target="_blank">Chapel of Memories</a><br/><span class="small text-body-secondary">4712 S 82nd St, Omaha · 402-551-1011</span>',
        price: "Cremación directa desde <strong>$995</strong>",
        notes:
          "Revisado 16 sep. 2026. Atienden Omaha y el condado Douglas. No es un precio de Mejor Vida Seguros.",
      },
      {
        source:
          '<a href="https://www.funeralocity.com/search/ne/omaha/" rel="noopener" target="_blank">Funeralocity · Omaha</a>',
        price: "Cremación directa listada cerca de <strong>$995–$1,760</strong>",
        notes: "Tablero de varias funerarias, no una mediana. Los precios cambian; pida la GPL.",
      },
      {
        source: "NFDA 2023 · West North Central",
        price:
          "Entierro con velatorio <strong>$8,755</strong> · Cremación con velatorio <strong>$6,713</strong>",
        notes: "Mediana regional (Nebraska comparte esta región). El cementerio es aparte.",
      },
    ],
    funeralRowsEn: [
      {
        source:
          '<a href="https://chapelofmemories.com/" rel="noopener" target="_blank">Chapel of Memories</a><br/><span class="small text-body-secondary">4712 S 82nd St, Omaha · 402-551-1011</span>',
        price: "Direct cremation from <strong>$995</strong>",
        notes: "Checked 16 Sep 2026. Serves Omaha and Douglas County. Not a Mejor Vida Insurance price.",
      },
      {
        source:
          '<a href="https://www.funeralocity.com/search/ne/omaha/" rel="noopener" target="_blank">Funeralocity · Omaha</a>',
        price: "Direct cremation listed around <strong>$995–$1,760</strong>",
        notes: "A board of several homes, not a median. Prices change; ask for the GPL.",
      },
      {
        source: "NFDA 2023 · West North Central",
        price:
          "Burial with viewing <strong>$8,755</strong> · Cremation with viewing <strong>$6,713</strong>",
        notes: "Regional median (Nebraska shares this region). Cemetery is extra.",
      },
    ],
    cemeteries: null,
    coverageNoteEs:
      "Para una cremación sencilla en Omaha, $5,000 a $10,000 suele alcanzar. Un entierro tradicional, con lote y marcador, suele pedir $10,000 a $20,000. Mejor Vida Seguros compara compañías designadas; no hay garantía de emisión ni de precio. El detalle de cada aseguradora está en la <a href=\"../nebraska.html#aseguradoras\">guía de Nebraska</a>.",
    coverageNoteEn:
      "For a simple Omaha cremation, $5,000 to $10,000 is often enough. A traditional burial, with plot and marker, often needs $10,000 to $20,000. Mejor Vida Insurance compares appointed companies; there is no guarantee of issue or price. Carrier detail lives on the <a href=\"../nebraska.html#carriers\">Nebraska guide</a>.",
    metroEs: ["Omaha", "Bellevue", "Papillion", "La Vista", "Ralston", "Elkhorn"],
    metroEn: ["Omaha", "Bellevue", "Papillion", "La Vista", "Ralston", "Elkhorn"],
    metroTitleEs: "Área que atendemos en el metro de Omaha",
    metroTitleEn: "Omaha metro we serve",
    metroNoteEs:
      'Cotizamos por teléfono, WhatsApp y en línea a residentes de Nebraska en estas comunidades. No hay oficina de atención al público. Lincoln tiene <a href="lincoln.html">su propia guía</a>.',
    metroNoteEn:
      'We quote by phone, WhatsApp, and online for Nebraska residents in these communities. There is no public walk-in office. Lincoln has <a href="lincoln.html">its own guide</a>.',
    faqCremationEs: {
      q: "¿Cuánta cobertura suele alcanzar para una cremación en Omaha?",
      a: "Con cremación directa publicada desde $995, muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más, a menudo $10,000 a $20,000, porque el lote, la bóveda y la lápida no van en el paquete de la funeraria.",
    },
    faqCremationEn: {
      q: "How much coverage is usually enough for cremation in Omaha?",
      a: "With direct cremation published from $995, many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more, commonly $10,000 to $20,000, because the plot, vault, and marker are not in the funeral-home package.",
    },
    faqPrepaidEs: {
      q: "¿Cuál es la diferencia entre un funeral prepagado y este seguro?",
      a: "El prepagado se ata a una funeraria y puede fijar el precio del servicio. El seguro de gastos finales paga efectivo a su beneficiario: puede usarlo en Chapel of Memories, en otra funeraria, o en otros gastos finales.",
    },
    faqPrepaidEn: {
      q: "What is the difference between a prepaid funeral and this insurance?",
      a: "A prepaid plan is tied to one funeral home and may lock that home’s service price. Final expense insurance pays cash to your beneficiary. They can use it at Chapel of Memories, another home, or for other final bills.",
    },
  },
  lincolnCity,
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadHeaderEs(city) {
  let html = fs.readFileSync(HEADER_ES, "utf8").replace(/__PREFIX__/g, "../../");
  html = html.replace(
    /href="\/en\/"(?=[^>]*mvi-lang-fab)/,
    `href="/en/states/${city.stateSlug}/${city.slug}.html"`
  );
  html = html.replace(
    /(<a href=")\/en\/(" class="mvi-lang-fab)/,
    `$1/en/states/${city.stateSlug}/${city.slug}.html$2`
  );
  return html;
}

function loadHeaderEn(city) {
  let html = fs.readFileSync(HEADER_EN, "utf8");
  html = html.replace(/((?:href|src|srcset)=")(\.\.\/)/g, "$1../../../");
  html = html.replace(
    /((?:href|src|srcset)=")(?!https?:|\/|#|\.\.|tel:|mailto:|sms:)([^"]+)/g,
    "$1../../$2"
  );
  html = html.replace(
    /(<a href=")[^"]+(" class="mvi-lang-fab)/,
    `$1/estados/${city.stateSlug}/${city.slug}.html$2`
  );
  return html;
}

function loadFooterEs() {
  return fs.readFileSync(FOOTER_ES, "utf8").replace(/__PREFIX__/g, "../../");
}

function loadFooterEn() {
  return fs
    .readFileSync(FOOTER_EN, "utf8")
    .replace(/__ASSET__/g, "../../../")
    .replace(/__PAGE__/g, "../../");
}

function licenseModal(lang) {
  const title = lang === "es" ? "Licencia" : "License";
  const close = lang === "es" ? "Cerrar" : "Close";
  return `<div id="mvi-lic-modal" class="mvi-lic-modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="mvi-lic-modal-title">
  <div class="mvi-lic-modal">
    <div class="mvi-lic-modal-head">
      <h2 id="mvi-lic-modal-title">${title}</h2>
      <button type="button" class="mvi-lic-modal-close" id="mvi-lic-modal-close" aria-label="${close}">×</button>
    </div>
    <div class="mvi-lic-modal-body" id="mvi-lic-modal-body"></div>
    <div class="mvi-lic-modal-foot">
      <button type="button" class="btn btn-secondary" id="mvi-lic-modal-close-2">${close}</button>
    </div>
  </div>
</div>`;
}

function cityHero(lang, root, quoteHref, city) {
  const lic = LICENSE[city.stateCode];
  const title =
    lang === "es"
      ? `Seguro de gastos finales en ${city.nameEs}`
      : `Final Expense Insurance in ${city.nameEn}`;
  const bullets = lang === "es" ? city.bulletsEs : city.bulletsEn;
  const ctaLabel = lang === "es" ? "Cotización gratuita" : "Free quote";
  const ctaSub =
    (lang === "es" ? city.ctaSubEs : city.ctaSubEn) ||
    (lang === "es"
      ? "Compare precios de varias compañías. La tabla de primas es ilustrativa, no una cotización oficial."
      : "Compare prices from multiple companies. The premium table is illustrative, not an official quote.");
  const scheduleHref = lang === "es" ? "/schedule-julie.html" : "/en/schedule-julie.html";
  const agentLabel =
    lang === "es" ? `Agente licenciada en ${city.stateNameEs}` : `Licensed agent in ${city.stateNameEn}`;
  const viewLic = lang === "es" ? `Ver licencia (${city.stateCode})` : `View license (${city.stateCode})`;
  const naic = lang === "es" ? "Verificar en NAIC" : "Verify on NAIC";
  const basedIn = lang === "es" ? "Con sede en Lincoln, NE" : "Based in Lincoln, NE";
  const julieAlt =
    lang === "es" ? "Julie Braunsroth, agente de seguros" : "Julie Braunsroth, insurance agent";
  const agentBarId = lang === "es" ? "licencia" : "license";
  const heroWebp = `${root}img/opt/${city.heroFile}.webp?v=${city.heroVer}`;
  const heroJpg = `${root}img/opt/${city.heroFile}.jpg?v=${city.heroVer}`;
  const caption = lang === "es" ? city.heroCaptionEs : city.heroCaptionEn;
  const extraClass = city.heroClass ? ` ${city.heroClass}` : "";

  return `<section class="sc-hero sc-hero--city${extraClass}" aria-label="${esc(title)}">
  <div class="sc-hero-visual" aria-hidden="true">
    <picture>
      <source type="image/webp" srcset="${heroWebp}"/>
      <img src="${heroJpg}" alt="" width="${city.heroW}" height="${city.heroH}" decoding="async" fetchpriority="high"/>
    </picture>
  </div>
  <div class="sc-hero-shade" aria-hidden="true"></div>
  <div class="container sc-hero-inner">
    <div class="sc-hero-copy">
      <h1 class="sc-hero-title">${esc(title)}</h1>
      <ul class="sc-hero-bullets">
${bullets.map((b) => `<li>${b}</li>`).join("\n")}
      </ul>
      <p class="sc-hero-cta-note">${ctaSub}</p>
      <div class="sc-hero-cta-row">
        <a class="btn sc-hero-cta" href="${quoteHref}">${esc(ctaLabel)}</a>
        <a class="btn sc-hero-cta-secondary" href="${scheduleHref}">${
    lang === "es" ? "Agendar una llamada" : "Schedule a call"
  }</a>
      </div>
      <p class="sc-hero-caption">${esc(caption)}</p>
    </div>
  </div>
  <div class="sc-hero-agentbar" id="${agentBarId}">
    <div class="container sc-hero-agentbar-inner">
      <div class="sc-hero-agent-identity">
        <picture class="sc-hero-agent-photo">
          <source type="image/webp" srcset="${root}img/opt/julie-omaha-portrait.webp?v=portrait-v1"/>
          <img src="${root}img/opt/julie-omaha-portrait.jpg?v=portrait-v1" alt="${esc(julieAlt)}" width="320" height="320" loading="lazy" decoding="async"/>
        </picture>
        <div class="sc-hero-agent-meta">
          <p class="sc-hero-agent-kicker mb-1">${esc(agentLabel)}</p>
          <p class="sc-hero-agent-name mb-1"><strong>Julie Braunsroth</strong> · ${esc(
            lang === "es" ? lic.typeEs : lic.typeEn
          )} · ${lang === "es" ? "Licencia" : "License"} <strong>#${esc(lic.number)}</strong></p>
          <p class="sc-hero-agent-npn mb-0">NPN #${NPN}${
            city.layout === "classic" && !city.hideBasedIn ? ` · ${esc(basedIn)}` : ""
          }</p>
        </div>
      </div>
      <div class="sc-hero-agent-actions">
        <button type="button" class="btn btn-sm sc-hero-lic-btn" data-mvi-open-license="${esc(city.stateCode)}">${esc(viewLic)}</button>
        <a class="btn btn-sm sc-hero-lic-btn-outline" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=${esc(city.stateCode)}&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${NPN}" target="_blank" rel="noopener">${esc(naic)}</a>
      </div>
    </div>
  </div>
</section>`;
}

function faqItems(lang, city) {
  const extras = (
    lang === "es"
      ? [city.faqCremationEs, city.faqPrepaidEs, city.faqPlotEs, city.faqCalcEs]
      : [city.faqCremationEn, city.faqPrepaidEn, city.faqPlotEn, city.faqCalcEn]
  ).filter(Boolean);
  if (lang === "es") {
    return [
      {
        q: "¿Necesito un examen médico?",
        a: `Muchas pólizas de gastos finales en ${city.stateNameEs} se emiten con preguntas de salud y sin examen. Si la salud es un obstáculo, puede haber aceptación garantizada, casi siempre con un período de espera.`,
      },
      {
        q: "¿El seguro paga desde el primer día?",
        a: "Si lo aprueban en emisión simplificada, el beneficio suele ser completo desde el primer día para reclamos cubiertos. La emisión garantizada paga de forma limitada durante los primeros dos o tres años y luego el beneficio completo.",
      },
      ...extras,
      {
        q: `¿Están licenciados en ${city.stateNameEs}?`,
        a: `Sí. Mejor Vida Seguros cotiza seguro de vida en ${city.stateNameEs}. Julie Braunsroth es productora residente, NPN #21695431. Puede ver la licencia de ${city.stateNameEs} y verificarla en la NAIC. El mapa completo de estados está en la página de licencias.`,
      },
      {
        q: "¿Atienden en español?",
        a: "Sí. Puede cotizar y hablar en español por teléfono, WhatsApp o el formulario en línea.",
      },
    ];
  }
  return [
    {
      q: "Do I need a medical exam?",
      a: `Many final expense policies in ${city.stateNameEn} use health questions and no exam. If health is a barrier, guaranteed acceptance may be available, usually with a waiting period.`,
    },
    {
      q: "Does the policy pay from day one?",
      a: "If you are approved for simplified issue, the full benefit typically pays from day one on covered claims. Guaranteed issue pays a limited benefit for the first two or three years, then the full benefit.",
    },
    ...extras,
    {
      q: `Are you licensed in ${city.stateNameEn}?`,
      a: `Yes. Mejor Vida Insurance quotes life insurance in ${city.stateNameEn}. Julie Braunsroth is a resident producer, NPN #21695431. You can view the ${city.stateNameEn} license and verify it on the NAIC. The full state map is on the licenses page.`,
    },
    {
      q: "Do you work in Spanish?",
      a: "Yes. You can quote and speak in Spanish by phone, WhatsApp, or the online form.",
    },
  ];
}

function faqHtml(lang, city) {
  return faqItems(lang, city)
    .map(
      (item) => `<details>
      <summary>${esc(item.q)}</summary>
      <p>${esc(item.a)}</p>
    </details>`
    )
    .join("\n    ");
}

function jsonLd(lang, canon, city) {
  const items = faqItems(lang, city);
  const crumbState =
    lang === "es"
      ? `https://www.mejorvidainsurance.com/estados/${city.stateSlug}.html`
      : `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}.html`;
  const stateName = lang === "es" ? city.stateNameEs : city.stateNameEn;
  const pageName =
    lang === "es"
      ? `Seguro de gastos finales en ${city.nameEs}`
      : `Final Expense Insurance in ${city.nameEn}`;
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: pageName,
        url: canon,
        inLanguage: lang === "es" ? "es-US" : "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: stateName, item: crumbState },
          { "@type": "ListItem", position: 2, name: city.nameEn, item: canon },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  })}</script>`;
}

function rateRows() {
  return [
    { age: 60, female: 33, male: 43 },
    { age: 65, female: 41, male: 54 },
    { age: 70, female: 53, male: 70 },
    { age: 75, female: 71, male: 97 },
    { age: 80, female: 98, male: 136 },
  ];
}

function tableRows(rows) {
  return rows
    .map(
      (r) => `          <tr>
            <td>${r.source}</td>
            <td>${r.price}</td>
            <td>${r.notes}</td>
          </tr>`
    )
    .join("\n");
}

function plotResaleHtml(lang, city) {
  if (!city.plotResales || !city.plotResales.length) return "";
  const intro = lang === "es" ? city.plotResaleIntroEs : city.plotResaleIntroEn;
  const foot = lang === "es" ? city.plotResaleFootEs : city.plotResaleFootEn;
  const heading = lang === "es" ? "Anuncios de reventa de lotes" : "Private plot resale ads";
  const col1 = lang === "es" ? "Anuncio" : "Listing";
  const col2 = lang === "es" ? "Precio pedido" : "Asking price";
  const col3 = lang === "es" ? "Notas" : "Notes";
  return `<h3 class="h5 fw-bold mt-5 mb-3" style="color:#1a365d;">${esc(heading)}</h3>
    <p class="text-body-secondary mb-3">${intro}</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">${col1}</th>
            <th scope="col">${col2}</th>
            <th scope="col">${col3}</th>
          </tr>
        </thead>
        <tbody>
${tableRows(
  city.plotResales.map((c) => ({
    source: lang === "es" ? c.sourceEs : c.sourceEn,
    price: lang === "es" ? c.priceEs : c.priceEn,
    notes: lang === "es" ? c.notesEs : c.notesEn,
  }))
)}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">${foot}</p>`;
}

function cemeterySection(lang, city) {
  if (!city.cemeteries || !city.cemeteries.length) return "";
  const name = lang === "es" ? city.nameEs : city.nameEn;
  const resale = plotResaleHtml(lang, city);
  if (lang === "es") {
    return `<section class="py-5 bg-light border-bottom" id="cementerios">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Dónde comprar un lote en ${esc(name)}</h2>
    <p class="text-body-secondary mb-3">La GPL de la funeraria cubre el servicio, no el terreno. Estos cementerios venden espacios nuevos. Ninguno publica esa lista en su web: hay que llamar. El lote, la apertura y cierre, la bóveda y la lápida son aparte del funeral.</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Cementerio</th>
            <th scope="col">Qué venden</th>
            <th scope="col">Notas</th>
          </tr>
        </thead>
        <tbody>
${tableRows(
  city.cemeteries.map((c) => ({
    source: c.sourceEs,
    price: c.priceEs,
    notes: c.notesEs,
  }))
)}
        </tbody>
      </table>
    </div>
    ${resale}
  </div>
</section>
`;
  }
  return `<section class="py-5 bg-light border-bottom" id="cemeteries">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Where to buy a plot in ${esc(name)}</h2>
    <p class="text-body-secondary mb-3">The funeral-home GPL covers the service, not the ground. These cemeteries sell new spaces. None publish that list on their website: you have to call. The plot, opening and closing, vault, and marker are separate from the funeral.</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Cemetery</th>
            <th scope="col">What they sell</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
${tableRows(
  city.cemeteries.map((c) => ({
    source: c.sourceEn,
    price: c.priceEn,
    notes: c.notesEn,
  }))
)}
        </tbody>
      </table>
    </div>
    ${resale}
  </div>
</section>
`;
}

function guideAssets(lang, city) {
  const isEs = lang === "es";
  const root = isEs ? "../../" : "../../../";
  const en = "../../";
  const quoteHref = isEs ? `${root}quote.html` : `${en}quote.html`;
  const canon = isEs
    ? `https://www.mejorvidainsurance.com/estados/${city.stateSlug}/${city.slug}.html`
    : `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}/${city.slug}.html`;
  const altCanon = isEs
    ? `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}/${city.slug}.html`
    : `https://www.mejorvidainsurance.com/estados/${city.stateSlug}/${city.slug}.html`;
  const stateHref = `../${city.stateSlug}.html`;
  return { isEs, root, en, quoteHref, canon, altCanon, stateHref };
}

function documentGuide(lang, city) {
  const { isEs, root, en, quoteHref, canon, altCanon, stateHref } = guideAssets(lang, city);
  const title = isEs ? city.titleEs : city.titleEn;
  const desc = isEs ? city.descEs : city.descEn;
  const faqId = isEs ? "preguntas" : "faq";
  const faqTitle = isEs ? `Preguntas frecuentes en ${city.nameEs}` : `${city.nameEn} FAQs`;
  const ctaTitle = isEs
    ? `Cotice gastos finales en ${city.nameEs}`
    : `Get a final expense quote in ${city.nameEn}`;
  const ctaP = isEs
    ? "Cotización gratuita. Mejor Vida Seguros compara opciones según su edad, salud y presupuesto. No es una cotización oficial hasta que una aseguradora la confirme."
    : "Free quote. Mejor Vida Insurance compares options based on your age, health, and budget. It is not an official quote until a carrier confirms it.";
  const ctaQuote = isEs ? "Cotización gratuita" : "Free quote";
  const ctaCall = isEs ? "Agendar una llamada" : "Schedule a call";
  const scheduleHref = isEs ? "/schedule-julie.html" : "/en/schedule-julie.html";
  const header = isEs ? loadHeaderEs(city) : loadHeaderEn(city);
  const footer = isEs ? loadFooterEs() : loadFooterEn();
  const robots = isEs ? "index, follow" : "noindex, follow";
  const hreflang = isEs
    ? `<link href="${canon}" hreflang="es-US" rel="alternate"/>
<link href="${altCanon}" hreflang="en-US" rel="alternate"/>
<link href="${canon}" hreflang="x-default" rel="alternate"/>`
    : `<link href="${altCanon}" hreflang="es-US" rel="alternate"/>
<link href="${canon}" hreflang="en-US" rel="alternate"/>`;
  const ogLocale = isEs ? `<meta property="og:locale" content="es_US"/>` : "";
  const htmlLang = isEs ? "es-US" : "en-US";
  const htmlClass = isEs ? "lang-es" : "lang-en";
  const bootLang = isEs
    ? `document.documentElement.lang="es-US";document.documentElement.className="lang-es";`
    : `document.documentElement.lang="en-US";document.documentElement.className="lang-en";`;

  return `<!DOCTYPE html>
<html class="${htmlClass}" lang="${htmlLang}">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="robots" content="${robots}"/>
<link href="${canon}" rel="canonical"/>
${hreflang}
<link href="${root}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${root}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${root}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/state-coverage.css?v=${CSS_VER}" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:image" content="https://www.mejorvidainsurance.com/img/opt/${city.heroFile}.jpg"/>
${ogLocale}
<link rel="preload" as="image" href="${root}img/opt/${city.heroFile}.webp?v=${city.heroVer}" type="image/webp" fetchpriority="high"/>
<script>(function(){${bootLang}})();</script>
${jsonLd(lang, canon, city)}
</head>
<body class="bg-white state-coverage-page sc-city-guide" data-licenses-base="${root}licenses/">
${header}
<main class="state-coverage-readability">
${cityHero(lang, root, quoteHref, city)}
${guideMain(lang, city, { root, quoteHref, stateHref, en, npn: NPN, license: LICENSE[city.stateCode] })}
<section class="py-5 bg-light border-bottom sc-city-faq" id="${faqId}">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(faqTitle)}</h2>
    ${faqHtml(lang, city)}
  </div>
</section>
<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">${esc(ctaTitle)}</h2>
    <p class="mb-4 text-white-50">${esc(ctaP)}</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${quoteHref}">${esc(ctaQuote)}</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="${scheduleHref}">${esc(ctaCall)}</a>
    </div>
  </div>
</section>
</main>
${licenseModal(lang)}
${footer}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${root}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${root}script.js"></script>
<script defer src="${root}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${root}js/mvi-licensing-map.js?v=20260726-lic-popup"></script>
<script defer src="${root}js/city-guide.js?v=${CSS_VER}"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${root}js/website-assistant-widget.js"></script>
</body>
</html>
`;
}

function documentEs(city) {
  if (city.layout !== "classic") return documentGuide("es", city);
  const root = "../../";
  const quoteHref = `${root}quote.html`;
  const canon = `https://www.mejorvidainsurance.com/estados/${city.stateSlug}/${city.slug}.html`;
  const enCanon = `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}/${city.slug}.html`;
  const stateHref = `../${city.stateSlug}.html`;
  const metro = city.metroEs.map((n) => `<li>${esc(n)}</li>`).join("");
  const funeralAlt = city.cemeteries ? "bg-white" : "bg-white";
  const coverageBg = city.cemeteries ? "bg-white" : "bg-light";
  const premiumsBg = city.cemeteries ? "bg-light" : "bg-white";
  const metroBg = city.cemeteries ? "bg-white" : "bg-light";
  const licenseBg = city.cemeteries ? "bg-light" : "bg-white";
  const faqBg = city.cemeteries ? "bg-white" : "bg-light";

  return `<!DOCTYPE html>
<html class="lang-es" lang="es-US">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(city.titleEs)}</title>
<meta name="description" content="${esc(city.descEs)}"/>
<meta name="robots" content="index, follow"/>
<link href="${canon}" rel="canonical"/>
<link href="${canon}" hreflang="es-US" rel="alternate"/>
<link href="${enCanon}" hreflang="en-US" rel="alternate"/>
<link href="${canon}" hreflang="x-default" rel="alternate"/>
<link href="${root}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${root}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${root}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/state-coverage.css?v=${CSS_VER}" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(city.titleEs)}"/>
<meta property="og:description" content="${esc(city.descEs)}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:image" content="https://www.mejorvidainsurance.com/img/opt/${city.heroFile}.jpg"/>
<meta property="og:locale" content="es_US"/>
<link rel="preload" as="image" href="${root}img/opt/${city.heroFile}.webp?v=${city.heroVer}" type="image/webp" fetchpriority="high"/>
<script>(function(){document.documentElement.lang="es-US";document.documentElement.className="lang-es";})();</script>
${jsonLd("es", canon, city)}
</head>
<body class="bg-white state-coverage-page" data-licenses-base="${root}licenses/">
${loadHeaderEs(city)}
<main class="state-coverage-readability">
${cityHero("es", root, quoteHref, city)}

<section class="py-4 bg-white border-bottom">
  <div class="container sc-city-prose">
    <nav class="sc-city-crumb" aria-label="Migas de pan">
      <a href="${stateHref}">Nebraska</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(city.nameEs)}</span>
    </nav>
  </div>
</section>

<section class="py-5 ${funeralAlt} border-bottom" id="funerarias">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué puede costar un funeral en ${esc(city.nameEs)}</h2>
    <p class="text-body-secondary mb-3">${city.funeralIntroEs}</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Fuente</th>
            <th scope="col">Qué publican</th>
            <th scope="col">Notas</th>
          </tr>
        </thead>
        <tbody>
${tableRows(city.funeralRowsEs)}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">Regla funeraria de la FTC: tiene derecho a ver la lista general de precios. Estas cifras no son una cotización de seguro ni un contrato con la funeraria. <a href="${root}cuanto-cuesta-un-funeral.html">Guía de costos funerarios</a>.</p>
  </div>
</section>

${cemeterySection("es", city)}
<section class="py-5 ${coverageBg} border-bottom" id="cobertura">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué es el seguro de gastos finales</h2>
    <p class="text-body-secondary mb-3">Es un <strong>seguro de vida entera</strong> de monto modesto ($5,000 a $25,000 es habitual) para funeral, cremación, deudas médicas y cuentas pequeñas. No es un funeral prepagado. El beneficio se paga en efectivo a su beneficiario.</p>
    <ul class="text-body-secondary ps-3 mb-3">
      <li class="mb-2"><strong>Emisión simplificada:</strong> preguntas de salud, sin examen. Si lo aprueban, el beneficio suele ser completo desde el primer día.</li>
      <li class="mb-2"><strong>Aceptación garantizada:</strong> sin preguntas de salud, con un período de espera de dos o tres años.</li>
      <li class="mb-2"><strong>Primas niveladas</strong> si se pagan a tiempo; la póliza no vence a cierta edad como un temporal.</li>
    </ul>
    <p class="text-body-secondary mb-0">${city.coverageNoteEs}</p>
  </div>
</section>

<section class="py-5 ${premiumsBg} border-bottom" id="primas">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Primas ilustrativas · $10,000</h2>
    <p class="text-body-secondary mb-3">Primas ilustrativas para ciudades de Nebraska. Salen de la edad, el sexo, el tabaco, el monto y la clase de salud. Esta tabla es educativa, de compañías designadas, no fumador, plan nivel / inmediato (al 20 ago. 2026). <strong>No es una cotización oficial.</strong></p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Edad</th>
            <th scope="col" class="text-end">Mujer · no fumadora</th>
            <th scope="col" class="text-end">Hombre · no fumador</th>
          </tr>
        </thead>
        <tbody>
${rateRows()
  .map(
    (r) => `          <tr>
            <th scope="row">${r.age}</th>
            <td class="text-end">$${r.female}/mes</td>
            <td class="text-end">$${r.male}/mes</td>
          </tr>`
  )
  .join("\n")}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">Las preguntas de salud y la aseguradora confirman el número real. El tabaco, un plan escalonado o la aceptación garantizada suelen costar más. <a href="${quoteHref}">Cotice en línea</a> o llame al <a href="tel:+14024405438">402-440-5438</a>.</p>
  </div>
</section>

<section class="py-5 ${metroBg} border-bottom" id="metro">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.metroTitleEs)}</h2>
    <p class="text-body-secondary mb-3">${city.metroNoteEs}</p>
    <ul class="sc-city-pills">${metro}</ul>
  </div>
</section>

<section class="py-5 ${licenseBg} border-bottom" id="licencia-nebraska">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Licencia en Nebraska</h2>
    <p class="text-body-secondary mb-3">Mejor Vida Seguros está autorizado a cotizar y vender seguro de vida en <strong>Nebraska</strong>. Julie Braunsroth es productora residente, NPN #${NPN}, con sede en Lincoln. Esta página no lista otros estados: el mapa y las copias están en <a href="${root}licencias.html">licencias</a>.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-outline-primary" href="#licencia">Ver licencia de Nebraska</a>
      <a class="btn btn-outline-secondary" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=NE&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${NPN}" target="_blank" rel="noopener">Verificar en la NAIC</a>
    </div>
  </div>
</section>

<section class="py-5 ${faqBg} border-bottom sc-city-faq" id="preguntas">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Preguntas frecuentes en ${esc(city.nameEs)}</h2>
    ${faqHtml("es", city)}
  </div>
</section>

<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">Cotice gastos finales en ${esc(city.nameEs)}</h2>
    <p class="mb-4 text-white-50">Cotización gratuita. Mejor Vida Seguros compara opciones según su edad, salud y presupuesto. No es una cotización oficial hasta que una aseguradora la confirme.</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${quoteHref}">Cotización gratuita</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="/schedule-julie.html">Agendar una llamada</a>
    </div>
  </div>
</section>
</main>
${licenseModal("es")}
${loadFooterEs()}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${root}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${root}script.js"></script>
<script defer src="${root}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${root}js/mvi-licensing-map.js?v=20260726-lic-popup"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${root}js/website-assistant-widget.js"></script>
</body>
</html>
`;
}

function documentEn(city) {
  if (city.layout !== "classic") return documentGuide("en", city);
  const root = "../../../";
  const en = "../../";
  const quoteHref = `${en}quote.html`;
  const canon = `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}/${city.slug}.html`;
  const esCanon = `https://www.mejorvidainsurance.com/estados/${city.stateSlug}/${city.slug}.html`;
  const stateHref = `../${city.stateSlug}.html`;
  const metro = city.metroEn.map((n) => `<li>${esc(n)}</li>`).join("");
  const funeralAlt = "bg-white";
  const coverageBg = city.cemeteries ? "bg-white" : "bg-light";
  const premiumsBg = city.cemeteries ? "bg-light" : "bg-white";
  const metroBg = city.cemeteries ? "bg-white" : "bg-light";
  const licenseBg = city.cemeteries ? "bg-light" : "bg-white";
  const faqBg = city.cemeteries ? "bg-white" : "bg-light";

  return `<!DOCTYPE html>
<html class="lang-en" lang="en-US">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(city.titleEn)}</title>
<meta name="description" content="${esc(city.descEn)}"/>
<meta name="robots" content="noindex, follow"/>
<link href="${canon}" rel="canonical"/>
<link href="${esCanon}" hreflang="es-US" rel="alternate"/>
<link href="${canon}" hreflang="en-US" rel="alternate"/>
<link href="${root}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${root}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${root}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/state-coverage.css?v=${CSS_VER}" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(city.titleEn)}"/>
<meta property="og:description" content="${esc(city.descEn)}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:image" content="https://www.mejorvidainsurance.com/img/opt/${city.heroFile}.jpg"/>
<link rel="preload" as="image" href="${root}img/opt/${city.heroFile}.webp?v=${city.heroVer}" type="image/webp" fetchpriority="high"/>
<script>(function(){document.documentElement.lang="en-US";document.documentElement.className="lang-en";})();</script>
${jsonLd("en", canon, city)}
</head>
<body class="bg-white state-coverage-page" data-licenses-base="${root}licenses/">
${loadHeaderEn(city)}
<main class="state-coverage-readability">
${cityHero("en", root, quoteHref, city)}

<section class="py-4 bg-white border-bottom">
  <div class="container sc-city-prose">
    <nav class="sc-city-crumb" aria-label="Breadcrumb">
      <a href="${stateHref}">Nebraska</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(city.nameEn)}</span>
    </nav>
  </div>
</section>

<section class="py-5 ${funeralAlt} border-bottom" id="funeral-homes">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What a funeral can cost in ${esc(city.nameEn)}</h2>
    <p class="text-body-secondary mb-3">${city.funeralIntroEn}</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Source</th>
            <th scope="col">What they publish</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
${tableRows(city.funeralRowsEn)}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">FTC Funeral Rule: you can request the General Price List. These figures are not an insurance quote or a funeral-home contract. <a href="${en}how-much-does-a-funeral-cost.html">Funeral cost guide</a>.</p>
  </div>
</section>

${cemeterySection("en", city)}
<section class="py-5 ${coverageBg} border-bottom" id="coverage">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What final expense insurance is</h2>
    <p class="text-body-secondary mb-3">It is <strong>whole life insurance</strong> in a modest amount ($5,000 to $25,000 is typical) for funeral, cremation, medical bills, and small debts. It is not a prepaid funeral. The benefit is paid in cash to your beneficiary.</p>
    <ul class="text-body-secondary ps-3 mb-3">
      <li class="mb-2"><strong>Simplified issue:</strong> health questions, no exam. If approved, the full benefit usually pays from day one.</li>
      <li class="mb-2"><strong>Guaranteed acceptance:</strong> no health questions, with a two- or three-year waiting period.</li>
      <li class="mb-2"><strong>Level premiums</strong> when paid on time; the policy does not expire at a set age the way term does.</li>
    </ul>
    <p class="text-body-secondary mb-0">${city.coverageNoteEn}</p>
  </div>
</section>

<section class="py-5 ${premiumsBg} border-bottom" id="premiums">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Illustrative premiums · $10,000</h2>
    <p class="text-body-secondary mb-3">Illustrative premiums for cities in Nebraska. They come from age, sex, tobacco, face amount, and health class. This table is educational, from appointed companies, non-tobacco, level / immediate (as of 20 Aug 2026). <strong>It is not an official quote.</strong></p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Age</th>
            <th scope="col" class="text-end">Female · non-tobacco</th>
            <th scope="col" class="text-end">Male · non-tobacco</th>
          </tr>
        </thead>
        <tbody>
${rateRows()
  .map(
    (r) => `          <tr>
            <th scope="row">${r.age}</th>
            <td class="text-end">$${r.female}/mo</td>
            <td class="text-end">$${r.male}/mo</td>
          </tr>`
  )
  .join("\n")}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">Health questions and the carrier confirm the real number. Tobacco, graded plans, or guaranteed acceptance usually cost more. <a href="${quoteHref}">Get a quote online</a> or call <a href="tel:+14024405438">402-440-5438</a>.</p>
  </div>
</section>

<section class="py-5 ${metroBg} border-bottom" id="metro">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.metroTitleEn)}</h2>
    <p class="text-body-secondary mb-3">${city.metroNoteEn}</p>
    <ul class="sc-city-pills">${metro}</ul>
  </div>
</section>

<section class="py-5 ${licenseBg} border-bottom" id="nebraska-license">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Nebraska license</h2>
    <p class="text-body-secondary mb-3">Mejor Vida Insurance is authorized to quote and sell life insurance in <strong>Nebraska</strong>. Julie Braunsroth is a resident producer, NPN #${NPN}, based in Lincoln. This page does not list other states: the map and copies are on the <a href="${en}licenses.html">licenses</a> page.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-outline-primary" href="#license">View Nebraska license</a>
      <a class="btn btn-outline-secondary" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=NE&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${NPN}" target="_blank" rel="noopener">Verify on the NAIC</a>
    </div>
  </div>
</section>

<section class="py-5 ${faqBg} border-bottom sc-city-faq" id="faq">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.nameEn)} FAQs</h2>
    ${faqHtml("en", city)}
  </div>
</section>

<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">Get a final expense quote in ${esc(city.nameEn)}</h2>
    <p class="mb-4 text-white-50">Free quote. Mejor Vida Insurance compares options based on your age, health, and budget. It is not an official quote until a carrier confirms it.</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${quoteHref}">Free quote</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="/en/schedule-julie.html">Schedule a call</a>
    </div>
  </div>
</section>
</main>
${licenseModal("en")}
${loadFooterEn()}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${root}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${root}script.js"></script>
<script defer src="${root}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${root}js/mvi-licensing-map.js?v=20260726-lic-popup"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${root}js/website-assistant-widget.js"></script>
</body>
</html>
`;
}

for (const city of CITIES) {
  const esDir = path.join(ROOT, "estados", city.stateSlug);
  const enDir = path.join(ROOT, "en", "states", city.stateSlug);
  fs.mkdirSync(esDir, { recursive: true });
  fs.mkdirSync(enDir, { recursive: true });
  const esPath = path.join(esDir, `${city.slug}.html`);
  const enPath = path.join(enDir, `${city.slug}.html`);
  fs.writeFileSync(esPath, documentEs(city));
  fs.writeFileSync(enPath, documentEn(city));
  console.log("wrote", esPath);
  console.log("wrote", enPath);
}
