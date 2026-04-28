#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REPO_ROOT = path.join(__dirname, "..");
const MAX_CHARS = 3200;
const MIN_CHARS = 120;

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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function normalizeCategory(raw) {
  const t = String(raw || "").toLowerCase();
  if (/final|burial|gastos/.test(t)) return "final_expense";
  if (/term/.test(t)) return "term_life";
  if (/universal|iul/.test(t)) return "universal_life";
  if (/underwrit|eligib|approval|qualif|risk|question/.test(t)) return "underwriting";
  if (/rate|premium/.test(t)) return "rates";
  if (/rider|benefit|feature/.test(t)) return "riders";
  if (/compliance/.test(t)) return "compliance";
  return "general";
}

function fingerprint(carrier, product, category, content) {
  const norm = String(content || "").replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
  const h = crypto.createHash("sha256");
  h.update(`${carrier}\0${product}\0${category}\0${norm}`);
  return h.digest("hex");
}

async function openAiEmbed(apiKey, text) {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: String(text).slice(0, 8000),
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data && data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI embeddings ${r.status}: ${String(err).slice(0, 220)}`);
  }
  const emb = data && data.data && data.data[0] && data.data[0].embedding;
  if (!Array.isArray(emb)) throw new Error("OpenAI embeddings: missing embedding");
  return emb;
}

async function supabaseExists(baseUrl, key, carrier, fp) {
  const url = `${baseUrl}/rest/v1/internal_knowledge_chunks?select=id&carrier=eq.${encodeURIComponent(
    carrier
  )}&chunk_fingerprint=eq.${encodeURIComponent(fp)}&limit=1`;
  const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Supabase select ${r.status}: ${t.slice(0, 260)}`);
  }
  const rows = await r.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function supabaseInsert(baseUrl, key, row) {
  const r = await fetch(`${baseUrl}/rest/v1/internal_knowledge_chunks`, {
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
    if (r.status === 409) return false;
    throw new Error(`Supabase insert ${r.status}: ${text.slice(0, 280)}`);
  }
  return true;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((x) => String(x || "").trim());
}

function parseCsv(content) {
  const lines = String(content || "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    if (!vals.length) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = vals[j] != null ? vals[j] : "";
    rows.push(obj);
  }
  return rows;
}

function chunkText(title, body, category) {
  const head = `## ${title}\n\n`;
  const paras = String(body || "").split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  const out = [];
  let cur = head;
  function flush() {
    const t = cur.trim();
    if (t.length >= MIN_CHARS) out.push({ content: t, category });
    cur = head;
  }
  paras.forEach((p) => {
    if ((cur + p + "\n\n").length > MAX_CHARS) flush();
    cur += p + "\n\n";
  });
  flush();
  return out;
}

function csvRowsToChunks(carrierSlug, rows) {
  const chunks = [];
  rows.forEach((r) => {
    const allowed = String(r.Allowed_AI_Answer || "").toLowerCase() === "true";
    if (!allowed) return;
    const product = String(r.Product || "general").trim() || "general";
    const sub = String(r.Sub_Section || "").trim();
    const category = normalizeCategory(`${r.Category || ""} ${sub}`);
    const title = `${product}${sub ? ` — ${sub}` : ""}`;
    const body = [
      `Carrier: ${String(r.Carrier || "").trim()}`,
      `Category: ${String(r.Category || "").trim()}`,
      r.Client_Question_EN ? `Question: ${String(r.Client_Question_EN).trim()}` : "",
      r.Answer_EN ? `Answer: ${String(r.Answer_EN).trim()}` : "",
      r.Full_Text_EN ? `Details: ${String(r.Full_Text_EN).trim()}` : "",
      r.Search_Keywords ? `Keywords: ${String(r.Search_Keywords).trim()}` : "",
      "Approval Guidance: Use this row for underwriting/eligibility guidance only when details match.",
    ]
      .filter(Boolean)
      .join("\n\n");
    chunkText(title, body, category).forEach((c) => {
      chunks.push({
        carrier: carrierSlug,
        product,
        category: c.category,
        content: c.content,
      });
    });
  });
  return chunks;
}

function markdownToChunks(carrierSlug, productName, markdownPath, categoryHint) {
  if (!fs.existsSync(markdownPath)) return [];
  const raw = fs.readFileSync(markdownPath, "utf8");
  const sections = raw.split(/\n(?=#{1,3}\s)/g).map((s) => s.trim()).filter(Boolean);
  const chunks = [];
  sections.forEach((s) => {
    const first = s.split("\n")[0].replace(/^#+\s*/, "").trim() || "General";
    const cat = categoryHint || normalizeCategory(first);
    chunkText(first, s, cat).forEach((c) => {
      chunks.push({
        carrier: carrierSlug,
        product: productName,
        category: c.category,
        content: c.content,
      });
    });
  });
  return chunks;
}

function buildApprovalLineChunks() {
  const rows = [
    {
      carrier: "mutual_of_omaha",
      product: "Living Promise Whole Life",
      category: "underwriting",
      content:
        "## Product Approval Line — Mutual of Omaha Living Promise Whole Life\n\n" +
        "Use when goal is final expenses and client needs simplified issue. Typical fit: low-to-moderate risk with no immediate disqualifiers. " +
        "If severe health flags or ADL limitations are present, route to guaranteed-issue alternatives instead of forcing this product.",
    },
    {
      carrier: "american_amicable",
      product: "Senior Choice",
      category: "underwriting",
      content:
        "## Product Approval Line — American Amicable Senior Choice\n\n" +
        "Use as final-expense alternative when client seeks easy approval and monthly premium control. " +
        "Best for simplified-issue scenarios with manageable chronic conditions and no recent severe events that force GI-only routing.",
    },
    {
      carrier: "american_amicable",
      product: "Easy Term",
      category: "underwriting",
      content:
        "## Product Approval Line — American Amicable Easy Term\n\n" +
        "Use when goal is income replacement, debt, or mortgage protection and case appears insurable for term coverage. " +
        "Prefer this line when risk is low/moderate and client prioritizes approval simplicity.",
    },
    {
      carrier: "assurity",
      product: "Term Life",
      category: "underwriting",
      content:
        "## Product Approval Line — Assurity Term Life\n\n" +
        "Use for term-focused goals with clients seeking affordable temporary coverage and clean/moderate underwriting profiles. " +
        "Escalate to whole-life/final-expense strategy if multiple high-impact health flags are present.",
    },
    {
      carrier: "assurity",
      product: "Whole Life Protect+",
      category: "underwriting",
      content:
        "## Product Approval Line — Assurity Whole Life Protect+\n\n" +
        "Use for permanent protection goals and legacy/final-expense style needs when client prefers lifetime coverage. " +
        "Good fallback when term fit is weaker but client can still qualify for simplified whole-life underwriting.",
    },
    {
      carrier: "assurity",
      product: "Universal Life",
      category: "underwriting",
      content:
        "## Product Approval Line — Assurity Universal Life\n\n" +
        "Use when permanent coverage flexibility is desired and case can support UL underwriting. " +
        "Present as alternative where term and final-expense products are less aligned with client long-term goals.",
    },
  ];
  return rows;
}

async function ingestChunks(baseUrl, key, openaiKey, chunks) {
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const fp = fingerprint(c.carrier, c.product, c.category, c.content);
    const exists = await supabaseExists(baseUrl, key, c.carrier, fp);
    if (exists) {
      skipped++;
      continue;
    }
    const embedding = await openAiEmbed(openaiKey, c.content);
    const row = {
      carrier: c.carrier,
      product: c.product,
      category: c.category,
      content: c.content,
      embedding,
      chunk_fingerprint: fp,
    };
    const ok = await supabaseInsert(baseUrl, key, row);
    if (ok) inserted++;
    else skipped++;
    if (i % 20 === 0 && i > 0) await new Promise((r) => setTimeout(r, 120));
  }
  return { inserted, skipped };
}

async function main() {
  loadEnvLocal();
  const openaiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!openaiKey || !supabaseUrl || !serviceKey) {
    throw new Error("Missing OPENAI_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
  }

  const downloads = path.join(process.env.HOME || "", "Downloads");
  const mooCsv = path.join(downloads, "Mutual of Omaha -Living Promise - Mutual of Omaha Product Data.csv");
  const mooCsvAlt = path.join(downloads, "Mejor Vida — WhatsApp _ ManyChat Insurance Q&A - Mutual of Omaha Product Data.csv");
  const assurityMaster = path.join(downloads, "Assurity_Knowledge", "MASTER_ASSURITY_KNOWLEDGE.md");
  const uwFramework = path.join(downloads, "Assurity_Knowledge", "underwriting_question_framework.md");

  let chunks = [];
  if (fs.existsSync(mooCsv)) {
    chunks = chunks.concat(csvRowsToChunks("mutual_of_omaha", parseCsv(fs.readFileSync(mooCsv, "utf8"))));
  }
  if (fs.existsSync(mooCsvAlt)) {
    chunks = chunks.concat(csvRowsToChunks("mutual_of_omaha", parseCsv(fs.readFileSync(mooCsvAlt, "utf8"))));
  }
  chunks = chunks.concat(markdownToChunks("assurity", "Assurity Master Knowledge", assurityMaster));
  chunks = chunks.concat(markdownToChunks("carrier_agnostic", "Underwriting Approval Framework", uwFramework, "underwriting"));
  chunks = chunks.concat(buildApprovalLineChunks());

  const dedup = new Map();
  chunks.forEach((c) => {
    const k = `${c.carrier}|${c.product}|${c.category}|${c.content.slice(0, 240)}`;
    if (!dedup.has(k)) dedup.set(k, c);
  });
  const finalChunks = Array.from(dedup.values());
  console.log(`Prepared ${finalChunks.length} chunks for backfill.`);

  const res = await ingestChunks(supabaseUrl, serviceKey, openaiKey, finalChunks);
  console.log(`Inserted ${res.inserted}, skipped ${res.skipped}.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

