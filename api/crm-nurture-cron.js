/**
 * /api/crm-nurture-cron.js
 * Processes due CRM nurture tasks + Retained/Loyal promotions.
 * vercel.json: every 5 minutes
 */
const { processDueTasks, processRetainedLoyalPromotions } = require("../lib/crm-nurture-engine");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const cfg = {
    supabaseUrl: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  try {
    const taskResult = await processDueTasks({ cfg });
    const promoResult = await processRetainedLoyalPromotions(cfg);
    return res.status(200).json({
      ran_at: new Date().toISOString(),
      tasks: taskResult,
      promotions: promoResult,
    });
  } catch (e) {
    console.error("[crm-nurture-cron]", e.message);
    return res.status(500).json({ error: e.message });
  }
};
