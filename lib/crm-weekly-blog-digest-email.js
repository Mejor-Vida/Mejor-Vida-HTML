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
const IMG = `${SITE}/img/opt/blog-generated/weekly-insurance-update-2026-07-12`;

/** Email-friendly image width (shrunken for inbox). */
const STORY_IMG_WIDTH = 280;

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Current week — July 12, 2026 consumer digest (ES). */
function getCurrentWeeklyBlogDigest() {
  return {
    post_date_iso: "2026-07-12",
    subject: "3 noticias de seguros que las familias deben conocer esta semana",
    intro:
      "Cada semana compartimos un resumen corto de las noticias más importantes del mundo de los seguros — para que usted y su familia sepan qué está pasando y qué pueden hacer.",
    digest_url: `${SITE}/blog/weekly-insurance-update-2026-07-12.html`,
    stories: [
      {
        title: "Unum y el cuidado a largo plazo",
        summary:
          "Unum anunció un acuerdo grande sobre pólizas antiguas de cuidado a largo plazo. Si usted tiene una de estas pólizas, Unum sigue administrando el servicio — el cambio es principalmente financiero entre compañías.",
        image_url: `${IMG}/story-1.png`,
        image_alt: "Unum — cuidado a largo plazo",
        article_url: `${SITE}/blog/weekly-insurance-update-2026-07-12.html#story1`,
      },
      {
        title: "Aumentos de primas Medigap",
        summary:
          "Muchas personas mayores están viendo avisos de aumento en su suplemento de Medicare. Los porcentajes varían por compañía y estado — no todos reciben el mismo aumento. Vale la pena comparar con calma antes de cambiar de plan.",
        image_url: `${IMG}/story-2.png`,
        image_alt: "Medigap — aumentos de primas",
        article_url: `${SITE}/blog/weekly-insurance-update-2026-07-12.html#story2`,
      },
      {
        title: "Antes de vender o dejar caducar un seguro de vida",
        summary:
          "Si la prima ya no le alcanza, no abandone la póliza sin preguntar. Puede haber opciones como venderla a un inversionista o usar beneficios acelerados — pero hay impuestos y reglas de Medicaid que conviene entender primero.",
        image_url: `${IMG}/story-3.png`,
        image_alt: "Pólizas de vida — alerta NAIFA",
        article_url: `${SITE}/blog/weekly-insurance-update-2026-07-12.html#story3`,
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
