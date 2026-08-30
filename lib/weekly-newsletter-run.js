/**
 * Sunday weekly newsletter — two separate AI stages:
 *   Stage 1: research + story selection → validated research brief
 *   Stage 2: newsletter writing from that brief only
 * Then save issue → email julie@ and admin@.
 */

const fs = require("fs");
const path = require("path");
const { newsletterWindow, isSundayMorningSendWindow } = require("./weekly-newsletter-window");
const {
  loadSources,
  harvestWeeklyNews,
} = require("./weekly-newsletter-research");
const {
  buildAndValidateResearchBrief,
  selectedAsComposeCandidates,
} = require("./weekly-newsletter-research-brief");
const { composeWeeklyDigest, translateDigestToEnglish } = require("./weekly-newsletter-compose");
const { researchModel, writeModel } = require("./weekly-newsletter-models");
const { buildWeeklyResearchEmailParts } = require("./weekly-newsletter-email");
const {
  sbFetch,
  sendStaffWeeklyNewsletter,
  sendWeeklyNewsletterIssue,
  emailProviderReady,
} = require("./crm-newsletter-send");

const OUT_DIR = path.join(__dirname, "..", "tools", "weekly-newsletter", "out");

function importedByTag(weekKey) {
  return `weekly-research-${weekKey}`;
}

async function findThisWeekIssue(supabaseUrl, serviceKey, weekKey) {
  const tag = encodeURIComponent(importedByTag(weekKey));
  const rows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/crm_newsletter_issues?imported_by=eq.${tag}&order=created_at.desc&limit=1&select=*`
  );
  return rows && rows[0] ? rows[0] : null;
}

async function upsertResearchIssue(supabaseUrl, serviceKey, parts, weekKey, existing) {
  const payload = {
    hero_html: parts.heroHtml || null,
    hero_source: "weekly_research",
    blog_url: null,
    subject: parts.subject,
    body_html: parts.bodyHtml || null,
    status: "scheduled",
    imported_by: importedByTag(weekKey),
    updated_at: new Date().toISOString(),
  };
  if (existing && existing.id) {
    await sbFetch(supabaseUrl, serviceKey, `/crm_newsletter_issues?id=eq.${existing.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify(payload),
    });
    return { ...existing, ...payload, id: existing.id };
  }
  const inserted = await sbFetch(supabaseUrl, serviceKey, "/crm_newsletter_issues", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return Array.isArray(inserted) ? inserted[0] : inserted;
}

function writeLocalPreview(digest, parts, partsEn, researchBrief) {
  try {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const file = path.join(OUT_DIR, `issue-${digest.week_key || digest.post_date_iso}.json`);
    fs.writeFileSync(
      file,
      JSON.stringify(
        {
          digest,
          research_brief_path:
            (researchBrief && researchBrief.brief_path) ||
            (digest && digest.research_brief_path) ||
            null,
          subject: parts.subject,
          body_html: parts.bodyHtml,
          subject_en: partsEn && partsEn.subject,
          body_html_en: partsEn && partsEn.bodyHtml,
        },
        null,
        2
      )
    );
    fs.writeFileSync(path.join(OUT_DIR, "current-issue.json"), JSON.stringify(digest, null, 2));
    return file;
  } catch (_) {
    return null;
  }
}

function loadSavedDigest() {
  const weekKey = newsletterWindow().weekKey;
  const files = [
    path.join(OUT_DIR, "current-issue.json"),
    path.join(OUT_DIR, `issue-${weekKey}.json`),
  ];
  for (const p of files) {
    if (!fs.existsSync(p)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      if (data && data.digest && Array.isArray(data.digest.stories)) return data.digest;
      if (data && Array.isArray(data.stories)) return data;
    } catch (_) {
      /* try next */
    }
  }
  return null;
}

async function runWeeklyNewsletter(opts) {
  opts = opts || {};
  const now = opts.now || new Date();
  const window = newsletterWindow(now);
  const sources = loadSources();
  const sendClients = opts.sendClients === true || process.env.WEEKLY_NEWSLETTER_SEND_CLIENTS === "1";
  const dryRun = !!opts.dryRun;
  const researchOnly = !!opts.researchOnly;
  const force = !!opts.force;
  const resendStaff = !!opts.resendStaff;
  const toAdmin = !!opts.toAdmin;

  if (opts.fromCron && !force && !isSundayMorningSendWindow(now)) {
    return {
      skipped: true,
      reason: "outside_sunday_morning_window",
      chicago: window,
    };
  }

  const supabaseUrl = (opts.supabaseUrl || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = opts.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey && !force && !researchOnly && !resendStaff && !toAdmin) {
    const existing = await findThisWeekIssue(supabaseUrl, serviceKey, window.weekKey);
    if (existing && (existing.scheduled_send_at || (existing.status === "sent" && existing.sent_at))) {
      return {
        skipped: true,
        reason: "already_sent",
        issue_id: existing.id,
        week_key: window.weekKey,
      };
    }
  }

  let digest;
  let picked = [];
  let harvested = { errors: [] };
  let researchBrief = null;

  if (toAdmin) {
    digest = opts.digest || loadSavedDigest();
    if (!digest || !digest.stories) {
      throw new Error("No saved digest to send. Write tools/weekly-newsletter/out/current-issue.json first.");
    }
  } else if (resendStaff) {
    digest = opts.digest || loadSavedDigest();
    if (!digest || !digest.stories) {
      throw new Error("No saved digest to resend. Run without --resend first.");
    }
    digest = await translateDigestToEnglish(digest, {
      apiKey: opts.apiKey || process.env.OPENAI_API_KEY,
    });
  } else {
    // --- Stage 1: harvest + research brief (separate model call) ---
    harvested = await harvestWeeklyNews({ window, sources, now });
    researchBrief = await buildAndValidateResearchBrief({
      window,
      sources,
      candidates: harvested.candidates,
      apiKey: opts.apiKey || process.env.OPENAI_API_KEY,
      now,
    });
    picked = selectedAsComposeCandidates(researchBrief);

    if (researchOnly) {
      return {
        dry_run: true,
        research_only: true,
        stage: 1,
        research_model: researchBrief.model || researchModel(),
        window,
        candidates: harvested.candidates,
        picked: picked.map((c) => ({
          title: c.title,
          source: c.source_name,
          url: c.url,
          published: c.published,
        })),
        research_brief_path: researchBrief.brief_path,
        validation: researchBrief.validation,
        harvest_errors: harvested.errors,
      };
    }

    // --- Stage 2: write newsletter from validated brief only (separate model call) ---
    digest = await composeWeeklyDigest(picked, {
      window,
      apiKey: opts.apiKey || process.env.OPENAI_API_KEY,
      researchBrief,
    });
  }

  const parts = buildWeeklyResearchEmailParts(digest, "es");
  const partsEn = buildWeeklyResearchEmailParts(digest, "en");
  const previewFile = writeLocalPreview(digest, parts, partsEn, researchBrief);

  if (dryRun) {
    return {
      dry_run: true,
      window,
      subject: parts.subject,
      subject_en: partsEn.subject,
      research_model: (researchBrief && researchBrief.model) || null,
      write_model: (digest && digest.write_model) || writeModel(),
      research_brief_path: (researchBrief && researchBrief.brief_path) || (digest && digest.research_brief_path) || null,
      picked: (picked || []).map((c) => ({
        title: c.title,
        source: c.source_name,
        url: c.url || c.source_url,
      })),
      harvest_errors: harvested.errors,
      preview_file: previewFile,
      email_provider_ready: emailProviderReady(),
    };
  }

  if (toAdmin) {
    const staff = await sendStaffWeeklyNewsletter(
      { subject: partsEn.subject, body_html: partsEn.bodyHtml, hero_html: "" },
      {
        englishParts: partsEn,
        onlyEmails: ["admin@mejorvidainsurance.com"],
        skipNameGreeting: true,
        staffNoteHtml:
          `<p style="font-size:13px;color:#666;margin:0 0 12px;padding:10px 12px;background:#f5f5f5;border-radius:6px">` +
          `<strong>Review copy for admin@</strong> — this is the client letter. ` +
          `Clients would see “Hi [first name],” above this intro. Not sent to Julie or to the list.` +
          `</p>`,
      }
    );
    return {
      week_key: window.weekKey,
      window,
      subject_en: partsEn.subject,
      staff,
      preview_file: previewFile,
      admin_only: true,
    };
  }

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const existing = await findThisWeekIssue(supabaseUrl, serviceKey, window.weekKey);
  const issue = await upsertResearchIssue(supabaseUrl, serviceKey, parts, window.weekKey, existing);
  const staff = await sendStaffWeeklyNewsletter(issue, { englishParts: partsEn });
  const sentAt = new Date().toISOString();
  await sbFetch(supabaseUrl, serviceKey, `/crm_newsletter_issues?id=eq.${issue.id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ scheduled_send_at: sentAt, updated_at: sentAt }),
  });

  let clients = null;
  if (sendClients) {
    clients = await sendWeeklyNewsletterIssue(supabaseUrl, serviceKey, issue, {
      importedBy: importedByTag(window.weekKey),
    });
  }

  return {
    week_key: window.weekKey,
    window,
    issue_id: issue && issue.id,
    subject: parts.subject,
    subject_en: partsEn.subject,
    research_model: (researchBrief && researchBrief.model) || null,
    write_model: (digest && digest.write_model) || writeModel(),
    research_brief_path:
      (researchBrief && researchBrief.brief_path) || (digest && digest.research_brief_path) || null,
    picked: (picked || []).map((c) => ({ title: c.title, source: c.source_name, url: c.url || c.source_url })),
    harvest_errors: harvested.errors,
    staff,
    clients,
    preview_file: previewFile,
  };
}

module.exports = {
  importedByTag,
  findThisWeekIssue,
  runWeeklyNewsletter,
  loadSavedDigest,
  OUT_DIR,
};
