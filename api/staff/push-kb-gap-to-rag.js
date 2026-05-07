const { createHash } = require("crypto");
const { requireStaffAuth } = require("../auth-check");
const { generateEmbedding } = require("../../lib/openai");
const { json, readJsonBody, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");

function hashChunk(carrier, product, category, content) {
  const canonical = [carrier, product, category, content].join("\n---\n");
  return createHash("sha256").update(canonical).digest("hex");
}

function sanitizeForRag(text) {
  const lines = String(text || "").split(/\r?\n/);
  const blocked = /(diagnos|condition|medication|prescription|hospital|surgery|insulin|cancer|stroke|copd|kidney|heart|phi|underwriting notes)/i;
  return lines
    .filter((ln) => !blocked.test(ln))
    .join("\n")
    .trim();
}

function combineAnswer(english, spanish) {
  const en = String(english || "").trim();
  const es = String(spanish || "").trim();
  if (!en && !es) return "";
  if (en && es) return `English:\n${en}\n\nSpanish:\n${es}`;
  return en || es;
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
  const overrideAnswer = combineAnswer(body.answerEnglish, body.answerSpanish) || String(body.answer || "").trim();
  if (!id) return json(res, 400, { error: "id required" });

  try {
    const rows = await restSelect(
      cfg,
      "staff_kb_gaps",
      `select=id,question,assistant_answer,resolved&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    if (!rows || !rows.length) return json(res, 404, { error: "KB gap not found" });
    const gap = rows[0];
    if (gap.resolved) return json(res, 400, { error: "KB gap already resolved" });

    const question = sanitizeForRag(String(gap.question || "").trim());
    const answer = sanitizeForRag(overrideAnswer || String(gap.assistant_answer || "").trim());
    if (!question || !answer) return json(res, 400, { error: "KB gap question/answer is empty" });

    const content = `Question:\n${question}\n\nAnswer:\n${answer}`;
    const carrier = "staff_gap";
    const product = "staff_assistant";
    const category = "kb_gap";
    const fingerprint = hashChunk(carrier, product, category, content);

    const existing = await restSelect(
      cfg,
      "internal_knowledge_chunks",
      `select=id&carrier=eq.${encodeURIComponent(carrier)}&chunk_fingerprint=eq.${encodeURIComponent(fingerprint)}&limit=1`
    );

    let chunkId = existing && existing[0] ? existing[0].id : null;
    if (!chunkId) {
      const emb = await generateEmbedding(openaiKey, content);
      const inserted = await restInsert(cfg, "internal_knowledge_chunks", [
        {
          carrier,
          product,
          category,
          content,
          embedding: emb.embedding,
          chunk_fingerprint: fingerprint,
        },
      ]);
      chunkId = inserted && inserted[0] ? inserted[0].id : null;
    }

    await restPatch(
      cfg,
      "staff_kb_gaps",
      `id=eq.${encodeURIComponent(id)}&select=id`,
      {
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: auth.user && auth.user.email ? auth.user.email : null,
        updated_at: new Date().toISOString(),
      }
    );

    return json(res, 200, { ok: true, chunk_id: chunkId, deduped: !!(existing && existing.length) });
  } catch (e) {
    const detail = e && e.message ? String(e.message).slice(0, 240) : "";
    return json(res, 500, { error: "Failed to push KB gap to RAG", ...(detail ? { detail } : {}) });
  }
};
