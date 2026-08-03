/**
 * Weekly consumer blog digest → lead email (Sunday send).
 * Short story teasers + small images + links to each story on the weekly digest page.
 */

const {
  wrapNewsletterHtml,
  sampleSpanishContact,
  leadEmailCtaRow,
  contactName,
} = require("./crm-nurture-templates");

const SITE = "https://www.mejorvidainsurance.com";
const IMG = `${SITE}/img/opt/blog-generated/weekly-insurance-update-2026-08-02`;

/** Email-friendly image width (shrunken for inbox). */
const STORY_IMG_WIDTH = 280;

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Current week — life insurance / final expense only (ES). */
function getCurrentWeeklyBlogDigest() {
  return {
    post_date_iso: "2026-08-02",
    subject: "3 temas de seguro de vida y gastos finales esta semana",
    intro:
      "Cada semana compartimos un resumen corto de noticias sobre seguro de vida y gastos finales — para que usted y su familia sepan qué está pasando y qué pueden hacer.",
    digest_url: `${SITE}/blog/weekly-insurance-update-2026-08-02.html`,
    stories: [
      {
        title: "Beneficio gradual o período de espera en gastos finales",
        summary:
          "Algunas pólizas no pagan el monto completo de inmediato por muerte natural. Pregunte cuándo empieza el beneficio completo y qué se paga durante la espera.",
        image_url: `${IMG}/story-1.png`,
        image_alt: "Beneficio gradual en gastos finales",
        article_url: `${SITE}/blog/weekly-insurance-update-2026-08-02.html#story1`,
      },
      {
        title: "Muchas familias sobreestiman el costo del seguro a término",
        summary:
          "Life Happens y LIMRA hallaron que cerca de tres de cada cuatro adultos adivinan un precio demasiado alto. Pida una cotización real según su meta familiar.",
        image_url: `${IMG}/story-2.png`,
        image_alt: "Costo del seguro de vida a término",
        article_url: `${SITE}/blog/weekly-insurance-update-2026-08-02.html#story2`,
      },
      {
        title: "Errores comunes al nombrar beneficiarios",
        summary:
          "Nombrar la herencia, dejar un nombre viejo o no poner un contingente puede retrasar el dinero del funeral. Revise su formulario esta semana.",
        image_url: `${IMG}/story-3.png`,
        image_alt: "Beneficiarios del seguro de gastos finales",
        article_url: `${SITE}/blog/weekly-insurance-update-2026-08-02.html#story3`,
      },
    ],
  };
}

function storyBlockHtml(story) {
  const img = String(story.image_url || "").trim();
  const title = escapeHtml(story.title || "");
  const summary = escapeHtml(story.summary || "");
  const url = escapeHtml(story.article_url || "");
  const alt = escapeHtml(story.image_alt || story.title || "");
  const imgHtml = img
    ? `<div style="text-align:center;margin:0 0 12px;">
  <a href="${url}" style="text-decoration:none;">
    <img src="${escapeHtml(img)}" alt="${alt}" width="${STORY_IMG_WIDTH}" style="width:${STORY_IMG_WIDTH}px;max-width:100%;height:auto;border-radius:8px;border:0;display:inline-block;" />
  </a>
</div>`
    : "";

  return `<div style="margin:0 0 28px;padding:0 0 20px;border-bottom:1px solid #e8eef5;">
${imgHtml}
<p style="margin:0 0 8px;font-size:17px;line-height:1.35;color:#1e3a8a;"><strong>${title}</strong></p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#333;">${summary}</p>
<p style="margin:0;text-align:center;">
  <a href="${url}" style="display:inline-block;padding:10px 18px;border-radius:6px;font-weight:bold;font-size:14px;text-decoration:none;background:#1a56db;color:#ffffff;">Leer esta historia</a>
</p>
</div>`;
}

function buildWeeklyBlogDigestEmailParts(digest) {
  const d = digest || getCurrentWeeklyBlogDigest();
  const stories = Array.isArray(d.stories) ? d.stories : [];
  const intro = escapeHtml(d.intro || "");
  const digestUrl = escapeHtml(d.digest_url || "");

  let bodyHtml = `<p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#333;">${intro}</p>\n`;
  bodyHtml += stories.map(storyBlockHtml).join("\n");

  if (digestUrl) {
    bodyHtml += `<p style="text-align:center;margin:8px 0 4px;">
  <a href="${digestUrl}" style="color:#1a56db;font-weight:bold;font-size:14px;">Ver el resumen semanal completo en nuestro blog</a>
</p>`;
  }

  return {
    subject: String(d.subject || "Actualización semanal — Mejor Vida Insurance").trim(),
    heroHtml: "",
    bodyHtml,
    heroSource: "blog_digest",
    blogUrl: d.digest_url || null,
    digest: d,
  };
}

function buildWeeklyBlogDigestEmailHtml(digest, contact, settings) {
  const parts = buildWeeklyBlogDigestEmailParts(digest);
  const c = contact || sampleSpanishContact();
  const name = contactName(c, "spanish");
  const greeting = `<p>Hola ${escapeHtml(name)},</p>\n`;
  const cta = leadEmailCtaRow(false);
  const html = wrapNewsletterHtml(
    parts.heroHtml,
    `${greeting}${parts.bodyHtml}${cta}`,
    c,
    settings || { content_language: "spanish" }
  );
  return {
    subject: parts.subject,
    html,
    heroHtml: parts.heroHtml,
    bodyHtml: greeting + parts.bodyHtml + cta,
    digest: parts.digest,
  };
}

function getWeeklyBlogDigestEmailPreview(digest, settings) {
  const built = buildWeeklyBlogDigestEmailHtml(
    digest || getCurrentWeeklyBlogDigest(),
    sampleSpanishContact(),
    settings
  );
  return {
    subject: built.subject,
    html: built.html,
    language: "spanish",
    digest: built.digest,
  };
}

module.exports = {
  STORY_IMG_WIDTH,
  getCurrentWeeklyBlogDigest,
  buildWeeklyBlogDigestEmailParts,
  buildWeeklyBlogDigestEmailHtml,
  getWeeklyBlogDigestEmailPreview,
  escapeHtml,
};
