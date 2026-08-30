# Two-stage weekly newsletter workflow

The Sunday newsletter uses **two separate AI calls**. Stage 2 must not start until Stage 1 has produced and validated a structured research brief.

| Stage | Purpose | Default model (override with env) |
|-------|---------|-----------------------------------|
| **1 — Research** | Harvest candidates, score, select 3, write research brief, validate URLs/dates/facts | `WEEKLY_NEWSLETTER_RESEARCH_MODEL` → default **`o3`** (strongest available reasoning model) |
| **2 — Writing** | Write bilingual newsletter from the validated brief only | `WEEKLY_NEWSLETTER_WRITE_MODEL` → default **`gpt-5.6`** |

**Never** use a mini / nano / fast / economy model for Stage 2.

Code entry points:

- Orchestration: `lib/weekly-newsletter-run.js`
- Stage 1: `lib/weekly-newsletter-research.js` (RSS harvest) + `lib/weekly-newsletter-research-brief.js`
- Stage 2: `lib/weekly-newsletter-compose.js`
- Models helper: `lib/weekly-newsletter-models.js`

## News period (America/Chicago)

| Field | Value |
|-------|--------|
| Publication date | Sunday send date (`window.today` / `weekKey`) |
| News-period start | Publication date − 7 days (prior Sunday) |
| News-period end | Publication date − 1 day (Saturday) |

Example: published **Sunday 2026-08-30** covers **2026-08-23 through 2026-08-29**.

The underlying event must fall in that range (evergreen may fill thin weeks only as **background**, not as “this week’s news”).

## Stage 1 outputs

Saved under `tools/weekly-newsletter/out/`:

- `research-brief-YYYY-MM-DD.json`
- `current-research-brief.json`

Each selected story includes working headline, event/publication dates, primary (+ confirming) sources, 5–10 verified facts, context, why it matters, takeaway, terms to explain, limitations, claims not to make, internal links, image concept.

Validation before Stage 2:

- Exactly 3 selected stories  
- Prefer ≥8 candidates reviewed when harvest supplies that many  
- Primary URLs open successfully  
- Non-evergreen dates inside the news period  
- No unsupported guarantee language  

If a selected story fails, Stage 1 replaces it with the next-highest eligible candidate and re-validates.

`--research-only` stops after Stage 1 (no Stage 2 write, no email).

## Stage 2 outputs

Writes from the brief only (no new news search). Email stories are about **175–250 words** each language. One phone CTA in the closing lesson only. Formal educational disclaimer stays in the email template footer.

Issue preview still at `tools/weekly-newsletter/out/issue-YYYY-MM-DD.json` and `current-issue.json` (includes `research_brief_path`).

## Manual commands

```bash
npm run weekly:newsletter -- --research-only   # Stage 1 only
npm run weekly:newsletter -- --dry-run         # Stage 1 + Stage 2, no send
npm run weekly:newsletter -- --force           # Full run even if already sent
```
