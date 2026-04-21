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

/** Mandated deferral when the user asks about personal coverage for a named health issue. */
function healthEligibilityDeferralLine(language) {
  const l = normalizeAssistantLanguage(language);
  if (l === "Spanish") {
    return "La elegibilidad por salud depende de tu situación y de la aseguradora. No puedo confirmar cobertura para condiciones específicas — puedes comunicarte con Julie por llamada, texto o WhatsApp al 402-440-5438, o por correo a Julie@mejorvidainsurance.com.";
  }
  return "Health eligibility depends on your specific situation and the carrier. I'm not able to confirm coverage for specific conditions — you can reach Julie by call, text, or WhatsApp at 402-440-5438, or by email at Julie@mejorvidainsurance.com.";
}

/**
 * Skip FAQ tier so cached eligibility answers cannot short-circuit RAG health guardrails.
 */
function shouldSkipFaqForHealthEligibilityQuestion(text) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  const q = raw.toLowerCase();
  const combined = `${raw}\n${q}`;
  return (
    /diabetes/i.test(combined) ||
    /\bcancer\b/i.test(q) ||
    /c[aá]ncer/i.test(combined) ||
    /heart attack/i.test(q) ||
    /blood pressure|presi[oó]n arterial|presi[oó]n\b/i.test(combined) ||
    /\bcopd\b/i.test(q) ||
    /\bhiv\b/i.test(q) ||
    /alzheimer/i.test(q) ||
    /\boxygen\b/i.test(q) ||
    /nursing home|asilo|residencia/i.test(combined) ||
    /\bdialysis\b/i.test(combined) ||
    /infarto|ataque al coraz[oó]n|ataque card[ií]aco/i.test(combined) ||
    /\bepoc\b/i.test(combined) ||
    /\binsulina\b/i.test(combined) ||
    /hogar de ancianos|casa de reposo|casa de ancianos/i.test(combined) ||
    /\bmedication\b|\bi take\b|medicamento|medicamentos/i.test(combined) ||
    /tengo diabetes/i.test(q) ||
    /tengo c[aá]ncer/i.test(q)
  );
}

module.exports = {
  normalizeAssistantLanguage,
  healthEligibilityDeferralLine,
  shouldSkipFaqForHealthEligibilityQuestion,
};
