-- New-stage call cadence: 4 calls in 4 days (morning / evening alternating), not 8.

UPDATE public.crm_nurture_settings
SET
  config = jsonb_set(
    config,
    '{new_sequence}',
    '{
      "day0": {
        "welcome_email": { "template": "welcome", "offset_minutes": 0 },
        "welcome_sms": { "template": "welcome_sms", "offset_minutes": 0 },
        "calls": [{ "time": "09:30", "attempt": 1 }]
      },
      "day1": {
        "calls": [{ "time": "17:00", "attempt": 2 }]
      },
      "day2": {
        "calls": [{ "time": "09:30", "attempt": 3 }],
        "email": { "time": "10:00", "template": "educational_day2" },
        "sms": { "time": "17:30", "template": "day2_sms" }
      },
      "day3": {
        "calls": [{ "time": "17:00", "attempt": 4 }],
        "stage_transition": { "time": "23:59", "to": "contacted" }
      }
    }'::jsonb,
    true
  ),
  updated_at = now()
WHERE settings_key = 'default';
