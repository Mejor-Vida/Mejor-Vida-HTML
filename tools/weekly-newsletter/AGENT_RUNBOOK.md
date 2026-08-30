# Agent runbook — Sunday weekly newsletter

Execute in order. Do not skip. Do not publish to the live blog unless Julie asks.

## Before you start

1. Read `tools/weekly-newsletter/TWO_STAGE_WORKFLOW.md`, `HOW_TO_ASSEMBLE.md`, and `SOURCES.md`.  
2. Calculate Chicago `TODAY`, `START_DATE`, `END_DATE` (publication Sunday; news = prior Sunday–Saturday).  
3. Load `tools/blog-drafts/shared/newsletter_topic_history.json` and `newsletter_url_history.json`.

## Production path (preferred)

The website cron already runs **Stage 1 → Stage 2 → staff email**:

- Schedule: Sunday `0 11 * * 0` and `0 12 * * 0` UTC → **6:00 a.m. Chicago** (CDT / CST)  
- Code: `api/crm-newsletter-cron.js` → `lib/weekly-newsletter-run.js`  
- Auth: `Authorization: Bearer $CRON_SECRET`  
- Models: `WEEKLY_NEWSLETTER_RESEARCH_MODEL` (default `o3`), `WEEKLY_NEWSLETTER_WRITE_MODEL` (default `gpt-5.6`)

If today is Sunday and the letter is missing from julie@ / admin@ after 6:15 a.m. Chicago:

```bash
npm run weekly:newsletter -- --force
```

## Cursor path (when writing long drafts or the cron failed)

1. **Stage 1 only (optional check):** `npm run weekly:newsletter -- --research-only`  
   - Harvest ≥8 candidates when possible; score; select 3; save `tools/weekly-newsletter/out/research-brief-*.json`.  
2. Confirm the brief: dates in window, URLs open, 5–10 facts per story, no unsupported premiums.  
3. **Stage 2:** full run writes from that brief (or continue without `--research-only`). Email stories **175–250 words** each language; one phone CTA in the close. Follow `CONTENT_PACKAGE.md`.  
4. Optionally save a content package to `tools/blog-drafts/content-package-YYYY-MM-DD.md` for later blog work.  
5. Send with `npm run weekly:newsletter` if not already sent.

Do **not** ask the writing model to re-search the news. Keep the research brief for audit and blog creation.

## After Julie chooses website stories

Follow `tools/newsletter-to-consumer-blog-prompt.md` and `.cursor/rules/newsletter-consumer-blog.mdc`.

- Digest page = condensed  
- Full article = 600–900 words  
- Spanish indexed; English `noindex`  
- Do not list licensed states except on `licencias.html` / `en/licenses.html`
- She supplies the three images; optimize before publish
- After the digest and images are **live on main**, Facebook is automatic (Sunday + Tuesday 10 a.m. + Thursday 10 a.m. Chicago). See `FACEBOOK_AUTOMATION.md`. Do not wait for a separate Facebook prompt.

## Secrets

Never print `.env.local`. Need `OPENAI_API_KEY`, `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (Vercel). Optional model overrides: `WEEKLY_NEWSLETTER_RESEARCH_MODEL`, `WEEKLY_NEWSLETTER_WRITE_MODEL`. Facebook autopost also needs `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN` (already on Vercel).
