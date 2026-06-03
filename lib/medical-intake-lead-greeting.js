/**
 * First-name resolution for medical intake email + landing greeting.
 */

function normalizeFirstName(v) {
  const n = String(v == null ? "" : v).trim();
  if (!n || /^there$/i.test(n)) return "";
  return n.slice(0, 80);
}

function isSpanishLang(language) {
  return /spanish|español|espanol|^es$/i.test(String(language || ""));
}

/** Landing / email salutation: "Hola," or "Hola Daisy," (never "Hola there,"). */
function salutationLine(language, firstName) {
  const n = normalizeFirstName(firstName);
  if (isSpanishLang(language)) return n ? `Hola ${n},` : "Hola,";
  return n ? `Hi ${n},` : "Hi,";
}

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

async function fetchStaffProfileFirstName(cfg, leadId, leadSourceTable) {
  const id = encodeURIComponent(leadId);
  const table = encodeURIComponent(String(leadSourceTable || "").trim());
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=profile_data&lead_id=eq.${id}&lead_source_table=eq.${table}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  const pd = row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
  return normalizeFirstName(pd.first_name);
}

async function fetchLeadGreetingFromDb(cfg, leadId, leadSourceTable) {
  const table = String(leadSourceTable || "manychat_leads").trim();
  const id = encodeURIComponent(leadId);
  let first_name = "";
  let language = "Spanish";

  if (table === "quote_lead_submissions") {
    const rows = await restSelect(cfg, table, `select=first_name,lang&id=eq.${id}&limit=1`);
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    first_name = normalizeFirstName(row && row.first_name);
    language = row && row.lang ? String(row.lang).trim() : "Spanish";
  } else {
    const nameField =
      table === "contacts" || table === "manychat_leads"
        ? "first_name,last_name,language,idioma"
        : "first_name,last_name,language";
    const rows = await restSelect(cfg, table, `select=${nameField}&id=eq.${id}&limit=1`);
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    first_name = normalizeFirstName(row && row.first_name);
    language = row && (row.idioma || row.language) ? String(row.idioma || row.language).trim() : "Spanish";
  }

  if (!first_name) {
    const fromProfile = await fetchStaffProfileFirstName(cfg, leadId, leadSourceTable);
    if (fromProfile) first_name = fromProfile;
  }

  return { first_name, language };
}

module.exports = {
  normalizeFirstName,
  isSpanishLang,
  salutationLine,
  fetchLeadGreetingFromDb,
};
