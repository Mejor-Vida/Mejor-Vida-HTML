#!/usr/bin/env node
/**
 * Render bilingual state coverage pages for NE, KS, CO, NV.
 * Usage: node scripts/render-state-coverage-pages.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HEADER_ES = path.join(ROOT, "includes/site-header-inner.html");
const HEADER_EN = path.join(ROOT, "includes/en-site-header.html");
const FOOTER_ES = path.join(ROOT, "includes/site-footer-inner.html");
const FOOTER_EN = path.join(ROOT, "includes/en-site-footer.html");
const DETAILED = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "integrations/knowledge/Funeralocity_State_Costs/all-states-detailed.json"),
    "utf8"
  )
);
const DATA = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "integrations/knowledge/Funeralocity_State_Costs/ne-ks-co-nv.json"),
    "utf8"
  )
);
const CARRIER_RATINGS = JSON.parse(
  fs.readFileSync(path.join(ROOT, "integrations/knowledge/carrier-ratings.json"), "utf8")
);
const CAPTURED_AT = (DETAILED.capturedAt || DATA.capturedAt || "").slice(0, 10);

function avgOfBlock(block) {
  if (!block) return 0;
  return Math.round(block.Average != null ? block.Average : block.average || 0);
}

/**
 * Choice Mutual–style state hero. Light-to-dark blue fade with right-side
 * map+seal art; agent bar shows Julie’s license for that state (not authorship).
 */
function stateHero(code, lang, prefix, imgPrefix) {
  const st = DATA.states[code];
  const lic = LICENSE[code];
  const slug = SLUGS[code];
  const name = st.name;
  const short = (DETAILED.states[code] && DETAILED.states[code].short) || {};
  const burialAvg = avgOfBlock(short.fullBurial);
  const cremationAvg = avgOfBlock(short.fullCremation);
  const quoteHref = `${prefix}quote.html`;
  const scheduleHref = lang === "es" ? "/schedule-julie.html" : "/en/schedule-julie.html";
  const heroVer = "map-seal-v11";
  const heroWebp = `${imgPrefix}img/opt/${slug}-hero.webp?v=${heroVer}`;
  const heroJpg = `${imgPrefix}img/opt/${slug}-hero.jpg?v=${heroVer}`;
  const heroPng = `${imgPrefix}img/opt/${slug}-hero.png?v=${heroVer}`;
  const heroDims = { nebraska: [1400, 909], kansas: [1400, 900], colorado: [1400, 900], nevada: [680, 1000] }[slug] || [
    1400, 900,
  ];
  const [heroW, heroH] = heroDims;
  // Nevada uses transparent cutout; Colorado/others use opaque NE-style county maps
  const useTransparentHero = slug === "nevada";
  const heroPicture = useTransparentHero
    ? `<picture>
      <source type="image/webp" srcset="${heroWebp}"/>
      <source type="image/png" srcset="${heroPng}"/>
      <img src="${heroPng}" alt="" width="${heroW}" height="${heroH}" decoding="async" fetchpriority="high"/>
    </picture>`
    : `<picture>
      <source type="image/webp" srcset="${heroWebp}"/>
      <img src="${heroJpg}" alt="" width="${heroW}" height="${heroH}" decoding="async" fetchpriority="high"/>
    </picture>`;

  const title =
    lang === "es"
      ? `Seguro de gastos finales en ${name}`
      : `Final Expense Insurance in ${name}`;

  const bullets =
    lang === "es"
      ? [
          `Un funeral tradicional en ${esc(name)} promedia cerca de <strong>${money(burialAvg)}</strong>; la cremación con servicio cerca de <strong>${money(cremationAvg)}</strong> (Funeralocity).`,
          `Puede comparar cotizaciones de varias aseguradoras — incluidas Assurity, Mutual of Omaha, American Amicable, Corebridge y Transamerica — según su edad, salud y presupuesto.`,
          `Opciones de emisión simplificada o aceptación garantizada según su situación, con primas niveladas.`,
        ]
      : [
          `A traditional burial in ${esc(name)} averages about <strong>${money(burialAvg)}</strong>; full-service cremation about <strong>${money(cremationAvg)}</strong> (Funeralocity).`,
          `Compare quotes from multiple carriers — including Assurity, Mutual of Omaha, American Amicable, Corebridge, and Transamerica — based on your age, health, and budget.`,
          `Simplified-issue or guaranteed-acceptance options when they fit, with level premiums.`,
        ];

  const ctaLabel = lang === "es" ? "Cotización gratuita" : "Get Quotes";
  const ctaSub =
    lang === "es"
      ? `Compare precios de varias compañías en ${name} para encontrar la póliza adecuada.`
      : `Compare prices from multiple companies in ${name} to find the best policy.`;

  const agentLabel =
    lang === "es" ? `Agente licenciada en ${name}` : `Licensed agent in ${name}`;
  const viewLic = lang === "es" ? `Ver licencia (${code})` : `View license (${code})`;
  const naic = lang === "es" ? "Verificar en NAIC" : "Verify on NAIC";
  const basedIn = lang === "es" ? "Con sede en Lincoln, NE" : "Based in Lincoln, NE";
  const julieAlt =
    lang === "es" ? "Julie Braunsroth, agente de seguros" : "Julie Braunsroth, insurance agent";
  const agentBarId = lang === "es" ? "licencia" : "license";

  const bulletHtml = bullets.map((b) => `<li>${b}</li>`).join("\n");

  return `<section class="sc-hero sc-hero--${code.toLowerCase()}" aria-label="${esc(title)}">
  <div class="sc-hero-visual" aria-hidden="true">
    ${heroPicture}
  </div>
  <div class="sc-hero-shade" aria-hidden="true"></div>
  <div class="container sc-hero-inner">
    <div class="sc-hero-copy">
      <h1 class="sc-hero-title">${esc(title)}</h1>
      <ul class="sc-hero-bullets">
${bulletHtml}
      </ul>
      <p class="sc-hero-cta-note">${esc(ctaSub)}</p>
      <div class="sc-hero-cta-row">
        <a class="btn sc-hero-cta" href="${quoteHref}">${esc(ctaLabel)}</a>
        <a class="btn sc-hero-cta-secondary" href="${scheduleHref}">${
    lang === "es" ? "Agendar una llamada" : "Schedule a call"
  }</a>
      </div>
    </div>
  </div>
  <div class="sc-hero-agentbar" id="${agentBarId}">
    <div class="container sc-hero-agentbar-inner">
      <div class="sc-hero-agent-identity">
        <picture class="sc-hero-agent-photo">
          <source type="image/webp" srcset="${imgPrefix}img/opt/julie-headshot.webp"/>
          <img src="${imgPrefix}img/opt/julie-headshot.png" alt="${esc(julieAlt)}" width="96" height="96" loading="lazy" decoding="async"/>
        </picture>
        <div class="sc-hero-agent-meta">
          <p class="sc-hero-agent-kicker mb-1">${esc(agentLabel)}</p>
          <p class="sc-hero-agent-name mb-1"><strong>Julie Braunsroth</strong> · ${esc(
            lang === "es" ? lic.typeEs : lic.typeEn
          )} · ${lang === "es" ? "Licencia" : "License"} <strong>#${esc(lic.number)}</strong></p>
          <p class="sc-hero-agent-npn mb-0">NPN #${NPN} · ${esc(basedIn)}</p>
        </div>
      </div>
      <div class="sc-hero-agent-actions">
        <button type="button" class="btn btn-sm sc-hero-lic-btn" data-mvi-open-license="${esc(code)}">${esc(viewLic)}</button>
        <a class="btn btn-sm sc-hero-lic-btn-outline" href="https://sbs.naic.org/solar-external-lookup/" target="_blank" rel="noopener">${esc(naic)}</a>
      </div>
    </div>
  </div>
</section>`;
}

/** Same header as index.html (Spanish), with paths for /estados/*.html */
function loadHeaderEs(slug) {
  let html = fs.readFileSync(HEADER_ES, "utf8").replace(/__PREFIX__/g, "../");
  html = html.replace(
    /href="\/en\/"(?=[^>]*mvi-lang-fab)/,
    `href="/en/states/${slug}.html"`
  );
  // Fallback if attribute order differs
  html = html.replace(
    /(<a href=")\/en\/(" class="mvi-lang-fab)/,
    `$1/en/states/${slug}.html$2`
  );
  return html;
}

/**
 * Same header as en/index.html, adapted for /en/states/*.html depth
 * (en-site-header assumes pages live directly under /en/).
 */
function loadHeaderEn(slug) {
  let html = fs.readFileSync(HEADER_EN, "utf8");
  // Root assets / shared pages: ../ → ../../
  html = html.replace(/((?:href|src|srcset)=")(\.\.\/)/g, "$1../../");
  // EN sibling pages (quote.html, states/…, etc.): prefix ../
  html = html.replace(
    /((?:href|src|srcset)=")(?!https?:|\/|#|\.\.)([^"]+)/g,
    "$1../$2"
  );
  html = html.replace(
    /(<a href=")[^"]+(" class="mvi-lang-fab)/,
    `$1/estados/${slug}.html$2`
  );
  return html;
}

/** Same footer as index.html (Spanish), paths for /estados/*.html */
function loadFooterEs() {
  return fs.readFileSync(FOOTER_ES, "utf8").replace(/__PREFIX__/g, "../");
}

/** Same footer as en/index.html, paths for /en/states/*.html */
function loadFooterEn() {
  return fs
    .readFileSync(FOOTER_EN, "utf8")
    .replace(/__ASSET__/g, "../../")
    .replace(/__PAGE__/g, "../");
}

const LICENSE = {
  NE: { typeEs: "Productora residente", typeEn: "Resident producer", number: "21695431", pdf: "julie-license-ne.pdf" },
  KS: { typeEs: "Productora no residente", typeEn: "Non-resident producer", number: "21695431", pdf: "julie-license-ks.pdf" },
  CO: { typeEs: "Productora no residente", typeEn: "Non-resident producer", number: "955378", pdf: "julie-license-co.pdf" },
  NV: { typeEs: "Productora no residente", typeEn: "Non-resident producer", number: "4237259", pdf: "julie-license-nv.pdf" },
};

const SLUGS = {
  NE: "nebraska",
  KS: "kansas",
  CO: "colorado",
  NV: "nevada",
};

const NPN = "21695431";

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function licenseModal(lang) {
  const title = lang === "es" ? "Licencia" : "License";
  const openTab = lang === "es" ? "Abrir en pestaña" : "Open in new tab";
  const close = lang === "es" ? "Cerrar" : "Close";
  const closeAria = lang === "es" ? "Cerrar" : "Close";
  return `<div id="mvi-lic-modal" class="mvi-lic-modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="mvi-lic-modal-title">
  <div class="mvi-lic-modal">
    <div class="mvi-lic-modal-head">
      <h2 id="mvi-lic-modal-title">${title}</h2>
      <button type="button" class="mvi-lic-modal-close" id="mvi-lic-modal-close" aria-label="${closeAria}">×</button>
    </div>
    <div class="mvi-lic-modal-body" id="mvi-lic-modal-body"></div>
    <div class="mvi-lic-modal-foot">
      <a class="btn btn-outline-primary" id="mvi-lic-modal-open-tab" href="#" target="_blank" rel="noopener">${openTab}</a>
      <button type="button" class="btn btn-secondary" id="mvi-lic-modal-close-2">${close}</button>
    </div>
  </div>
</div>`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stateLinks(lang, currentSlug, prefix) {
  return Object.keys(SLUGS)
    .map((code) => {
      const slug = SLUGS[code];
      const name = DATA.states[code].name;
      const href =
        lang === "es"
          ? `${prefix}${slug}.html`
          : `${prefix}${slug}.html`;
      const cls = slug === currentSlug ? " fw-bold" : "";
      return `<a class="text-decoration-none${cls}" href="${href}">${esc(name)}</a>`;
    })
    .join('<span class="text-body-secondary mx-2">·</span>');
}

function starsHtml(score) {
  const full = Math.min(5, Math.floor(score + 1e-9));
  const frac = score - full;
  const parts = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) parts.push('<span class="sc-star sc-star--on" aria-hidden="true">★</span>');
    else if (i === full && frac >= 0.25) parts.push('<span class="sc-star sc-star--half" aria-hidden="true">★</span>');
    else parts.push('<span class="sc-star sc-star--off" aria-hidden="true">★</span>');
  }
  return parts.join("");
}

function scoreDisplay(score) {
  const n = Math.round(Number(score) * 100) / 100;
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "");
}

function carriersRankedTable(lang, imgPrefix, pagePrefix) {
  const carriers = [...CARRIER_RATINGS.carriers].sort((a, b) => a.rank - b.rank);
  const thInsurer = lang === "es" ? "Aseguradora" : "Insurer";
  const thDetails = lang === "es" ? "Detalles del plan" : "Policy details";
  const thStrength = lang === "es" ? "Solidez financiera" : "Financial strength";
  const thScore = lang === "es" ? "Calificación" : "Score";
  const outlookLabel = lang === "es" ? "Perspectiva" : "Outlook";
  const reviewLabel = lang === "es" ? "Ver perfil" : "View profile";
  const updated = CARRIER_RATINGS.updatedAt || "";

  const rows = carriers
    .map((c) => {
      const pageHref =
        lang === "es"
          ? `${imgPrefix}carriers/${c.slug}.html`
          : `${pagePrefix}carriers/${c.slug}.html`;
      const logoSrc = `${imgPrefix}${c.logo}${c.slug === "transamerica" ? "?v=20260723-nobg" : ""}`;
      const product = lang === "es" ? c.productEs : c.productEn;
      const coverage = lang === "es" ? c.coverageEs : c.coverageEn;
      const ages = lang === "es" ? c.agesEs : c.agesEn;
      const waiting = lang === "es" ? c.waitingEs : c.waitingEn;
      const issuer = lang === "es" ? c.issuerEs : c.issuerEn;
      const why = lang === "es" ? c.scoreWhyEs : c.scoreWhyEn;
      const amDesc =
        lang === "es"
          ? ({ Superior: "Superior", Excellent: "Excelente" }[c.amBest.descriptor] || c.amBest.descriptor)
          : c.amBest.descriptor;
      const outlook =
        lang === "es"
          ? ({
              Stable: "Estable",
              "Under Review — Developing": "En revisión — en desarrollo",
            }[c.amBest.outlook] || c.amBest.outlook)
          : c.amBest.outlook;
      const other =
        (c.otherRatings || [])
          .map((r) => {
            const note = lang === "es" ? r.noteEs : r.noteEn;
            return `<li><strong>${esc(r.agency)}</strong>: ${esc(r.rating)}${
              note ? ` <span class="text-body-secondary">(${esc(note)})</span>` : ""
            }</li>`;
          })
          .join("") || "";
      const scoreNice = scoreDisplay(c.score);

      return `<tr class="sc-carrier-row">
  <td class="sc-carrier-insurer" data-label="${esc(thInsurer)}">
    <div class="sc-carrier-insurer-inner">
      <span class="sc-carrier-rank" aria-hidden="true">${c.rank}</span>
      <a class="sc-carrier-logo-link" href="${pageHref}">
        <img src="${logoSrc}" alt="" width="${c.logoWidth}" height="${c.logoHeight}" loading="lazy" decoding="async"/>
        <span class="sc-carrier-name">${esc(c.name)}</span>
      </a>
      <p class="sc-carrier-issuer mb-0">${esc(issuer)}</p>
      <a class="sc-carrier-profile" href="${pageHref}">${esc(reviewLabel)} →</a>
    </div>
  </td>
  <td class="sc-carrier-details" data-label="${esc(thDetails)}">
    <p class="sc-carrier-product mb-1"><strong>${esc(product)}</strong></p>
    <ul class="sc-carrier-detail-list">
      <li>${esc(coverage)}</li>
      <li>${esc(ages)}</li>
      <li>${esc(waiting)}</li>
    </ul>
  </td>
  <td class="sc-carrier-strength" data-label="${esc(thStrength)}">
    <p class="sc-carrier-ambest mb-1">
      <span class="sc-carrier-ambest-label">AM Best</span>
      <strong class="sc-carrier-fsr">${esc(c.amBest.fsr)}</strong>
      <span class="sc-carrier-fsr-desc">(${esc(amDesc)})</span>
    </p>
    <p class="sc-carrier-outlook mb-1">${esc(outlookLabel)}: <strong>${esc(outlook)}</strong></p>
    <p class="sc-carrier-asof mb-2 small text-body-secondary">${
      lang === "es" ? "Vigente" : "Effective"
    }: ${esc(c.amBest.effective)} · <a href="${esc(c.amBest.sourceUrl)}" target="_blank" rel="noopener">${
        lang === "es" ? "Fuente" : "Source"
      }</a></p>
    ${other ? `<ul class="sc-carrier-other mb-0">${other}</ul>` : ""}
  </td>
  <td class="sc-carrier-score" data-label="${esc(thScore)}">
    <div class="sc-carrier-score-num"><strong>${esc(scoreNice)}</strong><span>/5</span></div>
    <div class="sc-carrier-stars" aria-label="${esc(scoreNice)} / 5">${starsHtml(c.score)}</div>
    <p class="sc-carrier-score-why mb-0">${esc(why)}</p>
  </td>
</tr>`;
    })
    .join("\n");

  const sourceLinks = (CARRIER_RATINGS.sources || [])
    .map(
      (s) =>
        `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a> — ${esc(
          lang === "es" ? s.whatEs : s.whatEn
        )}</li>`
    )
    .join("\n");

  const method = lang === "es" ? CARRIER_RATINGS.methodology.es : CARRIER_RATINGS.methodology.en;

  return `<div class="table-responsive sc-carrier-table-wrap">
  <table class="table sc-carrier-table align-middle mb-0">
    <thead>
      <tr>
        <th scope="col">${esc(thInsurer)}</th>
        <th scope="col">${esc(thDetails)}</th>
        <th scope="col">${esc(thStrength)}</th>
        <th scope="col">${esc(thScore)}</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</div>
<p class="small text-muted mt-3 mb-2">${esc(method)} ${
    lang === "es" ? "Datos actualizados" : "Data updated"
  }: ${esc(updated)}.</p>
<details class="sc-carrier-sources">
  <summary>${lang === "es" ? "Fuentes de calificación (reputables)" : "Rating sources (reputable)"}</summary>
  <ul class="small text-body-secondary mb-0 mt-2">
${sourceLinks}
  </ul>
</details>`;
}

function carriersEs(prefix) {
  return carriersRankedTable("es", prefix, prefix);
}

function carriersEn(imgPrefix, pagePrefix) {
  return carriersRankedTable("en", imgPrefix, pagePrefix);
}

function costTable(code, lang) {
  return detailedCostPanels(code, lang);
}

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
}

function moneyOrDash(v) {
  const x = n(v);
  return x == null ? "—" : money(x);
}

function componentRowsHtml(rows) {
  return rows
    .map(([label, min, max, avg, avgOnly]) => {
      if (avgOnly) {
        return `<tr>
  <td>${esc(label)}</td>
  <td class="text-end text-body-secondary">—</td>
  <td class="text-end text-body-secondary">—</td>
  <td class="text-end fw-semibold">${moneyOrDash(avg)}</td>
</tr>`;
      }
      return `<tr>
  <td>${esc(label)}</td>
  <td class="text-end">${moneyOrDash(min)}</td>
  <td class="text-end">${moneyOrDash(max)}</td>
  <td class="text-end fw-semibold">${moneyOrDash(avg)}</td>
</tr>`;
    })
    .join("\n");
}

function costAccordionPanel({ id, open, title, packageMin, packageMax, packageAvg, rows, lang }) {
  const thService = lang === "es" ? "Tipo de servicio" : "Service type";
  const thLow = lang === "es" ? "Bajo" : "Low";
  const thHigh = lang === "es" ? "Alto" : "High";
  const thAvg = lang === "es" ? "Promedio" : "Average";
  const openAttr = open ? " open" : "";
  return `<details class="sc-cost-panel"${openAttr} id="${esc(id)}">
  <summary class="sc-cost-summary">
    <span class="sc-cost-summary-title">${esc(title)}</span>
    <span class="sc-cost-summary-range">
      <span class="sc-cost-chip sc-cost-chip--low">${moneyOrDash(packageMin)}</span>
      <span class="sc-cost-chip sc-cost-chip--high">${moneyOrDash(packageMax)}</span>
      <span class="sc-cost-chip sc-cost-chip--avg">${moneyOrDash(packageAvg)}</span>
    </span>
  </summary>
  <div class="sc-cost-panel-body table-responsive">
    <table class="table table-bordered align-middle state-coverage-cost-table sc-cost-detail-table mb-0">
      <thead>
        <tr>
          <th>${thService}</th>
          <th class="text-end">${thLow}</th>
          <th class="text-end">${thHigh}</th>
          <th class="text-end">${thAvg}</th>
        </tr>
      </thead>
      <tbody>
${componentRowsHtml(rows)}
      </tbody>
    </table>
  </div>
</details>`;
}

/** Funeralocity-style Low / High / Average component breakdowns (accordion). */
function detailedCostPanels(code, lang) {
  const entry = DETAILED.states[code];
  if (!entry) return "";
  const short = entry.short || {};
  const d = entry.detailed || {};
  const tb = d.traditionalBurial || {};
  const fc = d.fullCremation || {};
  const ab = d.affordableBurial || {};
  const dc = d.directCremation || {};

  const titles =
    lang === "es"
      ? {
          burial: "Entierro con servicio completo (tradicional)",
          cremation: "Cremación con servicio completo",
          affordable: "Entierro asequible / directo",
          direct: "Cremación directa",
        }
      : {
          burial: "Traditional full-service burial",
          cremation: "Full-service cremation",
          affordable: "Affordable / direct burial",
          direct: "Direct cremation",
        };

  const L =
    lang === "es"
      ? {
          basic: "Servicios básicos",
          transfer: "Traslado a la funeraria",
          embalming: "Embalsamado",
          dressing: "Vestido y colocación en ataúd",
          viewing: "Velatorio / visita",
          funeral: "Servicio funerario",
          hearse: "Carroza",
          utility: "Vehículo de servicio",
          medianCasket: "Ataúd de precio medio*",
          base: "Servicios básicos",
          crematory: "Tarifa de crematorio",
          transferCrem: "Traslado al crematorio",
          cremationCasket: "Ataúd para cremación (promedio)*",
          immediate: "Entierro inmediato",
          basicCasket: "Ataúd básico*",
          directCrem: "Cremación directa",
        }
      : {
          basic: "Basic Services",
          transfer: "Transfer to Funeral Home",
          embalming: "Embalming",
          dressing: "Dressing & Casketing",
          viewing: "Viewing & Visitation",
          funeral: "Funeral Service",
          hearse: "Hearse",
          utility: "Utility Vehicle",
          medianCasket: "Median-priced Casket*",
          base: "Basic Services",
          crematory: "Crematory Fee",
          transferCrem: "Transfer to Crematory",
          cremationCasket: "Cremation Casket (average)*",
          immediate: "Immediate Burial",
          basicCasket: "Basic Casket*",
          directCrem: "Direct Cremation",
        };

  const burialRows = [
    [L.basic, tb.Min_Basic_Services, tb.Max_Basic_Services, tb.Basic_Services],
    [L.transfer, tb.Min_Pricing_Transfer_Home, tb.Max_Pricing_Transfer_Home, tb.Pricing_Transfer_Home],
    [L.embalming, tb.Min_Pricing_Embaliming, tb.Max_Pricing_Embaliming, tb.Pricing_Embaliming],
    [L.dressing, tb.Min_Pricing_Dressing_Casketing, tb.Max_Pricing_Dressing_Casketing, tb.Pricing_Dressing_Casketing],
    [L.viewing, tb.Min_Pricing_Viewing, tb.Max_Pricing_Viewing, tb.Pricing_Viewing],
    [L.funeral, tb.Min_Pricing_Funeral, tb.Max_Pricing_Funeral, tb.Pricing_Funeral],
    [L.hearse, tb.Min_Pricing_Hearse, tb.Max_Pricing_Hearse, tb.Pricing_Hearse],
    [L.utility, tb.Min_Pricing_Utility_Vehicle, tb.Max_Pricing_Utility_Vehicle, tb.Pricing_Utility_Vehicle],
    [L.medianCasket, null, null, tb.MedianPricedCasketAverage, true],
  ];

  const cremationRows = [
    [L.base, fc.Min_Pricing_Base_Services, fc.Max_Pricing_Base_Services, fc.Pricing_Base_Services],
    [L.transfer, fc.Min_Pricing_Transfer_Home, fc.Max_Pricing_Transfer_Home, fc.Pricing_Transfer_Home],
    [L.embalming, fc.Min_Pricing_Embaliming, fc.Max_Pricing_Embaliming, fc.Pricing_Embaliming],
    [L.dressing, fc.Min_Pricing_Dressing_Casketing, fc.Max_Pricing_Dressing_Casketing, fc.Pricing_Dressing_Casketing],
    [L.viewing, fc.Min_Pricing_Viewing, fc.Max_Pricing_Viewing, fc.Pricing_Viewing],
    [L.funeral, fc.Min_Pricing_Funeral, fc.Max_Pricing_Funeral, fc.Pricing_Funeral],
    [L.transferCrem, fc.Min_Pricing_Transfer_Crematory, fc.Max_Pricing_Transfer_Crematory, fc.Pricing_Transfer_Crematory],
    [L.crematory, fc.Min_Pricing_Crematory_Fee, fc.Max_Pricing_Crematory_Fee, fc.Pricing_Crematory_Fee],
    [L.cremationCasket, null, null, fc.CremationCasketAverage, true],
  ];

  const affordableRows = [
    [L.immediate, ab.Min_Pricing_Immediate_Burial, ab.Max_Pricing_Immediate_Burial, ab.Pricing_Immediate_Burial],
    [L.basicCasket, null, null, ab.BasicCasket, true],
  ];

  const directRows = [
    [L.directCrem, dc.Min_Pricing_Direct_Cremation, dc.Max_Pricing_Direct_Cremation, dc.Pricing_Direct_Cremation],
    [L.transferCrem, dc.Min_Pricing_Transfer_Crematory, dc.Max_Pricing_Transfer_Crematory, dc.Pricing_Transfer_Crematory],
    [L.crematory, dc.Min_Pricing_Crematory_Fee, dc.Max_Pricing_Crematory_Fee, dc.Pricing_Crematory_Fee],
  ];

  const thService = lang === "es" ? "Tipo de servicio" : "Service type";
  const thLow = lang === "es" ? "Bajo" : "Low";
  const thHigh = lang === "es" ? "Alto" : "High";
  const thAvg = lang === "es" ? "Promedio" : "Average";

  const descriptions =
    lang === "es"
      ? [
          {
            title: titles.burial,
            body:
              "El entierro con servicio completo tradicional incluye la tarifa básica de la funeraria, embalsamado y cuidado del cuerpo, un velatorio o visita antes del funeral, un servicio en iglesia o capilla de la funeraria, la procesión al cementerio y un servicio de sepultura. Se incluye el costo promedio de un ataúd.",
          },
          {
            title: titles.cremation,
            body:
              "La cremación con servicio completo incluye un velatorio o visita antes del funeral, un servicio en iglesia o capilla de la funeraria y los servicios básicos de cremación, que incluyen el traslado del fallecido desde el lugar del deceso, el traslado al crematorio y la cremación. Se incluye el costo promedio de un ataúd para cremación. Si no se compró una urna por separado, las cenizas suelen devolverse a la familia en una caja de cartón.",
          },
          {
            title: titles.affordable,
            body:
              "El entierro asequible, también conocido como entierro inmediato o directo, es el entierro del cuerpo sin embalsamado, velatorio ni servicio. Incluye la tarifa de servicios básicos y el traslado del cuerpo desde el lugar del deceso hasta el cementerio. Se incluye el costo promedio de un ataúd básico.",
          },
          {
            title: titles.direct,
            body:
              "La cremación directa incluye el traslado del fallecido desde el lugar del deceso, el traslado al crematorio y los servicios de cremación. Se incluye el costo promedio de un contenedor alternativo para cremación. Si no se compró una urna por separado, las cenizas suelen devolverse a la familia en una caja de cartón.",
          },
        ]
      : [
          {
            title: titles.burial,
            body:
              "Traditional Full Service Burial includes funeral home basic service fee, embalming and care of body, a visitation or wake prior to the funeral, a service at either church or funeral home chapel, a funeral procession to the grave site and a committal service prior to the burial. The average cost of a casket is included.",
          },
          {
            title: titles.cremation,
            body:
              "Full Service Cremation includes a visitation or wake prior to the funeral, a service at either church or funeral home chapel and basic cremation services, which include removal of deceased from the place of death, transfer to the crematory, and cremation services. The average cost of a cremation casket is included. Unless an urn has been purchased separately, the ashes are generally returned to the family in a cardboard box.",
          },
          {
            title: titles.affordable,
            body:
              "Affordable Burial, sometimes known as Immediate or Direct Burial, is the burial of a body without embalming, viewing or services. It includes basic services fee and transportation of the body from the place of death to the cemetery. The average cost of a basic casket is included.",
          },
          {
            title: titles.direct,
            body:
              "Direct Cremation includes removal of the deceased from the place of death, transfer to the crematory, and cremation services. The average cost of an alternative cremation container is included. Unless an urn has been purchased separately, the ashes are generally returned to the family in a cardboard box.",
          },
        ];

  const intro =
    lang === "es"
      ? `<p class="small text-body-secondary mb-3">Desglose de componentes (bajo / alto / promedio), igual que en Funeralocity. Abra cada tipo de servicio para ver el detalle. Los ítems con * son promedios de mercancía (sin rango bajo/alto publicado).</p>`
      : `<p class="small text-body-secondary mb-3">Component breakdown (low / high / average), matching Funeralocity. Open each service type for the full detail. Items marked * are merchandise averages (no published low/high range).</p>`;

  const columnHeader = `<div class="sc-cost-columns" aria-hidden="true">
  <span class="sc-cost-columns-service">${esc(thService)}</span>
  <span class="sc-cost-columns-range">
    <span class="sc-cost-chip sc-cost-chip--label">${esc(thLow)}</span>
    <span class="sc-cost-chip sc-cost-chip--label">${esc(thHigh)}</span>
    <span class="sc-cost-chip sc-cost-chip--label">${esc(thAvg)}</span>
  </span>
  <span class="sc-cost-columns-spacer" aria-hidden="true"></span>
</div>`;

  const footnote =
    lang === "es"
      ? `<p class="small text-muted mt-2 mb-0">* Incluye precios promedio de la industria para cierta mercancía.</p>`
      : `<p class="small text-muted mt-2 mb-0">* Includes industry average prices for some merchandise.</p>`;

  const descHtml = `<div class="sc-cost-descriptions mt-4">
${descriptions
  .map(
    (item) => `<div class="sc-cost-desc-block">
  <h3 class="h6 fw-bold mb-2" style="color:#1a365d;">${esc(item.title)}</h3>
  <p class="mb-0 text-body-secondary">${esc(item.body)}</p>
</div>`
  )
  .join("\n")}
</div>`;

  return `${intro}
${columnHeader}
<div class="sc-cost-accordion">
${costAccordionPanel({
  id: `sc-cost-${code}-burial`,
  open: true,
  title: titles.burial,
  packageMin: short.fullBurial && short.fullBurial.Min,
  packageMax: short.fullBurial && short.fullBurial.Max,
  packageAvg: short.fullBurial && short.fullBurial.Average,
  rows: burialRows,
  lang,
})}
${costAccordionPanel({
  id: `sc-cost-${code}-cremation`,
  open: false,
  title: titles.cremation,
  packageMin: short.fullCremation && short.fullCremation.Min,
  packageMax: short.fullCremation && short.fullCremation.Max,
  packageAvg: short.fullCremation && short.fullCremation.Average,
  rows: cremationRows,
  lang,
})}
${costAccordionPanel({
  id: `sc-cost-${code}-affordable`,
  open: false,
  title: titles.affordable,
  packageMin: short.immediateBurial && short.immediateBurial.Min,
  packageMax: short.immediateBurial && short.immediateBurial.Max,
  packageAvg: short.immediateBurial && short.immediateBurial.Average,
  rows: affordableRows,
  lang,
})}
${costAccordionPanel({
  id: `sc-cost-${code}-direct`,
  open: false,
  title: titles.direct,
  packageMin: short.directCremation && short.directCremation.Min,
  packageMax: short.directCremation && short.directCremation.Max,
  packageAvg: short.directCremation && short.directCremation.Average,
  rows: directRows,
  lang,
})}
</div>
${footnote}
${descHtml}`;
}

function renderEs(code) {
  const st = DATA.states[code];
  const lic = LICENSE[code];
  const slug = SLUGS[code];
  const name = st.name;
  const prefix = "../";
  const canon = `https://www.mejorvidainsurance.com/estados/${slug}.html`;
  const enCanon = `https://www.mejorvidainsurance.com/en/states/${slug}.html`;
  const title = `Seguro de gastos finales en ${name} | Mejor Vida Insurance`;
  const desc = `Julie Braunsroth cotiza seguro de gastos finales en ${name}. Costos funerarios promedio, aseguradoras y licencia #${lic.number} (NPN #${NPN}).`;

  return `<!DOCTYPE html>
<html class="lang-es" lang="es">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="robots" content="index, follow"/>
<link href="${canon}" rel="canonical"/>
<link href="${canon}" hreflang="es" rel="alternate"/>
<link href="${enCanon}" hreflang="en" rel="alternate"/>
<link href="${canon}" hreflang="x-default" rel="alternate"/>
<link href="${prefix}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${prefix}css/quote-flow-shared.css?v=20260726-state" rel="stylesheet"/>
<link href="${prefix}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${prefix}css/state-coverage.css?v=20260726-shade-unify" rel="stylesheet"/>
<link href="${prefix}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${prefix}css/mvi-assistant-widget.css?v=20260721-chat-z" rel="stylesheet"/>
<link href="${prefix}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${prefix}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${prefix}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${prefix}css/nav-about-mega.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${prefix}css/nav-funeral-resources.css?v=20260721-faces-top" rel="stylesheet"/>
<link href="${prefix}css/nav-life-insurance.css?v=20260721-cost-blue" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:locale" content="es_ES"/>
<link rel="preload" as="image" href="${prefix}img/opt/logo-spanish2.webp" type="image/webp" fetchpriority="high"/>
<link rel="preload" as="image" href="${prefix}img/opt/${slug}-hero.webp?v=map-seal-v11" type="image/webp"/>
<script>(function(){document.documentElement.lang="es";document.documentElement.className="lang-es";})();</script>
</head>
<body class="bg-white state-coverage-page" data-licenses-base="${prefix}licenses/">
${loadHeaderEs(slug)}
<main class="state-coverage-readability">
${stateHero(code, "es", prefix, prefix)}

<section class="py-5 bg-white border-bottom" id="costos">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">¿Cuánto cuesta un funeral en ${esc(name)}?</h2>
    <p class="text-body-secondary mb-3">Promedio del costo de los componentes del servicio funerario en ${esc(name)} (actualizados ${esc(CAPTURED_AT)}). Use estas cifras para estimar cuánta cobertura de gastos finales podría necesitar.</p>
    ${costTable(code, "es")}
    <p class="small text-muted mt-3 mb-0">Fuente: <a href="${esc(st.sourceUrl)}" rel="noopener" target="_blank">Funeralocity</a> (promedios estatales). Los precios varían por funeraria, ciudad y servicios elegidos. También puede usar nuestra <a href="${prefix}final-expense-estimator.html">calculadora de gastos finales</a>.</p>
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="aseguradoras">
  <div class="container" style="max-width:72rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Aseguradoras que Julie puede comparar en ${esc(name)}</h2>
    <p class="text-body-secondary mb-4">Como agente independiente, Julie cotiza varias compañías. La tabla ordena de mayor a menor calificación según solidez financiera publicada (principalmente AM Best) y detalles de planes típicos de gastos finales. La disponibilidad de productos y montos varía; ella confirma qué opciones aplican en ${esc(name)}.</p>
    ${carriersEs(prefix)}
    <p class="small text-muted mt-3 mb-0">También está nombrada con <strong>Aetna</strong> en el sitio (cita pendiente de página dedicada). Vea el <a href="${prefix}aseguradoras.html">resumen de aseguradoras</a>.</p>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="como-funciona">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cómo funciona el seguro de gastos finales en ${esc(name)}</h2>
    <ul class="text-body-secondary ps-3 mb-4">
      <li class="mb-2">Es un <strong>seguro de vida entera</strong> pensado para funeral, cremación y deudas finales — no un funeral prepagado.</li>
      <li class="mb-2">Muchas pólizas usan <strong>suscripción simplificada</strong> (preguntas de salud, sin examen) o <strong>aceptación garantizada</strong>.</li>
      <li class="mb-2">Las primas suelen ser <strong>niveladas</strong> si se pagan a tiempo; el beneficio va a sus beneficiarios en efectivo.</li>
      <li class="mb-2">Julie atiende por teléfono, WhatsApp y cotización en línea a residentes de ${esc(name)}.</li>
    </ul>
    <p class="mb-0"><a href="${prefix}blog/que-es-seguro-gastos-finales.html">Qué es el seguro de gastos finales →</a></p>
  </div>
</section>

<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">Cotice gastos finales en ${esc(name)}</h2>
    <p class="mb-4 text-white-50">Cotización gratuita. Julie compara opciones según su edad, salud y presupuesto.</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${prefix}quote.html">Cotización gratuita</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="/schedule-julie.html">Agendar una llamada</a>
    </div>
  </div>
</section>
</main>
${licenseModal("es")}
${loadFooterEs()}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${prefix}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${prefix}script.js"></script>
<script defer src="${prefix}js/mvi-nav-questions.js"></script>
<script defer src="${prefix}js/mvi-licensing-map.js?v=20260726-lic-popup"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${prefix}js/website-assistant-widget.js"></script>
</body>
</html>
`;
}

function renderEn(code) {
  const st = DATA.states[code];
  const lic = LICENSE[code];
  const slug = SLUGS[code];
  const name = st.name;
  const root = "../../";
  const en = "../";
  const canon = `https://www.mejorvidainsurance.com/en/states/${slug}.html`;
  const esCanon = `https://www.mejorvidainsurance.com/estados/${slug}.html`;
  const title = `Final Expense Insurance in ${name} | Mejor Vida Insurance`;
  const desc = `Julie Braunsroth quotes final expense life insurance in ${name}. Average funeral costs, carriers she compares, and license #${lic.number} (NPN #${NPN}).`;

  return `<!DOCTYPE html>
<html class="lang-en" lang="en">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="robots" content="noindex, follow"/>
<link href="${canon}" rel="canonical"/>
<link href="${esCanon}" hreflang="es" rel="alternate"/>
<link href="${canon}" hreflang="en" rel="alternate"/>
<link href="${root}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${root}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${root}css/quote-flow-shared.css?v=20260726-state" rel="stylesheet"/>
<link href="${root}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/state-coverage.css?v=20260726-shade-unify" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260721-chat-z" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260721-faces-top" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260721-cost-blue" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${canon}"/>
<link rel="preload" as="image" href="${root}img/opt/logo-english2.webp" type="image/webp" fetchpriority="high"/>
<link rel="preload" as="image" href="${root}img/opt/${slug}-hero.webp?v=map-seal-v11" type="image/webp"/>
<script>(function(){document.documentElement.lang="en";document.documentElement.className="lang-en";})();</script>
</head>
<body class="bg-white state-coverage-page" data-licenses-base="${root}licenses/">
${loadHeaderEn(slug)}
<main class="state-coverage-readability">
${stateHero(code, "en", en, root)}

<section class="py-5 bg-white border-bottom" id="costs">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">How much does a funeral cost in ${esc(name)}?</h2>
    <p class="text-body-secondary mb-3">Average cost of funeral service components in ${esc(name)} (updated ${esc(CAPTURED_AT)}). Use these figures to estimate how much final expense coverage you may need.</p>
    ${costTable(code, "en")}
    <p class="small text-muted mt-3 mb-0">Source: <a href="${esc(st.sourceUrl)}" rel="noopener" target="_blank">Funeralocity</a> (state averages). Prices vary by funeral home, city, and services chosen. You can also use our <a href="${en}final-expense-estimator.html">final expense estimator</a>.</p>
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="carriers">
  <div class="container" style="max-width:72rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Carriers Julie can compare in ${esc(name)}</h2>
    <p class="text-body-secondary mb-4">As an independent agent, Julie quotes multiple companies. The table ranks them from highest to lowest using published financial-strength data (primarily AM Best) plus typical final-expense plan details. Product and face-amount availability varies; she confirms what applies in ${esc(name)}.</p>
    ${carriersEn(root, en)}
    <p class="small text-muted mt-3 mb-0"><strong>Aetna</strong> is also named on the site (dedicated page pending). See the <a href="${en}insurance-carriers.html">carrier overview</a>.</p>
  </div>
</section>

<section class="py-5 bg-white border-bottom" id="how-it-works">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">How final expense insurance works in ${esc(name)}</h2>
    <ul class="text-body-secondary ps-3 mb-4">
      <li class="mb-2">It is <strong>whole life insurance</strong> meant for funeral, cremation, and final bills — not a prepaid funeral contract.</li>
      <li class="mb-2">Many policies use <strong>simplified underwriting</strong> (health questions, no exam) or <strong>guaranteed acceptance</strong>.</li>
      <li class="mb-2">Premiums are typically <strong>level</strong> when paid on time; the death benefit pays cash to your beneficiaries.</li>
      <li class="mb-2">Julie serves ${esc(name)} residents by phone, WhatsApp, and online quote.</li>
    </ul>
    <p class="mb-0"><a href="${root}blog/que-es-seguro-gastos-finales.html">What is final expense insurance →</a></p>
  </div>
</section>

<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">Get a final expense quote in ${esc(name)}</h2>
    <p class="mb-4 text-white-50">Free quote. Julie compares options based on your age, health, and budget.</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${en}quote.html">Free quote</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="/en/schedule-julie.html">Schedule a call</a>
    </div>
  </div>
</section>
</main>
${licenseModal("en")}
${loadFooterEn()}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${root}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${root}script.js"></script>
<script defer src="${root}js/mvi-nav-questions.js"></script>
<script defer src="${root}js/mvi-licensing-map.js?v=20260726-lic-popup"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${root}js/website-assistant-widget.js"></script>
</body>
</html>
`;
}

for (const code of Object.keys(SLUGS)) {
  const slug = SLUGS[code];
  const esPath = path.join(ROOT, "estados", `${slug}.html`);
  const enPath = path.join(ROOT, "en", "states", `${slug}.html`);
  fs.writeFileSync(esPath, renderEs(code));
  fs.writeFileSync(enPath, renderEn(code));
  console.log("wrote", esPath);
  console.log("wrote", enPath);
}
