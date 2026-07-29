/**
 * Weekly Facebook post → lead email (Sunday nurture send).
 * Content imported via /api/staff/newsletter-import (hero_source: facebook).
 * Topic scope: life insurance / final expense only (see crm-weekly-topic-guard.js).
 */

const fs = require("fs");
const path = require("path");
const {
  wrapNewsletterHtml,
  sampleSpanishContact,
  leadEmailCtaRow,
  contactName,
} = require("./crm-nurture-templates");

/** Current week package (synced with FB/post-package.json after each publish). */
const SAMPLE_FB_POST_PATH = path.join(
  __dirname,
  "../FB/post-package-weekly-2026-07-19-life.json"
);

const FALLBACK_FB_POST_PATH = path.join(__dirname, "../FB/post-package.json");

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
    email_subject: defaultSubjectFromFbPost(post),
    email_caption: String(
      post.email_caption || post.emailCaption || post.main_caption || ""
    ),
    main_caption: String(post.main_caption || ""),
  };
}

function buildWeeklyFbPostEmailHtml(fbPost, contact, settings) {
  const parts = buildWeeklyFbPostEmailParts(fbPost);
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
  };
}

function getWeeklyFbPostEmailPreview(fbPost, settings) {
  const built = buildWeeklyFbPostEmailHtml(fbPost, sampleSpanishContact(), settings);
  return {
    subject: built.subject,
    html: built.html,
    language: "spanish",
  };
}

function readFbPostJson(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (e) {
    /* fall through */
  }
  return null;
}

function loadExampleWeeklyFbPost() {
  return (
    readFbPostJson(SAMPLE_FB_POST_PATH) ||
    readFbPostJson(FALLBACK_FB_POST_PATH) || {
      post_date_iso: "2026-07-19",
      email_subject: "Cuidado: cartas falsas sobre un “seguro de vida no reclamado”",
      email_caption:
        "¿Le llegó una carta diciendo que hay un “seguro de vida no reclamado” con su apellido?\n\n" +
        "Autoridades y la FTC advierten que esas cartas suelen ser falsas. No envíe dinero ni datos personales.\n\n" +
        "Este contenido es únicamente educativo sobre seguro de vida y gastos finales.",
      image_url:
        "https://www.mejorvidainsurance.com/img/opt/blog-generated/weekly-insurance-update-2026-07-19/story-1.png",
      blog_url:
        "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-07-19.html#story1",
      main_caption:
        "Cartas falsas sobre seguro de vida no reclamado — proteja a su familia. #SeguroDeVida #GastosFinales",
    }
  );
}

function normalizeFbPostImportBody(body) {
  const raw = body && typeof body === "object" ? body : {};
  const nested = raw.fb_post && typeof raw.fb_post === "object" ? raw.fb_post : {};
  const mainCaption = String(
    raw.main_caption || raw.mainCaption || nested.main_caption || ""
  ).trim();
  const emailCaption = String(
    raw.email_caption || raw.emailCaption || nested.email_caption || ""
  ).trim();
  if (!mainCaption && !emailCaption) return null;
  return {
    main_caption: mainCaption || emailCaption,
    email_caption: emailCaption || mainCaption,
    image_url: String(raw.image_url || raw.imageUrl || nested.image_url || "").trim(),
    blog_url: String(raw.blog_url || raw.blogUrl || nested.blog_url || "").trim(),
    post_date_iso: String(
      raw.post_date_iso || raw.postDateIso || nested.post_date_iso || ""
    ).trim(),
    email_subject: String(
      raw.email_subject || raw.subject || nested.email_subject || ""
    ).trim(),
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
