---
name: weekly-newsletter
description: Weekly Sunday newsletter for Mejor Vida — two-stage AI (research brief, then writing), covering last week’s reputable news on final expense, whole life, term, IUL, or annuities; send by 6am Chicago to julie@ and admin@. Facebook posts go out automatically after the approved blog is live. Use when the user mentions weekly newsletter, Sunday newsletter, insurance news digest, or sending the weekly email.
---

# Weekly newsletter (Sunday 6 a.m. Chicago)

Read and follow, in order:

1. `tools/weekly-newsletter/README.md`
2. `tools/weekly-newsletter/TWO_STAGE_WORKFLOW.md` (**required** — research vs writing)
3. `tools/weekly-newsletter/HOW_TO_ASSEMBLE.md`
4. `tools/weekly-newsletter/CONTENT_PACKAGE.md`
5. `tools/weekly-newsletter/SOURCES.md`
6. `tools/weekly-newsletter/AGENT_RUNBOOK.md`
7. `tools/weekly-newsletter/FACEBOOK_AUTOMATION.md` (after the blog is approved and live)

## Outcome

By **6:00 a.m. Sunday America/Chicago**:

- julie@mejorvidainsurance.com — **Spanish**
- admin@mejorvidainsurance.com — **English**

## Two AI stages (do not merge)

1. **Stage 1 — Research:** harvest ≥8 candidates when possible → score → select 3 → save validated `research-brief-*.json`. Use the strongest available **research/reasoning** model (`WEEKLY_NEWSLETTER_RESEARCH_MODEL`, default `o3`).
2. **Stage 2 — Writing:** separate model call; write only from the validated brief. Use **GPT-5.6** or the strongest long-form writing model (`WEEKLY_NEWSLETTER_WRITE_MODEL`). **Never** mini/fast/economy for Stage 2.

Do not start Stage 2 until the brief passes validation (dates in news period, URLs open, facts present).

## Do this

- News period: prior Sunday through Saturday America/Chicago (`TODAY−7` … `TODAY−1`).
- Reputable sources only (prefer primary: FTC, NFDA, NAIC, LIMRA, `.gov`, major U.S. press).
- Exactly **3** family-facing stories, **same depth** (website features 700–1,000 words; email **175–250 words** each).
- Spanish → julie@; English → admin@. Facebook in Spanish (`facebook-post-rules.md`).
- No Medicare. No invented premiums. No agent-manual paste.
- One phone CTA near the end of the letter — not after every story.
- Do not add filler Julie already rejected: writing-method narration, “a news story does not cancel your policy,” “read every health question slowly,” or “we do not have that person’s file / we will not repeat a rate we did not verify.”
- Run `npm run weekly:newsletter` (or `--force` if the cron missed). Use `--research-only` to stop after Stage 1.

Public blog HTML is a **later** step after Julie authorizes it. Do not skip the email waiting on blog pages. Preserve the research brief for audit and blog creation.

After she authorizes the blog, you write the pages, she supplies images, and the commit is on `main`: **do not wait for her to ask for Facebook.** Sunday / Tuesday 10 a.m. / Thursday 10 a.m. Chicago posts are automatic (`api/weekly-facebook-cron.js`).
