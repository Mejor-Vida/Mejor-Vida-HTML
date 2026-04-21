/**
 * Shared RAG: embedding → match_knowledge_chunks → gpt-4o-mini, optional unanswered + HubSpot note.
 */

const { rpcMatchKnowledgeChunks, rpcMatchFaqs, insertUnansweredQuestion, insertFaq, incrementFaqUsage } = require("./supabase");
const { generateEmbedding, getRAGAnswer } = require("./openai");
const { hubspotSearchContact, hubspotAddNote } = require("./hubspot");
const {
  normalizeAssistantLanguage,
  healthEligibilityDeferralLine,
  shouldSkipFaqForHealthEligibilityQuestion,
  shouldSkipFaqCachingQuestion,
} = require("./assistant-language");

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
}

/** Skip FAQ retrieval for intents where stale cache has caused persistent wrong answers. */
function shouldSkipFaqLookup(question) {
  return shouldSkipFaqCachingQuestion(question);
}

function isApprovalTimelineQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    (t.includes("approv") && (t.includes("how long") || t.includes("same day") || t.includes("timeline"))) ||
    t.includes("mismo dia") ||
    t.includes("cuanto tarda") ||
    t.includes("aprobacion")
  );
}

function isContactPhoneQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /\b(phone|contact|reach|whatsapp|telefono|numero|contacto|contactar|comunicar|llamar)\b/.test(t);
}

async function hubspotOptionalNote(token, phone, body) {
  if (!token || !phone) return;
  try {
    const cid = await hubspotSearchContact(token, "phone", phone);
    if (cid) await hubspotAddNote(token, cid, body);
  } catch (e) {
    /* optional */
  }
}

/** One JSON line per RAG request — filter Vercel logs on `rag_request_usage`. */
function logRagUsage(summary) {
  console.log(
    JSON.stringify({
      event: "rag_request_usage",
      ts: new Date().toISOString(),
      ...summary,
    }),
  );
}

/**
 * @param {object} body - question, language, phone, flow_stage
 * @param {{ hubspotNotePrefix?: string }} opts
 */
async function runRagPipeline(body, opts) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = serviceKey();
  const openaiKey = process.env.OPENAI_API_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
  const notePrefix = (opts && opts.hubspotNotePrefix) || "RAG";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase config");
  }
  if (!openaiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const question = String(body.question || "").trim();
  const language = normalizeAssistantLanguage(body.language || "English");
  const phone = String(body.phone || "").trim().slice(0, 40);
  const flowStage = String(body.flow_stage || body.flowStage || "").trim().slice(0, 100) || null;
  const conversationContext = String(body.conversationContext || "").trim().slice(0, 8000) || null;

  if (!question) {
    return { error: "question required", statusCode: 400 };
  }

  const usageBase = {
    flow_stage: flowStage,
    question_len: question.length,
    openai_embed_prompt_tokens: 0,
    openai_embed_total_tokens: 0,
    openai_chat_prompt_tokens: null,
    openai_chat_completion_tokens: null,
    openai_chat_total_tokens: null,
    openai_calls: 0,
    supabase_match_rpc_calls: 0,
    knowledge_chunks_returned: 0,
    outcome: null,
  };

  let embedding;
  try {
    const embOut = await generateEmbedding(openaiKey, question);
    embedding = embOut.embedding;
    usageBase.openai_embed_prompt_tokens = embOut.usage.prompt_tokens;
    usageBase.openai_embed_total_tokens = embOut.usage.total_tokens;
    usageBase.openai_calls += 1;
  } catch (e) {
    console.error("rag-pipeline embedding", e.message);
    usageBase.outcome = "error_embedding";
    logRagUsage(usageBase);
    return { error: "Embedding failed", statusCode: 500, usage: usageBase };
  }

  const skipFaqHealth = shouldSkipFaqForHealthEligibilityQuestion(question);
  const skipFaqForSpanish = language === "Spanish";

  // TIER 1: Check FAQ cache first (fast, no LLM), except health-eligibility questions
  let faqMatch;
  if (!skipFaqHealth && !skipFaqForSpanish && !shouldSkipFaqLookup(question)) {
    try {
      const faqResults = await rpcMatchFaqs(supabaseUrl, supabaseKey, embedding, language, 1, 0.75);
      faqMatch = faqResults && faqResults.length > 0 ? faqResults[0] : null;
    } catch (e) {
      console.error("rag-pipeline faq search", e.message);
      // Don't fail; just skip FAQ tier and go to knowledge chunks
    }
  }

  if (faqMatch && faqMatch.answer) {
    // FAQ hit! Return instantly + increment usage
    try {
      await incrementFaqUsage(supabaseUrl, supabaseKey, faqMatch.id);
    } catch (e) {
      console.error("rag-pipeline increment faq usage", e.message);
    }
    usageBase.outcome = "faq_hit";
    logRagUsage(usageBase);
    return { answer: faqMatch.answer, status: "answered", usage: usageBase };
  }

  const isSpanishQuery =
    ["es", "spanish", "ES"].includes(String(language || "").trim()) ||
    String(language || "").trim() === "Spanish" ||
    /[áéíóúüñ¿¡]/i.test(question) ||
    /\b(para |una |del |también|tengo |puedo |cuál |cómo |dónde |qué )\b/i.test(question);
  const matchCount = isSpanishQuery ? 20 : 8;

  let chunks;
  try {
    chunks = await rpcMatchKnowledgeChunks(supabaseUrl, supabaseKey, embedding, matchCount, 0.35);
    console.log("[LANG_FILTER] language var:", language);
    console.log("[LANG_FILTER] isSpanishQuery:", isSpanishQuery);
    console.log("[LANG_FILTER] total chunks returned:", chunks && chunks.length ? chunks.length : 0);
    if (chunks && chunks.length > 0) {
      console.log("[LANG_FILTER] first chunk keys:", Object.keys(chunks[0]));
      console.log("[LANG_FILTER] first chunk sample:", JSON.stringify(chunks[0]).substring(0, 300));
    }
    // Post-filter: for Spanish questions, prefer chunks with Spanish content.
    if (isSpanishQuery && chunks && chunks.length > 0) {
      const isSpanishChunk = (c) => {
        const text = String(c.content || c.text || c.answer || c.question || c.chunk || c.body || "").toLowerCase();
        return (
          /[áéíóúüñ¿¡]/.test(text) ||
          /\b(para |una |del |también|aseguradora|póliza|gastos|familia|días|cobertura|seguro |número|llamada|teléfono|guardar|contactar|espera|período|correo|electrónico|llama|comunícate|contáctala|compañías|cotización|atendemos|nuestro|puedes|puede |está |están )\b/.test(
            text,
          )
        );
      };
      const spanishChunks = chunks.filter(isSpanishChunk);
      if (spanishChunks.length >= 1) {
        chunks = spanishChunks;
      }
    }
    usageBase.supabase_match_rpc_calls = 1;
    usageBase.knowledge_chunks_returned = chunks && chunks.length ? chunks.length : 0;
  } catch (e) {
    console.error("rag-pipeline rpc", e.message);
    usageBase.outcome = "error_knowledge_rpc";
    logRagUsage(usageBase);
    return { error: "Knowledge search failed", statusCode: 500, usage: usageBase };
  }

  const row = {
    lead_id: null,
    phone: phone || null,
    question,
    language,
    flow_stage: flowStage,
    resolved: false,
  };

  if (!chunks || !chunks.length) {
    if (skipFaqHealth) {
      usageBase.outcome = "health_deferral_no_chunks";
      logRagUsage(usageBase);
      return { answer: healthEligibilityDeferralLine(language), status: "answered", usage: usageBase };
    }
    try {
      await insertUnansweredQuestion(supabaseUrl, supabaseKey, row);
    } catch (e) {
      console.error("rag-pipeline save unanswered", e.message);
    }
    await hubspotOptionalNote(
      hubspotToken,
      phone,
      `${notePrefix} — no grounded answer.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
    );
    usageBase.outcome = "no_answer_no_chunks";
    logRagUsage(usageBase);
    return { answer: null, status: "no_answer", usage: usageBase };
  }

  let answerText;
  try {
    const llmQuestion = isSpanishQuery
      ? `[IMPORTANT: Respond ENTIRELY in Spanish. Do not use English.]\n\n${question}`
      : question;
    console.log("[PIPELINE→LLM] chunks count being sent to LLM:", chunks && chunks.length ? chunks.length : 0);
    console.log("[PIPELINE→LLM] first chunk content:", String((chunks && chunks[0] && chunks[0].content) || "").substring(0, 150));
    console.log(
      "[PIPELINE→LLM] last chunk content:",
      String((chunks && chunks.length ? chunks[chunks.length - 1].content : "") || "").substring(0, 150),
    );
    const chatOut = await getRAGAnswer(openaiKey, llmQuestion, chunks, language, {
      conversationContext,
    });
    answerText = chatOut.text;
    usageBase.openai_chat_prompt_tokens = chatOut.usage.prompt_tokens;
    usageBase.openai_chat_completion_tokens = chatOut.usage.completion_tokens;
    usageBase.openai_chat_total_tokens = chatOut.usage.total_tokens;
    usageBase.openai_calls += 1;
  } catch (e) {
    console.error("rag-pipeline chat", e.message);
    usageBase.outcome = "error_chat";
    logRagUsage(usageBase);
    return { error: "Answer generation failed", statusCode: 500, usage: usageBase };
  }

  if (skipFaqHealth && answerText) {
    const t = answerText.trim();
    const looksLikeEligibilityPromise =
      /\b(yes|sí)\b.*\b(can|could|will|likely|probably|puedes|podrías|obtener|get|coverage|cobertura|qualif|calif)/i.test(
        t,
      ) ||
      /\b(likely|probably|probablemente)\b.*\b(coverage|cobertura|qualif|calif|get|obtener)/i.test(t) ||
      /\b(you can|one can|people can|applicants can|puedes obtener|puedes calificar)\b.*\b(coverage|cobertura)/i.test(
        t,
      );
    if (looksLikeEligibilityPromise) {
      answerText = healthEligibilityDeferralLine(language);
    }
  }

  if (isApprovalTimelineQuestion(question) && answerText) {
    const t = answerText.toLowerCase();
    if (t.includes("few days to a week") || t.includes("pocos dias")) {
      answerText =
        language === "Spanish"
          ? "Sí, algunas aseguradoras ofrecen decisiones instantáneas o el mismo día para pólizas de emisión simplificada cuando aplicas por vía electrónica, sin examen médico. Julie te orienta sobre las opciones más rápidas para tu caso."
          : "Some carriers offer instant or same-day decisions for simplified issue final expense policies when you apply electronically, with no medical exam. Julie can guide you to the fastest options for your situation.";
    }
  }

  if (isContactPhoneQuestion(question) && answerText) {
    const hasAllThree =
      answerText.includes("402-440-5438") &&
      answerText.includes("402-588-1125") &&
      (answerText.includes("735-5665") || answerText.includes("(402) 735-5665"));
    if (!hasAllThree) {
      answerText +=
        language === "Spanish"
          ? " También guarda el 402-588-1125 como \"Julie – Mejor Vida Insurance\" (el número desde el que ella llama) y el +1 (402) 735-5665 como \"Mejor Vida Insurance\" (mensajes de texto automáticos)."
          : " Also save 402-588-1125 as \"Julie – Mejor Vida Insurance\" (the number she calls from) and +1 (402) 735-5665 as \"Mejor Vida Insurance\" (automated text updates).";
    }
  }

  if (!answerText || /^NO_ANSWER$/i.test(answerText.trim())) {
    if (skipFaqHealth) {
      usageBase.outcome = "health_deferral_no_answer";
      logRagUsage(usageBase);
      return { answer: healthEligibilityDeferralLine(language), status: "answered", usage: usageBase };
    }
    try {
      await insertUnansweredQuestion(supabaseUrl, supabaseKey, row);
    } catch (e) {
      console.error("rag-pipeline save unanswered", e.message);
    }
    await hubspotOptionalNote(
      hubspotToken,
      phone,
      `${notePrefix} — NO_ANSWER.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
    );
    usageBase.outcome = "no_answer_model";
    logRagUsage(usageBase);
    return { answer: null, status: "no_answer", usage: usageBase };
  }

  // Successfully answered: cache as FAQ for future use (async, don't block response)
  if (!skipFaqHealth && !skipFaqForSpanish && !shouldSkipFaqCachingQuestion(question)) {
    try {
      await insertFaq(supabaseUrl, supabaseKey, question, answerText, language, embedding);
    } catch (e) {
      console.error("rag-pipeline cache faq", e.message);
      // Non-blocking; FAQ caching failure doesn't affect the response
    }
  }

  usageBase.outcome = "answered";
  logRagUsage(usageBase);
  return { answer: answerText, status: "answered", usage: usageBase };
}

module.exports = { runRagPipeline };
