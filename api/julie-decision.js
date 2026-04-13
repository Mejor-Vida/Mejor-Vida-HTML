/**
 * POST /api/julie-decision
 *
 * Julie approves or rejects her answer to a knowledge gap.
 * On approval, the answer is also ingested into the knowledge_chunks KB
 * so future RAG queries can find it automatically.
 *
 * Julie sends:
 *   gap_id      (required) UUID of the knowledge_gaps row
 *   decision    (required) 'approved' | 'rejected'
 *   answer      (required if approved) Julie's approved answer text
 *   us_state    (optional) 'NE' | 'general' — determines KB scope (default: 'general')
 *   kb_language (optional) 'english' | 'spanish' | 'both' (default: 'both')
 *
 * On approval:
 *   1. Updates knowledge_gaps with decision + answer + decided_at
 *   2. Generates an embedding via OpenAI
 *   3. Inserts a new knowledge_chunks row (new KB entry)
 *   4. Marks knowledge_gaps.added_to_kb_at
 *
 * On rejection:
 *   1. Updates knowledge_gaps with decision='rejected' and no answer
 *
 * Returns:
 *   { success: true, decision: "approved"|"rejected", chunk_id: "..." }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY,
 *      MANYCHAT_WEBHOOK_SECRET
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const {
  updateKnowledgeGapDecision,
  markKnowledgeGapAdded,
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

// ─── KB ingestion helpers ─────────────────────────────────────────────────────

async function generateEmbedding(openAiKey, text) {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`OpenAI embeddings ${r.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data.data[0].embedding;
}

async function insertKnowledgeChunk(supabaseUrl, serviceKey, { content, embedding, usState, kbLanguage }) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/knowledge_chunks`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      content,
      embedding,
      us_state: usState || "general",
      kb_language: kbLanguage || "both",
      metadata: JSON.stringify({ source: "julie_approved", auto_ingested: true }),
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`knowledge_chunks insert ${r.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  const row = Array.isArray(data) ? data[0] : data;
  return row && row.id ? String(row.id) : null;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  logRequest("julie-decision");

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
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Server missing Supabase env vars" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const gapId = String(body.gap_id || "").trim();
  const decision = String(body.decision || "").trim().toLowerCase();
  const answer = String(body.answer || "").trim();

  if (!gapId) return json(res, 400, { success: false, error: "gap_id is required" });
  if (!["approved", "rejected"].includes(decision)) {
    return json(res, 400, { success: false, error: "decision must be 'approved' or 'rejected'" });
  }
  if (decision === "approved" && !answer) {
    return json(res, 400, { success: false, error: "answer is required when approving" });
  }

  const usState = String(body.us_state || "general").trim();
  const kbLanguage = String(body.kb_language || "both").trim();

  logWebhook(supabaseUrl, supabaseKey, "julie", "/api/julie-decision", { gap_id: gapId, decision });

  try {
    // 1. Record Julie's decision
    await updateKnowledgeGapDecision(supabaseUrl, supabaseKey, gapId, { decision, answer });

    if (decision === "rejected") {
      return json(res, 200, { success: true, decision: "rejected" });
    }

    // 2. APPROVED — ingest into knowledge base
    if (!openAiKey) {
      console.warn("julie-decision: OPENAI_API_KEY missing — KB ingestion skipped");
      return json(res, 200, {
        success: true,
        decision: "approved",
        warning: "Answer approved but not ingested — OPENAI_API_KEY not configured",
      });
    }

    // Generate embedding for the answer text
    const embedding = await generateEmbedding(openAiKey, answer);

    // Insert into knowledge_chunks
    const chunkId = await insertKnowledgeChunk(supabaseUrl, supabaseKey, {
      content: answer,
      embedding,
      usState,
      kbLanguage,
    });

    // Mark the gap as added to KB
    await markKnowledgeGapAdded(supabaseUrl, supabaseKey, gapId, chunkId);

    console.log("julie-decision: approved + KB ingested, chunk:", chunkId);

    return json(res, 200, {
      success: true,
      decision: "approved",
      chunk_id: chunkId,
    });
  } catch (e) {
    console.error("julie-decision error:", e.message);
    return json(res, 500, { success: false, error: "Server error processing decision" });
  }
};
