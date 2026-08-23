# Agent runbook — Sunday weekly newsletter

Execute in order. Do not skip. Do not publish to the live blog unless Julie asks.

## Before you start

1. Read `tools/weekly-newsletter/HOW_TO_ASSEMBLE.md` and `SOURCES.md`.  
2. Calculate Chicago `TODAY`, `START_DATE`, `END_DATE`.  
3. Load `tools/blog-drafts/shared/newsletter_topic_history.json` and `newsletter_url_history.json`.

## Production path (preferred)

The website cron already does research + compose + staff email:

- Schedule: Sunday `0 11 * * 0` and `0 12 * * 0` UTC → **6:00 a.m. Chicago** (CDT / CST)  
- Code: `api/crm-newsletter-cron.js` → `lib/weekly-newsletter-run.js`  
- Auth: `Authorization: Bearer $CRON_SECRET`

If today is Sunday and the letter is missing from julie@ / admin@ after 6:15 a.m. Chicago:

```bash
npm run weekly:newsletter -- --force
```

## Cursor path (when writing long drafts or the cron failed)

1. Research 8–12 candidates from last week (WebSearch / RSS).  
2. Filter with the topic guard and SOURCES reject list.  
3. Pick 3. Give each story the **same length**. Follow `tools/weekly-newsletter/CONTENT_PACKAGE.md`.  
4. Write the Spanish/English email at 200–300 words **per story**.  
5. Save the full package to `tools/blog-drafts/content-package-YYYY-MM-DD.md`.  
6. Send with `npm run weekly:newsletter`.

## After Julie chooses website stories

Follow `tools/newsletter-to-consumer-blog-prompt.md` and `.cursor/rules/newsletter-consumer-blog.mdc`.

- Digest page = condensed  
- Full article = 600–900 words  
- Spanish indexed; English `noindex`  
- Do not list licensed states except on `licencias.html` / `en/licenses.html`
- She supplies the three images; optimize before publish
- After the digest and images are **live on main**, Facebook is automatic (Sunday + Tuesday 10 a.m. + Thursday 10 a.m. Chicago). See `FACEBOOK_AUTOMATION.md`. Do not wait for a separate Facebook prompt.

## Secrets

Never print `.env.local`. Need `OPENAI_API_KEY`, `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (Vercel). Facebook autopost also needs `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN` (already on Vercel).
