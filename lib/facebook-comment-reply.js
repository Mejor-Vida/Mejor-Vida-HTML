/**
 * Watch Facebook Page comments and reply as the Page using the public RAG chatbot.
 * Bare INFO → article link. Bare REVISAR → WhatsApp. Any real question → runRagPipeline.
 */

const { sbFetch } = require("./crm-newsletter-send");
const { pageCreds, fetchComment, publishComment } = require("./facebook-page-publish");
const { runRagPipeline } = require("./rag-pipeline");

const SITE = "https://www.mejorvidainsurance.com";
const PHONE = "(402) 440-5438";

function commentAiEnabled() {
  const v = String(process.env.FACEBOOK_COMMENT_AI_REPLY || "1").trim().toLowerCase();
  return v !== "0" && v !== "false" && v !== "off";
}

function parseFeedCommentEvents(body) {
  const out = [];
  if (!body || body.object !== "page" || !Array.isArray(body.entry)) return out;
  for (const entry of body.entry) {
    const pageId = String((entry && entry.id) || "");
    const changes = Array.isArray(entry && entry.changes) ? entry.changes : [];
    for (const ch of changes) {
      if (!ch || ch.field !== "feed") continue;
      const v = ch.value || {};
      const item = String(v.item || "").toLowerCase();
      const verb = String(v.verb || "").toLowerCase();
      if (item !== "comment" || verb !== "add") continue;
      const commentId = String(v.comment_id || v.commentid || "").trim();
      if (!commentId) continue;
      out.push({
        pageId,
        commentId,
        postId: String(v.post_id || (v.post && v.post.id) || "").trim(),
        parentId: v.parent_id ? String(v.parent_id) : null,
        senderId: String(v.sender_id || (v.from && v.from.id) || "").trim(),
        message: String(v.message || ""),
      });
    }
  }
  return out;
}

function commentIntent(text) {
  const t = String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!t) return "empty";
  if (/\brevisar\b/.test(t)) return "revisar";
  if (/(^|\b)info(\b|$)/.test(t)) return "info";
  return "other";
}

function infoReply(storyUrl) {
  const url = storyUrl || `${SITE}/`;
  return (
    `Gracias. Aquí está el artículo:\n${url}\n\n` +
    `Si quieres que veamos tu caso, comenta REVISAR o escríbenos por WhatsApp al ${PHONE}. ` +
    `No pongas datos personales en el comentario.`
  );
}

function revisarReply() {
  return (
    `Gracias por escribir. Para revisar tu situación con calma, mándanos un mensaje ` +
    `o WhatsApp al ${PHONE}. No pongas datos de salud ni documentos en un comentario público.`
  );
}

function isKeywordOnly(text, keyword) {
  const t = String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t === keyword;
}

function commentLanguage(text) {
  const t = String(text || "");
  if (/[áéíóúüñ¿¡]/i.test(t) || /\b(qué|que|cómo|como|cuánto|cuanto|para|una|el|la|por|con)\b/i.test(t)) {
    return "Spanish";
  }
  if (/\b(the|what|how|why|can|does|is|are|my|your)\b/i.test(t)) return "English";
  return "Spanish";
}

/** Facebook comments do not render Markdown the way the website chat does. */
function ragToFacebookText(answer) {
  return String(answer || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 $2")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 1800);
}

async function ragFacebookReply(commentText, storyUrl) {
  const language = commentLanguage(commentText);
  const out = await runRagPipeline(
    {
      question: commentText,
      language,
      phone: "",
      flow_stage: "facebook_comment",
      conversationContext:
        `This is a public Facebook Page comment (not a private chat). ` +
        `Related weekly article: ${storyUrl || SITE + "/blog.html"}. ` +
        `Keep the answer concise for a public comment. Do not ask for health details, SSN, or documents here. ` +
        `If the person needs a personal review, invite WhatsApp ${PHONE}.`,
    },
    { hubspotNotePrefix: "Facebook comment RAG" }
  );
  if (out && out.answer) return ragToFacebookText(out.answer);
  if (language === "English") {
    return `I want to point you the right way, not guess. Comment a bit more detail, or WhatsApp ${PHONE}.`;
  }
  return `Quiero orientarte bien y no adivinar. Cuéntame un poco más en el comentario, o WhatsApp al ${PHONE}.`;
}

async function storyUrlForPost(supabaseUrl, serviceKey, postId) {
  if (!postId) return `${SITE}/blog.html`;
  const exact =
    (await sbFetch(
      supabaseUrl,
      serviceKey,
      `/weekly_facebook_queue?fb_post_id=eq.${encodeURIComponent(postId)}&select=story_url,week_key,slot&limit=1`
    )) || [];
  if (exact[0] && exact[0].story_url) return exact[0].story_url;
  const recent =
    (await sbFetch(
      supabaseUrl,
      serviceKey,
      `/weekly_facebook_queue?status=in.(posted,commented)&order=published_at.desc&limit=1&select=story_url`
    )) || [];
  if (recent[0] && recent[0].story_url) return recent[0].story_url;
  return `${SITE}/blog.html`;
}

async function alreadyHandled(supabaseUrl, serviceKey, commentId) {
  const rows =
    (await sbFetch(
      supabaseUrl,
      serviceKey,
      `/facebook_comment_replies?comment_id=eq.${encodeURIComponent(commentId)}&select=id,status&limit=1`
    )) || [];
  return rows[0] || null;
}

async function insertReplyRow(supabaseUrl, serviceKey, payload) {
  const inserted = await sbFetch(supabaseUrl, serviceKey, "/facebook_comment_replies", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return Array.isArray(inserted) ? inserted[0] : inserted;
}

async function patchReplyRow(supabaseUrl, serviceKey, id, payload) {
  await sbFetch(supabaseUrl, serviceKey, `/facebook_comment_replies?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
  });
}

async function composeReply({ intent, message, storyUrl }) {
  if (intent === "info" && isKeywordOnly(message, "info")) return infoReply(storyUrl);
  if (intent === "revisar" && isKeywordOnly(message, "revisar")) return revisarReply();
  return ragFacebookReply(message, storyUrl);
}

async function processPageCommentEvent(event, opts) {
  opts = opts || {};
  const supabaseUrl = (opts.supabaseUrl || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = opts.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!commentAiEnabled()) return { skipped: true, reason: "disabled" };
  if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase env");

  let { pageId } = pageCreds();
  const expectedPage = String(process.env.FACEBOOK_PAGE_ID || pageId).trim();
  if (event.pageId && expectedPage && event.pageId !== expectedPage) {
    return { skipped: true, reason: "other_page" };
  }

  const existing = await alreadyHandled(supabaseUrl, serviceKey, event.commentId);
  if (existing) return { skipped: true, reason: "already_handled", id: existing.id };

  let fromId = event.senderId;
  let message = event.message;
  let postId = event.postId;
  try {
    const full = await fetchComment(event.commentId);
    if (full.from && full.from.id) fromId = String(full.from.id);
    if (full.message) message = String(full.message);
    if (full.post && full.post.id) postId = String(full.post.id);
  } catch (_) {
    /* webhook payload may be enough */
  }

  if (fromId && expectedPage && fromId === expectedPage) {
    const row = await insertReplyRow(supabaseUrl, serviceKey, {
      comment_id: event.commentId,
      post_id: postId || null,
      from_id: fromId,
      comment_text: message || null,
      intent: "skip",
      status: "skipped",
      skip_reason: "page_own_comment",
    });
    return { skipped: true, reason: "page_own_comment", id: row && row.id };
  }

  const intent = commentIntent(message);
  if (intent === "empty") {
    const row = await insertReplyRow(supabaseUrl, serviceKey, {
      comment_id: event.commentId,
      post_id: postId || null,
      from_id: fromId || null,
      comment_text: message || null,
      intent,
      status: "skipped",
      skip_reason: "empty_message",
    });
    return { skipped: true, reason: "empty_message", id: row && row.id };
  }

  const storyUrl = await storyUrlForPost(supabaseUrl, serviceKey, postId);
  const replyText = await composeReply({
    intent,
    message,
    storyUrl,
  });

  let row;
  try {
    row = await insertReplyRow(supabaseUrl, serviceKey, {
      comment_id: event.commentId,
      post_id: postId || null,
      from_id: fromId || null,
      comment_text: message || null,
      intent,
      reply_text: replyText,
      status: "pending",
    });
  } catch (e) {
    if (/duplicate|unique|409/i.test(String(e.message || e))) {
      return { skipped: true, reason: "already_handled" };
    }
    throw e;
  }

  try {
    const posted = await publishComment(event.commentId, replyText);
    await patchReplyRow(supabaseUrl, serviceKey, row.id, {
      status: "replied",
      reply_id: posted.id || null,
      error_message: null,
    });
    return { skipped: false, intent, id: row.id, reply_id: posted.id || null };
  } catch (e) {
    await patchReplyRow(supabaseUrl, serviceKey, row.id, {
      status: "error",
      error_message: String(e.message || e).slice(0, 500),
    });
    return { skipped: false, intent, id: row.id, error: String(e.message || e).slice(0, 200) };
  }
}

async function processFeedComments(body, opts) {
  const events = parseFeedCommentEvents(body);
  const results = [];
  for (const event of events) {
    try {
      results.push(await processPageCommentEvent(event, opts));
    } catch (e) {
      results.push({ skipped: false, error: String(e.message || e).slice(0, 200), commentId: event.commentId });
    }
  }
  return { comments: events.length, results };
}

module.exports = {
  commentAiEnabled,
  parseFeedCommentEvents,
  commentIntent,
  isKeywordOnly,
  ragToFacebookText,
  infoReply,
  revisarReply,
  processFeedComments,
  processPageCommentEvent,
};
