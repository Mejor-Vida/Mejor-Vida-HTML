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
      "unanswered_questions",
      "select=id,lead_id,phone,question,edited_question,language,flow_stage,resolved,created_at,resolved_at,resolved_by,rag_pushed&resolved=eq.false&order=created_at.desc&limit=200"
    );

    const leadIds = Array.from(new Set(rows.map((r) => r && r.lead_id).filter(Boolean)));
    const byLeadId = {};
    if (leadIds.length) {
      const ids = leadIds.map((id) => `"${String(id).replace(/"/g, "")}"`).join(",");
      const leads = await restSelect(
        cfg,
        "manychat_leads",
        `select=id,first_name,phone,email&id=in.(${ids})`
      );
      (leads || []).forEach((l) => {
        byLeadId[l.id] = l;
      });
    }

    const items = (rows || []).map((q) => {
      const lead = q.lead_id ? byLeadId[q.lead_id] || null : null;
      return {
        id: q.id,
        lead_id: q.lead_id || null,
        phone: q.phone || (lead && lead.phone) || "",
        question: q.question || "",
        edited_question: q.edited_question || "",
        language: q.language || "",
        flow_stage: q.flow_stage || "",
        created_at: q.created_at || null,
        resolved: !!q.resolved,
        rag_pushed: !!q.rag_pushed,
        lead: lead
          ? {
              id: lead.id,
              first_name: lead.first_name || "",
              phone: lead.phone || "",
              email: lead.email || "",
            }
          : null,
      };
    });

    return json(res, 200, { items });
  } catch (e) {
    return json(res, 500, { error: "Failed to load questions" });
  }
};
