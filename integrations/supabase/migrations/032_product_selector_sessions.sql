-- Product Selector Phase 1:
-- Store underwriting/qualification session + recommendation separate from lead profile tables.

CREATE TABLE IF NOT EXISTS product_selector_sessions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id               uuid NOT NULL,
  lead_source_table     text NOT NULL,
  qualification_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_summary          jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendation        jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence            jsonb NOT NULL DEFAULT '{}'::jsonb,
  sales_enablement      jsonb NOT NULL DEFAULT '{}'::jsonb,
  workflow_state        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by            text DEFAULT 'staff_portal',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, lead_source_table)
);

CREATE INDEX IF NOT EXISTS idx_product_selector_sessions_lead
  ON product_selector_sessions (lead_id, lead_source_table);

CREATE INDEX IF NOT EXISTS idx_product_selector_sessions_updated
  ON product_selector_sessions (updated_at DESC);

COMMENT ON TABLE product_selector_sessions IS
  'Internal staff Product Selector sessions. Keeps underwriting answers and recommendation artifacts separate from lead profile source tables.';

ALTER TABLE product_selector_sessions ENABLE ROW LEVEL SECURITY;
