/**
 * POST /api/quote-lead-sync
 * Inserts quote_lead_submissions (Supabase) then syncs contact to HubSpot.
 * Used by quote.html and quote-out-of-state.html — in-browser quote tool posts follow-up here;
 * out-of-state referrals use source: out_of_state_referral.
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

/** Normalize UTM/referrer/path from body (quote.html sends originDetail + sessionClientId). */
function buildOriginDetail(body) {
  if (body.originDetail && typeof body.originDetail === "object" && !Array.isArray(body.originDetail)) {
    return body.originDetail;
  }
  if (body.analytics && typeof body.analytics === "object" && body.analytics.origin) {
    return typeof body.analytics.origin === "object" ? body.analytics.origin : {};
  }
  const o = {};
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
  ];
  for (const k of keys) {
    const v = body[k];
    if (v != null && String(v).trim()) o[k] = String(v).trim().slice(0, 500);
  }
  if (body.referrer != null && String(body.referrer).trim()) {
    o.referrer = String(body.referrer).trim().slice(0, 2000);
  }
  if (body.landingPath != null && String(body.landingPath).trim()) {
    o.landing_path = String(body.landingPath).trim().slice(0, 2000);
  } else if (body.page_path != null && String(body.page_path).trim()) {
    o.landing_path = String(body.page_path).trim().slice(0, 2000);
  }
  if (body.entryPage != null && String(body.entryPage).trim()) {
    o.entry_page = String(body.entryPage).trim().slice(0, 2000);
  }
  return o;
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
  const lang = body.lang === "en" ? "en" : "es";
  const leadSource =
    body.source === "out_of_state_referral"
      ? "out_of_state_referral"
      : body.source === "nebraska_quote_page"
        ? "nebraska_quote_page"
        : body.source === "facebook_landing_gastos_finales"
          ? "facebook_landing_gastos_finales"
          : "fexquotes_page";

  let stateCode = String(body.state || "")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  if (leadSource === "out_of_state_referral") {
    if (!stateCode || stateCode.length !== 2) {
      return json(res, 400, { ok: false, error: "State required (2 letters)" });
    }
    if (stateCode === "NE") {
      return json(res, 400, {
        ok: false,
        error: "Use the Nebraska quote flow for NE residents",
      });
    }
  } else if (leadSource === "nebraska_quote_page") {
    if (!stateCode || stateCode.length !== 2) {
      stateCode = "NE";
    }
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, error: "Valid email required" });
  }
  if (!firstName || !lastName) {
    return json(res, 400, { ok: false, error: "First and last name required" });
  }

  if (leadSource === "out_of_state_referral") {
    if (body.consentLicensedAgentInState !== true) {
      return json(res, 400, {
        ok: false,
        error: "Consent to contact by a licensed agent in your state is required",
      });
    }
  } else if (!body.consent) {
    return json(res, 400, { ok: false, error: "Consent required" });
  }

  let nebraskaQuote = null;
  if (leadSource === "nebraska_quote_page") {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return json(res, 400, { ok: false, error: "Valid phone number required" });
    }
    if (!quoteSummary) {
      return json(res, 400, { ok: false, error: "Quote summary required" });
    }
    const ageN = parseInt(String(body.age ?? ""), 10);
    if (!Number.isFinite(ageN) || ageN < 45 || ageN > 85) {
      return json(res, 400, { ok: false, error: "Valid age (45–85) required" });
    }
    const sex = String(body.sex || "").toLowerCase();
    if (sex !== "male" && sex !== "female") {
      return json(res, 400, { ok: false, error: "Gender required" });
    }
    const sm = body.smoker;
    const isSmoker = sm === true || sm === "true";
    const isNonSmoker = sm === false || sm === "false";
    if (!isSmoker && !isNonSmoker) {
      return json(res, 400, { ok: false, error: "Tobacco status required" });
    }
    nebraskaQuote = { ageN, sex, isSmoker };
  }

  const nowIso = new Date().toISOString();
  const payload = {
    firstName,
    lastName,
    email,
    phone,
    state: stateCode,
    lang,
    source: leadSource,
  };
  if (leadSource === "out_of_state_referral") {
    payload.consentLicensedAgentInState = true;
  }
  if (nebraskaQuote) {
    payload.age = nebraskaQuote.ageN;
    payload.sex = nebraskaQuote.sex;
    payload.smoker = nebraskaQuote.isSmoker;
    payload.quoteLow = body.quoteLow;
    payload.quoteHigh = body.quoteHigh;
    payload.quoteAnchor = body.quoteAnchor;
    payload.marketingOptIn = { sms: true, email: true, phoneCalls: true };
  }
  const originDetail = buildOriginDetail(body);
  const sessionClientId = body.sessionClientId
    ? String(body.sessionClientId).trim().slice(0, 128)
    : body.session_client_id
      ? String(body.session_client_id).trim().slice(0, 128)
      : null;

  const requestRaw = {
    ...payload,
    quoteSummary: quoteSummary || undefined,
    submittedAt: nowIso,
    originDetail,
    sessionClientId: sessionClientId || undefined,
  };

  let summaryForDb = quoteSummary || null;
  if (leadSource === "out_of_state_referral") {
    const prefix =
      lang === "es"
        ? `[Referencia fuera de NE — estado ${stateCode}]\n`
        : `[Out-of-state referral — state ${stateCode}]\n`;
    summaryForDb = prefix + (quoteSummary || "(no additional message)");
  }

  const quoteStatus =
    leadSource === "out_of_state_referral"
      ? "referral_requested"
      : quoteSummary
        ? "quote_generated"
        : "quote_requested";

  const consentSummary =
    leadSource === "out_of_state_referral"
      ? {
          licensedAgentInStateContact: true,
          referralProcessAgreed: true,
          contactMethods: ["phone", "email"],
          agreement:
            "User agreed to be contacted by phone and email by a licensed insurance agent in their state of residence",
          agreementVersion: "oos_licensed_agent_v2",
          at: nowIso,
          lang,
        }
      : {
          followUp: true,
          marketingOptIn: {
            sms: true,
            email: true,
            phoneCalls: true,
            label:
              "User opted in to SMS, email, and phone calls from Julie / Mejor Vida Insurance about this quote and related follow-up.",
          },
          at: nowIso,
          lang,
        };

  const insertRow = {
    source: leadSource,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    state_code: stateCode || null,
    lang,
    quote_summary: summaryForDb,
    consent_summary: consentSummary,
    payload,
    request_raw: requestRaw,
    quote_status: quoteStatus,
    quote_generated_at:
      (leadSource === "fexquotes_page" || leadSource === "nebraska_quote_page") && quoteSummary
        ? nowIso
        : null,
    crm_sync_needed: true,
    origin_detail: originDetail,
    session_client_id: sessionClientId || null,
  };

  if (nebraskaQuote) {
    insertRow.age = nebraskaQuote.ageN;
    insertRow.gender = nebraskaQuote.sex;
    insertRow.tobacco = nebraskaQuote.isSmoker ? "yes" : "no";
    insertRow.coverage = 10000;
  }

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
  if (stateCode) hsProps.state = stateCode;

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
