# Mutual of Omaha — internal knowledge (Product Selector)

Place `MASTER_MOO_KNOWLEDGE.md` here (web + PDF extract). This folder is **not** used by the public website or WhatsApp RAG.

**Embedding:** from repo root, run `node scripts/embed-internal-knowledge.js` (requires `OPENAI_API_KEY` and Supabase service role in `.env.local`).

**Database:** rows land in `internal_knowledge_chunks` (migration `030_internal_knowledge_chunks.sql`). This repo already uses `026_*.sql` for ManyChat staff fields, so internal KB uses **030**, not 026.
