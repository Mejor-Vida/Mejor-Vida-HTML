/**
 * POST /api/rag-answer
 * ManyChat — off-script questions via knowledge_chunks RAG.
 * Env: SUPABASE_*, MANYCHAT_WEBHOOK_SECRET, OPENAI_API_KEY, HUBSPOT_ACCESS_TOKEN (optional note)
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { rpcMatchKnowledgeChunks, insertUnansweredQuestion } = require("../lib/supabase");
const { generateEmbedding, getRAGAnswer } = require("../lib/openai");
const { hubspotSearchContact, hubspotAddNote } = require("../lib/hubspot");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  logRequest("rag-answer");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { status: "error", error: "Method Not Allowed" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    return json(res, auth.status, { status: "error", error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, {
      status: "error",
      error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }
  if (!openaiKey) {
    return json(res, 500, { status: "error", error: "Server missing OPENAI_API_KEY" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { status: "error", error: "Invalid JSON" });
  }

  const question = String(body.question || "").trim();
  const language = String(body.language || "English").trim();
  const phone = String(body.phone || "").trim().slice(0, 40);
  const flowStage = String(body.flow_stage || body.flowStage || "").trim().slice(0, 100) || null;

  if (!question) {
    return json(res, 400, { status: "error", error: "question required" });
  }

  let embedding;
  try {
    embedding = await generateEmbedding(openaiKey, question);
  } catch (e) {
    console.error("rag-answer embedding", e.message);
    return json(res, 500, { status: "error", error: "Embedding failed" });
  }

  let chunks;
  try {
    chunks = await rpcMatchKnowledgeChunks(supabaseUrl, supabaseKey, embedding, 3, 0.7);
  } catch (e) {
    console.error("rag-answer rpc", e.message);
    return json(res, 500, { status: "error", error: "Knowledge search failed" });
  }

  if (!chunks || !chunks.length) {
    try {
      await insertUnansweredQuestion(supabaseUrl, supabaseKey, {
        lead_id: null,
        phone: phone || null,
        question,
        language,
        flow_stage: flowStage,
        resolved: false,
      });
    } catch (e) {
      console.error("rag-answer save unanswered", e.message);
    }
    if (hubspotToken && phone) {
      try {
        const cid = await hubspotSearchContact(hubspotToken, "phone", phone);
        if (cid) {
          await hubspotAddNote(
            hubspotToken,
            cid,
            `WhatsApp RAG — no grounded answer.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
          );
        }
      } catch (e) {
        /* optional */
      }
    }
    return json(res, 200, { answer: null, status: "no_answer" });
  }

  let answerText;
  try {
    answerText = await getRAGAnswer(openaiKey, question, chunks, language);
  } catch (e) {
    console.error("rag-answer chat", e.message);
    return json(res, 500, { status: "error", error: "Answer generation failed" });
  }

  if (!answerText || /^NO_ANSWER$/i.test(answerText.trim())) {
    try {
      await insertUnansweredQuestion(supabaseUrl, supabaseKey, {
        lead_id: null,
        phone: phone || null,
        question,
        language,
        flow_stage: flowStage,
        resolved: false,
      });
    } catch (e) {
      console.error("rag-answer save unanswered", e.message);
    }
    if (hubspotToken && phone) {
      try {
        const cid = await hubspotSearchContact(hubspotToken, "phone", phone);
        if (cid) {
          await hubspotAddNote(
            hubspotToken,
            cid,
            `WhatsApp RAG — NO_ANSWER.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
          );
        }
      } catch (e) {
        /* optional */
      }
    }
    return json(res, 200, { answer: null, status: "no_answer" });
  }

  return json(res, 200, { answer: answerText, status: "answered" });
};
