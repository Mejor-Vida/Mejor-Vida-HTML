/**
 * POST /api/lead-intake
 *
 * Called from ManyChat immediately after a lead picks their language
 * (the earliest moment we know they're a real WhatsApp user).
 *
 * Pull-first flow (preferred):
 *   ManyChat sends only `{ subscriber_id: "{{id}}" }`. This endpoint then
 *   calls ManyChat REST (`/fb/subscriber/getInfo`) using `MANYCHAT_API_KEY`,
 *   reads the profile + custom_fields, normalizes them via
 *   `lib/manychat-pull.js`, and writes to Supabase. Push-body fields are
 *   still accepted and **win on conflicts** so existing flows keep working.
 *
 * Identity priority for find-or-create:
 *   1. phone (E.164, exact match) — preferred
 *   2. ManyChat subscriber id (whatsapp_id or manychat_subscriber_id column)
 *   3. email (case-insensitive)
 * Existing non-empty phones are never overwritten — we only fill an empty
 * phone column on an already-found row.
 *
 * Body (all optional unless an existing row matches by subscriber id / email):
 *   subscriber_id | manychat_subscriber_id | id | contact_id | manychat_id
 *   whatsapp_id   E.164 string OR pure-digit subscriber id
 *   phone | whatsapp_phone   E.164 (required if no other identity matches)
 *   first_name, last_name, full_name, name
 *   email
 *   language       english | spanish (defaults to english if pull also empty)
 *   us_state       (defaults to NE)
 *   edad | age
 *   sexo | gender | sex
 *   tabaco | tobacco | smoker | is_smoker
 *   quote_low | quoteLow, quote_high | quoteHigh
 *
 * Response:
 *   {
 *     success: true,
 *     created: boolean,
 *     updated: boolean,
 *     contact_id: "...",
 *     subscriber_id: "..."|null,
 *     pipeline_stage: "engaged"|"partially_qualified"|"quoted"|...,
 *     saved_fields: ["first_name","language","age",...],   // canonical keys written this call
 *     missing_fields: ["email","quote_low",...]            // canonical keys still empty after merge
 *   }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET,
 *      MANYCHAT_API_KEY (for pull — recommended), HUBSPOT_ACCESS_TOKEN,
 *      HUBSPOT_PIPELINE_ID (optional).
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const {
  upsertContact,
  upsertLeadState,
  insertEvent,
  logWebhook,
  getContactByPhone,
  getContactsByManychatSubscriberId,
  getLeadState,
} = require("../lib/contacts-db");
const { syncContactToHubspot } = require("../lib/hubspot-sync-lib");
const { logIntegrationAudit } = require("../lib/integration-audit");
const { fetchManychatSubscriber } = require("../lib/manychat-pull");

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

function inferStageFromIntakePayload({ age, gender, isSmoker, quoteLow, quoteHigh }) {
  const hasQuote = !!(quoteLow && quoteHigh);
  const partial =
    age != null && Number.isFinite(age) && gender && isSmoker !== null && isSmoker !== undefined;
  if (hasQuote) return "quoted";
  if (partial) return "partially_qualified";
  return "engaged";
}

/** Pull a body field across alias keys. Returns the first non-template, non-empty string. */
function bodyAlias(body, keys) {
  for (let i = 0; i < keys.length; i++) {
    const v = body[keys[i]];
    if (v === undefined || v === null) continue;
    const s = typeof v === "string" ? v : String(v);
    const cleaned = cleanManychatValue(s);
    if (cleaned) return cleaned;
    if (typeof v === "boolean") return v;
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return "";
}

/** Inline REST: find contact by lowercase email. Never throws. */
async function findContactByEmail(supabaseUrl, serviceKey, email) {
  if (!email) return null;
  try {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/contacts?email=eq.${encodeURIComponent(email)}&limit=1`;
    const r = await fetch(url, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (_) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  logRequest("lead-intake");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    if (supabaseUrl && supabaseKey) {
      await logIntegrationAudit(supabaseUrl, supabaseKey, {
        stage: "lead_intake_auth_failed",
        endpoint: "/api/lead-intake",
        outcome: "error",
        message: auth.error || "Unauthorized",
        detail: { hint: "ManyChat External Request must send header X-App-Secret matching MANYCHAT_WEBHOOK_SECRET" },
      });
    }
    return json(res, auth.status, { success: false, error: auth.error });
  }

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "lead_intake_invalid_json",
      endpoint: "/api/lead-intake",
      outcome: "error",
      message: "Invalid JSON",
    });
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const bodyKeys = Object.keys(body || {})
    .sort()
    .slice(0, 50);

  // ── Resolve subscriber id from body ──────────────────────────────────────
  // Accept many aliases so any ManyChat External Request mapping works.
  let subscriberId = cleanManychatValue(
    body.subscriber_id ||
      body.manychat_subscriber_id ||
      body.id ||
      body.contact_id ||
      body.manychat_id
  );
  // whatsapp_id is *also* a valid subscriber id when it's a pure digit string.
  const widCandidate = cleanManychatValue(body.whatsapp_id);
  if (!subscriberId && widCandidate && /^\d{6,20}$/.test(widCandidate)) {
    subscriberId = widCandidate;
  }

  // ── Pull from ManyChat if we have a subscriber id + API key ──────────────
  const manychatApiKey = process.env.MANYCHAT_API_KEY;
  let pulled = null; // { ok, normalized, manychat_subscriber_id, raw }
  if (subscriberId && manychatApiKey) {
    pulled = await fetchManychatSubscriber(subscriberId, { apiKey: manychatApiKey });
    if (pulled.ok) {
      const keysPulled = Object.keys(pulled.normalized || {});
      logIntegrationAudit(supabaseUrl, supabaseKey, {
        stage: "lead_intake_manychat_pull_ok",
        endpoint: "/api/lead-intake",
        outcome: "ok",
        detail: { subscriber_id: subscriberId, keys_pulled: keysPulled },
      }).catch(() => {});
    } else {
      logIntegrationAudit(supabaseUrl, supabaseKey, {
        stage: "lead_intake_manychat_pull_failed",
        endpoint: "/api/lead-intake",
        outcome: "error",
        message: (pulled && pulled.error) || "manychat pull failed",
        detail: { subscriber_id: subscriberId, status: pulled && pulled.status },
      }).catch(() => {});
    }
  } else if (subscriberId && !manychatApiKey) {
    logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "lead_intake_manychat_pull_failed",
      endpoint: "/api/lead-intake",
      outcome: "error",
      message: "MANYCHAT_API_KEY missing in env — pull skipped",
      detail: { subscriber_id: subscriberId, hint: "Set MANYCHAT_API_KEY in Vercel env to enable pull" },
    }).catch(() => {});
  }

  const pull = (pulled && pulled.ok && pulled.normalized) || {};

  // ── Build effectiveBody: explicit body wins; pull fills gaps ─────────────
  // For each canonical key we care about, take body value if non-empty, else pull.
  function pickField(bodyKeys, pullKey, parser) {
    const fromBody = bodyAlias(body, bodyKeys);
    if (fromBody !== "" && fromBody !== undefined && fromBody !== null) {
      const parsed = parser ? parser(fromBody) : fromBody;
      if (parsed !== null && parsed !== undefined && parsed !== "") return parsed;
    }
    const fromPull = pull[pullKey];
    if (fromPull !== undefined && fromPull !== null && fromPull !== "") return fromPull;
    return null;
  }

  // ── Phone / WhatsApp id resolution ───────────────────────────────────────
  let phone = cleanManychatValue(body.phone) || cleanManychatValue(body.whatsapp_phone);
  if (!phone && pull.phone) phone = String(pull.phone).trim();

  const whatsappId =
    cleanManychatValue(
      body.whatsapp_id || body.manychat_subscriber_id || body.subscriber_id || body.manychat_id
    ) ||
    pull.whatsapp_id ||
    subscriberId ||
    null;

  const manychatSubscriberId =
    subscriberId ||
    cleanManychatValue(body.subscriber_id || body.manychat_id) ||
    (pulled && pulled.ok && pulled.manychat_subscriber_id) ||
    null;

  // Last resort: derive phone from a numeric whatsapp_id matching an existing row.
  if (!phone && whatsappId) {
    try {
      const rows = await getContactsByManychatSubscriberId(supabaseUrl, supabaseKey, whatsappId);
      const match = rows.find((c) => cleanManychatValue(c.phone)) || rows[0];
      if (match && match.phone) phone = String(match.phone).trim();
    } catch (_) {
      /* ignore */
    }
  }

  const widDigits = whatsappId ? String(whatsappId).replace(/\D/g, "") : "";
  if (!phone && widDigits.length >= 10 && widDigits.length <= 15) {
    phone = (whatsappId && String(whatsappId).trim().startsWith("+") ? "+" : "") + widDigits;
  }

  // ── Email — look up before bailing on missing phone ──────────────────────
  const rawEmailBody = cleanManychatValue(body.email).toLowerCase();
  const emailBody = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmailBody) ? rawEmailBody.slice(0, 500) : null;
  const emailPull = pull.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pull.email) ? pull.email : null;
  const email = emailBody || emailPull;

  let existingContact = null;
  if (phone) {
    try {
      existingContact = await getContactByPhone(supabaseUrl, supabaseKey, phone);
    } catch (_) {
      existingContact = null;
    }
  }
  if (!existingContact && whatsappId) {
    try {
      const rows = await getContactsByManychatSubscriberId(supabaseUrl, supabaseKey, whatsappId);
      existingContact = rows[0] || null;
    } catch (_) {
      existingContact = null;
    }
  }
  if (!existingContact && email) {
    existingContact = await findContactByEmail(supabaseUrl, supabaseKey, email);
  }

  // If we found an existing row but still don't have a phone, borrow theirs.
  if (!phone && existingContact && existingContact.phone) {
    phone = String(existingContact.phone).trim();
  }
  // If existing row has a non-empty phone, never overwrite it with a different one.
  if (existingContact && existingContact.phone) {
    phone = String(existingContact.phone).trim();
  }

  if (!phone) {
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "lead_intake_validation_failed",
      endpoint: "/api/lead-intake",
      outcome: "error",
      message: "phone is required (or subscriber_id / email must match an existing contact)",
      detail: {
        body_keys: bodyKeys,
        had_subscriber_id: !!subscriberId,
        had_email: !!email,
        manychat_pull_ok: !!(pulled && pulled.ok),
        hint: "Send subscriber_id from ManyChat with MANYCHAT_API_KEY set, or include phone in E.164",
      },
    });
    return json(res, 400, {
      success: false,
      error: "phone is required (or subscriber_id / email must match an existing contact)",
    });
  }

  // ── Language ─────────────────────────────────────────────────────────────
  const languageRaw =
    cleanManychatValue(body.language) || cleanManychatValue(body.idioma) || pull.language || "english";
  const language = String(languageRaw).toLowerCase();
  if (!["english", "spanish"].includes(language)) {
    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "lead_intake_validation_failed",
      endpoint: "/api/lead-intake",
      outcome: "error",
      phone,
      message: "language must be 'english' or 'spanish'",
      detail: {
        body_keys: bodyKeys,
        language_received: String(languageRaw).slice(0, 80),
      },
    });
    return json(res, 400, { success: false, error: "language must be 'english' or 'spanish'" });
  }

  // ── Names ────────────────────────────────────────────────────────────────
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
  if (!firstName && pull.first_name) firstName = String(pull.first_name).slice(0, 200);
  if (!lastName && pull.last_name) lastName = String(pull.last_name).slice(0, 200);
  firstName = firstName || null;
  lastName = lastName || null;

  // ── State, age, gender, smoker, quotes ───────────────────────────────────
  const usStateBody = cleanManychatValue(body.us_state).toUpperCase();
  const usState = (usStateBody || pull.us_state || "NE").toString().slice(0, 5);

  let age = null;
  const ageRaw = bodyAlias(body, ["edad", "age"]);
  if (ageRaw !== "") {
    const n = parseInt(String(ageRaw).replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(n) && n > 0 && n < 130) age = n;
  }
  if (age == null && pull.age != null) age = pull.age;

  const gender =
    parseGender(body.sexo) ||
    parseGender(body.gender) ||
    parseGender(body.sex) ||
    pull.gender ||
    null;

  let isSmoker = null;
  const smokerVal = bodyAlias(body, ["tabaco", "is_smoker", "tobacco", "smoker"]);
  if (smokerVal !== "") {
    const b = parseBool(smokerVal);
    if (b !== null) isSmoker = b;
  }
  if (isSmoker === null && typeof pull.is_smoker === "boolean") isSmoker = pull.is_smoker;

  const quoteLow =
    cleanManychatValue(body.quote_low || body.quoteLow).slice(0, 200) ||
    (pull.quote_low ? String(pull.quote_low).slice(0, 200) : null) ||
    null;
  const quoteHigh =
    cleanManychatValue(body.quote_high || body.quoteHigh).slice(0, 200) ||
    (pull.quote_high ? String(pull.quote_high).slice(0, 200) : null) ||
    null;

  // ── Log incoming webhook (fire-and-forget) ───────────────────────────────
  logWebhook(supabaseUrl, supabaseKey, "manychat", "/api/lead-intake", {
    phone,
    language,
    whatsapp_id: whatsappId,
    subscriber_id: manychatSubscriberId,
    pull_ok: !!(pulled && pulled.ok),
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
      has_subscriber_id: !!manychatSubscriberId,
      has_age: age != null,
      has_gender: !!gender,
      has_smoker: isSmoker !== null,
      has_quotes: !!(quoteLow && quoteHigh),
      pull_ok: !!(pulled && pulled.ok),
    },
  });

  try {
    // contactPatch: never inject empty/null. mergeTruthyFields in upsertContact
    // strips empty strings, but be explicit — only set keys we have values for.
    const contactPatch = {
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(email ? { email } : {}),
      language,
      ...(whatsappId ? { whatsapp_id: whatsappId } : {}),
      ...(manychatSubscriberId ? { manychat_subscriber_id: manychatSubscriberId } : {}),
      us_state: usState,
      source: "whatsapp",
    };

    const { contactId, created } = await upsertContact(supabaseUrl, supabaseKey, phone, contactPatch);
    const updated = !created;

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
      syncContactToHubspot(supabaseUrl, supabaseKey, hubspotToken, pipelineId, contactId).catch((e) => {
        console.error("[lead-intake] hubspot-sync error:", e.message);
        logIntegrationAudit(supabaseUrl, supabaseKey, {
          stage: "lead_intake_hubspot_failed",
          endpoint: "/api/lead-intake",
          outcome: "error",
          phone,
          message: (e && e.message) || String(e),
          contactId,
          detail: { hint: "Check Vercel logs; verify HUBSPOT_ACCESS_TOKEN and custom properties (e.g. mvi_quote_low) exist" },
        }).catch(() => {});
      });
    }

    // ── Build saved_fields / missing_fields ────────────────────────────────
    const CANONICAL = [
      "first_name",
      "last_name",
      "email",
      "language",
      "us_state",
      "age",
      "gender",
      "is_smoker",
      "quote_low",
      "quote_high",
    ];
    const savedSet = new Set();
    if (firstName) savedSet.add("first_name");
    if (lastName) savedSet.add("last_name");
    if (email) savedSet.add("email");
    if (language) savedSet.add("language");
    if (usState) savedSet.add("us_state");
    if (age != null) savedSet.add("age");
    if (gender) savedSet.add("gender");
    if (isSmoker !== null) savedSet.add("is_smoker");
    if (quoteLow) savedSet.add("quote_low");
    if (quoteHigh) savedSet.add("quote_high");
    const saved_fields = Array.from(savedSet);
    const missing_fields = CANONICAL.filter((k) => !savedSet.has(k));

    await logIntegrationAudit(supabaseUrl, supabaseKey, {
      stage: "lead_intake_complete",
      endpoint: "/api/lead-intake",
      outcome: "ok",
      phone,
      detail: {
        contact_id: contactId,
        created,
        updated,
        pipeline_stage: finalStage,
        subscriber_id: manychatSubscriberId,
        saved_fields,
        missing_fields,
      },
      contactId,
    });
    return json(res, 200, {
      success: true,
      created,
      updated,
      contact_id: contactId,
      subscriber_id: manychatSubscriberId,
      pipeline_stage: finalStage,
      saved_fields,
      missing_fields,
    });
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
