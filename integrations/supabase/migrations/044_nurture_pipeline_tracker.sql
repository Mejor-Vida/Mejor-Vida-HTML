-- Pipeline tracker: delivery log, message overrides, nurture_sequence extensions

-- ── nurture_delivery_log ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nurture_delivery_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  channel         text NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  phase           integer NOT NULL CHECK (phase >= 1 AND phase <= 3),
  step            integer NOT NULL CHECK (step >= 1 AND step <= 9),
  provider_id     text,
  status          text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error           text,
  sent_at         timestamptz NOT NULL DEFAULT now(),
  reason          text
);

CREATE INDEX IF NOT EXISTS idx_nurture_delivery_contact ON public.nurture_delivery_log (contact_id);
CREATE INDEX IF NOT EXISTS idx_nurture_delivery_sent_at ON public.nurture_delivery_log (sent_at DESC);

COMMENT ON TABLE public.nurture_delivery_log IS 'Audit log for nurture cron send attempts (success, failure, skip).';

-- ── nurture_message_overrides (Phase 3 email body/subject per lead) ──
CREATE TABLE IF NOT EXISTS public.nurture_message_overrides (
  contact_id  uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  phase       integer NOT NULL CHECK (phase = 3),
  step        integer NOT NULL CHECK (step >= 1 AND step <= 4),
  subject     text NOT NULL,
  body        text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  text,
  PRIMARY KEY (contact_id, phase, step)
);

COMMENT ON TABLE public.nurture_message_overrides IS 'Per-lead email overrides for nurture Phase 3; cron uses when present.';

-- ── nurture_sequence: pause/resume/stop + opted_out status ───
ALTER TABLE public.nurture_sequence
  DROP CONSTRAINT IF EXISTS nurture_sequence_status_check;

ALTER TABLE public.nurture_sequence
  ADD CONSTRAINT nurture_sequence_status_check
  CHECK (status IN ('active', 'paused', 'completed', 'converted', 'opted_out'));

ALTER TABLE public.nurture_sequence
  ADD COLUMN IF NOT EXISTS paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS resumed_at timestamptz,
  ADD COLUMN IF NOT EXISTS stopped_reason text CHECK (stopped_reason IS NULL OR stopped_reason IN ('sold', 'opted_out'));

COMMENT ON COLUMN public.nurture_sequence.paused_at IS 'When Julie paused nurture via staff portal.';
COMMENT ON COLUMN public.nurture_sequence.resumed_at IS 'Last resume timestamp.';
COMMENT ON COLUMN public.nurture_sequence.stopped_reason IS 'sold or opted_out when permanently stopped.';
