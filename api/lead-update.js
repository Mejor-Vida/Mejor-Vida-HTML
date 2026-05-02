/**
 * POST /api/lead-update
 *
 * Called from ManyChat whenever a lead answers a questionnaire question
 * or progresses to a new pipeline stage.
 *
 * Looks up the contact by phone, updates lead_state, and appends an event.
 * Automatically advances pipeline_stage when all qualifying fields are set.
 *
 * ManyChat sends one or more of:
 *   phone           (required) WhatsApp phone number
 *   age | edad      (optional) integer
 *   gender | sexo | sex   (optional) male/female or Hombre/Mujer
 *   is_smoker | tabaco | tobacco | smoker  (optional)
 *   quote_low, quote_high  (optional) display strings (same as lead-intake)
 *   coverage_amount (optional) integer (dollar amount)
 *   monthly_premium (optional) decimal (computed quote)
 *   pipeline_stage  (optional) force a specific stage
 *   call_scheduled_at  (optional) ISO datetime
 *   call_completed_at  (optional) ISO datetime
 *   policy_issued_at   (optional) ISO datetime
 *   whatsapp_drop_off  (optional) stage name where user dropped off
 *
 * Returns:
 *   { success: true, contact_id: "...", pipeline_stage: "..." }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const {
  getContactByPhone,
  getLeadState,
  updateLeadState,
  insertEvent,
  logWebhook,
} = require("../lib/contacts-db");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

const UNRESOLVED_MC = /^\{\{[\s\S]*\}\}$/;

function parseBool(val) {
  if (val === true || val === "true" || val === "yes" || val === "sí" || val === "si" || val === "Sí" || val === "Si") {
    return true;
  }
  if (val === false || val === "false" || val === "no" || val === "No") return false;
  return null;
}

function cleanMcField(v) {
  const s = String(v == null ? "" : v).trim();
  if (!s || UNRESOLVED_MC.test(s)) return "";
  return s;
}

function parseGenderMc(val) {
  const s = String(val == null ? "" : val).trim().toLowerCase();
  if (!s || UNRESOLVED_MC.test(s)) return null;
  if (["hombre", "m", "male", "masculino", "masculine"].includes(s)) return "male";
  if (["mujer", "f", "female", "femenino", "feminine"].includes(s)) return "female";
  return null;
}

function firstNonEmpty(body, keys) {
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = body[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

/**
 * Determine the correct pipeline_stage based on current lead_state fields.
 * Only advances forward — never moves a stage backward.
 */
function computeStage(current, updates) {
  const merged = { ...current, ...updates };
  const STAGE_ORDER = [
    "new_contact",
    "engaged",
    "partially_qualified",
    "quoted",
    "call_scheduled",
    "call_completed",
    "policy_issued",
    "closed_lost",
  ];

  // If a stage is explicitly set in the update, honour it (unless it's a downgrade)
  if (updates.pipeline_stage) {
    const currentIdx = STAGE_ORDER.indexOf(current.pipeline_stage || "new_contact");
    const newIdx = STAGE_ORDER.indexOf(updates.pipeline_stage);
    return newIdx >= currentIdx ? updates.pipeline_stage : current.pipeline_stage;
  }

  // Auto-advance based on data completeness
  if (merged.policy_issued_at) return "policy_issued";
  if (merged.call_completed_at) return "call_completed";
  if (merged.call_scheduled_at) return "call_scheduled";
  if (merged.monthly_premium != null) return "quoted";
  if (merged.quote_low && merged.quote_high) return "quoted";
  if (merged.age != null && merged.gender && merged.is_smoker != null) return "partially_qualified";

  // Don't downgrade from current
  return current.pipeline_stage || "engaged";
}

module.exports = async function handler(req, res) {
  logRequest("lead-update");

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

  const phone = String(body.phone || "").trim();
  if (!phone) {
    return json(res, 400, { success: false, error: "phone is required" });
  }

  logWebhook(supabaseUrl, supabaseKey, "manychat", "/api/lead-update", body);

  try {
    // 1. Find contact by phone
    const contact = await getContactByPhone(supabaseUrl, supabaseKey, phone);
    if (!contact) {
      // Contact doesn't exist yet — this can happen if lead-intake wasn't called first.
      // Return a soft error so ManyChat can call lead-intake first.
      return json(res, 404, { success: false, error: "Contact not found — call /api/lead-intake first" });
    }

    // 2. Get current lead_state
    const currentState = await getLeadState(supabaseUrl, supabaseKey, contact.id);

    // 3. Build the update fields from the incoming body
    const updates = {};
    const eventData = {};

    const ageRaw = firstNonEmpty(body, ["edad", "age"]);
    if (ageRaw !== undefined) {
      const age = parseInt(String(ageRaw).replace(/[^\d]/g, ""), 10);
      if (Number.isFinite(age) && age > 0 && age < 130) {
        updates.age = age;
        eventData.age = age;
      }
    }

    const smokerRaw = firstNonEmpty(body, ["tabaco", "is_smoker", "tobacco", "smoker"]);
    const isSmoker = smokerRaw !== undefined ? parseBool(smokerRaw) : null;
    if (isSmoker !== null) {
      updates.is_smoker = isSmoker;
      eventData.is_smoker = isSmoker;
    }

    const gMc =
      parseGenderMc(body.sexo) || parseGenderMc(body.gender) || parseGenderMc(body.sex);
    if (gMc) {
      updates.gender = gMc;
      eventData.gender = gMc;
    } else if (body.gender) {
      updates.gender = String(body.gender).trim().toLowerCase();
      eventData.gender = updates.gender;
    }

    const qLow = cleanMcField(body.quote_low || body.quoteLow).slice(0, 200);
    const qHigh = cleanMcField(body.quote_high || body.quoteHigh).slice(0, 200);
    if (qLow) {
      updates.quote_low = qLow;
      eventData.quote_low = qLow;
    }
    if (qHigh) {
      updates.quote_high = qHigh;
      eventData.quote_high = qHigh;
    }
    if (qLow && qHigh) {
      updates.quote_generated_at = updates.quote_generated_at || new Date().toISOString();
    }

    if (body.coverage_amount !== undefined && body.coverage_amount !== "") {
      const amt = parseInt(body.coverage_amount, 10);
      if (Number.isFinite(amt)) {
        updates.coverage_amount = amt;
        eventData.coverage_amount = amt;
      }
    }

    if (body.monthly_premium !== undefined && body.monthly_premium !== "") {
      const premium = parseFloat(body.monthly_premium);
      if (Number.isFinite(premium)) {
        updates.monthly_premium = premium;
        updates.quote_generated_at = updates.quote_generated_at || new Date().toISOString();
        eventData.monthly_premium = premium;
      }
    }

    if (body.pipeline_stage) updates.pipeline_stage = String(body.pipeline_stage).trim();
    if (body.call_scheduled_at) updates.call_scheduled_at = body.call_scheduled_at;
    if (body.call_completed_at) updates.call_completed_at = body.call_completed_at;
    if (body.policy_issued_at) updates.policy_issued_at = body.policy_issued_at;
    if (body.whatsapp_drop_off) updates.whatsapp_drop_off = String(body.whatsapp_drop_off).trim();

    if (Object.keys(updates).length === 0) {
      return json(res, 400, { success: false, error: "No valid fields to update" });
    }

    // 4. Compute the correct stage
    const newStage = computeStage(currentState || {}, updates);
    updates.pipeline_stage = newStage;
    if (currentState && newStage !== currentState.pipeline_stage) {
      eventData.previous_stage = currentState.pipeline_stage;
      eventData.new_stage = newStage;
    }

    // 5. Apply updates to lead_state
    await updateLeadState(supabaseUrl, supabaseKey, contact.id, updates);

    // 6. Determine event type
    let eventType = "lead_updated";
    if (updates.policy_issued_at) eventType = "policy_issued";
    else if (updates.call_completed_at) eventType = "call_completed";
    else if (updates.call_scheduled_at) eventType = "call_scheduled";
    else if (updates.monthly_premium != null || (updates.quote_low && updates.quote_high)) {
      eventType = "quote_generated";
    }
    else if (updates.gender && updates.age != null && updates.is_smoker != null) eventType = "questionnaire_completed";
    else if (updates.gender) eventType = "gender_answered";
    else if (updates.is_smoker != null) eventType = "smoker_answered";
    else if (updates.age != null) eventType = "age_answered";

    // 7. Append event
    await insertEvent(supabaseUrl, supabaseKey, contact.id, eventType, eventData);

    return json(res, 200, {
      success: true,
      contact_id: contact.id,
      pipeline_stage: newStage,
    });
  } catch (e) {
    console.error("lead-update error:", e.message);
    return json(res, 500, { success: false, error: "Server error updating lead" });
  }
};
