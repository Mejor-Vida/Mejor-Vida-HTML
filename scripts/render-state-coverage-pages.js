#!/usr/bin/env node
/**
 * Render bilingual state coverage pages (licensed states in SLUGS).
 * Layout locked: .cursor/rules/state-page-layout.mdc
 * Usage: node scripts/render-state-coverage-pages.js
 */
const fs = require("fs");
const path = require("path");

const { appointedCarrierCompareNote, thirdPartyFuneralAverageNote } = require("../lib/company-compare-disclaimer");
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
  const lic = LICENSE[code];
  const slug = SLUGS[code];
  const name = stateName(code, lang);
  const quoteHref = `${prefix}quote.html`;
  const heroVer = heroVersion(slug);
  const heroWebp = `${imgPrefix}img/opt/${slug}-hero.webp?v=${heroVer}`;
  const heroJpg = `${imgPrefix}img/opt/${slug}-hero.jpg?v=${heroVer}`;
  const heroPng = `${imgPrefix}img/opt/${slug}-hero.png?v=${heroVer}`;
  const heroDims = {
    nebraska: [1400, 909],
    kansas: [1400, 900],
    colorado: [1400, 900],
    nevada: [680, 1000],
    california: [323, 473],
    texas: [596, 482],
    arizona: [1400, 900],
  }[slug] || [1400, 900];
  const [heroW, heroH] = heroDims;
  // Nevada / CA / TX use transparent cutout; Colorado and others use opaque NE-style county maps
  const useTransparentHero = slug === "nevada" || slug === "california" || slug === "texas";
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

  // Older-Adult-First Layer 1: answer + 2 short points + one CTA.
  // Costs, carriers, and how-it-works stay in sections below.
  const lead =
    lang === "es"
      ? `Mejor Vida Seguros cotiza seguro de vida entera para funeral, cremación y deudas finales a residentes de ${esc(name)}.`
      : `Mejor Vida Insurance quotes whole life coverage for funeral, cremation, and final bills for residents of ${esc(name)}.`;

  const bullets =
    lang === "es"
      ? [
          `Cotización gratuita según su edad, salud y presupuesto.`,
          `Licenciada en ${esc(name)} · NPN #${NPN}.`,
        ]
      : [
          `Free quote based on your age, health, and budget.`,
          `Licensed in ${esc(name)} · NPN #${NPN}.`,
        ];

  const ctaLabel = lang === "es" ? "Cotización gratuita" : "Get a free quote";

  const agentLabel =
    lang === "es" ? `Agente licenciada en ${name}` : `Licensed agent in ${name}`;
  const viewLic = lang === "es" ? `Ver licencia (${code})` : `View license (${code})`;
  const naic = lic.verifyLabel
    ? lang === "es"
      ? lic.verifyLabel.es
      : lic.verifyLabel.en
    : lang === "es"
      ? "Verificar en NAIC"
      : "Verify on NAIC";
  const verifyHref = lic.verifyUrl
    ? lic.verifyUrl
    : `https://external-lookup-web.prod.naic.org/lookup?jurisdiction=${esc(code)}&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${NPN}`;
  const verifyHintPack = LICENSE_VERIFY_HINT[code];
  const verifyHint = verifyHintPack ? (lang === "es" ? verifyHintPack.es : verifyHintPack.en) : "";
  const verifyHintHtml = verifyHint
    ? `<p class="sc-hero-verify-hint">${esc(verifyHint)}</p>`
    : "";
  const julieAlt =
    lang === "es" ? "Julie Braunsroth, agente de seguros" : "Julie Braunsroth, insurance agent";
  const agentBarId = lang === "es" ? "licencia" : "license";

  const bulletHtml = bullets.map((b) => `<li>${b}</li>`).join("\n");

  return `<section class="sc-hero sc-hero--answer-first sc-hero--${code.toLowerCase()}" aria-label="${esc(title)}">
  <div class="sc-hero-visual" aria-hidden="true">
    ${heroPicture}
  </div>
  <div class="sc-hero-shade" aria-hidden="true"></div>
  <div class="container sc-hero-inner">
    <div class="sc-hero-copy">
      <h1 class="sc-hero-title">${esc(title)}</h1>
      <p class="sc-hero-lead">${lead}</p>
      <ul class="sc-hero-bullets sc-hero-bullets--short">
${bulletHtml}
      </ul>
      <div class="sc-hero-cta-row">
        <a class="btn sc-hero-cta" href="${quoteHref}">${esc(ctaLabel)}</a>
      </div>
    </div>
  </div>
  <div class="sc-hero-agentbar" id="${agentBarId}">
    <div class="container sc-hero-agentbar-inner">
      <div class="sc-hero-agent-identity">
        <picture class="sc-hero-agent-photo">
          <source type="image/webp" srcset="${imgPrefix}img/opt/julie-facebook-headshot.webp?v=20260928"/>
          <img src="${imgPrefix}img/opt/julie-facebook-headshot.jpg?v=20260928" alt="${esc(julieAlt)}" width="96" height="96" loading="lazy" decoding="async"/>
        </picture>
        <div class="sc-hero-agent-meta">
          <p class="sc-hero-agent-kicker mb-1">${esc(agentLabel)}</p>
          <p class="sc-hero-agent-name mb-1"><strong>Julie Braunsroth</strong> · ${esc(
            lang === "es" ? lic.typeEs : lic.typeEn
          )} · ${lang === "es" ? "Licencia" : "License"} <strong>#${esc(lic.number)}</strong></p>
          <p class="sc-hero-agent-npn mb-0">NPN #${NPN}</p>
        </div>
      </div>
      <div class="sc-hero-agent-actions-col">
        <div class="sc-hero-agent-actions">
          <button type="button" class="btn btn-sm sc-hero-lic-btn" data-mvi-open-license="${esc(code)}">${esc(viewLic)}</button>
          <a class="btn btn-sm sc-hero-lic-btn-outline" href="${verifyHref}" target="_blank" rel="noopener"${verifyHint ? ` title="${esc(verifyHint)}"` : ""}>${esc(naic)}</a>
        </div>
        ${verifyHintHtml}
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
    /((?:href|src|srcset)=")(?!https?:|\/|#|\.\.|tel:|mailto:|sms:)([^"]+)/g,
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
  OH: {
    typeEs: "Productora no residente",
    typeEn: "Non-resident producer",
    number: "1777665",
    pdf: "julie-license-oh.pdf?v=20260928-cert",
    verifyUrl: "https://gateway.insurance.ohio.gov/UI/ODI.Agent.Public.UI/AgentSearch.mvc/DisplaySearch",
    verifyLabel: { es: "Verificar en Ohio", en: "Verify in Ohio" },
  },
  NM: { typeEs: "Productora no residente", typeEn: "Non-resident producer", number: "21695431", pdf: "julie-license-nm.pdf?v=20260928-cert" },
  SC: { typeEs: "Productora no residente", typeEn: "Non-resident producer", number: "21695431", pdf: "julie-license-sc.pdf?v=20260928-cert" },
  SD: { typeEs: "Productora no residente", typeEn: "Non-resident producer", number: "21695431", pdf: "julie-license-sd.pdf?v=20260928-cert" },
  CA: {
    typeEs: "Productora no residente",
    typeEn: "Non-resident producer",
    number: "4586251",
    pdf: "julie-license-ca.pdf?v=20261009",
    verifyUrl: "https://www.insurance.ca.gov/license-status/",
    verifyLabel: { es: "Verificar en California (CDI)", en: "Verify in California (CDI)" },
  },
  TX: {
    typeEs: "Productora no residente",
    typeEn: "Non-resident producer",
    number: "3561085",
    pdf: "julie-license-tx.pdf?v=20261009-sircon",
    verifyUrl: "https://appscenter.tdi.texas.gov/reports/p/sirconReport",
    verifyLabel: { es: "Verificar en Texas (TDI)", en: "Verify in Texas (TDI)" },
  },
  AZ: {
    typeEs: "Productora no residente",
    typeEn: "Non-resident producer",
    number: "21695431",
    pdf: "julie-license-az.pdf?v=20261009",
    verifyUrl:
      "https://external-lookup-web.prod.naic.org/lookup?jurisdiction=AZ&searchType=Licensee&entityType=IND&npn=21695431",
    verifyLabel: { es: "Verificar en Arizona (NAIC)", en: "Verify in Arizona (NAIC)" },
  },
  MI: {
    typeEs: "Productora no residente",
    typeEn: "Non-resident producer",
    number: "1507864",
    verifyUrl: "https://difs.state.mi.us/locators?searchtype=Insurance",
    verifyLabel: { es: "Verificar en Michigan (DIFS)", en: "Verify in Michigan (DIFS)" },
  },
  VA: {
    typeEs: "Productora no residente",
    typeEn: "Non-resident producer",
    number: "21695431",
    verifyUrl:
      "https://www.scc.virginia.gov/boi/consumerinquiry/search.aspx?searchType=agent",
    verifyLabel: { es: "Verificar en Virginia (SCC)", en: "Verify in Virginia (SCC)" },
  },
};

/** Shown under the agent bar verify button when the state lookup needs extra steps. */
const LICENSE_VERIFY_HINT = {
  CA: {
    en:
      "On CDI’s license status page, search by license number 4586251 or the name Julie Braunsroth.",
    es:
      "En la página de estado de licencia del CDI, busque por el número de licencia 4586251 o el nombre Julie Braunsroth.",
  },
  TX: {
    en:
      "On TDI’s site, open Search for an individual (not business). Enter Julie Braunsroth and Texas license #3561085.",
    es:
      "En el sitio de TDI, abra Buscar una persona (no empresa). Ingrese Julie Braunsroth y la licencia de Texas #3561085.",
  },
  OH: {
    en: "On Ohio’s agent search, look up Julie Braunsroth or license number 1777665.",
    es: "En la búsqueda de agentes de Ohio, busque Julie Braunsroth o el número de licencia 1777665.",
  },
  AZ: {
    en:
      "On NAIC’s public lookup (not License Manager), jurisdiction Arizona · Search type Licensee · Individual. Use NPN 21695431 or last name Braunsroth — do not fill name, NPN, and license number all at once.",
    es:
      "En la búsqueda pública de la NAIC (no License Manager), jurisdicción Arizona · tipo Licensee · Individual. Use NPN 21695431 o apellido Braunsroth — no llene nombre, NPN y número de licencia a la vez.",
  },
  MI: {
    en: "On Michigan DIFS, search for Julie Braunsroth or license number 1507864.",
    es: "En DIFS de Michigan, busque Julie Braunsroth o el número de licencia 1507864.",
  },
  VA: {
    en: "On Virginia SCC agent search, look up Julie Braunsroth or NPN 21695431.",
    es: "En la búsqueda de agentes de Virginia (SCC), busque Julie Braunsroth o NPN 21695431.",
  },
};

const SLUGS = {
  NE: "nebraska",
  KS: "kansas",
  CO: "colorado",
  NV: "nevada",
  OH: "ohio",
  NM: "new-mexico",
  SC: "south-carolina",
  SD: "south-dakota",
  CA: "california",
  TX: "texas",
  AZ: "arizona",
  MI: "michigan",
  VA: "virginia",
};

const NAME_ES = {
  NM: "Nuevo México",
  SC: "Carolina del Sur",
  SD: "Dakota del Sur",
};

function stateName(code, lang) {
  if (lang === "es" && NAME_ES[code]) return NAME_ES[code];
  return DATA.states[code].name;
}

function heroVersion(slug) {
  if (slug === "ohio") return "map-seal-v12";
  if (slug === "new-mexico" || slug === "south-carolina" || slug === "south-dakota") return "map-seal-v1";
  if (slug === "california") return "map-seal-v4";
  if (slug === "texas") return "map-seal-v5";
  if (slug === "arizona") return "map-seal-v5";
  if (slug === "michigan") return "map-seal-v3";
  if (slug === "virginia") return "map-seal-v4";
  return "map-seal-v11";
}

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
      const name = stateName(code, lang);
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
  // Aetna Senior Supplemental appointments end 2026-10-16. Keep the ratings
  // record, but do not show Aetna on public pages until it is reappointed.
  const carriers = [...CARRIER_RATINGS.carriers]
    .filter((c) => c.slug !== "aetna")
    .sort((a, b) => a.rank - b.rank);
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
${appointedCarrierCompareNote(lang)}
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
  const totalLabel = lang === "es" ? "Total del paquete" : "Package total";
  return `<section class="sc-cost-table-block" id="${esc(id)}">
  <div class="sc-cost-table-heading">
    <h3 class="sc-cost-table-title">${esc(title)}</h3>
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
  <div class="sc-cost-package-total" aria-label="${esc(totalLabel)}">
    <p class="sc-cost-package-total__label">${esc(totalLabel)}</p>
    <div class="sc-cost-package-total__grid">
      <div class="sc-cost-package-total__item">
        <span class="sc-cost-package-total__key">${esc(thLow)}</span>
        <span class="sc-cost-package-total__val">${moneyOrDash(packageMin)}</span>
      </div>
      <div class="sc-cost-package-total__item">
        <span class="sc-cost-package-total__key">${esc(thHigh)}</span>
        <span class="sc-cost-package-total__val">${moneyOrDash(packageMax)}</span>
      </div>
      <div class="sc-cost-package-total__item sc-cost-package-total__item--avg">
        <span class="sc-cost-package-total__key">${esc(thAvg)}</span>
        <span class="sc-cost-package-total__val">${moneyOrDash(packageAvg)}</span>
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Published grave-space prices only. These are not a statewide average.
 * Opening/closing, a vault, and a marker are extra and are not in these cells.
 */
const PLOT_EXAMPLES = {
  OH: [
    {
      name: "Columbiana Cemetery",
      resident: "$800",
      residentNote: { es: "veteranos $600", en: "veterans $600" },
      nonres: "$900",
      asOf: { es: "10 de junio de 2025", en: "June 10, 2025" },
      url: "https://columbianaohio.gov/firestone-park/cemetery-rates/",
    },
    {
      name: "Germantown Union Cemetery",
      resident: "$750–$1,100",
      residentNote: { es: "según la sección", en: "by section" },
      nonres: { es: "esos precios más $400", en: "those prices plus $400" },
      asOf: { es: "1 de enero de 2025", en: "January 1, 2025" },
      url: "https://germantowncemeteryoh.gov/wp-content/uploads/2026/03/Germantown-Union-Cemetery-Price-Sheet-Foundations-2025.pdf",
    },
    {
      name: "Wellington Union Cemetery",
      resident: "$500",
      nonres: "$650",
      asOf: { es: "1 de enero de 2026", en: "January 1, 2026" },
      url: "https://www.wellingtontownshipohio.gov/_files/ugd/fdcfcb_fcfeeae9cade47ad809278999a13f218.pdf",
    },
  ],
};

/**
 * Private-party asking prices from Grave Solutions recent listings, read 28 Sep 2026.
 * Not a state average. Sold and expired ads are omitted. What the ad includes is stated.
 */
const RESALE_LOTS = {
  NE: {
    board: "https://www.gravesolutions.com/for-sale/cemetery-properties/nebraska",
    rows: [
      { cemetery: "Evergreen Memorial Park, Omaha", what: { es: "1 espacio", en: "1 space" }, asking: "$1,800" },
      { cemetery: "Lincoln Memorial Cemetery", what: { es: "1 espacio", en: "1 space" }, asking: "$2,500" },
      { cemetery: "Westlawn-Hillcrest, Omaha", what: { es: "2 espacios, $2,500 cada uno", en: "2 spaces, $2,500 each" }, asking: "$2,500 each" },
      { cemetery: "Forest Lawn, Omaha", what: { es: "2 espacios, $3,000 cada uno", en: "2 spaces, $3,000 each" }, asking: "$3,000 each" },
      { cemetery: "Calvary, Omaha", what: { es: "2 espacios juntos", en: "2 spaces together" }, asking: "$4,000" },
    ],
  },
  KS: {
    board: "https://www.gravesolutions.com/for-sale/cemetery-properties/kansas",
    rows: [
      { cemetery: "White Chapel Memorial Gardens, Wichita", what: { es: "4 espacios, $1,200 cada uno", en: "4 spaces, $1,200 each" }, asking: "$1,200 each" },
      { cemetery: "White Chapel Memorial Gardens, Wichita", what: { es: "4 espacios, $1,699 cada uno", en: "4 spaces, $1,699 each" }, asking: "$1,699 each" },
      { cemetery: "Memorial Park Cemetery, Topeka", what: { es: "6 espacios, $2,000 cada uno; incluye cuidado perpetuo", en: "6 spaces, $2,000 each; perpetual care included" }, asking: "$2,000 each" },
      { cemetery: "Mount Hope Cemetery, Topeka", what: { es: "2 espacios, $2,000 cada uno", en: "2 spaces, $2,000 each" }, asking: "$2,000 each" },
      { cemetery: "Old Mission, Wichita", what: { es: "2 espacios, $2,500 cada uno", en: "2 spaces, $2,500 each" }, asking: "$2,500 each" },
    ],
  },
  CO: {
    board: "https://www.gravesolutions.com/for-sale/cemetery-properties/colorado",
    rows: [
      { cemetery: "Roselawn Cemetery, Pueblo", what: { es: "1 espacio", en: "1 space" }, asking: "$2,000" },
      { cemetery: "Crown Hill, Wheat Ridge", what: { es: "2 espacios juntos", en: "2 spaces together" }, asking: "$3,200" },
      { cemetery: "Fairmount Cemetery, Denver", what: { es: "1 espacio; el vendedor paga el traspaso", en: "1 space; seller pays the transfer" }, asking: "$7,800" },
      { cemetery: "Highland Cemetery, Thornton", what: { es: "2 espacios; el traspaso va incluido", en: "2 spaces; transfer fee included" }, asking: "$8,000" },
      { cemetery: "Crown Hill, Wheat Ridge", what: { es: "2 espacios, $7,600 cada uno", en: "2 spaces, $7,600 each" }, asking: "$7,600 each" },
    ],
  },
  NV: {
    board: "https://www.gravesolutions.com/for-sale/cemetery-properties/nevada",
    rows: [
      { cemetery: "Palm Eastern, Las Vegas", what: { es: "1 espacio en Garden of Devotion", en: "1 space in the Garden of Devotion" }, asking: "$3,800" },
      { cemetery: "Palm Memorial Park Northwest, Las Vegas", what: { es: "1 espacio", en: "1 space" }, asking: "$4,500" },
      { cemetery: "Mountain View Cemetery, Reno", what: { es: "1 cripta; incluye marcador y apertura", en: "1 crypt; marker and opening included" }, asking: "$4,900" },
      { cemetery: "Palm Mortuary, Las Vegas", what: { es: "cripta doble para 2; incluye 2 bóvedas", en: "double lawn crypt for 2; 2 vaults included" }, asking: "$7,500" },
    ],
  },
  OH: {
    board: "https://www.gravesolutions.com/for-sale/cemetery-properties/ohio",
    rows: [
      { cemetery: "Forest Lawn Memorial Park, Youngstown", what: { es: "2 espacios juntos", en: "2 spaces together" }, asking: "$1,000" },
      { cemetery: "Floral Hills Memory Gardens, Lancaster", what: { es: "1 entierro de adulto más 1 cremación, o 2 cremaciones", en: "1 adult burial plus 1 cremation, or 2 cremations" }, asking: "$1,100" },
      { cemetery: "Hillside Memorial Gardens, Akron", what: { es: "2 espacios juntos", en: "2 spaces together" }, asking: "$2,000" },
      { cemetery: "Glen Haven Memorial Gardens, New Carlisle", what: { es: "3 espacios, $2,000 cada uno", en: "3 spaces, $2,000 each" }, asking: "$2,000 each" },
      { cemetery: "Crown Hill Cemetery, Twinsburg", what: { es: "2 espacios juntos", en: "2 spaces together" }, asking: "$4,000" },
    ],
  },
  NM: {
    board: "https://www.gravesolutions.com/for-sale/cemetery-properties/new-mexico",
    rows: [
      { cemetery: "Memory Gardens of the Valley, Santa Teresa", what: { es: "2 espacios, $4,000 cada uno", en: "2 spaces, $4,000 each" }, asking: "$4,000 each" },
      { cemetery: "Hillcrest Memorial Gardens, Las Cruces", what: { es: "2 espacios juntos", en: "2 spaces together" }, asking: "$10,000" },
      { cemetery: "Hillcrest Memorial Gardens, Las Cruces", what: { es: "2 espacios juntos, Garden of Gethsemane", en: "2 spaces together, Garden of Gethsemane" }, asking: "$11,500" },
    ],
  },
  SC: {
    board: "https://www.gravesolutions.com/for-sale/cemetery-properties/south-carolina",
    rows: [
      { cemetery: "Greenlawn Memorial Park, Columbia", what: { es: "2 espacios, $2,250 cada uno", en: "2 spaces, $2,250 each" }, asking: "$2,250 each" },
      { cemetery: "Greenlawn Memorial Park, Columbia", what: { es: "2 lotes con bóvedas", en: "2 lots with vaults" }, asking: "$9,840" },
      { cemetery: "Greenville Memorial Gardens, Piedmont", what: { es: "cripta de césped de doble profundidad, con 2 aperturas", en: "double-depth lawn crypt, with 2 openings" }, asking: "$10,000" },
      { cemetery: "Greenlawn Memorial Gardens, Greenville", what: { es: "cripta de césped de doble profundidad, con 2 aperturas", en: "double-depth lawn crypt, with 2 openings" }, asking: "$12,284" },
    ],
  },
  SD: {
    board: "https://www.gravesolutions.com/for-sale/cemetery-properties/south-dakota",
    rows: [
      { cemetery: "Hills of Rest Cemetery, Sioux Falls", what: { es: "1 nicho de columbario de granito", en: "1 granite columbarium niche" }, asking: "$2,200" },
    ],
  },
};

function resaleBlock(code, lang) {
  const pack = RESALE_LOTS[code];
  if (!pack) return "";
  const es = lang === "es";
  const askLabel = es ? "Piden" : "Asking";
  const body = pack.rows
    .map(
      (row) => `<article class="sc-plot-card">
      <p class="sc-plot-name">${esc(row.cemetery)}</p>
      <p class="sc-plot-price"><span>${askLabel}</span> ${esc(row.asking)}</p>
      <p class="sc-plot-note">${esc(row.what[lang])}</p>
    </article>`
    )
    .join("\n");
  const intro = es
    ? "Si alguien ya tiene el lote y no lo va a usar, lo puede revender. Estos son anuncios de particulares en Grave Solutions, leídos el 28 de septiembre de 2026. No son la lista del cementerio ni un promedio del estado. El cementerio tiene que pasar la escritura. Confirme que el anuncio sigue activo."
    : "If someone already owns a plot and will not use it, they can resell it. These are private-party ads on Grave Solutions, read on September 28, 2026. They are not the cemetery’s list and not a statewide average. The cemetery still has to transfer the deed. Confirm the ad is still active.";
  return `<h3 class="h5 fw-bold mt-4 mb-3" style="color:#1a365d;">${es ? "Precios de reventa (particulares)" : "Resale asking prices (private sellers)"}</h3>
    <p class="text-body-secondary mb-3">${intro}</p>
    <div class="sc-plot-cards">
          ${body}
    </div>
    <p class="small text-muted mb-0"><a href="${esc(pack.board)}" rel="noopener" target="_blank">${es ? "Ver anuncios actuales en Grave Solutions" : "See current ads on Grave Solutions"}</a></p>`;
}

/**
 * Cemetery plot + vault + marker block (expense bucket 2 under the funeral-cost H2).
 * Keeps published plot examples and resale cards when we have them for the state.
 */
function cemeteryExpenseBlock(code, lang) {
  const rows = PLOT_EXAMPLES[code] || [];
  const es = lang === "es";
  const residentLabel = es ? "Residente" : "Resident";
  const nonresLabel = es ? "No residente" : "Non-resident";
  const asOfLabel = es ? "Vigente" : "As of";
  const defs = es
    ? [
        {
          title: "Lote (parcela)",
          body: "El espacio de la tumba en el cementerio. Lo cobra el cementerio en una cuenta aparte; no viene en el paquete de la funeraria.",
        },
        {
          title: "Bóveda (contenedor exterior)",
          body: "La mayoría de los cementerios exigen una bóveda para un entierro en tierra: una caja de concreto o plástico alrededor del ataúd, para que la tumba no se hunda. Casi nunca va en el paquete de la funeraria.",
        },
        {
          title: "Marcador o lápida",
          body: "La placa o monumento que identifica la tumba. El cementerio suele aprobar el tamaño y el material, y cobra por colocarlo.",
        },
      ]
    : [
        {
          title: "Burial plot",
          body: "The grave space at the cemetery. The cemetery bills it separately; it is not in the funeral-home package.",
        },
        {
          title: "Vault (outer burial container)",
          body: "Most cemeteries require a vault for ground burial: a concrete or plastic box around the casket so the grave does not sink. It is almost never in the funeral-home package.",
        },
        {
          title: "Marker or headstone",
          body: "The plaque or monument that marks the grave. The cemetery usually must approve size and material, and charges to set it.",
        },
      ];
  const defsHtml = `<dl class="sc-expense-defs">
${defs
  .map(
    (d) => `  <div class="sc-expense-def">
    <dt>${esc(d.title)}</dt>
    <dd>${esc(d.body)}</dd>
  </div>`
  )
  .join("\n")}
</dl>`;
  const extra = es
    ? "Abrir y cerrar la tumba también es un cargo aparte. No hay un precio único del lote para todo el estado."
    : "Opening and closing the grave is another separate charge. There is no single plot price for the whole state.";
  const listTable = rows.length
    ? `<p class="text-body-secondary mb-3">${extra} ${es ? "Estos son precios publicados del espacio de la tumba:" : "These are published grave-space prices:"}</p>
    <div class="sc-plot-cards">
          ${rows
            .map((row) => {
              const note = row.residentNote
                ? `<p class="sc-plot-note">${esc(row.residentNote[lang])}</p>`
                : "";
              const nonres = typeof row.nonres === "string" ? row.nonres : row.nonres[lang];
              return `<article class="sc-plot-card">
      <p class="sc-plot-name"><a href="${esc(row.url)}" rel="noopener" target="_blank">${esc(row.name)}</a></p>
      <p class="sc-plot-price"><span>${residentLabel}</span> ${esc(row.resident)}</p>
      ${note}
      <dl class="sc-plot-facts">
        <div><dt>${nonresLabel}</dt><dd>${esc(nonres)}</dd></div>
        <div><dt>${asOfLabel}</dt><dd>${esc(row.asOf[lang])}</dd></div>
      </dl>
    </article>`;
            })
            .join("\n")}
    </div>
    <p class="small text-muted mb-0">${es ? "Estos cementerios públicos publican el precio del lote. No son un promedio del estado y no son el precio de un cementerio privado." : "These public cemeteries publish a grave-space price. They are not a statewide average, and they are not a private cemetery’s price."}</p>`
    : `<p class="text-body-secondary mb-0">${extra}</p>`;
  return `<div class="sc-expense-block sc-expense-block--cemetery" id="${es ? "lote" : "burial-plot"}">
  <div class="container sc-expense-block-inner">
    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">${es ? "2. Cementerio: lote, bóveda y marcador" : "2. Cemetery: plot, vault, and marker"}</h3>
    <p class="text-body-secondary mb-3">${es ? "Las tablas de la funeraria <strong>no incluyen</strong> estos cargos. El cementerio los factura por separado." : "The funeral-home tables <strong>do not include</strong> these charges. The cemetery bills them separately."}</p>
    ${defsHtml}
    ${listTable}
    ${resaleBlock(code, lang)}
  </div>
</div>`;
}

/** Other bills after death (expense bucket 3) — keep short; deep dive on existing guides. */
function otherExpenseBlock(lang, prefix) {
  const es = lang === "es";
  const guide = es ? `${prefix}blog/que-son-gastos-finales.html` : `${prefix}what-are-final-expenses.html`;
  const coverage = es
    ? `${prefix}blog/cuanta-cobertura-gastos-finales-necesito.html`
    : `${prefix}is-10000-final-expense-enough.html`;
  const items = es
    ? [
        "Saldos de tarjeta de crédito",
        "Pagos de hipoteca o renta que sigan pendientes",
        "Facturas médicas que no cubrió el seguro de salud",
        "Préstamos pequeños u otras deudas del hogar",
      ]
    : [
        "Credit card balances",
        "Mortgage or rent payments that are still due",
        "Medical bills health insurance did not cover",
        "Small loans or other household debts",
      ];
  return `<div class="sc-expense-block sc-expense-block--other" id="${es ? "otros-gastos" : "other-expenses"}">
  <div class="container sc-expense-block-inner">
    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">${es ? "3. Otros gastos que la familia a menudo sigue debiendo" : "3. Other expenses families often still owe"}</h3>
    <p class="text-body-secondary mb-3">${es ? "Además del funeral y el cementerio, muchas familias usan el beneficio de un seguro de gastos finales para cuentas que no desaparecen al fallecer:" : "Besides the funeral and the cemetery, many families use a final expense benefit for bills that do not disappear when someone dies:"}</p>
    <ul class="text-body-secondary ps-3 mb-3">
${items.map((t) => `      <li class="mb-1">${esc(t)}</li>`).join("\n")}
    </ul>
    <p class="text-body-secondary mb-3">${es ? "El monto exacto depende de cada hogar. Un promedio de funeral no incluye estas deudas." : "The exact amount depends on each household. A funeral average does not include these debts."}</p>
    <ul class="sc-expense-links">
      <li><a href="${esc(guide)}">${es ? "Qué son los gastos finales →" : "What are final expenses? →"}</a></li>
      <li><a href="${esc(coverage)}">${es ? "Cuánta cobertura podría necesitar →" : "How much coverage may be enough →"}</a></li>
    </ul>
  </div>
</div>`;
}

/**
 * Optional 4th cost bucket — see .cursor/rules/state-page-layout.mdc
 * TOC sublines (locked): EN “the easiest way to protect your family” /
 * ES “la forma más sencilla de proteger a su familia”.
 */
const WHY_FINAL_EXPENSE_TOC = {
  en: "the easiest way to protect your family",
  es: "la forma más sencilla de proteger a su familia",
};

/** Default 4th-bucket copy — state name swapped; CA/TX keep hand-tuned openings below. */
function whyFinalExpenseDefaultPack(nameEn, nameEs) {
  return {
    en: {
      paragraphs: [
        `When someone dies in ${nameEn}, money in bank accounts and other assets that were only in that person’s name usually cannot be spent by the family right away. An executor or administrator must be appointed through probate in the county where the person lived, and that court process often takes months—not a few days.`,
        "Funeral homes and cemeteries typically need payment around the time of service. Many families pay those bills out of pocket while they wait for the estate to move through probate.",
        "Final expense whole life insurance pays the named beneficiary after the carrier approves the claim. That payment does not have to wait on probate, so the family can use it for the funeral, travel, unpaid bills, or other costs that cannot wait.",
      ],
      cta: "Get a free quote",
    },
    es: {
      paragraphs: [
        `Cuando alguien fallece en ${nameEs}, el dinero en cuentas bancarias y otros bienes que estaban solo a su nombre por lo general no puede usarlos la familia de inmediato. Tiene que nombrarse un albacea o administrador por el proceso de sucesión (probate) en el condado donde vivía la persona, y ese trámite judicial suele tardar meses, no unos días.`,
        "Las funerarias y los cementerios normalmente cobran cerca de la fecha del servicio. Muchas familias pagan esas facturas de su bolsillo mientras esperan que avance la sucesión.",
        "El seguro de gastos finales (vida entera) paga al beneficiario designado después de que la aseguradora aprueba el reclamo. Ese pago no tiene que esperar a la sucesión, así que la familia puede usarlo para el funeral, viajes, cuentas pendientes u otros gastos que no pueden esperar.",
      ],
      cta: "Cotización gratuita",
    },
  };
}

/** State-specific “why final expense” body copy (probate / paying before the estate is open). */
const WHY_FINAL_EXPENSE = {
  CA: {
    en: {
      paragraphs: [
        "When someone dies in California, money in bank accounts and other assets that were only in that person’s name often cannot be used by the family right away. In many cases a personal representative must be appointed through probate in the county where the person lived, and that court process often takes months—not a few days.",
        "Funeral homes and cemeteries typically need payment around the time of service. Many families pay those bills out of pocket while they wait for the estate to move through probate.",
        "Final expense whole life insurance pays the named beneficiary after the carrier approves the claim. That payment does not have to wait on probate, so the family can use it for the funeral, travel, unpaid bills, or other costs that cannot wait.",
      ],
      cta: "Get a free quote",
    },
    es: {
      paragraphs: [
        "Cuando alguien fallece en California, el dinero en cuentas bancarias y otros bienes que estaban solo a su nombre por lo general no puede usarlos la familia de inmediato. En muchos casos tiene que nombrarse un representante personal por el proceso de sucesión (probate) en el condado donde vivía la persona, y ese trámite judicial suele tardar meses, no unos días.",
        "Las funerarias y los cementerios normalmente cobran cerca de la fecha del servicio. Muchas familias pagan esas facturas de su bolsillo mientras esperan que avance la sucesión.",
        "El seguro de gastos finales (vida entera) paga al beneficiario designado después de que la aseguradora aprueba el reclamo. Ese pago no tiene que esperar a la sucesión, así que la familia puede usarlo para el funeral, viajes, cuentas pendientes u otros gastos que no pueden esperar.",
      ],
      cta: "Cotización gratuita",
    },
  },
  TX: {
    en: {
      paragraphs: [
        "When someone dies in Texas, money in bank accounts and other assets that were only in that person’s name usually cannot be spent by the family right away. An executor or administrator must be appointed through probate in the county where the person lived, and that court process often takes months—not a few days.",
        "Funeral homes and cemeteries typically need payment around the time of service. Many families pay those bills out of pocket while they wait for the estate to move through probate.",
        "Final expense whole life insurance pays the named beneficiary after the carrier approves the claim. That payment does not have to wait on probate, so the family can use it for the funeral, travel, unpaid bills, or other costs that cannot wait.",
      ],
      cta: "Get a free quote",
    },
    es: {
      paragraphs: [
        "Cuando alguien fallece en Texas, el dinero en cuentas bancarias y otros bienes que estaban solo a su nombre por lo general no puede usarlos la familia de inmediato. Tiene que nombrarse un albacea o administrador por el proceso de sucesión (probate) en el condado donde vivía la persona, y ese trámite judicial suele tardar meses, no unos días.",
        "Las funerarias y los cementerios normalmente cobran cerca de la fecha del servicio. Muchas familias pagan esas facturas de su bolsillo mientras esperan que avance la sucesión.",
        "El seguro de gastos finales (vida entera) paga al beneficiario designado después de que la aseguradora aprueba el reclamo. Ese pago no tiene que esperar a la sucesión, así que la familia puede usarlo para el funeral, viajes, cuentas pendientes u otros gastos que no pueden esperar.",
      ],
      cta: "Cotización gratuita",
    },
  },
};

for (const code of Object.keys(SLUGS)) {
  if (WHY_FINAL_EXPENSE[code]) continue;
  WHY_FINAL_EXPENSE[code] = whyFinalExpenseDefaultPack(stateName(code, "en"), stateName(code, "es"));
}

function whyFinalExpenseBlock(code, lang, prefix) {
  const pack = WHY_FINAL_EXPENSE[code];
  if (!pack) return "";
  const es = lang === "es";
  const copy = es ? pack.es : pack.en;
  const quoteHref = `${prefix}quote.html`;
  const sectionId = es ? "por-que-gastos-finales" : "why-final-expense";
  const body = copy.paragraphs.map((p) => `<p class="text-body-secondary mb-3">${esc(p)}</p>`).join("\n");
  return `<div class="sc-expense-block sc-expense-block--why" id="${sectionId}">
  <div class="container sc-expense-block-inner">
    <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">${es ? "4. Por qué un seguro de gastos finales" : "4. Why final expense insurance"}</h3>
    ${body}
    <p class="sc-expense-why-cta mb-0"><a class="btn btn-primary btn-lg" href="${esc(quoteHref)}">${esc(copy.cta)}</a></p>
  </div>
</div>`;
}

/**
 * Locked cost area: H2 + expense buckets (funeral home → cemetery → other [→ why FEP when set]).
 * California template — every state page uses this structure.
 */
function expenseCostSections(code, lang, prefix) {
  const st = DATA.states[code];
  const name = stateName(code, lang);
  const es = lang === "es";
  const sectionId = es ? "costos" : "costs";
  const funeralHomeId = es ? "costos-funeraria" : "funeral-home-costs";
  const funeralGuide = es ? `${prefix}cuanto-cuesta-un-funeral.html` : `${prefix}how-much-does-a-funeral-cost.html`;
  const estimator = `${prefix}final-expense-estimator.html`;
  const hasWhy = Boolean(WHY_FINAL_EXPENSE[code]);
  const whyId = es ? "por-que-gastos-finales" : "why-final-expense";
  const whyTocEs =
    `<li><a href="#${whyId}">Por qué un seguro de gastos finales</a> — ${WHY_FINAL_EXPENSE_TOC.es}</li>`;
  const whyTocEn =
    `<li><a href="#${whyId}">Why final expense insurance</a> — ${WHY_FINAL_EXPENSE_TOC.en}</li>`;
  const toc = es
    ? `<ol class="sc-cost-toc">
      <li><a href="#${funeralHomeId}">Costos de la funeraria</a> — paquetes con total bajo, alto y promedio</li>
      <li><a href="#lote">Cementerio: lote, bóveda y marcador</a> — factura aparte</li>
      <li><a href="#otros-gastos">Otros gastos</a> — tarjetas, hipoteca y deudas similares</li>${hasWhy ? `\n      ${whyTocEs}` : ""}
    </ol>`
    : `<ol class="sc-cost-toc">
      <li><a href="#${funeralHomeId}">Funeral home costs</a> — packages with low, high, and average totals</li>
      <li><a href="#burial-plot">Cemetery: plot, vault, and marker</a> — billed separately</li>
      <li><a href="#other-expenses">Other expenses</a> — credit cards, mortgage, and similar bills</li>${hasWhy ? `\n      ${whyTocEn}` : ""}
    </ol>`;
  const overview = es
    ? `<p class="text-body-secondary mb-3">La cuenta al fallecer suele tener <strong>más de una parte</strong>. En esta página verá ${hasWhy ? "cuatro" : "tres"} grupos, en orden:</p>${toc}`
    : `<p class="text-body-secondary mb-3">The bill after a death usually has <strong>more than one part</strong>. This page walks through ${hasWhy ? "four" : "three"} groups, in order:</p>${toc}`;
  const fhIntro = es
    ? `<p class="text-body-secondary mb-3">Estos son promedios estatales de paquetes de funeraria en ${esc(name)}. Cada tabla lista los servicios del paquete y, al final, el <strong>total del paquete</strong> — bajo, alto y promedio. Datos actualizados ${esc(CAPTURED_AT)}.</p>`
    : `<p class="text-body-secondary mb-3">These are statewide funeral-home package averages for ${esc(name)}. Each chart lists the services in that package, then shows the <strong>package total</strong> — low, high, and average. Updated ${esc(CAPTURED_AT)}.</p>`;
  const fhMore = es
    ? `<ul class="sc-expense-links">
      <li><a href="${esc(funeralGuide)}">Guía completa: cuánto cuesta un funeral →</a></li>
      <li><a href="${esc(estimator)}">Calculadora de gastos finales →</a></li>
    </ul>`
    : `<ul class="sc-expense-links">
      <li><a href="${esc(funeralGuide)}">Full guide: how much a funeral costs →</a></li>
      <li><a href="${esc(estimator)}">Final expense estimator →</a></li>
    </ul>`;
  const source = es
    ? `<p class="small text-muted mt-3 mb-2">Fuente: <a href="${esc(st.sourceUrl)}" rel="noopener" target="_blank">Funeralocity</a> (promedios estatales). Los precios varían por funeraria, ciudad y servicios elegidos.</p>`
    : `<p class="small text-muted mt-3 mb-2">Source: <a href="${esc(st.sourceUrl)}" rel="noopener" target="_blank">Funeralocity</a> (state averages). Prices vary by funeral home, city, and services chosen.</p>`;

  return `<section class="py-5 bg-white border-bottom" id="${sectionId}">
  <div class="container sc-expense-overview px-3 px-md-4">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${es ? `¿Cuánto cuesta un funeral en ${esc(name)}?` : `How much does a funeral cost in ${esc(name)}?`}</h2>
    ${overview}
  </div>

  <div class="sc-expense-block sc-expense-block--funeral" id="${funeralHomeId}">
    <div class="container-fluid sc-cost-section-container px-3 px-md-4">
      <h3 class="h5 fw-bold mb-3" style="color:#1a365d;">${es ? "1. Costos de la funeraria" : "1. Funeral home costs"}</h3>
      ${fhIntro}
      ${costTable(code, lang)}
      ${source}
      ${thirdPartyFuneralAverageNote(lang)}
      ${fhMore}
    </div>
  </div>

  ${cemeteryExpenseBlock(code, lang)}
  ${otherExpenseBlock(lang, prefix)}
  ${whyFinalExpenseBlock(code, lang, prefix)}
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
      ? `<p class="small text-body-secondary mb-3">Toque un <strong>tipo de servicio</strong> para una explicación breve. Los ítems con * son promedios de mercancía (sin rango bajo/alto publicado).</p>`
      : `<p class="small text-body-secondary mb-3">Tap a <strong>service type</strong> for a short explanation. Items marked * are merchandise averages (no published low/high range).</p>`;

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

function citiesSection(code, lang) {
  if (code === "AZ") return "";
  if (code === "CA") {
    if (lang === "es") {
      return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en California</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro para las ciudades más grandes del estado.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="california/los-angeles.html">Los Ángeles</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="california/san-diego.html">San Diego</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="california/san-jose.html">San José</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="california/san-francisco.html">San Francisco</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="california/fresno.html">Fresno</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="california/sacramento.html">Sacramento</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
    }
    return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in California</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides for California’s largest cities.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="california/los-angeles.html">Los Angeles</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="california/san-diego.html">San Diego</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="california/san-jose.html">San Jose</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="california/san-francisco.html">San Francisco</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="california/fresno.html">Fresno</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="california/sacramento.html">Sacramento</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
  }
  if (code === "KS") {
    if (lang === "es") {
      return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en Kansas</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro para las ciudades de más de 50,000 residentes.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="kansas/wichita.html">Wichita</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="kansas/overland-park.html">Overland Park</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="kansas/kansas-city.html">Kansas City, Kansas</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="kansas/olathe.html">Olathe</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="kansas/topeka.html">Topeka</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="kansas/lawrence.html">Lawrence</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="kansas/shawnee.html">Shawnee</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="kansas/lenexa.html">Lenexa</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="kansas/manhattan.html">Manhattan</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
    }
    return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in Kansas</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides for cities with more than 50,000 residents.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="kansas/wichita.html">Wichita</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="kansas/overland-park.html">Overland Park</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="kansas/kansas-city.html">Kansas City, Kansas</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="kansas/olathe.html">Olathe</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="kansas/topeka.html">Topeka</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="kansas/lawrence.html">Lawrence</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="kansas/shawnee.html">Shawnee</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="kansas/lenexa.html">Lenexa</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="kansas/manhattan.html">Manhattan</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
  }
  if (code === "CO") {
    if (lang === "es") {
      return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en Colorado</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro. Denver, Aurora, Colorado Springs, Fort Collins, Pueblo, Boulder, Greeley y Grand Junction tienen página propia.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="colorado/denver.html">Denver</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="colorado/aurora.html">Aurora</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="colorado/colorado-springs.html">Colorado Springs</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="colorado/fort-collins.html">Fort Collins</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="colorado/pueblo.html">Pueblo</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="colorado/boulder.html">Boulder</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="colorado/greeley.html">Greeley</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="colorado/grand-junction.html">Grand Junction</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
    }
    return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in Colorado</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides. Denver, Aurora, Colorado Springs, Fort Collins, Pueblo, Boulder, Greeley, and Grand Junction have their own pages.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="colorado/denver.html">Denver</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="colorado/aurora.html">Aurora</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="colorado/colorado-springs.html">Colorado Springs</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="colorado/fort-collins.html">Fort Collins</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="colorado/pueblo.html">Pueblo</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="colorado/boulder.html">Boulder</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="colorado/greeley.html">Greeley</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="colorado/grand-junction.html">Grand Junction</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
  }
  if (code === "NV") {
    if (lang === "es") {
      return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en Nevada</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro. Las Vegas, Henderson, Reno, Sparks y Carson City tienen página propia. North Las Vegas va en la guía de Las Vegas.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="nevada/las-vegas.html">Las Vegas</a> — seguro de gastos finales y de entierro, funerarias y lotes. Incluye North Las Vegas.</li>
      <li class="mb-2"><a href="nevada/henderson.html">Henderson</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="nevada/reno.html">Reno</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="nevada/sparks.html">Sparks</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="nevada/carson-city.html">Carson City</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
    }
    return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in Nevada</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides. Las Vegas, Henderson, Reno, Sparks, and Carson City have their own pages. North Las Vegas is on the Las Vegas guide.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="nevada/las-vegas.html">Las Vegas</a> — final expense and burial insurance, funeral homes, and plots. Includes North Las Vegas.</li>
      <li class="mb-2"><a href="nevada/henderson.html">Henderson</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="nevada/reno.html">Reno</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="nevada/sparks.html">Sparks</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="nevada/carson-city.html">Carson City</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
  }
  if (code === "OH") {
    if (lang === "es") {
      return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en Ohio</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro. Columbus, Cleveland, Cincinnati, Toledo, Akron y Dayton tienen página propia.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="ohio/columbus.html">Columbus</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="ohio/cleveland.html">Cleveland</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="ohio/cincinnati.html">Cincinnati</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="ohio/toledo.html">Toledo</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="ohio/akron.html">Akron</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="ohio/dayton.html">Dayton</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
    }
    return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in Ohio</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides. Columbus, Cleveland, Cincinnati, Toledo, Akron, and Dayton have their own pages.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="ohio/columbus.html">Columbus</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="ohio/cleveland.html">Cleveland</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="ohio/cincinnati.html">Cincinnati</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="ohio/toledo.html">Toledo</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="ohio/akron.html">Akron</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="ohio/dayton.html">Dayton</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
  }
  if (code === "NM") {
    if (lang === "es") {
      return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en Nuevo México</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro. Albuquerque, Las Cruces, Rio Rancho y Santa Fe tienen página propia.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="new-mexico/albuquerque.html">Albuquerque</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="new-mexico/las-cruces.html">Las Cruces</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="new-mexico/rio-rancho.html">Rio Rancho</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="new-mexico/santa-fe.html">Santa Fe</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
    }
    return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in New Mexico</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides. Albuquerque, Las Cruces, Rio Rancho, and Santa Fe have their own pages.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="new-mexico/albuquerque.html">Albuquerque</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="new-mexico/las-cruces.html">Las Cruces</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="new-mexico/rio-rancho.html">Rio Rancho</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="new-mexico/santa-fe.html">Santa Fe</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
  }
  if (code === "SC") {
    if (lang === "es") {
      return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en Carolina del Sur</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro. Charleston, Columbia, North Charleston, Mount Pleasant, Rock Hill y Greenville tienen página propia.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="south-carolina/charleston.html">Charleston</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="south-carolina/columbia.html">Columbia</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="south-carolina/north-charleston.html">North Charleston</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="south-carolina/mount-pleasant.html">Mount Pleasant</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="south-carolina/rock-hill.html">Rock Hill</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="south-carolina/greenville.html">Greenville</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
    }
    return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in South Carolina</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides. Charleston, Columbia, North Charleston, Mount Pleasant, Rock Hill, and Greenville have their own pages.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="south-carolina/charleston.html">Charleston</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="south-carolina/columbia.html">Columbia</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="south-carolina/north-charleston.html">North Charleston</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="south-carolina/mount-pleasant.html">Mount Pleasant</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="south-carolina/rock-hill.html">Rock Hill</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="south-carolina/greenville.html">Greenville</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
  }
  if (code === "SD") {
    if (lang === "es") {
      return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en Dakota del Sur</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro. Sioux Falls y Rapid City tienen página propia.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="south-dakota/sioux-falls.html">Sioux Falls</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="south-dakota/rapid-city.html">Rapid City</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
    }
    return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in South Dakota</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides. Sioux Falls and Rapid City have their own pages.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="south-dakota/sioux-falls.html">Sioux Falls</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="south-dakota/rapid-city.html">Rapid City</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
  }
  if (code !== "NE") return "";
  if (lang === "es") {
    return `<section class="py-5 bg-light border-bottom" id="ciudades">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Ciudades en Nebraska</h2>
    <p class="text-body-secondary mb-3">Guías locales de seguro de gastos finales y de entierro. Omaha, Lincoln y Grand Island tienen página propia.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="nebraska/omaha.html">Omaha</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="nebraska/lincoln.html">Lincoln</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
      <li class="mb-2"><a href="nebraska/grand-island.html">Grand Island</a> — seguro de gastos finales y de entierro, funerarias y lotes.</li>
    </ul>
  </div>
</section>
`;
  }
  return `<section class="py-5 bg-light border-bottom" id="cities">
  <div class="container" style="max-width:60rem;">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Cities in Nebraska</h2>
    <p class="text-body-secondary mb-3">Local final expense and burial insurance guides. Omaha, Lincoln, and Grand Island each have their own page.</p>
    <ul class="mb-0">
      <li class="mb-2"><a href="nebraska/omaha.html">Omaha</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="nebraska/lincoln.html">Lincoln</a> — final expense and burial insurance, funeral homes, and plots.</li>
      <li class="mb-2"><a href="nebraska/grand-island.html">Grand Island</a> — final expense and burial insurance, funeral homes, and plots.</li>
    </ul>
  </div>
</section>
`;
}

function renderEs(code) {
  const st = DATA.states[code];
  const lic = LICENSE[code];
  const slug = SLUGS[code];
  const name = stateName(code, "es");
  const prefix = "../";
  const canon = `https://www.mejorvidainsurance.com/estados/${slug}.html`;
  const enCanon = `https://www.mejorvidainsurance.com/en/states/${slug}.html`;
  const title = `Seguro de gastos finales en ${name} | Mejor Vida Seguros`;
  const desc = `Mejor Vida Seguros cotiza seguro de gastos finales en ${name}. Costos funerarios promedio, aseguradoras y licencia #${lic.number} (NPN #${NPN}).`;

  return `<!DOCTYPE html>
<html class="lang-es" lang="es-US">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="robots" content="index, follow"/>
<link href="${canon}" rel="canonical"/>
<link href="${canon}" hreflang="es-US" rel="alternate"/>
<link href="${enCanon}" hreflang="en-US" rel="alternate"/>
<link href="${canon}" hreflang="x-default" rel="alternate"/>
<link href="${prefix}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${prefix}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${prefix}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${prefix}css/state-coverage.css?v=20261009-hero-bleed" rel="stylesheet"/>
<link href="${prefix}css/mvi-licensing-map.css?v=20261009-mobile-pdf" rel="stylesheet"/>
<link href="${prefix}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${prefix}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${prefix}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${prefix}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${prefix}css/nav-about-mega.css?v=20260905-search" rel="stylesheet"/>
<link href="${prefix}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${prefix}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:locale" content="es_US"/>
<link rel="preload" as="image" href="${prefix}img/opt/logo-spanish2.webp" type="image/webp" fetchpriority="high"/>
<link rel="preload" as="image" href="${prefix}img/opt/${slug}-hero.webp?v=${heroVersion(slug)}" type="image/webp"/>
<script>(function(){document.documentElement.lang="es-US";document.documentElement.className="lang-es";})();</script>
</head>
<body class="bg-white state-coverage-page" data-licenses-base="${prefix}licenses/">
${loadHeaderEs(slug)}
<main class="state-coverage-readability">
${stateHero(code, "es", prefix, prefix)}

${expenseCostSections(code, "es", prefix)}

<section class="py-5 bg-light border-bottom" id="aseguradoras">
  <div class="container-fluid sc-carrier-section-container px-3 px-lg-4">
    <h2 class="h4 fw-bold mb-2" style="color:#1a365d;">Aseguradoras que Mejor Vida Seguros puede comparar en ${esc(name)}</h2>
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
      <li class="mb-2">Mejor Vida Seguros atiende por teléfono, WhatsApp y cotización en línea a residentes de ${esc(name)}.</li>
    </ul>
    <p class="mb-0"><a href="${prefix}blog/que-es-seguro-gastos-finales.html">Qué es el seguro de gastos finales →</a></p>
  </div>
</section>

<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">Cotice gastos finales en ${esc(name)}</h2>
    <p class="mb-4 text-white-50">Cotización gratuita. Mejor Vida Seguros compara opciones según su edad, salud y presupuesto.</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${prefix}quote.html">Cotización gratuita</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="/schedule-julie.html">Agendar una llamada</a>
    </div>
  </div>
</section>

${citiesSection(code, "es")}
</main>
${licenseModal("es")}
${loadFooterEs()}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${prefix}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${prefix}script.js"></script>
<script defer src="${prefix}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${prefix}js/mvi-licensing-map.js?v=20261009-mobile-pdf"></script>
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
  const desc = `Mejor Vida Insurance quotes final expense life insurance in ${name}. Average funeral costs, carriers we compare, and license #${lic.number} (NPN #${NPN}).`;

  return `<!DOCTYPE html>
<html class="lang-en" lang="en-US">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="robots" content="noindex, follow"/>
<link href="${canon}" rel="canonical"/>
<link href="${esCanon}" hreflang="es-US" rel="alternate"/>
<link href="${canon}" hreflang="en-US" rel="alternate"/>
<link href="${root}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${root}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${root}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/state-coverage.css?v=20261009-hero-bleed" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20261009-mobile-pdf" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${canon}"/>
<link rel="preload" as="image" href="${root}img/opt/logo-english2.webp" type="image/webp" fetchpriority="high"/>
<link rel="preload" as="image" href="${root}img/opt/${slug}-hero.webp?v=${heroVersion(slug)}" type="image/webp"/>
<script>(function(){document.documentElement.lang="en-US";document.documentElement.className="lang-en";})();</script>
</head>
<body class="bg-white state-coverage-page" data-licenses-base="${root}licenses/">
${loadHeaderEn(slug)}
<main class="state-coverage-readability">
${stateHero(code, "en", en, root)}

${expenseCostSections(code, "en", en)}

<section class="py-5 bg-light border-bottom" id="carriers">
  <div class="container-fluid sc-carrier-section-container px-3 px-lg-4">
    <h2 class="h4 fw-bold mb-2" style="color:#1a365d;">Carriers Mejor Vida Insurance can compare in ${esc(name)}</h2>
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
      <li class="mb-2">Mejor Vida Insurance serves ${esc(name)} residents by phone, WhatsApp, and online quote.</li>
    </ul>
    <p class="mb-0"><a href="${root}blog/que-es-seguro-gastos-finales.html">What is final expense insurance →</a></p>
  </div>
</section>

<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">Get a final expense quote in ${esc(name)}</h2>
    <p class="mb-4 text-white-50">Free quote. Mejor Vida Insurance compares options based on your age, health, and budget.</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${en}quote.html">Free quote</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="/en/schedule-julie.html">Schedule a call</a>
    </div>
  </div>
</section>

${citiesSection(code, "en")}
</main>
${licenseModal("en")}
${loadFooterEn()}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${root}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${root}script.js"></script>
<script defer src="${root}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${root}js/mvi-licensing-map.js?v=20261009-mobile-pdf"></script>
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
