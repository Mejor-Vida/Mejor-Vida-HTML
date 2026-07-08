#!/usr/bin/env node
/**
 * Render Spanish FE guide pages from data/fe-guides/*.json
 * Usage: node scripts/render-fe-guide-page.js [slug]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GUIDES_DIR = path.join(ROOT, "data/fe-guides");
const DEFAULTS_FILE = path.join(GUIDES_DIR, "_defaults.json");
const SHELL = path.join(ROOT, "blog/_fe-guide-shell.html");
const HEADER_SRC = path.join(ROOT, "includes/site-header-inner.html");
const FOOTER_SRC = path.join(ROOT, "includes/site-footer-inner.html");
const { renderTocChrome } = require("../lib/fe-guide-catalog");
const FAQ_INDEX = path.join(ROOT, "data/fe-guide-faq-index.json");
const BASE = "https://www.mejorvidainsurance.com";

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadDefaults() {
  if (!fs.existsSync(DEFAULTS_FILE)) return {};
  return JSON.parse(fs.readFileSync(DEFAULTS_FILE, "utf8"));
}

function mergeGuide(raw, defaults) {
  return {
    ...defaults,
    ...raw,
    disclosures: raw.disclosures || defaults.disclosures || [],
    keyTakeaways: raw.keyTakeaways || [],
    transparencyDisclosures: raw.transparencyDisclosures || defaults.transparencyDisclosures || null,
  };
}

function loadFaqIndex() {
  const data = JSON.parse(fs.readFileSync(FAQ_INDEX, "utf8"));
  const map = new Map();
  for (const cat of data.categories) {
    for (const g of cat.guides) {
      map.set(g.slug, g);
    }
  }
  return map;
}

function formatDateEs(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${d} de ${months[m - 1]} de ${y}`;
}

function renderTransparencyModal(guide) {
  const t = guide.transparencyDisclosures;
  if (!t || !Array.isArray(t.sections) || !t.sections.length) return "";

  const pageUrl = t.learnMorePageUrl || "../divulgaciones-editoriales.html";
  const sectionsHtml = t.sections
    .map((section) => {
      const learnHref = section.externalUrl
        ? section.externalUrl
        : pageUrl + (section.learnMoreAnchor || `#${section.id || ""}`);
      const learnLabel = section.learnMoreLabel || "Más información";
      const learnTarget = section.externalUrl ? ' rel="noopener" target="_blank"' : "";
      return (
        `<section class="fe-guide-transparency-section">` +
        `<h3>${escHtml(section.title)}</h3>` +
        `<p>${escHtml(section.body)}</p>` +
        `<p><a href="${escHtml(learnHref)}"${learnTarget}>${escHtml(learnLabel)}</a></p>` +
        `</section>`
      );
    })
    .join("\n");

  return (
    `<div class="fe-guide-modal-backdrop" id="fe-guide-disclosures-modal-backdrop" hidden>` +
    `<div aria-labelledby="fe-guide-disclosures-modal-title" aria-modal="true" class="fe-guide-modal fe-guide-modal--wide" id="fe-guide-disclosures-modal" role="dialog">` +
    `<div class="fe-guide-modal-header">` +
    `<h2 id="fe-guide-disclosures-modal-title">${escHtml(t.modalTitle || t.heroLinkLabel || "Divulgaciones")}</h2>` +
    `<button type="button" class="fe-guide-modal-close" id="fe-guide-disclosures-modal-close" aria-label="Cerrar">×</button>` +
    `</div>` +
    `<div class="fe-guide-modal-body fe-guide-modal-body--transparency">` +
    sectionsHtml +
    `</div>` +
    `</div>` +
    `</div>`
  );
}

function renderGuide(guide, faqIndex, shell) {
  const canonical = `${BASE}/blog/${guide.slug}.html`;
  const answerText = guide.paragraphs.join(" ");
  const headline = guide.headline || guide.question;
  const pageTitle = guide.pageTitle || `${headline} — Guía de Mejor Vida`;
  const ogTitle = guide.pageTitle || headline;
  const alternateLine = guide.alternateNamesLine || "";
  const alternateNamesHtml = alternateLine
    ? `<p class="fe-guide-alt-names">${escHtml(alternateLine)}</p>`
    : "";

  const paragraphsHtml = guide.paragraphs
    .map((p) => `  <p>${escHtml(p)}</p>`)
    .join("\n");

  const takeawaysHtml = (guide.keyTakeaways || [])
    .map((t) => `    <li>${escHtml(t)}</li>`)
    .join("\n");

  const disclosuresHtml = (guide.disclosures || [])
    .map((d) => `  <p>${escHtml(d)}</p>`)
    .join("\n");

  let relatedBlock = "";
  if (guide.relatedSlugs && guide.relatedSlugs.length) {
    const items = guide.relatedSlugs
      .map((slug) => {
        const meta = faqIndex.get(slug);
        const guideJson = path.join(GUIDES_DIR, `${slug}.json`);
        const guideHtml = path.join(ROOT, "blog", `${slug}.html`);
        if (!meta || (!fs.existsSync(guideJson) && !fs.existsSync(guideHtml))) return "";
        return `    <li><a href="${slug}.html">${escHtml(meta.question)}</a></li>`;
      })
      .filter(Boolean)
      .join("\n");
    if (items) {
      relatedBlock = `<section class="fe-guide-related">\n<h2 class="h6 fw-bold mb-3" style="color:#1a365d;">Guías relacionadas</h2>\n<ul>\n${items}\n  </ul>\n</section>`;
    }
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: alternateLine ? `${headline} — ${alternateLine}` : headline,
    description: guide.metaDescription || guide.dek,
    author: {
      "@type": "Person",
      name: guide.authorName || "Julie Braunsroth",
      url: `${BASE}/about-julie.html`,
      jobTitle: guide.authorTitle || "experta en gastos finales",
    },
    editor: {
      "@type": "Organization",
      name: guide.factCheckedBy,
    },
    publisher: {
      "@type": "Organization",
      name: "Mejor Vida Insurance LLC",
      url: `${BASE}/`,
      logo: {
        "@type": "ImageObject",
        url: `${BASE}/img/logo-english2.png`,
      },
    },
    datePublished: `${guide.published}T08:00:00-06:00`,
    dateModified: `${guide.modified}T08:00:00-06:00`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: "es",
    image: `${BASE}/img/opt/julie-about.jpg`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: guide.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answerText,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Respuestas sobre gastos finales",
        item: `${BASE}/guias-gastos-finales.html`,
      },
      { "@type": "ListItem", position: 3, name: guide.question, item: canonical },
    ],
  };

  const header = fs.readFileSync(HEADER_SRC, "utf8").replace(/__PREFIX__/g, "../");
  const footer = fs.readFileSync(FOOTER_SRC, "utf8").replace(/__PREFIX__/g, "../");

  return shell
    .replace(/\{\{PAGE_TITLE\}\}/g, escHtml(pageTitle))
    .replace(/\{\{OG_TITLE\}\}/g, escHtml(ogTitle))
    .replace(/\{\{META_DESCRIPTION\}\}/g, escHtml(guide.metaDescription || guide.dek))
    .replace(/\{\{AUTHOR_NAME\}\}/g, escHtml(guide.authorName))
    .replace(/\{\{AUTHOR_TITLE\}\}/g, escHtml(guide.authorTitle))
    .replace(/\{\{AUTHOR_LOCATION\}\}/g, escHtml(guide.authorLocation))
    .replace(/\{\{AUTHOR_PROFILE_URL\}\}/g, escHtml(guide.authorProfileUrl || "../about-julie.html"))
    .replace(/\{\{FACT_CHECKED_BY\}\}/g, escHtml(guide.factCheckedBy))
    .replace(/\{\{AI_FREE_PLEDGE_LABEL\}\}/g, escHtml(guide.aiFreePledgeLabel))
    .replace(/\{\{AI_FREE_MODAL_TITLE\}\}/g, escHtml(guide.aiFreePledgeModalTitle || guide.aiFreePledgeLabel))
    .replace(/\{\{AI_FREE_MODAL_BODY\}\}/g, escHtml(guide.aiFreePledgeModalBody || guide.aiFreePledgeText))
    .replace(/\{\{HEADLINE\}\}/g, escHtml(headline))
    .replace(/\{\{ALTERNATE_NAMES_HTML\}\}/g, alternateNamesHtml)
    .replace(/\{\{QUESTION\}\}/g, escHtml(guide.question))
    .replace(/\{\{DEK\}\}/g, escHtml(guide.dek))
    .replace(/\{\{DATE_DISPLAY\}\}/g, escHtml(formatDateEs(guide.modified || guide.published)))
    .replace(/\{\{TRANSPARENCY_LINK_LABEL\}\}/g, escHtml(guide.transparencyDisclosures?.heroLinkLabel || "Divulgaciones"))
    .replace(/\{\{GUIDE_TOC_CHROME\}\}/g, renderTocChrome({
      currentSlug: guide.slug,
      hubPrefix: "../",
      inBlogDir: true,
      includePageSections: true,
      includeHubLink: true,
    }))
    .replace(/\{\{TRANSPARENCY_MODAL\}\}/g, renderTransparencyModal(guide))
    .replace(/\{\{CANONICAL_URL\}\}/g, canonical)
    .replace(/\{\{KEY_TAKEAWAYS_LIST\}\}/g, takeawaysHtml)
    .replace(/\{\{BODY_PARAGRAPHS\}\}/g, paragraphsHtml)
    .replace(/\{\{DISCLOSURES_BLOCK\}\}/g, disclosuresHtml)
    .replace(/\{\{RELATED_BLOCK\}\}/g, relatedBlock)
    .replace(/\{\{HEADER\}\}/g, header)
    .replace(/\{\{FOOTER\}\}/g, footer)
    .replace(/\{\{ARTICLE_SCHEMA\}\}/g, JSON.stringify(articleSchema, null, 2))
    .replace(/\{\{FAQ_SCHEMA\}\}/g, JSON.stringify(faqSchema, null, 2))
    .replace(/\{\{BREADCRUMB_SCHEMA\}\}/g, JSON.stringify(breadcrumbSchema, null, 2));
}

function main() {
  const slugArg = process.argv[2];
  const shell = fs.readFileSync(SHELL, "utf8");
  const faqIndex = loadFaqIndex();
  const defaults = loadDefaults();

  const files = fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => path.join(GUIDES_DIR, f));

  let rendered = 0;
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (slugArg && raw.slug !== slugArg) continue;

    const guide = mergeGuide(raw, defaults);
    const html = renderGuide(guide, faqIndex, shell);
    const outBlog = path.join(ROOT, "blog", `${guide.slug}.html`);
    const outSources = path.join(ROOT, "sources/blog", `${guide.slug}.html`);

    fs.writeFileSync(outBlog, html, "utf8");
    fs.mkdirSync(path.dirname(outSources), { recursive: true });
    fs.writeFileSync(outSources, html, "utf8");
    console.log(`Rendered ${guide.slug}.html`);
    rendered++;
  }

  if (!rendered) {
    console.error(slugArg ? `No guide found for slug: ${slugArg}` : "No guide JSON files found.");
    process.exit(1);
  }
}

main();
