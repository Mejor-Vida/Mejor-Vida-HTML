-- Inbound FEX quote notifications parsed from email (Make.com / Zapier → webhook).

CREATE TABLE IF NOT EXISTS fex_email_quotes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  source             text NOT NULL DEFAULT 'fex_email',
  ingested_at        timestamptz NOT NULL,
  sender_email       text,
  sender_name        text,
  email_subject      text,
  email_message_id   text,
  raw_body_plain     text,
  raw_body_html      text,
  parsed             jsonb NOT NULL DEFAULT '{}'::jsonb,
  age                integer,
  gender             text,
  tobacco            text,
  coverage_amount    numeric,
  state_code         char(2),
  quote_summary      text,
  hubspot_contact_id text,
  hubspot_deal_id    text,
  hubspot_sync_error text,
  request_raw        jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_fex_email_quotes_created ON fex_email_quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fex_email_quotes_sender ON fex_email_quotes (sender_email);

COMMENT ON TABLE fex_email_quotes IS 'FEX quote emails ingested via Make/Zapier webhook; raw + parsed fields + HubSpot IDs.';
COMMENT ON COLUMN fex_email_quotes.parsed IS 'Structured fields from Make parser (age, gender, carriers, etc.).';
COMMENT ON COLUMN fex_email_quotes.request_raw IS 'Full JSON body received by the webhook (audit).';
