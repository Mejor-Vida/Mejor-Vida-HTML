-- Vector search for staff-only internal_knowledge_chunks (Product Selector).
-- Does not touch public knowledge_chunks or match_knowledge_chunks.

CREATE OR REPLACE FUNCTION public.match_internal_knowledge_chunks(
  query_embedding vector(1536),
  match_count integer DEFAULT 8,
  min_similarity double precision DEFAULT 0.25,
  carrier_filter text DEFAULT NULL,
  category_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  product text,
  category text,
  carrier text,
  similarity double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    k.id,
    k.content,
    k.product,
    k.category,
    k.carrier,
    (1 - (k.embedding <=> query_embedding))::double precision AS similarity
  FROM public.internal_knowledge_chunks k
  WHERE k.embedding IS NOT NULL
    AND (carrier_filter IS NULL OR btrim(carrier_filter) = '' OR k.carrier = carrier_filter)
    AND (category_filter IS NULL OR btrim(category_filter) = '' OR k.category = category_filter)
    AND (1 - (k.embedding <=> query_embedding)) >= coalesce(min_similarity, 0.25)
  ORDER BY k.embedding <=> query_embedding
  LIMIT greatest(1, least(coalesce(match_count, 8), 50));
$$;

COMMENT ON FUNCTION public.match_internal_knowledge_chunks IS
  'Product Selector: top-k internal KB chunks by cosine similarity (1536-d embeddings).';

REVOKE ALL ON FUNCTION public.match_internal_knowledge_chunks(vector, integer, double precision, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_internal_knowledge_chunks(vector, integer, double precision, text, text) TO service_role;
