/**
 * /api/crm-newsletter-cron.js
 * Sunday 6:00 a.m. Chicago: research last week's news, compose the letter, email julie@ and admin@.
 */
const { runWeeklyNewsletter } = require("../lib/weekly-newsletter-run");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Missing Supabase env" });
  }

  const force = req.query && (req.query.force === "1" || req.query.force === "true");

  try {
    const result = await runWeeklyNewsletter({
      supabaseUrl,
      serviceKey,
      fromCron: !force,
      force,
    });
    return res.status(200).json({ ran_at: new Date().toISOString(), ...result });
  } catch (e) {
    console.error("[crm-newsletter-cron]", e.message);
    return res.status(500).json({ error: e.message });
  }
};
