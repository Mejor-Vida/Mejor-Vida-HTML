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
const { generateEmbedding, getRAGAnswer, getClarifyingFallback, classifyClientIntent, staticClarifyingFallback } = require("./openai");
const { wrapResendEmailHtml, signatureBlockEN, LOGO_EN } = require("./resend-email-template");
const { hubspotSearchContact, hubspotAddNote } = require("./hubspot");
const {
  normalizeAssistantLanguage,
  healthEligibilityDeferralLine,
  publicHealthEligibilityDeferralLine,
  shouldSkipFaqForHealthEligibilityQuestion,
  shouldSkipFaqCachingQuestion,
  isSpanishLanguageHint,
} = require("./assistant-language");
const { isFuneralCostQuestion, answerFuneralCostQuestion } = require("./funeral-gpl-chat");

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
    isCarriersQuestion(question) ||
    isFuneralCostQuestion(question)
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
      "Julie Braunsroth es la fundadora de Mejor Vida Seguros y una agente de seguros licenciada (NPN #21695431). " +
      "Nació en Bogotá, Colombia, y vive en Nebraska. Atiende a familias hispanas y de habla inglesa con asesoría clara, en español e inglés, y sin presión. " +
      "Puede conocer más de su historia aquí: https://www.mejorvidainsurance.com/about-julie.html\n\n" +
      "Si desea hablar con ella: llamada, texto o WhatsApp al 402-440-5438, o correo Julie@mejorvidainsurance.com."
    );
  }
  return (
    "Julie Braunsroth is the founder of Mejor Vida Insurance and a licensed insurance agent (NPN #21695431). " +
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
    (/\bestados?\b/.test(t) &&
      /\b(julie|trabaja|atiende|licen|cubre|mejor vida)\b/.test(t) &&
      !/\b(compan|carrier|aseguradora)\b/.test(t))
  );
}

function licensedStatesAnswer(isSpanish) {
  return isSpanish
    ? "Mejor Vida Seguros atiende clientes de seguro de vida y gastos finales donde está licenciada. Los estados actuales están en la página de licencias. Si está en otro estado, puede pedir orientación o una referencia."
    : "Mejor Vida Insurance serves life and final expense clients where licensed. Current states are on the licenses page. If you are in another state, we can still offer guidance or a referral when appropriate.";
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
    ? "Buena pregunta sobre Assurity. No venden un producto con la marca “gastos finales,” pero su vida entera Protect+ y Perform+ se usan mucho para planificar el funeral. Muchas personas pueden calificar sin examen médico, según edad y salud, y hay beneficios en vida. Julie confirma el monto. ¿Quieres que te explique la diferencia entre Protect+ y Perform+, o prefieres que Julie lo compare contigo al 402-440-5438?"
    : "Great question about Assurity. They don’t brand a product as “final expense,” but their Protect+ and Perform+ whole life policies are often used for funeral planning. Many people may qualify without a medical exam, depending on age and health, and the policies include living benefits. Julie confirms the coverage amount. Want me to explain Protect+ vs Perform+, or would you rather have Julie compare options with you at 402-440-5438?";
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
    ? "Claro — Corebridge (pólizas de American General Life) tiene vida entera para gastos finales: SimpliNow Legacy® Max (beneficio nivel desde el día 1 si califica), SimpliNow escalonado (espera típica de ~2 años por muerte natural) y GIWL de aceptación garantizada sin preguntas de salud. Edades típicas 50–80, sin examen médico en estas líneas, Julie confirma el monto. ¿Te interesa más el plan nivel, el escalonado o el de aceptación garantizada? Julie también te orienta al 402-440-5438."
    : "Absolutely — Corebridge (policies issued by American General Life) has final expense whole life: SimpliNow Legacy® Max (level benefit from day one if you qualify), graded SimpliNow (typical ~2-year wait for natural-cause death), and GIWL guaranteed acceptance with no health questions. Typical ages 50–80, no medical exam on these lines. Julie confirms the coverage amount. Curious more about level, graded, or guaranteed acceptance? Julie can walk you through it at 402-440-5438.";
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
  const t = normalizeChatQuestion(question)
    .replace(/\bmutal\b/g, "mutual")
    .replace(/\bmutial\b/g, "mutual")
    .replace(/\bomha\b/g, "omaha");
  if (!/\b(mutual of omaha|mutual omaha|living promise|united of omaha)\b/.test(t)) return false;
  if (/\b(commission|drug|iul|producer)\b/.test(t)) return false;
  return isConsumerProductQuestion(t) || /\bliving promise\b/.test(t);
}

function mutualOfOmahaProductAnswer(isSpanish) {
  return isSpanish
    ? "Living Promise® de Mutual of Omaha (United of Omaha) es su vida entera para gastos finales — sin examen médico para quien califica. El plan Nivelado paga el beneficio completo desde el día 1 (edades típicas 45–85, aprox. $2,000–$50,000). El Escalonado limita el beneficio por muerte natural los primeros 2 años (edades típicas 45–80, hasta ~$20,000). ¿Quieres que te explique nivelado vs escalonado, o te ayudo a ver si encaja con tu edad? Julie también compara opciones al 402-440-5438."
    : "Mutual of Omaha’s Living Promise® (United of Omaha) is their final expense whole life — no medical exam for applicants who qualify. The Level plan pays the full benefit from day one (typical ages 45–85, about $2,000–$50,000). Graded limits the natural-cause benefit in years 1–2 (typical ages 45–80, up to about $20,000). Want me to unpack level vs graded, or check how that fits your age? Julie can also compare options at 402-440-5438.";
}

function isAmericanAmicableProductQuestion(question) {
  const t = normalizeChatQuestion(question);
  if (!/\b(american amicable|amicable|golden solution|senior choice)\b/.test(t)) return false;
  if (/\b(commission|drug|producer)\b/.test(t)) return false;
  return isConsumerProductQuestion(t) || /\b(golden solution|senior choice)\b/.test(t);
}

function americanAmicableProductAnswer(isSpanish) {
  return isSpanish
    ? "Con gusto. American Amicable tiene Golden Solution® y Senior Choice® para gastos finales (edades típicas 50–85). Pueden venir Inmediato (beneficio completo desde el día 1 si califica), Escalonado o Devolución de Prima. Sin examen médico para quien califica — solo preguntas de salud. ¿Te interesa más el diseño inmediato o el escalonado? Julie te orienta al 402-440-5438."
    : "Happy to help. American Amicable offers Golden Solution® and Senior Choice® for final expense (typical ages 50–85). They can come as Immediate (full benefit from day one if you qualify), Graded, or Return of Premium. No medical exam for applicants who qualify — health questions only. More curious about immediate vs graded? Julie can guide you at 402-440-5438.";
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
    ? "Sí — Transamerica tiene gastos finales de emisión simplificada: FE Express Solution℠ (beneficio completo desde el día 1 si califica; edades típicas 18–85; desde ~$5,000), Graded FE Express, e Immediate, 10-Pay y Easy Solution. Sin examen médico para muchos que califican. ¿Quieres que te cuente qué es el 10-Pay, o FE Express en general? Julie confirma qué aplica en tu estado al 402-440-5438."
    : "Yes — Transamerica has simplified-issue final expense: FE Express Solution℠ (full benefit from day one if you qualify; typical ages 18–85; Julie confirms the coverage amount), Graded FE Express, plus Immediate, 10-Pay, and Easy Solution. No medical exam for many who qualify. Want me to explain 10-Pay, or FE Express overall? Julie can confirm what applies in your state at 402-440-5438.";
}

function isAetnaProductQuestion(question) {
  const t = normalizeChatQuestion(question);
  if (!/\b(aetna|accendo|protection series|continental life|cli)\b/.test(t)) return false;
  if (/\b(commission|drug|producer|medicare advantage|medigap)\b/.test(t)) return false;
  return (
    isConsumerProductQuestion(t) ||
    /\b(accendo|protection series)\b/.test(t) ||
    /\b(requirement|requisito|eligib|califica|qualify|difference|diferencia|vs|versus)\b/.test(t)
  );
}

function aetnaAccendoVsProtectionAnswer(isSpanish) {
  return isSpanish
    ? "Buena pregunta — son las dos opciones de gastos finales que Julie cotiza con Aetna Senior Supplemental. Accendo (Accendo Insurance Company) tiene Nivelado (~40–89) y Modificado (~40–75). Protection Series℠ (Continental Life / CLI) es solo Nivelado (~45–89). En Accendo Nivelado, a los 76–89 el máximo típico ronda $25,000; Protection Series suele ir de ~$2,000 a $50,000 según edad. Ambos suelen ser sin examen médico si califica. ¿Quieres que profundice en Accendo para tu edad, o en Protection Series? Julie también te compara al 402-440-5438."
    : "Good question — those are the two final expense options Julie quotes through Aetna Senior Supplemental. Accendo (Accendo Insurance Company) has Level (about 40–89) and Modified (about 40–75). Protection Series℠ (Continental Life / CLI) is Level-only (about 45–89). On Accendo Level, ages 76–89 typically max around $25,000; Protection Series usually runs about $2,000–$50,000 by age. Both are typically no-exam if you qualify. Want me to dig into Accendo for your age, or Protection Series? Julie can also compare with you at 402-440-5438.";
}

function aetnaAccendoRequirementsAnswer(isSpanish) {
  return isSpanish
    ? "Claro — te resumo Accendo Final Expense de forma sencilla. Edades: Nivelado ~40–89 o Modificado ~40–75. Cobertura desde ~$2,000; en Nivelado el máximo baja con la edad (por ejemplo ~$25,000 entre 76–89). Suele ser sin examen médico si califica: preguntas de salud y revisión de bases de datos (no es garantía de aprobación). Nivelado paga completo desde el día 1 si lo aprueban; Modificado limita muerte natural ~2 años. Cargo anual típico $40. Julie confirma si está disponible. ¿Tienes una edad o monto en mente? También puedes escribirle al 402-440-5438."
    : "Happy to break down Accendo Final Expense in plain English. Ages: Level about 40–89 or Modified about 40–75. Coverage from about $2,000; on Level the max drops with age (for example about $25,000 at 76–89). Typically no medical exam if you qualify: health questions plus a database review (not a guarantee of approval). Level pays full benefit from day one if approved; Modified limits natural-cause benefit for about 2 years. Typical $40 annual policy fee. Julie confirms whether it is available. Do you have an age or coverage amount in mind? You can also reach her at 402-440-5438.";
}

function aetnaProtectionSeriesAnswer(isSpanish) {
  return isSpanish
    ? "Protection Series℠ Final Expense es vida entera de gastos finales de Continental Life (CLI), que Julie cotiza por Aetna. Edades típicas ~45–89, solo Nivelado (beneficio completo desde el día 1 si califica), montos aprox. $2,000–$50,000 según edad, sin examen médico para quien califica. A diferencia de Accendo, no tiene plan Modificado. ¿Quieres compararlo con Accendo, o te ayudo con edades/montos? Julie está al 402-440-5438."
    : "Protection Series℠ Final Expense is Continental Life (CLI) whole life that Julie quotes through Aetna. Typical ages about 45–89, Level only (full benefit from day one if you qualify), about $2,000–$50,000 by age, no medical exam for applicants who qualify. Unlike Accendo, there’s no Modified plan. Want a quick compare with Accendo, or help with ages/amounts? Julie’s at 402-440-5438.";
}

function aetnaProductAnswer(question, isSpanish) {
  const t = normalizeChatQuestion(question);
  const mentionsAccendo = /\baccendo\b/.test(t);
  const mentionsProtection = /\b(protection series|continental life|cli)\b/.test(t);
  const asksDiff =
    /\b(difference|diferencia|vs|versus|compared|compar|between|entre)\b/.test(t) ||
    (mentionsAccendo && mentionsProtection);

  if (asksDiff && (mentionsAccendo || mentionsProtection || /\baetna\b/.test(t))) {
    return aetnaAccendoVsProtectionAnswer(isSpanish);
  }
  if (mentionsAccendo && !mentionsProtection) {
    return aetnaAccendoRequirementsAnswer(isSpanish);
  }
  if (mentionsProtection && !mentionsAccendo) {
    return aetnaProtectionSeriesAnswer(isSpanish);
  }
  return isSpanish
    ? "Con Aetna Senior Supplemental, Julie cotiza vida entera de gastos finales: Accendo Final Expense (Nivelado 40–89 o Modificado 40–75) y Protection Series℠ (Continental Life / CLI, Nivelado 45–89). Ambos suelen ser sin examen médico si califica, desde cerca de $2,000. En este portal no cotiza temporal, GUL ni IUL. ¿Quieres la diferencia entre Accendo y Protection Series, o te ayudo según tu edad? Julie: 402-440-5438."
    : "Through Aetna Senior Supplemental, Julie quotes final expense whole life: Accendo Final Expense (Level 40–89 or Modified 40–75) and Protection Series℠ (Continental Life / CLI, Level 45–89). Both are typically no-exam if you qualify. Julie confirms the coverage amount. This portal doesn’t include term, GUL, or IUL. Want the Accendo vs Protection Series difference, or help based on your age? Julie: 402-440-5438.";
}

/** Extract applicant age from casual EN/ES questions (incl. common typos tango→tengo). */
function extractApplicantAge(question) {
  const t = normalizeChatQuestion(question).replace(/\btango\b/g, "tengo");
  const patterns = [
    /\b(?:tengo|tango)\s+(\d{1,3})\s*(?:anos|years?|yrs?)?\b/,
    /\b(?:i am|i'm|im|soy|he is|she is|he's|she's|tiene|is)\s+(\d{1,3})\s*(?:anos|years?|yrs?\s*old)?\b/,
    /\b(?:age|edad)\s*(?:is|de|:)?\s*(\d{1,3})\b/,
    /\b(\d{1,3})\s*(?:anos|years?\s*old|yrs?\s*old)\b/,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (!m) continue;
    const age = Number(m[1]);
    if (Number.isFinite(age) && age >= 18 && age <= 120) return age;
  }
  return null;
}

function isAgeCarrierFitQuestion(question) {
  const age = extractApplicantAge(question);
  if (age == null) return false;
  const t = normalizeChatQuestion(question).replace(/\btango\b/g, "tengo");
  // Age + which company / best for me — not a named health condition ask
  if (shouldSkipFaqForHealthEligibilityQuestion(question)) return false;
  return (
    /\b(compan|carrier|aseguradora|mejor|best|which|cual|que compan|what compan|para mi|for me|situacion|situation|conviene|recomien|fit|encaja|solicitar|apply|aplicar|todavia|still)\b/.test(
      t
    ) || /\b(tengo|tiene|i am|i'm|im|soy|he is|she is)\b.*\b\d{2,3}\b/.test(t)
  );
}

/**
 * Public issue-age guidance only — never promises approval.
 * Product max ages from Julie's public carrier pages.
 */
function ageCarrierFitAnswer(age, isSpanish) {
  const aetnaOk = age >= 40 && age <= 89;
  const mooLevelOk = age >= 45 && age <= 85;
  const amamOk = age >= 50 && age <= 85;
  const assurityOk = age <= 85;
  const transOk = age >= 18 && age <= 85;
  const coreOk = age >= 50 && age <= 80;

  if (isSpanish) {
    if (age >= 86 && age <= 89 && aetnaOk) {
      return `Entiendo — a los ${age} años, por edades de emisión publicadas, Aetna suele llegar más alto: Accendo Final Expense (Nivelado hasta ~89) y Protection Series℠ (hasta ~89). Otras líneas (Mutual of Omaha Living Promise, American Amicable, Assurity, Transamerica FE Express, Corebridge) suelen topar cerca de 80–85. Esto es solo por edad; la salud y el estado también importan. ¿Quieres que te cuente requisitos de Accendo, o prefieres hablar con Julie al 402-440-5438?`;
    }
    if (age > 89) {
      return `Gracias por compartir tu edad. A los ${age} años, la mayoría de los productos de gastos finales que Julie cotiza ya no aceptan solicitudes nuevas (muchos topan a 85 o 89). Puede haber excepciones según el caso. Lo más útil es hablar con Julie al 402-440-5438 para ver opciones reales — ¿te ayudo con algo más sobre cómo funciona el seguro de gastos finales?`;
    }
    const bits = [];
    if (aetnaOk) bits.push("Aetna Accendo / Protection Series (hasta ~89)");
    if (mooLevelOk) bits.push("Mutual of Omaha Living Promise");
    if (amamOk) bits.push("American Amicable Golden Solution / Senior Choice");
    if (assurityOk) bits.push("Assurity Protect+ / Perform+");
    if (transOk) bits.push("Transamerica FE Express");
    if (coreOk) bits.push("Corebridge SimpliNow / GIWL");
    const list = bits.length ? bits.join("; ") : "varias aseguradoras según el producto";
    return `Claro — a los ${age} años, Julie suele comparar aseguradoras cuyas edades publicadas incluyen esa edad, por ejemplo: ${list}. La “mejor” también depende de salud, presupuesto y estado. ¿En qué estado estás, o quieres que te explique una de estas opciones? También puedes escribirle al 402-440-5438.`;
  }

  if (age >= 86 && age <= 89 && aetnaOk) {
    return `Got it — at ${age}, among products Julie quotes publicly, Aetna’s published issue ages usually go highest: Accendo Final Expense (Level through about 89) and Protection Series℠ (through about 89). Other lines (Mutual of Omaha Living Promise, American Amicable, Assurity, Transamerica FE Express, Corebridge) often top out near 80–85. That’s age-band guidance only — health and state matter too. Want Accendo requirements next, or would you rather talk with Julie at 402-440-5438?`;
  }
  if (age > 89) {
    return `Thanks for sharing that. At ${age}, most final expense products Julie quotes publicly no longer take new applications (many stop at 85 or 89). There may be case-by-case options. Best next step is Julie at 402-440-5438 — want me to explain how final expense works in the meantime?`;
  }
  const bits = [];
  if (aetnaOk) bits.push("Aetna Accendo / Protection Series (through ~89)");
  if (mooLevelOk) bits.push("Mutual of Omaha Living Promise");
  if (amamOk) bits.push("American Amicable Golden Solution / Senior Choice");
  if (assurityOk) bits.push("Assurity Protect+ / Perform+");
  if (transOk) bits.push("Transamerica FE Express");
  if (coreOk) bits.push("Corebridge SimpliNow / GIWL");
  const list = bits.length ? bits.join("; ") : "several carriers depending on the product";
  return `Sure — at ${age}, Julie usually compares carriers whose published issue ages include that age, for example: ${list}. The “best” fit also depends on health, budget, and state. What state are you in, or want me to explain one of these options? You can also reach Julie at 402-440-5438.`;
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
  if (/\b(direccion de casa|home address|where does julie live|julie'?s home|julie'?s (ssn|social|birthday)|cumpleanos de julie)\b/.test(t)) {
    return true;
  }
  return (
    /\bjulie\b/.test(t) &&
    /\b(esposo|husband|hijos|kids|children|familia personal|private life)\b/.test(t)
  );
}

function personalPrivateJulieAnswer(isSpanish) {
  return isSpanish
    ? "No comparto información personal privada. Para contacto de negocio: llamada, texto o WhatsApp al 402-440-5438, o Julie@mejorvidainsurance.com. Los estados con licencia actuales están en la página de licencias."
    : "I don’t share private personal information. For business contact: call, text, or WhatsApp 402-440-5438, or Julie@mejorvidainsurance.com. Current licensed states are on the licenses page.";
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

/** Count distinct public carrier families named in a question (for multi-carrier routing). */
function carrierFamilyHitCount(question) {
  const t = normalizeChatQuestion(question)
    .replace(/\bmutal\b/g, "mutual")
    .replace(/\bmutial\b/g, "mutual")
    .replace(/\bomha\b/g, "omaha");
  const families = [
    /\bassurity\b/,
    /\b(mutual of omaha|mutual omaha|living promise|united of omaha)\b/,
    /\b(american amicable|golden solution|senior choice)\b|\bamicable\b/,
    /\b(corebridge|american general|\bagl\b|simplinow|giwl)\b/,
    /\b(transamerica|fe express)\b/,
    /\b(aetna|accendo|protection series|continental life)\b/,
  ];
  return families.reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
}

function isCarriersQuestion(question) {
  const t = String(question || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bmutal\b/g, "mutual")
    .replace(/\bmutial\b/g, "mutual")
    .replace(/\bomha\b/g, "omaha");
  const asksCarriers = /\b(carriers?|compan(?:y|ies)|aseguradoras?|companias?|insurance companies|what carriers|which carriers|con que compan)\b/.test(
    t
  );
  const asksRelationship = /\b(work|works|working|use|uses|offer|offers|ofrecen|ofrece|ofrecer|ofrecemos|tienen|tiene|trabaja|trabajan|trabajar|compar\w*|compare|quote|cotiz\w*|vs|versus|against|contra)\b/.test(
    t
  );
  // Prefer carrier-list intent over "who is Julie" / licensed-states when company wording is present
  if (asksCarriers && (asksRelationship || /\b(julie|mejor vida|you|ustedes)\b/.test(t))) return true;
  // "Do you offer Mutual of Omaha and Aetna?" / "Mutual vs Aetna" — two named carriers
  if (carrierFamilyHitCount(question) >= 2 && asksRelationship) return true;
  return false;
}

function asksInsurancePremium(question) {
  const q = String(question || "");
  const asksPrice = /how much|cu[aá]nto (pago|cuesta|sale|es)|premium|al mes|per month|a month|d[oó]lares al d[ií]a/i.test(q);
  const aboutInsurance = /insurance|seguro|burial|gastos finales|cobertura/i.test(q);
  const aboutFuneralBill = /funeral cost|cuesta un funeral|cost of a funeral|cremation in|cremaci[oó]n en|direct cremation/i.test(q);
  return asksPrice && aboutInsurance && !aboutFuneralBill;
}

/** Facts the public chat kept getting wrong when it searched. */
function publicFactAnswer(question, isSpanish) {
  const q = String(question || "");
  if (/\$\s?\d|\b\d{1,3}(?:,\d{3})+\b/.test(q) && /enough|cobertura|coverage|policy|p[oó]liza|seguro|insurance|premium|cuesta|cost/i.test(q)) {
    return generalPriceRefusal(isSpanish);
  }
  if (/m[aá]s barat|cheapest|policy fee|cargo anual|monto m[aá]ximo|\bmaximum\b|\bminimum\b|m[ií]nimo/i.test(q)) {
    return generalPriceRefusal(isSpanish);
  }
  if (/social security/i.test(q) && /funeral|burial|pay|paga/i.test(q)) {
    return isSpanish
      ? "El Seguro Social no paga la factura del funeral. Un cónyuge o hijo que cumpla los requisitos puede recibir un pago único pequeño. No es un plan de funeral. Julie confirma el seguro de gastos finales al 402-440-5438."
      : "Social Security does not pay the funeral bill. An eligible surviving spouse or child may receive a small one-time death payment. It is not a funeral plan. Julie confirms final expense coverage at 402-440-5438.";
  }
  if (/medicare/i.test(q) && /funeral|burial|entierro|cemetery|cementerio/i.test(q)) {
    return isSpanish
      ? "Medicare no paga el funeral ni el entierro. El seguro de gastos finales paga efectivo al beneficiario para esos gastos. Julie lo confirma al 402-440-5438."
      : "Medicare does not pay for a funeral or burial. Final expense insurance pays cash to the beneficiary for those costs. Julie confirms that at 402-440-5438.";
  }
  if (/seguro social|\bssn\b|social security number|fecha de nacimiento|date of birth/i.test(q)) {
    return isSpanish
      ? "No envíe por este chat su número de seguro social ni su fecha de nacimiento. Para orientar una cotización basta la edad. ¿Cuántos años tiene?"
      : "Do not send a Social Security number or date of birth in this chat. Age is enough to start a quote. How old is the person?";
  }
  if (/are you a funeral|are you the funeral|son una funeraria|ustedes son una funeraria|is this a funeral home/i.test(q)) {
    return isSpanish
      ? "No. Mejor Vida Seguros no es una funeraria. Comparamos seguro de gastos finales, que paga efectivo al beneficiario."
      : "No. Mejor Vida Insurance is not a funeral home. We compare final expense insurance, which pays cash to the beneficiary.";
  }
  if (/b[oó]veda|vault/i.test(q)) {
    return isSpanish
      ? "La bóveda casi nunca va en el paquete de la funeraria. La mayoría de los cementerios la piden en un entierro en tierra para que la tumba no se hunda. Es una factura aparte."
      : "A burial vault is almost never included in the funeral-home package. Most cemeteries require one for ground burial so the grave does not sink. It is a separate bill.";
  }
  if (/lote|cemetery plot|burial plot/i.test(q) && /seguro|insurance|paga|pay|cover/i.test(q)) {
    return isSpanish
      ? "El seguro paga un beneficio en efectivo al beneficiario. El lote del cementerio es una factura aparte, y casi nunca va incluido en el paquete de la funeraria. La familia puede usar ese dinero para el lote si así lo decide."
      : "The insurance pays a cash benefit to the beneficiary. The cemetery plot is a separate bill, and it is almost never included in the funeral-home package. The family can use that money for the plot if they choose.";
  }
  if (/cremaci[oó]n|cremation/i.test(q) && /seguro|insurance|sirve|cover/i.test(q) && !/cuesta|how much|cost/i.test(q)) {
    return isSpanish
      ? "Sí. El seguro de gastos finales paga efectivo al beneficiario. Sirve para cremación o para entierro. No somos una funeraria."
      : "Yes. Final expense insurance pays cash to the beneficiary. It can be used for cremation or burial. We are not a funeral home.";
  }
  if (/burial insurance the same as a funeral|mismo que un funeral|es un funeral/i.test(q)) {
    return isSpanish
      ? "No. El seguro de entierro es seguro de gastos finales. No es un funeral y no somos una funeraria. Paga efectivo al beneficiario."
      : "No. Burial insurance is final expense insurance. It is not a funeral, and we are not a funeral home. It pays cash to the beneficiary.";
  }
  if (/nivelad|escalonad|\bgraded\b|level plan|level benefit/i.test(q) && !/accendo|protection series|living promise|corebridge|transamerica|amicable/i.test(q)) {
    return isSpanish
      ? "Un plan nivelado paga el beneficio completo desde el día 1 si la compañía lo aprueba, salvo las exclusiones del contrato, como el suicidio en un período inicial. Un plan escalonado limita el pago por muerte natural durante los primeros dos años. La muerte accidental normalmente se paga completa. Julie confirma cuál contrato aplica."
      : "A level plan pays the full benefit from day one if the company approves it, except for contract exclusions such as suicide in an initial period. A graded plan limits the payment for natural death during the first two years. Accidental death is normally paid in full. Julie confirms which contract applies.";
  }
  if (/funeraria o mi familia|who gets the money|dinero lo recibe/i.test(q)) {
    return isSpanish
      ? "El beneficio se paga en efectivo a la persona beneficiaria, no directamente a la funeraria. La familia decide cómo usarlo."
      : "The benefit is paid in cash to the beneficiary, not directly to the funeral home. The family decides how to use it.";
  }
  if (/medicaid|medicare/i.test(q)) {
    return isSpanish
      ? "No voy a adivinar cómo afecta Medicaid o Medicare. Julie lo revisa con usted por llamada, texto o WhatsApp al 402-440-5438, o por correo a Julie@mejorvidainsurance.com."
      : "I will not guess how Medicaid or Medicare affects this. Julie reviews it by call, text, or WhatsApp at 402-440-5438, or by email at Julie@mejorvidainsurance.com.";
  }
  if (/\bscam\b|estafa|fraude/i.test(q)) {
    return isSpanish
      ? "No. Este chat es de Mejor Vida Seguros. Julie Braunsroth, NPN 21695431, atiende al 402-440-5438 y en Julie@mejorvidainsurance.com. Puede verificar la licencia en https://www.mejorvidainsurance.com/licencias.html."
      : "No. This chat is Mejor Vida Insurance. Julie Braunsroth, NPN 21695431, can be reached at 402-440-5438 and Julie@mejorvidainsurance.com. You can check the license at https://www.mejorvidainsurance.com/en/licenses.html.";
  }
  if (/horario|what are your hours|qu[eé] hora|saturday|sunday|weekend|s[aá]bado|domingo|abierto/i.test(q)) {
    return isSpanish
      ? "Julie no publica un horario fijo en este chat. Puede llamarla, escribirle o usar WhatsApp al 402-440-5438, o el correo Julie@mejorvidainsurance.com."
      : "Julie does not post set hours in this chat. You can call, text, or WhatsApp 402-440-5438, or email Julie@mejorvidainsurance.com.";
  }
  if (/phone number|n[uú]mero de tel[eé]fono|what is your phone/i.test(q)) {
    return isSpanish
      ? "El número para llamada, texto y WhatsApp es 402-440-5438. El correo es Julie@mejorvidainsurance.com."
      : "The number for calls, text, and WhatsApp is 402-440-5438. The email is Julie@mejorvidainsurance.com.";
  }
  if (/oficina|walk-in|office i can visit|visit your office/i.test(q)) {
    return isSpanish
      ? "No hay oficina abierta al público. La atención es por teléfono, texto o WhatsApp al 402-440-5438. La dirección postal, solo para correspondencia, es 1201 O St Ste 309 Unit #597, Lincoln, NE 68508. Las licencias vigentes están en la página de licencias."
      : "There is no public walk-in office. You can reach the agency by phone, text, or WhatsApp at 402-440-5438. The mailing address, for correspondence only, is 1201 O St Ste 309 Unit #597, Lincoln, NE 68508. Current licenses are on the licenses page.";
  }
  if (/payable-on-death|payable on death|\bpod account\b/i.test(q)) {
    return isSpanish
      ? "Una cuenta pagadera al fallecer no es un seguro de vida. Es una designación del banco. El seguro de gastos finales paga efectivo al beneficiario. Julie confirma el seguro."
      : "A payable-on-death bank account is not a life insurance policy. It is a bank designation. Final expense insurance pays cash to the beneficiary. Julie confirms the insurance.";
  }
  if (/grace period|per[ií]odo de gracia/i.test(q)) {
    return isSpanish
      ? "El período de gracia es el tiempo del contrato en el que la póliza puede seguir vigente si la prima se atrasa. No prometo un número de días. Julie confirma ese contrato."
      : "A grace period is the time in the contract when the policy can stay in force if a premium is late. I don't promise a number of days. Julie confirms that contract.";
  }
  if (/contestability|incontestab|impugn/i.test(q)) {
    return isSpanish
      ? "El período de impugnación está en el contrato, a menudo los primeros dos años. En ese tiempo la compañía puede revisar la solicitud si hay un reclamo. Julie confirma esa póliza."
      : "The contestability period is in the contract, often the first two years. During it the company can review the application if there is a claim. Julie confirms that policy.";
  }
  if (/vape|cigars?|nicotine patch|marijuana|mariguana|cannabis/i.test(q)) {
    return isSpanish
      ? "Cada compañía clasifica la nicotina y la marihuana a su manera. No digo si cuenta como fumador. Julie lo confirma. No doy un precio por este chat."
      : "Each company classifies nicotine and marijuana in its own way. I will not say whether it counts as tobacco. Julie confirms that. I don't give a price in this chat.";
  }
  if (/premium (go up|increase|guaranteed)|will my premium|prima (sube|garantizada)|is the premium guaranteed/i.test(q)) {
    return isSpanish
      ? "El seguro de gastos finales de vida entera suele cotizarse con una prima nivelada, pero manda el contrato. Julie lo confirma. No prometo que ninguna prima cambie."
      : "Final expense whole life is usually quoted with a level premium, but the contract controls that. Julie confirms the contract. I will not promise that no premium ever changes.";
  }
  if (/annuit|anualidad/i.test(q)) {
    return isSpanish
      ? "Este chat responde sobre seguro de gastos finales y de vida. No describo anualidades aquí. Julie puede decir si está hablando de una."
      : "This chat answers final expense and life insurance questions. I don't describe annuity products here. Julie can say whether she is discussing one.";
  }
  if (/blood test|an[aá]lisis de sangre/i.test(q)) {
    return isSpanish
      ? "Varios planes de gastos finales no piden análisis de sangre. La compañía lo decide. Julie lo confirma. No lo adivino."
      : "Several final expense plans do not require a blood test. The company decides. Julie confirms that. I will not guess.";
  }
  if (/real person|are you a bot|eres (un )?bot|eres una persona real/i.test(q)) {
    return isSpanish
      ? "Este chat responde información general. Julie es la persona. Puede llamarla, escribirle o usar WhatsApp al 402-440-5438."
      : "This chat answers general questions. Julie is the person. You can call, text, or WhatsApp her at 402-440-5438.";
  }
  if (/stop texting|stop calling|opt out|no me escriba|dejen de escribir/i.test(q)) {
    return isSpanish
      ? "Para dejar los textos, responda STOP al mensaje o dígaselo a Julie al 402-440-5438."
      : "To stop texts, reply STOP to the message, or tell Julie at 402-440-5438.";
  }
  if (/cuenta bancaria|bank account|routing number/i.test(q)) {
    return isSpanish
      ? "No envíe su cuenta bancaria por este chat. Julie confirma la forma de pago al 402-440-5438."
      : "Do not send a bank account in this chat. Julie confirms the payment method at 402-440-5438.";
  }
  if (/how fast|cu[aá]nto tarda el pago|death benefit paid|se paga el beneficio/i.test(q)) {
    return isSpanish
      ? "El tiempo lo marca la compañía cuando recibe lo que el contrato pide, como el acta de defunción. Julie no promete un número de días por este mensaje."
      : "The company sets the timing after it receives what the contract requires, such as the death certificate. Julie does not promise a number of days in this message.";
  }
  if (/\bsmoke\b|fumo|fuma|smoker/i.test(q) && /price|precio|premium|cuesta|change/i.test(q)) {
    return isSpanish
      ? "Fumar normalmente cambia el precio. Julie prepara la cotización con la edad, el sexo y si fuma. No doy un precio por este mensaje."
      : "Tobacco normally changes the price. Julie prepares the quote from the age, sex, and tobacco answer. I will not give a price in this message.";
  }
  if (/are you the insurance company|es (usted|la) la compa[nñ][ií]a de seguros/i.test(q)) {
    return isSpanish
      ? "No. Mejor Vida Seguros es una agencia independiente. Compara pólizas de compañías de seguros. Julie confirma cuál corresponde."
      : "No. Mejor Vida Insurance is an independent agency. It compares policies from insurance companies. Julie confirms which company fits.";
  }
  if (/licensed in|licencia en|are you licensed|tiene licencia/i.test(q)) {
    return isSpanish
      ? "Las licencias vigentes están en https://www.mejorvidainsurance.com/licencias.html. No las enumero en este chat."
      : "Current licenses are at https://www.mejorvidainsurance.com/en/licenses.html. I don't list them in this chat.";
  }
  if (/binding|es vinculante|obliga/i.test(q) && /quote|cotizaci/i.test(q)) {
    return isSpanish
      ? "Una cotización no es una póliza y no obliga. La compañía decide después de la solicitud. Julie lo confirma."
      : "A quote is not a policy, and it is not binding. The company decides after the application. Julie confirms that.";
  }
  if (/simplified issue|emisi[oó]n simplificada/i.test(q)) {
    return isSpanish
      ? "La emisión simplificada usa preguntas de salud y no pide examen médico. No es una aprobación automática. Julie confirma qué solicitud corresponde."
      : "Simplified issue uses health questions and does not require a medical exam. It is not automatic approval. Julie confirms which application it is.";
  }
  if (/guaranteed issue|aceptaci[oó]n garantizada|emisi[oó]n garantizada/i.test(q)) {
    return isSpanish
      ? "La aceptación garantizada no hace preguntas de salud. No es lo mismo que un plan nivelado. El contrato limita la muerte natural en un período inicial. La muerte accidental normalmente se paga completa. Julie confirma el contrato."
      : "Guaranteed issue asks no health questions. It is not the same as a level plan. The contract limits natural death during an early period. Accidental death is normally paid in full. Julie confirms the contract.";
  }
  if (/cremation with a memorial|cremaci[oó]n con (un )?memorial|memorial service/i.test(q)) {
    return isSpanish
      ? "Una cremación con memorial es la cremación más una ceremonia. No es lo mismo que un velatorio. No doy precios por este chat."
      : "A cremation with a memorial is a cremation plus a ceremony. It is not the same as a viewing. I don't give prices in this chat.";
  }
  if (/how many days|underwriting take|cu[aá]ntos d[ií]as/i.test(q)) {
    return isSpanish
      ? "No prometo un número de días. La compañía marca el tiempo cuando recibe la solicitud. Julie lo confirma."
      : "I don't promise a number of days. The company sets the timing when it receives the application. Julie confirms that.";
  }
  if (/call my doctor|llamar a mi m[eé]dico|my doctor/i.test(q)) {
    return isSpanish
      ? "La compañía puede revisar recetas o pedir expedientes. No digo si alguien llama al médico. Julie confirma qué hace esa solicitud."
      : "The company may review prescriptions or request records. I will not say whether someone calls the doctor. Julie confirms what that application does.";
  }
  if (/\bmib\b|medical information bureau/i.test(q)) {
    return isSpanish
      ? "El MIB es un informe que algunas aseguradoras de vida consultan al revisar una solicitud. No aprueba ni niega por sí solo. Julie confirma si esa compañía lo usa."
      : "The MIB is a report some life insurers check when they review an application. It does not approve or deny by itself. Julie confirms whether that company uses it.";
  }
  if (/dementia|alzheimer|nursing home|hospice|asilo|demencia/i.test(q)) {
    return whatsappPreparedAnswer({ clear: true, intent: "health" }, isSpanish, q);
  }
  if (/\b17\b|how old do you have to be|edad m[ií]nima|minimum age/i.test(q)) {
    return isSpanish
      ? "Las edades de emisión cambian según la compañía. Muchos planes que Julie compara empiezan cerca de los 45 o 50 y terminan cerca de los 85 o 89. Julie confirma. No invento un producto."
      : "Issue ages differ by company. Many plans Julie compares start around 45 or 50 and stop around 85 or 89. Julie confirms that. I will not invent a product.";
  }
  if (/\bva\b|veteran/i.test(q) && /funeral|burial|pay|paga/i.test(q)) {
    return isSpanish
      ? "No adivino lo que paga Asuntos de Veteranos. Ese apoyo no es lo mismo que un seguro de gastos finales. Julie explica el seguro. No doy precios por este chat."
      : "I will not guess what the VA pays. That help is not the same as a final expense policy. Julie can explain the insurance. I don't give prices in this chat.";
  }
  if (/paid directly|pago directo|funeral home be paid/i.test(q)) {
    return isSpanish
      ? "El beneficio se paga al beneficiario, salvo que el dueño haya firmado una cesión. La funeraria no cobra sola. Julie confirma la cesión."
      : "The benefit is paid to the beneficiary unless the owner has signed an assignment. The funeral home is not paid automatically. Julie confirms an assignment.";
  }
  if (/divorc/i.test(q) && /beneficiar/i.test(q)) {
    return isSpanish
      ? "El divorcio no cambia solo al beneficiario. El dueño tiene que pedir el cambio. Julie confirma el formulario."
      : "A divorce does not by itself change the beneficiary. The owner has to request the change. Julie confirms the form.";
  }
  if (/charge a fee|fee to (get|ask)|cobran.*(cotiz|preguntar)|cuesta (la )?cotizaci/i.test(q)) {
    return isSpanish
      ? "Preguntar una cotización no tiene cargo. El precio del seguro lo confirma Julie. ¿Cuántos años tiene la persona?"
      : "Asking for a quote has no charge. Julie confirms the insurance price. How old is the person?";
  }
  if (/first month free|primer mes (es )?gratis|month is free/i.test(q)) {
    return isSpanish
      ? "No digo que un mes sea gratis. El calendario de pagos está en el contrato. Julie lo confirma. No doy un precio por este chat."
      : "I don't say that any month is free. The payment schedule is in the contract. Julie confirms it. I don't give a price in this chat.";
  }
  if (/headstone|monument|l[aá]pida/i.test(q)) {
    return isSpanish
      ? "La lápida la pone el cementerio o una compañía de monumentos, y cada uno fija su precio. No doy precios por este chat."
      : "A headstone comes from the cemetery or a monument company, and each one sets its own price. I don't give prices in this chat.";
  }
  if (/general price list|lista general de precios/i.test(q)) {
    return isSpanish
      ? "La lista general de precios es la hoja de la funeraria con sus servicios y artículos. Puede pedirla. No leo precios por este chat."
      : "A general price list is the funeral home's own sheet of services and goods. You can ask the home for it. I don't read prices in this chat.";
  }
  if (/complete funeral package|paquete completo|have to buy a package/i.test(q)) {
    return isSpanish
      ? "No tiene que comprar un paquete completo. Puede pedir artículos por separado. El ataúd va solo si ese paquete lo incluye. No doy precios por este chat."
      : "You do not have to buy a complete package. You can ask for items separately. A casket is included only if that package says so. I don't give prices in this chat.";
  }
  if (/power of attorney|poder notarial/i.test(q)) {
    return isSpanish
      ? "Un poder notarial no autoriza solo la solicitud. La compañía decide qué firmas pide. Julie lo confirma. No lo adivino."
      : "A power of attorney does not by itself authorize the application. The company decides which signatures it needs. Julie confirms that. I will not guess.";
  }
  if (/grandchild|nieto|nieta/i.test(q)) {
    return isSpanish
      ? "Algunas pólizas ofrecen un anexo para nietos. No todas lo tienen. Julie confirma si esa póliza lo incluye."
      : "Some policies offer a grandchild rider. Not every policy has one. Julie confirms whether that policy includes it.";
  }
  if (/credit card|tarjeta de cr[eé]dito/i.test(q)) {
    return isSpanish
      ? "La forma de pago depende de la compañía. Muchas usan un débito bancario. Julie confirma qué acepta esa solicitud. No digo que acepte tarjeta."
      : "The payment method depends on the company. Many use a bank draft. Julie confirms what that application accepts. I will not say a credit card is accepted.";
  }
  if (/\blapse|caduc|se cae la p[oó]liza/i.test(q)) {
    return isSpanish
      ? "Si la póliza caduca, la cobertura terminó porque no se pagó la prima después del período de gracia. Ese período está en el contrato. Julie lo confirma. No prometo un número de días."
      : "If a policy lapses, coverage ended because the premium was not paid after the grace period. That period is in the contract. Julie confirms it. I don't promise a number of days.";
  }
  if (/irrevocable assignment|cesión irrevocable|asignaci[oó]n irrevocable/i.test(q)) {
    return isSpanish
      ? "Una cesión irrevocable permite que el dueño de la póliza destine el beneficio a una funeraria u otra parte, y en general no se cambia después. Julie confirma el formulario. No adivino el efecto legal."
      : "An irrevocable assignment lets the policy owner direct the benefit to a funeral home or another party, and it generally cannot be changed later. Julie confirms the form. I will not guess the legal effect.";
  }
  if (/alkaline hydrolysis|hidr[oó]lisis alcalina/i.test(q)) {
    return isSpanish
      ? "La hidrólisis alcalina es un proceso con agua que algunas instalaciones usan en lugar de la cremación con fuego. No todas las funerarias lo ofrecen. No doy precios por este chat."
      : "Alkaline hydrolysis is a water-based process some facilities use instead of flame cremation. Not every funeral home offers it. I don't give prices in this chat.";
  }
  if (/\bfax\b/i.test(q)) {
    return isSpanish
      ? "No doy un número de fax. El contacto público es llamada, texto o WhatsApp al 402-440-5438, o el correo Julie@mejorvidainsurance.com."
      : "I don't give a fax number. The public contact is call, text, or WhatsApp at 402-440-5438, or email Julie@mejorvidainsurance.com.";
  }
  if (/\bviewing\b|velatorio/i.test(q)) {
    return isSpanish
      ? "Un velatorio es posible cuando la funeraria lo ofrece. No es obligatorio. No doy precios por este chat."
      : "A viewing is possible when the funeral home offers it. It is not required. I don't give prices in this chat.";
  }
  if (/\bquote\b|cotizaci[oó]n|cotizar/i.test(q) && !/funeral cost|cuesta un funeral/i.test(q)) {
    return whatsappPreparedAnswer({ clear: true, intent: "quote" }, isSpanish, q);
  }
  if (/quit smoking|used to smoke|former smoker|dej[eé] de fumar|ya no fumo/i.test(q)) {
    return isSpanish
      ? "Dejar de fumar puede cambiar la tarifa, pero cada compañía pide un tiempo distinto sin nicotina. Julie lo confirma. No doy un precio por este chat."
      : "Quitting can change the rate, but each company requires a different time without nicotine. Julie confirms that. I don't give a price in this chat.";
  }
  if (/come to my house|home visit|visita a (mi )?casa|come to the house/i.test(q)) {
    return isSpanish
      ? "No hay visitas a domicilio ni oficina abierta al público. La atención es por teléfono, texto o WhatsApp al 402-440-5438."
      : "There are no home visits and no public walk-in office. You can reach the agency by phone, text, or WhatsApp at 402-440-5438.";
  }
  if (/traditional funeral|funeral tradicional/i.test(q) && /includ|incluye|usually|qué incluye|what is/i.test(q)) {
    return isSpanish
      ? "Un funeral tradicional suele incluir el personal, el traslado, la preparación y una ceremonia. El ataúd va solo si el paquete de esa funeraria lo dice. El lote y la bóveda son facturas aparte. No doy precios por este chat."
      : "A traditional funeral usually includes the staff, transfer, preparation, and a ceremony. A casket is included only if that funeral home's package says so. The plot and the vault are separate bills. I don't give prices in this chat.";
  }
  if (/\bcitizen\b|ciudadan/i.test(q)) {
    return isSpanish
      ? "Las reglas de ciudadanía dependen de la compañía. Julie confirma qué pide esa solicitud. No lo adivino."
      : "Citizenship rules depend on the company. Julie confirms what that application requires. I will not guess.";
  }
  if (asksInsurancePremium(q)) {
    return whatsappPreparedAnswer({ clear: true, intent: "quote" }, isSpanish, q);
  }
  if (mentionsUnlicensedState(q) && !mentionsLicensedState(q) && /sell|help|policy|ayud|cotiz|seguro/i.test(q)) {
    return isSpanish
      ? "Julie confirma si puede ayudarle en su estado. Las licencias vigentes están en https://www.mejorvidainsurance.com/licencias.html."
      : "Julie confirms whether she can help in your state. Current licenses are at https://www.mejorvidainsurance.com/en/licenses.html.";
  }
  if (mentionsLicensedState(q) && /ayud|orient|help me|can you help|sell me|vender/i.test(q) && !/funeraria|funeral homes?/i.test(q)) {
    return isSpanish
      ? "Sí. Julie puede orientar el seguro de gastos finales. ¿Cuántos años tiene?"
      : "Yes. Julie can help with final expense insurance. How old is the person?";
  }
  return null;
}

function carriersAnswer(isSpanish) {
  return isSpanish
    ? "Claro — Mejor Vida Seguros compara opciones de Assurity, Mutual of Omaha, American Amicable, Corebridge, Transamerica, Aetna y Americo. ¿Te interesa alguna compañía en particular, o quieres orientación por edad? Puedes llamar o escribir al 402-440-5438."
    : "Sure thing — Mejor Vida Insurance compares options from Assurity, Mutual of Omaha, American Amicable, Corebridge, Transamerica, Aetna, and Americo. Curious about a specific company, or want guidance by age? Call or text 402-440-5438.";
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
function applyKnowledgeAnswerPostProcess(question, answerText, isSpanishQuery, skipFaqHealth, extra) {
  extra = extra || {};
  let out = stripQaLabels(answerText);
  // Knowledge chunks sometimes store literal "\n" instead of real newlines
  out = out.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
  if (extra.publicFacebook) {
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
        out = publicHealthEligibilityDeferralLine(isSpanishQuery ? "es" : "en");
      }
    }
    return out;
  }
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
        ? "Depende del plan. El nivelado paga el beneficio completo desde el día 1 si la compañía lo aprueba, salvo exclusiones del contrato como el suicidio en un período inicial. El escalonado o modificado limita la muerte natural al principio, a menudo los primeros dos años. La muerte accidental normalmente se paga completa. Julie confirma el contrato. No digo que la mayoría de las pólizas esperen dos años."
        : "It depends on the plan. A level plan pays the full benefit from day one if the company approves it, except for contract exclusions such as suicide in an initial period. A graded or modified plan limits natural death during an early period, often the first two years. Accidental death is normally paid in full. Julie confirms the contract. I will not say that most policies have a two-year wait.";
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
        ? "Mejor Vida Seguros es una agencia 100% por teléfono y en línea — no hay oficina de atención al público. La dirección postal (solo correspondencia) es 1201 O St Ste 309 Unit #597, Lincoln, NE 68508. Contacto: llamada, texto o WhatsApp al 402-440-5438. Los estados con licencia actuales están en la página de licencias."
        : "Mejor Vida Insurance is a 100% phone and online agency — no public walk-in office. Our mailing address (correspondence only) is 1201 O St Ste 309 Unit #597, Lincoln, NE 68508. Contact by call, text, or WhatsApp at 402-440-5438. Current licensed states are on the licenses page.";
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

function isFuneralDirectoryChunk(chunk) {
  const text = String((chunk && (chunk.content || chunk.answer)) || "").trim();
  return /^Directorio de funerarias:/i.test(text) || /^Funeral home directory:/i.test(text);
}

function intentAllowsFuneralDirectory(clientIntent) {
  const intent = clientIntent && clientIntent.intent;
  return intent === "funeral_homes" || intent === "funeral_prices";
}

function messageLooksSpanish(question) {
  const q = String(question || "");
  if (/[áéíóúüñ¿¡]/i.test(q)) return true;
  return /\b(hola|buenos|gracias|quiero|tengo|estoy|años|fuma|funeraria|cotizacion|cotización|usted|ustedes|no se|ke es)\b/i.test(q);
}

function polishWhatsappAnswer(text) {
  let s = String(text || "");
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1, $2");
  s = s.replace(/\*\*/g, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  s = s.replace(/^\s*[-–]\s+/gm, "");
  const ustedWord = (from, to) => s.replace(from, (m) => (m[0] === m[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to));
  s = ustedWord(/\bte dejo\b/gi, "le comparto");
  s = ustedWord(/\bno dudes en\b/gi, "puede");
  s = ustedWord(/\bpuedes\b/gi, "puede");
  s = ustedWord(/\btienes\b/gi, "tiene");
  s = ustedWord(/\bquieres\b/gi, "quiere");
  s = ustedWord(/\bdeseas\b/gi, "desea");
  s = ustedWord(/\btus\b/gi, "sus");
  s = ustedWord(/\btu\b/gi, "su");
  s = ustedWord(/\bcontigo\b/gi, "con usted");
  s = s.replace(/\s*Packages include[^.]*\./gi, "");
  s = s.replace(/\s*Paquetes incluyen[^.]*\./gi, "");
  s = s.replace(/traditional funeral in Omaha averages/gi, "traditional funeral in Nebraska averages");
  s = s.replace(/cremation with a service averages/gi, "cremation with a service in Nebraska averages");
  s = s.replace(/\s*¿[^?]{0,180}\?\s*$/g, "");
  s = s.replace(/\s*(?:Would you like|Do you want)[^?]{0,180}\?\s*$/i, "");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

function escapeEmailHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function emailJulieToReply({ phone, name, question, reason }) {
  const who = String(name || "").trim() || "A WhatsApp client";
  const fromPhone = String(phone || "").trim() || "unknown number";
  const message = String(question || "").trim() || "(empty message)";
  const why = String(reason || "The message was not clear enough to answer.");
  const subject = `WhatsApp needs your reply: ${message.replace(/\s+/g, " ").slice(0, 70)}`;
  const text =
    `${why}\n\n` +
    `The bot did not answer. It told the client you will write back.\n\n` +
    `From: ${who}\n` +
    `WhatsApp: ${fromPhone}\n\n` +
    `Message:\n${message}\n\n` +
    `Reply in the ManyChat WhatsApp chat.\n`;
  const inner =
    `<p style="margin:0 0 16px;"><strong>WhatsApp needs your reply.</strong></p>` +
    `<p style="margin:0 0 16px;">${escapeEmailHtml(why)} The bot did not answer. It told the client you will write back.</p>` +
    `<p style="margin:0 0 8px;"><strong>From:</strong> ${escapeEmailHtml(who)}</p>` +
    `<p style="margin:0 0 16px;"><strong>WhatsApp:</strong> ${escapeEmailHtml(fromPhone)}</p>` +
    `<blockquote style="margin:0 0 16px;padding:12px 16px;background:#f4f6f8;border-left:4px solid #1e3a8a;">${escapeEmailHtml(message).replace(/\n/g, "<br />")}</blockquote>` +
    `<p style="margin:0 0 16px;">Reply in the ManyChat WhatsApp chat.</p>` +
    signatureBlockEN();
  const html = wrapResendEmailHtml(inner, LOGO_EN);
  const to = "julie@mejorvidainsurance.com";
  const key = String(process.env.RESEND_API_KEY || "").trim();
  if (key) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Mejor Vida Insurance <julie@mejorvidainsurance.com>",
        to: [to],
        subject,
        html,
        text,
      }),
    });
    if (!r.ok) {
      const errText = await r.text();
      throw new Error(`Resend ${r.status}: ${errText.slice(0, 180)}`);
    }
    return;
  }
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("email is not configured");
  }
  const { google } = require("./google-clients");
  const boundary = `mvi_wa_${Date.now()}`;
  const encodedSubject = /[^\x20-\x7e]/.test(subject)
    ? `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`
    : subject;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  const rfc822 = [
    `From: Mejor Vida Insurance <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
  const raw = Buffer.from(rfc822, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const redirect = process.env.GMAIL_REDIRECT_URI || "https://www.mejorvidainsurance.com/api/staff/gmail-callback";
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirect);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
}

function hasPriceFigure(text) {
  const s = String(text || "");
  return /\$\s?\d/.test(s) || /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/.test(s) || /\b(?:dollars?|d[oó]lares)\b/i.test(s);
}

/** The bot explains how things work. It does not quote funeral or insurance prices. */
function withoutPrices(text, isSpanish) {
  const original = String(text || "");
  if (!hasPriceFigure(original)) return original;
  let s = original;
  s = s.replace(/\$\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:–|-|to|a)\s*\$?\s?\d[\d,]*(?:\.\d+)?)?/gi, "");
  s = s.replace(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g, "");
  s = s.replace(/,?\s*\b(?:up to about|from about|about|around|aprox\.?|cerca de|desde cerca de|unos pocos)\s*(?=[,.;:)]|$)/gi, "");
  s = s.replace(/[^.?!]*\bstart at and go up to\b[^.?!]*[.?!]?/gi, "");
  s = s.replace(/\btypically starts around,?\s*with\b/gi, "uses");
  s = s.replace(/\baround with\b/gi, "with");
  s = s.replace(/[^.?!]*\b(?:starts at and|for and|from or more)\b[^.?!]*[.?!]?/gi, " ");
  s = s.replace(/\b(?:costo|precio)\s+de\s*\./gi, ".");
  s = s.replace(/\bamount of\s*\./gi, "amount.");
  s = s.replace(/\(\s*,/g, "(").replace(/,\s*\)/g, ")").replace(/\(\s*\)/g, "");
  s = s.replace(/\s+,/g, ",").replace(/,\s*,/g, ",").replace(/,\s*\./g, ".");
  s = s.replace(/\s{2,}/g, " ").replace(/\s+([.;:])/g, "$1").trim();
  const note = isSpanish
    ? "No doy precios por este chat. Julie confirma los montos."
    : "I don't give prices in this chat. Julie confirms the amounts.";
  if (hasPriceFigure(s) || s.length < 40) return note;
  return s;
}

function generalPriceRefusal(isSpanish) {
  return isSpanish
    ? "No doy precios de funerarias ni de seguros por este chat. Cada funeraria fija sus precios. El lote y la bóveda suelen ser facturas aparte. El seguro de gastos finales paga efectivo al beneficiario. Julie confirma una cotización al 402-440-5438."
    : "I don't give funeral or insurance prices in this chat. Each funeral home sets its own prices. The cemetery plot and the vault are usually separate bills. Final expense insurance pays cash to the beneficiary. Julie confirms a quote at 402-440-5438.";
}

function whatsappHandoff(isSpanish) {
  return isSpanish
    ? "No quiero responderle mal. Julie le escribe por aquí en un momento."
    : "I don't want to answer you incorrectly. Julie will write you here in a moment.";
}

function mentionsLicensedState(q) {
  return /\b(nebraska|kansas|colorado|nevada|omaha|lincoln|grand island|kearney|bellevue|topeka|wichita|olathe|overland park|kansas city|denver|colorado springs|aurora|boulder|pueblo|las vegas|henderson|reno|sparks)\b/i.test(q);
}

function mentionsUnlicensedState(q) {
  return /\b(iowa|texas|california|florida|arizona|illinois|missouri|oklahoma|minnesota|wisconsin|ohio|michigan|georgia|alabama|tennessee|virginia|washington|oregon|utah|louisiana|arkansas|mississippi|indiana|kentucky|pennsylvania|massachusetts|maryland|alaska|hawaii|idaho|montana|wyoming|dakota|mexico)\b|new york|north carolina|south carolina|new jersey|new mexico|west virginia/i.test(q);
}

function quoteFacts(q) {
  const age = q.match(/\b(\d{1,2})\s*(?:años|years?\s*old)\b/i) || q.match(/\b(?:tengo|tiene|soy de|edad(?: de)?|i am|i'm|he is|she is|he's|she's|wife is|husband is|brother is|sister is|mom is|dad is|mother is|father is)\s*(?:a\s+)?(\d{1,2})\b/i);
  const sex = /mujer|\bwoman\b|\bfemale\b|se[nñ]ora|\bmom\b|\bmother\b|mam[aá]|\besposa\b|\bwife\b/i.test(q)
    ? "f"
    : /hombre|\bman\b|\bmale\b|se[nñ]or(?!a)|\bdad\b|\bfather\b|pap[aá]|\besposo\b|\bhusband\b/i.test(q)
      ? "m"
      : "";
  const formerSmoker = /used to smoke|former smoker|fumaba|dej[eé] de fumar|ya no fumo/i.test(q);
  const smoke = formerSmoker
    ? ""
    : /\bno fumo|no fuma|non-?smoker|don't smoke|do not smoke|does not smoke|doesn't smoke/i.test(q)
      ? "no"
      : /\b(fumo|fuma|smoker|smokes|\bsmoke\b)\b/i.test(q)
        ? "yes"
        : "";
  return { age, sex, smoke };
}

/** Answers we can give without searching, learned from the WhatsApp tests. */
function whatsappPreparedAnswer(clientIntent, isSpanish, question) {
  const intent = clientIntent && clientIntent.intent;
  const q = String(question || "");
  if (/medicaid|medicare/i.test(q)) {
    return isSpanish
      ? "No voy a adivinar cómo afecta Medicaid o Medicare. Julie lo revisa con usted por llamada, texto o WhatsApp al 402-440-5438, o por correo a Julie@mejorvidainsurance.com."
      : "I will not guess how Medicaid or Medicare affects this. Julie reviews it by call, text, or WhatsApp at 402-440-5438, or by email at Julie@mejorvidainsurance.com.";
  }
  if (/seguro social|social security|\bssn\b|licencia de conducir|driver'?s license|fecha de nacimiento/i.test(q)) {
    return isSpanish
      ? "No envíe por WhatsApp su número de seguro social, su licencia ni su fecha de nacimiento. Para orientar una cotización basta la edad. ¿Cuántos años tiene?"
      : "Do not send a Social Security number, driver's license, or date of birth on WhatsApp. Age is enough to start a quote. How old is the person?";
  }
  if (intent === "other" && /muri[oó]|falleci[oó]|\bdied\b|passed away/i.test(q) && /dinero|pagar|funeral|entierro|pay|burial/i.test(q)) {
    return isSpanish
      ? "Lamento su pérdida. Un seguro nuevo no paga un funeral que ya está en curso si no había una póliza. Julie le escribe por aquí para orientarle."
      : "I am sorry for your loss. A new policy does not pay a funeral already under way if there was no policy. Julie will write you here to help you sort it out.";
  }
  if ((intent === "quote" || intent === "other") && mentionsUnlicensedState(q) && !mentionsLicensedState(q)) {
    return isSpanish
      ? "Julie confirma si puede ayudarle en su estado. Las licencias vigentes están en https://www.mejorvidainsurance.com/licencias.html."
      : "Julie confirms whether she can help in your state. Current licenses are at https://www.mejorvidainsurance.com/en/licenses.html.";
  }
  if (intent === "other" && /\bscam\b|estafa|fraude/i.test(q)) {
    return isSpanish
      ? "No. Este chat es de Mejor Vida Seguros. Julie Braunsroth, NPN 21695431, atiende al 402-440-5438 y en Julie@mejorvidainsurance.com. Puede verificar la licencia en https://www.mejorvidainsurance.com/licencias.html."
      : "No. This chat is Mejor Vida Insurance. Julie Braunsroth, NPN 21695431, can be reached at 402-440-5438 and Julie@mejorvidainsurance.com. You can check the license at https://www.mejorvidainsurance.com/en/licenses.html.";
  }
  if (intent === "other" && /cancel/i.test(q)) {
    return isSpanish
      ? "Para cancelar, Julie necesita saber de qué compañía es la póliza. No la cancele antes de hablar con ella, porque puede quedarse sin cobertura. Llámela o escríbale al 402-440-5438."
      : "To cancel, Julie needs the company on the policy. Do not cancel before you speak with her, because you can be left without coverage. Call or text 402-440-5438.";
  }
  if (/cuenta bancaria|bank account|routing number|n[uú]mero de cuenta/i.test(q)) {
    return isSpanish
      ? "No envíe su cuenta bancaria por WhatsApp. Julie confirma la forma de pago por llamada, texto o WhatsApp al 402-440-5438."
      : "Do not send a bank account on WhatsApp. Julie confirms the payment method by call, text, or WhatsApp at 402-440-5438.";
  }
  if (intent === "contact" && /licen[cs]|npn|\blicensed\b/i.test(q)) {
    return isSpanish
      ? "Sí. Julie Braunsroth es agente de seguros licenciada, NPN 21695431. Las licencias vigentes están en https://www.mejorvidainsurance.com/licencias.html."
      : "Yes. Julie Braunsroth is a licensed insurance agent, NPN 21695431. Current licenses are at https://www.mejorvidainsurance.com/en/licenses.html.";
  }
  if (intent === "contact" && /horario|hours|qu[eé] hora|open\b/i.test(q)) {
    return isSpanish
      ? "Julie no publica un horario fijo en este chat. Puede llamarla, escribirle o usar WhatsApp al 402-440-5438, o el correo Julie@mejorvidainsurance.com."
      : "Julie does not post set hours in this chat. You can call, text, or WhatsApp 402-440-5438, or email Julie@mejorvidainsurance.com.";
  }
  if (intent === "contact" && /oficina|office|address|direcci[oó]n|d[oó]nde est/i.test(q)) {
    return isSpanish
      ? "No hay oficina abierta al público. La atención es por teléfono, texto o WhatsApp al 402-440-5438, y por correo a Julie@mejorvidainsurance.com."
      : "There is no public walk-in office. You can reach the agency by phone, text, or WhatsApp at 402-440-5438, and by email at Julie@mejorvidainsurance.com.";
  }
  if (intent === "contact" && /espa[nñ]ol|spanish|habla/i.test(q)) {
    return isSpanish
      ? "Sí. Puede escribir en español. Julie atiende por llamada, texto o WhatsApp al 402-440-5438."
      : "Yes. You can write in Spanish. Julie can be reached by call, text, or WhatsApp at 402-440-5438.";
  }
  if (intent === "contact") {
    return isSpanish
      ? "Sí. Julie atiende por llamada, texto o WhatsApp al 402-440-5438, o por correo a Julie@mejorvidainsurance.com."
      : "Yes. Julie can be reached by call, text, or WhatsApp at 402-440-5438, or by email at Julie@mejorvidainsurance.com.";
  }
  if (intent === "quote") {
    const { age, sex, smoke } = quoteFacts(q);
    const amount = q.match(/\b(\d{1,3}(?:[,.]\d{3})+|\d{4,6})\b/);
    if (age && sex && smoke) {
      return isSpanish
        ? "Gracias. Con la edad, el sexo y si fuma, Julie prepara la cotización y le escribe por aquí."
        : "Thank you. With the age, sex, and tobacco answer, Julie will prepare the quote and write you here.";
    }
    if (!age) {
      if (amount) {
        return isSpanish
          ? "Para ese monto, la cotización depende de la edad, el sexo y si fuma. No le doy un precio inventado. ¿Cuántos años tiene?"
          : "For that amount, the quote depends on age, sex, and tobacco. I will not invent a price. How old is the person?";
      }
      return isSpanish
        ? "Con gusto preparo la cotización. ¿Cuántos años tiene?"
        : "I can put the quote together. How old is the person?";
    }
    if (!sex) {
      return isSpanish ? "¿Es hombre o mujer?" : "Is the person a man or a woman?";
    }
    return isSpanish ? "¿Fuma?" : "Do they smoke?";
  }
  if (intent === "health") {
    return isSpanish
      ? "La elegibilidad depende de la salud y de la compañía. No puedo confirmarla por este mensaje. Julie lo revisa con usted por llamada, texto o WhatsApp al 402-440-5438, o por correo a Julie@mejorvidainsurance.com."
      : "Eligibility depends on the health history and the company. I cannot confirm it in this message. Julie reviews it by call, text, or WhatsApp at 402-440-5438, or by email at Julie@mejorvidainsurance.com.";
  }
  if (intent === "policy" && /suicid/i.test(q)) {
    return isSpanish
      ? "El suicidio normalmente está excluido durante un período inicial del contrato. Julie confirma qué dice esa póliza. No se puede responder con un sí o un no para todos los contratos."
      : "Suicide is normally excluded during an initial period in the contract. Julie confirms what that policy says. It cannot be answered yes or no for every contract.";
  }
  if (intent === "policy" && /lote|cementerio|cemetery|plot/i.test(q)) {
    return isSpanish
      ? "El seguro paga un beneficio en efectivo al beneficiario. El lote del cementerio es una factura aparte, y casi nunca va incluido en el paquete de la funeraria."
      : "The insurance pays a cash benefit to the beneficiary. The cemetery plot is a separate bill, and it is almost never included in the funeral-home package.";
  }
  if (intent === "policy" && /how fast|qu[eé] tan r[aá]pido|cu[aá]nto tarda|when does the family/i.test(q)) {
    return isSpanish
      ? "El tiempo lo marca la compañía cuando recibe lo que el contrato pide, como el acta de defunción. Julie no promete un número de días por este mensaje."
      : "The company sets the timing after it receives what the contract requires, such as the death certificate. Julie does not promise a number of days in this message.";
  }
  if (intent === "policy" && /funeraria o mi familia|who gets|familia recibe|beneficiario recibe|paid to the funeral/i.test(q) || (intent === "policy" && /dinero lo recibe|family get the money|gets the money/i.test(q))) {
    return isSpanish
      ? "El beneficio se paga en efectivo a la persona beneficiaria, no directamente a la funeraria. La familia decide cómo usarlo. El tiempo lo marca la compañía cuando recibe lo que el contrato pide. Julie no promete un número de días por este mensaje."
      : "The benefit is paid in cash to the beneficiary, not directly to the funeral home. The family decides how to use it. The company sets the timing after it receives what the contract requires. Julie does not promise a number of days in this message.";
  }
  if (intent === "policy" && /examen m[eé]dico|medical exam|no exam|sin examen/i.test(q)) {
    return isSpanish
      ? "Varios planes de gastos finales no piden examen médico si la persona califica. Sí hay preguntas de salud. No es una aprobación automática. Julie confirma cuál aplica."
      : "Several final expense plans do not require a medical exam if the person qualifies. There are still health questions. It is not automatic approval. Julie confirms which plan applies.";
  }
  if (intent === "policy" && /guaranteed issue|aceptaci[oó]n garantizada|garantizado/i.test(q)) {
    return isSpanish
      ? "Algunas compañías tienen un plan de aceptación garantizada, con pocas o ninguna pregunta de salud. Ese plan normalmente limita el pago por muerte natural durante los primeros dos años. No es lo mismo que un plan nivelado. Julie confirma si hay uno para la edad."
      : "Some companies have a guaranteed-issue plan, with few or no health questions. That plan normally limits the payment for natural death during the first two years. It is not the same as a level plan. Julie confirms whether one is available for the age.";
  }
  if (intent === "policy" && /cash value|valor en efectivo|valor de rescate/i.test(q)) {
    return isSpanish
      ? "El seguro de gastos finales suele ser vida entera y puede tener un valor en efectivo pequeño. No está pensado como ahorro. El pago principal es el beneficio por fallecimiento. Julie confirma el contrato."
      : "Final expense is usually whole life and can have a small cash value. It is not meant as a savings plan. The main payment is the death benefit. Julie confirms the contract.";
  }
  if (intent === "policy" && /once a year|al a[nñ]o|anualmente|annually|pago anual/i.test(q)) {
    return isSpanish
      ? "La forma de pago depende de la compañía. Julie lo confirma. No le doy un precio por este mensaje."
      : "The payment schedule depends on the company. Julie confirms it. I will not give you a price in this message.";
  }
  if (intent === "policy" && /replace|reemplaz|cambiar mi p[oó]liza|old policy/i.test(q)) {
    return isSpanish
      ? "No cancele la póliza actual hasta que la nueva esté aprobada. Julie revisa la que tiene."
      : "Do not cancel the current policy until a new one is approved. Julie can review the one you have.";
  }
  if (intent === "policy" && /colonial penn|colonial\b/i.test(q)) {
    return isSpanish
      ? "No voy a decir que una póliza es mejor sin ver el contrato. Si ya tiene una póliza, no la cancele hasta que la nueva esté aprobada. Julie puede revisar la que tiene."
      : "I will not say one policy is better without seeing the contract. If you already have a policy, do not cancel it until a new one is approved. Julie can review the one you have.";
  }
  if (intent === "policy" && /nivelad|escalonad|\bgraded\b|level plan|per[ií]odo de espera|waiting period/i.test(q)) {
    return isSpanish
      ? "Un plan nivelado paga el beneficio completo desde el día 1 si la compañía lo aprueba, salvo las exclusiones del contrato, como el suicidio en un período inicial. Un plan escalonado limita el pago por muerte natural durante los primeros dos años. La muerte accidental normalmente se paga completa. Julie confirma cuál contrato aplica."
      : "A level plan pays the full benefit from day one if the company approves it, except for contract exclusions such as suicide in an initial period. A graded plan limits the payment for natural death during the first two years. Accidental death is normally paid in full. Julie confirms which contract applies.";
  }
  if (intent === "policy" && /beneficiari|beneficiary/i.test(q)) {
    if (/hija|daughter|hijo|\bson\b|esposo|husband|esposa|\bwife\b|hermano|hermana|brother|sister/i.test(q)) {
      return isSpanish
        ? "Sí. Puede nombrar a esa persona como beneficiario, y puede cambiarla mientras la póliza esté vigente. Julie confirma lo que permite el contrato."
        : "Yes. You can name that person as the beneficiary, and you can change them while the policy is in force. Julie confirms what the contract allows.";
    }
    return isSpanish
      ? "Usted puede nombrar a una persona de confianza como beneficiario, y puede cambiarla mientras la póliza esté vigente. Julie confirma lo que permite el contrato."
      : "You can name a person you trust as the beneficiary, and you can change that person while the policy is in force. Julie confirms what the contract allows.";
  }
  if (intent === "policy" && /t[eé]rmino|\bterm\b/i.test(q)) {
    return isSpanish
      ? "Sí. Mejor Vida Seguros compara seguro a término y seguro de gastos finales. El término cubre un plazo y después termina. Los gastos finales son vida entera de monto más bajo, pensada para el funeral. ¿Busca cubrir un funeral, o ingresos por un plazo?"
      : "Yes. Mejor Vida Insurance compares term life and final expense. Term covers a set period and then ends. Final expense is smaller whole life meant for the funeral. Are you covering a funeral, or income for a set period?";
  }
  if (intent === "policy" && /mutual of omaha|aetna|assurity|transamerica|american amicable|corebridge|americo/i.test(q)) {
    return isSpanish
      ? "Mejor Vida Seguros compara opciones de varias compañías, entre ellas la que usted nombró. Julie confirma cuál está disponible para usted."
      : "Mejor Vida Insurance compares options from several companies, including the one you named. Julie confirms which one is available for you.";
  }
  if (intent === "what_we_sell") {
    if (/cremaci[oó]n|cremation/i.test(q)) {
      return isSpanish
        ? "El seguro de gastos finales paga efectivo al beneficiario. Sirve para cremación o para entierro. No somos una funeraria. Si quiere una cotización, ¿cuántos años tiene?"
        : "Final expense insurance pays cash to the beneficiary. It can be used for cremation or burial. We are not a funeral home. For a quote, how old is the person?";
    }
    return isSpanish
      ? "Vendemos seguro de gastos finales. Cubre los gastos del entierro o del funeral, para que la familia no los pague de su bolsillo. No somos una funeraria. Si quiere una cotización, ¿cuántos años tiene?"
      : "We sell final expense insurance. It covers burial or funeral costs so the family does not pay them out of pocket. We are not a funeral home. For a quote, how old is the person?";
  }
  return null;
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
  const out = await runRagPipelineCore(body, opts);
  if (!out || out.answer == null) return out;
  const isSpanish =
    isSpanishLanguageHint(String(body.lang || body.language || "")) ||
    messageLooksSpanish(body.question);
  out.answer = withoutPrices(out.answer, isSpanish);
  return out;
}

async function runRagPipelineCore(body, opts) {
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

  const isFacebookComment = String(flowStage || "") === "facebook_comment";
  const strictAnswer = !!(opts && opts.strictAnswer);
  let clientIntent = null;
  if (strictAnswer) {
    const judged = await classifyClientIntent(openaiKey, question);
    clientIntent = judged;
    usageBase.openai_calls += 1;
    usageBase.openai_chat_prompt_tokens = (usageBase.openai_chat_prompt_tokens || 0) + (judged.usage.prompt_tokens || 0);
    usageBase.openai_chat_completion_tokens =
      (usageBase.openai_chat_completion_tokens || 0) + (judged.usage.completion_tokens || 0);
    usageBase.openai_chat_total_tokens = (usageBase.openai_chat_total_tokens || 0) + (judged.usage.total_tokens || 0);
    if (!judged.clear) {
      try {
        await insertUnansweredQuestion(supabaseUrl, supabaseKey, {
          lead_id: leadId,
          phone: phone || null,
          question,
          language,
          flow_stage: flowStage,
          resolved: false,
        });
      } catch (e) {
        console.error("rag-pipeline save unanswered", e.message);
      }
      await hubspotOptionalNote(
        hubspotToken,
        phone,
        `${notePrefix} — intent was not clear. The bot did not guess.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
      );
      usageBase.outcome = "strict_unclear_intent";
      logRagUsage(usageBase);
      try {
        await emailJulieToReply({
          phone,
          name: body.full_name || body.name || [body.first_name, body.last_name].filter(Boolean).join(" "),
          question,
          reason: "The message was not clear enough to answer.",
        });
      } catch (e) {
        console.error("rag-pipeline julie notify", String(e && e.message || e).slice(0, 200));
      }
      return {
        answer: whatsappHandoff(isSpanishLanguageHint(language) || messageLooksSpanish(question)),
        status: "answered",
        handoff: true,
        usage: usageBase,
      };
    }
    const prepared = whatsappPreparedAnswer(
      clientIntent,
      isSpanishLanguageHint(language) || messageLooksSpanish(question),
      question
    );
    if (prepared) {
      usageBase.outcome = "strict_" + clientIntent.intent;
      logRagUsage(usageBase);
      return { answer: prepared, status: "answered", usage: usageBase };
    }
  }
  const skipWebsiteCanned = isFacebookComment || strictAnswer;

  const isSpanishLangEarly =
    isSpanishLanguageHint(String(body.language || "").trim()) ||
    isSpanishLanguageHint(language) ||
    ["es", "spanish", "Spanish", "ES"].includes(String(language || "").trim()) ||
    String(language || "").toLowerCase().startsWith("es");
  const questionLooksSpanishEarly =
    /[áéíóúüñ¿¡]/i.test(question) ||
    /\b(para |una |del |también|tengo |puedo |cuál |cómo |dónde |qué |quien )\b/i.test(question);
  if (!skipWebsiteCanned && isWhoIsJulieQuestion(question)) {
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
  if (!skipWebsiteCanned) {
    const factAnswer = publicFactAnswer(question, isSpanishLangEarly || questionLooksSpanishEarly);
    if (factAnswer) {
      usageBase.outcome = "public_fact";
      logRagUsage(usageBase);
      return { answer: factAnswer, status: "answered", usage: usageBase };
    }
  }
  if (!skipWebsiteCanned) {
    const funeralAnswer = answerFuneralCostQuestion(question, {
      isSpanish: isSpanishLangEarly || questionLooksSpanishEarly,
      conversationContext,
    });
    if (funeralAnswer) {
      usageBase.outcome = "funeral_no_price";
      logRagUsage(usageBase);
      return {
        answer: generalPriceRefusal(isSpanishLangEarly || questionLooksSpanishEarly),
        status: "answered",
        usage: usageBase,
      };
    }
  }
  if (!skipWebsiteCanned && isLicensedStatesQuestion(question)) {
    const answer = licensedStatesAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "licensed_states";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (!skipWebsiteCanned && isAgeCarrierFitQuestion(question)) {
    const age = extractApplicantAge(question);
    const answer = ageCarrierFitAnswer(age, isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "age_carrier_fit";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  // Multi-carrier / "which companies" before single-product shortcuts
  if (!skipWebsiteCanned && isCarriersQuestion(question)) {
    const answer = carriersAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "carriers_list";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (!skipWebsiteCanned && isAssurityFinalExpenseQuestion(question)) {
    const answer = assurityFinalExpenseAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "assurity_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (!skipWebsiteCanned && isCorebridgeTermOrGulQuestion(question)) {
    const answer = corebridgeTermOrGulAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "corebridge_term_gul";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (!skipWebsiteCanned && isCorebridgeFinalExpenseQuestion(question)) {
    const answer = corebridgeFinalExpenseAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "corebridge_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (!skipWebsiteCanned && isMutualOfOmahaProductQuestion(question)) {
    const answer = mutualOfOmahaProductAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "moo_living_promise";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (!skipWebsiteCanned && isAmericanAmicableProductQuestion(question)) {
    const answer = americanAmicableProductAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "amam_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (!skipWebsiteCanned && isTransamericaProductQuestion(question)) {
    const answer = transamericaProductAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "transamerica_fe_products";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  if (!skipWebsiteCanned && isAetnaProductQuestion(question)) {
    const answer = aetnaProductAnswer(question, isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "aetna_fe_products";
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
  if (!skipFaqHealth && !skipFaqForSpanish && !shouldSkipFaqLookup(question) && !isFacebookComment) {
    try {
      const faqResults = await rpcMatchFaqs(supabaseUrl, supabaseKey, embedding, language, 1, 0.75);
      faqMatch = faqResults && faqResults.length > 0 ? faqResults[0] : null;
    } catch (e) {
      console.error("rag-pipeline faq search", e.message);
      // Don't fail; just skip FAQ tier and go to knowledge chunks
    }
  }

  if (!strictAnswer && faqMatch && faqMatch.answer) {
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
      // Never paste a funeral-home directory this way, and never on WhatsApp — that path guesses.
      if (
        !strictAnswer &&
        !isFacebookComment &&
        !skipFaqHealth &&
        spanishChunks.length > 0 &&
        !isFuneralDirectoryChunk(spanishChunks[0]) &&
        !/ciudades del directorio|directorio de funerarias|funeral home directory/i.test(String(spanishChunks[0].content || "")) &&
        (Number(spanishChunks[0].similarity) || 0) > 0.72
      ) {
        const topChunk = spanishChunks[0];
        let directAnswer = String(topChunk.content || topChunk.answer || "").trim();
        const answerMatch = directAnswer.match(/(?:answer|respuesta):\s*([\s\S]+)/i);
        if (answerMatch) directAnswer = answerMatch[1].trim();
        if (directAnswer && !/^NO_ANSWER$/i.test(directAnswer)) {
          usageBase.supabase_match_rpc_calls = 1;
          usageBase.knowledge_chunks_returned = spanishChunks.length;
          let answerText = applyKnowledgeAnswerPostProcess(question, directAnswer, isSpanishQuery, skipFaqHealth, {
            publicFacebook: isFacebookComment,
          });
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
    if (strictAnswer && !intentAllowsFuneralDirectory(clientIntent) && chunks && chunks.length) {
      chunks = chunks.filter((c) => !isFuneralDirectoryChunk(c));
    }
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

  const similarityFloor = strictAnswer && clientIntent && clientIntent.intent === "policy" ? 0.48 : 0.55;
  if (strictAnswer && chunks && chunks.length && (Number(chunks[0].similarity) || 0) < similarityFloor) {
    chunks = [];
  }

  if (!chunks || !chunks.length) {
    if (strictAnswer) {
      try {
        await insertUnansweredQuestion(supabaseUrl, supabaseKey, row);
      } catch (e) {
        console.error("rag-pipeline save unanswered", e.message);
      }
      await hubspotOptionalNote(
        hubspotToken,
        phone,
        `${notePrefix} — held for a person. The bot did not guess.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
      );
      usageBase.outcome = "strict_no_answer";
      logRagUsage(usageBase);
      try {
        await emailJulieToReply({
          phone,
          name: body.full_name || body.name || [body.first_name, body.last_name].filter(Boolean).join(" "),
          question,
          reason: "The question was clear, but there was not a sure answer.",
        });
      } catch (e) {
        console.error("rag-pipeline julie notify", String(e && e.message || e).slice(0, 200));
      }
      return { answer: whatsappHandoff(isSpanishQuery), status: "answered", handoff: true, usage: usageBase };
    }
    if (skipFaqHealth) {
      usageBase.outcome = "health_deferral_no_chunks";
      logRagUsage(usageBase);
      return { answer: isFacebookComment ? publicHealthEligibilityDeferralLine(isSpanishQuery ? "es" : "en") : healthEligibilityDeferralLine(isSpanishQuery ? "es" : "en"), status: "answered", usage: usageBase };
    }
    try {
      await insertUnansweredQuestion(supabaseUrl, supabaseKey, row);
    } catch (e) {
      console.error("rag-pipeline save unanswered", e.message);
    }
    await hubspotOptionalNote(
      hubspotToken,
      phone,
      `${notePrefix} — no grounded answer (clarify fallback).\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
    );
    let clarifyText = staticClarifyingFallback(isSpanishQuery, { audience: isFacebookComment ? "facebook_comment" : undefined });
    try {
      const clarifyOut = await getClarifyingFallback(openaiKey, question, language, {
        conversationContext,
        audience: isFacebookComment ? "facebook_comment" : undefined,
      });
      if (clarifyOut && clarifyOut.text) {
        clarifyText = clarifyOut.text;
        usageBase.openai_chat_prompt_tokens =
          (usageBase.openai_chat_prompt_tokens || 0) + (clarifyOut.usage.prompt_tokens || 0);
        usageBase.openai_chat_completion_tokens =
          (usageBase.openai_chat_completion_tokens || 0) + (clarifyOut.usage.completion_tokens || 0);
        usageBase.openai_chat_total_tokens =
          (usageBase.openai_chat_total_tokens || 0) + (clarifyOut.usage.total_tokens || 0);
        usageBase.openai_calls += 1;
      }
    } catch (e) {
      console.warn("rag-pipeline clarify fallback", e && e.message);
    }
    usageBase.outcome = "clarify_no_chunks";
    logRagUsage(usageBase);
    return { answer: clarifyText, status: "answered", usage: usageBase };
  }

  let answerText;
  try {
    const llmQuestion = isSpanishQuery
      ? `[IMPORTANT: Respond ENTIRELY in Spanish. Do not use English.]\n\n${question}`
      : question;
    const chatOut = await getRAGAnswer(openaiKey, llmQuestion, chunks, language, {
      conversationContext,
      strictAnswer,
      clientIntent: clientIntent && clientIntent.intent,
      audience: isFacebookComment ? "facebook_comment" : undefined,
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

  answerText = applyKnowledgeAnswerPostProcess(question, answerText, isSpanishQuery, skipFaqHealth, {
    publicFacebook: isFacebookComment,
  });

  const directoryDump =
    strictAnswer &&
    !intentAllowsFuneralDirectory(clientIntent) &&
    /Directorio de funerarias:|Funeral home directory:/i.test(answerText || "");
  if (!answerText || /^NO_ANSWER$/i.test(String(answerText).trim()) || directoryDump) {
    if (strictAnswer) {
      try {
        await insertUnansweredQuestion(supabaseUrl, supabaseKey, row);
      } catch (e) {
        console.error("rag-pipeline save unanswered", e.message);
      }
      await hubspotOptionalNote(
        hubspotToken,
        phone,
        `${notePrefix} — held for a person. The bot did not guess.\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
      );
      usageBase.outcome = "strict_no_answer";
      logRagUsage(usageBase);
      try {
        await emailJulieToReply({
          phone,
          name: body.full_name || body.name || [body.first_name, body.last_name].filter(Boolean).join(" "),
          question,
          reason: "The question was clear, but there was not a sure answer.",
        });
      } catch (e) {
        console.error("rag-pipeline julie notify", String(e && e.message || e).slice(0, 200));
      }
      return { answer: whatsappHandoff(isSpanishQuery), status: "answered", handoff: true, usage: usageBase };
    }
    if (skipFaqHealth) {
      usageBase.outcome = "health_deferral_no_answer";
      logRagUsage(usageBase);
      return { answer: isFacebookComment ? publicHealthEligibilityDeferralLine(isSpanishQuery ? "es" : "en") : healthEligibilityDeferralLine(isSpanishQuery ? "es" : "en"), status: "answered", usage: usageBase };
    }
    try {
      await insertUnansweredQuestion(supabaseUrl, supabaseKey, row);
    } catch (e) {
      console.error("rag-pipeline save unanswered", e.message);
    }
    await hubspotOptionalNote(
      hubspotToken,
      phone,
      `${notePrefix} — NO_ANSWER (clarify fallback).\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
    );
    let clarifyText = staticClarifyingFallback(isSpanishQuery, { audience: isFacebookComment ? "facebook_comment" : undefined });
    try {
      const clarifyOut = await getClarifyingFallback(openaiKey, question, language, {
        conversationContext,
        audience: isFacebookComment ? "facebook_comment" : undefined,
      });
      if (clarifyOut && clarifyOut.text) {
        clarifyText = clarifyOut.text;
        usageBase.openai_chat_prompt_tokens =
          (usageBase.openai_chat_prompt_tokens || 0) + (clarifyOut.usage.prompt_tokens || 0);
        usageBase.openai_chat_completion_tokens =
          (usageBase.openai_chat_completion_tokens || 0) + (clarifyOut.usage.completion_tokens || 0);
        usageBase.openai_chat_total_tokens =
          (usageBase.openai_chat_total_tokens || 0) + (clarifyOut.usage.total_tokens || 0);
        usageBase.openai_calls += 1;
      }
    } catch (e) {
      console.warn("rag-pipeline clarify fallback", e && e.message);
    }
    usageBase.outcome = "clarify_no_answer";
    logRagUsage(usageBase);
    return { answer: clarifyText, status: "answered", usage: usageBase };
  }

  // Successfully answered: cache as FAQ for future use (async, don't block response)
  if (!strictAnswer && !skipFaqHealth && !skipFaqForSpanish && !shouldSkipFaqCachingQuestion(question) && !isFacebookComment) {
    try {
      await insertFaq(supabaseUrl, supabaseKey, question, answerText, language, embedding);
    } catch (e) {
      console.error("rag-pipeline cache faq", e.message);
      // Non-blocking; FAQ caching failure doesn't affect the response
    }
  }

  if (strictAnswer) answerText = polishWhatsappAnswer(answerText);
  usageBase.outcome = "answered";
  logRagUsage(usageBase);
  return { answer: answerText, status: "answered", usage: usageBase };
}

module.exports = {
  runRagPipeline,
  sanitizeManychatTemplateField,
  whatsappHandoff,
  whatsappPreparedAnswer,
  polishWhatsappAnswer,
};
