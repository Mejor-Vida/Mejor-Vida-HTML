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

module.exports = { normalizeAssistantLanguage };
