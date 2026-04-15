-- ============================================================
-- 017_nurture_pipeline_v2.sql
-- v2 lead pipeline tables: contacts, lead_state, events,
-- nurture_sequence, notes, call_transcripts, webhook_logs
-- All server access via SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
-- ============================================================

-- ── contacts ────────────────────────────────────────────────
-- Single source-of-truth contact record, keyed on phone.
CREATE TABLE IF NOT EXISTS contacts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone          text UNIQUE NOT NULL,
  full_name      text,
  language       text NOT NULL DEFAULT 'english' CHECK (language IN ('english', 'spanish')),
  email          text,
  whatsapp_id    text,                          -- ManyChat subscriber ID
  us_state       text NOT NULL DEFAULT 'NE',
  source         text NOT NULL DEFAULT 'whatsapp',
  pending_sms_intent text,                      -- 'quote' | 'call' — set when we're awaiting email reply via SMS
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_phone   ON contacts (phone);
CREATE INDEX IF NOT EXISTS idx_contacts_email   ON contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_wa_id   ON contacts (whatsapp_id);

COMMENT ON TABLE contacts IS 'v2 pipeline: one row per unique phone number. Phone is the primary key.';
COMMENT ON COLUMN contacts.pending_sms_intent IS 'Stores QUOTE or CALL while waiting for lead to SMS their email address.';

-- ── lead_state ───────────────────────────────────────────────
-- Mutable qualification + pipeline status for each contact.
CREATE TABLE IF NOT EXISTS lead_state (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id           uuid UNIQUE NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  pipeline_stage       text NOT NULL DEFAULT 'new_contact',
  age                  integer,
  gender               text,
  is_smoker            boolean,
  coverage_amount      integer,
  monthly_premium      numeric(8,2),
  us_state             text,
  language_picked_at   timestamptz,
  quote_generated_at   timestamptz,
  call_scheduled_at    timestamptz,
  call_completed_at    timestamptz,
  policy_issued_at     timestamptz,
  whatsapp_drop_off    text,
  last_activity_at     timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_state_contact  ON lead_state (contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_state_stage    ON lead_state (pipeline_stage);

COMMENT ON TABLE lead_state IS 'v2 pipeline: mutable qualification fields and pipeline stage per contact.';

-- ── events ───────────────────────────────────────────────────
-- Immutable audit trail — one row per event.
CREATE TABLE IF NOT EXISTS events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   uuid NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  event_type   text NOT NULL,
  event_data   jsonb NOT NULL DEFAULT '{}',
  channel      text NOT NULL DEFAULT 'whatsapp',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_contact    ON events (contact_id);
CREATE INDEX IF NOT EXISTS idx_events_type       ON events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_created    ON events (created_at DESC);

COMMENT ON TABLE events IS 'v2 pipeline: append-only audit trail of lead lifecycle events.';

-- ── nurture_sequence ─────────────────────────────────────────
-- One row per enrolled contact. The cron job walks through
-- phase/step, advancing on each successful send.
--
-- Phase 1 = WhatsApp (steps 1–3, within 24 hrs)
-- Phase 2 = SMS/Twilio (steps 1–3, days 1/3/5)
-- Phase 3 = Email/Resend (steps 1–4, weeks 1–4)
CREATE TABLE IF NOT EXISTS nurture_sequence (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id              uuid UNIQUE NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  manychat_subscriber_id  text,
  status                  text NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'paused', 'completed', 'converted')),
  phase                   integer NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 3),
  step                    integer NOT NULL DEFAULT 1,
  enrolled_at             timestamptz NOT NULL DEFAULT now(),
  next_send_at            timestamptz,
  last_sent_at            timestamptz,
  twilio_opt_out          boolean NOT NULL DEFAULT false,
  email_opt_out           boolean NOT NULL DEFAULT false,
  converted_at            timestamptz,       -- set when lead books a call / becomes a customer
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nurture_contact    ON nurture_sequence (contact_id);
CREATE INDEX IF NOT EXISTS idx_nurture_status     ON nurture_sequence (status);
CREATE INDEX IF NOT EXISTS idx_nurture_next_send  ON nurture_sequence (next_send_at) WHERE status = 'active';

COMMENT ON TABLE nurture_sequence IS 'v2 pipeline: nurture state machine. Cron advances phase/step every 30 min.';

-- ── knowledge_gaps ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_gaps (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question            text NOT NULL,
  contact_id          uuid REFERENCES contacts (id) ON DELETE SET NULL,
  phone               text,
  us_state            text NOT NULL DEFAULT 'NE',
  channel             text NOT NULL DEFAULT 'whatsapp',
  conversation_context jsonb,
  julie_decision      text CHECK (julie_decision IN ('approved', 'rejected', NULL)),
  julie_answer        text,
  julie_decided_at    timestamptz,
  added_to_kb_at      timestamptz,
  kb_chunk_id         uuid,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_decision ON knowledge_gaps (julie_decision);
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_created  ON knowledge_gaps (created_at DESC);

-- ── notes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   uuid NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  note         text NOT NULL,
  note_type    text NOT NULL DEFAULT 'manual' CHECK (note_type IN ('manual', 'ai_summary', 'system')),
  created_by   text NOT NULL DEFAULT 'julie',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_contact ON notes (contact_id);

-- ── call_transcripts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_transcripts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id       uuid NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  call_date        timestamptz,
  duration_secs    integer,
  recording_url    text,
  transcript_text  text,
  ai_summary       text,
  call_outcome     text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_contact ON call_transcripts (contact_id);

-- ── webhook_logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source      text,
  endpoint    text,
  payload     jsonb,
  status      text DEFAULT 'received',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs (created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE contacts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_state        ENABLE ROW LEVEL SECURITY;
ALTER TABLE events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurture_sequence  ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_gaps    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs      ENABLE ROW LEVEL SECURITY;
-- Service role key bypasses RLS; no public policies needed.
