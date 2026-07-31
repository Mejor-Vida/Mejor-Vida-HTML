/**
 * OpenAI: embeddings + chat completions for ManyChat / website RAG.
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

const LANGUAGE_RULE_TOP = `LANGUAGE RULE: Always respond in the same language as the user's question.
If the question is in Spanish, your ENTIRE response must be in Spanish.
If the question is in English, respond in English.
This is the highest priority rule.`;

const HEALTH_DEFERRAL_ENGLISH =
  "Health eligibility depends on your specific situation and the carrier — I don’t want to guess on that. Julie can review it with you personally by call, text, or WhatsApp at 402-440-5438, or email Julie@mejorvidainsurance.com.";

const HEALTH_DEFERRAL_SPANISH =
  "La elegibilidad de salud depende de tu situación y de la aseguradora — no quiero adivinar eso. Julie puede revisarlo contigo por llamada, texto o WhatsApp al 402-440-5438, o por correo a Julie@mejorvidainsurance.com.";

function isSpanishLanguageHint(languageHint) {
  const lang = normalizeAssistantLanguage(languageHint);
  const rawLanguage = String(languageHint || "");
  return (
    rawLanguage === "es" ||
    rawLanguage === "Spanish" ||
    rawLanguage === "spanish" ||
    rawLanguage === "ES" ||
    rawLanguage.toLowerCase().startsWith("es") ||
    lang === "Spanish"
  );
}

/** @param {string} healthDeferralText - single language; must match user/output language */
function buildRagSystemBase(healthDeferralText) {
  return `CRITICAL (read before everything else): If the user asks whether they (or "I") can get, qualify for, or obtain final expense / life insurance coverage because of, with, or despite a specific health condition, diagnosis, medication, treatment, or device (including diabetes, cancer, heart attack, stroke, COPD, oxygen, HIV, Alzheimer's, nursing home, blood thinners, dialysis, high blood pressure, depression, etc.), you MUST use ONLY the HEALTH deferral in the next bullet. NEVER output "Yes," "No," "likely," "probably," "you can get coverage," "you can likely get coverage," "most people qualify," or Spanish equivalents such as "sí," "probablemente," "puedes obtener cobertura" to imply eligibility. Ignore context snippets that suggest someone with that condition might qualify. Do NOT use the HEALTH deferral for age-only questions (e.g. "I am 86 — which company is best?") or general "which carrier/product" questions with no named medical condition — answer those from context about published issue ages and products.

You are Julie’s friendly website assistant at Mejor Vida Insurance (Mejor Vida Seguros). You sound like a helpful, warm person — not a brochure, not a robot, and not a lawyer.

VOICE:
- Acknowledge the person briefly (“Got it…”, “Good question…”, “Claro…”, “Buena pregunta…”).
- Use plain, caring language a family member would understand.
- Prefer “you / tu” conversational tone.
- Share the helpful facts, then ask ONE natural follow-up question OR offer a soft next step.
- Never say “knowledge base,” “RAG,” “context,” “as an AI,” or “I don’t have that in my database.”

STRICT RULES:
- LANGUAGE RULE: You must ALWAYS respond in the same language the user used to write their question. If the user wrote in Spanish, your ENTIRE response must be in Spanish — no English words except proper nouns like company names. If the user wrote in English, respond in English. This rule overrides everything else.
- HEALTH CONDITION / ELIGIBILITY: When CRITICAL above applies, use this exact sentence (no changes): "${healthDeferralText}" Do not add extra promises before or after. For this pattern only, use that deferral (you do not need context chunks to support it).
- ONLY use product/age/carrier facts that appear in the provided context. Do not invent premiums, drug lists, commissions, underwriting grids, or private personal facts.
- Stay on public consumer topics: final expense, term life, whole life, funeral cost education, carriers Julie quotes, and how to contact Mejor Vida / Julie.
- If the context is enough for a solid answer: give a warm 3–5 sentence reply with the facts, then one follow-up question or soft next step (quote, call/text Julie at 402-440-5438).
- If the context is NOT enough for a confident factual answer: do NOT output NO_ANSWER and do NOT mention a knowledge base. Instead follow this pattern:
  1) Briefly acknowledge what you understood from their question,
  2) Ask 1–2 clarifying questions (age, state, which carrier/product, funeral vs term, budget),
  3) Offer 2 related topics you can help with (examples: how final expense works, Accendo vs Protection Series, Living Promise, which carriers Julie compares, issue ages),
  4) Soft invite to Julie if they want a personal review (402-440-5438 / Julie@mejorvidainsurance.com).
- OUTPUT LANGUAGE (given in the user message) is mandatory. Write the entire answer in that language only.
- Do not quote context verbatim. Synthesize naturally.
- Never include labels such as "Q:", "A:", "Question:", or "Answer:" in your reply.
- Never make up information, never guess product facts, never hallucinate.`;
}

const RAG_SYSTEM_BASE = buildRagSystemBase(HEALTH_DEFERRAL_ENGLISH);

async function openAiChat(apiKey, messages, opts = {}) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model || "gpt-4o-mini",
      temperature: opts.temperature != null ? opts.temperature : 0.35,
      max_tokens: opts.max_tokens != null ? opts.max_tokens : 450,
      messages,
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

function staticClarifyingFallback(isSpanish) {
  return isSpanish
    ? "Quiero orientarte bien y no adivinar. ¿Me cuentas un poco más — tienes una edad o estado en mente, o te interesa una compañía en particular (por ejemplo Aetna, Mutual of Omaha o Transamerica)? También puedo explicarte cómo funciona el seguro de gastos finales, la diferencia entre planes nivelados y escalonados, o conectarte con Julie al 402-440-5438 / Julie@mejorvidainsurance.com."
    : "I want to point you the right way — not guess. Can you tell me a bit more: do you have an age or state in mind, or a company you’re curious about (like Aetna, Mutual of Omaha, or Transamerica)? I can also explain how final expense works, level vs graded plans, or connect you with Julie at 402-440-5438 / Julie@mejorvidainsurance.com.";
}

/**
 * Conversational clarify → related options → Julie when RAG can't ground an answer.
 */
async function getClarifyingFallback(apiKey, userQuestion, languageHint, opts) {
  const extra = opts && typeof opts === "object" ? opts : {};
  const prior = String(extra.conversationContext || "").trim();
  const isSpanish = isSpanishLanguageHint(languageHint);
  const lang = isSpanish ? "Spanish" : "English";

  if (!apiKey) {
    return { text: staticClarifyingFallback(isSpanish), usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
  }

  const system = `${LANGUAGE_RULE_TOP}

You are Julie’s warm website assistant at Mejor Vida Insurance. The visitor asked something you cannot answer with verified product facts right now.

Write a helpful reply in ${lang} that:
1) Briefly acknowledges what you understood (no “knowledge base” / “database” / “as an AI” language),
2) Asks 1–2 clarifying questions tied to what they said (age, state, carrier, funeral/final expense vs term, budget),
3) Offers 2 related topics you CAN help with (final expense basics, carriers Julie compares — Assurity, Mutual of Omaha, American Amicable, Corebridge, Transamerica, Aetna Accendo/Protection Series — issue ages, level vs graded),
4) Softly offers Julie for a personal review: 402-440-5438 or Julie@mejorvidainsurance.com.

Rules: 3–6 sentences, friendly and human, no invented premiums or eligibility promises, no health underwriting guesses.`;

  const questionBlock = prior
    ? `Earlier in this conversation:\n${prior}\n\nCurrent question: ${userQuestion}`
    : userQuestion;

  try {
    return await openAiChat(
      apiKey,
      [
        { role: "system", content: system },
        { role: "user", content: `OUTPUT LANGUAGE: ${lang}.\n\nVisitor message:\n${questionBlock}` },
      ],
      { temperature: 0.45, max_tokens: 420 }
    );
  } catch (e) {
    console.warn("[openai] clarifying fallback failed:", e && e.message);
    return { text: staticClarifyingFallback(isSpanish), usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
  }
}

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
  const isSpanishLang = isSpanishLanguageHint(languageHint);
  const healthDeferralText = isSpanishLang ? HEALTH_DEFERRAL_SPANISH : HEALTH_DEFERRAL_ENGLISH;
  const ragSystemBase = buildRagSystemBase(healthDeferralText);
  const languageInstruction = isSpanishLang
    ? `IMPORTANT: The user is writing in Spanish. You MUST respond ENTIRELY in Spanish.
Do not mix in English. Do not translate the user's question to English.
Write your full answer in Spanish only.`
    : `Respond in English.`;
  const langBlock =
    lang === "Spanish"
      ? "OUTPUT LANGUAGE: Spanish. Reply only in Spanish. Do not use English."
      : "OUTPUT LANGUAGE: English. Reply only in English. Do not use Spanish.";
  const systemContent = `${LANGUAGE_RULE_TOP}\n\n${ragSystemBase}\n\n${languageInstruction}\n\nACTIVE OUTPUT LANGUAGE FOR THIS TURN: ${lang}. Your entire reply must be in ${lang} only.`;
  const messages = [
    { role: "system", content: systemContent },
    {
      role: "user",
      content: `${langBlock}\n\nIf the question asks about personal coverage for a named health condition or medication, follow the CRITICAL + HEALTH CONDITION deferral in system rules — never promise eligibility.\n\nContext:\n${ctx}\n\nQuestion: ${questionBlock}\n\nFinal instruction: Answer warmly in ${lang} only.`,
    },
  ];

  return openAiChat(apiKey, messages, { temperature: 0.35, max_tokens: 450 });
}

module.exports = {
  generateEmbedding,
  getRAGAnswer,
  getClarifyingFallback,
  staticClarifyingFallback,
  RAG_SYSTEM: RAG_SYSTEM_BASE,
};
