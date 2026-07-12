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
  contactName,
} = require("./crm-nurture-templates");

/** Current week package (synced with FB/post-package.json after each publish). */
const SAMPLE_FB_POST_PATH = path.join(
  __dirname,
  "../FB/post-package-weekly-2026-07-12-medigap.json"
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
      post_date_iso: "2026-07-12",
      email_subject: "¿Le llegó un aviso de aumento de prima de su Medigap?",
      email_caption:
        "¿Le llegó un aviso de aumento de prima de su Medigap (Medicare Supplement)?\n\n" +
        "¿Sabía que dos personas con el mismo Plan G pueden recibir aumentos completamente diferentes dependiendo de la compañía y del estado donde viven?\n\n" +
        "Muchas familias están viendo aumentos este año, y no todas las compañías incrementan sus primas de la misma manera.\n\n" +
        "Muchas aseguradoras han presentado solicitudes de aumento para las pólizas Medigap Plan G que, dependiendo del estado y de la compañía, van aproximadamente del 12% a más del 26%. En algunos casos aislados, los aumentos reportados han sido mucho mayores.\n\n" +
        "¿Por qué sucede esto?\n\n" +
        "El aumento en el uso de servicios médicos, el incremento en los costos de la atención médica y los ajustes actuariales en algunos planes han contribuido a estas alzas. El Plan G es uno de los planes Medigap más populares y, por ello, también uno de los más afectados.\n\n" +
        "Lo importante es no asumir que debe quedarse con el mismo plan sin conocer todas sus opciones. En algunos estados existen reglas, como la \"regla del cumpleaños\", que pueden facilitar ciertos cambios de cobertura.\n\n" +
        "Fuente: CBS News (8 de julio de 2026) y análisis de la industria aseguradora.\n\n" +
        "Este contenido es únicamente educativo. No constituye una cotización, una recomendación personalizada ni una promesa de ahorro. Las opciones disponibles varían según el estado, la compañía y la situación de cada persona.",
      image_url:
        "https://www.mejorvidainsurance.com/img/opt/blog-generated/weekly-insurance-update-2026-07-12/hero-es.png",
      blog_url:
        "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-07-12.html#story2",
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
