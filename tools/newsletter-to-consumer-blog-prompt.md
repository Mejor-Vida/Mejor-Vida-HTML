# Newsletter → consumer blog post (prompt template)

Use this when converting an **insurance newsletter** into a **clear, structured blog article** for the public site—**not** the same workflow as the weekly **industry update** HTML for agents (`tools/blog-build-rules.md`).

Copy everything below the line into chat (or Cursor), replace `[PASTE NEWSLETTER HERE]` with the newsletter text.

---

## Prompt (copy from here)

Convert the following insurance newsletter into a clear, structured blog post for my website.

Do **NOT** overly summarize. Preserve the full meaning, context, and important details, but rewrite it in a way that is easy for a general audience (**middle school reading level**) to understand.

Use a structured format similar to a simple research paper:

### Title

Clear, engaging, and benefit-driven.

### Introduction (Hook + Context)

- Start with a strong hook (question, surprising fact, or relatable problem).
- Clearly explain what the article is about.
- Make the reader want to continue.

### Body (Organized Sections)

- Break into **2–4 sections** with clear subheadings.
- Each section should explain **one key idea**.
- Use simple language and short paragraphs.
- Add brief explanations where needed so nothing feels confusing or out of context.
- Avoid jargon—or **explain it** if you must use a term.

### Conclusion (Takeaway + Action)

- Summarize the key point clearly.
- Reinforce why it matters to the reader.
- End with a **soft call to action** related to insurance planning.

### Style guidelines

- Write in a **warm, professional, and trustworthy** tone.
- Do **NOT** sound robotic or overly academic.
- Do **NOT** remove important context.
- Do **NOT** compress multiple ideas into one sentence.
- Keep paragraphs short and easy to read.
- Make it feel like you are explaining this to a **real person**, not writing an abstract.

### Audience

- Write for **everyday people** (especially **Spanish-speaking or bilingual families** in the U.S.).
- Assume they are **not** experts in insurance.

### Optional: Spanish

If the site needs **Spanish** as well as English, produce a **full Spanish version** with the same section structure and depth—not a short summary. (For bilingual **HTML** pages with `data-lang` toggles, follow `tools/blog-build-rules.md` after drafting the copy.)

---

## Newsletter to convert

[PASTE NEWSLETTER HERE]

---

## After you get the draft

- If this becomes a **static HTML** page on mejorvidainsurance.com, match existing site typography, nav, and footer patterns (see `blog.html` or `index.html` as needed).
- If this is a **weekly industry/agent** post with JSON-LD and paired EN/ES markup, use **`tools/blog-build-rules.md`** instead of this consumer prompt.
