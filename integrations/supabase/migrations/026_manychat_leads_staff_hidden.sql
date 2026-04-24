-- Staff compose: soft-hide junk leads (row kept for audit; excluded from lists and lookups).

ALTER TABLE manychat_leads
  ADD COLUMN IF NOT EXISTS staff_hidden_at timestamptz;

COMMENT ON COLUMN manychat_leads.staff_hidden_at IS
  'When set by staff portal, lead is hidden from compose list, staff GET /leads, inbox lead joins, and phone/subscriber lookups in lib/supabase. Row remains in DB.';

CREATE INDEX IF NOT EXISTS idx_manychat_leads_staff_visible
  ON manychat_leads (created_at DESC)
  WHERE staff_hidden_at IS NULL;
