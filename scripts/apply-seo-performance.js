#!/usr/bin/env node
/**
 * SEO Priority 1 gaps + Priority 2 performance (defer scripts, FA subset link).
 * Usage: node scripts/apply-seo-performance.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GA_ID = "G-K921EG6JWG";

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
  "staff",
  "FB",
  "includes",
]);

const SKIP_FILES = new Set([
  "website-avatar/asset-qa.html",
  "medical-intake-preview.html",
  "business_card.html",
  "review-fb-may10.html",
]);

const GA4_SNIPPET = `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>`;

const FA_CDN =
  /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.5\.1\/css\/all\.min\.css[^"']*/g;

const DEFER_SCRIPTS = [
  /(<script)(\s+src="[^"]*bootstrap\.bundle\.min\.js")(?![^>]*\bdefer\b)/gi,
  /(<script)(\s+src="[^"]*hero-quotes-data\.js")(?![^>]*\bdefer\b)/gi,
  /(<script)(\s+src="[^"]*\/script\.js")(?![^>]*\bdefer\b)/gi,
  /(<script)(\s+src="script\.js")(?![^>]*\bdefer\b)/gi,
];

function walkHtml(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(abs, acc);
    else if (
      ent.name.endsWith(".html") &&
      !SKIP_FILES.has(path.relative(ROOT, abs).split(path.sep).join("/"))
    ) {
      acc.push(abs);
    }
  }
  return acc;
}

function relPrefix(filePath) {
  const rel = path.relative(path.dirname(filePath), ROOT).split(path.sep);
  if (rel.length === 1 && rel[0] === "") return "";
  return rel.map(() => "..").join("/") + "/";
}

function faHrefFor(filePath) {
  return `${relPrefix(filePath)}css/fontawesome-mvi.min.css`;
}

function addGa4(html) {
  if (html.includes(GA_ID)) return html;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>\n${GA4_SNIPPET}`);
  }
  return html;
}

function addFunnelTrackScript(html, filePath) {
  if (!html.includes(GA_ID)) return html;
  if (html.includes("mvi-funnel-track.js")) return html;
  const prefix = relPrefix(filePath);
  const tag = `<script src="${prefix}js/mvi-funnel-track.js?v=20260702e"></script>`;

  if (html.includes("mvi-ga4-funnel.js")) {
    return html.replace(
      /(<script[^>]+src="[^"]*mvi-ga4-funnel\.js[^"]*"[^>]*>)/i,
      `${tag}\n$1`
    );
  }
  if (html.includes("mvi-hubspot-meeting-sync.js")) {
    return html.replace(
      /(<script[^>]+src="[^"]*mvi-hubspot-meeting-sync\.js[^"]*"[^>]*>)/i,
      `${tag}\n$1`
    );
  }
  const deferScriptMarkers = [
    `<script defer src="${prefix}script.js"`,
    `<script defer="" src="${prefix}script.js"`,
    `<script defer src="script.js"`,
    `<script defer="" src="script.js"`,
  ];
  for (const marker of deferScriptMarkers) {
    if (html.includes(marker)) {
      return html.replace(marker, `${tag}\n${marker}`);
    }
  }
  return html;
}

function addGa4FunnelScript(html, filePath) {
  if (!html.includes(GA_ID)) return html;
  if (html.includes("mvi-ga4-funnel.js")) return html;
  const prefix = relPrefix(filePath);
  const deferTag = `<script defer src="${prefix}js/mvi-ga4-funnel.js"></script>`;
  const syncTag = `<script src="${prefix}js/mvi-ga4-funnel.js"></script>`;

  if (html.includes("mvi-quote-wizard.js")) {
    return html.replace(
      /(<script[^>]+src="[^"]*mvi-quote-wizard\.js[^"]*"[^>]*>)/i,
      `${syncTag}\n$1`
    );
  }

  const deferScriptMarkers = [
    `<script defer src="${prefix}script.js"`,
    `<script defer="" src="${prefix}script.js"`,
    `<script defer src="script.js"`,
    `<script defer="" src="script.js"`,
  ];
  for (const marker of deferScriptMarkers) {
    if (html.includes(marker)) {
      return html.replace(marker, `${deferTag}\n${marker}`);
    }
  }
  return html;
}

function replaceFa(html, filePath) {
  const href = faHrefFor(filePath);
  if (!FA_CDN.test(html) && !html.includes("css/fontawesome-mvi.min.css")) return html;
  FA_CDN.lastIndex = 0;
  return html.replace(
    /<link[^>]*href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.5\.1\/css\/all\.min\.css"[^>]*>/gi,
    `<link href="${href}" rel="stylesheet"/>`
  );
}

function addDefer(html) {
  let out = html;
  for (const re of DEFER_SCRIPTS) {
    out = out.replace(re, '$1 defer$2');
  }
  return out;
}

function patchContactEs(html) {
  if (!html.includes("contact.html") || html.includes('lang="en"')) return html;
  if (!html.includes("Contáctenos")) return html;

  html = html.replace(
    /<title>Contáctenos - Mejor Vida Insurance \| Contact Us - Mejor Vida Insurance<\/title>/,
    "<title>Contáctenos | Mejor Vida Insurance</title>"
  );

  if (!html.includes('rel="canonical"')) {
    const canonical =
      '<meta content="Contacte a Mejor Vida Insurance por teléfono, WhatsApp, correo o agende una llamada con Julie sobre seguros de gastos finales en Nebraska." name="description"/>' +
      '<link href="https://www.mejorvidainsurance.com/contact.html" rel="canonical"/>' +
      '<meta content="Contáctenos | Mejor Vida Insurance" property="og:title"/>' +
      '<meta content="Contacte a Mejor Vida Insurance por teléfono, WhatsApp, correo o agende una llamada con Julie sobre seguros de gastos finales en Nebraska." property="og:description"/>' +
      '<meta content="https://www.mejorvidainsurance.com/contact.html" property="og:url"/>' +
      '<meta content="website" property="og:type"/>' +
      '<meta content="https://www.mejorvidainsurance.com/img/opt/logo-spanish2.png" property="og:image"/>' +
      '<meta content="summary_large_image" name="twitter:card"/>' +
      '<meta content="Contáctenos | Mejor Vida Insurance" name="twitter:title"/>' +
      '<meta content="https://www.mejorvidainsurance.com/img/opt/logo-spanish2.png" name="twitter:image"/>';

    html = html.replace(
      /<link href="https:\/\/www\.mejorvidainsurance\.com\/contact\.html" hreflang="es-US"/,
      canonical + '<link href="https://www.mejorvidainsurance.com/contact.html" hreflang="es-US"'
    );
  }

  return html;
}

function patchOgImages(html) {
  return html
    .replace(
      /https:\/\/www\.mejorvidainsurance\.com\/img\/julie-headshot\.png/g,
      "https://www.mejorvidainsurance.com/img/opt/julie-about.jpg"
    )
    .replace(
      /https:\/\/www\.mejorvidainsurance\.com\/img\/hero-couple-embrace\.png/g,
      "https://www.mejorvidainsurance.com/img/opt/hero-couple-embrace.jpg"
    );
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;

  html = addGa4(html);
  html = addGa4FunnelScript(html, filePath);
  html = addFunnelTrackScript(html, filePath);
  html = replaceFa(html, filePath);
  html = addDefer(html);
  html = patchContactEs(html);
  html = patchOgImages(html);

  if (html !== before) {
    fs.writeFileSync(filePath, html);
    return true;
  }
  return false;
}

const files = walkHtml(ROOT);
let changed = 0;
let gaAdded = 0;
let deferCount = 0;

for (const f of files) {
  const before = fs.readFileSync(f, "utf8");
  const hadGa = before.includes(GA_ID);
  if (processFile(f)) {
    changed++;
    const after = fs.readFileSync(f, "utf8");
    if (!hadGa && after.includes(GA_ID)) gaAdded++;
    if (
      (before.includes("bootstrap.bundle.min.js") &&
        !/bootstrap\.bundle\.min\.js"[^>]*defer|defer[^>]*bootstrap\.bundle/.test(before) &&
        after.includes('bootstrap.bundle.min.js" defer')) ||
      (before.includes("hero-quotes-data.js") &&
        !before.includes("hero-quotes-data.js") === false &&
        /hero-quotes-data\.js" defer|defer[^>]*hero-quotes-data/.test(after))
    ) {
      deferCount++;
    }
  }
}

console.log(`Processed ${files.length} HTML files`);
console.log(`Updated ${changed} files`);
console.log(`GA4 added to ${gaAdded} new pages`);
