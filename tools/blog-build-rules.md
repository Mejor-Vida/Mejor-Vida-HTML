# Blog build rules — Mejor Vida Insurance

Rules for authoring **public weekly digest** posts (`blog/weekly-insurance-update-YYYY-MM-DD.html` + `en/blog/…`) and keeping **`blog.html`** + **`sitemap.xml`** in sync.

**Primary workflow:** Transform Julie’s newsletter into a **consumer digest** + **separate full articles**. Follow **`tools/newsletter-to-consumer-blog-prompt.md`** and Cursor rule **`newsletter-consumer-blog`**.

(Image prompts: `tools/blog-image-rules.md` and `HUGGINGFACE_BLOG_IMAGES.md`.)

---

## 0. Audience (public weekly pages)

- Write for **families** (Hispanic households, seniors, adult children) — **not** agents, IMOs, BGAs, or underwriters.
- Weekly page = **news digest** (150–250 word preview per story + CTA to full article).
- Full story body lives on **individual article pages**, rewritten in fresh language (no near-duplicates).
- Never include “Qué significa esto para los agentes” / “What this means for agents.”

---

## 1. Bilingual parity (English / Spanish) — **required**

Prefer **separate language files** (current pattern):

- Spanish: `blog/weekly-insurance-update-YYYY-MM-DD.html`
- English: `en/blog/weekly-insurance-update-YYYY-MM-DD.html`

Same structure, depth, and facts in both languages. Do **not** ship a short Spanish teaser against a full English page (or vice versa).

If a legacy page still uses `data-lang="en"|"es"` toggles on one file, keep EN/ES pairs equal in depth.

---

## 2. Weekly digest checklist

1. **Base file**: Copy the most recent weekly HTML for header, nav, footer, styles, widget, JSON-LD patterns.
2. **Intro**: Family-facing lead. No agent briefing language.
3. **Each story block**:
   - `id="story1"` … `storyN`
   - Keep image + alt
   - Keep headline
   - Fresh 150–250 word summary answering: why care / does it affect me / should I act / is my coverage okay?
   - CTA: `¿Quiere conocer todos los detalles?` + button **Leer el artículo completo** (EN equivalents)
4. **Full articles**: Create paired ES/EN pages; wire CTA `href`s; add to sitemap.
5. **Head**: Update title, description, canonical, OG, `article:published_time` / `modified_time`, NewsArticle + BreadcrumbList + ItemList.
   - Descriptions must **not** say the post is for agents.
   - **BreadcrumbList** = site nav only (Home → Blog → title). Stories go in **ItemList**.
6. **`blog.html` / `en/blog.html`**: summary block + feed card (most recent first).
7. **`sitemap.xml`**: weekly URL + each full-article URL; bump blog index `lastmod`.
8. **Images**: `img/blog-generated/<slug>/hero.png`, `story-1.png`, … + `img/opt/…` WebP.
9. **Reading time**: digest is short (often ~5–8 min), not 25+ minutes of full newsletter text.
10. **Footer blurb**: serve families / clients — not “independent agents.”

---

## 3. QA before merge

- [ ] No agent / IMO / BGA / underwriter framing on public pages
- [ ] Each story has digest-length unique copy + working full-article link
- [ ] Full articles are not copy-pastes of the digest
- [ ] ES and EN parity
- [ ] Schema/metadata consumer-facing
- [ ] Relative links valid (`../quote.html`, `../blog.html`, etc.)

---

## Reference

July 12, 2026 consumer digest + full articles is the first week built fully to this pattern.
