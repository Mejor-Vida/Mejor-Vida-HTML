-- Staff CRM: Julie self-reminders per client (email at scheduled_at).
CREATE TABLE IF NOT EXISTS staff_reminders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid NOT NULL,
  lead_source_table text NOT NULL DEFAULT 'manychat_leads',
  contact_id        uuid REFERENCES contacts (id) ON DELETE SET NULL,
  message           text NOT NULL,
  scheduled_at      timestamptz NOT NULL,
  notify_email      text NOT NULL DEFAULT 'julie@mejorvidainsurance.com',
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'sent', 'cancelled')),
  sent_at           timestamptz,
  created_by        text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_reminders_lead
  ON staff_reminders (lead_id, lead_source_table);

CREATE INDEX IF NOT EXISTS idx_staff_reminders_due
  ON staff_reminders (scheduled_at)
  WHERE status = 'pending';

COMMENT ON TABLE staff_reminders IS
  'Staff CRM per-client reminders — cron sends notify_email at scheduled_at.';
