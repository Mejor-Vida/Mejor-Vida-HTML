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

Do **not** use “Comenta INFO” / “REVISAR”. Those words do not send the article or open a quote.

**Main caption (no URLs):** one warm close + how to reach the agency. Phone is the primary ask. Invite a real comment if they have a question (the Page can reply). Then 3–5 hashtags.

**Example close:**

> Si quieres el artículo, una cotización gratis, o hablar con nosotros — estamos aquí, sin presión.
>
> Llama, texto o WhatsApp al (402) 440-5438  
> Correo: Julie@mejorvidainsurance.com
>
> Si te queda una duda, déjala en los comentarios y te respondemos.

**First comment (where the links go):**

- Weekly **article** URL for that story  
- **Quote:** https://www.mejorvidainsurance.com/quote.html  
- **Site:** https://www.mejorvidainsurance.com/  
- Phone / WhatsApp (402) 440-5438 and Julie@mejorvidainsurance.com  

Do not say “haz clic en el enlace” in the main caption. Facebook downranks obvious exits; the first comment is the click path.

### 5. No links in the main post

- **Do not** place blog links in the **main Facebook caption**
- The main caption should avoid obvious “exit” signals
- No “click the link,” “visit the website,” or similar in the main caption
- **The link goes in the follow-up comment only** (see below)

### 6. Ten-minute follow-up comment

Every post must include a **separate first comment** to be posted **after** the main post goes live.

**Purpose:**

- Put the **article**, **quote tool**, and **website** where people can tap them, after the post has started getting reach
- Repeat phone / WhatsApp / email for people who skip the caption

**Format:**

- Article URL for this story (own line)
- Quote: https://www.mejorvidainsurance.com/quote.html
- Site: https://www.mejorvidainsurance.com/
- Phone / WhatsApp (402) 440-5438 and Julie@mejorvidainsurance.com

See `lib/weekly-facebook-compose.js` (`defaultFirstComment`).

**Publishing automation:** After the approved weekly digest and story images are live, `api/weekly-facebook-cron.js` publishes three Spanish posts (Sunday as soon as the blog exists, Tuesday 10:00 a.m. Chicago, Thursday 10:00 a.m. Chicago) and posts the first comment about 10 minutes later. See `tools/weekly-newsletter/FACEBOOK_AUTOMATION.md`. Do not wait for a separate Tuesday/Thursday prompt.

**Comment replies:** The existing Page webhook (`/api/meta-leadgen-webhook`) watches new comments and answers with the **same public RAG chatbot** as the website (`runRagPipeline`). Bare **INFO** still gets the article link; bare **REVISAR** is invited to WhatsApp `(402) 440-5438`. Any real question in the comment is answered from the public knowledge base (Markdown stripped for Facebook). Pause with `FACEBOOK_COMMENT_AI_REPLY=0`. The Page never replies to its own comments.

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

## CTA / funnel

- Caption: phone / WhatsApp / email so people can contact without leaving Facebook
- First comment: article, free quote, and website
- Real questions in the comments can be answered by the public RAG chatbot after that is turned on
- Do not ask people to comment INFO or REVISAR

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
