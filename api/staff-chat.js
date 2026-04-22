/**
 * POST /api/staff-chat
 * Private staff assistant: full recommendations, no public-chat compliance deflection.
 *
 * Auth: Authorization Bearer <Supabase JWT> (validated server-side).
 */

const { requireStaffAuth } = require("./auth-check");
const { generateEmbedding } = require("../lib/openai");
const { rpcMatchKnowledgeChunks } = require("../lib/supabase");

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
    const chunks = await rpcMatchKnowledgeChunks(supabaseUrl, serviceKey, emb.embedding, 5, 0.35);
    const ctx = (chunks || [])
      .map((c, i) => `[${i + 1}] ${String((c && c.content) || "").slice(0, 2400)}`)
      .join("\n\n");

    const messages = [
      { role: "system", content: staffSystemPrompt() },
      ...conversationHistory,
      {
        role: "user",
        content:
          `Knowledge base context (may be incomplete):\n${ctx || "[none found]"}\n\n` +
          `User question:\n${message}\n\n` +
          `Instruction: Use KB context when available; clearly label assumptions and confidence.`,
      },
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        max_tokens: 1200,
        messages,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      const err = data && data.error && data.error.message ? data.error.message : JSON.stringify(data || {});
      return json(res, 500, { error: `OpenAI error: ${String(err).slice(0, 200)}` });
    }

    const text =
      (data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "";
    return json(res, 200, { answer: String(text).trim() });
  } catch (e) {
    console.error("staff-chat", e);
    return json(res, 500, { error: "Failed to generate staff answer" });
  }
};
