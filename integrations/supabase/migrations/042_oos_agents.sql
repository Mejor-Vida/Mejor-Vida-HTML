-- Out-of-state partner agents (staff / Julie-maintained) and referral workflow columns.

CREATE TABLE IF NOT EXISTS oos_agents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  state_code         char(2) NOT NULL,
  display_name       text NOT NULL,
  company_name       text,
  email              text NOT NULL,
  phone              text,
  business_address   text,
  notes              text,
  active             boolean NOT NULL DEFAULT true,
  source             text NOT NULL DEFAULT 'staff'
);

CREATE INDEX IF NOT EXISTS idx_oos_agents_state ON oos_agents (state_code);
CREATE INDEX IF NOT EXISTS idx_oos_agents_active ON oos_agents (active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_oos_agents_email ON oos_agents (email);

COMMENT ON TABLE oos_agents IS 'Licensed agents in other states for OOS referrals; maintained in staff portal (or future Julie workflow).';

ALTER TABLE oos_agents ENABLE ROW LEVEL SECURITY;

ALTER TABLE out_of_state_referrals
  ADD COLUMN IF NOT EXISTS matched_oos_agent_id uuid REFERENCES oos_agents (id) ON DELETE SET NULL;
ALTER TABLE out_of_state_referrals
  ADD COLUMN IF NOT EXISTS referral_context text;
ALTER TABLE out_of_state_referrals
  ADD COLUMN IF NOT EXISTS ai_connection_email text;

CREATE INDEX IF NOT EXISTS idx_out_of_state_referrals_matched_agent
  ON out_of_state_referrals (matched_oos_agent_id);

COMMENT ON COLUMN out_of_state_referrals.matched_oos_agent_id IS 'Selected OOS agent for this referral.';
COMMENT ON COLUMN out_of_state_referrals.referral_context IS 'Staff narrative: what the lead needs (may extend website message).';
COMMENT ON COLUMN out_of_state_referrals.ai_connection_email IS 'Draft intro email to the OOS agent (Julie voice); may be sent with lead CC.';
