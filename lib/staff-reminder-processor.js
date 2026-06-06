/**
 * Process due staff_reminders — shared by Vercel cron and staff CRM polling.
 */
const { google } = require("googleapis");
const { wrapResendEmailHtml, LOGO_EN } = require("./resend-email-template");

const DEFAULT_NOTIFY = "julie@mejorvidainsurance.com";
const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function sbHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function sbFetch(supabaseUrl, serviceKey, path, options = {}) {
  const base = String(supabaseUrl || "").replace(/\/$/, "");
  const r = await fetch(`${base}/rest/v1${path}`, {
    ...options,
    headers: { ...sbHeaders(serviceKey), ...(options.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : [];
}

async function sendReminderEmail({ to, subject, html, textBody }) {
  if (process.env.RESEND_API_KEY) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>",
        to,
        subject,
        html,
      }),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(`Resend: ${JSON.stringify(json)}`);
    return json;
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("missing RESEND_API_KEY and Gmail is not configured");
  }

  const plain = textBody || String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const boundary = `mvi_rem_${Date.now()}`;
  const rfc822 = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    plain,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const raw = Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const sendResp = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  return sendResp.data;
}

function buildReminderEmail(row) {
  const to = String(row.notify_email || DEFAULT_NOTIFY).trim() || DEFAULT_NOTIFY;
  const clientLink = row.lead_id
    ? `https://mejorvidainsurance.com/staff/crm.html#/clients/${encodeURIComponent(row.lead_id)}/comm-notes`
    : "https://mejorvidainsurance.com/staff/crm.html";
  const messageText = String(row.message || "").trim();
  const bodyHtml =
    `<p style="font-size:16px;line-height:1.5">${messageText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>")}</p>` +
    `<p style="margin-top:16px"><a href="${clientLink}">Open client in CRM</a></p>`;
  return {
    to,
    subject: "Reminder — Mejor Vida CRM",
    html: wrapResendEmailHtml(bodyHtml, LOGO_EN),
    textBody: `${messageText}\n\nOpen client in CRM: ${clientLink}`,
  };
}

/**
 * @param {{ supabaseUrl?: string, serviceKey?: string, now?: Date }} [opts]
 */
async function processDueStaffReminders(opts = {}) {
  const supabaseUrl = opts.supabaseUrl || process.env.SUPABASE_URL;
  const serviceKey = opts.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase configuration");
  }

  const now = opts.now instanceof Date ? opts.now : new Date();
  const due = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/staff_reminders?select=*&status=eq.pending&scheduled_at=lte.${encodeURIComponent(
      now.toISOString()
    )}&order=scheduled_at.asc&limit=50`
  );

  const results = [];
  for (const row of due || []) {
    const mail = buildReminderEmail(row);
    try {
      await sendReminderEmail(mail);
      await sbFetch(supabaseUrl, serviceKey, `/staff_reminders?id=eq.${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }),
      });
      results.push({ id: row.id, ok: true });
    } catch (e) {
      console.error("[staff-reminder] send failed", row.id, e.message);
      results.push({ id: row.id, ok: false, error: e.message });
    }
  }

  return { processed: results.length, sent: results.filter((r) => r.ok).length, results };
}

module.exports = {
  processDueStaffReminders,
  buildReminderEmail,
};
