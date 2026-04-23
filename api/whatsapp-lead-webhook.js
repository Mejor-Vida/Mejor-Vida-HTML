/**
 * // DEPRECATED — This endpoint was part of the old Apps Script → Gmail → Vercel pipeline.
 * // That pipeline has been replaced by direct ManyChat → Vercel API calls (api/lead-intake.js, api/lead-capture.js).
 * // This file is kept for reference only. Do not route new traffic here.
 * // Safe to delete after confirming no live traffic — check Vercel logs before removing.
 *
 * POST /api/whatsapp-lead-webhook
 * Vercel serverless: Apps Script (Gmail whatsapp@) → Supabase whatsapp_leads + HubSpot.
 * Patterns match api/fex-email-quote-webhook.js.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HUBSPOT_ACCESS_TOKEN, WHATSAPP_WEBHOOK_SECRET
 */

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function bearerToken(req) {
  const h = req.headers && req.headers.authorization;
  if (!h || typeof h !== "string") return "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : "";
}

async function supabaseInsert(supabaseUrl, serviceKey, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/whatsapp_leads`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase insert ${r.status}: ${text.slice(0, 500)}`);
  }
  const data = JSON.parse(text);
  const first = Array.isArray(data) ? data[0] : data;
  return first && first.id ? String(first.id) : null;
}

async function supabasePatch(supabaseUrl, serviceKey, id, fields) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/whatsapp_leads?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(fields),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase patch ${r.status}: ${t.slice(0, 300)}`);
  }
}

async function hubspotFindContactByEmail(token, email) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        { filters: [{ propertyName: "email", operator: "EQ", value: email }] },
      ],
      limit: 1,
      properties: ["email", "firstname", "lastname", "phone"],
    }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  const row = data.results && data.results[0];
  return row ? String(row.id) : null;
}

async function hubspotCreateContact(token, properties) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`HubSpot create ${r.status}: ${text.slice(0, 400)}`);
  }
  const data = JSON.parse(text);
  return data.id ? String(data.id) : null;
}

async function hubspotUpdateContact(token, id, properties) {
  const r = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HubSpot patch ${r.status}: ${t.slice(0, 400)}`);
  }
}

async function hubspotAddNote(token, contactId, noteBody) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
        },
      ],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error(`HubSpot note ${r.status}: ${t.slice(0, 300)}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!secret) {
    return json(res, 500, { ok: false, error: "Server missing WHATSAPP_WEBHOOK_SECRET" });
  }
  if (bearerToken(req) !== secret) {
    return json(res, 401, { ok: false, error: "Unauthorized" });
  }
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { ok: false, error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  // Extract fields — support camelCase and snake_case
  const firstName = String(body.firstName || body.first_name || "").trim().slice(0, 200);
  const lastName  = String(body.lastName  || body.last_name  || "").trim().slice(0, 200);
  const phone     = String(body.phone     || "").trim().slice(0, 40) || null;
  const email     = String(body.email     || "").trim().toLowerCase().slice(0, 500) || null;

  const rawLanguage = String(body.language || "").trim().toUpperCase();
  const language = ["EN", "ES"].includes(rawLanguage) ? rawLanguage : null;

  const rawLeadSource = String(body.leadSource || body.lead_source || "").trim().toLowerCase();
  const leadSource = ["website", "facebook", "business_card", "direct"].includes(rawLeadSource)
    ? rawLeadSource
    : "direct";

  const menuSelection = String(body.menuSelection || body.menu_selection || "").trim().slice(0, 500) || null;

  if (!firstName || !lastName) {
    return json(res, 400, { ok: false, error: "firstName and lastName are required" });
  }

  // Insert into Supabase whatsapp_leads
  const insertRow = {
    first_name:     firstName,
    last_name:      lastName,
    phone:          phone,
    email:          email,
    language:       language,
    lead_source:    leadSource,
    menu_selection: menuSelection,
  };

  let rowId;
  try {
    rowId = await supabaseInsert(supabaseUrl, supabaseKey, insertRow);
  } catch (e) {
    console.error("whatsapp-lead-webhook supabase insert", e);
    return json(res, 500, { ok: false, error: "Could not save to Supabase", detail: e.message });
  }

  // HubSpot sync — skip if no token or no email
  if (!hubspotToken || !email) {
    return json(res, 200, {
      ok: true,
      id: rowId,
      hubspot: { contactId: null, error: null, skipped: true },
    });
  }

  const hsProps = {
    email,
    firstname: firstName,
    lastname:  lastName,
    lead_source_detail: leadSource,
  };
  if (phone)    hsProps.phone = phone;
  if (language) hsProps.preferred_language = language;

  let contactId  = null;
  let hubspotErr = null;
  let isNew      = false;

  try {
    const existingId = await hubspotFindContactByEmail(hubspotToken, email);
    if (existingId) {
      // Update existing contact and add a note about the new WhatsApp submission
      await hubspotUpdateContact(hubspotToken, existingId, hsProps);
      contactId = existingId;
      const note = [
        `WhatsApp lead re-submitted via ${leadSource}.`,
        `Name: ${firstName} ${lastName}`,
        `Phone: ${phone || "not provided"}`,
        `Language: ${language || "unknown"}`,
        `Menu selection: ${menuSelection || "none"}`,
      ].join("\n");
      await hubspotAddNote(hubspotToken, contactId, note);
    } else {
      contactId = await hubspotCreateContact(hubspotToken, hsProps);
      isNew = true;
    }
  } catch (e) {
    hubspotErr = e.message || String(e);
    console.error("whatsapp-lead-webhook hubspot", e);
  }

  // Patch Supabase row with HubSpot contact ID
  if (rowId && contactId) {
    try {
      await supabasePatch(supabaseUrl, supabaseKey, rowId, {
        hubspot_deal_id: contactId,
      });
    } catch (e) {
      console.error("whatsapp-lead-webhook supabase patch", e);
    }
  }

  return json(res, 200, {
    ok: true,
    id: rowId,
    hubspot: { contactId, isNew, error: hubspotErr || null },
  });
};
