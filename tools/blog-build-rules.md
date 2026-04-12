# Blog build rules — Mejor Vida Insurance

Rules for authoring **weekly industry update** posts (`blog/weekly-insurance-update-YYYY-MM-DD.html`) and keeping **`blog.html`** + **`sitemap.xml`** in sync.
(Image prompts: see `tools/blog-image-rules.md` and `HUGGINGFACE_BLOG_IMAGES.md`.)

---

## 1. Bilingual parity (English / Spanish) — **required**

The blog UI uses `data-lang="en"` and `data-lang="es"` on elements, with `html.lang-en` / `html.lang-es` on `<html>` (see `script.js` / weekly post inline script). Only one language is visible at a time.

**Do not publish Spanish that is shorter or “summary only” when English is full length.** Both languages must carry the **same facts, structure, and depth**.

### 1.1 Hero and executive summary

- **Hero** (`blog-hero`): pair `lead` paragraphs — `<p class="lead mb-3" data-lang="en">` immediately followed by `<p class="lead mb-3" data-lang="es">` with a full equivalent (not a one-line teaser).
- **Executive summary**: two sibling `<div class="executive-summary" data-lang="en">` and `data-lang="es">`, each with the same number of substantive paragraphs and the same bullet/intake list ideas.

### 1.2 Story sections (body)

For every visible English paragraph in the main narrative (after the story image, before optional collapsible briefings):

- Use **immediate pairs**: `<p data-lang="en">…</p>` then `<p data-lang="es">…</p>`.
- Spanish must translate the **full** English thought (statistics, qualifiers, source framing), not a condensed rewrite.

### 1.3 Long-form / newsletter text inside `<details>`

When the post includes the full newsletter or long source text:

- Provide **two separate** `<details>` siblings:
  - `<details class="border rounded p-3 mb-3 bg-light" data-lang="en">` — summary e.g. `Read the full briefing (complete newsletter text)`.
  - `<details class="border rounded p-3 mb-3 bg-light" data-lang="es">` — summary e.g. `Leer el informe completo (texto íntegro del boletín)`.
- The inner `<div class="mt-3 small">` must contain **paragraph-by-paragraph** (or clearly equivalent) Spanish for every English `<p>` in the English `<details>`, including closing **“What this means for agents”** / **“Qué significa para los agentes (boletín)”** blocks.
- Do **not** put `data-lang` on each inner `<p>` inside `<details>` unless you duplicate again; language visibility is controlled by `data-lang` on the **`<details>`** wrapper.

### 1.4 “What this means for agents” (visible, under `h3`)

- Keep the shared `h3` pair (`data-lang="en"` / `data-lang="es"`).
- The following **short** closing paragraphs (one EN, one ES) must be **equal in intent and length order** — both operational takeaways, not a one-sentence ES.

### 1.5 FAQ

- For each question: one `<div class="faq-item" data-lang="en">` and one `<div class="faq-item" data-lang="es">`.
- Spanish **answers** must be full paragraph equivalents of English (same informational load), not ultra-short bullets.

### 1.6 Conclusion and sidebar

- **Conclusion**: EN and ES paragraphs must match in scope (macro takeaway + agent action).
- **Sidebar “At a glance” / “De un vistazo”**: same number of bullets and comparable detail (bold labels optional but structure should mirror).

### 1.7 Source lines

- ES source blocks should name the same publication, date, and caveats as EN (e.g. “confirm evolving facts” / “confirme hechos en evolución”).

---

## 2. Structural checklist (each new week)

1. **Base file**: Copy the most recent `weekly-insurance-update-*.html` to preserve header, nav, footer, styles, assistant widget, and JSON-LD patterns.
2. **Head**: Update `title`, `meta name="description"`, `canonical`, Open Graph, `article:published_time` / `modified_time`, `NewsArticle` + `BreadcrumbList` + `FAQPage` + `ItemList` JSON-LD.
3. **`blog.html`**:
   - Update `.newsletter-summary-block` (ES + EN) for the covered week.
   - Prepend a new **blog card** inside `#blog-feed` (most recent first).
4. **`sitemap.xml`**: Add `<url>` for the new post; bump `blog.html` `lastmod`.
5. **Images**: `img/blog-generated/<slug>/hero.png`, `story-1.png`, … — wire paths with `onerror` fallback to `../img/3-1-2026-Blog.png` if assets are not yet generated.
6. **Slug**: `weekly-insurance-update-YYYY-MM-DD.html` where the date is the **publication** date of the post (week covered is stated in hero copy).

---

## 3. QA before merge

- [ ] Toggle **ES** and **EN** in the page header; confirm no language shows empty story bodies.
- [ ] Count intro paragraph **pairs** per story; spot-check that ES is not shorter than EN.
- [ ] Open both `<details>` (in each language mode) and confirm the long briefing exists only in the active language and reads complete.
- [ ] FAQ: four question pairs with substantial ES answers.
- [ ] Valid relative links (`../quote-screen.html`, `../blog.html`).

---

## 4. Reference implementation

See `blog/weekly-insurance-update-2026-04-12.html` for the paired-paragraph pattern, dual `<details>` briefings, and balanced FAQ/conclusion/sidebar after the bilingual parity fix.
