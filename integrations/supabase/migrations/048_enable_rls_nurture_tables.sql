-- Enable RLS on nurture tables added after 010_enable_rls_public_tables.sql.
-- Server routes use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS); no anon policies needed.

ALTER TABLE public.nurture_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_message_overrides ENABLE ROW LEVEL SECURITY;
