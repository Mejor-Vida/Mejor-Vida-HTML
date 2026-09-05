#!/usr/bin/env node
/**
 * Render homepage FAQ guide cards + FAQPage JSON-LD from data/fe-guide-faq-index.json
 * Usage: node scripts/render-fe-guide-faq-index.js
 */
const fs = require("fs");
const path = require("path");
const {
  loadFaqIndex,
  isGuidePublished,
  renderPublishedGuideCard,
} = require("../lib/fe-guide-catalog");

const ROOT = path.join(__dirname, "..");
const CSS_V = "20260903-guide-labels";

const TARGETS = [
  {
    file: path.join(ROOT, "index.html"),
    lang: "es",
    imagePrefix: "img/opt/",
    blogPrefix: "",
    hubHref: "guias-gastos-finales.html",
    cssHref: `css/fe-guide.css?v=${CSS_V}`,
    containerMaxWidth: "52rem",
    cssAttr: 'href="css/fe-guide.css',
  },
  {
    file: path.join(ROOT, "en/index.html"),
    lang: "en",
    imagePrefix: "../img/opt/",
    blogPrefix: "../",
    hubHref: "../guias-gastos-finales.html",
    cssHref: `../css/fe-guide.css?v=${CSS_V}`,
    containerMaxWidth: null,
    cssAttr: 'href="../css/fe-guide.css',
  },
];

function soonCopy(lang, soonCount, hubHref) {
  if (lang === "en") {
    return `      <div class="text-center mt-4 mb-1">
        <a class="fe-guide-faq-soon-btn" href="${hubHref}">
          <span class="fe-guide-faq-soon-badge">Coming soon</span>
          <span class="fe-guide-faq-soon-btn-label">${soonCount} more guides on the way</span>
        </a>
        <p class="small text-body-secondary mt-2 mb-0">We are writing more answers. Meanwhile, see the <a href="${hubHref}">full guide index</a>.</p>
      </div>`;
  }
  return `      <div class="text-center mt-4 mb-1">
        <a class="fe-guide-faq-soon-btn" href="${hubHref}">
          <span class="fe-guide-faq-soon-badge">Próximamente</span>
          <span class="fe-guide-faq-soon-btn-label">${soonCount} guías más en camino</span>
        </a>
        <p class="small text-body-secondary mt-2 mb-0">Estamos escribiendo más respuestas. Mientras tanto, vea el <a href="${hubHref}">índice completo de guías</a>.</p>
      </div>`;
}

function buildCardsHtml(target, homepageGuides, soonCount) {
  const cardOpts = {
    imagePrefix: target.imagePrefix,
    blogPrefix: target.blogPrefix,
    lang: target.lang,
  };
  const htmlParts = [];
  htmlParts.push(`      <div class="row g-4 mb-2 fe-guide-media-grid">`);
  for (const g of homepageGuides) {
    htmlParts.push(renderPublishedGuideCard(g, cardOpts));
  }
  htmlParts.push(`      </div>`);
  if (soonCount > 0) {
    htmlParts.push(soonCopy(target.lang, soonCount, target.hubHref));
  }
  return htmlParts.join("\n");
}

function buildSchemaBlock(homepageGuides, lang) {
  const entities = homepageGuides.map((g) => ({
    "@type": "Question",
    name: lang === "en" ? g.questionEn || g.question : g.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: lang === "en" ? g.teaserEn || g.teaser : g.teaser,
    },
  }));
  return `<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entities,
  },
  null,
  2
)}
</script>`;
}

function patchIndex(target, homepageGuides, soonCount) {
  let index = fs.readFileSync(target.file, "utf8");
  const htmlStart = "<!-- FE_GUIDE_FAQ_CARDS_START -->";
  const htmlEnd = "<!-- FE_GUIDE_FAQ_CARDS_END -->";
  const schemaStart = "<!-- FE_GUIDE_FAQ_SCHEMA_START -->";
  const schemaEnd = "<!-- FE_GUIDE_FAQ_SCHEMA_END -->";

  if (!index.includes(htmlStart)) {
    console.error(`Missing FE_GUIDE_FAQ_CARDS markers in ${path.relative(ROOT, target.file)}`);
    process.exit(1);
  }

  const htmlBlock = buildCardsHtml(target, homepageGuides, soonCount);
  index = index.replace(
    new RegExp(`${htmlStart}[\\s\\S]*?${htmlEnd}`, "m"),
    `${htmlStart}\n${htmlBlock}\n      ${htmlEnd}`
  );

  if (index.includes(schemaStart) && index.includes(schemaEnd)) {
    index = index.replace(
      new RegExp(`${schemaStart}[\\s\\S]*?${schemaEnd}`, "m"),
      `${schemaStart}\n${buildSchemaBlock(homepageGuides, target.lang)}\n${schemaEnd}`
    );
  }

  if (!index.includes("fe-guide-answers--media")) {
    index = index.replace(
      /<section class="py-5 py-md-5(?: bg-light)?" id="final-expense-answers">/,
      '<section class="py-5 py-md-5 fe-guide-answers--media" id="final-expense-answers">'
    );
  }

  const cssRe = new RegExp(`${target.cssAttr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\?v=[^"]*)?"`);
  index = index.replace(cssRe, `href="${target.cssHref}"`);

  if (target.containerMaxWidth) {
    index = index.replace(
      /(<section[^>]*id="final-expense-answers"[^>]*>[\s\S]*?<div class="container") style="max-width:\d+rem;"/,
      `$1 style="max-width:${target.containerMaxWidth};"`
    );
  }

  fs.writeFileSync(target.file, index, "utf8");
}

const data = loadFaqIndex();
const esencial = data.categories.find((cat) => cat.id === "esencial") || { guides: [] };
const homepageGuides = esencial.guides.filter((g) => g.image && isGuidePublished(g.slug));
const soonCount = data.categories.reduce(
  (n, cat) => n + cat.guides.filter((g) => !isGuidePublished(g.slug)).length,
  0
);

for (const target of TARGETS) {
  patchIndex(target, homepageGuides, soonCount);
}

const total = data.categories.reduce((n, c) => n + c.guides.length, 0);
console.log(
  `Updated ES + EN homepage FAQ sections (${homepageGuides.length} published of ${total} guides, ${data.categories.length} categories).`
);
