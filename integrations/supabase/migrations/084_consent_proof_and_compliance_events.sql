-- Consent proof fields + compliance event timeline + archive denormalized consent.
-- Never hard-delete leads; archive retains audit data indefinitely.

ALTER TABLE public.quote_lead_submissions
  ADD COLUMN IF NOT EXISTS consent_ip text,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS consent_url text,
  ADD COLUMN IF NOT EXISTS consent_user_agent text,
  ADD COLUMN IF NOT EXISTS consent_captured_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_expires_at timestamptz;

COMMENT ON COLUMN public.quote_lead_submissions.consent_ip IS
  'Client IP at form submit (x-forwarded-for / x-real-ip) — TCPA consent proof.';
COMMENT ON COLUMN public.quote_lead_submissions.consent_text IS
  'Exact SMS consent checkbox label text shown to the consumer at submit.';
COMMENT ON COLUMN public.quote_lead_submissions.consent_expires_at IS
  'Telephonic contact consent window end (typically consent_captured_at + 30 days).';

ALTER TABLE public.crm_lead_archives
  ADD COLUMN IF NOT EXISTS consent_ip text,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS consent_captured_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS registered_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'archived';

COMMENT ON COLUMN public.crm_lead_archives.status IS
  'Archive status flag (archived). Source rows remain; active CRM hides via staff_hidden_leads.';

CREATE TABLE IF NOT EXISTS public.crm_compliance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  lead_id uuid NOT NULL,
  lead_source_table text NOT NULL,
  event_type text NOT NULL,
  title text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor text
);

CREATE INDEX IF NOT EXISTS idx_crm_compliance_events_lead
  ON public.crm_compliance_events (lead_id, lead_source_table, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_compliance_events_created
  ON public.crm_compliance_events (created_at DESC);

COMMENT ON TABLE public.crm_compliance_events IS
  'Append-only compliance audit timeline for CRM leads (newest events listed first in UI).';

ALTER TABLE public.crm_compliance_events ENABLE ROW LEVEL SECURITY;
