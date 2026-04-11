-- Add last_name, opt_in consent tracking to manychat_leads.
-- Supports the new email + opt-in capture step (SM 23 / Actions #13).

ALTER TABLE manychat_leads
  ADD COLUMN IF NOT EXISTS last_name   text,
  ADD COLUMN IF NOT EXISTS opt_in      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS opt_in_at   timestamptz;

COMMENT ON COLUMN manychat_leads.last_name  IS 'Contact last name collected in WhatsApp flow.';
COMMENT ON COLUMN manychat_leads.opt_in     IS 'True if contact consented to be contacted via phone/email/text.';
COMMENT ON COLUMN manychat_leads.opt_in_at  IS 'Timestamp when opt-in consent was recorded.';
