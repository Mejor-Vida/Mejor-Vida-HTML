/**
 * Vercel Cron — weekly Meta ad token health check.
 * vercel.json: { "path": "/api/meta-ad-token-health-cron", "schedule": "0 9 * * 1" }
 *
 * Env: CRON_SECRET, META_AD_ACCESS_TOKEN
 */
const { getMetaAdTokenHealth } = require("../lib/meta-system-user-token");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = String(process.env.META_AD_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || "").trim();
  if (!token) {
    return res.status(503).json({
      ok: false,
      status: "not_configured",
      hint: "Set META_AD_ACCESS_TOKEN. One-time setup: open /api/staff/meta-ads-auth",
    });
  }

  const health = await getMetaAdTokenHealth(token);
  const statusCode = health.ok ? 200 : 503;
  if (!health.ok) {
    console.error("[meta-ad-token-health-cron]", health);
  }
  return res.status(statusCode).json(health);
};
