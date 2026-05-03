-- Match contacts across E.164 vs national formats without assuming country codes:
-- last 10 digits of digits-only phone (same semantics as staff selectContactsRowsByPhone).

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS phone_last_10 text
  GENERATED ALWAYS AS (
    right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10)
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_contacts_phone_last_10
  ON contacts (phone_last_10)
  WHERE phone_last_10 IS NOT NULL AND btrim(phone_last_10) <> '';

COMMENT ON COLUMN contacts.phone_last_10 IS
  'Last 10 digits of contacts.phone (digits only) for stable matching vs ManyChat/local variants.';
