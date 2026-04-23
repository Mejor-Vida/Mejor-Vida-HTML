-- ManyChat subscriber ID for joining RAG / unanswered_questions to leads without relying on custom fields.
ALTER TABLE manychat_leads
  ADD COLUMN IF NOT EXISTS manychat_subscriber_id text;

CREATE INDEX IF NOT EXISTS idx_manychat_leads_subscriber_id
  ON manychat_leads (manychat_subscriber_id);

COMMENT ON COLUMN manychat_leads.manychat_subscriber_id IS
  'ManyChat subscriber ID (same as contacts.whatsapp_id); set from lead-capture / External Request for RAG lookups.';
