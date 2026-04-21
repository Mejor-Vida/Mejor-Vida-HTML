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
} = require("./assistant-language");

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
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

  // TIER 1: Check FAQ cache first (fast, no LLM) — skip if question looks like personal health / eligibility
  let faqMatch;
  if (!skipFaqHealth) {
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
    chunks = await rpcMatchKnowledgeChunks(supabaseUrl, supabaseKey, embedding, 8, 0.5);
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
  if (!skipFaqHealth) {
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
