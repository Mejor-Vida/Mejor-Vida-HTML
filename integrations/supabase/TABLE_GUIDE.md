# Supabase `public` tables — what you are looking at

In **Beekeeper**, the left list is **database tables** (and some **functions**), not files or folders. Names are fixed so code can query them; use this guide and **table comments** (migration `009`) to remember what each one is for.

## Lead / CRM-style data

| Table | Source |
|--------|--------|
| `quote_lead_submissions` | Website **quote** form → Vercel `quote-lead-sync` → Supabase + HubSpot. Columns include **`source`** (flow), **`origin_detail`** (UTMs/referrer/path), lifecycle timestamps (**`quote_results_viewed_at`**, **`schedule_modal_opened_at`**, **`call_scheduled_at`**), optional **`contact_id`** (v2 pipeline). View **`quote_lead_funnel`** summarizes funnel flags. |
| `analytics_events` | Website **POST** `/api/analytics-event` — granular funnel rows (results page, schedule modal, etc.) keyed by **`quote_lead_submission_id`** / **`session_client_id`**. |
| `fex_email_quotes` | **FEX email** pipeline → Make/webhook → `fex-email-quote-webhook` |
| `whatsapp_leads` | **WhatsApp** leads → Apps Script → `whatsapp-lead-webhook` (if you use that route) |
| `manychat_leads` | **ManyChat** WhatsApp flow → Vercel `api/lead-capture` / `api/dropoff-capture` (not the website quote form) |
| `quote_ranges` | **WhatsApp quote engine** — precomputed $10K low/high/anchor → Vercel `api/quote` |
| `out_of_state_referrals` | **`quote-out-of-state.html`** → **`api/out-of-state-referral`** → Supabase + email via **Google Apps Script** (`integrations/google-apps-script/out-of-state-referral-email.gs`). Migration **`019_out_of_state_referrals.sql`**. |

## Website chatbot (RAG + Julie escalation)

| Table | Role |
|--------|------|
| `website_chat_sessions` | One **chat session** (contact info + phase before/during Q&A) |
| `escalated_questions` | Questions the bot **could not answer** from the knowledge base (Julie follows up) |
| `unanswered_questions` | ManyChat RAG **NO_ANSWER** logging (`api/rag-answer`) — separate from website escalations |
| `approved_answers` | **Julie-approved** answers; reused for future retrieval |

## Knowledge base (retrieval, not “one giant blob”)

| Table | Role |
|--------|------|
| `knowledge_sources` | **Where** a row came from (sheet import, manual, etc.) |
| `carriers` | Carrier **facts** (reference) |
| `products` | Products under a carrier |
| `state_availability` | State rules / availability |
| `underwriting_rules` | Structured underwriting notes |
| `faq_entries` | Short FAQ entries |
| `marketing_notes` | Marketing copy (separate from “hard facts”) |
| `knowledge_documents` | Long documents |
| `knowledge_chunks` | **Chunks + embeddings** for search |

## Internal

| Table | Role |
|--------|------|
| `schema_migrations` | Tracks which **SQL migration files** ran (do not edit by hand) |

## Green sigma (Σ) items

Those are **Postgres functions** (often **`pgvector`** helpers like `array_to_halfvec`). They are normal; you do not rename them.

## Renaming?

- **Renaming tables** in the DB would **break** app code unless everything is updated.
- Prefer **comments** (migration `009`) + this guide. In Beekeeper, open a table’s **info/properties** to see the comment if the client supports it.
