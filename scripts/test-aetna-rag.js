#!/usr/bin/env node
/**
 * Eval Aetna FE knowledge in staff internal RAG + public knowledge_chunks.
 * Usage: node scripts/test-aetna-rag.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

async function matchInternal(supabaseUrl, key, embedding) {
  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/match_internal_knowledge_chunks`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: 8,
      min_similarity: 0.25,
      carrier_filter: "aetna",
      category_filter: null,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`internal match ${r.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text || "[]");
}

async function matchPublic(supabaseUrl, key, embedding) {
  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/match_knowledge_chunks`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: 8,
      min_similarity: 0.45,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`public match ${r.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text || "[]");
}

async function synthesize(apiKey, query, rows, mode) {
  const ctx = (rows || [])
    .map((row, i) => {
      const sim = row.similarity != null ? Number(row.similarity).toFixed(3) : "?";
      const body = String(row.content || row.chunk_text || "").trim();
      return `[${i + 1}] sim=${sim}\n${body}`;
    })
    .join("\n\n---\n\n");

  const system =
    mode === "staff"
      ? `You are Mejor Vida's staff assistant. Answer ONLY from Aetna/Accendo/CLI excerpts. Cite ages, faces, and underwriters accurately. No Medicare as a life product. 3–6 sentences.`
      : `You are Julie's public website assistant. Answer ONLY from excerpts in plain consumer language. Mention Accendo and/or Protection Series when relevant. No invented premiums. 2–5 sentences.`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.15,
      max_tokens: 450,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Question:\n${query}\n\nExcerpts:\n${ctx || "[none]"}` },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`chat ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return String(data.choices[0].message.content || "").trim();
}

const CASES = [
  {
    name: "accendo_ages_faces",
    q: "What are Accendo Final Expense issue ages and maximum face amounts?",
    must: [/40\s*[–-]\s*89|40-89/i, /50,?000|\$50/i, /Accendo/i],
  },
  {
    name: "protection_series_cli",
    q: "What is Aetna Protection Series Final Expense and who underwrites it?",
    must: [/45\s*[–-]\s*89|45-89/i, /Continental Life|CLI/i, /Level/i],
  },
  {
    name: "no_term",
    q: "Does Aetna Senior Supplemental offer term life through Julie's portal?",
    must: [/final expense|whole life|no term|only/i],
    avoid: [/yes.*term life|offers term/i],
  },
  {
    name: "states",
    q: "In which states can Julie quote Aetna Accendo or Protection Series final expense?",
    must: [/Nebraska|NE/i, /Kansas|KS/i, /Colorado|CO/i, /Nevada|NV/i],
  },
  {
    name: "uw_quote_enroll",
    q: "How does Aetna Quote and Enroll automated underwriting work with Milliman?",
    must: [/Milliman|IntelliScript/i, /Approved|Declined|Additional Review|Real-Time/i],
    staffOnly: true,
  },
  {
    name: "drug_list_usage",
    q: "How should an agent use the Accendo Final Expense drug list for Preferred vs Modified?",
    must: [/Preferred|Standard|Modified/i, /drug|medication|unacceptable/i],
    staffOnly: true,
  },
];

async function runCase(apiKey, supabaseUrl, serviceKey, c, mode) {
  const emb = await embed(apiKey, c.q);
  const rows =
    mode === "staff"
      ? await matchInternal(supabaseUrl, serviceKey, emb)
      : await matchPublic(supabaseUrl, serviceKey, emb);
  const answer = await synthesize(apiKey, c.q, rows, mode);
  const misses = (c.must || []).filter((re) => !re.test(answer) && !rows.some((r) => re.test(String(r.content || ""))));
  const avoids = (c.avoid || []).filter((re) => re.test(answer));
  const ok = misses.length === 0 && avoids.length === 0 && rows.length > 0;
  return { ok, rows: rows.length, topSim: rows[0] && rows[0].similarity, answer, misses, avoids };
}

async function hitWebsiteChat(question, lang) {
  const session_id = "aetna-test-" + crypto.randomBytes(6).toString("hex");
  const r = await fetch("https://www.mejorvidainsurance.com/api/website-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, message: question, lang }),
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
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

  let failed = 0;
  for (const mode of ["staff", "public"]) {
    console.log(`\n===== ${mode.toUpperCase()} RAG =====`);
    for (const c of CASES) {
      if (c.staffOnly && mode !== "staff") continue;
      const res = await runCase(apiKey, supabaseUrl, serviceKey, c, mode);
      const mark = res.ok ? "PASS" : "FAIL";
      if (!res.ok) failed++;
      console.log(`\n[${mark}] ${mode}/${c.name} rows=${res.rows} topSim=${res.topSim}`);
      console.log(res.answer.slice(0, 500));
      if (res.misses.length) console.log("  missing:", res.misses.map(String));
      if (res.avoids.length) console.log("  avoided-hit:", res.avoids.map(String));
    }
  }

  console.log("\n===== LIVE website-chat =====");
  const liveQ =
    "What final expense products does Aetna offer? Include Accendo ages if you know them.";
  const live = await hitWebsiteChat(liveQ, "en");
  console.log("HTTP", live.status, "status=", live.data && live.data.status);
  console.log(String((live.data && live.data.answer) || "").slice(0, 700));
  const liveOk =
    /Accendo|Protection Series|final expense|40/i.test(String((live.data && live.data.answer) || ""));
  if (!liveOk) failed++;
  console.log(liveOk ? "PASS live chatbot mentions Aetna FE" : "FAIL live chatbot weak/missing Aetna FE");

  console.log(failed ? `\nRESULT: ${failed} failure(s)` : "\nRESULT: all checks passed");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
