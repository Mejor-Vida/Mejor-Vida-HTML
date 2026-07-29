# Mejor Vida Insurance — Weekly Blog Post System Rules

**Source of truth** for researching and drafting the weekly consumer blog posts. Adapted from Abacus *Mejor_Vida_Blog_System_Rules.docx* (effective July 19, 2026) and updated for Julie’s SEO and licensing goals.

**Audience of this document:** Cursor AI / automation agents.  
**Audience of the posts:** Spanish-speaking families and future clients who need clear information about **final expense**, **term life**, and **whole life** only (drafts in **English**; Spanish when publishing).

**Hard focus (Julie — locked):**
- **Consumer only** — never write for agents, IMOs, BGAs, underwriters, or producers.
- **Spanish SEO first** — index Spanish pages; English is compliance/`noindex`.
- **Products only:** final expense → term life → whole life. Nothing else as a weekly focus (no Medigap/Medicare sales, IUL/VUL, LTC reinsurance, industry M&A, GAO/NAIC trade news, agent tools).
- Do **not** publish a weekly digest to the index unless ≥2 of 3 stories clearly serve FE / term / whole for families.

**Cadence:** Every Sunday (manual run in Cursor). Always deliver **exactly 3** complete drafts. Never skip a week — use evergreen topics if news is slow.

**Sunday client email:** Must use life insurance / final expense stories only (same product scope as drafts). Do not import Medicare/Medigap FB packages. Guard: `lib/crm-weekly-topic-guard.js`. Keep `lib/crm-weekly-blog-digest-email.js` and `FB/post-package.json` pointed at the current on-topic week.

When rules conflict with ad-hoc chat instructions, **this document wins** unless Julie updates it.

After Julie picks an article to publish on the site, follow `tools/newsletter-to-consumer-blog-prompt.md`, `.cursor/rules/newsletter-consumer-blog.mdc`, and `tools/blog-build-rules.md` for HTML wiring (digest + full article, ES/EN, sitemap).

---

## 1. Business context

| Field | Value |
|---|---|
| Company | Mejor Vida Insurance |
| Owner | Julie |
| Phone | 1-402-440-5438 |
| Website | mejorvidainsurance.com |
| Licensed now (priority) | Nebraska, Kansas, Colorado, Nevada (telephonic sales) |
| Expansion | Other U.S. states welcome in content; Julie will get licensed if a client from another state wants help |
| Target audience | Spanish-speaking **families / consumers** (not producers) who need life / final expense protection |
| Products sold | **Final expense** (main), **term life**, **whole life** only for blog SEO focus |
| Products NOT sold / NOT for blog focus | IUL, VUL, variable life, investment-linked products, **Medicare / Medigap** sales, LTC as a product line, auto/home, industry trade topics |
| Approved carriers (blog Category 4) | Assurity, Mutual of Omaha, American Amicable, Corebridge, Transamerica, Aetna |
| Primary site language | **Spanish** (English for compliance / language toggle only) |
| Primary SEO goal | Drive Spanish traffic: **(1) final expense** → **(2) term life** → **(3) whole life** — that is it |
| Primary SEO targets (EN drafts) | final expense insurance, funeral / burial insurance, term life insurance, whole life insurance |
| Primary SEO targets (ES publish) | seguro de gastos finales / gastos funerarios, seguro de vida a término, seguro de vida entera |
| Blog draft language | English only |
| Indexing | Spanish `index, follow` + sitemap; English `noindex, follow`; never index producer/off-topic weeks |

**Mutual of Omaha note:** Mutual of Omaha (the carrier) is approved. **Mutual of Omaha Direct** (call-center / TV advertiser) is a competitor — never mention it.

---

## 2. Date range (Step 1)

Recalculate every run:

| Name | Value |
|---|---|
| `TODAY` | Current date when the task runs |
| `START_DATE` | `TODAY` − 7 days |
| `END_DATE` | `TODAY` − 1 day |

**Strict 7-day window** for *news* stories: only use news published between `START_DATE` and `END_DATE` (inclusive). Do not use news older than `START_DATE`. Do not use news published on `TODAY`. Evergreen fallbacks are exempt from the news window.

---

## 3. Research (Step 2)

Find **8–12** story candidates. Prefer topics that support SEO in this order: **final expense → term life → whole life**.

Every candidate must fit one approved category below. Apply the **Story Fit Test** (Section 4) and **Hard limits** (Section 5) before selection.

**Do not reject a story because of which website published it.** Industry trade press, carrier blogs, newspapers, DOI sites, and national outlets are all fine **if** the topic helps clients and can be rewritten in plain consumer language. Prefer primary facts you can verify; rewrite for families — never paste agent-only framing.

**Do not reject a story because of which U.S. state it is about.** Licensed states (NE, KS, CO, NV) are **priority** when ranking candidates, not a hard filter. Other states are allowed and useful for expansion and out-of-state callers.

### Category 1 — Final expense & funeral costs (**primary SEO**)

Focus: burial / funeral / final expense protection and costs — **not Medicare as a product**.

**Keep / prefer:**
- Funeral and burial cost data (e.g. NFDA) and what families actually pay
- Cremation vs burial cost trends that affect how much coverage people need
- Final expense / burial insurance consumer news (rates, product availability, waiting periods explained for shoppers)
- Social Security lump-sum death payment ($255) — what it covers and why it is not enough (bridge to final expense)
- Prepaid funeral contracts vs final expense insurance (consumer comparison)
- FTC Funeral Rule / consumer rights when shopping funeral homes (when it helps families plan coverage)
- Regional or national funeral cost stories (any U.S. state; prioritize NE/KS/CO/NV when quality is equal)

**Do not use as a primary article topic:**
- Medicare enrollment periods or “how to enroll in Medicare”
- Medicare Advantage / Medigap / Part D plan shopping or sales angles
- “Does Medicare cover funerals?” as a standalone evergreen (already on the site — see Section 6.1)

Brief factual lines like “Medicare does not pay for funerals” are fine **inside** a final-expense article. Do not build weekly drafts around Medicare.

### Category 2 — Term life insurance (**secondary SEO**)

- When families need income replacement (term life) vs funeral-only coverage
- Term length, conversion options, and what happens when a term ends — plain English
- Consumer-facing rate or product changes for term life from approved carriers or general market news rewritten for shoppers
- Term life myths that confuse Spanish-speaking families (without attacking competitors by name)

### Category 3 — Whole life insurance (**tertiary SEO**)

- How small whole life / permanent policies differ from term for families
- Cash value explained simply (no investment pitches, no IUL/VUL)
- Whole life used for funeral + leftover legacy — consumer education
- Consumer-facing whole life product or rate news from approved carriers or general sources rewritten for shoppers

### Category 4 — Carrier product news (sellable carriers only; **consumer**, not producer)

**Only** these carriers: Assurity, Mutual of Omaha, American Amicable, Corebridge, Transamerica, Aetna.

**Purpose:** News Julie can actually sell from, written so a shopper understands what changed for **them** — not for agents.

**Allowed:** new simplified-issue / guaranteed-acceptance / final expense / term / whole life products; rate changes that affect what consumers pay; eligibility or benefit features shoppers would notice.

**Not the focus (skip or heavily rewrite only if there is a clear consumer angle):** agent commissions, IMO contests, underwriting manuals for producers, back-office ops with no shopper impact.

### Category 5 — Consumer protection, scams & alerts (any U.S. state)

- Final expense / life insurance scams targeting seniors or immigrant families
- State insurance department (DOI) consumer alerts and warnings (**any state**; prioritize NE/KS/CO/NV when equal)
- FTC alerts related to life insurance or funeral financing
- Identity theft or fake-agent schemes tied to life / final expense shopping

Medicare fraud as a **standalone** topic is low priority (Julie does not sell Medicare). Prefer scams tied to final expense, term, or whole life.

---

## 4. Story Fit Test (replaces the old Consumer Filter Test)

This is a **soft ranking guide**, not a state gate. Ask all three:

1. **Client value:** Would a current or **future** Mejor Vida client want to read this? Does it give useful information for protecting their family?
2. **SEO value:** Can the draft naturally support **final expense**, **term life**, or **whole life** (in that priority order)?
3. **Honesty:** Can we explain it in plain language without fake urgency, price quotes, or products Julie does not sell?

- If **yes to 1 and 2** (and 3) → advance  
- If it fails SEO but is a strong scam/protection alert → still allowed under Category 5  
- If it is only useful to agents/producers and cannot be rewritten for families → drop  
- **Never drop solely because the story is outside NE / KS / CO / NV**  
- **Never drop solely because of the publisher / source domain**

---

## 5. Hard limits (what we still will not do)

These are writing and product limits — **not** “reject this publisher” rules.

### 5.1 Do not promote or center these products

IUL, VUL, variable life, investment-linked / market-linked products, Medicare plan sales, auto, home, or property insurance as the main story.

### 5.2 Do not name competitors in drafts

Do not mention or promote captive carriers, DTC brands, call-center/TV advertisers, or comparison sites by name (full list kept for writers):

**Captive:** New York Life, State Farm, Northwestern Mutual, MassMutual, Guardian Life, Penn Mutual, Modern Woodmen, Thrivent, Country Financial, Farm Bureau, Ohio National, Knights of Columbus, Woodmen of the World, Royal Neighbors, Catholic Order of Foresters.

**DTC:** Ethos, Ladder, Haven Life, Bestow, Fabric, Sproutt, Lemonade Life.

**Call centers / TV:** SelectQuote, Colonial Penn, Mutual of Omaha Direct, Choice Mutual.

**Comparison sites:** PolicyGenius.

If a useful story comes from or mentions those brands, **keep the consumer lesson**, strip brand promotion, and do not name them.

### 5.3 USA only

No international insurance news as the main story.

### 5.4 Carrier product news (Category 4) only for approved carriers

For Category 4, stick to Assurity, Mutual of Omaha, American Amicable, Corebridge, Transamerica, Aetna. General education in Categories 1–3 may discuss product *types* without naming non-approved carriers.

---

## 6. Story selection (Step 3)

From remaining candidates, pick **3** best stories, in order:

1. Pass Story Fit Test  
2. Strongest SEO fit: **final expense first**, then term life, then whole life  
3. Prefer licensed-state angle when two stories are otherwise equal  
4. Verifiable facts (working URL for news; evergreen may cite established public data)  
5. Spread categories when possible (avoid three near-identical FE explainers)

### 6.1 Topics already on the website — do **not** use as evergreen fallbacks

Before picking evergreen, check live guides and avoid duplicating them:

| Already covered | URL (Spanish) |
|---|---|
| What is final expense insurance | `blog/que-es-seguro-gastos-finales.html` |
| How much final expense costs | `blog/cuanto-cuesta-seguro-gastos-finales.html` |
| Types of final expense plans | `blog/tipos-planes-seguro-gastos-finales.html` |
| Does Medicare pay final expenses | `blog/medicare-paga-gastos-finales.html` |

Also avoid evergreen that merely retells those pages (e.g. “how final expense works,” “Medicare and funerals,” “compare FE plan types”). Maintain the running list in `tools/blog-drafts/shared/covered-evergreen-topics.md` when new guides publish.

### 6.2 Approved evergreen fallbacks (gaps — prefer these)

Use only when news is thin. Still apply writing rules, quality checklist, and duplicate prevention. Aim at SEO gaps Julie has **not** already covered:

**Final expense (prefer first):**
- Final expense vs prepaid funeral contracts — which protects the family better?
- How much final expense coverage to buy (coverage amount, not price quotes)
- What a graded / waiting-period benefit means if you pass away early
- Naming beneficiaries on a final expense policy (common mistakes)
- What happens if you miss a final expense premium payment
- Final expense vs term life when the only goal is funeral costs
- Cremation-only planning: how coverage needs differ from a full burial

**Term life:**
- What happens when a term life policy ends — options families have
- Term life for income replacement while kids are at home (vs funeral-only policies)
- Convertible term life in plain English — why it matters later

**Whole life:**
- Whole life vs final expense — overlap and differences for shoppers
- Cash value on a small whole life policy — what it is and is not
- Using whole life for funeral costs plus a small legacy

Do **not** fall back to: “what is final expense,” “Medicare and funerals,” “Social Security $255 101” if it duplicates the Medicare/FE guides, or generic “how to spot a scam” unless there is a fresh angle not already used in recent drafts.

**Always deliver 3 articles. Always run every Sunday — never skip.**

---

## 7. Duplicate prevention

Before finalizing selection:

| Rule | Window | File |
|---|---|---|
| Topic repeat | 28 days (4 weeks) | `tools/blog-drafts/shared/newsletter_topic_history.json` |
| URL repeat | 84 days (12 weeks) | `tools/blog-drafts/shared/newsletter_url_history.json` |
| Evergreen site overlap | ongoing | `tools/blog-drafts/shared/covered-evergreen-topics.md` |

After a successful run, append new topics and source URLs; prune entries older than their windows.

---

## 8. Writing rules (Step 4)

Write **one complete blog post per selected story**.

### Word count

**600–900 words** each. Count before delivery; rewrite if outside range.

### Headline

Clear, simple (≈6th-grade readable). Prefer SEO keywords in this order when they fit: **final expense** → **term life** → **whole life**. Funeral/burial insurance wording is fine as a final-expense synonym. Do not chase Medicare keywords.

### Exact structure (every post)

1. **INTRODUCTION** (2–3 paragraphs) — relatable family situation; state the problem; why it matters  
2. **MAIN BODY** (4–6 paragraphs) — who/what/when/where/why; concrete numbers; one real-world example (e.g. Maria, 62, needs enough final expense coverage for a $10,000–$15,000 funeral)  
3. **WHAT THIS MEANS FOR YOU** (2 paragraphs) — practical takeaway + action to consider  
4. **CALL TO ACTION** (1 paragraph) — invite a free consultation at **1-402-440-5438**; no specific prices or product guarantees; warm, not pushy  
5. **SOURCE CREDIT** (required — anti-hallucination) — for news:  
   `Source: [Article Title] | [Website Name] | [URL] | Published: [Date]`  
   For evergreen: cite **primary authorities** with working URLs (NFDA, FTC, III, BLS, SSA, state DOI, major newsrooms). Never cite unknown blogs or commercial vendor blogs as authority. Never deliver a draft whose only citation is Mejor Vida. If a fact cannot be verified with a reputable link, remove it. On publish, the full-article page must show a **Fuentes / Sources** box with those live links.

### Style

- Reading level: 8th grade or below (aim 6th–7th)  
- Spell out acronyms on first use  
- Max **15–20 words** per sentence; max **3–4 sentences** per paragraph  
- Conversational “you” / “your family”; define insurance terms on first use  
- English only for drafts  

### Do not write

Competitor names; IUL/VUL/variable/investment-linked; Medicare sales content; price quotes or product guarantees; aggressive sales language; content aimed at insurance professionals.

---

## 9. Delivery in Cursor (Steps 5–6, adapted from Abacus email)

Abacus emailed HTML to `admin@mejorvidainsurance.com` and `Julie@mejorvidainsurance.com`. In this repo, on Sunday runs:

1. Save drafts to:  
   `tools/blog-drafts/blog_draft_YYYY-MM-DD.html`  
   (all 3 articles in one HTML file)
2. Present the same content in chat for Julie to review and pick a favorite (for website, Facebook, and client email).
3. Append a log entry to:  
   `tools/blog-drafts/blog_draft_log.txt`  
   (run date, date range, headlines, source URLs, word counts, whether delivered in chat / email if sent)
4. Update history JSON files (topic + URL).

**Optional email** (if Julie asks and mail tooling is available):

- Subject: `Blog Post Drafts — Week of [START_DATE] | Mejor Vida Insurance`  
- Top note: *Here are your 3 blog post drafts for the week of [START_DATE] to [END_DATE]. Review them and choose your favorite to post on your website. You can also use it to create your Facebook post and your client email.*  
- Labels: `ARTICLE 1 OF 3`, `ARTICLE 2 OF 3`, `ARTICLE 3 OF 3`  
- Footer: `Generated by Mejor Vida Insurance Blog System | mejorvidainsurance.com | Sunday Cursor run`  
- Recipients: both addresses above  

Do **not** publish to the live site until Julie chooses an article and asks to publish.

---

## 10. Quality checklist (all must pass)

- [ ] Passes Story Fit Test (client value + SEO where applicable)  
- [ ] Approved content category  
- [ ] Not a duplicate of existing site guides (Section 6.1)  
- [ ] No competitor names; no prohibited product push  
- [ ] Headline supports final expense / term / whole life when possible  
- [ ] Word count 600–900  
- [ ] All 5 sections present  
- [ ] Source URL real and working (or evergreen sources cited)  
- [ ] Answers who, what, when, where, why (for news)  
- [ ] At least one concrete real-world example with numbers  
- [ ] Zero unexplained acronyms  
- [ ] Sentences ≤20 words; paragraphs ≤4 sentences  
- [ ] Reading level ≤8th grade  
- [ ] CTA includes `1-402-440-5438`  
- [ ] No specific price quotes or product guarantees  

---

## 11. End-to-end Sunday workflow (Cursor)

Execute in order. Do not reorder. Do not skip.

1. Calculate `TODAY`, `START_DATE`, `END_DATE`  
2. Load topic + URL history + covered evergreen list  
3. Research 8–12 candidates in Categories 1–5 (SEO order: FE → term → whole)  
4. Apply Story Fit Test + hard limits (no state/source bans)  
5. Deduplicate vs history + site guides  
6. Select 3 (evergreen from Section 6.2 only if needed)  
7. Write 3 posts (600–900 words, exact structure)  
8. Run Quality Checklist; fix failures  
9. Save `tools/blog-drafts/blog_draft_YYYY-MM-DD.html`  
10. Deliver in chat (email optional)  
11. Log the run  
12. Update history JSON; prune expired entries  

After Julie picks stories → publish via `tools/blog-build-rules.md` + consumer-blog rules:

- Weekly digest = **condensed** (150–250 words per story).
- Each full-article page = **full emailed draft depth (~600–900 words)**, not a short rewrite.
- Bilingual ES/EN pages; **index Spanish only** in `sitemap.xml`; English `noindex, follow`.
- FAQ + pillar internal links on full articles; strip prior-week schema/hreflang/preload leftovers.

---

## 12. Document control

| Field | Value |
|---|---|
| Title | Mejor Vida Insurance — Weekly Blog Post System Rules |
| Effective | July 19, 2026 (research rules revised same day) |
| Owner | Julie, Mejor Vida Insurance |
| Upstream | Abacus `Mejor_Vida_Blog_System_Rules.docx` + Julie SEO/licensing updates |
| Repo paths | Drafts under `tools/blog-drafts/`; history under `tools/blog-drafts/shared/` |

End of reference. When in doubt: help clients, support **final expense → term → whole life** SEO, do not duplicate existing guides, deliver three checklist-passing English drafts.
