/**
 * POST /api/knowledge-gap
 *
 * Called by the RAG pipeline (rag-answer.js) whenever a question comes in
 * that the knowledge base couldn't answer (status: "no_answer").
 *
 * Stores the question in the knowledge_gaps table so Julie can review it,
 * write an approved answer, and optionally add it to the KB.
 *
 * ManyChat / rag-answer sends:
 *   phone               (optional) WhatsApp phone number of the lead who asked
 *   question            (required) the exact question that wasn't answered
 *   conversation_context (optional) recent chat context to help Julie understand
 *   us_state            (optional) defaults to 'NE'
 *   channel             (optional) defaults to 'whatsapp'
 *
 * Returns:
 *   { success: true, gap_id: "..." }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MANYCHAT_WEBHOOK_SECRET
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { insertKnowledgeGap, getContactByPhone, logWebhook } = require("../lib/contacts-db");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  logRequest("knowledge-gap");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, error: "Method Not Allowed" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    return json(res, auth.status, { success: false, error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: "Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const question = String(body.question || "").trim();
  if (!question) {
    return json(res, 400, { success: false, error: "question is required" });
  }

  const phone = String(body.phone || "").trim() || null;
  const usState = String(body.us_state || "NE").trim().toUpperCase();
  const channel = String(body.channel || "whatsapp").trim();
  const conversationContext = String(body.conversation_context || "").trim() || null;

  logWebhook(supabaseUrl, supabaseKey, "manychat", "/api/knowledge-gap", { question, phone });

  try {
    // Try to find contact_id if phone is provided (best-effort, non-blocking)
    let contactId = null;
    if (phone) {
      try {
        const contact = await getContactByPhone(supabaseUrl, supabaseKey, phone);
        if (contact) contactId = contact.id;
      } catch (_) {
        // Non-fatal — log the gap even if we can't link it to a contact
      }
    }

    const gap = await insertKnowledgeGap(supabaseUrl, supabaseKey, {
      question,
      contactId,
      phone,
      us_state: usState,
      channel,
      conversationContext,
    });

    console.log("knowledge-gap stored:", gap.id, "question:", question.slice(0, 80));

    return json(res, 200, { success: true, gap_id: gap.id });
  } catch (e) {
    console.error("knowledge-gap error:", e.message);
    return json(res, 500, { success: false, error: "Server error storing knowledge gap" });
  }
};
