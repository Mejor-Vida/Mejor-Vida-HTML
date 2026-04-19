-- ManyChat subscriber ID from WhatsApp contact-capture (stored on contacts for cron / API).
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS manychat_subscriber_id TEXT;

COMMENT ON COLUMN contacts.manychat_subscriber_id IS
  'ManyChat subscriber ID from WhatsApp capture; used by nurture-cron with nurture_sequence.manychat_subscriber_id.';
