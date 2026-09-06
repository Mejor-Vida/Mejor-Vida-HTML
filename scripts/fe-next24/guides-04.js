"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "seguro-gastos-finales-con-problemas-salud",
    "final-expense-insurance-with-health-conditions",
    ["examen-medico-seguro-gastos-finales", "poliza-graduada-gastos-finales", "periodo-carencia-seguro-gastos-finales"],
    {
      question: "¿Puedo obtener seguro de gastos finales si tengo problemas de salud?",
      headline: "Salud imperfecta y seguro de gastos finales: qué opciones quedan",
      dek: "Un diagnóstico no cierra automáticamente la puerta. Cambia el tipo de plan: beneficio completo, beneficio limitado al inicio, o un plan sin preguntas con espera.",
      pageTitle: "Seguro de gastos finales con problemas de salud",
      metaDescription:
        "Qué opciones de seguro de gastos finales existen con condiciones de salud, sin jerga técnica. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Muchas solicitudes de gastos finales se resuelven con preguntas, no con un examen en consultorio.",
        "Si la compañía no puede ofrecer un plan que pague completo desde el día uno, a menudo queda un plan con periodo de espera o un plan de aceptación garantizada.",
        "Cada compañía pregunta distinto. Un “no” en una no es un “no” en todas.",
        "No publicamos una lista de enfermedades que “siempre aprueban” o “siempre rechazan.” Eso sería inventar el resultado de su solicitud.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La gente llega a esta pregunta con miedo: diabetes, presión alta, un infarto antiguo, EPOC, un cáncer tratado. El miedo es comprensible. El error es asumir que solo existen dos respuestas, sí o no, en una sola compañía." },
        { type: "h2", text: "Primero, el concepto: la compañía está midiendo riesgo, no moral" },
        { type: "p", text: "Un seguro de vida paga si usted fallece mientras el contrato está vigente. Si un diagnóstico hace más probable un fallecimiento pronto, la compañía o sube el precio, o limita el beneficio al inicio, o no emite ese producto. Eso no es un juicio sobre su carácter. Es cómo se construye el producto." },
        { type: "h2", text: "Tres resultados posibles, en lenguaje cotidiano" },
        { type: "p", text: "Uno: califica a un plan que paga el monto completo por una muerte natural cubierta desde el primer pago. Dos: hay preguntas, pero los primeros años pagan menos o devuelven primas más un interés del contrato si la muerte no es accidental. Tres: no hay preguntas; la compañía acepta a cambio de una espera y, casi siempre, un precio más alto por dólar y un tope de monto más bajo." },
        { type: "p", text: "Un infarto o un derrame reciente, oxígeno en casa, o un cáncer en tratamiento activo estrechan el primer camino en varias compañías designadas. Un diagnóstico estable de hace muchos años puede no cerrarlo. La fecha que el médico escribió importa. No adivinamos la suya en esta página." },
        {
          type: "table",
          caption: "Cómo leer las opciones si la salud no es “perfecta”",
          lead: "Ninguna fila promete emisión. Sirve para saber qué preguntar en una cotización.",
          headers: ["Si la salud es…", "Qué suele explorarse primero", "Qué debe preguntar"],
          rows: [
            ["Estable y las preguntas se responden “no” a eventos recientes", "Plan de beneficio completo", "Edad máxima, monto máximo, prima"],
            ["Hay un evento reciente o un diagnóstico que el formulario marca", "Plan con espera, u otra compañía", "Cuántos años dura la espera y qué paga un accidente cubierto"],
            ["Las preguntas de varios productos no dan emisión", "Aceptación garantizada", "Tope de monto, edad máxima (a menudo cerca de 80 en la línea que cotizamos) y qué pasa en los dos primeros años"],
          ],
          foot: "Living Promise, Accendo, Transamerica, Americo y American Amicable no comparten un solo cuestionario.",
        },
        { type: "note", text: "No mezclamos fórmulas: un producto puede devolver primas más 10% en los años 1–2; otro puede pagar un porcentaje del monto (por ejemplo 30% y luego 70%) antes del 100%. Un tercero puede usar otra regla. El contrato de esa póliza es la fuente, no esta tabla." },
        { type: "h2", text: "Compañías, después de entender los caminos" },
        { type: "p", text: "Mejor Vida Seguros compara compañías designadas —entre ellas Mutual of Omaha, American Amicable, Accendo, Transamerica, Americo, Assurity y Corebridge— según edad, estado y respuestas. Corebridge de aceptación garantizada, en la línea que cotizamos, suele emitir de 50 a 80, de $5,000 a $25,000, sin preguntas de salud, con espera de unos dos años para muerte no accidental. Un accidente cubierto puede pagar el monto desde el inicio, según el contrato." },
        {
          type: "faq",
          items: [
            { q: "Tengo diabetes. ¿Me van a rechazar?", a: "No lo afirmamos para todas las compañías ni para todos los tipos de diabetes. Algunas combinaciones (por ejemplo con tabaco o con complicaciones) estrechan un producto y no otro. Hay que cotizar con lo que el médico escribió." },
            { q: "¿Un plan con espera es “malo”?", a: "Es un compromiso: hay cobertura, pero no el mismo cheque el primer año. Para algunas familias es la única vía. Para otras, conviene buscar otra compañía antes de aceptar la espera." },
            { q: "¿Debo esperar a “estar más sano”?", a: "A veces un evento tiene que cumplir meses o años que el formulario pide. A veces esperar solo hace el precio más alto por edad. No hay una regla única; se mira la fecha del diagnóstico y el presupuesto." },
          ],
        },
      ],
    },
    {
      question: "Can I get final expense insurance with health conditions?",
      headline: "Imperfect health and final expense insurance: what options remain",
      dek: "A diagnosis does not automatically close the door. It changes the type of plan: full benefit, a limited benefit at first, or a no-questions plan with a wait.",
      pageTitle: "Final expense insurance with health conditions",
      metaDescription:
        "What final expense options exist with health conditions, without technical jargon. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Many final expense applications are decided with questions, not an office exam.",
        "If a company cannot offer a plan that pays in full from day one, a waiting-period plan or guaranteed acceptance is often still on the table.",
        "Each company asks different questions. A “no” at one is not a “no” at all of them.",
        "We do not publish a list of conditions that “always approve” or “always decline.” That would invent the outcome of your application.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "People arrive at this question afraid: diabetes, high blood pressure, an old heart attack, COPD, treated cancer. The fear is understandable. The mistake is assuming there are only two answers, yes or no, at a single company." },
        { type: "h2", text: "First, the idea: the company is measuring risk, not character" },
        { type: "p", text: "Life insurance pays if you die while the contract is in force. If a diagnosis makes an early death more likely, the company may raise the price, limit the early benefit, or not issue that product. That is not a judgment of your character. It is how the product is built." },
        { type: "h2", text: "Three possible results, in everyday language" },
        { type: "p", text: "One: you qualify for a plan that pays the full amount for a covered natural death from the first payment. Two: there are still questions, but the first years pay less or return premiums plus contract interest if death is not accidental. Three: there are no questions; the company accepts you in exchange for a wait and, almost always, a higher price per dollar and a lower amount cap." },
        { type: "p", text: "A recent heart attack or stroke, oxygen at home, or cancer in active treatment narrows the first path at several appointed companies. A stable diagnosis from many years ago may not. The date the doctor wrote matters. We will not guess yours on this page." },
        {
          type: "table",
          caption: "How to read the options if health is not “perfect”",
          lead: "No row promises issue. It tells you what to ask on a quote.",
          headers: ["If health is…", "What is usually explored first", "What you should ask"],
          rows: [
            ["Stable, and recent-event questions are answered “no”", "Full-benefit plan", "Maximum age, maximum amount, premium"],
            ["A recent event or a diagnosis the form flags", "Waiting-period plan, or another company", "How many years the wait lasts and what a covered accident pays"],
            ["Questions on several products will not issue", "Guaranteed acceptance", "Amount cap, maximum age (often near 80 on the line we quote), and what happens in the first two years"],
          ],
          foot: "Living Promise, Accendo, Transamerica, Americo, and American Amicable do not share one questionnaire.",
        },
        { type: "note", text: "We do not mix formulas: one product may return premiums plus 10% in years 1–2; another may pay a share of the amount (for example 30% then 70%) before 100%. A third may use a different rule. That policy’s contract is the source, not this table." },
        { type: "h2", text: "Companies, after the paths are clear" },
        { type: "p", text: "Mejor Vida Insurance compares appointed companies — including Mutual of Omaha, American Amicable, Accendo, Transamerica, Americo, Assurity, and Corebridge — by age, state, and answers. Corebridge guaranteed acceptance, on the line we quote, typically issues ages 50–80, $5,000–$25,000, with no health questions, and about a two-year wait for non-accidental death. A covered accident can pay the face from the start, as the contract writes it." },
        {
          type: "faq",
          items: [
            { q: "I have diabetes. Will I be declined?", a: "We will not claim that for every company or every type of diabetes. Some combinations (for example with tobacco or with complications) narrow one product and not another. Quote with what the doctor wrote." },
            { q: "Is a waiting-period plan “bad”?", a: "It is a tradeoff: there is coverage, but not the same check in year one. For some families it is the only path. For others, it is worth trying another company before accepting the wait." },
            { q: "Should I wait until I am “healthier”?", a: "Sometimes an event has to pass months or years the form requires. Sometimes waiting only makes the price higher because of age. There is no single rule; look at the diagnosis date and the budget." },
          ],
        },
      ],
    }
  ),

  pack(
    "seguro-gastos-finales-fumadores",
    "final-expense-insurance-for-smokers",
    ["factores-precio-seguro-gastos-finales", "examen-medico-seguro-gastos-finales", "companias-seguro-gastos-finales"],
    {
      question: "¿Puedo obtener seguro de gastos finales si fumo?",
      headline: "Fumar y el seguro de gastos finales: hay opciones, a otro precio",
      dek: "El tabaco no suele cerrar la puerta. Cambia la clase de precio y, en algunos productos, las edades o montos máximos. Cada formulario define qué cuenta como fumar.",
      pageTitle: "Seguro de gastos finales para fumadores",
      metaDescription:
        "Cómo el tabaco afecta un seguro de gastos finales y qué opciones siguen existiendo. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Fumar, en las compañías que cotizamos, suele significar una prima más alta para el mismo monto y edad.",
        "No publicamos un factor único (“cuesta X veces más”) porque no es el mismo en todos los productos.",
        "Dejar el tabaco puede, después de los meses que el formulario pida, permitir una clase de no fumador — no es automático el día que deja de fumar.",
        "Hay que contestar la pregunta de tabaco como está escrita, incluyendo cigarrillo electrónico si el formulario lo incluye.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "Un anuncio que muestra un precio bajo casi nunca es un precio de fumador. Si usted usa tabaco, compare con la clase que le corresponde. De lo contrario, el “ahorro” es ficticio." },
        { type: "h2", text: "Por qué el precio sube" },
        { type: "p", text: "Las compañías de vida cobran más cuando el riesgo de fallecer es más alto. El tabaco entra en esa cuenta. No necesitamos un ensayo médico en esta página: el formulario ya separa fumador y no fumador." },
        { type: "p", text: "Lo que sí varía es la definición. Un producto puede preguntar por nicotina en los últimos 12 meses. Otro puede incluir vapeo o mascar. Un tercero puede tratar el cigarrillo social igual que el diario. No unificamos esas reglas." },
        { type: "h2", text: "Qué sigue abierto" },
        { type: "p", text: "Los mismos caminos que para no fumadores: un plan de beneficio completo si las demás preguntas lo permiten, un plan con espera, o aceptación garantizada. El tabaco por sí solo no equivale a “solo queda el plan sin preguntas.” En algunos diseños, el tabaco o un beneficio limitado corta la edad máxima antes (a veces cerca de 75). Hay que ver el producto, no una regla nacional." },
        { type: "note", text: "No inventamos primas de fumador en una tabla en esta guía. Una cotización con su edad, sexo, estado y uso de tabaco es la cifra que importa. Las tablas educativas de $10,000 en otras páginas de Mejor Vida son de no fumador y buena salud." },
        { type: "h2", text: "Si está dejando de fumar" },
        { type: "p", text: "Pregunte cuántos meses sin tabaco pide el formulario para la clase más baja. No cambie la respuesta para “adelantar” esa fecha. Si más adelante califica como no fumador, a veces se puede revisar la clase o emitir una póliza nueva; no es un derecho automático en todos los contratos." },
        { type: "h2", text: "Compañías" },
        { type: "p", text: "Mutual of Omaha, American Amicable, Accendo, Transamerica, Americo, Assurity y Corebridge, entre las que Mejor Vida Seguros puede cotizar, tienen sus propias preguntas de tabaco. Mejor Vida no recomienda mentir para “entrar” en la clase más barata: un reclamo posterior puede revisarse contra esas respuestas." },
        {
          type: "faq",
          items: [
            { q: "¿El vapeo cuenta?", a: "En muchos formularios sí. Lea la pregunta. Si incluye nicotina o “productos de tabaco,” conteste en consecuencia." },
            { q: "¿Fumar marihuana es lo mismo?", a: "No lo tratamos como idéntico en todas las compañías. Algunos formularios lo separan. Hay que usar el texto de esa solicitud." },
            { q: "¿Puedo comprar y luego decir que dejé de fumar?", a: "La clase se fija con las respuestas de la solicitud, salvo que el contrato permita un cambio posterior. No prometemos un descenso de prima el mes en que deja el cigarro." },
          ],
        },
      ],
    },
    {
      question: "Can I get final expense insurance if I smoke?",
      headline: "Smoking and final expense insurance: options exist, at a different price",
      dek: "Tobacco does not usually close the door. It changes the price class and, on some products, maximum ages or amounts. Each form defines what counts as smoking.",
      pageTitle: "Final expense insurance for smokers",
      metaDescription:
        "How tobacco affects final expense insurance and what options still exist. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Smoking, at the companies we quote, usually means a higher premium for the same amount and age.",
        "We do not publish one factor (“it costs X times more”) because it is not the same on every product.",
        "Quitting may, after the months the form requires, allow a non-tobacco class — it is not automatic the day you stop.",
        "Answer the tobacco question as written, including e-cigarettes if the form includes them.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "An ad that shows a low price is almost never a smoker price. If you use tobacco, compare the class that applies to you. Otherwise the “savings” are fictional." },
        { type: "h2", text: "Why the price rises" },
        { type: "p", text: "Life companies charge more when the chance of dying is higher. Tobacco is part of that math. We do not need a medical essay on this page: the form already splits tobacco and non-tobacco." },
        { type: "p", text: "What does vary is the definition. One product may ask about nicotine in the last 12 months. Another may include vaping or chewing. A third may treat a social cigarette like daily use. We do not flatten those rules." },
        { type: "h2", text: "What stays open" },
        { type: "p", text: "The same paths as for non-smokers: a full-benefit plan if the other questions allow it, a waiting-period plan, or guaranteed acceptance. Tobacco alone does not equal “only the no-questions plan is left.” On some designs, tobacco or a limited benefit cuts the maximum age earlier (sometimes near 75). That is product-specific, not a national rule." },
        { type: "note", text: "We do not invent smoker premiums in a table in this guide. A quote with your age, sex, state, and tobacco use is the figure that matters. Educational $10,000 tables on other Mejor Vida pages are non-tobacco, good health." },
        { type: "h2", text: "If you are quitting" },
        { type: "p", text: "Ask how many tobacco-free months the form needs for the lower class. Do not change the answer to “speed up” that date. If you later qualify as non-tobacco, a class review or a new policy is sometimes possible; it is not an automatic right in every contract." },
        { type: "h2", text: "Companies" },
        { type: "p", text: "Mutual of Omaha, American Amicable, Accendo, Transamerica, Americo, Assurity, and Corebridge, among companies Mejor Vida Insurance can quote, have their own tobacco questions. Mejor Vida does not recommend lying to “get into” the cheaper class: a later claim can be reviewed against those answers." },
        {
          type: "faq",
          items: [
            { q: "Does vaping count?", a: "On many forms, yes. Read the question. If it includes nicotine or “tobacco products,” answer accordingly." },
            { q: "Is marijuana the same?", a: "We do not treat it as identical at every company. Some forms separate it. Use the wording on that application." },
            { q: "Can I buy and then say I quit?", a: "The class is set by the application answers unless the contract allows a later change. We do not promise a premium drop the month you put the cigarette down." },
          ],
        },
      ],
    }
  ),
];
