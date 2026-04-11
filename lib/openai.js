/**
 * OpenAI: embeddings + chat completions for ManyChat RAG.
 */

async function generateEmbedding(apiKey, text) {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI embeddings ${r.status}: ${err}`);
  }
  const emb = data.data && data.data[0] && data.data[0].embedding;
  if (!emb || !Array.isArray(emb)) {
    throw new Error("OpenAI embeddings: missing embedding");
  }
  return emb;
}

const RAG_SYSTEM = `You are Julie's virtual assistant at Mejor Vida Insurance. You are friendly, polite, and conversational.

STRICT RULES:
- ONLY answer using the provided context below.
- If the context does not contain enough information to answer confidently, respond with exactly: NO_ANSWER
- Match the user's language (English or Spanish)
- Keep it short and conversational — 2-3 sentences max
- Never make up information, never guess, never hallucinate`;

async function getRAGAnswer(apiKey, userQuestion, contextChunks, languageHint, opts) {
  const extra = opts && typeof opts === "object" ? opts : {};
  const prior = String(extra.conversationContext || "").trim();
  const questionBlock = prior
    ? `Earlier in this conversation:\n${prior}\n\nCurrent question: ${userQuestion}`
    : userQuestion;

  const ctx = contextChunks
    .map((c, i) => `[${i + 1}] ${typeof c === "string" ? c : c.content || ""}`)
    .join("\n\n");
  const lh = String(languageHint || "").toLowerCase();
  const langLine =
    lh.startsWith("es") || lh === "spanish"
      ? "Respond in Spanish."
      : "Respond in English.";

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        { role: "system", content: RAG_SYSTEM },
        {
          role: "user",
          content: `${langLine}\n\nContext:\n${ctx}\n\nQuestion: ${questionBlock}`,
        },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI chat ${r.status}: ${err}`);
  }
  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return (text || "").trim();
}

module.exports = { generateEmbedding, getRAGAnswer, RAG_SYSTEM };
