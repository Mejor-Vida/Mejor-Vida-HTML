const { json, requireValidIntakeToken, serviceConfig } = require("./_lib");
const { normalizeFirstName, fetchLeadGreetingFromDb } = require("../../lib/medical-intake-lead-greeting");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }
  try {
    const gate = await requireValidIntakeToken(req);
    if (!gate.ok) return json(res, gate.status, { ok: false, error: gate.error });
    if (gate.devPreview) {
      return json(res, 200, {
        ok: true,
        dev_preview: true,
        lead_id: null,
        expires_at: null,
        first_name: "Preview",
        language: "Spanish",
      });
    }
    const cfg = serviceConfig();
    let first_name = normalizeFirstName(gate.tokenRow.recipient_first_name);
    let language = "Spanish";

    if (cfg && gate.tokenRow.lead_id) {
      if (!first_name) {
        try {
          const greeting = await fetchLeadGreetingFromDb(
            cfg,
            gate.tokenRow.lead_id,
            gate.tokenRow.lead_source_table
          );
          first_name = greeting.first_name;
          language = greeting.language || language;
        } catch (_) {
          /* optional personalization */
        }
      }
    }

    return json(res, 200, {
      ok: true,
      lead_id: gate.tokenRow.lead_id,
      expires_at: gate.tokenRow.expires_at,
      first_name,
      language,
    });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message || "validate_failed") });
  }
};
