-- Website quote form leads: operational store in Supabase (Sheets optional backup only).

CREATE TABLE quote_lead_submissions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  source             text NOT NULL DEFAULT 'website_quote_tool',
  first_name         text,
  last_name          text,
  email              text,
  phone              text,
  age                integer,
  gender             text,
  coverage           integer,
  tobacco            text,
  state_code         char(2),
  zip                text,
  lang               text,
  health_condition   text,
  health_other       text,
  quote_summary      text,
  consent_summary    jsonb,
  payload            jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_quote_lead_submissions_created ON quote_lead_submissions (created_at DESC);
CREATE INDEX idx_quote_lead_submissions_email ON quote_lead_submissions (email);

COMMENT ON TABLE quote_lead_submissions IS 'Operational lead capture from quote tool; use Sheets only as optional mirror.';
