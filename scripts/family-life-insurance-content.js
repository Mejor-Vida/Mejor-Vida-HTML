"use strict";

const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");

const FAMILY_LINKS = {
  es: {
    hub: "seguro-vida-familia.html",
    parents: "seguro-vida-padres.html",
    grandparents: "seguro-vida-abuelos.html",
    siblings: "seguro-vida-hermanos.html",
    members: "seguro-vida-familiares.html",
    find: "buscar-poliza-vida.html",
    kids: "seguro-vida-infantil.html",
    grandkids: "seguro-vida-nietos.html",
    fe: "guia-seguro-entierro-mayores.html",
    gi: "aceptacion-garantizada.html",
    term: "seguro-vida-temporal.html",
    seniors: "guia-seguro-vida-mayores.html",
    licenses: "licencias.html",
    quote: "quote.html",
    contact: "contact.html",
    types: "tipos-seguro-vida.html",
  },
  en: {
    hub: "family-life-insurance.html",
    parents: "parents-life-insurance.html",
    grandparents: "grandparents-life-insurance.html",
    siblings: "siblings-life-insurance.html",
    members: "family-members-life-insurance.html",
    find: "find-life-insurance-policy.html",
    kids: "children-life-insurance.html",
    grandkids: "grandchildren-life-insurance.html",
    fe: "burial-insurance-seniors.html",
    gi: "guaranteed-acceptance.html",
    term: "term-life-insurance.html",
    seniors: "life-insurance-seniors.html",
    licenses: "licenses.html",
    quote: "quote.html",
    contact: "contact.html",
    types: "life-insurance-products.html",
  },
};

function rolePeopleChips(str) {
  return String(str)
    .split(/[,;]\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const label = s.charAt(0).toUpperCase() + s.slice(1);
      return `<li>${label}</li>`;
    })
    .join("");
}

function roleLadderHtml(c) {
  const cards = [
    { tag: c.r1Tag, title: c.r1a, does: c.r1Do, people: c.r1b },
    { tag: c.r2Tag, title: c.r2a, does: c.r2Do, people: c.r2b },
    { tag: c.r3Tag, title: c.r3a, does: c.r3Do, people: c.r3b },
  ];
  return `<ol class="lic-role-ladder">
${cards
  .map(
    (card, i) => `<li class="lic-role-card">
<p class="lic-role-card__step"><span>${i + 1}</span> ${card.tag}</p>
<h3>${card.title}</h3>
<p class="lic-role-card__can">${card.does}</p>
<p class="lic-role-card__who">${c.col2}</p>
<ul class="lic-role-card__people">${rolePeopleChips(card.people)}</ul>
</li>`
  )
  .join("\n")}
</ol>`;
}

function faqsHtml(c) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .filter((n) => c["faq" + n + "q"])
    .map(
      (n, i) =>
        `<details${i === 0 ? " open" : ""}><summary>${c["faq" + n + "q"]}</summary><p>${c["faq" + n + "a"]}</p></details>`
    )
    .join("\n");
}

function feRateBlock(c, quoteHref) {
  const female = c.female;
  const male = c.male;
  const ageCol = c.ageCol;
  return `<div class="lic-product-tabs" data-lic-product="fe" data-lic-quote-href="${quoteHref}">
<div class="lic-face-tabs" role="tablist" aria-label="${c.faceLabel}">
<button type="button" class="lic-face-tab is-active" data-lic-face="10000" role="tab" aria-selected="true">$10,000</button>
<button type="button" class="lic-face-tab" data-lic-face="15000" role="tab" aria-selected="false">$15,000</button>
<button type="button" class="lic-face-tab" data-lic-face="25000" role="tab" aria-selected="false">$25,000</button>
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">${ageCol}</th><th scope="col">${female}</th><th scope="col">${male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</div>`;
}

function relatedNav(lang) {
  const L = FAMILY_LINKS[lang];
  const isEs = lang === "es";
  return `<p class="lic-rate-note">${isEs ? "Más en esta sección" : "More in this section"}:
<a href="${L.hub}">${isEs ? "Para la familia" : "For family"}</a> ·
<a href="${L.parents}">${isEs ? "Padres" : "Parents"}</a> ·
<a href="${L.grandparents}">${isEs ? "Abuelos" : "Grandparents"}</a> ·
<a href="${L.siblings}">${isEs ? "Hermanos" : "Siblings"}</a> ·
<a href="${L.members}">${isEs ? "Otros familiares" : "Other relatives"}</a> ·
<a href="${L.find}">${isEs ? "Buscar una póliza" : "Find a policy"}</a></p>`;
}

function nextStepBandHtml(lang, c, opts) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const primaryHref = c.nextPrimaryHref || opts.quoteHref || L.quote;
  const primaryLabel = c.nextPrimary || c.quoteCta;
  const extra =
    /^https?:/i.test(primaryHref) ? ' rel="noopener" target="_blank"' : "";
  const more = c.nextMore
    ? `<p class="lic-next-band__more">${c.nextMore}</p>`
    : "";
  return `<section class="lic-section lic-next-band" id="next">
<div class="lic-next-band__inner">
<div class="lic-next-band__copy">
<h2>${c.nextH}</h2>
<p>${c.nextLead}</p>
${more}
</div>
<div class="lic-next-band__actions">
<a class="lic-next-band__btn lic-next-band__btn--gold" href="${primaryHref}"${extra}>${primaryLabel}</a>
<a class="lic-next-band__btn lic-next-band__btn--ghost" href="tel:${TEL}">${
    isEs ? "Llamar" : "Call"
  } ${PHONE}</a>
</div>
</div>
</section>`;
}

function familyShell(lang, page, c, opts) {
  const isEs = lang === "es";
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const L = FAMILY_LINKS[lang];
  const quoteHref = opts.quoteHref || L.quote;
  const toc = (opts.toc || [])
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join("\n");
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
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › ${
    opts.isHub
      ? `<a href="${L.types}">${isEs ? "Tipos de seguro" : "Life insurance types"}</a>`
      : `<a href="${L.hub}">${isEs ? "Para la familia" : "For family"}</a>`
  } › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
${toc}
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
${opts.inner}
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
${nextStepBandHtml(lang, c, opts)}
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<section class="lic-section" id="sources">
<h2>${c.srcTitle}</h2>
<ul>
${[c.src1, c.src2, c.src3, c.src4, c.src5, c.src6].filter(Boolean).map((s) => `<li>${s}</li>`).join("\n")}
</ul>
</section>
${relatedNav(lang)}
</div>
${quoteRailHtml({
    lang,
    title: c.quoteTitle,
    line1: c.quote1,
    line2: c.quote2,
    quoteHref,
    cta: c.quoteCta,
  })}
</div>
</main>`;
}

function sharedDisc(isEs) {
  const L = FAMILY_LINKS[isEs ? "es" : "en"];
  if (isEs) {
    return `Esta página es educativa, no una oferta. Edades, montos y primas cambian por compañía, producto, tabaco y estado. Mejor Vida Seguros LLC es una agencia independiente (NPN 21695431). Los estados con licencia actual están en <a href="${L.licenses}">licencias</a>.`;
  }
  return `This page is educational, not an offer. Ages, amounts, and premiums change by company, product, tobacco, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licensed states are on the <a href="${L.licenses}">licenses</a> page.`;
}

function sharedSources(isEs) {
  if (isEs) {
    return {
      srcTitle: "Fuentes",
      src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: seguro de vida para el consumidor</a> — solo puede comprar quien tenga interés asegurable; el localizador de pólizas ayuda a encontrar cobertura de una persona fallecida.',
      src2: '<a href="https://eapps.naic.org/life-policy-locator/#/welcome" rel="noopener" target="_blank">Localizador de pólizas de vida de la NAIC</a> — herramienta gratuita para beneficiarios, albaceas o representantes legales.',
      src3: '<a href="https://www.consumerfinance.gov/ask-cfpb/what-is-a-power-of-attorney-poa-en-1149/" rel="noopener" target="_blank">CFPB: qué es un poder notarial</a> — un POA autoriza actos legales; las aseguradoras de vida pueden exigir la firma de la persona asegurada.',
      src4: '<a href="https://www.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA — estadísticas</a> — estudio de listas de precios 2023: mediana nacional de $8,300 (velatorio y entierro) y $6,280 (velatorio y cremación); parcela y lápida van aparte.',
      src5: '<a href="https://unclaimed.org/" rel="noopener" target="_blank">NAUPA / unclaimed.org</a> — búsqueda de bienes no reclamados, incluidos beneficios de seguro que el estado custodia.',
      src6: "Material de compañías designadas: Mutual of Omaha (interés asegurable y POA en suscripción simplificada); Mutual of Omaha Living Promise; Aetna Accendo Level; Transamerica Immediate Solution; Corebridge GIWL; Americo Eagle Select. Primas de muestra: js/final-expense-cost-rates.json, agosto 2026.",
    };
  }
  return {
    srcTitle: "Sources",
    src1: '<a href="https://content.naic.org/consumer/life-insurance.htm" rel="noopener" target="_blank">NAIC: consumer life insurance</a> — only someone with an insurable interest may buy a policy on your life; the Policy Locator helps find coverage on a deceased person.',
    src2: '<a href="https://eapps.naic.org/life-policy-locator/#/welcome" rel="noopener" target="_blank">NAIC Life Insurance Policy Locator</a> — free tool for beneficiaries, executors, or legal representatives.',
    src3: '<a href="https://www.consumerfinance.gov/ask-cfpb/what-is-a-power-of-attorney-poa-en-1149/" rel="noopener" target="_blank">CFPB: what is a power of attorney</a> — a POA authorizes legal acts; life insurers can still require the insured person to sign.',
    src4: '<a href="https://www.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA — statistics</a> — 2023 General Price List study: U.S. median $8,300 (viewing and burial) and $6,280 (viewing and cremation); plot and monument are extra.',
    src5: '<a href="https://unclaimed.org/" rel="noopener" target="_blank">NAUPA / unclaimed.org</a> — search unclaimed property, including insurance benefits the state is holding.',
    src6: "Appointed-company materials: Mutual of Omaha (insurable-interest and POA rules on simplified underwriting); Mutual of Omaha Living Promise; Aetna Accendo Level; Transamerica Immediate Solution; Corebridge GIWL; Americo Eagle Select. Sample premiums: js/final-expense-cost-rates.json, August 2026.",
  };
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                         */
/* -------------------------------------------------------------------------- */

function copyFamilyHub(lang) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const src = sharedSources(isEs);
  if (isEs) {
    return {
      title: "Seguro de vida para la familia: comprar cobertura para un pariente (2026) | Mejor Vida Seguros",
      desc: "Quién puede ser dueño, quién debe firmar, y qué producto encaja si quiere cubrir a un padre, abuelo, hermano u otro familiar. Primas de muestra de compañías designadas.",
      h1: "Seguro de vida para un familiar: usted puede pagar; la otra persona casi siempre debe firmar",
      lead: "No se puede sacar una póliza “en secreto” sobre un adulto. La NAIC explica que hace falta un <strong>interés asegurable</strong>: una pérdida económica reconocida si esa persona fallece. En la práctica, para un funeral o deudas pequeñas, un hijo, un nieto o un hermano suele calificar. La persona cuya vida se cubre tiene que consentir, responder las preguntas de salud si las hay, y firmar.",
      crumbEnd: "Para la familia",
      female: "Mujer",
      male: "Hombre",
      ageCol: "Edad",
      faceLabel: "Montos de gastos finales",
      take1: "Hay cuatro papeles: <strong>asegurado</strong> (cuya vida cubre la póliza), <strong>dueño</strong> (controla el contrato y el valor en efectivo), <strong>pagador</strong> (quien abona la cuota) y <strong>beneficiario</strong> (quien recibe el cheque). Usted puede ser dueño y pagador; el familiar es el asegurado.",
      take2: "Un <strong>poder notarial no sustituye</strong> la firma del asegurado en las compañías designadas que cotizamos. Mutual of Omaha, en suscripción simplificada, no acepta una solicitud firmada solo por quien tiene el POA.",
      take3: "Para un funeral, el producto habitual es <strong>gastos finales</strong> (vida entera de monto más bajo). Un temporal sirve si hay hipoteca o ingresos que proteger por un plazo. No existe una sola póliza de entierro que cubra a varios adultos a la vez.",
      callout: "Las primas de esta página salen del cotizador de Mejor Vida Seguros (compañías designadas). Use la edad, el sexo y el tabaco de la persona asegurada — no los suyos. No es una oferta. Los estados con licencia están en la página de licencias.",
      whoH: "A quién puede cubrir, en esta guía",
      whoP: "Cada relación tiene matices de firma y de dueño. Empiece por la página que coincide con su familiar.",
      who1H: "Padres",
      who1: "Hijo o hija adulto como dueño y pagador. El padre o la madre firma y responde salud.",
      who2H: "Abuelos",
      who2: "Un nieto suele cubrir gastos finales. El abuelo participa en la solicitud.",
      who3H: "Hermanos",
      who3: "Se puede pagar el entierro de un hermano. Algunas compañías limitan quién puede ser dueño.",
      who4H: "Otros familiares",
      who4: "Tíos, primos o un cónyuge. Las listas de dueño y de beneficiario no son iguales.",
      who5H: "Niños y nietos",
      who5: "Ahí el menor es el asegurado. Las firmas cambian: vea las guías infantiles.",
      who6H: "¿Había una póliza?",
      who6: "Si alguien ya falleció, no compre otra. Busque la que ya existía.",
      interestH: "Qué significa “interés asegurable”, en una frase",
      interestP1: "La NAIC lo dice así: un desconocido no puede asegurar su vida. Quienes suelen tener interés son familiares cercanos; a veces un socio o un acreedor importante. No basta con “querer ayudar”. Tiene que haber una pérdida económica si esa persona muere — un funeral que usted pagaría, una deuda compartida, o ingresos que esa persona aportaba.",
      interestP2: "En gastos finales de unos $10,000 a $25,000, las compañías designadas rara vez piden una carta larga si el asegurado es un padre, un abuelo o un hermano y el motivo es el funeral. Si pide $100,000 o más, espere que pregunten por qué ese monto.",
      rolesH: "Los cuatro papeles, sin jerga",
      rolesP: "Confundirlos es el error más caro. Pagar la cuota no lo convierte en dueño. Si no es dueño, la compañía puede negarse a hablar con usted.",
      role1T: "Asegurado",
      role1: "La persona cuya muerte dispara el pago. Tiene que estar en EE. UU. al solicitar, tener SSN o TIN, y capacidad mental para firmar un contrato.",
      role2T: "Dueño",
      role2: "Quien cambia beneficiarios, pide el valor en efectivo y recibe las cartas. En Mutual of Omaha (vida simplificada), dueños aceptados incluyen cónyuge, padre, hijo adulto, fideicomiso o socio. Un hermano a veces solo puede ser beneficiario, no dueño.",
      role3T: "Pagador",
      role3: "La cuenta de la que sale la cuota. Puede ser usted aunque el asegurado figure como dueño — y entonces usted paga un contrato que no controla.",
      role4T: "Beneficiario",
      role4: "Quien recibe el efectivo. El funeral no lo cobra la funeraria salvo que usted la nombre. Dígale a esa persona dónde está la póliza.",
      poaH: "El poder notarial no abre esta puerta",
      poaP: "El CFPB explica que un poder notarial deja que otra persona actúe en su nombre. Las aseguradoras de vida no están obligadas a aceptar esa firma en una solicitud nueva. Mutual of Omaha lo escribe: quien tiene el POA no puede atestiguar el historial de salud ni autorizar las bases de datos (MIB, recetas). Una vez emitida la póliza, un POA sí puede ayudar a administrarla. Eso es después, no antes.",
      productH: "Qué producto encaja, según la meta",
      productP: "No compre “el anuncio más barato”. Compre el contrato que dura lo que dura la necesidad.",
      prod1T: "Funeral o deudas pequeñas",
      prod1: "Gastos finales: vida entera simplificada, montos típicos $2,000–$50,000. Living Promise Nivelado emite de 45 a 85, hasta unos $50,000. Accendo Level puede llegar a 89, con tope de $25,000 a los 76–89. Si califica, el beneficio completo puede aplicar desde el día 1.",
      prod2T: "Salud que no pasa el cuestionario",
      prod2: "Aceptación garantizada (por ejemplo Corebridge GIWL, en general 50–80, $5,000–$25,000). Hay espera de unos dos años para muerte no accidental: suelen devolver primas más un interés del contrato. Cuesta más por dólar.",
      prod3T: "Hipoteca o ingresos por un plazo",
      prod3: "Vida temporal. Más barata por dólar, y se acaba. No es el producto de entierro a los 80. Vea <a href=\"" + L.term + "\">seguro de vida temporal</a>.",
      prod4T: "Varios niños a la vez",
      prod4: "No hay un “seguro familiar de entierro” para varios adultos. Sí hay riders de hijo o nieto en la póliza de un adulto, y pólizas infantiles separadas. Vea <a href=\"" + L.kids + "\">seguro infantil</a> y <a href=\"" + L.grandkids + "\">nietos</a>.",
      costH: "Cuánto cuesta cubrir a un familiar",
      costP: "El precio lo marca la edad, el sexo, el tabaco y la salud de la persona asegurada. Las cifras son primas mensuales ilustrativas de gastos finales nivelados, no fumador, compañías designadas. A los 70, un $10,000 suele estar cerca de esas filas. Un plan garantizado sale más caro y trae espera.",
      applyH: "Cómo hacerlo sin atascar la solicitud",
      applyP: "Puede pedir números y hacer preguntas sin que su familiar esté en la llamada. La solicitud formal es otra etapa.",
      apply1T: "Reúna hechos, no rumores",
      apply1: "Edad, estatura, peso, tabaco, medicamentos y hospitalizaciones recientes. Una respuesta “no” cuando debía ser “sí” puede anular un reclamo.",
      apply2T: "Elija el producto y el dueño",
      apply2: "Diga desde el inicio que usted quiere ser dueño si va a pagar. No use un formulario en línea pensado solo para el asegurado: ahí el dueño suele ser esa persona.",
      apply3T: "Firme con ellos",
      apply3: "Voz grabada, enlace electrónico o papel. Ambos participan. Luego el primer cargo activa la cobertura si el plan es nivelado.",
      ifNoH: "Si se niegan a participar",
      ifNoP: "No hay atajo legal. Puede ahorrar, comparar un prepagado en una funeraria (otro contrato, atado a un proveedor) o esperar a que cambien de opinión. Un prepagado no deja el mismo efectivo libre que una póliza.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Se puede comprar un seguro de vida sin que la otra persona se entere?",
      faq1a: "No, si es un adulto. Hace falta su consentimiento y su firma. La excepción habitual es un menor: un padre o, en algunos productos, un abuelo puede ser dueño de una póliza infantil. Eso está en las guías de niños y nietos.",
      faq2q: "¿El poder notarial me deja firmar por mis padres?",
      faq2a: "No para emitir una póliza nueva en las compañías que cotizamos. El CFPB describe qué es un POA; Mutual of Omaha rechaza una solicitud firmada solo por el apoderado porque esa persona no puede responder el historial de salud.",
      faq3q: "¿Hay un seguro de entierro familiar para varios adultos?",
      faq3a: "No. Cada adulto tiene su propia póliza. Un rider cubre hijos o nietos en la póliza de un adulto, con montos más bajos y una edad de corte.",
      faq4q: "¿Qué tipo conviene para un padre de 75 años?",
      faq4a: "Si la meta es el funeral, gastos finales nivelados si todavía puede responder el cuestionario. Si no califica, se mira aceptación garantizada. Un temporal de 10 años a esa edad es otro producto y se acaba.",
      faq5q: "¿Debo ser yo el dueño?",
      faq5a: "Si usted paga, sí conviene. Si el asegurado es dueño, la compañía solo habla con esa persona. El valor en efectivo de una vida entera que el padre posee puede contar como recurso en un trámite de Medicaid; eso no es asesoría legal — un abogado de mayores lo confirma.",
      faq6q: "¿Hasta qué edad se puede emitir?",
      faq6a: "Depende del producto. Muchos gastos finales llegan a 85. Accendo Level puede emitir hasta 89, con tope de $25,000 a los 76–89. GIWL designada suele cortar a los 80. No publicamos emisión nueva de gastos finales a los 90.",
      nextH: "Siguiente paso",
      nextLead: "Pida una cotización con los datos de la persona asegurada, o llame a Mejor Vida Seguros.",
      nextMore: `Si no sabe si ya había una póliza, use la guía para <a href="${L.find}">buscar una póliza</a>.`,
      discTitle: "Divulgación",
      discBody: sharedDisc(true),
      quoteTitle: "Ver precios",
      quote1: "Use la edad del asegurado",
      quote2: "Compañías designadas",
      quoteCta: "Ver precios",
      ...src,
    };
  }
  return {
    title: "Life insurance for family: buying coverage on a relative (2026) | Mejor Vida Insurance",
    desc: "Who may own the policy, who must sign, and which product fits if you want to cover a parent, grandparent, sibling, or other relative. Sample premiums from appointed companies.",
    h1: "Life insurance for a family member: you can pay; the other person almost always has to sign",
    lead: "You cannot take out a policy on an adult “in secret.” The NAIC says there must be an <strong>insurable interest</strong>: a recognized financial loss if that person dies. In practice, a funeral or small debts is enough for a child, a grandchild, or a sibling. The person whose life is covered still has to consent, answer health questions if the plan has them, and sign.",
    crumbEnd: "For family",
    female: "Female",
    male: "Male",
    ageCol: "Age",
    faceLabel: "Final expense amounts",
    take1: "There are four roles: <strong>insured</strong> (whose life the policy covers), <strong>owner</strong> (controls the contract and any cash value), <strong>payer</strong> (pays the premium), and <strong>beneficiary</strong> (receives the check). You can be owner and payer; the relative is the insured.",
    take2: "A <strong>power of attorney does not replace</strong> the insured’s signature at the appointed companies we quote. Mutual of Omaha, on simplified underwriting, will not issue on an application signed only by the person who holds the POA.",
    take3: "For a funeral, the usual product is <strong>final expense</strong> (smaller whole life). Term fits a mortgage or a set number of income years. There is no single burial policy that covers several adults at once.",
    callout: "Premiums on this page come from the Mejor Vida Insurance quoter (appointed companies). Use the insured person’s age, sex, and tobacco — not yours. Not an offer. Licensed states are on the licenses page.",
    whoH: "Who you can cover, in this guide",
    whoP: "Each relationship has its own signature and owner rules. Start with the page that matches your relative.",
    who1H: "Parents",
    who1: "Adult child as owner and payer. The parent signs and answers health questions.",
    who2H: "Grandparents",
    who2: "A grandchild often covers final expenses. The grandparent still takes part in the application.",
    who3H: "Siblings",
    who3: "You can pay for a brother’s or sister’s burial. Some companies limit who may own the contract.",
    who4H: "Other relatives",
    who4: "Aunts, cousins, or a spouse. Owner lists and beneficiary lists are not the same.",
    who5H: "Children and grandchildren",
    who5: "Here the minor is the insured. Signatures change: see the children’s guides.",
    who6H: "Was there already a policy?",
    who6: "If someone has died, do not buy a new one. Look for the one that already existed.",
    interestH: "What “insurable interest” means, in one sentence",
    interestP1: "The NAIC puts it this way: a stranger cannot insure your life. People who usually have an interest are close family; sometimes an employer, a business partner, or a major creditor. “Wanting to help” is not enough. There has to be a financial loss if that person dies — a funeral you would pay, a shared debt, or income they provided.",
    interestP2: "On final expense of about $10,000 to $25,000, appointed companies rarely ask for a long letter when the insured is a parent, a grandparent, or a sibling and the reason is the funeral. If you ask for $100,000 or more, expect them to ask why that amount.",
    rolesH: "The four roles, without jargon",
    rolesP: "Mixing them up is the expensive mistake. Paying the premium does not make you the owner. If you are not the owner, the company can refuse to speak with you.",
    role1T: "Insured",
    role1: "The person whose death triggers the payment. They must be in the U.S. when you apply, have an SSN or TIN, and have the mental capacity to sign a contract.",
    role2T: "Owner",
    role2: "Who changes beneficiaries, taps cash value, and gets the mail. On Mutual of Omaha simplified life, accepted owners include a spouse, a parent, an adult child, a trust, or a business partner. A sibling is sometimes beneficiary-only, not owner.",
    role3T: "Payer",
    role3: "The account the premium leaves. That can be you even if the insured is listed as owner — and then you are paying a contract you do not control.",
    role4T: "Beneficiary",
    role4: "Who receives the cash. The funeral home does not collect it unless you name them. Tell that person where the policy is.",
    poaH: "Power of attorney does not open this door",
    poaP: "The CFPB explains that a power of attorney lets someone act in another person’s name. Life insurers are not required to accept that signature on a new application. Mutual of Omaha writes it down: the person who holds the POA cannot attest to the health history or authorize database checks (MIB, prescriptions). After a policy is in force, a POA can help manage it. That is after issue, not before.",
    productH: "Which product fits, by goal",
    productP: "Do not buy “the cheapest ad.” Buy the contract that lasts as long as the need lasts.",
    prod1T: "Funeral or small debts",
    prod1: "Final expense: simplified whole life, typical amounts $2,000–$50,000. Living Promise Level issues ages 45–85, up to about $50,000. Accendo Level can issue through 89, with a $25,000 cap at ages 76–89. If they qualify, the full benefit can apply from day one.",
    prod2T: "Health that does not pass the questions",
    prod2: "Guaranteed acceptance (for example Corebridge GIWL, generally 50–80, $5,000–$25,000). There is about a two-year wait for non-accidental death: the company usually returns premiums plus contract interest. It costs more per dollar.",
    prod3T: "A mortgage or income for a set term",
    prod3: "Term life. Cheaper per dollar, and it ends. It is not the burial product at age 80. See <a href=\"" + L.term + "\">term life insurance</a>.",
    prod4T: "Several children at once",
    prod4: "There is no “family burial plan” for several adults. There are child or grandchild riders on an adult policy, and separate children’s policies. See <a href=\"" + L.kids + "\">children’s life insurance</a> and <a href=\"" + L.grandkids + "\">grandchildren</a>.",
    costH: "What it costs to cover a relative",
    costP: "Price follows the insured person’s age, sex, tobacco, and health. The figures are illustrative monthly premiums for level final expense, non-tobacco, appointed companies. At 70, a $10,000 policy is usually near those rows. A guaranteed-issue plan costs more and carries a wait.",
    applyH: "How to do this without stalling the application",
    applyP: "You can ask for numbers and questions without your relative on the call. The formal application is a later step.",
    apply1T: "Gather facts, not guesses",
    apply1: "Age, height, weight, tobacco, medications, and recent hospital stays. A “no” that should have been “yes” can void a claim.",
    apply2T: "Choose the product and the owner",
    apply2: "Say up front that you want to be owner if you will pay. Do not use an online form meant only for the insured: the owner there is usually that person.",
    apply3T: "Sign with them",
    apply3: "Recorded voice, an email or text link, or paper. Both people take part. Then the first draft starts coverage if the plan is level.",
    ifNoH: "If they will not take part",
    ifNoP: "There is no legal shortcut. You can save, compare a prepaid funeral (a different contract, tied to one provider), or wait until they change their mind. A prepaid plan does not leave the same unrestricted cash a policy does.",
    faqTitle: "Frequently asked questions",
    faq1q: "Can I buy life insurance without the other person knowing?",
    faq1a: "Not if they are an adult. You need their consent and signature. The usual exception is a minor: a parent or, on some products, a grandparent can own a child’s policy. That is in the children and grandchildren guides.",
    faq2q: "Does a power of attorney let me sign for my parents?",
    faq2a: "Not to issue a new policy at the companies we quote. The CFPB describes what a POA is; Mutual of Omaha will not accept an application signed only by the attorney-in-fact because that person cannot answer the health history.",
    faq3q: "Is there family burial insurance for several adults?",
    faq3a: "No. Each adult needs their own policy. A rider can cover children or grandchildren on one adult policy, with smaller amounts and an age cutoff.",
    faq4q: "What type fits a parent who is 75?",
    faq4a: "If the goal is a funeral, level final expense if they can still answer the health questions. If they do not qualify, look at guaranteed acceptance. A 10-year term at that age is a different product, and it ends.",
    faq5q: "Should I be the owner?",
    faq5a: "If you pay, yes, that is usually wiser. If the insured is the owner, the company will only speak with that person. Cash value on a whole life policy the parent owns can count as a resource in a Medicaid review; that is not legal advice — an elder-law attorney confirms it.",
    faq6q: "Until what age can a new policy be issued?",
    faq6a: "It depends on the product. Many final expense plans issue through 85. Accendo Level can issue through 89, with a $25,000 cap at ages 76–89. Appointed GIWL usually stops at 80. We do not publish new final-expense issue at 90.",
    nextH: "Next step",
    nextLead: "Get a quote with the insured person’s details, or call Mejor Vida Insurance.",
    nextMore: `If you are not sure a policy already existed, use the guide to <a href="${L.find}">find a policy</a>.`,
    discTitle: "Disclosure",
    discBody: sharedDisc(false),
    quoteTitle: "See prices",
    quote1: "Use the insured person’s age",
    quote2: "Appointed companies",
    quoteCta: "See prices",
    ...src,
  };
}

function familyHubMain(lang, page, c) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const inner = `<section class="lic-section" id="who">
<h2>${c.whoH}</h2>
<p>${c.whoP}</p>
<div class="lic-fact-trio lic-fact-trio--color">
<div><h3><a href="${L.parents}">${c.who1H}</a></h3><p>${c.who1}</p></div>
<div><h3><a href="${L.grandparents}">${c.who2H}</a></h3><p>${c.who2}</p></div>
<div><h3><a href="${L.siblings}">${c.who3H}</a></h3><p>${c.who3}</p></div>
</div>
<div class="lic-fact-trio">
<div><h3><a href="${L.members}">${c.who4H}</a></h3><p>${c.who4}</p></div>
<div><h3><a href="${L.kids}">${c.who5H}</a></h3><p>${c.who5} <a href="${L.grandkids}">${isEs ? "Nietos" : "Grandchildren"}</a>.</p></div>
<div><h3><a href="${L.find}">${c.who6H}</a></h3><p>${c.who6}</p></div>
</div>
</section>
<section class="lic-section" id="interest">
<h2>${c.interestH}</h2>
<p>${c.interestP1}</p>
<p>${c.interestP2}</p>
</section>
<section class="lic-section" id="roles">
<h2>${c.rolesH}</h2>
<p>${c.rolesP}</p>
<div class="lic-fact-trio lic-fact-trio--color">
<div><h3>${c.role1T}</h3><p>${c.role1}</p></div>
<div><h3>${c.role2T}</h3><p>${c.role2}</p></div>
<div><h3>${c.role3T}</h3><p>${c.role3}</p></div>
</div>
<div class="lic-helpful"><p><strong>${c.role4T}.</strong> ${c.role4}</p></div>
</section>
<section class="lic-section" id="poa">
<h2>${c.poaH}</h2>
<p>${c.poaP}</p>
</section>
<section class="lic-section" id="product">
<h2>${c.productH}</h2>
<p>${c.productP}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.prod1T}.</strong> ${c.prod1}</li>
<li><strong>${c.prod2T}.</strong> ${c.prod2}</li>
<li><strong>${c.prod3T}.</strong> ${c.prod3}</li>
<li><strong>${c.prod4T}.</strong> ${c.prod4}</li>
</ol>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${feRateBlock(c, L.quote)}
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyP}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.apply1T}.</strong> ${c.apply1}</li>
<li><strong>${c.apply2T}.</strong> ${c.apply2}</li>
<li><strong>${c.apply3T}.</strong> ${c.apply3}</li>
</ol>
</section>
<section class="lic-section" id="if-no">
<h2>${c.ifNoH}</h2>
<p>${c.ifNoP}</p>
</section>`;
  return familyShell(lang, page, c, {
    isHub: true,
    toc: isEs
      ? [
          ["#who", "A quién"],
          ["#interest", "Interés"],
          ["#roles", "Papeles"],
          ["#cost", "Costo"],
          ["#apply", "Cómo"],
          ["#faq", "Preguntas"],
        ]
      : [
          ["#who", "Who"],
          ["#interest", "Interest"],
          ["#roles", "Roles"],
          ["#cost", "Cost"],
          ["#apply", "How"],
          ["#faq", "Questions"],
        ],
    inner,
  });
}

/* -------------------------------------------------------------------------- */
/* Parents                                                                     */
/* -------------------------------------------------------------------------- */

function copyParents(lang) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const src = sharedSources(isEs);
  if (isEs) {
    return {
      title: "Seguro de vida para padres: requisitos, dueño y precios de muestra (2026) | Mejor Vida Seguros",
      desc: "Un hijo adulto puede pagar y ser dueño de un seguro de gastos finales sobre un padre. El padre debe firmar. Primas ilustrativas de compañías designadas.",
      h1: "Seguro de vida para un padre o una madre: usted puede pagar; ellos tienen que participar",
      lead: "Muchas familias hacen esto para un funeral, no para reemplazar un sueldo. Eso encaja con el interés asegurable que describe la NAIC. Lo que no se puede saltar: el padre o la madre consiente, responde las preguntas de salud si el plan las tiene, y firma. Usted puede pedir cotizaciones antes. La solicitud es con ellos.",
      crumbEnd: "Padres",
      female: "Mujer",
      male: "Hombre",
      ageCol: "Edad",
      faceLabel: "Montos de gastos finales",
      take1: "Puede hablar con Mejor Vida Seguros y ver primas <strong>sin que sus padres estén en la llamada</strong>. Para emitir la póliza, sí hacen falta.",
      take2: "Si califican a un plan <strong>nivelado</strong> (preguntas de salud, sin examen en el consultorio), el beneficio completo puede aplicar desde el primer pago. La aceptación garantizada evita las preguntas y añade una espera de unos dos años.",
      take3: "Conviene que <strong>usted sea el dueño</strong> si paga la cuota. Si el padre figura como dueño, la compañía no discutirá el contrato con usted.",
      callout: "Use la edad y el tabaco de su padre o madre, no los suyos. Cifras de compañías designadas. No es una oferta.",
      needH: "Qué tiene que ser cierto el día de la solicitud",
      needP: "Estas condiciones no se “negocian” con un agente. Si una falta, no hay póliza nueva.",
      need1: "Están en Estados Unidos al aplicar y tienen SSN o TIN.",
      need2: "Tienen capacidad mental para firmar un contrato. Un diagnóstico de demencia avanzado suele cerrar los planes con preguntas de salud.",
      need3: "Aceptan que usted compre cobertura sobre su vida y firman (voz, electrónico o papel).",
      need4: "Si quiere un plan sin espera de dos años, responden ellos las preguntas de salud — no usted por ellos.",
      ownerH: "Por qué el dueño importa más que el pagador",
      ownerP: "En la solicitud se puede nombrar dueño distinto del asegurado. En Mutual of Omaha, un hijo adulto está en la lista de dueños aceptados. Eso le deja cambiar beneficiarios y pedir información. También deja el valor en efectivo en su patrimonio, no en el de su padre — un punto que a veces sale en una revisión de Medicaid. Eso no es asesoría legal.",
      ownerWarn: "Los formularios en línea de algunas marcas (anuncios de TV, correo) suelen dejar al asegurado como dueño. Usted pagaría y no podría cancelar ni preguntar. Mejor Vida Seguros coloca el dueño en la solicitud de compañías designadas.",
      typeH: "Qué tipo pedir para un padre",
      typeP: "La meta más común es dejar efectivo para un funeral. La NFDA (estudio 2023) publicó medianas nacionales de $8,300 con velatorio y entierro, y $6,280 con velatorio y cremación; el cementerio suma aparte. Un $10,000–$25,000 de gastos finales cubre ese rango en muchas familias.",
      type1T: "Gastos finales nivelados",
      type1: "Camino habitual. Living Promise 45–85, hasta unos $50,000. Accendo Level hasta 89 ($25,000 a los 76–89). Transamerica Immediate Solution hasta 85. Preguntas de salud; sin cita de laboratorio en estos planes.",
      type2T: "Aceptación garantizada",
      type2: "Si el cuestionario no da un nivelado. GIWL designada: en general 50–80, $5,000–$25,000, espera de dos años para muerte natural. <a href=\"" + L.gi + "\">Guía de aceptación garantizada</a>.",
      type3T: "Temporal",
      type3: "Solo si queda hipoteca o un plazo de ingresos. A los 75–80 el plazo largo ya casi no existe. <a href=\"" + L.term + "\">Seguro temporal</a>.",
      costH: "Primas de muestra (gastos finales)",
      costP: "No fumador, compañías designadas, redondeadas. El plan gradual o garantizado sale distinto. Pestaña $10,000 / $15,000 / $25,000.",
      healthH: "Salud: no asuma que “no califican”",
      healthP: "Diabetes controlada, presión alta o un infarto antiguo no cierran automáticamente un nivelado. Lo que suele empujar a garantizada: demencia, diálisis, oxígeno en casa, un cáncer activo, o estar internado. Cada compañía tiene su lista. Mejor Vida Seguros compara antes de aplicar a ciegas.",
      applyH: "Cómo se firma con un padre",
      apply1T: "Voz",
      apply1: "El agente lee las preguntas. Padre e hijo dicen su nombre y la fecha. Sirve cuando viven en estados distintos.",
      apply2T: "Enlace",
      apply2: "Llega un correo o un texto. Cada uno firma en la pantalla.",
      apply3T: "Papel",
      apply3: "Poco habitual. Ambos firman el mismo juego. No firme usted “por” ellos.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Puedo asegurar a los dos padres en una sola póliza?",
      faq1a: "No. Cada vida asegurada necesita su contrato. Puede ser dueño de las dos y pagar las dos cuotas.",
      faq2q: "¿Y si mi padre no quiere hablar de la muerte?",
      faq2a: "Puede empezar por el número: “esto costaría X al mes por Y de beneficio.” Si se niega a firmar, no hay póliza. Ahorrar o un prepagado son las alternativas, no un atajo de seguro.",
      faq3q: "¿El dinero tiene que ir a la funeraria?",
      faq3a: "No. El beneficiario recibe efectivo y decide. Nombre a alguien concreto y avísele.",
      faq4q: "¿Hasta los 90 años?",
      faq4a: "No publicamos emisión nueva de gastos finales a los 90. Accendo Level puede llegar a 89. Vea <a href=\"" + L.seniors + "\">la guía para mayores</a>.",
      faq5q: "¿Puedo cotizar yo solo?",
      faq5a: "Sí, la primera conversación. Lleve edad, tabaco y un resumen de salud. Ellos entran cuando hay una solicitud.",
      nextH: "Siguiente paso",
      nextLead: "Use el cotizador con los datos de su padre o madre, o llame.",
      nextMore: `Si la meta es solo el funeral, la <a href="${L.fe}">guía de entierro</a> entra en más detalle del producto.`,
      discTitle: "Divulgación",
      discBody: sharedDisc(true),
      quoteTitle: "Cotizar para un padre",
      quote1: "Edad y tabaco del padre",
      quote2: "Nivelado o con espera",
      quoteCta: "Ver precios",
      ...src,
    };
  }
  return {
    title: "Life insurance for parents: requirements, owner, and sample prices (2026) | Mejor Vida Insurance",
    desc: "An adult child can pay for and own a final expense policy on a parent. The parent must sign. Illustrative premiums from appointed companies.",
    h1: "Life insurance for a parent: you can pay; they still have to take part",
    lead: "Most families do this for a funeral, not to replace a paycheck. That matches the insurable interest the NAIC describes. What you cannot skip: the parent consents, answers health questions if the plan has them, and signs. You can ask for quotes first. The application is with them.",
    crumbEnd: "Parents",
    female: "Female",
    male: "Male",
    ageCol: "Age",
    faceLabel: "Final expense amounts",
    take1: "You can talk with Mejor Vida Insurance and see premiums <strong>without your parents on the call</strong>. To issue the policy, they are required.",
    take2: "If they qualify for a <strong>level</strong> plan (health questions, no in-office exam), the full benefit can apply from the first payment. Guaranteed acceptance skips the questions and adds about a two-year wait.",
    take3: "You should <strong>be the owner</strong> if you pay the premium. If the parent is listed as owner, the company will not discuss the contract with you.",
    callout: "Use your parent’s age and tobacco, not yours. Appointed-company figures. Not an offer.",
    needH: "What has to be true on application day",
    needP: "These conditions are not “negotiated” with an agent. If one is missing, there is no new policy.",
    need1: "They are in the United States when you apply and have an SSN or TIN.",
    need2: "They have the mental capacity to sign a contract. Advanced dementia usually closes plans that ask health questions.",
    need3: "They agree that you are buying coverage on their life and they sign (voice, electronic, or paper).",
    need4: "If you want a plan without a two-year wait, they answer the health questions — not you on their behalf.",
    ownerH: "Why owner matters more than payer",
    ownerP: "The application can name an owner other than the insured. At Mutual of Omaha, an adult child is on the accepted-owner list. That lets you change beneficiaries and request information. It also keeps cash value in your estate, not your parent’s — a point that sometimes comes up in a Medicaid review. That is not legal advice.",
    ownerWarn: "Online forms from some advertised brands usually leave the insured as owner. You would pay and could not cancel or ask questions. Mejor Vida Insurance sets the owner on the appointed-company application.",
    typeH: "Which type to ask for on a parent",
    typeP: "The usual goal is cash for a funeral. NFDA’s 2023 study reported U.S. medians of $8,300 with viewing and burial and $6,280 with viewing and cremation; the cemetery is extra. A $10,000–$25,000 final expense policy covers that range for many families.",
    type1T: "Level final expense",
    type1: "The usual path. Living Promise ages 45–85, up to about $50,000. Accendo Level through 89 ($25,000 at 76–89). Transamerica Immediate Solution through 85. Health questions; no lab appointment on these plans.",
    type2T: "Guaranteed acceptance",
    type2: "If the questionnaire does not produce a level plan. Appointed GIWL: generally 50–80, $5,000–$25,000, two-year wait for natural death. <a href=\"" + L.gi + "\">Guaranteed acceptance guide</a>.",
    type3T: "Term",
    type3: "Only if a mortgage or a set income period remains. By 75–80 a long term is almost gone. <a href=\"" + L.term + "\">Term life</a>.",
    costH: "Sample premiums (final expense)",
    costP: "Non-tobacco, appointed companies, rounded. A graded or guaranteed plan prices differently. Tabs $10,000 / $15,000 / $25,000.",
    healthH: "Health: do not assume they “cannot qualify”",
    healthP: "Controlled diabetes, high blood pressure, or an old heart attack do not automatically close a level plan. What often pushes guaranteed issue: dementia, dialysis, home oxygen, an active cancer, or being in a facility. Each company has its list. Mejor Vida Insurance compares before you apply blind.",
    applyH: "How you sign with a parent",
    apply1T: "Voice",
    apply1: "The agent reads the questions. Parent and child say their name and the date. This works when you live in different states.",
    apply2T: "Link",
    apply2: "An email or text arrives. Each person signs on screen.",
    apply3T: "Paper",
    apply3: "Uncommon. Both sign the same set. Do not sign “for” them.",
    faqTitle: "Frequently asked questions",
    faq1q: "Can I insure both parents on one policy?",
    faq1a: "No. Each insured life needs its own contract. You can own both and pay both premiums.",
    faq2q: "What if my parent will not talk about dying?",
    faq2a: "Start with the number: “this would cost X a month for Y of benefit.” If they will not sign, there is no policy. Saving or a prepaid funeral are the alternatives, not an insurance shortcut.",
    faq3q: "Does the money have to go to the funeral home?",
    faq3a: "No. The beneficiary receives cash and decides. Name a specific person and tell them.",
    faq4q: "Through age 90?",
    faq4a: "We do not publish new final-expense issue at 90. Accendo Level can go through 89. See the <a href=\"" + L.seniors + "\">seniors guide</a>.",
    faq5q: "Can I quote by myself?",
    faq5a: "Yes, the first conversation. Bring age, tobacco, and a health summary. They join when there is an application.",
    nextH: "Next step",
    nextLead: "Use the quote tool with your parent’s details, or call.",
    nextMore: `If the only goal is a funeral, the <a href="${L.fe}">burial guide</a> goes deeper on the product.`,
    discTitle: "Disclosure",
    discBody: sharedDisc(false),
    quoteTitle: "Quote for a parent",
    quote1: "Parent’s age and tobacco",
    quote2: "Level or with a wait",
    quoteCta: "See prices",
    ...src,
  };
}

function parentsMain(lang, page, c) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const inner = `<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<p>${c.needP}</p>
<ul>
<li>${c.need1}</li>
<li>${c.need2}</li>
<li>${c.need3}</li>
<li>${c.need4}</li>
</ul>
</section>
<section class="lic-section" id="owner">
<h2>${c.ownerH}</h2>
<p>${c.ownerP}</p>
<aside class="lic-callout"><p>${c.ownerWarn}</p></aside>
</section>
<section class="lic-section" id="type">
<h2>${c.typeH}</h2>
<p>${c.typeP}</p>
<ol class="lic-lesson-steps">
<li><strong>${c.type1T}.</strong> ${c.type1}</li>
<li><strong>${c.type2T}.</strong> ${c.type2}</li>
<li><strong>${c.type3T}.</strong> ${c.type3}</li>
</ol>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${feRateBlock(c, L.quote)}
</section>
<section class="lic-section" id="health">
<h2>${c.healthH}</h2>
<p>${c.healthP}</p>
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<ol class="lic-lesson-steps">
<li><strong>${c.apply1T}.</strong> ${c.apply1}</li>
<li><strong>${c.apply2T}.</strong> ${c.apply2}</li>
<li><strong>${c.apply3T}.</strong> ${c.apply3}</li>
</ol>
</section>`;
  return familyShell(lang, page, c, {
    toc: isEs
      ? [
          ["#need", "Requisitos"],
          ["#owner", "Dueño"],
          ["#type", "Tipo"],
          ["#cost", "Costo"],
          ["#apply", "Firma"],
          ["#faq", "Preguntas"],
        ]
      : [
          ["#need", "Requirements"],
          ["#owner", "Owner"],
          ["#type", "Type"],
          ["#cost", "Cost"],
          ["#apply", "Signing"],
          ["#faq", "Questions"],
        ],
    inner,
  });
}

/* -------------------------------------------------------------------------- */
/* Grandparents (as insured adults)                                            */
/* -------------------------------------------------------------------------- */

function copyGrandparents(lang) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const src = sharedSources(isEs);
  if (isEs) {
    return {
      title: "Seguro de vida para abuelos: gastos finales cuando el nieto paga (2026) | Mejor Vida Seguros",
      desc: "Un nieto puede pagar un seguro de gastos finales sobre un abuelo si el abuelo firma. Edades de emisión y primas de muestra de compañías designadas.",
      h1: "Seguro de vida para un abuelo: el nieto puede pagar; el abuelo tiene que estar en la solicitud",
      lead: "Esto no es lo mismo que una póliza <em>para un nieto</em> (el niño como asegurado). Aquí el abuelo es quien está cubierto. El interés asegurable habitual es el funeral. La NAIC pide esa pérdida económica; un nieto que se haría cargo de la cuenta suele calificar. El abuelo aún firma.",
      crumbEnd: "Abuelos",
      female: "Mujer",
      male: "Hombre",
      ageCol: "Edad",
      faceLabel: "Montos de gastos finales",
      take1: "Si el abuelo no quiere participar, <strong>no hay póliza nueva</strong>. Un poder notarial no lo sustituye.",
      take2: "La edad máxima de emisión la marca el producto: muchos gastos finales hasta <strong>85</strong>; Accendo Level puede llegar a <strong>89</strong> con tope de $25,000 a los 76–89.",
      take3: "Si la salud es grave, todavía puede haber <strong>aceptación garantizada</strong> (espera de dos años). No asuma que “ya no hay nada” sin un cuestionario.",
      callout: "Si usted es el abuelo y quiere cubrir a un nieto, esa es otra guía: <a href=\"" + L.grandkids + "\">seguro de vida para nietos</a>.",
      needH: "Qué pide la compañía cuando el asegurado es el abuelo",
      needP: "Las mismas reglas de adulto que en cualquier familiar: consentimiento, firma, SSN o TIN, y estar en EE. UU. al aplicar. El funeral como motivo suele bastar en montos de gastos finales. Un face de $100,000 o más pide una explicación más larga de la pérdida económica.",
      typeH: "Qué producto suele encajar",
      typeP: "A los 70 u 80, un temporal de 20 años ya no existe. El contrato que no se vence es vida entera de monto más bajo — gastos finales.",
      type1: "<strong>Nivelado.</strong> Preguntas de salud. Beneficio completo desde el día 1 si se emite así. Living Promise, Accendo Level, Immediate Solution — cada uno con su edad y tope.",
      type2: "<strong>Garantizada.</strong> Sin preguntas; espera de dos años para muerte no accidental. GIWL designada suele emitir hasta los 80.",
      type3: "<strong>No elija temporal “barato” para un funeral.</strong> Si el plazo termina a los 75 y el abuelo vive hasta los 82, no hay beneficio.",
      costH: "Primas de muestra",
      costP: "La fila de edad es la del abuelo. No fumador, gastos finales nivelados, compañías designadas.",
      otherH: "Si el abuelo se niega",
      otherP: "Ahorre a su nombre, o compare un prepagado en una funeraria (servicios concretos, no efectivo libre). No hay forma lícita de asegurar a un adulto que no firma.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Es lo mismo que el seguro para nietos?",
      faq1a: "No. En <a href=\"" + L.grandkids + "\">seguro para nietos</a> el niño es el asegurado y usted suele ser el dueño. En esta página el abuelo es el asegurado.",
      faq2q: "¿Puedo cubrir a ambos abuelos?",
      faq2a: "Con dos pólizas, sí. No con un solo contrato.",
      faq3q: "¿Y si ya tienen 86 años?",
      faq3a: "Accendo Level puede emitir hasta 89, con tope de $25,000 a esas edades. Otras compañías ya cortaron. <a href=\"" + L.seniors + "\">Guía para mayores</a>.",
      faq4q: "¿El nieto puede ser dueño?",
      faq4a: "En Mutual of Omaha, nietos y abuelos aparecen como beneficiarios aceptados; la lista de dueños es más corta (cónyuge, padre, hijo adulto, fideicomiso, socio). Hay que confirmar el dueño en el producto concreto antes de aplicar.",
      nextH: "Siguiente paso",
      nextLead: "Cotice con la edad del abuelo, o llame a Mejor Vida Seguros.",
      discTitle: "Divulgación",
      discBody: sharedDisc(true),
      quoteTitle: "Cotizar para un abuelo",
      quote1: "Edad del abuelo",
      quote2: "Gastos finales",
      quoteCta: "Ver precios",
      ...src,
    };
  }
  return {
    title: "Life insurance for grandparents: final expense when a grandchild pays (2026) | Mejor Vida Insurance",
    desc: "A grandchild can pay for a final expense policy on a grandparent if the grandparent signs. Issue ages and sample premiums from appointed companies.",
    h1: "Life insurance for a grandparent: the grandchild can pay; the grandparent has to be on the application",
    lead: "This is not the same as a policy <em>for a grandchild</em> (the child as insured). Here the grandparent is the person covered. The usual insurable interest is the funeral. The NAIC asks for that financial loss; a grandchild who would pay the bill usually qualifies. The grandparent still signs.",
    crumbEnd: "Grandparents",
    female: "Female",
    male: "Male",
    ageCol: "Age",
    faceLabel: "Final expense amounts",
    take1: "If the grandparent will not take part, <strong>there is no new policy</strong>. A power of attorney does not replace them.",
    take2: "Issue-age limits are set by product: many final expense plans through <strong>85</strong>; Accendo Level can go through <strong>89</strong> with a $25,000 cap at ages 76–89.",
    take3: "If health is severe, <strong>guaranteed acceptance</strong> may still exist (two-year wait). Do not assume “nothing is left” without a questionnaire.",
    callout: "If you are the grandparent and want to cover a grandchild, that is a different guide: <a href=\"" + L.grandkids + "\">life insurance for grandchildren</a>.",
    needH: "What the company asks when the insured is the grandparent",
    needP: "The same adult rules as any relative: consent, signature, SSN or TIN, and being in the U.S. when you apply. A funeral as the reason is usually enough at final-expense amounts. A face of $100,000 or more asks for a longer explanation of the financial loss.",
    typeH: "Which product usually fits",
    typeP: "At 70 or 80, a 20-year term is already gone. The contract that does not expire is smaller whole life — final expense.",
    type1: "<strong>Level.</strong> Health questions. Full benefit from day one if issued that way. Living Promise, Accendo Level, Immediate Solution — each with its own age and cap.",
    type2: "<strong>Guaranteed.</strong> No questions; two-year wait for non-accidental death. Appointed GIWL usually issues through 80.",
    type3: "<strong>Do not pick “cheap” term for a funeral.</strong> If the term ends at 75 and the grandparent lives to 82, there is no benefit.",
    costH: "Sample premiums",
    costP: "The age row is the grandparent’s. Non-tobacco, level final expense, appointed companies.",
    otherH: "If the grandparent refuses",
    otherP: "Save in your own name, or compare a prepaid funeral (specific services, not unrestricted cash). There is no lawful way to insure an adult who will not sign.",
    faqTitle: "Frequently asked questions",
    faq1q: "Is this the same as grandchildren’s life insurance?",
    faq1a: "No. On <a href=\"" + L.grandkids + "\">grandchildren’s life insurance</a> the child is the insured and you are usually the owner. On this page the grandparent is the insured.",
    faq2q: "Can I cover both grandparents?",
    faq2a: "With two policies, yes. Not with one contract.",
    faq3q: "What if they are already 86?",
    faq3a: "Accendo Level can issue through 89, with a $25,000 cap at those ages. Other companies have already stopped. <a href=\"" + L.seniors + "\">Seniors guide</a>.",
    faq4q: "Can the grandchild be the owner?",
    faq4a: "At Mutual of Omaha, grandparents and grandchildren appear as accepted beneficiaries; the owner list is shorter (spouse, parent, adult child, trust, business partner). Confirm the owner on the specific product before you apply.",
    nextH: "Next step",
    nextLead: "Quote with the grandparent’s age, or call Mejor Vida Insurance.",
    discTitle: "Disclosure",
    discBody: sharedDisc(false),
    quoteTitle: "Quote for a grandparent",
    quote1: "Grandparent’s age",
    quote2: "Final expense",
    quoteCta: "See prices",
    ...src,
  };
}

function grandparentsMain(lang, page, c) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const inner = `<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<p>${c.needP}</p>
</section>
<section class="lic-section" id="type">
<h2>${c.typeH}</h2>
<p>${c.typeP}</p>
<ul>
<li>${c.type1}</li>
<li>${c.type2}</li>
<li>${c.type3}</li>
</ul>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${feRateBlock(c, L.quote)}
</section>
<section class="lic-section" id="if-no">
<h2>${c.otherH}</h2>
<p>${c.otherP}</p>
</section>`;
  return familyShell(lang, page, c, {
    toc: isEs
      ? [
          ["#need", "Requisitos"],
          ["#type", "Producto"],
          ["#cost", "Costo"],
          ["#if-no", "Si se niegan"],
          ["#faq", "Preguntas"],
        ]
      : [
          ["#need", "Requirements"],
          ["#type", "Product"],
          ["#cost", "Cost"],
          ["#if-no", "If they refuse"],
          ["#faq", "Questions"],
        ],
    inner,
  });
}

/* -------------------------------------------------------------------------- */
/* Siblings                                                                    */
/* -------------------------------------------------------------------------- */

function copySiblings(lang) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const src = sharedSources(isEs);
  if (isEs) {
    return {
      title: "Seguro de gastos finales para un hermano o una hermana (2026) | Mejor Vida Seguros",
      desc: "Puede pagar el entierro de un hermano si esa persona firma. Cómo funciona el dueño, la espera y las primas de muestra de compañías designadas.",
      h1: "Seguro de gastos finales para un hermano: usted puede pagar la cuota; ellos firman la salud",
      lead: "Un funeral compartido es una pérdida económica clara. Por eso las compañías de gastos finales suelen aceptar que un hermano pague la cobertura de otro. Eso no significa que usted conteste las preguntas. El hermano asegurado habla por su propia historia médica.",
      crumbEnd: "Hermanos",
      female: "Mujer",
      male: "Hombre",
      ageCol: "Edad",
      faceLabel: "Montos de gastos finales",
      take1: "Puede pedir cotizaciones <strong>usted solo</strong>. La solicitud formal es con su hermano o hermana.",
      take2: "Para un beneficio desde el día 1 hacen falta <strong>preguntas de salud</strong> contestadas por la persona asegurada. Sin preguntas, hay espera de unos dos años.",
      take3: "En algunos productos de Mutual of Omaha, un hermano es <strong>beneficiario aceptado pero no dueño</strong>. Confirme el dueño antes de aplicar, para que la compañía le hable a usted si paga.",
      callout: "Primas ilustrativas, no fumador, compañías designadas. Use la edad de su hermano, no la suya.",
      needH: "Requisitos cuando el asegurado es un hermano",
      need1: "Consentimiento y firma de esa persona.",
      need2: "Estar en EE. UU. al aplicar, con SSN o TIN, y capacidad para contratar.",
      need3: "Interés asegurable: el costo de un funeral que usted cargaría suele bastar en montos de gastos finales. Un monto grande para “dejarle dinero” pide más explicación.",
      need4: "El poder notarial no le deja responder el cuestionario por ellos.",
      howH: "Cómo queda armada la póliza",
      howP: "Usted suele ser pagador y, si el producto lo permite, dueño. El hermano es el asegurado. El beneficiario puede ser usted u otra persona (por ejemplo, quien criaría a un sobrino). El efectivo no está reservado a una funeraria.",
      waitH: "Nivelado frente a garantizada",
      waitP: "Nivelado: cuestionario, posible beneficio completo desde el primer pago. Garantizada: sin cuestionario, espera de dos años para muerte natural, primas más altas por dólar. Condiciones que a menudo dejan solo garantizada: demencia, hospital o residencia, enfermedad terminal, VIH/SIDA, silla de ruedas por enfermedad crónica. La lista exacta es de cada compañía.",
      costH: "Primas de muestra",
      costP: "Gastos finales nivelados. Un $10,000 a los 60 no cuesta lo mismo que a los 80. Las pestañas cambian el monto.",
      signH: "Cómo firman dos hermanos",
      signP: "Voz grabada si viven lejos. Enlace electrónico si ambos tienen correo. Papel solo si pueden firmar el mismo juego. Nadie firma “en nombre del otro.”",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Puedo cubrir a varios hermanos en una póliza?",
      faq1a: "No. Cada adulto, un contrato. Puede ser pagador de varios.",
      faq2q: "¿Y si mi hermano fuma?",
      faq2a: "Dígalo. El tabaco sube la prima. Ocultarlo puede anular un reclamo.",
      faq3q: "¿El dinero sobrante es mío?",
      faq3a: "Si usted es el beneficiario, el cheque es suyo. No tiene que entregarlo a una funeraria.",
      nextH: "Siguiente paso",
      nextLead: "Cotice con la edad de su hermano, o llame a Mejor Vida Seguros.",
      discTitle: "Divulgación",
      discBody: sharedDisc(true),
      quoteTitle: "Cotizar para un hermano",
      quote1: "Edad del hermano",
      quote2: "Gastos finales",
      quoteCta: "Ver precios",
      ...src,
    };
  }
  return {
    title: "Final expense insurance for a brother or sister (2026) | Mejor Vida Insurance",
    desc: "You can pay for a sibling’s burial policy if that person signs. How ownership, the waiting period, and sample appointed-company premiums work.",
    h1: "Final expense insurance for a sibling: you can pay the premium; they sign the health questions",
    lead: "A shared funeral is a clear financial loss. That is why final expense companies usually let one sibling pay for coverage on another. It does not mean you answer the questions. The insured sibling speaks for their own medical history.",
    crumbEnd: "Siblings",
    female: "Female",
    male: "Male",
    ageCol: "Age",
    faceLabel: "Final expense amounts",
    take1: "You can ask for quotes <strong>on your own</strong>. The formal application is with your brother or sister.",
    take2: "Day-one full benefit requires <strong>health questions</strong> answered by the insured person. No questions means about a two-year wait.",
    take3: "On some Mutual of Omaha products, a sibling is an <strong>accepted beneficiary but not an owner</strong>. Confirm the owner before you apply, so the company will talk to you if you pay.",
    callout: "Illustrative non-tobacco premiums, appointed companies. Use your sibling’s age, not yours.",
    needH: "Requirements when the insured is a sibling",
    need1: "That person’s consent and signature.",
    need2: "In the U.S. when you apply, with an SSN or TIN, and capacity to contract.",
    need3: "Insurable interest: a funeral you would pay for is usually enough at final-expense amounts. A large amount to “leave them money” asks for more explanation.",
    need4: "A power of attorney does not let you answer the questionnaire for them.",
    howH: "How the policy is put together",
    howP: "You are usually the payer and, if the product allows it, the owner. The sibling is the insured. The beneficiary can be you or someone else (for example, whoever would raise a niece or nephew). The cash is not reserved for a funeral home.",
    waitH: "Level versus guaranteed",
    waitP: "Level: questionnaire, possible full benefit from the first payment. Guaranteed: no questionnaire, two-year wait for natural death, higher cost per dollar. Conditions that often leave only guaranteed issue: dementia, a hospital or nursing facility, a terminal illness, HIV/AIDS, a wheelchair from chronic disease. The exact list is the company’s.",
    costH: "Sample premiums",
    costP: "Level final expense. A $10,000 policy at 60 is not the same price as at 80. The tabs change the amount.",
    signH: "How two siblings sign",
    signP: "Recorded voice if you live far apart. An electronic link if both have email. Paper only if you can sign the same set. Nobody signs “on behalf of” the other.",
    faqTitle: "Frequently asked questions",
    faq1q: "Can I cover several siblings on one policy?",
    faq1a: "No. Each adult, one contract. You can be the payer on more than one.",
    faq2q: "What if my sibling smokes?",
    faq2a: "Say so. Tobacco raises the premium. Hiding it can void a claim.",
    faq3q: "Is leftover money mine?",
    faq3a: "If you are the beneficiary, the check is yours. You do not have to hand it to a funeral home.",
    nextH: "Next step",
    nextLead: "Quote with your sibling’s age, or call Mejor Vida Insurance.",
    discTitle: "Disclosure",
    discBody: sharedDisc(false),
    quoteTitle: "Quote for a sibling",
    quote1: "Sibling’s age",
    quote2: "Final expense",
    quoteCta: "See prices",
    ...src,
  };
}

function siblingsMain(lang, page, c) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const inner = `<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<ul>
<li>${c.need1}</li>
<li>${c.need2}</li>
<li>${c.need3}</li>
<li>${c.need4}</li>
</ul>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<p>${c.howP}</p>
</section>
<section class="lic-section" id="wait">
<h2>${c.waitH}</h2>
<p>${c.waitP}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${feRateBlock(c, L.quote)}
</section>
<section class="lic-section" id="sign">
<h2>${c.signH}</h2>
<p>${c.signP}</p>
</section>`;
  return familyShell(lang, page, c, {
    toc: isEs
      ? [
          ["#need", "Requisitos"],
          ["#how", "Cómo queda"],
          ["#wait", "Espera"],
          ["#cost", "Costo"],
          ["#faq", "Preguntas"],
        ]
      : [
          ["#need", "Requirements"],
          ["#how", "How it works"],
          ["#wait", "Waiting period"],
          ["#cost", "Cost"],
          ["#faq", "Questions"],
        ],
    inner,
  });
}

/* -------------------------------------------------------------------------- */
/* Other family members                                                        */
/* -------------------------------------------------------------------------- */

function copyFamilyMembers(lang) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const src = sharedSources(isEs);
  if (isEs) {
    return {
      title: "Seguro de vida para otros familiares: tíos, primos y más (2026) | Mejor Vida Seguros",
      desc: "Quién puede ser dueño o solo beneficiario cuando cubre a un familiar que no es padre, hijo o cónyuge. Gastos finales, firmas y primas de muestra.",
      h1: "Seguro de vida para un familiar que no es su padre: las listas de dueño y de beneficiario no coinciden",
      lead: "Un tío, un primo o un cuñado puede ser alguien de quien usted pagaría el funeral. Eso puede cumplir el interés asegurable de la NAIC. Lo que cambia es <em>quién puede ser dueño</em>. En Mutual of Omaha, tíos, sobrinos y primos aparecen como beneficiarios contingentes aceptados, no en la lista corta de dueños. Cada compañía publica la suya. Mejor Vida Seguros la confirma antes de aplicar.",
      crumbEnd: "Otros familiares",
      female: "Mujer",
      male: "Hombre",
      ageCol: "Edad",
      faceLabel: "Montos de gastos finales",
      take1: "La persona asegurada <strong>siempre firma</strong>. No hay póliza de adulto “sin que sepan.”",
      take2: "No existe un <strong>seguro de entierro grupal</strong> que cubra a varios adultos en un solo contrato. Cada vida, una póliza.",
      take3: "Un <strong>rider de hijo o nieto</strong> en su propia póliza es la excepción: cubre menores, no a su tío.",
      callout: "Si el familiar es un padre, un abuelo o un hermano, use esas guías: las reglas de dueño son más claras.",
      whoH: "Relaciones que las compañías suelen reconocer",
      whoP: "La NAIC habla de familia inmediata, y a veces de un socio o un acreedor. En gastos finales, un funeral que usted pagaría es el argumento habitual. Un vecino o un amigo, sin pérdida económica, no califica.",
      tableH: "Quién puede ser dueño y quién solo cobra",
      tableLead: "En vida simplificada de Mutual of Omaha, no todo pariente puede manejar el contrato. Los tres niveles van de más control a menos. Otras compañías publican listas distintas.",
      col1: "Papel",
      col2: "Suele aceptar",
      r1a: "Dueño o beneficiario",
      r1Tag: "Más control",
      r1Do: "Puede manejar el contrato — cambiar beneficiarios, pedir información a la compañía — y también cobrar el cheque.",
      r1b: "Cónyuge, prometido, pareja de hecho, padre, hijo adulto, fideicomiso, socio (con papeles)",
      r2a: "Solo beneficiario",
      r2Tag: "Cobra, no dueño",
      r2Do: "Puede recibir el pago. No puede ser dueño ni hablar con la compañía sobre el contrato.",
      r2b: "Hermanos, abuelos y nietos, parientes por matrimonio, ex cónyuge, el caudal hereditario",
      r3a: "Beneficiario contingente",
      r3Tag: "Reserva",
      r3Do: "Cobra solo si el beneficiario principal ya falleció. No es dueño.",
      r3b: "Tíos, tías, sobrinos, primos y otros parientes más lejanos; amigos",
      tableNote: "Otras compañías designadas (Transamerica, Aetna Accendo, Americo, Corebridge) tienen sus propias listas. Un monto de funeral suele ser más sencillo que un temporal grande. Confirmamos el producto, no un “sí” genérico de internet.",
      groupH: "Por qué no hay “una póliza para toda la familia”",
      groupP: "Cada adulto es un riesgo de salud distinto. Las primas, las preguntas y las esperas no se mezclan. Lo que sí existe: riders de niños en la póliza de un adulto, y pólizas infantiles separadas. Eso no cubre a su hermana de 62 años.",
      costH: "Primas de muestra",
      costP: "Las mismas bandas de gastos finales. La edad es la del familiar asegurado.",
      applyH: "Cómo empezar si el parentesco es más lejano",
      applyP: "Digamos el parentesco exacto y el monto. Si el producto no deja que usted sea dueño, hay dos caminos honestos: el familiar es dueño y usted paga (con el riesgo de no poder preguntar), o no se emite y se ahorra. No firme un formulario en línea a nombre de otra persona: eso puede ser un delito y anula el contrato.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Puedo asegurar a un tío?",
      faq1a: "A veces, si hay interés asegurable (por ejemplo, usted pagaría el funeral) y el tío firma. Puede que usted solo pueda ser beneficiario, no dueño. Lo confirmamos con la compañía.",
      faq2q: "¿Y un amigo cercano?",
      faq2a: "Sin pérdida económica documentada, la NAIC dice que un extraño no puede comprar. Un amigo suele quedar fuera, salvo un préstamo o un negocio formal.",
      faq3q: "¿Sirve un seguro de grupo del trabajo para varios parientes?",
      faq3a: "El grupo cubre al empleado, a veces al cónyuge o a hijos, según ese plan. No sustituye una póliza de gastos finales sobre un tío.",
      nextH: "Siguiente paso",
      nextLead: "Cuéntenos el parentesco y la edad. Confirmamos si usted puede ser dueño en el producto.",
      nextMore: `Para el panorama general, vuelva a <a href="${L.hub}">para la familia</a>.`,
      discTitle: "Divulgación",
      discBody: sharedDisc(true),
      quoteTitle: "Hablar del parentesco",
      quote1: "Diga quién es el asegurado",
      quote2: "Confirmamos el dueño",
      quoteCta: "Ver precios",
      ...src,
    };
  }
  return {
    title: "Life insurance for other relatives: aunts, cousins, and more (2026) | Mejor Vida Insurance",
    desc: "Who may own a policy versus who may only be a beneficiary when you cover a relative who is not a parent, child, or spouse. Final expense, signatures, and sample premiums.",
    h1: "Life insurance for a relative who is not your parent: owner lists and beneficiary lists are not the same",
    lead: "An aunt, a cousin, or an in-law may be someone whose funeral you would pay. That can meet the NAIC’s insurable interest. What changes is <em>who may own</em> the contract. At Mutual of Omaha, aunts, nephews, and cousins appear as accepted contingent beneficiaries, not on the short owner list. Each company publishes its own. Mejor Vida Insurance confirms it before you apply.",
    crumbEnd: "Other relatives",
    female: "Female",
    male: "Male",
    ageCol: "Age",
    faceLabel: "Final expense amounts",
    take1: "The insured person <strong>always signs</strong>. There is no adult policy “without them knowing.”",
    take2: "There is no <strong>group burial plan</strong> that covers several adults on one contract. Each life, one policy.",
    take3: "A <strong>child or grandchild rider</strong> on your own policy is the exception: it covers minors, not your aunt.",
    callout: "If the relative is a parent, a grandparent, or a sibling, use those guides: the owner rules are clearer.",
    whoH: "Relationships companies usually recognize",
    whoP: "The NAIC talks about immediate family, and sometimes a partner or a creditor. On final expense, a funeral you would pay is the usual argument. A neighbor or a friend, with no financial loss, does not qualify.",
    tableH: "Who can own the policy, and who can only receive the check",
    tableLead: "On Mutual of Omaha simplified life, not every relative can run the contract. The three levels go from the most control to the least. Other companies keep their own lists.",
    col1: "Role",
    col2: "Typically accepted",
    r1a: "Owner or beneficiary",
    r1Tag: "Most control",
    r1Do: "Can run the contract — change beneficiaries, ask the company questions — and can also receive the check.",
    r1b: "Spouse, fiancé, domestic partner, parent, adult child, trust, business partner (with paperwork)",
    r2a: "Beneficiary only",
    r2Tag: "Receives, cannot own",
    r2Do: "Can receive the payment. Cannot own the policy or discuss the contract with the company.",
    r2b: "Siblings, grandparents and grandchildren, relatives by marriage, an ex-spouse, the estate",
    r3a: "Contingent beneficiary",
    r3Tag: "Backup",
    r3Do: "Paid only if the primary beneficiary has already died. Not an owner.",
    r3b: "Aunts, uncles, nieces, nephews, cousins and other more distant relatives; friends",
    tableNote: "Other appointed companies (Transamerica, Aetna Accendo, Americo, Corebridge) keep their own lists. A funeral amount is usually simpler than a large term policy. We confirm the product — not a generic internet “yes.”",
    groupH: "Why there is no “one policy for the whole family”",
    groupP: "Each adult is a different health risk. Premiums, questions, and waits do not blend. What does exist: child riders on an adult policy, and separate children’s policies. That does not cover your 62-year-old sister.",
    costH: "Sample premiums",
    costP: "The same final-expense bands. Age is the insured relative’s.",
    applyH: "How to start if the relationship is more distant",
    applyP: "Tell us the exact relationship and the amount. If the product will not let you own it, there are two honest paths: the relative owns it and you pay (with the risk you cannot ask questions), or it is not issued and you save. Do not sign an online form in someone else’s name: that can be a crime and it voids the contract.",
    faqTitle: "Frequently asked questions",
    faq1q: "Can I insure an aunt or uncle?",
    faq1a: "Sometimes, if there is insurable interest (for example, you would pay the funeral) and they sign. You may only be allowed as beneficiary, not owner. We confirm with the company.",
    faq2q: "What about a close friend?",
    faq2a: "Without a documented financial loss, the NAIC says a stranger cannot buy. A friend is usually out, unless there is a loan or a formal business.",
    faq3q: "Does workplace group life cover several relatives?",
    faq3a: "Group life covers the employee, and sometimes a spouse or children, according to that plan. It does not replace a final expense policy on an aunt.",
    nextH: "Next step",
    nextLead: "Tell us the relationship and age. We confirm whether you can own the product.",
    nextMore: `For the wider picture, go back to <a href="${L.hub}">for family</a>.`,
    discTitle: "Disclosure",
    discBody: sharedDisc(false),
    quoteTitle: "Talk through the relationship",
    quote1: "Say who is insured",
    quote2: "We confirm the owner",
    quoteCta: "See prices",
    ...src,
  };
}

function familyMembersMain(lang, page, c) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const inner = `<section class="lic-section" id="who">
<h2>${c.whoH}</h2>
<p>${c.whoP}</p>
</section>
<section class="lic-section" id="lists">
<h2>${c.tableH}</h2>
<p>${c.tableLead}</p>
${roleLadderHtml(c)}
<p class="lic-rate-note">${c.tableNote}</p>
</section>
<section class="lic-section" id="group">
<h2>${c.groupH}</h2>
<p>${c.groupP}</p>
</section>
<section class="lic-section" id="cost">
<h2>${c.costH}</h2>
<p>${c.costP}</p>
${feRateBlock(c, L.quote)}
</section>
<section class="lic-section" id="apply">
<h2>${c.applyH}</h2>
<p>${c.applyP}</p>
</section>`;
  return familyShell(lang, page, c, {
    toc: isEs
      ? [
          ["#who", "Parentesco"],
          ["#lists", "Dueño"],
          ["#group", "Sin póliza grupal"],
          ["#cost", "Costo"],
          ["#faq", "Preguntas"],
        ]
      : [
          ["#who", "Relationship"],
          ["#lists", "Owner list"],
          ["#group", "No group plan"],
          ["#cost", "Cost"],
          ["#faq", "Questions"],
        ],
    inner,
  });
}

/* -------------------------------------------------------------------------- */
/* Find a policy                                                               */
/* -------------------------------------------------------------------------- */

function copyFindPolicy(lang) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const src = sharedSources(isEs);
  if (isEs) {
    return {
      title: "Cómo saber si alguien tenía seguro de vida (localizador NAIC) | Mejor Vida Seguros",
      desc: "Use primero el localizador gratuito de la NAIC. Luego estados, bancos, papeles, empleador y unclaimed.org. No llame al azar a cientos de compañías.",
      h1: "Cómo saber si alguien tenía seguro de vida: empiece por el localizador de la NAIC, no por llamadas al azar",
      lead: "Si una persona ya falleció, no se compra una póliza nueva sobre esa vida. Se busca la que ya existía. La NAIC mantiene un <strong>localizador de pólizas de vida</strong> gratuito: usted envía datos del fallecido y las compañías con licencia en EE. UU. revisan sus archivos. Solo le escriben si hay coincidencia.",
      crumbEnd: "Buscar una póliza",
      take1: "Necesitará datos sensibles del fallecido: nombre legal, fecha de nacimiento, fecha de muerte y, de ser posible, número de Seguro Social. Sin eso, el localizador no puede buscar.",
      take2: "Hay cientos de aseguradoras de vida en el país. <strong>No tiene sentido llamar al azar.</strong> Si no sabe el nombre de la compañía, use el localizador, el banco y los papeles.",
      take3: "Si había una póliza al día, el tiempo transcurrido no cancela el beneficio. Un reclamo tardío todavía se paga a los beneficiarios nombrados. El dinero no reclamado puede acabar en el estado.",
      callout: "Mejor Vida Seguros no opera el localizador de la NAIC. Es un servicio de los comisionados de seguros. Podemos ayudar a leer lo que encuentre y a presentar un reclamo en una compañía designada.",
      naicH: "1. Localizador de pólizas de la NAIC (el primer paso)",
      naicP: "La herramienta está en el sitio de la NAIC. La usa un beneficiario, un albacea o un representante legal. Usted da sus datos de contacto y los del fallecido (incluido si era veterano). La NAIC reenvía la petición a las compañías. Usted no recibe un “no hay nada” de todas: le contactan si encuentran una póliza. Es gratuito y confidencial.",
      mibH: "2. Otras búsquedas (MIB y bienes no reclamados)",
      mibP: "MIB ofrece un servicio de localización de solicitudes, no una confirmación de póliza en vigor. Pide formulario notariado, certificado de defunción original y un pago (en su sitio, un giro o cheque certificado). Si MIB señala compañías donde hubo una solicitud, usted llama a esas — no a las 700. En paralelo, busque en <a href=\"https://unclaimed.org/\" rel=\"noopener\" target=\"_blank\">unclaimed.org</a> (NAUPA): beneficios no reclamados acaban en el estado de residencia.",
      bankH: "3. Extractos del banco y de la tarjeta",
      bankP: "La mayoría de las primas se cobran por cargo automático. Un cargo mensual a “United of Omaha”, “Transamerica”, “Aetna” o un nombre de producto es una pista. Llame a esa compañía con el certificado de defunción. No invente llamadas a marcas al azar.",
      papersH: "4. Papeles y archivos digitales",
      papersP: "Carpetas, cajas fuertes, correos con “póliza” o “certificado”, PDFs en la computadora, aplicaciones de banca. Una hoja de decaimiento o un número de póliza basta para abrir la conversación con la aseguradora.",
      prosH: "5. Agente, abogado, contador, empleador",
      prosP: "El agente que vendió la póliza es el atajo. Un abogado o un contador puede haber visto el contrato. El último empleador (o el de un retiro) puede tener vida grupal: recursos humanos da el nombre de la aseguradora. Eso no aparece siempre en el localizador de pólizas individuales.",
      familyH: "6. Familia y amigos",
      familyP: "Alguien puede recordar “tenía algo con Mutual of Omaha” o dónde guardaba los papeles. Es un complemento, no el método principal.",
      accessH: "Quién puede enterarse de los detalles",
      accessP: "La compañía habla con beneficiarios nombrados, con el albacea o fideicomisario, y a veces con el pariente más cercano según su regla. Si usted no está en el contrato, pueden confirmar el fallecimiento y buscar a los beneficiarios — no le leerán el monto a usted.",
      claimH: "Cómo se cobra",
      claimP: "Hace falta un certificado de defunción (original o copia, según la compañía) y el formulario de reclamo. El pago va al beneficiario, no “a la familia” en abstracto. Si no hay beneficiario vivo, el dinero puede ir al caudal y pasar por sucesión.",
      unclaimedH: "Qué pasa con un beneficio no reclamado",
      unclaimedP: "Las aseguradoras no se enteran solas de cada muerte. Muchos estados les piden cruzar el Death Master File de la Administración del Seguro Social y buscar a los beneficiarios. Si nadie cobra, el dinero puede pasar al estado como bien no reclamado. Por eso unclaimed.org importa años después.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Y si la compañía cambió de nombre o quebró?",
      faq1a: "El departamento de seguros del estado puede decir qué compañía asumió las pólizas. El localizador de la NAIC sigue siendo el primer paso: busca en las compañías con licencia hoy.",
      faq2q: "¿Puedo ser beneficiario y no saberlo?",
      faq2a: "Sí. Las compañías a menudo no tienen su teléfono. Por eso existe el localizador. Si usted compra una póliza para un familiar, dígales a los beneficiarios el nombre de la compañía.",
      faq3q: "¿Me van a llamar ellos cuando alguien muera?",
      faq3a: "No cuente con eso. Ellos necesitan enterarse de la muerte. Usted (o el albacea) avisa.",
      faq4q: "¿Mejor Vida Seguros puede buscar por mí?",
      faq4a: "No sustituimos al localizador de la NAIC. Si encuentra una póliza de una compañía con la que trabajamos, sí podemos orientar el reclamo. Empiece en el enlace de fuentes al final de esta página.",
      nextH: "Siguiente paso",
      nextLead: "Empiece por el localizador gratuito de la NAIC. Si el familiar aún vive y quiere cobertura nueva, vuelva a la guía de familia o llame.",
      nextPrimary: "Abrir el localizador NAIC",
      nextPrimaryHref: "https://eapps.naic.org/life-policy-locator/#/welcome",
      nextMore: `Cobertura nueva para alguien que aún vive: <a href="${L.hub}">para la familia</a>.`,
      discTitle: "Divulgación",
      discBody: sharedDisc(true),
      quoteTitle: "¿Necesita ayuda?",
      quote1: "Reclamo en compañía designada",
      quote2: "O cobertura nueva si aún viven",
      quoteCta: "Hablar con nosotros",
      ...src,
    };
  }
  return {
    title: "How to find out if someone had life insurance (NAIC locator) | Mejor Vida Insurance",
    desc: "Start with the free NAIC Life Policy Locator. Then state registries, bank drafts, papers, an employer, and unclaimed.org. Do not randomly call hundreds of companies.",
    h1: "How to find out if someone had life insurance: start with the NAIC locator, not random phone calls",
    lead: "If a person has already died, you do not buy a new policy on that life. You look for the one that already existed. The NAIC runs a free <strong>Life Insurance Policy Locator</strong>: you submit facts about the deceased, and licensed U.S. life companies search their files. They contact you only if there is a match.",
    crumbEnd: "Find a policy",
    take1: "You will need sensitive facts about the deceased: legal name, date of birth, date of death, and a Social Security number if you have it. Without that, the locator cannot search.",
    take2: "There are hundreds of life insurers in the country. <strong>Random calling does not work.</strong> If you do not know the company name, use the locator, the bank, and the papers.",
    take3: "If a policy was in force, the years since death do not cancel the benefit. A late claim still pays named beneficiaries. Unclaimed money can end up with the state.",
    callout: "Mejor Vida Insurance does not operate the NAIC locator. It is a service of the insurance commissioners. We can help you read what you find and file a claim with an appointed company.",
    naicH: "1. NAIC Life Policy Locator (the first stop)",
    naicP: "The tool lives on the NAIC site. A beneficiary, an executor, or a legal representative uses it. You give your contact details and the deceased’s (including veteran status). The NAIC forwards the request to companies. You do not get a “nothing found” from every carrier: they contact you if they find a policy. It is free and confidential.",
    mibH: "2. Other searches (MIB and unclaimed property)",
    mibP: "MIB offers a policy-locator service that searches applications — not a confirmation that a policy is in force. It asks for a notarized form, an original death certificate, and a fee (on their site, a money order or certified check). If MIB points to companies where someone applied, you call those — not all 700. In parallel, search <a href=\"https://unclaimed.org/\" rel=\"noopener\" target=\"_blank\">unclaimed.org</a> (NAUPA): unclaimed benefits end up with the state of residence.",
    bankH: "3. Bank and card statements",
    bankP: "Most premiums leave as an automatic draft. A monthly charge to “United of Omaha,” “Transamerica,” “Aetna,” or a product name is a lead. Call that company with the death certificate. Do not invent calls to random brands.",
    papersH: "4. Paper files and digital files",
    papersP: "Folders, a safe, email with “policy” or “certificate,” PDFs on a computer, banking apps. A lapse notice or a policy number is enough to open a conversation with the insurer.",
    prosH: "5. Agent, attorney, accountant, employer",
    prosP: "The agent who sold the policy is the shortcut. An attorney or accountant may have seen the contract. A last employer (or a retirement plan) may have group life: HR gives the insurer’s name. That does not always show up in an individual-policy locator.",
    familyH: "6. Family and friends",
    familyP: "Someone may remember “they had something with Mutual of Omaha” or where the papers lived. That is a supplement, not the main method.",
    accessH: "Who is allowed to hear the details",
    accessP: "The company speaks with named beneficiaries, with an executor or trustee, and sometimes with next of kin under its own rule. If you are not on the contract, they may confirm the death and look for beneficiaries — they will not read you the amount.",
    claimH: "How a claim is paid",
    claimP: "You need a death certificate (original or copy, depending on the company) and the claim form. Payment goes to the beneficiary, not to “the family” in the abstract. If no beneficiary is alive, the money may go to the estate and through probate.",
    unclaimedH: "What happens to an unclaimed benefit",
    unclaimedP: "Insurers do not automatically learn of every death. Many states require them to match the Social Security Administration’s Death Master File and look for beneficiaries. If nobody collects, the money can pass to the state as unclaimed property. That is why unclaimed.org still matters years later.",
    faqTitle: "Frequently asked questions",
    faq1q: "What if the company changed names or closed?",
    faq1a: "The state insurance department can tell you which company assumed the policies. The NAIC locator is still the first step: it searches companies licensed today.",
    faq2q: "Could I be a beneficiary and not know it?",
    faq2a: "Yes. Companies often do not have your phone number. That is why the locator exists. If you buy a policy for a relative, tell the beneficiaries the company name.",
    faq3q: "Will they call me when someone dies?",
    faq3a: "Do not count on it. They need to learn of the death. You (or the executor) tell them.",
    faq4q: "Can Mejor Vida Insurance search for me?",
    faq4a: "We do not replace the NAIC locator. If you find a policy with a company we work with, we can help with the claim. Start with the source link at the bottom of this page.",
    nextH: "Next step",
    nextLead: "Start with the free NAIC Policy Locator. If the relative is still living and you want new coverage, go back to the family guide or call.",
    nextPrimary: "Open the NAIC locator",
    nextPrimaryHref: "https://eapps.naic.org/life-policy-locator/#/welcome",
    nextMore: `New coverage for someone still living: <a href="${L.hub}">for family</a>.`,
    discTitle: "Disclosure",
    discBody: sharedDisc(false),
    quoteTitle: "Need help?",
    quote1: "A claim at an appointed company",
    quote2: "Or new coverage if they are still living",
    quoteCta: "Talk with us",
    ...src,
  };
}

function findPolicyMain(lang, page, c) {
  const isEs = lang === "es";
  const L = FAMILY_LINKS[lang];
  const inner = `<section class="lic-section" id="naic">
<h2>${c.naicH}</h2>
<p>${c.naicP}</p>
</section>
<section class="lic-section" id="mib">
<h2>${c.mibH}</h2>
<p>${c.mibP}</p>
</section>
<section class="lic-section" id="bank">
<h2>${c.bankH}</h2>
<p>${c.bankP}</p>
</section>
<section class="lic-section" id="papers">
<h2>${c.papersH}</h2>
<p>${c.papersP}</p>
</section>
<section class="lic-section" id="pros">
<h2>${c.prosH}</h2>
<p>${c.prosP}</p>
</section>
<section class="lic-section" id="family">
<h2>${c.familyH}</h2>
<p>${c.familyP}</p>
</section>
<section class="lic-section" id="access">
<h2>${c.accessH}</h2>
<p>${c.accessP}</p>
</section>
<section class="lic-section" id="claim">
<h2>${c.claimH}</h2>
<p>${c.claimP}</p>
</section>
<section class="lic-section" id="unclaimed">
<h2>${c.unclaimedH}</h2>
<p>${c.unclaimedP}</p>
</section>`;
  return familyShell(lang, page, c, {
    quoteHref: L.contact,
    toc: isEs
      ? [
          ["#naic", "NAIC"],
          ["#bank", "Banco"],
          ["#papers", "Papeles"],
          ["#access", "Quién accede"],
          ["#claim", "Reclamo"],
          ["#faq", "Preguntas"],
        ]
      : [
          ["#naic", "NAIC"],
          ["#bank", "Bank"],
          ["#papers", "Papers"],
          ["#access", "Who can ask"],
          ["#claim", "Claim"],
          ["#faq", "Questions"],
        ],
    inner,
  });
}

module.exports = {
  copyFamilyHub,
  familyHubMain,
  copyParents,
  parentsMain,
  copyGrandparents,
  grandparentsMain,
  copySiblings,
  siblingsMain,
  copyFamilyMembers,
  familyMembersMain,
  copyFindPolicy,
  findPolicyMain,
};
