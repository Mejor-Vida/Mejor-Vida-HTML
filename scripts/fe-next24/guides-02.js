"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "que-son-polizas-gastos-finales",
    "what-are-final-expense-policies",
    ["diferencia-seguro-vida-y-gastos-finales", "tipos-planes-seguro-gastos-finales", "periodo-carencia-seguro-gastos-finales"],
    {
      question: "¿Qué son las pólizas de gastos finales?",
      headline: "Qué es una póliza de gastos finales y cómo se mantiene vigente",
      dek: "Una póliza es el contrato escrito. En gastos finales suele ser vida permanente de monto pequeño, con una prima que no sube por edad si usted paga a tiempo.",
      pageTitle: "Qué son las pólizas de seguro de gastos finales",
      metaDescription:
        "Qué es una póliza de gastos finales, qué significa prima nivelada, quién cobra el beneficio y qué pasa si deja de pagar. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "La póliza es el contrato entre usted (o el dueño) y la compañía de seguros.",
        "En gastos finales, el diseño más común es vida permanente con prima nivelada: el precio periódico no sube solo porque usted cumpla años.",
        "Usted nombra uno o más beneficiarios. Ellos reciben el dinero en efectivo; no hay una lista de compras obligatoria de la funeraria.",
        "Si los pagos se detienen más allá de lo que el contrato permite, la cobertura puede terminar.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La gente pregunta por “el seguro” y a veces no ve el documento. La póliza es ese documento: nombres, monto, prima, qué está cubierto y qué no. El agente puede explicar, pero el contrato es lo que la compañía pagará." },
        { type: "h2", text: "Las piezas que importan en el día a día" },
        { type: "p", text: "El asegurado es la persona cuya muerte activa el pago. El dueño es quien controla la póliza (a veces es la misma persona). El beneficiario es quien recibe el cheque. Puede haber más de un beneficiario, y se pueden cambiar según las reglas de la compañía mientras la póliza esté vigente." },
        { type: "p", text: "El monto —a veces llamado valor nominal— es la cifra que la compañía promete si el fallecimiento está cubierto y la póliza está al día. En gastos finales ese número suele ser el de un funeral, no el de una casa." },
        { type: "h2", text: "Qué significa prima nivelada" },
        { type: "p", text: "Prima es el precio que usted paga, casi siempre cada mes. Prima nivelada significa que ese precio se queda igual mientras usted pague a tiempo y no cambie el contrato. No significa que dos personas de la misma edad paguen lo mismo: tabaco, salud, sexo y compañía mueven el número al inicio." },
        { type: "p", text: "Si deja de pagar, la compañía no “congela” el precio para siempre. Tras el periodo de gracia que escriba el contrato, la póliza puede caducar. Caducar significa que ya no hay beneficio. No prometemos reembolsos automáticos; eso depende de cada póliza y de si hay valor en efectivo." },
        { type: "h2", text: "Tres formas en que un plan puede pagar" },
        { type: "p", text: "Un plan que paga el monto completo desde el primer pago, si usted califica, es el que muchas familias buscan primero. Un plan con periodo de espera paga menos, o devuelve primas más un interés del contrato, si la muerte no es accidental durante los primeros años. Un plan de aceptación garantizada no hace preguntas de salud y también suele tener espera. Mejor Vida Seguros explica esas vías con palabras de todos los días; el contrato de cada compañía es el que manda." },
        {
          type: "table",
          caption: "Quién es quién en la póliza",
          lead: "Si estos nombres no coinciden con lo que usted quiere, pida cambiarlos antes de firmar.",
          headers: ["Rol", "Qué hace", "Por qué importa"],
          rows: [
            ["Asegurado", "La persona cubierta", "Su fallecimiento es el evento que puede pagar el beneficio"],
            ["Dueño", "Controla cambios y pagos", "Puede no ser el asegurado (por ejemplo un hijo dueño de la póliza de un padre)"],
            ["Beneficiario", "Recibe el cheque", "Puede usarlo para el funeral u otras necesidades; no está atado a una funeraria"],
            ["Compañía", "Emite y paga según el contrato", "Cada producto tiene edades y montos propios"],
          ],
          foot: "Los nombres legales pueden variar un poco según el formulario. Pida que se los señalen en su copia.",
        },
        { type: "h2", text: "Ejemplos de productos, no una lista de “ganadores”" },
        { type: "p", text: "Living Promise Nivelado de Mutual of Omaha, en materiales de producto, emite de 45 a 85 y hasta unos $50,000. Golden Solution y Senior Choice de American Amicable, en general de 50 a 85, pueden estructurar el beneficio como pago completo, como un plan que aumenta el pago en los primeros años, o como un plan que en esos años devuelve primas más un interés escrito. Accendo Level puede llegar a 89 con un tope de $25,000 a edades 76–89. Esas cifras son educativas. La oferta real sale de la solicitud." },
        {
          type: "faq",
          items: [
            { q: "¿La póliza vence a los 80?", a: "Un gasto final permanente no está diseñado para vencer por edad como un temporal. Sigue mientras se pague según el contrato. La edad máxima para comprar sí existe y cambia por producto." },
            { q: "¿Puedo tener dos pólizas?", a: "A veces sí. Cada compañía mira el total de cobertura y las respuestas de salud. No asumimos que “más pólizas” sea siempre mejor." },
            { q: "¿El beneficiario tiene que mostrar facturas de la funeraria?", a: "En un seguro de vida típico, no. El pago es en efectivo al beneficiario. Un prepago funerario es otro tipo de contrato." },
          ],
        },
        { type: "sources", items: [SRC.naic] },
      ],
    },
    {
      question: "What are final expense policies?",
      headline: "What a final expense policy is and how it stays in force",
      dek: "A policy is the written contract. For final expense it is usually small permanent life insurance with a premium that does not rise with age if you pay on time.",
      pageTitle: "What are final expense insurance policies?",
      metaDescription:
        "What a final expense policy is, what a level premium means, who is paid, and what happens if you stop paying. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "The policy is the contract between you (or the owner) and the insurance company.",
        "Final expense is usually permanent life with a level premium: the regular price does not rise just because you have a birthday.",
        "You name one or more beneficiaries. They receive cash; there is no required funeral-home shopping list.",
        "If payments stop beyond what the contract allows, coverage can end.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "People ask about “the insurance” and sometimes never see the document. The policy is that document: names, amount, premium, what is covered, and what is not. An agent can explain, but the contract is what the company will pay." },
        { type: "h2", text: "The parts that matter day to day" },
        { type: "p", text: "The insured is the person whose death can trigger the payment. The owner controls the policy (sometimes the same person). The beneficiary receives the check. You can name more than one beneficiary, and you can usually change them under company rules while the policy is in force." },
        { type: "p", text: "The amount — sometimes called the face amount — is the figure the company promises if the death is covered and the policy is in good standing. For final expense that number is usually funeral-sized, not house-sized." },
        { type: "h2", text: "What a level premium means" },
        { type: "p", text: "The premium is the price you pay, most often every month. Level premium means that price stays the same while you pay on time and do not change the contract. It does not mean two people the same age pay the same amount: tobacco, health, sex, and company move the number at issue." },
        { type: "p", text: "If you stop paying, the company does not freeze the price forever. After the grace period the contract writes, the policy can lapse. Lapse means there is no benefit. We do not promise automatic refunds; that depends on each policy and whether cash value exists." },
        { type: "h2", text: "Three ways a plan can pay" },
        { type: "p", text: "A plan that pays the full amount from the first payment, if you qualify, is the path many families want first. A waiting-period plan pays less, or returns premiums plus contract interest, if death is not accidental in the early years. A guaranteed-acceptance plan asks no health questions and also usually has a wait. Mejor Vida Insurance explains those paths in everyday words; each company’s contract controls." },
        {
          type: "table",
          caption: "Who is who on the policy",
          lead: "If these names do not match what you want, ask to change them before you sign.",
          headers: ["Role", "What they do", "Why it matters"],
          rows: [
            ["Insured", "The person covered", "Their death is the event that can pay the benefit"],
            ["Owner", "Controls changes and payments", "May not be the insured (for example a child owning a parent’s policy)"],
            ["Beneficiary", "Receives the check", "Can use it for the funeral or other needs; not tied to one funeral home"],
            ["Company", "Issues and pays per the contract", "Each product has its own ages and amounts"],
          ],
          foot: "Legal labels can vary a little by form. Ask to have them pointed out on your copy.",
        },
        { type: "h2", text: "Product examples, not a winner list" },
        { type: "p", text: "Mutual of Omaha Living Promise Level, in product materials, issues ages 45–85 and up to about $50,000. American Amicable Golden Solution and Senior Choice, typically ages 50–85, can structure the benefit as full pay, as a plan that increases the payout over the first years, or as a plan that in those years returns premiums plus written interest. Accendo Level can reach age 89 with a $25,000 cap at ages 76–89. Those figures are educational. The real offer comes from the application." },
        {
          type: "faq",
          items: [
            { q: "Does the policy expire at 80?", a: "Permanent final expense is not designed to expire by age the way term can. It continues while you pay as the contract requires. A maximum age to buy does exist and changes by product." },
            { q: "Can I own two policies?", a: "Sometimes. Each company looks at total coverage and health answers. We do not assume that “more policies” is always better." },
            { q: "Must the beneficiary show funeral invoices?", a: "On typical life insurance, no. The payment is cash to the beneficiary. A prepaid funeral is a different kind of contract." },
          ],
        },
        { type: "sources", items: [SRC.naic] },
      ],
    }
  ),

  pack(
    "cuanta-cobertura-gastos-finales-necesito",
    "how-much-final-expense-coverage-do-i-need",
    ["vale-pena-seguro-10000-dolares", "cuanto-cuesta-un-funeral", "que-son-gastos-finales"],
    {
      question: "¿Cuánta cobertura de gastos finales necesito?",
      headline: "Cómo elegir un monto de gastos finales sin adivinar",
      dek: "El monto correcto es el de sus cuentas reales, no un anuncio. Las medianas nacionales de funeral ayudan a dimensionar; la lista de precios de su funeraria es la cifra local.",
      pageTitle: "Cuánta cobertura de gastos finales necesito",
      metaDescription:
        "Cómo decidir entre $5,000, $10,000 o $15,000 de seguro de gastos finales usando costos de funeral verificados. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Sume funeral o cremación, cementerio si aplica, deudas pequeñas y un colchón para viajes o facturas médicas pendientes.",
        "En 2023, la NFDA publicó una mediana nacional de $8,300 por funeral con velatorio y entierro, y $6,280 con velatorio y cremación, del lado de la funeraria. Parcela y lápida suelen ir aparte.",
        "$5,000, $10,000 y $15,000 son puntos de partida comunes, no una receta universal.",
        "Un monto más alto cuesta más cada mes. El tope también cambia por edad y producto.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La pregunta “¿cuánto necesito?” no se responde con un número mágico. Se responde con una lista: qué tipo de servicio quiere, dónde será, si ya hay un lote en el cementerio y qué deudas no quiere dejar a nadie." },
        { type: "h2", text: "Empiece por el servicio, no por el anuncio" },
        { type: "p", text: "Un velatorio con entierro no cuesta lo mismo que una cremación directa. La NFDA, en su estudio de listas de precios de 2023, publicó medianas nacionales del lado de la funeraria: $8,300 con velatorio y entierro, y $6,280 con velatorio y cremación. Esas cifras no incluyen, en general, parcela, bóveda, marcador ni flores." },
        { type: "p", text: "La Comisión Federal de Comercio explica que las funerarias deben dar una lista de precios general si usted la pide en persona, y cotizar por teléfono. Esa lista local gana a cualquier mediana nacional. No tenemos una mediana oficial solo para Nebraska publicada por la NFDA; para un precio de su ciudad, pida la lista." },
        { type: "h2", text: "Qué más cabe en “gastos finales”" },
        { type: "ul", items: [
          "Traslado si la persona fallece lejos de casa.",
          "Saldo de tarjetas o una factura médica que no cubrió el seguro de salud.",
          "Pasajes para que un hijo viaje al servicio.",
          "Un margen si los precios suben entre hoy y el día del funeral.",
        ] },
        {
          type: "table",
          caption: "Tres montos de partida y qué suelen alcanzar",
          lead: "Esto es un marco de conversación, no una promesa de que el funeral costará exactamente esas cifras.",
          headers: ["Monto de la póliza", "Puede encajar si…", "Puede quedarse corto si…"],
          rows: [
            ["$5,000", "Quiere una cremación sencilla y ya tiene parcela u urna, o hay ahorros aparte", "Quiere velatorio y entierro completos sin otros fondos"],
            ["$10,000", "Quiere acercarse a la mediana nacional de funeraria y dejar un poco para extras", "Hay cementerio caro, deudas médicas grandes o varios viajeros"],
            ["$15,000 o más", "Quiere funeral más deudas pequeñas y un colchón", "El producto o la edad no permiten ese tope — hay que cotizar"],
          ],
          foot: "En productos que Mejor Vida Seguros cotiza, los topes típicos de gastos finales llegan hasta unos $50,000, y bajan con la edad en algunos diseños (por ejemplo Accendo Level a $25,000 a los 76–89).",
        },
        { type: "h2", text: "El precio mensual también es parte de la decisión" },
        { type: "p", text: "Una cotización ilustrativa de gastos finales, no fumador y buena salud, para $10,000 (agosto 2026) ronda $41 al mes para una mujer de 65 años y $54 para un hombre de 65. A los 75, esas mismas cifras ilustrativas suben a unos $71 y $97. Son ejemplos educativos, no una oferta. Un monto de $15,000 costará más que $10,000 en la misma persona." },
        { type: "note", text: "No publicamos un “número correcto” único. Si sus deudas o el cementerio cambian el total, el monto de la póliza debe moverse con esa lista — o aceptar que la familia cubrirá la diferencia." },
        { type: "h2", text: "Productos y topes, al final" },
        { type: "p", text: "Living Promise Nivelado suele llegar hasta unos $50,000 entre los 45 y 85. Un plan de Living Promise con espera tiene un tope más bajo (hasta unos $20,000) y edades distintas. Corebridge de aceptación garantizada, en la línea que cotizamos, suele moverse entre $5,000 y $25,000. El monto que usted quiere y el monto que la compañía emitirá pueden no coincidir." },
        {
          type: "faq",
          items: [
            { q: "¿Debo igualar exactamente la mediana de $8,300?", a: "No. Esa cifra es nacional, de 2023, y no incluye cementerio. Úsela como escala, no como factura." },
            { q: "¿Puedo subir el monto después?", a: "A veces con una póliza nueva o un aumento si el producto lo permite. La salud y la edad en ese momento vuelven a contar. No asumimos que siempre se puede subir." },
            { q: "¿$25,000 es demasiado para un funeral?", a: "Puede serlo si el único objetivo es un servicio sencillo. Puede no serlo si hay deudas o quiere dejar un resto a la familia. El beneficiario decide cómo usar el efectivo." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.ftc] },
      ],
    },
    {
      question: "How much final expense coverage do I need?",
      headline: "How to pick a final expense amount without guessing",
      dek: "The right amount matches your real bills, not an ad. National funeral medians help you size it; your funeral home’s price list is the local figure.",
      pageTitle: "How much final expense coverage do I need?",
      metaDescription:
        "How to choose among $5,000, $10,000, or $15,000 of final expense insurance using verified funeral costs. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Add funeral or cremation, cemetery if it applies, small debts, and a cushion for travel or leftover medical bills.",
        "In 2023, NFDA published a U.S. median of $8,300 for a funeral with viewing and burial, and $6,280 with viewing and cremation, on the funeral-home side. Plot and marker are usually extra.",
        "$5,000, $10,000, and $15,000 are common starting points, not a universal recipe.",
        "A higher amount costs more each month. The maximum also changes by age and product.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "“How much do I need?” is not answered with a magic number. It is answered with a list: what kind of service you want, where it will be, whether a cemetery lot already exists, and which debts you do not want to leave behind." },
        { type: "h2", text: "Start with the service, not the advertisement" },
        { type: "p", text: "A viewing and burial does not cost the same as a direct cremation. NFDA’s 2023 General Price List study published national funeral-home medians: $8,300 with viewing and burial, and $6,280 with viewing and cremation. Those figures generally do not include plot, vault, marker, or flowers." },
        { type: "p", text: "The Federal Trade Commission explains that funeral homes must give a general price list if you ask in person, and quote prices by phone. That local list beats any national median. We do not have an NFDA median published only for Nebraska; for a price in your city, ask for the list." },
        { type: "h2", text: "What else fits inside “final expenses”" },
        { type: "ul", items: [
          "Transfer if the person dies far from home.",
          "A card balance or a medical bill health insurance did not cover.",
          "Airfare so a child can attend the service.",
          "A margin if prices rise between today and the funeral.",
        ] },
        {
          type: "table",
          caption: "Three starting amounts and what they often cover",
          lead: "This is a conversation frame, not a promise that a funeral will cost exactly these figures.",
          headers: ["Policy amount", "May fit if…", "May fall short if…"],
          rows: [
            ["$5,000", "You want a simple cremation and already have a plot or urn, or there are other savings", "You want a full viewing and burial with no other funds"],
            ["$10,000", "You want to approach the national funeral-home median and leave a little for extras", "The cemetery is expensive, medical debts are large, or several people must travel"],
            ["$15,000 or more", "You want the funeral plus small debts and a cushion", "The product or your age does not allow that cap — it has to be quoted"],
          ],
          foot: "On products Mejor Vida Insurance quotes, typical final expense caps reach about $50,000, and some designs lower the cap with age (for example Accendo Level at $25,000 for ages 76–89).",
        },
        { type: "h2", text: "The monthly price is part of the decision too" },
        { type: "p", text: "An illustrative final expense quote, non-tobacco and good health, for $10,000 (August 2026) is near $41 a month for a 65-year-old woman and $54 for a 65-year-old man. At 75, those same educational figures rise to about $71 and $97. They are examples, not an offer. A $15,000 amount will cost more than $10,000 on the same person." },
        { type: "note", text: "We do not publish one “correct” number. If debts or the cemetery change the total, the policy amount should move with that list — or you accept that the family will cover the gap." },
        { type: "h2", text: "Products and caps, at the end" },
        { type: "p", text: "Living Promise Level typically reaches about $50,000 between ages 45 and 85. A Living Promise waiting-period plan has a lower cap (about $20,000) and different ages. Corebridge guaranteed acceptance, on the line we quote, typically runs $5,000–$25,000. The amount you want and the amount a company will issue may not match." },
        {
          type: "faq",
          items: [
            { q: "Should I match the $8,300 median exactly?", a: "No. That figure is national, from 2023, and excludes the cemetery. Use it as a scale, not an invoice." },
            { q: "Can I raise the amount later?", a: "Sometimes with a new policy or an increase if the product allows it. Health and age at that time count again. We do not assume it is always possible." },
            { q: "Is $25,000 too much for a funeral?", a: "It can be if the only goal is a simple service. It may not be if there are debts or you want to leave a remainder to the family. The beneficiary decides how to use the cash." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.ftc] },
      ],
    }
  ),
];
