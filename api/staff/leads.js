const { requireStaffAuth } = require("../auth-check");
const { logIntegrationAudit } = require("../../lib/integration-audit");
const { json, serviceConfig, restSelect, restInsert, restPatch, restDelete } = require("./_inbox-lib");
const { canAccessPhi } = require("../../lib/staff-permissions");
const { readPhiByLead, writePhiByLead } = require("../../lib/phi-store");
const { hubspotPhoneSearchVariants, phoneLast10Digits } = require("../../lib/hubspot-phone-variants");

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

/** Stable key for staff_hidden_leads — one suppressed compose row, not whole phone/email partition. */
function staffHiddenDedupeKey(lead) {
  const id = lead && lead.id;
  const st = String((lead && lead.source_table) || "unknown").trim() || "unknown";
  if (id) return `${st}:${String(id)}`;
  return dedupeKeyForLead(lead);
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

/** When the view omits a row (dedupe edge case), resolve source table by id for DELETE. */
async function resolveLeadRowForDelete(cfg, id) {
  const fromView = await selectUnifiedLeadById(cfg, id);
  if (fromView && String(fromView.source_table || "").trim()) return fromView;
  const enc = encodeURIComponent(id);
  const q = `id=eq.${enc}&select=id`;
  const tables = ["quote_lead_submissions", "manychat_leads", "contacts", "whatsapp_leads", "fex_email_quotes"];
  for (const table of tables) {
    try {
      const rows = await restSelect(cfg, table, q);
      if (Array.isArray(rows) && rows[0] && rows[0].id) {
        return { id, source_table: table };
      }
    } catch (e) {
      if (isMissingTableDeleteMsg(e && e.message)) continue;
      throw e;
    }
  }
  return null;
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

/** Merge staff profile_data blobs: fill blanks in `a` from `b` (shallow + profile_ext). */
function mergeStaffProfileData(a, b) {
  const out = mergePreferSource(a || {}, b || {});
  const ae = out && out.profile_ext && typeof out.profile_ext === "object" ? out.profile_ext : {};
  const be = b && b.profile_ext && typeof b.profile_ext === "object" ? b.profile_ext : {};
  if (Object.keys(be).length || Object.keys(ae).length) out.profile_ext = mergePreferSource(ae, be);
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

async function loadSelectorDerivedLayers(cfg, leadId, leadSourceTable) {
  if (!leadId || !leadSourceTable) {
    return {
      selectorExt: {},
      psAugment: { age: null, sex: null, tobacco: null, state: null },
    };
  }
  const rows = await restSelect(
    cfg,
    "product_selector_sessions",
    `select=workflow_state,risk_summary,recommendation,updated_at,qualification_answers&lead_id=eq.${encodeURIComponent(
      leadId
    )}&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  const risk = row && row.risk_summary && typeof row.risk_summary === "object" ? row.risk_summary : {};
  const rec = row && row.recommendation && typeof row.recommendation === "object" ? row.recommendation : {};
  const selectorExt = {
    risk_level: risk.level || "",
    risk_flags: Array.isArray(risk.flags) ? risk.flags : [],
    last_recommendation: rec.product_type || "",
    recommendation_timestamp: row && row.updated_at ? row.updated_at : "",
  };
  const psAugment = augmentFromProductSelectorRow(row);
  return { selectorExt, psAugment };
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

function buildListItemFromRow(r, canonical) {
  const item = {
    id: r.id,
    first_name: r.first_name || "",
    last_name: r.last_name || "",
    phone: r.phone || "",
    email: String(r.email || "").trim(),
    language: r.language || "English",
    source: r.source || r.source_table || "unknown",
    source_table: r.source_table || "unknown",
    pipeline_stage: "",
    tag: "",
    created_at: r.created_at || null,
    updated_at: r.updated_at || null,
  };
  if (canonical && typeof canonical === "object") {
    item.first_name = mergePreferCanonical(item.first_name, canonical.first_name);
    item.last_name = mergePreferCanonical(item.last_name, canonical.last_name);
    item.email = mergePreferCanonical(item.email, canonical.email);
    item.phone = mergePreferCanonical(item.phone, canonical.phone);
    item.language = mergePreferCanonical(item.language, canonical.language);
    item.pipeline_stage = mergePreferCanonical(item.pipeline_stage, canonical.pipeline_stage);
    item.tag = mergePreferCanonical(item.tag, canonical.tag);
  }
  item.display_name = displayName(item);
  return item;
}

async function loadStaffProfileMap(cfg) {
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    "select=lead_id,lead_source_table,profile_data&limit=5000"
  );
  const map = new Map();
  (rows || []).forEach((row) => {
    if (!row || !row.lead_id || !row.lead_source_table) return;
    const key = `${row.lead_id}|${row.lead_source_table}`;
    const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
    map.set(key, pd);
  });
  return map;
}

async function enrichListItemsWithStaffProfiles(cfg, items) {
  let profileMap;
  try {
    profileMap = await loadStaffProfileMap(cfg);
  } catch (e) {
    console.error("staff/leads enrichListItemsWithStaffProfiles", e);
    return items;
  }
  return items.map((item) => {
    const key = `${item.id}|${item.source_table}`;
    const canonical = profileMap.get(key);
    if (!canonical) return item;
    return buildListItemFromRow(item, canonical);
  });
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
  if (v === true) return true;
  if (v === false) return false;
  const t = String(v == null ? "" : v).trim().toLowerCase();
  if (!t) return null;
  if (["true", "yes", "y", "1", "smoker", "tobacco", "si", "sí"].includes(t)) return true;
  if (["false", "no", "n", "0", "non-smoker", "nonsmoker"].includes(t)) return false;
  return null;
}

/** Merge product-selector-derived scalars (later rows fill blanks in `a`). */
function mergePsAugment(a, b) {
  const out = Object.assign({}, a || {});
  const p = b || {};
  if (isBlankValue(out.age) && p.age != null) out.age = p.age;
  if (isBlankValue(out.sex) && !isBlankValue(p.sex)) out.sex = p.sex;
  if (out.tobacco == null && p.tobacco != null) out.tobacco = p.tobacco;
  if (isBlankValue(out.state) && !isBlankValue(p.state)) out.state = p.state;
  return out;
}

function augmentFromProductSelectorRow(row) {
  if (!row) return { age: null, sex: null, tobacco: null, state: null };
  const qa = row.qualification_answers && typeof row.qualification_answers === "object" ? row.qualification_answers : {};
  const ws = row.workflow_state && typeof row.workflow_state === "object" ? row.workflow_state : {};
  const snap = ws.profile_snapshot && typeof ws.profile_snapshot === "object" ? ws.profile_snapshot : {};
  const ageRaw = qa.age != null && String(qa.age).trim() !== "" ? qa.age : snap.age;
  let age = null;
  if (ageRaw != null && String(ageRaw).trim() !== "") {
    const n = parseInt(String(ageRaw), 10);
    if (Number.isFinite(n) && n >= 0 && n <= 130) age = n;
  }
  const sex = cleanText(qa.sex || qa.gender || snap.sex || snap.gender) || null;
  let tobacco = null;
  if (Object.prototype.hasOwnProperty.call(qa, "tobacco")) {
    if (typeof qa.tobacco === "boolean") tobacco = qa.tobacco;
    else tobacco = toBoolOrNullFromText(qa.tobacco);
  } else if (snap.tobacco === true || snap.tobacco === false) {
    tobacco = snap.tobacco;
  } else {
    tobacco = toBoolOrNullFromText(snap.tobacco);
  }
  const st = cleanText(qa.state || snap.state || "").toUpperCase().slice(0, 2);
  const state = st.length === 2 ? st : null;
  return { age, sex, tobacco, state };
}

async function selectContactsLeadDetailById(cfg, id) {
  const rows = await restSelect(
    cfg,
    "contacts",
    `select=id,first_name,last_name,email,phone,language,idioma,source,whatsapp_id,manychat_subscriber_id,us_state,created_at,updated_at&limit=1&id=eq.${encodeURIComponent(id)}`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row) return null;
  const lang = String(row.idioma || row.language || "english").trim();
  let age = null;
  let sex = null;
  let tobacco = null;
  try {
    const lsRows = await restSelect(
      cfg,
      "lead_state",
      `select=age,gender,is_smoker&contact_id=eq.${encodeURIComponent(id)}&limit=1`
    );
    const ls = Array.isArray(lsRows) && lsRows[0] ? lsRows[0] : null;
    if (ls) {
      if (ls.age != null && String(ls.age).trim() !== "") {
        const n = parseInt(String(ls.age), 10);
        if (Number.isFinite(n) && n >= 0 && n <= 130) age = n;
      }
      sex = cleanText(ls.gender) || null;
      if (ls.is_smoker === true) tobacco = true;
      else if (ls.is_smoker === false) tobacco = false;
    }
  } catch (_e) {
    /* lead_state table optional in some environments */
  }
  const us = cleanText(row.us_state || "").toUpperCase().slice(0, 2);
  const profile_ext = {};
  if (us.length === 2) profile_ext.state = us;
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
    age,
    sex,
    tobacco,
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
    profile_ext: Object.keys(profile_ext).length ? profile_ext : undefined,
  };
}

async function selectQuoteLeadDetailById(cfg, id) {
  const rows = await restSelect(
    cfg,
    "quote_lead_submissions",
    `select=id,first_name,last_name,email,phone,age,gender,tobacco,lang,source,created_at,quote_status,state_code,payload&limit=1&id=eq.${encodeURIComponent(id)}`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row) return null;
  const p = row.payload && typeof row.payload === "object" ? row.payload : {};
  let nAge =
    row.age == null || String(row.age).trim() === ""
      ? p.age != null
        ? parseInt(String(p.age), 10)
        : null
      : parseInt(String(row.age), 10);
  if (!Number.isFinite(nAge)) nAge = null;
  const sex = cleanText(row.gender || p.sex || p.gender) || null;
  let tobacco = toBoolOrNullFromText(row.tobacco);
  if (tobacco == null) {
    if (p.smoker === true || p.smoker === "true") tobacco = true;
    else if (p.smoker === false || p.smoker === "false") tobacco = false;
    else tobacco = toBoolOrNullFromText(p.tobacco);
  }
  const st = cleanText(row.state_code || p.state || "").toUpperCase().slice(0, 2);
  const profile_ext = st.length === 2 ? { state: st } : undefined;
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
    age: nAge,
    sex,
    tobacco,
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
    profile_ext,
  };
}

async function composeMergedLeadDetail(cfg, detail, options) {
  if (!detail || !detail.id || !detail.source_table) return detail;
  options = options || {};
  const alternateLeadKeys = options.alternateLeadKeys || [];

  let canonical = await loadCanonicalLeadProfile(cfg, detail.id, detail.source_table);
  for (const alt of alternateLeadKeys) {
    if (!alt || !alt.lead_id || !alt.lead_source_table) continue;
    if (String(alt.lead_id) === String(detail.id) && alt.lead_source_table === detail.source_table) continue;
    const ext = await loadCanonicalLeadProfile(cfg, alt.lead_id, alt.lead_source_table);
    canonical = mergeStaffProfileData(canonical, ext);
  }

  let selLayers = await loadSelectorDerivedLayers(cfg, detail.id, detail.source_table);
  let selectorExt = selLayers.selectorExt || {};
  let psAugment = selLayers.psAugment || { age: null, sex: null, tobacco: null, state: null };
  for (const alt of alternateLeadKeys) {
    if (!alt || !alt.lead_id || !alt.lead_source_table) continue;
    if (String(alt.lead_id) === String(detail.id) && alt.lead_source_table === detail.source_table) continue;
    const s = await loadSelectorDerivedLayers(cfg, alt.lead_id, alt.lead_source_table);
    selectorExt = mergePreferSource(selectorExt, s.selectorExt || {});
    psAugment = mergePsAugment(psAugment, s.psAugment || {});
  }

  const canonicalExt = canonical.profile_ext && typeof canonical.profile_ext === "object" ? canonical.profile_ext : {};
  const detailExt = detail.profile_ext && typeof detail.profile_ext === "object" ? detail.profile_ext : {};

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
  merged.pipeline_stage = mergePreferCanonical(detail.pipeline_stage, topLevelPatch.pipeline_stage);
  merged.quote_low = mergePreferCanonical(detail.quote_low, topLevelPatch.quote_low);
  merged.quote_high = mergePreferCanonical(detail.quote_high, topLevelPatch.quote_high);
  merged.quote_generated_at = mergePreferCanonical(detail.quote_generated_at, topLevelPatch.quote_generated_at);
  merged.monthly_premium = mergePreferCanonical(detail.monthly_premium, topLevelPatch.monthly_premium);
  merged.coverage_amount = mergePreferCanonical(detail.coverage_amount, topLevelPatch.coverage_amount);
  merged.contacts_contact_id = mergePreferCanonical(detail.contacts_contact_id, topLevelPatch.contacts_contact_id);
  merged.contact_id = mergePreferCanonical(detail.contact_id, topLevelPatch.contact_id);

  if (isBlankValue(merged.age) && psAugment.age != null) merged.age = psAugment.age;
  if (isBlankValue(merged.sex) && !isBlankValue(psAugment.sex)) merged.sex = psAugment.sex;
  if (merged.tobacco == null && psAugment.tobacco != null) merged.tobacco = psAugment.tobacco;

  const baseExt = mergePreferSource(mergePreferSource(selectorExt, detailExt), canonicalExt);
  merged.profile_ext = Object.assign({}, baseExt, canonicalExt);
  if (!isBlankValue(psAugment.state) && isBlankValue(merged.profile_ext.state)) {
    merged.profile_ext.state = psAugment.state;
  }
  if (merged.profile_ext && typeof merged.profile_ext === "object") {
    merged.profile_ext.citizenship_status = normalizeCitizenshipStatus(merged.profile_ext.citizenship_status) || null;
  }
  merged.display_name = displayName(merged);
  return merged;
}

async function readPhiMergedForLead(cfg, leadId, leadSourceTable, alternateLeadKeys) {
  let phiPayload = (await readPhiByLead(cfg, leadId, leadSourceTable)).payload || {};
  for (const alt of alternateLeadKeys || []) {
    if (!alt || !alt.lead_id || !alt.lead_source_table) continue;
    if (String(alt.lead_id) === String(leadId) && alt.lead_source_table === leadSourceTable) continue;
    const p2 = (await readPhiByLead(cfg, alt.lead_id, alt.lead_source_table)).payload || {};
    phiPayload = mergePreferSource(phiPayload, p2);
  }
  return phiPayload;
}

/** Fill top-level Lead Profile fields from merged PHI when source tables did not carry them. */
function enrichDetailTopLevelFromPhi(detail) {
  if (!detail || !detail.phi || typeof detail.phi !== "object") return;
  if (detail.tobacco == null) {
    const t = toBoolOrNullFromText(detail.phi.tobacco);
    if (t != null) detail.tobacco = t;
  }
  if (isBlankValue(detail.sex)) {
    const sx = cleanText(detail.phi.sex || detail.phi.gender);
    if (sx) detail.sex = sx;
  }
  if (isBlankValue(detail.age) && detail.phi.age != null && String(detail.phi.age).trim() !== "") {
    const n = parseInt(String(detail.phi.age), 10);
    if (Number.isFinite(n) && n >= 0 && n <= 130) detail.age = n;
  }
  if (!detail.profile_ext || typeof detail.profile_ext !== "object") detail.profile_ext = {};
  if (isBlankValue(detail.profile_ext.state)) {
    const st = cleanText(detail.phi.state || detail.phi.us_state || "").toUpperCase().slice(0, 2);
    if (st.length === 2) detail.profile_ext.state = st;
  }
}

function isMissingTableDeleteMsg(msg) {
  return /42P01|does not exist|PGRST205|Could not find|schema cache/i.test(String(msg || ""));
}

async function safeRestDelete(cfg, table, query) {
  try {
    await restDelete(cfg, table, query);
  } catch (e) {
    if (isMissingTableDeleteMsg(e && e.message)) return;
    throw e;
  }
}

/** Staff-only satellite rows keyed by (lead_id, lead_source_table), plus hide-table cleanup. */
async function deleteStaffLinkedRows(cfg, leadId, leadSourceTable) {
  const encId = encodeURIComponent(leadId);
  const encSt = encodeURIComponent(leadSourceTable);
  const pair = `lead_id=eq.${encId}&lead_source_table=eq.${encSt}`;
  await safeRestDelete(cfg, "product_selector_sessions", pair);
  await safeRestDelete(cfg, "lead_underwriting_phi", pair);
  await safeRestDelete(cfg, "staff_lead_profiles", pair);
  const dedupeKey = staffHiddenDedupeKey({ id: leadId, source_table: leadSourceTable });
  await safeRestDelete(cfg, "staff_hidden_leads", `source_id=eq.${encId}&source_table=eq.${encSt}`);
  await safeRestDelete(cfg, "staff_hidden_leads", `dedupe_key=eq.${encodeURIComponent(dedupeKey)}`);
}

/** Permanently remove the unified directory row and staff-linked data (not a soft-hide). */
async function hardDeleteUnifiedSourceRow(cfg, unified) {
  const id = String(unified.id || "").trim();
  const st = String(unified.source_table || "").trim();
  if (!isUuid(id) || !st) throw new Error("invalid lead");
  await deleteStaffLinkedRows(cfg, id, st);
  const q = `id=eq.${encodeURIComponent(id)}`;
  if (st === "manychat_leads") {
    await restDelete(cfg, "manychat_leads", q);
    return;
  }
  if (st === "contacts") {
    await restDelete(cfg, "contacts", q);
    return;
  }
  if (st === "quote_lead_submissions") {
    await restDelete(cfg, "quote_lead_submissions", q);
    return;
  }
  if (st === "whatsapp_leads") {
    await restDelete(cfg, "whatsapp_leads", q);
    return;
  }
  if (st === "fex_email_quotes") {
    await restDelete(cfg, "fex_email_quotes", q);
    return;
  }
  throw new Error(`Hard delete is not implemented for source table: ${st}`);
}

/** Same scoring idea as staff/questions — match lead phone to contacts.whatsapp_id / phone / subscriber. */
function bestContactEmailForPhone(phoneField, contacts) {
  const qPhoneText = cleanText(phoneField);
  const qPhoneDigits = digitsOnly(qPhoneText);
  const qLast10 = phoneLast10Digits(qPhoneText);
  if (!contacts || !contacts.length || !qPhoneText) return "";

  const scored = contacts
    .map((c) => {
      const cPhone = cleanText(c.phone);
      const cWhatsAppId = cleanText(c.whatsapp_id);
      const cSubscriberId = cleanText(c.manychat_subscriber_id);
      const cPhoneDigits = digitsOnly(cPhone);
      const cLast10 = phoneLast10Digits(cPhone);
      const cEmail = cleanText(c.email);
      let score = 0;
      if (qLast10 && cLast10 && qLast10 === cLast10) score += 100;
      else if (qPhoneDigits && cPhoneDigits && qPhoneDigits === cPhoneDigits) score += 100;
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

function bestContactRowForPhone(phoneField, contacts) {
  const qPhoneText = cleanText(phoneField);
  const qPhoneDigits = digitsOnly(qPhoneText);
  const qLast10 = phoneLast10Digits(qPhoneText);
  if (!contacts || !contacts.length || !qPhoneText) return null;
  const scored = contacts
    .map((c) => {
      const cPhone = cleanText(c.phone);
      const cWhatsAppId = cleanText(c.whatsapp_id);
      const cSubscriberId = cleanText(c.manychat_subscriber_id);
      const cPhoneDigits = digitsOnly(cPhone);
      const cLast10 = phoneLast10Digits(cPhone);
      let score = 0;
      if (qLast10 && cLast10 && qLast10 === cLast10) score += 100;
      else if (qPhoneDigits && cPhoneDigits && qPhoneDigits === cPhoneDigits) score += 100;
      if (qPhoneText && qPhoneText === cWhatsAppId) score += 40;
      if (qPhoneText && qPhoneText === cSubscriberId) score += 35;
      if (cleanText(c.email)) score += 12;
      if (cSubscriberId) score += 8;
      if (cWhatsAppId) score += 5;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const top = scored.length ? scored[0].c : null;
  return top || null;
}

function pgInListQuoted(values) {
  return values.map((v) => `"${String(v).replace(/"/g, "")}"`).join(",");
}

async function selectContactsRowsByPhone(cfg, phoneRaw) {
  const last10 = phoneLast10Digits(phoneRaw);
  const variants = hubspotPhoneSearchVariants(phoneRaw);
  const idValues = variants.length ? pgInListQuoted(variants) : "";
  const orParts = [];
  if (last10) orParts.push(`phone_last_10.eq.${encodeURIComponent(last10)}`);
  if (idValues) {
    orParts.push(`whatsapp_id.in.(${idValues})`);
    orParts.push(`manychat_subscriber_id.in.(${idValues})`);
  }
  if (!orParts.length) return [];
  const q = `select=id,email,phone,whatsapp_id,manychat_subscriber_id,first_name,last_name,language,idioma,us_state,created_at&or=(${orParts.join(
    ","
  )})&order=created_at.desc&limit=80`;
  return await restSelect(cfg, "contacts", q);
}

/** Match v2 `contacts` row by ManyChat subscriber id (whatsapp_id / manychat_subscriber_id). */
async function selectContactsRowsBySubscriberId(cfg, subscriberIdRaw) {
  const sid = cleanText(subscriberIdRaw);
  if (!sid) return [];
  const enc = encodeURIComponent(sid);
  const q = `select=id,email,phone,whatsapp_id,manychat_subscriber_id,first_name,last_name,language,idioma,us_state,created_at&or=(whatsapp_id.eq.${enc},manychat_subscriber_id.eq.${enc})&order=created_at.desc&limit=20`;
  return await restSelect(cfg, "contacts", q);
}

/** Exact email match on `contacts` (lowercased). */
async function selectContactsRowByEmail(cfg, emailRaw) {
  const em = normalizeEmail(emailRaw);
  if (!em) return null;
  const rows = await restSelect(
    cfg,
    "contacts",
    `select=id,email,phone,whatsapp_id,manychat_subscriber_id,first_name,last_name,language,idioma,us_state,created_at&email=eq.${encodeURIComponent(em)}&limit=5`
  );
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

/** Score how well a `contacts` row matches a `manychat_leads` detail row (higher = stronger). */
function scoreContactForManychatLead(detail, c) {
  if (!detail || !c) return 0;
  let s = 0;
  const sub = cleanText(detail.manychat_subscriber_id);
  const ws = cleanText(c.whatsapp_id);
  const ms = cleanText(c.manychat_subscriber_id);
  if (sub && (sub === ws || sub === ms)) s += 1000;
  const p10 = phoneLast10Digits(detail.phone);
  const c10 = phoneLast10Digits(c.phone);
  if (p10 && c10 && p10 === c10) s += 100;
  else {
    const pDigits = digitsOnly(detail.phone);
    const cDigits = digitsOnly(c.phone);
    if (pDigits && cDigits && pDigits === cDigits) s += 100;
  }
  const em = normalizeEmail(detail.email);
  const ce = normalizeEmail(c.email);
  if (em && ce && em === ce) s += 80;
  return s;
}

function dedupeContactsById(rows) {
  const map = new Map();
  (rows || []).forEach((c) => {
    if (c && c.id && !map.has(String(c.id))) map.set(String(c.id), c);
  });
  return Array.from(map.values());
}

/** Pick best `contacts` row for a ManyChat-sourced lead (subscriber id > phone > email). */
function pickBestContactForManychatLead(detail, contactCandidates) {
  const uniq = dedupeContactsById(contactCandidates);
  let best = null;
  let bestScore = -1;
  for (const c of uniq) {
    const sc = scoreContactForManychatLead(detail, c);
    if (sc > bestScore) {
      bestScore = sc;
      best = c;
    }
  }
  return bestScore > 0 ? best : null;
}

/** Load `lead_state` pipeline fields for overlay onto staff Lead Profile (ManyChat source). */
async function selectLeadStatePipelineOverlay(cfg, contactId) {
  if (!contactId) return null;
  const enc = encodeURIComponent(String(contactId).trim());
  /* State lives on `contacts.us_state` in prod; `lead_state.us_state` is not always migrated. */
  const full =
    "age,gender,is_smoker,pipeline_stage,quote_low,quote_high,quote_generated_at,monthly_premium,coverage_amount";
  try {
    const rows = await restSelect(cfg, "lead_state", `select=${full}&contact_id=eq.${enc}&limit=1`);
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch (_e) {
    try {
      const reduced = "age,gender,is_smoker,pipeline_stage,monthly_premium,coverage_amount";
      const rows = await restSelect(cfg, "lead_state", `select=${reduced}&contact_id=eq.${enc}&limit=1`);
      return Array.isArray(rows) && rows[0] ? rows[0] : null;
    } catch (_e2) {
      return null;
    }
  }
}

/**
 * Build top-level + profile_ext patch from v2 `contacts` + `lead_state` for merging onto a
 * `manychat_leads` detail. Only non-blank pipeline values (caller uses mergePreferSource).
 */
function buildManychatToContactsPipelinePatch(contactRow, ls) {
  const patch = {};
  if (contactRow && contactRow.id) {
    const cid = String(contactRow.id);
    patch.contacts_contact_id = cid;
    patch.contact_id = cid;
  }
  if (contactRow) {
    const lang = cleanText(contactRow.idioma || contactRow.language);
    if (lang) patch.language = lang;
  }
  if (!ls || typeof ls !== "object") return patch;
  if (ls.age != null && String(ls.age).trim() !== "") {
    const n = parseInt(String(ls.age), 10);
    if (Number.isFinite(n) && n >= 0 && n <= 130) patch.age = n;
  }
  const sx = cleanText(ls.gender);
  if (sx) patch.sex = sx;
  if (ls.is_smoker === true || ls.is_smoker === false) patch.tobacco = ls.is_smoker;
  const ps = cleanText(ls.pipeline_stage);
  if (ps) patch.pipeline_stage = ps;
  if (ls.quote_low != null && String(ls.quote_low).trim() !== "") patch.quote_low = String(ls.quote_low).trim().slice(0, 200);
  if (ls.quote_high != null && String(ls.quote_high).trim() !== "") patch.quote_high = String(ls.quote_high).trim().slice(0, 200);
  if (ls.quote_generated_at) patch.quote_generated_at = ls.quote_generated_at;
  if (ls.monthly_premium != null && String(ls.monthly_premium).trim() !== "") patch.monthly_premium = ls.monthly_premium;
  if (ls.coverage_amount != null && String(ls.coverage_amount).trim() !== "") patch.coverage_amount = ls.coverage_amount;
  const us = cleanText((contactRow && contactRow.us_state) || ls.us_state || "");
  const st = us.toUpperCase().slice(0, 2);
  if (st.length === 2) patch.profile_ext = { state: st };
  return patch;
}

function hasManychatMergeToken(s) {
  return /\{\{/.test(String(s || ""));
}

function manychatRowRichnessScore(m) {
  if (!m) return -1;
  if (hasManychatMergeToken(m.first_name) || hasManychatMergeToken(m.last_name) || hasManychatMergeToken(m.email)) return -1;
  let s = 0;
  if (cleanText(m.email)) s += 8;
  if (cleanText(m.last_name)) s += 4;
  if (cleanText(m.first_name)) s += 1;
  if (m.age != null && String(m.age).trim() !== "") s += 2;
  if (cleanText(m.sex)) s += 2;
  if (m.tobacco != null && String(m.tobacco).trim() !== "") s += 2;
  return s;
}

function pickBestManychatRow(rows) {
  const list = (rows || []).filter(Boolean);
  if (!list.length) return null;
  return list
    .map((m) => ({ m, score: manychatRowRichnessScore(m) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ua = String(a.m.updated_at || a.m.created_at || "");
      const ub = String(b.m.updated_at || b.m.created_at || "");
      return ub.localeCompare(ua);
    })[0]?.m || null;
}

async function selectManychatRowsByPhone(cfg, phoneRaw) {
  const variants = hubspotPhoneSearchVariants(phoneRaw);
  if (!variants.length) return [];
  const values = pgInListQuoted(variants);
  const baseQ = `select=${MANYCHAT_DETAIL_COLUMNS}&phone=in.(${values})&order=updated_at.desc&limit=80`;
  try {
    return await restSelect(cfg, "manychat_leads", `staff_hidden_at=is.null&${baseQ}`);
  } catch (e) {
    if (isStaffHiddenColumnError(e && e.message)) {
      return await restSelect(cfg, "manychat_leads", baseQ);
    }
    throw e;
  }
}

/**
 * Unified list can show contacts id while ManyChat holds names/age/PHI; list also enriches email from contacts only.
 * Merge sibling row by phone so Lead Profile matches what staff expect from WhatsApp.
 * @returns {{ detail: object, alternateLeadKeys: { lead_id: string, lead_source_table: string }[] }}
 */
async function mergeCrossSourceByPhone(cfg, detail) {
  if (!detail || !detail.source_table) return { detail, alternateLeadKeys: [] };
  const phone = cleanText(detail.phone);
  if (!phone) return { detail, alternateLeadKeys: [] };
  const src = String(detail.source_table || "");
  const alternates = [];

  try {
    if (src === "manychat_leads") {
      const candidates = [];
      const sub = cleanText(detail.manychat_subscriber_id);
      if (sub) {
        const bySub = await selectContactsRowsBySubscriberId(cfg, sub);
        (bySub || []).forEach((x) => candidates.push(x));
      }
      if (phone) {
        const byPhone = await selectContactsRowsByPhone(cfg, phone);
        (byPhone || []).forEach((x) => candidates.push(x));
      }
      const byEmail = await selectContactsRowByEmail(cfg, detail.email);
      if (byEmail) candidates.push(byEmail);
      const c = pickBestContactForManychatLead(detail, candidates);
      if (c && c.id && String(c.id) !== String(detail.id)) {
        const ls = await selectLeadStatePipelineOverlay(cfg, c.id);
        const pipeline = buildManychatToContactsPipelinePatch(c, ls);
        const patch = {};
        const em = cleanText(c.email);
        if (em) patch.email = em;
        const fn = cleanText(c.first_name);
        if (fn) patch.first_name = fn;
        const ln = cleanText(c.last_name);
        if (ln) patch.last_name = ln;
        Object.assign(patch, pipeline);
        let merged = mergePreferSource(detail, patch);
        if (patch.profile_ext && patch.profile_ext.state) {
          const ext = merged.profile_ext && typeof merged.profile_ext === "object" ? merged.profile_ext : {};
          if (isBlankValue(ext.state)) {
            merged = Object.assign({}, merged, {
              profile_ext: Object.assign({}, ext, { state: patch.profile_ext.state }),
            });
          }
        }
        alternates.push({ lead_id: String(c.id), lead_source_table: "contacts" });
        return { detail: merged, alternateLeadKeys: alternates };
      }
    }
    if (src === "contacts") {
      const rows = await selectManychatRowsByPhone(cfg, phone);
      const m = pickBestManychatRow(rows);
      if (m && m.id) {
        const patch = {};
        const em = cleanText(m.email);
        if (em) patch.email = em;
        const fn = cleanText(m.first_name);
        if (fn) patch.first_name = fn;
        const ln = cleanText(m.last_name);
        if (ln) patch.last_name = ln;
        if (m.age != null && String(m.age).trim() !== "") patch.age = m.age;
        const sx = cleanText(m.sex);
        if (sx) patch.sex = sx;
        if (m.tobacco != null && String(m.tobacco).trim() !== "") patch.tobacco = toBoolOrNullFromText(m.tobacco);
        const tg = cleanText(m.tag);
        if (tg) patch.tag = tg;
        const ps = cleanText(m.pipeline_stage);
        if (ps) patch.pipeline_stage = ps;
        if (m.drop_off === true || m.drop_off === false) patch.drop_off = !!m.drop_off;
        const ds = cleanText(m.drop_off_stage);
        if (ds) patch.drop_off_stage = ds;
        if (m.opt_in === true || m.opt_in === false) patch.opt_in = !!m.opt_in;
        if (m.opt_in_at) patch.opt_in_at = m.opt_in_at;
        const sub = cleanText(detail.manychat_subscriber_id) || cleanText(m.manychat_subscriber_id);
        if (sub) patch.manychat_subscriber_id = sub;
        alternates.push({ lead_id: String(m.id), lead_source_table: "manychat_leads" });
        return { detail: mergePreferSource(detail, patch), alternateLeadKeys: alternates };
      }
    }
  } catch (e) {
    console.error("staff/leads mergeCrossSourceByPhone", e && e.message);
  }
  return { detail, alternateLeadKeys: alternates };
}

function ensureManychatLeadDetail(row) {
  if (!row) return null;
  const o = Object.assign({ read_only: false, source_table: "manychat_leads" }, row);
  o.display_name = displayName(o);
  return o;
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
    const last10Set = new Set();
    const variantSet = new Set();
    chunk.forEach((p) => {
      const t = phoneLast10Digits(p);
      if (t) last10Set.add(t);
      hubspotPhoneSearchVariants(p).forEach((v) => variantSet.add(v));
    });
    const last10In = last10Set.size ? pgInListQuoted(Array.from(last10Set)) : "";
    const idValues = variantSet.size ? pgInListQuoted(Array.from(variantSet)) : "";
    const orParts = [];
    if (last10In) orParts.push(`phone_last_10.in.(${last10In})`);
    if (idValues) {
      orParts.push(`phone.in.(${idValues})`);
      orParts.push(`whatsapp_id.in.(${idValues})`);
      orParts.push(`manychat_subscriber_id.in.(${idValues})`);
    }
    if (!orParts.length) continue;
    const contacts = await restSelect(
      cfg,
      "contacts",
      `select=id,email,phone,whatsapp_id,manychat_subscriber_id,created_at&or=(${orParts.join(
        ","
      )})&order=created_at.desc&limit=400`
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
    res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    const detailId = String((req.query && req.query.id) || "").trim();
    if (detailId && isUuid(detailId)) {
      try {
        const unified = await selectUnifiedLeadById(cfg, detailId);
        if (!unified) return json(res, 404, { error: "Lead not found" });
        const src = String(unified.source_table || "");
        if (src === "manychat_leads") {
          const row = await selectManychatLeadDetailById(cfg, detailId);
          const base = ensureManychatLeadDetail(row);
          if (!base) return json(res, 404, { error: "Lead not found" });
          const cross = await mergeCrossSourceByPhone(cfg, base);
          const detail = await composeMergedLeadDetail(cfg, cross.detail, {
            alternateLeadKeys: cross.alternateLeadKeys,
          });
          if (canPhi) {
            detail.phi = await readPhiMergedForLead(cfg, detailId, src, cross.alternateLeadKeys);
          }
          enrichDetailTopLevelFromPhi(detail);
          return json(res, 200, { detail, can_access_phi: canPhi });
        }
        if (src === "contacts") {
          const sourceDetail = await selectContactsLeadDetailById(cfg, detailId);
          if (!sourceDetail) return json(res, 404, { error: "Lead not found" });
          const cross = await mergeCrossSourceByPhone(cfg, sourceDetail);
          const detail = await composeMergedLeadDetail(cfg, cross.detail, {
            alternateLeadKeys: cross.alternateLeadKeys,
          });
          if (canPhi) {
            detail.phi = await readPhiMergedForLead(cfg, detailId, src, cross.alternateLeadKeys);
          }
          enrichDetailTopLevelFromPhi(detail);
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
          enrichDetailTopLevelFromPhi(detail);
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
        enrichDetailTopLevelFromPhi(merged);
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
      let items = (rows || []).map((r) => buildListItemFromRow(r));
      try {
        items = await enrichListItemsWithStaffProfiles(cfg, items);
      } catch (e) {
        console.error("staff/leads GET enrichListItemsWithStaffProfiles", e);
      }
      try {
        await enrichLeadEmailsFromContacts(cfg, items);
      } catch (e) {
        console.error("staff/leads GET enrichLeadEmailsFromContacts", e);
      }
      items.sort((x, y) => sortKey(x).localeCompare(sortKey(y)));
      return json(res, 200, { items });
    } catch (e) {
      console.error("staff/leads GET", e);
      const msg = (e && e.message) || String(e);
      await logIntegrationAudit(cfg.supabaseUrl, cfg.serviceKey, {
        stage: "staff_leads_list_error",
        endpoint: "/api/staff/leads",
        outcome: "error",
        message: msg,
        detail: { where: "GET_list" },
      });
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

      let detail = null;
      let cross = { detail: null, alternateLeadKeys: [] };
      if (src === "manychat_leads") {
        const row = await selectManychatLeadDetailById(cfg, id);
        const base = ensureManychatLeadDetail(row);
        if (base) {
          cross = await mergeCrossSourceByPhone(cfg, base);
          detail = cross.detail;
        } else {
          detail = null;
        }
      } else if (src === "contacts") {
        const base = await selectContactsLeadDetailById(cfg, id);
        if (base) {
          cross = await mergeCrossSourceByPhone(cfg, base);
          detail = cross.detail;
        } else {
          detail = null;
        }
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
      const mergedDetail = detail
        ? await composeMergedLeadDetail(cfg, detail, { alternateLeadKeys: cross.alternateLeadKeys || [] })
        : null;
      if (mergedDetail && canPhi) {
        mergedDetail.phi = await readPhiMergedForLead(cfg, id, src || "unknown", cross.alternateLeadKeys || []);
      }
      if (mergedDetail) enrichDetailTopLevelFromPhi(mergedDetail);

      const canonicalAfterSave = await loadCanonicalLeadProfile(cfg, id, src || "unknown");
      const one = buildListItemFromRow(unified, canonicalAfterSave);
      try {
        await enrichLeadEmailsFromContacts(cfg, [one]);
      } catch (e) {
        console.error("staff/leads PATCH enrichLeadEmailsFromContacts", e);
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
      const unified = await resolveLeadRowForDelete(cfg, id);
      if (!unified) return json(res, 404, { error: "Lead not found" });
      const src = String(unified.source_table || "");
      await hardDeleteUnifiedSourceRow(cfg, unified);
      await logIntegrationAudit(cfg.supabaseUrl, cfg.serviceKey, {
        stage: "staff_lead_hard_delete",
        endpoint: "/api/staff/leads",
        outcome: "ok",
        detail: { source_table: src, deleted_id: id },
      });
      return json(res, 200, { ok: true, id, source_table: src, deleted: true });
    } catch (e) {
      console.error("staff/leads DELETE", e);
      const msg = e && e.message ? String(e.message) : "Failed to delete lead";
      if (/not implemented for source table/i.test(msg)) {
        return json(res, 400, { error: msg });
      }
      if (/23503|foreign key|violates/i.test(msg)) {
        return json(res, 409, {
          error:
            "Cannot delete this lead while other database rows still reference it. Remove dependents or delete from Supabase SQL.",
        });
      }
      return json(res, 500, {
        error: "Failed to delete lead",
        detail: msg.length > 400 ? `${msg.slice(0, 400)}…` : msg,
      });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return json(res, 405, { error: "Method Not Allowed" });
};
