#!/usr/bin/env node
/**
 * Complex Corebridge internal RAG eval (match_internal_knowledge_chunks + synthesize).
 * Usage: node scripts/test-corebridge-internal-rag.js
 * Env: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local OK)
 */
"use strict";

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");

function loadEnvLocal() {
  const p = path.join(REPO_ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function embed(apiKey, text) {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "text-embedding-3-small", input: String(text).slice(0, 8000) }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`embed ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data.data[0].embedding;
}

async function match(supabaseUrl, key, embedding, matchCount = 8, minSim = 0.25) {
  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/match_internal_knowledge_chunks`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: matchCount,
      min_similarity: minSim,
      carrier_filter: "corebridge",
      category_filter: null,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`match RPC ${r.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text || "[]");
}

async function synthesize(apiKey, query, rows) {
  const ctx = (rows || [])
    .map((row, i) => {
      const sim = row.similarity != null ? Number(row.similarity).toFixed(3) : "?";
      return `[${i + 1}] product=${row.product || "?"} category=${row.category || "?"} sim=${sim}\n${String(row.content || "").trim()}`;
    })
    .join("\n\n---\n\n");

  const system = `You are Mejor Vida's internal product assistant for agent Julie (licensed NE/KS/CO/NV).
Answer ONLY from the numbered Corebridge excerpts.
Hard rules:
- Julie SELLS: SIWL, GIWL, Select-a-Term, AG Ultra One, Secure Lifetime GUL 3, American Elite WL 2 (conversion).
- Julie does NOT sell IUL or annuities — never recommend them as a new sale; for conversion menus prefer GUL 3 or Elite WL 2.
- Do not invent premiums, ages, or UW decisions not in the excerpts.
- If excerpts conflict or are incomplete, say what is missing.
Be precise and cite which product/rule you used. 3–8 sentences.`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.15,
      max_tokens: 700,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Question:\n${query}\n\nExcerpts:\n${ctx}` },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`chat ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return String(data.choices[0].message.content || "").trim();
}

/** Complex scenarios: mustSatisfy = regexes that SHOULD appear; mustAvoid = regexes that should NOT. */
const CASES = [
  {
    id: "FE-ROUTE-MULTI",
    query:
      "Nebraska client age 72, smoker, COPD with no hospitalization in 24 months, wants final expense. Using Corebridge SIWL UW rules AND product map: is SIWL Level, SIWL Graded, or Decline for COPD+tobacco? If SIWL is Decline, what Corebridge FE product remains? Also state 71-80 smoker face max on Graded if they had qualified, and years 1-2 graded DB rule. Do not invent SIWL premiums.",
    mustSatisfy: [/decline/i, /giwl|guaranteed issue/i, /110%|two years|years 1/i],
    mustAvoid: [/siwl.*(level|graded).*for (this|the) (client|copd)|offer (siwl )?graded.*(copd|smoker)|copd.*tobacco.*siwl graded/i],
  },
  {
    id: "SIWL-UW-COPD-TOBACCO",
    query:
      "Per Corebridge SimpliNow Legacy underwriting guide: COPD + tobacco user — Level, Graded, or Decline? Also Alzheimer's ever — same three options?",
    mustSatisfy: [/decline/i, /alzheimer|dementia/i],
    mustAvoid: [/level death benefit for copd.*tobacco|copd.*tobacco.*level/i],
  },
  {
    id: "GIWL-RATE-LOOKUP",
    query:
      "Using the Corebridge GIWL rate sheet as of 12/07/2024, what is the monthly premium for a female age 50 with $10,000 face? Mention the annual policy fee note if present.",
    mustSatisfy: [/41\.88|\$41/, /24/],
    mustAvoid: [/cannot find|not in the excerpts|insufficient/i],
  },
  {
    id: "STATE-ME-VS-NE",
    query:
      "Can Julie issue Corebridge GIWL in Maine? What about Nebraska? Also: is SIWL approved in New York?",
    mustSatisfy: [/maine|me/i, /nebraska|ne/i, /new york|ny/i],
    mustAvoid: [/giwl.*available in maine|maine.*giwl.*yes/i],
  },
  {
    id: "SCOPE-NO-IUL",
    query:
      "Client wants a Corebridge indexed universal life Max Accumulator as a new sale through Julie. What should we tell the client and which Corebridge products Julie actually sells instead?",
    mustSatisfy: [/does not sell|doesn't sell|not sell|out of scope|does not offer iul/i, /siwl|giwl|gul|select-a-term|final expense/i],
    mustAvoid: [/julie (can|should) sell.*iul|recommend max accumulator for a new sale/i],
  },
  {
    id: "TERM-CONV-LATE-WINDOW",
    query:
      "Select-a-Term in policy year 11 on a 20-year term: which permanent products does Corebridge allow, and which should Julie prefer given she does not sell IUL? Also: is there a grace period after conversion expiry for paperwork?",
    mustSatisfy: [/american elite|elite whole life/i, /no grace|no exceptions|on or before/i],
    mustAvoid: [/prefer.*protection extend iul|recommend.*iul/i],
  },
  {
    id: "FREELOOK-GRACE-NE",
    query:
      "For a Nebraska Select-a-Term new issue (not a replacement) and a Secure Lifetime GUL 3 new issue, what are free-look days and grace periods per Corebridge AGLC112585?",
    mustSatisfy: [/10/, /31|61/],
    mustAvoid: [/california 60|florida 14/i],
  },
  {
    id: "AGGREGATE-FACE",
    query:
      "Client already has $20,000 Corebridge GIWL. They qualify for SIWL Level Max at age 68. What is the aggregate max across GIWL+SIWL, and can they add another $25k Level?",
    mustSatisfy: [/35,?000|\$35k|35k/i, /25,?000|aggregate|total/i],
    mustAvoid: [/unlimited|no aggregate/i],
  },
  {
    id: "ES-COMPLEX",
    query:
      "Cliente en Nebraska, 55 años, quiere gastos finales. Explique diferencia entre SimpliNow Legacy Max (level), Legacy graded, y GIWL de Corebridge: preguntas de salud, beneficio en años 1-2, y montos máximos aproximados. Julie no vende IUL.",
    mustSatisfy: [/level|max|graded|giwl|110%|preguntas|salud|50.?80|25,?000|35,?000/i],
    mustAvoid: [/max accumulator|recomiendo iul/i],
  },
  {
    id: "GUL-LIVING-BENEFITS",
    query:
      "Secure Lifetime GUL 3: summarize continuation guarantee, Enhanced Surrender Value / ROP opportunities (years and caps), and whether Lifestyle Income Solution is available in Julie's states NE/KS/CO/NV vs MA/MO/PA restrictions.",
    mustSatisfy: [/continuation|guarantee/i, /20|25|40%/i, /lifestyle|aas|accelerated/i],
    mustAvoid: [/not available in nebraska/i],
  },
];

function evalAnswer(answer, c) {
  const fails = [];
  for (const re of c.mustSatisfy || []) {
    if (!re.test(answer)) fails.push(`missing mustSatisfy ${re}`);
  }
  for (const re of c.mustAvoid || []) {
    if (re.test(answer)) fails.push(`hit mustAvoid ${re}`);
  }
  return fails;
}

async function runCase(apiKey, supabaseUrl, serviceKey, c) {
  const emb = await embed(apiKey, c.query);
  const rows = await match(supabaseUrl, serviceKey, emb, 10, 0.22);
  const answer = await synthesize(apiKey, c.query, rows);
  const fails = evalAnswer(answer, c);
  const top = (rows || []).slice(0, 5).map((r) => ({
    sim: r.similarity != null ? Number(r.similarity).toFixed(3) : null,
    product: r.product,
    category: r.category,
    preview: String(r.content || "").replace(/\s+/g, " ").slice(0, 120),
  }));
  return {
    id: c.id,
    pass: fails.length === 0,
    fails,
    retrievalCount: (rows || []).length,
    top,
    answer,
  };
}

async function main() {
  loadEnvLocal();
  const apiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!apiKey || !supabaseUrl || !serviceKey) {
    console.error("Missing OPENAI_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  console.log("Corebridge complex internal RAG eval —", CASES.length, "cases\n");
  const results = [];
  for (const c of CASES) {
    process.stdout.write(`▶ ${c.id} ... `);
    try {
      const r = await runCase(apiKey, supabaseUrl, serviceKey, c);
      results.push(r);
      console.log(r.pass ? "PASS" : "FAIL", `(${r.retrievalCount} chunks)`);
      if (!r.pass) console.log("   fails:", r.fails.join("; "));
      console.log("   answer:", r.answer.slice(0, 420).replace(/\n/g, " "));
      console.log("");
    } catch (e) {
      console.log("ERROR", e.message);
      results.push({ id: c.id, pass: false, fails: [e.message], answer: "", top: [] });
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const outPath = path.join(
    REPO_ROOT,
    "integrations/knowledge/Corebridge_Knowledge/raw/rag-complex-eval.json",
  );
  fs.writeFileSync(outPath, JSON.stringify({ at: new Date().toISOString(), passed, total: results.length, results }, null, 2));
  console.log("========== SUMMARY ==========");
  console.log(`${passed}/${results.length} passed`);
  console.log("Wrote", outPath);
  if (passed < results.length) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
