const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");
const { generateEmbedding } = require("../../lib/openai");
const { canAccessPhi } = require("../../lib/staff-permissions");
const { readPhiByLead, writePhiByLead } = require("../../lib/phi-store");

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

function bool(v) {
  return !!v;
}

const PHI_FIELD_KEYS = [
  "takes_prescription_medications",
  "has_major_conditions",
  "recent_hospitalizations",
  "doctor_visits_2y",
  "conditions",
  "prescription_meds_text",
  "hospitalization_reason",
  "heart_attack",
  "stroke_tia",
  "heart_disease",
  "heart_surgery_stents",
  "congestive_heart_failure",
  "diabetes",
  "insulin_use",
  "cancer_history",
  "current_cancer_treatment",
  "copd_emphysema",
  "chronic_lung_disease",
  "oxygen_use",
  "kidney_disease",
  "dialysis",
  "liver_disease_cirrhosis_hepatitis",
  "alzheimers_dementia_memory_condition",
  "hospice_care",
  "bedridden",
  "needs_help_daily_activities",
  "home_health_care",
  "hospitalization_last_2y",
  "surgery_last_2y",
  "upcoming_procedure_scheduled",
  "other_major_condition",
  "other_condition_notes",
];

const LEGACY_PHI_ALIASES = {
  prescription_meds: "takes_prescription_medications",
  hospitalized_5y: "recent_hospitalizations",
  cognitive_impairment: "alzheimers_dementia_memory_condition",
};

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

const QUESTION_FLOW = [
  {
    key: "takes_prescription_medications",
    prompt: "Is the client currently taking prescription medications? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "has_major_conditions",
    prompt: "Any major health conditions diagnosed? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "conditions",
    prompt: "Please list known conditions (comma-separated), or type none.",
    type: "list",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      const phi = phiAnswers || {};
      return phi.has_major_conditions === true || phi.other_major_condition === true;
    },
  },
  {
    key: "hospitalization_last_2y",
    prompt: "Any hospitalization in the last 2 years? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "hospitalization_reason",
    prompt: "What was the hospitalization reason? (short text; type none if unknown)",
    type: "text",
    phi: true,
    askIf: function (nonPhiAnswers, phiAnswers) {
      const phi = phiAnswers || {};
      return phi.hospitalization_last_2y === true || phi.recent_hospitalizations === true;
    },
  },
  {
    key: "alzheimers_dementia_memory_condition",
    prompt: "Any Alzheimer's, dementia, or memory-related condition? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "doctor_visits_2y",
    prompt: "Any doctor visits in the last 2 years? (yes/no)",
    type: "boolean",
    phi: true,
  },
  {
    key: "strategy_priority",
    prompt:
      "For this case, should we prioritize lowest monthly cost, immediate coverage, or approval certainty?",
    type: "choice",
    options: ["lowest_cost", "immediate_coverage", "approval_certainty"],
    phi: false,
  },
  {
    key: "graded_benefit_ok",
    prompt:
      "If eligibility is limited, is the client comfortable with a graded benefit option? (yes/no)",
    type: "boolean",
    phi: false,
  },
  {
    key: "carrier_preference",
    prompt:
      "Any carrier preference or constraints we should apply before final recommendation? (type none if no preference)",
    type: "text",
    phi: false,
  },
];

function parseAnswerByType(q, raw) {
  const t = String(raw || "").trim();
  if (!t) return null;
  if (q.type === "number") {
    const n = Number(t.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? String(Math.round(n)) : null;
  }
  if (q.type === "boolean") {
    if (/^(yes|y|true|1|si|sí)$/i.test(t)) return true;
    if (/^(no|n|false|0)$/i.test(t)) return false;
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

function nextQuestionKey(nonPhiAnswers, phiAnswers, allowPhi) {
  for (const q of QUESTION_FLOW) {
    if (q.phi && !allowPhi) continue;
    if (typeof q.askIf === "function" && !q.askIf(nonPhiAnswers, phiAnswers)) continue;
    const source = q.phi ? (phiAnswers || {}) : (nonPhiAnswers || {});
    const v = source[q.key];
    const missing =
      v == null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0 && q.key !== "conditions");
    if (missing) return q.key;
  }
  return "";
}

function questionByKey(key) {
  return QUESTION_FLOW.find((q) => q.key === key) || null;
}

function deriveRisk(context, phiAnswers) {
  const merged = Object.assign({}, context || {}, phiAnswers || {});
  const cond = Array.isArray(merged.conditions) ? merged.conditions : [];
  const hasMajorCondition = cond.some((c) => /heart|cancer|stroke|copd|kidney|cirrhosis|insulin/i.test(String(c || "")));
  const meds = bool(merged.takes_prescription_medications || merged.prescription_meds);
  const hosp = bool(merged.hospitalization_last_2y || merged.recent_hospitalizations || merged.hospitalized_5y);
  const doc = bool(merged.doctor_visits_2y);
  const cognitive = bool(merged.alzheimers_dementia_memory_condition);
  const careNeeds = bool(merged.hospice_care) || bool(merged.bedridden) || bool(merged.needs_help_daily_activities);
  const tobacco = bool(merged.tobacco);
  let level = "low";
  if (cognitive || careNeeds || hasMajorCondition || hosp || (meds && cond.length >= 2)) level = "high";
  else if (meds || doc || tobacco || cond.length) level = "moderate";
  const flags = [];
  if (hasMajorCondition) flags.push("major_condition");
  if (hosp) flags.push("recent_hospitalization");
  if (meds) flags.push("rx_meds");
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

function recommendFromRagRows(context, risk, rows) {
  const ragRows = Array.isArray(rows) ? rows : [];
  if (!ragRows.length) {
    return {
      product_type: "whole_life",
      recommended_category: "life_insurance",
      alternatives: ["term_life", "final_expense", "universal_life"],
      rationale: "RAG fallback mode used due to sparse retrieval results; defaulted from internal corpus baseline.",
    };
  }

  const scored = new Map();
  ragRows.forEach((r) => {
    const key = normalizeProductType(r && r.product, r && r.category);
    const sim = Number(r && r.similarity);
    const score = Number.isFinite(sim) ? sim : 0;
    const prev = scored.get(key) || 0;
    scored.set(key, prev + score);
  });
  const ranked = Array.from(scored.entries()).sort((a, b) => b[1] - a[1]);
  const primaryType = ranked[0] ? ranked[0][0] : "life_insurance";
  const alternatives = ranked.slice(1, 4).map((x) => x[0]);
  const top = ragRows[0] || {};

  return {
    product_type: primaryType,
    recommended_category: categoryForProductType(primaryType),
    alternatives,
    rationale:
      `RAG-ranked by internal chunk similarity using lead context. ` +
      `Top match carrier=${String(top.carrier || "unknown")}, product=${String(top.product || "unknown")}, ` +
      `category=${String(top.category || "unknown")}, similarity=${Number.isFinite(Number(top.similarity)) ? Number(top.similarity).toFixed(3) : "n/a"}. ` +
      `Risk signal=${risk.level}, intent=${String(context.intent || "unknown")}.`,
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
    intent: p.coverage_goal || q.intent || "",
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
    strategy_priority: q.strategy_priority || "",
  };
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

async function synthesize(openaiKey, query, rows) {
  const ctx = (rows || [])
    .slice(0, 8)
    .map((r, i) => `[${i + 1}] ${r.carrier}/${r.product}/${r.category}\n${String(r.content || "").slice(0, 1400)}`)
    .join("\n\n---\n\n");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are internal insurance sales support. Use only provided excerpts. Return concise recommendation support bullets and objection handling. Explicitly name carriers that support the recommended product and alternatives when excerpts indicate them.",
        },
        { role: "user", content: `Question:\n${query}\n\nExcerpts:\n${ctx}` },
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
      const sanitizedNonPhi = split.nonPhi;
      const phiFromAnswers = split.phi;
      const phiPayload = body.phi_answers && typeof body.phi_answers === "object" ? body.phi_answers : {};
      const session = await saveSession(cfg, leadId, leadSourceTable, Object.assign({}, body, { qualification_answers: sanitizedNonPhi }));
      if (canPhi && (Object.keys(phiPayload).length || Object.keys(phiFromAnswers).length)) {
        const existing = (await readPhiByLead(cfg, leadId, leadSourceTable)).payload || {};
        const mergedPhi = mergePhi(existing, Object.assign({}, phiFromAnswers, phiPayload));
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
      const phiExisting = canPhi ? (await readPhiByLead(cfg, leadId, leadSourceTable)).payload || {} : {};
      const phiData = canPhi ? mergePhi(phiExisting, split.phi) : {};
      const sanitizedNonPhi = split.nonPhi;
      const context = normalizedContextFromProfile(profileSnapshot, sanitizedNonPhi, phiData);
      const risk = deriveRisk(context, phiData);
      const ragQuery = `Lead intent=${context.intent || ""}, protected=${context.protected_who || ""}, duration=${context.duration_need || ""}, must_have=${context.must_have || ""}, age=${context.age || ""}, coverage=${context.coverage_amount || ""}, budget=${context.budget_monthly || ""}, current_coverage=${context.current_coverage || ""}, priorities=${context.priority_1 || ""}/${context.priority_2 || ""}, risk=${risk.level}. Determine best-fit product type and alternatives from internal product knowledge only, then provide sales talking points.`;
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
      const salesScript =
        (await synthesize(openaiKey, ragQuery, ragRows)) ||
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
    const userMessage = String(body.message || "").trim();
    const incomingAnswers =
      body.qualification_answers && typeof body.qualification_answers === "object" ? body.qualification_answers : {};
    const profileSnapshot = body.profile_snapshot && typeof body.profile_snapshot === "object" ? body.profile_snapshot : {};
    if (!isUuid(leadId) || !leadSourceTable) return json(res, 400, { error: "lead_id and lead_source_table required" });
    if (!userMessage) return json(res, 400, { error: "message required" });
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
      const currentKey = String(workflowState.current_question_key || "") || nextQuestionKey(mergedAnswers, existingPhi, canPhi);
      const currentQuestion = questionByKey(currentKey);
      transcript.push({ role: "agent", content: userMessage, ts: new Date().toISOString(), key: currentKey || null });

      let assistantReply = "";
      let nextQuestionText = "";
      const nextNonPhi = Object.assign({}, mergedAnswers);
      const nextPhi = mergePhi(existingPhi, split.phi || {});
      if (isStartSignal && currentQuestion) {
        assistantReply = `Let's begin qualification. ${currentQuestion.prompt}`;
        nextQuestionText = currentQuestion.prompt;
      } else if (currentQuestion) {
        const parsed = parseAnswerByType(currentQuestion, userMessage);
        if (parsed == null) {
          assistantReply = `I couldn't map that answer for "${currentQuestion.prompt}". Please reply in a clearer format.`;
          nextQuestionText = currentQuestion.prompt;
        } else {
          if (currentQuestion.phi) nextPhi[currentQuestion.key] = parsed;
          else nextNonPhi[currentQuestion.key] = parsed;
          const nk = nextQuestionKey(nextNonPhi, nextPhi, canPhi);
          if (nk) {
            const nq = questionByKey(nk);
            nextQuestionText = nq ? nq.prompt : "";
            assistantReply = `Saved. Next: ${nextQuestionText}`;
          } else {
            assistantReply = "Great. We have enough qualification data. I am generating recommendation details now.";
          }
        }
      } else {
        const nk0 = nextQuestionKey(nextNonPhi, nextPhi, canPhi);
        if (nk0) {
          const nq0 = questionByKey(nk0);
          nextQuestionText = nq0 ? nq0.prompt : "";
          assistantReply = `Let's begin qualification. ${nextQuestionText}`;
        }
      }
      const context = normalizedContextFromProfile(workflowState.profile_snapshot || {}, nextNonPhi, nextPhi);
      const risk = deriveRisk(context, nextPhi);
      const ragQuery = `Lead intent=${context.intent || ""}, protected=${context.protected_who || ""}, duration=${context.duration_need || ""}, must_have=${context.must_have || ""}, age=${context.age || ""}, coverage=${context.coverage_amount || ""}, budget=${context.budget_monthly || ""}, current_coverage=${context.current_coverage || ""}, priorities=${context.priority_1 || ""}/${context.priority_2 || ""}, risk=${risk.level}. Determine best-fit product type and alternatives from internal product knowledge only, then provide sales talking points.`;
      const emb = await generateEmbedding(openaiKey, ragQuery);
      const ragRows = await loadRagRowsGuaranteed(cfg, emb.embedding);
      const nextRecommendation = recommendFromRagRows(Object.assign({}, context, nextNonPhi, nextPhi), risk, ragRows);
      if (nextQuestionText) nextRecommendation.next_question = nextQuestionText;
      const nextConfidence = confidenceFrom(context, nextNonPhi, risk, nextRecommendation);
      const nextSales = Object.assign({}, session.sales_enablement || {});
      nextSales.script =
        (await synthesize(openaiKey, ragQuery, ragRows)) ||
        nextSales.script ||
        "Confirm priorities, budget, and eligibility before presenting recommendation.";

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
          return v == null || v === "" || (Array.isArray(v) && !v.length && k !== "conditions");
        });

      const saved = await saveSession(cfg, leadId, leadSourceTable, {
        qualification_answers: nextNonPhi,
        risk_summary: risk,
        recommendation: nextRecommendation,
        confidence: nextConfidence,
        sales_enablement: nextSales,
        workflow_state: workflowState,
      });
      if (canPhi) {
        await writePhiByLead(
          cfg,
          leadId,
          leadSourceTable,
          nextPhi,
          auth.user && auth.user.email ? auth.user.email : null
        );
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
      return json(res, 500, { error: "Stage 3 chat failed" });
    }
  }

  res.setHeader("Allow", "GET, PUT, POST, PATCH");
  return json(res, 405, { error: "Method Not Allowed" });
};
