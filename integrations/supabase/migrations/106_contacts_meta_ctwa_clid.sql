-- Click-to-WhatsApp click id. Meta stamps this on the first ad chat.
-- The CRM calendar bell sends it back so Meta can learn who scheduled a call.

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS meta_ctwa_clid text;

COMMENT ON COLUMN public.contacts.meta_ctwa_clid IS
  'Meta click-to-WhatsApp click id from the ad that started this chat. Used when a scheduled call is sent back to Meta.';
