-- Staff Assistant KB gap queue (internal only).
-- Captures questions that fell back from internal RAG to general knowledge.

CREATE TABLE IF NOT EXISTS public.staff_kb_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  question_hash text NOT NULL UNIQUE,
  assistant_answer text,
  source text NOT NULL DEFAULT 'general_fallback',
  retrieval_count integer NOT NULL DEFAULT 0,
  max_similarity double precision,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by text,
  last_asked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_kb_gaps_unresolved
  ON public.staff_kb_gaps (resolved, last_asked_at DESC);

COMMENT ON TABLE public.staff_kb_gaps IS
  'Internal queue of Staff Assistant knowledge gaps when RAG retrieval is insufficient.';

ALTER TABLE public.staff_kb_gaps ENABLE ROW LEVEL SECURITY;
