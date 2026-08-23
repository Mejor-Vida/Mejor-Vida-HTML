/**
 * Detect live weekly digest → queue / publish Facebook posts.
 * Usage: node scripts/run-weekly-facebook.js [--dry-run]
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
loadEnvFile(path.join(__dirname, "..", "facebook-posting", ".env"));

const { runWeeklyFacebook } = require("../lib/weekly-facebook-run");

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const result = await runWeeklyFacebook({ dryRun });
  const safe = JSON.parse(JSON.stringify(result));
  console.log(JSON.stringify(safe, null, 2));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
