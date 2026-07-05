-- Spanish-only nurture content + review workflow defaults.
UPDATE public.crm_nurture_settings
SET config = config || '{
  "content_language": "spanish",
  "review": {
    "status": "pending",
    "notes": "",
    "reviewed_at": null,
    "reviewed_by": null
  }
}'::jsonb,
    updated_at = now()
WHERE settings_key = 'default';
