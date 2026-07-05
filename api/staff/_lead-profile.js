/**
 * Shared staff_lead_profiles helpers for CRM lead records.
 */

const { restSelect, restPatch, restInsert } = require("./_inbox-lib");
const { normalizeCrmStage, logStageTransition } = require("../../lib/crm-stage-transitions");

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
  const oldStage = normalizeCrmStage(existingProfile.pipeline_stage);
  const nextProfile = Object.assign({}, existingProfile, patch || {});
  const stageTouched =
    patch &&
    typeof patch === "object" &&
    Object.prototype.hasOwnProperty.call(patch, "pipeline_stage");
  const newStage = normalizeCrmStage(nextProfile.pipeline_stage);
  if (stageTouched && newStage === "client" && oldStage !== "client" && !nextProfile.client_at) {
    nextProfile.client_at = now;
  }
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
    const saved = Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
    if (stageTouched && newStage !== oldStage) {
      try {
        await logStageTransition(cfg, {
          leadId,
          leadSourceTable,
          fromStage: oldStage,
          toStage: newStage,
          changedAt: now,
          changedBy: updatedBy || null,
        });
      } catch (e) {
        console.error("[saveCanonicalLeadProfile] stage transition log", e.message || e);
      }
    } else if (stageTouched && newStage === "client" && oldStage === "client") {
      try {
        const { syncMissingClientTransitions } = require("../../lib/crm-stage-transitions");
        await syncMissingClientTransitions(cfg);
      } catch (e) {
        console.error("[saveCanonicalLeadProfile] client transition sync", e.message || e);
      }
    }
    return saved;
  }
  const patched = await restPatch(cfg, "staff_lead_profiles", `id=eq.${encodeURIComponent(row.id)}`, {
    profile_data: nextProfile,
    updated_at: now,
    updated_by: updatedBy || null,
  });
  const saved = Array.isArray(patched) && patched[0] ? patched[0] : null;
  if (stageTouched && newStage !== oldStage) {
    try {
      await logStageTransition(cfg, {
        leadId,
        leadSourceTable,
        fromStage: oldStage,
        toStage: newStage,
        changedAt: now,
        changedBy: updatedBy || null,
      });
    } catch (e) {
      console.error("[saveCanonicalLeadProfile] stage transition log", e.message || e);
    }
  } else if (stageTouched && newStage === "client" && oldStage === "client") {
    try {
      const { syncMissingClientTransitions } = require("../../lib/crm-stage-transitions");
      await syncMissingClientTransitions(cfg);
    } catch (e) {
      console.error("[saveCanonicalLeadProfile] client transition sync", e.message || e);
    }
  }
  return saved;
}

module.exports = {
  saveCanonicalLeadProfile,
};
