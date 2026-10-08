/**
 * WhatsApp Intent Lead — state question answered (ManyChat Actions #13).
 */
const { normalizeUsStateAbbr } = require("./us-state-timezone");
const {
  upsertContact,
  upsertLeadState,
  getLeadState,
  getContactByPhone,
  insertEvent,
  updateContact,
} = require("./contacts-db");
const {
  mergePendingAttributionForContact,
  normalizeMetaAdId,
  normalizeCtwaClid,
} = require("./meta-whatsapp-attribution");
const { sendMetaCapiIntentLeadEvent } = require("./meta-capi");
const { upsertManychatLeadByPhone } = require("./supabase");

function intentLeadEventId(contactId) {
  return `intent_lead_${String(contactId || "").trim()}`.slice(0, 128);
}

/**
 * @param {object} cfg { supabaseUrl, serviceKey }
 * @param {object} input parsed ManyChat body (already resolved templates)
 */
async function processIntentLead(cfg, input) {
  const phone = String(input.phone || "").trim().slice(0, 40);
  const estadoRaw = String(input.estado_response || input.estado || "").trim().slice(0, 500);
  if (!phone) return { ok: false, status: 400, error: "phone required" };
  if (!estadoRaw) return { ok: false, status: 400, error: "estado required" };

  const firstName = String(input.first_name || "").trim().slice(0, 200) || null;
  const lastName = String(input.last_name || "").trim().slice(0, 200) || null;
  const whatsappId = String(input.whatsapp_id || "").trim() || null;
  const manychatSubscriberId = String(input.subscriber_id || input.manychat_id || "").trim() || null;
  const email = String(input.email || "").trim().toLowerCase() || null;

  const metaAdId = normalizeMetaAdId(input.meta_ad_id);
  const metaCtwaClid = normalizeCtwaClid(input.meta_ctwa_clid);
  const usStateNorm = normalizeUsStateAbbr(estadoRaw) || null;

  const prior = await getContactByPhone(cfg.supabaseUrl, cfg.serviceKey, phone);
  let priorIntentAt = null;
  if (prior && prior.id) {
    const st = await getLeadState(cfg.supabaseUrl, cfg.serviceKey, prior.id);
    priorIntentAt = st && st.intent_lead_at;
  }

  const { contactId } = await upsertContact(cfg.supabaseUrl, cfg.serviceKey, phone, {
    first_name: firstName,
    last_name: lastName,
    whatsapp_id: whatsappId,
    estado_response: estadoRaw,
    source: "whatsapp",
    ...(manychatSubscriberId ? { manychat_subscriber_id: manychatSubscriberId } : {}),
    ...(email ? { email } : {}),
    ...(usStateNorm ? { us_state: usStateNorm } : {}),
  });

  try {
    await mergePendingAttributionForContact(cfg, contactId, { phone, whatsappId });
  } catch (e) {
    console.error("[intent-lead] pending merge", e.message || e);
  }

  const contactRow = (await getContactByPhone(cfg.supabaseUrl, cfg.serviceKey, phone)) || {};
  const adPatch = {};
  if (metaAdId && !String(contactRow.meta_ad_id || "").trim()) adPatch.meta_ad_id = metaAdId;
  if (metaCtwaClid && !String(contactRow.meta_ctwa_clid || "").trim()) adPatch.meta_ctwa_clid = metaCtwaClid;
  if (Object.keys(adPatch).length) {
    await updateContact(cfg.supabaseUrl, cfg.serviceKey, contactId, adPatch);
  }

  const alreadyIntent = !!priorIntentAt;
  const nowIso = new Date().toISOString();

  if (!alreadyIntent) {
    await upsertLeadState(cfg.supabaseUrl, cfg.serviceKey, contactId, {
      intent_lead_at: nowIso,
      ...(usStateNorm ? { us_state: usStateNorm } : {}),
    });
  }

  await insertEvent(cfg.supabaseUrl, cfg.serviceKey, contactId, "intent_lead", {
    estado_response: estadoRaw,
    ...(usStateNorm ? { us_state: usStateNorm } : {}),
    duplicate_capi: alreadyIntent,
  });

  try {
    await upsertManychatLeadByPhone(cfg.supabaseUrl, cfg.serviceKey, phone, {
      first_name: firstName,
      last_name: lastName,
      phone,
      source: "whatsapp",
      tag: "Lead_WA_Intent",
      pipeline_stage: "intent_lead",
      drop_off: false,
    });
  } catch (e) {
    console.error("[intent-lead] manychat_leads", e.message || e);
  }

  let capi = { skipped: true, reason: "already_sent" };
  if (!alreadyIntent) {
    const fresh = (await getContactByPhone(cfg.supabaseUrl, cfg.serviceKey, phone)) || contactRow;
    capi = await sendMetaCapiIntentLeadEvent({
      contactId,
      phone,
      email: fresh.email || email,
      ctwaClid: fresh.meta_ctwa_clid || metaCtwaClid,
      eventId: intentLeadEventId(contactId),
    });
  }

  return {
    ok: true,
    status: 200,
    contact_id: contactId,
    intent_lead_duplicate: alreadyIntent,
    meta_capi: capi.skipped ? { skipped: true, reason: capi.reason } : { ok: !!capi.ok, skipped: false },
    estado_response: estadoRaw,
  };
}

module.exports = { processIntentLead, intentLeadEventId };
