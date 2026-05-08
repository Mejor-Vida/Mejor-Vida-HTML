-- Allow phase 0 in nurture_delivery_log (post-quote email and other pre-sequence sends).

ALTER TABLE public.nurture_delivery_log
  DROP CONSTRAINT IF EXISTS nurture_delivery_log_phase_check;

ALTER TABLE public.nurture_delivery_log
  ADD CONSTRAINT nurture_delivery_log_phase_check
  CHECK (phase >= 0 AND phase <= 3);
