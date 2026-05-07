const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restPatch } = require("./_inbox-lib");

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
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const id = String(body.id || "").trim();
  const answerEnglish = String(body.answerEnglish || "").trim();
  const answerSpanish = String(body.answerSpanish || "").trim();
  const answer = combineAnswer(answerEnglish, answerSpanish) || String(body.answer || "").trim();
  if (!id) return json(res, 400, { error: "id required" });
  if (!answer) return json(res, 400, { error: "answer required" });

  try {
    const updatedRows = await restPatch(
      cfg,
      "staff_kb_gaps",
      `id=eq.${encodeURIComponent(id)}&select=id,assistant_answer,updated_at`,
      {
        assistant_answer: answer,
        updated_at: new Date().toISOString(),
      }
    );
    if (!updatedRows || !updatedRows.length) return json(res, 404, { error: "KB gap not found" });
    return json(res, 200, { ok: true, item: updatedRows[0] });
  } catch (e) {
    return json(res, 500, { error: "Failed to save KB gap draft" });
  }
};
