/**
 * Watch Facebook Page comments and reply as the Page using the public RAG chatbot.
 * Bare INFO → article link. Bare REVISAR → WhatsApp. Any real question → runRagPipeline.
 */

const { sbFetch } = require("./crm-newsletter-send");
const { pageCreds, fetchComment, publishComment } = require("./facebook-page-publish");
const { runRagPipeline } = require("./rag-pipeline");
const { wrapResendEmailHtml, signatureBlockEN, LOGO_EN } = require("./resend-email-template");

const SITE = "https://www.mejorvidainsurance.com";
const PHONE = "(402) 440-5438";
const STAFF_COMMENT_NOTIFY_TO = ["julie@mejorvidainsurance.com", "admin@mejorvidainsurance.com"];
const BUSINESS_SUITE_INBOX_URL = "https://business.facebook.com/latest/inbox";

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
        senderName: String((v.from && v.from.name) || v.sender_name || "").trim(),
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

function commentNotifyEnabled() {
  const v = String(process.env.FACEBOOK_COMMENT_NOTIFY_EMAIL || "1").trim().toLowerCase();
  return v !== "0" && v !== "false" && v !== "off";
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function commentPreview(text, max) {
  const t = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return "(no text — photo or sticker)";
  const n = max || 80;
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

function facebookCommentPermalink(commentId, postId) {
  const id = String(commentId || "").trim();
  if (id) return `https://www.facebook.com/${encodeURIComponent(id)}`;
  const post = String(postId || "").trim();
  if (post) return `https://www.facebook.com/${encodeURIComponent(post)}`;
  return BUSINESS_SUITE_INBOX_URL;
}

function replyStatusLabel(status) {
  if (status === "replied") return "The Page auto-replied.";
  if (status === "error") return "Auto-reply failed. Please reply from Meta Business Suite if needed.";
  if (status === "empty") return "No text in the comment (photo or sticker). No auto-reply.";
  if (status === "disabled") return "Auto-reply is paused. Please reply from Meta Business Suite if needed.";
  return "No auto-reply was sent.";
}

function buildFacebookCommentNotifyEmail(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const name = String(p.fromName || "").trim() || "Someone on Facebook";
  const commentBody = String(p.message || "").trim() || "(no text — photo or sticker)";
  const permalink = facebookCommentPermalink(p.commentId, p.postId);
  const prefix = String(p.subjectPrefix || "").trim();
  const subject = `${prefix}${prefix ? " " : ""}New Facebook comment: ${commentPreview(commentBody, 70)}`;
  const statusLine = replyStatusLabel(p.replyStatus);
  const replyPreview = String(p.replyText || "").trim();
  const errorPreview = p.replyStatus === "error" ? String(p.replyError || "").trim().slice(0, 200) : "";

  const text =
    `New Facebook comment on Mejor Vida Insurance\n\n` +
    `From: ${name}\n\n` +
    `Comment:\n${commentBody}\n\n` +
    `${statusLine}` +
    (errorPreview ? `\nDetails: ${errorPreview}` : "") +
    (replyPreview ? `\n\nPage reply:\n${replyPreview.slice(0, 400)}\n` : "\n") +
    `\nOpen Meta Business Suite Inbox (iPhone: log in as Julie Braunsroth, then switch to Mejor Vida Insurance):\n${BUSINESS_SUITE_INBOX_URL}\n\n` +
    `Comment on Facebook:\n${permalink}\n`;

  const inner =
    `<p style="margin:0 0 16px;"><strong>New Facebook comment</strong> on Mejor Vida Insurance.</p>` +
    `<p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(name)}</p>` +
    `<blockquote style="margin:0 0 16px;padding:12px 16px;background:#f4f6f8;border-left:4px solid #1e3a8a;">${escapeHtml(commentBody).replace(/\n/g, "<br />")}</blockquote>` +
    `<p style="margin:0 0 16px;">${escapeHtml(statusLine)}${
      errorPreview ? `<br /><span style="color:#888;font-size:13px;">${escapeHtml(errorPreview)}</span>` : ""
    }</p>` +
    (replyPreview
      ? `<p style="margin:0 0 8px;font-size:13px;color:#555;"><strong>Page reply</strong></p><p style="margin:0 0 16px;font-size:14px;color:#444;">${escapeHtml(
          replyPreview.slice(0, 400)
        ).replace(/\n/g, "<br />")}</p>`
      : "") +
    `<p style="margin:0 0 16px;"><a href="${BUSINESS_SUITE_INBOX_URL}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#1e3a8a;color:#fff;font-weight:bold;text-decoration:none;">Open Business Suite Inbox</a></p>` +
    `<p style="margin:0 0 16px;font-size:13px;color:#666;">On iPhone, open that link, log in as Julie Braunsroth, then switch to Mejor Vida Insurance. Ad comments often sit under Inbox → Comments, not the Page bell.</p>` +
    `<p style="margin:0 0 16px;font-size:13px;"><a href="${escapeHtml(permalink)}">View comment on Facebook</a></p>` +
    signatureBlockEN();

  return {
    to: STAFF_COMMENT_NOTIFY_TO.slice(),
    subject,
    text,
    html: wrapResendEmailHtml(inner, LOGO_EN),
  };
}

async function sendCommentNotifyViaGmail(email) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("missing RESEND_API_KEY and Gmail is not configured");
  }
  const { google } = require("./google-clients");
  const recipients = Array.isArray(email.to) ? email.to.join(", ") : String(email.to || "");
  const subject = /[^\x20-\x7e]/.test(email.subject)
    ? `=?UTF-8?B?${Buffer.from(email.subject, "utf8").toString("base64")}?=`
    : email.subject;
  const boundary = `mvi_fb_${Date.now()}`;
  const rfc822 = [
    `From: Mejor Vida Insurance <${fromEmail}>`,
    `To: ${recipients}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    email.text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    email.html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
  const raw = Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  const redirect =
    process.env.GMAIL_REDIRECT_URI || "https://www.mejorvidainsurance.com/api/staff/gmail-callback";
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirect);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const sendResp = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  return { skipped: false, id: sendResp.data && sendResp.data.id ? sendResp.data.id : null };
}

async function notifyStaffOfFacebookComment(payload) {
  if (!commentNotifyEnabled()) return { skipped: true, reason: "disabled" };
  const email = buildFacebookCommentNotifyEmail(payload);
  const key = String(process.env.RESEND_API_KEY || "").trim();
  if (key) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Mejor Vida Insurance <julie@mejorvidainsurance.com>",
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Resend: ${JSON.stringify(json).slice(0, 300)}`);
    return { skipped: false, id: json.id || null };
  }
  return sendCommentNotifyViaGmail(email);
}

async function maybeNotifyStaff(event, extra) {
  extra = extra || {};
  try {
    return await notifyStaffOfFacebookComment({
      commentId: (event && event.commentId) || extra.commentId || "",
      postId: extra.postId || (event && event.postId) || "",
      fromName: extra.fromName || (event && event.senderName) || "",
      message: extra.message != null ? extra.message : (event && event.message) || "",
      replyText: extra.replyText || "",
      replyStatus: extra.replyStatus || "unknown",
      replyError: extra.replyError || "",
    });
  } catch (e) {
    console.error("[facebook-comment] staff notify failed", String(e.message || e).slice(0, 200));
    return { skipped: true, reason: "notify_failed" };
  }
}

async function processPageCommentEvent(event, opts) {
  opts = opts || {};
  const supabaseUrl = (opts.supabaseUrl || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = opts.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase env");

  let { pageId } = pageCreds();
  const expectedPage = String(process.env.FACEBOOK_PAGE_ID || pageId).trim();
  if (event.pageId && expectedPage && event.pageId !== expectedPage) {
    return { skipped: true, reason: "other_page" };
  }

  const existing = await alreadyHandled(supabaseUrl, serviceKey, event.commentId);
  if (existing) return { skipped: true, reason: "already_handled", id: existing.id };

  let fromId = event.senderId;
  let fromName = event.senderName || "";
  let message = event.message;
  let postId = event.postId;
  try {
    const full = await fetchComment(event.commentId);
    if (full.from && full.from.id) fromId = String(full.from.id);
    if (full.from && full.from.name) fromName = String(full.from.name);
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

  const notify = (extra) => maybeNotifyStaff(event, { fromName, message, postId, ...extra });
  const intent = commentIntent(message);

  if (!commentAiEnabled()) {
    const row = await insertReplyRow(supabaseUrl, serviceKey, {
      comment_id: event.commentId,
      post_id: postId || null,
      from_id: fromId || null,
      comment_text: message || null,
      intent: intent === "empty" ? "empty" : "skip",
      status: "skipped",
      skip_reason: "disabled",
    });
    await notify({ replyStatus: "disabled" });
    return { skipped: true, reason: "disabled", id: row && row.id };
  }

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
    await notify({ replyStatus: "empty" });
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
    await notify({ replyStatus: "replied", replyText });
    return { skipped: false, intent, id: row.id, reply_id: posted.id || null };
  } catch (e) {
    await patchReplyRow(supabaseUrl, serviceKey, row.id, {
      status: "error",
      error_message: String(e.message || e).slice(0, 500),
    });
    await notify({
      replyStatus: "error",
      replyText,
      replyError: String(e.message || e).slice(0, 200),
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
      const error = String(e.message || e).slice(0, 200);
      await maybeNotifyStaff(event, { replyStatus: "error", replyError: error });
      results.push({ skipped: false, error, commentId: event.commentId });
    }
  }
  return { comments: events.length, results };
}

module.exports = {
  commentAiEnabled,
  commentNotifyEnabled,
  parseFeedCommentEvents,
  commentIntent,
  isKeywordOnly,
  ragToFacebookText,
  infoReply,
  revisarReply,
  buildFacebookCommentNotifyEmail,
  notifyStaffOfFacebookComment,
  processFeedComments,
  processPageCommentEvent,
  STAFF_COMMENT_NOTIFY_TO,
};
