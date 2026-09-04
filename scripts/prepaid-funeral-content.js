"use strict";

const { quoteRailHtml } = require("./lic-quote-rail");
const { LINKS, faqsHtml, nextStepBandHtml } = require("./preexisting-conditions-content");

function moneyCardsHtml(c) {
  return `<div class="lic-pre-money">
<div class="lic-pre-money__card">
<p class="lic-pre-money__kicker">${c.moneyK1}</p>
<h3>${c.moneyH1}</h3>
<p>${c.moneyP1}</p>
</div>
<div class="lic-pre-money__card lic-pre-money__card--gold">
<p class="lic-pre-money__kicker">${c.moneyK2}</p>
<h3>${c.moneyH2}</h3>
<p>${c.moneyP2}</p>
</div>
<div class="lic-pre-money__card">
<p class="lic-pre-money__kicker">${c.moneyK3}</p>
<h3>${c.moneyH3}</h3>
<p>${c.moneyP3}</p>
</div>
</div>`;
}

function askListHtml(c) {
  const items = [c.ask1, c.ask2, c.ask3, c.ask4, c.ask5, c.ask6]
    .map((item) => `<li>${item}</li>`)
    .join("\n");
  return `<ol class="lic-pre-ask">${items}</ol>`;
}

function vsChartHtml(c) {
  const rows = [
    [c.vsR1H, c.vsR1I, c.vsR1P],
    [c.vsR2H, c.vsR2I, c.vsR2P],
    [c.vsR3H, c.vsR3I, c.vsR3P],
    [c.vsR4H, c.vsR4I, c.vsR4P],
    [c.vsR5H, c.vsR5I, c.vsR5P],
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

function copyPrepaid(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const funeralCost = isEs
    ? "cuanto-cuesta-un-funeral.html"
    : "how-much-does-a-funeral-cost.html";
  const premiumGuide = isEs
    ? "blog/cuanto-cuesta-seguro-gastos-finales.html"
    : "final-expense-cost.html";
  const compareBlog = isEs
    ? "blog/final-expense-vs-prepagado-funerario-2026-07-19.html"
    : "blog/final-expense-vs-prepaid-funeral-2026-07-19.html";
  const estimator = "final-expense-estimator.html";
  if (isEs) {
    return {
      title: "Funeral prepagado: cómo funciona el contrato y qué preguntar | Mejor Vida Seguros",
      desc: "Qué es un funeral prepagado, cómo se paga, dónde queda el dinero, qué no suele incluir y cómo se diferencia de un seguro de gastos finales. No es una cotización de funeraria.",
      h1: "¿Qué es un funeral prepagado?",
      lead: "Un <strong>funeral prepagado</strong> (a veces llamado contrato de <strong>previsión funeraria</strong>) es un acuerdo con una funeraria: usted elige bienes y servicios ahora y paga una parte o el total antes de que hagan falta. No es un seguro de vida. Esta página enseña cómo funciona el contrato, qué preguntar antes de firmar y cuándo el efectivo de una póliza puede ser más flexible para la familia.",
      crumbEnd: "Funeral prepagado",
      take1: "Usted no compra “un funeral” genérico. Compra las líneas que el contrato nombra —ataúd o urna, traslado, velatorio, personal— según la <strong>lista de precios generales</strong> (GPL): el menú escrito que la funeraria debe entregarle.",
      take2: "La <a href=\"https://consumer.ftc.gov/articles/planning-your-own-funeral\" rel=\"noopener\" target=\"_blank\">FTC</a> indica que el dinero anticipado lo regula cada estado. Algunos estados piden que un porcentaje vaya a un <strong>fideicomiso</strong> (dinero guardado bajo reglas estatales) o que se compre un seguro cuyo pago se asigne a la funeraria. Las protecciones no son iguales en todos los estados.",
      take3: "Pagar ahora no congela el precio de forma automática. Pregunte por escrito si el precio queda fijado hoy o se calcula cuando ocurra el fallecimiento. Si no está garantizado, la familia puede deber un complemento.",
      callout: "Planear el funeral y pagarlo por adelantado son dos decisiones distintas. Puede dejar preferencias por escrito sin entregar el dinero a una funeraria concreta.",
      needH: "El problema que las familias quieren resolver",
      needP1: "Cuando alguien fallece, alguien tiene que pagar el cuidado del cuerpo, el lugar de descanso y, si la familia lo quiere, un servicio. Esa cuenta llega rápido. Medicare no la paga. El <a href=\"https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment\" rel=\"noopener\" target=\"_blank\">Seguro Social</a> puede entregar un único pago de $255 si se cumplen sus reglas. Eso no cubre un sepelio típico.",
      needP2: "Muchas personas quieren ahorrarle a los hijos esa factura y esas decisiones. Un camino es firmar ahora con una funeraria. Otro es dejar efectivo a una persona de confianza. Suenan parecidos. No son el mismo contrato, y la diferencia aparece si la familia se muda, cambia de plan o el negocio cierra.",
      whatH: "Qué significa, en la práctica",
      whatP1: "En un funeral prepagado, usted y la funeraria acuerdan bienes y servicios para más adelante. Puede pagar todo de una vez o una parte ahora y el resto después, según el contrato. La <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule de la FTC</a> también aplica cuando se planea por adelantado: puede comprar solo lo que necesita y debe recibir precios por escrito.",
      whatP2: "El contrato no convierte a la funeraria en su banco ni en un seguro. Es un proveedor de servicios. Si el acuerdo nombra un ataúd, un velatorio y un traslado, eso es lo que queda prometido —no “todo lo que cueste enterrar a alguien” en cualquier ciudad, en cualquier año.",
      whatP3: "Usted también puede planear sin prepagar. La FTC recomienda poner las preferencias por escrito, dar copias a la familia y no dejar la única copia en un testamento o en una caja de seguridad que nadie pueda abrir el fin de semana del funeral.",
      fact1H: "Lo que suele estar en el contrato",
      fact1P: "Líneas de la funeraria que usted elige: traslado, cuidado del cuerpo, uso de las instalaciones, personal del servicio, ataúd o urna, y el cargo básico que casi todas las funerarias publican.",
      fact2H: "Lo que a menudo va aparte",
      fact2P: "Parcela o nicho, abrir y cerrar la tumba, bóveda si el cementerio la exige, lápida, flores, obituario y viaje de familiares. Confirme cada línea. No asuma que “funeral prepagado” incluye el camposanto.",
      fact3H: "Lo que la ley le permite elegir",
      fact3P: "Puede rechazar un paquete entero. Puede llevar un ataúd o una urna comprados en otro lugar. Para cremación, puede usar un contenedor sencillo; ningún estado exige un ataúd de exposición para cremar.",
      howH: "Cómo se arma el contrato",
      howP1: "Pida la GPL antes de elegir. Compare al menos dos funerarias. Marque solo las líneas que quiere. Después, la funeraria debe darle un estado de cuenta escrito con cada bien o servicio y el total, antes de que pague.",
      howP2: "Si paga a plazos, lea qué pasa si deja de pagar, si hay cargos extra y si el precio de las líneas queda fijo. No hay una tasa de interés nacional publicada que podamos citar aquí: esa cifra, si existe, está en el propio contrato.",
      howP3: "Al fallecer, la familia todavía puede cambiar algo. Si cambian el plan o deben pagar un complemento porque los precios no estaban garantizados, la Funeral Rule exige otra vez listas de precios y un estado de cuenta.",
      moneyH: "Dónde queda el dinero que usted adelanta",
      moneyP: "La FTC es clara: el manejo del dinero lo pone cada estado, y algunas leyes estatales ofrecen poca protección efectiva. Antes de entregar fondos, pregunte cuál de estos caminos usa ese contrato.",
      moneyK1: "Camino 1",
      moneyH1: "Fideicomiso estatal",
      moneyP1: "En algunos estados, un porcentaje del pago debe ir a un fideicomiso regulado. Pregunte qué porcentaje entra, quién es el fiduciario y qué pasa con los intereses.",
      moneyK2: "Camino 2",
      moneyH2: "Seguro asignado a la funeraria",
      moneyP2: "Algunos contratos se financian con un seguro de vida cuyo pago se <strong>asigna</strong> a la funeraria: esa empresa queda nombrada para cobrar el beneficio y prestar el servicio. Pregunte quién es el dueño de la póliza y si puede cambiar de proveedor.",
      moneyK3: "Lo que debe preguntar",
      moneyH3: "¿Cuál usa este contrato?",
      moneyP3: "No adivinamos el porcentaje ni la póliza de una funeraria concreta. Si no se lo explican por escrito, no firme.",
      moneyNote: "Si la funeraria cierra, se vende o cambia de dueño, la protección depende de esas reglas estatales y del texto del contrato —no de una garantía federal única.",
      inH: "Qué suele cubrirse — y qué no",
      inP: "Un prepago no es un paquete mágico de “todo el sepelio.” Es la lista que usted firmó. Dos contratos en la misma ciudad pueden incluir cosas distintas bajo el mismo nombre comercial.",
      inYesH: "Suele estar, si está escrito",
      inYes1: "Servicios de la funeraria que usted marcó en la GPL.",
      inYes2: "Mercancía de la funeraria que usted eligió, como un ataúd o una urna concretos.",
      inYes3: "A veces el certificado de defunción u otros trámites, solo si el contrato los nombra.",
      inNoH: "A menudo no está, salvo que lo diga",
      inNo1: "Parcela, nicho, apertura de tumba y reglas del cementerio.",
      inNo2: "Lápida, flores, comida, boletos de avión y honorarios religiosos.",
      inNo3: "Un funeral en otra ciudad si usted se mudó y el contrato no se puede trasladar.",
      inNote: "La Funeral Rule no suele aplicar a cementerios que no tienen funeraria en el mismo lugar, ni a vendedores de ataúdes o monumentos ajenos a la funeraria. Esas facturas pueden seguir llegando.",
      helpH: "Cuándo puede ayudar — y dónde se queda corto",
      helpYesH: "Puede tener sentido si",
      helpYes1: "Quiere dejar elegidas las líneas del servicio con una funeraria de confianza, y no planea mudarse.",
      helpYes2: "El contrato fija por escrito el precio de esas líneas y usted puede pagarlas ahora sin dejar a la familia sin efectivo.",
      helpYes3: "La familia sabe dónde está el contrato, para no pagar el mismo funeral dos veces.",
      helpNoH: "Queda corto si",
      helpNo1: "La familia puede vivir en otra ciudad cuando llegue el momento. Trasladar el plan, dice la FTC, a veces se puede —a menudo con un costo extra.",
      helpNo2: "Los precios no están garantizados. Entonces el prepago no “protege contra la inflación”: la familia puede deber más.",
      helpNo3: "Quiere que alguien reciba efectivo para deudas, viaje o una cremación más sencilla. El valor suele quedar atado a las líneas del contrato, no a un cheque libre.",
      helpFlag: "No publicamos que un funeral prepagado “siempre” cubre la subida de precios. La FTC describe el otro caso: la familia puede tener que pagar un complemento si el plan no congeló el precio.",
      askH: "Seis preguntas antes de entregar dinero",
      askP: "Estas preguntas salen de la propia lista de la FTC para quien piensa prepagar. Pida las respuestas en el contrato, no de palabra.",
      ask1: "¿Estoy comprando solo mercancía (ataúd, urna, bóveda) o también los servicios de la funeraria?",
      ask2: "¿Qué ocurre con el dinero que adelanto? ¿Va a un fideicomiso, a un seguro asignado a la funeraria, u otro arreglo?",
      ask3: "Si el dinero está en un fideicomiso, ¿quién se queda con los intereses?",
      ask4: "¿Qué protección hay si esa funeraria cierra o cambia de dueño?",
      ask5: "¿Puedo cancelar y recuperar el dinero si cambio de opinión? ¿El contrato es <strong>irrevocable</strong> (no se puede deshacer) o se puede anular?",
      ask6: "¿Qué pasa si me mudo o fallezco lejos de casa? ¿Se puede trasladar el plan y a qué costo?",
      askAfter: "Dígale a la familia que el contrato existe y dónde está. Si nadie lo sabe, pueden pagar de nuevo el mismo servicio.",
      costH: "Cuánto cuesta prepagar",
      costP: "El precio del prepago es el de las líneas que usted elige, no un producto nacional con una sola etiqueta. No publicamos un rango del tipo “de tantos a tantos miles” para “planes prepagados”: esa cifra no es una mediana oficial de un contrato, y mezclarla con un funeral promedio confundiría al lector.",
      costP2: "Para dimensionar la cuenta que podría estar adelantando, use las mismas cifras públicas de funeraria que enseñamos en la <a href=\"" +
        funeralCost +
        "\">guía de cuánto cuesta un funeral</a>. La <a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA</a> publicó, para 2023, una mediana de <strong>$8,300</strong> por un funeral con velatorio y entierro, y <strong>$6,280</strong> con velatorio y cremación. Parcela, bóveda y lápida suelen ir aparte.",
      nfdaKicker: "Mediana NFDA 2023",
      nfda1: "Funeral con velatorio y entierro (lado de la funeraria)",
      nfda2: "Funeral con velatorio y cremación (lado de la funeraria)",
      costLearn: "Lo que debe llevarse: si prepagara un funeral con velatorio, está adelantando miles de dólares de servicios de funeraria. Si solo quiere una cremación sin servicio, la cuenta suele ser más baja —y el contrato debería decir exactamente eso, no un “paquete tradicional.”",
      costP3: "Su GPL local es la cifra real. La <a href=\"" +
        estimator +
        "\">calculadora de gastos finales</a> ayuda a ver un estimado por estado; no cotiza una funeraria ni un contrato prepagado.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Un funeral prepagado es lo mismo que un seguro de gastos finales?",
      faq1a: "No. El prepagado es un contrato con una funeraria por bienes o servicios. Un seguro de gastos finales es una póliza de vida: paga efectivo a la persona que usted nombró. Esa persona decide dónde gastarlo.",
      faq2q: "¿El prepago congela el precio de hoy?",
      faq2a: "Solo si el contrato lo dice por escrito. Algunos planes fijan el precio al comprar; otros lo calculan cuando hace falta. Si no está garantizado, la familia puede deber un complemento.",
      faq3q: "¿Puedo pagar a plazos?",
      faq3a: "Muchos contratos permiten pagar una parte o el total por adelantado. Si hay plazos, los cargos extra y lo que ocurre si deja de pagar están en ese contrato. No hay una tasa nacional que podamos citar.",
      faq4q: "¿Qué pasa si me mudo?",
      faq4a: "Algunos planes se pueden trasladar, a menudo con un costo extra. Otros quedan atados a esa funeraria. Pregúntelo antes de firmar. El efectivo de una póliza de vida viaja con la persona que usted nombró.",
      faq5q: "¿Y si la funeraria cierra?",
      faq5a: "Depende de la ley de su estado y de si el dinero está en un fideicomiso o en un seguro asignado. La FTC advierte que algunas leyes estatales ofrecen poca protección efectiva. Pida esa respuesta por escrito.",
      faq6q: "¿Puedo cancelar y recuperar el dinero?",
      faq6a: "Depende del contrato y del estado. Un arreglo irrevocable no se puede deshacer a voluntad. Uno que sí se puede anular puede devolver una parte o el total, a veces menos cargos. Léalo antes de pagar.",
      faq7q: "¿Incluye la parcela del cementerio?",
      faq7a: "No de forma automática. La parcela, abrir y cerrar, y a veces la bóveda, suelen ser otras facturas. La Funeral Rule no cubre igual a un cementerio sin funeraria en el sitio.",
      faq8q: "¿Sigue valiendo la Funeral Rule si pago ahora?",
      faq8a: "Sí. Puede comprar por separado, pedir la GPL y llevar un ataúd o urna de otro vendedor. Si la familia cambia el plan o debe pagar más, también deben recibir precios por escrito.",
      faq9q: "¿Cuánto debo prepagar?",
      faq9a: "El monto es el de las líneas que elija en la GPL, más cementerio si lo compra aparte. Un promedio nacional no es su factura. Empiece por la guía de costos del funeral y pida dos GPL locales.",
      faq10q: "¿El SSI cuenta un funeral prepagado como recurso?",
      faq10a: "El Seguro Social puede excluir hasta $1,500 por persona en fondos de entierro si están separados y claramente destinados a eso. Un contrato de funeral puede entrar en esas reglas. La cifra exacta y si el contrato es irrevocable cambian el recuento. Confírmelo en la oficina del Seguro Social; no es asesoría de beneficios.",
      faq11q: "¿Medicare o Medicaid pagan el funeral prepagado?",
      faq11a: "Medicare es seguro médico: no lo tratamos como un plan funerario. Medicaid es de cada estado; no publicamos una regla nacional de “Medicaid paga el prepago.” Si recibe SSI o Medicaid, hable con esa oficina antes de firmar un contrato irrevocable.",
      faq12q: "¿Debo decírselo a la familia?",
      faq12a: "Sí. La FTC advierte que si nadie sabe que usted ya pagó, pueden volver a pagar el mismo funeral. Deje el contrato donde la familia pueda encontrarlo; no solo en una caja de seguridad.",
      altH: "Si lo que quiere es dejar efectivo, no un paquete",
      altP1: "Un <strong>seguro de gastos finales</strong> es una póliza pequeña de <strong>vida entera</strong>: cobertura pensada para durar toda la vida si las primas —el pago regular— se mantienen al día. El <strong>beneficiario</strong> es la persona que usted nombra. El <strong>beneficio por fallecimiento</strong> es el efectivo que esa persona recibe. No reserva un servicio en una funeraria concreta.",
      altP2: "Ese producto se enseña en <a href=\"" +
        L.fe +
        "\">seguro de gastos finales</a>. El precio mensual —edad, salud, tabaco, monto— está en la <a href=\"" +
        premiumGuide +
        "\">guía del precio del seguro</a>. Una comparación breve también está en el <a href=\"" +
        compareBlog +
        "\">artículo de gastos finales frente a prepagado</a>.",
      vsH: "Contrato en la funeraria o efectivo para la familia",
      vsP: "Ambos pueden quitar presión. No compran lo mismo. Esta tabla resume la diferencia después de entender el prepago; no sustituye el contrato ni una ilustración de póliza.",
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
      vsR4I: "El valor suele quedar en las líneas no usadas, según el contrato",
      vsR4P: "El efectivo no está atado a un ataúd o a un velatorio",
      vsR5H: "Cómo se paga",
      vsR5I: "Un total ahora, o plazos según ese contrato",
      vsR5P: "Una prima regular mientras la póliza esté vigente",
      vsNote: "Si ya prepagó un paquete que cubre lo que quiere, puede no necesitar una póliza nueva del mismo tamaño. Si quiere que la familia reciba dinero y elija la funeraria más adelante, pida una cotización.",
      nextH: "Siguiente paso",
      nextLead: "Pida una cotización gratuita con su edad y salud, o agende una llamada con Mejor Vida Seguros.",
      nextMore:
        "Licencias actuales en la página de <a href=\"" +
        L.licenses +
        "\">licencias</a>. Esta página no vende ni cotiza un contrato de funeraria.",
      nextPrimary: "Cotización gratuita",
      nextPrimaryHref: L.quote,
      nextSecondary: "Agendar una llamada",
      nextSecondaryHref: L.schedule,
      quoteTitle: "Ver precios del seguro",
      quote1: "Efectivo para la familia",
      quote2: "No queda atado a una funeraria",
      quoteCta: "Ver precios",
      srcTitle: "Fuentes",
      src1: '<a href="https://consumer.ftc.gov/articles/planning-your-own-funeral" rel="noopener" target="_blank">FTC: planear su propio funeral</a> — prepago, fideicomiso o seguro asignado, mudanza, cancelación y avisar a la familia.',
      src2: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — GPL, comprar solo lo necesario, ataúd o urna de otro vendedor; también aplica al planear por adelantado.',
      src3: '<a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA: estadísticas</a> — medianas 2023 de funeral con velatorio y entierro ($8,300) o cremación ($6,280).',
      src4: '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">Seguro Social: pago único por fallecimiento</a> — $255 si aplican las reglas.',
      src5: '<a href="https://www.ssa.gov/ssi/spotlights/spot-burial-funds.htm" rel="noopener" target="_blank">SSI: fondos de entierro</a> — hasta $1,500 por persona si están separados y destinados al entierro; un contrato prepagado puede entrar en esas reglas.',
      src6: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: seguro de vida</a> — el seguro de vida paga un beneficio a la persona nombrada; no es un contrato de funeraria.',
      discTitle: "Divulgaciones",
      discBody:
        "Esta página es educativa. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431) y no opera una funeraria. Los contratos prepagados los vende cada funeraria y los regula cada estado. Las cifras nacionales de funeral no son el precio de un plan prepagado. El seguro de vida, si se menciona, varía por edad, salud, tabaco, monto, producto y estado. Las licencias actuales están en la página de <a href=\"" +
        L.licenses +
        "\">licencias</a>.",
    };
  }
  return {
    title: "Prepaid funerals: how the contract works and what to ask | Mejor Vida Insurance",
    desc: "What a prepaid funeral is, how it is paid, where the money goes, what it often leaves out, and how it differs from final expense insurance. This is not a funeral-home quote.",
    h1: "What is a prepaid funeral?",
    lead: "A <strong>prepaid funeral</strong> (also called a <strong>preneed</strong> contract) is an agreement with a funeral home: you choose goods and services now and pay some or all of the cost before they are needed. It is not life insurance. This page explains how the contract works, what to ask before you sign, and when cash from a policy may give the family more flexibility.",
    crumbEnd: "Prepaid funeral",
    take1: "You are not buying a generic “funeral.” You are buying the lines named in the contract — casket or urn, transfer, visitation, staff — from the <strong>General Price List</strong> (GPL): the written menu the funeral home must give you.",
    take2: "The <a href=\"https://consumer.ftc.gov/articles/planning-your-own-funeral\" rel=\"noopener\" target=\"_blank\">FTC</a> says prepaid money is governed by each state. Some states require a percentage to go into a <strong>trust</strong> (money held under state rules) or a life policy whose payment is assigned to the funeral home. Protections are not the same everywhere.",
    take3: "Paying now does not automatically freeze today’s price. Ask in writing whether the price is locked at purchase or set when the death occurs. If it is not guaranteed, the family may owe a balance.",
    callout: "Planning a funeral and prepaying for it are two different decisions. You can write down your wishes without sending money to one funeral home.",
    needH: "The problem families are trying to solve",
    needP1: "When someone dies, someone has to pay for care of the body, a resting place, and, if the family wants one, a service. That bill arrives quickly. Medicare does not pay it. <a href=\"https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment\" rel=\"noopener\" target=\"_blank\">Social Security</a> may pay a one-time $255 if its rules are met. That does not cover a typical funeral.",
    needP2: "Many people want to spare their children that bill and those decisions. One path is to sign with a funeral home now. Another is to leave cash to a trusted person. They sound alike. They are not the same contract, and the difference shows up if the family moves, changes plans, or the business closes.",
    whatH: "What it means in practice",
    whatP1: "With a prepaid funeral, you and the funeral home agree on goods and services for later. You may pay in full now or pay some now and the rest later, depending on the contract. The <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC Funeral Rule</a> still applies when you plan ahead: you may buy only what you need, and you must receive written prices.",
    whatP2: "The contract does not turn the funeral home into your bank or into an insurance company. It is a service provider. If the agreement names a casket, a visitation, and a transfer, that is what is promised — not “whatever burial costs” in any city, in any year.",
    whatP3: "You can also plan without prepaying. The FTC recommends putting preferences in writing, giving copies to the family, and not leaving the only copy in a will or a safe-deposit box that nobody can open on the weekend of the funeral.",
    fact1H: "What the contract often includes",
    fact1P: "Funeral-home lines you choose: transfer, care of the body, use of the facilities, service staff, a casket or urn, and the basic fee almost every funeral home publishes.",
    fact2H: "What is often extra",
    fact2P: "A plot or niche, opening and closing the grave, a vault if the cemetery requires one, a marker, flowers, an obituary, and travel for relatives. Confirm each line. Do not assume “prepaid funeral” includes the cemetery.",
    fact3H: "What the law lets you choose",
    fact3P: "You can refuse a full package. You can bring a casket or urn bought somewhere else. For cremation, you may use a simple alternative container; no state requires a display casket to cremate.",
    howH: "How the contract is put together",
    howP1: "Ask for the GPL before you choose. Compare at least two funeral homes. Mark only the lines you want. Then the funeral home must give you a written statement of each good or service and the total, before you pay.",
    howP2: "If you pay over time, read what happens if you stop paying, whether extra charges apply, and whether the line prices stay fixed. There is no national interest rate we can cite here: that figure, if it exists, is in the contract itself.",
    howP3: "After the death, the family can still change something. If they change the plan or must pay more because prices were not guaranteed, the Funeral Rule again requires price lists and a written statement.",
    moneyH: "Where the money you pay in advance goes",
    moneyP: "The FTC is clear: how prepaid funds are handled is set by each state, and some state laws offer little effective protection. Before you hand over money, ask which of these paths that contract uses.",
    moneyK1: "Path 1",
    moneyH1: "A state-regulated trust",
    moneyP1: "Some states require a percentage of the payment to go into a regulated trust. Ask what percentage is deposited, who the trustee is, and what happens to the interest.",
    moneyK2: "Path 2",
    moneyH2: "Insurance assigned to the funeral home",
    moneyP2: "Some contracts are funded with a life policy whose payment is <strong>assigned</strong> to the funeral home: that business is named to collect the benefit and provide the service. Ask who owns the policy and whether you can change providers.",
    moneyK3: "What you should ask",
    moneyH3: "Which path does this contract use?",
    moneyP3: "We do not guess a funeral home’s trust percentage or policy. If they will not put it in writing, do not sign.",
    moneyNote: "If the funeral home closes, is sold, or changes owners, protection depends on those state rules and the contract text — not on one federal guarantee.",
    inH: "What is usually covered — and what is not",
    inP: "A prepay is not a magic “whole funeral” bundle. It is the list you signed. Two contracts in the same city can include different things under the same sales name.",
    inYesH: "Usually included, if it is written down",
    inYes1: "Funeral-home services you marked on the GPL.",
    inYes2: "Funeral-home merchandise you chose, such as a specific casket or urn.",
    inYes3: "Sometimes a death certificate or other paperwork, only if the contract names it.",
    inNoH: "Often not included unless it says so",
    inNo1: "A plot or niche, opening the grave, and cemetery rules.",
    inNo2: "A headstone, flowers, food, airfare, and clergy fees.",
    inNo3: "A funeral in another city if you moved and the contract cannot be transferred.",
    inNote: "The Funeral Rule generally does not cover cemeteries that have no funeral home on site, or outside casket and monument sellers. Those bills can still arrive.",
    helpH: "When it can help — and where it falls short",
    helpYesH: "It may make sense if",
    helpYes1: "You want the service lines chosen with a funeral home you trust, and you do not plan to move.",
    helpYes2: "The contract locks those line prices in writing, and you can pay them now without leaving the family short of cash.",
    helpYes3: "The family knows where the contract is, so they do not pay for the same funeral twice.",
    helpNoH: "It falls short if",
    helpNo1: "The family may live in another city when the time comes. The FTC says some plans can be transferred — often at added cost.",
    helpNo2: "Prices are not guaranteed. Then the prepay does not “protect against inflation”: the family may still owe more.",
    helpNo3: "You want someone to receive cash for debts, travel, or a simpler cremation. Value is usually tied to the contract lines, not to an unrestricted check.",
    helpFlag: "We do not publish that a prepaid funeral “always” covers rising prices. The FTC describes the other case: survivors may be asked to pay extra when the plan did not freeze the price.",
    askH: "Six questions before you hand over money",
    askP: "These questions come from the FTC’s own list for people thinking about prepaying. Get the answers in the contract, not only in conversation.",
    ask1: "What are you paying for? Only merchandise (casket, urn, vault), or funeral services as well?",
    ask2: "What happens to the money you prepay? Does it go into a trust, a policy assigned to the funeral home, or another arrangement?",
    ask3: "If the money is in a trust, who keeps the interest?",
    ask4: "Are you protected if that firm goes out of business?",
    ask5: "Can you cancel and get a refund if you change your mind? Is the contract <strong>irrevocable</strong> (it cannot be undone) or can it be canceled?",
    ask6: "What happens if you move or die away from home? Can the plan be transferred, and at what cost?",
    askAfter: "Tell the family the contract exists and where it is. If nobody knows, they may pay for the same service again.",
    costH: "What it costs to prepay",
    costP: "The price of a prepay is the price of the lines you choose, not a national product with one sticker. We do not publish a “prepaid plans cost X to Y” range: that is not an official median for a contract, and mixing it with an average funeral would mislead the reader.",
    costP2: "To size the bill you might be paying in advance, use the same public funeral-home figures we teach on <a href=\"" +
      funeralCost +
      "\">how much a funeral costs</a>. The <a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA</a> published 2023 medians of <strong>$8,300</strong> for a funeral with viewing and burial, and <strong>$6,280</strong> with viewing and cremation. A plot, vault, and marker are usually extra.",
    nfdaKicker: "NFDA 2023 median",
    nfda1: "Funeral with viewing and burial (funeral-home side)",
    nfda2: "Funeral with viewing and cremation (funeral-home side)",
    costLearn: "Takeaway: if you prepaid a funeral with visitation, you would be advancing thousands of dollars of funeral-home services. If you only want a cremation with no service, the bill is usually lower — and the contract should say exactly that, not a “traditional package.”",
    costP3: "Your local GPL is the real number. The <a href=\"" +
      estimator +
      "\">final expense calculator</a> helps size a state-level estimate; it does not quote a funeral home or a prepaid contract.",
    faqTitle: "Frequently asked questions",
    faq1q: "Is a prepaid funeral the same as final expense insurance?",
    faq1a: "No. A prepaid funeral is a contract with a funeral home for goods or services. Final expense insurance is a life policy: it pays cash to the person you named. That person decides where to spend it.",
    faq2q: "Does prepaying lock in today’s price?",
    faq2a: "Only if the contract says so in writing. Some plans freeze the price at purchase; others set it when the death occurs. If it is not guaranteed, the family may owe a balance.",
    faq3q: "Can I pay in installments?",
    faq3a: "Many contracts let you pay some or all of the cost in advance. If there is a payment plan, extra charges and what happens if you stop paying are in that contract. There is no national rate we can cite.",
    faq4q: "What if I move?",
    faq4a: "Some plans can be transferred, often at added cost. Others stay tied to that funeral home. Ask before you sign. Cash from a life policy travels with the person you named.",
    faq5q: "What if the funeral home closes?",
    faq5a: "It depends on your state’s law and whether the money is in a trust or in assigned insurance. The FTC warns that some state laws offer little effective protection. Get that answer in writing.",
    faq6q: "Can I cancel and get my money back?",
    faq6a: "It depends on the contract and the state. An irrevocable arrangement cannot be undone at will. A cancelable one may return some or all of the money, sometimes minus fees. Read it before you pay.",
    faq7q: "Does it include the cemetery plot?",
    faq7a: "Not automatically. The plot, opening and closing, and sometimes a vault are often separate bills. The Funeral Rule does not cover a cemetery without an on-site funeral home in the same way.",
    faq8q: "Does the Funeral Rule still apply if I pay now?",
    faq8a: "Yes. You may buy items separately, ask for the GPL, and bring a casket or urn from another seller. If the family changes the plan or must pay more, they must also receive written prices.",
    faq9q: "How much should I prepay?",
    faq9a: "The amount is the lines you choose on the GPL, plus cemetery items if you buy those separately. A national average is not your bill. Start with the funeral cost guide and ask for two local GPLs.",
    faq10q: "Does SSI count a prepaid funeral as a resource?",
    faq10a: "Social Security may exclude up to $1,500 per person in burial funds if they are kept separate and clearly set aside for burial. A funeral contract can fall under those rules. The exact figure, and whether the contract is irrevocable, changes the count. Confirm with Social Security; this is not benefits advice.",
    faq11q: "Do Medicare or Medicaid pay for a prepaid funeral?",
    faq11a: "Medicare is health insurance: we do not treat it as a funeral plan. Medicaid is run by each state; we do not publish a nationwide “Medicaid pays the prepay” rule. If you receive SSI or Medicaid, talk with that office before signing an irrevocable contract.",
    faq12q: "Should I tell my family?",
    faq12a: "Yes. The FTC warns that if nobody knows you already paid, they may pay for the same funeral again. Leave the contract where the family can find it — not only in a safe-deposit box.",
    altH: "If you want to leave cash, not a package",
    altP1: "<strong>Final expense insurance</strong> is a small <strong>whole life</strong> policy: coverage meant to last a lifetime if the <strong>premiums</strong> — the regular payments — stay current. The <strong>beneficiary</strong> is the person you name. The <strong>death benefit</strong> is the cash that person receives. It does not reserve a service at a specific funeral home.",
    altP2: "That product is taught on <a href=\"" +
      L.fe +
      "\">final expense insurance</a>. Monthly price — age, health, tobacco, amount — is on the <a href=\"" +
      premiumGuide +
      "\">insurance cost guide</a>. A short comparison is also in the <a href=\"" +
      compareBlog +
      "\">final expense vs. prepaid article</a>.",
    vsH: "A funeral-home contract or cash for the family",
    vsP: "Both can take pressure off. They do not buy the same thing. This table summarizes the difference after you understand the prepay; it does not replace the contract or a policy illustration.",
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
    vsR4I: "Value usually stays in unused lines, per the contract",
    vsR4P: "The cash is not tied to a casket or a visitation",
    vsR5H: "How you pay",
    vsR5I: "A total now, or installments under that contract",
    vsR5P: "A regular premium while the policy stays in force",
    vsNote: "If you already prepaid a package that covers what you want, you may not need a new policy of the same size. If you want the family to receive money and choose the funeral home later, get a quote.",
    nextH: "Next step",
    nextLead: "Get a free quote for your age and health, or schedule a call with Mejor Vida Insurance.",
    nextMore:
      "Current licenses are on the <a href=\"" +
      L.licenses +
      "\">licenses</a> page. This page does not sell or quote a funeral-home contract.",
    nextPrimary: "Get a free quote",
    nextPrimaryHref: L.quote,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    quoteTitle: "See insurance prices",
    quote1: "Cash the family can use",
    quote2: "Not locked to one funeral home",
    quoteCta: "See prices",
    srcTitle: "Sources",
    src1: '<a href="https://consumer.ftc.gov/articles/planning-your-own-funeral" rel="noopener" target="_blank">FTC: planning your own funeral</a> — prepaying, trust or assigned insurance, moving, cancellation, and telling the family.',
    src2: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — GPL, buy only what you need, outside casket or urn; also applies when you plan ahead.',
    src3: '<a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA: statistics</a> — 2023 medians for a funeral with viewing and burial ($8,300) or cremation ($6,280).',
    src4: '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">SSA: lump-sum death payment</a> — $255 if the rules apply.',
    src5: '<a href="https://www.ssa.gov/ssi/spotlights/spot-burial-funds.htm" rel="noopener" target="_blank">SSI: burial funds</a> — up to $1,500 per person if kept separate and set aside for burial; a prepaid contract can fall under those rules.',
    src6: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: life insurance</a> — life insurance pays a benefit to the person named; it is not a funeral-home contract.',
    discTitle: "Disclosure",
    discBody:
      "This page is educational. Mejor Vida Insurance LLC is an independent agency (NPN 21695431) and does not operate a funeral home. Prepaid contracts are sold by each funeral home and regulated by each state. National funeral figures are not the price of a prepaid plan. Life insurance, when mentioned, changes by age, health, tobacco, amount, product, and state. Current licenses are on the <a href=\"" +
      L.licenses +
      "\">licenses</a> page.",
  };
}

function prepaidMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const related = isEs
    ? `<p class="lic-rate-note">Más en esta sección:
<a href="cuanto-cuesta-un-funeral.html">Costo de un funeral</a> ·
<a href="final-expense-estimator.html">Calculadora</a> ·
<a href="${L.fe}">Seguro de gastos finales</a> ·
<a href="blog/cuanto-cuesta-seguro-gastos-finales.html">Precio del seguro</a> ·
<a href="seguro-para-cremacion.html">Cremación</a> ·
<a href="como-pagar-un-funeral.html">Cómo se paga</a> ·
<a href="como-planificar-su-funeral.html">Cómo planificar</a></p>`
    : `<p class="lic-rate-note">More in this section:
<a href="how-much-does-a-funeral-cost.html">Funeral cost</a> ·
<a href="final-expense-estimator.html">Calculator</a> ·
<a href="${L.fe}">Final expense</a> ·
<a href="final-expense-cost.html">Insurance cost</a> ·
<a href="cremation-insurance.html">Cremation</a> ·
<a href="how-to-pay-for-a-funeral.html">How it’s paid</a> ·
<a href="how-to-plan-your-funeral.html">How to plan</a></p>`;
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
<a href="#what">${isEs ? "Qué es" : "What it is"}</a>
<a href="#how">${isEs ? "El contrato" : "The contract"}</a>
<a href="#money">${isEs ? "El dinero" : "The money"}</a>
<a href="#ask">${isEs ? "Pregunte" : "Ask first"}</a>
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
<section class="lic-section" id="money">
<h2>${c.moneyH}</h2>
<p>${c.moneyP}</p>
${moneyCardsHtml(c)}
<p class="lic-cost-lesson">${c.moneyNote}</p>
</section>
<section class="lic-section" id="included">
<h2>${c.inH}</h2>
<p>${c.inP}</p>
<div class="lic-split-lists lic-split-lists--cards">
<div class="lic-split-lists__yes">
<h3>${c.inYesH}</h3>
<ul>
<li>${c.inYes1}</li>
<li>${c.inYes2}</li>
<li>${c.inYes3}</li>
</ul>
</div>
<div class="lic-split-lists__no">
<h3>${c.inNoH}</h3>
<ul>
<li>${c.inNo1}</li>
<li>${c.inNo2}</li>
<li>${c.inNo3}</li>
</ul>
</div>
</div>
<p class="lic-rate-note">${c.inNote}</p>
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
<div class="lic-helpful"><p>${c.helpFlag}</p></div>
</section>
<section class="lic-section" id="ask">
<h2>${c.askH}</h2>
<p>${c.askP}</p>
${askListHtml(c)}
<p class="lic-cost-lesson">${c.askAfter}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<p>${c.costP2}</p>
${nfdaScaleHtml(c)}
<p class="lic-cost-lesson">${c.costLearn}</p>
<p>${c.costP3}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
<section class="lic-section" id="cash">
<h2>${c.altH}</h2>
<p>${c.altP1}</p>
<p>${c.altP2}</p>
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
${[c.src1, c.src2, c.src3, c.src4, c.src5, c.src6].filter(Boolean).map((s) => `<li>${s}</li>`).join("\n")}
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

module.exports = { copyPrepaid, prepaidMain };
