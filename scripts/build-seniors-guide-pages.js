#!/usr/bin/env node
/**
 * Bilingual seniors guide pages:
 *   no medical exam + age limit + burial guide + complete seniors life hub
 *   + guaranteed acceptance + cremation insurance + term life explainer
 *   node scripts/build-seniors-guide-pages.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { copyHub, hubMain } = require("./seniors-life-hub-content");
const { copyGi, giMain } = require("./guaranteed-acceptance-content");
const { copyCrem, cremMain } = require("./cremation-insurance-content");
const { copyTerm, termMain } = require("./term-life-insurance-content");
const { copyInstant, instantMain } = require("./instant-life-insurance-content");
const { copyMortgage, mortgageMain } = require("./mortgage-protection-insurance-content");
const { copyChildren, childrenMain } = require("./children-life-insurance-content");
const { copyGrandchildren, grandchildrenMain } = require("./grandchildren-life-insurance-content");
const {
  copyFamilyHub,
  familyHubMain,
  copyParents,
  parentsMain,
  copyGrandparents,
  grandparentsMain,
  copySiblings,
  siblingsMain,
  copyFamilyMembers,
  familyMembersMain,
  copyFindPolicy,
  findPolicyMain,
} = require("./family-life-insurance-content");
const {
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
} = require("./preexisting-conditions-content");
const { quoteRailHtml } = require("./lic-quote-rail");
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
  burial: {
    esFile: "guia-seguro-entierro-mayores.html",
    enFile: "burial-insurance-seniors.html",
    hero: {
      base: "lic-hero-fly-fishing",
      modifier: "fishing",
      width: 1024,
      height: 752,
      cache: "20260821-fish",
    },
  },
  hub: {
    esFile: "guia-seguro-vida-mayores.html",
    enFile: "life-insurance-seniors.html",
    hero: {
      base: "lic-hero-vida-buena",
      modifier: "vida",
      width: 1024,
      height: 751,
      cache: "20260822-vida",
    },
  },
  gi: {
    esFile: "aceptacion-garantizada.html",
    enFile: "guaranteed-acceptance.html",
    hero: {
      base: "lic-hero-cattle-drive",
      modifier: "cattle",
      width: 1024,
      height: 682,
      cache: "20260822-cattle",
    },
  },
  crem: {
    esFile: "seguro-para-cremacion.html",
    enFile: "cremation-insurance.html",
    hero: {
      base: "lic-hero-desert-saguaro",
      modifier: "saguaro",
      width: 1024,
      height: 682,
      cache: "20260824-saguaro",
    },
  },
  term: {
    esFile: "seguro-vida-temporal.html",
    enFile: "term-life-insurance.html",
    hero: {
      base: "lic-hero-dolphin-pier",
      modifier: "pier",
      width: 1024,
      height: 682,
      cache: "20260824-pier",
    },
  },
  instant: {
    esFile: "seguro-vida-emision-inmediata.html",
    enFile: "instant-life-insurance.html",
    hero: {
      base: "lic-hero-horse-field",
      modifier: "horse",
      width: 1024,
      height: 682,
      cache: "20260825-horse",
    },
  },
  mortgage: {
    esFile: "seguro-proteccion-hipotecaria.html",
    enFile: "mortgage-protection-insurance.html",
    hero: {
      base: "lic-hero-pueblo-street",
      modifier: "pueblo",
      width: 1024,
      height: 682,
      cache: "20260827-pueblo",
    },
  },
  children: {
    esFile: "seguro-vida-infantil.html",
    enFile: "children-life-insurance.html",
    hero: {
      base: "lic-hero-children-playground",
      modifier: "children",
      width: 1024,
      height: 682,
      cache: "20260814-playground2",
    },
  },
  grandchildren: {
    esFile: "seguro-vida-nietos.html",
    enFile: "grandchildren-life-insurance.html",
    hero: {
      base: "lic-hero-grandchildren-park",
      modifier: "grandkids",
      width: 1024,
      height: 682,
      cache: "20260827-park",
    },
  },
  familyHub: {
    esFile: "seguro-vida-familia.html",
    enFile: "family-life-insurance.html",
    hero: {
      base: "lic-hero-family-coast",
      modifier: "familyhub",
      width: 1024,
      height: 575,
      cache: "20260828-heroes",
    },
  },
  parents: {
    esFile: "seguro-vida-padres.html",
    enFile: "parents-life-insurance.html",
    hero: {
      base: "lic-hero-family-tuscany",
      modifier: "parents",
      width: 1024,
      height: 523,
      cache: "20260828-heroes",
    },
  },
  grandparents: {
    esFile: "seguro-vida-abuelos.html",
    enFile: "grandparents-life-insurance.html",
    hero: {
      base: "lic-hero-family-fuji",
      modifier: "grandparents",
      width: 1024,
      height: 512,
      cache: "20260828-heroes",
    },
  },
  siblings: {
    esFile: "seguro-vida-hermanos.html",
    enFile: "siblings-life-insurance.html",
    hero: {
      base: "lic-hero-family-paine",
      modifier: "siblings",
      width: 1024,
      height: 547,
      cache: "20260828-heroes",
    },
  },
  familyMembers: {
    esFile: "seguro-vida-familiares.html",
    enFile: "family-members-life-insurance.html",
    hero: {
      base: "lic-hero-family-deadvlei",
      modifier: "members",
      width: 1024,
      height: 471,
      cache: "20260828-heroes",
    },
  },
  findPolicy: {
    esFile: "buscar-poliza-vida.html",
    enFile: "find-life-insurance-policy.html",
    hero: {
      base: "lic-hero-family-black-sand",
      modifier: "findpolicy",
      width: 1024,
      height: 682,
      cache: "20260828-heroes",
    },
  },
  condHub: {
    esFile: "seguro-gastos-finales-condiciones-preexistentes.html",
    enFile: "final-expense-pre-existing-conditions.html",
    hero: {
      base: "lic-hero-karst-river",
      modifier: "karst",
      width: 912,
      height: 376,
      cache: "20260828-heroes",
    },
  },
  condTerm: {
    esFile: "seguro-vida-temporal-condiciones-preexistentes.html",
    enFile: "term-life-pre-existing-conditions.html",
    hero: {
      base: "lic-hero-alpine-lakes",
      modifier: "lakes",
      width: 700,
      height: 224,
      cache: "20260829-termcond",
    },
  },
  diabetes: {
    esFile: "seguro-vida-diabetes.html",
    enFile: "life-insurance-diabetes.html",
    hero: {
      base: "lic-hero-coffee-finca",
      modifier: "coffee",
      width: 1536,
      height: 1024,
      cache: "20260828-heroes",
    },
  },
  heart: {
    esFile: "seguro-vida-corazon.html",
    enFile: "life-insurance-heart-disease.html",
    hero: {
      base: "lic-hero-desert-saguaro",
      modifier: "saguaro",
      width: 1024,
      height: 682,
      cache: "20260828-heroes",
    },
  },
  hbp: {
    esFile: "seguro-vida-presion-alta.html",
    enFile: "life-insurance-high-blood-pressure.html",
    hero: {
      base: "lic-hero-desert-oasis",
      modifier: "oasis",
      width: 682,
      height: 212,
      cache: "20260828-heroes",
    },
  },
  copd: {
    esFile: "seguro-vida-epoc.html",
    enFile: "life-insurance-copd.html",
    hero: {
      base: "lic-hero-sea-cliffs",
      modifier: "cliffs",
      width: 682,
      height: 208,
      cache: "20260828-heroes",
    },
  },
  cancer: {
    esFile: "seguro-vida-cancer.html",
    enFile: "life-insurance-cancer.html",
    hero: {
      base: "lic-hero-rice-terraces",
      modifier: "terraces",
      width: 682,
      height: 204,
      cache: "20260828-heroes",
    },
  },
  kidney: {
    esFile: "seguro-vida-enfermedad-renal.html",
    enFile: "life-insurance-kidney-disease.html",
    hero: {
      base: "lic-hero-tropical-lagoon",
      modifier: "lagoon",
      width: 690,
      height: 210,
      cache: "20260828-heroes",
    },
  },
  disability: {
    esFile: "seguro-vida-discapacidad.html",
    enFile: "life-insurance-disability.html",
    hero: {
      base: "lic-hero-andes-llamas",
      modifier: "andes",
      width: 908,
      height: 248,
      cache: "20260828-heroes",
    },
  },
  hiv: {
    esFile: "seguro-vida-vih.html",
    enFile: "life-insurance-hiv.html",
    hero: {
      base: "lic-hero-icebergs",
      modifier: "ice",
      width: 688,
      height: 214,
      cache: "20260828-heroes",
    },
  },
  stroke: {
    esFile: "seguro-vida-derrame-cerebral.html",
    enFile: "life-insurance-stroke.html",
    hero: {
      base: "lic-hero-savanna-elephants",
      modifier: "savanna",
      width: 688,
      height: 216,
      cache: "20260828-heroes",
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
<script defer src="js/mvi-nav-questions.js?v=20260828-conditions"></script>
<script defer src="js/website-assistant-widget.js?v=20260813-scroll-top"></script>
<script>document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());</script>
`;
  const extraEn = `<script defer src="../bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="../js/mvi-funnel-track.js?v=20260702e"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="../js/mvi-nav-questions.js?v=20260828-conditions"></script>
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
      limH2: "Montos típicos",
      limH3: "Edades de emisión",
      limH4: "Qué conviene saber",
      lim1a: "Gastos finales",
      lim1sub: "Emisión simplificada",
      lim1amt: "$2,000–$50,000",
      lim1amtNote: "Tope de $25,000 a edades altas",
      lim1age: "45–85",
      lim1ageNote: "Accendo Level hasta 89",
      lim1d: "Preguntas de salud; sin examen en el consultorio.",
      lim2a: "Aceptación garantizada",
      lim2sub: "Pocas o ninguna pregunta de salud",
      lim2amt: "Cerca de $25,000",
      lim2amtNote: "Cada producto fija el máximo",
      lim2age: "Varía",
      lim2ageNote: "Cada producto fija su rango",
      lim2d: "Espera típica de dos años por muerte natural.",
      lim3a: "Vida temporal",
      lim3sub: "Simplificada o acelerada",
      lim3amt: "Montos más altos",
      lim3amtNote: "No es el producto típico de entierro",
      lim3age: "Hasta 80",
      lim3ageNote: "Depende del plazo y del tabaco",
      lim3d: "Muchos plazos cortan antes de los 80.",
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
      coAmericoProduct: "Eagle Select Nivelado",
      coAmericoAges: "40–85",
      coAmericoAmt: "$5,000–$50,000",
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
      quote1: "Compañías designadas",
      quote2: "Nivelado o con espera",
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
    limH2: "Typical amounts",
    limH3: "Issue ages",
    limH4: "Good to know",
    lim1a: "Final expense",
    lim1sub: "Simplified issue",
    lim1amt: "$2,000–$50,000",
    lim1amtNote: "$25,000 cap at later ages",
    lim1age: "45–85",
    lim1ageNote: "Accendo Level through 89",
    lim1d: "Health questions; no in-office exam.",
    lim2a: "Guaranteed acceptance",
    lim2sub: "Few or no health questions",
    lim2amt: "Near $25,000",
    lim2amtNote: "Each product sets the maximum",
    lim2age: "Varies",
    lim2ageNote: "Each product sets its range",
    lim2d: "A two-year wait for natural death is typical.",
    lim3a: "Term life",
    lim3sub: "Simplified or accelerated",
    lim3amt: "Higher amounts",
    lim3amtNote: "Not the typical burial product",
    lim3age: "Up to 80",
    lim3ageNote: "Depends on term length and tobacco",
    lim3d: "Many terms cut off before age 80.",
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
    coAmericoProduct: "Eagle Select Level",
    coAmericoAges: "40–85",
    coAmericoAmt: "$5,000–$50,000",
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
    quote1: "Appointed companies",
    quote2: "Level or with a wait",
    quoteCta: "See prices",
  };
}

function copyAge(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "¿Cuál es el límite de edad para comprar un seguro de vida? (2026) | Mejor Vida Seguros",
      desc: "No hay un único límite de edad en EE. UU. Depende del producto y de la compañía: gastos finales hasta 85 o 89, temporal más corto, y aceptación garantizada con espera.",
      h1: "¿Cuál es el límite de edad para comprar un seguro de vida?",
      lead: "No existe una edad máxima universal. Cada producto y cada aseguradora fija hasta qué edad acepta una solicitud nueva. En gastos finales, muchas compañías designadas de Mejor Vida Seguros emiten hasta los 85; Aetna Accendo puede llegar a 89.",
      crumbEnd: "Límite de edad",
      take1: "El límite depende del <strong>tipo de póliza</strong> y de la compañía — no de una sola regla federal.",
      take2: "El <strong>temporal</strong> suele cortar antes. Un plazo de 30 años no está disponible a los 80.",
      take3: "En <strong>gastos finales</strong>, muchas compañías designadas aceptan solicitudes nuevas hasta los <strong>85</strong>. Accendo Level puede emitir hasta los <strong>89</strong>, con un tope de $25,000 a edades avanzadas.",
      callout: "La edad de emisión es “¿aceptan una solicitud nueva hoy?”. Una póliza de vida entera que ya tiene no se cancela solo por cumplir años, si las primas se siguen pagando.",
      s1h: "No hay un solo “tope de edad”",
      s1p: "La ley no dice “nadie puede comprar seguro de vida después de X años”. Lo que importa es la <strong>edad de emisión</strong> de cada producto: hasta qué edad la aseguradora acepta una solicitud nueva. Pasada esa edad, no hay póliza nueva con esa compañía y ese producto — aunque ya tenga una póliza en vigor.",
      overviewH: "Resumen de edades (compañías designadas)",
      overviewP: "Estos rangos son de productos que Mejor Vida Seguros cotiza. No son todo el mercado. El estado, el tabaco y la salud también cuentan.",
      overviewFoot: "La cobertura permanente sigue en vigor si las primas se pagan.",
      rowH1: "Tipo de póliza",
      rowH2: "Edades de emisión",
      rowH3: "Duración",
      rowH4: "Qué conviene saber",
      r1a: "Gastos finales",
      r1sub: "Emisión simplificada",
      r1age: "45–85",
      r1ageNote: "Accendo Level hasta 89",
      r1c: "De por vida",
      r1d: "Preguntas de salud, sin examen en el consultorio. Accendo topea en $25,000 a los 76–89.",
      r2a: "Aceptación garantizada",
      r2sub: "Pocas o ninguna pregunta de salud",
      r2age: "Varía",
      r2ageNote: "Cada producto fija su rango",
      r2c: "De por vida",
      r2d: "Suele haber espera de dos años por muerte natural.",
      r3a: "Vida temporal",
      r3sub: "Cubre un plazo fijo",
      r3age: "Hasta 50–80",
      r3ageNote: "Depende del plazo y del tabaco",
      r3c: "Hasta que termina el plazo",
      r3d: "Un plazo de 30 años no está disponible a los 80.",
      r4a: "Vida entera",
      r4sub: "Montos más altos que un entierro",
      r4age: "Según el producto",
      r4ageNote: "Suele ser más estricta que gastos finales",
      r4c: "De por vida",
      r4d: "Más suscripción; se confirma en una cotización.",
      feH: "Límite de edad del seguro de gastos finales",
      feAge: "Edad para nuevos solicitantes: a menudo hasta 85; Accendo Level hasta 89",
      feLasts: "Duración: toda la vida, si se pagan las primas",
      feP: "El seguro de gastos finales es una vida entera pensada para funeral, cremación y deudas pequeñas. Mejor Vida Seguros cotiza planes simplificados (preguntas de salud, sin examen en el consultorio). Mutual of Omaha Living Promise Nivelado emite de 45 a 85. Accendo Level puede emitir más tarde, con un tope de $25,000 a los 76–89. Vea <a href=\"seguro-gastos-finales.html\">seguro de gastos finales</a> y <a href=\"seguro-vida-mayores-sin-examen.html\">sin examen médico</a>.",
      giH: "Límite de edad de la aceptación garantizada",
      giAge: "Edad para nuevos solicitantes: la fija cada producto",
      giLasts: "Duración: toda la vida si se pagan las primas, con espera típica de dos años por muerte natural",
      giP: "Hay pocas o ninguna pregunta de salud. A cambio, casi siempre hay una espera de dos años por muerte natural. Es un plan B si no califica a un plan nivelado. No es el primer camino si todavía puede responder un cuestionario.",
      termH: "Límite de edad del seguro temporal",
      termAge: "Edad para nuevos solicitantes: depende del plazo; un plazo de 30 años no está disponible a los 80",
      termLasts: "Duración: hasta que termina el plazo, no “para siempre”",
      termP: "El temporal cubre un número fijo de años. Algunos productos designados aceleran la suscripción y no piden laboratorio si califica. No es el producto típico de entierro después de los 70. Confirme plazo, tabaco y edad en la <a href=\"term-quote.html\">cotización de vida temporal</a>.",
      wlH: "Límite de edad de la vida entera",
      wlAge: "Edad para nuevos solicitantes: en gastos finales, suele ser la misma banda de 85 (o 89 en Accendo)",
      wlLasts: "Duración: mientras se paguen las primas",
      wlP: "El seguro de gastos finales <em>es</em> vida entera. Otras vidas enteras de monto alto a veces piden más suscripción y cortan antes. Para cubrir un funeral, el producto que cotizamos es gastos finales simplificado, no una póliza de cientos de miles de dólares.",
      costH: "Cómo cambia el precio con la edad",
      costP: "En las compañías designadas, una póliza nivelada de <strong>$10,000</strong> a los 65 años suele estar cerca de <strong>$41 al mes para una mujer</strong> y <strong>$54 al mes para un hombre</strong> (no fumador, buena salud). A los 80 esas cifras suben. Son primas educativas del cotizador de Mejor Vida Seguros (agosto 2026), no una oferta.",
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
      faq5q: "¿Cuál es el tipo más habitual para personas mayores?",
      faq5a: "Para funeral y deudas pequeñas, el camino más común que cotiza Mejor Vida Seguros es gastos finales de emisión simplificada. El temporal sirve si necesita un monto más alto por un plazo fijo.",
      faq6q: "Si ya no puedo comprar una póliza nueva, ¿cómo se paga un funeral?",
      faq6a: "Las opciones suelen ser ahorros, una póliza que ya esté en vigor, o que la familia cubra el gasto. Mejor Vida Seguros puede revisar si todavía hay un producto a su edad antes de asumir que no hay emisión.",
      nextH: "Siguiente paso",
      nextP: `Para confirmar qué productos aplican a su edad, <a href="quote.html">obtenga una cotización gratuita</a> o llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a>.`,
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no una oferta. Las edades de emisión cambian según compañía, producto, tabaco y estado. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actuales están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotización según su edad",
      quote1: "El producto según la edad",
      quote2: "Compañías designadas",
      quoteCta: "Ver precios",
    };
  }
  return {
    title: "What Is the Age Limit for Buying Life Insurance? (2026) | Mejor Vida Insurance",
    desc: "There is no single U.S. age limit. It depends on the product and company: final expense through 85 or 89, shorter term cutoffs, and guaranteed acceptance with a wait.",
    h1: "What is the age limit for buying life insurance?",
    lead: "There is no universal maximum age. Each product and each insurer sets the last age it will take a new application. For final expense, many Mejor Vida Insurance appointed companies issue through 85; Aetna Accendo can go through 89.",
    crumbEnd: "Age limit",
    take1: "The limit depends on the <strong>policy type</strong> and the company — not one federal rule.",
    take2: "<strong>Term</strong> usually cuts off earlier. A 30-year term is not available at age 80.",
    take3: "For <strong>final expense</strong>, many appointed companies take new applications through age <strong>85</strong>. Accendo Level can issue through age <strong>89</strong>, with a $25,000 cap at later ages.",
    callout: "Issue age means “will they take a new application today?” A whole life policy you already own does not cancel just because you have a birthday, if premiums stay paid.",
    s1h: "There is no single “age cap”",
    s1p: "The law does not say “nobody can buy life insurance after age X.” What matters is each product’s <strong>issue age</strong>: the last age the insurer will accept a new application. After that, there is no new policy with that company and product — even if you already own a policy that stays in force.",
    overviewH: "Age overview (appointed companies)",
    overviewP: "These ranges are from products Mejor Vida Insurance quotes. They are not the whole market. State, tobacco, and health also matter.",
    overviewFoot: "Permanent coverage stays in force if premiums stay paid.",
    rowH1: "Policy type",
    rowH2: "Issue ages",
    rowH3: "How long it lasts",
    rowH4: "Good to know",
    r1a: "Final expense",
    r1sub: "Simplified issue",
    r1age: "45–85",
    r1ageNote: "Accendo Level through 89",
    r1c: "For life",
    r1d: "Health questions, no in-office exam. Accendo caps at $25,000 at ages 76–89.",
    r2a: "Guaranteed acceptance",
    r2sub: "Few or no health questions",
    r2age: "Varies",
    r2ageNote: "Each product sets its range",
    r2c: "For life",
    r2d: "A two-year wait for natural death is typical.",
    r3a: "Term life",
    r3sub: "Covers a set number of years",
    r3age: "Up to 50–80",
    r3ageNote: "Depends on term length and tobacco",
    r3c: "Until the term ends",
    r3d: "A 30-year term is not available at age 80.",
    r4a: "Whole life",
    r4sub: "Larger amounts than burial",
    r4age: "By product",
    r4ageNote: "Usually stricter than final expense",
    r4c: "For life",
    r4d: "More underwriting; confirm with a quote.",
    feH: "Final expense insurance age limit",
    feAge: "New-applicant age: often through 85; Accendo Level through 89",
    feLasts: "How long it lasts: for life, if premiums are paid",
    feP: "Final expense is whole life meant for a funeral, cremation, and small debts. Mejor Vida Insurance quotes simplified plans (health questions, no in-office exam). Mutual of Omaha Living Promise Level issues ages 45–85. Accendo Level can issue later, with a $25,000 cap at ages 76–89. See <a href=\"final-expense-insurance.html\">final expense insurance</a> and <a href=\"life-insurance-seniors-no-medical-exam.html\">no medical exam</a>.",
    giH: "Guaranteed acceptance age limit",
    giAge: "New-applicant age: each product sets its own range",
    giLasts: "How long it lasts: for life if premiums are paid, with a typical two-year wait for natural death",
    giP: "There are few or no health questions. In return there is almost always a two-year wait for natural death. It is a Plan B if you cannot qualify for a level plan. It is not the first path if you can still answer a questionnaire.",
    termH: "Term life insurance age limit",
    termAge: "New-applicant age: depends on the term; a 30-year term is not available at 80",
    termLasts: "How long it lasts: until the term ends, not “forever”",
    termP: "Term covers a set number of years. Some appointed products accelerate underwriting and skip the lab if you qualify. It is not the typical burial product after 70. Confirm term length, tobacco, and age on the <a href=\"term-quote.html\">term life quote</a>.",
    wlH: "Whole life insurance age limit",
    wlAge: "New-applicant age: for final expense, usually the same 85 band (or 89 on Accendo)",
    wlLasts: "How long it lasts: as long as premiums are paid",
    wlP: "Final expense <em>is</em> whole life. Larger whole life amounts sometimes need more underwriting and cut off earlier. To cover a funeral, the product we quote is simplified final expense, not a six-figure whole life policy.",
    costH: "How price changes with age",
    costP: "On appointed companies, a level <strong>$10,000</strong> policy at age 65 is often near <strong>$41 a month for a woman</strong> and <strong>$54 a month for a man</strong> (non-tobacco, good health). Those figures rise by age 80. They are educational premiums from the Mejor Vida Insurance quoter (August 2026), not an offer.",
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
    faq5q: "What type is most common for seniors?",
    faq5a: "For a funeral and small debts, the path Mejor Vida Insurance quotes most often is simplified-issue final expense. Term fits if you need a larger amount for a set number of years.",
    faq6q: "If I cannot buy a new policy, how is a funeral paid?",
    faq6a: "The usual options are savings, a policy already in force, or family covering the cost. Mejor Vida Insurance can check whether a product still issues at your age before you assume there is no new coverage.",
    nextH: "Next step",
    nextP: `To confirm which products apply at your age, <a href="quote.html">get a free quote</a> or call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a>.`,
    discTitle: "Disclosure",
    discBody: "This page is educational, not an offer. Issue ages change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "Quote for your age",
    quote1: "The product for your age",
    quote2: "Appointed companies",
    quoteCta: "See prices",
  };
}

function copyBurial(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Guía de seguro de entierro para personas mayores (2026) | Mejor Vida Seguros",
      desc: "Cómo funciona el seguro de entierro (gastos finales) para personas mayores: qué cubre, edades de emisión, espera y primas de compañías designadas.",
      h1: "Guía de seguro de entierro para personas mayores",
      lead: "El seguro de entierro —también llamado seguro de gastos finales— es una vida entera pensada para funeral, cremación y deudas pequeñas. Mejor Vida Seguros cotiza compañías designadas. En emisión simplificada no hay examen en el consultorio: hay preguntas de salud.",
      crumbEnd: "Guía de entierro",
      take1: "Es <strong>vida entera</strong>: dura mientras se paguen las primas. El beneficiario recibe dinero en efectivo y puede usarlo para el funeral u otros gastos.",
      take2: "Muchas compañías designadas emiten hasta los <strong>85</strong>. Accendo Level puede llegar a los <strong>89</strong>, con un tope de $25,000 a edades avanzadas.",
      take3: "Un plan <strong>nivelado o inmediato</strong> puede pagar el monto completo desde el día uno si califica. La aceptación garantizada suele tener espera de dos años.",
      callout: "“Seguro de entierro”, “seguro de funeral” y “gastos finales” suelen ser el mismo tipo de producto: una vida entera de monto más bajo, con suscripción simplificada.",
      workH: "Cómo funciona",
      workP: "Usted elige un monto, responde preguntas de salud y la aseguradora revisa sus respuestas y bases de datos. Según el resultado, puede ofrecer un plan inmediato (nivelado), un plan gradual o solo aceptación garantizada. No es una aprobación automática.",
      typesH: "Dos caminos habituales",
      t1h: "Emisión simplificada (el camino más común)",
      t1age: "Edades típicas: 45 o 50 hasta 85; Accendo Level hasta 89",
      t1amt: "Montos típicos: $2,000–$50,000 (tope de $25,000 a edades altas)",
      t1p: "Hay un cuestionario. No hay cita de laboratorio. Mutual of Omaha Living Promise Nivelado emite de 45 a 85. Transamerica Immediate Solution llega hasta 85. Vea <a href=\"seguro-vida-mayores-sin-examen.html\">sin examen médico</a>.",
      t2h: "Aceptación garantizada (plan B)",
      t2age: "Edades: las fija cada producto",
      t2amt: "Montos: suelen topar cerca de $25,000",
      t2p: "Pocas o ninguna pregunta de salud. A cambio, casi siempre hay una espera de dos años por muerte natural. Es útil si no califica a un plan nivelado. No es el primer camino si todavía puede responder un cuestionario.",
      coverH: "Qué cubre el seguro de entierro",
      coverP: "La póliza paga un monto fijo al beneficiario. Ese dinero suele usarse para:",
      cover1: "Servicios funerarios y gastos de la funeraria",
      cover2: "Entierro o cremación",
      cover3: "Lápida u otro memorial",
      cover4: "Cuentas médicas, deudas o viajes de la familia",
      coverNote: "El contrato no “paga la funeraria” por su cuenta: el beneficiario recibe el beneficio y decide cómo usarlo. Un monto habitual para un funeral sencillo está cerca de $10,000 a $25,000; Mejor Vida Seguros confirma el monto según su caso.",
      costH: "Cuánto cuesta el seguro de entierro",
      costP: "El precio sube con la edad, el sexo, el tabaco y la salud. En compañías designadas, una póliza nivelada de <strong>$10,000</strong> a los 50 años suele estar cerca de <strong>$28 al mes para una mujer</strong> y <strong>$34 al mes para un hombre</strong> (no fumador, buena salud). A los 65 esas cifras rondan <strong>$41 y $54</strong>. Son primas educativas del cotizador de Mejor Vida Seguros (agosto 2026), no una oferta.",
      waitH: "¿Hay período de espera?",
      waitP: "No siempre. Si califica a un plan nivelado o inmediato, el año 1 puede mostrar el monto completo por muerte natural. La aceptación garantizada y muchos planes graduales sí tienen espera de dos años. Pida la tabla de beneficio neto. Más detalle en <a href=\"seguro-vida-entierro-sin-espera.html\">cobertura sin período de espera</a>.",
      fitH: "¿Es adecuado para usted?",
      fitP: "Suele encajar si quiere dejar dinero para un funeral y no tiene ahorros suficientes ni una vida entera ya en vigor. Puede no hacer falta si ya pagó un funeral por adelantado, si tiene efectivo apartado, o si ya tiene una póliza permanente del mismo tamaño.",
      laterH: "Después de los 80 y de los 85",
      laterP: "A los 80 todavía hay opciones de gastos finales en compañías designadas. Después de los 85 hay menos compañías y montos más bajos; Accendo Level puede emitir hasta 89. Vea <a href=\"seguro-vida-mayores-80.html\">mayores de 80</a> y <a href=\"seguro-vida-mayores-85.html\">mayores de 85</a>.",
      coH: "Compañías designadas (planes nivelados)",
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
      coAmericoProduct: "Eagle Select Nivelado",
      coAmericoAges: "40–85",
      coAmericoAmt: "$5,000–$50,000",
      coWait: "Espera de 2 años (plan nivelado)",
      coWaitNo: "No",
      coAges: "Edades de nuevos solicitantes",
      coAmt: "Opciones de beneficio",
      coFoot: "Fichas educativas de compañías designadas. Un plan gradual o de aceptación garantizada puede agregar espera de dos años. No es una cotización vinculante.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿El seguro de entierro es lo mismo que el de gastos finales?",
      faq1a: "En la práctica, sí: es una vida entera de monto más bajo para funeral y deudas pequeñas. Mejor Vida Seguros lo cotiza como gastos finales.",
      faq2q: "¿Hace falta un examen médico?",
      faq2a: "En los planes simplificados que cotizamos, no. Hay preguntas de salud. Vea <a href=\"seguro-vida-mayores-sin-examen.html\">sin examen médico</a>.",
      faq3q: "¿Hasta qué edad se puede comprar?",
      faq3a: "Depende del producto. Muchas compañías designadas emiten hasta los 85; Accendo Level puede llegar a 89. Vea <a href=\"limite-edad-seguro-vida.html\">límite de edad</a>.",
      faq4q: "¿El dinero solo sirve para el funeral?",
      faq4a: "No. El beneficiario recibe un pago en efectivo. Puede usarlo para el funeral, deudas u otros gastos.",
      faq5q: "¿Cuánto cuesta a los 70 o a los 80?",
      faq5a: "Sube con la edad. Use la tabla de esta página (primas ilustrativas de compañías designadas) y pida una cotización para su edad, tabaco y estado.",
      faq6q: "Si ya tengo ahorros o un funeral prepagado, ¿igual lo necesito?",
      faq6a: "No siempre. Si esos fondos cubren el gasto, puede no hacer falta una póliza nueva. Mejor Vida Seguros puede ayudar a comparar el hueco que queda.",
      applyH: "Cómo solicitar una póliza de gastos finales",
      applyP: "El trámite es corto. No es una solicitud a una funeraria: es una solicitud de vida entera a una compañía designada. Mejor Vida Seguros compara opciones y le explica el resultado antes de firmar.",
      apply1: "Pida una cotización con edad, tabaco, estado y el monto que tiene en mente. Puede empezar en <a href=\"quote.html\">la cotización gratuita</a> o llamar al <a href=\"tel:" + TEL + "\">" + PHONE + "</a>.",
      apply2: "Responda las preguntas de salud con sinceridad. Un olvido o un “no” incorrecto puede retrasar o anular un reclamo.",
      apply3: "La aseguradora revisa sus respuestas y bases de datos. Puede ofrecer un plan nivelado, un plan gradual o solo aceptación garantizada.",
      apply4: "Usted (o el dueño de la póliza) revisa la tabla de beneficio, la prima y cualquier espera. Si encaja, se firma y se paga la primera prima.",
      applyTipH: "Téngalo presente",
      applyTipP: "La mayoría de estas pólizas se venden con un agente licenciado, no “directo por televisión”. Un agente independiente puede comparar compañías designadas y decirle si hay espera o beneficio desde el día uno.",
      parentH: "Comprar seguro de entierro para un padre o una madre",
      parentP: "Los hijos adultos suelen ayudar a comparar precios. Eso está bien. La persona cuya vida se asegura casi siempre tiene que participar: firmar, responder salud y dar consentimiento. Usted puede ser dueño o pagador; el padre o la madre es el asegurado.",
      parent1: "No oculte historial médico. La compañía lo verifica. Un dato incompleto puede afectar el pago.",
      parent2: "Nombre beneficiarios claros y dígales dónde está la póliza. El dinero va al beneficiario, no a la funeraria.",
      parent3: "Si el padre o la madre tiene más de 80 años, empiece por un plan nivelado si todavía puede responder preguntas. Vea <a href=\"seguro-vida-mayores-80.html\">mayores de 80</a>.",
      faq7q: "¿Quién califica para un seguro de entierro?",
      faq7a: "Quien esté en la edad de emisión del producto, viva en un estado donde Mejor Vida Seguros pueda cotizar, y pase la suscripción de ese plan. La salud decide si hay plan nivelado, gradual o solo aceptación garantizada. Los estados con licencia están en <a href=\"licencias.html\">licencias</a>.",
      faq8q: "¿Una persona mayor de 80 puede obtener gastos finales?",
      faq8a: "Sí, en compañías designadas todavía hay opciones a los 80. Después de los 85 hay menos compañías y montos más bajos; Accendo Level puede emitir hasta 89. Vea <a href=\"seguro-vida-mayores-80.html\">mayores de 80</a>.",
      faq9q: "¿El seguro a término sirve para el funeral?",
      faq9a: "Suele ser un mal encaje. El término acaba; el funeral no. Si el plazo termina a los 70 o 75, puede quedarse sin cobertura justo cuando más se necesita un monto para entierro. Los gastos finales son vida entera de monto más bajo.",
      faq10q: "¿Cuánta cobertura conviene comprar?",
      faq10a: "Un funeral sencillo suele estar cerca de $10,000 a $25,000. Sume deudas pequeñas o viajes de la familia si quiere dejar margen. La tabla de esta página muestra primas ilustrativas; Mejor Vida Seguros confirma el monto en la cotización.",
      faq11q: "¿Cómo se presenta un reclamo?",
      faq11a: "El beneficiario contacta a la aseguradora (o a Mejor Vida Seguros) con el certificado de defunción y el número de póliza. El pago va al beneficiario nombrado, no automáticamente a la funeraria. Guarde la póliza y el teléfono del agente donde la familia pueda encontrarlos.",
      faq12q: "¿Los beneficiarios pagan impuestos sobre el dinero?",
      faq12a: "En la mayoría de los casos el beneficio por fallecimiento no es ingreso gravable para el beneficiario. No es asesoría fiscal: un contador o abogado revisa casos con patrimonio grande u otros bienes. El dinero no tiene que pasar por sucesión si el beneficiario está bien nombrado.",
      faq13q: "¿Qué es el valor en efectivo?",
      faq13a: "Es un ahorro pequeño que algunas vidas enteras acumulan con el tiempo. En gastos finales el trabajo principal es el beneficio por fallecimiento, no invertir. Un préstamo o un rescate puede reducir lo que cobra la familia.",
      faq14q: "¿Entierro y funeral son el mismo seguro?",
      faq14a: "En la práctica, sí: “entierro”, “funeral” y “gastos finales” describen la misma clase de vida entera pequeña. El contrato no reserva un servicio en una funeraria concreta; paga efectivo al beneficiario.",
      nextH: "Siguiente paso",
      nextP: `Para ver precios según su edad y salud, <a href="quote.html">obtenga una cotización gratuita</a> o llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a>.`,
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no una oferta. Edades, montos y primas cambian según compañía, producto, tabaco y estado. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actuales están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotización",
      quote1: "Compañías designadas",
      quote2: "Nivelado o con espera",
      quoteCta: "Ver precios",
    };
  }
  return {
    title: "Burial Insurance for Seniors: A Clear Guide (2026) | Mejor Vida Insurance",
    desc: "How burial insurance (final expense) works for seniors: what it covers, issue ages, waiting periods, and appointed-company sample premiums.",
    h1: "Burial insurance for seniors: a clear guide",
    lead: "Burial insurance — also called final expense insurance — is whole life meant for a funeral, cremation, and small debts. Mejor Vida Insurance quotes appointed companies. Simplified-issue plans skip the in-office exam; they use health questions.",
    crumbEnd: "Burial guide",
    take1: "It is <strong>whole life</strong>: it lasts as long as premiums are paid. The beneficiary receives cash and can use it for the funeral or other bills.",
    take2: "Many appointed companies issue through age <strong>85</strong>. Accendo Level can go through age <strong>89</strong>, with a $25,000 cap at later ages.",
    take3: "A <strong>level or immediate</strong> plan can pay the full amount from day one if you qualify. Guaranteed acceptance usually has a two-year wait.",
    callout: "“Burial insurance,” “funeral insurance,” and “final expense” are usually the same kind of product: a smaller whole life policy with simplified underwriting.",
    workH: "How it works",
    workP: "You choose an amount, answer health questions, and the insurer reviews your answers and databases. It may offer an immediate (level) plan, a graded plan, or only guaranteed acceptance. It is not automatic approval.",
    typesH: "Two usual paths",
    t1h: "Simplified issue (the usual path)",
    t1age: "Typical ages: 45 or 50 through 85; Accendo Level through 89",
    t1amt: "Typical amounts: $2,000–$50,000 ($25,000 cap at later ages)",
    t1p: "There is a questionnaire. There is no lab appointment. Mutual of Omaha Living Promise Level issues ages 45–85. Transamerica Immediate Solution goes through 85. See <a href=\"life-insurance-seniors-no-medical-exam.html\">no medical exam</a>.",
    t2h: "Guaranteed acceptance (Plan B)",
    t2age: "Ages: each product sets its range",
    t2amt: "Amounts: often top out near $25,000",
    t2p: "Few or no health questions. In return there is almost always a two-year wait for natural death. It helps if you cannot qualify for a level plan. It is not the first path if you can still answer a questionnaire.",
    coverH: "What burial insurance covers",
    coverP: "The policy pays a set amount to the beneficiary. That money is often used for:",
    cover1: "Funeral services and funeral-home fees",
    cover2: "Burial or cremation",
    cover3: "A headstone or other memorial",
    cover4: "Medical bills, debts, or family travel",
    coverNote: "The contract does not pay the funeral home by itself: the beneficiary receives the benefit and decides how to use it. A common amount for a simple funeral is about $10,000 to $25,000; Mejor Vida Insurance confirms the amount for your case.",
    costH: "How much burial insurance costs",
    costP: "Price rises with age, sex, tobacco, and health. On appointed companies, a level <strong>$10,000</strong> policy at age 50 is often near <strong>$28 a month for a woman</strong> and <strong>$34 a month for a man</strong> (non-tobacco, good health). By age 65 those figures are near <strong>$41 and $54</strong>. They are educational premiums from the Mejor Vida Insurance quoter (August 2026), not an offer.",
    waitH: "Is there a waiting period?",
    waitP: "Not always. If you qualify for a level or immediate plan, year 1 can show the full amount for natural death. Guaranteed acceptance and many graded plans do have a two-year wait. Ask for the net death-benefit table. More detail on <a href=\"no-waiting-period-life-burial.html\">no-waiting-period coverage</a>.",
    fitH: "Is it a fit for you?",
    fitP: "It often fits if you want to leave money for a funeral and do not have enough savings or a permanent policy already in force. It may not be needed if you already prepaid a funeral, set cash aside, or own a permanent policy of about the same size.",
    laterH: "After 80 and after 85",
    laterP: "At 80, appointed final expense options still exist. After 85 there are fewer companies and lower amounts; Accendo Level can issue through 89. See <a href=\"life-insurance-seniors-over-80.html\">seniors over 80</a> and <a href=\"life-insurance-seniors-over-85.html\">seniors over 85</a>.",
    coH: "Appointed companies (level plans)",
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
    coAmericoProduct: "Eagle Select Level",
    coAmericoAges: "40–85",
    coAmericoAmt: "$5,000–$50,000",
    coWait: "2-year wait (level plan)",
    coWaitNo: "No",
    coAges: "New applicant ages",
    coAmt: "Death benefit options",
    coFoot: "Educational cards for appointed companies. A graded or guaranteed-acceptance plan may add a two-year wait. Not a binding quote.",
    faqTitle: "Frequently asked questions",
    faq1q: "Is burial insurance the same as final expense?",
    faq1a: "In practice, yes: it is a smaller whole life policy for a funeral and small debts. Mejor Vida Insurance quotes it as final expense.",
    faq2q: "Do I need a medical exam?",
    faq2a: "On the simplified plans we quote, no. There are health questions. See <a href=\"life-insurance-seniors-no-medical-exam.html\">no medical exam</a>.",
    faq3q: "Until what age can I buy it?",
    faq3a: "It depends on the product. Many appointed companies issue through 85; Accendo Level can go through 89. See the <a href=\"life-insurance-age-limit.html\">age limit</a> guide.",
    faq4q: "Can the money only be used for a funeral?",
    faq4a: "No. The beneficiary receives a cash payment. They can use it for the funeral, debts, or other expenses.",
    faq5q: "What does it cost at 70 or 80?",
    faq5a: "It rises with age. Use the table on this page (illustrative appointed-company premiums) and ask for a quote for your age, tobacco, and state.",
    faq6q: "If I already have savings or a prepaid funeral, do I still need this?",
    faq6a: "Not always. If those funds cover the cost, a new policy may not be needed. Mejor Vida Insurance can help compare the remaining gap.",
    applyH: "How to apply for a senior final expense policy",
    applyP: "The process is short. It is not a funeral-home contract: it is a whole life application with an appointed company. Mejor Vida Insurance compares options and explains the result before you sign.",
    apply1: "Ask for a quote with age, tobacco, state, and the amount you have in mind. Start with a <a href=\"quote.html\">free quote</a> or call <a href=\"tel:" + TEL + "\">" + PHONE + "</a>.",
    apply2: "Answer the health questions honestly. A missed “yes” can delay or void a claim.",
    apply3: "The insurer reviews your answers and databases. It may offer a level plan, a graded plan, or only guaranteed acceptance.",
    apply4: "You (or the policy owner) review the benefit table, the premium, and any wait. If it fits, you sign and pay the first premium.",
    applyTipH: "Keep this in mind",
    applyTipP: "Most of these policies are sold through a licensed agent, not a TV ad. An independent agent can compare appointed companies and tell you whether there is a wait or day-one benefit.",
    parentH: "Buying burial insurance for a parent",
    parentP: "Adult children often help compare prices. That is fine. The person whose life is insured almost always has to take part: sign, answer health questions, and consent. You can be the owner or the payer; the parent is the insured.",
    parent1: "Do not hide medical history. The company checks it. Incomplete answers can affect the payout.",
    parent2: "Name clear beneficiaries and tell them where the policy is. The money goes to the beneficiary, not the funeral home.",
    parent3: "If the parent is over 80, start with a level plan if they can still answer questions. See <a href=\"life-insurance-seniors-over-80.html\">seniors over 80</a>.",
    faq7q: "Who qualifies for burial insurance?",
    faq7a: "Someone in the product’s issue-age range, in a state Mejor Vida Insurance can quote, who passes that plan’s underwriting. Health decides whether you get level, graded, or only guaranteed acceptance. Licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    faq8q: "Can seniors over 80 get final expense insurance?",
    faq8a: "Yes. Appointed companies still have options at 80. After 85 there are fewer companies and lower amounts; Accendo Level can issue through 89. See <a href=\"life-insurance-seniors-over-80.html\">seniors over 80</a>.",
    faq9q: "Is term life a good way to cover funeral costs?",
    faq9a: "It is usually a poor fit. Term ends; a funeral does not. If the term runs out at 70 or 75, you can be left without coverage just when a burial amount is most useful. Final expense is smaller whole life.",
    faq10q: "How much coverage should I buy?",
    faq10a: "A simple funeral is often about $10,000 to $25,000. Add small debts or family travel if you want a cushion. The table on this page shows illustrative premiums; Mejor Vida Insurance confirms the amount in a quote.",
    faq11q: "How do you file a claim?",
    faq11a: "The beneficiary contacts the insurer (or Mejor Vida Insurance) with the death certificate and policy number. Payment goes to the named beneficiary, not automatically to the funeral home. Keep the policy and the agent’s number where the family can find them.",
    faq12q: "Will beneficiaries owe tax on the money?",
    faq12a: "In most cases the death benefit is not taxable income to the beneficiary. This is not tax advice: a CPA or attorney should review large estates or other assets. The money usually skips probate if the beneficiary is named correctly.",
    faq13q: "What is cash value?",
    faq13a: "It is a small savings amount some whole life policies build over time. On final expense the main job is the death benefit, not investing. A loan or a surrender can reduce what the family receives.",
    faq14q: "Is burial insurance the same as funeral insurance?",
    faq14a: "In practice, yes: “burial,” “funeral,” and “final expense” describe the same class of smaller whole life. The contract does not reserve a service at a specific funeral home; it pays cash to the beneficiary.",
    nextH: "Next step",
    nextP: `To see prices for your age and health, <a href="quote.html">get a free quote</a> or call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a>.`,
    discTitle: "Disclosure",
    discBody: "This page is educational, not an offer. Ages, amounts, and premiums change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "Get a quote",
    quote1: "Appointed companies",
    quote2: "Level or with a wait",
    quoteCta: "See prices",
  };
}

function headHtml(lang, page, c, kind) {
  const isEs = lang === "es";
  const prefix = isEs ? "" : "../";
  const bodyClass =
    kind === "burial"
      ? "lic-page lic-page--seniors lic-page--burial"
      : kind === "hub"
        ? "lic-page lic-page--seniors lic-page--seniors-hub"
        : kind === "gi"
          ? "lic-page lic-page--seniors lic-page--gi"
          : kind === "crem"
            ? "lic-page lic-page--seniors lic-page--cremation"
            : kind === "term"
              ? "lic-page lic-page--seniors lic-page--term"
              : kind === "instant"
                ? "lic-page lic-page--seniors lic-page--instant"
                : kind === "mortgage"
                  ? "lic-page lic-page--seniors lic-page--mortgage"
                  : kind === "children"
                    ? "lic-page lic-page--seniors lic-page--children"
                    : kind === "grandchildren"
                      ? "lic-page lic-page--seniors lic-page--children lic-page--grandchildren"
                      : kind === "familyHub" ||
                          kind === "parents" ||
                          kind === "grandparents" ||
                          kind === "siblings" ||
                          kind === "familyMembers" ||
                          kind === "findPolicy"
                        ? "lic-page lic-page--seniors lic-page--family"
                        : kind === "condHub" ||
                            kind === "condTerm" ||
                            kind === "diabetes" ||
                            kind === "heart" ||
                            kind === "hbp" ||
                            kind === "copd" ||
                            kind === "cancer" ||
                            kind === "kidney" ||
                            kind === "disability" ||
                            kind === "hiv" ||
                            kind === "stroke"
                          ? "lic-page lic-page--seniors lic-page--conditions"
                          : "lic-page lic-page--seniors";
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
<link href="${prefix}css/nav-life-insurance.css?v=20260829-termcond-photo" rel="stylesheet"/>
<link href="${prefix}css/life-insurance-cost.css?v=20260830-factor-cards2" rel="stylesheet"/>
<link href="${prefix}css/mvi-assistant-widget.css?v=20260721-chat-z" rel="stylesheet"/>
<link href="${prefix}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<style>body { font-family: Inter, system-ui, -apple-system, sans-serif; }</style>
</head>
<body class="${bodyClass}">`;
}

function examMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const over80 = isEs ? "seguro-vida-mayores-80.html" : "life-insurance-seniors-over-80.html";
  const age = isEs ? "limite-edad-seguro-vida.html" : "life-insurance-age-limit.html";
  const burial = isEs ? "guia-seguro-entierro-mayores.html" : "burial-insurance-seniors.html";
  const moo = isEs ? "carriers/mutual-of-omaha.html" : "carriers/mutual-of-omaha.html";
  const aetna = isEs ? "carriers/aetna.html" : "carriers/aetna.html";
  const ta = isEs ? "carriers/transamerica.html" : "carriers/transamerica.html";
  const americo = isEs ? "carriers/americo.html" : "carriers/americo.html";
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
<div class="lic-overview-wrap">
<table class="lic-overview-table">
<thead>
<tr>
<th scope="col">${c.limH1}</th>
<th scope="col">${c.limH2}</th>
<th scope="col">${c.limH3}</th>
<th scope="col">${c.limH4}</th>
</tr>
</thead>
<tbody>
<tr>
<td data-label="${c.limH1}"><span class="lic-overview-type">${c.lim1a}</span><span class="lic-overview-sub">${c.lim1sub}</span></td>
<td data-label="${c.limH2}"><span class="lic-overview-age">${c.lim1amt}</span><span class="lic-overview-note">${c.lim1amtNote}</span></td>
<td data-label="${c.limH3}"><span class="lic-overview-age">${c.lim1age}</span><span class="lic-overview-note">${c.lim1ageNote}</span></td>
<td data-label="${c.limH4}">${c.lim1d}</td>
</tr>
<tr>
<td data-label="${c.limH1}"><span class="lic-overview-type">${c.lim2a}</span><span class="lic-overview-sub">${c.lim2sub}</span></td>
<td data-label="${c.limH2}"><span class="lic-overview-age">${c.lim2amt}</span><span class="lic-overview-note">${c.lim2amtNote}</span></td>
<td data-label="${c.limH3}"><span class="lic-overview-age">${c.lim2age}</span><span class="lic-overview-note">${c.lim2ageNote}</span></td>
<td data-label="${c.limH4}">${c.lim2d}</td>
</tr>
<tr>
<td data-label="${c.limH1}"><span class="lic-overview-type">${c.lim3a}</span><span class="lic-overview-sub">${c.lim3sub}</span></td>
<td data-label="${c.limH2}"><span class="lic-overview-age">${c.lim3amt}</span><span class="lic-overview-note">${c.lim3amtNote}</span></td>
<td data-label="${c.limH3}"><span class="lic-overview-age">${c.lim3age}</span><span class="lic-overview-note">${c.lim3ageNote}</span></td>
<td data-label="${c.limH4}">${c.lim3d}</td>
</tr>
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
<div class="lic-co-grid lic-co-grid--compare lic-co-grid--click">
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${moo}">
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
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${aetna}">
<div class="lic-co-logo"><img src="${assets}img/carriers/aetna-logo.svg" alt="" width="512" height="98" loading="lazy" decoding="async"/></div>
<h3>Aetna</h3>
<p class="lic-co-product">${c.coAetnaProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAetnaAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAetnaAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${ta}">
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
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${americo}">
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
<p class="lic-rate-note"><a href="${burial}">${isEs ? "Guía de entierro" : "Burial guide"}</a> · <a href="${over80}">${isEs ? "Mayores de 80" : "Seniors over 80"}</a> · <a href="${age}">${isEs ? "Límite de edad" : "Age limit"}</a> · <a href="${isEs ? "seguro-vida-entierro-sin-espera.html" : "no-waiting-period-life-burial.html"}">${isEs ? "Sin período de espera" : "No waiting period"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2 })}
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
  const burial = isEs ? "guia-seguro-entierro-mayores.html" : "burial-insurance-seniors.html";
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
<a href="#cap">${isEs ? "Sin tope único" : "No single cap"}</a>
<a href="#ages">${isEs ? "Resumen" : "Overview"}</a>
<a href="#final-expense">${isEs ? "Gastos finales" : "Final expense"}</a>
<a href="#cost">${isEs ? "Precios" : "Cost"}</a>
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
<section class="lic-section" id="cap">
<h2>${c.s1h}</h2>
<p>${c.s1p}</p>
</section>
<section class="lic-section" id="ages">
<h2>${c.overviewH}</h2>
<p>${c.overviewP}</p>
<div class="lic-overview-wrap">
<table class="lic-overview-table">
<thead>
<tr>
<th scope="col">${c.rowH1}</th>
<th scope="col">${c.rowH2}</th>
<th scope="col">${c.rowH3}</th>
<th scope="col">${c.rowH4}</th>
</tr>
</thead>
<tbody>
<tr>
<td data-label="${c.rowH1}"><span class="lic-overview-type">${c.r1a}</span><span class="lic-overview-sub">${c.r1sub}</span></td>
<td data-label="${c.rowH2}"><span class="lic-overview-age">${c.r1age}</span><span class="lic-overview-note">${c.r1ageNote}</span></td>
<td data-label="${c.rowH3}"><span class="lic-overview-lasts">${c.r1c}</span></td>
<td data-label="${c.rowH4}">${c.r1d}</td>
</tr>
<tr>
<td data-label="${c.rowH1}"><span class="lic-overview-type">${c.r2a}</span><span class="lic-overview-sub">${c.r2sub}</span></td>
<td data-label="${c.rowH2}"><span class="lic-overview-age">${c.r2age}</span><span class="lic-overview-note">${c.r2ageNote}</span></td>
<td data-label="${c.rowH3}"><span class="lic-overview-lasts">${c.r2c}</span></td>
<td data-label="${c.rowH4}">${c.r2d}</td>
</tr>
<tr>
<td data-label="${c.rowH1}"><span class="lic-overview-type">${c.r3a}</span><span class="lic-overview-sub">${c.r3sub}</span></td>
<td data-label="${c.rowH2}"><span class="lic-overview-age">${c.r3age}</span><span class="lic-overview-note">${c.r3ageNote}</span></td>
<td data-label="${c.rowH3}"><span class="lic-overview-lasts">${c.r3c}</span></td>
<td data-label="${c.rowH4}">${c.r3d}</td>
</tr>
<tr>
<td data-label="${c.rowH1}"><span class="lic-overview-type">${c.r4a}</span><span class="lic-overview-sub">${c.r4sub}</span></td>
<td data-label="${c.rowH2}"><span class="lic-overview-age">${c.r4age}</span><span class="lic-overview-note">${c.r4ageNote}</span></td>
<td data-label="${c.rowH3}"><span class="lic-overview-lasts">${c.r4c}</span></td>
<td data-label="${c.rowH4}">${c.r4d}</td>
</tr>
</tbody>
</table>
</div>
<p class="lic-rate-note">${c.overviewFoot}</p>
</section>
<section class="lic-section" id="final-expense">
<h2>${c.feH}</h2>
<div class="lic-spec"><ul>
<li>${c.feAge}</li>
<li>${c.feLasts}</li>
</ul></div>
<p>${c.feP}</p>
</section>
<section class="lic-section" id="guaranteed">
<h2>${c.giH}</h2>
<div class="lic-spec"><ul>
<li>${c.giAge}</li>
<li>${c.giLasts}</li>
</ul></div>
<p>${c.giP}</p>
</section>
<section class="lic-section" id="term">
<h2>${c.termH}</h2>
<div class="lic-spec"><ul>
<li>${c.termAge}</li>
<li>${c.termLasts}</li>
</ul></div>
<p>${c.termP}</p>
</section>
<section class="lic-section" id="whole-life">
<h2>${c.wlH}</h2>
<div class="lic-spec"><ul>
<li>${c.wlAge}</li>
<li>${c.wlLasts}</li>
</ul></div>
<p>${c.wlP}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
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
<p class="lic-rate-note"><a href="${burial}">${isEs ? "Guía de entierro" : "Burial guide"}</a> · <a href="${over80}">${isEs ? "Mayores de 80" : "Seniors over 80"}</a> · <a href="${over85}">${isEs ? "Mayores de 85" : "Seniors over 85"}</a> · <a href="${exam}">${isEs ? "Sin examen médico" : "No medical exam"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2 })}
</div>
</main>`;
}

function burialMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const exam = isEs ? "seguro-vida-mayores-sin-examen.html" : "life-insurance-seniors-no-medical-exam.html";
  const over80 = isEs ? "seguro-vida-mayores-80.html" : "life-insurance-seniors-over-80.html";
  const over85 = isEs ? "seguro-vida-mayores-85.html" : "life-insurance-seniors-over-85.html";
  const age = isEs ? "limite-edad-seguro-vida.html" : "life-insurance-age-limit.html";
  const moo = "carriers/mutual-of-omaha.html";
  const aetna = "carriers/aetna.html";
  const ta = "carriers/transamerica.html";
  const americo = "carriers/americo.html";
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
<a href="#how">${isEs ? "Cómo funciona" : "How it works"}</a>
<a href="#cover">${isEs ? "Qué cubre" : "What it covers"}</a>
<a href="#cost">${isEs ? "Precios" : "Cost"}</a>
<a href="#apply">${isEs ? "Solicitar" : "Apply"}</a>
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
<section class="lic-section" id="how">
<h2>${c.workH}</h2>
<p>${c.workP}</p>
</section>
<section class="lic-section" id="types">
<h2>${c.typesH}</h2>
<div class="lic-type-block">
<h3>${c.t1h}</h3>
<div class="lic-spec"><ul>
<li>${c.t1age}</li>
<li>${c.t1amt}</li>
</ul></div>
<p>${c.t1p}</p>
</div>
<div class="lic-type-block">
<h3>${c.t2h}</h3>
<div class="lic-spec"><ul>
<li>${c.t2age}</li>
<li>${c.t2amt}</li>
</ul></div>
<p>${c.t2p}</p>
</div>
</section>
<section class="lic-section" id="cover">
<h2>${c.coverH}</h2>
<p>${c.coverP}</p>
<ul>
<li>${c.cover1}</li>
<li>${c.cover2}</li>
<li>${c.cover3}</li>
<li>${c.cover4}</li>
</ul>
<p>${c.coverNote}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<div class="lic-product-tabs" data-lic-product="fe" data-lic-quote-href="quote.html">
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="10000" role="tab" aria-selected="true">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="15000" role="tab" aria-selected="false">$15,000</button>
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
<section class="lic-section" id="waiting">
<h2>${c.waitH}</h2>
<p>${c.waitP}</p>
</section>
<section class="lic-section" id="fit">
<h2>${c.fitH}</h2>
<p>${c.fitP}</p>
</section>
<section class="lic-section" id="later">
<h2>${c.laterH}</h2>
<p>${c.laterP}</p>
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyP}</p>
<ol>
<li>${c.apply1}</li>
<li>${c.apply2}</li>
<li>${c.apply3}</li>
<li>${c.apply4}</li>
</ol>
<div class="lic-tip">
<h3>${c.applyTipH}</h3>
<p>${c.applyTipP}</p>
</div>
</section>
<section class="lic-section" id="parent">
<h2>${c.parentH}</h2>
<p>${c.parentP}</p>
<ul>
<li>${c.parent1}</li>
<li>${c.parent2}</li>
<li>${c.parent3}</li>
</ul>
</section>
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<p>${c.coP}</p>
<div class="lic-co-grid lic-co-grid--compare lic-co-grid--click">
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${moo}">
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
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${aetna}">
<div class="lic-co-logo"><img src="${assets}img/carriers/aetna-logo.svg" alt="" width="512" height="98" loading="lazy" decoding="async"/></div>
<h3>Aetna</h3>
<p class="lic-co-product">${c.coAetnaProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAetnaAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAetnaAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${ta}">
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
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${americo}">
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
<p class="lic-co-footnote">${c.coFoot}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  .filter((n) => c["faq" + n + "q"])
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
<p class="lic-rate-note"><a href="${isEs ? "guia-seguro-vida-mayores.html" : "life-insurance-seniors.html"}">${isEs ? "Guía de vida para mayores" : "Life insurance for seniors"}</a> · <a href="${exam}">${isEs ? "Sin examen médico" : "No medical exam"}</a> · <a href="${age}">${isEs ? "Límite de edad" : "Age limit"}</a> · <a href="${over80}">${isEs ? "Mayores de 80" : "Seniors over 80"}</a> · <a href="${over85}">${isEs ? "Mayores de 85" : "Seniors over 85"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2 })}
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
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
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

function filterAges(tables, minAge) {
  const out = {};
  Object.keys(tables).forEach((key) => {
    out[key] = (tables[key] || []).filter((row) => Number(row.age) >= minAge);
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

function burialRatesPayload() {
  const faces = [10000, 15000, 25000];
  const feFile = JSON.parse(
    fs.readFileSync(path.join(ROOT, "js/final-expense-cost-rates.json"), "utf8")
  );
  const fe = feFile.final_expense || feFile;
  return {
    final_expense: {
      source: fe.source,
      rating: fe.rating,
      as_of: fe.as_of,
      note: fe.note,
      faces,
      tables: filterAges(pickFaceTables(fe.tables, faces), 50),
    },
  };
}

function cremRatesPayload() {
  const faces = [5000, 10000, 15000];
  const feFile = JSON.parse(
    fs.readFileSync(path.join(ROOT, "js/final-expense-cost-rates.json"), "utf8")
  );
  const fe = feFile.final_expense || feFile;
  return {
    final_expense: {
      source: fe.source,
      rating: fe.rating,
      as_of: fe.as_of,
      note: fe.note,
      faces,
      tables: filterAges(pickFaceTables(fe.tables, faces), 50),
    },
  };
}

function termRatesPayload() {
  const file = JSON.parse(
    fs.readFileSync(path.join(ROOT, "js/term-life-cost-rates.json"), "utf8")
  );
  const faces = [100000, 250000, 500000, 1000000, 2000000, 3000000];
  const terms = ["10", "20", "30"];
  const tables = {};
  terms.forEach((t) => {
    tables[t] = pickFaceTables((file.tables && file.tables[t]) || {}, faces);
  });
  return {
    source: file.source,
    rating: file.rating,
    as_of: file.as_of,
    note: "",
    faces,
    terms: [10, 20, 30],
    tables,
  };
}

function hubRatesPayload() {
  const exam = examRatesPayload();
  const faces = [5000, 10000, 25000];
  const wlFile = JSON.parse(
    fs.readFileSync(path.join(ROOT, "js/whole-life-cost-rates.json"), "utf8")
  );
  const wl = wlFile.whole_life || wlFile;
  const termFile = JSON.parse(
    fs.readFileSync(path.join(ROOT, "js/term-life-cost-rates.json"), "utf8")
  );
  const termFaces = [100000, 250000];
  const term10 = pickFaceTables((termFile.tables && termFile.tables["10"]) || {}, termFaces);
  return {
    source: termFile.source,
    rating: termFile.rating,
    as_of: termFile.as_of,
    note: termFile.note,
    tables: { 10: filterAges(term10, 50) },
    final_expense: {
      ...exam.final_expense,
      tables: filterAges(exam.final_expense.tables, 50),
    },
    guaranteed: {
      ...exam.guaranteed,
      tables: filterAges(exam.guaranteed.tables, 50),
    },
    whole_life: {
      source: wl.source,
      rating: wl.rating,
      as_of: wl.as_of,
      note: wl.note,
      faces,
      tables: filterAges(pickFaceTables(wl.tables, faces), 50),
    },
  };
}

function parseGiwlSampleTables() {
  const txt = fs.readFileSync(
    path.join(
      ROOT,
      "integrations/knowledge/Corebridge_Knowledge/raw/pdfs/AGLC200471-GIWL-Rates.txt"
    ),
    "utf8"
  );
  const ages = new Set([50, 55, 60, 65, 70, 75, 80]);
  const faceIdx = { 5000: 0, 10000: 1, 15000: 2, 20000: 3, 25000: 4 };
  const tables = { 5000: [], 10000: [], 20000: [], 25000: [] };
  txt.split(/\r?\n/).forEach((line) => {
    const m = line.match(
      /^(\d{2})\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*$/
    );
    if (!m) return;
    const age = Number(m[1]);
    if (!ages.has(age)) return;
    const male = [m[2], m[3], m[4], m[5], m[6]].map(Number);
    const female = [m[7], m[8], m[9], m[10], m[11]].map(Number);
    Object.keys(tables).forEach((face) => {
      const i = faceIdx[face];
      tables[face].push({
        age,
        female: Math.round(female[i]),
        male: Math.round(male[i]),
      });
    });
  });
  return tables;
}

function giRatesPayload() {
  const tables = parseGiwlSampleTables();
  const faces = [10000, 20000, 25000];
  return {
    guaranteed: {
      source: "Mejor Vida Insurance — appointed Corebridge GIWL",
      rating: "",
      as_of: "2026-08-22",
      note: "Illustrative monthly premiums for appointed guaranteed-issue whole life. Ages 50–80. Health does not change this price. Includes the policy fee. Two-year wait for natural death still applies. Educational only — not a binding quote.",
      faces,
      tables: pickFaceTables(tables, faces),
    },
  };
}

function examRateScripts(lang, kind) {
  const prefix = lang === "es" ? "" : "../";
  if (kind === "findPolicy") return "";
  if (kind === "children" || kind === "grandchildren") {
    const payload = JSON.parse(
      fs.readFileSync(path.join(ROOT, "js/children-life-cost-rates.json"), "utf8")
    );
    if (lang === "es") {
      payload.note =
        "Primas mensuales ilustrativas, redondeadas. Solo con fines educativos — no es una cotización vinculante. El costo real depende de la edad, la salud, el monto, el producto y el estado.";
    }
    return `<script>window.MVI_LIC_RATES = ${JSON.stringify(payload)};</script>
<script defer src="${prefix}js/life-insurance-cost.js?v=20260813-children"></script>
`;
  }
  if (kind === "condTerm") {
    const payload = termRatesPayload();
    payload.faces = [100000, 250000, 500000];
    payload.terms = [10, 20, 30];
    const faces = ["100000", "250000", "500000"];
    ["10", "20", "30"].forEach((t) => {
      if (!payload.tables[t]) return;
      const slim = {};
      faces.forEach((f) => {
        if (payload.tables[t][f]) slim[f] = payload.tables[t][f];
      });
      payload.tables[t] = slim;
    });
    payload.note =
      lang === "es"
        ? "Primas mensuales ilustrativas de temporal de suscripción completa, Preferred Best no fumador. Cada celda es la más baja entre compañías designadas. Una condición preexistente suele impedir esa clase: el precio real suele ser Standard, con extra de tabla, o no emitir. No es cotización vinculante."
        : "Illustrative fully underwritten term, Preferred Best non-tobacco. Each cell is the lowest among appointed companies. A pre-existing condition usually blocks that class: the real price is often Standard, a table extra, or no issue. Not a binding quote.";
    return `<script>window.MVI_LIC_RATES = ${JSON.stringify(payload)};</script>
<script defer src="${prefix}js/life-insurance-cost.js?v=20260829-termcond"></script>
`;
  }
  if (kind === "term" || kind === "mortgage") {
    const payload = termRatesPayload();
    if (kind === "mortgage") {
      payload.faces = [100000, 250000, 500000];
      payload.terms = [10, 20, 30];
      const faces = ["100000", "250000", "500000"];
      ["10", "20", "30"].forEach((t) => {
        if (!payload.tables[t]) return;
        const slim = {};
        faces.forEach((f) => {
          if (payload.tables[t][f]) slim[f] = payload.tables[t][f];
        });
        payload.tables[t] = slim;
      });
      return `<script>window.MVI_LIC_RATES = ${JSON.stringify(payload)};</script>
<script defer src="${prefix}js/life-insurance-cost.js?v=20260824-term-nonote"></script>
`;
    }
    const compare = JSON.parse(
      fs.readFileSync(path.join(ROOT, "js/term-vs-whole-cost-rates.json"), "utf8")
    );
    return `<script>window.MVI_LIC_RATES = ${JSON.stringify(payload)};</script>
<script>window.MVI_LIC_COMPARE = ${JSON.stringify(compare)};</script>
<script defer src="${prefix}js/life-insurance-cost.js?v=20260824-term-nonote"></script>
`;
  }
  const payload =
    kind === "burial" ||
    kind === "familyHub" ||
    kind === "parents" ||
    kind === "grandparents" ||
    kind === "siblings" ||
    kind === "familyMembers" ||
    kind === "condHub" ||
    kind === "diabetes" ||
    kind === "heart" ||
    kind === "hbp" ||
    kind === "copd" ||
    kind === "cancer" ||
    kind === "kidney" ||
    kind === "disability" ||
    kind === "stroke"
      ? burialRatesPayload()
      : kind === "hiv"
        ? giRatesPayload()
        : kind === "crem"
        ? cremRatesPayload()
        : kind === "hub"
        ? hubRatesPayload()
        : kind === "gi"
          ? giRatesPayload()
          : examRatesPayload();
  return `<script>window.MVI_LIC_RATES = ${JSON.stringify(payload)};</script>
<script defer src="${prefix}js/life-insurance-cost.js?v=20260828-gi-emptyfix"></script>
`;
}

function copyFor(kind, lang) {
  if (kind === "exam") return copyExam(lang);
  if (kind === "age") return copyAge(lang);
  if (kind === "hub") return copyHub(lang);
  if (kind === "gi") return copyGi(lang);
  if (kind === "crem") return copyCrem(lang);
  if (kind === "term") return copyTerm(lang);
  if (kind === "instant") return copyInstant(lang);
  if (kind === "mortgage") return copyMortgage(lang);
  if (kind === "children") return copyChildren(lang);
  if (kind === "grandchildren") return copyGrandchildren(lang);
  if (kind === "familyHub") return copyFamilyHub(lang);
  if (kind === "parents") return copyParents(lang);
  if (kind === "grandparents") return copyGrandparents(lang);
  if (kind === "siblings") return copySiblings(lang);
  if (kind === "familyMembers") return copyFamilyMembers(lang);
  if (kind === "findPolicy") return copyFindPolicy(lang);
  if (kind === "condHub") return copyCondHub(lang);
  if (kind === "condTerm") return copyCondTerm(lang);
  if (kind === "diabetes") return copyDiabetes(lang);
  if (kind === "heart") return copyHeart(lang);
  if (kind === "hbp") return copyHbp(lang);
  if (kind === "copd") return copyCopd(lang);
  if (kind === "cancer") return copyCancer(lang);
  if (kind === "kidney") return copyKidney(lang);
  if (kind === "disability") return copyDisability(lang);
  if (kind === "hiv") return copyHiv(lang);
  if (kind === "stroke") return copyStroke(lang);
  return copyBurial(lang);
}

function mainFor(kind, lang, page, c) {
  if (kind === "exam") return examMain(lang, page, c);
  if (kind === "age") return ageMain(lang, page, c);
  if (kind === "hub") return hubMain(lang, page, c);
  if (kind === "gi") return giMain(lang, page, c);
  if (kind === "crem") return cremMain(lang, page, c);
  if (kind === "term") return termMain(lang, page, c);
  if (kind === "instant") return instantMain(lang, page, c);
  if (kind === "mortgage") return mortgageMain(lang, page, c);
  if (kind === "children") return childrenMain(lang, page, c);
  if (kind === "grandchildren") return grandchildrenMain(lang, page, c);
  if (kind === "familyHub") return familyHubMain(lang, page, c);
  if (kind === "parents") return parentsMain(lang, page, c);
  if (kind === "grandparents") return grandparentsMain(lang, page, c);
  if (kind === "siblings") return siblingsMain(lang, page, c);
  if (kind === "familyMembers") return familyMembersMain(lang, page, c);
  if (kind === "findPolicy") return findPolicyMain(lang, page, c);
  if (kind === "condHub") return condHubMain(lang, page, c);
  if (kind === "condTerm") return condTermMain(lang, page, c);
  if (kind === "diabetes") return diabetesMain(lang, page, c);
  if (kind === "heart") return heartMain(lang, page, c);
  if (kind === "hbp") return hbpMain(lang, page, c);
  if (kind === "copd") return copdMain(lang, page, c);
  if (kind === "cancer") return cancerMain(lang, page, c);
  if (kind === "kidney") return kidneyMain(lang, page, c);
  if (kind === "disability") return disabilityMain(lang, page, c);
  if (kind === "hiv") return hivMain(lang, page, c);
  if (kind === "stroke") return strokeMain(lang, page, c);
  return burialMain(lang, page, c);
}

function build(kind, lang) {
  const page = PAGES[kind];
  const c = copyFor(kind, lang);
  const main = mainFor(kind, lang, page, c);
  const html = `${headHtml(lang, page, c, kind)}
${headerFor(lang, page)}
${main}
${jsonLd(lang, page, c)}
${footerFor(lang)}
${examRateScripts(lang, kind)}</body>
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
    build("burial", "es"),
    build("burial", "en"),
    build("hub", "es"),
    build("hub", "en"),
    build("gi", "es"),
    build("gi", "en"),
    build("crem", "es"),
    build("crem", "en"),
    build("term", "es"),
    build("term", "en"),
    build("instant", "es"),
    build("instant", "en"),
    build("mortgage", "es"),
    build("mortgage", "en"),
    build("children", "es"),
    build("children", "en"),
    build("grandchildren", "es"),
    build("grandchildren", "en"),
    build("familyHub", "es"),
    build("familyHub", "en"),
    build("parents", "es"),
    build("parents", "en"),
    build("grandparents", "es"),
    build("grandparents", "en"),
    build("siblings", "es"),
    build("siblings", "en"),
    build("familyMembers", "es"),
    build("familyMembers", "en"),
    build("findPolicy", "es"),
    build("findPolicy", "en"),
    build("condHub", "es"),
    build("condHub", "en"),
    build("condTerm", "es"),
    build("condTerm", "en"),
    build("diabetes", "es"),
    build("diabetes", "en"),
    build("heart", "es"),
    build("heart", "en"),
    build("hbp", "es"),
    build("hbp", "en"),
    build("copd", "es"),
    build("copd", "en"),
    build("cancer", "es"),
    build("cancer", "en"),
    build("kidney", "es"),
    build("kidney", "en"),
    build("disability", "es"),
    build("disability", "en"),
    build("hiv", "es"),
    build("hiv", "en"),
    build("stroke", "es"),
    build("stroke", "en"),
  ];
  console.log("Wrote", written.length, "pages");
  written.forEach((p) => console.log(" ", path.relative(ROOT, p)));
}

main();
