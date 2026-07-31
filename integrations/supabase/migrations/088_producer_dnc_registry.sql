-- Producer DNC / consent-revocation registry for TCPA audit trail (AmAm IMO reminder).
-- Captures STOP and other reasonable-means revocations for SMS and voice outreach.

CREATE TABLE IF NOT EXISTS public.producer_dnc_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  phone_last10 text NOT NULL,
  channels text[] NOT NULL DEFAULT ARRAY['sms', 'voice']::text[],
  reason text,
  method text,
  contact_id uuid,
  lead_id uuid,
  lead_source_table text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS producer_dnc_registry_phone_last10_uidx
  ON public.producer_dnc_registry (phone_last10);

CREATE INDEX IF NOT EXISTS producer_dnc_registry_created_at_idx
  ON public.producer_dnc_registry (created_at DESC);

COMMENT ON TABLE public.producer_dnc_registry IS
  'Internal producer DNC / consent revocation list. SMS STOP and staff opt-outs upsert here for audit.';

ALTER TABLE public.producer_dnc_registry ENABLE ROW LEVEL SECURITY;
