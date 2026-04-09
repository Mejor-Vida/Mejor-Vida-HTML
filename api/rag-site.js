/**
 * POST /api/rag-site
 * Website chatbot RAG — same pipeline as /api/rag-answer, Origin-guarded (no ManyChat secret).
 *
 * Body: { "message" | "question", "locale"?: "en"|"es", "contact"?: { phone } }
 * Response: { "reply": string, "status": "answered" | "no_answer" | "error" }
 */

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

  const question = String(body.question || body.message || "").trim();
  const language = body.language
    ? String(body.language).trim()
    : localeToLanguage(body.locale);
  const phone =
    body.phone ||
    (body.contact && body.contact.phone) ||
    "";
  const flowStage = body.flow_stage || "website_chat";

  const pipelineBody = {
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
