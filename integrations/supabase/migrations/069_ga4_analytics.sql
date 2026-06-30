-- GA4 funnel analytics cache for staff CRM dashboard.
-- Populated by /api/ga4-sync-cron from Google Analytics Data API.

CREATE TABLE IF NOT EXISTS ga4_funnel_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_key text NOT NULL CHECK (funnel_key IN ('website', 'landing')),
  period_days int NOT NULL DEFAULT 30,
  stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (funnel_key, period_days)
);

CREATE INDEX IF NOT EXISTS idx_ga4_funnel_cache_synced
  ON ga4_funnel_cache (synced_at DESC);

COMMENT ON TABLE ga4_funnel_cache IS 'Cached GA4 funnel stage counts for staff CRM analytics view';
COMMENT ON COLUMN ga4_funnel_cache.funnel_key IS 'website = main site paths; landing = paid landing pages';
COMMENT ON COLUMN ga4_funnel_cache.stages IS 'Ordered funnel stages with counts, users, conversion rates';
COMMENT ON COLUMN ga4_funnel_cache.detail IS 'Per-stage daily trends, top pages, landing step breakdown';

ALTER TABLE ga4_funnel_cache ENABLE ROW LEVEL SECURITY;
