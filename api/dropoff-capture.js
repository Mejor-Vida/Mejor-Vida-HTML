/**
 * POST /api/dropoff-capture
 * ManyChat — Smart Delay: partial lead after inactivity.
 * Env: SUPABASE_*, MANYCHAT_WEBHOOK_SECRET, HUBSPOT_ACCESS_TOKEN (optional)
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { insertManychatLead, findQualifiedLeadByPhone } = require("../lib/supabase");
const { createOrUpdateContact } = require("../lib/hubspot");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  logRequest("dropoff-capture");
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
  const phone = String(body.phone || "").trim().slice(0, 40);
  const language = String(body.language || "English").trim().slice(0, 50) || "English";
  const dropOffStage = String(body.drop_off_stage || body.dropOffStage || "").trim().slice(0, 100) || null;

  if (!phone) {
    return json(res, 400, { success: false, error: "phone required" });
  }

  try {
    const qualified = await findQualifiedLeadByPhone(supabaseUrl, supabaseKey, phone);
    if (qualified) {
      return json(res, 200, { success: true, skipped: true, reason: "already_captured" });
    }
  } catch (e) {
    console.error("dropoff-capture lookup", e.message);
    return json(res, 500, { success: false, error: "Lookup failed" });
  }

  const row = {
    first_name: firstName || null,
    phone,
    email: null,
    age: null,
    sex: null,
    tobacco: null,
    language,
    tag: "Lead_DropOff",
    pipeline_stage: "dropped",
    source: "whatsapp",
    drop_off: true,
    drop_off_stage: dropOffStage,
  };

  const settled = await Promise.allSettled([
    insertManychatLead(supabaseUrl, supabaseKey, row),
    hubspotToken
      ? createOrUpdateContact(
          hubspotToken,
          {
            firstname: firstName || "WhatsApp",
            phone,
          },
          {
            lifecyclestage: "lead",
            hs_lead_status: "OPEN",
            preferred_language: language,
          },
        )
      : Promise.resolve(null),
  ]);

  if (settled[0].status === "rejected") {
    console.error("dropoff-capture supabase", settled[0].reason);
    return json(res, 500, { success: false, error: "Could not save drop-off" });
  }

  if (settled[1].status === "rejected") {
    console.error("dropoff-capture hubspot", settled[1].reason);
  }

  return json(res, 200, { success: true });
};
