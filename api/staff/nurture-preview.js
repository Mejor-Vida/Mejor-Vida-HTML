/**
 * GET /api/staff/nurture-preview — Spanish nurture copy preview (legacy; prefer nurture-review).
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig } = require("./_inbox-lib");
const { loadSettings } = require("../../lib/crm-nurture-engine");
const { buildNurtureSequenceCatalog } = require("../../lib/crm-nurture-sequence-catalog");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const cfg = serviceConfig();
  let settings = {};
  if (cfg) {
    try {
      settings = await loadSettings(cfg.supabaseUrl, cfg.serviceKey);
    } catch (e) {
      settings = {};
    }
  }

  const catalog = buildNurtureSequenceCatalog(settings, process.env);
  return json(res, 200, {
    content_language: catalog.content_language,
    rollout: catalog.rollout,
    steps: catalog.steps,
    note: "Lead nurture emails and SMS are Spanish only. See /staff/nurture-review.html for full review UI.",
  });
};
