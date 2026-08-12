-- Migration 090: Integrity Connect FU term marketplace premiums (quoter-ready)
-- Parallel to term_carrier_premiums (AmAm Easy Term SI charts stay untouched).
-- Stores per-carrier quote cards from Integrity harvest JSON (marketplace, not appointed-only).

CREATE TABLE IF NOT EXISTS term_integrity_premiums (
  id                   bigserial PRIMARY KEY,
  harvest_batch_id     text         NOT NULL,
  source               text         NOT NULL DEFAULT 'integrity_connect',
  underwriting_mode    text         NOT NULL DEFAULT 'fully_underwritten'
                         CHECK (underwriting_mode IN ('fully_underwritten', 'simplified')),
  state                text         NOT NULL DEFAULT 'NE',
  age                  smallint     NOT NULL,
  sex                  text         NOT NULL CHECK (sex IN ('male', 'female')),
  smoker               boolean      NOT NULL DEFAULT false,
  term_years           smallint     NOT NULL CHECK (term_years IN (10, 15, 20, 25, 30)),
  face_amount          integer      NOT NULL,
  health_class         text         NOT NULL,
  health_label         text,
  carrier_slug         text         NOT NULL,
  carrier_name         text         NOT NULL,
  product_slug         text         NOT NULL,
  product_name         text         NOT NULL,
  monthly_premium      numeric(10,2) NOT NULL,
  nearest_age          smallint,
  rank_in_quote        smallint     NOT NULL DEFAULT 1,
  is_best              boolean      NOT NULL DEFAULT false,
  is_mvi_appointed     boolean      NOT NULL DEFAULT false,
  marketplace_policy_count integer,
  quote_scraped_at     timestamptz,
  source_url           text,
  source_file          text         NOT NULL DEFAULT 'integrity-term-harvest.json',
  source_date          date,
  created_at           timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (
    harvest_batch_id,
    state,
    age,
    sex,
    smoker,
    term_years,
    face_amount,
    health_class,
    underwriting_mode,
    carrier_slug,
    product_slug,
    rank_in_quote
  )
);

COMMENT ON TABLE term_integrity_premiums IS
  'Integrity Connect Quick Quote term cards (FU Preferred Best NT etc). Marketplace-wide — filter is_mvi_appointed for Julie-appointed carriers only.';
COMMENT ON COLUMN term_integrity_premiums.is_best IS
  'True for the lowest monthly in that harvest quote cell (marketplace lowest among captured cards).';
COMMENT ON COLUMN term_integrity_premiums.is_mvi_appointed IS
  'True when carrier_slug is in MVI known appointed set (transamerica, corebridge, moo, amam, assurity, aetna, americo).';
COMMENT ON COLUMN term_integrity_premiums.marketplace_policy_count IS
  'Integrity UI policy count for the quote; may exceed rows stored if DOM only rendered top N cards.';

CREATE INDEX IF NOT EXISTS idx_term_integrity_lookup
  ON term_integrity_premiums (state, age, sex, smoker, term_years, face_amount, health_class);

CREATE INDEX IF NOT EXISTS idx_term_integrity_best
  ON term_integrity_premiums (is_best, underwriting_mode, health_class)
  WHERE is_best = true;

CREATE INDEX IF NOT EXISTS idx_term_integrity_appointed
  ON term_integrity_premiums (is_mvi_appointed, underwriting_mode, health_class)
  WHERE is_mvi_appointed = true;

CREATE INDEX IF NOT EXISTS idx_term_integrity_carrier
  ON term_integrity_premiums (carrier_slug, product_slug);

-- Convenience view: marketplace lowest per cell (from stored cards)
CREATE OR REPLACE VIEW term_integrity_best_premiums AS
SELECT *
FROM term_integrity_premiums
WHERE is_best = true;

-- Convenience view: lowest appointed carrier among stored cards per quote cell
CREATE OR REPLACE VIEW term_integrity_appointed_best_premiums AS
SELECT DISTINCT ON (
  harvest_batch_id, state, age, sex, smoker, term_years, face_amount, health_class, underwriting_mode
)
  *
FROM term_integrity_premiums
WHERE is_mvi_appointed = true
ORDER BY
  harvest_batch_id, state, age, sex, smoker, term_years, face_amount, health_class, underwriting_mode,
  monthly_premium ASC, rank_in_quote ASC;

ALTER TABLE term_integrity_premiums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON term_integrity_premiums;
CREATE POLICY "service_role_all" ON term_integrity_premiums
  FOR ALL USING (true) WITH CHECK (true);
