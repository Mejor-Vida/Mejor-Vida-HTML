-- Internal staff-only RAG store for Product Selector (Mutual of Omaha knowledge, etc.).
-- SEPARATE from public knowledge_chunks — do not merge or repoint public RAG.
--
-- Note: filename uses 030 because 026 is already used in this repo
-- (026_manychat_leads_staff_hidden.sql).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.internal_knowledge_chunks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier      text NOT NULL,
  product      text NOT NULL DEFAULT 'general',
  category     text NOT NULL DEFAULT 'general',
  content      text NOT NULL,
  embedding    vector(1536),
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- Stable dedupe key for idempotent embedding runs (sha256 hex of carrier+product+category+content).
  chunk_fingerprint text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_internal_knowledge_chunks_fingerprint
  ON public.internal_knowledge_chunks (carrier, chunk_fingerprint);

CREATE INDEX IF NOT EXISTS idx_internal_knowledge_chunks_carrier_category
  ON public.internal_knowledge_chunks (carrier, category);

CREATE INDEX IF NOT EXISTS idx_internal_knowledge_chunks_created
  ON public.internal_knowledge_chunks (created_at DESC);

COMMENT ON TABLE public.internal_knowledge_chunks IS
  'Staff portal Product Selector only. Not used by public website or WhatsApp RAG.';

ALTER TABLE public.internal_knowledge_chunks ENABLE ROW LEVEL SECURITY;
