const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");

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
          return json(res, 200, { detail: Object.assign({ read_only: false }, row) });
        }
        if (src === "contacts") {
          const detail = await selectContactsLeadDetailById(cfg, detailId);
          if (!detail) return json(res, 404, { error: "Lead not found" });
          return json(res, 200, { detail });
        }
        if (src === "quote_lead_submissions") {
          const detail = await selectQuoteLeadDetailById(cfg, detailId);
          if (!detail) return json(res, 404, { error: "Lead not found" });
          return json(res, 200, { detail });
        }
        return json(res, 200, {
          detail: {
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
          },
        });
      } catch (e) {
        console.error("staff/leads GET id", e);
        return json(res, 500, { error: "Failed to load lead" });
      }
    }

    try {
      // Keep old migration check so staff still gets a useful error if manychat schema is stale.
      await selectManychatLeadsForStaff(cfg);
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
      await enrichLeadEmailsFromContacts(cfg, items);
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

      if (src === "manychat_leads") {
        const patched = await restPatch(cfg, "manychat_leads", `id=eq.${encodeURIComponent(id)}`, payload);
        if (!Array.isArray(patched) || patched.length === 0) {
          return json(res, 404, { error: "Lead not found" });
        }
        const row = patched[0];
        const one = {
          id: row.id,
          first_name: row.first_name || "",
          last_name: row.last_name || "",
          display_name: displayName(row),
          phone: row.phone || "",
          email: String(row.email || "").trim(),
          language: row.language || "English",
          source: row.source || "manychat_whatsapp",
          source_table: "manychat_leads",
        };
        await enrichLeadEmailsFromContacts(cfg, [one]);
        let detail = null;
        try {
          detail = await selectManychatLeadDetailById(cfg, id);
        } catch (e2) {
          detail = null;
        }
        return json(res, 200, {
          item: one,
          detail: detail ? Object.assign({ read_only: false }, detail) : undefined,
        });
      }

      if (src === "contacts") {
        const langRaw = String(body.language || unified.language || "english").trim().toLowerCase();
        const lang = langRaw.startsWith("es") ? "spanish" : "english";
        const contactsPayload = {
          updated_at: now,
          first_name: String(body.first_name || "").trim().slice(0, 200) || null,
          last_name: String(body.last_name || "").trim().slice(0, 200) || null,
          email: hasEmailKey ? emailIn || null : String(unified.email || "").trim() || null,
          phone: String(body.phone || unified.phone || "").trim().slice(0, 60) || null,
          language: lang,
          idioma: lang,
          source: String(body.source || unified.source || "contacts").trim().slice(0, 120) || "contacts",
        };
        if (Object.prototype.hasOwnProperty.call(body, "manychat_subscriber_id")) {
          contactsPayload.manychat_subscriber_id = payload.manychat_subscriber_id || null;
        }
        const patched = await restPatch(cfg, "contacts", `id=eq.${encodeURIComponent(id)}`, contactsPayload);
        if (!Array.isArray(patched) || patched.length === 0) return json(res, 404, { error: "Lead not found" });
        const row = patched[0];
        const one = {
          id: row.id,
          first_name: row.first_name || "",
          last_name: row.last_name || "",
          display_name: displayName(row),
          phone: row.phone || "",
          email: String(row.email || "").trim(),
          language: row.idioma || row.language || "english",
          source: row.source || "contacts",
          source_table: "contacts",
        };
        return json(res, 200, { item: one, detail: await selectContactsLeadDetailById(cfg, id) });
      }

      if (src === "quote_lead_submissions") {
        const quotePayload = {};
        if (Object.prototype.hasOwnProperty.call(body, "first_name")) {
          quotePayload.first_name = payload.first_name || null;
        }
        if (Object.prototype.hasOwnProperty.call(body, "last_name")) {
          quotePayload.last_name = payload.last_name || null;
        }
        if (Object.prototype.hasOwnProperty.call(body, "email")) {
          quotePayload.email = payload.email || null;
        }
        if (Object.prototype.hasOwnProperty.call(body, "phone")) {
          quotePayload.phone = payload.phone || null;
        }
        if (Object.prototype.hasOwnProperty.call(body, "language")) {
          quotePayload.lang = payload.language || "English";
        }
        if (Object.prototype.hasOwnProperty.call(body, "age")) {
          quotePayload.age = payload.age == null ? null : payload.age;
        }
        if (Object.prototype.hasOwnProperty.call(body, "sex")) {
          quotePayload.gender = payload.sex || null;
        }
        if (Object.prototype.hasOwnProperty.call(body, "tobacco")) {
          if (payload.tobacco == null) quotePayload.tobacco = null;
          else quotePayload.tobacco = payload.tobacco ? "yes" : "no";
        }
        if (Object.prototype.hasOwnProperty.call(body, "source")) {
          quotePayload.source = payload.source || null;
        }
        if (Object.prototype.hasOwnProperty.call(body, "pipeline_stage")) {
          quotePayload.quote_status = payload.pipeline_stage || null;
        }
        const patched = await restPatch(
          cfg,
          "quote_lead_submissions",
          `id=eq.${encodeURIComponent(id)}`,
          quotePayload
        );
        if (!Array.isArray(patched) || patched.length === 0) return json(res, 404, { error: "Lead not found" });
        const row = patched[0];
        const one = {
          id: row.id,
          first_name: row.first_name || "",
          last_name: row.last_name || "",
          display_name: displayName(row),
          phone: row.phone || "",
          email: String(row.email || "").trim(),
          language: row.lang || "English",
          source: row.source || "website_quote_tool",
          source_table: "quote_lead_submissions",
        };
        return json(res, 200, { item: one, detail: await selectQuoteLeadDetailById(cfg, id) });
      }

      return json(res, 400, {
        error: `This lead source is read-only (${src || "unknown"}).`,
      });
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
