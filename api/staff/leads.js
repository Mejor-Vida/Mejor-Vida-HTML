const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");
const { canAccessPhi } = require("../../lib/staff-permissions");
const { readPhiByLead, writePhiByLead } = require("../../lib/phi-store");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));
}

function splitDisplayName(name) {
  const t = String(name || "").trim();
  if (!t) return { first_name: "", last_name: null };
  const sp = t.indexOf(" ");
  if (sp === -1) return { first_name: t.slice(0, 200), last_name: null };
  return {
    first_name: t.slice(0, sp).trim().slice(0, 200) || t.slice(0, 200),
    last_name: t.slice(sp + 1).trim().slice(0, 200) || null,
  };
}

function displayName(row) {
  const a = String((row && row.first_name) || "").trim();
  const b = String((row && row.last_name) || "").trim();
  const full = [a, b].filter(Boolean).join(" ").trim();
  return full || a || b || "Unknown";
}

function sortKey(row) {
  return displayName(row).toLowerCase();
}

const UNRESOLVED_TEMPLATE = /^\{\{[\s\S]*\}\}$/;

function cleanText(v) {
  const s = String(v || "").trim();
  if (!s || UNRESOLVED_TEMPLATE.test(s)) return "";
  return s;
}

function digitsOnly(v) {
  return String(v || "").replace(/\D+/g, "");
}

function normalizeEmail(v) {
  const s = cleanText(v).toLowerCase();
  return s || "";
}

function normalizePhone(v) {
  return digitsOnly(v);
}

function normalizeName(v) {
  return cleanText(v).toLowerCase();
}

function dedupeKeyForLead(lead) {
  const emailKey = normalizeEmail(lead && lead.email);
  const phoneKey = normalizePhone(lead && lead.phone);
  const nameKey = normalizeName(lead && lead.display_name);
  if (emailKey) return emailKey;
  if (phoneKey) return phoneKey;
  if (nameKey) return nameKey;
  const sourceTable = String((lead && lead.source_table) || "unknown");
  const sourceId = String((lead && lead.id) || "");
  return `${sourceTable}:${sourceId}`;
}

/** PostgREST / Postgres when manychat_leads.staff_hidden_at is not migrated yet */
function isStaffHiddenColumnError(msg) {
  return /staff_hidden_at|42703|PGRST204|column.*does not exist|Could not find/i.test(String(msg || ""));
}

async function selectManychatLeadsForStaff(cfg) {
  const filtered = "select=id&staff_hidden_at=is.null&limit=1";
  const legacy = "select=id&limit=1";
  try {
    return await restSelect(cfg, "manychat_leads", filtered);
  } catch (e) {
    if (isStaffHiddenColumnError(e && e.message)) {
      return await restSelect(cfg, "manychat_leads", legacy);
    }
    throw e;
  }
}

async function selectUnifiedLeadsForStaff(cfg) {
  const query =
    "select=id,source_table,source,first_name,last_name,display_name,phone,email,language,created_at,updated_at&limit=5000";
  return await restSelect(cfg, "unified_leads", query);
}

async function selectUnifiedLeadById(cfg, id) {
  const one = await restSelect(
    cfg,
    "unified_leads",
    `select=id,source_table,source,display_name,email,phone,language,first_name,last_name,created_at,updated_at&limit=1&id=eq.${encodeURIComponent(id)}`
  );
  return Array.isArray(one) && one.length ? one[0] : null;
}

function isBlankValue(v) {
  return v == null || v === "" || (Array.isArray(v) && v.length === 0);
}

function mergePreferSource(base, canonicalPatch) {
  const out = Object.assign({}, base || {});
  const patch = canonicalPatch && typeof canonicalPatch === "object" ? canonicalPatch : {};
  Object.keys(patch).forEach((k) => {
    if (isBlankValue(out[k])) out[k] = patch[k];
  });
  return out;
}

function mergePreferCanonical(sourceValue, canonicalValue) {
  return isBlankValue(canonicalValue) ? sourceValue : canonicalValue;
}

function normalizeCitizenshipStatus(v) {
  const raw = String(v == null ? "" : v).trim();
  if (!raw) return "";
  const t = raw.toLowerCase();
  if (t === "other_or_not_sure" || t === "undocumented_immigrant") return "itin_holder";
  return raw;
}

async function loadSelectorDerivedProfileExt(cfg, leadId, leadSourceTable) {
  if (!leadId || !leadSourceTable) return {};
  const rows = await restSelect(
    cfg,
    "product_selector_sessions",
    `select=workflow_state,risk_summary,recommendation,updated_at&lead_id=eq.${encodeURIComponent(
      leadId
    )}&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  const risk = row && row.risk_summary && typeof row.risk_summary === "object" ? row.risk_summary : {};
  const rec = row && row.recommendation && typeof row.recommendation === "object" ? row.recommendation : {};
  return {
    risk_level: risk.level || "",
    risk_flags: Array.isArray(risk.flags) ? risk.flags : [],
    last_recommendation: rec.product_type || "",
    recommendation_timestamp: row && row.updated_at ? row.updated_at : "",
  };
}

async function loadCanonicalLeadProfile(cfg, leadId, leadSourceTable) {
  if (!leadId || !leadSourceTable) return {};
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=profile_data&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  return row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
}

async function saveCanonicalLeadProfile(cfg, leadId, leadSourceTable, patch, updatedBy) {
  if (!leadId || !leadSourceTable) return null;
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=id,profile_data&lead_id=eq.${encodeURIComponent(
      leadId
    )}&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  const now = new Date().toISOString();
  const existingProfile = row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
  const nextProfile = Object.assign({}, existingProfile, patch || {});
  if (!row) {
    const inserted = await restInsert(cfg, "staff_lead_profiles", [
      {
        lead_id: leadId,
        lead_source_table: leadSourceTable,
        profile_data: nextProfile,
        updated_at: now,
        updated_by: updatedBy || null,
      },
    ]);
    return Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
  }
  const patched = await restPatch(
    cfg,
    "staff_lead_profiles",
    `id=eq.${encodeURIComponent(row.id)}`,
    {
      profile_data: nextProfile,
      updated_at: now,
      updated_by: updatedBy || null,
    }
  );
  return Array.isArray(patched) && patched[0] ? patched[0] : null;
}

const MANYCHAT_DETAIL_COLUMNS =
  "id,first_name,last_name,phone,email,age,sex,tobacco,language,tag,pipeline_stage,source,drop_off,drop_off_stage,opt_in,opt_in_at,manychat_subscriber_id,created_at,updated_at";

async function selectManychatLeadDetailById(cfg, id) {
  const eq = `limit=1&id=eq.${encodeURIComponent(id)}`;
  const qWithHidden = `select=${MANYCHAT_DETAIL_COLUMNS},staff_hidden_at&${eq}`;
  const qBase = `select=${MANYCHAT_DETAIL_COLUMNS}&${eq}`;
  try {
    const rows = await restSelect(cfg, "manychat_leads", qWithHidden);
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch (e) {
    if (isStaffHiddenColumnError(e && e.message)) {
      const rows = await restSelect(cfg, "manychat_leads", qBase);
      return Array.isArray(rows) && rows[0] ? rows[0] : null;
    }
    throw e;
  }
}

function toBoolOrNullFromText(v) {
  const t = String(v == null ? "" : v).trim().toLowerCase();
  if (!t) return null;
  if (["true", "yes", "y", "1", "smoker", "tobacco", "si", "sí"].includes(t)) return true;
  if (["false", "no", "n", "0", "non-smoker", "nonsmoker"].includes(t)) return false;
  return null;
}

async function selectContactsLeadDetailById(cfg, id) {
  const rows = await restSelect(
    cfg,
    "contacts",
    `select=id,first_name,last_name,email,phone,language,idioma,source,whatsapp_id,manychat_subscriber_id,created_at,updated_at&limit=1&id=eq.${encodeURIComponent(id)}`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row) return null;
  const lang = String(row.idioma || row.language || "english").trim();
  return {
    read_only: false,
    source_table: "contacts",
    id: row.id,
    first_name: row.first_name || "",
    last_name: row.last_name || "",
    display_name: displayName(row),
    phone: row.phone || "",
    email: String(row.email || "").trim(),
    language: lang || "english",
    source: row.source || "contacts",
    age: null,
    sex: null,
    tobacco: null,
    tag: null,
    pipeline_stage: null,
    drop_off: false,
    drop_off_stage: null,
    opt_in: false,
    opt_in_at: null,
    manychat_subscriber_id: row.manychat_subscriber_id || row.whatsapp_id || null,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    staff_hidden_at: null,
  };
}

async function selectQuoteLeadDetailById(cfg, id) {
  const rows = await restSelect(
    cfg,
    "quote_lead_submissions",
    `select=id,first_name,last_name,email,phone,age,gender,tobacco,lang,source,created_at,quote_status&limit=1&id=eq.${encodeURIComponent(id)}`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row) return null;
  const nAge = row.age == null ? null : parseInt(String(row.age), 10);
  return {
    read_only: false,
    source_table: "quote_lead_submissions",
    id: row.id,
    first_name: row.first_name || "",
    last_name: row.last_name || "",
    display_name: displayName(row),
    phone: row.phone || "",
    email: String(row.email || "").trim(),
    language: row.lang || "English",
    source: row.source || "website_quote_tool",
    age: Number.isFinite(nAge) ? nAge : null,
    sex: row.gender || null,
    tobacco: toBoolOrNullFromText(row.tobacco),
    tag: null,
    pipeline_stage: row.quote_status || null,
    drop_off: false,
    drop_off_stage: null,
    opt_in: false,
    opt_in_at: null,
    manychat_subscriber_id: null,
    created_at: row.created_at || null,
    updated_at: row.created_at || null,
    staff_hidden_at: null,
  };
}

async function composeMergedLeadDetail(cfg, detail) {
  if (!detail || !detail.id || !detail.source_table) return detail;
  const canonical = await loadCanonicalLeadProfile(cfg, detail.id, detail.source_table);
  const selectorExt = await loadSelectorDerivedProfileExt(cfg, detail.id, detail.source_table);
  const canonicalExt = canonical.profile_ext && typeof canonical.profile_ext === "object" ? canonical.profile_ext : {};

  const merged = Object.assign({}, detail);
  const topLevelPatch = Object.assign({}, canonical);
  delete topLevelPatch.profile_ext;
  merged.first_name = mergePreferCanonical(detail.first_name, topLevelPatch.first_name);
  merged.last_name = mergePreferCanonical(detail.last_name, topLevelPatch.last_name);
  merged.email = mergePreferCanonical(detail.email, topLevelPatch.email);
  merged.phone = mergePreferCanonical(detail.phone, topLevelPatch.phone);
  merged.language = mergePreferCanonical(detail.language, topLevelPatch.language);
  merged.age = mergePreferCanonical(detail.age, topLevelPatch.age);
  merged.sex = mergePreferCanonical(detail.sex, topLevelPatch.sex);
  merged.tobacco = topLevelPatch.tobacco != null ? topLevelPatch.tobacco : detail.tobacco;

  const baseExt = mergePreferSource(selectorExt, canonicalExt);
  merged.profile_ext = mergePreferSource(baseExt, canonicalExt);
  if (merged.profile_ext && typeof merged.profile_ext === "object") {
    merged.profile_ext.citizenship_status = normalizeCitizenshipStatus(merged.profile_ext.citizenship_status) || null;
  }
  return merged;
}

async function upsertStaffHiddenLead(cfg, lead) {
  const payload = [
    {
      dedupe_key: dedupeKeyForLead(lead),
      email_key: normalizeEmail(lead.email) || null,
      phone_key: normalizePhone(lead.phone) || null,
      name_key: normalizeName(lead.display_name) || null,
      source_table: String(lead.source_table || "unknown"),
      source_id: lead.id,
      hidden_at: new Date().toISOString(),
    },
  ];
  const r = await fetch(
    `${cfg.supabaseUrl}/rest/v1/staff_hidden_leads?on_conflict=dedupe_key`,
    {
      method: "POST",
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(payload),
    }
  );
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase upsert staff_hidden_leads ${r.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : [];
}

/** Same scoring idea as staff/questions — match lead phone to contacts.whatsapp_id / phone / subscriber. */
function bestContactEmailForPhone(phoneField, contacts) {
  const qPhoneText = cleanText(phoneField);
  const qPhoneDigits = digitsOnly(qPhoneText);
  if (!contacts || !contacts.length || !qPhoneText) return "";

  const scored = contacts
    .map((c) => {
      const cPhone = cleanText(c.phone);
      const cWhatsAppId = cleanText(c.whatsapp_id);
      const cSubscriberId = cleanText(c.manychat_subscriber_id);
      const cPhoneDigits = digitsOnly(cPhone);
      const cEmail = cleanText(c.email);
      let score = 0;
      if (qPhoneDigits && cPhoneDigits && qPhoneDigits === cPhoneDigits) score += 100;
      if (qPhoneText && qPhoneText === cWhatsAppId) score += 40;
      if (qPhoneText && qPhoneText === cSubscriberId) score += 35;
      if (cEmail) score += 12;
      if (cSubscriberId) score += 8;
      if (cWhatsAppId) score += 5;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.length ? scored[0].c : null;
  return top ? cleanText(top.email) : "";
}

async function enrichLeadEmailsFromContacts(cfg, items) {
  const phonesNeedingEmail = Array.from(
    new Set(
      items
        .filter((i) => !cleanText(i.email) && cleanText(i.phone))
        .map((i) => cleanText(i.phone))
    )
  );
  if (!phonesNeedingEmail.length) return;

  const allContacts = [];
  const chunkSize = 80;
  for (let i = 0; i < phonesNeedingEmail.length; i += chunkSize) {
    const chunk = phonesNeedingEmail.slice(i, i + chunkSize);
    const values = chunk.map((p) => `"${String(p).replace(/"/g, "")}"`).join(",");
    if (!values) continue;
    const contacts = await restSelect(
      cfg,
      "contacts",
      `select=id,email,phone,whatsapp_id,manychat_subscriber_id,created_at&or=(phone.in.(${values}),whatsapp_id.in.(${values}),manychat_subscriber_id.in.(${values}))&order=created_at.desc&limit=400`
    );
    (contacts || []).forEach((c) => allContacts.push(c));
  }

  const seen = new Set();
  const uniq = [];
  allContacts.forEach((c) => {
    const id = c && c.id;
    if (!id || seen.has(id)) return;
    seen.add(id);
    uniq.push(c);
  });

  items.forEach((row) => {
    if (cleanText(row.email) || !cleanText(row.phone)) return;
    const em = bestContactEmailForPhone(row.phone, uniq);
    if (em) row.email = em;
  });
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;
  const canPhi = canAccessPhi(auth);

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    const detailId = String((req.query && req.query.id) || "").trim();
    if (detailId && isUuid(detailId)) {
      try {
        const unified = await selectUnifiedLeadById(cfg, detailId);
        if (!unified) return json(res, 404, { error: "Lead not found" });
        const src = String(unified.source_table || "");
        if (src === "manychat_leads") {
          const row = await selectManychatLeadDetailById(cfg, detailId);
          if (!row) return json(res, 404, { error: "Lead not found" });
          const detail = await composeMergedLeadDetail(cfg, Object.assign({ read_only: false }, row));
          if (canPhi) {
            const phi = await readPhiByLead(cfg, detailId, src);
            detail.phi = phi.payload || {};
          }
          return json(res, 200, { detail, can_access_phi: canPhi });
        }
        if (src === "contacts") {
          const sourceDetail = await selectContactsLeadDetailById(cfg, detailId);
          const detail = await composeMergedLeadDetail(cfg, sourceDetail);
          if (!detail) return json(res, 404, { error: "Lead not found" });
          if (canPhi) {
            const phi = await readPhiByLead(cfg, detailId, src);
            detail.phi = phi.payload || {};
          }
          return json(res, 200, { detail, can_access_phi: canPhi });
        }
        if (src === "quote_lead_submissions") {
          const sourceDetail = await selectQuoteLeadDetailById(cfg, detailId);
          const detail = await composeMergedLeadDetail(cfg, sourceDetail);
          if (!detail) return json(res, 404, { error: "Lead not found" });
          if (canPhi) {
            const phi = await readPhiByLead(cfg, detailId, src);
            detail.phi = phi.payload || {};
          }
          return json(res, 200, { detail, can_access_phi: canPhi });
        }
        const detail = {
          read_only: true,
          source_table: unified.source_table,
          id: unified.id,
          first_name: unified.first_name || "",
          last_name: unified.last_name || "",
          display_name: unified.display_name || displayName(unified),
          phone: unified.phone || "",
          email: String(unified.email || "").trim(),
          language: unified.language || "English",
          source: unified.source || unified.source_table || "unknown",
          created_at: unified.created_at || null,
          updated_at: unified.updated_at || null,
        };
        if (canPhi) {
          const phi = await readPhiByLead(cfg, detailId, String(unified.source_table || "unknown"));
          detail.phi = phi.payload || {};
        }
        const merged = await composeMergedLeadDetail(cfg, detail);
        return json(res, 200, {
          detail: merged,
          can_access_phi: canPhi,
        });
      } catch (e) {
        console.error("staff/leads GET id", e);
        return json(res, 500, { error: "Failed to load lead" });
      }
    }

    try {
      // Schema probe: must not block unified_leads if manychat_leads errors for unrelated reasons.
      try {
        await selectManychatLeadsForStaff(cfg);
      } catch (probeErr) {
        console.error("staff/leads GET manychat probe", probeErr && probeErr.message);
      }
      const rows = await selectUnifiedLeadsForStaff(cfg);
      const items = (rows || []).map((r) => ({
        id: r.id,
        first_name: r.first_name || "",
        last_name: r.last_name || "",
        display_name: r.display_name || displayName(r),
        phone: r.phone || "",
        email: String(r.email || "").trim(),
        language: r.language || "English",
        source: r.source || r.source_table || "unknown",
        source_table: r.source_table || "unknown",
        created_at: r.created_at || null,
        updated_at: r.updated_at || null,
      }));
      try {
        await enrichLeadEmailsFromContacts(cfg, items);
      } catch (e) {
        console.error("staff/leads GET enrichLeadEmailsFromContacts", e);
      }
      items.sort((x, y) => sortKey(x).localeCompare(sortKey(y)));
      return json(res, 200, { items });
    } catch (e) {
      console.error("staff/leads GET", e);
      return json(res, 500, { error: "Failed to load leads" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(res, 400, { error: "name and valid email required" });
    }
    const phone = String(body.phone || "").trim().slice(0, 40) || null;
    const language = String(body.language || "English").trim().slice(0, 50) || "English";
    const { first_name, last_name } = splitDisplayName(name);
    if (!first_name) return json(res, 400, { error: "name required" });

    try {
      const inserted = await restInsert(cfg, "manychat_leads", [
        {
          first_name,
          last_name,
          email,
          phone,
          language,
          source: "staff_compose",
          tag: "Lead_NE",
          pipeline_stage: "new",
          drop_off: false,
        },
      ]);
      const row = inserted && inserted[0];
      if (!row || !row.id) return json(res, 500, { error: "Failed to create lead" });
      const item = {
        id: row.id,
        first_name: row.first_name || "",
        last_name: row.last_name || "",
        display_name: displayName(row),
        phone: row.phone || "",
        email: row.email || "",
        language: row.language || "English",
        source: row.source || "staff_compose",
        source_table: "manychat_leads",
      };
      return json(res, 200, { item });
    } catch (e) {
      console.error("staff/leads POST", e);
      return json(res, 500, { error: "Failed to create lead" });
    }
  }

  if (req.method === "PATCH") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const id = String(body.id || "").trim();
    if (!isUuid(id)) {
      return json(res, 400, { error: "Valid lead id required" });
    }
    const patchKeys = [
      "email",
      "phone",
      "language",
      "first_name",
      "last_name",
      "age",
      "sex",
      "tobacco",
      "tag",
      "pipeline_stage",
      "source",
      "drop_off",
      "drop_off_stage",
      "opt_in",
      "manychat_subscriber_id",
      "phi",
      "profile_ext",
    ];
    const touched = patchKeys.filter((k) => Object.prototype.hasOwnProperty.call(body, k));
    if (!touched.length) {
      return json(res, 400, { error: "Provide at least one field to update" });
    }

    const hasEmailKey = Object.prototype.hasOwnProperty.call(body, "email");
    const emailIn = hasEmailKey ? String(body.email || "").trim().toLowerCase() : null;
    if (hasEmailKey && emailIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailIn)) {
      return json(res, 400, { error: "Invalid email" });
    }

    const now = new Date().toISOString();
    const payload = { updated_at: now };

    if (Object.prototype.hasOwnProperty.call(body, "email")) payload.email = emailIn || null;
    if (Object.prototype.hasOwnProperty.call(body, "phone")) {
      payload.phone = String(body.phone || "").trim().slice(0, 40) || null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "language")) {
      payload.language = String(body.language || "English").trim().slice(0, 50) || "English";
    }
    if (Object.prototype.hasOwnProperty.call(body, "first_name")) {
      payload.first_name = String(body.first_name || "").trim().slice(0, 200) || null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "last_name")) {
      payload.last_name = String(body.last_name || "").trim().slice(0, 200) || null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "age")) {
      const v = body.age;
      if (v === "" || v === null || v === undefined) {
        payload.age = null;
      } else {
        const n = parseInt(String(v), 10);
        if (!Number.isFinite(n) || n < 0 || n > 130) {
          return json(res, 400, { error: "Invalid age" });
        }
        payload.age = n;
      }
    }
    if (Object.prototype.hasOwnProperty.call(body, "sex")) {
      const s = String(body.sex ?? "").trim();
      payload.sex = s ? s.slice(0, 50) : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "tobacco")) {
      if (body.tobacco === null || body.tobacco === "") payload.tobacco = null;
      else payload.tobacco = !!body.tobacco;
    }
    if (Object.prototype.hasOwnProperty.call(body, "tag")) {
      const s = String(body.tag ?? "").trim();
      payload.tag = s ? s.slice(0, 120) : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "pipeline_stage")) {
      const s = String(body.pipeline_stage ?? "").trim();
      payload.pipeline_stage = s ? s.slice(0, 120) : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "source")) {
      const s = String(body.source ?? "").trim();
      payload.source = s ? s.slice(0, 120) : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "drop_off")) {
      payload.drop_off = !!body.drop_off;
    }
    if (Object.prototype.hasOwnProperty.call(body, "drop_off_stage")) {
      const s = String(body.drop_off_stage ?? "").trim();
      payload.drop_off_stage = s ? s.slice(0, 200) : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "opt_in")) {
      payload.opt_in = !!body.opt_in;
    }
    if (Object.prototype.hasOwnProperty.call(body, "manychat_subscriber_id")) {
      const s = String(body.manychat_subscriber_id ?? "").trim();
      payload.manychat_subscriber_id = s ? s.slice(0, 120) : null;
    }
    try {
      const unified = await selectUnifiedLeadById(cfg, id);
      if (!unified) return json(res, 404, { error: "Lead not found" });
      const src = String(unified.source_table || "");
      if (Object.prototype.hasOwnProperty.call(body, "phi")) {
        if (!canPhi) return json(res, 403, { error: "Not authorized to edit PHI fields" });
        const phiPayload = body.phi && typeof body.phi === "object" ? body.phi : {};
        await writePhiByLead(
          cfg,
          id,
          src || "unknown",
          phiPayload,
          auth.user && auth.user.email ? auth.user.email : null
        );
      }
      const canonicalPatch = {};
      [
        "email",
        "phone",
        "language",
        "first_name",
        "last_name",
        "age",
        "sex",
        "tobacco",
        "tag",
        "pipeline_stage",
        "source",
        "drop_off",
        "drop_off_stage",
        "opt_in",
        "manychat_subscriber_id",
      ].forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(body, k) && Object.prototype.hasOwnProperty.call(payload, k)) {
          canonicalPatch[k] = payload[k];
        }
      });
      if (Object.prototype.hasOwnProperty.call(body, "profile_ext") && body.profile_ext && typeof body.profile_ext === "object") {
        canonicalPatch.profile_ext = Object.assign({}, body.profile_ext, {
          citizenship_status: normalizeCitizenshipStatus(body.profile_ext.citizenship_status) || null,
        });
      }
      await saveCanonicalLeadProfile(
        cfg,
        id,
        src || "unknown",
        canonicalPatch,
        auth.user && auth.user.email ? auth.user.email : null
      );

      const one = {
        id: unified.id,
        first_name: unified.first_name || "",
        last_name: unified.last_name || "",
        display_name: unified.display_name || displayName(unified),
        phone: unified.phone || "",
        email: String(unified.email || "").trim(),
        language: unified.language || "English",
        source: unified.source || unified.source_table || "unknown",
        source_table: unified.source_table || "unknown",
      };
      try {
        await enrichLeadEmailsFromContacts(cfg, [one]);
      } catch (e) {
        console.error("staff/leads PATCH enrichLeadEmailsFromContacts", e);
      }
      let detail = null;
      if (src === "manychat_leads") {
        const row = await selectManychatLeadDetailById(cfg, id);
        detail = row ? Object.assign({ read_only: false }, row) : null;
      } else if (src === "contacts") {
        detail = await selectContactsLeadDetailById(cfg, id);
      } else if (src === "quote_lead_submissions") {
        detail = await selectQuoteLeadDetailById(cfg, id);
      } else {
        detail = {
          read_only: true,
          source_table: src || "unknown",
          id: unified.id,
          first_name: unified.first_name || "",
          last_name: unified.last_name || "",
          display_name: unified.display_name || displayName(unified),
          phone: unified.phone || "",
          email: String(unified.email || "").trim(),
          language: unified.language || "English",
          source: unified.source || src || "unknown",
          created_at: unified.created_at || null,
          updated_at: unified.updated_at || null,
        };
      }
      const mergedDetail = detail ? await composeMergedLeadDetail(cfg, detail) : null;
      if (mergedDetail && canPhi) {
        const phi = await readPhiByLead(cfg, id, src || "unknown");
        mergedDetail.phi = phi.payload || {};
      }
      return json(res, 200, { item: one, detail: mergedDetail, can_access_phi: canPhi });
    } catch (e) {
      console.error("staff/leads PATCH", e);
      return json(res, 500, { error: "Failed to update lead" });
    }
  }

  if (req.method === "DELETE") {
    const id = (req.query && (req.query.id || req.query.lead_id)) || "";
    if (!isUuid(id)) {
      return json(res, 400, { error: "Valid lead id required (query: id)" });
    }
    try {
      const unified = await selectUnifiedLeadById(cfg, id);
      if (!unified) return json(res, 404, { error: "Lead not found" });

      await upsertStaffHiddenLead(cfg, unified);

      if (String(unified.source_table || "") === "manychat_leads") {
        try {
          const now = new Date().toISOString();
          await restPatch(cfg, "manychat_leads", `id=eq.${encodeURIComponent(id)}`, {
            staff_hidden_at: now,
            updated_at: now,
          });
        } catch (e) {
          const msg = e && e.message ? String(e.message) : "";
          if (!(/42703|column/i.test(msg) && /staff_hidden_at/i.test(msg))) throw e;
        }
      }
      return json(res, 200, { ok: true, id, source_table: unified.source_table });
    } catch (e) {
      console.error("staff/leads DELETE", e);
      const msg = e && e.message ? String(e.message) : "Failed to hide lead";
      if (/staff_hidden_leads|relation .* does not exist|42P01|PGRST/i.test(msg)) {
        return json(res, 503, {
          error:
            "Database migration required: run 029_staff_hidden_leads_unified.sql on Supabase.",
        });
      }
      return json(res, 500, { error: "Failed to hide lead from compose list" });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return json(res, 405, { error: "Method Not Allowed" });
};
