/**
 * GET /api/staff/nurture-review — ordered nurture sequence for staff approval (Spanish).
 * PATCH — approve or request copy changes.
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig } = require("./_inbox-lib");
const { loadSettings, saveSettings } = require("../../lib/crm-nurture-engine");
const { buildNurtureSequenceCatalog } = require("../../lib/crm-nurture-sequence-catalog");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Missing Supabase config" });

  if (req.method === "GET") {
    try {
      const settings = await loadSettings(cfg.supabaseUrl, cfg.serviceKey);
      const catalog = buildNurtureSequenceCatalog(settings, process.env);
      return json(res, 200, catalog);
    } catch (e) {
      console.error("staff/nurture-review GET", e);
      return json(res, 500, { error: "Failed to load nurture review" });
    }
  }

  if (req.method === "PATCH") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const action = String(body.action || "").trim().toLowerCase();
    if (action !== "approve" && action !== "request_changes") {
      return json(res, 400, { error: "action must be approve or request_changes" });
    }
    const notes = String(body.notes || "").trim().slice(0, 5000);
    if (action === "request_changes" && !notes) {
      return json(res, 400, { error: "notes required when requesting changes" });
    }

    try {
      const current = await loadSettings(cfg.supabaseUrl, cfg.serviceKey);
      const review = Object.assign({}, current.review || {}, {
        status: action === "approve" ? "approved" : "changes_requested",
        notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user && auth.user.email ? auth.user.email : null,
      });
      const merged = Object.assign({}, current, { review });
      await saveSettings(
        cfg.supabaseUrl,
        cfg.serviceKey,
        merged,
        auth.user && auth.user.email ? auth.user.email : null
      );
      const catalog = buildNurtureSequenceCatalog(merged, process.env);
      return json(res, 200, catalog);
    } catch (e) {
      console.error("staff/nurture-review PATCH", e);
      return json(res, 500, { error: "Failed to save review" });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return json(res, 405, { error: "Method Not Allowed" });
};
