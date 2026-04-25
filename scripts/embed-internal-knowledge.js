#!/usr/bin/env node
/**
 * Embed MASTER Mutual of Omaha knowledge into internal_knowledge_chunks.
 *
 * Reads: integrations/knowledge/MOO_Knowledge/MASTER_MOO_KNOWLEDGE.md
 * Env: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)
 *
 * Usage (from repo root):
 *   node scripts/embed-internal-knowledge.js
 *
 * Idempotent: skips rows whose chunk_fingerprint already exists for carrier mutual_of_omaha.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REPO_ROOT = path.join(__dirname, "..");
const MASTER_PATH = path.join(
  REPO_ROOT,
  "integrations",
  "knowledge",
  "MOO_Knowledge",
  "MASTER_MOO_KNOWLEDGE.md",
);

const CARRIER = "mutual_of_omaha";
const MAX_CHARS = 3400; // ~850–950 tokens typical for English-ish prose
const MIN_CHARS = 80;

function loadEnvLocal() {
  const p = path.join(REPO_ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, "utf8");
  for (const line of raw.split(/\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function inferCategory(title, bodySnippet) {
  const t = `${title}\n${bodySnippet}`.toLowerCase();
  if (/\blong[-\s]?term care\b|\bltc\b|\bhome health care insurance\b/.test(t)) return "ltc";
  if (/\bcritical illness\b|\bci rider\b|\bcritical illness benefit\b/.test(t)) return "critical_illness";
  if (/\bannuit(y|ies)\b/.test(t)) return "annuities";
  if (/\briders?\b|\bwaiver of premium\b|\baccelerated benefit\b|\bterminal illness rider\b/.test(t))
    return "riders";
  if (
    /\bunderwrit|\bbuild chart\b|\bmib\b|\bmedical exam\b|\bknockout\b|\bdeclin|\bguideline\b/.test(t)
  )
    return "underwriting";
  if (/\brate\b|\bpremium table\b|\bmonthly premium\b|\bcompetitive information\b|\bpricing\b/.test(t))
    return "rates";
  if (
    /\blife insurance\b|\bterm life\b|\bwhole life\b|\biul\b|\bindexed universal\b|\bfinal expense\b|\bliving promise\b|\bwl\b|\bfex\b/.test(
      t,
    )
  )
    return "life_insurance";
  return "general";
}

function normalizeProduct(title) {
  const t = String(title || "").replace(/\s+/g, " ").trim();
  if (!t) return "general";
  return t.slice(0, 200);
}

function fingerprint(carrier, product, category, content) {
  const norm = String(content || "").replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
  const h = crypto.createHash("sha256");
  h.update(`${carrier}\0${product}\0${category}\0${norm}`);
  return h.digest("hex");
}

function splitMarkdownSections(md) {
  const lines = md.split(/\r?\n/);
  const sections = [];
  let buf = [];
  let title = "Introduction";
  for (const line of lines) {
    if (/^#{2,4}\s+/.test(line)) {
      if (buf.length) {
        const body = buf.join("\n").trim();
        if (body) sections.push({ title, body });
      }
      title = line.replace(/^#+\s+/, "").trim();
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (buf.length) {
    const body = buf.join("\n").trim();
    if (body) sections.push({ title, body });
  }
  return sections;
}

function splitBodyBySize(title, body, categoryHint) {
  const chunks = [];
  const head = `## ${title}\n\n`;
  const paras = body.split(/\n\n+/);
  let cur = head;
  function flush() {
    const s = cur.trim();
    if (s.length >= MIN_CHARS) {
      const cat = inferCategory(title, s.slice(0, 600));
      chunks.push({
        product: normalizeProduct(title),
        category: categoryHint || cat,
        content: s,
      });
    }
    cur = head;
  }
  for (const p of paras) {
    const piece = p.trim();
    if (!piece) continue;
    if ((cur + piece).length > MAX_CHARS) {
      flush();
      cur = head + piece + "\n\n";
    } else {
      cur += piece + "\n\n";
    }
  }
  flush();
  return chunks;
}

function buildChunksFromMaster(md) {
  const sections = splitMarkdownSections(md);
  const out = [];
  for (const { title, body } of sections) {
    const hint = inferCategory(title, body.slice(0, 800));
    if (body.length <= MAX_CHARS) {
      const content = `## ${title}\n\n${body}`.trim();
      if (content.length >= MIN_CHARS) {
        out.push({
          product: normalizeProduct(title),
          category: hint,
          content,
        });
      }
      continue;
    }
    out.push(...splitBodyBySize(title, body, hint));
  }
  return out;
}

async function openAiEmbed(apiKey, text) {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: String(text).slice(0, 8000),
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI embeddings ${r.status}: ${err}`);
  }
  const emb = data.data && data.data[0] && data.data[0].embedding;
  if (!emb || !Array.isArray(emb)) throw new Error("OpenAI embeddings: missing embedding");
  return emb;
}

async function supabaseExists(baseUrl, key, fp) {
  const url = `${baseUrl}/rest/v1/internal_knowledge_chunks?select=id&carrier=eq.${encodeURIComponent(
    CARRIER,
  )}&chunk_fingerprint=eq.${encodeURIComponent(fp)}&limit=1`;
  const r = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase select internal_knowledge_chunks ${r.status}: ${t.slice(0, 400)}`);
  }
  const rows = await r.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function supabaseInsert(baseUrl, key, row) {
  const url = `${baseUrl}/rest/v1/internal_knowledge_chunks`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([row]),
  });
  const text = await r.text();
  if (!r.ok) {
    if (r.status === 409) return { inserted: false, conflict: true };
    throw new Error(`Supabase insert internal_knowledge_chunks ${r.status}: ${text.slice(0, 500)}`);
  }
  const data = text ? JSON.parse(text) : [];
  return { inserted: Array.isArray(data) && data.length > 0, conflict: false };
}

async function main() {
  loadEnvLocal();
  const openaiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!openaiKey || !supabaseUrl || !serviceKey) {
    console.error(
      "Missing OPENAI_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY (set in environment or .env.local).",
    );
    process.exit(1);
  }
  if (!fs.existsSync(MASTER_PATH)) {
    console.error("Missing file:", MASTER_PATH);
    console.error("Copy MOO_Knowledge from Downloads into integrations/knowledge/MOO_Knowledge/");
    process.exit(1);
  }

  const md = fs.readFileSync(MASTER_PATH, "utf8");
  const chunks = buildChunksFromMaster(md);
  console.log("Prepared chunks from MASTER:", chunks.length);

  let inserted = 0;
  let skipped = 0;
  const byCat = {};

  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const fp = fingerprint(CARRIER, c.product, c.category, c.content);
    const exists = await supabaseExists(supabaseUrl, serviceKey, fp);
    if (exists) {
      skipped++;
      byCat[c.category] = byCat[c.category] || { inserted: 0, skipped: 0 };
      byCat[c.category].skipped++;
      continue;
    }
    const embedding = await openAiEmbed(openaiKey, c.content);
    const row = {
      carrier: CARRIER,
      product: c.product,
      category: c.category,
      content: c.content,
      embedding,
      chunk_fingerprint: fp,
    };
    const res = await supabaseInsert(supabaseUrl, serviceKey, row);
    if (res.inserted) {
      inserted++;
      byCat[c.category] = byCat[c.category] || { inserted: 0, skipped: 0 };
      byCat[c.category].inserted++;
    } else {
      skipped++;
      byCat[c.category] = byCat[c.category] || { inserted: 0, skipped: 0 };
      byCat[c.category].skipped++;
    }
    if (i % 20 === 0 && i > 0) await new Promise((r) => setTimeout(r, 120));
  }

  console.log("\n--- Summary ---");
  console.log("Inserted:", inserted);
  console.log("Skipped (already present):", skipped);
  console.log("Categories:", Object.keys(byCat).sort().join(", ") || "(none)");
  console.log("Per category:", JSON.stringify(byCat, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
