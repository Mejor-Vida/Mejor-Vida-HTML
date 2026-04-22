/**
 * POST /api/website-chat
 * Website chatbot — off-script questions with conversation history context.
 * Env: SUPABASE_*, OPENAI_API_KEY
 *
 * Request: { session_id, message, language? | lang? } (lang: "es"|"en" preferred by some clients)
 * Response: { status: "answered"|"no_answer", answer: "...", message_id?: "..." }
 */

const { getOrCreateChatSession, insertChatMessage, getLastChatMessages } = require("../lib/supabase");
const { normalizeAssistantLanguage } = require("../lib/assistant-language");
const { runRagPipeline } = require("../lib/rag-pipeline");

const PRICING_INTENT =
  /\b(how much|cost|costs|price|premium|rate|per month|monthly|quote|what.*pay|what.*cost|afford|cu[aá]nto|cuesta|precio|prima|mensual|cotizaci[oó]n|cotizar)\b/i;

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
  const language = String(body.lang || body.language || "English").trim();
  const assistantLocale = normalizeAssistantLanguage(language);

  if (!sessionId || !userMessage) {
    return json(res, 400, { status: "error", error: "session_id and message required" });
  }

  if (PRICING_INTENT.test(userMessage)) {
    const isSpanish = assistantLocale === "Spanish" || String(body.lang || body.language || "").toLowerCase().startsWith("es");
    const answer = isSpanish
      ? 'Para ver cuanto costaria tu cobertura, usa nuestra **herramienta de cotizacion gratuita** - solo toma un minuto.\n\n👉 [Obtener mi cotizacion gratuita](https://mejor-vida-html.vercel.app/quote.html)\n\nIngresa tu edad, genero y si usas tabaco, y recibiras un rango de precio estimado al instante. Tambien puedes usar el boton **"Cotizacion gratuita"** en la parte superior de esta pagina.\n\nJulie revisara tu informacion y podra hacer seguimiento contigo personalmente.'
      : 'To see what coverage would cost you, use our **free quote tool** - it only takes a minute.\n\n👉 [Get my free quote](https://mejor-vida-html.vercel.app/quote.html)\n\nEnter your age, gender, and tobacco status and you\\'ll get an estimated price range right away. You can also tap the **"Get a Free Quote"** button at the top of this page.\n\nJulie will see your information and can follow up with you personally.';
    return json(res, 200, { status: "ok", answer, message_id: sessionId });
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
        ? assistantLocale === "Spanish"
          ? "Aún no tengo esa información. Intenta reformular tu pregunta o comunícate con Julie al 402-440-5438."
          : "I don't have that information yet. Please try rephrasing your question or contact us for help."
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
