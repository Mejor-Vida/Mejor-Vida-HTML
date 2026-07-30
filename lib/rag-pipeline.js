/**
 * Shared RAG: embedding → match_knowledge_chunks → gpt-4o-mini, optional unanswered + HubSpot note.
 */

const {
  rpcMatchKnowledgeChunks,
  rpcMatchFaqs,
  insertUnansweredQuestion,
  insertFaq,
  incrementFaqUsage,
  findManychatLeadBySubscriberId,
} = require("./supabase");
const { getContactByManychatSubscriberId } = require("./contacts-db");
const { generateEmbedding, getRAGAnswer } = require("./openai");
const { hubspotSearchContact, hubspotAddNote } = require("./hubspot");
const {
  normalizeAssistantLanguage,
  healthEligibilityDeferralLine,
  shouldSkipFaqForHealthEligibilityQuestion,
  shouldSkipFaqCachingQuestion,
  isSpanishLanguageHint,
} = require("./assistant-language");

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
}

/** ManyChat sometimes sends unresolved custom fields as literal `{{field}}` — treat as missing. */
const UNRESOLVED_MANYCHAT_TEMPLATE = /^\{\{[\s\S]*\}\}$/;

function sanitizeManychatTemplateField(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s || UNRESOLVED_MANYCHAT_TEMPLATE.test(s)) return null;
  return s;
}

function extractManychatSubscriberId(body) {
  if (!body || typeof body !== "object") return null;
  const keys = [
    body.manychat_subscriber_id,
    body.manychatSubscriberId,
    body.whatsapp_id,
    body.whatsappId,
    body.subscriber_id,
    body.subscriberId,
    body.user_id,
    body.userId,
  ];
  for (const c of keys) {
    const v = sanitizeManychatTemplateField(c);
    if (v) return v;
  }
  return null;
}

/**
 * Resolve lead_id + phone from Supabase using ManyChat subscriber id (preferred over body.phone / custom fields).
 */
async function resolveLeadContextFromSubscriber(supabaseUrl, supabaseKey, subscriberId, bodyPhone) {
  let phone = bodyPhone;
  let leadId = null;
  if (!subscriberId) return { phone, leadId };

  let leadRow = null;
  let contactRow = null;
  try {
    leadRow = await findManychatLeadBySubscriberId(supabaseUrl, supabaseKey, subscriberId);
  } catch (e) {
    console.error("rag-pipeline findManychatLeadBySubscriberId", e.message);
  }
  try {
    contactRow = await getContactByManychatSubscriberId(supabaseUrl, supabaseKey, subscriberId);
  } catch (e) {
    console.error("rag-pipeline getContactByManychatSubscriberId", e.message);
  }

  if (leadRow) {
    leadId = leadRow.id;
    const fromLead = sanitizeManychatTemplateField(leadRow.phone);
    if (fromLead) phone = fromLead.slice(0, 40);
  }
  if (!phone && contactRow) {
    const fromContact = sanitizeManychatTemplateField(contactRow.phone);
    if (fromContact) phone = fromContact.slice(0, 40);
  }
  return { phone: phone || null, leadId };
}

/** Skip FAQ retrieval for intents where stale cache has caused persistent wrong answers. */
function shouldSkipFaqLookup(question) {
  return (
    shouldSkipFaqCachingQuestion(question) ||
    isWaitingPeriodQuestion(question) ||
    isLocationQuestion(question) ||
    isCarriersQuestion(question)
  );
}

function isApprovalTimelineQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    (t.includes("approv") && (t.includes("how long") || t.includes("same day") || t.includes("timeline"))) ||
    t.includes("mismo dia") ||
    t.includes("cuanto tarda") ||
    t.includes("aprobacion")
  );
}

function isContactPhoneQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  // "quien es Julie" is identity, not contact — exclude before contact keyword match
  if (isWhoIsJulieQuestion(question)) return false;
  return /\b(phone|contact|reach|whatsapp|telefono|numero|contacto|contactar|comunicar|llamar)\b/.test(t);
}

function isWhoIsJulieQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bjulie\b/.test(t)) return false;
  return (
    /\b(quien es|quien es la|who is|who'?s|tell me about|hablame de|cuentame de|sobre julie)\b/.test(t) ||
    /^(quien|who)\s+julie\b/.test(t)
  );
}

function whoIsJulieAnswer(isSpanish) {
  if (isSpanish) {
    return (
      "Julie Braunsroth es la fundadora de Mejor Vida Seguros y una agente de seguros licenciada en Nebraska, Kansas, Colorado y Nevada (NPN #21695431). " +
      "Nació en Bogotá, Colombia, y vive en Nebraska. Atiende a familias hispanas y de habla inglesa con asesoría clara, en español e inglés, y sin presión. " +
      "Puede conocer más de su historia aquí: https://www.mejorvidainsurance.com/about-julie.html\n\n" +
      "Si desea hablar con ella: llamada, texto o WhatsApp al 402-440-5438, o correo Julie@mejorvidainsurance.com."
    );
  }
  return (
    "Julie Braunsroth is the founder of Mejor Vida Insurance and a licensed insurance agent in Nebraska, Kansas, Colorado, and Nevada (NPN #21695431). " +
    "Born in Bogotá, Colombia, and based in Nebraska, she helps Hispanic and English-speaking families with clear, bilingual guidance and no pressure. " +
    "You can read more of her story here: https://www.mejorvidainsurance.com/en/about-julie.html\n\n" +
    "To reach her: call, text, or WhatsApp 402-440-5438, or email Julie@mejorvidainsurance.com."
  );
}

function isLicensedStatesQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (
    /\b(what states|which states|en que estados|estados (trabaja|atiende|cubre|licen)|where (do you|does julie|are you) (licensed|work|serve)|licensed states)\b/.test(
      t,
    ) ||
    (/\bestados?\b/.test(t) && /\b(julie|trabaja|atiende|licen|cubre|mejor vida)\b/.test(t))
  );
}

function licensedStatesAnswer(isSpanish) {
  return isSpanish
    ? "Julie atiende clientes de seguro de vida y gastos finales en Nebraska, Kansas, Colorado y Nevada. Si está en otro estado, puede pedirle orientación o una referencia."
    : "Julie serves life and final expense clients in Nebraska, Kansas, Colorado, and Nevada. If you are in another state, she can still offer guidance or a referral when appropriate.";
}

/** Public Assurity FE product question — avoid ADB-rider chunks winning retrieval. */
function isAssurityFinalExpenseQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bassurity\b/.test(t)) return false;
  if (/\b(living benefit|accelerated death|adb|rider|beneficio (en vida|acelerado)|comision|commission|drug)\b/.test(t)) {
    return false;
  }
  return (
    /\b(final expense|gastos finales|funeral|protect\+|perform\+|protect plus|perform plus)\b/.test(t) ||
    (/\b(whole life|vida entera|productos?|products?|seguro|que es|what is)\b/.test(t) &&
      /\b(offer|ofrece|tiene|have|use|usa|for|para|assurity)\b/.test(t)) ||
    /^(assurity)\b/.test(t)
  );
}

function assurityFinalExpenseAnswer(isSpanish) {
  return isSpanish
    ? "Assurity no comercializa un producto con la marca “gastos finales,” pero su vida entera Protect+ y Perform+ se usan con frecuencia para planificación de gastos finales. La cobertura suele comenzar en $10,000 con suscripción simplificada (muchas personas pueden calificar sin examen médico, según edad y preguntas de salud). Suele incluir beneficios en vida. Julie puede comparar Assurity Protect+/Perform+ con otras aseguradoras según su caso."
    : "Assurity does not brand a product as “final expense,” but Assurity whole life Protect+ and Perform+ are often used for final expense planning. Coverage typically starts at $10,000 with simplified underwriting (many applicants may qualify without a medical exam, depending on age and health questions). Living benefits riders are commonly included. Julie can compare Assurity Protect+/Perform+ with other carriers for your situation.";
}

/** Public Corebridge / AGL FE product question — avoid generic FE chunks naming Mutual of Omaha. */
function isCorebridgeFinalExpenseQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const mentionsCarrier =
    /\b(corebridge|american general|agl|simplinow|giwl)\b/.test(t) ||
    /\bsimpli\s*now\b/.test(t);
  if (!mentionsCarrier) return false;
  if (
    /\b(living benefit|accelerated death|adb|rider|beneficio (en vida|acelerado)|comision|commission|drug|iul|annuit|anualidad)\b/.test(
      t
    )
  ) {
    return false;
  }
  return (
    /\b(final expense|gastos finales|funeral|simplinow|giwl|whole life|vida entera|seguro|productos?|products?|que es|what is|offer|ofrece|tiene|explain|explica)\b/.test(
      t
    ) || /^(corebridge|american general|agl|simplinow|giwl)\b/.test(t)
  );
}

function corebridgeFinalExpenseAnswer(isSpanish) {
  return isSpanish
    ? "Corebridge Financial (pólizas de American General Life) ofrece vida entera para gastos finales: SimpliNow Legacy® Max (beneficio nivel desde el día 1 si califica), SimpliNow Legacy® escalonado (período de espera típico de 2 años para muerte natural) y GIWL de aceptación garantizada sin preguntas de salud. Edades típicas 50–80; sin examen médico en estas líneas. Montos desde cerca de $5,000. Julie puede comparar Corebridge con otras aseguradoras — 402-440-5438 o la cotización gratis."
    : "Corebridge Financial (policies issued by American General Life) offers final expense whole life: SimpliNow Legacy® Max (level benefit from day one if you qualify), SimpliNow Legacy® graded (typical 2-year wait for natural-cause death), and GIWL guaranteed acceptance with no health questions. Typical ages 50–80; no medical exam on these lines. Coverage often starts around $5,000. Julie can compare Corebridge with other carriers — 402-440-5438 or the free quote tool.";
}

function normalizeChatQuestion(question) {
  return String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isConsumerProductQuestion(t) {
  return (
    /\b(final expense|gastos finales|funeral|whole life|vida entera|term|termino|temporal|gul|seguro|productos?|products?|que es|what is|offer|ofrece|tiene|explain|explica|plan|planes|options?|opciones)\b/.test(
      t
    ) || t.split(" ").length <= 6
  );
}

function isMutualOfOmahaProductQuestion(question) {
  const t = normalizeChatQuestion(question);
  if (!/\b(mutual of omaha|mutual omaha|living promise|united of omaha)\b/.test(t)) return false;
  if (/\b(commission|drug|iul|producer)\b/.test(t)) return false;
  return isConsumerProductQuestion(t) || /\bliving promise\b/.test(t);
}

function mutualOfOmahaProductAnswer(isSpanish) {
  return isSpanish
    ? "Mutual of Omaha (United of Omaha) ofrece Living Promise®, vida entera para gastos finales sin examen médico para quien califica. Plan Nivelado: beneficio completo desde el día 1, edades típicas 45–85, montos aprox. $2,000–$50,000. Plan Escalonado: beneficio limitado los primeros 2 años por muerte natural, luego completo; edades típicas 45–80, hasta cerca de $20,000. Julie compara Living Promise con otras aseguradoras — 402-440-5438."
    : "Mutual of Omaha (United of Omaha) offers Living Promise® final expense whole life with no medical exam for applicants who qualify. Level plan: full benefit from day one, typical ages 45–85, about $2,000–$50,000. Graded plan: limited natural-cause benefit in years 1–2, then full; typical ages 45–80, up to about $20,000. Julie compares Living Promise with other carriers — 402-440-5438.";
}

function isAmericanAmicableProductQuestion(question) {
  const t = normalizeChatQuestion(question);
  if (!/\b(american amicable|amicable|golden solution|senior choice)\b/.test(t)) return false;
  if (/\b(commission|drug|producer)\b/.test(t)) return false;
  return isConsumerProductQuestion(t) || /\b(golden solution|senior choice)\b/.test(t);
}

function americanAmicableProductAnswer(isSpanish) {
  return isSpanish
    ? "American Amicable ofrece vida entera para gastos finales Golden Solution® y Senior Choice®, típicamente edades 50–85. Ambos pueden venir en diseño Inmediato (beneficio completo desde el día 1 si califica), Escalonado o Devolución de Prima (ROP). Sin examen médico para quien califica — preguntas de salud. Montos máximos dependen del plan y la edad (a menudo hasta $50,000 en Inmediato para edades más jóvenes). Julie compara estas opciones — 402-440-5438."
    : "American Amicable offers Golden Solution® and Senior Choice® final expense whole life, typically ages 50–85. Both can come as Immediate (full benefit from day one if you qualify), Graded, or Return of Premium (ROP). No medical exam for applicants who qualify — health questions only. Maximum face amounts depend on plan and age (often up to $50,000 on Immediate at younger ages). Julie compares these options — 402-440-5438.";
}

function isTransamericaProductQuestion(question) {
  const t = normalizeChatQuestion(question);
  if (!/\b(transamerica|fe express|express solution|10-pay|10 pay|easy solution|immediate solution)\b/.test(t)) {
    return false;
  }
  if (/\b(commission|drug|producer|trendsetter)\b/.test(t) && !/\b(final expense|gastos finales|fe express)\b/.test(t)) {
    /* allow Trendsetter only if we have a public answer — skip agent-depth for now unless FE */
  }
  if (/\b(commission|drug|producer)\b/.test(t)) return false;
  return isConsumerProductQuestion(t) || /\b(fe express|express solution)\b/.test(t);
}

function transamericaProductAnswer(isSpanish) {
  return isSpanish
    ? "Transamerica ofrece vida entera para gastos finales con suscripción simplificada: FE Express Solution℠ (beneficio completo desde el día 1 si califica; edades típicas 18–85; desde ~$5,000), Graded FE Express (edades típicas 18–80; beneficio limitado años 1–2), e Immediate, 10-Pay y Easy Solution en el portafolio. Sin examen médico para muchos que califican. Julie confirma qué plan aplica en su estado — 402-440-5438."
    : "Transamerica offers simplified-issue final expense whole life: FE Express Solution℠ (full benefit from day one if you qualify; typical ages 18–85; from about $5,000), Graded FE Express (typical ages 18–80; limited benefit years 1–2), plus Immediate, 10-Pay, and Easy Solution in the portfolio. No medical exam for many who qualify. Julie confirms which plan applies in your state — 402-440-5438.";
}

function isAetnaProductQuestion(question) {
  const t = normalizeChatQuestion(question);
  if (!/\b(aetna|accendo|protection series|continental life|cli)\b/.test(t)) return false;
  if (/\b(commission|drug|producer|medicare advantage|medigap)\b/.test(t)) return false;
  return isConsumerProductQuestion(t) || /\b(accendo|protection series)\b/.test(t);
}

function aetnaProductAnswer(isSpanish) {
  return isSpanish
    ? "A través de Aetna Senior Supplemental, Julie cotiza solo vida entera de gastos finales: Accendo Final Expense (Accendo Insurance Company) — Nivelado edades 40–89 o Modificado 40–75 — y Protection Series℠ Final Expense (Continental Life / CLI), Nivelado edades 45–89. Ambos suelen ser sin examen médico si califica; montos desde cerca de $2,000. En este portal Aetna no cotiza temporal, GUL ni IUL. Julie compara con otras aseguradoras — 402-440-5438."
    : "Through Aetna Senior Supplemental, Julie quotes final expense whole life only: Accendo Final Expense (Accendo Insurance Company) — Level ages 40–89 or Modified 40–75 — and Protection Series℠ Final Expense (Continental Life / CLI), Level ages 45–89. Both are typically no-exam if you qualify; face amounts from about $2,000. This Aetna appointment does not include term, GUL, or IUL. Julie compares with other carriers — 402-440-5438.";
}

function isCorebridgeTermOrGulQuestion(question) {
  const t = normalizeChatQuestion(question);
  if (!/\b(corebridge|american general|agl)\b/.test(t)) return false;
  if (/\b(iul|annuit|anualidad|commission|drug)\b/.test(t)) return false;
  return /\b(term|termino|temporal|select-?a-?term|ultra one|gul|guaranteed universal|secure lifetime|american elite)\b/.test(
    t
  );
}

function corebridgeTermOrGulAnswer(isSpanish) {
  return isSpanish
    ? "Además de gastos finales, Julie puede cotizar con Corebridge / American General vida a término (como Select-a-Term) y vida universal garantizada Secure Lifetime GUL 3 cuando encaje — no vende IUL ni anualidades de Corebridge como producto nuevo. La disponibilidad y montos mínimos varían; Julie confirma en una cotización personalizada — 402-440-5438."
    : "Besides final expense, Julie can quote Corebridge / American General term life (such as Select-a-Term) and Secure Lifetime GUL 3 guaranteed universal life when it fits — she does not sell Corebridge IUL or annuities as new retail products. Availability and minimums vary; Julie confirms in a personalized quote — 402-440-5438.";
}

function isAgentOnlyQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /\b(commission|comision|comisiones|overrides?|agent (rates?|portal|only)|producer (guide|only)|drug list|lista de (drogas|medicamentos)|what drugs|which drugs|drugs? (decline|disqualif|exclude)|medicamentos? (que )?(declinan|excluyen)|underwriting (chart|grid|manual)|milliman|intelliscript|quote\s*&\s*enroll)\b/.test(
    t,
  );
}

function agentOnlyPublicAnswer(isSpanish) {
  return isSpanish
    ? "Eso es información solo para agentes y no la comparto en el chat público. Puedo ayudarte con cómo funciona el seguro de vida o gastos finales para familias, o puedes escribir a Julie@mejorvidainsurance.com para una revisión personal."
    : "That’s agent-only information and I don’t share it in this public chat. I can help with how life or final expense insurance works for families, or you can email Julie@mejorvidainsurance.com for a personal review.";
}

function isPersonalPrivateJulieQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (/\b(direccion de casa|home address|where does julie live|julie'?s home|ssn|social security|fecha de nacimiento|birthday)\b/.test(t)) {
    return true;
  }
  return (
    /\bjulie\b/.test(t) &&
    /\b(esposo|husband|hijos|kids|children|familia personal|private life)\b/.test(t)
  );
}

function personalPrivateJulieAnswer(isSpanish) {
  return isSpanish
    ? "No comparto información personal privada. Para contacto de negocio: llamada, texto o WhatsApp al 402-440-5438, o Julie@mejorvidainsurance.com. Mejor Vida atiende Nebraska, Kansas, Colorado y Nevada."
    : "I don’t share private personal information. For business contact: call, text, or WhatsApp 402-440-5438, or Julie@mejorvidainsurance.com. Mejor Vida serves Nebraska, Kansas, Colorado, and Nevada.";
}

function isWaitingPeriodQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /\b(waiting period|how long.*wait|periodo de espera|cuanto tiempo hay que esperar|tiempo de espera)\b/.test(t);
}

function isLocationQuestion(question) {
  if (isPersonalPrivateJulieQuestion(question)) return false;
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /(where.*located|where are.*located|ubicad|direccion(?! de casa)|address(?! of julie'?s home)|oficina|\boffice\b|mailing address|direccion postal)/.test(
    t
  );
}

function isCarriersQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    /\b(carriers?|compan(?:y|ies)|aseguradoras?|companias?|insurance companies|what carriers|which carriers|con que compan)\b/.test(
      t
    ) && /\b(work|use|offer|tienen|trabajan|compar|quote|cotiz)\b/.test(t)
  );
}

function carriersAnswer(isSpanish) {
  return isSpanish
    ? "Julie compara opciones de Assurity, Mutual of Omaha, American Amicable, Corebridge y Transamerica. También puede cotizar vida entera de gastos finales de Aetna cuando encaje. Llama o escribe al 402-440-5438 para una comparación gratuita."
    : "Julie compares options from Assurity, Mutual of Omaha, American Amicable, Corebridge, and Transamerica. She can also quote Aetna final expense whole life when it fits. Call or text 402-440-5438 for a free comparison.";
}

function stripQaLabels(text) {
  let out = String(text || "").trim();
  if (!out) return "";
  const answerFirst = out.match(
    /(?:^|\n)\s*(?:a|answer|respuesta)\s*:\s*([\s\S]*?)(?:\n\s*(?:q|question|pregunta)\s*:|$)/i
  );
  if (answerFirst && answerFirst[1]) return String(answerFirst[1]).trim();
  const qThenA = out.match(/(?:^|\n)\s*(?:q|question|pregunta)\s*:[\s\S]*?(?:\n)\s*(?:a|answer|respuesta)\s*:\s*([\s\S]*)/i);
  if (qThenA && qThenA[1]) return String(qThenA[1]).trim();
  out = out
    .replace(/^\s*(?:q|question|pregunta)\s*:\s*/i, "")
    .replace(/^\s*(?:a|answer|respuesta)\s*:\s*/i, "")
    .trim();
  return out;
}

/** Shared post-process after LLM or Spanish direct chunk return. */
function applyKnowledgeAnswerPostProcess(question, answerText, isSpanishQuery, skipFaqHealth) {
  let out = stripQaLabels(answerText);
  // Knowledge chunks sometimes store literal "\n" instead of real newlines
  out = out.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
  if (isWhoIsJulieQuestion(question)) {
    return whoIsJulieAnswer(isSpanishQuery);
  }
  if (skipFaqHealth && out) {
    const t = out.trim();
    const looksLikeEligibilityPromise =
      /\b(yes|sí)\b.*\b(can|could|will|likely|probably|puedes|podrías|obtener|get|coverage|cobertura|qualif|calif)/i.test(
        t,
      ) ||
      /\b(likely|probably|probablemente)\b.*\b(coverage|cobertura|qualif|calif|get|obtener)/i.test(t) ||
      /\b(you can|one can|people can|applicants can|puedes obtener|puedes calificar)\b.*\b(coverage|cobertura)/i.test(
        t,
      );
    if (looksLikeEligibilityPromise) {
      out = healthEligibilityDeferralLine(isSpanishQuery ? "es" : "en");
    }
  }
  if (isApprovalTimelineQuestion(question) && out) {
    const t = out.toLowerCase();
    if (t.includes("few days to a week") || t.includes("pocos dias")) {
      out = isSpanishQuery
        ? "Sí, algunas aseguradoras ofrecen decisiones instantáneas o el mismo día para pólizas de emisión simplificada cuando aplicas por vía electrónica, sin examen médico. Julie te orienta sobre las opciones más rápidas para tu caso."
        : "Some carriers offer instant or same-day decisions for simplified issue final expense policies when you apply electronically, with no medical exam. Julie can guide you to the fastest options for your situation.";
    }
  }
  if (isWaitingPeriodQuestion(question) && out) {
    const t = out.toLowerCase();
    const missingDetail =
      !(
        t.includes("graded") ||
        t.includes("modified") ||
        t.includes("graduado") ||
        t.includes("modificado")
      ) || !(t.includes("no waiting") || t.includes("sin período de espera") || t.includes("sin periodo de espera"));
    if (missingDetail) {
      out = isSpanishQuery
        ? "Muchas pólizas de gastos finales — en especial los planes de beneficio graduado o modificado — incluyen un período de espera de 2 años para la muerte por causas naturales. Durante ese período, los beneficiarios suelen recibir primas pagadas más intereses en lugar del beneficio completo. Los planes de beneficio inmediato (nivel) pueden ofrecer cobertura sin período de espera para solicitantes que califican en buen estado de salud."
        : "Many final expense policies — especially graded or modified benefit plans — include a 2-year waiting period for death from natural causes. During that period, beneficiaries typically receive premiums paid plus interest instead of the full face amount. Immediate-benefit (level) plans can offer no waiting period for applicants who qualify in good health.";
    }
  }
  if (isLocationQuestion(question) && out) {
    const t = out.toLowerCase();
    const hasBadWalkIn = t.includes("16820 frances") || (t.includes("omaha") && t.includes("suite 208"));
    const hasGoodMailing =
      (t.includes("1201") && t.includes("lincoln")) ||
      (t.includes("no walk") || t.includes("sin atención al público") || t.includes("phone and online") || t.includes("teléfono y en línea"));
    if (hasBadWalkIn || !hasGoodMailing) {
      out = isSpanishQuery
        ? "Mejor Vida Seguros es una agencia 100% por teléfono y en línea — no hay oficina de atención al público. La dirección postal (solo correspondencia) es 1201 O St Ste 309 Unit #597, Lincoln, NE 68508. Contacta a Julie por llamada, texto o WhatsApp al 402-440-5438. Atendemos Nebraska, Kansas, Colorado y Nevada."
        : "Mejor Vida Insurance is a 100% phone and online agency — no public walk-in office. Our mailing address (correspondence only) is 1201 O St Ste 309 Unit #597, Lincoln, NE 68508. Contact Julie by call, text, or WhatsApp at 402-440-5438. We serve Nebraska, Kansas, Colorado, and Nevada.";
    }
  }
  if (isContactPhoneQuestion(question) && out) {
    if (!out.includes("402-440-5438")) {
      out +=
        isSpanishQuery
          ? " El número principal de Julie para llamada, texto y WhatsApp es 402-440-5438."
          : " Julie’s primary number for calls, text, and WhatsApp is 402-440-5438.";
    }
  }
  return out;
}

async function hubspotOptionalNote(token, phone, body) {
  if (!token || !phone) return;
  try {
    const cid = await hubspotSearchContact(token, "phone", phone);
    if (cid) await hubspotAddNote(token, cid, body);
  } catch (e) {
    /* optional */
  }
}

/** One JSON line per RAG request — filter Vercel logs on `rag_request_usage`. */
function logRagUsage(summary) {
  console.log(
    JSON.stringify({
      event: "rag_request_usage",
      ts: new Date().toISOString(),
      ...summary,
    }),
  );
}

/**
 * @param {object} body - question, language, phone, flow_stage
 * @param {{ hubspotNotePrefix?: string }} opts
 */
async function runRagPipeline(body, opts) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = serviceKey();
  const openaiKey = process.env.OPENAI_API_KEY;
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
  const notePrefix = (opts && opts.hubspotNotePrefix) || "RAG";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase config");
  }
  if (!openaiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const question = String(body.question || "").trim();
  // Accept `lang` (e.g. website-chat QA / clients) or `language` (ManyChat, forms).
  const language = normalizeAssistantLanguage(String(body.lang || body.language || "English"));
  let phone = sanitizeManychatTemplateField(body.phone);
  if (phone) phone = phone.slice(0, 40);
  const flowStageRaw = sanitizeManychatTemplateField(body.flow_stage || body.flowStage);
  const flowStage = flowStageRaw ? flowStageRaw.slice(0, 100) : null;
  const conversationContext = String(body.conversationContext || "").trim().slice(0, 8000) || null;

  if (!question) {
    return { error: "question required", statusCode: 400 };
  }

  const subscriberId = extractManychatSubscriberId(body);
  let leadId = null;
  if (subscriberId) {
    const resolved = await resolveLeadContextFromSubscriber(supabaseUrl, supabaseKey, subscriberId, phone);
    phone = resolved.phone;
    leadId = resolved.leadId;
  }

  const usageBase = {
    flow_stage: flowStage,
    question_len: question.length,
    openai_embed_prompt_tokens: 0,
    openai_embed_total_tokens: 0,
    openai_chat_prompt_tokens: null,
    openai_chat_completion_tokens: null,
    openai_chat_total_tokens: null,
    openai_calls: 0,
    supabase_match_rpc_calls: 0,
    knowledge_chunks_returned: 0,
    outcome: null,
  };

  const isSpanishLangEarly =
    isSpanishLanguageHint(String(body.language || "").trim()) ||
    isSpanishLanguageHint(language) ||
    ["es", "spanish", "Spanish", "ES"].includes(String(language || "").trim()) ||
    String(language || "").toLowerCase().startsWith("es");
  const questionLooksSpanishEarly =
    /[áéíóúüñ¿¡]/i.test(question) ||
    /\b(para |una |del |también|tengo |puedo |cuál |cómo |dónde |qué |quien )\b/i.test(question);
  if (isWhoIsJulieQuestion(question)) {
    const answer = whoIsJulieAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "who_is_julie";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isPersonalPrivateJulieQuestion(question)) {
    const answer = personalPrivateJulieAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "privacy_refusal";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isAgentOnlyQuestion(question)) {
    const answer = agentOnlyPublicAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "agent_only_refusal";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isLicensedStatesQuestion(question)) {
    const answer = licensedStatesAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "licensed_states";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isAssurityFinalExpenseQuestion(question)) {
    const answer = assurityFinalExpenseAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "assurity_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isCorebridgeTermOrGulQuestion(question)) {
    const answer = corebridgeTermOrGulAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "corebridge_term_gul";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isCorebridgeFinalExpenseQuestion(question)) {
    const answer = corebridgeFinalExpenseAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "corebridge_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isMutualOfOmahaProductQuestion(question)) {
    const answer = mutualOfOmahaProductAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "moo_living_promise";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isAmericanAmicableProductQuestion(question)) {
    const answer = americanAmicableProductAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "amam_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isTransamericaProductQuestion(question)) {
    const answer = transamericaProductAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "transamerica_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isAetnaProductQuestion(question)) {
    const answer = aetnaProductAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "aetna_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (isCarriersQuestion(question)) {
    const answer = carriersAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "carriers_list";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }

  let embedding;
  try {
    const embOut = await generateEmbedding(openaiKey, question);
    embedding = embOut.embedding;
    usageBase.openai_embed_prompt_tokens = embOut.usage.prompt_tokens;
    usageBase.openai_embed_total_tokens = embOut.usage.total_tokens;
    usageBase.openai_calls += 1;
  } catch (e) {
    console.error("rag-pipeline embedding", e.message);
    usageBase.outcome = "error_embedding";
    logRagUsage(usageBase);
    return { error: "Embedding failed", statusCode: 500, usage: usageBase };
  }

  const skipFaqHealth = shouldSkipFaqForHealthEligibilityQuestion(question);
  const isSpanishLang =
    isSpanishLanguageHint(String(body.language || "").trim()) ||
    isSpanishLanguageHint(language) ||
    ["es", "spanish", "Spanish", "ES"].includes(String(language || "").trim()) ||
    String(language || "").toLowerCase().startsWith("es");
  const questionLooksSpanish =
    /[áéíóúüñ¿¡]/i.test(question) ||
    /\b(para |una |del |también|tengo |puedo |cuál |cómo |dónde |qué )\b/i.test(question);
  const isSpanishQuery = isSpanishLang || questionLooksSpanish;
  const skipFaqForSpanish = isSpanishQuery;

  // TIER 1: Check FAQ cache first (fast, no LLM), except health-eligibility questions
  let faqMatch;
  if (!skipFaqHealth && !skipFaqForSpanish && !shouldSkipFaqLookup(question)) {
    try {
      const faqResults = await rpcMatchFaqs(supabaseUrl, supabaseKey, embedding, language, 1, 0.75);
      faqMatch = faqResults && faqResults.length > 0 ? faqResults[0] : null;
    } catch (e) {
      console.error("rag-pipeline faq search", e.message);
      // Don't fail; just skip FAQ tier and go to knowledge chunks
    }
  }

  if (faqMatch && faqMatch.answer) {
    // FAQ hit! Return instantly + increment usage
    try {
      await incrementFaqUsage(supabaseUrl, supabaseKey, faqMatch.id);
    } catch (e) {
      console.error("rag-pipeline increment faq usage", e.message);
    }
    usageBase.outcome = "faq_hit";
    logRagUsage(usageBase);
    return { answer: faqMatch.answer, status: "answered", usage: usageBase };
  }

  const matchCount = isSpanishQuery ? 30 : 8;

  let chunks;
  try {
    chunks = await rpcMatchKnowledgeChunks(supabaseUrl, supabaseKey, embedding, matchCount, 0.35);
    // Post-filter: for Spanish questions, prefer chunks with Spanish content.
    if (isSpanishQuery && chunks && chunks.length > 0) {
      const isSpanishChunk = (c) => {
        const text = String(c.content || c.text || c.answer || c.question || c.chunk || c.body || "").toLowerCase();
        return (
          /[áéíóúüñ¿¡]/.test(text) ||
          /\b(para |una |del |también|aseguradora|póliza|gastos|familia|días|cobertura|seguro |número|llamada|teléfono|guardar|contactar|espera|período|correo|electrónico|llama|comunícate|contáctala|compañías|cotización|atendemos|nuestro|puedes|puede |está |están )\b/.test(
            text,
          )
        );
      };
      const spanishChunks = chunks.filter(isSpanishChunk);
      // Strong match: return Spanish chunk text directly so the model cannot "helpfully" translate to English.
      if (
        !skipFaqHealth &&
        spanishChunks.length > 0 &&
        (Number(spanishChunks[0].similarity) || 0) > 0.5
      ) {
        const topChunk = spanishChunks[0];
        let directAnswer = String(topChunk.content || topChunk.answer || "").trim();
        const answerMatch = directAnswer.match(/(?:answer|respuesta):\s*([\s\S]+)/i);
        if (answerMatch) directAnswer = answerMatch[1].trim();
        if (directAnswer && !/^NO_ANSWER$/i.test(directAnswer)) {
          usageBase.supabase_match_rpc_calls = 1;
          usageBase.knowledge_chunks_returned = spanishChunks.length;
          let answerText = applyKnowledgeAnswerPostProcess(question, directAnswer, isSpanishQuery, skipFaqHealth);
          usageBase.outcome = "answered";
          logRagUsage(usageBase);
          return { answer: answerText, status: "answered", usage: usageBase };
        }
      }
      if (spanishChunks.length >= 1) {
        chunks = spanishChunks;
      }
    }
    usageBase.supabase_match_rpc_calls = 1;
    usageBase.knowledge_chunks_returned = chunks && chunks.length ? chunks.length : 0;
  } catch (e) {
    console.error("rag-pipeline rpc", e.message);
    usageBase.outcome = "error_knowledge_rpc";
    logRagUsage(usageBase);
    return { error: "Knowledge search failed", statusCode: 500, usage: usageBase };
  }

  const row = {
    lead_id: leadId,
    phone: phone || null,
    question,
    language,
    flow_stage: flowStage,
    resolved: false,
  };

  if (!chunks || !chunks.length) {
    if (skipFaqHealth) {
      usageBase.outcome = "health_deferral_no_chunks";
      logRagUsage(usageBase);
      return { answer: healthEligibilityDeferralLine(isSpanishQuery ? "es" : "en"), status: "answered", usage: usageBase };
    }
    try {
      await insertUnansweredQuestion(supabaseUrl, supabaseKey, row);
    } catch (e) {
      console.error("rag-pipeline save unanswered", e.message);
    }
    await hubspotOptionalNote(
      hubspotToken,
      phone,
      `${notePrefix} — no grounded answer.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
    );
    usageBase.outcome = "no_answer_no_chunks";
    logRagUsage(usageBase);
    return { answer: null, status: "no_answer", usage: usageBase };
  }

  let answerText;
  try {
    const llmQuestion = isSpanishQuery
      ? `[IMPORTANT: Respond ENTIRELY in Spanish. Do not use English.]\n\n${question}`
      : question;
    const chatOut = await getRAGAnswer(openaiKey, llmQuestion, chunks, language, {
      conversationContext,
    });
    answerText = chatOut.text;
    usageBase.openai_chat_prompt_tokens = chatOut.usage.prompt_tokens;
    usageBase.openai_chat_completion_tokens = chatOut.usage.completion_tokens;
    usageBase.openai_chat_total_tokens = chatOut.usage.total_tokens;
    usageBase.openai_calls += 1;
  } catch (e) {
    console.error("rag-pipeline chat", e.message);
    usageBase.outcome = "error_chat";
    logRagUsage(usageBase);
    return { error: "Answer generation failed", statusCode: 500, usage: usageBase };
  }

  answerText = applyKnowledgeAnswerPostProcess(question, answerText, isSpanishQuery, skipFaqHealth);

  if (!answerText || /^NO_ANSWER$/i.test(answerText.trim())) {
    if (skipFaqHealth) {
      usageBase.outcome = "health_deferral_no_answer";
      logRagUsage(usageBase);
      return { answer: healthEligibilityDeferralLine(isSpanishQuery ? "es" : "en"), status: "answered", usage: usageBase };
    }
    try {
      await insertUnansweredQuestion(supabaseUrl, supabaseKey, row);
    } catch (e) {
      console.error("rag-pipeline save unanswered", e.message);
    }
    await hubspotOptionalNote(
      hubspotToken,
      phone,
      `${notePrefix} — NO_ANSWER.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
    );
    usageBase.outcome = "no_answer_model";
    logRagUsage(usageBase);
    return { answer: null, status: "no_answer", usage: usageBase };
  }

  // Successfully answered: cache as FAQ for future use (async, don't block response)
  if (!skipFaqHealth && !skipFaqForSpanish && !shouldSkipFaqCachingQuestion(question)) {
    try {
      await insertFaq(supabaseUrl, supabaseKey, question, answerText, language, embedding);
    } catch (e) {
      console.error("rag-pipeline cache faq", e.message);
      // Non-blocking; FAQ caching failure doesn't affect the response
    }
  }

  usageBase.outcome = "answered";
  logRagUsage(usageBase);
  return { answer: answerText, status: "answered", usage: usageBase };
}

module.exports = { runRagPipeline, sanitizeManychatTemplateField };
