#!/usr/bin/env node
/**
 * Build public Americo carrier profiles from the Corebridge HTML shell.
 * Usage: node scripts/build-americo-carrier-pages.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const LOGO_ES = `<picture>
<source type="image/webp" srcset="../img/opt/americo-logo.webp"/>
<img alt="Americo" class="d-inline-block" src="../img/opt/americo-logo.png" width="398" height="128" style="height:56px;width:auto;max-width:100%;" loading="eager" decoding="async"/>
</picture>`;

const LOGO_EN = `<picture>
<source type="image/webp" srcset="../../img/opt/americo-logo.webp"/>
<img alt="Americo" class="d-inline-block" src="../../img/opt/americo-logo.png" width="398" height="128" style="height:56px;width:auto;max-width:100%;" loading="eager" decoding="async"/>
</picture>`;

const BODY_ES = `
<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<div class="text-center mb-4">${LOGO_ES}</div>
<h1 class="h2 fw-bold text-center mb-3" style="color:#1a365d;">Seguro de vida para gastos finales, permanentes y temporales</h1>
<p class="lead text-body-secondary text-center mb-3">Americo Financial Life and Annuity Insurance Company ofrece <strong>vida entera de emisión simplificada</strong> (Eagle Select®), vida entera tradicional (AdvantageWL), temporal e IUL de decisión instantánea, y anualidades fijas — para ayudar a cubrir funeral, deudas y protección familiar.</p>
<p class="text-body-secondary text-center mb-0">Mejor Vida Seguros compara <strong>Eagle Select</strong> y las demás líneas de Americo que puede cotizar, junto con otras aseguradoras designadas, según su edad, salud y presupuesto. Las licencias actuales están en la <a href="../licencias.html">página de licencias</a>.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-4" style="color:#1a365d;">Dónde encaja mejor Americo</h2>
<p class="text-body-secondary mb-3">Americo suele encajar bien para:</p>
<ul class="text-body-secondary mb-0 ps-3">
<li class="mb-2">Adultos de <strong>40 a 85 años</strong> que buscan cobertura permanente de gastos finales sin examen médico (Eagle Select)</li>
<li class="mb-2">Quienes pueden responder preguntas de salud y calificar a un plan <strong>nivelado</strong> (beneficio completo desde la emisión) o a un plan <strong>escalonado</strong> si la salud encaja en el tercer nivel</li>
<li class="mb-2">Fumadores que pueden obtener tarifas de no fumador los <strong>primeros tres años</strong> (Quit Smoking Advantage, niveles 1 y 2)</li>
<li class="mb-2">Familias que necesitan vida entera para niños o adultos (AdvantageWL, edades 0–75) o temporal / IUL de emisión simplificada</li>
<li class="mb-2">Personas que quieren comparar Americo con otras compañías designadas — no es aceptación garantizada</li>
</ul>
</div>
</section>

<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-4" style="color:#1a365d;">Eagle Select® — gastos finales</h2>
<div class="row g-3">
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Niveles 1 y 2 (beneficio nivelado)</h3>
<p class="small fw-semibold text-primary mb-3">Mejor para: beneficio completo desde el día 1 cuando califica</p>
<ul class="mb-0 ps-3 text-body-secondary small">
<li>Vida entera de <strong>emisión simplificada</strong>; edades típicas <strong>40–85</strong> (algunas clases de nicotina del nivel 2 se detienen a los 75)</li>
<li>Montos desde <strong>$5,000</strong>; hasta <strong>$50,000</strong> (40–75) o <strong>$40,000</strong> (76–85)</li>
<li>Sin examen médico; decisión instantánea por solicitud electrónica para quienes califican</li>
<li>Quit Smoking Advantage: los fumadores pueden pagar tarifas de no fumador los años 1–3 (niveles 1–2)</li>
<li>Anexo opcional de muerte accidental y término para hijos/nietos</li>
</ul>
</div>
</div>
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Nivel 3 (beneficio escalonado)</h3>
<p class="small fw-semibold text-primary mb-3">Mejor para: cuando la salud no califica a un plan nivelado</p>
<ul class="mb-0 ps-3 text-body-secondary small">
<li>Edades típicas <strong>40–75</strong>; montos <strong>$5,000–$25,000</strong></li>
<li>Años 1–2 (muerte no accidental): generalmente primas pagadas más interés; año 3 en adelante el valor nominal completo</li>
<li>Muerte accidental puede pagar el valor nominal según la póliza</li>
<li>No incluye Quit Smoking Advantage ni el anexo de beneficio acelerado de los niveles 1–2</li>
</ul>
</div>
</div>
</div>
<p class="small text-muted mt-3 mb-0">Eagle Select <strong>no es aceptación garantizada</strong>. Hay preguntas de salud y revisión de datos. Los productos y anexos no están disponibles en todos los estados.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom" id="more-lines">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-2" style="color:#1a365d;">Otras líneas que Mejor Vida Seguros puede cotizar</h2>
<p class="text-body-secondary mb-4">Estas no son Eagle Select. Cada una cubre una necesidad distinta: más monto de por vida, cobertura temporal o IUL más alta, o ahorros en una anualidad. Mejor Vida Seguros explica las diferencias y cotiza solo lo que encaje.</p>
<div class="row g-3">
<div class="col-12">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">AdvantageWL — vida entera permanente</h3>
<p class="small fw-semibold text-primary mb-3">Mejor para: una póliza de por vida más alta que el típico gasto final, incluso para un niño</p>
<p class="small text-body-secondary mb-3">Es vida entera tradicional: dura toda la vida si se pagan las primas, acumula valor en efectivo y la prima está pensada para no subir después de emitida por edad o cambios de salud.</p>
<ul class="mb-0 ps-3 text-body-secondary small">
<li>Edades de emisión <strong>0–75</strong></li>
<li>Monto mínimo <strong>$15,000</strong> para niños (0–17) y <strong>$25,000</strong> para adultos (18–75)</li>
<li>Suele usarse junto a una hipoteca o como complemento de Eagle Select cuando se necesita más cobertura</li>
<li>Solicitud <strong>en papel</strong> — no usa la app instantánea de Eagle Select ni Instant Decision</li>
<li>Hay preguntas de salud (no es aceptación garantizada). La suscripción suele ser más ágil en montos menores de <strong>$100,000</strong></li>
</ul>
</div>
</div>
<div class="col-12">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Instant Decision Term e IUL</h3>
<p class="small fw-semibold text-primary mb-3">Mejor para: más cobertura que gastos finales, sin examen médico si califica</p>
<p class="small text-body-secondary mb-3">Son productos de <strong>emisión simplificada</strong> con solicitud electrónica y, para muchos solicitantes, una decisión en la misma sesión. No son aceptación garantizada.</p>
<h4 class="h6 fw-bold mb-2">Temporal — ingreso, hipoteca o un número de años</h4>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Montos típicos de <strong>$25,000 a $450,000</strong> (LifeTerm empieza en <strong>$50,000</strong>)</li>
<li><strong>Term 100 / Term 125:</strong> el beneficio se mantiene igual durante el plazo elegido</li>
<li><strong>CBO 50 / CBO 100:</strong> si sobrevive el período de devolución, puede recuperar el 50% o el 100% de las primas base</li>
<li><strong>Continuation 10 / 25:</strong> después del plazo nivelado queda un beneficio permanente más pequeño (10% o 25% del original)</li>
<li><strong>Payment Protector:</strong> cobertura decreciente pensada para un préstamo o una necesidad de ingreso mensual</li>
<li>Beneficios en vida (enfermedad crítica, crónica y terminal) van incluidos en la mayoría de los temporales y en el IUL — no en Payment Protector</li>
</ul>
<h4 class="h6 fw-bold mb-2">IUL de decisión instantánea — permanente</h4>
<ul class="mb-0 ps-3 text-body-secondary small">
<li>Vida universal indexada: cobertura permanente con valor en efectivo con impuestos diferidos. El interés puede acreditarse según cuentas de índice o una cuenta de tasa declarada — <strong>no es una inversión directa en acciones</strong></li>
<li>Edades <strong>18–70</strong>; montos no médicos de <strong>$50,000</strong> a <strong>$450,000</strong> para quienes califican</li>
<li>Anexos de beneficio en vida incluidos en este producto, sin prima extra de anexo</li>
</ul>
</div>
</div>
<div class="col-12">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Anualidades — Elite 5 y Platinum Assure</h3>
<p class="small fw-semibold text-primary mb-3">Mejor para: ahorros que se dejan crecer con impuestos diferidos por un período — no es un seguro de vida ni un funeral prepagado</p>
<p class="small text-body-secondary mb-3">Una anualidad es un contrato aparte: usted aporta una <strong>prima única</strong> y Americo acredita interés. No paga un beneficio por fallecimiento como Eagle Select. Antes de emitirla se exige un cuestionario de <strong>idoneidad</strong> — el producto debe encajar con sus metas, plazo y necesidad de acceder al dinero. Las tasas cambian y <strong>no se cotizan aquí</strong> como oferta vigente.</p>
<h4 class="h6 fw-bold mb-2">Platinum Assure Series — tasa garantizada (MYGA)</h4>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>La tasa inicial queda fijada por <strong>2, 3, 4, 5, 6 o 7 años</strong> (usted elige el plazo)</li>
<li>Edades típicas <strong>0–90</strong> (los plazos de 6–7 años suelen detenerse a los 85). Prima mínima aprox. <strong>$25,000</strong> (hasta $1 millón)</li>
<li>Al terminar el período puede retirar el dinero sin cargo de rescate (“walk-away”)</li>
<li>Cada año hay un retiro sin penalidad, incluido el primero (el porcentaje depende del plazo)</li>
<li>Bloqueo de tasa de 45 días después de la cotización</li>
<li>Valor completo de la cuenta al fallecer</li>
<li>Puede aplicar una exención por internación en hogar de ancianos u hospital</li>
</ul>
<h4 class="h6 fw-bold mb-2">Elite 5 — anualidad indexada</h4>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Prima única. El interés puede acreditarse según opciones de índice — <strong>no es una inversión directa en el mercado</strong></li>
<li>Período de 5 años que puede renovarse. Edades típicas <strong>0–90</strong>. Prima mínima aprox. <strong>$10,000</strong> (hasta $1 millón)</li>
<li>El beneficio al fallecer es el valor de acumulación completo</li>
</ul>
<p class="small text-muted mb-0">Características y plazos varían por estado. Mejor Vida Seguros cotiza Elite 5 y Platinum Assure de esta familia — no se mueve dinero hasta revisar si encaja.</p>
</div>
</div>
</div>
</div>
</section>

<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Aspectos destacados (resumen para familias)</h2>
<ul class="text-body-secondary ps-3 mb-4">
<li class="mb-2"><strong>Primas niveladas</strong> en Eagle Select y AdvantageWL — pensadas para no aumentar por edad o cambios de salud después de emitida la póliza (si se pagan a tiempo).</li>
<li class="mb-2"><strong>Sin examen médico</strong> en Eagle Select, term e IUL de decisión instantánea para quienes califican.</li>
<li class="mb-2"><strong>Tres niveles automáticos</strong> en Eagle Select: la compañía asigna el plan según salud; no es un menú que el cliente elige por adelantado.</li>
<li class="mb-2"><strong>Esto es seguro de vida</strong>, no un funeral prepagado. El beneficiario puede usar el beneficio para cualquier propósito.</li>
</ul>
<p class="small text-muted mb-0">Mejor Vida Seguros presenta Americo como una de <strong>varias aseguradoras</strong> que puede comparar — sin presión para un solo producto.</p>
</div>
</section>
`;

const BODY_EN = `
<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<div class="text-center mb-4">${LOGO_EN}</div>
<h1 class="h2 fw-bold text-center mb-3" style="color:#1a365d;">Final expense, permanent, and term life insurance</h1>
<p class="lead text-body-secondary text-center mb-3">Americo Financial Life and Annuity Insurance Company offers <strong>simplified-issue whole life</strong> (Eagle Select®), traditional whole life (AdvantageWL), instant-decision term and IUL, and fixed annuities — to help cover funeral costs, debts, and family protection.</p>
<p class="text-body-secondary text-center mb-0">Mejor Vida Insurance compares <strong>Eagle Select</strong> and the other Americo lines it can quote, along with other appointed companies, based on your age, health, and budget. Current licenses are on the <a href="../licenses.html">licenses</a> page.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-4" style="color:#1a365d;">Where Americo fits best</h2>
<p class="text-body-secondary mb-3">Americo is often a strong fit for:</p>
<ul class="text-body-secondary mb-0 ps-3">
<li class="mb-2">Adults ages <strong>40–85</strong> seeking permanent final-expense coverage with no medical exam (Eagle Select)</li>
<li class="mb-2">Applicants who can answer health questions and may qualify for a <strong>level</strong> plan (full benefit from issue) or a <strong>graded</strong> plan if health fits tier 3</li>
<li class="mb-2">Tobacco users who may receive non-tobacco rates for the <strong>first three years</strong> (Quit Smoking Advantage on tiers 1–2)</li>
<li class="mb-2">Families who need whole life for children or adults (AdvantageWL, ages 0–75) or simplified-issue term / IUL</li>
<li class="mb-2">People who want Americo compared with other appointed companies — this is not guaranteed issue</li>
</ul>
</div>
</section>

<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-4" style="color:#1a365d;">Eagle Select® — final expense</h2>
<div class="row g-3">
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Tiers 1 and 2 (level benefit)</h3>
<p class="small fw-semibold text-primary mb-3">Best for: full face amount from day one when you qualify</p>
<ul class="mb-0 ps-3 text-body-secondary small">
<li><strong>Simplified-issue</strong> whole life; typical ages <strong>40–85</strong> (some tier-2 nicotine classes stop at 75)</li>
<li>Faces from <strong>$5,000</strong>; up to <strong>$50,000</strong> (ages 40–75) or <strong>$40,000</strong> (76–85)</li>
<li>No medical exam; instant e-application decision for many who qualify</li>
<li>Quit Smoking Advantage: tobacco users may pay non-tobacco rates in years 1–3 (tiers 1–2)</li>
<li>Optional accidental death rider and child/grandchild term rider</li>
</ul>
</div>
</div>
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Tier 3 (graded benefit)</h3>
<p class="small fw-semibold text-primary mb-3">Best for: when health does not qualify for a level plan</p>
<ul class="mb-0 ps-3 text-body-secondary small">
<li>Typical ages <strong>40–75</strong>; faces <strong>$5,000–$25,000</strong></li>
<li>Years 1–2 (non-accidental death): generally premiums paid plus interest; full face from year 3</li>
<li>Accidental death can pay the face amount per the policy</li>
<li>No Quit Smoking Advantage and no accelerated-benefit rider from tiers 1–2</li>
</ul>
</div>
</div>
</div>
<p class="small text-muted mt-3 mb-0">Eagle Select is <strong>not guaranteed issue</strong>. There are health questions and data checks. Products and riders are not available in every state.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom" id="more-lines">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-2" style="color:#1a365d;">Other lines Mejor Vida Insurance can quote</h2>
<p class="text-body-secondary mb-4">These are not Eagle Select. Each one solves a different need: a larger lifelong policy, higher-amount term or IUL, or savings in an annuity. Mejor Vida Insurance explains the differences and quotes only what fits.</p>
<div class="row g-3">
<div class="col-12">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">AdvantageWL — permanent whole life</h3>
<p class="small fw-semibold text-primary mb-3">Best for: a larger lifelong policy than typical final-expense amounts — including coverage on a child</p>
<p class="small text-body-secondary mb-3">This is traditional whole life: it stays in force for life if premiums are paid, builds cash value, and the premium is designed not to rise after issue for age or health changes.</p>
<ul class="mb-0 ps-3 text-body-secondary small">
<li>Issue ages <strong>0–75</strong></li>
<li>Minimum face <strong>$15,000</strong> for children (ages 0–17) and <strong>$25,000</strong> for adults (18–75)</li>
<li>Often used next to a mortgage, or as a higher-face companion to Eagle Select</li>
<li><strong>Paper application</strong> — not the instant e-app used for Eagle Select and Instant Decision products</li>
<li>There are health questions (not guaranteed issue). Underwriting is typically faster on faces under <strong>$100,000</strong></li>
</ul>
</div>
</div>
<div class="col-12">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Instant Decision Term and IUL</h3>
<p class="small fw-semibold text-primary mb-3">Best for: more coverage than final expense, with no medical exam if you qualify</p>
<p class="small text-body-secondary mb-3">These are <strong>simplified-issue</strong> products with an electronic application and, for many applicants, a same-session decision. They are not guaranteed issue.</p>
<h4 class="h6 fw-bold mb-2">Term — income, a mortgage, or a set number of years</h4>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Typical faces <strong>$25,000–$450,000</strong> (LifeTerm starts at <strong>$50,000</strong>)</li>
<li><strong>Term 100 / Term 125:</strong> the death benefit stays the same for the chosen term period</li>
<li><strong>CBO 50 / CBO 100:</strong> if you outlive the cash-back period, you can receive 50% or 100% of base premiums back</li>
<li><strong>Continuation 10 / 25:</strong> after the level term, a smaller permanent death benefit remains (10% or 25% of the original)</li>
<li><strong>Payment Protector:</strong> decreasing coverage meant to match a loan or a monthly income need</li>
<li>Living benefits (critical, chronic, and terminal illness) are included on most term plans and on IUL — not on Payment Protector</li>
</ul>
<h4 class="h6 fw-bold mb-2">Instant Decision IUL — permanent</h4>
<ul class="mb-0 ps-3 text-body-secondary small">
<li>Indexed universal life: permanent coverage with tax-deferred cash value. Interest can be credited from index accounts or a declared-rate account — <strong>not a direct stock investment</strong></li>
<li>Issue ages <strong>18–70</strong>; non-medical faces from <strong>$50,000</strong> to <strong>$450,000</strong> for those who qualify</li>
<li>Living-benefit riders are included on this product at no extra rider premium</li>
</ul>
</div>
</div>
<div class="col-12">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Annuities — Elite 5 and Platinum Assure</h3>
<p class="small fw-semibold text-primary mb-3">Best for: savings left to grow tax-deferred for a set period — not a life-insurance death benefit and not a prepaid funeral</p>
<p class="small text-body-secondary mb-3">An annuity is a separate contract: you pay a <strong>single premium</strong> and Americo credits interest. It does not pay a death benefit the way Eagle Select does. A <strong>suitability</strong> review is required before issue — the product has to fit the person’s goals, time horizon, and need to access money. Interest rates change and are <strong>not quoted here</strong> as a current offer.</p>
<h4 class="h6 fw-bold mb-2">Platinum Assure Series — guaranteed rate (MYGA)</h4>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>The initial interest rate is locked for <strong>2, 3, 4, 5, 6, or 7 years</strong> (you choose the period)</li>
<li>Typical issue ages <strong>0–90</strong> (6- and 7-year periods usually stop at 85). Minimum premium about <strong>$25,000</strong> (up to $1 million)</li>
<li>When the period ends you can take the money without a surrender charge (“walk-away”)</li>
<li>Each year you can take a penalty-free withdrawal, including year 1 (the percentage depends on the period)</li>
<li>45-day rate lock after the quote</li>
<li>Full account value paid at death</li>
<li>A nursing-home or hospital-confinement waiver may apply</li>
</ul>
<h4 class="h6 fw-bold mb-2">Elite 5 — indexed annuity</h4>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Single premium. Interest can be credited from index options — <strong>not a direct market investment</strong></li>
<li>5-year period that can renew. Typical issue ages <strong>0–90</strong>. Minimum premium about <strong>$10,000</strong> (up to $1 million)</li>
<li>The death benefit is the full accumulation value</li>
</ul>
<p class="small text-muted mb-0">Features and guarantee periods vary by state. Mejor Vida Insurance quotes Elite 5 and Platinum Assure from this family — no money is moved until it is a fit.</p>
</div>
</div>
</div>
</div>
</section>

<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Highlights (family summary)</h2>
<ul class="text-body-secondary ps-3 mb-4">
<li class="mb-2"><strong>Level premiums</strong> on Eagle Select and AdvantageWL — designed not to rise for age or health changes after issue (if paid on time).</li>
<li class="mb-2"><strong>No medical exam</strong> on Eagle Select, Instant Decision Term, and Instant Decision IUL for those who qualify.</li>
<li class="mb-2"><strong>Three automatic tiers</strong> on Eagle Select: the company assigns the plan from health answers; it is not a menu the client picks in advance.</li>
<li class="mb-2"><strong>This is life insurance</strong>, not a prepaid funeral. Beneficiaries may use the benefit for any purpose.</li>
</ul>
<p class="small text-muted mb-0">Mejor Vida Insurance presents Americo as one of <strong>several appointed companies</strong> it can compare — with no pressure toward a single product.</p>
</div>
</section>
`;

function wrapMain(body, lang) {
  const isEs = lang === "es";
  const quote = isEs ? "../quote.html" : "../quote.html";
  const ctaH = isEs ? "¿Listo para comparar Americo?" : "Ready to compare Americo?";
  const ctaP = isEs
    ? "Mejor Vida Seguros puede revisar Eagle Select, AdvantageWL, temporal, IUL y otras opciones designadas — cotización gratuita y sin compromiso."
    : "Mejor Vida Insurance can review Eagle Select, AdvantageWL, term, IUL, and other appointed options — free quote, no obligation.";
  const ctaBtn = isEs ? "Cotización gratuita" : "Free quote";
  const wa = isEs
    ? "https://wa.me/14024405438?text=Hola%2C%20me%20interesa%20obtener%20informaci%C3%B3n%20sobre%20el%20seguro%20de%20gastos%20finales."
    : "https://wa.me/14024405438?text=Hello%2C%20I%20am%20interested%20in%20learning%20about%20final%20expense%20insurance.";
  const waLabel = isEs ? "Contactar por WhatsApp" : "Contact on WhatsApp";
  const note = isEs
    ? `<p class="small text-muted mb-2"><strong>Nota:</strong> Esta página resume información general de marketing sobre productos de Americo Financial Life and Annuity Insurance Company. No sustituye la póliza, cotización ni contrato. Los beneficios, anexos y montos varían por estado y plan. Americo es la única responsable de sus productos.</p>
<p class="small text-muted mb-0">Las licencias actuales de Mejor Vida Seguros están en la <a href="../licencias.html">página de licencias</a>.</p>`
    : `<p class="small text-muted mb-2"><strong>Note:</strong> This page summarizes general marketing information about products of Americo Financial Life and Annuity Insurance Company. It does not replace the policy, quote, or contract. Benefits, riders, and amounts vary by state and plan. Americo is solely responsible for its products.</p>
<p class="small text-muted mb-0">Current Mejor Vida Insurance licenses are on the <a href="../licenses.html">licenses</a> page.</p>`;
  return `<main class="carrier-detail-readability">
${body}
<!-- mvi-carrier-ratings:start -->
<section class="py-5 bg-light border-top border-bottom" id="ratings"></section>
<!-- mvi-carrier-ratings:end -->
<section class="py-5 text-white" style="background:#1a365d;">
<div class="container text-center" style="max-width:60rem;">
<h2 class="h3 fw-bold mb-3">${ctaH}</h2>
<p class="mb-4 text-white-50">${ctaP}</p>
<div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
<a class="btn btn-primary-gold px-4 py-3 rounded fw-bold d-inline-flex align-items-center justify-content-center" href="${quote}"><i class="fas fa-file-invoice-dollar me-2"></i>${ctaBtn}</a>
<a class="btn px-4 py-3 rounded fw-bold d-inline-flex align-items-center justify-content-center" href="${wa}" rel="noopener" style="background:#0b3a7a;border-color:#0b3a7a;color:#fff;" target="_blank"><i class="fab fa-whatsapp me-2"></i><span>${waLabel}</span></a>
</div>
</div>
</section>

<section class="py-4 bg-white">
<div class="container" style="max-width:60rem;">
${note}
</div>
</section>
</main>`;
}

function patchHead(html, lang) {
  if (lang === "es") {
    return html
      .replace(
        /<title>[\s\S]*?<\/title>/,
        "<title>Americo — Seguro de gastos finales y vida (Eagle Select) | Mejor Vida Seguros</title>",
      )
      .replace(
        /<meta content="[^"]*" name="description"\/>/,
        '<meta content="Americo Eagle Select vida entera de emisión simplificada para gastos finales, AdvantageWL, temporal e IUL. Compare con Mejor Vida Seguros." name="description"/>',
      )
      .replaceAll(
        "https://www.mejorvidainsurance.com/carriers/corebridge.html",
        "https://www.mejorvidainsurance.com/carriers/americo.html",
      )
      .replaceAll(
        "https://www.mejorvidainsurance.com/en/carriers/corebridge.html",
        "https://www.mejorvidainsurance.com/en/carriers/americo.html",
      )
      .replace(
        /<meta content="Corebridge — Seguro de gastos finales \| Mejor Vida Seguros" property="og:title"\/>/,
        '<meta content="Americo — Seguro de gastos finales | Mejor Vida Seguros" property="og:title"/>',
      )
      .replace(
        /<meta content="Seguro de vida entera Corebridge \(SimpliNow Legacy y GIWL\) para gastos finales\. Julie en Mejor Vida Seguros\." property="og:description"\/>/,
        '<meta content="Seguro de vida entera Americo Eagle Select para gastos finales. Compare opciones con Mejor Vida Seguros." property="og:description"/>',
      )
      .replace(
        /<meta content="Corebridge — Seguro de gastos finales \| Mejor Vida Seguros" name="twitter:title"\/>/,
        '<meta content="Americo — Seguro de gastos finales | Mejor Vida Seguros" name="twitter:title"/>',
      )
      .replace(
        /<meta content="Seguro de vida entera Corebridge para gastos finales\. Julie revisa SimpliNow Legacy y GIWL en Nebraska\." name="twitter:description"\/>/,
        '<meta content="Americo Eagle Select: vida entera de emisión simplificada para gastos finales. Mejor Vida Seguros compara opciones." name="twitter:description"/>',
      );
  }
  return html
    .replace(
      /<title>[\s\S]*?<\/title>/,
      "<title>Americo — Final Expense and Life Insurance (Eagle Select) | Mejor Vida Insurance LLC</title>",
    )
    .replace(
      /<meta content="[^"]*" name="description"\/>/,
      '<meta content="Americo Eagle Select simplified-issue whole life for final expense, plus AdvantageWL, term, and IUL. Compare with Mejor Vida Insurance." name="description"/>',
    )
    .replaceAll(
      "https://www.mejorvidainsurance.com/en/carriers/corebridge.html",
      "https://www.mejorvidainsurance.com/en/carriers/americo.html",
    )
    .replaceAll(
      "https://www.mejorvidainsurance.com/carriers/corebridge.html",
      "https://www.mejorvidainsurance.com/carriers/americo.html",
    )
    .replace(
      /<meta content="Corebridge — Final Expense Whole Life \| Mejor Vida Insurance LLC" property="og:title"\/>/,
      '<meta content="Americo — Final Expense and Life Insurance | Mejor Vida Insurance LLC" property="og:title"/>',
    )
    .replace(
      /<meta content="Corebridge final expense whole life \(SimpliNow Legacy and GIWL\)\. Julie at Mejor Vida Insurance reviews Nebraska options\." property="og:description"\/>/,
      '<meta content="Americo Eagle Select simplified-issue whole life for final expense. Compare options with Mejor Vida Insurance." property="og:description"/>',
    )
    .replace(
      /<meta content="Corebridge — Final Expense Whole Life \| Mejor Vida Insurance LLC" name="twitter:title"\/>/,
      '<meta content="Americo — Final Expense and Life Insurance | Mejor Vida Insurance LLC" name="twitter:title"/>',
    )
    .replace(
      /<meta content="Corebridge final expense options in Nebraska\. Mejor Vida Insurance compares SimpliNow Legacy and GIWL for your situation\." name="twitter:description"\/>/,
      '<meta content="Americo Eagle Select simplified-issue whole life for final expense. Mejor Vida Insurance compares appointed options." name="twitter:description"/>',
    );
}

function patchJsonLd(html, lang) {
  const isEs = lang === "es";
  const url = isEs
    ? "https://www.mejorvidainsurance.com/carriers/americo.html"
    : "https://www.mejorvidainsurance.com/en/carriers/americo.html";
  const name = isEs ? "Americo" : "Americo";
  html = html.replaceAll("Corebridge Financial", name);
  html = html.replaceAll(
    "Seguro de Vida Entera Corebridge (Gastos Finales)",
    "Seguro de Vida Entera Americo (Eagle Select y más)",
  );
  html = html.replaceAll(
    "Soluciones de vida entera Corebridge para gastos finales: SimpliNow Legacy (nivel o escalonado) y GIWL de aceptación garantizada.",
    "Eagle Select vida entera de emisión simplificada para gastos finales, AdvantageWL, temporal e IUL de Americo.",
  );
  html = html.replaceAll(
    /"url": "https:\/\/www\.mejorvidainsurance\.com\/(?:en\/)?carriers\/corebridge\.html"/g,
    `"url": "${url}"`,
  );
  html = html.replaceAll('"name": "Corebridge Financial"', '"name": "Americo"');
  html = html.replaceAll(
    "Corebridge Final Expense Whole Life",
    "Americo Eagle Select Whole Life",
  );
  html = html.replaceAll(
    "Corebridge final expense: SimpliNow Legacy and Guaranteed Issue Whole Life (GIWL).",
    "Americo Eagle Select simplified-issue whole life for final expense, plus AdvantageWL, term, and IUL.",
  );
  return html;
}

function build(srcRel, destRel, lang, body) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(ROOT, destRel);
  let html = fs.readFileSync(src, "utf8");
  html = patchHead(html, lang);
  html = html.replace(
    /<main class="carrier-detail-readability">[\s\S]*?<\/main>/,
    wrapMain(body, lang),
  );
  html = patchJsonLd(html, lang);
  fs.writeFileSync(dest, html);
  console.log("wrote", destRel);
}

build("carriers/corebridge.html", "carriers/americo.html", "es", BODY_ES);
build("en/carriers/corebridge.html", "en/carriers/americo.html", "en", BODY_EN);
