-- CRM Accounting: close period + statement reconcile. No live bank feed.

ALTER TABLE public.staff_acct_settings
  ADD COLUMN IF NOT EXISTS closed_through date;

COMMENT ON COLUMN public.staff_acct_settings.closed_through IS
  'Posted/voided entries on or before this date are locked. Books are statement-based, not a live bank feed.';

CREATE TABLE IF NOT EXISTS public.staff_acct_reconciliations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id         uuid NOT NULL REFERENCES public.staff_acct_accounts (id),
  statement_date     date NOT NULL,
  statement_cents    integer NOT NULL,
  difference_cents   integer NOT NULL DEFAULT 0,
  status             text NOT NULL DEFAULT 'completed'
                       CHECK (status IN ('completed')),
  created_by         text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_acct_recon_account_idx
  ON public.staff_acct_reconciliations (account_id, statement_date DESC);

CREATE TABLE IF NOT EXISTS public.staff_acct_recon_marks (
  line_id            uuid PRIMARY KEY REFERENCES public.staff_acct_lines (id) ON DELETE CASCADE,
  recon_id           uuid NOT NULL REFERENCES public.staff_acct_reconciliations (id) ON DELETE CASCADE,
  account_id         uuid NOT NULL REFERENCES public.staff_acct_accounts (id)
);

CREATE INDEX IF NOT EXISTS staff_acct_recon_marks_recon_idx
  ON public.staff_acct_recon_marks (recon_id);

ALTER TABLE public.staff_acct_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_acct_recon_marks ENABLE ROW LEVEL SECURITY;
