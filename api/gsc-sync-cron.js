/**
 * Vercel Cron — sync Google Search Console organic search to Supabase every 6 hours.
 * vercel.json: { "path": "/api/gsc-sync-cron", "schedule": "15 */6 * * *" }
 *
 * Env: CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      GSC_REFRESH_TOKEN, GSC_SITE_URL,
 *      GA4_OAUTH_CLIENT_ID/SECRET (or GMAIL_CLIENT_ID/SECRET)
 */

const { serviceConfig } = require("./staff/_inbox-lib");
const { syncGscSearchCache } = require("../lib/gsc-supabase-sync");
const { hasGscOAuthCredentials, gscSetupHint } = require("../lib/gsc-data-api");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!hasGscOAuthCredentials()) {
    return res.status(503).json({
      error: "GSC not configured",
      hint: gscSetupHint(),
    });
  }

  const cfg = serviceConfig();
  if (!cfg) {
    return res.status(500).json({ error: "Missing Supabase configuration" });
  }

  const periodDays = Number(process.env.GSC_SYNC_PERIOD_DAYS) || 28;

  try {
    const result = await syncGscSearchCache(cfg, periodDays);
    return res.status(200).json({
      ok: true,
      periodDays: result.periodDays,
      syncedAt: result.syncedAt,
      current: result.current,
      previous: result.previous,
    });
  } catch (e) {
    console.error("[gsc-sync-cron]", e);
    return res.status(500).json({ error: e.message || "Sync failed" });
  }
};
