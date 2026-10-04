-- iPhone numbers allowed to Share a Notes recording/transcript to 402-844-1199.

CREATE TABLE IF NOT EXISTS public.staff_call_drop_phones (
  phone_last10 text PRIMARY KEY,
  e164 text NOT NULL,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.staff_call_drop_phones IS
  'Staff cell numbers that may MMS or text a call recording to the Telnyx SMS line for CRM Call Drop.';

ALTER TABLE public.staff_call_drop_phones ENABLE ROW LEVEL SECURITY;
