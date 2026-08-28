"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

function copyGrandchildren(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title:
        "Seguro de vida para nietos: el abuelo como dueño, el niño como asegurado (2026) | Mejor Vida Seguros",
      desc: "Un abuelo puede ser dueño de una póliza de vida entera a nombre del nieto, o agregar un extra temporal en su propio seguro. Firmas, montos y primas de muestra de compañías con las que trabajamos.",
      h1: "Seguro de vida para un nieto: usted paga y posee; el niño es quien está cubierto",
      lead: "Cuando un abuelo compra cobertura para un nieto, hay tres papeles distintos. El <strong>asegurado</strong> es el niño. El <strong>dueño</strong> suele ser usted: paga la cuota y decide. El <strong>beneficiario</strong> es quien recibe el cheque si el niño fallece con la póliza al día. Eso no sustituye el seguro de los padres. Cubre un funeral infantil, deja un ahorro pequeño dentro de algunas pólizas permanentes, o reserva el derecho de comprar más cobertura cuando el nieto sea adulto.",
      crumbEnd: "Seguro para nietos",

      take1:
        "El producto más habitual que colocamos para un nieto es <strong>vida entera simplificada a nombre del niño</strong>. Usted puede ser el dueño. La cuota no sube si se paga a tiempo. Hay preguntas de salud — casi nunca un examen en el consultorio.",
      take2:
        "La otra vía es un <strong>rider de nieto</strong> en la póliza de un adulto (a menudo la suya de gastos finales). El monto es más bajo y suele terminar cerca de los 18–25 años.",
      take3:
        "Las firmas no son iguales en todas las compañías. Mutual of Omaha, en este producto infantil, puede permitir que un abuelo firme sin la firma del padre. American Amicable puede pedir <strong>papeles de tutoría</strong> si solicita un abuelo. Pregunte antes de aplicar.",
      callout:
        "La Asociación Nacional de Comisionados de Seguros (NAIC) pide un <strong>interés asegurable</strong>: una razón reconocida de que el fallecimiento le cause una pérdida económica. La relación de abuelo suele calificar. Eso no significa “cualquier familiar” ni que todas las compañías usen las mismas firmas.",

      giftH: "Qué está comprando, en palabras simples",
      giftP1:
        "Usted no está “regalando un número de anuncio”. Está comprando un contrato. El nieto es la persona cuya vida cubre la póliza. Usted, como dueño, paga y nombra al beneficiario. Si hay un fallecimiento y la póliza está al día, esa persona recibe efectivo. No hay que entregarlo a una funeraria concreta.",
      giftP2:
        "Si elige vida entera, la cobertura no tiene fecha de caducidad mientras se pague. Muchas pólizas acumulan <strong>valor en efectivo</strong> — un ahorro dentro del contrato. El dueño puede pedir un préstamo según las reglas. Un préstamo no pagado se resta del beneficio. Eso no es una cuenta 529 ni un fondo universitario garantizado.",
      giftP3:
        "Si elige un rider, el extra vive en <em>su</em> póliza de adulto (o en la de otro adulto). Cuando el nieto llega a la edad del contrato, ese extra se acaba, salvo que se pueda convertir.",

      payH: "Qué ocurre si hay un reclamo",
      pay1T: "La póliza tiene que estar al día.",
      pay1: "En la vida entera simplificada infantil que cotizamos, el beneficio completo suele estar en vigor desde el primer día si se emitió así. No es la espera de dos años típica de la aceptación garantizada de adultos.",
      pay2T: "El cheque no va “a la familia” en abstracto.",
      pay2: "Va a la persona que el dueño nombró. Puede usarlo para un funeral, viajes, o guardarlo.",
      pay3T: "El valor en efectivo no es el mismo pago.",
      pay3: "Ese ahorro es del dueño, en vida. El beneficio por fallecimiento es lo que recibe el beneficiario.",
      pay4T: "Si deja de pagar, no hay cobertura.",
      pay4: "Una póliza vencida no paga. Elija un monto cuya cuota pueda sostener durante años — no solo el primer mes.",

      pathH: "Dos formas de cubrir a un nieto",
      pathLead:
        "No son el mismo producto. Una deja una póliza permanente a nombre del niño. La otra agrega un extra temporal en un seguro de adulto.",
      pathCol1: "Póliza del nieto",
      pathCol1Sub: "Usted es dueño",
      pathCol2: "Rider en la del adulto",
      pathCol2Sub: "Extra en su cobertura",
      pathR1H: "Quién está cubierto",
      pathR1a: "El nieto es el asegurado de su propia póliza",
      pathR1b: "Los nietos (o hijos) nombrados en el extra del adulto",
      pathR2H: "Cuánto suele durar",
      pathR2a: "Toda la vida, si se paga a tiempo",
      pathR2b: "Hasta una edad fija — a menudo 18 a 25 años",
      pathR3H: "Montos típicos con nosotros",
      pathR3a: "Unos $5,000 a $50,000 en vida entera infantil (Americo AdvantageWL parte de unos $15,000)",
      pathR3b: "Suele ser menor: a menudo $1,000–$10,000; Transamerica tope típico $5,000 por niño en este extra",
      pathR4H: "Valor en efectivo",
      pathR4a: "Sí, en la vida entera infantil que cotizamos",
      pathR4b: "Casi nunca. Es cobertura temporal",
      pathR5H: "Cuándo encaja para un abuelo",
      pathR5a: "Quiere dejarle una póliza permanente y ser el dueño mientras el niño es menor",
      pathR5b: "Ya compra (o tiene) un seguro de adulto y quiere un extra pequeño para varios nietos",

      papersH: "Qué pide la compañía — no es lo mismo en todas",
      papersP:
        "Hace falta el nombre completo y la fecha de nacimiento del niño. Hay preguntas de salud sobre el menor. Casi nunca hay examen en un consultorio. El resto — firmas, número de Seguro Social, papeles de tutoría — lo marca el producto.",
      papers1T: "Mutual of Omaha, vida entera infantil",
      papers1:
        "14 días a 17 años, unos $5,000–$50,000. Hasta 8 niños en un formulario — cada uno recibe su propia póliza. En este producto, un abuelo puede firmar sin la firma del padre cuando las reglas lo permiten.",
      papers2T: "Transamerica Immediate Solution",
      papers2:
        "Un padre o abuelo puede ser dueño aunque el niño sea el asegurado. Montos infantiles típicos $1,000–$50,000. Beneficio completo desde el día 1 si se emite como Immediate. Suele no emitirse si hay “sí” en dos o más categorías médicas, o con ciertos antecedentes de cáncer infantil.",
      papers3T: "American Amicable",
      papers3:
        "Family Solution / Family Choice puede cubrir edades 0–49, desde unos $10,000. Si solicita un abuelo o tutor, pueden pedirse <strong>documentos de tutoría</strong>. En algunos planes de gastos finales de adultos hay un extra para nietos (Golden Solution / Senior Choice); el monto exacto va en la ilustración.",

      kindsH: "Qué colocamos cuando el abuelo es dueño",
      kindsLead:
        "Estos nombres son de compañías con las que trabajamos. No publicamos productos que no cotizamos. Cada renglón es un producto distinto.",
      kind1H: "Vida entera a nombre del nieto",
      kindPerm: [
        [
          "Mutual of Omaha Children’s Whole Life",
          [
            "14 días a 17 años",
            "Unos $5,000–$50,000 · sin examen",
            "Puede comprar más a los 25, 30, 35 y 40, y en algunos hitos",
            "Pausa breve de primas si el dueño fallece (después de 24 meses)",
          ],
        ],
        [
          "Assurity Protect+ / Perform+",
          [
            "Desde 15 días",
            "Hasta unos $300,000 sin examen en muchos casos infantiles",
            "La propiedad suele pasar al hijo a los 25",
          ],
        ],
        [
          "Americo AdvantageWL",
          ["Del nacimiento a 17 años", "Mínimo unos $15,000"],
        ],
      ],
      kind2H: "Extra de nieto en una póliza de adulto",
      kindTemp: [
        [
          "Aetna Accendo Level",
          [
            "Extra en la póliza de gastos finales de un adulto",
            "Pasos de unos $2,500, hasta unos $10,000 por niño",
          ],
        ],
        [
          "Mutual of Omaha",
          ["Rider infantil", "A menudo tope de unos $10,000 por hijo"],
        ],
        [
          "Transamerica Immediate Solution",
          [
            "Extra hijo/nieto · dueño 18–75",
            "Niño 15 días–18 · hasta 9 menores",
            "Tope típico $5,000 · conversión posible tras 2 años",
          ],
        ],
        [
          "Americo Eagle Select",
          ["Rider hijo/nieto", "15 días hasta menos de 17 años"],
        ],
        [
          "Assurity",
          [
            "Rider de término infantil",
            "Unos $5,000–$25,000",
            "Suele terminar cerca de los 25",
          ],
        ],
        [
          "Corebridge Select-a-Term",
          ["Unos $1,000–$25,000", "Suele durar hasta los 25"],
        ],
        [
          "American Amicable",
          ["Complemento para nietos en algunos planes de gastos finales de adultos"],
        ],
      ],

      costH: "Cuánto cuesta cubrir a un nieto",
      costP:
        "Estas cifras son primas mensuales ilustrativas de vida entera simplificada — el niño es el asegurado, usted suele ser el dueño. No son una oferta. Un rider en su póliza de adulto suele costar menos porque el monto es menor. Tablas por edad: <a href=\"costo-seguro-vida-infantil.html\">costo del seguro de vida infantil</a>. Guía general: <a href=\"seguro-vida-infantil.html\">seguro de vida infantil</a>.",
      costNote:
        "Muestras educativas, redondeadas, agosto 2026. El precio real depende de la edad del niño, la salud, el monto, el producto y el estado.",

      moveH: "Cuando el nieto sea adulto",
      moveP:
        "Usted puede seguir como dueño, o ceder la póliza. En Assurity Protect+/Perform+, la propiedad suele pasar al hijo a los 25 sin papeleo extra. En otras compañías el dueño decide cuándo ceder. Léalo en el contrato. El valor en efectivo, si hay, sigue las reglas del dueño de ese momento.",

      altH: "Si la meta es la universidad, no use solo el seguro",
      altP:
        'El <a href="https://www.irs.gov/newsroom/529-plans-questions-and-answers" rel="noopener" target="_blank">Servicio de Impuestos Internos (IRS)</a> describe el 529 como un plan para ahorrar para estudios. El seguro de vida paga si hay un fallecimiento. Puede tener los dos. Uno no sustituye al otro. No prometa colegiatura con una póliza de $10,000.',

      fitH: "¿Le sirve este camino a un abuelo?",
      fitYesH: "Puede encajar si",
      fitYes1: "Quiere dejar cubierto un funeral infantil y un monto permanente pequeño mientras las primas son bajas.",
      fitYes2: "Quiere que el nieto, de adulto, pueda comprar más cobertura sin un nuevo cuestionario (cuando el producto ofrece asegurabilidad garantizada).",
      fitYes3: "Entiende quién será el dueño, quién firma, y si la compañía pide papeles extra.",
      fitNoH: "Suele no encajar si",
      fitNo1: "Los padres que sostienen el hogar no tienen seguro. Cubra primero ese ingreso.",
      fitNo2: "La única meta es ahorrar para la universidad. Compare un plan 529.",
      fitNo3: "No puede pagar la cuota durante años. Una póliza que caduca no ayuda al nieto.",

      buyH: "Cómo lo cotizamos",
      buyLead:
        "No hay un cotizador público solo para nietos. Empiece por una llamada o el formulario. Llevamos la edad del niño, si usted será el dueño, y si quiere póliza propia o rider.",
      buy1T: "Edad del nieto y de quien pagará",
      buy1: "Fijan el producto. Mutual of Omaha Children’s Whole Life empieza a los 14 días; Assurity a los 15 días; Americo AdvantageWL desde el nacimiento.",
      buy2T: "Camino y firmas",
      buy2: "Póliza propia o extra en la del adulto. Diga si el padre firmará. Mutual of Omaha y American Amicable no usan la misma regla de papeles.",
      buy3T: "Salud del niño",
      buy3: "Siguen siendo preguntas simplificadas. Un historial médico grave puede cerrar Immediate Solution de Transamerica; aún así podemos ver otra compañía.",

      faqTitle: "Preguntas",
      faq1q: "¿Cuánto cuesta al mes?",
      faq1a:
        "En nuestras muestras de vida entera simplificada, unos $8–$19 al mes por $10,000 y unos $17–$81 al mes por $50,000, según edad y sexo del niño. Un rider suele ser más barato. No es una oferta.",
      faq2q: "¿Hace falta el permiso de los padres?",
      faq2a:
        "Depende de la compañía. Mutual of Omaha, en la vida entera infantil que colocamos, puede permitir que un abuelo firme sin la firma del padre. American Amicable puede pedir documentos de tutoría. No tratamos “sin permiso” como una regla universal.",
      faq3q: "¿Hace falta ser tutor legal?",
      faq3a:
        "A menudo no. Hace falta interés asegurable y cumplir las firmas del producto. Si una compañía pide papeles de tutoría, se lo decimos antes de aplicar.",
      faq4q: "¿Puede un bisabuelo comprar?",
      faq4a:
        "No tenemos una regla única en nuestros materiales de producto. Cotizamos cuando la compañía reconoce la relación y el interés asegurable. Pregúntenos el caso concreto.",
      faq5q: "¿El nieto se queda con la póliza de adulto?",
      faq5a:
        "En Assurity Protect+/Perform+, la propiedad suele pasar al hijo a los 25. En otras compañías el dueño puede cederla más tarde. Léalo en el contrato.",
      faq6q: "¿Sirve como ahorro para la universidad?",
      faq6a:
        "No de esa forma. El IRS trata el 529 como plan de estudios. El valor en efectivo es lento y usa reglas de préstamo. Use el seguro para el fallecimiento o la asegurabilidad futura.",
      faq7q: "¿Hay impuestos?",
      faq7a:
        'En la mayoría de los casos el beneficio por fallecimiento no es ingreso gravable para el beneficiario. Retirar o regalar valor en efectivo puede tener reglas distintas. Vea las <a href="https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-gift-taxes" rel="noopener" target="_blank">preguntas del IRS sobre el impuesto sobre donaciones</a>. Esto no es asesoría fiscal.',
      faq8q: "¿Puedo comprar más de una póliza?",
      faq8a:
        "Cada compañía tiene su tope. La vida entera simplificada infantil suele acercarse a $50,000 en el camino habitual. Mutual of Omaha tiene otra vía con más revisión, a menudo hasta unos $250,000, con límites respecto a lo que ya tiene el padre, y no está en Washington. No apile anuncios: pida una ilustración.",

      nextH: "Siguiente paso",
      nextP: `Llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a> o use el <a href="contact.html">formulario de contacto</a>. Para el producto en general: <a href="seguro-vida-infantil.html">seguro de vida infantil</a>.`,
      discTitle: "Divulgación",
      discBody:
        "Esta página es educativa, no una oferta. Edades, montos, firmas y precios cambian por compañía, producto y estado. Mejor Vida Insurance LLC es una agencia independiente. El Número Nacional de Productor (NPN) es 21695431. Los estados con licencia actual están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotizar para un nieto",
      quote1: "Usted dueño; el niño asegurado",
      quote2: "Póliza propia o rider",
      quoteCta: "Hablar con nosotros",
      srcTitle: "Fuentes",
      src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: Life insurance</a> — Asociación Nacional de Comisionados de Seguros. El seguro de vida cubre una pérdida económica; hace falta interés asegurable.',
      src2: '<a href="https://www.irs.gov/newsroom/529-plans-questions-and-answers" rel="noopener" target="_blank">IRS: 529 plans</a> — el 529 es un plan de ahorro para estudios, distinto del seguro de vida.',
      src3: '<a href="https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-gift-taxes" rel="noopener" target="_blank">IRS: Gift tax FAQs</a> — reglas de donaciones; no es asesoría fiscal.',
      src4: "Fichas de producto de compañías con las que trabajamos: Mutual of Omaha Children’s Whole Life (firmas de abuelo); Assurity Protect+ / Perform+ (cesión a los 25); Transamerica Immediate Solution y rider hijo/nieto; American Amicable Family Solution / Family Choice y extras de nietos; Aetna Accendo Level / Protection Series; Americo AdvantageWL y Eagle Select.",
      src5: "Primas de muestra: compañías designadas, vida entera simplificada infantil, agosto 2026. Educativas — no vinculantes.",
    };
  }
  return {
    title:
      "Life insurance for grandchildren: the grandparent owns, the child is insured (2026) | Mejor Vida Insurance",
    desc: "A grandparent can own a whole life policy on a grandchild, or add a temporary extra on an adult policy. Signatures, amounts, and sample premiums from companies we work with.",
    h1: "Life insurance for a grandchild: you pay and own; the child is the one covered",
    lead: "When a grandparent buys coverage on a grandchild, there are three different roles. The <strong>insured</strong> is the child. The <strong>owner</strong> is usually you: you pay and decide. The <strong>beneficiary</strong> is who receives the check if the child dies with the policy in force. That does not replace the parents’ coverage. It can help with a child’s funeral, leave a small savings piece inside some permanent policies, or reserve the right to buy more coverage when the grandchild is grown.",
    crumbEnd: "Grandchildren’s life insurance",

    take1:
      "The usual product we place for a grandchild is <strong>simplified-issue whole life in the child’s name</strong>. You can be the owner. The price does not go up if premiums stay current. There are health questions — almost never an in-office exam.",
    take2:
      "The other path is a <strong>grandchild rider</strong> on an adult policy (often your own final-expense plan). The amount is smaller and it usually ends around ages 18–25.",
    take3:
      "Signature rules are not the same at every company. Mutual of Omaha, on this children’s product, can let a grandparent sign without a parent’s signature. American Amicable may ask for <strong>guardianship papers</strong> if a grandparent applies. Ask before you apply.",
    callout:
      "The National Association of Insurance Commissioners (NAIC) asks for an <strong>insurable interest</strong>: a recognized reason that the death would cause you a financial loss. A grandparent relationship often qualifies. That does not mean “any relative,” and companies do not all use the same signature rules.",

    giftH: "What you are buying, in plain words",
    giftP1:
      "You are not “gifting an ad number.” You are buying a contract. The grandchild is the person whose life the policy covers. You, as owner, pay and name the beneficiary. If a death occurs and the policy is in force, that person receives cash. It does not have to go to one funeral home.",
    giftP2:
      "If you choose whole life, coverage has no end date while premiums are paid. Many policies build <strong>cash value</strong> — a savings piece inside the contract. The owner may borrow against it under the policy rules. An unpaid loan comes out of the death benefit. That is not a 529 account and not a guaranteed college fund.",
    giftP3:
      "If you choose a rider, the extra lives on <em>your</em> adult policy (or another adult’s). When the grandchild reaches the contract age, that extra ends, unless it can be converted.",

    payH: "What happens if there is a claim",
    pay1T: "The policy has to be in force.",
    pay1: "On the simplified children’s whole life we quote, the full benefit is usually in force from day one when issued that way. That is not the two-year wait common on adult guaranteed-acceptance plans.",
    pay2T: "The check does not go to “the family” in the abstract.",
    pay2: "It goes to the person the owner named. They can use it for a funeral, travel, or keep it.",
    pay3T: "Cash value is a different payment.",
    pay3: "That savings piece belongs to the owner during life. The death benefit is what the beneficiary receives.",
    pay4T: "If you stop paying, there is no coverage.",
    pay4: "A lapsed policy pays nothing. Pick an amount whose premium you can keep paying for years — not only the first month.",

    pathH: "Two ways to cover a grandchild",
    pathLead:
      "These are not the same product. One leaves a permanent policy in the child’s name. The other adds a temporary extra on an adult’s coverage.",
    pathCol1: "Policy on the grandchild",
    pathCol1Sub: "You are the owner",
    pathCol2: "Rider on an adult policy",
    pathCol2Sub: "Extra on your coverage",
    pathR1H: "Who is covered",
    pathR1a: "The grandchild is the insured on their own policy",
    pathR1b: "The grandchildren (or children) named on the adult’s add-on",
    pathR2H: "How long it usually lasts",
    pathR2a: "For life, if premiums stay current",
    pathR2b: "Until a set age — often 18 to 25",
    pathR3H: "Typical amounts we place",
    pathR3a: "About $5,000–$50,000 on kids whole life (Americo AdvantageWL starts near $15,000)",
    pathR3b: "Usually smaller: often $1,000–$10,000; Transamerica typical cap $5,000 per child on this extra",
    pathR4H: "Cash value",
    pathR4a: "Yes, on the children’s whole life we quote",
    pathR4b: "Almost never. It is term coverage",
    pathR5H: "When it fits a grandparent",
    pathR5a: "You want a permanent policy and to own it while the child is a minor",
    pathR5b: "You already buy (or have) adult coverage and want a small extra for several grandchildren",

    papersH: "What the company asks for — it is not the same everywhere",
    papersP:
      "You need the child’s full name and date of birth. There are health questions about the minor. There is almost never an in-office exam. The rest — signatures, Social Security number, guardianship papers — follows the product.",
    papers1T: "Mutual of Omaha children’s whole life",
    papers1:
      "Ages 14 days–17, about $5,000–$50,000. Up to 8 children on one form — each still gets their own policy. On this product, a grandparent may sign without a parent’s signature when the rules allow.",
    papers2T: "Transamerica Immediate Solution",
    papers2:
      "A parent or grandparent can own the policy even when the child is the insured. Typical kids amounts $1,000–$50,000. Full benefit from day one when issued as Immediate. Usually not issued if two or more medical categories are “yes,” or with certain childhood-cancer histories.",
    papers3T: "American Amicable",
    papers3:
      "Family Solution / Family Choice can cover ages 0–49, from about $10,000. If a grandparent or guardian applies, <strong>guardianship papers</strong> may be required. Some adult final-expense plans have a grandchild extra (Golden Solution / Senior Choice); the exact amount is on the illustration.",

    kindsH: "What we place when a grandparent is the owner",
    kindsLead:
      "These names are from companies we work with. We do not publish products we do not quote. Each line is a different product.",
    kind1H: "Whole life in the grandchild’s name",
    kindPerm: [
      [
        "Mutual of Omaha Children’s Whole Life",
        [
          "Ages 14 days–17",
          "About $5,000–$50,000 · no exam",
          "Can buy more at 25, 30, 35, and 40, and at some life events",
          "Short premium pause if the owner dies (usually after 24 months)",
        ],
      ],
      [
        "Assurity Protect+ / Perform+",
        [
          "From 15 days",
          "Many kids cases up to about $300,000 with no exam",
          "Ownership typically moves to the child at 25",
        ],
      ],
      [
        "Americo AdvantageWL",
        ["Ages 0–17", "About $15,000 minimum"],
      ],
    ],
    kind2H: "A grandchild extra on an adult’s policy",
    kindTemp: [
      [
        "Aetna Accendo Level",
        [
          "Extra on an adult final-expense policy",
          "About $2,500 steps, up to about $10,000 per child",
        ],
      ],
      [
        "Mutual of Omaha",
        ["Children’s rider", "Often capped near $10,000 per child"],
      ],
      [
        "Transamerica Immediate Solution",
        [
          "Child/grandchild extra · owner 18–75",
          "Child 15 days–18 · up to 9 minors",
          "Typical cap $5,000 · conversion may be available after 2 years",
        ],
      ],
      [
        "Americo Eagle Select",
        ["Child/grandchild rider", "15 days through under 17"],
      ],
      [
        "Assurity",
        ["Children’s term rider", "About $5,000–$25,000", "Usually ends near 25"],
      ],
      [
        "Corebridge Select-a-Term",
        ["About $1,000–$25,000", "Typically through age 25"],
      ],
      [
        "American Amicable",
        ["Grandchild add-on on some adult final-expense plans"],
      ],
    ],

    costH: "What it costs to cover a grandchild",
    costP:
      "These figures are illustrative monthly premiums for simplified-issue whole life — the child is the insured, you are usually the owner. Not an offer. A rider on your adult policy usually costs less because the amount is smaller. Age-band tables: <a href=\"children-life-insurance-cost.html\">children’s life insurance cost</a>. Broader guide: <a href=\"children-life-insurance.html\">children’s life insurance</a>.",
    costNote:
      "Educational samples, rounded, August 2026. Actual price depends on the child’s age, health, amount, product, and state.",

    moveH: "When the grandchild is grown",
    moveP:
      "You can stay the owner, or transfer the policy. On Assurity Protect+/Perform+, ownership typically moves to the child at 25 with no extra paperwork. At other companies the owner chooses when to transfer. Read the contract. Cash value, if any, follows the owner’s rules at that time.",

    altH: "If the goal is college, do not use insurance alone",
    altP:
      'The <a href="https://www.irs.gov/newsroom/529-plans-questions-and-answers" rel="noopener" target="_blank">Internal Revenue Service (IRS)</a> describes a 529 as a plan to save for education. Life insurance pays if someone dies. You can have both. One does not replace the other. Do not promise tuition with a $10,000 policy.',

    fitH: "Does this path fit a grandparent?",
    fitYesH: "It can fit if",
    fitYes1: "You want a child’s funeral and a small permanent amount locked in while premiums are low.",
    fitYes2: "You want the grandchild, as an adult, to buy more coverage without a new questionnaire (when the product offers guaranteed insurability).",
    fitYes3: "You understand who will own it, who signs, and whether the company asks for extra papers.",
    fitNoH: "It usually does not fit if",
    fitNo1: "The parents who support the household have no coverage. Insure that income first.",
    fitNo2: "The only goal is college savings. Compare a 529 plan.",
    fitNo3: "You cannot keep paying the premium for years. A lapsed policy does not help the grandchild.",

    buyH: "How we quote this",
    buyLead:
      "There is no public grandchildren-only quote tool. Start with a call or the contact form. We take the child’s age, whether you will be the owner, and whether you want a policy in the child’s name or a rider.",
    buy1T: "Age of the grandchild and of the person paying",
    buy1: "That sets the product. Mutual of Omaha Children’s Whole Life starts at 14 days; Assurity at 15 days; Americo AdvantageWL from birth.",
    buy2T: "Path and signatures",
    buy2: "Own policy or extra on an adult plan. Say whether a parent will sign. Mutual of Omaha and American Amicable do not use the same paperwork rule.",
    buy3T: "The child’s health",
    buy3: "Questions are still simplified. A serious medical history can close Transamerica Immediate Solution; we can still look at another company.",

    faqTitle: "Questions",
    faq1q: "How much does it cost per month?",
    faq1a:
      "On our simplified whole-life samples, about $8–$19 a month for $10,000 and about $17–$81 a month for $50,000, depending on the child’s age and sex. A rider is usually cheaper. Not an offer.",
    faq2q: "Do the parents have to give permission?",
    faq2a:
      "It depends on the company. Mutual of Omaha, on the children’s whole life we place, can let a grandparent sign without a parent’s signature. American Amicable may ask for guardianship papers. We do not treat “no permission needed” as a universal rule.",
    faq3q: "Do I have to be the legal guardian?",
    faq3a:
      "Often no. You need an insurable interest and to meet the product’s signature rules. If a company asks for guardianship papers, we tell you before you apply.",
    faq4q: "Can a great-grandparent buy?",
    faq4a:
      "We do not have one blanket rule in our product materials. We quote when the company recognizes the relationship and insurable interest. Ask us about the specific case.",
    faq5q: "Does the grandchild keep the policy as an adult?",
    faq5a:
      "On Assurity Protect+/Perform+, ownership typically moves to the child at 25. At other companies the owner can transfer it later. Read the contract.",
    faq6q: "Can this fund college?",
    faq6a:
      "Not in that way. The IRS treats a 529 as an education plan. Cash value is slow and uses loan rules. Use insurance for a death benefit or future insurability.",
    faq7q: "Are there taxes?",
    faq7a:
      'In most cases the death benefit is not taxable income to the beneficiary. Taking out or gifting cash value can follow different rules. See the <a href="https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-gift-taxes" rel="noopener" target="_blank">IRS gift-tax FAQs</a>. This is not tax advice.',
    faq8q: "Can I buy more than one policy?",
    faq8a:
      "Each company has its own cap. Simplified children’s whole life often tops out near $50,000 on the usual path. Mutual of Omaha has a separate path with more review, often up to about $250,000, with limits tied to what the parent already has, and it is not available in Washington. Do not stack ads: ask for an illustration.",

    nextH: "Next step",
    nextP: `Call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a> or use the <a href="contact.html">contact form</a>. For the product in general: <a href="children-life-insurance.html">children’s life insurance</a>.`,
    discTitle: "Disclosure",
    discBody:
      "This page is educational, not an offer. Ages, amounts, signatures, and prices change by company, product, and state. Mejor Vida Insurance LLC is an independent agency. The National Producer Number (NPN) is 21695431. Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "Quote a grandchild policy",
    quote1: "You own; the child is insured",
    quote2: "Own policy or rider",
    quoteCta: "Talk with us",
    srcTitle: "Sources",
    src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: Life insurance</a> — National Association of Insurance Commissioners. Life insurance covers a financial loss; you need an insurable interest.',
    src2: '<a href="https://www.irs.gov/newsroom/529-plans-questions-and-answers" rel="noopener" target="_blank">IRS: 529 plans</a> — a 529 is an education-savings plan, different from life insurance.',
    src3: '<a href="https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-gift-taxes" rel="noopener" target="_blank">IRS: Gift tax FAQs</a> — gift-tax rules; not tax advice.',
    src4: "Product materials from companies we work with: Mutual of Omaha Children’s Whole Life (grandparent signatures); Assurity Protect+ / Perform+ (ownership at 25); Transamerica Immediate Solution and child/grandchild rider; American Amicable Family Solution / Family Choice and grandchild extras; Aetna Accendo Level / Protection Series; Americo AdvantageWL and Eagle Select.",
    src5: "Sample premiums: appointed companies, simplified-issue children’s whole life, August 2026. Educational — not binding.",
  };
}

function carrierListHtml(items) {
  return `<ul class="lic-carrier-list">${(items || [])
    .map(([name, facts]) => {
      const lines = Array.isArray(facts) ? facts : [facts];
      const inner = lines.map((line) => `<li>${line}</li>`).join("");
      return `<li><strong>${name}</strong><ul>${inner}</ul></li>`;
    })
    .join("")}</ul>`;
}

function grandchildrenMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "tipos-seguro-vida.html" : "life-insurance-products.html";
  const kids = isEs ? "seguro-vida-infantil.html" : "children-life-insurance.html";
  const cost = isEs ? "costo-seguro-vida-infantil.html" : "children-life-insurance-cost.html";
  const contact = "contact.html";
  const moo = isEs ? "carriers/mutual-of-omaha-infantil.html" : "carriers/mutual-of-omaha-children.html";
  const aa = isEs ? "carriers/american-amicable-infantil.html" : "carriers/american-amicable-children.html";
  const ta = isEs ? "carriers/transamerica-infantil.html" : "carriers/transamerica-children.html";
  const female = isEs ? "Mujer" : "Female";
  const male = isEs ? "Hombre" : "Male";
  const ageCol = isEs ? "Edad" : "Age band";
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8]
    .filter((n) => c["faq" + n + "q"])
    .map(
      (n, i) =>
        `<details${i === 0 ? " open" : ""}><summary>${c["faq" + n + "q"]}</summary><p>${c["faq" + n + "a"]}</p></details>`
    )
    .join("\n");
  const pathRow = (head, a, b) =>
    `<div class="lic-vs-chart__row" role="row">
<div class="lic-vs-chart__q" role="rowheader">${head}</div>
<div class="lic-vs-chart__ins" role="cell" data-label="${c.pathCol1}">${a}</div>
<div class="lic-vs-chart__pre" role="cell" data-label="${c.pathCol2}">${b}</div>
</div>`;
  return `<main>
<section class="lic-hero">
<div class="lic-hero-media lic-hero-media--${page.hero.modifier}" aria-hidden="true">
<picture>
<source srcset="${assets}img/opt/${page.hero.base}.webp?v=${page.hero.cache}" type="image/webp"/>
<img src="${assets}img/opt/${page.hero.base}.jpg?v=${page.hero.cache}" alt="" width="${page.hero.width}" height="${page.hero.height}" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › <a href="${mid}">${isEs ? "Tipos de seguro" : "Life insurance types"}</a> › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#gift">${isEs ? "Qué compra" : "What you buy"}</a>
<a href="#paths">${isEs ? "Dos formas" : "Two ways"}</a>
<a href="#papers">${isEs ? "Firmas" : "Signatures"}</a>
<a href="#cost">${isEs ? "Costo" : "Cost"}</a>
<a href="#fit">${isEs ? "¿Le sirve?" : "Does it fit?"}</a>
<a href="#faq">${isEs ? "Preguntas" : "Questions"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Tres hechos para empezar" : "Three facts to start with"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<div class="lic-helpful"><p>${c.callout}</p></div>
<section class="lic-section" id="gift">
<h2>${c.giftH}</h2>
<p>${c.giftP1}</p>
<p>${c.giftP2}</p>
<p>${c.giftP3}</p>
</section>
<section class="lic-section" id="pay">
<h2>${c.payH}</h2>
<ol class="lic-lesson-steps">
<li><strong>${c.pay1T}</strong> ${c.pay1}</li>
<li><strong>${c.pay2T}</strong> ${c.pay2}</li>
<li><strong>${c.pay3T}</strong> ${c.pay3}</li>
<li><strong>${c.pay4T}</strong> ${c.pay4}</li>
</ol>
</section>
<section class="lic-section" id="paths">
<h2>${c.pathH}</h2>
<p>${c.pathLead}</p>
<div class="lic-vs-chart" role="table" aria-label="${c.pathH}">
<div class="lic-vs-chart__row lic-vs-chart__head" role="row">
<div class="lic-vs-chart__q lic-vs-chart__q--blank" role="columnheader"></div>
<div class="lic-vs-chart__ins" role="columnheader"><strong>${c.pathCol1}</strong><span>${c.pathCol1Sub}</span></div>
<div class="lic-vs-chart__pre" role="columnheader"><strong>${c.pathCol2}</strong><span>${c.pathCol2Sub}</span></div>
</div>
${pathRow(c.pathR1H, c.pathR1a, c.pathR1b)}
${pathRow(c.pathR2H, c.pathR2a, c.pathR2b)}
${pathRow(c.pathR3H, c.pathR3a, c.pathR3b)}
${pathRow(c.pathR4H, c.pathR4a, c.pathR4b)}
${pathRow(c.pathR5H, c.pathR5a, c.pathR5b)}
</div>
</section>
<section class="lic-section" id="papers">
<h2>${c.papersH}</h2>
<p>${c.papersP}</p>
<div class="lic-fact-trio">
<div>
<h3>${c.papers1T}</h3>
<p>${c.papers1} <a href="${moo}">Mutual of Omaha</a>.</p>
</div>
<div>
<h3>${c.papers2T}</h3>
<p>${c.papers2} <a href="${ta}">Transamerica</a>.</p>
</div>
<div>
<h3>${c.papers3T}</h3>
<p>${c.papers3} <a href="${aa}">American Amicable</a>.</p>
</div>
</div>
</section>
<section class="lic-section" id="kinds">
<h2>${c.kindsH}</h2>
<p>${c.kindsLead}</p>
<div class="lic-choice-pair lic-fact-trio--color">
<div>
<p class="lic-fact-kicker">${isEs ? "Camino permanente" : "Permanent path"}</p>
<h3>${c.kind1H}</h3>
${carrierListHtml(c.kindPerm)}
</div>
<div>
<p class="lic-fact-kicker">${isEs ? "Camino temporal" : "Temporary path"}</p>
<h3>${c.kind2H}</h3>
${carrierListHtml(c.kindTemp)}
</div>
</div>
</section>
<section class="lic-section" id="cost" data-lic-product="children" data-lic-quote-href="${contact}">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
<div class="lic-face-tabs" role="tablist" aria-label="${isEs ? "Montos" : "Coverage amounts"}">
<button type="button" class="lic-face-tab is-active" data-lic-face="10000" role="tab" aria-selected="true">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="25000" role="tab" aria-selected="false">$25,000</button>
<button type="button" class="lic-face-tab" data-lic-face="40000" role="tab" aria-selected="false">$40,000</button>
<button type="button" class="lic-face-tab" data-lic-face="50000" role="tab" aria-selected="false">$50,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
<aside class="lic-callout" aria-label="${isEs ? "Nota de la tabla" : "Chart note"}">
<strong>${isEs ? "Nota" : "Note"}</strong>
<p>${c.costNote}</p>
</aside>
</section>
<section class="lic-section" id="transfer">
<h2>${c.moveH}</h2>
<p>${c.moveP}</p>
</section>
<section class="lic-section" id="alt">
<h2>${c.altH}</h2>
<p>${c.altP}</p>
</section>
<section class="lic-section" id="fit">
<h2>${c.fitH}</h2>
<div class="lic-choice-pair">
<div class="lic-choice lic-choice--yes">
<h3>${c.fitYesH}</h3>
<ul>
<li>${c.fitYes1}</li>
<li>${c.fitYes2}</li>
<li>${c.fitYes3}</li>
</ul>
</div>
<div class="lic-choice lic-choice--no">
<h3>${c.fitNoH}</h3>
<ul>
<li>${c.fitNo1}</li>
<li>${c.fitNo2}</li>
<li>${c.fitNo3}</li>
</ul>
</div>
</div>
</section>
<section class="lic-section" id="apply">
<h2>${c.buyH}</h2>
<p>${c.buyLead}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.buy1T}</strong> ${c.buy1}</li>
<li><strong>${c.buy2T}</strong> ${c.buy2}</li>
<li><strong>${c.buy3T}</strong> ${c.buy3}</li>
</ol>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqs}
</section>
<section class="lic-section" id="next">
<h2>${c.nextH}</h2>
<p>${c.nextP}</p>
</section>
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<section class="lic-section" id="sources">
<h2>${c.srcTitle}</h2>
<ul>
<li>${c.src1}</li>
<li>${c.src2}</li>
<li>${c.src3}</li>
<li>${c.src4}</li>
<li>${c.src5}</li>
</ul>
</section>
<p class="lic-rate-note"><a href="${kids}">${isEs ? "Guía de seguro infantil" : "Children’s life insurance guide"}</a> · <a href="${cost}">${isEs ? "Tablas de costo" : "Cost tables"}</a> · <a href="${mid}">${isEs ? "Tipos de seguro" : "Life insurance types"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2, quoteHref: contact, cta: c.quoteCta })}
</div>
</main>`;
}

module.exports = { copyGrandchildren, grandchildrenMain };
