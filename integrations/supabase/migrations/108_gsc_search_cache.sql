-- Google Search Console organic search cache for SEO agents + staff tools.
-- Populated by /api/gsc-sync-cron from the Search Console Search Analytics API.

CREATE TABLE IF NOT EXISTS gsc_search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_key text NOT NULL CHECK (period_key IN ('current_28d', 'previous_28d')),
  period_days int NOT NULL DEFAULT 28,
  date_from date NOT NULL,
  date_to date NOT NULL,
  totals jsonb NOT NULL DEFAULT '{}'::jsonb,
  top_queries jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  groups jsonb NOT NULL DEFAULT '{}'::jsonb,
  home jsonb NOT NULL DEFAULT '{}'::jsonb,
  daily jsonb NOT NULL DEFAULT '[]'::jsonb,
  countries jsonb NOT NULL DEFAULT '[]'::jsonb,
  query_deltas jsonb NOT NULL DEFAULT '[]'::jsonb,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_key)
);

CREATE INDEX IF NOT EXISTS idx_gsc_search_cache_synced
  ON gsc_search_cache (synced_at DESC);

COMMENT ON TABLE gsc_search_cache IS
  'Cached Search Console organic queries/pages for SEO agents (no GSC MCP required)';
COMMENT ON COLUMN gsc_search_cache.period_key IS
  'current_28d = latest 28 days; previous_28d = the 28 days before that';
COMMENT ON COLUMN gsc_search_cache.top_queries IS
  'Top queries by clicks (query, clicks, impressions, ctr, position)';
COMMENT ON COLUMN gsc_search_cache.top_pages IS
  'Top landing pages by clicks (page, path, clicks, impressions, ctr, position)';
COMMENT ON COLUMN gsc_search_cache.query_deltas IS
  'On current_28d only: query click/position changes vs previous_28d';
COMMENT ON COLUMN gsc_search_cache.groups IS
  'Page-group totals: home, state, city, blogs, video';

ALTER TABLE gsc_search_cache ENABLE ROW LEVEL SECURITY;
