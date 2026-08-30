/**
 * Write three Spanish Facebook packages in the same format as prior weekly posts.
 * No URL in the main caption; blog link only in the first comment.
 */

const { assertNewsletterPartsOk } = require("./crm-weekly-topic-guard");

const HASHTAGS =
  "#SeguroDeVida #GastosFinales #ProteccionFamiliar #EducacionEnSeguros #MejorVidaInsurance";

const CAPTION_CTA = `Si quieres el artículo, una cotización gratis, o hablar con nosotros — estamos aquí, sin presión.

Llama, texto o WhatsApp al (402) 440-5438
Correo: Julie@mejorvidainsurance.com

Si te queda una duda, déjala en los comentarios y te respondemos.`;

const QUOTE_URL = "https://www.mejorvidainsurance.com/quote.html";
const SITE_URL = "https://www.mejorvidainsurance.com/";

const SYSTEM = `You write Mejor Vida Insurance Facebook posts in Spanish for families.

Match this format:
- Language: natural Spanish (tú), 6th–8th grade, warm, human. No emojis.
- Structure: hook (1–2 lines that stop the scroll) → 2–4 short value points (bullets ok) → trust line → CTA block below.
- main_caption MUST be a full post: about 100–175 words before the CTA. Never return only a hook plus hashtags.
- Include concrete facts from the story summary (what happened, why families care, one practical takeaway).
- Hook must NOT sound like a newsletter, blog title, or “esta semana te resumimos”.
- Trust: helpful, not pushy (e.g. no estamos aquí para venderte algo que no necesitas).
- Do NOT use Comenta INFO or REVISAR. Those keywords do not help families act.
- End main_caption with this CTA exactly, then these hashtags exactly:

${CAPTION_CTA}

${HASHTAGS}

- Educational only. No coverage, price, or approval promises. No invented premiums.
- Agency in body: Mejor Vida Insurance (Facebook captions use the English agency name).
- Do NOT put any URL, http, or www in main_caption. Do not say “haz clic” or “visita el enlace”.
- first_comment must follow this shape (STORY_URL on its own line):

Artículo de esta historia:
STORY_URL

Cotización gratis:
${QUOTE_URL}

Sitio web: ${SITE_URL}

Llama, texto o WhatsApp: (402) 440-5438
Correo: Julie@mejorvidainsurance.com

OUTPUT JSON only:
{
  "posts": [
    {
      "slot": 1,
      "main_caption": "...",
      "first_comment": "...",
      "alternate_caption": "One short Spanish fallback, still no URL"
    }
  ]
}
Exactly 3 posts, slots 1, 2, 3 in that order.`;

const URL_RE = /https?:\/\/[^\s]+/gi;

function stripUrls(text) {
  return String(text || "")
    .replace(URL_RE, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ensureHashtags(caption) {
  let t = String(caption || "").trim();
  if (!/#SeguroDeVida/i.test(t)) t = `${t}\n\n${HASHTAGS}`;
  return t.trim();
}

function wordCount(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Body only: strip CTA + hashtags so we can judge whether the model wrote a real post. */
function captionBodyOnly(caption) {
  let t = String(caption || "").trim();
  const infoCut = t.search(/Comenta\s+INFO/i);
  if (infoCut >= 0) t = t.slice(0, infoCut).trim();
  t = t.replace(/\n?#SeguroDeVida[\s\S]*$/i, "").trim();
  t = t.replace(/\n?Si quieres el artículo[\s\S]*$/i, "").trim();
  return t;
}

const MIN_CAPTION_BODY_WORDS = 70;

function isThinCaption(caption) {
  return wordCount(captionBodyOnly(caption)) < MIN_CAPTION_BODY_WORDS;
}

function fallbackCaptionFromStory(story) {
  const title = String(story.title || "este tema").trim();
  const summary = String(story.summary || "")
    .replace(/\s+/g, " ")
    .trim();
  const take = summary.slice(0, 420).trim();
  const body = [
    `¿De verdad entiendes ${title}?`,
    "",
    take
      ? take
      : "Te lo explicamos en palabras simples: qué puede importar en la vida real y qué conviene revisar con calma.",
    "",
    "Lo útil para tu familia:",
    "• Entiende el hecho principal, no solo el titular",
    "• Separa lo que es noticia de lo que es consejo genérico",
    "• Si tienes dudas sobre tu cobertura, pregunta antes de decidir",
    "",
    "No estamos aquí para venderte algo que no necesitas — estamos para ayudarte a entender.",
  ].join("\n");
  return rewriteCaptionCta(body);
}

/** Keep the story body; replace INFO/REVISAR (or any old close) with the current CTA. */
function rewriteCaptionCta(caption) {
  let t = captionBodyOnly(caption);
  return `${t}\n\n${CAPTION_CTA}\n\n${HASHTAGS}`;
}

function defaultFirstComment(storyUrl) {
  return [
    "Artículo de esta historia:",
    storyUrl,
    "",
    "Cotización gratis:",
    QUOTE_URL,
    "",
    `Sitio web: ${SITE_URL}`,
    "",
    "Llama, texto o WhatsApp: (402) 440-5438",
    "Correo: Julie@mejorvidainsurance.com",
  ].join("\n");
}

async function openAiJson(apiKey, user) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 2800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI facebook compose ${r.status}: ${err}`);
  }
  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  try {
    return JSON.parse(text || "{}");
  } catch (e) {
    throw new Error("OpenAI facebook compose returned non-JSON");
  }
}

function normalizePosts(parsed, stories) {
  const bySlot = {};
  for (const p of parsed.posts || parsed.stories || []) {
    const slot = Number(p.slot);
    if (slot >= 1 && slot <= 3) bySlot[slot] = p;
  }
  const out = [];
  for (const story of stories) {
    const raw = bySlot[story.slot] || {};
    let main = rewriteCaptionCta(stripUrls(raw.main_caption || raw.caption || ""));
    if (!captionBodyOnly(main) || isThinCaption(main)) {
      main = fallbackCaptionFromStory(story);
    }
    main = ensureHashtags(main);
    let comment = String(raw.first_comment || "").trim();
    if (!comment || !comment.includes(story.story_url)) {
      comment = defaultFirstComment(story.story_url);
    }
    let guard = assertNewsletterPartsOk({ main_caption: main });
    if (!guard.ok && /must clearly relate/i.test(guard.error)) {
      main = rewriteCaptionCta(
        `${captionBodyOnly(main)}\n\nEsto importa si estás pensando en un seguro de vida o gastos finales.`
      );
      guard = assertNewsletterPartsOk({ main_caption: main });
    }
    if (!guard.ok) throw new Error(`Facebook slot ${story.slot}: ${guard.error}`);
    if (URL_RE.test(main)) throw new Error(`Facebook slot ${story.slot}: URL leaked into main caption`);
    if (isThinCaption(main)) {
      throw new Error(`Facebook slot ${story.slot}: caption body still too thin after fallback`);
    }
    out.push({
      slot: story.slot,
      title: story.title,
      story_url: story.story_url,
      image_url: story.image_url,
      main_caption: main,
      first_comment: comment,
      alternate_caption: stripUrls(raw.alternate_caption || ""),
    });
  }
  if (out.length !== 3) throw new Error("Facebook compose must return exactly 3 posts");
  return out;
}

async function composeWeeklyFacebookPosts(stories, opts) {
  opts = opts || {};
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  if (!Array.isArray(stories) || stories.length !== 3) {
    throw new Error("Need exactly 3 digest stories to compose Facebook posts");
  }
  const parsed = await openAiJson(
    apiKey,
    `Write 3 Facebook posts from these live weekly digest stories:\n${JSON.stringify(
      stories.map((s) => ({
        slot: s.slot,
        title: s.title,
        summary: s.summary,
        story_url: s.story_url,
      }))
    )}`
  );
  return normalizePosts(parsed, stories);
}

module.exports = {
  HASHTAGS,
  CAPTION_CTA,
  MIN_CAPTION_BODY_WORDS,
  rewriteCaptionCta,
  captionBodyOnly,
  isThinCaption,
  stripUrls,
  defaultFirstComment,
  composeWeeklyFacebookPosts,
  normalizePosts,
};
