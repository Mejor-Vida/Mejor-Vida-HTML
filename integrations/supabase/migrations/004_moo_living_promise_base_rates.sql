-- Mutual of Omaha Living Promise (NE): base rate per $1k + policy fee; monthly BSP = annual × modal_factor.
-- No coverage_multipliers — premium is computed in application code (non-linear due to policy fee).

CREATE TABLE moo_living_promise_rates (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_version_id  uuid NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
  issue_age           smallint NOT NULL CHECK (issue_age >= 0 AND issue_age <= 120),
  gender              text NOT NULL CHECK (gender IN ('male', 'female')),
  base_rate_per_1k    numeric(14, 4) NOT NULL,
  policy_fee_annual   numeric(12, 2) NOT NULL,
  modal_factor        numeric(12, 6) NOT NULL DEFAULT 0.089,
  min_face            integer NOT NULL DEFAULT 2000,
  max_face            integer NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_version_id, issue_age, gender)
);

CREATE INDEX idx_moo_lp_rates_version_age ON moo_living_promise_rates (product_version_id, issue_age);

COMMENT ON TABLE moo_living_promise_rates IS 'MoO LP: annual = (face/1000)*base_rate_per_1k + policy_fee; monthly_bsp = annual * modal_factor.';
