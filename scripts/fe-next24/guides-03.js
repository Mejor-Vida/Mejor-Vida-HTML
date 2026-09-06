"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "factores-precio-seguro-gastos-finales",
    "what-affects-final-expense-insurance-cost",
    ["cuanto-cuesta-seguro-gastos-finales", "edad-contratar-seguro-gastos-finales", "seguro-gastos-finales-fumadores"],
    {
      question: "¿Qué factores afectan el precio del seguro de gastos finales?",
      headline: "Por qué dos personas pagan distinto por el mismo monto",
      dek: "La edad, el tabaco, la salud, el sexo, el monto y la compañía mueven la prima. El código postal importa menos que el tipo de plan.",
      pageTitle: "Qué afecta el precio del seguro de gastos finales",
      metaDescription:
        "Qué hace subir o bajar la prima de un seguro de gastos finales: edad, tabaco, salud, monto y tipo de plan. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "La prima es el precio periódico del seguro. En un plan de prima nivelada, ese precio no sube por edad después de emitirse, si usted paga a tiempo.",
        "Comprar más tarde suele costar más cada mes por el mismo monto.",
        "El tabaco, en las compañías que cotizamos, coloca a la persona en una clase de precio más alta. No publicamos un multiplicador único porque no es el mismo en todos los productos.",
        "Un plan que paga completo desde el inicio suele costar menos por dólar que un plan de aceptación garantizada con espera.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "El precio de un seguro de gastos finales no es un impuesto fijo. Es una oferta de una compañía para una persona concreta. Por eso una cotización en línea pide edad, sexo, tabaco y estado, y luego vienen preguntas de salud." },
        { type: "h2", text: "Lo que más mueve el número" },
        { type: "p", text: "La edad al comprar es el factor más visible. A los 50, un $10,000 ilustrativo de gastos finales (no fumador, buena salud, agosto 2026) ronda $28 al mes para mujer y $34 para hombre. A los 70, esas mismas condiciones ilustrativas suben a unos $53 y $70. No es que la compañía “castigue” a nadie: el riesgo de fallecer en los años próximos es distinto." },
        { type: "p", text: "El monto cubierto escala el precio. $15,000 no cuesta lo mismo que $5,000. Tampoco es siempre el triple exacto, porque cada producto redondea y tiene mínimos." },
        { type: "p", text: "El tabaco —cigarro, vapeo u otros productos según lo que pregunte el formulario— suele subir la prima. No inventamos un “30% más” universal. Cada compañía define qué cuenta como tabaco y por cuántos meses sin uso se considera no fumador." },
        { type: "h2", text: "Salud y tipo de plan" },
        { type: "p", text: "Las preguntas de salud no existen para molestar. Deciden si la compañía puede ofrecer un plan que pague el monto completo desde el primer pago, un plan con periodo de espera, o si solo queda un plan sin preguntas y con espera. El último camino suele costar más por cada dólar de beneficio." },
        { type: "p", text: "El sexo aparece en muchas tablas de precio de vida permanente. En las cotizaciones ilustrativas que publicamos, las mujeres pagan menos que los hombres a la misma edad y monto, en no fumador. Eso no es una opinión de la agencia; es cómo están construidas esas tablas." },
        {
          type: "table",
          caption: "Ejemplo educativo: $10,000 al mes, no fumador, buena salud",
          lead: "Cifras ilustrativas de compañías designadas, agosto 2026. No son una oferta ni un promedio nacional.",
          headers: ["Edad", "Mujer (aprox./mes)", "Hombre (aprox./mes)"],
          rows: [
            ["50", "$28", "$34"],
            ["65", "$41", "$54"],
            ["70", "$53", "$70"],
            ["75", "$71", "$97"],
          ],
          foot: "Si hay tabaco, otro estado de salud o un plan con espera, el número cambia. Pida una cotización con sus datos.",
        },
        { type: "note", text: "No nombramos una compañía “más barata” para todos. Mutual of Omaha, American Amicable, Accendo, Transamerica, Americo, Assurity y Corebridge no usan la misma tabla. El más bajo para una persona de 62 no-fumadora puede no ser el más bajo para un fumador de 74." },
        { type: "h2", text: "Qué no debe confundir el precio" },
        { type: "ul", items: [
          "El precio del seguro no es la factura de la funeraria. Son cuentas distintas.",
          "Un anuncio de “desde $20 al mes” casi nunca dice la edad, el monto ni si hay espera.",
          "El valor en efectivo, si el contrato lo acumula, no es un ahorro líquido igual a un banco. Pedir prestado contra la póliza reduce el beneficio si no se paga.",
        ] },
        {
          type: "faq",
          items: [
            { q: "¿El precio sube cada año?", a: "En un gasto final de prima nivelada, no por edad. Puede cambiar si deja de pagar, si hay un préstamo o si el contrato lo permite por otra razón escrita. Un temporal es otro diseño." },
            { q: "¿El estado cambia mucho el precio?", a: "El producto tiene que estar disponible donde usted vive. El tipo de plan y la edad suelen mover más el número que el código postal, pero no publicamos un ranking de estados." },
            { q: "¿Pagar anual es más barato?", a: "Algunas compañías dan un descuento pequeño por pagar de menos veces al año. No es universal. Hay que ver la ilustración." },
          ],
        },
      ],
    },
    {
      question: "What affects the cost of final expense insurance?",
      headline: "Why two people pay different prices for the same amount",
      dek: "Age, tobacco, health, sex, amount, and company move the premium. ZIP code matters less than the type of plan.",
      pageTitle: "What affects final expense insurance cost",
      metaDescription:
        "What raises or lowers a final expense premium: age, tobacco, health, amount, and plan type. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "The premium is the regular price of the insurance. On a level-premium plan, that price does not rise with age after issue if you pay on time.",
        "Buying later usually costs more each month for the same amount.",
        "Tobacco, at the companies we quote, places a person in a higher price class. We do not publish one multiplier because it is not the same on every product.",
        "A plan that can pay in full from day one usually costs less per dollar than a guaranteed-acceptance plan with a wait.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "The price of final expense insurance is not a flat tax. It is a company’s offer for one person. That is why an online quote asks for age, sex, tobacco, and state, and then health questions follow." },
        { type: "h2", text: "What moves the number most" },
        { type: "p", text: "Age at purchase is the most visible factor. At 50, an illustrative $10,000 final expense figure (non-tobacco, good health, August 2026) is near $28 a month for a woman and $34 for a man. At 70, those same educational conditions rise to about $53 and $70. The company is not “punishing” anyone: the chance of dying in the coming years is different." },
        { type: "p", text: "The coverage amount scales the price. $15,000 does not cost the same as $5,000. It is also not always an exact multiple, because each product rounds and has minimums." },
        { type: "p", text: "Tobacco — cigarettes, vaping, or other products as the form defines them — usually raises the premium. We do not invent a universal “30% more.” Each company defines what counts as tobacco and how many tobacco-free months count as non-tobacco." },
        { type: "h2", text: "Health and plan type" },
        { type: "p", text: "Health questions are not there to annoy you. They decide whether the company can offer a plan that pays the full amount from the first payment, a waiting-period plan, or only a no-questions plan with a wait. That last path usually costs more per dollar of benefit." },
        { type: "p", text: "Sex appears in many permanent-life price tables. In the illustrative quotes we publish, women pay less than men at the same age and amount, non-tobacco. That is not an agency opinion; it is how those tables are built." },
        {
          type: "table",
          caption: "Educational example: $10,000 a month, non-tobacco, good health",
          lead: "Illustrative figures from appointed companies, August 2026. Not an offer and not a national average.",
          headers: ["Age", "Woman (approx./month)", "Man (approx./month)"],
          rows: [
            ["50", "$28", "$34"],
            ["65", "$41", "$54"],
            ["70", "$53", "$70"],
            ["75", "$71", "$97"],
          ],
          foot: "Tobacco, a different health picture, or a waiting-period plan changes the number. Ask for a quote with your details.",
        },
        { type: "note", text: "We do not name one “cheapest” company for everyone. Mutual of Omaha, American Amicable, Accendo, Transamerica, Americo, Assurity, and Corebridge do not share one table. The lowest price for a 62-year-old non-smoker may not be the lowest for a 74-year-old smoker." },
        { type: "h2", text: "What should not confuse the price" },
        { type: "ul", items: [
          "The insurance price is not the funeral-home invoice. They are different bills.",
          "An ad that says “from $20 a month” almost never states the age, amount, or whether there is a wait.",
          "Cash value, if the contract builds it, is not the same as a bank savings account. A loan against the policy reduces the benefit if it is not repaid.",
        ] },
        {
          type: "faq",
          items: [
            { q: "Does the price rise every year?", a: "On level-premium final expense, not because of age. It can change if you stop paying, if there is a loan, or if the contract allows another written reason. Term life is a different design." },
            { q: "Does the state change the price a lot?", a: "The product has to be available where you live. Plan type and age usually move the number more than ZIP code, but we do not publish a state ranking." },
            { q: "Is paying annually cheaper?", a: "Some companies give a small discount for paying fewer times a year. It is not universal. Check the illustration." },
          ],
        },
      ],
    }
  ),

  pack(
    "examen-medico-seguro-gastos-finales",
    "do-i-need-a-medical-exam-for-final-expense",
    ["seguro-gastos-finales-con-problemas-salud", "seguro-gastos-finales-sin-examen-nebraska", "tipos-planes-seguro-gastos-finales"],
    {
      question: "¿Necesito examen médico para un seguro de gastos finales?",
      headline: "Sin examen en el consultorio no significa sin preguntas de salud",
      dek: "La mayoría de los planes de gastos finales que cotizamos no piden un examen físico en una clínica. Sí piden respuestas honestas sobre salud. Eso no es lo mismo que un temporal grande sin examen.",
      pageTitle: "¿Necesito examen médico para gastos finales?",
      metaDescription:
        "Si el seguro de gastos finales pide examen médico, qué preguntas de salud hay y cómo se diferencia de un seguro temporal. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "En los productos de gastos finales que Mejor Vida Seguros cotiza, lo habitual es no ir a un consultorio a que le saquen sangre por ese trámite.",
        "“Sin examen” no quiere decir “sin preguntas.” La compañía todavía puede revisar las respuestas y, en muchos casos, historial que usted autoriza.",
        "Un plan sin preguntas de salud existe, con aceptación garantizada, y suele incluir un periodo de espera.",
        "Mentir en la solicitud puede poner en riesgo el pago. Conteste lo que el médico ha escrito, no lo que “suena mejor.”",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "Muchas personas evitan el seguro porque imaginan una bata, una báscula y un laboratorio. En gastos finales, el atajo habitual es otro: un formulario de preguntas y una decisión de la compañía, sin esa visita. Eso no convierte el proceso en un trámite vacío." },
        { type: "h2", text: "Qué suele pasar al solicitar" },
        { type: "p", text: "Usted responde si ha estado en el hospital hace poco, si usa oxígeno, si hay un diagnóstico reciente de cáncer o del corazón, y otras preguntas que cada formulario lista. La compañía decide si puede ofrecer un plan que pague completo desde el primer pago, un plan con espera, o si no emitirá." },
        { type: "p", text: "Un seguro temporal de $250,000 “sin examen” es otro producto, con otros topes de edad y de monto. No use ese anuncio para adivinar un gasto final de $10,000." },
        { type: "h2", text: "Tres caminos, sin jerga de laboratorio" },
        { type: "ul", items: [
          "Preguntas detalladas, sin examen en consultorio: si la compañía emite, el monto completo puede aplicar por una muerte natural cubierta desde el primer pago.",
          "Siguen habiendo preguntas, pero el beneficio por muerte no accidental es limitado al inicio: es un plan con periodo de espera.",
          "Sin preguntas de salud: aceptación garantizada, con espera típica de unos dos años para muerte no accidental en la línea que cotizamos (por ejemplo Corebridge), y un tope de monto más bajo.",
        ] },
        {
          type: "table",
          caption: "Examen, preguntas y espera — cómo se relacionan",
          lead: "La columna de espera habla de muerte no accidental. Un accidente cubierto puede pagar distinto; el contrato manda.",
          headers: ["Camino", "¿Examen en consultorio?", "¿Preguntas de salud?", "¿Espera típica?"],
          rows: [
            ["Plan que paga completo si califica", "Por lo general no, en gastos finales designados", "Sí", "No, si se emite así"],
            ["Plan con beneficio limitado al inicio", "Por lo general no", "Sí", "Suele ser de dos a tres años según compañía"],
            ["Aceptación garantizada", "No", "No", "Suele ser cerca de dos años en la línea que cotizamos"],
          ],
          foot: "“Típico” no es una garantía. Accendo, Living Promise y American Amicable no copian la misma fórmula de los primeros años.",
        },
        { type: "h2", text: "Qué no prometemos" },
        { type: "p", text: "No prometemos aprobación en 24 horas para todas las solicitudes. A veces la decisión es rápida. A veces la compañía pide más información y el reloj se alarga. Tampoco prometemos que “sin examen” oculte un diagnóstico. Si la pregunta está en el formulario, hay que responderla." },
        { type: "h2", text: "Productos de ejemplo" },
        { type: "p", text: "Living Promise Nivelado, Accendo Level, Transamerica Immediate Solution y Americo Eagle Select Nivelado son ejemplos de vías con preguntas y, si se califica, beneficio completo desde el inicio. Corebridge de aceptación garantizada es el ejemplo que usamos cuando las preguntas no dan esa vía. American Amicable Golden Solution y Senior Choice también tienen diseños de pago completo y de los primeros años limitados, con edades típicas 50–85." },
        {
          type: "faq",
          items: [
            { q: "¿Me van a pesar o a sacar sangre?", a: "En el flujo habitual de gastos finales que cotizamos, no hay una cita de laboratorio por ese producto. Si otra cobertura (por ejemplo un temporal grande) sí la pide, es otro trámite." },
            { q: "¿Puedo omitir un medicamento para que me aprueben?", a: "No. Omitir información que el formulario pide puede afectar el reclamo. Diga lo que el médico recetó." },
            { q: "¿Sin examen es más caro?", a: "No necesariamente frente a un temporal examinado de monto enorme. Frente a un gasto final que paga completo, un plan sin preguntas suele costar más por dólar porque la compañía acepta más riesgo." },
          ],
        },
      ],
    },
    {
      question: "Do I need a medical exam for final expense insurance?",
      headline: "No office exam does not mean no health questions",
      dek: "Most final expense plans we quote do not send you to a clinic for a physical. They do ask honest health questions. That is not the same as a large no-exam term policy.",
      pageTitle: "Do I need a medical exam for final expense?",
      metaDescription:
        "Whether final expense insurance requires a medical exam, what health questions remain, and how that differs from term life. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "On final expense products Mejor Vida Insurance quotes, the usual path is not an in-office blood draw for that application.",
        "“No exam” does not mean “no questions.” The company can still review answers and, in many cases, history you authorize.",
        "A no-questions plan exists — guaranteed acceptance — and it usually includes a waiting period.",
        "Misstating the application can put a claim at risk. Answer what the doctor has written, not what sounds better.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "Many people avoid insurance because they picture a gown, a scale, and a lab. For final expense, the usual shortcut is different: a question form and a company decision, without that visit. That does not make the process empty." },
        { type: "h2", text: "What applying usually looks like" },
        { type: "p", text: "You answer whether you have been in the hospital recently, whether you use oxygen, whether there is a recent cancer or heart diagnosis, and other items each form lists. The company decides whether it can offer a plan that pays in full from the first payment, a waiting-period plan, or no issue at all." },
        { type: "p", text: "A $250,000 “no exam” term policy is a different product, with different age and amount caps. Do not use that ad to guess a $10,000 final expense plan." },
        { type: "h2", text: "Three paths, without lab jargon" },
        { type: "ul", items: [
          "Detailed questions, no office exam: if the company issues, the full amount can apply for a covered natural death from the first payment.",
          "Questions remain, but the non-accidental benefit is limited at first: that is a waiting-period plan.",
          "No health questions: guaranteed acceptance, with a typical wait of about two years for non-accidental death on the line we quote (for example Corebridge), and a lower amount cap.",
        ] },
        {
          type: "table",
          caption: "Exam, questions, and waiting — how they relate",
          lead: "The waiting column is about non-accidental death. A covered accident can pay differently; the contract controls.",
          headers: ["Path", "Office exam?", "Health questions?", "Typical wait?"],
          rows: [
            ["Full-pay plan if you qualify", "Generally no, on appointed final expense", "Yes", "No, if issued that way"],
            ["Limited benefit at first", "Generally no", "Yes", "Often two to three years by company"],
            ["Guaranteed acceptance", "No", "No", "About two years on the line we quote"],
          ],
          foot: "“Typical” is not a guarantee. Accendo, Living Promise, and American Amicable do not copy the same early-year formula.",
        },
        { type: "h2", text: "What we will not promise" },
        { type: "p", text: "We do not promise 24-hour approval on every application. Sometimes the decision is fast. Sometimes the company asks for more information and the clock stretches. We also do not promise that “no exam” hides a diagnosis. If the question is on the form, it has to be answered." },
        { type: "h2", text: "Product examples" },
        { type: "p", text: "Living Promise Level, Accendo Level, Transamerica Immediate Solution, and Americo Eagle Select Level are examples of paths with questions and, if you qualify, a full benefit from the start. Corebridge guaranteed acceptance is the example we use when questions will not support that path. American Amicable Golden Solution and Senior Choice also have full-pay and limited-early-year designs, typically ages 50–85." },
        {
          type: "faq",
          items: [
            { q: "Will they weigh me or draw blood?", a: "In the usual final expense flow we quote, there is no lab appointment for that product. If another coverage (for example a large term policy) does require it, that is a separate process." },
            { q: "Can I leave a medication off so I get approved?", a: "No. Leaving out information the form asks for can affect a claim. Say what the doctor prescribed." },
            { q: "Is no-exam more expensive?", a: "Not necessarily compared with a fully examined huge term policy. Compared with a full-pay final expense plan, a no-questions plan usually costs more per dollar because the company is accepting more risk." },
          ],
        },
      ],
    }
  ),
];
