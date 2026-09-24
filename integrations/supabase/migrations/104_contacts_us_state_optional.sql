-- A missing residence was stored as Nebraska because contacts.us_state
-- defaulted to NE. Unknown state should stay blank.

ALTER TABLE public.contacts
  ALTER COLUMN us_state DROP NOT NULL,
  ALTER COLUMN us_state DROP DEFAULT;

COMMENT ON COLUMN public.contacts.us_state IS
  'Two-letter residence when the lead or staff provided one. Blank when unknown.';
