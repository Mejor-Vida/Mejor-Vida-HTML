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
const { generateEmbedding, getRAGAnswer, getClarifyingFallback, staticClarifyingFallback } = require("./openai");
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
    (/\bestados?\b/.test(t) &&
      /\b(julie|trabaja|atiende|licen|cubre|mejor vida)\b/.test(t) &&
      !/\b(compan|carrier|aseguradora)\b/.test(t))
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
    ? "Buena pregunta sobre Assurity. No venden un producto con la marca “gastos finales,” pero su vida entera Protect+ y Perform+ se usan mucho para planificar el funeral. La cobertura suele empezar cerca de $10,000, con suscripción simplificada (muchas personas pueden calificar sin examen médico, según edad y salud) y beneficios en vida. ¿Quieres que te explique la diferencia entre Protect+ y Perform+, o prefieres que Julie lo compare contigo al 402-440-5438?"
    : "Great question about Assurity. They don’t brand a product as “final expense,” but their Protect+ and Perform+ whole life policies are often used for funeral planning. Coverage typically starts around $10,000, with simplified underwriting (many people may qualify without a medical exam, depending on age and health) and living benefits. Want me to explain Protect+ vs Perform+, or would you rather have Julie compare options with you at 402-440-5438?";
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
    ? "Claro — Corebridge (pólizas de American General Life) tiene vida entera para gastos finales: SimpliNow Legacy® Max (beneficio nivel desde el día 1 si califica), SimpliNow escalonado (espera típica de ~2 años por muerte natural) y GIWL de aceptación garantizada sin preguntas de salud. Edades típicas 50–80, sin examen médico en estas líneas, montos desde cerca de $5,000. ¿Te interesa más el plan nivel, el escalonado o el de aceptación garantizada? Julie también te orienta al 402-440-5438."
    : "Absolutely — Corebridge (policies issued by American General Life) has final expense whole life: SimpliNow Legacy® Max (level benefit from day one if you qualify), graded SimpliNow (typical ~2-year wait for natural-cause death), and GIWL guaranteed acceptance with no health questions. Typical ages 50–80, no medical exam on these lines, coverage often from about $5,000. Curious more about level, graded, or guaranteed acceptance? Julie can walk you through it at 402-440-5438.";
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
    : "Yes — Transamerica has simplified-issue final expense: FE Express Solution℠ (full benefit from day one if you qualify; typical ages 18–85; from about $5,000), Graded FE Express, plus Immediate, 10-Pay, and Easy Solution. No medical exam for many who qualify. Want me to explain 10-Pay, or FE Express overall? Julie can confirm what applies in your state at 402-440-5438.";
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
    ? "Claro — te resumo Accendo Final Expense de forma sencilla. Edades: Nivelado ~40–89 o Modificado ~40–75. Cobertura desde ~$2,000; en Nivelado el máximo baja con la edad (por ejemplo ~$25,000 entre 76–89). Suele ser sin examen médico si califica: preguntas de salud y revisión de bases de datos (no es garantía de aprobación). Nivelado paga completo desde el día 1 si lo aprueban; Modificado limita muerte natural ~2 años. Cargo anual típico $40. Julie lo cotiza en NE, KS, CO y NV. ¿Tienes una edad o monto en mente? También puedes escribirle al 402-440-5438."
    : "Happy to break down Accendo Final Expense in plain English. Ages: Level about 40–89 or Modified about 40–75. Coverage from about $2,000; on Level the max drops with age (for example about $25,000 at 76–89). Typically no medical exam if you qualify: health questions plus a database review (not a guarantee of approval). Level pays full benefit from day one if approved; Modified limits natural-cause benefit for about 2 years. Typical $40 annual policy fee. Julie quotes it in NE, KS, CO, and NV. Do you have an age or coverage amount in mind? You can also reach her at 402-440-5438.";
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
    : "Through Aetna Senior Supplemental, Julie quotes final expense whole life: Accendo Final Expense (Level 40–89 or Modified 40–75) and Protection Series℠ (Continental Life / CLI, Level 45–89). Both are typically no-exam if you qualify, from about $2,000. This portal doesn’t include term, GUL, or IUL. Want the Accendo vs Protection Series difference, or help based on your age? Julie: 402-440-5438.";
}

/** Extract applicant age from casual EN/ES questions (incl. common typos tango→tengo). */
function extractApplicantAge(question) {
  const t = normalizeChatQuestion(question).replace(/\btango\b/g, "tengo");
  const patterns = [
    /\b(?:tengo|tango)\s+(\d{1,3})\s*(?:anos|years?|yrs?)?\b/,
    /\b(?:i am|i'm|im|soy)\s+(\d{1,3})\s*(?:anos|years?|yrs?\s*old)?\b/,
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
    /\b(compan|carrier|aseguradora|mejor|best|which|cual|que compan|what compan|para mi|for me|situacion|situation|conviene|recomien|fit|encaja)\b/.test(
      t
    ) || /\b(tengo|i am|i'm|im|soy)\b.*\b\d{2,3}\b/.test(t)
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
  const asksRelationship = /\b(work|works|working|use|uses|offer|offers|ofrecen|ofrece|ofrecer|ofrecemos|tienen|tiene|trabaja|trabajan|trabajar|compar|compare|quote|cotiz|vs|versus|against|contra)\b/.test(
    t
  );
  // Prefer carrier-list intent over "who is Julie" / licensed-states when company wording is present
  if (asksCarriers && (asksRelationship || /\b(julie|mejor vida|you|ustedes)\b/.test(t))) return true;
  // "Do you offer Mutual of Omaha and Aetna?" / "Mutual vs Aetna" — two named carriers
  if (carrierFamilyHitCount(question) >= 2 && asksRelationship) return true;
  return false;
}

function carriersAnswer(isSpanish) {
  return isSpanish
    ? "Claro — Julie compara opciones de Assurity, Mutual of Omaha, American Amicable, Corebridge y Transamerica, y también puede cotizar gastos finales de Aetna cuando encaje. ¿Te interesa alguna compañía en particular, o quieres orientación por edad? Puedes llamarla o escribirle al 402-440-5438."
    : "Sure thing — Julie compares options from Assurity, Mutual of Omaha, American Amicable, Corebridge, and Transamerica, and she can also quote Aetna final expense when it fits. Curious about a specific company, or want guidance by age? Call or text her at 402-440-5438.";
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
  if (isAgeCarrierFitQuestion(question)) {
    const age = extractApplicantAge(question);
    const answer = ageCarrierFitAnswer(age, isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "age_carrier_fit";
    logRagUsage(usageBase);
    return { answer, status: "answered", usage: usageBase };
  }
  // Multi-carrier / "which companies" before single-product shortcuts
  if (isCarriersQuestion(question)) {
    const answer = carriersAnswer(isSpanishLangEarly || questionLooksSpanishEarly);
    usageBase.outcome = "carriers_list";
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
      `${notePrefix} — no grounded answer (clarify fallback).\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
    );
    let clarifyText = staticClarifyingFallback(isSpanishQuery);
    try {
      const clarifyOut = await getClarifyingFallback(openaiKey, question, language, {
        conversationContext,
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
      `${notePrefix} — NO_ANSWER (clarify fallback).\nQ: ${question}\nStage: ${flowStage || "n/a"}`,
    );
    let clarifyText = staticClarifyingFallback(isSpanishQuery);
    try {
      const clarifyOut = await getClarifyingFallback(openaiKey, question, language, {
        conversationContext,
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
