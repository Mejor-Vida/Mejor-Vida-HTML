/**
 * Shared RAG: embedding → match_knowledge_chunks → gpt-4o-mini, optional unanswered + HubSpot note.
 */

const { rpcMatchKnowledgeChunks, insertUnansweredQuestion } = require("./supabase");
const { generateEmbedding, getRAGAnswer } = require("./openai");
const { hubspotSearchContact, hubspotAddNote } = require("./hubspot");

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
  const language = String(body.language || "English").trim();
  const phone = String(body.phone || "").trim().slice(0, 40);
  const flowStage = String(body.flow_stage || body.flowStage || "").trim().slice(0, 100) || null;

  if (!question) {
    return { error: "question required", statusCode: 400 };
  }

  let embedding;
  try {
    embedding = await generateEmbedding(openaiKey, question);
  } catch (e) {
    console.error("rag-pipeline embedding", e.message);
    return { error: "Embedding failed", statusCode: 500 };
  }

  let chunks;
  try {
    chunks = await rpcMatchKnowledgeChunks(supabaseUrl, supabaseKey, embedding, 3, 0.7);
  } catch (e) {
    console.error("rag-pipeline rpc", e.message);
    return { error: "Knowledge search failed", statusCode: 500 };
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
    return { answer: null, status: "no_answer" };
  }

  let answerText;
  try {
    answerText = await getRAGAnswer(openaiKey, question, chunks, language);
  } catch (e) {
    console.error("rag-pipeline chat", e.message);
    return { error: "Answer generation failed", statusCode: 500 };
  }

  if (!answerText || /^NO_ANSWER$/i.test(answerText.trim())) {
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
    return { answer: null, status: "no_answer" };
  }

  return { answer: answerText, status: "answered" };
}

module.exports = { runRagPipeline };
