"use strict";

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text) {
  return escHtml(text).replace(
    /\[([^\]]+)\]\((https?:[^)]+)\)/g,
    '<a href="$2" rel="noopener" target="_blank">$1</a>'
  );
}

function renderTable(block) {
  const headers = (block.headers || []).map((h) => `<th scope="col">${escHtml(h)}</th>`).join("");
  const rows = (block.rows || [])
    .map((row) => `<tr>${row.map((cell) => `<td>${escHtml(cell)}</td>`).join("")}</tr>`)
    .join("\n");
  const caption = block.caption ? `<caption>${escHtml(block.caption)}</caption>` : "";
  const lead = block.lead ? `<p class="fe-guide-table-lead">${renderInline(block.lead)}</p>\n` : "";
  const foot = block.foot ? `<p class="fe-guide-table-foot">${renderInline(block.foot)}</p>` : "";
  return `${lead}<div class="fe-guide-table-wrap"><table class="fe-guide-table">${caption}<thead><tr>${headers}</tr></thead><tbody>\n${rows}\n</tbody></table></div>\n${foot}`;
}

function renderFaq(block, lang) {
  const title = block.heading || (lang === "en" ? "Common questions" : "Preguntas frecuentes");
  const items = (block.items || [])
    .map(
      (item) =>
        `<div class="fe-guide-faq-item"><h3>${escHtml(item.q)}</h3><p>${renderInline(item.a)}</p></div>`
    )
    .join("\n");
  return `<section class="fe-guide-faq-list" aria-label="${escHtml(title)}"><h2 class="h4 fw-bold mt-4 mb-3" style="color:#1a365d;">${escHtml(title)}</h2>\n${items}</section>`;
}

function renderSources(block, lang) {
  const title = block.heading || (lang === "en" ? "Public sources" : "Fuentes públicas");
  const items = (block.items || [])
    .map((item) => {
      const label = escHtml(item.label);
      if (item.url) {
        return `<li><a href="${escHtml(item.url)}" rel="noopener" target="_blank">${label}</a></li>`;
      }
      return `<li>${label}</li>`;
    })
    .join("\n");
  return `<section class="fe-guide-sources"><h2 class="h6 fw-bold mb-2" style="color:#1a365d;">${escHtml(title)}</h2><ul>\n${items}\n</ul></section>`;
}

function renderBlock(block, lang) {
  if (!block) return "";
  if (typeof block === "string") return `  <p>${renderInline(block)}</p>`;
  const type = block.type || (block.heading ? "h2p" : "p");
  if (type === "p") return `  <p>${renderInline(block.text || "")}</p>`;
  if (type === "h2") {
    return `  <h2 class="h4 fw-bold mt-4 mb-2" style="color:#1a365d;">${escHtml(block.text)}</h2>`;
  }
  if (type === "h2p") {
    const heading = block.heading
      ? `  <h2 class="h4 fw-bold mt-4 mb-2" style="color:#1a365d;">${escHtml(block.heading)}</h2>\n`
      : "";
    return `${heading}  <p>${renderInline(block.text || "")}</p>`;
  }
  if (type === "ul") {
    const items = (block.items || []).map((item) => `    <li>${renderInline(item)}</li>`).join("\n");
    const heading = block.heading
      ? `  <h2 class="h4 fw-bold mt-4 mb-2" style="color:#1a365d;">${escHtml(block.heading)}</h2>\n`
      : "";
    return `${heading}  <ul class="fe-guide-list">\n${items}\n  </ul>`;
  }
  if (type === "note") {
    return `  <aside class="fe-guide-note"><p>${renderInline(block.text || "")}</p></aside>`;
  }
  if (type === "table") return renderTable(block);
  if (type === "faq") return renderFaq(block, lang);
  if (type === "sources") return renderSources(block, lang);
  return `  <p>${renderInline(block.text || "")}</p>`;
}

function renderBody(guide, lang) {
  if (Array.isArray(guide.blocks) && guide.blocks.length) {
    return guide.blocks.map((b) => renderBlock(b, lang)).join("\n");
  }
  const paragraphs = guide.paragraphs || [];
  return paragraphs
    .map((p) => {
      if (typeof p === "string") return `  <p>${renderInline(p)}</p>`;
      return renderBlock({ type: "h2p", heading: p.heading, text: p.text }, lang);
    })
    .join("\n");
}

function faqEntities(guide) {
  const fromBlocks = (guide.blocks || []).find((b) => b && b.type === "faq");
  if (fromBlocks && fromBlocks.items && fromBlocks.items.length) {
    return fromBlocks.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }));
  }
  return null;
}

module.exports = { escHtml, renderBody, renderInline, faqEntities };
