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

  let chunks;
  try {
    chunks = await rpcMatchKnowledgeChunks(supabaseUrl, supabaseKey, embedding, 8, 0.35);
    // Post-filter: for Spanish questions, prefer Spanish-language chunks.
    const langCode = language === "Spanish" || String(language).toLowerCase() === "es" ? "es" : "en";
    if (langCode === "es" && chunks && chunks.length > 0) {
      const spanishChunks = chunks.filter((c) => {
        const meta = c && c.metadata ? c.metadata : {};
        const chunkLang = String(meta.language || c.language || "").toLowerCase();
        return chunkLang === "es" || chunkLang === "spanish";
      });
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
    const chatOut = await getRAGAnswer(openaiKey, question, chunks, language, {
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
