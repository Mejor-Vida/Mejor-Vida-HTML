const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect, restDelete } = require("./_inbox-lib");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

function isMissingTableDeleteMsg(msg) {
  return /42P01|does not exist|PGRST205|Could not find|schema cache/i.test(String(msg || ""));
}

async function safeRestDelete(cfg, table, query) {
  try {
    await restDelete(cfg, table, query);
  } catch (e) {
    if (isMissingTableDeleteMsg(e && e.message)) return;
    throw e;
  }
}

/** Same satellite cleanup as staff lead delete when source is `contacts`. */
async function deleteStaffSatellitesForContact(cfg, contactId) {
  const encId = encodeURIComponent(contactId);
  const encSt = encodeURIComponent("contacts");
  const pair = `lead_id=eq.${encId}&lead_source_table=eq.${encSt}`;
  await safeRestDelete(cfg, "product_selector_sessions", pair);
  await safeRestDelete(cfg, "lead_underwriting_phi", pair);
  await safeRestDelete(cfg, "staff_lead_profiles", pair);
  const dedupeKey = `contacts:${contactId}`;
  await safeRestDelete(cfg, "staff_hidden_leads", `source_id=eq.${encId}&source_table=eq.${encSt}`);
  await safeRestDelete(cfg, "staff_hidden_leads", `dedupe_key=eq.${encodeURIComponent(dedupeKey)}`);
}

/** Fallback when FK delete rule does not cascade from contacts (legacy DB). */
async function manualPipelineDeletes(cfg, contactId) {
  const q = `contact_id=eq.${encodeURIComponent(contactId)}`;
  await safeRestDelete(cfg, "nurture_delivery_log", q);
  await safeRestDelete(cfg, "nurture_message_overrides", q);
  await safeRestDelete(cfg, "nurture_sequence", q);
  await safeRestDelete(cfg, "lead_state", q);
  await safeRestDelete(cfg, "events", q);
  await safeRestDelete(cfg, "notes", q);
  await safeRestDelete(cfg, "call_transcripts", q);
}

async function deleteContactRow(cfg, contactId) {
  await restDelete(cfg, "contacts", `id=eq.${encodeURIComponent(contactId)}`);
}

module.exports = async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return json(res, 405, { error: "Method not allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server misconfigured" });

  const contactId = req.query && req.query.contactId;
  if (!isUuid(contactId)) {
    return json(res, 400, { error: "contactId query parameter required" });
  }

  try {
    const existing = await restSelect(cfg, "contacts", `id=eq.${encodeURIComponent(contactId)}&limit=1`);
    if (!existing || !existing[0]) {
      return json(res, 404, { error: "Contact not found" });
    }

    await deleteStaffSatellitesForContact(cfg, contactId);

    try {
      await deleteContactRow(cfg, contactId);
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (/23503|foreign key|violates/i.test(msg)) {
        await manualPipelineDeletes(cfg, contactId);
        await deleteContactRow(cfg, contactId);
      } else {
        throw e;
      }
    }

    return json(res, 200, { ok: true, deleted_id: contactId });
  } catch (e) {
    console.error("[staff/nurture-delete]", e);
    const msg = String((e && e.message) || e);
    if (/23503|foreign key|violates/i.test(msg)) {
      return json(res, 409, {
        error:
          "Could not delete contact while other rows still reference it. Check Supabase FKs or remove dependents.",
      });
    }
    return json(res, 500, { error: "Delete failed", detail: msg.length > 400 ? `${msg.slice(0, 400)}…` : msg });
  }
};
