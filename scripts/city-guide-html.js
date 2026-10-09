/**
 * Canonical city-page body (after the hero). Locked layout — see
 * .cursor/rules/city-page-layout.mdc. City-specific facts live in
 * scripts/city-guides/{slug}.js.
 */
const { funeralHomeCompareNote } = require("../lib/company-compare-disclaimer");
const AFTER_DEATH = require("./city-guides/after-death");

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

function joinTowns(towns, lang) {
  const list = (towns || []).map((n) => String(n || "").trim()).filter(Boolean);
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  const last = list[list.length - 1];
  const rest = list.slice(0, -1).join(", ");
  return lang === "es" ? `${rest} y ${last}` : `${rest}, and ${last}`;
}

function metroServeLine(lang, city) {
  const towns = lang === "es" ? city.metroEs : city.metroEn;
  const places = joinTowns(towns, lang);
  if (!places) return "";
  const stateName = lang === "es" ? city.stateNameEs : city.stateNameEn;
  return lang === "es"
    ? `Mejor Vida Seguros cotiza seguro de gastos finales y de entierro por teléfono para residentes de ${stateName} en ${places}.`
    : `Mejor Vida Insurance quotes final expense and burial insurance by phone for ${stateName} residents in ${places}.`;
}

function withEstimator(html, href) {
  return String(html || "").replace(/__ESTIMATOR_HREF__/g, href);
}

function citySectionIds(lang) {
  return lang === "es"
    ? {
        fe: "cobertura",
        homes: "funerarias",
        compare: "comparar",
        cem: "cementerios",
        calc: "calculadora",
      }
    : {
        fe: "coverage",
        homes: "funeral-homes",
        compare: "compare",
        cem: "cemeteries",
        calc: "calculator",
      };
}

function cityMapIcon(kind) {
  const common = 'xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
  if (kind === "insurance") {
    return `<svg ${common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;
  }
  if (kind === "homes") {
    return `<svg ${common}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>`;
  }
  if (kind === "plot") {
    return `<svg ${common}><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`;
  }
  return `<svg ${common}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h4"/><path d="M16 18h2v4h-2z"/></svg>`;
}

function cityPageOverview(lang, city, ids) {
  const name = lang === "es" ? city.nameEs : city.nameEn;
  const sectionIds = ids || citySectionIds(lang);
  const heading =
    lang === "es"
      ? `Qué hay en esta guía de ${name}`
      : `What’s on this ${name} guide`;
  const lead =
    lang === "es"
      ? "Toque un tema para bajar a esa sección — o siga leyendo en orden."
      : "Tap a topic to jump to that section — or keep reading in order.";
  const jump =
    lang === "es" ? "Ver sección" : "Jump to section";
  const article = /^[AEIOU]/i.test(name) ? "An" : "A";

  const cards =
    lang === "es"
      ? [
          {
            id: sectionIds.fe,
            mod: "fe",
            num: "1",
            icon: "insurance",
            title: "Seguro de gastos finales",
            teaser:
              "Qué es el <strong>seguro de entierro</strong> o <strong>funeral</strong>, cómo paga en <strong>efectivo</strong> y en qué se diferencia del prepagado.",
          },
          {
            id: sectionIds.homes,
            mod: "homes",
            num: "2",
            icon: "homes",
            title: `Precios de funerarias en ${name}`,
            teaser:
              "Tabla de <strong>paquetes publicados</strong>, del más económico al más caro, con notas sobre qué incluye cada uno.",
          },
          {
            id: sectionIds.cem,
            mod: "plot",
            num: "3",
            icon: "plot",
            title: "Lote del cementerio (factura aparte)",
            teaser:
              "El <strong>lote</strong>, la bóveda y la lápida van aparte del funeral; también hay <strong>reventas</strong> que suelen costar menos.",
          },
          {
            id: sectionIds.calc,
            mod: "calc",
            num: "4",
            icon: "calc",
            title: "Calculadora de cobertura",
            teaser:
              "Estime el <strong>costo del funeral</strong>, cuánta <strong>cobertura</strong> necesita y una <strong>prima mensual</strong> orientativa.",
          },
        ]
      : [
          {
            id: sectionIds.fe,
            mod: "fe",
            num: "1",
            icon: "insurance",
            title: "Final expense insurance",
            teaser:
              "What <strong>burial</strong> and <strong>funeral insurance</strong> are, how it pays <strong>cash</strong>, and how it differs from a prepaid plan.",
          },
          {
            id: sectionIds.homes,
            mod: "homes",
            num: "2",
            icon: "homes",
            title: `${article} ${name} funeral-home price table`,
            teaser:
              "Published <strong>package prices</strong>, from least to most expensive, with notes on what each list includes.",
          },
          {
            id: sectionIds.cem,
            mod: "plot",
            num: "3",
            icon: "plot",
            title: "Burial plot (separate bill)",
            teaser:
              "The <strong>plot</strong>, vault, and marker are <strong>not</strong> in the funeral-home package; <strong>resale</strong> listings often cost less.",
          },
          {
            id: sectionIds.calc,
            mod: "calc",
            num: "4",
            icon: "calc",
            title: "Coverage calculator",
            teaser:
              "Estimate <strong>funeral cost</strong>, how much <strong>coverage</strong> you may need, and a sample <strong>monthly premium</strong>.",
          },
        ];

  const cardHtml = cards
    .map(
      (c) => `
    <a class="sc-city-map-card sc-city-map-card--${c.mod}" href="#${esc(c.id)}">
      <span class="sc-city-map-card__num" aria-hidden="true">${c.num}</span>
      <span class="sc-city-map-card__icon">${cityMapIcon(c.icon)}</span>
      <span class="sc-city-map-card__body">
        <span class="sc-city-map-card__title">${esc(c.title)}</span>
        <span class="sc-city-map-card__teaser">${c.teaser}</span>
      </span>
      <span class="sc-city-map-card__go"><span class="visually-hidden">${esc(jump)}</span><span aria-hidden="true">↓</span></span>
    </a>`
    )
    .join("\n");

  return `
<div class="sc-city-page-map" aria-labelledby="sc-city-map-heading">
  <h2 id="sc-city-map-heading" class="sc-city-map-heading">${esc(heading)}</h2>
  <p class="sc-city-map-lead">${esc(lead)}</p>
  <div class="sc-city-map-grid">${cardHtml}
  </div>
</div>`;
}

function feGuideLinks(lang, ctx) {
  if (lang === "es") {
    return {
      whatIs: `${ctx.root}blog/que-es-seguro-gastos-finales.html`,
      planTypes: `${ctx.root}blog/tipos-planes-seguro-gastos-finales.html`,
      whatIsLabel: "Qué es este seguro",
      planTypesLabel: "Tipos de planes de gastos finales",
    };
  }
  return {
    whatIs: "/en/what-is-final-expense-insurance.html",
    planTypes: "/en/types-of-final-expense-plans.html",
    whatIsLabel: "What this insurance is",
    planTypesLabel: "Types of final expense plans",
  };
}

function finalExpenseTypesBlock(lang, ctx) {
  const quote = ctx.quoteHref;
  const { planTypes: plansHref, planTypesLabel: plansLabel } = feGuideLinks(lang, ctx);

  if (lang === "es") {
    return `
    <h3 class="h5 fw-bold mt-4 mb-2 sc-fe-types-heading" style="color:#1a365d;">Cuatro caminos de aprobación (y primas niveladas)</h3>
    <p class="text-body-secondary mb-3">No es lo mismo el <strong>tipo de aprobación</strong> que el <strong>monto de la prima</strong>. Los tres primeros cuadros son cómo la aseguradora aprueba la póliza; el cuarto explica por qué casi todas usan <strong>primas niveladas</strong> de vida entera. Las compañías y los límites de edad cambian; una cotización confirma qué aplica en su caso.</p>
    <div class="sc-fe-type-grid">
      <article class="sc-fe-type-card sc-fe-type-card--simplified">
        <h4 class="sc-fe-type-card__title">Emisión simplificada</h4>
        <p class="sc-fe-type-card__what"><strong>Qué es:</strong> preguntas de salud, <strong>sin examen médico</strong>. Si la aprueban, el beneficio completo suele pagar desde el <strong>primer día</strong>.</p>
        <p class="sc-fe-type-card__fit"><strong>Suele encajar si:</strong> puede responder con honestidad y califica sin espera. Muchas personas entre <strong>unos 50 y 85 años</strong>.</p>
        <p class="sc-fe-type-card__cost"><strong>Costo:</strong> suele ser la <strong>prima más baja</strong> para la misma cobertura.</p>
      </article>
      <article class="sc-fe-type-card sc-fe-type-card--graded">
        <h4 class="sc-fe-type-card__title">Emisión modificada (beneficio escalonado)</h4>
        <p class="sc-fe-type-card__what"><strong>Qué es:</strong> hay preguntas de salud, pero las respuestas <strong>no alcanzan</strong> para beneficio completo desde el día uno. Los primeros <strong>dos o tres años</strong> el pago suele ser un <strong>porcentaje del beneficio</strong> (a veces 30%–40% el primer año, más el segundo) o primas devueltas; después, el <strong>100%</strong>.</p>
        <p class="sc-fe-type-card__fit"><strong>Suele encajar si:</strong> tiene problemas de salud moderados — diabetes con complicaciones, EPOC, insuficiencia cardíaca controlada, etc. — que no califican a simplificada pero no necesitan garantizada.</p>
        <p class="sc-fe-type-card__cost"><strong>Costo:</strong> normalmente <strong>entre</strong> simplificada y garantizada para el mismo monto.</p>
      </article>
      <article class="sc-fe-type-card sc-fe-type-card--guaranteed">
        <h4 class="sc-fe-type-card__title">Aceptación garantizada</h4>
        <p class="sc-fe-type-card__what"><strong>Qué es:</strong> <strong>sin preguntas de salud</strong>. Período de espera de <strong>dos o tres años</strong>: muerte natural antes → primas más interés o porcentaje, no el monto completo.</p>
        <p class="sc-fe-type-card__fit"><strong>Suele encajar si:</strong> oxígeno en casa, diálisis, cáncer reciente u otras respuestas que cierran los otros caminos; o no quiere preguntas médicas.</p>
        <p class="sc-fe-type-card__cost"><strong>Costo:</strong> primas <strong>más altas</strong> que simplificada o modificada para la misma cobertura.</p>
      </article>
      <article class="sc-fe-type-card sc-fe-type-card--whole">
        <h4 class="sc-fe-type-card__title">Primas niveladas (vida entera)</h4>
        <p class="sc-fe-type-card__what"><strong>Qué es:</strong> los tres caminos de arriba casi siempre son <strong>vida entera</strong>: la cuota se fija al contratar y <strong>no sube por cumplir años</strong> si paga a tiempo. No vence como un temporal.</p>
        <p class="sc-fe-type-card__fit"><strong>Suele encajar si:</strong> vive con ingreso fijo y quiere una <strong>cuota mensual predecible</strong> para el funeral y cuentas pequeñas.</p>
        <p class="sc-fe-type-card__cost"><strong>Costo:</strong> depende de <strong>edad, sexo, fumar o no</strong> y del camino de aprobación. Muchas familias cotizan antes del próximo cumpleaños.</p>
      </article>
    </div>
    <p class="text-body-secondary mb-0 mt-3"><a href="${plansHref}">${plansLabel}</a> · <a href="${quote}">Cotización gratuita</a>.</p>`;
  }

  return `
    <h3 class="h5 fw-bold mt-4 mb-2 sc-fe-types-heading" style="color:#1a365d;">Four approval paths (and level premiums)</h3>
    <p class="text-body-secondary mb-3">The <strong>approval path</strong> is not the same as your <strong>monthly price</strong>. The first three boxes are how the insurer approves the policy; the fourth explains why nearly all use <strong>level whole-life premiums</strong>. Carriers and age limits differ; a quote confirms what applies to you.</p>
    <div class="sc-fe-type-grid">
      <article class="sc-fe-type-card sc-fe-type-card--simplified">
        <h4 class="sc-fe-type-card__title">Simplified issue</h4>
        <p class="sc-fe-type-card__what"><strong>What it is:</strong> health questions, <strong>no medical exam</strong>. If approved, the <strong>full benefit</strong> usually pays from <strong>day one</strong>.</p>
        <p class="sc-fe-type-card__fit"><strong>Often the best fit if:</strong> you can answer honestly and qualify without a waiting period. Many people from about <strong>50 to 85</strong>.</p>
        <p class="sc-fe-type-card__cost"><strong>Cost:</strong> usually the <strong>lowest premium</strong> for the same face amount.</p>
      </article>
      <article class="sc-fe-type-card sc-fe-type-card--graded">
        <h4 class="sc-fe-type-card__title">Modified issue (graded benefit)</h4>
        <p class="sc-fe-type-card__what"><strong>What it is:</strong> health questions, but answers <strong>do not qualify</strong> for immediate full coverage. For the first <strong>two or three years</strong>, payout is often a <strong>percentage of the benefit</strong> (sometimes 30%–40% in year one, more in year two) or return of premiums; then <strong>100%</strong>.</p>
        <p class="sc-fe-type-card__fit"><strong>Often the best fit if:</strong> you have moderate health issues—diabetes with complications, COPD, controlled heart failure, etc.—that miss simplified issue but do not need guaranteed acceptance.</p>
        <p class="sc-fe-type-card__cost"><strong>Cost:</strong> typically <strong>between</strong> simplified and guaranteed for the same coverage.</p>
      </article>
      <article class="sc-fe-type-card sc-fe-type-card--guaranteed">
        <h4 class="sc-fe-type-card__title">Guaranteed acceptance</h4>
        <p class="sc-fe-type-card__what"><strong>What it is:</strong> <strong>no health questions</strong>. A <strong>two- or three-year waiting period</strong>: natural death before that ends pays return of premiums plus interest or a percentage—not the full amount.</p>
        <p class="sc-fe-type-card__fit"><strong>Often the best fit if:</strong> home oxygen, dialysis, recent cancer, or other answers that close the other paths—or you do not want health questions.</p>
        <p class="sc-fe-type-card__cost"><strong>Cost:</strong> <strong>higher premiums</strong> than simplified or modified for the same coverage.</p>
      </article>
      <article class="sc-fe-type-card sc-fe-type-card--whole">
        <h4 class="sc-fe-type-card__title">Level premiums (whole life)</h4>
        <p class="sc-fe-type-card__what"><strong>What it is:</strong> all three paths above are almost always <strong>whole life</strong>: the payment is set at issue and <strong>does not rise as you age</strong> when paid on time. It does not expire like term.</p>
        <p class="sc-fe-type-card__fit"><strong>Often the best fit if:</strong> you live on a fixed income and want a <strong>predictable monthly bill</strong> for funeral costs and small debts.</p>
        <p class="sc-fe-type-card__cost"><strong>Cost:</strong> driven by <strong>age, sex, smoker status</strong>, and approval path. Many families quote before the next birthday.</p>
      </article>
    </div>
    <p class="text-body-secondary mb-0 mt-3"><a href="${plansHref}">${plansLabel}</a> · <a href="${quote}">Free quote</a>.</p>`;
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

const GPL_ROWS = [
  {
    key: "dc",
    num: 1,
    tagEs: "Sin velatorio ni ceremonia.",
    tagEn: "No viewing or ceremony.",
  },
  {
    key: "ib",
    num: 2,
    tagEs: "Entierro sin ceremonia en la funeraria.",
    tagEn: "Burial with no funeral-home ceremony.",
  },
  {
    key: "mem",
    num: 3,
    tagEs: "Cremación con memorial o reunión.",
    tagEn: "Cremation plus a memorial gathering.",
  },
  {
    key: "tr",
    num: 4,
    tagEs: "Velatorio y ceremonia.",
    tagEn: "Visitation and ceremony.",
  },
];

function gplQuickScan(lang, guide) {
  const homes = (guide.homes || []).filter((h) => !h.estimator);
  const rows = guide.packages || [];
  if (!homes.length || !rows.length) return "";
  const title =
    lang === "es"
      ? "Vista rápida — del paquete más económico al más caro"
      : "Quick view — least expensive package to most expensive";
  const fromLabel = lang === "es" ? "Desde" : "From";
  const atLabel = lang === "es" ? "en" : "at";
  const cards = rows
    .map((row, i) => {
      const meta = GPL_ROWS[i] || GPL_ROWS[0];
      const label = lang === "es" ? row.labelEs : row.labelEn;
      let min = null;
      let minHome = "";
      for (const h of homes) {
        const cell = row.cells[h.id];
        if (!cell || cell.amt == null) continue;
        if (min == null || cell.amt < min) {
          min = cell.amt;
          minHome = h.name || (lang === "es" ? h.nameEs : h.nameEn) || "";
        }
      }
      if (min == null) return "";
      return `
    <a class="sc-gpl-quick-card sc-gpl-quick-card--${meta.key}" href="#gpl-${meta.key}">
      <span class="sc-gpl-quick-card__num" aria-hidden="true">${meta.num}</span>
      <span class="sc-gpl-quick-card__label">${esc(label)}</span>
      <span class="sc-gpl-quick-card__tag">${esc(lang === "es" ? meta.tagEs : meta.tagEn)}</span>
      <span class="sc-gpl-quick-card__price">${fromLabel} <strong>${money(min)}</strong></span>
      <span class="sc-gpl-quick-card__home">${atLabel} ${esc(minHome)}</span>
    </a>`;
    })
    .filter(Boolean)
    .join("\n");
  if (!cards) return "";
  const note =
    lang === "es"
      ? "Toque una tarjeta para bajar a la tabla. El <strong>lote del cementerio</strong> no va en ningún paquete. La última columna es solo el promedio del estimador."
      : "Tap a card to jump to the table. The <strong>burial plot</strong> is not in any package. The last column is the estimator average only.";
  return `
<div class="sc-gpl-quick" aria-labelledby="gpl-quick-heading">
  <h3 id="gpl-quick-heading" class="sc-gpl-quick-heading">${esc(title)}</h3>
  <div class="sc-gpl-quick-grid">${cards}
  </div>
  <p class="sc-gpl-quick-note">${note}</p>
</div>`;
}

function funeralHomesIntro(lang, name, stateName, estimatorHref) {
  if (lang === "es") {
    return `
    <p class="sc-gpl-section-lead">Precios publicados por funerarias locales, del <strong>más económico al más caro</strong>. Cada fila es un tipo de paquete. Las celdas son el precio de esa casa; la columna gris es el <strong>promedio de ${esc(stateName)}</strong> del estimador — no es una funeraria.</p>
    <ul class="sc-gpl-key-points">
      <li><strong>1–4:</strong> cremación directa → entierro inmediato → cremación con memorial → funeral con velatorio.</li>
      <li><strong>No incluye el lote</strong> del cementerio (ni bóveda ni lápida salvo que la celda lo diga).</li>
      <li>Los mismos campos que el <a href="${estimatorHref}">estimador de gastos finales</a>.</li>
    </ul>`;
  }
  return `
    <p class="sc-gpl-section-lead">Published prices from local funeral homes, from the <strong>least expensive to the most expensive</strong> package. Each row is one package type. Cells are that home’s price; the gray column is the <strong>${esc(stateName)} average</strong> from the estimator — not a funeral home.</p>
    <ul class="sc-gpl-key-points">
      <li><strong>1–4:</strong> direct cremation → immediate burial → cremation with memorial → traditional funeral with visitation.</li>
      <li><strong>Does not include the burial plot</strong> (or vault or marker unless the cell says so).</li>
      <li>Same fields as the <a href="${estimatorHref}">final expense estimator</a>.</li>
    </ul>`;
}

function packageTable(lang, guide, estimatorHref) {
  const homes = guide.homes || [];
  const firstCol = lang === "es" ? "Paquete" : "Package";
  const head = homes
    .map((h) => {
      const name = h.name || (lang === "es" ? h.nameEs : h.nameEn);
      const addr = h.addr || (lang === "es" ? h.addrEs : h.addrEn);
      const href = homeHref(h, estimatorHref);
      return `            <th scope="col" class="${h.estimator ? "sc-gpl-col-estimator" : ""}"><a class="text-white" href="${href}" ${
        h.estimator ? "" : 'rel="noopener" target="_blank"'
      }>${esc(name)}</a><span class="sc-gpl-home">${esc(addr)}</span></th>`;
    })
    .join("\n");
  const detailsLabel =
    lang === "es" ? "Qué incluye este paquete (y qué no)" : "What this package includes (and does not)";
  const scrollHint =
    lang === "es"
      ? "Deslice la tabla hacia la derecha para ver cada funeraria."
      : "Scroll the table sideways to see each funeral home.";
  const body = (guide.packages || [])
    .map((row, i) => {
      const meta = GPL_ROWS[i] || GPL_ROWS[0];
      const label = lang === "es" ? row.labelEs : row.labelEn;
      const desc = lang === "es" ? row.descEs : row.descEn;
      const tag = lang === "es" ? meta.tagEs : meta.tagEn;
      const cells = homes
        .map((h) => {
          const homeName = h.name || (lang === "es" ? h.nameEs : h.nameEn);
          const colClass = h.estimator ? "sc-gpl-col-estimator" : "";
          return `            <td${colClass ? ` class="${colClass}"` : ""} data-home="${esc(homeName)}">${cellHtml(row.cells[h.id], lang)}</td>`;
        })
        .join("\n");
      const details = desc
        ? `<details class="sc-gpl-field-details">
              <summary>${esc(detailsLabel)}</summary>
              <p>${esc(desc)}</p>
            </details>`
        : "";
      return `          <tr class="sc-gpl-row sc-gpl-row--${meta.key}" id="gpl-${meta.key}">
            <th scope="row">
              <span class="sc-gpl-row-badge" aria-hidden="true">${meta.num}</span>
              <span class="sc-gpl-field">${esc(label)}</span>
              <span class="sc-gpl-field-tag">${esc(tag)}</span>
              ${details}
            </th>
${cells}
          </tr>`;
    })
    .join("\n");
  return `<p class="sc-gpl-scroll-hint" aria-hidden="true">${esc(scrollHint)}</p>
    <div class="sc-cost-table-wrap sc-gpl-wrap">
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

function unpublishedHomesHtml(lang, guide, cityName) {
  const homes = guide.unpublishedHomes || [];
  if (!homes.length) return "";
  const title =
    lang === "es" ? `Funerarias en ${cityName}` : `Funeral homes in ${cityName}`;
  const custom = lang === "es" ? guide.unpublishedLeadEs : guide.unpublishedLeadEn;
  const lead =
    custom ||
    (lang === "es"
      ? `Estas funerarias de ${esc(
          cityName
        )} no publican una lista general de precios en internet. Llame y pida la lista general de precios vigente de los servicios.`
      : `These ${esc(
          cityName
        )} funeral homes do not publish a general price list online. Call and ask for the current general price list for services.`);
  const items = homes
    .map((h) => {
      const label = esc(h.name);
      const name = h.href
        ? `<a href="${esc(h.href)}" rel="noopener" target="_blank">${label}</a>`
        : label;
      const phone = lang === "es" ? `Teléfono ${esc(h.phone)}` : `Phone ${esc(h.phone)}`;
      return `      <li class="mb-2"><strong>${name}</strong> — ${esc(h.addr)}. ${phone}.</li>`;
    })
    .join("\n");
  return `<h3 class="h5 fw-bold mt-4 mb-3" style="color:#1a365d;">${esc(title)}</h3>
    <p class="text-body-secondary mb-3">${lead}</p>
    <ul class="text-body-secondary ps-3 mb-0">
${items}
    </ul>`;
}

function plotBillItems(lang, openClose) {
  const es = lang === "es";
  const items = [
    {
      mod: "space",
      title: es ? "El lote (espacio)" : "The plot (grave space)",
      body: es
        ? "El espacio en el terreno del cementerio. Lo cobra el cementerio, no la funeraria."
        : "The space in the cemetery ground. The cemetery bills it, not the funeral home.",
    },
    {
      mod: "open",
      title: es ? "Abrir y cerrar" : "Opening and closing",
      body: openClose
        ? es
          ? `El cementerio abre la tumba para el entierro y la cierra después. Forest Lawn publica <strong>${money(openClose)}</strong> para un entierro con cuerpo (mar. 2025, GPL LA/OC).`
          : `The cemetery opens the grave for burial and closes it afterward. Forest Lawn publishes <strong>${money(openClose)}</strong> for a full burial (Mar 2025, LA/OC GPL).`
        : es
          ? "El cementerio abre la tumba para el entierro y la cierra después. Casi siempre es un cargo aparte."
          : "The cemetery opens the grave for burial and closes it afterward. It is almost always a separate charge.",
    },
    {
      mod: "vault",
      title: es ? "Bóveda" : "Vault",
      body: es
        ? "Casi todos los cementerios exigen una bóveda para entierro en tierra, para que la tumba no se hunda. Casi nunca va en el paquete de la funeraria."
        : "Most cemeteries require a vault for ground burial so the grave does not sink. It is almost never in the funeral-home package.",
    },
    {
      mod: "marker",
      title: es ? "Lápida o marcador" : "Headstone or marker",
      body: es
        ? "La placa o monumento que marca la tumba. El cementerio aprueba tamaño y material y cobra por colocarlo."
        : "The plaque or monument that marks the grave. The cemetery approves size and material and charges to set it.",
    },
  ];
  return items
    .map(
      (it, i) => `      <article class="sc-plot-bill-card sc-plot-bill-card--${it.mod}">
        <span class="sc-plot-bill-card__num" aria-hidden="true">${i + 1}</span>
        <h3 class="sc-plot-bill-card__title">${esc(it.title)}</h3>
        <p class="sc-plot-bill-card__body">${it.body}</p>
      </article>`
    )
    .join("\n");
}

function formatPlotMoney(n) {
  return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function plotPriceRangeChart(lang, range) {
  if (!range || !range.low || !range.mid || !range.high) return "";
  const es = lang === "es";
  const head = es ? range.titleEs : range.titleEn;
  const intro = es ? range.introEs : range.introEn;
  const foot = es ? range.footEs : range.footEn;
  const tiers = [
    { key: "low", mod: "low", data: range.low },
    { key: "mid", mod: "mid", data: range.mid },
    { key: "high", mod: "high", data: range.high },
  ];
  const colLow = es ? "Más bajo" : "Low";
  const colMid = es ? "Típico" : "Typical";
  const colHigh = es ? "Más alto" : "High";
  const labels = { low: colLow, mid: colMid, high: colHigh };
  return `<div class="sc-plot-range">
    <h3 class="sc-plot-subhead">${esc(head)}</h3>
    <p class="sc-plot-sublead">${intro}</p>
    <div class="sc-plot-range-grid" role="group" aria-label="${esc(head)}">
${tiers
  .map(
    (t, i) => `      <article class="sc-plot-range-card sc-plot-range-card--${t.mod}">
        <span class="sc-plot-range-card__tier">${esc(labels[t.key])}</span>
        <p class="sc-plot-range-card__price">${formatPlotMoney(t.data.amount)}</p>
        <p class="sc-plot-range-card__label">${es ? t.data.labelEs : t.data.labelEn}</p>
        <p class="sc-plot-range-card__note">${es ? t.data.noteEs : t.data.noteEn}</p>
      </article>`
  )
  .join("\n")}
    </div>
    <p class="sc-plot-range-foot">${foot}</p>
  </div>`;
}

function plotPublishedCards(lang, rows) {
  if (!rows || !rows.length) return "";
  const es = lang === "es";
  const asOfLabel = es ? "Vigente" : "As of";
  const head = es ? "Precios publicados del espacio (cementerio)" : "Published grave-space prices (cemetery)";
  const intro = es
    ? "Son precios del <strong>cementerio</strong> por el espacio de la tumba (el lote), no de la funeraria. No incluyen abrir/cerrar, bóveda, lápida ni funeral."
    : "These are <strong>cemetery</strong> prices for the grave space (the plot), not the funeral home. They do not include opening/closing, a vault, a marker, or the funeral.";
  return `<div class="sc-plot-published">
    <h3 class="sc-plot-subhead">${esc(head)}</h3>
    <p class="sc-plot-sublead">${intro}</p>
    <div class="sc-plot-cards">
${rows
  .map((row) => {
    const price = es ? row.priceEs : row.priceEn;
    const priceLabel = es ? row.priceLabelEs : row.priceLabelEn;
    const note = es ? row.noteEs : row.noteEn;
    const asOf = es ? row.asOfEs : row.asOfEn;
    const spanLabel = priceLabel || (es ? "Lista del cementerio" : "Cemetery list price");
    const name = row.url
      ? `<a href="${esc(row.url)}" rel="noopener" target="_blank">${esc(row.name)}</a>`
      : esc(row.name);
    const source = row.sourceUrl
      ? `<p class="sc-plot-source"><a href="${esc(row.sourceUrl)}" rel="noopener" target="_blank">${
          es ? row.sourceLabelEs || "Ver lista en PDF" : row.sourceLabelEn || "View price list PDF"
        }</a></p>`
      : "";
    return `      <article class="sc-plot-card sc-plot-card--published">
        <p class="sc-plot-name">${name}</p>
        <p class="sc-plot-price"><span>${esc(spanLabel)}</span> ${esc(price)}</p>
        <p class="sc-plot-note">${note}</p>
        <dl class="sc-plot-facts">
          <div><dt>${asOfLabel}</dt><dd>${esc(asOf)}</dd></div>
        </dl>
        ${source}
      </article>`;
  })
  .join("\n")}
    </div>
  </div>`;
}

function plotOfficeCards(lang, offices, legacyHtml) {
  const es = lang === "es";
  const title = es ? `Dónde comprar un lote` : `Where to buy a plot`;
  const lead = es
    ? "Llame al cementerio, pida la lista general de precios por escrito y confirme qué incluye cada línea."
    : "Call the cemetery, ask for the general price list in writing, and confirm what each line includes.";
  if (offices && offices.length) {
    return `<div class="sc-plot-offices">
      <h3 class="sc-plot-subhead">${esc(title)}</h3>
      <p class="sc-plot-sublead">${lead}</p>
      <div class="sc-plot-office-grid">
${offices
  .map((o) => {
    const name = o.href
      ? `<a href="${esc(o.href)}" rel="noopener" target="_blank">${esc(o.name)}</a>`
      : esc(o.name);
    const note = es ? o.noteEs : o.noteEn;
    const tel = esc(o.phone).replace(/\D/g, "");
    return `        <article class="sc-plot-office-card">
          <h4 class="sc-plot-office-card__name">${name}</h4>
          <p class="sc-plot-office-card__addr">${esc(o.addr)}</p>
          <p class="sc-plot-office-card__phone"><a href="tel:+1${tel}">${esc(o.phone)}</a></p>
          ${note ? `<p class="sc-plot-office-card__note">${note}</p>` : ""}
        </article>`;
  })
  .join("\n")}
      </div>
    </div>`;
  }
  return `<div class="sc-plot-offices">
    <h3 class="sc-plot-subhead">${esc(title)}</h3>
    <p class="sc-plot-sublead">${lead}</p>
    <ul class="sc-plot-office-list text-body-secondary ps-3 mb-0">
${legacyHtml || ""}
    </ul>
  </div>`;
}

function burialPlotSection(lang, name, guide, jsonRel, sectionId) {
  const es = lang === "es";
  const offices = lang === "es" ? guide.officesEs : guide.officesEn;
  const officesNote = lang === "es" ? guide.officesNoteEs : guide.officesNoteEn;
  const newList = lang === "es" ? guide.newListEs : guide.newListEn;
  const resaleFoot = lang === "es" ? guide.resaleFootEs : guide.resaleFootEn;
  const legacyOffices = (offices || []).map((o) => `      <li class="mb-2">${o}</li>`).join("\n");
  const h2 = es ? "El lote del cementerio es una factura aparte" : "The burial plot is a separate bill";
  const callout = es
    ? "Los precios de la tabla de funerarias <strong>no incluyen el lote</strong> (el espacio en el terreno). Si hay entierro, el <strong>cementerio manda su propia factura</strong>."
    : "Funeral-home prices in the table <strong>do not include the burial plot</strong> (the grave space). If there is a burial, the <strong>cemetery sends its own bill</strong>.";
  const billHead = es ? "Qué suele cobrar el cementerio" : "What the cemetery usually bills";
  const billFoot = es
    ? "Eso no va en los paquetes de la funeraria de arriba."
    : "None of that is in the funeral-home packages above.";
  const resaleH = es ? "Comprar un lote de reventa (suele salir más barato)" : "Buying a resale plot (usually cheaper)";
  const resaleLead1 = es
    ? "Si alguien ya tiene un lote y no lo va a usar, puede venderlo. El particular casi siempre pide <strong>menos</strong> que la lista del cementerio."
    : "If someone already owns a plot and will not use it, they can sell it. Private sellers usually ask for <strong>less</strong> than the cemetery’s list price.";
  const resaleLead2 = es
    ? "El cementerio cobra una transferencia (los anuncios citan <strong>$295–$495</strong>) y debe poner la escritura a nombre del comprador. Abajo hay anuncios recientes: revise la fecha y confirme con el vendedor y el cementerio antes de pagar."
    : "The cemetery charges a transfer fee (ads cite <strong>$295–$495</strong>) and must put the deed in the buyer’s name. Recent ads are below — check the date and confirm with the seller and cemetery before you pay.";

  return `<section class="py-5 sc-city-plot-section border-bottom" id="${sectionId}">
  <div class="container sc-city-prose--wide">
    <h2 class="sc-plot-section-title h4 fw-bold mb-3">${esc(h2)}</h2>
    <div class="sc-plot-callout" role="note">
      <p class="mb-0">${callout}</p>
    </div>
    <h3 class="sc-plot-subhead mt-4">${esc(billHead)}</h3>
    <div class="sc-plot-bill-grid">
${plotBillItems(lang, guide.plotOpenClose)}
    </div>
    <p class="sc-plot-bill-foot">${billFoot}</p>
    ${plotPriceRangeChart(lang, guide.plotPriceRange)}
    ${plotPublishedCards(lang, guide.plotPublished)}
    <p class="sc-plot-context">${newList}</p>
    ${officesNote ? `<p class="sc-plot-context sc-plot-context--muted">${esc(officesNote)}</p>` : ""}
    ${plotOfficeCards(lang, guide.plotOffices, legacyOffices)}
    <div class="sc-plot-resale-panel">
      <h3 class="sc-plot-subhead">${esc(resaleH)}</h3>
      <p class="sc-plot-sublead">${resaleLead1}</p>
      <p class="sc-plot-sublead">${resaleLead2}</p>
      <div id="city-resale-board" data-resale-board data-resale-src="${jsonRel}">
        <p class="sc-resale-stats-line" data-resale-stats>${es ? "Cargando anuncios…" : "Loading listings…"}</p>
        <div class="sc-resale-boards" data-resale-boards></div>
        <div class="sc-resale-grid" data-resale-list>
          <noscript>
            <p>${es ? "Active JavaScript para ver la captura, o abra" : "Enable JavaScript to see listings, or open"} <a href="${esc(
              guide.resaleNoscriptHref
            )}" rel="noopener" target="_blank">${es ? "Grave Solutions" : "Grave Solutions"}</a>.</p>
          </noscript>
        </div>
        <p class="sc-resale-foot">${resaleFoot}</p>
      </div>
    </div>
  </div>
</section>`;
}

function analysisCards(lang, guide, estimatorHref) {
  const cards = lang === "es" ? guide.analysisEs : guide.analysisEn;
  const accents = ["blue", "gold", "teal", "violet"];
  return `<div class="sc-analysis-grid sc-analysis-grid--scan">
${(cards || [])
  .map(
    (c, i) => `      <article class="sc-analysis-card sc-analysis-card--${accents[i % accents.length]}">
        <span class="sc-analysis-card__num" aria-hidden="true">${i + 1}</span>
        <h3>${esc(c.h)}</h3>
        <p>${withEstimator(c.p, estimatorHref)}</p>
      </article>`
  )
  .join("\n")}
    </div>`;
}

function calcFields(lang, calc) {
  const hasNew = calc.plotNew != null && calc.plotNew !== "";
  const hasResale = calc.plotResale != null && calc.plotResale !== "";
  const plotNew = hasNew ? money(calc.plotNew) : "";
  const plotResale = hasResale ? money(calc.plotResale) : "";
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
      showPlotNew: hasNew,
      showPlotResale: hasResale,
      plotNew: calc.plotNewLabelEs || `Nuevo, oficina del cementerio (unos ${plotNew})`,
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
      showPlotNew: hasNew,
      showPlotResale: hasResale,
      plotNew: calc.plotNewLabelEn || `New, from the cemetery office (about ${plotNew})`,
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
                ${L.showPlotNew ? `<option value="new">${esc(L.plotNew)}</option>` : ""}
                ${L.showPlotResale ? `<option value="resale">${esc(L.plotResale)}</option>` : ""}
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

function afterDeathSection(lang, city) {
  const rec = AFTER_DEATH[city.stateCode];
  if (!rec) return "";
  const es = lang === "es";
  const id = es ? "despues" : "after-a-death";
  const shops = (city.guide && city.guide.monuments) || [];
  const note = es ? city.guide.monumentNoteEs : city.guide.monumentNoteEn;
  const shopItems = shops
    .map((s) => {
      const name = esc(s.name);
      const label = s.href
        ? `<a href="${esc(s.href)}" rel="noopener" target="_blank">${name}</a>`
        : name;
      return `      <li class="mb-2">${label}. ${esc(s.addr || "")}</li>`;
    })
    .join("\n");
  const shopBlock = shops.length
    ? es
      ? `<p class="text-body-secondary mb-3">Estas casas publican un local. No es la lista completa y no es un ranking.</p>
    <ul class="text-body-secondary ps-3 mb-4">
${shopItems}
    </ul>`
      : `<p class="text-body-secondary mb-3">These companies publish a showroom. This is not every monument company, and it is not a ranking.</p>
    <ul class="text-body-secondary ps-3 mb-4">
${shopItems}
    </ul>`
    : es
      ? `<p class="text-body-secondary mb-4">Pida al cementerio de arriba el reglamento del marcador y la tarifa de colocación. Esta página no nombra una casa de monumentos si esa casa no publica su dirección.</p>`
      : `<p class="text-body-secondary mb-4">Ask the cemetery offices above for the marker rules and the setting fee. This page does not name a monument company unless that company publishes its own address.</p>`;
  const defaultNote = es
    ? "La lápida, el marcador al ras o un monumento se compran aparte del funeral y del lote. El cementerio tiene que aprobar el tamaño y el material, y cobra por colocarlo. El Departamento de Asuntos de Veteranos puede dar un marcador si la persona era veterana."
    : "A headstone, a flush marker, or another monument is bought separately from the funeral and from the plot. The cemetery has to approve the size and material, and it charges to set the stone. The Department of Veterans Affairs may provide a marker if the person was a veteran.";
  return `
<section class="py-5 bg-white border-bottom" id="${id}">
  <div class="container sc-city-prose sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${
      es ? "Qué más hay que arreglar después de la muerte" : "What else to arrange after a death"
    }</h2>
    <p class="text-body-secondary mb-4">${
      es
        ? "El paquete de la funeraria no incluye la lápida, el certificado de defunción ni los trámites de Seguro Social."
        : "The funeral-home package does not include the grave marker, the death certificate copies, or the Social Security paperwork."
    }</p>

    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">${
      es ? "Dónde comprar una lápida o un monumento" : "Where to buy a headstone or other monument"
    }</h3>
    <p class="text-body-secondary mb-3">${note || defaultNote}</p>
    ${shopBlock}

    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">${
      es ? "Certificado de defunción" : "Death certificate"
    }</h3>
    <p class="text-body-secondary mb-4">${es ? rec.detailEs : rec.detailEn} <a href="${esc(
      rec.url
    )}" rel="noopener" target="_blank">${esc(es ? rec.officeEs : rec.officeEn)}</a>.</p>

    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">${
      es ? "Seguro Social" : "Social Security"
    }</h3>
    <p class="text-body-secondary mb-4">${
      es
        ? "La funeraria suele avisar la muerte al Seguro Social. Si no lo hace, llame al 1-800-772-1213 (TTY 1-800-325-0778). Un cónyuge puede recibir un pago único de $255. Si no hay cónyuge, algunos hijos pueden calificar. Hay beneficios mensuales para ciertos familiares. El Seguro Social no paga el mes de la muerte: hay que devolver el pago de ese mes. <a href=\"https://www.ssa.gov/personal-record/when-someone-dies\" rel=\"noopener\" target=\"_blank\">Qué hacer cuando alguien muere</a>."
        : "The funeral home usually reports the death to Social Security. If it does not, call 1-800-772-1213 (TTY 1-800-325-0778). A spouse may get a one-time payment of $255. If there is no spouse, some children may qualify. Monthly survivor benefits are available for certain family members. Social Security does not pay the benefit for the month of death, so that payment has to be returned. <a href=\"https://www.ssa.gov/personal-record/when-someone-dies\" rel=\"noopener\" target=\"_blank\">What to do when someone dies</a>."
    }</p>

    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">${
      es ? "Veteranos, el seguro y el juzgado" : "Veterans, the insurance, and the court"
    }</h3>
    <ul class="text-body-secondary ps-3 mb-0">
      <li class="mb-2">${
        es
          ? "Si la persona era veterana, el Departamento de Asuntos de Veteranos puede ayudar con el entierro y con un marcador. Empiece en <a href=\"https://www.va.gov/burials-memorials/\" rel=\"noopener\" target=\"_blank\">entierros y memoriales de VA</a>."
          : "If the person was a veteran, the Department of Veterans Affairs can help with the burial and with a marker. Start at <a href=\"https://www.va.gov/burials-memorials/\" rel=\"noopener\" target=\"_blank\">VA burials and memorials</a>."
      }</li>
      <li class="mb-2">${
        es
          ? "El beneficiario de un seguro de vida pide el pago con una copia certificada del certificado de defunción. El cheque del seguro de gastos finales no está atado a una funeraria."
          : "A life insurance beneficiary files the claim with a certified death certificate. A final expense check is not tied to one funeral home."
      }</li>
      <li class="mb-2">${
        es
          ? "El tribunal de sucesiones del condado donde vivía la persona tramita el testamento y la herencia. El banco y ese tribunal piden copias certificadas."
          : "The probate court in the county where the person lived handles the will and the estate. The bank and that court ask for certified copies."
      }</li>
    </ul>
  </div>
</section>
`;
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

  const ids = citySectionIds(lang);
  const feLinks = feGuideLinks(lang, ctx);

  if (lang === "es") {
    return `
<section class="py-4 sc-city-intro border-bottom">
  <div class="container sc-city-prose--wide">
    <nav class="sc-city-crumb" aria-label="${crumbLabel}">
      <a href="${stateHref}">${esc(stateName)}</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(name)}</span>
    </nav>
    ${cityPageOverview("es", city, ids)}
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.fe}">
  <div class="container sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué es el seguro de gastos finales</h2>
    <p class="text-body-secondary mb-3">Es un <strong>seguro de vida entera</strong> de monto modesto ($5,000 a $25,000 es habitual). El beneficio se paga en <strong>efectivo a su beneficiario</strong>. Sirve para funeral, cremación, deudas médicas y cuentas pequeñas. No es un funeral prepagado: no queda atado a una funeraria ni a un lote.</p>
    <p class="text-body-secondary mb-3">También se le llama <strong>seguro de entierro</strong> o <strong>seguro funeral</strong>. Es el mismo producto; el nombre no obliga a gastar el cheque en un sepelio concreto. <a href="${feLinks.whatIs}">${feLinks.whatIsLabel}</a>.</p>
    ${finalExpenseTypesBlock("es", ctx)}
  </div>
</section>

<section class="py-5 sc-city-gpl-section bg-light border-bottom" id="${ids.homes}">
  <div class="container sc-city-prose--wide">
    <h2 class="sc-gpl-section-title h4 fw-bold mb-3" style="color:#1a365d;">Listas de precios de funerarias en ${esc(name)}</h2>
    ${funeralHomesIntro("es", name, stateName, estimatorHref)}
    ${gplQuickScan("es", guide)}
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
    ${unpublishedHomesHtml("es", guide, name)}
  </div>
</section>

${burialPlotSection("es", name, guide, jsonRel, ids.cem)}
${afterDeathSection("es", city)}
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
    ${metroServeLine("es", city) ? `<p class="text-body-secondary mb-3">${esc(metroServeLine("es", city))}</p>` : ""}
    <p class="text-body-secondary mb-3">${city.metroNoteEs}</p>
    <ul class="sc-city-pills">${city.metroEs.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>
</section>
`;
  }

  return `
<section class="py-4 sc-city-intro border-bottom">
  <div class="container sc-city-prose--wide">
    <nav class="sc-city-crumb" aria-label="${crumbLabel}">
      <a href="${stateHref}">${esc(stateName)}</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(name)}</span>
    </nav>
    ${cityPageOverview("en", city, ids)}
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="${ids.fe}">
  <div class="container sc-city-prose--wide">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What final expense insurance is</h2>
    <p class="text-body-secondary mb-3">It is <strong>whole life insurance</strong> in a modest amount ($5,000 to $25,000 is typical). The benefit is paid in <strong>cash to your beneficiary</strong>. It can cover a funeral, cremation, medical bills, and small debts. It is not a prepaid funeral: it is not tied to one funeral home or one plot.</p>
    <p class="text-body-secondary mb-3">It is also called <strong>burial insurance</strong> or <strong>funeral insurance</strong>. That is the same smaller permanent life product; the name does not require spending the check on a specific funeral. <a href="${feLinks.whatIs}">${feLinks.whatIsLabel}</a>.</p>
    ${finalExpenseTypesBlock("en", ctx)}
  </div>
</section>

<section class="py-5 sc-city-gpl-section bg-light border-bottom" id="${ids.homes}">
  <div class="container sc-city-prose--wide">
    <h2 class="sc-gpl-section-title h4 fw-bold mb-3" style="color:#1a365d;">${esc(name)} funeral-home price lists</h2>
    ${funeralHomesIntro("en", name, stateName, estimatorHref)}
    ${gplQuickScan("en", guide)}
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
    ${unpublishedHomesHtml("en", guide, name)}
  </div>
</section>

${burialPlotSection("en", name, guide, jsonRel, ids.cem)}
${afterDeathSection("en", city)}
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
    ${metroServeLine("en", city) ? `<p class="text-body-secondary mb-3">${esc(metroServeLine("en", city))}</p>` : ""}
    <p class="text-body-secondary mb-3">${city.metroNoteEn}</p>
    <ul class="sc-city-pills">${city.metroEn.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>
</section>
`;
}

module.exports = { guideMain, joinTowns, metroServeLine };
