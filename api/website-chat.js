/**
 * POST /api/website-chat
 * Website chatbot — off-script questions with conversation history context.
 * Env: SUPABASE_*, OPENAI_API_KEY
 *
 * Request: { session_id, message, language? }
 * Response: { status: "answered"|"no_answer", answer: "...", message_id?: "..." }
 */

const { getOrCreateChatSession, insertChatMessage, getLastChatMessages } = require("../lib/supabase");
const { runRagPipeline } = require("../lib/rag-pipeline");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { status: "error", error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, {
      status: "error",
      error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }
  if (!process.env.OPENAI_API_KEY) {
    return json(res, 500, { status: "error", error: "Server missing OPENAI_API_KEY" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { status: "error", error: "Invalid JSON" });
  }

  const sessionId = String(body.session_id || "").trim();
  const userMessage = String(body.message || "").trim();
  const language = String(body.language || "English").trim();

  if (!sessionId || !userMessage) {
    return json(res, 400, { status: "error", error: "session_id and message required" });
  }

  try {
    // Step 1: Get or create session
    let session;
    try {
      session = await getOrCreateChatSession(supabaseUrl, supabaseKey, sessionId, language);
    } catch (e) {
      console.error("website-chat session", e.message);
      return json(res, 500, { status: "error", error: "Failed to initialize session" });
    }

    // Step 2: Get last messages (for conversation context)
    let lastMessages = [];
    try {
      lastMessages = await getLastChatMessages(supabaseUrl, supabaseKey, sessionId, 6);
    } catch (e) {
      console.error("website-chat get messages", e.message);
      // Non-blocking; continue without context if retrieval fails
    }

    // Step 3: Format conversation context (last 3-4 turns = 6-8 messages max)
    let conversationContext = "";
    if (lastMessages && lastMessages.length > 0) {
      conversationContext = lastMessages
        .map((msg) => `${msg.role === "user" ? "You" : "Assistant"}: ${msg.content}`)
        .join("\n");
    }

    // Step 4: Run RAG pipeline with conversation context
    const ragRequest = {
      question: userMessage,
      language,
      conversationContext, // Pass prior messages for context
      // Note: no phone or flow_stage for website; those are ManyChat-specific
    };

    const ragOut = await runRagPipeline(ragRequest, { hubspotNotePrefix: "Website Chat" });

    if (ragOut.error) {
      return json(res, ragOut.statusCode || 500, { status: "error", error: ragOut.error });
    }

    const assistantAnswer =
      ragOut.status === "no_answer" || ragOut.answer == null
        ? "I don't have that information yet. Please try rephrasing your question or contact us for help."
        : ragOut.answer;

    const responseStatus = ragOut.status === "answered" ? "answered" : "no_answer";

    // Step 5: Save both messages to chat_messages table (async, don't block response)
    (async () => {
      try {
        await insertChatMessage(supabaseUrl, supabaseKey, sessionId, "user", userMessage);
        await insertChatMessage(supabaseUrl, supabaseKey, sessionId, "assistant", assistantAnswer);
      } catch (e) {
        console.error("website-chat save messages", e.message);
        // Non-blocking
      }
    })();

    // Step 6: Return response
    return json(res, 200, {
      status: responseStatus,
      answer: assistantAnswer,
      message_id: sessionId, // Could generate unique message ID here if needed
    });
  } catch (e) {
    console.error("website-chat", e);
    return json(res, 500, { status: "error", error: "Server error" });
  }
};
