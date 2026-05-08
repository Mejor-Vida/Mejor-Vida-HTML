const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect, restPatch, restInsert, readJsonBody } = require("./_inbox-lib");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server misconfigured" });

  const contactId = req.query.contactId;
  const phase = Number(req.query.phase);
  const step = Number(req.query.step);

  if (!isUuid(contactId)) return json(res, 400, { error: "contactId required" });
  if (phase !== 3 || Number.isNaN(step) || step < 1 || step > 4) {
    return json(res, 400, { error: "Only phase=3 and step 1–4 are supported" });
  }

  if (req.method === "GET") {
    try {
      const rows = await restSelect(
        cfg,
        "nurture_message_overrides",
        `contact_id=eq.${encodeURIComponent(contactId)}&phase=eq.${phase}&step=eq.${step}&limit=1`
      );
      const row = rows && rows[0] ? rows[0] : null;
      return json(res, 200, { override: row });
    } catch (e) {
      console.error("[staff/nurture-override GET]", e);
      return json(res, 500, { error: String((e && e.message) || e) });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const subject = body && String(body.subject || "").trim();
    const rawBody = body && body.body != null ? String(body.body) : "";
    if (!subject || !rawBody) {
      return json(res, 400, { error: "subject and body required" });
    }

    const updatedBy = (auth.user && auth.user.email) || "";
    const now = new Date().toISOString();

    try {
      const existing = await restSelect(
        cfg,
        "nurture_message_overrides",
        `contact_id=eq.${encodeURIComponent(contactId)}&phase=eq.${phase}&step=eq.${step}&limit=1`
      );

      if (existing && existing[0]) {
        await restPatch(
          cfg,
          "nurture_message_overrides",
          `contact_id=eq.${encodeURIComponent(contactId)}&phase=eq.${phase}&step=eq.${step}`,
          {
            subject,
            body: rawBody,
            updated_at: now,
            updated_by: updatedBy || null,
          }
        );
      } else {
        await restInsert(cfg, "nurture_message_overrides", {
          contact_id: contactId,
          phase,
          step,
          subject,
          body: rawBody,
          updated_at: now,
          updated_by: updatedBy || null,
        });
      }

      const rows = await restSelect(
        cfg,
        "nurture_message_overrides",
        `contact_id=eq.${encodeURIComponent(contactId)}&phase=eq.${phase}&step=eq.${step}&limit=1`
      );
      return json(res, 200, { ok: true, override: rows && rows[0] ? rows[0] : null });
    } catch (e) {
      console.error("[staff/nurture-override POST]", e);
      return json(res, 500, { error: String((e && e.message) || e) });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
};
