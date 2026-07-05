-- Ensure CRM nurture settings default to testing rollout (not live for all clients).
UPDATE public.crm_nurture_settings
SET config = config || '{
  "rollout_mode": "testing",
  "test_allowlist_emails": [
    "julie@mejorvidainsurance.com",
    "admin@mejorvidainsurance.com",
    "justin@mejorvidainsurance.com"
  ],
  "test_allowlist_names": ["julie braunsroth", "justin braunsroth"],
  "test_allowlist_email_local_parts": ["julie", "admin", "justin"]
}'::jsonb,
    updated_at = now()
WHERE settings_key = 'default';
