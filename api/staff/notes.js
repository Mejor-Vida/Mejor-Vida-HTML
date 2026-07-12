const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { resolveContactForStaffLead } = require("./_lead-contact");
const { insertNote } = require("../../lib/contacts-db");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    const leadId = String((req.query && req.query.leadId) || "").trim();
    const resolved = await resolveContactForStaffLead(cfg, leadId);
    if (resolved.error) return json(res, resolved.status || 400, { error: resolved.error });

    const contactId = resolved.contactId;
    if (!contactId) {
      return json(res, 200, { items: [], contact_id: null, hint: "no_contact" });
    }

    try {
      const rows = await restSelect(
        cfg,
        "notes",
        `select=id,note,note_type,created_by,created_at&contact_id=eq.${encodeURIComponent(
          contactId
        )}&note_type=eq.manual&order=created_at.desc&limit=200`
      );
      return json(res, 200, { items: rows || [], contact_id: contactId });
    } catch (e) {
      console.error("staff/notes GET", e);
      return json(res, 500, { error: "Failed to load notes" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }

    const leadId = String(body.lead_id || body.leadId || "").trim();
    const note = String(body.note || "").trim();
    if (!note) return json(res, 400, { error: "Note text required" });
    if (note.length > 8000) return json(res, 400, { error: "Note too long" });

    const resolved = await resolveContactForStaffLead(cfg, leadId);
    if (resolved.error) return json(res, resolved.status || 400, { error: resolved.error });

    const contactId = resolved.contactId;
    if (!contactId) {
      return json(res, 400, { error: "Link this client to a contact before saving notes." });
    }

    const createdBy = auth.user && auth.user.email ? auth.user.email : "julie";

    try {
      await insertNote(cfg.supabaseUrl, cfg.serviceKey, contactId, {
        note,
        noteType: "manual",
        createdBy,
      });
      try {
        const { logComplianceEvent } = require("../../lib/crm-compliance");
        const src = resolved.sourceTable || resolved.unified?.source_table || "contacts";
        await logComplianceEvent(cfg.supabaseUrl, cfg.serviceKey, {
          leadId,
          leadSourceTable: src,
          eventType: "staff_note",
          title: "Staff note added",
          actor: createdBy,
          detail: { note: note.slice(0, 2000), contact_id: contactId },
        });
      } catch (_) {
        /* non-fatal */
      }
      const rows = await restSelect(
        cfg,
        "notes",
        `select=id,note,note_type,created_by,created_at&contact_id=eq.${encodeURIComponent(
          contactId
        )}&note_type=eq.manual&order=created_at.desc&limit=1`
      );
      const item = Array.isArray(rows) && rows[0] ? rows[0] : null;
      return json(res, 200, { ok: true, item, contact_id: contactId });
    } catch (e) {
      console.error("staff/notes POST", e);
      return json(res, 500, { error: "Failed to save note" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return json(res, 405, { error: "Method not allowed" });
};
