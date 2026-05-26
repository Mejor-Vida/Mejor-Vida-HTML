-- OTP storage for landing / site phone verification (service role only).

CREATE TABLE IF NOT EXISTS phone_verification_codes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164    text NOT NULL,
  code_hash     text NOT NULL,
  expires_at    timestamptz NOT NULL,
  attempts      int NOT NULL DEFAULT 0,
  max_attempts  int NOT NULL DEFAULT 5,
  verified_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS phone_verification_codes_phone_created_idx
  ON phone_verification_codes (phone_e164, created_at DESC);

COMMENT ON TABLE phone_verification_codes IS 'Short-lived SMS OTP hashes for site phone verification';

ALTER TABLE phone_verification_codes ENABLE ROW LEVEL SECURITY;
