"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "edad-contratar-seguro-gastos-finales",
    "best-age-to-buy-final-expense-insurance",
    ["factores-precio-seguro-gastos-finales", "seguro-gastos-finales-mayores-70", "cuanto-tiempo-aprobacion-poliza-gastos-finales"],
    {
      question: "¿A qué edad conviene contratar un seguro de gastos finales?",
      headline: "No hay una edad “mágica”: hay un precio que sube y una puerta que se estrecha",
      dek: "Comprar antes suele costar menos cada mes por el mismo monto. Comprar después sigue siendo posible en muchos productos, hasta los topes de edad de cada compañía.",
      pageTitle: "A qué edad contratar un seguro de gastos finales",
      metaDescription:
        "Cómo la edad cambia el precio y la disponibilidad de un seguro de gastos finales. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "No existe una edad oficial en Estados Unidos que sea “la mejor” para todos.",
        "A igual monto y salud, una persona de 55 años paga menos al mes que una de 75 en las tablas ilustrativas que publicamos.",
        "La edad máxima para comprar depende del producto: muchos gastos finales llegan a 85; Accendo Level puede llegar a 89; la aceptación garantizada que cotizamos suele cortar cerca de 80. No publicamos emisión nueva de gastos finales a los 90.",
        "Esperar “a ver” también es una decisión: el precio sube y un diagnóstico nuevo puede cambiar el tipo de plan.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La pregunta suena a consejo de calendario. En realidad es de presupuesto y de salud. El seguro no se “madura” como un vino. Cada año que pasa, la prima de una póliza nueva para el mismo monto suele ser más alta, y el formulario de salud puede volverse más difícil." },
        { type: "h2", text: "Qué significa “conviene” en esta guía" },
        { type: "p", text: "Conviene, para muchas familias, cuando ya hay un funeral o deudas pequeñas que no quieren dejar a los hijos, y la prima cabe en el mes sin dejar de pagar luz o medicinas. No conviene si la prima va a caducar a los seis meses. Una póliza caducada no paga." },
        { type: "h2", text: "Cómo se ve el precio al cumplir años" },
        { type: "p", text: "En cotizaciones ilustrativas de $10,000, no fumador y buena salud (agosto 2026), una mujer de 50 años ronda $28 al mes y un hombre $34. A los 65, unos $41 y $54. A los 80, unos $98 y $136. Esas cifras no son ofertas. Muestran la dirección: más edad, más prima, mismo monto." },
        {
          type: "table",
          caption: "Edades de compra que vemos en productos designados",
          lead: "Rangos educativos. El estado y el tabaco pueden recortarlos.",
          headers: ["Producto (ejemplo)", "Edades típicas al comprar", "Tope de monto (aprox.)"],
          rows: [
            ["Living Promise Nivelado (Mutual of Omaha)", "45–85", "Hasta unos $50,000"],
            ["Golden Solution / Senior Choice (American Amicable)", "50–85", "Según plan y estado"],
            ["Accendo Level", "Desde los 40 hasta 89", "$25,000 a edades 76–89"],
            ["Transamerica Immediate Solution", "Hasta 85", "El tope baja con la edad"],
            ["Aceptación garantizada Corebridge (línea cotizada)", "50–80", "$5,000–$25,000"],
          ],
          foot: "Americo Eagle Select Nivelado, en materiales de producto, emite en general de 40 a 85, $5,000–$50,000, con un tope de $40,000 a los 76–85. No hay un ganador en esta tabla.",
        },
        { type: "h2", text: "Los 50, los 60 y los 70 no son el mismo problema" },
        { type: "p", text: "En los 50, algunas personas todavía comparan un temporal para la hipoteca con un gasto final para el funeral. Son trabajos distintos. En los 70, el temporal nuevo se acorta o desaparece; el gasto final permanente es, para muchas familias, la conversación principal. En los 80 y 85 hay menos compañías y montos a veces más bajos. Esas etapas se explican en las guías de mayores de 70, 80 y 85." },
        { type: "note", text: "“Compre ahora o nunca” es un eslogan. El dato verificable es: la edad al emitir fija la prima de esa póliza, y cada producto cierra la puerta en una edad distinta." },
        {
          type: "faq",
          items: [
            { q: "¿Es demasiado tarde a los 78?", a: "No lo afirmamos. Varios productos designados emiten después de los 70, incluso hasta 85 u 89 según el diseño. El precio será más alto que a los 60." },
            { q: "¿Debo esperar a jubilarme?", a: "Jubilarse no baja la tarifa de un seguro de vida nuevo. Puede bajar su ingreso. Si la prima no va a caber en la pensión, hay que dimensionar el monto ahora, no “después.”" },
            { q: "¿Hay una edad mínima?", a: "Sí, y cambia: 40, 45 o 50 son cortes que vemos en productos de esta página. Un adulto joven suele usar otro tipo de vida." },
          ],
        },
      ],
    },
    {
      question: "What is the best age to buy final expense insurance?",
      headline: "There is no magic age: the price rises and the door narrows",
      dek: "Buying earlier usually costs less each month for the same amount. Buying later is still possible on many products, up to each company’s age cap.",
      pageTitle: "Best age to buy final expense insurance",
      metaDescription:
        "How age changes the price and availability of final expense insurance. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "There is no official U.S. age that is “best” for everyone.",
        "At the same amount and health, a 55-year-old pays less per month than a 75-year-old on the illustrative tables we publish.",
        "The maximum age to buy depends on the product: many final expense plans go through 85; Accendo Level can go through 89; guaranteed acceptance we quote usually stops near 80. We do not publish new final expense issue at 90.",
        "Waiting “to see” is also a decision: the price rises, and a new diagnosis can change the plan type.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "The question sounds like calendar advice. It is really about budget and health. Insurance does not “ripen” like wine. Each year that passes, the premium on a new policy for the same amount is usually higher, and the health form can get harder." },
        { type: "h2", text: "What “best” means in this guide" },
        { type: "p", text: "For many families, it is a good time when there is already a funeral or small debts they do not want to leave to their children, and the premium fits the month without crowding out utilities or medicine. It is not a good time if the premium will lapse in six months. A lapsed policy does not pay." },
        { type: "h2", text: "How price looks as birthdays arrive" },
        { type: "p", text: "On illustrative $10,000 quotes, non-tobacco and good health (August 2026), a 50-year-old woman is near $28 a month and a man $34. At 65, about $41 and $54. At 80, about $98 and $136. Those figures are not offers. They show the direction: older age, higher premium, same amount." },
        {
          type: "table",
          caption: "Purchase ages we see on appointed products",
          lead: "Educational ranges. State and tobacco can shorten them.",
          headers: ["Product (example)", "Typical ages to buy", "Amount cap (approx.)"],
          rows: [
            ["Living Promise Level (Mutual of Omaha)", "45–85", "Up to about $50,000"],
            ["Golden Solution / Senior Choice (American Amicable)", "50–85", "By plan and state"],
            ["Accendo Level", "From 40 through 89", "$25,000 at ages 76–89"],
            ["Transamerica Immediate Solution", "Through 85", "The cap falls with age"],
            ["Corebridge guaranteed acceptance (quoted line)", "50–80", "$5,000–$25,000"],
          ],
          foot: "Americo Eagle Select Level, in product materials, typically issues ages 40–85, $5,000–$50,000, with a $40,000 cap at ages 76–85. This table has no winner.",
        },
        { type: "h2", text: "The 50s, 60s, and 70s are not the same problem" },
        { type: "p", text: "In the 50s, some people still compare term for a mortgage with final expense for a funeral. Those are different jobs. In the 70s, new term shortens or disappears; permanent final expense is, for many families, the main conversation. In the 80s and 85s there are fewer companies and sometimes lower amounts. Those stages are covered in the over-70, over-80, and over-85 guides." },
        { type: "note", text: "“Buy now or never” is a slogan. The verifiable point is: age at issue sets that policy’s premium, and each product closes the door at a different age." },
        {
          type: "faq",
          items: [
            { q: "Is 78 too late?", a: "We will not claim that. Several appointed products issue after 70, even through 85 or 89 depending on the design. The price will be higher than at 60." },
            { q: "Should I wait until I retire?", a: "Retiring does not lower the rate on a new life policy. It may lower your income. If the premium will not fit a pension, size the amount now, not “later.”" },
            { q: "Is there a minimum age?", a: "Yes, and it changes: 40, 45, or 50 are cutoffs we see on products on this page. A young adult usually uses another kind of life insurance." },
          ],
        },
      ],
    }
  ),

  pack(
    "cuanto-tiempo-aprobacion-poliza-gastos-finales",
    "how-long-final-expense-approval-takes",
    ["examen-medico-seguro-gastos-finales", "companias-seguro-gastos-finales", "que-son-polizas-gastos-finales"],
    {
      question: "¿Cuánto tiempo tarda en aprobarse una póliza de gastos finales?",
      headline: "De la cotización al sí: qué pasos hay y qué no prometemos",
      dek: "Una cotización no es una póliza. La compañía revisa la solicitud y decide. A veces es rápido. A veces pide más datos. No hay un reloj legal de “24 horas” para todos los casos.",
      pageTitle: "Cuánto tarda la aprobación de un seguro de gastos finales",
      metaDescription:
        "Qué pasos hay desde cotizar un seguro de gastos finales hasta que la compañía decide. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Cotizar, firmar y que la compañía emita son tres momentos distintos.",
        "Los planes de gastos finales sin examen en consultorio suelen ser más cortos que un seguro grande con laboratorio, pero no son instantáneos por ley.",
        "Información incompleta, un pago que no pasa o una pregunta de salud que hay que aclarar alargan el proceso.",
        "Hasta que la póliza esté emitida y vigente según el contrato, no asuma que hay cobertura.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La prisa es humana: un diagnóstico nuevo, un funeral reciente en la familia, un viaje. Aun así, el seguro es un contrato. La compañía tiene derecho a revisar lo que usted firmó." },
        { type: "h2", text: "El orden real de los pasos" },
        { type: "ul", items: [
          "Una cotización estima la prima con edad, sexo, tabaco, estado y monto.",
          "La solicitud añade identidad, beneficiarios y preguntas de salud (salvo aceptación garantizada).",
          "La compañía acepta, ofrece otro tipo de plan, pide más información o declina.",
          "Si acepta, hay que pagar la primera prima para que la cobertura arranque en la fecha que el contrato escribe.",
        ] },
        { type: "h2", text: "Qué puede ir rápido — y qué no" },
        { type: "p", text: "Cuando las respuestas son claras y el formulario no dispara revisiones extra, muchas solicitudes de gastos finales se resuelven en días, no en meses. Eso es una observación de trabajo, no una garantía escrita para su caso. Si la compañía necesita un registro médico o aclarar una fecha de hospitalización, el calendario lo marca esa espera, no el agente." },
        { type: "note", text: "No publicamos “aprobación en 24 horas” como regla. Algunas herramientas de las compañías dan una decisión el mismo día. Otras no. Tratar ese anuncio como un derecho lleva a decepción." },
        {
          type: "table",
          caption: "Qué está en su control y qué no",
          lead: "Acelerar no significa omitir la verdad.",
          headers: ["Usted puede", "Usted no controla"],
          rows: [
            ["Tener fechas de diagnósticos y nombres de medicamentos", "La cola interna de la compañía"],
            ["Revisar que el beneficiario y la dirección estén bien escritos", "Si piden más documentos de salud"],
            ["Asegurar que el pago de la primera prima se procese", "Un recorte de sistema o una revisión aleatoria"],
            ["Responder el teléfono o el correo si piden una aclaración", "El calendario de un médico si piden un registro"],
          ],
          foot: "Una solicitud de aceptación garantizada evita preguntas de salud, no evita identidad, pago y reglas del producto.",
        },
        { type: "h2", text: "Después del “sí”" },
        { type: "p", text: "Guarde la póliza, confirme la fecha de vigencia y cómo se pagará cada mes. Si el banco rechaza un débito, puede haber un periodo de gracia; si se agota, la póliza puede caducar. El tiempo de aprobación no sirve de nada si el pago no continúa." },
        {
          type: "faq",
          items: [
            { q: "¿Estoy cubierto el día que lleno la web?", a: "Por lo general no. La cobertura sigue las fechas del contrato, casi siempre tras emisión y primer pago. Pregunte esa fecha en su caso." },
            { q: "¿Puedo acelerar pagando más?", a: "No es una fila VIP. Completar bien la solicitud ayuda más que pagar de más." },
            { q: "¿Si me declinan, se acaba todo?", a: "En esa compañía y producto, sí para esa solicitud. Otra compañía o un plan con espera puede seguir abierto. Mejor Vida Seguros cotiza más de una vía cuando tiene sentido." },
          ],
        },
      ],
    },
    {
      question: "How long does final expense approval take?",
      headline: "From quote to yes: the steps, and what we will not promise",
      dek: "A quote is not a policy. The company reviews the application and decides. Sometimes it is fast. Sometimes it asks for more. There is no legal 24-hour clock for every case.",
      pageTitle: "How long final expense approval takes",
      metaDescription:
        "The steps from quoting final expense insurance to the company’s decision. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Quoting, signing, and the company issuing are three different moments.",
        "No-office-exam final expense is usually shorter than a large fully examined policy, but it is not instant by law.",
        "Incomplete information, a payment that fails, or a health question that needs clarifying stretches the process.",
        "Until the policy is issued and in force as the contract writes it, do not assume you have coverage.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "Hurry is human: a new diagnosis, a recent funeral in the family, a trip. Even so, insurance is a contract. The company has the right to review what you signed." },
        { type: "h2", text: "The real order of steps" },
        { type: "ul", items: [
          "A quote estimates the premium with age, sex, tobacco, state, and amount.",
          "The application adds identity, beneficiaries, and health questions (except guaranteed acceptance).",
          "The company accepts, offers another plan type, asks for more information, or declines.",
          "If it accepts, the first premium must be paid so coverage starts on the date the contract writes.",
        ] },
        { type: "h2", text: "What can go quickly — and what cannot" },
        { type: "p", text: "When answers are clear and the form does not trigger extra review, many final expense applications resolve in days, not months. That is a working observation, not a written guarantee for your file. If the company needs a medical record or a hospital date clarified, that wait sets the calendar, not the agent." },
        { type: "note", text: "We do not publish “24-hour approval” as a rule. Some company tools return a same-day decision. Others do not. Treating that ad as a right leads to disappointment." },
        {
          type: "table",
          caption: "What is in your control and what is not",
          lead: "Going faster does not mean leaving out the truth.",
          headers: ["You can", "You do not control"],
          rows: [
            ["Have diagnosis dates and medication names ready", "The company’s internal queue"],
            ["Check that the beneficiary and address are spelled correctly", "Whether they ask for more health documents"],
            ["Make sure the first premium payment processes", "A system cut or a random review"],
            ["Answer the phone or email if they need a clarification", "A doctor’s timeline if a record is requested"],
          ],
          foot: "A guaranteed-acceptance application skips health questions. It does not skip identity, payment, and product rules.",
        },
        { type: "h2", text: "After the “yes”" },
        { type: "p", text: "Keep the policy, confirm the in-force date, and how each month will be paid. If the bank rejects a draft, there may be a grace period; if it runs out, the policy can lapse. Approval time is worthless if the payment does not continue." },
        {
          type: "faq",
          items: [
            { q: "Am I covered the day I fill out the website?", a: "Usually not. Coverage follows the contract dates, almost always after issue and the first payment. Ask for that date in your case." },
            { q: "Can I speed it up by paying more?", a: "There is no VIP line. Completing the application well helps more than overpaying." },
            { q: "If I am declined, is everything over?", a: "At that company and product, yes for that application. Another company or a waiting-period plan may still be open. Mejor Vida Insurance quotes more than one path when it makes sense." },
          ],
        },
      ],
    }
  ),
];
