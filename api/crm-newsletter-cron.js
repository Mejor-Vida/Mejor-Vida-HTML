/**
 * /api/crm-newsletter-cron.js
 * Sends weekly Facebook post email to all leads with email (except unsubscribed).
 */
const { loadSettings } = require("../lib/crm-nurture-engine");
const { wrapNewsletterHtml, leadEmailCtaRow } = require("../lib/crm-nurture-templates");
const { canAutomateLead } = require("../lib/crm-nurture-rollout");

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

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Missing Supabase env" });
  }

  try {
    const settings = await loadSettings(supabaseUrl, serviceKey);
    const issues = await sbFetch(
      supabaseUrl,
      serviceKey,
      "/crm_newsletter_issues?status=in.(draft,scheduled)&order=created_at.desc&limit=1&select=*"
    );
    const issue = issues && issues[0];
    if (!issue) {
      return res.status(200).json({ ran_at: new Date().toISOString(), sent: 0, reason: "no_issue" });
    }

    const profiles = await sbFetch(
      supabaseUrl,
      serviceKey,
      "/staff_lead_profiles?select=lead_id,lead_source_table,profile_data&limit=5000"
    );

    let sent = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    for (const row of profiles || []) {
      const pd = row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
      const stage = String(pd.pipeline_stage || "").trim().toLowerCase();
      if (stage === "unsubscribed" || stage === "do_not_contact") {
        skipped++;
        continue;
      }
      const email = String(pd.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        skipped++;
        continue;
      }

      const hints = {
        email,
        first_name: pd.first_name || "",
        last_name: pd.last_name || "",
        display_name: pd.display_name || "",
      };
      if (!canAutomateLead(hints, settings, process.env)) {
        skipped++;
        continue;
      }

      const contact = {
        first_name: pd.first_name || "",
        email,
        language: pd.language || "English",
        idioma: pd.idioma,
      };
      const subject = issue.subject || "Mejor Vida Insurance — Actualización semanal";
      const bodyWithCta = (issue.body_html || "") + leadEmailCtaRow(false);
      const html = wrapNewsletterHtml(issue.hero_html || "", bodyWithCta, contact, settings);

      try {
        const result = await sendResendEmail({ to: email, subject, html });
        await sbFetch(supabaseUrl, serviceKey, "/crm_newsletter_sends", {
          method: "POST",
          prefer: "return=minimal",
          body: JSON.stringify({
            issue_id: issue.id,
            lead_id: row.lead_id,
            lead_source_table: row.lead_source_table,
            contact_id: pd.contacts_contact_id || pd.contact_id || null,
            email,
            status: "sent",
            provider_id: result && result.id,
            sent_at: now,
          }),
        });
        sent++;
      } catch (e) {
        await sbFetch(supabaseUrl, serviceKey, "/crm_newsletter_sends", {
          method: "POST",
          prefer: "return=minimal",
          body: JSON.stringify({
            issue_id: issue.id,
            lead_id: row.lead_id,
            lead_source_table: row.lead_source_table,
            email,
            status: "failed",
            error: String((e && e.message) || e).slice(0, 500),
          }),
        });
      }
    }

    await sbFetch(supabaseUrl, serviceKey, `/crm_newsletter_issues?id=eq.${issue.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ status: "sent", sent_at: now, updated_at: now }),
    });

    return res.status(200).json({
      ran_at: now,
      issue_id: issue.id,
      sent,
      skipped,
    });
  } catch (e) {
    console.error("[crm-newsletter-cron]", e.message);
    return res.status(500).json({ error: e.message });
  }
};
