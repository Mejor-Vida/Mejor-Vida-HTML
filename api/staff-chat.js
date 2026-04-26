/**
 * POST /api/staff-chat
 * Private staff assistant: full recommendations, no public-chat compliance deflection.
 *
 * Auth: Authorization Bearer <Supabase JWT> (validated server-side).
 */

const { requireStaffAuth } = require("./auth-check");
const { generateEmbedding } = require("../lib/openai");
const { createHash } = require("crypto");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-12)
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role,
      content: String(m.content || "").slice(0, 5000),
    }))
    .filter((m) => m.content.trim());
}

function staffSystemPrompt() {
  const today = new Date().toISOString().slice(0, 10);
  return `You are an expert life and health insurance advisor and internal trainer for Julie and her team at Mejor Vida Insurance. Your job is to:

1. Answer any question about life insurance, health insurance, final expense insurance, Medicare supplements, annuities, underwriting, compliance, or any related topic — completely and directly. Do not deflect. Do not say "consult a professional." You ARE the expert resource.

2. When Julie describes a specific client (age, sex, smoker status, health conditions, state, desired coverage amount, monthly budget), recommend the best available product. Cross-reference the client profile against carrier underwriting guidelines from the knowledge base. Filter out products the client would not qualify for. Rank the products that fit by value and suitability. For each recommendation explain: product name, carrier, why it fits this client, estimated premium range if known, and any caveats.

3. Compare products side by side when asked.

4. Walk Julie through underwriting questions and likely outcomes for a specific client.

5. Always cite the carrier and product name when giving specifics. Distinguish clearly between information from the knowledge base versus general industry knowledge. If you do not have verified information on a specific rate or underwriting rule, say so and recommend verifying with the carrier. Never fabricate rates, policy numbers, benefit amounts, or eligibility rules.

6. When making a product recommendation, always list your assumptions about the client and include a confidence level (High / Medium / Low) based on how much verified information you have.

Current date: ${today}`;
}

async function rpcMatchInternalKnowledgeChunks(supabaseUrl, serviceKey, embedding, matchCount, minSimilarity) {
  const r = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/match_internal_knowledge_chunks`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: matchCount,
      min_similarity: minSimilarity,
      carrier_filter: null,
      category_filter: null,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`internal rag rpc ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text || "[]");
}

function buildGroundedPrompt(message, ctx) {
  return (
    `Internal KB excerpts:\n${ctx || "[none found]"}\n\n` +
    `User question:\n${message}\n\n` +
    `Instruction: Answer ONLY from internal KB excerpts. If a detail is missing, say it is not in internal KB.\n` +
    `You MUST include at least one citation tag like [1] or [2] for any concrete claim.`
  );
}

function maxSimilarity(chunks) {
  if (!Array.isArray(chunks) || !chunks.length) return 0;
  let best = 0;
  for (const c of chunks) {
    const s = Number(c && c.similarity);
    if (Number.isFinite(s) && s > best) best = s;
  }
  return best;
}

function hasCitationMarkers(text) {
  return /\[\d+\]/.test(String(text || ""));
}

function admitsGeneralKnowledge(text) {
  const t = String(text || "").toLowerCase();
  return (
    t.includes("general industry knowledge") ||
    t.includes("not directly from the internal kb") ||
    t.includes("not in the internal kb excerpts") ||
    t.includes("no internal kb")
  );
}

function stripSourceHeader(text) {
  const raw = String(text || "").trim();
  return raw.replace(/^source:\s.*(?:\r?\n)+/i, "").trim();
}

function withTrustedSourceHeader(text, sourceLabel) {
  const body = stripSourceHeader(text);
  return `Source: ${sourceLabel}\n\n${body}`.trim();
}

function sanitizeForGapQueue(text) {
  const s = String(text || "");
  const lines = s.split(/\r?\n/);
  const blocked = /(diagnos|condition|medication|prescription|hospital|surgery|insulin|cancer|stroke|copd|kidney|heart|phi|underwriting)/i;
  return lines
    .filter((ln) => !blocked.test(ln))
    .join("\n")
    .trim();
}

function stableQuestionHash(message) {
  const normalized = String(message || "").trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized).digest("hex");
}

async function upsertStaffKbGap(supabaseUrl, serviceKey, row) {
  const r = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/staff_kb_gaps?on_conflict=question_hash`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`kb-gap upsert ${r.status}: ${String(t || "").slice(0, 240)}`);
  }
}

function isCarrierSpecificEligibilityQuery(message) {
  const t = String(message || "").toLowerCase();
  const asksCarrier = /(american amicable|assurity|mutual of omaha|moo|carrier)/.test(t);
  const asksEligibility =
    /(non[\s-]?citizen|undocumented|immigration|visa|green card|itin|resident|citizen|eligib|qualif|sell to)/.test(t);
  return asksCarrier && asksEligibility;
}

function buildNoKbCarrierEligibilityAnswer() {
  return (
    "I do not have enough verified carrier-specific eligibility detail in the internal KB excerpts for this question.\n\n" +
    "I can only confirm carrier rules when the internal knowledge retrieval includes those exact rules. " +
    "If you want, I can provide a checklist of what to verify (visa type, residency duration, ITIN acceptance, state restrictions) and then we can match each carrier once the KB excerpts include that section."
  );
}

async function complete(openaiKey, model, temperature, maxTokens, messages) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages,
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data && data.error && data.error.message ? data.error.message : JSON.stringify(data || {});
    throw new Error(`OpenAI error: ${String(err).slice(0, 200)}`);
  }
  return (
    (data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content) ||
    ""
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!supabaseUrl || !serviceKey || !openaiKey) {
    return json(res, 500, { error: "Server missing required configuration" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const message = String(body.message || "").trim();
  if (!message) return json(res, 400, { error: "message required" });
  const conversationHistory = sanitizeHistory(body.conversationHistory);

  try {
    const emb = await generateEmbedding(openaiKey, message);
    const chunks = await rpcMatchInternalKnowledgeChunks(supabaseUrl, serviceKey, emb.embedding, 8, 0.25);
    const ctx = (chunks || [])
      .map((c, i) => `[${i + 1}] ${String((c && c.content) || "").slice(0, 2400)}`)
      .join("\n\n");
    const internalStrongRetrieval = Array.isArray(chunks) && chunks.length >= 2 && maxSimilarity(chunks) >= 0.45;
    if (internalStrongRetrieval) {
      const groundedMessages = [
        {
          role: "system",
          content:
            staffSystemPrompt() +
            "\n\nResponse policy: You are in INTERNAL-KB mode. Use only provided internal excerpts. Start with: Source: Internal Knowledge Base (RAG).",
        },
        ...conversationHistory,
        { role: "user", content: buildGroundedPrompt(message, ctx) },
      ];
      const text = await complete(openaiKey, "gpt-4o", 0.15, 1200, groundedMessages);
      const groundedText = String(text).trim();
      const groundedEnough = hasCitationMarkers(groundedText) && !admitsGeneralKnowledge(groundedText);
      if (groundedEnough) {
        return json(res, 200, {
          answer: withTrustedSourceHeader(groundedText, "Internal Knowledge Base (RAG)"),
          source: "internal_rag",
        });
      }
    }

    if (isCarrierSpecificEligibilityQuery(message)) {
      const nowIso = new Date().toISOString();
      const answerBody = buildNoKbCarrierEligibilityAnswer();
      const answer = withTrustedSourceHeader(answerBody, "General Industry Knowledge (RAG insufficient)");
      try {
        await upsertStaffKbGap(supabaseUrl, serviceKey, {
          question: sanitizeForGapQueue(message),
          question_hash: stableQuestionHash(message),
          assistant_answer: sanitizeForGapQueue(answerBody),
          source: "general_fallback",
          retrieval_count: Array.isArray(chunks) ? chunks.length : 0,
          max_similarity: maxSimilarity(chunks),
          resolved: false,
          resolved_at: null,
          resolved_by: null,
          last_asked_at: nowIso,
          updated_at: nowIso,
        });
      } catch (logErr) {
        console.warn("staff-chat kb-gap log skipped:", logErr && logErr.message ? logErr.message : logErr);
      }
      return json(res, 200, {
        answer,
        source: "general_fallback",
      });
    }

    const fallbackMessages = [
      {
        role: "system",
        content:
          staffSystemPrompt() +
          "\n\nResponse policy: Internal KB retrieval was insufficient. Answer from general insurance knowledge and clearly mark uncertainty. Start with: Source: General Industry Knowledge (RAG insufficient).",
      },
      ...conversationHistory,
      {
        role: "user",
        content:
          `User question:\n${message}\n\n` +
          `Internal retrieval status: insufficient chunks (${Array.isArray(chunks) ? chunks.length : 0}).`,
      },
    ];
    const text = await complete(openaiKey, "gpt-4o", 0.2, 1200, fallbackMessages);
    const nowIso = new Date().toISOString();
    const fallbackBody = stripSourceHeader(String(text).trim());
    try {
      await upsertStaffKbGap(supabaseUrl, serviceKey, {
        question: sanitizeForGapQueue(message),
        question_hash: stableQuestionHash(message),
        assistant_answer: sanitizeForGapQueue(fallbackBody),
        source: "general_fallback",
        retrieval_count: Array.isArray(chunks) ? chunks.length : 0,
        max_similarity: maxSimilarity(chunks),
        resolved: false,
        resolved_at: null,
        resolved_by: null,
        last_asked_at: nowIso,
        updated_at: nowIso,
      });
    } catch (logErr) {
      console.warn("staff-chat kb-gap log skipped:", logErr && logErr.message ? logErr.message : logErr);
    }
    return json(res, 200, {
      answer: withTrustedSourceHeader(fallbackBody, "General Industry Knowledge (RAG insufficient)"),
      source: "general_fallback",
    });
  } catch (e) {
    console.error("staff-chat", e);
    return json(res, 500, { error: "Failed to generate staff answer" });
  }
};
