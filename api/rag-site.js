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
const { normalizeAssistantLanguage } = require("../lib/assistant-language");
const {
  checkWebsiteChatRateLimit,
  rateLimitMessage,
} = require("../lib/rate-limit");

const PRICING_INTENT_EN =
  /\b(how much|cost|costs|price|premium|rate|per month|monthly|quote|what (will|would|do) (i|we) (pay|cost)|what.*(cost|price)|afford)\b/i;
const PRICING_INTENT_ES =
  /\b(cu[aá]nto\s+(cuesta|pago|pagar[ií]a|pagaria|saldr[ií]a|saldria)|cu[aá]nto\s+por\s+mes|cu[aá]nto\s+al\s+mes|precio|prima|mensual|cotizaci[oó]n|cotizar|cu[oó]nto\s+me\s+cuesta)\b/i;

/** Personal coverage premium / quote-tool only — not funeral costs, product lists, or agent topics. */
function isPersonalCoveragePricingQuestion(message) {
  const t = String(message || "");
  if (
    /\b(funeral|entierro|cremaci[oó]n|burial|ata[uú]d|urn|funeraria|cemetery|cementerio)\b/i.test(t)
  ) {
    return false;
  }
  if (
    /\b(commission|comisi[oó]n|drug list|lista de (medicamentos|drogas)|underwriting chart|producer|agent only)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  if (
    /\b(no (puedo|pude) pagar|miss(ed)?\s+(a\s+)?premium|forgot.*(premium|prima)|atras(o|ada).*prima|lapse|caducar)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  // "What is … 10-Pay / Living Promise / Accendo" is product education, not a price ask
  if (
    /\b(what is|what'?s|que es|qu[eé] es)\b/i.test(t) &&
    !/\b(how much|cu[aá]nto|price|precio|cost|cuesta|premium|prima|per month|mensual)\b/i.test(t)
  ) {
    return false;
  }
  if (
    /\b(productos?|planes?|opciones?|aseguradoras?|carriers?|accendo|aetna|transamerica|assurity|mutual|protection series|corebridge|amicable|10-pay|fe express|living promise|simplinow)\b/i.test(
      t,
    ) &&
    /\b(cotizar|quote)\b/i.test(t) &&
    !/\b(cu[aá]nto|how much|price|precio|cost|cuesta|prima|premium|mensual|per month)\b/i.test(t)
  ) {
    return false;
  }
  return PRICING_INTENT_EN.test(t) || PRICING_INTENT_ES.test(t);
}

function quoteToolAnswer(isSpanish) {
  return isSpanish
    ? `Para ver cuanto costaria tu cobertura, usa nuestra **herramienta de cotizacion gratuita** - solo toma un minuto.

👉 [Obtener mi cotizacion gratuita](https://www.mejorvidainsurance.com/quote.html)

Ingresa tu edad, genero y si usas tabaco, y recibiras un rango de precio estimado al instante. Tambien puedes usar el boton **"Cotizacion gratuita"** en la parte superior de esta pagina.

Julie revisara tu informacion y podra hacer seguimiento contigo personalmente.`
    : `To see what coverage would cost you, use our **free quote tool** - it only takes a minute.

👉 [Get my free quote](https://www.mejorvidainsurance.com/quote.html)

Enter your age, gender, and tobacco status and you'll get an estimated price range right away. You can also tap the **"Get a Free Quote"** button at the top of this page.

Julie will see your information and can follow up with you personally.`;
}

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
    return (
      "No tengo esa información en mi base de conocimiento pública. Puedo ayudarte con seguro de vida y gastos finales, o puedes escribir a " +
      "[Julie@mejorvidainsurance.com](mailto:Julie@mejorvidainsurance.com) / " +
      "[agendar una cita](https://meetings-na2.hubspot.com/julie-braunsroth)."
    );
  }
  return (
    "I don’t have that in my public knowledge base. I can help with life and final expense insurance, or you can email " +
    "[Julie@mejorvidainsurance.com](mailto:Julie@mejorvidainsurance.com) / " +
    "[schedule a call](https://meetings-na2.hubspot.com/julie-braunsroth/insurance-consultation-mejor-vida-insurance)."
  );
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
      body.language
        ? String(body.language).trim()
        : body.lang
          ? String(body.lang).trim()
          : localeToLanguage(body.locale),
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

    if (isPersonalCoveragePricingQuestion(question)) {
      const isSpanish =
        String(language || "").toLowerCase().startsWith("spanish") ||
        String(language || "").toLowerCase().startsWith("es") ||
        /[áéíóúüñ¿¡]/i.test(question);
      return json(res, 200, {
        status: "ok",
        answer: quoteToolAnswer(isSpanish),
        message_id: messageId,
      });
    }

    const limit = await checkWebsiteChatRateLimit(req, sessionId);
    if (!limit.allowed) {
      const retry = limit.retryAfterSeconds || 60;
      res.setHeader("Retry-After", String(retry));
      return json(res, 429, {
        status: "rate_limited",
        answer: rateLimitMessage(language, retry),
        message_id: messageId,
        retry_after_seconds: retry,
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
  language = normalizeAssistantLanguage(
    body.language ? String(body.language).trim() : localeToLanguage(body.locale),
  );
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

  const legacyLimit = await checkWebsiteChatRateLimit(req, String(phone || "").trim());
  if (!legacyLimit.allowed) {
    const retry = legacyLimit.retryAfterSeconds || 60;
    res.setHeader("Retry-After", String(retry));
    return json(res, 429, {
      reply: rateLimitMessage(language, retry),
      status: "rate_limited",
      error: "rate_limited",
      retry_after_seconds: retry,
    });
  }

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
