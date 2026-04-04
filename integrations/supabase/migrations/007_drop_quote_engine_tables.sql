-- Remove legacy quote-engine tables (carriers, rate grids, MoO LP rates, etc.).
-- Keeps: quote_lead_submissions, fex_email_quotes, schema_migrations.
-- Run: python3 integrations/supabase/apply_migrations.py

-- Children / leaf tables first (FK-safe order; CASCADE handles stragglers).
DROP TABLE IF EXISTS rate_rows CASCADE;
DROP TABLE IF EXISTS rate_tables CASCADE;
DROP TABLE IF EXISTS coverage_multipliers CASCADE;
DROP TABLE IF EXISTS moo_living_promise_rates CASCADE;
DROP TABLE IF EXISTS underwriting_rules CASCADE;
DROP TABLE IF EXISTS state_availability CASCADE;
DROP TABLE IF EXISTS quote_logs CASCADE;
DROP TABLE IF EXISTS product_versions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS carriers CASCADE;
