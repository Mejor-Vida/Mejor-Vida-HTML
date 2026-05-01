/**
 * Shared HubSpot CRM sync for v2 contacts (used by api/hubspot-sync.js and api/lead-intake.js).
 */

const { getContactById, getLeadState, updateLeadState } = require("./contacts-db");

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

async function upsertHsContact(token, phone, { firstName, lastName, email, language, usState, age, gender, isSmoker }) {
  let existingId = await findHsContactByPhone(token, phone);

  const properties = {
    phone,
    ...(firstName && { firstname: firstName }),
    ...(lastName && { lastname: lastName }),
    ...(email && { email }),
    ...(language && { preferred_language: language }),
    hs_language: language === 'spanish' ? 'es' : 'en',
    ...(usState && { state: usState }),
    ...(age != null && { mvi_age: String(age) }),
    ...(gender && { mvi_gender: gender }),
    ...(isSmoker != null && { mvi_smoker: String(isSmoker) }),
    lead_source: "WhatsApp",
  };

  Object.keys(properties).forEach((k) => {
    if (properties[k] === "" || properties[k] === null || properties[k] === undefined) {
      delete properties[k];
    }
  });

  if (existingId) {
    await hsRequest(token, "PATCH", `/crm/v3/objects/contacts/${existingId}`, { properties });
    return existingId;
  }

  try {
    const created = await hsRequest(token, "POST", "/crm/v3/objects/contacts", { properties });
    return String(created.id);
  } catch (e) {
    if (email && e.message.includes("CONTACT_EXISTS")) {
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

/** Supabase pipeline_stage → HubSpot deal stage IDs (see api/hubspot-sync.js header). */
const STAGE_MAP = {
  new_contact:         "appointmentscheduled",
  engaged:             "qualifiedtobuy",
  partially_qualified: "presentationscheduled",
  quoted:              "decisionmakerboughtin",
  call_scheduled:      "contractsent",
  call_completed:      "3501339381",
  policy_issued:       "closedwon",
  closed_lost:         "closedlost",
  /** contact-capture / manychat stages not in lead-update STAGE_ORDER */
  referral_requested:  "qualifiedtobuy",
  nebraska_lead:       "qualifiedtobuy",
  initiated:           "appointmentscheduled",
  dropped:             "appointmentscheduled",
  new:                 "appointmentscheduled",
};

/**
 * Load contact + lead_state from Supabase, upsert HubSpot contact + deal, write IDs to lead_state.
 * @returns {{ hubspot_contact_id: string, hubspot_deal_id: string, pipeline_stage: string }}
 */
async function syncContactToHubspot(supabaseUrl, supabaseKey, hubspotToken, pipelineId, contactId) {
  const contact = await getContactById(supabaseUrl, supabaseKey, contactId);
  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }
  const phone = contact.phone;
  if (!phone) {
    throw new Error("Contact has no phone");
  }

  const leadState = await getLeadState(supabaseUrl, supabaseKey, contact.id);

  const hsContactId = await upsertHsContact(hubspotToken, phone, {
    firstName: contact.first_name,
    lastName: contact.last_name,
    email: contact.email,
    language: contact.language,
    usState: contact.us_state,
    age: leadState && leadState.age,
    gender: leadState && leadState.gender,
    isSmoker: leadState && leadState.is_smoker,
  });

  const stage = (leadState && leadState.pipeline_stage) || "new_contact";
  const stageId = STAGE_MAP[stage] ?? STAGE_MAP.new_contact;

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

  if (leadState) {
    await updateLeadState(supabaseUrl, supabaseKey, contact.id, {
      hubspot_contact_id: hsContactId,
      hubspot_deal_id: hsDealId,
      hubspot_synced_at: new Date().toISOString(),
    });
  }

  return {
    hubspot_contact_id: hsContactId,
    hubspot_deal_id: hsDealId,
    pipeline_stage: stage,
  };
}

module.exports = {
  syncContactToHubspot,
  STAGE_MAP,
};
