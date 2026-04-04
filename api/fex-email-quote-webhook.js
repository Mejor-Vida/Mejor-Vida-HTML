/**
 * POST /api/fex-email-quote-webhook
 * Vercel serverless: Make.com (Gmail) → forwarded FEX quote emails → Supabase + HubSpot.
 * Patterns match api/quote-lead-sync.js.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HUBSPOT_ACCESS_TOKEN, FEX_EMAIL_WEBHOOK_SECRET
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
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/fex_email_quotes`;
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
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/fex_email_quotes?id=eq.${encodeURIComponent(id)}`;
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

function intOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const secret = process.env.FEX_EMAIL_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!secret) {
    return json(res, 500, {
      ok: false,
      error: "Server missing FEX_EMAIL_WEBHOOK_SECRET",
    });
  }
  if (bearerToken(req) !== secret) {
    return json(res, 401, { ok: false, error: "Unauthorized" });
  }

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

  const senderEmail = String(body.senderEmail || body.sender_email || "")
    .trim()
    .toLowerCase();
  const senderName = String(body.senderName || body.sender_name || "").trim().slice(0, 300);
  const subject = String(body.subject || "").trim().slice(0, 500);
  const bodyPlain = String(body.bodyPlain || body.body_plain || "").slice(0, 500000);
  const bodyHtml = String(body.bodyHtml || body.body_html || "").slice(0, 500000);
  const receivedAtRaw = body.receivedAt || body.received_at;
  const receivedAtIso = receivedAtRaw
    ? new Date(receivedAtRaw).toISOString()
    : new Date().toISOString();

  const parsed = body.parsed && typeof body.parsed === "object" ? body.parsed : {};
  let firstName = String(parsed.firstName || parsed.first_name || "").trim().slice(0, 200);
  let lastName = String(parsed.lastName || parsed.last_name || "").trim().slice(0, 200);
  const phone = String(parsed.phone || "").trim().slice(0, 40) || null;
  const age = intOrNull(parsed.age);
  const stateCode =
    String(parsed.state || parsed.stateCode || "")
      .trim()
      .slice(0, 2)
      .toUpperCase() || null;
  const quoteSummary =
    String(parsed.quoteSummary || parsed.summary || "").trim().slice(0, 20000) || null;

  if ((!firstName || !lastName) && senderName) {
    const parts = senderName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      firstName = firstName || parts[0];
      lastName = lastName || parts.slice(1).join(" ");
    } else if (parts.length === 1) {
      firstName = firstName || parts[0];
      lastName = lastName || ".";
    }
  }

  if (!senderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
    return json(res, 400, { ok: false, error: "Valid senderEmail required" });
  }
  if (!firstName || !lastName) {
    return json(res, 400, {
      ok: false,
      error: "firstName and lastName required (parsed or splittable senderName)",
    });
  }

  const nowIso = new Date().toISOString();
  const rawPayload = { ...body, _receivedByWebhookAt: nowIso };

  const insertRow = {
    source: "fex_email_quote",
    sender_email: senderEmail,
    sender_name: senderName || null,
    subject: subject || null,
    body_plain: bodyPlain || null,
    body_html: bodyHtml || null,
    received_at: receivedAtIso,
    first_name: firstName,
    last_name: lastName,
    phone,
    age,
    state_code: stateCode,
    quote_summary: quoteSummary,
    raw_payload: rawPayload,
    processing_status: "received",
  };

  let rowId;
  try {
    rowId = await supabaseInsert(supabaseUrl, supabaseKey, insertRow);
  } catch (e) {
    console.error("fex-email-quote-webhook supabase", e);
    return json(res, 500, { ok: false, error: "Could not save to Supabase", detail: e.message });
  }

  if (!hubspotToken) {
    return json(res, 200, {
      ok: true,
      id: rowId,
      hubspot: { contactId: null, error: null, skipped: true },
    });
  }

  const hsProps = {
    email: senderEmail,
    firstname: firstName,
    lastname: lastName,
  };
  if (phone) hsProps.phone = phone;
  if (stateCode) hsProps.state = stateCode;

  let contactId = null;
  let hubspotErr = null;

  try {
    const existingId = await hubspotFindContactByEmail(hubspotToken, senderEmail);
    if (existingId) {
      await hubspotUpdateContact(hubspotToken, existingId, hsProps);
      contactId = existingId;
    } else {
      contactId = await hubspotCreateContact(hubspotToken, hsProps);
    }
  } catch (e) {
    hubspotErr = e.message || String(e);
    console.error("fex-email-quote-webhook hubspot", e);
  }

  try {
    await supabasePatch(supabaseUrl, supabaseKey, rowId, {
      hubspot_contact_id: contactId,
      hubspot_sync_status: contactId ? "synced" : "failed",
      hubspot_sync_error: hubspotErr,
    });
  } catch (e) {
    console.error("fex-email-quote-webhook supabase patch", e);
  }

  return json(res, 200, {
    ok: true,
    id: rowId,
    hubspot: {
      contactId,
      error: hubspotErr || null,
    },
  });
};
