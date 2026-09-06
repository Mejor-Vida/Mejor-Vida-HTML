"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "companias-seguro-gastos-finales",
    "final-expense-insurance-companies",
    ["comparar-mutual-omaha-american-amicable", "tipos-planes-seguro-gastos-finales", "edad-contratar-seguro-gastos-finales"],
    {
      question: "¿Qué compañías ofrecen seguro de gastos finales?",
      headline: "Compañías de gastos finales: cómo comparar sin coronar a un ganador",
      dek: "Mejor Vida Seguros es una agencia independiente. Cotiza varias compañías designadas. La “mejor” es la que emite el plan que usted puede pagar y que encaja con su salud y edad.",
      pageTitle: "Compañías de seguro de gastos finales",
      metaDescription:
        "Qué compañías de gastos finales puede cotizar Mejor Vida Seguros y cómo compararlas sin elegir un ganador universal. Guía educativa.",
      keyTakeaways: [
        "Una agencia independiente no es una sola aseguradora. Compara productos de varias compañías.",
        "Edad máxima, monto máximo y preguntas de salud cambian por producto, no solo por el logo.",
        "No publicamos un ranking de “la más barata” para todos los perfiles.",
        "El producto tiene que estar disponible en el estado donde usted vive.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "Buscar “la mejor compañía de entierro” en internet suele devolver anuncios, no una tabla justa. Dos personas de 68 años no reciben la misma oferta si una fuma y la otra no, o si una tuvo un infarto el año pasado." },
        { type: "h2", text: "Qué hace una agencia independiente" },
        { type: "p", text: "Mejor Vida Seguros recibe una comisión si se emite una póliza a través de la agencia. Eso no encarece su prima frente a ir “directo.” La agencia sugiere según necesidad, no según quién pague más a la agencia. Los estados con licencia están en la página de licencias, no en esta guía." },
        { type: "h2", text: "Compañías que podemos poner lado a lado" },
        { type: "p", text: "En gastos finales, las compañías designadas que aparecen con frecuencia en nuestras cotizaciones incluyen Mutual of Omaha (Living Promise), American Amicable (Golden Solution y Senior Choice), Accendo, Transamerica (Immediate Solution), Americo (Eagle Select), Assurity y Corebridge (incluida una línea de aceptación garantizada). No todas están en todos los estados ni para todas las edades." },
        {
          type: "table",
          caption: "Recortes educativos — no es una calificación de calidad",
          lead: "Use esta tabla para ver que los logos no ofrecen lo mismo. Luego cotice.",
          headers: ["Compañía / producto", "Qué saber en una frase"],
          rows: [
            ["Mutual of Omaha Living Promise Nivelado", "Edades 45–85; hasta unos $50,000; beneficio completo si califica"],
            ["Living Promise con espera", "Edades 45–80; tope más bajo (unos $20,000); primeros años limitados en muerte no accidental"],
            ["American Amicable Golden Solution / Senior Choice", "Edades típicas 50–85; diseños de pago completo y de primeros años limitados"],
            ["Accendo Level", "Puede emitir hasta 89; tope $25,000 a los 76–89"],
            ["Transamerica Immediate Solution", "Hasta 85; el tope de monto baja con la edad"],
            ["Americo Eagle Select Nivelado", "En general 40–85; $5,000–$50,000, con tope $40,000 a los 76–85"],
            ["Corebridge aceptación garantizada (línea cotizada)", "Típico 50–80; $5,000–$25,000; sin preguntas; espera de unos dos años en muerte no accidental"],
          ],
          foot: "Assurity también forma parte de las compañías designadas. No publicamos aquí un gráfico de salud de Assurity porque no está en un documento público que podamos citar con el mismo detalle.",
        },
        { type: "h2", text: "Cómo comparar sin perderse" },
        { type: "ul", items: [
          "Mismo monto, misma clase de tabaco, misma fecha de nacimiento.",
          "Si un plan tiene espera y el otro no, el precio más bajo no es comparable.",
          "Lea quién es el beneficiario y si hay préstamos o extras que reduzcan el cheque.",
          "Confirme que el producto se ofrece en su estado.",
        ] },
        {
          type: "faq",
          items: [
            { q: "¿Cuál es la más barata?", a: "No hay un ganador único. La más baja para un no fumador de 60 puede no serlo para un fumador de 77." },
            { q: "¿Debo ir directo a la compañía?", a: "Puede. Una agencia independiente le muestra más de una oferta. Su póliza no cuesta más porque la agencia intermedie." },
            { q: "¿Más compañías en un anuncio significan mejor seguro?", a: "No. Significa más formularios que revisar. El contrato de la que emita es lo que paga." },
          ],
        },
        { type: "sources", items: [SRC.naic] },
      ],
    },
    {
      question: "Which companies offer final expense insurance?",
      headline: "Final expense companies: how to compare without crowning a winner",
      dek: "Mejor Vida Insurance is an independent agency. It quotes several appointed companies. The “best” one is the one that issues a plan you can pay for and that fits your health and age.",
      pageTitle: "Final expense insurance companies",
      metaDescription:
        "Which final expense companies Mejor Vida Insurance can quote and how to compare them without picking a universal winner.",
      keyTakeaways: [
        "An independent agency is not a single insurer. It compares products from several companies.",
        "Maximum age, maximum amount, and health questions change by product, not only by the logo.",
        "We do not publish a “cheapest for everyone” ranking.",
        "The product has to be available in the state where you live.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "Searching “best burial insurance company” usually returns ads, not a fair table. Two 68-year-olds do not get the same offer if one smokes and the other does not, or if one had a heart attack last year." },
        { type: "h2", text: "What an independent agency does" },
        { type: "p", text: "Mejor Vida Insurance earns a commission if a policy is issued through the agency. That does not make your premium higher than going “direct.” The agency recommends based on need, not based on who pays the agency more. Licensed states are on the licenses page, not in this guide." },
        { type: "h2", text: "Companies we can put side by side" },
        { type: "p", text: "For final expense, appointed companies that show up often in our quotes include Mutual of Omaha (Living Promise), American Amicable (Golden Solution and Senior Choice), Accendo, Transamerica (Immediate Solution), Americo (Eagle Select), Assurity, and Corebridge (including a guaranteed-acceptance line). Not every product is in every state or at every age." },
        {
          type: "table",
          caption: "Educational snapshots — not a quality ranking",
          lead: "Use this table to see that logos do not offer the same thing. Then get a quote.",
          headers: ["Company / product", "One sentence to know"],
          rows: [
            ["Mutual of Omaha Living Promise Level", "Ages 45–85; up to about $50,000; full benefit if you qualify"],
            ["Living Promise with a wait", "Ages 45–80; lower cap (about $20,000); limited early years on non-accidental death"],
            ["American Amicable Golden Solution / Senior Choice", "Typical ages 50–85; full-pay and limited-early-year designs"],
            ["Accendo Level", "Can issue through 89; $25,000 cap at ages 76–89"],
            ["Transamerica Immediate Solution", "Through 85; the amount cap falls with age"],
            ["Americo Eagle Select Level", "Typically 40–85; $5,000–$50,000, with a $40,000 cap at ages 76–85"],
            ["Corebridge guaranteed acceptance (quoted line)", "Typical 50–80; $5,000–$25,000; no questions; about a two-year wait on non-accidental death"],
          ],
          foot: "Assurity is also among appointed companies. We do not publish an Assurity health chart here because it is not in a public document we can cite at the same level of detail.",
        },
        { type: "h2", text: "How to compare without getting lost" },
        { type: "ul", items: [
          "Same amount, same tobacco class, same date of birth.",
          "If one plan has a wait and the other does not, the lower price is not comparable.",
          "Read who the beneficiary is and whether loans or extras reduce the check.",
          "Confirm the product is offered in your state.",
        ] },
        {
          type: "faq",
          items: [
            { q: "Which is cheapest?", a: "There is no single winner. The lowest for a 60-year-old non-smoker may not be lowest for a 77-year-old smoker." },
            { q: "Should I go direct to the company?", a: "You can. An independent agency shows more than one offer. Your policy does not cost more because the agency is involved." },
            { q: "Do more logos in an ad mean better insurance?", a: "No. It means more forms to review. The contract of the company that issues is what pays." },
          ],
        },
        { type: "sources", items: [SRC.naic] },
      ],
    }
  ),

  pack(
    "comparar-mutual-omaha-american-amicable",
    "mutual-of-omaha-vs-american-amicable",
    ["companias-seguro-gastos-finales", "poliza-graduada-gastos-finales", "que-son-polizas-gastos-finales"],
    {
      question: "Mutual of Omaha vs American Amicable — gastos finales",
      headline: "Mutual of Omaha y American Amicable: dos caminos, no una final",
      dek: "Ambas son compañías que Mejor Vida Seguros puede cotizar para gastos finales. Difieren en edades, cómo pagan en los primeros años y hasta qué edad se programan las primas. Ninguna gana para todos.",
      pageTitle: "Mutual of Omaha vs American Amicable para gastos finales",
      metaDescription:
        "Diferencias educativas entre Living Promise de Mutual of Omaha y Golden Solution / Senior Choice de American Amicable. Mejor Vida Seguros no nombra un ganador.",
      keyTakeaways: [
        "Living Promise Nivelado, en materiales de producto, emite de 45 a 85 y hasta unos $50,000 si califica a beneficio completo.",
        "Golden Solution y Senior Choice, en materiales de producto, emiten en general de 50 a 85. La diferencia principal entre esos dos nombres es hasta qué edad están programadas las primas (100 vs 110 en la guía del agente), no “cuál es mejor.”",
        "Los planes con espera no usan la misma fórmula: Living Promise en los años 1–2 suele devolver primas más 10% por muerte no accidental; American Amicable puede pagar 30% el año 1 y 70% el año 2 antes del 100%. No las mezclamos.",
        "El precio más bajo para usted solo sale de una cotización con la misma edad, tabaco y monto.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "Comparar dos logos es útil solo después de saber qué trabajo quiere que haga el seguro. Si el objetivo es un funeral y deudas pequeñas, ambas compañías tienen vida permanente de monto acotado. Si el objetivo es coronar a un ganador de internet, esta página no lo hará." },
        { type: "h2", text: "En qué se parecen" },
        { type: "p", text: "Las dos ofrecen planes pensados para gastos finales, con preguntas de salud y, en muchos casos, sin examen en consultorio. Las dos tienen un diseño que puede pagar completo desde el inicio si califica, y diseños que limitan el cheque en los primeros años. En ambas, un accidente cubierto puede pagar el monto completo durante esa espera — según el contrato." },
        { type: "h2", text: "En qué no se parecen" },
        { type: "p", text: "La edad de entrada de Living Promise Nivelado empieza en 45. American Amicable, en Golden Solution y Senior Choice, empieza en 50. Eso importa si usted tiene 47 años. El tope de Living Promise Nivelado llega a unos $50,000; el plan de Living Promise con espera baja el tope a unos $20,000 y corta a los 80. No tenemos en esta guía un tope único publicado de American Amicable que podamos citar con la misma precisión; el monto sale de la cotización y el estado." },
        {
          type: "table",
          caption: "Diferencias que sí podemos verificar en materiales de producto",
          lead: "Si una celda dice “cotizar,” no rellenamos el hueco con un número inventado.",
          headers: ["Tema", "Mutual of Omaha Living Promise", "American Amicable Golden Solution / Senior Choice"],
          rows: [
            ["Edad al comprar (nivelado / inmediato)", "45–85 (nivelado)", "50–85"],
            ["Tope de monto (nivelado / inmediato)", "Unos $2,000–$50,000 (WA distinto en materiales)", "Cotizar; varía por plan y estado"],
            ["Plan con espera: edad y tope", "45–80; unos $2,000–$20,000", "Hay diseño de primeros años limitados; edad 50–85"],
            ["Cómo paga la espera (muerte no accidental)", "Años 1–2: primas pagadas + 10%; luego 100%", "Año 1: 30% del monto; año 2: 70%; luego 100%"],
            ["Primas programadas (guía del agente AmAm)", "No usamos esa comparación aquí", "Golden Solution hasta 100; Senior Choice hasta 110"],
          ],
          foot: "Washington tiene mínimos más altos en Living Promise según materiales de producto ($5,000). La disponibilidad estatal la confirma la cotización.",
        },
        { type: "note", text: "Un tercer producto —por ejemplo Accendo o Transamerica— puede ganar en precio o en edad para su caso. Una comparación de dos nombres no es el mercado completo." },
        { type: "h2", text: "Cómo decidir en la práctica" },
        { type: "p", text: "Mejor Vida Seguros pone las mismas fechas de nacimiento, tabaco y monto en más de una compañía. Si una ofrece beneficio completo y la otra solo espera, el precio más bajo de la espera no gana automáticamente. Si ambas ofrecen beneficio completo, entonces sí se mira prima, extras y quién es dueño de la póliza." },
        {
          type: "faq",
          items: [
            { q: "¿Cuál tiene mejor reputación?", a: "No convertimos quejas públicas en un ganador de esta página. Puede revisar índices de quejas en el regulador o en recursos del NAIC. El contrato que emita es lo que pagará a su familia." },
            { q: "¿Puedo tener las dos pólizas?", a: "A veces. Cada compañía mira el total de cobertura. No es automáticamente una buena idea pagar dos primas por el mismo funeral." },
            { q: "¿Senior Choice es para “seniors” y Living Promise no?", a: "Ambos son productos de gastos finales para edades adultas mayores. El nombre de marketing no decide el precio." },
          ],
        },
        { type: "sources", items: [SRC.naic] },
      ],
    },
    {
      question: "Mutual of Omaha vs American Amicable for final expense",
      headline: "Mutual of Omaha and American Amicable: two paths, not a championship",
      dek: "Both are companies Mejor Vida Insurance can quote for final expense. They differ in issue ages, how they pay in the early years, and how long premiums are scheduled. Neither wins for everyone.",
      pageTitle: "Mutual of Omaha vs American Amicable final expense",
      metaDescription:
        "Educational differences between Mutual of Omaha Living Promise and American Amicable Golden Solution / Senior Choice. Mejor Vida Insurance does not name a winner.",
      keyTakeaways: [
        "Living Promise Level, in product materials, issues ages 45–85 and up to about $50,000 if you qualify for a full benefit.",
        "Golden Solution and Senior Choice, in product materials, typically issue ages 50–85. The main difference between those two names is how long premiums are scheduled (to 100 vs 110 in the agent guide), not “which is better.”",
        "Waiting-period plans do not share one formula: Living Promise in years 1–2 typically returns premiums plus 10% for non-accidental death; American Amicable may pay 30% in year 1 and 70% in year 2 before 100%. We do not mix them.",
        "The lowest price for you only comes from a quote with the same age, tobacco, and amount.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "Comparing two logos is useful only after you know what job you want the insurance to do. If the goal is a funeral and small debts, both companies have permanent life in a limited amount. If the goal is to crown an internet winner, this page will not do that." },
        { type: "h2", text: "How they are alike" },
        { type: "p", text: "Both offer plans meant for final expenses, with health questions and, in many cases, no office exam. Both have a design that can pay in full from the start if you qualify, and designs that limit the check in the early years. At both, a covered accident can pay the full amount during that wait — as the contract writes it." },
        { type: "h2", text: "How they are not alike" },
        { type: "p", text: "Living Promise Level starts at age 45. American Amicable Golden Solution and Senior Choice start at 50. That matters if you are 47. Living Promise Level’s cap reaches about $50,000; the Living Promise waiting-period plan lowers the cap to about $20,000 and stops at 80. We do not have a single published American Amicable amount cap in this guide that we can cite with the same precision; the amount comes from the quote and the state." },
        {
          type: "table",
          caption: "Differences we can verify in product materials",
          lead: "If a cell says “quote,” we do not fill the gap with an invented number.",
          headers: ["Topic", "Mutual of Omaha Living Promise", "American Amicable Golden Solution / Senior Choice"],
          rows: [
            ["Age to buy (level / immediate)", "45–85 (level)", "50–85"],
            ["Amount cap (level / immediate)", "About $2,000–$50,000 (WA differs in materials)", "Quote; varies by plan and state"],
            ["Waiting plan: age and cap", "45–80; about $2,000–$20,000", "Limited-early-year design exists; ages 50–85"],
            ["How the wait pays (non-accidental death)", "Years 1–2: premiums paid + 10%; then 100%", "Year 1: 30% of amount; year 2: 70%; then 100%"],
            ["Scheduled premiums (AmAm agent guide)", "We do not use that comparison here", "Golden Solution to age 100; Senior Choice to 110"],
          ],
          foot: "Washington has higher Living Promise minimums in product materials ($5,000). State availability is confirmed by the quote.",
        },
        { type: "note", text: "A third product — for example Accendo or Transamerica — may win on price or age for your case. A two-name comparison is not the whole market." },
        { type: "h2", text: "How to decide in practice" },
        { type: "p", text: "Mejor Vida Insurance runs the same date of birth, tobacco, and amount at more than one company. If one offers a full benefit and the other only a wait, the lower waiting-period price does not automatically win. If both offer a full benefit, then premium, extras, and who owns the policy matter." },
        {
          type: "faq",
          items: [
            { q: "Which has a better reputation?", a: "We do not turn public complaint indexes into a winner on this page. You can review complaint data through a regulator or NAIC resources. The contract that issues is what will pay your family." },
            { q: "Can I own both policies?", a: "Sometimes. Each company looks at total coverage. Paying two premiums for the same funeral is not automatically a good idea." },
            { q: "Is Senior Choice for “seniors” and Living Promise not?", a: "Both are final expense products for older adults. The marketing name does not set the price." },
          ],
        },
        { type: "sources", items: [SRC.naic] },
      ],
    }
  ),
];
