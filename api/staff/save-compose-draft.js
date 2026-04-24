const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restInsert, restPatch } = require("./_inbox-lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  const createdBy = auth.user && auth.user.email ? String(auth.user.email) : "";
  if (!createdBy) return json(res, 400, { error: "User email missing" });

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const recipient_name = String(body.recipient_name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const language = String(body.language || "English").trim().slice(0, 50) || "English";
  const customer_issue = String(body.customer_issue || "").trim();
  const staff_notes = String(body.staff_notes || "").trim();
  const lead_id = body.lead_id != null && String(body.lead_id).trim() ? String(body.lead_id).trim() : null;
  const id = body.id != null && String(body.id).trim() ? String(body.id).trim() : null;

  const now = new Date().toISOString();
  const payload = {
    recipient_name: recipient_name || null,
    email: email || null,
    phone: phone || null,
    language,
    customer_issue: customer_issue || null,
    staff_notes: staff_notes || null,
    lead_id,
    updated_at: now,
  };

  try {
    if (id) {
      const enc = encodeURIComponent(createdBy);
      const rows = await restPatch(
        cfg,
        "compose_drafts",
        `id=eq.${encodeURIComponent(id)}&created_by=eq.${enc}&select=id,updated_at`,
        payload
      );
      if (!rows || !rows.length) return json(res, 404, { error: "Draft not found or not yours" });
      return json(res, 200, { ok: true, id: rows[0].id, updated: true });
    }

    const inserted = await restInsert(cfg, "compose_drafts", [
      {
        created_by: createdBy,
        lead_id,
        recipient_name: recipient_name || null,
        email: email || null,
        phone: phone || null,
        language,
        customer_issue: customer_issue || null,
        staff_notes: staff_notes || null,
      },
    ]);
    const row = inserted && inserted[0];
    if (!row || !row.id) return json(res, 500, { error: "Failed to save draft" });
    return json(res, 200, { ok: true, id: row.id, updated: false });
  } catch (e) {
    console.error("save-compose-draft", e);
    return json(res, 500, { error: "Failed to save draft" });
  }
};
