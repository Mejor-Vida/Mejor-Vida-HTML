-- Staff-scheduled nurture email dates (Phase 3, weeks 1–4).
CREATE TABLE IF NOT EXISTS public.nurture_email_schedule (
  contact_id    uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  step          integer NOT NULL CHECK (step >= 1 AND step <= 4),
  scheduled_at  timestamptz NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    text,
  PRIMARY KEY (contact_id, step)
);

CREATE INDEX IF NOT EXISTS idx_nurture_email_schedule_due
  ON public.nurture_email_schedule (scheduled_at);

COMMENT ON TABLE public.nurture_email_schedule IS
  'Per-contact scheduled send times for nurture Phase 3 weekly emails; set via staff CRM Connect tab.';

ALTER TABLE public.nurture_email_schedule ENABLE ROW LEVEL SECURITY;
