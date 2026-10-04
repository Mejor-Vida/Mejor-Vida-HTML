/**
 * Staff call drop — transcribe a recorded call, extract CRM client fields,
 * match a lead, and apply only blank fields (never overwrite filled ones).
 */
"use strict";

const { restSelect, restInsert, restPatch, restDelete, serviceConfig } = require("../api/staff/_inbox-lib");
const { saveCanonicalLeadProfile } = require("../api/staff/_lead-profile");
const { linkLeadToContacts } = require("../api/staff/_contact-link");
const {
  getContactByPhone,
  insertNote,
  insertCallTranscript,
  upsertLeadState,
} = require("./contacts-db");
const { normalizeE164, sendSms } = require("./sms-send");

const TOP_LEVEL_KEYS = [
  "first_name",
  "last_name",
  "phone",
  "email",
  "language",
  "age",
  "sex",
  "tobacco",
];

const PROFILE_EXT_KEYS = [
  "state",
  "date_of_birth",
  "living_situation",
  "citizenship_status",
  "height",
  "weight",
];

const US_STATES = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

const AUDIO_MIME_RE = /^(audio\/|video\/(mp4|quicktime|webm))/i;

function phoneLast10(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  return digits.slice(-10);
}

function isBlank(value) {
  if (value == null) return true;
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return !Number.isFinite(value);
  return !String(value).trim();
}

function fillBlankFields(existing, incoming, keys) {
  const src = existing && typeof existing === "object" ? existing : {};
  const next = incoming && typeof incoming === "object" ? incoming : {};
  const out = {};
  (keys || []).forEach((key) => {
    if (!isBlank(next[key]) && isBlank(src[key])) out[key] = next[key];
  });
  return out;
}

function normalizeSex(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  if (/^(m|male|man|hombre|masculino)$/.test(s)) return "male";
  if (/^(f|female|woman|mujer|femenino)$/.test(s)) return "female";
  return null;
}

function normalizeTobacco(raw) {
  if (raw === true || raw === false) return raw;
  const s = String(raw == null ? "" : raw)
    .trim()
    .toLowerCase();
  if (!s) return null;
  if (/^(yes|y|true|si|sí|smoker|fuma|fumador|fumadora)$/.test(s)) return true;
  if (/^(no|n|false|non-smoker|no fuma|no-fuma)$/.test(s)) return false;
  return null;
}

function normalizeLanguage(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  if (/^(es|spanish|espanol|español|castellano)$/.test(s)) return "Spanish";
  if (/^(en|english|ingles|inglés)$/.test(s)) return "English";
  return null;
}

function normalizeState(raw) {
  const s = String(raw || "")
    .trim()
    .replace(/\./g, "");
  if (!s) return null;
  if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase();
  const mapped = US_STATES[s.toLowerCase()];
  return mapped || null;
}

function normalizeDob(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return s;
  const us = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (us) {
    const mm = String(us[1]).padStart(2, "0");
    const dd = String(us[2]).padStart(2, "0");
    return `${us[3]}-${mm}-${dd}`;
  }
  return null;
}

function normalizeLiving(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  if (/assist|asistid/.test(s)) return "assisted_living";
  if (/nurs|enfermer|skilled/.test(s)) return "nursing_home";
  if (/independ|solo|casa/.test(s)) return "independent";
  return null;
}

function normalizeCitizenship(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  if (/citizen|ciudadan/.test(s)) return "us_citizen";
  if (/resident|permanente|green card/.test(s)) return "permanent_resident";
  if (/itin/.test(s)) return "itin_holder";
  return null;
}

function sanitizeExtracted(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const ageNum = parseInt(String(src.age == null ? "" : src.age), 10);
  const weightNum = parseFloat(String(src.weight == null ? "" : src.weight));
  const phone = phoneLast10(src.phone) ? normalizeE164(src.phone) : "";
  const email = String(src.email || "")
    .trim()
    .toLowerCase();
  return {
    first_name: String(src.first_name || "").trim().slice(0, 200) || null,
    last_name: String(src.last_name || "").trim().slice(0, 200) || null,
    phone: phone || null,
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    language: normalizeLanguage(src.language),
    age: Number.isFinite(ageNum) && ageNum >= 0 && ageNum <= 130 ? ageNum : null,
    sex: normalizeSex(src.sex),
    tobacco: normalizeTobacco(src.tobacco),
    state: normalizeState(src.state),
    date_of_birth: normalizeDob(src.date_of_birth),
    living_situation: normalizeLiving(src.living_situation),
    citizenship_status: normalizeCitizenship(src.citizenship_status),
    height: String(src.height || "").trim().slice(0, 20) || null,
    weight: Number.isFinite(weightNum) && weightNum > 0 && weightNum <= 999 ? weightNum : null,
    call_outcome: String(src.call_outcome || "").trim().slice(0, 80) || null,
    summary: String(src.summary || "").trim().slice(0, 4000) || null,
    next_steps: String(src.next_steps || "").trim().slice(0, 2000) || null,
    coverage_amount: String(src.coverage_amount || "").trim().slice(0, 80) || null,
    beneficiary_notes: String(src.beneficiary_notes || "").trim().slice(0, 2000) || null,
    health_notes: String(src.health_notes || "").trim().slice(0, 2000) || null,
  };
}

function parseModelJson(raw) {
  const text = String(raw || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (e2) {
        return {};
      }
    }
    return {};
  }
}

function isStaffCallDropPhone(fromPhone, extraPhones) {
  const last10 = phoneLast10(fromPhone);
  if (!last10) return false;
  const envList = String(process.env.CALL_INTAKE_STAFF_PHONES || "")
    .split(",")
    .map((s) => phoneLast10(s))
    .filter(Boolean);
  const extra = Array.isArray(extraPhones) ? extraPhones.map((s) => phoneLast10(s)).filter(Boolean) : [];
  return envList.includes(last10) || extra.includes(last10);
}

async function listStaffCallDropPhones(cfg) {
  try {
    const rows = await restSelect(cfg, "staff_call_drop_phones", "select=phone_last10,e164,created_at&order=created_at.desc");
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    console.error("[call-intake] list phones", e && e.message);
    return [];
  }
}

async function checkStaffCallDropPhone(fromPhone) {
  if (isStaffCallDropPhone(fromPhone)) return true;
  const last10 = phoneLast10(fromPhone);
  if (!last10) return false;
  try {
    const cfg = cfgOrThrow();
    const rows = await restSelect(
      cfg,
      "staff_call_drop_phones",
      `phone_last10=eq.${encodeURIComponent(last10)}&select=phone_last10&limit=1`
    );
    return Array.isArray(rows) && !!rows[0];
  } catch (e) {
    return false;
  }
}

async function saveStaffCallDropPhone(cfg, rawPhone, actor) {
  const e164 = normalizeE164(rawPhone);
  const last10 = phoneLast10(e164);
  if (!last10) throw new Error("Enter your iPhone number");
  const existing = await restSelect(
    cfg,
    "staff_call_drop_phones",
    `phone_last10=eq.${encodeURIComponent(last10)}&select=phone_last10,e164&limit=1`
  );
  if (Array.isArray(existing) && existing[0]) return existing[0];
  const inserted = await restInsert(cfg, "staff_call_drop_phones", [
    { phone_last10: last10, e164: e164 || `+1${last10}`, created_by: actor || null },
  ]);
  return Array.isArray(inserted) && inserted[0] ? inserted[0] : { phone_last10: last10, e164 };
}

async function deleteStaffCallDropPhone(cfg, rawPhone) {
  const last10 = phoneLast10(rawPhone);
  if (!last10) throw new Error("Phone required");
  await restDelete(cfg, "staff_call_drop_phones", `phone_last10=eq.${encodeURIComponent(last10)}`);
}

function isAudioMedia(item) {
  if (!item || !item.url) return false;
  const type = String(item.contentType || "").toLowerCase();
  if (AUDIO_MIME_RE.test(type)) return true;
  return /\.(m4a|mp3|wav|aac|ogg|amr|3gp|mp4|mov|caf)(\?|$)/i.test(item.url);
}

function cfgOrThrow() {
  const cfg = serviceConfig();
  if (!cfg) throw new Error("Server missing required configuration");
  return cfg;
}

async function transcribeCallAudio(buffer, filename, mime) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("missing OPENAI_API_KEY");
  const form = new FormData();
  const blob = new Blob([buffer], { type: mime || "audio/mp4" });
  form.append("file", blob, filename || "call.m4a");
  form.append("model", "whisper-1");
  form.append("response_format", "json");
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data && data.error && data.error.message) || `Whisper ${r.status}`;
    throw new Error(String(msg).slice(0, 240));
  }
  return String((data && data.text) || "").trim();
}

async function extractClientFields(transcript) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("missing OPENAI_API_KEY");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "Extract final-expense insurance client facts from a sales-call transcript. " +
            "Return JSON only with keys: first_name, last_name, phone, email, language " +
            "(English or Spanish), age, sex (male/female), tobacco (true/false), " +
            "date_of_birth (YYYY-MM-DD), state (US 2-letter), height, weight (pounds), " +
            "living_situation (independent|assisted_living|nursing_home), " +
            "citizenship_status (us_citizen|permanent_resident|itin_holder), " +
            "call_outcome, summary (3-6 sentences), next_steps, coverage_amount, " +
            "beneficiary_notes, health_notes. Use null when unknown. Do not invent values.",
        },
        {
          role: "user",
          content: String(transcript || "").slice(0, 14000),
        },
      ],
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data && data.error && data.error.message) || `OpenAI ${r.status}`;
    throw new Error(String(msg).slice(0, 240));
  }
  const content =
    data &&
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content;
  return sanitizeExtracted(parseModelJson(content));
}

async function loadCanonical(cfg, leadId, sourceTable) {
  if (!leadId || !sourceTable) return {};
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=profile_data&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
      sourceTable
    )}&limit=1`
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  return row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
}

function matchLabel(row) {
  if (!row) return "";
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim() || row.display_name || "";
  return [name, row.phone].filter(Boolean).join(" · ");
}

async function matchLead(cfg, extracted, hintPhone) {
  const phone = phoneLast10(hintPhone) || phoneLast10(extracted && extracted.phone);
  if (phone) {
    const rows = await restSelect(
      cfg,
      "unified_leads",
      `select=id,source_table,first_name,last_name,display_name,phone,email,language&or=(phone.eq.${encodeURIComponent(
        "+1" + phone
      )},phone.eq.${encodeURIComponent(phone)},phone.like.*${phone})&limit=8`
    );
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 1) {
      return { lead: list[0], label: matchLabel(list[0]), candidates: list };
    }
    if (list.length > 1) {
      const first = String((extracted && extracted.first_name) || "")
        .trim()
        .toLowerCase();
      const named = first
        ? list.find((r) => String(r.first_name || "").trim().toLowerCase() === first)
        : null;
      const chosen = named || list[0];
      return { lead: chosen, label: matchLabel(chosen), candidates: list };
    }
  }

  const first = String((extracted && extracted.first_name) || "").trim();
  const last = String((extracted && extracted.last_name) || "").trim();
  if (first && last) {
    const rows = await restSelect(
      cfg,
      "unified_leads",
      `select=id,source_table,first_name,last_name,display_name,phone,email,language&first_name=ilike.${encodeURIComponent(
        first
      )}&last_name=ilike.${encodeURIComponent(last)}&limit=5`
    );
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 1) {
      return { lead: list[0], label: matchLabel(list[0]), candidates: list };
    }
    if (list.length > 1) {
      return { lead: list[0], label: matchLabel(list[0]), candidates: list };
    }
  }
  return { lead: null, label: "", candidates: [] };
}

async function signCallUpload(cfg, objectPath) {
  const r = await fetch(`${cfg.supabaseUrl}/storage/v1/object/upload/sign/call-intakes/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(String((data && (data.message || data.error)) || "Upload URL failed").slice(0, 200));
  }
  const token = data.token || "";
  if (!token) throw new Error("Upload URL failed");
  const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  const raw = String(data.url || data.signedUrl || "");
  let signedUrl;
  if (/^https?:\/\//i.test(raw)) signedUrl = raw;
  else if (raw.indexOf("/storage/v1/") === 0) signedUrl = base + raw;
  else if (raw.indexOf("/object/") === 0) signedUrl = base + "/storage/v1" + raw;
  else {
    signedUrl = `${base}/storage/v1/object/upload/sign/call-intakes/${objectPath}?token=${encodeURIComponent(token)}`;
  }
  if (signedUrl.indexOf("token=") === -1) {
    signedUrl += (signedUrl.indexOf("?") === -1 ? "?" : "&") + "token=" + encodeURIComponent(token);
  }
  return { path: objectPath, token, signedUrl, bucket: "call-intakes" };
}

async function fetchCallObject(cfg, objectPath) {
  return fetch(`${cfg.supabaseUrl}/storage/v1/object/call-intakes/${objectPath}`, {
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
    },
  });
}

async function uploadCallBuffer(cfg, objectPath, buffer, mime) {
  const r = await fetch(`${cfg.supabaseUrl}/storage/v1/object/call-intakes/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": mime || "application/octet-stream",
      "x-upsert": "true",
    },
    body: buffer,
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`call-intakes upload ${r.status}: ${String(text).slice(0, 200)}`);
  }
}

function publicRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by || null,
    status: row.status,
    source: row.source,
    hint_phone: row.hint_phone || null,
    recording_path: row.recording_path || null,
    recording_mime: row.recording_mime || null,
    transcript_text: row.transcript_text || "",
    extracted: row.extracted && typeof row.extracted === "object" ? row.extracted : {},
    matched_lead_id: row.matched_lead_id || null,
    matched_lead_source_table: row.matched_lead_source_table || null,
    match_label: row.match_label || "",
    applied_fields: row.applied_fields || null,
    error_text: row.error_text || null,
    applied_at: row.applied_at || null,
    applied_by: row.applied_by || null,
  };
}

async function getIntake(cfg, id) {
  const rows = await restSelect(cfg, "staff_call_intakes", `id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function processIntake(cfg, id) {
  const row = await getIntake(cfg, id);
  if (!row) throw new Error("Call intake not found");
  await restPatch(cfg, "staff_call_intakes", `id=eq.${encodeURIComponent(id)}`, {
    status: "processing",
    error_text: null,
    updated_at: new Date().toISOString(),
  });

  try {
    let transcript = String(row.transcript_text || "").trim();
    if (!transcript && row.recording_path) {
      const fileRes = await fetchCallObject(cfg, row.recording_path);
      if (!fileRes.ok) throw new Error(`Could not read recording (${fileRes.status})`);
      const buf = Buffer.from(await fileRes.arrayBuffer());
      if (buf.length > 25 * 1024 * 1024) {
        throw new Error("Recording is too large to transcribe. Paste the transcript instead.");
      }
      const name = String(row.recording_path).split("/").pop() || "call.m4a";
      transcript = await transcribeCallAudio(buf, name, row.recording_mime);
    }
    if (!transcript) throw new Error("No transcript or recording to process");

    const extracted = await extractClientFields(transcript);
    const match = await matchLead(cfg, extracted, row.hint_phone || extracted.phone);
    const now = new Date().toISOString();
    const patched = await restPatch(cfg, "staff_call_intakes", `id=eq.${encodeURIComponent(id)}`, {
      status: "ready",
      transcript_text: transcript,
      extracted,
      matched_lead_id: match.lead ? match.lead.id : null,
      matched_lead_source_table: match.lead ? match.lead.source_table : null,
      match_label: match.label || "",
      error_text: null,
      updated_at: now,
    });
    return Array.isArray(patched) && patched[0] ? patched[0] : await getIntake(cfg, id);
  } catch (err) {
    const msg = String(err && err.message ? err.message : err).slice(0, 400);
    await restPatch(cfg, "staff_call_intakes", `id=eq.${encodeURIComponent(id)}`, {
      status: "error",
      error_text: msg,
      updated_at: new Date().toISOString(),
    });
    throw err;
  }
}

function appendNote(existing, extra) {
  const a = String(existing || "").trim();
  const b = String(extra || "").trim();
  if (!b) return a || null;
  if (!a) return b;
  if (a.indexOf(b) >= 0) return a;
  return `${a}\n\n${b}`.slice(0, 8000);
}

async function applyIntake(cfg, id, opts) {
  const actor = (opts && opts.actor) || null;
  const createIfMissing = !(opts && opts.createIfMissing === false);
  const overrideLeadId = opts && opts.leadId ? String(opts.leadId).trim() : "";
  const row = await getIntake(cfg, id);
  if (!row) throw new Error("Call intake not found");
  if (row.status === "applied") return row;
  if (row.status !== "ready" && row.status !== "error") {
    throw new Error("Process the call before applying it");
  }

  const extracted = sanitizeExtracted(row.extracted || {});
  let leadId = overrideLeadId || row.matched_lead_id;
  let sourceTable = row.matched_lead_source_table || "manychat_leads";

  if (!leadId && createIfMissing) {
    const first = extracted.first_name || "Unknown";
    const phone = extracted.phone || row.hint_phone || "";
    const email = extracted.email || "";
    if (!phone && !email) throw new Error("Need a phone or email to create the client");
    const inserted = await restInsert(cfg, "manychat_leads", [
      {
        first_name: first,
        last_name: extracted.last_name || "",
        email: email || null,
        phone: phone || null,
        language: extracted.language || "English",
        source: "staff_call_intake",
        tag: "Lead_NE",
        pipeline_stage: "contacted",
        drop_off: false,
      },
    ]);
    const created = Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
    if (!created || !created.id) throw new Error("Could not create client");
    leadId = created.id;
    sourceTable = "manychat_leads";
  }

  if (!leadId) throw new Error("No matching client. Create one, or pick a client first.");

  const existing = await loadCanonical(cfg, leadId, sourceTable);
  const existingExt = existing.profile_ext && typeof existing.profile_ext === "object" ? existing.profile_ext : {};
  const top = fillBlankFields(existing, extracted, TOP_LEVEL_KEYS);
  const ext = fillBlankFields(existingExt, extracted, PROFILE_EXT_KEYS);
  const summaryBits = [extracted.summary, extracted.next_steps, extracted.coverage_amount ? `Coverage: ${extracted.coverage_amount}` : ""]
    .filter(Boolean)
    .join("\n\n");
  if (summaryBits) ext.notes = appendNote(existingExt.notes, summaryBits);

  const canonicalPatch = Object.assign({}, top);
  if (Object.keys(ext).length) {
    canonicalPatch.profile_ext = Object.assign({}, existingExt, ext);
  }
  await saveCanonicalLeadProfile(cfg, leadId, sourceTable, canonicalPatch, actor);

  let contactId = existing.contacts_contact_id || existing.contact_id || null;
  if (!contactId) {
    try {
      const linked = await linkLeadToContacts(cfg, {
        leadId,
        leadSourceTable: sourceTable,
        first_name: extracted.first_name || existing.first_name,
        last_name: extracted.last_name || existing.last_name,
        email: extracted.email || existing.email,
        phone: extracted.phone || row.hint_phone || existing.phone,
        language: extracted.language || existing.language,
        pipeline_stage: existing.pipeline_stage || "contacted",
        source: "staff_call_intake",
        updatedBy: actor,
      });
      contactId = linked && linked.contactId ? linked.contactId : null;
    } catch (e) {
      console.error("[call-intake] contact-link", e && e.message);
    }
  }
  if (!contactId && (extracted.phone || row.hint_phone)) {
    try {
      const found = await getContactByPhone(cfg.supabaseUrl, cfg.serviceKey, extracted.phone || row.hint_phone);
      contactId = found && found.id ? found.id : null;
    } catch (e) {
      /* ignore */
    }
  }

  if (contactId) {
    const noteParts = [
      extracted.summary ? `Call summary:\n${extracted.summary}` : "",
      extracted.next_steps ? `Next steps:\n${extracted.next_steps}` : "",
      extracted.health_notes ? `Health mentioned:\n${extracted.health_notes}` : "",
      extracted.beneficiary_notes ? `Beneficiary:\n${extracted.beneficiary_notes}` : "",
      row.transcript_text ? `Transcript:\n${String(row.transcript_text).slice(0, 6000)}` : "",
    ].filter(Boolean);
    if (noteParts.length) {
      await insertNote(cfg.supabaseUrl, cfg.serviceKey, contactId, {
        note: ("Call (auto)\n\n" + noteParts.join("\n\n")).slice(0, 8000),
        noteType: "manual",
        createdBy: actor || "call-intake",
      });
    }
    await insertCallTranscript(cfg.supabaseUrl, cfg.serviceKey, contactId, {
      callDate: row.created_at || new Date().toISOString(),
      transcriptText: row.transcript_text || null,
      aiSummary: extracted.summary || null,
      callOutcome: extracted.call_outcome || null,
    });
    try {
      await upsertLeadState(cfg.supabaseUrl, cfg.serviceKey, contactId, {
        call_completed_at: new Date().toISOString(),
        pipeline_stage: "call_completed",
      });
    } catch (e) {
      console.error("[call-intake] lead_state", e && e.message);
    }
  }

  const now = new Date().toISOString();
  const patched = await restPatch(cfg, "staff_call_intakes", `id=eq.${encodeURIComponent(id)}`, {
    status: "applied",
    matched_lead_id: leadId,
    matched_lead_source_table: sourceTable,
    match_label: row.match_label || [extracted.first_name, extracted.last_name].filter(Boolean).join(" "),
    applied_fields: { top, profile_ext: ext },
    applied_at: now,
    applied_by: actor,
    updated_at: now,
    error_text: null,
  });
  return Array.isArray(patched) && patched[0] ? patched[0] : await getIntake(cfg, id);
}

async function maybeIngestTelnyxCallDrop({ fromPhone, msgBody, mediaUrls, telnyxId }) {
  if (!(await checkStaffCallDropPhone(fromPhone))) return { started: false };
  const audio = (mediaUrls || []).find(isAudioMedia);
  const pasted = String(msgBody || "").trim();
  const looksLikeTranscript = pasted.length >= 80;
  if (!audio && !looksLikeTranscript) return { started: false };

  const cfg = cfgOrThrow();
  if (telnyxId) {
    const existing = await restSelect(
      cfg,
      "staff_call_intakes",
      `source_ref=eq.${encodeURIComponent(telnyxId)}&select=id,status&limit=1`
    );
    if (Array.isArray(existing) && existing[0]) return { started: true, id: existing[0].id, duplicate: true };
  }

  const now = new Date().toISOString();
  const inserted = await restInsert(cfg, "staff_call_intakes", [
    {
      created_by: fromPhone,
      status: "received",
      source: "mms",
      source_ref: telnyxId || null,
      hint_phone: null,
      transcript_text: looksLikeTranscript && !audio ? pasted : null,
      created_at: now,
      updated_at: now,
    },
  ]);
  const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
  if (!row) return { started: false };

  try {
    if (audio) {
      const headers = {};
      const telnyxKey = String(process.env.TELNYX_API_KEY || "").trim();
      if (telnyxKey) headers.Authorization = `Bearer ${telnyxKey}`;
      const fileRes = await fetch(audio.url, { headers });
      if (!fileRes.ok) throw new Error(`Could not download MMS audio (${fileRes.status})`);
      const buf = Buffer.from(await fileRes.arrayBuffer());
      const ext = /\.m4a/i.test(audio.url) ? "m4a" : /\.mp3/i.test(audio.url) ? "mp3" : "m4a";
      const objectPath = `${row.id}/mms.${ext}`;
      await uploadCallBuffer(cfg, objectPath, buf, audio.contentType || "audio/mp4");
      await restPatch(cfg, "staff_call_intakes", `id=eq.${encodeURIComponent(row.id)}`, {
        recording_path: objectPath,
        recording_mime: audio.contentType || "audio/mp4",
        status: "uploaded",
        updated_at: new Date().toISOString(),
      });
    }
    const processed = await processIntake(cfg, row.id);
    let applied = null;
    if (processed && processed.matched_lead_id) {
      try {
        applied = await applyIntake(cfg, row.id, {
          actor: fromPhone,
          leadId: processed.matched_lead_id,
          createIfMissing: false,
        });
      } catch (applyErr) {
        console.error("[call-intake] auto-apply", applyErr && applyErr.message);
      }
    }
    const label = (applied && applied.match_label) || (processed && processed.match_label) || "";
    try {
      await sendSms({
        to: fromPhone,
        body: applied
          ? `Saved on ${label || "the client"}. Blank CRM fields were filled.`
          : "Got the call. Open Call Drop to pick the client: https://www.mejorvidainsurance.com/staff/call-drop.html",
      });
    } catch (e) {
      console.error("[call-intake] confirm sms", e && e.message);
    }
    return { started: true, id: row.id, applied: !!applied };
  } catch (err) {
    console.error("[call-intake] mms ingest", err && err.message);
    try {
      await sendSms({
        to: fromPhone,
        body: "Could not read that recording. Share the Notes transcript as text, or open Call Drop: https://www.mejorvidainsurance.com/staff/call-drop.html",
      });
    } catch (e2) {
      /* ignore */
    }
    return { started: true, id: row.id, error: true };
  }
}

module.exports = {
  TOP_LEVEL_KEYS,
  PROFILE_EXT_KEYS,
  phoneLast10,
  isBlank,
  fillBlankFields,
  normalizeSex,
  normalizeTobacco,
  normalizeLanguage,
  normalizeState,
  normalizeDob,
  sanitizeExtracted,
  parseModelJson,
  isStaffCallDropPhone,
  checkStaffCallDropPhone,
  listStaffCallDropPhones,
  saveStaffCallDropPhone,
  deleteStaffCallDropPhone,
  isAudioMedia,
  transcribeCallAudio,
  extractClientFields,
  matchLead,
  signCallUpload,
  processIntake,
  applyIntake,
  getIntake,
  publicRow,
  maybeIngestTelnyxCallDrop,
  cfgOrThrow,
};
