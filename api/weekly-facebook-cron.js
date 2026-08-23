/**
 * /api/weekly-facebook-cron.js
 * Polls the live weekly digest. After Julie’s blog (with images) is on the site:
 *   slot 1 — Sunday as soon as it is live
 *   slot 2 — Tuesday 10:00 a.m. Chicago
 *   slot 3 — Thursday 10:00 a.m. Chicago
 * First comment is posted ~10 minutes after each main post.
 */
const { runWeeklyFacebook } = require("../lib/weekly-facebook-run");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Missing Supabase env" });
  }

  const dryRun = req.query && (req.query.dry === "1" || req.query.dry === "true");

  try {
    const result = await runWeeklyFacebook({
      supabaseUrl,
      serviceKey,
      dryRun,
    });
    return res.status(200).json(result);
  } catch (e) {
    console.error("[weekly-facebook-cron]", e.message);
    return res.status(500).json({ error: e.message });
  }
};
