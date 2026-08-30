# How to put the weekly newsletter together

Audience of the **email:** Spanish-speaking families (same voice as the client letter).  
Recipients of the **6 a.m. Sunday send:**

- `julie@mejorvidainsurance.com` — **Spanish**
- `admin@mejorvidainsurance.com` — **English**

Write for families. Never write for agents, IMOs, BGAs, or underwriters.

## 1. Date window (every run)

| Name | Value |
|------|--------|
| `TODAY` / publication date | Sunday run date in America/Chicago |
| `START_DATE` | `TODAY` minus 7 days (prior Sunday) |
| `END_DATE` | `TODAY` minus 1 day (Saturday) |

Example: published Sunday **2026-08-30** covers **2026-08-23 through 2026-08-29**.

The actual event must fall in that window. Do not use today’s articles as “this week’s news.” Older reports may appear only as **background**, with real dates recorded. Evergreen fallbacks are exempt from the freshness window but must not be labeled as breaking news.

## 1b. Two AI stages (locked)

1. **Research brief** (`lib/weekly-newsletter-research-brief.js`) — separate reasoning-model call; validate before writing.  
2. **Newsletter writing** (`lib/weekly-newsletter-compose.js`) — separate writing-model call from the brief only.  

See [TWO_STAGE_WORKFLOW.md](TWO_STAGE_WORKFLOW.md).
## 2. Topics (locked)

Search and keep only:

1. **Final expense** / burial / funeral funding  
2. **Whole life**  
3. **Term life**  
4. **IUL** (indexed universal life) — consumer explanation only, no illustrations or illustrated rates  
5. **Annuities** — consumer explanation only, no yield promises  

**Block:** Medicare, Medigap, Medicare Advantage, Part D, Medicaid-as-health-plan shopping, auto/home, agent commissions, IMO contests, underwriting manuals.

Julie sells IUL and annuities (including Americo). The **public SEO blog** still prefers final expense → term → whole life. The **Sunday email** may include IUL or annuity news when it helps families. Do not turn those stories into investment pitches.

## 3. Find at least 8 candidates

Use [SOURCES.md](SOURCES.md). Prefer `.gov`, NAIC, FTC, NFDA, III, LIMRA, Life Happens, SSA, BLS, ACLI, and major U.S. newsrooms. Industry trade press is allowed **only** if you rewrite it into plain family language.

For each candidate record:

- Proposed topic / headline  
- Actual event date  
- Source publication date  
- Publisher  
- URL (working)  
- Summary of what happened  
- Why a family looking at life insurance would care  
- Verified facts / figures  
- Limitations  
- Primary vs secondary source  
- Category (FE / term / whole / IUL / annuity / consumer protection)

Drop:

- Duplicates vs last 28 days of topics / 84 days of URLs (`tools/blog-drafts/shared/`)  
- Competitor sales pages (Ethos, PolicyGenius, Colonial Penn, Mutual of Omaha Direct, etc.) — keep the **lesson**, strip the brand; never cite them as the factual source  
- Unverified market-size forecasts, “best company” lists, promotional vendor reports  
- Agent-only tools, ChatGPT-for-producers, M&A, reinsurance  
- Health insurance / P&C / unrelated finance  

## 4. Pick exactly 3 stories (Stage 1)

Score each candidate 1–5 for freshness, source authority, consumer relevance, life-insurance connection, educational value, and difference from the other picks. Select the three strongest with a useful mix when possible (e.g. cost/planning; regulatory/industry; coverage/ownership). Do not pick three that teach the same lesson.

If fewer than 3 news stories survive, fill from evergreen in `sources.json` as **background**. **Always three. Never skip the week.**

Save the validated research brief before Stage 2 writing.
## 5. Assemble the weekly package (not three thin teasers)

Follow [CONTENT_PACKAGE.md](CONTENT_PACKAGE.md). All **three** stories get the same depth.

| Piece | What to write |
|------|----------------|
| **Website (each story)** | Original **700–1,000 words**. Headlines, subtitle, what/why/who, terms, “what this could mean,” “what you can do now,” takeaway, soft CTA. |
| **Email (6 a.m.)** | Subject + preview + warm intro (~60–100 words) + **175–250 words per story** (equal depth) + one closing lesson with a **single** soft contact line (402-440-5438). **Do not paste the full features. Do not put a sales pitch after every story.** Spanish → julie@; English → admin@. |
| **Facebook** | Version A (~100–175 words, no link in caption) + Version B (~200–300 words), covering all three fairly. See `facebook-post-rules.md`. |
| **Publishing** | Slug, SEO title, meta, keywords, image concept, sources, disclaimer — **for each story**. |

**Do not invent:** premiums, interest rates, illustration values, “best company,” or product guarantees.

**Do not link** a “read the full story” button to a weekly blog URL unless that page is already live.

Agency vs Julie: body copy uses **Mejor Vida Insurance / Seguros**. Julie is fine in the signature and the existing schedule button.

## 6. Quality gate (all must pass)

- [ ] No research-narration (“we do not have that file,” “we will not repeat a rate we did not verify”)  
- [ ] Each story explains the idea in kitchen-table language **before** using an official name (GINA, FTC, annuity, etc.)  
- [ ] Three stories, **same length** (email 200–300 words each; website 700–1,000 each)  
- [ ] Each story has a real source URL (or evergreen primary URL)  
- [ ] No invented prices  
- [ ] No competitor brand promotion  
- [ ] Spanish, 8th grade or below, short sentences  
- [ ] CTA includes 402-440-5438  
- [ ] Topic guard would accept the subject + body (`lib/crm-weekly-topic-guard.js`)

## 7. Send by 6:00 a.m. Sunday (Chicago)

**Automatic:** Vercel `/api/crm-newsletter-cron` (see README).

**Manual:**

```bash
npm run weekly:newsletter
```

Must land in **both** inboxes:

- julie@mejorvidainsurance.com  
- admin@mejorvidainsurance.com  

If Resend or OpenAI fails, fix and resend with `--force` the same morning. Do not wait until Monday.

## 8. After the email (same day, not required for 6 a.m.)

1. Save the content package (feature + email + Facebook + sources) under `tools/blog-drafts/` and a run log under `tools/weekly-newsletter/out/`.  
2. Publish the three features + weekly digest only after Julie asks (`tools/newsletter-to-consumer-blog-prompt.md`, ES/EN). She provides the images.  
3. Client list send: Staff portal **Weekly emails → Send now** after she is happy with the letter.  
4. Facebook: after the live digest + images exist, **do not wait for another prompt**. Sunday / Tuesday 10 a.m. / Thursday 10 a.m. Chicago are automatic (`FACEBOOK_AUTOMATION.md`).
