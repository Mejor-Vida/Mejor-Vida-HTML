#!/usr/bin/env node
/**
 * Resize + WebP + fallback for all site HTML image assets.
 * Output: img/opt/ (flat) and img/opt/blog-generated/ (preserves slug paths).
 *
 * Usage: npm run optimize:images
 * Excludes: img/mvi-chat-avatar/**
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "img", "opt");
const BLOG_SRC = path.join(ROOT, "img", "blog-generated");

/** @type {Array<{src:string,maxWidth:number,maxHeight:number,keepPng?:boolean,outBase?:string}>} */
const JOBS = [
  // Homepage (existing)
  { src: "img/business-man.png", maxWidth: 681, maxHeight: 1024, keepPng: true },
  { src: "img/nav-life-rana.jpg", maxWidth: 1024, maxHeight: 819, outBase: "nav-life-rana" },
  { src: "img/nav-life-tejo.jpg", maxWidth: 1024, maxHeight: 768, outBase: "nav-life-tejo" },
  { src: "img/hero-couple-embrace.png", maxWidth: 681, maxHeight: 1024 },
  { src: "img/hero-couple-embrace.png", maxWidth: 480, maxHeight: 720, outBase: "hero-couple-embrace-480" },
  { src: "img/happy-family.png", maxWidth: 1400, maxHeight: 900 },
  { src: "img/happy-family.png", maxWidth: 800, maxHeight: 514, outBase: "happy-family-800" },
  { src: "img/fe-about-seniors-laptop.jpg", maxWidth: 1000, maxHeight: 750 },
  { src: "img/fe-guide-card-que-es.jpg", maxWidth: 800, maxHeight: 600 },
  { src: "img/fe-guide-card-tipos.jpg", maxWidth: 800, maxHeight: 600 },
  { src: "img/fe-guide-card-cuanto-cuesta.jpg", maxWidth: 800, maxHeight: 600 },
  { src: "img/fe-guide-card-medicare.jpg", maxWidth: 800, maxHeight: 600 },
  { src: "img/grandma-grandson.png", maxWidth: 960, maxHeight: 1024, keepPng: true },
  { src: "img/grandma-grandson.png", maxWidth: 640, maxHeight: 682, keepPng: true, outBase: "grandma-grandson-640" },
  { src: "img/woman-flowers.png", maxWidth: 566, maxHeight: 1024, keepPng: true },
  { src: "img/julie-about.png", maxWidth: 530, maxHeight: 795, keepPng: true },
  { src: "img/logo-spanish2.png", maxWidth: 800, maxHeight: 534, keepPng: true },
  { src: "img/logo-english2.png", maxWidth: 800, maxHeight: 534, keepPng: true },
  { src: "img/landing/como-funciona/lp-step-1-mira-aprende.jpg", maxWidth: 640, maxHeight: 427 },
  { src: "img/landing/como-funciona/lp-step-2-cotizacion.jpg", maxWidth: 640, maxHeight: 427 },
  { src: "img/landing/como-funciona/lp-step-3-agenda-julie.jpg", maxWidth: 640, maxHeight: 427 },
  { src: "img/landing/como-funciona/lp-step-4-proteccion.jpg", maxWidth: 640, maxHeight: 427 },
  // Site-wide
  { src: "img/julie-headshot.png", maxWidth: 160, maxHeight: 160 },
  { src: "img/julie-community-mothers-children.png", maxWidth: 1200, maxHeight: 700 },
  { src: "img/julie-parents-embrace.png", maxWidth: 681, maxHeight: 1024 },
  { src: "img/landing/legacy-safeguard-family.png", maxWidth: 800, maxHeight: 810 },
  { src: "img/landing/trust-ssl-protected.png", maxWidth: 176, maxHeight: 176, keepPng: true },
  { src: "img/landing/goal-protect-loved-ones-icon.png", maxWidth: 320, maxHeight: 320, keepPng: true },
  { src: "img/landing/goal-inheritance-icon.png", maxWidth: 320, maxHeight: 320, keepPng: true },
  { src: "img/landing/goal-funeral-expenses-icon.png", maxWidth: 320, maxHeight: 320, keepPng: true },
  { src: "img/landing/goal-not-sure-icon.png", maxWidth: 320, maxHeight: 320, keepPng: true },
  { src: "img/soft-cta-bar-learn.jpg", maxWidth: 800, maxHeight: 800 },
  { src: "img/soft-cta-bar-quote.jpg", maxWidth: 800, maxHeight: 800 },
  { src: "img/soft-cta-bar-schedule.jpg", maxWidth: 800, maxHeight: 800 },
  { src: "img/carriers/mutual-of-omaha-logo.png", maxWidth: 400, maxHeight: 100, keepPng: true },
  { src: "img/carriers/american-amicable-logo.png", maxWidth: 520, maxHeight: 120, keepPng: true },
  { src: "img/carriers/transamerica-logo.png", maxWidth: 480, maxHeight: 114, keepPng: true },
  { src: "img/carriers/americo-logo.png", maxWidth: 400, maxHeight: 128, keepPng: true },
  { src: "img/mvi-promo-seguros-whatsapp.png", maxWidth: 800, maxHeight: 450 },
  { src: "img/julie-promo-funeral-cost.png", maxWidth: 900, maxHeight: 900 },
  { src: "img/funeral-calculator-menu.png", maxWidth: 720, maxHeight: 576, outBase: "funeral-calculator-menu" },
  { src: "img/about-help-hikers.jpg", maxWidth: 800, maxHeight: 572, outBase: "about-help-hikers" },
  { src: "img/usa-coverage-map.jpg", maxWidth: 800, maxHeight: 533, outBase: "usa-coverage-map" },
  { src: "img/logo-spanish2-email.png", maxWidth: 440, maxHeight: 300, keepPng: true },
  { src: "img/logo-english2-email.png", maxWidth: 440, maxHeight: 300, keepPng: true },
  { src: "gastos-finales-ads-v2/img/objective-quote.png", maxWidth: 320, maxHeight: 320, keepPng: true, outBase: "objective-quote" },
  { src: "gastos-finales-ads-v2/img/objective-calculator.png", maxWidth: 320, maxHeight: 320, keepPng: true, outBase: "objective-calculator" },
  { src: "gastos-finales-ads-v2/img/objective-schedule.png", maxWidth: 320, maxHeight: 320, keepPng: true, outBase: "objective-schedule" },
  { src: "img/landing-v3-quote-cta-hero.jpg", maxWidth: 640, maxHeight: 640, outBase: "landing-v3-quote-cta-hero" },
  { src: "img/tool-funeral-calculator-ui.png", maxWidth: 900, maxHeight: 620, outBase: "tool-funeral-calculator-ui" },
  { src: "img/tool-quote-results-ui.png", maxWidth: 900, maxHeight: 520, outBase: "tool-quote-results-ui" },
  { src: "img/tool-chatbot-ui.png", maxWidth: 560, maxHeight: 720, outBase: "tool-chatbot-ui" },
  { src: "img/tool-site-search-ui.png", maxWidth: 900, maxHeight: 520, outBase: "tool-site-search-ui" },
  { src: "img/tool-term-quote-ui.png", maxWidth: 900, maxHeight: 520, outBase: "tool-term-quote-ui" },
  { src: "img/lip-hero-sunrise.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lip-hero-sunrise" },
  { src: "img/lic-hero-dolphin-pier.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-dolphin-pier" },
  { src: "img/lic-hero-horse-field.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-horse-field" },
  { src: "img/lic-hero-corn-windmill.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-corn-windmill" },
  { src: "img/lic-hero-cattle-drive.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-cattle-drive" },
  { src: "img/lic-hero-alpine-lakes.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-alpine-lakes" },
  { src: "img/lic-hero-fjord.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-fjord" },
  { src: "img/lic-hero-monument-valley.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-monument-valley" },
  { src: "img/lic-hero-pueblo-street.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-pueblo-street" },
  { src: "img/lic-hero-rice-terraces.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-rice-terraces" },
  { src: "img/lic-hero-icebergs.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-icebergs" },
  { src: "img/lic-hero-savanna-elephants.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-savanna-elephants" },
  { src: "img/lic-hero-tropical-lagoon.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-tropical-lagoon" },
  { src: "img/lic-hero-sea-cliffs.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-sea-cliffs" },
  { src: "img/lic-hero-fuji-sakura.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-fuji-sakura" },
  { src: "img/lic-hero-desert-oasis.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-desert-oasis" },
  { src: "img/lic-hero-karst-river.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-karst-river" },
  { src: "img/lic-hero-andes-llamas.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-andes-llamas" },
  { src: "img/lic-hero-fly-fishing.png", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-fly-fishing" },
  { src: "img/lic-hero-vida-buena.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-vida-buena" },
  { src: "img/lic-hero-coffee-finca.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-coffee-finca" },
  { src: "img/lic-hero-futbol-barrio.png", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-futbol-barrio" },
  { src: "img/lic-hero-desert-saguaro.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-desert-saguaro" },
  { src: "img/lic-hero-children-playground.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-children-playground" },
  { src: "img/lic-hero-grandchildren-park.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-grandchildren-park" },
  { src: "img/lic-hero-family-coast.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-family-coast" },
  { src: "img/lic-hero-family-tuscany.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-family-tuscany" },
  { src: "img/lic-hero-family-fuji.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-family-fuji" },
  { src: "img/lic-hero-family-paine.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-family-paine" },
  { src: "img/lic-hero-family-deadvlei.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-family-deadvlei" },
  { src: "img/lic-hero-family-black-sand.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "lic-hero-family-black-sand" },
  { src: "img/nav-family-guide-meal.jpg", maxWidth: 1024, maxHeight: 539, outBase: "nav-family-guide-meal" },
  { src: "img/nav-fe-preexisting-seniors.jpg", maxWidth: 1024, maxHeight: 543, outBase: "nav-fe-preexisting-seniors" },
  { src: "img/nav-term-preexisting-family.jpg", maxWidth: 1024, maxHeight: 484, outBase: "nav-term-preexisting-family" },
  { src: "img/fep-hero-rainforest.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "fep-hero-rainforest" },
  { src: "img/fep-hero-bus-stop-couple.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "fep-hero-bus-stop-couple" },
  { src: "img/fep-hero-centennial-bridge.jpg", maxWidth: 1600, maxHeight: 1066, outBase: "fep-hero-centennial-bridge" },
  { src: "img/3-1-2026-Blog.png", maxWidth: 1200, maxHeight: 675 },
  { src: "img/2-22-2026-Blog.png", maxWidth: 1200, maxHeight: 675 },
  { src: "img/2-16-2026-Blog.png", maxWidth: 1200, maxHeight: 675 },
  { src: "img/2-8-2026-Blog.png", maxWidth: 1200, maxHeight: 675 },
  { src: "img/2-1-2026-Blog.png", maxWidth: 1200, maxHeight: 675 },
];

function fitInside(meta, maxWidth, maxHeight) {
  const w = meta.width || maxWidth;
  const h = meta.height || maxHeight;
  const scale = Math.min(1, maxWidth / w, maxHeight / h);
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

function walkPngFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkPngFiles(abs, acc);
    else if (/\.(png|jpe?g)$/i.test(ent.name)) acc.push(abs);
  }
  return acc;
}

async function optimizeOne(job) {
  const absIn = path.join(ROOT, job.src);
  if (!fs.existsSync(absIn)) {
    console.warn("skip (missing):", job.src);
    return null;
  }

  const rel = job.src.replace(/^img\//, "");
  const isBlog = job.src.startsWith("img/blog-generated/");
  const base = job.outBase || path.basename(job.src).replace(/\.[^.]+$/, "");
  const outSubdir = isBlog
    ? path.join(OUT_DIR, "blog-generated", path.dirname(rel).replace(/^blog-generated\//, ""))
    : OUT_DIR;
  fs.mkdirSync(outSubdir, { recursive: true });

  const meta = await sharp(absIn, { failOn: "none" }).rotate().metadata();
  const { width, height } = fitInside(meta, job.maxWidth, job.maxHeight);
  const pipeline = sharp(absIn, { failOn: "none" }).rotate().resize(width, height, {
    fit: "inside",
    withoutEnlargement: true,
  });

  const webpOut = path.join(outSubdir, `${base}.webp`);
  await pipeline.clone().webp({ quality: 86, effort: 4 }).toFile(webpOut);

  const keepPng = job.keepPng || /\.png$/i.test(job.src);
  const fallbackOut = path.join(outSubdir, `${base}.${keepPng ? "png" : "jpg"}`);
  if (keepPng) {
    await pipeline.clone().png({ compressionLevel: 9, palette: false }).toFile(fallbackOut);
  } else {
    await pipeline.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(fallbackOut);
  }

  const webpRel = path.relative(ROOT, webpOut).split(path.sep).join("/");
  const fallbackRel = path.relative(ROOT, fallbackOut).split(path.sep).join("/");
  const origSize = fs.statSync(absIn).size;
  const webpSize = fs.statSync(webpOut).size;
  const fallbackSize = fs.statSync(fallbackOut).size;
  console.log(
    `${job.src} → ${width}x${height} | ${(origSize / 1024).toFixed(0)}KB → webp ${(webpSize / 1024).toFixed(0)}KB`,
  );
  return {
    src: job.src.split(path.sep).join("/"),
    base,
    width,
    height,
    webp: webpRel,
    fallback: fallbackRel,
    keepPng,
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const results = [];

  for (const job of JOBS) {
    const r = await optimizeOne(job);
    if (r) results.push(r);
  }

  const blogFiles = walkPngFiles(BLOG_SRC);
  for (const abs of blogFiles) {
    const rel = path.relative(ROOT, abs).split(path.sep).join("/");
    const isHero = /hero/i.test(path.basename(rel));
    const r = await optimizeOne({
      src: rel,
      maxWidth: isHero ? 1200 : 800,
      maxHeight: isHero ? 800 : 600,
    });
    if (r) results.push(r);
  }

  const manifestPath = path.join(OUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} optimized sets to img/opt/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
