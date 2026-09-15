-- Staff CRM Accounting: parallel books modeled on Patriot Accounting (modified cash).
-- Service role only. Do not expose via anon/authenticated policies.

CREATE TABLE IF NOT EXISTS public.staff_acct_settings (
  id              integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  books_name      text NOT NULL DEFAULT 'Mejor Vida Insurance LLC',
  basis           text NOT NULL DEFAULT 'modified_cash',
  opening_date    date,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  updated_by      text
);

CREATE TABLE IF NOT EXISTS public.staff_acct_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text NOT NULL UNIQUE,
  name            text NOT NULL,
  type            text NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  subtype         text NOT NULL DEFAULT '',
  is_system       boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 100,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_acct_vendors (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  match_pattern        text NOT NULL,
  default_account_id   uuid REFERENCES public.staff_acct_accounts (id),
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_acct_vendors_pattern_uidx
  ON public.staff_acct_vendors (lower(match_pattern));

CREATE TABLE IF NOT EXISTS public.staff_acct_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date      date NOT NULL,
  memo            text NOT NULL DEFAULT '',
  payee           text NOT NULL DEFAULT '',
  source          text NOT NULL DEFAULT 'journal'
                    CHECK (source IN ('import', 'journal', 'deposit', 'withdrawal', 'transfer', 'opening', 'void')),
  status          text NOT NULL DEFAULT 'posted'
                    CHECK (status IN ('draft', 'posted', 'voided')),
  import_id       uuid,
  created_by      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  posted_at       timestamptz,
  voided_at       timestamptz,
  void_of         uuid REFERENCES public.staff_acct_entries (id)
);

CREATE INDEX IF NOT EXISTS staff_acct_entries_date_idx
  ON public.staff_acct_entries (entry_date DESC);
CREATE INDEX IF NOT EXISTS staff_acct_entries_status_idx
  ON public.staff_acct_entries (status);

CREATE TABLE IF NOT EXISTS public.staff_acct_lines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        uuid NOT NULL REFERENCES public.staff_acct_entries (id) ON DELETE CASCADE,
  account_id      uuid NOT NULL REFERENCES public.staff_acct_accounts (id),
  side            text NOT NULL CHECK (side IN ('debit', 'credit')),
  amount_cents    integer NOT NULL CHECK (amount_cents > 0),
  memo            text NOT NULL DEFAULT '',
  sort_order      integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS staff_acct_lines_entry_idx
  ON public.staff_acct_lines (entry_id);
CREATE INDEX IF NOT EXISTS staff_acct_lines_account_idx
  ON public.staff_acct_lines (account_id);

CREATE TABLE IF NOT EXISTS public.staff_acct_imports (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id           uuid NOT NULL REFERENCES public.staff_acct_accounts (id),
  txn_date             date NOT NULL,
  amount_cents         integer NOT NULL,
  description          text NOT NULL DEFAULT '',
  fingerprint          text NOT NULL UNIQUE,
  suggested_account_id uuid REFERENCES public.staff_acct_accounts (id),
  status               text NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'posted', 'ignored')),
  posted_entry_id      uuid REFERENCES public.staff_acct_entries (id),
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_acct_imports_status_idx
  ON public.staff_acct_imports (status, txn_date DESC);

ALTER TABLE public.staff_acct_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_acct_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_acct_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_acct_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_acct_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_acct_imports ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.staff_acct_entries IS
  'Staff CRM parallel books. Service role only. Not the public site.';
