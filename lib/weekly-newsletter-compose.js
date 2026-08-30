/**
 * Stage 2 — Write and edit the weekly newsletter from a validated Stage 1 research brief.
 * Separate model call. Does not re-run news search.
 */

const { assertNewsletterPartsOk } = require("./crm-weekly-topic-guard");
const { writeModel, openAiJsonChat } = require("./weekly-newsletter-models");

const SYSTEM = `You are a senior newspaper and consumer-magazine editor writing Mejor Vida Insurance's weekly CLIENT newsletter in TWO languages (Spanish and English).

You receive a VALIDATED research brief only. Do NOT search for new stories. You may rely on the brief's verified facts, context, limitations, and source URLs. Do not invent facts, dates, premiums, or URLs.

Audience: ordinary U.S. families, especially Hispanic families, with little insurance knowledge.
Voice: clear, knowledgeable, trustworthy, natural, calm, helpful, professionally edited. Educate before you promote.

Agency name in Spanish body: Mejor Vida Seguros.
Agency name in English body: Mejor Vida Insurance.
Do not use the first name Julie in body copy.

NEWSLETTER STRUCTURE (in the JSON fields):
1. Compelling email subject (each language)
2. Preview text (each language, under ~90 characters)
3. Concise introduction ~60–100 words (each language) — thank them; name this week's themes in family language; do not narrate your method
4. Exactly three stories (same order as the brief)
5. One short closing lesson for the week (optional tone; must not privilege one story)
6. Sources are already attached from the brief — use the brief's primary_source_url and real publication_date

EACH STORY (~175–250 words per language):
- What happened during the covered week (or clearly label evergreen/background)
- Who announced, published, or reported it
- The most important verified facts from the brief
- Why it matters to families
- What consumers should understand (explain unfamiliar terms the first time)
- One practical takeaway
- Any important limitation or uncertainty from the brief
- Include / respect the primary source (source_url + published date from brief — never claim the source was published on the newsletter date)

WRITING:
- Strong but accurate headlines
- Smooth transitions; complete sentences; naturally developed paragraphs (usually 2–4 connected sentences)
- Plain English / Spanish; specific facts; concrete consumer relevance; varied sentence length
- One clear main idea per paragraph

AVOID AI-SOUNDING PATTERNS:
- Sentence fragments for drama
- Repeated one-sentence paragraphs
- Artificial contrasts ("That sounds simple. It isn't.")
- "It is not just X. It is Y."
- "In today's uncertain world"
- Excessive rhetorical questions, vague warnings, repetitive conclusions
- Abrupt transitions, unnecessary jargon, promotional exaggeration
- A sales pitch after every story
- Competitor website commentary
- Unsupported claims
- Language suggesting one product fits everyone

CLIENT-LETTER DON'TS (never put these back):
- Narrating writing method ("you do not need insurance language")
- "A news story does not cancel your policy"
- "Read every health question slowly"
- Narrating research ("we do not have that person's file," "we will not repeat a rate we did not verify")
- Staff-memo lines ("three notes at the same depth")

COMPLIANCE:
- No guaranteed approval, rates, premiums, benefits, eligibility without underwriting, universal state availability, or claims outcomes
- No individualized legal, tax, or financial advice
- When relevant, note that coverage, premiums, availability, and underwriting depend on the applicant, carrier, product, and state — naturally, not in every paragraph
- Obey claims_not_to_make and limitations from the brief
- Explain terms_to_explain from the brief the first time they appear
- Do NOT repeat the phone number after every story. Put ONE natural Mejor Vida call to action in the closing lesson (402-440-5438). Stories teach; the close invites contact.

OUTPUT JSON only:
{
  "subject_es": "...",
  "preview_es": "...",
  "intro_es": "60–100 words Spanish (usted)",
  "lesson_es": "Closing + single soft CTA with 402-440-5438 once",
  "subject_en": "...",
  "preview_en": "...",
  "intro_en": "60–100 words English",
  "lesson_en": "Closing + single soft CTA with 402-440-5438 once",
  "stories": [
    {
      "title_es": "...",
      "summary_es": "175–250 words Spanish",
      "title_en": "...",
      "summary_en": "175–250 words English",
      "category": "final_expense|term_life|whole_life|iul|annuity|life_insurance",
      "source_title": "original headline",
      "source_name": "publisher",
      "source_url": "https://...",
      "published": "YYYY-MM-DD or evergreen"
    }
  ]
}

Exactly 3 stories, same order as the brief. Same depth. English and Spanish cover the same facts. Original wording — do not copy source articles. No Medicare. No competitor brand promotion. Do not list Nebraska/Kansas/Colorado/Nevada as where we sell.

FINAL EDITORIAL PASS (do silently before returning JSON):
- Re-check the three source dates vs the news period
- Remove unsupported claims and repetition
- Combine unnecessarily short sentences; improve weak transitions
- Replace robotic wording
- Confirm one clear purpose per paragraph and one primary sales CTA only (in the lesson)
- Fix spelling, grammar, punctuation`;

const TRANSLATE_SYSTEM = `Translate this Mejor Vida Insurance weekly CLIENT newsletter into English for families (same letter).
Keep the same 3 stories, facts, source URLs, and phone 402-440-5438 once in the closing only.
Everyday words. Do not invent premiums. No Medicare. Agency: Mejor Vida Insurance.
Each summary_en 175–250 words. Same teaching depth as Spanish.
Do not add "a news story does not cancel your policy," "read every question slowly," or research-narration lines.

OUTPUT JSON only:
{
  "subject_en": "...",
  "preview_en": "...",
  "intro_en": "...",
  "lesson_en": "...",
  "stories": [
    { "title_en": "...", "summary_en": "..." }
  ]
}`;

function wordCount(s) {
  return String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Email stories: ~175–250 words (allow slight slack for retry). */
function storyLengthError(esStories, enStories) {
  const notes = [];
  for (let i = 0; i < 3; i++) {
    const es = wordCount(esStories[i] && esStories[i].summary);
    const en = wordCount(enStories[i] && enStories[i].summary);
    if (es < 165 || es > 280 || en < 165 || en > 280) {
      notes.push(`story ${i + 1} ES=${es} EN=${en} (need ~175–250 each)`);
    }
  }
  return notes.length ? notes.join("; ") : null;
}

function introLengthWarning(intro) {
  const n = wordCount(intro);
  if (n < 45 || n > 130) return `intro words=${n} (target ~60–100)`;
  return null;
}

function storiesFromParsed(parsed, candidates) {
  const stories = Array.isArray(parsed.stories) ? parsed.stories.slice(0, 3) : [];
  if (stories.length !== 3) throw new Error("Compose must return exactly 3 stories");
  const esStories = [];
  const enStories = [];
  for (let i = 0; i < 3; i++) {
    const c = candidates[i] || {};
    const research = c.research || {};
    const s = stories[i];
    const source_url = research.primary_source_url || c.url || s.source_url || c.source_url;
    const source_name = s.source_name || research.primary_source_name || c.source_name;
    const source_title = s.source_title || research.original_headline || c.title;
    const published = s.published || research.publication_date || c.published;
    const category = s.category || research.category || c.category;
    const shared = { source_url, source_name, source_title, published, category };
    esStories.push({
      title: String(s.title_es || s.title || "").trim(),
      summary: String(s.summary_es || s.summary || "").trim(),
      ...shared,
    });
    enStories.push({
      title: String(s.title_en || s.title_es || s.title || "").trim(),
      summary: String(s.summary_en || s.summary_es || s.summary || "").trim(),
      ...shared,
    });
  }
  return { esStories, enStories };
}

function buildDigest(window, parsed, esStories, enStories, meta) {
  const digest = {
    post_date_iso: window.today || new Date().toISOString().slice(0, 10),
    week_key: window.weekKey || window.today,
    window,
    subject: String(parsed.subject_es || parsed.subject || "").trim(),
    preview: String(parsed.preview_es || parsed.preview || "").trim(),
    intro: String(parsed.intro_es || parsed.intro || "").trim(),
    lesson: String(parsed.lesson_es || parsed.lesson || "").trim(),
    stories: esStories,
    en: {
      subject: String(parsed.subject_en || parsed.subject_es || parsed.subject || "").trim(),
      preview: String(parsed.preview_en || parsed.preview_es || "").trim(),
      intro: String(parsed.intro_en || parsed.intro_es || parsed.intro || "").trim(),
      lesson: String(parsed.lesson_en || parsed.lesson_es || "").trim(),
      stories: enStories,
    },
    hero_source: "weekly_research",
    research_brief_path: meta && meta.brief_path ? meta.brief_path : null,
    write_model: meta && meta.write_model ? meta.write_model : null,
  };
  const guardEs = assertNewsletterPartsOk({
    subject: digest.subject,
    bodyHtml: `${digest.intro}\n${esStories.map((s) => s.title + "\n" + s.summary).join("\n")}\n${digest.lesson}`,
  });
  if (!guardEs.ok) throw new Error(guardEs.error);
  const guardEn = assertNewsletterPartsOk({
    subject: digest.en.subject,
    bodyHtml: `${digest.en.intro}\n${enStories.map((s) => s.title + "\n" + s.summary).join("\n")}\n${digest.en.lesson}`,
  });
  if (!guardEn.ok) throw new Error(guardEn.error);
  return digest;
}

function briefPayloadForWriter(brief, candidates) {
  return {
    publication_date: brief.publication_date || (brief.window && brief.window.today),
    news_period_start: brief.news_period_start || (brief.window && brief.window.startDate),
    news_period_end: brief.news_period_end || (brief.window && brief.window.endDate),
    brand: {
      agency_es: "Mejor Vida Seguros",
      agency_en: "Mejor Vida Insurance",
      phone: "402-440-5438",
      audience: "U.S. Hispanic and bilingual families considering life / final expense insurance",
    },
    selected_stories: (brief.selected || []).map((s, i) => ({
      n: i + 1,
      working_headline: s.working_headline,
      event_date: s.event_date,
      publication_date: s.publication_date,
      primary_source_name: s.primary_source_name,
      primary_source_url: s.primary_source_url,
      confirming_source_name: s.confirming_source_name,
      confirming_source_url: s.confirming_source_url,
      verified_facts: s.verified_facts,
      context: s.context,
      why_it_matters: s.why_it_matters,
      practical_takeaway: s.practical_takeaway,
      terms_to_explain: s.terms_to_explain,
      limitations: s.limitations,
      claims_not_to_make: s.claims_not_to_make,
      recommended_internal_links: s.recommended_internal_links,
      category: s.category,
      is_background_evergreen: s.is_background_evergreen,
      original_headline: s.original_headline,
    })),
    candidates_for_source_fields: (candidates || []).map((c, i) => ({
      n: i + 1,
      title: c.title,
      url: c.url,
      source_name: c.source_name,
      published: c.published,
      category: c.category,
    })),
  };
}

async function composeWeeklyDigest(candidates, opts) {
  opts = opts || {};
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const window = opts.window || {};
  const brief = opts.researchBrief;
  if (!brief || !Array.isArray(brief.selected) || brief.selected.length !== 3) {
    throw new Error("Stage 2 requires a validated research brief with exactly 3 selected stories");
  }
  if (brief.validation && brief.validation.ok === false) {
    throw new Error("Stage 2 refused: research brief validation.ok is false");
  }

  const model = opts.writeModel || writeModel();
  const payload = briefPayloadForWriter(brief, candidates);

  const parsed = await openAiJsonChat(apiKey, {
    model,
    maxTokens: opts.maxTokens || 9000,
    temperature: 0.35,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content:
          `Write the publication-ready bilingual newsletter from this validated research brief only.\n` +
          `Do not search for other news.\n${JSON.stringify(payload)}`,
      },
    ],
  });

  let { esStories, enStories } = storiesFromParsed(parsed, candidates);
  let lengthErr = storyLengthError(esStories, enStories);
  if (lengthErr) {
    const retry = await openAiJsonChat(apiKey, {
      model,
      maxTokens: 10000,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content:
            `Your previous letter failed the length check: ${lengthErr}.\n` +
            `Rewrite ALL three stories. Each summary_es and summary_en MUST be 190–240 words. ` +
            `Same facts from the brief. One phone CTA only in lesson_es / lesson_en.\n` +
            `Brief:\n${JSON.stringify(payload)}`,
        },
      ],
    });
    ({ esStories, enStories } = storiesFromParsed(retry, candidates));
    lengthErr = storyLengthError(esStories, enStories);
    if (lengthErr) throw new Error(`Compose story length: ${lengthErr}`);
    return buildDigest(window, retry, esStories, enStories, {
      brief_path: brief.brief_path,
      write_model: model,
    });
  }
  return buildDigest(window, parsed, esStories, enStories, {
    brief_path: brief.brief_path,
    write_model: model,
  });
}

async function translateDigestToEnglish(digest, opts) {
  opts = opts || {};
  if (digest && digest.en && digest.en.subject && Array.isArray(digest.en.stories) && digest.en.stories.length === 3) {
    return digest;
  }
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const model = opts.writeModel || writeModel();
  const parsed = await openAiJsonChat(apiKey, {
    model,
    maxTokens: 5000,
    temperature: 0.3,
    messages: [
      { role: "system", content: TRANSLATE_SYSTEM },
      {
        role: "user",
        content: JSON.stringify({
          subject_es: digest.subject,
          preview_es: digest.preview,
          intro_es: digest.intro,
          lesson_es: digest.lesson,
          stories: (digest.stories || []).map((s) => ({
            title_es: s.title,
            summary_es: s.summary,
            source_title: s.source_title,
            source_name: s.source_name,
            source_url: s.source_url,
            published: s.published,
            category: s.category,
          })),
        }),
      },
    ],
  });
  const enStories = (digest.stories || []).map((s, i) => {
    const t = (parsed.stories && parsed.stories[i]) || {};
    return {
      title: String(t.title_en || s.title || "").trim(),
      summary: String(t.summary_en || s.summary || "").trim(),
      source_title: s.source_title,
      source_name: s.source_name,
      source_url: s.source_url,
      published: s.published,
      category: s.category,
    };
  });
  if (enStories.length !== 3) throw new Error("English translate must return 3 stories");
  const next = {
    ...digest,
    en: {
      subject: String(parsed.subject_en || digest.subject || "").trim(),
      preview: String(parsed.preview_en || digest.preview || "").trim(),
      intro: String(parsed.intro_en || digest.intro || "").trim(),
      lesson: String(parsed.lesson_en || digest.lesson || "").trim(),
      stories: enStories,
    },
  };
  const guardEn = assertNewsletterPartsOk({
    subject: next.en.subject,
    bodyHtml: `${next.en.intro}\n${enStories.map((s) => s.title + "\n" + s.summary).join("\n")}\n${next.en.lesson}`,
  });
  if (!guardEn.ok) throw new Error(guardEn.error);
  return next;
}

module.exports = {
  SYSTEM,
  composeWeeklyDigest,
  translateDigestToEnglish,
  wordCount,
  storyLengthError,
  introLengthWarning,
  briefPayloadForWriter,
};
