#!/usr/bin/env node
/**
 * Point public HTML at U.S. Spanish / U.S. English (es-US, en-US).
 * Usage: node scripts/apply-us-spanish-targeting.js
 */
const fs = require("fs");
const path = require("path");
const { applyUsLocaleSignals } = require("../lib/us-locale-html");

const ROOT = path.join(__dirname, "..");
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "bootstrap",
  "integrations",
  "facebook-posting",
  "email-previews",
  "preview",
  "website-avatar",
  "mvi-ad-test-runner",
  "staff",
  "FB",
  "includes",
  "tools",
]);

function walkHtml(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(abs, acc);
    else if (ent.name.endsWith(".html")) acc.push(abs);
  }
  return acc;
}

const files = walkHtml(ROOT);
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = applyUsLocaleSignals(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log("Updated " + changed + " HTML files of " + files.length + " scanned.");
