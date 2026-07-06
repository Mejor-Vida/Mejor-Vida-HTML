/**
 * POST /api/staff/newsletter-import — import weekly Facebook post for Sunday lead email.
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restInsert } = require("./_inbox-lib");
const {
  buildWeeklyFbPostEmailParts,
  normalizeFbPostImportBody,
} = require("../../lib/crm-weekly-fb-email");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Missing Supabase config" });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  let heroHtml = String(body.hero_html || body.heroHtml || "").trim();
  let bodyHtml = String(body.body_html || body.bodyHtml || "").trim();
  let subject = String(body.subject || "").trim();
  let heroSource = String(body.hero_source || body.heroSource || "import").trim();
  let blogUrl = String(body.blog_url || body.blogUrl || "").trim() || null;

  const fbPost = normalizeFbPostImportBody(body);
  if (fbPost) {
    const parts = buildWeeklyFbPostEmailParts(fbPost);
    heroHtml = parts.heroHtml;
    bodyHtml = parts.bodyHtml;
    subject = parts.subject;
    heroSource = "facebook";
    blogUrl = parts.blogUrl;
  }

  if (!heroHtml && !bodyHtml) {
    return json(res, 400, { error: "hero_html, body_html, or main_caption (FB post) required" });
  }

  if (!subject) {
    subject = "Mejor Vida Insurance — Actualización semanal";
  }

  try {
    const inserted = await restInsert(cfg, "crm_newsletter_issues", [
      {
        hero_html: heroHtml || null,
        hero_source: heroSource,
        blog_url: blogUrl,
        subject,
        body_html: bodyHtml || null,
        status: "scheduled",
        imported_by: auth.user && auth.user.email ? auth.user.email : null,
      },
    ]);
    const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
    return json(res, 200, { issue: row });
  } catch (e) {
    console.error("staff/newsletter-import", e);
    return json(res, 500, { error: "Failed to import newsletter" });
  }
};
