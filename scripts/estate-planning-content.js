"use strict";

const { quoteRailHtml } = require("./lic-quote-rail");
const { LINKS, faqsHtml, nextStepBandHtml } = require("./preexisting-conditions-content");

const GIFT = {
  esPdf: "guides/guia-planificacion-funeral-mejor-vida.pdf",
  enPdf: "../guides/mvi-funeral-estate-planning-workbook.pdf",
  esHtml: "guides/guia-planificacion-funeral-mejor-vida.html",
  enHtml: "../guides/mvi-funeral-estate-planning-workbook.html",
};

function stepsHtml(c) {
  const items = [c.st1, c.st2, c.st3, c.st4, c.st5, c.st6, c.st7, c.st8, c.st9]
    .filter(Boolean)
    .map((item) => `<li>${item}</li>`)
    .join("\n");
  return `<ol class="lic-pre-ask">${items}</ol>`;
}

function giftBandHtml(lang, c) {
  const isEs = lang === "es";
  const pdf = isEs ? GIFT.esPdf : GIFT.enPdf;
  const html = isEs ? GIFT.esHtml : GIFT.enHtml;
  return `<aside class="lic-gift" id="${isEs ? "regalo" : "gift"}">
<p class="lic-gift__badge">${c.giftBadge}</p>
<h2>${c.giftH}</h2>
<p>${c.giftP}</p>
<p class="lic-gift__actions">
<a class="lic-gift__btn" href="${pdf}" download>${c.giftCta}</a>
<a class="lic-gift__print" href="${html}">${c.giftPrint}</a>
</p>
<p class="lic-gift__note">${c.giftNote}</p>
</aside>`;
}

function copyEstate(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const plan = isEs ? "como-planificar-su-funeral.html" : "how-to-plan-your-funeral.html";
  const pay = isEs ? "como-pagar-un-funeral.html" : "how-to-pay-for-a-funeral.html";
  const prepaid = isEs ? "funerales-prepagados.html" : "prepaid-funerals.html";
  const cost = isEs ? "cuanto-cuesta-un-funeral.html" : "how-much-does-a-funeral-cost.html";
  if (isEs) {
    return {
      title: "Planificación patrimonial paso a paso: papeles, funeral y un cuaderno gratis | Mejor Vida Seguros",
      desc: "Guía de Mejor Vida Seguros para dejar por escrito el testamento, los poderes, los deseos funerarios y dónde están los papeles. Incluye un cuaderno descargable de regalo. No es asesoría legal.",
      h1: "Un plan patrimonial que su familia pueda seguir",
      lead: "No hace falta tener muchos bienes para necesitar un plan. Lo que su familia necesita es un registro escrito: quién puede decidir si usted no puede, dónde están los papeles importantes y qué quiere para su funeral. Esta página recorre esos pasos en orden. El cuaderno de regalo es el lugar para anotar las respuestas.",
      crumbEnd: "Planificación patrimonial",
      giftBadge: "Regalo gratuito",
      giftH: "Cuaderno de deseos funerarios y papeles",
      giftP: "Descargue el PDF de Mejor Vida Seguros y escriba las respuestas en la computadora o el teléfono (Vista Previa, Adobe Acrobat u otro lector de PDF). Luego imprima copias para personas de confianza y para su abogado, si tiene uno. El cuaderno no sustituye un testamento ni un poder notarial.",
      giftCta: "Descargar el cuaderno (PDF)",
      giftPrint: "Abrir una copia en blanco para llenar a mano",
      giftNote: "No escriba contraseñas en el PDF. Anote quién puede abrir el administrador de contraseñas, no la clave.",
      takeH: "Lo esencial",
      take1: "Un <strong>testamento</strong> dice quién hereda la casa, el auto y otros bienes. Un <strong>beneficiario</strong> nombrado en una póliza de vida recibe el dinero de esa póliza aunque el testamento diga otra cosa. Son documentos distintos.",
      take2: "Los deseos del funeral conviene dejarlos <strong>fuera del testamento</strong>. El testamento a menudo se lee después del sepelio. Use el cuaderno, o un escrito corto que alguien pueda abrir el mismo día.",
      take3: "La <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule</a> de la FTC le permite comparar funerarias y pedir la lista de precios. Planear no obliga a pagar por adelantado.",
      callout: "Mejor Vida Seguros compara seguros de vida y de gastos finales. No redactamos testamentos ni poderes. Para esos documentos, hable con un abogado de su estado. Esta página es educativa.",
      whatH: "Qué es un plan patrimonial — y qué no es",
      whatP1: "Un plan patrimonial es un conjunto de instrucciones por escrito para su familia. Cubre dos situaciones: si usted está vivo pero no puede decidir, por una enfermedad o un accidente, y cuando usted fallezca. Dice quién puede pagar las cuentas, quién puede hablar con los médicos, quién hereda y qué funeral quiere.",
      whatP2: "No es lo mismo que un <a href=\"" + prepaid + "\">contrato prepagado</a> con una funeraria ni que una póliza de <a href=\"" + L.fe + "\">gastos finales</a>. Esas son formas de pagar. El plan patrimonial es la instrucción: quién está a cargo, dónde están los papeles y qué desea usted.",
      whatP3: "Mejor Vida Seguros no vende un plan patrimonial. Si contrata un seguro de vida, ese seguro paga efectivo a la persona que usted nombre. Un abogado, si lo necesita, pone el testamento y los poderes en forma legal. Son trabajos distintos.",
      fact1H: "Si usted no puede decidir",
      fact1P: "Nombre a quién puede manejar el dinero y a quién puede hablar con los médicos. También puede dejar por escrito qué tratamientos acepta o rechaza.",
      fact2H: "Cuando usted fallezca",
      fact2P: "Un testamento o fideicomiso dice quién hereda. Los beneficiarios de pólizas y cuentas de retiro reciben ese dinero. Los deseos del funeral van en un escrito que la familia pueda abrir de inmediato.",
      fact3H: "Dónde está todo",
      fact3P: "Anote dónde están los papeles, a quién llamar y cómo se pagará el sepelio: ahorros, un contrato ya pagado o un seguro.",
      whyH: "Por qué no basta con habérselo dicho a alguien",
      whyP1: "En una emergencia, la persona que “sabía” puede no estar, o recordar mal un detalle. Un banco no abre una caja de seguridad un domingo porque un hijo está seguro de que el testamento está ahí. Un escrito corto, fechado, con copias en más de un sitio, es más fácil de usar.",
      whyP2: "La Oficina de Protección Financiera del Consumidor (CFPB) explica que conviene decidir, con calma, quién podrá manejar el dinero si usted no puede. Ese rol suele ser un <strong>poder notarial duradero</strong> (durable power of attorney): un documento legal, no una conversación.",
      stepsH: "Nueve pasos, en un orden útil",
      stepsP: "No tiene que terminar todo en un fin de semana. Use el cuaderno a medida que avance. Si un paso requiere abogado, anote el nombre y la cita. No intente inventar el formulario en esta web.",
      st1: "<strong>Nombre a las personas.</strong> Decida quién será el albacea (executor) del testamento, quién tendrá autoridad sobre el dinero y quién hablará con los médicos. Pueden ser la misma persona o tres distintas. El CFPB recomienda a alguien en quien confíe de verdad: ese rol es un <strong>fiduciario</strong>, y debe anteponer su interés al propio.",
      st2: "<strong>Haga o actualice el testamento.</strong> El testamento dice quién hereda la casa, el auto y lo que no tenga un beneficiario ya nombrado. Las reglas cambian por estado. Un formulario de internet puede no valer en el suyo. Mejor Vida Seguros no prepara testamentos.",
      st3: "<strong>Revise los beneficiarios.</strong> Revise pólizas de vida, cuentas de retiro y, a veces, cuentas bancarias pagaderas al fallecimiento. El nombre en esos papeles suele tener prioridad sobre el testamento para ese activo. Si se divorció y el ex sigue en la póliza, el dinero puede ir ahí.",
      st4: "<strong>Deje instrucciones de salud.</strong> Un poder para la atención médica nombra a quien decide si usted no puede hablar. Una directiva anticipada, a veces llamada testamento vital, describe tratamientos. El Instituto Nacional sobre el Envejecimiento (NIA) publica una guía para el público; use los formularios que reconozca su estado.",
      st5: "<strong>Escriba el funeral aparte.</strong> Anote el tipo de servicio, si prefiere entierro o cremación, y a quién llamar. Eso va en el cuaderno o en un papel que alguien tenga a mano. La guía <a href=\"" + plan + "\">cómo planificar su funeral</a> explica por qué no conviene dejarlo solo en el testamento.",
      st6: "<strong>Anote dónde están los papeles.</strong> Testamento, pólizas, escrituras, baja militar, actas. No deje la única copia en la caja del banco. El cuaderno tiene una tabla para la ubicación; no es el lugar para copiar números de tarjeta ni claves.",
      st7: "<strong>Decida cómo se pagará el sepelio.</strong> Puede ser con ahorros, con un contrato ya pagado o con el efectivo de un seguro. Compare esas vías en <a href=\"" + pay + "\">cómo se paga un funeral</a>. El Seguro Social puede pagar un único <strong>$255</strong> a un sobreviviente que cumpla las reglas; no cubre un funeral completo.",
      st8: "<strong>Liste las cuentas digitales.</strong> Correo, redes, fotos en la nube. Anote el sitio y el usuario, y <em>dónde</em> está guardada la contraseña —un administrador, una libretita en casa de su hija—, no la contraseña misma.",
      st9: "<strong>Hable y revise.</strong> Diga a la familia dónde está el cuaderno. Revise cada pocos años, o si hay un divorcio, una mudanza, un diagnóstico o un hijo que nace.",
      poaH: "Dinero y salud: dos poderes distintos",
      poaP1: "Un poder financiero permite a otra persona pagar la hipoteca o hablar con el banco si usted no puede. “Duradero” significa que sigue valiendo si usted pierde la capacidad de decidir. Un poder “que salta” (springing) espera a que un médico declare la incapacidad; eso puede retrasar el acceso justo cuando hace falta.",
      poaP2: "Un poder de atención médica cubre hospitales y tratamientos, no la cuenta del banco. Puede nombrar personas distintas. El CFPB publica guías para quien ya es agente: qué puede hacer y cómo no mezclar el dinero propio con el de usted.",
      willH: "Testamento, fideicomiso y lo que ya tiene un beneficiario",
      willP1: "El testamento pasa por el proceso de sucesión (probate) en su estado. Un fideicomiso en vida (living trust) es otra herramienta legal; no todo el mundo lo necesita. No recomendamos uno u otro aquí: eso es trabajo de un abogado que vea su casa, sus deudas y su familia.",
      willP2: "Lo que ya tiene un beneficiario —una póliza de gastos finales, un 401(k)— suele ir directo a esa persona. Por eso revisar los nombres no es un detalle menor. Si el beneficiario murió y no hay un nombre de reserva, el dinero puede terminar en el caudal hereditario y tardar más.",
      funH: "Deseos del funeral: basta una lista corta",
      funP1: "Para que la familia pueda empezar, basta con decir qué hacer con el cuerpo, si hay velatorio, si hay un servicio religioso o un idioma, y si ya hay una parcela. Si ya compró un espacio o un contrato, anote la funeraria, el número de plan y dónde está el papelerío. Si ya eligió marca de ataúd o de lápida, puede anotarlo en el cuaderno; no es obligatorio para empezar.",
      funP2: "En 2023 la NFDA publicó una mediana de <strong>$8,300</strong> por un funeral con velatorio y entierro, y <strong>$6,280</strong> con velatorio y cremación, del lado de la funeraria. Parcela y lápida suelen ir aparte. Esas cifras miden el tamaño de la cuenta, no el costo de poner los deseos por escrito. Más números en <a href=\"" + cost + "\">cuánto cuesta un funeral</a>.",
      funP3: "Veteranos y algunos familiares pueden calificar a un entierro en un cementerio nacional u otras ayudas. Confirme en VA.gov; no es automático. Anote en el cuaderno el número de baja (DD-214) y dónde está la copia.",
      docsH: "Dónde guardar los papeles",
      docsP1: "Tres copias suelen ser suficientes: una que una persona de confianza pueda leer el mismo día, una con el abogado y una en un lugar seco que usted recuerde. Dígales a esas personas que el cuaderno existe.",
      docsP2: "No deje la única copia en una caja de seguridad. No deje las únicas instrucciones del velatorio solo dentro del testamento. No envíe por correo un PDF lleno con números de cuenta completos si otras personas pueden abrir esa bandeja.",
      insH: "Cómo encaja el seguro de vida",
      insP1: "Una póliza de <strong>vida entera</strong> de monto menor, pensada para el funeral y deudas cortas, es lo que muchas familias llaman seguro de <strong>gastos finales</strong>. Si la póliza sigue vigente, paga un beneficio a quien usted nombró. Esa persona elige la funeraria. El efectivo no está atado a un ataúd concreto, a diferencia de muchos contratos prepagados.",
      insP2: "El precio, la <strong>prima</strong>, cambia con la edad, la salud, el tabaco, el monto, el producto y el estado. Esta página no cotiza. Si quiere comparar, use la cotización en línea o llame a Mejor Vida Seguros. Si ya prepagó exactamente el servicio que desea, puede que no necesite otra póliza del mismo tamaño; son decisiones distintas.",
      talkH: "La conversación con la familia",
      talkP1: "No hace falta un discurso largo. Basta con decir dónde está el cuaderno, quién es el albacea y qué quiere para el funeral. Si hay tensiones, el papel reduce la pelea sobre “lo que mamá habría querido”.",
      talkP2: "Si alguien le pide que firme un poder o un contrato de funeraria esta semana, pida tiempo. La FTC recomienda comparar listas de precios. Un poder se firma con calma, no bajo la amenaza de que, si no firma, no lo van a cuidar.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Esta página o el cuaderno son un testamento?",
      faq1a: "No. Son educación y un formulario para anotar. Un testamento válido sigue las reglas de su estado, casi siempre con firma y testigos o notario. Consulte a un abogado.",
      faq2q: "¿Tengo que pagar una funeraria ahora para tener un plan?",
      faq2a: "No. La FTC deja claro que puede decidir los arreglos sin enviar el dinero por adelantado. Prepagar es otra decisión, con reglas propias. Vea <a href=\"" + prepaid + "\">funerales prepagados</a>.",
      faq3q: "¿Medicare paga el funeral?",
      faq3a: "Por lo general, no. Medicare cubre servicios de salud, no el sepelio. El Seguro Social puede pagar $255 a un sobreviviente que califique. No alcanza para un funeral típico.",
      faq4q: "¿El seguro de gastos finales reemplaza al testamento?",
      faq4a: "No. La póliza paga a un beneficiario. El testamento reparte otros bienes. Necesita ambos si tiene casa, deudas o personas a las que quiere nombrar.",
      faq5q: "¿Puedo llenar el cuaderno en español?",
      faq5a: "Sí. El PDF en esta página está en español. Hay una versión en inglés en la página hermana. Use el idioma que su familia lea con más facilidad.",
      faq6q: "¿Debo escribir las contraseñas del banco?",
      faq6a: "No. Si el papel se pierde o se copia, alguien más entra a sus cuentas. Anote la institución, los últimos cuatro dígitos si hace falta identificar la cuenta, y quién puede abrir el administrador de contraseñas.",
      faq7q: "¿Un notario hace válido el cuaderno como voluntad legal?",
      faq7a: "No de forma automática. Firmar y fechar ayuda a la familia a ver que es suyo. No convierte el cuaderno en testamento ni en poder. El recuadro de notario es opcional y no sustituye los formularios de su estado.",
      faq8q: "¿Mejor Vida Seguros guarda una copia de mi cuaderno?",
      faq8a: "No. Lo descarga usted. No lo envíe a la agencia con datos de cuentas. Si más adelante pide una cotización, eso es un trámite aparte, con su propio consentimiento.",
      faq9q: "¿Cada cuánto lo reviso?",
      faq9a: "La FTC sugiere revisar las preferencias funerarias cada pocos años. Haga lo mismo con beneficiarios y poderes después de un divorcio, una muerte en la familia o una mudanza de estado.",
      nextH: "Siguiente paso",
      nextLead: "Descargue el cuaderno. Si también quiere ver un rango de prima para gastos finales, pida una cotización. Son dos tareas distintas.",
      nextPrimary: "Descargar el cuaderno",
      nextPrimaryHref: GIFT.esPdf,
      nextSecondary: "Ver precios de seguro",
      nextSecondaryHref: L.quote,
      nextMore: "O lea cómo <a href=\"" + plan + "\">dejar el funeral por escrito</a> sin pagar ahora.",
      quoteTitle: "¿Quiere comparar primas?",
      quote1: "Gastos finales, según edad y salud",
      quote2: "Sin compromiso de comprar",
      quoteCta: "Ver precios",
      discTitle: "Divulgaciones",
      discBody: "Esta guía es educativa. No es asesoramiento legal, fiscal ni financiero. Los documentos (testamento, fideicomiso, poderes, directivas) dependen de la ley de su estado y de un profesional autorizado. Mejor Vida Insurance LLC es una agencia independiente; Julie Braunsroth es agente de seguros (NPN #21695431). Las cotizaciones en el sitio son estimaciones. El cuaderno descargable no es un contrato de seguro ni un acuerdo con una funeraria.",
      srcTitle: "Fuentes",
      src1: "<a href=\"https://www.consumerfinance.gov/consumer-tools/educator-tools/resources-for-older-adults/financial-security-as-you-age/planning-for-diminished-capacity-and-illness/\" rel=\"noopener\" target=\"_blank\">CFPB — Planificar ante una menor capacidad o una enfermedad</a>",
      src2: "<a href=\"https://www.consumerfinance.gov/consumer-tools/managing-someone-elses-money/\" rel=\"noopener\" target=\"_blank\">CFPB — Manejar el dinero de otra persona</a>",
      src3: "<a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC — Funeral Rule</a> y <a href=\"https://consumer.ftc.gov/articles/shopping-funeral-services\" rel=\"noopener\" target=\"_blank\">cómo comparar funerarias</a>",
      src4: "<a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA — estadísticas de costos funerarios</a>",
      src5: "<a href=\"https://www.ssa.gov/benefits/survivors/\" rel=\"noopener\" target=\"_blank\">Seguro Social — beneficios para sobrevivientes</a>",
      src6: "<a href=\"https://www.va.gov/burials-memorials/\" rel=\"noopener\" target=\"_blank\">VA — entierros y memoriales</a>",
      src7: "<a href=\"https://www.nia.nih.gov/health/advance-care-planning/advance-care-planning-advance-directives-health-care\" rel=\"noopener\" target=\"_blank\">NIA/NIH — planificación anticipada y directivas de atención médica</a>",
      src8: "<a href=\"https://www.nia.nih.gov/health/advance-care-planning/getting-your-affairs-order-checklist-documents-prepare-future\" rel=\"noopener\" target=\"_blank\">NIA/NIH — lista para ordenar papeles y asuntos</a>",
      src9: "<a href=\"https://www.usa.gov/death-loved-one\" rel=\"noopener\" target=\"_blank\">USA.gov — cuando fallece un ser querido</a>",
      src10: "<a href=\"https://www.ncoa.org/article/the-ultimate-estate-planning-checklist-a-step-by-step-guide/\" rel=\"noopener\" target=\"_blank\">NCOA — lista de planificación patrimonial para el público</a>",
    };
  }
  return {
    title: "Estate planning step by step: papers, funeral wishes, and a free workbook | Mejor Vida Insurance",
    desc: "A Mejor Vida Insurance guide to wills, powers of attorney, funeral wishes, and where your papers are kept. Includes a free workbook. This is not legal advice.",
    h1: "An estate plan your family can follow",
    lead: "You do not need a large estate to need a plan. Your family needs a written record of who can make decisions if you cannot, where the important papers are, and what you want for your funeral. This page walks through those steps in order. The free workbook is where you write your answers.",
    crumbEnd: "Estate planning",
    giftBadge: "Free gift",
    giftH: "Funeral wishes and papers workbook",
    giftP: "Download the Mejor Vida Insurance PDF and type your answers on a computer or phone (Preview, Adobe Acrobat, or another PDF reader). Then print copies for people you trust and your attorney, if you have one. The workbook is not a will and not a power of attorney.",
    giftCta: "Download the workbook (PDF)",
    giftPrint: "Open a blank copy to fill in by hand",
    giftNote: "Do not type passwords into the PDF. Record who can open the password manager, not the password itself.",
    takeH: "What to know first",
    take1: "A <strong>will</strong> says who inherits your house, car, and other property. A <strong>beneficiary</strong> named on a life insurance policy receives that policy’s money even if the will says something else. Those are two different documents.",
    take2: "Write funeral wishes <strong>outside the will</strong>. A will is often read after the service. Use the workbook, or a short note someone can open the same day.",
    take3: "The FTC <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule</a> lets you compare funeral homes and ask for a price list. Making a plan does not require you to prepay.",
    callout: "Mejor Vida Insurance compares life and final expense policies. We do not draft wills or powers of attorney. For those documents, talk with a lawyer in your state. This page is educational.",
    whatH: "What an estate plan is — and what it is not",
    whatP1: "An estate plan is a written set of instructions for your family. It covers two situations: if you are alive but cannot make decisions, because of illness or an accident, and after you die. It says who can pay the bills, who can speak with doctors, who inherits, and what kind of funeral you want.",
    whatP2: "It is not the same as a <a href=\"" + prepaid + "\">prepaid funeral contract</a> or a <a href=\"" + L.fe + "\">final expense</a> policy. Those are ways to pay. An estate plan is the instruction: who is in charge, where the papers are, and what you want.",
    whatP3: "Mejor Vida Insurance does not sell an estate plan. If you buy life insurance, that policy pays cash to the person you name. A lawyer, if you need one, puts a will and powers of attorney into legal form. Those are separate jobs.",
    fact1H: "If you cannot decide for yourself",
    fact1P: "Name who can handle money and who can speak with doctors. You can also write down which medical treatments you want or do not want.",
    fact2H: "After you die",
    fact2P: "A will or trust says who inherits. Beneficiaries on insurance and retirement accounts receive that money. Funeral wishes belong in a note the family can open right away.",
    fact3H: "Where everything is",
    fact3P: "Write down where the papers are kept, whom to call, and how the funeral will be paid: savings, a prepaid contract, or insurance.",
    whyH: "Why telling someone is not enough",
    whyP1: "In an emergency, the person who “knew” may be away, or remember a detail wrong. A bank will not open a safe-deposit box on a Sunday because a child is sure the will is inside. A short, dated note, with copies in more than one place, is easier to use.",
    whyP2: "The Consumer Financial Protection Bureau explains that it helps to decide, calmly, who may handle money if you cannot. That role is often a <strong>durable power of attorney</strong>: a legal document, not a conversation.",
    stepsH: "Nine steps, in a useful order",
    stepsP: "You do not have to finish this in one weekend. Use the workbook as you go. If a step needs a lawyer, write down the name and the appointment. Do not try to invent a legal form on this website.",
    st1: "<strong>Name the people.</strong> Decide who will be executor of the will, who will have authority over money, and who will speak with doctors. They can be the same person or three different people. The CFPB recommends someone you truly trust: that role is a <strong>fiduciary</strong>, and they must put your interest first.",
    st2: "<strong>Make or update the will.</strong> The will says who inherits the house, the car, and anything without a named beneficiary. Rules differ by state. An internet form may not be valid where you live. Mejor Vida Insurance does not prepare wills.",
    st3: "<strong>Check beneficiaries.</strong> Review life policies, retirement accounts, and sometimes payable-on-death bank accounts. The name on those papers usually takes precedence over the will for that asset. If you divorced and an ex is still on the policy, the money can go there.",
    st4: "<strong>Leave health instructions.</strong> A health-care power of attorney names who decides if you cannot speak. An advance directive, sometimes called a living will, describes treatments. The National Institute on Aging publishes a consumer guide; use forms your state recognizes.",
    st5: "<strong>Write the funeral separately.</strong> Note the kind of service, burial or cremation, and whom to call. Put that in the workbook or on a paper someone can reach. The <a href=\"" + plan + "\">how to plan your funeral</a> guide explains why the will alone is not the right place for it.",
    st6: "<strong>Record where the papers are.</strong> Will, policies, deeds, military discharge, certificates. Do not leave the only copy in a bank box. The workbook has a location table; it is not a place to copy full card numbers or passwords.",
    st7: "<strong>Decide how the funeral will be paid.</strong> You can use savings, a contract already paid, or cash from insurance. Compare those paths in <a href=\"" + pay + "\">how to pay for a funeral</a>. Social Security may pay a one-time <strong>$255</strong> to a qualifying survivor; it does not buy a full funeral.",
    st8: "<strong>List digital accounts.</strong> Email, social media, photos in the cloud. Write the site and username, and <em>where</em> the password is stored — a manager, a booklet at your daughter’s house — not the password itself.",
    st9: "<strong>Talk and review.</strong> Tell the family where the workbook is. Review every few years, or after a divorce, a move, a diagnosis, or a new child.",
    poaH: "Money and health: two different powers of attorney",
    poaP1: "A financial power of attorney lets someone pay the mortgage or talk to the bank if you cannot. “Durable” means it still works if you lose the capacity to decide. A “springing” power waits until a doctor declares incapacity; that can delay access when you need it.",
    poaP2: "A health-care power covers hospitals and treatment, not the bank account. You may name different people. The CFPB publishes guides for someone who is already an agent: what they may do, and how not to mix their money with yours.",
    willH: "Wills, trusts, and money that already has a beneficiary",
    willP1: "A will goes through probate in your state. A living trust is another legal tool; not everyone needs one. We do not recommend one or the other here. That is a lawyer’s job after they see your house, debts, and family.",
    willP2: "Anything with a beneficiary — a final expense policy, a 401(k) — usually goes straight to that person. That is why checking names is not a small step. If the beneficiary has died and there is no backup name, the money may fall into the estate and take longer.",
    funH: "Funeral wishes: a short list is enough",
    funP1: "For the family to begin, it is enough to say what happens to the body, whether there is a visitation, whether there is a religious service or a preferred language, and whether a plot already exists. If you already bought space or a contract, write the funeral home, the plan number, and where the paperwork is. If you already chose a casket or marker brand, you can put that in the workbook; it is not required for the family to start.",
    funP2: "For 2023 the NFDA published a median of <strong>$8,300</strong> for a funeral with viewing and burial, and <strong>$6,280</strong> with viewing and cremation, on the funeral-home side. Plot and marker are often extra. Those figures measure the size of the bill, not the cost of writing your wishes down. More figures in <a href=\"" + cost + "\">how much a funeral costs</a>.",
    funP3: "Veterans and some family members may qualify for burial in a national cemetery or other help. Confirm on VA.gov; it is not automatic. Put the discharge paper (DD-214) location in the workbook.",
    docsH: "Where to keep the papers",
    docsP1: "Three copies are usually enough: one a trusted person can read the same day, one with the attorney, and one in a dry place you remember. Tell those people the workbook exists.",
    docsP2: "Do not leave the only copy in a safe-deposit box. Do not leave the only visitation instructions inside the will. Do not email a filled PDF with full account numbers if other people can open that inbox.",
    insH: "How life insurance fits in",
    insP1: "A smaller <strong>whole life</strong> policy meant for a funeral and short debts is what many families call <strong>final expense</strong> insurance. If the policy stays in force, it pays the person you named. That person chooses the funeral home. The cash is not tied to one casket, unlike many prepaid contracts.",
    insP2: "The price — the <strong>premium</strong> — changes with age, health, tobacco, amount, product, and state. This page does not quote. If you want a comparison, use the online quote or call Mejor Vida Insurance. If you already prepaid exactly the service you want, you may not need another policy of the same size. Those are separate decisions.",
    talkH: "Talking with your family",
    talkP1: "You do not need a long speech. It is enough to say where the workbook is, who the executor is, and what you want for the funeral. If there is tension, the paper reduces fights about “what Mom would have wanted.”",
    talkP2: "If someone asks you to sign a power of attorney or a funeral-home contract this week, ask for time. The FTC recommends comparing price lists. A power of attorney is signed in a calm moment, not under a threat that, if you do not sign, no one will take care of you.",
    faqTitle: "Common questions",
    faq1q: "Is this page or the workbook a will?",
    faq1a: "No. They are education and a form to write on. A valid will follows your state’s rules, usually with witnesses or a notary. Talk with a lawyer.",
    faq2q: "Do I have to pay a funeral home now to have a plan?",
    faq2a: "No. The FTC is clear that you can decide arrangements without sending money in advance. Prepaying is a separate decision with its own rules. See <a href=\"" + prepaid + "\">prepaid funerals</a>.",
    faq3q: "Does Medicare pay for the funeral?",
    faq3a: "Usually no. Medicare covers health services, not the funeral. Social Security may pay $255 to a qualifying survivor. That does not buy a typical funeral.",
    faq4q: "Does final expense insurance replace a will?",
    faq4a: "No. The policy pays a beneficiary. The will distributes other property. You need both if you have a house, debts, or people you want to name.",
    faq5q: "Can I fill the workbook in English?",
    faq5a: "Yes. The PDF on this English page is in English. A Spanish version is on the Spanish page. Use the language your family will find easier to read.",
    faq6q: "Should I write bank passwords on the workbook?",
    faq6a: "No. If the paper is lost or copied, someone else can enter your accounts. Write the institution, last four digits if you need to identify the account, and who can open the password manager.",
    faq7q: "Does a notary stamp make the workbook a legal will?",
    faq7a: "Not automatically. Signing and dating helps the family see it is yours. It does not turn the workbook into a will or a power of attorney. The notary box is optional and does not replace your state’s forms.",
    faq8q: "Does Mejor Vida Insurance keep a copy of my workbook?",
    faq8a: "No. You download it. Do not send it to the agency with account data. If you later ask for a quote, that is a separate process with its own consent.",
    faq9q: "How often should I review it?",
    faq9a: "The FTC suggests reviewing funeral preferences every few years. Do the same with beneficiaries and powers after a divorce, a death in the family, or a move to another state.",
    nextH: "Next step",
    nextLead: "Download the workbook. If you also want a premium range for final expense insurance, request a quote. Those are two different tasks.",
    nextPrimary: "Download the workbook",
    nextPrimaryHref: GIFT.enPdf,
    nextSecondary: "See insurance prices",
    nextSecondaryHref: L.quote,
    nextMore: "Or read how to <a href=\"" + plan + "\">put funeral wishes in writing</a> without paying now.",
    quoteTitle: "Want to compare premiums?",
    quote1: "Final expense, based on age and health",
    quote2: "No obligation to buy",
    quoteCta: "See prices",
    discTitle: "Disclosures",
    discBody: "This guide is educational. It is not legal, tax, or financial advice. Documents (will, trust, powers, directives) depend on your state’s law and a licensed professional. Mejor Vida Insurance LLC is an independent agency; Julie Braunsroth is a licensed insurance agent (NPN #21695431). Quotes on this site are estimates. The downloadable workbook is not an insurance contract and not an agreement with a funeral home.",
    srcTitle: "Sources",
    src1: "<a href=\"https://www.consumerfinance.gov/consumer-tools/educator-tools/resources-for-older-adults/financial-security-as-you-age/planning-for-diminished-capacity-and-illness/\" rel=\"noopener\" target=\"_blank\">CFPB — Planning for diminished capacity and illness</a>",
    src2: "<a href=\"https://www.consumerfinance.gov/consumer-tools/managing-someone-elses-money/\" rel=\"noopener\" target=\"_blank\">CFPB — Managing someone else’s money</a>",
    src3: "<a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC — Funeral Rule</a> and <a href=\"https://consumer.ftc.gov/articles/shopping-funeral-services\" rel=\"noopener\" target=\"_blank\">shopping for funeral services</a>",
    src4: "<a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA — funeral cost statistics</a>",
    src5: "<a href=\"https://www.ssa.gov/benefits/survivors/\" rel=\"noopener\" target=\"_blank\">Social Security — survivor benefits</a>",
    src6: "<a href=\"https://www.va.gov/burials-memorials/\" rel=\"noopener\" target=\"_blank\">VA — burials and memorials</a>",
    src7: "<a href=\"https://www.nia.nih.gov/health/advance-care-planning/advance-care-planning-advance-directives-health-care\" rel=\"noopener\" target=\"_blank\">NIA/NIH — advance care planning and health care directives</a>",
    src8: "<a href=\"https://www.nia.nih.gov/health/advance-care-planning/getting-your-affairs-order-checklist-documents-prepare-future\" rel=\"noopener\" target=\"_blank\">NIA/NIH — getting your affairs in order</a>",
    src9: "<a href=\"https://www.usa.gov/death-loved-one\" rel=\"noopener\" target=\"_blank\">USA.gov — dealing with the death of a loved one</a>",
    src10: "<a href=\"https://www.ncoa.org/article/the-ultimate-estate-planning-checklist-a-step-by-step-guide/\" rel=\"noopener\" target=\"_blank\">NCOA — consumer estate-planning checklist</a>",
  };
}

function estateMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const related = isEs
    ? `<p class="lic-rate-note">Más en esta sección:
<a href="cuanto-cuesta-un-funeral.html">Costo de un funeral</a> ·
<a href="funerales-prepagados.html">Prepagado</a> ·
<a href="como-pagar-un-funeral.html">Cómo se paga</a> ·
<a href="como-planificar-su-funeral.html">Cómo planificar</a> ·
<a href="${L.fe}">Seguro de gastos finales</a> ·
<a href="guias-gastos-finales.html">Índice de guías</a></p>`
    : `<p class="lic-rate-note">More in this section:
<a href="how-much-does-a-funeral-cost.html">Funeral cost</a> ·
<a href="prepaid-funerals.html">Prepaid</a> ·
<a href="how-to-pay-for-a-funeral.html">How it’s paid</a> ·
<a href="how-to-plan-your-funeral.html">How to plan</a> ·
<a href="${L.fe}">Final expense</a> ·
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
<p class="lic-kicker">${isEs ? "Planificación patrimonial y funeral" : "Estate and funeral planning"}</p>
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#${isEs ? "regalo" : "gift"}">${isEs ? "Cuaderno" : "Workbook"}</a>
<a href="#what">${isEs ? "Qué es" : "What it is"}</a>
<a href="#steps">${isEs ? "Pasos" : "Steps"}</a>
<a href="#funeral">${isEs ? "Funeral" : "Funeral"}</a>
<a href="#faq">${isEs ? "Preguntas" : "Questions"}</a>
<a href="#next">${isEs ? "Siguiente" : "Next"}</a>
</nav>
<div class="lic-takeaways">
<h2>${c.takeH}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
${giftBandHtml(lang, c)}
<div class="lic-helpful"><p>${c.callout}</p></div>
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
<section class="lic-section" id="why">
<h2>${c.whyH}</h2>
<p>${c.whyP1}</p>
<p>${c.whyP2}</p>
</section>
<section class="lic-section" id="steps">
<h2>${c.stepsH}</h2>
<p>${c.stepsP}</p>
${stepsHtml(c)}
</section>
<section class="lic-section" id="poa">
<h2>${c.poaH}</h2>
<p>${c.poaP1}</p>
<p>${c.poaP2}</p>
</section>
<section class="lic-section" id="will">
<h2>${c.willH}</h2>
<p>${c.willP1}</p>
<p>${c.willP2}</p>
</section>
<section class="lic-section" id="funeral">
<h2>${c.funH}</h2>
<p>${c.funP1}</p>
<p>${c.funP2}</p>
<p>${c.funP3}</p>
</section>
<section class="lic-section" id="docs">
<h2>${c.docsH}</h2>
<p>${c.docsP1}</p>
<p>${c.docsP2}</p>
</section>
<section class="lic-section" id="insurance">
<h2>${c.insH}</h2>
<p>${c.insP1}</p>
<p>${c.insP2}</p>
</section>
<section class="lic-section" id="talk">
<h2>${c.talkH}</h2>
<p>${c.talkP1}</p>
<p>${c.talkP2}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
${nextStepBandHtml(lang, c, { quoteHref: c.nextPrimaryHref })}
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<section class="lic-section" id="sources">
<h2>${c.srcTitle}</h2>
<ul>
${[c.src1, c.src2, c.src3, c.src4, c.src5, c.src6, c.src7, c.src8, c.src9, c.src10].filter(Boolean).map((s) => `<li>${s}</li>`).join("\n")}
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

module.exports = { copyEstate, estateMain, GIFT };
