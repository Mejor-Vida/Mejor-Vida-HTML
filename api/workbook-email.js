/**
 * POST /api/workbook-email
 * ManyChat External Request — email the funeral-wishes workbook PDF.
 *
 * Body: email, phone, first_name, language
 * Header: X-App-Secret
 *
 * Env: MANYCHAT_WEBHOOK_SECRET, RESEND_API_KEY
 *      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (optional; saves the email on the contact)
 */

const fs = require("fs");
const path = require("path");
const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const { upsertContact } = require("../lib/contacts-db");
const { logContactCommunication, htmlToPlain } = require("../lib/contact-communications");

const PDF_PATH = path.join(__dirname, "..", "guides", "guia-planificacion-funeral-mejor-vida.pdf");
const PDF_BASE64 = fs.readFileSync(PDF_PATH).toString("base64");
const PDF_FILENAME = "Cuaderno-deseos-funerarios-Mejor-Vida.pdf";

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function clean(val) {
  const t = String(val ?? "").trim();
  if (!t || t.includes("{{") || t.includes("${")) return "";
  return t.slice(0, 500);
}

function isValidEmail(raw) {
  const em = clean(raw).toLowerCase();
  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return null;
  return em;
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(firstName) {
  const name = clean(firstName);
  const hello = name ? `Hola ${escapeHtml(name)},` : "Hola,";
  return `<p>${hello}</p>
<p>Aquí está tu <strong>Cuaderno de deseos funerarios y papeles</strong>. Ábrelo, escribe las respuestas y guarda una copia donde tu familia pueda encontrarla el mismo día.</p>
<p>Un testamento dice quién hereda la casa y el auto, pero casi siempre se lee después del sepelio. Este cuaderno es para los deseos del funeral, a quién avisar y dónde están los papeles. No sustituye un testamento ni un poder notarial.</p>
<p>Mejor Vida Seguros<br>402-440-5438</p>`;
}

module.exports = async function handler(req, res) {
  logRequest("workbook-email");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) return json(res, auth.status, { ok: false, error: auth.error });

  let body;
  try {
    body = readBody(req);
  } catch {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  const email = isValidEmail(body.email || body.user_email || body.correo);
  if (!email) return json(res, 400, { ok: false, error: "Valid email required" });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return json(res, 500, { ok: false, error: "RESEND_API_KEY not configured" });

  const firstName = clean(body.first_name || body.firstName || body.nombre);
  const phone = clean(body.phone || body.whatsapp_phone);
  const subject = "Tu cuaderno gratis de Mejor Vida Seguros";
  const html = buildHtml(firstName);

  let emailId;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Mejor Vida Seguros <julie@mejorvidainsurance.com>",
        to: email,
        subject,
        html,
        attachments: [
          {
            filename: PDF_FILENAME,
            content: PDF_BASE64,
            content_type: "application/pdf",
          },
        ],
      }),
    });
    const result = await r.json();
    if (!r.ok) {
      console.error("[workbook-email] Resend error:", JSON.stringify(result).slice(0, 500));
      return json(res, 502, { ok: false, error: "Failed to send email" });
    }
    emailId = result.id || null;
  } catch (err) {
    console.error("[workbook-email] send failed:", err && err.message ? err.message : err);
    return json(res, 502, { ok: false, error: "Failed to send email" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  let contactId = null;
  if (supabaseUrl && serviceKey && phone) {
    try {
      const saved = await upsertContact(supabaseUrl, serviceKey, phone, {
        email,
        first_name: firstName || undefined,
        language: "spanish",
      });
      contactId = saved && saved.contactId ? saved.contactId : null;
      if (contactId) {
        await logContactCommunication(supabaseUrl, serviceKey, {
          contactId,
          direction: "outbound",
          channel: "email",
          subject,
          summary: subject,
          body: htmlToPlain(html),
          meta: { source: "workbook_email", provider_id: emailId },
        });
      }
    } catch (err) {
      console.warn("[workbook-email] contact save failed:", err && err.message ? err.message : err);
    }
  }

  return json(res, 200, { ok: true, email_id: emailId, contact_id: contactId });
};
