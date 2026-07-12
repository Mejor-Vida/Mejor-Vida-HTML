-- Multi-state SMS compliance queue + CRM lead archival (retention).
-- send_after_timestamp is the earliest legal send instant (UTC).

CREATE TABLE IF NOT EXISTS public.sms_compliance_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'cancelled', 'failed')),
  send_after_timestamp timestamptz NOT NULL,
  phone text NOT NULL,
  body text NOT NULL,
  state_code text,
  timezone text,
  reason text,
  lead_id uuid,
  lead_source_table text,
  contact_id uuid,
  enrollment_id uuid,
  nurture_task_id uuid,
  source text NOT NULL DEFAULT 'crm_nurture',
  media_urls jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  provider_message_id text,
  error text
);

CREATE INDEX IF NOT EXISTS idx_sms_compliance_queue_due
  ON public.sms_compliance_queue (send_after_timestamp ASC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_sms_compliance_queue_lead
  ON public.sms_compliance_queue (lead_id, lead_source_table)
  WHERE status = 'pending';

COMMENT ON TABLE public.sms_compliance_queue IS
  'Delayed automated Telnyx SMS held for state curfew / holiday compliance. send_after_timestamp is the next legal local window.';

COMMENT ON COLUMN public.sms_compliance_queue.send_after_timestamp IS
  'UTC instant after which the message may be sent (next legal local morning / window open).';

ALTER TABLE public.sms_compliance_queue ENABLE ROW LEVEL SECURITY;

-- Immutable archival snapshots for insurance record retention (replaces hard delete).
CREATE TABLE IF NOT EXISTS public.crm_lead_archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archived_at timestamptz NOT NULL DEFAULT now(),
  archived_by text,
  reason text,
  lead_id uuid NOT NULL,
  lead_source_table text NOT NULL,
  display_name text,
  email text,
  phone text,
  state_code text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crm_lead_archives_lead
  ON public.crm_lead_archives (lead_id, lead_source_table);

CREATE INDEX IF NOT EXISTS idx_crm_lead_archives_archived_at
  ON public.crm_lead_archives (archived_at DESC);

COMMENT ON TABLE public.crm_lead_archives IS
  'Retention archive of CRM leads removed from the active directory. Source rows are suppressed, not destroyed.';

ALTER TABLE public.crm_lead_archives ENABLE ROW LEVEL SECURITY;

-- Seed compliance defaults into nurture settings (merge-safe).
UPDATE public.crm_nurture_settings
SET config = COALESCE(config, '{}'::jsonb) || jsonb_build_object(
  'compliance',
  COALESCE(config->'compliance', '{}'::jsonb) || jsonb_build_object(
    'block_federal_holidays', true,
    'preferred_resume_hour', 9
  )
)
WHERE settings_key = 'default';
