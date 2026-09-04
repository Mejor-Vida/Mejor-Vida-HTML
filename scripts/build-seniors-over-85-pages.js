#!/usr/bin/env node
/**
 * Bilingual seniors-over-85 education page.
 *   node scripts/build-seniors-over-85-pages.js
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
  fs.readFileSync(path.join(ROOT, "js/seniors-over-85-rates.json"), "utf8")
);

const ES_FILE = "seguro-vida-mayores-85.html";
const EN_FILE = "life-insurance-seniors-over-85.html";
const ES_80 = "seguro-vida-mayores-80.html";
const EN_80 = "life-insurance-seniors-over-80.html";
const PHONE = "402-440-5438";
const TEL = "+14024405438";
const { quoteRailHtml } = require("./lic-quote-rail");
const HERO = {
  base: "lic-hero-futbol-barrio",
  modifier: "futbol",
  width: 1024,
  height: 576,
  cache: "20260819-futbol",
};

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function rate(sex, age, face) {
  const row = (RATES.tables[sex] || []).find((r) => Number(r.age) === age);
  return row ? row[String(face)] : null;
}

function rateRowsHtml(sex) {
  const ages = RATES.ages_published || [];
  return ages
    .map((age) => {
      const row = (RATES.tables[sex] || []).find((r) => Number(r.age) === age) || {};
      return `<tr><th scope="row">${age}</th><td>${money(row["5000"])}</td><td>${money(row["10000"])}</td><td>${money(row["25000"])}</td></tr>`;
    })
    .join("\n");
}

function fullRateTablesHtml(c) {
  const head = `<thead><tr><th scope="col">${c.age}</th><th scope="col">$5,000</th><th scope="col">$10,000</th><th scope="col">$25,000</th></tr></thead>`;
  return `<div class="lic-rate-block">
<h4>${c.female}</h4>
<div class="lic-rate-wrap">
<table class="lic-rate-table lic-rate-table--faces">
${head}
<tbody>
${rateRowsHtml("female")}
</tbody>
</table>
</div>
</div>
<div class="lic-rate-block">
<h4>${c.male}</h4>
<div class="lic-rate-wrap">
<table class="lic-rate-table lic-rate-table--faces">
${head}
<tbody>
${rateRowsHtml("male")}
</tbody>
</table>
</div>
</div>`;
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
<script defer src="js/mvi-nav-questions.js?v=20260828-family"></script>
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
<script defer src="../js/mvi-nav-questions.js?v=20260828-family"></script>
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
  const quote = "quote.html";
  const call = `tel:${TEL}`;
  return RATES.carriers
    .map((c) => {
      const product = isEs ? c.productEs : c.productEn;
      const waitVal = c.wait ? (isEs ? "Sí" : "Yes") : isEs ? "No" : "No";
      const death = isEs ? c.deathEs || c.death : c.deathEn || c.death;
      const ages = isEs ? c.agesEs || c.ages : c.agesEn || c.ages;
      const cta = c.issuesAfter85
        ? `<a class="lic-co-cta" href="${call}">${isEs ? "Llamar" : "Call"}</a>`
        : `<a class="lic-co-cta" href="${quote}">${isEs ? "Ver precios" : "See prices"}</a>`;
      return `<article class="lic-co-card lic-co-card--compare">
<div class="lic-co-logo">${logoHtml(c.id, prefix)}</div>
<h3><a href="${prefix}carriers/${c.href}.html">${c.name}</a></h3>
<p class="lic-co-product">${product}</p>
<dl class="lic-co-specs">
<div><dt>${isEs ? "Costo de póliza de $10,000" : "$10,000 policy cost"}</dt><dd>${money(c.sample10k85f)}/mes*</dd></div>
<div><dt>${isEs ? "Edades de nuevos solicitantes" : "Issue ages"}</dt><dd>${ages}</dd></div>
<div><dt>${isEs ? "Opciones de beneficio" : "Death benefit options"}</dt><dd>${death}</dd></div>
<div><dt>${isEs ? "Espera de 2 años (plan nivelado)" : "2-year wait (level plan)"}</dt><dd>${waitVal}</dd></div>
</dl>
${cta}
<a class="lic-co-more" href="${prefix}carriers/${c.href}.html">${isEs ? "Leer resumen" : "Read overview"}</a>
</article>`;
    })
    .join("\n");
}

function copy(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Seguro de vida para mayores de 85 años (2026) | Mejor Vida Seguros",
      desc: "Seguro de entierro y gastos finales después de los 85. Qué compañías designadas de Mejor Vida Seguros todavía emiten, espera, estados con licencia y cuándo llamar.",
      h1: "Seguro de vida y de entierro para mayores de 85 años",
      lead: "Después de los 85, la lista de compañías se acorta. En las compañías designadas de Mejor Vida Seguros, <strong>Aetna Accendo Nivelado puede emitir solicitudes nuevas hasta los 89</strong>, con un máximo de $25,000 a esa edad. Esta página explica qué suele estar disponible y cuándo conviene hablar con la agencia.",
      crumbHome: "Inicio",
      crumbMid: "Seguro de vida",
      bylineBy: "Escrito por",
      bylineRole: "agente de seguros licenciada",
      bylineUpdated: "Actualizado ago. 2026",
      disclosures: "Divulgaciones",
      takeTitle: "Puntos clave",
      take1: "El camino más realista a los 86–89 es un <strong>seguro de gastos finales (entierro)</strong>: vida entera pequeña, sin examen médico en el plan nivelado de Aetna Accendo, con preguntas de salud.",
      take2: "Mutual of Omaha Living Promise y Transamerica Immediate Solution aceptan solicitudes nuevas <strong>hasta los 85</strong>. Después de esa edad, Accendo Nivelado es la vía designada que documentamos hasta los 89.",
      take3: "Si usted o un padre tiene 86 o más, <strong>llame a Mejor Vida Seguros al " + PHONE + "</strong>. La tabla de esta página muestra primas de muestra de Accendo Preferred Nivelado; una cifra personal depende de la salud y el estado.",
      typeTitle: "Qué tipo de seguro hay después de los 85",
      typeLead: "La recomendación es un <strong>seguro de gastos finales (entierro)</strong>: una póliza pequeña de vida entera, por lo general $5,000 a $25,000, para funeral, cremación y cuentas pendientes. En Accendo Nivelado no hay examen médico; sí hay preguntas de salud.",
      feTitle: "Seguro de gastos finales (entierro)",
      feBody: "Si la compañía aprueba el plan nivelado, el beneficio completo puede pagarse desde el primer día por muerte cubierta. Accendo revisa el cuestionario, las recetas y las reclamaciones. Ese es el producto que Mejor Vida Seguros cotiza a esta edad — no una póliza grande.",
      burialTitle: "Qué es el seguro de entierro, en palabras simples",
      burialBody: "Es el mismo producto de gastos finales: vida entera con un monto pequeño — en Accendo, entre $2,000 y $25,000 después de los 75. La prima suele quedar fija si mantiene la póliza al día. El beneficiario usa el dinero para el funeral o para lo que la familia necesite; no está atado a una funeraria concreta.",
      burialTipTitle: "Téngalo presente",
      burialTipBody: "“Sin espera” no significa “sin preguntas”. Los anuncios de aprobación para todos casi siempre son aceptación garantizada con espera de dos años — y las compañías designadas que documentamos para emisión garantizada suelen topar cerca de los 80, no a los 86.",
      coTitle: "Compañías designadas a esta edad",
      coLead: "Estas son compañías con las que Mejor Vida Seguros trabaja. El precio de muestra es para una mujer de 85 años, no fumadora, plan nivelado de $10,000, según cotizaciones designadas del 20 de ago. 2026.",
      coFoot: "*Prima mensual de muestra para una mujer de 85 años, no fumadora, plan Nivel / Inmediato a $10,000. Accendo Nivelado: edades 40–89; máximo $25,000 a los 76–89. Mutual of Omaha y Transamerica: solicitudes nuevas hasta los 85. No es una oferta vinculante.",
      costTitle: "Cuánto cuesta el seguro de entierro después de los 85",
      costLead: "La tabla muestra primas mensuales de <strong>Aetna Accendo Preferred Nivelado</strong>, no fumador, salud estándar, Nebraska, redondeadas al dólar (cotizaciones designadas, 20 ago. 2026). Accendo Nivelado <strong>puede emitir hasta los 89</strong>, con un máximo de $25,000 a los 76–89. El precio sube con cada año de edad al emitir.",
      costCall: "Estas cifras son educativas. Para una prima a su edad y salud, llame a Mejor Vida Seguros: " + PHONE + ".",
      costFactors: "El precio cambia con la edad, el sexo, el tabaco, la salud y el monto. El máximo de Accendo a los 76–89 es $25,000, así que las columnas son $5,000, $10,000 y $25,000 — lo que ese producto realmente vende a esta edad.",
      female: "Mujer",
      male: "Hombre",
      age: "Edad",
      sampleTitle: "Primas mensuales por edad (Accendo Preferred Nivelado)",
      sex: "Sexo",
      waitTitle: "¿Hay período de espera después de los 85?",
      waitLead: "En Accendo Nivelado, si responde las preguntas de salud y la compañía aprueba, el beneficio completo suele aplicar desde la emisión por muerte accidental o natural. Accendo Modificado (espera los primeros años por muerte natural) solo se emite hasta los 75, así que no es el plan de 86–89. “Sin espera” no es lo mismo que aceptación garantizada.",
      statesTitle: "¿En qué estados está disponible?",
      statesLead: "La disponibilidad depende del estado y de la compañía. Accendo Nivelado y los demás planes de gastos finales de esta página no se venden igual en todos los estados: algunos usan otro emisor o no se ofrecen. Diga en qué estado vive la persona asegurada y Mejor Vida Seguros confirma si podemos cotizar y emitir allí. Nueva York es un ejemplo frecuente: varios productos de gastos finales no se venden o usan un emisor distinto, así que no afirmamos disponibilidad hasta verificarlo.",
      giTitle: "Aceptación garantizada después de los 85",
      giBody: "Los planes de aceptación garantizada que documentamos con compañías designadas — por ejemplo Corebridge GIWL — suelen emitirse hasta cerca de los <strong>80 años</strong>, no hasta los 86–89. Después de los 85, la vía realista que tenemos por escrito es Accendo Nivelado con preguntas de salud, no un “sí automático” sin cuestionario. Si la salud es muy frágil y las preguntas no se pueden responder, llame: no vamos a inventar un producto que no está en nuestros materiales.",
      applyTitle: "Cómo solicitar",
      apply1: "<strong>Hable con un agente licenciado.</strong> Mejor Vida Seguros compara las compañías designadas. Empiece por teléfono: <a href=\"tel:" + TEL + "\">" + PHONE + "</a> o WhatsApp.",
      apply2: "<strong>Mejor Vida Seguros llena la solicitud.</strong> Un agente completa la solicitud electrónica de Accendo con usted en la llamada — usted no tiene que llenarla por su cuenta. Accendo revisa recetas y reclamaciones. Muchas decisiones salen en minutos; la suscripción sigue abierta hasta que la póliza se emite y se paga la primera prima.",
      apply3: "<strong>Revise y firme lo que le enviemos.</strong> Confirme el monto (hasta $25,000 a esta edad en Accendo), si el plan es nivelado, la prima mensual y cualquier exclusión, y firme electrónicamente cuando Mejor Vida Seguros se lo pida. Nada en esta página es un contrato.",
      otherTitle: "Otras formas de pagar un funeral (sin seguro)",
      otherLead: "El seguro no es la única herramienta. Algunas familias combinan más de una:",
      other1: "<strong>Ahorros propios</strong> — una cuenta clara que la familia pueda usar sin esperar una reclamación.",
      other2: "<strong>Prepago en la funeraria</strong> — fija servicios con un proveedor concreto. Compare con un seguro, que el beneficiario puede usar donde elija. Vea <a href=\"blog/final-expense-vs-prepagado-funerario-2026-07-19.html\">gastos finales vs. funeral prepagado</a>.",
      other3: "<strong>Patrimonio y familia</strong> — herencias o ayuda de hijos. El <a href=\"final-expense-estimator.html\">estimador de gastos finales</a> y la <a href=\"blog/cuanto-cuesta-seguro-gastos-finales.html\">guía de costos funerarios</a> ayudan a dimensionar el hueco. También: <a href=\"blog/medicare-paga-gastos-finales.html\">qué paga Medicare</a> y <a href=\"como-planificar-su-funeral.html\">cómo planificar</a>.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Hay período de espera a los 86 o más?",
      faq1a: "En Accendo Nivelado, si califica, el beneficio completo suele pagarse desde el primer día por una muerte cubierta. No hay un plan modificado de Accendo a esa edad. Desconfíe de ofertas “aprobado para todos”: casi siempre traen espera de dos años por muerte natural.",
      faq2q: "¿Cuál es la mejor póliza después de los 85?",
      faq2a: "La que pueda emitir a su edad, en su estado, al monto que la familia necesita y al plan más claro que califique — a menudo nivelado si las preguntas de salud lo permiten. A esta edad el techo de Accendo es $25,000. Mejor Vida Seguros compara lo que realmente está disponible; no hay un único “mejor” para todos.",
      faq3q: "¿Necesitaré un examen médico?",
      faq3a: "En los planes de gastos finales designados que cubrimos aquí, por lo general no. Accendo usa preguntas de salud y bases de datos (recetas y reclamaciones).",
      faq4q: "¿Puedo comprar una póliza para mis padres?",
      faq4a: "Un hijo adulto puede pagar la prima y, en muchos casos, figurar como dueño. Quien se asegura (el padre o la madre) debe solicitar, consentir y responder las preguntas de salud. Mejor Vida Seguros explica la titularidad antes de firmar.",
      faq5q: "¿Cuánto cuesta a los 86–89?",
      faq5a: "La tabla de esta página usa Accendo Preferred Nivelado, no fumador. A los 85, $10,000 ronda " + money(rate("female", 85, 10000)) + "/mes para una mujer y " + money(rate("male", 85, 10000)) + "/mes para un hombre. A los 89, las mismas columnas rondan " + money(rate("female", 89, 10000)) + " y " + money(rate("male", 89, 10000)) + " (20 ago. 2026, redondeado). Llame al " + PHONE + " para una cifra personal.",
      faq6q: "¿Qué es el período de impugnación?",
      faq6a: "En la mayoría de las pólizas de vida, la compañía puede revisar la solicitud durante unos dos años si hay una reclamación y sospecha de datos incompletos. Después de ese plazo, las reglas de impugnación se estrechan (salvo fraude, según el contrato y el estado). Responda las preguntas de salud con honestidad.",
      quoteHead: "Mayores de 85",
      quote1: "Compañías designadas",
      quote2: "Accendo hasta 89",
      quoteCta: "Ver precios",
      quoteNote: "Para una cifra a su edad, llame al " + PHONE + ".",
      updated: "Actualizado ago. 2026",
      tocType: "Tipo de seguro",
      tocCost: "Costo",
      tocWait: "Espera",
      tocCo: "Compañías",
      tocStates: "Estados",
      tocGi: "Aceptación garantizada",
      tocApply: "Cómo solicitar",
      discTitle: "Divulgaciones",
      discBody: "Esta página es educativa, no asesoría legal, fiscal ni una oferta de seguro. Primas, montos y aprobación dependen de la compañía, el estado y la solicitud. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Percibimos comisión si se emite una póliza; eso no sube su prima. Cotizaciones de muestra: compañías designadas, redondeadas al dólar. <a href=\"licencias.html\">Ver licencias</a>.",
    };
  }
  return {
    title: "Life Insurance for Seniors Over 85 (2026) | Mejor Vida Insurance",
    desc: "Burial and final expense insurance after age 85. Which Mejor Vida appointed companies still issue, waiting periods, licensed states, and when to call.",
    h1: "Life and burial insurance for seniors over 85",
    lead: "After 85, the company list gets shorter. With Mejor Vida Insurance appointed companies, <strong>Aetna Accendo Level can take new applications through age 89</strong>, with a $25,000 maximum at that age. This page explains what is usually available and when it is better to talk with the agency.",
    crumbHome: "Home",
    crumbMid: "Life insurance",
    bylineBy: "Written by",
    bylineRole: "licensed insurance agent",
    bylineUpdated: "Updated Aug. 2026",
    disclosures: "Disclosures",
    takeTitle: "Key takeaways",
    take1: "The realistic path at 86–89 is <strong>final expense (burial) insurance</strong>: small whole life, no medical exam on Aetna Accendo Level, with health questions.",
    take2: "Mutual of Omaha Living Promise and Transamerica Immediate Solution take new applications <strong>through age 85</strong>. After that, Accendo Level is the appointed path we document through 89.",
    take3: "If you or a parent is 86 or older, <strong>call Mejor Vida Insurance at " + PHONE + "</strong>. The table on this page shows Accendo Preferred Level sample premiums; a personal figure depends on health and state.",
    typeTitle: "What type of insurance is available after 85?",
    typeLead: "The recommendation is <strong>final expense (burial) insurance</strong>: a small whole life policy, usually $5,000 to $25,000, for a funeral, cremation, and leftover bills. Accendo Level has no medical exam; there is a health questionnaire.",
    feTitle: "Final expense (burial) insurance",
    feBody: "If the company approves the level plan, the full benefit can pay from day one for a covered death. Accendo reviews the questionnaire, prescriptions, and claims. That is the product Mejor Vida Insurance quotes at this age — not a large policy.",
    burialTitle: "What burial insurance means, in plain language",
    burialBody: "It is the same final expense product: whole life with a small amount — on Accendo, $2,000 to $25,000 after age 75. The premium usually stays level if you keep the policy in force. The beneficiary can use the money for the funeral or for whatever the family needs; it is not tied to one funeral home.",
    burialTipTitle: "Keep this in mind",
    burialTipBody: "“No waiting period” does not mean “no questions.” Ads that promise approval for everyone are almost always guaranteed acceptance with a two-year wait — and the appointed guaranteed-issue products we document typically stop around age 80, not 86.",
    coTitle: "Appointed companies at this age",
    coLead: "These are companies Mejor Vida Insurance works with. The sample price is for an 85-year-old woman, non-tobacco, $10,000 level plan, from appointed quotes on Aug. 20, 2026.",
    coFoot: "*Sample monthly premium for an 85-year-old woman, non-tobacco, Level / Immediate plan at $10,000. Accendo Level: issue ages 40–89; $25,000 maximum at ages 76–89. Mutual of Omaha and Transamerica: new applications through 85. Not a binding offer.",
    costTitle: "How much does burial insurance cost after 85?",
    costLead: "The table shows monthly premiums for <strong>Aetna Accendo Preferred Level</strong>, non-tobacco, Standard health, Nebraska, rounded to the nearest dollar (appointed quotes, Aug. 20, 2026). Accendo Level <strong>can issue through age 89</strong>, with a $25,000 maximum at ages 76–89. The price rises with each year of age at issue.",
    costCall: "These figures are educational. For a premium at your age and health, call Mejor Vida Insurance: " + PHONE + ".",
    costFactors: "Price changes with age, sex, tobacco, health, and amount. Accendo’s maximum at ages 76–89 is $25,000, so the columns are $5,000, $10,000, and $25,000 — what that product actually sells at this age.",
    female: "Female",
    male: "Male",
    age: "Age",
    sampleTitle: "Monthly premiums by age (Accendo Preferred Level)",
    sex: "Sex",
    waitTitle: "Is there a waiting period after 85?",
    waitLead: "On Accendo Level, if you answer the health questions and the company approves, the full benefit usually applies from issue for accidental or natural death. Accendo Modified (a wait in the early years for a natural death) only issues through age 75, so it is not the 86–89 plan. “No wait” is not the same as guaranteed acceptance.",
    statesTitle: "Which states is this available in?",
    statesLead: "Availability depends on the state and the company. Accendo Level and the other final expense plans on this page are not sold the same way everywhere: some use a different issuer or are not offered. Tell us where the insured person lives and Mejor Vida Insurance will confirm whether we can quote and issue there. New York is a common example: several final expense products are not sold there or use a different issuer, so we do not claim availability until we check.",
    giTitle: "Guaranteed issue after 85",
    giBody: "The guaranteed-acceptance plans we document with appointed companies — for example Corebridge GIWL — typically issue through about age <strong>80</strong>, not through 86–89. After 85, the realistic path we have in writing is Accendo Level with health questions, not an automatic yes with no questionnaire. If health is very fragile and the questions cannot be answered, call: we will not invent a product that is not in our materials.",
    applyTitle: "How to apply",
    apply1: "<strong>Talk with a licensed agent.</strong> Mejor Vida Insurance compares appointed companies. Start by phone: <a href=\"tel:" + TEL + "\">" + PHONE + "</a> or WhatsApp.",
    apply2: "<strong>Mejor Vida Insurance fills out the application.</strong> An agent completes Accendo’s electronic application with you on the call — you do not fill it out on your own. Accendo reviews prescriptions and claims. Many decisions come back in minutes; underwriting stays open until the policy is issued and the first premium is paid.",
    apply3: "<strong>Review and sign what we send you.</strong> Confirm the amount (up to $25,000 at this age on Accendo), whether the plan is level, the monthly premium, and any exclusions, then e-sign when Mejor Vida Insurance asks you to. Nothing on this page is a contract.",
    otherTitle: "Other ways to pay for a funeral (not insurance)",
    otherLead: "Insurance is not the only tool. Some families combine more than one:",
    other1: "<strong>Your own savings</strong> — a clear account the family can use without waiting on a claim.",
    other2: "<strong>Funeral-home prepay</strong> — locks services with one provider. Compare that with insurance, which the beneficiary can use where they choose. See <a href=\"blog/final-expense-vs-prepaid-funeral-2026-07-19.html\">final expense vs. prepaid funeral</a>.",
    other3: "<strong>Estate and family</strong> — inheritances or help from adult children. The <a href=\"final-expense-estimator.html\">final expense estimator</a> and the <a href=\"../blog/cuanto-cuesta-seguro-gastos-finales.html\">funeral cost guide</a> help size the gap. Also: <a href=\"../blog/medicare-paga-gastos-finales.html\">what Medicare pays</a> and <a href=\"how-to-plan-your-funeral.html\">how to plan</a>.",
    faqTitle: "Frequently asked questions",
    faq1q: "Is there a waiting period at 86 or older?",
    faq1a: "On Accendo Level, if you qualify, the full benefit usually pays from day one for a covered death. There is no Accendo Modified plan at that age. Be careful with “approved for everyone” offers: they almost always add a two-year wait for a natural death.",
    faq2q: "What is the best policy after 85?",
    faq2a: "The one that can issue at your age, in your state, at the amount the family needs, and on the clearest plan you qualify for — often level if the health questions allow it. At this age Accendo’s ceiling is $25,000. Mejor Vida Insurance compares what is actually available; there is no single “best” for everyone.",
    faq3q: "Will I need a medical exam?",
    faq3a: "On the appointed final expense plans we cover here, usually not. Accendo uses health questions and databases (prescriptions and claims).",
    faq4q: "Can I buy a policy for my parents?",
    faq4a: "An adult child can pay the premium and, in many cases, be the owner. The insured person (the parent) must apply, consent, and answer the health questions. Mejor Vida Insurance explains ownership before anyone signs.",
    faq5q: "How much does it cost at 86–89?",
    faq5a: "The table on this page uses Accendo Preferred Level, non-tobacco. At 85, $10,000 is about " + money(rate("female", 85, 10000)) + "/month for a woman and " + money(rate("male", 85, 10000)) + "/month for a man. At 89, the same columns are about " + money(rate("female", 89, 10000)) + " and " + money(rate("male", 89, 10000)) + " (Aug. 20, 2026, rounded). Call " + PHONE + " for a personal figure.",
    faq6q: "What is the contestability period?",
    faq6a: "On most life policies, the company may review the application for about two years if there is a claim and a concern about incomplete answers. After that window, contestability rules narrow (except fraud, per the contract and state). Answer the health questions honestly.",
    quoteHead: "Over 85",
    quote1: "Appointed companies",
    quote2: "Accendo through 89",
    quoteCta: "See prices",
    quoteNote: "For a figure at your age, call " + PHONE + ".",
    updated: "Updated Aug. 2026",
    tocType: "Type of insurance",
    tocCost: "Cost",
    tocWait: "Waiting period",
    tocCo: "Companies",
    tocStates: "States",
    tocGi: "Guaranteed issue",
    tocApply: "How to apply",
    discTitle: "Disclosures",
    discBody: "This page is educational, not legal or tax advice, and not an offer of insurance. Premiums, amounts, and approval depend on the company, the state, and the application. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). We earn a commission if a policy is issued; that does not raise your premium. Sample quotes: appointed companies, rounded to the nearest dollar. <a href=\"licenses.html\">View licenses</a>.",
  };
}

function headHtml(lang) {
  const c = copy(lang);
  const isEs = lang === "es";
  const prefix = isEs ? "" : "../";
  const esUrl = `https://www.mejorvidainsurance.com/${ES_FILE}`;
  const enUrl = `https://www.mejorvidainsurance.com/en/${EN_FILE}`;
  const canonical = isEs ? esUrl : enUrl;
  const ogImg = "https://www.mejorvidainsurance.com/img/opt/lic-hero-futbol-barrio.jpg";
  return `<!DOCTYPE html>
<html class="lang-${isEs ? "es" : "en"}" lang="${isEs ? "es-US" : "en-US"}">
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
<meta content="Julie Braunsroth, Licensed Insurance Agent - Mejor Vida Insurance LLC" name="author"/>
<link href="${canonical}" rel="canonical"/>
<link href="${esUrl}" hreflang="es-US" rel="alternate"/>
<link href="${enUrl}" hreflang="en-US" rel="alternate"/>
<link href="${esUrl}" hreflang="x-default" rel="alternate"/>
<meta content="website" property="og:type"/>
<meta content="${c.title}" property="og:title"/>
<meta content="${c.desc}" property="og:description"/>
<meta content="${canonical}" property="og:url"/>
<meta content="${ogImg}" property="og:image"/>
<meta content="${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}" property="og:site_name"/>
<meta content="${isEs ? "es_US" : "en_US"}" property="og:locale"/>
<meta content="${isEs ? "en_US" : "es_US"}" property="og:locale:alternate"/>
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
<link href="${prefix}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<link href="${prefix}css/life-insurance-cost.css?v=20260822-seniors-rail" rel="stylesheet"/>
<link href="${prefix}css/mvi-assistant-widget.css?v=20260721-chat-z" rel="stylesheet"/>
<link href="${prefix}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<style>body { font-family: Inter, system-ui, -apple-system, sans-serif; }</style>
</head>
<body class="lic-page lic-page--seniors">`;
}

function mainHtml(lang) {
  const c = copy(lang);
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const quote = "quote.html";
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const over80 = isEs ? ES_80 : EN_80;
  const about = "about-julie.html";
  const discHref = isEs ? "divulgaciones-editoriales.html" : "../divulgaciones-editoriales.html";
  const note = isEs ? RATES.note_es || RATES.note : RATES.note;
  return `<main>
<section class="lic-hero">
<div class="lic-hero-media lic-hero-media--${HERO.modifier}" aria-hidden="true">
<picture>
<source srcset="${assets}img/opt/${HERO.base}.webp?v=${HERO.cache}" type="image/webp"/>
<img src="${assets}img/opt/${HERO.base}.jpg?v=${HERO.cache}" alt="" width="${HERO.width}" height="${HERO.height}" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb"><a href="${home}">${c.crumbHome}</a> › <a href="${mid}">${c.crumbMid}</a> › <a href="${over80}">${isEs ? "Mayores de 80" : "Over 80"}</a> › ${isEs ? "Mayores de 85" : "Over 85"}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
<div class="lic-byline">
<picture>
<source type="image/webp" srcset="${assets}img/opt/julie-headshot.webp"/>
<img src="${assets}img/opt/julie-headshot.png" alt="" width="72" height="72" decoding="async"/>
</picture>
<span>${c.bylineBy} <a href="${about}">Julie Braunsroth</a>, ${c.bylineRole}</span>
<span>${c.bylineUpdated}</span>
<span><a href="${discHref}">${c.disclosures}</a></span>
</div>
</div>
</div>
</section>

<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">

<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#options">${c.tocType}</a>
<a href="#cost">${c.tocCost}</a>
<a href="#waiting">${c.tocWait}</a>
<a href="#companies">${c.tocCo}</a>
<a href="#states">${c.tocStates}</a>
<a href="#guaranteed">${c.tocGi}</a>
<a href="#apply">${c.tocApply}</a>
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
<h2>${c.typeTitle}</h2>
<p>${c.typeLead}</p>
<ul>
<li><strong>${c.feTitle}.</strong> ${c.feBody}</li>
</ul>
</section>

<section class="lic-section" id="burial">
<h2>${c.burialTitle}</h2>
<p>${c.burialBody}</p>
<div class="lic-tip">
<h3>${c.burialTipTitle}</h3>
<p>${c.burialTipBody}</p>
</div>
</section>

<section class="lic-section lic-guide" id="companies">
<h2>${c.coTitle}</h2>
<p>${c.coLead}</p>
<div class="lic-co-grid lic-co-grid--compare">
${carrierCards(lang, assets)}
</div>
<p class="lic-co-footnote">${c.coFoot}</p>
</section>

<section class="lic-section" id="cost">
<h2>${c.costTitle}</h2>
<p>${c.costLead}</p>
<p>${c.costFactors}</p>
<div class="lic-call-panel">
<p>${c.costCall}</p>
<p><a href="tel:${TEL}">${PHONE}</a> · <a href="${quote}">${c.quoteCta}</a></p>
</div>
<h3>${c.sampleTitle}</h3>
${fullRateTablesHtml(c)}
<p class="lic-rate-note">${note}</p>
</section>

<section class="lic-section" id="waiting">
<h2>${c.waitTitle}</h2>
<p>${c.waitLead}</p>
</section>

<section class="lic-section" id="states">
<h2>${c.statesTitle}</h2>
<p>${c.statesLead}</p>
</section>

<section class="lic-section" id="guaranteed">
<h2>${c.giTitle}</h2>
<p>${c.giBody}</p>
</section>

<section class="lic-section" id="apply">
<h2>${c.applyTitle}</h2>
<ol class="lic-apply-list">
<li>${c.apply1}</li>
<li>${c.apply2}</li>
<li>${c.apply3}</li>
</ol>
</section>

<section class="lic-section" id="other">
<h2>${c.otherTitle}</h2>
<p>${c.otherLead}</p>
<ul>
<li>${c.other1}</li>
<li>${c.other2}</li>
<li>${c.other3}</li>
</ul>
</section>

<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
<details open><summary>${c.faq1q}</summary><p>${c.faq1a}</p></details>
<details><summary>${c.faq2q}</summary><p>${c.faq2a}</p></details>
<details><summary>${c.faq3q}</summary><p>${c.faq3a}</p></details>
<details><summary>${c.faq4q}</summary><p>${c.faq4a}</p></details>
<details><summary>${c.faq5q}</summary><p>${c.faq5a}</p></details>
<details><summary>${c.faq6q}</summary><p>${c.faq6a}</p></details>
</section>

<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>

<p class="lic-rate-note"><a href="${over80}">${isEs ? "Seguro para mayores de 80" : "Life insurance over 80"}</a> · <a href="${isEs ? "costo-seguro-gastos-finales.html" : "final-expense-cost.html"}">${isEs ? "Costo de gastos finales" : "Final expense cost"}</a> · <a href="${isEs ? "seguro-vida-entierro-sin-espera.html" : "no-waiting-period-life-burial.html"}">${isEs ? "Sin período de espera" : "No waiting period"}</a></p>
</div>

${quoteRailHtml({ lang, title: c.quoteHead, line1: c.quote1, line2: c.quote2, quoteHref: "quote.html", cta: c.quoteCta })}
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
{"@type":"WebPage","name":"${esc(c.h1)}","url":"${url}","inLanguage":"${isEs ? "es" : "en"}","author":{"@type":"Person","name":"Julie Braunsroth","url":"${home}about-julie.html"},"isPartOf":{"@type":"WebSite","name":"${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}","url":"${home}"}},
{"@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"${esc(c.crumbHome)}","item":"${home}"},
{"@type":"ListItem","position":2,"name":"${esc(c.crumbMid)}","item":"${isEs ? home + "seguro-gastos-finales.html" : home + "en/final-expense-insurance.html"}"},
{"@type":"ListItem","position":3,"name":"${isEs ? "Mayores de 80" : "Over 80"}","item":"${isEs ? home + ES_80 : home + "en/" + EN_80}"},
{"@type":"ListItem","position":4,"name":"${isEs ? "Mayores de 85" : "Over 85"}","item":"${url}"}
]},
{"@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"${esc(c.faq1q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq1a)}"}},
{"@type":"Question","name":"${esc(c.faq2q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq2a)}"}},
{"@type":"Question","name":"${esc(c.faq3q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq3a)}"}},
{"@type":"Question","name":"${esc(c.faq4q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq4a)}"}},
{"@type":"Question","name":"${esc(c.faq5q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq5a)}"}},
{"@type":"Question","name":"${esc(c.faq6q)}","acceptedAnswer":{"@type":"Answer","text":"${esc(c.faq6a)}"}}
]}
]}
</script>`;
}

function build(lang) {
  const assets = lang === "es" ? "" : "../";
  const html = `${headHtml(lang)}
${headerFor(lang)}
${mainHtml(lang)}
${jsonLd(lang)}
${footerFor(lang)}
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
