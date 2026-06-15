const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { requireStaffAuth, json, readJsonBody, serviceConfig, restPatch, restInsert } = require("./_inbox-lib");
const { saveCanonicalLeadProfile } = require("./_lead-profile");
const { buildStaffClientReplyHtml } = require("../../lib/staff-reply-email-body");
const { issueToken } = require("../../lib/medical-intake-token");
const {
  buildMedicalIntakePlainText,
  applyMedicalIntakeUrlToDraft,
  buildMedicalIntakeSubject,
  buildMedicalIntakeCtaHtml,
} = require("../../lib/medical-intake-email-template");
const {
  buildReviewRequestPlainText,
  buildReviewRequestSubject,
  buildReviewRequestCtaHtml,
  reviewUrl,
} = require("../../lib/review-request-email-template");
const {
  buildAgentCredentialsPlainText,
  buildAgentCredentialsSubject,
  buildAgentCredentialsEmailHtml,
} = require("../../lib/agent-credentials-email-template");
const {
  normalizeFirstName,
  fetchLeadGreetingFromDb,
} = require("../../lib/medical-intake-lead-greeting");
const { insertEvent } = require("../../lib/contacts-db");
const { logContactCommunication } = require("../../lib/contact-communications");
const { resolveContactForStaffLead, isUuid } = require("./_lead-contact");

const GMAIL_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function isLikelyEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

/** First sentence or up to ~60 chars for compose-mode subject line. */
function subjectFromCustomerIssue(issue) {
  const t = String(issue || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return "Message from Mejor Vida Insurance";
  const cut = t.slice(0, 400);
  const m = cut.match(/^[\s\S]{1,200}?[.!?](?=\s|$)/);
  let s = m && m[0] ? m[0].trim() : cut;
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > 60) s = s.slice(0, 57).trim() + "…";
  if (s.length > 120) s = s.slice(0, 117).trim() + "…";
  return s || "Message from Mejor Vida Insurance";
}

function encodeSubject(subject) {
  const s = String(subject || "");
  if (/^[\x00-\x7F]*$/.test(s)) return s;
  return `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}

function mimeBase64Body(s) {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/.{1,76}/g, "$&\r\n")
    .trimEnd();
}

/**
 * multipart/alternative: plain + HTML (UTF-8), for Gmail users.messages.send raw.
 */
function buildMultipartRaw({ fromEmail, toEmail, ccEmail, subject, textBody, htmlBody }) {
  const boundary = `mvi_alt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const nl = "\r\n";
  const subj = encodeSubject(subject);
  const plainB64 = mimeBase64Body(textBody);
  const htmlB64 = mimeBase64Body(htmlBody);
  const cc = ccEmail && String(ccEmail).trim() ? String(ccEmail).trim() : "";
  const lines = [`From: ${fromEmail}`, `To: ${toEmail}`];
  if (cc) lines.push(`Cc: ${cc}`);
  lines.push(
    `Subject: ${subj}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    plainB64,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    htmlB64,
    "",
    `--${boundary}--`,
    "",
  );
  return lines.join(nl);
}

/** multipart/mixed: alternative (plain + HTML) + file attachment for Gmail raw send. */
function buildMultipartMixedWithAlternativeAndAttachment({
  fromEmail,
  toEmail,
  ccEmail,
  subject,
  textBody,
  htmlBody,
  attachmentFilename,
  attachmentContent,
  attachmentContentType,
}) {
  const mixedBoundary = `mvi_mixed_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const altBoundary = `mvi_alt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const nl = "\r\n";
  const subj = encodeSubject(subject);
  const plainB64 = mimeBase64Body(textBody);
  const htmlB64 = mimeBase64Body(htmlBody);
  const attachB64 = mimeBase64Body(attachmentContent);
  const cc = ccEmail && String(ccEmail).trim() ? String(ccEmail).trim() : "";
  const ctype = attachmentContentType || "application/octet-stream";
  const fname = attachmentFilename || "attachment";
  const lines = [`From: ${fromEmail}`, `To: ${toEmail}`];
  if (cc) lines.push(`Cc: ${cc}`);
  lines.push(
    `Subject: ${subj}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    "",
    `--${mixedBoundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    "",
    `--${altBoundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    plainB64,
    "",
    `--${altBoundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    htmlB64,
    "",
    `--${altBoundary}--`,
    "",
    `--${mixedBoundary}`,
    `Content-Type: ${ctype}; charset=UTF-8; name="${fname}"`,
    `Content-Disposition: attachment; filename="${fname}"`,
    "Content-Transfer-Encoding: base64",
    "",
    attachB64,
    "",
    `--${mixedBoundary}--`,
    ""
  );
  return lines.join(nl);
}

function toGmailRaw(rfc822) {
  return Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function logSendAttempt(cfg, payload, status) {
  try {
    await restInsert(cfg, "webhook_logs", {
      source: "staff_portal",
      endpoint: "/api/staff/send-email",
      payload,
      status: status || "received",
    });
  } catch (_) {
    // Logging should never break the endpoint.
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { success: false, error: "Invalid JSON" });
  }

  const compose = !!(body && body.compose);
  const questionId = String((body && body.questionId) || "").trim();
  const toEmail = body && body.toEmail != null ? String(body.toEmail).trim() : "";
  const replyDraft = String((body && body.replyDraft) || "").trim();
  const language = body && body.language != null ? String(body.language).trim() : "";
  const customerIssue = body && body.customerIssue != null ? String(body.customerIssue).trim() : "";
  const subjectOverride = body && body.subject != null ? String(body.subject).trim() : "";
  const ccEmail = body && body.ccEmail != null ? String(body.ccEmail).trim() : "";
  const emailType = body && body.emailType != null ? String(body.emailType).trim() : "general";
  const leadId = body && body.leadId != null ? String(body.leadId).trim() : "";
  const leadSourceTable =
    body && body.leadSourceTable != null ? String(body.leadSourceTable).trim() : "manychat_leads";
  const leadFirstName = body && body.leadFirstName != null ? String(body.leadFirstName).trim() : "";

  const isTemplateEmail =
    emailType === "medical_information_request" ||
    emailType === "review_request" ||
    emailType === "agent_credentials";
  if (!replyDraft && !isTemplateEmail) {
    return json(res, 400, { success: false, error: "replyDraft required" });
  }
  if (!compose && !questionId) {
    return json(res, 400, { success: false, error: "questionId required unless compose is true" });
  }
  if (!toEmail) {
    return json(res, 200, { success: false, error: "No email address on file for this lead" });
  }
  if (!isLikelyEmail(toEmail)) {
    return json(res, 200, { success: false, error: `Invalid recipient email: ${toEmail}` });
  }
  if (ccEmail && !isLikelyEmail(ccEmail)) {
    return json(res, 200, { success: false, error: `Invalid Cc email: ${ccEmail}` });
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "julie@mejorvidainsurance.com";
  const cfg = serviceConfig();

  if (!clientId || !clientSecret || !refreshToken || !fromEmail || !cfg) {
    return json(res, 200, { success: false, error: "Gmail is not configured on the server" });
  }

  const subjectLine = compose
    ? emailType === "medical_information_request"
      ? buildMedicalIntakeSubject({ language })
      : emailType === "review_request"
        ? buildReviewRequestSubject({ language, firstName: leadFirstName })
        : emailType === "agent_credentials"
          ? buildAgentCredentialsSubject({ language, firstName: leadFirstName })
          : subjectOverride
            ? subjectOverride.slice(0, 200)
            : subjectFromCustomerIssue(customerIssue)
    : "Re: Your Insurance Question — Mejor Vida Insurance";

  try {
    let draftForSend = replyDraft;
    let intakeUrl = null;
    let reviewLink = null;
    let reviewSentAt = null;
    let subjectForSend = subjectLine;

    if (compose && emailType === "medical_information_request") {
      if (!leadId) {
        return json(res, 400, { success: false, error: "Select a lead before sending Medical Information Request." });
      }
      let fn = normalizeFirstName(leadFirstName);
      if (!fn) {
        try {
          const g = await fetchLeadGreetingFromDb(cfg, leadId, leadSourceTable);
          fn = g.first_name;
        } catch (_) {
          /* use salutation without name */
        }
      }
      const issued = await issueToken(cfg, {
        leadId,
        leadSourceTable,
        recipientEmail: toEmail,
        issuedBy: auth.user && auth.user.email ? auth.user.email : null,
        recipientFirstName: fn,
      });
      intakeUrl = issued.url;
      draftForSend = replyDraft
        ? applyMedicalIntakeUrlToDraft(replyDraft, intakeUrl)
        : buildMedicalIntakePlainText({ language, firstName: fn, intakeUrl });
    }

    if (compose && emailType === "review_request") {
      if (!leadId) {
        return json(res, 400, { success: false, error: "Select a lead before sending a review request." });
      }
      let fn = normalizeFirstName(leadFirstName);
      if (!fn) {
        try {
          const g = await fetchLeadGreetingFromDb(cfg, leadId, leadSourceTable);
          fn = g.first_name;
        } catch (_) {
          /* use salutation without name */
        }
      }
      reviewLink = reviewUrl();
      draftForSend = replyDraft
        ? replyDraft
        : buildReviewRequestPlainText({
            language,
            firstName: fn,
            reviewLink,
          });
      subjectForSend = buildReviewRequestSubject({ language, firstName: fn });
    }

    let htmlOut;
    let plainBody;
    if (compose && emailType === "agent_credentials") {
      let fn = normalizeFirstName(leadFirstName);
      if (!fn) {
        try {
          const g = await fetchLeadGreetingFromDb(cfg, leadId, leadSourceTable);
          fn = g.first_name;
        } catch (_) {
          /* use salutation without name */
        }
      }
      subjectForSend = buildAgentCredentialsSubject({ language, firstName: fn });
      const credentialsEmail = buildAgentCredentialsEmailHtml({
        language,
        firstName: fn,
        introOverride: replyDraft || undefined,
      });
      htmlOut = credentialsEmail.html;
      plainBody = credentialsEmail.plainBody;
      draftForSend = credentialsEmail.plainBody;
    } else {
      const built = buildStaffClientReplyHtml(draftForSend, language);
      htmlOut = built.html;
      plainBody = built.plainBody;
    }
    if (intakeUrl) {
      const cta = buildMedicalIntakeCtaHtml({ language, intakeUrl });
      htmlOut = htmlOut.replace("</body>", `${cta}</body>`);
    }
    if (reviewLink) {
      const cta = buildReviewRequestCtaHtml({ language, reviewLink });
      htmlOut = htmlOut.replace("</body>", `${cta}</body>`);
    }
    let rfc822;
    if (compose && emailType === "agent_credentials") {
      const vcardPath = path.join(__dirname, "..", "..", "julie.vcf");
      const vcardContent = fs.readFileSync(vcardPath, "utf8");
      rfc822 = buildMultipartMixedWithAlternativeAndAttachment({
        fromEmail,
        toEmail,
        ccEmail: ccEmail || undefined,
        subject: subjectForSend,
        textBody: plainBody,
        htmlBody: htmlOut,
        attachmentFilename: "julie.vcf",
        attachmentContent: vcardContent,
        attachmentContentType: "text/vcard",
      });
    } else {
      rfc822 = buildMultipartRaw({
        fromEmail,
        toEmail,
        ccEmail: ccEmail || undefined,
        subject: subjectForSend,
        textBody: plainBody,
        htmlBody: htmlOut,
      });
    }
    const raw = toGmailRaw(rfc822);

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, GMAIL_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const sendResp = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    const messageId = sendResp && sendResp.data && sendResp.data.id ? String(sendResp.data.id) : null;

    if (!compose && questionId) {
      await restPatch(
        cfg,
        "unanswered_questions",
        `id=eq.${encodeURIComponent(questionId)}&select=id`,
        { email_sent: true }
      );
    }

    await logSendAttempt(
      cfg,
      {
        questionId: questionId || null,
        compose,
        toEmail,
        ccEmail: ccEmail || null,
        fromEmail,
        messageId,
        result: "gmail_accept",
        emailType: emailType || null,
        intakeUrl: intakeUrl || null,
        leadId: leadId || null,
        subject: subjectForSend,
      },
      "sent"
    );

    if (leadId && isUuid(leadId)) {
      try {
        if (emailType === "review_request") {
          reviewSentAt = new Date().toISOString();
          await saveCanonicalLeadProfile(
            cfg,
            leadId,
            leadSourceTable,
            { review_request_sent_at: reviewSentAt },
            auth.user && auth.user.email ? auth.user.email : null
          );
        }
        const resolved = await resolveContactForStaffLead(cfg, leadId);
        if (resolved.contactId) {
          await insertEvent(
            cfg.supabaseUrl,
            cfg.serviceKey,
            resolved.contactId,
            "staff_email_sent",
            {
              subject: subjectForSend,
              to_email: toEmail,
              message_id: messageId,
              email_type: emailType || "general",
              sent_by: auth.user && auth.user.email ? auth.user.email : null,
              preview: draftForSend.slice(0, 400),
            },
            "email"
          );
          await logContactCommunication(cfg.supabaseUrl, cfg.serviceKey, {
            contactId: resolved.contactId,
            direction: "outbound",
            channel: "email",
            subject: subjectForSend,
            summary: subjectForSend,
            body: plainBody,
            meta: {
              source: "staff_send_email",
              message_id: messageId,
              email_type: emailType || "general",
              to_email: toEmail,
            },
          });
        }
      } catch (logErr) {
        console.error("staff/send-email insertEvent", logErr && logErr.message ? logErr.message : logErr);
      }
    }

    return json(res, 200, {
      success: true,
      toEmail,
      messageId,
      subject: subjectForSend,
      intakeUrl,
      reviewLink: reviewLink || null,
      reviewRequestSentAt: reviewSentAt,
    });
  } catch (e) {
    const err = String(e && e.message ? e.message : "Failed to send email");
    await logSendAttempt(
      cfg,
      { questionId: questionId || null, compose, toEmail, ccEmail: ccEmail || null, fromEmail, error: err },
      "error"
    );
    return json(res, 200, {
      success: false,
      error: err,
    });
  }
};
