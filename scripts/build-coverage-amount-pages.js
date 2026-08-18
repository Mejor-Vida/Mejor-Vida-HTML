#!/usr/bin/env node
/**
 * Build bilingual cost-by-coverage pages from MVI rate tables.
 *
 *   node scripts/build-coverage-amount-pages.js
 *
 * Uses costo-seguro-vida-5000.html / en/5000-life-insurance-cost.html as the
 * layout example. Charts come from js/final-expense-cost-rates.json (Integrity
 * FE harvest; missing faces scaled from $10,000), guaranteed harvest at $5,000
 * scaled through $25,000, traditional whole life through $100,000, and appointed
 * 10-year term (Integrity FU harvest, including jumbo faces).
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FE_PATH = path.join(ROOT, "js/final-expense-cost-rates.json");
const WL_PATH = path.join(ROOT, "js/whole-life-cost-rates.json");
const TERM_PATH = path.join(ROOT, "js/term-life-cost-rates.json");
const ES_HEADER = path.join(ROOT, "includes/site-header-inner.html");
const EN_HEADER = path.join(ROOT, "includes/en-site-header.html");

const AMOUNTS = [
  5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000,
  500000, 1000000, 2000000, 3000000,
];
const BUILD_AMOUNTS = AMOUNTS.filter((n) => n !== 5000);
const FE_MAX = 50000;
const GI_MAX = 25000;
const FE_COPY_MAX = 25000;
const TRAD_WL_MAX = 100000;
const COREBRIDGE_MAX = 35000;

/** Quote-engine GI harvest from the $5,000 page (Aug 15, 2026). */
const GI_5000 = [
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

const CARRIERS = [
  {
    id: "moo",
    href: "mutual-of-omaha",
    name: "Mutual of Omaha",
    productEs: "Living Promise Nivelado",
    productEn: "Living Promise Level",
    score: "4.4/5",
    stars: "on on on on half",
    cost5k: 22.1,
    ages: "45–85",
    deathEs: "$2,000–$50,000",
    deathEn: "$2,000–$50,000",
    logo: "picture-moo",
    maxFace: 50000,
  },
  {
    id: "corebridge",
    href: "corebridge",
    name: "Corebridge",
    productEs: "SimpliNow Legacy Nivelado",
    productEn: "SimpliNow Legacy Level",
    score: "4.14/5",
    stars: "on on on on off",
    cost5k: 23.99,
    ages: "50–80",
    deathEs: "Aprox. $5,000–$35,000",
    deathEn: "About $5,000–$35,000",
    logo: "svg-corebridge",
    maxFace: COREBRIDGE_MAX,
  },
  {
    id: "aetna",
    href: "aetna",
    name: "Aetna",
    productEs: "Accendo Preferred (Nivelado)",
    productEn: "Accendo Preferred (Level)",
    score: "3.67/5",
    stars: "on on on half off",
    cost5k: 25.55,
    ages: "40–89",
    deathEs: "$2,000–$50,000",
    deathEn: "$2,000–$50,000",
    logo: "svg-aetna",
    maxFace: 50000,
  },
  {
    id: "transamerica",
    href: "transamerica",
    name: "Transamerica",
    productEs: "Immediate Solution Preferred",
    productEn: "Immediate Solution Preferred",
    score: "2.9/5",
    stars: "on on half off off",
    cost5k: 22.17,
    ages: "18–85",
    deathEs: "Desde $1,000; hasta $50,000+",
    deathEn: "From $1,000; up to $50,000+",
    logo: "picture-transamerica",
    maxFace: 50000,
  },
  {
    id: "amam",
    href: "american-amicable",
    name: "American Amicable",
    productEs: "Senior Choice Inmediato",
    productEn: "Senior Choice Immediate",
    score: "2.25/5",
    stars: "on on half off off",
    cost5k: 24.85,
    ages: "50–85",
    deathEs: "$2,500–$50,000",
    deathEn: "$2,500–$50,000",
    logo: "picture-amam",
    maxFace: 50000,
  },
];

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function moneyDec(n) {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function esFile(face) {
  return `costo-seguro-vida-${face}.html`;
}

function enFile(face) {
  return `${face}-life-insurance-cost.html`;
}

function scaleRows(rows, fromFace, toFace) {
  const factor = toFace / fromFace;
  return rows.map((r) => ({
    age: r.age,
    female: Math.round(Number(r.female) * factor),
    male: Math.round(Number(r.male) * factor),
  }));
}

function expandFeRates(raw) {
  const fe = raw.final_expense;
  const base10 = fe.tables["10000"];
  const extra = [15000, 20000, 30000, 40000];
  for (const face of extra) {
    if (!fe.tables[String(face)]) {
      fe.tables[String(face)] = scaleRows(base10, 10000, face);
    }
  }
  fe.faces = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000];
  fe.source = "Mejor Vida Insurance (appointed companies)";
  fe.note =
    "Illustrative monthly premiums from appointed companies compared by Mejor Vida Insurance. $5,000 and $10,000 are published bands; $15,000 / $20,000 / $30,000 / $40,000 scale from the $10,000 band; $25,000 and $50,000 use the $10,000 band scaled in the published table. Non-tobacco, good-health (Level/Immediate) low. Ages 45–85. Educational only — not a binding quote.";
  raw.guaranteed = {
    source: "Mejor Vida Insurance (appointed companies) — guaranteed-acceptance lowest",
    rating: "Guaranteed acceptance (typical two-year wait)",
    as_of: "2026-08-15",
    note: "Illustrative monthly premiums from appointed companies compared by Mejor Vida Insurance for guaranteed-acceptance whole life. $5,000 is a published band; $10,000–$25,000 are scaled from that band. Ages 45–85. Educational only — not a binding quote.",
    faces: [5000, 10000, 15000, 20000, 25000],
    tables: {
      5000: GI_5000,
      10000: scaleRows(GI_5000, 5000, 10000),
      15000: scaleRows(GI_5000, 5000, 15000),
      20000: scaleRows(GI_5000, 5000, 20000),
      25000: scaleRows(GI_5000, 5000, 25000),
    },
  };
  return raw;
}

function amountSwitch(face, lang) {
  const bits = AMOUNTS.map((n) => {
    const href = lang === "es" ? esFile(n) : enFile(n);
    const cls = n === face ? ' class="is-active"' : "";
    const current = n === face ? ' aria-current="page"' : "";
    return `<a href="${href}"${cls}${current}>${money(n)}</a>`;
  });
  const label = lang === "es" ? "Costo por monto de cobertura" : "Cost by coverage amount";
  return `<nav class="lic-amount-switch" aria-label="${label}">\n${bits.join("\n")}\n</nav>`;
}

function copyFor(face, lang) {
  const m = money(face);
  const isEs = lang === "es";
  const feLike = face <= FE_MAX;
  const feCopy = face <= FE_COPY_MAX;
  const jumbo = face >= 500000;
  const large = face > FE_MAX;

  const enough =
    face <= 5000
      ? isEs
        ? `${m} puede ayudar con una cremación sencilla, pero un entierro tradicional suele costar unos $8,200–$8,600.`
        : `${m} can help with a simple cremation, but a traditional burial often costs about $8,200–$8,600.`
      : face <= 10000
        ? isEs
          ? `${m} suele alcanzar para un entierro tradicional promedio ($8,200–$8,600) o una cremación con servicio, con poco o nada de sobra.`
          : `${m} is often enough for an average traditional burial ($8,200–$8,600) or a funeral with cremation, with little left over.`
        : face <= 25000
          ? isEs
            ? `${m} cubre un entierro promedio y deja margen para deudas, viajes de la familia o un servicio más completo.`
            : `${m} covers an average burial and leaves room for debts, family travel, or a fuller service.`
          : face <= 50000
            ? isEs
              ? `${m} va más allá del funeral: muchas familias usan este monto para deudas, reemplazo de ingreso corto o dejar algo a los hijos.`
              : `${m} goes beyond the funeral: many families use this amount for debts, short income replacement, or a gift to children.`
          : face < 500000
            ? isEs
              ? `${m} es más que un plan de entierro. Suele usarse para proteger ingreso, una hipoteca o varias necesidades a la vez.`
              : `${m} is more than a burial plan. It is often used to protect income, a mortgage, or several needs at once.`
            : isEs
              ? `${m} suele usarse para reemplazar varios años de ingreso, pagar una hipoteca o dejar un colchón a la familia. Un funeral es una fracción pequeña de este monto.`
              : `${m} is usually used to replace several years of income, pay off a mortgage, or leave a cushion for the family. A funeral is a small slice of this amount.`;

  const heroLead = jumbo
    ? isEs
      ? `Una póliza de ${m} suele ser <strong>temporal</strong> (10, 20 o 30 años) para reemplazar ingreso o una hipoteca — no un plan de entierro. Aquí verá tarifas mensuales de término a 10 años de compañías designadas.`
      : `A ${m} policy is usually <strong>term</strong> (10, 20, or 30 years) to replace income or a mortgage — not a burial plan. See appointed 10-year term monthly rates.`
    : large
    ? isEs
      ? `Una póliza de ${m} ya no es el típico plan pequeño de vida entera (esos suelen llegar hasta unos $50,000). Aquí verá tarifas ilustrativas de vida entera tradicional y cómo se compara con el temporal de $100,000 de Mejor Vida Seguros.`
      : `A ${m} policy is larger than a typical small whole-life plan (those usually top out around $50,000). See illustrative traditional whole-life rates and how they compare with $100,000 term from Mejor Vida Insurance.`
    : isEs
      ? `Una póliza de ${m} suele ser <strong>vida entera</strong> para entierro, deudas o un colchón para la familia — no un plan temporal grande. Aquí verá tarifas mensuales por edad, cómo se comparan las compañías designadas, y si ${m} alcanza.`
      : `A ${m} policy is usually <strong>whole life</strong> for burial, bills, or a cushion for the family — not a large term plan. See monthly rates by age, how appointed companies compare, and whether ${m} is enough.`;

  const take1 = jumbo
    ? isEs
      ? `A ${m}, el camino habitual es <strong>temporal con suscripción completa</strong> (a menudo con examen).`
      : `At ${m}, the usual path is <strong>fully underwritten term</strong> (often with an exam).`
    : large
    ? isEs
      ? `La vida entera simplificada de Mejor Vida Seguros suele llegar hasta unos <strong>$50,000</strong>. ${m} entra en vida entera tradicional o temporal con suscripción más completa.`
      : `Simplified whole life from Mejor Vida Insurance usually goes up to about <strong>$50,000</strong>. ${m} is traditional whole life or fully underwritten term.`
    : feCopy
    ? isEs
      ? `Una póliza de ${m} es un monto <strong>permanente</strong> — suele ser vida entera vendida como gastos finales, con preguntas de salud y <strong>sin examen médico</strong> en la mayoría de los planes designados.`
      : `A ${m} policy is a <strong>permanent</strong> amount — usually whole life sold as final expense, with health questions and <strong>no medical exam</strong> on most appointed plans.`
    : isEs
      ? `Una póliza de ${m} es un monto <strong>permanente</strong> — suele ser <strong>vida entera</strong>, con preguntas de salud y <strong>sin examen médico</strong> en la mayoría de los planes designados.`
      : `A ${m} policy is a <strong>permanent</strong> amount — usually <strong>whole life</strong>, with health questions and <strong>no medical exam</strong> on most appointed plans.`;

  const take2 = enough;
  const take3 = isEs
    ? `Las tablas muestran <strong>primas mensuales ilustrativas</strong> de compañías designadas comparadas por Mejor Vida Seguros. Son educativas — no son una oferta vinculante.`
    : `The tables show <strong>illustrative monthly rates</strong> from appointed companies compared by Mejor Vida Insurance. They are educational — not a binding offer.`;

  return {
    title: isEs
      ? `Costo de una póliza de ${m} (tarifas 2026) | Mejor Vida Seguros`
      : `${m} Life Insurance Policy Cost (2026 Rates) | Mejor Vida Insurance`,
    desc: isEs
      ? `¿Cuánto cuesta una póliza de seguro de vida de ${m}? Primas mensuales ilustrativas por edad y sexo de Mejor Vida Seguros — no es una cotización vinculante.`
      : `How much a ${m} life insurance policy costs by age and gender. Illustrative monthly rates from Mejor Vida Insurance — not a binding quote.`,
    og: isEs
      ? `Primas mensuales ilustrativas de ${m} por edad de Mejor Vida Seguros — no es cotización vinculante.`
      : `Illustrative monthly ${m} rates by age from Mejor Vida Insurance — not a binding quote.`,
    h1: isEs ? `Cuánto cuesta una póliza de ${m}` : `How much a ${m} life insurance policy costs`,
    heroLead,
    take1,
    take2,
    take3,
    enough,
    feTitle: isEs
      ? feCopy
        ? `Tarifas de vida entera / gastos finales de ${m}`
        : `Tarifas de vida entera de ${m}`
      : feCopy
        ? `${m} whole life / final expense rates`
        : `${m} whole life rates`,
    feLead: isEs
      ? `La vida entera está pensada para durar toda la vida mientras se paguen las primas. El precio suele mantenerse nivelado. Estas cifras son las primas mensuales más bajas de buena salud (Nivel/Inmediato) de compañías designadas de Mejor Vida Seguros para un beneficio de <strong>${m}</strong>.`
      : `Whole life is meant to last a lifetime while premiums are paid. The price is usually designed to stay level. These figures are the lowest good-health (Level/Immediate) monthly premiums from appointed companies compared by Mejor Vida Insurance for a <strong>${m}</strong> benefit.`,
    giTitle: isEs
      ? `Tarifas de aceptación garantizada de ${m}`
      : `${m} guaranteed-acceptance rates`,
    giLead: isEs
      ? `La vida entera de aceptación garantizada omite las preguntas de salud. A cambio, casi siempre hay un <strong>período de espera de dos años</strong> por muerte natural. Un plan nivelado con respuestas honestas de salud a menudo cuesta menos <em>y</em> puede iniciar la cobertura antes.`
      : `Guaranteed-acceptance whole life skips health questions. In return there is almost always a <strong>two-year wait</strong> for a natural death. A level plan with honest health answers often costs less <em>and</em> can start coverage sooner.`,
    giSkip: isEs
      ? `La aceptación garantizada designada de Mejor Vida Seguros suele topar cerca de $25,000. Para ${m}, compare vida entera nivelada o pida una <a href="quote.html">cotización gratis</a>.`
      : `Appointed guaranteed-acceptance plans from Mejor Vida Insurance usually top out near $25,000. For ${m}, compare level whole life or start a <a href="quote.html">free quote</a>.`,
    wlTitle: isEs
      ? `Tarifas de vida entera tradicional de ${m}`
      : `${m} traditional whole life rates`,
    wlLead: isEs
      ? `A este monto, muchas familias usan vida entera con suscripción más completa — no el plan pequeño de vida entera. Las cifras son primas mensuales ilustrativas preferred / no fumador.`
      : `At this amount, many families use fully underwritten whole life — not a small whole-life plan. Figures are illustrative preferred / non-tobacco monthly premiums.`,
    termTitle: isEs
      ? `¿Hay una opción temporal de ${m}?`
      : `Is there a ${m} term option?`,
    termTitleJumbo: isEs
      ? `Tarifas de temporal a 10 años de ${m}`
      : `${m} 10-year term rates`,
    termLeadSmall: isEs
      ? feCopy
        ? `Los productos temporales designados de Mejor Vida Seguros no se emiten a ${m}. El monto publicado más pequeño es <strong>$100,000</strong>. La tabla es temporal a 10 años en ese monto. Para ${m}, las familias casi siempre usan <strong>vida entera / gastos finales</strong>.`
        : `Los productos temporales designados de Mejor Vida Seguros no se emiten a ${m}. El monto publicado más pequeño es <strong>$100,000</strong>. La tabla es temporal a 10 años en ese monto. Para ${m}, las familias casi siempre usan <strong>vida entera</strong>.`
      : feCopy
        ? `Appointed term products from Mejor Vida Insurance are not issued at ${m}. The smallest published amount is <strong>$100,000</strong>. The table is 10-year term at that amount. For ${m}, families almost always use <strong>whole life / final expense</strong>.`
        : `Appointed term products from Mejor Vida Insurance are not issued at ${m}. The smallest published amount is <strong>$100,000</strong>. The table is 10-year term at that amount. For ${m}, families almost always use <strong>whole life</strong>.`,
    termLead100: isEs
      ? `Sí. ${m} es el monto temporal más pequeño de Mejor Vida Seguros. La tabla es temporal a 10 años, no fumador, preferido con suscripción completa.`
      : `Yes. ${m} is the smallest term amount from Mejor Vida Insurance. The table is 10-year term, non-tobacco, preferred, fully underwritten.`,
    termLead75: isEs
      ? `El temporal designado de Mejor Vida Seguros empieza en <strong>$100,000</strong>, no en $75,000. La tabla de abajo es temporal a 10 años de $100,000 — el escalón publicado más cercano.`
      : `Appointed term from Mejor Vida Insurance starts at <strong>$100,000</strong>, not $75,000. The table below is 10-year term at $100,000 — the nearest published band.`,
    termLeadJumbo: isEs
      ? `Sí. A ${m} el camino habitual es temporal. La tabla es <strong>término a 10 años</strong>, no fumador, preferido, de compañías designadas de Mejor Vida Seguros. También hay plazos de 20 y 30 años en la <a href="costo-seguro-vida-temporal.html">página de costo temporal</a>.`
      : `Yes. At ${m} the usual path is term. The table is <strong>10-year term</strong>, non-tobacco, preferred, from appointed companies compared by Mejor Vida Insurance. 20- and 30-year terms are on the <a href="term-life-cost.html">term cost page</a>.`,
    termLead3m: isEs
      ? `Mejor Vida Seguros tiene cuadros designados hasta $2,000,000. Las cifras de $3,000,000 se escalan desde ese cuadro de $2,000,000. Pida una cotización para el precio real.`
      : `Mejor Vida Insurance appointed charts go through $2,000,000. The $3,000,000 figures are scaled from that $2,000,000 chart. Get a quote for the live price.`,
    companiesTitle: isEs
      ? `Compañías designadas para una póliza de ${m}`
      : `Appointed companies for a ${m} policy`,
    companiesLead: isEs
      ? `Mejor Vida Seguros compara compañías designadas — no es una garantía de emisión. Las tarjetas van ordenadas por el <strong>score Mejor Vida</strong>, no por quién es más barata. Las primas de muestra son para una <strong>mujer de 65 años, no fumadora, plan Nivel / Inmediato</strong>, escaladas desde cotizaciones a $5,000.`
      : `Mejor Vida Insurance compares appointed companies — not a guarantee of issue. Cards are ordered by the <strong>Mejor Vida Insurance score</strong>, not by who is cheapest. Sample premiums are for a <strong>female, age 65, non-tobacco, Level / Immediate</strong>, scaled from $5,000 quotes.`,
    companiesLarge: isEs
      ? jumbo
        ? `A ${m}, las familias suelen empezar con <strong>temporal</strong>. Empiece una <a href="term-quote.html">cotización de término</a> con Mejor Vida Seguros. Si prefiere cobertura permanente, también puede <a href="quote.html">pedir una cotización de vida entera</a>.`
        : `A ${m}, las familias suelen comparar vida entera tradicional o temporal — no las pólizas pequeñas de vida entera. Empiece una <a href="quote.html">cotización de vida entera</a> o una <a href="term-quote.html">cotización de término</a> con Mejor Vida Seguros.`
      : jumbo
        ? `At ${m}, families usually start with <strong>term</strong>. Start a <a href="term-quote.html">term quote</a> with Mejor Vida Insurance. If you prefer permanent coverage, you can also <a href="quote.html">request a whole-life quote</a>.`
        : `At ${m}, families usually compare traditional whole life or term — not small whole-life policies. Start a <a href="quote.html">whole-life quote</a> or a <a href="term-quote.html">term quote</a> with Mejor Vida Insurance.`,
    enoughTitle: isEs ? `¿Alcanzan ${m}?` : `Is ${m} enough?`,
    applyTitle: isEs ? `Cómo solicitar una póliza de ${m}` : `How to apply for a ${m} policy`,
    faqExam: isEs
      ? jumbo
        ? `En este monto suele haber suscripción completa: cuestionario, recetas y a menudo un examen (paramédico o laboratorio). El temporal sin examen existe, pero suele costar más.`
        : feLike
        ? feCopy
          ? `Por lo general no. En este monto, los planes designados de gastos finales y vida entera pequeña suelen usar un cuestionario de salud en lugar de una visita al doctor.`
          : `Por lo general no. En este monto, los planes designados de vida entera suelen usar un cuestionario de salud en lugar de una visita al doctor.`
        : `A menudo sí hay más revisión (cuestionario amplio o examen) porque ${m} es más cobertura de la que emiten los planes pequeños de vida entera.`
      : jumbo
        ? `At this amount, full underwriting is common: a questionnaire, prescriptions, and often an exam (paramed or labs). No-exam term exists, but it usually costs more.`
        : feLike
        ? feCopy
          ? `Usually no. At this amount, appointed final-expense and small whole-life plans typically use a health questionnaire instead of a doctor visit.`
          : `Usually no. At this amount, appointed whole-life plans typically use a health questionnaire instead of a doctor visit.`
        : `Often there is more review (a longer questionnaire or an exam) because ${m} is more coverage than small whole-life plans issue.`,
    faqFuneral: enough,
    faqTerm: isEs
      ? jumbo
        ? `A ${m} el camino habitual es temporal. El temporal dura un plazo fijo; la vida entera puede durar toda la vida. El temporal suele costar menos por cada dólar de cobertura; la vida entera sigue en vigor mientras se paguen las primas.`
        : face >= 100000
        ? `Sí puede comparar temporal a ${m}. El temporal dura un plazo fijo; la vida entera puede durar toda la vida. El temporal suele costar menos por cada dólar de cobertura; la vida entera sigue en vigor mientras se paguen las primas.`
        : feCopy
        ? `Para este monto, la vía habitual es vida entera / gastos finales. El temporal tradicional de Mejor Vida Seguros empieza en $100,000.`
        : `Para este monto, la vía habitual es vida entera. El temporal tradicional de Mejor Vida Seguros empieza en $100,000.`
      : jumbo
        ? `At ${m}, term is the usual path. Term lasts a set period; whole life can last a lifetime. Term usually costs less per dollar of coverage; whole life stays in force as long as premiums are paid.`
        : face >= 100000
        ? `Yes — you can compare term at ${m}. Term lasts a set period; whole life can last a lifetime. Term usually costs less per dollar of coverage; whole life stays in force as long as premiums are paid.`
        : feCopy
        ? `At this amount the usual path is whole life / final expense. Traditional term from Mejor Vida Insurance starts at $100,000.`
        : `At this amount the usual path is whole life. Traditional term from Mejor Vida Insurance starts at $100,000.`,
    quoteCard: isEs ? `Cotización de ${m}` : `${m} quote`,
    crumb: isEs ? "Costo del seguro de vida" : "Life insurance cost",
    crumbHome: isEs ? "Inicio" : "Home",
    feLike,
    large,
    jumbo,
  };
}

function starsHtml(spec) {
  return spec
    .split(" ")
    .map((s) => `<span class="lic-star--${s}">★</span>`)
    .join("");
}

function logoHtml(kind, prefix) {
  if (kind === "picture-moo") {
    return `<picture>
<source type="image/webp" srcset="${prefix}img/opt/mutual-of-omaha-logo.webp"/>
<img src="${prefix}img/opt/mutual-of-omaha-logo.png" alt="" width="322" height="62" loading="lazy" decoding="async"/>
</picture>`;
  }
  if (kind === "svg-corebridge") {
    return `<img src="${prefix}img/carriers/corebridge-logo.svg" alt="" width="576" height="188" loading="lazy" decoding="async"/>`;
  }
  if (kind === "svg-aetna") {
    return `<img src="${prefix}img/carriers/aetna-logo.svg" alt="" width="512" height="98" loading="lazy" decoding="async"/>`;
  }
  if (kind === "picture-transamerica") {
    return `<picture>
<source type="image/webp" srcset="${prefix}img/opt/transamerica-logo.webp"/>
<img src="${prefix}img/opt/transamerica-logo.png" alt="" width="362" height="69" loading="lazy" decoding="async"/>
</picture>`;
  }
  return `<picture>
<source type="image/webp" srcset="${prefix}img/opt/american-amicable-logo.webp"/>
<img src="${prefix}img/opt/american-amicable-logo.png" alt="" width="459" height="54" loading="lazy" decoding="async"/>
</picture>`;
}

function carrierCards(face, lang, prefix) {
  const isEs = lang === "es";
  const m = money(face);
  const shown = CARRIERS.filter((c) => face <= c.maxFace);
  if (!shown.length) return "";
  return shown
    .map((c) => {
      const cost = moneyDec(c.cost5k * (face / 5000));
      const product = isEs ? c.productEs : c.productEn;
      const death = isEs ? c.deathEs : c.deathEn;
      const costLabel = isEs ? `Costo de póliza de ${m}` : `${m} policy cost`;
      const agesLabel = isEs ? "Edades de nuevos solicitantes" : "Issue ages";
      const deathLabel = isEs ? "Opciones de beneficio por fallecimiento" : "Death benefit options";
      const waitLabel = isEs ? "Período de espera de 2 años" : "2-year waiting period";
      const waitVal = isEs ? "No" : "No";
      const cta = isEs ? "Ver precios" : "See prices";
      const more = isEs ? "Leer resumen" : "Read overview";
      const href = `${prefix}carriers/${c.href}.html`;
      const quote = `${prefix}quote.html`;
      return `<article class="lic-co-card lic-co-card--compare">
<div class="lic-co-logo">
${logoHtml(c.logo, prefix)}
</div>
<h3><a href="${href}">${c.name}</a></h3>
<p class="lic-co-product">${product}</p>
<div class="lic-co-score">
<span class="lic-co-score__num">${c.score}</span>
<span class="lic-co-score__label">${isEs ? "Score Mejor Vida" : "Mejor Vida score"}</span>
<div class="lic-co-stars" aria-hidden="true">${starsHtml(c.stars)}</div>
</div>
<dl class="lic-co-specs">
<div><dt>${costLabel}</dt><dd>${cost}/mes*</dd></div>
<div><dt>${agesLabel}</dt><dd>${c.ages}</dd></div>
<div><dt>${deathLabel}</dt><dd>${death}</dd></div>
<div><dt>${waitLabel}</dt><dd>${waitVal}</dd></div>
</dl>
<a class="lic-co-cta" href="${quote}">${cta}</a>
<a class="lic-co-more" href="${href}">${more}</a>
</article>`;
    })
    .join("\n");
}

function rateTable(lang, bindNote) {
  const age = lang === "es" ? "Edad" : "Age";
  const fem = lang === "es" ? "Mujer" : "Female";
  const male = lang === "es" ? "Hombre" : "Male";
  const noteAttr = bindNote === false ? "" : " data-lic-note";
  return `<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${age}</th><th scope="col">${fem}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note"${noteAttr}></p>`;
}

function pricedAgeRows(rows) {
  return (rows || []).filter(
    (r) => r && !r.quote && (r.female != null || r.male != null)
  );
}

function termChart(face, rates) {
  const t10 = rates.term10 || {};
  if (t10[String(face)]) {
    return { face, rows: pricedAgeRows(t10[String(face)]), scaled: false };
  }
  if (face === 3000000 && t10["2000000"]) {
    return {
      face: 3000000,
      rows: pricedAgeRows(scaleRows(pricedAgeRows(t10["2000000"]), 2000000, 3000000)),
      scaled: true,
    };
  }
  return { face: 100000, rows: pricedAgeRows(t10["100000"]), scaled: false };
}

function ratesPayload(face, rates) {
  const payload = {};
  if (face <= FE_MAX && rates.final_expense.tables[String(face)]) {
    const feNote =
      face > FE_COPY_MAX
        ? "Illustrative monthly premiums from appointed companies compared by Mejor Vida Insurance for whole-life plans. Non-tobacco, good-health (Level/Immediate) low. Ages 45–85. Educational only — not a binding quote."
        : rates.final_expense.noteEs || rates.final_expense.note;
    payload.final_expense = {
      ...rates.final_expense,
      faces: [face],
      tables: { [face]: rates.final_expense.tables[String(face)] },
      note: feNote,
    };
  }
  if (face <= GI_MAX && rates.guaranteed.tables[String(face)]) {
    payload.guaranteed = {
      ...rates.guaranteed,
      faces: [face],
      tables: { [face]: rates.guaranteed.tables[String(face)] },
    };
  }
  if (face > FE_MAX && face <= TRAD_WL_MAX) {
    const trad = rates.whole_life_traditional;
    let rows;
    let note =
      "Illustrative traditional whole life monthly premiums, preferred / non-tobacco. Educational only — not a binding quote.";
    if (trad.tables[String(face)]) {
      rows = trad.tables[String(face)];
    } else {
      rows = scaleRows(trad.tables["100000"], 100000, face);
      note =
        "Illustrative traditional whole life monthly premiums scaled from the $100,000 preferred / non-tobacco sample on the Mejor Vida Insurance cost hub. Educational only — not a binding quote.";
    }
    payload.whole_life_traditional = {
      source: "Mejor Vida Insurance (appointed companies)",
      rating: trad.rating,
      as_of: trad.as_of,
      note,
      faces: [face],
      tables: { [face]: rows },
    };
  }
  const term = termChart(face, rates);
  payload.tables = {
    10: { [term.face]: term.rows },
  };
  return payload;
}

function localizePayload(payload, lang, face) {
  if (lang !== "es") return payload;
  const out = JSON.parse(JSON.stringify(payload));
  if (out.final_expense) {
    out.final_expense.source =
      "Mejor Vida Seguros (compañías designadas)";
    out.final_expense.rating = "No fumador, buena salud (Nivel/Inmediato) baja";
    out.final_expense.note =
      face > FE_COPY_MAX
        ? "Primas mensuales ilustrativas de compañías designadas comparadas por Mejor Vida Seguros para planes de vida entera. No fumador, buena salud (Nivel/Inmediato) baja. Edades 45–85. Solo educativo — no es cotización vinculante."
        : "Primas mensuales ilustrativas de compañías designadas comparadas por Mejor Vida Seguros para planes de gastos finales / vida entera. No fumador, buena salud (Nivel/Inmediato) baja. Edades 45–85. Solo educativo — no es cotización vinculante.";
  }
  if (out.guaranteed) {
    out.guaranteed.source =
      "Mejor Vida Seguros (compañías designadas)";
    out.guaranteed.rating = "Aceptación garantizada (espera típica de dos años)";
    out.guaranteed.note =
      "Primas mensuales ilustrativas de compañías designadas comparadas por Mejor Vida Seguros para vida entera de aceptación garantizada. Edades 45–85. Solo educativo — no es cotización vinculante.";
  }
  if (out.whole_life_traditional) {
    out.whole_life_traditional.note =
      "Primas mensuales ilustrativas de vida entera tradicional (preferred / no fumador). Solo educativo — no es cotización vinculante.";
  }
  return out;
}

function mainHtml(face, lang, prefix, payload, termMeta) {
  const c = copyFor(face, lang);
  const isEs = lang === "es";
  const m = money(face);
  const quote = `${prefix}quote.html`;
  const termQuote = `${prefix}term-quote.html`;
  const costHub = isEs ? `${prefix}costo-seguro-vida.html` : `${prefix}life-insurance-cost.html`;
  const feCost = isEs ? `${prefix}costo-seguro-gastos-finales.html` : `${prefix}final-expense-cost.html`;
  const wlCost = isEs ? `${prefix}costo-seguro-vida-entera.html` : `${prefix}whole-life-cost.html`;
  const termCost = isEs ? `${prefix}costo-seguro-vida-temporal.html` : `${prefix}term-life-cost.html`;
  const home = isEs ? `${prefix}index.html` : `${prefix}index.html`;
  const estimator = `${prefix}final-expense-estimator.html`;
  const imgP = prefix;

  const feSection =
    c.feLike
      ? `<section class="lic-section" id="rates" data-lic-product="fe" data-lic-face="${face}" data-lic-quote-href="${quote}">
<h2>${c.feTitle}</h2>
<p>${c.feLead}</p>
${rateTable(lang)}
<p>${isEs ? `Ninguna compañía es la más barata para todas las personas. <a href="${quote}">Pida una cotización gratis</a> y Mejor Vida Seguros comparará las opciones designadas.` : `No company is cheapest for everyone. <a href="${quote}">Get a free quote</a> and Mejor Vida Insurance will compare appointed options.`}</p>
</section>`
      : c.jumbo
      ? ""
      : `<section class="lic-section" id="rates" data-lic-product="whole-trad" data-lic-face="${face}" data-lic-quote-href="${quote}">
<h2>${c.wlTitle}</h2>
<p>${c.wlLead}</p>
${rateTable(lang)}
<p>${isEs ? `Estas cifras son muestras educativas. <a href="${quote}">Pida una cotización</a> para ver compañías designadas a su edad y estado.` : `These figures are educational samples. <a href="${quote}">Get a quote</a> to see appointed companies for your age and state.`}</p>
</section>`;

  const giSection =
    face <= GI_MAX
      ? `<section class="lic-section" id="guaranteed" data-lic-product="gi" data-lic-face="${face}" data-lic-quote-href="${quote}">
<h2>${c.giTitle}</h2>
<p>${c.giLead}</p>
${rateTable(lang)}
<p>${isEs ? `Ninguna compañía es la más barata para todas las personas. <a href="${quote}">Pida una cotización gratis</a>.` : `No company is cheapest for everyone. <a href="${quote}">Get a free quote</a>.`}</p>
</section>`
      : c.jumbo
      ? ""
      : `<section class="lic-section" id="guaranteed">
<h2>${c.giTitle}</h2>
<p>${c.giSkip}</p>
</section>`;

  const termFaceAttr = (termMeta && termMeta.face) || Number(Object.keys((payload.tables && payload.tables["10"]) || { 100000: true })[0]);
  const termScaled = !!(termMeta && termMeta.scaled);
  const termLead = c.jumbo
    ? c.termLeadJumbo + (termScaled ? " " + c.termLead3m : "")
    : face >= 100000
      ? c.termLead100
      : face === 75000
        ? c.termLead75
        : c.termLeadSmall;
  const termNote = isEs
    ? termScaled
      ? `Primas mensuales ilustrativas escaladas desde el cuadro designado de $2,000,000 (término a 10 años). No fumador, preferido. Solo educativo — no es cotización vinculante.`
      : `Primas mensuales ilustrativas de compañías designadas de Mejor Vida Seguros para temporal a 10 años de ${money(termFaceAttr)}. No fumador, preferido con suscripción completa. Solo educativo — no es cotización vinculante.`
    : termScaled
      ? `Illustrative monthly premiums scaled from the appointed $2,000,000 10-year term chart. Non-tobacco, preferred. Educational only — not a binding quote.`
      : `Illustrative monthly premiums from appointed companies compared by Mejor Vida Insurance for 10-year term at ${money(termFaceAttr)}. Non-tobacco, preferred, fully underwritten. Educational only — not a binding quote.`;
  const termSection = `<section class="lic-section" id="term" data-lic-product="term" data-lic-term="10" data-lic-face="${termFaceAttr}" data-lic-quote-href="${termQuote}">
<h2>${c.jumbo ? c.termTitleJumbo : c.termTitle}</h2>
<p>${isEs ? "El seguro de vida temporal dura un número fijo de años. Cuando el plazo termina, la cobertura termina — por lo general no hay valor en efectivo." : "Term life lasts a set number of years. When the term ends, coverage ends — there is usually no cash value to take with you."}</p>
<p>${termLead}</p>
${rateTable(lang, false).replace('<p class="lic-rate-note"></p>', `<p class="lic-rate-note">${termNote}</p>`)}
<p>${isEs ? `Vea la <a href="${termCost}">página de costo temporal</a> o empiece una <a href="${termQuote}">cotización de término</a>.` : `See the <a href="${termCost}">term cost page</a> or start a <a href="${termQuote}">term quote</a>.`}</p>
</section>`;

  const cards = c.feLike ? carrierCards(face, lang, prefix) : "";
  const companies = c.feLike
    ? `<section class="lic-section lic-guide" id="companies">
<h2>${c.companiesTitle}</h2>
<p>${c.companiesLead}</p>
<div class="lic-co-grid lic-co-grid--compare">
${cards}
</div>
<p class="lic-co-footnote">${isEs ? `*Prima mensual de muestra para una mujer de 65 años, no fumadora, plan Nivel / Inmediato. Escalada desde cotizaciones de compañías designadas de Mejor Vida Seguros a $5,000 (15 ago. 2026). Los planes escalonados o de emisión garantizada pueden agregar una espera de dos años y costar más. No es una cotización vinculante.` : `*Sample monthly premium for a female, age 65, non-tobacco, Level / Immediate. Scaled from Mejor Vida Insurance appointed-company quotes at $5,000 (Aug. 15, 2026). Graded or guaranteed-issue plans may add a two-year wait and cost more. Not a binding quote.`}</p>
<div class="lic-method">
<h3>${isEs ? "Cómo funciona el score de Mejor Vida Seguros" : "How the Mejor Vida Insurance score works"}</h3>
<p>${isEs ? "El score /5 es el promedio propio de Mejor Vida Seguros de tres datos públicos — no es un ranking de precio ni un respaldo de ninguna agencia:" : "The /5 score is Mejor Vida Insurance’s own average of three public data points — not a price ranking or an endorsement:"}</p>
<ul>
<li>${isEs ? "Solidez financiera AM Best (A++ = 100%, A+ = 95%, A = 90%, y así sucesivamente)" : "AM Best financial strength (A++ = 100%, A+ = 95%, A = 90%, and so on)"}</li>
<li>${isEs ? "Percentil Comdex cuando está publicado" : "Comdex percentile when published"}</li>
<li>${isEs ? "Índice de quejas de la NAIC (menos quejas = porcentaje más alto)" : "NAIC complaint index (fewer complaints = higher percentage)"}</li>
</ul>
<p style="margin-top:0.55rem;">${isEs ? `Vea los resúmenes de compañías designadas en la página de <a href="${prefix}aseguradoras.html">aseguradoras</a>.` : `See appointed-company summaries on the <a href="${prefix}insurance-carriers.html">carriers</a> page.`}</p>
</div>
</section>`
    : `<section class="lic-section lic-guide" id="companies">
<h2>${c.companiesTitle}</h2>
<p>${c.companiesLarge}</p>
</section>`;

  const enoughList = isEs
    ? `<ul class="lic-factor-list">
<li><strong>Cremación directa:</strong> suele ser mucho menor — los promedios de paquetes suelen caer entre unos <strong>$1,500 y $3,000</strong></li>
<li><strong>Cremación con servicio completo:</strong> unos <strong>$5,800–$6,500</strong></li>
<li><strong>Entierro con servicio completo:</strong> unos <strong>$8,200–$8,600</strong></li>
</ul>`
    : `<ul class="lic-factor-list">
<li><strong>Direct cremation:</strong> usually much lower — package averages often fall between about <strong>$1,500 and $3,000</strong></li>
<li><strong>Cremation with a full service:</strong> about <strong>$5,800–$6,500</strong></li>
<li><strong>Burial with a full service:</strong> about <strong>$8,200–$8,600</strong></li>
</ul>`;

  const faq1q = isEs
    ? `¿Necesitaré un examen médico para ${m} de cobertura?`
    : `Will I need a medical exam for ${m} of coverage?`;
  const faq2q = c.jumbo
    ? isEs
      ? `¿Para qué alcanza ${m}?`
      : `What can ${m} cover?`
    : isEs
    ? `¿Alcanzan ${m} para pagar un funeral?`
    : `Is ${m} enough to pay for a funeral?`;
  const faq3q = isEs
    ? `¿Debo comprar temporal o vida entera para ${m}?`
    : `Should I buy term or whole life for ${m}?`;
  const faq4q = isEs
    ? "¿Por qué los hombres pagan más que las mujeres en la tabla?"
    : "Why do men pay more than women in the table?";
  const faq4a = isEs
    ? "En la mayoría de los estados, las aseguradoras cobran más a los hombres porque viven menos años en promedio. Montana exige tarifas unisex en algunos productos, lo que puede cambiar el precio de las mujeres respecto a otros estados."
    : "In most states, insurers charge men more because they live fewer years on average. Montana requires unisex rates on some products, which can change women’s prices versus other states.";
  const faq5q = isEs
    ? "¿Estas primas suben a medida que envejezco?"
    : "Do these premiums go up as I get older?";
  const faq5a = isEs
    ? "En la mayoría de las pólizas niveladas de vida entera, la prima no aumenta después de emitirla si mantiene la póliza en vigor. La edad al emitir sí importa — solicitar más tarde suele significar un precio inicial más alto."
    : "On most level whole-life policies, the premium does not increase after issue if you keep the policy in force. Issue age still matters — applying later usually means a higher starting price.";

  const checks = isEs
    ? `<li>Compare compañías designadas</li>
<li>Vea opciones sin período de espera si califica</li>
<li>Cotización gratis — sin spam</li>`
    : `<li>Compare appointed companies</li>
<li>See no-wait options if you qualify</li>
<li>Free quote — no spam</li>`;

  const asideNote = isEs
    ? "Las cifras de la tabla son muestras educativas, no una oferta vinculante."
    : "Table figures are educational samples, not a binding offer.";
  const cta = isEs ? "Ver precios" : "See prices";
  const updated = isEs ? "Actualizado ago. 2026" : "Updated Aug. 2026";

  return `<main>
<section class="lic-hero">
<div class="lic-hero-media lic-hero-media--horse" aria-hidden="true">
<picture>
<source srcset="${imgP}img/opt/lic-hero-horse-field.webp" type="image/webp"/>
<img src="${imgP}img/opt/lic-hero-horse-field.jpg" alt="" width="1024" height="682" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb"><a href="${home}">${c.crumbHome}</a> › <a href="${costHub}">${c.crumb}</a> › ${m}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.heroLead}</p>
<div class="lic-byline">
<span>${updated}</span>
</div>
</div>
</div>
</section>

<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">

<div class="lic-takeaways">
<h2>${isEs ? "Puntos clave" : "Key takeaways"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
${amountSwitch(face, lang)}
${c.jumbo ? termSection : `${feSection}
${giSection}
${termSection}`}
${companies}

<section class="lic-section lic-guide" id="enough">
<h2>${c.enoughTitle}</h2>
${c.jumbo
  ? `<p>${c.enough} ${isEs ? `Empiece una <a href="${termQuote}">cotización de término</a> para ver compañías designadas a su edad y estado.` : `Start a <a href="${termQuote}">term quote</a> to see appointed companies for your age and state.`}</p>`
  : `<p>${isEs ? "Depende del tipo de servicio que quiera la familia. Usando promedios de paquetes de Funeralocity en los datos de Mejor Vida Seguros (capturados jul. 2026):" : "It depends on the service the family wants. Using Funeralocity package averages in Mejor Vida Insurance’s data (captured Jul. 2026):"}</p>
${enoughList}
<p>${c.enough} ${isEs ? `Use la <a href="${estimator}">calculadora de costos funerarios</a> para un estimado por estado.` : `Use the <a href="${estimator}">funeral cost calculator</a> for a state estimate.`}</p>`}
</section>

<section class="lic-section lic-guide" id="apply">
<h2>${c.applyTitle}</h2>
<ol class="lic-apply-list">
<li><strong>${isEs ? "Empiece una cotización gratis" : "Start a free quote"}</strong> — <a href="${c.jumbo ? termQuote : quote}">${isEs ? "vea precios" : "see prices"}</a> ${isEs ? "con edad, tabaco y algunas preguntas de salud. Mejor Vida Seguros compara compañías designadas por usted." : "with age, tobacco, and a few health questions. Mejor Vida Insurance compares appointed companies for you."}</li>
<li><strong>${isEs ? "Escriba o llame" : "Text or call"}</strong> — ${isEs ? "WhatsApp o teléfono si prefiere hablarlo:" : "WhatsApp or phone if you would rather talk it through:"} <a href="tel:+14024405438">402-440-5438</a>.</li>
<li><strong>${isEs ? "Revise la oferta" : "Review the offer"}</strong> — ${isEs ? "confirme el monto, cualquier período de espera y la prima mensual antes de firmar. Nada en esta página es un contrato." : "confirm the amount, any waiting period, and the monthly premium before you sign. Nothing on this page is a contract."}</li>
</ol>
</section>

<section class="lic-section lic-faq" id="faq">
<h2>${isEs ? "Preguntas frecuentes" : "Frequently asked questions"}</h2>
<details open><summary>${faq1q}</summary><p>${c.faqExam}</p></details>
<details><summary>${faq2q}</summary><p>${c.faqFuneral}</p></details>
<details><summary>${faq3q}</summary><p>${c.faqTerm}</p></details>
<details><summary>${faq4q}</summary><p>${faq4a}</p></details>
<details><summary>${faq5q}</summary><p>${faq5a}</p></details>
</section>

<p class="lic-rate-note">${
    face > FE_COPY_MAX
      ? `<a href="${wlCost}">${isEs ? "Costo de vida entera" : "Whole life cost"}</a> · <a href="${termCost}">${isEs ? "Costo de temporal" : "Term life cost"}</a> · <a href="${costHub}">${isEs ? "Todos los costos de seguro de vida" : "All life insurance costs"}</a>`
      : `<a href="${feCost}">${isEs ? "Costo de gastos finales" : "Final expense cost"}</a> · <a href="${wlCost}">${isEs ? "Costo de vida entera" : "Whole life cost"}</a> · <a href="${costHub}">${isEs ? "Todos los costos de seguro de vida" : "All life insurance costs"}</a>`
  }</p>
</div>

<aside class="lic-aside" aria-label="${isEs ? "Pedir cotización" : "Get a quote"}">
<div class="lic-quote-card">
<div class="lic-quote-card__head">
<strong>${c.quoteCard}</strong>
</div>
<div class="lic-quote-card__body">
<ul class="lic-quote-card__checks">
${checks}
</ul>
<a class="lic-quote-card__cta" href="${quote}">${cta}</a>
<p class="lic-quote-card__note">${asideNote}</p>
</div>
</div>
</aside>
</div>
</main>`;
}

function jsonLd(face, lang) {
  const c = copyFor(face, lang);
  const isEs = lang === "es";
  const url = isEs
    ? `https://www.mejorvidainsurance.com/${esFile(face)}`
    : `https://www.mejorvidainsurance.com/en/${enFile(face)}`;
  const hub = isEs
    ? "https://www.mejorvidainsurance.com/costo-seguro-vida.html"
    : "https://www.mejorvidainsurance.com/en/life-insurance-cost.html";
  const home = isEs
    ? "https://www.mejorvidainsurance.com/"
    : "https://www.mejorvidainsurance.com/en/";
  const m = money(face);
  const faq1q = isEs
    ? `¿Necesitaré un examen médico para ${m} de cobertura?`
    : `Will I need a medical exam for ${m} of coverage?`;
  const faq2q = c.jumbo
    ? isEs
      ? `¿Para qué alcanza ${m}?`
      : `What can ${m} cover?`
    : isEs
    ? `¿Alcanzan ${m} para pagar un funeral?`
    : `Is ${m} enough to pay for a funeral?`;
  const faq3q = isEs
    ? `¿Debo comprar temporal o vida entera para ${m}?`
    : `Should I buy term or whole life for ${m}?`;
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"WebPage","name":"${c.h1.replace(/"/g, '\\"')}","url":"${url}","inLanguage":"${isEs ? "es" : "en"}","isPartOf":{"@type":"WebSite","name":"${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}","url":"https://www.mejorvidainsurance.com/"}},
{"@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"${c.crumbHome}","item":"${home}"},
{"@type":"ListItem","position":2,"name":"${c.crumb}","item":"${hub}"},
{"@type":"ListItem","position":3,"name":"${m}","item":"${url}"}
]},
{"@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"${faq1q.replace(/"/g, '\\"')}","acceptedAnswer":{"@type":"Answer","text":"${c.faqExam.replace(/"/g, '\\"')}"}},
{"@type":"Question","name":"${faq2q.replace(/"/g, '\\"')}","acceptedAnswer":{"@type":"Answer","text":"${c.faqFuneral.replace(/"/g, '\\"')}"}},
{"@type":"Question","name":"${faq3q.replace(/"/g, '\\"')}","acceptedAnswer":{"@type":"Answer","text":"${c.faqTerm.replace(/"/g, '\\"')}"}}
]}
]}
</script>`;
}

function headHtml(face, lang, prefix) {
  const c = copyFor(face, lang);
  const isEs = lang === "es";
  const esUrl = `https://www.mejorvidainsurance.com/${esFile(face)}`;
  const enUrl = `https://www.mejorvidainsurance.com/en/${enFile(face)}`;
  const canonical = isEs ? esUrl : enUrl;
  const cssP = prefix;
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
<meta content="${c.og}" property="og:description"/>
<meta content="${canonical}" property="og:url"/>
<meta content="https://www.mejorvidainsurance.com/img/opt/lic-hero-horse-field.jpg" property="og:image"/>
<meta content="${isEs ? "Mejor Vida Seguros" : "Mejor Vida Insurance"}" property="og:site_name"/>
<meta content="${isEs ? "es_ES" : "en_US"}" property="og:locale"/>
<meta content="${isEs ? "en_US" : "es_ES"}" property="og:locale:alternate"/>
<meta content="summary_large_image" name="twitter:card"/>
<meta content="${c.title}" name="twitter:title"/>
<meta content="${isEs ? "Primas mensuales ilustrativas por edad y sexo. Educativo — no es cotización vinculante." : "Illustrative monthly rates by age and gender. Educational — not a binding quote."}" name="twitter:description"/>
<meta content="https://www.mejorvidainsurance.com/img/opt/lic-hero-horse-field.jpg" name="twitter:image"/>
<link href="${cssP}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${cssP}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${cssP}css/site-footer.css" rel="stylesheet"/>
<link href="${cssP}css/quote-flow-shared.css?v=20260723-mobile-menu" rel="stylesheet"/>
<link href="${cssP}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${cssP}css/nav-life-insurance.css?v=20260817-amounts" rel="stylesheet"/>
<link href="${cssP}css/life-insurance-cost.css?v=20260817-amounts" rel="stylesheet"/>
<link href="${cssP}css/mvi-assistant-widget.css?v=20260721-chat-z" rel="stylesheet"/>
<link href="${cssP}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<style>body { font-family: Inter, system-ui, -apple-system, sans-serif; }</style>
</head>
<body class="lic-page lic-page--amount">`;
}

function extractFooter(samplePath) {
  const text = fs.readFileSync(samplePath, "utf8");
  const m = text.match(/<footer[\s\S]*?<\/footer>/);
  if (!m) throw new Error("footer missing in " + samplePath);
  const after = text.slice(text.indexOf(m[0]) + m[0].length);
  const scripts = after.match(/<script[\s\S]*$/);
  const keep = (scripts ? scripts[0] : "")
    .replace(/<script>window\.MVI_LIC_RATES[\s\S]*?<\/script>\s*/, "")
    .replace(/<script defer src="[^"]*life-insurance-cost\.js[^"]*"><\/script>\s*/, "");
  return m[0] + "\n" + keep.replace(/<\/body>\s*<\/html>\s*$/, "");
}

function headerFor(lang, face) {
  if (lang === "es") {
    let h = fs.readFileSync(ES_HEADER, "utf8");
    h = h.replace(/__PREFIX__/g, "");
    h = h.replace(
      'href="/en/"',
      `href="en/${enFile(face)}"`
    );
    return h.trim();
  }
  let h = fs.readFileSync(EN_HEADER, "utf8");
  h = h.replace(
    'href="../index.html"',
    `href="../${esFile(face)}"`
  );
  return h.trim();
}

function patch5000Switcher() {
  for (const [file, lang, prefix] of [
    [path.join(ROOT, "costo-seguro-vida-5000.html"), "es", ""],
    [path.join(ROOT, "en/5000-life-insurance-cost.html"), "en", "../"],
  ]) {
    let html = fs.readFileSync(file, "utf8");
    if (html.includes("lic-amount-switch")) {
      html = html.replace(
        /<nav class="lic-amount-switch"[\s\S]*?<\/nav>/,
        amountSwitch(5000, lang)
      );
    } else {
      html = html.replace(
        "</ul>\n</div>\n\n<section class=\"lic-section\" id=\"rates\"",
        `</ul>\n</div>\n${amountSwitch(5000, lang)}\n\n<section class="lic-section" id="rates"`
      );
    }
    html = html.replace(
      /css\/nav-life-insurance\.css\?v=[^"]+/,
      "css/nav-life-insurance.css?v=20260817-amounts"
    );
    html = html.replace(
      /css\/life-insurance-cost\.css\?v=[^"]+/,
      "css/life-insurance-cost.css?v=20260817-amounts"
    );
    if (lang === "es") {
      html = html.replace(
        'href="/en/" class="mvi-lang-fab',
        'href="en/5000-life-insurance-cost.html" class="mvi-lang-fab'
      );
    } else {
      html = html.replace(
        'href="../index.html" class="mvi-lang-fab',
        'href="../costo-seguro-vida-5000.html" class="mvi-lang-fab'
      );
    }
    html = html.replace(
      /<picture>\s*<source type="image\/webp" srcset="[^"]*julie-headshot\.webp"\/>\s*<img src="[^"]*julie-headshot\.png"[^>]*\/>\s*<\/picture>\s*/g,
      ""
    );
    if (lang === "es") {
      html = html.replaceAll(
        "en el motor de cotización de Mejor Vida Seguros",
        "de compañías designadas de Mejor Vida Seguros"
      );
      html = html.replaceAll(
        "en el motor de cotización de Mejor Vida",
        "de compañías designadas de Mejor Vida Seguros"
      );
      html = html.replaceAll(
        "del motor de cotización de Mejor Vida Seguros",
        "de Mejor Vida Seguros"
      );
      html = html.replaceAll(
        "La tabla usa el <strong>motor de cotización de Mejor Vida Seguros</strong> (compañías designadas, no fumador, buena salud Nivel/Inmediato). Es educativa — no es una oferta vinculante.",
        "Las tablas muestran <strong>primas mensuales ilustrativas</strong> de compañías designadas comparadas por Mejor Vida Seguros (no fumador, buena salud Nivel/Inmediato). Son educativas — no son una oferta vinculante."
      );
      html = html.replaceAll(
        "Motor de cotización de Mejor Vida (compañías designadas)",
        "Mejor Vida Seguros (compañías designadas)"
      );
      html = html.replaceAll(
        "Primas mensuales ilustrativas del motor de cotización de Mejor Vida Seguros",
        "Primas mensuales ilustrativas de compañías designadas de Mejor Vida Seguros"
      );
    } else {
      html = html.replaceAll(
        "$5,000 Life Insurance Policy Cost (2026 Rates) | Mejor Vida",
        "$5,000 Life Insurance Policy Cost (2026 Rates) | Mejor Vida Insurance"
      );
      html = html.replaceAll(
        "Illustrative monthly rates from Mejor Vida’s quote engine",
        "Illustrative monthly rates from Mejor Vida Insurance"
      );
      html = html.replaceAll(
        "Mejor Vida quote engine — not a binding quote.",
        "Mejor Vida Insurance — not a binding quote."
      );
      html = html.replaceAll(
        "The chart below uses <strong>Mejor Vida’s own quote engine</strong> (appointed carriers, non-tobacco, good-health Level/Immediate). It is educational — not a binding offer.",
        "The tables show <strong>illustrative monthly rates</strong> from appointed companies compared by Mejor Vida Insurance (non-tobacco, good-health Level/Immediate). They are educational — not a binding offer."
      );
      html = html.replaceAll(
        "in Mejor Vida’s quote engine",
        "from appointed companies compared by Mejor Vida Insurance"
      );
      html = html.replaceAll(
        "in Mejor Vida Insurance’s quote engine",
        "from appointed companies compared by Mejor Vida Insurance"
      );
      html = html.replaceAll(
        "from Mejor Vida Insurance’s quote engine",
        "from appointed companies compared by Mejor Vida Insurance"
      );
      html = html.replaceAll(
        "from Mejor Vida’s quote engine",
        "from appointed companies compared by Mejor Vida Insurance"
      );
      html = html.replaceAll(
        "Mejor Vida quote engine (appointed carriers)",
        "Mejor Vida Insurance (appointed companies)"
      );
    }
    fs.writeFileSync(file, html);
  }
}

function hubLinks(lang) {
  const items = AMOUNTS.map((n) => {
    const href = lang === "es" ? esFile(n) : enFile(n);
    return `<a href="${href}">${money(n)}</a>`;
  }).join(" · ");
  if (lang === "es") {
    return `<h2>Costo por monto de cobertura</h2>
<p>Elija un monto. Cada página usa tarifas ilustrativas de compañías designadas de Mejor Vida Seguros y explica, en palabras sencillas, para qué alcanza esa cifra.</p>
<p class="lic-rate-note">${items}</p>`;
  }
  return `<h2>Cost by coverage amount</h2>
<p>Pick an amount. Each page uses illustrative rates from appointed companies compared by Mejor Vida Insurance and explains, in plain language, what that figure can cover.</p>
<p class="lic-rate-note">${items}</p>`;
}

function patchHubs() {
  const esHub = path.join(ROOT, "costo-seguro-vida.html");
  let es = fs.readFileSync(esHub, "utf8");
  es = es.replace(
    /<section class="lic-section" id="por-monto">[\s\S]*?<\/section>/,
    `<section class="lic-section" id="por-monto">
${hubLinks("es")}
</section>`
  );
  fs.writeFileSync(esHub, es);

  const enHub = path.join(ROOT, "en/life-insurance-cost.html");
  let en = fs.readFileSync(enHub, "utf8");
  en = en.replace(
    /<section class="lic-section" id="by-amount">[\s\S]*?<\/section>/,
    `<section class="lic-section" id="by-amount">
${hubLinks("en")}
</section>`
  );
  fs.writeFileSync(enHub, en);
}

function buildPage(face, lang, rates) {
  const prefix = lang === "es" ? "" : "../";
  const termMeta = termChart(face, rates);
  const payload = localizePayload(ratesPayload(face, rates), lang, face);
  const sample =
    lang === "es"
      ? path.join(ROOT, "costo-seguro-vida-5000.html")
      : path.join(ROOT, "en/5000-life-insurance-cost.html");
  const footer = extractFooter(sample);
  const cssRel = lang === "es" ? "" : "../";
  const html = `${headHtml(face, lang, prefix)}
${headerFor(lang, face)}
${mainHtml(face, lang, prefix, payload, termMeta)}
${jsonLd(face, lang)}
${footer}
<script>window.MVI_LIC_RATES = ${JSON.stringify(payload)};</script>
<script defer src="${cssRel}js/life-insurance-cost.js?v=20260817-priced-ages"></script>
</body>
</html>
`;
  const out =
    lang === "es"
      ? path.join(ROOT, esFile(face))
      : path.join(ROOT, "en", enFile(face));
  fs.writeFileSync(out, html);
  return out;
}

function main() {
  const feRaw = expandFeRates(JSON.parse(fs.readFileSync(FE_PATH, "utf8")));
  fs.writeFileSync(FE_PATH, JSON.stringify(feRaw, null, 2) + "\n");

  const wl = JSON.parse(fs.readFileSync(WL_PATH, "utf8"));
  const term = JSON.parse(fs.readFileSync(TERM_PATH, "utf8"));
  const rates = {
    final_expense: feRaw.final_expense,
    guaranteed: feRaw.guaranteed,
    whole_life_traditional: wl.whole_life_traditional,
    term10: (term.tables && term.tables["10"]) || {},
  };

  const written = [];
  for (const face of BUILD_AMOUNTS) {
    written.push(buildPage(face, "es", rates));
    written.push(buildPage(face, "en", rates));
  }
  patch5000Switcher();
  patchHubs();
  console.log("Wrote", written.length, "pages");
  written.forEach((p) => console.log(" ", path.relative(ROOT, p)));
}

main();
