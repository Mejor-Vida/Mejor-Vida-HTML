/**
 * POST /api/out-of-state-referral
 * Receives out-of-state referral form submissions from quote-out-of-state.html.
 * Inserts into out_of_state_referrals (Supabase).
 * Sends email notification to referrals@mejorvidainsurance.com via Apps Script.
 * Does NOT sync to HubSpot CRM.
 *
 * Vercel env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *             OOS_EMAIL_NOTIFIER_URL (Google Apps Script web app URL),
 *             OOS_EMAIL_NOTIFIER_SECRET (optional; must match Apps Script script property OOS_SECRET)
 */

const { verifySiteOrigin } = require("../lib/site-origin");

function applyCors(req, res) {
  const gate = verifySiteOrigin(req);
  const origin = String(req.headers.origin || "").trim();
  if (gate.ok && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.mejorvidainsurance.com");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, payload, req) {
  applyCors(req, res);
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

/* -- Supabase insert -- */

async function supabaseInsert(supabaseUrl, serviceKey, table, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`;
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

/* -- Email notification via Apps Script web app -- */

async function sendEmailNotification(notifierUrl, leadData) {
  if (!notifierUrl) return { skipped: true, reason: "OOS_EMAIL_NOTIFIER_URL not set" };

  const secret = process.env.OOS_EMAIL_NOTIFIER_SECRET;
  const payload = { ...leadData };
  if (secret) {
    payload.notifierSecret = secret;
  }

  try {
    const r = await fetch(notifierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    const text = await r.text();
    return { sent: r.ok, status: r.status, response: text.slice(0, 200) };
  } catch (e) {
    return { sent: false, error: e.message };
  }
}

/* -- Main handler -- */

module.exports = async function handler(req, res) {
  /* CORS preflight */
  if (req.method === "OPTIONS") {
    applyCors(req, res);
    return res.status(204).end();
  }

  /* Method check */
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method Not Allowed" }, req);
  }

  /* Env vars */
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const notifierUrl = process.env.OOS_EMAIL_NOTIFIER_URL;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, {
      ok: false,
      error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    }, req);
  }

  /* Parse body */
  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { ok: false, error: "Invalid JSON" }, req);
  }

  /* Honeypot check */
  if (body.website) {
    // Bot submission - silently accept but don't store
    return json(res, 200, { ok: true, id: null }, req);
  }

  /* Extract & sanitize fields */
  const firstName = String(body.firstName || "").trim().slice(0, 200);
  const lastName = String(body.lastName || "").trim().slice(0, 200);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 500);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const stateCode = String(body.state || "").trim().slice(0, 2).toUpperCase();
  const message = String(body.quoteSummary || "").trim().slice(0, 5000);
  const consent = Boolean(body.consentLicensedAgentInState);

  if (!email) {
    return json(res, 400, { ok: false, error: "Email is required" }, req);
  }
  if (!firstName) {
    return json(res, 400, { ok: false, error: "First name is required" }, req);
  }

  /* Supabase insert */
  const nowIso = new Date().toISOString();
  const insertRow = {
    first_name: firstName,
    last_name: lastName || null,
    email: email,
    phone: phone || null,
    state_code: stateCode || null,
    message: message || null,
    consent_licensed_agent: consent,
    source: "website_out_of_state_form",
    status: "new",
    created_at: nowIso,
  };

  let recordId;
  try {
    recordId = await supabaseInsert(
      supabaseUrl,
      supabaseKey,
      "out_of_state_referrals",
      insertRow
    );
  } catch (e) {
    console.error("out-of-state-referral supabase insert", e);
    return json(res, 500, { ok: false, error: "Could not save referral" }, req);
  }

  /* Email notification (best-effort, don't fail the request) */
  const emailResult = await sendEmailNotification(notifierUrl, {
    firstName,
    lastName,
    email,
    phone,
    stateCode,
    message,
    consent,
    recordId,
    submittedAt: nowIso,
  });

  return json(res, 200, {
    ok: true,
    id: recordId,
    email: emailResult,
  }, req);
};
