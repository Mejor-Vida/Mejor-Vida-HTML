/**
 * Lincoln city-page body (after the hero). Required by render-city-coverage-pages.js.
 */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const HOMES = [
  {
    id: "alt",
    name: "Alternative Funeral",
    href: "https://lincolnalternativefuneral.com/our-services/",
    addr: "245 N 27th St, Suite B · 402-429-1450",
  },
  {
    id: "lm",
    name: "Lincoln Memorial",
    href: "https://www.lincolnfh.com/",
    addr: "6800 S 14th St · 402-423-1515",
  },
  {
    id: "wyuka",
    name: "Wyuka",
    href: "https://www.wyuka.com/service-pricing/",
    addr: "3600 O St · 402-474-3600",
  },
  {
    id: "us",
    nameEs: "Estimador (Nebraska)",
    nameEn: "Estimator (Nebraska)",
    href: "../../final-expense-estimator.html",
    addrEs: "Promedios Funeralocity de Nebraska",
    addrEn: "Nebraska Funeralocity averages",
  },
];

function line(labelEs, labelEn, descEs, descEn, cells) {
  return { type: "line", labelEs, labelEn, descEs, descEn, cells };
}

/**
 * Published packages, cheapest typical package to most expensive.
 * First-column copy explains the estimator fields inside (and left out of) each package.
 */
const PACKAGE_ROWS = [
  line(
    "Cremación directa",
    "Direct cremation",
    "Gastos de funeraria para una cremación sin velatorio ni ceremonia: traslado, servicios mínimos del director y tarifa del crematorio. No incluye urna, flores, certificados de defunción, papelería, honorario, catering, varios ni propiedad en cementerio.",
    "Funeral home expenses for a cremation with no viewing or ceremony: transfer, minimum director services, and the crematory fee. Does not include an urn, flowers, death certificates, stationery, honorarium, catering, miscellaneous, or cemetery property.",
    {
      alt: { amt: 1595, es: "Traslado local y tarifa de cremación. Sin urna.", en: "Local transfer and cremation fee. No urn." },
      lm: { amt: 3910, es: "Servicios, traslado, refrigeración y crematorio. Contenedor del comprador.", en: "Services, transfer, refrigeration, and crematory. Purchaser container." },
      wyuka: { amt: 3285, es: "Incluye contenedor y urna temporal.", en: "Includes a container and temporary urn." },
      us: { amt: 2958, es: "Promedio de Nebraska (Funeralocity), el mismo que usa el estimador.", en: "Nebraska average (Funeralocity), the same figure the estimator uses." },
    }
  ),
  line(
    "Entierro inmediato",
    "Immediate burial",
    "Gastos de funeraria para un entierro sin velatorio ni ceremonia: traslado, servicios mínimos del director y transporte al cementerio. No incluye ataúd, bóveda, propiedad en cementerio, apertura/cierre, flores, certificados, papelería, honorario, catering ni varios.",
    "Funeral home expenses for a burial with no visitation or ceremony: transfer, minimum director services, and transport to the cemetery. Does not include a casket, vault, cemetery property, opening/closing, flowers, death certificates, stationery, honorarium, catering, or miscellaneous.",
    {
      alt: { amt: 1805, es: "Retiro, autorizaciones y traslado al cementerio. Ataúd aparte.", en: "Removal, authorizations, and transport to the cemetery. Casket extra." },
      lm: { amt: 4920, es: "Servicios, refrigeración, traslado y transporte al cementerio. Contenedor del comprador.", en: "Services, refrigeration, transfer, and transport to the cemetery. Purchaser container." },
      wyuka: { amt: 3195, es: "Ataúd y lote aparte.", en: "Casket and plot extra." },
      us: { amt: 5467, es: "Promedio de Nebraska (Funeralocity); suele incluir un ataúd básico.", en: "Nebraska average (Funeralocity); often includes a basic casket." },
    }
  ),
  line(
    "Cremación con memorial",
    "Cremation with memorial",
    "Gastos de funeraria para cremación más un memorial o reunión sencilla (sin ataúd presente). En algunas casas la urna va incluida. Propiedad en cementerio, flores, certificados, honorario, catering y varios suelen ir aparte.",
    "Funeral home expenses for cremation plus a memorial or simple gathering (no casket present). An urn is included at some homes. Cemetery property, flowers, death certificates, honorarium, catering, and miscellaneous are usually extra.",
    {
      alt: { amt: 2595, es: "Traslado, director, cremación y memorial. Ataúd aparte.", en: "Transfer, director, cremation, and memorial. Casket extra." },
      lm: { amt: 5795, es: "Paquete Tribute: cremación directa, reunión sencilla y urna. No es suma de la GPL.", en: "Tribute package: direct cremation, simple gathering, and an urn. Not a GPL sum." },
      wyuka: { amt: 3960, es: "Cremación directa más memorial o pie de tumba.", en: "Direct cremation plus memorial or graveside." },
      us: { amt: 6530, es: "Cremación completa de Nebraska (Funeralocity); suele incluir velatorio y ataúd de cremación.", en: "Nebraska full cremation (Funeralocity); typically viewing and a cremation casket." },
    }
  ),
  line(
    "Funeral tradicional con velatorio",
    "Traditional funeral with visitation",
    "Gastos de funeraria para un funeral con visita: director y personal, traslado, embalsamado y arreglo, velatorio, ceremonia y carroza. El ataúd solo va si el paquete de esa casa lo dice (Tribute de Lincoln Memorial sí). Bóveda, propiedad en cementerio, apertura/cierre y la mayoría de extras no van incluidos.",
    "Funeral home expenses for a funeral with visitation: director and staff, transfer, embalming and preparation, viewing, the ceremony, and a hearse. A casket is included only if that home’s package says so (Lincoln Memorial Tribute does). Vault, cemetery property, opening/closing, and most extras are not included.",
    {
      alt: { amt: 3155, es: "1 hora de visita, ceremonia y papelería. Ataúd y bóveda aparte.", en: "1-hour visitation, ceremony, and stationery. Casket and vault extra." },
      lm: { amt: 11935, es: "Paquete Tribute: ya incluye ataúd de $2,795. Sin bóveda ni lote.", en: "Tribute package: already includes a $2,795 casket. No vault or plot." },
      wyuka: { amt: 5800, es: "Funeral con velatorio. Ataúd y lote aparte.", en: "Funeral with visitation. Casket and plot extra." },
      us: { amt: 8620, es: "Entierro completo de Nebraska (Funeralocity); ya mete un ataúd típico.", en: "Nebraska full burial (Funeralocity); already puts in a typical casket." },
    }
  ),
];

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function cellHtml(cell, lang) {
  if (!cell) return "";
  const note = cell.es || cell.en ? (lang === "es" ? cell.es : cell.en) : "";
  if (cell.amt == null) {
    return `<span class="sc-gpl-na">${esc(note)}</span>`;
  }
  const amt =
    cell.amtMax != null
      ? `${money(cell.amt)}–${money(cell.amtMax)}`
      : money(cell.amt);
  return `<span class="sc-gpl-amt">${amt}</span>${
    note ? `<span class="sc-gpl-cell-note">${esc(note)}</span>` : ""
  }`;
}

function tableFromRows(lang, rows, firstCol) {
  const head = HOMES.map((h) => {
    const name = h.name || (lang === "es" ? h.nameEs : h.nameEn);
    const addr = h.addr || (lang === "es" ? h.addrEs : h.addrEn);
    return `            <th scope="col"><a class="text-white" href="${h.href}" rel="noopener" target="_blank">${esc(name)}</a><span class="sc-gpl-home">${esc(addr)}</span></th>`;
  }).join("\n");
  const body = rows
    .map((row) => {
      if (row.type === "group") {
        const label = lang === "es" ? row.labelEs : row.labelEn;
        return `          <tr class="sc-gpl-section"><th scope="colgroup" colspan="5">${esc(label)}</th></tr>`;
      }
      const label = lang === "es" ? row.labelEs : row.labelEn;
      const desc = lang === "es" ? row.descEs : row.descEn;
      const cells = HOMES.map((h) => `            <td>${cellHtml(row.cells[h.id], lang)}</td>`).join("\n");
      return `          <tr>
            <th scope="row"><span class="sc-gpl-field">${esc(label)}</span>${
        desc ? `<span class="sc-gpl-field-desc">${esc(desc)}</span>` : ""
      }</th>
${cells}
          </tr>`;
    })
    .join("\n");
  return `<div class="sc-cost-table-wrap sc-gpl-wrap">
      <table class="sc-cost-table sc-gpl-table">
        <thead>
          <tr>
            <th scope="col">${firstCol}</th>
${head}
          </tr>
        </thead>
        <tbody>
${body}
        </tbody>
      </table>
    </div>`;
}

function packageTable(lang) {
  return tableFromRows(lang, PACKAGE_ROWS, lang === "es" ? "Paquete" : "Package");
}

function analysisCards(lang) {
  const cards =
    lang === "es"
      ? [
          {
            h: "Empiece por el paquete más barato",
            p: "La cremación directa es el atajo más barato que publican: <strong>$1,595</strong> en Alternative, <strong>$3,285</strong> en Wyuka y <strong>$3,910</strong> en Lincoln Memorial. El estimador usa <strong>$2,958</strong> para Nebraska. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
          },
          {
            h: "El mismo nombre de paquete no trae el mismo carrito",
            p: "El funeral tradicional de Alternative (<strong>$3,155</strong>) y el de Wyuka (<strong>$5,800</strong>) son servicios, sin ataúd. El Tribute de Lincoln Memorial (<strong>$11,935</strong>) ya mete un ataúd de $2,795. El promedio de entierro completo de Nebraska (<strong>$8,620</strong>) también suele incluir ataúd.",
          },
          {
            h: "El lote nunca va en estos paquetes",
            p: "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Eso se pide en la oficina. En Lincoln Memorial Park los vendedores de reventa citan unos <strong>$4,000</strong> por un espacio nuevo.",
          },
          {
            h: "Use el estimador para los extras",
            p: "Flores, certificados, papelería, honorario, catering y varios casi nunca vienen en el paquete. El <a href=\"../../final-expense-estimator.html\">estimador de gastos finales</a> los suma aparte, en los mismos campos.",
          },
        ]
      : [
          {
            h: "Start with the least expensive package",
            p: "Direct cremation is the cheapest published shortcut: <strong>$1,595</strong> at Alternative, <strong>$3,285</strong> at Wyuka, and <strong>$3,910</strong> at Lincoln Memorial. The estimator uses <strong>$2,958</strong> for Nebraska. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
          },
          {
            h: "The same package name is not the same cart",
            p: "Alternative’s traditional funeral (<strong>$3,155</strong>) and Wyuka’s (<strong>$5,800</strong>) are services, with no casket. Lincoln Memorial Tribute (<strong>$11,935</strong>) already puts in a $2,795 casket. Nebraska’s full-burial average (<strong>$8,620</strong>) usually includes a casket too.",
          },
          {
            h: "The plot is never in these packages",
            p: "None of the figures in the table are cemetery property or opening/closing. Ask the cemetery office. At Lincoln Memorial Park, resale sellers cite about <strong>$4,000</strong> for a new space.",
          },
          {
            h: "Use the estimator for the extras",
            p: "Flowers, death certificates, stationery, honorarium, catering, and miscellaneous almost never come in the package. The <a href=\"../../final-expense-estimator.html\">final expense estimator</a> adds them separately, in those same fields.",
          },
        ];
  return `<div class="sc-analysis-grid">
${cards
  .map(
    (c) => `      <article class="sc-analysis-card">
        <h3>${esc(c.h)}</h3>
        <p>${c.p}</p>
      </article>`
  )
  .join("\n")}
    </div>`;
}

function calcFields(lang) {
  if (lang === "es") {
    return {
      about: "Sobre usted",
      plan: "Plan de funeral",
      age: "Edad",
      sex: "Sexo",
      female: "Mujer",
      male: "Hombre",
      smoker: "¿Fuma o usa tabaco?",
      smokerNo: "No",
      smokerYes: "Sí",
      service: "Tipo de servicio",
      direct: "Cremación directa",
      memorial: "Cremación con memorial",
      immediate: "Entierro inmediato",
      traditional: "Funeral tradicional con velatorio",
      home: "Funeraria",
      us: "Estimador (Nebraska)",
      plot: "Lote del cementerio",
      plotNone: "Sin lote (cremación, o ya tiene espacio)",
      plotNew: "Nuevo, oficina del cementerio (unos $4,000)",
      plotResale: "Reventa de un particular (unos $2,000)",
      vault: "Sumar una bóveda típica ($1,495)",
      casket: "Sumar un ataúd típico ($2,500) si el paquete no lo trae",
      extra: "Otros gastos (médicos, viajes, certificados)",
      funeral: "Funeral estimado",
      coverage: "Cobertura sugerida",
      premium: "Prima mensual",
      quote: "Cotización gratuita",
      schedule: "Agendar una llamada",
      lead: "Primero se arma el funeral con la tabla. Luego se redondea a una cobertura de gastos finales. La prima mensual sale de las tarifas de compañías designadas, según edad, sexo y tabaco. No es una cotización oficial.",
      loading: "Consultando tarifas…",
    };
  }
  return {
    about: "About you",
    plan: "Funeral plan",
    age: "Age",
    sex: "Sex",
    female: "Female",
    male: "Male",
    smoker: "Do you smoke or use tobacco?",
    smokerNo: "No",
    smokerYes: "Yes",
    service: "Type of service",
    direct: "Direct cremation",
    memorial: "Cremation with memorial",
    immediate: "Immediate burial",
    traditional: "Traditional funeral with visitation",
    home: "Funeral home",
    us: "Estimator (Nebraska)",
    plot: "Cemetery plot",
    plotNone: "No plot (cremation, or you already have a space)",
    plotNew: "New, from the cemetery office (about $4,000)",
    plotResale: "Private-party resale (about $2,000)",
    vault: "Add a typical vault ($1,495)",
    casket: "Add a typical casket ($2,500) if the package does not include one",
    extra: "Other bills (medical, travel, certificates)",
    funeral: "Estimated funeral",
    coverage: "Suggested coverage",
    premium: "Monthly premium",
    quote: "Get a free quote",
    schedule: "Schedule a call",
    lead: "First it builds the funeral from the table. Then it rounds to a final-expense face amount. The monthly premium comes from appointed-company rate charts, using your age, sex, and tobacco use. It is not an official quote.",
    loading: "Looking up rates…",
  };
}

function calcFormHtml(lang, ctx) {
  const L = calcFields(lang);
  const scheduleHref = lang === "es" ? "/schedule-julie.html" : "/en/schedule-julie.html";
  return `<form id="lincoln-fe-calc" class="sc-calc" action="${ctx.quoteHref}" method="get">
      <div class="sc-calc-card">
        <div class="sc-calc-section">
          <p class="sc-calc-kicker">${esc(L.about)}</p>
          <div class="sc-calc-grid sc-calc-grid--you">
            <div class="sc-calc-field">
              <label for="lincoln-age">${esc(L.age)}</label>
              <input id="lincoln-age" name="age" type="number" min="45" max="89" value="70" required/>
            </div>
            <fieldset class="sc-calc-field sc-calc-pills">
              <legend>${esc(L.sex)}</legend>
              <div class="sc-calc-pill-row" role="radiogroup" aria-label="${esc(L.sex)}">
                <label class="sc-calc-pill">
                  <input type="radio" name="sex" value="female" checked/>
                  <span>${esc(L.female)}</span>
                </label>
                <label class="sc-calc-pill">
                  <input type="radio" name="sex" value="male"/>
                  <span>${esc(L.male)}</span>
                </label>
              </div>
            </fieldset>
            <fieldset class="sc-calc-field sc-calc-pills">
              <legend>${esc(L.smoker)}</legend>
              <div class="sc-calc-pill-row" role="radiogroup" aria-label="${esc(L.smoker)}">
                <label class="sc-calc-pill">
                  <input type="radio" name="smoker" value="no" checked/>
                  <span>${esc(L.smokerNo)}</span>
                </label>
                <label class="sc-calc-pill">
                  <input type="radio" name="smoker" value="yes"/>
                  <span>${esc(L.smokerYes)}</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
        <div class="sc-calc-section">
          <p class="sc-calc-kicker">${esc(L.plan)}</p>
          <div class="sc-calc-grid">
            <div class="sc-calc-field">
              <label for="lincoln-service">${esc(L.service)}</label>
              <select id="lincoln-service" name="service">
                <option value="directCremation">${esc(L.direct)}</option>
                <option value="memorialCremation">${esc(L.memorial)}</option>
                <option value="immediateBurial">${esc(L.immediate)}</option>
                <option value="traditional" selected>${esc(L.traditional)}</option>
              </select>
            </div>
            <div class="sc-calc-field">
              <label for="lincoln-home">${esc(L.home)}</label>
              <select id="lincoln-home" name="home">
                <option value="alt">Alternative Funeral</option>
                <option value="lm">Lincoln Memorial</option>
                <option value="wyuka">Wyuka</option>
                <option value="us">${esc(L.us)}</option>
              </select>
            </div>
            <div class="sc-calc-field">
              <label for="lincoln-plot">${esc(L.plot)}</label>
              <select id="lincoln-plot" name="plot">
                <option value="none">${esc(L.plotNone)}</option>
                <option value="new">${esc(L.plotNew)}</option>
                <option value="resale">${esc(L.plotResale)}</option>
              </select>
            </div>
            <div class="sc-calc-field">
              <label for="lincoln-extra">${esc(L.extra)}</label>
              <input id="lincoln-extra" name="extra" type="number" min="0" step="100" value="0"/>
            </div>
            <label class="sc-calc-check" data-casket-wrap>
              <input id="lincoln-casket" name="casket" type="checkbox" checked/>
              <span>${esc(L.casket)}</span>
            </label>
            <label class="sc-calc-check">
              <input id="lincoln-vault" name="vault" type="checkbox"/>
              <span>${esc(L.vault)}</span>
            </label>
          </div>
        </div>
        <div class="sc-calc-results" aria-live="polite">
          <dl>
            <div>
              <dt>${esc(L.funeral)}</dt>
              <dd data-out-funeral>—</dd>
            </div>
            <div>
              <dt>${esc(L.coverage)}</dt>
              <dd data-out-coverage>—</dd>
            </div>
            <div class="sc-calc-premium">
              <dt>${esc(L.premium)}</dt>
              <dd data-out-premium>—</dd>
              <p class="sc-calc-range" data-out-range></p>
            </div>
          </dl>
          <p data-out-note></p>
        </div>
        <div class="sc-calc-actions">
          <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${ctx.quoteHref}">${esc(L.quote)}</a>
          <a class="btn btn-outline-primary px-4 py-3 rounded fw-bold" href="${scheduleHref}">${esc(L.schedule)}</a>
        </div>
      </div>
    </form>`;
}

function guideMain(lang, city, ctx) {
  const { root, quoteHref, stateHref } = ctx;
  const name = lang === "es" ? city.nameEs : city.nameEn;
  const L = calcFields(lang);
  const crumbLabel = lang === "es" ? "Migas de pan" : "Breadcrumb";
  const funeralHref = lang === "es" ? `${root}cuanto-cuesta-un-funeral.html` : `${ctx.en}how-much-does-a-funeral-cost.html`;
  const estimatorHref = lang === "es" ? `${root}final-expense-estimator.html` : `${ctx.en}final-expense-estimator.html`;
  const jsonRel = lang === "es" ? `${root}data/lincoln-plot-resales.json` : `${root}data/lincoln-plot-resales.json`;

  if (lang === "es") {
    return `
<section class="py-4 bg-white border-bottom">
  <div class="container sc-city-prose">
    <nav class="sc-city-crumb" aria-label="${crumbLabel}">
      <a href="${stateHref}">Nebraska</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(name)}</span>
    </nav>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="cobertura">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué es el seguro de gastos finales</h2>
    <p class="text-body-secondary mb-3">Es un <strong>seguro de vida entera</strong> de monto modesto ($5,000 a $25,000 es habitual). El beneficio se paga en <strong>efectivo a su beneficiario</strong>. Sirve para funeral, cremación, deudas médicas y cuentas pequeñas. No es un funeral prepagado: no queda atado a una funeraria ni a un lote.</p>
    <ul class="text-body-secondary ps-3 mb-0">
      <li class="mb-2"><strong>Emisión simplificada:</strong> preguntas de salud, sin examen. Si lo aprueban, el beneficio suele ser completo desde el primer día.</li>
      <li class="mb-2"><strong>Aceptación garantizada:</strong> sin preguntas de salud, con un período de espera de dos o tres años.</li>
      <li class="mb-2"><strong>Primas niveladas</strong> si se pagan a tiempo; la póliza no vence a cierta edad como un temporal.</li>
    </ul>
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="funerarias">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Listas de precios de funerarias en Lincoln</h2>
    <p class="text-body-secondary mb-3">Paquetes publicados, del <strong>más económico al más caro</strong>. Bajo el nombre de cada paquete está lo que incluye — en los mismos campos del <a href="${estimatorHref}">estimador de gastos finales</a> (gastos de funeraria, ataúd, urna, bóveda, lote). Las celdas son el precio de esa casa. La última columna es el promedio de Nebraska que usa el estimador. El lote no va en ninguno.</p>
    ${packageTable("es")}
    <p class="small text-muted mt-3 mb-0">Alternative: página de servicios, 17 sep. 2026. Lincoln Memorial: GPL y paquetes Dignity, 6 ago. 2026. Wyuka: lista de servicios, 30 mar. 2026. Estimador: promedios Funeralocity de Nebraska. Pida siempre la lista actual. No son precios de Mejor Vida Seguros. <a href="${funeralHref}">Guía de costos funerarios</a> · <a href="${estimatorHref}">Estimador de gastos finales</a>.</p>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="comparar">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué cambia de una funeraria a otra</h2>
    <p class="text-body-secondary mb-4">El salto grande es el paquete de servicios. El ataúd solo va si esa casa lo dice; el lote nunca.</p>
    ${analysisCards("es")}
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="cementerios">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">El lote del cementerio es una factura aparte</h2>
    <p class="text-body-secondary mb-3">Los precios de la tabla de arriba son de la <strong>funeraria</strong>. <strong>No incluyen el lote</strong> (el espacio en el terreno).</p>
    <p class="text-body-secondary mb-3">Si hay entierro, el <strong>cementerio cobra por su lado</strong>. Esa factura suele ser:</p>
    <ul class="text-body-secondary ps-3 mb-3">
      <li class="mb-1">el espacio (el lote)</li>
      <li class="mb-1">abrir y cerrar la tumba</li>
      <li class="mb-1">casi siempre una bóveda y una lápida o marcador</li>
    </ul>
    <p class="text-body-secondary mb-4">Eso no va en los paquetes de funeral.</p>
    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">Dónde comprar un lote en Lincoln</h3>
    <p class="text-body-secondary mb-3">El lote se compra en el cementerio. En Lincoln puede llamar a:</p>
    <ul class="text-body-secondary ps-3 mb-3">
      <li class="mb-2"><strong>Lincoln Memorial Park</strong> — mismo terreno que Lincoln Memorial Funeral Home. Teléfono 402-423-1515.</li>
      <li class="mb-2"><strong>Wyuka</strong> — funeraria y cementerio juntos en 3600 O St. Teléfono 402-474-3600.</li>
      <li class="mb-2"><strong>Calvary Catholic Cemetery</strong> — 3880 L St, 402-476-8787. Vende lotes, nichos y mausoleo. No es la misma empresa que Alternative Funeral.</li>
    </ul>
    <p class="text-body-secondary mb-3">Ninguno publica los precios del lote en internet. Hay que llamar y pedir la lista por escrito.</p>
    <p class="text-body-secondary mb-4">Quienes revenden lotes en Lincoln Memorial Park suelen decir que la lista del cementerio está entre <strong>$2,600 y $4,495</strong> por espacio. Lo que más se oye es unos <strong>$4,000</strong>. Abrir y cerrar, bóveda y lápida siguen aparte.</p>

    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">Comprar un lote de reventa (suele salir más barato)</h3>
    <p class="text-body-secondary mb-3">Si alguien ya tiene un lote y no lo va a usar, puede venderlo. El particular casi siempre pide <strong>menos</strong> que la lista del cementerio. El cementerio cobra una transferencia (los anuncios citan <strong>$295–$495</strong>) y debe poner la escritura a nombre del comprador.</p>
    <p class="text-body-secondary mb-3">Abajo hay anuncios recientes. Revise la fecha y confirme el precio con el vendedor y con el cementerio antes de pagar.</p>

    <div id="lincoln-resale-board" data-resale-src="${jsonRel}">
      <p class="small text-muted" data-resale-stats>Cargando anuncios…</p>
      <div class="sc-resale-boards" data-resale-boards></div>
      <div class="sc-resale-grid" data-resale-list>
        <noscript>
          <p>Active JavaScript para ver la captura, o abra <a href="https://eturnalrest.com/cemeteries/ne/lincoln-memorial-cemetery-lincoln/" rel="noopener" target="_blank">Eturnal Rest</a>.</p>
        </noscript>
      </div>
      <p class="small text-muted mt-3 mb-0">Son precios pedidos, no una oferta de Mejor Vida Seguros. Un anuncio de Wyuka a $3,600 por dos lotes ya aparece vendido.</p>
    </div>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="calculadora">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Calcule el funeral, la cobertura y la prima</h2>
    <p class="text-body-secondary mb-4">${L.lead}</p>
    ${calcFormHtml("es", ctx)}
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="metro">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.metroTitleEs)}</h2>
    <p class="text-body-secondary mb-3">${city.metroNoteEs}</p>
    <ul class="sc-city-pills">${city.metroEs.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="licencia-nebraska">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Licencia en Nebraska</h2>
    <p class="text-body-secondary mb-3">Mejor Vida Seguros está autorizado a cotizar y vender seguro de vida en <strong>Nebraska</strong>. Julie Braunsroth es productora residente, NPN #21695431. Esta página no lista otros estados: el mapa y las copias están en <a href="${root}licencias.html">licencias</a>.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-outline-primary" href="#licencia">Ver licencia de Nebraska</a>
      <a class="btn btn-outline-secondary" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=NE&amp;searchType=Licensee&amp;entityType=IND&amp;npn=21695431" target="_blank" rel="noopener">Verificar en la NAIC</a>
    </div>
  </div>
</section>
`;
  }

  return `
<section class="py-4 bg-white border-bottom">
  <div class="container sc-city-prose">
    <nav class="sc-city-crumb" aria-label="${crumbLabel}">
      <a href="${stateHref}">Nebraska</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(name)}</span>
    </nav>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="coverage">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What final expense insurance is</h2>
    <p class="text-body-secondary mb-3">It is <strong>whole life insurance</strong> in a modest amount ($5,000 to $25,000 is typical). The benefit is paid in <strong>cash to your beneficiary</strong>. It can cover a funeral, cremation, medical bills, and small debts. It is not a prepaid funeral: it is not tied to one funeral home or one plot.</p>
    <ul class="text-body-secondary ps-3 mb-0">
      <li class="mb-2"><strong>Simplified issue:</strong> health questions, no exam. If approved, the full benefit usually pays from day one.</li>
      <li class="mb-2"><strong>Guaranteed acceptance:</strong> no health questions, with a two- or three-year waiting period.</li>
      <li class="mb-2"><strong>Level premiums</strong> when paid on time; the policy does not expire at a set age the way term does.</li>
    </ul>
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="funeral-homes">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Lincoln funeral-home price lists</h2>
    <p class="text-body-secondary mb-3">Published packages, from the <strong>least expensive to the most expensive</strong>. Under each package name is what it includes — in the same fields as the <a href="${estimatorHref}">final expense estimator</a> (funeral home expenses, casket, urn, vault, plot). The cells are that home’s price. The last column is the Nebraska average the estimator uses. The burial plot is in none of them.</p>
    ${packageTable("en")}
    <p class="small text-muted mt-3 mb-0">Alternative: services page, 17 Sep 2026. Lincoln Memorial: Dignity GPL and packages, 6 Aug 2026. Wyuka: service list, 30 Mar 2026. Estimator: Nebraska Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices. <a href="${funeralHref}">Funeral cost guide</a> · <a href="${estimatorHref}">Final expense estimator</a>.</p>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="compare">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What changes from one funeral home to another</h2>
    <p class="text-body-secondary mb-4">The real gap is the service package. A casket is included only when that home’s package says so; the plot never is.</p>
    ${analysisCards("en")}
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="cemeteries">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">The burial plot is a separate bill</h2>
    <p class="text-body-secondary mb-3">The prices in the table above are from the <strong>funeral home</strong>. They <strong>do not include a burial plot</strong> (the grave space in the ground).</p>
    <p class="text-body-secondary mb-3">If there is a burial, the <strong>cemetery sends its own bill</strong>. That bill is usually:</p>
    <ul class="text-body-secondary ps-3 mb-3">
      <li class="mb-1">the grave space (the plot)</li>
      <li class="mb-1">opening and closing the grave</li>
      <li class="mb-1">almost always a vault and a grave marker</li>
    </ul>
    <p class="text-body-secondary mb-4">Those items are not in the funeral packages.</p>
    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">Where to buy a plot in Lincoln</h3>
    <p class="text-body-secondary mb-3">You buy the plot from the cemetery. In Lincoln you can call:</p>
    <ul class="text-body-secondary ps-3 mb-3">
      <li class="mb-2"><strong>Lincoln Memorial Park</strong> — same grounds as Lincoln Memorial Funeral Home. Phone 402-423-1515.</li>
      <li class="mb-2"><strong>Wyuka</strong> — funeral home and cemetery together at 3600 O St. Phone 402-474-3600.</li>
      <li class="mb-2"><strong>Calvary Catholic Cemetery</strong> — 3880 L St, 402-476-8787. Sells plots, niches, and mausoleum space. It is not the same company as Alternative Funeral.</li>
    </ul>
    <p class="text-body-secondary mb-3">None of them post plot prices on the website. Call and ask for the current list in writing.</p>
    <p class="text-body-secondary mb-4">People reselling plots at Lincoln Memorial Park often say the cemetery’s own list is <strong>$2,600 to $4,495</strong> per space. <strong>About $4,000</strong> is the number that comes up most. Opening and closing, the vault, and the marker are still extra.</p>

    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">Buying a resale plot (usually cheaper)</h3>
    <p class="text-body-secondary mb-3">If someone already owns a plot and will not use it, they can sell it. Private asking prices are usually <strong>lower</strong> than the cemetery’s list. The cemetery still charges a transfer fee (ads cite <strong>$295–$495</strong>) and must put the deed in the buyer’s name.</p>
    <p class="text-body-secondary mb-3">The ads below are recent listings. Check the date, then confirm the price with the seller and the cemetery before you pay.</p>

    <div id="lincoln-resale-board" data-resale-src="${jsonRel}">
      <p class="small text-muted" data-resale-stats>Loading listings…</p>
      <div class="sc-resale-boards" data-resale-boards></div>
      <div class="sc-resale-grid" data-resale-list>
        <noscript>
          <p>Turn on JavaScript to see the snapshot, or open <a href="https://eturnalrest.com/cemeteries/ne/lincoln-memorial-cemetery-lincoln/" rel="noopener" target="_blank">Eturnal Rest</a>.</p>
        </noscript>
      </div>
      <p class="small text-muted mt-3 mb-0">These are asking prices, not a Mejor Vida Insurance offer. A Wyuka ad at $3,600 for two plots is already marked sold.</p>
    </div>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="calculator">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Estimate the funeral, the coverage, and the premium</h2>
    <p class="text-body-secondary mb-4">${L.lead}</p>
    ${calcFormHtml("en", ctx)}
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="metro">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.metroTitleEn)}</h2>
    <p class="text-body-secondary mb-3">${city.metroNoteEn}</p>
    <ul class="sc-city-pills">${city.metroEn.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="nebraska-license">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Nebraska license</h2>
    <p class="text-body-secondary mb-3">Mejor Vida Insurance is authorized to quote and sell life insurance in <strong>Nebraska</strong>. Julie Braunsroth is a resident producer, NPN #21695431. This page does not list other states: the map and copies are on the <a href="${ctx.en}licenses.html">licenses</a> page.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-outline-primary" href="#license">View Nebraska license</a>
      <a class="btn btn-outline-secondary" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=NE&amp;searchType=Licensee&amp;entityType=IND&amp;npn=21695431" target="_blank" rel="noopener">Verify on the NAIC</a>
    </div>
  </div>
</section>
`;
}

module.exports = { guideMain };
