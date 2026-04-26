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

const QUESTION_FLOW = [
  { key: "intent", prompt: "What is the client's primary coverage goal?", type: "choice", options: ["income_replacement", "final_expenses", "mortgage_protection", "wealth_building", "legacy_planning"], phi: false },
  { key: "coverage_amount", prompt: "How much coverage amount are they targeting?", type: "number", phi: false },
  { key: "budget_monthly", prompt: "What monthly premium budget is comfortable?", type: "number", phi: false },
  { key: "age", prompt: "What is the client's current age?", type: "number", phi: false },
  { key: "protected_who", prompt: "Who is being protected (self, spouse, children, family, business partner)?", type: "text", phi: false },
  { key: "duration_need", prompt: "Do they need temporary coverage, lifetime coverage, or are they unsure?", type: "choice", options: ["temporary", "lifetime", "unsure"], phi: false },
  { key: "must_have", prompt: "What is the must-have outcome: lowest cost, permanent coverage, cash value growth, or fast approval?", type: "choice", options: ["lowest_cost", "permanent_coverage", "cash_value_growth", "fast_approval"], phi: false },
  { key: "current_coverage", prompt: "Do they currently have coverage (none, some keep, replace)?", type: "choice", options: ["none", "some_keep", "replace"], phi: false },
  { key: "priority_1", prompt: "What is priority #1: cost, approval likelihood, permanence, cash value, or speed?", type: "choice", options: ["cost", "approval_likelihood", "permanence", "cash_value", "speed"], phi: false },
  { key: "priority_2", prompt: "What is priority #2 (must be different from priority #1)?", type: "choice", options: ["cost", "approval_likelihood", "permanence", "cash_value", "speed"], phi: false },
  { key: "tobacco", prompt: "Any tobacco or nicotine use in the last 12 months? (yes/no)", type: "boolean", phi: true },
  { key: "prescription_meds", prompt: "Is the client currently taking prescription medications? (yes/no)", type: "boolean", phi: true },
  { key: "doctor_visits_2y", prompt: "Any doctor visits in the last 2 years? (yes/no)", type: "boolean", phi: true },
  { key: "hospitalized_5y", prompt: "Any hospitalization in the last 5 years? (yes/no)", type: "boolean", phi: true },
  { key: "conditions", prompt: "List diagnosed conditions separated by commas, or type none.", type: "list", phi: true },
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

function deriveRisk(answers, phiAnswers) {
  const merged = Object.assign({}, answers || {}, phiAnswers || {});
  const cond = Array.isArray(merged.conditions) ? merged.conditions : [];
  const hasMajorCondition = cond.some((c) => /heart|cancer|stroke|copd|kidney|cirrhosis|insulin/i.test(String(c || "")));
  const meds = bool(merged.prescription_meds);
  const hosp = bool(merged.hospitalized_5y);
  const doc = bool(merged.doctor_visits_2y);
  const tobacco = bool(merged.tobacco);
  let level = "low";
  if (hasMajorCondition || hosp || (meds && cond.length >= 2)) level = "high";
  else if (meds || doc || tobacco || cond.length) level = "moderate";
  const flags = [];
  if (hasMajorCondition) flags.push("major_condition");
  if (hosp) flags.push("recent_hospitalization");
  if (meds) flags.push("rx_meds");
  if (doc) flags.push("recent_doctor_visits");
  if (tobacco) flags.push("tobacco");
  return { level, flags };
}

function recommendByRules(answers, risk) {
  const intent = String(answers.intent || "").toLowerCase();
  const duration = String(answers.duration_need || "").toLowerCase();
  const mustHave = String(answers.must_have || "").toLowerCase();
  const coverageStatus = String(answers.current_coverage || "").toLowerCase();
  const p1 = String(answers.priority_1 || "").toLowerCase();
  const p2 = String(answers.priority_2 || "").toLowerCase();
  const age = Number.isFinite(parseInt(String(answers.age || ""), 10))
    ? parseInt(String(answers.age || ""), 10)
    : null;
  const tobacco = bool(answers.tobacco);
  let recommended_category = "life_insurance";
  let product_type = "whole_life";

  if (/final|burial|funeral/.test(intent)) {
    recommended_category = "final_expense";
    product_type = "final_expense";
  } else if (/mortgage|income/.test(intent)) {
    recommended_category = "term_life";
    product_type = "term_life";
  } else if (/wealth|cash|legacy/.test(intent)) {
    recommended_category = "universal_life";
    product_type = "universal_life";
  }

  if (age != null && age >= 76) {
    recommended_category = "final_expense";
    product_type = "final_expense";
  }
  if (duration === "lifetime" && product_type === "term_life") {
    recommended_category = "life_insurance";
    product_type = "whole_life";
  }
  if (mustHave === "cash_value_growth") {
    recommended_category = "universal_life";
    product_type = "universal_life";
  }
  if (mustHave === "lowest_cost" && duration !== "lifetime" && risk.level !== "high") {
    recommended_category = "term_life";
    product_type = "term_life";
  }
  if (risk.level === "high" && product_type === "term_life") {
    recommended_category = "final_expense";
    product_type = "final_expense";
  }
  if (coverageStatus === "replace" && product_type === "term_life" && (p1 === "permanence" || p2 === "permanence")) {
    recommended_category = "life_insurance";
    product_type = "whole_life";
  }
  const alternatives = [];
  if (product_type !== "term_life") alternatives.push("term_life");
  if (product_type !== "whole_life") alternatives.push("whole_life");
  if (product_type !== "universal_life") alternatives.push("universal_life");
  if (product_type !== "final_expense") alternatives.push("final_expense");

  return {
    product_type,
    recommended_category,
    alternatives: alternatives.slice(0, 3),
    rationale: `Intent=${intent || "unknown"}, duration=${duration || "unknown"}, must_have=${mustHave || "unknown"}, risk=${risk.level}, age=${age == null ? "unknown" : age}, tobacco=${
      tobacco ? "yes" : "no"
    }`,
  };
}

function confidenceFrom(answers, risk, recommendation) {
  const required = ["intent", "coverage_amount", "budget_monthly", "age", "protected_who", "duration_need", "must_have", "current_coverage", "priority_1"];
  const present = required.filter((k) => {
    const v = answers[k];
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
      const incoming = body.qualification_answers && typeof body.qualification_answers === "object" ? body.qualification_answers : {};
      const phiPayload = body.phi_answers && typeof body.phi_answers === "object" ? body.phi_answers : {};
      const sanitizedNonPhi = Object.assign({}, incoming);
      QUESTION_FLOW.forEach((q) => {
        if (q.phi) delete sanitizedNonPhi[q.key];
      });
      const session = await saveSession(cfg, leadId, leadSourceTable, Object.assign({}, body, { qualification_answers: sanitizedNonPhi }));
      if (canPhi && Object.keys(phiPayload).length) {
        await writePhiByLead(
          cfg,
          leadId,
          leadSourceTable,
          phiPayload,
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
    if (!isUuid(leadId) || !leadSourceTable) return json(res, 400, { error: "lead_id and lead_source_table required" });
    if (!openaiKey) return json(res, 500, { error: "OPENAI_API_KEY missing" });

    try {
      const canPhi = canAccessPhi(auth);
      const phiData = canPhi ? (await readPhiByLead(cfg, leadId, leadSourceTable)).payload || {} : {};
      const sanitizedNonPhi = Object.assign({}, answers);
      QUESTION_FLOW.forEach((q) => {
        if (q.phi) delete sanitizedNonPhi[q.key];
      });
      const risk = deriveRisk(sanitizedNonPhi, phiData);
      const recommendation = recommendByRules(Object.assign({}, sanitizedNonPhi, phiData), risk);
      const confidence = confidenceFrom(sanitizedNonPhi, risk, recommendation);
      const ragQuery = `Lead intent=${sanitizedNonPhi.intent || ""}, protected=${sanitizedNonPhi.protected_who || ""}, duration=${sanitizedNonPhi.duration_need || ""}, must_have=${sanitizedNonPhi.must_have || ""}, age=${sanitizedNonPhi.age || ""}, coverage=${sanitizedNonPhi.coverage_amount || ""}, budget=${sanitizedNonPhi.budget_monthly || ""}, current_coverage=${sanitizedNonPhi.current_coverage || ""}, priorities=${sanitizedNonPhi.priority_1 || ""}/${sanitizedNonPhi.priority_2 || ""}, risk=${risk.level}. Recommend ${recommendation.product_type} alternatives and sales talking points.`;
      const emb = await generateEmbedding(openaiKey, ragQuery);
      const ragRows = await rpcMatchInternal(cfg, emb.embedding, 8, 0.25, recommendation.recommended_category);
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
      const mergedAnswers = Object.assign({}, session.qualification_answers || {}, incomingAnswers || {});
      QUESTION_FLOW.forEach((q) => {
        if (q.phi) delete mergedAnswers[q.key];
      });
      const workflowState = Object.assign({}, session.workflow_state || {});
      const transcript = Array.isArray(workflowState.stage3_chat) ? workflowState.stage3_chat.slice() : [];
      const currentKey = String(workflowState.current_question_key || "") || nextQuestionKey(mergedAnswers, existingPhi, canPhi);
      const currentQuestion = questionByKey(currentKey);
      transcript.push({ role: "agent", content: userMessage, ts: new Date().toISOString(), key: currentKey || null });

      let assistantReply = "";
      let nextQuestionText = "";
      const nextNonPhi = Object.assign({}, mergedAnswers);
      const nextPhi = Object.assign({}, existingPhi);
      if (currentQuestion) {
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
      const risk = deriveRisk(nextNonPhi, nextPhi);
      const nextRecommendation = recommendByRules(Object.assign({}, nextNonPhi, nextPhi), risk);
      if (nextQuestionText) nextRecommendation.next_question = nextQuestionText;
      const nextConfidence = confidenceFrom(nextNonPhi, risk, nextRecommendation);

      const ragQuery = `Lead intent=${nextNonPhi.intent || ""}, protected=${nextNonPhi.protected_who || ""}, duration=${nextNonPhi.duration_need || ""}, must_have=${nextNonPhi.must_have || ""}, age=${nextNonPhi.age || ""}, coverage=${nextNonPhi.coverage_amount || ""}, budget=${nextNonPhi.budget_monthly || ""}, current_coverage=${nextNonPhi.current_coverage || ""}, priorities=${nextNonPhi.priority_1 || ""}/${nextNonPhi.priority_2 || ""}, risk=${risk.level}. Recommend ${nextRecommendation.product_type} alternatives and sales talking points.`;
      const emb = await generateEmbedding(openaiKey, ragQuery);
      const ragRows = await rpcMatchInternal(cfg, emb.embedding, 8, 0.25, nextRecommendation.recommended_category);
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
