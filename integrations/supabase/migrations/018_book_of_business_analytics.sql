-- Book of business + funnel analytics for website quote leads (Mejor Vida Insurance operational store).
-- Prerequisite: 017_nurture_pipeline_v2.sql (contacts table for optional FKs).
-- Server writes via Vercel (service role bypasses RLS).

ALTER TABLE quote_lead_submissions
  ADD COLUMN IF NOT EXISTS origin_detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_client_id text,
  ADD COLUMN IF NOT EXISTS quote_results_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS schedule_modal_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS call_scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hubspot_deal_id text;

CREATE INDEX IF NOT EXISTS idx_quote_lead_submissions_contact_id
  ON quote_lead_submissions (contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quote_lead_submissions_session_client
  ON quote_lead_submissions (session_client_id) WHERE session_client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quote_lead_submissions_hubspot_deal
  ON quote_lead_submissions (hubspot_deal_id) WHERE hubspot_deal_id IS NOT NULL;

COMMENT ON COLUMN quote_lead_submissions.origin_detail IS 'Acquisition context: UTMs, gclid/fbclid, referrer, page_path, etc.';
COMMENT ON COLUMN quote_lead_submissions.session_client_id IS 'Opaque browser session id (joins to analytics_events).';
COMMENT ON COLUMN quote_lead_submissions.quote_results_viewed_at IS 'First time lead landed on quote results page after submit.';
COMMENT ON COLUMN quote_lead_submissions.schedule_modal_opened_at IS 'First time scheduling modal was opened (best-effort from site).';
COMMENT ON COLUMN quote_lead_submissions.call_scheduled_at IS 'Call booked — from site signal or HubSpot/automation webhook.';
COMMENT ON COLUMN quote_lead_submissions.contact_id IS 'Optional link to v2 contacts when website lead is bridged into WhatsApp pipeline.';
COMMENT ON COLUMN quote_lead_submissions.hubspot_deal_id IS 'HubSpot deal id when deal sync is enabled.';

CREATE TABLE IF NOT EXISTS analytics_events (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               timestamptz NOT NULL DEFAULT now(),
  event_type               text NOT NULL,
  event_data               jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_client_id        text,
  source                   text NOT NULL DEFAULT 'website',
  quote_lead_submission_id uuid REFERENCES quote_lead_submissions (id) ON DELETE SET NULL,
  contact_id               uuid REFERENCES public.contacts (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_quote_lead ON analytics_events (quote_lead_submission_id)
  WHERE quote_lead_submission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events (session_client_id)
  WHERE session_client_id IS NOT NULL;

COMMENT ON TABLE analytics_events IS 'Funnel and UX events from the website (quote results, schedule opens, etc.).';

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE VIEW quote_lead_funnel AS
SELECT
  id,
  created_at,
  source,
  email,
  phone,
  state_code,
  lang,
  quote_status,
  quote_generated_at IS NOT NULL AS has_quote,
  quote_results_viewed_at IS NOT NULL AS viewed_results_page,
  schedule_modal_opened_at IS NOT NULL AS opened_schedule_modal,
  call_scheduled_at IS NOT NULL AS scheduled_call_recorded,
  quote_generated_at,
  quote_results_viewed_at,
  schedule_modal_opened_at,
  call_scheduled_at,
  origin_detail,
  session_client_id,
  hubspot_contact_id,
  hubspot_deal_id,
  contact_id
FROM quote_lead_submissions;

COMMENT ON VIEW quote_lead_funnel IS 'Reporting-friendly booleans + timestamps for the website quote funnel.';
