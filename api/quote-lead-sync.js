/**
 * POST /api/quote-lead-sync
 * Inserts quote_lead_submissions (Supabase) then syncs contact to HubSpot.
 * Used by quote.html — FEX iframe cannot send data cross-origin; the form captures lead + optional pasted quote text.
 *
 * Vercel env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HUBSPOT_ACCESS_TOKEN
 */

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

async function supabaseInsert(supabaseUrl, serviceKey, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_lead_submissions`;
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
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_lead_submissions?id=eq.${encodeURIComponent(id)}`;
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
        {
          filters: [{ propertyName: "email", operator: "EQ", value: email }],
        },
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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, {
      ok: false,
      error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  if (body.website || body.company_website) {
    return json(res, 200, { ok: true });
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const firstName = String(body.firstName || "").trim().slice(0, 200);
  const lastName = String(body.lastName || "").trim().slice(0, 200);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const quoteSummary = String(body.quoteSummary || "").trim().slice(0, 20000);
  const stateCode = String(body.state || "")
    .trim()
    .slice(0, 2)
    .toUpperCase();
  const lang = body.lang === "en" ? "en" : "es";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, error: "Valid email required" });
  }
  if (!firstName || !lastName) {
    return json(res, 400, { ok: false, error: "First and last name required" });
  }
  if (!body.consent) {
    return json(res, 400, { ok: false, error: "Consent required" });
  }

  const nowIso = new Date().toISOString();
  const payload = {
    firstName,
    lastName,
    email,
    phone,
    state: stateCode,
    lang,
    source: "fexquotes_page",
  };
  const requestRaw = {
    ...payload,
    quoteSummary: quoteSummary || undefined,
    submittedAt: nowIso,
  };

  const insertRow = {
    source: "fexquotes_page",
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    state_code: stateCode || null,
    lang,
    quote_summary: quoteSummary || null,
    consent_summary: { followUp: true, at: nowIso },
    payload,
    request_raw: requestRaw,
    quote_status: quoteSummary ? "quote_generated" : "quote_requested",
    quote_generated_at: quoteSummary ? nowIso : null,
    crm_sync_needed: true,
  };

  let leadId;
  try {
    leadId = await supabaseInsert(supabaseUrl, supabaseKey, insertRow);
  } catch (e) {
    console.error("quote-lead-sync supabase", e);
    return json(res, 500, { ok: false, error: "Could not save lead" });
  }

  if (!hubspotToken) {
    return json(res, 200, {
      ok: true,
      id: leadId,
      hubspot: { skipped: true, reason: "HUBSPOT_ACCESS_TOKEN not set" },
    });
  }

  const hsProps = {
    email,
    firstname: firstName,
    lastname: lastName,
  };
  if (phone) hsProps.phone = phone;

  let hubspotContactId = null;
  let hubspotErr = null;
  try {
    const existingId = await hubspotFindContactByEmail(hubspotToken, email);
    if (existingId) {
      await hubspotUpdateContact(hubspotToken, existingId, hsProps);
      hubspotContactId = existingId;
    } else {
      hubspotContactId = await hubspotCreateContact(hubspotToken, hsProps);
    }
  } catch (e) {
    hubspotErr = e.message || String(e);
    console.error("quote-lead-sync hubspot", e);
  }

  try {
    await supabasePatch(supabaseUrl, supabaseKey, leadId, {
      hubspot_contact_id: hubspotContactId,
      hubspot_sync_status: hubspotContactId ? "synced" : "failed",
      hubspot_sync_error: hubspotErr,
      crm_sync_needed: !hubspotContactId,
      hubspot_last_sync_at: hubspotContactId ? nowIso : null,
    });
  } catch (e) {
    console.error("quote-lead-sync supabase patch", e);
  }

  return json(res, 200, {
    ok: true,
    id: leadId,
    hubspot: {
      contactId: hubspotContactId,
      error: hubspotErr || null,
    },
  });
};
