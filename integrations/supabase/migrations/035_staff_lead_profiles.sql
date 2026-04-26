-- Canonical staff-facing lead profile store.
-- One-way model: source systems feed the profile view; staff edits persist here only.

CREATE TABLE IF NOT EXISTS public.staff_lead_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  lead_source_table text NOT NULL,
  profile_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text,
  UNIQUE (lead_id, lead_source_table)
);

CREATE INDEX IF NOT EXISTS idx_staff_lead_profiles_lead
  ON public.staff_lead_profiles (lead_id, lead_source_table);

CREATE INDEX IF NOT EXISTS idx_staff_lead_profiles_updated
  ON public.staff_lead_profiles (updated_at DESC);

COMMENT ON TABLE public.staff_lead_profiles IS
  'Canonical staff lead profile edits. Source tables feed read snapshots; edits do not backfill source systems.';

ALTER TABLE public.staff_lead_profiles ENABLE ROW LEVEL SECURITY;
