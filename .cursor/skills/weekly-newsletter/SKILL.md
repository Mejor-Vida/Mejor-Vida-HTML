---
name: weekly-newsletter
description: Weekly Sunday newsletter for Mejor Vida — search last week’s reputable news on final expense, whole life, term, IUL, or annuities, assemble the letter, and send it by 6am Chicago to julie@ and admin@. Facebook posts go out automatically after the approved blog is live. Use when the user mentions weekly newsletter, Sunday newsletter, insurance news digest, or sending the weekly email.
---

# Weekly newsletter (Sunday 6 a.m. Chicago)

Read and follow, in order:

1. `tools/weekly-newsletter/README.md`
2. `tools/weekly-newsletter/HOW_TO_ASSEMBLE.md`
3. `tools/weekly-newsletter/CONTENT_PACKAGE.md`
4. `tools/weekly-newsletter/SOURCES.md`
5. `tools/weekly-newsletter/AGENT_RUNBOOK.md`
6. `tools/weekly-newsletter/FACEBOOK_AUTOMATION.md` (after the blog is approved and live)

## Outcome

By **6:00 a.m. Sunday America/Chicago**:

- julie@mejorvidainsurance.com — **Spanish**
- admin@mejorvidainsurance.com — **English**

## Do this

- Search last week only (`TODAY−7` through `TODAY−1`).
- Reputable sources only (FTC, NFDA, III, LIMRA, SSA, BLS, NAIC, `.gov`, major U.S. press).
- Exactly **3** family-facing stories, **same length** (website 700–1,000 words each; email 200–300 words each).
- Spanish → julie@; English → admin@. Facebook in Spanish (`facebook-post-rules.md`).
- No Medicare. No invented premiums. No agent-manual paste.
- Do not add filler Julie already rejected: writing-method narration, “a news story does not cancel your policy,” “read every health question slowly,” or “we do not have that person’s file / we will not repeat a rate we did not verify.”
- Run `npm run weekly:newsletter` (or `--force` if the cron missed).

Public blog HTML is a **later** step after Julie authorizes it. Do not skip the email waiting on blog pages.

After she authorizes the blog, you write the pages, she supplies images, and the commit is on `main`: **do not wait for her to ask for Facebook.** Sunday / Tuesday 10 a.m. / Thursday 10 a.m. Chicago posts are automatic (`api/weekly-facebook-cron.js`).
