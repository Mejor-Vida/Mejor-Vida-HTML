-- Migration 098: clear the remaining Supabase security advisor warnings.
--
-- Follows 097 (which fixed the 5 advisor ERRORS: RLS off on child_integrity_premiums
-- plus 4 views running as owner). These are the WARNING-level items.
--
-- 1. "Function Search Path Mutable" — 5 of our functions had no search_path pinned, so a
--    caller could prepend a schema and shadow the tables/operators they resolve. The two
--    SECURITY DEFINER functions already pin it; these five did not. Only our own functions
--    are touched: the ~120 other unpinned functions belong to the pgvector extension.
--
-- 2. "Public/Signed-In Users Can Execute SECURITY DEFINER Function" — consume_rate_limit
--    and cleanup_api_rate_limits run as postgres and were executable by anon and
--    authenticated. Anyone with the public key could burn or reset API rate-limit buckets.
--    Both are only ever called server-side with SUPABASE_SERVICE_ROLE_KEY
--    (lib/rate-limit.js), so the public grants are unnecessary.
--
-- 3. "RLS Policy Always True" — the six "USING (true)" policies rescoped in 097 are
--    redundant: service_role has BYPASSRLS, so it reaches these tables with no policy at
--    all, exactly like the other 70+ tables in this schema. Dropping them removes the
--    always-true expression instead of leaving it for a future TO clause to be lost again.
--
-- Not addressed here: "Extension in Public" (public.vector). Relocating pgvector means
-- rewriting every embedding column's type, and the extension is not itself an access
-- path. Left deliberately.

-- 1. Pin search_path on our own functions (matches the existing search_path=public
--    pattern on consume_rate_limit / cleanup_api_rate_limits; these resolve the vector
--    type and public tables unqualified, so public must stay on the path).
ALTER FUNCTION public.match_knowledge_chunks(vector, integer, double precision)
  SET search_path = public;
ALTER FUNCTION public.match_faqs(vector, text, integer, double precision)
  SET search_path = public;
ALTER FUNCTION public.match_internal_knowledge_chunks(vector, integer, double precision, text, text)
  SET search_path = public;
ALTER FUNCTION public.unified_leads_rows()
  SET search_path = public;
ALTER FUNCTION public.update_nurture_sequence_updated_at()
  SET search_path = public;

-- 2. SECURITY DEFINER functions are server-side only; take them away from the public key.
REVOKE EXECUTE ON FUNCTION public.consume_rate_limit(text, text, integer, integer)
  FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_api_rate_limits(integer)
  FROM anon, authenticated, public;

-- 3. Drop the redundant always-true policies. RLS stays enabled; service_role bypasses
--    RLS, anon/authenticated get no policy and are therefore denied.
DROP POLICY IF EXISTS "service_role_all" ON public.fe_integrity_premiums;
DROP POLICY IF EXISTS "service_role_all" ON public.term_integrity_premiums;
DROP POLICY IF EXISTS "service_role_all" ON public.term_carrier_premiums;
DROP POLICY IF EXISTS "service_role_all" ON public.quote_ranges;
DROP POLICY IF EXISTS "service_role_all" ON public.quote_ranges_assurity;
DROP POLICY IF EXISTS "service_role_all" ON public.out_of_state_referrals;
DROP POLICY IF EXISTS "Service role full access" ON public.out_of_state_referrals;
