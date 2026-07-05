-- Daily summary → julie@ + admin@; remove nonexistent justin@ from test allowlists.

UPDATE public.crm_nurture_settings
SET
  config = (
    jsonb_set(
      config #- '{daily_summary,recipient}',
      '{daily_summary,recipients}',
      '["julie@mejorvidainsurance.com", "admin@mejorvidainsurance.com"]'::jsonb,
      true
    )
    || jsonb_build_object(
      'test_allowlist_emails',
      '["julie@mejorvidainsurance.com", "admin@mejorvidainsurance.com"]'::jsonb
    )
    || jsonb_build_object(
      'test_allowlist_email_local_parts',
      '["julie", "admin"]'::jsonb
    )
  ),
  updated_at = now()
WHERE settings_key = 'default';
