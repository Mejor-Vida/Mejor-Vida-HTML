/**
 * IntegrityCONNECT (IC) CSV + Gmail notifications for quote and appointment leads.
 */

const { google } = require("./google-clients");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

const QUOTE_LEAD_NOTIFY_TO =
  "admin@mejorvidainsurance.com, julie@mejorvidainsurance.com";

function medicalIntakeNotifyTo() {
  const custom = String(process.env.MEDICAL_INTAKE_NOTIFY_TO || "").trim();
  return custom || QUOTE_LEAD_NOTIFY_TO;
}

const QUOTER_LEAD_SOURCES = new Set([
  "facebook_landing_gastos_finales",
  "facebook_instant_form",
  "english_landing_gastos_finales",
  "nebraska_quote_page",
]);

const APPOINTMENT_LEAD_SOURCE = "hubspot_scheduled_appointment";

/** Exact IntegrityCONNECT Manage Leads import header (LeadCenter-Client-Import.csv). */
const IC_LEAD_CSV_HEADER =
  'First Name (required),Last Name (required),"Product Type (required, Life or Health)",Age (optional),"Date Of Birth (optional, format MM/DD/YYYY)",Email (optional),"Phone (required, 10-digits)","Home (optional, 10-digits)","Mobile (opitional, 10-digits)","Work (optional, 10-digits)",Address Line 1 (optional),Address Line 2 (optional),State Abbreviation (optional),County (optional),City (optional),"Zip Codes (optional, 5-digits)",Lead Notes (optional)';

function encodeEmailSubject(subject) {
  const s = String(subject || "");
  if (/^[\x00-\x7F]*$/.test(s)) return s;
  return `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}

function toGmailRaw(rfc822) {
  return Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function mimeBase64Chunked(s) {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/.{1,76}/g, "$&\r\n")
    .trimEnd();
}

function csvEscapeField(value) {
  const s = value == null ? "" : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function icPhone10Digits(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10 ? digits : "";
}

function icZip5(zip) {
  const digits = String(zip || "").replace(/\D/g, "");
  return digits.length >= 5 ? digits.slice(0, 5) : "";
}

function icFormatDob(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`;
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const mm = us[1].padStart(2, "0");
    const dd = us[2].padStart(2, "0");
    return `${mm}/${dd}/${us[3]}`;
  }
  return raw.slice(0, 10);
}

function icFilenameSafePart(value) {
  const s = String(value || "Unknown")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "Unknown";
}

function icLeadCsvFilename(firstName, lastName, submittedAt) {
  const d = submittedAt ? new Date(submittedAt) : new Date();
  const datePart = Number.isNaN(d.getTime())
    ? new Date().toISOString().slice(0, 10)
    : d.toISOString().slice(0, 10);
  return `IC-Lead-${icFilenameSafePart(firstName)}-${icFilenameSafePart(lastName)}-${datePart}.csv`;
}

function icSubmittedLabel(iso) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(iso ? new Date(iso) : new Date());
  } catch {
    return iso ? String(iso) : "";
  }
}

function notifyGenderLabel(sex) {
  const s = String(sex || "").toLowerCase();
  if (s === "male") return "Male";
  if (s === "female") return "Female";
  return sex ? String(sex) : "N/A";
}

function notifyTobaccoLabel(smoker) {
  if (smoker === true || smoker === "true") return "Yes";
  if (smoker === false || smoker === "false") return "No";
  return "N/A";
}

function notifyQuoteRange(quoteLow, quoteHigh) {
  const low = String(quoteLow ?? "").trim();
  const high = String(quoteHigh ?? "").trim();
  if (low && high) return `${low} - ${high}`;
  if (low) return low;
  if (high) return high;
  return "N/A";
}

function icLeadNotes(lead) {
  const parts = ["Final Expense"];
  if (lead.scheduledAppointment) parts.push("Scheduled Appointment");
  if (lead.appointmentAt) {
    parts.push(`Appointment: ${icSubmittedLabel(lead.appointmentAt)}`);
  }
  if (lead.meetingTitle) parts.push(`Meeting: ${String(lead.meetingTitle).slice(0, 200)}`);
  if (lead.leadSource) parts.push(`Source: ${lead.leadSource}`);
  if (lead.submittedAt) parts.push(`Submitted: ${icSubmittedLabel(lead.submittedAt)}`);
  if (lead.quoteRange) parts.push(`Quote range: ${lead.quoteRange}`);
  if (lead.quoteAnchor) parts.push(`Quote midpoint: ${lead.quoteAnchor}`);
  if (lead.age != null && String(lead.age).trim() !== "") parts.push(`Age: ${lead.age}`);
  if (lead.sex) parts.push(`Gender: ${notifyGenderLabel(lead.sex)}`);
  if (lead.smoker != null && lead.smoker !== "") {
    parts.push(`Tobacco: ${notifyTobaccoLabel(lead.smoker)}`);
  }
  if (lead.quoteSummary) parts.push(`Summary: ${String(lead.quoteSummary).trim().slice(0, 500)}`);
  if (lead.leadId) parts.push(`Lead ID: ${lead.leadId}`);
  if (lead.hubspotContactId) parts.push(`HubSpot contact: ${lead.hubspotContactId}`);
  if (lead.hubspotMeetingId) parts.push(`HubSpot meeting: ${lead.hubspotMeetingId}`);
  if (lead.lang) parts.push(`Language: ${lead.lang}`);
  const od = lead.originDetail;
  if (od && typeof od === "object") {
    const utm = ["utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid"]
      .map((k) => (od[k] ? `${k}=${od[k]}` : ""))
      .filter(Boolean);
    if (utm.length) parts.push(`UTM: ${utm.join("; ")}`);
    if (od.landing_path) parts.push(`Landing: ${od.landing_path}`);
    if (od.referrer) parts.push(`Referrer: ${String(od.referrer).slice(0, 200)}`);
  }
  if (lead.sessionClientId) parts.push(`Session: ${lead.sessionClientId}`);
  return parts.join(" | ");
}

function buildICLeadCsv(lead) {
  const phone10 = icPhone10Digits(lead.phone);
  const row = [
    lead.firstName || "",
    lead.lastName || "",
    "Life",
    lead.age != null && String(lead.age).trim() !== "" ? String(lead.age).trim() : "",
    icFormatDob(lead.dob || lead.dateOfBirth),
    lead.email || "",
    phone10,
    "",
    "",
    "",
    lead.addressLine1 || lead.address || "",
    lead.addressLine2 || "",
    lead.state || "",
    lead.county || "",
    lead.city || "",
    icZip5(lead.zip),
    icLeadNotes(lead),
  ];
  return `${IC_LEAD_CSV_HEADER}\r\n${row.map(csvEscapeField).join(",")}\r\n`;
}

function buildGmailRawPlainText({ fromEmail, toEmail, subject, bodyText }) {
  const nl = "\r\n";
  const lines = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${encodeEmailSubject(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    mimeBase64Chunked(bodyText),
    "",
  ];
  return toGmailRaw(lines.join(nl));
}

function buildGmailRawEmailWithCsvAttachment({
  fromEmail,
  toEmail,
  subject,
  bodyText,
  attachmentFilename,
  attachmentContent,
}) {
  const mixedBoundary = `mvi_mixed_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const nl = "\r\n";
  const csvB64 = mimeBase64Chunked(attachmentContent);
  const lines = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${encodeEmailSubject(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    "",
    `--${mixedBoundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    bodyText,
    "",
    `--${mixedBoundary}`,
    `Content-Type: text/csv; charset=UTF-8; name="${attachmentFilename}"`,
    `Content-Disposition: attachment; filename="${attachmentFilename}"`,
    "Content-Transfer-Encoding: base64",
    "",
    csvB64,
    "",
    `--${mixedBoundary}--`,
    "",
  ];
  return toGmailRaw(lines.join(nl));
}

function notifySourceIntro(leadSource) {
  if (leadSource === "facebook_landing_gastos_finales") {
    return "New lead from Facebook landing page:";
  }
  if (leadSource === "facebook_instant_form") {
    return "New lead from Facebook Instant Form (Lead Ad):";
  }
  if (leadSource === "english_landing_gastos_finales") {
    return "New lead from English final-expense landing:";
  }
  if (leadSource === "nebraska_quote_page") {
    return "New lead from website quote tool (quote.html):";
  }
  if (leadSource === APPOINTMENT_LEAD_SOURCE) {
    return "New scheduled appointment (HubSpot):";
  }
  return "New quote lead:";
}

async function sendICLeadEmail(lead) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  if (!clientId || !clientSecret || !refreshToken) {
    console.log("[NOTIFY] skipped — Gmail not configured");
    return { skipped: true, reason: "gmail_not_configured" };
  }

  const firstName = lead.firstName;
  const lastName = lead.lastName;
  const email = lead.email;
  const phone = lead.phone;
  const age = lead.age;
  const sex = lead.sex;
  const smoker = lead.smoker;
  const quoteLow = lead.quoteLow;
  const quoteHigh = lead.quoteHigh;
  const leadSource = lead.leadSource;
  const quoteRange =
    lead.quoteRange != null ? lead.quoteRange : notifyQuoteRange(quoteLow, quoteHigh);

  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Unknown";
  const csvFilename = icLeadCsvFilename(firstName, lastName, lead.submittedAt);
  const csvContent = buildICLeadCsv({ ...lead, quoteRange });
  const subject = `🔔 New Lead: ${fullName}`;
  const bodyLines = [
    notifySourceIntro(leadSource),
    "",
    `Full name: ${fullName}`,
    `Phone number: ${phone || "N/A"}`,
    `Email address: ${email || "N/A"}`,
    `Age: ${age != null && String(age).trim() !== "" ? String(age).trim() : "N/A"}`,
    `Gender: ${notifyGenderLabel(sex)}`,
    `Tobacco status: ${notifyTobaccoLabel(smoker)}`,
  ];
  if (leadSource === APPOINTMENT_LEAD_SOURCE && lead.appointmentAt) {
    bodyLines.push(`Appointment: ${icSubmittedLabel(lead.appointmentAt)}`);
  }
  if (quoteRange && quoteRange !== "N/A") {
    bodyLines.push(`Quote range: ${quoteRange}`);
  }
  bodyLines.push(`Source: ${leadSource}`, "", `Attached: ${csvFilename} (IntegrityCONNECT Manage Leads import)`);

  const raw = buildGmailRawEmailWithCsvAttachment({
    fromEmail,
    toEmail: QUOTE_LEAD_NOTIFY_TO,
    subject,
    bodyText: bodyLines.join("\n"),
    attachmentFilename: csvFilename,
    attachmentContent: csvContent,
  });
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const sendResp = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
  const messageId =
    sendResp && sendResp.data && sendResp.data.id ? String(sendResp.data.id) : null;
  return { sent: true, messageId: messageId || "sent", csvFilename };
}

async function supabaseGetJson(supabaseUrl, serviceKey, path) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1${path}`;
  const r = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Supabase GET ${path}: ${r.status} ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

/**
 * True if this email or phone already exists on a quoter submission.
 * (Kept for tests / future use; appointment IC email is always sent regardless.)
 */
async function quoterLeadAlreadyExists(supabaseUrl, serviceKey, email, phone) {
  const sources = Array.from(QUOTER_LEAD_SOURCES).join(",");
  const emailNorm = String(email || "")
    .trim()
    .toLowerCase();
  const phone10 = icPhone10Digits(phone);

  if (emailNorm) {
    const byEmail = await supabaseGetJson(
      supabaseUrl,
      serviceKey,
      `/quote_lead_submissions?email=ilike.${encodeURIComponent(emailNorm)}&source=in.(${sources})&select=id&limit=1`
    );
    if (Array.isArray(byEmail) && byEmail.length > 0) return true;
  }

  if (phone10) {
    const byPhone = await supabaseGetJson(
      supabaseUrl,
      serviceKey,
      `/quote_lead_submissions?phone=ilike.*${encodeURIComponent(phone10)}*&source=in.(${sources})&select=id,phone&limit=5`
    );
    if (Array.isArray(byPhone) && byPhone.some((row) => icPhone10Digits(row.phone) === phone10)) {
      return true;
    }
  }

  return false;
}

async function sendQuoteLeadNotification(lead) {
  try {
    if (!QUOTER_LEAD_SOURCES.has(lead.leadSource)) return;

    const result = await sendICLeadEmail(lead);
    if (result.skipped) return;
    console.log("[NOTIFY] success", result.messageId || "sent");
  } catch (e) {
    console.log("[NOTIFY] failure", e.message || String(e));
  }
}

function medicalIntakeSummaryLines(body) {
  const hi = body && body.healthInfo && typeof body.healthInfo === "object" ? body.healthInfo : {};
  return [
    `Gender: ${hi.gender || "—"}`,
    `Date of birth: ${hi.birthdate || "—"}`,
    `Conditions listed: ${Array.isArray(body.conditions) ? body.conditions.length : 0}`,
    `Prescriptions listed: ${Array.isArray(body.prescriptions) ? body.prescriptions.length : 0}`,
    `Providers listed: ${Array.isArray(body.providers) ? body.providers.length : 0}`,
    `Pharmacies listed: ${Array.isArray(body.pharmacies) ? body.pharmacies.length : 0}`,
    `Consent confirmed: ${body.consent === true ? "Yes" : "No"}`,
  ];
}

/**
 * Notify staff when a client submits the secure medical intake form (best-effort).
 */
async function sendMedicalIntakeSubmittedNotification({
  leadId,
  leadSourceTable,
  recipientEmail,
  recipientFirstName,
  intakeBody,
}) {
  try {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
    if (!clientId || !clientSecret || !refreshToken) {
      console.log("[medical-intake-notify] skipped — Gmail not configured");
      return { skipped: true, reason: "gmail_not_configured" };
    }

    const name = String(recipientFirstName || "").trim() || "Client";
    const siteBase = String(process.env.SITE_BASE_URL || "https://www.mejorvidainsurance.com").replace(
      /\/$/,
      ""
    );
    const crmUrl = `${siteBase}/staff/crm.html#/clients/${encodeURIComponent(leadId)}/medical`;
    const submittedAt = icSubmittedLabel(new Date().toISOString());
    const subject = `Medical questionnaire submitted — ${name}`;
    const bodyLines = [
      "A client completed the secure medical intake questionnaire.",
      "",
      `Name: ${name}`,
      recipientEmail ? `Email: ${recipientEmail}` : null,
      `Submitted: ${submittedAt}`,
      `Lead ID: ${leadId}`,
      `Source table: ${leadSourceTable || "unknown"}`,
      "",
      ...(intakeBody ? medicalIntakeSummaryLines(intakeBody) : []),
      "",
      `Open in CRM (Medical tab):`,
      crmUrl,
      "",
      "Full medical details are stored securely in the CRM — not included in this email.",
    ].filter((line) => line != null);

    const raw = buildGmailRawPlainText({
      fromEmail,
      toEmail: medicalIntakeNotifyTo(),
      subject,
      bodyText: bodyLines.join("\n"),
    });
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const sendResp = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    const messageId =
      sendResp && sendResp.data && sendResp.data.id ? String(sendResp.data.id) : null;
    console.log("[medical-intake-notify] success", messageId || "sent");
    return { sent: true, messageId: messageId || "sent" };
  } catch (e) {
    console.log("[medical-intake-notify] failure", e.message || String(e));
    return { sent: false, error: e.message || String(e) };
  }
}

async function sendAppointmentLeadNotification(lead, { supabaseUrl, serviceKey }) {
  try {
    if (!lead.firstName && !lead.lastName && !lead.email && !lead.phone) {
      console.log("[NOTIFY] skipped — appointment missing contact fields");
      return { skipped: true, reason: "missing_contact" };
    }

    const payload = {
      ...lead,
      leadSource: APPOINTMENT_LEAD_SOURCE,
      scheduledAppointment: true,
      submittedAt: lead.submittedAt || new Date().toISOString(),
    };
    const result = await sendICLeadEmail(payload);
    if (result.skipped) return result;
    console.log("[NOTIFY] success", result.messageId || "sent", "appointment");
    return result;
  } catch (e) {
    console.log("[NOTIFY] failure", e.message || String(e));
    return { sent: false, error: e.message || String(e) };
  }
}

module.exports = {
  QUOTE_LEAD_NOTIFY_TO,
  medicalIntakeNotifyTo,
  QUOTER_LEAD_SOURCES,
  APPOINTMENT_LEAD_SOURCE,
  icPhone10Digits,
  buildICLeadCsv,
  quoterLeadAlreadyExists,
  sendQuoteLeadNotification,
  sendAppointmentLeadNotification,
  sendMedicalIntakeSubmittedNotification,
};
