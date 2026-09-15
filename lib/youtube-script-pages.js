/**
 * Teaching pages for the CRM YouTube tab, in website-nav order.
 * Funeral mega → life mega → FE guide hub (skipping duplicates).
 */
const fs = require("fs");
const path = require("path");
const { loadFaqIndex, guideHref } = require("./fe-guide-catalog");

const ROOT = path.join(__dirname, "..");
const HEADER = path.join(ROOT, "includes/site-header-inner.html");

const AMOUNT_RE = /costo-seguro-vida-(5000|10000|15000|20000|25000|30000|40000|50000|75000|100000|500000|1000000|2000000|3000000)$/;

function stripTags(html) {
  return String(html || "")
    .replace(/<span[^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromFile(file) {
  return String(file || "")
    .replace(/\.html$/i, "")
    .replace(/\/+$/, "");
}

function extractLinks(chunk) {
  const out = [];
  const re = /<a\s[^>]*href="(__PREFIX__|\/)?([^"#?]+)(?:[?#][^"]*)?"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(chunk))) {
    let file = String(m[2] || "").trim();
    if (!file || file.startsWith("http") || file.startsWith("tel:") || file.startsWith("mailto:")) continue;
    file = file.replace(/^\/+/, "");
    if (!/\.html$/i.test(file)) continue;
    if (file === "index.html" || file === "quote.html" || file === "buscar-sitio.html") continue;
    const title = stripTags(m[3]);
    if (!title) continue;
    out.push({ file, title, slug: slugFromFile(file) });
  }
  return out;
}

function sliceBetween(html, startNeedle, endNeedle) {
  const start = html.indexOf(startNeedle);
  if (start < 0) return "";
  const from = start + startNeedle.length;
  const end = html.indexOf(endNeedle, from);
  return end > from ? html.slice(from, end) : html.slice(from);
}

function clusterParent(slug) {
  if (AMOUNT_RE.test(slug)) return "costo-seguro-vida";
  return null;
}

function uniquePages(items, seen) {
  const out = [];
  for (const item of items) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out;
}

function listYoutubeScriptPages() {
  const html = fs.readFileSync(HEADER, "utf8");
  const seen = new Set();

  const funeralRaw = extractLinks(sliceBetween(html, 'id="nav-funeral-mega"', 'class="nav-about-dropdown"'));
  const funeral = uniquePages(
    funeralRaw.map((p) => ({
      ...p,
      group: "funeral",
      groupTitle: "Recursos funerarios",
      urlEs: `/${p.file}`,
      clusterParent: clusterParent(p.slug),
    })),
    seen
  );

  const lifeRaw = extractLinks(sliceBetween(html, 'id="nav-life-mega"', 'class="nav-funeral-dropdown"'));
  const life = uniquePages(
    lifeRaw.map((p) => ({
      ...p,
      group: "life",
      groupTitle: "Seguro de vida y gastos finales",
      urlEs: `/${p.file}`,
      clusterParent: clusterParent(p.slug),
    })),
    seen
  );

  const guides = [];
  const faq = loadFaqIndex();
  for (const cat of faq.categories || []) {
    for (const g of cat.guides || []) {
      const slug = String(g.slug || "").trim();
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const href = guideHref(slug, { lang: "es" });
      guides.push({
        slug,
        file: href.replace(/^\//, ""),
        title: g.cardLabel || g.question || slug,
        group: "guides",
        groupTitle: "Guía de seguro de gastos finales",
        groupSubtitle: cat.title || "",
        urlEs: href.startsWith("/") ? href : `/${href}`,
        urlEn: g.slugEn ? `/en/${g.slugEn}.html` : "",
        clusterParent: clusterParent(slug),
      });
    }
  }

  return { groups: [
    { id: "funeral", title: "Recursos funerarios", pages: funeral },
    { id: "life", title: "Seguro de vida y gastos finales", pages: life },
    { id: "guides", title: "Guía de seguro de gastos finales", pages: guides },
  ]};
}

function findYoutubeScriptPage(slug) {
  const { groups } = listYoutubeScriptPages();
  const want = String(slug || "").trim();
  for (const g of groups) {
    for (const p of g.pages) {
      if (p.slug === want) return p;
    }
  }
  return null;
}

function htmlPathForPage(page) {
  if (!page || !page.file) return null;
  const candidate = path.join(ROOT, page.file);
  if (fs.existsSync(candidate)) return candidate;
  const blog = path.join(ROOT, "blog", `${page.slug}.html`);
  if (fs.existsSync(blog)) return blog;
  return null;
}

module.exports = {
  listYoutubeScriptPages,
  findYoutubeScriptPage,
  htmlPathForPage,
  slugFromFile,
};
