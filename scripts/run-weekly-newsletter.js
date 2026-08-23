/**
 * Research last week's reputable news, write the Sunday letter, email julie@ and admin@.
 * Usage: node scripts/run-weekly-newsletter.js [--dry-run] [--research-only] [--force] [--resend] [--to-admin] [--send-clients]
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

function loadEnvLocal() {
  loadEnvFile(path.join(__dirname, "..", ".env.local"));
  loadEnvFile(process.env.WEEKLY_EXTRA_ENV);
}

loadEnvLocal();

const { runWeeklyNewsletter } = require("../lib/weekly-newsletter-run");

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const researchOnly = process.argv.includes("--research-only");
  const force = process.argv.includes("--force");
  const sendClients = process.argv.includes("--send-clients");
  const resendStaff = process.argv.includes("--resend");
  const toAdmin = process.argv.includes("--to-admin");
  const result = await runWeeklyNewsletter({
    dryRun,
    researchOnly,
    force: force || resendStaff || toAdmin,
    sendClients,
    resendStaff,
    toAdmin,
  });
  const safe = { ...result };
  if (safe.digest) delete safe.digest;
  console.log(JSON.stringify(safe, null, 2));
}

main().catch((e) => {
  console.error("FAILED:", e.message || e);
  process.exit(1);
});
