-- Migration 091: Integrity Connect Final Expense marketplace premiums (quoter-ready)
-- Parallel to term_integrity_premiums. Stores per-carrier FE Quick Quote cards.
-- Live FE site quoter still uses quote_ranges / quote_ranges_assurity; this table
-- feeds future multi-carrier FE quoting and appointed-best charts.

CREATE TABLE IF NOT EXISTS fe_integrity_premiums (
  id                   bigserial PRIMARY KEY,
  harvest_batch_id     text         NOT NULL,
  source               text         NOT NULL DEFAULT 'integrity_connect',
  state                text         NOT NULL DEFAULT 'NE',
  age                  smallint     NOT NULL,
  sex                  text         NOT NULL CHECK (sex IN ('male', 'female')),
  smoker               boolean      NOT NULL DEFAULT false,
  face_amount          integer      NOT NULL,
  health_class         text         NOT NULL DEFAULT 'standard_nt',
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
  source_file          text         NOT NULL DEFAULT 'integrity-fe-harvest.json',
  source_date          date,
  created_at           timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (
    harvest_batch_id,
    state,
    age,
    sex,
    smoker,
    face_amount,
    health_class,
    carrier_slug,
    product_slug,
    rank_in_quote
  )
);

COMMENT ON TABLE fe_integrity_premiums IS
  'Integrity Connect Final Expense Quick Quote cards. Filter is_mvi_appointed for Julie-appointed carriers.';

CREATE INDEX IF NOT EXISTS idx_fe_integrity_lookup
  ON fe_integrity_premiums (state, age, sex, smoker, face_amount, health_class);

CREATE INDEX IF NOT EXISTS idx_fe_integrity_appointed
  ON fe_integrity_premiums (is_mvi_appointed, health_class)
  WHERE is_mvi_appointed = true;

CREATE OR REPLACE VIEW fe_integrity_appointed_best_premiums AS
SELECT DISTINCT ON (
  harvest_batch_id, state, age, sex, smoker, face_amount, health_class
)
  *
FROM fe_integrity_premiums
WHERE is_mvi_appointed = true
ORDER BY
  harvest_batch_id, state, age, sex, smoker, face_amount, health_class,
  monthly_premium ASC, rank_in_quote ASC;

ALTER TABLE fe_integrity_premiums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON fe_integrity_premiums;
CREATE POLICY "service_role_all" ON fe_integrity_premiums
  FOR ALL USING (true) WITH CHECK (true);
