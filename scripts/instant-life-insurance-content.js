"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

function copyInstant(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title:
        "Seguro de vida de emisión inmediata: decisión en minutos (2026) | Mejor Vida Seguros",
      desc: "Qué significa “inmediato” en un seguro de vida, cómo la compañía decide en minutos sin examen médico, cuándo empieza de verdad la cobertura, montos, edades y primas ilustrativas de compañías designadas.",
      h1: "Seguro de vida de emisión inmediata: la decisión llega en minutos, no en semanas",
      lead: "“Inmediato” describe la respuesta de la aseguradora, no el día en que usted queda cubierto. Usted responde preguntas de salud, la compañía revisa sus registros de forma electrónica y devuelve una decisión —a veces mientras usted sigue en la llamada— sin examen médico ni análisis de sangre.",
      crumbEnd: "Emisión inmediata",

      take1:
        "Lo inmediato es la <strong>decisión de suscripción</strong>. La cobertura empieza cuando la póliza se emite y usted paga la primera prima, no en el momento en que aprieta “enviar”.",
      take2:
        "En las compañías designadas de Mejor Vida Seguros, una solicitud electrónica de gastos finales puede resolverse <strong>en minutos</strong>; un plazo con suscripción acelerada suele tardar <strong>48 a 72 horas</strong>.",
      take3:
        "Rápido no significa “sin preguntas”. Solo el plan de <strong>aceptación garantizada</strong> no pregunta por su salud, y ese plan trae una <strong>espera de dos años</strong> por muerte natural.",
      callout:
        "Si lo que usted necesita es que la familia cobre el monto completo desde el primer día, la pregunta correcta no es “¿qué tan rápido me aprueban?” sino “¿este plan paga completo desde el día uno?”. En esta página separamos las dos cosas.",

      whatH: "Qué significa “inmediato” en realidad",
      whatP1:
        "“Inmediato” se refiere a la velocidad con que la aseguradora decide, no a la velocidad con que usted queda protegido. La suscripción es el proceso en que la compañía revisa su salud y su historial para decidir si le vende la póliza y a qué precio. En una solicitud electrónica, ese proceso puede tardar minutos en lugar de semanas. Pero la protección solo existe cuando la póliza se emite y la primera prima se paga.",
      whatP2:
        "La diferencia importa porque una familia no cobra por una solicitud aprobada, cobra por una póliza en vigor. Un agente honesto le dirá la fecha exacta en que empieza su cobertura y qué documento la comprueba. Si alguien le promete que “ya está cubierto” al terminar una llamada sin explicar la emisión y el primer pago, pida que se lo aclare por escrito.",
      fact1H: "Lo que es inmediato",
      fact1P:
        "La respuesta: aprobado, aprobado con beneficio reducido, o rechazado. En varios de nuestros productos electrónicos esa respuesta aparece en la misma sesión de solicitud.",
      fact2H: "Lo que no es inmediato",
      fact2P:
        "La cobertura. Empieza cuando la compañía emite la póliza y recibe la primera prima. Suele ser el mismo día o los días siguientes, pero es un paso aparte.",
      fact3H: "Lo que nunca significa",
      fact3P:
        "Que no haya preguntas. Salvo la aceptación garantizada, todos estos planes preguntan por su salud y revisan registros. Responder mal puede costarle el reclamo.",

      howH: "Cómo se produce una decisión en minutos",
      how1T: "Usted contesta un cuestionario de salud",
      how1: "La solicitud electrónica hace una serie de preguntas de sí o no sobre condiciones específicas: cáncer, insuficiencia cardíaca, EPOC, diálisis, demencia, oxígeno en casa, asilo. También pide estatura, peso, medicamentos y uso de tabaco. No hay examen físico ni análisis de sangre. Estas preguntas son el filtro principal: una sola respuesta puede mover su solicitud del beneficio completo al beneficio reducido, o cerrarla.",
      how2T: "La compañía consulta sus registros de forma electrónica",
      how2: "Al firmar la solicitud usted autoriza esa consulta. La aseguradora revisa su historial de recetas médicas, el archivo del Medical Information Bureau y, según la edad y el monto, su récord de manejo. La <a href=\"https://content.naic.org/cipr-topics/accelerated-underwriting\" rel=\"noopener\" target=\"_blank\">NAIC</a> explica que estas fuentes externas son justamente lo que permite reemplazar el examen físico y bajar el trámite de semanas a horas. Nada de esto requiere que usted busque papeles.",
      how3T: "Un sistema de reglas devuelve la decisión",
      how3: "El programa compara sus respuestas con esos registros y devuelve uno de tres resultados. En la guía de suscripción de Corebridge para SimpliNow Legacy, el resultado es beneficio nivelado, beneficio graduado o rechazo, y la decisión sale sin que un suscriptor humano la revise. Un rechazo en un producto no cierra la puerta: normalmente existe otro camino, como la aceptación garantizada.",
      how4T: "Usted firma y la póliza se emite",
      how4: "La firma puede ser en pantalla, por correo electrónico, por mensaje de texto o por voz grabada, según la compañía. Después se registra la cuenta bancaria para el cobro mensual. Cuando la compañía emite la póliza y recibe la primera prima, la cobertura empieza y usted recibe el contrato. Ese contrato —no la solicitud— es lo que su familia va a presentar algún día.",

      recordsH: "Qué revisa la compañía sobre usted",
      recordsLead:
        "Ninguna aseguradora puede decidir en minutos solo con lo que usted escribe. La velocidad viene de bases de datos que ya existen y que usted autoriza a consultar cuando firma. Conviene saber cuáles son, porque explican por qué el sistema a veces sabe algo que usted olvidó mencionar.",
      rec1H: "Historial de recetas médicas",
      rec1: "La lista de medicamentos que ha surtido en farmacias. Es la fuente más reveladora: un medicamento para el corazón o para la diabetes le dice a la compañía cuál es su condición, aunque usted no la haya nombrado.",
      rec2H: "Medical Information Bureau",
      rec2: "Un archivo que las aseguradoras comparten sobre solicitudes anteriores de seguro de vida o salud. Usted tiene derecho a pedir su propio archivo directamente al <a href=\"https://www.mib.com/consumer.html\" rel=\"noopener\" target=\"_blank\">MIB</a> y a corregir un error.",
      rec3H: "Récord de manejo",
      rec3: "Multas graves y manejar bajo efectos del alcohol cuentan como riesgo. En la guía de emisión simplificada de Mutual of Omaha, esta consulta es obligatoria entre los 18 y 35 años y opcional entre los 36 y 50.",
      rec4H: "Entrevista telefónica",
      rec4: "Algunas solicitudes activan una llamada corta para confirmar respuestas. Con American Amicable, por ejemplo, esa entrevista se pide en gastos finales a partir de los 71 años cuando no aparecen recetas en el sistema.",
      recordsNote:
        "Usted no tiene que reunir expedientes médicos ni pedirle nada a su doctor para estos planes. Lo que sí tiene que hacer es contestar con la verdad: la compañía va a ver los registros de todos modos, y una respuesta que no coincide es el motivo más común de un problema al momento del reclamo.",

      speedH: "Qué tan rápido es cada camino",
      speedP:
        "Estos tiempos salen de las guías de suscripción de las compañías con las que Mejor Vida Seguros está designada. Son plazos típicos para un caso limpio, no una promesa. Un dato que no cuadra manda cualquier solicitud a revisión humana.",
      speedColT: "Camino",
      speedColA: "Tiempo típico hasta la decisión",
      speed1: "Gastos finales electrónico",
      speed1A: "minutos",
      speed1S: "en la sesión",
      speed2: "Plazo simplificado",
      speed2A: "minutos",
      speed2S: "en la sesión",
      speed3: "Plazo con suscripción acelerada",
      speed3A: "48–72",
      speed3S: "horas",
      speed4: "Solicitud con revisión humana",
      speed4A: "días",
      speed4S: "hábiles",
      speed5: "Suscripción completa con laboratorio",
      speed5A: "semanas",
      speed5S: "o más",
      speedNote:
        "Los productos electrónicos de gastos finales de Corebridge y American Amicable devuelven la decisión en la misma sesión. El programa de suscripción acelerada de Mutual of Omaha promete una decisión en tan poco como 48 a 72 horas sin examen paramédico, para edades 18 a 60 y montos de $100,000 a $2,000,000. La NAIC advierte que la vía acelerada no siempre termina en póliza: si los datos disponibles no alcanzan para evaluar el riesgo, la solicitud pasa al camino tradicional con examen.",

      kindsH: "Los planes rápidos que sí ofrecemos",
      kindsLead:
        "Estas son las categorías reales que Mejor Vida Seguros puede cotizar con decisión rápida y sin examen. Cada una resuelve un problema distinto, y la diferencia principal no es la velocidad sino si el beneficio se paga completo desde el primer día.",
      kind1H: "Vida entera simplificada, beneficio completo",
      kind1: "Es el plan de gastos finales más común. Hay preguntas de salud, no hay examen, y si usted califica el monto completo se paga desde el día uno. Montos típicos de $5,000 a $50,000. Ejemplos designados: Living Promise Level de Mutual of Omaha (45 a 85 años), Immediate Solution de Transamerica y Senior Choice Immediate de American Amicable.",
      kind2H: "Vida entera simplificada, beneficio graduado",
      kind2: "Es el camino para quien no califica al beneficio completo. La póliza se emite, pero durante los primeros años una muerte natural paga menos que el monto contratado. Montos típicos de $5,000 a $25,000. Ejemplos: Living Promise Graded, SimpliNow Graded de Corebridge y Golden Solution Graded de American Amicable.",
      kind3H: "Aceptación garantizada",
      kind3: "No hay una sola pregunta de salud y no se puede rechazar por su condición. En cambio hay una espera de dos años por muerte natural. Corebridge lo ofrece de 50 a 80 años, con montos de $5,000 a $25,000. Es el último recurso cuando los demás caminos cierran, no el primero. Más detalle en <a href=\"aceptacion-garantizada.html\">aceptación garantizada</a>.",
      kind4H: "Plazo simplificado",
      kind4: "Cobertura por un número fijo de años, con cuestionario y sin examen. Easy Term de American Amicable da decisión en el momento: plazos de 10, 20 y 30 años, desde $25,000, hasta $500,000 antes de los 46 años y hasta $300,000 después. Sirve cuando la necesidad tiene fecha, como una hipoteca.",
      kind5H: "Plazo con suscripción acelerada",
      kind5: "Es el camino para montos grandes sin examen. Mutual of Omaha cubre de 18 a 60 años hasta $2,000,000; Assurity no pide examen hasta $1,000,000 entre los 18 y 50 años, hasta $500,000 de 51 a 65 y hasta $100,000 de 66 a 75. Toma un poco más que una decisión instantánea, pero evita el laboratorio.",
      kind6H: "Vida infantil o nieto",
      kind6: "Una póliza pequeña de vida entera para un menor, también simplificada. Transamerica emite Immediate Solution desde el nacimiento hasta los 17 años, con montos de $5,000 a $50,000. Ver <a href=\"costo-seguro-vida-infantil.html\">seguro de vida infantil</a>.",

      startH: "Cuándo empieza de verdad su cobertura",
      startLead:
        "Esta es la parte que más confusión causa, y la que más importa. Una aprobación instantánea no es una cobertura instantánea. Entre las dos hay dos pasos concretos, y los dos ocurren después de que la pantalla dice “aprobado”.",
      start1T: "La compañía emite la póliza",
      start1: "Emitir significa que la aseguradora genera el contrato con un número de póliza y una fecha de vigencia. Es el momento en que existe un acuerdo real. Con una decisión instantánea, esto suele pasar el mismo día o en los días siguientes.",
      start2T: "Usted paga la primera prima",
      start2: "Casi todos los contratos exigen la primera prima para que la cobertura arranque. Por eso se pide la cuenta bancaria durante la solicitud. Si el primer cobro no pasa, no hay cobertura, aunque la solicitud estuviera aprobada.",
      start3T: "Usted revisa el contrato en el plazo de gracia",
      start3: "Cuando llega la póliza, usted tiene una ventana para leerla y cancelar con reembolso completo si no es lo que esperaba. En los contratos designados que Mejor Vida Seguros usa en su zona, esa ventana suele ser de 10 días, o de 30 días si la póliza reemplaza otra que usted ya tenía.",
      startClose:
        "Guarde la fecha de vigencia y el número de póliza donde su familia pueda encontrarlos. Una póliza que nadie sabe que existe es el error más costoso de todo este proceso, y no tiene nada que ver con la velocidad de la aprobación.",

      waitH: "Cuáles planes rápidos pagan completo desde el primer día",
      waitP:
        "La velocidad de la decisión y la espera del beneficio son dos cosas independientes. Un plan puede aprobarse en dos minutos y aun así pagar menos del monto contratado si usted fallece de causa natural el año siguiente. Así se distinguen las tres estructuras que aparecen en nuestros contratos.",
      waitColQ: "",
      waitCol1: "Beneficio completo",
      waitCol1Sub: "Nivelado o inmediato",
      waitCol2: "Beneficio graduado",
      waitCol2Sub: "Espera parcial",
      waitCol3: "Aceptación garantizada",
      waitCol3Sub: "Sin preguntas",
      waitR1H: "Preguntas de salud",
      waitR1a: "Sí, y hay que calificar",
      waitR1b: "Sí, con respuestas que no califican al nivelado",
      waitR1c: "Ninguna",
      waitR2H: "Muerte natural el primer año",
      waitR2a: "Paga el monto completo",
      waitR2b: "Paga un beneficio reducido según el contrato",
      waitR2c: "Devuelve las primas pagadas con interés",
      waitR3H: "Muerte accidental el primer año",
      waitR3a: "Paga el monto completo",
      waitR3b: "Normalmente paga el monto completo",
      waitR3c: "Normalmente paga el monto completo",
      waitR4H: "Cuándo paga completo por causa natural",
      waitR4a: "Desde el día uno",
      waitR4b: "Al terminar el período graduado del contrato",
      waitR4c: "Después de dos años",
      waitNote:
        "En Living Promise de Mutual of Omaha, el plan nivelado paga el monto completo desde el primer día para quien califica, y el plan graduado devuelve primas más interés durante el período graduado. La versión de devolución de prima de American Amicable funciona parecido: si la muerte ocurre en el período inicial, se devuelven las primas pagadas. Siempre lea la cláusula de su póliza; el número de años y el porcentaje están ahí.",

      costH: "Cuánto cuesta un plan sin examen",
      costP:
        "Estas son primas mensuales ilustrativas de compañías designadas, no ofertas. La primera tabla es vida entera simplificada: hay preguntas de salud y, si usted califica, el beneficio es completo desde el día uno. La segunda es aceptación garantizada, que no pregunta nada y por eso cuesta más por dólar y trae la espera de dos años.",
      costFeH: "Vida entera simplificada (decisión rápida, sin examen)",
      costGiH: "Aceptación garantizada (sin preguntas, espera de dos años)",
      costGiP:
        "Aquí la salud no cambia el precio, porque la compañía no la pregunta. Compare las dos tablas a la misma edad y verá lo que cuesta evitar las preguntas.",
      costNote:
        "La NAIC lo dice sin rodeos: la suscripción simplificada le permite saltarse el examen y los análisis <em>a cambio de primas generalmente más altas</em>. Si usted está sano y no le molesta un examen, un plazo con suscripción completa casi siempre da más cobertura por el mismo dinero.",

      fitH: "¿Le conviene este camino?",
      fitYesH: "Suele encajar si",
      fitYes1: "Necesita resolverlo pronto: una cirugía próxima, un viaje, una fecha de corte, o simplemente quiere dejar de posponerlo.",
      fitYes2: "No quiere un examen médico, análisis de sangre ni una visita de enfermera en su casa.",
      fitYes3: "El monto que busca es moderado: entre $5,000 y $50,000 para gastos finales, o hasta unos cientos de miles en un plazo simplificado.",
      fitNoH: "Suele no encajar si",
      fitNo1: "Quiere el precio más bajo posible por dólar y está sano. Ahí conviene un <a href=\"seguro-vida-temporal.html\">plazo con suscripción completa</a>, aunque tarde más.",
      fitNo2: "Necesita un monto muy alto. Sin examen, los topes son mucho menores que con laboratorio.",
      fitNo3: "Cree que “rápido” quiere decir “sin preguntas”. Solo la aceptación garantizada no pregunta, y viene con espera.",

      limitsH: "Lo que un plan de emisión inmediata no hace",
      lim1H: "No garantiza la aprobación",
      lim1: "Una decisión instantánea también puede ser un rechazo. Una condición grave reciente cierra el producto, y ahí toca buscar el camino graduado o la aceptación garantizada.",
      lim2H: "No borra la espera",
      lim2: "Si su decisión sale graduada o usted elige aceptación garantizada, la espera aplica igual, sin importar que la aprobación haya tardado dos minutos.",
      lim3H: "No da el mejor precio",
      lim3: "Evitar el examen tiene un costo. Por cada dólar de beneficio, un plan sin examen casi siempre cuesta más que uno con laboratorio.",
      lim4H: "No siempre termina siendo instantáneo",
      lim4: "Cuando los datos electrónicos no alcanzan, la solicitud pasa a revisión humana o al camino tradicional con examen. La NAIC lo señala como un resultado normal, no como un error del sistema.",

      applyH: "Qué tener a mano para una decisión el mismo día",
      applyLead:
        "En este sitio usted puede ver precios ilustrativos y pedir que Mejor Vida Seguros le contacte. Eso no es la solicitud. La solicitud formal se hace con la compañía, con licencia, y ahí sí pide datos de contrato. Tener esto listo es la diferencia entre resolverlo en una llamada y tener que volver a llamar.",
      apply1T: "Sus datos básicos",
      apply1: "Nombre legal como aparece en su identificación, fecha de nacimiento, dirección, teléfono y número de Seguro Social. La compañía necesita el número para verificar identidad y para reportar la póliza.",
      apply2T: "Su salud, en concreto",
      apply2: "Estatura, peso, si usa tabaco, y los nombres de los medicamentos que toma. Si tiene los frascos a mano, mejor: el nombre exacto y la dosis evitan retrasos.",
      apply3T: "Sus beneficiarios",
      apply3: "Nombre completo y relación de quien va a recibir el dinero, y de un beneficiario suplente. Poner una sola persona sin suplente es un descuido común que complica el reclamo.",
      apply4T: "Su cuenta para el pago",
      apply4: "Número de ruta y de cuenta del banco. La primera prima es lo que activa la cobertura, así que sin esto no hay póliza en vigor el mismo día.",
      applyQuoteH: "Ver precios ahora",
      applyQuoteP: "Compare compañías designadas para su edad y su estado.",
      applyQuoteCta: "Ver precios",
      applyCallH: "Hablar con una persona",
      applyCallP: "Repasamos su salud y cuál camino da decisión rápida.",
      applyCallCta: "Agendar",
      applyPhone: "O llame a Mejor Vida Seguros al",

      coH: "Compañías designadas con decisión rápida",
      coProduct: "Producto",
      coAges: "Edades",
      coAmt: "Montos",
      coSpeed: "Decisión",
      coCbProduct: "SimpliNow Legacy y GIWL",
      coCbAges: "50–80",
      coCbAmt: "$5,000–$25,000",
      coCbSpeed: "Instantánea, sin suscriptor humano",
      coAmProduct: "Senior Choice y Easy Term",
      coAmAges: "50–85 gastos finales · 18–70 plazo",
      coAmAmt: "$5,000–$50,000 · $25,000–$500,000",
      coAmSpeed: "En el momento de la venta",
      coMooProduct: "Living Promise y Term Life Answers",
      coMooAges: "45–85 · 18–60 acelerada",
      coMooAmt: "$5,000–$50,000 · hasta $2,000,000",
      coMooSpeed: "Simplificada · acelerada 48–72 horas",
      coTaProduct: "Immediate Solution y Express",
      coTaAges: "45–85",
      coTaAmt: "$5,000–$50,000",
      coTaSpeed: "Solicitud electrónica, algunas resuelven al instante",
      coFoot:
        "Aetna (45–89) y Americo (45–85) también están designadas para gastos finales simplificados, y Assurity para plazo y vida entera con suscripción acelerada sin examen. Las tarjetas son educativas: su estado, su edad, el tabaco y su salud cambian la oferta. Las licencias vigentes están en la página de <a href=\"licencias.html\">licencias</a>.",

      faqTitle: "Preguntas frecuentes",
      faq1q: "Si me aprueban hoy, ¿estoy cubierto hoy?",
      faq1a: "No automáticamente. La aprobación y la cobertura son pasos distintos. La cobertura empieza cuando la compañía emite la póliza y recibe la primera prima, lo que a menudo ocurre el mismo día o en los días siguientes. Pregunte siempre por la fecha de vigencia y guarde el número de póliza.",
      faq2q: "¿Un plan sin examen cuesta más que uno con examen?",
      faq2a: "Por lo general sí, medido por dólar de beneficio. La NAIC explica que la suscripción simplificada permite saltarse el examen y los análisis a cambio de primas generalmente más altas. Si usted está sano y puede esperar, la suscripción completa suele dar más cobertura por el mismo pago mensual.",
      faq3q: "¿Me pueden rechazar en una decisión instantánea?",
      faq3a: "Sí. En SimpliNow Legacy de Corebridge, el sistema devuelve beneficio nivelado, beneficio graduado o rechazo. Un rechazo en un producto no significa que no haya opciones: normalmente queda el camino graduado o la aceptación garantizada, que no pregunta por su salud.",
      faq4q: "¿Cómo consigue la compañía mi información médica tan rápido?",
      faq4a: "Con la autorización que usted firma en la solicitud. Con ese permiso la aseguradora consulta su historial de recetas médicas, el archivo del Medical Information Bureau y, en algunos casos, su récord de manejo. Usted puede pedir su propio archivo al MIB y corregir un error.",
      faq5q: "¿Hay un límite de edad?",
      faq5a: "Depende del producto. Entre las compañías designadas, los gastos finales simplificados se emiten desde los 45 años (hasta 89 en Aetna) y desde los 50 en American Amicable y Corebridge. El plazo simplificado Easy Term llega hasta los 70 años en el plazo de 10 años, y la suscripción acelerada suele cortar entre los 60 y 75 años según la compañía.",
      faq6q: "¿Cuál es el monto más alto que puedo obtener sin examen?",
      faq6a: "En gastos finales, típicamente $50,000. En plazo simplificado, hasta $500,000 antes de los 46 años con Easy Term. Con suscripción acelerada sin examen los topes suben bastante: hasta $2,000,000 con Mutual of Omaha entre los 18 y 60 años, y hasta $1,000,000 con Assurity entre los 18 y 50.",
      faq7q: "¿Puedo hacer todo por teléfono, sin firmar papeles?",
      faq7a: "Sí, en la mayoría de los casos. Las compañías designadas aceptan firma en pantalla, por correo electrónico, por mensaje de texto o por voz grabada. Algunas solicitudes activan una entrevista telefónica corta para confirmar respuestas, sobre todo en edades mayores.",
      faq8q: "Tengo una condición seria. ¿Todavía me sirve algo rápido?",
      faq8a: "Casi siempre sí, pero la estructura cambia. Con una condición reciente y grave, lo probable es un beneficio graduado o un plan de aceptación garantizada con espera de dos años. La decisión puede seguir siendo rápida; lo que cambia es cuándo se paga el monto completo.",
      faq9q: "¿Puedo cancelar si me arrepiento después de recibir la póliza?",
      faq9a: "Sí. Todo contrato trae un período para revisarlo y cancelarlo con reembolso. En los contratos designados que usamos en esta zona, esa ventana suele ser de 10 días, o de 30 si la póliza reemplaza otra. Lea la primera página de su contrato: la fecha está ahí.",

      srcTitle: "Fuentes",
      src1: "<a href=\"https://content.naic.org/cipr-topics/accelerated-underwriting\" rel=\"noopener\" target=\"_blank\">NAIC — Suscripción acelerada</a>: uso de datos externos en lugar del examen físico, reducción del trámite de semanas a horas, y el hecho de que la vía acelerada no siempre termina en póliza.",
      src2: "<a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC — Seguro de vida (consumidor)</a> y la <a href=\"https://content.naic.org/sites/default/files/publication-lig-lp-consumer-life.pdf\" rel=\"noopener\" target=\"_blank\">Guía del comprador</a>.",
      src3: "<a href=\"https://www.mib.com/consumer.html\" rel=\"noopener\" target=\"_blank\">MIB — Información para el consumidor</a>: qué es el archivo del MIB y cómo pedir el suyo.",
      src4: "Edades, montos, estructuras de beneficio y tiempos de decisión: guías de producto y de suscripción de Corebridge (SimpliNow Legacy, GIWL), American Amicable (Senior Choice, Golden Solution, Easy Term), Mutual of Omaha (Living Promise, suscripción acelerada), Transamerica (Immediate Solution, Express) y Assurity.",
      src5: "Primas de muestra: tablas de compañías designadas, agosto de 2026. Cada celda es la prima más baja entre las compañías que cotizaron. No es una oferta vinculante.",

      discTitle: "Divulgación",
      discBody:
        "Esta página es educativa, no una oferta. Las edades, los montos, las esperas y las primas cambian por compañía, producto, tabaco, salud y estado. Mejor Vida Seguros LLC es una agencia independiente (NPN 21695431). Los estados con licencia vigente están en la página de <a href=\"licencias.html\">licencias</a>.",

      quoteTitle: "Decisión rápida",
      quote1: "Compañías designadas",
      quote2: "Sin examen médico",
      quoteCta: "Ver precios",
    };
  }
  return {
    title:
      "Instant life insurance: a decision in minutes (2026) | Mejor Vida Insurance",
    desc: "What “instant” really means on a life insurance policy, how a company decides in minutes with no medical exam, when your coverage actually starts, plus amounts, ages, and illustrative premiums from appointed companies.",
    h1: "Instant life insurance: the decision takes minutes, not weeks",
    lead: "“Instant” describes how fast the insurance company answers, not the day you become covered. You answer health questions, the company checks your records electronically, and a decision comes back — sometimes while you are still on the call — with no medical exam and no blood work.",
    crumbEnd: "Instant life insurance",

    take1:
      "What is instant is the <strong>underwriting decision</strong>. Coverage begins when the policy is issued and you pay the first premium, not the moment you hit submit.",
    take2:
      "Among the companies Mejor Vida Insurance is appointed with, an electronic final expense application can be decided <strong>in minutes</strong>; accelerated term underwriting usually takes <strong>48 to 72 hours</strong>.",
    take3:
      "Fast does not mean “no questions.” Only a <strong>guaranteed acceptance</strong> plan skips health questions, and that plan carries a <strong>two-year wait</strong> for natural death.",
    callout:
      "If what you need is for your family to receive the full amount from day one, the right question is not “how fast can I get approved?” but “does this plan pay in full from day one?” This page keeps those two things separate.",

    whatH: "What “instant” actually refers to",
    whatP1:
      "“Instant” refers to how quickly the insurance company decides, not how quickly you are protected. Underwriting is the process where the company reviews your health and your history to decide whether to sell you the policy and at what price. On an electronic application, that process can take minutes instead of weeks. But protection only exists once the policy is issued and the first premium is paid.",
    whatP2:
      "That distinction matters because a family does not get paid on an approved application — it gets paid on a policy that is in force. An honest agent will tell you the exact date your coverage starts and which document proves it. If someone tells you that you are “covered now” at the end of a call without explaining issue and first payment, ask them to put it in writing.",
    fact1H: "What is instant",
    fact1P:
      "The answer: approved, approved with a reduced early benefit, or declined. On several of our electronic products that answer appears in the same application session.",
    fact2H: "What is not instant",
    fact2P:
      "The coverage. It starts when the company issues the policy and receives the first premium. That is often the same day or within a few days, but it is a separate step.",
    fact3H: "What it never means",
    fact3P:
      "That there are no questions. Except for guaranteed acceptance, every one of these plans asks about your health and checks records. A wrong answer can cost your family the claim.",

    howH: "How a decision arrives in minutes",
    how1T: "You answer a health questionnaire",
    how1: "The electronic application asks a series of yes-or-no questions about specific conditions: cancer, heart failure, COPD, dialysis, dementia, home oxygen, nursing home care. It also asks for height, weight, current medications, and tobacco use. There is no physical exam and no blood draw. These questions are the main filter — a single answer can move you from the full benefit to a reduced benefit, or end the application.",
    how2T: "The company checks your records electronically",
    how2: "When you sign the application, you authorize that check. The insurer reviews your prescription history, your file at the Medical Information Bureau, and depending on your age and the amount, your driving record. The <a href=\"https://content.naic.org/cipr-topics/accelerated-underwriting\" rel=\"noopener\" target=\"_blank\">NAIC</a> explains that these outside sources are exactly what allows companies to replace the physical exam and cut the process from weeks down to hours. None of it requires you to track down paperwork.",
    how3T: "A rules engine returns the decision",
    how3: "The system compares your answers against those records and returns one of three results. In Corebridge's underwriting guide for SimpliNow Legacy, the outcome is level benefit, graded benefit, or decline — and the decision is delivered without a human underwriter reviewing it. A decline on one product does not close the door: there is usually another path, such as guaranteed acceptance.",
    how4T: "You sign and the policy is issued",
    how4: "You can sign on screen, by email, by text message, or by recorded voice, depending on the company. Then you provide the bank account for the monthly draft. Once the company issues the policy and receives that first premium, coverage begins and you receive the contract. That contract — not the application — is what your family will one day present.",

    recordsH: "What the company looks up about you",
    recordsLead:
      "No insurer can decide in minutes using only what you type. The speed comes from databases that already exist and that you authorize them to pull when you sign. It is worth knowing which ones, because they explain how the system sometimes knows something you forgot to mention.",
    rec1H: "Prescription history",
    rec1: "The list of medications you have filled at pharmacies. It is the most revealing source: a heart or diabetes medication tells the company what your condition is even if you never named it.",
    rec2H: "Medical Information Bureau",
    rec2: "A file insurers share about your earlier life or health insurance applications. You have the right to request your own file directly from <a href=\"https://www.mib.com/consumer.html\" rel=\"noopener\" target=\"_blank\">MIB</a> and to correct an error in it.",
    rec3H: "Driving record",
    rec3: "Serious violations and driving under the influence count as risk. In Mutual of Omaha's simplified issue guide, this check is mandatory for ages 18 through 35 and pulled as needed for ages 36 through 50.",
    rec4H: "Phone interview",
    rec4: "Some applications trigger a short call to confirm your answers. With American Amicable, for example, that interview is required on final expense from age 71 up when no prescriptions show in the system.",
    recordsNote:
      "You do not need to gather medical records or ask anything of your doctor for these plans. What you do need to do is answer truthfully: the company will see the records either way, and an answer that does not match is the most common reason a claim runs into trouble.",

    speedH: "How fast each path really is",
    speedP:
      "These timelines come from the underwriting guides of the companies Mejor Vida Insurance is appointed with. They are typical for a clean case, not a promise. One piece of information that does not line up sends any application to human review.",
    speedColT: "Path",
    speedColA: "Typical time to a decision",
    speed1: "Electronic final expense",
    speed1A: "minutes",
    speed1S: "in session",
    speed2: "Simplified term",
    speed2A: "minutes",
    speed2S: "in session",
    speed3: "Accelerated underwriting term",
    speed3A: "48–72",
    speed3S: "hours",
    speed4: "Application sent to human review",
    speed4A: "days",
    speed4S: "business",
    speed5: "Fully underwritten with labs",
    speed5A: "weeks",
    speed5S: "or longer",
    speedNote:
      "The electronic final expense products from Corebridge and American Amicable return a decision in the same session. Mutual of Omaha's accelerated underwriting program targets a decision in as little as 48 to 72 hours with no paramed exam, for ages 18 through 60 and amounts from $100,000 to $2,000,000. The NAIC cautions that the accelerated path does not always end in a policy: when the available data is not enough to evaluate the risk, the application moves to the traditional path with an exam.",

    kindsH: "The fast plans we actually offer",
    kindsLead:
      "These are the real categories Mejor Vida Insurance can quote with a fast decision and no exam. Each one solves a different problem, and the main difference between them is not speed — it is whether the full benefit is paid from the first day.",
    kind1H: "Simplified whole life, full benefit",
    kind1: "This is the most common final expense plan. There are health questions, there is no exam, and if you qualify the full amount is payable from day one. Typical amounts run $5,000 to $50,000. Appointed examples include Mutual of Omaha's Living Promise Level (ages 45 to 85), Transamerica's Immediate Solution, and American Amicable's Senior Choice Immediate.",
    kind2H: "Simplified whole life, graded benefit",
    kind2: "This is the path for someone who does not qualify for the full benefit. The policy is issued, but during the first years a natural death pays less than the amount on the contract. Typical amounts run $5,000 to $25,000. Examples include Living Promise Graded, Corebridge SimpliNow Graded, and American Amicable Golden Solution Graded.",
    kind3H: "Guaranteed acceptance",
    kind3: "There is not a single health question and you cannot be turned down for your condition. In exchange there is a two-year wait for natural death. Corebridge offers it from ages 50 to 80 with amounts of $5,000 to $25,000. It is the last resort when the other paths close, not the first stop. More detail on <a href=\"guaranteed-acceptance.html\">guaranteed acceptance</a>.",
    kind4H: "Simplified term",
    kind4: "Coverage for a set number of years, with a questionnaire and no exam. American Amicable's Easy Term gives a decision on the spot: 10, 20, and 30-year terms, starting at $25,000, up to $500,000 before age 46 and up to $300,000 after. It fits when the need has an end date, like a mortgage.",
    kind5H: "Accelerated underwriting term",
    kind5: "This is the path to a large amount without an exam. Mutual of Omaha covers ages 18 to 60 up to $2,000,000; Assurity requires no exam up to $1,000,000 for ages 18 to 50, up to $500,000 for 51 to 65, and up to $100,000 for 66 to 75. It takes a little longer than an instant decision but skips the lab work.",
    kind6H: "A child or grandchild",
    kind6: "A small whole life policy on a minor, also simplified. Transamerica issues Immediate Solution from birth through age 17, with amounts from $5,000 to $50,000. See <a href=\"children-life-insurance-cost.html\">children's life insurance</a>.",

    startH: "When your coverage actually starts",
    startLead:
      "This is the part that causes the most confusion, and the part that matters most. An instant approval is not instant coverage. Two concrete steps sit between them, and both happen after the screen says approved.",
    start1T: "The company issues the policy",
    start1: "Issuing means the insurer generates the contract with a policy number and an effective date. That is the moment a real agreement exists. With an instant decision, this usually happens the same day or within a few days.",
    start2T: "You pay the first premium",
    start2: "Almost every contract requires the first premium before coverage begins. That is why the bank account is collected during the application. If the first draft does not go through, there is no coverage, even though the application was approved.",
    start3T: "You review the contract during your free look",
    start3: "When the policy arrives, you get a window to read it and cancel for a full refund if it is not what you expected. In the appointed contracts Mejor Vida Insurance uses in this region, that window is commonly 10 days, or 30 days when the policy replaces one you already had.",
    startClose:
      "Write down the effective date and the policy number somewhere your family can find them. A policy nobody knows about is the most expensive mistake in this whole process, and it has nothing to do with how fast the approval came back.",

    waitH: "Which fast plans pay in full from the first day",
    waitP:
      "The speed of the decision and the wait on the benefit are two separate things. A plan can be approved in two minutes and still pay less than the contract amount if you die of natural causes the following year. Here is how the three structures in our contracts differ.",
    waitColQ: "",
    waitCol1: "Full benefit",
    waitCol1Sub: "Level or immediate",
    waitCol2: "Graded benefit",
    waitCol2Sub: "Partial wait",
    waitCol3: "Guaranteed acceptance",
    waitCol3Sub: "No questions",
    waitR1H: "Health questions",
    waitR1a: "Yes, and you have to qualify",
    waitR1b: "Yes, with answers that do not qualify for level",
    waitR1c: "None",
    waitR2H: "Natural death in year one",
    waitR2a: "Pays the full amount",
    waitR2b: "Pays a reduced benefit set by the contract",
    waitR2c: "Returns the premiums you paid, with interest",
    waitR3H: "Accidental death in year one",
    waitR3a: "Pays the full amount",
    waitR3b: "Typically pays the full amount",
    waitR3c: "Typically pays the full amount",
    waitR4H: "When natural death pays in full",
    waitR4a: "From day one",
    waitR4b: "After the contract's graded period ends",
    waitR4c: "After two years",
    waitNote:
      "On Mutual of Omaha's Living Promise, the level plan pays the full amount from the first day for those who qualify, and the graded plan returns premiums plus interest during the graded period. American Amicable's return-of-premium version works much the same way: if death occurs in the initial period, the premiums paid are returned. Always read the clause in your own policy — the number of years and the percentage are stated there.",

    costH: "What a no-exam plan costs",
    costP:
      "These are illustrative monthly premiums from appointed companies, not offers. The first table is simplified whole life: there are health questions, and if you qualify the benefit is full from day one. The second is guaranteed acceptance, which asks nothing and therefore costs more per dollar and carries the two-year wait.",
    costFeH: "Simplified whole life (fast decision, no exam)",
    costGiH: "Guaranteed acceptance (no questions, two-year wait)",
    costGiP:
      "Health does not change this price, because the company never asks about it. Compare the two tables at the same age and you can see what avoiding the questions costs.",
    costNote:
      "The NAIC puts it plainly: simplified underwriting lets you skip the exam and the fluids <em>in exchange for generally higher premiums</em>. If you are healthy and an exam does not bother you, a fully underwritten term policy will almost always buy more coverage for the same money.",

    fitH: "Is this the right path for you?",
    fitYesH: "It usually fits if",
    fitYes1: "You need this settled soon: an upcoming surgery, a trip, a deadline, or simply the decision to stop putting it off.",
    fitYes2: "You do not want a medical exam, blood work, or a nurse visit at your home.",
    fitYes3: "The amount you need is moderate: $5,000 to $50,000 for final expenses, or up to a few hundred thousand on simplified term.",
    fitNoH: "It usually does not fit if",
    fitNo1: "You want the lowest possible price per dollar and you are healthy. A <a href=\"term-life-insurance.html\">fully underwritten term policy</a> is the better buy, even though it takes longer.",
    fitNo2: "You need a very large amount. Without an exam, the caps are far lower than they are with lab work.",
    fitNo3: "You think “fast” means “no questions.” Only guaranteed acceptance skips the questions, and it comes with a wait.",

    limitsH: "What an instant-decision plan does not do",
    lim1H: "It does not guarantee approval",
    lim1: "An instant decision can also be a decline. A serious recent condition closes the product, and then the graded path or guaranteed acceptance is where you look next.",
    lim2H: "It does not erase a waiting period",
    lim2: "If your decision comes back graded, or you choose guaranteed acceptance, the wait applies just the same — no matter that the approval took two minutes.",
    lim3H: "It does not give the best price",
    lim3: "Skipping the exam has a cost. Per dollar of benefit, a no-exam plan almost always costs more than one with lab work.",
    lim4H: "It is not always instant after all",
    lim4: "When the electronic data is not enough, the application moves to human review or to the traditional path with an exam. The NAIC describes this as a normal outcome, not a failure of the system.",

    applyH: "What to have ready for a same-day decision",
    applyLead:
      "On this site you can see illustrative prices and ask Mejor Vida Insurance to follow up. That is not the application. The formal application is done with the company, by a licensed agent, and it asks for contract-level information. Having this ready is the difference between finishing in one call and having to call back.",
    apply1T: "Your basic information",
    apply1: "Legal name as it appears on your ID, date of birth, address, phone number, and Social Security number. The company needs the number to verify identity and to report the policy.",
    apply2T: "Your health, specifically",
    apply2: "Height, weight, tobacco use, and the names of the medications you take. Having the bottles nearby helps: the exact name and dose prevent delays.",
    apply3T: "Your beneficiaries",
    apply3: "Full name and relationship of the person who will receive the money, plus a backup beneficiary. Naming one person with no backup is a common oversight that complicates the claim.",
    apply4T: "Your payment account",
    apply4: "Bank routing and account number. The first premium is what activates coverage, so without this there is no policy in force the same day.",
    applyQuoteH: "See prices now",
    applyQuoteP: "Compare appointed companies for your age and your state.",
    applyQuoteCta: "See prices",
    applyCallH: "Talk to a person",
    applyCallP: "We go through your health and which path gives a fast decision.",
    applyCallCta: "Schedule",
    applyPhone: "Or call Mejor Vida Insurance at",

    coH: "Appointed companies with a fast decision",
    coProduct: "Product",
    coAges: "Ages",
    coAmt: "Amounts",
    coSpeed: "Decision",
    coCbProduct: "SimpliNow Legacy and GIWL",
    coCbAges: "50–80",
    coCbAmt: "$5,000–$25,000",
    coCbSpeed: "Instant, with no human underwriter",
    coAmProduct: "Senior Choice and Easy Term",
    coAmAges: "50–85 final expense · 18–70 term",
    coAmAmt: "$5,000–$50,000 · $25,000–$500,000",
    coAmSpeed: "At the point of sale",
    coMooProduct: "Living Promise and Term Life Answers",
    coMooAges: "45–85 · 18–60 accelerated",
    coMooAmt: "$5,000–$50,000 · up to $2,000,000",
    coMooSpeed: "Simplified · accelerated in 48–72 hours",
    coTaProduct: "Immediate Solution and Express",
    coTaAges: "45–85",
    coTaAmt: "$5,000–$50,000",
    coTaSpeed: "Electronic application, some decide instantly",
    coFoot:
      "Aetna (45–89) and Americo (45–85) are also appointed for simplified final expense, and Assurity for term and whole life with accelerated no-exam underwriting. These cards are educational: your state, your age, tobacco, and your health all change the offer. Current licenses are on the <a href=\"licenses.html\">licenses</a> page.",

    faqTitle: "Frequently asked questions",
    faq1q: "If I am approved today, am I covered today?",
    faq1a: "Not automatically. Approval and coverage are separate steps. Coverage begins when the company issues the policy and receives the first premium, which often happens the same day or within a few days. Always ask for the effective date, and keep the policy number.",
    faq2q: "Does a no-exam plan cost more than one with an exam?",
    faq2a: "Generally yes, measured per dollar of benefit. The NAIC explains that simplified underwriting lets an applicant skip the medical exam and fluid collection in exchange for generally higher premiums. If you are healthy and can wait, full underwriting usually buys more coverage for the same monthly payment.",
    faq3q: "Can I be declined on an instant decision?",
    faq3a: "Yes. On Corebridge's SimpliNow Legacy, the system returns level benefit, graded benefit, or decline. A decline on one product does not mean you are out of options: the graded path or guaranteed acceptance, which asks no health questions at all, is usually still open.",
    faq4q: "How does the company get my medical information so fast?",
    faq4a: "Through the authorization you sign on the application. With that permission the insurer checks your prescription history, your Medical Information Bureau file, and in some cases your driving record. You can request your own MIB file and have an error corrected.",
    faq5q: "Is there an age limit?",
    faq5a: "It depends on the product. Among appointed companies, simplified final expense is issued from age 45 (up to 89 with Aetna) and from age 50 with American Amicable and Corebridge. Easy Term simplified term goes up to age 70 on the 10-year term, and accelerated underwriting generally stops between ages 60 and 75 depending on the company.",
    faq6q: "What is the largest amount I can get with no exam?",
    faq6a: "On final expense, typically $50,000. On simplified term, up to $500,000 before age 46 with Easy Term. With accelerated no-exam underwriting the caps go considerably higher: up to $2,000,000 with Mutual of Omaha for ages 18 to 60, and up to $1,000,000 with Assurity for ages 18 to 50.",
    faq7q: "Can I do all of this by phone, without signing papers?",
    faq7a: "Yes, in most cases. The appointed companies accept a signature on screen, by email, by text message, or by recorded voice. Some applications trigger a short phone interview to confirm your answers, most often at older ages.",
    faq8q: "I have a serious condition. Is a fast plan still useful to me?",
    faq8a: "Almost always yes, but the structure changes. With a recent, serious condition the likely outcome is a graded benefit or a guaranteed acceptance plan with a two-year wait. The decision can still be fast; what changes is when the full amount becomes payable.",
    faq9q: "Can I cancel if I change my mind after the policy arrives?",
    faq9a: "Yes. Every contract includes a period to review it and cancel for a refund. In the appointed contracts we use in this region, that window is commonly 10 days, or 30 days if the policy replaces another one. Read the first page of your contract — the date is stated there.",

    srcTitle: "Sources",
    src1: "<a href=\"https://content.naic.org/cipr-topics/accelerated-underwriting\" rel=\"noopener\" target=\"_blank\">NAIC — Accelerated Underwriting</a>: the use of outside data in place of a physical exam, the reduction of the process from weeks to hours, and the fact that the accelerated path does not always end in a policy.",
    src2: "<a href=\"https://content.naic.org/consumer/life-insurance.htm\" rel=\"noopener\" target=\"_blank\">NAIC — Life insurance (consumer)</a> and the <a href=\"https://content.naic.org/sites/default/files/publication-lig-lp-consumer-life.pdf\" rel=\"noopener\" target=\"_blank\">Life Insurance Buyer's Guide</a>.",
    src3: "<a href=\"https://www.mib.com/consumer.html\" rel=\"noopener\" target=\"_blank\">MIB — Consumer information</a>: what the MIB file is and how to request your own.",
    src4: "Ages, amounts, benefit structures, and decision timelines: product and underwriting guides for Corebridge (SimpliNow Legacy, GIWL), American Amicable (Senior Choice, Golden Solution, Easy Term), Mutual of Omaha (Living Promise, accelerated underwriting), Transamerica (Immediate Solution, Express), and Assurity.",
    src5: "Sample premiums: appointed-company tables, August 2026. Each cell is the lowest premium among the companies that quoted. Not a binding offer.",

    discTitle: "Disclosure",
    discBody:
      "This page is educational, not an offer. Ages, amounts, waiting periods, and premiums change by company, product, tobacco, health, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",

    quoteTitle: "Fast decision",
    quote1: "Appointed companies",
    quote2: "No medical exam",
    quoteCta: "See prices",
  };
}

function instantMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "tipos-seguro-vida.html" : "life-insurance-products.html";
  const fe = isEs ? "seguro-gastos-finales.html" : "final-expense-insurance.html";
  const gi = isEs ? "aceptacion-garantizada.html" : "guaranteed-acceptance.html";
  const noExam = isEs
    ? "seguro-vida-mayores-sin-examen.html"
    : "life-insurance-seniors-no-medical-exam.html";
  const term = isEs ? "seguro-vida-temporal.html" : "term-life-insurance.html";
  const noWait = isEs
    ? "seguro-vida-entierro-sin-espera.html"
    : "no-waiting-period-life-burial.html";
  const quote = "quote.html";
  const cb = "carriers/corebridge.html";
  const amam = "carriers/american-amicable.html";
  const moo = "carriers/mutual-of-omaha.html";
  const ta = "carriers/transamerica.html";
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
  const speedRow = (label, value, unit) =>
    `<div class="lic-age-chart__cell" role="row">
<div class="lic-age-chart__term" role="rowheader">${label}</div>
<div class="lic-age-chart__age" role="cell">${value}<span>${unit}</span></div>
</div>`;
  const waitRow = (head, a, b, d) =>
    `<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${head}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.waitCol1}">${a}</div>
<div class="lic-vs-chart__mid" role="cell" data-label="${c.waitCol2}">${b}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.waitCol3}">${d}</div>
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
<a href="#what">${isEs ? "Qué significa" : "What it means"}</a>
<a href="#how">${isEs ? "Cómo funciona" : "How it works"}</a>
<a href="#speed">${isEs ? "Qué tan rápido" : "How fast"}</a>
<a href="#kinds">${isEs ? "Tipos" : "Types"}</a>
<a href="#start">${isEs ? "Cuándo empieza" : "When it starts"}</a>
<a href="#cost">${isEs ? "Costo" : "Cost"}</a>
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
<li><strong>${c.how1T}</strong>${c.how1}</li>
<li><strong>${c.how2T}</strong>${c.how2}</li>
<li><strong>${c.how3T}</strong>${c.how3}</li>
<li><strong>${c.how4T}</strong>${c.how4}</li>
</ol>
</section>
<section class="lic-section" id="records">
<h2>${c.recordsH}</h2>
<p>${c.recordsLead}</p>
<div class="lic-fact-trio lic-fact-trio--color">
<div>
<h3>${c.rec1H}</h3>
<p>${c.rec1}</p>
</div>
<div>
<h3>${c.rec2H}</h3>
<p>${c.rec2}</p>
</div>
<div>
<h3>${c.rec3H}</h3>
<p>${c.rec3}</p>
</div>
</div>
<p><strong>${c.rec4H}.</strong> ${c.rec4}</p>
<p>${c.recordsNote}</p>
</section>
<section class="lic-section" id="speed">
<h2>${c.speedH}</h2>
<p>${c.speedP}</p>
<p class="lic-age-chart__caption">${c.speedColA}</p>
<div class="lic-age-chart" role="table" aria-label="${c.speedH}">
${speedRow(c.speed1, c.speed1A, c.speed1S)}
${speedRow(c.speed2, c.speed2A, c.speed2S)}
${speedRow(c.speed3, c.speed3A, c.speed3S)}
${speedRow(c.speed4, c.speed4A, c.speed4S)}
${speedRow(c.speed5, c.speed5A, c.speed5S)}
</div>
<p class="lic-rate-note">${c.speedNote}</p>
</section>
<section class="lic-section" id="kinds">
<h2>${c.kindsH}</h2>
<p>${c.kindsLead}</p>
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
<div class="lic-fact-trio">
<div>
<h3>${c.kind4H}</h3>
<p>${c.kind4}</p>
</div>
<div>
<h3>${c.kind5H}</h3>
<p>${c.kind5}</p>
</div>
<div>
<h3>${c.kind6H}</h3>
<p>${c.kind6}</p>
</div>
</div>
</section>
<section class="lic-section" id="start">
<h2>${c.startH}</h2>
<p>${c.startLead}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.start1T}</strong>${c.start1}</li>
<li><strong>${c.start2T}</strong>${c.start2}</li>
<li><strong>${c.start3T}</strong>${c.start3}</li>
</ol>
<aside class="lic-callout" aria-label="${c.startH}">
<p>${c.startClose}</p>
</aside>
</section>
<section class="lic-section" id="wait">
<h2>${c.waitH}</h2>
<p>${c.waitP}</p>
<div class="lic-vs-chart lic-vs-chart--three" role="table" aria-label="${c.waitH}">
<div class="lic-vs-chart__row lic-vs-chart__head" role="row">
<div class="lic-vs-chart__q lic-vs-chart__q--blank" role="columnheader">${c.waitColQ}</div>
<div class="lic-vs-chart__ins" role="columnheader"><strong>${c.waitCol1}</strong><span>${c.waitCol1Sub}</span></div>
<div class="lic-vs-chart__mid" role="columnheader"><strong>${c.waitCol2}</strong><span>${c.waitCol2Sub}</span></div>
<div class="lic-vs-chart__pre" role="columnheader"><strong>${c.waitCol3}</strong><span>${c.waitCol3Sub}</span></div>
</div>
${waitRow(c.waitR1H, c.waitR1a, c.waitR1b, c.waitR1c)}
${waitRow(c.waitR2H, c.waitR2a, c.waitR2b, c.waitR2c)}
${waitRow(c.waitR3H, c.waitR3a, c.waitR3b, c.waitR3c)}
${waitRow(c.waitR4H, c.waitR4a, c.waitR4b, c.waitR4c)}
</div>
<p class="lic-rate-note">${c.waitNote}</p>
<p><a href="${noWait}">${isEs ? "Cobertura sin período de espera" : "Coverage with no waiting period"}</a> · <a href="${gi}">${isEs ? "Aceptación garantizada" : "Guaranteed acceptance"}</a></p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<h3>${c.costFeH}</h3>
<div class="lic-product-tabs" data-lic-product="fe" data-lic-quote-href="${quote}">
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="5000" role="tab" aria-selected="true">$5,000</button>
<button type="button" class="lic-face-tab" data-lic-face="10000" role="tab" aria-selected="false">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="25000" role="tab" aria-selected="false">$25,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</div>
<h3>${c.costGiH}</h3>
<p>${c.costGiP}</p>
<div class="lic-product-tabs" data-lic-product="gi" data-lic-quote-href="${quote}">
<div class="lic-face-tabs" role="tablist">
<button type="button" class="lic-face-tab is-active" data-lic-face="5000" role="tab" aria-selected="true">$5,000</button>
<button type="button" class="lic-face-tab" data-lic-face="10000" role="tab" aria-selected="false">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="25000" role="tab" aria-selected="false">$25,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</div>
<p>${c.costNote}</p>
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
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyLead}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.apply1T}</strong>${c.apply1}</li>
<li><strong>${c.apply2T}</strong>${c.apply2}</li>
<li><strong>${c.apply3T}</strong>${c.apply3}</li>
<li><strong>${c.apply4T}</strong>${c.apply4}</li>
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
<a class="lic-co-card lic-co-card--compare lic-co-card--link" href="${cb}">
<div class="lic-co-logo"><img src="${assets}img/carriers/corebridge-logo.svg" alt="" width="576" height="188" loading="lazy" decoding="async"/></div>
<h3>Corebridge Financial</h3>
<p class="lic-co-product">${c.coCbProduct}</p>
<dl class="lic-co-specs">
<div><dt>${c.coAges}</dt><dd>${c.coCbAges}</dd></div>
<div><dt>${c.coAmt}</dt><dd>${c.coCbAmt}</dd></div>
<div><dt>${c.coSpeed}</dt><dd>${c.coCbSpeed}</dd></div>
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
<div><dt>${c.coSpeed}</dt><dd>${c.coAmSpeed}</dd></div>
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
<div><dt>${c.coSpeed}</dt><dd>${c.coMooSpeed}</dd></div>
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
<div><dt>${c.coSpeed}</dt><dd>${c.coTaSpeed}</dd></div>
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
<li>${c.src4}</li>
<li>${c.src5}</li>
</ul>
</section>
<p class="lic-rate-note"><a href="${fe}">${isEs ? "Gastos finales" : "Final expense"}</a> · <a href="${noExam}">${isEs ? "Sin examen médico" : "No medical exam"}</a> · <a href="${gi}">${isEs ? "Aceptación garantizada" : "Guaranteed acceptance"}</a> · <a href="${term}">${isEs ? "Vida temporal" : "Term life"}</a> · <a href="${quote}">${isEs ? "Ver precios" : "See prices"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2, quoteHref: quote, cta: c.quoteCta })}
</div>
</main>`;
}

module.exports = { copyInstant, instantMain };
