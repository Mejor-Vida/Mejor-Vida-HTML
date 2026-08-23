# Facebook post rules — Mejor Vida Insurance

This document is the **default standard** for Cursor and collaborators whenever we **create, preview, or publish** a Facebook post for Mejor Vida Insurance.

---

## Goal

These Facebook posts are **not** only for traffic. They are designed to **create engagement** and move people into our **ManyChat → WhatsApp → qualification → website/scheduling** funnel.

---

## Core strategy

- Maximize organic Facebook reach
- Avoid link suppression in the main caption
- Use value-first content
- Trigger comments and/or private messages
- Move interested people into our automated ManyChat / WhatsApp flow
- Build trust with Spanish-speaking families
- Keep the tone human, simple, and helpful
- Create posts that lead to **conversations**, not just clicks

**Final rule:** Default to posts that generate **conversations and qualified leads**, not just blog traffic.

---

## Audience

- Spanish-speaking families
- Many are **not** insurance experts
- Many prefer **private messaging** over public commenting
- They care about protecting family, avoiding financial stress, understanding coverage, and making wise decisions
- Write for **normal people**, not agents, regulators, or insurance insiders

### Topic scope (hard rule)

Weekly Facebook posts **and** the Sunday client newsletter must be about **life insurance or final expense only**:

- **Allowed:** final expense / burial / funeral funding, term life, whole life, IUL, annuities, and consumer-protection news tied to those products
- **Not allowed as the post or email topic:** Medicare, Medigap, Medicare Advantage, Med Supp shopping, Part A/B/D news, LTC as a product line, auto/home

Do **not** publish or import a weekly package whose caption/subject is primarily Medicare/Medigap. The import APIs reject those topics.

---

## Primary business goal

Get readers to:

1. Comment with a **keyword**, **or**
2. Send a **direct message**, **then**
3. Enter our ManyChat / WhatsApp qualification flow, **then**
4. Be directed to our website or scheduling flow if qualified

---

## Post structure (required parts)

### 1. Hook

- First **1–2 lines** must stop the scroll
- Must feel **personal**, **emotional**, or **curiosity-based**
- Must sound relevant to **real families**
- Should raise a real-life concern, confusion, or consequence
- **Do not** open like a report title, blog title, or article summary
- **Do not** sound like a newsletter or news bulletin

**Avoid weak openings such as:**

- “Esta semana te resumimos…”
- “En este artículo…”
- “Nuevo blog…”

**Better style:**

- Questions
- Real-life tension
- “Muchas familias no se dan cuenta de…”
- “¿Y si…?”
- “¿De verdad entiendes…?”

### 2. Value / meat

- Give **2–4** short, high-value points
- Explain the issue in **plain Spanish**
- Focus on **why it matters in real life**
- Translate technical insurance news into **simple everyday language**
- Use short paragraphs or bullets for **mobile** readability
- No dense blocks of text
- No unnecessary jargon or acronyms
- If a technical term must appear, **explain it simply**

### 3. Trust line

- Include at least one line that positions Mejor Vida Insurance as **helpful**, not pushy
- Tone: **trustworthy**, **calm**, **educational**, **human**

**Example style:**

- “No estamos aquí para venderte algo que no necesitas.”
- “Estamos para ayudarte a entender y tomar una buena decisión.”

### 4. CTA (very important)

Use a **dual CTA** whenever possible:

- One keyword for people who want the **article / information**
- One keyword for people who want **help with their own situation**

**Preferred keyword model:**

| Keyword   | Meaning |
|-----------|---------|
| **INFO**  | Send article / breakdown |
| **REVISAR** | Review their situation / coverage |

**Example CTA style:**

> Comenta “INFO” si quieres el artículo completo  
> o “REVISAR” si quieres que veamos tu caso contigo.

Also allow a **private-message** option (many people prefer not to comment publicly):

> También puedes mandarnos mensaje directamente.

If a post fits **one** keyword better, choose the one that best supports **lead intent**.

### 5. No links in the main post

- **Do not** place blog links in the **main Facebook caption**
- The main caption should avoid obvious “exit” signals
- No “click the link,” “visit the website,” or similar in the main caption
- **The link goes in the follow-up comment only** (see below)

### 6. Ten-minute follow-up comment

Every post must include a **separate first comment** to be posted **after** the main post goes live.

**Purpose:**

- Capture people who want to learn more or contact you
- Add the **website URL** (`https://www.mejorvidainsurance.com/`) **after** the post has had time to gain organic reach
- Full weekly articles go through **INFO / REVISAR** (ManyChat), not the first comment link

**Format:**

- Warm, human tone (similar spirit to our standard Make follow-up — thanks, helpful, not pushy)
- **Adaptable** to the post: one short paragraph about the topic or tool (e.g. NAIC locator for lost policies)
- **~8 lines** total (short paragraphs; blank line between blocks is OK)
- Include the **Mejor Vida website link** (not the blog article URL)
- Close with phone / WhatsApp number — **no** long `wa.me` URL in the first comment (INFO/REVISAR handles deep links)

**Example style (June 7 — lost life insurance / NAIC locator):**

> ¡Gracias por tu interés!
>
> Si comentaste INFO o quieres profundizar en pólizas que muchas familias no reclaman, visita nuestro sitio web:  
> https://www.mejorvidainsurance.com/
>
> Afortunadamente, existe una herramienta gratuita llamada Life Insurance Policy Locator Service (https://eapps.naic.org/life-policy-locator/#/welcome) creada por la NAIC.
>
> En Mejor Vida nos especializamos en gastos finales, y también en seguro de vida a término y vida entera.
>
> ¿Preguntas o cotización sin costo? Llámanos o WhatsApp al (402) 440-5438.

Configured in `facebook-posting/scripts/facebook_post_package.py` (`warm_first_comment`). WhatsApp: `whatsapp_first_comment_url` in `config/settings.json` or env `MVS_WHATSAPP_FIRST_COMMENT_URL`.

**Publishing automation:** After the approved weekly digest and story images are live, `api/weekly-facebook-cron.js` publishes three Spanish posts (Sunday as soon as the blog exists, Tuesday 10:00 a.m. Chicago, Thursday 10:00 a.m. Chicago) and posts the first comment about 10 minutes later. See `tools/weekly-newsletter/FACEBOOK_AUTOMATION.md`. Do not wait for a separate Tuesday/Thursday prompt. Legacy Make.com delay: **`integrations/MAKE_COM_FB_FIRST_COMMENT.md`**.

---

## Language and tone

- Natural, clear **Spanish**
- Simple wording, about **6th–8th grade** reading level
- Sound like a **real person** speaking to a family, not a corporation
- Warm, clear, trustworthy, conversational
- No robotic language
- No corporate jargon
- No report-style writing
- No stiff or overly formal tone
- No hypey “marketing bro” style
- No cheesy urgency
- No fear manipulation
- **No emojis** unless explicitly requested
- Prefer **short lines** and **short paragraphs** for Facebook mobile readability

---

## Compliance / safety

- Do **not** make promises about coverage, approval, or pricing
- Do **not** imply guaranteed outcomes
- Do **not** sound like legal or regulatory advice
- Keep content **educational** and **trust-building**
- Encourage questions and conversations, not pressure
- Do **not** use manipulative or misleading language

---

## Content positioning

- Write for **consumers and families**, not industry professionals
- Always answer: **“Why should this matter to me or my family?”**
- Focus on protection, understanding, peace of mind, and avoiding mistakes
- Prefer **everyday examples** over technical descriptions
- Avoid overusing insider terms such as **NAIC**, **LIMRA**, **underwriting**, **indexed annuity illustrations** unless absolutely needed — and if used, **explain simply**

---

## CTA / funnel (ManyChat / WhatsApp)

- Posts are part of a **ManyChat / WhatsApp qualification** funnel
- The post should create enough **trust** and **curiosity** for someone to comment or message
- Comment keywords should **route** into the right automation
- **INFO** → article / education path
- **REVISAR** → review / help / qualification path

---

## Hashtags

- **3–5 hashtags** maximum
- Relevant and readable
- Prefer tags such as: `#SeguroDeVida` `#GastosFinales` `#ProtegeATuFamilia` `#FamiliaHispana` `#TranquilidadFinanciera`
- Do not overload
- Avoid random or overly broad tags

---

## Image (for each post)

For each Facebook post, also generate an **image concept or prompt**. The image should:

- Feel **native** to Facebook
- **Not** look like generic corporate stock
- Support the **emotional / message** angle of the post
- Be simple, clean, and easy to understand
- Fit a **Spanish-speaking family insurance** audience

**Possible styles:** clean infographic, action-oriented family/life scene, high-trust visual, article-themed without looking too corporate.

---

## Output required for each weekly post

Whenever generating a **weekly** Facebook post, produce **all** of the following:

1. **Main Facebook caption** (no link; follows structure above)
2. **Shorter alternate caption**
3. **First follow-up comment** with the blog URL
4. **Suggested image concept / prompt**
5. **Recommended keyword(s)** for ManyChat routing
6. **Optional pinned comment** if helpful

---

## Default writing order

1. Hook  
2. Simple value  
3. Trust line  
4. CTA (dual when possible + DM option)  
5. Hashtags (if used in caption per strategy)  
6. **Follow-up comment with link** — documented separately, not in main caption

---

## Bad examples (avoid)

- “Esta semana te resumimos…”
- “Lee nuestro nuevo blog…”
- “Haz clic en el enlace…”
- “Visita nuestro sitio web…”
- Posts that read like reports or newsletters
- Long technical summaries with acronyms
- Captions written for **agents**, not families

---

## Good examples (aim for)

- Feels like a **caring expert** explaining something important
- Connects insurance news to **real family** concerns
- Makes it **easy** to comment or message
- Moves naturally into **WhatsApp / ManyChat** conversations

---

## How Cursor should use this file

- Treat this as the **standing rulebook** for all Facebook post **generation**, **preview** copy checks, and **publish** workflows in this project.
- The **`facebook-posting`** pipeline uses a **`FacebookPostPackage`** (main caption, `first_comment` with link, alternate, image prompt, ManyChat keywords). Exports: **`FB/post-preview.html`**, **`FB/post-package.json`**. Publishing uses **`publish_post_package`** (main + optional first comment via Graph API).
