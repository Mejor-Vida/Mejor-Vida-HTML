"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

function copyChildren(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title:
        "Seguro de vida infantil: póliza propia o complemento en la del adulto (2026) | Mejor Vida Seguros",
      desc: "El seguro de vida para un niño suele ser vida entera simplificada, o un complemento temporal en la póliza de un adulto. Edades, montos, quién puede comprar, y primas de muestra de compañías con las que trabajamos.",
      h1: "Seguro de vida infantil: una póliza pequeña para el niño, o un extra en la póliza de un adulto",
      lead: "El seguro de vida infantil cubre a un menor. Si el niño fallece mientras la póliza está al día, la persona que usted nombró — el <strong>beneficiario</strong> — recibe un cheque. No reemplaza el sueldo de un padre. Cubre un funeral, deja un ahorro pequeño dentro de algunas pólizas, o reserva el derecho de comprar más cobertura cuando el niño sea adulto. Hay dos caminos: una póliza a nombre del niño, o un <strong>rider</strong> (un extra temporal) en la póliza de un adulto.",
      crumbEnd: "Seguro infantil",

      take1:
        "En las compañías con las que trabajamos, la cobertura infantil más común es <strong>vida entera de emisión simplificada</strong>: dura toda la vida si se paga, la cuota no sube, y suele haber preguntas de salud — no un examen en el consultorio.",
      take2:
        "La otra vía es un <strong>rider infantil</strong> en la póliza de un adulto: montos más bajos, suele terminar cerca de los 18–25 años, y cuesta menos porque no es permanente.",
      take3:
        "No es una cuenta de ahorro para la universidad. Un plan 529 (el plan de ahorro educativo de EE. UU.) es otra herramienta. El seguro de vida paga si hay un fallecimiento; el 529 está pensado para estudios. Puede tener los dos. Uno no sustituye al otro.",
      callout:
        "Antes de asegurar a un niño, cubra al adulto que paga las cuentas. La guía del comprador de la Asociación Nacional de Comisionados de Seguros (NAIC) pide pensar qué pérdida económica habría si esa persona fallece. En un niño, esa pérdida suele ser un funeral y gastos inmediatos — no un sueldo.",

      whatH: "Qué es, en palabras simples",
      whatP1:
        "Usted compra una póliza. El <strong>asegurado</strong> es el niño. El <strong>dueño</strong> suele ser un padre, madre o abuelo. El dueño paga la cuota y nombra al beneficiario. Si el niño fallece con la póliza al día, esa persona recibe dinero en efectivo. No hay que usarlo en una funeraria concreta.",
      whatP2:
        "La mayoría de las pólizas infantiles que colocamos son <strong>vida entera</strong>: la cobertura no tiene fecha de caducidad mientras se pague. Muchas acumulan <strong>valor en efectivo</strong> — un ahorro dentro del contrato del que el dueño puede pedir un préstamo, según las reglas de la póliza. Eso no es una cuenta bancaria. Un préstamo no pagado se resta del beneficio.",
      whatP3:
        "También existe el camino del rider. El adulto ya tiene (o compra) un seguro. El rider agrega un monto pequeño por cada hijo nombrado. Cuando el hijo llega a cierta edad, ese extra termina, salvo que el contrato permita convertirlo en una póliza permanente.",

      howH: "Cómo paga",
      how1T: "Hay un fallecimiento y la póliza está al día.",
      how1: "La compañía revisa la solicitud de reclamo. En vida entera simplificada infantil, el beneficio completo suele estar en vigor desde el primer día si la póliza se emitió así — no hay la espera de dos años de la aceptación garantizada de adultos.",
      how2T: "El cheque va a quien usted nombró.",
      how2: "Esa persona decide. Puede pagar un funeral, deudas pequeñas, o guardar el dinero. No hay que entregarlo a una funeraria.",
      how3T: "Si hay valor en efectivo, no es el mismo cheque.",
      how3: "El valor en efectivo es del dueño, en vida. El beneficio por fallecimiento es lo que se paga al beneficiario. Un préstamo sobre el valor en efectivo reduce lo que queda.",
      how4T: "Si deja de pagar, la cobertura se acaba.",
      how4: "Una póliza vencida no paga. Elija un monto cuya cuota pueda sostener durante años.",

      pathH: "Dos caminos — no son lo mismo",
      pathLead:
        "Las familias suelen mezclarlos. Uno es una póliza del niño. El otro es un extra en la póliza de un adulto. Las compañías con las que trabajamos ofrecen los dos, según el producto.",
      pathCol1: "Póliza del niño",
      pathCol1Sub: "Vida entera simplificada",
      pathCol2: "Rider en la del adulto",
      pathCol2Sub: "Extra temporal",
      pathR1H: "Quién está cubierto",
      pathR1a: "El niño es el asegurado de su propia póliza",
      pathR1b: "Los hijos nombrados en el extra del adulto",
      pathR2H: "Cuánto suele durar",
      pathR2a: "Toda la vida, si se paga a tiempo",
      pathR2b: "Hasta una edad fija — a menudo 18 a 25 años",
      pathR3H: "Montos típicos con nosotros",
      pathR3a: "Unos $5,000 a $50,000 en vida entera infantil (Americo AdvantageWL parte de unos $15,000)",
      pathR3b: "Suele ser menor: a menudo $1,000–$10,000 por hijo; Corebridge Select-a-Term hasta unos $25,000",
      pathR4H: "¿Hay examen médico?",
      pathR4a: "Casi nunca en el consultorio. Sí hay preguntas de salud",
      pathR4b: "Depende de la póliza del adulto. El extra sigue las reglas de ese contrato",
      pathR5H: "¿Acumula valor en efectivo?",
      pathR5a: "Sí, en la vida entera infantil que cotizamos",
      pathR5b: "Casi nunca. Es cobertura temporal, no un ahorro",

      notH: "Qué no es",
      not1H: "No sustituye el seguro del padre o la madre",
      not1: "Si el adulto que paga la casa y la comida no tiene cobertura, un seguro infantil no llena ese hueco. La NAIC pide sumar deudas e ingresos de quien sostiene el hogar. Empiece ahí.",
      not2H: "No es un plan 529",
      not2: 'El <a href="https://www.irs.gov/newsroom/529-plans-questions-and-answers" rel="noopener" target="_blank">Servicio de Impuestos Internos (IRS)</a> describe el 529 como un plan para ahorrar para estudios, con reglas fiscales propias. El seguro de vida no es esa cuenta. Si la meta es la universidad, compare un 529. Si la meta es un beneficio si el niño fallece — o dejarle una póliza permanente — el seguro responde a otra pregunta.',
      not3H: "No es un “fondo de estudios” garantizado",
      not3: "El valor en efectivo crece despacio y según el contrato. Pedir prestado contra él tiene interés. No prometa colegiatura con una póliza de $10,000.",

      kindsH: "Qué productos usamos para niños",
      kindsLead:
        "Estos nombres son de compañías con las que trabajamos. Los montos y edades son de nuestros materiales de producto, no de un anuncio genérico. Cada renglón es un producto distinto.",
      kind1H: "Vida entera a nombre del niño",
      kindPerm: [
        [
          "Mutual of Omaha Children’s Whole Life",
          [
            "14 días a 17 años",
            "Unos $5,000–$50,000 · sin examen",
            "Puede comprar más después sin nuevas preguntas de salud",
            "Pausa breve de primas si el dueño fallece (después de 24 meses)",
          ],
        ],
        [
          "Transamerica Immediate Solution",
          [
            "El niño puede ser el asegurado",
            "Montos infantiles típicos $1,000–$50,000",
            "Beneficio completo desde el día 1 si se emite como Immediate",
          ],
        ],
        [
          "Assurity Protect+ / Perform+",
          [
            "Desde 15 días · el mismo producto cubre también adultos",
            "Hasta unos $300,000 sin examen en muchos casos infantiles",
            "La propiedad suele pasar al hijo a los 25",
          ],
        ],
        [
          "Americo AdvantageWL",
          ["0–17 años", "Mínimo unos $15,000"],
        ],
        [
          "American Amicable Family Solution / Family Choice",
          [
            "0–49 años",
            "Desde unos $10,000",
            "Tope típico de beneficio inmediato unos $35,000",
          ],
        ],
      ],
      kind2H: "Rider en la póliza de un adulto",
      kindTemp: [
        [
          "Aetna Accendo Level",
          [
            "Extra temporal en pasos de unos $2,500",
            "Hasta unos $10,000 por hijo",
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
            "Hijo 15 días–18 · hasta 9 menores",
            "Tope típico $5,000 por hijo · conversión posible tras 2 años",
          ],
        ],
        [
          "Corebridge Select-a-Term",
          ["Unos $1,000–$25,000", "Suele durar hasta los 25"],
        ],
        [
          "Americo Eagle Select",
          ["Rider hijo/nieto", "15 días hasta menos de 17 años"],
        ],
        [
          "Assurity",
          [
            "Rider de término infantil 15 días–17",
            "Unos $5,000–$25,000",
            "Suele terminar cerca de los 25",
          ],
        ],
      ],

      costH: "Cuánto cuesta una póliza infantil",
      costP:
        "Estas cifras son primas mensuales ilustrativas de vida entera simplificada, de compañías con las que trabajamos. No son una oferta. Un rider en la póliza de un adulto suele costar menos porque el monto es menor y no es permanente — pida una ilustración. Tabla completa por edad: <a href=\"costo-seguro-vida-infantil.html\">costo del seguro de vida infantil</a>.",
      costNote:
        "Muestras educativas, redondeadas, agosto 2026. El precio real depende de la edad, la salud, el monto, el producto y el estado.",

      whoH: "Quién puede comprar cobertura para un niño",
      whoP:
        "Hace falta <strong>interés asegurable</strong>: una razón reconocida por la ley para que el fallecimiento del niño le cause una pérdida económica. Un padre o tutor suele calificar. Un abuelo a menudo también, según la compañía. Mutual of Omaha permite, en este producto, que un abuelo firme en algunos casos sin la firma del padre. Transamerica deja que un padre o abuelo sea dueño aunque el niño sea el asegurado. El estado y el producto mandan. No cotizamos “cualquier familiar” sin esa relación.",
      who1T: "Padre, madre o tutor",
      who1: "El camino más habitual. El adulto es dueño y paga. El niño es el asegurado.",
      who2T: "Abuelo o abuela",
      who2: "Frecuente en Mutual of Omaha, Transamerica y en riders de nietos (American Amicable, Aetna). Confirme firmas y quién aparece como dueño.",
      who3T: "Varios hijos en una solicitud",
      who3: "Mutual of Omaha permite hasta 8 niños en un formulario — cada uno recibe su propia póliza. Transamerica permite hasta 9 en un rider, con el mismo monto para todos.",

      bigH: "Montos más altos que $50,000",
      bigP:
        "La vida entera simplificada infantil suele topar cerca de $50,000 (Assurity puede ir más alto en algunos casos infantiles). Mutual of Omaha tiene otra vía con revisión de salud más completa, unos 15 días–17 años, a menudo hasta unos $250,000. Esa vía suele limitar la cobertura del niño a la mitad de lo que ya tiene el padre con menos seguro, y no está disponible en Washington. No es el gráfico de esta página. Llámenos si necesita un monto grande.",

      fitH: "¿Le sirve este camino?",
      fitYesH: "Puede encajar si",
      fitYes1: "Quiere dejar cubierto un funeral infantil y un monto pequeño permanente mientras las primas son bajas.",
      fitYes2: "Quiere que el hijo, de adulto, pueda comprar más cobertura sin un nuevo cuestionario de salud (asegurabilidad garantizada, cuando el producto la ofrece).",
      fitYes3: "Un abuelo quiere regalar una póliza pequeña y entiende quién será el dueño.",
      fitNoH: "Suele no encajar si",
      fitNo1: "El adulto que sostiene el hogar no tiene seguro. Cubra primero ese ingreso.",
      fitNo2: "La meta es ahorrar para la universidad. Compare un plan 529. El seguro de vida no es esa cuenta.",
      fitNo3: "No puede pagar la cuota durante años. Una póliza que caduca no ayuda.",

      buyH: "Cómo lo cotizamos",
      buyLead:
        "No hay un cotizador público solo para niños, como el de temporal para adultos. Empiece por una llamada o el formulario. Llevamos edad del niño, monto y si quiere póliza propia o rider.",
      buy1T: "Edad del niño y de quien pagará",
      buy1: "Fijan el producto. Mutual of Omaha Children’s Whole Life empieza a los 14 días; Assurity a los 15 días; Americo AdvantageWL desde el nacimiento.",
      buy2T: "Monto y camino",
      buy2: "Póliza propia o extra en la del adulto. No mezcle los dos en la cabeza: duran distinto y pagan distinto.",
      buy3T: "Preguntas de salud",
      buy3: "Siguen siendo simplificadas. Transamerica Immediate Solution suele no emitirse si hay “sí” en dos o más categorías médicas, o con ciertos antecedentes de cáncer infantil.",

      faqTitle: "Preguntas",
      faq1q: "¿Cuánto cuesta al mes?",
      faq1a:
        "En nuestras muestras de vida entera simplificada, unos $8–$19 al mes por $10,000 y unos $17–$81 al mes por $50,000, según edad y sexo. Un rider suele ser más barato. No es una oferta.",
      faq2q: "¿Vida entera o temporal para un niño?",
      faq2a:
        "La póliza propia que cotizamos es casi siempre vida entera. El temporal aparece como rider en la póliza de un adulto y se acaba a una edad. Si quiere que el hijo se quede con una póliza de por vida, use la vía permanente.",
      faq3q: "¿Puede un abuelo comprar?",
      faq3a:
        'A menudo sí, si la compañía lo permite y hay interés asegurable. Mutual of Omaha y Transamerica lo contemplan en estos productos. Las firmas no son iguales en todas las compañías. Vea la guía de <a href="seguro-vida-nietos.html">seguro de vida para nietos</a>.',
      faq4q: "¿Hay examen médico?",
      faq4a:
        "En la vida entera infantil simplificada que colocamos, casi nunca en un consultorio. Sí hay preguntas. Montos grandes pueden pedir más revisión.",
      faq5q: "¿El niño se queda con la póliza de adulto?",
      faq5a:
        "En Assurity Protect+/Perform+, la propiedad suele pasar al hijo a los 25, sin papeleo extra. En otras compañías el dueño puede cederla más tarde. Léalo en el contrato.",
      faq6q: "¿Sirve como ahorro para la universidad?",
      faq6a:
        "No de esa forma. El IRS trata el 529 como plan de estudios. El valor en efectivo de una vida entera es lento, con reglas de préstamo. Use el seguro para el fallecimiento o la asegurabilidad futura; use un 529 para la colegiatura.",
      faq7q: "¿Hay período de espera?",
      faq7a:
        "En Immediate Solution de Transamerica, el beneficio completo está pensado desde el día 1 si se emite así. La aceptación garantizada de adultos (espera típica de dos años) no es el producto infantil habitual aquí.",
      faq8q: "¿Estas tablas garantizan mi precio?",
      faq8a:
        "No. Son muestras educativas. Mejor Vida Seguros cotiza con la edad, salud y estado actuales.",

      nextH: "Siguiente paso",
      nextP: `Llame a Mejor Vida Seguros al <a href="tel:${TEL}">${PHONE}</a> o use el <a href="contact.html">formulario de contacto</a>. Para solo ver tablas de precio: <a href="costo-seguro-vida-infantil.html">costo infantil</a>.`,
      discTitle: "Divulgación",
      discBody:
        "Esta página es educativa, no una oferta. Edades, montos y precios cambian por compañía, producto y estado. Mejor Vida Insurance LLC es una agencia independiente. El Número Nacional de Productor (NPN) es 21695431. Los estados con licencia actual están en la página de <a href=\"licencias.html\">licencias</a>.",
      quoteTitle: "Cotizar para un niño",
      quote1: "Póliza propia o rider",
      quote2: "Compañías con las que trabajamos",
      quoteCta: "Hablar con nosotros",
      srcTitle: "Fuentes",
      src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: Life insurance</a> — Asociación Nacional de Comisionados de Seguros. El seguro de vida cubre una pérdida económica si alguien fallece; la guía pide sumar deudas e ingresos, no un número de anuncio.',
      src2: '<a href="https://www.irs.gov/newsroom/529-plans-questions-and-answers" rel="noopener" target="_blank">IRS: 529 plans</a> — el 529 es un plan de ahorro para estudios, distinto del seguro de vida.',
      src3: "Fichas de producto de compañías con las que trabajamos: Mutual of Omaha Children’s Whole Life; Assurity Protect+ / Perform+; Transamerica Immediate Solution y rider hijo/nieto; American Amicable Family Solution / Family Choice y riders; Aetna Accendo Level / Protection Series; Corebridge Select-a-Term y American Elite; Americo AdvantageWL y Eagle Select.",
      src4: "Primas de muestra: compañías designadas, vida entera simplificada infantil, agosto 2026. Educativas — no vinculantes.",
    };
  }
  return {
    title:
      "Children’s life insurance: a policy on the child, or an add-on on an adult plan (2026) | Mejor Vida Insurance",
    desc: "Children’s life insurance is usually simplified whole life, or a temporary rider on an adult policy. Ages, amounts, who can buy, and sample premiums from companies we work with.",
    h1: "Children’s life insurance: a small policy on the child, or an extra on an adult’s plan",
    lead: "Children’s life insurance covers a minor. If the child dies while the policy is in force, the person you named — the <strong>beneficiary</strong> — receives a check. It does not replace a parent’s paycheck. It can help with a funeral, leave a small savings piece inside some policies, or reserve the right to buy more coverage when the child is grown. There are two paths: a policy in the child’s name, or a <strong>rider</strong> (a temporary add-on) on an adult’s policy.",
    crumbEnd: "Children’s life insurance",

    take1:
      "At companies we work with, the usual kids policy is <strong>simplified-issue whole life</strong>: it lasts for life if you pay, the price does not go up, and the company asks health questions — not an in-office exam.",
    take2:
      "The other path is a <strong>child rider</strong> on an adult policy: smaller amounts, it usually ends around ages 18–25, and it costs less because it is not permanent.",
    take3:
      "It is not a college savings account. A 529 plan (the U.S. education-savings plan) is a different tool. Life insurance pays if someone dies; a 529 is built for school. You can have both. One does not replace the other.",
    callout:
      "Before you insure a child, cover the adult who pays the bills. The buyer’s guide from the National Association of Insurance Commissioners (NAIC) asks what money would be missing if that person died. For a child, that loss is usually a funeral and immediate costs — not a salary.",

    whatH: "What it is, in plain words",
    whatP1:
      "You buy a policy. The <strong>insured</strong> is the child. The <strong>owner</strong> is usually a parent, guardian, or grandparent. The owner pays the premium and names the beneficiary. If the child dies with the policy in force, that person receives cash. It does not have to go to one funeral home.",
    whatP2:
      "Most children’s policies we place are <strong>whole life</strong>: coverage has no end date while premiums are paid. Many build <strong>cash value</strong> — a savings piece inside the contract that the owner may borrow against, under the policy rules. That is not a bank account. An unpaid loan comes out of the death benefit.",
    whatP3:
      "There is also the rider path. The adult already has (or buys) a policy. The rider adds a small amount for each named child. When the child reaches a set age, that extra ends, unless the contract lets the family convert it to a permanent policy.",

    howH: "How it pays",
    how1T: "A death occurs and the policy is in force.",
    how1: "The company reviews the claim. On simplified children’s whole life, the full benefit is usually in force from day one when the policy was issued that way — not the two-year wait common on adult guaranteed-acceptance plans.",
    how2T: "The check goes to the person you named.",
    how2: "That person decides. They can pay a funeral, small debts, or keep the money. They do not have to hand it to a funeral home.",
    how3T: "If there is cash value, that is a different check.",
    how3: "Cash value belongs to the owner during life. The death benefit is what the beneficiary receives. A loan against cash value reduces what is left.",
    how4T: "If you stop paying, coverage ends.",
    how4: "A lapsed policy pays nothing. Pick an amount whose premium you can keep paying for years.",

    pathH: "Two paths — they are not the same",
    pathLead:
      "Families mix these up. One is a policy on the child. The other is an extra on an adult’s policy. Companies we work with offer both, depending on the product.",
    pathCol1: "Policy on the child",
    pathCol1Sub: "Simplified whole life",
    pathCol2: "Rider on an adult policy",
    pathCol2Sub: "Temporary extra",
    pathR1H: "Who is covered",
    pathR1a: "The child is the insured on their own policy",
    pathR1b: "The children named on the adult’s add-on",
    pathR2H: "How long it usually lasts",
    pathR2a: "For life, if premiums stay current",
    pathR2b: "Until a set age — often 18 to 25",
    pathR3H: "Typical amounts we place",
    pathR3a: "About $5,000–$50,000 on kids whole life (Americo AdvantageWL starts near $15,000)",
    pathR3b: "Usually smaller: often $1,000–$10,000 per child; Corebridge Select-a-Term up to about $25,000",
    pathR4H: "Medical exam?",
    pathR4a: "Almost never in an office. Health questions, yes",
    pathR4b: "Depends on the adult policy. The add-on follows that contract",
    pathR5H: "Does cash value build?",
    pathR5a: "Yes, on the children’s whole life we quote",
    pathR5b: "Almost never. It is term coverage, not a savings piece",

    notH: "What it is not",
    not1H: "It does not replace coverage on the parent",
    not1: "If the adult who pays the mortgage and groceries has no policy, a child’s policy does not fill that hole. The NAIC asks you to add up debts and income of the person who supports the household. Start there.",
    not2H: "It is not a 529 plan",
    not2: 'The <a href="https://www.irs.gov/newsroom/529-plans-questions-and-answers" rel="noopener" target="_blank">Internal Revenue Service (IRS)</a> describes a 529 as a plan to save for education, with its own tax rules. Life insurance is not that account. If the goal is college, compare a 529. If the goal is a death benefit — or leaving the child a permanent policy — insurance answers a different question.',
    not3H: "It is not a guaranteed college fund",
    not3: "Cash value grows slowly and follows the contract. Borrowing against it charges interest. Do not promise tuition with a $10,000 policy.",

    kindsH: "Which products we use for children",
    kindsLead:
      "These names are from companies we work with. Ages and amounts come from our product materials, not a generic ad. Each line is a different product.",
    kind1H: "Whole life in the child’s name",
    kindPerm: [
      [
        "Mutual of Omaha Children’s Whole Life",
        [
          "Ages 14 days–17",
          "About $5,000–$50,000 · no exam",
          "Can buy more later without new health questions",
          "Short premium pause if the owner dies (usually after 24 months)",
        ],
      ],
      [
        "Transamerica Immediate Solution",
        [
          "The child can be the insured",
          "Typical kids amounts $1,000–$50,000",
          "Full benefit from day one when issued as Immediate",
        ],
      ],
      [
        "Assurity Protect+ / Perform+",
        [
          "From 15 days · the same product family also covers adults",
          "Many kids cases up to about $300,000 with no exam",
          "Ownership typically moves to the child at 25",
        ],
      ],
      [
        "Americo AdvantageWL",
        ["Ages 0–17", "About $15,000 minimum"],
      ],
      [
        "American Amicable Family Solution / Family Choice",
        [
          "Ages 0–49",
          "From about $10,000",
          "Typical immediate-benefit max about $35,000",
        ],
      ],
    ],
    kind2H: "A rider on an adult’s policy",
    kindTemp: [
      [
        "Aetna Accendo Level",
        [
          "Temporary extra in about $2,500 steps",
          "Up to about $10,000 per child",
        ],
      ],
      [
        "Mutual of Omaha",
        ["Child rider", "Often capped near $10,000 per child"],
      ],
      [
        "Transamerica Immediate Solution",
        [
          "Child/grandchild extra · owner 18–75",
          "Child 15 days–18 · up to 9 minors",
          "Typical cap $5,000 per child · conversion may be available after 2 years",
        ],
      ],
      [
        "Corebridge Select-a-Term",
        ["About $1,000–$25,000", "Often through age 25"],
      ],
      [
        "Americo Eagle Select",
        ["Child/grandchild rider", "15 days through under 17"],
      ],
      [
        "Assurity",
        [
          "Children’s term rider ages 15 days–17",
          "About $5,000–$25,000",
          "Usually ends near 25",
        ],
      ],
    ],

    costH: "What a children’s policy costs",
    costP:
      "These figures are illustrative monthly premiums for simplified-issue whole life from companies we work with. Not an offer. A rider on an adult policy usually costs less because the amount is smaller and it is not permanent — ask for an illustration. Full age-band tables: <a href=\"children-life-insurance-cost.html\">children’s life insurance cost</a>.",
    costNote:
      "Educational samples, rounded, August 2026. Actual price depends on age, health, amount, product, and state.",

    whoH: "Who can buy coverage on a child",
    whoP:
      "You need an <strong>insurable interest</strong>: a legally recognized reason that the child’s death would cause you a financial loss. A parent or guardian usually qualifies. A grandparent often does, depending on the company. Mutual of Omaha can, on this product, let a grandparent sign in some cases without a parent’s signature. Transamerica lets a parent or grandparent own the policy even when the child is the insured. State and product rules control. We do not quote “any relative” without that relationship.",
    who1T: "Parent or guardian",
    who1: "The usual path. The adult owns and pays. The child is the insured.",
    who2T: "Grandparent",
    who2: "Common at Mutual of Omaha, Transamerica, and on grandchild riders (American Amicable, Aetna). Confirm signatures and who is listed as owner.",
    who3T: "More than one child on an application",
    who3: "Mutual of Omaha allows up to 8 children on one form — each still gets their own policy. Transamerica allows up to 9 on one rider, with the same amount for every child.",

    bigH: "Amounts larger than $50,000",
    bigP:
      "Simplified children’s whole life often tops out near $50,000 (Assurity can go higher on some kids cases). Mutual of Omaha has a separate path with a fuller health review, about 15 days–17, often up to about $250,000. That path usually limits the child’s coverage to about half of what the parent with less life insurance already has, and it is not available in Washington. That is not the chart on this page. Call us if you need a large amount.",

    fitH: "Does this path fit?",
    fitYesH: "It can fit if",
    fitYes1: "You want a child’s funeral and a small permanent amount locked in while premiums are low.",
    fitYes2: "You want the child, as an adult, to buy more coverage without a new health questionnaire (guaranteed insurability, when the product offers it).",
    fitYes3: "A grandparent wants to gift a small policy and understands who will own it.",
    fitNoH: "It usually does not fit if",
    fitNo1: "The adult who supports the household has no coverage. Insure that income first.",
    fitNo2: "The goal is college savings. Compare a 529 plan. Life insurance is not that account.",
    fitNo3: "You cannot keep paying the premium for years. A lapsed policy does not help.",

    buyH: "How we quote this",
    buyLead:
      "There is no public kids-only quote tool like the adult term quoter. Start with a call or the contact form. We take the child’s age, the amount, and whether you want a policy in the child’s name or a rider.",
    buy1T: "Age of the child and of the person paying",
    buy1: "That sets the product. Mutual of Omaha Children’s Whole Life starts at 14 days; Assurity at 15 days; Americo AdvantageWL from birth.",
    buy2T: "Amount and path",
    buy2: "Own policy or extra on an adult plan. Do not mix them in your head: they last differently and pay differently.",
    buy3T: "Health questions",
    buy3: "They are still simplified. Transamerica Immediate Solution is usually not issued if two or more medical categories are “yes,” or with certain childhood-cancer histories.",

    faqTitle: "Questions",
    faq1q: "How much does it cost per month?",
    faq1a:
      "On our simplified whole-life samples, about $8–$19 a month for $10,000 and about $17–$81 a month for $50,000, depending on age and sex. A rider is usually cheaper. Not an offer.",
    faq2q: "Whole life or term for a child?",
    faq2a:
      "The own-policy path we quote is almost always whole life. Term shows up as a rider on an adult policy and ends at a set age. If you want the child to keep a lifetime policy, use the permanent path.",
    faq3q: "Can a grandparent buy?",
    faq3a:
      'Often yes, if the company allows it and there is an insurable interest. Mutual of Omaha and Transamerica provide for this on these products. Signature rules are not the same at every company. See the <a href="grandchildren-life-insurance.html">life insurance for grandchildren</a> guide.',
    faq4q: "Is there a medical exam?",
    faq4a:
      "On the simplified children’s whole life we place, almost never in an office. There are still questions. Larger amounts may need more review.",
    faq5q: "Does the child keep the policy as an adult?",
    faq5a:
      "On Assurity Protect+/Perform+, ownership typically moves to the child at 25 with no extra paperwork. At other companies the owner can transfer it later. Read the contract.",
    faq6q: "Can this fund college?",
    faq6a:
      "Not in that way. The IRS treats a 529 as an education plan. Whole-life cash value is slow and uses loan rules. Use insurance for a death benefit or future insurability; use a 529 for tuition.",
    faq7q: "Is there a waiting period?",
    faq7a:
      "On Transamerica Immediate Solution, the full benefit is designed from day one when issued that way. Adult guaranteed-acceptance (typical two-year wait) is not the usual kids product here.",
    faq8q: "Do these tables guarantee my price?",
    faq8a:
      "No. They are educational samples. Mejor Vida Insurance quotes with current age, health, and state.",

    nextH: "Next step",
    nextP: `Call Mejor Vida Insurance at <a href="tel:${TEL}">${PHONE}</a> or use the <a href="contact.html">contact form</a>. For price tables only: <a href="children-life-insurance-cost.html">children’s life insurance cost</a>.`,
    discTitle: "Disclosure",
    discBody:
      "This page is educational, not an offer. Ages, amounts, and prices change by company, product, and state. Mejor Vida Insurance LLC is an independent agency. The National Producer Number (NPN) is 21695431. Current licensed states are on the <a href=\"licenses.html\">licenses</a> page.",
    quoteTitle: "Quote a child policy",
    quote1: "Own policy or rider",
    quote2: "Companies we work with",
    quoteCta: "Talk with us",
    srcTitle: "Sources",
    src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: Life insurance</a> — National Association of Insurance Commissioners. Life insurance covers a financial loss if someone dies; the buyer’s guide asks you to add debts and income, not an ad number.',
    src2: '<a href="https://www.irs.gov/newsroom/529-plans-questions-and-answers" rel="noopener" target="_blank">IRS: 529 plans</a> — a 529 is an education-savings plan, different from life insurance.',
    src3: "Product materials from companies we work with: Mutual of Omaha Children’s Whole Life; Assurity Protect+ / Perform+; Transamerica Immediate Solution and child/grandchild rider; American Amicable Family Solution / Family Choice and riders; Aetna Accendo Level / Protection Series; Corebridge Select-a-Term and American Elite; Americo AdvantageWL and Eagle Select.",
    src4: "Sample premiums: appointed companies, simplified-issue children’s whole life, August 2026. Educational — not binding.",
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

function childrenMain(lang, page, c) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const mid = isEs ? "tipos-seguro-vida.html" : "life-insurance-products.html";
  const cost = isEs ? "costo-seguro-vida-infantil.html" : "children-life-insurance-cost.html";
  const contact = "contact.html";
  const moo = isEs ? "carriers/mutual-of-omaha-infantil.html" : "carriers/mutual-of-omaha-children.html";
  const assurity = isEs ? "carriers/assurity-infantil.html" : "carriers/assurity-children.html";
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
<a href="#what">${isEs ? "Qué es" : "What it is"}</a>
<a href="#paths">${isEs ? "Dos caminos" : "Two paths"}</a>
<a href="#cost">${isEs ? "Costo" : "Cost"}</a>
<a href="#who">${isEs ? "Quién compra" : "Who can buy"}</a>
<a href="#fit">${isEs ? "¿Le sirve?" : "Does it fit?"}</a>
<a href="#faq">${isEs ? "Preguntas" : "Questions"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Lo que debe recordar" : "What to remember"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<div class="lic-helpful"><p>${c.callout}</p></div>
<section class="lic-section" id="what">
<h2>${c.whatH}</h2>
<p>${c.whatP1}</p>
<p>${c.whatP2}</p>
<p>${c.whatP3}</p>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<ol class="lic-lesson-steps">
<li><strong>${c.how1T}</strong> ${c.how1}</li>
<li><strong>${c.how2T}</strong> ${c.how2}</li>
<li><strong>${c.how3T}</strong> ${c.how3}</li>
<li><strong>${c.how4T}</strong> ${c.how4}</li>
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
<section class="lic-section" id="not">
<h2>${c.notH}</h2>
<div class="lic-fact-trio">
<div>
<h3>${c.not1H}</h3>
<p>${c.not1}</p>
</div>
<div>
<h3>${c.not2H}</h3>
<p>${c.not2}</p>
</div>
<div>
<h3>${c.not3H}</h3>
<p>${c.not3}</p>
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
<p class="lic-carrier-links"><a href="${moo}">Mutual of Omaha</a> · <a href="${ta}">Transamerica</a> · <a href="${assurity}">Assurity</a>.</p>
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
<section class="lic-section" id="who">
<h2>${c.whoH}</h2>
<p>${c.whoP}</p>
<div class="lic-fact-trio">
<div>
<h3>${c.who1T}</h3>
<p>${c.who1}</p>
</div>
<div>
<h3>${c.who2T}</h3>
<p>${c.who2}</p>
</div>
<div>
<h3>${c.who3T}</h3>
<p>${c.who3}</p>
</div>
</div>
</section>
<section class="lic-section" id="large">
<h2>${c.bigH}</h2>
<p>${c.bigP}</p>
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
</ul>
</section>
<p class="lic-rate-note"><a href="${cost}">${isEs ? "Tablas de costo infantil" : "Children’s cost tables"}</a> · <a href="${mid}">${isEs ? "Tipos de seguro" : "Life insurance types"}</a></p>
</div>
${quoteRailHtml({ lang, title: c.quoteTitle, line1: c.quote1, line2: c.quote2, quoteHref: contact, cta: c.quoteCta })}
</div>
</main>`;
}

module.exports = { copyChildren, childrenMain };
