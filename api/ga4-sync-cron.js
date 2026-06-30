/**
 * Vercel Cron — sync GA4 funnel data to Supabase every 6 hours.
 * vercel.json: { "path": "/api/ga4-sync-cron", "schedule": "0 */6 * * *" }
 *
 * Env: CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      GA4_PROPERTY_ID, GA4_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS)
 */

const { serviceConfig } = require("./staff/_inbox-lib");
const { syncAllFunnels } = require("../lib/ga4-supabase-sync");
const { isConfigured } = require("../lib/ga4-data-api");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!isConfigured()) {
    return res.status(503).json({
      error: "GA4 not configured",
      hint: "Set GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_JSON in Vercel env",
    });
  }

  const cfg = serviceConfig();
  if (!cfg) {
    return res.status(500).json({ error: "Missing Supabase configuration" });
  }

  const periodDays = Number(process.env.GA4_SYNC_PERIOD_DAYS) || 30;

  try {
    const result = await syncAllFunnels(cfg, periodDays);
    return res.status(200).json({
      ok: true,
      periodDays,
      syncedAt: result.syncedAt,
      websiteStages: (result.website.stages || []).length,
      landingStages: (result.landing.stages || []).length,
    });
  } catch (e) {
    console.error("[ga4-sync-cron]", e);
    return res.status(500).json({ error: e.message || "Sync failed" });
  }
};
