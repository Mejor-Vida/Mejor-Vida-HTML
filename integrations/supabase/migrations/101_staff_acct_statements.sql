-- Staff CRM Accounting — uploaded bank/card statement PDFs (parallel to Patriot).
-- Service role only.

CREATE TABLE IF NOT EXISTS public.staff_acct_statements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name       text NOT NULL DEFAULT '',
  kind            text NOT NULL DEFAULT 'unknown'
                    CHECK (kind IN ('chase_card', 'cornhusker_checking', 'unknown')),
  period_start    date,
  period_end      date,
  begin_cents     integer,
  end_cents       integer,
  storage_path    text,
  file_sha256     text,
  status          text NOT NULL DEFAULT 'processed'
                    CHECK (status IN ('processed', 'failed', 'duplicate')),
  posted_count    integer NOT NULL DEFAULT 0,
  skipped_count   integer NOT NULL DEFAULT 0,
  needs_julie     text NOT NULL DEFAULT '',
  error           text NOT NULL DEFAULT '',
  uploaded_by     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_acct_statements_created_idx
  ON public.staff_acct_statements (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS staff_acct_statements_sha_uidx
  ON public.staff_acct_statements (file_sha256)
  WHERE file_sha256 IS NOT NULL AND file_sha256 <> '';

ALTER TABLE public.staff_acct_statements ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.staff_acct_statements IS
  'Uploaded Chase card / Cornhusker checking PDFs for CRM books. Service role only.';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-acct-statements',
  'staff-acct-statements',
  false,
  15728640,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;
