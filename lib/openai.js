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

const FACEBOOK_HEALTH_DEFERRAL_ENGLISH =
  "Health eligibility depends on your situation. Julie can review it with you in the private message.";

const FACEBOOK_HEALTH_DEFERRAL_SPANISH =
  "La elegibilidad de salud depende de su situación. Julie puede revisarlo con usted en el mensaje privado.";

function isFacebookCommentAudience(opts) {
  const extra = opts && typeof opts === "object" ? opts : {};
  return extra.audience === "facebook_comment" || extra.publicFacebook === true;
}

function buildFacebookRagSystem(healthDeferralText) {
  return `You answer PUBLIC Facebook Page comments for Mejor Vida Seguros (Mejor Vida Insurance).

This comment is public. Julie will send a private message separately.

Write 1–2 short sentences. Simple words (about 6th–8th grade). Spanish uses usted, never tú.

TONE: Never sarcastic, snide, witty, or clever at the commenter’s expense. Never argue, correct, or debate a complaint. Never lecture. Never say the equivalent of “that’s exactly why you should plan ahead” / “precisamente por eso.” Do not match insults or jokes. If they are upset and did not ask a product question, thank them briefly and say Julie will write privately. Do not sell in that reply.

Use only public consumer facts from the context: what a product is, that price depends on age, health, and coverage, who Julie is (founder / licensed agent), general buying ages. Synthesize; do not dump the context.

Do not include: phone numbers, email, URLs, licensed-state lists, mailing address, sample monthly prices, carrier shopping lists (unless the comment named that carrier), commissions, underwriting grids, WhatsApp, or “call Julie.”

If they asked about a health condition, use ONLY this sentence: "${healthDeferralText}"

If the context is thin: one simple helpful sentence, then say Julie can explain more in the private message.`;
}

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

function staticClarifyingFallback(isSpanish, opts) {
  if (isFacebookCommentAudience(opts)) {
    return isSpanish
      ? "Puedo orientar en términos generales. Julie le dará más detalle en el mensaje privado."
      : "I can share a general answer. Julie will give more detail in the private message.";
  }
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
  const facebook = isFacebookCommentAudience(extra);

  if (!apiKey) {
    return { text: staticClarifyingFallback(isSpanish, extra), usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
  }

  const system = facebook
    ? `${LANGUAGE_RULE_TOP}

${buildFacebookRagSystem(isSpanish ? FACEBOOK_HEALTH_DEFERRAL_SPANISH : FACEBOOK_HEALTH_DEFERRAL_ENGLISH)}

The context is not enough for a detailed product answer. Write one simple ${lang} sentence and say Julie can explain more in the private message.`
    : `${LANGUAGE_RULE_TOP}

You are Julie’s warm website assistant at Mejor Vida Insurance. The visitor asked something you cannot answer with verified product facts right now.

Write a helpful reply in ${lang} that:
1) Briefly acknowledges what you understood (no “knowledge base” / “database” / “as an AI” language),
2) Asks 1–2 clarifying questions tied to what they said (age, state, carrier, funeral/final expense vs term, budget),
3) Offers 2 related topics you CAN help with (final expense basics, carriers Mejor Vida Insurance compares — Assurity, Mutual of Omaha, American Amicable, Corebridge, Transamerica, Aetna Accendo/Protection Series, Americo Eagle Select — issue ages, level vs graded),
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
      { temperature: facebook ? 0.2 : 0.45, max_tokens: facebook ? 160 : 420 }
    );
  } catch (e) {
    console.warn("[openai] clarifying fallback failed:", e && e.message);
    return { text: staticClarifyingFallback(isSpanish, extra), usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
  }
}

const CLIENT_INTENTS = new Set([
  "quote",
  "what_we_sell",
  "funeral_homes",
  "funeral_prices",
  "policy",
  "health",
  "contact",
  "other",
]);

/**
 * Read what the client is trying to do. Spelling does not decide this.
 * Unclear or mixed messages come back as not clear, so the bot does not guess.
 */
async function classifyClientIntent(apiKey, userQuestion) {
  const empty = { clear: false, intent: "unclear", usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
  const message = String(userQuestion || "").trim();
  if (!apiKey || !message) return empty;
  const system = `You read one WhatsApp message to a final-expense insurance agency. The writer may misspell words. Decide the one thing they are trying to do.

Return JSON only, no markdown:
{"clear":true,"intent":"quote"}

intent must be one of: quote, what_we_sell, funeral_homes, funeral_prices, policy, health, contact, other.

quote = they want a price or a quote for insurance.
what_we_sell = they want to know what the agency sells, or the difference between burial coverage and a funeral.
funeral_homes = they want funeral-home names, phones, or addresses.
funeral_prices = they want what a funeral, burial, or cremation costs in a place.
policy = a specific policy, carrier, waiting period, beneficiary, or level versus graded coverage.
health = whether a health condition affects coverage.
contact = how to reach the agent.
other = one clear question that is none of the above.

Set clear to false when the message is mixed, too broken to be sure, or could reasonably be more than one of those.
A city, or the word funeral, is not by itself a request for funeral homes.
Asking whether the agency helps pay for a funeral is what_we_sell, not funeral_prices.
Asking whether they sell term life is policy, not what_we_sell.
Asking Julie to call is contact.
A funeral already happening, with no money to pay it, is other. It is not a request to learn what the agency sells.
Do not pick an intent just because a word appears. If you are not sure, clear is false.

Examples:
"¿Me puede llamar Julie?" -> {"clear":true,"intent":"contact"}
"No sé qué es lo que venden, ¿entierro o funeral?" -> {"clear":true,"intent":"what_we_sell"}
"El funeral de mi mamá costó mucho, ¿ustedes ayudan con eso?" -> {"clear":true,"intent":"what_we_sell"}
"Estoy en Kansas, en Topeka, y quiero una cotización" -> {"clear":true,"intent":"quote"}
"¿Cuál es la diferencia entre un plan nivelado y uno escalonado?" -> {"clear":true,"intent":"policy"}
"¿Venden seguro de término?" -> {"clear":true,"intent":"policy"}
"¿Hay un período de espera?" -> {"clear":true,"intent":"policy"}
"Mi esposo murió y no tengo dinero para el funeral" -> {"clear":true,"intent":"other"}
"I'm a 68 year old woman and I don't smoke." -> {"clear":true,"intent":"quote"}
"Soy señora, tengo 74 años y no fumo." -> {"clear":true,"intent":"quote"}
"¿Habla español?" -> {"clear":true,"intent":"contact"}
"What if it is suicide?" -> {"clear":true,"intent":"policy"}
"Does the insurance pay for the cemetery plot?" -> {"clear":true,"intent":"policy"}
"¿El dinero lo recibe la funeraria o mi familia?" -> {"clear":true,"intent":"policy"}
"Quiero cancelar mi póliza" -> {"clear":true,"intent":"other"}
"Is this a scam?" -> {"clear":true,"intent":"other"}
"I live in Texas. Can you help me?" -> {"clear":true,"intent":"other"}
"No se ke es lo ke bender terror o el funeral Estoy stadium de ks pero es en Topeka" -> {"clear":false,"intent":"unclear"}
"Topeka" -> {"clear":false,"intent":"unclear"}
"hola" -> {"clear":false,"intent":"unclear"}`;
  try {
    const out = await openAiChat(
      apiKey,
      [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      { temperature: 0, max_tokens: 60 }
    );
    const raw = String(out.text || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(raw);
    const intent = String(parsed && parsed.intent || "").trim();
    if (parsed && parsed.clear === true && CLIENT_INTENTS.has(intent)) {
      return { clear: true, intent, usage: out.usage };
    }
    return { clear: false, intent: "unclear", usage: out.usage };
  } catch (e) {
    console.warn("[openai] intent classify failed:", e && e.message);
    return empty;
  }
}

async function getRAGAnswer(apiKey, userQuestion, contextChunks, languageHint, opts) {
  const extra = opts && typeof opts === "object" ? opts : {};
  const prior = String(extra.conversationContext || "").trim();
  const questionBlock = prior
    ? `Earlier in this conversation:\n${prior}\n\nCurrent question: ${userQuestion}`
    : userQuestion;
  const facebook = isFacebookCommentAudience(extra);

  const ctx = contextChunks
    .map((c, i) => `[${i + 1}] ${typeof c === "string" ? c : c.content || ""}`)
    .join("\n\n");
  const lang = normalizeAssistantLanguage(languageHint);
  const isSpanishLang = isSpanishLanguageHint(languageHint);
  const healthDeferralText = facebook
    ? isSpanishLang
      ? FACEBOOK_HEALTH_DEFERRAL_SPANISH
      : FACEBOOK_HEALTH_DEFERRAL_ENGLISH
    : isSpanishLang
      ? HEALTH_DEFERRAL_SPANISH
      : HEALTH_DEFERRAL_ENGLISH;
  const ragSystemBase = facebook ? buildFacebookRagSystem(healthDeferralText) : buildRagSystemBase(healthDeferralText);
  const languageInstruction = isSpanishLang
    ? `IMPORTANT: The user is writing in Spanish. You MUST respond ENTIRELY in Spanish.
Do not mix in English. Do not translate the user's question to English.
Write your full answer in Spanish only.`
    : `Respond in English.`;
  const langBlock =
    lang === "Spanish"
      ? "OUTPUT LANGUAGE: Spanish. Reply only in Spanish. Do not use English."
      : "OUTPUT LANGUAGE: English. Reply only in English. Do not use Spanish.";
  const publicRule = !facebook && !extra.strictAnswer
    ? `PUBLIC ACCURACY: Do not include any dollar amount, premium, funeral price, coverage amount, or policy fee. Say that Julie confirms amounts. The only phone number to give is 402-440-5438. Do not say the agency is licensed only in Nebraska. Do not list Nebraska, Kansas, Colorado, and Nevada; point to the licenses page. The cemetery plot is a separate bill. A burial vault is almost never in the funeral-home package. Do not promise how many days a claim takes. Do not guess Medicaid, Medicare, or health eligibility.`
    : "";
  const strictRule = extra.strictAnswer
    ? `WHATSAPP RULE: The client's intent is already decided: ${extra.clientIntent || "unclear"}.
Answer only that intent, and only with facts from the context that directly answer it.
If the context does not answer that intent, reply with exactly NO_ANSWER and nothing else.
Do not guess. Do not ask a follow-up question. Do not switch to a different topic because some words overlap.
Write like a careful insurance agency. In Spanish use usted only: puede, tiene, le. Never tú, te, puedes, tienes, quieres, deseas, or tu.
No slang, no emoji, no markdown, no asterisks, no dashes as a list, no bracketed links, and no follow-up question.
Never say that most final expense policies have a two-year wait. A level plan pays the full benefit from day one if approved. A graded plan limits natural death for the first two years. Accidental death is normally paid in full.
The agency compares carriers. Do not say the agency is the insurance company.
Use the exact numbers in the context. Do not soften a stated figure with "puede" or "generalmente".
If a figure is a statewide average, call it a statewide average. Do not present it as that city's price.
Do not include any dollar amount, premium, funeral price, coverage amount, or policy fee.
For funeral homes, name at most four. One plain sentence each: name, address, phone. Do not include prices. Say each funeral home sets its own prices and the cemetery plot is a separate bill.
For funeral prices, do not give figures. Say each funeral home sets its own prices, the plot and vault are usually separate bills, and Julie confirms an insurance quote.`
    : "";
  const systemContent = `${LANGUAGE_RULE_TOP}\n\n${ragSystemBase}\n\n${languageInstruction}\n\n${publicRule}\n\n${strictRule}\n\nACTIVE OUTPUT LANGUAGE FOR THIS TURN: ${lang}. Your entire reply must be in ${lang} only.`;
  const finalInstruction = facebook
    ? `Final instruction: Answer in 1–2 simple ${lang} sentences. Public-facing only. No phone, email, URL, or licensed-state list. Never sarcastic or argumentative. Never lecture.`
    : extra.strictAnswer
      ? `Final instruction: Professional plain text in ${lang} only. No markdown.`
      : `Final instruction: Answer warmly in ${lang} only.`;
  const messages = [
    { role: "system", content: systemContent },
    {
      role: "user",
      content: `${langBlock}\n\nIf the question asks about personal coverage for a named health condition or medication, follow the HEALTH deferral in system rules — never promise eligibility.\n\nContext:\n${ctx}\n\nQuestion: ${questionBlock}\n\n${finalInstruction}`,
    },
  ];

  return openAiChat(apiKey, messages, {
    temperature: facebook ? 0.2 : 0.35,
    max_tokens: facebook ? 180 : 450,
  });
}

module.exports = {
  generateEmbedding,
  getRAGAnswer,
  getClarifyingFallback,
  classifyClientIntent,
  staticClarifyingFallback,
  RAG_SYSTEM: RAG_SYSTEM_BASE,
};
