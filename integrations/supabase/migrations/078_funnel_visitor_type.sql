-- New vs returning visitor classification for funnel_events.

ALTER TABLE funnel_events
  ADD COLUMN IF NOT EXISTS visitor_id text,
  ADD COLUMN IF NOT EXISTS visitor_type text CHECK (visitor_type IS NULL OR visitor_type IN ('new', 'returning'));

CREATE INDEX IF NOT EXISTS idx_funnel_events_visitor ON funnel_events (visitor_id)
  WHERE visitor_id IS NOT NULL;

COMMENT ON COLUMN funnel_events.visitor_id IS 'Persistent browser visitor id (localStorage).';
COMMENT ON COLUMN funnel_events.visitor_type IS 'new = first visit on this browser; returning = repeat visit.';
