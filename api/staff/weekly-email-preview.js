/**
 * GET  /api/staff/weekly-email-preview — preview weekly client email (blog digest by default).
 * POST /api/staff/weekly-email-preview — import into crm_newsletter_issues (scheduled).
 *
 * Query: ?source=blog (default) | ?source=facebook
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restInsert } = require("./_inbox-lib");
const {
  loadExampleWeeklyFbPost,
  getWeeklyFbPostEmailPreview,
  buildWeeklyFbPostEmailParts,
  normalizeFbPostImportBody,
} = require("../../lib/crm-weekly-fb-email");
const {
  getCurrentWeeklyBlogDigest,
  getWeeklyBlogDigestEmailPreview,
  buildWeeklyBlogDigestEmailParts,
} = require("../../lib/crm-weekly-blog-digest-email");
const { assertNewsletterPartsOk } = require("../../lib/crm-weekly-topic-guard");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const q = req.query || {};
  const source = String(q.source || "blog").trim().toLowerCase();

  if (req.method === "GET") {
    if (source === "facebook" || source === "fb") {
      const post = loadExampleWeeklyFbPost();
      const parts = buildWeeklyFbPostEmailParts(post);
      const topicCheck = assertNewsletterPartsOk(parts);
      if (!topicCheck.ok) {
        return json(res, 400, { error: topicCheck.error });
      }
      const preview = getWeeklyFbPostEmailPreview(post);
      return json(res, 200, {
        source: "facebook",
        post_date_iso: post.post_date_iso || null,
        image_url: post.image_url || null,
        blog_url: post.blog_url || null,
        subject: preview.subject,
        html: preview.html,
        language: preview.language,
        source_package: "FB/post-package-weekly-2026-08-02-life.json",
      });
    }

    const digest = getCurrentWeeklyBlogDigest();
    const digestParts = buildWeeklyBlogDigestEmailParts(digest);
    const digestCheck = assertNewsletterPartsOk({
      subject: digestParts.subject,
      bodyHtml: digestParts.bodyHtml,
      heroHtml: digestParts.heroHtml,
      email_caption: (digest.stories || []).map((s) => `${s.title} ${s.summary}`).join("\n"),
    });
    if (!digestCheck.ok) {
      return json(res, 400, { error: digestCheck.error });
    }
    const preview = getWeeklyBlogDigestEmailPreview(digest);
    return json(res, 200, {
      source: "blog",
      post_date_iso: digest.post_date_iso || null,
      blog_url: digest.digest_url || null,
      subject: preview.subject,
      html: preview.html,
      language: preview.language,
      stories: digest.stories || [],
      source_package: "blog/weekly-insurance-update-2026-08-02.html (life / FE digest)",
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

    const postSource = String(body.source || source || "blog").trim().toLowerCase();
    let parts;
    let heroSource;

    if (postSource === "facebook" || postSource === "fb") {
      const fromFile = loadExampleWeeklyFbPost();
      const fbPost =
        normalizeFbPostImportBody(body) ||
        normalizeFbPostImportBody(fromFile) ||
        fromFile;
      parts = buildWeeklyFbPostEmailParts(fbPost);
      heroSource = "facebook";
    } else {
      parts = buildWeeklyBlogDigestEmailParts(getCurrentWeeklyBlogDigest());
      heroSource = "blog_digest";
    }

    if (!parts.heroHtml && !parts.bodyHtml) {
      return json(res, 400, { error: "No email content available" });
    }

    const topicCheck = assertNewsletterPartsOk(parts);
    if (!topicCheck.ok) {
      return json(res, 400, { error: topicCheck.error });
    }

    try {
      const inserted = await restInsert(cfg, "crm_newsletter_issues", [
        {
          hero_html: parts.heroHtml || null,
          hero_source: heroSource,
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
        source: heroSource,
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
