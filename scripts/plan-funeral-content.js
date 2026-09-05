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

function decideListHtml(c) {
  const items = [c.dec1, c.dec2, c.dec3, c.dec4, c.dec5, c.dec6]
    .map((item) => `<li>${item}</li>`)
    .join("\n");
  return `<ol class="lic-pre-ask">${items}</ol>`;
}

function vsChartThreeHtml(c) {
  const rows = [
    ["vsR1H", "vsR1A", "vsR1B", "vsR1C"],
    ["vsR2H", "vsR2A", "vsR2B", "vsR2C"],
    ["vsR3H", "vsR3A", "vsR3B", "vsR3C"],
    ["vsR4H", "vsR4A", "vsR4B", "vsR4C"],
  ];
  return `<div class="lic-vs-chart lic-vs-chart--three" role="table" aria-label="${c.vsH}">
<div class="lic-vs-chart__row lic-vs-chart__head" role="row">
<div class="lic-vs-chart__q lic-vs-chart__q--blank" role="columnheader"></div>
<div class="lic-vs-chart__ins" role="columnheader"><strong>${c.vsCol1}</strong><span>${c.vsCol1Sub}</span></div>
<div class="lic-vs-chart__mid" role="columnheader"><strong>${c.vsCol2}</strong><span>${c.vsCol2Sub}</span></div>
<div class="lic-vs-chart__pre" role="columnheader"><strong>${c.vsCol3}</strong><span>${c.vsCol3Sub}</span></div>
</div>
${rows
  .map(
    ([h, a, b, d]) => `<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c[h]}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.vsCol1}">${c[a]}</div>
<div class="lic-vs-chart__mid" role="cell" data-label="${c.vsCol2}">${c[b]}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.vsCol3}">${c[d]}</div>
</div>`
  )
  .join("\n")}
</div>
<p class="lic-rate-note">${c.vsLearn}</p>`;
}

function copyPlan(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const funeralCost = isEs
    ? "cuanto-cuesta-un-funeral.html"
    : "how-much-does-a-funeral-cost.html";
  const prepaid = isEs ? "funerales-prepagados.html" : "prepaid-funerals.html";
  const pay = isEs ? "como-pagar-un-funeral.html" : "how-to-pay-for-a-funeral.html";
  const premiumGuide = isEs
    ? "blog/cuanto-cuesta-seguro-gastos-finales.html"
    : "final-expense-cost.html";
  if (isEs) {
    return {
      title: "Cómo planificar su funeral: preferencias por escrito, no un paquete | Mejor Vida Seguros",
      desc: "Planear un funeral es dejar por escrito lo que quiere: tipo de servicio, funeraria, cementerio y quién tiene copias. Pagar por adelantado es otra decisión. Guía de Mejor Vida Seguros.",
      h1: "¿Cómo planificar su funeral?",
      lead: "Anote lo que quiere para su funeral, para que la familia no tenga que adivinarlo con prisa. Incluya si prefiere entierro o cremación, si quiere un velatorio, y a quién deben llamar. No hace falta pagarle ahora a una funeraria para dejar esas instrucciones.",
      crumbEnd: "Cómo planificar su funeral",
      take1: "Puede decidir arreglos <strong>sin pagar por adelantado</strong>. Los precios pueden subir; un negocio puede cerrar; en algunos lugares también pueden bajar. Revise el escrito cada pocos años y asegúrese de que la familia sepa dónde está.",
      take2: "Ponga las preferencias <strong>por escrito</strong>, dé copias a la familia y a su abogado, y guarde una a mano. No las deje solo en el testamento —a menudo se lee después del sepelio— ni como única copia en una caja de seguridad, que puede no abrirse un fin de semana o un feriado.",
      take3: "En 2023, la <a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA</a> publicó una mediana de <strong>$8,300</strong> por un funeral con velatorio y entierro, y <strong>$6,280</strong> con velatorio y cremación, del lado de la funeraria. Parcela, bóveda y lápida suelen ir aparte. Eso es el tamaño de la cuenta, no el precio de “planear”.",
      callout: "Planear y prepagar son dos trabajos distintos. Puede dejar instrucciones claras y, más adelante, decidir si el dinero sale de ahorros, de un <a href=\"" +
        prepaid +
        "\">contrato prepagado</a>, de una póliza de vida, o de una mezcla. Vea también <a href=\"" +
        pay +
        "\">cómo se paga un funeral</a>.",
      needH: "Por qué las familias se ven presionadas",
      needP1: "Cuando alguien fallece, suele haber pocos días para elegir funeraria, tipo de servicio y, si hay entierro, un lugar en el cementerio. Quienes firman están cansados y, a menudo, no han comparado precios. Un escrito hecho con calma no elimina el dolor; sí reduce las decisiones que hay que inventar en el momento.",
      needP2: "Planear no es lo mismo que “arreglarlo todo con una funeraria hoy”. Es dejar constancia de lo que importa —y de lo que no quiere— para que la persona que firme sepa por dónde empezar.",
      whatH: "Qué significa planear (y qué no)",
      whatP1: "Un <strong>plan funerario</strong>, en esta página, es un registro de preferencias: qué hacer con el cuerpo, si hay velatorio o misa, a quién llamar, y dónde están los papeles. No es, por sí solo, un contrato ni un pago.",
      whatP2: "Un <strong>funeral prepagado</strong> es un contrato con una funeraria (o, en algunos estados, otro vendedor autorizado) por bienes o servicios concretos, pagados en parte o por completo antes de la necesidad. Ese contrato tiene reglas propias sobre el dinero, mudanzas y cancelación. La guía dedicada está en <a href=\"" +
        prepaid +
        "\">funerales prepagados</a>.",
      whatP3: "La Comisión Federal de Comercio (FTC) explica que usted puede decidir arreglos sin enviar el efectivo por adelantado. Si más adelante paga por adelantado, pregunte dónde queda el dinero y qué pasa si se muda o si el negocio cierra —y avise a la familia, para que no paguen dos veces.",
      fact1H: "Lo que quiere",
      fact1P: "Tipo de servicio, si hay visita, música o rito, y si prefiere entierro, cremación o donación del cuerpo, si esa es su voluntad.",
      fact2H: "Quién lo tiene",
      fact2P: "Copias en manos de la familia, del abogado si tiene uno, y una copia que se pueda leer el mismo día, no solo en un archivo lejano.",
      fact3H: "Cómo se pagará",
      fact3P: "Eso puede decidirse después. Ahorros, un contrato ya pagado o el efectivo de un seguro son vías distintas. No tienen que ir en el mismo papel que las preferencias.",
      howH: "Cómo dejarlo por escrito para que sirva",
      howP1: "Escríbalo en un lenguaje que su familia entienda. Nombre funeraria o cementerio solo si ya los eligió; si aún no, diga “comparar al menos dos funerarias” y anote el tipo de servicio. La FTC recomienda dar copias a la familia y al abogado, y guardar una a mano.",
      howP2: "No ponga las preferencias <strong>solo en el testamento</strong>. El testamento suele leerse después del funeral. Tampoco deje la <strong>única</strong> copia en una caja de seguridad del banco: un fin de semana o un feriado puede retrasar el acceso cuando más se necesita.",
      howP3: "Revise el escrito cada pocos años. Los precios cambian, una funeraria puede cerrar o venderse, y sus propias ideas pueden cambiar. Si prepagó, revise también ese contrato; no es lo mismo que este escrito de preferencias.",
      keepH: "Tres sitios que no bastan por sí solos",
      keep1H: "Solo el testamento",
      keep1P: "A menudo se abre después del sepelio. Sirve para bienes; no es el único sitio para el velatorio o la cremación.",
      keep2H: "Solo la caja de seguridad",
      keep2P: "El acceso puede esperar al horario del banco. Guarde otra copia donde alguien de confianza pueda leerla el mismo día.",
      keep3H: "Solo “se lo dije a alguien”",
      keep3P: "La persona puede olvidar detalles o no estar disponible. Un papel corto, fechado, es más fácil de seguir.",
      kindsH: "Qué tipo de servicio está eligiendo",
      kindsP: "La FTC describe tres caminos habituales. La cultura, la fe, el presupuesto y lo que usted quiere para los que quedan importan más que un “promedio nacional”. Ningún tipo es obligatorio.",
      kind1H: "Funeral tradicional (servicio completo)",
      kind1P: "Suele incluir velatorio o visita, un servicio y luego entierro o cremación. En general es el camino más caro del lado de la funeraria, porque hay más horas, personal e instalaciones.",
      kind2H: "Entierro directo",
      kind2P: "El cuerpo se entierra sin velatorio y, por lo general, sin embalsamamiento. Sigue habiendo funeraria o cementerio que cobrarán por traslado, ataúd o contenedor, y por abrir y cerrar la tumba.",
      kind3H: "Cremación directa",
      kind3P: "Se crema sin velatorio previo. Por la <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule</a> de la FTC, la funeraria debe ofrecer un contenedor alternativo (no tiene que ser un ataúd costoso) si usted no quiere uno. Un servicio memorial puede hacerse después, con o sin las cenizas presentes.",
      kindsNote: "Algunas personas escriben que desean donar el cuerpo a una escuela de medicina u hospital. Cada programa pone sus propias reglas; no inventamos aquí cuáles aceptan. Anótelo como preferencia y deje el contacto que la familia deba llamar. Un entierro “verde” (sin bóveda o con menos químicos) también es una preferencia: pregúntele al cementerio si lo permite. No hay un precio nacional que podamos citar.",
      decideH: "Seis decisiones que sí caben en un papel",
      decideP: "No hace falta un manual de diez capítulos. Estas seis preguntas cubren lo que la familia suele tener que resolver primero. Puede dejar “lo decide mi hija” en una línea; eso también es una instrucción.",
      dec1: "<strong>Qué ocurre con el cuerpo.</strong> Entierro, cremación, o donación si esa es su voluntad. Si elige entierro, diga si ya hay parcela o si hay que comprarla.",
      dec2: "<strong>Si hay visita o rito.</strong> Velatorio, misa, servicio en capilla, o ninguno. Anote fe, idioma y si quiere flores o donativos.",
      dec3: "<strong>A qué funeraria comparar.</strong> Nombre una o dos, o pida que pidan la lista de precios general (GPL, por sus siglas en inglés: el documento de precios que la funeraria debe mostrar) en más de un lugar.",
      dec4: "<strong>Cementerio, si hay entierro.</strong> Parcela, restricciones de lápida o bóveda, y si hay un cementerio nacional del VA que deba consultarse.",
      dec5: "<strong>Quién paga y con qué.</strong> Ahorros, un contrato ya firmado, o efectivo de un seguro. El detalle está en <a href=\"" +
        pay +
        "\">cómo pagar un funeral</a>. Aquí basta con nombrar a la persona que tiene los papeles.",
      dec6: "<strong>Quién tiene copias y cuándo se revisa.</strong> Nombres, teléfonos, y una fecha para volver a leer el escrito (por ejemplo, cada dos o tres años).",
      shopH: "Cómo comparar funerarias con la lista de precios (GPL)",
      shopP1: "La <strong>lista de precios general</strong> (General Price List, o GPL) es el documento que una funeraria debe mostrarle si usted pregunta en persona por bienes o servicios. Por teléfono, deben darle los precios que pida. La ley no les obliga a enviarle la GPL por correo. Compare más de un proveedor: el barrio no garantiza un dueño independiente; pregunte si el negocio es de una cadena si eso le importa.",
      shopP2: "Pueden vender paquetes, pero también deben darle la lista desglosada para que no compre líneas que no necesita. La Funeral Rule cubre funerarias; en general <strong>no</strong> cubre cementerios ni mausoleos, salvo que ese negocio también venda bienes y servicios funerarios.",
      shopP3: "En la mayoría de los estados, la FTC indica que <strong>no está obligado por ley a usar una funeraria</strong> para planear o celebrar un funeral. Eso no significa que no haya trámites: el certificado de defunción y los permisos siguen reglas estatales. No publicamos un listado estado por estado de quién puede firmar esos papeles, porque varía y se desactualiza. Muchas familias igual contratan una funeraria por el traslado y el calendario.",
      cemH: "La parcela, antes de que haga falta",
      cemP1: "Comprar un lugar en el cementerio a toda prisa después de un fallecimiento es habitual. La FTC señala que suele convenir a la familia comprar la parcela <strong>antes</strong> de la necesidad, para elegir ubicación, fe del camposanto y reglas de monumentos, flores o bóveda. Esos costos —abrir y cerrar la tumba, cuidado perpetuo— a menudo van aparte de la factura de la funeraria. El desglose está en <a href=\"" +
        funeralCost +
        "\">cuánto cuesta un funeral</a>.",
      cemP2: "Si hay servicio militar, un cementerio nacional del Departamento de Asuntos de Veteranos (VA) puede ser una opción para Veteranos con baja distinta de deshonrosa, y en algunos casos para cónyuges e hijos, según las reglas publicadas. <strong>No es automático para todo Veterano.</strong> Confirme elegibilidad en <a href=\"https://www.va.gov/burials-memorials/eligibility/\" rel=\"noopener\" target=\"_blank\">VA.gov</a>. Algunas funerarias anuncian “especiales para veteranos”; pida el precio completo por escrito. Hay una asignación de entierro del VA aparte, con montos según la fecha y si la muerte está relacionada con el servicio; no es lo mismo que una tumba en un cementerio nacional.",
      cemFlag: "Algunos artículos antiguos dicen que “todos los veteranos” tienen entierro gratuito en un cementerio nacional. La página actual del VA es más estrecha (tipo de baja, delitos graves y otras excepciones). Usamos VA.gov, no esa frase amplia.",
      sizeH: "Por qué el dinero aparece después en esta guía",
      sizeP: "Planear no tiene un “precio nacional” que podamos citar. Lo que sí está publicado es el tamaño habitual de la cuenta de la funeraria, para que sepa de qué orden de magnitud habla la familia cuando llegue el momento de pagar.",
      nfdaKicker: "Mediana NFDA 2023",
      nfda1: "Funeral con velatorio y entierro — lado funeraria. Parcela y lápida suelen ir aparte.",
      nfda2: "Funeral con velatorio y cremación — lado funeraria. Urna, nicho o esparcimiento pueden ir aparte.",
      sizeLearn: "Estas cifras son medianas nacionales de 2023, no la cotización de su ciudad. Un servicio más simple del GPL suele costar menos; un cementerio privado puede sumar miles. Use la <a href=\"" +
        funeralCost +
        "\">guía de costos</a> y la <a href=\"final-expense-estimator.html\">calculadora</a> para un orden de magnitud, no como factura.",
      sizeP2: "El Seguro Social puede pagar <strong>$255 una sola vez</strong> si un cónyuge o hijos cumplen sus reglas. Eso no cubre un funeral con velatorio. Medicare es seguro médico; no paga el sepelio. El detalle de vías de pago está en <a href=\"" +
        pay +
        "\">cómo pagar un funeral</a>.",
      helpH: "Qué gana — y qué no resuelve — un escrito",
      helpYesH: "Lo que suele ayudar",
      helpYes1: "La familia sabe el tipo de servicio y a quién llamar, sin inventarlo bajo presión.",
      helpYes2: "Puede comparar la GPL con calma y no sentirse obligado a un paquete entero.",
      helpYes3: "Si hay parcela o un cementerio del VA que consultar, eso se anota antes del apuro.",
      helpNoH: "Lo que no garantiza",
      helpNo1: "No congela precios futuros, salvo que firme un contrato de prepago con reglas claras.",
      helpNo2: "No obliga a la funeraria a honrar un papel que ella no firmó. Es una guía para quien contrate.",
      helpNo3: "No sustituye el efectivo. Si no hay ahorros, prepago ni póliza, la familia sigue reuniendo el pago.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Tengo que pagar ahora para planear?",
      faq1a: "No. Puede escribir preferencias sin enviar dinero a una funeraria. Pagar por adelantado es un contrato aparte, con reglas de estado sobre el fondo. Si no va a prepagar, igual deje el escrito y las copias.",
      faq2q: "¿Sirve ponerlo solo en el testamento?",
      faq2a: "El testamento es importante para bienes, pero a menudo se lee después del funeral. Ponga las preferencias en un escrito aparte y dé copias a quien vaya a firmar con la funeraria.",
      faq3q: "¿Puedo dejar el único papel en la caja de seguridad?",
      faq3a: "Mejor no como única copia. El banco puede estar cerrado. Deje otra copia con alguien de confianza y, si tiene abogado, una con esa persona.",
      faq4q: "¿Estoy obligado a usar una funeraria?",
      faq4a: "En la mayoría de los estados, la FTC indica que no es un requisito legal para planear o celebrar el funeral. Siguen existiendo trámites (certificado, permisos) que varían por estado. No listamos cada estado aquí. Muchas familias igual contratan una funeraria por el traslado y los plazos.",
      faq5q: "¿Qué diferencia hay entre funeral tradicional, entierro directo y cremación directa?",
      faq5a: "El tradicional suele incluir visita y servicio, y es el más caro en general. El entierro directo omite el velatorio. La cremación directa crema sin visita previa; deben ofrecerle un contenedor alternativo. Un homenaje puede hacerse después.",
      faq6q: "¿Cuándo conviene comprar la parcela?",
      faq6a: "La FTC indica que suele convenir a la familia comprarla antes de la necesidad, para elegir lugar y reglas sin prisa. Pregunte bóveda, lápida, flores y cuotas de abrir y cerrar la tumba. El cementerio no está cubierto por la Funeral Rule igual que la funeraria, salvo excepciones.",
      faq7q: "¿Puedo donar el cuerpo?",
      faq7a: "Puede dejarlo escrito como preferencia. Cada escuela u hospital pone sus reglas; no afirmamos cuáles aceptan ni qué costos quedan para la familia. Deje un teléfono de contacto.",
      faq8q: "¿Qué es un entierro “verde”?",
      faq8a: "Suele significar menos químicos o sin bóveda de concreto, según el camposanto. No hay un estándar nacional de precio que citemos. Anótelo y pregunte al cementerio si lo permite.",
      faq9q: "¿Un Veterano tiene tumba automática en un cementerio nacional?",
      faq9a: "No. El VA publica quién puede calificar (baja distinta de deshonrosa y otras categorías, con excepciones). Confirme en VA.gov. Eso es distinto de la asignación de entierro, que es un pago si se cumplen otras reglas.",
      faq10q: "¿Planear, prepagar y el seguro son lo mismo?",
      faq10a: "No. Planear es el escrito de preferencias. Prepagar es un contrato con una funeraria por líneas concretas. El seguro de vida paga efectivo a la persona que usted nombró (el beneficiario). Esa persona decide dónde gastarlo, salvo que el pago esté cedido a un proveedor.",
      faq11q: "¿Cada cuánto debo revisar el escrito?",
      faq11a: "La FTC sugiere cada pocos años. Cambie el papel si se muda, si cambia de idea, o si la funeraria o el cementerio que nombró ya no existe.",
      faq12q: "Si prepago y la funeraria cierra, ¿qué pasa?",
      faq12a: "Depende de la ley de su estado y de cómo se guardó el dinero (fideicomiso, seguro asignado u otra forma). Pregunte eso por escrito antes de firmar. La guía de <a href=\"" +
        prepaid +
        "\">funerales prepagados</a> recorre esas preguntas. Avise a la familia para que no paguen de nuevo.",
      insH: "Cuando quiera que el dinero ya esté apartado",
      insP1: "Después de saber qué tipo de servicio quiere, puede decidir cómo se pagará. Un <strong>seguro de vida entero</strong> (whole life) es una póliza que, si sigue vigente, paga un monto fijo —el <strong>beneficio por fallecimiento</strong>— a la persona que usted nombró, el <strong>beneficiario</strong>. La <strong>prima</strong> es lo que se paga para mantener la póliza. Un seguro de <strong>gastos finales</strong> es, en la práctica, un vida entero de monto más pequeño, pensado para funeral, cremación y deudas cortas —no un paquete en una funeraria concreta.",
      insP2: "El efectivo llega al beneficiario. Esa persona puede pagar la funeraria que elija, viajar, o un servicio más simple. Si cede (asigna) el pago a un proveedor, el dinero puede ir directo allí; pida las reglas por escrito. El precio de la póliza cambia con edad, salud, tabaco, monto, producto y estado. No cotizamos una funeraria en esta página.",
      vsH: "Escrito de preferencias, contrato prepagado y seguro",
      vsCol1: "Escrito de plan",
      vsCol1Sub: "Preferencias, sin pago",
      vsCol2: "Funeral prepagado",
      vsCol2Sub: "Contrato con una funeraria",
      vsCol3: "Seguro de gastos finales",
      vsCol3Sub: "Efectivo para quien usted nombre",
      vsR1H: "Qué obtiene",
      vsR1A: "Instrucciones para la familia",
      vsR1B: "Líneas de bienes o servicios ya pagadas, según el contrato",
      vsR1C: "Un pago en efectivo al beneficiario",
      vsR2H: "Si se muda",
      vsR2A: "El papel viaja con usted; actualice nombres y copias",
      vsR2B: "Trasladarlo puede ser difícil o costoso; pregunte antes de firmar",
      vsR2C: "La póliza sigue pagando a esa persona, en cualquier funeraria",
      vsR3H: "Si cambian los planes",
      vsR3A: "Reescriba el papel y dé copias nuevas",
      vsR3B: "El valor suele quedar en las líneas no usadas",
      vsR3C: "El efectivo no está atado a un ataúd o a un velatorio",
      vsR4H: "Quién cobra",
      vsR4A: "Nadie: no hay factura en este papel",
      vsR4B: "La funeraria, al prestar lo contratado",
      vsR4C: "El beneficiario, que decide cómo gastarlo",
      vsLearn: "Si ya prepagó exactamente lo que quiere, puede no necesitar una póliza nueva del mismo tamaño. Si quiere que la familia reciba dinero y elija la funeraria más adelante, pida una cotización. Compare también <a href=\"" +
        L.fe +
        "\">seguro de gastos finales</a> y <a href=\"" +
        premiumGuide +
        "\">el precio del seguro</a>.",
      vsNote: "Mejor Vida Seguros no opera funerarias. Cotizamos seguros de vida; no vendemos parcelas ni paquetes de sepelio.",
      nextH: "Siguiente paso",
      nextLead: "Si quiere que haya efectivo listo para quien usted nombre, pida una cotización gratuita con su edad y salud, o agende una llamada con Mejor Vida Seguros.",
      nextMore:
        "Licencias actuales en la página de <a href=\"" +
        L.licenses +
        "\">licencias</a>. Esta página no cotiza una funeraria ni un cementerio.",
      nextPrimary: "Cotización gratuita",
      nextPrimaryHref: L.quote,
      nextSecondary: "Agendar una llamada",
      nextSecondaryHref: L.schedule,
      quoteTitle: "Ver precios del seguro",
      quote1: "Efectivo para la familia",
      quote2: "Compare opciones a su edad",
      quoteCta: "Ver precios",
      srcTitle: "Fuentes",
      src1: '<a href="https://consumer.ftc.gov/articles/planning-your-own-funeral" rel="noopener" target="_blank">FTC: planear su propio funeral</a> — decidir arreglos sin pagar por adelantado; escrito y copias; no solo el testamento ni solo la caja de seguridad.',
      src2: '<a href="https://consumer.ftc.gov/articles/types-funerals" rel="noopener" target="_blank">FTC: tipos de funerales</a> — servicio completo, entierro directo y cremación directa.',
      src3: '<a href="https://consumer.ftc.gov/articles/choosing-funeral-provider" rel="noopener" target="_blank">FTC: elegir proveedor</a> — comparar, GPL, y que en la mayoría de los estados no es obligatorio usar una funeraria.',
      src4: '<a href="https://consumer.ftc.gov/articles/buying-cemetery-site" rel="noopener" target="_blank">FTC: comprar un sitio en el cementerio</a> — parcela antes de la necesidad; restricciones; la Funeral Rule no cubre igual al cementerio.',
      src5: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — GPL, precios por teléfono, paquetes con lista desglosada, contenedor alternativo en cremación.',
      src6: '<a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA: estadísticas</a> — medianas 2023 de funeral con velatorio y entierro ($8,300) o cremación ($6,280).',
      src7: '<a href="https://www.va.gov/burials-memorials/eligibility/" rel="noopener" target="_blank">VA: elegibilidad para cementerio nacional</a> — no es automático para todo Veterano; confirme en VA.gov.',
      src8: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: seguro de vida</a> — el seguro paga un beneficio a la persona nombrada; no es un contrato de funeraria.',
      discTitle: "Divulgación",
      discBody:
        "Esta página es educativa. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431) y no opera funerarias ni cementerios. Los precios de funeraria y camposanto los fija cada proveedor. Las ayudas públicas dependen de elegibilidad y fecha. El seguro de vida, cuando se menciona, cambia con edad, salud, tabaco, monto, producto y estado. Las licencias actuales están en la página de <a href=\"" +
        L.licenses +
        "\">licencias</a>.",
    };
  }
  return {
    title: "How to plan a funeral: write your wishes first | Mejor Vida Insurance",
    desc: "Planning a funeral means writing what you want: service type, funeral home, cemetery, and who has copies. Paying in advance is a separate decision. A Mejor Vida Insurance guide.",
    h1: "How to plan your funeral",
    lead: "Write down what you want for your funeral so your family is not guessing under pressure. Include burial or cremation, whether you want a visitation, and who they should call. You do not have to pay a funeral home in advance to leave those instructions.",
    crumbEnd: "How to plan a funeral",
    take1: "You may decide on arrangements <strong>without paying in advance</strong>. Prices may go up; a business may close; in some places prices may also go down. Review the written notes every few years, and make sure the family knows where they are.",
    take2: "Put preferences <strong>in writing</strong>, give copies to family and to your attorney, and keep one copy handy. Do not leave them only in a will —it is often read after the funeral— or as the only copy in a safe-deposit box, which may not open on a weekend or holiday.",
    take3: "In 2023, <a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA</a> published a median of <strong>$8,300</strong> for a funeral with viewing and burial, and <strong>$6,280</strong> with viewing and cremation, on the funeral-home side. Plot, vault, and marker are often extra. That is the size of the bill, not a price for “planning.”",
    callout: "Planning and prepaying are two different jobs. You can leave clear instructions and, later, decide whether the money comes from savings, a <a href=\"" +
      prepaid +
      "\">prepaid contract</a>, a life policy, or a mix. See also <a href=\"" +
      pay +
      "\">how a funeral is paid</a>.",
    needH: "Why families feel rushed",
    needP1: "When someone dies, there are usually only a few days to choose a funeral home, a type of service, and, if there is a burial, a cemetery space. The people who sign are tired and often have not compared prices. A calm written note does not remove grief; it does reduce the choices that have to be invented on the spot.",
    needP2: "Planning is not the same as “settling everything with one funeral home today.” It is a record of what matters —and what you do not want— so the person who signs knows where to start.",
    whatH: "What planning means (and what it is not)",
    whatP1: "A <strong>funeral plan</strong>, on this page, is a record of preferences: what happens to the body, whether there is a visitation or a service, whom to call, and where the papers are. By itself it is not a contract and not a payment.",
    whatP2: "A <strong>prepaid funeral</strong> is a contract with a funeral home (or, in some states, another licensed seller) for specific goods or services, paid in part or in full before they are needed. That contract has its own rules about the money, moving, and canceling. The dedicated guide is <a href=\"" +
      prepaid +
      "\">prepaid funerals</a>.",
    whatP3: "The Federal Trade Commission (FTC) explains that you may decide on arrangements without sending money in advance. If you later prepay, ask where the money is held and what happens if you move or the firm closes —and tell the family, so they do not pay twice.",
    fact1H: "What you want",
    fact1P: "Type of service, whether there is a visitation, music or a rite, and whether you prefer burial, cremation, or body donation if that is your wish.",
    fact2H: "Who has it",
    fact2P: "Copies with family, with your attorney if you have one, and a copy that can be read the same day, not only in a distant file.",
    fact3H: "How it will be paid",
    fact3P: "That can be decided later. Savings, a contract already paid, or cash from a life policy are different paths. They do not have to live on the same paper as the preferences.",
    howH: "How to write it so it actually gets used",
    howP1: "Write it in language your family will understand. Name a funeral home or cemetery only if you have already chosen; if not, say “compare at least two funeral homes” and note the type of service. The FTC recommends giving copies to family and to an attorney, and keeping one copy handy.",
    howP2: "Do not put preferences <strong>only in a will</strong>. A will is often read after the funeral. Do not leave the <strong>only</strong> copy in a bank safe-deposit box: a weekend or holiday can delay access when it is needed most.",
    howP3: "Review the writing every few years. Prices change, a funeral home may close or be sold, and your own ideas may change. If you prepaid, review that contract too; it is not the same as this preference note.",
    keepH: "Three places that are not enough on their own",
    keep1H: "Only the will",
    keep1P: "It is often opened after the funeral. It handles property; it should not be the only place for the visitation or the cremation.",
    keep2H: "Only the safe-deposit box",
    keep2P: "Access may wait for bank hours. Leave another copy with someone who can read it the same day.",
    keep3H: "Only “I told someone”",
    keep3P: "That person may forget details or be unavailable. A short, dated paper is easier to follow.",
    kindsH: "Which kind of service you are choosing",
    kindsP: "The FTC describes three common paths. Culture, faith, budget, and what you want for the people who remain matter more than a national average. No type is required.",
    kind1H: "Traditional (full-service) funeral",
    kind1P: "Usually includes a visitation or viewing, a service, and then burial or cremation. It is generally the most expensive path on the funeral-home side, because there are more hours, staff, and facilities.",
    kind2H: "Direct burial",
    kind2P: "The body is buried without a viewing and, typically, without embalming. A funeral home or cemetery will still charge for transfer, a casket or container, and opening and closing the grave.",
    kind3H: "Direct cremation",
    kind3P: "Cremation without a prior viewing. Under the FTC <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule</a>, the funeral home must offer an alternative container (it does not have to be an expensive casket) if you do not want one. A memorial service can be held later, with or without the ashes present.",
    kindsNote: "Some people write that they want to donate the body to a medical school or hospital. Each program sets its own rules; we do not invent which ones accept. Note it as a preference and leave the contact the family should call. A “green” burial (no vault, or fewer chemicals) is also a preference: ask the cemetery whether it allows that. There is no national price we can cite.",
    decideH: "Six decisions that fit on one page",
    decideP: "You do not need a ten-chapter manual. These six questions cover what the family usually has to settle first. You may write “my daughter decides” on a line; that is still an instruction.",
    dec1: "<strong>What happens to the body.</strong> Burial, cremation, or donation if that is your wish. If you choose burial, say whether a plot already exists or one must be bought.",
    dec2: "<strong>Whether there is a visitation or a rite.</strong> Viewing, a church service, a chapel service, or none. Note faith, language, and whether you want flowers or donations.",
    dec3: "<strong>Which funeral homes to compare.</strong> Name one or two, or ask the family to request the general price list (GPL: the price document a funeral home must show) at more than one place.",
    dec4: "<strong>The cemetery, if there is a burial.</strong> Plot, marker or vault rules, and whether a VA national cemetery should be checked.",
    dec5: "<strong>Who pays, and from where.</strong> Savings, a contract already signed, or cash from a life policy. The detail is in <a href=\"" +
      pay +
      "\">how to pay for a funeral</a>. Here it is enough to name the person who has the papers.",
    dec6: "<strong>Who has copies, and when you review.</strong> Names, phone numbers, and a date to reread the note (for example, every two or three years).",
    shopH: "How to compare funeral homes with the general price list (GPL)",
    shopP1: "The <strong>general price list</strong> (GPL) is the document a funeral home must show you if you ask in person about goods or services. By phone, they must give you the prices you ask for. The law does not require them to mail you the GPL. Compare more than one provider: a neighborhood name does not guarantee an independent owner; ask whether the business is corporately owned if that matters to you.",
    shopP2: "They may sell packages, but they must also give you the itemized list so you do not buy lines you do not need. The Funeral Rule covers funeral homes; it generally does <strong>not</strong> cover cemeteries or mausoleums unless that business also sells funeral goods and services.",
    shopP3: "In most states, the FTC says you are <strong>not legally required to use a funeral home</strong> to plan or carry out a funeral. That does not mean there is no paperwork: the death certificate and permits still follow state rules. We do not publish a state-by-state list of who may sign those papers, because it varies and goes stale. Many families still hire a funeral home for transfer and timing.",
    cemH: "The cemetery plot, before it is urgent",
    cemP1: "Buying a cemetery space in a rush after a death is common. The FTC notes that it is usually in the family’s interest to buy the plot <strong>before</strong> need, so you can choose location, the faith of the grounds, and rules on monuments, flowers, or a vault. Those costs —opening and closing the grave, perpetual care— are often separate from the funeral-home bill. The breakdown is in <a href=\"" +
      funeralCost +
      "\">how much a funeral costs</a>.",
    cemP2: "If there is military service, a Department of Veterans Affairs (VA) national cemetery may be an option for Veterans with a discharge other than dishonorable, and in some cases for spouses and children, under published rules. <strong>It is not automatic for every Veteran.</strong> Confirm eligibility on <a href=\"https://www.va.gov/burials-memorials/eligibility/\" rel=\"noopener\" target=\"_blank\">VA.gov</a>. Some funeral homes advertise “veteran specials”; ask for the full price in writing. There is a separate VA burial allowance, with amounts by date of death and whether the death was service-connected; that is not the same as a grave in a national cemetery.",
    cemFlag: "Some older consumer articles say “all veterans” get a free burial in a national cemetery. The current VA page is narrower (type of discharge, serious crimes, and other exceptions). We use VA.gov, not that sweeping phrase.",
    sizeH: "Why money comes later on this page",
    sizeP: "Planning does not have a “national price” we can cite. What is published is the usual size of the funeral-home bill, so you know the order of magnitude the family is talking about when it is time to pay.",
    nfdaKicker: "NFDA 2023 median",
    nfda1: "Funeral with viewing and burial — funeral-home side. Plot and marker are often extra.",
    nfda2: "Funeral with viewing and cremation — funeral-home side. Urn, niche, or scattering may be extra.",
    sizeLearn: "These are 2023 national medians, not a quote for your city. A simpler GPL service usually costs less; a private cemetery can add thousands. Use the <a href=\"" +
      funeralCost +
      "\">cost guide</a> and the <a href=\"final-expense-estimator.html\">calculator</a> for order of magnitude, not as an invoice.",
    sizeP2: "Social Security may pay <strong>$255 once</strong> if a spouse or children meet its rules. That does not cover a funeral with visitation. Medicare is medical insurance; it does not pay for the funeral. Payment paths are in <a href=\"" +
      pay +
      "\">how to pay for a funeral</a>.",
    helpH: "What a written plan helps — and what it does not fix",
    helpYesH: "What it usually helps",
    helpYes1: "The family knows the type of service and whom to call, without inventing it under pressure.",
    helpYes2: "You can compare the GPL calmly and not feel required to take a full package.",
    helpYes3: "If there is a plot or a VA cemetery to check, that is noted before the rush.",
    helpNoH: "What it does not guarantee",
    helpNo1: "It does not freeze future prices, unless you sign a prepaid contract with clear rules.",
    helpNo2: "It does not bind a funeral home that never signed it. It is a guide for the person who contracts.",
    helpNo3: "It does not replace cash. If there are no savings, no prepaid contract, and no policy, the family still has to gather payment.",
    faqTitle: "Frequently asked questions",
    faq1q: "Do I have to pay now in order to plan?",
    faq1a: "No. You can write preferences without sending money to a funeral home. Paying in advance is a separate contract, with state rules about the funds. If you will not prepay, still leave the writing and the copies.",
    faq2q: "Is it enough to put this only in my will?",
    faq2a: "A will matters for property, but it is often read after the funeral. Put preferences in a separate note and give copies to the person who will sign with the funeral home.",
    faq3q: "Can I leave the only paper in a safe-deposit box?",
    faq3a: "Not as the only copy. The bank may be closed. Leave another copy with someone you trust and, if you have an attorney, one with that person.",
    faq4q: "Do I have to use a funeral home?",
    faq4a: "In most states, the FTC says it is not a legal requirement to plan or hold the funeral. Paperwork (death certificate, permits) still follows state rules. We do not list every state here. Many families still hire a funeral home for transfer and timing.",
    faq5q: "What is the difference between a traditional funeral, direct burial, and direct cremation?",
    faq5a: "Traditional usually includes a visitation and a service, and is generally the most expensive. Direct burial skips the viewing. Direct cremation cremates without a prior visitation; they must offer you an alternative container. A memorial can be held later.",
    faq6q: "When should we buy a cemetery plot?",
    faq6a: "The FTC says it is usually in the family’s interest to buy before need, so you can choose location and rules without rushing. Ask about vault, marker, flowers, and opening and closing fees. A cemetery is not covered by the Funeral Rule the same way a funeral home is, except in limited cases.",
    faq7q: "Can I donate the body?",
    faq7a: "You can write that as a preference. Each school or hospital sets its own rules; we do not claim which ones accept or what costs remain for the family. Leave a contact number.",
    faq8q: "What is a “green” burial?",
    faq8a: "It usually means fewer chemicals or no concrete vault, depending on the cemetery. There is no national price standard we cite. Write it down and ask the cemetery whether it allows that.",
    faq9q: "Does a Veteran automatically get a grave in a national cemetery?",
    faq9a: "No. VA publishes who may qualify (a discharge other than dishonorable and other categories, with exceptions). Confirm on VA.gov. That is separate from the burial allowance, which is a payment if other rules are met.",
    faq10q: "Are planning, prepaying, and insurance the same thing?",
    faq10a: "No. Planning is the preference note. Prepaying is a contract with a funeral home for specific lines. Life insurance pays cash to the person you named (the beneficiary). That person decides where to spend it, unless the payment is assigned to a provider.",
    faq11q: "How often should I review the note?",
    faq11a: "The FTC suggests every few years. Change the paper if you move, if your mind changes, or if the funeral home or cemetery you named no longer exists.",
    faq12q: "If I prepay and the funeral home closes, what happens?",
    faq12a: "It depends on your state’s law and how the money was held (trust, assigned insurance, or another form). Ask that in writing before you sign. The <a href=\"" +
      prepaid +
      "\">prepaid funerals</a> guide walks through those questions. Tell the family so they do not pay again.",
    insH: "When you want the money already set aside",
    insP1: "After you know what kind of service you want, you can decide how it will be paid. <strong>Whole life</strong> insurance is a policy that, if it stays in force, pays a set amount —the <strong>death benefit</strong>— to the person you named, the <strong>beneficiary</strong>. The <strong>premium</strong> is what you pay to keep the policy. <strong>Final expense</strong> insurance is, in practice, a smaller whole life policy meant for a funeral, cremation, and short debts —not a package at one funeral home.",
    insP2: "The cash goes to the beneficiary. That person can pay the funeral home they choose, travel, or a simpler service. If the payment is assigned to a provider, the money may go there directly; ask for those rules in writing. Policy price changes with age, health, tobacco, amount, product, and state. This page does not quote a funeral home.",
    vsH: "Preference note, prepaid contract, and insurance",
    vsCol1: "Written plan",
    vsCol1Sub: "Preferences, no payment",
    vsCol2: "Prepaid funeral",
    vsCol2Sub: "Contract with a funeral home",
    vsCol3: "Final expense insurance",
    vsCol3Sub: "Cash for the person you name",
    vsR1H: "What you get",
    vsR1A: "Instructions for the family",
    vsR1B: "Goods or service lines already paid, per the contract",
    vsR1C: "A cash payment to the beneficiary",
    vsR2H: "If you move",
    vsR2A: "The paper travels with you; update names and copies",
    vsR2B: "Moving it can be hard or costly; ask before you sign",
    vsR2C: "The policy still pays that person, at any funeral home",
    vsR3H: "If plans change",
    vsR3A: "Rewrite the paper and give new copies",
    vsR3B: "Value usually stays in the unused lines",
    vsR3C: "The cash is not tied to a casket or a viewing",
    vsR4H: "Who is paid",
    vsR4A: "No one: this paper is not a bill",
    vsR4B: "The funeral home, when it provides what was contracted",
    vsR4C: "The beneficiary, who decides how to spend it",
    vsLearn: "If you already prepaid exactly what you want, you may not need a new policy of the same size. If you want the family to receive cash and choose the funeral home later, get a quote. Also compare <a href=\"" +
      L.fe +
      "\">final expense insurance</a> and <a href=\"" +
      premiumGuide +
      "\">insurance cost</a>.",
    vsNote: "Mejor Vida Insurance does not operate funeral homes. We quote life insurance; we do not sell plots or funeral packages.",
    nextH: "Next step",
    nextLead: "If you want cash ready for the person you name, get a free quote for your age and health, or schedule a call with Mejor Vida Insurance.",
    nextMore:
      "Current licenses are on the <a href=\"" +
      L.licenses +
      "\">licenses</a> page. This page does not quote a funeral home or a cemetery.",
    nextPrimary: "Get a free quote",
    nextPrimaryHref: L.quote,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    quoteTitle: "See insurance prices",
    quote1: "Cash for the family",
    quote2: "Compare options at your age",
    quoteCta: "See prices",
    srcTitle: "Sources",
    src1: '<a href="https://consumer.ftc.gov/articles/planning-your-own-funeral" rel="noopener" target="_blank">FTC: planning your own funeral</a> — decide on arrangements without paying in advance; writing and copies; not only the will or only the safe-deposit box.',
    src2: '<a href="https://consumer.ftc.gov/articles/types-funerals" rel="noopener" target="_blank">FTC: types of funerals</a> — full-service, direct burial, and direct cremation.',
    src3: '<a href="https://consumer.ftc.gov/articles/choosing-funeral-provider" rel="noopener" target="_blank">FTC: choosing a funeral provider</a> — compare, GPL, and that in most states you are not required to use a funeral home.',
    src4: '<a href="https://consumer.ftc.gov/articles/buying-cemetery-site" rel="noopener" target="_blank">FTC: buying a cemetery site</a> — plot before need; restrictions; the Funeral Rule does not cover cemeteries the same way.',
    src5: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — GPL, prices by phone, packages with an itemized list, alternative container for cremation.',
    src6: '<a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA: statistics</a> — 2023 medians for a funeral with viewing and burial ($8,300) or cremation ($6,280).',
    src7: '<a href="https://www.va.gov/burials-memorials/eligibility/" rel="noopener" target="_blank">VA: national cemetery eligibility</a> — not automatic for every Veteran; confirm on VA.gov.',
    src8: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: life insurance</a> — life insurance pays a benefit to the person named; it is not a funeral-home contract.',
    discTitle: "Disclosure",
    discBody:
      "This page is educational. Mejor Vida Insurance LLC is an independent agency (NPN 21695431) and does not operate a funeral home or cemetery. Funeral-home and cemetery prices are set by each provider. Public benefits depend on eligibility and date. Life insurance, when mentioned, changes by age, health, tobacco, amount, product, and state. Current licenses are on the <a href=\"" +
      L.licenses +
      "\">licenses</a> page.",
  };
}

function planMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const related = isEs
    ? `<p class="lic-rate-note">Más en esta sección:
<a href="cuanto-cuesta-un-funeral.html">Costo de un funeral</a> ·
<a href="funerales-prepagados.html">Prepagado</a> ·
<a href="como-pagar-un-funeral.html">Cómo se paga</a> ·
<a href="planificacion-patrimonial.html">Plan patrimonial</a> ·
<a href="${L.fe}">Seguro de gastos finales</a> ·
<a href="seguro-para-cremacion.html">Cremación</a> ·
<a href="guias-gastos-finales.html">Índice de guías</a></p>`
    : `<p class="lic-rate-note">More in this section:
<a href="how-much-does-a-funeral-cost.html">Funeral cost</a> ·
<a href="prepaid-funerals.html">Prepaid</a> ·
<a href="how-to-pay-for-a-funeral.html">How it’s paid</a> ·
<a href="estate-planning.html">Estate planning</a> ·
<a href="${L.fe}">Final expense</a> ·
<a href="cremation-insurance.html">Cremation</a> ·
<a href="../guias-gastos-finales.html">Guides index</a></p>`;
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
<a href="#need">${isEs ? "El apuro" : "The rush"}</a>
<a href="#what">${isEs ? "Qué es planear" : "What planning is"}</a>
<a href="#decide">${isEs ? "Decisiones" : "Decisions"}</a>
<a href="#shop">${isEs ? "Comparar" : "Compare"}</a>
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
<h3>${c.keepH}</h3>
<div class="lic-fact-trio">
<div><h3>${c.keep1H}</h3><p>${c.keep1P}</p></div>
<div><h3>${c.keep2H}</h3><p>${c.keep2P}</p></div>
<div><h3>${c.keep3H}</h3><p>${c.keep3P}</p></div>
</div>
</section>
<section class="lic-section" id="kinds">
<h2>${c.kindsH}</h2>
<p>${c.kindsP}</p>
<div class="lic-fact-trio">
<div><h3>${c.kind1H}</h3><p>${c.kind1P}</p></div>
<div><h3>${c.kind2H}</h3><p>${c.kind2P}</p></div>
<div><h3>${c.kind3H}</h3><p>${c.kind3P}</p></div>
</div>
<p class="lic-rate-note">${c.kindsNote}</p>
</section>
<section class="lic-section" id="decide">
<h2>${c.decideH}</h2>
<p>${c.decideP}</p>
${decideListHtml(c)}
</section>
<section class="lic-section" id="shop">
<h2>${c.shopH}</h2>
<p>${c.shopP1}</p>
<p>${c.shopP2}</p>
<p>${c.shopP3}</p>
</section>
<section class="lic-section" id="cemetery">
<h2>${c.cemH}</h2>
<p>${c.cemP1}</p>
<p>${c.cemP2}</p>
<div class="lic-helpful"><p>${c.cemFlag}</p></div>
</section>
<section class="lic-section" id="size">
<h2>${c.sizeH}</h2>
<p>${c.sizeP}</p>
${nfdaScaleHtml(c)}
<p class="lic-cost-lesson">${c.sizeLearn}</p>
<p>${c.sizeP2}</p>
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
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
<section class="lic-section" id="cash">
<h2>${c.insH}</h2>
<p>${c.insP1}</p>
<p>${c.insP2}</p>
${vsChartThreeHtml(c)}
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
${[c.src1, c.src2, c.src3, c.src4, c.src5, c.src6, c.src7, c.src8].filter(Boolean).map((s) => `<li>${s}</li>`).join("\n")}
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

module.exports = { copyPlan, planMain };
