-- Creative testing: Keep/Remove on a Facebook ad, and the ad id
-- saved when a WhatsApp chat starts so cost per lead and cost per sale
-- can be counted for that ad.

CREATE TABLE IF NOT EXISTS public.staff_creative_ad_decisions (
  ad_id text PRIMARY KEY,
  decision text NOT NULL CHECK (decision IN ('keep', 'remove')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.staff_creative_ad_decisions IS
  'Staff CRM creative testing: keep or remove a Meta ad after a test round.';

ALTER TABLE public.staff_creative_ad_decisions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS meta_ad_id text;

COMMENT ON COLUMN public.contacts.meta_ad_id IS
  'Meta ad id that started this WhatsApp chat. Blank for chats that started before it was saved.';

CREATE INDEX IF NOT EXISTS idx_contacts_meta_ad_id
  ON public.contacts (meta_ad_id)
  WHERE meta_ad_id IS NOT NULL;
