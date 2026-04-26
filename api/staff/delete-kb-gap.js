const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig } = require("./_inbox-lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const id = String(body.id || "").trim();
  if (!id) return json(res, 400, { error: "id required" });

  try {
    const r = await fetch(
      `${cfg.supabaseUrl}/rest/v1/staff_kb_gaps?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          apikey: cfg.serviceKey,
          Authorization: `Bearer ${cfg.serviceKey}`,
          Prefer: "return=minimal",
        },
      }
    );
    if (!r.ok) {
      const t = await r.text();
      return json(res, 500, { error: `Failed to delete KB gap: ${String(t || "").slice(0, 200)}` });
    }
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: "Failed to delete KB gap" });
  }
};
