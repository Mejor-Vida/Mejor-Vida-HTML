ALTER TABLE public.scheduler_appointments
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS staff_reminder_sent_at timestamptz;

COMMENT ON COLUMN public.scheduler_appointments.marketing_opt_in IS
  'Client opted in to marketing SMS/email on booking form.';
COMMENT ON COLUMN public.scheduler_appointments.staff_reminder_sent_at IS
  'When Julie was texted before this call (30 min default).';
