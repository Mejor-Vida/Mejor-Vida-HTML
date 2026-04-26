const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  try {
    const rows = await restSelect(
      cfg,
      "staff_kb_gaps",
      "select=id,question,assistant_answer,source,retrieval_count,max_similarity,resolved,created_at,last_asked_at,resolved_at,resolved_by&resolved=eq.false&order=last_asked_at.desc&limit=200"
    );
    const items = (Array.isArray(rows) ? rows : []).map((r) => ({
      id: r.id,
      question: String(r.question || ""),
      assistant_answer: String(r.assistant_answer || ""),
      source: String(r.source || ""),
      retrieval_count: Number(r.retrieval_count || 0),
      max_similarity: Number.isFinite(Number(r.max_similarity)) ? Number(r.max_similarity) : null,
      resolved: !!r.resolved,
      created_at: r.created_at || null,
      last_asked_at: r.last_asked_at || null,
      resolved_at: r.resolved_at || null,
      resolved_by: r.resolved_by || null,
    }));
    return json(res, 200, { items });
  } catch (e) {
    return json(res, 500, { error: "Failed to load KB gaps" });
  }
};
