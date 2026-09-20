# Newsletter → consumer weekly blog (prompt + build rules)

Use this when converting Julie’s **insurance newsletter / industry briefing** into the **public weekly blog** on mejorvidainsurance.com.

This is **not** an agent newsletter republish. The site audience is **families**, not producers.

---

## Audience

Write for:

- Hispanic families in the United States
- Seniors
- Adult children helping their parents
- People who know very little about insurance

Do **NOT** write for:

- Insurance agents
- Underwriters
- IMOs / BGAs
- Industry professionals

Assume an **8th–10th grade** reading level.

These pages **teach**. A reader should understand every term without already knowing insurance.

---

## Teaching language (required)

The digest, each full article, and the Sunday newsletter are **teaching pieces for families**, not trade notes. When you introduce a new word, abbreviation, or company-name fragment, **define it in the same paragraph** in kitchen-table language. Do not assume the reader knows the field.

**On first use:**

1. Say what the thing **is** in everyday words.
2. Then you may use the official name.
3. **Do not use an abbreviation or a clipped name until you have spelled out the full words.** Examples: write **Southern Atlantic Reinsurance** and explain that reinsurance is insurance one insurance company buys from another to share risk — never “Southern Atlantic Re” alone. Write **body-mass index**, not “BMI,” until that number has been named in full. Write **House bill 10234**, not “H.R. 10234,” until the bill has been introduced as a House of Representatives bill.

**Define when you first mention** (plain sentence, not a glossary dump):

- Product types (annuity, fixed annuity, index-linked annuity, variable life, term, whole life)
- Processes (underwriting, rehabilitation as a **court takeover of a struggling insurer**, surrender, contestability period)
- Institutions (state department of insurance, **state guaranty association** = that state’s backup fund if a company cannot pay, up to a dollar limit)
- Paperwork (legal booklet vs short summary, registration/filing only if you also say it is a short summary of costs, risks, and main rules)

Do **not** drop unexplained jargon: prospectus, rehabilitator, table rating, preferred/standard class, market index, reinsurance.

You still **must not** dump actuarial mechanics (RBC ratios, reserve transfers) if the story does not need them. If the story **does** use a term, teach it. Prefer “a judge can put a person chosen by the state in charge of the company” over “court-supervised process” with no kind of process named.

Listing-card bullets and the digest “this week” line must also name the news in plain language (who did what), not industry shorthand.

---

## Purpose

The pages **teach families enough to understand the news**. That is not a course for agents. It is classroom-clear writing for people who have never heard the terms.

Also:

1. Build trust
2. Keep clients informed
3. Show that Mejor Vida Insurance stays current on important insurance news
4. Encourage readers to click into the **full article**

The weekly page should feel like a **modern online news digest** that **teaches** families what the news means.

---

## Structure (required)

### Weekly digest page (`blog/weekly-insurance-update-YYYY-MM-DD.html`)

- Rewrite the **intro** for families. Example direction (adapt weekly):

  > Cada semana resumimos las noticias más importantes del mundo de los seguros para ayudar a las familias a entender cómo estos cambios podrían afectar su protección financiera.

- **Do not mention agents** anywhere on the page.
- For **each story**:
  - Keep the existing **image**
  - Keep the **headline** (may lightly softensensation; keep accuracy)
  - Write a **consumer-friendly summary of 150–250 words** in **fresh language** (not a cut from the full article)
  - End with a prominent button:

    - ES: **Leer el artículo completo**
    - EN: **Read the full article**

    linking to the individual full-article URL
  - Also include the soft CTA line:

    - ES: ¿Quiere conocer todos los detalles?
    - EN: Want the full details?

- **Do NOT** put the full article on the weekly page.

### Individual full-article pages (one per story)

- Separate ES + EN HTML files under `blog/` and `en/blog/`
- **Length:** match the Sunday emailed draft — about **600–900 words** of article prose (full depth). The digest stays condensed (150–250); the full page is the long version.
- Rewrite for consumers; answer: Why should I care? Does this affect me? Should I do anything? Is my insurance still okay?
- Soft CTA (quote / schedule / WhatsApp) at the end — not “call your agent network”
- Unique wording vs. the digest (SEO: avoid near-duplicate pages)
- Include FAQ (visible + `FAQPage` schema) and internal links to pillar final-expense guides when relevant
- **Sources:** end every full article with a **Fuentes / Sources** box and working links to **primary authorities** (FTC, NFDA, III, BLS, `.gov`, major press — not unknown blogs or vendor sites). No self-only citations. Drop unsourced claims.
- **Indexing:** Spanish `index, follow` + sitemap; English `noindex, follow` (compliance only). See `tools/blog-build-rules.md` §1 and §4.

---

## Rewrite style

Do **not** dump actuarial mechanics the story does not need (RBC ratios, reserve transfers, accounting).

Do **teach** every term you use (see Teaching language). If you mention reinsurance, underwriting, or a court process, define it in everyday words.

Also answer:

- Why should I care?
- Does this affect me?
- Should I do anything?
- Is my insurance still okay?

Every story should answer those questions.

---

## Tone

Write like a **trusted advisor**.

Not like: an insurance company brochure, compliance memo, legal document, or textbook.

Use:

- short paragraphs
- conversational Spanish / clear English
- simple explanations

Preserve **accuracy**. Simplify the **explanation**, not the facts.

---

## SEO / AEO (keep + Spanish-first)

Do not remove:

- headings
- images + alt text
- internal links (digest ↔ full articles ↔ pillar FE guides)
- schema (NewsArticle / Article, BreadcrumbList; digest ItemList; full-article FAQPage)
- metadata (title, description, OG)

Only simplify **visible** article content. Update schema/descriptions so they no longer say the post is “for agents.”

When cloning last week’s template: rewrite canonical, dates, preload, hreflang, ItemList, and keywords for **this** week — never leave prior-week leftovers. Full checklist: `tools/blog-build-rules.md` §4.

---

## Duplicate-content rule (critical)

- Digest summaries = **new** wording
- Full articles = **new** wording
- Do **not** paste the newsletter, and do **not** paste the digest into the full article (or vice versa)

---

## Prompt (copy into chat)

Convert the following insurance newsletter into:

1. A **weekly digest page** for families (150–250 word preview per story + “Leer el artículo completo” / “Read the full article”)
2. **Separate full articles** for each story, rewritten for consumers

Follow `tools/newsletter-to-consumer-blog-prompt.md` and `.cursor/rules/newsletter-consumer-blog.mdc`.

Do not write for agents. No “what this means for agents.” No IMOs/BGAs.

**Teaching:** define every new term and spell out abbreviations on first use (`tools/newsletter-to-consumer-blog-prompt.md` — Teaching language).

### Newsletter / briefing to convert

[PASTE NEWSLETTER HERE]

---

## After drafting

1. Update `blog/weekly-insurance-update-YYYY-MM-DD.html` + `en/blog/…`
2. Create full-article ES/EN pages and link CTAs
3. Update `blog.html` / `en/blog.html` card copy if the summary changed
4. Add full-article URLs to `sitemap.xml`
5. Mirror `sources/` if the project still syncs sources for that week
6. See also `tools/blog-build-rules.md` (weekly digest checklist — consumer edition)
