-- Supabase Security Advisor: rls_disabled_in_public
-- staff_reminders (056) and contact_communications (057) were created without RLS.
-- Server routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS; anon/authenticated get no policies.

ALTER TABLE public.staff_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_communications ENABLE ROW LEVEL SECURITY;

-- Catch any other public tables added without RLS (same pattern as 010_enable_rls_public_tables.sql).
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT c.relname AS t FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.t); END LOOP; END $$;
