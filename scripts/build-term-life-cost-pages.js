#!/usr/bin/env node
/**
 * Build bilingual term life cost pages + comparison rates from MVI tables.
 *
 *   node scripts/rebuild-term-life-cost-rates.js
 *   node scripts/build-term-life-cost-pages.js
 *
 * Whole-life gaps (ages under the traditional sample) are filled from
 * Assurity Whole Life Protect+ Preferred Plus NT ($10k CSV), fee-aware scaled.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TERM_RATES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "js/term-life-cost-rates.json"), "utf8")
);
const WL_RATES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "js/whole-life-cost-rates.json"), "utf8")
);
const ASSURITY_CSV = path.join(
  ROOT,
  "integrations/knowledge/Assurity_Knowledge/assurity_protect_plus_premiums_10k.csv"
);

const COMPARE_FACES = [100000, 250000, 500000].filter((f) =>
  (TERM_RATES.faces || []).includes(f)
);
const COMPARE_AGES = [20, 25, 30, 35, 40, 45, 50, 55, 60];
const TERM_COMPARE = 10;
/** Assurity Whole Life Protect+ annual policy fee (product guide). */
const ASSURITY_POLICY_FEE_ANNUAL = 65;
const ASSURITY_FEE_MONTHLY = ASSURITY_POLICY_FEE_ANNUAL / 12;
const ASSURITY_FLYER_ANCHOR_AGES = [5, 25, 35, 45];

function moneyLabel(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function findRate(rows, age, sex) {
  if (!rows) return null;
  const hit = rows.find((r) => Number(r.age) === Number(age));
  if (!hit || hit.quote) return null;
  const v = hit[sex];
  return v == null ? null : v;
}

function parseAssurityCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (!lines.length) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const parts = line.split(",");
    const row = {};
    header.forEach((h, i) => {
      row[h] = (parts[i] || "").trim();
    });
    row.age = parseInt(row.age, 10);
    row.monthly = parseFloat(row.monthly);
    return row;
  });
}

/**
 * Preferred Plus NT monthly for $10,000 face (Pay to Age 100).
 * Uses flyer anchors + linear interpolation for ages without a CSV row
 * (same approach as scripts/build-assurity-quote-ranges-from-csv.js).
 */
function loadAssurityProtectPlusNt10k() {
  if (!fs.existsSync(ASSURITY_CSV)) return null;
  const rows = parseAssurityCsv(fs.readFileSync(ASSURITY_CSV, "utf8"));
  const byKey = new Map();
  const flyerAnchors = {};
  for (const r of rows) {
    if (r.uw_class !== "preferred_plus_nt") continue;
    if (!Number.isFinite(r.age) || !Number.isFinite(r.monthly)) continue;
    byKey.set(`${r.sex}:${r.age}`, r.monthly);
    if (String(r.source || "").startsWith("flyer")) {
      flyerAnchors[`${r.sex}:${r.age}`] = r.monthly;
    }
  }

  function interpolate(age, sex) {
    const points = {};
    for (const a of ASSURITY_FLYER_ANCHOR_AGES) {
      const v = flyerAnchors[`${sex}:${a}`];
      if (v != null) points[a] = v;
    }
    const ages = Object.keys(points)
      .map(Number)
      .sort((x, y) => x - y);
    if (!ages.length) return null;
    if (age <= ages[0]) return points[ages[0]];
    if (age >= ages[ages.length - 1]) return points[ages[ages.length - 1]];
    for (let i = 0; i < ages.length - 1; i++) {
      if (age >= ages[i] && age <= ages[i + 1]) {
        const t = (age - ages[i]) / (ages[i + 1] - ages[i]);
        return (
          Math.round(
            (points[ages[i]] + t * (points[ages[i + 1]] - points[ages[i]])) *
              100
          ) / 100
        );
      }
    }
    return points[ages[0]];
  }

  return function monthly10k(age, sex) {
    const hit = byKey.get(`${sex}:${age}`);
    if (hit != null) return hit;
    return interpolate(age, sex);
  };
}

/**
 * Scale Assurity $10k monthly (fee included) to another face.
 * Rate portion scales with face; $65 annual policy fee does not.
 */
function scaleAssurityMonthly(monthly10k, face) {
  if (monthly10k == null || !Number.isFinite(monthly10k)) return null;
  const f = Number(face);
  if (!Number.isFinite(f) || f <= 0) return null;
  const ratePortion = monthly10k - ASSURITY_FEE_MONTHLY;
  if (ratePortion < 0) return null;
  const monthly = ratePortion * (f / 10000) + ASSURITY_FEE_MONTHLY;
  return Math.round(monthly);
}

function buildCompareBundle() {
  const trad = WL_RATES.whole_life_traditional || {};
  const assurity10k = loadAssurityProtectPlusNt10k();
  let filledAssurity = 0;
  const tables = {};
  for (const face of COMPARE_FACES) {
    const termRows = (TERM_RATES.tables[String(TERM_COMPARE)] || {})[String(face)] || [];
    const wholeRows = (trad.tables || {})[String(face)] || [];
    tables[String(face)] = COMPARE_AGES.map((age) => {
      let wholeFemale = findRate(wholeRows, age, "female");
      let wholeMale = findRate(wholeRows, age, "male");
      if (assurity10k) {
        if (wholeFemale == null) {
          const m = scaleAssurityMonthly(assurity10k(age, "female"), face);
          if (m != null) {
            wholeFemale = m;
            filledAssurity += 1;
          }
        }
        if (wholeMale == null) {
          const m = scaleAssurityMonthly(assurity10k(age, "male"), face);
          if (m != null) {
            wholeMale = m;
            filledAssurity += 1;
          }
        }
      }
      return {
        age,
        term_female: findRate(termRows, age, "female"),
        term_male: findRate(termRows, age, "male"),
        whole_female: wholeFemale,
        whole_male: wholeMale,
      };
    });
  }

  const wholeSourceParts = [];
  if (filledAssurity > 0) {
    wholeSourceParts.push(
      "Assurity Whole Life Protect+ Preferred Plus non-tobacco (Pay to Age 100; $10k chart in Assurity_Knowledge, fee-aware scaled with $65 annual policy fee held constant) for ages lacking the traditional sample"
    );
  }
  if (trad.source) wholeSourceParts.push(trad.source);

  return {
    term_years: TERM_COMPARE,
    faces: COMPARE_FACES,
    ages: COMPARE_AGES,
    rating: "Non-tobacco illustrative (educational)",
    as_of: TERM_RATES.as_of,
    note:
      "Illustrative monthly premiums. Term column uses 10-year fully underwritten Preferred Best non-tobacco samples (lowest among MVI-appointed Integrity Connect quotes). Whole life column uses appointed-carrier Protect+ Preferred Plus non-tobacco where ages are available, otherwise the traditional whole-life educational sample on Mejor Vida’s whole-life cost page. Not binding quotes.",
    term_source: TERM_RATES.source,
    whole_source:
      wholeSourceParts.join("; ") ||
      "Mejor Vida whole-life educational sample",
    tables,
  };
}

function termSection(lang, term) {
  const isEs = lang === "es";
  // Prefer the full face list (all six amounts on one chart). Fall back to
  // low+high merge for older rate JSON that only had the split arrays.
  const faces =
    Array.isArray(TERM_RATES.faces) && TERM_RATES.faces.length
      ? TERM_RATES.faces
      : []
          .concat(TERM_RATES.faces_low || [])
          .concat(TERM_RATES.faces_high || []);
  const quoteHref = isEs ? "term-quote.html" : "term-quote.html";
  const h2 = isEs
    ? `Cuadros de tarifas — temporal a ${term} años`
    : `${term}-Year Term Life Insurance Rate Charts`;
  const lead = isEs
    ? `Primas mensuales ilustrativas (no fumador, suscripción completa Preferred Best) para una póliza temporal de ${term} años. Cambie el monto con las pestañas. <strong>No son cotizaciones vinculantes.</strong>`
    : `Illustrative monthly premiums (non-tobacco, fully underwritten Preferred Best) for a ${term}-year term policy. Use the tabs to change the face amount. <strong>Not binding quotes.</strong>`;
  const ageTh = isEs ? "Edad" : "Age";
  const fTh = isEs ? "Mujer" : "Female";
  const mTh = isEs ? "Hombre" : "Male";

  function tabs(faceList, label) {
    if (!faceList.length) return "";
    return (
      `<div class="lic-face-tabs" role="tablist" aria-label="${label}">` +
      faceList
        .map(
          (f, i) =>
            `<button type="button" class="lic-face-tab${i === 0 ? " is-active" : ""}" data-lic-face="${f}" role="tab" aria-selected="${i === 0 ? "true" : "false"}">${moneyLabel(f)}</button>`
        )
        .join("") +
      `</div>`
    );
  }

  let html = `<section class="lic-section" id="term-${term}" data-lic-product="term" data-lic-term="${term}" data-lic-quote-href="${quoteHref}">
<h2>${h2}</h2>
<p>${lead}</p>
`;
  if (faces.length) {
    html += tabs(
      faces,
      isEs ? "Montos de cobertura" : "Coverage amounts"
    );
    html += `<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageTh}</th><th scope="col">${fTh}</th><th scope="col">${mTh}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
`;
  }
  html += `</section>\n`;
  return html;
}

function mainEs(compare) {
  const terms = TERM_RATES.terms || [];
  const chartSections = terms.map((t) => termSection("es", t)).join("\n");
  const faceTabs = compare.faces
    .map(
      (f, i) =>
        `<button type="button" class="lic-face-tab${i === 0 ? " is-active" : ""}" data-lic-compare-face="${f}" role="tab" aria-selected="${i === 0 ? "true" : "false"}">${moneyLabel(f)}</button>`
    )
    .join("");

  return `<main>
<section class="lic-hero">
<div class="lic-hero-media" aria-hidden="true">
<picture>
<source srcset="img/opt/lip-hero-sunrise.webp" type="image/webp"/>
<img src="img/opt/lip-hero-sunrise.jpg" alt="" width="1024" height="682" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb"><a href="index.html">Inicio</a> › <a href="costo-seguro-vida.html">Costo del seguro</a> › Vida temporal</p>
<h1>Costo del seguro de vida temporal por edad</h1>
<p class="lic-hero-lead">La temporal suele ser la opción de <strong>prima mensual más baja</strong> para cubrir un plazo fijo (por ejemplo, años de hipoteca o crianza). El precio varía por edad, sexo, salud, tabaco, monto y duración del plazo. Las tablas son <strong>ilustrativas</strong> — no son cotizaciones vinculantes.</p>
<div class="lic-byline">
<span>Actualizado ago. 2026</span>
</div>
</div>
</div>
</section>

<div class="lic-layout lic-layout--clear">
<div class="lic-main">

<div class="lic-takeaways">
<h2>Puntos clave</h2>
<ul>
<li>La vida temporal suele costar menos por dólar de cobertura que la vida entera para la misma suma asegurada.</li>
<li>Plazos habituales: 10, 20 y 30 años (mostramos solo los plazos con tarifas en nuestras tablas de compañías).</li>
<li>A mayor edad al contratar, monto o plazo, suele subir la prima; el tabaco y la salud también cambian el precio.</li>
<li>Estas cifras son educativas (no fumador). Una cotización personalizada compara varias aseguradoras.</li>
</ul>
</div>

${chartSections}

<section class="lic-section lic-guide" id="como-funciona">
<h2>¿Cómo funciona el seguro de vida temporal?</h2>
<p>La temporal protege durante un <strong>plazo fijo</strong> — por ejemplo 10, 20 o 30 años (u otros plazos si la compañía los ofrece). Si fallece mientras la póliza está vigente y al día, los beneficiarios reciben el beneficio de muerte según el contrato.</p>
<p>Al terminar el plazo, la cobertura suele cesar. Algunas pólizas permiten renovar o convertir a permanente (con nuevas primas). Un rider opcional de <strong>devolución de primas</strong> (return of premium) puede devolver parte o todas las primas al final del plazo si no hubo reclamo — suele encarecer la póliza; no todas las compañías lo ofrecen.</p>
</section>

<section class="lic-section lic-guide" id="factores">
<h2>Qué factores determinan el costo de la vida temporal</h2>
<p>En general, el precio refleja el riesgo que asume la aseguradora. La raza, etnia, orientación sexual, estado civil, puntaje de crédito o nivel educativo <em>no</em> suelen usarse para fijar la prima.</p>
<div class="lic-factor-grid" aria-label="Factores de costo">
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img class="lic-factor-icon-img--wide" src="img/icons/mvi-gender-sexo.png" alt="" width="36" height="36"/></span><div><h3>Sexo</h3><p>En la mayoría de los estados, las mujeres suelen pagar menos que los hombres de la misma edad y perfil.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img src="img/icons/mvi-edad-cake.png" alt="" width="36" height="36"/></span><div><h3>Edad</h3><p>Cotizar más joven suele ser más económico. La edad al <em>emitir</em> mueve el precio.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img src="img/icons/mvi-salud-heart.png" alt="" width="36" height="36"/></span><div><h3>Historial de salud</h3><p>Condiciones, medicamentos y resultados de suscripción pueden subir la prima o limitar opciones.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img src="img/icons/mvi-tabaco-pipe.png" alt="" width="36" height="36"/></span><div><h3>Tabaco / nicotina</h3><p>El cigarrillo suele clasificarle como fumador. Otras formas dependen de cada aseguradora. Estas tablas asumen no fumador.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img class="lic-factor-icon-img--wide" src="img/icons/mvi-cobertura-umbrella.png" alt="" width="36" height="36"/></span><div><h3>Monto y plazo</h3><p>Más cobertura o un plazo más largo suele significar una prima mensual más alta.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img class="lic-factor-icon-img--wide" src="img/icons/mvi-estado-usa.png" alt="" width="36" height="36"/></span><div><h3>Suscripción y riders</h3><p>Examen vs. sin examen, y extras opcionales (p. ej. muerte accidental), cambian el costo.</p></div></div>
</div>
<h3 class="lic-factor-heading">Hábitos de alcohol</h3>
<p>El consumo excesivo o un historial relacionado puede afectar la clasificación. Responder con honestidad en la solicitud protege un reclamo futuro.</p>
<h3 class="lic-factor-heading">Estilo de vida, ocupación y pasatiempos</h3>
<p>Trabajos o aficiones de alto riesgo (aviación privada, escalada extrema, etc.) pueden subir el precio o requerir exclusiones.</p>
<h3 class="lic-factor-heading">Tipo de suscripción</h3>
<p>La suscripción completa (con examen) suele abrir mejores precios por dólar. La emisión simplificada o acelerada (sin examen) es más rápida y a menudo un poco más cara.</p>
<h3 class="lic-factor-heading">Riders (extras opcionales)</h3>
<p>Beneficio acelerado, muerte accidental, cobertura infantil o devolución de primas pueden sumar costo. Elija solo los que encajen con las necesidades de su familia.</p>
</section>

<section class="lic-section" id="temporal-vs-entera" data-lic-product="term-vs-whole" data-lic-quote-href="term-quote.html">
<h2>Tarifas de vida temporal vs. vida entera</h2>
<p>Para la misma suma asegurada, la <strong>temporal</strong> suele costar menos al mes porque cubre un plazo limitado. La <strong>vida entera</strong> es permanente y, en muchos planes, acumula valor en efectivo — por eso la prima suele ser más alta. Abajo, la columna “Temporal” usa tarifas a <strong>10 años</strong> (comparación educativa).</p>
<div class="lic-face-tabs" role="tablist" aria-label="Montos de comparación">${faceTabs}</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table lic-rate-table--compare">
<thead><tr><th scope="col">Perfil</th><th scope="col">Temporal (10 años)</th><th scope="col">Vida entera</th></tr></thead>
<tbody data-lic-compare-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-compare-note></p>
<p class="lic-rate-note"><a href="costo-seguro-vida-entera.html">Ver costo del seguro de vida entera</a> · <a href="term-quote.html">Cotizar temporal</a></p>
</section>

<section class="lic-section lic-guide" id="calificar">
<h2>Cómo calificar y cómo afecta el precio</h2>
<h3 class="lic-factor-heading">Emisión simplificada / suscripción acelerada (sin examen)</h3>
<p>Cuestionario de salud y, a menudo, revisión de recetas o historial de manejo. Sin sangre ni cita paramédica. Suele ser más rápida; el costo por dólar puede ser algo más alto que con examen completo.</p>
<h3 class="lic-factor-heading">Suscripción completa (con examen)</h3>
<p>Incluye más datos (salud, a veces orina/sangre, talla/peso). El proceso tarda más, pero a menudo abre un mejor precio por dólar y montos más altos.</p>
<aside class="lic-callout" aria-label="Importante">
<strong>Importante</strong>
<p>En general <em>no</em> existe un producto de vida temporal de aceptación garantizada (sin preguntas de salud). La aceptación garantizada suele aplicarse a ciertos planes permanentes / de gastos finales, casi siempre con período de espera.</p>
</aside>
</section>

<section class="lic-section lic-faq" id="faq">
<h2>Preguntas frecuentes</h2>
<details open><summary>¿Cuál es el costo promedio de una póliza temporal?</summary><p>Depende de edad, sexo, salud, monto y plazo. En las tablas de esta página (no fumador, suscripción completa Preferred Best), por ejemplo un adulto joven puede ver primas mensuales de un solo dígito o de dos dígitos bajos por $100,000 a 10 años; a mayor edad o monto, la cifra sube. Cotice para su perfil real.</p></details>
<details><summary>¿La prima de la temporal sube con la edad?</summary><p>La edad al <em>contratar</em> sí afecta el precio: emitir más tarde suele costar más. Después de emitida, muchas temporales tienen prima nivelada durante el plazo; no sube solo por cumplir años mientras la póliza esté al día. Al renovar o convertir, la nueva prima suele basarse en la edad actual.</p></details>
<details><summary>¿Es más barata que la vida universal?</summary><p>En muchos casos sí, por dólar de beneficio de muerte puro: la temporal no está diseñada como vehículo de acumulación flexible. La universal / IUL depende del financiamiento y los cargos; puede costar más o comportarse distinto. Compare con una cotización e ilustración reales.</p></details>
<details><summary>¿Qué pasa cuando termina el plazo?</summary><p>La cobertura suele cesar. No hay “devolución” automática de primas salvo que tenga un rider de devolución de primas. Puede quedar sin esa protección o explorar renovación/conversión si el contrato lo permite.</p></details>
<details><summary>Si renuevo o convierto, ¿sube el precio?</summary><p>Casi siempre la nueva prima refleja su edad y salud actuales, así que suele ser más alta que la prima original del plazo que terminó. Conversión a permanente también cambia el tipo de producto y el costo.</p></details>
</section>

<section class="lic-section lic-guide" id="siguiente-paso">
<h2>Siguiente paso</h2>
<p>Compare plazos y montos con una cotización personalizada, o revise también <a href="costo-seguro-vida-entera.html">vida entera</a> y <a href="costo-seguro-gastos-finales.html">gastos finales</a> si la necesidad es permanente.</p>
<p class="lic-rate-note"><a href="term-quote.html">Cotizar vida temporal</a> · <a href="contact.html">Contacto</a> · <a href="costo-seguro-vida.html">Todos los costos</a></p>
</section>

</div>
</div>
</main>`;
}

function mainEn(compare) {
  const terms = TERM_RATES.terms || [];
  const chartSections = terms.map((t) => termSection("en", t)).join("\n");
  const faceTabs = compare.faces
    .map(
      (f, i) =>
        `<button type="button" class="lic-face-tab${i === 0 ? " is-active" : ""}" data-lic-compare-face="${f}" role="tab" aria-selected="${i === 0 ? "true" : "false"}">${moneyLabel(f)}</button>`
    )
    .join("");

  return `<main>
<section class="lic-hero">
<div class="lic-hero-media" aria-hidden="true">
<picture>
<source srcset="../img/opt/lip-hero-sunrise.webp" type="image/webp"/>
<img src="../img/opt/lip-hero-sunrise.jpg" alt="" width="1024" height="682" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb"><a href="index.html">Home</a> › <a href="life-insurance-cost.html">Insurance cost</a> › Term life</p>
<h1>Term life insurance rates by age</h1>
<p class="lic-hero-lead">Term is often the <strong>lowest monthly-cost</strong> option for a set period (for example mortgage or child-raising years). Price varies by age, gender, health, tobacco, face amount, and term length. The tables below are <strong>illustrative</strong> — not binding quotes.</p>
<div class="lic-byline">
<span>Updated Aug. 2026</span>
</div>
</div>
</div>
</section>

<div class="lic-layout lic-layout--clear">
<div class="lic-main">

<div class="lic-takeaways">
<h2>Key takeaways</h2>
<ul>
<li>Term usually costs less per dollar of coverage than whole life for the same face amount.</li>
<li>Common lengths: 10, 20, and 30 years (we only show lengths with rates in our carrier tables).</li>
<li>Older issue age, higher face amount, or longer term usually means a higher premium; tobacco and health matter too.</li>
<li>Figures are educational (non-tobacco). A personalized quote compares multiple carriers.</li>
</ul>
</div>

${chartSections}

<section class="lic-section lic-guide" id="how-it-works">
<h2>How does term life insurance work?</h2>
<p>Term covers you for a <strong>set period</strong> — for example 10, 20, or 30 years (or other lengths a carrier offers). If you die while the policy is in force and premiums are current, beneficiaries receive the death benefit per the contract.</p>
<p>When the term ends, coverage usually stops. Some policies allow renewal or conversion to permanent coverage (at new premiums). An optional <strong>return-of-premium</strong> rider may return some or all premiums at the end of the term if no claim was paid — it typically raises the cost and is not offered by every carrier.</p>
</section>

<section class="lic-section lic-guide" id="factors">
<h2>Which factors determine the cost of term life insurance?</h2>
<p>In general, price reflects the risk the insurer takes. Race, ethnicity, sexual orientation, marital status, credit score, and education level are <em>not</em> typically used to set premiums.</p>
<div class="lic-factor-grid" aria-label="Cost factors">
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img class="lic-factor-icon-img--wide" src="../img/icons/mvi-gender-sexo.png" alt="" width="36" height="36"/></span><div><h3>Gender</h3><p>In most states, women usually pay less than men of the same age and profile.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img src="../img/icons/mvi-edad-cake.png" alt="" width="36" height="36"/></span><div><h3>Age</h3><p>Quoting younger is usually cheaper. Age at <em>issue</em> drives the price.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img src="../img/icons/mvi-salud-heart.png" alt="" width="36" height="36"/></span><div><h3>Health history</h3><p>Conditions, medications, and underwriting results can raise the premium or limit options.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img src="../img/icons/mvi-tabaco-pipe.png" alt="" width="36" height="36"/></span><div><h3>Tobacco / nicotine</h3><p>Cigarettes usually place you in a smoker class. Other forms depend on the carrier. These tables assume non-tobacco.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img class="lic-factor-icon-img--wide" src="../img/icons/mvi-cobertura-umbrella.png" alt="" width="36" height="36"/></span><div><h3>Amount &amp; term length</h3><p>More coverage or a longer term usually means a higher monthly premium.</p></div></div>
<div class="lic-factor-card"><span class="lic-factor-icon" aria-hidden="true"><img class="lic-factor-icon-img--wide" src="../img/icons/mvi-estado-usa.png" alt="" width="36" height="36"/></span><div><h3>Underwriting &amp; riders</h3><p>Exam vs. no-exam paths, plus optional extras (e.g. accidental death), change the cost.</p></div></div>
</div>
<h3 class="lic-factor-heading">Alcohol habits</h3>
<p>Heavy use or related history can affect rating. Honest answers on the application protect a future claim.</p>
<h3 class="lic-factor-heading">Lifestyle, occupation, and hobbies</h3>
<p>High-risk jobs or hobbies (private aviation, extreme climbing, etc.) can raise the price or require exclusions.</p>
<h3 class="lic-factor-heading">Type of underwriting</h3>
<p>Fully underwritten (with exam) often unlocks better cost per dollar. Simplified or accelerated issue (no exam) is faster and often somewhat more expensive.</p>
<h3 class="lic-factor-heading">Policy riders (optional extras)</h3>
<p>Accelerated benefits, accidental death, child coverage, or return of premium can add cost. Choose only riders that clearly fit your family’s needs.</p>
</section>

<section class="lic-section" id="term-vs-whole" data-lic-product="term-vs-whole" data-lic-quote-href="term-quote.html">
<h2>Term life rates vs whole life rates</h2>
<p>For the same face amount, <strong>term</strong> usually costs less each month because it covers a limited period. <strong>Whole life</strong> is permanent and, on many plans, builds cash value — so the premium is usually higher. Below, the “Term” column uses <strong>10-year</strong> rates (educational comparison).</p>
<div class="lic-face-tabs" role="tablist" aria-label="Comparison amounts">${faceTabs}</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table lic-rate-table--compare">
<thead><tr><th scope="col">Profile</th><th scope="col">Term (10-year)</th><th scope="col">Whole life</th></tr></thead>
<tbody data-lic-compare-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-compare-note></p>
<p class="lic-rate-note"><a href="whole-life-cost.html">See whole life insurance cost</a> · <a href="term-quote.html">Get a term quote</a></p>
</section>

<section class="lic-section lic-guide" id="qualify">
<h2>How to qualify — and how it affects cost</h2>
<h3 class="lic-factor-heading">Simplified issue / accelerated underwriting (no exam)</h3>
<p>Health questionnaire and, often, prescription or driving-record checks. No blood draw or paramed visit. Usually faster; cost per dollar can be somewhat higher than fully underwritten coverage.</p>
<h3 class="lic-factor-heading">Fully underwritten (with exam)</h3>
<p>Collects more data (health history, sometimes urine/blood, height/weight). Takes longer, but often unlocks better cost per dollar and higher face amounts.</p>
<aside class="lic-callout" aria-label="Important">
<strong>Important</strong>
<p>There is generally <em>no</em> guaranteed-issue term life product (no health questions). Guaranteed acceptance usually applies to certain permanent / final-expense plans, almost always with a waiting period.</p>
</aside>
</section>

<section class="lic-section lic-faq" id="faq">
<h2>Frequently asked questions</h2>
<details open><summary>What is the average cost of a term life policy?</summary><p>It depends on age, gender, health, face amount, and term length. On this page’s tables (non-tobacco, fully underwritten Preferred Best), a younger adult may see single-digit or low double-digit monthly premiums for $100,000 of 10-year term; older ages or higher faces cost more. Quote for your real profile.</p></details>
<details><summary>Does term life insurance premium increase with age?</summary><p>Age at <em>issue</em> matters: buying later usually costs more. After issue, many term policies keep a level premium for the term length — it does not rise just because you get older while the policy stays in force. Renewal or conversion premiums usually reflect your then-current age.</p></details>
<details><summary>Is term cheaper than universal life?</summary><p>Often yes, per dollar of pure death benefit: term is not designed as a flexible accumulation vehicle. Universal / IUL depends on funding and charges and can cost more or behave differently. Compare with a real quote and illustration.</p></details>
<details><summary>What happens when a term life policy ends?</summary><p>Coverage usually stops. There is no automatic return of premiums unless you have a return-of-premium rider. You may be uninsured for that need, or explore renewal/conversion if the contract allows.</p></details>
<details><summary>If you renew or convert, does the price go up?</summary><p>Almost always the new premium reflects your current age and health, so it is usually higher than the original term premium. Converting to permanent coverage also changes the product type and cost.</p></details>
</section>

<section class="lic-section lic-guide" id="next-step">
<h2>Next step</h2>
<p>Compare term lengths and amounts with a personalized quote, or also review <a href="whole-life-cost.html">whole life</a> and <a href="final-expense-cost.html">final expense</a> if the need is permanent.</p>
<p class="lic-rate-note"><a href="term-quote.html">Get a term quote</a> · <a href="contact.html">Contact</a> · <a href="life-insurance-cost.html">All insurance costs</a></p>
</section>

</div>
</div>
</main>`;
}

function wrapPage(lang, mainHtml, ratesJson, compareJson) {
  const isEs = lang === "es";
  const shellPath = isEs
    ? path.join(ROOT, "costo-seguro-vida-entera.html")
    : path.join(ROOT, "en/whole-life-cost.html");
  const shell = fs.readFileSync(shellPath, "utf8");
  const headMatch = shell.match(/^[\s\S]*?<\/head>/);
  const headerMatch = shell.match(
    /<header class="sticky-top[\s\S]*?<\/header>\s*<div class="mvi-float-stack">[\s\S]*?<\/div>/
  );
  const footerMatch = shell.match(/<footer[\s\S]*<\/html>\s*$/);
  if (!headMatch || !headerMatch || !footerMatch) {
    throw new Error("Could not parse shell for " + lang);
  }

  let head = headMatch[0]
    .replace(
      /<title>[\s\S]*?<\/title>/,
      isEs
        ? "<title>Costo del seguro de vida temporal por edad (2026) | Mejor Vida</title>"
        : "<title>Term Life Insurance Rates by Age (2026) | Mejor Vida</title>"
    )
    .replace(
      /<meta content="[^"]*" name="description"\/>/,
      isEs
        ? '<meta content="Primas ilustrativas de seguro de vida temporal por edad, monto y plazo (10, 20, 30 años). Tablas educativas de Mejor Vida." name="description"/>'
        : '<meta content="Illustrative term life insurance rates by age, face amount, and term length (10, 20, 30 years). Educational charts from Mejor Vida." name="description"/>'
    )
    .replace(
      /<link href="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" rel="canonical"\/>/,
      isEs
        ? '<link href="https://www.mejorvidainsurance.com/costo-seguro-vida-temporal.html" rel="canonical"/>'
        : '<link href="https://www.mejorvidainsurance.com/en/term-life-cost.html" rel="canonical"/>'
    )
    .replace(
      /<link href="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" hreflang="es" rel="alternate"\/>/,
      '<link href="https://www.mejorvidainsurance.com/costo-seguro-vida-temporal.html" hreflang="es" rel="alternate"/>'
    )
    .replace(
      /<link href="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" hreflang="en" rel="alternate"\/>/,
      '<link href="https://www.mejorvidainsurance.com/en/term-life-cost.html" hreflang="en" rel="alternate"/>'
    )
    .replace(
      /<link href="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" hreflang="x-default" rel="alternate"\/>/,
      '<link href="https://www.mejorvidainsurance.com/costo-seguro-vida-temporal.html" hreflang="x-default" rel="alternate"/>'
    )
    .replace(
      /life-insurance-cost\.css\?v=[^"]+/,
      "life-insurance-cost.css?v=20260812-term"
    );

  let header = headerMatch[0];
  if (isEs) {
    header = header.replace(
      /href="\/en\/"/,
      'href="/en/term-life-cost.html"'
    );
  } else {
    header = header.replace(
      /href="\.\.\/index\.html"/,
      'href="../costo-seguro-vida-temporal.html"'
    );
  }

  let footer = footerMatch[0]
    .replace(
      /window\.MVI_LIC_RATES = [\s\S]*?;<\/script>/,
      `window.MVI_LIC_RATES = ${JSON.stringify(ratesJson)};\nwindow.MVI_LIC_COMPARE = ${JSON.stringify(compareJson)};</script>`
    )
    .replace(
      /life-insurance-cost\.js\?v=[^"]+/,
      "life-insurance-cost.js?v=20260812-term"
    );

  // Fix EN script paths (shell already has ../ for en)
  if (!isEs) {
    footer = footer.replace(
      /src="js\//g,
      'src="../js/'
    );
    // avoid double ../
    footer = footer.replace(/src="\.\.\/\.\.\/js\//g, 'src="../js/');
  }

  return (
    "<!DOCTYPE html>\n" +
    (isEs
      ? '<html class="lang-es" lang="es">\n'
      : '<html class="lang-en" lang="en">\n') +
    head +
    '\n<body class="lic-page lic-page--term">\n' +
    header +
    "\n\n\n" +
    mainHtml +
    "\n\n\n" +
    footer
  );
}

function main() {
  const compare = buildCompareBundle();
  fs.writeFileSync(
    path.join(ROOT, "js/term-vs-whole-cost-rates.json"),
    JSON.stringify(compare, null, 2) + "\n"
  );

  const ratesForPage = { ...TERM_RATES };
  const es = wrapPage("es", mainEs(compare), ratesForPage, compare);
  const en = wrapPage("en", mainEn(compare), ratesForPage, compare);

  fs.writeFileSync(path.join(ROOT, "costo-seguro-vida-temporal.html"), es);
  fs.writeFileSync(path.join(ROOT, "en/term-life-cost.html"), en);
  console.log("Wrote costo-seguro-vida-temporal.html");
  console.log("Wrote en/term-life-cost.html");
  console.log(
    "Compare faces:",
    compare.faces.join(","),
    "term years:",
    TERM_RATES.terms.join(",")
  );
}

main();
