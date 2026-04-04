# Supabase — migrations (Mejor Vida)

This folder holds **SQL migrations** for **Postgres (Supabase)** used by the marketing site and serverless APIs: **`quote_lead_submissions`** (quote form + HubSpot sync) and **`fex_email_quotes`** (email pipeline webhook). **Rate tables are not stored in the repo or loaded from here.**

**Related:** FEX embed + follow-up lead flow — `integrations/fex-email/`. Carrier / product knowledge for chatbots lives in **HubSpot**, **ManyChat**, or your **Make** flows — not in this repo’s Google Sheets (removed).

## What’s in `migrations/`

| File | Purpose |
|------|---------|
| **`002_quote_lead_submissions.sql`** | `quote_lead_submissions` — lead capture from the quote tool |
| **`003_quote_lead_workflow.sql`** | Extra columns for quote workflow / CRM sync (legacy field names may remain) |
| **`005_fex_email_quotes.sql`** | `fex_email_quotes` — FEX email quote pipeline |
| **`006_fex_email_quotes_webhook_columns.sql`** | Webhook columns for Make.com / HubSpot |
| **`007_drop_quote_engine_tables.sql`** | Drops legacy quote-engine tables (`carriers`, `rate_*`, `coverage_multipliers`, `moo_living_promise_rates`, etc.); keeps `quote_lead_submissions` and `fex_email_quotes` |

## Environment

Set in **repo root** `.env.local` (gitignored):

- **`DATABASE_URL`** — full Postgres URI from Supabase (Database settings), **or**
- **`SUPABASE_URL`** + **`SUPABASE_DB_PASSWORD`** — `config.py` builds a pooler URI (see `config.py`).

`SUPABASE_SERVICE_ROLE_KEY` is used by **Vercel** routes (`api/quote-lead-sync.js`, `api/fex-email-quote-webhook.js`), not by `apply_migrations.py`.

## Run migrations

```bash
cd /path/to/Mejor-Vida-HTML
pip install -r integrations/supabase/requirements.txt
python3 integrations/supabase/apply_migrations.py
```

## Files

- **`config.py`** — resolves `DATABASE_URL` for local migration runs
- **`apply_migrations.py`** — applies `migrations/*.sql` in order, tracked in `schema_migrations`
