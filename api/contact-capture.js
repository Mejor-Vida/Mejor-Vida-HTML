/**
 * POST /api/contact-capture
 * ManyChat External Request — two modes via `action` field:
 *
 * 1. Default (no action / action: "initial")
 *    Fires when a contact first messages on WhatsApp.
 *    Creates lead in Supabase + HubSpot with just name & phone.
 *
 * 2. action: "email_optin"
 *    Fires when contact clicks Nebraska or Other-State "Yes" button.
 *    Upserts email, last_name, opt_in consent + syncs HubSpot.
 *    Pass lead_type: "nebraska" | "referral" to set pipeline stage.
 *
 * Env: SUPABASE_*, MANYCHAT_WEBHOOK_SECRET, HUBSPOT_ACCESS_TOKEN (optional)
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { upsertManychatLeadByPhone } = require("../lib/supabase");
const { upsertContact, upsertLeadState, insertEvent } = require("../lib/contacts-db");
const { hubspotAddNote } = require("../lib/hubspot");
const { syncContactToHubspot } = require("../lib/hubspot-sync-lib");
const { logIntegrationAudit } = require("../lib/integration-audit");

function hubspotPipelineId() {
  return process.env.HUBSPOT_PIPELINE_ID || "default";
}

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") {
    const sanitized = (req.body || "").replace(/[\r\n]/g, "");
    return JSON.parse(sanitized || "{}");
  }
  return req.body && typeof req.body === "object" ? req.body : {};
}

// ManyChat sends "{{field_name}}" literally when a variable has no value.
// Strip those so downstream code sees an empty string instead.
function resolveManyChat(val) {
  if (typeof val !== "string") return val;
  const t = val.trim();
  if (!t) return "";
  if (/^\{\{[\s\S]*\}\}$/.test(t)) return "";
  return t;
}

/** Names: unresolved whole-token + embedded {{...}} (wrong External Request mapping). Do not use on phone/ids. */
function cleanManychatNameField(val) {
  const s = resolveManyChat(String(val == null ? "" : val).trim());
  if (!s) return "";
  return s
    .replace(/\{\{[^}]+\}\}/g, "")
    .trim()
    .replace(/\s{2,}/g, " ");
}

/* ── Initial contact handler ───────────────────────────────────── */
async function handleInitialContact(body, supabaseUrl, supabaseKey, hubspotToken, res) {
  const fromFirst = cleanManychatNameField(body.first_name || body.firstName || "");
  const fromLast = cleanManychatNameField(body.last_name || body.lastName || "");
  const fromFull = cleanManychatNameField(body.name || "");
  let firstName = fromFirst.slice(0, 200) || null;
  let lastName = fromLast.slice(0, 200) || null;
  if (fromFull) {
    const parts = fromFull.split(/\s+/).filter(Boolean);
    if (!firstName) firstName = (parts[0] || "").slice(0, 200) || null;
    if (!lastName) lastName = (parts.slice(1).join(" ") || "").slice(0, 200) || null;
  }
  const phone = (
    resolveManyChat(String(body.phone || "").trim()) || resolveManyChat(String(body.whatsapp_id || "").trim())
  ).slice(0, 40);
  const whatsappId = resolveManyChat(String(body.whatsapp_id || "").trim()) || null;
  // ManyChat sends {{id}} as the real subscriber ID — capture it if provided
  const manychatSubscriberId = resolveManyChat(String(body.subscriber_id || body.manychat_id || "").trim()) || null;

  if (!phone) {
    return json(res, 400, { success: false, error: "phone required" });
  }

  const row = {
    first_name: firstName,
    last_name: lastName,
    phone,
    email: null,
    age: null,
    sex: null,
    tobacco: null,
    language: "Spanish",
    tag: "Lead_WA_New",
    pipeline_stage: "initiated",
    source: "whatsapp",
    drop_off: false,
    drop_off_stage: null,
  };

  await logIntegrationAudit(supabaseUrl, supabaseKey, {
    stage: "contact_capture_initial_begin",
    endpoint: "/api/contact-capture",
    outcome: "ok",
    phone,
    detail: {
      has_first_name: !!firstName,
      has_last_name: !!lastName,
      has_subscriber_id: !!manychatSubscriberId,
    },
  });

  const settled = await Promise.allSettled([upsertManychatLeadByPhone(supabaseUrl, supabaseKey, phone, row)]);

  if (settled[0].status === "rejected") {
    const msg = settled[0].reason && settled[0].reason.message ? settled[0].reason.message : String(settled[0].reason);
    console.error("contact-capture supabase", settled[0].reason);
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "contact_capture_initial_manychat_leads",
      endpoint: "/api/contact-capture",
      outcome: "error",
      phone,
      message: msg,
    });
    return json(res, 500, { success: false, error: "Could not save contact" });
  }

  const manychatLeadId = settled[0].value;

  // Also write to v2 contacts table — then sync HubSpot from Supabase (full first/last/email when present).
  let v2ContactId = null;
  let v2Err = null;
  try {
    const { contactId } = await upsertContact(supabaseUrl, supabaseKey, phone, {
      first_name: firstName,
      last_name: lastName,
      whatsapp_id: whatsappId,
      ...(manychatSubscriberId ? { manychat_subscriber_id: manychatSubscriberId } : {}),
      source: "whatsapp",
    });
    v2ContactId = contactId;

    await upsertLeadState(supabaseUrl, supabaseKey, contactId, {
      pipeline_stage: "new_contact",
    });

    await insertEvent(supabaseUrl, supabaseKey, contactId, "first_message", {
      source: "whatsapp",
    });
  } catch (e) {
    v2Err = e && e.message ? e.message : String(e);
    console.error("contact-capture v2 upsert error:", e.message);
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "contact_capture_initial_contacts_v2",
      endpoint: "/api/contact-capture",
      outcome: "error",
      phone,
      message: v2Err,
      manychatLeadId,
    });
  }

  let hubspotSynced = false;
  let hubspotErr = null;
  if (hubspotToken && v2ContactId) {
    try {
      await syncContactToHubspot(supabaseUrl, supabaseKey, hubspotToken, hubspotPipelineId(), v2ContactId);
      hubspotSynced = true;
    } catch (e) {
      hubspotErr = e && e.message ? e.message : String(e);
      console.error("[contact-capture initial] hubspot-sync:", e.message);
      await logIntegrationAudit(supabaseUrl, supabaseKey, {
        stage: "contact_capture_initial_hubspot_sync",
        endpoint: "/api/contact-capture",
        outcome: "error",
        phone,
        message: hubspotErr,
        manychatLeadId,
        contactId: v2ContactId,
      });
    }
  }

  await logIntegrationAudit(supabaseUrl, supabaseKey, {
    stage: "contact_capture_initial_complete",
    endpoint: "/api/contact-capture",
    outcome: v2Err ? "error" : "ok",
    phone,
    message: v2Err || (hubspotErr && `hubspot: ${hubspotErr}`) || null,
    detail: {
      manychat_lead_id: manychatLeadId,
      contact_id: v2ContactId,
      hubspot_synced: hubspotSynced,
      v2_error: v2Err || null,
    },
    manychatLeadId,
    contactId: v2ContactId,
  });

  return json(res, 200, { success: true, lead_id: manychatLeadId });
}

/* ── Email + opt-in handler ────────────────────────────────────── */
async function handleEmailOptin(body, supabaseUrl, supabaseKey, hubspotToken, res) {
  const firstName = cleanManychatNameField(body.first_name || body.firstName || "").slice(0, 200);
  const lastName = cleanManychatNameField(body.last_name || body.lastName || "").slice(0, 200);
  const phone = (
    resolveManyChat(String(body.phone || "").trim()) ||
    resolveManyChat(String(body.whatsapp_phone || "").trim()) ||
    resolveManyChat(String(body.whatsapp_id || "").trim())
  ).slice(0, 40);
  const rawEmail = resolveManyChat(String(body.email || "").trim().toLowerCase());
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail.slice(0, 500) : null;
  const language = String(body.language || "Spanish").trim().slice(0, 50);
  const leadType = String(body.lead_type || "nebraska").trim().toLowerCase();

  if (!phone) {
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "contact_capture_email_optin_validation",
      endpoint: "/api/contact-capture",
      outcome: "error",
      message: "phone required",
      detail: {
        had_whatsapp_phone: !!resolveManyChat(String(body.whatsapp_phone || "").trim()),
        had_whatsapp_id: !!resolveManyChat(String(body.whatsapp_id || "").trim()),
      },
    });
    return json(res, 400, { success: false, error: "phone required" });
  }
  if (!email) {
    console.warn("contact-capture email_optin: email missing or unresolved for phone", phone);
  }

  const now = new Date().toISOString();
  const isNebraska = leadType === "nebraska";

  const row = {
    first_name: firstName || null,
    last_name: lastName || null,
    email,
    language,
    opt_in: true,
    opt_in_at: now,
    tag: isNebraska ? "Lead_NE" : "Lead_OOS_Referral",
    pipeline_stage: isNebraska ? "nebraska_lead" : "referral_requested",
    source: "whatsapp",
    drop_off: false,
    drop_off_stage: null,
  };

  const consentNote =
    `Opt-in consent recorded via WhatsApp chatbot on ${now}. ` +
    `Contact agreed to be contacted by a licensed insurance agent via phone, email, or text message. ` +
    `Lead type: ${isNebraska ? "Nebraska (direct)" : "Out-of-state (referral)"}.`;

  await logIntegrationAudit(supabaseUrl, supabaseKey, {
    stage: "contact_capture_email_optin_begin",
    endpoint: "/api/contact-capture",
    outcome: "ok",
    phone,
    detail: {
      lead_type: leadType,
      has_email: !!email,
      has_first_name: !!firstName,
      has_last_name: !!lastName,
    },
  });

  const settled = await Promise.allSettled([upsertManychatLeadByPhone(supabaseUrl, supabaseKey, phone, row)]);

  if (settled[0].status === "rejected") {
    const msg = settled[0].reason && settled[0].reason.message ? settled[0].reason.message : String(settled[0].reason);
    console.error("email-optin-capture supabase", settled[0].reason);
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "contact_capture_email_optin_manychat_leads",
      endpoint: "/api/contact-capture",
      outcome: "error",
      phone,
      message: msg,
    });
    return json(res, 500, { success: false, error: "Could not save lead" });
  }

  const leadId = settled[0].value;

  // Also write to v2 contacts table — then sync HubSpot from Supabase (email + names + deal stage).
  let v2ContactId = null;
  let v2Err = null;
  try {
    const langLower = String(language || "").toLowerCase();
    const languageV2 = langLower.includes("spanish") ? "spanish" : "english";
    const { contactId } = await upsertContact(supabaseUrl, supabaseKey, phone, {
      first_name: firstName || null,
      last_name: lastName || null,
      email: email || null,
      language: languageV2,
      source: "whatsapp",
    });
    v2ContactId = contactId;

    await upsertLeadState(supabaseUrl, supabaseKey, contactId, {
      pipeline_stage: isNebraska ? "engaged" : "referral_requested",
    });
  } catch (e) {
    v2Err = e && e.message ? e.message : String(e);
    console.error("contact-capture v2 email_optin upsert error:", e.message);
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "contact_capture_email_optin_contacts_v2",
      endpoint: "/api/contact-capture",
      outcome: "error",
      phone,
      message: v2Err,
      manychatLeadId: leadId,
    });
  }

  let hsContactIdForNote = null;
  let hubspotErr = null;
  if (hubspotToken && v2ContactId) {
    try {
      const hsOut = await syncContactToHubspot(supabaseUrl, supabaseKey, hubspotToken, hubspotPipelineId(), v2ContactId);
      if (hsOut && hsOut.hubspot_contact_id) hsContactIdForNote = hsOut.hubspot_contact_id;
    } catch (e) {
      hubspotErr = e && e.message ? e.message : String(e);
      console.error("[contact-capture email_optin] hubspot-sync:", e.message);
      await logIntegrationAudit(supabaseUrl, supabaseKey, {
        stage: "contact_capture_email_optin_hubspot_sync",
        endpoint: "/api/contact-capture",
        outcome: "error",
        phone,
        message: hubspotErr,
        manychatLeadId: leadId,
        contactId: v2ContactId,
      });
    }
  }

  if (hubspotToken && hsContactIdForNote) {
    try {
      await hubspotAddNote(hubspotToken, hsContactIdForNote, consentNote);
    } catch (e) {
      console.error("email-optin-capture hubspot note", e);
    }
  }

  await logIntegrationAudit(supabaseUrl, supabaseKey, {
    stage: "contact_capture_email_optin_complete",
    endpoint: "/api/contact-capture",
    outcome: v2Err ? "error" : "ok",
    phone,
    message: v2Err || (hubspotErr && `hubspot: ${hubspotErr}`) || null,
    detail: {
      manychat_lead_id: leadId,
      contact_id: v2ContactId,
      hubspot_note_contact_id: hsContactIdForNote,
      lead_type: isNebraska ? "nebraska" : "referral",
    },
    manychatLeadId: leadId,
    contactId: v2ContactId,
  });

  return json(res, 200, {
    success: true,
    lead_id: leadId,
    lead_type: isNebraska ? "nebraska" : "referral",
  });
}

/* ── Main handler ──────────────────────────────────────────────── */
module.exports = async function handler(req, res) {
  logRequest("contact-capture");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Missing Supabase env vars" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "contact_capture_auth_failed",
      endpoint: "/api/contact-capture",
      outcome: "error",
      message: auth.error || "Unauthorized",
      detail: { hint: "External Request must include X-App-Secret matching MANYCHAT_WEBHOOK_SECRET" },
    });
    return json(res, auth.status, { success: false, error: auth.error });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "contact_capture_invalid_json",
      endpoint: "/api/contact-capture",
      outcome: "error",
      message: "Invalid JSON",
    });
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const action = String(body.action || "initial").trim().toLowerCase();
  const probePhone =
    resolveManyChat(
      String(body.phone || body.whatsapp_phone || body.whatsapp_id || "").trim()
    ).slice(0, 40) || null;
  await logIntegrationAudit(supabaseUrl, supabaseKey, {
    stage: "contact_capture_request",
    endpoint: "/api/contact-capture",
    outcome: "ok",
    phone: probePhone || undefined,
    detail: { action },
  });

  if (action === "email_optin") {
    return handleEmailOptin(body, supabaseUrl, supabaseKey, hubspotToken, res);
  }

  return handleInitialContact(body, supabaseUrl, supabaseKey, hubspotToken, res);
};
