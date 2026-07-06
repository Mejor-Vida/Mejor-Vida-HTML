-- Go live: CRM nurture automation for all leads (not testing allowlist only).

UPDATE public.crm_nurture_settings
SET
  config = jsonb_set(config, '{rollout_mode}', '"live"'::jsonb, true),
  updated_at = now()
WHERE settings_key = 'default';

COMMENT ON TABLE public.crm_nurture_settings IS
  'CRM nurture engine config. rollout_mode live = all leads; testing = allowlist only.';
