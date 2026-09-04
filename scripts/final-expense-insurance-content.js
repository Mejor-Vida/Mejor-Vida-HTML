"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");
const {
  LINKS,
  appointedCardsHtml,
  giCardHtml,
  planCompareHtml,
  faqsHtml,
  nextStepBandHtml,
} = require("./preexisting-conditions-content");

function feProductRateBlock(c, quoteHref) {
  return `<div class="lic-product-tabs" data-lic-product="fe" data-lic-quote-href="${quoteHref}">
<div class="lic-face-tabs" role="tablist" aria-label="${c.faceLabel}">
<button type="button" class="lic-face-tab is-active" data-lic-face="5000" role="tab" aria-selected="true">$5,000</button>
<button type="button" class="lic-face-tab" data-lic-face="10000" role="tab" aria-selected="false">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="25000" role="tab" aria-selected="false">$25,000</button>
<button type="button" class="lic-face-tab" data-lic-face="50000" role="tab" aria-selected="false">$50,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${c.ageCol}</th><th scope="col">${c.female}</th><th scope="col">${c.male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note"${c.hideJsRateNote ? " hidden" : ""} data-lic-note></p>
</div>`;
}

function copyFeProduct(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  if (isEs) {
    return {
      title: "Seguro de gastos finales (entierro): cómo funciona (2026) | Mejor Vida Seguros",
      desc: "Qué es el seguro de gastos finales, cómo paga, cuándo hay espera, cuánto cuesta en compañías designadas y cómo cotizar. No es un funeral prepago.",
      h1: "¿Qué es el seguro de gastos finales y cómo ayuda a pagar un funeral?",
      lead: "Es una póliza pequeña de <strong>vida entera</strong> — cobertura que no vence a los 10 o 20 años mientras se pague a tiempo — pensada para funeral, cremación y deudas cortas. “Entierro”, “funeral” y “gastos finales” suelen describir el mismo tipo de contrato. Una condición de salud <strong>no es un “no” automático</strong>. “Sin examen” no es lo mismo que “sin preguntas.”",
      crumbEnd: "Gastos finales",
      take1: "El dinero va en efectivo a la persona que usted nombró, no a una funeraria. El Seguro Social puede pagar $255 una sola vez si se cumplen sus reglas; eso no cubre un sepelio.",
      take2: "Hay tres caminos. Un <strong>plan nivelado</strong> es un contrato de vida entera con preguntas de salud que puede pagar el monto completo desde el primer pago cubierto si la compañía emite. Un <strong>plan gradual o modificado</strong> sigue haciendo preguntas, pero limita ese pago en los primeros años. La <strong>aceptación garantizada</strong> no pregunta. Siempre hay un <strong>período de espera</strong> de unos dos años por muerte natural: el tiempo en que una muerte que no es un accidente puede no pagar el monto completo.",
      take3:
        "Empiece por el cuestionario. La <a href=\"" +
        L.gi +
        "\">aceptación garantizada</a> es el plan B cuando ese cuestionario no puede ofrecer un plan inmediato — no el primer intento para un historial estable.",
      callout: "Diga la edad, el tabaco, los medicamentos y el monto que tiene en mente. Eso decide el producto y el precio — no el anuncio de “sin examen y sin espera.”",
      female: "Mujer",
      male: "Hombre",
      ageCol: "Edad",
      faceLabel: "Montos de gastos finales",
      hideJsRateNote: true,
      coAges: "Edades",
      coAmt: "Monto",
      coWait: "Espera de 2 años",
      coWaitNo: "No, si califica",
      coMooProduct: "Living Promise Nivelado",
      coMooAges: "45–85",
      coMooAmt: "$2,000–$50,000",
      coAetnaProduct: "Accendo Nivelado",
      coAetnaAges: "40–89",
      coAetnaAmt: "$2,000–$50,000; tope $25,000 a los 76–89",
      coTaProduct: "Immediate Solution",
      coTaAges: "Hasta 85",
      coTaAmt: "Desde $1,000; tope según edad (hasta $50,000)",
      coAmericoProduct: "Eagle Select Nivelado",
      coAmericoAges: "40–85",
      coAmericoAmt: "$5,000–$50,000; tope $40,000 a los 76–85",
      coGiProduct: "Aceptación garantizada (GIWL)",
      coGiAges: "50–80",
      coGiAmt: "$5,000–$25,000",
      coGiWait: "Sí (muerte natural)",
      coFoot: "Fichas educativas de compañías designadas. Un plan gradual, modificado o de aceptación garantizada puede añadir una espera. No es cotización vinculante.",
      coGiFoot: "Una póliza de aceptación garantizada por asegurado cada 12 meses; el total de esa compañía no supera $25,000. Educativo — no es cotización vinculante.",
      needH: "La pregunta que la gente trae",
      needP1: "Las familias buscan esta cobertura porque un funeral, el cementerio y deudas pequeñas pueden caer sobre parientes. El <a href=\"https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment\" rel=\"noopener\" target=\"_blank\">Seguro Social</a> puede pagar un único monto de $255 si se cumplen sus reglas. Eso no cubre un sepelio. Medicare es seguro médico; no lo tratamos aquí como un plan funerario.",
      needP2: "El miedo suele ser concreto: “¿Puedo dejar algo para esa factura, o solo me van a vender un plan que espera dos años?” El resto de la página enseña cómo funciona el producto. Los nombres de compañías vienen después.",
      whatH: "Qué está comprando, en palabras simples",
      whatP1: "Usted paga una <strong>prima</strong> — la cuota regular. Si fallece y el contrato está al día, el <strong>beneficiario</strong> (la persona que nombró) recibe el <strong>beneficio de muerte</strong>: el monto del contrato, en efectivo. La <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC</a> describe el seguro de vida así: no es una cuenta de ahorro del gobierno, y las respuestas de salud importan cuando llega el reclamo.",
      whatP2: "Gastos finales es vida entera de monto pequeño. En las compañías que cotizamos el monto suele ir de unos miles hasta unos $50,000, según edad y producto. No sustituye un temporal grande para hipoteca o años de sueldo. Un contrato funerario prepago es otra cosa: un acuerdo con una funeraria. La <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule de la FTC</a> trata de cómo se compran bienes y servicios funerarios.",
      fact1H: "Qué compra",
      fact1P: "Un monto fijo que dura mientras pague a tiempo. El beneficiario decide cómo usarlo: funeral, deudas, viaje de la familia u otra necesidad.",
      fact2H: "Quién cobra",
      fact2P: "La persona que usted nombró. La funeraria no cobra a menos que esa persona decida pagarle, o que la compañía permita enviar parte del cheque allí.",
      fact3H: "Qué no compra",
      fact3P: "No reserva un servicio en una funeraria concreta. No es Medicare. No es el pago de $255 del Seguro Social.",
      howH: "Cómo funciona, en la práctica",
      howP1: "En estos planes pequeños casi nunca hay una cita de laboratorio en el consultorio. Sí hay preguntas, y la compañía suele revisar recetas que usted ya surtió. Un “no” que debió ser “sí” puede retrasar o afectar un reclamo.",
      howP2: "Si la compañía no pregunta nada, no puede pagar $10,000 o $25,000 después de haber cobrado unas pocas cuotas. Por eso el camino al monto completo desde el primer pago es un plan con preguntas que su archivo puede contestar.",
      howP3: "Las compañías que cotizamos venden estos planes a través de un agente licenciado, no como un pedido anónimo por televisión. Mejor Vida Seguros compara más de un cuestionario. No enviamos una sola solicitud a ciegas.",
      pathsH: "Tres caminos, en lenguaje sencillo",
      path1T: "Plan nivelado (a veces lo llaman inmediato, porque el monto completo puede aplicar desde el primer pago)",
      path1: "Hay preguntas. Si la compañía emite, el monto completo puede aplicar por muerte natural cubierta desde el primer pago. Suele ser el precio más bajo por dólar de estos tres. Ejemplos designados: Mutual of Omaha Living Promise Nivelado, edades 45–85, unos $2,000–$50,000; Accendo Nivelado, edades 40–89, con un tope de $25,000 a los 76–89; Transamerica Immediate Solution, hasta 85, desde $1,000 y con un tope que baja con la edad; Americo Eagle Select Nivelado, edades 40–85, $5,000–$50,000 (tope $40,000 a los 76–85). No publicamos una emisión nueva de gastos finales a los 90.",
      path2T: "Plan gradual o modificado",
      path2: "Sigue habiendo preguntas. En los primeros años, una muerte no accidental puede pagar solo una parte del monto o devolver primas según el contrato. En Accendo Modificado, los años 1–2 suelen devolver el 110% de las primas pagadas por muerte no accidental; el monto completo aplica desde el año 3; un accidente cubierto puede pagar entero desde el inicio. Ese diseño emite de 40 a 75, hasta $25,000. Living Promise también tiene un plan gradual (edades 45–80, hasta unos $20,000) que limita el beneficio por muerte natural en los dos primeros años; no mezclamos esa fórmula con la de Accendo.",
      path3T: "Aceptación garantizada",
      path3:
        "No hay preguntas de salud. Dentro de la edad y el monto, el historial médico no cierra la solicitud. Siempre hay espera de unos dos años por muerte no accidental. Ese producto se llama GIWL: vida entera de aceptación garantizada. El que cotizamos es Corebridge, edades 50–80, $5,000–$25,000; en la espera, 110% de las primas pagadas. Vea <a href=\"" +
        L.gi +
        "\">aceptación garantizada</a>.",
      pathsNote: "Ninguna compañía designada que cotizamos ofrece cero preguntas y un beneficio completo por muerte natural desde el día uno. Si un anuncio mezcla las dos cosas, no es un producto que cotizamos.",
      vsH: "Qué cambia entre esos caminos",
      vsCol1: "Nivelado",
      vsCol1Sub: "Preguntas; monto completo si emite",
      vsCol2: "Gradual o modificado",
      vsCol2Sub: "Preguntas; pago limitado al inicio",
      vsCol3: "Aceptación garantizada",
      vsCol3Sub: "Sin preguntas; espera por muerte natural",
      vsR1H: "Preguntas de salud",
      vsR1A: "Sí",
      vsR1B: "Sí",
      vsR1C: "No",
      vsR2H: "Cuándo paga el monto completo (muerte natural)",
      vsR2A: "Desde el primer pago cubierto, si emite",
      vsR2B: "Después de los primeros años del contrato",
      vsR2C: "Después de unos dos años",
      vsR3H: "Montos habituales",
      vsR3A: "Miles hasta unos $50,000, según edad",
      vsR3B: "Suele ser más bajo que el nivelado",
      vsR3C: "$5,000–$25,000 en lo que cotizamos",
      vsR4H: "Precio, en general",
      vsR4A: "El más bajo por dólar de estos tres",
      vsR4B: "En el medio, si ese producto existe para su archivo",
      vsR4C: "Suele ser el más alto: la salud no cambia esa prima",
      vsLearn: "Lea la tabla como un mapa, no como una cotización. El archivo real — fechas, recetas, tabaco — sigue decidiendo.",
      considerH: "Qué ayuda, y qué no",
      considerP: "Contestar el cuestionario suele ser la ventaja: puede abrir más monto, un precio más bajo y sin espera de dos años. El límite es el mismo cuestionario: un evento reciente, tratamiento activo o varias condiciones juntas puede cerrar el plan inmediato. Esperar “hasta estar más sano” solo sube la edad si el diagnóstico ya está estable.",
      considerP2: "En los planes nivelados que cotizamos, la cuota mensual está pensada para no subir con la edad si paga a tiempo. Muchos contratos de vida entera también acumulan un valor en efectivo pequeño; no publicamos esas cifras aquí porque no son el motivo habitual de compra, y cambian por compañía y años en vigor.",
      fitH: "¿Le sirve este camino?",
      fitYesH: "Puede encajar si",
      fitYes1: "Quiere dejar dinero para un funeral o cremación y no tiene suficiente apartado, o no quiere atar ese dinero a una funeraria concreta.",
      fitYes2: "Prefiere una cobertura que no venza a los 10 o 20 años, a un monto más bajo que un temporal grande.",
      fitNoH: "Suele no encajar si",
      fitNo1: "La necesidad es hipoteca o años de ingreso. Entonces compare <a href=\"" + L.term + "\">temporal</a>.",
      fitNo2: "Ya pagó un funeral por adelantado y cubre lo que quiere cubrir, o ya tiene una vida entera del mismo tamaño en vigor.",
      parentH: "Comprar para un padre o una madre",
      parentP: "Los hijos adultos suelen ayudar a comparar precios. Eso está bien. La persona cuya vida se asegura casi siempre tiene que participar: firmar, responder salud y dar consentimiento. Usted puede ser dueño o pagador; el padre o la madre es el asegurado. No oculte historial médico. Nombre beneficiarios claros y dígales dónde está la póliza.",
      applyH: "Cómo solicitar sin atascar un reclamo futuro",
      applyP: "Pida una cotización con edad, tabaco, estado y monto. Responda las preguntas con hechos. La compañía revisa lo que usted dice y lo que ya está en recetas. Luego usted (o el dueño) revisa la prima, el monto y si hay espera, y paga la primera cuota si encaja.",
      applyP2: "Las compañías que cotizamos venden estos planes a través de un agente licenciado. Hablar con la agencia no añade un cargo aparte sobre la prima que fija la aseguradora. Un pedido anónimo por correo o televisión, cuando existe, suele ser aceptación garantizada — más caro por dólar y con espera por muerte natural.",
      claimsH: "Cómo se presenta un reclamo",
      claimsP: "El beneficiario avisa a la aseguradora — o a Mejor Vida Seguros — con el certificado de defunción y el número de póliza. El pago va a la persona nombrada, no automáticamente a la funeraria. Guarde la póliza donde la familia pueda encontrarla.",
      claimsGap: "Algunas familias piden que parte del cheque vaya a una funeraria. Eso depende de la compañía y del beneficiario. No prometemos un número de días de pago, ni que todas las compañías envíen el dinero directo a un funeral.",
      costH: "Cuánto cuesta un plan nivelado si el cuestionario puede emitir",
      costP: "Estas primas mensuales son ilustrativas de gastos finales nivelados, no fumador. Cada celda es la más baja entre las compañías designadas que cotizan ese monto a esa edad — no la tarifa de una sola compañía, ni un rango inventado “de $30 a $100.” Léalas para ver cómo sube el mes con la edad y el monto. Una condición previa puede impedir esa fila: el precio real puede ser más alto, o el producto no emite. $50,000 no está disponible a todas las edades (varios productos bajan el tope después de los 75). La aceptación garantizada, a la misma edad y monto, suele costar más y espera unos dos años por muerte natural. Más detalle en la <a href=\"costo-seguro-gastos-finales.html\">página de costo</a>. No es una oferta.",
      costGap: "Las edades 86–89 todavía se pueden cotizar en una compañía designada, con un tope de $25,000. No mezclamos esa muestra de una sola compañía en esta tabla, porque los demás planes nivelados que cotizamos cortan a los 85.",
      coH: "Compañías designadas (gastos finales)",
      coP: "Fichas educativas. El estado, el tabaco y el historial cambian la oferta. Las licencias actuales están en la página de licencias. Corebridge también cotiza un plan con preguntas (SimpliNow Legacy, edades 50–80, desde $5,000, con un tope que depende de la edad — hasta $35,000 en la versión que puede pagar entero desde el inicio) además de la aceptación garantizada de abajo.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Gastos finales, entierro y funeral son lo mismo?",
      faq1a: "En la práctica, sí: describen la misma clase de vida entera pequeña. El contrato paga efectivo al beneficiario; no reserva un servicio en una funeraria concreta.",
      faq2q: "¿Esto es lo mismo que un funeral prepago?",
      faq2a: "No. El prepago es un contrato con una funeraria. Gastos finales es seguro de vida. La Funeral Rule de la FTC trata de cómo se compran servicios funerarios; no convierte una póliza en un funeral ya pagado.",
      faq3q: "¿Hace falta un examen médico?",
      faq3a: "En los planes que cotizamos, no hay cita de laboratorio en el consultorio. Sí hay preguntas de salud, salvo en aceptación garantizada, que no pregunta y espera unos dos años por muerte natural.",
      faq4q: "¿Una condición previa me manda a espera de dos años?",
      faq4a: "No por sí sola. Lo que cambia es si el cuestionario puede emitir un plan inmediato. Vea la guía de <a href=\"" + L.hub + "\">condiciones preexistentes</a>.",
      faq5q: "¿Hasta qué edad puedo comprar?",
      faq5a: "Depende del producto. Living Promise Nivelado emite de 45 a 85. Accendo Nivelado puede emitir hasta 89 (tope $25,000 a los 76–89). Immediate Solution llega a 85. Eagle Select Nivelado llega a 85; algunos diseños con tabaco o con beneficio limitado cortan antes, a menudo a los 75. La aceptación garantizada que cotizamos suele cortar a los 80. No publicamos una emisión nueva a los 90.",
      faq6q: "¿El beneficiario paga impuestos sobre el dinero?",
      faq6a: "El IRS indica que, en general, el beneficio por fallecimiento no entra en el ingreso bruto del beneficiario. Los intereses sí pueden ser gravables. No es asesoría fiscal: un contador revisa patrimonios grandes u otros bienes.",
      faq7q: "¿El temporal sirve para el funeral?",
      faq7a: "Suele ser un mal encaje. El plazo se acaba; el funeral no. Si el temporal termina a los 70 o 75, puede quedarse sin cobertura justo cuando más se necesita un monto para entierro.",
      faq8q: "¿Cuánta cobertura conviene?",
      faq8a: "Un funeral sencillo a menudo está cerca de $10,000 a $25,000, pero el precio real lo pone la funeraria, no esta página. Sume deudas pequeñas o viajes de la familia si quiere margen. La tabla de primas es ilustrativa; la cotización confirma el monto.",
      faq9q: "¿Puedo comprar para un padre?",
      faq9a: "Puede ayudar a comparar y puede ser dueño o pagador. Quien se asegura casi siempre tiene que firmar y responder. Un poder notarial no sustituye esas respuestas de salud.",
      faq10q: "¿El Seguro Social o Medicare pagan el funeral?",
      faq10a: "El Seguro Social puede pagar $255 una sola vez, si se cumplen sus reglas. Medicare es seguro médico. El efectivo de una póliza de vida es otra cosa.",
      faq11q: "¿Dónde está licenciada Mejor Vida Seguros?",
      faq11a: "Las licencias actuales están en la página de <a href=\"licencias.html\">licencias</a>. Esta página no lista estados.",
      srcTitle: "Fuentes",
      src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: seguro de vida para el consumidor</a> — cómo se compra una póliza y por qué las respuestas de salud importan en un reclamo.',
      src2: '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">SSA: pago único por fallecimiento</a> — un pago de $255, si aplica; no cubre un funeral.',
      src3: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — derechos al contratar un funeral; el seguro de vida no es un contrato funerario prepago.',
      src4: '<a href="https://www.irs.gov/faqs/interest-dividends-other-types-of-income/life-insurance-disability-insurance-proceeds" rel="noopener" target="_blank">IRS: beneficio de seguro de vida</a> — en general no entra en el ingreso bruto del beneficiario; los intereses sí pueden gravarse.',
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no una oferta. Edades, montos y primas cambian por compañía, producto, tabaco y estado. Mejor Vida Seguros LLC es una agencia independiente (NPN 21695431). Los estados con licencia actual están en <a href=\"licencias.html\">licencias</a>.",
      nextH: "Siguiente paso",
      nextLead: "Pida una cotización con su edad, tabaco y medicamentos, o llame a Mejor Vida Seguros.",
      nextMore:
        "Si ya sabe que el cuestionario no va a pasar, vaya a <a href=\"" +
        L.gi +
        "\">aceptación garantizada</a>. Si hay un diagnóstico concreto, vea <a href=\"" +
        L.hub +
        "\">gastos finales con una condición de salud</a>.",
      nextPrimary: "Ver precios",
      nextPrimaryHref: L.quote,
      quoteTitle: "Ver precios",
      quote1: "Compañías designadas",
      quote2: "Según su salud y edad",
      quoteCta: "Ver precios",
    };
  }
  return {
    title: "Final expense insurance (burial insurance): how it works (2026) | Mejor Vida Insurance",
    desc: "What final expense insurance is, how it pays, when there is a wait, what appointed companies cost, and how to quote. It is not a prepaid funeral.",
    h1: "What is final expense insurance, and how does it help pay for a funeral?",
    lead: "It is a small <strong>whole life</strong> policy — coverage that does not end after 10 or 20 years while you pay on time — meant for a funeral, cremation, and short debts. “Burial,” “funeral,” and “final expense” usually describe the same kind of contract. A health condition is <strong>not an automatic no</strong>. “No exam” is not the same as “no questions.”",
    crumbEnd: "Final expense",
    take1: "The money is cash to the person you named, not a funeral home. Social Security may pay $255 one time if its rules are met; that does not cover a funeral.",
    take2: "There are three paths. A <strong>level plan</strong> is a whole life contract with health questions that can pay the full amount from the first covered payment if the company issues. A <strong>graded or modified plan</strong> still asks questions but limits that payment in the early years. <strong>Guaranteed acceptance</strong> asks no questions. It always has a <strong>waiting period</strong> of about two years for natural death — the time when a death that is not an accident may not pay the full amount.",
    take3:
      "Start with the questionnaire. <a href=\"" +
      L.gi +
      "\">Guaranteed acceptance</a> is plan B when that questionnaire cannot offer an immediate plan — not the first try for a stable history.",
    callout: "Give your age, tobacco, medications, and the amount you have in mind. That decides the product and the price — not the “no exam and no waiting period” headline.",
    female: "Female",
    male: "Male",
    ageCol: "Age",
    faceLabel: "Final expense amounts",
    hideJsRateNote: true,
    coAges: "Ages",
    coAmt: "Coverage amount",
    coWait: "2-year wait",
    coWaitNo: "No, if you qualify",
    coMooProduct: "Living Promise Level",
    coMooAges: "45–85",
    coMooAmt: "$2,000–$50,000",
    coAetnaProduct: "Accendo Level",
    coAetnaAges: "40–89",
    coAetnaAmt: "$2,000–$50,000; $25,000 cap at ages 76–89",
    coTaProduct: "Immediate Solution",
    coTaAges: "Through 85",
    coTaAmt: "From $1,000; cap by age (up to $50,000)",
    coAmericoProduct: "Eagle Select Level",
    coAmericoAges: "40–85",
    coAmericoAmt: "$5,000–$50,000; $40,000 cap at ages 76–85",
    coGiProduct: "Guaranteed acceptance (GIWL)",
    coGiAges: "50–80",
    coGiAmt: "$5,000–$25,000",
    coGiWait: "Yes (natural death)",
    coFoot: "Educational cards for appointed companies. A graded, modified, or guaranteed-acceptance plan may add a wait. Not a binding quote.",
    coGiFoot: "One guaranteed-acceptance policy per insured every 12 months; that company’s total does not exceed $25,000. Educational — not a binding quote.",
    needH: "The question people actually bring",
    needP1: "Families shop this coverage because a funeral, the cemetery, and small debts can fall on relatives. <a href=\"https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment\" rel=\"noopener\" target=\"_blank\">Social Security</a> may pay a one-time $255 amount if its rules are met. That does not cover a funeral. Medicare is medical insurance; we do not treat it here as a funeral plan.",
    needP2: "The fear is usually concrete: “Can I leave something for that bill, or will I only be sold a plan that waits two years?” The rest of this page teaches how the product works. Company names come later.",
    whatH: "What you are buying, in plain words",
    whatP1: "You pay a <strong>premium</strong> — the regular bill. If you die and the contract is current, the <strong>beneficiary</strong> (the person you named) receives the <strong>death benefit</strong>: the contract amount, in cash. The <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC</a> describes life insurance this way: it is not a government savings account, and health answers matter at claim time.",
    whatP2: "Final expense is small whole life. At the companies we quote, amounts usually run from a few thousand dollars up to about $50,000, depending on age and product. It does not replace large term coverage for a mortgage or years of income. A prepaid funeral is different: a contract with a funeral home. The <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC Funeral Rule</a> is about how funeral goods and services are sold.",
    fact1H: "What you buy",
    fact1P: "A set amount that lasts while you pay on time. The beneficiary decides how to use it: funeral, debts, family travel, or another need.",
    fact2H: "Who is paid",
    fact2P: "The person you named. The funeral home is not paid unless that person chooses to pay them, or the company allows part of the check to go there.",
    fact3H: "What you do not buy",
    fact3P: "It does not reserve a service at a specific funeral home. It is not Medicare. It is not Social Security’s $255 payment.",
    howH: "How it works in practice",
    howP1: "On these small plans there is almost never an in-office lab visit. There are questions, and the company usually reviews prescriptions you already filled. A “no” that should have been “yes” can stall or affect a claim.",
    howP2: "If the company asks nothing, it cannot pay $10,000 or $25,000 after collecting a few premiums. That is why the path to a full amount from the first payment is a plan with questions your file can answer.",
    howP3: "The companies we quote sell these plans through a licensed agent, not as an anonymous TV order. Mejor Vida Insurance compares more than one questionnaire. We do not send a single blind application.",
    pathsH: "Three paths, in plain language",
    path1T: "A level plan (sometimes called immediate, because the full amount can apply from the first payment)",
    path1: "There are questions. If the company issues, the full amount can apply for covered natural death from the first payment. It is usually the lowest price per dollar of these three. Appointed examples: Mutual of Omaha Living Promise Level, ages 45–85, about $2,000–$50,000; Accendo Level, ages 40–89, with a $25,000 cap at ages 76–89; Transamerica Immediate Solution, through 85, from $1,000, with a cap that falls with age; Americo Eagle Select Level, ages 40–85, $5,000–$50,000 ($40,000 cap at ages 76–85). We do not publish a new final-expense issue at age 90.",
    path2T: "A graded or modified plan",
    path2: "There are still questions. In the first years, a non-accidental death may pay only part of the amount or return premiums as the contract writes it. On Accendo Modified, years 1–2 typically return 110% of premiums paid for non-accidental death; the full amount applies from year 3; a covered accident can pay in full from the start. That design issues ages 40–75, up to $25,000. Living Promise also has a graded plan (ages 45–80, up to about $20,000) that limits the natural-death benefit in the first two years; we do not mix that formula with Accendo’s.",
    path3T: "Guaranteed acceptance",
    path3:
      "There are no health questions. Within the age and amount, medical history does not close the application. There is always about a two-year wait for non-accidental death. That product is called GIWL: guaranteed-acceptance whole life. The one we quote is Corebridge, ages 50–80, $5,000–$25,000; during the wait, 110% of premiums paid. See <a href=\"" +
      L.gi +
      "\">guaranteed acceptance</a>.",
    pathsNote: "No appointed company we quote offers zero questions and a full natural-death benefit from day one. If an ad combines both, it is not a product we quote.",
    vsH: "What changes across those paths",
    vsCol1: "Level",
    vsCol1Sub: "Questions; full amount if it issues",
    vsCol2: "Graded or modified",
    vsCol2Sub: "Questions; limited pay at first",
    vsCol3: "Guaranteed acceptance",
    vsCol3Sub: "No questions; wait for natural death",
    vsR1H: "Health questions",
    vsR1A: "Yes",
    vsR1B: "Yes",
    vsR1C: "No",
    vsR2H: "When the full amount pays (natural death)",
    vsR2A: "From the first covered payment, if it issues",
    vsR2B: "After the early contract years",
    vsR2C: "After about two years",
    vsR3H: "Typical amounts",
    vsR3A: "Thousands up to about $50,000, by age",
    vsR3B: "Usually lower than the level plan",
    vsR3C: "$5,000–$25,000 on what we quote",
    vsR4H: "Price, in general",
    vsR4A: "Lowest per dollar of these three",
    vsR4B: "In the middle, if that product exists for your file",
    vsR4C: "Usually the highest: health does not change that premium",
    vsLearn: "Read the chart as a map, not a quote. The live file — dates, prescriptions, tobacco — still decides.",
    considerH: "What helps, and what does not",
    considerP: "Answering the questionnaire is usually the advantage: you may open a larger amount, a lower price, and no two-year wait. The limitation is the same questionnaire: a recent event, active treatment, or several conditions together can close the immediate plan. Waiting “until I am healthier” only raises the age if the diagnosis is already stable.",
    considerP2: "On the level plans we quote, the monthly premium is designed not to rise with age if you pay on time. Many whole life contracts also build a small cash value; we do not publish those figures here because they are not the usual reason people buy, and they change by company and years in force.",
    fitH: "Is this path a fit?",
    fitYesH: "It may fit if",
    fitYes1: "You want to leave money for a funeral or cremation and do not have enough set aside, or you do not want that money tied to one funeral home.",
    fitYes2: "You want coverage that does not end after 10 or 20 years, at a smaller amount than large term.",
    fitNoH: "It often does not fit if",
    fitNo1: "The need is a mortgage or years of income. Then compare <a href=\"" + L.term + "\">term</a>.",
    fitNo2: "You already prepaid a funeral that covers what you want covered, or you already have a permanent policy of about the same size in force.",
    parentH: "Buying for a parent",
    parentP: "Adult children often help compare prices. That is fine. The person whose life is insured almost always has to take part: sign, answer health questions, and consent. You can be the owner or the payer; the parent is the insured. Do not hide medical history. Name clear beneficiaries and tell them where the policy is.",
    applyH: "How to apply without wrecking a future claim",
    applyP: "Ask for a quote with age, tobacco, state, and amount. Answer the questions with facts. The company reviews what you say and what is already in prescriptions. Then you (or the owner) review the premium, the amount, and whether there is a wait, and pay the first premium if it fits.",
    applyP2: "The companies we quote sell these plans through a licensed agent. Talking with the agency does not add a separate fee on top of the premium the insurer sets. An anonymous mail or TV order, when it exists, is usually guaranteed acceptance — more expensive per dollar, with a wait for natural death.",
    claimsH: "How a claim is filed",
    claimsP: "The beneficiary notifies the insurer — or Mejor Vida Insurance — with the death certificate and the policy number. Payment goes to the named person, not automatically to the funeral home. Keep the policy where the family can find it.",
    claimsGap: "Some families ask that part of the check go to a funeral home. That depends on the company and the beneficiary. We will not promise a number of days for payment, or that every company will send money straight to a funeral.",
    costH: "What a level plan costs if the questionnaire can issue",
    costP: "These monthly premiums are illustrative level final expense, non-tobacco. Each cell is the lowest among appointed companies that quote that amount at that age — not one company’s rate, and not an invented “$30 to $100” range. Read them to see how the month rises with age and amount. A pre-existing condition can block that row: the real price may be higher, or the product does not issue. $50,000 is not available at every age (several products lower the cap after 75). Guaranteed acceptance, at the same age and amount, usually costs more and waits about two years for natural death. More detail on the <a href=\"final-expense-cost.html\">cost page</a>. Not an offer.",
    costGap: "Ages 86–89 can still be quoted at one appointed company, with a $25,000 cap. We do not mix that single-company sample into this table, because the other appointed level plans stop at 85.",
    coH: "Appointed companies (final expense)",
    coP: "Educational cards. State, tobacco, and history change the offer. Current licenses are on the licenses page. Corebridge also quotes a questions-based plan (SimpliNow Legacy, ages 50–80, from $5,000, with a cap that depends on age — up to $35,000 on the version that can pay in full from the start) plus the guaranteed-acceptance plan below.",
    faqTitle: "Frequently asked questions",
    faq1q: "Are final expense, burial, and funeral insurance the same?",
    faq1a: "In practice, yes: they describe the same class of small whole life. The contract pays cash to the beneficiary; it does not reserve a service at a specific funeral home.",
    faq2q: "Is this the same as a prepaid funeral?",
    faq2a: "No. A prepaid funeral is a contract with a funeral home. Final expense is life insurance. The FTC Funeral Rule is about how funeral services are sold; it does not turn a policy into a funeral that is already paid.",
    faq3q: "Do I need a medical exam?",
    faq3a: "On the plans we quote, there is no in-office lab visit. There are still health questions, except on guaranteed acceptance, which asks none and waits about two years for natural death.",
    faq4q: "Does a pre-existing condition send me to a two-year wait?",
    faq4a: "Not by itself. What changes is whether the questionnaire can issue an immediate plan. See the <a href=\"" + L.hub + "\">pre-existing conditions</a> guide.",
    faq5q: "Until what age can I buy?",
    faq5a: "It depends on the product. Living Promise Level issues ages 45–85. Accendo Level can issue through 89 ($25,000 cap at ages 76–89). Immediate Solution goes through 85. Eagle Select Level goes through 85; some tobacco or limited-benefit designs stop earlier, often at 75. The guaranteed acceptance we quote usually stops at 80. We do not publish a new issue at 90.",
    faq6q: "Will the beneficiary owe tax on the money?",
    faq6a: "The IRS says that, in general, life-insurance proceeds paid because of the insured’s death are not included in the beneficiary’s gross income. Interest can be taxable. This is not tax advice: a CPA should review large estates or other assets.",
    faq7q: "Is term a good way to cover a funeral?",
    faq7a: "It is usually a poor fit. The term ends; a funeral does not. If term runs out at 70 or 75, you can be left without coverage just when a burial amount is most useful.",
    faq8q: "How much coverage should I buy?",
    faq8a: "A simple funeral is often about $10,000 to $25,000, but the real price is set by the funeral home, not this page. Add small debts or family travel if you want a cushion. The premium table is illustrative; a quote confirms the amount.",
    faq9q: "Can I buy this for a parent?",
    faq9a: "You can help compare and you can be the owner or the payer. The person whose life is insured almost always has to sign and answer. A power of attorney does not replace those health answers.",
    faq10q: "Do Social Security or Medicare pay for the funeral?",
    faq10a: "Social Security may pay $255 one time, if its rules are met. Medicare is medical insurance. Cash from a life policy is a different thing.",
    faq11q: "Where is Mejor Vida Insurance licensed?",
    faq11a: "Current licenses are on the <a href=\"licenses.html\">licenses</a> page. This page does not list states.",
    srcTitle: "Sources",
    src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: consumer life insurance</a> — how a policy is bought and why health answers matter at claim time.',
    src2: '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">SSA: lump-sum death payment</a> — a $255 payment, if it applies; it does not cover a funeral.',
    src3: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — rights when buying funeral goods and services; life insurance is not a prepaid funeral contract.',
    src4: '<a href="https://www.irs.gov/faqs/interest-dividends-other-types-of-income/life-insurance-disability-insurance-proceeds" rel="noopener" target="_blank">IRS: life insurance proceeds</a> — generally not included in the beneficiary’s gross income; interest can be taxable.',
    discTitle: "Disclosure",
    discBody: "This page is educational, not an offer. Ages, amounts, and premiums change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    nextH: "Next step",
    nextLead: "Ask for a quote with your age, tobacco, and medications, or call Mejor Vida Insurance.",
    nextMore:
      "If you already know the questionnaire will not pass, go to <a href=\"" +
      L.gi +
      "\">guaranteed acceptance</a>. If there is a specific diagnosis, see <a href=\"" +
      L.hub +
      "\">final expense with a health condition</a>.",
    nextPrimary: "See prices",
    nextPrimaryHref: L.quote,
    quoteTitle: "See prices",
    quote1: "Appointed companies",
    quote2: "For your health and age",
    quoteCta: "See prices",
  };
}

function feProductMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "tipos-seguro-vida.html" : "life-insurance-products.html";
  const related = isEs
    ? `<p class="lic-rate-note">Más en esta sección:
<a href="${L.hub}">Condiciones preexistentes</a> ·
<a href="${L.gi}">Aceptación garantizada</a> ·
<a href="${L.noWait}">Sin período de espera</a> ·
<a href="guia-seguro-entierro-mayores.html">Guía de entierro</a> ·
<a href="costo-seguro-gastos-finales.html">Costo</a> ·
<a href="${L.term}">Temporal</a></p>`
    : `<p class="lic-rate-note">More in this section:
<a href="${L.hub}">Pre-existing conditions</a> ·
<a href="${L.gi}">Guaranteed acceptance</a> ·
<a href="${L.noWait}">No waiting period</a> ·
<a href="burial-insurance-seniors.html">Burial guide</a> ·
<a href="final-expense-cost.html">Cost</a> ·
<a href="${L.term}">Term</a></p>`;
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
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › <a href="${mid}">${isEs ? "Tipos de seguro" : "Life insurance types"}</a> › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#need">${isEs ? "La pregunta" : "The question"}</a>
<a href="#how">${isEs ? "Cómo funciona" : "How it works"}</a>
<a href="#paths">${isEs ? "Caminos" : "Paths"}</a>
<a href="#faq">${isEs ? "Preguntas" : "Questions"}</a>
<a href="#cost">${isEs ? "Costo" : "Cost"}</a>
<a href="#companies">${isEs ? "Compañías" : "Companies"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Tres hechos para empezar" : "Three facts to start with"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<div class="lic-helpful"><p>${c.callout}</p></div>
<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<p>${c.needP1}</p>
<p>${c.needP2}</p>
</section>
<section class="lic-section" id="what">
<h2>${c.whatH}</h2>
<p>${c.whatP1}</p>
<p>${c.whatP2}</p>
<div class="lic-fact-trio">
<div><h3>${c.fact1H}</h3><p>${c.fact1P}</p></div>
<div><h3>${c.fact2H}</h3><p>${c.fact2P}</p></div>
<div><h3>${c.fact3H}</h3><p>${c.fact3P}</p></div>
</div>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<p>${c.howP1}</p>
<p>${c.howP2}</p>
<p>${c.howP3}</p>
</section>
<section class="lic-section" id="paths">
<h2>${c.pathsH}</h2>
<div class="lic-type-block"><h3>${c.path1T}</h3><p>${c.path1}</p></div>
<div class="lic-type-block"><h3>${c.path2T}</h3><p>${c.path2}</p></div>
<div class="lic-type-block"><h3>${c.path3T}</h3><p>${c.path3}</p></div>
<p class="lic-rate-note">${c.pathsNote}</p>
${planCompareHtml(c)}
</section>
<section class="lic-section" id="consider">
<h2>${c.considerH}</h2>
<p>${c.considerP}</p>
<p>${c.considerP2}</p>
</section>
<section class="lic-section" id="fit">
<h2>${c.fitH}</h2>
<div class="lic-split-lists lic-split-lists--cards">
<div class="lic-split-lists__yes">
<h3>${c.fitYesH}</h3>
<ul>
<li>${c.fitYes1}</li>
<li>${c.fitYes2}</li>
</ul>
</div>
<div class="lic-split-lists__no">
<h3>${c.fitNoH}</h3>
<ul>
<li>${c.fitNo1}</li>
<li>${c.fitNo2}</li>
</ul>
</div>
</div>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${feProductRateBlock(c, L.quote)}
<p class="lic-factor__gap">${c.costGap}</p>
</section>
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<p>${c.coP}</p>
${appointedCardsHtml(lang, c)}
${giCardHtml(lang, c)}
</section>
<section class="lic-section" id="parent">
<h2>${c.parentH}</h2>
<p>${c.parentP}</p>
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyP}</p>
<p>${c.applyP2}</p>
</section>
<section class="lic-section" id="claims">
<h2>${c.claimsH}</h2>
<p>${c.claimsP}</p>
<p class="lic-factor__gap">${c.claimsGap}</p>
</section>
${nextStepBandHtml(lang, c, { quoteHref: L.quote })}
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<section class="lic-section" id="sources">
<h2>${c.srcTitle}</h2>
<ul>
${[c.src1, c.src2, c.src3, c.src4].filter(Boolean).map((s) => `<li>${s}</li>`).join("\n")}
</ul>
</section>
${related}
</div>
${quoteRailHtml({
    lang,
    title: c.quoteTitle,
    line1: c.quote1,
    line2: c.quote2,
    quoteHref: L.quote,
    cta: c.quoteCta,
  })}
</div>
</main>`;
}

module.exports = { copyFeProduct, feProductMain };
