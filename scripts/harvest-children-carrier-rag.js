#!/usr/bin/env node
/**
 * Harvest internal + public RAG chunks for children's carrier detail pages.
 * Writes integrations/knowledge/children-carrier-rag-harvest.json
 *
 * Usage: node scripts/harvest-children-carrier-rag.js
 * Does not print secrets.
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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function embed(apiKey, text) {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: String(text).slice(0, 8000),
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`embed ${r.status}`);
  return data.data[0].embedding;
}

async function matchInternal(supabaseUrl, serviceKey, embedding, carrierFilter) {
  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/match_internal_knowledge_chunks`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: 10,
      min_similarity: 0.28,
      carrier_filter: carrierFilter,
      category_filter: null,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`internal ${carrierFilter} ${r.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text || "[]");
}

async function matchPublic(supabaseUrl, serviceKey, embedding) {
  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/match_knowledge_chunks`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: 6,
      min_similarity: 0.4,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`public ${r.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text || "[]");
}

const JOBS = [
  {
    id: "moo",
    carrier: "mutual_of_omaha",
    q: "Mutual of Omaha Children's Whole Life issue ages face amounts Guaranteed Insurability Waiver of Premium Death of Owner juvenile guidelines",
  },
  {
    id: "assurity",
    carrier: "assurity",
    q: "Assurity Protect+ Perform+ juvenile children issue ages Children's Term Rider ownership age 25 Payor Benefit Guaranteed Insurability",
  },
  {
    id: "transamerica",
    carrier: "transamerica",
    q: "Transamerica Immediate Solution juvenile Preferred Standard Children's Grandchildren's Benefit Rider CGR face amounts conversion",
  },
  {
    id: "amam",
    carrier: "american_amicable",
    q: "American Amicable Grandchild Rider GCIA Children's Insurance Agreement juvenile application guidelines Family Solution",
  },
  {
    id: "aetna",
    carrier: "aetna",
    q: "Aetna Accendo child grandchild term rider units face amount Protection Series children's term",
  },
  {
    id: "corebridge",
    carrier: "corebridge",
    q: "Corebridge Select-a-Term Child Rider American Elite Child Rider form 16420N ages face amount to age 25",
  },
];

async function main() {
  loadEnvLocal();
  const apiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!apiKey || !supabaseUrl || !serviceKey) {
    console.error("Missing OPENAI_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const out = { as_of: new Date().toISOString(), carriers: {} };
  for (const job of JOBS) {
    process.stdout.write(`RAG ${job.id}... `);
    const emb = await embed(apiKey, job.q);
    let internal = [];
    try {
      internal = await matchInternal(supabaseUrl, serviceKey, emb, job.carrier);
    } catch (e) {
      try {
        const alt =
          job.carrier === "american_amicable"
            ? "amam"
            : job.carrier === "mutual_of_omaha"
              ? "moo"
              : job.carrier;
        internal = await matchInternal(supabaseUrl, serviceKey, emb, alt);
      } catch (e2) {
        internal = [{ error: String(e.message || e) }];
      }
    }
    const pub = await matchPublic(supabaseUrl, serviceKey, emb);
    out.carriers[job.id] = {
      query: job.q,
      carrier_filter: job.carrier,
      internal: (internal || []).map((c) => ({
        similarity: c.similarity,
        content: c.content,
        document_id: c.document_id,
        metadata: c.metadata || null,
      })),
      public: (pub || []).map((c) => ({
        similarity: c.similarity,
        content: c.content,
        document_id: c.document_id,
      })),
    };
    console.log(`internal=${(internal || []).length} public=${(pub || []).length}`);
  }

  const dest = path.join(REPO_ROOT, "integrations/knowledge/children-carrier-rag-harvest.json");
  fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
  console.log("Wrote", path.relative(REPO_ROOT, dest));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
