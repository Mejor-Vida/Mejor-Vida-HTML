-- Medical intake: secure tokens + submission metadata (no lookup directory tables).
-- Search fields proxy live public APIs server-side (RxNorm, NPI, ICD-10).

CREATE TABLE IF NOT EXISTS public.medical_intake_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  lead_id uuid NOT NULL,
  lead_source_table text NOT NULL,
  recipient_email text,
  issued_by text,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_intake_tokens_lead
  ON public.medical_intake_access_tokens (lead_id, lead_source_table, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_medical_intake_tokens_hash
  ON public.medical_intake_access_tokens (token_hash);

CREATE TABLE IF NOT EXISTS public.medical_intake_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES public.medical_intake_access_tokens(id) ON DELETE SET NULL,
  lead_id uuid NOT NULL,
  lead_source_table text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'superseded')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  phi_source_table text NOT NULL DEFAULT 'medical_intake'
);

CREATE INDEX IF NOT EXISTS idx_medical_intake_submissions_lead
  ON public.medical_intake_submissions (lead_id, lead_source_table, submitted_at DESC);

ALTER TABLE public.medical_intake_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_intake_submissions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.medical_intake_access_tokens IS
  'One-time hashed tokens for private medical intake links (7-day TTL).';
COMMENT ON TABLE public.medical_intake_submissions IS
  'Non-PHI metadata for client medical intake submissions; payload in lead_underwriting_phi.';
