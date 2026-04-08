-- Semantic search over knowledge_chunks (pgvector). Called from Vercel api/rag-answer.js via PostgREST RPC.
-- Body on one line so apply_migrations.py (splits on line-ending ;) does not break the function.

CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(query_embedding vector(1536), match_count int DEFAULT 3, min_similarity float DEFAULT 0.7)
RETURNS TABLE (id uuid, content text, document_id uuid, similarity double precision)
LANGUAGE sql
STABLE
AS $$ SELECT kc.id, kc.content, kc.document_id, (1 - (kc.embedding <=> query_embedding))::double precision AS similarity FROM knowledge_chunks kc WHERE kc.embedding IS NOT NULL AND (1 - (kc.embedding <=> query_embedding)) >= min_similarity ORDER BY kc.embedding <=> query_embedding LIMIT match_count $$;

COMMENT ON FUNCTION public.match_knowledge_chunks IS 'RAG: top-k chunks by cosine similarity to query embedding (text-embedding-3-small 1536-d).';

REVOKE ALL ON FUNCTION public.match_knowledge_chunks(vector, integer, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_knowledge_chunks(vector, integer, double precision) TO service_role;
