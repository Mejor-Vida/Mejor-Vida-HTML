/**
 * CTWA referral → contacts.meta_ad_id / meta_ctwa_clid (first-touch only).
 * Pending rows bridge webhook-before-lead-intake ordering.
 */

const {
  getContactByPhone,
  updateContact,
} = require("./contacts-db");
const { recordWhatsappConversationStart } = require("./whatsapp-conversation-hours");

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function normalizeWaId(v) {
  const d = digitsOnly(v);
  return d.length >= 8 && d.length <= 15 ? d : "";
}

function phoneE164FromWa(waId) {
  const d = normalizeWaId(waId);
  if (!d) return "";
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return `+${d}`;
}

function phoneLast10(waId) {
  const d = normalizeWaId(waId);
  return d.length >= 10 ? d.slice(-10) : "";
}

function normalizeMetaAdId(raw) {
  const id = digitsOnly(raw);
  if (id.length < 8 || id.length > 24) return "";
  return id;
}

function normalizeCtwaClid(raw) {
  const s = String(raw || "").trim();
  if (s.length < 8 || s.length > 512) return "";
  if (!/^[A-Za-z0-9._~+/=-]+$/.test(s)) return "";
  return s;
}

function restHeaders(serviceKey, prefer) {
  const h = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

function base(supabaseUrl) {
  return supabaseUrl.replace(/\/$/, "") + "/rest/v1";
}

async function restSelect(supabaseUrl, serviceKey, path) {
  const r = await fetch(`${base(supabaseUrl)}${path}`, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase GET ${path}: ${r.status} ${text.slice(0, 200)}`);
  return JSON.parse(text || "[]");
}

async function restInsert(supabaseUrl, serviceKey, table, row, prefer) {
  const r = await fetch(`${base(supabaseUrl)}/${table}`, {
    method: "POST",
    headers: restHeaders(serviceKey, prefer || "return=minimal"),
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (r.status === 409) return { conflict: true };
  if (!r.ok) throw new Error(`Supabase POST ${table}: ${r.status} ${text.slice(0, 200)}`);
  return { conflict: false };
}

async function restPatch(supabaseUrl, serviceKey, path, fields) {
  const r = await fetch(`${base(supabaseUrl)}${path}`, {
    method: "PATCH",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify(fields),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Supabase PATCH ${path}: ${r.status} ${text.slice(0, 200)}`);
  }
}

/**
 * @returns {{ isNew: boolean }}
 */
async function recordWebhookMessageId(cfg, { messageId, waId, metaAdId, metaCtwaClid, outcome }) {
  const ins = await restInsert(cfg.supabaseUrl, cfg.serviceKey, "whatsapp_webhook_messages", {
    whatsapp_message_id: messageId,
    wa_id: waId || null,
    meta_ad_id: metaAdId || null,
    meta_ctwa_clid: metaCtwaClid || null,
    outcome: outcome || "received",
  });
  return { isNew: !ins.conflict };
}

async function findOpenPending(cfg, waId, last10) {
  const wa = normalizeWaId(waId);
  if (wa) {
    const rows = await restSelect(
      cfg.supabaseUrl,
      cfg.serviceKey,
      `/whatsapp_ctwa_pending_attribution?wa_id=eq.${encodeURIComponent(wa)}&applied_at=is.null&order=received_at.desc&limit=1`
    );
    if (rows[0]) return rows[0];
  }
  if (last10) {
    const rows = await restSelect(
      cfg.supabaseUrl,
      cfg.serviceKey,
      `/whatsapp_ctwa_pending_attribution?phone_last_10=eq.${encodeURIComponent(last10)}&applied_at=is.null&order=received_at.desc&limit=1`
    );
    if (rows[0]) return rows[0];
  }
  return null;
}

async function insertPending(cfg, payload) {
  await restInsert(cfg.supabaseUrl, cfg.serviceKey, "whatsapp_ctwa_pending_attribution", payload);
}

/**
 * Apply first-touch ad fields to an existing contact (never overwrite non-empty meta_ad_id).
 */
async function applyAttributionToContact(cfg, contactId, contactRow, { metaAdId, metaCtwaClid }) {
  const patch = {};
  const existingAd = String((contactRow && contactRow.meta_ad_id) || "").trim();
  const existingClid = String((contactRow && contactRow.meta_ctwa_clid) || "").trim();
  if (metaAdId && !existingAd) patch.meta_ad_id = metaAdId;
  if (metaCtwaClid && !existingClid) patch.meta_ctwa_clid = metaCtwaClid;
  if (!Object.keys(patch).length) {
    return { updated: false, reason: "already_set" };
  }
  await updateContact(cfg.supabaseUrl, cfg.serviceKey, contactId, patch);
  return { updated: true, fields: Object.keys(patch) };
}

/**
 * Process one CTWA referral from a webhook message.
 */
async function processCtwaReferral(cfg, { messageId, waId, metaAdId, metaCtwaClid }) {
  const { isNew } = await recordWebhookMessageId(cfg, {
    messageId,
    waId,
    metaAdId,
    metaCtwaClid,
    outcome: "processing",
  });
  if (!isNew) {
    return { ok: true, duplicate: true, messageId };
  }

  const e164 = phoneE164FromWa(waId);
  const last10 = phoneLast10(waId);
  let contact = null;
  if (e164) {
    try {
      contact = await getContactByPhone(cfg.supabaseUrl, cfg.serviceKey, e164);
    } catch (e) {
      console.error("[meta-whatsapp-attribution] contact lookup", e.message || e);
    }
  }

  if (contact && contact.id) {
    const applied = await applyAttributionToContact(cfg, contact.id, contact, {
      metaAdId,
      metaCtwaClid,
    });
    await restPatch(
      cfg.supabaseUrl,
      cfg.serviceKey,
      `/whatsapp_webhook_messages?whatsapp_message_id=eq.${encodeURIComponent(messageId)}`,
      { outcome: applied.updated ? "applied_contact" : "skipped_contact_has_ad", processed_at: new Date().toISOString() }
    );
    return { ok: true, contactId: contact.id, applied };
  }

  const open = await findOpenPending(cfg, waId, last10);
  if (open && open.meta_ad_id) {
    await restPatch(
      cfg.supabaseUrl,
      cfg.serviceKey,
      `/whatsapp_webhook_messages?whatsapp_message_id=eq.${encodeURIComponent(messageId)}`,
      { outcome: "skipped_pending_exists", processed_at: new Date().toISOString() }
    );
    return { ok: true, pending: true, reason: "pending_already_open" };
  }

  try {
    const receivedAt = new Date().toISOString();
    await insertPending(cfg, {
      wa_id: normalizeWaId(waId),
      phone_e164: e164 || null,
      phone_last_10: last10 || null,
      meta_ad_id: metaAdId,
      meta_ctwa_clid: metaCtwaClid || null,
      source_message_id: messageId,
      received_at: receivedAt,
    });
    recordWhatsappConversationStart(cfg, {
      startedAt: receivedAt,
      phone: e164 || last10,
      waId,
      metaAdId,
      source: "ctwa_webhook",
    }).catch((err) => {
      console.error("[meta-whatsapp-attribution] conversation hour", err.message || err);
    });
  } catch (e) {
    if (/duplicate|unique|23505/i.test(e.message || "")) {
      return { ok: true, pending: true, reason: "pending_race" };
    }
    throw e;
  }

  await restPatch(
    cfg.supabaseUrl,
    cfg.serviceKey,
    `/whatsapp_webhook_messages?whatsapp_message_id=eq.${encodeURIComponent(messageId)}`,
    { outcome: "pending", processed_at: new Date().toISOString() }
  );
  return { ok: true, pending: true, waId: normalizeWaId(waId) };
}

/**
 * Called from lead-intake after contact upsert.
 */
async function mergePendingAttributionForContact(cfg, contactId, { phone, whatsappId }) {
  const waCandidates = new Set();
  const dPhone = digitsOnly(phone);
  const dWa = digitsOnly(whatsappId);
  if (dPhone.length >= 10) waCandidates.add(dPhone.length === 10 ? dPhone : dPhone.slice(-10));
  if (dWa.length >= 10) waCandidates.add(dWa.length === 10 ? dWa : dWa.slice(-10));
  if (dPhone.length >= 10) waCandidates.add(dPhone);
  if (dWa.length >= 10) waCandidates.add(dWa);

  let pending = null;
  for (const wa of waCandidates) {
    pending = await findOpenPending(cfg, wa, phoneLast10(wa));
    if (pending) break;
  }
  if (!pending) return { merged: false };

  const rows = await restSelect(
    cfg.supabaseUrl,
    cfg.serviceKey,
    `/contacts?select=id,meta_ad_id,meta_ctwa_clid&id=eq.${encodeURIComponent(contactId)}&limit=1`
  );
  const contact = rows[0] || { id: contactId };
  const applied = await applyAttributionToContact(cfg, contactId, contact, {
    metaAdId: pending.meta_ad_id,
    metaCtwaClid: pending.meta_ctwa_clid,
  });

  await restPatch(
    cfg.supabaseUrl,
    cfg.serviceKey,
    `/whatsapp_ctwa_pending_attribution?id=eq.${encodeURIComponent(pending.id)}`,
    {
      applied_at: new Date().toISOString(),
      contact_id: contactId,
    }
  );

  return { merged: true, applied, pendingId: pending.id };
}

module.exports = {
  normalizeWaId,
  phoneE164FromWa,
  phoneLast10,
  normalizeMetaAdId,
  normalizeCtwaClid,
  processCtwaReferral,
  mergePendingAttributionForContact,
};
