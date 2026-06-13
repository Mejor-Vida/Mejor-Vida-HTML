# Mejor Vida Insurance — SEO Project Plan

**Status:** Active reference document  
**Created:** June 8, 2026  
**Source:** Adapted from Abacus AI outline + codebase audit  
**Site:** [mejorvidainsurance.com](https://www.mejorvidainsurance.com)  
**Repo path:** `docs/SEO-PROJECT.md` ← **open this file when working on SEO**

---

## How to use this document

1. Work phases in order (Phase 1 → 4).
2. Check off tasks in the **Master task list** as they ship.
3. Every HTML change must mirror **Spanish + English** (see `bilingual-es-en-parity.mdc`).
4. After new public pages or blog posts: update `sitemap.xml` and `blog.html` (if blog).
5. Related doc: `docs/SEO-Priority1-Changes.md` (earlier technical SEO work, June 2026).

---

## 1. Business context (verified)

### What we are

| Fact | Detail |
|------|--------|
| Business | Mejor Vida Insurance LLC — **telephonic** final expense insurance agency |
| Agent | Julie Braunsroth, Nebraska Producer License **#21695431** |
| Service area | **All of Nebraska** (statewide; not city-by-city SEO) |
| Delivery | Phone, WhatsApp, video — **no walk-in office** |
| Mailing address | 1201 O St Ste 309 Unit #597, Lincoln, NE 68508 (**virtual mailbox**, not a client-facing office) |
| Primary audience | Spanish-speaking Nebraska families, ages ~40–85 |
| Secondary audience | English speakers (compliance + bilingual households) |
| Carriers | Assurity (Lincoln HQ), Mutual of Omaha (NE-founded), American Amicable, others as needed |

### Contact channels (use consistently in meta/CTAs)

| Channel | Number / link | SEO / UX role |
|---------|---------------|---------------|
| Office / main | 402-440-5438 | Primary CTA in meta descriptions |
| WhatsApp | 402-440-5438 | Primary for Spanish-speaking leads |
| Julie callback | 402-588-1125 | Secondary; use in body copy, not meta |
| SMS / texto | 402-735-5665 | Footer + header bar |
| Email | julie@mejorvidainsurance.com | Schema + contact pages |
| Hours | Mon–Fri 4–8 PM CST, Sat 8 AM–12 PM CST | Schema `openingHoursSpecification` |

### What we are NOT optimizing for

- **Google Business Profile** — virtual address rejected; organic SEO + Facebook reviews instead
- **Map pack / local 3-pack** — no physical storefront
- **City landing pages** (Omaha-only, Lincoln-only, etc.) — statewide messaging only
- **English keyword priority** — Spanish-first; EN pages stay compliant and mirrored

### Unique differentiators (use in content, not generic insurance copy)

1. **Julie AI chatbot** on `/quote.html` — RAG-powered Q&A (`lib/rag-pipeline.js`, Supabase knowledge base)
2. **Homepage FAQ section** (`#final-expense-answers`) — already has FAQPage schema
3. **Final expense calculator** — `/final-expense-estimator.html` (Nebraska funeral cost planning)
4. **Online quote funnel** — `/quote.html` → `/quote-results.html` (HubSpot / ManyChat integrations)
5. **Schedule Julie** — `/schedule-julie.html`
6. **Carrier detail pages** — `/carriers/assurity.html`, `mutual-of-omaha.html`, `american-amicable.html`
7. **Weekly insurance blog** — industry authority; needs Nebraska-local pillar content alongside

---

## 2. Core SEO problem

Google cannot reliably associate the site with **“seguro de gastos finales Nebraska”** because:

- Homepage title/H1 omit Nebraska (as of June 2026 audit)
- Hero and above-fold copy rarely say “Nebraska”
- Virtual address is shown with a map pin in the footer (implies walk-in office — wrong signal)
- Schema includes a street address (invites map/Local Pack confusion for a telephonic agency)
- ~15 weekly blog posts exist but **zero Nebraska pillar guides**
- Abacus assumed standalone pages (`preguntas.html`, `como-funciona.html`, `calculadora.html`) that **do not exist** — content lives in homepage sections and other URLs

**Reality check:** Meaningful ranking movement typically takes **3–6 months** after foundational fixes.

---

## 3. Corrections to the Abacus guide (important)

The Abacus PDF is a solid outline. These adjustments match the **actual site**:

| Abacus assumed | Actual site |
|----------------|-------------|
| `/como-funciona.html` | Homepage section `#how-it-works` |
| `/preguntas.html` | Homepage section `#final-expense-answers` + FAQ schema on `index.html` |
| `/aseguradoras.html` | Homepage `#carriers` + `/carriers/*.html` detail pages |
| `/calculadora.html` | `/final-expense-estimator.html` (ES) / `/en/final-expense-estimator.html` (EN) |
| Create `sitemap.xml` from scratch | **Already exists** — extend and maintain |
| GA4 not installed | **Already installed** — `G-K921EG6JWG` sitewide |
| GSC verification | **Not yet** — meta tag still needed on `index.html` |
| `quote.html` as SEO page | **`noindex, follow`** — intentional; optimize homepage + guides instead |
| `landing-gastos-finales.html` | **`noindex`** — paid/social landing; keep noindex |
| Inline `style=""` location badge | Prefer **site CSS class** in `css/` for consistency |
| Footer via each HTML file | Prefer **`includes/site-footer-inner.html`** + **`includes/en-site-footer.html`** |
| Nav via each HTML file | Prefer **`includes/site-header-inner.html`** + **`includes/en-site-header.html`** |

---

## 4. Current baseline (June 2026 audit)

### Already done ✅

| Item | Location / notes |
|------|------------------|
| GA4 | `G-K921EG6JWG` on public HTML pages |
| `robots.txt` + sitemap reference | `/robots.txt` |
| `sitemap.xml` | Exists; carriers + blog posts; needs new pages + `schedule-julie` |
| InsuranceAgency JSON-LD | `index.html`, `en/index.html` (has Nebraska `areaServed`) |
| FAQPage JSON-LD | `index.html` (Spanish FAQ) |
| Person JSON-LD | `about-julie.html`, `en/about-julie.html` |
| Product JSON-LD | All carrier pages (ES + EN) |
| hreflang + canonical | Homepages, about-julie, carrier pages |
| og:image fix | Hero image on homepages |
| ES about-julie title | Already includes “Nebraska” |
| Weekly blog + bilingual parity | `blog/weekly-insurance-update-*.html` |
| Facebook page | facebook.com/MejorVidaInsurance |

### Not done / needs work ❌

| Item | Priority |
|------|----------|
| Nebraska in homepage title, meta, H1, hero | 🔴 P1 |
| Nebraska in most page titles (see inventory below) | 🔴 P1 |
| Location / telephonic service badge on homepage hero | 🔴 P1 |
| GSC verification meta tag | 🔴 P1 |
| Schema: remove street address; add telephonic signals (`knowsLanguage`, hours, `LocalBusiness` type) | 🟠 P1 |
| Footer: de-emphasize virtual address; add Nebraska service column | 🟠 P2 |
| New page: statewide service (`areas-de-servicio.html`) | 🟠 P2 |
| New page: why Nebraska agent (`por-que-agente-nebraska.html`) | 🟠 P2 |
| Nebraska pillar blog posts (5+ planned) | 🟠 P2–P3 |
| Image alt text pass | 🟡 P3 |
| Facebook review CTA on site | 🟡 P3 |
| Submit / monitor GSC after verification | 🔴 P1 |

---

## 5. Keyword strategy (Spanish-first)

### Primary keywords

| Keyword | Priority | Target pages |
|---------|----------|--------------|
| seguro de gastos finales Nebraska | 🔴 Critical | Homepage, service areas page, pillar blog |
| seguro de gastos finales | 🔴 Critical | Homepage, calculator, quote funnel entry points |
| seguro de vida Nebraska | 🔴 Critical | Service areas, Hispanic community blog |
| seguro funeral Nebraska | 🟠 High | Funeral cost blog, service areas |
| agente de seguros Nebraska | 🟠 High | About Julie, why-agent page |
| agente de seguros bilingüe Nebraska | 🟠 High | About Julie, Hispanic blog |
| cotización seguro de gastos finales Nebraska | 🟡 Medium | Calculator, homepage CTAs |

### Secondary / long-tail (body copy, H2s, FAQs, blog)

- seguro de gastos finales sin examen médico  
- cuánto cuesta un funeral en Nebraska  
- seguro de gastos finales para personas mayores  
- seguro de gastos finales Mutual of Omaha Nebraska / Assurity Nebraska  
- seguro de vida en español Nebraska  

### Placement rules

- **Title:** primary keyword + “Nebraska” where natural; ≤ ~60 characters  
- **Meta description:** keyword in first 10 words + telephonic service + CTA + phone; ≤ ~155 characters  
- **H1:** one per page; include Nebraska on money pages  
- **Density:** 2–4 primary mentions per page; write for humans  
- **Do not** keyword-stuff city names — one “todo Nebraska” + optional city list on service areas page only  

---

## 6. Page inventory & title targets

Use this table when implementing Phase 1. **Bold** = already has Nebraska in title.

### Spanish (root)

| File | Current title (Jun 2026) | Target title |
|------|--------------------------|--------------|
| `index.html` | Seguro de Gastos Finales \| … | **Seguro de Gastos Finales en Nebraska \| Mejor Vida Insurance** |
| `about-julie.html` | **…Agente… en Nebraska \| …** | Keep; tune meta if needed |
| `contact.html` | Contáctenos \| … | **Contacto \| Mejor Vida Insurance — Nebraska** |
| `blog.html` | Consejos Semanales… | **Blog de Seguros en Nebraska \| Mejor Vida Insurance** |
| `final-expense-estimator.html` | Calculadora de gastos finales — … | **Cotización de Seguro de Gastos Finales en Nebraska \| Mejor Vida** |
| `schedule-julie.html` | Agendar con Julie — … | **Agendar con Julie — Agente en Nebraska \| Mejor Vida** |
| `quote.html` | (noindex) | Optional tune for UX; **stay noindex** |
| `carriers/assurity.html` | (check) | **Assurity — Gastos Finales en Nebraska \| Mejor Vida** |
| `carriers/mutual-of-omaha.html` | (check) | **Mutual of Omaha — Gastos Finales en Nebraska \| Mejor Vida** |
| `carriers/american-amicable.html` | (check) | **American Amicable — Gastos Finales en Nebraska \| Mejor Vida** |
| `areas-de-servicio.html` | *new* | **Seguro de Gastos Finales en Todo Nebraska \| Mejor Vida** |
| `por-que-agente-nebraska.html` | *new* | **¿Por Qué un Agente de Seguros en Nebraska? \| Mejor Vida** |

### English (`en/`)

| File | Current title | Target title |
|------|---------------|--------------|
| `en/index.html` | Final Expense Insurance \| … | **Final Expense Insurance in Nebraska \| Mejor Vida Insurance** |
| `en/about-julie.html` | About Julie \| … | **About Julie — Nebraska Insurance Agent \| Mejor Vida** |
| `en/contact.html` | Contact Us \| … | **Contact \| Mejor Vida Insurance — Nebraska** |
| `en/blog.html` | Final Expense Insurance Blog \| … | **Nebraska Insurance Blog \| Mejor Vida Insurance** |
| `en/final-expense-estimator.html` | Final Expense Calculator \| … | **Final Expense Quote — Nebraska \| Mejor Vida** |
| `en/schedule-julie.html` | Agendar con Julie — … | **Schedule with Julie — Nebraska Agent \| Mejor Vida** (fix ES title on EN page) |
| `en/service-areas.html` | *new* | **Final Expense Insurance Across Nebraska \| Mejor Vida** |
| `en/why-nebraska-agent.html` | *new* | **Why Choose a Licensed Nebraska Agent? \| Mejor Vida** |

### Homepage copy targets (ES + EN)

**Spanish H1 (recommended):**
> Seguro de Gastos Finales en Nebraska: Protege a tu Familia

**English H1:**
> Final Expense Insurance in Nebraska: Protect Your Family

**Location badge** (after H1 — use CSS class, not inline styles):
> 📍 Sirviendo a familias en todo Nebraska — por teléfono, WhatsApp y videollamada

**Meta description (ES):**
> Seguro de gastos finales para familias en todo Nebraska. Servicio telefónico en español e inglés. Cotización gratis. Llame a Julie: 402-440-5438

Mirror Open Graph / Twitter titles and descriptions when updating `<title>` and meta.

---

## 7. Technical SEO specifications

### 7.1 Schema markup (telephonic agency)

**Goal:** Tell Google we serve Nebraska statewide **without** implying a walk-in storefront.

Update `InsuranceAgency` block on homepages (and consider shared include later):

- Add `@type`: `["InsuranceAgency", "LocalBusiness"]`  
- Add `knowsLanguage`: `["es", "en"]`  
- Add `openingHoursSpecification` (Mon–Fri 16:00–20:00, Sat 08:00–12:00, **America/Chicago**)  
- Keep `areaServed`: Nebraska (`@type: State`)  
- **Remove `address` / geo** from marketing schema (keep legal mailing address only on privacy/terms pages)  
- Add `hasOfferCatalog` for final expense + bilingual consultation (optional but recommended)  
- Keep existing FAQPage schema on homepage  
- Keep Person schema on about-julie  
- Keep Product schema on carrier pages  

Validate: [Google Rich Results Test](https://search.google.com/test/rich-results)

### 7.2 Footer & NAP consistency

**Current issue:** Footer shows map pin + Lincoln street address → looks like a physical office.

**Recommended footer changes** (`includes/site-footer-inner.html`, `includes/en-site-footer.html`):

1. Replace map-pin address row with:  
   `📍 Servimos a familias en todo Nebraska — consultas por teléfono, WhatsApp y video`
2. Add column **“Servicio en Nebraska”** with links:
   - `/areas-de-servicio.html` — Servimos a todo Nebraska  
   - `/por-que-agente-nebraska.html` — ¿Por qué un agente de Nebraska?  
   - `/blog.html` — Blog de seguros  
3. Keep license line (already present): Producer #21695431 + doi.nebraska.gov link  
4. Add telephonic disclaimer line (Abacus suggestion — good)  
5. Mailing address stays on `privacy-policy.html` / `terms-service.html` only  

After footer include changes, rebuild or sync pages that embed footer inline (many blog posts embed footer directly — batch update or script).

### 7.3 Sitemap maintenance

File: `sitemap.xml`

**Add when created:**
- `/areas-de-servicio.html`, `/en/service-areas.html` (priority 0.9)
- `/por-que-agente-nebraska.html`, `/en/why-nebraska-agent.html` (priority 0.8)
- `/schedule-julie.html`, `/en/schedule-julie.html` (priority 0.75)
- Each new Nebraska pillar blog post (priority 0.65–0.7)

**Do not add** (noindex): `quote.html`, `landing-gastos-finales.html`, ad landing folders, `staff/`, previews

**Process:** Update `lastmod` on `blog.html` when publishing posts (see `blog-build-rules.md`).

### 7.4 Google Search Console

1. Add to `index.html` `<head>`:  
   `<meta name="google-site-verification" content="VALUE_FROM_GSC" />`
2. Deploy → Verify in GSC  
3. Submit `https://www.mejorvidainsurance.com/sitemap.xml`  
4. Monitor: Coverage, Performance, Rich results  

### 7.5 Internal linking map

```
Homepage (index)
  → areas-de-servicio (hero CTA + footer)
  → por-que-agente-nebraska (footer)
  → final-expense-estimator (nav + CTAs)
  → about-julie
  → #final-expense-answers (FAQ)
  → blog + pillar posts

Pillar blog posts
  → areas-de-servicio
  → final-expense-estimator
  → contact
  → carriers/*

Carrier pages
  → quote.html (noindex OK)
  → contact
  → areas-de-servicio
```

### 7.6 Pages to leave noindex

| Page | Reason |
|------|--------|
| `quote.html`, `en/quote.html` | Conversion / chatbot; avoid SERP cannibalization |
| `quote-results.html` | Personalized results |
| `landing-gastos-finales.html` | Paid/social traffic |
| `gastos-finales-ads*/` | Ad variants |
| `staff/*`, `preview/*` | Internal |

---

## 8. Content strategy

### 8.1 New pages (Phase 2)

#### A. `areas-de-servicio.html` / `en/service-areas.html` — 🔴 High

**Purpose:** Rank for “seguro de gastos finales Nebraska”; explain telephonic statewide service.

**Sections:**
1. Hero — H1 + telephonic lead  
2. Cómo le servimos — phone, WhatsApp, video (+ hours)  
3. Ventajas del servicio telefónico  
4. Áreas de Nebraska — city list (one section, not separate URLs)  
5. Aseguradoras en Nebraska — Assurity, Mutual of Omaha, American Amicable  
6. FAQ (6 questions) + FAQPage schema  
7. CTA — phone, WhatsApp, calculator  

**Design:** Match `about-julie.html` / existing Bootstrap layout; use `includes/` header/footer patterns.

#### B. `por-que-agente-nebraska.html` / `en/why-nebraska-agent.html` — 🟠 High

**Purpose:** Trust + “agente de seguros Nebraska” queries; contrast vs. online-only carriers.

**Sections:** 7 benefits, comparison table (agent vs. online), license verification link, CTA.

### 8.2 Nebraska pillar blog posts (Phase 2–3)

Publish **ES + EN** for each. Add to `blog.html` + `sitemap.xml`.

| Order | ES slug | Target keyword | Words |
|-------|---------|----------------|-------|
| 1 | `blog/guia-seguro-gastos-finales-nebraska.html` | seguro de gastos finales Nebraska | 2,000–2,500 |
| 2 | `blog/costo-funeral-nebraska-2026.html` | cuánto cuesta un funeral en Nebraska | 1,500–2,000 |
| 3 | `blog/seguro-vida-comunidad-hispana-nebraska.html` | seguro de vida hispanos Nebraska | 1,500 |
| 4 | `blog/seguro-sin-examen-medico-nebraska.html` | seguro sin examen médico Nebraska | 1,200–1,500 |
| 5 | `blog/mejores-aseguradoras-gastos-finales-nebraska.html` | aseguradoras gastos finales Nebraska | 1,500 |

**Each post must include:**
- Author box (Julie, license #21695431)  
- Article + FAQPage JSON-LD where applicable  
- Internal links (service areas, calculator, contact)  
- End CTA (phone + WhatsApp)  
- Template reference: `blog/blog-template.html`, `tools/blog-build-rules.md`  

**Content note for Hispanic community post:** ITIN vs. SSN — verify carrier acceptance against current appointment guides before publishing; site quote flow already asks citizenship/residency.

### 8.3 Weekly blog integration (ongoing)

Keep weekly industry posts **and** add 1–2 Nebraska pillars per month. Optionally add a “Seguros en Nebraska” tag/filter on `blog.html` when 3+ pillar posts exist.

### 8.4 Landing pages & paid traffic

`landing-gastos-finales.html` already has Nebraska in title/meta — good for ad relevance. Keep **noindex**; do not funnel organic SEO effort here.

---

## 9. Facebook review strategy

GBP is not available. Facebook reviews are the primary **social proof** channel.

| Step | Action |
|------|--------|
| Page | [facebook.com/MejorVidaInsurance](https://www.facebook.com/MejorVidaInsurance) — category: Insurance Agent |
| Review URL | `https://www.facebook.com/MejorVidaInsurance/reviews` |
| Ask timing | After policy issued or positive consultation — not after first call |
| Channels | WhatsApp template, email follow-up (templates in Abacus doc — still valid) |
| On-site CTA | Add review button to `contact.html` + footer (Phase 3) |
| Testimonials | Only with written permission; never fabricate |

---

## 10. Implementation phases

### Phase 1 — Week 1 (foundation) 🔴

| ID | Task | Files |
|----|------|-------|
| P1.1 | Homepage title, meta, H1, hero Nebraska copy, location badge | `index.html`, `en/index.html`, `sources/index.html` |
| P1.2 | All public page titles + meta descriptions (inventory §6) | Core pages ES + EN |
| P1.3 | Schema: telephonic LocalBusiness, remove address, add hours/languages | `index.html`, `en/index.html` |
| P1.4 | GSC verification meta | `index.html` |
| P1.5 | Sync og/twitter tags with new titles | Homepages + key pages |
| P1.6 | Deploy + validate Rich Results Test | — |

### Phase 2 — Weeks 2–3 (structure + pillars) 🟠

| ID | Task | Files |
|----|------|-------|
| P2.1 | Create service areas pages | `areas-de-servicio.html`, `en/service-areas.html` |
| P2.2 | Create why-agent pages | `por-que-agente-nebraska.html`, `en/why-nebraska-agent.html` |
| P2.3 | Footer + nav: Nebraska column, address de-emphasis | `includes/site-footer-inner.html`, `includes/en-site-footer.html`, headers |
| P2.4 | Homepage internal links to new pages | `index.html`, `en/index.html` |
| P2.5 | Sitemap: new URLs + schedule-julie | `sitemap.xml` |
| P2.6 | Pillar blog #1 — Nebraska guide | `blog/…`, `en/blog/…`, `blog.html` |
| P2.7 | Submit sitemap in GSC | — |

### Phase 3 — Week 4+ (content + polish) 🟡

| ID | Task |
|----|------|
| P3.1 | Pillar blog #2 — funeral costs Nebraska |
| P3.2 | Pillar blogs #3–5 (monthly cadence) |
| P3.3 | Image alt text pass (Julie photo, hero, logos) |
| P3.4 | Facebook review CTA block on contact + footer |
| P3.5 | Carrier page title/meta Nebraska pass |
| P3.6 | Monitor GSC Performance monthly; adjust titles if CTR low |

---

## 11. Master task checklist

Copy to track progress:

```
Phase 1 — Foundation
[ ] P1.1 Homepage Nebraska title, meta, H1, badge, hero
[ ] P1.2 All page titles + metas (ES + EN)
[ ] P1.3 Schema telephonic update (remove street address)
[ ] P1.4 Google Search Console verification
[ ] P1.5 OG/Twitter parity
[ ] P1.6 Rich Results validation

Phase 2 — Structure
[ ] P2.1 areas-de-servicio.html + en/service-areas.html
[ ] P2.2 por-que-agente-nebraska.html + en/why-nebraska-agent.html
[ ] P2.3 Footer/nav Nebraska column + address fix
[ ] P2.4 Homepage internal links
[ ] P2.5 Sitemap update
[ ] P2.6 Pillar blog: guía Nebraska
[ ] P2.7 GSC sitemap submit

Phase 3 — Growth
[ ] P3.1 Pillar blog: funeral costs
[ ] P3.2 Pillar blogs 3–5
[ ] P3.3 Alt text pass
[ ] P3.4 Facebook review CTA
[ ] P3.5 Carrier SEO pass
[ ] P3.6 Monthly GSC review
```

---

## 12. Validation checklist

| Check | How |
|-------|-----|
| Title includes Nebraska | View source / browser tab on each money page |
| One H1 per page | DevTools → Accessibility or view source |
| Location badge visible | Homepage hero |
| Schema valid | Rich Results Test on `/` |
| No address in homepage schema | View source — no `PostalAddress` on index |
| Footer no misleading map pin | Visual + source |
| hreflang pairs | ES ↔ EN on new pages |
| Sitemap lists new URLs | Visit `/sitemap.xml` |
| GSC indexed | `site:mejorvidainsurance.com` + GSC Coverage |
| Bilingual parity | Every ES change has EN mirror |

---

## 13. Success metrics

| Timeframe | Target |
|-----------|--------|
| Week 1 | Phase 1 live in production |
| Week 2–3 | New pages indexed; sitemap submitted |
| Month 1–2 | Impressions for “seguro de gastos finales Nebraska” in GSC |
| Month 3 | 5+ Nebraska pillar posts; page 2–3 rankings on long-tail |
| Month 6 | Page 1 for 3–5 Nebraska keywords; organic quote/contact uplift |
| Month 12 | 20+ Nebraska content pieces; steady organic leads |

Track in GA4 (`G-K921EG6JWG`): organic sessions, `quote.html` entries from organic, click-to-call events.

---

## 14. Cursor prompts (ready to paste)

### Prompt A — Phase 1 homepage

```
Implement Phase 1.1 from docs/SEO-PROJECT.md on index.html and en/index.html (and sources/index.html).

Telephonic final expense agency licensed in Nebraska — statewide service by phone, WhatsApp, and video. No walk-in office.

Spanish index.html:
- Title: Seguro de Gastos Finales en Nebraska | Mejor Vida Insurance
- Meta description per SEO-PROJECT.md §6
- H1: Seguro de Gastos Finales en Nebraska: Protege a tu Familia
- Add location badge after H1 using a CSS class in css/ (not inline styles)
- Mention Nebraska in hero paragraph
- Update og:title, og:description, twitter tags to match

Mirror all structural changes on en/index.html in English.
Do not remove existing FAQPage or InsuranceAgency schema — we'll update schema in a separate task.
```

### Prompt B — Phase 1 all titles

```
Implement Phase 1.2 from docs/SEO-PROJECT.md: update title tags and meta descriptions on all public indexable pages (ES + EN) per the Page inventory table. Skip noindex pages (quote, landing-gastos-finales, staff, previews). Update og/twitter where present.
```

### Prompt C — Phase 1 schema

```
Implement Phase 1.3 from docs/SEO-PROJECT.md: update InsuranceAgency JSON-LD on index.html and en/index.html.
Telephonic agency — remove PostalAddress from schema, add knowsLanguage, openingHoursSpecification, LocalBusiness type. Keep areaServed Nebraska. Validate mentally against Google guidelines.
```

### Prompt D — Service areas page

```
Implement Phase 2.1 from docs/SEO-PROJECT.md: create areas-de-servicio.html and en/service-areas.html.
Match existing site design (about-julie.html patterns, includes header/footer). Full content structure in SEO-PROJECT.md §8.1A. FAQPage schema. Add to nav footer column and sitemap.xml.
```

---

## 15. File reference

| Purpose | Path |
|---------|------|
| **This project plan** | `docs/SEO-PROJECT.md` |
| Earlier SEO work log | `docs/SEO-Priority1-Changes.md` |
| Sitemap | `sitemap.xml` |
| Robots | `robots.txt` |
| ES header include | `includes/site-header-inner.html` |
| EN header include | `includes/en-site-header.html` |
| ES footer include | `includes/site-footer-inner.html` |
| EN footer include | `includes/en-site-footer.html` |
| Blog build rules | `tools/blog-build-rules.md` |
| SEO script (GA4/defer) | `scripts/apply-seo-performance.js` |
| Abacus original (external) | `~/Desktop/cursor_seo_implementation_guide.pdf` |

---

## 16. Notes & decisions log

| Date | Decision |
|------|----------|
| 2026-06-08 | Project plan created from Abacus outline + codebase audit |
| 2026-06-08 | Keep `quote.html` noindex — SEO focus on homepage + pillars |
| 2026-06-08 | Use existing `final-expense-estimator.html` instead of creating `calculadora.html` |
| 2026-06-08 | Footer address de-emphasis approved in plan; legal address remains on privacy/terms |
| 2026-06-08 | GA4 already live — GSC verification still needed |

---

*End of SEO Project Plan — update this file as tasks ship or strategy changes.*
