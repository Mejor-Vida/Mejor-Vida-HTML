/**
 * Create or resolve a v2 `contacts` row for staff CRM leads and persist the link
 * on `staff_lead_profiles.profile_data` (contacts_contact_id / contact_id).
 */
const crypto = require("crypto");
const { resolveContactForPipeline } = require("./_contact-resolve");
const { restSelect, restInsert, restPatch } = require("./_inbox-lib");
const {
  upsertContact,
  insertContact,
  updateContact,
  upsertLeadState,
} = require("../../lib/contacts-db");

const UNRESOLVED_TEMPLATE = /^\{\{[\s\S]*\}\}$/;

function cleanText(v) {
  const s = String(v == null ? "" : v).trim();
  if (!s || UNRESOLVED_TEMPLATE.test(s)) return "";
  return s;
}

function normalizeEmail(v) {
  const s = cleanText(v).toLowerCase();
  return s && s.includes("@") ? s : "";
}

function mapStaffLanguage(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (["en", "english", "ingles", "inglés"].includes(s)) return "english";
  if (["es", "spanish", "espanol", "español"].includes(s)) return "spanish";
  return "english";
}

function phonePlaceholderFromEmail(email) {
  const h = crypto.createHash("sha256").update(String(email || "").toLowerCase()).digest("hex");
  const suffix = String(parseInt(h.slice(0, 8), 16) % 10000000).padStart(7, "0");
  return `+1999${suffix}`;
}

async function getContactByEmail(cfg, emailRaw) {
  const em = normalizeEmail(emailRaw);
  if (!em) return null;
  const rows = await restSelect(
    cfg,
    "contacts",
    `select=id,phone,email,first_name,last_name,manychat_subscriber_id,whatsapp_id&email=eq.${encodeURIComponent(
      em
    )}&order=updated_at.desc&limit=5`
  );
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function saveContactIdsOnStaffProfile(cfg, leadId, leadSourceTable, contactId, updatedBy) {
  if (!leadId || !leadSourceTable || !contactId) return null;
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=id,profile_data&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
      leadSourceTable
    )}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  const now = new Date().toISOString();
  const existingProfile = row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
  const nextProfile = Object.assign({}, existingProfile, {
    contacts_contact_id: String(contactId),
    contact_id: String(contactId),
  });
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
  return await restPatch(cfg, "staff_lead_profiles", `id=eq.${encodeURIComponent(row.id)}`, {
    profile_data: nextProfile,
    updated_at: now,
    updated_by: updatedBy || null,
  });
}

function buildContactPatch(hints) {
  const patch = {
    source: cleanText(hints.source) || "staff_crm",
    language: mapStaffLanguage(hints.language),
    us_state: cleanText(hints.us_state || (hints.profile_ext && hints.profile_ext.state) || "NE")
      .toUpperCase()
      .slice(0, 2) || "NE",
  };
  const fn = cleanText(hints.first_name);
  const ln = cleanText(hints.last_name);
  const em = normalizeEmail(hints.email);
  const sub = cleanText(hints.manychat_subscriber_id || hints.manychatSubscriberId);
  if (fn) patch.first_name = fn;
  if (ln) patch.last_name = ln;
  if (em) patch.email = em;
  if (sub) {
    patch.manychat_subscriber_id = sub;
    patch.whatsapp_id = sub;
  }
  return patch;
}

/**
 * Find or create a `contacts` row from staff lead hints.
 * @returns {{ contactId: string|null, created: boolean }}
 */
async function ensureContactRecord(cfg, hints) {
  hints = hints || {};
  const phone = cleanText(hints.phone);
  const email = normalizeEmail(hints.email);
  const subscriberId = cleanText(hints.manychat_subscriber_id || hints.manychatSubscriberId);
  if (!phone && !email && !subscriberId) {
    return { contactId: null, created: false };
  }

  const { supabaseUrl, serviceKey } = cfg;
  const contactPatch = buildContactPatch(hints);

  const existing = await resolveContactForPipeline(cfg, {
    contactId: hints.contactId || hints.contacts_contact_id,
    phone,
    email,
    manychatSubscriberId: subscriberId,
  });
  if (existing && existing.id) {
    await updateContact(supabaseUrl, serviceKey, existing.id, contactPatch);
    return { contactId: existing.id, created: false };
  }

  if (phone) {
    const { contactId, created } = await upsertContact(supabaseUrl, serviceKey, phone, contactPatch);
    return { contactId, created: !!created };
  }

  if (email) {
    const byEmail = await getContactByEmail(cfg, email);
    if (byEmail && byEmail.id) {
      await updateContact(supabaseUrl, serviceKey, byEmail.id, contactPatch);
      return { contactId: byEmail.id, created: false };
    }
    const row = await insertContact(supabaseUrl, serviceKey, {
      phone: phonePlaceholderFromEmail(email),
      email,
      ...contactPatch,
    });
    return { contactId: row.id, created: true };
  }

  if (subscriberId) {
    const row = await insertContact(supabaseUrl, serviceKey, {
      phone: `+1998${String(parseInt(subscriberId.replace(/\D/g, "").slice(-7) || "0", 10) % 10000000).padStart(7, "0")}`,
      manychat_subscriber_id: subscriberId,
      whatsapp_id: subscriberId,
      ...contactPatch,
    });
    return { contactId: row.id, created: true };
  }

  return { contactId: null, created: false };
}

async function ensureLeadStateForContact(cfg, contactId, hints) {
  const rawStage = cleanText(hints.pipeline_stage) || "new_contact";
  const pipelineStage = rawStage === "new" ? "new_contact" : rawStage;
  await upsertLeadState(cfg.supabaseUrl, cfg.serviceKey, contactId, { pipeline_stage: pipelineStage });
}

/**
 * Link a staff CRM lead to the v2 contacts table (create row if needed).
 * @returns {{ linked: boolean, contactId: string|null, created?: boolean, reason?: string }}
 */
async function linkLeadToContacts(cfg, opts) {
  opts = opts || {};
  const phone = cleanText(opts.phone);
  const email = normalizeEmail(opts.email);
  const subscriberId = cleanText(opts.manychat_subscriber_id || opts.manychatSubscriberId);
  if (!phone && !email && !subscriberId) {
    return { linked: false, contactId: null, reason: "no_lookup_hints" };
  }

  const result = await ensureContactRecord(cfg, opts);
  if (!result.contactId) {
    return { linked: false, contactId: null, reason: "create_failed" };
  }

  try {
    await ensureLeadStateForContact(cfg, result.contactId, opts);
  } catch (e) {
    console.error("[contact-link] lead_state upsert", e && e.message ? e.message : e);
  }

  if (!opts.skipProfileSave && opts.leadId && opts.leadSourceTable) {
    await saveContactIdsOnStaffProfile(
      cfg,
      opts.leadId,
      opts.leadSourceTable,
      result.contactId,
      opts.updatedBy || null
    );
  }

  return { linked: true, contactId: result.contactId, created: !!result.created };
}

module.exports = {
  linkLeadToContacts,
  ensureContactRecord,
  saveContactIdsOnStaffProfile,
};
