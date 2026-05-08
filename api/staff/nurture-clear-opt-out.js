const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restPatch } = require("./_inbox-lib");
const { fetchNurtureRow } = require("./_nurture-lib");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") {
    return json(res, 405, { error: "Method not allowed" });
  }
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server misconfigured" });

  const contactId = req.query.contactId;
  if (!isUuid(contactId)) return json(res, 400, { error: "contactId query parameter required" });

  try {
    const row = await fetchNurtureRow(cfg, contactId);
    if (!row) return json(res, 404, { error: "Nurture row not found" });

    const now = new Date().toISOString();
    await restPatch(cfg, "nurture_sequence", `id=eq.${encodeURIComponent(row.id)}`, {
      status: "opted_out",
      stopped_reason: "opted_out",
      twilio_opt_out: true,
      email_opt_out: true,
      next_send_at: null,
      updated_at: now,
    });
    return json(res, 200, { ok: true });
  } catch (e) {
    console.error("[staff/nurture-clear-opt-out]", e);
    return json(res, 500, { error: String((e && e.message) || e) });
  }
};
