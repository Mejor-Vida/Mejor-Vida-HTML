#!/usr/bin/env node
/**
 * Bilingual seniors-over-80 education + rate page.
 *   node scripts/build-seniors-over-80-pages.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ES_HEADER = path.join(ROOT, "includes/site-header-inner.html");
const EN_HEADER = path.join(ROOT, "includes/en-site-header.html");
const ES_FOOTER = path.join(ROOT, "includes/site-footer-inner.html");
const EN_FOOTER = path.join(ROOT, "includes/en-site-footer.html");
const RATES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "js/seniors-over-80-rates.json"), "utf8")
);

const ES_FILE = "seguro-vida-mayores-80.html";
const EN_FILE = "life-insurance-seniors-over-80.html";
const HERO = {
  base: "lic-hero-coffee-finca",
  modifier: "coffee",
  width: 1536,
  height: 1024,
  cache: "20260818-noflag",
};

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function headerFor(lang) {
  if (lang === "es") {
    return fs
      .readFileSync(ES_HEADER, "utf8")
      .replace(/__PREFIX__/g, "")
      .replace('href="/en/"', `href="en/${EN_FILE}"`)
      .trim();
  }
  return fs
    .readFileSync(EN_HEADER, "utf8")
    .replace(
      'href="../index.html" class="mvi-lang-fab',
      `href="../${ES_FILE}" class="mvi-lang-fab`
    )
    .trim();
}

function footerFor(lang) {
  if (lang === "es") {
    const html = fs.readFileSync(ES_FOOTER, "utf8").replace(/__PREFIX__/g, "");
    const extra = `<script defer src="bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="js/mvi-funnel-track.js?v=20260702e"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="js/mvi-nav-questions.js?v=20260818-seniors"></script>
<script defer src="js/website-assistant-widget.js?v=20260813-scroll-top"></script>
<script>document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());</script>
`;
    return html.trim() + "\n" + extra;
  }
  const html = fs
    .readFileSync(EN_FOOTER, "utf8")
    .replace(/__ASSET__/g, "../")
    .replace(/__PAGE__/g, "");
  const extra = `<script defer src="../bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="../js/mvi-funnel-track.js?v=20260702e"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="../js/mvi-nav-questions.js?v=20260818-seniors"></script>
<script defer src="../js/website-assistant-widget.js?v=20260813-scroll-top"></script>
<script>document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());</script>
`;
  return html.trim() + "\n" + extra;
}

function logoHtml(id, prefix) {
  if (id === "moo") {
    return `<picture>
<source type="image/webp" srcset="${prefix}img/opt/mutual-of-omaha-logo.webp"/>
<img src="${prefix}img/opt/mutual-of-omaha-logo.png" alt="" width="400" height="94" loading="lazy" decoding="async"/>
</picture>`;
  }
  if (id === "aetna") {
    return `<img src="${prefix}img/carriers/aetna-logo.svg" alt="" width="512" height="98" loading="lazy" decoding="async"/>`;
  }
  return `<picture>
<source type="image/webp" srcset="${prefix}img/opt/transamerica-logo.webp"/>
<img src="${prefix}img/opt/transamerica-logo.png" alt="" width="362" height="69" loading="lazy" decoding="async"/>
</picture>`;
}

function carrierCards(lang, prefix) {
  const isEs = lang === "es";
  return RATES.carriers
    .map((c) => {
      const product = isEs ? c.productEs : c.productEn;
      const waitVal = c.wait ? (isEs ? "Sí" : "Yes") : isEs ? "No" : "No";
      const death = isEs ? c.deathEs || c.death : c.deathEn || c.death;
      const ages = isEs ? c.agesEs || c.ages : c.agesEn || c.ages;
      return `<article class="lic-co-card lic-co-card--compare">
<div class="lic-co-logo">${logoHtml(c.id, prefix)}</div>
<h3><a href="${prefix}carriers/${c.href}.html">${c.name}</a></h3>
<p class="lic-co-product">${product}</p>
<dl class="lic-co-specs">
<div><dt>${isEs ? "Costo de póliza de $10,000" : "$10,000 policy cost"}</dt><dd>${money(c.sample10k80f)}/mes*</dd></div>
<div><dt>${isEs ? "Edades de nuevos solicitantes" : "Issue ages"}</dt><dd>${ages}</dd></div>
<div><dt>${isEs ? "Opciones de beneficio" : "Death benefit options"}</dt><dd>${death}</dd></div>
<div><dt>${isEs ? "Espera de 2 años (plan nivelado)" : "2-year wait (level plan)"}</dt><dd>${waitVal}</dd></div>
</dl>
<a class="lic-co-cta" href="${prefix}quote.html">${isEs ? "Ver precios" : "See prices"}</a>
<a class="lic-co-more" href="${prefix}carriers/${c.href}.html">${isEs ? "Leer resumen" : "Read overview"}</a>
</article>`;
    })
    .join("\n");
}

function copy(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Seguro de vida para mayores de 80 años (2026) | Mejor Vida Seguros",
      desc: "Opciones claras de seguro de entierro y gastos finales después de los 80. Tablas de primas de compañías designadas, sin examen médico en la mayoría de los planes, y cómo evitar esperas innecesarias.",
      h1: "Seguro de entierro y de vida para mayores de 80 años",
      lead: "Después de los 80, las opciones se estrechan, pero muchas personas todavía pueden obtener una póliza pequeña de vida entera. La edad, la salud y el tabaco marcan el precio. Esta página explica qué suele estar disponible y muestra primas mensuales ilustrativas de compañías designadas de Mejor Vida Seguros.",
      crumbHome: "Inicio",
      crumbMid: "Seguro de vida",
      takeTitle: "Puntos clave",
      take1: "Si responde las preguntas de salud y califica, algunos planes <strong>pueden pagar el beneficio completo desde el primer día</strong> — incluso con condiciones médicas anteriores.",
      take2: "La mayoría de las familias busca <strong>$5,000 a $25,000</strong> para ayudar con el funeral y cuentas pendientes, no una póliza temporal grande.",
      take3: "Muchas compañías designadas aceptan solicitudes nuevas hasta los <strong>85 años</strong>. Unas pocas llegan más lejos; después de los 85 las opciones son menos.",
      optTitle: "Qué opciones hay después de los 80",
      optLead: "El camino más común a esta edad es un seguro de gastos finales (vida entera pequeña). El temporal grande y la vida universal rara vez son el primer paso, y a menudo piden examen médico.",
      feTitle: "Seguro de gastos finales (entierro)",
      feBody: "Es una póliza pequeña de vida entera — por lo general $50,000 o menos. Casi nunca hay examen médico. Hay preguntas de salud. Si califica para un plan nivelado, la cobertura puede empezar sin la espera de dos años que traen los planes de aceptación garantizada.",
      giTitle: "Aceptación garantizada",
      giBody: "No hay examen ni preguntas de salud. La aprobación es casi segura dentro de la edad y el monto del producto. A cambio, casi siempre hay una <strong>espera de dos años</strong> por muerte natural: si fallece en esa ventana, la familia suele recibir las primas pagadas más un interés del contrato, no el beneficio completo. Suele costar más que un plan nivelado.",
      wlTitle: "Vida entera tradicional",
      wlBody: "Montos más altos (a menudo $50,000 o más) y, después de los 80, casi siempre con examen médico. Puede acumular valor en efectivo y la prima suele quedar fija. Para gastos de funeral, la vía de gastos finales suele ser más simple.",
      termTitle: "Seguro de vida temporal",
      termBody: "Dura un número fijo de años y luego termina. A los 80, un plazo de 10 años — si lo aprueban — terminaría a los 90. Suele pedir examen y montos mucho más grandes que un plan de entierro. Vea el <a href=\"costo-seguro-vida-temporal.html\">costo del seguro temporal</a> si necesita un monto alto por un tiempo limitado.",
      ulTitle: "Vida universal",
      ulBody: "Es permanente, pero la prima puede subir si el valor en efectivo no rinde como se esperaba. Para la mayoría de las personas mayores de 80 que quieren cubrir un funeral, no es el producto más claro.",
      tipTitle: "Téngalo presente",
      tipBody: "Si la salud es frágil — tratamiento reciente de cáncer, problemas graves del corazón u otras condiciones graves — un plan de gastos finales (a veces escalonado) suele ser lo realista. Un temporal grande con examen médico casi nunca encaja.",
      costTitle: "Cuánto cuesta el seguro de entierro después de los 80",
      costLead: "En las compañías designadas de Mejor Vida Seguros, una póliza nivelada de <strong>$10,000</strong> a los 80 años suele estar cerca de <strong>$95 al mes para una mujer</strong> y <strong>$133 al mes para un hombre</strong> (no fumador, buena salud). El precio sube cada año de edad al emitir. Estas cifras son educativas, no una oferta.",
      costFactors: "El precio cambia con la edad, el sexo, el tabaco, la salud y el monto. Un plan con espera de dos años puede parecer “más fácil”, pero a menudo cuesta más y cubre menos al principio.",
      female: "Mujer",
      male: "Hombre",
      age: "Edad",
      waitTitle: "¿Hay planes sin período de espera después de los 80?",
      waitLead: "Sí, si responde las preguntas de salud con honestidad y la compañía lo aprueba en un plan <strong>nivelado</strong>. “Sin espera” no significa “sin preguntas”. Desconfíe de sitios que prometen aprobación instantánea para todos: eso suele ser aceptación garantizada con espera de dos años.",
      coTitle: "Compañías designadas que todavía emiten después de los 80",
      coLead: "Estas son compañías con las que Mejor Vida Seguros trabaja. El precio de muestra es para una mujer de 80 años, no fumadora, plan nivelado de $10,000, según cotizaciones designadas del 15 de ago. 2026.",
      coFoot: "*Prima mensual de muestra para una mujer de 80 años, no fumadora, plan Nivel / Inmediato a $10,000. Cotizaciones de compañías designadas de Mejor Vida Seguros (15 ago. 2026). Los planes escalonados o de emisión garantizada pueden agregar una espera de dos años y costar más. No es una cotización vinculante.",
      avoidTitle: "Ofertas que conviene dejar pasar",
      avoidLead: "Hay caminos más claros y, a menudo, más baratos que estos:",
      avoid1: "<strong>Solo por correo, “aprobado garantizado”.</strong> Casi siempre traen espera de dos años y un precio alto. No hay un programa del gobierno que pague el funeral por usted.",
      avoid2: "<strong>Comprar directo a una sola compañía sin comparar.</strong> Una aseguradora puede tener un buen anuncio y no ser la más adecuada para su edad, salud o estado. Mejor Vida Seguros compara las compañías designadas por usted.",
      avoid3: "<strong>Saltar las preguntas de salud cuando todavía puede responderlas.</strong> Si califica para un plan nivelado, suele costar menos y puede evitar la espera de dos años.",
      over85Title: "¿Se puede obtener seguro después de los 85?",
      over85Lead: "Sí, en algunos casos. Mutual of Omaha Living Promise Nivelado y Transamerica Immediate Solution aceptan solicitudes nuevas hasta los 85. <strong>Aetna Accendo Nivelado puede emitir hasta los 89</strong> (el monto máximo baja con la edad). No suele haber examen médico; sí hay preguntas de salud. El formulario en línea cotiza hasta los 85. Después de esa edad, llame para una cifra personalizada — no publicamos una tabla aquí porque las cotizaciones varían mucho.",
      over85HeadInsurer: "Compañía",
      over85HeadCov: "Cobertura típica",
      over85HeadType: "Tipo y espera (plan nivelado)",
      applyTitle: "Cómo empezar",
      apply1: "<strong>Pida una cotización gratis</strong> — edad, tabaco y unas preguntas de salud. Mejor Vida Seguros compara compañías designadas en Nebraska, Kansas, Colorado y Nevada.",
      apply2: "<strong>Llame o escriba</strong> si prefiere hablarlo: <a href=\"tel:+14024405438\">402-440-5438</a> o WhatsApp.",
      apply3: "<strong>Revise la oferta</strong> — monto, cualquier espera y la prima mensual — antes de firmar. Nada en esta página es un contrato.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Necesitaré un examen médico después de los 80?",
      faq1a: "En los planes de gastos finales designados, por lo general no. Hay un cuestionario de salud. Los planes de aceptación garantizada omiten las preguntas pero agregan una espera de dos años por muerte natural.",
      faq2q: "¿Cuánto de cobertura suele bastar?",
      faq2a: "Muchas familias eligen $10,000 a $25,000 para ayudar con funeral o cremación y algunas cuentas. Un entierro tradicional en EE. UU. suele costar más de $8,000. Una cotización gratis puede ajustar el monto.",
      faq3q: "¿Las primas suben cada año después de emitir la póliza?",
      faq3a: "En la mayoría de las pólizas niveladas de vida entera de gastos finales, no — si mantiene la póliza al día. Lo que sí sube es el precio de una póliza nueva si espera más años para solicitar.",
      faq4q: "¿Puedo obtener cobertura si ya tengo problemas de salud?",
      faq4a: "A veces sí, en un plan nivelado o escalonado, según las respuestas. Si ninguna compañía nivelada puede emitir, la aceptación garantizada sigue siendo una vía, con espera de dos años.",
      quoteHead: "Cotización de entierro para mayores de 80",
      quote1: "Compare compañías designadas",
      quote2: "Vea planes sin espera si califica",
      quote3: "Cotización gratis — sin spam",
      quoteCta: "Ver precios",
      quoteNote: "Las cifras de la tabla son muestras educativas, no una oferta vinculante.",
      genderQ: "¿Cuál es su sexo?",
      carriersNote: "Compañías designadas con calificación A, y otras opciones según el estado.",
      updated: "Actualizado ago. 2026",
      tocCost: "Costo",
      tocWait: "Sin espera",
      tocCo: "Compañías",
      toc85: "Mayores de 85",
    };
  }
  return {
    title: "Life Insurance for Seniors Over 80 (2026) | Mejor Vida Insurance",
    desc: "Clear burial and final expense options after age 80. Appointed-company sample rates, no medical exam on most plans, and how to avoid an extra waiting period.",
    h1: "Burial and life insurance for seniors over 80",
    lead: "After 80, choices narrow, but many people can still get a small whole life policy. Age, health, and tobacco drive the price. This page explains what is usually available and shows illustrative monthly premiums from companies appointed with Mejor Vida Insurance.",
    crumbHome: "Home",
    crumbMid: "Life insurance",
    takeTitle: "Key points",
    take1: "If you answer the health questions and qualify, some plans <strong>can pay the full benefit from day one</strong> — even with prior medical conditions.",
    take2: "Most families look at <strong>$5,000 to $25,000</strong> to help with funeral costs and leftover bills, not a large term policy.",
    take3: "Many appointed companies take new applications through age <strong>85</strong>. A few go higher; after 85 the list gets shorter.",
    optTitle: "What options do seniors over 80 have?",
    optLead: "The usual path at this age is final expense insurance (small whole life). Large term and universal life are rarely the first stop, and they often need a medical exam.",
    feTitle: "Final expense (burial) insurance",
    feBody: "This is a small whole life policy — usually $50,000 or less. There is almost never a medical exam. There are health questions. If you qualify for a level plan, coverage can start without the two-year wait that guaranteed-acceptance plans add.",
    giTitle: "Guaranteed acceptance",
    giBody: "No exam and no health questions. Approval is nearly certain within the product’s age and amount limits. In return there is almost always a <strong>two-year wait</strong> for a natural death: if death happens in that window, the family usually receives premiums paid plus contract interest, not the full benefit. It often costs more than a level plan.",
    wlTitle: "Traditional whole life",
    wlBody: "Larger amounts (often $50,000 or more) and, after 80, almost always a medical exam. It can build cash value and the premium is usually fixed. For funeral costs, final expense is usually the simpler path.",
    termTitle: "Term life insurance",
    termBody: "It lasts a set number of years, then ends. At 80, a 10-year term — if approved — would end at 90. It usually needs an exam and much larger amounts than a burial plan. See <a href=\"term-life-cost.html\">term life cost</a> if you need a large amount for a limited time.",
    ulTitle: "Universal life",
    ulBody: "It is permanent, but the premium can rise if cash value does not perform as hoped. For most people over 80 who want to cover a funeral, it is not the clearest product.",
    tipTitle: "Keep this in mind",
    tipBody: "If health is fragile — recent cancer treatment, serious heart trouble, or other major conditions — a final expense plan (sometimes graded) is usually the realistic path. A large term policy with a medical exam almost never fits.",
    costTitle: "How much does burial insurance cost after 80?",
    costLead: "With Mejor Vida Insurance appointed companies, a level <strong>$10,000</strong> policy at age 80 is often near <strong>$95 a month for a woman</strong> and <strong>$133 a month for a man</strong> (non-tobacco, good health). The price rises with each year of age at issue. These figures are educational, not an offer.",
    costFactors: "Price changes with age, sex, tobacco, health, and amount. A plan with a two-year wait can look “easier,” but it often costs more and covers less at first.",
    female: "Female",
    male: "Male",
    age: "Age",
    waitTitle: "Can seniors over 80 get coverage with no waiting period?",
    waitLead: "Yes, if you answer the health questions honestly and the company approves a <strong>level</strong> plan. “No waiting period” does not mean “no questions.” Be careful with sites that promise instant approval for everyone: that is usually guaranteed acceptance with a two-year wait.",
    coTitle: "Appointed companies that still issue after 80",
    coLead: "These are companies Mejor Vida Insurance works with. Sample price is for an 80-year-old woman, non-tobacco, level $10,000 plan, from appointed quotes dated Aug. 15, 2026.",
    coFoot: "*Sample monthly premium for a female, age 80, non-tobacco, Level / Immediate at $10,000. Mejor Vida Insurance appointed-company quotes (Aug. 15, 2026). Graded or guaranteed-issue plans may add a two-year wait and cost more. Not a binding quote.",
    avoidTitle: "Offers that are usually worth skipping",
    avoidLead: "There are clearer — and often cheaper — paths than these:",
    avoid1: "<strong>Mail-only “guaranteed approval.”</strong> These almost always add a two-year wait and a high price. There is no government program that pays for a funeral for you.",
    avoid2: "<strong>Buying from one company without comparing.</strong> A carrier can have a familiar ad and still not be the best fit for your age, health, or state. Mejor Vida Insurance compares appointed companies for you.",
    avoid3: "<strong>Skipping the health questions when you can still answer them.</strong> If you qualify for a level plan, it usually costs less and can avoid the two-year wait.",
    over85Title: "Can you get life insurance after 85?",
    over85Lead: "Yes, in some cases. Mutual of Omaha Living Promise Level and Transamerica Immediate Solution take new applications through 85. <strong>Aetna Accendo Level can issue through age 89</strong> (the maximum amount drops with age). There is usually no medical exam; there are still health questions. The online form quotes through age 85. After that, call for a personal figure — we do not publish a rate table here because appointed quotes vary widely.",
    over85HeadInsurer: "Insurer",
    over85HeadCov: "Typical coverage",
    over85HeadType: "Type and wait (level plan)",
    applyTitle: "How to start",
    apply1: "<strong>Get a free quote</strong> — age, tobacco, and a few health questions. Mejor Vida Insurance compares appointed companies in Nebraska, Kansas, Colorado, and Nevada.",
    apply2: "<strong>Call or write</strong> if you would rather talk it through: <a href=\"tel:+14024405438\">402-440-5438</a> or WhatsApp.",
    apply3: "<strong>Review the offer</strong> — amount, any waiting period, and the monthly premium — before you sign. Nothing on this page is a contract.",
    faqTitle: "Frequently asked questions",
    faq1q: "Will I need a medical exam after 80?",
    faq1a: "On appointed final expense plans, usually not. There is a health questionnaire. Guaranteed-acceptance plans skip the questions but add a two-year wait for a natural death.",
    faq2q: "How much coverage is usually enough?",
    faq2a: "Many families choose $10,000 to $25,000 to help with a funeral or cremation and a few bills. A traditional U.S. burial often costs more than $8,000. A free quote can size the amount.",
    faq3q: "Do premiums go up each year after the policy is issued?",
    faq3a: "On most level final expense whole life policies, no — if you keep the policy in force. What does go up is the price of a new policy if you wait more years to apply.",
    faq4q: "Can I get coverage if I already have health problems?",
    faq4a: "Sometimes yes, on a level or graded plan, depending on the answers. If no level company can issue, guaranteed acceptance is still a path, with a two-year wait.",
    quoteHead: "Over 80 burial insurance quote",
    quote1: "Compare appointed companies",
    quote2: "See no-wait plans if you qualify",
    quote3: "Free quote — no spam",
    quoteCta: "See prices",
    quoteNote: "Table figures are educational samples, not a binding offer.",
    genderQ: "What is your gender?",
    carriersNote: "Appointed A-rated companies, plus other options by state.",
    updated: "Updated Aug. 2026",
    tocCost: "Cost",
    tocWait: "No waiting period",
    tocCo: "Companies",
    toc85: "Over 85",
  };
}

function headHtml(lang) {
  const c = copy(lang);
  const isEs = lang === "es";
  const prefix = isEs ? "" : "../";
  const esUrl = `https://www.mejorvidainsurance.com/${ES_FILE}`;
  const enUrl = `https://www.mejorvidainsurance.com/en/${EN_FILE}`;
  const canonical = isEs ? esUrl : enUrl;
  const ogImg = "https://www.mejorvidainsurance.com/img/opt/lic-hero-coffee-finca.jpg";
  return `<!DOCTYPE html>
<html class="lang-${isEs ? "es" : "en"}" lang="${isEs ? "es" : "en"}">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-K921EG6JWG');
</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${c.title}</title>
<meta content="${c.desc}" name="description"/>
<meta content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" name="robots"/>
<link href="${canonical}" rel="canonical"/>
<link href="${esUrl}" hreflang="es" rel="alternate"/>
<link href="${enUrl}" hreflang="en" rel="alternate"/>
<link href="${esUrl}" hreflang="x-default" rel="alternate"/>
<meta content="website" property="og:type"/>
<meta content="${c.title}" property="og:title"/>
<meta content="${c.desc}" property="og:description"/>
<meta content="${canonical}" property="og:url"/>
<meta content="${ogImg}" property="og:image"/>
<meta content="${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}" property="og:site_name"/>
<meta content="${isEs ? "es_ES" : "en_US"}" property="og:locale"/>
<meta content="${isEs ? "en_US" : "es_ES"}" property="og:locale:alternate"/>
<meta content="summary_large_image" name="twitter:card"/>
<meta content="${c.title}" name="twitter:title"/>
<meta content="${c.desc}" name="twitter:description"/>
<meta content="${ogImg}" name="twitter:image"/>
<link rel="preload" as="image" href="${prefix}img/opt/${HERO.base}.webp?v=${HERO.cache}" type="image/webp" fetchpriority="high"/>
<link href="${prefix}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${prefix}css/site-footer.css" rel="stylesheet"/>
<link href="${prefix}css/quote-flow-shared.css?v=20260723-mobile-menu" rel="stylesheet"/>
<link href="${prefix}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${prefix}css/nav-life-insurance.css?v=20260818-seniors" rel="stylesheet"/>
<link href="${prefix}css/life-insurance-cost.css?v=20260818-coffee" rel="stylesheet"/>
<link href="${prefix}css/mvi-assistant-widget.css?v=20260721-chat-z" rel="stylesheet"/>
<link href="${prefix}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<style>body { font-family: Inter, system-ui, -apple-system, sans-serif; }</style>
</head>
<body class="lic-page">`;
}

function mainHtml(lang) {
  const c = copy(lang);
  const isEs = lang === "es";
  const prefix = isEs ? "" : "../";
  const quote = `${prefix}quote.html`;
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  return `<main>
<section class="lic-hero">
<div class="lic-hero-media lic-hero-media--${HERO.modifier}" aria-hidden="true">
<picture>
<source srcset="${prefix}img/opt/${HERO.base}.webp?v=${HERO.cache}" type="image/webp"/>
<img src="${prefix}img/opt/${HERO.base}.jpg?v=${HERO.cache}" alt="" width="${HERO.width}" height="${HERO.height}" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb"><a href="${home}">${c.crumbHome}</a> › <a href="${mid}">${c.crumbMid}</a> › ${isEs ? "Mayores de 80" : "Over 80"}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
<div class="lic-byline"><span>${c.updated}</span></div>
</div>
</div>
</section>

<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">

<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#cost">${c.tocCost}</a>
<a href="#waiting">${c.tocWait}</a>
<a href="#companies">${c.tocCo}</a>
<a href="#over-85">${c.toc85}</a>
</nav>

<div class="lic-takeaways">
<h2>${c.takeTitle}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>

<section class="lic-section" id="options">
<h2>${c.optTitle}</h2>
<p>${c.optLead}</p>
<ul>
<li><strong>${c.feTitle}.</strong> ${c.feBody}</li>
<li><strong>${c.giTitle}.</strong> ${c.giBody}</li>
<li><strong>${c.wlTitle}.</strong> ${c.wlBody}</li>
<li><strong>${c.termTitle}.</strong> ${c.termBody}</li>
<li><strong>${c.ulTitle}.</strong> ${c.ulBody}</li>
</ul>
<div class="lic-tip">
<h3>${c.tipTitle}</h3>
<p>${c.tipBody}</p>
</div>
</section>

<section class="lic-section" id="cost">
<h2>${c.costTitle}</h2>
<p>${c.costLead}</p>
<p>${c.costFactors}</p>
<div class="lic-rate-tabs" role="tablist" aria-label="${isEs ? "Sexo" : "Gender"}">
<button type="button" class="lic-rate-tab is-active" role="tab" aria-selected="true" data-over80-gender="female">${c.female}</button>
<button type="button" class="lic-rate-tab" role="tab" aria-selected="false" data-over80-gender="male">${c.male}</button>
</div>
<div class="lic-rate-wrap lic-rate-wrap--tabs">
<table class="lic-rate-table">
<thead><tr><th scope="col">${c.age}</th><th scope="col">$5,000</th><th scope="col">$10,000</th><th scope="col">$25,000</th></tr></thead>
<tbody data-over80-tbody></tbody>
</table>
</div>
<p class="lic-rate-note">${isEs ? RATES.note.replace("Illustrative monthly premiums.", "Primas mensuales ilustrativas.").replace("Ages 80 and 85 are appointed-company quote lows rounded to the nearest dollar.", "Las edades 80 y 85 son los mínimos de cotización de compañías designadas, redondeados al dólar.").replace("Ages 81–84 are interpolated between those two published ages.", "Las edades 81–84 se interpolan entre esas dos edades publicadas.").replace("Educational only — not a binding quote.", "Solo educativo — no es cotización vinculante.") : RATES.note} ${isEs ? "No fumador, buena salud Nivel/Inmediato." : RATES.rating + "."}</p>
</section>

<section class="lic-section" id="waiting">
<h2>${c.waitTitle}</h2>
<p>${c.waitLead}</p>
</section>

<section class="lic-section lic-guide" id="companies">
<h2>${c.coTitle}</h2>
<p>${c.coLead}</p>
<div class="lic-co-grid lic-co-grid--compare">
${carrierCards(lang, prefix)}
</div>
<p class="lic-co-footnote">${c.coFoot}</p>
</section>

<section class="lic-section" id="avoid">
<h2>${c.avoidTitle}</h2>
<p>${c.avoidLead}</p>
<ul class="lic-avoid-list">
<li>${c.avoid1}</li>
<li>${c.avoid2}</li>
<li>${c.avoid3}</li>
</ul>
</section>

<section class="lic-section" id="over-85">
<h2>${c.over85Title}</h2>
<p>${c.over85Lead}</p>
<div class="lic-rate-wrap">
<table class="lic-insurer-table">
<thead><tr><th scope="col">${c.over85HeadInsurer}</th><th scope="col">${c.over85HeadCov}</th><th scope="col">${c.over85HeadType}</th><th scope="col"></th></tr></thead>
<tbody>
<tr>
<td>Aetna Accendo</td>
<td>$2,000–$25,000 ${isEs ? "a los 76–89" : "at ages 76–89"}</td>
<td>${isEs ? "Vida entera, sin espera en plan nivelado, hasta los 89" : "Whole life, no wait on level, through age 89"}</td>
<td><a class="lic-co-cta" href="${quote}">${isEs ? "Cotizar" : "Get quotes"}</a></td>
</tr>
<tr>
<td>Mutual of Omaha</td>
<td>$2,000–$50,000 ${isEs ? "hasta los 85" : "through 85"}</td>
<td>${isEs ? "Vida entera, sin espera en plan nivelado" : "Whole life, no wait on level"}</td>
<td><a class="lic-co-cta" href="${quote}">${isEs ? "Cotizar" : "Get quotes"}</a></td>
</tr>
<tr>
<td>Transamerica</td>
<td>${isEs ? "Desde $1,000, hasta los 85" : "From $1,000, through 85"}</td>
<td>${isEs ? "Vida entera, sin espera en plan Preferred" : "Whole life, no wait on Preferred"}</td>
<td><a class="lic-co-cta" href="${quote}">${isEs ? "Cotizar" : "Get quotes"}</a></td>
</tr>
</tbody>
</table>
</div>
</section>

<section class="lic-section" id="apply">
<h2>${c.applyTitle}</h2>
<ol class="lic-apply-list">
<li>${c.apply1}</li>
<li>${c.apply2}</li>
<li>${c.apply3}</li>
</ol>
</section>

<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
<details open><summary>${c.faq1q}</summary><p>${c.faq1a}</p></details>
<details><summary>${c.faq2q}</summary><p>${c.faq2a}</p></details>
<details><summary>${c.faq3q}</summary><p>${c.faq3a}</p></details>
<details><summary>${c.faq4q}</summary><p>${c.faq4a}</p></details>
</section>

<p class="lic-rate-note"><a href="${prefix}${isEs ? "costo-seguro-gastos-finales.html" : "final-expense-cost.html"}">${isEs ? "Costo de gastos finales" : "Final expense cost"}</a> · <a href="${prefix}${isEs ? "seguro-vida-entierro-sin-espera.html" : "no-waiting-period-life-burial.html"}">${isEs ? "Sin período de espera" : "No waiting period"}</a> · <a href="${prefix}${isEs ? "costo-seguro-vida.html" : "life-insurance-cost.html"}">${isEs ? "Todos los costos" : "All insurance costs"}</a></p>
</div>

<aside class="lic-aside" aria-label="${isEs ? "Pedir cotización" : "Get a quote"}">
<div class="lic-quote-card">
<div class="lic-quote-card__head">
<strong>${c.quoteHead}</strong>
</div>
<div class="lic-quote-card__body">
<ul class="lic-quote-card__checks">
<li>${c.quote1}</li>
<li>${c.quote2}</li>
<li>${c.quote3}</li>
</ul>
<a class="lic-quote-card__cta" href="${quote}">${c.quoteCta}</a>
<p class="lic-quote-card__note">${c.quoteNote}</p>
</div>
</div>
</aside>
</div>
</main>`;
}

function jsonLd(lang) {
  const c = copy(lang);
  const isEs = lang === "es";
  const url = isEs
    ? `https://www.mejorvidainsurance.com/${ES_FILE}`
    : `https://www.mejorvidainsurance.com/en/${EN_FILE}`;
  const home = "https://www.mejorvidainsurance.com/";
  const esc = (s) => s.replace(/"/g, '\\"').replace(/<[^>]+>/g, "");
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"WebPage","name":"${esc(c.h1)}","url":"${url}","inLanguage":"${isEs ? "es" : "en"}","isPartOf":{"@type":"WebSite","name":"${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}","url":"${home}"}},
{"@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"${esc(c.crumbHome)}","item":"${home}"},
{"@type":"ListItem","position":2,"name":"${esc(c.crumbMid)}","item":"${isEs ? home + "seguro-gastos-finales.html" : home + "en/final-expense-insurance.html"}"},
{"@type":"ListItem","position":3,"name":"${isEs ? "Mayores de 80" : "Over 80"}","item":"${url}"}
]},
{"@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"${esc(c.faq1q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq1a)}"}},
{"@type":"Question","name":"${esc(c.faq2q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq2a)}"}},
{"@type":"Question","name":"${esc(c.faq3q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq3a)}"}},
{"@type":"Question","name":"${esc(c.faq4q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq4a)}"}}
]}
]}
</script>`;
}

function build(lang) {
  const prefix = lang === "es" ? "" : "../";
  const html = `${headHtml(lang)}
${headerFor(lang)}
${mainHtml(lang)}
${jsonLd(lang)}
${footerFor(lang)}
<script>window.MVI_OVER80_RATES = ${JSON.stringify(RATES)};</script>
<script defer src="${prefix}js/seniors-over-80.js?v=20260818-over80"></script>
</body>
</html>
`;
  const out =
    lang === "es" ? path.join(ROOT, ES_FILE) : path.join(ROOT, "en", EN_FILE);
  fs.writeFileSync(out, html);
  return out;
}

function main() {
  const written = [build("es"), build("en")];
  console.log("Wrote", written.length, "pages");
  written.forEach((p) => console.log(" ", path.relative(ROOT, p)));
}

main();
