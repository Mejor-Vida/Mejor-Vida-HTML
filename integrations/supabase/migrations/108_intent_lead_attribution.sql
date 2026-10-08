-- Intent Lead (WhatsApp state question answered) — idempotent Meta CAPI + CRM marker.

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS estado_response text;

COMMENT ON COLUMN public.contacts.estado_response IS
  'Raw ManyChat estado field (city, state, abbreviation, or spelling) at Intent Lead.';

ALTER TABLE public.lead_state
  ADD COLUMN IF NOT EXISTS intent_lead_at timestamptz;

COMMENT ON COLUMN public.lead_state.intent_lead_at IS
  'First time contact qualified as Intent Lead (state question answered); Meta Lead CAPI sent once.';
