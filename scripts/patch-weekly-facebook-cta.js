/**
 * Replace INFO/REVISAR CTA on queued weekly Facebook posts (Tue/Thu this week).
 * Usage: node scripts/patch-weekly-facebook-cta.js
 * Loads .env.local; never prints secrets.
 */
const fs = require("fs");
const path = require("path");

function loadEnvFile(p) {
  if (!p || !fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile(path.join(__dirname, "..", ".env.local"));

const { sbFetch } = require("../lib/crm-newsletter-send");
const { rewriteCaptionCta, defaultFirstComment } = require("../lib/weekly-facebook-compose");

async function main() {
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const rows =
    (await sbFetch(
      supabaseUrl,
      serviceKey,
      "/weekly_facebook_queue?status=eq.queued&order=slot.asc&select=id,week_key,slot,status,publish_at,title,story_url,main_caption,first_comment"
    )) || [];

  if (!rows.length) {
    console.log("No queued Facebook posts to patch.");
    return;
  }

  const patched = [];
  for (const row of rows) {
    const main_caption = rewriteCaptionCta(row.main_caption);
    const first_comment = defaultFirstComment(row.story_url);
    await sbFetch(supabaseUrl, serviceKey, `/weekly_facebook_queue?id=eq.${row.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        main_caption,
        first_comment,
        updated_at: new Date().toISOString(),
      }),
    });
    patched.push({
      week_key: row.week_key,
      slot: row.slot,
      title: row.title,
      publish_at: row.publish_at,
      had_keyword_cta: /Comenta\s+INFO|\bREVISAR\b/i.test(`${row.main_caption}\n${row.first_comment}`),
      leftover_keyword_cta: /Comenta\s+INFO|\bREVISAR\b/i.test(`${main_caption}\n${first_comment}`),
      comment_has_quote: /quote\.html/.test(first_comment),
    });
  }

  console.log(JSON.stringify({ patched_count: patched.length, patched }, null, 2));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
