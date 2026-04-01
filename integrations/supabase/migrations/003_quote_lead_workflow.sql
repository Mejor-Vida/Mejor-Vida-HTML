-- Workflow + observability: raw request, quote phase, HubSpot sync (Supabase remains source of truth).

ALTER TABLE quote_lead_submissions
  ADD COLUMN IF NOT EXISTS request_raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS quote_status text NOT NULL DEFAULT 'quote_requested',
  ADD COLUMN IF NOT EXISTS quote_error text,
  ADD COLUMN IF NOT EXISTS quote_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS carriers_result jsonb,
  ADD COLUMN IF NOT EXISTS quote_grid_source text,
  ADD COLUMN IF NOT EXISTS crm_sync_needed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hubspot_contact_id text,
  ADD COLUMN IF NOT EXISTS hubspot_sync_status text,
  ADD COLUMN IF NOT EXISTS hubspot_last_sync_at timestamptz,
  ADD COLUMN IF NOT EXISTS hubspot_sync_error text;

COMMENT ON COLUMN quote_lead_submissions.request_raw IS 'Original JSON body from the browser (before quote math).';
COMMENT ON COLUMN quote_lead_submissions.payload IS 'Normalized snapshot from the API after validation (pre-quote fields).';
COMMENT ON COLUMN quote_lead_submissions.quote_status IS 'quote_requested → quote_generated | quote_failed.';
COMMENT ON COLUMN quote_lead_submissions.carriers_result IS 'JSON array from compute_carrier_quotes_with_grids.';
COMMENT ON COLUMN quote_lead_submissions.quote_grid_source IS 'supabase or sheets — where rate grids were loaded.';
COMMENT ON COLUMN quote_lead_submissions.crm_sync_needed IS 'true if HubSpot sync should be retried.';

CREATE INDEX IF NOT EXISTS idx_quote_lead_submissions_quote_status
  ON quote_lead_submissions (quote_status);

CREATE INDEX IF NOT EXISTS idx_quote_lead_submissions_crm_sync
  ON quote_lead_submissions (crm_sync_needed)
  WHERE crm_sync_needed = true;
