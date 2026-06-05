#!/usr/bin/env node
/**
 * Apply img/opt assets to HTML: <picture> WebP, lazy load, dimensions, LCP preload.
 * Run after: npm run optimize:images
 *
 * Usage: npm run apply:image-opt-html
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MANIFEST = path.join(ROOT, "img", "opt", "manifest.json");

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "bootstrap",
  "integrations",
  "facebook-posting",
  "email-previews",
  "preview",
  "website-avatar",
  "mvi-ad-test-runner",
]);

const SKIP_FILES = new Set(["website-avatar/asset-qa.html"]);

function walkHtml(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(abs, acc);
    else if (ent.name.endsWith(".html") && !SKIP_FILES.has(path.relative(ROOT, abs).split(path.sep).join("/"))) {
      acc.push(abs);
    }
  }
  return acc;
}

function normalizeSrc(src) {
  if (!src) return null;
  let s = src.split("?")[0].trim();
  if (!s || /^https?:/i.test(s) || s.startsWith("data:")) return null;
  s = s.replace(/^\//, "");
  while (s.startsWith("../")) s = s.slice(3);
  while (s.startsWith("./")) s = s.slice(2);
  return s.split(path.sep).join("/");
}

function buildLookup(manifest) {
  const map = new Map();
  for (const entry of manifest) {
    map.set(entry.src, entry);
    if (entry.base && /^objective-/.test(entry.base)) {
      map.set(`img/${entry.base}.png`, entry);
      map.set(`gastos-finales-ads-v2/img/${entry.base}.png`, entry);
    }
  }
  return map;
}

function prefixFromSrc(src) {
  const m = src.match(/^((?:\.\.\/)+|\/)?/);
  return m ? m[0] : "";
}

function optPaths(entry, prefix) {
  const p = prefix || "";
  if (p === "/") {
    return { webp: `/${entry.webp}`, fallback: `/${entry.fallback}` };
  }
  return { webp: `${p}${entry.webp}`, fallback: `${p}${entry.fallback}` };
}

function getAttr(attrs, name) {
  const re = new RegExp(`(?:^|\\s)${name}=(["'])([\\s\\S]*?)\\1`, "i");
  const m = attrs.match(re);
  return m ? m[2] : "";
}

function stripAttr(attrs, name) {
  return attrs.replace(new RegExp(`(?:^|\\s)${name}=(["'])([\\s\\S]*?)\\1`, "gi"), "");
}

function setOrAddAttr(attrs, name, value) {
  if (new RegExp(`${name}=`, "i").test(attrs)) {
    return attrs.replace(new RegExp(`${name}=["'][^"']*["']`, "i"), `${name}="${value}"`);
  }
  return `${attrs} ${name}="${value}"`;
}

function loadingAttrs(attrs, src, inBlogHero) {
  const id = getAttr(attrs, "id");
  const cls = getAttr(attrs, "class");
  if (
    id === "header-logo" ||
    /\bheader-logo\b/.test(cls) ||
    id === "mi-header-logo" ||
    /\blf-header\b/.test(cls) ||
    (/\blf-logo\b/.test(cls) && !/\blf-julie-photo\b/.test(cls))
  ) {
    return { loading: "", extra: 'fetchpriority="high" decoding="async"' };
  }
  if (id === "footer-logo") {
    return { loading: 'loading="lazy"', extra: 'decoding="async"' };
  }
  if (inBlogHero || /blog-generated\/[^"']+\/hero/i.test(src)) {
    return { loading: 'loading="eager"', extra: 'fetchpriority="high" decoding="async"' };
  }
  if (/\blp-soft-cta-bar-bg\b/.test(cls) || /objective-(quote|calculator|schedule)/.test(src)) {
    return { loading: "", extra: 'decoding="async"' };
  }
  if (getAttr(attrs, "loading")) {
    return { loading: "", extra: getAttr(attrs, "decoding") ? "" : 'decoding="async"' };
  }
  return { loading: 'loading="lazy"', extra: 'decoding="async"' };
}

function wrapImg(match, attrs, entry, prefix, inBlogHero) {
  if (/\/opt\//.test(getAttr(attrs, "src"))) return match;
  const { webp, fallback } = optPaths(entry, prefix);
  const src = getAttr(attrs, "src");
  const pfx = prefixFromSrc(src);

  const onerrorRaw = getAttr(attrs, "onerror");
  let clean = stripAttr(attrs, "onerror");
  clean = stripAttr(clean, "src");
  clean = stripAttr(clean, "width");
  clean = stripAttr(clean, "height");
  clean = stripAttr(clean, "loading");
  clean = stripAttr(clean, "fetchpriority");
  clean = stripAttr(clean, "decoding");
  clean = clean.trim();

  const { loading, extra } = loadingAttrs(attrs, src, inBlogHero);
  const id = getAttr(attrs, "id");
  let sourceId = "";
  if (id === "header-logo") sourceId = ' id="header-logo-webp"';
  if (id === "footer-logo") sourceId = ' id="footer-logo-webp"';

  let onerrorAttr = "";
  if (onerrorRaw) {
    const fb = onerrorRaw.replace(/.*['"]([^'"]+)['"].*/, "$1");
    const fbNorm = normalizeSrc(fb);
    const fbEntry = fbNorm && lookup.get(fbNorm);
    if (fbEntry) {
      const fbPaths = optPaths(fbEntry, pfx);
      onerrorAttr = ` onerror="this.src='${fbPaths.fallback}'"`;
    } else {
      onerrorAttr = ` onerror="${onerrorRaw.replace(/"/g, "&quot;")}"`;
    }
  }

  const loadPart = [loading, extra].filter(Boolean).join(" ");
  return `<picture>
<source${sourceId} type="image/webp" srcset="${webp}"/>
<img ${clean} src="${fallback}" width="${entry.width}" height="${entry.height}" ${loadPart}${onerrorAttr}/>
</picture>`;
}

let lookup;

function processImgs(html) {
  const blogHeroRe = /<div class="blog-hero[^"]*">[\s\S]*?<\/div>/i;
  const blogHeroBlock = html.match(blogHeroRe)?.[0] || "";

  return html.replace(/<img\b([^>]*?)\/?>/gi, (match, attrs) => {
    if (/\/opt\//.test(attrs)) return match;
    const src = getAttr(attrs, "src");
    if (!src || src.includes("mvi-chat-avatar")) return match;
    if (/\.svg$/i.test(src)) {
      if (!/\bwidth=/.test(attrs) || !/\bloading=/.test(attrs)) {
        const id = getAttr(attrs, "id");
        const cls = getAttr(attrs, "class");
        let a = attrs;
        if (id === "footer-logo" && !/\bloading=/.test(a)) a += ' loading="lazy"';
        else if (!/\bloading=/.test(a) && !/header-logo/.test(cls) && id !== "header-logo") a += ' loading="lazy"';
        if (!/\bdecoding=/.test(a)) a += ' decoding="async"';
        return `<img${a}/>`;
      }
      return match;
    }

    const norm = normalizeSrc(src);
    const entry = norm && lookup.get(norm);
    if (!entry) return match;

    const inBlogHero = blogHeroBlock.includes(match);
    const prefix = prefixFromSrc(src);
    return wrapImg(match, attrs, entry, prefix, inBlogHero);
  });
}

function convertLpStepBlocks(html) {
  const stepMap = {
    "lp-step-1-mira-aprende": "Persona mirando información en una tablet",
    "lp-step-2-cotizacion": "Pareja revisando una cotización en casa",
    "lp-step-3-agenda-julie": "Julie en videollamada con un cliente",
    "lp-step-4-proteccion": "Familia abrazándose con tranquilidad",
  };

  return html.replace(
    /<article class="lp-step" style="--lp-step-bg: url\('([^']+)'\)">\s*<div ([^>]*class="[^"]*lp-step-photo[^"]*"[^>]*)><\/div>/gi,
    (_, imgPath, photoAttrs) => {
      const norm = normalizeSrc(imgPath);
      const entry = norm && lookup.get(norm);
      if (!entry) return _;
      const prefix = prefixFromSrc(imgPath);
      const { webp, fallback } = optPaths(entry, prefix);
      const base = entry.base || path.basename(norm, path.extname(norm));
      const alt = stepMap[base] || getAttr(photoAttrs, "aria-label") || "";
      return `<article class="lp-step">
<div class="lp-step-photo">
<picture>
<source type="image/webp" srcset="${webp}"/>
<img src="${fallback}" alt="${alt}" width="${entry.width}" height="${entry.height}" loading="lazy" decoding="async"/>
</picture>
</div>`;
    },
  );
}

function patchLpStepCss(html) {
  if (!html.includes("lp-step-photo")) return html;
  if (html.includes(".lp-step-photo img")) return html;
  const imgRules = `
    .lp-step-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }`;
  if (/\.lp-step-photo\s*\{[^}]*background-image:\s*var\(--lp-step-bg\)/.test(html)) {
    return html.replace(
      /\.lp-step-photo\s*\{[^}]*\}/,
      `.lp-step-photo {
      flex: 0 0 52%;
      min-height: 0;
      position: relative;
      overflow: hidden;
    }${imgRules}`,
    );
  }
  return html;
}

function injectPreload(html, filePath) {
  if (html.includes('rel="preload" as="image"')) return html;

  let preloadHref = null;
  let isWebp = true;

  const headerMatch = html.match(/<picture>[\s\S]*?id="header-logo"[^>]*src="([^"]+)"[^>]*fetchpriority="high"/i);
  if (headerMatch && !html.includes("blog-hero")) {
    const src = headerMatch[1];
    const webp = src.replace(/\.(png|jpe?g)$/i, ".webp");
    if (webp !== src) preloadHref = webp;
  }

  const blogHeroMatch = html.match(/class="blog-hero[\s\S]*?<picture>[\s\S]*?srcset="([^"]+\.webp)"/i);
  if (blogHeroMatch) preloadHref = blogHeroMatch[1];

  const carouselMatch = html.match(/carousel-slide active[\s\S]*?srcset="([^"]+\.webp)"/i);
  if (carouselMatch && html.includes("carousel-slide")) preloadHref = carouselMatch[1];

  if (!preloadHref) return html;

  const prefix = filePath.includes("/en/") || filePath.includes("/blog/") ? "" : "";
  const link = `<link rel="preload" as="image" href="${preloadHref}" type="image/webp" fetchpriority="high"/>`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `${link}\n</head>`);
  }
  return html;
}

function processFile(absPath) {
  let html = fs.readFileSync(absPath, "utf8");
  const before = html;

  html = convertLpStepBlocks(html);
  html = patchLpStepCss(html);
  html = processImgs(html);
  html = injectPreload(html, absPath);

  if (html !== before) {
    fs.writeFileSync(absPath, html);
    return true;
  }
  return false;
}

function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.error("Missing img/opt/manifest.json — run npm run optimize:images first");
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  lookup = buildLookup(manifest);

  const files = walkHtml(ROOT);
  let changed = 0;
  for (const f of files) {
    if (processFile(f)) {
      changed++;
      console.log("updated:", path.relative(ROOT, f));
    }
  }
  console.log(`\nUpdated ${changed} HTML files`);
}

main();
