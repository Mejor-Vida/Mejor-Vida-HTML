const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody } = require("./_inbox-lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const id = String((body && body.id) || "").trim();
  const replyDraft = String((body && body.reply_draft) || "").trim();
  if (!id || !replyDraft) {
    return json(res, 400, { error: "id and reply_draft required" });
  }

  return json(res, 200, {
    success: false,
    message: "Gmail not configured yet",
  });
};
