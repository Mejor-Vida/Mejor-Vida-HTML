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

---

## Purpose

The page goal is **not** to teach insurance.

The goal is to:

1. Build trust
2. Keep clients informed
3. Show that Mejor Vida Insurance stays current on important insurance news
4. Encourage readers to click into the **full article**

The weekly page should feel like a **modern online news digest**.

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
- Rewrite the story for consumers at greater depth than the digest
- Answer: Why should I care? Does this affect me? Should I do anything? Is my insurance still okay?
- Soft CTA (quote / schedule / WhatsApp) at the end — not “call your agent network”
- Unique wording vs. the digest (SEO: avoid near-duplicate pages)

---

## Rewrite style

Do **NOT** explain (unless a one-line plain gloss is essential):

- actuarial corrections, reserve transfers, RBC ratios
- reinsurance structures, underwriting mechanics
- regulatory technicalities, accounting details

Instead explain:

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

## SEO (keep)

Do not remove:

- headings
- images + alt text
- internal links
- schema (NewsArticle / Article, BreadcrumbList, ItemList)
- metadata (title, description, OG)

Only simplify **visible** article content. Update schema/descriptions so they no longer say the post is “for agents.”

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
