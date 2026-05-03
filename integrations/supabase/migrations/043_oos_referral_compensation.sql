-- OOS referral completion / compensation tracking (staff portal — Julie).

ALTER TABLE out_of_state_referrals
  ADD COLUMN IF NOT EXISTS compensation_notes text;
ALTER TABLE out_of_state_referrals
  ADD COLUMN IF NOT EXISTS compensated_at timestamptz;

COMMENT ON COLUMN out_of_state_referrals.compensation_notes IS 'Staff/Julie: referral fee or compensation notes after intro is done.';
COMMENT ON COLUMN out_of_state_referrals.compensated_at IS 'When Julie marked compensation received from the referred agent.';
