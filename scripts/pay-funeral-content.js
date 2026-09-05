"use strict";

const { quoteRailHtml } = require("./lic-quote-rail");
const { LINKS, faqsHtml, nextStepBandHtml } = require("./preexisting-conditions-content");

function nfdaScaleHtml(c) {
  return `<div class="lic-fun-nfda">
<div class="lic-fun-nfda__card">
<p class="lic-fun-nfda__kicker">${c.nfdaKicker}</p>
<p class="lic-fun-nfda__amt">$8,300</p>
<p class="lic-fun-nfda__label">${c.nfda1}</p>
</div>
<div class="lic-fun-nfda__card lic-fun-nfda__card--gold">
<p class="lic-fun-nfda__kicker">${c.nfdaKicker}</p>
<p class="lic-fun-nfda__amt">$6,280</p>
<p class="lic-fun-nfda__label">${c.nfda2}</p>
</div>
</div>`;
}

function pathCardsHtml(c) {
  const cards = [
    [c.pathK1, c.pathH1, c.pathP1, ""],
    [c.pathK2, c.pathH2, c.pathP2, ""],
    [c.pathK3, c.pathH3, c.pathP3, "gold"],
    [c.pathK4, c.pathH4, c.pathP4, ""],
    [c.pathK5, c.pathH5, c.pathP5, ""],
    [c.pathK6, c.pathH6, c.pathP6, ""],
  ];
  return `<div class="lic-pay-paths">
${cards
  .map(
    ([k, h, p, gold]) => `<div class="lic-pay-paths__card${gold ? " lic-pay-paths__card--gold" : ""}">
<p class="lic-pay-paths__kicker">${k}</p>
<h3>${h}</h3>
<p>${p}</p>
</div>`
  )
  .join("\n")}
</div>`;
}

function govTableHtml(c) {
  return `<div class="lic-pay-table-wrap">
<table class="lic-pay-table">
<caption>${c.govCap}</caption>
<thead>
<tr>
<th scope="col">${c.govCol1}</th>
<th scope="col">${c.govCol2}</th>
<th scope="col">${c.govCol3}</th>
</tr>
</thead>
<tbody>
<tr>
<th scope="row">${c.govR1H}</th>
<td data-label="${c.govCol2}">${c.govR1A}</td>
<td data-label="${c.govCol3}">${c.govR1B}</td>
</tr>
<tr>
<th scope="row">${c.govR2H}</th>
<td data-label="${c.govCol2}">${c.govR2A}</td>
<td data-label="${c.govCol3}">${c.govR2B}</td>
</tr>
<tr>
<th scope="row">${c.govR3H}</th>
<td data-label="${c.govCol2}">${c.govR3A}</td>
<td data-label="${c.govCol3}">${c.govR3B}</td>
</tr>
</tbody>
</table>
</div>`;
}

function vsChartHtml(c) {
  const rows = [
    [c.vsR1H, c.vsR1I, c.vsR1P],
    [c.vsR2H, c.vsR2I, c.vsR2P],
    [c.vsR3H, c.vsR3I, c.vsR3P],
    [c.vsR4H, c.vsR4I, c.vsR4P],
  ];
  return `<div class="lic-vs-chart" role="table" aria-label="${c.vsH}">
<div class="lic-vs-chart__row lic-vs-chart__head" role="row">
<div class="lic-vs-chart__q lic-vs-chart__q--blank" role="columnheader">${c.vsColQ}</div>
<div class="lic-vs-chart__pre" role="columnheader"><strong>${c.vsColPre}</strong><span>${c.vsColPreSub}</span></div>
<div class="lic-vs-chart__ins" role="columnheader"><strong>${c.vsColIns}</strong><span>${c.vsColInsSub}</span></div>
</div>
${rows
  .map(
    ([h, pre, ins]) => `<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${h}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.vsColPre}">${pre}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.vsColIns}">${ins}</div>
</div>`
  )
  .join("\n")}
</div>`;
}

function askListHtml(c) {
  const items = [c.ask1, c.ask2, c.ask3, c.ask4, c.ask5]
    .map((item) => `<li>${item}</li>`)
    .join("\n");
  return `<ol class="lic-pre-ask">${items}</ol>`;
}

function copyPay(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const funeralCost = isEs
    ? "cuanto-cuesta-un-funeral.html"
    : "how-much-does-a-funeral-cost.html";
  const prepaid = isEs ? "funerales-prepagados.html" : "prepaid-funerals.html";
  const premiumGuide = isEs
    ? "blog/cuanto-cuesta-seguro-gastos-finales.html"
    : "final-expense-cost.html";
  const medicare = isEs
    ? "blog/medicare-paga-gastos-finales.html"
    : "../blog/medicare-paga-gastos-finales.html";
  const findPolicy = isEs
    ? "buscar-poliza-vida.html"
    : "find-life-insurance-policy.html";
  const estimator = "final-expense-estimator.html";
  if (isEs) {
    return {
      title: "Cómo pagar un funeral: ahorros, prepago, seguro y ayudas | Mejor Vida Seguros",
      desc: "Cómo se paga la factura de un funeral: ahorros, contrato prepagado, efectivo de un seguro de vida, el pago de $255 del Seguro Social, ayudas del VA y préstamos. Medicare no cubre el sepelio.",
      h1: "¿Cómo se paga un funeral?",
      lead: "Cuando alguien fallece, la funeraria y el cementerio esperan que alguien pague los bienes y servicios que la familia eligió. No existe un único “cheque funerario” del gobierno que cubra esa cuenta. Esta página enseña las vías que sí existen —dinero ya apartado, un contrato ya pagado, efectivo de un seguro de vida, ayudas públicas concretas y, si hace falta, un préstamo— y qué no cubre cada una.",
      crumbEnd: "Cómo pagar un funeral",
      take1: "La factura la paga quien contrata el servicio, con el dinero que esa persona pueda reunir. El <a href=\"https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment\" rel=\"noopener\" target=\"_blank\">Seguro Social</a> puede entregar <strong>$255 una sola vez</strong> si se cumplen sus reglas. Eso no cubre un sepelio típico. Medicare es seguro médico, no un plan de funeral.",
      take2: "En 2023, la <a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA</a> publicó una mediana de <strong>$8,300</strong> por un funeral con velatorio y entierro, y <strong>$6,280</strong> con velatorio y cremación, del lado de la funeraria. Parcela, bóveda y lápida suelen ir aparte.",
      take3: "Las familias suelen combinar fuentes: ahorros, un <strong>funeral prepagado</strong> (contrato con una funeraria), o el efectivo de una póliza de vida. Un préstamo o una tarjeta pueden cerrar un hueco, pero añaden deuda. Ninguna vía es “la correcta” para todos.",
      callout: "Decidir el tipo de servicio y tener el dinero listo son dos tareas distintas. Puede dejar preferencias por escrito sin entregar el efectivo a una funeraria concreta.",
      needH: "El problema que aparece en pocos días",
      needP1: "Alguien tiene que pagar el cuidado del cuerpo, el lugar de descanso y, si la familia lo quiere, un servicio. Esa cuenta no espera a que se liquide una herencia. La <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule de la FTC</a> exige un estado de cuenta escrito de lo que usted eligió <em>antes</em> de pagar. No publica un plazo nacional de “hay que pagar todo el día anterior al servicio.” Eso lo fija cada funeraria.",
      needP2: "Tampoco hay un programa federal que pague “el funeral gratis.” Hay ayudas pequeñas o condicionales —$255 del Seguro Social, asignación del VA si el fallecido era veterano elegible— y hay publicidad que promete lo contrario. Más abajo separamos lo que sí está publicado de lo que no.",
      whatH: "No hay un solo producto llamado “pago del funeral”",
      whatP1: "Pagar un funeral significa reunir dinero para las líneas que la familia eligió. Esas líneas salen de la <strong>lista de precios generales</strong> (GPL): el menú escrito que la funeraria debe entregarle. Un sepelio con velatorio no cuesta lo mismo que una cremación sin servicio. El tamaño de esa cuenta está en la <a href=\"" +
        funeralCost +
        "\">guía de cuánto cuesta un funeral</a>.",
      whatP2: "El dinero puede salir de sitios distintos. Puede ya estar en una cuenta. Puede ya haberse entregado a una funeraria. Puede llegar después, en un cheque de una póliza, a la persona que el fallecido nombró. Puede ser un beneficio público pequeño. Puede pedirse prestado. Mezclar esas fuentes es habitual. Confundirlas —tratar un contrato de funeraria como si fuera un seguro, o al revés— es lo que deja a la familia con dos facturas o con un paquete que no puede mover.",
      whatP3: "Quien firma el contrato con la funeraria es, en la práctica, a quien esa empresa cobra. Si el caudal hereditario puede reembolsar a esa persona, depende de las reglas de su estado. No publicamos una norma nacional del tipo “los hijos tienen que pagar.”",
      fact1H: "Dinero que ya es de la familia",
      fact1P: "Ahorros, una cuenta conjunta a la que alguien puede acceder, o una colecta informal. Llega cuando esa persona puede usarlo —no cuando una aseguradora o una oficina termina un trámite.",
      fact2H: "Dinero ya enviado a un proveedor",
      fact2P: "Un funeral prepagado compra las líneas nombradas en un contrato con una funeraria. No es un cheque libre para la familia.",
      fact3H: "Dinero que llega a una persona",
      fact3P: "Una póliza de vida paga al <strong>beneficiario</strong>: la persona que usted nombra. Esa persona decide si paga la funeraria, el viaje u otra deuda.",
      howH: "Cómo se arma el pago, en la práctica",
      howP1: "Pida la GPL. Marque solo lo que quiere. La funeraria debe darle el total por escrito antes de que pague. La FTC también le permite llevar un ataúd o una urna comprados en otro lugar.",
      howP2: "Pregunte cómo aceptan el pago: cuenta, cheque, tarjeta, o que el beneficiario de una póliza pague allí. Algunas funerarias aceptan que el pago de un seguro se <strong>asigne</strong> a ellas: la empresa queda nombrada para cobrar el beneficio y prestar el servicio. Eso es un arreglo con esa funeraria, no una regla de todas las pólizas.",
      howP3: "Si nadie sabe que ya hay un contrato prepagado o una póliza, la familia puede volver a pagar el mismo funeral. Deje esos papeles donde se puedan encontrar el fin de semana —no solo en una caja de seguridad.",
      sizeH: "De qué tamaño es la cuenta que hay que pagar",
      sizeP: "Use cifras públicas para ver el orden de magnitud, no como la factura de su ciudad. La NFDA publicó, para 2023, una <strong>mediana</strong> (el valor del medio) de $8,300 con velatorio y entierro, y $6,280 con velatorio y cremación. El cementerio y los extras suelen sumar aparte.",
      nfdaKicker: "Mediana NFDA 2023",
      nfda1: "Funeral con velatorio y entierro (lado de la funeraria)",
      nfda2: "Funeral con velatorio y cremación (lado de la funeraria)",
      sizeLearn: "Lo que debe llevarse: si la familia quiere velatorio y servicio, está hablando de miles de dólares, no del pago de $255. Una cremación sin servicio suele ser más baja —y debe leerse en la GPL local, no en un promedio de internet.",
      sizeP2: "Su GPL es la cifra real. La <a href=\"" +
        estimator +
        "\">calculadora de gastos finales</a> ayuda a ver un estimado por estado; no cotiza una funeraria ni un préstamo.",
      pathH: "Seis vías que las familias combinan",
      pathP: "Estas vías no son un menú que deba usar entero. Son los sitios de donde suele salir el dinero. El seguro de vida se enseña con más detalle más abajo, después de ver el resto.",
      pathK1: "Vía 1",
      pathH1: "Ahorros o una cuenta",
      pathP1: "Si el dinero ya está apartado y alguien puede usarlo al momento, no hace falta un producto nuevo del mismo tamaño. Confirme que la cuenta no quede congelada cuando fallece el titular.",
      pathK2: "Vía 2",
      pathH2: "Funeral prepagado",
      pathP2: "Usted elige líneas con una funeraria y paga una parte o el total antes. El contrato nombra bienes o servicios, no “todo lo que cueste enterrar a alguien.” La guía completa está en <a href=\"" +
        prepaid +
        "\">funerales prepagados</a>.",
      pathK3: "Vía 3",
      pathH3: "Efectivo de un seguro de vida",
      pathP3: "La póliza paga al beneficiario. Esa persona puede pagar la funeraria, el viaje o una cremación más sencilla. No reserva un servicio en un proveedor concreto, salvo que se asigne el pago.",
      pathK4: "Vía 4",
      pathH4: "Pago de $255 del Seguro Social",
      pathP4: "Un único pago, si hay cónyuge o hijos que cumplan las reglas, y hay que solicitarlo. No está pensado para cubrir un funeral con velatorio.",
      pathK5: "Vía 5",
      pathH5: "Ayuda del VA, si aplica",
      pathP5: "El Departamento de Asuntos de Veteranos puede pagar una asignación de entierro y de parcela si se cumplen sus reglas. No es automático para todo veterano.",
      pathK6: "Vía 6",
      pathH6: "Tarjeta o préstamo",
      pathP6: "Algunas funerarias aceptan tarjeta. El interés lo pone el emisor de la tarjeta o el prestamista, no una tasa funeraria nacional que podamos citar. Pregunte antes de firmar.",
      pathNote: "Una colecta de amigos o de una comunidad puede ayudar. No es un programa federal con un monto publicado, así que no la tratamos aquí como una cifra en la que basar un plan.",
      govH: "Qué ayuda pública sí existe — y qué no",
      govP: "Hay beneficios reales y hay anuncios que prometen un funeral pagado por “el gobierno.” Use esta tabla para no mezclarlos. Los montos del VA cambian con la fecha de la muerte y con si la muerte está relacionada con el servicio; confírmelos en la página del VA.",
      govCap: "Ayudas públicas publicadas frente a lo que no cubren",
      govCol1: "Fuente",
      govCol2: "Qué puede pagar",
      govCol3: "Qué no es",
      govR1H: "Seguro Social",
      govR1A: "$255 una vez, si se cumplen las reglas y se solicita a tiempo.",
      govR1B: "Un plan para pagar el sepelio.",
      govR2H: "VA (veteranos)",
      govR2A: "Para una muerte no relacionada con el servicio el 1 de octubre de 2025 o después: $1,002 de entierro y $1,002 de parcela. Si la muerte está relacionada con el servicio (desde el 11 de septiembre de 2001), el máximo de entierro publicado es $2,000.",
      govR2B: "Un pago automático para todo veterano. Hay que ser elegible.",
      govR3H: "Medicare",
      govR3A: "Atención médica mientras la persona vive. El <a href=\"https://www.medicare.gov/coverage/hospice-care\" rel=\"noopener\" target=\"_blank\">hospicio</a> (cuidado para una enfermedad terminal) también es mientras está viva.",
      govR3B: "El funeral, el cementerio ni las deudas que quedan al fallecer.",
      govLearn: "Lo que debe llevarse: sume $255 y, si aplica, la asignación del VA, y aún puede faltar la mayor parte de un funeral con velatorio. Medicare no cierra ese hueco.",
      govFlag: "No publicamos que “la mayoría de las funerarias exigen el pago completo antes del servicio.” Cada proveedor fija su plazo. Pida ese plazo por escrito junto con la GPL. Tampoco publicamos un rango nacional de “un préstamo funerario cuesta de tanto a tanto”: esa cifra está en el contrato del prestamista, no en una estadística oficial.",
      medH: "Medicare no es un plan funerario",
      medP1: "Medicare paga servicios médicos para una persona viva. El hospicio, cuando se cumplen las reglas, cubre el cuidado de una enfermedad terminal —no el ataúd, el velatorio ni la parcela. El detalle de hospicio y del pago de $255 está en <a href=\"" +
        medicare +
        "\">qué cubre Medicare respecto a los gastos finales</a>.",
      medP2: "Medicaid lo administra cada estado. Algunos estados tienen ayuda limitada para entierros de personas sin recursos; los montos y las reglas no son nacionales. No inventamos aquí una cifra de “Medicaid paga el funeral.” Si cree que aplica, pregunte en la oficina de Medicaid de su estado.",
      borrowH: "Si el dinero hay que pedirlo prestado",
      borrowP1: "Una tarjeta o un préstamo puede permitir que el servicio se celebre cuando no hay efectivo a mano. El costo extra es el interés y las cuotas de ese crédito, no un recargo funerario único de EE. UU. No hay una tasa nacional publicada que podamos poner en una tabla.",
      borrowP2: "Pregunte si la funeraria acepta tarjeta, si cobra recargo por usarla y si los <strong>adelantos en efectivo</strong> (flores, obituario u otros cargos que la funeraria paga a terceros) se pueden cargar a la tarjeta. La FTC exige que esos adelantos vayan desglosados; no dice que todas las funerarias acepten el mismo método de pago.",
      helpH: "Cuándo cada vía ayuda — y dónde se queda corta",
      helpYesH: "Puede encajar si",
      helpYes1: "Ya hay ahorros suficientes y alguien puede usarlos al momento.",
      helpYes2: "Quiere dejar elegidas las líneas del servicio y no planea mudarse: un prepago con precio por escrito puede tener sentido.",
      helpYes3: "Quiere que una persona de confianza reciba efectivo y elija funeraria, viaje o una cremación más adelante: una póliza de vida hace eso.",
      helpNoH: "Queda corto si",
      helpNo1: "Cuenta solo con el pago de $255 o con “Medicare lo cubre.” Ninguno de los dos paga un sepelio típico.",
      helpNo2: "El prepago no congela el precio o no se puede trasladar, y la familia vive en otra ciudad.",
      helpNo3: "Cierra el hueco con una tarjeta que no puede pagar pronto: el interés puede superar el colchón que pensaba dejar.",
      askH: "Cinco preguntas de pago en la funeraria",
      askP: "Pida las respuestas por escrito, junto con la GPL. No sustituyen un contrato de seguro ni un prepago.",
      ask1: "¿Cuál es el total de las líneas que elegí, y qué queda fuera (cementerio, lápida, flores)?",
      ask2: "¿Cuándo espera el pago: depósito ahora, el resto el día del servicio, u otro plazo?",
      ask3: "¿Aceptan transferencia, cheque o tarjeta? ¿Hay recargo por tarjeta?",
      ask4: "Si hay una póliza de vida, ¿pueden esperar al pago de la aseguradora o piden una asignación a la funeraria?",
      ask5: "Si ya existe un contrato prepagado a nombre de esta persona, ¿dónde está y qué cubre todavía?",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Medicare paga el funeral?",
      faq1a: "No. Medicare es seguro médico para una persona viva, incluido el hospicio cuando aplican sus reglas. No paga el sepelio ni el cementerio. Más detalle en <a href=\"" +
        medicare +
        "\">qué cubre Medicare respecto a los gastos finales</a>.",
      faq2q: "¿El Seguro Social paga el funeral?",
      faq2a: "Puede pagar $255 una sola vez si hay cónyuge o hijos que cumplan sus reglas. Hay que solicitarlo, en general dentro de dos años. No cubre un funeral con velatorio.",
      faq3q: "¿El VA ayuda con el entierro de un veterano?",
      faq3a: "A veces, si se cumplen las reglas del VA. Para una muerte no relacionada con el servicio el 1 de octubre de 2025 o después, publica $1,002 de entierro y $1,002 de parcela. Si la muerte está relacionada con el servicio (desde el 11 de septiembre de 2001), el máximo de entierro publicado es $2,000. Confirme en la página del VA; la elegibilidad no es automática.",
      faq4q: "¿Hay que pagar todo antes del servicio?",
      faq4a: "Eso lo decide cada funeraria, no una ley federal única. La FTC exige el estado de cuenta escrito antes de que usted pague. Pregunte el plazo y pídalo por escrito. No publicamos que “casi todas” exijan el total por adelantado.",
      faq5q: "¿Se puede pagar con tarjeta de crédito?",
      faq5a: "Muchas funerarias la aceptan; no todas, y los adelantos a terceros a veces van aparte. El interés es el de su tarjeta. No hay una tasa funeraria nacional que podamos citar.",
      faq6q: "¿Y si no hay seguro?",
      faq6a: "La familia puede usar ahorros, un contrato ya pagado, el pago de $255 si aplica, la ayuda del VA si aplica, una colecta, o crédito. También puede elegir un servicio más sencillo según la GPL. Un promedio nacional no es su factura.",
      faq7q: "¿Un funeral prepagado es lo mismo que un seguro?",
      faq7a: "No. El prepagado es un contrato con una funeraria por bienes o servicios. Un seguro de vida paga efectivo a la persona que usted nombró. Esa persona decide dónde gastarlo.",
      faq8q: "¿Quién es responsable de la factura?",
      faq8a: "En la práctica, la funeraria cobra a quien firmó el contrato de servicios. Si el caudal hereditario puede reembolsar a esa persona, depende del estado. No hay una regla nacional de que los hijos deban pagar.",
      faq9q: "¿Se puede usar una póliza de vida que ya existe?",
      faq9a: "Sí, si sigue vigente y el beneficiario está al día. El pago va a esa persona, no a la funeraria, salvo que se asigne. Si no está seguro de si había una póliza, use la guía para <a href=\"" +
        findPolicy +
        "\">buscar si alguien tenía un seguro de vida</a>.",
      faq10q: "¿Medicaid o el condado pagan el funeral?",
      faq10a: "A veces hay ayuda local o estatal para personas sin recursos. Los montos no son iguales en todo el país, así que no publicamos una cifra. Pregunte en Medicaid o en el condado. No sustituye un plan propio.",
      faq11q: "¿Debo vaciar los ahorros o comprar un seguro?",
      faq11a: "Si el dinero ya está apartado y la familia puede usarlo, un producto nuevo del mismo tamaño puede ser innecesario. Un seguro sirve cuando quiere dejar efectivo a una persona sin atarlo a una funeraria. Compare el mes que puede pagar con la <a href=\"" +
        premiumGuide +
        "\">guía del precio del seguro</a>.",
      faq12q: "¿Cuánta cobertura haría falta?",
      faq12a: "Empiece por una GPL local, sume cementerio y un colchón si quiere viaje o deudas pequeñas. Un promedio nacional no es su monto. La calculadora ayuda a dimensionar la cuenta; una cotización confirma la prima.",
      insH: "Si lo que quiere es dejar efectivo, no un paquete",
      insP1: "Un <strong>seguro de gastos finales</strong> es una póliza pequeña de <strong>vida entera</strong>: cobertura pensada para durar toda la vida si las <strong>primas</strong> —el pago regular— se mantienen al día. El <strong>beneficiario</strong> es la persona que usted nombra. El <strong>beneficio por fallecimiento</strong> es el efectivo que esa persona recibe. No reserva un servicio en una funeraria concreta.",
      insP2: "Si la póliza se aprueba para pagar desde el inicio, la familia puede usar ese efectivo cuando haga falta. Si la compañía solo ofrece un plan con espera para muerte natural, ese plazo está en la póliza; no lo adivinamos aquí. El producto se enseña en <a href=\"" +
        L.fe +
        "\">seguro de gastos finales</a>. El precio mensual está en la <a href=\"" +
        premiumGuide +
        "\">guía del precio del seguro</a>.",
      vsH: "Contrato en la funeraria o efectivo para la familia",
      vsP: "Ambos pueden quitar presión. No compran lo mismo. Esta tabla resume la diferencia después de entender las vías de pago.",
      vsColQ: "Pregunta",
      vsColPre: "Funeral prepagado",
      vsColPreSub: "Bienes o servicios en una funeraria",
      vsColIns: "Seguro de gastos finales",
      vsColInsSub: "Efectivo para quien usted nombre",
      vsR1H: "Qué compra",
      vsR1I: "Las líneas escritas en el contrato",
      vsR1P: "Una póliza que paga un monto en efectivo",
      vsR2H: "Quién cobra",
      vsR2I: "La funeraria, al prestar el servicio",
      vsR2P: "El beneficiario, que decide cómo gastarlo",
      vsR3H: "Si se muda",
      vsR3I: "Puede ser difícil o costoso trasladarlo",
      vsR3P: "La póliza sigue pagando a esa persona",
      vsR4H: "Si cambian los planes",
      vsR4I: "El valor suele quedar en las líneas no usadas",
      vsR4P: "El efectivo no está atado a un ataúd o a un velatorio",
      vsNote: "Si ya prepagó un paquete que cubre lo que quiere, puede no necesitar una póliza nueva del mismo tamaño. Si quiere que la familia reciba dinero y elija la funeraria más adelante, pida una cotización.",
      nextH: "Siguiente paso",
      nextLead: "Pida una cotización gratuita con su edad y salud, o agende una llamada con Mejor Vida Seguros.",
      nextMore:
        "Licencias actuales en la página de <a href=\"" +
        L.licenses +
        "\">licencias</a>. Esta página no cotiza una funeraria ni un préstamo.",
      nextPrimary: "Cotización gratuita",
      nextPrimaryHref: L.quote,
      nextSecondary: "Agendar una llamada",
      nextSecondaryHref: L.schedule,
      quoteTitle: "Ver precios del seguro",
      quote1: "Efectivo para la familia",
      quote2: "Compare opciones a su edad",
      quoteCta: "Ver precios",
      srcTitle: "Fuentes",
      src1: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — GPL, estado de cuenta escrito antes de pagar, comprar solo lo necesario.',
      src2: '<a href="https://consumer.ftc.gov/articles/shopping-funeral-services" rel="noopener" target="_blank">FTC: comprar servicios funerarios</a> — comparar funerarias y no sentirse obligado a un paquete entero.',
      src3: '<a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA: estadísticas</a> — medianas 2023 de funeral con velatorio y entierro ($8,300) o cremación ($6,280).',
      src4: '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">Seguro Social: pago único por fallecimiento</a> — $255 si aplican las reglas.',
      src5: '<a href="https://www.va.gov/burials-memorials/veterans-burial-allowance/" rel="noopener" target="_blank">VA: asignación de entierro</a> — montos según fecha y si la muerte está relacionada con el servicio.',
      src6: '<a href="https://www.medicare.gov/coverage/hospice-care" rel="noopener" target="_blank">Medicare: cobertura de hospicio</a> — cuidado médico mientras la persona vive; no es un pago de funeral.',
      src7: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: seguro de vida</a> — el seguro de vida paga un beneficio a la persona nombrada.',
      discTitle: "Divulgaciones",
      discBody:
        "Esta página es educativa. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431) y no opera una funeraria. Los precios de funeraria y cementerio los fija cada proveedor. Las ayudas públicas dependen de elegibilidad y de la fecha. El seguro de vida, si se menciona, varía por edad, salud, tabaco, monto, producto y estado. Las licencias actuales están en la página de <a href=\"" +
        L.licenses +
        "\">licencias</a>.",
    };
  }
  return {
    title: "How to pay for a funeral: savings, prepaid plans, insurance, and aid | Mejor Vida Insurance",
    desc: "How a funeral bill is paid: savings, a prepaid funeral contract, cash from life insurance, Social Security’s $255, VA help, and loans. Medicare does not pay for the funeral.",
    h1: "How is a funeral paid for?",
    lead: "When someone dies, the funeral home and cemetery expect someone to pay for the goods and services the family chose. There is no single government “funeral check” that covers that bill. This page teaches the paths that do exist — money already set aside, a contract already paid, cash from a life policy, specific public benefits, and, if needed, a loan — and what each one does not cover.",
    crumbEnd: "How to pay for a funeral",
    take1: "The bill is paid by the person who arranges the service, with whatever money that person can gather. <a href=\"https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment\" rel=\"noopener\" target=\"_blank\">Social Security</a> may pay <strong>$255 once</strong> if its rules are met. That does not cover a typical funeral. Medicare is health insurance, not a funeral plan.",
    take2: "In 2023, the <a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA</a> published a median of <strong>$8,300</strong> for a funeral with viewing and burial, and <strong>$6,280</strong> with viewing and cremation, on the funeral-home side. A plot, vault, and marker are usually extra.",
    take3: "Families often combine sources: savings, a <strong>prepaid funeral</strong> (a contract with a funeral home), or cash from a life policy. A loan or credit card can close a gap, but it adds debt. No path is “the right one” for everyone.",
    callout: "Choosing the kind of service and having money ready are two different jobs. You can write down your wishes without sending cash to one funeral home.",
    needH: "The problem that shows up within days",
    needP1: "Someone has to pay for care of the body, a resting place, and, if the family wants one, a service. That bill does not wait for an estate to settle. The <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC Funeral Rule</a> requires a written statement of what you selected <em>before</em> you pay. It does not publish a nationwide “pay everything the day before the service” deadline. Each funeral home sets that timing.",
    needP2: "There is also no federal program that pays “the funeral for free.” There are small or conditional benefits — Social Security’s $255, a VA allowance if the person was an eligible Veteran — and there is advertising that promises the opposite. Below we separate what is published from what is not.",
    whatH: "There is no single product called “funeral payment”",
    whatP1: "Paying for a funeral means gathering money for the lines the family chose. Those lines come from the <strong>General Price List</strong> (GPL): the written menu the funeral home must give you. A funeral with visitation does not cost the same as a cremation with no service. The size of that bill is on <a href=\"" +
      funeralCost +
      "\">how much a funeral costs</a>.",
    whatP2: "The money can come from different places. It may already sit in an account. It may already have been sent to a funeral home. It may arrive later, as a check from a policy, to the person the deceased named. It may be a small public benefit. It may be borrowed. Mixing those sources is common. Confusing them — treating a funeral-home contract as if it were insurance, or the reverse — is what leaves a family with two bills or a package they cannot move.",
    whatP3: "Whoever signs the funeral-home contract is, in practice, who that business bills. Whether the estate can reimburse that person depends on your state’s rules. We do not publish a nationwide “the children must pay” rule.",
    fact1H: "Money the family already has",
    fact1P: "Savings, a joint account someone can access, or an informal collection. It is available when that person can use it — not when an insurer or an office finishes a claim.",
    fact2H: "Money already sent to a provider",
    fact2P: "A prepaid funeral buys the lines named in a contract with a funeral home. It is not an unrestricted check for the family.",
    fact3H: "Money that arrives to a person",
    fact3P: "A life policy pays the <strong>beneficiary</strong>: the person you name. That person decides whether to pay the funeral home, travel, or another bill.",
    howH: "How payment is put together in practice",
    howP1: "Ask for the GPL. Mark only what you want. The funeral home must give you the total in writing before you pay. The FTC also lets you bring a casket or urn bought somewhere else.",
    howP2: "Ask how they take payment: account, check, card, or the beneficiary of a policy paying there. Some funeral homes accept an insurance payment that is <strong>assigned</strong> to them: the business is named to collect the benefit and provide the service. That is an arrangement with that funeral home, not a rule of every policy.",
    howP3: "If nobody knows a prepaid contract or a policy already exists, the family may pay for the same funeral again. Leave those papers where they can be found on a weekend — not only in a safe-deposit box.",
    sizeH: "How large is the bill that has to be paid",
    sizeP: "Use public figures for order of magnitude, not as your city’s invoice. The NFDA published 2023 <strong>medians</strong> (the middle value) of $8,300 with viewing and burial, and $6,280 with viewing and cremation. The cemetery and extras are usually separate.",
    nfdaKicker: "NFDA 2023 median",
    nfda1: "Funeral with viewing and burial (funeral-home side)",
    nfda2: "Funeral with viewing and cremation (funeral-home side)",
    sizeLearn: "Takeaway: if the family wants visitation and a service, you are talking about thousands of dollars, not the $255 payment. A cremation with no service is usually lower — and should be read on the local GPL, not from an internet average.",
    sizeP2: "Your GPL is the real number. The <a href=\"" +
      estimator +
      "\">final expense calculator</a> helps size a state-level estimate; it does not quote a funeral home or a loan.",
    pathH: "Six paths families combine",
    pathP: "You do not have to use every path. These are the places the money usually comes from. Life insurance is taught in more detail below, after the rest of the picture.",
    pathK1: "Path 1",
    pathH1: "Savings or an account",
    pathP1: "If the money is already set aside and someone can use it at the time, you may not need a new product of the same size. Confirm the account is not frozen when the owner dies.",
    pathK2: "Path 2",
    pathH2: "A prepaid funeral",
    pathP2: "You choose lines with a funeral home and pay some or all of the cost in advance. The contract names goods or services, not “whatever burial costs.” The full guide is <a href=\"" +
      prepaid +
      "\">prepaid funerals</a>.",
    pathK3: "Path 3",
    pathH3: "Cash from a life policy",
    pathP3: "The policy pays the beneficiary. That person can pay the funeral home, travel, or a simpler cremation. It does not reserve a service at one provider unless the payment is assigned.",
    pathK4: "Path 4",
    pathH4: "Social Security’s $255",
    pathP4: "A one-time payment, if a spouse or children meet the rules, and it must be applied for. It is not meant to cover a funeral with visitation.",
    pathK5: "Path 5",
    pathH5: "VA help, if eligible",
    pathP5: "The Department of Veterans Affairs may pay a burial and plot allowance if its rules are met. It is not automatic for every Veteran.",
    pathK6: "Path 6",
    pathH6: "A card or a loan",
    pathP6: "Some funeral homes accept cards. Interest is set by the card issuer or lender, not by a national funeral rate we can cite. Ask before you sign.",
    pathNote: "A collection from friends or a community can help. It is not a federal program with a published amount, so we do not treat it here as a figure to build a plan on.",
    govH: "Which public help actually exists — and which does not",
    govP: "There are real benefits, and there are ads that promise a funeral paid by “the government.” Use this table so you do not mix them up. VA amounts change with the date of death and whether the death was service-connected; confirm them on the VA page.",
    govCap: "Published public help versus what it does not cover",
    govCol1: "Source",
    govCol2: "What it may pay",
    govCol3: "What it is not",
    govR1H: "Social Security",
    govR1A: "$255 once, if the rules are met and you apply on time.",
    govR1B: "A plan to pay for the funeral.",
    govR2H: "VA (Veterans)",
    govR2A: "For a non-service-connected death on or after October 1, 2025: $1,002 burial and $1,002 for a plot. For a service-connected death (on or after September 11, 2001), the published burial maximum is $2,000.",
    govR2B: "An automatic payment for every Veteran. Eligibility is required.",
    govR3H: "Medicare",
    govR3A: "Medical care while the person is alive. <a href=\"https://www.medicare.gov/coverage/hospice-care\" rel=\"noopener\" target=\"_blank\">Hospice</a> (care for a terminal illness) is also while the person is alive.",
    govR3B: "The funeral, the cemetery, or debts left at death.",
    govLearn: "Takeaway: add $255 and, if it applies, the VA allowance, and you may still be short most of a funeral with visitation. Medicare does not close that gap.",
    govFlag: "We do not publish that “most funeral homes require full payment before the service.” Each provider sets its timing. Ask for that deadline in writing with the GPL. We also do not publish a national “funeral loans cost X to Y” range: that figure is in the lender’s contract, not in an official statistic.",
    medH: "Medicare is not a funeral plan",
    medP1: "Medicare pays medical services for a living person. Hospice, when the rules are met, covers care for a terminal illness — not the casket, the visitation, or the plot. Hospice and the $255 payment are covered in more detail in <a href=\"" +
      medicare +
      "\">how Medicare relates to final expenses</a>.",
    medP2: "Medicaid is run by each state. Some states have limited help for burials when a person has no resources; amounts and rules are not national. We do not invent a “Medicaid pays the funeral” figure here. If you think it applies, ask your state Medicaid office.",
    borrowH: "If the money has to be borrowed",
    borrowP1: "A card or a loan can let the service go forward when cash is not on hand. The extra cost is the interest and fees on that credit, not one U.S. funeral surcharge. There is no published national rate we can put in a table.",
    borrowP2: "Ask whether the funeral home accepts cards, whether there is a card fee, and whether <strong>cash-advance items</strong> (flowers, an obituary, or other charges the funeral home pays to third parties) can go on the card. The FTC requires those advances to be itemized; it does not say every funeral home accepts the same payment method.",
    helpH: "When each path helps — and where it falls short",
    helpYesH: "It may fit if",
    helpYes1: "Enough savings are already set aside and someone can use them at the time.",
    helpYes2: "You want the service lines chosen and you do not plan to move: a prepay with prices in writing can make sense.",
    helpYes3: "You want a trusted person to receive cash and choose a funeral home, travel, or a cremation later: a life policy does that.",
    helpNoH: "It falls short if",
    helpNo1: "You are counting only on the $255 payment or on “Medicare will cover it.” Neither pays a typical funeral.",
    helpNo2: "The prepay does not freeze the price or cannot be moved, and the family lives in another city.",
    helpNo3: "You close the gap with a card you cannot pay down soon: interest can erase the cushion you meant to leave.",
    askH: "Five payment questions at the funeral home",
    askP: "Get the answers in writing, with the GPL. They do not replace an insurance policy or a prepaid contract.",
    ask1: "What is the total of the lines I chose, and what is still extra (cemetery, marker, flowers)?",
    ask2: "When is payment due: a deposit now, the rest on the day of the service, or another schedule?",
    ask3: "Do you take a transfer, a check, or a card? Is there a card surcharge?",
    ask4: "If there is a life policy, can you wait for the insurer’s payment, or do you ask for an assignment to the funeral home?",
    ask5: "If a prepaid contract already exists in this person’s name, where is it and what does it still cover?",
    faqTitle: "Frequently asked questions",
    faq1q: "Does Medicare pay for the funeral?",
    faq1a: "No. Medicare is health insurance for a living person, including hospice when its rules are met. It does not pay for the funeral or the cemetery. More detail is in <a href=\"" +
      medicare +
      "\">how Medicare relates to final expenses</a>.",
    faq2q: "Does Social Security pay for the funeral?",
    faq2a: "It may pay $255 once if a spouse or children meet its rules. You generally must apply within two years. That does not cover a funeral with visitation.",
    faq3q: "Does the VA help with a Veteran’s burial?",
    faq3a: "Sometimes, if VA rules are met. For a non-service-connected death on or after October 1, 2025, VA publishes $1,002 for burial and $1,002 for a plot. For a service-connected death (on or after September 11, 2001), the published burial maximum is $2,000. Confirm on the VA page; eligibility is not automatic.",
    faq4q: "Do I have to pay everything before the service?",
    faq4a: "Each funeral home decides that, not one federal law. The FTC requires the written statement before you pay. Ask for the deadline in writing. We do not publish that “almost all” homes require the full amount in advance.",
    faq5q: "Can I pay with a credit card?",
    faq5a: "Many funeral homes accept cards; not all do, and third-party cash advances are sometimes separate. Interest is your card’s rate. There is no national funeral rate we can cite.",
    faq6q: "What if there is no insurance?",
    faq6a: "The family may use savings, a contract already paid, the $255 payment if it applies, VA help if it applies, a collection, or credit. They can also choose a simpler service from the GPL. A national average is not your bill.",
    faq7q: "Is a prepaid funeral the same as insurance?",
    faq7a: "No. A prepaid funeral is a contract with a funeral home for goods or services. Life insurance pays cash to the person you named. That person decides where to spend it.",
    faq8q: "Who is responsible for the bill?",
    faq8a: "In practice, the funeral home bills the person who signed the services contract. Whether the estate can reimburse that person depends on the state. There is no nationwide rule that children must pay.",
    faq9q: "Can we use a life policy that already exists?",
    faq9a: "Yes, if it is still in force and the beneficiary is current. The payment goes to that person, not to the funeral home, unless it is assigned. If you are not sure a policy existed, use the guide to <a href=\"" +
      findPolicy +
      "\">find whether someone had life insurance</a>.",
    faq10q: "Do Medicaid or the county pay for the funeral?",
    faq10a: "Sometimes there is local or state help when a person has no resources. Amounts are not the same nationwide, so we do not publish a figure. Ask Medicaid or the county. It is not a substitute for a plan of your own.",
    faq11q: "Should I empty savings or buy insurance?",
    faq11a: "If the money is already set aside and the family can use it, a new product of the same size may be unnecessary. Insurance helps when you want to leave cash to a person without tying it to one funeral home. Compare the monthly amount you can pay on the <a href=\"" +
      premiumGuide +
      "\">insurance cost guide</a>.",
    faq12q: "How much coverage would I need?",
    faq12a: "Start with a local GPL, add cemetery costs, and add a cushion if you want travel or small debts. A national average is not your amount. The calculator helps size the bill; a quote confirms the premium.",
    insH: "If you want to leave cash, not a package",
    insP1: "<strong>Final expense insurance</strong> is a small <strong>whole life</strong> policy: coverage meant to last a lifetime if the <strong>premiums</strong> — the regular payments — stay current. The <strong>beneficiary</strong> is the person you name. The <strong>death benefit</strong> is the cash that person receives. It does not reserve a service at a specific funeral home.",
    insP2: "If the policy is approved to pay from the start, the family can use that cash when it is needed. If the company only offers a plan with a wait for natural death, that period is in the policy; we do not guess it here. The product is taught on <a href=\"" +
      L.fe +
      "\">final expense insurance</a>. Monthly price is on the <a href=\"" +
      premiumGuide +
      "\">insurance cost guide</a>.",
    vsH: "A funeral-home contract or cash for the family",
    vsP: "Both can take pressure off. They do not buy the same thing. This table summarizes the difference after you understand the payment paths.",
    vsColQ: "Question",
    vsColPre: "Prepaid funeral",
    vsColPreSub: "Goods or services at one funeral home",
    vsColIns: "Final expense insurance",
    vsColInsSub: "Cash for the person you name",
    vsR1H: "What you buy",
    vsR1I: "The lines written in the contract",
    vsR1P: "A policy that pays a cash amount",
    vsR2H: "Who is paid",
    vsR2I: "The funeral home, when it provides the service",
    vsR2P: "The beneficiary, who decides how to spend it",
    vsR3H: "If you move",
    vsR3I: "Transfer can be hard or costly",
    vsR3P: "The policy still pays that person",
    vsR4H: "If plans change",
    vsR4I: "Value usually stays in unused lines",
    vsR4P: "The cash is not tied to a casket or a visitation",
    vsNote: "If you already prepaid a package that covers what you want, you may not need a new policy of the same size. If you want the family to receive money and choose the funeral home later, get a quote.",
    nextH: "Next step",
    nextLead: "Get a free quote for your age and health, or schedule a call with Mejor Vida Insurance.",
    nextMore:
      "Current licenses are on the <a href=\"" +
      L.licenses +
      "\">licenses</a> page. This page does not quote a funeral home or a loan.",
    nextPrimary: "Get a free quote",
    nextPrimaryHref: L.quote,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    quoteTitle: "See insurance prices",
    quote1: "Cash the family can use",
    quote2: "Compare options at your age",
    quoteCta: "See prices",
    srcTitle: "Sources",
    src1: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — GPL, written statement before you pay, buy only what you need.',
    src2: '<a href="https://consumer.ftc.gov/articles/shopping-funeral-services" rel="noopener" target="_blank">FTC: shopping for funeral services</a> — compare funeral homes and do not feel required to take a full package.',
    src3: '<a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA: statistics</a> — 2023 medians for a funeral with viewing and burial ($8,300) or cremation ($6,280).',
    src4: '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">SSA: lump-sum death payment</a> — $255 if the rules apply.',
    src5: '<a href="https://www.va.gov/burials-memorials/veterans-burial-allowance/" rel="noopener" target="_blank">VA: burial allowance</a> — amounts by date of death and whether the death was service-connected.',
    src6: '<a href="https://www.medicare.gov/coverage/hospice-care" rel="noopener" target="_blank">Medicare: hospice coverage</a> — medical care while the person is alive; not a funeral payment.',
    src7: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: life insurance</a> — life insurance pays a benefit to the person named.',
    discTitle: "Disclosure",
    discBody:
      "This page is educational. Mejor Vida Insurance LLC is an independent agency (NPN 21695431) and does not operate a funeral home. Funeral-home and cemetery prices are set by each provider. Public benefits depend on eligibility and date. Life insurance, when mentioned, changes by age, health, tobacco, amount, product, and state. Current licenses are on the <a href=\"" +
      L.licenses +
      "\">licenses</a> page.",
  };
}

function payMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const related = isEs
    ? `<p class="lic-rate-note">Más en esta sección:
<a href="cuanto-cuesta-un-funeral.html">Costo de un funeral</a> ·
<a href="funerales-prepagados.html">Prepagado</a> ·
<a href="como-planificar-su-funeral.html">Cómo planificar</a> ·
<a href="planificacion-patrimonial.html">Plan patrimonial</a> ·
<a href="${L.fe}">Seguro de gastos finales</a> ·
<a href="blog/cuanto-cuesta-seguro-gastos-finales.html">Precio del seguro</a> ·
<a href="blog/medicare-paga-gastos-finales.html">Medicare</a> ·
<a href="final-expense-estimator.html">Calculadora</a></p>`
    : `<p class="lic-rate-note">More in this section:
<a href="how-much-does-a-funeral-cost.html">Funeral cost</a> ·
<a href="prepaid-funerals.html">Prepaid</a> ·
<a href="how-to-plan-your-funeral.html">How to plan</a> ·
<a href="estate-planning.html">Estate planning</a> ·
<a href="${L.fe}">Final expense</a> ·
<a href="final-expense-cost.html">Insurance cost</a> ·
<a href="../blog/medicare-paga-gastos-finales.html">Medicare</a> ·
<a href="final-expense-estimator.html">Calculator</a></p>`;
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
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#need">${isEs ? "El problema" : "The problem"}</a>
<a href="#what">${isEs ? "Las vías" : "The paths"}</a>
<a href="#size">${isEs ? "La cuenta" : "The bill"}</a>
<a href="#gov">${isEs ? "Ayudas" : "Public help"}</a>
<a href="#faq">${isEs ? "Preguntas" : "Questions"}</a>
<a href="#next">${isEs ? "Siguiente" : "Next"}</a>
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
<p>${c.whatP3}</p>
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
<section class="lic-section" id="size">
<h2>${c.sizeH}</h2>
<p>${c.sizeP}</p>
${nfdaScaleHtml(c)}
<p class="lic-cost-lesson">${c.sizeLearn}</p>
<p>${c.sizeP2}</p>
</section>
<section class="lic-section" id="paths">
<h2>${c.pathH}</h2>
<p>${c.pathP}</p>
${pathCardsHtml(c)}
<p class="lic-rate-note">${c.pathNote}</p>
</section>
<section class="lic-section" id="gov">
<h2>${c.govH}</h2>
<p>${c.govP}</p>
${govTableHtml(c)}
<p class="lic-cost-lesson">${c.govLearn}</p>
<div class="lic-helpful"><p>${c.govFlag}</p></div>
</section>
<section class="lic-section" id="medicare">
<h2>${c.medH}</h2>
<p>${c.medP1}</p>
<p>${c.medP2}</p>
</section>
<section class="lic-section" id="borrow">
<h2>${c.borrowH}</h2>
<p>${c.borrowP1}</p>
<p>${c.borrowP2}</p>
</section>
<section class="lic-section" id="help">
<h2>${c.helpH}</h2>
<div class="lic-split-lists">
<div>
<h3>${c.helpYesH}</h3>
<ul>
<li>${c.helpYes1}</li>
<li>${c.helpYes2}</li>
<li>${c.helpYes3}</li>
</ul>
</div>
<div>
<h3>${c.helpNoH}</h3>
<ul>
<li>${c.helpNo1}</li>
<li>${c.helpNo2}</li>
<li>${c.helpNo3}</li>
</ul>
</div>
</div>
</section>
<section class="lic-section" id="ask">
<h2>${c.askH}</h2>
<p>${c.askP}</p>
${askListHtml(c)}
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
<section class="lic-section" id="cash">
<h2>${c.insH}</h2>
<p>${c.insP1}</p>
<p>${c.insP2}</p>
${vsChartHtml(c)}
<p>${c.vsNote}</p>
</section>
${nextStepBandHtml(lang, c, { quoteHref: c.nextPrimaryHref })}
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<section class="lic-section" id="sources">
<h2>${c.srcTitle}</h2>
<ul>
${[c.src1, c.src2, c.src3, c.src4, c.src5, c.src6, c.src7].filter(Boolean).map((s) => `<li>${s}</li>`).join("\n")}
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

module.exports = { copyPay, payMain };
