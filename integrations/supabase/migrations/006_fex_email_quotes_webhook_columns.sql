-- Align fex_email_quotes with api/fex-email-quote-webhook.js (after 005).
-- Run after 005_fex_email_quotes.sql. Adds flat columns + raw_payload; backfills from legacy names.

ALTER TABLE fex_email_quotes
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS body_plain text,
  ADD COLUMN IF NOT EXISTS body_html text,
  ADD COLUMN IF NOT EXISTS received_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS hubspot_sync_status text;

UPDATE fex_email_quotes
SET subject = email_subject
WHERE subject IS NULL AND email_subject IS NOT NULL;

UPDATE fex_email_quotes
SET body_plain = raw_body_plain
WHERE body_plain IS NULL AND raw_body_plain IS NOT NULL;

UPDATE fex_email_quotes
SET body_html = raw_body_html
WHERE body_html IS NULL AND raw_body_html IS NOT NULL;

UPDATE fex_email_quotes
SET received_at = ingested_at
WHERE received_at IS NULL AND ingested_at IS NOT NULL;

UPDATE fex_email_quotes
SET raw_payload = COALESCE(request_raw, '{}'::jsonb)
WHERE raw_payload = '{}'::jsonb AND request_raw IS NOT NULL;

COMMENT ON COLUMN fex_email_quotes.raw_payload IS 'Full JSON body from Make.com webhook.';
COMMENT ON COLUMN fex_email_quotes.processing_status IS 'e.g. received';
