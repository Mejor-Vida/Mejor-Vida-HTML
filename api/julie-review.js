/**
 * GET /api/julie-review
 *
 * Julie's read-only view of all knowledge gaps pending her review.
 * Returns questions sorted oldest-first so Julie works through them in order.
 *
 * Optionally filter:
 *   ?limit=25         max rows to return (default 50)
 *   ?us_state=NE      filter by state
 *
 * Returns:
 *   { gaps: [ { id, question, phone, us_state, context, created_at } ] }
 *
 * This endpoint is NOT called by ManyChat — it's for Julie's review interface
 * (could be a simple web page, Notion integration, or email digest).
 *
 * Auth: Uses MANYCHAT_WEBHOOK_SECRET in X-App-Secret header (same secret,
 * easy to call from a simple review form or Zapier).
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { getPendingKnowledgeGaps } = require("../lib/contacts-db");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  logRequest("julie-review");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { success: false, error: "Method Not Allowed" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    return json(res, auth.status, { success: false, error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Server missing Supabase env vars" });
  }

  const limit = Math.min(parseInt(req.query && req.query.limit || "50", 10), 200) || 50;

  try {
    const gaps = await getPendingKnowledgeGaps(supabaseUrl, supabaseKey, limit);

    const formatted = gaps.map((g) => ({
      id: g.id,
      question: g.question,
      phone: g.phone,
      us_state: g.us_state,
      context: g.conversation_context,
      channel: g.channel,
      created_at: g.created_at,
    }));

    return json(res, 200, {
      success: true,
      count: formatted.length,
      gaps: formatted,
    });
  } catch (e) {
    console.error("julie-review error:", e.message);
    return json(res, 500, { success: false, error: "Server error fetching knowledge gaps" });
  }
};
