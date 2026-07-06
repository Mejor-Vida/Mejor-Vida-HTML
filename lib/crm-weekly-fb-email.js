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
  "../FB/post-package-story3-weekly-2026-07-05.json"
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
    post_date_iso: "2026-07-05",
    main_caption:
      "¿Perdió mucho peso con Ozempic, Wegovy o Zepbound y está pensando en un seguro de vida?\n\n" +
      "Muchas familias no saben que esos medicamentos pueden cambiar por completo cómo lo evalúan las aseguradoras.",
    email_caption:
      "¿Perdió mucho peso con Ozempic, Wegovy o Zepbound y está pensando en un seguro de vida?\n\n" +
      "Muchas familias no saben que esos medicamentos pueden cambiar por completo cómo lo evalúan las aseguradoras.\n\n" +
      "Hoy millones de personas usan medicamentos GLP-1 para bajar de peso o controlar la diabetes. Los resultados pueden ser impresionantes: menos peso, mejor presión, mejor azúcar en sangre.\n\n" +
      "Pero aquí está el detalle que casi nadie le explica:\n\n" +
      "Si deja el medicamento — y la mayoría de las personas lo dejan en el primer año — el peso muchas veces regresa. Las aseguradoras lo saben.\n\n" +
      "Por eso muchas compañías ya no usan solo su peso actual. Algunas suman de nuevo parte del peso que perdió recientemente al calcular su riesgo. También están agregando preguntas directas sobre si usa Ozempic, Wegovy, Mounjaro o Zepbound.\n\n" +
      "¿Por qué importa?\n\n" +
      "Porque si no responde con honestidad en la solicitud, podría haber problemas más adelante si su familia necesita el beneficio.\n\n" +
      "Contenido educativo. No es asesoría médica ni garantía de aprobación; cada caso es distinto.",
    image_url:
      "https://www.mejorvidainsurance.com/img/opt/blog-generated/weekly-insurance-update-2026-07-05/story-3.png",
    blog_url:
      "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-07-05.html#story3",
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
