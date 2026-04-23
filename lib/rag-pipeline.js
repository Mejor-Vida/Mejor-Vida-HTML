/**
 * Shared RAG: embedding → match_knowledge_chunks → gpt-4o-mini, optional unanswered + HubSpot note.
 */

const {
  rpcMatchKnowledgeChunks,
  rpcMatchFaqs,
  insertUnansweredQuestion,
  insertFaq,
  incrementFaqUsage,
  findManychatLeadBySubscriberId,
} = require("./supabase");
const { getContactByManychatSubscriberId } = require("./contacts-db");
const { generateEmbedding, getRAGAnswer } = require("./openai");
const { hubspotSearchContact, hubspotAddNote } = require("./hubspot");
const {
  normalizeAssistantLanguage,
  healthEligibilityDeferralLine,
  shouldSkipFaqForHealthEligibilityQuestion,
  shouldSkipFaqCachingQuestion,
  isSpanishLanguageHint,
} = require("./assistant-language");

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
}

/** ManyChat sometimes sends unresolved custom fields as literal `{{field}}` — treat as missing. */
const UNRESOLVED_MANYCHAT_TEMPLATE = /^\{\{[\s\S]*\}\}$/;

function sanitizeManychatTemplateField(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s || UNRESOLVED_MANYCHAT_TEMPLATE.test(s)) return null;
  return s;
}

function extractManychatSubscriberId(body) {
  if (!body || typeof body !== "object") return null;
  const keys = [
    body.manychat_subscriber_id,
    body.manychatSubscriberId,
    body.whatsapp_id,
    body.whatsappId,
    body.subscriber_id,
    body.subscriberId,
    body.user_id,
    body.userId,
  ];
  for (const c of keys) {
    const v = sanitizeManychatTemplateField(c);
    if (v) return v;
  }
  return null;
}

/**
 * Resolve lead_id + phone from Supabase using ManyChat subscriber id (preferred over body.phone / custom fields).
 */
async function resolveLeadContextFromSubscriber(supabaseUrl, supabaseKey, subscriberId, bodyPhone) {
  let phone = bodyPhone;
  let leadId = null;
  if (!subscriberId) return { phone, leadId };

  let leadRow = null;
  let contactRow = null;
  try {
    leadRow = await findManychatLeadBySubscriberId(supabaseUrl, supabaseKey, subscriberId);
  } catch (e) {
    console.error("rag-pipeline findManychatLeadBySubscriberId", e.message);
  }
  try {
    contactRow = await getContactByManychatSubscriberId(supabaseUrl, supabaseKey, subscriberId);
  } catch (e) {
    console.error("rag-pipeline getContactByManychatSubscriberId", e.message);
  }

  if (leadRow) {
    leadId = leadRow.id;
    const fromLead = sanitizeManychatTemplateField(leadRow.phone);
    if (fromLead) phone = fromLead.slice(0, 40);
  }
  if (!phone && contactRow) {
    const fromContact = sanitizeManychatTemplateField(contactRow.phone);
    if (fromContact) phone = fromContact.slice(0, 40);
  }
  return { phone: phone || null, leadId };
}

/** Skip FAQ retrieval for intents where stale cache has caused persistent wrong answers. */
function shouldSkipFaqLookup(question) {
  return shouldSkipFaqCachingQuestion(question) || isWaitingPeriodQuestion(question) || isLocationQuestion(question);
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

function isWaitingPeriodQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /\b(waiting period|how long.*wait|periodo de espera|cuanto tiempo hay que esperar|tiempo de espera)\b/.test(t);
}

function isLocationQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /(where.*located|where are.*located|ubicad|direccion|address|oficina)/.test(t);
}

/** Shared post-process after LLM or Spanish direct chunk return. */
function applyKnowledgeAnswerPostProcess(question, answerText, isSpanishQuery, skipFaqHealth) {
  let out = answerText;
  if (skipFaqHealth && out) {
    const t = out.trim();
    const looksLikeEligibilityPromise =
      /\b(yes|sí)\b.*\b(can|could|will|likely|probably|puedes|podrías|obtener|get|coverage|cobertura|qualif|calif)/i.test(
        t,
      ) ||
      /\b(likely|probably|probablemente)\b.*\b(coverage|cobertura|qualif|calif|get|obtener)/i.test(t) ||
      /\b(you can|one can|people can|applicants can|puedes obtener|puedes calificar)\b.*\b(coverage|cobertura)/i.test(
        t,
      );
    if (looksLikeEligibilityPromise) {
      out = healthEligibilityDeferralLine(isSpanishQuery ? "es" : "en");
    }
  }
  if (isApprovalTimelineQuestion(question) && out) {
    const t = out.toLowerCase();
    if (t.includes("few days to a week") || t.includes("pocos dias")) {
      out = isSpanishQuery
        ? "Sí, algunas aseguradoras ofrecen decisiones instantáneas o el mismo día para pólizas de emisión simplificada cuando aplicas por vía electrónica, sin examen médico. Julie te orienta sobre las opciones más rápidas para tu caso."
        : "Some carriers offer instant or same-day decisions for simplified issue final expense policies when you apply electronically, with no medical exam. Julie can guide you to the fastest options for your situation.";
    }
  }
  if (isWaitingPeriodQuestion(question) && out) {
    const t = out.toLowerCase();
    const missingDetail =
      !(
        t.includes("graded") ||
        t.includes("modified") ||
        t.includes("graduado") ||
        t.includes("modificado")
      ) || !(t.includes("no waiting") || t.includes("sin período de espera") || t.includes("sin periodo de espera"));
    if (missingDetail) {
      out = isSpanishQuery
        ? "Muchas pólizas de gastos finales — en especial los planes de beneficio graduado o modificado — incluyen un período de espera de 2 años para la muerte por causas naturales. Durante ese período, los beneficiarios suelen recibir primas pagadas más intereses en lugar del beneficio completo. Los planes de beneficio inmediato (nivel) pueden ofrecer cobertura sin período de espera para solicitantes que califican en buen estado de salud."
        : "Many final expense policies — especially graded or modified benefit plans — include a 2-year waiting period for death from natural causes. During that period, beneficiaries typically receive premiums paid plus interest instead of the full face amount. Immediate-benefit (level) plans can offer no waiting period for applicants who qualify in good health.";
    }
  }
  if (isLocationQuestion(question) && out) {
    const t = out.toLowerCase();
    if (!(t.includes("16820 frances") && t.includes("omaha"))) {
      out = isSpanishQuery
        ? "Mejor Vida Insurance está ubicada en 16820 Frances St, Suite 208, Omaha, NE 68130. También puedes contactar a Julie por llamada, texto o WhatsApp al 402-440-5438. Atendemos a clientes en todo Nebraska."
        : "Mejor Vida Insurance is located at 16820 Frances St, Suite 208, Omaha, NE 68130. You can also contact Julie by call, text, or WhatsApp at 402-440-5438. We serve clients across Nebraska.";
    }
  }
  if (isContactPhoneQuestion(question) && out) {
    const hasAllThree =
      out.includes("402-440-5438") &&
      out.includes("402-588-1125") &&
      (out.includes("735-5665") || out.includes("(402) 735-5665"));
    if (!hasAllThree) {
      out +=
        isSpanishQuery
          ? ' También guarda el 402-588-1125 como "Julie – Mejor Vida Insurance" (el número desde el que ella llama) y el +1 (402) 735-5665 como "Mejor Vida Insurance" (mensajes de texto automáticos).'
          : ' Also save 402-588-1125 as "Julie – Mejor Vida Insurance" (the number she calls from) and +1 (402) 735-5665 as "Mejor Vida Insurance" (automated text updates).';
    }
  }
  return out;
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
  // Accept `lang` (e.g. website-chat QA / clients) or `language` (ManyChat, forms).
  const language = normalizeAssistantLanguage(String(body.lang || body.language || "English"));
  let phone = sanitizeManychatTemplateField(body.phone);
  if (phone) phone = phone.slice(0, 40);
  const flowStageRaw = sanitizeManychatTemplateField(body.flow_stage || body.flowStage);
  const flowStage = flowStageRaw ? flowStageRaw.slice(0, 100) : null;
  const conversationContext = String(body.conversationContext || "").trim().slice(0, 8000) || null;

  if (!question) {
    return { error: "question required", statusCode: 400 };
  }

  const subscriberId = extractManychatSubscriberId(body);
  let leadId = null;
  if (subscriberId) {
    const resolved = await resolveLeadContextFromSubscriber(supabaseUrl, supabaseKey, subscriberId, phone);
    phone = resolved.phone;
    leadId = resolved.leadId;
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
  const isSpanishLang =
    isSpanishLanguageHint(String(body.language || "").trim()) ||
    isSpanishLanguageHint(language) ||
    ["es", "spanish", "Spanish", "ES"].includes(String(language || "").trim()) ||
    String(language || "").toLowerCase().startsWith("es");
  const questionLooksSpanish =
    /[áéíóúüñ¿¡]/i.test(question) ||
    /\b(para |una |del |también|tengo |puedo |cuál |cómo |dónde |qué )\b/i.test(question);
  const isSpanishQuery = isSpanishLang || questionLooksSpanish;
  const skipFaqForSpanish = isSpanishQuery;

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

  const matchCount = isSpanishQuery ? 30 : 8;

  let chunks;
  try {
    chunks = await rpcMatchKnowledgeChunks(supabaseUrl, supabaseKey, embedding, matchCount, 0.35);
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
      // Strong match: return Spanish chunk text directly so the model cannot "helpfully" translate to English.
      if (
        !skipFaqHealth &&
        spanishChunks.length > 0 &&
        (Number(spanishChunks[0].similarity) || 0) > 0.5
      ) {
        const topChunk = spanishChunks[0];
        let directAnswer = String(topChunk.content || topChunk.answer || "").trim();
        const answerMatch = directAnswer.match(/(?:answer|respuesta):\s*([\s\S]+)/i);
        if (answerMatch) directAnswer = answerMatch[1].trim();
        if (directAnswer && !/^NO_ANSWER$/i.test(directAnswer)) {
          usageBase.supabase_match_rpc_calls = 1;
          usageBase.knowledge_chunks_returned = spanishChunks.length;
          let answerText = applyKnowledgeAnswerPostProcess(question, directAnswer, isSpanishQuery, skipFaqHealth);
          usageBase.outcome = "answered";
          logRagUsage(usageBase);
          return { answer: answerText, status: "answered", usage: usageBase };
        }
      }
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
    lead_id: leadId,
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
      return { answer: healthEligibilityDeferralLine(isSpanishQuery ? "es" : "en"), status: "answered", usage: usageBase };
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

  answerText = applyKnowledgeAnswerPostProcess(question, answerText, isSpanishQuery, skipFaqHealth);

  if (!answerText || /^NO_ANSWER$/i.test(answerText.trim())) {
    if (skipFaqHealth) {
      usageBase.outcome = "health_deferral_no_answer";
      logRagUsage(usageBase);
      return { answer: healthEligibilityDeferralLine(isSpanishQuery ? "es" : "en"), status: "answered", usage: usageBase };
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

module.exports = { runRagPipeline, sanitizeManychatTemplateField };
