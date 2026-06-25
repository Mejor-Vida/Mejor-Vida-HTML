#!/usr/bin/env node
/**
 * Fix invalid BreadcrumbList JSON-LD on weekly blog posts (NewsArticle items → site nav).
 * Run: node scripts/fix-blog-breadcrumb-schema.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/weekly-insurance-update-.*\.html$/i.test(name)) acc.push(full);
  }
  return acc;
}

function extractMeta(html, attr, key) {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["']`,
    "i"
  );
  const m = html.match(re);
  return (m && (m[1] || m[2]) || "").trim();
}

function extractCanonical(html) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (tag) {
    const href = tag[0].match(/href=["']([^"']+)["']/i);
    if (href) return href[1].trim();
  }
  const alt = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return alt ? alt[1].trim() : "";
}

function decodeHtmlEntities(str) {
  return String(str)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function extractHeadline(html) {
  const og = decodeHtmlEntities(extractMeta(html, "property", "og:title"));
  if (og) return og;
  const hm = html.match(/"headline"\s*:\s*"([^"\\]+(?:\\.[^"\\]*)*)"/);
  if (hm) return decodeHtmlEntities(hm[1].replace(/\\"/g, '"'));
  const tm = html.match(/<title>([^<]+)<\/title>/i);
  if (tm) return decodeHtmlEntities(tm[1].replace(/\s*\|\s*Mejor Vida Insurance\s*$/i, "").trim());
  return "Weekly Insurance Update";
}

function escapeJson(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function buildBreadcrumbBlock({ homeName, homeUrl, blogName, blogUrl, articleName, articleUrl }) {
  return `<!-- JSON-LD: BreadcrumbList -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "${escapeJson(homeName)}", "item": "${escapeJson(homeUrl)}" },
      { "@type": "ListItem", "position": 2, "name": "${escapeJson(blogName)}", "item": "${escapeJson(blogUrl)}" },
      { "@type": "ListItem", "position": 3, "name": "${escapeJson(articleName)}", "item": "${escapeJson(articleUrl)}" }
    ]
  }
  </script>`;
}

function parseLdJsonBlocks(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">\s*/gi;
  let m;
  while ((m = re.exec(html))) {
    const jsonStart = m.index + m[0].length;
    let depth = 0;
    let started = false;
    for (let i = jsonStart; i < html.length; i++) {
      const ch = html[i];
      if (ch === "{") {
        depth++;
        started = true;
      } else if (ch === "}") {
        depth--;
        if (started && depth === 0) {
          const scriptStart = m.index;
          const scriptEnd = html.indexOf("</script>", i) + "</script>".length;
          const json = html.slice(jsonStart, i + 1);
          blocks.push({ scriptStart, scriptEnd, json });
          break;
        }
      }
    }
  }
  return blocks;
}

function getBreadcrumbBlock(html) {
  const blocks = parseLdJsonBlocks(html);
  const commentIdx = html.indexOf("<!-- JSON-LD: BreadcrumbList -->");
  for (const block of blocks) {
    if (!/"@type"\s*:\s*"BreadcrumbList"/.test(block.json)) continue;
    if (commentIdx >= 0 && Math.abs(commentIdx - block.scriptStart) < 80) return block;
    if (commentIdx < 0) return block;
  }
  return null;
}

function breadcrumbNeedsFix(html) {
  const block = getBreadcrumbBlock(html);
  if (!block) return false;
  const json = block.json;
  if (
    /"@type"\s*:\s*"NewsArticle"/.test(json) ||
    /"item"\s*:\s*\{\s*"@type"\s*:\s*"NewsArticle"/.test(json)
  ) {
    return true;
  }
  const canonical = extractCanonical(html);
  if (!canonical) return false;
  const itemMatch = json.match(/"position"\s*:\s*3[\s\S]*?"item"\s*:\s*"([^"]+)"/);
  if (itemMatch && itemMatch[1] !== canonical) return true;
  return /&amp;/.test(json);
}

function replaceBreadcrumbBlock(html, replacement) {
  const block = getBreadcrumbBlock(html);
  if (!block) return html;
  const hasComment =
    html.slice(Math.max(0, block.scriptStart - 60), block.scriptStart).includes(
      "<!-- JSON-LD: BreadcrumbList -->"
    );
  const start = hasComment
    ? html.lastIndexOf("<!-- JSON-LD: BreadcrumbList -->", block.scriptStart)
    : block.scriptStart;
  return html.slice(0, start) + replacement + html.slice(block.scriptEnd);
}

function fixFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  if (!breadcrumbNeedsFix(html)) return false;

  const canonical = extractCanonical(html);
  const articleName = extractHeadline(html);
  const articleUrl = canonical || "";
  const isEn = /\/en\/blog\//i.test(canonical) || /class="lang-en"/i.test(html);

  const homeName = isEn ? "Home" : "Inicio";
  const blogName = "Blog";
  const homeUrl = isEn
    ? "https://www.mejorvidainsurance.com/en/"
    : "https://www.mejorvidainsurance.com/";
  const blogUrl = isEn
    ? "https://www.mejorvidainsurance.com/en/blog.html"
    : "https://www.mejorvidainsurance.com/blog.html";

  const replacement = buildBreadcrumbBlock({
    homeName,
    homeUrl,
    blogName,
    blogUrl,
    articleName,
    articleUrl: articleUrl || homeUrl,
  });

  const next = replaceBreadcrumbBlock(html, replacement);

  if (next === html) return false;
  fs.writeFileSync(filePath, next, "utf8");
  return true;
}

function main() {
  const dirs = [
    path.join(ROOT, "blog"),
    path.join(ROOT, "en/blog"),
    path.join(ROOT, "sources/blog"),
    path.join(ROOT, "sources/en/blog"),
  ];
  const files = dirs.flatMap((d) => walk(d));
  let fixed = 0;
  for (const file of files) {
    if (fixFile(file)) {
      fixed++;
      console.log("Fixed", path.relative(ROOT, file));
    }
  }
  console.log(`Done. Fixed ${fixed} file(s).`);
}

main();
