/**
 * Shared FE guide catalog helpers (faq index + published state).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FAQ_INDEX = path.join(ROOT, "data/fe-guide-faq-index.json");
const GUIDES_DIR = path.join(ROOT, "data/fe-guides");

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadFaqIndex() {
  return JSON.parse(fs.readFileSync(FAQ_INDEX, "utf8"));
}

function isGuidePublished(slug) {
  return fs.existsSync(path.join(GUIDES_DIR, `${slug}.json`));
}

function guideHref(slug, options) {
  const inBlog = options && options.inBlogDir;
  const prefix = (options && options.blogPrefix) || "";
  if (inBlog) return `${slug}.html`;
  return `${prefix}blog/${slug}.html`;
}

/** In-page sections for individual guide articles. */
const GUIDE_PAGE_SECTIONS = [
  { id: "fe-guide-takeaways", label: "Puntos clave" },
  { id: "fe-guide-body", label: "Contenido" },
  { id: "fe-guide-cta", label: "Siguiente paso" },
  { id: "fe-guide-disclosures", label: "Divulgaciones" },
];

function renderTocDrawerList(options) {
  const {
    currentSlug = "",
    blogPrefix = "",
    hubPrefix = "",
    inBlogDir = false,
    includePageSections = false,
    includeHubLink = true,
    onHubPage = false,
  } = options || {};

  const data = loadFaqIndex();
  let html = "";

  if (onHubPage) {
    const hubSections = data.categories.filter((cat) =>
      cat.guides.some((g) => isGuidePublished(g.slug))
    );
    if (hubSections.length) {
      html += '<div class="fe-guide-toc-group">';
      html += '<p class="fe-guide-toc-group-title">En esta página</p>';
      html += "<ul>";
      hubSections.forEach((cat) => {
        html += `<li><a href="#fe-hub-cat-${escHtml(cat.id)}">${escHtml(cat.title)}</a></li>`;
      });
      html += "</ul></div>";
    }
  }

  if (includePageSections) {
    html += '<div class="fe-guide-toc-group">';
    html += '<p class="fe-guide-toc-group-title">En esta guía</p>';
    html += "<ul>";
    GUIDE_PAGE_SECTIONS.forEach((sec) => {
      html += `<li><a href="#${escHtml(sec.id)}">${escHtml(sec.label)}</a></li>`;
    });
    html += "</ul></div>";
  }

  if (includeHubLink) {
    html += '<div class="fe-guide-toc-group">';
    html += '<p class="fe-guide-toc-group-title">Centro de educación</p>';
    html += "<ul>";
    html += `<li><a href="${escHtml(hubPrefix)}guias-gastos-finales.html">Todas las guías de Mejor Vida</a></li>`;
    html += "</ul></div>";
  }

  data.categories.forEach((cat) => {
    const publishedGuides = cat.guides.filter((g) => isGuidePublished(g.slug));
    if (!publishedGuides.length) return;

    html += '<div class="fe-guide-toc-group">';
    html += `<p class="fe-guide-toc-group-title">${escHtml(cat.title)}</p>`;
    html += "<ul>";
    publishedGuides.forEach((g) => {
      const isCurrent = g.slug === currentSlug;
      const cls = isCurrent ? ' class="is-current"' : "";
      html += `<li${cls}><a href="${escHtml(guideHref(g.slug, { blogPrefix, inBlogDir }))}">${escHtml(g.question)}</a></li>`;
    });
    html += "</ul></div>";
  });

  return html;
}

function renderTocChrome(options) {
  const opts = options || {};
  const listHtml = renderTocDrawerList(opts);
  const hubPrefix = opts.hubPrefix || "";
  const showHubBarLink = opts.showHubBarLink !== false;
  const hubLink =
    showHubBarLink
      ? `<a class="fe-guide-toc-hub-link" href="${escHtml(hubPrefix)}guias-gastos-finales.html">Todas las guías</a>`
      : "";
  return (
    `<div class="fe-guide-toc-bar" role="navigation" aria-label="Índice de contenidos">` +
    `<div class="fe-guide-toc-bar-inner">` +
    `<button type="button" class="fe-guide-toc-trigger" id="fe-guide-toc-open" aria-expanded="false" aria-controls="fe-guide-toc-drawer">` +
    `<i class="fas fa-bars" aria-hidden="true"></i> Índice de contenidos` +
    `</button>` +
    hubLink +
    `</div></div>` +
    `<div class="fe-guide-toc-backdrop" id="fe-guide-toc-backdrop" hidden>` +
    `<aside class="fe-guide-toc-drawer" id="fe-guide-toc-drawer" aria-label="Índice de guías" tabindex="-1">` +
    `<div class="fe-guide-toc-drawer-head">` +
    `<h2 class="fe-guide-toc-drawer-title">Índice de contenidos</h2>` +
    `<button type="button" class="fe-guide-toc-close" id="fe-guide-toc-close" aria-label="Cerrar">×</button>` +
    `</div>` +
    `<div class="fe-guide-toc-drawer-body">${listHtml}</div>` +
    `</aside></div>`
  );
}

function renderHubCategoryCards(cat, options) {
  const cards = cat.guides
    .map((g) => {
      if (isGuidePublished(g.slug)) {
        const href = guideHref(g.slug, options || {});
        return (
          `<div class="col-md-6 col-lg-4">` +
          `<article class="bg-white rounded-3 p-4 shadow-sm h-100 fe-guide-faq-card position-relative">` +
          `<h3 class="h6 fw-bold mb-2" style="color:#1a365d;">` +
          `<a class="text-decoration-none stretched-link" style="color:#1a365d;" href="${escHtml(href)}">${escHtml(g.question)}</a>` +
          `</h3>` +
          `<p class="small text-body-secondary lh-base mb-2">${escHtml(g.teaser)}</p>` +
          `<p class="small mb-0"><span class="text-primary fw-semibold">Guía de Mejor Vida →</span></p>` +
          `</article></div>`
        );
      }
      return (
        `<div class="col-md-6 col-lg-4">` +
        `<article class="rounded-3 p-4 h-100 fe-guide-faq-card fe-guide-faq-card--soon" aria-disabled="true">` +
        `<p class="fe-guide-faq-soon-badge mb-2">Próximamente</p>` +
        `<h3 class="h6 fw-bold mb-2 fe-guide-faq-soon-title">${escHtml(g.question)}</h3>` +
        `<p class="small lh-base mb-2 fe-guide-faq-soon-teaser">${escHtml(g.teaser)}</p>` +
        `<p class="small mb-0 fe-guide-faq-soon-foot">Guía de Mejor Vida</p>` +
        `</article></div>`
      );
    })
    .join("\n");

  return (
    `<section class="fe-hub-category" id="fe-hub-cat-${escHtml(cat.id)}" aria-labelledby="fe-hub-cat-title-${escHtml(cat.id)}">` +
    `<h2 class="h4 fw-bold mb-3" style="color:#1a365d;" id="fe-hub-cat-title-${escHtml(cat.id)}">${escHtml(cat.title)}</h2>` +
    `<div class="row g-3 mb-2">${cards}</div>` +
    `</section>`
  );
}

function renderHubCategoriesHtml(options) {
  const data = loadFaqIndex();
  return data.categories.map((cat) => renderHubCategoryCards(cat, options)).join("\n");
}

module.exports = {
  loadFaqIndex,
  isGuidePublished,
  guideHref,
  renderTocChrome,
  renderTocDrawerList,
  renderHubCategoriesHtml,
  escHtml,
};
