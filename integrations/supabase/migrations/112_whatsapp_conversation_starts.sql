-- First Click-to-WhatsApp / ad-attributed messaging conversation start (for funnel hour-of-day reporting).

CREATE TABLE IF NOT EXISTS public.whatsapp_conversation_starts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL,
  phone_last_10 text,
  wa_id text,
  us_state text,
  local_hour smallint NOT NULL CHECK (local_hour >= 0 AND local_hour <= 23),
  meta_ad_id text,
  source text NOT NULL DEFAULT 'unknown',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_conversation_starts_phone
  ON public.whatsapp_conversation_starts (phone_last_10)
  WHERE phone_last_10 IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_conversation_starts_wa_id
  ON public.whatsapp_conversation_starts (wa_id)
  WHERE wa_id IS NOT NULL AND phone_last_10 IS NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversation_starts_started
  ON public.whatsapp_conversation_starts (started_at DESC);

COMMENT ON TABLE public.whatsapp_conversation_starts IS
  'First attributed WhatsApp ad conversation per phone/wa_id; local_hour is wall-clock hour in the lead''s inferred timezone.';

ALTER TABLE public.whatsapp_conversation_starts ENABLE ROW LEVEL SECURITY;
