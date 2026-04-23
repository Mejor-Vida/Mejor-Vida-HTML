const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody } = require("./_inbox-lib");

function buildPrompt(questionText, language, lead, staffNotes) {
  const locale = /spanish|es/i.test(String(language || "")) ? "Spanish" : "English";
  const leadLine = lead
    ? `Lead context: name=${lead.first_name || "unknown"}, phone=${lead.phone || "unknown"}, email=${lead.email || "unknown"}.`
    : "Lead context: unavailable.";
  const notes = String(staffNotes || "").trim();
  const notesBlock = notes
    ? `\n\nStaff-provided facts (treat as authoritative; use when relevant to answer the client; do not contradict):\n${notes}`
    : "";
  return (
    `You are Julie's internal insurance assistant writing a concise draft response for a client question.\n` +
    `Reply language must be ${locale}.\n` +
    `Tone: warm, clear, professional, plain language, no emojis.\n` +
    `Constraints:\n` +
    `- 80 to 180 words.\n` +
    `- Do not invent exact prices.\n` +
    `- If missing details, ask 1-2 clarifying questions.\n` +
    `- End with a next-step invitation.\n\n` +
    `${leadLine}\n` +
    `Client question (verbatim from the channel): ${questionText}` +
    notesBlock
  );
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

  const question = body && body.question ? body.question : null;
  const questionText = String((question && question.question) || "").trim();
  const staffNotes = question && String(question.staff_context || question.edited_question || "").trim();
  if (!questionText && !staffNotes) return json(res, 400, { error: "question required" });
  const clientQuestionBlock =
    questionText || "(No verbatim customer question on file — rely on staff facts and general professionalism.)";

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: buildPrompt(clientQuestionBlock, question.language, question.lead, staffNotes),
          },
        ],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || "OpenAI error";
      return json(res, 500, { error: String(msg).slice(0, 200) });
    }
    const answer =
      (data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "";
    return json(res, 200, { answer: String(answer).trim() });
  } catch (e) {
    return json(res, 500, { error: "Failed to generate answer" });
  }
};
