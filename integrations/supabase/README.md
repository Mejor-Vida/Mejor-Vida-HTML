# Supabase — live quote data (Mejor Vida)

This folder adds **Postgres as the operational source** for website quotes and lead capture. **Google Sheets** are for **backup / authoring only**: you maintain charts in Sheets, push to Supabase with `import_from_sheets.py`; the running API does **not** read Sheets for quotes unless you opt in. **Premium math stays in Python** (`quote_engine.py` / `export_hero_carousel_quotes.py`).

## Current architecture (summary)

| Piece | Role |
|--------|------|
| **`migrations/001_quote_engine_schema.sql`** | Carriers, products, versions, `rate_rows`, `coverage_multipliers`, state/rules/log |
| **`migrations/002_quote_lead_submissions.sql`** | **`quote_lead_submissions`** — operational store for quote-form leads |
| **`quote_data.py`** | Loads `base` + `mults` for the active Assurity product version |
| **`lead_submissions.py`** | Inserts a row per quote submission |
| **`integrations/quote_api/server.py`** | Default **`QUOTE_DATA_SOURCE=supabase`** (no Sheet reads). Leads → Supabase; optional Sheet mirror |
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

Then start the quote API and POST a quote with age **60**, coverage **15000**, gender **male** — Assurity should show a **qualified** illustrative rate.

## Test quote API locally

```bash
pip install -r integrations/quote_api/requirements.txt
export QUOTE_DATA_SOURCE=supabase   # optional; auto works if DB is filled
python3 integrations/quote_api/server.py --port 8765
curl -s "http://127.0.0.1:8765/api/quote/health"
curl -s "http://127.0.0.1:8765/api/quote/options"
```

## What changed in the repo (files)

- `integrations/supabase/*` — new schema, config, migrate/import/seed, DB loader
- `integrations/google_sheets/quote_engine.py` — `compute_carrier_quotes_with_grids`, helpers `allowed_*_from_*`
- `integrations/quote_api/server.py` — `get_cached_quote_grids()`, validation/options/submit use grids

## Remaining work (other carriers)

- Add carriers/products/versions for **Mutual of Omaha** / **American Amicable** in DB
- Extend import script or add CSV-based loaders
- Optionally use **`underwriting_rules`** / **`state_availability`** in API messaging (logic still in Python)

## Assumptions / guardrails

- First production version targets **Assurity Protect+** shape already parsed from Sheets (monthly $10k base × coverage multipliers).
- **`quote_logs`** table exists but is **not** wired in `server.py` yet (optional follow-up).
- Destructive re-import **deletes** `rate_tables` / rows / multipliers for the target **product_version** before replacing.
