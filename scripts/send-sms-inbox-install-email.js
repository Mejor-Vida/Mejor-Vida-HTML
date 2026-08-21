#!/usr/bin/env node
/**
 * Email julie@ and admin@ the SMS inbox Home Screen install link.
 * Usage (from repo root): node scripts/send-sms-inbox-install-email.js
 */
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m || process.env[m[1]]) return;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    });
}

loadEnvLocal();

const { sendInstallEmail } = require("../lib/staff-sms-inbox");

async function main() {
  const result = await sendInstallEmail();
  console.log("Install email sent to", result.to.join(", "));
  console.log("Inbox URL:", result.url);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
