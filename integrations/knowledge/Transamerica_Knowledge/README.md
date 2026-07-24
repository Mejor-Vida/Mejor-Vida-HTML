# Transamerica — internal knowledge (Product Selector)

Place curated markdown and `MASTER_TRANSAMERICA_KNOWLEDGE.md` here. This folder is **not** used by the public website or WhatsApp RAG.

**Scope in MASTER:** FE Express + portfolio FE (with rate CSVs), Trendsetter Super/LB, Lifetime WL, and **full underwriting chart extracts** (FE Express/Portfolio decision charts, Lifetime + Term age/amount grids, BMI, impairments). **IUL product deep-dive excluded** (Term/IUL UW guide kept for Trendsetter UW grids).

**Embedding:** from repo root:

```bash
node scripts/embed-internal-knowledge.js --carrier=transamerica --file=integrations/knowledge/Transamerica_Knowledge/MASTER_TRANSAMERICA_KNOWLEDGE.md
```

Requires `OPENAI_API_KEY` and Supabase service role in `.env.local`.

**Database:** `internal_knowledge_chunks` (carrier=`transamerica`).

**API:** `POST /api/staff/internal-rag`
