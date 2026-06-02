const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { linkLeadToContacts } = require("./_contact-link");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));
}

async function loadCanonicalProfile(cfg, leadId, leadSourceTable) {
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=profile_data&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  return row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
}

async function loadUnifiedLead(cfg, leadId) {
  const rows = await restSelect(cfg, "unified_leads", `select=*&id=eq.${encodeURIComponent(leadId)}&limit=1`);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

function pickField(canonical, unified, key) {
  const c = canonical && canonical[key];
  if (c != null && String(c).trim() !== "") return c;
  return unified && unified[key] != null ? unified[key] : "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server misconfigured" });

  const q = req.query || {};
  const leadId = String(q.leadId || q.id || "").trim();
  if (!isUuid(leadId)) {
    return json(res, 400, { error: "Valid leadId required (query: leadId)" });
  }

  try {
    const unified = await loadUnifiedLead(cfg, leadId);
    if (!unified) return json(res, 404, { error: "Lead not found" });
    const src = String(unified.source_table || "manychat_leads");
    const canonical = await loadCanonicalProfile(cfg, leadId, src);

    const result = await linkLeadToContacts(cfg, {
      leadId,
      leadSourceTable: src,
      phone: pickField(canonical, unified, "phone"),
      email: pickField(canonical, unified, "email"),
      first_name: pickField(canonical, unified, "first_name"),
      last_name: pickField(canonical, unified, "last_name"),
      language: pickField(canonical, unified, "language"),
      manychat_subscriber_id: pickField(canonical, unified, "manychat_subscriber_id"),
      pipeline_stage: pickField(canonical, unified, "pipeline_stage"),
      profile_ext: canonical.profile_ext && typeof canonical.profile_ext === "object" ? canonical.profile_ext : {},
      source: unified.source || "staff_compose",
      updatedBy: auth.user && auth.user.email ? auth.user.email : null,
    });

    if (!result.linked || !result.contactId) {
      return json(res, 422, {
        error: "Could not link contact — add email or phone on Overview first.",
        reason: result.reason || "unknown",
      });
    }

    return json(res, 200, {
      ok: true,
      contact_id: result.contactId,
      created: !!result.created,
    });
  } catch (e) {
    console.error("[staff/contact-link]", e);
    return json(res, 500, { error: String((e && e.message) || e) });
  }
};
