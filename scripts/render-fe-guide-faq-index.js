#!/usr/bin/env node
/**
 * Render homepage FAQ guide conveyor + JSON-LD from data/fe-guide-faq-index.json
 * Usage: node scripts/render-fe-guide-faq-index.js
 */
const fs = require("fs");
const path = require("path");
const {
  loadFaqIndex,
  isGuidePublished,
  homepageCarouselGuides,
  renderHomepageConveyor,
  guideHref,
  guideQuestion,
  guideTeaser,
} = require("../lib/fe-guide-catalog");

const ROOT = path.join(__dirname, "..");
const CSS_V = "20260906-fill3";
const JS_V = "20260906-fill";
const SITE = "https://www.mejorvidainsurance.com";

const TARGETS = [
  {
    file: path.join(ROOT, "index.html"),
    lang: "es",
    imagePrefix: "img/opt/",
    blogPrefix: "",
    hubHref: "guias-gastos-finales.html",
    cssHref: `css/fe-guide.css?v=${CSS_V}`,
    jsSrc: `js/fe-guide-conveyor.js?v=${JS_V}`,
    containerMaxWidth: "74rem",
    cssAttr: 'href="css/fe-guide.css',
    includeFaqPage: true,
  },
  {
    file: path.join(ROOT, "en/index.html"),
    lang: "en",
    imagePrefix: "../img/opt/",
    blogPrefix: "../",
    hubHref: "final-expense-guides.html",
    cssHref: `../css/fe-guide.css?v=${CSS_V}`,
    jsSrc: `../js/fe-guide-conveyor.js?v=${JS_V}`,
    containerMaxWidth: "74rem",
    cssAttr: 'href="../css/fe-guide.css',
    includeFaqPage: false,
    schemaInsertBefore: '<link href="../bootstrap/css/bootstrap.min.css"',
  },
];

function absPageUrl(target, href) {
  if (/^https?:/i.test(href)) return href;
  if (href.startsWith("../")) return `${SITE}${href.slice(2)}`;
  if (target.lang === "en") return `${SITE}/en/${href.replace(/^\//, "")}`;
  return `${SITE}/${href.replace(/^\//, "")}`;
}

function buildCardsHtml(target, homepageGuides) {
  return renderHomepageConveyor(homepageGuides, {
    imagePrefix: target.imagePrefix,
    blogPrefix: target.blogPrefix,
    lang: target.lang,
    hubHref: target.hubHref,
  });
}

function buildSchemaBlock(target, homepageGuides) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      target.lang === "en"
        ? "Final expense insurance guides"
        : "Guías de seguro de gastos finales",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: homepageGuides.length,
    itemListElement: homepageGuides.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: guideQuestion(g, { lang: target.lang }),
      url: absPageUrl(target, guideHref(g.slug, { lang: target.lang, blogPrefix: target.blogPrefix })),
      image: `${SITE}/img/opt/${g.image}.jpg`,
      description: guideTeaser(g, { lang: target.lang }),
    })),
  };

  if (!target.includeFaqPage) {
    return `<script type="application/ld+json">\n${JSON.stringify(itemList, null, 2)}\n</script>`;
  }

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homepageGuides.map((g) => ({
      "@type": "Question",
      name: guideQuestion(g, { lang: target.lang }),
      acceptedAnswer: {
        "@type": "Answer",
        text: guideTeaser(g, { lang: target.lang }),
      },
    })),
  };

  return (
    `<script type="application/ld+json">\n${JSON.stringify(faq, null, 2)}\n</script>\n` +
    `<script type="application/ld+json">\n${JSON.stringify(itemList, null, 2)}\n</script>`
  );
}

function bumpConveyorScript(index, target) {
  if (index.includes("fe-guide-conveyor.js")) {
    return index.replace(
      /((?:\.\.\/)?js\/fe-guide-conveyor\.js)\?v=[^"]+/g,
      `${target.lang === "en" ? "../js/fe-guide-conveyor.js" : "js/fe-guide-conveyor.js"}?v=${JS_V}`
    );
  }
  const tag = `<script defer src="${target.jsSrc}"></script>`;
  return index.replace(
    /(<script defer src="(?:\.\.\/)?js\/mvi-helpful-tools\.js[^"]*"><\/script>)/,
    `$1\n${tag}`
  );
}

function patchIndex(target, homepageGuides) {
  let index = fs.readFileSync(target.file, "utf8");
  const htmlStart = "<!-- FE_GUIDE_FAQ_CARDS_START -->";
  const htmlEnd = "<!-- FE_GUIDE_FAQ_CARDS_END -->";
  const schemaStart = "<!-- FE_GUIDE_FAQ_SCHEMA_START -->";
  const schemaEnd = "<!-- FE_GUIDE_FAQ_SCHEMA_END -->";

  if (!index.includes(htmlStart)) {
    console.error(`Missing FE_GUIDE_FAQ_CARDS markers in ${path.relative(ROOT, target.file)}`);
    process.exit(1);
  }

  if (!index.includes(schemaStart) && target.schemaInsertBefore && index.includes(target.schemaInsertBefore)) {
    index = index.replace(
      target.schemaInsertBefore,
      `${schemaStart}\n${schemaEnd}\n${target.schemaInsertBefore}`
    );
  }

  const htmlBlock = buildCardsHtml(target, homepageGuides);
  index = index.replace(
    new RegExp(`${htmlStart}[\\s\\S]*?${htmlEnd}`, "m"),
    `${htmlStart}\n${htmlBlock}\n      ${htmlEnd}`
  );

  if (index.includes(schemaStart) && index.includes(schemaEnd)) {
    index = index.replace(
      new RegExp(`${schemaStart}[\\s\\S]*?${schemaEnd}`, "m"),
      `${schemaStart}\n${buildSchemaBlock(target, homepageGuides)}\n${schemaEnd}`
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
    index = index.replace(
      /<div style="max-width:52rem;margin-left:auto;margin-right:auto;">(\s*<!-- FE_GUIDE_FAQ_CARDS)/,
      `<div style="max-width:${target.containerMaxWidth};margin-left:auto;margin-right:auto;">$1`
    );
  }

  index = bumpConveyorScript(index, target);

  fs.writeFileSync(target.file, index, "utf8");
}

const data = loadFaqIndex();
const homepageGuides = homepageCarouselGuides();
const soonCount = data.categories.reduce(
  (n, cat) => n + cat.guides.filter((g) => !isGuidePublished(g.slug)).length,
  0
);

for (const target of TARGETS) {
  patchIndex(target, homepageGuides);
}

const total = data.categories.reduce((n, c) => n + c.guides.length, 0);
console.log(
  `Updated ES + EN homepage guide conveyor (${homepageGuides.length} media guides of ${total}; ${soonCount} unpublished).`
);
