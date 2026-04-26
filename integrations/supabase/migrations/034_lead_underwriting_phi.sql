-- PHI isolation table for staff-only underwriting/medical answers.
-- Links by lead UUID context, never by name/phone/email.

CREATE TABLE IF NOT EXISTS public.lead_underwriting_phi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  lead_source_table text NOT NULL,
  encrypted_payload text NOT NULL,
  phi_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_underwriting_phi_unique_lead
  ON public.lead_underwriting_phi (lead_id, lead_source_table);

CREATE INDEX IF NOT EXISTS idx_lead_underwriting_phi_updated
  ON public.lead_underwriting_phi (updated_at DESC);

COMMENT ON TABLE public.lead_underwriting_phi IS
  'Encrypted staff-only underwriting/medical payload keyed by lead UUID context. No direct identity lookup fields.';

ALTER TABLE public.lead_underwriting_phi ENABLE ROW LEVEL SECURITY;
