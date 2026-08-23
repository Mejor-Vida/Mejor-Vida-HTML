/**
 * Rewrite last-week news into a 3-story family digest (Spanish + English).
 */

const { assertNewsletterPartsOk } = require("./crm-weekly-topic-guard");

const SYSTEM = `You write Mejor Vida Insurance's weekly CLIENT newsletter in TWO languages.

This letter is received by families we are nurturing — people considering life insurance (often final expense / funeral coverage, term, or whole life). Write as if they are sitting at the kitchen table. Never write a staff memo, a news digest for agents, or "three notes at the same depth."

VOICE: Warm, personal, plain. 8th-grade reading level. Short sentences.
Spanish: usted. Agency in body: Mejor Vida Seguros.
English: Agency in body: Mejor Vida Insurance.
Do not use the first name Julie in body copy (signature/buttons may).

INTRO (required):
- Thank them for staying in touch / thinking about protecting their family.
- You may name this week's topics in family language (health questions, funeral planning, retirement money).
- Do NOT tell the reader that they "do not need insurance language," that you will "use everyday words," or that you will "give the official name later." Just write that way.
- Do NOT mention GINA, FTC, HHS, NIH, III, or other acronyms in the intro.
- Do NOT say "articles," "sources," "equal length," or "this week's news package."

EACH STORY (required teaching order):
1. Start with a family situation they already understand (applying for life insurance, paying for a funeral, saving for retirement).
2. Explain the idea in everyday words FIRST.
3. Only THEN introduce any official name (example: "There is a U.S. law people call GINA…" / "The government's consumer office, the FTC, wrote rules for funeral homes…").
4. Say why this matters for someone considering life insurance with Mejor Vida.
5. One labeled hypothetical if useful (not a real client).
6. One calm next step. Phone if you mention calling: 402-440-5438.

Never open a story with an acronym, a statute name, or "according to HHS."

CLIENT-LETTER DON'TS (Julie removed these because they sound weird — never put them back):
- Do not tell the reader they "do not need insurance language," that you will "use everyday words," or that you will "give the official name later." Write that way; do not describe it.
- Do not say a news story, headline, or this letter "does not cancel" a policy they already have. Nobody asked. It sounds like a disclaimer, not a family letter.
- Do not close with "if you are applying, read every health question slowly" (or Spanish equivalent). Preachy and odd.
- Do not narrate the format ("three notes at the same depth," "this week's news package").
- Do not narrate fact-checking ("we do not have that person's file," "we will not repeat a rate we did not verify," "we stop where the public record stops"). Omit unverified numbers silently. Readers do not need to hear how you researched.

OUTPUT: JSON only:
{
  "subject_es": "Warm Spanish subject a family would open (not a law name unless explained in the subject)",
  "preview_es": "Spanish inbox preview, under 90 characters, everyday words",
  "intro_es": "3-5 warm Spanish sentences (usted). Client letter, not a briefing.",
  "lesson_es": "One short Spanish close: understand before you sign; we can explain options.",
  "subject_en": "English subject (same meaning, everyday words)",
  "preview_en": "English inbox preview, under 90 characters",
  "intro_en": "3-5 warm English sentences. Client letter, not a briefing.",
  "lesson_en": "One short English close: understand before you sign; we can explain options.",
  "stories": [
    {
      "title_es": "Spanish headline in plain language (question or everyday phrase)",
      "summary_es": "200-300 words Spanish, teaching order above",
      "title_en": "English headline in plain language",
      "summary_en": "200-300 words English, teaching order above",
      "category": "final_expense|term_life|whole_life|iul|annuity|life_insurance",
      "source_title": "original English headline",
      "source_name": "publisher",
      "source_url": "https://...",
      "published": "YYYY-MM-DD or evergreen"
    }
  ]
}

Exactly 3 stories, same order as the candidates. All three summaries 200–300 words each per language. Same depth. English and Spanish cover the same facts. Educate first; not a hard sell.

RULES:
- Original wording. Do not copy article text.
- Do not invent premiums, APRs, illustrated IUL rates, or "you are approved".
- No Medicare, Medigap, Medicaid plan shopping.
- No competitor brand promotion (Ethos, PolicyGenius, Colonial Penn, Mutual of Omaha Direct, SelectQuote).
- Do not list Nebraska/Kansas/Colorado/Nevada as "where we sell".
- IUL/annuity: explain in plain language; they are not replacements for a funeral-only need unless the candidate is clearly about that.
- Use the candidate \`url\` as source_url (the specific article), not the publisher homepage.
- If a candidate is evergreen, treat it as useful background, not "breaking this week".`;

const TRANSLATE_SYSTEM = `Translate this Mejor Vida Insurance weekly CLIENT newsletter into English for families (same letter, not a staff memo).
Keep the same 3 stories, facts, source URLs, and phone 402-440-5438.
Everyday words. Explain the idea before any official name. Do not invent premiums. No Medicare.
Agency name: Mejor Vida Insurance.

OUTPUT JSON only:
{
  "subject_en": "...",
  "preview_en": "...",
  "intro_en": "...",
  "lesson_en": "...",
  "stories": [
    { "title_en": "...", "summary_en": "..." }
  ]
}
Exactly 3 stories, same order. All three summaries the same length (200–300 words). Teaching order: situation, then explanation, then official name.
Do not add "a news story does not cancel your policy," "read every question slowly," or "we do not have that person's file / we will not repeat a rate we did not verify."`;

function storiesFromParsed(parsed, candidates) {
  const stories = Array.isArray(parsed.stories) ? parsed.stories.slice(0, 3) : [];
  if (stories.length !== 3) throw new Error("Compose must return exactly 3 stories");
  const esStories = [];
  const enStories = [];
  for (let i = 0; i < 3; i++) {
    const c = candidates[i] || {};
    const s = stories[i];
    const source_url = c.url || s.source_url || c.source_url;
    const source_name = s.source_name || c.source_name;
    const source_title = s.source_title || c.title;
    const published = s.published || c.published;
    const category = s.category || c.category;
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

function buildDigest(window, parsed, esStories, enStories) {
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
  };
  const guardEs = assertNewsletterPartsOk({
    subject: digest.subject,
    bodyHtml: `${digest.intro}\n${esStories.map((s) => s.title + "\n" + s.summary).join("\n")}`,
  });
  if (!guardEs.ok) throw new Error(guardEs.error);
  const guardEn = assertNewsletterPartsOk({
    subject: digest.en.subject,
    bodyHtml: `${digest.en.intro}\n${enStories.map((s) => s.title + "\n" + s.summary).join("\n")}`,
  });
  if (!guardEn.ok) throw new Error(guardEn.error);
  return digest;
}

async function openAiJson(apiKey, system, user, maxTokens) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: maxTokens || 5500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI compose ${r.status}: ${err}`);
  }
  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  try {
    return JSON.parse(text || "{}");
  } catch (e) {
    throw new Error("OpenAI compose returned non-JSON");
  }
}

async function composeWeeklyDigest(candidates, opts) {
  opts = opts || {};
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const window = opts.window || {};
  const payload = {
    date_window: { start: window.startDate, end: window.endDate, today: window.today },
    candidates: (candidates || []).slice(0, 3).map((c, i) => ({
      n: i + 1,
      title: c.title,
      source_name: c.source_name,
      source_url: c.source_url || c.url,
      url: c.url,
      published: c.published,
      category: c.category,
      evergreen: !!c.evergreen,
    })),
  };
  const parsed = await openAiJson(
    apiKey,
    SYSTEM,
    `Write this week's 3-story digest in Spanish and English from these candidates:\n${JSON.stringify(payload)}`,
    5500
  );
  const { esStories, enStories } = storiesFromParsed(parsed, payload.candidates);
  return buildDigest(window, parsed, esStories, enStories);
}

async function translateDigestToEnglish(digest, opts) {
  opts = opts || {};
  if (digest && digest.en && digest.en.subject && Array.isArray(digest.en.stories) && digest.en.stories.length === 3) {
    return digest;
  }
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const parsed = await openAiJson(
    apiKey,
    TRANSLATE_SYSTEM,
    JSON.stringify({
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
    2500
  );
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
    bodyHtml: `${next.en.intro}\n${enStories.map((s) => s.title + "\n" + s.summary).join("\n")}`,
  });
  if (!guardEn.ok) throw new Error(guardEn.error);
  return next;
}

module.exports = {
  composeWeeklyDigest,
  translateDigestToEnglish,
};
