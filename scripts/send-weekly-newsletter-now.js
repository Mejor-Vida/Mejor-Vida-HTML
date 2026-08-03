/**
 * One-off: import current FB weekly package into crm_newsletter_issues and send now.
 * Usage: node scripts/send-weekly-newsletter-now.js [--dry-run]
 * Loads .env.local; never prints secrets.
 */
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const p = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvLocal();

const {
  buildWeeklyFbPostEmailParts,
  loadExampleWeeklyFbPost,
} = require("../lib/crm-weekly-fb-email");
const { assertNewsletterPartsOk } = require("../lib/crm-weekly-topic-guard");
const {
  sendWeeklyNewsletterIssue,
  sbFetch,
} = require("../lib/crm-newsletter-send");

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const post = loadExampleWeeklyFbPost();
  const parts = buildWeeklyFbPostEmailParts(post);
  const topicCheck = assertNewsletterPartsOk({
    ...parts,
    email_caption: post.email_caption,
    main_caption: post.main_caption,
  });
  if (!topicCheck.ok) throw new Error(topicCheck.error);

  console.log("Subject:", parts.subject);
  console.log("Blog URL:", parts.blogUrl);
  console.log("Hero source: facebook");

  const inserted = await sbFetch(supabaseUrl, serviceKey, "/crm_newsletter_issues", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([
      {
        hero_html: parts.heroHtml || null,
        hero_source: "facebook",
        blog_url: parts.blogUrl,
        subject: parts.subject,
        body_html: parts.bodyHtml || null,
        status: dryRun ? "draft" : "scheduled",
        imported_by: "scripts/send-weekly-newsletter-now.js",
      },
    ]),
  });
  const issue = Array.isArray(inserted) ? inserted[0] : inserted;
  if (!issue || !issue.id) throw new Error("Insert failed: no issue id");
  console.log("Issue id:", issue.id, "status:", issue.status);

  const result = await sendWeeklyNewsletterIssue(supabaseUrl, serviceKey, issue, {
    dryRun,
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error("FAILED:", e.message || e);
  process.exit(1);
});
