-- Staff SMS inbox for Telnyx number +14028441199 (Home Screen PWA).
-- RLS on, no anon/authenticated policies — service_role only.

CREATE TABLE IF NOT EXISTS public.staff_sms_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction     text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_e164     text NOT NULL,
  to_e164       text NOT NULL,
  thread_phone  text NOT NULL,
  body          text NOT NULL DEFAULT '',
  telnyx_id     text,
  actor_email   text,
  meta          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_sms_messages_telnyx_id_uidx
  ON public.staff_sms_messages (telnyx_id)
  WHERE telnyx_id IS NOT NULL AND telnyx_id <> '';

CREATE INDEX IF NOT EXISTS staff_sms_messages_thread_created_idx
  ON public.staff_sms_messages (thread_phone, created_at DESC);

CREATE INDEX IF NOT EXISTS staff_sms_messages_created_idx
  ON public.staff_sms_messages (created_at DESC);

COMMENT ON TABLE public.staff_sms_messages IS
  'All inbound/outbound SMS on the Telnyx business number for the staff SMS inbox PWA.';

ALTER TABLE public.staff_sms_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.staff_sms_otp_codes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  code_hash     text NOT NULL,
  expires_at    timestamptz NOT NULL,
  attempts      int NOT NULL DEFAULT 0,
  max_attempts  int NOT NULL DEFAULT 5,
  verified_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_sms_otp_codes_email_created_idx
  ON public.staff_sms_otp_codes (email, created_at DESC);

COMMENT ON TABLE public.staff_sms_otp_codes IS
  'Short-lived email OTP hashes for staff SMS inbox login (julie@ / admin@ only).';

ALTER TABLE public.staff_sms_otp_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.staff_sms_push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_sms_push_subscriptions_endpoint_key UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS staff_sms_push_subscriptions_email_idx
  ON public.staff_sms_push_subscriptions (email);

COMMENT ON TABLE public.staff_sms_push_subscriptions IS
  'Web Push subscriptions for the staff SMS inbox Home Screen app.';

ALTER TABLE public.staff_sms_push_subscriptions ENABLE ROW LEVEL SECURITY;
