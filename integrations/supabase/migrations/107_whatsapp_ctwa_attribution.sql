-- CTWA attribution from Meta WhatsApp webhooks (parallel to ManyChat; read-only on messaging).

CREATE TABLE IF NOT EXISTS public.whatsapp_webhook_messages (
  whatsapp_message_id text PRIMARY KEY,
  wa_id text,
  meta_ad_id text,
  meta_ctwa_clid text,
  outcome text NOT NULL DEFAULT 'received',
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.whatsapp_webhook_messages IS
  'Idempotency log for Meta WhatsApp webhook message IDs (CTWA attribution).';

CREATE TABLE IF NOT EXISTS public.whatsapp_ctwa_pending_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id text NOT NULL,
  phone_e164 text,
  phone_last_10 text,
  meta_ad_id text NOT NULL,
  meta_ctwa_clid text,
  source_message_id text NOT NULL REFERENCES public.whatsapp_webhook_messages (whatsapp_message_id) ON DELETE CASCADE,
  received_at timestamptz NOT NULL DEFAULT now(),
  applied_at timestamptz,
  contact_id uuid REFERENCES public.contacts (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_ctwa_pending_wa_id
  ON public.whatsapp_ctwa_pending_attribution (wa_id)
  WHERE applied_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_ctwa_pending_phone_last10
  ON public.whatsapp_ctwa_pending_attribution (phone_last_10)
  WHERE applied_at IS NULL AND phone_last_10 IS NOT NULL;

ALTER TABLE public.whatsapp_webhook_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_ctwa_pending_attribution ENABLE ROW LEVEL SECURITY;
