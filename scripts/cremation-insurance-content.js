"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

function copyCrem(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Seguro para cremación: cómo funciona y cuánto cuesta (2026) | Mejor Vida Seguros",
      desc: "El seguro para cremación es una póliza de vida pequeña. Cómo llega el efectivo a la familia, cuánto suele costar una cremación, primas de compañías designadas y diferencia con un plan prepagado.",
      h1: "El seguro para cremación es una póliza de vida pequeña",
      lead: "No está comprando un paquete en la funeraria. Compra un seguro de vida. Cuando usted fallece, la persona que nombró recibe efectivo. Puede usarlo en la cremación — o en cualquier otra cosa.",
      crumbEnd: "Seguro para cremación",
      take1: "Es el <strong>mismo tipo de póliza</strong> que gastos finales o entierro. Las compañías no venden una póliza que solo pague si hay cremación.",
      take2: "La familia recibe <strong>efectivo</strong>, no una cremación reservada. Ellos eligen la funeraria. Si sobra dinero, se queda con ellos.",
      take3: "La mayoría compra <strong>$5,000 a $15,000</strong> de cobertura. Una cremación directa suele rondar $2,200. Con servicio, suele rondar $6,300.",
      callout: "Piense en la póliza como dinero para la familia. Un plan prepagado es dinero ya pagado a una funeraria.",
      whatH: "Qué está comprando, en palabras simples",
      whatP1: "Las familias buscan “seguro para cremación” cuando quieren dejar dinero para una cremación sin pedir a los hijos que paguen. En las compañías que cotiza Mejor Vida Seguros, ese producto es vida entera de gastos finales: una póliza permanente más pequeña, con prima fija si se mantiene al día.",
      fact1H: "Qué compra",
      fact1P: "Una vida entera de monto más bajo. No vence a los 10 o 20 años como un temporal.",
      fact2H: "Quién cobra",
      fact2P: "El beneficiario que usted nombra. El crematorio no cobra a menos que esa persona decida pagarle.",
      fact3H: "En qué se puede gastar",
      fact3P: "Cremación, un servicio, cuentas médicas, viaje u otras necesidades. El contrato no elige la urna ni la funeraria.",
      howH: "Cómo funciona, en cuatro pasos",
      how1T: "Usted solicita",
      how1: "En los planes simplificados que cotizamos no hay cita de laboratorio. Responde preguntas de salud. La aseguradora revisa esas respuestas y sus bases de datos.",
      how2T: "Paga una prima mensual",
      how2: "El precio depende de la edad, el sexo, el tabaco y la salud — no de la palabra “cremación”.",
      how3T: "La persona nombrada presenta el reclamo",
      how3: "Cuando usted fallece, contacta a la aseguradora (o a Mejor Vida Seguros) con el certificado de defunción y el número de póliza.",
      how4T: "Recibe efectivo",
      how4: "Paga la cremación si quiere. Si sobra, se lo queda. Si la cuenta es mayor, cubre la diferencia.",
      waitH: "¿La familia tiene que esperar dos años?",
      waitP: "La espera depende de cómo califique en la solicitud, no de que la meta sea una cremación. Un plan <strong>nivelado</strong> es el que se ofrece cuando las respuestas de salud califican: el monto completo puede pagar desde el día uno. La <strong>aceptación garantizada</strong> no hace preguntas de salud, pero suele esperar dos años por muerte natural.",
      waitYesH: "Si califica después de las preguntas de salud",
      waitYes: "Un fallecimiento cubierto puede pagar el monto completo desde el día uno (siguen aplicando exclusiones del contrato, como el suicidio en el período inicial). Vea <a href=\"seguro-vida-entierro-sin-espera.html\">cobertura sin período de espera</a>.",
      waitNoH: "Si no califica y solo hay aceptación garantizada",
      waitNo: "Suele haber espera de dos años por muerte natural. En esa ventana la familia normalmente recibe las primas pagadas más un interés del contrato. Vea <a href=\"aceptacion-garantizada.html\">aceptación garantizada</a>.",
      funeralH: "Cuánto suele costar una cremación",
      funeralP: "Estas cifras son promedios educativos, no una cotización de una funeraria concreta. Pida la lista de precios generales (GPL) de ese proveedor. La <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Regla de funerales de la FTC</a> permite comparar y comprar solo lo que necesita.",
      funeralAfter: "La NFDA (estudio 2023) publicó una mediana nacional de $6,280 para un funeral con velatorio y cremación, y $8,300 con velatorio y entierro (parcela, lápida y cargos por adelantado, como flores, van aparte). En los promedios estatales de Funeralocity que mantiene Mejor Vida Seguros (julio 2026), la cremación directa suele caer cerca de $1,300 a $3,200, y la cremación con servicio cerca de $5,200 a $7,500.",
      costRowH: "Tipo de arreglo",
      costColAmt: "Mediana típica",
      cost1: "Cremación directa",
      cost1Amt: "unos $2,200",
      cost2: "Cremación con servicio",
      cost2Amt: "unos $6,300",
      cost3: "Entierro inmediato (sin velatorio)",
      cost3Amt: "unos $5,100",
      cost4: "Entierro con servicio",
      cost4Amt: "unos $8,500",
      funeralCalc: "Para una estimación por estado, use el <a href=\"final-expense-estimator.html\">calculador de costos funerarios</a>.",
      costH: "Cuánto paga al mes por la póliza",
      costP: "En compañías designadas, un plan nivelado de <strong>$10,000</strong> a los 50 años suele estar cerca de <strong>$28 al mes para una mujer</strong> y <strong>$34 al mes para un hombre</strong> (no fumador, buena salud). $5,000 a la misma edad suele estar cerca de $14 y $17. La tabla muestra más edades. Son primas ilustrativas del cotizador de Mejor Vida Seguros (agosto 2026), no una oferta.",
      vsH: "¿Póliza de vida o plan prepagado en la funeraria?",
      vsP: "Ambos pueden ayudar a no dejar la cuenta a la familia. No son el mismo contrato.",
      vsColQ: "",
      vsColIns: "Seguro de vida",
      vsColInsSub: "Efectivo para la familia",
      vsColPre: "Plan prepagado",
      vsColPreSub: "Servicios en una funeraria",
      vsR1H: "Qué compra",
      vsR1I: "Una póliza que paga efectivo a quien usted nombre",
      vsR1P: "Un contrato de servicios con una funeraria",
      vsR2H: "Quién decide el funeral",
      vsR2I: "Su familia, en el momento",
      vsR2P: "El paquete que ya eligió",
      vsR3H: "Si se muda",
      vsR3I: "La póliza sigue pagando",
      vsR3P: "El contrato puede ser difícil de mover",
      vsR4H: "Cómo se paga",
      vsR4I: "Una prima mensual mientras la póliza esté en vigor",
      vsR4P: "Suele ser un total alto o cuotas fuertes en un plazo corto",
      vsNote: "Si el presupuesto no alcanza para prepagar, una vida entera pequeña suele ser el camino que cotizamos. Si ya pagó un plan en una funeraria y cubre lo que quiere, puede no hacer falta una póliza nueva del mismo tamaño.",
      fitH: "¿Le sirve este camino?",
      fitYesH: "Puede ayudar si",
      fitYes1: "Quiere una cremación (o un servicio sencillo) y no tiene ese efectivo apartado.",
      fitYes2: "Quiere que la familia reciba dinero para gastar donde haga falta, no un paquete atado a una funeraria.",
      fitNoH: "Puede no hacer falta una póliza nueva si",
      fitNo1: "Ya prepagó, o ya tiene una vida entera de un monto similar.",
      fitNo2: "Un temporal que vence a los 70 u 80 suele ser un mal sustituto: el plazo se acaba y la cremación no.",
      coH: "Compañías designadas",
      coP: "Estas fichas son productos de gastos finales que Mejor Vida Seguros cotiza. No publicamos puntuaciones de marketing ni compañías con las que no trabajamos. “Sin espera de 2 años” aplica al plan nivelado o inmediato, no a la aceptación garantizada.",
      coMooProduct: "Living Promise Nivelado",
      coMooAges: "45–85",
      coMooAmt: "$2,000–$50,000",
      coAetnaProduct: "Accendo Preferred (Nivelado)",
      coAetnaAges: "40–89",
      coAetnaAmt: "$2,000–$50,000; $25,000 tope a los 76–89",
      coTaProduct: "Immediate Solution Preferred",
      coTaAges: "Hasta los 85",
      coTaAmt: "Desde $1,000; hasta $50,000+",
      coAmericoProduct: "Eagle Select Nivelado",
      coAmericoAges: "40–85",
      coAmericoAmt: "$5,000–$50,000",
      coWait: "Espera de 2 años (plan nivelado)",
      coWaitNo: "No",
      coAges: "Edades de nuevos solicitantes",
      coAmt: "Opciones de beneficio",
      coFoot: "Fichas educativas. Un plan gradual o de aceptación garantizada puede agregar espera de dos años. No es una cotización vinculante.",
      applyH: "El siguiente paso",
      applyP: "Mejor Vida Seguros compara compañías designadas y le explica las opciones. Elija una cotización en línea o una llamada.",
      applyQuoteH: "Ver precios",
      applyQuoteP: "Una cotización gratuita según su edad y el monto que tiene en mente.",
      applyQuoteCta: "Cotización gratuita",
      applyCallH: "Hablar con nosotros",
      applyCallP: "Agende una llamada con Mejor Vida Seguros. Sin presión.",
      applyCallCta: "Agendar una llamada",
      applyPhone: "O llame al",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿El seguro para cremación es distinto del de gastos finales?",
      faq1a: "No. Es la misma clase de vida entera pequeña. “Cremación” describe el uso del dinero, no un contrato aparte.",
      faq2q: "¿Una póliza de vida que ya tengo cubre la cremación?",
      faq2a: "Sí: el pago es efectivo. El beneficiario puede usarlo en la cremación. Los gastos finales se dimensionan para un funeral o cremación, no para reemplazar un sueldo.",
      faq3q: "¿Hace falta un examen médico?",
      faq3a: "En los planes simplificados que cotizamos, no. Hay preguntas de salud. Vea <a href=\"seguro-vida-mayores-sin-examen.html\">sin examen médico</a>.",
      faq4q: "¿Dónde se compra?",
      faq4a: "Con un agente licenciado que compare compañías, o a veces directo al consumidor por televisión o correo. Mejor Vida Seguros cotiza compañías designadas y le dice si hay espera o beneficio desde el día uno. Los estados con licencia están en <a href=\"licencias.html\">licencias</a>.",
      faq5q: "¿Vale la pena si ya tengo ahorros?",
      faq5a: "Si el efectivo cubre la cremación que quiere, puede no hacer falta una póliza nueva. Sirve cuando no hay ese fondo, o cuando quiere que el pago no pase por sucesión si el beneficiario está bien nombrado.",
      faq6q: "¿Cómo se presenta un reclamo?",
      faq6a: "El beneficiario contacta a la aseguradora o a Mejor Vida Seguros con el certificado de defunción y el número de póliza. El pago va al beneficiario nombrado, no automáticamente al crematorio. Guarde la póliza donde la familia la encuentre.",
      faq7q: "¿Hasta qué edad se puede comprar?",
      faq7a: "Depende del producto. Muchas compañías designadas emiten hasta los 85; Accendo Level puede llegar a 89. Vea <a href=\"limite-edad-seguro-vida.html\">límite de edad</a>.",
      faq8q: "¿Cuánta cobertura conviene?",
      faq8a: "Para una cremación directa, $5,000 suele alcanzar en muchos mercados. Con servicio, $10,000 es un punto de partida frecuente. Sume deudas o viaje si quiere margen.",
      faq9q: "¿Los beneficiarios pagan impuestos?",
      faq9a: "En la mayoría de los casos el beneficio no es ingreso gravable. No es asesoría fiscal. Un contador revisa patrimonios grandes.",
      faq10q: "¿Es mejor que un prepagado?",
      faq10a: "Depende. El prepagado fija servicios en una funeraria. La póliza deja efectivo libre y una prima mensual más baja, con suscripción. Compare ambos si ya tiene un presupuesto cerrado con un proveedor.",
      faq11q: "¿El temporal sirve para la cremación?",
      faq11a: "Suele ser un mal encaje. El plazo termina; la cremación no. Si el término acaba a los 70 o 75, puede quedarse sin cobertura.",
      faq12q: "¿Puedo comprar para un padre o una madre?",
      faq12a: "Puede ser dueño o pagador. La persona cuya vida se asegura casi siempre debe firmar, responder salud y consentir. No oculte historial médico.",
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no una oferta. Edades, montos y primas cambian según compañía, producto, tabaco y estado. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actuales están en la página de <a href=\"licencias.html\">licencias</a>.",
      srcTitle: "Fuentes",
      src1: "<a href=\"https://www.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA — estadísticas y estudio de listas de precios 2023</a> (medianas nacionales de funeral con velatorio y cremación / entierro).",
      src2: "Promedios estatales de Funeralocity mantenidos por Mejor Vida Seguros (captura julio 2026) en el calculador de costos funerarios.",
      src3: "<a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC Funeral Rule</a> (lista de precios generales y derecho a comparar servicios).",
      quoteTitle: "Cotización",
      quote1: "Compañías designadas",
      quote2: "Nivelado primero, si califica",
      quoteCta: "Ver precios",
    };
  }
  return {
    title: "Cremation Insurance: How It Works and What It Costs (2026) | Mejor Vida Insurance",
    desc: "Cremation insurance is a small life insurance policy. How cash reaches the family, typical cremation costs, appointed-company premiums, and how that differs from a prepaid funeral plan.",
    h1: "Cremation insurance is a small life insurance policy",
    lead: "You are not buying a funeral package. You buy a life insurance policy. When you die, the person you name receives cash. They can use that cash for cremation — or for anything else.",
    crumbEnd: "Cremation insurance",
    take1: "It is the <strong>same kind of policy</strong> as final expense or burial insurance. Companies do not sell a policy that pays only if there is a cremation.",
    take2: "The family gets <strong>cash</strong>, not a reserved cremation. They choose the funeral home. Leftover money stays with them.",
    take3: "Most people buy <strong>$5,000 to $15,000</strong> of coverage. Direct cremation is often around $2,200. A cremation with a service is often around $6,300.",
    callout: "Think of the policy as money for the family. A prepaid plan is money already paid to one funeral home.",
    whatH: "What you are actually buying",
    whatP1: "Families search for “cremation insurance” when they want to leave money for a cremation without asking their children to pay. At the companies Mejor Vida Insurance quotes, that product is final-expense whole life: a smaller permanent policy with a level premium if you keep it in force.",
    fact1H: "What you buy",
    fact1P: "A smaller whole life policy. It does not expire after 10 or 20 years the way term can.",
    fact2H: "Who is paid",
    fact2P: "The beneficiary you name. The crematory is not paid unless that person chooses to pay them.",
    fact3H: "What they can spend it on",
    fact3P: "Cremation, a service, medical bills, travel, or other needs. The contract does not pick the urn or the funeral home.",
    howH: "How it works, in four steps",
    how1T: "You apply",
    how1: "There is no lab visit on the simplified plans we quote. You answer health questions. The insurer reviews those answers and its databases.",
    how2T: "You pay a monthly premium",
    how2: "The price depends on your age, sex, tobacco use, and health — not on the word “cremation.”",
    how3T: "The named person files a claim",
    how3: "When you die, they contact the insurer (or Mejor Vida Insurance) with the death certificate and policy number.",
    how4T: "They receive cash",
    how4: "They pay for the cremation if they want. If money is left over, they keep it. If the bill is larger, they cover the gap.",
      waitH: "Does the family have to wait two years?",
      waitP: "The wait depends on how you qualify on the application, not on cremation as the goal. A <strong>level</strong> plan is the one you get when your health answers qualify: the full amount can pay from day one. <strong>Guaranteed acceptance</strong> skips health questions, but usually waits two years for natural death.",
      waitYesH: "If you qualify after health questions",
    waitYes: "A covered death can pay the full amount from day one (contract exclusions still apply, such as suicide in the contestable period). See <a href=\"no-waiting-period-life-burial.html\">no-waiting-period coverage</a>.",
      waitNoH: "If you do not qualify and only guaranteed acceptance is offered",
    waitNo: "There is usually a two-year wait for natural death. In that window the family typically receives premiums paid plus contractual interest. See <a href=\"guaranteed-acceptance.html\">guaranteed acceptance</a>.",
    funeralH: "What a cremation typically costs",
    funeralP: "These are educational averages, not a quote from a specific funeral home. Ask that provider for its General Price List. The <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC Funeral Rule</a> lets families compare and buy only what they need.",
    funeralAfter: "NFDA’s 2023 study reported a U.S. median of $6,280 for a funeral with viewing and cremation, and $8,300 for viewing and burial (plot, monument, and cash-advance items such as flowers are extra). Funeralocity state averages that Mejor Vida Insurance keeps (July 2026) put direct cremation near $1,300–$3,200 and full-service cremation near $5,200–$7,500.",
    costRowH: "Type of arrangement",
    costColAmt: "Typical median",
    cost1: "Direct cremation",
    cost1Amt: "about $2,200",
    cost2: "Cremation with a service",
    cost2Amt: "about $6,300",
    cost3: "Immediate burial (no viewing)",
    cost3Amt: "about $5,100",
    cost4: "Burial with a service",
    cost4Amt: "about $8,500",
    funeralCalc: "For a state-level estimate, use the <a href=\"final-expense-estimator.html\">funeral cost calculator</a>.",
    costH: "What you pay each month for the policy",
    costP: "On appointed companies, a level <strong>$10,000</strong> plan at age 50 is often about <strong>$28 a month for a woman</strong> and <strong>$34 a month for a man</strong> (non-tobacco, good health). $5,000 at the same age is often about $14 and $17. The table shows more ages. These are illustrative premiums from the Mejor Vida Insurance quoter (August 2026), not an offer.",
    vsH: "Life insurance or a prepaid plan at the funeral home?",
    vsP: "Both can keep the bill off the family. They are not the same contract.",
    vsColQ: "",
    vsColIns: "Life insurance",
    vsColInsSub: "Cash for the family",
    vsColPre: "Prepaid plan",
    vsColPreSub: "Services at one funeral home",
    vsR1H: "What you buy",
    vsR1I: "A policy that pays cash to the person you name",
    vsR1P: "A services contract with one funeral home",
    vsR2H: "Who decides the funeral",
    vsR2I: "Your family, at the time",
    vsR2P: "The package you already chose",
    vsR3H: "If you move",
    vsR3I: "The policy still pays",
    vsR3P: "The contract can be hard to transfer",
    vsR4H: "How you pay",
    vsR4I: "A monthly premium while the policy stays in force",
    vsR4P: "Usually a large total or high installments over a short period",
    vsNote: "If the budget cannot cover a prepaid funeral, a small whole life policy is the path we quote. If you already paid a funeral-home plan and it covers what you want, you may not need a new policy of the same size.",
    fitH: "Is this a fit?",
    fitYesH: "It may help if",
    fitYes1: "You want a cremation (or a simple service) and do not have that cash set aside.",
    fitYes2: "You want the family to receive money they can spend anywhere, not a package locked to one funeral home.",
    fitNoH: "You may not need a new policy if",
    fitNo1: "You already prepaid, or you already have a permanent policy of about the same size.",
    fitNo2: "Term that ends at 70 or 80 is usually a poor substitute: the term ends and the cremation does not.",
    coH: "Appointed companies",
    coP: "These cards are final-expense products Mejor Vida Insurance quotes. We do not publish marketing scores or companies we do not appoint. “No 2-year wait” applies to the level or immediate plan, not guaranteed acceptance.",
    coMooProduct: "Living Promise Level",
    coMooAges: "45–85",
    coMooAmt: "$2,000–$50,000",
    coAetnaProduct: "Accendo Preferred (Level)",
    coAetnaAges: "40–89",
    coAetnaAmt: "$2,000–$50,000; $25,000 cap at ages 76–89",
    coTaProduct: "Immediate Solution Preferred",
    coTaAges: "Through 85",
    coTaAmt: "From $1,000; up to $50,000+",
    coAmericoProduct: "Eagle Select Level",
    coAmericoAges: "40–85",
    coAmericoAmt: "$5,000–$50,000",
    coWait: "2-year wait (level plan)",
    coWaitNo: "No",
    coAges: "New applicant ages",
    coAmt: "Death benefit options",
    coFoot: "Educational cards. A graded or guaranteed-acceptance plan may add a two-year wait. Not a binding quote.",
    applyH: "The next step",
    applyP: "Mejor Vida Insurance compares appointed companies and explains your options. Choose an online quote or a call.",
    applyQuoteH: "See prices",
    applyQuoteP: "A free quote based on your age and the amount you have in mind.",
    applyQuoteCta: "Get a free quote",
    applyCallH: "Talk with us",
    applyCallP: "Schedule a call with Mejor Vida Insurance. No pressure.",
    applyCallCta: "Schedule a call",
    applyPhone: "Or call",
    faqTitle: "Frequently asked questions",
    faq1q: "Is cremation insurance different from final expense?",
    faq1a: "No. It is the same class of smaller whole life. “Cremation” describes how the money is used, not a separate contract.",
    faq2q: "Does a life policy I already have cover cremation?",
    faq2a: "Yes: the payout is cash. The beneficiary can use it for cremation. Final expense is sized for a funeral or cremation, not to replace a paycheck.",
    faq3q: "Do I need a medical exam?",
    faq3a: "On the simplified plans we quote, no. There are health questions. See <a href=\"life-insurance-seniors-no-medical-exam.html\">no medical exam</a>.",
    faq4q: "Where do you buy it?",
    faq4a: "Through a licensed agent who compares companies, or sometimes direct to consumer by TV or mail. Mejor Vida Insurance quotes appointed companies and tells you whether there is a wait or day-one benefit. Licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    faq5q: "Is it worth it if I already have savings?",
    faq5a: "If the cash covers the cremation you want, you may not need a new policy. It helps when that fund is not there, or when you want the payout to skip probate if the beneficiary is named correctly.",
    faq6q: "How do you file a claim?",
    faq6a: "The beneficiary contacts the insurer or Mejor Vida Insurance with the death certificate and policy number. Payment goes to the named beneficiary, not automatically to the crematory. Keep the policy where the family can find it.",
    faq7q: "Until what age can I buy it?",
    faq7a: "It depends on the product. Many appointed companies issue through 85; Accendo Level can go through 89. See the <a href=\"life-insurance-age-limit.html\">age limit</a> guide.",
    faq8q: "How much coverage should I buy?",
    faq8a: "For a direct cremation, $5,000 is often enough in many markets. With a service, $10,000 is a common starting point. Add debts or travel if you want a cushion.",
    faq9q: "Will beneficiaries owe tax?",
    faq9a: "In most cases the death benefit is not taxable income. This is not tax advice. A CPA should review large estates.",
    faq10q: "Is it better than a prepaid plan?",
    faq10a: "It depends. Prepaid locks services at a funeral home. The policy leaves unrestricted cash and a lower monthly premium, with underwriting. Compare both if you already have a closed budget with one provider.",
    faq11q: "Is term a good way to cover cremation?",
    faq11a: "It is usually a poor fit. Term ends; cremation does not. If the term runs out at 70 or 75, you can be left without coverage.",
    faq12q: "Can I buy this for a parent?",
    faq12a: "You can be the owner or the payer. The person whose life is insured almost always has to sign, answer health questions, and consent. Do not hide medical history.",
    discTitle: "Disclosure",
    discBody: "This page is educational, not an offer. Ages, amounts, and premiums change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    srcTitle: "Sources",
    src1: "<a href=\"https://www.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA — statistics and 2023 General Price List study</a> (national medians for funeral with viewing and cremation / burial).",
    src2: "Funeralocity state averages maintained by Mejor Vida Insurance (captured July 2026) in the funeral cost calculator.",
    src3: "<a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC Funeral Rule</a> (General Price List and the right to compare services).",
    quoteTitle: "Get a quote",
    quote1: "Appointed companies",
    quote2: "Level first, if you qualify",
    quoteCta: "See prices",
  };
}

function cremMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const exam = isEs ? "seguro-vida-mayores-sin-examen.html" : "life-insurance-seniors-no-medical-exam.html";
  const burial = isEs ? "guia-seguro-entierro-mayores.html" : "burial-insurance-seniors.html";
  const fe = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const age = isEs ? "limite-edad-seguro-vida.html" : "life-insurance-age-limit.html";
  const over80 = isEs ? "seguro-vida-mayores-80.html" : "life-insurance-seniors-over-80.html";
  const over85 = isEs ? "seguro-vida-mayores-85.html" : "life-insurance-seniors-over-85.html";
  const moo = "carriers/mutual-of-omaha.html";
  const aetna = "carriers/aetna.html";
  const ta = "carriers/transamerica.html";
  const americo = "carriers/americo.html";
  const female = isEs ? "Mujer" : "Female";
  const male = isEs ? "Hombre" : "Male";
  const ageCol = isEs ? "Edad" : "Age";
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    .filter((n) => c["faq" + n + "q"])
    .map(
      (n, i) =>
        `<details${i === 0 ? " open" : ""}><summary>${c["faq" + n + "q"]}</summary><p>${c["faq" + n + "a"]}</p></details>`
    )
    .join("\n");
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
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › <a href="${mid}">${isEs ? "Seguro de vida" : "Life insurance"}</a> › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#what">${isEs ? "Qué es" : "What it is"}</a>
<a href="#how">${isEs ? "Cómo funciona" : "How it works"}</a>
<a href="#waiting">${isEs ? "Espera" : "Waiting"}</a>
<a href="#funeral">${isEs ? "Costo de cremación" : "Cremation cost"}</a>
<a href="#cost">${isEs ? "Prima" : "Premium"}</a>
<a href="#prepaid">${isEs ? "Vs. prepagado" : "Vs. prepaid"}</a>
<a href="#faq">${isEs ? "Preguntas" : "FAQ"}</a>
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
<li><strong>${c.how1T}</strong>${c.how1}</li>
<li><strong>${c.how2T}</strong>${c.how2}</li>
<li><strong>${c.how3T}</strong>${c.how3}</li>
<li><strong>${c.how4T}</strong>${c.how4}</li>
</ol>
</section>
<section class="lic-section" id="waiting">
<h2>${c.waitH}</h2>
<p>${c.waitP}</p>
<div class="lic-split-lists">
<div>
<h3>${c.waitYesH}</h3>
<p>${c.waitYes}</p>
</div>
<div>
<h3>${c.waitNoH}</h3>
<p>${c.waitNo}</p>
</div>
</div>
</section>
<section class="lic-section" id="funeral">
<h2>${c.funeralH}</h2>
<p>${c.funeralP}</p>
<div class="lic-rate-wrap">
<table class="lic-rate-table lic-rate-table--lesson">
<thead><tr><th scope="col">${c.costRowH}</th><th scope="col">${c.costColAmt}</th></tr></thead>
<tbody>
<tr><td>${c.cost1}</td><td>${c.cost1Amt}</td></tr>
<tr><td>${c.cost2}</td><td>${c.cost2Amt}</td></tr>
<tr><td>${c.cost3}</td><td>${c.cost3Amt}</td></tr>
<tr><td>${c.cost4}</td><td>${c.cost4Amt}</td></tr>
</tbody>
</table>
</div>
<p>${c.funeralAfter}</p>
<p>${c.funeralCalc}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<div class="lic-product-tabs" data-lic-product="fe" data-lic-quote-href="quote.html">
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="5000" role="tab" aria-selected="true">$5,000</button>
<button type="button" class="lic-face-tab" data-lic-face="10000" role="tab" aria-selected="false">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="15000" role="tab" aria-selected="false">$15,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</div>
</section>
<section class="lic-section" id="prepaid">
<h2>${c.vsH}</h2>
<p>${c.vsP}</p>
<div class="lic-vs-chart" role="table" aria-label="${c.vsH}">
<div class="lic-vs-chart__row lic-vs-chart__head" role="row">
<div class="lic-vs-chart__q lic-vs-chart__q--blank" role="columnheader">${c.vsColQ}</div>
<div class="lic-vs-chart__ins" role="columnheader"><strong>${c.vsColIns}</strong><span>${c.vsColInsSub}</span></div>
<div class="lic-vs-chart__pre" role="columnheader"><strong>${c.vsColPre}</strong><span>${c.vsColPreSub}</span></div>
</div>
<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c.vsR1H}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.vsColIns}">${c.vsR1I}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.vsColPre}">${c.vsR1P}</div>
</div>
<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c.vsR2H}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.vsColIns}">${c.vsR2I}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.vsColPre}">${c.vsR2P}</div>
</div>
<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c.vsR3H}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.vsColIns}">${c.vsR3I}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.vsColPre}">${c.vsR3P}</div>
</div>
<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c.vsR4H}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.vsColIns}">${c.vsR4I}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.vsColPre}">${c.vsR4P}</div>
</div>
</div>
<p>${c.vsNote}</p>
</section>
<section class="lic-section" id="fit">
<h2>${c.fitH}</h2>
<div class="lic-split-lists">
<div>
<h3>${c.fitYesH}</h3>
<ul>
<li>${c.fitYes1}</li>
<li>${c.fitYes2}</li>
</ul>
</div>
<div>
<h3>${c.fitNoH}</h3>
<ul>
<li>${c.fitNo1}</li>
<li>${c.fitNo2}</li>
</ul>
</div>
</div>
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyP}</p>
<div class="lic-choice-pair">
<a class="lic-choice" href="quote.html">
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
<section class="lic-section lic-guide" id="companies">
<h2>${c.coH}</h2>
<div class="lic-co-grid lic-co-grid--compare lic-co-grid--click">
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${moo}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/mutual-of-omaha-logo.webp"/>
<img src="${assets}img/opt/mutual-of-omaha-logo.png" alt="" width="400" height="94" loading="lazy" decoding="async"/>
</picture></div>
<h3>Mutual of Omaha</h3>
<p class="lic-co-product">${c.coMooProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coMooAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coMooAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${aetna}">
<div class="lic-co-logo"><img src="${assets}img/carriers/aetna-logo.svg" alt="" width="512" height="98" loading="lazy" decoding="async"/></div>
<h3>Aetna</h3>
<p class="lic-co-product">${c.coAetnaProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAetnaAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAetnaAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${ta}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/transamerica-logo.webp"/>
<img src="${assets}img/opt/transamerica-logo.png" alt="" width="362" height="69" loading="lazy" decoding="async"/>
</picture></div>
<h3>Transamerica</h3>
<p class="lic-co-product">${c.coTaProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coTaAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coTaAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${americo}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/americo-logo.webp"/>
<img src="${assets}img/opt/americo-logo.png" alt="" width="398" height="128" loading="lazy" decoding="async"/>
</picture></div>
<h3>Americo</h3>
<p class="lic-co-product">${c.coAmericoProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAmericoAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAmericoAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coWaitNo}</dd></div>
</dl>
</a>
</div>
<p class="lic-co-footnote">${c.coFoot}</p>
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
</ul>
</section>
<p class="lic-rate-note"><a href="${fe}">${isEs ? "Gastos finales" : "Final expense"}</a> · <a href="${burial}">${isEs ? "Guía de entierro" : "Burial guide"}</a> · <a href="${exam}">${isEs ? "Sin examen médico" : "No medical exam"}</a> · <a href="${age}">${isEs ? "Límite de edad" : "Age limit"}</a> · <a href="${over80}">${isEs ? "Mayores de 80" : "Seniors over 80"}</a> · <a href="${over85}">${isEs ? "Mayores de 85" : "Seniors over 85"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2 })}
</div>
</main>`;
}

module.exports = { copyCrem, cremMain };
