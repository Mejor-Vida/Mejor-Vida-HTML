/**
 * POST /api/hubspot-sync
 *
 * Syncs a contact + their lead_state from Supabase into HubSpot.
 * Creates or updates both a Contact and a Deal in HubSpot, then
 * writes the HubSpot IDs back to lead_state so future syncs are faster.
 *
 * Called from lead-intake (fire-and-forget) and can be invoked manually
 * via ManyChat External Request.
 *
 * ManyChat / internal sends:
 *   phone     (required) WhatsApp phone
 *
 * Returns:
 *   { success: true, hubspot_contact_id: "...", hubspot_deal_id: "..." }
 *
 * Pipeline stage mapping (Supabase → HubSpot dealstage): see lib/hubspot-sync-lib.js STAGE_MAP.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      HUBSPOT_ACCESS_TOKEN, HUBSPOT_PIPELINE_ID, MANYCHAT_WEBHOOK_SECRET
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { getContactByPhone, logWebhook } = require("../lib/contacts-db");
const { syncContactToHubspot } = require("../lib/hubspot-sync-lib");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  logRequest("hubspot-sync");

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
  const pipelineId = process.env.HUBSPOT_PIPELINE_ID || "default";

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Server missing Supabase env vars" });
  }
  if (!hubspotToken) {
    return json(res, 500, { success: false, error: "Server missing HUBSPOT_ACCESS_TOKEN" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const phone = String(body.phone || "").trim();
  if (!phone) {
    return json(res, 400, { success: false, error: "phone is required" });
  }

  logWebhook(supabaseUrl, supabaseKey, "manychat", "/api/hubspot-sync", { phone });

  try {
    const contact = await getContactByPhone(supabaseUrl, supabaseKey, phone);
    if (!contact) {
      return json(res, 404, { success: false, error: "Contact not found in Supabase" });
    }

    const result = await syncContactToHubspot(supabaseUrl, supabaseKey, hubspotToken, pipelineId, contact.id);

    return json(res, 200, {
      success: true,
      hubspot_contact_id: result.hubspot_contact_id,
      hubspot_deal_id: result.hubspot_deal_id,
      pipeline_stage: result.pipeline_stage,
    });
  } catch (e) {
    console.error("hubspot-sync error:", e.message);
    return json(res, 500, { success: false, error: "Server error syncing to HubSpot" });
  }
};
