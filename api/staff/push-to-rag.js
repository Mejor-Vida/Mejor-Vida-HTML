const { requireStaffAuth } = require("../auth-check");
const { generateEmbedding } = require("../../lib/openai");
const { json, readJsonBody, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");

async function reformatForKnowledgeBase(openaiKey, questionText, replyDraft) {
  const systemPrompt =
    "You are a knowledge base formatter. Given a customer question and an email reply, rewrite only the factual answer as a clean, concise knowledge snippet. Remove greetings, sign-offs, and any conversational filler. Do not include labels such as Q:, A:, Question:, or Answer:. Return plain answer text only.";

  const userPrompt = `Question: ${questionText}\n\nEmail reply: ${replyDraft}`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const msg = (data && data.error && data.error.message) || "OpenAI formatting error";
    throw new Error(String(msg).slice(0, 200));
  }

  const text =
    (data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content) ||
    "";
  const cleaned = String(text).trim();
  if (!cleaned) throw new Error("Formatter returned empty content");

  return cleaned;
}

async function ensureStaffSource(cfg) {
  const existing = await restSelect(
    cfg,
    "knowledge_sources",
    "select=id,name&name=eq.staff_inbox_approved&limit=1"
  );
  if (existing && existing.length) return existing[0].id;

  const inserted = await restInsert(cfg, "knowledge_sources", [
    {
      name: "staff_inbox_approved",
      source_type: "staff_inbox",
      external_ref: "staff_portal",
      notes: "Julie approved Q&A pushed from staff inbox",
    },
  ]);
  if (!inserted || !inserted.length) throw new Error("Failed creating source");
  return inserted[0].id;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!cfg || !openaiKey) return json(res, 500, { error: "Server missing required configuration" });

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const id = String(body.id || "").trim();
  const answer = String(body.answer || "").trim();
  if (!id || !answer) return json(res, 400, { error: "id and answer required" });

  try {
    const rows = await restSelect(
      cfg,
      "unanswered_questions",
      `select=id,question,edited_question,staff_context,language,flow_stage,lead_id,phone,rag_pushed&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    if (!rows || !rows.length) return json(res, 404, { error: "Question not found" });
    const q = rows[0];
    const baseQ = String(q.question || "").trim();
    const notes = String(q.staff_context || q.edited_question || "").trim();
    const finalQuestion = notes
      ? `Customer question:\n${baseQ || "(not recorded)"}\n\nStaff-provided facts for the knowledge entry:\n${notes}`
      : baseQ;
    if (!finalQuestion.trim()) return json(res, 400, { error: "Question text is empty" });

    const sourceId = await ensureStaffSource(cfg);

    const docTitle = `Staff inbox Q&A ${new Date().toISOString().slice(0, 10)}`;
    const docs = await restInsert(cfg, "knowledge_documents", [
      {
        title: docTitle,
        source_id: sourceId,
        status: "active",
        reviewed_at: new Date().toISOString(),
      },
    ]);
    const doc = docs && docs[0];
    if (!doc || !doc.id) throw new Error("Failed creating knowledge document");

    const chunkContent = await reformatForKnowledgeBase(openaiKey, finalQuestion, answer);
    const emb = await generateEmbedding(openaiKey, chunkContent);

    const insertedChunks = await restInsert(cfg, "knowledge_chunks", [
      {
        document_id: doc.id,
        chunk_index: 0,
        content: chunkContent,
        embedding: emb.embedding,
        metadata: {
          source_name: "staff_inbox_approved",
          question_id: q.id,
          lead_id: q.lead_id || null,
          language: q.language || null,
          flow_stage: q.flow_stage || null,
          pushed_by: auth.user && auth.user.email ? auth.user.email : null,
        },
        status: "active",
        reviewed_at: new Date().toISOString(),
      },
    ]);
    const chunkRow = insertedChunks && insertedChunks[0];

    await restPatch(
      cfg,
      "unanswered_questions",
      `id=eq.${encodeURIComponent(id)}&select=id,rag_pushed`,
      { rag_pushed: true }
    );

    const qaPreview =
      chunkContent.length > 900 ? `${chunkContent.slice(0, 900)}…` : chunkContent;

    return json(res, 200, {
      ok: true,
      document_id: doc.id,
      knowledge_chunk_id: chunkRow && chunkRow.id != null ? chunkRow.id : null,
      qa_preview: qaPreview,
    });
  } catch (e) {
    console.error("push-to-rag", e);
    const detail = e && e.message ? String(e.message).slice(0, 500) : "";
    return json(res, 500, {
      error: "Failed to push to knowledge base",
      ...(detail ? { detail } : {}),
    });
  }
};
