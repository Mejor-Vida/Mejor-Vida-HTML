#!/usr/bin/env node
/**
 * Build a public-page search index (title, description, body excerpt).
 * Usage: node scripts/build-site-search-index.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "data", "site-search.json");

const SKIP_DIRS = new Set([
  "api",
  "staff",
  "tools",
  "sources",
  "preview",
  "node_modules",
  ".git",
  ".cursor",
  "includes",
  "scripts",
  "integrations",
  "lib",
  "css",
  "js",
  "img",
  "bootstrap",
  "facebook-posting",
  "website-avatar",
  "email-previews",
  "mejor-vida-backend",
  "guides",
  "data",
  "Landing page",
  "gastos-finales-ads",
  "gastos-finales-ads-v2",
  "gastos-finales-ads-v3",
]);

const SKIP_FILES = new Set([
  "blog-template.html",
  "_fe-guide-shell.html",
  "quote-results.html",
  "term-quote-results.html",
  "thank-you-out-of-state.html",
  "medical-intake.html",
  "medical-intake-preview.html",
  "landing-gastos-finales.html",
  "landing-final-expense.html",
]);

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const abs = path.join(dir, name);
    const rel = path.relative(ROOT, abs);
    const parts = rel.split(path.sep);
    if (parts.some((p) => SKIP_DIRS.has(p))) continue;
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      walk(abs, acc);
      continue;
    }
    if (!name.endsWith(".html")) continue;
    if (SKIP_FILES.has(name)) continue;
    if (name.startsWith("_")) continue;
    acc.push(abs);
  }
  return acc;
}

function attr(html, name) {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
    "i"
  );
  const m = html.match(re) || html.match(re2);
  return m ? decode(m[1]).trim() : "";
}

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function strip(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function pageUrl(abs) {
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel === "en/index.html") return "/en/";
  return "/" + rel;
}

function pageLang(abs, html) {
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  if (rel === "index.html" || rel.startsWith("en/") || /(?:^|\/)en\//.test(rel)) {
    if (rel.startsWith("en/")) return "en";
  }
  const lang = String((html.match(/<html[^>]*\blang=["']([^"']+)/i) || [])[1] || "").toLowerCase();
  if (lang.indexOf("en") === 0) return "en";
  const cls = String((html.match(/<html[^>]*\bclass=["']([^"']+)/i) || [])[1] || "");
  if (/\blang-en\b/.test(cls)) return "en";
  return "es";
}

function cleanTitle(raw) {
  let t = decode(raw).replace(/\s+/g, " ").trim();
  t = t.replace(/\s*\|\s*Mejor Vida(?: Seguros| Insurance(?: LLC)?)?\s*$/i, "");
  return t.trim();
}

function isNoindex(html) {
  return /name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ||
    /content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

const files = walk(ROOT, []);
const pages = [];

for (const abs of files) {
  const html = fs.readFileSync(abs, "utf8");
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  // English pages are noindex for SEO but still public — include them in search.
  if (!rel.startsWith("en/") && isNoindex(html)) continue;
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = cleanTitle(titleMatch ? titleMatch[1] : "");
  const description = attr(html, "description") || attr(html, "og:description");
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? strip(h1Match[1]) : "";
  const body = strip(html).slice(0, 1200);
  if (!title && !description) continue;
  const lang = pageLang(abs, html);
  pages.push({
    url: pageUrl(abs),
    lang,
    title: title || h1,
    description: description.slice(0, 280),
    h1,
    text: body,
  });
}

pages.sort((a, b) => a.lang.localeCompare(b.lang) || a.url.localeCompare(b.url));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), pages }, null, 0), "utf8");
const es = pages.filter((p) => p.lang === "es").length;
const en = pages.filter((p) => p.lang === "en").length;
console.log(`Wrote ${OUT} (${pages.length} pages: ${es} es, ${en} en)`);
