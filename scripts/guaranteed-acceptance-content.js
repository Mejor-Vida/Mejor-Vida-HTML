"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

function copyGi(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Aceptación garantizada: cómo funciona y cuánto cuesta (2026) | Mejor Vida Seguros",
      desc: "Seguro de aceptación garantizada sin preguntas de salud: espera de dos años, precios ilustrativos de Corebridge GIWL y cuándo un plan nivelado sigue siendo mejor.",
      h1: "Qué es el seguro de aceptación garantizada y cómo funciona",
      lead: "La aceptación garantizada es una vida entera pequeña sin examen médico y sin preguntas de salud. Si cumple la edad y el monto del producto, la aprobación no se niega por historial médico. A cambio hay una espera típica de dos años por muerte natural, y suele costar más por cada dólar de cobertura.",
      crumbEnd: "Aceptación garantizada",
      take1: "Estos planes <strong>siempre tienen un período de espera</strong> (en la práctica, dos años) por muerte no accidental.",
      take2: "Para algunas condiciones graves es el único camino a una póliza nueva. <strong>La mayoría de las personas mayores</strong> con diabetes, presión alta u otras condiciones comunes todavía pueden calificar a un plan nivelado con preguntas — más barato y sin esa espera de dos años.",
      take3: "Mejor Vida Seguros cotiza <strong>Corebridge GIWL</strong> como vida entera de aceptación garantizada: edades 50–80 y montos de $5,000 a $25,000.",
      callout: "Empiece por un plan de gastos finales con preguntas de salud. La aceptación garantizada es el plan B cuando ese cuestionario no da un beneficio inmediato.",
      howH: "Cómo funciona",
      howP1: "No hay examen en el consultorio, no hay análisis de sangre y no hay cuestionario de salud ni de estilo de vida. Dentro de la edad y el monto del producto, la compañía no lo rechaza por condiciones previas. Por eso se llama aceptación garantizada (también “emisión garantizada”).",
      howP2: "En los productos que cotiza Mejor Vida Seguros esto es <strong>vida entera</strong>, no un temporal ni un universal. A veces se habla de beneficio gradual o modificado: el nombre cambia; la idea es la misma. No cotizamos aceptación garantizada en vida temporal.",
      howP3: "Las primas son fijas si mantiene la póliza al día. En Corebridge GIWL los pagos requeridos terminan a los 90 años o antes, según el contrato. El monto no se puede subir o bajar después de emitir.",
      waitH: "Qué pasa durante la espera",
      waitP: "Si el fallecimiento no es un accidente cubierto en los primeros dos años, la familia no recibe el monto completo. En Corebridge GIWL esa prestación limitada es el <strong>110% de las primas pagadas</strong>. A partir del año tres, el beneficio completo aplica por muerte natural cubierta. Un accidente cubierto puede pagar el monto desde el inicio (con exclusiones del contrato). En suicidio, el contrato suele devolver primas en el período previsto.",
      waitNote: "Ninguna compañía que cotizamos ofrece aceptación garantizada <em>y</em> beneficio completo por muerte natural desde el día uno. Si un anuncio dice “sin examen y sin espera”, casi siempre hay preguntas de salud.",
      needH: "¿Necesita realmente aceptación garantizada?",
      needP: "Muchas personas mayores creen que es su única opción porque tienen diabetes, presión alta, EPOC, un infarto previo u otras condiciones. En gastos finales simplificados esas situaciones <strong>a menudo sí califican</strong> a un plan nivelado o inmediato: hay preguntas, no un examen, y el beneficio completo puede aplicar desde el primer pago cubierto. Ese camino suele ser más barato. La aceptación garantizada encaja cuando el cuestionario no puede emitir un plan nivelado — no como primer intento.",
      healthH: "Cuándo suele ser el único camino a una póliza nueva",
      healthP: "En las compañías designadas, un plan simplificado (con preguntas) a menudo no se puede emitir si aplica alguna de estas situaciones. Entonces sí se mira aceptación garantizada. No es un diagnóstico ni una lista legal: una cotización confirma el producto.",
      h1l: "VIH o SIDA",
      h2l: "Alzheimer o demencia",
      h3l: "Estar en un hospital, residencia de ancianos, hospicio, enfermería especializada o con cuidado de salud en el hogar",
      h4l: "Oxígeno por una condición pulmonar (no apnea del sueño)",
      h5l: "Silla de ruedas, scooter o estar en cama por una enfermedad (no una lesión breve)",
      h6l: "Cáncer en tratamiento activo (algunos cánceres de piel o etapas muy tempranas todavía pueden ir por simplificado)",
      h7l: "Abuso de alcohol o drogas, o tratamiento por ello, en los últimos 24 meses",
      h8l: "Incapacidad mental",
      h9l: "Enfermedad terminal",
      h10l: "Diálisis, enfermedad renal avanzada o trasplante de órgano",
      healthNote: "EPOC con tabaco es otro ejemplo frecuente: el simplificado designado suele declinar y GIWL puede seguir siendo una vía. Si ninguna de estas situaciones aplica, lo habitual es cotizar primero un plan nivelado.",
      vsH: "Aceptación garantizada frente a emisión simplificada (“sin examen”)",
      vsP: "“Sin examen médico” no es lo mismo que “sin preguntas de salud”. Los anuncios de “sin examen” casi siempre siguen pidiendo un cuestionario. Si lo aprueban en un plan nivelado, normalmente no hay espera de dos años por muerte natural cubierta.",
      vsH1: "Emisión simplificada",
      vs1: "Hay preguntas de salud y revisión de bases de datos.",
      vs2: "Puede haber plan inmediato, gradual o una declinación.",
      vs3: "Si califica a nivelado, el beneficio completo puede aplicar desde el día uno.",
      vs4: "Suele costar menos por cada dólar de cobertura.",
      vsH2: "Aceptación garantizada",
      vs5: "No hay preguntas de salud ni pruebas médicas.",
      vs6: "Dentro de edad y monto, no se niega por historial médico.",
      vs7: "Siempre hay espera de dos años por muerte no accidental.",
      vs8: "Prima más alta; montos tope más bajos (aquí, hasta $25,000).",
      costH: "Cuánto cuesta",
      costP: "El precio depende de la edad exacta, el sexo y el monto. <strong>El historial de salud no cambia esta prima</strong> porque no hay preguntas. Los cuadros son primas mensuales ilustrativas de Corebridge GIWL, el producto de aceptación garantizada que Mejor Vida Seguros cotiza. Incluyen la cuota anual de la póliza. Confirme una cotización en vivo: no es una oferta.",
      costNote: "Ejemplo: a los 50 años, $10,000 ronda <strong>$42 al mes para una mujer</strong> y <strong>$61 al mes para un hombre</strong>. A los 65, esas cifras suben cerca de <strong>$72 / $99</strong>. Un plan nivelado de gastos finales, si califica, suele ser más bajo a la misma edad y monto.",
      noWaitH: "¿Existe aceptación garantizada sin período de espera?",
      noWaitP: "No en las compañías que cotizamos. Toda la aceptación garantizada que ofrecemos tiene al menos dos años de espera por muerte natural. Si necesita beneficio desde el día uno, el camino es un plan <a href=\"seguro-vida-entierro-sin-espera.html\">nivelado o inmediato con preguntas</a>.",
      coH: "Producto designado de aceptación garantizada",
      coP: "Esta ficha es el GIWL que Mejor Vida Seguros cotiza. Otras compañías designadas (por ejemplo Mutual of Omaha Living Promise Nivelado) son emisión simplificada: hay preguntas y, si califica, no usan esta espera de dos años. No publicamos compañías con las que no trabajamos.",
      coProduct: "GIWL (emisión garantizada, vida entera)",
      coAges: "Edades",
      coAmt: "Monto",
      coWait: "Espera de 2 años",
      coAgesV: "50–80",
      coAmtV: "$5,000–$25,000",
      coWaitV: "Sí (muerte natural)",
      coFoot: "Una póliza GIWL por asegurado cada 12 meses; el total GIWL de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Me pueden negar un seguro de aceptación garantizada por la salud?",
      faq1a: "No por el historial médico, si está en la edad y el monto del producto. Todavía hay que cumplir reglas del contrato (identidad, pago y dónde está archivado el producto). Corebridge GIWL no se cotiza en todos los estados.",
      faq2q: "¿La salud cambia el precio?",
      faq2a: "No. En aceptación garantizada la prima sale de edad, sexo y monto. Por eso puede costar más que un plan nivelado: la compañía no puede seleccionar por salud.",
      faq3q: "¿Hay aceptación garantizada en vida temporal?",
      faq3a: "No en lo que cotizamos. Estos planes son vida entera pequeña de gastos finales.",
      faq4q: "Tengo diabetes o presión alta. ¿Solo me queda este plan?",
      faq4a: "Casi nunca. Condiciones comunes a menudo califican a gastos finales simplificados, con preguntas y sin esa espera de dos años si el plan es nivelado. Cotice primero ese camino.",
      faq5q: "¿Qué recibe la familia si fallezco el primer año?",
      faq5a: "Si no es un accidente cubierto, en GIWL reciben el 110% de las primas pagadas, no los $10,000 o $25,000 de cobertura. Un accidente cubierto puede pagar el monto. El suicidio sigue las reglas de devolución de primas del contrato.",
      faq6q: "¿Hasta qué edad se puede comprar?",
      faq6a: "El GIWL designado emite de 50 a 80 años. Después de 80, Mejor Vida Seguros mira planes nivelados de gastos finales (algunos hasta 85; Accendo Level hasta 89), no un “sí automático” sin cuestionario.",
      faq7q: "¿Cuánta cobertura puedo pedir?",
      faq7a: "En GIWL, de $5,000 a $25,000. Un plan nivelado de otra compañía designada puede llegar más alto (por ejemplo Living Promise Nivelado hasta cerca de $50,000) si califica.",
      faq8q: "¿“Sin examen” significa sin preguntas?",
      faq8a: "No. Sin examen suele ser emisión simplificada: hay cuestionario. Sin preguntas de salud es aceptación garantizada, con espera.",
      faq9q: "¿Las primas suben cada año?",
      faq9a: "No, si mantiene la póliza al día. En GIWL los pagos requeridos terminan a los 90 o antes, según el contrato.",
      faq10q: "¿Puedo usar el beneficio en vida?",
      faq10a: "Algunos contratos GIWL incluyen aceleración por enfermedad crónica o terminal, con reglas y variaciones por estado. No es un reemplazo de un seguro de cuidados a largo plazo. Lo confirmamos en la cotización.",
      nextH: "Siguiente paso",
      nextP: `Mejor Vida Seguros compara primero un plan nivelado. Si el cuestionario no da esa vía, cotizamos GIWL. <a href="quote.html">Pida precios</a> o llame al <a href="tel:${TEL}">${PHONE}</a>.`,
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no una oferta. Edades, montos y primas cambian según compañía, producto y estado. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actuales están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotización",
      quote1: "Compañías designadas",
      quote2: "Nivelado primero",
    };
  }
  return {
    title: "Guaranteed Acceptance Life Insurance: How It Works (2026) | Mejor Vida Insurance",
    desc: "Guaranteed acceptance life insurance with no health questions: the two-year wait, Corebridge GIWL sample rates, and when a level final-expense plan is still the better first step.",
    h1: "What is guaranteed acceptance life insurance and how does it work?",
    lead: "Guaranteed acceptance is a small whole life policy with no medical exam and no health questions. If you meet the product’s age and amount rules, you are not turned down for medical history. In exchange there is a typical two-year wait for natural death, and you usually pay more per dollar of coverage.",
    crumbEnd: "Guaranteed acceptance",
    take1: "These policies <strong>always have a waiting period</strong> (in practice, two years) for a non-accidental death.",
    take2: "For some serious health issues it is the only way to buy a new policy. <strong>Most seniors</strong> with diabetes, high blood pressure, or other common conditions can still qualify for a level plan with health questions — usually cheaper, and without that two-year wait.",
    take3: "Mejor Vida Insurance quotes <strong>Corebridge GIWL</strong> as guaranteed-issue whole life: issue ages 50–80 and amounts from $5,000 to $25,000.",
    callout: "Start with a final-expense plan that uses health questions. Guaranteed acceptance is the backup when that questionnaire cannot issue an immediate benefit.",
    howH: "How it works",
    howP1: "There is no in-office exam, no bloodwork, and no health or lifestyle questionnaire. Within the product’s age and amount, the company does not decline you for pre-existing conditions. That is why it is called guaranteed acceptance (or guaranteed issue).",
    howP2: "On the products Mejor Vida Insurance quotes, this is <strong>whole life</strong>, not term or universal life. You may also hear “graded” or “modified” benefit — the idea is the same. We do not quote guaranteed acceptance on term life.",
    howP3: "Premiums stay level if you keep the policy in force. On Corebridge GIWL, required payments stop at or before age 90, per the contract. The face amount cannot be raised or lowered after issue.",
    waitH: "What happens during the waiting period",
    waitP: "If death is not a covered accident in the first two years, the family does not receive the full face amount. On Corebridge GIWL that limited benefit is <strong>110% of premiums paid</strong>. From year three on, the full face applies for a covered natural death. A covered accident can pay the face from day one (with contract exclusions). For suicide, the contract typically refunds premiums during the stated period.",
    waitNote: "No company we quote offers guaranteed acceptance <em>and</em> a full natural-death benefit from day one. Ads that say “no exam and no waiting period” almost always still have health questions.",
    needH: "Do you actually need guaranteed acceptance?",
    needP: "Many seniors assume it is their only option because they have diabetes, high blood pressure, COPD, a prior heart attack, or other conditions. On simplified final expense those situations <strong>often still qualify</strong> for a level or immediate plan: there are questions, not an exam, and the full benefit can apply from the first covered payment. That path is usually cheaper. Guaranteed acceptance fits when the questionnaire cannot issue a level plan — not as the first try.",
    healthH: "When guaranteed acceptance is often the only way to get a new policy",
    healthP: "At appointed companies, a simplified-issue plan (with questions) often cannot issue if one of these situations applies. That is when we look at guaranteed acceptance. This is not a diagnosis and not a legal list — a quote confirms the product.",
    h1l: "HIV or AIDS",
    h2l: "Alzheimer’s or dementia",
    h3l: "Currently in a hospital, nursing home, hospice, skilled nursing facility, or on home health care",
    h4l: "Oxygen for a lung condition (not sleep apnea)",
    h5l: "Wheelchair, scooter, or bedridden because of an illness (not a short-term injury)",
    h6l: "Active cancer treatment (some skin cancers or very early stages may still go simplified)",
    h7l: "Alcohol or drug abuse, or treatment for either, in the last 24 months",
    h8l: "Mental incapacity",
    h9l: "Terminal illness",
    h10l: "Dialysis, end-stage kidney disease, or an organ transplant",
    healthNote: "COPD with tobacco is another common example: appointed simplified issue often declines, and GIWL may still be a path. If none of these apply, the usual first step is a level plan.",
    vsH: "Guaranteed acceptance vs. simplified issue (“no-exam”)",
    vsP: "“No medical exam” is not the same as “no health questions.” Ads for “no-exam” life insurance almost always still use a questionnaire. If you are approved on a level plan, there is usually no two-year wait for a covered natural death.",
    vsH1: "Simplified issue",
    vs1: "Health questions and database review.",
    vs2: "You may get immediate, graded, or a decline.",
    vs3: "If you qualify for level, the full benefit can apply from day one.",
    vs4: "Usually costs less per dollar of coverage.",
    vsH2: "Guaranteed acceptance",
    vs5: "No health questions and no medical tests.",
    vs6: "Within age and amount, you are not declined for medical history.",
    vs7: "Always a two-year wait for a non-accidental death.",
    vs8: "Higher premium; lower amount cap (here, up to $25,000).",
    costH: "How much it costs",
    costP: "Price depends on exact age, sex, and amount. <strong>Health history does not change this premium</strong> because there are no health questions. The charts are illustrative monthly premiums for Corebridge GIWL, the guaranteed-issue product Mejor Vida Insurance quotes. They include the annual policy fee. Confirm a live quote — this is not an offer.",
    costNote: "Example: at age 50, $10,000 is about <strong>$42 a month for a woman</strong> and <strong>$61 a month for a man</strong>. At 65 those figures rise to about <strong>$72 / $99</strong>. A level final-expense plan, if you qualify, is usually lower at the same age and amount.",
    noWaitH: "Is there guaranteed issue with no waiting period?",
    noWaitP: "Not at the companies we quote. Every guaranteed-acceptance plan we offer has at least a two-year wait for natural death. If you need a day-one benefit, the path is a <a href=\"no-waiting-period-life-burial.html\">level or immediate plan with health questions</a>.",
    coH: "Appointed guaranteed-acceptance product",
    coP: "This card is the GIWL Mejor Vida Insurance quotes. Other appointed companies (for example Mutual of Omaha Living Promise Level) are simplified issue: there are health questions, and if you qualify they do not use this two-year wait. We do not publish companies we do not work with.",
    coProduct: "GIWL (guaranteed-issue whole life)",
    coAges: "Ages",
    coAmt: "Amount",
    coWait: "2-year wait",
    coAgesV: "50–80",
    coAmtV: "$5,000–$25,000",
    coWaitV: "Yes (natural death)",
    coFoot: "One GIWL policy per insured per 12 months; that company’s GIWL total cannot exceed $25,000. Educational — not a binding quote.",
    faqTitle: "Frequently asked questions",
    faq1q: "Can I be denied guaranteed acceptance because of health?",
    faq1a: "Not for medical history, if you are inside the product’s age and amount. You still have to meet contract rules (identity, payment, where the product is filed). Corebridge GIWL is not quoted in every state.",
    faq2q: "Does health change the price?",
    faq2a: "No. On guaranteed acceptance the premium comes from age, sex, and amount. That is why it can cost more than a level plan: the company cannot select by health.",
    faq3q: "Is there guaranteed-acceptance term life?",
    faq3a: "Not on what we quote. These plans are small whole life for final expenses.",
    faq4q: "I have diabetes or high blood pressure. Is this my only option?",
    faq4a: "Almost never. Common conditions often still qualify for simplified final expense, with questions and without that two-year wait if the plan is level. Quote that path first.",
    faq5q: "What does the family receive if I die in year one?",
    faq5a: "If it is not a covered accident, GIWL pays 110% of premiums paid — not the $10,000 or $25,000 face. A covered accident can pay the face. Suicide follows the contract’s premium-refund rules.",
    faq6q: "Until what age can I buy it?",
    faq6a: "Appointed GIWL issues ages 50–80. After 80, Mejor Vida Insurance looks at level final-expense plans (some through 85; Accendo Level through 89), not an automatic yes with no questionnaire.",
    faq7q: "How much coverage can I buy?",
    faq7a: "On GIWL, $5,000–$25,000. A level plan at another appointed company can go higher (for example Living Promise Level up to about $50,000) if you qualify.",
    faq8q: "Does “no exam” mean no questions?",
    faq8a: "No. No exam is usually simplified issue: there is a questionnaire. No health questions is guaranteed acceptance, with a wait.",
    faq9q: "Do premiums go up every year?",
    faq9a: "No, if you keep the policy in force. On GIWL, required payments stop at or before age 90, per the contract.",
    faq10q: "Can I use the benefit while I am alive?",
    faq10a: "Some GIWL contracts include chronic- or terminal-illness acceleration, with rules and state variations. That is not a substitute for long-term-care insurance. We confirm it on the quote.",
    nextH: "Next step",
    nextP: `Mejor Vida Insurance compares a level plan first. If the questionnaire cannot support that path, we quote GIWL. <a href="quote.html">See prices</a> or call <a href="tel:${TEL}">${PHONE}</a>.`,
    discTitle: "Disclosure",
    discBody: "This page is educational, not an offer. Ages, amounts, and premiums change by company, product, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "Get a quote",
    quote1: "Appointed companies",
    quote2: "Level plan first",
  };
}

function giMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const exam = isEs ? "seguro-vida-mayores-sin-examen.html" : "life-insurance-seniors-no-medical-exam.html";
  const burial = isEs ? "guia-seguro-entierro-mayores.html" : "burial-insurance-seniors.html";
  const hub = isEs ? "guia-seguro-vida-mayores.html" : "life-insurance-seniors.html";
  const core = "carriers/corebridge.html";
  const female = isEs ? "Mujer" : "Female";
  const male = isEs ? "Hombre" : "Male";
  const ageCol = isEs ? "Edad" : "Age";
  const healthItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map((n) => `<li>${c["h" + n + "l"]}</li>`)
    .join("");
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
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#how">${isEs ? "Cómo funciona" : "How it works"}</a>
<a href="#need">${isEs ? "¿Lo necesita?" : "Do you need it?"}</a>
<a href="#cost">${isEs ? "Precios" : "Cost"}</a>
<a href="#compare">${isEs ? "Vs. simplificado" : "Vs. simplified"}</a>
<a href="#companies">${isEs ? "Compañía" : "Company"}</a>
<a href="#faq">${isEs ? "Preguntas" : "FAQ"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Puntos clave" : "Key points"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<div class="lic-helpful"><p>${c.callout}</p></div>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<p>${c.howP1}</p>
<p>${c.howP2}</p>
<p>${c.howP3}</p>
</section>
<section class="lic-section" id="waiting">
<h2>${c.waitH}</h2>
<p>${c.waitP}</p>
<div class="lic-tip"><p>${c.waitNote}</p></div>
</section>
<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<p>${c.needP}</p>
</section>
<section class="lic-section" id="health">
<h2>${c.healthH}</h2>
<p>${c.healthP}</p>
<ul>
${healthItems}
</ul>
<p>${c.healthNote}</p>
</section>
<section class="lic-section" id="compare">
<h2>${c.vsH}</h2>
<p>${c.vsP}</p>
<div class="lic-type-block">
<h3>${c.vsH1}</h3>
<ul>
<li>${c.vs1}</li>
<li>${c.vs2}</li>
<li>${c.vs3}</li>
<li>${c.vs4}</li>
</ul>
</div>
<div class="lic-type-block">
<h3>${c.vsH2}</h3>
<ul>
<li>${c.vs5}</li>
<li>${c.vs6}</li>
<li>${c.vs7}</li>
<li>${c.vs8}</li>
</ul>
</div>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<p>${c.costNote}</p>
<div class="lic-product-tabs" data-lic-product="gi" data-lic-quote-href="quote.html">
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="10000" role="tab" aria-selected="true">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="20000" role="tab" aria-selected="false">$20,000</button>
<button type="button" class="lic-face-tab" data-lic-face="25000" role="tab" aria-selected="false">$25,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</div>
</section>
<section class="lic-section" id="no-wait">
<h2>${c.noWaitH}</h2>
<p>${c.noWaitP}</p>
</section>
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<p>${c.coP}</p>
<div class="lic-co-grid lic-co-grid--compare lic-co-grid--click">
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${core}">
<div class="lic-co-logo lic-co-logo--wide"><img src="${assets}img/carriers/corebridge-logo.svg" alt="" width="576" height="188" loading="lazy" decoding="async"/></div>
<h3>Corebridge</h3>
<p class="lic-co-product">${c.coProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAgesV}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAmtV}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitV}</dd></div>
</dl>
</a>
</div>
<p class="lic-co-footnote">${c.coFoot}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .map(
    (n, i) =>
      `<details${i === 0 ? " open" : ""}><summary>${c["faq" + n + "q"]}</summary><p>${c["faq" + n + "a"]}</p></details>`
  )
  .join("\n")}
</section>
<section class="lic-section" id="next">
<h2>${c.nextH}</h2>
<p>${c.nextP}</p>
</section>
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<p class="lic-rate-note"><a href="${hub}">${isEs ? "Guía de vida para mayores" : "Life insurance for seniors"}</a> · <a href="${burial}">${isEs ? "Guía de entierro" : "Burial guide"}</a> · <a href="${exam}">${isEs ? "Sin examen médico" : "No medical exam"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2 })}
</div>
</main>`;
}

module.exports = { copyGi, giMain };
