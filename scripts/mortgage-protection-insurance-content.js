"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

function copyMortgage(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title:
        "Seguro de protección hipotecaria: qué cubre y qué no (2026) | Mejor Vida Seguros",
      desc: "La protección hipotecaria es un uso del seguro de vida, no un producto aparte. Quién cobra, diferencia con el seguro hipotecario privado (PMI), temporal nivelada o decreciente, edades, y precios de muestra de compañías con las que trabajamos.",
      h1: "Protección hipotecaria: es seguro de vida para la hipoteca, no un tipo de póliza distinto",
      lead: "Cuando alguien pide “seguro de protección hipotecaria”, casi siempre está pidiendo un seguro de vida del tamaño del saldo de la casa. Si usted fallece mientras sigue pagando la póliza, la persona que nombró recibe dinero en efectivo. Esa persona puede pagar el préstamo — o usarlo para otra cosa. El banco no cobra automáticamente, salvo que usted haya firmado una cesión: un papel que le da al banco el derecho a ese dinero.",
      crumbEnd: "Protección hipotecaria",

      take1:
        "No es un producto secreto del banco. Es <strong>seguro de vida</strong> — casi siempre temporal (cubre un número fijo de años y luego termina) — con un monto y un plazo pensados para la hipoteca.",
      take2:
        "El cheque llega al <strong>beneficiario</strong> (la persona que usted nombra), no al banco, a menos que usted haya firmado un papel que le da al banco el derecho a ese dinero. Si el saldo de la casa es menor que el monto de la póliza, el resto suele quedarse en la familia.",
      take3:
        "No es lo mismo que el <strong>seguro hipotecario privado (PMI, por sus siglas en inglés)</strong>. El PMI protege al banco si usted deja de pagar. La Oficina de Protección Financiera del Consumidor de EE. UU. (CFPB) lo dice con claridad: el PMI no lo protege a usted.",
      callout:
        "Después de comprar o refinanciar, suele llegar correo ofreciendo “protección hipotecaria”. Eso no es un programa del banco. Es publicidad de seguro de vida. Compare con un agente independiente antes de responder.",

      whatH: "Qué está pidiendo, en palabras simples",
      whatP1:
        "La hipoteca es una deuda con fecha: un número de años y un saldo que baja si usted paga. El seguro de vida no tiene que llamarse “hipotecario” para servir. Lo que importa es que el monto cubra lo que todavía se debe — o los pagos de varios años — y que el plazo dure tanto como queda de préstamo.",
      whatP2:
        "En Mejor Vida Seguros cotizamos eso con vida temporal de compañías de seguros con las que trabajamos. Un plan permanente (vida entera) también puede pagar un saldo, pero cuesta más por cada dólar porque la cobertura no vence. Para una deuda que sí se acaba, el temporal suele ser el camino más barato.",
      fact1H: "Qué compra",
      fact1P:
        "Un monto de seguro de vida — por ejemplo $150,000 o $250,000 — que dura un plazo que usted elige. En nuestras cotizaciones de temporal, los plazos habituales son 10, 15, 20, 25 o 30 años.",
      fact2H: "Quién cobra",
      fact2P:
        "La persona o las personas que usted pone como beneficiario. El banco no aparece en el contrato a menos que usted lo ceda por escrito.",
      fact3H: "Qué no compra",
      fact3P:
        "No paga la hipoteca si usted pierde el trabajo o se enferma, salvo un extra aparte (un anexo) que casi nunca está en estas pólizas. Tampoco sustituye el seguro de la casa ni el PMI.",

      howH: "Cómo funciona el pago, en cuatro pasos",
      how1T: "Usted elige el monto y los años",
      how1:
        "Una forma clara: mire el saldo actual y los años que quedan. Si debe $220,000 y le faltan 18 años, un temporal de 20 años por $250,000 cubre el saldo con un margen. Si lo que quiere es que el cónyuge pueda seguir pagando la cuota mes a mes, el monto puede ser más bajo — varios años de esa cuota — y hay un diseño que baja con los años pensado para eso.",
      how2T: "Responde preguntas de salud",
      how2:
        "No hay temporal sin preguntas de salud. Hay un cuestionario. Un plan simplificado (sin examen en el consultorio) existe: American Amicable Easy Term da una decisión en la misma sesión, de $25,000 hasta $500,000 antes de los 46 años y hasta $300,000 después. Un plan con revisión completa de salud — Transamerica Trendsetter Super, Corebridge Select-a-Term, Mutual of Omaha Term Life Answers — suele abrir mejor precio y montos más altos.",
      how3T: "Paga una cuota fija durante el plazo",
      how3:
        "En un temporal nivelado, el pago mensual no cambia si mantiene la póliza al día. El monto que cobra la familia tampoco cambia. En un temporal decreciente, la cuota suele quedarse igual y el monto que se paga baja con los años, como baja el saldo de un préstamo.",
      how4T: "Si usted fallece, la familia recibe efectivo",
      how4:
        "La aseguradora paga al beneficiario, no a la hipoteca. Esa persona puede liquidar el préstamo, seguir pagando la cuota, o usar el dinero para el funeral y los gastos del mes. Si el saldo ya es menor que el monto de la póliza, el resto no se lo queda el banco.",

      pmiH: "Esto no es el seguro hipotecario privado (PMI) — ni el seguro de la casa",
      pmiP:
        "Tres coberturas se mezclan en el cierre de la casa y no hacen el mismo trabajo. El CFPB (la agencia federal de protección al consumidor) las separa. Conviene tenerlas claras antes de comprar una cuarta cosa con un nombre parecido.",
      pmiCol1: "PMI",
      pmiCol1Sub: "Seguro hipotecario privado",
      pmiCol2: "Seguro de vivienda",
      pmiCol2Sub: "Daños a la propiedad",
      pmiCol3: "Seguro de vida",
      pmiCol3Sub: "Si usted fallece",
      pmiR1H: "A quién protege",
      pmiR1a: "Al banco",
      pmiR1b: "A usted y a la casa",
      pmiR1c: "A la persona que usted nombra",
      pmiR2H: "Qué dispara el pago",
      pmiR2a: "Usted deja de pagar el préstamo",
      pmiR2b: "Incendio, robo u otro daño cubierto",
      pmiR2c: "Su fallecimiento, con la póliza al día",
      pmiR3H: "¿Es obligatorio?",
      pmiR3a: "Suele serlo si la entrada es menor al 20%",
      pmiR3b: "El banco exige prueba de que existe",
      pmiR3c: "No. Nadie puede exigirle este seguro de vida",
      pmiR4H: "¿Le paga a su familia?",
      pmiR4a: "No. El CFPB: protege al banco, no a usted",
      pmiR4b: "Repara o reemplaza la propiedad, no paga la hipoteca",
      pmiR4c: "Sí: un cheque al beneficiario",
      pmiNote:
        "El <a href=\"https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/\" rel=\"noopener\" target=\"_blank\">CFPB (Oficina de Protección Financiera del Consumidor)</a> explica el PMI así: lo exige el banco cuando la entrada es menor al 20% en un préstamo convencional, y cubre al banco si usted deja de pagar. Si se atrasa, igual puede perder la casa. El PMI no paga un beneficio si usted fallece.",

      kindsH: "El temporal es lo que cubre un préstamo — hay dos diseños",
      kindsLead:
        "Una hipoteca tiene fecha de término. El seguro que la cubre debe durar al menos los años que quedan del préstamo, no para siempre. Ese producto es el seguro de vida temporal: no es una póliza especial del banco, y no es el PMI.",
      kindsLead2:
        "En las compañías con las que trabajamos el temporal viene de dos formas. El pago se queda igual durante todo el plazo, o se encoge a medida que baja el saldo. La vida entera es otro producto, y se ofrece mucho al cerrar. Suele ser el camino equivocado si la única meta es el préstamo que queda.",
      kind1Kicker: "La cotización típica de partida",
      kind1H: "Temporal nivelada",
      kind1:
        "El monto que se paga a la familia y la cuota mensual se quedan iguales todo el plazo. Si el saldo ya bajó y usted fallece al final, la familia recibe el monto completo — no solo lo que aún se debe. Ese extra es suyo. Es el diseño que cotizamos en el cotizador de temporal con Transamerica, Corebridge y Mutual of Omaha.",
      kind2Kicker: "Si solo quiere el saldo que va bajando",
      kind2H: "Temporal decreciente",
      kind2:
        "El monto baja con un calendario, pensado para un préstamo. Cuesta menos que la nivelada porque la compañía cubre cada vez menos. Americo Payment Protector puede pagar renta mensual por el período que queda (mínimo 24 meses) o un solo pago. El equivalente inicial típico va de $25,000 a $450,000. Plazos de 15, 20, 25, 30 años y hasta los 70. La cuota no sube. Payment Protector Continuation deja un 10% del monto inicial de forma permanente si no se usó la renta mensual.",
      kind3H: "¿Y la vida entera?",
      kind3:
        "Cubre toda la vida si paga a tiempo, y por eso cuesta más por cada dólar. Encaja si, además de la hipoteca, quiere un beneficio que no venza — un cónyuge, gastos finales, un legado. No es el primer camino si el único trabajo es un saldo que se acaba solo.",

      mailH: "El correo que llega después del cierre",
      mailP1:
        "Casi nadie cierra una casa sin recibir cartas que hablan de “protección hipotecaria” o de un “programa especial”. No es un beneficio del banco. El PMI sí lo arregla el banco y aparece en su Loan Estimate (el resumen de costos del préstamo que el banco debe entregarle al cerrar). Esta carta no.",
      mailP2:
        "Si responde, un agente le va a vender un seguro de vida. Puede ser un buen producto o uno caro y rígido. La pregunta útil no es “¿viene del banco?” — no viene. La pregunta es si el monto, el plazo y el precio se sostienen frente a una cotización independiente.",

      sizeH: "Cuánto comprar y por cuántos años",
      sizeLead:
        "No use un número de un anuncio. Sume lo que la familia tendría que cubrir si usted falleciera este año. La <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">guía del comprador de la Asociación Nacional de Comisionados de Seguros (NAIC)</a> pide esa suma personal, no una fórmula única.",
      size1T: "El saldo de hoy",
      size1:
        "Ese es el punto de partida si la meta es dejar la casa libre de deuda. No el precio de compra de hace diez años.",
      size2T: "Los años que quedan",
      size2:
        "El plazo del seguro debe durar al menos tanto como el préstamo. Si quedan 22 años, un temporal de 20 se acaba antes. Un plazo de 30 cuesta más al mes, porque la compañía cubre más tiempo.",
      size3T: "Si también hay que reemplazar el sueldo",
      size3:
        "Sume varios años de su ingreso a la hipoteca. Un ejemplo: $55,000 al año durante diez años es $550,000; más $180,000 de saldo da unos $730,000. Reste ahorros u otras pólizas. Es una conversación, no una cotización.",
      sizeEx:
        "Ejemplo corto. Saldo $200,000, 20 años por delante, no fumador de 40 años. En nuestras muestras de compañías con las que trabajamos, $250,000 a 20 años ronda <strong>$16 al mes para una mujer</strong> y <strong>$18 al mes para un hombre</strong> en la mejor clase de salud de estas muestras. Un plazo de 30 años del mismo monto ronda <strong>$24 / $30</strong>. Cifras educativas, no una oferta.",

      ageH: "Hasta qué edad se puede pedir cada plazo",
      ageP:
        "La edad máxima es el tope del producto, no un número de internet. En las compañías de estas muestras (no fumador), un plazo de 10 años puede emitirse hasta cerca de los 80; uno de 20 hasta cerca de los 70; uno de 30 hasta cerca de los 60. El tabaco baja el tope. Payment Protector de Americo: 15 años hasta 75, 20 hasta 70, 30 hasta 60, y “hasta los 70” hasta los 50.",
      ageColT: "Plazo",
      ageColA: "Edad máxima típica al comprar (no fumador)",
      ageUntil: "hasta",
      age1: "10 años",
      age1A: "80",
      age2: "20 años",
      age2A: "70",
      age3: "30 años",
      age3A: "60",
      ageNote:
        "Topes combinados de Transamerica Trendsetter Super, Mutual of Omaha Term Life Answers, American Amicable Easy Term y Assurity Term. Fumador: el de 30 años suele cortar cerca de los 50–55.",

      costH: "Cuánto cuesta cubrir un saldo",
      costP:
        "Estos pagos mensuales son de compañías con las que trabajamos, no fumador, mejor clase de salud con revisión completa. Cada celda es la más baja entre esas compañías. Un plan simplificado (sin examen en el consultorio) suele costar más por el mismo monto. No es una oferta.",

      fitH: "¿Le sirve este camino?",
      fitYesH: "Puede encajar si",
      fitYes1: "Queda un saldo o una cuota que la familia no podría sostener sin su ingreso.",
      fitYes2: "Quiere que el dinero vaya a una persona de confianza, no automáticamente al banco.",
      fitYes3: "Puede responder preguntas de salud y el plazo todavía existe a su edad.",
      fitNoH: "Suele no encajar si",
      fitNo1:
        "La meta es un funeral, no un préstamo. Entonces compare <a href=\"seguro-gastos-finales.html\">gastos finales</a>.",
      fitNo2:
        "No puede o no quiere un cuestionario de salud. El temporal no se emite sin preguntas.",
      fitNo3:
        "La casa ya está pagada. Entonces el nombre “protección hipotecaria” no describe lo que necesita.",

      buyH: "Dónde comprarlo — y dónde no",
      buy1T: "Un agente independiente",
      buy1:
        "Mejor Vida Seguros compara compañías de seguros para su edad, salud y plazo. Esa es la ruta que usamos.",
      buy2T: "Directo con una aseguradora",
      buy2:
        "Algunas venden al público. Usted ve un solo precio. No ve si otra compañía con la que trabajamos cobra menos por el mismo monto.",
      buy3T: "El equipo de la compra de la casa",
      buy3:
        "El banco y el agente inmobiliario no son su agente de vida. Pueden recomendar a alguien. Pida cotizar aparte, con el saldo y los años por escrito.",

      applyH: "Cómo cotizamos esto",
      applyLead:
        "El cotizador de temporal es la herramienta pública para un monto de hipoteca. Empiece ahí. Si el objetivo es una renta mensual que baje con los años, revisamos Payment Protector de Americo en una llamada.",
      apply1T: "Diga el saldo y los años que quedan",
      apply1: "Eso fija el monto y el plazo. No hace falta el número de préstamo.",
      apply2T: "Edad, sexo, tabaco, estatura y peso",
      apply2: "Fijan la clase de precio. El estado también: cotizamos en línea donde estamos licenciados.",
      apply3T: "Compare nivelada y, si aplica, decreciente",
      apply3:
        "La nivelada deja un extra a la familia cuando el saldo ya bajó. La decreciente cuesta menos por cubrir un monto que se encoge.",
      applyQuoteH: "Cotización de temporal",
      applyQuoteP: "Montos de hipoteca, plazos de 10 a 30 años, con preguntas de salud o con revisión completa.",
      applyQuoteCta: "Ver precios de temporal",
      applyCallH: "Hablar con Mejor Vida Seguros",
      applyCallP: "Para Payment Protector o un monto que no entra en el cotizador.",
      applyCallCta: "Agendar una llamada",
      applyPhone: "O llame al",

      faqTitle: "Preguntas frecuentes",
      faq1q: "¿El banco cobra el seguro de vida si yo muero?",
      faq1a:
        "No, salvo una cesión (un papel que le da al banco el derecho al dinero). El beneficiario — la persona que usted nombró — recibe el efectivo y decide si paga el préstamo. En las pólizas que cotizamos, esa es la regla.",
      faq2q: "¿Es lo mismo que el PMI (seguro hipotecario privado)?",
      faq2a:
        "No. El seguro hipotecario privado (PMI) protege al banco si usted deja de pagar y suele exigirse con menos del 20% de entrada. El seguro de vida paga a su familia si usted fallece. Puede tener los dos; uno no reemplaza al otro. Fuente: Oficina de Protección Financiera del Consumidor (CFPB).",
      faq3q: "¿Cuánto cuesta?",
      faq3a:
        "Depende de la edad, el sexo, el tabaco, la salud, el monto y el plazo. En nuestras muestras, $250,000 a 20 años a los 40 años ronda $16–$18 al mes (no fumador, mejor clase de salud). A los 50, el mismo plan ronda $31–$40. Use las tablas de esta página y el cotizador para su combinación.",
      faq4q: "¿Hasta qué edad puedo comprarlo?",
      faq4a:
        "Depende del plazo. Un temporal de 10 años puede emitirse hasta cerca de los 80; uno de 30 hasta cerca de los 60, no fumador. Dónde Mejor Vida Seguros tiene licencia está en la página de <a href=\"licencias.html\">licencias</a>.",
      faq5q: "¿La hipoteca queda pagada sola?",
      faq5a:
        "Solo si el beneficiario usa el dinero para eso, o si hubo una cesión al banco. El contrato de vida no liquida el préstamo por sí solo.",
      faq6q: "¿Debo comprar el que llega por correo?",
      faq6a:
        "No está obligado. Compare el monto, el plazo y el precio con una cotización independiente. Las cartas después del cierre no son un programa del banco.",
      faq7q: "¿Puedo usar vida entera para la hipoteca?",
      faq7a:
        "Sí, y cuesta más. Tiene sentido si también quiere un beneficio que no venza. Para solo el saldo, el temporal suele comprar más dólares por la misma cuota mensual.",
      faq8q: "¿Qué pasa si termino de pagar la casa antes?",
      faq8a:
        "En una temporal nivelada la póliza sigue hasta el fin del plazo, y la familia cobraría el monto completo. Puede cancelarla; en general no hay ahorro dentro de la póliza que devolver. En una decreciente, el monto ya habría bajado con los años.",
      faq9q: "¿Hay espera de dos años?",
      faq9a:
        "En un temporal nivelado que califica, no. El monto completo aplica desde que la póliza está activa, sujeto al contrato. La espera de dos años es típica de la aceptación garantizada (un plan sin preguntas de salud), que es otro producto y no se usa para un saldo grande.",

      nextH: "Siguiente paso",
      nextP: `Para ver un precio con su edad y su saldo, use la <a href="term-quote.html">cotización de temporal</a> o llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a>.`,
      discTitle: "Aviso",
      discBody:
        "Esta página es educativa, no una oferta. Edades, montos y precios cambian por compañía, producto, tabaco y estado. Mejor Vida Seguros LLC es una agencia independiente. El número nacional de productor (NPN, el número que identifica a la agencia en los registros estatales) es 21695431. Los estados con licencia actual están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotizar la hipoteca",
      quote1: "Vida temporal que cotizamos",
      quote2: "Monto y plazo a su saldo",
      quoteCta: "Ver precios",
      srcTitle: "Fuentes",
      src1: '<a href="https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/" rel="noopener" target="_blank">CFPB: What is private mortgage insurance?</a> — el seguro hipotecario privado (PMI) protege al banco, no al dueño, y suele exigirse con menos del 20% de entrada.',
      src2: '<a href="https://www.consumerfinance.gov/ask-cfpb/what-is-mortgage-insurance-and-how-does-it-work-en-1953/" rel="noopener" target="_blank">CFPB: What is mortgage insurance and how does it work?</a> — PMI; el seguro hipotecario de la Administración Federal de Vivienda (FHA), llamado prima de seguro hipotecario (MIP); y el seguro de préstamos del Departamento de Agricultura (USDA). Ninguno paga un beneficio a la familia si usted fallece.',
      src3: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: Life insurance</a> — la Asociación Nacional de Comisionados de Seguros. El temporal cubre uno o más años y, en general, no acumula un ahorro dentro de la póliza; la guía pide sumar deudas e ingresos, no usar un anuncio.',
      src4: "Guías de producto de compañías con las que trabajamos: Transamerica Trendsetter Super, Corebridge Select-a-Term, Mutual of Omaha Term Life Answers, American Amicable Easy Term, Americo Payment Protector (serie Instant Decision Term).",
      src5: "Precios de muestra: Integrity Connect, compañías con las que trabajamos, no fumador, mejor clase de salud, Nebraska, agosto 2026. Cada celda es la más baja entre esas compañías.",
    };
  }

  return {
    title:
      "Mortgage protection insurance: what it covers and what it does not (2026) | Mejor Vida Insurance",
    desc: "Mortgage protection is a use of life insurance, not a separate policy type. Who gets paid, how it differs from private mortgage insurance (PMI), level vs decreasing term, issue ages, and sample prices from companies we work with.",
    h1: "Mortgage protection is life insurance for your home loan — not a different kind of policy",
    lead: "When someone asks for “mortgage protection insurance,” they almost always mean life insurance sized to the remaining home loan. If you die while you keep paying the policy, the person you named receives cash. That person can pay off the loan — or use the money another way. The bank is not paid automatically unless you signed an assignment: a written form that gives the bank the right to that money.",
    crumbEnd: "Mortgage protection",

    take1:
      "There is no secret lender product. This is <strong>life insurance</strong> — usually term (coverage that lasts a set number of years, then ends) — with an amount and a length chosen to match the mortgage.",
    take2:
      "The check goes to the <strong>beneficiary</strong> (the person you name), not to the bank, unless you signed a form that gives the bank that right. If the home loan is smaller than the policy amount, the rest usually stays with the family.",
    take3:
      "It is not <strong>private mortgage insurance (PMI)</strong>. PMI protects the lender if you stop making payments. The U.S. Consumer Financial Protection Bureau (CFPB) is blunt: PMI does not protect you.",
    callout:
      "After you buy or refinance, mail often arrives offering “mortgage protection.” That is not a bank program. It is life insurance advertising. Compare it with an independent quote before you reply.",

    whatH: "What you are actually buying",
    whatP1:
      "A mortgage is a debt with an end date: a number of years and a balance that falls if you pay. Life insurance does not have to be labeled “mortgage” to do the job. What matters is that the amount covers what is still owed — or several years of the payment — and that the term lasts as long as the loan has left.",
    whatP2:
      "Mejor Vida Insurance quotes that with term life from insurance companies we work with. A permanent policy (whole life) can also pay a balance, but it costs more per dollar because the coverage does not expire. For a debt that does expire, term is usually the cheaper path.",
    fact1H: "What you buy",
    fact1P:
      "A life insurance amount — for example $150,000 or $250,000 — that lasts a term you choose. On our term quotes the usual lengths are 10, 15, 20, 25, or 30 years.",
    fact2H: "Who gets paid",
    fact2P:
      "The person or people you name as beneficiary. The lender is not on the contract unless you assign it in writing.",
    fact3H: "What you do not buy",
    fact3P:
      "It does not pay the mortgage if you lose a job or get sick, unless a separate add-on says so — and those add-ons are rarely on these policies. It also does not replace homeowners insurance or PMI.",

    howH: "How the payout works, in four steps",
    how1T: "You choose the amount and the years",
    how1:
      "A clear way: look at today’s balance and the years left. If you owe $220,000 with 18 years remaining, a 20-year $250,000 term covers the balance with a cushion. If the goal is that a spouse can keep making the monthly payment, the amount can be lower — several years of that payment — and there is a design that shrinks over time built for that.",
    how2T: "You answer health questions",
    how2:
      "There is no term life with no health questions. There is a questionnaire. A simplified plan (no in-office exam) exists: American Amicable Easy Term returns a decision in the same session, from $25,000 up to $500,000 before age 46 and up to $300,000 after. A full health review — Transamerica Trendsetter Super, Corebridge Select-a-Term, Mutual of Omaha Term Life Answers — usually opens a better price and higher amounts.",
    how3T: "You pay a fixed monthly amount for the years you bought",
    how3:
      "On level term, the monthly payment does not change if you keep the policy active, and the amount the family receives does not change either. On decreasing term, the monthly payment usually stays the same while the payout falls with the years, the way a loan balance falls.",
    how4T: "If you die, the family receives cash",
    how4:
      "The insurer pays the beneficiary, not the mortgage. That person can pay off the loan, keep making the payment, or use the money for a funeral and the month’s bills. If the balance is already smaller than the policy amount, the extra does not go to the bank.",

    pmiH: "This is not private mortgage insurance (PMI) — and not homeowners insurance",
    pmiP:
      "Three coverages get mixed up at closing and they do different jobs. The CFPB (the federal consumer-protection agency) keeps them separate. It helps to keep them straight before you buy a fourth thing with a similar name.",
    pmiCol1: "PMI",
    pmiCol1Sub: "Private mortgage insurance",
    pmiCol2: "Homeowners insurance",
    pmiCol2Sub: "Damage to the house",
    pmiCol3: "Life insurance",
    pmiCol3Sub: "If you die",
    pmiR1H: "Who it protects",
    pmiR1a: "The lender",
    pmiR1b: "You and the property",
    pmiR1c: "The person you name",
    pmiR2H: "What triggers a payment",
    pmiR2a: "You stop paying the loan",
    pmiR2b: "Fire, theft, or another covered loss",
    pmiR2c: "Your death, with the policy still active",
    pmiR3H: "Is it required?",
    pmiR3a: "Usually, if the down payment is under 20%",
    pmiR3b: "The lender requires proof that it exists",
    pmiR3c: "No. No one can require this life policy",
    pmiR4H: "Does your family get paid?",
    pmiR4a: "No. The CFPB: it protects the lender, not you",
    pmiR4b: "It repairs or replaces the property, not the loan",
    pmiR4c: "Yes: a check to the beneficiary",
    pmiNote:
      "The <a href=\"https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/\" rel=\"noopener\" target=\"_blank\">CFPB (Consumer Financial Protection Bureau)</a> describes PMI this way: the lender requires it when the down payment is under 20% on a conventional loan, and it insures the lender if you stop paying. If you fall behind, you can still lose the home. PMI does not pay a death benefit.",

    kindsH: "Term life is what covers a loan — two designs",
    kindsLead:
      "A mortgage has an end date. The insurance that covers it should last at least as long as the years left on the loan, not forever. That product is term life: not a special bank policy, and not PMI.",
    kindsLead2:
      "At companies we work with, term comes in two designs. The payout stays the same for the whole term, or it shrinks as the balance falls. Whole life is a different product, and it gets offered a lot at closing. It is usually the wrong first tool if the only job is the remaining loan.",
    kind1Kicker: "The typical first quote",
    kind1H: "Level term",
    kind1:
      "The amount paid to the family and the monthly price stay the same for the whole term. If the balance has already fallen and you die near the end, the family still receives the full amount — not only what is still owed. That extra is theirs. This is the design we quote in the term quote tool with Transamerica, Corebridge, and Mutual of Omaha.",
    kind2Kicker: "If you only want the shrinking balance",
    kind2H: "Decreasing term",
    kind2:
      "The payout falls on a schedule, meant to track a loan. It costs less than level term because the company covers less over time. Americo Payment Protector can pay monthly income for the remaining period (at least 24 months) or a lump sum. Typical starting amounts run $25,000 to $450,000. Periods are 15, 20, 25, 30 years and to age 70. The monthly payment does not increase. Payment Protector Continuation leaves 10% of the original amount as permanent coverage if monthly income was not used.",
    kind3H: "What about whole life?",
    kind3:
      "It lasts for life if you pay on time, and that is why it costs more per dollar. It fits if, besides the mortgage, you want a benefit that does not expire — a spouse, final expenses, a gift. It is not the first path if the only job is a balance that will end on its own.",

    mailH: "The mail that arrives after closing",
    mailP1:
      "Almost no one closes on a house without getting letters about “mortgage protection” or a “special program.” That is not a lender benefit. PMI is arranged by the bank and shows on your Loan Estimate (the cost form the lender must give you when you close). This letter does not.",
    mailP2:
      "If you reply, an agent will try to sell you life insurance. It might be a fair policy or an expensive, rigid one. The useful question is not “did this come from the bank?” — it did not. The useful question is whether the amount, the term, and the price hold up against an independent quote.",

    sizeH: "How much to buy, and for how many years",
    sizeLead:
      "Do not use a number from an ad. Add up what the family would still need to cover if you died this year. The <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">buyer’s guide from the National Association of Insurance Commissioners (NAIC)</a> asks for that personal add-up, not a single formula.",
    size1T: "Today’s balance",
    size1:
      "That is the starting point if the goal is to leave the house free of debt. Not the purchase price from ten years ago.",
    size2T: "The years left",
    size2:
      "The insurance term should last at least as long as the loan. If 22 years remain, a 20-year term ends first. A 30-year term costs more per month, because the company is covering a longer stretch.",
    size3T: "If income also has to be replaced",
    size3:
      "Add several years of your pay to the mortgage. An example: $55,000 a year for ten years is $550,000; plus a $180,000 balance is about $730,000. Subtract savings or other policies. That is a conversation, not a quote.",
    sizeEx:
      "A short example. Balance $200,000, 20 years left, non-smoker age 40. In our samples from companies we work with, $250,000 for 20 years is about <strong>$16 a month for a woman</strong> and <strong>$18 a month for a man</strong> in the best health class of these samples. The same amount for 30 years is about <strong>$24 / $30</strong>. Educational figures, not an offer.",

    ageH: "Until what age each term can still be issued",
    ageP:
      "The maximum age is the product’s ceiling, not a number from a search. On the companies in these samples (non-tobacco), a 10-year term can be issued into the low 80s; a 20-year term into about 70; a 30-year term into about 60. Tobacco lowers the ceiling. Americo Payment Protector: 15-year through 75, 20-year through 70, 30-year through 60, and “to age 70” through 50.",
    ageColT: "Term",
    ageColA: "Typical maximum buying age (non-tobacco)",
    ageUntil: "through",
    age1: "10 years",
    age1A: "80",
    age2: "20 years",
    age2A: "70",
    age3: "30 years",
    age3A: "60",
    ageNote:
      "Combined ceilings from Transamerica Trendsetter Super, Mutual of Omaha Term Life Answers, American Amicable Easy Term, and Assurity Term. Tobacco: a 30-year term often cuts off near 50–55.",

    costH: "What it costs to cover a balance",
    costP:
      "These monthly prices are from companies we work with, non-tobacco, best health class with a full health review. Each cell is the lowest among those companies. A simplified plan (no in-office exam) usually costs more for the same amount. Not an offer.",

    fitH: "Does this path fit?",
    fitYesH: "It can fit if",
    fitYes1: "A balance or a monthly payment remains that the family could not carry without your income.",
    fitYes2: "You want the money to go to a person you trust, not automatically to the bank.",
    fitYes3: "You can answer health questions and a term length still exists at your age.",
    fitNoH: "It usually does not fit if",
    fitNo1:
      "The goal is a funeral, not a loan. Then compare <a href=\"final-expense-insurance.html\">final expense</a>.",
    fitNo2:
      "You cannot or will not answer health questions. Term is not issued with no questions.",
    fitNo3:
      "The house is already paid off. Then the name “mortgage protection” does not describe what you need.",

    buyH: "Where to buy it — and where not to",
    buy1T: "An independent agent",
    buy1:
      "Mejor Vida Insurance compares insurance companies for your age, health, and term. That is the path we use.",
    buy2T: "Straight from an insurer",
    buy2:
      "Some sell to the public. You see one price. You do not see whether another company we work with charges less for the same amount.",
    buy3T: "The home-buying team",
    buy3:
      "The lender and the real-estate agent are not your life agent. They may recommend someone. Ask to quote separately, with the balance and the years in writing.",

    applyH: "How we quote this",
    applyLead:
      "The term quote tool is the public tool for a mortgage-sized amount. Start there. If the goal is a monthly income that falls with the years, we review Americo Payment Protector on a call.",
    apply1T: "Give the balance and the years left",
    apply1: "That sets the amount and the term. The loan number is not required.",
    apply2T: "Age, sex, tobacco, height, and weight",
    apply2: "Those set the price class. State matters too: we quote online where we are licensed.",
    apply3T: "Compare level term and, if it fits, decreasing term",
    apply3:
      "Level term leaves extra with the family after the balance has fallen. Decreasing term costs less because it covers a shrinking amount.",
    applyQuoteH: "Term quote",
    applyQuoteP: "Mortgage-sized amounts, 10- to 30-year terms, with health questions or a full health review.",
    applyQuoteCta: "See term prices",
    applyCallH: "Talk with Mejor Vida Insurance",
    applyCallP: "For Payment Protector or an amount the quote tool does not cover.",
    applyCallCta: "Schedule a call",
    applyPhone: "Or call",

    faqTitle: "Frequently asked questions",
    faq1q: "Does the bank get the life insurance if I die?",
    faq1a:
      "No, unless there is an assignment (a written form that gives the bank the right to the money). The beneficiary — the person you named — receives the cash and decides whether to pay the loan. That is the rule on the policies we quote.",
    faq2q: "Is this the same as PMI (private mortgage insurance)?",
    faq2a:
      "No. Private mortgage insurance (PMI) protects the lender if you stop paying and is usually required with less than 20% down. Life insurance pays your family if you die. You can have both; one does not replace the other. Source: Consumer Financial Protection Bureau (CFPB).",
    faq3q: "How much does it cost?",
    faq3a:
      "It depends on age, sex, tobacco, health, amount, and term. In our samples, $250,000 for 20 years at age 40 is about $16–$18 a month (non-tobacco, best health class). At 50, the same plan is about $31–$40. Use the tables on this page and the quote tool for your combination.",
    faq4q: "Until what age can I buy it?",
    faq4a:
      "It depends on the term. A 10-year term can be issued into about age 80; a 30-year term into about 60, non-tobacco. Where Mejor Vida Insurance is licensed is on the <a href=\"licenses.html\">licenses</a> page.",
    faq5q: "Does the mortgage get paid off by itself?",
    faq5a:
      "Only if the beneficiary uses the money that way, or if the policy was assigned to the lender. The life contract does not settle the loan on its own.",
    faq6q: "Do I have to buy the one that comes in the mail?",
    faq6a:
      "You are not required to. Compare the amount, the term, and the price with an independent quote. Letters after closing are not a bank program.",
    faq7q: "Can I use whole life for the mortgage?",
    faq7a:
      "Yes, and it costs more. It makes sense if you also want a benefit that does not expire. For the balance alone, term usually buys more dollars for the same monthly payment.",
    faq8q: "What if I finish paying the house early?",
    faq8a:
      "On level term the policy still runs to the end of the term, and the family would receive the full amount. You can cancel; there is usually no savings inside the policy to return. On decreasing term, the payout would already have fallen with the years.",
    faq9q: "Is there a two-year wait?",
    faq9a:
      "On a qualifying level term policy, no. The full amount applies once the policy is active, subject to the contract. The two-year wait is typical of guaranteed acceptance (a plan with no health questions), which is a different product and is not used for a large loan balance.",

    nextH: "Next step",
    nextP: `To see a price for your age and balance, use the <a href="term-quote.html">term quote</a> or call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a>.`,
    discTitle: "Disclosure",
    discBody:
      "This page is educational, not an offer. Ages, amounts, and prices change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency. The National Producer Number (NPN, the number that identifies the agency in state license records) is 21695431. Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "Quote the mortgage",
    quote1: "Term life we can quote",
    quote2: "Amount and years to match the loan",
    quoteCta: "See prices",
    srcTitle: "Sources",
    src1: '<a href="https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/" rel="noopener" target="_blank">CFPB: What is private mortgage insurance?</a> — private mortgage insurance (PMI) protects the lender, not the homeowner, and is usually required with less than 20% down.',
    src2: '<a href="https://www.consumerfinance.gov/ask-cfpb/what-is-mortgage-insurance-and-how-does-it-work-en-1953/" rel="noopener" target="_blank">CFPB: What is mortgage insurance and how does it work?</a> — PMI; Federal Housing Administration (FHA) mortgage insurance premium (MIP); and U.S. Department of Agriculture (USDA) loan insurance. None of them pays a death benefit to the family.',
    src3: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: Life insurance</a> — National Association of Insurance Commissioners. Term covers one or more years and generally builds no savings inside the policy; the buyer’s guide asks you to add debts and income, not an ad number.',
    src4: "Product guides from companies we work with: Transamerica Trendsetter Super, Corebridge Select-a-Term, Mutual of Omaha Term Life Answers, American Amicable Easy Term, Americo Payment Protector (Instant Decision Term series).",
    src5: "Sample prices: Integrity Connect, companies we work with, non-tobacco, best health class, Nebraska, August 2026. Each cell is the lowest among those companies.",
  };
}

function mortgageMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "tipos-seguro-vida.html" : "life-insurance-products.html";
  const fe = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const term = isEs ? "seguro-vida-temporal.html" : "term-life-insurance.html";
  const termQuote = "term-quote.html";
  const americo = "carriers/americo.html";
  const female = isEs ? "Mujer" : "Female";
  const male = isEs ? "Hombre" : "Male";
  const ageCol = isEs ? "Edad" : "Age";
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .filter((n) => c["faq" + n + "q"])
    .map(
      (n, i) =>
        `<details${i === 0 ? " open" : ""}><summary>${c["faq" + n + "q"]}</summary><p>${c["faq" + n + "a"]}</p></details>`
    )
    .join("\n");
  const pmiRow = (head, a, b, d) =>
    `<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${head}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.pmiCol1}">${a}</div>
<div class="lic-vs-chart__mid" role="cell" data-label="${c.pmiCol2}">${b}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.pmiCol3}">${d}</div>
</div>`;
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
<a href="#what">${isEs ? "Qué es" : "What it is"}</a>
<a href="#how">${isEs ? "Cómo paga" : "How it pays"}</a>
<a href="#pmi">${isEs ? "No es el PMI" : "Not bank PMI"}</a>
<a href="#kinds">${isEs ? "Tipos" : "Types"}</a>
<a href="#cost">${isEs ? "Costo" : "Cost"}</a>
<a href="#faq">${isEs ? "Preguntas" : "Questions"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Lo que debe recordar" : "What to remember"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<div class="lic-helpful"><p>${c.callout}</p></div>
<section class="lic-section" id="what">
<h2>${c.whatH}</h2>
<p>${c.whatP1}</p>
<p>${c.whatP2}</p>
<div class="lic-fact-trio">
<div>
<h3>${c.fact1H}</h3>
<p>${c.fact1P}</p>
</div>
<div>
<h3>${c.fact2H}</h3>
<p>${c.fact2P}</p>
</div>
<div>
<h3>${c.fact3H}</h3>
<p>${c.fact3P}</p>
</div>
</div>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<ol class="lic-lesson-steps">
<li><strong>${c.how1T}</strong> ${c.how1}</li>
<li><strong>${c.how2T}</strong> ${c.how2}</li>
<li><strong>${c.how3T}</strong> ${c.how3}</li>
<li><strong>${c.how4T}</strong> ${c.how4}</li>
</ol>
</section>
<section class="lic-section" id="pmi">
<h2>${c.pmiH}</h2>
<p>${c.pmiP}</p>
<div class="lic-vs-chart lic-vs-chart--three" role="table" aria-label="${c.pmiH}">
<div class="lic-vs-chart__row lic-vs-chart__head" role="row">
<div class="lic-vs-chart__q lic-vs-chart__q--blank" role="columnheader"></div>
<div class="lic-vs-chart__ins" role="columnheader"><strong>${c.pmiCol1}</strong><span>${c.pmiCol1Sub}</span></div>
<div class="lic-vs-chart__mid" role="columnheader"><strong>${c.pmiCol2}</strong><span>${c.pmiCol2Sub}</span></div>
<div class="lic-vs-chart__pre" role="columnheader"><strong>${c.pmiCol3}</strong><span>${c.pmiCol3Sub}</span></div>
</div>
${pmiRow(c.pmiR1H, c.pmiR1a, c.pmiR1b, c.pmiR1c)}
${pmiRow(c.pmiR2H, c.pmiR2a, c.pmiR2b, c.pmiR2c)}
${pmiRow(c.pmiR3H, c.pmiR3a, c.pmiR3b, c.pmiR3c)}
${pmiRow(c.pmiR4H, c.pmiR4a, c.pmiR4b, c.pmiR4c)}
</div>
<p class="lic-rate-note">${c.pmiNote}</p>
</section>
<section class="lic-section" id="kinds">
<h2>${c.kindsH}</h2>
<p>${c.kindsLead}</p>
<p>${c.kindsLead2}</p>
<div class="lic-choice-pair lic-fact-trio--color">
<div>
<p class="lic-fact-kicker">${c.kind1Kicker}</p>
<h3>${c.kind1H}</h3>
<p>${c.kind1}</p>
</div>
<div>
<p class="lic-fact-kicker">${c.kind2Kicker}</p>
<h3>${c.kind2H}</h3>
<p>${c.kind2} <a href="${americo}">Americo</a>.</p>
</div>
</div>
<aside class="lic-callout" aria-label="${c.kind3H}">
<strong>${c.kind3H}</strong>
<p>${c.kind3}</p>
</aside>
</section>
<section class="lic-section" id="mail">
<h2>${c.mailH}</h2>
<p>${c.mailP1}</p>
<p>${c.mailP2}</p>
</section>
<section class="lic-section" id="size">
<h2>${c.sizeH}</h2>
<p>${c.sizeLead}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.size1T}</strong> ${c.size1}</li>
<li><strong>${c.size2T}</strong> ${c.size2}</li>
<li><strong>${c.size3T}</strong> ${c.size3}</li>
</ol>
<div class="lic-helpful"><p>${c.sizeEx}</p></div>
</section>
<section class="lic-section" id="age">
<h2>${c.ageH}</h2>
<p>${c.ageP}</p>
<div class="lic-age-chart" role="table">
<div class="lic-age-chart__head" role="row">
<div class="lic-age-chart__term" role="columnheader">${c.ageColT}</div>
<div class="lic-age-chart__age" role="columnheader">${c.ageColA}</div>
</div>
<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${c.age1}</div>
<div class="lic-age-chart__age" role="cell">${c.age1A}<span>${c.ageUntil}</span></div>
</div>
<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${c.age2}</div>
<div class="lic-age-chart__age" role="cell">${c.age2A}<span>${c.ageUntil}</span></div>
</div>
<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${c.age3}</div>
<div class="lic-age-chart__age" role="cell">${c.age3A}<span>${c.ageUntil}</span></div>
</div>
</div>
<p class="lic-rate-note">${c.ageNote}</p>
</section>
<section class="lic-section" id="cost" data-lic-product="term" data-lic-term="20" data-lic-quote-href="${termQuote}">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<p class="lic-rate-note">${isEs ? "Muestre un plazo:" : "Show a term:"}
<button type="button" class="lic-face-tab is-active" data-lic-set-term="20" aria-pressed="true">20</button>
<button type="button" class="lic-face-tab" data-lic-set-term="10" aria-pressed="false">10</button>
<button type="button" class="lic-face-tab" data-lic-set-term="30" aria-pressed="false">30</button>
</p>
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="100000" role="tab" aria-selected="true">$100,000</button>
<button type="button" class="lic-face-tab" data-lic-face="250000" role="tab" aria-selected="false">$250,000</button>
<button type="button" class="lic-face-tab" data-lic-face="500000" role="tab" aria-selected="false">$500,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
</section>
<section class="lic-section" id="fit">
<h2>${c.fitH}</h2>
<div class="lic-split-lists lic-split-lists--cards">
<div class="lic-split-lists__yes">
<h3>${c.fitYesH}</h3>
<ul>
<li>${c.fitYes1}</li>
<li>${c.fitYes2}</li>
<li>${c.fitYes3}</li>
</ul>
</div>
<div class="lic-split-lists__no">
<h3>${c.fitNoH}</h3>
<ul>
<li>${c.fitNo1}</li>
<li>${c.fitNo2}</li>
<li>${c.fitNo3}</li>
</ul>
</div>
</div>
</section>
<section class="lic-section" id="buy">
<h2>${c.buyH}</h2>
<ol class="lic-lesson-steps">
<li><strong>${c.buy1T}</strong> ${c.buy1}</li>
<li><strong>${c.buy2T}</strong> ${c.buy2}</li>
<li><strong>${c.buy3T}</strong> ${c.buy3}</li>
</ol>
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyLead}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.apply1T}</strong> ${c.apply1}</li>
<li><strong>${c.apply2T}</strong> ${c.apply2}</li>
<li><strong>${c.apply3T}</strong> ${c.apply3}</li>
</ol>
<div class="lic-choice-pair">
<a class="lic-choice" href="${termQuote}">
<h3>${c.applyQuoteH}</h3>
<p>${c.applyQuoteP}</p>
<span class="lic-choice__btn lic-choice__btn--gold">${c.applyQuoteCta}</span>
</a>
<a class="lic-choice" href="schedule-julie.html">
<h3>${c.applyCallH}</h3>
<p>${c.applyCallP}</p>
<span class="lic-choice__btn lic-choice__btn--navy">${c.applyCallCta}</span>
</a>
</div>
<p class="lic-choice-phone">${c.applyPhone} <a href="tel:${TEL}">${PHONE}</a></p>
</section>
<section class="lic-section" id="next">
<h2>${c.nextH}</h2>
<p>${c.nextP}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqs}
</section>
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<section class="lic-section" id="sources">
<h2>${c.srcTitle}</h2>
<ul>
<li>${c.src1}</li>
<li>${c.src2}</li>
<li>${c.src3}</li>
<li>${c.src4}</li>
<li>${c.src5}</li>
</ul>
</section>
<p class="lic-rate-note"><a href="${term}">${isEs ? "Vida temporal" : "Term life"}</a> · <a href="${fe}">${isEs ? "Gastos finales" : "Final expense"}</a> · <a href="${termQuote}">${isEs ? "Cotización de temporal" : "Term quote"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2, quoteHref: termQuote, cta: c.quoteCta })}
</div>
</main>`;
}

module.exports = { copyMortgage, mortgageMain };
