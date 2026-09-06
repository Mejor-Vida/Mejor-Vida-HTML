"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "seguro-vida-entero-gastos-finales",
    "whole-life-for-final-expenses",
    ["diferencia-seguro-vida-y-gastos-finales", "que-son-polizas-gastos-finales", "factores-precio-seguro-gastos-finales"],
    {
      question: "¿Qué es un seguro de vida entero para gastos finales?",
      headline: "Gastos finales es, en la práctica, vida permanente de monto pequeño",
      dek: "Vida entero significa que la cobertura no está hecha para vencer a los 10 o 20 años. La prima nivelada se queda igual si usted paga a tiempo. El monto es el de un funeral, no el de una hipoteca.",
      pageTitle: "Seguro de vida entero para gastos finales",
      metaDescription:
        "Qué es la vida entera cuando se usa para gastos finales, qué es una prima nivelada y cómo se diferencia de un temporal. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Vida entero (o vida permanente) no caduca por el calendario de un plazo de 10 o 20 años.",
        "Prima nivelada: el precio periódico no sube solo porque usted cumpla años dentro de esa póliza.",
        "Puede haber valor en efectivo según el contrato. Un préstamo no pagado reduce el beneficio.",
        "Una vida entera de $100,000 o más es otro tamaño de producto, a menudo con más preguntas o laboratorio.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "Si alguien le dice “compre vida entero para el entierro,” no está inventando un cuarto tipo de seguro. Está describiendo un contrato permanente recortado al tamaño de un funeral." },
        { type: "h2", text: "Qué problema resuelve la vida permanente" },
        { type: "p", text: "Un temporal es excelente cuando hay un plazo: la hipoteca, los hijos en la universidad. El funeral no tiene fecha. Un temporal de 20 años comprado a los 62 puede terminar a los 82, justo cuando el costo del servicio sigue ahí. La vida permanente sigue, si se paga, sin ese corte de calendario." },
        { type: "h2", text: "Prima nivelada, otra vez, porque importa" },
        { type: "p", text: "Nivelada significa estable. Usted no recibe un aumento automático cada cumpleaños. El precio alto o bajo se fija al emitir, según edad, tabaco, salud, sexo, monto y compañía. Por eso comprar a los 58 y a los 78 no cuesta lo mismo, aunque ambas pólizas sean “niveladas” después." },
        { type: "p", text: "Algunos contratos acumulan valor en efectivo. Eso no es una cuenta de cheques. Si pide prestado contra ese valor y no lo devuelve, el cheque a la familia se reduce. No ilustramos un valor futuro en esta página porque dependería de un producto y de supuestos que no vamos a inventar." },
        {
          type: "table",
          caption: "Vida permanente pequeña vs vida permanente más grande",
          lead: "El mismo apellido (“vida entero”) no implica el mismo trámite ni el mismo monto.",
          headers: ["", "Gastos finales (vida permanente pequeña)", "Vida entera más grande"],
          rows: [
            ["Monto típico", "Unos $2,000 a $50,000 según producto", "A menudo $50,000 o más"],
            ["Examen en consultorio", "Por lo general no, en las líneas que cotizamos", "A veces sí, según monto"],
            ["Edad máxima al comprar", "A menudo 85; algunos diseños 89", "Puede cortar antes que Accendo Level"],
            ["Trabajo principal", "Funeral, cremación, deudas pequeñas", "Ingresos, impuestos, legado más amplio"],
          ],
          foot: "Cifras educativas de productos designados. No es una oferta.",
        },
        { type: "h2", text: "Ejemplos de producto" },
        { type: "p", text: "Living Promise, Golden Solution, Senior Choice, Accendo Level, Immediate Solution y Eagle Select son vidas permanentes de gastos finales, cada una con su edad y tope. Una vida entera tradicional de monto alto se ilustra aparte; no la disfrazamos de plan de entierro." },
        {
          type: "faq",
          items: [
            { q: "¿La vida entero “vence” a los 100?", a: "Algunos contratos programan primas hasta una edad alta (por ejemplo 100 o 110 en materiales de American Amicable). Eso no es lo mismo que un temporal de 20 años. El detalle está en la póliza." },
            { q: "¿Es lo mismo que un prepago funerario?", a: "No. El seguro paga efectivo al beneficiario. El prepago compra servicios a una funeraria según su contrato." },
            { q: "¿Puedo convertir un temporal en gastos finales?", a: "Algunos temporales tienen derecho de conversión a permanente. No todos, y el precio será el de la edad actual. Hay que leer ese contrato, no esta guía." },
          ],
        },
        { type: "sources", items: [SRC.naic] },
      ],
    },
    {
      question: "What is whole life insurance for final expenses?",
      headline: "Final expense is, in practice, small permanent whole life",
      dek: "Whole life means coverage is not built to expire after a 10- or 20-year term. A level premium stays the same if you pay on time. The amount is funeral-sized, not mortgage-sized.",
      pageTitle: "Whole life insurance for final expenses",
      metaDescription:
        "What whole life means when it is used for final expenses, what a level premium is, and how it differs from term. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Whole life (permanent life) does not expire on a 10- or 20-year calendar.",
        "Level premium: the regular price does not rise just because you have a birthday inside that policy.",
        "There may be cash value under the contract. An unpaid loan reduces the benefit.",
        "Whole life of $100,000 or more is a different product size, often with more questions or a lab exam.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "If someone says “buy whole life for the burial,” they are not inventing a fourth kind of insurance. They are describing a permanent contract sized for a funeral." },
        { type: "h2", text: "What problem permanent life solves" },
        { type: "p", text: "Term is excellent when there is a deadline: the mortgage, kids in college. A funeral has no date. A 20-year term bought at 62 can end at 82, right when the service cost is still there. Permanent life continues, if it is paid, without that calendar cut." },
        { type: "h2", text: "Level premium, again, because it matters" },
        { type: "p", text: "Level means steady. You do not get an automatic increase on each birthday. The high or low price is set at issue, based on age, tobacco, health, sex, amount, and company. That is why buying at 58 and at 78 does not cost the same, even though both policies are “level” afterward." },
        { type: "p", text: "Some contracts build cash value. That is not a checking account. If you borrow against that value and do not repay it, the check to the family shrinks. We do not illustrate a future value on this page because it would depend on a product and assumptions we will not invent." },
        {
          type: "table",
          caption: "Small permanent life vs larger whole life",
          lead: "The same last name (“whole life”) does not mean the same process or the same amount.",
          headers: ["", "Final expense (small permanent)", "Larger whole life"],
          rows: [
            ["Typical amount", "About $2,000 to $50,000 by product", "Often $50,000 or more"],
            ["Office exam", "Generally no, on the lines we quote", "Sometimes yes, by amount"],
            ["Maximum age to buy", "Often 85; some designs 89", "May cut off earlier than Accendo Level"],
            ["Main job", "Funeral, cremation, small debts", "Income, taxes, a larger gift"],
          ],
          foot: "Educational figures from appointed products. Not an offer.",
        },
        { type: "h2", text: "Product examples" },
        { type: "p", text: "Living Promise, Golden Solution, Senior Choice, Accendo Level, Immediate Solution, and Eagle Select are permanent final expense lives, each with its own age and cap. A traditional large whole life policy is illustrated separately; we do not dress it up as a burial plan." },
        {
          type: "faq",
          items: [
            { q: "Does whole life “expire” at 100?", a: "Some contracts schedule premiums to a high age (for example 100 or 110 in American Amicable materials). That is not the same as a 20-year term. The detail is in the policy." },
            { q: "Is it the same as a prepaid funeral?", a: "No. Insurance pays cash to the beneficiary. A prepay buys services from a funeral home under its contract." },
            { q: "Can I convert term into final expense?", a: "Some term policies have a right to convert to permanent. Not all, and the price will be at current age. Read that contract, not this guide." },
          ],
        },
        { type: "sources", items: [SRC.naic] },
      ],
    }
  ),

  pack(
    "poliza-graduada-gastos-finales",
    "modified-final-expense-policies",
    ["periodo-carencia-seguro-gastos-finales", "seguro-gastos-finales-con-problemas-salud", "tipos-planes-seguro-gastos-finales"],
    {
      question: "¿Qué es un plan de gastos finales con periodo de espera?",
      headline: "Cuando el seguro paga menos al principio: el plan con espera",
      dek: "Un periodo de espera es el tiempo al inicio de la póliza en el que una muerte no accidental puede pagar menos que el monto completo. No es un castigo misterioso: es el diseño del producto cuando la salud no da para un plan de beneficio inmediato.",
      pageTitle: "Planes de gastos finales con periodo de espera",
      metaDescription:
        "Cómo funciona un seguro de gastos finales con espera en los primeros años, en palabras sencillas. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "Periodo de espera: los primeros años, una muerte por enfermedad puede no pagar el 100% del monto.",
        "Un accidente cubierto suele pagar el monto completo desde el inicio — si el contrato lo dice.",
        "Las fórmulas no son iguales: una compañía puede devolver primas más un interés; otra puede pagar un porcentaje del monto el año 1 y el año 2.",
        "Después de la espera, el fallecimiento cubierto suele pagar el monto completo mientras la póliza esté vigente.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "A este diseño a veces le ponen apodos de industria. En esta guía lo llamamos plan con periodo de espera o plan de beneficio limitado al inicio, para que no necesite un glosario." },
        { type: "h2", text: "Por qué existe este diseño" },
        { type: "p", text: "Si la compañía no puede ofrecer un plan que pague completo desde el día uno, todavía puede ofrecer cobertura. A cambio, los primeros años no son el mismo cheque. Eso abre la puerta a personas con más historial de salud, a un precio y unas reglas distintas." },
        { type: "h2", text: "Cómo se siente en un reclamo" },
        { type: "p", text: "Imagine un monto de $10,000. Si la muerte es por un accidente que el contrato cubre, la familia puede recibir los $10,000 aunque sea el mes 4. Si la muerte es por una enfermedad en el año 1, una compañía puede devolver lo pagado más un 10%; otra puede pagar el 30% de los $10,000. En el año 3, ambas suelen pagar los $10,000. Esos ejemplos vienen de productos distintos; no se combinan en una sola póliza." },
        {
          type: "table",
          caption: "Tres fórmulas que no debemos mezclar",
          lead: "La fila de su póliza es una sola. Esta tabla evita copiar la regla de un logo a otro.",
          headers: ["Ejemplo de producto", "Muerte no accidental, primeros años", "Después"],
          rows: [
            ["Living Promise con espera", "Años 1–2: primas pagadas + 10%", "100% del monto"],
            ["American Amicable (diseño de primeros años limitados)", "Año 1: 30% del monto; año 2: 70%", "100% desde el año 3"],
            ["Accendo modificado (materiales de producto)", "Años 1–2: suele devolver 110% de primas ganadas", "100% desde el año 3"],
            ["Corebridge aceptación garantizada (línea cotizada)", "Espera de unos dos años: primas + interés contractual", "100% después de la espera"],
          ],
          foot: "Un accidente cubierto puede pagar 100% en todos esos diseños. Siempre según el contrato. Edades y topes también difieren (Living Promise con espera: 45–80, unos $20,000; Accendo modificado: 40–75, hasta $25,000; Corebridge GIWL: típico 50–80, $5,000–$25,000).",
        },
        { type: "h2", text: "Ventajas y límites" },
        { type: "ul", items: [
          "Ventaja: hay una póliza cuando el plan de beneficio inmediato no sale.",
          "Límite: si el fallecimiento por enfermedad ocurre pronto, el cheque puede ser pequeño frente al funeral.",
          "Límite: suele costar más por dólar que el plan inmediato de la misma compañía.",
          "Ventaja: el accidente cubierto puede cerrar esa brecha desde el día uno.",
        ] },
        { type: "note", text: "Si puede calificar a un plan de beneficio completo, Mejor Vida Seguros no empuja la espera “porque sí.” Se cotiza primero el camino que paga entero cuando las respuestas lo permiten." },
        {
          type: "faq",
          items: [
            { q: "¿La espera se aplica también al suicidio?", a: "Muchas pólizas de vida tienen reglas propias para suicidio en los primeros años, aparte de la espera del producto. Eso está en el contrato; no lo generalizamos aquí." },
            { q: "¿Puedo “esperar” y luego cambiar a beneficio completo?", a: "No automáticamente. A veces una póliza nueva, si la salud y la edad lo permiten. No es un ascenso interno garantizado." },
            { q: "¿Dos años o tres?", a: "Depende del producto. Living Promise con espera usa dos años en la fórmula de primas más 10%. American Amicable usa dos años de porcentajes y el 100% en el año 3. Corebridge GIWL, en la línea cotizada, unos dos años. No hay un único número nacional." },
          ],
        },
      ],
    },
    {
      question: "What is a waiting-period final expense plan?",
      headline: "When insurance pays less at first: the waiting-period plan",
      dek: "A waiting period is the time at the start of the policy when a non-accidental death may pay less than the full amount. It is not a mysterious penalty: it is the product design when health will not support an immediate full-benefit plan.",
      pageTitle: "Waiting-period final expense plans",
      metaDescription:
        "How a final expense plan with a waiting period works in the first years, in plain language. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "Waiting period: in the first years, a death from illness may not pay 100% of the amount.",
        "A covered accident often pays the full amount from the start — if the contract says so.",
        "The formulas are not the same: one company may return premiums plus interest; another may pay a percentage of the amount in year 1 and year 2.",
        "After the wait, a covered death usually pays the full amount while the policy is in force.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "Industry nicknames for this design can sound like a foreign language. In this guide we call it a waiting-period plan or a limited-early-benefit plan, so you do not need a glossary." },
        { type: "h2", text: "Why this design exists" },
        { type: "p", text: "If the company cannot offer a plan that pays in full from day one, it can still offer coverage. In exchange, the first years are not the same check. That opens a door for people with more health history, at a different price and a different set of rules." },
        { type: "h2", text: "How it feels at claim time" },
        { type: "p", text: "Picture a $10,000 amount. If death is from an accident the contract covers, the family may receive $10,000 even in month 4. If death is from illness in year 1, one company may return premiums plus 10%; another may pay 30% of the $10,000. In year 3, both typically pay $10,000. Those examples come from different products; they are not combined in one policy." },
        {
          type: "table",
          caption: "Three formulas we must not mix",
          lead: "Your policy has one row. This table stops one logo’s rule from being copied onto another.",
          headers: ["Product example", "Non-accidental death, early years", "After that"],
          rows: [
            ["Living Promise with a wait", "Years 1–2: premiums paid + 10%", "100% of the amount"],
            ["American Amicable (limited-early-year design)", "Year 1: 30% of amount; year 2: 70%", "100% from year 3"],
            ["Accendo modified (product materials)", "Years 1–2: typically return 110% of earned premiums", "100% from year 3"],
            ["Corebridge guaranteed acceptance (quoted line)", "About a two-year wait: premiums + contract interest", "100% after the wait"],
          ],
          foot: "A covered accident can pay 100% in all of those designs. Always subject to the contract. Ages and caps also differ (Living Promise with a wait: 45–80, about $20,000; Accendo modified: 40–75, up to $25,000; Corebridge GIWL: typical 50–80, $5,000–$25,000).",
        },
        { type: "h2", text: "Advantages and limits" },
        { type: "ul", items: [
          "Advantage: there is a policy when the immediate full-benefit plan will not issue.",
          "Limit: if death from illness happens soon, the check can be small next to the funeral.",
          "Limit: it usually costs more per dollar than the same company’s immediate plan.",
          "Advantage: a covered accident can close that gap from day one.",
        ] },
        { type: "note", text: "If you can qualify for a full-benefit plan, Mejor Vida Insurance does not push a wait “just because.” We quote the path that pays in full first when the answers support it." },
        {
          type: "faq",
          items: [
            { q: "Does the wait also apply to suicide?", a: "Many life policies have their own suicide rules in the early years, separate from the product wait. That is in the contract; we do not generalize it here." },
            { q: "Can I “wait it out” and then switch to a full benefit?", a: "Not automatically. Sometimes a new policy, if health and age allow. It is not a guaranteed internal upgrade." },
            { q: "Two years or three?", a: "It depends on the product. Living Promise with a wait uses two years in the premiums-plus-10% formula. American Amicable uses two years of percentages and 100% in year 3. Corebridge GIWL, on the quoted line, about two years. There is no single national number." },
          ],
        },
      ],
    }
  ),
];
