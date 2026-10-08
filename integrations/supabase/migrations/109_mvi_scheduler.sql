-- MVI native scheduler (Google Calendar + dual timezone CRM)

CREATE TABLE IF NOT EXISTS public.scheduler_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  booker_timezone text NOT NULL,
  host_timezone text NOT NULL DEFAULT 'America/Chicago',
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  google_event_id text,
  first_name text,
  last_name text,
  phone text,
  email text,
  language text,
  us_state text,
  cancel_token_hash text,
  source text NOT NULL DEFAULT 'mvi_scheduler',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduler_appointments_starts
  ON public.scheduler_appointments (starts_at)
  WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_scheduler_appointments_contact
  ON public.scheduler_appointments (contact_id);

COMMENT ON TABLE public.scheduler_appointments IS
  'Client bookings from mejorvidainsurance.com scheduler; times stored UTC.';

ALTER TABLE public.lead_state
  ADD COLUMN IF NOT EXISTS appointment_booker_timezone text;

COMMENT ON COLUMN public.lead_state.appointment_booker_timezone IS
  'IANA timezone the client used when picking the slot (e.g. America/Los_Angeles).';

ALTER TABLE public.scheduler_appointments ENABLE ROW LEVEL SECURITY;
