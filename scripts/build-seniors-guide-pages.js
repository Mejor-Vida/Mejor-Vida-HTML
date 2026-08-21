#!/usr/bin/env node
/**
 * Bilingual seniors guide pages:
 *   no medical exam + age limit
 *   node scripts/build-seniors-guide-pages.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ES_HEADER = path.join(ROOT, "includes/site-header-inner.html");
const EN_HEADER = path.join(ROOT, "includes/en-site-header.html");
const ES_FOOTER = path.join(ROOT, "includes/site-footer-inner.html");
const EN_FOOTER = path.join(ROOT, "includes/en-site-footer.html");
const PHONE = "402-440-5438";
const TEL = "+14024405438";

const PAGES = {
  exam: {
    esFile: "seguro-vida-mayores-sin-examen.html",
    enFile: "life-insurance-seniors-no-medical-exam.html",
    hero: {
      base: "lic-hero-corn-windmill",
      modifier: "corn",
      width: 1536,
      height: 1024,
      cache: "20260820-corn",
    },
  },
  age: {
    esFile: "limite-edad-seguro-vida.html",
    enFile: "life-insurance-age-limit.html",
    hero: {
      base: "lic-hero-alpine-lakes",
      modifier: "lakes",
      width: 1536,
      height: 1024,
      cache: "20260820-lakes",
    },
  },
};

function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function headerFor(lang, page) {
  if (lang === "es") {
    return fs
      .readFileSync(ES_HEADER, "utf8")
      .replace(/__PREFIX__/g, "")
      .replace('href="/en/"', `href="en/${page.enFile}"`)
      .trim();
  }
  return fs
    .readFileSync(EN_HEADER, "utf8")
    .replace(
      'href="../index.html" class="mvi-lang-fab',
      `href="../${page.esFile}" class="mvi-lang-fab`
    )
    .trim();
}

function footerFor(lang) {
  const extraEs = `<script defer src="bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="js/mvi-funnel-track.js?v=20260702e"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="js/mvi-nav-questions.js?v=20260820-seniors-guides"></script>
<script defer src="js/website-assistant-widget.js?v=20260813-scroll-top"></script>
<script>document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());</script>
`;
  const extraEn = `<script defer src="../bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="../js/mvi-funnel-track.js?v=20260702e"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="../js/mvi-nav-questions.js?v=20260820-seniors-guides"></script>
<script defer src="../js/website-assistant-widget.js?v=20260813-scroll-top"></script>
<script>document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());</script>
`;
  if (lang === "es") {
    return fs.readFileSync(ES_FOOTER, "utf8").replace(/__PREFIX__/g, "").trim() + "\n" + extraEs;
  }
  return (
    fs
      .readFileSync(EN_FOOTER, "utf8")
      .replace(/__ASSET__/g, "../")
      .replace(/__PAGE__/g, "")
      .trim() +
    "\n" +
    extraEn
  );
}

function copyExam(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Seguro de vida para mayores sin examen médico (2026) | Mejor Vida Seguros",
      desc: "Cómo funciona el seguro de vida para personas mayores sin examen médico: preguntas de salud, emisión simplificada vs. aceptación garantizada, y cuándo hay espera.",
      h1: "Seguro de vida para mayores sin examen médico",
      lead: "Para la mayoría de las personas mayores, “sin examen médico” no significa “sin preguntas”. Suele significar emisión simplificada: responde un cuestionario de salud y, si califica, muchas pólizas de gastos finales pueden pagar el beneficio completo desde el primer pago.",
      crumbEnd: "Sin examen médico",
      take1: "La mayoría de los planes de gastos finales que cotiza Mejor Vida Seguros <strong>no usan un examen médico en el consultorio</strong>. Usan preguntas de salud.",
      take2: "Si califica a un plan <strong>nivelado o inmediato</strong>, el beneficio completo puede aplicar desde el día uno (sujeto a exclusiones del contrato).",
      take3: "La <strong>aceptación garantizada</strong> también es sin examen — y casi siempre trae una espera de dos años por muerte natural.",
      s1h: "Qué significa “sin examen médico”",
      s1p1: "En seguro de vida para seniors, “sin examen médico” casi nunca significa que la aseguradora ignore su salud. Significa que <strong>no tiene que ir a un consultorio a que le tomen sangre o orina</strong>. En su lugar, responde preguntas, lista medicamentos y la compañía puede revisar bases de datos.",
      s1p2: "Eso se llama <strong>emisión simplificada</strong>. Es el camino más común para un seguro de gastos finales o de entierro. Mejor Vida Seguros compara estas opciones entre las compañías designadas.",
      s2h: "Emisión simplificada vs. aceptación garantizada",
      s2p: "Ambas rutas evitan el examen en el consultorio. La diferencia es el cuestionario y la espera:",
      s2a: "<strong>Emisión simplificada.</strong> Hay preguntas de salud. Si las respuestas califican a un plan nivelado, a menudo no hay espera de dos años para muerte natural cubierta.",
      s2b: "<strong>Aceptación garantizada.</strong> Pocas o ninguna pregunta de salud. La aprobación es casi segura dentro de los límites de edad y monto. A cambio, casi siempre hay una <strong>espera de dos años</strong> por muerte natural: en esa ventana la familia suele recibir primas pagadas más un interés del contrato, no el monto completo.",
      tipH: "Téngalo presente",
      tipP: "Los sitios que prometen “aprobación para todos, sin preguntas” suelen ser aceptación garantizada. Puede ser útil como plan B. No es el primer camino si aún puede calificar a un plan sin espera.",
      s3h: "¿Quién suele calificar?",
      s3p: "No hace falta “estar perfectamente sano”. Muchas personas con condiciones comunes — presión alta, diabetes controlada, colesterol — aún califican a un plan nivelado con una compañía. El trabajo es encontrar la aseguradora que acepte su combinación de edad, medicamentos y historial.",
      s3l1: "Edad de emisión y monto de cobertura que pide",
      s3l2: "Tabaco o nicotina",
      s3l3: "Medicamentos e historial reciente (cáncer, corazón, hospitalización)",
      s4h: "Cómo verificar si hay período de espera",
      s4p: "Pida la tabla de <strong>beneficio neto por año de póliza</strong>. Si el año 1 muestra el monto completo por muerte natural, es cobertura inmediata. Si muestra un porcentaje o “primas más interés”, hay espera o beneficio gradual. Vea también la página de <a href=\"seguro-vida-entierro-sin-espera.html\">cobertura sin período de espera</a>.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿El seguro de vida para mayores siempre requiere un examen médico?",
      faq1a: "No. La mayoría de los planes de gastos finales que cotiza Mejor Vida Seguros usan preguntas de salud, no un examen en el consultorio.",
      faq2q: "Si no hay examen, ¿me aprueban de todos modos?",
      faq2a: "No necesariamente. En emisión simplificada la compañía puede ofrecer plan inmediato, gradual o solo aceptación garantizada, según sus respuestas.",
      faq3q: "¿Hasta qué edad se puede comprar sin examen?",
      faq3a: "Depende de la compañía y del producto. Muchos planes de gastos finales aceptan solicitudes nuevas hasta los 85. Algunas compañías designadas emiten más tarde. Vea <a href=\"limite-edad-seguro-vida.html\">el límite de edad para comprar un seguro</a>.",
      faq4q: "¿El temporal también puede ser sin examen?",
      faq4a: "Algunos temporales de emisión simplificada o acelerada no usan examen en el consultorio si califica. Los máximos de edad y de monto suelen ser más estrictos que en gastos finales.",
      nextH: "Siguiente paso",
      nextP: `Para ver si califica a un plan sin examen y sin espera innecesaria, <a href="quote.html">obtenga una cotización gratuita</a> o llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a>.`,
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no asesoramiento legal ni una oferta de seguro. Primas, montos y aprobación dependen de la compañía, el estado y la solicitud. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actuales están en la página de <a href=\"licencias.html\">licencias</a>.",
    };
  }
  return {
    title: "Life Insurance for Seniors With No Medical Exam (2026) | Mejor Vida Insurance",
    desc: "How life insurance for seniors with no medical exam works: health questions, simplified issue vs. guaranteed acceptance, and when a waiting period still applies.",
    h1: "Life insurance for seniors with no medical exam",
    lead: "For most seniors, “no medical exam” does not mean “no questions.” It usually means simplified issue: you answer health questions, and if you qualify, many final expense policies can pay the full benefit from the first premium.",
    crumbEnd: "No medical exam",
    take1: "Most final expense plans Mejor Vida Insurance quotes <strong>do not use an in-office medical exam</strong>. They use health questions.",
    take2: "If you qualify for a <strong>level or immediate</strong> plan, the full benefit can apply from day one (subject to contract exclusions).",
    take3: "<strong>Guaranteed acceptance</strong> is also no-exam — and almost always adds a two-year wait for natural death.",
    s1h: "What “no medical exam” means",
    s1p1: "In senior life insurance, “no medical exam” almost never means the insurer ignores your health. It means you <strong>do not have to go to a clinic for blood or urine</strong>. You answer questions, list medications, and the company may check databases.",
    s1p2: "That is called <strong>simplified issue</strong>. It is the usual path for final expense or burial coverage. Mejor Vida Insurance compares these options among appointed companies.",
    s2h: "Simplified issue vs. guaranteed acceptance",
    s2p: "Both paths skip the in-office exam. The difference is the questionnaire and the wait:",
    s2a: "<strong>Simplified issue.</strong> There are health questions. If the answers qualify for a level plan, there is often no two-year wait for a covered natural death.",
    s2b: "<strong>Guaranteed acceptance.</strong> Few or no health questions. Approval is nearly certain within the product’s age and amount limits. In return there is almost always a <strong>two-year wait</strong> for natural death: in that window the family typically receives premiums paid plus contract interest, not the full face amount.",
    tipH: "Keep this in mind",
    tipP: "Sites that promise “approval for everyone, no questions” are usually guaranteed acceptance. That can be a useful Plan B. It is not the first path if you can still qualify for a plan without the extra wait.",
    s3h: "Who usually qualifies?",
    s3p: "You do not need perfect health. Many people with common conditions — high blood pressure, controlled diabetes, cholesterol — still qualify for a level plan with one company. The work is finding a carrier that will accept your mix of age, medications, and history.",
    s3l1: "Issue age and the amount you ask for",
    s3l2: "Tobacco or nicotine",
    s3l3: "Medications and recent history (cancer, heart, hospital stays)",
    s4h: "How to check for a waiting period",
    s4p: "Ask for the table of <strong>net death benefit by policy year</strong>. If year 1 shows the full face amount for natural death, that is immediate coverage. If it shows a percentage or “premiums plus interest,” there is a wait or a graded benefit. See also <a href=\"no-waiting-period-life-burial.html\">no-waiting-period coverage</a>.",
    faqTitle: "Frequently asked questions",
    faq1q: "Does life insurance for seniors always require a medical exam?",
    faq1a: "No. Most final expense plans Mejor Vida Insurance quotes use health questions, not an in-office exam.",
    faq2q: "If there is no exam, am I automatically approved?",
    faq2a: "Not necessarily. With simplified issue the company may offer immediate coverage, a graded plan, or only guaranteed acceptance, based on your answers.",
    faq3q: "Until what age can I buy coverage with no exam?",
    faq3a: "It depends on the company and the product. Many final expense plans take new applications through age 85. Some appointed companies issue later. See <a href=\"life-insurance-age-limit.html\">the age limit for buying insurance</a>.",
    faq4q: "Can term life also skip the exam?",
    faq4a: "Some simplified or accelerated term products skip the in-office exam if you qualify. Age and face-amount limits are usually tighter than on final expense.",
    nextH: "Next step",
    nextP: `To see if you qualify for a no-exam plan without an extra wait, <a href="quote.html">get a free quote</a> or call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a>.`,
    discTitle: "Disclosure",
    discBody: "This page is educational, not legal advice, and not an offer of insurance. Premiums, amounts, and approval depend on the company, the state, and the application. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
  };
}

function copyAge(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "¿Cuál es el límite de edad para comprar un seguro de vida? (2026) | Mejor Vida Seguros",
      desc: "No hay un único límite de edad en EE. UU. Depende del producto y de la compañía: temporal, gastos finales y emisión hasta los 85 o 89.",
      h1: "¿Cuál es el límite de edad para comprar un seguro de vida?",
      lead: "No existe una edad máxima universal. Cada producto y cada aseguradora fija hasta qué edad acepta solicitudes nuevas. Para gastos finales, muchas compañías designadas emiten hasta los 85; algunas llegan más lejos.",
      crumbEnd: "Límite de edad",
      take1: "El límite depende del <strong>tipo de póliza</strong> y de la compañía — no de una sola regla federal.",
      take2: "El <strong>temporal</strong> suele cortar antes. Un plazo de 30 años no está disponible a los 80.",
      take3: "En <strong>gastos finales</strong>, muchas compañías designadas aceptan solicitudes nuevas hasta los <strong>85</strong>. Aetna Accendo, en productos designados, puede emitir hasta los <strong>89</strong> (con un tope de monto a edades avanzadas).",
      s1h: "No hay un solo “tope de edad”",
      s1p: "La ley no dice “nadie puede comprar seguro de vida después de X años”. Lo que importa es la <strong>edad de emisión</strong> de cada producto: hasta qué edad la aseguradora acepta una solicitud nueva. Pasada esa edad, no hay póliza nueva con esa compañía y ese producto — aunque ya tenga una póliza en vigor.",
      s2h: "Edades típicas de emisión (compañías designadas)",
      s2p: "Estos rangos son de productos que Mejor Vida Seguros cotiza. No son una lista completa de todo el mercado. La disponibilidad también depende del estado y de la salud.",
      rowH1: "Tipo de cobertura",
      rowH2: "Edades típicas de nuevos solicitantes",
      r1a: "Gastos finales / vida entera simplificada",
      r1b: "A menudo 45 o 50 hasta 85",
      r2a: "Aetna Accendo (gastos finales, plan nivelado designado)",
      r2b: "Hasta 89 (tope de $25,000 a los 76–89)",
      r3a: "Vida temporal",
      r3b: "Depende del plazo y del tabaco; muchos plazos cortan entre los 50 y los 80",
      r4a: "Aceptación garantizada",
      r4b: "Límites de edad y de monto propios de cada producto; suele haber espera de dos años",
      s3h: "¿Se puede comprar después de los 85?",
      s3p: "A veces sí, con menos compañías y montos más bajos. Vea <a href=\"seguro-vida-mayores-85.html\">seguro de vida para mayores de 85</a>. Si no hay emisión nueva, las opciones suelen ser ahorros propios o una póliza que ya esté en vigor.",
      s4h: "¿Y después de los 90?",
      s4p: "En la práctica, las compañías designadas de Mejor Vida Seguros no abren solicitudes nuevas de gastos finales a esa edad. Una póliza que ya tiene no se “vence” solo por cumplir años: la vida entera permanente sigue si las primas se pagan.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Hay una edad máxima legal para comprar seguro de vida?",
      faq1a: "No hay un tope único para todo el país. Cada producto publica sus edades de emisión.",
      faq2q: "¿A los 80 todavía puedo comprar?",
      faq2a: "Sí, en muchos casos. Vea <a href=\"seguro-vida-mayores-80.html\">seguro para mayores de 80</a>. El monto y el precio cambian con la edad y la salud.",
      faq3q: "¿El temporal está disponible a los 75?",
      faq3a: "Algunos plazos cortos sí, otros no. El plazo de 30 años suele cortar mucho antes. Mejor Vida Seguros confirma el producto que aplica a su edad.",
      faq4q: "Si ya tengo una póliza, ¿se cancela al cumplir cierta edad?",
      faq4a: "La vida entera permanente no caduca por edad si sigue pagando. El temporal sí termina al final del plazo, no en un cumpleaños fijo.",
      nextH: "Siguiente paso",
      nextP: `Para confirmar qué productos aplican a su edad, <a href="quote.html">obtenga una cotización gratuita</a> o llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a>.`,
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no una oferta. Las edades de emisión cambian según compañía, producto, tabaco y estado. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actuales están en la página de <a href=\"licencias.html\">licencias</a>.",
    };
  }
  return {
    title: "What Is the Age Limit for Buying Life Insurance? (2026) | Mejor Vida Insurance",
    desc: "There is no single U.S. age limit. It depends on the product and company: term, final expense, and issue ages through 85 or 89.",
    h1: "What is the age limit for buying life insurance?",
    lead: "There is no universal maximum age. Each product and each insurer sets the last age it will take a new application. For final expense, many appointed companies issue through 85; some go further.",
    crumbEnd: "Age limit",
    take1: "The limit depends on the <strong>policy type</strong> and the company — not one federal rule.",
    take2: "<strong>Term</strong> usually cuts off earlier. A 30-year term is not available at age 80.",
    take3: "For <strong>final expense</strong>, many appointed companies take new applications through age <strong>85</strong>. Appointed Aetna Accendo can issue through age <strong>89</strong> (with a face-amount cap at later ages).",
    s1h: "There is no single “age cap”",
    s1p: "The law does not say “nobody can buy life insurance after age X.” What matters is each product’s <strong>issue age</strong>: the last age the insurer will accept a new application. After that, there is no new policy with that company and product — even if you already own a policy that stays in force.",
    s2h: "Typical issue ages (appointed companies)",
    s2p: "These ranges are from products Mejor Vida Insurance quotes. They are not a complete list of the whole market. Availability also depends on state and health.",
    rowH1: "Coverage type",
    rowH2: "Typical new-issue ages",
    r1a: "Final expense / simplified whole life",
    r1b: "Often 45 or 50 through 85",
    r2a: "Aetna Accendo (appointed level final expense)",
    r2b: "Through 89 ($25,000 maximum at ages 76–89)",
    r3a: "Term life",
    r3b: "Depends on term length and tobacco; many terms cut off between 50 and 80",
    r4a: "Guaranteed acceptance",
    r4b: "Each product has its own age and amount limits; a two-year wait is typical",
    s3h: "Can you buy after 85?",
    s3p: "Sometimes, with fewer companies and lower amounts. See <a href=\"life-insurance-seniors-over-85.html\">life insurance for seniors over 85</a>. If no company will issue new coverage, the remaining options are usually personal savings or a policy already in force.",
    s4h: "What about after 90?",
    s4p: "In practice, Mejor Vida Insurance appointed final expense companies do not open new applications at that age. A policy you already own does not “expire” just because you have a birthday: permanent whole life continues if premiums are paid.",
    faqTitle: "Frequently asked questions",
    faq1q: "Is there a legal maximum age to buy life insurance?",
    faq1a: "There is no single nationwide cap. Each product publishes its issue ages.",
    faq2q: "Can I still buy at 80?",
    faq2a: "Yes, in many cases. See <a href=\"life-insurance-seniors-over-80.html\">life insurance over 80</a>. Amount and price change with age and health.",
    faq3q: "Is term available at 75?",
    faq3a: "Some shorter terms yes, others no. A 30-year term usually cuts off much earlier. Mejor Vida Insurance confirms which product fits your age.",
    faq4q: "If I already have a policy, does it cancel at a certain age?",
    faq4a: "Permanent whole life does not expire by age if you keep paying. Term ends at the end of the term period, not on a fixed birthday.",
    nextH: "Next step",
    nextP: `To confirm which products apply at your age, <a href="quote.html">get a free quote</a> or call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a>.`,
    discTitle: "Disclosure",
    discBody: "This page is educational, not an offer. Issue ages change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
  };
}

function headHtml(lang, page, c) {
  const isEs = lang === "es";
  const prefix = isEs ? "" : "../";
  const esUrl = `https://www.mejorvidainsurance.com/${page.esFile}`;
  const enUrl = `https://www.mejorvidainsurance.com/en/${page.enFile}`;
  const canonical = isEs ? esUrl : enUrl;
  const ogImg = `https://www.mejorvidainsurance.com/img/opt/${page.hero.base}.jpg`;
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
<title>${escAttr(c.title)}</title>
<meta content="${escAttr(c.desc)}" name="description"/>
<meta content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" name="robots"/>
<meta content="Julie Braunsroth, Licensed Insurance Agent - Mejor Vida Insurance LLC" name="author"/>
<link href="${canonical}" rel="canonical"/>
<link href="${esUrl}" hreflang="es" rel="alternate"/>
<link href="${enUrl}" hreflang="en" rel="alternate"/>
<link href="${esUrl}" hreflang="x-default" rel="alternate"/>
<meta content="website" property="og:type"/>
<meta content="${escAttr(c.title)}" property="og:title"/>
<meta content="${escAttr(c.desc)}" property="og:description"/>
<meta content="${canonical}" property="og:url"/>
<meta content="${ogImg}" property="og:image"/>
<meta content="${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}" property="og:site_name"/>
<meta content="${isEs ? "es_ES" : "en_US"}" property="og:locale"/>
<meta content="${isEs ? "en_US" : "es_ES"}" property="og:locale:alternate"/>
<meta content="summary_large_image" name="twitter:card"/>
<meta content="${escAttr(c.title)}" name="twitter:title"/>
<meta content="${escAttr(c.desc)}" name="twitter:description"/>
<meta content="${ogImg}" name="twitter:image"/>
<link rel="preload" as="image" href="${prefix}img/opt/${page.hero.base}.webp?v=${page.hero.cache}" type="image/webp" fetchpriority="high"/>
<link href="${prefix}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${prefix}css/site-footer.css" rel="stylesheet"/>
<link href="${prefix}css/quote-flow-shared.css?v=20260723-mobile-menu" rel="stylesheet"/>
<link href="${prefix}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${prefix}css/nav-life-insurance.css?v=20260820-seniors-guides" rel="stylesheet"/>
<link href="${prefix}css/life-insurance-cost.css?v=20260820-over85-full" rel="stylesheet"/>
<link href="${prefix}css/mvi-assistant-widget.css?v=20260721-chat-z" rel="stylesheet"/>
<link href="${prefix}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<style>body { font-family: Inter, system-ui, -apple-system, sans-serif; }</style>
</head>
<body class="lic-page">`;
}

function examMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const over80 = isEs ? "seguro-vida-mayores-80.html" : "life-insurance-seniors-over-80.html";
  const age = isEs ? "limite-edad-seguro-vida.html" : "life-insurance-age-limit.html";
  const about = "about-julie.html";
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
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › <a href="${mid}">${isEs ? "Seguro de vida" : "Life insurance"}</a> › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
<div class="lic-byline">
<picture>
<source type="image/webp" srcset="${assets}img/opt/julie-headshot.webp"/>
<img src="${assets}img/opt/julie-headshot.png" alt="" width="72" height="72" decoding="async"/>
</picture>
<span>${isEs ? "Escrito por" : "Written by"} <a href="${about}">Julie Braunsroth</a>, ${isEs ? "agente de seguros licenciada" : "licensed insurance agent"}</span>
<span>${isEs ? "Actualizado ago. 2026" : "Updated Aug. 2026"}</span>
</div>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#meaning">${isEs ? "Qué significa" : "What it means"}</a>
<a href="#compare">${isEs ? "Tipos" : "Types"}</a>
<a href="#qualify">${isEs ? "Calificar" : "Qualify"}</a>
<a href="${age}">${isEs ? "Límite de edad" : "Age limit"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Puntos clave" : "Key points"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<section class="lic-section" id="meaning">
<h2>${c.s1h}</h2>
<p>${c.s1p1}</p>
<p>${c.s1p2}</p>
</section>
<section class="lic-section" id="compare">
<h2>${c.s2h}</h2>
<p>${c.s2p}</p>
<ul>
<li>${c.s2a}</li>
<li>${c.s2b}</li>
</ul>
<div class="lic-tip">
<h3>${c.tipH}</h3>
<p>${c.tipP}</p>
</div>
</section>
<section class="lic-section" id="qualify">
<h2>${c.s3h}</h2>
<p>${c.s3p}</p>
<ul>
<li>${c.s3l1}</li>
<li>${c.s3l2}</li>
<li>${c.s3l3}</li>
</ul>
</section>
<section class="lic-section" id="waiting">
<h2>${c.s4h}</h2>
<p>${c.s4p}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
<details open><summary>${c.faq1q}</summary><p>${c.faq1a}</p></details>
<details><summary>${c.faq2q}</summary><p>${c.faq2a}</p></details>
<details><summary>${c.faq3q}</summary><p>${c.faq3a}</p></details>
<details><summary>${c.faq4q}</summary><p>${c.faq4a}</p></details>
</section>
<section class="lic-section" id="next">
<h2>${c.nextH}</h2>
<p>${c.nextP}</p>
</section>
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<p class="lic-rate-note"><a href="${over80}">${isEs ? "Mayores de 80" : "Seniors over 80"}</a> · <a href="${age}">${isEs ? "Límite de edad" : "Age limit"}</a> · <a href="${isEs ? "seguro-vida-entierro-sin-espera.html" : "no-waiting-period-life-burial.html"}">${isEs ? "Sin período de espera" : "No waiting period"}</a></p>
</div>
<aside class="lic-aside" aria-label="${isEs ? "Pedir cotización" : "Get a quote"}">
<div class="lic-quote-card">
<div class="lic-quote-card__head"><strong>${isEs ? "Cotización gratuita" : "Free quote"}</strong></div>
<div class="lic-quote-card__body">
<ul class="lic-quote-card__checks">
<li>${isEs ? "Sin examen en el consultorio en la mayoría de los planes de gastos finales." : "No in-office exam on most final expense plans."}</li>
<li>${isEs ? "Mejor Vida Seguros compara compañías designadas." : "Mejor Vida Insurance compares appointed companies."}</li>
<li>${isEs ? "Llame al " + PHONE + "." : "Call " + PHONE + "."}</li>
</ul>
<a class="lic-quote-card__cta" href="quote.html">${isEs ? "Ver precios" : "See prices"}</a>
</div>
</div>
</aside>
</div>
</main>`;
}

function ageMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const exam = isEs ? "seguro-vida-mayores-sin-examen.html" : "life-insurance-seniors-no-medical-exam.html";
  const over80 = isEs ? "seguro-vida-mayores-80.html" : "life-insurance-seniors-over-80.html";
  const over85 = isEs ? "seguro-vida-mayores-85.html" : "life-insurance-seniors-over-85.html";
  const about = "about-julie.html";
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
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › <a href="${mid}">${isEs ? "Seguro de vida" : "Life insurance"}</a> › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
<div class="lic-byline">
<picture>
<source type="image/webp" srcset="${assets}img/opt/julie-headshot.webp"/>
<img src="${assets}img/opt/julie-headshot.png" alt="" width="72" height="72" decoding="async"/>
</picture>
<span>${isEs ? "Escrito por" : "Written by"} <a href="${about}">Julie Braunsroth</a>, ${isEs ? "agente de seguros licenciada" : "licensed insurance agent"}</span>
<span>${isEs ? "Actualizado ago. 2026" : "Updated Aug. 2026"}</span>
</div>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#cap">${isEs ? "Sin tope único" : "No single cap"}</a>
<a href="#ages">${isEs ? "Edades típicas" : "Typical ages"}</a>
<a href="#after85">${isEs ? "Después de 85" : "After 85"}</a>
<a href="${exam}">${isEs ? "Sin examen" : "No exam"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Puntos clave" : "Key points"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<section class="lic-section" id="cap">
<h2>${c.s1h}</h2>
<p>${c.s1p}</p>
</section>
<section class="lic-section" id="ages">
<h2>${c.s2h}</h2>
<p>${c.s2p}</p>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${c.rowH1}</th><th scope="col">${c.rowH2}</th></tr></thead>
<tbody>
<tr><td>${c.r1a}</td><td>${c.r1b}</td></tr>
<tr><td>${c.r2a}</td><td>${c.r2b}</td></tr>
<tr><td>${c.r3a}</td><td>${c.r3b}</td></tr>
<tr><td>${c.r4a}</td><td>${c.r4b}</td></tr>
</tbody>
</table>
</div>
</section>
<section class="lic-section" id="after85">
<h2>${c.s3h}</h2>
<p>${c.s3p}</p>
</section>
<section class="lic-section" id="after90">
<h2>${c.s4h}</h2>
<p>${c.s4p}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
<details open><summary>${c.faq1q}</summary><p>${c.faq1a}</p></details>
<details><summary>${c.faq2q}</summary><p>${c.faq2a}</p></details>
<details><summary>${c.faq3q}</summary><p>${c.faq3a}</p></details>
<details><summary>${c.faq4q}</summary><p>${c.faq4a}</p></details>
</section>
<section class="lic-section" id="next">
<h2>${c.nextH}</h2>
<p>${c.nextP}</p>
</section>
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<p class="lic-rate-note"><a href="${over80}">${isEs ? "Mayores de 80" : "Seniors over 80"}</a> · <a href="${over85}">${isEs ? "Mayores de 85" : "Seniors over 85"}</a> · <a href="${exam}">${isEs ? "Sin examen médico" : "No medical exam"}</a></p>
</div>
<aside class="lic-aside" aria-label="${isEs ? "Pedir cotización" : "Get a quote"}">
<div class="lic-quote-card">
<div class="lic-quote-card__head"><strong>${isEs ? "Cotización gratuita" : "Free quote"}</strong></div>
<div class="lic-quote-card__body">
<ul class="lic-quote-card__checks">
<li>${isEs ? "Confirmamos qué producto aplica a su edad." : "We confirm which product fits your age."}</li>
<li>${isEs ? "Mejor Vida Seguros compara compañías designadas." : "Mejor Vida Insurance compares appointed companies."}</li>
<li>${isEs ? "Llame al " + PHONE + "." : "Call " + PHONE + "."}</li>
</ul>
<a class="lic-quote-card__cta" href="quote.html">${isEs ? "Ver precios" : "See prices"}</a>
</div>
</div>
</aside>
</div>
</main>`;
}

function jsonLd(lang, page, c) {
  const isEs = lang === "es";
  const url = isEs
    ? `https://www.mejorvidainsurance.com/${page.esFile}`
    : `https://www.mejorvidainsurance.com/en/${page.enFile}`;
  const home = "https://www.mejorvidainsurance.com/";
  const strip = (s) => String(s).replace(/"/g, '\\"').replace(/<[^>]+>/g, "");
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"WebPage","name":"${strip(c.h1)}","url":"${url}","inLanguage":"${isEs ? "es" : "en"}","author":{"@type":"Person","name":"Julie Braunsroth","url":"${home}about-julie.html"},"isPartOf":{"@type":"WebSite","name":"${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}","url":"${home}"}},
{"@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"${strip(c.faq1q)}","acceptedAnswer":{"@type":"Answer","text":"${strip(c.faq1a)}"}},
{"@type":"Question","name":"${strip(c.faq2q)}","acceptedAnswer":{"@type":"Answer","text":"${strip(c.faq2a)}"}},
{"@type":"Question","name":"${strip(c.faq3q)}","acceptedAnswer":{"@type":"Answer","text":"${strip(c.faq3a)}"}},
{"@type":"Question","name":"${strip(c.faq4q)}","acceptedAnswer":{"@type":"Answer","text":"${strip(c.faq4a)}"}}
]}
]}
</script>`;
}

function build(kind, lang) {
  const page = PAGES[kind];
  const c = kind === "exam" ? copyExam(lang) : copyAge(lang);
  const main = kind === "exam" ? examMain(lang, page, c) : ageMain(lang, page, c);
  const html = `${headHtml(lang, page, c)}
${headerFor(lang, page)}
${main}
${jsonLd(lang, page, c)}
${footerFor(lang)}
</body>
</html>
`;
  const out =
    lang === "es" ? path.join(ROOT, page.esFile) : path.join(ROOT, "en", page.enFile);
  fs.writeFileSync(out, html);
  return out;
}

function main() {
  const written = [
    build("exam", "es"),
    build("exam", "en"),
    build("age", "es"),
    build("age", "en"),
  ];
  console.log("Wrote", written.length, "pages");
  written.forEach((p) => console.log(" ", path.relative(ROOT, p)));
}

main();
