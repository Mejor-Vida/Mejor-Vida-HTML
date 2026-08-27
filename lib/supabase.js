/**
 * Supabase REST helpers (service role). Tables: manychat_leads, unanswered_questions, faqs, chat_sessions, chat_messages.
 */

const { hubspotPhoneSearchVariants } = require("./hubspot-phone-variants");

function restHeaders(serviceKey, prefer) {
  const h = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

function isStaffHiddenFilterError(text) {
  return /staff_hidden_at|42703|PGRST204|column.*does not exist|Could not find/i.test(String(text || ""));
}

async function insertManychatLead(supabaseUrl, serviceKey, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/manychat_leads`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=representation"),
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase insert manychat_leads ${r.status}: ${text.slice(0, 500)}`);
  }
  const data = JSON.parse(text);
  const first = Array.isArray(data) ? data[0] : data;
  return first && first.id ? String(first.id) : null;
}

async function patchManychatLead(supabaseUrl, serviceKey, id, fields) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/manychat_leads?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify(fields),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase patch manychat_leads ${r.status}: ${t.slice(0, 300)}`);
  }
}

function postgrestInQuotedList(values) {
  const uniq = [];
  const seen = new Set();
  (values || []).forEach((v) => {
    const s = String(v == null ? "" : v).trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    uniq.push(`"${s.replace(/"/g, "")}"`);
  });
  return uniq.join(",");
}

/**
 * Find leads by phone (E.164 or normalized). Uses digit/E.164 variants so +1… and 1… rows match;
 * returns oldest created row first so upserts consolidate onto the established lead.
 */
async function findManychatLeadsByPhone(supabaseUrl, serviceKey, phone) {
  const variants = hubspotPhoneSearchVariants(phone);
  const inList = postgrestInQuotedList(variants);
  if (!inList) return [];
  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/manychat_leads`;
  const sel = "select=id,email,phone,pipeline_stage,drop_off,created_at,updated_at";
  const urlWith = `${base}?phone=in.(${inList})&staff_hidden_at=is.null&${sel}&order=created_at.asc`;
  const urlNo = `${base}?phone=in.(${inList})&${sel}&order=created_at.asc`;
  const headers = restHeaders(serviceKey);
  let r = await fetch(urlWith, { headers });
  let text = await r.text();
  if (!r.ok && isStaffHiddenFilterError(text)) {
    r = await fetch(urlNo, { headers });
    text = await r.text();
  }
  if (!r.ok) {
    throw new Error(`Supabase select manychat_leads ${r.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text || "[]");
}

async function findQualifiedLeadByPhone(supabaseUrl, serviceKey, phone) {
  const rows = await findManychatLeadsByPhone(supabaseUrl, serviceKey, phone);
  return rows.find(
    (row) =>
      row.drop_off === false &&
      row.email &&
      String(row.email).trim() !== "" &&
      row.pipeline_stage === "qualified",
  );
}

/**
 * Find a manychat_leads row by ManyChat subscriber ID (whatsapp_id / subscriber id).
 * Returns { id, phone, email, first_name, last_name } or null.
 */
async function findManychatLeadBySubscriberId(supabaseUrl, serviceKey, subscriberId) {
  const sid = String(subscriberId || "").trim();
  if (!sid) return null;
  const q = encodeURIComponent(sid);
  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/manychat_leads`;
  const urlWith = `${base}?manychat_subscriber_id=eq.${q}&staff_hidden_at=is.null&select=id,phone,email,first_name,last_name&limit=1`;
  const urlNo = `${base}?manychat_subscriber_id=eq.${q}&select=id,phone,email,first_name,last_name&limit=1`;
  const headers = restHeaders(serviceKey);
  let r = await fetch(urlWith, { headers });
  let text = await r.text();
  if (!r.ok && isStaffHiddenFilterError(text)) {
    r = await fetch(urlNo, { headers });
    text = await r.text();
  }
  if (!r.ok) {
    throw new Error(`Supabase select manychat_leads by subscriber ${r.status}: ${text.slice(0, 300)}`);
  }
  const rows = JSON.parse(text || "[]");
  return rows && rows.length > 0 ? rows[0] : null;
}

async function rpcMatchKnowledgeChunks(supabaseUrl, serviceKey, queryEmbedding, matchCount, minSimilarity) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/match_knowledge_chunks`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey),
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_count: matchCount,
      min_similarity: minSimilarity,
    }),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase RPC match_knowledge_chunks ${r.status}: ${text.slice(0, 500)}`);
  }
  return JSON.parse(text);
}

async function insertUnansweredQuestion(supabaseUrl, serviceKey, row) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/unanswered_questions`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase insert unanswered_questions ${r.status}: ${t.slice(0, 400)}`);
  }
}

/**
 * Fetch a single quote_ranges row by age + sex + smoker.
 * Returns { low, high, anchor } or null if no match.
 */
async function fetchQuoteRange(supabaseUrl, serviceKey, age, sex, smoker) {
  const params = new URLSearchParams({
    age: `eq.${age}`,
    sex: `eq.${sex}`,
    smoker: `eq.${smoker}`,
    select: "low,high,anchor",
  });
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_ranges?${params}`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase select quote_ranges ${r.status}: ${text.slice(0, 300)}`);
  }
  const rows = JSON.parse(text);
  return rows.length > 0 ? rows[0] : null;
}

/** Raw term carrier rate rows for quote engine aggregation. */
async function fetchTermCarrierPremiums(
  supabaseUrl,
  serviceKey,
  age,
  sex,
  smoker,
  termYears,
  state
) {
  const params = new URLSearchParams({
    age: `eq.${age}`,
    sex: `eq.${sex}`,
    smoker: `eq.${smoker}`,
    term_years: `eq.${termYears}`,
    state: `eq.${String(state || "NE").toUpperCase()}`,
    select:
      "carrier,product,state,age,sex,smoker,term_years,face_band_min,face_band_max,face_amount,health_class,rate_per_thousand,policy_fee_annual,modal_monthly_factor,monthly_premium,source_file",
  });
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/term_carrier_premiums?${params}`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(
      `Supabase select term_carrier_premiums ${r.status}: ${text.slice(0, 300)}`
    );
  }
  return JSON.parse(text);
}

/**
 * Appointed-carrier fully underwritten rows harvested from the Integrity
 * marketplace. Ages and faces sit on a grid, so this returns every age/face for
 * the requested sex/smoker/state and lets the caller interpolate.
 */
async function fetchTermIntegrityPremiums(
  supabaseUrl,
  serviceKey,
  sex,
  smoker,
  state
) {
  const pageSize = 1000;
  const base = supabaseUrl.replace(/\/$/, "");
  const all = [];
  // PostgREST caps a response at 1000 rows, and one sex/smoker slice of the
  // grid runs past that, so walk it with Range headers.
  for (let offset = 0; offset < 50000; offset += pageSize) {
    const params = new URLSearchParams({
      sex: `eq.${sex}`,
      smoker: `is.${smoker ? "true" : "false"}`,
      state: `eq.${String(state || "NE").toUpperCase()}`,
      underwriting_mode: "eq.fully_underwritten",
      is_mvi_appointed: "is.true",
      select:
        "carrier_slug,product_slug,state,age,sex,smoker,term_years,face_amount,health_class,monthly_premium",
      order: "age,term_years,face_amount",
      limit: String(pageSize),
      offset: String(offset),
    });
    const r = await fetch(`${base}/rest/v1/term_integrity_premiums?${params}`, {
      headers: restHeaders(serviceKey),
    });
    const text = await r.text();
    if (!r.ok) {
      throw new Error(
        `Supabase select term_integrity_premiums ${r.status}: ${text.slice(0, 300)}`
      );
    }
    const page = JSON.parse(text);
    all.push(...page);
    if (page.length < pageSize) break;
  }
  return all;
}

/** Assurity Protect+ ranges for ages 18–44 ($10K face). */
async function fetchAssurityQuoteRange(supabaseUrl, serviceKey, age, sex, smoker) {
  const params = new URLSearchParams({
    age: `eq.${age}`,
    sex: `eq.${sex}`,
    smoker: `eq.${smoker}`,
    select: "low,high,anchor",
  });
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_ranges_assurity?${params}`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(
      `Supabase select quote_ranges_assurity ${r.status}: ${text.slice(0, 300)}`
    );
  }
  const rows = JSON.parse(text);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Find an existing lead by phone and update it; insert if none found.
 * Returns the lead's id as a string.
 */
async function upsertManychatLeadByPhone(supabaseUrl, serviceKey, phone, fields) {
  const existing = await findManychatLeadsByPhone(supabaseUrl, serviceKey, phone);
  if (existing && existing.length > 0) {
    const id = String(existing[0].id);
    await patchManychatLead(supabaseUrl, serviceKey, id, fields);
    return id;
  }
  return await insertManychatLead(supabaseUrl, serviceKey, { ...fields, phone });
}

/**
 * FAQ operations: lookup and cache.
 */
async function rpcMatchFaqs(supabaseUrl, serviceKey, queryEmbedding, language, matchCount = 1, minSimilarity = 0.75) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/match_faqs`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey),
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      language_filter: language,
      match_count: matchCount,
      min_similarity: minSimilarity,
    }),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase RPC match_faqs ${r.status}: ${text.slice(0, 500)}`);
  }
  return JSON.parse(text);
}

async function insertFaq(supabaseUrl, serviceKey, question, answer, language, embedding) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/faqs`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({
      question,
      answer,
      language,
      embedding,
      usage_count: 1,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase insert faqs ${r.status}: ${t.slice(0, 400)}`);
  }
}

async function incrementFaqUsage(supabaseUrl, serviceKey, faqId) {
  const base = supabaseUrl.replace(/\/$/, "");
  const getUrl = `${base}/rest/v1/faqs?id=eq.${encodeURIComponent(faqId)}&select=id,usage_count&limit=1`;
  const getResp = await fetch(getUrl, { headers: restHeaders(serviceKey) });
  const getText = await getResp.text();
  if (!getResp.ok) {
    throw new Error(`Supabase select faqs ${getResp.status}: ${getText.slice(0, 300)}`);
  }
  const rows = JSON.parse(getText);
  if (!Array.isArray(rows) || rows.length === 0) return;
  const currentUsage = Number(rows[0].usage_count) || 0;

  const patchUrl = `${base}/rest/v1/faqs?id=eq.${encodeURIComponent(faqId)}`;
  const r = await fetch(patchUrl, {
    method: "PATCH",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({ usage_count: currentUsage + 1 }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase patch faqs ${r.status}: ${t.slice(0, 300)}`);
  }
}

/**
 * Chat session operations: create/get sessions and messages.
 */
async function getOrCreateChatSession(supabaseUrl, serviceKey, sessionId, language = "English") {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/chat_sessions?session_id=eq.${encodeURIComponent(sessionId)}&select=id,language`;
  const r = await fetch(url, {
    headers: restHeaders(serviceKey),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase select chat_sessions ${r.status}: ${text.slice(0, 300)}`);
  }
  const rows = JSON.parse(text);
  if (rows && rows.length > 0) {
    return rows[0];
  }
  // Session doesn't exist, create it
  const createUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/chat_sessions`;
  const cr = await fetch(createUrl, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=representation"),
    body: JSON.stringify({ session_id: sessionId, language }),
  });
  const createText = await cr.text();
  if (!cr.ok) {
    throw new Error(`Supabase insert chat_sessions ${cr.status}: ${createText.slice(0, 300)}`);
  }
  const created = JSON.parse(createText);
  return (Array.isArray(created) ? created[0] : created) || { id: null };
}

async function insertChatMessage(supabaseUrl, serviceKey, sessionId, role, content) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/chat_messages`;
  const r = await fetch(url, {
    method: "POST",
    headers: restHeaders(serviceKey, "return=minimal"),
    body: JSON.stringify({ session_id: sessionId, role, content }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase insert chat_messages ${r.status}: ${t.slice(0, 400)}`);
  }
}

async function getLastChatMessages(supabaseUrl, serviceKey, sessionId, limit = 6) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/chat_messages?session_id=eq.${encodeURIComponent(sessionId)}&order=created_at.desc&limit=${limit}&select=role,content,created_at`;
  const r = await fetch(url, {
    headers: restHeaders(serviceKey),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase select chat_messages ${r.status}: ${text.slice(0, 300)}`);
  }
  const rows = JSON.parse(text);
  return Array.isArray(rows) ? rows.reverse() : []; // Reverse to get chronological order
}

module.exports = {
  insertManychatLead,
  patchManychatLead,
  findManychatLeadsByPhone,
  findQualifiedLeadByPhone,
  findManychatLeadBySubscriberId,
  upsertManychatLeadByPhone,
  rpcMatchKnowledgeChunks,
  rpcMatchFaqs,
  insertUnansweredQuestion,
  insertFaq,
  incrementFaqUsage,
  fetchQuoteRange,
  fetchAssurityQuoteRange,
  fetchTermCarrierPremiums,
  fetchTermIntegrityPremiums,
  getOrCreateChatSession,
  insertChatMessage,
  getLastChatMessages,
};
