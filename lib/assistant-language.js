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

/** Mandated deferral when the user asks about personal coverage for a named health issue (RAG + empty-chunk short-circuit). */
function healthEligibilityDeferralLine(language) {
  const l = normalizeAssistantLanguage(language);
  if (l === "Spanish") {
    return "La elegibilidad por salud depende de tu situación y de la aseguradora. No puedo confirmar cobertura para condiciones específicas — comunícate directamente con Julie al 402-588-1125 o escribe a Julie@mejorvidainsurance.com para una revisión personalizada.";
  }
  return "Health eligibility depends on your specific situation and the carrier. I'm not able to confirm coverage for specific conditions — please speak with Julie directly at 402-588-1125 or Julie@mejorvidainsurance.com for a personalized review.";
}

/**
 * Skip FAQ tier so cached "yes you can get coverage" rows cannot short-circuit RAG + system health rules.
 */
function shouldSkipFaqForHealthEligibilityQuestion(text) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  const q = raw.toLowerCase();
  const combined = `${raw}\n${q}`;
  return (
    /diabetes/i.test(combined) ||
    /\bdialysis\b/i.test(combined) ||
    /\bcancer\b/i.test(q) ||
    /cáncer/i.test(raw) ||
    /heart attack/i.test(q) ||
    /infarto|ataque al coraz[oó]n|ataque card[ií]aco/i.test(combined) ||
    /blood pressure|presi[oó]n arterial|presi[oó]n\b/i.test(combined) ||
    /\bcopd\b/i.test(q) ||
    /\bepoc\b/i.test(combined) ||
    /\bhiv\b/i.test(q) ||
    /alzheimer/i.test(q) ||
    /\boxygen\b/i.test(q) ||
    /nursing home|asilo|residencia|hogar de ancianos|casa de reposo|casa de ancianos/i.test(combined) ||
    /\bmedication\b|\bmedications\b|medicamento|medicamentos|\binsulina\b/i.test(combined) ||
    /\bi take\b/i.test(q) ||
    /tengo diabetes/i.test(q) ||
    /tengo c[aá]ncer/i.test(q)
  );
}

module.exports = {
  normalizeAssistantLanguage,
  inferAssistantLanguageFromQuestion,
  noAnswerFallbackLine,
  healthEligibilityDeferralLine,
  shouldSkipFaqForHealthEligibilityQuestion,
};
