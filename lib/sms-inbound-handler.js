/**
 * Shared inbound SMS keyword handling (Telnyx webhook).
 */
const { logContactCommunication } = require("./contact-communications");

function sbHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function sbGet(supabaseUrl, key, path) {
  const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1${path}`, {
    headers: sbHeaders(key),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status} ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

async function sbPatch(supabaseUrl, key, path, data) {
  const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1${path}`, {
    method: "PATCH",
    headers: { ...sbHeaders(key), Prefer: "return=minimal" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase PATCH ${path}: ${res.status} ${t.slice(0, 200)}`);
  }
}

async function logSmsCommunication(supabaseUrl, supabaseKey, contactId, direction, bodyText, meta) {
  if (!contactId || !bodyText) return;
  await logContactCommunication(supabaseUrl, supabaseKey, {
    contactId,
    direction,
    channel: "sms",
    summary: bodyText,
    body: bodyText,
    meta: meta || {},
  });
}

async function sendNurtureEmail(contact, intent) {
  const quoteUrl = "https://www.mejorvidainsurance.com/quote.html";
  const scheduleUrl = "https://www.mejorvidainsurance.com/schedule-julie.html";
  const name =
    (contact.first_name || (contact.full_name || "").split(" ")[0] || "there").trim() || "there";

  const btn = (text, url, bg) =>
    `<a href="${url}" style="display:inline-block;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:15px;text-decoration:none;margin:8px 6px;background:${bg};color:#fff;">${text}</a>`;

  const wrap = (body) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;}
.c{max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
.h{background:#0d2b4e;padding:24px 32px;}.ht{color:#fff;font-size:22px;font-weight:bold;margin:0;}
.hs{color:#a8c4e0;font-size:13px;margin:4px 0 0;}.b{padding:32px;color:#333;font-size:16px;line-height:1.7;}
.b p{margin:0 0 16px;}.cta{text-align:center;padding:8px 0 24px;}
.f{background:#f4f6f8;padding:20px 32px;font-size:12px;color:#888;text-align:center;}
</style></head><body><div class="c">
<div class="h"><p class="ht">Mejor Vida Insurance</p><p class="hs">Seguros Para Una Vida Mejor</p></div>
<div class="b">${body}</div>
<div class="f"><p>© Mejor Vida Insurance | <a href="https://www.mejorvidainsurance.com" style="color:#888;">mejorvidainsurance.com</a></p></div>
</div></body></html>`;

  let subject;
  let html;
  if (intent === "quote") {
    subject = `Here's your free quote link, ${name}!`;
    html = wrap(`<p>Hi ${name},</p>
<p>Thanks for reaching out! Here's your link to get a free final expense quote — it only takes a few minutes:</p>
<div class="cta">${btn("Get My Free Quote", quoteUrl, "#1a56db")}</div>
<p>If you have any questions, just reply to this email or call me directly.</p>
<p>Warmly,<br><strong>Julie</strong><br>Mejor Vida Insurance</p>`);
  } else {
    subject = `Here's the link to schedule your call, ${name}!`;
    html = wrap(`<p>Hi ${name},</p>
<p>I'm looking forward to chatting with you! Click below to pick a time that works for you:</p>
<div class="cta">${btn("Schedule My Call with Julie", scheduleUrl, "#1a56db")}</div>
<p>It's just a quick, no-pressure conversation. I'll walk you through your options and answer any questions you have.</p>
<p>See you soon,<br><strong>Julie</strong><br>Mejor Vida Insurance</p>`);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>",
      to: contact.email,
      subject,
      html,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Resend: ${JSON.stringify(json)}`);
  return json.id;
}

function isEnglish(contact) {
  return String(contact?.idioma || contact?.language || "").toLowerCase() === "english";
}

function normalizeKeyword(msgBody) {
  let keyword = String(msgBody || "")
    .trim()
    .toUpperCase()
    .split(/\s+/)[0];
  if (keyword === "COTIZAR") keyword = "QUOTE";
  if (keyword === "LLAMAR") keyword = "CALL";
  return keyword;
}

/**
 * @returns {Promise<{ reply: string|null, silent: boolean }>}
 *   silent=true → no outbound SMS (STOP)
 *   reply=null + silent=false → empty ack only
 */
async function handleInboundSms({ fromPhone, msgBody, supabaseUrl, supabaseKey, inboundSource }) {
  const keyword = normalizeKeyword(msgBody);

  let contacts;
  try {
    contacts = await sbGet(
      supabaseUrl,
      supabaseKey,
      `/contacts?phone=eq.${encodeURIComponent(fromPhone)}&select=id,first_name,full_name,email,phone,pending_sms_intent,idioma,language&limit=1`
    );
  } catch (err) {
    console.error("[sms-inbound] Contact lookup error:", err.message);
    return { reply: "Sorry, we had a technical issue. Please try again shortly.", silent: false };
  }

  const contact = contacts[0] || null;

  if (contact && msgBody) {
    await logSmsCommunication(supabaseUrl, supabaseKey, contact.id, "inbound", msgBody, {
      source: inboundSource || "sms_inbound",
      from: fromPhone,
    });
  }

  if (keyword === "STOP" || keyword === "UNSUBSCRIBE") {
    if (contact) {
      try {
        await sbPatch(supabaseUrl, supabaseKey, `/nurture_sequence?contact_id=eq.${contact.id}`, {
          twilio_opt_out: true,
          status: "paused",
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("[sms-inbound] STOP update error:", err.message);
      }
    }
    return { reply: null, silent: true };
  }

  if (keyword === "QUOTE" || keyword === "CALL") {
    const english = contact ? isEnglish(contact) : false;
    const quoteUrl = "https://www.mejorvidainsurance.com/quote.html";
    const scheduleUrl = "https://www.mejorvidainsurance.com/schedule-julie.html";
    if (keyword === "QUOTE") {
      return {
        reply: english
          ? `Here's your free quote link: ${quoteUrl} — it only takes a few minutes!`
          : `Aquí está tu enlace para obtener una cotización gratis: ${quoteUrl} — ¡solo toma unos minutos!`,
        silent: false,
      };
    }
    return {
      reply: english
        ? `Here's your link to schedule a call with Julie: ${scheduleUrl}`
        : `Aquí está tu enlace para agendar una llamada con Julie: ${scheduleUrl}`,
      silent: false,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(msgBody)) {
    const email = msgBody.toLowerCase();
    if (!contact) {
      return {
        reply:
          "Thanks! I've saved your email. Reply QUOTE for a free quote link or CALL to schedule a chat with me.",
        silent: false,
      };
    }
    try {
      await sbPatch(supabaseUrl, supabaseKey, `/contacts?id=eq.${contact.id}`, {
        email,
        pending_sms_intent: null,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[sms-inbound] Email save error:", err.message);
    }
    const intent = contact.pending_sms_intent || "quote";
    const updatedContact = { ...contact, email };
    try {
      await sendNurtureEmail(updatedContact, intent);
      return {
        reply:
          intent === "quote"
            ? `Got it! I just sent your free quote link to ${email}. Let me know if you have any questions!`
            : `Got it! I just sent your scheduling link to ${email}. Looking forward to chatting!`,
        silent: false,
      };
    } catch (err) {
      console.error("[sms-inbound] Email send error:", err.message);
      return {
        reply:
          "I saved your email but had trouble sending the link. Call me at 402-844-1199 and I'll help you right now!",
        silent: false,
      };
    }
  }

  return {
    reply:
      "Hola! Soy Julie de Mejor Vida Insurance. Responde COTIZAR para una cotización gratis, LLAMAR para agendar una llamada, o STOP para cancelar. / Hi! Reply QUOTE for a free quote, CALL to schedule a chat, or STOP to unsubscribe.",
    silent: false,
  };
}

function getQueryParam(req, name) {
  const direct = req.query && req.query[name];
  if (direct != null && String(direct).trim()) return String(direct).trim();
  try {
    const path = req.url || "";
    const base = path.startsWith("http") ? path : `https://localhost${path.startsWith("/") ? path : `/${path}`}`;
    const value = new URL(base).searchParams.get(name);
    if (value && value.trim()) return value.trim();
  } catch (_) {
    /* ignore */
  }
  return "";
}

function parseTelnyxFrom(payload) {
  const from = payload && payload.from;
  if (!from) return "";
  if (typeof from === "string") return from.trim();
  if (typeof from === "object") {
    return String(from.phone_number || from.number || "").trim();
  }
  return "";
}

function parseTelnyxInbound(body) {
  if (!body || typeof body !== "object") return null;
  const eventType = body.data && body.data.event_type;
  if (eventType !== "message.received") return null;
  const payload = body.data.payload || {};
  const fromPhone = parseTelnyxFrom(payload);
  const msgBody = String(payload.text || "").trim();
  if (!fromPhone) return null;
  return { fromPhone, msgBody };
}

function validateTelnyxWebhookSecret(req) {
  const expected = (process.env.TELNYX_WEBHOOK_SECRET || "").trim();
  if (!expected) return true;
  const q = getQueryParam(req, "secret");
  if (q && q === expected) return true;
  const h = req.headers["x-mvi-telnyx-secret"] || req.headers["x-telnyx-webhook-secret"];
  return h && String(h).trim() === expected;
}

module.exports = {
  handleInboundSms,
  parseTelnyxInbound,
  validateTelnyxWebhookSecret,
};
