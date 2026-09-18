/**
 * Canonical city-page body (after the hero). Locked layout — see
 * .cursor/rules/city-page-layout.mdc. City-specific facts live in
 * scripts/city-guides/{slug}.js.
 */
const { funeralHomeCompareNote } = require("../lib/company-compare-disclaimer");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function withEstimator(html, href) {
  return String(html || "").replace(/__ESTIMATOR_HREF__/g, href);
}

function homeHref(home, estimatorHref) {
  return home.estimator ? estimatorHref : home.href;
}

function cellHtml(cell, lang) {
  if (!cell) return "";
  const note = cell.es || cell.en ? (lang === "es" ? cell.es : cell.en) : "";
  if (cell.amt == null) {
    return `<span class="sc-gpl-na">${esc(note)}</span>`;
  }
  const amt =
    cell.amtMax != null ? `${money(cell.amt)}–${money(cell.amtMax)}` : money(cell.amt);
  return `<span class="sc-gpl-amt">${amt}</span>${
    note ? `<span class="sc-gpl-cell-note">${esc(note)}</span>` : ""
  }`;
}

function packageTable(lang, guide, estimatorHref) {
  const homes = guide.homes || [];
  const firstCol = lang === "es" ? "Paquete" : "Package";
  const head = homes
    .map((h) => {
      const name = h.name || (lang === "es" ? h.nameEs : h.nameEn);
      const addr = h.addr || (lang === "es" ? h.addrEs : h.addrEn);
      const href = homeHref(h, estimatorHref);
      return `            <th scope="col"><a class="text-white" href="${href}" ${
        h.estimator ? "" : 'rel="noopener" target="_blank"'
      }>${esc(name)}</a><span class="sc-gpl-home">${esc(addr)}</span></th>`;
    })
    .join("\n");
  const body = (guide.packages || [])
    .map((row) => {
      const label = lang === "es" ? row.labelEs : row.labelEn;
      const desc = lang === "es" ? row.descEs : row.descEn;
      const cells = homes
        .map((h) => `            <td>${cellHtml(row.cells[h.id], lang)}</td>`)
        .join("\n");
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

function analysisCards(lang, guide, estimatorHref) {
  const cards = lang === "es" ? guide.analysisEs : guide.analysisEn;
  return `<div class="sc-analysis-grid">
${(cards || [])
  .map(
    (c) => `      <article class="sc-analysis-card">
        <h3>${esc(c.h)}</h3>
        <p>${withEstimator(c.p, estimatorHref)}</p>
      </article>`
  )
  .join("\n")}
    </div>`;
}

function calcFields(lang, calc) {
  const plotNew = money(calc.plotNew);
  const plotResale = money(calc.plotResale);
  const vault = money(calc.vault);
  const casket = money(calc.casketTypical);
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
      plot: "Lote del cementerio",
      plotNone: "Sin lote (cremación, o ya tiene espacio)",
      plotNew: `Nuevo, oficina del cementerio (unos ${plotNew})`,
      plotResale: `Reventa de un particular (unos ${plotResale})`,
      vault: `Sumar una bóveda típica (${vault})`,
      vaultWhy:
        "La mayoría de los cementerios exigen una bóveda para un entierro en tierra: una caja de concreto o plástico alrededor del ataúd, para que la tumba no se hunda al asentar el ataúd. Casi nunca va en el paquete de la funeraria.",
      casket: `Sumar un ataúd típico (${casket}) si el paquete no lo trae`,
      extra: "Otros gastos (médicos, viajes, certificados)",
      funeral: "Funeral estimado",
      coverage: "Cobertura sugerida",
      premium: "Prima mensual",
      quote: "Cotización gratuita",
      schedule: "Agendar una llamada",
      lead: "Primero se arma el funeral con la tabla. Luego se redondea a una cobertura de gastos finales. La prima mensual sale de las tarifas de compañías designadas, según edad, sexo y tabaco. No es una cotización oficial.",
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
    plot: "Cemetery plot",
    plotNone: "No plot (cremation, or you already have a space)",
    plotNew: `New, from the cemetery office (about ${plotNew})`,
    plotResale: `Private-party resale (about ${plotResale})`,
    vault: `Add a typical vault (${vault})`,
    vaultWhy:
      "Most cemeteries require a vault for a burial in the ground: a concrete or plastic box around the casket so the grave does not sink as the casket settles. It is almost never in the funeral-home package.",
    casket: `Add a typical casket (${casket}) if the package does not include one`,
    extra: "Other bills (medical, travel, certificates)",
    funeral: "Estimated funeral",
    coverage: "Suggested coverage",
    premium: "Monthly premium",
    quote: "Get a free quote",
    schedule: "Schedule a call",
    lead: "First it builds the funeral from the table. Then it rounds to a final-expense face amount. The monthly premium comes from appointed-company rate charts, using your age, sex, and tobacco use. It is not an official quote.",
  };
}

function calcFormHtml(lang, city, ctx) {
  const guide = city.guide;
  const L = calcFields(lang, guide.calc);
  const scheduleHref = lang === "es" ? "/schedule-julie.html" : "/en/schedule-julie.html";
  const defaultService = guide.calc.defaultService || "traditional";
  const defaultHome = guide.calc.defaultHome || ((guide.homes || [])[0] && guide.homes[0].id);
  const sel = (id, cur) => (id === cur ? " selected" : "");
  const homes = (guide.homes || [])
    .map((h) => {
      const name = h.name || (lang === "es" ? h.nameEs : h.nameEn);
      return `                <option value="${esc(h.id)}"${sel(h.id, defaultHome)}>${esc(name)}</option>`;
    })
    .join("\n");
  const config = {
    gpl: guide.calc.gpl,
    plotNew: guide.calc.plotNew,
    plotResale: guide.calc.plotResale,
    vault: guide.calc.vault,
    casketTypical: guide.calc.casketTypical,
    homeIncludesCasket: guide.calc.homeIncludesCasket,
    homeLabels: guide.calc.homeLabels,
    resaleFallback: `/${guide.resaleJson}`,
  };
  return `<form id="city-fe-calc" class="sc-calc" action="${ctx.quoteHref}" method="get">
      <div class="sc-calc-card">
        <div class="sc-calc-section">
          <p class="sc-calc-kicker">${esc(L.about)}</p>
          <div class="sc-calc-grid sc-calc-grid--you">
            <div class="sc-calc-field">
              <label for="city-age">${esc(L.age)}</label>
              <input id="city-age" name="age" type="number" min="45" max="89" value="70" required/>
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
              <label for="city-service">${esc(L.service)}</label>
              <select id="city-service" name="service">
                <option value="directCremation"${sel("directCremation", defaultService)}>${esc(L.direct)}</option>
                <option value="memorialCremation"${sel("memorialCremation", defaultService)}>${esc(L.memorial)}</option>
                <option value="immediateBurial"${sel("immediateBurial", defaultService)}>${esc(L.immediate)}</option>
                <option value="traditional"${sel("traditional", defaultService)}>${esc(L.traditional)}</option>
              </select>
            </div>
            <div class="sc-calc-field">
              <label for="city-home">${esc(L.home)}</label>
              <select id="city-home" name="home">
${homes}
              </select>
            </div>
            <div class="sc-calc-field">
              <label for="city-plot">${esc(L.plot)}</label>
              <select id="city-plot" name="plot">
                <option value="none">${esc(L.plotNone)}</option>
                <option value="new">${esc(L.plotNew)}</option>
                <option value="resale">${esc(L.plotResale)}</option>
              </select>
            </div>
            <div class="sc-calc-field">
              <label for="city-extra">${esc(L.extra)}</label>
              <input id="city-extra" name="extra" type="number" min="0" step="100" value="0"/>
            </div>
            <label class="sc-calc-check" data-casket-wrap>
              <input id="city-casket" name="casket" type="checkbox" checked/>
              <span>${esc(L.casket)}</span>
            </label>
            <div class="sc-calc-check-block" data-vault-wrap>
              <label class="sc-calc-check">
                <input id="city-vault" name="vault" type="checkbox"/>
                <span>${esc(L.vault)}</span>
              </label>
              <p class="sc-calc-hint">${esc(L.vaultWhy)}</p>
            </div>
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
    </form>
    <script type="application/json" id="city-guide-config">${JSON.stringify(config)}</script>`;
}

function guideMain(lang, city, ctx) {
  const guide = city.guide;
  if (!guide) {
    throw new Error(`City ${city.slug} is missing guide data. Copy scripts/city-guides/lincoln.js`);
  }
  const { root, quoteHref, stateHref } = ctx;
  const name = lang === "es" ? city.nameEs : city.nameEn;
  const stateName = lang === "es" ? city.stateNameEs : city.stateNameEn;
  const L = calcFields(lang, guide.calc);
  const crumbLabel = lang === "es" ? "Migas de pan" : "Breadcrumb";
  const funeralHref =
    lang === "es" ? `${root}cuanto-cuesta-un-funeral.html` : `${ctx.en}how-much-does-a-funeral-cost.html`;
  const estimatorHref =
    lang === "es" ? `${root}final-expense-estimator.html` : `${ctx.en}final-expense-estimator.html`;
  const licensesHref = lang === "es" ? `${root}licencias.html` : `${ctx.en}licenses.html`;
  const jsonRel = `${root}${guide.resaleJson}`;
  const offices = lang === "es" ? guide.officesEs : guide.officesEn;
  const officesNote =
    (lang === "es" ? guide.officesNoteEs : guide.officesNoteEn) ||
    (lang === "es"
      ? "Ninguno publica los precios del lote en internet. Hay que llamar y pedir la lista por escrito."
      : "None of them post plot prices on the website. Call and ask for the current list in writing.");
  const tableFoot = lang === "es" ? guide.tableFootEs : guide.tableFootEn;
  const compareLead = lang === "es" ? guide.compareLeadEs : guide.compareLeadEn;
  const newList = lang === "es" ? guide.newListEs : guide.newListEn;
  const resaleFoot = lang === "es" ? guide.resaleFootEs : guide.resaleFootEn;
  const lic = ctx.license || {};
  const licType = lang === "es" ? lic.typeEs : lic.typeEn;
  const npn = ctx.npn || "21695431";

  const ids =
    lang === "es"
      ? {
          fe: "cobertura",
          homes: "funerarias",
          compare: "comparar",
          cem: "cementerios",
          calc: "calculadora",
          lic: `licencia-${city.stateSlug}`,
          licJump: "#licencia",
        }
      : {
          fe: "coverage",
          homes: "funeral-homes",
          compare: "compare",
          cem: "cemeteries",
          calc: "calculator",
          lic: `${city.stateSlug}-license`,
          licJump: "#license",
        };

  if (lang === "es") {
    return `
<section class="py-4 bg-white border-bottom">
  <div class="container sc-city-prose">
    <nav class="sc-city-crumb" aria-label="${crumbLabel}">
      <a href="${stateHref}">${esc(stateName)}</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(name)}</span>
    </nav>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.fe}">
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

<section class="py-5 bg-light border-bottom" id="${ids.homes}">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Listas de precios de funerarias en ${esc(name)}</h2>
    <p class="text-body-secondary mb-3">Paquetes publicados, del <strong>más económico al más caro</strong>. Bajo el nombre de cada paquete está lo que incluye — en los mismos campos del <a href="${estimatorHref}">estimador de gastos finales</a> (gastos de funeraria, ataúd, urna, bóveda, lote). Las celdas son el precio de esa casa. La última columna es el promedio de ${esc(
      stateName
    )} que usa el estimador. El lote no va en ninguno.</p>
    ${packageTable("es", guide, estimatorHref)}
    <p class="small text-muted mt-3 mb-2">${tableFoot} <a href="${funeralHref}">Guía de costos funerarios</a> · <a href="${estimatorHref}">Estimador de gastos finales</a>.</p>
    ${funeralHomeCompareNote("es")}
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.compare}">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué cambia de una funeraria a otra</h2>
    <p class="text-body-secondary mb-4">${esc(compareLead)}</p>
    ${analysisCards("es", guide, estimatorHref)}
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="${ids.cem}">
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
    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">Dónde comprar un lote en ${esc(name)}</h3>
    <p class="text-body-secondary mb-3">El lote se compra en el cementerio. En ${esc(name)} puede llamar a:</p>
    <ul class="text-body-secondary ps-3 mb-3">
${(offices || []).map((o) => `      <li class="mb-2">${o}</li>`).join("\n")}
    </ul>
    <p class="text-body-secondary mb-3">${officesNote}</p>
    <p class="text-body-secondary mb-4">${newList}</p>

    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">Comprar un lote de reventa (suele salir más barato)</h3>
    <p class="text-body-secondary mb-3">Si alguien ya tiene un lote y no lo va a usar, puede venderlo. El particular casi siempre pide <strong>menos</strong> que la lista del cementerio. El cementerio cobra una transferencia (los anuncios citan <strong>$295–$495</strong>) y debe poner la escritura a nombre del comprador.</p>
    <p class="text-body-secondary mb-3">Abajo hay anuncios recientes. Revise la fecha y confirme el precio con el vendedor y con el cementerio antes de pagar.</p>

    <div id="city-resale-board" data-resale-board data-resale-src="${jsonRel}">
      <p class="small text-muted" data-resale-stats>Cargando anuncios…</p>
      <div class="sc-resale-boards" data-resale-boards></div>
      <div class="sc-resale-grid" data-resale-list>
        <noscript>
          <p>Active JavaScript para ver la captura, o abra <a href="${esc(
            guide.resaleNoscriptHref
          )}" rel="noopener" target="_blank">Eturnal Rest</a>.</p>
        </noscript>
      </div>
      <p class="small text-muted mt-3 mb-0">${resaleFoot}</p>
    </div>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.calc}">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Calcule el funeral, la cobertura y la prima</h2>
    <p class="text-body-secondary mb-4">${esc(L.lead)}</p>
    ${calcFormHtml("es", city, ctx)}
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="metro">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.metroTitleEs)}</h2>
    <p class="text-body-secondary mb-3">${city.metroNoteEs}</p>
    <ul class="sc-city-pills">${city.metroEs.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.lic}">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Licencia en ${esc(stateName)}</h2>
    <p class="text-body-secondary mb-3">Mejor Vida Seguros está autorizado a cotizar y vender seguro de vida en <strong>${esc(
      stateName
    )}</strong>. Julie Braunsroth es ${esc(
      String(licType || "productora residente").toLowerCase()
    )}, NPN #${esc(
      npn
    )}. Esta página no lista otros estados: el mapa y las copias están en <a href="${licensesHref}">licencias</a>.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-outline-primary" href="${ids.licJump}">Ver licencia de ${esc(stateName)}</a>
      <a class="btn btn-outline-secondary" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=${esc(
        city.stateCode
      )}&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${esc(npn)}" target="_blank" rel="noopener">Verificar en la NAIC</a>
    </div>
  </div>
</section>
`;
  }

  return `
<section class="py-4 bg-white border-bottom">
  <div class="container sc-city-prose">
    <nav class="sc-city-crumb" aria-label="${crumbLabel}">
      <a href="${stateHref}">${esc(stateName)}</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(name)}</span>
    </nav>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.fe}">
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

<section class="py-5 bg-light border-bottom" id="${ids.homes}">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(name)} funeral-home price lists</h2>
    <p class="text-body-secondary mb-3">Published packages, from the <strong>least expensive to the most expensive</strong>. Under each package name is what it includes — in the same fields as the <a href="${estimatorHref}">final expense estimator</a> (funeral home expenses, casket, urn, vault, plot). The cells are that home’s price. The last column is the ${esc(
    stateName
  )} average the estimator uses. The burial plot is in none of them.</p>
    ${packageTable("en", guide, estimatorHref)}
    <p class="small text-muted mt-3 mb-2">${tableFoot} <a href="${funeralHref}">Funeral cost guide</a> · <a href="${estimatorHref}">Final expense estimator</a>.</p>
    ${funeralHomeCompareNote("en")}
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.compare}">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What changes from one funeral home to another</h2>
    <p class="text-body-secondary mb-4">${esc(compareLead)}</p>
    ${analysisCards("en", guide, estimatorHref)}
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="${ids.cem}">
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
    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">Where to buy a plot in ${esc(name)}</h3>
    <p class="text-body-secondary mb-3">You buy the plot from the cemetery. In ${esc(name)} you can call:</p>
    <ul class="text-body-secondary ps-3 mb-3">
${(offices || []).map((o) => `      <li class="mb-2">${o}</li>`).join("\n")}
    </ul>
    <p class="text-body-secondary mb-3">${officesNote}</p>
    <p class="text-body-secondary mb-4">${newList}</p>

    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">Buying a resale plot (usually cheaper)</h3>
    <p class="text-body-secondary mb-3">If someone already owns a plot and will not use it, they can sell it. Private asking prices are usually <strong>lower</strong> than the cemetery’s list. The cemetery still charges a transfer fee (ads cite <strong>$295–$495</strong>) and must put the deed in the buyer’s name.</p>
    <p class="text-body-secondary mb-3">The ads below are recent listings. Check the date, then confirm the price with the seller and the cemetery before you pay.</p>

    <div id="city-resale-board" data-resale-board data-resale-src="${jsonRel}">
      <p class="small text-muted" data-resale-stats>Loading listings…</p>
      <div class="sc-resale-boards" data-resale-boards></div>
      <div class="sc-resale-grid" data-resale-list>
        <noscript>
          <p>Turn on JavaScript to see the snapshot, or open <a href="${esc(
            guide.resaleNoscriptHref
          )}" rel="noopener" target="_blank">Eturnal Rest</a>.</p>
        </noscript>
      </div>
      <p class="small text-muted mt-3 mb-0">${resaleFoot}</p>
    </div>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.calc}">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Estimate the funeral, the coverage, and the premium</h2>
    <p class="text-body-secondary mb-4">${esc(L.lead)}</p>
    ${calcFormHtml("en", city, ctx)}
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="metro">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.metroTitleEn)}</h2>
    <p class="text-body-secondary mb-3">${city.metroNoteEn}</p>
    <ul class="sc-city-pills">${city.metroEn.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.lic}">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(stateName)} license</h2>
    <p class="text-body-secondary mb-3">Mejor Vida Insurance is authorized to quote and sell life insurance in <strong>${esc(
      stateName
    )}</strong>. Julie Braunsroth is a ${esc(
      String(licType || "resident producer").toLowerCase()
    )}, NPN #${esc(
    npn
  )}. This page does not list other states: the map and copies are on the <a href="${licensesHref}">licenses</a> page.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-outline-primary" href="${ids.licJump}">View ${esc(stateName)} license</a>
      <a class="btn btn-outline-secondary" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=${esc(
        city.stateCode
      )}&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${esc(npn)}" target="_blank" rel="noopener">Verify on the NAIC</a>
    </div>
  </div>
</section>
`;
}

module.exports = { guideMain };
