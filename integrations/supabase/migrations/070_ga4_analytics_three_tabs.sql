-- Extend GA4 cache for 3-tab staff CRM layout (website events + landing GA4 + Facebook landing).

ALTER TABLE ga4_funnel_cache DROP CONSTRAINT IF EXISTS ga4_funnel_cache_funnel_key_check;

ALTER TABLE ga4_funnel_cache ADD CONSTRAINT ga4_funnel_cache_funnel_key_check
  CHECK (funnel_key IN (
    'website',
    'landing',
    'website_events',
    'landing_ga4',
    'landing_facebook'
  ));

COMMENT ON COLUMN ga4_funnel_cache.funnel_key IS
  'website_events = main site event list; landing_ga4 = paid landing paths (all traffic); landing_facebook = gastos-finales-ads + Meta/Facebook session source';

COMMENT ON COLUMN ga4_funnel_cache.detail IS
  'website_events: per-event daily/pages; landing_*: { paths: { quote|calculator|schedule: { stages } }, stageDetails }';
