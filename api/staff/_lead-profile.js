/**
 * Shared staff_lead_profiles helpers for CRM lead records.
 */

const { restSelect, restPatch, restInsert } = require("./_inbox-lib");

async function saveCanonicalLeadProfile(cfg, leadId, leadSourceTable, patch, updatedBy) {
  if (!leadId || !leadSourceTable) return null;
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=id,profile_data&lead_id=eq.${encodeURIComponent(
      leadId
    )}&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  const now = new Date().toISOString();
  const existingProfile =
    row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
  const nextProfile = Object.assign({}, existingProfile, patch || {});
  if (!row) {
    const inserted = await restInsert(cfg, "staff_lead_profiles", [
      {
        lead_id: leadId,
        lead_source_table: leadSourceTable,
        profile_data: nextProfile,
        updated_at: now,
        updated_by: updatedBy || null,
      },
    ]);
    return Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
  }
  const patched = await restPatch(cfg, "staff_lead_profiles", `id=eq.${encodeURIComponent(row.id)}`, {
    profile_data: nextProfile,
    updated_at: now,
    updated_by: updatedBy || null,
  });
  return Array.isArray(patched) && patched[0] ? patched[0] : null;
}

module.exports = {
  saveCanonicalLeadProfile,
};
