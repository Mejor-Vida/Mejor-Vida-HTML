/**
 * Vercel Cron — pause Stage 1/2/3 test ads at the creative-testing impression cap.
 * vercel.json: { "path": "/api/creative-testing-impression-cap-cron", "schedule": "*/15 * * * *" }
 *
 * Env: CRON_SECRET, META_AD_ACCESS_TOKEN, META_AD_ACCOUNT_ID
 */
const { enforceImpressionCaps } = require("../lib/creative-testing");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await enforceImpressionCaps();
    const statusCode = result.configured ? 200 : 503;
    return res.status(statusCode).json(result);
  } catch (e) {
    console.error("[creative-testing-impression-cap-cron]", e);
    return res.status(500).json({ error: e.message || "Cron failed" });
  }
};
