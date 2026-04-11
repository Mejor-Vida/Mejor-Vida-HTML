/**
 * POST /api/email-optin-capture
 * ManyChat External Request — fires when contact chooses a path after email/opt-in.
 *
 * Two triggers:
 *   1. Nebraska button click → lead_type: "nebraska"  (direct lead)
 *   2. Other State "Yes" click → lead_type: "referral" (referral lead)
 *
 * Upserts manychat_leads with email, last_name, opt_in, and lead_type-specific fields.
 * Creates/updates HubSpot contact + adds consent note.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET, HUBSPOT_ACCESS_TOKEN (optional)
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { upsertManychatLeadByPhone } = require("../lib/supabase");
const { createOrUpdateContact, hubspotAddNote } = require("../lib/hubspot");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  logRequest("email-optin-capture");
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
    return json(res, 500, {
      success: false,
      error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const firstName = String(body.first_name || body.firstName || "").trim().slice(0, 200);
  const lastName = String(body.last_name || body.lastName || "").trim().slice(0, 200);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 500);
  const language = String(body.language || "Spanish").trim().slice(0, 50);
  const leadType = String(body.lead_type || "nebraska").trim().toLowerCase();

  if (!phone) {
    return json(res, 400, { success: false, error: "phone required" });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { success: false, error: "Valid email required" });
  }

  const now = new Date().toISOString();
  const isNebraska = leadType === "nebraska";

  // --- Supabase upsert ---
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

  // --- HubSpot contact ---
  const baseProps = {
    email,
    firstname: firstName || undefined,
    lastname: lastName || undefined,
    phone: phone || undefined,
  };

  const customProps = {
    preferred_language: language,
    lifecyclestage: "lead",
    hs_lead_status: isNebraska ? "OPEN" : "OPEN",
  };
  if (!isNebraska) {
    customProps.mvs_fe_lead_source = "referral";
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
};
