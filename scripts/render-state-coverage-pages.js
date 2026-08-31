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
 * State hero. Light-to-dark blue fade with right-side
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
          `Puede comparar cotizaciones de varias aseguradoras — incluidas Mutual of Omaha, Corebridge, Americo, Aetna y otras — según su edad, salud y presupuesto.`,
          `Opciones de emisión simplificada o aceptación garantizada según su situación, con primas niveladas.`,
        ]
      : [
          `A traditional burial in ${esc(name)} averages about <strong>${money(burialAvg)}</strong>; full-service cremation about <strong>${money(cremationAvg)}</strong> (Funeralocity).`,
          `Compare quotes from multiple carriers — including Mutual of Omaha, Corebridge, Americo, Aetna, and others — based on your age, health, and budget.`,
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

function carrierMetrics(c, lang) {
  const naLabel = lang === "es" ? "N/D" : "N/A";
  const unique = lang === "es" ? c.uniqueEs || c.productEs : c.uniqueEn || c.productEn;
  const amDesc =
    lang === "es"
      ? ({ Superior: "Superior", Excellent: "Excelente" }[c.amBest.descriptor] || c.amBest.descriptor)
      : c.amBest.descriptor;
  const scoreNice = scoreDisplay(c.score);
  const comdexVal =
    c.comdex && c.comdex.score != null ? String(c.comdex.score) : naLabel;
  const naicCode = (c.naic && c.naic.code) || "—";
  const naicCis =
    (c.naic && (c.naic.cisUrl || c.naic.sourceUrl)) ||
    "https://content.naic.org/cis_consumer_information.htm";
  const naicIdx =
    c.naic && c.naic.complaintIndex != null
      ? Number(c.naic.complaintIndex).toFixed(2)
      : null;
  // NAIC column is the CIS complaint index (0.42, etc.). Company code stays in the CIS link.
  const naicPrimary = naicIdx != null ? naicIdx : naLabel;
  const jd = c.jdPower || {};
  let jdVal = naLabel;
  if (jd.inStudy && jd.score != null) {
    jdVal =
      jd.rank != null
        ? `#${jd.rank}${jd.of ? `/${jd.of}` : ""} · ${jd.score}`
        : String(jd.score);
  }
  return { unique, amDesc, scoreNice, comdexVal, naicCode, naicCis, naicPrimary, jdVal };
}

function carriersRankedTable(lang, imgPrefix, pagePrefix) {
  const carriers = [...CARRIER_RATINGS.carriers].sort((a, b) => a.rank - b.rank);
  const thInsurer = lang === "es" ? "Aseguradora" : "Carrier";
  const thDetails = lang === "es" ? "Qué la distingue" : "What stands out";
  const thAmBest = "AM Best";
  const thComdex = "Comdex";
  const thNaic = "NAIC";
  const thJd = "J.D. Power";
  const thScore = "Score";
  const reviewLabel = lang === "es" ? "Ver detalles" : "View details";
  const closeLabel = lang === "es" ? "Cerrar" : "Close";
  const tapHint =
    lang === "es"
      ? "Toque el logo de una aseguradora para ver el detalle completo."
      : "Tap a carrier logo to see full details.";
  const updated = CARRIER_RATINGS.updatedAt || "";
  const cisLookup = "CIS";

  const desktopRows = carriers
    .map((c) => {
      const pageHref =
        lang === "es"
          ? `${imgPrefix}carriers/${c.slug}.html`
          : `${pagePrefix}carriers/${c.slug}.html`;
      const logoSrc = `${imgPrefix}${c.logo}${
        c.slug === "transamerica" ? "?v=20260723-nobg" : "?v=20260727-align"
      }`;
      const m = carrierMetrics(c, lang);
      const logoLg =
        c.slug === "mutual-of-omaha" ||
        c.slug === "transamerica" ||
        c.slug === "corebridge" ||
        c.slug === "american-amicable" ||
        c.slug === "americo"
          ? " sc-carrier-logo-link--lg"
          : "";
      const logoSlugClass = ` sc-carrier-logo-link--${c.slug}`;

      return `<tr class="sc-carrier-row">
  <td class="sc-carrier-insurer" data-label="${esc(thInsurer)}">
    <div class="sc-carrier-insurer-inner">
      <span class="sc-carrier-rank" aria-hidden="true">${c.rank}</span>
      <a class="sc-carrier-logo-link${logoLg}${logoSlugClass}" href="${pageHref}">
        <img src="${logoSrc}" alt="${esc(c.name)}" width="${c.logoWidth}" height="${c.logoHeight}" loading="lazy" decoding="async"/>
      </a>
      <a class="sc-carrier-profile" href="${pageHref}">${esc(reviewLabel)} →</a>
    </div>
  </td>
  <td class="sc-carrier-details" data-label="${esc(thDetails)}">
    <p class="sc-carrier-unique mb-0">${esc(m.unique)}</p>
  </td>
  <td class="sc-carrier-metric" data-label="${esc(thAmBest)}">
    <strong class="sc-carrier-fsr">${esc(c.amBest.fsr)}</strong>
    <span class="sc-carrier-metric-sub d-block">${esc(m.amDesc)}</span>
  </td>
  <td class="sc-carrier-metric" data-label="${esc(thComdex)}">
    <strong class="sc-carrier-metric-num">${esc(m.comdexVal)}</strong>
    ${c.comdex && c.comdex.score != null ? `<span class="sc-carrier-metric-sub d-block">/100</span>` : ""}
  </td>
  <td class="sc-carrier-metric" data-label="${esc(thNaic)}">
    <strong class="sc-carrier-metric-num">${esc(String(m.naicPrimary))}</strong>
    <span class="sc-carrier-metric-sub d-block"><a href="${esc(
      m.naicCis
    )}" target="_blank" rel="noopener">#${esc(String(m.naicCode))} · ${esc(cisLookup)}</a></span>
  </td>
  <td class="sc-carrier-metric" data-label="${esc(thJd)}">
    <strong class="sc-carrier-metric-num">${esc(m.jdVal)}</strong>
  </td>
  <td class="sc-carrier-score-cell" data-label="${esc(thScore)}">
    <div class="sc-carrier-score-compact" aria-label="${esc(m.scoreNice)} / 5">
      <strong>${esc(m.scoreNice)}</strong><span>/5</span>
    </div>
    <div class="sc-carrier-stars sc-carrier-stars--compact">${starsHtml(c.score)}</div>
  </td>
</tr>`;
    })
    .join("\n");

  const mobileRows = carriers
    .map((c) => {
      const pageHref =
        lang === "es"
          ? `${imgPrefix}carriers/${c.slug}.html`
          : `${pagePrefix}carriers/${c.slug}.html`;
      const logoSrc = `${imgPrefix}${c.logo}${
        c.slug === "transamerica" ? "?v=20260723-nobg" : "?v=20260727-align"
      }`;
      const m = carrierMetrics(c, lang);
      const logoLg =
        c.slug === "mutual-of-omaha" ||
        c.slug === "transamerica" ||
        c.slug === "corebridge" ||
        c.slug === "american-amicable"
          ? " sc-carrier-compare-logo--lg"
          : "";
      const logoSlugClass = ` sc-carrier-compare-logo--${c.slug}`;
      const openLabel =
        lang === "es"
          ? `Ver detalle de ${c.name}`
          : `View ${c.name} details`;

      return `<div class="sc-carrier-compare-row">
  <button type="button" class="sc-carrier-compare-logo${logoLg}${logoSlugClass}" data-sc-carrier-open="sc-carrier-dlg-${esc(c.slug)}" aria-label="${esc(openLabel)}">
    <span class="sc-carrier-compare-rank" aria-hidden="true">${c.rank}</span>
    <img src="${logoSrc}" alt="" width="${c.logoWidth}" height="${c.logoHeight}" loading="lazy" decoding="async"/>
  </button>
  <div class="sc-carrier-compare-rating">
    <span class="sc-carrier-compare-rating-label">${esc(thScore)}</span>
    <strong class="sc-carrier-compare-fsr" aria-label="${esc(m.scoreNice)} / 5">${esc(m.scoreNice)}<span class="sc-carrier-compare-of">/5</span></strong>
    <div class="sc-carrier-stars sc-carrier-stars--compact sc-carrier-compare-stars">${starsHtml(c.score)}</div>
  </div>
</div>
<dialog class="sc-carrier-dialog" id="sc-carrier-dlg-${esc(c.slug)}" aria-labelledby="sc-carrier-dlg-title-${esc(c.slug)}">
  <div class="sc-carrier-dialog-card">
    <div class="sc-carrier-dialog-head">
      <h3 id="sc-carrier-dlg-title-${esc(c.slug)}" class="sc-carrier-dialog-title">${esc(c.name)}</h3>
      <button type="button" class="sc-carrier-dialog-x" data-sc-carrier-close aria-label="${esc(closeLabel)}">×</button>
    </div>
    <dl class="sc-carrier-dialog-grid">
      <div>
        <dt>${esc(thDetails)}</dt>
        <dd>${esc(m.unique)}</dd>
      </div>
      <div>
        <dt>${esc(thAmBest)}</dt>
        <dd><strong>${esc(c.amBest.fsr)}</strong> · ${esc(m.amDesc)}</dd>
      </div>
      <div>
        <dt>${esc(thComdex)}</dt>
        <dd><strong>${esc(m.comdexVal)}</strong>${c.comdex && c.comdex.score != null ? " /100" : ""}</dd>
      </div>
      <div>
        <dt>${esc(thNaic)}</dt>
        <dd><strong>${esc(String(m.naicPrimary))}</strong> · <a href="${esc(m.naicCis)}" target="_blank" rel="noopener">#${esc(String(m.naicCode))} · ${esc(cisLookup)}</a></dd>
      </div>
      <div>
        <dt>${esc(thJd)}</dt>
        <dd><strong>${esc(m.jdVal)}</strong></dd>
      </div>
      <div>
        <dt>${esc(thScore)}</dt>
        <dd>
          <strong>${esc(m.scoreNice)}</strong><span class="text-body-secondary">/5</span>
          <div class="sc-carrier-stars sc-carrier-stars--compact mt-1">${starsHtml(c.score)}</div>
        </dd>
      </div>
    </dl>
    <div class="sc-carrier-dialog-actions">
      <a class="btn sc-carrier-dialog-profile" href="${pageHref}">${esc(reviewLabel)} →</a>
      <button type="button" class="btn sc-carrier-dialog-close" data-sc-carrier-close>${esc(closeLabel)}</button>
    </div>
  </div>
</dialog>`;
    })
    .join("\n");

  const footerNote = `<p class="small text-muted mt-3 mb-0">${lang === "es" ? "Actualizado" : "Updated"}: ${esc(
    updated
  )}. ${
    lang === "es"
      ? `<a href="https://content.naic.org/consumer" target="_blank" rel="noopener">Portal del consumidor NAIC</a> · <a href="https://content.naic.org/cis_consumer_information.htm" target="_blank" rel="noopener">CIS</a>.`
      : `<a href="https://content.naic.org/consumer" target="_blank" rel="noopener">NAIC Consumer hub</a> · <a href="https://content.naic.org/cis_consumer_information.htm" target="_blank" rel="noopener">CIS</a>.`
  }</p>`;

  return `<div class="sc-carrier-compare d-md-none" aria-label="${esc(thInsurer)}">
  <p class="sc-carrier-compare-hint">${esc(tapHint)}</p>
  <div class="sc-carrier-compare-head" aria-hidden="true">
    <span>${esc(thInsurer)}</span>
    <span>${esc(thScore)}</span>
  </div>
  <div class="sc-carrier-compare-list">
${mobileRows}
  </div>
</div>
<div class="table-responsive sc-carrier-table-wrap sc-carrier-table-wrap--wide d-none d-md-block">
  <table class="table sc-carrier-table sc-carrier-table--simple sc-carrier-table--tight align-middle mb-0">
    <thead>
      <tr>
        <th scope="col">${esc(thInsurer)}</th>
        <th scope="col">${esc(thDetails)}</th>
        <th scope="col">${esc(thAmBest)}</th>
        <th scope="col">${esc(thComdex)}</th>
        <th scope="col">${esc(thNaic)}</th>
        <th scope="col">${esc(thJd)}</th>
        <th scope="col">${esc(thScore)}</th>
      </tr>
    </thead>
    <tbody>
${desktopRows}
    </tbody>
  </table>
</div>
${footerNote}
<script>
(function () {
  function openDlg(id) {
    var dlg = document.getElementById(id);
    if (!dlg) return;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  }
  function closeDlg(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }
  document.addEventListener("click", function (e) {
    var openBtn = e.target.closest("[data-sc-carrier-open]");
    if (openBtn) {
      openDlg(openBtn.getAttribute("data-sc-carrier-open"));
      return;
    }
    var closeBtn = e.target.closest("[data-sc-carrier-close]");
    if (closeBtn) {
      closeDlg(closeBtn.closest("dialog"));
    }
  });
  document.querySelectorAll(".sc-carrier-dialog").forEach(function (dlg) {
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) closeDlg(dlg);
    });
  });
})();
</script>`;
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

/** Brief plain-language definitions for Funeralocity line items (popup). */
const SERVICE_COMPONENT_DEFS = {
  basic: {
    es: "Tarifa de la funeraria por coordinar el funeral: papeleo, personal y uso de las instalaciones básicas.",
    en: "Funeral home fee to coordinate the funeral: paperwork, staff time, and basic facility use.",
  },
  transfer: {
    es: "Traslado del cuerpo desde el lugar del fallecimiento hasta la funeraria (también llamado “primera llamada”).",
    en: "Transporting the body from the place of death to the funeral home (also called “first call”).",
  },
  embalming: {
    es: "Preparación y conservación temporal del cuerpo para el velatorio o la visita (no siempre es obligatorio).",
    en: "Preparing and temporarily preserving the body for a viewing or visitation (not always required).",
  },
  dressing: {
    es: "Vestir al fallecido y colocarlo en el ataúd de forma digna para la visita o el servicio.",
    en: "Dressing the deceased and placing them in the casket for visitation or the service.",
  },
  viewing: {
    es: "Tiempo de velatorio o visita en la funeraria para que familiares y amigos puedan despedirse.",
    en: "Visitation or wake time at the funeral home so family and friends can pay respects.",
  },
  funeral: {
    es: "Ceremonia o servicio memorial (capilla, iglesia u otro lugar) dirigido por la funeraria o el oficiante.",
    en: "Funeral or memorial ceremony (chapel, church, or other location) led by the funeral home or officiant.",
  },
  hearse: {
    es: "Vehículo funerario que lleva el ataúd al cementerio o al lugar del servicio de sepultura.",
    en: "Funeral vehicle that carries the casket to the cemetery or graveside service.",
  },
  utility: {
    es: "Vehículo de apoyo (flores, sillas, equipo o familiares) que acompaña la procesión o el servicio.",
    en: "Support vehicle (flowers, chairs, equipment, or family) that assists the procession or service.",
  },
  medianCasket: {
    es: "Costo promedio de un ataúd de precio medio. Funeralocity publica solo el promedio (sin bajo/alto).",
    en: "Average cost of a mid-priced casket. Funeralocity publishes only the average (no low/high range).",
  },
  base: {
    es: "Tarifa básica de la funeraria por coordinar la cremación y el servicio relacionado.",
    en: "Funeral home basic fee to coordinate cremation and related services.",
  },
  crematory: {
    es: "Cargo del crematorio por realizar la cremación del cuerpo.",
    en: "Crematory charge for performing the cremation.",
  },
  transferCrem: {
    es: "Traslado del cuerpo desde la funeraria (o el lugar del deceso) hasta el crematorio.",
    en: "Transporting the body from the funeral home (or place of death) to the crematory.",
  },
  cremationCasket: {
    es: "Ataúd o contenedor usado para la cremación con servicio. Solo se publica el promedio.",
    en: "Casket or container used for a full-service cremation. Only the average is published.",
  },
  immediate: {
    es: "Entierro sin embalsamado, velatorio ni ceremonia — traslado y sepultura de forma directa.",
    en: "Burial without embalming, visitation, or ceremony — direct transfer and interment.",
  },
  basicCasket: {
    es: "Ataúd sencillo o económico incluido en un entierro asequible. Solo se publica el promedio.",
    en: "Simple or economy casket included with an affordable burial. Only the average is published.",
  },
  directCrem: {
    es: "Cremación sin velatorio ni servicio previo: traslado, cremación y devolución de las cenizas.",
    en: "Cremation without a prior visitation or service: transfer, cremation, and return of ashes.",
  },
};

function componentRowsHtml(rows, lang) {
  return rows
    .map(([key, label, min, max, avg, avgOnly]) => {
      const def = (SERVICE_COMPONENT_DEFS[key] && SERVICE_COMPONENT_DEFS[key][lang]) || "";
      const labelCell = def
        ? `<button type="button" class="sc-cost-service-btn" data-sc-def-title="${esc(label)}" data-sc-def-body="${esc(def)}">${esc(label)}</button>`
        : esc(label);
      if (avgOnly) {
        return `<tr>
  <td>${labelCell}</td>
  <td class="text-end text-body-secondary">—</td>
  <td class="text-end text-body-secondary">—</td>
  <td class="text-end fw-semibold">${moneyOrDash(avg)}</td>
</tr>`;
      }
      return `<tr>
  <td>${labelCell}</td>
  <td class="text-end">${moneyOrDash(min)}</td>
  <td class="text-end">${moneyOrDash(max)}</td>
  <td class="text-end fw-semibold">${moneyOrDash(avg)}</td>
</tr>`;
    })
    .join("\n");
}

function costDefModal(lang) {
  const close = lang === "es" ? "Cerrar" : "Close";
  const hint =
    lang === "es"
      ? "Toque un tipo de servicio para ver una explicación breve."
      : "Tap a service type for a brief explanation.";
  return `<dialog class="sc-cost-def-dialog" id="sc-cost-def-dialog" aria-labelledby="sc-cost-def-title">
  <div class="sc-cost-def-card">
    <div class="sc-cost-def-head">
      <h3 id="sc-cost-def-title" class="sc-cost-def-title"></h3>
      <button type="button" class="sc-cost-def-close" data-sc-def-close aria-label="${esc(close)}">×</button>
    </div>
    <p id="sc-cost-def-body" class="sc-cost-def-body"></p>
    <p class="sc-cost-def-hint">${esc(hint)}</p>
    <button type="button" class="btn sc-cost-def-ok" data-sc-def-close>${esc(close)}</button>
  </div>
</dialog>
<script>
(function () {
  var dlg = document.getElementById("sc-cost-def-dialog");
  if (!dlg) return;
  var titleEl = document.getElementById("sc-cost-def-title");
  var bodyEl = document.getElementById("sc-cost-def-body");
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".sc-cost-service-btn");
    if (btn) {
      titleEl.textContent = btn.getAttribute("data-sc-def-title") || "";
      bodyEl.textContent = btn.getAttribute("data-sc-def-body") || "";
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
      return;
    }
    if (e.target.closest("[data-sc-def-close]")) {
      if (typeof dlg.close === "function") dlg.close();
      else dlg.removeAttribute("open");
    }
  });
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) {
      if (typeof dlg.close === "function") dlg.close();
      else dlg.removeAttribute("open");
    }
  });
})();
</script>`;
}

function costTableBlock({ id, title, packageMin, packageMax, packageAvg, rows, lang }) {
  const thService = lang === "es" ? "Tipo de servicio" : "Service type";
  const thLow = lang === "es" ? "Bajo" : "Low";
  const thHigh = lang === "es" ? "Alto" : "High";
  const thAvg = lang === "es" ? "Promedio" : "Average";
  const rangeLabel =
    lang === "es"
      ? `Total del paquete: ${moneyOrDash(packageMin)} bajo · ${moneyOrDash(packageMax)} alto · ${moneyOrDash(packageAvg)} promedio`
      : `Package total: ${moneyOrDash(packageMin)} low · ${moneyOrDash(packageMax)} high · ${moneyOrDash(packageAvg)} average`;
  return `<section class="sc-cost-table-block" id="${esc(id)}">
  <div class="sc-cost-table-heading">
    <h3 class="sc-cost-table-title">${esc(title)}</h3>
    <p class="sc-cost-table-range">${rangeLabel}</p>
  </div>
  <div class="sc-cost-table-wrap">
    <table class="sc-cost-table">
      <thead>
        <tr>
          <th scope="col">${thService}</th>
          <th scope="col" class="text-end">${thLow}</th>
          <th scope="col" class="text-end">${thHigh}</th>
          <th scope="col" class="text-end">${thAvg}</th>
        </tr>
      </thead>
      <tbody>
${componentRowsHtml(rows, lang)}
      </tbody>
    </table>
  </div>
</section>`;
}

/** Funeralocity-style Low / High / Average component breakdowns (always open). */
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
    ["basic", L.basic, tb.Min_Basic_Services, tb.Max_Basic_Services, tb.Basic_Services],
    ["transfer", L.transfer, tb.Min_Pricing_Transfer_Home, tb.Max_Pricing_Transfer_Home, tb.Pricing_Transfer_Home],
    ["embalming", L.embalming, tb.Min_Pricing_Embaliming, tb.Max_Pricing_Embaliming, tb.Pricing_Embaliming],
    ["dressing", L.dressing, tb.Min_Pricing_Dressing_Casketing, tb.Max_Pricing_Dressing_Casketing, tb.Pricing_Dressing_Casketing],
    ["viewing", L.viewing, tb.Min_Pricing_Viewing, tb.Max_Pricing_Viewing, tb.Pricing_Viewing],
    ["funeral", L.funeral, tb.Min_Pricing_Funeral, tb.Max_Pricing_Funeral, tb.Pricing_Funeral],
    ["hearse", L.hearse, tb.Min_Pricing_Hearse, tb.Max_Pricing_Hearse, tb.Pricing_Hearse],
    ["utility", L.utility, tb.Min_Pricing_Utility_Vehicle, tb.Max_Pricing_Utility_Vehicle, tb.Pricing_Utility_Vehicle],
    ["medianCasket", L.medianCasket, null, null, tb.MedianPricedCasketAverage, true],
  ];

  const cremationRows = [
    ["base", L.base, fc.Min_Pricing_Base_Services, fc.Max_Pricing_Base_Services, fc.Pricing_Base_Services],
    ["transfer", L.transfer, fc.Min_Pricing_Transfer_Home, fc.Max_Pricing_Transfer_Home, fc.Pricing_Transfer_Home],
    ["embalming", L.embalming, fc.Min_Pricing_Embaliming, fc.Max_Pricing_Embaliming, fc.Pricing_Embaliming],
    ["dressing", L.dressing, fc.Min_Pricing_Dressing_Casketing, fc.Max_Pricing_Dressing_Casketing, fc.Pricing_Dressing_Casketing],
    ["viewing", L.viewing, fc.Min_Pricing_Viewing, fc.Max_Pricing_Viewing, fc.Pricing_Viewing],
    ["funeral", L.funeral, fc.Min_Pricing_Funeral, fc.Max_Pricing_Funeral, fc.Pricing_Funeral],
    ["transferCrem", L.transferCrem, fc.Min_Pricing_Transfer_Crematory, fc.Max_Pricing_Transfer_Crematory, fc.Pricing_Transfer_Crematory],
    ["crematory", L.crematory, fc.Min_Pricing_Crematory_Fee, fc.Max_Pricing_Crematory_Fee, fc.Pricing_Crematory_Fee],
    ["cremationCasket", L.cremationCasket, null, null, fc.CremationCasketAverage, true],
  ];

  const affordableRows = [
    ["immediate", L.immediate, ab.Min_Pricing_Immediate_Burial, ab.Max_Pricing_Immediate_Burial, ab.Pricing_Immediate_Burial],
    ["basicCasket", L.basicCasket, null, null, ab.BasicCasket, true],
  ];

  const directRows = [
    ["directCrem", L.directCrem, dc.Min_Pricing_Direct_Cremation, dc.Max_Pricing_Direct_Cremation, dc.Pricing_Direct_Cremation],
    ["transferCrem", L.transferCrem, dc.Min_Pricing_Transfer_Crematory, dc.Max_Pricing_Transfer_Crematory, dc.Pricing_Transfer_Crematory],
    ["crematory", L.crematory, dc.Min_Pricing_Crematory_Fee, dc.Max_Pricing_Crematory_Fee, dc.Pricing_Crematory_Fee],
  ];

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
      ? `<p class="small text-body-secondary mb-3">Desglose de componentes (bajo / alto / promedio), igual que en Funeralocity. Toque un <strong>tipo de servicio</strong> para ver una explicación breve. Los ítems con * son promedios de mercancía (sin rango bajo/alto publicado).</p>`
      : `<p class="small text-body-secondary mb-3">Component breakdown (low / high / average), matching Funeralocity. Tap a <strong>service type</strong> for a brief explanation. Items marked * are merchandise averages (no published low/high range).</p>`;

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
<div class="sc-cost-tables">
${costTableBlock({
  id: `sc-cost-${code}-burial`,
  title: titles.burial,
  packageMin: short.fullBurial && short.fullBurial.Min,
  packageMax: short.fullBurial && short.fullBurial.Max,
  packageAvg: short.fullBurial && short.fullBurial.Average,
  rows: burialRows,
  lang,
})}
${costTableBlock({
  id: `sc-cost-${code}-cremation`,
  title: titles.cremation,
  packageMin: short.fullCremation && short.fullCremation.Min,
  packageMax: short.fullCremation && short.fullCremation.Max,
  packageAvg: short.fullCremation && short.fullCremation.Average,
  rows: cremationRows,
  lang,
})}
${costTableBlock({
  id: `sc-cost-${code}-affordable`,
  title: titles.affordable,
  packageMin: short.immediateBurial && short.immediateBurial.Min,
  packageMax: short.immediateBurial && short.immediateBurial.Max,
  packageAvg: short.immediateBurial && short.immediateBurial.Average,
  rows: affordableRows,
  lang,
})}
${costTableBlock({
  id: `sc-cost-${code}-direct`,
  title: titles.direct,
  packageMin: short.directCremation && short.directCremation.Min,
  packageMax: short.directCremation && short.directCremation.Max,
  packageAvg: short.directCremation && short.directCremation.Average,
  rows: directRows,
  lang,
})}
</div>
${footnote}
${descHtml}
${costDefModal(lang)}`;
}

function renderEs(code) {
  const st = DATA.states[code];
  const lic = LICENSE[code];
  const slug = SLUGS[code];
  const name = st.name;
  const prefix = "../";
  const canon = `https://www.mejorvidainsurance.com/estados/${slug}.html`;
  const enCanon = `https://www.mejorvidainsurance.com/en/states/${slug}.html`;
  const title = `Seguro de gastos finales en ${name} | Mejor Vida Seguros`;
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
<link href="${prefix}css/state-coverage.css?v=20260808-carrier-score" rel="stylesheet"/>
<link href="${prefix}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${prefix}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${prefix}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${prefix}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${prefix}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${prefix}css/nav-about-mega.css?v=20260728-help-bg" rel="stylesheet"/>
<link href="${prefix}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${prefix}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
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
  <div class="container-fluid sc-cost-section-container px-3 px-md-4">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">¿Cuánto cuesta un funeral en ${esc(name)}?</h2>
    <p class="text-body-secondary mb-3">Promedio del costo de los componentes del servicio funerario en ${esc(name)} (actualizados ${esc(CAPTURED_AT)}). Use estas cifras para estimar cuánta cobertura de gastos finales podría necesitar.</p>
    ${costTable(code, "es")}
    <p class="small text-muted mt-3 mb-0">Fuente: <a href="${esc(st.sourceUrl)}" rel="noopener" target="_blank">Funeralocity</a> (promedios estatales). Los precios varían por funeraria, ciudad y servicios elegidos. También puede usar nuestra <a href="${prefix}final-expense-estimator.html">calculadora de gastos finales</a>.</p>
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="aseguradoras">
  <div class="container-fluid sc-carrier-section-container px-3 px-lg-4">
    <h2 class="h4 fw-bold mb-2" style="color:#1a365d;">Aseguradoras que Julie puede comparar en ${esc(name)}</h2>
    <p class="text-body-secondary mb-4">El detalle completo de cada aseguradora está en su página de perfil.</p>
    ${carriersEs(prefix)}
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
<script defer src="${prefix}js/mvi-nav-questions.js?v=20260828-family"></script>
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
<link href="${root}css/state-coverage.css?v=20260808-carrier-score" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260728-help-bg" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
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
  <div class="container-fluid sc-cost-section-container px-3 px-md-4">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">How much does a funeral cost in ${esc(name)}?</h2>
    <p class="text-body-secondary mb-3">Average cost of funeral service components in ${esc(name)} (updated ${esc(CAPTURED_AT)}). Use these figures to estimate how much final expense coverage you may need.</p>
    ${costTable(code, "en")}
    <p class="small text-muted mt-3 mb-0">Source: <a href="${esc(st.sourceUrl)}" rel="noopener" target="_blank">Funeralocity</a> (state averages). Prices vary by funeral home, city, and services chosen. You can also use our <a href="${en}final-expense-estimator.html">final expense estimator</a>.</p>
  </div>
</section>

<section class="py-5 bg-light border-bottom" id="carriers">
  <div class="container-fluid sc-carrier-section-container px-3 px-lg-4">
    <h2 class="h4 fw-bold mb-2" style="color:#1a365d;">Carriers Julie can compare in ${esc(name)}</h2>
    <p class="text-body-secondary mb-4">Full detail for each carrier lives on its profile page.</p>
    ${carriersEn(root, en)}
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
<script defer src="${root}js/mvi-nav-questions.js?v=20260828-family"></script>
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
