#!/usr/bin/env node
/**
 * Fix broken consumer blog article HTML (missing header nav, corrupt aside tags).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const ES_HEADER = fs.readFileSync(
  path.join(ROOT, "blog/weekly-insurance-update-2026-07-12.html"),
  "utf8"
)
  .split("<!-- HEADER -->")[1]
  .split("<!-- Blog Hero -->")[0]
  .trim();

const EN_HEADER = fs.readFileSync(
  path.join(ROOT, "en/blog/weekly-insurance-update-2026-07-12.html"),
  "utf8"
)
  .split("<header class=\"sticky-top")[1]
  .split("<div class=\"blog-hero")[0];

const EN_HEADER_BLOCK = "<header class=\"sticky-top" + EN_HEADER.trim();

const FILES = [
  "blog/unum-reaseguro-ltc-2026-07-06.html",
  "blog/aumentos-primas-medigap-2026-07-08.html",
  "blog/liquidaciones-vida-naifa-2026-07-11.html",
  "en/blog/unum-ltc-reinsurance-2026-07-06.html",
  "en/blog/medigap-premium-increases-2026-07-08.html",
  "en/blog/naifa-life-settlement-alert-2026-07-11.html",
  "blog/weekly-insurance-update-2026-07-12.html",
  "en/blog/weekly-insurance-update-2026-07-12.html",
];

function fixCommon(html) {
  let out = html.replace(/\u0002/g, "");
  out = out.replace(/<\/link>/g, "");
  out = out.replace(
    /(\s)\s*aria-label="Supporting information" class="sidebar">/g,
    '$1<aside aria-label="Supporting information" class="sidebar">'
  );
  out = out.replace(
    /(<p class="small mb-0 mt-2 text-secondary">[\s\S]*?<\/p>)\s*<\/div>\s*(<aside)/g,
    "$1\n</div>\n</section>\n$2"
  );
  out = out.replace(
    /(<p class="small text-secondary"><a href="weekly-insurance-update-2026-07-12.html">[\s\S]*?<\/a><\/p>)\s*<\/div>\s*(<aside)/g,
    "$1\n</div>\n</section>\n$2"
  );
  return out;
}

function fixEsBrokenHeader(html) {
  if (html.includes('<div class="d-flex align-items-center justify-content-between header-inner">')) {
    return html;
  }
  const m = html.match(
    /<!-- HEADER -->\s*<header[\s\S]*?<div class="container">\s*([\s\S]*?)<article class="py-5 mv-news page-wrap">/
  );
  if (!m) return html;
  const heroInner = m[1].trim();
  const heroBlock =
    "<!-- Blog Hero -->\n<div class=\"blog-hero mv-news hero\">\n<div class=\"container\">\n\n" +
    heroInner +
    "\n</div>\n</div>\n<!-- Main Content -->\n<article class=\"py-5 mv-news page-wrap\">";
  return html.replace(m[0], "<!-- HEADER -->\n" + ES_HEADER + "\n" + heroBlock);
}

function fixEnConsumerHero(html, file) {
  const articleHero = {
    "en/blog/unum-ltc-reinsurance-2026-07-06.html": {
      h1: "Unum and long-term care: what the big deal means for families",
      meta:
        '<i class="fas fa-calendar-alt me-2"></i>July 6, 2026 |\n      <i class="fas fa-user ms-3 me-2"></i>Mejor Vida Insurance |\n      <i class="fas fa-clock ms-3 me-2"></i>About 7 min read',
      lead: "Unum announced a multi-billion-dollar arrangement for older long-term care policies. Here is a plain-language look at whether your coverage is still in place and what to review.",
      img: "story-1",
      alt: "Unum Group team — long-term care reinsurance deal, July 2026",
      w: 800,
      h: 553,
    },
    "en/blog/medigap-premium-increases-2026-07-08.html": {
      h1: "Medigap premium increases: what they mean for you and your family",
      meta:
        '<i class="fas fa-calendar-alt me-2"></i>July 8, 2026 |\n      <i class="fas fa-user ms-3 me-2"></i>Mejor Vida Insurance |\n      <i class="fas fa-clock ms-3 me-2"></i>About 8 min read',
      lead: "Many seniors are seeing renewal notices for their Medicare supplement. We explain why percentages vary and how to compare options without rushing.",
      img: "story-2",
      alt: "Medigap chart — premium increases 2026",
      w: 800,
      h: 314,
    },
    "en/blog/naifa-life-settlement-alert-2026-07-11.html": {
      h1: "Before you sell or lapse a life policy: what NAIFA wants families to know",
      meta:
        '<i class="fas fa-calendar-alt me-2"></i>July 11, 2026 |\n      <i class="fas fa-user ms-3 me-2"></i>Mejor Vida Insurance |\n      <i class="fas fa-clock ms-3 me-2"></i>About 8 min read',
      lead: "Thinking about stopping payments or taking cash from a life policy? NAIFA’s alert explains taxes, Medicaid risk, and alternatives before you decide.",
      img: "story-3",
      alt: "NAIFA alert — couple reviewing a life settlement agreement, July 2026",
      w: 800,
      h: 533,
    },
  };
  const cfg = articleHero[file];
  if (!cfg) return html;
  const heroBlock = `<div class="blog-hero mv-news hero">
<div class="container">
<h1>${cfg.h1}</h1>
<div class="blog-meta">
${cfg.meta}
    </div>
<p class="lead mb-3">${cfg.lead}</p>
<picture>
<source type="image/webp" srcset="../../img/opt/blog-generated/weekly-insurance-update-2026-07-12/${cfg.img}.webp"/>
<img alt="${cfg.alt}" class="img-fluid rounded-3 shadow-sm" src="../../img/opt/blog-generated/weekly-insurance-update-2026-07-12/${cfg.img}.png" width="${cfg.w}" height="${cfg.h}" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='../../img/opt/3-1-2026-Blog.png'"/>
</picture>
</div>
</div>`;
  return html.replace(/<div class="blog-hero mv-news hero">[\s\S]*?<\/div>\s*<\/div>\s*\n\s*<article class="py-5 mv-news page-wrap">/, heroBlock + '\n\n<article class="py-5 mv-news page-wrap">');
}

function fixSidebarLinksForArticle(html, file) {
  const sidebarByFile = {
    "blog/unum-reaseguro-ltc-2026-07-06.html": {
      eyebrow: "En esta página",
      title: "Ir a",
      links: [
        { href: "#top", label: "Resumen" },
        { href: "weekly-insurance-update-2026-07-12.html", label: "Resumen semanal del 12 de julio" },
      ],
      foot: '<a href="weekly-insurance-update-2026-07-05.html">Actualización del 5 de julio</a> — semana anterior.',
    },
    "blog/aumentos-primas-medigap-2026-07-08.html": {
      eyebrow: "En esta página",
      title: "Ir a",
      links: [
        { href: "#top", label: "Resumen" },
        { href: "weekly-insurance-update-2026-07-12.html", label: "Resumen semanal del 12 de julio" },
      ],
      foot: '<a href="weekly-insurance-update-2026-07-05.html">Actualización del 5 de julio</a> — semana anterior.',
    },
    "blog/liquidaciones-vida-naifa-2026-07-11.html": {
      eyebrow: "En esta página",
      title: "Ir a",
      links: [
        { href: "#top", label: "Resumen" },
        { href: "weekly-insurance-update-2026-07-12.html", label: "Resumen semanal del 12 de julio" },
      ],
      foot: '<a href="weekly-insurance-update-2026-07-05.html">Actualización del 5 de julio</a> — semana anterior.',
    },
    "en/blog/unum-ltc-reinsurance-2026-07-06.html": {
      eyebrow: "On this page",
      title: "Jump to",
      links: [
        { href: "#top", label: "Overview" },
        { href: "weekly-insurance-update-2026-07-12.html", label: "July 12 weekly digest" },
      ],
      foot: '<a href="weekly-insurance-update-2026-07-05.html">July 5 update</a> — prior week.',
    },
    "en/blog/medigap-premium-increases-2026-07-08.html": {
      eyebrow: "On this page",
      title: "Jump to",
      links: [
        { href: "#top", label: "Overview" },
        { href: "weekly-insurance-update-2026-07-12.html", label: "July 12 weekly digest" },
      ],
      foot: '<a href="weekly-insurance-update-2026-07-05.html">July 5 update</a> — prior week.',
    },
    "en/blog/naifa-life-settlement-alert-2026-07-11.html": {
      eyebrow: "On this page",
      title: "Jump to",
      links: [
        { href: "#top", label: "Overview" },
        { href: "weekly-insurance-update-2026-07-12.html", label: "July 12 weekly digest" },
      ],
      foot: '<a href="weekly-insurance-update-2026-07-05.html">July 5 update</a> — prior week.',
    },
  };
  const cfg = sidebarByFile[file];
  if (!cfg) return html;
  const list = cfg.links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("\n");
  const sidebar = `<aside aria-label="Supporting information" class="sidebar">
<section class="sidebar-card">
<span class="eyebrow">${cfg.eyebrow}</span>
<h3>${cfg.title}</h3>
<ul>
${list}
</ul>
<p class="small mb-0 mt-2 text-secondary">${cfg.foot}</p>
</section>
</aside>`;
  return html.replace(
    /<aside aria-label="Supporting information" class="sidebar">[\s\S]*?<\/aside>/,
    sidebar
  );
}

for (const rel of FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  let html = fs.readFileSync(abs, "utf8");
  html = fixCommon(html);
  if (rel.startsWith("blog/") && !rel.includes("weekly-insurance")) {
    html = fixEsBrokenHeader(html);
  }
  if (rel.startsWith("en/blog/") && !rel.includes("weekly-insurance")) {
    html = fixEnConsumerHero(html, rel);
  }
  html = fixSidebarLinksForArticle(html, rel);
  if (rel.includes("unum-reaseguro")) {
    html = html.replace("<h1>", '<h1 id="top">', 1);
  }
  if (rel.includes("unum-ltc-reinsurance")) {
    html = html.replace(/<h1>Unum and long-term care/, '<h1 id="top">Unum and long-term care');
  }
  if (rel.includes("aumentos-primas")) {
    html = html.replace("<h1>", '<h1 id="top">', 1);
  }
  if (rel.includes("medigap-premium-increases")) {
    html = html.replace(/<h1>Medigap premium/, '<h1 id="top">Medigap premium');
  }
  if (rel.includes("liquidaciones-vida")) {
    html = html.replace("<h1>", '<h1 id="top">', 1);
  }
  if (rel.includes("naifa-life-settlement")) {
    html = html.replace(/<h1>Before you sell/, '<h1 id="top">Before you sell');
  }
  fs.writeFileSync(abs, html, "utf8");
  console.log("fixed", rel);
}
