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

const EX = 'class="mb-0 p-3 rounded-3" style="background:#eef4fb;border-left:4px solid #0D47A1;"';

const BODY_ES = `
<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<div class="text-center mb-4">${LOGO_ES}</div>
<h1 class="h2 fw-bold text-center mb-3" style="color:#1a365d;">Americo, explicado en palabras sencillas</h1>
<p class="lead text-body-secondary text-center mb-3">Americo es una compañía de seguros. Mejor Vida Seguros le ayuda a ver <strong>cuál producto encaja</strong> — si es que alguno encaja — según su edad, salud y presupuesto, y lo compara con otras compañías que también puede cotizar.</p>
<p class="text-body-secondary text-center mb-0">La mayoría de las personas llegan buscando ayuda con el <strong>funeral y las últimas cuentas</strong>. Americo también tiene pólizas más grandes de por vida, cobertura por un número de años y contratos de ahorro llamados anualidades. Las licencias actuales están en la <a href="../licencias.html">página de licencias</a>.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-2" style="color:#1a365d;">Empiece por lo que necesita</h2>
<p class="text-body-secondary mb-4">No tiene que memorizar nombres de productos. Elija la situación que más se parece a la suya y baje a esa sección.</p>
<div class="row g-3">
<div class="col-12 col-md-6">
<a class="text-decoration-none text-reset" href="#funeral">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Funeral y últimas cuentas</h3>
<p class="small text-body-secondary mb-2">Quiere un monto modesto que dure el resto de su vida, para que la familia pague el funeral y deudas pendientes.</p>
<p class="small fw-semibold text-primary mb-0">Vaya a Eagle Select →</p>
</div>
</a>
</div>
<div class="col-12 col-md-6">
<a class="text-decoration-none text-reset" href="#lifelong">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Más cobertura de por vida (incluso un niño)</h3>
<p class="small text-body-secondary mb-2">Necesita más que un funeral típico — por ejemplo una hipoteca, o una póliza que acompañe a un hijo toda la vida.</p>
<p class="small fw-semibold text-primary mb-0">Vaya a AdvantageWL →</p>
</div>
</a>
</div>
<div class="col-12 col-md-6">
<a class="text-decoration-none text-reset" href="#term">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Cobertura por un número de años</h3>
<p class="small text-body-secondary mb-2">Los hijos aún viven en casa, o queda un préstamo. Quiere protección ahora, no necesariamente para siempre.</p>
<p class="small fw-semibold text-primary mb-0">Vaya al seguro temporal →</p>
</div>
</a>
</div>
<div class="col-12 col-md-6">
<a class="text-decoration-none text-reset" href="#iul">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">De por vida, con un bolsillo de ahorro</h3>
<p class="small text-body-secondary mb-2">Quiere cobertura permanente más grande y un valor en efectivo que puede crecer — sin comprar acciones.</p>
<p class="small fw-semibold text-primary mb-0">Vaya al IUL →</p>
</div>
</a>
</div>
<div class="col-12">
<a class="text-decoration-none text-reset" href="#annuity">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Dinero que deja crecer (no es un funeral)</h3>
<p class="small text-body-secondary mb-2">Tiene un depósito único y quiere que Americo acredite interés por un plazo. Esto <strong>no</strong> paga un beneficio por fallecimiento como el seguro de vida.</p>
<p class="small fw-semibold text-primary mb-0">Vaya a las anualidades →</p>
</div>
</a>
</div>
</div>
</div>
</section>

<section class="py-5 bg-white border-bottom" id="funeral">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Eagle Select® — dinero para el funeral y las últimas cuentas</h2>
<p class="text-body-secondary">Esto es <strong>seguro de vida de por vida</strong> (vida entera). Si sigue pagando, la póliza está pensada para durar hasta que usted fallezca. El dinero va a la persona que usted nombre. Esa persona puede usarlo para el funeral, facturas médicas o cualquier otra cosa — <strong>no es un funeral prepagado</strong> en una funeraria concreta.</p>
<p class="text-body-secondary">Usted responde <strong>preguntas de salud</strong>. No hay examen médico. Americo (no usted) asigna el plan según esas respuestas. Edades típicas <strong>40–85</strong>. Montos desde <strong>$5,000</strong> hasta <strong>$50,000</strong> (o <strong>$40,000</strong> si tiene 76–85 años).</p>
<p ${EX}><strong>Ejemplo.</strong> Rosa tiene 72 años. Quiere <strong>$15,000</strong> para que sus hijos no queden con la cuenta del funeral. Si sus respuestas de salud califican al plan de beneficio completo, esos $15,000 pueden pagarse desde el primer día. La prima está pensada para no subir después solo porque Rosa envejece o cambia su salud, si paga a tiempo.</p>
<div class="row g-3 mt-4">
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Beneficio completo desde el día 1 (planes 1 y 2)</h3>
<p class="small fw-semibold text-primary mb-3">Mejor para: cuando la salud califica y la familia necesita el monto completo de inmediato</p>
<p class="small text-body-secondary">Si Americo la coloca aquí, el monto elegido puede pagarse si usted fallece después de emitida la póliza — también en los primeros años, según el contrato.</p>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Edades típicas <strong>40–85</strong> (en algunas clases de nicotina del plan 2, hasta 75)</li>
<li>Hasta <strong>$50,000</strong> (40–75) o <strong>$40,000</strong> (76–85)</li>
<li>Muchas personas reciben una decisión sí/no al solicitar en línea</li>
<li>Si usa tabaco, puede pagar el precio de no fumador los <strong>primeros 3 años</strong> (Quit Smoking Advantage, planes 1 y 2)</li>
<li>Opcional: extra si la muerte es accidental; cobertura temporal para un hijo o nieto</li>
</ul>
<p class="small mb-0 p-3 rounded-3 bg-white"><strong>Ejemplo.</strong> Un fumador de 64 años califica al plan 1 por $20,000. Los años 1–3 puede pagar como no fumador. Si deja de fumar o no, a partir del año 4 el precio sigue las reglas de fumador del plan.</p>
</div>
</div>
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Pago limitado los primeros 2 años (plan 3)</h3>
<p class="small fw-semibold text-primary mb-3">Mejor para: cuando la salud no califica al beneficio completo, pero Americo aún ofrece cobertura</p>
<p class="small text-body-secondary">Sigue habiendo preguntas de salud. <strong>No</strong> es un “sí automático” para cualquiera.</p>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Edades típicas <strong>40–75</strong>; montos <strong>$5,000–$25,000</strong></li>
<li>Si la muerte no es accidental en los años 1–2, la familia suele recibir las primas pagadas más interés — no el monto completo</li>
<li>Desde el año 3, el monto completo. La muerte accidental puede pagar el monto completo antes, según la póliza</li>
<li>Este plan no incluye el descuento de tabaco ni algunos extras de los planes 1 y 2</li>
</ul>
<p class="small mb-0 p-3 rounded-3 bg-white"><strong>Ejemplo.</strong> Luis queda en el plan 3 por <strong>$10,000</strong>. Si falleciera por enfermedad en el mes 8, la familia en general recuperaría lo pagado más interés. Si falleciera en el año 4, recibirían los $10,000.</p>
</div>
</div>
</div>
<p class="small text-muted mt-3 mb-0">Eagle Select <strong>no acepta a todo el mundo</strong>. Hay preguntas de salud y revisión de datos. Productos y extras no están en todos los estados.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom" id="lifelong">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">AdvantageWL — una póliza más grande que dura toda la vida</h2>
<p class="text-body-secondary">Sigue siendo vida entera: no “vence” a los 80 si se pagan las primas. Acumula valor en efectivo. La prima está pensada para no subir después por edad o cambios de salud. Sirve cuando el funeral típico no alcanza — o cuando quiere cobertura permanente para un niño.</p>
<ul class="text-body-secondary ps-3">
<li>Edades <strong>0–75</strong></li>
<li>Mínimo <strong>$15,000</strong> en niños (0–17) y <strong>$25,000</strong> en adultos (18–75)</li>
<li>Solicitud <strong>en papel</strong> (no la app instantánea de Eagle Select)</li>
<li>Hay preguntas de salud. La revisión suele ser más ágil por debajo de <strong>$100,000</strong></li>
</ul>
<p ${EX}><strong>Ejemplo.</strong> Un padre quiere <strong>$25,000</strong> para su hija de 8 años, para que esa póliza pueda acompañarla de adulta. O un adulto quiere <strong>$75,000</strong> que no desaparezca cuando termine un plazo de 20 años. Eso es AdvantageWL, no Eagle Select.</p>
</div>
</section>

<section class="py-5 bg-white border-bottom" id="term">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Seguro temporal — cobertura por un número de años</h2>
<p class="text-body-secondary">Piense en <strong>alquilar</strong> cobertura mientras más la necesita: pagar la casa, criar hijos, reemplazar un sueldo. Hay preguntas de salud y no hay examen médico si califica. La solicitud suele ser electrónica, con una decisión en la misma sesión para muchos. Montos típicos de <strong>$25,000 a $450,000</strong> (LifeTerm empieza en <strong>$50,000</strong>).</p>
<p ${EX}><strong>Ejemplo.</strong> Le quedan 20 años de hipoteca. Una póliza temporal de <strong>$200,000</strong> podría ayudar a pagarla si usted fallece en esos 20 años. Cuando termina el plazo, esa cobertura suele terminar — salvo que el producto deje un pedazo más pequeño (Continuation, más abajo).</p>
<div class="row g-3 mt-3">
<div class="col-12">
<div class="p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-3">Las variantes, en una frase cada una</h3>
<ul class="mb-0 ps-3 text-body-secondary">
<li class="mb-2"><strong>Term 100 / Term 125:</strong> el monto para la familia se mantiene igual durante el plazo que eligió. (Como un techo fijo sobre la casa.)</li>
<li class="mb-2"><strong>CBO 50 / CBO 100:</strong> si usted <em>sobrevive</em> el período de devolución, Americo puede devolverle el 50% o el 100% de las primas base. Si fallece durante el plazo, la familia sigue recibiendo la cobertura. <em>Ejemplo: pagó 20 años y sigue vivo — puede recuperar parte o todo lo pagado en primas base, como un “me quedé”.</em></li>
<li class="mb-2"><strong>Continuation 10 / 25:</strong> después del plazo alto, queda un beneficio permanente más pequeño (10% o 25% del original). <em>Ejemplo: $200,000 por 20 años, luego $20,000 o $50,000 de por vida.</em></li>
<li class="mb-2"><strong>Payment Protector:</strong> el monto baja con el tiempo, pensado para un préstamo o un ingreso mensual. <em>Ejemplo: el saldo de la hipoteca va bajando; la cobertura también.</em></li>
<li class="mb-0">En la mayoría de estos temporales (no en Payment Protector) hay <strong>beneficios en vida</strong>: si una enfermedad grave, crónica o terminal califica, puede usarse parte del dinero en vida.</li>
</ul>
</div>
</div>
</div>
</div>
</section>

<section class="py-5 bg-light border-bottom" id="iul">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">IUL de decisión instantánea — de por vida, con un bolsillo de ahorro</h2>
<p class="text-body-secondary"><strong>IUL</strong> significa vida universal indexada. Es cobertura permanente (no un plazo de 20 años) más un valor en efectivo con impuestos diferidos. El interés puede acreditarse según una fórmula de índice o una tasa declarada. <strong>Usted no está comprando acciones.</strong> El valor puede variar; no es una cuenta de banco con tasa fija.</p>
<ul class="text-body-secondary ps-3">
<li>Edades <strong>18–70</strong></li>
<li>Montos sin examen médico de <strong>$50,000 a $450,000</strong> si califica</li>
<li>Los beneficios en vida van incluidos en este producto, sin prima extra de anexo</li>
</ul>
<p ${EX}><strong>Ejemplo.</strong> Ana tiene 45 años. Quiere <strong>$150,000</strong> que no venzan a los 65, y un rincón de la póliza que pueda crecer con el tiempo. El IUL puede encajar. Eagle Select no llega a ese monto: su tope suele ser $50,000.</p>
</div>
</section>

<section class="py-5 bg-white border-bottom" id="annuity">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Anualidades — un contrato de ahorro, no un seguro de funeral</h2>
<p class="text-body-secondary">Una anualidad es distinta. Usted aporta una <strong>prima única</strong> y Americo acredita interés. <strong>No</strong> paga un beneficio por fallecimiento como Eagle Select. Antes de emitirla hay un cuestionario de <strong>idoneidad</strong>: el producto debe encajar con sus metas, el tiempo que puede dejar el dinero y si necesitará retirarlo. Las tasas cambian y <strong>no se publican aquí</strong> como oferta vigente. Mejor Vida Seguros cotiza Elite 5 y Platinum Assure de esta familia — no se mueve dinero hasta revisar si encaja.</p>
<div class="row g-3 mt-1">
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Platinum Assure — tasa fija por los años que elija</h3>
<p class="small text-body-secondary">La tasa inicial queda cerrada <strong>2, 3, 4, 5, 6 o 7 años</strong>. Edades típicas <strong>0–90</strong> (los plazos de 6–7 años suelen detenerse a los 85). Mínimo aprox. <strong>$25,000</strong> (hasta $1 millón).</p>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Al terminar el plazo puede retirar sin cargo de rescate</li>
<li>Cada año hay un retiro sin penalidad, incluido el primero (el % depende del plazo)</li>
<li>45 días para conservar la tasa cotizada. Valor completo de la cuenta al fallecer</li>
<li>Puede aplicar una exención por internación en hogar de ancianos u hospital</li>
</ul>
<p class="small mb-0 p-3 rounded-3 bg-white"><strong>Ejemplo.</strong> Tiene <strong>$40,000</strong> en un CD. Quiere una tasa conocida por 5 años y, al final, poder sacar el dinero sin multa. Eso es el tipo de necesidad de Platinum Assure — no un funeral de $15,000.</p>
</div>
</div>
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Elite 5 — el crecimiento puede seguir un índice</h3>
<p class="small text-body-secondary">También es una prima única. El interés puede acreditarse según opciones de índice — <strong>no es invertir en la bolsa</strong>. Plazo de 5 años que puede renovarse. Edades típicas <strong>0–90</strong>. Mínimo aprox. <strong>$10,000</strong> (hasta $1 millón). Al fallecer se paga el valor de acumulación completo.</p>
<p class="small mb-0 p-3 rounded-3 bg-white"><strong>Ejemplo.</strong> Prefiere la chance de un crédito ligado a un índice, a cambio de que la tasa no esté “cerrada” como en Platinum Assure. Sigue siendo un depósito a la aseguradora, no una cuenta de corretaje.</p>
</div>
</div>
</div>
<p class="small text-muted mt-3 mb-0">Características y plazos varían por estado.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué conviene recordar</h2>
<ul class="text-body-secondary ps-3 mb-4">
<li class="mb-2">El dinero del seguro de vida va a su beneficiario en efectivo. No está atado a una funeraria.</li>
<li class="mb-2">En Eagle Select y AdvantageWL, la prima está pensada para no subir después por edad o salud, si se paga a tiempo.</li>
<li class="mb-2">Americo hace preguntas de salud. Nadie está “aceptado de antemano”.</li>
<li class="mb-2">Mejor Vida Seguros compara Americo con <strong>otras compañías</strong> — no hay presión para un solo producto.</li>
</ul>
<p class="small text-muted mb-0">Si no está seguro de cuál recuadro le corresponde, dígale a Mejor Vida Seguros lo que quiere cubrir (funeral, casa, hijos, ahorros). Ellos traducen eso a un producto — o a ninguno, si no encaja.</p>
</div>
</section>
`;

const BODY_EN = `
<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<div class="text-center mb-4">${LOGO_EN}</div>
<h1 class="h2 fw-bold text-center mb-3" style="color:#1a365d;">Americo, explained in plain English</h1>
<p class="lead text-body-secondary text-center mb-3">Americo is an insurance company. Mejor Vida Insurance helps you see <strong>which product fits</strong> — if any — based on your age, health, and budget, and compares it with other companies it can also quote.</p>
<p class="text-body-secondary text-center mb-0">Most people arrive looking for help with a <strong>funeral and last bills</strong>. Americo also has larger lifelong policies, coverage for a set number of years, and savings contracts called annuities. Current licenses are on the <a href="../licenses.html">licenses</a> page.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-2" style="color:#1a365d;">Start with what you need</h2>
<p class="text-body-secondary mb-4">You do not need to memorize product names. Pick the situation that sounds like yours and jump to that section.</p>
<div class="row g-3">
<div class="col-12 col-md-6">
<a class="text-decoration-none text-reset" href="#funeral">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Funeral and last bills</h3>
<p class="small text-body-secondary mb-2">You want a modest amount that lasts the rest of your life so family can pay the funeral and leftover bills.</p>
<p class="small fw-semibold text-primary mb-0">Go to Eagle Select →</p>
</div>
</a>
</div>
<div class="col-12 col-md-6">
<a class="text-decoration-none text-reset" href="#lifelong">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">More lifelong coverage (including a child)</h3>
<p class="small text-body-secondary mb-2">You need more than a typical funeral amount — for example a mortgage, or a policy that can follow a child into adulthood.</p>
<p class="small fw-semibold text-primary mb-0">Go to AdvantageWL →</p>
</div>
</a>
</div>
<div class="col-12 col-md-6">
<a class="text-decoration-none text-reset" href="#term">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Coverage for a set number of years</h3>
<p class="small text-body-secondary mb-2">Kids are still at home, or a loan is still being paid. You want protection now, not necessarily forever.</p>
<p class="small fw-semibold text-primary mb-0">Go to term insurance →</p>
</div>
</a>
</div>
<div class="col-12 col-md-6">
<a class="text-decoration-none text-reset" href="#iul">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Lifelong coverage with a savings pocket</h3>
<p class="small text-body-secondary mb-2">You want larger permanent coverage plus cash value that can grow — without buying stocks.</p>
<p class="small fw-semibold text-primary mb-0">Go to IUL →</p>
</div>
</a>
</div>
<div class="col-12">
<a class="text-decoration-none text-reset" href="#annuity">
<div class="h-100 p-4 rounded-3 border bg-white">
<h3 class="h5 fw-bold mb-2">Money you set aside to grow (not a funeral policy)</h3>
<p class="small text-body-secondary mb-2">You have a one-time deposit and want Americo to credit interest for a period. This does <strong>not</strong> pay a death benefit the way life insurance does.</p>
<p class="small fw-semibold text-primary mb-0">Go to annuities →</p>
</div>
</a>
</div>
</div>
</div>
</section>

<section class="py-5 bg-white border-bottom" id="funeral">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Eagle Select® — money for a funeral and last bills</h2>
<p class="text-body-secondary">This is <strong>lifelong life insurance</strong> (whole life). If you keep paying, the policy is designed to last until you die. The money goes to the person you name. They can use it for a funeral, medical bills, or anything else — it is <strong>not a prepaid funeral</strong> at a specific funeral home.</p>
<p class="text-body-secondary">You answer <strong>health questions</strong>. There is no medical exam. Americo (not you) assigns the plan from those answers. Typical ages <strong>40–85</strong>. Amounts from <strong>$5,000</strong> up to <strong>$50,000</strong> (or <strong>$40,000</strong> if you are 76–85).</p>
<p ${EX}><strong>Example.</strong> Rosa is 72. She wants <strong>$15,000</strong> so her children are not left with the funeral bill. If her health answers qualify for the full-benefit plan, that $15,000 can pay from day one. Her premium is designed not to rise later just because she got older or her health changed, as long as she pays on time.</p>
<div class="row g-3 mt-4">
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Full benefit from day one (plans 1 and 2)</h3>
<p class="small fw-semibold text-primary mb-3">Best for: when health qualifies and the family needs the full amount right away</p>
<p class="small text-body-secondary">If Americo places you here, the amount you chose can pay if you die after the policy is in force — including in the first years, per the contract.</p>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Typical ages <strong>40–85</strong> (some plan-2 nicotine classes stop at 75)</li>
<li>Up to <strong>$50,000</strong> (ages 40–75) or <strong>$40,000</strong> (76–85)</li>
<li>Many people get a yes/no decision while applying online</li>
<li>If you use tobacco, you may pay the non-tobacco price for the <strong>first 3 years</strong> (Quit Smoking Advantage on plans 1 and 2)</li>
<li>Optional: extra payout for accidental death; term coverage for a child or grandchild</li>
</ul>
<p class="small mb-0 p-3 rounded-3 bg-white"><strong>Example.</strong> A 64-year-old who uses tobacco qualifies for plan 1 at $20,000. Years 1–3 they may pay as a non-tobacco user. Starting in year 4, the price follows the plan’s tobacco rules.</p>
</div>
</div>
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Limited payout in the first 2 years (plan 3)</h3>
<p class="small fw-semibold text-primary mb-3">Best for: when health does not qualify for the full benefit, but Americo still offers coverage</p>
<p class="small text-body-secondary">There are still health questions. This is <strong>not</strong> an automatic yes for everyone.</p>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>Typical ages <strong>40–75</strong>; amounts <strong>$5,000–$25,000</strong></li>
<li>If death is not accidental in years 1–2, the family generally gets premiums paid plus interest — not the full amount</li>
<li>From year 3, the full amount. Accidental death can pay the full amount sooner, per the policy</li>
<li>This plan does not include the tobacco discount or some extras from plans 1 and 2</li>
</ul>
<p class="small mb-0 p-3 rounded-3 bg-white"><strong>Example.</strong> Luis is placed on plan 3 for <strong>$10,000</strong>. If he died of illness in month 8, the family would generally get back what was paid plus interest. If he died in year 4, they would get the $10,000.</p>
</div>
</div>
</div>
<p class="small text-muted mt-3 mb-0">Eagle Select does <strong>not</strong> accept everyone. There are health questions and data checks. Products and extras are not available in every state.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom" id="lifelong">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">AdvantageWL — a larger policy that lasts a lifetime</h2>
<p class="text-body-secondary">This is still whole life: it does not “run out” at age 80 if premiums are paid. It builds cash value. The premium is designed not to rise later for age or health changes. Use it when a typical funeral amount is not enough — or when you want permanent coverage on a child.</p>
<ul class="text-body-secondary ps-3">
<li>Ages <strong>0–75</strong></li>
<li>Minimum <strong>$15,000</strong> for children (0–17) and <strong>$25,000</strong> for adults (18–75)</li>
<li><strong>Paper application</strong> (not the instant app used for Eagle Select)</li>
<li>Health questions apply. Review is often quicker under <strong>$100,000</strong></li>
</ul>
<p ${EX}><strong>Example.</strong> A parent wants <strong>$25,000</strong> on an 8-year-old, so the policy can follow her into adulthood. Or an adult wants <strong>$75,000</strong> that does not disappear when a 20-year term ends. That is AdvantageWL, not Eagle Select.</p>
</div>
</section>

<section class="py-5 bg-white border-bottom" id="term">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Term insurance — coverage for a set number of years</h2>
<p class="text-body-secondary">Think of this as <strong>renting</strong> coverage while you need it most: paying off a house, raising kids, replacing a paycheck. There are health questions and no medical exam if you qualify. The application is usually electronic, with a same-session decision for many people. Typical amounts <strong>$25,000–$450,000</strong> (LifeTerm starts at <strong>$50,000</strong>).</p>
<p ${EX}><strong>Example.</strong> You have 20 years left on a mortgage. A <strong>$200,000</strong> term policy could help pay it off if you died during those 20 years. When the term ends, that coverage usually ends — unless the product leaves a smaller leftover piece (Continuation, below).</p>
<div class="row g-3 mt-3">
<div class="col-12">
<div class="p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-3">The flavors, one sentence each</h3>
<ul class="mb-0 ps-3 text-body-secondary">
<li class="mb-2"><strong>Term 100 / Term 125:</strong> the amount for your family stays the same for the years you chose. (Like a fixed roof over the house.)</li>
<li class="mb-2"><strong>CBO 50 / CBO 100:</strong> if you <em>outlive</em> the cash-back period, Americo can return 50% or 100% of the base premiums. If you die during the term, the family still gets the coverage. <em>Example: you paid for 20 years and you are still alive — you can get some or all of those base premiums back, like a “you made it” refund.</em></li>
<li class="mb-2"><strong>Continuation 10 / 25:</strong> after the high-coverage years, a smaller permanent benefit remains (10% or 25% of the original). <em>Example: $200,000 for 20 years, then $20,000 or $50,000 for life.</em></li>
<li class="mb-2"><strong>Payment Protector:</strong> the amount shrinks over time, meant to match a loan or a monthly income need. <em>Example: the mortgage balance is going down, so the coverage goes down too.</em></li>
<li class="mb-0">Most of these term plans (not Payment Protector) include <strong>living benefits</strong>: if a qualifying critical, chronic, or terminal illness occurs, some of the money may be used while you are alive.</li>
</ul>
</div>
</div>
</div>
</div>
</section>

<section class="py-5 bg-light border-bottom" id="iul">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Instant Decision IUL — lifelong coverage with a savings pocket</h2>
<p class="text-body-secondary"><strong>IUL</strong> means indexed universal life. It is permanent coverage (not a 20-year term) plus tax-deferred cash value. Interest can be credited from an index formula or a declared rate. <strong>You are not buying stocks.</strong> The value can vary; it is not a fixed-rate bank account.</p>
<ul class="text-body-secondary ps-3">
<li>Ages <strong>18–70</strong></li>
<li>No-exam amounts from <strong>$50,000 to $450,000</strong> if you qualify</li>
<li>Living benefits are included on this product at no extra rider premium</li>
</ul>
<p ${EX}><strong>Example.</strong> Ana is 45. She wants <strong>$150,000</strong> that does not expire at 65, plus a corner of the policy that can grow over time. IUL can fit. Eagle Select does not reach that size: its cap is usually $50,000.</p>
</div>
</section>

<section class="py-5 bg-white border-bottom" id="annuity">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Annuities — a savings contract, not a funeral policy</h2>
<p class="text-body-secondary">An annuity is different. You pay a <strong>single premium</strong> and Americo credits interest. It does <strong>not</strong> pay a death benefit the way Eagle Select does. A <strong>suitability</strong> review is required first: the product has to fit your goals, how long you can leave the money, and whether you might need to take it out. Interest rates change and are <strong>not quoted here</strong> as a current offer. Mejor Vida Insurance quotes Elite 5 and Platinum Assure from this family — no money is moved until it is a fit.</p>
<div class="row g-3 mt-1">
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Platinum Assure — a locked rate for the years you pick</h3>
<p class="small text-body-secondary">The starting rate is locked for <strong>2, 3, 4, 5, 6, or 7 years</strong>. Typical ages <strong>0–90</strong> (6- and 7-year periods usually stop at 85). Minimum about <strong>$25,000</strong> (up to $1 million).</p>
<ul class="mb-3 ps-3 text-body-secondary small">
<li>When the period ends you can take the money without a surrender charge</li>
<li>Each year you can take a penalty-free withdrawal, including year 1 (the % depends on the period)</li>
<li>45 days to keep the quoted rate. Full account value paid at death</li>
<li>A nursing-home or hospital-confinement waiver may apply</li>
</ul>
<p class="small mb-0 p-3 rounded-3 bg-white"><strong>Example.</strong> You have <strong>$40,000</strong> in a CD. You want a known rate for 5 years and, at the end, the option to take the money without a penalty. That is a Platinum Assure-type need — not a $15,000 funeral policy.</p>
</div>
</div>
<div class="col-12 col-md-6">
<div class="h-100 p-4 rounded-3 border bg-light">
<h3 class="h5 fw-bold mb-2">Elite 5 — growth can follow an index</h3>
<p class="small text-body-secondary">Also a single deposit. Interest can be credited from index options — <strong>not buying the stock market</strong>. A 5-year period that can renew. Typical ages <strong>0–90</strong>. Minimum about <strong>$10,000</strong> (up to $1 million). At death, the full accumulation value is paid.</p>
<p class="small mb-0 p-3 rounded-3 bg-white"><strong>Example.</strong> You would rather have a chance at index-linked interest than a rate locked the way Platinum Assure does. It is still a deposit with the insurance company, not a brokerage account.</p>
</div>
</div>
</div>
<p class="small text-muted mt-3 mb-0">Features and time periods vary by state.</p>
</div>
</section>

<section class="py-5 bg-light border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What to remember</h2>
<ul class="text-body-secondary ps-3 mb-4">
<li class="mb-2">Life-insurance money goes to your beneficiary in cash. It is not tied to a funeral home.</li>
<li class="mb-2">On Eagle Select and AdvantageWL, the premium is designed not to rise later for age or health, if it is paid on time.</li>
<li class="mb-2">Americo asks health questions. Nobody is “already approved.”</li>
<li class="mb-2">Mejor Vida Insurance compares Americo with <strong>other companies</strong> — there is no pressure toward a single product.</li>
</ul>
<p class="small text-muted mb-0">If you are not sure which box you belong in, tell Mejor Vida Insurance what you want covered (funeral, house, children, savings). They translate that into a product — or into none, if it is not a fit.</p>
</div>
</section>
`;

function wrapMain(body, lang) {
  const isEs = lang === "es";
  const quote = isEs ? "../quote.html" : "../quote.html";
  const ctaH = isEs ? "¿Quiere que se lo expliquemos con su situación?" : "Want this walked through for your situation?";
  const ctaP = isEs
    ? "Diga qué quiere cubrir. Mejor Vida Seguros compara Americo con otras opciones — cotización gratuita y sin compromiso."
    : "Tell us what you want covered. Mejor Vida Insurance compares Americo with other options — free quote, no obligation.";
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
        "<title>Americo — Seguro de gastos finales y vida, explicado sencillo | Mejor Vida Seguros</title>",
      )
      .replace(
        /<meta content="[^"]*" name="description"\/>/,
        '<meta content="Americo en lenguaje sencillo: cobertura para funeral, pólizas de por vida, seguro por un plazo y anualidades. Compare con Mejor Vida Seguros." name="description"/>',
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
        '<meta content="Americo — Seguro de gastos finales, explicado sencillo | Mejor Vida Seguros" property="og:title"/>',
      )
      .replace(
        /<meta content="Seguro de vida entera Corebridge \(SimpliNow Legacy y GIWL\) para gastos finales\. Julie en Mejor Vida Seguros\." property="og:description"\/>/,
        '<meta content="Americo explicado sencillo: funeral, de por vida, temporal y anualidades. Compare con Mejor Vida Seguros." property="og:description"/>',
      )
      .replace(
        /<meta content="Corebridge — Seguro de gastos finales \| Mejor Vida Seguros" name="twitter:title"\/>/,
        '<meta content="Americo — Seguro de gastos finales, explicado sencillo | Mejor Vida Seguros" name="twitter:title"/>',
      )
      .replace(
        /<meta content="Seguro de vida entera Corebridge para gastos finales\. Julie revisa SimpliNow Legacy y GIWL en Nebraska\." name="twitter:description"\/>/,
        '<meta content="Americo en lenguaje sencillo. Mejor Vida Seguros compara opciones de funeral, vida y anualidades." name="twitter:description"/>',
      );
  }
  return html
    .replace(
      /<title>[\s\S]*?<\/title>/,
      "<title>Americo — Final Expense and Life Insurance, Explained Simply | Mejor Vida Insurance LLC</title>",
    )
    .replace(
      /<meta content="[^"]*" name="description"\/>/,
      '<meta content="Americo in plain English: funeral coverage, lifelong policies, term insurance, and annuities. Compare with Mejor Vida Insurance." name="description"/>',
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
      '<meta content="Americo — Life Insurance Explained Simply | Mejor Vida Insurance LLC" property="og:title"/>',
    )
    .replace(
      /<meta content="Corebridge final expense whole life \(SimpliNow Legacy and GIWL\)\. Julie at Mejor Vida Insurance reviews Nebraska options\." property="og:description"\/>/,
      '<meta content="Americo in plain English: funeral coverage, lifelong policies, term, and annuities. Compare with Mejor Vida Insurance." property="og:description"/>',
    )
    .replace(
      /<meta content="Corebridge — Final Expense Whole Life \| Mejor Vida Insurance LLC" name="twitter:title"\/>/,
      '<meta content="Americo — Life Insurance Explained Simply | Mejor Vida Insurance LLC" name="twitter:title"/>',
    )
    .replace(
      /<meta content="Corebridge final expense options in Nebraska\. Mejor Vida Insurance compares SimpliNow Legacy and GIWL for your situation\." name="twitter:description"\/>/,
      '<meta content="Americo in plain English. Mejor Vida Insurance compares funeral, life, and annuity options." name="twitter:description"/>',
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
    "Americo, explicado sencillo (Eagle Select y más)",
  );
  html = html.replaceAll(
    "Soluciones de vida entera Corebridge para gastos finales: SimpliNow Legacy (nivel o escalonado) y GIWL de aceptación garantizada.",
    "Americo en lenguaje sencillo: Eagle Select para funeral, AdvantageWL, temporal, IUL y anualidades.",
  );
  html = html.replaceAll(
    /"url": "https:\/\/www\.mejorvidainsurance\.com\/(?:en\/)?carriers\/corebridge\.html"/g,
    `"url": "${url}"`,
  );
  html = html.replaceAll('"name": "Corebridge Financial"', '"name": "Americo"');
  html = html.replaceAll(
    "Corebridge Final Expense Whole Life",
    "Americo Life Insurance Explained Simply",
  );
  html = html.replaceAll(
    "Corebridge final expense: SimpliNow Legacy and Guaranteed Issue Whole Life (GIWL).",
    "Americo in plain English: Eagle Select for funeral costs, plus lifelong, term, IUL, and annuity options.",
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
    () => wrapMain(body, lang),
  );
  html = patchJsonLd(html, lang);
  fs.writeFileSync(dest, html);
  console.log("wrote", destRel);
}

build("carriers/corebridge.html", "carriers/americo.html", "es", BODY_ES);
build("en/carriers/corebridge.html", "en/carriers/americo.html", "en", BODY_EN);
