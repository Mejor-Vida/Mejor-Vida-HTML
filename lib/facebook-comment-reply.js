/**
 * Watch Facebook Page comments and reply as the Page.
 *
 * Real questions use RAG (public consumer facts only), then a short wrap:
 * - First reply: thank them; automated assistant of Mejor Vida Seguros;
 *   Julie was notified and will private-message; then one simple answer.
 * - Later replies: skip that intro. One short usted answer. End with
 *   “Si tiene otra pregunta, puede escribirla aquí.”
 * Strip phones, emails, URLs, licensed-state lists, sample prices, and
 * website-chat CTAs. Bare INFO / Information = intro only.
 * Complaints / insults skip RAG: thank them, do not argue, joke, or sell.
 * lockedFacebookAnswer() is a fallback when RAG is empty — not a wall.
 */

const { sbFetch } = require("./crm-newsletter-send");
const { pageCreds, fetchComment, publishComment } = require("./facebook-page-publish");
const { runRagPipeline } = require("./rag-pipeline");
const { wrapResendEmailHtml, signatureBlockEN, LOGO_EN } = require("./resend-email-template");

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

function normalizeCommentWords(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isInfoOnly(text) {
  const t = normalizeCommentWords(text);
  return t === "info" || t === "information" || t === "informacion";
}

function commentIntent(text) {
  const t = normalizeCommentWords(text);
  if (!t) return "empty";
  if (t === "revisar") return "revisar";
  if (isInfoOnly(text) || /(^|\b)info(\b|$)/.test(t) || /\binformacion\b/.test(t) || /\binformation\b/.test(t)) {
    return "info";
  }
  if (/\brevisar\b/.test(t)) return "revisar";
  return "other";
}

function isSpanishComment(text) {
  return commentLanguage(text) !== "English";
}

function commentFirstName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const token = raw.split(/\s+/)[0] || "";
  const cleaned = token.replace(/[^\p{L}'’-]/gu, "");
  if (cleaned.length < 2 || cleaned.length > 24) return "";
  if (/^(facebook|user|usuario|someone|alguien)$/i.test(cleaned)) return "";
  return cleaned;
}

function commentOpening(text, opts) {
  opts = opts || {};
  const ask = opts.askForQuestion !== false;
  const name = commentFirstName(opts.senderName);
  if (isSpanishComment(text)) {
    let out = name
      ? `Gracias por su comentario, ${name}. Soy el asistente automático de Mejor Vida Seguros. `
      : "Gracias por su comentario. Soy el asistente automático de Mejor Vida Seguros. ";
    out += "Ya avisamos a Julie y le enviará un mensaje privado lo antes posible.";
    if (ask) out += " ¿Tiene alguna pregunta concreta que yo pueda responderle aquí?";
    return out;
  }
  let out = name
    ? `Thank you for your comment, ${name}. I am Mejor Vida Insurance’s automated assistant. `
    : "Thank you for your comment. I am Mejor Vida Insurance’s automated assistant. ";
  out += "Julie has been notified and will send you a private message as soon as she can.";
  if (ask) out += " Do you have a specific question I can answer here?";
  return out;
}

function followUpLine(text) {
  return isSpanishComment(text)
    ? "Si tiene otra pregunta, puede escribirla aquí."
    : "If you have another question, you can ask it here.";
}

function wrapFacebookReply(text, answer, opts) {
  opts = opts || {};
  const first = opts.firstInConversation !== false;
  const openingOpts = { senderName: opts.senderName };
  const body = String(answer || "").trim();
  if (first) {
    if (!body) return commentOpening(text, { ...openingOpts, askForQuestion: true });
    return `${commentOpening(text, { ...openingOpts, askForQuestion: false })}\n\n${body}\n\n${followUpLine(text)}`;
  }
  if (!body) {
    return isSpanishComment(text) ? "¿Qué le gustaría saber?" : "What would you like to know?";
  }
  return `${body}\n\n${followUpLine(text)}`;
}

function infoReply(opts) {
  return commentOpening("info", { askForQuestion: true, ...(opts || {}) });
}

function revisarReply() {
  return commentOpening("revisar", { askForQuestion: true });
}

function isKeywordOnly(text, keyword) {
  return normalizeCommentWords(text) === String(keyword || "").toLowerCase();
}

function looksLikeStateQuestion(text) {
  const t = normalizeCommentWords(text);
  return (
    /\b(estoy en|vivo en|i am in|im in|estado de|state of)\b/.test(t) ||
    /\b(que estados|which states|en que estados|licensed states)\b/.test(t)
  );
}

function stateLocationReply(text) {
  return isSpanishComment(text)
    ? "Julie le confirmará en el mensaje privado si podemos ayudarle en su estado. No ponga datos personales en este comentario."
    : "Julie will confirm in the private message whether we can help in your state. Please don’t share personal details in this comment.";
}

function isWhoIsJulieComment(text) {
  const t = normalizeCommentWords(text);
  if (!/\bjulie\b/.test(t)) return false;
  return (
    /\b(quien es|who is|whos|who s|tell me about|hablame de|cuentame de|sobre julie)\b/.test(t) ||
    /^(quien|who)\s+julie\b/.test(t)
  );
}

function whoIsJulieCommentReply(text) {
  return isSpanishComment(text)
    ? "Julie Braunsroth es la fundadora de Mejor Vida Seguros y una agente de seguros licenciada (NPN #21695431). Ella es quien le enviará el mensaje privado."
    : "Julie Braunsroth is the founder of Mejor Vida Insurance and a licensed insurance agent (NPN #21695431). She is the person who will send you the private message.";
}

function isCostComment(text) {
  const t = normalizeCommentWords(text);
  return (
    /\b(cuanto cuesta|cuanto questa|how much does|how much is)\b/.test(t) ||
    ((/\b(cuanto|cuesta|costo|precio|prima|mensual|monthly|how much|premium)\b/.test(t) &&
      /\b(seguro|gastos finales|funeral|life|coverage|cobertura|poliza|insurance)\b/.test(t)) ||
      (/\b(precio|prima|cuesta)\b/.test(t) && /\b(mensual|al mes|monthly)\b/.test(t)))
  );
}

function costCommentReply(text) {
  return isSpanishComment(text)
    ? "El precio mensual de un seguro de gastos finales no es igual para todos: depende de su edad, salud y el monto de cobertura. Julie le puede mostrar un estimado personal en el mensaje privado."
    : "The monthly price of final expense insurance is not the same for everyone: it depends on your age, health, and coverage amount. Julie can show a personal estimate in the private message.";
}

function extractCommentAge(text) {
  const t = normalizeCommentWords(text).replace(/\btango\b/g, "tengo");
  const m =
    t.match(/\b(?:tengo|tango|soy|i am|im)\s+(\d{1,3})\b/) ||
    t.match(/\b(\d{1,3})\s*(anos|years?|yr)\b/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n < 1 || n > 120) return null;
  return n;
}

function isCanBuyComment(text) {
  const t = normalizeCommentWords(text);
  const age = extractCommentAge(text);
  return (
    /\b(puedo comprar|puedo pedir|can i buy|can i get|califico|qualify|me venden)\b/.test(t) ||
    (age != null && /\b(puedo|seguro|comprar|buy|califico)\b/.test(t)) ||
    (age != null && /\b(anos|years)\b/.test(t) && t.split(" ").filter(Boolean).length <= 8)
  );
}

function canBuyCommentReply(text) {
  const age = extractCommentAge(text);
  const es = isSpanishComment(text);
  if (age != null && age < 18) {
    return es
      ? "Las cotizaciones en línea empiezan a los 18 años. Julie le puede orientar en el mensaje privado."
      : "Online quotes start at age 18. Julie can guide you in the private message.";
  }
  if (age != null && age > 89) {
    return es
      ? "A esa edad las opciones nuevas son más limitadas. Julie le confirmará qué aplica en el mensaje privado."
      : "At that age new options are more limited. Julie will confirm what applies in the private message.";
  }
  if (age != null && age < 45) {
    return es
      ? `Sí. A los ${age} años puede comprar un seguro de vida. Algunos planes de gastos finales empiezan a edades más altas, y a su edad a menudo encaja mejor un seguro temporal u otra vida permanente. Julie le dirá qué opciones aplican en el mensaje privado.`
      : `Yes. At ${age} you can buy life insurance. Some final expense plans start at older ages, and at your age term or another permanent policy often fits better. Julie will tell you which options apply in the private message.`;
  }
  if (age != null) {
    return es
      ? `Sí. A los ${age} años puede pedir un seguro de gastos finales u otra cobertura de vida, según su salud y el monto. Julie le dirá qué opciones aplican en el mensaje privado.`
      : `Yes. At ${age} you can ask about final expense or other life coverage, depending on health and amount. Julie will tell you which options apply in the private message.`;
  }
  return es
    ? "Sí, puede pedir un seguro de vida. Julie le dirá en el mensaje privado qué opciones encajan con su edad y salud."
    : "Yes, you can ask about life insurance. Julie will tell you in the private message which options fit your age and health.";
}

function lockedFacebookAnswer(message) {
  if (isWhoIsJulieComment(message)) return whoIsJulieCommentReply(message);
  if (isCostComment(message)) return costCommentReply(message);
  if (isCanBuyComment(message)) return canBuyCommentReply(message);
  if (looksLikeStateQuestion(message)) return stateLocationReply(message);
  return null;
}

function isHostileOrComplaintComment(text) {
  const t = normalizeCommentWords(text);
  if (!t || isInfoOnly(text)) return false;
  return (
    /\b(estafa|estafador|estafadores|estafan|scam|scammer|scams|fraude|fraud|ladron|ladrones|mentira|mentiras|mentiroso|basura|estupido|estupida|idiota|mierda|carajo|ripoff|rip off|timo|timadores|fake|farsante|charlatan|charlatanes)\b/.test(
      t
    ) ||
    /\b(nunca compren|no lo compren|no compren esto|dont buy|do not buy|waste of money|perdida de dinero|no vale la pena|not worth it)\b/.test(
      t
    ) ||
    /\b(que asco|asco de|son unos|ya basta|dejen de publicar|stop posting|nobody wants|nadie quiere|yeah right|si como no|claro como no)\b/.test(
      t
    ) ||
    (/\b(muy caro|too expensive|caro de mas)\b/.test(t) &&
      !isCostComment(text) &&
      !isCanBuyComment(text) &&
      !isWhoIsJulieComment(text) &&
      !looksLikeStateQuestion(text) &&
      !/[¿?]/.test(String(text || "")))
  );
}

function complaintAckReply(text) {
  return isSpanishComment(text)
    ? "Gracias. Julie le escribirá en privado."
    : "Thank you. Julie will write you privately.";
}

const PUBLIC_CARRIER_RE =
  /\b(Assurity|Mutual of Omaha|Transamerica|American Amicable|Aetna|Accendo|Corebridge|Protect\+|Perform\+|Living Promise|Americo)\b/gi;

function commentNamedCarrier(text) {
  return /\b(Assurity|Mutual of Omaha|Transamerica|American Amicable|Aetna|Accendo|Corebridge|Protect\+|Perform\+|Living Promise|Americo)\b/i.test(
    String(text || "")
  );
}

function lockFacebookAnswer(answer, commentText) {
  let t = ragToFacebookText(answer);
  t = t.replace(/402[-.\s]?440[-.\s]?5438/g, "");
  t = t.replace(/julie@mejorvidainsurance\.com/gi, "");
  t = t.replace(/\b(ll[aá]mala|ll[aá]me|llamar|escr[ií]bele|whatsapp)\b[^.]{0,80}/gi, "");
  t = t.replace(/\b1201\s+O\s+St\b[^.]{0,60}/gi, "");
  t = t.replace(/\$\d{1,3}(\s*[–—-]\s*\$?\d{1,3})?(\s*(al mes|a month|\/mes|mensual(es)?))?/gi, "");
  if (!commentNamedCarrier(commentText)) {
    t = t.replace(PUBLIC_CARRIER_RE, "");
  }
  t = t.replace(/\s+[–—-]\s*$/g, "");
  t = t.replace(/\s{2,}/g, " ").replace(/\n{2,}/g, " ").trim();
  const parts = t.split(/(?<=[.!?])\s+/).filter((p) => p && /[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(p));
  return parts.slice(0, 2).join(" ").trim().slice(0, 360);
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
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\b(Nebraska|Kansas|Colorado|Nevada|NE|KS|CO|NV)(,|\s+y\s+|\s+and\s+|\s*\/\s*|\s+)/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, 420);
}

async function ragFacebookReply(commentText) {
  try {
    const language = commentLanguage(commentText);
    const out = await runRagPipeline(
      {
        question: commentText,
        language,
        phone: "",
        flow_stage: "facebook_comment",
        conversationContext:
          `Public Facebook comment. Answer from public consumer knowledge only. ` +
          `1–2 short sentences, Spanish usted. No phone, email, URL, licensed-state list, or sample prices. ` +
          `Never sarcastic, witty, or argumentative. Never lecture, never “that’s exactly why you should plan,” ` +
          `never debate a complaint. If they are upset, thank them and say Julie will write privately.`,
      },
      { hubspotNotePrefix: "Facebook comment RAG" }
    );
    if (out && out.answer) return lockFacebookAnswer(out.answer, commentText);
  } catch (e) {
    console.warn("facebook comment RAG", e && e.message);
  }
  return "";
}

async function composeReply({ intent, message, firstInConversation, senderName }) {
  const first = firstInConversation !== false;
  const wrapOpts = { firstInConversation: first, senderName };
  if (
    isInfoOnly(message) ||
    (intent === "revisar" && isKeywordOnly(message, "revisar")) ||
    (intent === "info" &&
      normalizeCommentWords(message).split(" ").filter(Boolean).length <= 6 &&
      !looksLikeStateQuestion(message) &&
      !isWhoIsJulieComment(message) &&
      !isCostComment(message) &&
      !isCanBuyComment(message))
  ) {
    if (first) return commentOpening(message, { askForQuestion: true, senderName });
    return isSpanishComment(message) ? "¿Qué le gustaría saber?" : "What would you like to know?";
  }
  if (isHostileOrComplaintComment(message)) {
    const product = lockedFacebookAnswer(message);
    if (product) return wrapFacebookReply(message, product, wrapOpts);
    if (first) return wrapFacebookReply(message, "", wrapOpts);
    return wrapFacebookReply(message, complaintAckReply(message), wrapOpts);
  }
  const rag = await ragFacebookReply(message);
  if (rag) return wrapFacebookReply(message, rag, wrapOpts);
  const locked = lockedFacebookAnswer(message);
  if (locked) return wrapFacebookReply(message, locked, wrapOpts);
  return wrapFacebookReply(message, "", wrapOpts);
}

async function hasPriorPageReply(supabaseUrl, serviceKey, fromId) {
  if (!fromId) return false;
  const rows =
    (await sbFetch(
      supabaseUrl,
      serviceKey,
      `/facebook_comment_replies?from_id=eq.${encodeURIComponent(
        fromId
      )}&status=eq.replied&select=id&limit=1`
    )) || [];
  return !!(rows && rows[0]);
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

  const firstInConversation = !(await hasPriorPageReply(supabaseUrl, serviceKey, fromId));
  const replyText = await composeReply({
    intent,
    message,
    firstInConversation,
    senderName: fromName,
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
  isInfoOnly,
  commentOpening,
  wrapFacebookReply,
  ragToFacebookText,
  lockFacebookAnswer,
  lockedFacebookAnswer,
  isHostileOrComplaintComment,
  commentFirstName,
  infoReply,
  revisarReply,
  composeReply,
  buildFacebookCommentNotifyEmail,
  notifyStaffOfFacebookComment,
  processFeedComments,
  processPageCommentEvent,
  STAFF_COMMENT_NOTIFY_TO,
};
