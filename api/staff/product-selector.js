const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");
const { generateEmbedding } = require("../../lib/openai");
const { canAccessPhi } = require("../../lib/staff-permissions");
const { readPhiByLead, writePhiByLead } = require("../../lib/phi-store");
const {
  medListSignature,
  rxEscalatesModerateRisk,
  classifyMedicationsWithOpenAI,
} = require("../../lib/medication-underwriting");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));
}

async function loadSession(cfg, leadId, leadSourceTable) {
  const q = `select=*&lead_id=eq.${encodeURIComponent(leadId)}&lead_source_table=eq.${encodeURIComponent(
    leadSourceTable
  )}&limit=1`;
  const rows = await restSelect(cfg, "product_selector_sessions", q);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function saveSession(cfg, leadId, leadSourceTable, payload) {
  const existing = await loadSession(cfg, leadId, leadSourceTable);
  const now = new Date().toISOString();
  const row = {
    lead_id: leadId,
    lead_source_table: leadSourceTable,
    qualification_answers: payload.qualification_answers || {},
    risk_summary: payload.risk_summary || {},
    recommendation: payload.recommendation || {},
    confidence: payload.confidence || {},
    sales_enablement: payload.sales_enablement || {},
    workflow_state: payload.workflow_state || {},
    updated_at: now,
  };
  if (!existing) {
    const inserted = await restInsert(cfg, "product_selector_sessions", [row]);
    return Array.isArray(inserted) && inserted[0] ? inserted[0] : null;
  }
  const patched = await restPatch(
    cfg,
    "product_selector_sessions",
    `id=eq.${encodeURIComponent(existing.id)}`,
    row
  );
  return Array.isArray(patched) && patched[0] ? patched[0] : null;
}

const PERSIST_TRIM_STAGE3_MAX_MSGS = 100;
const PERSIST_TRIM_CHAT_CONTENT = 6000;

/** Shrink stage-3 transcript for Supabase/PostgREST limits; clears back-stack (lengths no longer valid). */
function shrinkWorkflowStateForPersist(workflowState) {
  const ws = workflowState && typeof workflowState === "object" ? workflowState : {};
  const chat = Array.isArray(ws.stage3_chat) ? ws.stage3_chat : [];
  if (!chat.length) return ws;
  const slimChat = chat.slice(-PERSIST_TRIM_STAGE3_MAX_MSGS).map((m) => {
    if (!m || typeof m !== "object") return m;
    const c = m.content != null ? String(m.content) : "";
    if (c.length <= PERSIST_TRIM_CHAT_CONTENT) return m;
    return Object.assign({}, m, {
      content: c.slice(0, PERSIST_TRIM_CHAT_CONTENT) + "\n…(truncated for storage)",
    });
  });
  return Object.assign({}, ws, {
    stage3_chat: slimChat,
    selector_step_stack: [],
  });
}

async function saveSessionWithTranscriptFallback(cfg, leadId, leadSourceTable, payload) {
  try {
    return await saveSession(cfg, leadId, leadSourceTable, payload);
  } catch (firstErr) {
    const ws = payload.workflow_state;
    const chat = ws && Array.isArray(ws.stage3_chat) ? ws.stage3_chat : [];
    if (chat.length < 24) throw firstErr;
    console.error("product-selector saveSession failed; retrying with trimmed stage3_chat", firstErr && firstErr.message);
    const shrunk = shrinkWorkflowStateForPersist(ws);
    Object.assign(ws, shrunk);
    return await saveSession(cfg, leadId, leadSourceTable, payload);
  }
}

function bool(v) {
  return !!v;
}

const PHI_FIELD_KEYS = [
  "health_none_reported",
  "terminal_illness",
  "aids_hiv",
  "organ_transplant",
  "heart_event_recent",
  "heart_event_date",
  "heart_event_type",
  "heart_attack_history",
  "congestive_heart_failure",
  "cancer_active",
  "cancer_type",
  "cancer_treatment_status",
  "cancer_history",
  "cancer_history_type",
  "copd_diagnosed",
  "oxygen_use",
  "dementia_cognitive",
  "takes_prescription_medications",
  "has_major_conditions",
  "diabetes",
  "diabetes_type",
  "diabetes_insulin",
  "diabetes_complications",
  "kidney_disease",
  "dialysis",
  "liver_disease",
  "neurological_condition",
  "neurological_type",
  "mental_health_hospitalized",
  "drug_alcohol_treatment",
  "nursing_home_resident",
  "wheelchair_bedridden",
  "adl_assistance",
  "hospitalized_recent",
  "hospitalization_reason",
  "awaiting_surgery",
  "undiagnosed_symptoms",
  "atrial_fibrillation",
  "afib_controlled",
  "pacemaker",
  "blood_thinner_use",
  "coronary_artery_disease",
  "stents_placed",
  "stents_recent",
  "high_blood_pressure",
  "bp_controlled",
  "cholesterol_high",
  "cholesterol_medication",
  "cholesterol_controlled",
  "sleep_apnea",
  "cpap_use",
  "depression",
  "depression_treated",
  "anxiety",
  "anxiety_treated",
  "doctor_visits_2y",
  "current_medications",
  "medication_count",
  "medication_uw_classification",
  "height_inches",
  "weight_lbs",
  "bmi",
];

const LEGACY_PHI_ALIASES = {
  prescription_meds: "takes_prescription_medications",
  hospitalized_5y: "hospitalized_recent",
  cognitive_impairment: "dementia_cognitive",
  alzheimers_dementia_memory_condition: "dementia_cognitive",
};

const COVERAGE_GOAL_QUESTION =
  "Why are they looking into life insurance or final expense coverage right now?";
const COVERAGE_GOAL_LABELS = {
  final_expenses: "Final expenses",
  income_replacement: "Income replacement",
  mortgage_protection: "Mortgage protection",
  debt_protection: "Debt protection",
  legacy_planning: "Legacy planning",
  business_continuity: "Business continuity",
  children_coverage: "Children coverage",
  not_sure: "Not sure",
};
const COVERAGE_GOAL_DEFINITIONS = {
  final_expenses: [
    "funeral",
    "burial",
    "cremation",
    "final bills",
    "end-of-life costs",
    "end of life costs",
    "family not paying",
  ],
  income_replacement: [
    "replace income",
    "income",
    "without my income",
    "survive without my income",
    "wife",
    "husband",
    "spouse",
    "kids",
    "children",
    "family",
    "survive",
    "protect spouse",
    "protect kids",
    "living expenses",
    "paycheck replacement",
  ],
  mortgage_protection: ["mortgage", "house payment", "pay off home loan"],
  debt_protection: ["credit cards", "loans", "medical bills", "debts"],
  legacy_planning: ["leave money", "inheritance", "gift to family", "legacy"],
  business_continuity: ["business partner", "key person", "business loan", "buy-sell", "buy sell"],
  children_coverage: ["child", "children", "kid", "kids", "juvenile", "baby"],
  not_sure: ["unsure", "confused", "wants guidance", "does not know what they need", "not sure"],
};

/** Short client-facing labels for the guided chat (no internal field names). */
const COVERAGE_GOAL_CLIENT_DESCRIPTIONS = {
  final_expenses: "Funeral and burial costs",
  income_replacement: "Replace lost income",
  mortgage_protection: "Pay off mortgage",
  debt_protection: "Pay off debts",
  legacy_planning: "Leave inheritance behind",
  business_continuity: "Protect the business",
  children_coverage: "Coverage for children",
  not_sure: "Still figuring it out",
};

/** Insurance / product lane shown in parentheses next to each goal example. */
const COVERAGE_GOAL_INSURANCE_TYPE_LABEL = {
  final_expenses: "Final expense",
  income_replacement: "Term life",
  mortgage_protection: "Mortgage term life",
  debt_protection: "Term life",
  legacy_planning: "Permanent life",
  business_continuity: "Business life",
  children_coverage: "Juvenile life",
  not_sure: "Type TBD",
};

/** Replaced in staff UI with a product-column goal table (must match staff sentinel). */
const PS_GOAL_TABLE_SENTINEL = "<<<PS_COVERAGE_GOAL_TABLE>>>";

function normalizeSimpleText(raw) {
  return String(raw || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBudgetClass(raw) {
  const t = normalizeSimpleText(raw);
  if (!t) return "";
  if (/(not sure|unsure|dont know|don't know|tbd|flexible|whatever works|depends)/.test(t)) return "not_sure";
  if (/(as low as possible|cheapest|smallest payment|lowest payment|minimal premium)/.test(t)) return "under_50";
  const n = Number(String(raw || "").replace(/[^0-9.]/g, ""));
  if (Number.isFinite(n) && n > 0) {
    if (n < 50) return "under_50";
    if (n <= 100) return "50_100";
    if (n <= 200) return "100_200";
    return "200_plus";
  }
  if (/(under 50|below 50|less than 50|under fifty|under_50|< ?50)/.test(t)) return "under_50";
  if (/(50 ?- ?100|50_100|between 50 and 100|50 to 100|50 thru 100|50 through 100|fifty to one hundred)/.test(t))
    return "50_100";
  if (/(100 ?- ?200|100_200|between 100 and 200|100 to 200|100 thru 200|100 through 200)/.test(t)) return "100_200";
  if (/(200\+|200 plus|over 200|above 200|200_plus|two hundred or more)/.test(t)) return "200_plus";
  return "";
}

/** Goal-dependent priority menus (internal `priority_type` values). */
const PRIORITY_MENU_PROFILES = {
  final_expenses: {
    headline:
      "What matters most — keeping the payment low, getting approved easily, or having full coverage from day one?",
    lines: [
      { n: 1, label: "Keeping the payment low", type: "lowest_monthly_cost" },
      { n: 2, label: "Getting approved easily", type: "easiest_approval" },
      { n: 3, label: "Full coverage from day one", type: "immediate_full_coverage" },
    ],
  },
  term_pack: {
    headline: "What matters most — lowest cost, highest coverage, or covering a specific time period?",
    lines: [
      { n: 1, label: "Lowest cost", type: "lowest_monthly_cost" },
      { n: 2, label: "Highest coverage", type: "highest_coverage" },
      { n: 3, label: "Covering a specific time period", type: "duration_specific" },
    ],
  },
  mortgage_protection: {
    headline: "Is the goal to fully pay off the mortgage or cover monthly payments?",
    lines: [
      { n: 1, label: "Fully pay off the mortgage", type: "mortgage_full_payoff" },
      { n: 2, label: "Cover monthly mortgage payments", type: "mortgage_monthly_payment" },
      { n: 3, label: "Lowest monthly premium on the policy", type: "lowest_monthly_cost" },
    ],
  },
  income_replacement: {
    headline: "What matters most — replacing income as long as possible or keeping costs lower?",
    lines: [
      { n: 1, label: "Replace income as long as possible", type: "income_longest_protection" },
      { n: 2, label: "Keep costs lower", type: "lowest_monthly_cost" },
    ],
  },
  legacy_planning: {
    headline: "What matters most for this legacy plan?",
    lines: [
      { n: 1, label: "Cash value growth", type: "cash_value_growth" },
      { n: 2, label: "Permanent coverage focus", type: "permanent_coverage" },
    ],
  },
};

const ALL_PRIORITY_TYPE_VALUES = Array.from(
  new Set(
    Object.values(PRIORITY_MENU_PROFILES).flatMap((prof) => (prof.lines || []).map((L) => L.type)),
  ),
);

function priorityMenuProfileKey(coverageGoal) {
  const g = String(coverageGoal || "").trim();
  if (g === "mortgage_protection") return "mortgage_protection";
  if (g === "income_replacement") return "income_replacement";
  if (g === "legacy_planning") return "legacy_planning";
  if (g === "debt_protection" || g === "business_continuity") return "term_pack";
  return "final_expenses";
}

function priorityMenuProfile(coverageGoal) {
  return PRIORITY_MENU_PROFILES[priorityMenuProfileKey(coverageGoal)] || PRIORITY_MENU_PROFILES.final_expenses;
}

function allowedPriorityTypesForGoal(coverageGoal) {
  return (priorityMenuProfile(coverageGoal).lines || []).map((L) => L.type);
}

function buildPriorityTypePrompt(coverageGoal) {
  const def = priorityMenuProfile(coverageGoal);
  const numbered = (def.lines || []).map((L) => `${L.n}. ${L.label}`).join("\n\n");
  const maxN = (def.lines || []).reduce((m, L) => Math.max(m, L.n), 0);
  return [
    def.headline,
    "",
    numbered,
    "",
    maxN ? `Reply with 1–${maxN}, or describe in your own words.` : "Describe in your own words.",
  ].join("\n");
}

function priorityTypeFromListNumber(raw, coverageGoal) {
  const def = priorityMenuProfile(coverageGoal);
  const t = String(raw || "")
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  if (!/^\d+$/.test(t)) return "";
  const n = parseInt(t, 10);
  const row = (def.lines || []).find((L) => L.n === n);
  return row ? row.type : "";
}

function mapPriorityTypeToStrategyPriority(pt) {
  if (pt === "lowest_monthly_cost") return "lowest_cost";
  if (pt === "easiest_approval") return "approval_certainty";
  if (pt === "immediate_full_coverage") return "immediate_coverage";
  if (pt === "permanent_coverage") return "permanent_coverage";
  if (pt === "cash_value_growth") return "cash_value_growth";
  if (pt === "mortgage_full_payoff") return "immediate_coverage";
  if (pt === "mortgage_monthly_payment") return "lowest_cost";
  if (pt === "highest_coverage") return "immediate_coverage";
  if (pt === "duration_specific") return "lowest_cost";
  if (pt === "income_longest_protection") return "permanent_coverage";
  if (pt === "larger_death_benefit") return "immediate_coverage";
  return "lowest_cost";
}

/** Same order as Lead Profile → Monthly Budget ($) (`lp-monthly-budget`), plus Not sure. */
const BUDGET_MONTHLY_MENU = (function () {
  const amounts = [30, 60, 100, 150, 200, 300, 400, 500, 600, 1000];
  const rows = amounts.map((a) => {
    const s = String(a);
    return { monthly: s, klass: normalizeBudgetClass(s) };
  });
  rows.push({ monthly: "", klass: "not_sure" });
  return rows;
})();

/** Replaced in staff UI with a horizontal budget chart (must match staff sentinel). */
const PS_BUDGET_CHART_SENTINEL = "<<<PS_BUDGET_AMOUNT_ROW>>>";

const BUDGET_CLASS_PROMPT = [
  "What monthly budget feels comfortable for the client?",
  "",
  "Typical monthly amounts:",
  "",
  PS_BUDGET_CHART_SENTINEL,
  "",
  `Reply with 1–${BUDGET_MONTHLY_MENU.length} to pick that column, a dollar amount (for example 75), or describe in your own words.`,
].join("\n");

function budgetMenuPickFromListNumber(raw) {
  const t = String(raw || "")
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  if (!/^\d+$/.test(t)) return null;
  const n = parseInt(t, 10);
  if (n < 1 || n > BUDGET_MONTHLY_MENU.length) return null;
  const row = BUDGET_MONTHLY_MENU[n - 1];
  return { budget_class: row.klass, budget_monthly: row.monthly };
}

/** Replaced in staff UI with a horizontal coverage chart (must match staff sentinel). */
const PS_COVERAGE_CHART_SENTINEL = "<<<PS_COVERAGE_AMOUNT_ROW>>>";

/** Same order as the coverage chart / Lead Profile #lp-desired-coverage (1–12). */
const COVERAGE_AMOUNT_MENU_VALUES = [
  "5000",
  "10000",
  "15000",
  "20000",
  "100000",
  "200000",
  "500000",
  "750000",
  "1000000",
  "1500000",
  "2000000",
  "custom",
];

function coverageMenuPickFromListNumber(raw) {
  const t = String(raw || "")
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  if (!/^\d+$/.test(t)) return "";
  const n = parseInt(t, 10);
  if (n < 1 || n > COVERAGE_AMOUNT_MENU_VALUES.length) return "";
  return COVERAGE_AMOUNT_MENU_VALUES[n - 1] || "";
}

const NORMALIZED_COVERAGE_TARGET_PROMPT = [
  "About how much coverage are they thinking?",
  "",
  PS_COVERAGE_CHART_SENTINEL,
  "",
  `Reply with 1–${COVERAGE_AMOUNT_MENU_VALUES.length} to pick that column, type an amount in your own words, or say not sure.`,
].join("\n");

const PS_MAJOR_CONDITIONS_TABLE_SENTINEL = "<<<PS_MAJOR_CONDITIONS_TABLE>>>";

function classifyCoverageGoal(rawText) {
  const text = normalizeSimpleText(rawText);
  if (!text) return { goal: "not_sure", confidence: 0.2, reason: "empty" };
  const scores = {};
  Object.keys(COVERAGE_GOAL_DEFINITIONS).forEach((goal) => {
    const phrases = COVERAGE_GOAL_DEFINITIONS[goal] || [];
    let score = 0;
    phrases.forEach((p) => {
      const phrase = normalizeSimpleText(p);
      if (!phrase) return;
      if (text.includes(phrase)) {
        score += phrase.includes(" ") ? 3 : 2;
        return;
      }
      const tokens = phrase.split(" ").filter(Boolean);
      const matched = tokens.filter((t) => t.length >= 3 && text.includes(t)).length;
      if (matched) score += matched;
    });
    scores[goal] = score;
  });
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topGoal = ranked[0] ? ranked[0][0] : "not_sure";
  const topScore = ranked[0] ? ranked[0][1] : 0;
  const secondScore = ranked[1] ? ranked[1][1] : 0;
  if (!topScore) return { goal: "not_sure", confidence: 0.25, reason: "no_match" };
  const confidence = Math.max(0.2, Math.min(0.97, topScore / (topScore + secondScore + 1)));
  return {
    goal: topGoal,
    confidence: Number(confidence.toFixed(2)),
    topScore,
    secondScore,
    reason: `top=${topScore},second=${secondScore}`,
  };
}

function isGoalConfidenceLow(result) {
  const r = result || {};
  if (r.reason === "example_list_number") return false;
  if (!r.goal || r.goal === "not_sure") return true;
  const top = Number(r.topScore || 0);
  const second = Number(r.secondScore || 0);
  if (top >= 2 && top > second) return false;
  return Number(r.confidence || 0) < 0.5;
}

function goalLabel(goalKey) {
  return COVERAGE_GOAL_LABELS[String(goalKey || "")] || "Not sure";
}

function coverageGoalOrderedKeys() {
  return Object.keys(COVERAGE_GOAL_DEFINITIONS);
}

/** Map "1" … "N" to the same order as the numbered examples in the chat. */
function goalKeyFromExampleListNumber(raw) {
  const t = String(raw || "")
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  if (!/^\d+$/.test(t)) return "";
  const n = parseInt(t, 10);
  const keys = coverageGoalOrderedKeys();
  if (!Number.isFinite(n) || n < 1 || n > keys.length) return "";
  return keys[n - 1] || "";
}

function isAffirmative(raw) {
  const t = String(raw || "")
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  return /^(yes|y|yeah|yep|correct|that'?s right|right|si|sí)$/i.test(t);
}

function extractCoverageGoalOverride(raw) {
  const numKey = goalKeyFromExampleListNumber(raw);
  if (numKey) return numKey;
  const text = normalizeSimpleText(raw);
  if (!text) return "";
  const byKey = Object.keys(COVERAGE_GOAL_LABELS).find((k) => text === k || text === k.replace(/_/g, " "));
  if (byKey) return byKey;
  const byLabel = Object.keys(COVERAGE_GOAL_LABELS).find((k) => text === normalizeSimpleText(COVERAGE_GOAL_LABELS[k]));
  if (byLabel) return byLabel;
  return "";
}

function finalizeCommittedCoverageGoal(workflowState, nextNonPhi, confirmedGoal, goalNotes) {
  nextNonPhi.coverage_goal = confirmedGoal;
  nextNonPhi.intent = confirmedGoal;
  nextNonPhi.goal_notes = String(goalNotes || "").trim();
  workflowState.goal_phase = "done";
  workflowState.goal_confirmed_at = new Date().toISOString();
  workflowState.goal_candidate = "";
  workflowState.goal_confidence = null;
  workflowState.goal_raw_draft = "";
}

function assistantReplyAfterGoalSaved(confirmedGoal, nextNonPhi, nextPhi, canPhi) {
  const nkGoal = nextQuestionKey(nextNonPhi, nextPhi, canPhi);
  if (nkGoal) {
    const nqGoal = questionByKey(nkGoal);
    const nxt = nqGoal ? questionPromptForStep(nqGoal, nextNonPhi) : "";
    return {
      assistantReply: `Saved goal as ${goalLabel(confirmedGoal)}. Next:\n\n${nxt}`,
      nextQuestionText: nxt,
    };
  }
  return {
    assistantReply: `Saved goal as ${goalLabel(confirmedGoal)}. We have enough qualification data. I am generating recommendation details now.`,
    nextQuestionText: "",
  };
}

function defaultGoalQuestionPrompt() {
  const nGoals = coverageGoalOrderedKeys().length;
  return [
    `Let's start with the goal. ${COVERAGE_GOAL_QUESTION}`,
    "",
    PS_GOAL_TABLE_SENTINEL,
    "",
    `Describe the client's situation in your own words, or reply with only the list number (1–${nGoals}) to pick an example.`,
  ].join("\n");
}

function anyTrue(obj, keys) {
  const src = obj || {};
  return keys.some((k) => !!src[k]);
}

function splitIncomingAnswers(answers, canPhi) {
  const incoming = answers && typeof answers === "object" ? answers : {};
  const nonPhi = {};
  const phi = {};
  Object.keys(incoming).forEach((k) => {
    const mapped = LEGACY_PHI_ALIASES[k] || k;
    if (PHI_FIELD_KEYS.includes(mapped)) {
      if (canPhi) phi[mapped] = incoming[k];
      return;
    }
    nonPhi[mapped] = incoming[k];
  });
  return { nonPhi, phi };
}

function mergePhi(existingPhi, patchPhi) {
  return Object.assign({}, existingPhi || {}, patchPhi || {});
}

function normalizeMedicationList(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((x) => String(x || "").trim())
      .filter(Boolean)
      .filter((v, i, arr) => arr.findIndex((a) => a.toLowerCase() === v.toLowerCase()) === i);
  }
  const t = String(raw || "").trim();
  if (!t) return [];
  try {
    const parsed = JSON.parse(t);
    if (Array.isArray(parsed)) return normalizeMedicationList(parsed);
  } catch (_e) {}
  return t
    .split(",")
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.findIndex((a) => a.toLowerCase() === v.toLowerCase()) === i);
}

function normalizePhiPayload(phi) {
  const out = Object.assign({}, phi || {});
  if (Object.prototype.hasOwnProperty.call(out, "current_medications")) {
    const meds = normalizeMedicationList(out.current_medications);
    out.current_medications = meds;
    out.medication_count = meds.length;
  } else if (Object.prototype.hasOwnProperty.call(out, "medication_count")) {
    delete out.medication_count;
  }
  return out;
}

/** PHI fields imputed from compound items 1–8 (screen lines map to these; Rx is separate). */
const HEALTH_PRESCREEN_IMPUTED_KEYS = [
  "terminal_illness",
  "aids_hiv",
  "organ_transplant",
  "dialysis",
  "nursing_home_resident",
  "wheelchair_bedridden",
  "adl_assistance",
  "hospitalized_recent",
  "awaiting_surgery",
  "undiagnosed_symptoms",
];

/** After Rx: major conditions + summary gates (same order as before, minus compound split). */
const POST_RX_SCREEN_KEYS = [
  "takes_prescription_medications",
  "has_major_conditions",
  "health_disqualifier_any",
  "functional_status_any",
];

/** Legacy / severe path: full gate list without compound question key. */
const POST_PRIORITY_HEALTH_GATE_KEYS = [...HEALTH_PRESCREEN_IMPUTED_KEYS, ...POST_RX_SCREEN_KEYS];

/** When health_prescreen_overall is No: impute negatives for items 1–8 only; Rx and major-conditions asked next. */
function applyHealthPrescreenNoDerivations(phi) {
  if (!phi || typeof phi !== "object") return;
  const cleared = { health_disqualifier_any: false, functional_status_any: false };
  for (const k of HEALTH_PRESCREEN_IMPUTED_KEYS) cleared[k] = false;
  Object.assign(phi, cleared);
}

/**
 * Apply numeric picks 1–8: unset indices → false. Item 5 = nursing/wheelchair/ADL bundle → set ADL yes if picked (detail later).
 */
function applyHealthPrescreenNumberPicks(phi, pickSet) {
  if (!phi || typeof phi !== "object") return;
  const pick = pickSet instanceof Set ? pickSet : new Set(pickSet || []);
  for (const k of HEALTH_PRESCREEN_IMPUTED_KEYS) {
    phi[k] = false;
  }
  if (pick.has(1)) phi.terminal_illness = true;
  if (pick.has(2)) phi.aids_hiv = true;
  if (pick.has(3)) phi.organ_transplant = true;
  if (pick.has(4)) phi.dialysis = true;
  if (pick.has(5)) {
    phi.adl_assistance = true;
  }
  if (pick.has(6)) phi.hospitalized_recent = true;
  if (pick.has(7)) phi.awaiting_surgery = true;
  if (pick.has(8)) phi.undiagnosed_symptoms = true;
  phi.health_disqualifier_any = !!(
    phi.terminal_illness ||
    phi.aids_hiv ||
    phi.organ_transplant ||
    phi.dialysis
  );
  phi.functional_status_any = !!(phi.nursing_home_resident || phi.wheelchair_bedridden || phi.adl_assistance);
}

/** Parse compound reply: no | yes (word) | "1,3,8" style picks for items 1–8. */
function parseHealthPrescreenOverall(raw) {
  const t = String(raw || "")
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  if (!t) return { mode: "invalid" };
  const norm = normalizeSimpleText(t);
  if (/^(no|n|none|false|0)$/i.test(norm)) return { mode: "no" };
  const onlyNums = t.replace(/,/g, " ").replace(/\s+/g, " ").trim();
  if (/^(\d+(\s+\d+)*)$/.test(onlyNums)) {
    const parts = onlyNums.split(" ").filter(Boolean);
    const pickSet = new Set();
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (!Number.isFinite(n) || n < 1 || n > 8) return { mode: "invalid" };
      pickSet.add(n);
    }
    return { mode: "numbers", pickSet, anyPositive: pickSet.size > 0 };
  }
  if (isAffirmative(t)) return { mode: "yes_word", anyPositive: true };
  return { mode: "invalid" };
}

const MAJOR_CONDITION_NUMBER_KEYS = [
  "high_blood_pressure",
  "cholesterol_high",
  "sleep_apnea",
  "diabetes",
  "depression",
  "atrial_fibrillation",
  "kidney_disease",
  "liver_disease",
  "copd_diagnosed",
  "neurological_condition",
];

function applyMajorConditionsNumberPicks(phi, pickSet) {
  if (!phi || typeof phi !== "object") return;
  const pick = pickSet instanceof Set ? pickSet : new Set(pickSet || []);
  MAJOR_CONDITION_NUMBER_KEYS.forEach((k) => {
    phi[k] = false;
  });
  MAJOR_CONDITION_NUMBER_KEYS.forEach((k, idx) => {
    if (pick.has(idx + 1)) phi[k] = true;
  });
  // Force fresh follow-up capture when a numbered major condition is selected.
  if (pick.has(1)) delete phi.bp_controlled;
  if (pick.has(2)) {
    delete phi.cholesterol_medication;
    delete phi.cholesterol_controlled;
  }
  if (pick.has(3)) delete phi.cpap_use;
  if (pick.has(4)) {
    delete phi.diabetes_type;
    delete phi.diabetes_insulin;
    delete phi.diabetes_complications;
  }
  if (pick.has(5)) delete phi.depression_treated;
  if (pick.has(6)) delete phi.afib_controlled;
  // Clear follow-ups when a condition is not selected in this pass.
  if (!pick.has(1)) delete phi.bp_controlled;
  if (!pick.has(2)) {
    delete phi.cholesterol_medication;
    delete phi.cholesterol_controlled;
  }
  if (!pick.has(3)) delete phi.cpap_use;
  if (!pick.has(4)) {
    delete phi.diabetes_type;
    delete phi.diabetes_insulin;
    delete phi.diabetes_complications;
  }
  if (!pick.has(5)) delete phi.depression_treated;
  if (!pick.has(6)) delete phi.afib_controlled;
  phi.has_major_conditions = pick.size > 0;
}

function parseMajorConditionsSelection(raw) {
  const t = String(raw || "")
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  if (!t) return { mode: "invalid" };
  const norm = normalizeSimpleText(t);
  if (/^(no|n|none|false|0)$/i.test(norm)) return { mode: "no" };
  const onlyNums = t.replace(/,/g, " ").replace(/\s+/g, " ").trim();
  if (/^(\d+(\s+\d+)*)$/.test(onlyNums)) {
    const parts = onlyNums.split(" ").filter(Boolean);
    const pickSet = new Set();
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (!Number.isFinite(n) || n < 1 || n > MAJOR_CONDITION_NUMBER_KEYS.length) return { mode: "invalid" };
      pickSet.add(n);
    }
    return { mode: "numbers", pickSet, anyPositive: pickSet.size > 0 };
  }
  if (/^(yes|y|true|si|sí)$/i.test(norm)) return { mode: "yes_word" };
  return { mode: "invalid" };
}

const FINAL_HEALTH_NUMBER_KEYS = ["heart_event_recent", "cancer_active", "dementia_cognitive"];

function applyFinalHealthNumberPicks(phi, pickSet) {
  if (!phi || typeof phi !== "object") return;
  const pick = pickSet instanceof Set ? pickSet : new Set(pickSet || []);
  FINAL_HEALTH_NUMBER_KEYS.forEach((k) => {
    phi[k] = false;
  });
  FINAL_HEALTH_NUMBER_KEYS.forEach((k, idx) => {
    if (pick.has(idx + 1)) phi[k] = true;
  });
  // Force the detail follow-ups when conditions are selected.
  if (pick.has(1)) {
    delete phi.heart_event_date;
    delete phi.heart_event_type;
  }
  if (pick.has(2)) {
    delete phi.cancer_type;
    delete phi.cancer_treatment_status;
  }
  // Clear detail follow-ups when deselected.
  if (!pick.has(1)) {
    delete phi.heart_event_date;
    delete phi.heart_event_type;
  }
  if (!pick.has(2)) {
    delete phi.cancer_type;
    delete phi.cancer_treatment_status;
  }
}

function parseFinalHealthSelection(raw) {
  const t = String(raw || "")
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
  if (!t) return { mode: "invalid" };
  const norm = normalizeSimpleText(t);
  if (/^(no|n|none|false|0)$/i.test(norm)) return { mode: "no" };
  const onlyNums = t
    .replace(/[,*#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (/^(\d+(\s+\d+)*)$/.test(onlyNums)) {
    const parts = onlyNums.split(" ").filter(Boolean);
    const pickSet = new Set();
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (!Number.isFinite(n) || n < 1 || n > FINAL_HEALTH_NUMBER_KEYS.length) return { mode: "invalid" };
      pickSet.add(n);
    }
    return { mode: "numbers", pickSet };
  }
  return { mode: "invalid" };
}

/** Rewind: remove compound answer and any imputed or answered gate PHI from the prescreen branch. */
function clearHealthPrescreenBranchPhi(phi) {
  if (!phi || typeof phi !== "object") return;
  const keys = new Set([
    "health_prescreen_overall",
    ...HEALTH_PRESCREEN_IMPUTED_KEYS,
    ...POST_RX_SCREEN_KEYS,
    "current_medications",
  ]);
  keys.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(phi, k)) delete phi[k];
  });
  if (Object.prototype.hasOwnProperty.call(phi, "medication_count")) delete phi.medication_count;
}

const HEALTH_PRESCREEN_OVERALL_PROMPT = [
  "Does the client have any of the serious situations below? Skip everyday prescription refills here—we ask about those on the next question.",
  "",
  "1. Terminal illness diagnosis",
  "2. HIV/AIDS diagnosis",
  "3. Organ transplant history",
  "4. Currently on dialysis",
  "5. Nursing home, bedridden/wheelchair-bound, or needs hands-on help with bathing, dressing, eating, or walking",
  "6. Hospital stay in the **last 90 days**",
  "7. Doctor-recommended **surgery pending**",
  "8. **Undiagnosed symptoms** with tests or follow-up still pending",
  "",
  "Reply **no**, **yes**, or the numbers that apply (example: **3, 6**).",
].join("\n");

const QUESTION_FLOW = [
  {
    key: "terminal_illness",
    prompt: "Any terminal illness diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "aids_hiv",
    prompt: "Any HIV/AIDS diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "organ_transplant",
    prompt: "Any history of organ transplant? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "heart_event_recent",
    prompt: "Any heart attack, stroke, or TIA in the last 2 years? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "heart_event_date",
    prompt: "What was the date of the heart event?",
    type: "text",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.heart_event_recent);
    },
  },
  {
    key: "heart_event_type",
    prompt: "What type of event was it: heart_attack, stroke, or tia?",
    type: "choice",
    options: ["heart_attack", "stroke", "tia"],
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.heart_event_recent);
    },
  },
  {
    key: "cancer_active",
    prompt: "Any active cancer diagnosis or treatment in the last 2 years? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "cancer_type",
    prompt: "What type of cancer?",
    type: "text",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.cancer_active);
    },
  },
  {
    key: "cancer_treatment_status",
    prompt: "Cancer treatment status: ongoing, completed, or in_remission?",
    type: "choice",
    options: ["ongoing", "completed", "in_remission"],
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.cancer_active);
    },
  },
  {
    key: "dementia_cognitive",
    prompt: "Any Alzheimer's, dementia, or memory-related diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "diabetes",
    prompt: "Any diabetes diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "diabetes_type",
    prompt: "Diabetes type: type1 or type2?",
    type: "choice",
    options: ["type1", "type2"],
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.diabetes);
    },
  },
  {
    key: "diabetes_insulin",
    prompt: "Currently using insulin? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.diabetes);
    },
  },
  {
    key: "dialysis",
    prompt: "Currently on dialysis? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "nursing_home_resident",
    prompt: "Is the client currently in a nursing home? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "adl_assistance",
    prompt: "Does the client need help with daily activities like bathing, dressing, or eating? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "hospitalized_recent",
    prompt: "Any hospitalization in the last 90 days? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "hospitalization_reason",
    prompt: "What was the hospitalization reason?",
    type: "text",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.hospitalized_recent);
    },
  },
  {
    key: "awaiting_surgery",
    prompt: "Any doctor-recommended surgery currently pending? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "undiagnosed_symptoms",
    prompt: "Any undiagnosed symptoms with tests or follow-up pending? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "atrial_fibrillation",
    prompt: "Any atrial fibrillation diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return anyTrue(phiAnswers, ["heart_event_recent", "heart_attack_history", "congestive_heart_failure"]);
    },
  },
  {
    key: "afib_controlled",
    prompt: "If atrial fibrillation, is it currently controlled? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.atrial_fibrillation);
    },
  },
  {
    key: "pacemaker",
    prompt: "Any pacemaker or defibrillator? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return anyTrue(phiAnswers, ["heart_event_recent", "heart_attack_history", "congestive_heart_failure"]);
    },
  },
  {
    key: "blood_thinner_use",
    prompt: "Currently taking blood thinners? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return anyTrue(phiAnswers, ["heart_event_recent", "heart_attack_history", "atrial_fibrillation"]);
    },
  },
  {
    key: "coronary_artery_disease",
    prompt: "Any coronary artery disease diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return anyTrue(phiAnswers, ["heart_event_recent", "heart_attack_history", "congestive_heart_failure"]);
    },
  },
  {
    key: "stents_placed",
    prompt: "Any stents placed? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return anyTrue(phiAnswers, ["heart_event_recent", "heart_attack_history", "coronary_artery_disease"]);
    },
  },
  {
    key: "stents_recent",
    prompt: "If stents were placed, was that in the last 2 years? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.stents_placed);
    },
  },
  {
    key: "high_blood_pressure",
    prompt: "Any high blood pressure diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      const phi = phiAnswers || {};
      if (phi.high_blood_pressure === true || phi.high_blood_pressure === false) return true;
      return phi.has_major_conditions === true;
    },
  },
  {
    key: "bp_controlled",
    prompt: "If high blood pressure, is it controlled with medication? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.high_blood_pressure);
    },
  },
  {
    key: "cholesterol_high",
    prompt: "Any high cholesterol diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      const phi = phiAnswers || {};
      if (phi.cholesterol_high === true || phi.cholesterol_high === false) return true;
      return phi.has_major_conditions === true;
    },
  },
  {
    key: "cholesterol_medication",
    prompt: "If high cholesterol, currently taking cholesterol medication? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.cholesterol_high);
    },
  },
  {
    key: "cholesterol_controlled",
    prompt: "If high cholesterol, is it currently controlled? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.cholesterol_high);
    },
  },
  {
    key: "sleep_apnea",
    prompt: "Any sleep apnea diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "cpap_use",
    prompt: "If sleep apnea, currently using CPAP? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.sleep_apnea);
    },
  },
  {
    key: "depression",
    prompt: "Any depression diagnosis? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "depression_treated",
    prompt: "If depression, is it stable on treatment? (yes/no)",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.depression);
    },
  },
  {
    key: "current_medications",
    prompt: "Please list current medications (or type none).",
    type: "text",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      return !!(phiAnswers && phiAnswers.takes_prescription_medications);
    },
  },
  {
    key: "normalized_coverage_target",
    prompt: NORMALIZED_COVERAGE_TARGET_PROMPT,
    type: "text",
    phi: false,
  },
  {
    key: "budget_class",
    prompt: BUDGET_CLASS_PROMPT,
    type: "text",
    phi: false,
  },
  {
    key: "priority_type",
    prompt: "",
    type: "text",
    phi: false,
  },
  {
    key: "health_prescreen_overall",
    prompt: HEALTH_PRESCREEN_OVERALL_PROMPT,
    type: "boolean",
    phi: true,
  },
  {
    key: "takes_prescription_medications",
    prompt: "Is the client currently taking prescription medications? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "has_major_conditions",
    prompt:
      "Aside from what we already covered, do they have any other doctor-diagnosed medical conditions or major health issues in the past few years?\n\n" +
      "Reply **no**, or list the condition numbers that apply (example: **2, 6**).\n\n" +
      PS_MAJOR_CONDITIONS_TABLE_SENTINEL,
    type: "boolean",
    phi: true,
  },
  {
    key: "health_disqualifier_any",
    prompt:
      "Have they been diagnosed with a terminal illness, had an organ transplant, currently have AIDS/HIV, or are currently on dialysis? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "functional_status_any",
    prompt:
      "Do they live in a nursing home, use a wheelchair or stay bedridden, or need help with daily activities like bathing, dressing, eating, or walking? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "final_health_conditions",
    prompt:
      "Final health check: do any of these apply?\n\n" +
      "1. Heart attack, stroke, or TIA in the last 2 years\n" +
      "2. Active cancer diagnosis or treatment in the last 2 years\n" +
      "3. Alzheimer's, dementia, or memory-related diagnosis\n\n" +
      "Reply **no**, or list the condition numbers that apply (example: **1, 3**).",
    type: "boolean",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      const phi = phiAnswers || {};
      const answeredHeart = phi.heart_event_recent === true || phi.heart_event_recent === false;
      const answeredCancer = phi.cancer_active === true || phi.cancer_active === false;
      const answeredCognitive = phi.dementia_cognitive === true || phi.dementia_cognitive === false;
      if (answeredHeart && answeredCancer && answeredCognitive) return false;
      return !!(
        phi.has_major_conditions ||
        phi.takes_prescription_medications ||
        phi.hospitalized_recent ||
        phi.awaiting_surgery ||
        phi.undiagnosed_symptoms
      );
    },
  },
  {
    key: "strategy_priority",
    prompt:
      "For this case, should we prioritize lowest monthly cost, immediate coverage, or approval certainty?",
    type: "choice",
    options: ["lowest_cost", "immediate_coverage", "approval_certainty"],
    phi: false,
  },
];

function parseAnswerByType(q, raw) {
  if (!q || typeof q !== "object") return null;
  const t = String(raw || "").trim();
  if (!t) return null;
  if (q.key === "current_medications" && /^none$/i.test(t)) return [];
  if (q.type === "number") {
    const n = Number(t.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? String(Math.round(n)) : null;
  }
  if (q.type === "boolean") {
    const compact = t.toLowerCase().replace(/[.!?,;:]+$/g, "").trim();
    if (/^(yes|y|true|1|si|sí)$/i.test(compact)) return true;
    if (/^(no|n|false|0)$/i.test(compact)) return false;
    return null;
  }
  if (q.type === "list") {
    if (/^none$/i.test(t)) return [];
    return t.split(",").map((x) => String(x || "").trim()).filter(Boolean);
  }
  if (q.type === "choice" && Array.isArray(q.options) && q.options.length) {
    const direct = q.options.find((x) => String(x) === t);
    if (direct) return direct;
    const normalized = t.toLowerCase().replace(/\s+/g, "_");
    const fuzzy = q.options.find((x) => String(x).toLowerCase() === normalized);
    return fuzzy || null;
  }
  return t;
}

function normalizeCoverageTarget(raw, goalKey) {
  const t = normalizeSimpleText(raw);
  if (!t) return "";
  if (/(not sure|unsure|dont know|don't know)/.test(t)) return "not_sure";
  if (goalKey === "final_expenses") {
    if (/(5000|5k|10k|10000)/.test(t)) return "5k_10k";
    if (/(15000|15k)/.test(t)) return "10k_15k";
    if (/(25000|25k)/.test(t)) return "15k_25k";
    if (/(\+|over|more than|25001|30000|30k|50000|50k)/.test(t)) return "25k_plus";
  }
  const n = Number(String(raw || "").replace(/[^0-9.]/g, ""));
  if (Number.isFinite(n) && n > 0) return String(Math.round(n));
  return t.replace(/\s+/g, "_");
}

function normalizePriorityType(raw, coverageGoal) {
  const allowed = allowedPriorityTypesForGoal(coverageGoal);
  const allow = new Set(allowed);
  const t = normalizeSimpleText(raw);
  if (!t) return "";
  const scores = {};
  const add = (key, w) => {
    if (!allow.has(key)) return;
    scores[key] = (scores[key] || 0) + w;
  };
  if (/(lowest monthly|cheap as|as cheap|low payment|small payment|affordable|budget|within budget|premium fits|keep.? cost down|lowest cost|cheapest|least premium|smallest premium)/.test(t))
    add("lowest_monthly_cost", 3);
  if (/(easy approval|easiest approval|get approved|hard to insure|declined before|health issues|qualify|underwriting|gi\b|guaranteed issue|simplified issue)/.test(t))
    add("easiest_approval", 3);
  if (/(immediate|day one|day 1|first day|no waiting|waiting period|full benefit right away|graded|contestability|level benefit)/.test(t))
    add("immediate_full_coverage", 2);
  if (/(permanent|lifetime|never expire|whole life|lasts forever|coverage for life)/.test(t)) add("permanent_coverage", 2);
  if (/(larger benefit|higher benefit|biggest benefit|max(imum)? face|as much coverage|more coverage|death benefit|payout|funeral|burial|cremation|final expense|family doesnt|family dont|family won t|family wont)/.test(t))
    add("larger_death_benefit", 2);
  if (/(cash value|accumulation|grow savings|investment side|policy loan|living benefits|dividend)/.test(t)) add("cash_value_growth", 3);
  if (/(fully pay off|full payoff|entire mortgage|zero balance|pay off the mortgage|lump sum to bank|bank payoff|payoff amount)/.test(t)) add("mortgage_full_payoff", 3);
  if (/(monthly mortgage|mortgage payment if|help with the mortgage|keep up house payments|stay in the home|widow can pay|monthly payment to bank)/.test(t))
    add("mortgage_monthly_payment", 3);
  if (/(max(imum)? coverage|highest coverage|as much coverage|largest death benefit|biggest face|more death benefit)/.test(t)) add("highest_coverage", 3);
  if (/(specific time|set period|term length|\d+\s*year|years left|until kids|until retirement|timeline|duration|match the loan)/.test(t)) add("duration_specific", 3);
  if (/(as long as possible|longest|replace income for years|many years|until retirement|ongoing income|survivor needs|income stream|years of income)/.test(t))
    add("income_longest_protection", 3);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked.length && ranked[0][1] >= 2) return ranked[0][0];
  if (allow.has("lowest_monthly_cost") && /(lowest|cheap|cost|payment|monthly)/.test(t)) return "lowest_monthly_cost";
  if (allow.has("easiest_approval") && /(easy|approval|qualify)/.test(t)) return "easiest_approval";
  if (allow.has("immediate_full_coverage") && /(immediate|full coverage)/.test(t)) return "immediate_full_coverage";
  if (allow.has("permanent_coverage") && /(permanent|lifetime|whole life)/.test(t)) return "permanent_coverage";
  if (allow.has("larger_death_benefit") && /(larger|higher|big|coverage amount)/.test(t)) return "larger_death_benefit";
  if (allow.has("cash_value_growth") && /(cash value|growth|long term)/.test(t)) return "cash_value_growth";
  if (allow.has("mortgage_full_payoff") && /(pay off|payoff|mortgage)/.test(t)) return "mortgage_full_payoff";
  if (allow.has("mortgage_monthly_payment") && /(monthly|payment)/.test(t)) return "mortgage_monthly_payment";
  if (allow.has("highest_coverage") && /(high|max|more|big)/.test(t)) return "highest_coverage";
  if (allow.has("duration_specific") && /(time|term|year|period)/.test(t)) return "duration_specific";
  if (allow.has("income_longest_protection") && /(long|income|replace|survivor)/.test(t)) return "income_longest_protection";
  return "";
}

function shouldRestateQuestion(raw) {
  const t = String(raw || "").trim().toLowerCase();
  if (!t) return false;
  return /what\s+is\s+the\s+question|repeat|say\s+that\s+again|can\s+you\s+repeat/.test(t);
}

function clarificationForQuestion(q, raw) {
  const key = q && q.key ? String(q.key) : "";
  const t = String(raw || "").trim().toLowerCase();
  if (!t) return "";
  if (key === "heart_event_recent" && /(what\s*is|what'?s|define|meaning|que\s+es|qué\s+es).*\btia\b/.test(t)) {
    return "TIA means transient ischemic attack, often called a mini-stroke. The question is whether they had a heart attack, stroke, or TIA in the last 2 years. Please answer yes or no.";
  }
  return "";
}

async function classifyPriorityTypeOpenEnded(openaiKey, userMessage, allowedList) {
  if (!openaiKey) return "";
  const allowed = Array.isArray(allowedList) && allowedList.length ? allowedList : ALL_PRIORITY_TYPE_VALUES;
  const allowedStr = allowed.join(", ");
  const hints = [];
  if (allowed.includes("lowest_monthly_cost")) hints.push("lowest_monthly_cost: lowest premium, budget, affordable payment.");
  if (allowed.includes("easiest_approval")) hints.push("easiest_approval: easiest to qualify, health-sensitive, GI/simplified.");
  if (allowed.includes("immediate_full_coverage")) hints.push("immediate_full_coverage: day-one full benefit, no waiting.");
  if (allowed.includes("permanent_coverage")) hints.push("permanent_coverage: lifetime/permanent product focus.");
  if (allowed.includes("cash_value_growth")) hints.push("cash_value_growth: cash value accumulation, policy savings growth.");
  if (allowed.includes("larger_death_benefit")) hints.push("larger_death_benefit: maximize face amount / payout.");
  if (allowed.includes("mortgage_full_payoff")) hints.push("mortgage_full_payoff: pay off entire mortgage balance.");
  if (allowed.includes("mortgage_monthly_payment")) hints.push("mortgage_monthly_payment: help survivor cover monthly mortgage.");
  if (allowed.includes("highest_coverage")) hints.push("highest_coverage: maximize death benefit / coverage amount.");
  if (allowed.includes("duration_specific")) hints.push("duration_specific: match a specific time period or term length.");
  if (allowed.includes("income_longest_protection")) hints.push("income_longest_protection: income replacement for as long as possible.");
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        max_tokens: 80,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You map an insurance agent's short note to exactly one internal priority_type for THIS case. Output JSON only: {"priority_type":"<one of: ${allowedStr}, or unknown>"}.

Only these keys are valid for this question:
${hints.join("\n")}

If you cannot decide, return unknown.`,
          },
          { role: "user", content: String(userMessage || "").slice(0, 900) },
        ],
      }),
    });
    const data = await r.json();
    if (!r.ok) return "";
    const text = String(data?.choices?.[0]?.message?.content || "").trim();
    const parsed = JSON.parse(text);
    const p = String(parsed?.priority_type || "").trim();
    if (allowed.includes(p)) return p;
    return "";
  } catch (_e) {
    return "";
  }
}

async function handleBooleanInterruption(openaiKey, questionPrompt, userMessage) {
  const fallback =
    "Thanks for that context. To keep underwriting accurate, I still need a direct yes or no for this question.";
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content:
              "You are helping an insurance agent during a yes/no underwriting question. Respond in 1-2 short sentences. Answer or acknowledge the agent's interruption briefly, but do not make underwriting decisions and do not ask a new question.",
          },
          {
            role: "user",
            content: JSON.stringify({
              current_question: questionPrompt,
              agent_message: userMessage,
              instruction: "Give a brief helpful response, then I will re-ask the same yes/no question.",
            }),
          },
        ],
      }),
    });
    const data = await r.json();
    if (!r.ok) return fallback;
    const text = String(data?.choices?.[0]?.message?.content || "").trim();
    return text || fallback;
  } catch (_e) {
    return fallback;
  }
}

function containsPrompt(text, prompt) {
  const a = normalizeSimpleText(text);
  const b = normalizeSimpleText(prompt);
  if (!a || !b) return false;
  return a.includes(b);
}

function adaptiveQuestionOrder(nonPhiAnswers, phiAnswers) {
  const phi = phiAnswers || {};
  const nonPhi = nonPhiAnswers || {};
  const coreNonPhi = ["normalized_coverage_target", "budget_class", "priority_type"];
  const hs = phi.health_prescreen_overall;
  let healthAfterPriority = [];
  if (hs === true) {
    healthAfterPriority = [
      "health_prescreen_overall",
      "takes_prescription_medications",
      "current_medications",
      "has_major_conditions",
      "health_disqualifier_any",
      "functional_status_any",
    ];
  } else if (hs === false) {
    healthAfterPriority = [
      "health_prescreen_overall",
      "takes_prescription_medications",
      "current_medications",
      "has_major_conditions",
      "health_disqualifier_any",
      "functional_status_any",
    ];
  } else {
    // Always begin with the 1-8 prescreen table to avoid regressing into the old per-condition flow.
    healthAfterPriority = ["health_prescreen_overall"];
  }
  const broadFirst = [...coreNonPhi, ...healthAfterPriority, "strategy_priority"];

  const targeted = [];
  if (phi.has_major_conditions || phi.takes_prescription_medications || phi.hospitalized_recent || phi.awaiting_surgery || phi.undiagnosed_symptoms) {
    targeted.push(
      "final_health_conditions",
      "diabetes",
      "kidney_disease",
      "liver_disease",
      "neurological_condition",
      "copd_diagnosed",
      "high_blood_pressure"
    );
  }
  const followUps = [
    "heart_event_date",
    "heart_event_type",
    "atrial_fibrillation",
    "afib_controlled",
    "pacemaker",
    "blood_thinner_use",
    "coronary_artery_disease",
    "stents_placed",
    "stents_recent",
    "cancer_type",
    "cancer_treatment_status",
    "cancer_history",
    "cancer_history_type",
    "diabetes_type",
    "diabetes_insulin",
    "diabetes_complications",
    "neurological_type",
    "cholesterol_high",
    "cholesterol_medication",
    "cholesterol_controlled",
    "sleep_apnea",
    "cpap_use",
    "depression",
    "depression_treated",
    "hospitalization_reason",
    "current_medications",
  ];
  if (String(nonPhi.coverage_goal || "") === "children_coverage") {
    return ["normalized_coverage_target", "budget_class", "priority_type", "strategy_priority"];
  }
  const tail = ["strategy_priority"];
  const deduped = [];
  [...broadFirst, ...targeted, ...followUps, ...tail].forEach((k) => {
    if (!deduped.includes(k)) deduped.push(k);
  });
  return deduped;
}

function clearAnswersFromQuestionOnward(fromKey, nonPhi, phi, canPhi) {
  if (fromKey === "health_prescreen_overall" && phi) {
    clearHealthPrescreenBranchPhi(phi);
  }
  const order = adaptiveQuestionOrder(nonPhi, phi, canPhi);
  const idx = order.indexOf(fromKey);
  if (idx < 0) return;
  for (let i = idx; i < order.length; i++) {
    const k = order[i];
    const q = questionByKey(k);
    if (!q) continue;
    if (q.phi) {
      if (phi && Object.prototype.hasOwnProperty.call(phi, k)) delete phi[k];
    } else if (nonPhi && Object.prototype.hasOwnProperty.call(nonPhi, k)) {
      delete nonPhi[k];
    }
    if (k === "budget_class" && nonPhi) delete nonPhi.budget_monthly;
    if (k === "normalized_coverage_target" && nonPhi) {
      delete nonPhi.coverage_amount;
    }
    if (k === "current_medications" && phi) {
      delete phi.medication_count;
      delete phi.medication_uw_classification;
    }
  }
}

function shouldStopQualification(nonPhiAnswers, phiAnswers, allowPhi) {
  const nonPhi = nonPhiAnswers || {};
  const phi = phiAnswers || {};
  const hasCore =
    !!String(nonPhi.coverage_goal || "").trim() &&
    !!String(nonPhi.normalized_coverage_target || "").trim() &&
    !!String(nonPhi.budget_class || "").trim() &&
    !!String(nonPhi.priority_type || "").trim();
  if (!hasCore) return false;
  if (!allowPhi) return true;
  if (String(nonPhi.coverage_goal || "") === "children_coverage") return true;
  if (anyTrue(phi, ["terminal_illness", "organ_transplant", "dialysis", "dementia_cognitive"])) return true;
  if (anyTrue(phi, ["nursing_home_resident", "wheelchair_bedridden", "adl_assistance"])) return true;
  if (phi.has_major_conditions === false && phi.takes_prescription_medications === false) return true;
  const rx = phi.takes_prescription_medications;
  if (rx !== true && rx !== false) return false;
  if (phi.has_major_conditions !== true && phi.has_major_conditions !== false) return false;
  if (rx === true && !Object.prototype.hasOwnProperty.call(phi, "current_medications")) return false;
  // Do not stop while condition follow-ups that drive risk are still unanswered.
  if (bool(phi.high_blood_pressure) && (phi.bp_controlled !== true && phi.bp_controlled !== false)) return false;
  if (bool(phi.cholesterol_high) && (phi.cholesterol_medication !== true && phi.cholesterol_medication !== false)) return false;
  if (bool(phi.cholesterol_high) && (phi.cholesterol_controlled !== true && phi.cholesterol_controlled !== false)) return false;
  if (bool(phi.sleep_apnea) && (phi.cpap_use !== true && phi.cpap_use !== false)) return false;
  if (bool(phi.depression) && (phi.depression_treated !== true && phi.depression_treated !== false)) return false;
  const healthAnchors = [
    "has_major_conditions",
    "takes_prescription_medications",
    "hospitalized_recent",
    "awaiting_surgery",
    "undiagnosed_symptoms",
    "heart_event_recent",
    "cancer_active",
    "copd_diagnosed",
    "diabetes",
    "kidney_disease",
    "liver_disease",
    "neurological_condition",
  ];
  const known = healthAnchors.filter((k) => phi[k] !== null && phi[k] !== undefined && phi[k] !== "").length;
  return known >= 4;
}

function nextQuestionKey(nonPhiAnswers, phiAnswers, allowPhi) {
  const phiSrc = phiAnswers || {};
  if (shouldStopQualification(nonPhiAnswers, phiAnswers, allowPhi)) return "";
  // Hard-priority follow-ups: never skip these when parent condition is present.
  if (allowPhi) {
    if (phiSrc.takes_prescription_medications === true) {
      const meds = Array.isArray(phiSrc.current_medications) ? phiSrc.current_medications : null;
      if (!meds || meds.length === 0) return "current_medications";
    }
    if (bool(phiSrc.high_blood_pressure) && (phiSrc.bp_controlled !== true && phiSrc.bp_controlled !== false)) return "bp_controlled";
    if (bool(phiSrc.cholesterol_high) && (phiSrc.cholesterol_medication !== true && phiSrc.cholesterol_medication !== false))
      return "cholesterol_medication";
    if (bool(phiSrc.cholesterol_high) && (phiSrc.cholesterol_controlled !== true && phiSrc.cholesterol_controlled !== false))
      return "cholesterol_controlled";
    if (bool(phiSrc.sleep_apnea) && (phiSrc.cpap_use !== true && phiSrc.cpap_use !== false)) return "cpap_use";
    if (bool(phiSrc.depression) && (phiSrc.depression_treated !== true && phiSrc.depression_treated !== false)) return "depression_treated";
    if (bool(phiSrc.diabetes) && !String(phiSrc.diabetes_type || "").trim()) return "diabetes_type";
    if (bool(phiSrc.diabetes) && (phiSrc.diabetes_insulin !== true && phiSrc.diabetes_insulin !== false)) return "diabetes_insulin";
    if (bool(phiSrc.diabetes) && (phiSrc.diabetes_complications !== true && phiSrc.diabetes_complications !== false))
      return "diabetes_complications";
    if (bool(phiSrc.atrial_fibrillation) && (phiSrc.afib_controlled !== true && phiSrc.afib_controlled !== false)) return "afib_controlled";
    if (bool(phiSrc.heart_event_recent) && !String(phiSrc.heart_event_date || "").trim()) return "heart_event_date";
    if (bool(phiSrc.heart_event_recent) && !String(phiSrc.heart_event_type || "").trim()) return "heart_event_type";
    if (bool(phiSrc.cancer_active) && !String(phiSrc.cancer_type || "").trim()) return "cancer_type";
    if (bool(phiSrc.cancer_active) && !String(phiSrc.cancer_treatment_status || "").trim()) return "cancer_treatment_status";
  }
  const healthNoneReported = !!phiSrc.health_none_reported;
  const blockGroups = [
    {
      noneKey: "health_block_a_none",
      keys: ["terminal_illness", "aids_hiv", "organ_transplant"],
    },
    {
      noneKey: "health_block_b_none",
      keys: [
        "heart_event_recent",
        "heart_event_date",
        "heart_event_type",
        "heart_attack_history",
        "congestive_heart_failure",
        "cancer_active",
        "cancer_type",
        "cancer_treatment_status",
        "cancer_history",
        "cancer_history_type",
        "copd_diagnosed",
        "oxygen_use",
        "dementia_cognitive",
      ],
    },
    {
      noneKey: "health_block_c_none",
      keys: [
        "diabetes",
        "diabetes_type",
        "diabetes_insulin",
        "diabetes_complications",
        "kidney_disease",
        "dialysis",
        "liver_disease",
        "neurological_condition",
        "neurological_type",
        "mental_health_hospitalized",
        "drug_alcohol_treatment",
      ],
    },
    {
      noneKey: "health_block_d_none",
      keys: ["nursing_home_resident", "wheelchair_bedridden", "adl_assistance"],
    },
    {
      noneKey: "health_block_e_none",
      keys: ["hospitalized_recent", "hospitalization_reason", "awaiting_surgery", "undiagnosed_symptoms"],
    },
    {
      noneKey: "health_block_stage3_none",
      keys: [
        "atrial_fibrillation",
        "afib_controlled",
        "pacemaker",
        "blood_thinner_use",
        "coronary_artery_disease",
        "stents_placed",
        "stents_recent",
        "high_blood_pressure",
        "bp_controlled",
        "cholesterol_high",
        "cholesterol_medication",
        "cholesterol_controlled",
        "sleep_apnea",
        "cpap_use",
        "depression",
        "depression_treated",
      ],
    },
  ];
  const blockByKey = {};
  const blockCompleted = {};
  blockGroups.forEach((group) => {
    group.keys.forEach((k) => {
      blockByKey[k] = group.noneKey;
    });
    // Only skip a block when the explicit "none" marker is set.
    // Do not treat "any selected answer" as completion, otherwise required follow-ups
    // (e.g., high_blood_pressure -> bp_controlled) get skipped.
    blockCompleted[group.noneKey] = !!phiSrc[group.noneKey];
  });
  // Defensive guard: if any Stage 3 condition is already selected, treat Stage 3 "none"
  // as not completed so required control follow-ups are still asked.
  if (
    anyTrue(phiSrc, [
      "atrial_fibrillation",
      "stents_placed",
      "high_blood_pressure",
      "cholesterol_high",
      "sleep_apnea",
      "depression",
    ])
  ) {
    blockCompleted.health_block_stage3_none = false;
  }
  const orderedKeys = adaptiveQuestionOrder(nonPhiAnswers, phiAnswers);
  const orderedQuestions = orderedKeys.map((k) => questionByKey(k)).filter(Boolean);
  for (const q of orderedQuestions) {
    if (q.phi && !allowPhi) continue;
    if (q.phi && healthNoneReported) continue;
    if (q.phi) {
      const blockNoneKey = blockByKey[q.key];
      if (blockNoneKey && blockCompleted[blockNoneKey]) continue;
    }
    if (typeof q.askIf === "function" && !q.askIf(nonPhiAnswers, phiAnswers)) continue;
    const source = q.phi ? (phiAnswers || {}) : (nonPhiAnswers || {});
    const v = source[q.key];
    const missing =
      v == null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0 && q.key !== "conditions" && q.key !== "current_medications");
    if (missing) return q.key;
  }
  return "";
}

function questionByKey(key) {
  return QUESTION_FLOW.find((q) => q.key === key) || null;
}

function questionPromptForStep(q, nonPhi) {
  if (!q) return "";
  if (q.key === "priority_type") return buildPriorityTypePrompt(String((nonPhi || {}).coverage_goal || "").trim());
  return q.prompt;
}

function deriveRisk(context, phiAnswers) {
  const merged = Object.assign({}, context || {}, phiAnswers || {});
  const hasMajorCondition =
    anyTrue(merged, [
      "heart_event_recent",
      "congestive_heart_failure",
      "cancer_active",
      "copd_diagnosed",
      "kidney_disease",
      "liver_disease",
      "neurological_condition",
      "diabetes_complications",
    ]) || /heart|cancer|stroke|copd|kidney|cirrhosis|insulin/i.test(String(merged.current_medications || ""));
  const takesRx = bool(merged.takes_prescription_medications || merged.prescription_meds);
  const medList = Array.isArray(merged.current_medications) ? merged.current_medications : [];
  const uwRxEscalates = takesRx && rxEscalatesModerateRisk(medList, merged.medication_uw_classification);
  const hosp = bool(merged.hospitalized_recent || merged.recent_hospitalizations || merged.hospitalized_5y);
  const doc = bool(merged.doctor_visits_2y);
  const cognitive = bool(merged.dementia_cognitive);
  const careNeeds = bool(merged.nursing_home_resident) || bool(merged.wheelchair_bedridden) || bool(merged.adl_assistance);
  const tobacco = bool(merged.tobacco);
  const hbpModerate = bool(merged.high_blood_pressure) && merged.bp_controlled === false;
  const cholesterolModerate = bool(merged.cholesterol_high) && merged.cholesterol_controlled === false;
  const sleepApneaModerate = bool(merged.sleep_apnea) && merged.cpap_use === false;
  const depressionModerate = bool(merged.depression) && merged.depression_treated === false;
  const afibModerate = bool(merged.atrial_fibrillation) && merged.afib_controlled === false;
  const stentsModerate = bool(merged.stents_placed) && merged.stents_recent === true;
  const diabetesType = String(merged.diabetes_type || "").toLowerCase();
  const diabetesModerate =
    bool(merged.diabetes) &&
    (merged.diabetes_complications === true ||
      merged.diabetes_insulin === true ||
      diabetesType === "type1");
  let level = "low";
  if (bool(merged.terminal_illness) || bool(merged.organ_transplant) || bool(merged.dialysis) || cognitive || careNeeds || hasMajorCondition || hosp) level = "high";
  else if (
    uwRxEscalates ||
    doc ||
    tobacco ||
    diabetesModerate ||
    hbpModerate ||
    cholesterolModerate ||
    sleepApneaModerate ||
    depressionModerate ||
    afibModerate ||
    stentsModerate
  ) {
    level = "moderate";
  }
  const flags = [];
  if (bool(merged.terminal_illness)) flags.push("terminal_illness");
  if (bool(merged.organ_transplant)) flags.push("organ_transplant");
  if (bool(merged.dialysis)) flags.push("dialysis");
  if (hasMajorCondition) flags.push("major_condition");
  if (hosp) flags.push("recent_hospitalization");
  if (takesRx && uwRxEscalates) flags.push("rx_meds");
  if (takesRx && !uwRxEscalates) flags.push("rx_meds_benign_or_cosmetic_only");
  if (bool(merged.high_blood_pressure)) {
    if (merged.bp_controlled === true) flags.push("hypertension_controlled");
    else if (merged.bp_controlled === false) flags.push("hypertension_uncontrolled");
    else flags.push("hypertension_control_status_unknown");
  }
  if (bool(merged.cholesterol_high)) {
    if (merged.cholesterol_controlled === true) flags.push("cholesterol_controlled");
    else if (merged.cholesterol_controlled === false) flags.push("cholesterol_uncontrolled");
    else flags.push("cholesterol_control_status_unknown");
  }
  if (bool(merged.sleep_apnea)) {
    if (merged.cpap_use === true) flags.push("sleep_apnea_cpap_yes");
    else if (merged.cpap_use === false) flags.push("sleep_apnea_cpap_no");
    else flags.push("sleep_apnea_cpap_status_unknown");
  }
  if (bool(merged.depression)) {
    if (merged.depression_treated === true) flags.push("depression_stable_on_treatment");
    else if (merged.depression_treated === false) flags.push("depression_not_stable_on_treatment");
    else flags.push("depression_treatment_status_unknown");
  }
  if (bool(merged.diabetes)) {
    if (merged.diabetes_complications === true) flags.push("diabetes_complications_yes");
    else if (merged.diabetes_complications === false) flags.push("diabetes_complications_no");
    else flags.push("diabetes_complications_unknown");
    if (merged.diabetes_insulin === true) flags.push("diabetes_insulin_yes");
    else if (merged.diabetes_insulin === false) flags.push("diabetes_insulin_no");
    else flags.push("diabetes_insulin_unknown");
    if (diabetesType === "type1") flags.push("diabetes_type1");
    else if (diabetesType === "type2") flags.push("diabetes_type2");
    else if (diabetesType) flags.push("diabetes_type_other");
    else flags.push("diabetes_type_unknown");
  }
  if (bool(merged.atrial_fibrillation)) {
    if (merged.afib_controlled === true) flags.push("afib_controlled");
    else if (merged.afib_controlled === false) flags.push("afib_not_controlled");
    else flags.push("afib_control_status_unknown");
  }
  if (bool(merged.stents_placed)) {
    if (merged.stents_recent === true) flags.push("stents_recent_yes");
    else if (merged.stents_recent === false) flags.push("stents_recent_no");
    else flags.push("stents_recency_unknown");
  }
  if (doc) flags.push("recent_doctor_visits");
  if (cognitive) flags.push("cognitive_condition");
  if (careNeeds) flags.push("care_status");
  if (tobacco) flags.push("tobacco");
  return { level, flags };
}

function normalizeProductType(rawProduct, rawCategory) {
  const p = String(rawProduct || "").toLowerCase().trim();
  const c = String(rawCategory || "").toLowerCase().trim();
  const v = p || c;
  if (/final/.test(v)) return "final_expense";
  if (/term/.test(v)) return "term_life";
  if (/universal/.test(v)) return "universal_life";
  if (/whole/.test(v)) return "whole_life";
  if (/life/.test(v)) return "whole_life";
  return "life_insurance";
}

const ALLOWED_PRODUCT_CATALOG = [
  { carrierLabel: "Mutual of Omaha", carrierMatch: /mutual\s+of\s+omaha|united\s+of\s+omaha/i, productMatch: /living\s+promise/i, productName: "Living Promise Whole Life", productType: "final_expense" },
  { carrierLabel: "Mutual of Omaha", carrierMatch: /mutual\s+of\s+omaha|united\s+of\s+omaha/i, productMatch: /term\s+life\s+answers|\btla\b/i, productName: "Term Life Answers (TLA)", productType: "term_life" },
  { carrierLabel: "Mutual of Omaha", carrierMatch: /mutual\s+of\s+omaha|united\s+of\s+omaha/i, productMatch: /term\s+life\s+express|\btle\b/i, productName: "Term Life Express (TLE)", productType: "term_life" },
  { carrierLabel: "Mutual of Omaha", carrierMatch: /mutual\s+of\s+omaha|united\s+of\s+omaha/i, productMatch: /income\s+advantage\s+iul/i, productName: "Income Advantage IUL", productType: "universal_life" },
  { carrierLabel: "Mutual of Omaha", carrierMatch: /mutual\s+of\s+omaha|united\s+of\s+omaha/i, productMatch: /life\s+protection\s+advantage\s+iul/i, productName: "Life Protection Advantage IUL", productType: "universal_life" },
  { carrierLabel: "Mutual of Omaha", carrierMatch: /mutual\s+of\s+omaha|united\s+of\s+omaha/i, productMatch: /indexed\s+universal\s+life\s+express/i, productName: "Indexed Universal Life Express", productType: "universal_life" },
  { carrierLabel: "Mutual of Omaha", carrierMatch: /mutual\s+of\s+omaha|united\s+of\s+omaha/i, productMatch: /accumul\s+answers|accumul\s+answers/i, productName: "AccumUL Answers", productType: "universal_life" },
  { carrierLabel: "Mutual of Omaha", carrierMatch: /mutual\s+of\s+omaha|united\s+of\s+omaha/i, productMatch: /children'?s\s+whole\s+life/i, productName: "Children's Whole Life", productType: "whole_life" },

  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /easy\s+term/i, productName: "Easy Term", productType: "term_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /express\s+ul/i, productName: "Express UL", productType: "universal_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /financial\s+lifeline/i, productName: "Financial Lifeline", productType: "whole_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /golden\s+solution/i, productName: "Golden Solution", productType: "final_expense" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /family\s+solution/i, productName: "Family Solution", productType: "whole_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /senior\s+choice/i, productName: "Senior Choice", productType: "final_expense" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /family\s+choice/i, productName: "Family Choice", productType: "whole_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /guaranteed\s+guardian/i, productName: "Guaranteed Guardian", productType: "final_expense" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /home\s+protector/i, productName: "Home Protector", productType: "term_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /\boba\b|order\s+of\s+benefits\s+alliance/i, productName: "OBA (Order of Benefits Alliance)", productType: "whole_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /security\s+protector/i, productName: "Security Protector", productType: "term_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /survivor\s+protector/i, productName: "Survivor Protector", productType: "term_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /term\s+made\s+simple/i, productName: "Term Made Simple", productType: "term_life" },
  { carrierLabel: "American Amicable", carrierMatch: /american\s+amicable|ia\s+american|occidental\s+life|pioneer/i, productMatch: /val[\s-]*u[\s-]*plus/i, productName: "Val-U-Plus", productType: "whole_life" },

  { carrierLabel: "Assurity", carrierMatch: /\bassurity\b/i, productMatch: /term\s+life/i, productName: "Term Life", productType: "term_life" },
  { carrierLabel: "Assurity", carrierMatch: /\bassurity\b/i, productMatch: /whole\s+life\s+protect\+/i, productName: "Whole Life Protect+", productType: "whole_life" },
  { carrierLabel: "Assurity", carrierMatch: /\bassurity\b/i, productMatch: /whole\s+life\s+perform\+/i, productName: "Whole Life Perform+", productType: "whole_life" },
  { carrierLabel: "Assurity", carrierMatch: /\bassurity\b/i, productMatch: /single\s+premium\s+whole\s+life/i, productName: "Single Premium Whole Life", productType: "whole_life" },
  { carrierLabel: "Assurity", carrierMatch: /\bassurity\b/i, productMatch: /universal\s+life/i, productName: "Universal Life", productType: "universal_life" },
];

const ITIN_HOLDER_APPROVED_PRODUCTS = new Set([
  "American Amicable — Senior Choice",
  "American Amicable — Guaranteed Guardian",
  "American Amicable — Easy Term",
  "American Amicable — Home Protector",
  "American Amicable — Security Protector",
  "American Amicable — Survivor Protector",
  "American Amicable — Term Made Simple",
]);

function catalogDisplayName(entry) {
  if (!entry) return "";
  return `${String(entry.carrierLabel || "").trim()} — ${String(entry.productName || "").trim()}`;
}

function isItinHolderCase(context) {
  const raw = String((context && context.citizenship_status) || "").trim().toLowerCase();
  return (
    raw === "itin_holder" ||
    raw === "undocumented_immigrant" ||
    raw === "other_or_not_sure" ||
    /itin|undocumented|illegal immigrant|no\s*green\s*card|no\s*citizenship/.test(raw)
  );
}

function preferredProductTypeForGoal(goalRaw) {
  const goal = String(goalRaw || "").trim().toLowerCase();
  if (goal === "final_expenses") return "final_expense";
  if (goal === "children_coverage" || goal === "legacy_planning") return "whole_life";
  if (goal === "income_replacement" || goal === "mortgage_protection" || goal === "debt_protection" || goal === "business_continuity") {
    return "term_life";
  }
  return "";
}

function approvedCatalogObjectsForItinHolder(preferredType) {
  const all = ALLOWED_PRODUCT_CATALOG.map((e) => ({ name: catalogDisplayName(e), type: e.productType }))
    .filter((x) => ITIN_HOLDER_APPROVED_PRODUCTS.has(x.name));
  const type = String(preferredType || "").trim().toLowerCase();
  if (!type) return all;
  const typed = all.filter((x) => String(x.type || "").toLowerCase() === type);
  return typed.length ? typed : all;
}

function matchAllowedCatalogEntry(row) {
  const carrier = String((row && row.carrier) || "");
  const product = String((row && row.product) || "");
  if (!carrier || !product) return null;
  return (
    ALLOWED_PRODUCT_CATALOG.find((entry) => entry.carrierMatch.test(carrier) && entry.productMatch.test(product)) || null
  );
}

function productTypeLabel(type) {
  const t = String(type || "").toLowerCase();
  if (t === "final_expense") return "Final Expense Whole Life";
  if (t === "term_life") return "Term Life";
  if (t === "universal_life") return "Universal Life";
  if (t === "whole_life") return "Whole Life";
  return "Life Insurance";
}

function tradeoffForChoice(optionName, type, priority) {
  const option = String(optionName || "").toLowerCase();
  const t = String(type || "").toLowerCase();
  const p = String(priority || "").toLowerCase();
  const productSpecific = [
    {
      match: /american amicable\s+—\s+senior choice/i,
      pros: [
        "Final-expense oriented design with straightforward positioning for burial and small legacy needs.",
        "Often easier to explain to families that want predictable permanent coverage.",
      ],
      cons: [
        "Face amounts are usually lower than income-replacement term strategies.",
        "Monthly premium can be higher per $1,000 of coverage than term options.",
      ],
      better_when: "Best when the client wants permanent final-expense coverage, modest face amount, and simpler approval expectations.",
    },
    {
      match: /american amicable\s+—\s+guaranteed guardian/i,
      pros: [
        "Useful fallback when approval pathway is the top priority for tougher health cases.",
        "Permanent policy style supports clients focused on guaranteed lifetime final-expense intent.",
      ],
      cons: [
        "Typically less price-efficient than fully underwritten products for clean-health profiles.",
        "Benefit structure may be more conservative than simplified term alternatives.",
      ],
      better_when: "Best when health profile is tougher and approval certainty is more important than maximizing benefit per premium dollar.",
    },
    {
      match: /american amicable\s+—\s+home protector/i,
      pros: [
        "Mortgage-protection style term structure aligns well with debt payoff timelines.",
        "Can provide larger temporary death benefit than final-expense plans at similar budgets.",
      ],
      cons: [
        "Not a permanent final-expense design, so it may mismatch pure burial-only goals.",
        "Coverage period and underwriting outcomes can vary by age/health profile.",
      ],
      better_when: "Best when the need is mortgage/debt timeline protection and a larger temporary death benefit is the priority.",
    },
    {
      match: /american amicable\s+—\s+easy term/i,
      pros: [
        "Strong fit for cost-conscious temporary protection and replacement-income needs.",
        p === "lowest_monthly_cost"
          ? "Often aligns with lowest-monthly-cost priority when term qualification is available."
          : "Simple term positioning for clients who want larger benefit during key earning years.",
      ],
      cons: [
        "Term coverage is temporary and may not satisfy permanent final-expense objectives.",
        "Conversion/renewal outcomes depend on product rules and future insurability context.",
      ],
      better_when: "Best when client is lower risk, budget-sensitive, and focused on maximum temporary coverage for the premium.",
    },
    {
      match: /american amicable\s+—\s+term made simple/i,
      pros: [
        "Term-focused option for straightforward temporary protection conversations.",
        "Can align well with debt/income protection scenarios requiring higher face amounts.",
      ],
      cons: [
        "Not built as a permanent burial/final-expense solution.",
        "Underwriting tolerance and pricing still vary by risk profile and state form.",
      ],
      better_when: "Best when the client wants straightforward term protection and qualifies cleanly for temporary coverage.",
    },
  ];
  const exact = productSpecific.find((r) => r.match.test(option));
  if (exact) return { pros: exact.pros, cons: exact.cons, better_when: exact.better_when };
  if (/mutual of omaha/.test(option)) {
    return {
      pros: [
        "Strong brand familiarity and broad product lineup for future cross-sell options.",
        t === "term_life"
          ? "Term portfolio is often competitive for straightforward low-risk cases."
          : "Commonly used carrier for simplified and permanent-life scenarios.",
      ],
      cons: [
        "Can be less price-flexible than some alternatives in certain age/health bands.",
        "Some products may require tighter fit to underwriting rules for best pricing tier.",
      ],
      better_when: "Best when client values carrier breadth/brand and can fit underwriting for preferred pricing tiers.",
    };
  }
  if (/american amicable/.test(option)) {
    return {
      pros: [
        "Often useful for approval-focused cases with practical underwriting pathways.",
        t === "term_life"
          ? "Term options are usually straightforward for replacement-income style needs."
          : "Strong final-expense and whole-life style alternatives.",
      ],
      cons: [
        "May not always be the absolute lowest premium for very clean preferred-health profiles.",
        "Product/rider structure can vary more by specific form and state.",
      ],
      better_when: "Best when approval practicality is weighted above pure lowest-price optimization.",
    };
  }
  if (/\bassurity\b/.test(option)) {
    return {
      pros: [
        "Often strong fit when cost-conscious term recommendations are needed.",
        "Can provide clean product positioning for simple income-replacement conversations.",
      ],
      cons: [
        "May offer fewer niche product variations than larger multi-line carrier menus.",
        "Final-premium competitiveness still depends on age, state, and underwriting class.",
      ],
      better_when: "Best when client profile is clean/moderate and cost-focused term or simple product positioning is preferred.",
    };
  }
  if (t === "final_expense") {
    return {
      pros: [
        "Simplified underwriting with easier approval for many health profiles.",
        "Lifetime coverage designed around funeral and final-bill needs.",
      ],
      cons: [
        "Lower face amounts than traditional term products.",
        "Monthly cost per $1,000 of coverage is usually higher than term life.",
      ],
      better_when: "Best when the goal is guaranteed lifetime burial/final-bill coverage over larger temporary face amounts.",
    };
  }
  if (t === "term_life") {
    return {
      pros: [
        "Higher death benefit per dollar of premium.",
        p === "lowest_monthly_cost" ? "Typically best fit for lowest monthly cost goals." : "Strong fit for income/mortgage protection goals.",
      ],
      cons: [
        "Coverage expires at end of term unless converted/renewed.",
        "Underwriting can be stricter than final expense in some cases.",
      ],
      better_when: "Best when client needs high face amount now and qualifies for cost-efficient temporary protection.",
    };
  }
  if (t === "universal_life") {
    return {
      pros: [
        "Flexible premium and long-term coverage design options.",
        "Can support legacy-focused planning better than short-term products.",
      ],
      cons: [
        "More complex product structure to explain and maintain.",
        "Premium adequacy is important to keep coverage in force long term.",
      ],
      better_when: "Best when client wants long-term flexibility and can support ongoing premium management.",
    };
  }
  return {
    pros: ["Permanent protection option when approved.", "Can align with long-term protection goals."],
    cons: ["May be more expensive than term options.", "Product fit depends on underwriting details and budget."],
    better_when: "Best when permanent protection is prioritized and underwriting supports this product path.",
  };
}

function buildAlternativeTradeoffs(alternativeProducts, alternativeTypes, priority) {
  const prods = Array.isArray(alternativeProducts) ? alternativeProducts : [];
  const types = Array.isArray(alternativeTypes) ? alternativeTypes : [];
  const out = [];
  for (let i = 0; i < prods.length || i < types.length; i++) {
    const name = String(prods[i] || types[i] || "").trim();
    const type = String(types[i] || "").trim();
    if (!name) continue;
    const t = tradeoffForChoice(name, type, priority);
    out.push({
      option: name,
      pros: t.pros,
      cons: t.cons,
      better_when: t.better_when || "",
    });
  }
  return out;
}

function uniqueAlternativeObjects(primaryProduct, alternatives) {
  const p = String(primaryProduct || "").trim();
  const seen = new Set([p.toLowerCase()]);
  const out = [];
  (alternatives || []).forEach((a) => {
    const name = String(a && a.name ? a.name : "").trim();
    const type = String(a && a.type ? a.type : "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name, type });
  });
  return out;
}

function fallbackAlternativesForContext(primaryProduct, context) {
  const ctx = context && typeof context === "object" ? context : {};
  const goal = String(ctx.coverage_goal || ctx.intent || "").toLowerCase();
  let options = [
    { name: "American Amicable — Senior Choice", type: "final_expense" },
    { name: "American Amicable — Easy Term", type: "term_life" },
    { name: "Assurity — Universal Life", type: "universal_life" },
  ];
  if (/income|mortgage|debt|business/.test(goal)) {
    options = [
      { name: "American Amicable — Easy Term", type: "term_life" },
      { name: "Assurity — Term Life", type: "term_life" },
      { name: "Mutual of Omaha — Living Promise Whole Life", type: "final_expense" },
    ];
  } else if (/legacy/.test(goal)) {
    options = [
      { name: "Assurity — Whole Life Protect+", type: "whole_life" },
      { name: "American Amicable — Family Solution", type: "whole_life" },
      { name: "Mutual of Omaha — Income Advantage IUL", type: "universal_life" },
    ];
  }
  return uniqueAlternativeObjects(primaryProduct, options);
}

function approvedAlternativesFromCatalog(primaryProduct, preferredType, limit) {
  const lp = String(primaryProduct || "").trim().toLowerCase();
  const seen = new Set([lp]);
  const max = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 3;
  const byType = ALLOWED_PRODUCT_CATALOG.filter((e) => String(e.productType || "") === String(preferredType || ""));
  const ranked = byType
    .map((e) => ({ name: `${e.carrierLabel} — ${e.productName}`, type: e.productType }))
    .filter((x) => {
      const key = String(x.name || "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return ranked.slice(0, max);
}

function onePerCarrierAlternatives(primaryProduct, preferredType) {
  const primaryKey = String(primaryProduct || "").trim().toLowerCase();
  const carriers = ["Mutual of Omaha", "American Amicable", "Assurity"];
  const out = [];
  carriers.forEach((carrierLabel) => {
    const sameType = ALLOWED_PRODUCT_CATALOG.find((e) => {
      if (String(e.carrierLabel || "") !== carrierLabel) return false;
      if (String(e.productType || "") !== String(preferredType || "")) return false;
      const name = `${e.carrierLabel} — ${e.productName}`.toLowerCase();
      return name !== primaryKey;
    });
    const fallbackAny = ALLOWED_PRODUCT_CATALOG.find((e) => {
      if (String(e.carrierLabel || "") !== carrierLabel) return false;
      const name = `${e.carrierLabel} — ${e.productName}`.toLowerCase();
      return name !== primaryKey;
    });
    const picked = sameType || fallbackAny;
    if (!picked) return;
    out.push({ name: `${picked.carrierLabel} — ${picked.productName}`, type: picked.productType });
  });
  return uniqueAlternativeObjects(primaryProduct, out);
}

function extractRateExample(rows) {
  const text = (rows || []).map((r) => String((r && r.content) || "")).join("\n");
  if (!text) return "";
  const money = Array.from(text.matchAll(/\$ ?(\d{1,4}(?:\.\d{1,2})?)/g))
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n >= 15 && n <= 1200);
  const uniq = [...new Set(money)].sort((a, b) => a - b);
  if (!uniq.length) return "";
  if (uniq.length === 1) return `Internal rate example found: about $${uniq[0].toFixed(2)}/month (illustrative, not a quoted rate).`;
  return `Internal rate examples found: about $${uniq[0].toFixed(2)}-$${uniq[Math.min(uniq.length - 1, 2)].toFixed(2)}/month (illustrative, not a quoted rate).`;
}

function buildBestFitExplanation(context, risk, primaryProduct, primaryType, sourceMode, rateExample) {
  const ctx = context && typeof context === "object" ? context : {};
  const goal = String(ctx.coverage_goal || ctx.intent || "this client goal");
  const priority = String(ctx.priority_type || ctx.strategy_priority || "approval certainty");
  const riskLevel = String((risk && risk.level) || "unknown");
  const riskFlags = Array.isArray(risk && risk.flags) ? risk.flags : [];
  const coverage = String(ctx.coverage_amount || "").trim();
  const budget = String(ctx.budget_monthly || "").trim();
  const sourceText = sourceMode === "rag" ? "internal carrier knowledge matches" : "goal and risk fallback rules";
  const isCostPriority = /lowest|cost/.test(priority);
  const isApprovalPriority = /approval/.test(priority);
  const costLine =
    primaryType === "term_life"
      ? "Term products typically provide the most death benefit per premium dollar, which improves cost efficiency when medically eligible."
      : primaryType === "final_expense"
        ? "Final-expense designs trade larger face amounts for simpler permanent coverage and often more predictable approval pathways."
        : "This product type is positioned for long-term coverage fit rather than only lowest short-term premium.";
  const approvalLine = riskLevel === "high"
    ? "Because the risk profile is elevated, this recommendation favors a lane with more realistic approval potential rather than a lowest-price-only lane."
    : "Risk profile appears manageable, so this recommendation balances approval confidence with value and product-fit goals.";
  const riskFitLine =
    riskFlags.length
      ? `Risk signals considered: ${riskFlags.join(", ")}.`
      : `Risk profile considered: ${riskLevel}.`;
  let msg =
    `${primaryProduct} is recommended because it best matches the client goal (${goal}) and decision priority (${priority}) using ${sourceText}.\n\n` +
    `Why this wins now:\n` +
    `- Cost position: ${isCostPriority ? costLine : "Price is considered, but not at the expense of approval probability and product-goal fit."}\n` +
    `- Approval likelihood: ${isApprovalPriority ? approvalLine : "Approval viability is still screened so the recommendation is practical, not just theoretical."}\n` +
    `- Risk/profile fit: ${riskFitLine}`;
  if (coverage || budget) {
    msg += `\n- Case targets used: coverage ${coverage || "not specified"} and budget ${budget ? `$${budget}/month` : "not specified"}.`;
  }
  if (rateExample) msg += `\n- Rate context: ${rateExample}`;
  msg +=
    `\n\nWhen another product would be better:\n` +
    `If health improves, budget changes, or goals shift (for example from approval certainty to lowest monthly cost, or from final expense to larger temporary income protection), a different product line may become the stronger recommendation.`;
  return msg;
}

function recommendFromRagRows(context, risk, rows) {
  const itinHolderCase = isItinHolderCase(context);
  const goalKeyForItin = String((context && (context.coverage_goal || context.intent)) || "").toLowerCase();
  const preferredTypeForGoal = preferredProductTypeForGoal(goalKeyForItin);
  const ragRows = Array.isArray(rows) ? rows : [];
  let matchedRows = ragRows
    .map((r) => {
      const entry = matchAllowedCatalogEntry(r);
      if (!entry) return null;
      return {
        row: r,
        entry,
        key: `${entry.carrierLabel}::${entry.productName}`,
        display_name: catalogDisplayName(entry),
        score: Number.isFinite(Number(r && r.similarity)) ? Number(r.similarity) : 0,
      };
    })
    .filter(Boolean);
  if (itinHolderCase) {
    matchedRows = matchedRows.filter((m) => ITIN_HOLDER_APPROVED_PRODUCTS.has(m.display_name));
    if (preferredTypeForGoal) {
      const typed = matchedRows.filter((m) => String(m.entry && m.entry.productType) === preferredTypeForGoal);
      if (typed.length) matchedRows = typed;
    }
  }

  if (!matchedRows.length) {
    const ctx = context && typeof context === "object" ? context : {};
    const goal = String(ctx.coverage_goal || ctx.intent || "").trim();
    const riskLevel = String((risk && risk.level) || "").toLowerCase();
    let primary = { carrierLabel: "Mutual of Omaha", productName: "Living Promise Whole Life", productType: "final_expense" };
    let alternatives = [
      { carrierLabel: "American Amicable", productName: "Senior Choice", productType: "final_expense" },
      { carrierLabel: "American Amicable", productName: "Easy Term", productType: "term_life" },
      { carrierLabel: "Assurity", productName: "Universal Life", productType: "universal_life" },
    ];

    if (goal === "children_coverage") {
      primary = { carrierLabel: "Mutual of Omaha", productName: "Children's Whole Life", productType: "whole_life" };
      alternatives = [
        { carrierLabel: "Assurity", productName: "Whole Life Protect+", productType: "whole_life" },
        { carrierLabel: "American Amicable", productName: "Family Choice", productType: "whole_life" },
      ];
    } else if (goal === "income_replacement" || goal === "mortgage_protection" || goal === "debt_protection" || goal === "business_continuity") {
      primary =
        riskLevel === "high"
          ? { carrierLabel: "American Amicable", productName: "Home Protector", productType: "term_life" }
          : { carrierLabel: "Mutual of Omaha", productName: "Term Life Answers (TLA)", productType: "term_life" };
      alternatives = [
        { carrierLabel: "American Amicable", productName: "Easy Term", productType: "term_life" },
        { carrierLabel: "Assurity", productName: "Term Life", productType: "term_life" },
        { carrierLabel: "Mutual of Omaha", productName: "Living Promise Whole Life", productType: "final_expense" },
      ];
    } else if (goal === "legacy_planning") {
      primary = { carrierLabel: "Assurity", productName: "Whole Life Protect+", productType: "whole_life" };
      alternatives = [
        { carrierLabel: "American Amicable", productName: "Family Solution", productType: "whole_life" },
        { carrierLabel: "Mutual of Omaha", productName: "Income Advantage IUL", productType: "universal_life" },
      ];
    } else if (riskLevel === "high") {
      primary = { carrierLabel: "American Amicable", productName: "Guaranteed Guardian", productType: "final_expense" };
      alternatives = [
        { carrierLabel: "Mutual of Omaha", productName: "Living Promise Whole Life", productType: "final_expense" },
        { carrierLabel: "American Amicable", productName: "Senior Choice", productType: "final_expense" },
      ];
    }

    let recommendedProduct = `${primary.carrierLabel} — ${primary.productName}`;
    let altProducts = alternatives.map((a) => `${a.carrierLabel} — ${a.productName}`);
    let altTypes = alternatives.map((a) => a.productType);
    if (itinHolderCase) {
      const approved = approvedCatalogObjectsForItinHolder(preferredTypeForGoal);
      if (approved.length) {
        const p = approved[0];
        recommendedProduct = p.name;
        primary.productType = p.type;
        const alts = approved.slice(1, 4);
        altProducts = alts.map((a) => a.name);
        altTypes = alts.map((a) => a.type);
      }
    }
    return {
      product_type: primary.productType,
      recommended_product: recommendedProduct,
      recommended_category: categoryForProductType(primary.productType),
      alternatives: altTypes,
      alternative_products: altProducts,
      rationale:
        itinHolderCase
          ? "RAG fallback mode used with citizenship guardrail: selected from American Amicable products approved for ITIN-holder scenarios."
          : "RAG fallback mode used due to sparse retrieval results; selected the closest allowed catalog product using goal + risk defaults.",
      best_fit_explanation: buildBestFitExplanation(context, risk, recommendedProduct, primary.productType, "fallback"),
      alternative_tradeoffs: buildAlternativeTradeoffs(altProducts, altTypes, context && context.priority_type),
    };
  }

  const scored = new Map();
  matchedRows.forEach((m) => {
    const prev = scored.get(m.key) || { score: 0, entry: m.entry };
    prev.score += m.score;
    scored.set(m.key, prev);
  });
  const ranked = Array.from(scored.entries())
    .map(([key, v]) => ({ key, score: v.score, entry: v.entry }))
    .sort((a, b) => b.score - a.score);
  const primary = ranked[0] || null;
  const alternativesRanked = ranked.slice(1, 4);
  const top = matchedRows[0] ? matchedRows[0].row : {};
  const primaryType = primary ? primary.entry.productType : "life_insurance";
  const recommendedProduct = primary ? `${primary.entry.carrierLabel} — ${primary.entry.productName}` : "";
  const goalKey = String((context && (context.coverage_goal || context.intent)) || "").toLowerCase();
  const riskLevel = String((risk && risk.level) || "").toLowerCase();
  const altObjs = alternativesRanked.map((x) => ({
    name: `${x.entry.carrierLabel} — ${x.entry.productName}`,
    type: x.entry.productType,
  }));
  let finalAltObjs =
    altObjs.length >= 2 ? uniqueAlternativeObjects(recommendedProduct, altObjs) : fallbackAlternativesForContext(recommendedProduct, context);
  const termFocusedGoal = /income_replacement|mortgage_protection|debt_protection|business_continuity/.test(goalKey);
  const carrierSpreadAlts = onePerCarrierAlternatives(recommendedProduct, primaryType);
  if (carrierSpreadAlts.length >= 2) finalAltObjs = carrierSpreadAlts;
  if (termFocusedGoal && primaryType === "term_life" && (riskLevel === "low" || riskLevel === "moderate")) {
    const termCatalogAlts = approvedAlternativesFromCatalog(recommendedProduct, "term_life", 3);
    if (termCatalogAlts.length >= 2) finalAltObjs = termCatalogAlts;
  }
  if (itinHolderCase) {
    const approvedAlts = approvedCatalogObjectsForItinHolder(preferredTypeForGoal)
      .filter((a) => String(a.name || "").toLowerCase() !== String(recommendedProduct || "").toLowerCase())
      .slice(0, 3);
    if (approvedAlts.length) finalAltObjs = approvedAlts;
  }
  const altTypes = finalAltObjs.map((x) => x.type);
  const altProducts = finalAltObjs.map((x) => x.name);
  const rateExample = extractRateExample(
    matchedRows.filter((m) => `${m.entry.carrierLabel} — ${m.entry.productName}` === recommendedProduct).map((m) => m.row)
  );

  return {
    product_type: primaryType,
    recommended_product: recommendedProduct,
    recommended_category: categoryForProductType(primaryType),
    alternatives: altTypes,
    alternative_products: altProducts,
    rationale:
      `RAG-ranked by internal chunk similarity using lead context. ` +
      `Top match carrier=${String(top.carrier || "unknown")}, product=${String(top.product || "unknown")}, ` +
      `category=${String(top.category || "unknown")}, similarity=${Number.isFinite(Number(top.similarity)) ? Number(top.similarity).toFixed(3) : "n/a"}. ` +
      `Risk signal=${risk.level}, intent=${String(context.intent || "unknown")}.` +
      (itinHolderCase ? " Citizenship guardrail applied: ITIN-holder flow restricted to American Amicable approved products." : ""),
    best_fit_explanation: buildBestFitExplanation(context, risk, recommendedProduct, primaryType, "rag", rateExample),
    rate_example: rateExample || null,
    alternative_tradeoffs: buildAlternativeTradeoffs(altProducts, altTypes, context && context.priority_type),
  };
}

function confidenceFrom(context, strategyAnswers, risk, recommendation) {
  const required = ["intent", "coverage_amount", "budget_monthly", "age", "strategy_priority"];
  const present = required.filter((k) => {
    const v = k === "strategy_priority" ? strategyAnswers[k] : context[k];
    return !(v == null || v === "");
  }).length;
  const completeness = present / required.length;
  let score = 0.4 + completeness * 0.35;
  if (risk.level === "low") score += 0.2;
  if (risk.level === "moderate") score += 0.12;
  if (risk.level === "high") score += 0.05;
  if (recommendation && recommendation.product_type) score += 0.08;
  score = Math.max(0.05, Math.min(0.98, score));
  const label = score >= 0.8 ? "High Confidence" : score >= 0.6 ? "Medium Confidence" : "Low Confidence";
  return { score: Number(score.toFixed(2)), label, reason: `Completeness ${Math.round(completeness * 100)}%, risk ${risk.level}` };
}

function normalizedContextFromProfile(profileSnapshot, nonPhiAnswers, phiAnswers) {
  const p = profileSnapshot && typeof profileSnapshot === "object" ? profileSnapshot : {};
  const q = nonPhiAnswers && typeof nonPhiAnswers === "object" ? nonPhiAnswers : {};
  const phi = phiAnswers && typeof phiAnswers === "object" ? phiAnswers : {};
  const age = p.age != null && p.age !== "" ? p.age : q.age;
  return {
    intent: p.coverage_goal || q.coverage_goal || q.intent || "",
    coverage_amount: p.desired_coverage_amount || q.coverage_amount || "",
    budget_monthly: p.monthly_budget || q.budget_monthly || "",
    age: age != null ? String(age) : "",
    protected_who: p.protected_who || q.protected_who || "",
    duration_need: p.duration_need || q.duration_need || "",
    must_have: q.strategy_priority || p.priority || q.must_have || "",
    current_coverage: p.current_coverage || q.current_coverage || "",
    priority_1: q.strategy_priority || p.priority || q.priority_1 || "",
    priority_2: q.priority_2 || "",
    tobacco:
      p.tobacco === true ||
      p.tobacco === "true" ||
      p.tobacco === "yes" ||
      phi.tobacco === true ||
      phi.tobacco === "true" ||
      phi.tobacco === "yes",
    coverage_goal: p.coverage_goal || "",
    strategy_priority: q.strategy_priority || q.priority_type || "",
    normalized_coverage_target: q.normalized_coverage_target || "",
    budget_class: q.budget_class || "",
    priority_type: q.priority_type || "",
    citizenship_status: p.citizenship_status || q.citizenship_status || "",
  };
}

function mapProfilePriorityToStrategyPriority(rawPriority) {
  const t = String(rawPriority || "").trim().toLowerCase();
  if (!t) return "";
  if (t === "lowest_cost" || t === "cost") return "lowest_cost";
  if (t === "immediate_coverage" || t === "speed" || t === "fast_approval") return "immediate_coverage";
  if (t === "approval_certainty" || t === "approval_likelihood") return "approval_certainty";
  return "";
}

async function rpcMatchInternal(cfg, embedding, matchCount, minSimilarity, categoryFilter) {
  const url = `${cfg.supabaseUrl}/rest/v1/rpc/match_internal_knowledge_chunks`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: matchCount,
      min_similarity: minSimilarity,
      carrier_filter: null,
      category_filter: categoryFilter || null,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`internal rag rpc ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text || "[]");
}

async function loadRagRowsGuaranteed(cfg, embedding) {
  const retrievalPasses = [
    { matchCount: 12, minSimilarity: 0.2 },
    { matchCount: 20, minSimilarity: 0.1 },
    { matchCount: 30, minSimilarity: 0.0 },
  ];
  for (const pass of retrievalPasses) {
    const rows = await rpcMatchInternal(cfg, embedding, pass.matchCount, pass.minSimilarity, null);
    if (Array.isArray(rows) && rows.length) return rows;
  }

  const fallbackRows = await restSelect(
    cfg,
    "internal_knowledge_chunks",
    "select=carrier,product,category,content&limit=30"
  );
  const arr = Array.isArray(fallbackRows) ? fallbackRows : [];
  return arr.map((r, idx) =>
    Object.assign({}, r, {
      similarity: Math.max(0.001, 0.01 - idx * 0.0001),
    })
  );
}

function buildSalesScriptAnchor(recommendation, hints) {
  const rec = recommendation && typeof recommendation === "object" ? recommendation : {};
  const h = hints || {};
  const primary = String(rec.recommended_product || "").trim();
  const altProducts = Array.isArray(rec.alternative_products)
    ? rec.alternative_products.map((s) => String(s || "").trim()).filter(Boolean)
    : [];
  const altTypes = Array.isArray(rec.alternatives)
    ? rec.alternatives.map((s) => String(s || "").trim()).filter(Boolean)
    : [];
  const lines = [
    `Client goal (coverage_goal): ${h.coverageGoal || "unknown"}`,
    `Priority (priority_type): ${h.priorityType || "unknown"}`,
    `Risk: ${h.riskLevel || "unknown"}`,
  ];
  if (primary) lines.push(`PRIMARY (use this exact wording as the lead product): ${primary}`);
  if (rec.product_type) lines.push(`Primary product_type: ${String(rec.product_type)}`);
  if (rec.recommended_category) lines.push(`Recommended category: ${String(rec.recommended_category)}`);
  if (altProducts.length) lines.push(`Alternative products (verbatim, if any): ${altProducts.join(" | ")}`);
  else if (altTypes.length) lines.push(`Alternative product types: ${altTypes.join(" | ")}`);
  const rat = String(rec.rationale || "").trim();
  if (rat) lines.push(`Rationale (context only): ${rat.slice(0, 650)}`);
  return lines.join("\n");
}

async function synthesize(openaiKey, query, rows, anchorBlock) {
  const ctx = (rows || [])
    .slice(0, 8)
    .map((r, i) => `[${i + 1}] ${r.carrier}/${r.product}/${r.category}\n${String(r.content || "").slice(0, 1400)}`)
    .join("\n\n---\n\n");
  const anchored =
    anchorBlock && String(anchorBlock).trim()
      ? `\n\nANCHORED RECOMMENDATION (authoritative):\n${String(anchorBlock).trim()}\n`
      : "";
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You are internal insurance sales support for licensed agents. When ANCHORED RECOMMENDATION is present, it is authoritative for the primary product line and any listed alternatives—use those exact names; do not invent, rename, or substitute similarly named products. Use Excerpts only for supporting facts; if an excerpt names a product not in the anchor, do not present it as a recommendation. Tie talking points to the client's stated goal and priority. If the primary is a manual-review / no-match placeholder, write a short script: confirm needs, budget, and health, then direct the agent to carrier underwriting or marketing materials instead of pitching specific product names. Output markdown: Recommendation Support Bullets; Sales Talking Points; Objection Handling.",
        },
        { role: "user", content: `Question:\n${query}${anchored}\n\nExcerpts:\n${ctx}` },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`openai synth ${r.status}`);
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

async function runStage3ChatTurn(openaiKey, context) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You are an internal Product Selector coach helping an agent (Julie) talk with a client. Return STRICT JSON with keys: assistant_reply (string), recommended_product (string), confidence_score (number 0-1), confidence_label (string), confidence_reason (string), next_question (string), sales_script (string). Maintain a single recommendation and try to improve confidence when evidence is clearer. Do not include markdown fences.",
        },
        {
          role: "user",
          content: JSON.stringify(context),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`stage3 chat failed ${r.status}`);
  let parsed = {};
  try {
    parsed = JSON.parse(String(data?.choices?.[0]?.message?.content || "{}"));
  } catch (e) {
    parsed = {};
  }
  return parsed;
}

function categoryForProductType(productType) {
  const t = String(productType || "").toLowerCase();
  if (t === "term_life") return "term_life";
  if (t === "final_expense") return "final_expense";
  if (t === "universal_life") return "universal_life";
  if (t === "whole_life") return "life_insurance";
  return "life_insurance";
}

function topCarriersForCategory(rows, category) {
  const map = new Map();
  (rows || []).forEach((r) => {
    if (!r || !r.carrier) return;
    if (category && String(r.category || "") !== String(category)) return;
    const key = String(r.carrier);
    const sim = Number(r.similarity || 0);
    const prev = map.get(key);
    if (!prev || sim > prev.similarity) {
      map.set(key, { carrier: key, similarity: sim });
    }
  });
  return Array.from(map.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map((x) => x.carrier);
}

const TARGET_CARRIER_RULES = [
  { label: "Mutual of Omaha", match: /mutual\s+of\s+omaha/i },
  { label: "American Amicable", match: /american\s+amicable/i },
  { label: "Assurity", match: /\bassurity\b/i },
];

function topProductsForCarrierCategory(rows, category) {
  const out = {};
  TARGET_CARRIER_RULES.forEach((rule) => {
    const byProduct = new Map();
    (rows || []).forEach((r) => {
      if (!r || !r.carrier || !r.product) return;
      if (category && String(r.category || "") !== String(category)) return;
      if (!rule.match.test(String(r.carrier || ""))) return;
      const product = String(r.product || "").trim();
      if (!product) return;
      const sim = Number(r.similarity || 0);
      const prev = byProduct.get(product);
      if (!prev || sim > prev.similarity) {
        byProduct.set(product, { product, similarity: sim });
      }
    });
    const products = Array.from(byProduct.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map((x) => x.product);
    if (products.length) out[rule.label] = products;
  });
  return out;
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;
  const cfg = serviceConfig();
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    const leadId = String((req.query && req.query.lead_id) || "").trim();
    const leadSourceTable = String((req.query && req.query.lead_source_table) || "").trim();
    if (!isUuid(leadId) || !leadSourceTable) return json(res, 400, { error: "lead_id and lead_source_table required" });
    try {
      const session = await loadSession(cfg, leadId, leadSourceTable);
      let phi = {};
      if (canAccessPhi(auth)) {
        const got = await readPhiByLead(cfg, leadId, leadSourceTable);
        phi = got.payload || {};
      }
      return json(res, 200, { session: session || null, phi_answers: phi, can_access_phi: canAccessPhi(auth) });
    } catch (e) {
      return json(res, 500, { error: "Failed to load selector session" });
    }
  }

  if (req.method === "PUT") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const leadId = String(body.lead_id || "").trim();
    const leadSourceTable = String(body.lead_source_table || "").trim();
    if (!isUuid(leadId) || !leadSourceTable) return json(res, 400, { error: "lead_id and lead_source_table required" });
    try {
      const canPhi = canAccessPhi(auth);
      const split = splitIncomingAnswers(body.qualification_answers, canPhi);
      const existingSession = await loadSession(cfg, leadId, leadSourceTable);
      const resetSession = !!body.reset_session;
      const sanitizedNonPhi = resetSession
        ? Object.assign({}, split.nonPhi)
        : Object.assign({}, (existingSession && existingSession.qualification_answers) || {}, split.nonPhi);
      const phiFromAnswers = split.phi;
      const phiPayload = body.phi_answers && typeof body.phi_answers === "object" ? body.phi_answers : {};
      const resetPhi = !!body.reset_phi;
      const session = await saveSession(cfg, leadId, leadSourceTable, Object.assign({}, body, { qualification_answers: sanitizedNonPhi }));
      if (canPhi && (resetPhi || Object.keys(phiPayload).length || Object.keys(phiFromAnswers).length)) {
        const existing = resetPhi ? {} : (await readPhiByLead(cfg, leadId, leadSourceTable)).payload || {};
        const mergedPhi = normalizePhiPayload(mergePhi(existing, Object.assign({}, phiFromAnswers, phiPayload)));
        await writePhiByLead(
          cfg,
          leadId,
          leadSourceTable,
          mergedPhi,
          auth.user && auth.user.email ? auth.user.email : null
        );
      }
      return json(res, 200, { ok: true, session, can_access_phi: canPhi });
    } catch (e) {
      console.error("product-selector PUT", e);
      return json(res, 500, { error: "Failed to save selector session" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const leadId = String(body.lead_id || "").trim();
    const leadSourceTable = String(body.lead_source_table || "").trim();
    const answers = body.qualification_answers && typeof body.qualification_answers === "object" ? body.qualification_answers : {};
    const profileSnapshot = body.profile_snapshot && typeof body.profile_snapshot === "object" ? body.profile_snapshot : {};
    if (!isUuid(leadId) || !leadSourceTable) return json(res, 400, { error: "lead_id and lead_source_table required" });
    if (!openaiKey) return json(res, 500, { error: "OPENAI_API_KEY missing" });

    try {
      const canPhi = canAccessPhi(auth);
      const split = splitIncomingAnswers(answers, canPhi);
      const existingSession = await loadSession(cfg, leadId, leadSourceTable);
      const phiExisting = canPhi ? (await readPhiByLead(cfg, leadId, leadSourceTable)).payload || {} : {};
      const phiData = canPhi ? normalizePhiPayload(mergePhi(phiExisting, split.phi)) : {};
      const sanitizedNonPhi = Object.assign({}, (existingSession && existingSession.qualification_answers) || {}, split.nonPhi);
      if (!sanitizedNonPhi.coverage_goal && profileSnapshot && profileSnapshot.coverage_goal) {
        sanitizedNonPhi.coverage_goal = String(profileSnapshot.coverage_goal || "").trim();
      }
      if (!sanitizedNonPhi.strategy_priority && profileSnapshot && profileSnapshot.priority) {
        sanitizedNonPhi.strategy_priority = mapProfilePriorityToStrategyPriority(profileSnapshot.priority);
      }
      if (sanitizedNonPhi.coverage_goal && !sanitizedNonPhi.intent) sanitizedNonPhi.intent = sanitizedNonPhi.coverage_goal;
      const context = normalizedContextFromProfile(profileSnapshot, sanitizedNonPhi, phiData);
      const risk = deriveRisk(context, phiData);
      const ragQuery = `Lead intent=${context.intent || ""}, protected=${context.protected_who || ""}, duration=${context.duration_need || ""}, must_have=${context.must_have || ""}, age=${context.age || ""}, coverage=${context.coverage_amount || ""}, budget=${context.budget_monthly || ""}, current_coverage=${context.current_coverage || ""}, priorities=${context.priority_1 || ""}/${context.priority_2 || ""}, risk=${risk.level}, risk_flags=${(risk.flags || []).join(",")}. Determine best-fit product type and alternatives from internal product knowledge only, then provide sales talking points.`;
      const emb = await generateEmbedding(openaiKey, ragQuery);
      const ragRows = await loadRagRowsGuaranteed(cfg, emb.embedding);
      const recommendation = recommendFromRagRows(Object.assign({}, context, sanitizedNonPhi), risk, ragRows);
      const confidence = confidenceFrom(context, sanitizedNonPhi, risk, recommendation);
      const recommendedCarriers = topCarriersForCategory(ragRows, recommendation.recommended_category);
      const alternativeCarriers = {};
      (recommendation.alternatives || []).forEach((alt) => {
        const cat = categoryForProductType(alt);
        alternativeCarriers[alt] = topCarriersForCategory(ragRows, cat);
      });
      recommendation.carrier_guidance = {
        recommended: recommendedCarriers,
        alternatives: alternativeCarriers,
      };
      recommendation.carrier_products = {
        recommended: topProductsForCarrierCategory(ragRows, recommendation.recommended_category),
        alternatives: (function () {
          const map = {};
          (recommendation.alternatives || []).forEach((alt) => {
            const cat = categoryForProductType(alt);
            map[alt] = topProductsForCarrierCategory(ragRows, cat);
          });
          return map;
        })(),
      };
      const salesScript =
        (await synthesize(
          openaiKey,
          ragQuery,
          ragRows,
          buildSalesScriptAnchor(recommendation, {
            coverageGoal: sanitizedNonPhi.coverage_goal,
            priorityType: sanitizedNonPhi.priority_type,
            riskLevel: risk.level,
          })
        )) ||
        "Start with needs-based framing, confirm budget and underwriting sensitivity, then present recommendation and one alternative.";
      const salesEnablement = {
        script: salesScript,
        carrier_talking_points: {
          recommended: recommendedCarriers,
          alternatives: alternativeCarriers,
        },
        objection_handlers: [
          "If price concern: present lower coverage ladder with same product type.",
          "If delay: explain approval risk may worsen with age/health changes.",
          "If confusion: compare recommendation vs alternative on approval likelihood and cash value.",
        ],
        comparison: {
          recommended: recommendation.product_type,
          alternative: recommendation.alternatives[0] || null,
        },
      };

      const session = await saveSession(cfg, leadId, leadSourceTable, {
        qualification_answers: sanitizedNonPhi,
        risk_summary: risk,
        recommendation,
        confidence,
        sales_enablement: salesEnablement,
        workflow_state: { stage: body.stage || "complete", saved_at: new Date().toISOString() },
      });
      if (session && session.id) {
        const wf = Object.assign({}, session.workflow_state || {}, { profile_snapshot: profileSnapshot || {} });
        await saveSession(cfg, leadId, leadSourceTable, Object.assign({}, session, { workflow_state: wf }));
      }
      if (canPhi && Object.keys(split.phi).length) {
        await writePhiByLead(
          cfg,
          leadId,
          leadSourceTable,
          phiData,
          auth.user && auth.user.email ? auth.user.email : null
        );
      }

      return json(res, 200, {
        ok: true,
        recommendation,
        confidence,
        risk_summary: risk,
        sales_enablement: salesEnablement,
        kb_chunks: (ragRows || []).slice(0, 5).map((r) => ({
          carrier: r.carrier,
          product: r.product,
          category: r.category,
          similarity: r.similarity,
        })),
        session,
        can_access_phi: canPhi,
      });
    } catch (e) {
      console.error("product-selector POST", e);
      return json(res, 500, { error: "Failed to generate recommendation" });
    }
  }

  if (req.method === "PATCH") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const leadId = String(body.lead_id || "").trim();
    const leadSourceTable = String(body.lead_source_table || "").trim();
    const goBack = body.go_back === true || body.go_back === "true";
    const userMessage = String(body.message != null ? body.message : "").trim();
    const incomingAnswers =
      body.qualification_answers && typeof body.qualification_answers === "object" ? body.qualification_answers : {};
    const profileSnapshot = body.profile_snapshot && typeof body.profile_snapshot === "object" ? body.profile_snapshot : {};
    if (!isUuid(leadId) || !leadSourceTable) return json(res, 400, { error: "lead_id and lead_source_table required" });
    if (!goBack && !userMessage) return json(res, 400, { error: "message required" });
    if (!openaiKey) return json(res, 500, { error: "OPENAI_API_KEY missing" });

    try {
      const canPhi = canAccessPhi(auth);
      const session =
        (await loadSession(cfg, leadId, leadSourceTable)) || {
          qualification_answers: {},
          risk_summary: {},
          recommendation: {},
          confidence: {},
          sales_enablement: {},
          workflow_state: {},
        };
      const phiStore = canPhi ? await readPhiByLead(cfg, leadId, leadSourceTable) : { payload: {} };
      const existingPhi = phiStore.payload || {};
      const split = splitIncomingAnswers(incomingAnswers, canPhi);
      const mergedAnswers = Object.assign({}, session.qualification_answers || {}, split.nonPhi || {});
      const workflowState = Object.assign({}, session.workflow_state || {});
      if (profileSnapshot && Object.keys(profileSnapshot).length) {
        workflowState.profile_snapshot = Object.assign({}, workflowState.profile_snapshot || {}, profileSnapshot);
      }
      const transcript = Array.isArray(workflowState.stage3_chat) ? workflowState.stage3_chat.slice() : [];
      const isStartSignal = /^(start|begin|go)$/i.test(userMessage);
      const profileGoal = String((workflowState.profile_snapshot && workflowState.profile_snapshot.coverage_goal) || "").trim();
      const knownGoal = String(mergedAnswers.coverage_goal || profileGoal || "").trim();
      const nextNonPhi = Object.assign({}, mergedAnswers);
      const nextPhi = normalizePhiPayload(mergePhi(existingPhi, split.phi || {}));
      if (!nextNonPhi.strategy_priority) {
        const profilePriority = workflowState.profile_snapshot && workflowState.profile_snapshot.priority;
        nextNonPhi.strategy_priority = mapProfilePriorityToStrategyPriority(profilePriority);
      }
      if (!workflowState.goal_phase) workflowState.goal_phase = knownGoal ? "done" : "ask_why";
      if (knownGoal) {
        nextNonPhi.coverage_goal = knownGoal;
        nextNonPhi.intent = knownGoal;
        workflowState.goal_phase = "done";
      }
      if (goBack) {
        if (String(workflowState.goal_phase || "") !== "done") {
          return json(res, 400, { error: "Finish the coverage goal step before using Back." });
        }
        const stack = Array.isArray(workflowState.selector_step_stack) ? workflowState.selector_step_stack.slice() : [];
        if (!stack.length) {
          return json(res, 400, { error: "Nothing to go back to yet." });
        }
        const step = stack.pop();
        const rewindNonPhi = Object.assign({}, session.qualification_answers || {});
        const rewindPhi = normalizePhiPayload(mergePhi(existingPhi, {}));
        clearAnswersFromQuestionOnward(step.key, rewindNonPhi, rewindPhi, canPhi);
        const tr = Array.isArray(workflowState.stage3_chat) ? workflowState.stage3_chat.slice() : [];
        const tlen =
          typeof step.transcriptLen === "number" && step.transcriptLen >= 0 ? step.transcriptLen : Math.max(0, tr.length - 2);
        const sliced = tr.slice(0, tlen);
        const backQ = questionByKey(step.key);
        const backPrompt = questionPromptForStep(backQ, rewindNonPhi);
        const assistantReplyGb = `Went back one step.\n\n${backPrompt || "Previous question."}`;
        sliced.push({
          role: "assistant",
          content: assistantReplyGb,
          ts: new Date().toISOString(),
          key: step.key || null,
        });
        workflowState.selector_step_stack = stack;
        workflowState.stage3_chat = sliced;
        workflowState.current_question_key = step.key || "";
        workflowState.stage = "guided_chat";
        workflowState.stage3_last_message_at = new Date().toISOString();
        const contextGb = normalizedContextFromProfile(workflowState.profile_snapshot || {}, rewindNonPhi, rewindPhi);
        const riskGb = deriveRisk(contextGb, rewindPhi);
        const ragQueryGb = `Lead intent=${contextGb.intent || ""}, protected=${contextGb.protected_who || ""}, duration=${contextGb.duration_need || ""}, must_have=${contextGb.must_have || ""}, age=${contextGb.age || ""}, coverage=${contextGb.coverage_amount || ""}, budget=${contextGb.budget_monthly || ""}, current_coverage=${contextGb.current_coverage || ""}, priorities=${contextGb.priority_1 || ""}/${contextGb.priority_2 || ""}, risk=${riskGb.level}, risk_flags=${(riskGb.flags || []).join(",")}. Determine best-fit product type and alternatives from internal product knowledge only, then provide sales talking points.`;
        const embGb = await generateEmbedding(openaiKey, ragQueryGb);
        const ragRowsGb = await loadRagRowsGuaranteed(cfg, embGb.embedding);
        const nextRecommendationGb = recommendFromRagRows(
          Object.assign({}, contextGb, rewindNonPhi, rewindPhi),
          riskGb,
          ragRowsGb
        );
        const nextRecommendedCarriersGb = topCarriersForCategory(ragRowsGb, nextRecommendationGb.recommended_category);
        const nextAlternativeCarriersGb = {};
        (nextRecommendationGb.alternatives || []).forEach((alt) => {
          const cat = categoryForProductType(alt);
          nextAlternativeCarriersGb[alt] = topCarriersForCategory(ragRowsGb, cat);
        });
        nextRecommendationGb.carrier_guidance = {
          recommended: nextRecommendedCarriersGb,
          alternatives: nextAlternativeCarriersGb,
        };
        nextRecommendationGb.carrier_products = {
          recommended: topProductsForCarrierCategory(ragRowsGb, nextRecommendationGb.recommended_category),
          alternatives: (function () {
            const map = {};
            (nextRecommendationGb.alternatives || []).forEach((alt) => {
              const cat = categoryForProductType(alt);
              map[alt] = topProductsForCarrierCategory(ragRowsGb, cat);
            });
            return map;
          })(),
        };
        const nextQuestionTextGb = backPrompt || "";
        if (nextQuestionTextGb) nextRecommendationGb.next_question = nextQuestionTextGb;
        const nextConfidenceGb = confidenceFrom(contextGb, rewindNonPhi, riskGb, nextRecommendationGb);
        const nextSalesGb = Object.assign({}, session.sales_enablement || {});
        nextSalesGb.script =
          (await synthesize(
            openaiKey,
            ragQueryGb,
            ragRowsGb,
            buildSalesScriptAnchor(nextRecommendationGb, {
              coverageGoal: rewindNonPhi.coverage_goal,
              priorityType: rewindNonPhi.priority_type,
              riskLevel: riskGb.level,
            })
          )) ||
          nextSalesGb.script ||
          "Confirm priorities, budget, and eligibility before presenting recommendation.";
        const savedGb = await saveSessionWithTranscriptFallback(cfg, leadId, leadSourceTable, {
          qualification_answers: rewindNonPhi,
          risk_summary: riskGb,
          recommendation: nextRecommendationGb,
          confidence: nextConfidenceGb,
          sales_enablement: nextSalesGb,
          workflow_state: workflowState,
        });
        if (canPhi) {
          await writePhiByLead(
            cfg,
            leadId,
            leadSourceTable,
            rewindPhi,
            auth.user && auth.user.email ? auth.user.email : null
          );
        }
        return json(res, 200, {
          ok: true,
          assistant_reply: assistantReplyGb,
          recommendation: nextRecommendationGb,
          confidence: nextConfidenceGb,
          sales_enablement: nextSalesGb,
          risk_summary: riskGb,
          workflow_state: workflowState,
          next_question: nextQuestionTextGb || null,
          qualification_answers: rewindNonPhi,
          phi_answers: canPhi ? rewindPhi : {},
          can_access_phi: canPhi,
          session: savedGb,
          step_stack_depth: stack.length,
        });
      }
      const currentKey = String(workflowState.current_question_key || "") || nextQuestionKey(mergedAnswers, existingPhi, canPhi);
      const currentQuestion = questionByKey(currentKey);
      const transcriptLenBeforeTurn = transcript.length;
      transcript.push({ role: "agent", content: userMessage, ts: new Date().toISOString(), key: currentKey || null });

      let assistantReply = "";
      let nextQuestionText = "";
      if (workflowState.goal_phase !== "done") {
        if (isStartSignal) {
          assistantReply = defaultGoalQuestionPrompt();
          nextQuestionText = COVERAGE_GOAL_QUESTION;
        } else if (workflowState.goal_phase === "ask_why") {
          const priorRaw = String(workflowState.goal_raw_draft || "").trim();
          const numGoal = goalKeyFromExampleListNumber(userMessage);
          let rawGoalInput;
          let inferred;
          if (numGoal) {
            workflowState.goal_raw_draft = "";
            rawGoalInput = `Example #${String(userMessage || "").trim()}: ${goalLabel(numGoal)}`;
            inferred = {
              goal: numGoal,
              confidence: 0.92,
              topScore: 10,
              secondScore: 0,
              reason: "example_list_number",
            };
          } else {
            rawGoalInput = priorRaw ? `${priorRaw}. ${userMessage}` : userMessage;
            inferred = classifyCoverageGoal(rawGoalInput);
          }
          if (isGoalConfidenceLow(inferred)) {
            workflowState.goal_raw_draft = rawGoalInput;
            const nGoals = coverageGoalOrderedKeys().length;
            assistantReply = [
              "I want to make sure I classify this correctly. Describe again in your own words, add a bit more detail from the client, or reply with the list number (1–" +
                nGoals +
                ").",
              "",
              PS_GOAL_TABLE_SENTINEL,
            ].join("\n");
            nextQuestionText = COVERAGE_GOAL_QUESTION;
          } else if (numGoal) {
            finalizeCommittedCoverageGoal(workflowState, nextNonPhi, inferred.goal, rawGoalInput);
            const saved = assistantReplyAfterGoalSaved(inferred.goal, nextNonPhi, nextPhi, canPhi);
            assistantReply = saved.assistantReply;
            nextQuestionText = saved.nextQuestionText;
          } else {
            workflowState.goal_phase = "await_confirm";
            workflowState.goal_candidate = inferred.goal;
            workflowState.goal_confidence = inferred.confidence;
            workflowState.goal_notes = rawGoalInput;
            workflowState.goal_raw_draft = "";
            assistantReply = `I think the goal is ${goalLabel(inferred.goal)}. Is that correct?`;
            nextQuestionText = assistantReply;
          }
        } else if (workflowState.goal_phase === "await_confirm") {
          const candidate = String(workflowState.goal_candidate || "").trim();
          const override = extractCoverageGoalOverride(userMessage);
          const isConfirm = isAffirmative(userMessage);
          const confirmedGoal = override || (isConfirm ? candidate : "");
          if (!confirmedGoal) {
            const nGoals = coverageGoalOrderedKeys().length;
            assistantReply = [
              `Please answer yes if "${goalLabel(candidate)}" is the right goal, describe the situation again, or send the list number (1–${nGoals}) for a different example.`,
              "",
              PS_GOAL_TABLE_SENTINEL,
            ].join("\n");
            nextQuestionText = assistantReply;
          } else {
            finalizeCommittedCoverageGoal(
              workflowState,
              nextNonPhi,
              confirmedGoal,
              String(workflowState.goal_notes || workflowState.goal_raw_draft || "").trim(),
            );
            const saved = assistantReplyAfterGoalSaved(confirmedGoal, nextNonPhi, nextPhi, canPhi);
            assistantReply = saved.assistantReply;
            nextQuestionText = saved.nextQuestionText;
          }
        }
      } else if (isStartSignal && currentQuestion) {
        const stPrompt = questionPromptForStep(currentQuestion, nextNonPhi);
        assistantReply = `Let's begin qualification. ${stPrompt}`;
        nextQuestionText = stPrompt;
      } else if (currentQuestion) {
        const curPrompt = questionPromptForStep(currentQuestion, nextNonPhi);
        const clarifyReply = clarificationForQuestion(currentQuestion, userMessage);
        if (clarifyReply) {
          assistantReply = clarifyReply;
          nextQuestionText = curPrompt;
        } else if (shouldRestateQuestion(userMessage)) {
          assistantReply = `The question is: "${curPrompt}" Please answer yes or no.`;
          nextQuestionText = curPrompt;
        } else {
        let advanceQualification = false;
        let healthPrescreenHandled = false;
        let majorConditionsHandled = false;
        let finalHealthHandled = false;

        if (currentQuestion.key === "health_prescreen_overall") {
          healthPrescreenHandled = true;
          const pr = parseHealthPrescreenOverall(userMessage);
          if (pr.mode === "invalid") {
              assistantReply =
                "Please reply **no**, **yes**, or the numbers that apply (example: **3, 6**).";
            nextQuestionText = curPrompt;
          } else {
            advanceQualification = true;
            if (pr.mode === "no") {
              nextPhi.health_prescreen_overall = false;
              applyHealthPrescreenNoDerivations(nextPhi);
            } else if (pr.mode === "yes_word") {
              nextPhi.health_prescreen_overall = true;
            } else {
              applyHealthPrescreenNumberPicks(nextPhi, pr.pickSet);
              nextPhi.health_prescreen_overall = !!pr.anyPositive;
            }
          }
        }

        if (currentQuestion.key === "has_major_conditions") {
          majorConditionsHandled = true;
          const mr = parseMajorConditionsSelection(userMessage);
          if (mr.mode === "invalid" || mr.mode === "yes_word") {
            assistantReply = "Reply **no**, or list the condition numbers that apply (example: **2, 6**).";
            nextQuestionText = curPrompt;
          } else {
            advanceQualification = true;
            if (mr.mode === "no") {
              nextPhi.has_major_conditions = false;
              nextPhi.heart_event_recent = false;
              nextPhi.cancer_active = false;
              nextPhi.copd_diagnosed = false;
              nextPhi.dementia_cognitive = false;
              nextPhi.diabetes = false;
              delete nextPhi.diabetes_type;
              delete nextPhi.diabetes_insulin;
              delete nextPhi.diabetes_complications;
              nextPhi.kidney_disease = false;
              nextPhi.liver_disease = false;
              nextPhi.neurological_condition = false;
              nextPhi.high_blood_pressure = false;
              delete nextPhi.bp_controlled;
              nextPhi.cholesterol_high = false;
              delete nextPhi.cholesterol_medication;
              delete nextPhi.cholesterol_controlled;
              nextPhi.sleep_apnea = false;
              delete nextPhi.cpap_use;
              nextPhi.depression = false;
              delete nextPhi.depression_treated;
              nextPhi.atrial_fibrillation = false;
              delete nextPhi.afib_controlled;
            } else {
              applyMajorConditionsNumberPicks(nextPhi, mr.pickSet);
            }
          }
        }

        if (currentQuestion.key === "final_health_conditions") {
          finalHealthHandled = true;
          const fr = parseFinalHealthSelection(userMessage);
          if (fr.mode === "invalid") {
            assistantReply = "Reply **no**, or list the condition numbers that apply (example: **1, 3**).";
            nextQuestionText = curPrompt;
          } else {
            advanceQualification = true;
            if (fr.mode === "no") {
              nextPhi.final_health_conditions = false;
              nextPhi.heart_event_recent = false;
              delete nextPhi.heart_event_date;
              delete nextPhi.heart_event_type;
              nextPhi.cancer_active = false;
              delete nextPhi.cancer_type;
              delete nextPhi.cancer_treatment_status;
              nextPhi.dementia_cognitive = false;
            } else {
              nextPhi.final_health_conditions = true;
              applyFinalHealthNumberPicks(nextPhi, fr.pickSet);
            }
          }
        }

        if (!healthPrescreenHandled && !majorConditionsHandled && !finalHealthHandled) {
        const parsed = parseAnswerByType(currentQuestion, userMessage);
        if (parsed == null) {
          if (currentQuestion.type === "boolean") {
            const interruptionReply = await handleBooleanInterruption(openaiKey, curPrompt, userMessage);
            assistantReply = containsPrompt(interruptionReply, curPrompt)
              ? interruptionReply
              : `${interruptionReply} ${curPrompt}`;
          } else {
            assistantReply = `I couldn't map that answer for "${curPrompt}". Please reply in a clearer format.`;
          }
          nextQuestionText = curPrompt;
        } else {
          advanceQualification = true;
          if (currentQuestion.phi) nextPhi[currentQuestion.key] = parsed;
          if (currentQuestion.key === "high_blood_pressure" && parsed === true) {
            // Always collect current control status after a fresh HBP "yes" answer.
            delete nextPhi.bp_controlled;
          }
          if (currentQuestion.key === "cholesterol_high" && parsed === true) {
            delete nextPhi.cholesterol_medication;
            delete nextPhi.cholesterol_controlled;
          }
          if (currentQuestion.key === "sleep_apnea" && parsed === true) {
            delete nextPhi.cpap_use;
          }
          if (currentQuestion.key === "depression" && parsed === true) {
            delete nextPhi.depression_treated;
          }
          if (currentQuestion.key === "diabetes" && parsed === true) {
            delete nextPhi.diabetes_type;
            delete nextPhi.diabetes_insulin;
            delete nextPhi.diabetes_complications;
          }
          if (currentQuestion.key === "atrial_fibrillation" && parsed === true) {
            delete nextPhi.afib_controlled;
          }
          if (currentQuestion.key === "heart_event_recent" && parsed === true) {
            delete nextPhi.heart_event_date;
            delete nextPhi.heart_event_type;
          }
          if (currentQuestion.key === "cancer_active" && parsed === true) {
            delete nextPhi.cancer_type;
            delete nextPhi.cancer_treatment_status;
          }
          if (currentQuestion.key === "cholesterol_controlled" && parsed === true) {
            // If cholesterol is controlled, assume medication is present unless already answered otherwise.
            if (nextPhi.cholesterol_medication !== false) nextPhi.cholesterol_medication = true;
          }
          if (currentQuestion.key === "current_medications") {
            nextPhi.current_medications = normalizeMedicationList(parsed);
            nextPhi.medication_count = nextPhi.current_medications.length;
          } else if (currentQuestion.key === "normalized_coverage_target") {
            const goalKey = String(nextNonPhi.coverage_goal || "").trim();
            const rawCov = String(userMessage || "").trim();
            const menuCov = coverageMenuPickFromListNumber(rawCov);
            const normCoverage = menuCov
              ? menuCov
              : normalizeCoverageTarget(parsed, goalKey) || String(parsed || "").trim();
            nextNonPhi.normalized_coverage_target = normCoverage || String(parsed || "");
            if (!nextNonPhi.coverage_amount) nextNonPhi.coverage_amount = nextNonPhi.normalized_coverage_target;
          } else if (currentQuestion.key === "budget_class") {
            const rawBudgetMsg = String(userMessage || "").trim();
            const menuPick = budgetMenuPickFromListNumber(rawBudgetMsg);
            let b = "";
            if (menuPick) {
              b = menuPick.budget_class;
              nextNonPhi.budget_monthly = menuPick.budget_monthly;
            } else {
              b = normalizeBudgetClass(parsed);
              const rawP = String(parsed || "").trim();
              if (/^\d+(\.\d+)?$/.test(rawP)) {
                nextNonPhi.budget_monthly = String(Math.round(Number(rawP)));
              } else if (b === "not_sure") {
                nextNonPhi.budget_monthly = "";
              } else if (!nextNonPhi.budget_monthly) {
                nextNonPhi.budget_monthly = b;
              }
            }
            if (!b) {
              advanceQualification = false;
              assistantReply = [
                "I could not match that to a monthly budget yet.",
                "",
                `Send 1–${BUDGET_MONTHLY_MENU.length} to pick the numbered amount, a dollar amount (for example 75), or say not sure.`,
                "",
                BUDGET_CLASS_PROMPT,
              ].join("\n");
              nextQuestionText = curPrompt;
            } else {
              nextNonPhi.budget_class = b;
            }
          } else if (currentQuestion.key === "priority_type") {
            const covGoal = String(nextNonPhi.coverage_goal || "").trim();
            const allowedPr = allowedPriorityTypesForGoal(covGoal);
            const menuPick = priorityTypeFromListNumber(String(userMessage || "").trim(), covGoal);
            const rawPriority = menuPick || String(parsed || "").trim();
            let p = normalizePriorityType(rawPriority, covGoal);
            if (!p && openaiKey) {
              p = await classifyPriorityTypeOpenEnded(openaiKey, rawPriority, allowedPr);
            }
            if (!p || !allowedPr.includes(p)) {
              advanceQualification = false;
              const prPrompt = buildPriorityTypePrompt(covGoal);
              assistantReply = [
                "I could not tell which priority fits best from that answer.",
                "",
                "Describe what the client said in your own words, or reply with a list number from the question.",
                "",
                prPrompt,
              ].join("\n");
              nextQuestionText = prPrompt;
            } else {
              nextNonPhi.priority_type = p;
              if (!nextNonPhi.strategy_priority) {
                nextNonPhi.strategy_priority = mapPriorityTypeToStrategyPriority(p);
              }
            }
          } else if (currentQuestion.key === "has_major_conditions" && parsed === false) {
            nextPhi.has_major_conditions = false;
            nextPhi.heart_event_recent = false;
            nextPhi.cancer_active = false;
            nextPhi.copd_diagnosed = false;
            nextPhi.dementia_cognitive = false;
            nextPhi.diabetes = false;
            nextPhi.kidney_disease = false;
            nextPhi.liver_disease = false;
            nextPhi.neurological_condition = false;
          } else if (currentQuestion.key === "health_disqualifier_any" && parsed === false) {
            nextPhi.terminal_illness = false;
            nextPhi.organ_transplant = false;
            nextPhi.aids_hiv = false;
            nextPhi.dialysis = false;
          } else if (currentQuestion.key === "functional_status_any" && parsed === false) {
            nextPhi.nursing_home_resident = false;
            nextPhi.wheelchair_bedridden = false;
            nextPhi.adl_assistance = false;
          } else if (!currentQuestion.phi) {
            nextNonPhi[currentQuestion.key] = parsed;
          }
        }
        }
        if (advanceQualification) {
            if (String(workflowState.goal_phase || "") === "done" && currentQuestion && currentQuestion.key) {
              if (!Array.isArray(workflowState.selector_step_stack)) workflowState.selector_step_stack = [];
              workflowState.selector_step_stack.push({ key: currentQuestion.key, transcriptLen: transcriptLenBeforeTurn });
            }
            const nk = nextQuestionKey(nextNonPhi, nextPhi, canPhi);
            if (nk) {
              const nq = questionByKey(nk);
              nextQuestionText = nq ? questionPromptForStep(nq, nextNonPhi) : "";
              assistantReply = `Saved. Next:\n\n${nextQuestionText}`;
            } else {
              assistantReply = "Great. We have enough qualification data. I am generating recommendation details now.";
            }
          }
        }
      } else {
        const nk0 = nextQuestionKey(nextNonPhi, nextPhi, canPhi);
        if (nk0) {
          const nq0 = questionByKey(nk0);
          nextQuestionText = nq0 ? questionPromptForStep(nq0, nextNonPhi) : "";
          assistantReply = `Let's begin qualification. ${nextQuestionText}`;
        }
      }
      if (nextPhi.takes_prescription_medications === false) {
        delete nextPhi.medication_uw_classification;
      } else if (openaiKey && canPhi) {
        const medSig = medListSignature(nextPhi.current_medications || []);
        const prevSig =
          nextPhi.medication_uw_classification && nextPhi.medication_uw_classification.input_signature;
        if (medSig && medSig !== prevSig) {
          try {
            nextPhi.medication_uw_classification = await classifyMedicationsWithOpenAI(
              openaiKey,
              nextPhi.current_medications || []
            );
          } catch (_e) {}
        }
        if (nextPhi.takes_prescription_medications === true && !medSig) {
          delete nextPhi.medication_uw_classification;
        }
      }
      const context = normalizedContextFromProfile(workflowState.profile_snapshot || {}, nextNonPhi, nextPhi);
      const risk = deriveRisk(context, nextPhi);
      const ragQuery = `Lead intent=${context.intent || ""}, protected=${context.protected_who || ""}, duration=${context.duration_need || ""}, must_have=${context.must_have || ""}, age=${context.age || ""}, coverage=${context.coverage_amount || ""}, budget=${context.budget_monthly || ""}, current_coverage=${context.current_coverage || ""}, priorities=${context.priority_1 || ""}/${context.priority_2 || ""}, risk=${risk.level}, risk_flags=${(risk.flags || []).join(",")}. Determine best-fit product type and alternatives from internal product knowledge only, then provide sales talking points.`;
      let nextRecommendation;
      let nextConfidence;
      const nextSales = Object.assign({}, session.sales_enablement || {});
      try {
        const emb = await generateEmbedding(openaiKey, ragQuery);
        const ragRows = await loadRagRowsGuaranteed(cfg, emb.embedding);
        nextRecommendation = recommendFromRagRows(Object.assign({}, context, nextNonPhi, nextPhi), risk, ragRows);
        const nextRecommendedCarriers = topCarriersForCategory(ragRows, nextRecommendation.recommended_category);
        const nextAlternativeCarriers = {};
        (nextRecommendation.alternatives || []).forEach((alt) => {
          const cat = categoryForProductType(alt);
          nextAlternativeCarriers[alt] = topCarriersForCategory(ragRows, cat);
        });
        nextRecommendation.carrier_guidance = {
          recommended: nextRecommendedCarriers,
          alternatives: nextAlternativeCarriers,
        };
        nextRecommendation.carrier_products = {
          recommended: topProductsForCarrierCategory(ragRows, nextRecommendation.recommended_category),
          alternatives: (function () {
            const map = {};
            (nextRecommendation.alternatives || []).forEach((alt) => {
              const cat = categoryForProductType(alt);
              map[alt] = topProductsForCarrierCategory(ragRows, cat);
            });
            return map;
          })(),
        };
        if (nextQuestionText) nextRecommendation.next_question = nextQuestionText;
        nextConfidence = confidenceFrom(context, nextNonPhi, risk, nextRecommendation);
        nextSales.script =
          (await synthesize(
            openaiKey,
            ragQuery,
            ragRows,
            buildSalesScriptAnchor(nextRecommendation, {
              coverageGoal: nextNonPhi.coverage_goal,
              priorityType: nextNonPhi.priority_type,
              riskLevel: risk.level,
            })
          )) ||
          nextSales.script ||
          "Confirm priorities, budget, and eligibility before presenting recommendation.";
      } catch (ragSynthErr) {
        console.error("product-selector PATCH rag/embed/synth", ragSynthErr);
        nextRecommendation = recommendFromRagRows(Object.assign({}, context, nextNonPhi, nextPhi), risk, []);
        if (nextQuestionText) nextRecommendation.next_question = nextQuestionText;
        nextRecommendation.rationale =
          (nextRecommendation.rationale || "") +
          " (Recommendation used offline fallback because retrieval or script generation failed; check OpenAI and Supabase internal RAG.)";
        nextConfidence = confidenceFrom(context, nextNonPhi, risk, nextRecommendation);
        nextSales.script =
          nextSales.script ||
          "Confirm priorities, budget, and eligibility before presenting recommendation. Internal product search or script generation was unavailable this turn.";
      }

      transcript.push({ role: "assistant", content: assistantReply, ts: new Date().toISOString(), key: currentKey || null });
      workflowState.stage = nextQuestionText ? "guided_chat" : "complete";
      workflowState.stage3_chat = transcript;
      workflowState.stage3_last_message_at = new Date().toISOString();
      workflowState.current_question_key = nextQuestionText ? nextQuestionKey(nextNonPhi, nextPhi, canPhi) : "";
      workflowState.pending_required = QUESTION_FLOW
        .map((q) => q.key)
        .filter((k) => {
          const q = questionByKey(k);
          if (q && q.phi && !canPhi) return false;
          if (q && typeof q.askIf === "function" && !q.askIf(nextNonPhi, nextPhi)) return false;
          const src = q && q.phi ? nextPhi : nextNonPhi;
          const v = src[k];
          return (
            v == null ||
            v === "" ||
            (Array.isArray(v) && !v.length && k !== "conditions" && k !== "current_medications")
          );
        });

      const saved = await saveSessionWithTranscriptFallback(cfg, leadId, leadSourceTable, {
        qualification_answers: nextNonPhi,
        risk_summary: risk,
        recommendation: nextRecommendation,
        confidence: nextConfidence,
        sales_enablement: nextSales,
        workflow_state: workflowState,
      });
      if (canPhi) {
        try {
          await writePhiByLead(
            cfg,
            leadId,
            leadSourceTable,
            nextPhi,
            auth.user && auth.user.email ? auth.user.email : null
          );
        } catch (phiErr) {
          if (nextPhi && nextPhi.medication_uw_classification) {
            const slimPhi = Object.assign({}, nextPhi);
            delete slimPhi.medication_uw_classification;
            console.error(
              "product-selector writePhi failed; retrying without medication_uw_classification",
              phiErr && phiErr.message
            );
            await writePhiByLead(
              cfg,
              leadId,
              leadSourceTable,
              slimPhi,
              auth.user && auth.user.email ? auth.user.email : null
            );
            delete nextPhi.medication_uw_classification;
          } else {
            throw phiErr;
          }
        }
      }

      return json(res, 200, {
        ok: true,
        assistant_reply: assistantReply,
        recommendation: nextRecommendation,
        confidence: nextConfidence,
        sales_enablement: nextSales,
        risk_summary: risk,
        workflow_state: workflowState,
        next_question: nextQuestionText || null,
        qualification_answers: nextNonPhi,
        phi_answers: canPhi ? nextPhi : {},
        can_access_phi: canPhi,
        session: saved,
      });
    } catch (e) {
      console.error("product-selector PATCH", e);
      const detail = e && e.message ? String(e.message).slice(0, 420) : String(e).slice(0, 420);
      return json(res, 500, { error: "Stage 3 chat failed", detail });
    }
  }

  res.setHeader("Allow", "GET, PUT, POST, PATCH");
  return json(res, 405, { error: "Method Not Allowed" });
};
