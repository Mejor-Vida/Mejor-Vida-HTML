const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect, restInsert } = require("./_inbox-lib");
const { resolveContactForPipeline, CONTACT_SELECT } = require("./_contact-resolve");
const { fetchNurtureRow } = require("./_nurture-lib");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

async function loadContactById(cfg, contactId) {
  const rows = await restSelect(
    cfg,
    "contacts",
    `select=${CONTACT_SELECT}&id=eq.${encodeURIComponent(contactId)}&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
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
  let contactId = String(q.contactId || "").trim();

  try {
    if (!isUuid(contactId)) {
      const contact = await resolveContactForPipeline(cfg, {
        contactId: q.contactId,
        phone: q.phone,
        email: q.email,
        manychatSubscriberId: q.subscriberId || q.manychatSubscriberId,
      });
      if (!contact || !contact.id) {
        return json(res, 404, {
          error: "Contact not found — add phone or email on Overview, or match a contacts record.",
        });
      }
      contactId = contact.id;
    }

    const existing = await fetchNurtureRow(cfg, contactId);
    if (existing) {
      return json(res, 409, {
        error: "Already enrolled in nurture",
        contact_id: contactId,
        nurture_status: existing.status,
      });
    }

    const contact = await loadContactById(cfg, contactId);
    const now = new Date().toISOString();

    const inserted = await restInsert(cfg, "nurture_sequence", {
      contact_id: contactId,
      manychat_subscriber_id: (contact && contact.manychat_subscriber_id) || null,
      status: "active",
      phase: 1,
      step: 1,
      enrolled_at: now,
      next_send_at: now,
    });

    const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
    return json(res, 200, {
      ok: true,
      contact_id: contactId,
      nurture_sequence_id: row && row.id ? row.id : null,
    });
  } catch (e) {
    console.error("[staff/nurture-enroll]", e);
    return json(res, 500, { error: String((e && e.message) || e) });
  }
};
