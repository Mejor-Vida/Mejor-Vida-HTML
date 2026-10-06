# Page → script

How to turn a Mejor Vida **teaching page** into a talking-head script. Read [building-style.md](building-style.md) first. Julie records herself after the Spanish script is accepted — not HeyGen.

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

The **breakdown spine** starts at the article H1, then H2/H3 in order, then FAQs that actually teach. That order is for extracting facts. Cost tables and carrier examples are facts to **summarize**, not to read cell by cell.

Write a **spine**: ordered list of what the article teaches, in page order. Drop nav. Merge duplicate CTAs into one close later.

The **spoken script** must not follow that spine as a tour of the webpage. Reorganize into a YouTube story from the page’s main idea (hook, through-line, mix-up unpacked, recap, locked close). See [building-style.md](building-style.md). Cap **under 4 minutes** unless Julie accepts a longer wording first.

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
- **Main idea:** one sentence. Not an H2 tour.
- **Three supporting ideas:** (1) … (2) … (3) …  — these become the intro map and the three body sections. Not the page’s heading list. Drop extra topics rather than adding a fourth.
- **YouTube working title:** topic language, not “video de [internal page name]”
- **Search angles:** 3–6 queries in Spanish
- **Runtime budget:** 90–180s (or under 4 minutes if Julie accepts a longer wording)
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

## Stage 4 — English script from the breakdown only

Do not go back to the page to add extra topics. If the breakdown was wrong, revise the breakdown first.

Persona: experienced professional across the table — not a lecture, brochure, or ad. Agency locks in the avatar file always apply. They override this section if anything conflicts.

Follow [building-style.md](building-style.md) on the first draft: English first, clarity before word count, name the class then the examples, YouTube standalone (no “this page”), jobs before labels, unpack webpage slogans, full contrasts, locked close.

### Storytelling, voice, and flow

Do not convert the webpage into spoken paragraphs. Transform the approved breakdown into an educational YouTube story she can say sitting across from the viewer.

The **first English script you hand over** must be polished narration — not an outline, not a telegram, not a rough read-aloud of H2s. Julie still approves English, then Spanish, before she records. Do not skip the breakdown stage to get there.

- Begin with a curiosity hook taken from the page when the lesson needs one. English draft: “Hi. I’m Julie with Mejor Vida Insurance.” Spanish later: “Hola. Soy Julie de Mejor Vida Seguros.” She may say she is the founder and a licensed agent. Do not list licensed states except on the licenses page. Never claim a fake credential.
- After the hook or greeting, she speaks as Julie of the agency (Insurance on the English draft, Seguros on the Spanish film).
- Use **one** simple, realistic through-line if the page supports it (a family that heard one number, a person choosing a path). No named tragedy, no invented biography, no fear-of-funeral pitch, no fake quotes.
- Warm, natural, conversational speech. Short and medium sentences she can say to camera — not a string of five-word punches. No slang, no Spanglish, no newsletter openers.
- If a line sounds like a report, a translation, a webpage, or a chatbot, rewrite it. If “some contracts” could mean anything, name the funeral-home contract.
- Connect every beat with a spoken transition. Do not start each block as a new article H2.
- When two options get confused, say why they sound alike, what each one actually is, and when the difference shows up.
- Explain figures: what the option includes, why it costs more or less, then the number and its year. Do not dump a list of prices.
- Brief recap of this lesson, then the **locked close** from `AVATAR-JULIE-ASSISTANT.md` (verbatim). Do not write a custom CTA. Do not say the agency does not sell funeral-home contracts.
- Talking-head only: sequence with speech. No “como se ve,” no slides, no shot list.
- Preserve every verified fact, figure, date, source, and qualification from the approved breakdown. Do not invent information.
- Before handing the script over, read it as spoken dialogue and fix anything stiff, abrupt, repetitive, robotic, or missing a subject.

Analogies only if they stay accurate (do not flatten waiting periods or graded benefits).

**Stop after English.** Do not write the Spanish file until Julie accepts this draft.

Fill this template:

```markdown
# Script: [YouTube working title]

- **Page:** [ES URL]
- **Breakdown:** accepted [date]
- **Audience:** people who searched this topic (may never open the site)
- **Target length:** [seconds] (~[N] spoken words)
- **Presenter:** Julie Braunsroth on camera (Voice Prompter). Not HeyGen / Jhenny.
- **Language of this file:** English approval draft. Do not film this text. Spanish **usted** only after Julie accepts this draft.

## Beats

1. **[Label]** — Viewer should understand: …
2. **[Label]** — …
3. **Close** — Short recap of this lesson, then the locked close.

## Spoken script

### [Beat 1 label]
[English lines — full thoughts, named subjects. See building-style.md]

### [Beat 2 label]
[English lines]

### Close and quote
[1–3 recap sentences for this lesson only. Then paste the English locked close from building-style.md / AVATAR-JULIE-ASSISTANT.md.]

## YouTube packaging (draft)

- **Title:** topic query language (what someone would type), not “video de [internal page name]”
- **Description:** 2–4 sentence lesson summary; chapters (`0:00` first); quote URL; site; phone/WhatsApp; licenses page; playlist; avatar disclosure (“asistente educativa de Mejor Vida Seguros”). Do not add “No es Julie Braunsroth.”
- **Captions:** Spanish VTT from the approved spoken script
- **Playlist:** Guías educativas | Mejor Vida Seguros
- **Spoken word count:**
- **Estimated runtime:**
```

Beat labels follow the accepted ladder (for example *What it is*, *Why it matters*, *How it works*, *What they need to know*, *Mistakes to avoid*, *Close*). Spanish labels after translation. Do not add a “how to use this website” tour unless that **is** the page’s job.

**Stop.** Do not write Spanish. Do not start recording.

## Stage 5 — Spanish after English is accepted

Translate the accepted English. Do not add topics. Keep usted. Agency **Mejor Vida Seguros**, site **mejorvidaseguros.com**, opening “Hola. Soy Julie de Mejor Vida Seguros.” Paste the Spanish locked close from `AVATAR-JULIE-ASSISTANT.md`. Same building-style rules: do not telegram the Spanish to save seconds.

**Stop.** Julie records in Voice Prompter only after she accepts the Spanish script. Then upload the take in the CRM YouTube tab for script-vs-voice cuts, review, optional background, YouTube, and the `.lic-lesson-video` page embed.

## Checks before handing an English script over

- [ ] Unique lesson for this page (not a hub tour, not an amount-clone)
- [ ] Stands alone on YouTube (not “pause and read the article”; no “this page” / sample tabs / other-guide tour)
- [ ] Organized as a lesson (two questions, jobs, then examples), not as a walk of the article H2s
- [ ] Company rules said as jobs first; no unexplained “list”
- [ ] Class named first; one FAQ or query is an example, not the whole video
- [ ] Opens on a curiosity hook, not a job title or company intro
- [ ] Sounds spoken; no report / webpage / chatbot / telegram lines
- [ ] Every “some / they / it / this / that home” has a named subject
- [ ] Two-path contrasts say why they sound alike, what each one is, and when the difference shows up
- [ ] Webpage slogans were unpacked (examples, then the term)
- [ ] Federal vs state (or any paired rules) said on both sides
- [ ] Smooth transitions; recap; then the locked close (verbatim)
- [ ] No facts that were not in the approved breakdown
- [ ] Terms defined once
- [ ] Julie may say she is Julie, founder and licensed agent of Mejor Vida Seguros; no licensed-state list (unless licenses page)
- [ ] No visual directions
- [ ] Locked close is last; no “we do not sell funeral-home contracts”
- [ ] Length was not cut at the expense of context; extra *topics* were dropped instead
- [ ] Read-aloud pass done (nothing stiff, abrupt, repetitive, robotic, or missing a subject)
