const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody } = require("./_inbox-lib");

function buildPrompt(questionText, language, lead, staffNotes, opts) {
  const o = opts || {};
  const locale = /spanish|es/i.test(String(language || "")) ? "Spanish" : "English";
  const leadLine = lead
    ? `Lead context: name=${lead.first_name || "unknown"}, phone=${lead.phone || "unknown"}, email=${lead.email || "unknown"}.`
    : "Lead context: unavailable.";
  const notes = String(staffNotes || "").trim();
  const notesBlock = notes
    ? `\n\nStaff-provided facts (treat as authoritative; use when relevant to answer the client; do not contradict):\n${notes}`
    : "";
  const issueLine = o.isCompose
    ? `Customer issue (what the client needs help with):\n${questionText}`
    : `Client question (verbatim from the channel): ${questionText}`;
  return (
    `You are drafting the message body that Julie Braunsroth will send to the client **as Julie** (first person is fine: "I" / Julie).\n` +
    `Reply language must be ${locale}.\n` +
    `Tone: warm, clear, professional, plain language, no emojis.\n` +
    `- For Spanish: use **tú** (informal tutear), not usted — e.g. tienes, puedes, tu/tus, te.\n` +
    `Constraints:\n` +
    `- 80 to 180 words.\n` +
    `- Do not invent exact prices.\n` +
    `- If missing details, ask 1-2 clarifying questions.\n` +
    `- After the next-step invitation, end with **exactly two lines** and nothing else: (1) English: **Warm regards,** (capitalization flexible) OR Spanish: **Atentamente,** or **Un saludo cordial,**; (2) the next line must be **Julie** only (first name only, same in English and Spanish).\n` +
    `- Do NOT add a third line. Do NOT add job titles, phone, email, or any placeholder in brackets. Forbidden examples (never output these or anything like them): [Your Name], [Your Contact Information], Internal Insurance Assistant; Spanish: **[Su Nombre]**, **[Tu Nombre]**, **Asistente de Seguros Interno de Julie**, **Asistente de Seguros Interno**, or any "[...Nombre...]" line. Julie's real signature is added when the email is sent.\n\n` +
    `${leadLine}\n` +
    issueLine +
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
  const isCompose = !!(body && body.compose);

  let clientQuestionBlock;
  let lang;
  let leadForPrompt;
  let staffNotes;
  let promptOpts;

  if (isCompose) {
    const customerIssue = String(body.customerIssue || "").trim();
    staffNotes = String(body.staffNotes || "").trim();
    lang = String(body.language || "English");
    const lead = (body && body.lead) || {};
    const fn = String(lead.first_name || "").trim();
    const ln = String(lead.last_name || "").trim();
    const display = [fn, ln].filter(Boolean).join(" ").trim() || fn || ln || "unknown";
    leadForPrompt = {
      first_name: display,
      phone: lead.phone != null ? String(lead.phone).trim() || "unknown" : "unknown",
      email: lead.email != null ? String(lead.email).trim() || "unknown" : "unknown",
    };
    if (!customerIssue && !staffNotes) {
      return json(res, 400, { error: "customerIssue or staffNotes required" });
    }
    clientQuestionBlock =
      customerIssue || "(No customer issue text — rely on staff notes and lead context only.)";
    promptOpts = { isCompose: true };
  } else {
    if (!question) return json(res, 400, { error: "question required" });
    const questionText = String((question && question.question) || "").trim();
    staffNotes = question && String(question.staff_context || question.edited_question || "").trim();
    if (!questionText && !staffNotes) return json(res, 400, { error: "question required" });
    clientQuestionBlock =
      questionText || "(No verbatim customer question on file — rely on staff facts and general professionalism.)";
    lang = question.language;
    leadForPrompt = question.lead;
    promptOpts = {};
  }

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
            content: buildPrompt(clientQuestionBlock, lang, leadForPrompt, staffNotes, promptOpts),
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
