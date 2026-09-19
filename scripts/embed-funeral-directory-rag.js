#!/usr/bin/env node
/**
 * Embed funeral-directory contacts and first-party GPL packages into
 * public chatbot RAG (knowledge_chunks). Replaces the previous
 * funeral_directory source on each run.
 *
 * Does not invent prices. Contact-only homes say to ask the home for its list.
 *
 * Env: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Usage:
 *   node scripts/embed-funeral-directory-rag.js --dry-run
 *   node scripts/embed-funeral-directory-rag.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SOURCE_NAME = "funeral_directory";
const SITE = "https://www.mejorvidainsurance.com";
const MAX_CHARS = 2800;
const EMBED_BATCH = 64;
const INSERT_BATCH = 40;

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m || process.env[m[1]]) return;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    });
}

function money(n) {
  return `$${Number(n).toLocaleString("en-US")}`;
}

function skipHome(home) {
  if (!home || !home.name) return true;
  if (home.estimator || home.id === "us") return true;
  return false;
}

function publishedPackages(home) {
  if (!home || home.gplKind === "stateAverage" || home.gplKind === "none") return [];
  return (home.packages || []).filter((p) => Number(p.amt) > 0);
}

function dirUrl(place, lang) {
  const slug = place.stateSlug || "";
  const city = place.slug || "";
  if (!slug || !city) return lang === "es" ? `${SITE}/funerarias-cementerios.html` : `${SITE}/en/funeral-homes-cemeteries.html`;
  return lang === "es"
    ? `${SITE}/funerarias-cementerios/${slug}/${city}.html`
    : `${SITE}/en/funeral-homes-cemeteries/${slug}/${city}.html`;
}

function homeBlock(home, lang) {
  const isEs = lang === "es";
  const bits = [home.name];
  if (home.address) bits.push(home.address);
  if (home.phone) bits.push(isEs ? `teléfono ${home.phone}` : `phone ${home.phone}`);
  if (home.href) bits.push(home.href);
  const pkgs = publishedPackages(home);
  if (pkgs.length) {
    const lines = pkgs.map((p) => {
      const label = isEs ? p.labelEs || p.id : p.labelEn || p.id;
      const note = isEs ? p.noteEs : p.noteEn;
      return note ? `${label} ${money(p.amt)} (${note})` : `${label} ${money(p.amt)}`;
    });
    bits.push(
      isEs
        ? `Paquetes publicados en la lista de esta funeraria: ${lines.join("; ")}.`
        : `Packages published on this home’s own list: ${lines.join("; ")}.`
    );
  } else {
    bits.push(
      isEs
        ? "No publica en internet una lista general de precios comparable. Pida la lista vigente en la funeraria."
        : "No comparable general price list is published online. Ask this funeral home for its current list."
    );
  }
  return bits.join(". ");
}

function cityHeader(place, lang) {
  const city = lang === "es" ? place.nameEs || place.nameEn : place.nameEn || place.nameEs;
  const state = lang === "es" ? place.stateNameEs || place.stateCode : place.stateNameEn || place.stateCode;
  if (lang === "es") {
    return [
      `Directorio de funerarias: ${city}, ${state}.`,
      "Información de investigación de Mejor Vida Seguros. No son cotizaciones de seguro ni precios de la agencia. Confirme cifras y servicios con la funeraria. El lote del cementerio es una factura aparte.",
      `Página del directorio: ${dirUrl(place, "es")}`,
    ].join("\n");
  }
  return [
    `Funeral home directory: ${city}, ${state}.`,
    "Research information from Mejor Vida Insurance. These are not insurance quotes and not agency prices. Confirm figures and services with the funeral home. The burial plot is a separate cemetery bill.",
    `Directory page: ${dirUrl(place, "en")}`,
  ].join("\n");
}

function splitSized(header, blocks) {
  const out = [];
  let cur = `${header}\n\n`;
  for (const block of blocks) {
    const next = `${cur}${block}\n\n`;
    if (next.length > MAX_CHARS && cur.length > header.length + 10) {
      out.push(cur.trim());
      cur = `${header}\n\n${block}\n\n`;
    } else {
      cur = next;
    }
  }
  if (cur.trim().length > header.length) out.push(cur.trim());
  return out;
}

function buildChunks(data) {
  const chunks = [];
  const places = (data.places || []).filter((p) => p && p.slug && (p.homes || []).length);
  const byState = new Map();

  for (const place of places) {
    const homes = (place.homes || []).filter((h) => !skipHome(h));
    if (!homes.length) continue;
    const st = place.stateCode || "";
    if (!byState.has(st)) {
      byState.set(st, {
        code: st,
        slug: place.stateSlug,
        nameEs: place.stateNameEs,
        nameEn: place.stateNameEn,
        cities: [],
      });
    }
    byState.get(st).cities.push(place.nameEn || place.nameEs);

    for (const lang of ["en", "es"]) {
      const header = cityHeader(place, lang);
      const blocks = homes.map((h) => homeBlock(h, lang));
      const parts = splitSized(header, blocks);
      parts.forEach((content, part) => {
        chunks.push({
          content,
          metadata: {
            topic: "funeral_directory",
            language: lang,
            locale: lang,
            state: place.stateCode,
            city: place.nameEn || place.nameEs,
            slug: place.slug,
            part,
          },
        });
      });
    }
  }

  for (const st of byState.values()) {
    const cities = [...new Set(st.cities)].sort((a, b) => a.localeCompare(b));
    chunks.push({
      content: [
        `Funeral home directory cities in ${st.nameEn || st.code}.`,
        "Mejor Vida Insurance lists funeral homes by city for research. These are not insurance quotes.",
        `Cities: ${cities.join(", ")}.`,
        `Directory: ${SITE}/en/funeral-homes-cemeteries/${st.slug}.html`,
      ].join("\n"),
      metadata: {
        topic: "funeral_directory",
        language: "en",
        locale: "en",
        state: st.code,
        kind: "state_index",
      },
    });
    chunks.push({
      content: [
        `Ciudades del directorio de funerarias en ${st.nameEs || st.code}.`,
        "Mejor Vida Seguros lista funerarias por ciudad para investigar. No son cotizaciones de seguro.",
        `Ciudades: ${cities.join(", ")}.`,
        `Directorio: ${SITE}/funerarias-cementerios/${st.slug}.html`,
      ].join("\n"),
      metadata: {
        topic: "funeral_directory",
        language: "es",
        locale: "es",
        state: st.code,
        kind: "state_index",
      },
    });
  }

  return chunks;
}

function headers(key, prefer) {
  const h = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

async function rest(url, key, opts) {
  const r = await fetch(url, {
    ...opts,
    headers: { ...headers(key, opts.prefer), ...(opts.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${opts.method || "GET"} ${url} ${r.status}: ${text.slice(0, 400)}`);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function embedBatch(apiKey, texts) {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts.map((t) => String(t).slice(0, 8000)),
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI embeddings ${r.status}: ${err}`);
  }
  const ordered = (data.data || []).slice().sort((a, b) => a.index - b.index);
  if (ordered.length !== texts.length) throw new Error("OpenAI embeddings: count mismatch");
  return ordered.map((row) => row.embedding);
}

async function replaceSource(base, key) {
  const sources = await rest(
    `${base}/rest/v1/knowledge_sources?name=eq.${encodeURIComponent(SOURCE_NAME)}&select=id`,
    key,
    { method: "GET" }
  );
  const ids = (sources || []).map((s) => s.id).filter(Boolean);
  if (!ids.length) return;
  const inList = ids.join(",");
  const docs = await rest(
    `${base}/rest/v1/knowledge_documents?source_id=in.(${inList})&select=id`,
    key,
    { method: "GET" }
  );
  const docIds = (docs || []).map((d) => d.id).filter(Boolean);
  for (const docId of docIds) {
    await rest(`${base}/rest/v1/knowledge_chunks?document_id=eq.${encodeURIComponent(docId)}`, key, {
      method: "DELETE",
      prefer: "return=minimal",
    });
  }
  await rest(`${base}/rest/v1/knowledge_documents?source_id=in.(${inList})`, key, {
    method: "DELETE",
    prefer: "return=minimal",
  });
  await rest(`${base}/rest/v1/knowledge_sources?name=eq.${encodeURIComponent(SOURCE_NAME)}`, key, {
    method: "DELETE",
    prefer: "return=minimal",
  });
}

async function main() {
  loadEnvLocal();
  const dry = process.argv.includes("--dry-run");
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "funeral-resources.json"), "utf8"));
  const chunks = buildChunks(data);
  const homes = (data.places || []).reduce(
    (n, p) => n + (p.homes || []).filter((h) => !skipHome(h)).length,
    0
  );
  console.log(`Prepared ${chunks.length} RAG chunks from ${homes} funeral homes in ${data.places.length} cities.`);
  if (dry) {
    console.log("Dry run: not writing to knowledge_chunks.");
    console.log(chunks[0].content.slice(0, 400));
    return;
  }

  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  const base = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "").trim();
  if (!apiKey || !base || !key) {
    console.error("Missing OPENAI_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const embeddings = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH);
    console.log(`Embedding ${i + 1}–${i + batch.length} / ${chunks.length}`);
    embeddings.push(...(await embedBatch(apiKey, batch.map((c) => c.content))));
  }

  await replaceSource(base, key);

  const sourceRows = await rest(`${base}/rest/v1/knowledge_sources`, key, {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify([
      {
        name: SOURCE_NAME,
        source_type: "funeral_directory",
        external_ref: "data/funeral-resources.json",
        notes: `Funeral directory RAG ${data.updated || ""}`.trim(),
      },
    ]),
  });
  const sourceId = sourceRows && sourceRows[0] && sourceRows[0].id;
  if (!sourceId) throw new Error("Failed creating knowledge_sources row");

  const docRows = await rest(`${base}/rest/v1/knowledge_documents`, key, {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify([
      {
        title: `Funeral directory ${data.updated || new Date().toISOString().slice(0, 10)}`,
        source_id: sourceId,
        status: "published",
      },
    ]),
  });
  const docId = docRows && docRows[0] && docRows[0].id;
  if (!docId) throw new Error("Failed creating knowledge_documents row");

  for (let i = 0; i < chunks.length; i += INSERT_BATCH) {
    const slice = chunks.slice(i, i + INSERT_BATCH);
    const rows = slice.map((c, j) => ({
      document_id: docId,
      chunk_index: i + j,
      content: c.content,
      embedding: embeddings[i + j],
      metadata: { ...c.metadata, source_name: SOURCE_NAME, updated: data.updated || "" },
      status: "published",
    }));
    console.log(`Inserting ${i + 1}–${i + rows.length} / ${chunks.length}`);
    await rest(`${base}/rest/v1/knowledge_chunks`, key, {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify(rows),
    });
  }

  console.log(`Inserted ${chunks.length} funeral-directory chunks into knowledge_chunks.`);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
