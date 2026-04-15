-- Semantic search over FAQs (pgvector). Called from Vercel api/website-chat.js or api/rag-answer.js
-- Returns cached answer if a similar question exists, avoiding LLM call.
CREATE OR REPLACE FUNCTION public.match_faqs(query_embedding vector(1536), language_filter text DEFAULT 'English', match_count int DEFAULT 1, min_similarity float DEFAULT 0.75)
RETURNS TABLE (id uuid, question text, answer text, language text, similarity double precision, usage_count int)
LANGUAGE sql
STABLE
AS $$ SELECT f.id, f.question, f.answer, f.language, (1 - (f.embedding <=> query_embedding))::double precision AS similarity, f.usage_count FROM faqs f WHERE f.embedding IS NOT NULL AND f.language = language_filter AND (1 - (f.embedding <=> query_embedding)) >= min_similarity ORDER BY f.embedding <=> query_embedding LIMIT match_count $$;

COMMENT ON FUNCTION public.match_faqs IS 'FAQ cache: top-k FAQ by cosine similarity to query embedding. Language-filtered. Higher min_similarity (0.75+) = more strict matching.';

REVOKE ALL ON FUNCTION public.match_faqs(vector, text, integer, float) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_faqs(vector, text, integer, float) TO service_role;
