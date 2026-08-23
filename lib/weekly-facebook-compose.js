/**
 * Write three Spanish Facebook packages in the same format as prior weekly posts.
 * No URL in the main caption; blog link only in the first comment.
 */

const { assertNewsletterPartsOk } = require("./crm-weekly-topic-guard");

const HASHTAGS =
  "#SeguroDeVida #GastosFinales #ProteccionFamiliar #EducacionEnSeguros #MejorVidaInsurance";

const SYSTEM = `You write Mejor Vida Insurance Facebook posts in Spanish for families.

Match the live format of recent weekly posts:
- Language: natural Spanish (tú), 6th–8th grade, warm, human. No emojis.
- Structure: hook (1–2 lines that stop the scroll) → 2–4 short value points (bullets ok) → trust line → dual CTA.
- Hook must NOT sound like a newsletter, blog title, or “esta semana te resumimos”.
- Trust: helpful, not pushy (e.g. no estamos aquí para venderte algo que no necesitas).
- CTA: Comenta INFO si quieres el artículo completo, o REVISAR si quieres que revisemos tu situación. También puedes mandarnos un mensaje.
- End main_caption with these hashtags exactly: ${HASHTAGS}
- Educational only. No coverage, price, or approval promises. No invented premiums.
- Agency in body: Mejor Vida Insurance (Facebook captions use the English agency name).
- Do NOT put any URL, http, www, or “visita nuestro sitio” in main_caption.
- first_comment must follow this shape (use the provided story_url on its own line):

¡Gracias por tu interés!

Si comentaste INFO o quieres leer [short topic in Spanish], visita nuestro sitio web:
STORY_URL

En Mejor Vida Insurance nos enfocamos en seguros de vida y gastos finales.

¿Preguntas? Llámanos o escríbenos por WhatsApp al (402) 440-5438.

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

function defaultFirstComment(storyUrl, title) {
  const hook = title
    ? `Si comentaste INFO o quieres leer sobre ${title}, visita nuestro sitio web:`
    : "Si comentaste INFO o quieres leer el artículo, visita nuestro sitio web:";
  return [
    "¡Gracias por tu interés!",
    "",
    hook,
    storyUrl,
    "",
    "En Mejor Vida Insurance nos enfocamos en seguros de vida y gastos finales.",
    "",
    "¿Preguntas? Llámanos o escríbenos por WhatsApp al (402) 440-5438.",
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
    let main = ensureHashtags(stripUrls(raw.main_caption || raw.caption || ""));
    if (!main) {
      main = ensureHashtags(
        `¿De verdad entiendes ${story.title}?\n\nTe lo explicamos en palabras simples — qué puede importar en la vida real y qué conviene revisar con calma.\n\nNo estamos aquí para venderte algo que no necesitas — estamos para ayudarte a entender.\n\nComenta INFO si quieres el artículo completo, o REVISAR si quieres que revisemos tu situación. También puedes mandarnos un mensaje.`
      );
    }
    let comment = String(raw.first_comment || "").trim();
    if (!comment || !comment.includes(story.story_url)) {
      comment = defaultFirstComment(story.story_url, story.title);
    }
    let guard = assertNewsletterPartsOk({ main_caption: main });
    if (!guard.ok && /must clearly relate/i.test(guard.error)) {
      main = `${main}\n\nEsto importa si estás pensando en un seguro de vida o gastos finales.`;
      guard = assertNewsletterPartsOk({ main_caption: main });
    }
    if (!guard.ok) throw new Error(`Facebook slot ${story.slot}: ${guard.error}`);
    if (URL_RE.test(main)) throw new Error(`Facebook slot ${story.slot}: URL leaked into main caption`);
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
  stripUrls,
  defaultFirstComment,
  composeWeeklyFacebookPosts,
  normalizePosts,
};
