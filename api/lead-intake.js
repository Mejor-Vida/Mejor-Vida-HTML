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
 *   phone            WhatsApp phone, E.164 preferred (required unless an existing row is found by whatsapp_id)
 *   whatsapp_id      ManyChat / WhatsApp subscriber id (optional; used to match existing contact)
 *   first_name, last_name, full_name, email (optional)
 *   language         english | spanish (required)
 *   edad             age (optional; alias: age)
 *   sexo             Hombre | Mujer (optional; stored as gender male | female; alias: gender)
 *   tabaco           Sí | No (optional; alias: is_smoker)
 *   quote_low, quote_high  (optional; display strings from quote tool)
 *   us_state         (optional) defaults to 'NE'
 *
 * Upsert: matches contacts by phone first, then by whatsapp_id / manychat_subscriber_id — updates in place.
 *
 * Returns:
 *   { success: true, contact_id: "...", created: true|false }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET,
 *      HUBSPOT_ACCESS_TOKEN, HUBSPOT_PIPELINE_ID (optional HubSpot sync after intake)
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const {
  upsertContact,
  upsertLeadState,
  insertEvent,
  logWebhook,
  getContactsByManychatSubscriberId,
  getLeadState,
} = require("../lib/contacts-db");
const { syncContactToHubspot } = require("../lib/hubspot-sync-lib");
const { logIntegrationAudit } = require("../lib/integration-audit");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

const UNRESOLVED_TEMPLATE = /^\{\{[\s\S]*\}\}$/;

function cleanManychatValue(v) {
  const s = String(v == null ? "" : v).trim();
  if (!s || UNRESOLVED_TEMPLATE.test(s)) return "";
  return s;
}

function parseBool(val) {
  if (val === true || val === "true" || val === "yes" || val === "sí" || val === "si" || val === "Sí" || val === "Si") {
    return true;
  }
  if (val === false || val === "false" || val === "no" || val === "No") return false;
  return null;
}

/** Normalize Spanish / English gender labels to lead_state values (male | female). */
function parseGender(val) {
  const s = String(val == null ? "" : val).trim().toLowerCase();
  if (!s || UNRESOLVED_TEMPLATE.test(s)) return null;
  if (["hombre", "m", "male", "masculino", "masculine"].includes(s)) return "male";
  if (["mujer", "f", "female", "femenino", "feminine"].includes(s)) return "female";
  return null;
}

const STAGE_ORDER = [
  "new_contact",
  "engaged",
  "referral_requested",
  "nebraska_lead",
  "initiated",
  "partially_qualified",
  "quoted",
  "call_scheduled",
  "call_completed",
  "policy_issued",
  "closed_lost",
  "dropped",
];

function stageRank(stage) {
  const i = STAGE_ORDER.indexOf(stage || "new_contact");
  if (i === -1) return 50;
  return i;
}

function maxPipelineStage(a, b) {
  return stageRank(b) > stageRank(a) ? b : a;
}

/** Infer minimum stage from qualification + quote data (does not downgrade). */
function inferStageFromIntakePayload({ age, gender, isSmoker, quoteLow, quoteHigh }) {
  const hasQuote = !!(quoteLow && quoteHigh);
  const partial =
    age != null && Number.isFinite(age) && gender && isSmoker !== null && isSmoker !== undefined;
  if (hasQuote) return "quoted";
  if (partial) return "partially_qualified";
  return "engaged";
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

  // ── Resolve phone (E.164) — may be filled from whatsapp_id → existing contact ──
  let phone = cleanManychatValue(body.phone);
  const whatsappPhone = cleanManychatValue(body.whatsapp_phone);
  if (!phone && whatsappPhone) phone = whatsappPhone;

  const whatsappId =
    cleanManychatValue(body.whatsapp_id || body.manychat_subscriber_id || body.subscriber_id || body.manychat_id) ||
    null;
  const manychatSubscriberId = cleanManychatValue(body.subscriber_id || body.manychat_id) || null;

  if (!phone && whatsappId) {
    try {
      const rows = await getContactsByManychatSubscriberId(supabaseUrl, supabaseKey, whatsappId);
      const match = rows.find((c) => cleanManychatValue(c.phone)) || rows[0];
      if (match && match.phone) phone = String(match.phone).trim();
    } catch (_) {
      /* ignore */
    }
  }

  const widDigits = whatsappId ? whatsappId.replace(/\D/g, "") : "";
  if (!phone && widDigits.length >= 10 && widDigits.length <= 15) {
    phone = (whatsappId && String(whatsappId).trim().startsWith("+") ? "+" : "") + widDigits;
  }

  if (!phone) {
    return json(res, 400, {
      success: false,
      error: "phone is required (or whatsapp_id must match an existing contact)",
    });
  }

  const language = cleanManychatValue(body.language || "english").toLowerCase();
  if (!["english", "spanish"].includes(language)) {
    return json(res, 400, { success: false, error: "language must be 'english' or 'spanish'" });
  }

  // Prefer explicit first_name/last_name from the ManyChat body.
  let firstName = cleanManychatValue(body.first_name || body.firstName).slice(0, 200);
  let lastName = cleanManychatValue(body.last_name || body.lastName).slice(0, 200);
  if (!firstName && !lastName) {
    const combined = cleanManychatValue(body.full_name || body.name);
    if (combined) {
      const spaceIdx = combined.indexOf(" ");
      if (spaceIdx === -1) {
        firstName = combined.slice(0, 200);
      } else {
        firstName = combined.slice(0, spaceIdx).slice(0, 200);
        lastName = combined.slice(spaceIdx + 1).trim().slice(0, 200);
      }
    }
  }
  firstName = firstName || null;
  lastName = lastName || null;

  const rawEmail = cleanManychatValue(body.email).toLowerCase();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail.slice(0, 500) : null;

  const usState = String(body.us_state || "NE").trim().toUpperCase().slice(0, 5);

  let age = null;
  const ageRaw = body.edad !== undefined && body.edad !== "" ? body.edad : body.age;
  if (ageRaw !== undefined && ageRaw !== null && ageRaw !== "") {
    const n = parseInt(String(ageRaw).replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(n) && n > 0 && n < 130) age = n;
  }

  const gender = parseGender(body.sexo) || parseGender(body.gender);

  let isSmoker = null;
  if (body.tabaco !== undefined && body.tabaco !== null && body.tabaco !== "") {
    isSmoker = parseBool(body.tabaco);
  } else if (body.is_smoker !== undefined && body.is_smoker !== null && body.is_smoker !== "") {
    isSmoker = parseBool(body.is_smoker);
  }

  const quoteLow = cleanManychatValue(body.quote_low).slice(0, 200) || null;
  const quoteHigh = cleanManychatValue(body.quote_high).slice(0, 200) || null;

  // ── Log incoming webhook (fire-and-forget) ───────────────────────────────
  logWebhook(supabaseUrl, supabaseKey, "manychat", "/api/lead-intake", {
    phone,
    language,
    whatsapp_id: whatsappId,
    has_quotes: !!(quoteLow || quoteHigh),
  });

  await logIntegrationAudit(supabaseUrl, supabaseKey, {
    stage: "lead_intake_begin",
    endpoint: "/api/lead-intake",
    outcome: "ok",
    phone,
    detail: {
      language,
      has_email: !!email,
      has_whatsapp_id: !!whatsappId,
      has_age: age != null,
      has_gender: !!gender,
      has_smoker: isSmoker !== null,
      has_quotes: !!(quoteLow && quoteHigh),
    },
  });

  try {
    const contactPatch = {
      first_name: firstName,
      last_name: lastName,
      ...(email ? { email } : {}),
      language,
      whatsapp_id: whatsappId,
      ...(manychatSubscriberId ? { manychat_subscriber_id: manychatSubscriberId } : {}),
      us_state: usState,
      source: "whatsapp",
    };

    const { contactId, created } = await upsertContact(supabaseUrl, supabaseKey, phone, contactPatch);

    const existingState = await getLeadState(supabaseUrl, supabaseKey, contactId);
    const inferred = inferStageFromIntakePayload({ age, gender, isSmoker, quoteLow, quoteHigh });
    const fromPayload = maxPipelineStage("engaged", inferred);
    const existingStage = existingState && existingState.pipeline_stage ? existingState.pipeline_stage : "new_contact";
    const finalStage = maxPipelineStage(existingStage, fromPayload);

    const nowIso = new Date().toISOString();
    const leadPatch = {
      pipeline_stage: finalStage,
      language_picked_at: (existingState && existingState.language_picked_at) || nowIso,
    };
    if (age != null) leadPatch.age = age;
    if (gender) leadPatch.gender = gender;
    if (isSmoker !== null) leadPatch.is_smoker = isSmoker;
    if (quoteLow) leadPatch.quote_low = quoteLow;
    if (quoteHigh) leadPatch.quote_high = quoteHigh;
    if (quoteLow && quoteHigh) {
      leadPatch.quote_generated_at = (existingState && existingState.quote_generated_at) || nowIso;
    }

    await upsertLeadState(supabaseUrl, supabaseKey, contactId, leadPatch);

    await insertEvent(supabaseUrl, supabaseKey, contactId, "language_picked", {
      language,
      us_state: usState,
      ...(age != null ? { age } : {}),
      ...(gender ? { gender } : {}),
      ...(isSmoker !== null ? { is_smoker: isSmoker } : {}),
      ...(quoteLow ? { quote_low: quoteLow } : {}),
      ...(quoteHigh ? { quote_high: quoteHigh } : {}),
      pipeline_stage: finalStage,
    });

    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
    const pipelineId = process.env.HUBSPOT_PIPELINE_ID || "default";
    if (hubspotToken) {
      syncContactToHubspot(supabaseUrl, supabaseKey, hubspotToken, pipelineId, contactId).catch((e) =>
        console.error("[lead-intake] hubspot-sync error:", e.message),
      );
    }

    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "lead_intake_complete",
      endpoint: "/api/lead-intake",
      outcome: "ok",
      phone,
      detail: { contact_id: contactId, created, pipeline_stage: finalStage },
      contactId,
    });
    return json(res, 200, { success: true, contact_id: contactId, created });
  } catch (e) {
    console.error("lead-intake error:", e.message);
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "lead_intake_error",
      endpoint: "/api/lead-intake",
      outcome: "error",
      phone,
      message: e && e.message ? e.message : String(e),
    });
    return json(res, 500, { success: false, error: "Server error saving lead" });
  }
};
