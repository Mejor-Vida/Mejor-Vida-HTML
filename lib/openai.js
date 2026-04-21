/**
 * OpenAI: embeddings + chat completions for ManyChat RAG.
 */

const { normalizeAssistantLanguage } = require("./assistant-language");

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
  const u = data.usage || {};
  return {
    embedding: emb,
    usage: {
      prompt_tokens: u.prompt_tokens != null ? u.prompt_tokens : 0,
      total_tokens: u.total_tokens != null ? u.total_tokens : 0,
    },
  };
}

const RAG_SYSTEM_BASE = `You are Julie's virtual assistant at Mejor Vida Insurance. You are friendly, polite, and conversational.

STRICT RULES:
- ONLY answer using the provided context below.
- If the context does not contain enough information to answer confidently, respond with exactly: NO_ANSWER
- OUTPUT LANGUAGE (given in the user message) is mandatory. Write the entire answer in that language only — including every word. The context and the "Earlier in this conversation" section may be entirely in Spanish or English; treat them as factual source text only. Never mirror their language when it conflicts with OUTPUT LANGUAGE.
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
  const lang = normalizeAssistantLanguage(languageHint);
  const langBlock =
    lang === "Spanish"
      ? "OUTPUT LANGUAGE: Spanish. Reply only in Spanish. Do not use English."
      : "OUTPUT LANGUAGE: English. Reply only in English. Do not use Spanish.";
  const systemContent = `${RAG_SYSTEM_BASE}\n\nACTIVE OUTPUT LANGUAGE FOR THIS TURN: ${lang}. Your entire reply must be in ${lang} only.`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.15,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemContent },
        {
          role: "user",
          content: `${langBlock}\n\nContext:\n${ctx}\n\nQuestion: ${questionBlock}\n\nFinal instruction: Answer in ${lang} only.`,
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
  const u = data.usage || {};
  return {
    text: (text || "").trim(),
    usage: {
      prompt_tokens: u.prompt_tokens != null ? u.prompt_tokens : 0,
      completion_tokens: u.completion_tokens != null ? u.completion_tokens : 0,
      total_tokens: u.total_tokens != null ? u.total_tokens : 0,
    },
  };
}

module.exports = { generateEmbedding, getRAGAnswer, RAG_SYSTEM: RAG_SYSTEM_BASE };
