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

let _faqCache = null;
function loadFaqIndex() {
  if (!_faqCache) {
    _faqCache = JSON.parse(fs.readFileSync(FAQ_INDEX, "utf8"));
  }
  return _faqCache;
}

function findGuideMeta(slug) {
  const data = loadFaqIndex();
  for (const cat of data.categories) {
    const match = cat.guides.find((g) => g.slug === slug);
    if (match) return match;
  }
  return null;
}

/** Standalone education pages that count as published for a catalog slug. */
const GUIDE_PAGE_ALIASES = {
  "seguro-gastos-finales-mayores-80": {
    es: { root: "seguro-vida-mayores-80.html", fromBlog: "../seguro-vida-mayores-80.html" },
    en: { root: "life-insurance-seniors-over-80.html" },
  },
  "seguro-gastos-finales-mayores-85": {
    es: { root: "seguro-vida-mayores-85.html", fromBlog: "../seguro-vida-mayores-85.html" },
    en: { root: "life-insurance-seniors-over-85.html" },
  },
  "cuanto-cuesta-un-funeral": {
    es: { root: "cuanto-cuesta-un-funeral.html", fromBlog: "../cuanto-cuesta-un-funeral.html" },
    en: { root: "how-much-does-a-funeral-cost.html" },
  },
  "funerales-prepagados": {
    es: { root: "funerales-prepagados.html", fromBlog: "../funerales-prepagados.html" },
    en: { root: "prepaid-funerals.html" },
  },
  "como-pagar-un-funeral": {
    es: { root: "como-pagar-un-funeral.html", fromBlog: "../como-pagar-un-funeral.html" },
    en: { root: "how-to-pay-for-a-funeral.html" },
  },
  "como-planificar-su-funeral": {
    es: { root: "como-planificar-su-funeral.html", fromBlog: "../como-planificar-su-funeral.html" },
    en: { root: "how-to-plan-your-funeral.html" },
  },
  "planificacion-patrimonial": {
    es: { root: "planificacion-patrimonial.html", fromBlog: "../planificacion-patrimonial.html" },
    en: { root: "estate-planning.html" },
  },
};

const TOC_COPY = {
  es: {
    onThisPage: "En esta página",
    onThisGuide: "En esta guía",
    hubGroup: "Centro de educación",
    allGuides: "Todas las guías de Mejor Vida",
    barLabel: "Índice de contenidos",
    trigger: "Índice de contenidos",
    hubBar: "Todas las guías",
    drawerTitle: "Índice de contenidos",
    close: "Cerrar",
    hubFile: "guias-gastos-finales.html",
    soonBadge: "Próximamente",
    cardFoot: "Guía de Mejor Vida →",
    soonFoot: "Guía de Mejor Vida",
    sections: [
      { id: "fe-guide-takeaways", label: "Puntos clave" },
      { id: "fe-guide-body", label: "Contenido" },
      { id: "fe-guide-cta", label: "Siguiente paso" },
      { id: "fe-guide-disclosures", label: "Divulgaciones" },
    ],
  },
  en: {
    onThisPage: "On this page",
    onThisGuide: "In this guide",
    hubGroup: "Education hub",
    allGuides: "All Mejor Vida guides",
    barLabel: "Table of contents",
    trigger: "Table of contents",
    hubBar: "All guides",
    drawerTitle: "Table of contents",
    close: "Close",
    hubFile: "final-expense-guides.html",
    soonBadge: "Coming soon",
    cardFoot: "Mejor Vida guide →",
    soonFoot: "Mejor Vida guide",
    sections: [
      { id: "fe-guide-takeaways", label: "Key takeaways" },
      { id: "fe-guide-body", label: "Guide" },
      { id: "fe-guide-cta", label: "Next step" },
      { id: "fe-guide-disclosures", label: "Disclosures" },
    ],
  },
};

function isGuidePublished(slug) {
  if (GUIDE_PAGE_ALIASES[slug]) return true;
  return fs.existsSync(path.join(GUIDES_DIR, `${slug}.json`));
}

function guideLang(options) {
  return (options && options.lang) || "es";
}

function tocCopy(options) {
  return TOC_COPY[guideLang(options)] || TOC_COPY.es;
}

function categoryTitle(cat, options) {
  if (guideLang(options) === "en") {
    return cat.titleEn || cat.title;
  }
  return cat.title;
}

function guideHref(slug, options) {
  const lang = guideLang(options);
  const alias = GUIDE_PAGE_ALIASES[slug];
  const inBlog = options && options.inBlogDir;
  const prefix = (options && options.blogPrefix) || "";
  if (alias) {
    if (lang === "en") return alias.en.root;
    return inBlog ? alias.es.fromBlog : `${prefix}${alias.es.root}`;
  }
  const meta = findGuideMeta(slug);
  const slugEn = (options && options.slugEn) || (meta && meta.slugEn);
  if (lang === "en") {
    if (slugEn) return `${slugEn}.html`;
    return `../blog/${slug}.html`;
  }
  if (inBlog) return `${slug}.html`;
  return `${prefix}blog/${slug}.html`;
}

/**
 * Image path prefix for <picture> assets (homepage + hub at site root → "img/opt/").
 */
function guideImagePrefix(options) {
  if (options && options.imagePrefix != null) return options.imagePrefix;
  return "img/opt/";
}

function guideLabel(g, options) {
  if (guideLang(options) === "en") {
    return g.cardLabelEn || g.questionEn || g.cardLabel || g.question;
  }
  return g.cardLabel || g.question;
}

function guideQuestion(g, options) {
  if (guideLang(options) === "en") {
    return g.questionEn || g.question;
  }
  return g.question;
}

function guideTeaser(g, options) {
  if (guideLang(options) === "en") {
    return g.teaserEn || g.teaser;
  }
  return g.teaser;
}

function homepageCarouselGuides() {
  const data = loadFaqIndex();
  const out = [];
  for (const cat of data.categories) {
    for (const g of cat.guides) {
      if (g.image && isGuidePublished(g.slug)) out.push(g);
    }
  }
  return out;
}

function renderGuideMediaCardInner(g, options, extra = {}) {
  const href = guideHref(g.slug, options || {});
  const imgPrefix = guideImagePrefix(options || {});
  const label = guideLabel(g, options);
  const question = guideQuestion(g, options);
  const teaser = guideTeaser(g, options);
  const webp = `${imgPrefix}${g.image}.webp`;
  const jpg = `${imgPrefix}${g.image}.jpg`;
  const eager = extra.eager === true;
  const imgAttrs = eager
    ? 'fetchpriority="high" decoding="async"'
    : 'loading="lazy" decoding="async"';
  const indexAttr =
    extra.index == null ? "" : ` data-index="${Number(extra.index)}"`;
  const teaserHtml = teaser
    ? `<p class="fe-guide-media-card__teaser">${escHtml(teaser)}</p>`
    : "";
  return (
    `<a class="fe-guide-media-card" data-fe-guide-card${indexAttr} href="${escHtml(href)}" aria-label="${escHtml(question)}">` +
    `<div class="fe-guide-media-card__media">` +
    `<picture>` +
    `<source type="image/webp" srcset="${escHtml(webp)}"/>` +
    `<img src="${escHtml(jpg)}" alt="${escHtml(question)}" width="800" height="600" ${imgAttrs}/>` +
    `</picture>` +
    `</div>` +
    `<div class="fe-guide-media-card__body">` +
    `<h3>${escHtml(label)}</h3>` +
    teaserHtml +
    `</div>` +
    `</a>`
  );
}

function conveyorCopy(options) {
  if (guideLang(options) === "en") {
    return {
      prev: "Shuffle",
      prevAria: "Shuffle the final expense guides to the left",
      next: "Shuffle",
      nextAria: "Shuffle the final expense guides to the right",
      status: (n) => `${n} guides`,
      all: "See all guides",
    };
  }
  return {
    prev: "Barajar",
    prevAria: "Barajar las guías de gastos finales hacia la izquierda",
    next: "Barajar",
    nextAria: "Barajar las guías de gastos finales hacia la derecha",
    status: (n) => `${n} guías`,
    all: "Ver todas las guías",
  };
}

function renderHomepageConveyor(guides, options) {
  const copy = conveyorCopy(options);
  const hubHref = (options && options.hubHref) || tocCopy(options).hubFile;
  const cards = guides
    .map((g, i) => renderGuideMediaCardInner(g, options, { index: i, eager: i < 7 }))
    .join("");
  return (
    `<div class="fe-guide-conveyor" data-fe-guide-conveyor>` +
    `<div class="fe-guide-conveyor__toolbar">` +
    `<p class="fe-guide-conveyor__hub">` +
    `<span class="fe-guide-conveyor__status" data-fe-guide-status>${escHtml(copy.status(guides.length))}</span>` +
    `<span class="fe-guide-conveyor__dot" aria-hidden="true">·</span>` +
    `<a href="${escHtml(hubHref)}">${escHtml(copy.all)}</a>` +
    `</p>` +
    `</div>` +
    `<div class="fe-guide-conveyor__stage">` +
    `<div class="fe-guide-conveyor__slot" data-slot="feature"></div>` +
    `<div class="fe-guide-conveyor__slot" data-slot="t1"></div>` +
    `<div class="fe-guide-conveyor__slot" data-slot="t2"></div>` +
    `<div class="fe-guide-conveyor__slot" data-slot="t3"></div>` +
    `<div class="fe-guide-conveyor__slot" data-slot="b1"></div>` +
    `<div class="fe-guide-conveyor__slot" data-slot="b2"></div>` +
    `<div class="fe-guide-conveyor__slot" data-slot="b3"></div>` +
    `</div>` +
    `<div class="fe-guide-conveyor__pool">` +
    cards +
    `</div>` +
    `<p class="visually-hidden" data-fe-guide-live aria-live="polite"></p>` +
    `<div class="fe-guide-conveyor__footer">` +
    `<button type="button" class="fe-guide-conveyor__nav fe-guide-conveyor__prev" data-fe-guide-prev aria-label="${escHtml(copy.prevAria)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H7M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `<span>${escHtml(copy.prev)}</span>` +
    `</button>` +
    `<button type="button" class="fe-guide-conveyor__nav fe-guide-conveyor__next" data-fe-guide-next aria-label="${escHtml(copy.nextAria)}">` +
    `<span>${escHtml(copy.next)}</span>` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `</button>` +
    `</div>` +
    `</div>`
  );
}

/** editorial image + title card for a published guide (when g.image is set). */
function renderPublishedGuideCard(g, options) {
  const href = guideHref(g.slug, options || {});
  const copy = tocCopy(options);
  if (g.image) {
    return (
      `<div class="col-12 col-md-6">` +
      renderGuideMediaCardInner(g, options, { eager: false }) +
      `</div>`
    );
  }
  return (
    `<div class="col-md-6 col-lg-4">` +
    `<article class="bg-white rounded-3 p-4 shadow-sm h-100 fe-guide-faq-card position-relative">` +
    `<h3 class="h6 fw-bold mb-2" style="color:#1a365d;">` +
    `<a class="text-decoration-none stretched-link" style="color:#1a365d;" href="${escHtml(href)}">${escHtml(guideQuestion(g, options))}</a>` +
    `</h3>` +
    `<p class="small text-body-secondary lh-base mb-2">${escHtml(guideTeaser(g, options))}</p>` +
    `<p class="small mb-0"><span class="text-primary fw-semibold">${escHtml(copy.cardFoot)}</span></p>` +
    `</article></div>`
  );
}

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

  const copy = tocCopy(options);
  const data = loadFaqIndex();
  let html = "";

  if (onHubPage) {
    const hubSections = data.categories.filter((cat) =>
      cat.guides.some((g) => isGuidePublished(g.slug))
    );
    if (hubSections.length) {
      html += '<div class="fe-guide-toc-group">';
      html += `<p class="fe-guide-toc-group-title">${escHtml(copy.onThisPage)}</p>`;
      html += "<ul>";
      hubSections.forEach((cat) => {
        html += `<li><a href="#fe-hub-cat-${escHtml(cat.id)}">${escHtml(categoryTitle(cat, options))}</a></li>`;
      });
      html += "</ul></div>";
    }
  }

  if (includePageSections) {
    html += '<div class="fe-guide-toc-group">';
    html += `<p class="fe-guide-toc-group-title">${escHtml(copy.onThisGuide)}</p>`;
    html += "<ul>";
    copy.sections.forEach((sec) => {
      html += `<li><a href="#${escHtml(sec.id)}">${escHtml(sec.label)}</a></li>`;
    });
    html += "</ul></div>";
  }

  if (includeHubLink) {
    html += '<div class="fe-guide-toc-group">';
    html += `<p class="fe-guide-toc-group-title">${escHtml(copy.hubGroup)}</p>`;
    html += "<ul>";
    html += `<li><a href="${escHtml(hubPrefix)}${escHtml(copy.hubFile)}">${escHtml(copy.allGuides)}</a></li>`;
    html += "</ul></div>";
  }

  data.categories.forEach((cat) => {
    const publishedGuides = cat.guides.filter((g) => isGuidePublished(g.slug));
    if (!publishedGuides.length) return;

    html += '<div class="fe-guide-toc-group">';
    html += `<p class="fe-guide-toc-group-title">${escHtml(categoryTitle(cat, options))}</p>`;
    html += "<ul>";
    publishedGuides.forEach((g) => {
      const isCurrent = g.slug === currentSlug;
      const cls = isCurrent ? ' class="is-current"' : "";
      const label = guideLabel(g, options);
      html += `<li${cls}><a href="${escHtml(guideHref(g.slug, { ...options, blogPrefix, inBlogDir }))}">${escHtml(label)}</a></li>`;
    });
    html += "</ul></div>";
  });

  return html;
}

function renderTocChrome(options) {
  const opts = options || {};
  const copy = tocCopy(opts);
  const listHtml = renderTocDrawerList(opts);
  const hubPrefix = opts.hubPrefix || "";
  const showHubBarLink = opts.showHubBarLink !== false;
  const hubLink =
    showHubBarLink
      ? `<a class="fe-guide-toc-hub-link" href="${escHtml(hubPrefix)}${escHtml(copy.hubFile)}">${escHtml(copy.hubBar)}</a>`
      : "";
  return (
    `<div class="fe-guide-toc-bar" role="navigation" aria-label="${escHtml(copy.barLabel)}">` +
    `<div class="fe-guide-toc-bar-inner">` +
    `<button type="button" class="fe-guide-toc-trigger" id="fe-guide-toc-open" aria-expanded="false" aria-controls="fe-guide-toc-drawer">` +
    `<i class="fas fa-bars" aria-hidden="true"></i> ${escHtml(copy.trigger)}` +
    `</button>` +
    hubLink +
    `</div></div>` +
    `<div class="fe-guide-toc-backdrop" id="fe-guide-toc-backdrop" hidden>` +
    `<aside class="fe-guide-toc-drawer" id="fe-guide-toc-drawer" aria-label="${escHtml(copy.barLabel)}" tabindex="-1">` +
    `<div class="fe-guide-toc-drawer-head">` +
    `<h2 class="fe-guide-toc-drawer-title">${escHtml(copy.drawerTitle)}</h2>` +
    `<button type="button" class="fe-guide-toc-close" id="fe-guide-toc-close" aria-label="${escHtml(copy.close)}">×</button>` +
    `</div>` +
    `<div class="fe-guide-toc-drawer-body">${listHtml}</div>` +
    `</aside></div>`
  );
}

function renderSoonCard(g, options, copy) {
  return (
    `<div class="col-md-6 col-lg-4">` +
    `<article class="rounded-3 p-4 h-100 fe-guide-faq-card fe-guide-faq-card--soon" aria-disabled="true">` +
    `<p class="fe-guide-faq-soon-badge mb-2">${escHtml(copy.soonBadge)}</p>` +
    `<h3 class="h6 fw-bold mb-2 fe-guide-faq-soon-title">${escHtml(guideQuestion(g, options))}</h3>` +
    `<p class="small lh-base mb-2 fe-guide-faq-soon-teaser">${escHtml(guideTeaser(g, options))}</p>` +
    `<p class="small mb-0 fe-guide-faq-soon-foot">${escHtml(copy.soonFoot)}</p>` +
    `</article></div>`
  );
}

function renderHubCategoryCards(cat, options) {
  const copy = tocCopy(options);
  const media = [];
  const text = [];
  for (const g of cat.guides) {
    if (!isGuidePublished(g.slug)) {
      text.push(renderSoonCard(g, options, copy));
    } else if (g.image) {
      media.push(renderPublishedGuideCard(g, options || {}));
    } else {
      text.push(renderPublishedGuideCard(g, options || {}));
    }
  }

  const hideTitle = cat.id === "esencial";
  const labelledBy = hideTitle
    ? ""
    : ` aria-labelledby="fe-hub-cat-title-${escHtml(cat.id)}"`;
  const titleHtml = hideTitle
    ? ""
    : `<h2 class="h4 fw-bold mb-3" style="color:#1a365d;" id="fe-hub-cat-title-${escHtml(cat.id)}">${escHtml(categoryTitle(cat, options))}</h2>`;

  const rows =
    (media.length
      ? `<div class="row g-4 mb-2 fe-guide-media-grid">${media.join("\n")}</div>`
      : "") +
    (text.length ? `<div class="row g-3 mb-2">${text.join("\n")}</div>` : "");

  return (
    `<section class="fe-hub-category" id="fe-hub-cat-${escHtml(cat.id)}"${labelledBy}>` +
    titleHtml +
    rows +
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
  guideQuestion,
  guideTeaser,
  homepageCarouselGuides,
  renderHomepageConveyor,
  renderPublishedGuideCard,
  renderTocChrome,
  renderTocDrawerList,
  renderHubCategoriesHtml,
  escHtml,
};
