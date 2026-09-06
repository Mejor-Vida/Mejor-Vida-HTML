"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "periodo-carencia-seguro-gastos-finales",
    "final-expense-waiting-period",
    ["poliza-graduada-gastos-finales", "tipos-planes-seguro-gastos-finales", "cuanto-tiempo-aprobacion-poliza-gastos-finales"],
    {
      question: "¿Qué es el período de espera de un seguro de gastos finales?",
      headline: "El periodo de espera, explicado sin letra pequeña de miedo",
      dek: "Es el tramo al inicio de algunas pólizas en el que una muerte por enfermedad puede pagar menos que el monto completo. No todas las pólizas lo tienen. Si califica a un plan de beneficio inmediato, esa espera no aplica.",
      pageTitle: "Periodo de espera en el seguro de gastos finales",
      metaDescription:
        "Qué significa el periodo de espera en un seguro de gastos finales, cuánto suele durar y qué paga un accidente. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Periodo de espera: tiempo al inicio en el que el pago por muerte no accidental está limitado o es una devolución de primas más un interés del contrato.",
        "Suele durar unos dos o tres años, según el producto — no hay un único número nacional.",
        "Un accidente que el contrato cubre suele pagar el monto completo durante ese tiempo.",
        "Un plan de beneficio completo, si se emite, no usa esa espera para muerte natural cubierta.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La gente oye “espera” y piensa que la póliza no existe. Existe. Lo que espera es el cheque completo por una muerte por enfermedad. Esa distinción es la que evita sorpresas en un reclamo." },
        { type: "h2", text: "Cuándo aparece y cuándo no" },
        { type: "p", text: "Aparece en planes de beneficio limitado al inicio y en aceptación garantizada. No aparece en un Living Promise Nivelado, Accendo Level, Immediate Solution o Eagle Select Nivelado emitidos como beneficio completo. Mezclar esos caminos en una sola frase es el error más común de los anuncios." },
        { type: "h2", text: "Qué debe preguntar, en cuatro puntos" },
        { type: "ul", items: [
          "¿Cuántos años cuenta la espera?",
          "Si la muerte es por enfermedad en el año 1, ¿devuelven primas, pagan un porcentaje del monto, u otra regla?",
          "¿Un accidente cubierto paga el 100% desde el día uno?",
          "¿El reloj empieza en la fecha de emisión o en el primer pago?",
        ] },
        {
          type: "table",
          caption: "Duraciones que sí podemos anclar a productos",
          lead: "Si su oferta no es uno de estos nombres, no copie la fila. Pida el contrato.",
          headers: ["Producto", "Espera típica (muerte no accidental)"],
          rows: [
            ["Living Promise con espera", "Dos años (primas + 10%), luego 100%"],
            ["American Amicable, primeros años limitados", "Dos años de porcentajes (30% / 70%), 100% en el año 3"],
            ["Accendo modificado", "Dos años (devolución típica 110% de primas ganadas), 100% en el año 3"],
            ["Corebridge GIWL (línea cotizada)", "Unos dos años (primas + interés contractual)"],
          ],
          foot: "“Unos dos a tres años” en lenguaje general cubre esta familia de productos. No es una ley federal.",
        },
        { type: "h2", text: "Por qué la fecha del diagnóstico importa" },
        { type: "p", text: "La espera no “borra” un cáncer que ya existía; el formulario ya preguntó por él al emitir. Mentir para evitar la espera puede dañar el reclamo. Si un evento es muy reciente, a veces la opción honesta es la espera o esperar a que pase el tiempo que el plan inmediato exige." },
        {
          type: "faq",
          items: [
            { q: "¿Puedo comprar dos pólizas para saltarme la espera?", a: "Comprar dos planes con espera no convierte el año 1 en 100%. Un plan inmediato en otra compañía, si califica, sí evita esa espera." },
            { q: "¿La espera es lo mismo que el periodo de gracia?", a: "No. El periodo de gracia es el tiempo extra para pagar una prima atrasada. La espera es una regla de cómo se calcula el beneficio al inicio." },
            { q: "¿Empieza otra vez si cambio de dueño?", a: "Depende del contrato. No asumimos un reinicio ni una continuidad. Hay que leer esa póliza." },
          ],
        },
      ],
    },
    {
      question: "What is a final expense waiting period?",
      headline: "The waiting period, explained without scary fine print",
      dek: "It is the stretch at the start of some policies when a death from illness may pay less than the full amount. Not every policy has one. If you qualify for an immediate full-benefit plan, that wait does not apply.",
      pageTitle: "Final expense insurance waiting period",
      metaDescription:
        "What a waiting period means on final expense insurance, how long it usually lasts, and what an accident pays. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Waiting period: time at the start when payment for non-accidental death is limited or is a return of premiums plus contract interest.",
        "It often lasts about two or three years, depending on the product — there is no single national number.",
        "An accident the contract covers usually pays the full amount during that time.",
        "A full-benefit plan, if issued, does not use that wait for a covered natural death.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "People hear “waiting period” and think the policy does not exist. It exists. What waits is the full check for a death from illness. That distinction is what prevents a surprise at claim time." },
        { type: "h2", text: "When it shows up and when it does not" },
        { type: "p", text: "It shows up on limited-early-benefit plans and guaranteed acceptance. It does not show up on a Living Promise Level, Accendo Level, Immediate Solution, or Eagle Select Level issued as a full benefit. Mixing those paths in one sentence is the most common mistake in ads." },
        { type: "h2", text: "What you should ask, in four points" },
        { type: "ul", items: [
          "How many years does the wait last?",
          "If death is from illness in year 1, do they return premiums, pay a percentage of the amount, or use another rule?",
          "Does a covered accident pay 100% from day one?",
          "Does the clock start on the issue date or on the first payment?",
        ] },
        {
          type: "table",
          caption: "Durations we can anchor to products",
          lead: "If your offer is not one of these names, do not copy the row. Ask for the contract.",
          headers: ["Product", "Typical wait (non-accidental death)"],
          rows: [
            ["Living Promise with a wait", "Two years (premiums + 10%), then 100%"],
            ["American Amicable, limited early years", "Two years of percentages (30% / 70%), 100% in year 3"],
            ["Accendo modified", "Two years (typical return of 110% of earned premiums), 100% in year 3"],
            ["Corebridge GIWL (quoted line)", "About two years (premiums + contract interest)"],
          ],
          foot: "“About two to three years” in general language covers this product family. It is not a federal law.",
        },
        { type: "h2", text: "Why the diagnosis date matters" },
        { type: "p", text: "The wait does not “erase” a cancer that already existed; the form already asked about it at issue. Lying to avoid the wait can harm a claim. If an event is very recent, the honest option is sometimes the wait, or waiting until the time an immediate plan requires has passed." },
        {
          type: "faq",
          items: [
            { q: "Can I buy two policies to skip the wait?", a: "Buying two waiting-period plans does not turn year 1 into 100%. An immediate plan at another company, if you qualify, does avoid that wait." },
            { q: "Is the wait the same as a grace period?", a: "No. A grace period is extra time to pay a late premium. The wait is a rule about how the benefit is calculated at the start." },
            { q: "Does it start over if I change owners?", a: "It depends on the contract. We assume neither a reset nor a continuation. Read that policy." },
          ],
        },
      ],
    }
  ),

  pack(
    "cancelar-seguro-gastos-finales",
    "canceling-final-expense-insurance",
    ["que-son-polizas-gastos-finales", "factores-precio-seguro-gastos-finales", "seguro-gastos-finales-vs-prepago-funerario"],
    {
      question: "¿Puedo cancelar un seguro de gastos finales?",
      headline: "Cancelar o dejar de pagar: qué se pierde y qué no prometemos devolver",
      dek: "Sí puede terminar una póliza. Cuando deja de estar vigente, el beneficio ya no se pagará. Un reembolso no es automático: depende del contrato, de un posible valor en efectivo y de las reglas de devolución de su estado.",
      pageTitle: "Cancelar un seguro de gastos finales",
      metaDescription:
        "Qué ocurre si cancela o deja de pagar un seguro de gastos finales. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Usted puede pedir la cancelación o simplemente dejar que la póliza caduque por falta de pago, según el contrato.",
        "Sin póliza vigente, no hay cheque para la familia.",
        "No prometemos que le devuelvan todas las primas. Algunos contratos tienen valor en efectivo; otros, en la práctica, muy poco al inicio.",
        "Hay un periodo de gracia para una prima atrasada. Agotado ese tiempo, la cobertura puede terminar.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La gente cancela porque el presupuesto cambió, porque compró otra póliza, o porque un vendedor agresivo la presionó. Antes de cortar, conviene saber qué hay del otro lado: no cobertura, y tal vez poco o nada de dinero de vuelta." },
        { type: "h2", text: "Tres formas en que una póliza se apaga" },
        { type: "ul", items: [
          "Usted pide por escrito (o por el canal que la compañía acepte) que la cancelen.",
          "Un débito no pasa y, tras el periodo de gracia, la póliza caduca.",
          "En un periodo corto de “prueba” al inicio, algunas pólizas permiten devolver el contrato según la ley del estado. Eso no dura para siempre.",
        ] },
        { type: "h2", text: "Qué pasa con el dinero ya pagado" },
        { type: "p", text: "Un seguro de vida no es una cuenta de ahorros. Las primas pagaron el riesgo de esos meses. Si hay valor en efectivo, el contrato dice si puede pedir una parte al cancelar. En muchos gastos finales de monto pequeño, ese valor al principio es limitado o nulo para efectos prácticos. No inventamos un porcentaje de devolución." },
        { type: "note", text: "Si alguien le dijo “recupera todo si cancelas el primer año,” pida esa frase en el contrato. Si no está escrita, no la damos por cierta." },
        { type: "h2", text: "Antes de cancelar, compare el motivo" },
        { type: "p", text: "Si la prima no cabe, a veces se puede bajar el monto en una póliza nueva o buscar otra compañía — la salud y la edad actual cuentan otra vez. Si hay dos pólizas para el mismo funeral, cancelar la duplicada puede tener sentido. Si está dentro de una espera y ya pagó un año, cancelar reinicia el reloj en cualquier póliza nueva." },
        { type: "h2", text: "Cómo hacerlo con cuidado" },
        { type: "p", text: "Confirme con la compañía que la cancelación quedó registrada. Guarde el correo o la carta. No asuma que “no pagar un mes” es una pausa: puede ser el inicio de una caducidad. Si un agente de Mejor Vida Seguros le ayudó a emitir, puede ayudar a leer las opciones; la decisión de terminar es suya." },
        {
          type: "faq",
          items: [
            { q: "¿Me pueden impedir cancelar?", a: "Como dueño, en general puede terminar el contrato. El prestamista si hay una cesión, o un dueño distinto del asegurado, cambia el quién. Lea quién figura como dueño." },
            { q: "¿Cancelar afecta mi crédito?", a: "No tratamos la cancelación de vida como una cuenta de tarjeta. Una funeraria impagada es otra deuda. No mezclamos esos informes." },
            { q: "¿Puedo reabrir la misma póliza después?", a: "A veces hay reinstalo si el contrato lo permite, con pruebas de salud y primas atrasadas. No es un derecho automático." },
          ],
        },
      ],
    },
    {
      question: "Can I cancel final expense insurance?",
      headline: "Canceling or stopping payment: what you lose, and what we will not promise to refund",
      dek: "Yes, you can end a policy. When it is no longer in force, the benefit will not be paid. A refund is not automatic: it depends on the contract, any cash value, and your state’s return rules.",
      pageTitle: "Canceling final expense insurance",
      metaDescription:
        "What happens if you cancel or stop paying final expense insurance. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "You can request cancellation or simply let the policy lapse for nonpayment, as the contract allows.",
        "With no in-force policy, there is no check for the family.",
        "We do not promise that all premiums come back. Some contracts have cash value; others have little at the start for practical purposes.",
        "There is a grace period for a late premium. After that time runs out, coverage can end.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "People cancel because the budget changed, because they bought another policy, or because a hard sell pushed them. Before you cut it, it helps to know what is on the other side: no coverage, and maybe little or no money back." },
        { type: "h2", text: "Three ways a policy turns off" },
        { type: "ul", items: [
          "You ask in writing (or through the channel the company accepts) to cancel.",
          "A draft fails and, after the grace period, the policy lapses.",
          "In a short “free look” at the start, some policies let you return the contract under state law. That window does not last forever.",
        ] },
        { type: "h2", text: "What happens to money already paid" },
        { type: "p", text: "Life insurance is not a savings account. Premiums paid for the risk in those months. If there is cash value, the contract says whether you can take some of it at cancel. On many small final expense policies, that value is limited or practically none at the beginning. We do not invent a refund percentage." },
        { type: "note", text: "If someone told you “you get everything back if you cancel in year one,” ask for that sentence in the contract. If it is not written, we will not treat it as true." },
        { type: "h2", text: "Before you cancel, match the reason" },
        { type: "p", text: "If the premium does not fit, you can sometimes lower the amount on a new policy or try another company — current health and age count again. If there are two policies for the same funeral, canceling the duplicate may make sense. If you are inside a waiting period and already paid a year, canceling resets the clock on any new policy." },
        { type: "h2", text: "How to do it carefully" },
        { type: "p", text: "Confirm with the company that the cancellation was recorded. Keep the email or letter. Do not assume that “skipping a month” is a pause: it can be the start of a lapse. If a Mejor Vida Insurance agent helped you issue, they can help you read the options; ending the policy is your decision." },
        {
          type: "faq",
          items: [
            { q: "Can they stop me from canceling?", a: "As owner, you can generally end the contract. A lender if there is an assignment, or an owner who is not the insured, changes who. Read who is listed as owner." },
            { q: "Does canceling hurt my credit?", a: "We do not treat life-insurance cancellation like a credit-card account. An unpaid funeral home is a different debt. We do not mix those reports." },
            { q: "Can I reopen the same policy later?", a: "Sometimes reinstatement is allowed if the contract says so, with health proof and back premiums. It is not an automatic right." },
          ],
        },
      ],
    }
  ),
];
