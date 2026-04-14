/**
 * POST /api/hubspot-sync
 *
 * Syncs a contact + their lead_state from Supabase into HubSpot.
 * Creates or updates both a Contact and a Deal in HubSpot, then
 * writes the HubSpot IDs back to lead_state so future syncs are faster.
 *
 * Called automatically from lead-intake (on first contact) and lead-update
 * (on stage changes). Can also be called manually to re-sync any lead.
 *
 * ManyChat / internal sends:
 *   phone     (required if contact_id not provided) WhatsApp phone
 *   contact_id (optional) Supabase contact UUID — faster lookup
 *
 * Returns:
 *   { success: true, hubspot_contact_id: "...", hubspot_deal_id: "..." }
 *
 * Pipeline stage mapping (Supabase → HubSpot dealstage):
 *   new_contact        → new_contact
 *   engaged            → engaged
 *   partially_qualified → partially_qualified
 *   quoted             → quoted
 *   call_scheduled     → call_scheduled
 *   call_completed     → call_completed
 *   policy_issued      → policy_issued
 *   closed_lost        → closedlost  (HubSpot built-in)
 *
 * NOTE: HubSpot deal stage IDs must be configured in your pipeline.
 *   Set HUBSPOT_PIPELINE_ID env var to your custom pipeline ID.
 *   Stage IDs in this file match the internal names — update them after
 *   you create the pipeline stages in HubSpot.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      HUBSPOT_ACCESS_TOKEN, HUBSPOT_PIPELINE_ID, MANYCHAT_WEBHOOK_SECRET
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { getContactByPhone, getLeadState, updateLeadState, logWebhook } = require("../lib/contacts-db");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

// ─── HubSpot helpers ──────────────────────────────────────────────────────────

const HS_BASE = "https://api.hubapi.com";

async function hsRequest(token, method, path, body) {
  const r = await fetch(`${HS_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`HubSpot ${method} ${path} → ${r.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

async function findHsContactByPhone(token, phone) {
  try {
    const data = await hsRequest(token, "POST", "/crm/v3/objects/contacts/search", {
      filterGroups: [{ filters: [{ propertyName: "phone", operator: "EQ", value: phone }] }],
      limit: 1,
      properties: ["phone", "email", "firstname"],
    });
    return data.results && data.results[0] ? String(data.results[0].id) : null;
  } catch (_) {
    return null;
  }
}

async function upsertHsContact(token, phone, { fullName, email, language, usState, age, gender, isSmoker }) {
  // Try find by phone
  let existingId = await findHsContactByPhone(token, phone);

  const properties = {
    phone,
    ...(fullName && { firstname: fullName.split(" ")[0], lastname: fullName.split(" ").slice(1).join(" ") || "" }),
    ...(email && { email }),
    ...(language && { preferred_language: language }),
    ...(usState && { state: usState }),
    ...(age != null && { mvi_age: String(age) }),
    ...(gender && { mvi_gender: gender }),
    ...(isSmoker != null && { mvi_smoker: String(isSmoker) }),
    lead_source: "WhatsApp",
  };

  // Remove empty string values
  Object.keys(properties).forEach((k) => {
    if (properties[k] === "" || properties[k] === null || properties[k] === undefined) {
      delete properties[k];
    }
  });

  if (existingId) {
    await hsRequest(token, "PATCH", `/crm/v3/objects/contacts/${existingId}`, { properties });
    return existingId;
  }

  // Try create — if it fails due to duplicate email, fall back to phone-only
  try {
    const created = await hsRequest(token, "POST", "/crm/v3/objects/contacts", { properties });
    return String(created.id);
  } catch (e) {
    if (email && e.message.includes("CONTACT_EXISTS")) {
      // Find by email
      const data = await hsRequest(token, "POST", "/crm/v3/objects/contacts/search", {
        filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
        limit: 1,
      });
      if (data.results && data.results[0]) {
        const id = String(data.results[0].id);
        await hsRequest(token, "PATCH", `/crm/v3/objects/contacts/${id}`, { properties });
        return id;
      }
    }
    throw e;
  }
}

async function findHsDealByContactId(token, hsContactId) {
  try {
    const data = await hsRequest(
      token,
      "GET",
      `/crm/v3/objects/contacts/${hsContactId}/associations/deals?limit=1`,
    );
    if (data.results && data.results[0]) return String(data.results[0].id);
    return null;
  } catch (_) {
    return null;
  }
}

async function upsertHsDeal(token, hsContactId, pipelineId, { stageId, dealName, coverageAmount, monthlyPremium, language }) {
  const existingDealId = await findHsDealByContactId(token, hsContactId);

  const properties = {
    dealname: dealName,
    pipeline: pipelineId,
    dealstage: stageId,
    ...(coverageAmount != null && { amount: String(coverageAmount) }),
    ...(monthlyPremium != null && { mvi_monthly_premium: String(monthlyPremium) }),
    ...(language && { mvi_lead_language: language }),
  };

  if (existingDealId) {
    await hsRequest(token, "PATCH", `/crm/v3/objects/deals/${existingDealId}`, { properties });
    return existingDealId;
  }

  const deal = await hsRequest(token, "POST", "/crm/v3/objects/deals", {
    properties,
    associations: [
      {
        to: { id: hsContactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
      },
    ],
  });
  return String(deal.id);
}

// ─── Stage ID mapping ─────────────────────────────────────────────────────────
// Maps Supabase pipeline_stage values → HubSpot deal stage IDs.
// Pipeline: "Deals pipeline" (pipelineId: "default"), portal 245703627.
// Stage IDs confirmed via /api/pipelines/v2/pipelines/0-3/default on 2026-04-13.
const STAGE_MAP = {
  new_contact:        "appointmentscheduled",   // New Contact
  engaged:            "qualifiedtobuy",          // Engaged
  partially_qualified:"presentationscheduled",   // Partially Qualified
  quoted:             "decisionmakerboughtin",   // Quoted
  call_scheduled:     "contractsent",            // Call Scheduled
  call_completed:     "3501339381",              // Call Completed (custom stage)
  policy_issued:      "closedwon",              // Policy Issued (won)
  closed_lost:        "closedlost",             // Closed Lost
};

// ─── Handler ──────────────────────────────────────────────────────────────────

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
    // 1. Load contact + lead_state from Supabase
    const contact = await getContactByPhone(supabaseUrl, supabaseKey, phone);
    if (!contact) {
      return json(res, 404, { success: false, error: "Contact not found in Supabase" });
    }
    const leadState = await getLeadState(supabaseUrl, supabaseKey, contact.id);

    // 2. Upsert HubSpot Contact
    const hsContactId = await upsertHsContact(hubspotToken, phone, {
      fullName: contact.full_name,
      email: contact.email,
      language: contact.language,
      usState: contact.us_state,
      age: leadState && leadState.age,
      gender: leadState && leadState.gender,
      isSmoker: leadState && leadState.is_smoker,
    });

    // 3. Map pipeline stage
    const stage = (leadState && leadState.pipeline_stage) || "new_contact";
    const stageId = STAGE_MAP[stage] || "new_contact";

    // 4. Upsert HubSpot Deal
    const dealName = contact.full_name
      ? `${contact.full_name} — Final Expense`
      : `${phone} — Final Expense`;

    const hsDealId = await upsertHsDeal(hubspotToken, hsContactId, pipelineId, {
      stageId,
      dealName,
      coverageAmount: leadState && leadState.coverage_amount,
      monthlyPremium: leadState && leadState.monthly_premium,
      language: contact.language,
    });

    // 5. Write HubSpot IDs back to Supabase lead_state
    if (leadState) {
      await updateLeadState(supabaseUrl, supabaseKey, contact.id, {
        hubspot_contact_id: hsContactId,
        hubspot_deal_id: hsDealId,
        hubspot_synced_at: new Date().toISOString(),
      });
    }

    return json(res, 200, {
      success: true,
      hubspot_contact_id: hsContactId,
      hubspot_deal_id: hsDealId,
      pipeline_stage: stage,
    });
  } catch (e) {
    console.error("hubspot-sync error:", e.message);
    return json(res, 500, { success: false, error: "Server error syncing to HubSpot" });
  }
};
