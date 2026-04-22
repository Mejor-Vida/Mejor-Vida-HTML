const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restPatch } = require("./_inbox-lib");

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
    const updatedRows = await restPatch(
      cfg,
      "unanswered_questions",
      `id=eq.${encodeURIComponent(id)}&select=id,resolved,resolved_at,resolved_by`,
      {
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: auth.user && auth.user.email ? auth.user.email : null,
      }
    );
    if (!updatedRows || !updatedRows.length) return json(res, 404, { error: "Question not found" });
    return json(res, 200, { ok: true, item: updatedRows[0] });
  } catch (e) {
    return json(res, 500, { error: "Failed to resolve question" });
  }
};
