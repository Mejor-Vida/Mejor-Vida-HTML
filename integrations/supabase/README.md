# Supabase — live quote data (Mejor Vida)

This folder adds **Postgres (Supabase)** as the system of record for **leads and rate data**. The **marketing site** no longer runs the old Python quote server; upcoming **Compulife** integration will call rates via **Vercel** serverless and can continue writing leads here. **Google Sheets** remain optional for **ETL** only (`import_from_sheets.py`), not for live website quoting.

## Current architecture (summary)

| Piece | Role |
|--------|------|
| **`migrations/001_quote_engine_schema.sql`** | Carriers, products, versions, `rate_rows`, `coverage_multipliers`, state/rules/log |
| **`migrations/002_quote_lead_submissions.sql`** | **`quote_lead_submissions`** — operational store for quote-form leads |
| **`quote_data.py`** | Loads `base` + `mults` for the active Assurity product version |
| **`lead_submissions.py`** | Inserts a row per quote submission (for use by a future Vercel/Compulife handler) |
| **`import_from_sheets.py`** | **ETL only**: Sheet → Supabase (run after you edit the workbook) |
| **`seed_sample.py`** | Tiny fake grid for smoke test without Google |
| **Google Sheets** | **Not used operationally** — optional `LEAD_LIST_GOOGLE_SHEET_BACKUP=1` to also append Lead List tab |

## Environment variables

Set in **repo root** `.env.local` (gitignored):

- **`DATABASE_URL`** — recommended: full Postgres URI from Supabase (Database settings).  
  Or **`SUPABASE_URL`** + **`SUPABASE_DB_PASSWORD`**: `config.py` builds `postgresql://postgres:…@db.<ref>.supabase.co:5432/postgres`.

- **`SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`** — not required for these scripts (direct Postgres only). Use service role only in **backend** code, never in static `quote.html`.

- **`QUOTE_DATA_SOURCE`** — default **`supabase`**. Use **`sheets`** only for legacy/emergency.  
  - **`auto`**: Supabase; falls back to Sheet **only** if **`QUOTE_ALLOW_SHEET_FALLBACK=1`** and the DB load fails.  
- **`LEAD_LIST_GOOGLE_SHEET_BACKUP`** — set to `1` / `true` to append the same lead to Google **Lead List** after the Supabase insert (optional backup).
- **`QUOTE_ALLOW_SHEET_FALLBACK`** — rare recovery: allow quote grids from Sheet if Supabase is down.

- **`QUOTE_DB_CARRIER_SLUG`**, **`QUOTE_DB_PRODUCT_SLUG`**, **`QUOTE_DB_VERSION_CODE`** — optional; default resolves **active** `assurity` / `whole_life_protect_plus`.

Import options:

- **`QUOTE_IMPORT_TAB`** — default `Carrier Rate Charts`
- **`QUOTE_IMPORT_VERSION_CODE`** — default `sheet_import_v1` (deactivates other versions for that product)

## Run migrations

```bash
cd /path/to/Mejor-Vida-HTML
pip install -r integrations/supabase/requirements.txt
python3 integrations/supabase/apply_migrations.py
```

## Import rates from Google Sheet

Requires working **`GOOGLE_SHEETS_*`** in `.env.local` (same as today).

```bash
pip install -r integrations/google_sheets/requirements.txt
python3 integrations/supabase/import_from_sheets.py
```

## Seed minimal test data (no Sheet)

```bash
python3 integrations/supabase/seed_sample.py
```

Use **`diagnose_assurity_quote.py`** or your own SQL checks to confirm grids after seeding.

## What changed in the repo (files)

- `integrations/supabase/*` — schema, config, migrate/import/seed, DB loader
- `integrations/google_sheets/quote_engine.py` — legacy grid math helpers (imports / diagnostics)

## Remaining work (other carriers)

- Add carriers/products/versions for **Mutual of Omaha** / **American Amicable** in DB
- Extend import script or add CSV-based loaders
- Optionally use **`underwriting_rules`** / **`state_availability`** in Compulife or serverless messaging

## Assumptions / guardrails

- First production version targets **Assurity Protect+** shape already parsed from Sheets (monthly $10k base × coverage multipliers).
- **`quote_logs`** table exists but is optional for future wiring from Compulife/Vercel.
- Destructive re-import **deletes** `rate_tables` / rows / multipliers for the target **product_version** before replacing.
