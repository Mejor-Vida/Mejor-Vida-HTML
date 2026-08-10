#!/usr/bin/env node
/**
 * Spanish-first sitemap: indexable public content only (no tools, staff, EN, noindex pages).
 * Usage: node scripts/generate-sitemap.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = "https://www.mejorvidainsurance.com";
const OUT = path.join(ROOT, "sitemap.xml");

const STATIC_PAGES = [
  { loc: "/", priority: "1.00" },
  { loc: "/about-julie.html", priority: "0.85" },
  { loc: "/blog.html", priority: "0.80" },
  { loc: "/seguro-gastos-finales.html", priority: "0.90" },
  { loc: "/seguro-vida-entierro-sin-espera.html", priority: "0.88" },
  { loc: "/seguro-vida-entierro-sin-espera.html", priority: "0.88" },
  { loc: "/guias-gastos-finales.html", priority: "0.85" },
  { loc: "/contact.html", priority: "0.75" },
  { loc: "/quote.html", priority: "0.90" },
  { loc: "/schedule-julie.html", priority: "0.75" },
  { loc: "/aseguradoras.html", priority: "0.80" },
  { loc: "/tipos-seguro-vida.html", priority: "0.80" },
  { loc: "/costo-seguro-vida.html", priority: "0.80" },
  { loc: "/final-expense-estimator.html", priority: "0.70" },
  { loc: "/carriers/assurity.html", priority: "0.70" },
  { loc: "/carriers/mutual-of-omaha.html", priority: "0.70" },
  { loc: "/carriers/american-amicable.html", priority: "0.70" },
  { loc: "/carriers/transamerica.html", priority: "0.70" },
];

/** Standalone July articles redirect to the weekly digest — omit from sitemap. */
const REDIRECT_ONLY_BLOGS = new Set([
  "unum-reaseguro-ltc-2026-07-06.html",
  "aumentos-primas-medigap-2026-07-08.html",
  "liquidaciones-vida-naifa-2026-07-11.html",
]);

function isNoindex(html) {
  return /name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ||
    /content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

function lastmodFromFile(filePath) {
  const stat = fs.statSync(filePath);
  return stat.mtime.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

function feGuidePages() {
  const dir = path.join(ROOT, "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(
      (name) =>
        name.endsWith(".html") &&
        !name.startsWith("_") &&
        !/^weekly-insurance-update-/.test(name) &&
        !/^blog-template/.test(name) &&
        !REDIRECT_ONLY_BLOGS.has(name)
    )
    .map((name) => {
      const abs = path.join(dir, name);
      const html = fs.readFileSync(abs, "utf8");
      if (isNoindex(html)) return null;
      return {
        loc: `/blog/${name}`,
        priority: "0.85",
        lastmod: lastmodFromFile(abs),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.loc.localeCompare(b.loc));
}

function blogPosts() {
  const dir = path.join(ROOT, "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /^weekly-insurance-update-/.test(name) && name.endsWith(".html"))
    .map((name) => {
      const abs = path.join(dir, name);
      const html = fs.readFileSync(abs, "utf8");
      if (isNoindex(html)) return null;
      return {
        loc: `/blog/${name}`,
        priority: "0.70",
        lastmod: lastmodFromFile(abs),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.loc.localeCompare(a.loc));
}

function xmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildUrlEntry(loc, priority, lastmod) {
  const full = loc === "/" ? `${BASE}/` : `${BASE}${loc}`;
  let block = `  <url>\n    <loc>${xmlEscape(full)}</loc>\n`;
  if (lastmod) block += `    <lastmod>${lastmod}</lastmod>\n`;
  block += `    <priority>${priority}</priority>\n  </url>`;
  return block;
}

const entries = [];
for (const page of STATIC_PAGES) {
  const rel = page.loc === "/" ? "index.html" : page.loc.replace(/^\//, "");
  const abs = path.join(ROOT, rel);
  const lastmod = fs.existsSync(abs) ? lastmodFromFile(abs) : null;
  entries.push(buildUrlEntry(page.loc, page.priority, lastmod));
}

for (const guide of feGuidePages()) {
  entries.push(buildUrlEntry(guide.loc, guide.priority, guide.lastmod));
}

for (const post of blogPosts()) {
  entries.push(buildUrlEntry(post.loc, post.priority, post.lastmod));
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${entries.join("\n\n")}

</urlset>
`;

fs.writeFileSync(OUT, xml, "utf8");
console.log(`Wrote ${OUT} (${entries.length} URLs, Spanish indexable content only)`);
