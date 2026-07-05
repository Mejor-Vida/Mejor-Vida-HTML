/**
 * /api/crm-daily-summary-cron.js
 * Sends Julie's 8 AM daily summary email (America/Chicago).
 * vercel.json: 0 13 * * * (8 AM CT ≈ 13:00 UTC during CDT; adjust seasonally if needed)
 */
const { sendDailySummaryEmail } = require("../lib/crm-nurture-engine");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const cfg = {
    supabaseUrl: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  try {
    const result = await sendDailySummaryEmail(cfg);
    return res.status(200).json({ ran_at: new Date().toISOString(), ...result });
  } catch (e) {
    console.error("[crm-daily-summary-cron]", e.message);
    return res.status(500).json({ error: e.message });
  }
};
