/**
 * /api/crm-newsletter-cron.js
 * Sends scheduled weekly newsletter to all eligible leads (except unsubscribed).
 */
const {
  sbFetch,
  sendWeeklyNewsletterIssue,
} = require("../lib/crm-newsletter-send");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Missing Supabase env" });
  }

  try {
    const issues = await sbFetch(
      supabaseUrl,
      serviceKey,
      "/crm_newsletter_issues?status=in.(draft,scheduled)&order=created_at.desc&limit=1&select=*"
    );
    const issue = issues && issues[0];
    if (!issue) {
      return res.status(200).json({ ran_at: new Date().toISOString(), sent: 0, reason: "no_issue" });
    }

    const result = await sendWeeklyNewsletterIssue(supabaseUrl, serviceKey, issue, {});
    return res.status(200).json({ ran_at: new Date().toISOString(), ...result });
  } catch (e) {
    console.error("[crm-newsletter-cron]", e.message);
    return res.status(500).json({ error: e.message });
  }
};
