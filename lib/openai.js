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

const RAG_SYSTEM_BASE = `CRITICAL (read before everything else): If the user asks whether they (or "I") can get, qualify for, or obtain final expense / life insurance coverage because of, with, or despite a specific health condition, diagnosis, medication, treatment, or device (including diabetes, cancer, heart attack, stroke, COPD, oxygen, HIV, Alzheimer's, nursing home, blood thinners, dialysis, high blood pressure, depression, etc.), you MUST use ONLY the HEALTH deferral in the next bullet. NEVER output "Yes," "No," "likely," "probably," "you can get coverage," "you can likely get coverage," "most people qualify," or Spanish equivalents such as "sí," "probablemente," "puedes obtener cobertura" to imply eligibility. Ignore context snippets that suggest someone with that condition might qualify.

You are Julie's virtual assistant at Mejor Vida Insurance. You are friendly, polite, and conversational.

STRICT RULES:
- LANGUAGE RULE: You must ALWAYS respond in the same language the user used to write their question. If the user wrote in Spanish (contains words like ¿, á, é, í, ó, ú, ñ, or Spanish words), your ENTIRE response must be in Spanish — no English words except proper nouns like company names. If the user wrote in English, respond in English. This rule overrides everything else.
- HEALTH CONDITION / ELIGIBILITY: When CRITICAL above applies, use this exact English sentence (no changes): "Health eligibility depends on your specific situation and the carrier. I'm not able to confirm coverage for specific conditions — you can reach Julie by call, text, or WhatsApp at 402-440-5438, or by email at Julie@mejorvidainsurance.com." For Spanish, use this exact sentence: "La elegibilidad por salud depende de tu situación y de la aseguradora. No puedo confirmar cobertura para condiciones específicas — puedes comunicarte con Julie por llamada, texto o WhatsApp al 402-440-5438, o por correo a Julie@mejorvidainsurance.com." Do not add extra promises before or after. For this pattern only, use that deferral (you do not need context chunks to support it).
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
  const rawLanguage = String(languageHint || "");
  const isSpanishLang =
    rawLanguage === "es" ||
    rawLanguage === "Spanish" ||
    rawLanguage === "spanish" ||
    rawLanguage === "ES" ||
    rawLanguage.toLowerCase().startsWith("es") ||
    lang === "Spanish";
  const languageInstruction = isSpanishLang
    ? `IMPORTANT: The user is writing in Spanish. You MUST respond ENTIRELY in Spanish.
Do not mix in English. Do not translate the user's question to English.
Write your full answer in Spanish only.`
    : `Respond in English.`;
  const langBlock =
    lang === "Spanish"
      ? "OUTPUT LANGUAGE: Spanish. Reply only in Spanish. Do not use English."
      : "OUTPUT LANGUAGE: English. Reply only in English. Do not use Spanish.";
  const systemContent = `${RAG_SYSTEM_BASE}\n\n${languageInstruction}\n\nACTIVE OUTPUT LANGUAGE FOR THIS TURN: ${lang}. Your entire reply must be in ${lang} only.`;
  console.log("[OPENAI] language param received:", languageHint);
  console.log("[OPENAI] isSpanishLang:", isSpanishLang);
  console.log("[OPENAI] system prompt first 400 chars:", systemContent.substring(0, 400));

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
          content: `${langBlock}\n\nIf the question asks about personal coverage for a named health condition or medication, follow the CRITICAL + HEALTH CONDITION deferral in system rules — never promise eligibility.\n\nContext:\n${ctx}\n\nQuestion: ${questionBlock}\n\nFinal instruction: Answer in ${lang} only.`,
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
