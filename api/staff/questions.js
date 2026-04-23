const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");

const UNRESOLVED_TEMPLATE = /^\{\{[\s\S]*\}\}$/;

function cleanText(v) {
  const s = String(v || "").trim();
  if (!s || UNRESOLVED_TEMPLATE.test(s)) return "";
  return s;
}

function digitsOnly(v) {
  return String(v || "").replace(/\D+/g, "");
}

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

    const phones = Array.from(
      new Set(
        (rows || [])
          .map((r) => cleanText(r && r.phone))
          .filter(Boolean)
      )
    );

    const byPhone = {};
    if (phones.length) {
      const values = phones.map((p) => `"${p.replace(/"/g, "")}"`).join(",");
      const contacts = await restSelect(
        cfg,
        "contacts",
        `select=id,full_name,email,phone,whatsapp_id,manychat_subscriber_id,created_at&or=(phone.in.(${values}),whatsapp_id.in.(${values}),manychat_subscriber_id.in.(${values}))&order=created_at.desc&limit=400`
      );
      (contacts || []).forEach((c) => {
        const keyCandidates = [
          cleanText(c.phone),
          cleanText(c.whatsapp_id),
          cleanText(c.manychat_subscriber_id),
          digitsOnly(c.phone),
          digitsOnly(c.whatsapp_id),
          digitsOnly(c.manychat_subscriber_id),
        ].filter(Boolean);
        keyCandidates.forEach((k) => {
          if (!byPhone[k]) byPhone[k] = c;
        });
      });
    }

    const items = (rows || []).map((q) => {
      const lead = q.lead_id ? byLeadId[q.lead_id] || null : null;
      const phoneKey = cleanText(q.phone);
      const phoneDigits = digitsOnly(q.phone);
      const contact = byPhone[phoneKey] || byPhone[phoneDigits] || null;
      const fallbackLead = contact
        ? {
            id: contact.id || null,
            first_name: cleanText(contact.full_name),
            phone: cleanText(contact.phone) || cleanText(contact.whatsapp_id) || cleanText(q.phone),
            email: cleanText(contact.email),
          }
        : null;
      const resolvedLead = lead || fallbackLead;
      return {
        id: q.id,
        lead_id: q.lead_id || null,
        phone: cleanText(q.phone) || (resolvedLead && resolvedLead.phone) || "",
        question: q.question || "",
        edited_question: q.edited_question || "",
        language: q.language || "",
        flow_stage: q.flow_stage || "",
        created_at: q.created_at || null,
        resolved: !!q.resolved,
        rag_pushed: !!q.rag_pushed,
        lead: resolvedLead
          ? {
              id: resolvedLead.id,
              first_name: resolvedLead.first_name || "",
              phone: resolvedLead.phone || "",
              email: resolvedLead.email || "",
            }
          : null,
      };
    });

    return json(res, 200, { items });
  } catch (e) {
    return json(res, 500, { error: "Failed to load questions" });
  }
};
