-- Out-of-state referral requests (website form → api/out-of-state-referral.js → Supabase + email notifier).

CREATE TABLE IF NOT EXISTS out_of_state_referrals (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               timestamptz NOT NULL DEFAULT now(),
  first_name               text,
  last_name                text,
  email                    text NOT NULL,
  phone                    text,
  state_code               char(2),
  message                  text,
  consent_licensed_agent   boolean NOT NULL DEFAULT false,
  source                   text NOT NULL DEFAULT 'website_out_of_state_form',
  status                   text NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_out_of_state_referrals_created
  ON out_of_state_referrals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_out_of_state_referrals_state
  ON out_of_state_referrals (state_code);
CREATE INDEX IF NOT EXISTS idx_out_of_state_referrals_email
  ON out_of_state_referrals (email);

COMMENT ON TABLE out_of_state_referrals IS 'Non-NE visitors requesting help finding a licensed agent; from quote-out-of-state.html.';

ALTER TABLE out_of_state_referrals ENABLE ROW LEVEL SECURITY;
