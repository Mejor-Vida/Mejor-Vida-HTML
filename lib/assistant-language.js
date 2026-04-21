/**
 * Normalize UI / request language to "English" | "Spanish" for RAG and assistant copy.
 */

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

/**
 * If the user typed in Spanish but the UI language is still English, bias RAG + fallbacks to Spanish.
 */
function inferAssistantLanguageFromQuestion(question, declaredRaw) {
  const declared = normalizeAssistantLanguage(declaredRaw);
  if (declared === "Spanish") return "Spanish";

  const q = String(question || "").trim();
  if (!q) return declared;

  if (/¿/.test(q) || /¡/.test(q)) return "Spanish";

  const lower = q.toLowerCase();
  const spanishCue =
    /\b(impuestos|beneficiario|beneficiarios|fallecimiento|seguro de vida|mi familia|su familia|tiene que pagar|está sujeto|están sujetos|recibe el dinero|cobra el seguro)\b/i.test(
      q,
    ) || /\b(qué|cómo|cuándo|dónde|cuánto|por qué)\b/i.test(lower);

  if (spanishCue) return "Spanish";

  if (/[áéíóúñü]/i.test(q) && q.length >= 12) return "Spanish";

  return declared;
}

function noAnswerFallbackLine(language) {
  const l = normalizeAssistantLanguage(language);
  if (l === "Spanish") {
    return "Aún no tengo esa información. Puedes intentar reformular tu pregunta o contactarnos para ayuda.";
  }
  return "I don't have that information yet. Julie will get back to you soon.";
}

module.exports = {
  normalizeAssistantLanguage,
  inferAssistantLanguageFromQuestion,
  noAnswerFallbackLine,
};
