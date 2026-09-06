"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "cremacion-vs-entierro-nebraska",
    "cremation-vs-burial-nebraska",
    ["cuanto-cuesta-un-funeral", "vale-pena-seguro-10000-dolares", "seguro-gastos-finales-sin-examen-nebraska"],
    {
      question: "Cremación vs entierro — ¿cuánto cuesta en Nebraska?",
      headline: "Cremación o entierro en Nebraska: primero el servicio, luego el monto del seguro",
      dek: "No hay una mediana NFDA publicada solo para Nebraska. Las cifras nacionales de 2023 y la lista de precios de su funeraria son las herramientas honestas. El tipo de servicio cambia cuánto seguro tiene sentido.",
      pageTitle: "Cremación vs entierro en Nebraska: costos",
      metaDescription:
        "Cómo comparar cremación y entierro en Nebraska usando medianas nacionales verificadas y la lista de precios local. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "NFDA 2023, lado funeraria, Estados Unidos: $8,300 velatorio y entierro; $6,280 velatorio y cremación. Parcela y lápida suelen ir aparte.",
        "No inventamos un promedio estatal de Nebraska. Pida la lista de precios general (FTC).",
        "Una cremación directa, sin velatorio, suele costar menos que esas medianas; no publicamos un número local sin fuente estatal oficial.",
        "El seguro de gastos finales paga efectivo. No obliga a cremar ni a enterrar.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La pregunta “¿cuánto en Nebraska?” merece una respuesta local. La respuesta verificable hoy es: pida números a dos o tres funerarias de su ciudad. Lo que sí podemos poner en la mesa son medianas nacionales y las reglas para pedir precios." },
        { type: "h2", text: "Qué miden las medianas nacionales" },
        { type: "p", text: "La NFDA suma, para el entierro con velatorio, honorarios básicos, traslado, embalsamado, ataúd de metal, uso de sala, coche fúnebre y un paquete impreso básico, entre otros ítems de su metodología. Para cremación con velatorio incluye tarifa de cremación, contenedor alternativo y urna. En ambos casos deja fuera, en general, el cementerio y las flores." },
        { type: "p", text: "Por eso un entierro en Nebraska puede parecer “más caro que $8,300” en cuanto entra la parcela. Y una cremación puede parecer “más barata que $6,280” si no hay velatorio. Ninguna de esas sorpresas es un truco de seguro; es la lista." },
        {
          type: "table",
          caption: "Nacional 2023 vs lo que debe preguntar en Nebraska",
          lead: "La columna derecha es su tarea en la funeraria, no un precio nuestro.",
          headers: ["Dato público", "Pregunta local"],
          rows: [
            ["$8,300 velatorio + entierro (funeraria)", "¿Cuánto es el mismo paquete aquí? ¿La parcela está incluida?"],
            ["$6,280 velatorio + cremación (funeraria)", "¿Hay velatorio? ¿La urna y la cremación están en esa cifra?"],
            ["Cementerio no incluido", "Parcela o nicho, apertura, bóveda, marcador"],
            ["FTC: lista de precios general", "Pídala por escrito; compare al menos dos casas"],
          ],
          foot: "Algunas notas de comercio mencionan un total más alto si se suma una bóveda. No citamos esa cifra extra como NFDA en esta guía, alineados con la guía de costo de funeral de Mejor Vida.",
        },
        { type: "h2", text: "Cómo influye en el seguro" },
        { type: "p", text: "Si la familia ya eligió cremación sencilla, un $5,000 o $10,000 puede alinearse. Si eligió entierro con parcela nueva, cotice con esa suma encima de la mediana de funeraria. El beneficiario todavía puede cambiar de opinión el día del fallecimiento: el cheque no está etiquetado “solo urna” o “solo ataúd.”" },
        { type: "h2", text: "Religión, tierra y traslado" },
        { type: "p", text: "Un cementerio con reglas propias, un traslado desde otro estado o un servicio en dos idiomas no aparecen en la mediana nacional. Anótelos en papel antes de fijar el monto de la póliza." },
        {
          type: "faq",
          items: [
            { q: "¿Nebraska es más barata que el promedio nacional?", a: "No lo afirmamos. No hay recorte NFDA estatal en la fuente que usamos." },
            { q: "¿La cremación evita el seguro?", a: "Reduce la cuenta; no la deja en cero. Traslado y urna siguen existiendo." },
            { q: "¿Puedo prepagar la cremación y además tener seguro?", a: "Sí. Evite pagar dos veces el mismo servicio. El seguro cubre flexibilidad; el prepago cubre un paquete en una casa." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.ftc] },
      ],
    },
    {
      question: "Cremation vs burial — what does it cost in Nebraska?",
      headline: "Cremation or burial in Nebraska: choose the service first, then the insurance amount",
      dek: "There is no NFDA median published only for Nebraska. 2023 national figures and your funeral home’s price list are the honest tools. The type of service changes how much insurance makes sense.",
      pageTitle: "Cremation vs burial costs in Nebraska",
      metaDescription:
        "How to compare cremation and burial in Nebraska using verified national medians and the local price list. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "NFDA 2023, funeral-home side, U.S.: $8,300 viewing and burial; $6,280 viewing and cremation. Plot and marker are usually extra.",
        "We do not invent a Nebraska state average. Ask for the general price list (FTC).",
        "Direct cremation, with no viewing, usually costs less than those medians; we do not publish a local number without an official state source.",
        "Final expense insurance pays cash. It does not require cremation or burial.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "“How much in Nebraska?” deserves a local answer. The verifiable answer today is: ask two or three funeral homes in your city for numbers. What we can put on the table are national medians and the rules for asking prices." },
        { type: "h2", text: "What the national medians measure" },
        { type: "p", text: "For a viewing and burial, NFDA totals items such as the basic services fee, transfer, embalming, a metal casket, use of facilities, a hearse, and a basic printed package, under its methodology. For viewing and cremation it includes a cremation fee, an alternative container, and an urn. In both cases it generally leaves out the cemetery and flowers." },
        { type: "p", text: "That is why a Nebraska burial can look “more expensive than $8,300” as soon as a plot is added. And a cremation can look “cheaper than $6,280” if there is no viewing. Neither surprise is an insurance trick; it is the list." },
        {
          type: "table",
          caption: "National 2023 vs what to ask in Nebraska",
          lead: "The right-hand column is your job at the funeral home, not a price we set.",
          headers: ["Public figure", "Local question"],
          rows: [
            ["$8,300 viewing + burial (funeral home)", "What is the same package here? Is the plot included?"],
            ["$6,280 viewing + cremation (funeral home)", "Is there a viewing? Are the urn and cremation in that figure?"],
            ["Cemetery not included", "Plot or niche, opening, vault, marker"],
            ["FTC: general price list", "Ask in writing; compare at least two homes"],
          ],
          foot: "Some trade write-ups mention a higher total if a vault is added. We do not cite that extra figure as NFDA in this guide, matching Mejor Vida’s funeral-cost guide.",
        },
        { type: "h2", text: "How it affects insurance" },
        { type: "p", text: "If the family already chose a simple cremation, $5,000 or $10,000 may line up. If they chose burial with a new plot, quote with that sum on top of the funeral-home median. The beneficiary can still change their mind at the time of death: the check is not labeled “urn only” or “casket only.”" },
        { type: "h2", text: "Religion, land, and transfer" },
        { type: "p", text: "A cemetery with its own rules, a transfer from another state, or a service in two languages does not appear in the national median. Write those down before you set the policy amount." },
        {
          type: "faq",
          items: [
            { q: "Is Nebraska cheaper than the national average?", a: "We will not claim that. There is no NFDA state split in the source we use." },
            { q: "Does cremation remove the need for insurance?", a: "It lowers the bill; it does not leave it at zero. Transfer and an urn still exist." },
            { q: "Can I prepay cremation and also have insurance?", a: "Yes. Avoid paying twice for the same service. Insurance covers flexibility; a prepay covers a package at one home." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.ftc] },
      ],
    }
  ),

  pack(
    "seguro-gastos-finales-vs-prepago-funerario",
    "final-expense-vs-prepaid-funeral",
    ["funerales-prepagados", "beneficio-seguro-gastos-finales-familia", "que-son-gastos-finales"],
    {
      question: "Seguro de gastos finales vs prepago funerario",
      headline: "Efectivo para la familia o un paquete en una funeraria: no son lo mismo",
      dek: "El prepago compra servicios en una casa concreta, según un contrato. El seguro de gastos finales envía dinero a un beneficiario. Uno no sustituye automáticamente al otro. Algunos hogares usan ambos; muchos solo necesitan uno bien entendido.",
      pageTitle: "Seguro de gastos finales vs funeral prepagado",
      metaDescription:
        "Diferencias entre un seguro de gastos finales y un contrato de funeral prepagado. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Prepago: usted (o la familia) acuerda servicios con una funeraria y paga por adelantado o a plazos, según ese contrato.",
        "Seguro: la aseguradora paga efectivo al beneficiario si la póliza está vigente y el fallecimiento está cubierto.",
        "El prepago suele atarse a una funeraria y a un paquete. El seguro viaja con la persona y deja flexibilidad.",
        "La FTC publica cómo comparar funerarias. Un seguro no reemplaza leer el contrato de prepago (dónde está el dinero, qué pasa si se muda).",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "Las dos ideas nacen del mismo miedo: no dejar una cuenta sorpresa. Se parecen en el objetivo y se separan en el mecanismo. Mezclarlas es cómo la gente paga dos veces o se queda atada a una casa que ya no le sirve." },
        { type: "h2", text: "Qué compra cada camino" },
        { type: "p", text: "Con un prepago, la funeraria describe ataúd o urna, velatorio, traslado y lo que esté en el papel. Lo que no esté escrito —parcela del cementerio, lápida, flores— puede seguir siendo extra. Con un seguro, no hay ataúd en el contrato de vida: hay un número en dólares." },
        { type: "p", text: "Si se muda de ciudad, el prepago puede ser difícil de trasladar. El seguro, si sigue vigente, no le pide que use la misma funeraria. Si quiere una casa específica y un paquete cerrado, el prepago puede encajar mejor. Si quiere que un hijo decida con calma, el seguro suele encajar mejor." },
        {
          type: "table",
          caption: "Diferencias que importan el día del fallecimiento",
          lead: "Ninguna columna es “la correcta” para todas las familias.",
          headers: ["Pregunta", "Funeral prepagado", "Seguro de gastos finales"],
          rows: [
            ["¿Quién recibe el valor?", "Servicios en esa funeraria, según el contrato", "Efectivo al beneficiario"],
            ["¿Puede cambiar de casa?", "A menudo complicado", "Sí; el dinero no está atado a un logo de funeraria"],
            ["¿Qué pasa si el servicio cuesta menos?", "Depende del contrato de prepago", "El resto se queda en la familia"],
            ["¿Hay preguntas de salud?", "No es un seguro de vida", "Sí, salvo aceptación garantizada"],
            ["¿Hay espera al inicio?", "No en el sentido de un seguro de vida", "En algunos planes, sí"],
            ["¿Caduca si deja de pagar?", "El contrato de prepago dirá qué pasa con el dinero", "Sin prima, la póliza puede terminar"],
          ],
          foot: "Lea ambos papeles. Un verbal de un vendedor no sustituye el contrato.",
        },
        { type: "h2", text: "Pueden convivir — con cuidado" },
        { type: "p", text: "Algunas familias prepagan lo básico y compran un seguro pequeño para extras y deudas. Eso tiene sentido si no están comprando el mismo ataúd dos veces. Si ya hay un prepago completo, un seguro grande puede ser más legado que funeral. Mejor Vida Seguros cotiza el seguro; no vende contratos de funeraria." },
        { type: "h2", text: "Dinero y protección al consumidor" },
        { type: "p", text: "La FTC explica el derecho a una lista de precios y a no comprar un paquete entero si no lo desea. Pregunte dónde se deposita el dinero del prepago y qué ocurre si la funeraria cierra o usted se muda. Esas preguntas no se responden con una cotización de vida." },
        {
          type: "faq",
          items: [
            { q: "¿El seguro es “mejor” que el prepago?", a: "Es distinto. Mejor en flexibilidad; el prepago puede ser mejor si quiere un paquete fijo en una casa de confianza." },
            { q: "¿Puedo asignar el seguro a la funeraria?", a: "A veces se puede ceder o la familia paga la factura con el cheque. Sigue siendo un diseño distinto al prepago." },
            { q: "¿Medicare cubre alguno de los dos?", a: "Medicare no está diseñado para funerales ni para primas de vida." },
          ],
        },
        { type: "sources", items: [SRC.ftc, SRC.nfda, SRC.medicare] },
      ],
    },
    {
      question: "Final expense insurance vs a prepaid funeral",
      headline: "Cash for the family or a package at one funeral home: they are not the same",
      dek: "A prepay buys services at a specific home, under a contract. Final expense insurance sends money to a beneficiary. One does not automatically replace the other. Some households use both; many only need one they understand.",
      pageTitle: "Final expense insurance vs prepaid funeral",
      metaDescription:
        "Differences between final expense insurance and a prepaid funeral contract. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Prepay: you (or the family) agree on services with a funeral home and pay in advance or on a schedule, as that contract writes it.",
        "Insurance: the insurer pays cash to the beneficiary if the policy is in force and the death is covered.",
        "A prepay is usually tied to one funeral home and one package. Insurance travels with the person and leaves flexibility.",
        "The FTC publishes how to shop funeral homes. Insurance does not replace reading the prepay contract (where the money sits, what happens if you move).",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "Both ideas grow from the same fear: not leaving a surprise bill. They share a goal and split on mechanism. Mixing them is how people pay twice or stay tied to a home that no longer fits." },
        { type: "h2", text: "What each path buys" },
        { type: "p", text: "With a prepay, the funeral home describes a casket or urn, viewing, transfer, and whatever is on the paper. What is not written — a cemetery plot, a marker, flowers — can still be extra. With insurance, there is no casket in the life contract: there is a dollar amount." },
        { type: "p", text: "If you move cities, a prepay can be hard to transfer. Insurance, if it stays in force, does not require the same funeral home. If you want a specific home and a closed package, a prepay may fit better. If you want a child to decide with a clear head, insurance usually fits better." },
        {
          type: "table",
          caption: "Differences that matter on the day of death",
          lead: "Neither column is “correct” for every family.",
          headers: ["Question", "Prepaid funeral", "Final expense insurance"],
          rows: [
            ["Who receives the value?", "Services at that funeral home, per the contract", "Cash to the beneficiary"],
            ["Can you change homes?", "Often complicated", "Yes; the money is not tied to a funeral-home logo"],
            ["What if the service costs less?", "Depends on the prepay contract", "The remainder stays with the family"],
            ["Health questions?", "It is not life insurance", "Yes, except guaranteed acceptance"],
            ["A wait at the start?", "Not in the life-insurance sense", "On some plans, yes"],
            ["Does it end if you stop paying?", "The prepay contract will say what happens to the money", "Without premium, the policy can end"],
          ],
          foot: "Read both papers. A salesperson’s verbal promise does not replace the contract.",
        },
        { type: "h2", text: "They can coexist — carefully" },
        { type: "p", text: "Some families prepay the basics and buy a small policy for extras and debts. That makes sense if they are not buying the same casket twice. If a full prepay already exists, a large policy may be more of a gift than a funeral fund. Mejor Vida Insurance quotes the insurance; it does not sell funeral-home contracts." },
        { type: "h2", text: "Money and consumer protection" },
        { type: "p", text: "The FTC explains the right to a price list and not to buy a full package if you do not want it. Ask where prepay money is held and what happens if the funeral home closes or you move. Those questions are not answered by a life quote." },
        {
          type: "faq",
          items: [
            { q: "Is insurance “better” than a prepay?", a: "It is different. Better for flexibility; a prepay can be better if you want a fixed package at a home you trust." },
            { q: "Can I assign the insurance to the funeral home?", a: "Sometimes it can be assigned, or the family pays the invoice with the check. It is still a different design from a prepay." },
            { q: "Does Medicare cover either one?", a: "Medicare is not designed for funerals or for life-insurance premiums." },
          ],
        },
        { type: "sources", items: [SRC.ftc, SRC.nfda, SRC.medicare] },
      ],
    }
  ),
];
