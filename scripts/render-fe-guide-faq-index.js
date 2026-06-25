#!/usr/bin/env node
/**
 * Render homepage FAQ guide cards + FAQPage JSON-LD from data/fe-guide-faq-index.json
 * Usage: node scripts/render-fe-guide-faq-index.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data/fe-guide-faq-index.json");
const INDEX = path.join(ROOT, "index.html");

const data = JSON.parse(fs.readFileSync(DATA, "utf8"));

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function card(g) {
  const href = `blog/${g.slug}.html`;
  return `        <div class="col-md-6 col-lg-4">
          <article class="bg-white rounded-3 p-4 shadow-sm h-100 fe-guide-faq-card position-relative">
            <h3 class="h6 fw-bold mb-2" style="color:#1a365d;"><a class="text-decoration-none stretched-link" style="color:#1a365d;" href="${href}">${esc(g.question)}</a></h3>
            <p class="small text-body-secondary lh-base mb-2">${esc(g.teaser)}</p>
            <p class="small mb-0"><span class="text-primary fw-semibold">Guía de Julie →</span></p>
          </article>
        </div>`;
}

const htmlParts = [];
for (const cat of data.categories) {
  htmlParts.push(`      <h3 class="h5 fw-bold mt-4 mb-3" style="color:#1a365d;">${esc(cat.title)}</h3>`);
  htmlParts.push(`      <div class="row g-3 mb-2">`);
  for (const g of cat.guides) {
    htmlParts.push(card(g));
  }
  htmlParts.push(`      </div>`);
}
const htmlBlock = htmlParts.join("\n");

const entities = [];
for (const cat of data.categories) {
  for (const g of cat.guides) {
    entities.push({
      "@type": "Question",
      name: g.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: g.teaser,
      },
    });
  }
}
const schemaBlock = `<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entities,
  },
  null,
  2
)}
</script>`;

let index = fs.readFileSync(INDEX, "utf8");

const htmlStart = "<!-- FE_GUIDE_FAQ_CARDS_START -->";
const htmlEnd = "<!-- FE_GUIDE_FAQ_CARDS_END -->";
const schemaStart = "<!-- FE_GUIDE_FAQ_SCHEMA_START -->";
const schemaEnd = "<!-- FE_GUIDE_FAQ_SCHEMA_END -->";

if (!index.includes(htmlStart)) {
  console.error("Missing FE_GUIDE_FAQ_CARDS markers in index.html");
  process.exit(1);
}

index = index.replace(
  new RegExp(`${htmlStart}[\\s\\S]*?${htmlEnd}`, "m"),
  `${htmlStart}\n${htmlBlock}\n      ${htmlEnd}`
);
index = index.replace(
  new RegExp(`${schemaStart}[\\s\\S]*?${schemaEnd}`, "m"),
  `${schemaStart}\n${schemaBlock}\n${schemaEnd}`
);

fs.writeFileSync(INDEX, index, "utf8");
const count = entities.length;
console.log(`Updated index.html FAQ section (${count} guide links, ${data.categories.length} categories).`);
