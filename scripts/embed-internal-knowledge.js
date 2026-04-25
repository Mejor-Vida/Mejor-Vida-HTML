#!/usr/bin/env node
/**
 * Embed carrier MASTER markdown into internal_knowledge_chunks (staff internal KB only).
 *
 * Default: processes Mutual of Omaha + American Amicable when their MASTER files exist.
 *
 * Env: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)
 *
 * Usage (repo root):
 *   node scripts/embed-internal-knowledge.js
 *   node scripts/embed-internal-knowledge.js --only=moo
 *   node scripts/embed-internal-knowledge.js --only=amam
 *   node scripts/embed-internal-knowledge.js --carrier american_amicable --file path/to/MASTER.md
 *
 * Idempotent: UNIQUE(carrier, chunk_fingerprint); fingerprint = sha256(carrier+product+category+normalized content).
 */

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REPO_ROOT = path.join(__dirname, "..");

const DEFAULT_JOBS = [
  {
    carrier: "mutual_of_omaha",
    file: path.join(REPO_ROOT, "integrations", "knowledge", "MOO_Knowledge", "MASTER_MOO_KNOWLEDGE.md"),
    label: "Mutual of Omaha",
  },
  {
    carrier: "american_amicable",
    file: path.join(
      REPO_ROOT,
      "integrations",
      "knowledge",
      "MOO_Knowledge",
      "AmAm_Knowledge",
      "MASTER_AMAM_KNOWLEDGE.md",
    ),
    label: "American Amicable",
  },
];

const MAX_CHARS = 3400;
const MIN_CHARS = 80;

function loadEnvLocal() {
  const p = path.join(REPO_ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
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

  if (/\bcompliance\b|\baml\b|\bsuitability\b|\breplacement\b|\bregulation\b|\bprivacy\b/.test(t))
    return "compliance";

  if (
    /\bgolden solution\b|\bfamily solution\b|\bfinal expense\b|\bprearrangement\b|\bburial\b|\bmodified whole life application\b/.test(
      t,
    )
  )
    return "final_expense";

  if (/\beasy term\b|\bterm life\b|\b10, 20, and 30-year\b|\blevel premium periods\b|\bsimplified issue term\b/.test(t))
    return "term_life";

  if (
    /\bexpress ul\b|\buniversal life\b|\biul\b|\bindexed universal\b|\bflexible premium adjustable universal\b/.test(t)
  )
    return "universal_life";

  if (/\blong[-\s]?term care\b|\bltc\b|\bhome health care insurance\b/.test(t)) return "ltc";
  if (/\bcritical illness\b|\bci rider\b|\bcritical illness benefit\b/.test(t)) return "critical_illness";
  if (/\bannuit(y|ies)\b|\bguaranteed interest rate\b|\binterest rate\b.*\bannuit/.test(t)) return "annuities";
  if (/\briders?\b|\bwaiver of premium\b|\baccelerated benefit\b|\bterminal illness rider\b/.test(t))
    return "riders";
  if (
    /\bunderwrit|\bbuild chart\b|\bmib\b|\bmedical exam\b|\bknockout\b|\bdeclin|\bguideline\b|\bquestionnaire\b|\bhealth questions\b/.test(
      t,
    )
  )
    return "underwriting";
  if (/\brate\b|\bpremium table\b|\bmonthly premium\b|\bcompetitive information\b|\bpricing\b|\bquick quotes\b/.test(t))
    return "rates";

  if (/\blife insurance\b|\bwhole life\b|\bmodified whole\b|\bfinancial lifeline\b|\baccumulation fund\b/.test(t))
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

async function supabaseExists(baseUrl, key, carrier, fp) {
  const url = `${baseUrl}/rest/v1/internal_knowledge_chunks?select=id&carrier=eq.${encodeURIComponent(
    carrier,
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

async function countCarrierRows(baseUrl, key, carrier) {
  const limit = 10000;
  const url = `${baseUrl}/rest/v1/internal_knowledge_chunks?carrier=eq.${encodeURIComponent(
    carrier,
  )}&select=id&limit=${limit}`;
  const r = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
      Range: `0-${limit - 1}`,
    },
  });
  const cr = r.headers.get("content-range");
  if (cr && /\//.test(cr)) {
    const total = parseInt(cr.split("/")[1], 10);
    if (!Number.isNaN(total)) return total;
  }
  const rows = await r.json();
  return Array.isArray(rows) ? rows.length : 0;
}

function parseArgs(argv) {
  const out = { only: null, carrier: null, file: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--only=moo") out.only = "moo";
    else if (a === "--only=amam") out.only = "amam";
    else if (a === "--only=all" || a === "--only=both") out.only = "all";
    else if (a.startsWith("--carrier=")) out.carrier = a.slice("--carrier=".length).trim();
    else if (a.startsWith("--file=")) out.file = a.slice("--file=".length).trim();
  }
  return out;
}

async function embedJob(openaiKey, supabaseUrl, serviceKey, carrier, filePath, label) {
  console.log("\n==========", label, `(${carrier})`, "==========");
  if (!fs.existsSync(filePath)) {
    console.log("SKIP — file not found:", filePath);
    return { skippedFile: true, inserted: 0, skipped: 0, byCat: {} };
  }

  const md = fs.readFileSync(filePath, "utf8");
  const chunks = buildChunksFromMaster(md);
  console.log("Prepared chunks:", chunks.length);

  let inserted = 0;
  let skipped = 0;
  const byCat = {};

  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const fp = fingerprint(carrier, c.product, c.category, c.content);
    const exists = await supabaseExists(supabaseUrl, serviceKey, carrier, fp);
    if (exists) {
      skipped++;
      byCat[c.category] = byCat[c.category] || { inserted: 0, skipped: 0 };
      byCat[c.category].skipped++;
      continue;
    }
    const embedding = await openAiEmbed(openaiKey, c.content);
    const row = {
      carrier,
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

  console.log("Inserted:", inserted, "| Skipped (already present):", skipped);
  console.log("Categories:", Object.keys(byCat).sort().join(", ") || "(none)");
  return { skippedFile: false, inserted, skipped, byCat };
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

  const args = parseArgs(process.argv);
  let jobs = DEFAULT_JOBS.slice();

  if (args.carrier && args.file) {
    jobs = [{ carrier: args.carrier, file: path.resolve(REPO_ROOT, args.file), label: args.carrier }];
  } else if (args.only === "moo") {
    jobs = jobs.filter((j) => j.carrier === "mutual_of_omaha");
  } else if (args.only === "amam") {
    jobs = jobs.filter((j) => j.carrier === "american_amicable");
  }

  for (const job of jobs) {
    await embedJob(openaiKey, supabaseUrl, serviceKey, job.carrier, job.file, job.label);
  }

  console.log("\n========== TOTAL ROWS BY CARRIER (internal_knowledge_chunks) ==========");
  const carriers = ["mutual_of_omaha", "american_amicable"];
  for (const c of carriers) {
    const n = await countCarrierRows(supabaseUrl, serviceKey, c);
    console.log(c + ":", n, "rows");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
