-- CRM Lead Nurture Engine — stage-driven sequences (New 4-day, Contacted long-term, newsletter).

CREATE TABLE IF NOT EXISTS public.crm_nurture_settings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_key  text NOT NULL DEFAULT 'default' UNIQUE,
  config        jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    text
);

COMMENT ON TABLE public.crm_nurture_settings IS
  'Editable nurture engine config (call times, cadence, template keys, timezone).';

CREATE TABLE IF NOT EXISTS public.crm_nurture_enrollments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid NOT NULL,
  lead_source_table text NOT NULL,
  contact_id        uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  stage             text NOT NULL,
  enrolled_at       timestamptz NOT NULL DEFAULT now(),
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  sequence_version  text NOT NULL DEFAULT 'v1',
  cancelled_reason  text,
  completed_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_nurture_enrollments_active_lead
  ON public.crm_nurture_enrollments (lead_id, lead_source_table)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_crm_nurture_enrollments_stage
  ON public.crm_nurture_enrollments (stage, status);

COMMENT ON TABLE public.crm_nurture_enrollments IS
  'Active nurture enrollment per CRM lead (IC stage). One active row per lead.';

CREATE TABLE IF NOT EXISTS public.crm_nurture_tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   uuid NOT NULL REFERENCES public.crm_nurture_enrollments (id) ON DELETE CASCADE,
  task_type       text NOT NULL
                  CHECK (task_type IN ('call', 'email', 'sms', 'stage_transition', 'notification')),
  due_at          timestamptz NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'completed', 'skipped', 'cancelled', 'failed')),
  completed_at    timestamptz,
  cancelled_reason text,
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_nurture_tasks_due
  ON public.crm_nurture_tasks (status, due_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_crm_nurture_tasks_enrollment
  ON public.crm_nurture_tasks (enrollment_id);

COMMENT ON TABLE public.crm_nurture_tasks IS
  'Scheduled nurture work items (calls, emails, SMS, stage transitions).';

CREATE TABLE IF NOT EXISTS public.crm_call_tasks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid NOT NULL,
  lead_source_table text NOT NULL,
  contact_id        uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  enrollment_id     uuid REFERENCES public.crm_nurture_enrollments (id) ON DELETE SET NULL,
  nurture_task_id   uuid REFERENCES public.crm_nurture_tasks (id) ON DELETE SET NULL,
  stage             text NOT NULL,
  attempt_number    int NOT NULL DEFAULT 1,
  due_at            timestamptz NOT NULL,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'completed', 'cancelled', 'skipped')),
  completed_at      timestamptz,
  completed_by      text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_call_tasks_due
  ON public.crm_call_tasks (status, due_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_crm_call_tasks_lead
  ON public.crm_call_tasks (lead_id, lead_source_table);

COMMENT ON TABLE public.crm_call_tasks IS
  'Julie call tasks for Daily Summary and CRM dashboard.';

CREATE TABLE IF NOT EXISTS public.crm_newsletter_issues (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_html           text,
  hero_source         text,
  blog_url            text,
  subject             text,
  body_html           text,
  status              text NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  scheduled_send_at   timestamptz,
  sent_at             timestamptz,
  imported_by         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.crm_newsletter_issues IS
  'Weekly newsletter content imported via webhook or staff UI.';

CREATE TABLE IF NOT EXISTS public.crm_newsletter_sends (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id    uuid NOT NULL REFERENCES public.crm_newsletter_issues (id) ON DELETE CASCADE,
  lead_id     uuid NOT NULL,
  lead_source_table text NOT NULL,
  contact_id  uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  email       text,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  provider_id text,
  error       text,
  sent_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_newsletter_sends_issue
  ON public.crm_newsletter_sends (issue_id, status);

ALTER TABLE public.crm_nurture_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_nurture_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_nurture_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_call_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Seed default settings (Julie can edit via staff settings UI).
INSERT INTO public.crm_nurture_settings (settings_key, config)
VALUES (
  'default',
  '{
    "timezone": "America/Chicago",
    "feature_enabled": true,
    "new_sequence": {
      "day0": {
        "welcome_email": { "template": "welcome", "offset_minutes": 0 },
        "welcome_sms": { "template": "welcome_sms", "offset_minutes": 0 },
        "julie_notification": { "template": "new_lead_notify", "offset_minutes": 0 },
        "calls": [
          { "offset_minutes": 0, "attempt": 1 },
          { "time": "17:00", "attempt": 2 }
        ]
      },
      "day1": {
        "calls": [
          { "time": "09:30", "attempt": 3 },
          { "time": "17:00", "attempt": 4 }
        ]
      },
      "day2": {
        "calls": [
          { "time": "09:30", "attempt": 5 }
        ],
        "email": { "time": "10:00", "template": "educational_day2" },
        "calls_pm": [
          { "time": "17:00", "attempt": 6 }
        ],
        "sms": { "time": "17:30", "template": "day2_sms" }
      },
      "day3": {
        "calls": [
          { "time": "09:30", "attempt": 7 },
          { "time": "17:00", "attempt": 8 }
        ],
        "stage_transition": { "time": "23:59", "to": "contacted" }
      }
    },
    "contacted_sequence": {
      "call_interval_days": 14,
      "email_interval_days": 30,
      "call_time": "09:30",
      "email_time": "10:00",
      "email_template": "contacted_educational"
    },
    "newsletter": {
      "day_of_week": 0,
      "hour": 16,
      "minute": 0
    },
    "daily_summary": {
      "hour": 8,
      "minute": 0,
      "recipient": "julie@mejorvidainsurance.com"
    },
    "retained_days": 365,
    "loyal_days": 730
  }'::jsonb
)
ON CONFLICT (settings_key) DO NOTHING;
