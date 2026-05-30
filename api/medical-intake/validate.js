const { json, requireValidIntakeToken, serviceConfig } = require("./_lib");

async function restSelect(cfg, table, query) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`select ${table} ${r.status}: ${text.slice(0, 240)}`);
  return JSON.parse(text || "[]");
}

async function fetchLeadGreeting(cfg, leadId, leadSourceTable) {
  const table = String(leadSourceTable || "contacts").trim();
  const id = encodeURIComponent(leadId);
  let rows;
  if (table === "quote_lead_submissions") {
    rows = await restSelect(cfg, table, `select=first_name,lang&id=eq.${id}&limit=1`);
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    return {
      first_name: row && row.first_name ? String(row.first_name).trim() : "",
      language: row && row.lang ? String(row.lang).trim() : "Spanish",
    };
  }
  const nameField = table === "contacts" || table === "manychat_leads" ? "first_name,language,idioma" : "first_name,language";
  rows = await restSelect(cfg, table, `select=${nameField}&id=eq.${id}&limit=1`);
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  return {
    first_name: row && row.first_name ? String(row.first_name).trim() : "",
    language: row && (row.idioma || row.language) ? String(row.idioma || row.language).trim() : "Spanish",
  };
}

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
    let greeting = { first_name: "", language: "Spanish" };
    if (cfg) {
      try {
        greeting = await fetchLeadGreeting(cfg, gate.tokenRow.lead_id, gate.tokenRow.lead_source_table);
      } catch (_) {
        /* optional personalization */
      }
    }
    return json(res, 200, {
      ok: true,
      lead_id: gate.tokenRow.lead_id,
      expires_at: gate.tokenRow.expires_at,
      first_name: greeting.first_name,
      language: greeting.language,
    });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message || "validate_failed") });
  }
};
