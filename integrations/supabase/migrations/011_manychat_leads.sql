-- ManyChat WhatsApp flow: leads separate from website quote_lead_submissions.
-- Server access uses SUPABASE_SERVICE_ROLE_KEY (RLS enabled; service role bypasses RLS).

CREATE TABLE manychat_leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name   text,
  phone        text,
  email        text,
  age          integer,
  sex          text,
  tobacco      boolean,
  language     text DEFAULT 'English',
  tag          text DEFAULT 'Lead_NE',
  pipeline_stage text DEFAULT 'new',
  source       text DEFAULT 'whatsapp',
  drop_off     boolean NOT NULL DEFAULT false,
  drop_off_stage text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_manychat_leads_phone ON manychat_leads (phone);
CREATE INDEX idx_manychat_leads_email ON manychat_leads (email);
CREATE INDEX idx_manychat_leads_created ON manychat_leads (created_at DESC);

COMMENT ON TABLE manychat_leads IS 'ManyChat WhatsApp flow → Vercel api/lead-capture, dropoff-capture; not website quote form.';

CREATE TABLE unanswered_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid REFERENCES manychat_leads (id) ON DELETE SET NULL,
  phone       text,
  question    text NOT NULL,
  language    text,
  flow_stage  text,
  resolved    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_unanswered_questions_phone ON unanswered_questions (phone);
CREATE INDEX idx_unanswered_questions_created ON unanswered_questions (created_at DESC);

COMMENT ON TABLE unanswered_questions IS 'ManyChat RAG NO_ANSWER logging; optional HubSpot note.';

ALTER TABLE manychat_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE unanswered_questions ENABLE ROW LEVEL SECURITY;
