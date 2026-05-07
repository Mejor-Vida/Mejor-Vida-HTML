const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody } = require("./_inbox-lib");

function buildPrompt(questionText, julieInput) {
  const notes = String(julieInput || "").trim();
  const notesBlock = notes
    ? `\n\nJulie guidance to prioritize:\n${notes}`
    : "";

  return (
    "You are drafting internal knowledge-base answers for a staff RAG system used by insurance agents.\n" +
    "Write one answer in English and one in Spanish.\n" +
    "Requirements for BOTH languages:\n" +
    "- 90 to 220 words.\n" +
    "- Be factual and specific, but do not invent carrier-specific rules if unknown.\n" +
    "- No greetings, no signature, no emojis.\n" +
    "- No PHI/medical-history speculation.\n" +
    "- If information depends on state/carrier, say so briefly.\n" +
    "- Keep meaning aligned between English and Spanish.\n\n" +
    "Return ONLY valid JSON with this exact shape:\n" +
    '{"english":"...","spanish":"..."}\n\n' +
    `Question:\n${questionText}` +
    notesBlock
  );
}

function parseBilingual(text) {
  const raw = String(text || "").trim();
  if (!raw) return { english: "", spanish: "" };
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      english: String((parsed && parsed.english) || "").trim(),
      spanish: String((parsed && parsed.spanish) || "").trim(),
    };
  } catch (e) {
    return { english: raw, spanish: "" };
  }
}

function combineAnswer(english, spanish) {
  const en = String(english || "").trim();
  const es = String(spanish || "").trim();
  if (!en && !es) return "";
  return `English:\n${en}\n\nSpanish:\n${es}`.trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return json(res, 500, { error: "Server missing required configuration" });

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const question = String(body.question || "").trim();
  const julieInput = String(body.julieInput || "").trim();
  if (!question) return json(res, 400, { error: "question required" });

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        max_tokens: 450,
        messages: [{ role: "user", content: buildPrompt(question, julieInput) }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || "OpenAI error";
      return json(res, 500, { error: String(msg).slice(0, 220) });
    }
    const answer =
      (data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "";
    const parsed = parseBilingual(answer);
    return json(res, 200, {
      answer: combineAnswer(parsed.english, parsed.spanish),
      english_answer: parsed.english,
      spanish_answer: parsed.spanish,
    });
  } catch (e) {
    return json(res, 500, { error: "Failed to generate KB gap response" });
  }
};
