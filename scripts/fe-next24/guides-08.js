"use strict";

const { pack, ctaEs, ctaEn, SRC } = require("./shared");

module.exports = [
  pack(
    "seguro-gastos-finales-cubre-deudas-medicas",
    "does-final-expense-cover-medical-debt",
    ["beneficio-seguro-gastos-finales-familia", "que-son-gastos-finales", "que-son-polizas-gastos-finales"],
    {
      question: "¿El seguro de gastos finales cubre deudas médicas?",
      headline: "El seguro no paga al hospital: paga a su beneficiario",
      dek: "Un seguro de gastos finales es un cheque en efectivo. No es un pagador de facturas médicas. La familia puede usar ese dinero para deudas del hospital, el funeral u otra necesidad.",
      pageTitle: "¿El seguro de gastos finales cubre deudas médicas?",
      metaDescription:
        "Cómo se usa el beneficio de un seguro de gastos finales frente a facturas médicas. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "El beneficiario recibe efectivo. No hay una lista obligatoria de “solo funeral.”",
        "Medicare y el seguro de salud, si aplican, son quienes tratan las cuentas médicas en vida o justo después, según sus reglas. El gasto final no sustituye a Medicare.",
        "Una factura médica grande puede superar el monto de la póliza. El seguro no borra el resto por arte de magia.",
        "Quién debe una deuda médica después de un fallecimiento depende de la ley del estado y de la herencia. Eso es tema legal, no de una cotización.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "La confusión nace del nombre. “Gastos finales” suena a un paquete que incluye hospital, farmacia y funeraria. En el contrato, casi siempre es vida: un monto fijo a una persona que usted eligió." },
        { type: "h2", text: "Qué hace el cheque — y qué no" },
        { type: "p", text: "La aseguradora paga al beneficiario (o los beneficiarios) según la póliza. Ese dinero puede ir a un saldo del hospital, a la cremación, a un vuelo o a una cuenta de ahorros. La compañía de vida no se sienta a negociar con el hospital. Tampoco “aprueba” cada factura." },
        { type: "p", text: "Medicare cubre servicios de salud que califican. No está diseñado para el funeral. Una factura que Medicare no pagó puede quedar para el caudal hereditario o para quien la firmó. El gasto final es un fondo extra, no un reemplazo de Medicare." },
        { type: "h2", text: "Cómo dimensionar si hay deudas médicas" },
        { type: "p", text: "Sume un estimado honesto de facturas que no están cubiertas, más el funeral. Si el total es $18,000 y la póliza es $10,000, la familia todavía tiene $8,000 de conversación. Subir el monto, si el producto y la salud lo permiten, es una decisión de prima mensual. No prometemos que un $10,000 “cubra todas las deudas médicas.”" },
        {
          type: "table",
          caption: "Tres cuentas distintas",
          lead: "Mezclarlas es lo que genera expectativas imposibles.",
          headers: ["Cuenta", "Quién suele pagarla", "Rol del seguro de gastos finales"],
          rows: [
            ["Factura del hospital o médico", "Seguro de salud / Medicare / paciente o herencia", "El beneficiario puede usar el cheque si quiere"],
            ["Funeral o cremación", "Quien firma con la funeraria", "Uso muy común del beneficio"],
            ["Deudas de tarjeta u otros préstamos", "Según el contrato de esa deuda y la herencia", "El beneficiario decide si ayuda a pagarlas"],
          ],
          foot: "Esta tabla no es asesoría legal ni fiscal.",
        },
        { type: "h2", text: "Nombre del beneficiario" },
        { type: "p", text: "Si el objetivo es que un hijo pague tanto el funeral como una factura, ese hijo debe estar nombrado (o un fideicomiso, si un abogado lo diseña). Nombrar “el hospital” no es el diseño habitual de estas pólizas y puede no ser práctico. Hable de nombres concretos, no de instituciones genéricas." },
        {
          type: "faq",
          items: [
            { q: "¿La aseguradora envía el dinero al hospital?", a: "En un gasto final típico, no. Envía el beneficio al beneficiario." },
            { q: "¿Medicare paga el funeral si hay deudas médicas grandes?", a: "Medicare no está diseñado para funerales, haya o no deudas médicas." },
            { q: "¿Mis hijos heredan automáticamente mis facturas médicas?", a: "No lo afirmamos como regla nacional. Depende del estado, de quién firmó y de la herencia. Consulte a un abogado." },
          ],
        },
        { type: "sources", items: [SRC.medicare, SRC.naic] },
      ],
    },
    {
      question: "Does final expense insurance cover medical debt?",
      headline: "The insurance does not pay the hospital: it pays your beneficiary",
      dek: "Final expense insurance is a cash check. It is not a medical-bill payer. The family can use that money for hospital debt, the funeral, or another need.",
      pageTitle: "Does final expense insurance cover medical debt?",
      metaDescription:
        "How a final expense benefit works next to medical bills. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "The beneficiary receives cash. There is no required “funeral only” shopping list.",
        "Medicare and health insurance, if they apply, are what handle medical accounts in life or right after, under their rules. Final expense does not replace Medicare.",
        "A large medical bill can exceed the policy amount. Insurance does not magically erase the rest.",
        "Who owes a medical debt after a death depends on state law and the estate. That is a legal question, not a quote.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "The confusion starts with the name. “Final expense” sounds like a bundle that includes hospital, pharmacy, and funeral home. In the contract, it is almost always life insurance: a set amount to a person you chose." },
        { type: "h2", text: "What the check does — and does not" },
        { type: "p", text: "The insurer pays the beneficiary (or beneficiaries) as the policy writes it. That money can go to a hospital balance, cremation, a flight, or a savings account. The life company does not sit down to negotiate with the hospital. It also does not “approve” each invoice." },
        { type: "p", text: "Medicare covers qualifying health services. It is not designed for the funeral. A bill Medicare did not pay may remain for the estate or for the person who signed. Final expense is an extra fund, not a Medicare replacement." },
        { type: "h2", text: "How to size coverage if there is medical debt" },
        { type: "p", text: "Add an honest estimate of uncovered bills, plus the funeral. If the total is $18,000 and the policy is $10,000, the family still has an $8,000 conversation. Raising the amount, if the product and health allow it, is a monthly-premium decision. We do not promise that $10,000 “covers all medical debts.”" },
        {
          type: "table",
          caption: "Three different bills",
          lead: "Mixing them is what creates impossible expectations.",
          headers: ["Bill", "Who usually pays it", "Role of final expense insurance"],
          rows: [
            ["Hospital or doctor invoice", "Health insurance / Medicare / patient or estate", "The beneficiary can use the check if they choose"],
            ["Funeral or cremation", "Whoever signs with the funeral home", "A very common use of the benefit"],
            ["Card debt or other loans", "Per that debt’s contract and the estate", "The beneficiary decides whether to help pay them"],
          ],
          foot: "This table is not legal or tax advice.",
        },
        { type: "h2", text: "The beneficiary’s name" },
        { type: "p", text: "If the goal is for a child to pay both the funeral and a bill, that child should be named (or a trust, if an attorney designs it). Naming “the hospital” is not the usual design of these policies and may not be practical. Talk about concrete names, not generic institutions." },
        {
          type: "faq",
          items: [
            { q: "Does the insurer send money to the hospital?", a: "On a typical final expense policy, no. It sends the benefit to the beneficiary." },
            { q: "Does Medicare pay for the funeral if medical debts are large?", a: "Medicare is not designed for funerals, whether or not there are medical debts." },
            { q: "Do my children automatically inherit my medical bills?", a: "We do not claim that as a national rule. It depends on the state, who signed, and the estate. Ask an attorney." },
          ],
        },
        { type: "sources", items: [SRC.medicare, SRC.naic] },
      ],
    }
  ),

  pack(
    "beneficio-seguro-gastos-finales-familia",
    "leaving-money-beyond-funeral-costs",
    ["cuanta-cobertura-gastos-finales-necesito", "seguro-gastos-finales-cubre-deudas-medicas", "que-son-polizas-gastos-finales"],
    {
      question: "¿Puedo dejar dinero a mi familia además del funeral?",
      headline: "El sobrante del beneficio es de la familia, no de la funeraria",
      dek: "Si el cheque es mayor que el funeral, el resto no se “devuelve” a la aseguradora. El beneficiario lo guarda o lo usa en otras necesidades. Por eso el monto de la póliza es una decisión, no un paquete cerrado.",
      pageTitle: "Dejar dinero a la familia además del funeral",
      metaDescription:
        "Qué pasa con el dinero de un seguro de gastos finales que sobra después del funeral. Guía de Mejor Vida Seguros.",
      keyTakeaways: [
        "El beneficiario recibe el monto cubierto (menos préstamos u otros descuentos del contrato), no una factura preaprobada de la funeraria.",
        "Un resto puede ayudar con viaje, comida de los días del velorio, deudas o un pequeño legado.",
        "Nombrar bien a los beneficiarios importa más que un eslogan de “dejar herencia.”",
        "Un monto más alto cuesta más cada mes y puede chocar con el tope de edad del producto.",
      ],
      cta: ctaEs,
      blocks: [
        { type: "p", text: "Algunas personas compran exactamente “lo del ataúd.” Otras quieren que, si el servicio sale más barato o si ya hay un lote pagado, los hijos no se queden en cero. Ambas intenciones caben en el mismo tipo de póliza: cambia el número." },
        { type: "h2", text: "No hay una alcancía de la funeraria" },
        { type: "p", text: "A diferencia de un contrato prepagado, el seguro no está atado a un paquete de servicios. Si la cremación cuesta $4,000 y la póliza paga $10,000, los $6,000 restantes son del beneficiario. La aseguradora no reclama la diferencia porque el funeral fue sencillo." },
        { type: "h2", text: "Qué puede hacer ese resto" },
        { type: "ul", items: [
          "Pasajes y hotel para quien vive en otro estado.",
          "Comidas, flores o un aviso obituario que no estaban en la mediana de la NFDA.",
          "Una deuda pequeña que usted no quería dejar.",
          "Un regalo, sin trámites de testamento, si el beneficiario ya está nombrado. (Un testamento sigue siendo otra conversación.)",
        ] },
        { type: "p", text: "La mediana NFDA 2023 de $8,300 (velatorio y entierro, lado funeraria) y $6,280 (velatorio y cremación) sirve para calibrar. Si usted compra $15,000, está eligiendo a propósito un colchón. Si compra $5,000, está eligiendo un piso más bajo." },
        { type: "h2", text: "Límites honestos" },
        { type: "p", text: "Un gasto final no es un plan de retiro ni un fondo universitario. Los topes de producto (a menudo hasta $50,000, a veces $25,000 a edades altas) no sustituyen una vida entera grande. Tampoco evitamos impuestos de herencia complejos: el beneficio de vida suele no ser ingreso gravable para el beneficiario, pero eso no es asesoría fiscal." },
        {
          type: "faq",
          items: [
            { q: "¿Puedo poner a dos hijos a partes iguales?", a: "Por lo general sí, si el formulario lo permite. Confirme porcentajes y un contingente si alguien fallece antes." },
            { q: "¿La funeraria puede exigir el cheque?", a: "Usted puede asignar o la familia puede pagarles. El diseño habitual es pagar al beneficiario. Un prepago es el camino si quiere atar el dinero a una funeraria." },
            { q: "¿Debo decirle a mi familia el monto?", a: "Ayuda que sepan que existe una póliza y quién es el dueño. El número exacto es su decisión." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.naic] },
      ],
    },
    {
      question: "Can I leave money to my family beyond funeral costs?",
      headline: "Money left after the funeral belongs to the family, not the funeral home",
      dek: "If the check is larger than the funeral, the extra is not “returned” to the insurer. The beneficiary keeps it or uses it for other needs. That is why the policy amount is a choice, not a closed package.",
      pageTitle: "Leaving money beyond funeral costs",
      metaDescription:
        "What happens to final expense insurance money that remains after the funeral. A guide from Mejor Vida Insurance.",
      keyTakeaways: [
        "The beneficiary receives the covered amount (minus loans or other contract reductions), not a pre-approved funeral invoice.",
        "A remainder can help with travel, meals during viewing days, debts, or a small gift.",
        "Naming beneficiaries correctly matters more than a slogan about “leaving an inheritance.”",
        "A higher amount costs more each month and may hit the product’s age cap.",
      ],
      cta: ctaEn,
      blocks: [
        { type: "p", text: "Some people buy “just the casket.” Others want their children not to be left at zero if the service costs less or a plot is already paid. Both intentions fit the same kind of policy: the number changes." },
        { type: "h2", text: "There is no funeral-home piggy bank" },
        { type: "p", text: "Unlike a prepaid contract, insurance is not tied to a service package. If cremation costs $4,000 and the policy pays $10,000, the remaining $6,000 belongs to the beneficiary. The insurer does not claw back the difference because the funeral was simple." },
        { type: "h2", text: "What that remainder can do" },
        { type: "ul", items: [
          "Flights and a hotel for someone who lives in another state.",
          "Meals, flowers, or an obituary that were not inside the NFDA median.",
          "A small debt you did not want to leave.",
          "A gift, without probate of that check, if the beneficiary is already named. (A will is still a separate conversation.)",
        ] },
        { type: "p", text: "NFDA’s 2023 medians of $8,300 (viewing and burial, funeral-home side) and $6,280 (viewing and cremation) help you calibrate. If you buy $15,000, you are choosing a cushion on purpose. If you buy $5,000, you are choosing a lower floor." },
        { type: "h2", text: "Honest limits" },
        { type: "p", text: "Final expense is not a retirement plan or a college fund. Product caps (often up to $50,000, sometimes $25,000 at older ages) do not replace large whole life. We also do not wave away complex estate tax questions: a life benefit is often not taxable income to the beneficiary, but that is not tax advice." },
        {
          type: "faq",
          items: [
            { q: "Can I split two children equally?", a: "Usually yes, if the form allows it. Confirm percentages and a backup if someone dies first." },
            { q: "Can the funeral home demand the check?", a: "You can assign it or the family can pay them. The usual design pays the beneficiary. A prepay is the path if you want the money tied to a funeral home." },
            { q: "Should I tell my family the amount?", a: "It helps if they know a policy exists and who owns it. The exact number is your decision." },
          ],
        },
        { type: "sources", items: [SRC.nfda, SRC.naic] },
      ],
    }
  ),
];
