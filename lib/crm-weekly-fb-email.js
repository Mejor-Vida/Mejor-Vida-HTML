/**
 * Weekly Facebook post → lead email (Sunday nurture send).
 * Content imported via /api/staff/newsletter-import (hero_source: facebook).
 */

const fs = require("fs");
const path = require("path");
const {
  wrapNewsletterHtml,
  sampleSpanishContact,
  leadEmailCtaRow,
} = require("./crm-nurture-templates");

const SAMPLE_FB_POST_PATH = path.join(
  __dirname,
  "../FB/post-package-story3-weekly-2026-07-12.json"
);

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function defaultSubjectFromFbPost(fbPost) {
  const custom = String(fbPost.email_subject || fbPost.subject || "").trim();
  if (custom) return custom;
  const caption = String(
    fbPost.email_caption || fbPost.emailCaption || fbPost.main_caption || ""
  ).trim();
  const firstLine = caption.split(/\n/)[0] || "";
  if (firstLine.length > 0 && firstLine.length <= 120) return firstLine;
  if (firstLine.length > 120) return firstLine.slice(0, 117) + "…";
  const date = String(fbPost.post_date_iso || "").trim();
  return date
    ? `Mejor Vida Insurance — actualización del ${date}`
    : "Mejor Vida Insurance — publicación semanal";
}

function captionToBodyHtml(caption) {
  return String(caption || "")
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

function buildWeeklyFbPostEmailParts(fbPost) {
  const post = fbPost || {};
  const imageUrl = String(post.image_url || post.imageUrl || "").trim();
  const blogUrl = String(post.blog_url || post.blogUrl || "").trim();
  const heroHtml = imageUrl
    ? `<div style="text-align:center;margin:0 0 20px;"><img src="${escapeHtml(imageUrl)}" alt="" width="560" style="max-width:100%;height:auto;border-radius:8px;" /></div>`
    : "";

  let bodyHtml = captionToBodyHtml(
    post.email_caption || post.emailCaption || post.main_caption
  );
  if (blogUrl) {
    bodyHtml +=
      `<p style="text-align:center;margin:20px 0 8px;">` +
      `<a href="${escapeHtml(blogUrl)}" style="color:#1a56db;font-weight:bold;">Leer el artículo completo en nuestro blog</a>` +
      `</p>`;
  }

  return {
    subject: defaultSubjectFromFbPost(post),
    heroHtml,
    bodyHtml,
    heroSource: "facebook",
    blogUrl: blogUrl || null,
  };
}

function buildWeeklyFbPostEmailHtml(fbPost, contact, settings) {
  const parts = buildWeeklyFbPostEmailParts(fbPost);
  const cta = leadEmailCtaRow(false);
  const html = wrapNewsletterHtml(
    parts.heroHtml,
    `${parts.bodyHtml}${cta}`,
    contact || sampleSpanishContact(),
    settings || { content_language: "spanish" }
  );
  return { subject: parts.subject, html, heroHtml: parts.heroHtml, bodyHtml: parts.bodyHtml + cta };
}

function getWeeklyFbPostEmailPreview(fbPost, settings) {
  const built = buildWeeklyFbPostEmailHtml(fbPost, sampleSpanishContact(), settings);
  return {
    subject: built.subject,
    html: built.html,
    language: "spanish",
  };
}

function loadExampleWeeklyFbPost() {
  try {
    if (fs.existsSync(SAMPLE_FB_POST_PATH)) {
      return JSON.parse(fs.readFileSync(SAMPLE_FB_POST_PATH, "utf8"));
    }
  } catch (e) {
    /* fall through */
  }
  return {
    post_date_iso: "2026-07-12",
    main_caption:
      "¿Le llegó un aviso de aumento de prima de su Medigap (Medicare Supplement)?

Muchas familias están viendo subidas fuertes este año — y no todas las compañías aumentan igual.",
    email_caption:
      "¿Le llegó un aviso de aumento de prima de su Medigap (Medicare Supplement)?

Muchas familias están viendo subidas fuertes este año — y no todas las compañías aumentan igual.

Algunas aseguradoras han pedido aumentos de Plan G entre el 12% y más del 26% en varios estados. Comparar opciones y conocer las reglas de su estado puede ayudar.

Contenido educativo. No es una cotización ni una promesa de ahorro; cada caso y cada estado son distintos.",
    image_url:
      "https://www.mejorvidainsurance.com/img/opt/blog-generated/weekly-insurance-update-2026-07-12/story-3.png",
    blog_url:
      "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-07-12.html#story3",
  };
}

function normalizeFbPostImportBody(body) {
  const raw = body && typeof body === "object" ? body : {};
  const nested = raw.fb_post && typeof raw.fb_post === "object" ? raw.fb_post : {};
  const mainCaption = String(
    raw.main_caption || raw.mainCaption || nested.main_caption || ""
  ).trim();
  if (!mainCaption) return null;
  return {
    main_caption: mainCaption,
    email_caption: String(
      raw.email_caption || raw.emailCaption || nested.email_caption || ""
    ).trim(),
    image_url: String(raw.image_url || raw.imageUrl || nested.image_url || "").trim(),
    blog_url: String(raw.blog_url || raw.blogUrl || nested.blog_url || "").trim(),
    post_date_iso: String(raw.post_date_iso || raw.postDateIso || nested.post_date_iso || "").trim(),
    email_subject: String(raw.email_subject || raw.subject || nested.email_subject || "").trim(),
  };
}

module.exports = {
  escapeHtml,
  defaultSubjectFromFbPost,
  buildWeeklyFbPostEmailParts,
  buildWeeklyFbPostEmailHtml,
  getWeeklyFbPostEmailPreview,
  loadExampleWeeklyFbPost,
  normalizeFbPostImportBody,
  SAMPLE_FB_POST_PATH,
};
