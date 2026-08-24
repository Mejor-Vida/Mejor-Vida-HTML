/**
 * Watch Facebook Page comments and reply as the Page.
 * INFO → article link from this week's queue. REVISAR → WhatsApp/DM.
 * Other comments → short educational Spanish reply (no premiums / approvals).
 */

const { sbFetch } = require("./crm-newsletter-send");
const { pageCreds, fetchComment, publishComment } = require("./facebook-page-publish");

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

async function openAiCommentReply(apiKey, commentText, postHint) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "You reply as Mejor Vida Insurance on a public Facebook comment. Spanish (tú), 2–4 short sentences, warm, 8th-grade reading level. No emojis. Educational only. Never invent premiums, approval, or coverage. Never list licensed states. Do not give a personal underwriting decision. If they ask about their own case, invite WhatsApp " +
            PHONE +
            " instead of answering in public. Agency name: Mejor Vida Insurance.",
        },
        {
          role: "user",
          content: JSON.stringify({
            comment: commentText,
            post_context: postHint || "",
          }),
        },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI comment reply ${r.status}: ${err}`);
  }
  const text =
    data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return String(text || "").trim();
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

async function composeReply({ intent, message, storyUrl, apiKey, postHint }) {
  if (intent === "info") return infoReply(storyUrl);
  if (intent === "revisar") return revisarReply();
  if (!apiKey) {
    return (
      `Gracias por tu comentario. Si quieres el artículo, comenta INFO. ` +
      `Si quieres que veamos tu caso, WhatsApp al ${PHONE}.`
    );
  }
  const ai = await openAiCommentReply(apiKey, message, postHint);
  if (!ai) return revisarReply();
  return ai.slice(0, 800);
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
    apiKey: opts.apiKey || process.env.OPENAI_API_KEY,
    postHint: storyUrl,
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
  infoReply,
  revisarReply,
  processFeedComments,
  processPageCommentEvent,
};
