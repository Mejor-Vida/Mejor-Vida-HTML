# Weekly newsletter project — Mejor Vida Insurance

Sunday **6:00 a.m. Chicago** automation: **two-stage AI** (research brief → writing), covering last week’s reputable news on **final expense, whole life, term, IUL, and annuities**, then email:

- `julie@mejorvidainsurance.com` (Spanish)
- `admin@mejorvidainsurance.com` (English)

This folder is the project. Follow it every week. Do not improvise a different format.

| File | Use |
|------|-----|
| [TWO_STAGE_WORKFLOW.md](TWO_STAGE_WORKFLOW.md) | **Required** — Stage 1 research vs Stage 2 writing, models, validation |
| [CONTENT_PACKAGE.md](CONTENT_PACKAGE.md) | Quality spec: website feature, email, Facebook, publishing materials |
| [SOURCES.md](SOURCES.md) | Reputable sites, search queries, and what to reject |
| [AGENT_RUNBOOK.md](AGENT_RUNBOOK.md) | Step-by-step for Cursor / cron (do not skip steps) |
| [FACEBOOK_AUTOMATION.md](FACEBOOK_AUTOMATION.md) | After the live blog + images: Sunday / Tue 10am / Thu 10am Facebook posts |
| [sources.json](sources.json) | Machine-readable feeds, queries, allowlist, evergreen fallbacks |

**Related (do not replace this project):**

- Public blog HTML after Julie picks stories: `tools/newsletter-to-consumer-blog-prompt.md`, `tools/blog-build-rules.md`
- Long English drafts (optional, after the email): `tools/weekly-blog-system-rules.md`
- Topic guard in code: `lib/crm-weekly-topic-guard.js`

## What runs automatically

Vercel cron `GET /api/crm-newsletter-cron` at **`0 11 * * 0` UTC** and **`0 12 * * 0` UTC**.

The in-code window is **Sunday hour 6 only** in America/Chicago:

- `0 11 * * 0` → **6:00 a.m. CDT**
- `0 12 * * 0` → **6:00 a.m. CST** (no-op in summer because Chicago is already 7:00 a.m.)

The job:

1. **Stage 1:** Searches last week’s news (Google News RSS + direct reputable feeds), scores candidates, selects **exactly 3**, saves a validated research brief (`tools/weekly-newsletter/out/research-brief-*.json`). Default research model: `o3` (`WEEKLY_NEWSLETTER_RESEARCH_MODEL`).
2. **Stage 2:** Separate writing call from that brief only (default `gpt-5.6` via `WEEKLY_NEWSLETTER_WRITE_MODEL` — never mini/economy). Spanish + English digest; no invented premiums; no Medicare.
3. Saves `crm_newsletter_issues` (`hero_source: weekly_research`).
4. Emails **julie@** (Spanish) and **admin@** (English) via Resend.

Client blast is **not** automatic from this research job. After Julie reviews the 6 a.m. letter, use Staff → Weekly emails → **Send now** (or set `WEEKLY_NEWSLETTER_SEND_CLIENTS=1` on Vercel if she wants clients included in the same Sunday send).

Facebook is automatic **after** the public digest and three story images are live. See [FACEBOOK_AUTOMATION.md](FACEBOOK_AUTOMATION.md).

## Manual run (local)

```bash
npm run weekly:newsletter -- --research-only
npm run weekly:newsletter -- --dry-run
npm run weekly:newsletter
```

`--force` re-runs even if this Sunday already sent. `--research-only` runs Stage 1 only (brief + validation, no email).

## Never skip a Sunday

If news is slow, use evergreen fallbacks in `sources.json` as **background**, clearly labeled. The inbox must still receive three stories by 6 a.m.
