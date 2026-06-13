-- Migration 062: term_carrier_premiums — raw carrier term rate rows (Nebraska public quoter)
-- Populate ONLY from carrier rate charts / verified Agent Center quotes.
-- See integrations/knowledge/Term_Life_Knowledge/README.md

CREATE TABLE IF NOT EXISTS term_carrier_premiums (
  id                   serial PRIMARY KEY,
  carrier              text         NOT NULL CHECK (carrier IN ('moo','amam','assurity')),
  product              text         NOT NULL,
  state                text         NOT NULL DEFAULT 'NE',
  age                  smallint     NOT NULL,
  sex                  text         NOT NULL CHECK (sex IN ('male','female')),
  smoker               boolean      NOT NULL DEFAULT false,
  term_years           smallint     NOT NULL CHECK (term_years IN (10, 15, 20, 25, 30)),
  face_band_min        integer      NOT NULL DEFAULT 100000,
  face_band_max        integer      NOT NULL DEFAULT 999999999,
  face_amount          integer,
  health_class         text         NOT NULL,
  rate_per_thousand    numeric(10,4),
  policy_fee_annual    numeric(8,2) DEFAULT 0,
  modal_monthly_factor numeric(6,4) DEFAULT 0.086,
  monthly_premium      numeric(10,2),
  source_file          text,
  source_date          date,
  created_at           timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (carrier, product, state, age, sex, smoker, term_years, face_band_min, face_band_max, health_class)
);

COMMENT ON TABLE term_carrier_premiums IS 'Raw term life rates from carrier charts — NE public quoter (MOO, AmAm, Assurity)';
COMMENT ON COLUMN term_carrier_premiums.rate_per_thousand IS 'Annual rate per $1,000 from carrier chart; monthly = (rate/1000*face + fee)*modal';
COMMENT ON COLUMN term_carrier_premiums.monthly_premium IS 'Optional fixed monthly when chart publishes total directly';

CREATE INDEX IF NOT EXISTS idx_term_carrier_premiums_lookup
  ON term_carrier_premiums (state, age, sex, smoker, term_years);

ALTER TABLE term_carrier_premiums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON term_carrier_premiums;
CREATE POLICY "service_role_all" ON term_carrier_premiums FOR ALL USING (true) WITH CHECK (true);
