"use strict";

const PHONE = "402-440-5438";
const TEL = "+14024405438";
const { quoteRailHtml } = require("./lic-quote-rail");

function copyHub(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Guía completa de seguro de vida para personas mayores (2026) | Mejor Vida Seguros",
      desc: "Tipos de seguro de vida para personas mayores, edades de emisión de compañías designadas, y primas ilustrativas de gastos finales, vida entera y temporal.",
      h1: "Guía de seguro de vida para personas mayores",
      lead: "El seguro de vida para personas mayores usa los mismos tipos de póliza que a los 40 años — vida entera, temporal, gastos finales — pero hay menos plazos, montos más bajos, primas más altas y más preguntas de salud. Esta guía compara lo que Mejor Vida Seguros cotiza, con nombres que la gente busca (entierro, cremación, sin espera, hipoteca) aunque varios sean el mismo producto.",
      crumbEnd: "Guía de vida para mayores",
      take1: "Para un funeral o cremación, el camino habitual es <strong>gastos finales</strong>: vida entera de monto más bajo, preguntas de salud, sin examen en el consultorio.",
      take2: "El <strong>temporal</strong> sirve si necesita un monto alto por un plazo fijo (hipoteca o ingresos). No es el producto típico de entierro después de los 70.",
      take3: "Muchas compañías designadas emiten gastos finales hasta los <strong>85</strong>. Accendo Level puede llegar a <strong>89</strong>, con un tope de $25,000 a los 76–89. No publicamos emisión nueva de gastos finales a los 90.",
      callout: "Las primas de esta página salen del cotizador de Mejor Vida Seguros (compañías designadas). No son una oferta. El precio real depende de edad, salud, tabaco y estado.",
      typesH: "Tipos de seguro de vida para personas mayores",
      typesP: "La tabla usa las etiquetas que la gente busca. Cremación, sin espera y “vida instantánea” no son siempre pólizas distintas: a menudo son gastos finales nivelados o temporal con suscripción rápida. Las edades y montos son de compañías designadas, no un máximo nacional inventado.",
      rowH1: "Tipo de seguro",
      rowH2: "Duración de la cobertura",
      rowH3: "Opciones de cobertura típicas",
      rowH4: "Edad máx. típica (solicitud nueva)",
      rowH5: "Valor en efectivo",
      rowH6: "Beneficio en efectivo (suele no ser ingreso gravable)",
      rowH7: "Primas fijas",
      scrollHint: "En pantallas pequeñas, deslice la tabla hacia un lado para ver todas las columnas.",
      overviewFoot: "Cifras educativas de productos que Mejor Vida Seguros puede cotizar (por ejemplo Mutual of Omaha Living Promise, Aetna Accendo, Transamerica Immediate Solution, Corebridge SimpliNow / GIWL). El beneficio por fallecimiento, en la mayoría de los casos, no es ingreso gravable para el beneficiario; no es asesoría fiscal. Exacto: compañía, producto, tabaco y estado.",
      yes: "Sí",
      no: "No",
      usually: "Suele",
      sometimes: "A veces",
      forever: "De por vida",
      termLen: "10–30 años",
      r1a: "Gastos finales",
      r1sub: "Vida entera simplificada / nivelado",
      r1amt: "$2,000–$50,000",
      r1age: "89",
      r1ageNote: "Accendo Level; muchas pólizas hasta 85",
      r2a: "Sin período de espera",
      r2sub: "Plan nivelado: beneficio completo desde el día 1 si califica",
      r2amt: "$2,000 o más",
      r2age: "89",
      r2ageNote: "Solo planes nivelados, no aceptación garantizada",
      r3a: "Aceptación garantizada",
      r3sub: "Pocas o ninguna pregunta de salud; espera típica de 2 años",
      r3amt: "$5,000–$25,000",
      r3age: "80",
      r3ageNote: "GIWL designada típica (p. ej. Corebridge)",
      r4a: "Seguro de cremación",
      r4sub: "Mismo producto que gastos finales: paga efectivo al beneficiario",
      r4amt: "$2,000–$50,000",
      r4age: "89",
      r4ageNote: "No es una póliza aparte en las compañías designadas",
      r5a: "Vida entera",
      r5sub: "Montos más altos que un entierro; más suscripción",
      r5amt: "$50,000 o más, según producto",
      r5age: "80",
      r5ageNote: "Varía por producto; no es el tope de gastos finales",
      r6a: "Vida temporal",
      r6sub: "Plazo fijo; al terminar, la cobertura termina",
      r6amt: "$50,000 o más, típico",
      r6age: "75",
      r6ageNote: "Muestras a 10 años; plazos más largos cortan antes",
      r7a: "Seguro de vida instantáneo",
      r7sub: "Decisión rápida: preguntas de salud y bases de datos",
      r7amt: "$50,000 o más, típico",
      r7age: "75",
      r7ageNote: "Temporal o simplificado con suscripción acelerada",
      r8a: "Protección hipotecaria",
      r8sub: "Uso del temporal para el saldo de una hipoteca",
      r8amt: "$50,000 o más, según el saldo",
      r8age: "75",
      r8ageNote: "Mismo producto que temporal, no una póliza de banco",
      feH: "Seguro de gastos finales para personas mayores",
      feP: "Es una vida entera pensada para funeral, cremación y deudas pequeñas. Las primas suelen quedar fijas y la cobertura no “vence” a los 80 como un temporal. Mutual of Omaha Living Promise Nivelado emite de 45 a 85, hasta unos $50,000. Transamerica Immediate Solution llega hasta 85. Accendo Level puede emitir hasta 89, con un tope de $25,000 a los 76–89. Si califica a un plan nivelado, un fallecimiento cubierto en el año 1 puede pagar el monto completo.",
      feK1: "Sin cita de laboratorio en los planes simplificados que cotizamos; sí hay cuestionario de salud.",
      feK2: "Montos típicos de $2,000 a $50,000 — el tamaño de un funeral, no de una hipoteca grande.",
      feK3: "Guía aparte: <a href=\"guia-seguro-entierro-mayores.html\">seguro de entierro para mayores</a>, con precios y cómo solicitarlo.",
      examH: "Seguro de vida para mayores sin examen médico",
      examP: "“Sin examen” no significa “sin preguntas”. En gastos finales simplificados no hay enfermera ni análisis de sangre en el consultorio. La aseguradora usa el cuestionario y bases de datos. Según las respuestas puede ofrecer plan nivelado (sin espera de 2 años), gradual o solo aceptación garantizada. Algunos temporales y vidas enteras también aceleran la suscripción. No es una aprobación automática.",
      examK1: "El atajo habitual para un funeral es gastos finales simplificados, no un temporal de $250,000 sin examen.",
      examK2: "La aceptación garantizada no pide examen ni (en la práctica) preguntas de salud; a cambio hay espera.",
      examK3: "Detalle en <a href=\"seguro-vida-mayores-sin-examen.html\">sin examen médico</a>.",
      waitH: "Seguro sin período de espera",
      waitP: "Es el plan <strong>nivelado</strong> de gastos finales: si la compañía lo ofrece, el beneficio completo puede aplicar desde el día 1 para fallecimiento cubierto (sujeto a exclusiones del contrato, como suicidio en un período inicial). No es un producto distinto. La aceptación garantizada y muchos planes graduales <em>sí</em> tienen espera de unos dos años para muerte no accidental.",
      waitK1: "Hay que calificar: preguntas de salud y revisión de bases de datos.",
      waitK2: "Accendo Level y Living Promise Nivelado son ejemplos de esta vía, cada uno con su edad y monto.",
      waitK3: "Más detalle en <a href=\"seguro-vida-entierro-sin-espera.html\">vida y entierro sin espera</a>.",
      giH: "Aceptación garantizada",
      giP: "Sirve cuando el cuestionario de gastos finales no da un plan nivelado. Corebridge GIWL, por ejemplo, emite en general de 50 a 80, de $5,000 a $25,000, sin preguntas de salud. Los primeros dos años, una muerte no accidental suele devolver primas pagadas más un interés contractual, no el monto completo. El accidente cubierto puede pagar el face desde el inicio. Cuesta más por dólar que un nivelado.",
      giK1: "No es el primer camino si todavía puede responder un cuestionario y calificar a nivelado.",
      giK2: "Tope de monto más bajo que Living Promise Nivelado ($50,000).",
      giK3: "Primas fijas de por vida en los productos GIWL que cotizamos.",
      cremH: "Seguro de cremación para personas mayores",
      cremP: "En las compañías designadas no hay una póliza aparte llamada “cremación”. El beneficiario recibe efectivo y puede usarlo en cremación, funeral, deudas o lo que la familia necesite. Las edades, montos y el gráfico de precios son los de gastos finales. Un prepagado en la funeraria es otro contrato: suele atarse a un proveedor y no deja el mismo efectivo libre.",
      cremK1: "Mismos rangos típicos: unos $2,000 a $50,000, según producto y edad.",
      cremK2: "Si califica a nivelado, no hay espera de 2 años solo porque la meta sea una cremación.",
      cremK3: "Compare con un <a href=\"guia-seguro-entierro-mayores.html\">plan de entierro</a> antes de prepagar solo en una funeraria.",
      wlH: "Vida entera para personas mayores",
      wlP: "Los gastos finales <em>son</em> vida entera de monto más bajo. Otras vidas enteras (montos de $50,000 o más) pueden pedir más suscripción: más preguntas, a veces laboratorios, y no siempre llegan a las mismas edades máximas que Accendo Level. Sirven si quiere un beneficio permanente mayor que un funeral — dejar dinero a un cónyuge, igualar un impuesto o un legado. El valor en efectivo crece con reglas del contrato; se puede pedir prestado, y un préstamo no pagado reduce el beneficio. No inventamos un monto de cientos de miles sin ilustración.",
      wlK1: "Cobertura diseñada para no vencer a los 10 o 20 años.",
      wlK2: "Primas típicamente fijas; más caras por dólar que el temporal.",
      wlK3: "Cotice en <a href=\"costo-seguro-vida-entera.html\">costo de vida entera</a> y confirme el producto.",
      termH: "Vida temporal para personas mayores",
      termP: "Cubre un número fijo de años (10, 15, 20, a veces 30) o hasta una edad. Cuando el plazo termina, no hay beneficio — y casi nunca le “devuelven” las primas. Un plazo de 30 años no está disponible a los 80. En nuestras muestras a 10 años, las primas ilustrativas llegan hasta los 75; plazos más largos cortan antes. Es inequívocamente más barato por dólar que gastos finales, y es un mal encaje si la meta es un funeral a los 80. Algunos productos designados aceleran la suscripción; un temporal grande todavía puede pedir más salud que un $15,000 de entierro.",
      termK1: "Útil para hipoteca o reemplazo de ingresos por un plazo que todavía exista a su edad.",
      termK2: "Sin valor en efectivo en el temporal nivelado habitual.",
      termK3: "Cotice en <a href=\"term-quote.html\">vida temporal</a>.",
      instH: "Seguro de vida “instantáneo”",
      instP: "Es una forma de comprar, no un tipo de póliza. En algunos temporales y planes simplificados, la compañía decide en minutos u horas con preguntas y bases de datos, sin cita de laboratorio. Sigue habiendo suscripción: puede haber oferta, recargo o declinación. No es aceptación garantizada. El producto que sale suele ser temporal (a veces vida entera simplificada). No publicamos un “instantáneo hasta los 85” genérico.",
      instK1: "Rápido cuando califica; no es un atajo para quien no pasa preguntas de salud.",
      instK2: "Montos más altos que gastos finales, con edades máximas más parecidas al temporal.",
      instK3: "Empiece por una <a href=\"quote.html\">cotización</a> o <a href=\"term-quote.html\">temporal</a>.",
      mortH: "Protección hipotecaria",
      mortP: "En la práctica es vida temporal (a veces de capital decreciente) dimensionada al saldo del préstamo. El beneficio va al beneficiario, no automáticamente al banco, salvo que haya una cesión. Si el saldo es menor que el face, el resto suele quedar en la familia. Las edades y plazos son los del temporal: a los 80 ya casi no hay plazo largo. No es un producto de gastos finales.",
      mortK1: "Sume el saldo actual; no un anuncio de “$250,000 para todos”.",
      mortK2: "Primas suelen ser fijas durante el plazo del temporal nivelado.",
      mortK3: "Use el <a href=\"term-quote.html\">cotizador de temporal</a> con el plazo que aún exista a su edad.",
      ulH: "¿Y la vida universal?",
      ulP: "Algunas compañías designadas tienen vida universal garantizada (GUL) por ilustración: beneficio permanente con prima ilustrada, no el mismo “caja de entierro” que gastos finales. Mejor Vida Seguros no cotiza IUL (indexada) como producto de nuevo negocio. La GUL puede costar menos que una vida entera tradicional porque hay menos garantías de valor en efectivo; también puede caducar si las primas o el valor no se sostienen. Se confirma caso por caso, no con una tabla genérica de precios.",
      ulK1: "No es el producto típico de funeral a los 80.",
      ulK2: "Requiere ilustración; no hay una prima “de menú” fiable en esta página.",
      over80H: "¿Se puede comprar después de los 80?",
      over80P: "Sí. En gastos finales de compañías designadas todavía hay opciones. Un temporal de 10 años a veces existe a los 80; a los 81 en adelante el temporal nuevo suele desaparecer. Precios más altos y montos a veces topeados (Accendo $25,000 a edades 76–89). Vida entera tradicional y GUL, si existen, se ilustran — no se asumen. Vea <a href=\"seguro-vida-mayores-80.html\">mayores de 80</a>.",
      over85H: "¿Se puede comprar después de los 85?",
      over85P: "Hay menos compañías. El producto que publicamos es gastos finales nivelados: Accendo Level puede emitir hasta 89, con un tope de $25,000. No publicamos emisión nueva de gastos finales a los 90. A esa edad el precio sube tanto que, para algunas familias, ahorrar o un prepagado funerario puede compararse con la prima. Vea <a href=\"seguro-vida-mayores-85.html\">mayores de 85</a>.",
      ageLimH: "¿Hay un límite de edad para el seguro de vida?",
      ageLimP: "No hay un único tope nacional de “90 años” que podamos anunciar para todas las compañías. Cada producto fija el suyo. Gastos finales: a menudo 85; Accendo Level 89. Aceptación garantizada designada: en GIWL, en general 80. Temporal: suele cortar antes, y el plazo largo desaparece primero. Detalle por producto en <a href=\"limite-edad-seguro-vida.html\">límite de edad</a>.",
      costH: "Cuánto cuesta el seguro de vida para personas mayores",
      costP: "El precio sube con la edad, el sexo, el tabaco y la salud. El tipo de póliza mueve más el número que el código postal. Use las pestañas: gastos finales y aceptación garantizada en $5,000 / $10,000 / $25,000; vida entera en las mismas bandas; temporal a 10 años en $100,000 y $250,000. A los 50, un $10,000 nivelado de gastos finales suele estar cerca de <strong>$28 / $34</strong> al mes (mujer / hombre, no fumador). Un temporal de 10 años por $100,000 ronda <strong>$14 / $15</strong> a esa edad — es otro producto, no un entierro.",
      tabFe: "Gastos finales",
      tabGi: "Aceptación garantizada",
      tabWl: "Vida entera",
      tabTerm: "Temporal (10 años)",
      bestH: "¿Qué tipo conviene?",
      bestP: "Para la mayoría de las personas mayores cuya meta es el funeral, el encaje habitual es gastos finales nivelados. Si queda hipoteca o aún hay ingresos que proteger por un plazo, el temporal suele rendir más por dólar — si todavía hay plazo a su edad.",
      bestRule: "La regla sencilla:",
      best1: "<strong>Necesidad temporal</strong> (hipoteca o ingresos por un plazo): vida temporal, si todavía hay plazo a su edad.",
      best2: "<strong>Necesidad permanente</strong> (funeral, deudas que no vencen, dejar dinero): gastos finales u otra vida entera.",
      bestNote: "La salud y el presupuesto deciden si hay plan nivelado, gradual o solo aceptación garantizada. Mejor Vida Seguros compara compañías designadas; no hay un “mejor” único para todo el mundo.",
      whyH: "Por qué algunas personas mayores compran seguro de vida",
      whyP: "No todo el mundo lo necesita — a los 70 suele haber menos deudas que a los 35. Suele tener sentido si quiere:",
      why1: "Dejar dinero para funeral o cremación, sin cargar a la familia.",
      why2: "Ayudar a un cónyuge con gastos del día a día o deudas pequeñas.",
      why3: "Cubrir el saldo de una hipoteca por un plazo, con temporal, si aún califica.",
      why4: "Dejar un regalo a un hijo, una iglesia o una organización, con un monto que sí pueda pagar cada mes.",
      howMuchH: "¿Cuánta cobertura conviene?",
      howMuchP: "Sume lo que quiere cubrir, no un número de anuncio. Un funeral sencillo suele estar cerca de $10,000 a $25,000; una cremación directa a menudo menos. Si queda hipoteca, el saldo es el punto de partida para temporal. No sume “por si acaso” hasta un monto que no pueda pagar cada mes: una póliza que caduca no sirve al funeral.",
      keyH: "Puntos clave",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Quién califica?",
      faq1a: "Quien esté en la edad de emisión del producto, en un estado donde Mejor Vida Seguros pueda cotizar, y pase la suscripción. La salud decide el plan. Los estados con licencia están en <a href=\"licencias.html\">licencias</a>.",
      faq2q: "¿Puedo comprar con condiciones de salud previas?",
      faq2a: "A menudo sí, en gastos finales simplificados: hay preguntas, no un examen en el consultorio. Si no califica a un plan nivelado, puede haber gradual o aceptación garantizada (con espera). Vea <a href=\"seguro-vida-mayores-sin-examen.html\">sin examen médico</a>.",
      faq3q: "¿Medicare, Medicaid o el Seguro Social pagan un seguro de vida?",
      faq3a: "No son un seguro de vida ni pagan la prima. Medicare no cubre un funeral típico. El Seguro Social puede pagar un único pago de $255 por fallecimiento en casos muy limitados; no reemplaza una póliza. Medicaid no es un producto de vida.",
      faq4q: "¿El seguro de vida cubre cuidados a largo plazo?",
      faq4a: "El beneficio por fallecimiento no es un plan de cuidados a largo plazo. Algunos permanentes tienen riders de beneficios en vida (enfermedad terminal o crónica); se ilustran caso por caso y no se añaden después a cualquier póliza. No es un sustituto automático de una póliza de LTC.",
      faq5q: "¿El beneficio paga impuestos?",
      faq5a: "En la mayoría de los casos el pago al beneficiario no es ingreso gravable. No es asesoría fiscal. Un contador revisa patrimonios grandes u otros bienes.",
      faq6q: "¿Tengo que comprar la marca de televisión o de correo?",
      faq6a: "No. Mejor Vida Seguros es una agencia independiente: compara compañías designadas (por ejemplo Mutual of Omaha, Aetna Accendo, Transamerica) según su edad y salud.",
      faq7q: "¿Hasta qué edad se puede comprar?",
      faq7a: "Depende del producto. Gastos finales: a menudo hasta 85; Accendo Level hasta 89. La aceptación garantizada designada típica corta cerca de 80. El temporal corta antes. Vea <a href=\"limite-edad-seguro-vida.html\">límite de edad</a>.",
      faq8q: "¿El temporal sirve para el funeral?",
      faq8a: "Suele ser un mal encaje. El plazo termina; el funeral no. Para entierro, el producto habitual que cotizamos es gastos finales.",
      faq9q: "¿Cremación, entierro y gastos finales son pólizas distintas?",
      faq9a: "En las compañías que cotizamos, no. Cremación y entierro describen el uso del dinero. Gastos finales es el producto: vida entera de monto más bajo que paga efectivo al beneficiario.",
      faq10q: "¿Qué ocurre durante un período de espera?",
      faq10a: "En aceptación garantizada y en muchos planes graduales, una muerte no accidental en los primeros dos años suele devolver primas más un interés del contrato, no el face completo. Un accidente cubierto puede pagar el face. El plan nivelado, si lo ofrecen, no usa esa espera de 2 años.",
      faq11q: "¿Puedo tener cobertura el mismo día?",
      faq11a: "Algunos temporales y planes simplificados dan una decisión rápida. Sigue habiendo preguntas de salud. “Instantáneo” no es aceptación garantizada. La cobertura efectiva sigue las reglas de la póliza y del pago de la primera prima.",
      faq12q: "¿La protección hipotecaria la cobra el banco?",
      faq12a: "Salvo una cesión, el beneficiario recibe el efectivo y puede pagar el préstamo. Es temporal dimensionado al saldo, no un producto de gastos finales ni un seguro del prestamista.",
      nextH: "Siguiente paso",
      nextP: `Para ver precios según su edad y salud, <a href="quote.html">obtenga una cotización gratuita</a> o llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a>.`,
      discTitle: "Divulgación",
      discBody: "Esta página es educativa, no una oferta. Edades, montos y primas cambian según compañía, producto, tabaco y estado. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Los estados con licencia actuales están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotización",
      quote1: "Compañías designadas",
      quote2: "Nivelado o con espera",
      quote3: PHONE,
      quoteCta: "Ver precios",
    };
  }
  return {
    title: "Complete Life Insurance Guide for Seniors (2026) | Mejor Vida Insurance",
    desc: "Life insurance types for seniors, appointed-company issue ages, and illustrative premiums for final expense, whole life, and term.",
    h1: "Life insurance for seniors: a complete guide",
    lead: "Life insurance for seniors uses the same policy types as coverage at 40 — whole life, term, final expense — but there are fewer term lengths, smaller amounts, higher premiums, and more health questions. This guide compares what Mejor Vida Insurance quotes, including the names people search (burial, cremation, no waiting period, mortgage) even when several of those names are the same product.",
    crumbEnd: "Life insurance for seniors",
    take1: "For a funeral or cremation, the usual path is <strong>final expense</strong>: smaller whole life, health questions, no in-office exam.",
    take2: "<strong>Term</strong> fits a high amount for a set number of years (a mortgage or income). It is not the typical burial product after 70.",
    take3: "Many appointed companies issue final expense through age <strong>85</strong>. Accendo Level can go through <strong>89</strong>, with a $25,000 cap at ages 76–89. We do not publish new final expense issue at age 90.",
    callout: "Premiums on this page come from the Mejor Vida Insurance quoter (appointed companies). They are not an offer. Actual price depends on age, health, tobacco, and state.",
    typesH: "Types of life insurance for seniors",
    typesP: "The table uses the labels people search. Cremation, no-waiting-period, and “instant life” are not always separate policies — they are often level final expense or fast-underwritten term. Ages and amounts are from appointed companies, not an invented national maximum.",
    rowH1: "Life insurance type",
    rowH2: "Coverage length",
    rowH3: "Typical coverage options",
    rowH4: "Typical new-applicant max. age",
    rowH5: "Cash value",
    rowH6: "Tax-free cash death benefit",
    rowH7: "Fixed premiums",
    scrollHint: "On a small screen, swipe the table sideways to see every column.",
    overviewFoot: "Educational figures from products Mejor Vida Insurance can quote (for example Mutual of Omaha Living Promise, Aetna Accendo, Transamerica Immediate Solution, Corebridge SimpliNow / GIWL). The death benefit is usually not taxable income to the beneficiary; this is not tax advice. Exact issue ages and amounts depend on company, product, tobacco, and state.",
    yes: "Yes",
    no: "No",
    usually: "Usually",
    sometimes: "Sometimes",
    forever: "For life",
    termLen: "10–30 years",
    r1a: "Final expense insurance",
    r1sub: "Simplified-issue / level whole life",
    r1amt: "$2,000–$50,000",
    r1age: "89",
    r1ageNote: "Accendo Level; many plans through 85",
    r2a: "No-waiting-period insurance",
    r2sub: "Level plan: full benefit from day 1 if you qualify",
    r2amt: "$2,000+",
    r2age: "89",
    r2ageNote: "Level plans only — not guaranteed acceptance",
    r3a: "Guaranteed acceptance",
    r3sub: "Few or no health questions; typical 2-year wait",
    r3amt: "$5,000–$25,000",
    r3age: "80",
    r3ageNote: "Typical appointed GIWL (e.g. Corebridge)",
    r4a: "Cremation insurance",
    r4sub: "Same product as final expense: cash to the beneficiary",
    r4amt: "$2,000–$50,000",
    r4age: "89",
    r4ageNote: "Not a separate policy at appointed companies",
    r5a: "Whole life insurance",
    r5sub: "Larger amounts than burial; more underwriting",
    r5amt: "$50,000 or more, by product",
    r5age: "80",
    r5ageNote: "Varies by product; not the final-expense ceiling",
    r6a: "Term life insurance",
    r6sub: "Set number of years; coverage ends when the term ends",
    r6amt: "$50,000+, typical",
    r6age: "75",
    r6ageNote: "10-year samples; longer terms cut off earlier",
    r7a: "Instant life insurance",
    r7sub: "Fast decision: health questions and databases",
    r7amt: "$50,000+, typical",
    r7age: "75",
    r7ageNote: "Accelerated term or simplified issue",
    r8a: "Mortgage protection",
    r8sub: "Term sized to a remaining mortgage balance",
    r8amt: "$50,000+, by loan balance",
    r8age: "75",
    r8ageNote: "Same product as term — not a bank policy",
    feH: "Final expense insurance for seniors",
    feP: "It is whole life meant for a funeral, cremation, and small debts. Premiums are typically locked in, and coverage does not “expire at 80” the way a term policy can. Mutual of Omaha Living Promise Level issues ages 45–85, up to about $50,000. Transamerica Immediate Solution goes through 85. Accendo Level can issue through 89, with a $25,000 cap at ages 76–89. If you qualify for a level plan, a covered death in year 1 can pay the full amount.",
    feK1: "No lab appointment on the simplified plans we quote; there is a health questionnaire.",
    feK2: "Typical amounts $2,000–$50,000 — funeral-sized, not a large mortgage.",
    feK3: "Full guide: <a href=\"burial-insurance-seniors.html\">burial insurance for seniors</a>, with prices and how to apply.",
    examH: "No-medical-exam life insurance for seniors",
    examP: "“No exam” is not “no questions.” On simplified final expense there is no nurse visit and no in-office bloodwork. The insurer uses the questionnaire and databases. Answers can lead to a level plan (no 2-year wait), a graded plan, or only guaranteed acceptance. Some term and whole life products also accelerate underwriting. Approval is not automatic.",
    examK1: "The usual funeral shortcut is simplified final expense, not a $250,000 no-exam term.",
    examK2: "Guaranteed acceptance skips the exam and, in practice, the health questions — in exchange for a wait.",
    examK3: "Detail on <a href=\"life-insurance-seniors-no-medical-exam.html\">no medical exam</a>.",
    waitH: "No-waiting-period insurance",
    waitP: "This is the <strong>level</strong> final expense plan: if the company offers it, the full benefit can apply from day 1 for a covered death (subject to contract exclusions, such as suicide during an early period). It is not a separate product. Guaranteed acceptance and many graded plans <em>do</em> have about a two-year wait for non-accidental death.",
    waitK1: "You still have to qualify: health questions and database review.",
    waitK2: "Accendo Level and Living Promise Level are examples of this path, each with its own ages and amounts.",
    waitK3: "More detail in <a href=\"no-waiting-period-life-burial.html\">life and burial with no waiting period</a>.",
    giH: "Guaranteed acceptance",
    giP: "This path is for when the final-expense questionnaire will not support a level plan. Corebridge GIWL, for example, typically issues ages 50–80, $5,000–$25,000, with no health questions. For the first two years, a non-accidental death usually returns premiums paid plus contractual interest — not the full face. A covered accident can pay the face from the start. It costs more per dollar than a level plan.",
    giK1: "It is not the first path if you can still answer a questionnaire and qualify for level.",
    giK2: "Lower amount cap than Living Promise Level ($50,000).",
    giK3: "Premiums stay level for life on the GIWL products we quote.",
    cremH: "Cremation insurance for seniors",
    cremP: "At appointed companies there is not a separate policy titled “cremation.” The beneficiary receives cash and can use it for cremation, a funeral, debts, or whatever the family needs. Issue ages, amounts, and the price chart are the final-expense figures. A funeral-home prepaid contract is different: it is often tied to one provider and does not leave the same unrestricted cash.",
    cremK1: "Same typical ranges: about $2,000–$50,000, by product and age.",
    cremK2: "If you qualify for level, there is no 2-year wait just because the goal is cremation.",
    cremK3: "Compare with a <a href=\"burial-insurance-seniors.html\">burial plan</a> before prepaying only at a funeral home.",
    wlH: "Whole life insurance for seniors",
    wlP: "Final expense <em>is</em> smaller whole life. Other whole life ($50,000 or more) can need more underwriting: more questions, sometimes labs, and not always the same maximum ages as Accendo Level. It fits if you want a permanent benefit larger than a funeral — money for a spouse, an estate cost, or a gift. Cash value grows under contract rules; you can borrow against it, and an unpaid loan reduces the death benefit. We do not invent a six-figure amount without an illustration.",
    wlK1: "Coverage designed not to expire after 10 or 20 years.",
    wlK2: "Premiums typically stay level; more expensive per dollar than term.",
    wlK3: "Quote on <a href=\"whole-life-cost.html\">whole life cost</a> and confirm the product.",
    termH: "Term life insurance for seniors",
    termP: "It covers a set number of years (10, 15, 20, sometimes 30) or until a stated age. When the term ends, there is no benefit — and you almost never get the premiums back. A 30-year term is not available at 80. On our 10-year samples, illustrative premiums run through age 75; longer terms cut off earlier. Term is unequivocally cheaper per dollar than final expense, and it is a poor fit if the goal is a funeral at 80. Some appointed products accelerate underwriting; a large term policy can still ask more health questions than a $15,000 burial plan.",
    termK1: "Useful for a mortgage or income replacement for a term that still exists at your age.",
    termK2: "No cash value on ordinary level term.",
    termK3: "Quote <a href=\"term-quote.html\">term life</a>.",
    instH: "Instant life insurance",
    instP: "This is a way to buy, not a separate policy type. On some term and simplified products, the company decides in minutes or hours using questions and databases, with no lab appointment. Underwriting still happens: you can be offered, rated, or declined. It is not guaranteed acceptance. The policy that comes back is usually term (sometimes simplified whole life). We do not publish a generic “instant through age 85” claim.",
    instK1: "Fast when you qualify; not a shortcut if health questions will not pass.",
    instK2: "Higher amounts than final expense, with maximum ages closer to term.",
    instK3: "Start with a <a href=\"quote.html\">quote</a> or <a href=\"term-quote.html\">term quote</a>.",
    mortH: "Mortgage protection",
    mortP: "In practice this is term life (sometimes decreasing term) sized to the remaining loan. The benefit goes to the beneficiary, not automatically to the bank, unless there is an assignment. If the balance is smaller than the face amount, the rest usually stays with the family. Ages and term lengths are the term-life rules: by 80 a long term is rarely still for sale. It is not a final-expense product.",
    mortK1: "Add up the current balance — not an ad that says “$250,000 for everyone.”",
    mortK2: "Premiums are usually level for the length of a level term.",
    mortK3: "Use the <a href=\"term-quote.html\">term quoter</a> with a length that still exists at your age.",
    ulH: "What about universal life?",
    ulP: "Some appointed companies offer guaranteed universal life (GUL) by illustration: a permanent benefit with an illustrated premium, not the same “funeral box” as final expense. Mejor Vida Insurance does not quote IUL (indexed universal life) as a new-business product. GUL can cost less than traditional whole life because there are fewer cash-value guarantees; it can also lapse if premiums or value are not maintained. We confirm it case by case, not with a generic price table.",
    ulK1: "Not the typical funeral product at 80.",
    ulK2: "Needs an illustration; there is no reliable menu premium on this page.",
    over80H: "Can seniors over 80 get life insurance?",
    over80P: "Yes. Appointed final expense options still exist. A 10-year term sometimes exists at 80; from 81 onward, new term usually disappears. Prices are higher and amounts can be capped (Accendo $25,000 at ages 76–89). Traditional whole life and GUL, if available, are illustrated — not assumed. See <a href=\"life-insurance-seniors-over-80.html\">seniors over 80</a>.",
    over85H: "Can seniors over 85 get life insurance?",
    over85P: "Fewer companies. The product we publish is level final expense: Accendo Level can issue through 89, with a $25,000 cap. We do not publish new final expense issue at age 90. At those ages the price can be high enough that, for some families, saving or a funeral-home prepay is worth comparing with the premium. See <a href=\"life-insurance-seniors-over-85.html\">seniors over 85</a>.",
    ageLimH: "Is there an age limit for life insurance?",
    ageLimP: "There is no single U.S. “age 90” cutoff we can advertise for every company. Each product sets its own. Final expense: often 85; Accendo Level 89. Appointed guaranteed acceptance: GIWL typically 80. Term usually cuts off earlier, and long term lengths disappear first. Product-by-product detail is on the <a href=\"life-insurance-age-limit.html\">age limit</a> page.",
    costH: "How much does life insurance for seniors cost?",
    costP: "Price rises with age, sex, tobacco, and health. Policy type moves the number more than ZIP code. Use the tabs: final expense and guaranteed acceptance at $5,000 / $10,000 / $25,000; whole life on the same bands; 10-year term at $100,000 and $250,000. At 50, a level $10,000 final expense plan is often near <strong>$28 / $34</strong> a month (female / male, non-tobacco). A 10-year $100,000 term is near <strong>$14 / $15</strong> at that age — a different product, not a burial plan.",
    tabFe: "Final expense",
    tabGi: "Guaranteed acceptance",
    tabWl: "Whole life",
    tabTerm: "Term (10-year)",
    bestH: "Which type is best for seniors?",
    bestP: "For most seniors whose goal is the funeral, the usual fit is level final expense. If a mortgage remains, or income still needs replacing for a set period, term usually buys more dollars of coverage — if a term length still exists at your age.",
    bestRule: "A simple rule:",
    best1: "<strong>Temporary need</strong> (a mortgage or income for a set period): term, if a term length still fits your age.",
    best2: "<strong>Permanent need</strong> (a funeral, debts that do not expire, leaving money): final expense or other whole life.",
    bestNote: "Health and budget decide whether you get level, graded, or only guaranteed acceptance. Mejor Vida Insurance compares appointed companies; there is no single “best” for everyone.",
    whyH: "Why some seniors buy life insurance",
    whyP: "Not everyone needs it — at 70 there are often fewer debts than at 35. It often makes sense if you want to:",
    why1: "Leave money for a funeral or cremation so the family is not stuck with the bill.",
    why2: "Help a surviving spouse with day-to-day costs or small debts.",
    why3: "Cover a remaining mortgage for a set period, with term, if you still qualify.",
    why4: "Leave a gift to a child, a church, or an organization, at an amount you can actually pay each month.",
    howMuchH: "How much life insurance should seniors get?",
    howMuchP: "Add up what you want to cover — not an ad number. A simple funeral is often about $10,000 to $25,000; a direct cremation is often less. If a mortgage remains, the balance is the starting point for term. Do not pad the amount until the monthly premium is more than you can pay: a lapsed policy does not help with a funeral.",
    keyH: "Key features",
    faqTitle: "Frequently asked questions",
    faq1q: "Who qualifies?",
    faq1a: "Someone in the product’s issue-age range, in a state Mejor Vida Insurance can quote, who passes underwriting. Health decides the plan. Licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    faq2q: "Can seniors with pre-existing conditions get life insurance?",
    faq2a: "Often yes, on simplified final expense: there are questions, not an in-office exam. If you cannot qualify for a level plan, graded or guaranteed acceptance (with a wait) may still exist. See <a href=\"life-insurance-seniors-no-medical-exam.html\">no medical exam</a>.",
    faq3q: "Does Social Security, Medicaid, or Medicare help with life insurance?",
    faq3a: "They are not life insurance and they do not pay the premium. Medicare does not pay a typical funeral. Social Security may pay a one-time $255 death payment in limited cases; it does not replace a policy. Medicaid is not a life product.",
    faq4q: "Does life insurance cover long-term care?",
    faq4a: "The death benefit is not a long-term care plan. Some permanent products have living-benefit riders (terminal or chronic illness); those are illustrated case by case and are not added later to every policy. It is not an automatic substitute for an LTC policy.",
    faq5q: "Is the death benefit taxed?",
    faq5a: "In most cases the payment to the beneficiary is not taxable income. This is not tax advice. A CPA should review large estates or other assets.",
    faq6q: "Do I have to buy a TV or mail-order brand?",
    faq6a: "No. Mejor Vida Insurance is an independent agency: we compare appointed companies (for example Mutual of Omaha, Aetna Accendo, Transamerica) for your age and health.",
    faq7q: "Until what age can I buy?",
    faq7a: "It depends on the product. Final expense: often through 85; Accendo Level through 89. Typical appointed guaranteed acceptance cuts off near 80. Term cuts off earlier. See the <a href=\"life-insurance-age-limit.html\">age limit</a> guide.",
    faq8q: "Is term a good way to cover a funeral?",
    faq8a: "It is usually a poor fit. The term ends; the funeral does not. For burial, the product we typically quote is final expense.",
    faq9q: "Are cremation, burial, and final expense different policies?",
    faq9a: "At the companies we quote, no. Cremation and burial describe how the money is used. Final expense is the product: smaller whole life that pays cash to the beneficiary.",
    faq10q: "What happens during a waiting period?",
    faq10a: "On guaranteed acceptance and many graded plans, a non-accidental death in the first two years usually returns premiums plus contract interest, not the full face. A covered accident can pay the face. A level plan, if offered, does not use that 2-year wait.",
    faq11q: "Can I get coverage the same day?",
    faq11a: "Some term and simplified plans return a fast decision. Health questions still apply. “Instant” is not guaranteed acceptance. Effective coverage still follows the policy and first-premium rules.",
    faq12q: "Does mortgage protection pay the bank automatically?",
    faq12a: "Unless there is an assignment, the beneficiary receives the cash and can pay the loan. It is term sized to the balance — not final expense and not lender-sold insurance.",
    nextH: "Next step",
    nextP: `To see prices for your age and health, <a href="quote.html">get a free quote</a> or call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a>.`,
    discTitle: "Disclosure",
    discBody: "This page is educational, not an offer. Ages, amounts, and premiums change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "Get a quote",
    quote1: "Appointed companies",
    quote2: "Level or with a wait",
    quote3: PHONE,
    quoteCta: "See prices",
  };
}

function faceTabs(faces) {
  return faces
    .map((face, i) => {
      const label = "$" + Number(face).toLocaleString("en-US");
      const on = i === 0;
      return `<button type="button" class="lic-face-tab${on ? " is-active" : ""}" data-lic-face="${face}" role="tab" aria-selected="${on ? "true" : "false"}">${label}</button>`;
    })
    .join("\n");
}

function ratePanel(opts) {
  const { product, term, quote, faces, ageCol, female, male } = opts;
  const termAttr = term ? ` data-lic-term="${term}"` : "";
  return `<div class="lic-product-tabs" data-lic-product="${product}"${termAttr} data-lic-quote-href="${quote}">
<div class="lic-face-tabs" role="tablist">
${faceTabs(faces)}
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</div>`;
}

function keyBox(c, items) {
  return `<div class="lic-hub-key"><h3>${c.keyH}</h3><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></div>`;
}

function compareRow(c, n, href, lasts, cv, tax, prem) {
  return `<tr>
<th scope="row"><a href="${href}">${c["r" + n + "a"]}</a><span class="lic-compare-sub">${c["r" + n + "sub"]}</span></th>
<td data-label="${c.rowH2}">${lasts}</td>
<td data-label="${c.rowH3}">${c["r" + n + "amt"]}</td>
<td data-label="${c.rowH4}"><span class="lic-compare-age">${c["r" + n + "age"]}</span><span class="lic-compare-age-note">${c["r" + n + "ageNote"]}</span></td>
<td data-label="${c.rowH5}">${cv}</td>
<td data-label="${c.rowH6}">${tax}</td>
<td data-label="${c.rowH7}">${prem}</td>
</tr>`;
}

function hubMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const burial = isEs ? "guia-seguro-entierro-mayores.html" : "burial-insurance-seniors.html";
  const exam = isEs ? "seguro-vida-mayores-sin-examen.html" : "life-insurance-seniors-no-medical-exam.html";
  const over80 = isEs ? "seguro-vida-mayores-80.html" : "life-insurance-seniors-over-80.html";
  const over85 = isEs ? "seguro-vida-mayores-85.html" : "life-insurance-seniors-over-85.html";
  const age = isEs ? "limite-edad-seguro-vida.html" : "life-insurance-age-limit.html";
  const female = isEs ? "Mujer" : "Female";
  const male = isEs ? "Hombre" : "Male";
  const ageCol = isEs ? "Edad" : "Age";
  const feFaces = [5000, 10000, 25000];
  const termFaces = [100000, 250000];
  const quoteFe = "quote.html";
  const quoteTerm = "term-quote.html";
  const Y = c.yes;
  const N = c.no;

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
<div class="lic-layout lic-layout--split lic-layout--clear lic-layout--hub">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#types">${isEs ? "Tipos" : "Types"}</a>
<a href="#final-expense">${isEs ? "Gastos finales" : "Final expense"}</a>
<a href="#over-80">${isEs ? "Después de 80" : "Over 80"}</a>
<a href="#cost">${isEs ? "Precios" : "Cost"}</a>
<a href="#best">${isEs ? "Cuál elegir" : "Which type"}</a>
<a href="#faq">${isEs ? "Preguntas" : "FAQ"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Puntos clave" : "Key points"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<div class="lic-helpful"><p>${c.callout}</p></div>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2, cta: c.quoteCta })}
<section class="lic-compare-band" id="types">
<div class="lic-compare-inner">
<h2>${c.typesH}</h2>
<p>${c.typesP}</p>
<p class="lic-compare-scroll-hint">${c.scrollHint}</p>
<div class="lic-compare-wrap" role="region" tabindex="0" aria-label="${c.typesH}">
<table class="lic-compare-table">
<thead>
<tr>
<th scope="col">${c.rowH1}</th>
<th scope="col">${c.rowH2}</th>
<th scope="col">${c.rowH3}</th>
<th scope="col">${c.rowH4}</th>
<th scope="col">${c.rowH5}</th>
<th scope="col">${c.rowH6}</th>
<th scope="col">${c.rowH7}</th>
</tr>
</thead>
<tbody>
${compareRow(c, 1, "#final-expense", c.forever, Y, Y, Y)}
${compareRow(c, 2, "#no-waiting", c.forever, Y, Y, Y)}
${compareRow(c, 3, "#guaranteed", c.forever, Y, Y, Y)}
${compareRow(c, 4, "#cremation", c.forever, Y, Y, Y)}
${compareRow(c, 5, "#whole-life", c.forever, Y, Y, Y)}
${compareRow(c, 6, "#term", c.termLen, N, Y, c.usually)}
${compareRow(c, 7, "#instant", c.termLen, c.sometimes, Y, c.usually)}
${compareRow(c, 8, "#mortgage", c.termLen, N, Y, c.usually)}
</tbody>
</table>
</div>
<p class="lic-compare-foot">${c.overviewFoot}</p>
</div>
</section>
<div class="lic-main lic-main--after-compare">
<section class="lic-section" id="final-expense">
<h2>${c.feH}</h2>
<p>${c.feP}</p>
${keyBox(c, [c.feK1, c.feK2, c.feK3])}
</section>
<section class="lic-section" id="no-exam">
<h2>${c.examH}</h2>
<p>${c.examP}</p>
${keyBox(c, [c.examK1, c.examK2, c.examK3])}
</section>
<section class="lic-section" id="no-waiting">
<h2>${c.waitH}</h2>
<p>${c.waitP}</p>
${keyBox(c, [c.waitK1, c.waitK2, c.waitK3])}
</section>
<section class="lic-section" id="guaranteed">
<h2>${c.giH}</h2>
<p>${c.giP}</p>
${keyBox(c, [c.giK1, c.giK2, c.giK3])}
</section>
<section class="lic-section" id="cremation">
<h2>${c.cremH}</h2>
<p>${c.cremP}</p>
${keyBox(c, [c.cremK1, c.cremK2, c.cremK3])}
</section>
<section class="lic-section" id="whole-life">
<h2>${c.wlH}</h2>
<p>${c.wlP}</p>
${keyBox(c, [c.wlK1, c.wlK2, c.wlK3])}
</section>
<section class="lic-section" id="term">
<h2>${c.termH}</h2>
<p>${c.termP}</p>
${keyBox(c, [c.termK1, c.termK2, c.termK3])}
</section>
<section class="lic-section" id="instant">
<h2>${c.instH}</h2>
<p>${c.instP}</p>
${keyBox(c, [c.instK1, c.instK2, c.instK3])}
</section>
<section class="lic-section" id="mortgage">
<h2>${c.mortH}</h2>
<p>${c.mortP}</p>
${keyBox(c, [c.mortK1, c.mortK2, c.mortK3])}
</section>
<section class="lic-section" id="universal">
<h2>${c.ulH}</h2>
<p>${c.ulP}</p>
${keyBox(c, [c.ulK1, c.ulK2])}
</section>
<section class="lic-section" id="over-80">
<h2>${c.over80H}</h2>
<p>${c.over80P}</p>
</section>
<section class="lic-section" id="over-85">
<h2>${c.over85H}</h2>
<p>${c.over85P}</p>
</section>
<section class="lic-section" id="age-limit">
<h2>${c.ageLimH}</h2>
<p>${c.ageLimP}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<div class="lic-meta lic-meta--rates">
<div class="lic-meta-tabs" role="tablist">
<button type="button" class="lic-meta-tab is-active" data-lic-meta="fe" role="tab" aria-selected="true">${c.tabFe}</button>
<button type="button" class="lic-meta-tab" data-lic-meta="gi" role="tab" aria-selected="false">${c.tabGi}</button>
<button type="button" class="lic-meta-tab" data-lic-meta="wl" role="tab" aria-selected="false">${c.tabWl}</button>
<button type="button" class="lic-meta-tab" data-lic-meta="term" role="tab" aria-selected="false">${c.tabTerm}</button>
</div>
<div class="lic-meta-panel is-active" data-lic-meta-panel="fe">
${ratePanel({ product: "fe", quote: quoteFe, faces: feFaces, ageCol, female, male })}
</div>
<div class="lic-meta-panel" data-lic-meta-panel="gi" hidden>
${ratePanel({ product: "gi", quote: quoteFe, faces: feFaces, ageCol, female, male })}
</div>
<div class="lic-meta-panel" data-lic-meta-panel="wl" hidden>
${ratePanel({ product: "whole", quote: quoteFe, faces: feFaces, ageCol, female, male })}
</div>
<div class="lic-meta-panel" data-lic-meta-panel="term" hidden>
${ratePanel({ product: "term", term: "10", quote: quoteTerm, faces: termFaces, ageCol, female, male })}
</div>
</div>
</section>
<section class="lic-section" id="best">
<h2>${c.bestH}</h2>
<p>${c.bestP}</p>
<p>${c.bestRule}</p>
<ul>
<li>${c.best1}</li>
<li>${c.best2}</li>
</ul>
<p>${c.bestNote}</p>
</section>
<section class="lic-section" id="why">
<h2>${c.whyH}</h2>
<p>${c.whyP}</p>
<ul>
<li>${c.why1}</li>
<li>${c.why2}</li>
<li>${c.why3}</li>
<li>${c.why4}</li>
</ul>
</section>
<section class="lic-section" id="how-much">
<h2>${c.howMuchH}</h2>
<p>${c.howMuchP}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  .map(
    (n, i) =>
      `<details${i === 0 ? " open" : ""}><summary>${c["faq" + n + "q"]}</summary><p>${c["faq" + n + "a"]}</p></details>`
  )
  .join("\n")}
</section>
<section class="lic-section" id="next">
<h2>${c.nextH}</h2>
<p>${c.nextP}</p>
</section>
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<p class="lic-rate-note"><a href="${burial}">${isEs ? "Guía de entierro" : "Burial guide"}</a> · <a href="${exam}">${isEs ? "Sin examen médico" : "No medical exam"}</a> · <a href="${age}">${isEs ? "Límite de edad" : "Age limit"}</a> · <a href="${over80}">${isEs ? "Mayores de 80" : "Seniors over 80"}</a> · <a href="${over85}">${isEs ? "Mayores de 85" : "Seniors over 85"}</a></p>
</div>
</div>
</main>`;
}

module.exports = { copyHub, hubMain };
