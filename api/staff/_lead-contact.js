/**
 * Resolve a contacts row + staff profile for a unified lead id.
 */
const { restSelect } = require("./_inbox-lib");
const { resolveContactForPipeline } = require("./_contact-resolve");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));
}

function cleanText(v) {
  return String(v == null ? "" : v).trim();
}

async function loadUnifiedLead(cfg, leadId) {
  const rows = await restSelect(
    cfg,
    "unified_leads",
    `select=id,source_table,source,first_name,last_name,display_name,phone,email,language,created_at,updated_at&limit=1&id=eq.${encodeURIComponent(
      leadId
    )}`
  );
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function loadStaffProfile(cfg, leadId, leadSourceTable) {
  if (!leadId || !leadSourceTable) return {};
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

function displayName(row) {
  const a = String((row && row.first_name) || "").trim();
  const b = String((row && row.last_name) || "").trim();
  const full = [a, b].filter(Boolean).join(" ").trim();
  return full || String((row && row.display_name) || "").trim() || "Unknown";
}

/**
 * @returns {Promise<{ unified, profile, contact, contactId, sourceTable, displayName } | { error, status }>}
 */
async function resolveContactForStaffLead(cfg, leadId) {
  if (!isUuid(leadId)) return { error: "Valid lead id required", status: 400 };
  const unified = await loadUnifiedLead(cfg, leadId);
  if (!unified) return { error: "Lead not found", status: 404 };

  const sourceTable = String(unified.source_table || "unknown");
  const profile = await loadStaffProfile(cfg, leadId, sourceTable);
  const storedContactId = cleanText(profile.contacts_contact_id || profile.contact_id);

  let contact = null;
  if (String(sourceTable) === "contacts" && unified.id) {
    contact = await resolveContactForPipeline(cfg, { contactId: unified.id });
  }
  if (!contact) {
    contact = await resolveContactForPipeline(cfg, {
      contactId: storedContactId || undefined,
      phone: cleanText(unified.phone || profile.phone),
      email: cleanText(unified.email || profile.email),
    });
  }

  const contactId = contact && contact.id ? String(contact.id) : storedContactId || null;

  return {
    unified,
    profile,
    contact,
    contactId,
    sourceTable,
    displayName: displayName(unified),
  };
}

module.exports = {
  isUuid,
  cleanText,
  loadUnifiedLead,
  loadStaffProfile,
  resolveContactForStaffLead,
  displayName,
};
