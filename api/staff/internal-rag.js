/**
 * POST /api/staff/internal-rag
 * Semantic search over internal_knowledge_chunks only (Product Selector / staff KB).
 * Does not query public knowledge_chunks.
 *
 * Body: { query, carrier?, category?, match_count?, min_similarity?, synthesize? }
 */

const { requireStaffAuth } = require("../auth-check");
const { generateEmbedding } = require("../../lib/openai");
const { json, readJsonBody, serviceConfig } = require("./_inbox-lib");

async function rpcMatchInternal(cfg, embedding, matchCount, minSim, carrierFilter, categoryFilter) {
  const url = `${cfg.supabaseUrl}/rest/v1/rpc/match_internal_knowledge_chunks`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: matchCount,
      min_similarity: minSim,
      carrier_filter: carrierFilter,
      category_filter: categoryFilter,
    }),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase RPC match_internal_knowledge_chunks ${r.status}: ${text.slice(0, 500)}`);
  }
  return JSON.parse(text || "[]");
}

async function synthesizeFromChunks(openaiKey, userQuery, rows) {
  const ctx = (rows || [])
    .map((row, i) => {
      const sim = row.similarity != null ? Number(row.similarity).toFixed(3) : "?";
      return `[${i + 1}] carrier=${row.carrier || "?"} product=${row.product || "?"} category=${row.category || "?"} similarity=${sim}\n${String(row.content || "").trim()}`;
    })
    .join("\n\n---\n\n");

  const system = `You are an internal underwriting and product assistant for Mejor Vida Insurance staff (Nebraska life products). 
Answer using ONLY the numbered excerpts from the internal knowledge base below. 
Write 2–6 clear sentences. If excerpts are insufficient, say what is missing and suggest what to look up on the carrier site.
Do not invent rates, issue ages, or rules not supported by the excerpts. Never output Q:/A: labels.`;

  const user = `Question:\n${userQuery}\n\nInternal excerpts:\n${ctx}`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 600,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI chat ${r.status}: ${String(err).slice(0, 200)}`);
  }
  const out =
    data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? String(data.choices[0].message.content).trim()
      : "";
  return out;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!cfg || !openaiKey) {
    return json(res, 500, { error: "Server missing required configuration" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const query = String(body.query || "").trim();
  if (!query || query.length > 8000) {
    return json(res, 400, { error: "query required (max 8000 chars)" });
  }

  const carrierRaw = body.carrier != null ? String(body.carrier).trim() : "";
  const categoryRaw = body.category != null ? String(body.category).trim() : "";
  const carrierFilter = carrierRaw && carrierRaw !== "any" ? carrierRaw : null;
  const categoryFilter = categoryRaw && categoryRaw !== "any" ? categoryRaw : null;

  const matchCount = Math.min(50, Math.max(1, parseInt(String(body.match_count || "8"), 10) || 8));
  const minSimilarity = Math.min(1, Math.max(0.05, parseFloat(String(body.min_similarity || "0.25")) || 0.25));
  const synthesize = body.synthesize !== false;

  try {
    const emb = await generateEmbedding(openaiKey, query);
    const rows = await rpcMatchInternal(
      cfg,
      emb.embedding,
      matchCount,
      minSimilarity,
      carrierFilter,
      categoryFilter,
    );

    const chunks = (rows || []).map((r) => ({
      id: r.id,
      carrier: r.carrier,
      product: r.product,
      category: r.category,
      similarity: r.similarity,
      content: String(r.content || "").slice(0, 12000),
    }));

    let synthesis = "";
    if (synthesize && chunks.length && openaiKey) {
      synthesis = await synthesizeFromChunks(openaiKey, query, rows);
    }

    return json(res, 200, {
      ok: true,
      query,
      carrier_filter: carrierFilter,
      category_filter: categoryFilter,
      match_count: matchCount,
      min_similarity: minSimilarity,
      chunks,
      synthesis: synthesis || null,
    });
  } catch (e) {
    console.error("staff/internal-rag", e);
    const detail = e && e.message ? String(e.message).slice(0, 500) : "";
    if (/match_internal_knowledge_chunks|42883|42P01|PGRST/i.test(detail)) {
      return json(res, 503, {
        error: "Internal RAG not ready — apply migration 031_match_internal_knowledge_chunks.sql on Supabase.",
        detail,
      });
    }
    return json(res, 500, { error: "Internal RAG failed", ...(detail ? { detail } : {}) });
  }
};
