/**
 * POST /api/analytics-event
 * Logs funnel events to Supabase (analytics_events) and first-touch timestamps on quote_lead_submissions.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Browser calls are restricted via verifySiteOrigin (see lib/site-origin.js).
 */

const { verifySiteOrigin } = require("../lib/site-origin");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

const ALLOWED_EVENTS = new Set([
  "quote_results_viewed",
  "schedule_modal_opened",
  "call_scheduled_indicated",
]);

const TIMESTAMP_BY_EVENT = {
  quote_results_viewed: "quote_results_viewed_at",
  schedule_modal_opened: "schedule_modal_opened_at",
  call_scheduled_indicated: "call_scheduled_at",
};

async function supabaseGetSubmissionTimestamps(supabaseUrl, serviceKey, id) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_lead_submissions?id=eq.${encodeURIComponent(
    id
  )}&select=quote_results_viewed_at,schedule_modal_opened_at,call_scheduled_at`;
  const r = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  return row || null;
}

async function supabaseInsertEvent(supabaseUrl, serviceKey, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/analytics_events`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`analytics_events insert ${r.status}: ${t.slice(0, 400)}`);
  }
}

async function supabasePatchSubmission(supabaseUrl, serviceKey, id, fields) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_lead_submissions?id=eq.${encodeURIComponent(
    id
  )}`;
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
    throw new Error(`quote_lead_submissions patch ${r.status}: ${t.slice(0, 400)}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const gate = verifySiteOrigin(req);
  if (!gate.ok) {
    return json(res, gate.status || 403, { ok: false, error: gate.error || "Forbidden" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

  const eventType = String(body.eventType || body.event_type || "").trim();
  if (!eventType || !ALLOWED_EVENTS.has(eventType)) {
    return json(res, 400, { ok: false, error: "Invalid or missing eventType" });
  }

  const quoteLeadSubmissionId = body.quoteLeadSubmissionId || body.quote_lead_submission_id;
  const submissionId =
    quoteLeadSubmissionId && isUuid(quoteLeadSubmissionId) ? String(quoteLeadSubmissionId) : null;

  const sessionClientId = body.sessionClientId
    ? String(body.sessionClientId).trim().slice(0, 128)
    : body.session_client_id
      ? String(body.session_client_id).trim().slice(0, 128)
      : null;

  const contactId = body.contactId || body.contact_id;
  const contactUuid = contactId && isUuid(contactId) ? String(contactId) : null;

  const eventData =
    body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : {};
  const source = String(body.source || "website").trim().slice(0, 64) || "website";

  const nowIso = new Date().toISOString();

  const insertRow = {
    event_type: eventType,
    event_data: eventData,
    session_client_id: sessionClientId,
    source,
    quote_lead_submission_id: submissionId,
    contact_id: contactUuid,
  };

  try {
    await supabaseInsertEvent(supabaseUrl, supabaseKey, insertRow);
  } catch (e) {
    console.error("analytics-event insert", e);
    return json(res, 500, { ok: false, error: "Could not log event" });
  }

  const col = TIMESTAMP_BY_EVENT[eventType];
  if (submissionId && col) {
    try {
      const existing = await supabaseGetSubmissionTimestamps(supabaseUrl, supabaseKey, submissionId);
      const patch = {};
      if (existing && !existing[col]) {
        patch[col] = nowIso;
      }
      if (Object.keys(patch).length) {
        await supabasePatchSubmission(supabaseUrl, supabaseKey, submissionId, patch);
      }
    } catch (e) {
      console.error("analytics-event first-touch patch", e);
    }
  }

  return json(res, 200, { ok: true });
};
