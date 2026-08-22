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
      desc: "Cómo funciona el seguro de vida para personas mayores sin examen médico: tipos de póliza, precios de compañías designadas, y cuándo hay espera.",
      h1: "Seguro de vida para mayores sin examen médico",
      lead: "Las aseguradoras no siempre piden un examen en el consultorio. Para la mayoría de las personas mayores, “sin examen” significa un cuestionario de salud y, si califica, una póliza de gastos finales que puede pagar el beneficio completo desde el primer pago.",
      crumbEnd: "Sin examen médico",
      take1: "La mayoría de los planes de gastos finales que cotiza Mejor Vida Seguros <strong>no usan un examen médico en el consultorio</strong>. Usan preguntas de salud.",
      take2: "Si califica a un plan <strong>nivelado o inmediato</strong>, el beneficio completo puede aplicar desde el día uno (sujeto a exclusiones del contrato).",
      take3: "La <strong>aceptación garantizada</strong> también es sin examen, y casi siempre trae una espera de dos años por muerte natural.",
      callout: "Un plan sin examen encaja bien cuando necesita cobertura de entierro o de gastos finales con rapidez y un monto que las compañías designadas sí emiten sin laboratorio — no cuando busca un millón de dólares de temporal.",
      s1h: "Qué significa “sin examen médico”",
      s1p1: "No significa que la aseguradora ignore su salud. Significa que <strong>no tiene que ir a un consultorio a que le tomen sangre o orina</strong>. Responde preguntas, lista medicamentos y la compañía puede revisar bases de datos médicas y de recetas.",
      s1p2: "Eso se llama <strong>emisión simplificada</strong>. Es el camino habitual para un seguro de gastos finales o de entierro. Mejor Vida Seguros compara estas opciones entre las compañías designadas. La aprobación no es automática: según las respuestas, puede recibir un plan inmediato, un plan gradual o solo aceptación garantizada.",
      s1p3: "Algunos temporales también se cotizan sin examen en el consultorio si la compañía acelera la suscripción. Los montos y las edades máximas suelen ser más estrictos que en gastos finales. Si necesita un temporal, use la <a href=\"term-quote.html\">cotización de vida temporal</a>.",
      typesH: "Tipos de seguro de vida para mayores sin examen médico",
      typesP: "Estas son las rutas que Mejor Vida Seguros cotiza de verdad. No publicamos productos que no trabajamos.",
      t1h: "1) Seguro de gastos finales",
      t1p: "Es una vida entera pensada para funeral, cremación, deudas pequeñas y gastos de último momento. Los montos suelen ir de unos miles de dólares hasta cerca de $50,000, según la compañía. Las primas no suben con la edad si mantiene la póliza al día. Con un plan nivelado hay preguntas de salud; si califica, a menudo no hay espera de dos años por muerte natural cubierta.",
      t2h: "2) Aceptación garantizada",
      t2p: "Pocas o ninguna pregunta de salud. La aprobación es casi segura dentro de la edad y el monto del producto. A cambio hay una <strong>espera de dos años</strong> por muerte natural: en esa ventana la familia suele recibir las primas pagadas más un interés del contrato, no el monto completo. Suele costar más por cada dólar de cobertura. Es un plan B, no el primer camino si aún puede calificar a un plan nivelado.",
      t3h: "3) Seguro de vida temporal",
      t3p: "Cubre un plazo fijo (10, 20 o 30 años, o hasta una edad). Algunos productos designados aceleran la suscripción y no piden laboratorio si califica. El temporal no es el producto típico de entierro después de los 70: el plazo se acaba y el monto suele ser más alto de lo que hace falta para un funeral. Confirme edad, tabaco y plazo en la cotización de temporal.",
      t4h: "4) Vida entera permanente",
      t4p: "El seguro de gastos finales <em>es</em> un tipo de vida entera: dura toda la vida, puede acumular valor en efectivo y la prima se mantiene si paga a tiempo. Otras vidas enteras de mayor monto a veces piden más suscripción. Para la mayoría de las personas mayores que buscan cubrir un funeral, el producto que cotizamos es gastos finales simplificado, no una vida entera de cientos de miles de dólares.",
      tipH: "Téngalo presente",
      tipP: "Los sitios que prometen “aprobación para todos, sin preguntas” suelen ser aceptación garantizada. Puede ser útil. No es el primer camino si aún puede calificar a un plan sin esa espera.",
      waitH: "¿Se puede tener sin examen y sin período de espera?",
      waitP: "Sí, si responde las preguntas con honestidad y la compañía lo coloca en un plan <strong>nivelado o inmediato</strong>. Pida la tabla de beneficio neto por año de póliza: si el año 1 muestra el monto completo por muerte natural, no hay esa espera de dos años. Vea también <a href=\"seguro-vida-entierro-sin-espera.html\">cobertura sin período de espera</a>.",
      costH: "Cuánto cuesta un seguro sin examen para personas mayores",
      costP: "El precio depende del tipo de póliza, la edad, el sexo, el tabaco, la salud, el estado y el monto. En las compañías designadas, una póliza nivelada de <strong>$10,000</strong> a los 65 años suele estar cerca de <strong>$41 al mes para una mujer</strong> y <strong>$54 al mes para un hombre</strong> (no fumador, buena salud). Son cifras educativas del motor de cotización de Mejor Vida Seguros (agosto 2026), no una oferta.",
      costFeH: "Gastos finales (plan nivelado / inmediato)",
      costGiH: "Aceptación garantizada (espera típica de dos años)",
      costGiP: "Estas primas son de compañías designadas. El monto de $5,000 es una banda publicada; $10,000 y $25,000 se escalan desde esa banda. La espera de dos años por muerte natural sigue aplicando.",
      prosH: "Ventajas y desventajas",
      prosTitle: "Ventajas",
      consTitle: "Desventajas",
      pro1: "<strong>Rapidez.</strong> No hay cita de laboratorio. Muchas solicitudes de gastos finales se resuelven en minutos o en pocos días hábiles.",
      pro2: "<strong>Condiciones comunes.</strong> Presión alta, diabetes controlada o colesterol no cierran automáticamente un plan nivelado.",
      pro3: "<strong>Beneficio desde el día uno</strong> si califica a un plan inmediato (sujeto al contrato).",
      pro4: "<strong>Comodidad.</strong> Se puede cotizar por teléfono o en línea con Mejor Vida Seguros.",
      con1: "<strong>No es aprobación automática.</strong> El cuestionario y las bases de datos pueden llevar a un plan gradual o solo a aceptación garantizada.",
      con2: "<strong>Montos más bajos.</strong> Los gastos finales sin examen suelen topar cerca de $25,000 a $50,000, no en cientos de miles.",
      con3: "<strong>La aceptación garantizada cuesta más</strong> por cada dólar y trae espera de dos años.",
      con4: "<strong>Hay que ser honesto</strong> en las preguntas de salud. Una omisión puede afectar un reclamo en los primeros años.",
      fitH: "¿Es el seguro sin examen adecuado para usted?",
      fitP: "Suele encajar si quiere cubrir un funeral o deudas pequeñas, prefiere no hacerse análisis de sangre y puede responder un cuestionario. Si necesita un monto muy alto, un temporal con más suscripción puede ser más barato por dólar — y a veces sí pide examen. Si la salud no califica a un plan nivelado, la aceptación garantizada sigue siendo una opción, con espera.",
      fitL1: "<strong>Necesita cobertura pronto</strong> para gastos finales, no un plazo de 30 años.",
      fitL2: "<strong>Condiciones de salud</strong> que harían más difícil un examen completo, pero aún puede pasar un cuestionario.",
      fitL3: "<strong>Quiere prima fija</strong> de vida entera, no un temporal que se acaba.",
      limitsH: "Límites de cobertura sin examen (compañías designadas)",
      limitsP: "Estos rangos son de productos que Mejor Vida Seguros cotiza. No son todo el mercado. El máximo real depende de la edad, el estado y la salud.",
      limH1: "Tipo de póliza",
      limH2: "Montos típicos sin examen",
      limH3: "Edad típica de nuevos solicitantes",
      lim1a: "Gastos finales (emisión simplificada)",
      lim1b: "A menudo $2,000–$50,000; a edades altas el tope puede ser $25,000",
      lim1c: "Con frecuencia 45 o 50 hasta 85; Aetna Accendo hasta 89",
      lim2a: "Aceptación garantizada",
      lim2b: "Suele topar cerca de $25,000",
      lim2c: "Cada producto fija su propio rango; espera de dos años",
      lim3a: "Vida temporal simplificada o acelerada",
      lim3b: "Montos más altos posibles; no es el producto típico de entierro",
      lim3c: "Depende del plazo y del tabaco; muchos plazos cortan antes de los 80",
      coH: "Compañías designadas (planes nivelados, sin espera de dos años)",
      coP: "Estas fichas son productos de gastos finales que Mejor Vida Seguros cotiza. El precio exacto sale en la cotización. “Sin espera de 2 años” aplica al plan nivelado o inmediato, no a la aceptación garantizada.",
      coMooProduct: "Living Promise Nivelado",
      coMooAges: "45–85",
      coMooAmt: "$2,000–$50,000",
      coAetnaProduct: "Accendo Preferred (Nivelado)",
      coAetnaAges: "40–89",
      coAetnaAmt: "$2,000–$50,000; $25,000 tope a los 76–89",
      coTaProduct: "Immediate Solution Preferred",
      coTaAges: "Hasta los 85",
      coTaAmt: "Desde $1,000; hasta $50,000+",
      coWait: "Espera de 2 años (plan nivelado)",
      coWaitNo: "No",
      coAges: "Edades de nuevos solicitantes",
      coAmt: "Opciones de beneficio",
      coCta: "Ver precios",
      coMore: "Leer resumen",
      coFoot: "Fichas educativas de compañías designadas. Un plan gradual o de aceptación garantizada puede agregar espera de dos años. No es una cotización vinculante.",
      s3h: "¿Quién suele calificar?",
      s3p: "No hace falta “estar perfectamente sano”. Muchas personas con presión alta, diabetes controlada o colesterol aún califican a un plan nivelado con una compañía. El trabajo es encontrar la aseguradora que acepte su combinación de edad, medicamentos e historial.",
      s3l1: "Edad de emisión y monto que pide",
      s3l2: "Tabaco o nicotina",
      s3l3: "Medicamentos e historial reciente (cáncer, corazón, hospitalización)",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿El seguro de vida para mayores siempre requiere un examen médico?",
      faq1a: "No. La mayoría de los planes de gastos finales que cotiza Mejor Vida Seguros usan preguntas de salud, no un examen en el consultorio.",
      faq2q: "Si no hay examen, ¿me aprueban de todos modos?",
      faq2a: "No necesariamente. En emisión simplificada la compañía puede ofrecer plan inmediato, gradual o solo aceptación garantizada, según sus respuestas.",
      faq3q: "¿Hasta qué edad se puede comprar sin examen?",
      faq3a: "Depende de la compañía y del producto. Muchos planes de gastos finales aceptan solicitudes nuevas hasta los 85. Algunas compañías designadas emiten más tarde. Vea <a href=\"limite-edad-seguro-vida.html\">el límite de edad para comprar un seguro</a>.",
      faq4q: "¿El temporal también puede ser sin examen?",
      faq4a: "Algunos temporales de emisión simplificada o acelerada no usan examen en el consultorio si califica. Los máximos de edad y de monto suelen ser más estrictos que en gastos finales.",
      faq5q: "¿Sale más caro un plan sin examen que uno con examen?",
      faq5a: "A veces sí, sobre todo si se compara con un temporal de gran monto y suscripción completa. En gastos finales para personas mayores, el camino habitual ya es sin laboratorio; el salto de precio más grande suele ser pasar de un plan nivelado a aceptación garantizada.",
      faq6q: "¿Puedo tener sin examen y sin espera de dos años?",
      faq6a: "Sí, si califica a un plan nivelado o inmediato. La aceptación garantizada casi siempre incluye esa espera por muerte natural.",
      nextH: "Siguiente paso",
      nextP: `Para ver si califica a un plan sin examen y sin espera innecesaria, <a href="quote.html">obtenga una cotización gratuita</a> o llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a>.`,
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no asesoramiento legal ni una oferta de seguro. Primas, montos y aprobación dependen de la compañía, el estado y la solicitud. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actuales están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotización sin examen",
      quote1: "Compare compañías designadas, no un anuncio genérico.",
      quote2: "Vea si un plan sin espera de dos años encaja con su salud.",
      quote3: `Hable con un agente licenciado al ${PHONE}.`,
      quoteCta: "Ver precios",
    };
  }
  return {
    title: "Life Insurance for Seniors With No Medical Exam (2026) | Mejor Vida Insurance",
    desc: "How life insurance for seniors with no medical exam works: policy types, appointed-company sample prices, and when a waiting period still applies.",
    h1: "Life insurance for seniors with no medical exam",
    lead: "Insurers do not always require an in-office exam. For most seniors, “no exam” means a health questionnaire — and if you qualify, a final expense policy that can pay the full benefit from the first premium.",
    crumbEnd: "No medical exam",
    take1: "Most final expense plans Mejor Vida Insurance quotes <strong>do not use an in-office medical exam</strong>. They use health questions.",
    take2: "If you qualify for a <strong>level or immediate</strong> plan, the full benefit can apply from day one (subject to contract exclusions).",
    take3: "<strong>Guaranteed acceptance</strong> is also no-exam, and almost always adds a two-year wait for natural death.",
    callout: "A no-exam plan fits well when you need burial or final-expense coverage quickly at amounts appointed companies will issue without lab work — not when you need a very large term policy.",
    s1h: "What “no medical exam” means",
    s1p1: "It does not mean the insurer ignores your health. It means you <strong>do not have to go to a clinic for blood or urine</strong>. You answer questions, list medications, and the company may check medical and prescription databases.",
    s1p2: "That is called <strong>simplified issue</strong>. It is the usual path for final expense or burial coverage. Mejor Vida Insurance compares these options among appointed companies. Approval is not automatic: based on your answers, you may be offered immediate coverage, a graded plan, or only guaranteed acceptance.",
    s1p3: "Some term products are also quoted without an in-office exam if the company accelerates underwriting. Age and face-amount limits are usually tighter than on final expense. If you need term, use the <a href=\"term-quote.html\">term life quote</a>.",
    typesH: "Types of no-exam life insurance for seniors",
    typesP: "These are the paths Mejor Vida Insurance actually quotes. We do not publish products we do not appoint.",
    t1h: "1) Final expense insurance",
    t1p: "This is whole life meant for a funeral, cremation, small debts, and last expenses. Face amounts usually run from a few thousand dollars up to about $50,000, depending on the company. Premiums do not rise with age if you keep the policy in force. A level plan asks health questions; if you qualify, there is often no two-year wait for a covered natural death.",
    t2h: "2) Guaranteed acceptance",
    t2p: "Few or no health questions. Approval is nearly certain within the product’s age and amount limits. In return there is a <strong>two-year wait</strong> for natural death: in that window the family typically receives premiums paid plus contract interest, not the full face amount. It usually costs more per dollar of coverage. It is a Plan B, not the first path if you can still qualify for a level plan.",
    t3h: "3) Term life insurance",
    t3p: "Coverage lasts a set term (10, 20, or 30 years, or to a stated age). Some appointed products accelerate underwriting and skip the lab if you qualify. Term is not the typical burial product after 70: the term ends, and the face amount is often larger than a funeral requires. Confirm age, tobacco, and term length on the term quote.",
    t4h: "4) Permanent whole life",
    t4p: "Final expense <em>is</em> a type of whole life: it lasts a lifetime, can build cash value, and the premium stays level if you pay on time. Larger whole life amounts sometimes need more underwriting. For most seniors covering a funeral, the product we quote is simplified final expense, not a six-figure whole life policy.",
    tipH: "Keep this in mind",
    tipP: "Sites that promise “approval for everyone, no questions” are usually guaranteed acceptance. That can be useful. It is not the first path if you can still qualify for a plan without that extra wait.",
    waitH: "Can you get no exam and no waiting period?",
    waitP: "Yes, if you answer the questions honestly and the company places you on a <strong>level or immediate</strong> plan. Ask for the net death benefit by policy year: if year 1 shows the full face amount for natural death, there is no two-year wait. See also <a href=\"no-waiting-period-life-burial.html\">no-waiting-period coverage</a>.",
    costH: "How much no-exam life insurance for seniors costs",
    costP: "Price depends on policy type, age, sex, tobacco, health, state, and amount. On appointed companies, a level <strong>$10,000</strong> policy at age 65 is often near <strong>$41 a month for a woman</strong> and <strong>$54 a month for a man</strong> (non-tobacco, good health). Those are educational figures from the Mejor Vida Insurance quote engine (August 2026), not an offer.",
    costFeH: "Final expense (level / immediate)",
    costGiH: "Guaranteed acceptance (typical two-year wait)",
    costGiP: "These premiums are from appointed companies. The $5,000 band is published; $10,000 and $25,000 are scaled from that band. The two-year wait for natural death still applies.",
    prosH: "Pros and cons",
    prosTitle: "Pros",
    consTitle: "Cons",
    pro1: "<strong>Speed.</strong> No lab appointment. Many final expense applications finish in minutes or a few business days.",
    pro2: "<strong>Common conditions.</strong> High blood pressure, controlled diabetes, or cholesterol do not automatically close a level plan.",
    pro3: "<strong>Day-one benefit</strong> if you qualify for an immediate plan (subject to the contract).",
    pro4: "<strong>Convenience.</strong> You can quote by phone or online with Mejor Vida Insurance.",
    con1: "<strong>Not automatic approval.</strong> The questionnaire and databases can lead to a graded plan or only guaranteed acceptance.",
    con2: "<strong>Lower face amounts.</strong> No-exam final expense usually tops out near $25,000 to $50,000, not hundreds of thousands.",
    con3: "<strong>Guaranteed acceptance costs more</strong> per dollar and adds a two-year wait.",
    con4: "<strong>You must answer health questions honestly.</strong> An omission can affect a claim in the early years.",
    fitH: "Is no-exam life insurance right for you?",
    fitP: "It often fits if you want to cover a funeral or small debts, prefer not to do bloodwork, and can answer a questionnaire. If you need a very large amount, fully underwritten term can cost less per dollar — and sometimes does require an exam. If health will not pass a level plan, guaranteed acceptance remains an option, with a wait.",
    fitL1: "<strong>You need coverage soon</strong> for final expenses, not a 30-year term.",
    fitL2: "<strong>Health conditions</strong> that would make a full exam harder, but you can still pass a questionnaire.",
    fitL3: "<strong>You want a level whole-life premium</strong>, not term that expires.",
    limitsH: "No-exam coverage limits (appointed companies)",
    limitsP: "These ranges are from products Mejor Vida Insurance quotes. They are not the whole market. The real maximum depends on age, state, and health.",
    limH1: "Policy type",
    limH2: "Typical amounts without an exam",
    limH3: "Typical new-applicant ages",
    lim1a: "Final expense (simplified issue)",
    lim1b: "Often $2,000–$50,000; at later ages the cap may be $25,000",
    lim1c: "Often 45 or 50 through 85; Aetna Accendo through 89",
    lim2a: "Guaranteed acceptance",
    lim2b: "Usually tops out near $25,000",
    lim2c: "Each product sets its own range; two-year wait",
    lim3a: "Simplified or accelerated term",
    lim3b: "Higher amounts possible; not the typical burial product",
    lim3c: "Depends on term length and tobacco; many terms cut off before 80",
    coH: "Appointed companies (level plans, no two-year wait)",
    coP: "These cards are final expense products Mejor Vida Insurance quotes. Exact price comes from a quote. “No 2-year wait” applies to the level or immediate plan, not guaranteed acceptance.",
    coMooProduct: "Living Promise Level",
    coMooAges: "45–85",
    coMooAmt: "$2,000–$50,000",
    coAetnaProduct: "Accendo Preferred (Level)",
    coAetnaAges: "40–89",
    coAetnaAmt: "$2,000–$50,000; $25,000 cap at ages 76–89",
    coTaProduct: "Immediate Solution Preferred",
    coTaAges: "Through 85",
    coTaAmt: "From $1,000; up to $50,000+",
    coWait: "2-year wait (level plan)",
    coWaitNo: "No",
    coAges: "New applicant ages",
    coAmt: "Death benefit options",
    coCta: "See prices",
    coMore: "Read overview",
    coFoot: "Educational cards for appointed companies. A graded or guaranteed-acceptance plan may add a two-year wait. Not a binding quote.",
    s3h: "Who usually qualifies?",
    s3p: "You do not need perfect health. Many people with high blood pressure, controlled diabetes, or cholesterol still qualify for a level plan with one company. The work is finding a carrier that will accept your mix of age, medications, and history.",
    s3l1: "Issue age and the amount you ask for",
    s3l2: "Tobacco or nicotine",
    s3l3: "Medications and recent history (cancer, heart, hospital stays)",
    faqTitle: "Frequently asked questions",
    faq1q: "Does life insurance for seniors always require a medical exam?",
    faq1a: "No. Most final expense plans Mejor Vida Insurance quotes use health questions, not an in-office exam.",
    faq2q: "If there is no exam, am I automatically approved?",
    faq2a: "Not necessarily. With simplified issue the company may offer immediate coverage, a graded plan, or only guaranteed acceptance, based on your answers.",
    faq3q: "Until what age can I buy coverage with no exam?",
    faq3a: "It depends on the company and the product. Many final expense plans take new applications through age 85. Some appointed companies issue later. See <a href=\"life-insurance-age-limit.html\">the age limit for buying insurance</a>.",
    faq4q: "Can term life also skip the exam?",
    faq4a: "Some simplified or accelerated term products skip the in-office exam if you qualify. Age and face-amount limits are usually tighter than on final expense.",
    faq5q: "Is no-exam coverage more expensive than a policy with an exam?",
    faq5a: "Sometimes, especially compared with a large fully underwritten term policy. For senior final expense, the usual path already skips the lab; the bigger price jump is usually moving from a level plan to guaranteed acceptance.",
    faq6q: "Can I get no exam and no two-year wait?",
    faq6a: "Yes, if you qualify for a level or immediate plan. Guaranteed acceptance almost always includes that wait for natural death.",
    nextH: "Next step",
    nextP: `To see if you qualify for a no-exam plan without an extra wait, <a href="quote.html">get a free quote</a> or call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a>.`,
    discTitle: "Disclosure",
    discBody: "This page is educational, not legal advice, and not an offer of insurance. Premiums, amounts, and approval depend on the company, the state, and the application. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "No-exam quote",
    quote1: "Compare appointed companies, not a generic ad.",
    quote2: "See if a plan without a two-year wait fits your health.",
    quote3: `Talk with a licensed agent at ${PHONE}.`,
    quoteCta: "See prices",
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
<link href="${prefix}css/life-insurance-cost.css?v=20260821-noexam" rel="stylesheet"/>
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
  const moo = isEs ? "carriers/mutual-of-omaha.html" : "carriers/mutual-of-omaha.html";
  const aetna = isEs ? "carriers/aetna.html" : "carriers/aetna.html";
  const ta = isEs ? "carriers/transamerica.html" : "carriers/transamerica.html";
  const female = isEs ? "Mujer" : "Female";
  const male = isEs ? "Hombre" : "Male";
  const ageCol = isEs ? "Edad" : "Age";
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
<a href="#meaning">${isEs ? "Qué significa" : "What it means"}</a>
<a href="#types">${isEs ? "Tipos" : "Types"}</a>
<a href="#cost">${isEs ? "Precios" : "Cost"}</a>
<a href="#companies">${isEs ? "Compañías" : "Companies"}</a>
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
<section class="lic-section" id="meaning">
<h2>${c.s1h}</h2>
<p>${c.s1p1}</p>
<p>${c.s1p2}</p>
<p>${c.s1p3}</p>
</section>
<section class="lic-section" id="types">
<h2>${c.typesH}</h2>
<p>${c.typesP}</p>
<div class="lic-type-block"><h3>${c.t1h}</h3><p>${c.t1p}</p></div>
<div class="lic-type-block"><h3>${c.t2h}</h3><p>${c.t2p}</p></div>
<div class="lic-type-block"><h3>${c.t3h}</h3><p>${c.t3p}</p></div>
<div class="lic-type-block"><h3>${c.t4h}</h3><p>${c.t4p}</p></div>
<div class="lic-tip">
<h3>${c.tipH}</h3>
<p>${c.tipP}</p>
</div>
</section>
<section class="lic-section" id="waiting">
<h2>${c.waitH}</h2>
<p>${c.waitP}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<h3>${c.costFeH}</h3>
<div class="lic-product-tabs" data-lic-product="fe" data-lic-quote-href="quote.html">
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="5000" role="tab" aria-selected="true">$5,000</button>
<button type="button" class="lic-face-tab" data-lic-face="10000" role="tab" aria-selected="false">$10,000</button>
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
<h3>${c.costGiH}</h3>
<p>${c.costGiP}</p>
<div class="lic-product-tabs" data-lic-product="gi" data-lic-quote-href="quote.html">
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="5000" role="tab" aria-selected="true">$5,000</button>
<button type="button" class="lic-face-tab" data-lic-face="10000" role="tab" aria-selected="false">$10,000</button>
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
<section class="lic-section" id="pros">
<h2>${c.prosH}</h2>
<div class="lic-split-lists">
<div>
<h3>${c.prosTitle}</h3>
<ul>
<li>${c.pro1}</li>
<li>${c.pro2}</li>
<li>${c.pro3}</li>
<li>${c.pro4}</li>
</ul>
</div>
<div>
<h3>${c.consTitle}</h3>
<ul>
<li>${c.con1}</li>
<li>${c.con2}</li>
<li>${c.con3}</li>
<li>${c.con4}</li>
</ul>
</div>
</div>
</section>
<section class="lic-section" id="fit">
<h2>${c.fitH}</h2>
<p>${c.fitP}</p>
<ul>
<li>${c.fitL1}</li>
<li>${c.fitL2}</li>
<li>${c.fitL3}</li>
</ul>
</section>
<section class="lic-section" id="limits">
<h2>${c.limitsH}</h2>
<p>${c.limitsP}</p>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${c.limH1}</th><th scope="col">${c.limH2}</th><th scope="col">${c.limH3}</th></tr></thead>
<tbody>
<tr><td>${c.lim1a}</td><td>${c.lim1b}</td><td>${c.lim1c}</td></tr>
<tr><td>${c.lim2a}</td><td>${c.lim2b}</td><td>${c.lim2c}</td></tr>
<tr><td>${c.lim3a}</td><td>${c.lim3b}</td><td>${c.lim3c}</td></tr>
</tbody>
</table>
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
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<p>${c.coP}</p>
<div class="lic-co-grid lic-co-grid--compare">
<article class="lic-co-card lic-co-card--compare">
<div class="lic-co-logo"><picture>
<source type="image/webp" srcset="${assets}img/opt/mutual-of-omaha-logo.webp"/>
<img src="${assets}img/opt/mutual-of-omaha-logo.png" alt="" width="400" height="94" loading="lazy" decoding="async"/>
</picture></div>
<h3><a href="${moo}">Mutual of Omaha</a></h3>
<p class="lic-co-product">${c.coMooProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coMooAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coMooAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
<a class="lic-co-cta" href="quote.html">${c.coCta}</a>
<a class="lic-co-more" href="${moo}">${c.coMore}</a>
</article>
<article class="lic-co-card lic-co-card--compare">
<div class="lic-co-logo"><img src="${assets}img/carriers/aetna-logo.svg" alt="" width="512" height="98" loading="lazy" decoding="async"/></div>
<h3><a href="${aetna}">Aetna</a></h3>
<p class="lic-co-product">${c.coAetnaProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAetnaAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAetnaAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
<a class="lic-co-cta" href="quote.html">${c.coCta}</a>
<a class="lic-co-more" href="${aetna}">${c.coMore}</a>
</article>
<article class="lic-co-card lic-co-card--compare">
<div class="lic-co-logo"><picture>
<source type="image/webp" srcset="${assets}img/opt/transamerica-logo.webp"/>
<img src="${assets}img/opt/transamerica-logo.png" alt="" width="362" height="69" loading="lazy" decoding="async"/>
</picture></div>
<h3><a href="${ta}">Transamerica</a></h3>
<p class="lic-co-product">${c.coTaProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coTaAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coTaAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
<a class="lic-co-cta" href="quote.html">${c.coCta}</a>
<a class="lic-co-more" href="${ta}">${c.coMore}</a>
</article>
</div>
<p class="lic-co-footnote">${c.coFoot}</p>
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
<div class="lic-quote-card__head"><strong>${c.quoteTitle}</strong></div>
<div class="lic-quote-card__body">
<ul class="lic-quote-card__checks">
<li>${c.quote1}</li>
<li>${c.quote2}</li>
<li>${c.quote3}</li>
</ul>
<a class="lic-quote-card__cta" href="quote.html">${c.quoteCta}</a>
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
  const strip = (s) => String(s || "").replace(/"/g, '\\"').replace(/<[^>]+>/g, "");
  const faqs = [1, 2, 3, 4, 5, 6]
    .filter((n) => c["faq" + n + "q"])
    .map((n) => {
      return `{"@type":"Question","name":"${strip(c["faq" + n + "q"])}","acceptedAnswer":{"@type":"Answer","text":"${strip(c["faq" + n + "a"])}"}}`;
    })
    .join(",\n");
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"WebPage","name":"${strip(c.h1)}","url":"${url}","inLanguage":"${isEs ? "es" : "en"}","author":{"@type":"Person","name":"Julie Braunsroth","url":"${home}about-julie.html"},"isPartOf":{"@type":"WebSite","name":"${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}","url":"${home}"}},
{"@type":"FAQPage","mainEntity":[
${faqs}
]}
]}
</script>`;
}

function scaleGiRows(rows, fromFace, toFace) {
  return rows.map((row) => ({
    age: row.age,
    female: Math.round((row.female * toFace) / fromFace),
    male: Math.round((row.male * toFace) / fromFace),
  }));
}

function pickFaceTables(tables, faces) {
  const out = {};
  faces.forEach((face) => {
    const key = String(face);
    if (tables[key]) out[key] = tables[key];
  });
  return out;
}

function examRatesPayload() {
  const faces = [5000, 10000, 25000];
  const feFile = JSON.parse(
    fs.readFileSync(path.join(ROOT, "js/final-expense-cost-rates.json"), "utf8")
  );
  const fe = feFile.final_expense || feFile;
  const gi5000 = [
    { age: 45, female: 18, male: 20 },
    { age: 50, female: 22, male: 31 },
    { age: 55, female: 26, male: 34 },
    { age: 60, female: 30, male: 38 },
    { age: 65, female: 37, male: 50 },
    { age: 70, female: 45, male: 59 },
    { age: 75, female: 64, male: 82 },
    { age: 80, female: 104, male: 113 },
    { age: 85, female: 133, male: 165 },
  ];
  return {
    final_expense: {
      source: fe.source,
      rating: fe.rating,
      as_of: fe.as_of,
      note: fe.note,
      faces,
      tables: pickFaceTables(fe.tables, faces),
    },
    guaranteed: {
      source: "Mejor Vida Insurance (appointed companies) — guaranteed-acceptance lowest",
      rating: "Guaranteed acceptance / typical two-year wait",
      as_of: "2026-08-15",
      note: "Illustrative monthly premiums from appointed companies. $5,000 is a published band; $10,000–$25,000 are scaled from that band. Educational only — not a binding quote.",
      faces,
      tables: {
        5000: gi5000,
        10000: scaleGiRows(gi5000, 5000, 10000),
        25000: scaleGiRows(gi5000, 5000, 25000),
      },
    },
  };
}

function examRateScripts(lang) {
  const prefix = lang === "es" ? "" : "../";
  return `<script>window.MVI_LIC_RATES = ${JSON.stringify(examRatesPayload())};</script>
<script defer src="${prefix}js/life-insurance-cost.js?v=20260821-noexam"></script>
`;
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
${kind === "exam" ? examRateScripts(lang) : ""}</body>
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
