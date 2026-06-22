/**
 * Meta (Facebook) Lead Ads / Instant Forms → Supabase + IC email + optional HubSpot.
 *
 * Webhook receives leadgen_id; full lead is fetched via Graph API (leads_retrieval).
 */

const crypto = require("crypto");
const { sendQuoteLeadNotification } = require("./ic-lead-notify");

const LEAD_SOURCE = "facebook_instant_form";
const GRAPH_VERSION = "v21.0";

const FIELD_ALIASES = {
  firstName: [
    "first_name",
    "firstname",
    "nombre",
    "first name",
    "nombre (requerido)",
  ],
  lastName: [
    "last_name",
    "lastname",
    "apellido",
    "last name",
    "apellido (requerido)",
  ],
  fullName: ["full_name", "full name", "nombre_completo", "nombre completo", "name"],
  email: ["email", "correo", "correo_electrónico", "correo electronico", "e-mail"],
  phone: [
    "phone",
    "phone_number",
    "teléfono",
    "telefono",
    "número_de_teléfono",
    "numero_de_telefono",
    "mobile",
    "mobile_phone",
  ],
  age: ["age", "edad", "your_age"],
  sex: ["gender", "sex", "sexo", "género", "genero"],
  smoker: ["tobacco", "smoker", "tabaco", "¿fuma?", "fuma", "do_you_smoke"],
  state: ["state", "estado", "state_code"],
  zip: ["zip", "zip_code", "código_postal", "codigo_postal", "postal_code"],
  city: ["city", "ciudad"],
};

function normalizeFieldKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function fieldMapFromLeadData(fieldData) {
  const out = {};
  if (!Array.isArray(fieldData)) return out;
  for (const row of fieldData) {
    const key = normalizeFieldKey(row && row.name);
    const val =
      row && Array.isArray(row.values) && row.values[0] != null
        ? String(row.values[0]).trim()
        : "";
    if (key && val) out[key] = val;
  }
  return out;
}

function pickField(map, aliases) {
  for (const alias of aliases) {
    const k = normalizeFieldKey(alias);
    if (map[k]) return map[k];
  }
  return "";
}

function splitFullName(full) {
  const t = String(full || "").trim();
  if (!t) return { firstName: "", lastName: "" };
  const sp = t.indexOf(" ");
  if (sp === -1) return { firstName: t.slice(0, 200), lastName: "" };
  return {
    firstName: t.slice(0, sp).trim().slice(0, 200),
    lastName: t.slice(sp + 1).trim().slice(0, 200),
  };
}

function parseAge(raw) {
  const n = parseInt(String(raw || "").replace(/\D/g, ""), 10);
  if (!Number.isFinite(n) || n < 1 || n > 120) return null;
  return n;
}

function parseSex(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (["male", "m", "hombre", "masculino", "man"].includes(s)) return "male";
  if (["female", "f", "mujer", "femenino", "woman"].includes(s)) return "female";
  return s ? String(raw).trim().slice(0, 50) : null;
}

function parseSmoker(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (["yes", "si", "sí", "true", "1", "smoker", "fumo", "fuma"].includes(s)) return true;
  if (["no", "false", "0", "non-smoker", "nonsmoker", "no fumo"].includes(s)) return false;
  return null;
}

function mapLeadgenFields(fieldData) {
  const map = fieldMapFromLeadData(fieldData);
  let firstName = pickField(map, FIELD_ALIASES.firstName);
  let lastName = pickField(map, FIELD_ALIASES.lastName);
  if (!firstName && !lastName) {
    const split = splitFullName(pickField(map, FIELD_ALIASES.fullName));
    firstName = split.firstName;
    lastName = split.lastName;
  }
  return {
    firstName,
    lastName,
    email: pickField(map, FIELD_ALIASES.email).toLowerCase().slice(0, 500),
    phone: pickField(map, FIELD_ALIASES.phone).slice(0, 40),
    age: parseAge(pickField(map, FIELD_ALIASES.age)),
    sex: parseSex(pickField(map, FIELD_ALIASES.sex)),
    smoker: parseSmoker(pickField(map, FIELD_ALIASES.smoker)),
    state: pickField(map, FIELD_ALIASES.state).slice(0, 2).toUpperCase() || null,
    zip: pickField(map, FIELD_ALIASES.zip).slice(0, 10) || null,
    city: pickField(map, FIELD_ALIASES.city).slice(0, 120) || null,
    rawFieldMap: map,
  };
}

function verifyHubSignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret) return { ok: false, reason: "missing_app_secret" };
  const sig = String(signatureHeader || "").trim();
  if (!sig.startsWith("sha256=")) return { ok: false, reason: "bad_signature_header" };
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const got = sig.slice("sha256=".length);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(got, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false, reason: "signature_mismatch" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "signature_mismatch" };
  }
}

function parseWebhookEntries(body) {
  if (!body || body.object !== "page" || !Array.isArray(body.entry)) return [];
  const leads = [];
  for (const entry of body.entry) {
    const pageId = entry && entry.id ? String(entry.id) : "";
    const changes = Array.isArray(entry && entry.changes) ? entry.changes : [];
    for (const ch of changes) {
      if (!ch || ch.field !== "leadgen") continue;
      const v = ch.value || {};
      const leadgenId = v.leadgen_id ? String(v.leadgen_id) : "";
      if (!leadgenId) continue;
      leads.push({
        leadgenId,
        pageId,
        formId: v.form_id ? String(v.form_id) : null,
        adId: v.ad_id ? String(v.ad_id) : null,
        adgroupId: v.adgroup_id ? String(v.adgroup_id) : null,
        createdTime: v.created_time != null ? Number(v.created_time) : null,
      });
    }
  }
  return leads;
}

async function fetchLeadgenFromGraph(leadgenId, accessToken) {
  const fields = [
    "created_time",
    "field_data",
    "ad_id",
    "form_id",
    "campaign_id",
    "platform",
    "is_organic",
  ].join(",");
  const url =
    `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(leadgenId)}` +
    `?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;
  const r = await fetch(url, { method: "GET" });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Graph leadgen ${r.status}: ${text.slice(0, 400)}`);
  }
  return JSON.parse(text);
}

async function supabaseGetJson(supabaseUrl, serviceKey, path) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1${path}`;
  const r = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase GET ${path}: ${r.status} ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function supabaseInsert(supabaseUrl, serviceKey, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_lead_submissions`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase insert ${r.status}: ${text.slice(0, 500)}`);
  const data = JSON.parse(text);
  const first = Array.isArray(data) ? data[0] : data;
  return first && first.id ? String(first.id) : null;
}

async function supabasePatch(supabaseUrl, serviceKey, id, fields) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_lead_submissions?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(fields),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase patch ${r.status}: ${t.slice(0, 300)}`);
  }
}

async function findExistingLeadId(supabaseUrl, serviceKey, leadgenId) {
  const q =
    `/quote_lead_submissions?source=eq.${LEAD_SOURCE}` +
    `&payload->>meta_leadgen_id=eq.${encodeURIComponent(leadgenId)}` +
    `&select=id&limit=1`;
  const rows = await supabaseGetJson(supabaseUrl, serviceKey, q);
  if (Array.isArray(rows) && rows[0] && rows[0].id) return String(rows[0].id);
  return null;
}

async function hubspotFindContactByEmail(token, email) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
      limit: 1,
      properties: ["email", "firstname", "lastname", "phone"],
    }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  const row = data.results && data.results[0];
  return row ? String(row.id) : null;
}

async function hubspotCreateContact(token, properties) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`HubSpot create ${r.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  return data.id ? String(data.id) : null;
}

async function hubspotUpdateContact(token, id, properties) {
  const r = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HubSpot patch ${r.status}: ${t.slice(0, 400)}`);
  }
}

/**
 * Process one leadgen_id: fetch from Meta, insert Supabase, IC email, HubSpot.
 */
async function processLeadgenEvent(meta, options = {}) {
  const supabaseUrl = options.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = options.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pageToken =
    options.pageAccessToken ||
    process.env.META_LEADGEN_PAGE_ACCESS_TOKEN ||
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const hubspotToken = options.hubspotToken || process.env.HUBSPOT_ACCESS_TOKEN;
  const defaultLang = String(process.env.META_LEADGEN_DEFAULT_LANG || "es").slice(0, 2) === "en" ? "en" : "es";

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase not configured");
  }
  if (!pageToken) {
    throw new Error("Missing META_LEADGEN_PAGE_ACCESS_TOKEN or FACEBOOK_PAGE_ACCESS_TOKEN");
  }

  const leadgenId = String(meta.leadgenId || "").trim();
  if (!leadgenId) throw new Error("leadgen_id required");

  const expectedPageId = String(process.env.FACEBOOK_PAGE_ID || "").trim();
  if (expectedPageId && meta.pageId && String(meta.pageId) !== expectedPageId) {
    throw new Error(`Page id mismatch (got ${meta.pageId}, expected ${expectedPageId})`);
  }

  const existingId = await findExistingLeadId(supabaseUrl, serviceKey, leadgenId);
  if (existingId) {
    return { ok: true, duplicate: true, id: existingId, leadgenId };
  }

  const graphLead = await fetchLeadgenFromGraph(leadgenId, pageToken);
  const mapped = mapLeadgenFields(graphLead.field_data);

  if (!mapped.firstName) {
    mapped.firstName = "Facebook";
  }
  if (!mapped.lastName) {
    mapped.lastName = "Lead";
  }

  const nowIso = new Date().toISOString();
  const originDetail = {
    meta_leadgen_id: leadgenId,
    form_id: graphLead.form_id || meta.formId || null,
    ad_id: graphLead.ad_id || meta.adId || null,
    campaign_id: graphLead.campaign_id || null,
    platform: graphLead.platform || null,
    is_organic: graphLead.is_organic === true,
    page_id: meta.pageId || expectedPageId || null,
    lead_source: LEAD_SOURCE,
  };

  const quoteSummary = [
    "Facebook Instant Form lead",
    originDetail.form_id ? `Form: ${originDetail.form_id}` : null,
    originDetail.ad_id ? `Ad: ${originDetail.ad_id}` : null,
    originDetail.campaign_id ? `Campaign: ${originDetail.campaign_id}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const payload = {
    firstName: mapped.firstName,
    lastName: mapped.lastName,
    email: mapped.email || null,
    phone: mapped.phone || null,
    age: mapped.age,
    sex: mapped.sex,
    smoker: mapped.smoker,
    state: mapped.state,
    zip: mapped.zip,
    city: mapped.city,
    lang: defaultLang,
    source: LEAD_SOURCE,
    meta_leadgen_id: leadgenId,
    submittedAt: nowIso,
    originDetail,
  };

  const insertRow = {
    source: LEAD_SOURCE,
    first_name: mapped.firstName,
    last_name: mapped.lastName,
    email: mapped.email || null,
    phone: mapped.phone || null,
    age: mapped.age,
    gender: mapped.sex,
    tobacco: mapped.smoker === true ? "yes" : mapped.smoker === false ? "no" : null,
    state_code: mapped.state,
    zip: mapped.zip,
    lang: defaultLang,
    quote_summary: quoteSummary,
    consent_summary: {
      facebookInstantForm: true,
      marketingOptIn: { sms: false, email: true, phoneCalls: true },
      at: nowIso,
      lang: defaultLang,
    },
    payload,
    request_raw: {
      leadgen: meta,
      graph: {
        created_time: graphLead.created_time,
        field_data: graphLead.field_data,
        ad_id: graphLead.ad_id,
        form_id: graphLead.form_id,
        campaign_id: graphLead.campaign_id,
      },
      mapped,
    },
    quote_status: "quote_requested",
    crm_sync_needed: true,
    origin_detail: originDetail,
  };

  const leadId = await supabaseInsert(supabaseUrl, serviceKey, insertRow);

  let hubspotContactId = null;
  let hubspotErr = null;
  if (hubspotToken && mapped.email) {
    const hsProps = {
      email: mapped.email,
      firstname: mapped.firstName,
      lastname: mapped.lastName,
      lead_source_detail: LEAD_SOURCE,
    };
    if (mapped.phone) hsProps.phone = mapped.phone;
    if (mapped.state) hsProps.state = mapped.state;
    try {
      const existing = await hubspotFindContactByEmail(hubspotToken, mapped.email);
      if (existing) {
        await hubspotUpdateContact(hubspotToken, existing, hsProps);
        hubspotContactId = existing;
      } else {
        hubspotContactId = await hubspotCreateContact(hubspotToken, hsProps);
      }
    } catch (e) {
      hubspotErr = e.message || String(e);
      console.error("[meta-leadgen] hubspot", e);
    }
    if (leadId) {
      try {
        await supabasePatch(supabaseUrl, serviceKey, leadId, {
          hubspot_contact_id: hubspotContactId,
          hubspot_sync_status: hubspotContactId ? "synced" : "failed",
          hubspot_sync_error: hubspotErr,
          crm_sync_needed: !hubspotContactId,
          hubspot_last_sync_at: hubspotContactId ? nowIso : null,
        });
      } catch (e) {
        console.error("[meta-leadgen] supabase patch hubspot", e);
      }
    }
  }

  await sendQuoteLeadNotification({
    leadSource: LEAD_SOURCE,
    firstName: mapped.firstName,
    lastName: mapped.lastName,
    email: mapped.email,
    phone: mapped.phone,
    age: mapped.age,
    sex: mapped.sex,
    smoker: mapped.smoker,
    state: mapped.state,
    zip: mapped.zip,
    city: mapped.city,
    lang: defaultLang,
    leadId,
    hubspotContactId,
    submittedAt: nowIso,
    originDetail,
    quoteSummary,
  });

  return {
    ok: true,
    duplicate: false,
    id: leadId,
    leadgenId,
    hubspotContactId,
    hubspotError: hubspotErr,
  };
}

module.exports = {
  LEAD_SOURCE,
  FIELD_ALIASES,
  normalizeFieldKey,
  mapLeadgenFields,
  verifyHubSignature,
  parseWebhookEntries,
  fetchLeadgenFromGraph,
  processLeadgenEvent,
};
