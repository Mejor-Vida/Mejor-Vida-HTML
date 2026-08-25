-- Migration 097: close public (anon) read/write exposure flagged by Supabase security advisor.
--
-- Three separate problems, all reachable with only the public anon key:
--
-- 1. child_integrity_premiums was created by scripts/import-integrity-children-premiums.py
--    with a bare CREATE TABLE IF NOT EXISTS and never had RLS enabled, so anon could
--    read, overwrite, or TRUNCATE the children's rate table. This is the table named in
--    the "rls_disabled_in_public" advisor email.
--
-- 2. Six tables have RLS enabled but their "service_role_all" policy was created without
--    a TO clause. Postgres defaults that to roles={public}, which includes anon and
--    authenticated, so USING (true) re-opened every one of them. out_of_state_referrals
--    is the worst of these because it holds referral lead PII.
--
-- 3. Four premium views were created without security_invoker, so they run as their owner
--    and bypass RLS on the tables underneath them regardless of items 1 and 2.
--
-- Nothing reads these from the browser: js/staff-crm.js uses the anon key for Supabase
-- Auth only (no .from() calls) and api/staff-config.js is the only route that touches
-- SUPABASE_ANON_KEY. All data access is server-side via SUPABASE_SERVICE_ROLE_KEY, which
-- bypasses RLS, so service_role-only policies are the correct end state.

-- 1. RLS on the advisor-flagged table. No policy: service_role bypasses RLS, everyone
--    else is denied, matching the 70+ other tables in this schema.
ALTER TABLE public.child_integrity_premiums ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.child_integrity_premiums IS
  'Integrity children life harvest premiums. PRIVATE: RLS on, no anon/authenticated policies. Server-side service_role only.';

-- 2. Re-scope the accidentally-public "ALL USING (true)" policies to service_role.
DROP POLICY IF EXISTS "service_role_all" ON public.fe_integrity_premiums;
CREATE POLICY "service_role_all" ON public.fe_integrity_premiums
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON public.term_integrity_premiums;
CREATE POLICY "service_role_all" ON public.term_integrity_premiums
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON public.term_carrier_premiums;
CREATE POLICY "service_role_all" ON public.term_carrier_premiums
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON public.quote_ranges;
CREATE POLICY "service_role_all" ON public.quote_ranges
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all" ON public.quote_ranges_assurity;
CREATE POLICY "service_role_all" ON public.quote_ranges_assurity
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON public.out_of_state_referrals;
CREATE POLICY "service_role_all" ON public.out_of_state_referrals
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Make the premium views honor the caller's RLS instead of the view owner's rights.
ALTER VIEW public.child_integrity_appointed_best_premiums SET (security_invoker = on);
ALTER VIEW public.fe_integrity_appointed_best_premiums     SET (security_invoker = on);
ALTER VIEW public.term_integrity_appointed_best_premiums   SET (security_invoker = on);
ALTER VIEW public.term_integrity_best_premiums             SET (security_invoker = on);

-- Belt and braces: drop the blanket anon/authenticated grants on the rate data and the
-- referral PII table. RLS already denies them; removing the grants means a future
-- accidental "ENABLE RLS" omission or permissive policy cannot re-expose these.
REVOKE ALL ON public.child_integrity_premiums                     FROM anon, authenticated;
REVOKE ALL ON public.child_integrity_appointed_best_premiums      FROM anon, authenticated;
REVOKE ALL ON public.fe_integrity_premiums                        FROM anon, authenticated;
REVOKE ALL ON public.fe_integrity_appointed_best_premiums         FROM anon, authenticated;
REVOKE ALL ON public.term_integrity_premiums                      FROM anon, authenticated;
REVOKE ALL ON public.term_integrity_appointed_best_premiums       FROM anon, authenticated;
REVOKE ALL ON public.term_integrity_best_premiums                 FROM anon, authenticated;
REVOKE ALL ON public.term_carrier_premiums                        FROM anon, authenticated;
REVOKE ALL ON public.quote_ranges                                 FROM anon, authenticated;
REVOKE ALL ON public.quote_ranges_assurity                        FROM anon, authenticated;
REVOKE ALL ON public.out_of_state_referrals                       FROM anon, authenticated;
