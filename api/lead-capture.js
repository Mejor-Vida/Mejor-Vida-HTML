/**
 * POST /api/lead-capture
 * ManyChat External Request — full lead after email (e.g. Box 12).
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET, HUBSPOT_ACCESS_TOKEN (optional)
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { insertManychatLead } = require("../lib/supabase");
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
  logRequest("lead-capture");
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
  const email = String(body.email || "").trim().toLowerCase().slice(0, 500);
  const age = body.age != null && body.age !== "" ? parseInt(body.age, 10) : null;
  const sex = String(body.sex || body.gender || "").trim().slice(0, 50) || null;
  const tobacco =
    body.tobacco === true || body.tobacco === "true" || body.tobacco === "yes"
      ? true
      : body.tobacco === false || body.tobacco === "false" || body.tobacco === "no"
        ? false
        : null;
  const language = String(body.language || "English").trim().slice(0, 50) || "English";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { success: false, error: "Valid email required" });
  }
  if (!firstName) {
    return json(res, 400, { success: false, error: "first_name required" });
  }

  const row = {
    first_name: firstName,
    phone: phone || null,
    email,
    age: Number.isFinite(age) ? age : null,
    sex,
    tobacco,
    language,
    tag: "Lead_NE",
    pipeline_stage: "qualified",
    source: "whatsapp",
    drop_off: false,
    drop_off_stage: null,
  };

  const baseProps = {
    email,
    firstname: firstName,
    phone: phone || undefined,
  };

  const customProps = {};
  if (row.age != null) customProps.age = String(row.age);
  if (sex) customProps.gender = sex;
  if (tobacco !== null) customProps.tobacco_user = String(tobacco);
  if (language) customProps.preferred_language = language;

  const settled = await Promise.allSettled([
    insertManychatLead(supabaseUrl, supabaseKey, row),
    hubspotToken
      ? createOrUpdateContact(hubspotToken, baseProps, customProps)
      : Promise.resolve(null),
  ]);

  if (settled[0].status === "rejected") {
    console.error("lead-capture supabase", settled[0].reason);
    return json(res, 500, { success: false, error: "Could not save lead" });
  }

  const leadId = settled[0].value;
  if (settled[1].status === "rejected") {
    console.error("lead-capture hubspot", settled[1].reason);
  }

  return json(res, 200, { success: true, lead_id: leadId });
};
