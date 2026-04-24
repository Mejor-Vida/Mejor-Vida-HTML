-- Staff portal Compose tab: saved draft snapshots (not required to send email).

CREATE TABLE IF NOT EXISTS compose_drafts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       text NOT NULL,
  lead_id          uuid REFERENCES manychat_leads (id) ON DELETE SET NULL,
  recipient_name   text,
  email            text,
  phone            text,
  language         text NOT NULL DEFAULT 'English',
  customer_issue   text,
  staff_notes      text
);

CREATE INDEX IF NOT EXISTS idx_compose_drafts_created_at ON compose_drafts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compose_drafts_created_by ON compose_drafts (created_by);

COMMENT ON TABLE compose_drafts IS 'Staff Compose tab saves (recipient + issue + notes); service role only via API.';

ALTER TABLE compose_drafts ENABLE ROW LEVEL SECURITY;
