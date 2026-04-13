/**
 * POST /api/lead-intake
 *
 * Called from ManyChat immediately after a lead picks their language
 * (the earliest moment we know they're a real WhatsApp user).
 *
 * Creates/updates the contact in Supabase (contacts + lead_state) and
 * logs a language_picked event. This is the entry point for every lead
 * into the v2 pipeline — Supabase becomes the source of truth from here.
 *
 * ManyChat sends:
 *   phone        (required) WhatsApp phone number, E.164 preferred
 *   whatsapp_id  (optional) ManyChat subscriber ID
 *   language     (required) 'english' or 'spanish'
 *   full_name    (optional) subscriber full name
 *   us_state     (optional) defaults to 'NE'
 *
 * Returns:
 *   { success: true, contact_id: "...", created: true|false }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { upsertContact, upsertLeadState, insertEvent, logWebhook } = require("../lib/contacts-db");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  logRequest("lead-intake");

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
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  // ── Validate required fields ──────────────────────────────────────────────
  const phone = String(body.phone || "").trim();
  if (!phone) {
    return json(res, 400, { success: false, error: "phone is required" });
  }

  const language = String(body.language || "english").trim().toLowerCase();
  if (!["english", "spanish"].includes(language)) {
    return json(res, 400, { success: false, error: "language must be 'english' or 'spanish'" });
  }

  const whatsappId = String(body.whatsapp_id || "").trim() || null;
  const fullName = String(body.full_name || body.name || "").trim().slice(0, 200) || null;
  const usState = String(body.us_state || "NE").trim().toUpperCase().slice(0, 5);

  // ── Log incoming webhook (fire-and-forget) ───────────────────────────────
  logWebhook(supabaseUrl, supabaseKey, "manychat", "/api/lead-intake", { phone, language, whatsapp_id: whatsappId });

  try {
    // 1. Upsert contact — idempotent on phone
    const { contactId, created } = await upsertContact(supabaseUrl, supabaseKey, phone, {
      full_name: fullName,
      language,
      whatsapp_id: whatsappId,
      us_state: usState,
      source: "whatsapp",
    });

    // 2. Upsert lead_state — set stage to 'engaged', record language_picked_at
    await upsertLeadState(supabaseUrl, supabaseKey, contactId, {
      pipeline_stage: "engaged",
      language_picked_at: new Date().toISOString(),
    });

    // 3. Append event to audit trail
    await insertEvent(supabaseUrl, supabaseKey, contactId, "language_picked", {
      language,
      us_state: usState,
    });

    return json(res, 200, { success: true, contact_id: contactId, created });
  } catch (e) {
    console.error("lead-intake error:", e.message);
    return json(res, 500, { success: false, error: "Server error saving lead" });
  }
};
