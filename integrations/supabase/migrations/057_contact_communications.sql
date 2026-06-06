-- Staff CRM: per-contact message log (inbound + outbound) with summary + full body.
CREATE TABLE IF NOT EXISTS contact_communications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  uuid NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  direction   text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  channel     text NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'phone', 'system')),
  summary     text NOT NULL,
  body        text,
  subject     text,
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_communications_contact
  ON contact_communications (contact_id, created_at DESC);

COMMENT ON TABLE contact_communications IS
  'Unified client communication log for staff CRM — summary line + optional full body.';
