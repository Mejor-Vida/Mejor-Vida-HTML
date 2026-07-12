-- Consent form screenshot proof (TCPA visual evidence) stored in private Storage.
-- Object path is relative to bucket consent-proofs; CRM uses signed URLs.

ALTER TABLE public.quote_lead_submissions
  ADD COLUMN IF NOT EXISTS consent_screenshot_path text;

COMMENT ON COLUMN public.quote_lead_submissions.consent_screenshot_path IS
  'Private Storage path (consent-proofs/…) for form screenshot at SMS opt-in submit.';

ALTER TABLE public.crm_lead_archives
  ADD COLUMN IF NOT EXISTS consent_screenshot_path text;

COMMENT ON COLUMN public.crm_lead_archives.consent_screenshot_path IS
  'Copied from source lead at archive time when present.';
