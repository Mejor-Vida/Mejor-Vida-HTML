#!/usr/bin/env node
/**
 * Render homepage FAQ guide cards + FAQPage JSON-LD from data/fe-guide-faq-index.json
 * Usage: node scripts/render-fe-guide-faq-index.js
 */
const fs = require("fs");
const path = require("path");
const {
  loadFaqIndex,
  isGuidePublished,
  renderPublishedGuideCard,
} = require("../lib/fe-guide-catalog");

const ROOT = path.join(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");

const data = loadFaqIndex();

const htmlParts = [];
const esencial = data.categories.find((cat) => cat.id === "esencial") || { guides: [] };
const homepageGuides = esencial.guides.filter((g) => g.image && isGuidePublished(g.slug));
const soonCount = data.categories.reduce(
  (n, cat) => n + cat.guides.filter((g) => !isGuidePublished(g.slug)).length,
  0
);
htmlParts.push(`      <div class="row g-4 mb-2 fe-guide-media-grid">`);
for (const g of homepageGuides) {
  htmlParts.push(renderPublishedGuideCard(g, { imagePrefix: "img/opt/" }));
}
htmlParts.push(`      </div>`);
if (soonCount > 0) {
  htmlParts.push(`      <div class="text-center mt-4 mb-1">
        <a class="fe-guide-faq-soon-btn" href="guias-gastos-finales.html">
          <span class="fe-guide-faq-soon-badge">Próximamente</span>
          <span class="fe-guide-faq-soon-btn-label">${soonCount} guías más en camino</span>
        </a>
        <p class="small text-body-secondary mt-2 mb-0">Estamos escribiendo más respuestas. Mientras tanto, vea el <a href="guias-gastos-finales.html">índice completo de guías</a>.</p>
      </div>`);
}
const htmlBlock = htmlParts.join("\n");

const entities = homepageGuides.map((g) => ({
  "@type": "Question",
  name: g.question,
  acceptedAnswer: {
    "@type": "Answer",
    text: g.teaser,
  },
}));
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

if (index.includes(schemaStart) && index.includes(schemaEnd)) {
  index = index.replace(
    new RegExp(`${schemaStart}[\\s\\S]*?${schemaEnd}`, "m"),
    `${schemaStart}\n${schemaBlock}\n${schemaEnd}`
  );
}

if (!index.includes('fe-guide-answers--media')) {
  index = index.replace(
    /<section class="py-5 py-md-5(?: bg-light)?" id="final-expense-answers">/,
    '<section class="py-5 py-md-5 fe-guide-answers--media" id="final-expense-answers">'
  );
}

index = index.replace(
  /href="css\/fe-guide\.css(?:\?v=[^"]*)?"/,
  'href="css/fe-guide.css?v=20260903-guide-labels"'
);

index = index.replace(
  /(<section[^>]*id="final-expense-answers"[^>]*>[\s\S]*?<div class="container") style="max-width:\d+rem;"/,
  '$1 style="max-width:52rem;"'
);

fs.writeFileSync(INDEX, index, "utf8");
const total = data.categories.reduce((n, c) => n + c.guides.length, 0);
const published = entities.length;
console.log(
  `Updated index.html FAQ section (${published} published of ${total} guides, ${data.categories.length} categories).`
);
