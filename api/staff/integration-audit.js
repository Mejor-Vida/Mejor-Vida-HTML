const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  const limitRaw = parseInt(String((req.query && req.query.limit) || "80"), 10);
  const limit = Math.min(200, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 80));
  const phoneLast4 = String((req.query && req.query.phone_last4) || "")
    .replace(/\D/g, "")
    .slice(-4);

  const out = {
    generated_at: new Date().toISOString(),
    events: [],
    snapshots: {
      manychat_leads_recent: [],
      unified_leads_sample: [],
      audit_table_missing: false,
    },
    errors: [],
  };

  try {
    let evQuery = `select=id,created_at,stage,endpoint,outcome,phone_last4,message,detail,manychat_lead_id,contact_id&order=created_at.desc&limit=${limit}`;
    if (phoneLast4.length === 4) {
      evQuery += `&phone_last4=eq.${encodeURIComponent(phoneLast4)}`;
    }
    out.events = await restSelect(cfg, "integration_audit_events", evQuery);
  } catch (e) {
    out.events = [];
    out.snapshots.audit_table_missing = true;
    out.errors.push({ step: "integration_audit_events", message: (e && e.message) || String(e) });
  }

  try {
    out.snapshots.manychat_leads_recent = await restSelect(
      cfg,
      "manychat_leads",
      "select=id,phone,email,first_name,last_name,pipeline_stage,source,created_at&order=created_at.desc&limit=15"
    );
  } catch (e) {
    out.errors.push({ step: "manychat_leads_recent", message: (e && e.message) || String(e) });
  }

  try {
    out.snapshots.unified_leads_sample = await restSelect(
      cfg,
      "unified_leads",
      "select=id,source_table,display_name,email,phone,created_at&order=created_at.desc&limit=15"
    );
  } catch (e) {
    out.errors.push({ step: "unified_leads_sample", message: (e && e.message) || String(e) });
  }

  return json(res, 200, out);
};
