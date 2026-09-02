# Blog build rules — Mejor Vida Insurance

Rules for authoring **public weekly digest** posts (`blog/weekly-insurance-update-YYYY-MM-DD.html` + `en/blog/…`) and keeping **`blog.html`** + **`sitemap.xml`** in sync.

**Primary workflow:** Transform Sunday blog drafts (`tools/blog-drafts/` / weekly blog system) into a **consumer digest** + **separate full articles**. Follow **`tools/newsletter-to-consumer-blog-prompt.md`** and Cursor rule **`newsletter-consumer-blog`**.

(Image prompts: `tools/blog-image-rules.md` and `HUGGINGFACE_BLOG_IMAGES.md`.)

---

## 0. Audience (public weekly pages)

- Write for **families** (Hispanic households, seniors, adult children) — **not** agents, IMOs, BGAs, underwriters, or producers.
- **Spanish-first SEO.** Topics only: **final expense**, **term life**, **whole life** (and consumer scams tied to those). No Medigap/Medicare shopping, IUL/VUL, LTC deals, or industry trade digests as indexed content.
- Weekly page = **condensed news digest** (150–250 word preview per story + CTA to full article).
- Full story body lives on **individual article pages** at **full draft length** (see §2.4).
- Never include “Qué significa esto para los agentes” / “What this means for agents.”
- **Do not add a weekly URL to `sitemap.xml` / leave it `index`** unless the week is clearly consumer FE/term/whole. Off-topic archive weeks stay on the site as `noindex, follow` (readable, not ranked).

---

## 1. Bilingual parity (English / Spanish) — **required**

Prefer **separate language files** (current pattern):

- Spanish: `blog/weekly-insurance-update-YYYY-MM-DD.html`
- English: `en/blog/weekly-insurance-update-YYYY-MM-DD.html`

Same structure, depth, and facts in both languages. Do **not** ship a short Spanish teaser against a full English page (or vice versa).

**SEO / indexing (Julie’s policy):**

- Index **Spanish only**. English exists for **compliance / language toggle**, not for English search traffic.
- Focus indexed content on **final expense → term life → whole life** for consumers. Do not index producer/industry/Medigap weeks.
- On-topic Spanish pages: `index, follow`; include in `sitemap.xml`.
- English pages: `noindex, follow`; **do not** add `en/blog/…` to `sitemap.xml`.
- Off-topic Spanish archive (older trade/Medigap weeks): `noindex, follow`; **omit from sitemap**.
- On Spanish pages: `og:locale` = `es_US`; do **not** `hreflang` to English noindex URLs (use `hreflang="es-US"` + `hreflang="x-default"` → Spanish canonical only). This marks pages as U.S. Spanish so Google prefers USA searchers over Spain/Latin America.

---

## 2. Weekly digest checklist

1. **Base file**: Copy the most recent weekly HTML for header, nav, footer, styles, widget, JSON-LD patterns. **Strip leftover schema/ItemList/hreflang/preload from the prior week** — never leave July-N dates, wrong story lists, or old hero preloads.
2. **Intro**: Family-facing lead. No agent briefing language.
3. **Each story block** (condensed only):
   - `id="story1"` … `storyN`
   - Keep image + alt
   - Keep headline
   - Fresh **150–250 word** summary (not a paste of the full article)
   - Answer briefly: why care / does it affect me / should I act / is my coverage okay?
   - CTA: `¿Quiere conocer todos los detalles?` + **Leer el artículo completo** (EN equivalents)
4. **Full articles** (required length):
   - Create paired ES + EN pages.
   - Body length must match the Sunday emailed draft: **about 600–900 words** of article prose (same depth as `tools/blog-drafts/blog_draft_YYYY-MM-DD.html`).
   - Do **not** ship a short “half article” on the full-article URL.
   - Unique wording vs. the digest (no near-duplicates).
   - Include: clear H2 sections, real-world example with numbers, soft CTA (quote / schedule), back link to weekly digest.
   - **Authoritative sources (anti-hallucination — required):** At the bottom of every full article, add a visible **Fuentes / Sources** box with **working external links** to **primary authorities** used for facts (`.gov` / FTC / BLS / SSA, NFDA, III, state DOI, major newsrooms). Do **not** cite unknown blogs or vendor/marketing sites. Do **not** cite only Mejor Vida. Evergreen pieces must still cite primary public sources for any numbers or product mechanics. If a claim cannot be sourced, cut it.
   - Add **FAQ** (visible `Preguntas frecuentes` + `FAQPage` JSON-LD) with 3 plain-language questions.
   - Add **internal links** to pillar guides when relevant: `que-es-seguro-gastos-finales.html`, `cuanto-cuesta-seguro-gastos-finales.html`, `tipos-planes-seguro-gastos-finales.html`, plus the weekly digest.
5. **Head / schema** (every new page — check carefully):
   - Unique title, description, canonical, OG image for **this** URL.
   - `article:published_time` / `modified_time` = this story’s dates (not last week’s).
   - `NewsArticle` image = story/hero image URL (not the site logo); keywords match the topic (never leftover IUL/VUL/agent keywords).
   - Digest: `NewsArticle` + `BreadcrumbList` + `ItemList` of **this week’s** three stories only.
   - Full articles: `NewsArticle` + `BreadcrumbList` + `FAQPage`. **Remove** any stale ItemList copied from a template.
   - Spanish `article:tag` values in Spanish when possible (`seguro de gastos finales`, etc.).
   - Preload the **correct** WebP for this page’s LCP image.
6. **`blog.html` / `en/blog.html`**: prepend feed card (most recent first).
7. **`sitemap.xml`**: **Spanish only** — weekly ES URL + each ES full-article URL; bump `blog.html` `lastmod`. Never add English blog URLs.
8. **Images**: `img/blog-generated/<slug>/hero.png`, `hero-es.png`, `hero-en.png`, `story-1.png`… then `npm run optimize:images` → `img/opt/…`.
9. **Reading time**: digest ~5–8 min; full articles ~8–12 min when body is 600–900 words.
10. **Footer blurb**: serve families / clients — not “independent agents.”

---

## 3. QA before merge

- [ ] Digest summaries are 150–250 words each (condensed)
- [ ] Full articles are ~600–900 words (email-draft depth), not short teaser clones
- [ ] Full articles are not copy-pastes of the digest
- [ ] ES and EN parity of structure and depth
- [ ] No agent / IMO / BGA / underwriter framing
- [ ] No leftover prior-week hreflang, preload, ItemList, keywords, or dates
- [ ] Spanish indexed; English `noindex, follow`; sitemap Spanish-only
- [ ] FAQ + internal links on full articles
- [ ] Full articles end with **Fuentes / Sources** box + live **primary-authority** URLs (not unknown blogs / vendor sites; not self-only)
- [ ] Relative links valid (`../quote.html`, `../blog.html`, etc.)
- [ ] Wire CTAs to the correct full-article filenames

---

## 4. Anti-regression checklist (copy from prior week carefully)

When cloning last week’s HTML template, **always rewrite**:

| Field | Must match this week |
|---|---|
| `<title>`, meta description, canonical, og:url, og:image | New URLs |
| `og:locale` | `es_US` on Spanish pages |
| `hreflang` | ES + x-default only (no EN) on Spanish pages |
| `preload` | This week’s hero/story WebP |
| JSON-LD dates | This week / story date |
| JSON-LD ItemList | This week’s three stories only (digest) |
| JSON-LD keywords | Topic-safe; never IUL/VUL/competitor leftovers |
| robots | ES `index, follow`; EN `noindex, follow` |

---

## Reference

- July 12, 2026: first consumer digest + full-article pattern.
- July 19, 2026: full articles at email-draft length; Spanish-only indexing; FAQ + pillar internal links; anti-regression head/schema rules above.
