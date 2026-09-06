#!/usr/bin/env node
/**
 * Render FE guide pages from data/fe-guides/*.json
 * Usage: node scripts/render-fe-guide-page.js [slug]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GUIDES_DIR = path.join(ROOT, "data/fe-guides");
const DEFAULTS_ES = path.join(GUIDES_DIR, "_defaults.json");
const DEFAULTS_EN = path.join(GUIDES_DIR, "_defaults-en.json");
const SHELL_ES = path.join(ROOT, "blog/_fe-guide-shell.html");
const SHELL_EN = path.join(ROOT, "blog/_fe-guide-shell-en.html");
const HEADER_ES = path.join(ROOT, "includes/site-header-inner.html");
const FOOTER_ES = path.join(ROOT, "includes/site-footer-inner.html");
const HEADER_EN = path.join(ROOT, "includes/en-site-header.html");
const FOOTER_EN = path.join(ROOT, "includes/en-site-footer.html");
const { renderTocChrome, guideHref, isGuidePublished, loadFaqIndex: loadCatalogIndex } = require("../lib/fe-guide-catalog");
const { quoteRailHtml } = require("./lic-quote-rail");
const { waQuoteUrl } = require("../lib/whatsapp-cta");
const { escHtml, renderBody, faqEntities } = require("./fe-guide-body");
const BASE = "https://www.mejorvidainsurance.com";

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function pickLang(raw, lang) {
  if (raw && raw[lang] && typeof raw[lang] === "object") {
    return { ...raw, ...raw[lang], lang };
  }
  return { ...raw, lang: lang || "es" };
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

function loadFaqMap() {
  const data = loadCatalogIndex();
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

function formatDateEn(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

function renderTransparencyModal(guide, lang) {
  const t = guide.transparencyDisclosures;
  if (!t || !Array.isArray(t.sections) || !t.sections.length) return "";
  const closeLabel = lang === "en" ? "Close" : "Cerrar";
  const pageUrl = t.learnMorePageUrl || (lang === "en" ? "../divulgaciones-editoriales.html" : "../divulgaciones-editoriales.html");
  const sectionsHtml = t.sections
    .map((section) => {
      const learnHref = section.externalUrl
        ? section.externalUrl
        : pageUrl + (section.learnMoreAnchor || `#${section.id || ""}`);
      const learnLabel = section.learnMoreLabel || (lang === "en" ? "Learn more" : "Más información");
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
    `<h2 id="fe-guide-disclosures-modal-title">${escHtml(t.modalTitle || t.heroLinkLabel || (lang === "en" ? "Disclosures" : "Divulgaciones"))}</h2>` +
    `<button type="button" class="fe-guide-modal-close" id="fe-guide-disclosures-modal-close" aria-label="${closeLabel}">×</button>` +
    `</div>` +
    `<div class="fe-guide-modal-body fe-guide-modal-body--transparency">` +
    sectionsHtml +
    `</div>` +
    `</div>` +
    `</div>`
  );
}

function defaultCta(lang) {
  if (lang === "en") {
    return {
      title: "See prices for your situation",
      body: "Mejor Vida Insurance compares final expense companies. Start with a free online quote, schedule a call, or message us on WhatsApp.",
      quote: "Get a free quote",
      schedule: "Schedule a call",
    };
  }
  return {
    title: "¿Quiere ver opciones para su situación?",
    body: "Mejor Vida Seguros compara compañías de gastos finales. Empiece con una cotización gratuita en línea, agende una llamada o escríbanos por WhatsApp.",
    quote: "Cotización gratuita",
    schedule: "Agendar una llamada",
  };
}

function heroMedia(guide, faqIndex) {
  const meta = faqIndex.get(guide.slug) || {};
  const stem = meta.image;
  const fallbackOg = `${BASE}/img/opt/julie-about.jpg`;
  if (!stem) {
    return { photoClass: "", bgHtml: "", preload: "", ogImage: fallbackOg };
  }
  const webp = `../img/opt/${stem}.webp`;
  const jpg = `../img/opt/${stem}.jpg`;
  const bgHtml =
    `<div class="fe-guide-hero-bg" aria-hidden="true">` +
    `<picture>` +
    `<source type="image/webp" srcset="${escHtml(webp)}"/>` +
    `<img src="${escHtml(jpg)}" alt="" width="800" height="600" fetchpriority="high" decoding="async"/>` +
    `</picture>` +
    `</div>\n`;
  const preload = `<link rel="preload" as="image" href="${escHtml(webp)}" type="image/webp" fetchpriority="high"/>\n`;
  return {
    photoClass: " fe-guide-hero--photo",
    bgHtml,
    preload,
    ogImage: `${BASE}/img/opt/${stem}.jpg`,
  };
}

function renderGuide(guide, faqIndex, shell, lang) {
  const isEn = lang === "en";
  const slugEn = guide.slugEn || guide.slug;
  const canonical = isEn ? `${BASE}/en/${slugEn}.html` : `${BASE}/blog/${guide.slug}.html`;
  const altUrl = guide.slugEn
    ? isEn
      ? `${BASE}/blog/${guide.slug}.html`
      : `${BASE}/en/${slugEn}.html`
    : "";
  const bodyHtml = renderBody(guide, lang);
  const answerText = (guide.keyTakeaways || []).join(" ");
  const headline = guide.headline || guide.question;
  const pageTitle = guide.pageTitle || (isEn ? `${headline} — Mejor Vida guide` : `${headline} — Guía de Mejor Vida`);
  const ogTitle = guide.pageTitle || headline;
  const alternateLine = guide.alternateNamesLine || "";
  const alternateNamesHtml = alternateLine
    ? `<p class="fe-guide-alt-names">${escHtml(alternateLine)}</p>`
    : "";
  const hero = heroMedia(guide, faqIndex);

  const takeawaysHtml = (guide.keyTakeaways || [])
    .map((t) => `    <li>${escHtml(t)}</li>`)
    .join("\n");

  const disclosuresHtml = (guide.disclosures || [])
    .map((d) => `  <p>${escHtml(d)}</p>`)
    .join("\n");

  let relatedBlock = "";
  if (guide.relatedSlugs && guide.relatedSlugs.length) {
    const relatedTitle = isEn ? "Related guides" : "Guías relacionadas";
    const items = guide.relatedSlugs
      .map((slug) => {
        const meta = faqIndex.get(slug);
        if (!meta || !isGuidePublished(slug)) return "";
        const href = guideHref(slug, {
          lang,
          inBlogDir: !isEn,
          blogPrefix: isEn ? "" : "../",
        });
        const label = isEn ? meta.questionEn || meta.question : meta.question;
        return `    <li><a href="${escHtml(href)}">${escHtml(label)}</a></li>`;
      })
      .filter(Boolean)
      .join("\n");
    if (items) {
      relatedBlock = `<section class="fe-guide-related">\n<h2 class="h6 fw-bold mb-3" style="color:#1a365d;">${relatedTitle}</h2>\n<ul>\n${items}\n  </ul>\n</section>`;
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
      url: isEn ? `${BASE}/en/about-julie.html` : `${BASE}/about-julie.html`,
      jobTitle: guide.authorTitle,
    },
    editor: { "@type": "Organization", name: guide.factCheckedBy },
    publisher: {
      "@type": "Organization",
      name: "Mejor Vida Insurance LLC",
      url: `${BASE}/`,
      logo: { "@type": "ImageObject", url: `${BASE}/img/logo-english2.png` },
    },
    datePublished: `${guide.published}T08:00:00-06:00`,
    dateModified: `${guide.modified || guide.published}T08:00:00-06:00`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: isEn ? "en" : "es",
    image: hero.ogImage,
  };

  const faqFromBlocks = faqEntities(guide);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqFromBlocks || [
      {
        "@type": "Question",
        name: guide.question,
        acceptedAnswer: { "@type": "Answer", text: answerText || guide.dek || "" },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isEn ? "Home" : "Inicio", item: isEn ? `${BASE}/en/` : `${BASE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: isEn ? "Final expense guides" : "Respuestas sobre gastos finales",
        item: isEn ? `${BASE}/en/final-expense-guides.html` : `${BASE}/guias-gastos-finales.html`,
      },
      { "@type": "ListItem", position: 3, name: guide.question, item: canonical },
    ],
  };

  const cta = { ...defaultCta(lang), ...(guide.cta || {}) };
  const quoteHref = isEn ? "quote.html" : "../quote.html";
  const scheduleHref = isEn ? "schedule-julie.html" : "../schedule-julie.html";
  const hreflang = altUrl
    ? `<link rel="alternate" hreflang="es" href="${isEn ? altUrl : canonical}"/>\n<link rel="alternate" hreflang="en" href="${isEn ? canonical : altUrl}"/>\n<link rel="alternate" hreflang="x-default" href="${isEn ? altUrl : canonical}"/>`
    : "";

  let header;
  let footer;
  if (isEn) {
    header = fs.readFileSync(HEADER_EN, "utf8");
    if (altUrl) {
      header = header.replace(
        /(<a href=")[^"]+(" class="mvi-lang-fab)/,
        `$1${escHtml("../blog/" + guide.slug + ".html")}$2`
      );
    }
    footer = fs
      .readFileSync(FOOTER_EN, "utf8")
      .replace(/__ASSET__/g, "../")
      .replace(/__PAGE__/g, "");
  } else {
    header = fs.readFileSync(HEADER_ES, "utf8").replace(/__PREFIX__/g, "../");
    if (guide.slugEn) {
      header = header.replace(
        /(<a href=")\/en\/(" class="mvi-lang-fab)/,
        `$1/en/${guide.slugEn}.html$2`
      );
    }
    footer = fs.readFileSync(FOOTER_ES, "utf8").replace(/__PREFIX__/g, "../");
  }

  const rail = quoteRailHtml({
    lang: isEn ? "en" : "es",
    title: isEn ? "See your price" : "Vea su precio",
    line1: isEn ? "Compare companies in minutes" : "Compare compañías en minutos",
    line2: isEn ? "Talk with a licensed agent" : "Hable con una agente licenciada",
    quoteHref,
    cta: isEn ? "Get a quote" : "Ver precios",
  });

  return shell
    .replace(/\{\{PAGE_TITLE\}\}/g, escHtml(pageTitle))
    .replace(/\{\{OG_TITLE\}\}/g, escHtml(ogTitle))
    .replace(/\{\{OG_IMAGE\}\}/g, escHtml(hero.ogImage))
    .replace(/\{\{HERO_PHOTO_CLASS\}\}/g, hero.photoClass)
    .replace(/\{\{HERO_BG_HTML\}\}/g, hero.bgHtml)
    .replace(/\{\{HERO_PRELOAD\}\}/g, hero.preload)
    .replace(/\{\{META_DESCRIPTION\}\}/g, escHtml(guide.metaDescription || guide.dek || ""))
    .replace(/\{\{AUTHOR_NAME\}\}/g, escHtml(guide.authorName))
    .replace(/\{\{AUTHOR_TITLE\}\}/g, escHtml(guide.authorTitle))
    .replace(/\{\{AUTHOR_LOCATION\}\}/g, escHtml(guide.authorLocation || ""))
    .replace(/\{\{AUTHOR_PROFILE_URL\}\}/g, escHtml(guide.authorProfileUrl || (isEn ? "about-julie.html" : "../about-julie.html")))
    .replace(/\{\{FACT_CHECKED_BY\}\}/g, escHtml(guide.factCheckedBy))
    .replace(/\{\{AI_FREE_PLEDGE_LABEL\}\}/g, escHtml(guide.aiFreePledgeLabel))
    .replace(/\{\{AI_FREE_MODAL_TITLE\}\}/g, escHtml(guide.aiFreePledgeModalTitle || guide.aiFreePledgeLabel))
    .replace(/\{\{AI_FREE_MODAL_BODY\}\}/g, escHtml(guide.aiFreePledgeModalBody || guide.aiFreePledgeText))
    .replace(/\{\{HEADLINE\}\}/g, escHtml(headline))
    .replace(/\{\{ALTERNATE_NAMES_HTML\}\}/g, alternateNamesHtml)
    .replace(/\{\{QUESTION\}\}/g, escHtml(guide.question))
    .replace(/\{\{DEK\}\}/g, escHtml(guide.dek || ""))
    .replace(/\{\{DATE_DISPLAY\}\}/g, escHtml((isEn ? formatDateEn : formatDateEs)(guide.modified || guide.published)))
    .replace(/\{\{TRANSPARENCY_LINK_LABEL\}\}/g, escHtml(guide.transparencyDisclosures?.heroLinkLabel || (isEn ? "Disclosures" : "Divulgaciones")))
    .replace(/\{\{GUIDE_TOC_CHROME\}\}/g, renderTocChrome({
      currentSlug: guide.slug,
      hubPrefix: isEn ? "" : "../",
      inBlogDir: !isEn,
      includePageSections: true,
      includeHubLink: true,
      lang,
      blogPrefix: isEn ? "" : "../",
    }))
    .replace(/\{\{TRANSPARENCY_MODAL\}\}/g, renderTransparencyModal(guide, lang))
    .replace(/\{\{CANONICAL_URL\}\}/g, canonical)
    .replace(/\{\{HREFLANG_LINKS\}\}/g, hreflang)
    .replace(/\{\{QUOTE_RAIL\}\}/g, rail)
    .replace(/\{\{KEY_TAKEAWAYS_LIST\}\}/g, takeawaysHtml)
    .replace(/\{\{BODY_PARAGRAPHS\}\}/g, bodyHtml)
    .replace(/\{\{CTA_TITLE\}\}/g, escHtml(cta.title))
    .replace(/\{\{CTA_BODY\}\}/g, escHtml(cta.body))
    .replace(/\{\{CTA_QUOTE\}\}/g, escHtml(cta.quote))
    .replace(/\{\{CTA_SCHEDULE\}\}/g, escHtml(cta.schedule))
    .replace(/\{\{QUOTE_HREF\}\}/g, escHtml(quoteHref))
    .replace(/\{\{SCHEDULE_HREF\}\}/g, escHtml(scheduleHref))
    .replace(/\{\{WHATSAPP_HREF\}\}/g, escHtml(waQuoteUrl(isEn ? "en" : "es")))
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
  const shellEs = fs.readFileSync(SHELL_ES, "utf8");
  const shellEn = fs.readFileSync(SHELL_EN, "utf8");
  const faqIndex = loadFaqMap();
  const defaultsEs = loadJson(DEFAULTS_ES);
  const defaultsEn = fs.existsSync(DEFAULTS_EN) ? loadJson(DEFAULTS_EN) : defaultsEs;

  const files = fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => path.join(GUIDES_DIR, f));

  let rendered = 0;
  for (const file of files) {
    const raw = loadJson(file);
    if (slugArg && raw.slug !== slugArg) continue;

    const esGuide = mergeGuide(pickLang(raw, "es"), defaultsEs);
    const htmlEs = renderGuide(esGuide, faqIndex, shellEs, "es");
    const outBlog = path.join(ROOT, "blog", `${esGuide.slug}.html`);
    const outSources = path.join(ROOT, "sources/blog", `${esGuide.slug}.html`);
    fs.writeFileSync(outBlog, htmlEs, "utf8");
    fs.mkdirSync(path.dirname(outSources), { recursive: true });
    fs.writeFileSync(outSources, htmlEs, "utf8");
    console.log(`Rendered ES ${esGuide.slug}.html`);
    rendered++;

    if (raw.en && raw.slugEn) {
      const enGuide = mergeGuide(pickLang(raw, "en"), defaultsEn);
      enGuide.slug = raw.slug;
      enGuide.slugEn = raw.slugEn;
      enGuide.relatedSlugs = raw.relatedSlugs || enGuide.relatedSlugs;
      enGuide.published = raw.published;
      enGuide.modified = raw.modified || raw.published;
      const htmlEn = renderGuide(enGuide, faqIndex, shellEn, "en");
      const outEn = path.join(ROOT, "en", `${raw.slugEn}.html`);
      const outEnSources = path.join(ROOT, "sources/en", `${raw.slugEn}.html`);
      fs.writeFileSync(outEn, htmlEn, "utf8");
      fs.mkdirSync(path.dirname(outEnSources), { recursive: true });
      fs.writeFileSync(outEnSources, htmlEn, "utf8");
      console.log(`Rendered EN ${raw.slugEn}.html`);
    }
  }

  if (!rendered) {
    console.error(slugArg ? `No guide found for slug: ${slugArg}` : "No guide JSON files found.");
    process.exit(1);
  }
}

main();
