-- Contacted nurture: rotate through 4 educational emails (not the same message every 30 days).

UPDATE public.crm_nurture_settings
SET
  config = jsonb_set(
    (config #- '{contacted_sequence,email_template}'),
    '{contacted_sequence,email_templates}',
    '[
      "contacted_educational_1",
      "contacted_educational_2",
      "contacted_educational_3",
      "contacted_educational_4"
    ]'::jsonb,
    true
  ),
  updated_at = now()
WHERE settings_key = 'default';
