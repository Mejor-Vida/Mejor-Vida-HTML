"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

function copyTerm(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Seguro de vida temporal: cómo funciona y cuánto cuesta (2026) | Mejor Vida Seguros",
      desc: "El seguro de vida temporal cubre un número fijo de años. Plazos, edades máximas, primas ilustrativas de compañías designadas, diferencia con vida entera y cómo cotizar.",
      h1: "El seguro de vida temporal cubre un número fijo de años",
      lead: "Usted paga una prima. Si fallece mientras la póliza está al día y dentro del plazo, la persona que nombró recibe el monto. Cuando el plazo termina, esa cobertura termina. No es un ahorro. Es protección por un período que usted elige.",
      crumbEnd: "Seguro de vida temporal",
      take1: "Las cotizaciones típicas cubren <strong>10, 15, 20, 25 o 30 años</strong>. Un plazo de 40 años o un temporal de un año no es lo habitual en estas compañías designadas.",
      take2: "Suele ser la forma <strong>más barata por dólar</strong> de beneficio de muerte. En nuestras muestras, $100,000 a 10 años a los 40 años ronda <strong>$8–$9 al mes</strong> (no fumador, mejor clase ilustrativa).",
      take3: "No hay temporal de <strong>aceptación garantizada</strong>. Hay preguntas de salud. Un plan simplificado (sin examen en el consultorio) existe; un plan con suscripción completa suele abrir mejor precio y montos más altos.",
      callout: "Piense en el plazo como el tiempo que su familia todavía dependería de su ingreso o de una deuda grande. Si la necesidad no vence, compare también vida entera o gastos finales.",
      whatH: "Qué está comprando, en palabras simples",
      whatP1: "Una póliza temporal no es un funeral prepagado ni una cuenta de ahorro. Es un contrato: la aseguradora paga un beneficio de muerte si usted fallece en el plazo y las primas están al día. La <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC</a> lo describe así: el temporal cubre uno o más años y, en general, no acumula valor en efectivo.",
      fact1H: "Qué compra",
      fact1P: "Un monto (por ejemplo $100,000 o $500,000) que dura el plazo. En suscripción completa, las cotizaciones suelen empezar en $100,000.",
      fact2H: "Quién cobra",
      fact2P: "El beneficiario que usted nombra. El banco o la funeraria no cobran a menos que esa persona decida pagarles.",
      fact3H: "Qué no compra",
      fact3P: "No acumula valor en efectivo. Si sobrevive el plazo, no le “devuelven” las primas salvo un rider de devolución que encarece la póliza y no está en estas tablas de muestra.",
      howH: "Cómo funciona, en cuatro pasos",
      how1T: "Elija los años y sume el dinero",
      how1: "El plazo debe durar tanto como la necesidad: años que quedan de hipoteca, años hasta que los hijos terminen estudios, o años en que un cónyuge todavía dependería de su ingreso. Un plazo de 30 años cuesta más al mes que uno de 10 del mismo monto, porque la compañía cubre más tiempo. Para el monto, sume lo que habría que pagar si usted falleciera este año: saldo de hipoteca, varios años de sueldo y estudios. Algunos asesores empiezan con 5 a 8 veces el ingreso anual, luego suman deudas y restan ahorros. La guía de la NAIC prefiere esa suma personal, no una fórmula única. Hay un <a href=\"#need\">ejemplo más abajo</a>.",
      how2T: "Responda con honestidad salud, tabaco, estatura y peso",
      how2: "La aseguradora usa esas respuestas —y a menudo recetas e historial de manejo— para fijar la clase de precio. Tabaco en los últimos 12 meses suele subir la prima. Estatura y peso importan porque cambian la clase de salud; no son un producto aparte. Una solicitud de $250,000 o $500,000 suele pedir más datos que un gasto final de $10,000. Omitir una condición puede retrasar o afectar un reclamo. Un plan simplificado (sin examen en el consultorio) igual hace preguntas de salud; no hay temporal de aceptación garantizada.",
      how3T: "Pague una prima fija durante los años que compró",
      how3: "En un temporal nivelado, el monto mensual no cambia durante el plazo original si paga a tiempo. No sube solo porque cumpla años. Si el débito falla y la póliza caduca, no hay beneficio. Está pagando protección de esos años, no depositando dinero que le van a devolver.",
      how4T: "La familia cobra solo si usted fallece en el plazo",
      how4: "Si fallece con la póliza al día, la persona que nombró recibe el monto, en general libre de impuesto sobre la renta. Si sobrevive el plazo, ese contrato termina y las primas no se reembolsan (salvo un rider de devolución). Algunos contratos designados permiten pasar a permanente en una ventana del contrato, al precio de su edad de entonces — no al precio viejo del temporal.",
      lengthH: "Hasta qué edad se puede pedir cada plazo",
      lengthP: "La edad máxima no es un número de internet. Es el tope más alto entre las compañías designadas de estas muestras (no fumador). El tabaco baja el tope. Una misma edad puede calificar a 10 años y no a 30.",
      lengthColT: "Plazo",
      lengthColA: "Edad máxima típica al emitir (no fumador)",
      lengthAge: "hasta",
      length1: "10 años",
      length1A: "80",
      length2: "15 años",
      length2A: "78",
      length3: "20 años",
      length3A: "70",
      length4: "25 años",
      length4A: "68",
      length5: "30 años",
      length5A: "60",
      lengthNote: "Tope combinado de Transamerica Trendsetter Super, Mutual of Omaha Term Life Answers / Express, American Amicable Easy Term y Assurity Term (no fumador). Fumador: el tope es más bajo (por ejemplo, 30 años suele cortar cerca de los 50–55). Las cotizaciones suelen empezar a los 18 años.",
      fitH: "¿Le sirve este camino?",
      fitYesH: "Puede encajar si",
      fitYes1: "Hay una deuda o un ingreso que tiene fecha: hipoteca, años de crianza, o cubrir el sueldo mientras los hijos dependen de usted.",
      fitYes2: "Quiere mucho beneficio de muerte por una prima mensual más baja que una vida entera del mismo monto.",
      fitNoH: "Suele no encajar si",
      fitNo1: "La meta es un funeral a los 80 o un beneficio que no venza. Entonces compare <a href=\"seguro-gastos-finales.html\">gastos finales</a> o <a href=\"costo-seguro-vida-entera.html\">vida entera</a>.",
      fitNo2: "No puede o no quiere responder preguntas de salud. El temporal no se emite “sin preguntas”. La aceptación garantizada es otro producto, permanente y con espera.",
      limitsH: "Lo que el temporal no hace",
      lim1H: "El plazo se acaba",
      lim1: "Si sobrevive el contrato, la aseguradora no le debe el monto. Pagó por protección durante esos años, no por un reembolso automático.",
      lim2H: "La salud importa más",
      lim2: "Como el precio por dólar es bajo, las compañías piden más datos de salud que en un gasto final pequeño. Un plan simplificado existe; no es lo mismo que aceptación garantizada.",
      lim3H: "No hay valor en efectivo",
      lim3: "No puede pedir un préstamo contra la póliza. Si cancela, en general no hay valor en efectivo que devolver.",
      lim4H: "Seguir después cuesta más",
      lim4: "Renovar año a año o comprar otra póliza a la edad nueva suele ser mucho más caro. Convertir a permanente, si el contrato lo permite, usa su edad de entonces — no el precio viejo del temporal.",
      costH: "Cuánto suele costar al mes",
      costP: "Cifras ilustrativas de suscripción completa, no fumador, mejor clase (agosto 2026). Cada celda es la prima más baja entre las compañías designadas que aparecieron. No es una oferta. Un plan simplificado (sin examen en el consultorio) suele costar más por dólar y se precifica aparte.",
      needH: "Cómo pensar el monto",
      needLead: "El monto del temporal es el beneficio de muerte si usted fallece durante el plazo. No es una meta de ahorro. Es el dinero que la persona que nombró recibiría para seguir cubriendo lo que hoy paga su ingreso.",
      need1T: "Quién depende de su ingreso",
      need1: "Empiece por las personas que vivirían con menos si usted falleciera, y por cuántos años todavía necesitarían ese ingreso.",
      need2T: "Sume deudas que quedarían",
      need2: "La hipoteca es la más habitual. Cuente también un auto, un préstamo u otra deuda que la familia seguiría debiendo.",
      need3T: "Sume un costo con fecha, si aplica",
      need3: "Estudios de los hijos, u otro gasto que tiene calendario. Si no aplica, no lo invente.",
      need4T: "Reste lo que ya hay",
      need4: "Ahorros, cuentas u otra póliza de vida que ya esté en vigor. Ese dinero ya haría parte del trabajo.",
      need5T: "Un atajo no es una obligación",
      need5: "Algunos asesores hablan de varias veces el sueldo anual. Es un atajo, no un número obligatorio. La <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">guía del consumidor de la NAIC</a> parte de esas mismas preguntas, no de una fórmula única.",
      needClose: "El resultado es un número para conversar, no una promesa ni una oferta.",
      needExH: "Un ejemplo para ver el tamaño",
      needEx: "Si aporta $55,000 al año y quiere cubrir diez años de ese ingreso, son $550,000. Si queda una hipoteca de $180,000, súmela. Reste ahorros u otras pólizas. El resultado —cerca de $730,000 en este ejemplo— es una conversación, no una cotización.",
      vsH: "Temporal frente a vida entera",
      vsP: "Misma suma asegurada, trabajo distinto. La temporal cubre un plazo. La vida entera está pensada para no vencer. Por eso la prima permanente es más alta. Abajo, $100,000: temporal a 10 años frente a una muestra educativa de vida entera (agosto 2026).",
      vsColQ: "",
      vsColT: "Temporal",
      vsColTSub: "Plazo fijo",
      vsColW: "Vida entera",
      vsColWSub: "Permanente",
      vsR1H: "Cuánto dura",
      vsR1T: "El plazo que eligió (típicamente 10 a 30 años)",
      vsR1W: "Diseñada para durar toda la vida si se mantiene al día",
      vsR2H: "Prima en el plazo original",
      vsR2T: "Nivelada en el temporal habitual",
      vsR2W: "Típicamente fija",
      vsR3H: "Valor en efectivo / préstamo",
      vsR3T: "No",
      vsR3W: "Sí, según el contrato; un préstamo no pagado reduce el beneficio",
      vsR4H: "Para qué se usa",
      vsR4T: "Hipoteca, años de ingreso, deudas con fecha",
      vsR4W: "Necesidad que no vence: gastos finales, cónyuge, legado",
      vsNote: "A los 40 años, $100,000 a 10 años ronda $8–$9 al mes en la muestra temporal; la vida entera del mismo monto ronda $116–$132. Son primas ilustrativas, no un múltiplo fijo para todos.",
      kindsH: "Qué tipos aparecen en una cotización (y cuáles no)",
      kind1H: "Temporal nivelado",
      kind1: "El beneficio y la prima del plazo original se mantienen. Es lo que muestran las tablas de esta página.",
      kind2H: "Suscripción completa",
      kind2: "Más preguntas; a veces laboratorios o una visita paramédica, sobre todo en montos altos. Suele abrir mejor precio. El tope típico de una cotización es $5,000,000.",
      kind3H: "Emisión simplificada (Easy Term)",
      kind3: "American Amicable Easy Term: cuestionario, sin examen en el consultorio. Plazos 10, 20 y 30 años. Mínimo $25,000. Más rápido; suele costar más por dólar que la muestra Preferred Best.",
      kind4H: "Lo que suele no aparecer",
      kind4: "No hay temporal de un año ni de 40 años en lo que muestra Mejor Vida Seguros. Un temporal que baja el beneficio con la hipoteca no es el producto que se muestra: se cubre la deuda con un monto nivelado del plazo adecuado. Un seguro grupal del trabajo es otro contrato; suele terminar si deja el empleo.",
      convH: "¿Se puede pasar a una póliza permanente?",
      convLead: "Algunos contratos temporales permiten convertir. Eso significa pasar de esa póliza temporal a una póliza permanente de la misma compañía, usando las respuestas de salud que ya dio, sin empezar un examen médico nuevo para esa conversión — si el contrato lo permite y lo hace a tiempo.",
      convWhy: "Se usa cuando el temporal se compró para un período — una hipoteca, años de ingreso, hijos en casa — y más adelante todavía hace falta una cobertura que no venza. Un cónyuge, gastos finales u otra necesidad sin fecha de cierre es el motivo habitual.",
      convPrice: "Paga el precio del producto permanente a la edad en que convierte. Quien compró a los 40 y convierte a los 55 paga la tarifa permanente de los 55 años, no la del temporal original.",
      convDeadline: "Está en el contrato. Si se pasa, la opción desaparece. La compañía no añade un día más.",
      convContracts: "La ventana, los productos a los que se puede pasar y los topes de edad están en esa póliza. Ejemplos designados: Trendsetter Super de Transamerica y Select-a-Term de Corebridge; son ejemplos, no una lista completa.",
      convHelp: "Mejor Vida Seguros le ayuda a leer esa ventana y a elegir el producto destino antes del plazo.",
      convPriceT: "El precio no es el del temporal",
      convDeadlineT: "Hay una fecha límite",
      convContractsT: "No todos convierten igual",
      applyH: "Cómo pedir una cotización",
      applyLead: "En el sitio puede ver precios ilustrativos y pedir que Mejor Vida Seguros le contacte. Eso no es la solicitud formal. Una solicitud licenciada llega después, con la compañía, y pide más datos porque es un contrato.",
      applyWhy: "Estatura, peso y tabaco se preguntan porque cambian la clase de precio. No son curiosidad: mueven la prima en ambos caminos de suscripción.",
      applyReadyH: "Tenga a mano",
      apply1T: "Lo básico",
      apply1: "Sexo, fecha de nacimiento, si usa tabaco, el plazo y el monto que está considerando.",
      apply2T: "Lo que cambia el precio",
      apply2: "Estatura y peso. Un contacto para que Mejor Vida Seguros pueda devolverle la llamada o el mensaje.",
      apply3T: "Si sigue a una solicitud",
      apply3: "Nombre legal, número de Seguro Social, beneficiarios (principal y contingente) y una cuenta para el débito mensual. Eso no se pide para mirar una cifra en la página.",
      applyQuoteH: "Cotización de temporal",
      applyQuoteP: "Compara compañías designadas para su edad, tabaco y plazo.",
      applyQuoteCta: "Ver precios de temporal",
      applyCallH: "Agendar una llamada",
      applyCallP: "Hablamos del plazo, el monto y si conviene permanente.",
      applyCallCta: "Agendar",
      applyPhone: "O llame a Mejor Vida Seguros al",
      uwH: "Dos caminos de suscripción",
      uwLead: "Suscripción es el proceso en el que la aseguradora revisa salud —y a menudo recetas, estatura, peso y tabaco— para decidir si emite y a qué precio. En temporal hay dos caminos reales. Ninguno es “sin preguntas”.",
      uwFastH: "Simplificada / Easy Term",
      uwFast: "Preguntas de salud y revisión de registros. Sin examen en el consultorio. Más rápido: días hábiles, no semanas de laboratorio. Suele costar más por dólar. American Amicable Easy Term es el ejemplo designado.",
      uwFastUse: "Empiece aquí si quiere velocidad o no quiere un examen.",
      uwFullH: "Suscripción completa",
      uwFull: "Más preguntas. Según edad y monto, laboratorios o una visita paramédica. Tarda más. Suele abrir el mejor precio por dólar en montos grandes. Es el camino de las tablas ilustrativas de esta página.",
      uwFullUse: "Empiece aquí si busca el precio más bajo por dólar en un monto grande y puede responder más.",
      uwNote: "Estatura, peso y tabaco importan en ambos caminos.",
      coH: "Compañías designadas (temporal)",
      coAges: "Edades",
      coAmt: "Montos",
      coWait: "Examen",
      coTaProduct: "Trendsetter Super",
      coTaAges: "18 hasta el tope del plazo (10 años: 80 no fumador)",
      coTaAmt: "$100,000–$5,000,000 en cotizaciones típicas",
      coTaExam: "Completa (puede incluir labs)",
      coMooProduct: "Term Life Answers",
      coMooAges: "18 hasta el tope del plazo (10 años: 80 no fumador)",
      coMooAmt: "$100,000–$5,000,000 en cotizaciones típicas",
      coMooExam: "Completa",
      coAsProduct: "Assurity Term Life",
      coAsAges: "18 hasta el tope (10 años: 80 no fumador)",
      coAsAmt: "$100,000–$1,000,000",
      coAsExam: "Completa",
      coAmProduct: "Easy Term",
      coAmAges: "18–75 (10 años); 18–55 (30 años)",
      coAmAmt: "$25,000–$500,000 (tope $300,000 después de 45)",
      coAmExam: "Simplificada (sin examen en consultorio)",
      coFoot: "También hay Mutual of Omaha Term Life Express (montos desde $25,000, tope según edad) y Corebridge Select-a-Term. Las tarjetas son educativas. El estado, el tabaco y la salud cambian la oferta. Licencias actuales: página de <a href=\"licencias.html\">licencias</a>.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "Si sobrevivo el plazo, ¿me devuelven el dinero?",
      faq1a: "No, salvo un rider de devolución de primas que hay que comprar al inicio y encarece la póliza. Las tablas de esta página son temporales nivelados sin ese rider. Pagó por la protección de esos años.",
      faq2q: "Si cancelo, ¿hay reembolso?",
      faq2a: "En un temporal sin valor en efectivo, cancelar suele terminar la cobertura sin dinero que devolver. Las primas ya usadas pagaron el riesgo de esos meses.",
      faq3q: "¿El temporal tiene valor en efectivo?",
      faq3a: "El temporal nivelado habitual, no. La vida entera sí puede acumular valor, con otras primas y reglas.",
      faq4q: "¿Hay que hacer examen médico?",
      faq4a: "Depende del producto y del monto. Easy Term no pide examen en el consultorio. Un temporal grande de suscripción completa a menudo sí pide más datos y a veces laboratorios.",
      faq5q: "¿Se puede renovar cuando termina?",
      faq5a: "Algunos contratos permiten seguir año a año a un precio nuevo, casi siempre mucho más alto. No cuente con renovar al mismo precio. Conversión a permanente, si existe, tiene fecha en el contrato.",
      faq6q: "¿Puede calificar alguien con problemas de salud?",
      faq6a: "A veces, con extra de prima o un monto menor. No hay temporal “sin preguntas”. Si el cuestionario de temporal no da, un gasto final o la aceptación garantizada pueden ser el otro camino — son productos distintos.",
      faq7q: "¿La prima sube cada año?",
      faq7a: "En el plazo original de un temporal nivelado, no solo por cumplir años. Al emitir más tarde, sí cuesta más. Al renovar o convertir, la nueva prima usa la edad de entonces.",
      faq8q: "¿Por qué la aseguradora se queda con las primas si no hubo reclamo?",
      faq8a: "Porque el contrato pagaba el riesgo de esos años, igual que un seguro de auto el año en que no choca. No es una cuenta de ahorro.",
      faq9q: "¿Cuánto tarda una solicitud?",
      faq9a: "Una cotización en línea suele ser inmediata. Una solicitud simplificada suele resolverse en días hábiles. Una suscripción completa con laboratorios tarda más. No hay un plazo fijo de “cuatro a seis semanas”: depende de la compañía y de si hacen falta exámenes.",
      srcTitle: "Fuentes",
      src1: "<a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC — Life insurance (consumer)</a> y la <a href=\"https://content.naic.org/sites/default/files/publication-lig-lp-consumer-life.pdf\" rel=\"noopener\" target=\"_blank\">Life Insurance Buyer’s Guide</a> (qué es el temporal, que no acumula valor en efectivo, y cómo pensar el monto).",
      src2: "Edades y montos: guías de producto de Transamerica Trendsetter Super, Mutual of Omaha Term Life Answers / Express, American Amicable Easy Term y Assurity Term (Nebraska).",
      src3: "Primas ilustrativas: muestras de compañías designadas, suscripción completa Preferred Best no fumador, agosto 2026. Cada celda es la más baja entre las compañías que devolvieron una cifra. No es oferta vinculante.",
      discTitle: "Aviso",
      discBody: "Esta página es educativa, no una oferta. Edades, montos y primas cambian por compañía, producto, tabaco, salud y estado. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actual están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotizar temporal",
      quote1: "Compañías designadas",
      quote2: "10, 15, 20, 25 o 30 años",
      quoteCta: "Ver precios",
    };
  }
  return {
    title: "Term life insurance: how it works and what it costs (2026) | Mejor Vida Insurance",
    desc: "Term life covers a set number of years. Term lengths, maximum issue ages, appointed-company sample premiums, how it differs from whole life, and how to get a quote.",
    h1: "Term life insurance covers you for a set number of years",
    lead: "You pay a premium. If you die while the policy is in force and inside the term, the person you named receives the amount. When the term ends, that coverage ends. It is not a savings account. It is protection for a period you choose.",
    crumbEnd: "Term life insurance",
    take1: "Typical quotes cover <strong>10, 15, 20, 25, or 30 years</strong>. A 40-year term or a 1-year term is not the usual offer from these appointed companies.",
    take2: "It is usually the <strong>lowest cost per dollar</strong> of death benefit. In our samples, $100,000 for 10 years at age 40 is about <strong>$8–$9 a month</strong> (non-tobacco, best illustrated class).",
    take3: "There is <strong>no guaranteed-acceptance term</strong>. Health questions apply. A simplified plan (no in-office exam) exists; fully underwritten term usually opens a better price and higher amounts.",
    callout: "Match the term to the years your family would still need your income or still carry a large debt. If the need does not end, also compare whole life or final expense.",
    whatH: "What you are buying, in plain words",
    whatP1: "A term policy is not a prepaid funeral and not a savings account. It is a contract: the company pays a death benefit if you die during the term and premiums are current. The <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC</a> describes term as coverage for one or more years that generally does not build cash value.",
    fact1H: "What you buy",
    fact1P: "An amount (for example $100,000 or $500,000) that lasts for the term. Fully underwritten quotes typically start at $100,000.",
    fact2H: "Who is paid",
    fact2P: "The beneficiary you name. A bank or funeral home is paid only if that person chooses to pay them.",
    fact3H: "What you do not buy",
    fact3P: "It does not build cash value. If you outlive the term, premiums are not refunded unless you bought a return-of-premium rider, which raises the price and is not in these sample tables.",
    howH: "How it works, in four steps",
    how1T: "Match the years, then add up the dollars",
    how1: "Pick a term that lasts as long as the need: years left on a mortgage, years until children finish school, or years a spouse would still rely on your income. A 30-year term costs more per month than a 10-year term at the same amount, because the company is covering a longer stretch. For the amount, add what would still need paying if you died this year: remaining mortgage, several years of pay, and education. Some advisers start with 5–8 times annual income, then add debts and subtract savings. The NAIC buyer’s guide prefers that personal add-up over a single formula. A <a href=\"#need\">worked example is further down</a>.",
    how2T: "Answer health, tobacco, height, and weight honestly",
    how2: "The company uses those answers — and often prescriptions and driving history — to set a price class. Tobacco in the last 12 months usually means a higher premium. Height and weight matter because they affect health class; they are not a separate product. A $250,000 or $500,000 term application typically asks for more detail than a $10,000 final-expense policy. Leaving out a condition can delay or affect a later claim. A simplified product (no in-office exam) still has health questions; there is no guaranteed-acceptance term.",
    how3T: "Pay a fixed premium for the years you bought",
    how3: "On level term, the monthly premium stays the same during the original term if you pay on time. It does not rise just because you have a birthday. If a draft fails and the policy lapses, there is no death benefit. You are paying for protection those years, not depositing money you will get back.",
    how4T: "The family is paid only if you die during the term",
    how4: "If you die while the policy is in force, the person you named receives the face amount, usually free of income tax. If you outlive the term, that contract ends and premiums are not refunded (unless you bought a return-of-premium rider). Some appointed contracts let you convert to permanent coverage during a window in the policy, at the price for your age then — not the old term price.",
    lengthH: "How long a term you can apply for by age",
    lengthP: "The maximum age is not a web rumor. It is the highest cap among the appointed companies in these samples (non-tobacco). Tobacco lowers the cap. The same age may qualify for 10 years and not for 30.",
    lengthColT: "Term",
    lengthColA: "Typical maximum issue age (non-tobacco)",
    lengthAge: "through age",
    length1: "10 years",
    length1A: "80",
    length2: "15 years",
    length2A: "78",
    length3: "20 years",
    length3A: "70",
    length4: "25 years",
    length4A: "68",
    length5: "30 years",
    length5A: "60",
    lengthNote: "Combined cap of Transamerica Trendsetter Super, Mutual of Omaha Term Life Answers / Express, American Amicable Easy Term, and Assurity Term (non-tobacco). Tobacco: the cap is lower (for example, 30-year term often ends near 50–55). Quotes typically start at age 18.",
    fitH: "Is this the right path?",
    fitYesH: "It can fit if",
    fitYes1: "There is a debt or an income with an end date: a mortgage, years of raising children, or replacing pay while dependents still rely on you.",
    fitYes2: "You want a large death benefit for a lower monthly premium than whole life at the same face amount.",
    fitNoH: "It often does not fit if",
    fitNo1: "The goal is a funeral at 80 or a benefit that should not expire. Then compare <a href=\"final-expense-insurance.html\">final expense</a> or <a href=\"whole-life-cost.html\">whole life</a>.",
    fitNo2: "You cannot or will not answer health questions. Term is not issued “with no questions.” Guaranteed acceptance is a different, permanent product with a wait.",
    limitsH: "What term does not do",
    lim1H: "The term ends",
    lim1: "If you outlive the contract, the company does not owe the face amount. You paid for protection during those years, not for an automatic refund.",
    lim2H: "Health matters more",
    lim2: "Because the price per dollar is low, companies ask for more health detail than on a small final-expense policy. Simplified term exists; it is not guaranteed acceptance.",
    lim3H: "No cash value",
    lim3: "You cannot borrow against the policy. If you cancel, there is usually no cash value to return.",
    lim4H: "Keeping coverage later costs more",
    lim4: "Year-to-year renewal or a new policy at the new age is almost always much more expensive. Conversion to permanent, if the contract allows it, uses your age then — not the old term price.",
    costH: "What it usually costs per month",
    costP: "Illustrative fully underwritten, non-tobacco, best-class monthly premiums (August 2026). Each cell is the lowest sample among appointed companies that quoted. Not an offer. A simplified plan (no in-office exam) usually costs more per dollar and is priced separately.",
    needH: "How to think about the amount",
    needLead: "The term face amount is the death benefit if you die during the term. It is not a savings goal. It is the money the person you named would receive to keep covering what your income pays for today.",
    need1T: "Who depends on your income",
    need1: "Start with the people who would live on less if you died, and how many years they would still need that income.",
    need2T: "Add debts that would remain",
    need2: "A mortgage is the usual one. Also count a car loan or another debt the family would still owe.",
    need3T: "Add a dated cost if it applies",
    need3: "Children’s schooling, or another expense with a calendar. If it does not apply, skip it.",
    need4T: "Subtract what is already there",
    need4: "Savings, accounts, or other life insurance already in force. That money would already do part of the job.",
    need5T: "A shortcut is not a requirement",
    need5: "Some advisers talk about several times annual pay. That is a shortcut, not a required number. The <a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC consumer guide</a> starts from those same questions, not from one magic formula.",
    needClose: "The result is a starting number for a conversation, not a promise and not an offer.",
    needExH: "An example so the size is visible",
    needEx: "If you contribute $55,000 a year and want to cover ten years of that income, that is $550,000. If $180,000 remains on a mortgage, add it. Subtract savings or other policies. The result — about $730,000 in this example — is a conversation, not a quote.",
    vsH: "Term next to whole life",
    vsP: "Same face amount, different job. Term covers a period. Whole life is built not to expire. That is why the permanent premium is higher. Below, $100,000: 10-year term versus an educational whole-life sample (August 2026).",
    vsColQ: "",
    vsColT: "Term",
    vsColTSub: "Set period",
    vsColW: "Whole life",
    vsColWSub: "Permanent",
    vsR1H: "How long it lasts",
    vsR1T: "The term you chose (typically 10 to 30 years)",
    vsR1W: "Designed to last a lifetime if kept in force",
    vsR2H: "Premium in the original term",
    vsR2T: "Level on ordinary term",
    vsR2W: "Typically fixed",
    vsR3H: "Cash value / loan",
    vsR3T: "No",
    vsR3W: "Yes, under the contract; an unpaid loan reduces the benefit",
    vsR4H: "Typical use",
    vsR4T: "Mortgage, years of income, dated debts",
    vsR4W: "A need that does not expire: final expenses, a spouse, a gift",
    vsNote: "At age 40, $100,000 for 10 years is about $8–$9 a month in the term sample; whole life at the same face is about $116–$132. These are illustrative premiums, not a fixed multiple for everyone.",
    kindsH: "What shows up in a quote (and what does not)",
    kind1H: "Level term",
    kind1: "The benefit and the original-term premium stay level. That is what the tables on this page show.",
    kind2H: "Fully underwritten",
    kind2: "More questions; sometimes labs or a paramed visit, especially at higher amounts. Usually a better price. A typical quote can go up to $5,000,000.",
    kind3H: "Simplified issue (Easy Term)",
    kind3: "American Amicable Easy Term: a questionnaire, no in-office exam. Terms of 10, 20, and 30 years. Minimum $25,000. Faster; usually costs more per dollar than the Preferred Best sample.",
    kind4H: "What usually does not appear",
    kind4: "There is no 1-year or 40-year term in what Mejor Vida Insurance shows. A decreasing benefit tied to a mortgage is not the product shown: the debt is covered with a level amount for a matching term. Workplace group term is a different contract; it often ends if you leave the job.",
    convH: "Can you switch to a permanent policy?",
    convLead: "Some term contracts let you convert. That means you can move from that term policy to a permanent policy from the same company, using the health answers you already gave, without starting a brand-new medical exam for that conversion — if the contract still allows it and you convert in time.",
    convWhy: "People use this when the original term was bought for a period — a mortgage, years of income, children still at home — and later they still need coverage that should not expire. A spouse, final expenses, or another need with no end date is the usual reason.",
    convPrice: "You pay the permanent product’s price at the age you convert. Someone who bought at 40 and converts at 55 pays the 55-year-old permanent rate, not the rate from the original term.",
    convDeadline: "It is in the contract. Miss it, and the conversion option is gone. The company does not add an extra day.",
    convContracts: "The window, the products you can convert into, and the age limits sit in that policy. Appointed examples include Transamerica Trendsetter Super and Corebridge Select-a-Term; those are examples, not a full list.",
    convHelp: "Mejor Vida Insurance helps you read that window and choose the destination product before the deadline.",
    convPriceT: "The price is not the old term price",
    convDeadlineT: "There is a deadline",
    convContractsT: "Not every contract converts the same way",
    applyH: "How to get a quote",
    applyLead: "On this site you can see illustrative prices and ask Mejor Vida Insurance to follow up. That is not the licensed application. A formal application comes later, with the company, and asks for more because it is a contract.",
    applyWhy: "Height, weight, and tobacco are asked because they set a price class. They are not idle questions: they move the premium on both underwriting paths.",
    applyReadyH: "Have this ready",
    apply1T: "The basics",
    apply1: "Sex, date of birth, tobacco use, the term length, and the amount you are considering.",
    apply2T: "What changes the price",
    apply2: "Height and weight. A contact so Mejor Vida Insurance can reach you.",
    apply3T: "If you go on to an application",
    apply3: "Legal name, Social Security number, beneficiaries (primary and contingent), and an account for the monthly draft. Those are not needed just to look at a number on the page.",
    applyQuoteH: "Term quote",
    applyQuoteP: "Compares appointed companies for your age, tobacco, and term.",
    applyQuoteCta: "See term prices",
    applyCallH: "Schedule a call",
    applyCallP: "We talk through the term, the amount, and whether permanent coverage fits.",
    applyCallCta: "Schedule",
    applyPhone: "Or call Mejor Vida Insurance at",
    uwH: "Two underwriting paths",
    uwLead: "Underwriting is the company checking health — and often prescriptions, height, weight, and tobacco — to decide whether to issue and at what price. Term has two real appointed paths. Neither is “no questions.”",
    uwFastH: "Simplified / Easy Term",
    uwFast: "Health questions and a records check. No in-office exam. Faster: business days, not weeks of labs. Usually costs more per dollar. American Amicable Easy Term is the appointed example.",
    uwFastUse: "Start here if you want speed or dislike exams.",
    uwFullH: "Fully underwritten",
    uwFull: "More questions. Depending on age and amount, labs or a paramed visit. Takes longer. Usually the lowest price per dollar on a large face. That is the path behind the illustrative tables on this page.",
    uwFullUse: "Start here if you want the lowest price per dollar on a large amount and can answer more.",
    uwNote: "Height, weight, and tobacco still matter on both paths.",
    coH: "Appointed companies (term)",
    coAges: "Ages",
    coAmt: "Amounts",
    coWait: "Exam",
    coTaProduct: "Trendsetter Super",
    coTaAges: "18 through the term cap (10-year: 80 non-tobacco)",
    coTaAmt: "$100,000–$5,000,000 in typical quotes",
    coTaExam: "Full (may include labs)",
    coMooProduct: "Term Life Answers",
    coMooAges: "18 through the term cap (10-year: 80 non-tobacco)",
    coMooAmt: "$100,000–$5,000,000 in typical quotes",
    coMooExam: "Full",
    coAsProduct: "Assurity Term Life",
    coAsAges: "18 through the cap (10-year: 80 non-tobacco)",
    coAsAmt: "$100,000–$1,000,000",
    coAsExam: "Full",
    coAmProduct: "Easy Term",
    coAmAges: "18–75 (10-year); 18–55 (30-year)",
    coAmAmt: "$25,000–$500,000 ($300,000 cap after 45)",
    coAmExam: "Simplified (no in-office exam)",
    coFoot: "Mutual of Omaha Term Life Express (from $25,000, age-based cap) and Corebridge Select-a-Term are also appointed. Cards are educational. State, tobacco, and health change the offer. Current licenses are on the <a href=\"licenses.html\">licenses</a> page.",
    faqTitle: "Frequently asked questions",
    faq1q: "If I outlive the term, do I get my money back?",
    faq1a: "No, unless you bought a return-of-premium rider at issue, which raises the price. The tables on this page are level term without that rider. You paid for protection during those years.",
    faq2q: "If I cancel, is there a refund?",
    faq2a: "On term with no cash value, canceling usually ends coverage with no money back. Premiums already used paid for the risk of those months.",
    faq3q: "Does term insurance have cash value?",
    faq3a: "Ordinary level term does not. Whole life can build cash value, with different premiums and rules.",
    faq4q: "Does term life require a medical exam?",
    faq4a: "It depends on the product and the amount. Easy Term does not require an in-office exam. Large fully underwritten term often asks for more data and sometimes labs.",
    faq5q: "Can you renew when the term ends?",
    faq5a: "Some contracts allow year-to-year continuation at a new price, almost always much higher. Do not count on renewing at the old price. Conversion to permanent, if it exists, has a date in the contract.",
    faq6q: "Can someone with health problems qualify?",
    faq6a: "Sometimes, with a higher premium or a smaller amount. There is no “no-questions” term. If the term questionnaire does not issue, final expense or guaranteed acceptance may be the other path — those are different products.",
    faq7q: "Does the premium rise every year?",
    faq7a: "During the original term of a level product, not just because of a birthday. Issuing later does cost more. Renewal or conversion uses your age then.",
    faq8q: "Why does the company keep the premiums if there was no claim?",
    faq8a: "Because the contract paid for the risk of those years, the same way auto insurance pays for a year with no crash. It is not a savings account.",
    faq9q: "How long does an application take?",
    faq9a: "An online quote is often immediate. A simplified application often resolves in business days. Fully underwritten coverage with labs takes longer. There is no fixed “four to six weeks”: it depends on the company and whether exams are required.",
    srcTitle: "Sources",
    src1: "<a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC — Life insurance (consumer)</a> and the <a href=\"https://content.naic.org/sites/default/files/publication-lig-lp-consumer-life.pdf\" rel=\"noopener\" target=\"_blank\">Life Insurance Buyer’s Guide</a> (what term is, that it generally does not build cash value, and how to think about the amount).",
    src2: "Ages and amounts: product guides for Transamerica Trendsetter Super, Mutual of Omaha Term Life Answers / Express, American Amicable Easy Term, and Assurity Term (Nebraska).",
    src3: "Sample premiums: appointed-company fully underwritten Preferred Best non-tobacco samples, August 2026. Each cell is the lowest among companies that returned a figure. Not a binding offer.",
    discTitle: "Disclosure",
    discBody: "This page is educational, not an offer. Ages, amounts, and premiums change by company, product, tobacco, health, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "Quote term",
    quote1: "Appointed companies",
    quote2: "10, 15, 20, 25, or 30 years",
    quoteCta: "See prices",
  };
}

function termMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "tipos-seguro-vida.html" : "life-insurance-products.html";
  const termCost = isEs ? "costo-seguro-vida-temporal.html" : "term-life-cost.html";
  const whole = isEs ? "costo-seguro-vida-entera.html" : "whole-life-cost.html";
  const fe = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const quote = "term-quote.html";
  const moo = "carriers/mutual-of-omaha.html";
  const ta = "carriers/transamerica.html";
  const assurity = "carriers/assurity.html";
  const amam = isEs ? "carriers/american-amicable.html" : "carriers/american-amicable.html";
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
<a href="#how">${isEs ? "Cómo funciona" : "How it works"}</a>
<a href="#length">${isEs ? "Plazos" : "Term lengths"}</a>
<a href="#cost">${isEs ? "Costo" : "Cost"}</a>
<a href="#need">${isEs ? "Monto" : "How much"}</a>
<a href="#compare">${isEs ? "Vs. permanente" : "Vs. permanent"}</a>
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
<section class="lic-section" id="length">
<h2>${c.lengthH}</h2>
<p>${c.lengthP}</p>
<p class="lic-age-chart__caption">${c.lengthColA}</p>
<div class="lic-age-chart" role="table" aria-label="${c.lengthH}">
<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${c.length1}</div>
<div class="lic-age-chart__age" role="cell">${c.length1A}<span>${c.lengthAge}</span></div>
</div>
<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${c.length2}</div>
<div class="lic-age-chart__age" role="cell">${c.length2A}<span>${c.lengthAge}</span></div>
</div>
<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${c.length3}</div>
<div class="lic-age-chart__age" role="cell">${c.length3A}<span>${c.lengthAge}</span></div>
</div>
<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${c.length4}</div>
<div class="lic-age-chart__age" role="cell">${c.length4A}<span>${c.lengthAge}</span></div>
</div>
<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${c.length5}</div>
<div class="lic-age-chart__age" role="cell">${c.length5A}<span>${c.lengthAge}</span></div>
</div>
</div>
<p class="lic-rate-note">${c.lengthNote}</p>
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
<section class="lic-section" id="limits">
<h2>${c.limitsH}</h2>
<div class="lic-fact-trio lic-fact-trio--color">
<div>
<h3>${c.lim1H}</h3>
<p>${c.lim1}</p>
</div>
<div>
<h3>${c.lim2H}</h3>
<p>${c.lim2}</p>
</div>
<div>
<h3>${c.lim3H}</h3>
<p>${c.lim3}</p>
</div>
</div>
<p><strong>${c.lim4H}.</strong> ${c.lim4}</p>
</section>
<section class="lic-section" id="cost" data-lic-product="term" data-lic-term="10" data-lic-quote-href="${quote}">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<p class="lic-rate-note">${isEs ? "Muestre un plazo:" : "Show a term:"}
<button type="button" class="lic-face-tab is-active" data-lic-set-term="10" aria-pressed="true">10</button>
<button type="button" class="lic-face-tab" data-lic-set-term="20" aria-pressed="false">20</button>
<button type="button" class="lic-face-tab" data-lic-set-term="30" aria-pressed="false">30</button>
</p>
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="100000" role="tab" aria-selected="true">$100,000</button>
<button type="button" class="lic-face-tab" data-lic-face="250000" role="tab" aria-selected="false">$250,000</button>
<button type="button" class="lic-face-tab" data-lic-face="500000" role="tab" aria-selected="false">$500,000</button>
<span class="lic-face-tabs__break" aria-hidden="true"></span>
<button type="button" class="lic-face-tab" data-lic-face="1000000" role="tab" aria-selected="false">$1,000,000</button>
<button type="button" class="lic-face-tab" data-lic-face="2000000" role="tab" aria-selected="false">$2,000,000</button>
<button type="button" class="lic-face-tab" data-lic-face="3000000" role="tab" aria-selected="false">$3,000,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
</section>
<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<p>${c.needLead}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.need1T}</strong>${c.need1}</li>
<li><strong>${c.need2T}</strong>${c.need2}</li>
<li><strong>${c.need3T}</strong>${c.need3}</li>
<li><strong>${c.need4T}</strong>${c.need4}</li>
<li><strong>${c.need5T}</strong>${c.need5}</li>
</ol>
<p>${c.needClose}</p>
<aside class="lic-callout" aria-label="${c.needExH}">
<strong>${c.needExH}</strong>
<p>${c.needEx}</p>
</aside>
</section>
<section class="lic-section" id="compare">
<h2>${c.vsH}</h2>
<p>${c.vsP}</p>
<div class="lic-vs-chart" role="table" aria-label="${c.vsH}">
<div class="lic-vs-chart__row lic-vs-chart__head" role="row">
<div class="lic-vs-chart__q lic-vs-chart__q--blank" role="columnheader">${c.vsColQ}</div>
<div class="lic-vs-chart__ins" role="columnheader"><strong>${c.vsColT}</strong><span>${c.vsColTSub}</span></div>
<div class="lic-vs-chart__pre" role="columnheader"><strong>${c.vsColW}</strong><span>${c.vsColWSub}</span></div>
</div>
<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c.vsR1H}</div>
<div class="lic-vs-chart__ins" role="cell">${c.vsR1T}</div>
<div class="lic-vs-chart__pre" role="cell">${c.vsR1W}</div>
</div>
<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c.vsR2H}</div>
<div class="lic-vs-chart__ins" role="cell">${c.vsR2T}</div>
<div class="lic-vs-chart__pre" role="cell">${c.vsR2W}</div>
</div>
<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c.vsR3H}</div>
<div class="lic-vs-chart__ins" role="cell">${c.vsR3T}</div>
<div class="lic-vs-chart__pre" role="cell">${c.vsR3W}</div>
</div>
<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${c.vsR4H}</div>
<div class="lic-vs-chart__ins" role="cell">${c.vsR4T}</div>
<div class="lic-vs-chart__pre" role="cell">${c.vsR4W}</div>
</div>
</div>
<p>${c.vsNote}</p>
<div class="lic-section" id="temporal-vs-entera" data-lic-product="term-vs-whole" data-lic-quote-href="${quote}">
<div class="lic-rate-wrap">
<table class="lic-rate-table lic-rate-table--compare">
<thead><tr><th scope="col">${isEs ? "Perfil" : "Profile"}</th><th scope="col">${isEs ? "Temporal (10 años)" : "Term (10-year)"}</th><th scope="col">${isEs ? "Vida entera" : "Whole life"}</th></tr></thead>
<tbody data-lic-compare-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-compare-note></p>
</div>
<p><a href="${whole}">${isEs ? "Costo de vida entera" : "Whole life cost"}</a></p>
</section>
<section class="lic-section" id="kinds">
<h2>${c.kindsH}</h2>
<div class="lic-fact-trio">
<div>
<h3>${c.kind1H}</h3>
<p>${c.kind1}</p>
</div>
<div>
<h3>${c.kind2H}</h3>
<p>${c.kind2}</p>
</div>
<div>
<h3>${c.kind3H}</h3>
<p>${c.kind3}</p>
</div>
</div>
<p>${c.kind4}</p>
</section>
<section class="lic-section" id="convert">
<h2>${c.convH}</h2>
<p>${c.convLead}</p>
<p>${c.convWhy}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.convPriceT}</strong>${c.convPrice}</li>
<li><strong>${c.convDeadlineT}</strong>${c.convDeadline}</li>
<li><strong>${c.convContractsT}</strong>${c.convContracts}</li>
</ol>
<p>${c.convHelp}</p>
</section>
<section class="lic-section" id="uw">
<h2>${c.uwH}</h2>
<p>${c.uwLead}</p>
<div class="lic-split-lists lic-split-lists--cards">
<div class="lic-split-lists__yes">
<h3>${c.uwFastH}</h3>
<p>${c.uwFast}</p>
<p><strong>${c.uwFastUse}</strong></p>
</div>
<div class="lic-split-lists__no">
<h3>${c.uwFullH}</h3>
<p>${c.uwFull}</p>
<p><strong>${c.uwFullUse}</strong></p>
</div>
</div>
<p>${c.uwNote}</p>
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyLead}</p>
<p>${c.applyWhy}</p>
<p><strong>${c.applyReadyH}</strong></p>
<ol class="lic-lesson-steps">
<li><strong>${c.apply1T}</strong>${c.apply1}</li>
<li><strong>${c.apply2T}</strong>${c.apply2}</li>
<li><strong>${c.apply3T}</strong>${c.apply3}</li>
</ol>
<div class="lic-choice-pair">
<a class="lic-choice" href="${quote}">
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
<div><dt>${c.coWait}</dt><dd>${c.coTaExam}</dd></div>
</dl>
</a>
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
<div><dt>${c.coWait}</dt><dd>${c.coMooExam}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${assurity}">
<div class="lic-co-logo"><img src="${assets}img/carriers/assurity-logo.svg" alt="" width="200" height="48" loading="lazy" decoding="async"/></div>
<h3>Assurity</h3>
<p class="lic-co-product">${c.coAsProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAsAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAsAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coAsExam}</dd></div>
</dl>
</a>
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${amam}">
<div class="lic-co-logo lic-co-logo--wide"><picture>
<source type="image/webp" srcset="${assets}img/opt/american-amicable-logo.webp"/>
<img src="${assets}img/opt/american-amicable-logo.png" alt="" width="400" height="80" loading="lazy" decoding="async"/>
</picture></div>
<h3>American Amicable</h3>
<p class="lic-co-product">${c.coAmProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coAmAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coAmAmt}</dd></div>
<div><dt>${c.coWait}</dt><dd>${c.coAmExam}</dd></div>
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
<p class="lic-rate-note"><a href="${fe}">${isEs ? "Gastos finales" : "Final expense"}</a> · <a href="${whole}">${isEs ? "Vida entera" : "Whole life"}</a> · <a href="${termCost}">${isEs ? "Tablas de costo temporal" : "Term cost tables"}</a> · <a href="${quote}">${isEs ? "Cotizar temporal" : "Quote term"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2, quoteHref: quote, cta: c.quoteCta })}
</div>
</main>`;
}

module.exports = { copyTerm, termMain };
