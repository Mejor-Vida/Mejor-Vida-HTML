/**
 * GET/PATCH /api/staff/nurture-settings — CRM nurture engine configuration.
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig } = require("./_inbox-lib");
const { loadSettings, saveSettings, rolloutSummary } = require("../../lib/crm-nurture-engine");
const { DEFAULT_CRM_NURTURE_SETTINGS } = require("../../lib/crm-nurture-defaults");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Missing Supabase config" });

  if (req.method === "GET") {
    try {
      const config = await loadSettings(cfg.supabaseUrl, cfg.serviceKey);
      return json(res, 200, {
        config,
        defaults: DEFAULT_CRM_NURTURE_SETTINGS,
        rollout: rolloutSummary(config, process.env),
      });
    } catch (e) {
      console.error("staff/nurture-settings GET", e);
      return json(res, 500, { error: "Failed to load settings" });
    }
  }

  if (req.method === "PATCH") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const patch = body.config && typeof body.config === "object" ? body.config : body;
    try {
      const current = await loadSettings(cfg.supabaseUrl, cfg.serviceKey);
      const merged = Object.assign({}, current, patch);
      const saved = await saveSettings(
        cfg.supabaseUrl,
        cfg.serviceKey,
        merged,
        auth.user && auth.user.email ? auth.user.email : null
      );
      return json(res, 200, { config: saved });
    } catch (e) {
      console.error("staff/nurture-settings PATCH", e);
      return json(res, 500, { error: "Failed to save settings" });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return json(res, 405, { error: "Method Not Allowed" });
};
