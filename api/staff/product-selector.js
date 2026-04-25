const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");
const { generateEmbedding } = require("../../lib/openai");

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

function deriveRisk(answers) {
  const cond = Array.isArray(answers.conditions) ? answers.conditions : [];
  const hasMajorCondition = cond.some((c) => /heart|cancer|stroke|copd|kidney|cirrhosis|insulin/i.test(String(c || "")));
  const meds = bool(answers.prescription_meds);
  const hosp = bool(answers.hospitalized_5y);
  const doc = bool(answers.doctor_visits_2y);
  const tobacco = bool(answers.tobacco);
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
  if (risk.level === "high" && product_type === "term_life") {
    recommended_category = "final_expense";
    product_type = "final_expense";
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
    rationale: `Intent=${intent || "unknown"}, risk=${risk.level}, age=${age == null ? "unknown" : age}, tobacco=${
      tobacco ? "yes" : "no"
    }`,
  };
}

function confidenceFrom(answers, risk, recommendation) {
  const required = ["intent", "coverage_amount", "budget_monthly", "age"];
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
      return json(res, 200, { session: session || null });
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
      const session = await saveSession(cfg, leadId, leadSourceTable, body);
      return json(res, 200, { ok: true, session });
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
      const risk = deriveRisk(answers);
      const recommendation = recommendByRules(answers, risk);
      const confidence = confidenceFrom(answers, risk, recommendation);
      const ragQuery = `Lead intent=${answers.intent || ""}, age=${answers.age || ""}, coverage=${answers.coverage_amount || ""}, budget=${
        answers.budget_monthly || ""
      }, tobacco=${answers.tobacco ? "yes" : "no"}, risk=${risk.level}. Recommend ${recommendation.product_type} alternatives and sales talking points.`;
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
        qualification_answers: answers,
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
      });
    } catch (e) {
      console.error("product-selector POST", e);
      return json(res, 500, { error: "Failed to generate recommendation" });
    }
  }

  res.setHeader("Allow", "GET, PUT, POST");
  return json(res, 405, { error: "Method Not Allowed" });
};
