/**
 * POST /api/rag-site
 * Website chatbot RAG — Origin-guarded (no ManyChat secret).
 *
 * Legacy (embedded widget): { message|question, locale?, contact? }
 *   → { reply, status }
 *
 * Website assistant (floating widget): { session_id, message, language, history? }
 *   → { status, answer, message_id }
 *   Same handler is also reached at POST /api/website-chat (vercel.json rewrite).
 */

const crypto = require("crypto");
const { verifySiteOrigin } = require("../lib/site-origin");
const { logRequest } = require("../lib/manychat-auth");
const { runRagPipeline } = require("../lib/rag-pipeline");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function localeToLanguage(locale) {
  const l = String(locale || "").toLowerCase();
  if (l === "es" || l.startsWith("es")) return "Spanish";
  return "English";
}

function normalizeAssistantLanguage(raw) {
  const s = String(raw || "").trim();
  if (!s) return "English";
  const low = s.toLowerCase();
  if (
    low === "es" ||
    low === "spanish" ||
    low === "español" ||
    low === "espanol" ||
    low.startsWith("es-") ||
    low.startsWith("es_")
  ) {
    return "Spanish";
  }
  if (low === "en" || low === "english" || low.startsWith("en-") || low.startsWith("en_")) {
    return "English";
  }
  return "English";
}

function historyToContext(history) {
  if (!Array.isArray(history)) return "";
  return history
    .slice(-6)
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => {
      const label = m.role === "user" ? "User" : "Assistant";
      return `${label}: ${String(m.content || "").trim()}`.slice(0, 2500);
    })
    .join("\n")
    .slice(0, 8000);
}

function websiteNoAnswerLine(language) {
  const l = String(language || "").toLowerCase();
  if (l.startsWith("spanish") || l.startsWith("es")) {
    return "Aún no tengo esa información. Julie pronto podrá ayudarte.";
  }
  return "I don't have that information yet. Julie will get back to you soon.";
}

function websiteErrorLine(language) {
  const l = String(language || "").toLowerCase();
  if (l.startsWith("spanish") || l.startsWith("es")) {
    return "No pude conectar con el servidor. Intenta de nuevo en un momento.";
  }
  return "Sorry, I couldn't reach the server. Please try again.";
}

module.exports = async function handler(req, res) {
  logRequest("rag-site");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { reply: "", status: "error", error: "Method Not Allowed" });
  }

  const origin = verifySiteOrigin(req);
  if (!origin.ok) {
    return json(res, origin.status, { reply: "", status: "error", error: origin.error });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { reply: "", status: "error", error: "Invalid JSON" });
  }

  const sessionId = body.session_id != null ? String(body.session_id).trim() : "";
  const websiteChat = Boolean(sessionId);
  const messageId = crypto.randomUUID();

  let pipelineBody;
  let language;

  if (websiteChat) {
    const question = String(body.message || "").trim();
    language = normalizeAssistantLanguage(
      body.language ? String(body.language).trim() : localeToLanguage(body.locale),
    );
    const conversationContext = historyToContext(body.history);
    pipelineBody = {
      question,
      language,
      phone: "",
      flow_stage: "website_assistant",
      conversationContext,
    };

    if (!question) {
      return json(res, 400, {
        status: "error",
        answer: websiteErrorLine(language),
        message_id: messageId,
      });
    }

       try {
      const out = await runRagPipeline(pipelineBody, { hubspotNotePrefix: "Website assistant" });
      const includeUsage = process.env.RAG_RETURN_USAGE === "1";
      if (out.error) {
        return json(res, out.statusCode || 500, {
          status: "error",
          answer: websiteErrorLine(language),
          message_id: messageId,
          ...(includeUsage && out.usage ? { usage: out.usage } : {}),
        });
      }
      if (out.status === "no_answer" || out.answer == null) {
        return json(res, 200, {
          status: "no_answer",
          answer: websiteNoAnswerLine(language),
          message_id: messageId,
          ...(includeUsage && out.usage ? { usage: out.usage } : {}),
        });
      }
      return json(res, 200, {
        status: "answered",
        answer: out.answer,
        message_id: messageId,
        ...(includeUsage && out.usage ? { usage: out.usage } : {}),
      });
    } catch (e) {
      console.error("rag-site website", e);
      return json(res, 500, {
        status: "error",
        answer: websiteErrorLine(language),
        message_id: messageId,
      });
    }
  }

  const question = String(body.question || body.message || "").trim();
  language = body.language
    ? String(body.language).trim()
    : localeToLanguage(body.locale);
  const phone =
    body.phone ||
    (body.contact && body.contact.phone) ||
    "";
  const flowStage = body.flow_stage || "website_chat";

  pipelineBody = {
    question,
    language,
    phone: String(phone).trim(),
    flow_stage: flowStage,
  };

  try {
    const out = await runRagPipeline(pipelineBody, { hubspotNotePrefix: "Website RAG" });
    if (out.error) {
      return json(res, out.statusCode || 500, {
        reply: "",
        status: "error",
        error: out.error,
      });
    }
    if (out.status === "no_answer" || out.answer == null) {
      return json(res, 200, {
        reply: "",
        status: "no_answer",
      });
    }
    return json(res, 200, {
      reply: out.answer,
      status: "answered",
    });
  } catch (e) {
    console.error("rag-site", e);
    return json(res, 500, { reply: "", status: "error", error: "Server error" });
  }
};
