# Page → script

How to turn a Mejor Vida **teaching page** into a talking-head script. Read [AVATAR-JULIE-ASSISTANT.md](../../../AVATAR-JULIE-ASSISTANT.md) first. Do not start HeyGen here.

The homepage is a hub to other pages. **Teaching pages first** (product, cost-type, evergreen guide, carrier, quote explainer, seniors guide). One lesson per unique topic — not one clip reused, and not a near-clone for every `$5,000` / `$10,000` URL.

## Stage 1 — Qualify

Name the Spanish URL and its `en/` pair.

**Teaching page?** It explains a topic a searcher would type (what it is, how it works, who it is for, what to watch out for). If the page is mainly links to other pages, stop and say so.

**Cluster?** If a sibling URL would reuse ~80% of the same lecture (amount templates, thin variants), do **not** script this URL. Point to the parent/type page instead.

**Skip:** `index.html`, `landing-gastos-finales.html` (keep the live WhatsApp intro), privacy/terms/SMS, thank-you, `buscar-sitio.html`, weekly news blogs, `sources/`.

## Stage 2 — Strip chrome, find the spine

Read the HTML **and** the live page. Ignore:

- Header, footer, language fab, chat, WhatsApp
- Seniors quote-rail chrome (the form is a tool, not the lesson)
- Hub cards that only send people to other URLs (product tiles, “guías,” “por estado”)
- Repeated CTAs, JSON-LD, comments

The lesson starts at the **article H1**, then H2/H3 in order, then FAQs that actually teach. Cost tables and carrier examples are facts to **summarize**, not to read cell by cell.

Write a **spine**: ordered list of what the article teaches, in page order. Drop nav. Merge duplicate CTAs into one close later.

## Stage 3 — Breakdown (not a script)

Fill this template. Facts only from the page. Flag holes instead of inventing.

```markdown
# Page breakdown: [slug]

- **URL ES:**
- **URL EN:**
- **Teaching page?** yes / no (if no, stop)
- **Cluster?** none / parent URL to film instead
- **Viewer job:** what they came to understand or decide
- **One-sentence video job:** After this video, a YouTube searcher should understand ___ . A site visitor should be ready to ___ on this page.
- **YouTube working title:** topic language, not “video de [internal page name]”
- **Search angles:** 3–6 queries in Spanish
- **Runtime budget:** 90–180s (or ≤60s if still on HeyGen Free)
- **Spoken-word budget:** ~130 words per minute

## Teaching spine (page order)

1. …
2. …

## Map to the persona ladder

Use only the rungs this page actually teaches. Leave the rest blank.

| Ladder | From this page |
| --- | --- |
| What is it? | |
| Why does it matter? | |
| How does it work? | |
| What does the viewer need to know? | |
| Mistakes / misunderstandings to avoid | |
| What to consider next | |

## Terms to define once

- term → plain-language definition (from the page)

## Must-keep facts (page only)

- …

## Do not say

- Invented premiums, approval odds, licensed-state roster (unless this is the licenses page)
- “Soy Julie” / fake credentials
- Visual cues (“como se ve en la gráfica”)
- Hub-card tour of other pages
- Anything not on this page

## Chrome ignored (so we do not film it)

- …

## Open questions / page issues

- …
```

**Stop.** Do not write the script until the user accepts this breakdown.

## Stage 4 — Script from the breakdown only

Do not go back to the page to add extra topics. If the breakdown was wrong, revise the breakdown first.

Persona: experienced professional across the table — not a lecture, brochure, or ad. Agency locks in the avatar file always apply. They override this section if anything conflicts.

Spoken language: Spanish, **usted**. Define each term the first time. Teach first; one close at the end.

### Storytelling, voice, and flow

Do not convert the webpage into spoken paragraphs. Transform the approved breakdown into an educational YouTube story she can say sitting across from the viewer.

The **first script you hand over** must be polished narration — not an outline, not a rough read-aloud of H2s. Julie still approves it before HeyGen. Do not skip the breakdown stage to get there.

- Begin with a curiosity hook taken from the page when the lesson needs one. She may open: “Hola. Soy Jhenny, la asistente educativa de Mejor Vida Seguros.” Never “soy Julie.” Never “Jhenny Antiques.” Never claim to be a licensed agent.
- After the hook or greeting, she speaks as Jhenny of **Mejor Vida Seguros**.
- Use **one** simple, realistic through-line if the page supports it (a family that heard one number, a person choosing a path). No named tragedy, no invented biography, no fear-of-funeral pitch, no fake quotes.
- Warm, natural, conversational Spanish with **usted**. Short and medium sentences for HeyGen. No slang, no Spanglish, no newsletter openers.
- If a line sounds like a report, a translation, a webpage, or a chatbot, rewrite it.
- Connect every beat with a spoken transition. Do not start each block as a new article H2.
- Explain figures: what the option includes, why it costs more or less, then the number and its year. Do not dump a list of prices.
- Brief recap, then a natural bridge from the lesson into the cotización (help, not a commercial).
- Talking-head only: sequence with speech. No “como se ve,” no slides, no shot list.
- Preserve every verified fact, figure, date, source, and qualification from the approved breakdown. Do not invent information.
- Before handing the script over, read it as spoken dialogue and fix anything stiff, abrupt, repetitive, or robotic.

Analogies only if they stay accurate (do not flatten waiting periods or graded benefits).

Fill this template:

```markdown
# Script: [YouTube working title]

- **Page:** [ES URL]
- **Breakdown:** accepted [date]
- **Audience:** people who searched this topic (may never open the site)
- **Target length:** [seconds] (~[N] spoken words)
- **Presenter:** Beatriz Office 1 / Jhenny (locked) / Avatar III / Mejor Vida Seguros assistant

## Beats

1. **[Label]** — Viewer should understand: …
2. **[Label]** — …
3. **Cierre** — Viewer should know Mejor Vida Seguros and how to get a cotización gratis.

## Spoken script

### [Beat 1 label]
[Spanish lines]

### [Beat 2 label]
[Spanish lines]

### Cierre y cotización
[Teach-first close: quote at mejorvidaseguros.com (Spanish) or mejorvidainsurance.com (English later), phone / WhatsApp (402) 440-5438. Help, not a commercial.]

## YouTube packaging (draft)

- **Title:** topic query language (what someone would type), not “video de [internal page name]”
- **Description:** 2–4 sentence lesson summary; chapters (`0:00` first); quote URL; site; phone/WhatsApp; licenses page; playlist; avatar disclosure (“asistente educativa de Mejor Vida Seguros”). Do not add “No es Julie Braunsroth.”
- **Captions:** Spanish VTT from the approved spoken script
- **Playlist:** Guías educativas | Mejor Vida Seguros
- **Spoken word count:**
- **Estimated runtime:**
```

Beat labels follow the accepted ladder (for example *Qué es*, *Por qué importa*, *Cómo funciona*, *Qué hay que saber*, *Errores comunes*, *Cierre*). Do not add a “how to use this website” tour unless that **is** the page’s job.

**Stop.** HeyGen only after the user accepts the script. No public file while HeyGen Free still watermarks it.

## Checks before handing a script over

- [ ] Unique lesson for this page (not a hub tour, not an amount-clone)
- [ ] Stands alone on YouTube (not “pause and read the article”)
- [ ] Opens on a curiosity hook, not a job title or company intro
- [ ] Sounds spoken (usted); no report/webpage/chatbot lines
- [ ] Smooth transitions; recap; bridge into the CTA
- [ ] No facts that were not in the approved breakdown
- [ ] Terms defined once
- [ ] No “soy Julie,” no fake credentials, no licensed-state list (unless licenses page)
- [ ] No visual directions
- [ ] CTA is last and sounds like the next helpful step
- [ ] Word count fits the runtime budget
- [ ] Read-aloud pass done (nothing stiff, abrupt, repetitive, or robotic)
