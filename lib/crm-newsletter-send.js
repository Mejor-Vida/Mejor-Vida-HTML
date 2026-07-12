/**
 * Shared weekly newsletter send — used by cron and staff "Send now".
 */
const { loadSettings, resolveLeadHints } = require("./crm-nurture-engine");
const {
  wrapNewsletterHtml,
  leadEmailCtaRow,
  contactName,
} = require("./crm-nurture-templates");
const { canAutomateLead } = require("./crm-nurture-rollout");
const {
  getCurrentWeeklyBlogDigest,
  buildWeeklyBlogDigestEmailParts,
} = require("./crm-weekly-blog-digest-email");

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sbHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function sbFetch(base, key, path, options = {}) {
  const r = await fetch(`${base}/rest/v1${path}`, {
    ...options,
    headers: { ...sbHeaders(key), ...(options.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : [];
}

async function sendResendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("missing RESEND_API_KEY");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
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

function isExcludedStage(stage) {
  const s = String(stage || "").trim().toLowerCase();
  return s === "unsubscribed" || s === "do_not_contact";
}

function isArchivedProfile(pd) {
  const p = pd && typeof pd === "object" ? pd : {};
  return !!(p.archived_at || p.status === "archived" || p.outreach_blocked_reason === "archived");
}

/**
 * Count / list eligible active clients for weekly email (same rules as send).
 */
async function listWeeklyEmailRecipients(supabaseUrl, serviceKey, settings) {
  const profiles = await sbFetch(
    supabaseUrl,
    serviceKey,
    "/staff_lead_profiles?select=lead_id,lead_source_table,profile_data&limit=5000"
  );
  const eligible = [];
  const seenEmails = new Set();
  let skippedNoEmail = 0;
  let skippedStage = 0;
  let skippedRollout = 0;
  let skippedArchived = 0;
  let skippedDuplicate = 0;

  for (const row of profiles || []) {
    const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
    if (isArchivedProfile(pd)) {
      skippedArchived++;
      continue;
    }
    if (isExcludedStage(pd.pipeline_stage)) {
      skippedStage++;
      continue;
    }
    const contactId = pd.contacts_contact_id || pd.contact_id || null;
    const hints = await resolveLeadHints(
      supabaseUrl,
      serviceKey,
      row.lead_id,
      row.lead_source_table,
      contactId
    );
    const email = String(hints.email || pd.email || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      skippedNoEmail++;
      continue;
    }
    const rolloutHints = {
      email,
      first_name: hints.first_name || pd.first_name || "",
      last_name: hints.last_name || pd.last_name || "",
      display_name: pd.display_name || "",
    };
    if (!canAutomateLead(rolloutHints, settings, process.env)) {
      skippedRollout++;
      continue;
    }
    if (seenEmails.has(email)) {
      skippedDuplicate++;
      continue;
    }
    seenEmails.add(email);
    eligible.push({
      lead_id: row.lead_id,
      lead_source_table: row.lead_source_table,
      email,
      first_name: rolloutHints.first_name,
      last_name: rolloutHints.last_name,
      display_name: pd.display_name || "",
      pipeline_stage: pd.pipeline_stage || "",
      contacts_contact_id: contactId,
      language: pd.language || hints.language || "English",
      idioma: pd.idioma,
    });
  }

  return {
    recipients: eligible,
    counts: {
      eligible: eligible.length,
      unique_emails: seenEmails.size,
      skipped_no_email: skippedNoEmail,
      skipped_stage: skippedStage,
      skipped_rollout: skippedRollout,
      skipped_archived: skippedArchived,
      skipped_duplicate: skippedDuplicate,
      profiles_scanned: (profiles || []).length,
    },
  };
}

async function ensureBlogDigestIssue(supabaseUrl, serviceKey, importedBy) {
  const digest = getCurrentWeeklyBlogDigest();
  const parts = buildWeeklyBlogDigestEmailParts(digest);

  const bySubject = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_newsletter_issues?subject=eq.${encodeURIComponent(
      parts.subject
    )}&status=in.(draft,scheduled)&order=created_at.desc&limit=1&select=*`
  );
  if (bySubject && bySubject[0]) {
    // Refresh body/hero from latest template in case copy changed
    const row = bySubject[0];
    await sbFetch(supabaseUrl, serviceKey, `/crm_newsletter_issues?id=eq.${row.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        hero_html: parts.heroHtml || null,
        hero_source: "blog_digest",
        blog_url: parts.blogUrl,
        body_html: parts.bodyHtml || null,
        updated_at: new Date().toISOString(),
      }),
    });
    return {
      ...row,
      hero_html: parts.heroHtml || null,
      body_html: parts.bodyHtml || null,
      blog_url: parts.blogUrl,
      hero_source: "blog_digest",
    };
  }

  const inserted = await sbFetch(supabaseUrl, serviceKey, "/crm_newsletter_issues", {
    method: "POST",
    body: JSON.stringify({
      hero_html: parts.heroHtml || null,
      hero_source: "blog_digest",
      blog_url: parts.blogUrl,
      subject: parts.subject,
      body_html: parts.bodyHtml || null,
      status: "scheduled",
      imported_by: importedBy || null,
    }),
  });
  return Array.isArray(inserted) ? inserted[0] : inserted;
}

/**
 * Send one issue to all eligible active clients.
 * @param {{ dryRun?: boolean, importedBy?: string }} opts
 */
function emailProviderReady() {
  return !!String(process.env.RESEND_API_KEY || "").trim();
}

async function sendWeeklyNewsletterIssue(supabaseUrl, serviceKey, issue, opts) {
  opts = opts || {};
  const settings = await loadSettings(supabaseUrl, serviceKey);
  const { recipients, counts } = await listWeeklyEmailRecipients(
    supabaseUrl,
    serviceKey,
    settings
  );

  if (opts.dryRun) {
    return {
      dry_run: true,
      issue_id: issue.id,
      subject: issue.subject,
      email_provider_ready: emailProviderReady(),
      ...counts,
      sent: 0,
      failed: 0,
    };
  }

  if (!emailProviderReady()) {
    throw new Error(
      "Email provider not configured. Add RESEND_API_KEY to .env.local and restart the dev server."
    );
  }

  const priorSends = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_newsletter_sends?issue_id=eq.${encodeURIComponent(issue.id)}&select=email,status`
  );
  const alreadySent = new Set(
    (priorSends || [])
      .filter((row) => String(row.status || "").toLowerCase() === "sent")
      .map((row) => String(row.email || "").trim().toLowerCase())
      .filter(Boolean)
  );
  const toSend = recipients.filter((r) => !alreadySent.has(r.email));

  let sent = 0;
  let failed = 0;
  const now = new Date().toISOString();
  const errors = [];

  for (const r of toSend) {
    const contact = {
      first_name: r.first_name || "",
      email: r.email,
      language: r.language || "English",
      idioma: r.idioma,
    };
    const subject = issue.subject || "Mejor Vida Insurance — Actualización semanal";
    const name = contactName(contact, "spanish");
    const greeting = `<p>Hola ${escapeHtml(name)},</p>`;
    const bodyWithCta = greeting + (issue.body_html || "") + leadEmailCtaRow(false);
    const html = wrapNewsletterHtml(issue.hero_html || "", bodyWithCta, contact, settings);

    try {
      const result = await sendResendEmail({ to: r.email, subject, html });
      await sbFetch(supabaseUrl, serviceKey, "/crm_newsletter_sends", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify({
          issue_id: issue.id,
          lead_id: r.lead_id,
          lead_source_table: r.lead_source_table,
          contact_id: r.contacts_contact_id || null,
          email: r.email,
          status: "sent",
          provider_id: result && result.id,
          sent_at: now,
        }),
      });
      sent++;
    } catch (e) {
      failed++;
      const errMsg = String((e && e.message) || e).slice(0, 500);
      if (errors.length < 10) errors.push({ email: r.email, error: errMsg });
      try {
        await sbFetch(supabaseUrl, serviceKey, "/crm_newsletter_sends", {
          method: "POST",
          prefer: "return=minimal",
          body: JSON.stringify({
            issue_id: issue.id,
            lead_id: r.lead_id,
            lead_source_table: r.lead_source_table,
            email: r.email,
            status: "failed",
            error: errMsg,
          }),
        });
      } catch (_) {
        /* ignore logging failure */
      }
    }
  }

  const issueStatus =
    sent > 0 ? "sent" : failed > 0 ? "scheduled" : "scheduled";

  await sbFetch(supabaseUrl, serviceKey, `/crm_newsletter_issues?id=eq.${issue.id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({
      status: issueStatus,
      sent_at: sent > 0 ? now : null,
      updated_at: now,
    }),
  });

  return {
    dry_run: false,
    issue_id: issue.id,
    subject: issue.subject,
    issue_status: issueStatus,
    sent,
    failed,
    skipped_already_sent: recipients.length - toSend.length,
    skipped: counts.skipped_no_email + counts.skipped_stage + counts.skipped_rollout + counts.skipped_archived + counts.skipped_duplicate,
    ...counts,
    errors,
    sent_at: now,
  };
}

async function listNewsletterIssues(supabaseUrl, serviceKey, limit) {
  const lim = Math.min(50, Math.max(1, Number(limit) || 20));
  return sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_newsletter_issues?order=created_at.desc&limit=${lim}&select=*`
  );
}

async function getIssueSendStats(supabaseUrl, serviceKey, issueId) {
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_newsletter_sends?issue_id=eq.${encodeURIComponent(issueId)}&select=status`
  );
  const stats = { sent: 0, failed: 0, skipped: 0, pending: 0, total: 0 };
  for (const r of rows || []) {
    stats.total++;
    const st = String(r.status || "").toLowerCase();
    if (st === "sent") stats.sent++;
    else if (st === "failed") stats.failed++;
    else if (st === "skipped") stats.skipped++;
    else stats.pending++;
  }
  return stats;
}

module.exports = {
  escapeHtml,
  sbFetch,
  emailProviderReady,
  listWeeklyEmailRecipients,
  ensureBlogDigestIssue,
  sendWeeklyNewsletterIssue,
  listNewsletterIssues,
  getIssueSendStats,
  getCurrentWeeklyBlogDigest,
  buildWeeklyBlogDigestEmailParts,
};
