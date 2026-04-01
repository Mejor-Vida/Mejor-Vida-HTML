-- Mejor Vida — quoting engine (Postgres / Supabase)
-- Live source for website quotes; calculation stays in application code.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Identity & product structure
-- ---------------------------------------------------------------------------

CREATE TABLE carriers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  display_name text NOT NULL,
  logo_path    text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id   uuid NOT NULL REFERENCES carriers (id) ON DELETE CASCADE,
  slug         text NOT NULL,
  display_name text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (carrier_id, slug)
);

CREATE TABLE product_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  version_code    text NOT NULL,
  display_label   text,
  tobacco_class   text NOT NULL DEFAULT 'non_tobacco',
  effective_from  date,
  effective_to    date,
  is_active       boolean NOT NULL DEFAULT true,
  meta            jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, version_code)
);

CREATE INDEX idx_product_versions_active ON product_versions (is_active) WHERE is_active = true;

-- One logical “grid” per version (e.g. Assurity Protect+ monthly $10k base rows).
CREATE TABLE rate_tables (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_version_id uuid NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
  name               text NOT NULL,
  table_kind         text NOT NULL DEFAULT 'monthly_10k_base',
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_version_id, table_kind)
);

-- Age rows: male/female illustrative monthly premium at $10,000 face (matches sheet parser).
CREATE TABLE rate_rows (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_table_id uuid NOT NULL REFERENCES rate_tables (id) ON DELETE CASCADE,
  issue_age     smallint NOT NULL CHECK (issue_age >= 0 AND issue_age <= 120),
  monthly_male_10k    numeric(12, 4) NOT NULL,
  monthly_female_10k  numeric(12, 4) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rate_table_id, issue_age)
);

CREATE INDEX idx_rate_rows_table_age ON rate_rows (rate_table_id, issue_age);

-- Coverage face amounts and multipliers vs $10k base (matches parse_coverage_multiplier_examples).
CREATE TABLE coverage_multipliers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_version_id uuid NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
  face_amount        integer NOT NULL CHECK (face_amount > 0),
  multiplier_male    numeric(12, 6) NOT NULL,
  multiplier_female  numeric(12, 6) NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_version_id, face_amount)
);

CREATE INDEX idx_coverage_mult_version ON coverage_multipliers (product_version_id);

CREATE TABLE state_availability (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_version_id uuid NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
  state_code         char(2) NOT NULL,
  is_available       boolean NOT NULL DEFAULT true,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_version_id, state_code)
);

CREATE INDEX idx_state_avail_state ON state_availability (state_code);

CREATE TABLE underwriting_rules (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_version_id uuid NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
  rule_key           text NOT NULL,
  summary            text,
  body               text,
  metadata           jsonb NOT NULL DEFAULT '{}',
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_version_id, rule_key)
);

-- Optional request/response logging (no PII requirement; you may omit or redact).
CREATE TABLE quote_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source     text,
  request    jsonb,
  response   jsonb,
  error      text
);

CREATE INDEX idx_quote_logs_created ON quote_logs (created_at DESC);

COMMENT ON TABLE carriers IS 'Insurance carriers (identity).';
COMMENT ON TABLE products IS 'Product per carrier (e.g. whole life final expense).';
COMMENT ON TABLE product_versions IS 'Versioned pricing / tobacco class / effective dates.';
COMMENT ON TABLE rate_tables IS 'Named rate grid attached to a product version.';
COMMENT ON TABLE rate_rows IS 'Per-age monthly premiums at $10k face (M/F). App applies coverage_multipliers.';
COMMENT ON TABLE coverage_multipliers IS 'Face amount -> multiplier vs $10k base, per gender.';
COMMENT ON TABLE state_availability IS 'State-level availability for a version.';
COMMENT ON TABLE underwriting_rules IS 'Structured notes/rules for messaging or future rules engine.';
COMMENT ON TABLE quote_logs IS 'Optional audit of quote API calls.';
