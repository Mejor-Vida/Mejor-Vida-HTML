# Supabase — migrations (Mejor Vida)

This folder holds **SQL migrations** for **Postgres (Supabase)** used by the marketing site and serverless APIs: **`quote_lead_submissions`** (quote form + HubSpot sync), **ManyChat/staff pipeline tables**, and **website chatbot knowledge** (RAG tables). **Rate tables are not stored in the repo or loaded from here.**

**Related:** FEX embed + follow-up lead flow — `integrations/fex-email/`. Chatbot knowledge is stored in Supabase (see **`008`**) and can be seeded from Google Sheets imports.

## What’s in `migrations/`

| File | Purpose |
|------|---------|
| **`002_quote_lead_submissions.sql`** | `quote_lead_submissions` — lead capture from the quote tool |
| **`003_quote_lead_workflow.sql`** | Extra columns for quote workflow / CRM sync (legacy field names may remain) |
| **`005_fex_email_quotes.sql`** | Legacy: created `fex_email_quotes` for retired FEX email quote pipeline |
| **`006_fex_email_quotes_webhook_columns.sql`** | Legacy: extra webhook columns for retired FEX email flow |
| **`007_drop_quote_engine_tables.sql`** | Drops legacy quote-engine tables (`carriers`, `rate_*`, `coverage_multipliers`, `moo_living_promise_rates`, etc.) |
| **`008_website_chatbot_knowledge.sql`** | **`pgvector`**, `website_chat_sessions`, `knowledge_*`, `carriers` / `products` (knowledge, not pricing), `faq_entries`, `marketing_notes`, `approved_answers`, `escalated_questions` |
| **`009_public_table_comments.sql`** | **`COMMENT ON TABLE`** — short descriptions in Postgres (visible in many DB clients) |
| **`010_enable_rls_public_tables.sql`** | **Row Level Security** on all `public` tables — closes Supabase Advisor `rls_disabled_in_public`; server routes using the service role key are unchanged |
| **`011_manychat_leads.sql`** | **`manychat_leads`**, **`unanswered_questions`** — ManyChat WhatsApp flow (separate from website `quote_lead_submissions`) |
| **`012_match_knowledge_chunks_rpc.sql`** | **`match_knowledge_chunks()`** — vector search over **`knowledge_chunks`** for `/api/rag-answer` |
| **`013_enable_rls_manychat_tables.sql`** | RLS on `manychat_leads` / `unanswered_questions` (created after `010`) |
| **`014_quote_ranges.sql`** | **`quote_ranges`** — precomputed $10K FE low/high/anchor for WhatsApp `/api/quote` |
| **`015_schema_migrations_record_014.sql`** | Inserts `014_quote_ranges.sql` into **`schema_migrations`** if `014` was run manually in SQL editor |
| **`027_drop_fex_email_quotes.sql`** | Retires legacy `fex_email_quotes` table |

See **`TABLE_GUIDE.md`** for a plain-English map of which tables belong to leads vs chatbot vs knowledge.

## Environment

Set in **repo root** `.env.local` (gitignored):

- **`DATABASE_URL`** — full Postgres URI from Supabase (Database settings), **or**
- **`SUPABASE_URL`** + **`SUPABASE_DB_PASSWORD`** — `config.py` builds a pooler URI (see `config.py`).

`SUPABASE_SERVICE_ROLE_KEY` is used by **Vercel** routes (for example `api/quote-lead-sync.js`), not by `apply_migrations.py`.

## Run migrations

```bash
cd /path/to/Mejor-Vida-HTML
pip install -r integrations/supabase/requirements.txt
python3 integrations/supabase/apply_migrations.py
```

## Files

- **`config.py`** — resolves `DATABASE_URL` for local migration runs
- **`apply_migrations.py`** — applies `migrations/*.sql` in order, tracked in `schema_migrations`
