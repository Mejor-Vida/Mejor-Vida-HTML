-- Enable Row Level Security on public tables (Supabase Security Advisor: rls_disabled_in_public).
--
-- Why: The browser-exposed anon key can call PostgREST. With RLS off, default grants may allow
-- broad access. Turning RLS on with no policies for anon/authenticated blocks direct API access.
--
-- Server routes using SUPABASE_SERVICE_ROLE_KEY are unaffected: the service role bypasses RLS.
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security
--
-- Explicit ALTERs document tables from repo migrations 002–008. The one-line DO block enables RLS
-- on any other public tables (e.g. whatsapp_leads, dashboard-created) and is written as a
-- single line so apply_migrations.py (splits on line-ending ;) executes it as one statement.

-- ---------------------------------------------------------------------------
-- Tables defined in repo migrations 002–008
-- ---------------------------------------------------------------------------
ALTER TABLE quote_lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fex_email_quotes ENABLE ROW LEVEL SECURITY;

ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE underwriting_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalated_questions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Any remaining public base tables (optional tables, future tables, Supabase Advisor catch-all)
-- Single line: required for integrations/supabase/apply_migrations.py statement splitter.
-- ---------------------------------------------------------------------------
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT c.relname AS t FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.t); END LOOP; END $$;
