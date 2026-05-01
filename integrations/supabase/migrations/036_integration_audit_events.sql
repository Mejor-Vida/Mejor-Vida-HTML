-- Append-only audit trail for ManyChat → Vercel → Supabase → HubSpot → Staff debugging.
-- Written with SUPABASE_SERVICE_ROLE_KEY (serverless). Staff portal reads via /api/staff/integration-audit.

CREATE TABLE IF NOT EXISTS public.integration_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  stage text NOT NULL,
  endpoint text,
  outcome text NOT NULL CHECK (outcome IN ('ok', 'error')),
  phone_last4 text,
  message text,
  detail jsonb,
  manychat_lead_id uuid,
  contact_id uuid
);

CREATE INDEX IF NOT EXISTS idx_integration_audit_created
  ON public.integration_audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_integration_audit_phone_last4
  ON public.integration_audit_events (phone_last4, created_at DESC);

COMMENT ON TABLE public.integration_audit_events IS
  'Server-written pipeline audit (contact-capture, lead-intake, staff list errors). No anon access; use service role + staff API.';

ALTER TABLE public.integration_audit_events ENABLE ROW LEVEL SECURITY;
