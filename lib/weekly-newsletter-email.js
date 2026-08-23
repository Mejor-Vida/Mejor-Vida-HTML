/**
 * Staff / client HTML for the researched Sunday digest (self-contained; no unpublished blog URLs).
 */

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphsHtml(text, style) {
  const parts = String(text || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return "";
  return parts
    .map(
      (p) =>
        `<p style="${style}">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`
    )
    .join("\n");
}

function sourceLine(story, lang) {
  const isEn = lang === "en" || lang === "english";
  const name = escapeHtml(story.source_name || (isEn ? "original source" : "fuente original"));
  const url = String(story.source_url || "").trim();
  const link = url
    ? `<a href="${escapeHtml(url)}" style="color:#1a56db;">${escapeHtml(url)}</a>`
    : "";
  if (!url) {
    return isEn ? `Learn more from ${name}.` : `Puede leer más en ${name}.`;
  }
  return isEn
    ? `If you want to read this from the original source (${name}): ${link}`
    : `Si desea verlo en la fuente original (${name}): ${link}`;
}

function storyBlockHtml(story, lang) {
  const title = escapeHtml(story.title || "");
  const body = paragraphsHtml(
    story.summary,
    "margin:0 0 12px;font-size:15px;line-height:1.6;color:#333;"
  );
  return `<div style="margin:0 0 28px;padding:0 0 20px;border-bottom:1px solid #e8eef5;">
<p style="margin:0 0 12px;font-size:17px;line-height:1.35;color:#1e3a8a;"><strong>${title}</strong></p>
${body}
<p style="margin:0;font-size:13px;line-height:1.5;color:#555;">${sourceLine(story, lang)}</p>
</div>`;
}

function localizedDigest(digest, lang) {
  const d = digest || {};
  const isEn = lang === "en" || lang === "english";
  if (isEn && d.en && (d.en.subject || d.en.intro || (d.en.stories && d.en.stories.length))) {
    return {
      ...d,
      subject: d.en.subject || d.subject,
      preview: d.en.preview || d.preview,
      intro: d.en.intro || d.intro,
      lesson: d.en.lesson || d.lesson,
      stories: d.en.stories || d.stories,
    };
  }
  return d;
}

function buildWeeklyResearchEmailParts(digest, lang) {
  const d = localizedDigest(digest, lang);
  const isEn = lang === "en" || lang === "english";
  const stories = Array.isArray(d.stories) ? d.stories : [];
  const introHtml = paragraphsHtml(
    d.intro || "",
    "margin:0 0 20px;font-size:16px;line-height:1.65;color:#333;"
  );
  const lessonHtml = paragraphsHtml(
    d.lesson || "",
    "margin:0 0 8px;font-size:15px;line-height:1.65;color:#333;"
  );
  const preview = String(d.preview || "").trim();
  const lessonLabel = isEn ? "Before you go" : "Antes de terminar";

  let bodyHtml = "";
  if (preview) {
    bodyHtml += `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preview)}</div>\n`;
  }
  bodyHtml += introHtml + "\n";
  bodyHtml += stories.map((s) => storyBlockHtml(s, lang)).join("\n");
  if (lessonHtml) {
    bodyHtml += `<p style="margin:16px 0 8px;font-size:15px;line-height:1.5;color:#1e3a8a;"><strong>${lessonLabel}</strong></p>\n${lessonHtml}\n`;
  }
  const fallback = isEn
    ? "Weekly update — Mejor Vida Insurance"
    : "Actualización semanal — Mejor Vida Insurance";
  return {
    subject: String(d.subject || fallback).trim(),
    preview,
    heroHtml: "",
    bodyHtml,
    heroSource: "weekly_research",
    blogUrl: d.digest_url || d.blog_url || null,
    digest: d,
    lang: isEn ? "en" : "es",
  };
}

module.exports = {
  escapeHtml,
  localizedDigest,
  buildWeeklyResearchEmailParts,
};
