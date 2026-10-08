-- Staff-editable MVI scheduler configuration (single row).

CREATE TABLE IF NOT EXISTS public.scheduler_settings (
  settings_key text PRIMARY KEY DEFAULT 'default',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

COMMENT ON TABLE public.scheduler_settings IS
  'CRM Scheduler tab — availability, buffers, booking rules for public /api/scheduler.';

INSERT INTO public.scheduler_settings (settings_key, config)
VALUES ('default', '{}'::jsonb)
ON CONFLICT (settings_key) DO NOTHING;

ALTER TABLE public.scheduler_settings ENABLE ROW LEVEL SECURITY;
