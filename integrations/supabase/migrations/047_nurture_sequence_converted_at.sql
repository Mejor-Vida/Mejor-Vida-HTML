-- Staff "Clear — Sold" sets nurture_sequence.converted_at (api/staff/nurture-clear-sold.js).
-- Some projects never had this column in the live DB; PostgREST returns PGRST204 if missing.

ALTER TABLE public.nurture_sequence
  ADD COLUMN IF NOT EXISTS converted_at timestamptz;

COMMENT ON COLUMN public.nurture_sequence.converted_at IS
  'When the lead was marked converted / cleared as sold in the staff pipeline.';
