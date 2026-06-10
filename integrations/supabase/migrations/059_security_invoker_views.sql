-- Supabase Security Advisor: security_definer_view (0010)
-- Postgres 15+ views default to SECURITY DEFINER and bypass RLS for anon/authenticated.
-- Staff API uses service_role (bypasses RLS); these views should honor invoker RLS for PostgREST.

ALTER VIEW public.unified_leads SET (security_invoker = on);
ALTER VIEW public.quote_lead_funnel SET (security_invoker = on);

COMMENT ON VIEW public.unified_leads IS
  'Read-only lead directory for staff compose. security_invoker=on — respects RLS on underlying tables.';

COMMENT ON VIEW public.quote_lead_funnel IS
  'Reporting-friendly booleans + timestamps for the website quote funnel. security_invoker=on — respects RLS.';
