-- Store recipient first name on token so intake landing matches the email greeting.

ALTER TABLE public.medical_intake_access_tokens
  ADD COLUMN IF NOT EXISTS recipient_first_name text;

COMMENT ON COLUMN public.medical_intake_access_tokens.recipient_first_name IS
  'First name used in email + intake landing greeting when the link was sent.';
