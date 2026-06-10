/**
 * GET    /api/staff/todo?owner=julie|justin
 * POST   /api/staff/todo  { owner, body }
 * DELETE /api/staff/todo?id=<uuid>
 */
const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect, restInsert, restDelete } = require("./_inbox-lib");

const VALID_OWNERS = new Set(["julie", "justin"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeOwner(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  return VALID_OWNERS.has(s) ? s : "";
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    const owner = normalizeOwner(req.query && req.query.owner);
    if (!owner) return json(res, 400, { error: "Valid owner required (julie or justin)" });
    try {
      const rows = await restSelect(
        cfg,
        "staff_todo_items",
        `select=id,owner,body,created_at,created_by&owner=eq.${encodeURIComponent(
          owner
        )}&order=created_at.desc&limit=500`
      );
      return json(res, 200, { items: rows || [], owner });
    } catch (e) {
      console.error("staff/todo GET", e);
      return json(res, 500, { error: "Failed to load to-do items" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const owner = normalizeOwner(body.owner);
    const text = String(body.body || body.text || "").trim();
    if (!owner) return json(res, 400, { error: "Valid owner required (julie or justin)" });
    if (!text) return json(res, 400, { error: "To-do text required" });
    if (text.length > 4000) return json(res, 400, { error: "To-do text too long" });
    const createdBy = auth.user && auth.user.email ? auth.user.email : null;
    try {
      const inserted = await restInsert(cfg, "staff_todo_items", [
        { owner, body: text, created_by: createdBy },
      ]);
      const item = Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
      return json(res, 200, { item });
    } catch (e) {
      console.error("staff/todo POST", e);
      return json(res, 500, { error: "Failed to add to-do item" });
    }
  }

  if (req.method === "DELETE") {
    const id = String((req.query && req.query.id) || "").trim();
    if (!UUID_RE.test(id)) return json(res, 400, { error: "Valid id required" });
    try {
      await restDelete(cfg, "staff_todo_items", `id=eq.${encodeURIComponent(id)}`);
      return json(res, 200, { ok: true });
    } catch (e) {
      console.error("staff/todo DELETE", e);
      return json(res, 500, { error: "Failed to delete to-do item" });
    }
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return json(res, 405, { error: "Method Not Allowed" });
};
