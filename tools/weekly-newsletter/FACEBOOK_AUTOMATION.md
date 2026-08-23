# Facebook posts after the weekly blog

This is automatic. Julie does **not** need to ask for the Tuesday or Thursday posts.

## What stays human

1. Sunday **6:00 a.m. Chicago** — newsletter email to julie@ (Spanish) and admin@ (English). Automatic.
2. Julie reviews the letter and **authorizes** the public blog.
3. Cursor writes the weekly digest + three articles (ES + EN).
4. Julie provides the three story images. Cursor optimizes them and they go live with the commit/push.

## What runs without another prompt

When the Spanish digest is **live** on https://www.mejorvidainsurance.com **and** `story-1.png`, `story-2.png`, and `story-3.png` return HTTP 200:

| Slot | When (America/Chicago) |
|------|-------------------------|
| 1 | Sunday, as soon as the live blog + images exist |
| 2 | Tuesday **10:00 a.m.** |
| 3 | Thursday **10:00 a.m.** |

If Julie publishes later in the week, remaining slots whose clock time already passed go out immediately. The first comment (blog link, no URL in the caption) is posted about **10 minutes** after each main post.

Format matches prior weekly posts (`facebook-post-rules.md`, example `FB/post-package-weekly-2026-08-02-life.json`): Spanish, hook + value + trust + INFO/REVISAR, hashtags, link only in the first comment.

## How it is scheduled

Vercel cron `GET /api/weekly-facebook-cron` every **15 minutes** (`*/15 * * * *`). Auth: `Authorization: Bearer $CRON_SECRET`.

The job:

1. Reads the latest `weekly-insurance-update-YYYY-MM-DD` URL from the live sitemap.
2. Confirms the three optimized story images are live.
3. Writes three captions (OpenAI) and stores them in Supabase `weekly_facebook_queue`.
4. Publishes any row whose `publish_at` has arrived (Graph `/photos` + later `/comments`).

GitHub push of the blog/images is enough: Vercel deploys the site, then the next 15-minute cron sees the live pages.

## Manual

```bash
npm run weekly:facebook -- --dry-run
npm run weekly:facebook
```

Dry-run does not post. A real run will post **slot 1 immediately** if this week’s digest and images are already live.

## Stop switch

Vercel env `WEEKLY_FACEBOOK_AUTOPOST=0` skips the job.

Needs `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.
