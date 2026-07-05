-- Track CRM pipeline stage changes for analytics (policies sold = transition to "client").

CREATE TABLE IF NOT EXISTS public.crm_stage_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  lead_source_table text NOT NULL,
  from_stage text NOT NULL DEFAULT '',
  to_stage text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by text
);

CREATE INDEX IF NOT EXISTS idx_crm_stage_transitions_to_stage_changed
  ON public.crm_stage_transitions (to_stage, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_stage_transitions_lead
  ON public.crm_stage_transitions (lead_id, lead_source_table);

COMMENT ON TABLE public.crm_stage_transitions IS
  'Append-only CRM stage changes. Policies sold = to_stage client at changed_at.';

ALTER TABLE public.crm_stage_transitions ENABLE ROW LEVEL SECURITY;

-- Best-effort backfill for leads already at Client (uses profile updated_at as sold date).
INSERT INTO public.crm_stage_transitions (lead_id, lead_source_table, from_stage, to_stage, changed_at, changed_by)
SELECT
  p.lead_id,
  p.lead_source_table,
  '',
  'client',
  p.updated_at,
  COALESCE(p.updated_by, 'backfill')
FROM public.staff_lead_profiles p
WHERE lower(COALESCE(p.profile_data->>'pipeline_stage', '')) = 'client'
  AND NOT EXISTS (
    SELECT 1
    FROM public.crm_stage_transitions t
    WHERE t.lead_id = p.lead_id
      AND t.lead_source_table = p.lead_source_table
      AND t.to_stage = 'client'
  );
