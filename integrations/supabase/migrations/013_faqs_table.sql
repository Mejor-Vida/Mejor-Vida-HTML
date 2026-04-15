-- FAQs table: cached Q&A pairs for instant retrieval (no LLM needed on second hit)
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English', -- 'English' or 'Spanish'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  usage_count INT DEFAULT 0, -- Track how many times this FAQ was used
  embedding VECTOR(1536), -- Optional: embed the question for fuzzy matching
  metadata JSONB -- Optional: source, category, etc.
);

CREATE INDEX IF NOT EXISTS idx_faqs_language ON public.faqs(language);
CREATE INDEX IF NOT EXISTS idx_faqs_created ON public.faqs(created_at DESC);

COMMENT ON TABLE public.faqs IS 'Cached Q&A pairs. Checked first before RAG pipeline. Answers are pre-formulated and language-specific.';
COMMENT ON COLUMN public.faqs.usage_count IS 'Incremented each time this FAQ is returned; helps identify popular questions.';
COMMENT ON COLUMN public.faqs.embedding IS 'Optional: vector embedding of the question for semantic search.';
