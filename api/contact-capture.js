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
const { createOrUpdateContact, hubspotAddNote } = require("../lib/hubspot");
const { syncContactToHubspot } = require("../lib/hubspot-sync-lib");

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

  const settled = await Promise.allSettled([
    upsertManychatLeadByPhone(supabaseUrl, supabaseKey, phone, row),
    hubspotToken
      ? createOrUpdateContact(
          hubspotToken,
          {
            firstname: firstName || "WhatsApp",
            ...(lastName ? { lastname: lastName } : {}),
            phone,
          },
          {
            lifecyclestage: "lead",
            hs_lead_status: "OPEN",
            preferred_language: "Spanish",
          },
        )
      : Promise.resolve(null),
  ]);

  if (settled[0].status === "rejected") {
    console.error("contact-capture supabase", settled[0].reason);
    return json(res, 500, { success: false, error: "Could not save contact" });
  }

  if (settled[1].status === "rejected") {
    console.error("contact-capture hubspot", settled[1].reason);
  }

  // Also write to v2 contacts table — then sync HubSpot from Supabase (full first/last/email when present).
  let v2ContactId = null;
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
    console.error("contact-capture v2 upsert error:", e.message);
  }

  if (hubspotToken && v2ContactId) {
    try {
      await syncContactToHubspot(supabaseUrl, supabaseKey, hubspotToken, hubspotPipelineId(), v2ContactId);
    } catch (e) {
      console.error("[contact-capture initial] hubspot-sync:", e.message);
    }
  }

  return json(res, 200, { success: true, lead_id: settled[0].value });
}

/* ── Email + opt-in handler ────────────────────────────────────── */
async function handleEmailOptin(body, supabaseUrl, supabaseKey, hubspotToken, res) {
  const firstName = cleanManychatNameField(body.first_name || body.firstName || "").slice(0, 200);
  const lastName = cleanManychatNameField(body.last_name || body.lastName || "").slice(0, 200);
  const phone = resolveManyChat(String(body.phone || body.whatsapp_phone || "").trim()).slice(0, 40);
  const rawEmail = resolveManyChat(String(body.email || "").trim().toLowerCase());
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail.slice(0, 500) : null;
  const language = String(body.language || "Spanish").trim().slice(0, 50);
  const leadType = String(body.lead_type || "nebraska").trim().toLowerCase();

  if (!phone) {
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

  const baseProps = {
    ...(email ? { email } : {}),
    firstname: firstName || undefined,
    lastname: lastName || undefined,
    phone: phone || undefined,
  };

  const customProps = {
    preferred_language: language,
    lifecyclestage: "lead",
    hs_lead_status: "OPEN",
  };
  if (!isNebraska) {
    customProps.lead_source = "Referral";
  }

  const consentNote =
    `Opt-in consent recorded via WhatsApp chatbot on ${now}. ` +
    `Contact agreed to be contacted by a licensed insurance agent via phone, email, or text message. ` +
    `Lead type: ${isNebraska ? "Nebraska (direct)" : "Out-of-state (referral)"}.`;

  const settled = await Promise.allSettled([
    upsertManychatLeadByPhone(supabaseUrl, supabaseKey, phone, row),
    hubspotToken
      ? createOrUpdateContact(hubspotToken, baseProps, customProps)
      : Promise.resolve(null),
  ]);

  if (settled[0].status === "rejected") {
    console.error("email-optin-capture supabase", settled[0].reason);
    return json(res, 500, { success: false, error: "Could not save lead" });
  }

  const leadId = settled[0].value;

  if (settled[1].status === "rejected") {
    console.error("email-optin-capture hubspot", settled[1].reason);
  }

  // Also write to v2 contacts table — then sync HubSpot from Supabase (email + names + deal stage).
  let v2ContactId = null;
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
    console.error("contact-capture v2 email_optin upsert error:", e.message);
  }

  if (hubspotToken && v2ContactId) {
    try {
      await syncContactToHubspot(supabaseUrl, supabaseKey, hubspotToken, hubspotPipelineId(), v2ContactId);
    } catch (e) {
      console.error("[contact-capture email_optin] hubspot-sync:", e.message);
    }
  }

  // Add consent note to HubSpot contact (best-effort)
  if (hubspotToken && settled[1].status === "fulfilled" && settled[1].value) {
    const contactId = settled[1].value.contactId;
    if (contactId) {
      try {
        await hubspotAddNote(hubspotToken, contactId, consentNote);
      } catch (e) {
        console.error("email-optin-capture hubspot note", e);
      }
    }
  }

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

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    return json(res, auth.status, { success: false, error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Missing Supabase env vars" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const action = String(body.action || "initial").trim().toLowerCase();

  if (action === "email_optin") {
    return handleEmailOptin(body, supabaseUrl, supabaseKey, hubspotToken, res);
  }

  return handleInitialContact(body, supabaseUrl, supabaseKey, hubspotToken, res);
};
