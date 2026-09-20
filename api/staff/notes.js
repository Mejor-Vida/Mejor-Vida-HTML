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

    let contactId = resolved.contactId;
    if (!contactId) {
      try {
        const { linkLeadToContacts } = require("./_contact-link");
        const u = resolved.unified || {};
        const p = resolved.profile || {};
        const link = await linkLeadToContacts(cfg, {
          leadId,
          leadSourceTable: resolved.sourceTable,
          phone: u.phone || p.phone,
          email: u.email || p.email,
          first_name: u.first_name || p.first_name,
          last_name: u.last_name || p.last_name,
          language: u.language || p.language,
          manychat_subscriber_id: p.manychat_subscriber_id,
          pipeline_stage: p.pipeline_stage,
          updatedBy: auth.user && auth.user.email ? auth.user.email : "julie",
        });
        contactId = link.contactId || null;
      } catch (linkErr) {
        console.error("staff/notes POST contact-link", linkErr);
      }
    }
    if (!contactId) {
      try {
        const crypto = require("crypto");
        const { insertContact } = require("../../lib/contacts-db");
        const { saveContactIdsOnStaffProfile } = require("./_contact-link");
        const u = resolved.unified || {};
        const p = resolved.profile || {};
        const h = crypto.createHash("sha256").update(String(leadId)).digest("hex");
        const suffix = String(parseInt(h.slice(0, 8), 16) % 10000000).padStart(7, "0");
        const row = await insertContact(cfg.supabaseUrl, cfg.serviceKey, {
          phone: `+1997${suffix}`,
          first_name: String(u.first_name || p.first_name || "").trim() || null,
          last_name: String(u.last_name || p.last_name || "").trim() || null,
          email: String(u.email || p.email || "").trim() || null,
          source: "staff_crm_notes",
        });
        if (row && row.id) {
          contactId = String(row.id);
          await saveContactIdsOnStaffProfile(
            cfg,
            leadId,
            resolved.sourceTable,
            contactId,
            auth.user && auth.user.email ? auth.user.email : "julie",
            { pipeline_stage: p.pipeline_stage }
          );
        }
      } catch (createErr) {
        console.error("staff/notes POST create contact", createErr);
      }
    }
    if (!contactId) {
      return json(res, 400, { error: "Could not save notes for this client. Add a phone or email on Overview, then try again." });
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
