"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "seguro-gastos-finales-mayores-70",
    "final-expense-insurance-over-70",
    ["edad-contratar-seguro-gastos-finales", "seguro-gastos-finales-mayores-80", "cuanta-cobertura-gastos-finales-necesito"],
    {
      question: "Seguro de gastos finales para personas mayores de 70 años",
      headline: "Después de los 70: el seguro de gastos finales sigue existiendo, a otro precio",
      dek: "Pasar de los 70 no cierra automáticamente la puerta. Sube la prima, a veces baja el tope de monto, y un diagnóstico reciente pesa más. Varias compañías designadas todavía emiten.",
      pageTitle: "Seguro de gastos finales después de los 70",
      metaDescription:
        "Opciones de seguro de gastos finales después de los 70 años, con edades y topes verificados de productos designados. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Living Promise Nivelado y varios otros gastos finales designados emiten hasta los 85.",
        "Accendo Level puede emitir hasta 89, con un tope de $25,000 a los 76–89.",
        "La aceptación garantizada que cotizamos suele cortar cerca de 80.",
        "A los 70, un $10,000 ilustrativo no fumador (agosto 2026) ronda $53 al mes (mujer) y $70 (hombre). A los 75, unos $71 y $97. Son ejemplos, no ofertas.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "A los 70 muchas personas sienten que “ya es tarde.” Para un temporal largo, a menudo sí se estrecha. Para un gasto final permanente, todavía hay mostrador. El mostrador cobra más y pregunta más." },
        { type: "h2", text: "Qué cambia a esta edad" },
        { type: "p", text: "El precio mensual para el mismo $10,000 es más alto que a los 60. La salud acumulada —hospitalizaciones, oxígeno, un evento del corazón— decide si el plan paga completo o si hay espera. El temporal de 20 o 30 años casi no es el tema; el funeral sí." },
        {
          type: "table",
          caption: "Productos que todavía hablan con los 70 y pico",
          lead: "Rangos educativos. El estado y el tabaco pueden recortar.",
          headers: ["Producto", "Hasta qué edad (comprar)", "Tope de monto a tener en cuenta"],
          rows: [
            ["Living Promise Nivelado", "85", "Unos $50,000"],
            ["Living Promise con espera", "80", "Unos $20,000"],
            ["American Amicable Golden Solution / Senior Choice", "85", "Cotizar"],
            ["Transamerica Immediate Solution", "85", "El tope baja con la edad"],
            ["Americo Eagle Select Nivelado", "85", "$50,000; $40,000 a los 76–85"],
            ["Accendo Level", "89", "$25,000 a los 76–89"],
            ["Corebridge GIWL (línea cotizada)", "80", "$5,000–$25,000"],
          ],
          foot: "No publicamos emisión nueva de gastos finales a los 90. Las edades 80 y 85 tienen guías propias.",
        },
        { type: "h2", text: "Cómo no gastar de más" },
        { type: "p", text: "Un monto de $25,000 a los 74 puede ser correcto si hay deudas. También puede ser una prima que no se podrá pagar a los 78. Es mejor un $10,000 que se mantiene vigente que un $25,000 que caduca. Caducar a esta edad suele significar cotizar otra vez más caro, o ya no calificar al mismo plan." },
        { type: "note", text: "Un temporal de 10 años a veces existe a los 70 u 80; no es el mismo producto que un gasto final. No lo usamos como atajo de entierro si el plazo se acaba mientras el funeral sigue pendiente." },
        {
          type: "faq",
          items: [
            { q: "¿A los 72 todavía hay plan sin espera?", a: "Sí, si las preguntas de salud lo permiten. No es automático." },
            { q: "¿El precio baja si ya cobro Seguro Social?", a: "No. El Seguro Social no fija la tarifa de vida. El pago de $255 por fallecimiento es otro programa, y no alcanza para un funeral típico." },
            { q: "¿Debo leer también la guía de mayores de 80?", a: "Si está cerca de 80 o ya los cumplió, sí: los topes de monto y las compañías se estrechan otra vez." },
          ],
        },
        { type: "sources", items: [SRC.ssa, SRC.nfda] },
      ],
    },
    {
      question: "Final expense insurance for people over 70",
      headline: "After 70: final expense insurance still exists, at a different price",
      dek: "Turning 70 does not automatically close the door. The premium rises, the amount cap sometimes falls, and a recent diagnosis weighs more. Several appointed companies still issue.",
      pageTitle: "Final expense insurance over 70",
      metaDescription:
        "Final expense options after age 70, with verified issue ages and caps from appointed products. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Living Promise Level and several other appointed final expense plans issue through 85.",
        "Accendo Level can issue through 89, with a $25,000 cap at ages 76–89.",
        "Guaranteed acceptance we quote usually stops near 80.",
        "At 70, an illustrative non-tobacco $10,000 (August 2026) is near $53 a month (woman) and $70 (man). At 75, about $71 and $97. Examples, not offers.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "At 70 many people feel it is “too late.” For long term life, the door often does narrow. For permanent final expense, there is still a counter. The counter charges more and asks more." },
        { type: "h2", text: "What changes at this age" },
        { type: "p", text: "The monthly price for the same $10,000 is higher than at 60. Accumulated health — hospital stays, oxygen, a heart event — decides whether the plan pays in full or there is a wait. Twenty- or 30-year term is rarely the topic; the funeral is." },
        {
          type: "table",
          caption: "Products that still speak to the 70s",
          lead: "Educational ranges. State and tobacco can shorten them.",
          headers: ["Product", "Through what age (to buy)", "Amount cap to watch"],
          rows: [
            ["Living Promise Level", "85", "About $50,000"],
            ["Living Promise with a wait", "80", "About $20,000"],
            ["American Amicable Golden Solution / Senior Choice", "85", "Quote"],
            ["Transamerica Immediate Solution", "85", "The cap falls with age"],
            ["Americo Eagle Select Level", "85", "$50,000; $40,000 at ages 76–85"],
            ["Accendo Level", "89", "$25,000 at ages 76–89"],
            ["Corebridge GIWL (quoted line)", "80", "$5,000–$25,000"],
          ],
          foot: "We do not publish new final expense issue at 90. Ages 80 and 85 have their own guides.",
        },
        { type: "h2", text: "How not to overspend" },
        { type: "p", text: "A $25,000 amount at 74 can be right if there are debts. It can also be a premium you cannot pay at 78. A $10,000 that stays in force is better than a $25,000 that lapses. Lapsing at this age usually means quoting again at a higher price, or no longer qualifying for the same plan." },
        { type: "note", text: "A 10-year term sometimes exists at 70 or 80; it is not the same product as final expense. We do not use it as a burial shortcut if the term ends while the funeral is still ahead." },
        {
          type: "faq",
          items: [
            { q: "At 72, is a no-wait plan still possible?", a: "Yes, if the health questions allow it. It is not automatic." },
            { q: "Does the price drop if I already collect Social Security?", a: "No. Social Security does not set life-insurance rates. The $255 death payment is a different program, and it does not cover a typical funeral." },
            { q: "Should I also read the over-80 guide?", a: "If you are near 80 or already there, yes: amount caps and companies narrow again." },
          ],
        },
        { type: "sources", items: [SRC.ssa, SRC.nfda] },
      ],
    }
  ),

  pack(
    "seguro-gastos-finales-sin-examen-nebraska",
    "no-exam-final-expense-nebraska",
    ["examen-medico-seguro-gastos-finales", "companias-seguro-gastos-finales", "cuanto-cuesta-un-funeral"],
    {
      question: "Seguro de gastos finales sin examen médico en Nebraska",
      headline: "Nebraska, sin examen en el consultorio: qué significa de verdad",
      dek: "En Nebraska, los gastos finales que Mejor Vida Seguros cotiza suelen resolverse con preguntas de salud, no con una visita de laboratorio. “Sin examen” no oculta diagnósticos. La lista de precios de la funeraria local sigue siendo su mejor cifra de funeral.",
      pageTitle: "Seguro de gastos finales sin examen en Nebraska",
      metaDescription:
        "Cómo funciona un seguro de gastos finales sin examen médico en Nebraska, con preguntas de salud y compañías designadas. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Esta guía habla de comprar en Nebraska. La disponibilidad de cada producto depende de la compañía y de su solicitud.",
        "Lo habitual en gastos finales designados es no ir a un consultorio a un examen por esa póliza. Sí hay preguntas, salvo aceptación garantizada.",
        "No tenemos una mediana NFDA publicada solo para Nebraska. Use la lista de precios general de la funeraria (regla de la FTC) para el costo local.",
        "Las edades y montos de Living Promise, American Amicable, Accendo, Transamerica, Americo y Corebridge son los mismos marcos que en otras guías, si el producto se ofrece en Nebraska para usted.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "Querer un plan “sin examen en Nebraska” es una petición concreta: no quiere una cita de sangre para un seguro de entierro. En la práctica, ese es el diseño de muchos gastos finales. El paso que sí existe es decir la verdad en el formulario." },
        { type: "h2", text: "Qué ocurre en una solicitud de Nebraska" },
        { type: "p", text: "La cotización pide edad, sexo, tabaco y que vive en Nebraska. Luego vienen preguntas de salud, o un camino sin preguntas con espera. La compañía tiene que tener el producto aprobado para venderse en ese estado. Si un logo no está disponible para su solicitud, se cotiza otro; no inventamos que “todas las compañías nacionales” emiten en cada condado." },
        { type: "h2", text: "Funeral en Nebraska vs mediana nacional" },
        { type: "p", text: "La NFDA publicó en 2023 medianas nacionales de $8,300 (velatorio y entierro) y $6,280 (velatorio y cremación) del lado de la funeraria. No hay, en esa publicación, un recorte oficial solo para Nebraska que podamos citar. Lincoln, Omaha, un pueblo pequeño o un cementerio con reglas de bóveda pueden estar por encima o por debajo. Pida la lista de precios en persona o una cotización por teléfono, como explica la FTC." },
        {
          type: "table",
          caption: "Sin examen, con o sin preguntas",
          lead: "Nebraska no cambia estas definiciones; cambia si el producto se ofrece para su solicitud.",
          headers: ["Camino", "Examen en consultorio", "Preguntas"],
          rows: [
            ["Beneficio completo si califica", "Por lo general no", "Sí"],
            ["Beneficio limitado al inicio", "Por lo general no", "Sí"],
            ["Aceptación garantizada", "No", "No"],
          ],
          foot: "Corebridge GIWL, en la línea que cotizamos, ilustra el tercer camino: típico 50–80, $5,000–$25,000, espera de unos dos años en muerte no accidental.",
        },
        { type: "h2", text: "Compañías, si el producto está disponible" },
        { type: "p", text: "Mutual of Omaha Living Promise, American Amicable Golden Solution y Senior Choice, Accendo, Transamerica Immediate Solution, Americo Eagle Select y Assurity son nombres que Mejor Vida Seguros usa al cotizar gastos finales cuando están designados y disponibles. Un “sí” en el papel de marketing no sustituye la oferta real en Nebraska." },
        { type: "note", text: "Los estados donde la agencia tiene licencia están en la página de licencias. Esta guía no es un listado de licencias; es una guía de producto para quien vive en Nebraska." },
        {
          type: "faq",
          items: [
            { q: "¿Nebraska exige un examen para vida pequeña?", a: "No conocemos una ley estatal que obligue un examen en consultorio para todo gasto final. Cada producto fija su proceso. Si aparece uno que sí pide laboratorio, se lo diremos; no es el flujo habitual que cotizamos." },
            { q: "¿El precio es distinto en Omaha y en un pueblo?", a: "La tarifa la arma la compañía con edad, salud, tabaco y producto. No publicamos un recargo de condado. El funeral local sí cambia; por eso la lista de la funeraria importa." },
            { q: "¿Puedo cotizar en línea?", a: "Sí. Una cotización en este sitio es un estimado. La aprobación es de la aseguradora." },
          ],
        },
        { type: "sources", items: [SRC.ftc, SRC.nfda] },
      ],
    },
    {
      question: "No-exam final expense insurance in Nebraska",
      headline: "Nebraska, no office exam: what that actually means",
      dek: "In Nebraska, the final expense plans Mejor Vida Insurance quotes are usually decided with health questions, not a lab visit. “No exam” does not hide diagnoses. Your local funeral home’s price list is still the best funeral figure.",
      pageTitle: "No-exam final expense insurance in Nebraska",
      metaDescription:
        "How no-exam final expense insurance works in Nebraska, including health questions and appointed companies. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "This guide is about buying in Nebraska. Each product’s availability depends on the company and your application.",
        "Appointed final expense usually skips an office exam for that policy. Questions still apply, except guaranteed acceptance.",
        "We do not have an NFDA median published only for Nebraska. Use the funeral home’s general price list (FTC Funeral Rule) for local cost.",
        "Age and amount frames for Living Promise, American Amicable, Accendo, Transamerica, Americo, and Corebridge are the same as in other guides, if the product is offered in Nebraska for you.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "Wanting a “no exam in Nebraska” plan is a concrete request: you do not want a blood appointment for burial insurance. In practice, that is how many final expense plans are built. The step that still exists is telling the truth on the form." },
        { type: "h2", text: "What a Nebraska application looks like" },
        { type: "p", text: "The quote asks for age, sex, tobacco, and that you live in Nebraska. Then come health questions, or a no-questions path with a wait. The company must have the product approved to be sold in that state. If a logo is not available for your application, another is quoted; we do not invent that “every national company” issues in every county." },
        { type: "h2", text: "Funerals in Nebraska vs the national median" },
        { type: "p", text: "NFDA published 2023 national medians of $8,300 (viewing and burial) and $6,280 (viewing and cremation) on the funeral-home side. That publication does not include an official Nebraska-only split we can cite. Lincoln, Omaha, a small town, or a cemetery with vault rules can sit above or below. Ask for the general price list in person or a phone quote, as the FTC explains." },
        {
          type: "table",
          caption: "No exam, with or without questions",
          lead: "Nebraska does not change these definitions; it changes whether the product is offered for your application.",
          headers: ["Path", "Office exam", "Questions"],
          rows: [
            ["Full benefit if you qualify", "Generally no", "Yes"],
            ["Limited benefit at first", "Generally no", "Yes"],
            ["Guaranteed acceptance", "No", "No"],
          ],
          foot: "Corebridge GIWL, on the line we quote, illustrates the third path: typical 50–80, $5,000–$25,000, about a two-year wait on non-accidental death.",
        },
        { type: "h2", text: "Companies, if the product is available" },
        { type: "p", text: "Mutual of Omaha Living Promise, American Amicable Golden Solution and Senior Choice, Accendo, Transamerica Immediate Solution, Americo Eagle Select, and Assurity are names Mejor Vida Insurance uses when quoting final expense if they are appointed and available. A “yes” on a marketing sheet does not replace the real Nebraska offer." },
        { type: "note", text: "States where the agency is licensed are on the licenses page. This guide is not a license roster; it is a product guide for people who live in Nebraska." },
        {
          type: "faq",
          items: [
            { q: "Does Nebraska require an exam for small life insurance?", a: "We do not know of a state law that forces an office exam for every final expense plan. Each product sets its process. If one that does require a lab appears, we will say so; it is not the usual flow we quote." },
            { q: "Is the price different in Omaha and in a small town?", a: "The company builds the rate from age, health, tobacco, and product. We do not publish a county surcharge. The local funeral does change; that is why the funeral home’s list matters." },
            { q: "Can I quote online?", a: "Yes. A quote on this site is an estimate. Approval belongs to the insurer." },
          ],
        },
        { type: "sources", items: [SRC.ftc, SRC.nfda] },
      ],
    }
  ),
];
