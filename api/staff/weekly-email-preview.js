/**
 * GET /api/staff/weekly-email-preview — preview this week's FB post as lead email.
 * POST /api/staff/weekly-email-preview — import package into crm_newsletter_issues (scheduled).
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restInsert } = require("./_inbox-lib");
const {
  loadExampleWeeklyFbPost,
  getWeeklyFbPostEmailPreview,
  buildWeeklyFbPostEmailParts,
  normalizeFbPostImportBody,
} = require("../../lib/crm-weekly-fb-email");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method === "GET") {
    const post = loadExampleWeeklyFbPost();
    const preview = getWeeklyFbPostEmailPreview(post);
    return json(res, 200, {
      post_date_iso: post.post_date_iso || null,
      image_url: post.image_url || null,
      blog_url: post.blog_url || null,
      subject: preview.subject,
      html: preview.html,
      language: preview.language,
      source_package: "FB/post-package-weekly-2026-07-12-medigap.json",
    });
  }

  if (req.method === "POST") {
    const cfg = serviceConfig();
    if (!cfg) return json(res, 500, { error: "Missing Supabase config" });

    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }

    const fromFile = loadExampleWeeklyFbPost();
    const fbPost =
      normalizeFbPostImportBody(body) ||
      normalizeFbPostImportBody(fromFile) ||
      fromFile;

    const parts = buildWeeklyFbPostEmailParts(fbPost);
    if (!parts.heroHtml && !parts.bodyHtml) {
      return json(res, 400, { error: "No email content available from FB package" });
    }

    try {
      const inserted = await restInsert(cfg, "crm_newsletter_issues", [
        {
          hero_html: parts.heroHtml || null,
          hero_source: "facebook",
          blog_url: parts.blogUrl,
          subject: parts.subject,
          body_html: parts.bodyHtml || null,
          status: body.status === "draft" ? "draft" : "scheduled",
          imported_by: auth.user && auth.user.email ? auth.user.email : null,
        },
      ]);
      const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
      return json(res, 200, {
        issue: row,
        subject: parts.subject,
        message:
          "Weekly email imported. Sunday cron will send to leads with email (except unsubscribed) when status is scheduled/draft.",
      });
    } catch (e) {
      console.error("staff/weekly-email-preview import", e);
      return json(res, 500, { error: "Failed to import weekly email" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return json(res, 405, { error: "Method Not Allowed" });
};
