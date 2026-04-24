/**
 * Supabase REST helpers (service role). Tables: manychat_leads, unanswered_questions, faqs, chat_sessions, chat_messages.
 */

function restHeaders(serviceKey, prefer) {
  const h = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
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

/**
 * Find leads by phone (E.164 or normalized). Returns rows with id, email, pipeline_stage, drop_off.
 */
async function findManychatLeadsByPhone(supabaseUrl, serviceKey, phone) {
  const q = encodeURIComponent(phone.trim());
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/manychat_leads?phone=eq.${q}&staff_hidden_at=is.null&select=id,email,phone,pipeline_stage,drop_off`;
  const r = await fetch(url, {
    headers: restHeaders(serviceKey),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase select manychat_leads ${r.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
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
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/manychat_leads?manychat_subscriber_id=eq.${q}&staff_hidden_at=is.null&select=id,phone,email,first_name,last_name&limit=1`;
  const r = await fetch(url, { headers: restHeaders(serviceKey) });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase select manychat_leads by subscriber ${r.status}: ${text.slice(0, 300)}`);
  }
  const rows = JSON.parse(text);
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
  getOrCreateChatSession,
  insertChatMessage,
  getLastChatMessages,
};
