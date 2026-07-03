-- Product-level funnel events for CRM diagnostics (not GA4).
-- Browser writes via /api/funnel-event (service role); staff reads via /api/staff/funnel-analytics.

CREATE TABLE IF NOT EXISTS funnel_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  session_id    text NOT NULL,
  source        text NOT NULL CHECK (source IN ('facebook', 'google', 'organic', 'direct')),
  campaign      text,
  ad_set        text,
  ad_name       text,
  keyword       text,
  search_term   text,
  tool          text NOT NULL CHECK (tool IN ('quote', 'calculator', 'schedule', 'bio', 'whatsapp')),
  step_name     text NOT NULL,
  event_type    text NOT NULL CHECK (event_type IN ('click', 'step_view', 'step_complete', 'conversion')),
  page_or_step  text,
  device        text CHECK (device IS NULL OR device IN ('mobile', 'tablet', 'desktop')),
  event_data    jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_funnel_events_created ON funnel_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session ON funnel_events (session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_source ON funnel_events (source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_tool_step ON funnel_events (tool, step_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_campaign ON funnel_events (campaign) WHERE campaign IS NOT NULL;

COMMENT ON TABLE funnel_events IS 'First-party funnel diagnostics: session steps, acquisition context, tool branches.';

ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
