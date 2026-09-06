"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "vale-pena-seguro-10000-dolares",
    "is-10000-final-expense-enough",
    ["cuanta-cobertura-gastos-finales-necesito", "cuanto-cuesta-un-funeral", "cremacion-vs-entierro-nebraska"],
    {
      question: "¿Vale la pena un seguro de gastos finales con $10,000 de cobertura?",
      headline: "$10,000 de gastos finales: un punto de partida, no una promesa de que “alcanza”",
      dek: "Diez mil dólares se acerca a la mediana nacional de un funeral con velatorio y entierro del lado de la funeraria, y supera la de un velatorio con cremación. El cementerio y las deudas pueden dejarlo corto. El precio mensual, a su edad, decide si ese monto es sostenible.",
      pageTitle: "¿Alcanza un seguro de gastos finales de $10,000?",
      metaDescription:
        "Si $10,000 de seguro de gastos finales es suficiente frente a costos de funeral verificados. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "La NFDA, 2023: mediana nacional $8,300 con velatorio y entierro, $6,280 con velatorio y cremación, sin parcela ni lápida.",
        "$10,000 es un punto de partida frecuente porque cabe cerca de esas medianas y deja un poco de aire — no porque sea la cifra correcta para usted.",
        "Una cotización ilustrativa de $10,000, no fumador, buena salud (agosto 2026): 65 años, unos $41 / $54 al mes (mujer / hombre); 75 años, unos $71 / $97.",
        "Si el cementerio, el traslado o las deudas suman mucho, cotice $15,000 o más, o acepte que la familia cubrirá la diferencia.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "“¿Vale la pena?” mezcla dos preguntas. Una es si $10,000 se parece a un funeral. La otra es si la prima de ese monto cabe en su mes. Puede valer la pena como fondo y no valer la pena si va a caducar." },
        { type: "h2", text: "Frente a un funeral típico de las estadísticas" },
        { type: "p", text: "Si su idea es un velatorio con cremación cerca de la mediana nacional, $10,000 puede sobrar un poco para flores o viaje. Si su idea es un entierro con parcela nueva, bóveda y lápida, $10,000 puede quedar justo o corto. No publicamos un total de “con bóveda” de la NFDA en esta guía: la lista de la funeraria y del cementerio es la cifra que cuenta, y la guía de costo de funeral de Mejor Vida ya advirtió esa laguna." },
        {
          type: "table",
          caption: "Cómo se siente $10,000 junto a cifras públicas",
          lead: "Medianas nacionales 2023, lado funeraria. No son precios de Nebraska.",
          headers: ["Escenario", "$10,000 puede…"],
          rows: [
            ["Cremación con velatorio cerca de $6,280", "Cubrir el servicio y dejar un resto"],
            ["Entierro con velatorio cerca de $8,300", "Cubrir el lado funeraria y dejar poco para cementerio"],
            ["Entierro + parcela + marcador + deudas", "Quedar corto a propósito — hay que sumar"],
            ["Cremación directa muy sencilla", "Sobrar; el resto es de la familia"],
          ],
          foot: "El pago de $255 del Seguro Social no mueve esta tabla de forma material.",
        },
        { type: "h2", text: "Frente a la prima" },
        { type: "p", text: "A los 50, el mismo $10,000 ilustrativo ronda $28 / $34 al mes. A los 80, unos $98 / $136. “Vale la pena” a los 50 y a los 80 no es la misma frase. Si la prima de $10,000 no cabe, un $5,000 vigente gana a un $10,000 abandonado." },
        { type: "h2", text: "Topes de producto" },
        { type: "p", text: "$10,000 está dentro de Living Promise Nivelado (hasta unos $50,000), de Eagle Select, de Immediate Solution (con tope según edad) y, en aceptación garantizada Corebridge, dentro de $5,000–$25,000. En Accendo Level a los 76–89, $10,000 también cabe bajo el tope de $25,000. El “sí” sigue siendo de la solicitud." },
        {
          type: "faq",
          items: [
            { q: "¿Es mejor $15,000 siempre?", a: "Solo si la prima se paga. Un colchón ayuda; una caducidad no." },
            { q: "¿$10,000 queda obsoleto con la inflación?", a: "Los funerales pueden subir. No inventamos una mediana 2026 de la NFDA. Puede dimensionar un poco más hoy o aceptar que la familia complete." },
            { q: "¿Debo igualar $10,000 porque “todo el mundo” lo compra?", a: "No. Es un punto de partida de conversación, no una norma." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.ssa, SRC.ftc] },
      ],
    },
    {
      question: "Is $10,000 of final expense coverage enough?",
      headline: "$10,000 of final expense: a starting point, not a promise that it “covers it”",
      dek: "Ten thousand dollars sits near the national median for a funeral with viewing and burial on the funeral-home side, and above the median for viewing and cremation. Cemetery and debts can leave it short. The monthly price at your age decides whether that amount is sustainable.",
      pageTitle: "Is $10,000 of final expense insurance enough?",
      metaDescription:
        "Whether $10,000 of final expense insurance is enough next to verified funeral costs. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "NFDA, 2023: U.S. median $8,300 with viewing and burial, $6,280 with viewing and cremation, without plot or marker.",
        "$10,000 is a common starting point because it sits near those medians and leaves a little air — not because it is the right figure for you.",
        "An illustrative $10,000 quote, non-tobacco, good health (August 2026): age 65, about $41 / $54 a month (woman / man); age 75, about $71 / $97.",
        "If the cemetery, transfer, or debts add a lot, quote $15,000 or more, or accept that the family will cover the gap.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "“Is it worth it?” mixes two questions. One is whether $10,000 looks like a funeral. The other is whether that amount’s premium fits your month. It can be worth it as a fund and not worth it if it will lapse." },
        { type: "h2", text: "Next to a typical funeral in the statistics" },
        { type: "p", text: "If your picture is a viewing and cremation near the national median, $10,000 may leave a little for flowers or travel. If your picture is a burial with a new plot, vault, and marker, $10,000 may be tight or short. We do not publish an NFDA “with vault” total in this guide: the funeral home and cemetery lists are the figures that count, and Mejor Vida’s funeral-cost guide already flagged that gap." },
        {
          type: "table",
          caption: "How $10,000 feels next to public figures",
          lead: "2023 national medians, funeral-home side. Not Nebraska prices.",
          headers: ["Scenario", "$10,000 may…"],
          rows: [
            ["Cremation with viewing near $6,280", "Cover the service and leave a remainder"],
            ["Burial with viewing near $8,300", "Cover the funeral-home side and leave little for the cemetery"],
            ["Burial + plot + marker + debts", "Fall short on purpose — you have to add"],
            ["Very simple direct cremation", "Leave extra; the rest belongs to the family"],
          ],
          foot: "Social Security’s $255 payment does not move this table in a material way.",
        },
        { type: "h2", text: "Next to the premium" },
        { type: "p", text: "At 50, the same illustrative $10,000 is near $28 / $34 a month. At 80, about $98 / $136. “Worth it” at 50 and at 80 is not the same sentence. If a $10,000 premium does not fit, an in-force $5,000 beats an abandoned $10,000." },
        { type: "h2", text: "Product caps" },
        { type: "p", text: "$10,000 sits inside Living Promise Level (up to about $50,000), Eagle Select, Immediate Solution (cap by age), and, on Corebridge guaranteed acceptance, inside $5,000–$25,000. On Accendo Level at ages 76–89, $10,000 also fits under the $25,000 cap. The “yes” still belongs to the application." },
        {
          type: "faq",
          items: [
            { q: "Is $15,000 always better?", a: "Only if the premium gets paid. A cushion helps; a lapse does not." },
            { q: "Does $10,000 go obsolete with inflation?", a: "Funerals can rise. We do not invent a 2026 NFDA median. You can size a little higher today or accept that the family will complete the bill." },
            { q: "Should I match $10,000 because “everyone” buys it?", a: "No. It is a conversation starter, not a rule." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.ssa, SRC.ftc] },
      ],
    }
  ),

  pack(
    "que-son-gastos-finales",
    "what-are-final-expenses",
    ["cuanto-cuesta-un-funeral", "que-pasa-sin-seguro-gastos-finales", "medicare-paga-gastos-finales"],
    {
      question: "¿Qué son los gastos finales?",
      headline: "Gastos finales: la lista de cuentas que aparece cuando alguien muere",
      dek: "No es un impuesto ni un paquete de Medicare. Son el funeral o la cremación, el cementerio, traslados, deudas pequeñas y los costos de esos días. Un seguro de gastos finales es una forma de dejar efectivo para esa lista; no es la lista misma.",
      pageTitle: "Qué son los gastos finales",
      metaDescription:
        "Qué incluye la frase gastos finales: funeral, cremación, deudas y otros costos. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Gastos finales son las cuentas ligadas a la muerte y al servicio, no un producto de seguro por sí solo.",
        "La NFDA 2023 sitúa el lado funeraria en $8,300 (velatorio y entierro) o $6,280 (velatorio y cremación). Cementerio y flores suelen ir aparte.",
        "Medicare no está diseñado para esas cuentas. El Seguro Social puede pagar $255 a un sobreviviente que califique.",
        "El beneficiario de un seguro de vida decide cómo usar el cheque; no está atado a una funeraria.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La frase se usa en dos sentidos. Uno, las facturas. Dos, el seguro que algunas familias compran para esas facturas. Esta página enseña primero las facturas, para que el seguro tenga un tamaño." },
        { type: "h2", text: "Lo que suele estar en la lista" },
        { type: "ul", items: [
          "Servicios de la funeraria: traslado, velatorio, ceremonia, ataúd o urna, cremación.",
          "Cementerio: parcela o nicho, apertura y cierre, a veces bóveda o reglas de marcador.",
          "Gastos de esos días: flores, aviso, comida, pasajes.",
          "Cuentas que no murieron con la persona: un saldo médico, una tarjeta, un préstamo pequeño.",
        ] },
        { type: "p", text: "La FTC explica que usted puede pedir una lista de precios general a la funeraria. Comparar es legal y razonable. Un paquete con nombre bonito puede esconder ítems que usted no quiere." },
        {
          type: "table",
          caption: "Quién no paga esta lista automáticamente",
          lead: "Estas filas evitan la esperanza de que “alguien más” se encargue.",
          headers: ["Programa o producto", "Qué hace con los gastos finales"],
          rows: [
            ["Medicare", "Salud que califica; no el funeral"],
            ["Pago único del Seguro Social", "$255 si hay un sobreviviente que califique y se solicita"],
            ["Contrato prepagado", "Los servicios que el contrato describe, en esa funeraria"],
            ["Seguro de gastos finales", "Efectivo al beneficiario, si la póliza está vigente y el fallecimiento cubierto"],
          ],
          foot: "Ayudas del VA, si aplican, tienen reglas propias del Departamento de Asuntos de Veteranos.",
        },
        { type: "h2", text: "Por qué el nombre del seguro se parece a la lista" },
        { type: "p", text: "Las compañías venden vida permanente de monto pequeño y la llaman gastos finales porque ese es el uso más común. El contrato sigue siendo vida. Si el beneficiario paga la universidad de un nieto con el cheque, no está “rompiendo” el seguro." },
        {
          type: "faq",
          items: [
            { q: "¿Los impuestos de sucesión son gastos finales?", a: "Pueden aparecer en una herencia compleja. No son el núcleo de un plan de $10,000. Un abogado de patrimonio responde eso." },
            { q: "¿Una mascota o un auto cuentan?", a: "Solo si usted quiere dejar dinero para ellos. No están en la mediana de la NFDA." },
            { q: "¿Hay que pagar todo en 24 horas?", a: "La funeraria pide decisiones pronto. No todas las facturas vencen el mismo día. Pregunte plazos al firmar." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.ftc, SRC.medicare, SRC.ssa] },
      ],
    },
    {
      question: "What are final expenses?",
      headline: "Final expenses: the list of bills that appears when someone dies",
      dek: "It is not a tax and not a Medicare package. It is the funeral or cremation, the cemetery, transfers, small debts, and the costs of those days. Final expense insurance is one way to leave cash for that list; it is not the list itself.",
      pageTitle: "What are final expenses?",
      metaDescription:
        "What the phrase final expenses includes: funeral, cremation, debts, and other costs. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Final expenses are the bills tied to death and the service, not an insurance product by itself.",
        "NFDA 2023 places the funeral-home side at $8,300 (viewing and burial) or $6,280 (viewing and cremation). Cemetery and flowers are usually extra.",
        "Medicare is not designed for those bills. Social Security may pay $255 to an eligible survivor.",
        "A life-insurance beneficiary decides how to use the check; it is not tied to a funeral home.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "The phrase is used in two ways. One, the bills. Two, the insurance some families buy for those bills. This page teaches the bills first, so the insurance has a size." },
        { type: "h2", text: "What usually sits on the list" },
        { type: "ul", items: [
          "Funeral-home services: transfer, viewing, ceremony, casket or urn, cremation.",
          "Cemetery: plot or niche, opening and closing, sometimes a vault or marker rules.",
          "Costs of those days: flowers, a notice, food, flights.",
          "Bills that did not die with the person: a medical balance, a card, a small loan.",
        ] },
        { type: "p", text: "The FTC explains that you can ask a funeral home for a general price list. Comparing is legal and reasonable. A nicely named package can hide items you do not want." },
        {
          type: "table",
          caption: "Who does not pay this list automatically",
          lead: "These rows prevent the hope that “someone else” will handle it.",
          headers: ["Program or product", "What it does with final expenses"],
          rows: [
            ["Medicare", "Qualifying health care; not the funeral"],
            ["Social Security lump-sum", "$255 if an eligible survivor qualifies and applies"],
            ["Prepaid contract", "The services the contract describes, at that funeral home"],
            ["Final expense insurance", "Cash to the beneficiary, if the policy is in force and the death is covered"],
          ],
          foot: "VA help, if it applies, has its own Department of Veterans Affairs rules.",
        },
        { type: "h2", text: "Why the insurance name looks like the list" },
        { type: "p", text: "Companies sell small permanent life and call it final expense because that is the most common use. The contract is still life insurance. If the beneficiary pays a grandchild’s tuition with the check, they are not “breaking” the insurance." },
        {
          type: "faq",
          items: [
            { q: "Are estate taxes final expenses?", a: "They can appear in a complex estate. They are not the core of a $10,000 plan. An estate attorney answers that." },
            { q: "Do a pet or a car count?", a: "Only if you want to leave money for them. They are not in the NFDA median." },
            { q: "Must everything be paid in 24 hours?", a: "The funeral home needs decisions quickly. Not every invoice is due the same day. Ask for timelines when you sign." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.ftc, SRC.medicare, SRC.ssa] },
      ],
    }
  ),
];
