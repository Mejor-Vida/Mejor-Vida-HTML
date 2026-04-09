# Mejor Vida — ManyChat backend (Vercel)

This repo hosts the serverless API in the **project root** (not a separate Git repo):

| Path | Role |
|------|------|
| `api/lead-capture.js` | Full WhatsApp lead → `manychat_leads` + HubSpot |
| `api/rag-answer.js` | Off-script Q&A via `knowledge_chunks` + OpenAI |
| `api/quote.js` | WhatsApp quote ranges from `quote_ranges` (ManyChat `set_field_values`) |
| `api/dropoff-capture.js` | Drop-off partial lead |
| `lib/` | Supabase, HubSpot, OpenAI, `X-App-Secret` auth |

**Supabase:** migrations `011`–`013` (`manychat_leads`, `unanswered_questions`, `match_knowledge_chunks` RPC). Run `python3 integrations/supabase/apply_migrations.py`.

**Env:** see root `.env.example`. Set the same variables in the Vercel project (do not overwrite existing keys; add any missing names).

**Test:** `scripts/test-manychat-api.sh` (set `BASE_URL` and `MANYCHAT_WEBHOOK_SECRET`).

**Runtime:** Node.js 18+ (not Edge). `vercel.json` sets `maxDuration` for `api/**/*.js`.

**ManyChat quote engine:** see **`MANYCHAT_QUOTE_SETUP.md`** (custom fields, env vars, curl smoke test).
