/**
 * POST /api/quote-lead-sync
 * Inserts quote_lead_submissions (Supabase) then syncs contact to HubSpot.
 * Used by quote.html and quote-out-of-state.html — in-browser quote tool posts follow-up here;
 * out-of-state referrals use source: out_of_state_referral.
 *
 * Vercel env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HUBSPOT_ACCESS_TOKEN,
 *             META_CAPI_ACCESS_TOKEN (Meta Conversions API — Lead on gastos-finales landings),
 *             GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_FROM_EMAIL
 */


const { sendQuoteLeadNotification } = require("../lib/ic-lead-notify");
const { sendMetaCapiWebsiteEvent, capiClientUserAgent, capiClientIp } = require("../lib/meta-capi");
const {
  CONSENT_CONTACT_DAYS,
  consentExpiresAt,
  logComplianceEvent,
  clearActiveFeedPartitionHides,
} = require("../lib/crm-compliance");

function applyCors(req, res) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

/** ISO YYYY-MM-DD → age in full years (18–85 validated separately). */
function ageFromIsoDob(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  const birth = new Date(y, mo, d);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
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

async function sendMetaCAPIEvent({
  leadSource,
  email,
  phone,
  firstName,
  lastName,
  sex,
  city,
  state,
  zip,
  dob,
  originDetail,
  eventId,
  metaFbp,
  metaFbc,
  clientUserAgent,
  sessionClientId,
  req,
}) {
  const result = await sendMetaCapiWebsiteEvent({
    eventName: "Lead",
    eventId,
    originDetail,
    leadSource,
    req,
    body: {
      email,
      phone,
      firstName,
      lastName,
      sex,
      city,
      state,
      zip,
      country: "us",
      dob,
      metaFbp,
      metaFbc,
      clientUserAgent,
      sessionClientId,
      metaLeadEventId: eventId,
      eventId,
    },
    customData: { currency: "USD", value: 0 },
  });
  if (result.skipped) {
    console.log("[CAPI] Lead skipped", result.reason);
  }
  return result;
}

function resolveLeadSource(body) {
  const src = String((body && body.source) || "").trim();
  if (src === "out_of_state_referral") return "out_of_state_referral";
  if (src === "nebraska_term_quote_page") return "nebraska_term_quote_page";
  if (src === "nebraska_quote_page") return "nebraska_quote_page";
  if (src === "facebook_landing_gastos_finales") return "facebook_landing_gastos_finales";
  if (src === "english_landing_gastos_finales") return "english_landing_gastos_finales";
  return "fexquotes_page";
}

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
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
  const leadSource = resolveLeadSource(body);

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
  } else if (leadSource === "nebraska_quote_page" || leadSource === "nebraska_term_quote_page") {
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
  }

  const smsConsentOptIn = body.consent === true || body.consent === "true";
  const clientIp = capiClientIp(req);
  const consentTextRaw = String(
    body.consentText || body.consent_text || body.consentLabel || ""
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
  const consentUrl = String(body.consentUrl || body.consent_url || "")
    .trim()
    .slice(0, 2000);
  const consentUa = capiClientUserAgent(req, body);

  let nebraskaQuote = null;
  if (leadSource === "nebraska_quote_page" || leadSource === "nebraska_term_quote_page") {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return json(res, 400, { ok: false, error: "Valid phone number required" });
    }
    if (!quoteSummary) {
      return json(res, 400, { ok: false, error: "Quote summary required" });
    }
    let ageN = parseInt(String(body.age ?? ""), 10);
    const dobIso = String(body.dob || body.dateOfBirth || "").trim();
    if (dobIso) {
      const fromDob = ageFromIsoDob(dobIso);
      if (fromDob == null) {
        return json(res, 400, { ok: false, error: "Valid date of birth required" });
      }
      ageN = fromDob;
    }
    if (!Number.isFinite(ageN) || ageN < 18 || ageN > 85) {
      return json(res, 400, {
        ok: false,
        error: "Quotes are available for ages 18–85.",
      });
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
  const consentExpires = consentExpiresAt(nowIso, CONSENT_CONTACT_DAYS);
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
    const cov = parseInt(String(body.coverageAmount || body.coverage || ""), 10);
    if (Number.isFinite(cov) && cov > 0) payload.coverageAmount = cov;
    const dobIso = String(body.dob || body.dateOfBirth || "").trim();
    if (dobIso) payload.dob = dobIso.slice(0, 10);
  }
  if (leadSource !== "out_of_state_referral") {
    payload.marketingOptIn = {
      sms: smsConsentOptIn,
      email: true,
      phoneCalls: smsConsentOptIn,
    };
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
          ip: clientIp || null,
          url: consentUrl || null,
          userAgent: consentUa || null,
          expiresAt: consentExpires,
        }
      : {
          followUp: true,
          smsOptIn: smsConsentOptIn,
          voiceOptIn: smsConsentOptIn,
          marketingOptIn: {
            sms: smsConsentOptIn,
            email: true,
            phoneCalls: smsConsentOptIn,
            label: consentTextRaw
              ? consentTextRaw.slice(0, 500)
              : smsConsentOptIn
                ? "User opted in to SMS via optional checkbox on quote form."
                : "User submitted quote without SMS opt-in (optional checkbox unchecked).",
          },
          consentText: consentTextRaw || null,
          ip: clientIp || null,
          url: consentUrl || null,
          userAgent: consentUa || null,
          at: nowIso,
          expiresAt: consentExpires,
          consentWindowDays: CONSENT_CONTACT_DAYS,
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
      (leadSource === "fexquotes_page" ||
        leadSource === "nebraska_quote_page" ||
        leadSource === "nebraska_term_quote_page") &&
      quoteSummary
        ? nowIso
        : null,
    crm_sync_needed: true,
    origin_detail: originDetail,
    session_client_id: sessionClientId || null,
    consent_ip: clientIp || null,
    consent_text: consentTextRaw || null,
    consent_url: consentUrl || null,
    consent_user_agent: consentUa || null,
    consent_captured_at: nowIso,
    consent_expires_at: consentExpires,
  };

  if (nebraskaQuote) {
    insertRow.age = nebraskaQuote.ageN;
    insertRow.gender = nebraskaQuote.sex;
    insertRow.tobacco = nebraskaQuote.isSmoker ? "yes" : "no";
    const cov = parseInt(String(body.coverageAmount || body.coverage || 10000), 10);
    if (leadSource === "nebraska_term_quote_page") {
      insertRow.coverage =
        Number.isFinite(cov) && cov >= 25000 && cov <= 5000000 ? cov : 250000;
    } else {
      insertRow.coverage =
        Number.isFinite(cov) && cov >= 2000 && cov <= 50000 ? cov : 10000;
    }
  }

  let leadId;
  try {
    leadId = await supabaseInsert(supabaseUrl, supabaseKey, insertRow);
  } catch (e) {
    console.error("quote-lead-sync supabase", e);
    return json(res, 500, { ok: false, error: "Could not save lead" });
  }

  // New inbound quote should resurface in Active Feed even if this person was archived.
  try {
    await clearActiveFeedPartitionHides(supabaseUrl, supabaseKey, { email, phone });
  } catch (e) {
    console.warn("quote-lead-sync clear partition hides", e && e.message);
  }

  try {
    await logComplianceEvent(supabaseUrl, supabaseKey, {
      leadId,
      leadSourceTable: "quote_lead_submissions",
      eventType: smsConsentOptIn ? "consent_captured" : "form_submitted_no_sms_opt_in",
      title: smsConsentOptIn
        ? "Landing form consent captured (SMS + voice window)"
        : "Landing form submitted without SMS opt-in",
      actor: "system:quote-lead-sync",
      detail: {
        ip: clientIp,
        consent_text: consentTextRaw || null,
        consent_url: consentUrl || null,
        user_agent: consentUa || null,
        sms_opt_in: smsConsentOptIn,
        voice_opt_in: smsConsentOptIn,
        captured_at: nowIso,
        expires_at: consentExpires,
        consent_window_days: CONSENT_CONTACT_DAYS,
        source: leadSource,
        email,
        phone: phone || null,
        state: stateCode || null,
      },
    });
  } catch (e) {
    console.warn("quote-lead-sync compliance event", e && e.message);
  }

  const capiEventId =
    String(body.metaLeadEventId || body.eventId || "").trim().slice(0, 128) ||
    sessionClientId ||
    (leadId ? `lead-${leadId}` : null);

  const leadDob = String(body.dob || body.dateOfBirth || "").trim().slice(0, 10) || null;
  const leadCity = String(body.city || "").trim().slice(0, 120) || null;
  const leadZip = String(body.zip || "").trim().slice(0, 16) || null;

  const capiBase = {
    leadSource,
    email,
    phone,
    firstName,
    lastName,
    sex: body.sex,
    city: leadCity,
    state: stateCode,
    zip: leadZip,
    dob: leadDob,
    originDetail,
    eventId: capiEventId,
    metaFbp: body.metaFbp,
    metaFbc: body.metaFbc,
    clientUserAgent: capiClientUserAgent(req, body),
    sessionClientId,
    req,
  };

  if (!hubspotToken) {
    await sendMetaCAPIEvent(capiBase);
    await sendQuoteLeadNotification({
      leadSource,
      firstName,
      lastName,
      email,
      phone,
      age: body.age,
      sex: body.sex,
      smoker: body.smoker,
      quoteLow: body.quoteLow,
      quoteHigh: body.quoteHigh,
      quoteAnchor: body.quoteAnchor,
      quoteSummary,
      state: stateCode,
      address: body.address,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      zip: body.zip,
      county: body.county,
      dob: body.dob || body.dateOfBirth,
      lang,
      leadId,
      submittedAt: nowIso,
      originDetail,
      sessionClientId,
    });
    return json(res, 200, {
      ok: true,
      id: leadId,
      metaLeadEventId: capiEventId,
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

  await sendMetaCAPIEvent(capiBase);

  await sendQuoteLeadNotification({
    leadSource,
    firstName,
    lastName,
    email,
    phone,
    age: body.age,
    sex: body.sex,
    smoker: body.smoker,
    quoteLow: body.quoteLow,
    quoteHigh: body.quoteHigh,
    quoteAnchor: body.quoteAnchor,
    quoteSummary,
    state: stateCode,
    address: body.address,
    addressLine1: body.addressLine1,
    addressLine2: body.addressLine2,
    city: body.city,
    zip: body.zip,
    county: body.county,
    dob: body.dob || body.dateOfBirth,
    lang,
    leadId,
    submittedAt: nowIso,
    originDetail,
    sessionClientId,
  });

  return json(res, 200, {
    ok: true,
    id: leadId,
    metaLeadEventId: capiEventId,
    hubspot: {
      contactId: hubspotContactId,
      error: hubspotErr || null,
    },
  });
};
