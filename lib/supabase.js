/**
 * Supabase REST helpers (service role). Table: manychat_leads, unanswered_questions.
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
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/manychat_leads?phone=eq.${q}&select=id,email,pipeline_stage,drop_off`;
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

module.exports = {
  insertManychatLead,
  patchManychatLead,
  findManychatLeadsByPhone,
  findQualifiedLeadByPhone,
  upsertManychatLeadByPhone,
  rpcMatchKnowledgeChunks,
  insertUnansweredQuestion,
  fetchQuoteRange,
};
