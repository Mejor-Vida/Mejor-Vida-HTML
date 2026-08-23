/**
 * GET  /api/staff/weekly-emails — list weekly newsletter issues + this week's digest + recipient count
 * POST /api/staff/weekly-emails — send issue to all active clients { action: "send"|"dry_run", issue_id? }
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig } = require("./_inbox-lib");
const { loadSettings } = require("../../lib/crm-nurture-engine");
const {
  listNewsletterIssues,
  getIssueSendStats,
  listWeeklyEmailRecipients,
  ensureBlogDigestIssue,
  sendWeeklyNewsletterIssue,
  emailProviderReady,
  getCurrentWeeklyBlogDigest,
  buildWeeklyBlogDigestEmailParts,
  sbFetch,
} = require("../../lib/crm-newsletter-send");
const {
  getWeeklyBlogDigestEmailPreview,
} = require("../../lib/crm-weekly-blog-digest-email");
const {
  wrapNewsletterHtml,
  sampleSpanishContact,
  leadEmailCtaRow,
} = require("../../lib/crm-nurture-templates");
const { newsletterWindow } = require("../../lib/weekly-newsletter-window");
const { importedByTag } = require("../../lib/weekly-newsletter-run");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Missing Supabase config" });
  const supabaseUrl = cfg.supabaseUrl;
  const serviceKey = cfg.serviceKey;

  if (req.method === "GET") {
    try {
      const settings = await loadSettings(supabaseUrl, serviceKey);
      const digest = getCurrentWeeklyBlogDigest();
      let parts = buildWeeklyBlogDigestEmailParts(digest);
      let preview = getWeeklyBlogDigestEmailPreview(digest);
      let currentStatus = "ready";
      let researchIssue = null;
      try {
        const weekKey = newsletterWindow().weekKey;
        const rows = await sbFetch(
          supabaseUrl,
          serviceKey,
          `/crm_newsletter_issues?imported_by=eq.${encodeURIComponent(
            importedByTag(weekKey)
          )}&order=created_at.desc&limit=1&select=*`
        );
        researchIssue = rows && rows[0] ? rows[0] : null;
      } catch (_) {
        researchIssue = null;
      }
      if (researchIssue && researchIssue.body_html) {
        parts = {
          subject: researchIssue.subject,
          heroHtml: researchIssue.hero_html || "",
          bodyHtml: researchIssue.body_html,
          heroSource: researchIssue.hero_source || "weekly_research",
          blogUrl: researchIssue.blog_url,
        };
        currentStatus = researchIssue.scheduled_send_at ? "staff_sent" : researchIssue.status || "scheduled";
        const sample = sampleSpanishContact();
        preview = {
          html: wrapNewsletterHtml(
            parts.heroHtml || "",
            `<p>Hola equipo,</p>${parts.bodyHtml || ""}${leadEmailCtaRow(false)}`,
            sample,
            settings
          ),
          subject: parts.subject,
        };
      }
      const { counts, recipients } = await listWeeklyEmailRecipients(supabaseUrl, serviceKey, settings);
      const issues = await listNewsletterIssues(supabaseUrl, serviceKey, 25);

      const issuesWithStats = [];
      for (const issue of issues || []) {
        let stats = null;
        try {
          stats = await getIssueSendStats(supabaseUrl, serviceKey, issue.id);
        } catch (_) {
          stats = null;
        }
        issuesWithStats.push({ ...issue, send_stats: stats });
      }

      const recipientsPreview = (recipients || []).map((r) => ({
        display_name:
          r.display_name ||
          [r.first_name, r.last_name].filter(Boolean).join(" ").trim() ||
          r.email,
        email: r.email,
        pipeline_stage: r.pipeline_stage || "",
      }));

      return json(res, 200, {
        current: {
          post_date_iso: researchIssue ? newsletterWindow().weekKey : digest.post_date_iso,
          subject: parts.subject,
          blog_url: parts.blogUrl,
          hero_source: parts.heroSource || (researchIssue ? "weekly_research" : "blog_digest"),
          stories: digest.stories || [],
          preview_html: preview.html,
          status: currentStatus,
          issue_id: researchIssue ? researchIssue.id : null,
        },
        recipient_counts: counts,
        recipients_preview: recipientsPreview,
        email_provider_ready: emailProviderReady(),
        issues: issuesWithStats,
        rollout: {
          mode: settings.rollout_mode || "testing",
        },
      });
    } catch (e) {
      console.error("staff/weekly-emails GET", e);
      return json(res, 500, { error: e.message || "Failed to load weekly emails" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }

    const action = String(body.action || "send").trim().toLowerCase();
    const dryRun = action === "dry_run" || body.dry_run === true;
    const importedBy = auth.user && auth.user.email ? auth.user.email : null;

    try {
      let issue = null;
      if (body.issue_id) {
        const rows = await sbFetch(
          supabaseUrl,
          serviceKey,
          `/crm_newsletter_issues?id=eq.${encodeURIComponent(body.issue_id)}&select=*&limit=1`
        );
        issue = rows && rows[0];
        if (!issue) return json(res, 404, { error: "Issue not found" });
        if (issue.status === "sent" && !dryRun) {
          let stats = null;
          try {
            stats = await getIssueSendStats(supabaseUrl, serviceKey, issue.id);
          } catch (_) {
            stats = null;
          }
          if (!stats || stats.sent > 0) {
            return json(res, 400, {
              error: "This issue was already sent. Create a new weekly issue to send again.",
            });
          }
        }
      } else {
        const weekKey = newsletterWindow().weekKey;
        const rows = await sbFetch(
          supabaseUrl,
          serviceKey,
          `/crm_newsletter_issues?imported_by=eq.${encodeURIComponent(
            importedByTag(weekKey)
          )}&order=created_at.desc&limit=1&select=*`
        );
        issue = rows && rows[0] ? rows[0] : null;
        if (!issue) {
          issue = await ensureBlogDigestIssue(supabaseUrl, serviceKey, importedBy);
        }
      }

      const result = await sendWeeklyNewsletterIssue(supabaseUrl, serviceKey, issue, {
        dryRun,
        importedBy,
      });
      return json(res, 200, { ok: true, issue, result });
    } catch (e) {
      console.error("staff/weekly-emails POST", e);
      return json(res, 500, { error: e.message || "Send failed" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return json(res, 405, { error: "Method Not Allowed" });
};
